/*
Copyright - 2019 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- BaseContextMenu.js file -------------------------------------------------------------------------------------------
This file contains:
	-
Changes:
	- v1.6.0:
		- created
		- Issue #69 : ContextMenu and ContextMenuFactory are unclear.
Doc reviewed 20191124
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newBaseContextMenu };

import { theConfig } from '../data/Config.js';
import { theTranslator } from '../UI/Translator.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

let ourContainer = null;
let ourTimerId = null;
let ourFocusIsOnItem = 0;
let ourOriginalEvent = null;
let ourLat = 0;
let ourLng = 0;

/*
--- newBaseContextMenu function ---------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newBaseContextMenu ( originalEvent ) {

	let myMenuItems = [];

	let myHTMLElementsFactory = newHTMLElementsFactory ( );
	let myBody = document.getElementsByTagName ( 'body' ) [ 0 ];

	/*
	--- myOnCloseMenu function ----------------------------------------------------------------------------------------

	event listener for the close button. Alson called from others events

	-------------------------------------------------------------------------------------------------------------------
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
		childNodes [ 0 ].firstChild.removeEventListener ( 'click', myOnCloseMenu, false );
		for ( let childNodesCounter = 1; childNodesCounter < childNodes.length; childNodesCounter ++ ) {
			childNodes [ childNodesCounter ].firstChild.removeEventListener ( 'click', myOnClickItem, false );
		}

		// removing the menu container
		document.getElementsByTagName ( 'body' ) [ 0 ].removeChild ( ourContainer );
		ourContainer = null;
		ourFocusIsOnItem = 0;
		myMenuItems = [];
		ourLat = 0;
		ourLng = 0;
	}

	/*
	--- myOnKeyDown function ------------------------------------------------------------------------------------------

	Keyboard event listener

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnKeyDown ( keyBoardEvent ) {

		if ( ourContainer ) {
			keyBoardEvent.preventDefault ( );
			keyBoardEvent.stopPropagation ( );
		}
		if ( 'Escape' === keyBoardEvent.key || 'Esc' === keyBoardEvent.key ) {
			myOnCloseMenu ( );
		}
		if ( 'ArrowDown' === keyBoardEvent.key  || 'ArrowRight' === keyBoardEvent.key  ||  'Tab' === keyBoardEvent.key ) {
			ourFocusIsOnItem = ourFocusIsOnItem >= myMenuItems.length ? 1 : ++ ourFocusIsOnItem;
			ourContainer.childNodes [ ourFocusIsOnItem ].firstChild.focus ( );
		}
		if ( 'ArrowUp' === keyBoardEvent.key  || 'ArrowLeft' === keyBoardEvent.key ) {
			ourFocusIsOnItem = ourFocusIsOnItem <= 1 ? myMenuItems.length : -- ourFocusIsOnItem;
			ourContainer.childNodes [ ourFocusIsOnItem ].firstChild.focus ( );
		}
		if ( 'Home' === keyBoardEvent.key ) {
			ourFocusIsOnItem = 1;
			ourContainer.childNodes [ ourFocusIsOnItem ].firstChild.focus ( );
		}
		if ( 'End' === keyBoardEvent.key ) {
			ourFocusIsOnItem = myMenuItems.length;
			ourContainer.childNodes [ ourFocusIsOnItem ].firstChild.focus ( );
		}
		if ( ( 'Enter' === keyBoardEvent.key )  && ( ourFocusIsOnItem > 0 ) && ( myMenuItems[ ourFocusIsOnItem -1 ].action ) ) {
			ourContainer.childNodes[ ourFocusIsOnItem ].firstChild.click ( );
		}
	}

	/*
	--- myOnKeyPress function -----------------------------------------------------------------------------------------

	Keyboard event listener

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnKeyPress ( keyBoardEvent ) {
		keyBoardEvent.preventDefault ( );
		keyBoardEvent.stopPropagation ( );
	}

	/*
	--- myOnKeyUp function --------------------------------------------------------------------------------------------

	Keyboard event listener

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnKeyUp ( keyBoardEvent ) {
		keyBoardEvent.preventDefault ( );
		keyBoardEvent.stopPropagation ( );
	}

	/*
	--- onClickItem function ------------------------------------------------------------------------------------------

	Mouse click event listener

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnClickItem ( event ) {
		event.stopPropagation ( );
		if ( myMenuItems[ event.target.menuItem ].param ) {
			myMenuItems[ event.target.menuItem ].action.call (
				myMenuItems[ event.target.menuItem ].context,
				myMenuItems[ event.target.menuItem ].param,
				ourOriginalEvent
			);
		}
		else {
			myMenuItems[ event.target.menuItem ].action.call (
				myMenuItems[ event.target.menuItem ].context,
				ourOriginalEvent
			);
		}
		myOnCloseMenu ( );
	}

	/*
	--- myBuildContainer function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myBuildContainer ( ) {
		ourContainer = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ContextMenu-Container',
				className : 'TravelNotes-ContextMenu-Container'
			},
			myBody
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

	/*
	--- myAddCloseButton function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddCloseButton ( ) {
		myHTMLElementsFactory.create (
			'div',
			{
				innerHTML : '&#x274c',
				className : 'TravelNotes-ContextMenu-CloseButton',
				title : theTranslator.getText ( 'ContextMenu - Close' )
			},
			ourContainer
		)
			.addEventListener ( 'click', myOnCloseMenu, false );
	}

	/*
	--- myMoveContainer function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myMoveContainer ( ) {

		// a dummy div is created to find the screen width and height
		let dummyDiv = myHTMLElementsFactory.create ( 'div', { className : 'TravelNotes-ContextMenu-Panel' }, myBody );
		let screenWidth = dummyDiv.clientWidth;
		let screenHeight = dummyDiv.clientHeight;
		myBody.removeChild ( dummyDiv );

		// the menu is positionned ( = top left where the user have clicked but the menu must be completely in the window...
		let menuTop = Math.min ( ourOriginalEvent.originalEvent.clientY, screenHeight - ourContainer.clientHeight - 20 );
		let menuLeft = Math.min ( ourOriginalEvent.originalEvent.clientX, screenWidth - ourContainer.clientWidth - 20 );
		ourContainer.setAttribute ( 'style', 'top:' + menuTop + 'px;left:' + menuLeft +'px;' );
	}

	/*
	--- myAddKeyboardEvents function ----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddKeyboardEvents ( ) {
		document.addEventListener ( 'keydown', myOnKeyDown, true );
		document.addEventListener ( 'keypress', myOnKeyPress, true );
		document.addEventListener ( 'keyup', myOnKeyUp, true );
	}

	/*
	--- myAddMenuItems function ----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddMenuItems ( ) {
		let menuItemCounter = 0;
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

	/*
	--- myShow function -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myShow ( ) {

		ourOriginalEvent = originalEvent;

		// when clicking on a leaflet polyline, a route event AND a map event are generated
		// with the same latlng. We compare positions and returns when latlng are equals
		// to avoid a map menu on top of the route menu

		if  ( ( ourOriginalEvent.latlng.lat === ourLat ) && ( ourOriginalEvent.latlng.lng === ourLng ) ) {
			return;
		}
		else {
			ourLat = ourOriginalEvent.latlng.lat;
			ourLng = ourOriginalEvent.latlng.lng;
		}

		if ( ourContainer ) {

			// the menu is already opened, so we suppose the user will close the menu by clicking outside...
			myOnCloseMenu ( );
			return;
		}

		myBuildContainer ( );
		myAddCloseButton ( );
		myAddMenuItems ( );
		myMoveContainer ( );
		myAddKeyboardEvents ( );
	}

	function myInit ( menuItems ) {
		myMenuItems = menuItems;

		// completely crazy...
		delete myBaseContextMenu.init;
	}

	/*
	--- BaseContextMenu object ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	let myBaseContextMenu = {
		init : ( menuItems ) => myInit ( menuItems ),
		show : ( ) => myShow ( )
	};

	return myBaseContextMenu;
}

/*
--- End of BaseContextMenu.js file ------------------------------------------------------------------------------------
*/