/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

( function ( ){
	
	'use strict';
	
	var _Translator = require ( './Translator' ) ( );
	var _MenuItems = [];
	var _ContextMenuContainer = null;
	var _OriginalEvent = null;
	var _FocusIsOnItem = 0;
	var _Lat = 0;
	var _Lng = 0;
	
	var onCloseMenu = function ( ) {
		document.removeEventListener ( 'keydown', onKeyDown, true );
		document.removeEventListener ( 'keypress', onKeyPress, true );
		document.removeEventListener ( 'keyup', onKeyUp, true );
		var childNodes = _ContextMenuContainer.childNodes;
		childNodes [ 0 ].firstChild.removeEventListener ( 'click', onCloseMenu, false );
		for ( var childNodesCounter = 1; childNodesCounter < childNodes.length; childNodesCounter ++ ) {
			childNodes [ childNodesCounter ].firstChild.removeEventListener ( 'click', onCloseMenu, false );
		}
		
		document.getElementsByTagName('body') [0].removeChild ( _ContextMenuContainer );
		_ContextMenuContainer = null;
	};
	
	var onKeyDown = function ( keyBoardEvent ) {
		if ( _ContextMenuContainer ) {
			keyBoardEvent.preventDefault ( );
			keyBoardEvent.stopPropagation ( );
		}
		if ( 'Escape' === keyBoardEvent.key || 'Esc' === keyBoardEvent.key ) {
			onCloseMenu ( );
		}
		if ( 'ArrowDown' === keyBoardEvent.key  || 'ArrowRight' === keyBoardEvent.key  ||  'Tab' === keyBoardEvent.key ){
			_FocusIsOnItem ++;
			if ( _FocusIsOnItem > _MenuItems.length ) {
				_FocusIsOnItem = 1;
			}
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus( );
		}
		if ( 'ArrowUp' === keyBoardEvent.key  || 'ArrowLeft' === keyBoardEvent.key ){
			_FocusIsOnItem --;
			if ( _FocusIsOnItem < 1 ) {
				_FocusIsOnItem = _MenuItems.length;
			}
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus( );
		}
		if ( 'Home' === keyBoardEvent.key ) {
			_FocusIsOnItem = 1;
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus( );
		}
		if ( 'End' === keyBoardEvent.key ) {
			_FocusIsOnItem = _MenuItems.length;
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus( );
		}
		if ( ( 'Enter' === keyBoardEvent.key )  && ( _FocusIsOnItem > 0 ) && ( _MenuItems[ _FocusIsOnItem - 1 ].action ) ) {
			_MenuItems[ _FocusIsOnItem - 1 ].action ( );
			onCloseMenu ( );
		}
			
	};
	
	var onKeyPress = function ( keyBoardEvent ) {
		keyBoardEvent.preventDefault ( );
		keyBoardEvent.stopPropagation ( );
	};
	
	var onKeyUp = function ( keyBoardEvent ) {
		keyBoardEvent.preventDefault ( );
		keyBoardEvent.stopPropagation ( );
	};

	var onClickItem = function ( event ) {
		event.stopPropagation ( );
		_MenuItems[ event.target.menuItem ].action.call ( 
			_MenuItems[ event.target.menuItem ].context,
			_MenuItems[ event.target.menuItem ].param ? _MenuItems[ event.target.menuItem ].param : _OriginalEvent
		);
		_Lat = 0;
		_Lng = 0;
		onCloseMenu ( );
	};
	
	var getContextMenu = function ( event, userMenu ) {

	// stopPropagation ( ) and preventDefault ( ) are not working correctly on leaflet events, so the event continue...
	// to avoid the menu close directly, we compare the lat and lng of the event with the lat and lng of the previous event
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
		
		if ( _ContextMenuContainer ) {
			onCloseMenu ( );
			return;
		}
		_MenuItems = userMenu;
			
		//ContextMenu-Container
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		var body = document.getElementsByTagName('body') [0];
		var tmpDiv = htmlElementsFactory.create ( 'div', { className : 'ContextMenu-Panel'} , body );
		var screenWidth = tmpDiv.clientWidth;
		var screenHeight = tmpDiv.clientHeight;
		body.removeChild ( tmpDiv );
		
		_ContextMenuContainer = htmlElementsFactory.create ( 'div', { id : 'ContextMenu-Container',className : 'ContextMenu-Container'}, body );
		
		var closeButton = htmlElementsFactory.create ( 
			'div',
			{ 
				innerHTML: '&#x274c', 
				className : 'ContextMenu-CloseButton',
				title : _Translator.getText ( "ContextMenu - close" )
			},
			_ContextMenuContainer
		);
		closeButton.addEventListener ( 'click', onCloseMenu, false );
		
		for ( var menuItemCounter = 0; menuItemCounter < _MenuItems.length; menuItemCounter ++ ) {
			var itemContainer = htmlElementsFactory.create ( 'div', { className : 'ContextMenu-ItemContainer'},_ContextMenuContainer);
			var item = htmlElementsFactory.create ( 
				'button', 
				{ 
					innerHTML : _MenuItems [ menuItemCounter ].name,
					id : 'ContextMenu-Item' + menuItemCounter,
					className : _MenuItems [ menuItemCounter ].action ? 'ContextMenu-Item' : 'ContextMenu-Item ContextMenu-ItemDisabled'
				},
				itemContainer
			);
			if ( _MenuItems [ menuItemCounter ].action ) {
				item.addEventListener ( 'click', onClickItem, false );
			}
			item.menuItem = menuItemCounter;
		}
		
		var menuTop = Math.min ( event.originalEvent.clientY, screenHeight - _ContextMenuContainer.clientHeight - 20 );
		var menuLeft = Math.min ( event.originalEvent.clientX, screenWidth - _ContextMenuContainer.clientWidth - 20 );
		_ContextMenuContainer.setAttribute ( "style", "top:" + menuTop + "px;left:" + menuLeft +"px;" );
		document.addEventListener ( 'keydown', onKeyDown, true );
		document.addEventListener ( 'keypress', onKeyPress, true );
		document.addEventListener ( 'keyup', onKeyUp, true );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getContextMenu;
	}

}());
