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
Doc reviewed 20210728
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

@module BaseContextMenu
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theTranslator from '../UI/Translator.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import BaseContextMenuEvents from '../contextMenus/BaseContextMenuEvents.js';
import { ZERO, ONE } from '../util/Constants.js';

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

	#contextMenuEvent = null;
	#haveParentDiv = null;
	#onOk = null;
	#onError = null;
	#menuItems = null;

	/**
	Build the menu container and add event listeners
	@private
	*/

	#buildContainer ( ) {
		BaseContextMenuEvents.container = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ContextMenu-Container',
				className : 'TravelNotes-ContextMenu-Container'
			},
			BaseContextMenuEvents.parentDiv
		);

		// Events are created to clear or add a timer when the mouse leave or enter in the container
		if ( ZERO < theConfig.contextMenu.timeout ) {
			BaseContextMenuEvents.container.addEventListener (
				'mouseenter',
				BaseContextMenuEvents.onMouseEnterContainer,
				false
			);
			BaseContextMenuEvents.container.addEventListener (
				'mouseleave',
				BaseContextMenuEvents.onMouseLeaveContainer,
				false
			);
		}
	}

	/**
	Add the close button and it's event listener to the menu
	@private
	*/

	#addCloseButton ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				textContent : '❌',
				className : 'TravelNotes-ContextMenu-CloseButton',
				title : theTranslator.getText ( 'ContextMenu - Close' )
			},
			BaseContextMenuEvents.container
		).addEventListener ( 'click', BaseContextMenuEvents.onCloseMenu, false );
	}

	/**
	Add the menu items and event listeners to the container
	@private
	*/

	#addMenuItems ( ) {
		let menuItemCounter = ZERO;
		this.menuItems.forEach (
			menuItem => {
				let itemContainer = theHTMLElementsFactory.create (
					'div',
					{
						className : 'TravelNotes-ContextMenu-ItemContainer'
					},
					BaseContextMenuEvents.container
				);
				let itemButton = theHTMLElementsFactory.create (
					'div',
					{
						textContent : menuItem.itemText,
						id : 'TravelNotes-ContextMenu-Item' + menuItemCounter,
						objId : menuItemCounter,
						className :
							menuItem.doAction
								?
								'TravelNotes-ContextMenu-Item'
								:
								'TravelNotes-ContextMenu-Item TravelNotes-ContextMenu-ItemDisabled'
					},
					itemContainer
				);

				itemButton.addEventListener ( 'mouseenter', BaseContextMenuEvents.onMouseEnterMenuItem, false );
				if ( menuItem.doAction ) {
					itemButton.addEventListener ( 'click', BaseContextMenuEvents.onClickItem, false );
				}

				++ menuItemCounter;
			}
		);
		BaseContextMenuEvents.lastItemObjId = menuItemCounter - ONE;
	}

	/**
	Move the menu container on the screen, so the menu is always completely visible and near the selected point
	@private
	*/

	#moveContainer ( ) {

		// Searching the screen width and height
		let screenWidth = theTravelNotesData.map.getContainer ( ).clientWidth;
		let screenHeight = theTravelNotesData.map.getContainer ( ).clientHeight;

		// the menu is positionned ( = top left where the user have clicked but the menu must be completely in the window...
		let menuTop = Math.min (
			this.#contextMenuEvent.originalEvent.clientY,
			screenHeight - BaseContextMenuEvents.container.clientHeight - OUR_MENU_MARGIN
		);
		let menuLeft = Math.min (
			this.#contextMenuEvent.originalEvent.clientX,
			screenWidth - BaseContextMenuEvents.container.clientWidth - OUR_MENU_MARGIN
		);
		if ( this.#haveParentDiv ) {
			BaseContextMenuEvents.container.style.top = String ( menuTop ) + 'px';
			BaseContextMenuEvents.container.style.right = String ( OUR_MENU_MARGIN ) + 'px';
		}
		else {
			BaseContextMenuEvents.container.style.top = String ( menuTop ) + 'px';
			BaseContextMenuEvents.container.style.left = String ( menuLeft ) + 'px';
		}
	}

	/**
	Takes action when an item is selected in the menu
	@param {number} selectedItemObjId the objId of the selected item
	*/

	onSelectedItem ( selectedItemObjId ) {
		this.#onOk ( selectedItemObjId );
	}

	/**
	Verify that an item can performs an action
	@param {number} selectedItemObjId the objId of the selected item
	@return {boolean} true when the item can performs an action
	*/

	itemHaveAction ( itemObjId ) {
		return this.menuItems [ itemObjId ].doAction;
	}

	/**
	build and show the menu
	@private
	*/

	#show ( onOk, onError ) {
		this.#onOk = onOk;
		this.#onError = onError;
		this.#buildContainer ( );
		this.#addCloseButton ( );
		this.#addMenuItems ( );
		this.#moveContainer ( );
		document.addEventListener ( 'keydown', BaseContextMenuEvents.onKeyDown, true );
	}

	constructor ( contextMenuEvent, parentDiv ) {
		if ( BaseContextMenuEvents.container ) {

			// the menu is already opened, so we suppose the user will close the menu by clicking outside...
			BaseContextMenuEvents.onCloseMenu ( );
			return;
		}

		BaseContextMenuEvents.contextMenu = this;
		this.#contextMenuEvent = contextMenuEvent;
		BaseContextMenuEvents.parentDiv = parentDiv || document.body;
		this.#haveParentDiv = null !== parentDiv;
	}

	/**
	Show the menu
	*/

	show ( ) {
		new Promise (
			( onOk, onError ) => { this.#show ( onOk, onError ); }
		)
			.then ( selection => this.doAction ( selection ) )
			.catch (
				err => {
					console.error ( err );
					BaseContextMenuEvents.reset ( );
				}
			);

	}

	/**
	Execute the action for the selected item. Must be implemented in the derived classes
	@param {number} selectedItemObjId The selected item objId
	*/

	doAction ( /* selectedItemObjId */ ) {
	}

	/**
	The menuItems to be used by the menu.  Must be implemented in the derived classes
	*/

	set menuItems ( MenuItems ) {
		if ( ! this.#menuItems ) {
			this.#menuItems = MenuItems;
		}
	}

	get menuItems ( ) {
		return this.#menuItems;
	}

}

export default BaseContextMenu;

/**
--- End of BaseContextMenu.js file --------------------------------------------------------------------------------------------
*/