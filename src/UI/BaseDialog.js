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
	- the BaseDialog object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.3.0:
		- added the possibility to have an event listener on the cancel button and escape key in
		the derived dialog boxes (see addClickCancelButtonEventListener addEscapeKeyEventListener)
Doc reviewed 20170928
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	
	var BaseDialog = function ( ) {
		
		var okButtonListener = null;
		var cancelButtonListener = null;
		var escapeKeyEventListener = null;
		
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		var onKeyDown = function ( keyBoardEvent ) {
			if ( 'Escape' === keyBoardEvent.key || 'Esc' === keyBoardEvent.key ) {
				if ( escapeKeyEventListener ) {
					if ( ! escapeKeyEventListener ( ) ) {
						return;
					}
				}

				document.removeEventListener ( 'keydown', onKeyDown, true );
				document.getElementsByTagName('body') [0].removeChild ( document.getElementById ( "TravelNotes-BaseDialog-BackgroundDiv" ) );
			}
		};
		
		// A new element covering the entire screen is created, with drag and drop event listeners
		var body = document.getElementsByTagName('body') [0];
		var backgroundDiv = htmlElementsFactory.create ( 'div', { id: 'TravelNotes-BaseDialog-BackgroundDiv', className : 'TravelNotes-BaseDialog-BackgroundDiv'} , body );
		backgroundDiv.addEventListener ( 
			'dragover', 
			function ( event ) {
				return;
			},
			false
		);	
		backgroundDiv.addEventListener ( 
			'drop', 
			function ( event ) {
				return;
			},
			false
		);	

		// variables initialization for drag and drop
		var screenWidth = backgroundDiv.clientWidth;
		var screenHeight = backgroundDiv.clientHeight;
		
		var startDragX = 0;
		var startDragY = 0;
		
		var dialogX = 0;
		var dialogY = 0;

		// the dialog is created
		var dialogContainer = htmlElementsFactory.create ( 
			'div',
			{ 
				id : 'TravelNotes-BaseDialog-Container',
				className : 'TravelNotes-BaseDialog-Container',
			},
			backgroundDiv
		);
		var topBar = htmlElementsFactory.create ( 
			'div',
			{ 
				id : 'TravelNotes-BaseDialog-TopBar',
				className : 'TravelNotes-BaseDialog-TopBar',
				draggable : true
			},
			dialogContainer
		);
		var cancelButton = htmlElementsFactory.create ( 
			'div',
			{ 
				innerHTML: '&#x274c', 
				id : 'TravelNotes-BaseDialog-CancelButton',
				title : require ( '../UI/Translator' ) ( ).getText ( "BaseDialog - Cancel" )
			},
			topBar
		);
		cancelButton.addEventListener ( 
			'click',
			function ( ) {
				if ( cancelButtonListener ) {
					if ( ! cancelButtonListener ( ) ) {
						return;
					}
				}
				document.removeEventListener ( 'keydown', onKeyDown, true );
				document.getElementsByTagName('body') [0].removeChild ( backgroundDiv );
			},
			false
		);
		topBar.addEventListener ( 
			'dragstart', 
			function ( event ) {
				try {
					event.dataTransfer.setData ( 'Text', '1' );
				}
				catch ( e ) {
				}
				startDragX = event.screenX;
				startDragY = event.screenY;
			},
			false
		);	
		topBar.addEventListener ( 
			'dragend', 
			function ( event ) {
				dialogX += event.screenX - startDragX;
				dialogY += event.screenY - startDragY;
				dialogX = Math.min ( Math.max ( dialogX, 20 ),screenWidth - dialogContainer.clientWidth -20 );
				dialogY = Math.max ( dialogY, 20 );
				var dialogMaxHeight = screenHeight - Math.max ( dialogY, 0 ) - 20;
				dialogContainer.setAttribute ( "style", "top:" + dialogY + "px;left:" + dialogX +"px;max-height:" + dialogMaxHeight +"px;" );
			},
			false 
		);
		var headerDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-HeaderDiv',
				id : 'TravelNotes-BaseDialog-HeaderDiv'
			},
			dialogContainer
		);		
		var contentDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-ContentDiv',
				id : 'TravelNotes-BaseDialog-ContentDiv'
			},
			dialogContainer
		);
		var errorDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-ErrorDiv TravelNotes-BaseDialog-ErrorDivHidden',
				id : 'TravelNotes-BaseDialog-ErrorDiv',
			},
			dialogContainer
		);
		var footerDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-FooterDiv',
				id : 'TravelNotes-BaseDialog-FooterDiv',
			},
			dialogContainer
		);
		var okButton = htmlElementsFactory.create ( 
			'div',
			{ 
				innerHTML: '&#x1f4be;', 
				id : 'TravelNotes-BaseDialog-OkButton',
				className : 'TravelNotes-BaseDialog-Button'
			},
			footerDiv
		);
		okButton.addEventListener ( 
			'click',
			function ( ) {
				if ( okButtonListener ) {
					if ( ! okButtonListener ( ) ) {
						return;
					}
				}
				document.removeEventListener ( 'keydown', onKeyDown, true );
				document.getElementsByTagName('body') [0].removeChild ( backgroundDiv );
			},
			false
		);				
		document.addEventListener ( 'keydown', onKeyDown, true );
		
		/*
		--- BaseDialog object -----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return {
			
			addClickOkButtonEventListener : function ( listener ) {
				okButtonListener = listener;
			},
			
			addClickCancelButtonEventListener : function ( listener ) {
				cancelButtonListener = listener;
			},
			
			addEscapeKeyEventListener : function ( listener ) {
				escapeKeyEventListener = listener;
			},
			
			get title ( ) { return headerDiv.innerHTML; },
			set title ( Title ) { headerDiv.innerHTML = Title; },
			
			center : function ( ) {
				dialogX = ( screenWidth - dialogContainer.clientWidth ) / 2;
				dialogY = ( screenHeight - dialogContainer.clientHeight ) / 2;
				dialogX = Math.min ( Math.max ( dialogX, 20 ),screenWidth - dialogContainer.clientWidth -20 );
				dialogY = Math.max ( dialogY, 20 );
				var dialogMaxHeight = screenHeight - Math.max ( dialogY, 0 ) - 20;
				dialogContainer.setAttribute ( "style", "top:" + dialogY + "px;left:" + dialogX +"px;max-height:" + dialogMaxHeight +"px;" );
			},

			get header ( ) { return headerDiv;},
			set header ( Header ) { headerDiv = Header; },
			
			get content ( ) { return contentDiv;},
			set content ( Content ) { contentDiv = Content; },

			get footer ( ) { return footerDiv;},
			set footer ( Footer ) { footerDiv = Footer; }
			
		};
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = BaseDialog;
	}

}());

/*
--- End of BaseDialog.js file -----------------------------------------------------------------------------------------
*/