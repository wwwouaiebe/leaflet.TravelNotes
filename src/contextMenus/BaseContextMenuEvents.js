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
Doc reviewed ...
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file BaseContextMenuEvents.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module BaseContextMenuEvents
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import { INVALID_OBJ_ID, ZERO, ONE } from '../util/Constants.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class BaseContextMenuEvents
@classdesc This class contains the static methods and variables needed for the BaseContextMenu class
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class BaseContextMenuEvents {

	/**
	Last item objId
	*/

	static lastItemObjId = INVALID_OBJ_ID;

	/**
	The HTMLElement in with the menu is located
	*/

	static container = null;

	/**
	The parentNode of the container
	*/

	static parentDiv = null;

	/**
	A reference to the contextMenu Object
	*/

	static contextMenu = null;

	/**
	The objId of the item that have the keyboard focus
	@private
	*/

	static #keyboardFocusIsOnItem = INVALID_OBJ_ID;

	/**
	The objId of the item that have the mouse focus
	@private
	*/

	static #mouseFocusIsOnItem = INVALID_OBJ_ID;

	/**
	The objId of the item that have the focus
	@private
	*/

	static #currentFocusItem = INVALID_OBJ_ID;

	/**
	The timerId of the timer used by the mouseleave event listener
	@private
	*/

	static #timerId = null;

	/**
	Reset the static variables and timer
	*/

	static reset ( ) {
		BaseContextMenuEvents.#keyboardFocusIsOnItem = INVALID_OBJ_ID;
		BaseContextMenuEvents.#mouseFocusIsOnItem = INVALID_OBJ_ID;
		BaseContextMenuEvents.#currentFocusItem = INVALID_OBJ_ID;
		BaseContextMenuEvents.lastItemObjId = INVALID_OBJ_ID;
		BaseContextMenuEvents.container = null;
		if ( BaseContextMenuEvents.#timerId ) {
			clearTimeout ( BaseContextMenuEvents.#timerId );
			BaseContextMenuEvents.#timerId = null;
		}
		BaseContextMenuEvents.parentDiv = null;
		BaseContextMenuEvents.contextMenu = null;

		// removing event listeners
		document.removeEventListener ( 'keydown', BaseContextMenuEvents.onKeyDown, true );
	}

	/**
	Hightlight the item selected by the mouse or the keyboard
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

	/*
	Keyboard events listeners must be 'module global' otherwise the events are not removed when
	closing the menu by clicking outside the menu (in this case the event listeners are duplicated
	in each instance of the menu and so, it's not the same function that is passed to addEventListener
	and removeEventListener). If keyboard event listeners are not removed, keyboard is unavailable
	for others elements. See issue ♯83
	*/

	/**
	Keyboard event listener
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
						BaseContextMenuEvents.lastItemObjId === BaseContextMenuEvents.#keyboardFocusIsOnItem
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
							BaseContextMenuEvents.lastItemObjId
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
				BaseContextMenuEvents.#keyboardFocusIsOnItem = BaseContextMenuEvents.lastItemObjId;
				BaseContextMenuEvents.#setFocusOnItem ( true );
			}
			else if (
				( 'Enter' === keyBoardEvent.key )
					&&
					( BaseContextMenuEvents.#keyboardFocusIsOnItem >= ZERO )
					&&
					( BaseContextMenuEvents.contextMenu.itemHaveAction ( BaseContextMenuEvents.#keyboardFocusIsOnItem ) )
			) {
				keyBoardEvent.stopPropagation ( );
				BaseContextMenuEvents.#setFocusOnItem ( true );
				BaseContextMenuEvents.contextMenu.onSelectedItem ( BaseContextMenuEvents.#keyboardFocusIsOnItem );
				BaseContextMenuEvents.onCloseMenu ( );
			}
		}
	}

	/**
	This method close the menu
	*/

	static onCloseMenu ( ) {

		// removing the menu container
		BaseContextMenuEvents.parentDiv.removeChild ( BaseContextMenuEvents.container );

		// reset global vars
		BaseContextMenuEvents.reset ( );
	}

	/**
	Click event listener for the items
	*/

	static onClickItem ( clickEvent ) {
		clickEvent.stopPropagation ( );
		BaseContextMenuEvents.contextMenu.onSelectedItem ( clickEvent.target.objId );
		BaseContextMenuEvents.onCloseMenu ( );
	}

	/**
	Mouse enter event listener for the items
	*/

	static onMouseEnterMenuItem ( mouseEnterEvent ) {
		BaseContextMenuEvents.#mouseFocusIsOnItem = mouseEnterEvent.target.objId;
		BaseContextMenuEvents.#setFocusOnItem ( false );
	}

	/**
	Mouse enter event listener for the container
	*/

	static onMouseEnterContainer ( ) {
		if ( BaseContextMenuEvents.#timerId ) {
			clearTimeout ( BaseContextMenuEvents.#timerId );
			BaseContextMenuEvents.#timerId = null;
		}
	}

	/**
	Mouse leave event listener for the container
	*/

	static onMouseLeaveContainer ( ) {
		BaseContextMenuEvents.#timerId = setTimeout ( BaseContextMenuEvents.onCloseMenu, theConfig.contextMenu.timeout );
	}
}

export default BaseContextMenuEvents;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of BaseContextMenuEvents.js file

@------------------------------------------------------------------------------------------------------------------------------
*/