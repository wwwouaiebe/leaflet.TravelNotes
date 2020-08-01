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
		- Issue #69 : ContextMenu and ContextMenuFactory are unclear.
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20200727
Tests ...
 */

/**
@----------------------------------------------------------------------------------------------------------------------

@file BaseContextMenu.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@----------------------------------------------------------------------------------------------------------------------
*/

/**
@----------------------------------------------------------------------------------------------------------------------

@module BaseContextMenu
@private

@----------------------------------------------------------------------------------------------------------------------
*/

import { theConfig } from '../data/Config.js';
import { theTranslator } from '../UI/Translator.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { LAT_LNG, ZERO, ONE } from '../util/Constants.js';

let ourContainer = null;
let ourTimerId = null;
let ourFocusIsOnItem = ZERO;
let ourContextMenuEvent = null;
let ourCloseButton = null;
let ourLat = LAT_LNG.defaultValue;
let ourLng = LAT_LNG.defaultValue;

/**
@----------------------------------------------------------------------------------------------------------------------

@function myNewBaseContextMenu
@desc constructor of BaseContextMenu objects
@param {event} contextMenuEvent the event that have triggered the menu (can be a JS event or a Leaflet event)
@param {HTMLElement} [parentDiv] the html element in witch the menu will be added.
When null, the body of the html page is selected
@return {BaseContextMenu} an instance of a BaseContextMenu object
@listens mouseenter mouseleave click keydown keypress keyup
@private

@----------------------------------------------------------------------------------------------------------------------
*/

