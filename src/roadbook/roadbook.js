/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- roadbook.js file --------------------------------------------------------------------------------------------------
This file contains:
	-
Changes:
	- v1.5.0:
		- created

Doc reviewed
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theHttpRequestBuilder } from '../util/HttpRequestBuilder.js';
import { theIndexedDb } from '../roadbook/IndexedDB.js';

import { ZERO, ONE } from '../util/Constants.js';

/*
--- showTravelNotes function --------------------------------------------------------------------------------------

Event listener for show/ hide travel notes checkbox

-------------------------------------------------------------------------------------------------------------------
*/

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

/*
--- showRouteNotes function ---------------------------------------------------------------------------------------

Event listener for show/ hide route notes checkbox

-------------------------------------------------------------------------------------------------------------------
*/

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

/*
--- showRouteManeuvers function -----------------------------------------------------------------------------------

Event listener for show/ hide route maneuvers checkbox

-------------------------------------------------------------------------------------------------------------------
*/

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

document.getElementById ( 'TravelNotes-Routes-ShowManeuvers' ).addEventListener ( 'change', showRouteManeuvers );

/*
--- main ----------------------------------------------------------------------------------------------------------

-------------------------------------------------------------------------------------------------------------------
*/

let params = new URLSearchParams ( document.location.search.substring ( ONE ) );
let language = params.get ( 'lng' );
let pageId = params.get ( 'page' );

function saveFile ( ) {
	try {
		let mapFile = window.URL.createObjectURL (
			new File (
				[ '<!DOCTYPE html>', document.documentElement.outerHTML ],
				{ type : 'text/plain' }
			)
		);
		let element = document.createElement ( 'a' );
		element.setAttribute ( 'href', mapFile );
		element.setAttribute (
			'download',
			document.querySelector ( '.TravelNotes-Roadbook-Travel-Header-Name' )
				.innerHTML + '-Roadbook.html'
		);
		element.style.display = 'none';
		document.body.appendChild ( element );
		element.click ( );
		document.body.removeChild ( element );
		window.URL.revokeObjectURL ( mapFile );
	}
	catch ( err ) {
		console.log ( err ? err : 'An error occurs when saving the file' );
	}
}

if ( pageId ) {

	document.getElementById ( 'TravelNotes-SaveFile' ).addEventListener ( 'click', saveFile );

	// document.getElementById ( 'TravelNotes' ).innerHTML = localStorage.getItem ( pageId + '-TravelNotesHTML' );

	theIndexedDb.getOpenPromise ( )
		.then ( ( ) => theIndexedDb.getReadPromise ( pageId ) )
		.then ( innerHTML => {
			document.getElementById ( 'TravelNotes' ).innerHTML = innerHTML;
			showTravelNotes ( );
			showRouteNotes ( );
			showRouteManeuvers ( );
		} )
		.catch ( err => console.log ( err ? err : 'An error occurs when loading the content' ) );

	window.addEventListener (
		'storage',
		( ) => {
			theIndexedDb.getReadPromise ( pageId )
				.then ( innerHTML => {
					if ( innerHTML ) {
						document.getElementById ( 'TravelNotes' ).innerHTML = innerHTML;
						showTravelNotes ( );
						showRouteNotes ( );
						showRouteManeuvers ( );
					}
					else {
						document.getElementById ( 'TravelNotes' ).innerHTML = '';
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
				document.getElementById ( 'TravelNotes-Travel-ShowNotesLabel' ).innerHTML =
					theTranslator.getText ( 'Roadbook - show travel notes' );
				document.getElementById ( 'TravelNotes-Routes-ShowManeuversLabel' ).innerHTML =
					theTranslator.getText ( 'Roadbook - show maneuver' );
				document.getElementById ( 'TravelNotes-Routes-ShowNotesLabel' ).innerHTML =
					theTranslator.getText ( 'Roadbook - show routes notes' );
				document.getElementById ( 'TravelNotes-SaveFile' ).value =
					theTranslator.getText ( 'Roadbook - Save' );
			}
		)
		.catch ( err => console.log ( err ? err : 'An error occurs when loading translation' ) );
}

showTravelNotes ( );
showRouteNotes ( );
showRouteManeuvers ( );

/*
--- End of roadbook.js file -------------------------------------------------------------------------------------------

*/