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

import theTravelNotesData from '../data/TravelNotesData.js';
import theTranslator from '../UI/Translator.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theConfig from '../data/Config.js';
import { NOT_FOUND, ZERO, ONE, TWO } from '../util/Constants.js';

const OUR_MENU_MARGIN = 20;

class KeydownKeyboardEventListener {

	#menuOperator = null;

	constructor ( menuOperator ) {
		this.#menuOperator = menuOperator;
	}

	destructor ( ) {
		this.#menuOperator = null;
	}

	handleEvent ( keydownEvent ) {
		switch ( keydownEvent.key ) {
		case 'Escape' :
		case 'Esc' :
			keydownEvent.stopPropagation ( );
			this.#menuOperator.onCancelMenu ( );
			break;
		case 'ArrowDown' :
		case 'ArrowRight' :
		case 'Tab' :
			keydownEvent.stopPropagation ( );
			this.#menuOperator.changeKeyboardSelectedItem ( ONE );
			break;
		case 'ArrowUp' :
		case 'ArrowLeft' :
			keydownEvent.stopPropagation ( );
			this.#menuOperator.changeKeyboardSelectedItem ( NOT_FOUND );
			break;
		case 'Home' :
			keydownEvent.stopPropagation ( );
			this.#menuOperator.changeKeyboardSelectedItem ( ZERO );
			break;
		case 'End' :
			keydownEvent.stopPropagation ( );
			this.#menuOperator.changeKeyboardSelectedItem ( TWO );
			break;
		case 'Enter' :
			keydownEvent.stopPropagation ( );
			this.#menuOperator.selectKeyboardItem ( );
			break;
		default :
			break;
		}
	}
}

class MouseClickCancelButtonEventListener {

	#menuOperator = null;

	constructor ( menuOperator ) {
		this.#menuOperator = menuOperator;
	}

	destructor ( ) {
		this.#menuOperator = null;
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		this.#menuOperator.onCancelMenu ( );
	}
}

class MouseLeaveMenuItemEventListener {

	#menuOperator = null;

	constructor ( menuOperator ) {
		this.#menuOperator = menuOperator;
	}

	destructor ( ) {
		this.#menuOperator = null;
	}

	handleEvent ( mouseLeaveEvent ) {
		this.#menuOperator.onMouseLeaveMenuItem ( mouseLeaveEvent.target );
	}
}

class MouseEnterMenuItemEventListener {

	#menuOperator = null;

	constructor ( menuOperator ) {
		this.#menuOperator = menuOperator;
	}

	destructor ( ) {
		this.#menuOperator = null;
	}

	handleEvent ( mouseEnterEvent ) {
		this.#menuOperator.onMouseEnterMenuItem ( mouseEnterEvent.target );
	}
}

class ClickMenuItemEventListener {

	#menuOperator = null;

	constructor ( menuOperator ) {
		this.#menuOperator = menuOperator;
	}

	destructor ( ) {
		this.#menuOperator = null;
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		this.#menuOperator.selectItem ( Number.parseInt ( clickEvent.target.dataset.tanObjId ) );
	}
}

class MouseLeaveContainerEventListener {

	#menuOperator = null;

	constructor ( menuOperator ) {
		this.#menuOperator = menuOperator;
	}

	destructor ( ) {
		this.#menuOperator = null;
	}

	handleEvent ( mouseLeaveEvent ) {
		mouseLeaveEvent.stopPropagation ( );
		this.#menuOperator.onMouseLeaveContainer ( );
	}
}

class MouseEnterContainerEventListener {

	#menuOperator = null;

	constructor ( menuOperator ) {
		this.#menuOperator = menuOperator;
	}

	destructor ( ) {
		this.#menuOperator = null;
	}

	handleEvent ( mouseEnterEvent ) {
		mouseEnterEvent.stopPropagation ( );
		this.#menuOperator.onMouseEnterContainer ( );
	}
}

class MenuOperator {

	#contextMenu = null;

