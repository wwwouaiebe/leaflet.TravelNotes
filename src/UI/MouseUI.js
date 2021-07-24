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

const OUR_SAVE_TIME = 10000;

class MouseUIUpdater {

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
	#onTimer ( mouseUIUpdater ) {
		console.log ( 'onTimer' );
		mouseUIUpdater.#saveStatus = SAVE_STATUS.notSaved;
		mouseUIUpdater.#updateUI ( );
	}

	constructor ( ) {
	}

	set mouseUISpan ( MouseUISpan ) { this.#mouseUISpan = MouseUISpan; }

	set mousePosition ( MousePosition ) {
		this.#mousePosition = MousePosition;
		this.#updateUI ( );
	}

	set zoom ( Zoom ) {
		this.#zoom = Zoom;
		this.#updateUI ( );
	}

	set saveStatus ( SaveStatus ) {
		if ( SAVE_STATUS.modified === SaveStatus && SAVE_STATUS.notSaved === this.#saveStatus ) {
			return;
		}
		this.#saveStatus = SaveStatus;
		if ( SAVE_STATUS.modified === SaveStatus && ! this.#saveTimer ) {
			console.log ( 'setTimer' );
			this.#saveTimer = setTimeout ( this.#onTimer, OUR_SAVE_TIME, this );
		}
		if ( SAVE_STATUS.saved === SaveStatus && this.#saveTimer ) {
			clearTimeout ( this.#saveTimer );
			this.#saveTimer = null;
		}
		this.#updateUI ( );
	}

}

const theMouseUIUpdater = new MouseUIUpdater ( );

class MapEventListeners {

	static onMouseMove ( mouseMoveEvent ) {
		theMouseUIUpdater.mousePosition =
			theUtilities.formatLatLng ( [ mouseMoveEvent.latlng.lat, mouseMoveEvent.latlng.lng ] );
	}

	static onZoomEnd ( ) {
		theMouseUIUpdater.zoom = String ( theTravelNotesData.map.getZoom ( ) );
	}

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

	set saveStatus ( SaveStatus ) { theMouseUIUpdater.saveStatus = SaveStatus; }

	/**
	creates the user interface
	*/

	createUI ( ) {
		theMouseUIUpdater.mouseUISpan =
			theHTMLElementsFactory.create (
				'span',
				null,
				theHTMLElementsFactory.create ( 'div', { id : 'TravelNotes-MouseUI' }, document.body )
			);
		theMouseUIUpdater.zoom = theTravelNotesData.map.getZoom ( );
		theMouseUIUpdater.position =
			theUtilities.formatLat ( theConfig.map.center.lat ) +
			'\u00a0-\u00a0' +
			theUtilities.formatLng ( theConfig.map.center.lng );
		theTravelNotesData.map.on ( 'mousemove', MapEventListeners.onMouseMove );
		theTravelNotesData.map.on ( 'zoomend', MapEventListeners.onZoomEnd );
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