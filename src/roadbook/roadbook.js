/*
Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/

This  program is free software;
you can redistribute it and/or modify it under the terms of the
GNU General Public License as published by the Free Software Foundation;
either version 3 of the License, or any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

/*
Changes:
	- v1.5.0:
		- created
	- v2.0.0:
		- Issue #135 : Remove innerHTML from code
		- Issue #138 : Protect the app - control html entries done by user.
		- Issue #146 : Add the travel name in the document title...
Doc reviewed 20200825
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Roadbook.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@desc This file contains the JS code that will be inserted in the TravelNotesRoadbook.html. It's needed to put this JS code
directly in the TravelNotesRoadbook.html to avoid path problems when saving this TravelNotesRoadbook.html page with the
save button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theHTMLSanitizer } from '../util/HTMLSanitizer.js';
import { theIndexedDb } from '../roadbook/IndexedDb.js';
import { ZERO, ONE, HTTP_STATUS_OK } from '../util/Constants.js';

let params = new URLSearchParams ( document.location.search.substring ( ONE ) );
let language = params.get ( 'lng' );
let pageId = params.get ( 'page' );

function showTravelNotes ( ) {
	let show = document.getElementById ( 'TravelNotes-Travel-ShowNotes' ).checked;
	let notes = document.getElementsByClassName ( 'TravelNotes-Roadbook-Travel-Notes-Row' );
	for ( let notesCounter = ZERO; notesCounter < notes.length; notesCounter ++ ) {
		if ( show ) {
			notes [ notesCounter ].classList.remove ( 'TravelNotes-Hidden' );
		}
		else {
			notes [ notesCounter ].classList.add ( 'TravelNotes-Hidden' );
		}
	}
}

document.getElementById ( 'TravelNotes-Travel-ShowNotes' ).addEventListener ( 'change', showTravelNotes );

function showRouteNotes ( ) {
	let show = document.getElementById ( 'TravelNotes-Routes-ShowNotes' ).checked;
	let notes = document.getElementsByClassName ( 'TravelNotes-Roadbook-Route-Notes-Row' );
	for ( let notesCounter = ZERO; notesCounter < notes.length; notesCounter ++ ) {
		if ( show ) {
			notes [ notesCounter ].classList.remove ( 'TravelNotes-Hidden' );
		}
		else {
			notes [ notesCounter ].classList.add ( 'TravelNotes-Hidden' );
		}
	}
}

document.getElementById ( 'TravelNotes-Routes-ShowNotes' ).addEventListener ( 'change', showRouteNotes );

function showRouteManeuvers ( ) {
	let show = document.getElementById ( 'TravelNotes-Routes-ShowManeuvers' ).checked;
	let maneuvers = document.getElementsByClassName ( 'TravelNotes-Roadbook-Route-Maneuvers-Row' );
	for ( let maneuversCounter = ZERO; maneuversCounter < maneuvers.length; maneuversCounter ++ ) {
		if ( show ) {
			maneuvers [ maneuversCounter ].classList.remove ( 'TravelNotes-Hidden' );
		}
		else {
			maneuvers [ maneuversCounter ].classList.add ( 'TravelNotes-Hidden' );
		}
	}
}

document.getElementById ( 'TravelNotes-Routes-ShowManeuvers' ).addEventListener ( 'change', showRouteManeuvers );

function updateIcons ( ) {
	document.querySelectorAll (
		'.TravelNotes-Roadbook-Route-ManeuversAndNotes-IconCell, .TravelNotes-Roadbook-Travel-Notes-IconCell'
	).forEach (
		icon => {
			let width = icon.getAttribute ( 'tanwidth' );
			if ( width ) {
				icon.style.width = width;
			}
			let height = icon.getAttribute ( 'tanheight' );
			if ( height ) {
				icon.style.height = height;
			}
		}
	);
}

function updateRoadbook ( pageContent ) {
	document.getElementById ( 'TravelNotes' ).textContent = '';
	theHTMLSanitizer.sanitizeToHtmlElement ( pageContent, document.getElementById ( 'TravelNotes' ) );
	let headerName = document.querySelector ( '.TravelNotes-Roadbook-Travel-Header-Name' );
	if ( headerName ) {
		document.title =
			'' === headerName.textContent ? 'roadbook' : headerName.textContent + ' - roadbook';
	}
	updateIcons ( );
	showTravelNotes ( );
	showRouteNotes ( );
	showRouteManeuvers ( );
}

function setContentFromIndexedDb ( ) {
	if ( pageId ) {
		theIndexedDb.getOpenPromise ( )
			.then ( ( ) => theIndexedDb.getReadPromise ( pageId ) )
			.then ( updateRoadbook )
			.catch ( err => {
				if ( err instanceof Error ) {
					console.error ( err );
				}
			}
			);

		window.addEventListener (
			'storage',
			( ) => {
				theIndexedDb.getReadPromise ( pageId )
					.then ( pageContent => {
						if ( pageContent ) {
							updateRoadbook ( pageContent );
						}
						else {
							document.getElementById ( 'TravelNotes' ).textContent = '';
						}
					} )
					.catch ( err => {
						if ( err instanceof Error ) {
							console.error ( err );
						}
					}
					);
			}
		);
		window.addEventListener (
			'unload',
			( ) => {
				theIndexedDb.closeDb ( );
			}
		);

	}
	else {
		document.getElementById ( 'TravelNotes-Roadbook-Menu' )
			.removeChild ( document.getElementById ( 'TravelNotes-ButtonContainer' ) );
	}
}

function translatePage ( ) {
	if ( language ) {
		fetch (
			window.location.href.substr ( ZERO, window.location.href.lastIndexOf ( '/' ) + ONE ) +
			'TravelNotes' +
			language.toUpperCase ( ) +
			'.json'
		)
			.then (
				response => {
					if ( HTTP_STATUS_OK === response.status && response.ok ) {
						response.json ( )
							.then (
								translations => {
									theTranslator.setTranslations ( translations );
									document.getElementById ( 'TravelNotes-Travel-ShowNotesLabel' ).textContent =
									theTranslator.getText ( 'Roadbook - show travel notes' );
									document.getElementById ( 'TravelNotes-Routes-ShowManeuversLabel' ).textContent =
									theTranslator.getText ( 'Roadbook - show maneuver' );
									document.getElementById ( 'TravelNotes-Routes-ShowNotesLabel' ).textContent =
									theTranslator.getText ( 'Roadbook - show routes notes' );
									document.getElementById ( 'TravelNotes-SaveButton' ).textContent =
									theTranslator.getText ( 'Roadbook - Save' );
								}
							)
							.catch (
								err => {
									if ( err instanceof Error ) {
										console.error ( err );
									}
								}
							);
					}
				}
			);
	}
}

function addSaveButton ( ) {
	function saveFile ( ) {
		try {
			let fileName = document.querySelector ( '.TravelNotes-Roadbook-Travel-Header-Name' )
				.textContent + '-Roadbook.html';
			let tmpSaveButton = document.getElementById ( 'TravelNotes-Roadbook-Menu' ).removeChild (
				document.getElementById ( 'TravelNotes-SaveButton' )
			);

			let mapFile = window.URL.createObjectURL (
				new File (
					[ '<!DOCTYPE html>', document.documentElement.outerHTML ],
					fileName,
					{ type : 'text/plain' }
				)
			);
			let element = document.createElement ( 'a' );
			element.setAttribute ( 'href', mapFile );
			element.setAttribute ( 'download', fileName );
			element.style.display = 'none';
			document.body.appendChild ( element );
			element.click ( );
			document.body.removeChild ( element );
			window.URL.revokeObjectURL ( mapFile );
			document.getElementById ( 'TravelNotes-Roadbook-Menu' ).appendChild ( tmpSaveButton );
		}
		catch ( err ) {
			if ( err instanceof Error ) {
				console.error ( err );
			}
		}
	}
	let saveButton = document.createElement ( 'button' );
	saveButton.id = 'TravelNotes-SaveButton';
	saveButton.addEventListener ( 'click', saveFile );
	let saveDiv = document.createElement ( 'div' );
	saveDiv.appendChild ( saveButton );
	document.getElementById ( 'TravelNotes-Roadbook-Menu' ).appendChild ( saveDiv );
}

if ( pageId ) {
	translatePage ( );
	addSaveButton ( );
	setContentFromIndexedDb ( );
}
else {
	updateIcons ( );
}

showTravelNotes ( );
showRouteNotes ( );
showRouteManeuvers ( );

/*
--- End of roadbook.js file ---------------------------------------------------------------------------------------------------

*/