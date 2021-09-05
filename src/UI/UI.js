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
Doc reviewed 20210901
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

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import TravelUI from '../UI/TravelUI.js';
import PanesManagerUI from '../UI/PanesManagerUI.js';
import ProvidersToolbarUI from '../UI/ProvidersToolbarUI.js';
import TravelNotesToolbarUI from '../UI/TravelNotesToolbarUI.js';
import ItineraryPaneUI from '../UI/ItineraryPaneUI.js';
import TravelNotesPaneUI from '../UI/TravelNotesPaneUI.js';
import OsmSearchPaneUI from '../UI/OsmSearchPaneUI.js';
import { ONE } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class is the User Interface ( UI )
@see {@link theUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class UI {

	#mainHTMLElement = null;

	#travelNotesToolbarUI = null;
	#travelUI = null;
	#panesManagerUI = null;
	#providersToolbarUI = null;

	#timerId = null;
	#titleHTMLElement = null;
	#isPinned = false;

	/**
	@desc This method add the mouse events listeners (prevent defaults actions on the UI )
	@private
	*/

	#addMouseEventListeners ( ) {
		this.#mainHTMLElement.addEventListener (
			'click',
			clickEvent => {
				if ( clickEvent.target.id && 'TravelNotes-UI-MainDiv' === clickEvent.target.id ) {
					clickEvent.stopPropagation ( );
					clickEvent.preventDefault ( );
				}
			},
			false
		);

		this.#mainHTMLElement.addEventListener (
			'dblclick',
			dblClickEvent => {
				dblClickEvent.stopPropagation ( );
				dblClickEvent.preventDefault ( );
			},
			false
		);

		this.#mainHTMLElement.addEventListener (
			'contextmenu',
			conextMenuEvent => {
				conextMenuEvent.stopPropagation ( );
				conextMenuEvent.preventDefault ( );
			},
			false
		);

		this.#mainHTMLElement.addEventListener (
			'wheel',
			wheelEvent => {
				wheelEvent.stopPropagation ( );
				wheelEvent.preventDefault ( );
			},
			false
		);
	}

	/**
	Event listener for the mouse leave on the UI
	@private
	*/

	#onMouseLeave ( ) {
		if ( this.#isPinned ) {
			return;
		}
		this.#timerId = setTimeout ( ( ) => this.#hide ( ), theConfig.travelEditor.timeout );
	}

	/**
	Show the UI and hide the title
	@private
	*/

	#show ( ) {
		if ( this.#isPinned ) {
			return;
		}
		if ( this.#timerId ) {
			clearTimeout ( this.#timerId );
			this.#timerId = null;
		}
		this.#mainHTMLElement.classList.remove ( 'TravelNotes-UI-Minimized' );
		this.#titleHTMLElement.classList.add ( 'TravelNotes-Hidden' );

		let children = this.#mainHTMLElement.childNodes;
		for ( let childrenCounter = ONE; childrenCounter < children.length; childrenCounter ++ ) {
			children[ childrenCounter ].classList.remove ( 'TravelNotes-Hidden' );
		}

	}

	/**
	Hide the UI and show the title
	@private
	*/

	#hide ( ) {
		if ( this.#isPinned ) {
			return;
		}
		this.#mainHTMLElement.classList.add ( 'TravelNotes-UI-Minimized' );
		this.#titleHTMLElement.classList.remove ( 'TravelNotes-Hidden' );

		let children = this.#mainHTMLElement.childNodes;
		for ( let childrenCounter = ONE; childrenCounter < children.length; childrenCounter ++ ) {
			children[ childrenCounter ].classList.add ( 'TravelNotes-Hidden' );
		}
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	Change the pinned status of the UI
	*/

	pin ( ) {
		this.#isPinned = ! this.#isPinned;
	}

	/**
	creates the user interface
	@param {HTMLElement} uiHTMLElement The HTML element in witch the UI have to be created
	*/

	createUI ( uiHTMLElement ) {
		if ( this.#mainHTMLElement ) {
			return;
		}

		this.#mainHTMLElement = theHTMLElementsFactory.create ( 'div', { id : 'TravelNotes-UI-MainDiv' }, uiHTMLElement );
		this.#titleHTMLElement = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-UI-MainDiv-Title',
				textContent : 'Travel\u00A0\u0026\u00A0Notes'
			},
			this.#mainHTMLElement
		);
		this.#travelNotesToolbarUI = new TravelNotesToolbarUI ( this.#mainHTMLElement );
		this.#travelUI = new TravelUI ( this.#mainHTMLElement );
		this.#panesManagerUI = new PanesManagerUI ( this.#mainHTMLElement );
		this.#panesManagerUI.addPane ( ItineraryPaneUI );
		this.#panesManagerUI.addPane ( TravelNotesPaneUI );
		this.#panesManagerUI.addPane ( OsmSearchPaneUI );
		this.#providersToolbarUI = new ProvidersToolbarUI ( this.#mainHTMLElement );

		this.#mainHTMLElement.addEventListener ( 'mouseenter', ( ) => this.#show ( ), false );
		this.#mainHTMLElement.addEventListener ( 'mouseleave', ( ) => this.#onMouseLeave ( ), false );
		this.#addMouseEventListeners ( );

		if ( theConfig.travelEditor.startMinimized ) {
			this.#hide ( );
			this.#isPinned = false;
		}
		else {
			this.#show ( );
			this.#isPinned = true;
		}
	}

	get travelNotesToolbarUI ( ) { return this.#travelNotesToolbarUI; }
	get travelUI ( ) { return this.#travelUI; }
	get panesManagerUI ( ) { return this.#panesManagerUI; }
	get providersToolbarUI ( ) { return this.#providersToolbarUI; }
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