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

let ourContextMenuEvent = null;
let ourContainer = null;
let ourTimerId = null;

let ourKeyboardFocusIsOnItem = INVALID_OBJ_ID;
let ourMouseFocusIsOnItem = INVALID_OBJ_ID;
let ourCurrentFocusItem = INVALID_OBJ_ID;
let ourMenuItems = [];
let ourCloseButton = null;
let ourParentDiv = null;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourSetFocusOnItem
@desc hightlight the item selected by the mouse or the keyboard
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourSetFocusOnItem ( isKeyboardEvent ) {
	if ( INVALID_OBJ_ID !== ourCurrentFocusItem ) {
		ourContainer.childNodes [ ourCurrentFocusItem + ONE ].firstChild.classList.remove (
			'TravelNotes-ContextMenu-ItemSelected'
		);
	}
	if ( isKeyboardEvent ) {
		ourContainer.childNodes [ ourKeyboardFocusIsOnItem + ONE ].firstChild.classList.add (
			'TravelNotes-ContextMenu-ItemSelected'
		);
		ourCurrentFocusItem = ourKeyboardFocusIsOnItem;
	}
	else {
		ourContainer.childNodes [ ourMouseFocusIsOnItem + ONE ].firstChild.classList.add (
			'TravelNotes-ContextMenu-ItemSelected'
		);
		ourCurrentFocusItem = ourMouseFocusIsOnItem;
		ourKeyboardFocusIsOnItem = ourMouseFocusIsOnItem;
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnKeyDown
@desc keyboard event listener
@private

@------------------------------------------------------------------------------------------------------------------------------
 */

/*
Keyboard events listeners must be 'module global' otherwise the events are not removed when
closing the menu by clicking outside the menu (in this case the event listeners are duplicated
in each instance of the menu and so, it's not the same function that is passed to addEventListener
and removeEventListener). If keyboard event listeners are not removed, keyboard is unavailable
for others elements. See issue ♯83
*/

function ourOnKeyDown ( keyBoardEvent ) {

	if ( ourContainer ) {
		if ( 'Escape' === keyBoardEvent.key || 'Esc' === keyBoardEvent.key ) {
			keyBoardEvent.stopPropagation ( );
			ourCloseButton.click ( );
		}
		else if ( 'ArrowDown' === keyBoardEvent.key || 'ArrowRight' === keyBoardEvent.key || 'Tab' === keyBoardEvent.key ) {
			keyBoardEvent.stopPropagation ( );
			ourKeyboardFocusIsOnItem =
					INVALID_OBJ_ID === ourKeyboardFocusIsOnItem
					||
					ourMenuItems.length - ONE === ourKeyboardFocusIsOnItem
						?
						ZERO
						:
						++ ourKeyboardFocusIsOnItem;
			ourSetFocusOnItem ( true );
		}
		else if ( 'ArrowUp' === keyBoardEvent.key || 'ArrowLeft' === keyBoardEvent.key ) {
			keyBoardEvent.stopPropagation ( );
			ourKeyboardFocusIsOnItem =
					INVALID_OBJ_ID === ourKeyboardFocusIsOnItem
					||
					ZERO === ourKeyboardFocusIsOnItem
						?
						ourMenuItems.length - ONE
						:
						-- ourKeyboardFocusIsOnItem;
			ourSetFocusOnItem ( true );
		}
		else if ( 'Home' === keyBoardEvent.key ) {
			keyBoardEvent.stopPropagation ( );
			ourKeyboardFocusIsOnItem = ZERO;
			ourSetFocusOnItem ( true );
		}
		else if ( 'End' === keyBoardEvent.key ) {
			keyBoardEvent.stopPropagation ( );
			ourKeyboardFocusIsOnItem = ourMenuItems.length - ONE;
			ourSetFocusOnItem ( true );
		}
		else if (
			( 'Enter' === keyBoardEvent.key )
				&&
				( ourKeyboardFocusIsOnItem >= ZERO )
				&&
				( ourMenuItems[ ourKeyboardFocusIsOnItem ].action )
		) {
			keyBoardEvent.stopPropagation ( );
			ourSetFocusOnItem ( true );
			ourContainer.childNodes[ ourCurrentFocusItem + ONE ].firstChild.click ( );
		}
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnClickItem
@desc click event on a menu item listener
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnClickItem ( clickEvent ) {
	clickEvent.stopPropagation ( );
	let menuItem = ourMenuItems[ clickEvent.target.menuItem ];

	ourCloseButton.click ( );
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

	// ourCloseButton.click ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnMouseEnterMenuItem
@desc mouseenter event on a menu item listener
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnMouseEnterMenuItem ( mouseEnterEvent ) {
	ourMouseFocusIsOnItem = mouseEnterEvent.target.objId;
	ourSetFocusOnItem ( false );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnCloseMenu
@desc click event on the close button listener
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnCloseMenu ( ) {
	if ( ourTimerId ) {
		clearTimeout ( ourTimerId );
		ourTimerId = null;
	}

	// removing event listeners
	document.removeEventListener ( 'keydown', ourOnKeyDown, true );

	// removing the menu container
	ourParentDiv.removeChild ( ourContainer );

	// reset global vars
	ourContextMenuEvent = null;
	ourContainer = null;
	ourKeyboardFocusIsOnItem = INVALID_OBJ_ID;
	ourMouseFocusIsOnItem = INVALID_OBJ_ID;
	ourCurrentFocusItem = INVALID_OBJ_ID;
	ourMenuItems = [];
	ourCloseButton = null;
	ourParentDiv = null;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewBaseContextMenu
@desc constructor of BaseContextMenu objects
@param {event} contextMenuEvent the event that have triggered the menu (can be a JS event or a Leaflet event)
@param {Array.<MenuItem>} menuItems the items to be displayed in the menu
@param {HTMLElement} [parentDiv] the html element in witch the menu will be added.
When null, the body of the html page is selected
@return {BaseContextMenu} an instance of a BaseContextMenu object
@listens mouseenter mouseleave click keydown keypress keyup
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewBaseContextMenu ( contextMenuEvent, menuItems, parentDiv ) {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myBuildContainer
	@desc Build the main html element for the menu and add event listeners
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myBuildContainer ( ) {
		ourContainer = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ContextMenu-Container',
				className : 'TravelNotes-ContextMenu-Container'
			},
			ourParentDiv
		);

		// Events are created to clear or add a timer when the mouse leave or enter in the container
		if ( ZERO < theConfig.contextMenu.timeout ) {
			ourContainer.addEventListener (
				'mouseenter',
				( ) => {
					if ( ourTimerId ) {
						clearTimeout ( ourTimerId );
						ourTimerId = null;
					}
				},
				false
			);
			ourContainer.addEventListener (
				'mouseleave',
				( ) => {
					ourTimerId = setTimeout ( ourOnCloseMenu, theConfig.contextMenu.timeout );
				},
				false
			);
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddCloseButton
	@desc add the close button and it's event listener to the menu
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddCloseButton ( ) {
		ourCloseButton = theHTMLElementsFactory.create (
			'div',
			{
				textContent : '❌',
				className : 'TravelNotes-ContextMenu-CloseButton',
				title : theTranslator.getText ( 'ContextMenu - Close' )
			},
			ourContainer
		);
		ourCloseButton.addEventListener ( 'click', ourOnCloseMenu, false );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myMoveContainer
	@desc move the menu container on the screen, so the menu is always completely visible
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myMoveContainer ( ) {

		// a dummy div is created to find the screen width and height
		let dummyDiv =
			theHTMLElementsFactory.create ( 'div', { className : 'TravelNotes-ContextMenu-DummyDiv' }, document.body );
		let screenWidth = dummyDiv.clientWidth;
		let screenHeight = dummyDiv.clientHeight;
		document.body.removeChild ( dummyDiv );

		// the menu is positionned ( = top left where the user have clicked but the menu must be completely in the window...
		let menuTop = Math.min (
			ourContextMenuEvent.originalEvent.clientY,
			screenHeight - ourContainer.clientHeight - OUR_MENU_MARGIN
		);
		let menuLeft = Math.min (
			ourContextMenuEvent.originalEvent.clientX,
			screenWidth - ourContainer.clientWidth - OUR_MENU_MARGIN
		);
		if ( parentDiv ) {
			ourContainer.style.top = String ( menuTop ) + 'px';
			ourContainer.style.right = String ( OUR_MENU_MARGIN ) + 'px';
		}
		else {
			ourContainer.style.top = String ( menuTop ) + 'px';
			ourContainer.style.left = String ( menuLeft ) + 'px';
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddMenuItems
	@desc build and add the menu items to the container
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddMenuItems ( ) {
		let menuItemCounter = ZERO;
		ourMenuItems.forEach (
			menuItem => {
				let itemContainer = theHTMLElementsFactory.create (
					'div',
					{
						className : 'TravelNotes-ContextMenu-ItemContainer'
					},
					ourContainer
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
				itemButton.addEventListener ( 'mouseenter', ourOnMouseEnterMenuItem, false );
				if ( menuItem.action ) {
					itemButton.addEventListener ( 'click', ourOnClickItem, false );
				}
				itemButton.menuItem = menuItemCounter;
				++ menuItemCounter;
			}
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myShow
	@desc build the complete menu an show it on the screen
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myShow ( ) {

		ourContextMenuEvent = contextMenuEvent;

		if ( ourContainer ) {

			// the menu is already opened, so we suppose the user will close the menu by clicking outside...
			if ( ourTimerId ) {
				clearTimeout ( ourTimerId );
				ourTimerId = null;
			}
			ourOnCloseMenu ( );

			return;
		}

		// reset some global vars
		ourContainer = null;
		ourKeyboardFocusIsOnItem = INVALID_OBJ_ID;
		ourMouseFocusIsOnItem = INVALID_OBJ_ID;
		ourCurrentFocusItem = INVALID_OBJ_ID;
		ourCloseButton = null;
		ourParentDiv = parentDiv || document.body;
		ourMenuItems = menuItems;

		myBuildContainer ( );
		myAddCloseButton ( );
		myAddMenuItems ( );
		myMoveContainer ( );
		document.addEventListener ( 'keydown', ourOnKeyDown, true );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class BaseContextMenu
	@classdesc Base class used to show context menus
	@see {@link newBaseContextMenu} for constructor
	@abstract
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class BaseContextMenu {

		constructor ( ) {
			Object.freeze ( this );
		}

		/**
		Show the menu on the screen.
		*/

		show ( ) { myShow ( ); }
	}

	return new BaseContextMenu;
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function
	@desc constructor of BaseContextMenu objects
	@param  {event} contextMenuEvent the event that have triggered the menu (can be a JS event or a Leaflet event)
	@param {Array.<MenuItem>} menuItems the items to be displayed in the menu
	@param {HTMLElement} [parentDiv] the html element in witch the menu will be added.
	When null, the body of the html page is selected
	@return {BaseContextMenu} an instance of a BaseContextMenu object
	@listens mouseenter mouseleave click keydown keypress keyup
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewBaseContextMenu as newBaseContextMenu
};

/**
--- End of BaseContextMenu.js file --------------------------------------------------------------------------------------------
*/