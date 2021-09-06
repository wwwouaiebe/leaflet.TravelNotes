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

@file BaseContextMenu.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} MenuItem
@desc An object with data used to display the menu
@property {string} itemText The text to display in the menu
@property {boolean} doAction When true the menu item is selectable
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module contextMenus

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTravelNotesData from '../data/TravelNotesData.js';
import theTranslator from '../UILib/Translator.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import BaseContextMenuOperator from '../contextMenus/BaseContextMenuOperator.js';

import { ZERO, INVALID_OBJ_ID, LAT_LNG } from '../main/Constants.js';

const OUR_MENU_MARGIN = 20;

/**
@--------------------------------------------------------------------------------------------------------------------------

@class BaseContextMenu
@classdesc Base class used to show context menus
@abstract
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class BaseContextMenu {

	/**
	The active menu container. Needed to close the menu when
	a second menu is loaded
	@private
	*/

	static #currentMenu = null;

	/**
	The promise ok and error handler
	@private
	*/

	#onPromiseOk = null;
	#onPromiseError = null;

	/**
	html elements of the menu
	@private
	*/

	#htmlElements = {
		parentNode : null,
		container : null,
		cancelButton : null,
		menuItemHTMLElements : []
	};

	#eventData = {
		clientX : ZERO,
		clientY : ZERO,
		lat : LAT_LNG.defaultValue,
		lng : LAT_LNG.defaultValue,
		targetObjId : INVALID_OBJ_ID,
		haveParentNode : false
	};

	/**
	The associated BaseContextMenuOperator object
	@private
	*/

	#menuOperator = null;

	/**
	Build the menu container and add event listeners
	@private
	*/

	#createContainer ( ) {
		this.#htmlElements.container = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ContextMenu-Container'
			},
			this.#htmlElements.parentNode
		);
	}

	/**
	Create the cancel button and it's event listener to the menu
	@private
	*/

	#createCancelButton ( ) {
		this.#htmlElements.cancelButton = theHTMLElementsFactory.create (
			'div',
			{
				textContent : '❌',
				className : 'TravelNotes-ContextMenu-CloseButton',
				title : theTranslator.getText ( 'ContextMenu - Close' )
			},
			this.#htmlElements.container
		);
	}

	/**
	Create the menuItems html elements
	@private
	*/

	#createMenuItemsHTMLElements ( ) {
		let menuItemCounter = 0;
		this.menuItems.forEach (
			menuItem => {
				let menuItemHTMLElement = theHTMLElementsFactory.create (
					'div',
					{
						textContent : menuItem.itemText,
						className :	'TravelNotes-ContextMenu-Item',
						dataset : { ObjId : String ( menuItemCounter ++ ) }
					},
					this.#htmlElements.container
				);
				if ( ! menuItem.isActive ) {
					menuItemHTMLElement.classList.add ( 'TravelNotes-ContextMenu-ItemDisabled' );
				}
				this.#htmlElements.menuItemHTMLElements.push ( menuItemHTMLElement );
			}
		);
	}

	/**
	Move the container, so the top of the container is near the mouse
	@private
	*/

	#moveContainer ( ) {

		// Searching the screen width and height
		let screenWidth = theTravelNotesData.map.getContainer ( ).clientWidth;
		let screenHeight = theTravelNotesData.map.getContainer ( ).clientHeight;

		// the menu is positionned ( = top left where the user have clicked but the menu must be completely in the window...
		let menuTop = Math.min (
			this.#eventData.clientY,
			screenHeight - this.#htmlElements.container.clientHeight - OUR_MENU_MARGIN
		);
		let menuLeft = Math.min (
			this.#eventData.clientX,
			screenWidth - this.#htmlElements.container.clientWidth - OUR_MENU_MARGIN
		);
		this.#htmlElements.container.style.top = String ( menuTop ) + 'px';
		if ( this.#eventData.haveParentNode ) {
			this.#htmlElements.container.style.right = String ( OUR_MENU_MARGIN ) + 'px';
		}
		else {
			this.#htmlElements.container.style.left = String ( menuLeft ) + 'px';
		}
	}

	/**
	Create and show the menu
	@private
	*/

	#createMenu ( onPromiseOk, onPromiseError ) {
		this.#onPromiseOk = onPromiseOk;
		this.#onPromiseError = onPromiseError;
		this.#createContainer ( );
		this.#createCancelButton ( );
		this.#createMenuItemsHTMLElements ( );
		this.#moveContainer ( );
		this.#menuOperator = new BaseContextMenuOperator ( this );

	}

	/*
	constructor
	@param {Event} contextMenuEvent. The event that have triggered the menu
	@param {Object} parentNode The parent node of the menu. Can be null for leaflet objects
	*/

	constructor ( contextMenuEvent, parentNode ) {

		if ( BaseContextMenu.#currentMenu ) {

			// the menu is already opened, so we suppose the user will close the menu by clicking outside...
			BaseContextMenu.#currentMenu.onCancel ( );
			return;
		}

		this.#eventData.clientX = contextMenuEvent.clientX || contextMenuEvent.originalEvent.clientX || ZERO;
		this.#eventData.clientY = contextMenuEvent.clientY || contextMenuEvent.originalEvent.clientY || ZERO;
		this.#eventData.lat = contextMenuEvent.latlng ? contextMenuEvent.latlng.lat : LAT_LNG.defaultValue;
		this.#eventData.lng = contextMenuEvent.latlng ? contextMenuEvent.latlng.lng : LAT_LNG.defaultValue;
		if ( contextMenuEvent.target.objId ) {

			// Needed for leaflet objects
			this.#eventData.targetObjId = contextMenuEvent.target.objId;
		}
		else if (
			contextMenuEvent.currentTarget
			&&
			contextMenuEvent.currentTarget.dataset
			&&
			contextMenuEvent.currentTarget.dataset.tanObjId
		) {
			this.#eventData.targetObjId = Number.parseInt ( contextMenuEvent.currentTarget.dataset.tanObjId );
		}
		this.#eventData.haveParentNode = null !== parentNode;
		Object.freeze ( this.#eventData );

		this.#htmlElements.parentNode = parentNode || document.body;

		BaseContextMenu.#currentMenu = this;
		Object.freeze ( this );
	}

	/**
	onOk method used by the menu operator
	*/

	onOk ( selectedItem ) {
		this.#menuOperator.destructor ( );
		BaseContextMenu.#currentMenu = null;
		this.#onPromiseOk ( selectedItem );
	}

	/**
	onCancel method used by the menu operator
	*/

	onCancel ( ) {
		this.#menuOperator.destructor ( );
		BaseContextMenu.#currentMenu = null;
		this.#onPromiseError ( );
	}

	/**
	Show the menu on the screen and perform the correct operation when an item is selected
	*/

	show ( ) {
		if ( ! BaseContextMenu.#currentMenu ) {
			return;
		}
		new Promise (
			( onPromiseOk, onPromiseError ) => { this.#createMenu ( onPromiseOk, onPromiseError ); }
		)
			.then ( selection => this.doAction ( selection ) )
			.catch (
				err => {
					if ( err ) {
						console.error ( err );
					}
				}
			);
	}

	/**
	Return the menuItems. Must be implemented in the derived classes
	@readonly
	*/

	get menuItems ( ) { return []; }

	/**
	Get the html elements of the menu
	@readonly
	*/

	get htmlElements ( ) { return this.#htmlElements; }

	get eventData ( ) { return this.#eventData; }

}

export default BaseContextMenu;

/**
--- End of BaseContextMenu.js file --------------------------------------------------------------------------------------------
*/