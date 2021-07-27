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
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue ♯31 : Add a command to import from others maps
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
		- Issue ♯63 : Find a better solution for provider keys upload
		- Issue ♯75 : Merge Maps and TravelNotes
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v1.13.0:
		- Issue ♯125 : Outphase osmSearch and add it to TravelNotes
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210724
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file UI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module UI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theTravelUI from '../UI/TravelUI.js';
import thePanesManagerUI from '../UI/PanesManagerUI.js';
import theProvidersToolbarUI from '../UI/ProvidersToolbarUI.js';
import theTravelNotesToolbarUI from '../UI/TravelNotesToolbarUI.js';
import ItineraryPaneUI from '../UI/ItineraryPaneUI.js';
import TravelNotesPaneUI from '../UI/TravelNotesPaneUI.js';
import OsmSearchPaneUI from '../UI/OsmSearchPaneUI.js';
import theRoutesListUI from '../UI/RoutesListUI.js';
import { PANE_ID } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class is the User Interface ( UI )
@see {@link theUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class UI {

	static #mainDiv = null;
	static #timerId = null;
	static #titleDiv = null;

	#isPinned = false;

	/**
	Event listener for the mouse enter on the UI
	@private
	*/

	static #onMouseEnter ( ) {
		if ( UI.#timerId ) {
			clearTimeout ( UI.#timerId );
			UI.#timerId = null;
		}
		UI.#mainDiv.classList.remove ( 'TravelNotes-UI-Minimized' );

		UI.#titleDiv.classList.add ( 'TravelNotes-Hidden' );
		let children = UI.#mainDiv.childNodes;
		for ( let childrenCounter = 1; childrenCounter < children.length; childrenCounter ++ ) {
			children[ childrenCounter ].classList.remove ( 'TravelNotes-Hidden' );
		}
	}

	/**
	Event listener for the timer on mouse leave on the UI
	@private
	*/

	static #onTimeOut ( ) {
		UI.#mainDiv.classList.add ( 'TravelNotes-UI-Minimized' );

		UI.#titleDiv.classList.remove ( 'TravelNotes-Hidden' );
		let children = UI.#mainDiv.childNodes;
		for ( let childrenCounter = 1; childrenCounter < children.length; childrenCounter ++ ) {
			children[ childrenCounter ].classList.add ( 'TravelNotes-Hidden' );
		}
	}

	/**
	Event listener for the mouse leave on the UI
	@private
	*/

	static #onMouseLeave ( ) {
		UI.#timerId = setTimeout ( UI.#onTimeOut, theConfig.travelEditor.timeout );
	}

	/**
	This method add the TravelNotes events listeners
	@private
	*/

	#addTravelNotesEventListeners ( ) {
		UI.#mainDiv.addEventListener ( 'travelnameupdated', ( ) => theTravelUI.setTravelName ( ), false );
		UI.#mainDiv.addEventListener ( 'setrouteslist', ( ) => theRoutesListUI.setRoutesList ( ), false );
		UI.#mainDiv.addEventListener ( 'showitinerary', ( ) => thePanesManagerUI.showPane ( PANE_ID.itineraryPane ), false );
		UI.#mainDiv.addEventListener (
			'updateitinerary',
			( ) => thePanesManagerUI.updatePane ( PANE_ID.itineraryPane ),
			false
		);
		UI.#mainDiv.addEventListener (
			'showtravelnotes',
			( ) => thePanesManagerUI.showPane ( PANE_ID.travelNotesPane ),
			false
		);
		UI.#mainDiv.addEventListener (
			'updatetravelnotes',
			( ) => thePanesManagerUI.updatePane ( PANE_ID.travelNotesPane ),
			false
		);
		UI.#mainDiv.addEventListener ( 'showsearch', ( ) => thePanesManagerUI.showPane ( PANE_ID.searchPane ), false );
		UI.#mainDiv.addEventListener ( 'updatesearch', ( ) => thePanesManagerUI.updatePane ( PANE_ID.searchPane ), false );
		UI.#mainDiv.addEventListener ( 'providersadded', ( ) => theProvidersToolbarUI.providersAdded ( ), false );
		UI.#mainDiv.addEventListener (
			'setprovider',
			setProviderEvent => {
				if ( setProviderEvent.data && setProviderEvent.data.provider ) {
					theProvidersToolbarUI.provider = setProviderEvent.data.provider;
				}
			},
			false
		);
		UI.#mainDiv.addEventListener (
			'settransitmode',
			setTransitModeEvent => {
				if ( setTransitModeEvent.data && setTransitModeEvent.data.provider ) {
					theProvidersToolbarUI.transitMode = setTransitModeEvent.data.transitMode;
				}
			},
			false
		);
		document.addEventListener (
			'geolocationstatuschanged',
			geoLocationStatusChangedEvent => {
				theTravelNotesToolbarUI.geoLocationStatusChanged ( geoLocationStatusChangedEvent.data.status );
			},
			false
		);
	}

	/**
	@desc This method add the mouse events listeners
	@private
	*/

	#addMouseEventListeners ( ) {
		UI.#mainDiv.addEventListener (
			'click',
			clickEvent => {
				if ( clickEvent.target.id && 'TravelNotes-UI-MainDiv' === clickEvent.target.id ) {
					clickEvent.stopPropagation ( );
					clickEvent.preventDefault ( );
				}
			},
			false
		);

		UI.#mainDiv.addEventListener (
			'dblclick',
			dblClickEvent => {
				dblClickEvent.stopPropagation ( );
				dblClickEvent.preventDefault ( );
			},
			false
		);

		UI.#mainDiv.addEventListener (
			'contextmenu',
			conextMenuEvent => {
				conextMenuEvent.stopPropagation ( );
				conextMenuEvent.preventDefault ( );
			},
			false
		);

		UI.#mainDiv.addEventListener (
			'wheel',
			wheelEvent => {
				wheelEvent.stopPropagation ( );
				wheelEvent.preventDefault ( );
			},
			false
		);
	}

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	Change the pinned status of the UI
	*/

	pin ( ) {
		if ( this.#isPinned ) {
			UI.#mainDiv.addEventListener ( 'mouseenter', UI.#onMouseEnter, false );
			UI.#mainDiv.addEventListener ( 'mouseleave', UI.#onMouseLeave, false );
		}
		else {
			UI.#mainDiv.removeEventListener ( 'mouseenter', UI.#onMouseEnter, false );
			UI.#mainDiv.removeEventListener ( 'mouseleave', UI.#onMouseLeave, false );
		}
		this.#isPinned = ! this.#isPinned;
	}

	/**
	creates the user interface
	@param {HTMLElement} uiDiv The HTML element in witch the UI have to be created
	*/

	createUI ( uiDiv ) {
		if ( UI.#mainDiv ) {
			return;
		}
		UI.#mainDiv = theHTMLElementsFactory.create ( 'div', { id : 'TravelNotes-UI-MainDiv' }, uiDiv );

		UI.#titleDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-UI-MainDiv-Title',
				textContent : 'Travel\u00A0\u0026\u00A0Notes'
			},
			UI.#mainDiv
		);

		theTravelNotesToolbarUI.createUI ( UI.#mainDiv );
		theTravelUI.createUI ( UI.#mainDiv );
		thePanesManagerUI.addPane ( new ItineraryPaneUI ( ) );
		thePanesManagerUI.addPane ( new TravelNotesPaneUI ( ) );
		thePanesManagerUI.addPane ( new OsmSearchPaneUI ( ) );
		thePanesManagerUI.createUI ( UI.#mainDiv );
		theProvidersToolbarUI.createUI ( UI.#mainDiv );

		if ( theConfig.travelEditor.startMinimized ) {
			UI.#mainDiv.addEventListener ( 'mouseenter', UI.#onMouseEnter, false );
			UI.#mainDiv.addEventListener ( 'mouseleave', UI.#onMouseLeave, false );
			UI.#mainDiv.classList.add ( 'TravelNotes-UI-Minimized' );
			let children = UI.#mainDiv.childNodes;
			for ( let childrenCounter = 1; childrenCounter < children.length; childrenCounter ++ ) {
				children[ childrenCounter ].classList.add ( 'TravelNotes-Hidden' );
			}
		}
		else {
			UI.#titleDiv.classList.add ( 'TravelNotes-Hidden' );
			this.#isPinned = true;
		}

		this.#addTravelNotesEventListeners ( );
		this.#addMouseEventListeners ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of UI class
@type {UI}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theUI = new UI ( );

export default theUI;

/*
--- End of UI.js file ---------------------------------------------------------------------------------------------------------
*/