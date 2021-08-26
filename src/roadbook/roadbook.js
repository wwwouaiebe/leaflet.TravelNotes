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
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯138 : Protect the app - control html entries done by user.
		- Issue ♯146 : Add the travel name in the document title...
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

import theTranslator from '../UI/Translator.js';
import theHTMLSanitizer from '../util/HTMLSanitizer.js';
import theIndexedDb from '../roadbook/IndexedDb.js';
import { ZERO, ONE, HTTP_STATUS_OK } from '../util/Constants.js';

let ourParams = new URLSearchParams ( document.location.search.substring ( ONE ) );
let ourPageId = ourParams.get ( 'page' );
let ourShowTravelNotes = true;
let ourShowRouteNotes = true;
let ourShowManeuversNotes = false;
let OurSaveButton = null;
let ourSaveDiv = null;
let ourMenu = document.getElementById ( 'TravelNotes-Roadbook-Menu' );
let ourTravelNotesDiv = document.getElementById ( 'TravelNotes' );

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourToggleTravelNotes
@desc Hide or show the travel notes
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourToggleTravelNotes ( ) {
	document.querySelectorAll ( '.TravelNotes-Roadbook-Travel-Notes-Row' ).forEach (
		note => {
			if ( ourShowTravelNotes ) {
				note.classList.remove ( 'TravelNotes-Hidden' );
			}
			else {
				note.classList.add ( 'TravelNotes-Hidden' );
			}
		}
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourToggleRouteNotes
@desc Hide or show the route notes
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourToggleRouteNotes ( ) {
	document.querySelectorAll ( '.TravelNotes-Roadbook-Route-Notes-Row' ).forEach (
		note => {
			if ( ourShowRouteNotes ) {
				note.classList.remove ( 'TravelNotes-Hidden' );
			}
			else {
				note.classList.add ( 'TravelNotes-Hidden' );
			}
		}
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourToggleManeuversNotes
@desc Hide or show the maneuver notes
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourToggleManeuversNotes ( ) {
	document.querySelectorAll ( '.TravelNotes-Roadbook-Route-Maneuvers-Row' ).forEach (
		note => {
			if ( ourShowManeuversNotes ) {
				note.classList.remove ( 'TravelNotes-Hidden' );
			}
			else {
				note.classList.add ( 'TravelNotes-Hidden' );
			}
		}
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourToggleNotes
@desc Hide or show the notes
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourToggleNotes ( ) {
	ourToggleTravelNotes ( );
	ourToggleRouteNotes ( );
	ourToggleManeuversNotes ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourUpdateIcons
@desc Update the icons width and height
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourUpdateIcons ( ) {
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

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourUpdateRoadbook
@desc update the roadbook content
@param {string} pageContent the content of the roadbook
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourUpdateRoadbook ( pageContent ) {
	ourTravelNotesDiv.textContent = '';
	theHTMLSanitizer.sanitizeToHtmlElement ( pageContent, ourTravelNotesDiv );
	let headerName = document.querySelector ( '.TravelNotes-Roadbook-Travel-Header-Name' );
	if ( headerName ) {
		document.title =
			'' === headerName.textContent ? 'roadbook' : headerName.textContent + ' - roadbook';
	}
	ourUpdateIcons ( );
	ourToggleNotes ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourUpdateRoadbook
@desc Storage event listener. Update the page
@param {string} pageContent the content of the roadbook
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnStorage ( ) {
	theIndexedDb.getReadPromise ( ourPageId )
		.then (
			pageContent => {
				if ( pageContent ) {
					ourUpdateRoadbook ( pageContent );
				}
				else {
					ourTravelNotesDiv.textContent = '';
				}
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

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOpenIndexedDb
@desc Open the indexed db and add event listeners
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOpenIndexedDb ( ) {
	if ( ourPageId ) {
		theIndexedDb.getOpenPromise ( )
			.then ( ( ) => theIndexedDb.getReadPromise ( ourPageId ) )
			.then ( ourUpdateRoadbook )
			.catch (
				err => {
					if ( err instanceof Error ) {
						console.error ( err );
					}
				}
			);
		window.addEventListener ( 'storage', ourOnStorage );
		window.addEventListener ( 'unload', ( ) => theIndexedDb.closeDb ( )	);
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourTranslatePage
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourTranslatePage ( ) {
	document.getElementById ( 'TravelNotes-Travel-ShowNotesLabel' ).textContent =
	theTranslator.getText ( 'Roadbook - show travel notes' );
	document.getElementById ( 'TravelNotes-Routes-ShowManeuversLabel' ).textContent =
	theTranslator.getText ( 'Roadbook - show maneuver' );
	document.getElementById ( 'TravelNotes-Routes-ShowNotesLabel' ).textContent =
	theTranslator.getText ( 'Roadbook - show routes notes' );
	if ( OurSaveButton ) {
		OurSaveButton.textContent = theTranslator.getText ( 'Roadbook - Save' );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourLoadTranslations
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourLoadTranslations ( ) {
	let language = ourParams.get ( 'lng' ) || 'fr';
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
						.then ( theTranslator.setTranslations )
						.then ( ourTranslatePage )
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

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnSaveButtonClick
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnSaveButtonClick ( ) {
	try {
		let fileName = document.querySelector ( '.TravelNotes-Roadbook-Travel-Header-Name' ).textContent + '-Roadbook.html';
		ourMenu.removeChild ( ourSaveDiv );

		let mapFile = window.URL.createObjectURL (
			new File (
				[ '<!DOCTYPE html>', document.documentElement.outerHTML ],
				fileName,
				{ type : 'text/plain' }
			)
		);
		let anchorElement = document.createElement ( 'a' );
		anchorElement.setAttribute ( 'href', mapFile );
		anchorElement.setAttribute ( 'download', fileName );
		anchorElement.style.display = 'none';
		document.body.appendChild ( anchorElement );
		anchorElement.click ( );
		document.body.removeChild ( anchorElement );
		window.URL.revokeObjectURL ( mapFile );
		ourMenu.appendChild ( ourSaveDiv );
	}
	catch ( err ) {
		if ( err instanceof Error ) {
			console.error ( err );
		}
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourAddSaveButton
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourAddSaveButton ( ) {
	OurSaveButton = document.createElement ( 'button' );
	OurSaveButton.id = 'TravelNotes-SaveButton';
	OurSaveButton.addEventListener ( 'click', ourOnSaveButtonClick );
	ourSaveDiv = document.createElement ( 'div' );
	ourSaveDiv.appendChild ( OurSaveButton );
	ourMenu.appendChild ( ourSaveDiv );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnShowTravelNotesChange
@desc event listener for the ShowTravelNotes checkbox
@param { event } changeEvent a reference to the event
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnShowTravelNotesChange ( changeEvent ) {
	ourShowTravelNotes = changeEvent.target.checked;
	ourToggleTravelNotes ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnShowTravelNotesChange
@desc event listener for the ShowRouteNotes checkbox
@param { event } changeEvent a reference to the event
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnShowRouteNotesChange ( changeEvent ) {
	ourShowRouteNotes = changeEvent.target.checked;
	ourToggleRouteNotes ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnShowTravelNotesChange
@desc event listener for the ShowManeuverNotes checkbox
@param { event } changeEvent a reference to the event
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnShowManeuverNotesChange ( changeEvent ) {
	ourShowManeuversNotes = changeEvent.target.checked;
	ourToggleManeuversNotes ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourMain
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourMain ( ) {
	document.getElementById ( 'TravelNotes-Travel-ShowNotes' ).checked = ourShowTravelNotes;
	document.getElementById ( 'TravelNotes-Travel-ShowNotes' ).addEventListener ( 'change', ourOnShowTravelNotesChange );
	document.getElementById ( 'TravelNotes-Routes-ShowNotes' ).checked = ourShowRouteNotes;
	document.getElementById ( 'TravelNotes-Routes-ShowNotes' ).addEventListener ( 'change', ourOnShowRouteNotesChange );
	document.getElementById ( 'TravelNotes-Routes-ShowManeuvers' ).checked = ourShowManeuversNotes;
	document.getElementById ( 'TravelNotes-Routes-ShowManeuvers' )
		.addEventListener ( 'change', ourOnShowManeuverNotesChange );

	if ( ourPageId ) {
		ourAddSaveButton ( );
		ourOpenIndexedDb ( );
		ourLoadTranslations ( );
	}
	else {
		ourUpdateIcons ( );
	}

	ourToggleNotes ( );
}

ourMain ( );

/*
--- End of roadbook.js file ---------------------------------------------------------------------------------------------------
*/