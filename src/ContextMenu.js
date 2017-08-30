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
	
	var _MenuItems = [];
	var _ContextMenuContainer = null;
	var focusIsOnItem = 0;
	
	var function1 = function ( ) { console.log ( 'function1' ); };
	var function2 = function ( ) { console.log ( 'function2' ); };
	var function3 = function ( ) { console.log ( 'function3' ); };

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
			focusIsOnItem ++;
			if ( focusIsOnItem > _MenuItems.length ) {
				focusIsOnItem = 1;
			}
			_ContextMenuContainer.childNodes [ focusIsOnItem ].firstChild.focus( );
		}
		if ( 'ArrowUp' === keyBoardEvent.key  || 'ArrowLeft' === keyBoardEvent.key ){
			focusIsOnItem --;
			if ( focusIsOnItem < 1 ) {
				focusIsOnItem = _MenuItems.length;
			}
			_ContextMenuContainer.childNodes [ focusIsOnItem ].firstChild.focus( );
		}
		if ( 'Home' === keyBoardEvent.key ) {
			focusIsOnItem = 1;
			_ContextMenuContainer.childNodes [ focusIsOnItem ].firstChild.focus( );
		}
		if ( 'End' === keyBoardEvent.key ) {
			focusIsOnItem = _MenuItems.length;
			_ContextMenuContainer.childNodes [ focusIsOnItem ].firstChild.focus( );
		}
		if ( ( 'Enter' === keyBoardEvent.key )  && ( focusIsOnItem > 0 ) && ( _MenuItems[ focusIsOnItem - 1 ].enabled ) ) {
			_MenuItems[ focusIsOnItem - 1 ].action ( );
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
		_MenuItems[ event.target.menuItem ].action ( );
		onCloseMenu ( );
	};
	
	var getContextMenu = function ( event ) {

		if ( _ContextMenuContainer ) {
			onCloseMenu ( );
			return;
		}
		_MenuItems.length = 0;
		
		_MenuItems.push ( { name : "Sélectionner cet endroit comme point de départ", action : function1, enabled : true} );
		_MenuItems.push ( { name : "Sélectionner cet endroit comme point intermédiaire", action : function2, enabled : false} );
		_MenuItems.push ( { name : "Sélectionner cet endroit comme point de fin", action : function3, enabled : true} );
		
		//ContextMenu-Container
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		var body = document.getElementsByTagName('body') [0];
		var tmpDiv = htmlElementsFactory.create ( 'div', { className : 'ContextMenu-Panel'} , body );
		var screenWidth = tmpDiv.clientWidth;
		var screenHeight = tmpDiv.clientHeight;
		body.removeChild ( tmpDiv );
		
		_ContextMenuContainer = htmlElementsFactory.create ( 'div', { id : 'ContextMenu-Container',className : 'ContextMenu-Container'}, body );
		
		var closeButton = htmlElementsFactory.create ( 'div', { innerHTML: '&#x274c', className : 'ContextMenu-CloseButton'},_ContextMenuContainer);
		closeButton.addEventListener ( 'click', onCloseMenu, false );
		
		for ( var menuItemCounter = 0; menuItemCounter < _MenuItems.length; menuItemCounter ++ ) {
			var itemContainer = htmlElementsFactory.create ( 'div', { className : 'ContextMenu-ItemContainer'},_ContextMenuContainer);
			var item = htmlElementsFactory.create ( 
				'button', 
				{ 
					innerHTML : _MenuItems [ menuItemCounter ].name,
					id : 'ContextMenu-Item' + menuItemCounter,
					className : _MenuItems [ menuItemCounter ].enabled ? 'ContextMenu-Item' : 'ContextMenu-Item ContextMenu-ItemDisabled'
				},
				itemContainer
			);
			if ( _MenuItems [ menuItemCounter ].enabled ) {
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
