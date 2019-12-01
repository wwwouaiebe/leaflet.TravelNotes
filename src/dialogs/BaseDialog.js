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
--- BaseDialog.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the newBaseDialog function
Changes:
	- v1.0.0:
		- created
	- v1.3.0:
		- added the possibility to have an event listener on the cancel button and escape key in
		the derived dialog boxes
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #66 : Work with promises for dialogs
		- Issue #68 : Review all existing promises.
		- Issue #63 : Find a better solution for provider keys upload
Doc reviewed 20191124
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

'use strict';

export { newBaseDialog };

import { g_Translator } from '../UI/Translator.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

/*
--- newBaseDialog function --------------------------------------------------------------------------------------------


-----------------------------------------------------------------------------------------------------------------------
*/

let newBaseDialog = function ( ) {

	// variables initialization for drag and drop
	let m_StartDragX = 0;
	let m_StartDragY = 0;
	let m_DialogX = 0;
	let m_DialogY = 0;
	let m_ScreenWidth = 0;
	let m_ScreenHeight = 0;

	// Div
	let m_BackgroundDiv = null;
	let m_DialogDiv = null;
	let m_HeaderDiv = null;
	let m_ContentDiv = null;
	let m_ErrorDiv = null;
	let m_FooterDiv = null;
	let m_SearchWaitDiv = null;
	let m_SearchWaitBulletDiv = null;
	let m_OkButton = null;
	
	// Utilities
	let m_HTMLElementsFactory = newHTMLElementsFactory ( ) ;

	// Listeners
	let m_OkButtonListener = null;
	let m_CancelButtonListener = null;
	let m_EscapeKeyEventListener = null;
	
	// Promise callback
	let m_OnOk = null;
	let m_OnCancel = null;

	/*
	--- m_onKeyDown function ------------------------------------------------------------------------------------------

	Keyboard event listener

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_onKeyDown ( keyBoardEvent ) {
		if ( 'Escape' === keyBoardEvent.key || 'Esc' === keyBoardEvent.key ) {
			if ( m_EscapeKeyEventListener ) {
				if ( ! m_EscapeKeyEventListener ( ) ) {
					return;
				}
			}

			document.removeEventListener ( 'keydown', m_onKeyDown, true );
			document.getElementsByTagName('body') [0].removeChild ( m_BackgroundDiv );
			m_OnCancel ( 'Canceled by user' );
		}
	}
	
	/*
	--- m_CreateBackground function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateBackgroundDiv ( ) {
		// A new element covering the entire screen is created, with drag and drop event listeners
		m_BackgroundDiv = m_HTMLElementsFactory.create ( 'div', {  className : 'TravelNotes-BaseDialog-BackgroundDiv'} );
		m_BackgroundDiv.addEventListener ( 
			'dragover', 
			( ) => { return; },
			false
		);	
		m_BackgroundDiv.addEventListener ( 
			'drop', 
			( ) => { return; },
			false
		);	
	}

	/*
	--- m_CreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateDialogDiv ( ) {
		// the dialog is created
		m_DialogDiv = m_HTMLElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-Container',
			},
			m_BackgroundDiv
		);
	}
	
	/*
	--- m_CreateTopBar function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_CreateTopBar ( ) {
		let topBar = m_HTMLElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-TopBar',
				draggable : true
			},
			m_DialogDiv
		);
		let cancelButton = m_HTMLElementsFactory.create ( 
			'div',
			{ 
				innerHTML: '&#x274c', 
				className : 'TravelNotes-BaseDialog-CancelButton',
				title : g_Translator.getText ( "BaseDialog - Cancel" )
			},
			topBar
		);
		cancelButton.addEventListener ( 
			'click',
			( ) => {
				if ( m_CancelButtonListener ) {
					if ( ! m_CancelButtonListener ( ) ) {
						return;
					}
				}
				document.removeEventListener ( 'keydown', m_onKeyDown, true );
				document.getElementsByTagName('body') [0].removeChild ( m_BackgroundDiv );
				m_OnCancel ( 'Canceled by user' );
			},
			false
		);
		
		topBar.addEventListener ( 
			'dragstart', 
			( event ) => {
				try {
					event.dataTransfer.setData ( 'Text', '1' );
				}
				catch ( e ) {
					console.log ( e );
				}
				m_StartDragX = event.screenX;
				m_StartDragY = event.screenY;
			},
			false
		);	
		topBar.addEventListener ( 
			'dragend', 
			( event ) => {
				m_DialogX += event.screenX - m_StartDragX;
				m_DialogY += event.screenY - m_StartDragY;
				m_DialogX = Math.min ( Math.max ( m_DialogX, 20 ),m_ScreenWidth - m_DialogDiv.clientWidth -20 );
				m_DialogY = Math.max ( m_DialogY, 20 );
				let dialogMaxHeight = m_ScreenHeight - Math.max ( m_DialogY, 0 ) - 20;
				m_DialogDiv.setAttribute ( "style", "top:" + m_DialogY + "px;left:" + m_DialogX +"px;max-height:" + dialogMaxHeight +"px;" );
			},
			false 
		);
	}
	
	/*
	--- m_CreateHeaderDiv function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateHeaderDiv ( ) {
		m_HeaderDiv = m_HTMLElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-HeaderDiv',
			},
			m_DialogDiv
		);		
	}
	
	/*
	--- m_CreateContentDiv function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateContentDiv ( ) {
		m_ContentDiv = m_HTMLElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-ContentDiv',
			},
			m_DialogDiv
		);
	}
	
	/*
	--- m_CreateErrorDiv function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateErrorDiv ( ) {
		m_ErrorDiv = m_HTMLElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-ErrorDiv TravelNotes-BaseDialog-ErrorDivHidden',
			},
			m_DialogDiv
		);
	}
	
	/*
	--- m_CreateErrorDiv function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateFooterDiv ( ) {
		m_FooterDiv = m_HTMLElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-FooterDiv',
			},
			m_DialogDiv
		);
		m_OkButton = m_HTMLElementsFactory.create ( 
			'div',
			{ 
				innerHTML: '&#x1f4be;', 
				className : 'TravelNotes-BaseDialog-Button TravelNotes-BaseDialog-OkButton TravelNotes-BaseDialog-OkButton-Visible'
			},
			m_FooterDiv
		);
		m_OkButton.addEventListener ( 
			'click',
			( ) => {
				let returnValue = null;
				if ( m_OkButtonListener ) {
					returnValue = m_OkButtonListener ( );
					if ( ! returnValue ) {
						return;
					}
				}
				document.removeEventListener ( 'keydown', m_onKeyDown, true );
				document.getElementsByTagName('body') [0].removeChild ( m_BackgroundDiv );
				m_OnOk ( returnValue );
			},
			false
		);			
		
		// you understand?
		m_SearchWaitBulletDiv = m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				className: 'TravelNotes-BaseDialog-SearchWaitBullet TravelNotes-BaseDialog-SearchWait-Hidden'
			}, 
			m_SearchWaitDiv = m_HTMLElementsFactory.create ( 
				'div', 
				{ 
					className: 'TravelNotes-BaseDialog-SearchWait TravelNotes-BaseDialog-SearchWait-Hidden'
				},
				m_FooterDiv 
			)
		);
	}
	
	/*
	--- m_ShowError function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ShowError ( errorText ) { 
		m_ErrorDiv.innerHTML = errorText;
		m_ErrorDiv.classList.remove ( 'TravelNotes-BaseDialog-ErrorDivHidden' );
		m_ErrorDiv.classList.add ( 'TravelNotes-BaseDialog-ErrorDivVisible' );
	}
	
	/*
	--- m_HideError function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_HideError ( ) {
		m_ErrorDiv.innerHTML = '';
		m_ErrorDiv.classList.add ( 'TravelNotes-BaseDialog-ErrorDivHidden' );
		m_ErrorDiv.classList.remove ( 'TravelNotes-BaseDialog-ErrorDivVisible' );
	}
	
	/*
	--- m_Center function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Center ( ) {
		m_DialogX = ( m_ScreenWidth - m_DialogDiv.clientWidth ) / 2;
		m_DialogY = ( m_ScreenHeight - m_DialogDiv.clientHeight ) / 2;
		m_DialogX = Math.min ( Math.max ( m_DialogX, 20 ),m_ScreenWidth - m_DialogDiv.clientWidth -20 );
		m_DialogY = Math.max ( m_DialogY, 20 );
		let dialogMaxHeight = m_ScreenHeight - Math.max ( m_DialogY, 0 ) - 20;
		m_DialogDiv.setAttribute ( "style", "top:" + m_DialogY + "px;left:" + m_DialogX +"px;max-height:" + dialogMaxHeight +"px;" );
	}

	/*
	--- m_Display function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Display ( onOk, onCancel ) {
		m_OnOk = onOk;
		m_OnCancel = onCancel;
		
		document.getElementsByTagName('body') [0].appendChild ( m_BackgroundDiv );
		document.addEventListener ( 'keydown', m_onKeyDown, true );
		
		m_ScreenWidth = m_BackgroundDiv.clientWidth;
		m_ScreenHeight = m_BackgroundDiv.clientHeight;
		m_Center ( );
	}
	
	/*
	--- m_Display function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ShowWait ( ) {
		m_SearchWaitBulletDiv.classList.remove ( 'TravelNotes-BaseDialog-SearchWait-Hidden' );
		m_SearchWaitBulletDiv.classList.add ( 'TravelNotes-BaseDialog-SearchWait-Visible' );
		m_SearchWaitDiv.classList.remove ( 'TravelNotes-BaseDialog-SearchWait-Hidden' );
		m_SearchWaitDiv.classList.add ( 'TravelNotes-BaseDialog-SearchWait-Visible' );
		m_OkButton.classList.remove ( 'TravelNotes-BaseDialog-OkButton-Visible' );
		m_OkButton.classList.add ( 'TravelNotes-BaseDialog-OkButton-Hidden' );
	}
	
	/*
	--- m_Display function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_HideWait ( ) {
		m_SearchWaitBulletDiv.classList.remove ( 'TravelNotes-BaseDialog-SearchWait-Visible' );
		m_SearchWaitBulletDiv.classList.add ( 'TravelNotes-BaseDialog-SearchWait-Hidden' );
		m_SearchWaitDiv.classList.remove ( 'TravelNotes-BaseDialog-SearchWait-Visible' );
		m_SearchWaitDiv.classList.add ( 'TravelNotes-BaseDialog-SearchWait-Hidden' );
		m_OkButton.classList.remove ( 'TravelNotes-BaseDialog-OkButton-Hidden' );
		m_OkButton.classList.add ( 'TravelNotes-BaseDialog-OkButton-Visible' );
	}
	
	/*
	--- m_Show function -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Show ( ) {
		return new Promise ( m_Display );
	}
	
	// the dialog is created, but not displayed
	m_CreateBackgroundDiv ( );
	m_CreateDialogDiv ( );
	m_CreateTopBar ( );
	m_CreateHeaderDiv ( );
	m_CreateContentDiv ( );
	m_CreateErrorDiv ( );
	m_CreateFooterDiv ( );
	
	/*
	--- BaseDialog object ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal ( 
		{
			set okButtonListener ( Listener ) { m_OkButtonListener = Listener; },
			
			set cancelButtonListener ( Listener ) { m_CancelButtonListener = Listener; },
			
			set escapeKeyListener ( Listener ) { m_EscapeKeyEventListener = Listener; },
					
			showError : errorText => m_ShowError ( errorText ),
			hideError : ( ) => m_HideError ( ),
			
			showWait : ( ) => m_ShowWait ( ),
			hideWait : ( ) =>m_HideWait ( ),

			get title ( ) { return m_HeaderDiv.innerHTML; },
			set title ( Title ) { m_HeaderDiv.innerHTML = Title; },

			get header ( ) { return m_HeaderDiv;},
			set header ( Header ) { m_HeaderDiv = Header; },
			
			get content ( ) { return m_ContentDiv;},
			set content ( Content ) { m_ContentDiv = Content; },

			get footer ( ) { return m_FooterDiv;},
			set footer ( Footer ) { m_FooterDiv = Footer; },
			
			show : ( ) => { return m_Show ( ) ; }
		}
	);
};

/*
--- End of BaseDialog.js file -----------------------------------------------------------------------------------------
*/