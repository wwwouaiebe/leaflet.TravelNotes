/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
	- v1.6.0:
		- created
	- v1.12.0:
		- Issue #120 : Review the UserInterface
	- v1.14.0:
		- Issue #135 : Remove innerHTML from code
Doc reviewed 20200822
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file MouseUI.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module MouseUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theUtilities } from '../util/Utilities.js';

let ourMouseDiv = null;
let ourMousePos = null;
let ourZoom = null;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourUpdate
@desc This method update the UI after an event
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourUpdate ( ) {
	ourMouseDiv.textContent = ourMousePos + '\u00a0-\u00a0Zoom\u00a0:\u00a0' + ourZoom;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnMapMouseMove
@desc Event listener for the mouse move on the map
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnMapMouseMove ( mouseMoveEvent ) {
	ourMousePos =
		theUtilities.formatLat ( mouseMoveEvent.latlng.lat ) +
			'\u00a0-\u00a0' +
			theUtilities.formatLng ( mouseMoveEvent.latlng.lng );
	ourUpdate ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnMapZoomEnd
@desc Event listener for zoom end on the map
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnMapZoomEnd ( ) {
	ourZoom = theTravelNotesData.map.getZoom ( );
	ourUpdate ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class show the mouse position and the zoom on the screen
@see {@link theMouseUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class MouseUI {

	/**
	creates the user interface
	*/

	createUI ( ) {
		ourZoom = theTravelNotesData.map.getZoom ( );
		let mousePos = theTravelNotesData.map.getCenter ( );
		ourMousePos = theUtilities.formatLat ( mousePos.lat ) + '\u00a0-\u00a0' + theUtilities.formatLng ( mousePos.lng );
		ourMouseDiv =
			theHTMLElementsFactory.create (
				'span',
				null,
				theHTMLElementsFactory.create (
					'div',
					{
						id : 'TravelNotes-MouseUI'
					},
					document.querySelector ( 'body' )
				)
			);
		theTravelNotesData.map.on ( 'mousemove', ourOnMapMouseMove );
		theTravelNotesData.map.on ( 'zoomend', ourOnMapZoomEnd );
	}
}

const ourMouseUI = Object.freeze ( new MouseUI );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of MouseUI class
	@type {MouseUI}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourMouseUI as theMouseUI
};

/*
--- End of MouseUI.js file ----------------------------------------------------------------------------------------------------
*/