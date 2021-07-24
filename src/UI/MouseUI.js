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
		- Issue ♯120 : Review the UserInterface
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
	-v2.2.0:
		- Issue ♯129 : Add an indicator when the travel is modified and not saved
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

import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theConfig from '../data/Config.js';
import theUtilities from '../util/Utilities.js';
import { SAVE_STATUS } from '../util/Constants.js';

const OUR_SAVE_TIME = 300000;

/* eslint-disable no-use-before-define */

/**
@------------------------------------------------------------------------------------------------------------------------------

@class MapEventListeners
@classdesc Map event listeners
@hideconstructor
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class MapEventListeners {

	static onMouseMove ( mouseMoveEvent ) {
		theMouseUI.mousePosition =
			theUtilities.formatLatLng ( [ mouseMoveEvent.latlng.lat, mouseMoveEvent.latlng.lng ] );
	}

	static onZoomEnd ( ) {
		theMouseUI.zoom = String ( theTravelNotesData.map.getZoom ( ) );
	}

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TimerEventListeners
@classdesc timer event listeners
@hideconstructor
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class TimerEventListeners {
	static onTimer ( ) {
		theMouseUI.saveStatus = SAVE_STATUS.notSaved;
	}
}

/* eslint-enable no-use-before-define */

/**
@------------------------------------------------------------------------------------------------------------------------------

@class MouseUI
@classdesc This class show the mouse position and the zoom on the screen
@see {@link theMouseUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class MouseUI {

	#mouseUISpan = null;
	#saveStatus = SAVE_STATUS.saved;
	#mousePosition = '';
	#zoom = ''

	#saveTimer = null;

	#updateUI ( ) {
		if ( this.#mouseUISpan ) {
			this.#mouseUISpan.textContent =
				this.#saveStatus + '\u00a0' + this.#mousePosition + '\u00a0-\u00a0Zoom\u00a0:\u00a0' + this.#zoom;
		}
	}

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	set the mouse position on the UI
	*/

	set mousePosition ( MousePosition ) {
		this.#mousePosition = MousePosition;
		this.#updateUI ( );
	}

	/**
	set the zoom on the UI
	*/

	set zoom ( Zoom ) {
		this.#zoom = Zoom;
		this.#updateUI ( );
	}

	/**
	change the save status on the UI
	*/

	set saveStatus ( SaveStatus ) {
		if ( SAVE_STATUS.modified === SaveStatus && SAVE_STATUS.notSaved === this.#saveStatus ) {
			return;
		}
		this.#saveStatus = SaveStatus;
		if ( SAVE_STATUS.modified === SaveStatus && ! this.#saveTimer ) {
			this.#saveTimer = setTimeout ( TimerEventListeners.onTimer, OUR_SAVE_TIME );
		}
		if ( SAVE_STATUS.saved === SaveStatus && this.#saveTimer ) {
			clearTimeout ( this.#saveTimer );
			this.#saveTimer = null;
		}
		this.#updateUI ( );
	}

	/**
	creates the user interface
	*/

	createUI ( ) {
		this.#mouseUISpan =
			theHTMLElementsFactory.create (
				'span',
				null,
				theHTMLElementsFactory.create ( 'div', { id : 'TravelNotes-MouseUI' }, document.body )
			);
		this.zoom = theTravelNotesData.map.getZoom ( );
		this.mousePosition =
			theUtilities.formatLat ( theConfig.map.center.lat ) +
			'\u00a0-\u00a0' +
			theUtilities.formatLng ( theConfig.map.center.lng );
		theTravelNotesData.map.on ( 'mousemove', MapEventListeners.onMouseMove );
		theTravelNotesData.map.on ( 'zoomend', MapEventListeners.onZoomEnd );
	}

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of MouseUI class
@type {MouseUI}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theMouseUI = new MouseUI ( );

export default theMouseUI;

/*
--- End of MouseUI.js file ----------------------------------------------------------------------------------------------------
*/