	#eventListeners = {
		onKeydownKeyboard : null,
		onMouseLeaveContainer : null,
		onMouseEnterContainer : null,
		onMouseClickCancelButton : null,
		onClickMenuItem : null,
		onMouseLeaveMenuItem : null,
		onMouseEnterMenuItem : null
	};

	#keyboardSelectedItem = NOT_FOUND;

	#timerId = null;

	constructor ( contextMenu ) {
		this.#contextMenu = contextMenu;

		this.#eventListeners.onKeydownKeyboard = new KeydownKeyboardEventListener ( this );
		this.#eventListeners.onMouseLeaveContainer = new MouseLeaveContainerEventListener ( this );
		this.#eventListeners.onMouseEnterContainer = new MouseEnterContainerEventListener ( this );
		this.#eventListeners.onMouseClickCancelButton = new MouseClickCancelButtonEventListener ( this );
		this.#eventListeners.onClickMenuItem = new ClickMenuItemEventListener ( this );
		this.#eventListeners.onMouseLeaveMenuItem = new MouseLeaveMenuItemEventListener ( this );
		this.#eventListeners.onMouseEnterMenuItem = new MouseEnterMenuItemEventListener ( this );
		document.addEventListener ( 'keydown', this.#eventListeners.onKeydownKeyboard, true );
		this.#contextMenu.htmlElements.container.addEventListener ( 'mouseleave', this.#eventListeners.onMouseLeaveContainer );
		this.#contextMenu.htmlElements.container.addEventListener ( 'mouseenter', this.#eventListeners.onMouseEnterContainer );
		this.#contextMenu.htmlElements.cancelButton.addEventListener ( 'click', this.#eventListeners.onMouseClickCancelButton );
		this.#contextMenu.htmlElements.menuItemHTMLElements.forEach (
			menuItemHTMLElement => {
				menuItemHTMLElement.addEventListener ( 'click', this.#eventListeners.onClickMenuItem );
				menuItemHTMLElement.addEventListener ( 'mouseleave', this.#eventListeners.onMouseLeaveMenuItem );
				menuItemHTMLElement.addEventListener ( 'mouseenter', this.#eventListeners.onMouseEnterMenuItem );
			}
		);
	}

	destructor ( ) {
		document.removeEventListener ( 'keydown', this.#eventListeners.onKeydownKeyboard, true );
		if ( this.#timerId ) {
			clearTimeout ( this.#timerId );
			this.#timerId = null;
		}
		this.#contextMenu.htmlElements.container.removeEventListener (
			'mouseleave',
			this.#eventListeners.onMouseLeaveContainer
		);
		this.#contextMenu.htmlElements.container.removeEventListener (
			'mouseenter',
			this.#eventListeners.onMouseEnterContainer
		);
		this.#contextMenu.htmlElements.cancelButton.removeEventListener (
			'click',
			this.#eventListeners.onMouseClickCancelButton
		);
		this.#contextMenu.htmlElements.menuItemHTMLElements.forEach (
			menuItemHTMLElement => {
				menuItemHTMLElement.removeEventListener ( 'click', this.#eventListeners.onClickMenuItem );
				menuItemHTMLElement.removeEventListener ( 'mouseleave', this.#eventListeners.onMouseLeaveMenuItem );
				menuItemHTMLElement.removeEventListener ( 'mouseenter', this.#eventListeners.onMouseEnterMenuItem );
			}
		);
		for ( const eventListenerName in this.#eventListeners ) {
			this.#eventListeners [ eventListenerName ].destructor ( );
		}
		this.#contextMenu.htmlElements.parentNode.removeChild ( this.#contextMenu.htmlElements.container );
		this.#contextMenu = null;
	}

	onMouseLeaveContainer ( ) {
		this.#timerId = setTimeout (
			( ) => { this.onCancelMenu ( ); },
			theConfig.contextMenu.timeout
		);
	}

	onMouseEnterContainer ( ) {
		if ( this.#timerId ) {
			clearTimeout ( this.#timerId );
			this.#timerId = null;
		}
	}

	changeKeyboardSelectedItem ( changeValue ) {
		if ( this.#keyboardSelectedItem !== NOT_FOUND ) {
			this.#contextMenu.htmlElements.menuItemHTMLElements [ this.#keyboardSelectedItem ]
				.classList.remove ( 'TravelNotes-ContextMenu-ItemSelected' );
		}
		switch ( changeValue ) {
		case NOT_FOUND :
		case ONE :
			this.#keyboardSelectedItem += changeValue;
			if ( NOT_FOUND === this.#keyboardSelectedItem ) {
				this.#keyboardSelectedItem = this.#contextMenu.htmlElements.menuItemHTMLElements.length - ONE;
			}
			if ( this.#contextMenu.htmlElements.menuItemHTMLElements.length === this.#keyboardSelectedItem ) {
				this.#keyboardSelectedItem = ZERO;
			}
			break;
		case ZERO :
			this.#keyboardSelectedItem = ZERO;
			break;
		default :
			this.#keyboardSelectedItem = this.#contextMenu.htmlElements.menuItemHTMLElements.length - ONE;
			break;
		}
		this.#contextMenu.htmlElements.menuItemHTMLElements [ this.#keyboardSelectedItem ]
			.classList.add ( 'TravelNotes-ContextMenu-ItemSelected' );
	}

	selectKeyboardItem ( ) {
		if (
			( NOT_FOUND === this.#keyboardSelectedItem )
			||
			( this.#contextMenu.htmlElements.menuItemHTMLElements [ this.#keyboardSelectedItem ]
				.classList.contains ( 'TravelNotes-ContextMenu-ItemDisabled' )
			)
		) {
			return;
		}
		this.#contextMenu.onOk ( this.#keyboardSelectedItem );
	}

	onCancelMenu ( ) {
		this.#contextMenu.onCancel ( 'Canceled by user' );
	}

	selectItem ( itemObjId ) {
		if (
			this.#contextMenu.htmlElements.menuItemHTMLElements [ itemObjId ]
				.classList.contains ( 'TravelNotes-ContextMenu-ItemDisabled' )
		) {
			return;
		}
		this.#contextMenu.onOk ( itemObjId );
	}

	onMouseLeaveMenuItem ( menuItem ) {
		menuItem.classList.remove ( 'TravelNotes-ContextMenu-ItemSelected' );
	}

	onMouseEnterMenuItem ( menuItem ) {
		menuItem.classList.add ( 'TravelNotes-ContextMenu-ItemSelected' );
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

	static container = null;

	#onPromiseOk = null;
	#onPromiseError = null;

	#htmlElements = {
		parentNode : null,
		container : null,
		cancelButton : null,
		menuItemHTMLElements : []
	};

	#contextMenuEvent = null;
	#haveParentDiv = false;
	#menuOperator = null;

	/**
	Build the menu container and add event listeners
	@private
	*/

	#createContainer ( ) {
		this.#htmlElements.container = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ContextMenu-Container',
				className : 'TravelNotes-ContextMenu-Container'
			},
			this.#htmlElements.parentNode
		);
	}

	/**
	Add the close button and it's event listener to the menu
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

	#moveContainer ( ) {

		// Searching the screen width and height
		let screenWidth = theTravelNotesData.map.getContainer ( ).clientWidth;
		let screenHeight = theTravelNotesData.map.getContainer ( ).clientHeight;

		// the menu is positionned ( = top left where the user have clicked but the menu must be completely in the window...
		let menuTop = Math.min (
			this.#contextMenuEvent.originalEvent.clientY,
			screenHeight - this.#htmlElements.container.clientHeight - OUR_MENU_MARGIN
		);
		let menuLeft = Math.min (
			this.#contextMenuEvent.originalEvent.clientX,
			screenWidth - this.#htmlElements.container.clientWidth - OUR_MENU_MARGIN
		);
		this.#htmlElements.container.style.top = String ( menuTop ) + 'px';
		if ( this.#haveParentDiv ) {
			this.#htmlElements.container.style.right = String ( OUR_MENU_MARGIN ) + 'px';
		}
		else {
			this.#htmlElements.container.style.left = String ( menuLeft ) + 'px';
		}
	}

	#show ( onOk, onError ) {
		this.#onPromiseOk = onOk;
		this.#onPromiseError = onError;
		this.#createContainer ( );
		this.#createCancelButton ( );
		this.#createMenuItemsHTMLElements ( );
		this.#moveContainer ( );
		this.#menuOperator = new MenuOperator ( this );

	}

	onOk ( selectedItem ) {
		this.#menuOperator.destructor ( );
		BaseContextMenu.container = null;
		this.#onPromiseOk ( selectedItem );
	}

	onCancel ( ) {
		this.#menuOperator.destructor ( );
		BaseContextMenu.container = null;
		this.#onPromiseError ( );
	}

	show ( ) {
		if ( ! BaseContextMenu.container ) {
			return;
		}
		new Promise (
			( onOk, onError ) => { this.#show ( onOk, onError ); }
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

	constructor ( contextMenuEvent, parentNode ) {

		if ( BaseContextMenu.container ) {

			// the menu is already opened, so we suppose the user will close the menu by clicking outside...
			BaseContextMenu.container.onCancel ( );
			return;
		}

		this.#contextMenuEvent = contextMenuEvent;
		this.#htmlElements.parentNode = parentNode || document.body;
		this.#haveParentDiv = null !== parentNode;

		BaseContextMenu.container = this;

	}

	get menuItems ( ) { return []; }

	get htmlElements ( ) { return this.#htmlElements; }

}

export default BaseContextMenu;

/**
--- End of BaseContextMenu.js file --------------------------------------------------------------------------------------------
*/