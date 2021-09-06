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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
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

@module roadbook
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class RoadbookUpdater
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class RoadbookUpdater {

	#travelNotesHtmlElement = document.getElementById ( 'TravelNotes' );

	/*
	constructor
	*/

	constructor ( ) {
		this.showTravelNotes = true;
		this.showRouteNotes = true;
		this.showManeuversNotes = false;

		Object.seal ( this );
	}

	/**
	Toogle the visibility of the travel notes
	*/

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

	/**
	Toogle the visibility of the route notes
	*/

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

	/**
	Toogle the visibility of the maneuver notes
	*/

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

	/**
	Toogle the visibility of the all notes
	*/

	toggleNotes ( ) {
		this.toggleTravelNotes ( );
		this.toggleRouteNotes ( );
		this.toggleManeuversNotes ( );
	}

	/**
	Updating icons width and height
	*/

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

	/**
	Updating roadbook
	*/

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

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of RoadbookUpdater class
@type {RoadbookUpdater}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theRoadbookUpdater = new RoadbookUpdater ( );

export default theRoadbookUpdater;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of RoadbookUpdater.js file

@------------------------------------------------------------------------------------------------------------------------------
*/