function myNewBaseContextMenu ( contextMenuEvent, parentDiv ) {

	let myMenuItems = [];
	let myHTMLElementsFactory = newHTMLElementsFactory ( );
	let myBody = document.querySelector ( 'body' );
	let myParentDiv = parentDiv || myBody;

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myOnKeyPress
	@desc keyboard event listener
	@private

	@------------------------------------------------------------------------------------------------------------------
	*/

	function myOnKeyPress ( keyBoardEvent ) {
		keyBoardEvent.preventDefault ( );
		keyBoardEvent.stopPropagation ( );
	}

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myOnKeyUp
	@desc keyboard event listener
	@private

	@------------------------------------------------------------------------------------------------------------------
	*/

	function myOnKeyUp ( keyBoardEvent ) {
		keyBoardEvent.preventDefault ( );
		keyBoardEvent.stopPropagation ( );
	}

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myOnKeyDown
	@desc keyboard event listener
	@private

	@------------------------------------------------------------------------------------------------------------------
	 */

	function myOnKeyDown ( keyBoardEvent ) {

		if ( ourContainer ) {
			if ( 'Escape' === keyBoardEvent.key || 'Esc' === keyBoardEvent.key ) {
				keyBoardEvent.stopPropagation ( );
				ourCloseButton.click ( );
			}
			else if ( 'ArrowDown' === keyBoardEvent.key || 'ArrowRight' === keyBoardEvent.key || 'Tab' === keyBoardEvent.key ) {
				keyBoardEvent.stopPropagation ( );
				ourFocusIsOnItem = ourFocusIsOnItem >= myMenuItems.length ? ONE : ++ ourFocusIsOnItem;
				ourContainer.childNodes [ ourFocusIsOnItem ].firstChild.focus ( );
			}
			else if ( 'ArrowUp' === keyBoardEvent.key || 'ArrowLeft' === keyBoardEvent.key ) {
				keyBoardEvent.stopPropagation ( );
				ourFocusIsOnItem = ourFocusIsOnItem <= ONE ? myMenuItems.length : -- ourFocusIsOnItem;
				ourContainer.childNodes [ ourFocusIsOnItem ].firstChild.focus ( );
			}
			else if ( 'Home' === keyBoardEvent.key ) {
				keyBoardEvent.stopPropagation ( );
				ourFocusIsOnItem = ONE;
				ourContainer.childNodes [ ourFocusIsOnItem ].firstChild.focus ( );
			}
			else if ( 'End' === keyBoardEvent.key ) {
				keyBoardEvent.stopPropagation ( );
				ourFocusIsOnItem = myMenuItems.length;
				ourContainer.childNodes [ ourFocusIsOnItem ].firstChild.focus ( );
			}
			else if (
				( 'Enter' === keyBoardEvent.key )
				&&
				( ourFocusIsOnItem > ZERO )
				&&
				( myMenuItems[ ourFocusIsOnItem - ONE ].action )
			) {
				keyBoardEvent.stopPropagation ( );
				ourContainer.childNodes[ ourFocusIsOnItem ].firstChild.click ( );
			}
		}
	}

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myOnClickItem
	@desc click event on a menu item listener
	@private

	@------------------------------------------------------------------------------------------------------------------
	*/

	function myOnClickItem ( clickEvent ) {
		clickEvent.stopPropagation ( );
		if ( myMenuItems[ clickEvent.target.menuItem ].param ) {
			myMenuItems[ clickEvent.target.menuItem ].action.call (
				myMenuItems[ clickEvent.target.menuItem ].context,
				myMenuItems[ clickEvent.target.menuItem ].param,
				ourContextMenuEvent
			);
		}
		else {
			myMenuItems[ clickEvent.target.menuItem ].action.call (
				myMenuItems[ clickEvent.target.menuItem ].context,
				ourContextMenuEvent
			);
		}
		ourCloseButton.click ( );
	}

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myOnCloseMenu
	@desc click event on the close button listener
	@private

	@------------------------------------------------------------------------------------------------------------------
	*/

	function myOnCloseMenu ( ) {
		if ( ourTimerId ) {
			clearTimeout ( ourTimerId );
			ourTimerId = null;
		}

		// removing event listeners
		document.removeEventListener ( 'keydown', myOnKeyDown, true );
		document.removeEventListener ( 'keypress', myOnKeyPress, true );
		document.removeEventListener ( 'keyup', myOnKeyUp, true );

		// removing menu items
		let childNodes = ourContainer.childNodes;
		childNodes [ ZERO ].firstChild.removeEventListener ( 'click', myOnCloseMenu, false );
		for ( let childNodesCounter = ONE; childNodesCounter < childNodes.length; childNodesCounter ++ ) {
			childNodes [ childNodesCounter ].firstChild.removeEventListener ( 'click', myOnClickItem, false );
		}

		// removing the menu container
		myParentDiv.removeChild ( ourContainer );
		ourContainer = null;
		ourFocusIsOnItem = ZERO;
		myMenuItems = [];
		ourLat = LAT_LNG.defaultValue;
		ourLng = LAT_LNG.defaultValue;
	}

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myBuildContainer
	@desc Build the main html element for the menu and add event listeners
	@private

	@------------------------------------------------------------------------------------------------------------------
	*/

	function myBuildContainer ( ) {
		ourContainer = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ContextMenu-Container',
				className : 'TravelNotes-ContextMenu-Container'
			},
			myParentDiv
		);

		// Events are created to clear or add a timer when the mouse leave or enter in the container
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
			( ) => { ourTimerId = setTimeout ( myOnCloseMenu, theConfig.contextMenu.timeout ); },
			false
		);

	}

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myAddCloseButton
	@desc add the close button and it's event listener to the menu
	@private

	@------------------------------------------------------------------------------------------------------------------
	*/

	function myAddCloseButton ( ) {
		ourCloseButton = myHTMLElementsFactory.create (
			'div',
			{
				innerHTML : '&#x274c',
				className : 'TravelNotes-ContextMenu-CloseButton',
				title : theTranslator.getText ( 'ContextMenu - Close' )
			},
			ourContainer
		);
		ourCloseButton.addEventListener ( 'click', myOnCloseMenu, false );
	}

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myMoveContainer
	@desc move the menu container on the screen, so the menu is always completely visible
	@private

	@------------------------------------------------------------------------------------------------------------------
	*/

	function myMoveContainer ( ) {

		const MENU_MARGIN = 20;

		// a dummy div is created to find the screen width and height
		let dummyDiv = myHTMLElementsFactory.create ( 'div', { className : 'TravelNotes-ContextMenu-Panel' }, myBody );
		let screenWidth = dummyDiv.clientWidth;
		let screenHeight = dummyDiv.clientHeight;
		myBody.removeChild ( dummyDiv );

		// the menu is positionned ( = top left where the user have clicked but the menu must be completely in the window...
		let menuTop = Math.min (
			ourContextMenuEvent.originalEvent.clientY,
			screenHeight - ourContainer.clientHeight - MENU_MARGIN
		);
		let menuLeft = Math.min (
			ourContextMenuEvent.originalEvent.clientX,
			screenWidth - ourContainer.clientWidth - MENU_MARGIN
		);
		if ( parentDiv ) {
			ourContainer.setAttribute ( 'style', 'top:' + menuTop + 'px;right:' + MENU_MARGIN + 'px;' );
		}
		else {
			ourContainer.setAttribute ( 'style', 'top:' + menuTop + 'px;left:' + menuLeft + 'px;' );
		}
	}

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myAddMenuItems
	@desc build and add the menu items to the container
	@private

	@------------------------------------------------------------------------------------------------------------------
	*/

	function myAddMenuItems ( ) {
		let menuItemCounter = ZERO;
		myMenuItems.forEach (
			menuItem => {
				let itemContainer = myHTMLElementsFactory.create (
					'div',
					{
						className : 'TravelNotes-ContextMenu-ItemContainer'
					},
					ourContainer
				);
				let itemButton = myHTMLElementsFactory.create (
					'button',
					{
						innerHTML : menuItem.name,
						id : 'TravelNotes-ContextMenu-Item' + menuItemCounter,
						className :
							menuItem.action
								?
								'TravelNotes-ContextMenu-Item'
								:
								'TravelNotes-ContextMenu-Item TravelNotes-ContextMenu-ItemDisabled'
					},
					itemContainer
				);
				if ( menuItem.action ) {
					itemButton.addEventListener ( 'click', myOnClickItem, false );
				}
				itemButton.menuItem = menuItemCounter;
				++ menuItemCounter;
			}
		);
	}

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myShow
	@desc build the complete menu an show it on the screen
	@private

	@------------------------------------------------------------------------------------------------------------------
	*/

	function myShow ( ) {

		ourContextMenuEvent = contextMenuEvent;

		// when clicking on a leaflet polyline, a route event AND a map event are generated
		// with the same latlng. We compare positions and returns when latlng are equals
		// to avoid a map menu on top of the route menu
		if (
			! ourContextMenuEvent.fromUI
			&&
			( ourContextMenuEvent.latlng.lat === ourLat )
			&&
			( ourContextMenuEvent.latlng.lng === ourLng )
		) {
			return;
		}

		ourLat = ourContextMenuEvent.latlng.lat;
		ourLng = ourContextMenuEvent.latlng.lng;
		if ( ourContainer ) {

			// the menu is already opened, so we suppose the user will close the menu by clicking outside...
			// For an unknown reason, event listeners are not removed in the myOnCloseMenu procedure,
			// so it's beter to not close the menu to avoid the keyboard blocked...
			// myOnCloseMenu ( );
			return;
		}

		myBuildContainer ( );
		myAddCloseButton ( );
		myAddMenuItems ( );
		myMoveContainer ( );
		document.addEventListener ( 'keydown', myOnKeyDown, true );
		document.addEventListener ( 'keypress', myOnKeyPress, true );
		document.addEventListener ( 'keyup', myOnKeyUp, true );
	}

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myInit
	@desc Add the menu items
	@param menuItems {array} the menu items to use
	@private

	@------------------------------------------------------------------------------------------------------------------
	*/

	function myInit ( menuItems ) {
		myMenuItems = menuItems;
	}

	/**
	@------------------------------------------------------------------------------------------------------------------

	@class BaseContextMenu
	@classdesc Base class used to show context menus
	@see {@link newBaseContextMenu} for constructor
	@abstract
	@hideconstructor

	@------------------------------------------------------------------------------------------------------------------
	*/

	class BaseContextMenu {

		/**
		Add the menu items. Must be called in the derived classes
		@param menuItems {array} the menu items to use
		*/

		init ( menuItems ) { myInit ( menuItems ); }

		/**
		Show the menu on the screen.
		*/

		show ( ) { myShow ( ); }
	}

	return new BaseContextMenu;
}

export {

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function
	@desc constructor of BaseContextMenu objects
	@param  {event} contextMenuEvent the event that have triggered the menu (can be a JS event or a Leaflet event)
	@param {HTMLElement} [parentDiv] the html element in witch the menu will be added.
	When null, the body of the html page is selected
	@return {BaseContextMenu} an instance of a BaseContextMenu object
	@listens mouseenter mouseleave click keydown keypress keyup
	@global

	@------------------------------------------------------------------------------------------------------------------
	*/

	myNewBaseContextMenu as newBaseContextMenu
};

/**
--- End of BaseContextMenu.js file ------------------------------------------------------------------------------------
*/