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
		- Issue ♯69 : ContextMenu and ContextMenuFactory are unclear.
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v1.13.0:
		- Issue ♯128 : Unify osmSearch and notes icons and data
	- v2.0.0:
		- Issue ♯134 : Remove node.setAttribute ( 'style', blablabla) in the code
		- Issue ♯135 : Remove innerHTML from code
Doc reviewed 20200727
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
@desc An object to represent a context menu line
@property {Object} context the object to witch the this pointer refers when calling the action function
@property {string} name the string displayed in the menu
@property {?function} action the function to be executed when clicking on the menu item. If null the item is displayed
but not active
@property {any} param a parameter to be passed to the action function. Can be any type...
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
import theTranslator from '../UI/Translator.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import { INVALID_OBJ_ID, ZERO, ONE } from '../util/Constants.js';

const OUR_MENU_MARGIN = 20;

class BaseContextMenuEvents {

	static #keyboardFocusIsOnItem = INVALID_OBJ_ID;
	static #mouseFocusIsOnItem = INVALID_OBJ_ID;
	static #currentFocusItem = INVALID_OBJ_ID;
	static #timerId = null;

	static container = null;
	static parentDiv = null;
	static menuItems = [];

	static reset ( ) {
		BaseContextMenuEvents.#keyboardFocusIsOnItem = INVALID_OBJ_ID;
		BaseContextMenuEvents.#mouseFocusIsOnItem = INVALID_OBJ_ID;
		BaseContextMenuEvents.#currentFocusItem = INVALID_OBJ_ID;
		BaseContextMenuEvents.container = null;
		if ( BaseContextMenuEvents.#timerId ) {
			clearTimeout ( BaseContextMenuEvents.#timerId );
			BaseContextMenuEvents.#timerId = null;
		}

		// BaseContextMenuEvents.parentDiv = null;
		// BaseContextMenuEvents.menuItems = [];
	}

	/**
	hightlight the item selected by the mouse or the keyboard
	@private
	*/

	static #setFocusOnItem ( isKeyboardEvent ) {
		if ( INVALID_OBJ_ID !== BaseContextMenuEvents.#currentFocusItem ) {
			BaseContextMenuEvents.container.childNodes [ BaseContextMenuEvents.#currentFocusItem + ONE ]
				.firstChild.classList.remove (
					'TravelNotes-ContextMenu-ItemSelected'
				);
		}
		if ( isKeyboardEvent ) {
			BaseContextMenuEvents.container.childNodes [ BaseContextMenuEvents.#keyboardFocusIsOnItem + ONE ]
				.firstChild.classList.add (
					'TravelNotes-ContextMenu-ItemSelected'
				);
			BaseContextMenuEvents.#currentFocusItem = BaseContextMenuEvents.#keyboardFocusIsOnItem;
		}
		else {
			BaseContextMenuEvents.container.childNodes [ BaseContextMenuEvents.#mouseFocusIsOnItem + ONE ]
				.firstChild.classList.add (
					'TravelNotes-ContextMenu-ItemSelected'
				);
			BaseContextMenuEvents.#currentFocusItem = BaseContextMenuEvents.#mouseFocusIsOnItem;
			BaseContextMenuEvents.#keyboardFocusIsOnItem = BaseContextMenuEvents.#mouseFocusIsOnItem;
		}
	}

	/**
	click event listener on the close button and on the timer
	*/

	static onCloseMenu ( ) {
		if ( BaseContextMenuEvents.#timerId ) {
			clearTimeout ( BaseContextMenuEvents.#timerId );
			BaseContextMenuEvents.#timerId = null;
		}

		// removing event listeners
		document.removeEventListener ( 'keydown', BaseContextMenuEvents.onKeyDown, true );

		// removing the menu container
		BaseContextMenuEvents.parentDiv.removeChild ( BaseContextMenuEvents.container );

		// reset global vars
		// tmp removed? this.#contextMenuEvent = null;
		BaseContextMenuEvents.reset ( );

		BaseContextMenuEvents.menuItems = [];
		BaseContextMenuEvents.parentDiv = null;
	}

	/**
	Keyboard event listener
	 */

	/*
	Keyboard events listeners must be 'module global' otherwise the events are not removed when
	closing the menu by clicking outside the menu (in this case the event listeners are duplicated
	in each instance of the menu and so, it's not the same function that is passed to addEventListener
	and removeEventListener). If keyboard event listeners are not removed, keyboard is unavailable
	for others elements. See issue ♯83
	*/

	static onKeyDown ( keyBoardEvent ) {

		if ( BaseContextMenuEvents.container ) {
			if ( 'Escape' === keyBoardEvent.key || 'Esc' === keyBoardEvent.key ) {
				keyBoardEvent.stopPropagation ( );
				BaseContextMenuEvents.onCloseMenu ( );
			}
			else if ( 'ArrowDown' === keyBoardEvent.key || 'ArrowRight' === keyBoardEvent.key || 'Tab' === keyBoardEvent.key ) {
				keyBoardEvent.stopPropagation ( );
				BaseContextMenuEvents.#keyboardFocusIsOnItem =
						INVALID_OBJ_ID === BaseContextMenuEvents.#keyboardFocusIsOnItem
						||
						BaseContextMenuEvents.menuItems.length - ONE === BaseContextMenuEvents.#keyboardFocusIsOnItem
							?
							ZERO
							:
							++ BaseContextMenuEvents.#keyboardFocusIsOnItem;
				BaseContextMenuEvents.#setFocusOnItem ( true );
			}
			else if ( 'ArrowUp' === keyBoardEvent.key || 'ArrowLeft' === keyBoardEvent.key ) {
				keyBoardEvent.stopPropagation ( );
				BaseContextMenuEvents.#keyboardFocusIsOnItem =
						INVALID_OBJ_ID === BaseContextMenuEvents.#keyboardFocusIsOnItem
						||
						ZERO === BaseContextMenuEvents.#keyboardFocusIsOnItem
							?
							BaseContextMenuEvents.menuItems.length - ONE
							:
							-- BaseContextMenuEvents.#keyboardFocusIsOnItem;
				BaseContextMenuEvents.#setFocusOnItem ( true );
			}
			else if ( 'Home' === keyBoardEvent.key ) {
				keyBoardEvent.stopPropagation ( );
				BaseContextMenuEvents.#keyboardFocusIsOnItem = ZERO;
				BaseContextMenuEvents.#setFocusOnItem ( true );
			}
			else if ( 'End' === keyBoardEvent.key ) {
				keyBoardEvent.stopPropagation ( );
				BaseContextMenuEvents.#keyboardFocusIsOnItem = BaseContextMenuEvents.menuItems.length - ONE;
				BaseContextMenuEvents.#setFocusOnItem ( true );
			}
			else if (
				( 'Enter' === keyBoardEvent.key )
					&&
					( BaseContextMenuEvents.#keyboardFocusIsOnItem >= ZERO )
					&&
					( BaseContextMenuEvents.menuItems[ BaseContextMenuEvents.#keyboardFocusIsOnItem ].action )
			) {
				keyBoardEvent.stopPropagation ( );
				BaseContextMenuEvents.#setFocusOnItem ( true );
				BaseContextMenuEvents.container.childNodes[ BaseContextMenuEvents.#currentFocusItem + ONE ].firstChild
					.click ( );
			}
		}
	}

	/**
	Click event on a menu item listener
	@private
	*/

	static onClickItem ( clickEvent ) {
		clickEvent.stopPropagation ( );
		let menuItem = BaseContextMenuEvents.menuItems[ clickEvent.target.menuItem ];

		BaseContextMenuEvents.onCloseMenu ( );
		if ( menuItem.param ) {
			menuItem.action.call (
				menuItem.context,
				menuItem.param
			);
		}
		else {
			menuItem.action.call (
				menuItem.context
			);
		}
	}

	/**
	Mouseenter event on a menu item listener
	@private
	*/

	static onMouseEnterMenuItem ( mouseEnterEvent ) {
		BaseContextMenuEvents.#mouseFocusIsOnItem = mouseEnterEvent.target.objId;
		BaseContextMenuEvents.#setFocusOnItem ( false );
	}

	static onMouseEnterContainer ( ) {
		if ( BaseContextMenuEvents.#timerId ) {
			clearTimeout ( BaseContextMenuEvents.#timerId );
			BaseContextMenuEvents.#timerId = null;
		}
	}

	static onMouseLeaveContainer ( ) {
		BaseContextMenuEvents.#timerId = setTimeout ( BaseContextMenuEvents.onCloseMenu, theConfig.contextMenu.timeout );
	}

}

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
	#parentDiv = null;

	/**
	Build the main html element for the menu and add event listeners
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
	Move the menu container on the screen, so the menu is always completely visible
	@private
	*/

	#moveContainer ( ) {

		// a dummy div is created to find the screen width and height
		let dummyDiv =
			theHTMLElementsFactory.create ( 'div', { className : 'TravelNotes-ContextMenu-DummyDiv' }, document.body );
		let screenWidth = dummyDiv.clientWidth;
		let screenHeight = dummyDiv.clientHeight;
		document.body.removeChild ( dummyDiv );

		// the menu is positionned ( = top left where the user have clicked but the menu must be completely in the window...
		let menuTop = Math.min (
			this.#contextMenuEvent.originalEvent.clientY,
			screenHeight - BaseContextMenuEvents.container.clientHeight - OUR_MENU_MARGIN
		);
		let menuLeft = Math.min (
			this.#contextMenuEvent.originalEvent.clientX,
			screenWidth - BaseContextMenuEvents.container.clientWidth - OUR_MENU_MARGIN
		);
		if ( this.#parentDiv ) {
			BaseContextMenuEvents.container.style.top = String ( menuTop ) + 'px';
			BaseContextMenuEvents.container.style.right = String ( OUR_MENU_MARGIN ) + 'px';
		}
		else {
			BaseContextMenuEvents.container.style.top = String ( menuTop ) + 'px';
			BaseContextMenuEvents.container.style.left = String ( menuLeft ) + 'px';
		}
	}

	/**
	Build and add the menu items to the container
	@private
	*/

	#addMenuItems ( ) {
		let menuItemCounter = ZERO;
		BaseContextMenuEvents.menuItems.forEach (
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
						textContent : menuItem.name,
						id : 'TravelNotes-ContextMenu-Item' + menuItemCounter,
						objId : menuItemCounter,
						className :
							menuItem.action
								?
								'TravelNotes-ContextMenu-Item'
								:
								'TravelNotes-ContextMenu-Item TravelNotes-ContextMenu-ItemDisabled'
					},
					itemContainer
				);
				itemButton.addEventListener ( 'mouseenter', BaseContextMenuEvents.onMouseEnterMenuItem, false );
				if ( menuItem.action ) {
					itemButton.addEventListener ( 'click', BaseContextMenuEvents.onClickItem, false );
				}
				itemButton.menuItem = menuItemCounter;
				++ menuItemCounter;
			}
		);
	}

	constructor ( contextMenuEvent, menuItems, parentDiv ) {

		this.#contextMenuEvent = contextMenuEvent;
		BaseContextMenuEvents.menuItems = menuItems;
		BaseContextMenuEvents.parentDiv = parentDiv || document.body;
		this.#parentDiv = parentDiv;

		Object.freeze ( this );
	}

	/**
	Show the menu on the screen.
	*/

	show ( ) {
		if ( BaseContextMenuEvents.container ) {

			// the menu is already opened, so we suppose the user will close the menu by clicking outside...
			BaseContextMenuEvents.onCloseMenu ( );
			return;
		}

		// BaseContextMenuEvents.reset ( );

		this.#buildContainer ( );
		this.#addCloseButton ( );
		this.#addMenuItems ( );
		this.#moveContainer ( );
		document.addEventListener ( 'keydown', BaseContextMenuEvents.onKeyDown, true );
	}
}

export default BaseContextMenu;

/**
--- End of BaseContextMenu.js file --------------------------------------------------------------------------------------------
*/