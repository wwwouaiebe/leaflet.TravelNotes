/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- ContextMenu.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the ContextMenu object
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

'use strict';

export { newContextMenu };

import { g_Config } from '../data/Config.js';
import { g_Translator } from '../UI/Translator.js';

import { newHTMLElementsFactory } from '../UI/HTMLElementsFactory.js';

var _MenuItems = [];
var _ContextMenuContainer = null;
var _OriginalEvent = null;
var _FocusIsOnItem = 0;
var _Lat = 0;
var _Lng = 0;
var _TimerId = null;

/*
--- onCloseMenu function ----------------------------------------------------------------------------------------------

event listener for the close button. Alson called from others events

-----------------------------------------------------------------------------------------------------------------------
*/
	


/*
--- ContextMenu object ------------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

var newContextMenu = function ( event, userMenu ) {
	
	var onCloseMenu = function ( ) {
		
		if ( _TimerId ) {
			clearTimeout ( _TimerId );
			_TimerId = null;
		}
		
		_Lat = 0;
		_Lng = 0;
		
		// removing event listeners
		document.removeEventListener ( 'keydown', onKeyDown, true );
		document.removeEventListener ( 'keypress', onKeyPress, true );
		document.removeEventListener ( 'keyup', onKeyUp, true );
		
		// removing menu items
		var childNodes = _ContextMenuContainer.childNodes;
		childNodes [ 0 ].firstChild.removeEventListener ( 'click', onCloseMenu, false );
		for ( var childNodesCounter = 1; childNodesCounter < childNodes.length; childNodesCounter ++ ) {
			childNodes [ childNodesCounter ].firstChild.removeEventListener ( 'click', onCloseMenu, false );
		}
		
		// removing the menu container
		document.getElementsByTagName('body') [0].removeChild ( _ContextMenuContainer );
		_ContextMenuContainer = null;
		_FocusIsOnItem = 0;
	};

	/*
	--- onKeyDown function --------------------------------------------------------------------------------------------

	Keyboard event listener

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onKeyDown = function ( keyBoardEvent ) {
		
		if ( _ContextMenuContainer ) {
			keyBoardEvent.preventDefault ( );
			keyBoardEvent.stopPropagation ( );
		}
		if ( 'Escape' === keyBoardEvent.key || 'Esc' === keyBoardEvent.key ) {
			onCloseMenu ( );
		}
		if ( 'ArrowDown' === keyBoardEvent.key  || 'ArrowRight' === keyBoardEvent.key  ||  'Tab' === keyBoardEvent.key ){
			_FocusIsOnItem = _FocusIsOnItem >= _MenuItems.length ? 1 : ++ _FocusIsOnItem;
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus ( );
		}
		if ( 'ArrowUp' === keyBoardEvent.key  || 'ArrowLeft' === keyBoardEvent.key ){
			_FocusIsOnItem = _FocusIsOnItem <= 1 ? _MenuItems.length : -- _FocusIsOnItem;
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus ( );
		}
		if ( 'Home' === keyBoardEvent.key ) {
			_FocusIsOnItem = 1;
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus ( );
		}
		if ( 'End' === keyBoardEvent.key ) {
			_FocusIsOnItem = _MenuItems.length;
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus ( );
		}
		if ( ( 'Enter' === keyBoardEvent.key )  && ( _FocusIsOnItem > 0 ) && ( _MenuItems[ _FocusIsOnItem -1 ].action ) ) {
			_ContextMenuContainer.childNodes[ _FocusIsOnItem ].firstChild.click ( );
		}
	};

	/*
	--- onKeyPress function -------------------------------------------------------------------------------------------

	Keyboard event listener

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onKeyPress = function ( keyBoardEvent ) {
		keyBoardEvent.preventDefault ( );
		keyBoardEvent.stopPropagation ( );
	};

	/*
	--- onKeyUp function ----------------------------------------------------------------------------------------------

	Keyboard event listener

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onKeyUp = function ( keyBoardEvent ) {
		keyBoardEvent.preventDefault ( );
		keyBoardEvent.stopPropagation ( );
	};

	/*
	--- onClickItem function ------------------------------------------------------------------------------------------

	Mouse click event listener

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickItem = function ( event ) {
		event.stopPropagation ( );
		if ( _MenuItems[ event.target.menuItem ].param ) {
			_MenuItems[ event.target.menuItem ].action.call ( 
				_MenuItems[ event.target.menuItem ].context,
				_MenuItems[ event.target.menuItem ].param,
				_OriginalEvent
			);
		}
		else {
			_MenuItems[ event.target.menuItem ].action.call ( 
				_MenuItems[ event.target.menuItem ].context,
				_OriginalEvent
			);
		}
		onCloseMenu ( );
	};	
	
	
	
	// stopPropagation ( ) and preventDefault ( ) are not working correctly on leaflet events, so the event continue and bubble.
	// To avoid the menu close directly, we compare the lat and lng of the event with the lat and lng of the previous event
	// and we stop the procedure if equals.
	if  ( ( event.latlng.lat === _Lat ) && ( event.latlng.lng === _Lng ) ) {
		_Lat = 0;
		_Lng = 0;
		return;
	}
	else
	{
		_Lat = event.latlng.lat;
		_Lng = event.latlng.lng;
	}
	
	_OriginalEvent = event; 
	
	// the menu is already opened, so we suppose the user will close the menu by clicking outside...
	if ( _ContextMenuContainer ) {
		onCloseMenu ( );
		return;
	}
	
	_MenuItems = userMenu;
	var body = document.getElementsByTagName('body') [0];
	var htmlElementsFactory = newHTMLElementsFactory ( ) ;
	
	// a dummy div is created to find the screen width and height
	var dummyDiv = htmlElementsFactory.create ( 'div', { className : 'TravelNotes-ContextMenu-Panel'} , body );
	var screenWidth = dummyDiv.clientWidth;
	var screenHeight = dummyDiv.clientHeight;
	body.removeChild ( dummyDiv );
	
	// and then the menu is created
	_ContextMenuContainer = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-ContextMenu-Container',className : 'TravelNotes-ContextMenu-Container'}, body );
	_ContextMenuContainer.addEventListener ( 
		'mouseenter',
		function ( ) { 
			if ( _TimerId ) {
				clearTimeout ( _TimerId );
				_TimerId = null;
			}
		},
		false
	);
	_ContextMenuContainer.addEventListener ( 'mouseleave', function ( ) { _TimerId = setTimeout ( onCloseMenu, g_Config.contextMenu.timeout ); }, false );
	// close button
	var closeButton = htmlElementsFactory.create ( 
		'div',
		{ 
			innerHTML: '&#x274c', 
			className : 'TravelNotes-ContextMenu-CloseButton',
			title : g_Translator.getText ( "ContextMenu - Close" )
		},
		_ContextMenuContainer
	);
	closeButton.addEventListener ( 'click', onCloseMenu, false );

	// items
	var menuItemCounter = 0;
	_MenuItems.forEach ( 
		function ( menuItem ) {
			var itemContainer = htmlElementsFactory.create ( 'div', { className : 'TravelNotes-ContextMenu-ItemContainer'},_ContextMenuContainer);
			var item = htmlElementsFactory.create ( 
				'button', 
				{ 
					innerHTML : menuItem.name,
					id : 'TravelNotes-ContextMenu-Item' + menuItemCounter,
					className : menuItem.action ? 'TravelNotes-ContextMenu-Item' : 'TravelNotes-ContextMenu-Item TravelNotes-ContextMenu-ItemDisabled'
				},
				itemContainer
			);
			if ( menuItem.action ) {
				item.addEventListener ( 'click', onClickItem, false );
			}
			item.menuItem = menuItemCounter;
			++ menuItemCounter;
		}
	);
	
	// the menu is positionned ( = top left where the user have clicked but the menu must be completely in the window...
	var menuTop = Math.min ( event.originalEvent.clientY, screenHeight - _ContextMenuContainer.clientHeight - 20 );
	var menuLeft = Math.min ( event.originalEvent.clientX, screenWidth - _ContextMenuContainer.clientWidth - 20 );
	_ContextMenuContainer.setAttribute ( "style", "top:" + menuTop + "px;left:" + menuLeft +"px;" );
	
	// keyboard event listeners
	document.addEventListener ( 'keydown', onKeyDown, true );
	document.addEventListener ( 'keypress', onKeyPress, true );
	document.addEventListener ( 'keyup', onKeyUp, true );
};

/*
--- End of ContextMenu.js file ----------------------------------------------------------------------------------------
*/	
