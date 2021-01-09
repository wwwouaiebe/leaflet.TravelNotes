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
import { theHttpRequestBuilder } from '../util/HttpRequestBuilder.js';

import { theHTMLSanitizer } from '../util/HTMLSanitizer.js';
import { theIndexedDb } from '../roadbook/IndexedDb.js';
import { ZERO, ONE } from '../util/Constants.js';

function showTravelNotes ( ) {
	let show = document.getElementById ( 'TravelNotes-Travel-ShowNotes' ).checked;
	let notes = document.getElementsByClassName ( 'TravelNotes-Roadbook-Travel-Notes-Row' );
	for ( let notesCounter = ZERO; notesCounter < notes.length; notesCounter ++ ) {
		if ( show ) {
			notes [ notesCounter ].classList.remove ( 'TravelNotes-Roadbook-Hidden-Row' );
		}
		else {
			notes [ notesCounter ].classList.add ( 'TravelNotes-Roadbook-Hidden-Row' );
		}
	}
}

document.getElementById ( 'TravelNotes-Travel-ShowNotes' ).addEventListener ( 'change', showTravelNotes );

function showRouteNotes ( ) {
	let show = document.getElementById ( 'TravelNotes-Routes-ShowNotes' ).checked;
	let notes = document.getElementsByClassName ( 'TravelNotes-Roadbook-Route-Notes-Row' );
	for ( let notesCounter = ZERO; notesCounter < notes.length; notesCounter ++ ) {
		if ( show ) {
			notes [ notesCounter ].classList.remove ( 'TravelNotes-Roadbook-Hidden-Row' );
		}
		else {
			notes [ notesCounter ].classList.add ( 'TravelNotes-Roadbook-Hidden-Row' );
		}
	}
}

document.getElementById ( 'TravelNotes-Routes-ShowNotes' ).addEventListener ( 'change', showRouteNotes );

function showRouteManeuvers ( ) {
	let show = document.getElementById ( 'TravelNotes-Routes-ShowManeuvers' ).checked;
	let maneuvers = document.getElementsByClassName ( 'TravelNotes-Roadbook-Route-Maneuvers-Row' );
	for ( let maneuversCounter = ZERO; maneuversCounter < maneuvers.length; maneuversCounter ++ ) {
		if ( show ) {
			maneuvers [ maneuversCounter ].classList.remove ( 'TravelNotes-Roadbook-Hidden-Row' );
		}
		else {
			maneuvers [ maneuversCounter ].classList.add ( 'TravelNotes-Roadbook-Hidden-Row' );
		}
	}
}

function updateRoadbook ( pageContent ) {
	document.getElementById ( 'TravelNotes' ).textContent = '';
	theHTMLSanitizer.sanitizeToHtmlElement ( pageContent, document.getElementById ( 'TravelNotes' ) );
	let headerName = document.querySelector ( '.TravelNotes-Roadbook-Travel-Header-Name' );
	if ( headerName ) {
		document.title = headerName.textContent + ' - roadbook';
	}
	showTravelNotes ( );
	showRouteNotes ( );
	showRouteManeuvers ( );
}

document.getElementById ( 'TravelNotes-Routes-ShowManeuvers' ).addEventListener ( 'change', showRouteManeuvers );

let params = new URLSearchParams ( document.location.search.substring ( ONE ) );
let language = params.get ( 'lng' );
let pageId = params.get ( 'page' );

if ( pageId ) {
	theIndexedDb.getOpenPromise ( )
		.then ( ( ) => theIndexedDb.getReadPromise ( pageId ) )
		.then ( pageContent => { updateRoadbook ( pageContent ); } )
		.catch ( err => console.log ( err ? err : 'An error occurs when loading the content' ) );

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
				.catch ( err => console.log ( err ? err : 'An error occurs when loading the content' ) );
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
	document.getElementById ( 'TravelNotes-Menu' )
		.removeChild ( document.getElementById ( 'TravelNotes-ButtonContainer' ) );
}

if ( language ) {
	theHttpRequestBuilder.getJsonPromise (
		window.location.href.substr ( ZERO, window.location.href.lastIndexOf ( '/' ) + ONE ) +
		'TravelNotes' +
		language.toUpperCase ( ) +
		'.json'
	)
		.then (
			response => {
				theTranslator.setTranslations ( response );
				document.getElementById ( 'TravelNotes-Travel-ShowNotesLabel' ).textContent =
					theTranslator.getText ( 'Roadbook - show travel notes' );
				document.getElementById ( 'TravelNotes-Routes-ShowManeuversLabel' ).textContent =
					theTranslator.getText ( 'Roadbook - show maneuver' );
				document.getElementById ( 'TravelNotes-Routes-ShowNotesLabel' ).textContent =
					theTranslator.getText ( 'Roadbook - show routes notes' );
			}
		)
		.catch ( err => console.log ( err ? err : 'An error occurs when loading translation' ) );
}

showTravelNotes ( );
showRouteNotes ( );
showRouteManeuvers ( );

/*
--- End of roadbook.js file ---------------------------------------------------------------------------------------------------

*/