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
	- v1.6.0:
		- created
	- v1.12.0:
		- Issue #120 : Review the UserInterface
	- v2.0.0:
		- Issue #135 : Remove innerHTML from code
	-v2.2.0:
		- Issue #129 : Add an indicator when the travel is modified and not saved
Doc reviewed 20200822
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file MouseUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
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
import { theConfig } from '../data/Config.js';
import { theUtilities } from '../util/Utilities.js';
import { SAVE_STATUS } from '../util/Constants.js';

const OUR_SAVE_TIME = 300000;

let ourMouseDiv = null;
let ourMousePos = null;
let ourZoom = null;
let ourSaveStatus = SAVE_STATUS.saved;
let ourSaveTimer = null;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourUpdate
@desc This method update the UI after an event
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourUpdate ( ) {
	if ( ourMouseDiv ) {
		ourMouseDiv.textContent = ourSaveStatus + '\u00a0' + ourMousePos + '\u00a0-\u00a0Zoom\u00a0:\u00a0' + ourZoom;
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourSetSaveStatus
@desc This method change the saveStatus and update the UI with the saveStatus
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourSetSaveStatus ( saveStatus ) {
	if ( SAVE_STATUS.modified === saveStatus && SAVE_STATUS.notSaved === ourSaveStatus ) {
		return;
	}
	ourSaveStatus = saveStatus;
	if ( SAVE_STATUS.modified === saveStatus && ! ourSaveTimer ) {
		ourSaveTimer = setTimeout ( ourSetSaveStatus, OUR_SAVE_TIME, SAVE_STATUS.notSaved );
	}
	if ( SAVE_STATUS.saved === saveStatus && ourSaveTimer ) {
		clearTimeout ( ourSaveTimer );
		ourSaveTimer = null;
	}
	ourUpdate ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnMapMouseMove
@desc Event listener for the mouse move on the map
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnMapMouseMove ( mouseMoveEvent ) {
	ourMousePos = theUtilities.formatLatLng ( [ mouseMoveEvent.latlng.lat, mouseMoveEvent.latlng.lng ] );
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
	ourZoom = String ( theTravelNotesData.map.getZoom ( ) );
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

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	change the save status on the UI
	*/

	set saveStatus ( SaveStatus ) { ourSetSaveStatus ( SaveStatus ); }

	/**
	creates the user interface
	*/

	createUI ( ) {
		ourZoom = theTravelNotesData.map.getZoom ( );
		ourMousePos =
			theUtilities.formatLat ( theConfig.map.center.lat ) +
			'\u00a0-\u00a0' +
			theUtilities.formatLng ( theConfig.map.center.lng );
		ourMouseDiv =
			theHTMLElementsFactory.create (
				'span',
				null,
				theHTMLElementsFactory.create ( 'div', { id : 'TravelNotes-MouseUI' }, document.body )
			);
		theTravelNotesData.map.on ( 'mousemove', ourOnMapMouseMove );
		theTravelNotesData.map.on ( 'zoomend', ourOnMapZoomEnd );
	}
}

const OUR_MOUSE_UI = new MouseUI ( );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of MouseUI class
	@type {MouseUI}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	OUR_MOUSE_UI as theMouseUI
};

/*
--- End of MouseUI.js file ----------------------------------------------------------------------------------------------------
*/