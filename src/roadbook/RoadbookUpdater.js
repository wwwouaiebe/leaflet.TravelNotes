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
Doc reviewed ...
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file RoadbookUpdater.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module RoadbookUpdater
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLSanitizer from '../util/HTMLSanitizer.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class RoadbookUpdater
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class RoadbookUpdater {

	showTravelNotes = true;
	showRouteNotes = true;
	showManeuversNotes = false;

	#travelNotesHtmlElement = document.getElementById ( 'TravelNotes' );

	constructor ( ) {
	}

	toggleTravelNotes ( ) {
		document.querySelectorAll ( '.TravelNotes-Roadbook-Travel-Notes-Row' ).forEach (
			note => {
				if ( this.showTravelNotes ) {
					note.classList.remove ( 'TravelNotes-Hidden' );
				}
				else {
					note.classList.add ( 'TravelNotes-Hidden' );
				}
			}
		);
	}

	toggleRouteNotes ( ) {
		document.querySelectorAll ( '.TravelNotes-Roadbook-Route-Notes-Row' ).forEach (
			note => {
				if ( this.showRouteNotes ) {
					note.classList.remove ( 'TravelNotes-Hidden' );
				}
				else {
					note.classList.add ( 'TravelNotes-Hidden' );
				}
			}
		);
	}

	toggleManeuversNotes ( ) {
		document.querySelectorAll ( '.TravelNotes-Roadbook-Route-Maneuvers-Row' ).forEach (
			note => {
				if ( this.showManeuversNotes ) {
					note.classList.remove ( 'TravelNotes-Hidden' );
				}
				else {
					note.classList.add ( 'TravelNotes-Hidden' );
				}
			}
		);
	}

	toggleNotes ( ) {
		this.toggleTravelNotes ( );
		this.toggleRouteNotes ( );
		this.toggleManeuversNotes ( );
	}

	updateIcons ( ) {
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

	updateRoadbook ( pageContent ) {
		this.#travelNotesHtmlElement.textContent = '';
		theHTMLSanitizer.sanitizeToHtmlElement ( pageContent, this.#travelNotesHtmlElement );
		let headerName = document.querySelector ( '.TravelNotes-Roadbook-Travel-Header-Name' );
		if ( headerName ) {
			document.title =
				'' === headerName.textContent ? 'roadbook' : headerName.textContent + ' - roadbook';
		}
		this.updateIcons ( );
		this.toggleNotes ( );
	}

}

const theRoadbookUpdater = new RoadbookUpdater ( );

export default theRoadbookUpdater;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of RoadbookUpdater.js file

@------------------------------------------------------------------------------------------------------------------------------
*/