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

import { g_Config } from '../data/Config.js';
import { g_Translator } from '../UI/Translator.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

let s_Container = null;
let s_TimerId = null;
let s_FocusIsOnItem = 0;
let s_OriginalEvent = null;
let s_Lat = 0;
let s_Lng = 0;

/*
--- newBaseContextMenu function ---------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newBaseContextMenu ( originalEvent ) {
	
	let s_MenuItems = [];
	
	let m_htmlElementsFactory = newHTMLElementsFactory ( ) ;
	let m_Body = document.getElementsByTagName ('body') [ 0 ];
		
	/*
	--- m_OnCloseMenu function ----------------------------------------------------------------------------------------

	event listener for the close button. Alson called from others events

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnCloseMenu ( ) {
		
		if ( s_TimerId ) {
			clearTimeout ( s_TimerId );
			s_TimerId = null;
		}
		
		// removing event listeners
		document.removeEventListener ( 'keydown', m_OnKeyDown, true );
		document.removeEventListener ( 'keypress', m_OnKeyPress, true );
		document.removeEventListener ( 'keyup', m_OnKeyUp, true );
		
		// removing menu items
		let childNodes = s_Container.childNodes;
		childNodes [ 0 ].firstChild.removeEventListener ( 'click', m_OnCloseMenu, false );
		for ( let childNodesCounter = 1; childNodesCounter < childNodes.length; childNodesCounter ++ ) {
			childNodes [ childNodesCounter ].firstChild.removeEventListener ( 'click', m_OnClickItem, false );
		}

		// removing the menu container
		document.getElementsByTagName ('body') [ 0 ].removeChild ( s_Container );
		s_Container = null;
		s_FocusIsOnItem = 0;
		s_MenuItems = [];
		s_Lat = 0;
		s_Lng = 0;
	}
	
	/*
	--- m_OnKeyDown function ------------------------------------------------------------------------------------------

	Keyboard event listener

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnKeyDown ( keyBoardEvent ) {
		
		if ( s_Container ) {
			keyBoardEvent.preventDefault ( );
			keyBoardEvent.stopPropagation ( );
		}
		if ( 'Escape' === keyBoardEvent.key || 'Esc' === keyBoardEvent.key ) {
			m_OnCloseMenu ( );
		}
		if ( 'ArrowDown' === keyBoardEvent.key  || 'ArrowRight' === keyBoardEvent.key  ||  'Tab' === keyBoardEvent.key ){
			s_FocusIsOnItem = s_FocusIsOnItem >= s_MenuItems.length ? 1 : ++ s_FocusIsOnItem;
			s_Container.childNodes [ s_FocusIsOnItem ].firstChild.focus ( );
		}
		if ( 'ArrowUp' === keyBoardEvent.key  || 'ArrowLeft' === keyBoardEvent.key ){
			s_FocusIsOnItem = s_FocusIsOnItem <= 1 ? s_MenuItems.length : -- s_FocusIsOnItem;
			s_Container.childNodes [ s_FocusIsOnItem ].firstChild.focus ( );
		}
		if ( 'Home' === keyBoardEvent.key ) {
			s_FocusIsOnItem = 1;
			s_Container.childNodes [ s_FocusIsOnItem ].firstChild.focus ( );
		}
		if ( 'End' === keyBoardEvent.key ) {
			s_FocusIsOnItem = s_MenuItems.length;
			s_Container.childNodes [ s_FocusIsOnItem ].firstChild.focus ( );
		}
		if ( ( 'Enter' === keyBoardEvent.key )  && ( s_FocusIsOnItem > 0 ) && ( s_MenuItems[ s_FocusIsOnItem -1 ].action ) ) {
			s_Container.childNodes[ s_FocusIsOnItem ].firstChild.click ( );
		}
	}

	/*
	--- m_OnKeyPress function -----------------------------------------------------------------------------------------

	Keyboard event listener

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnKeyPress ( keyBoardEvent ) {
		keyBoardEvent.preventDefault ( );
		keyBoardEvent.stopPropagation ( );
	}

	/*
	--- m_OnKeyUp function --------------------------------------------------------------------------------------------

	Keyboard event listener

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnKeyUp ( keyBoardEvent ) {
		keyBoardEvent.preventDefault ( );
		keyBoardEvent.stopPropagation ( );
	}

	/*
	--- onClickItem function ------------------------------------------------------------------------------------------

	Mouse click event listener

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnClickItem ( event ) {
		event.stopPropagation ( );
		if ( s_MenuItems[ event.target.menuItem ].param ) {
			s_MenuItems[ event.target.menuItem ].action.call ( 
				s_MenuItems[ event.target.menuItem ].context,
				s_MenuItems[ event.target.menuItem ].param,
				s_OriginalEvent
			);
		}
		else {
			s_MenuItems[ event.target.menuItem ].action.call ( 
				s_MenuItems[ event.target.menuItem ].context,
				s_OriginalEvent
			);
		}
		m_OnCloseMenu ( );
	}
	
	/*
	--- m_BuildContainer function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_BuildContainer ( ) {
		s_Container = m_htmlElementsFactory.create ( 'div', { id : 'TravelNotes-ContextMenu-Container', className : 'TravelNotes-ContextMenu-Container'}, m_Body );
		// Events are created to clear or add a timer when the mouse leave or enter in the container
		s_Container.addEventListener ( 
			'mouseenter',
			( ) => { 
				if ( s_TimerId ) {
					clearTimeout ( s_TimerId );
					s_TimerId = null;
				}
			},
			false
		);
		s_Container.addEventListener ( 'mouseleave', function ( ) { s_TimerId = setTimeout ( m_OnCloseMenu, g_Config.contextMenu.timeout ); }, false );
		
	}

	/*
	--- m_AddCloseButton function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_AddCloseButton ( ) {
		m_htmlElementsFactory.create ( 
			'div',
			{ 
				innerHTML: '&#x274c', 
				className : 'TravelNotes-ContextMenu-CloseButton',
				title : g_Translator.getText ( "ContextMenu - Close" )
			},
			s_Container
		)
			.addEventListener ( 'click', m_OnCloseMenu, false );
	}

	/*
	--- m_MoveContainer function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_MoveContainer ( ) {
		// a dummy div is created to find the screen width and height
		let dummyDiv = m_htmlElementsFactory.create ( 'div', { className : 'TravelNotes-ContextMenu-Panel'}, m_Body );
		let screenWidth = dummyDiv.clientWidth;
		let screenHeight = dummyDiv.clientHeight;
		m_Body.removeChild ( dummyDiv );
		
		// the menu is positionned ( = top left where the user have clicked but the menu must be completely in the window...
		let menuTop = Math.min ( s_OriginalEvent.originalEvent.clientY, screenHeight - s_Container.clientHeight - 20 );
		let menuLeft = Math.min ( s_OriginalEvent.originalEvent.clientX, screenWidth - s_Container.clientWidth - 20 );
		s_Container.setAttribute ( "style", "top:" + menuTop + "px;left:" + menuLeft +"px;" );
	}
	
	/*
	--- m_AddKeyboardEvents function ----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_AddKeyboardEvents ( ) {
		document.addEventListener ( 'keydown', m_OnKeyDown, true );
		document.addEventListener ( 'keypress', m_OnKeyPress, true );
		document.addEventListener ( 'keyup', m_OnKeyUp, true );
	}
	
	/*
	--- m_AddMenuItems function ----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_AddMenuItems ( ) {
		let menuItemCounter = 0;
		s_MenuItems.forEach ( 
			menuItem => {
				let itemContainer = m_htmlElementsFactory.create ( 'div', { className : 'TravelNotes-ContextMenu-ItemContainer'}, s_Container);
				let itemButton = m_htmlElementsFactory.create ( 
					'button', 
					{ 
						innerHTML : menuItem.name,
						id : 'TravelNotes-ContextMenu-Item' + menuItemCounter,
						className : menuItem.action ? 'TravelNotes-ContextMenu-Item' : 'TravelNotes-ContextMenu-Item TravelNotes-ContextMenu-ItemDisabled'
					},
					itemContainer
				);
				if ( menuItem.action ) {
					itemButton.addEventListener ( 'click', m_OnClickItem, false );
				}
				itemButton.menuItem = menuItemCounter;
				++ menuItemCounter;
			}
		);
	}
	
	/*
	--- m_Show function -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Show ( ) {
		
		s_OriginalEvent = originalEvent; 
		
		// when clicking on a leaflet polyline, a route event AND a map event are generated
		// with the same latlng. We compare positions and returns when latlng are equals
		// to avoid a map menu on top of the route menu
		
		if  ( ( s_OriginalEvent.latlng.lat === s_Lat ) && ( s_OriginalEvent.latlng.lng === s_Lng ) ) {
			return;
		}
		else {
			s_Lat = s_OriginalEvent.latlng.lat;
			s_Lng = s_OriginalEvent.latlng.lng;
		}
		
		if ( s_Container ) {
		// the menu is already opened, so we suppose the user will close the menu by clicking outside...
			m_OnCloseMenu ( );
			return;
		}

		m_BuildContainer ( );
		m_AddCloseButton ( );
		m_AddMenuItems ( );
		m_MoveContainer ( );	
		m_AddKeyboardEvents ( );
	}

	function m_init ( menuItems ) {
		s_MenuItems = menuItems; 
		// completely crazy...
		delete m_BaseContextMenu.init;
	}
	
	/*
	--- BaseContextMenu object ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	let m_BaseContextMenu = {
		init : ( menuItems ) => m_init ( menuItems ),
		show : ( ) => m_Show ( )
	};

	return m_BaseContextMenu;
}

/*
--- End of BaseContextMenu.js file ------------------------------------------------------------------------------------
*/		