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

export { newBaseDialog };

import { theTranslator } from '../UI/Translator.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

/*
--- newBaseDialog function --------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newBaseDialog ( ) {

	// variables initialization for drag and drop
	let myStartDragX = 0;
	let myStartDragY = 0;
	let myDialogX = 0;
	let myDialogY = 0;
	let myScreenWidth = 0;
	let myScreenHeight = 0;

	// Div
	let myBackgroundDiv = null;
	let myDialogDiv = null;
	let myHeaderDiv = null;
	let myContentDiv = null;
	let myErrorDiv = null;
	let myFooterDiv = null;
	let mySearchWaitDiv = null;
	let mySearchWaitBulletDiv = null;
	let myOkButton = null;

	// Utilities
	let myHTMLElementsFactory = newHTMLElementsFactory ( ) ;

	// Listeners
	let myOkButtonListener = null;
	let myCancelButtonListener = null;
	let myEscapeKeyEventListener = null;

	// Promise callback
	let myOnOk = null;
	let myOnCancel = null;

	/*
	--- myOnKeyDown function ------------------------------------------------------------------------------------------

	Keyboard event listener

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnKeyDown ( keyBoardEvent ) {
		if ( 'Escape' === keyBoardEvent.key || 'Esc' === keyBoardEvent.key ) {
			if ( myEscapeKeyEventListener ) {
				if ( ! myEscapeKeyEventListener ( ) ) {
					return;
				}
			}

			document.removeEventListener ( 'keydown', myOnKeyDown, true );
			document.getElementsByTagName ('body') [ 0 ].removeChild ( myBackgroundDiv );
			myOnCancel ( 'Canceled by user' );
		}
	}

	/*
	--- myCreateBackground function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateBackgroundDiv ( ) {

		// A new element covering the entire screen is created, with drag and drop event listeners
		myBackgroundDiv = myHTMLElementsFactory.create ( 'div', {  className : 'TravelNotes-BaseDialog-BackgroundDiv' } );
		myBackgroundDiv.addEventListener (
			'dragover',
			( ) => { return; },
			false
		);
		myBackgroundDiv.addEventListener (
			'drop',
			( ) => { return; },
			false
		);
	}

	/*
	--- myCreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDialogDiv ( ) {

		// the dialog is created
		myDialogDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Container'
			},
			myBackgroundDiv
		);
	}

	/*
	--- myCreateTopBar function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateTopBar ( ) {
		let topBar = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-TopBar',
				draggable : true
			},
			myDialogDiv
		);
		let cancelButton = myHTMLElementsFactory.create (
			'div',
			{
				innerHTML : '&#x274c',
				className : 'TravelNotes-BaseDialog-CancelButton',
				title : theTranslator.getText ( 'BaseDialog - Cancel' )
			},
			topBar
		);
		cancelButton.addEventListener (
			'click',
			( ) => {
				if ( myCancelButtonListener ) {
					if ( ! myCancelButtonListener ( ) ) {
						return;
					}
				}
				document.removeEventListener ( 'keydown', myOnKeyDown, true );
				document.getElementsByTagName ('body') [ 0 ].removeChild ( myBackgroundDiv );
				myOnCancel ( 'Canceled by user' );
			},
			false
		);

		topBar.addEventListener (
			'dragstart',
			( event ) => {
				try {
					event.dataTransfer.setData ( 'Text', '1' );
				}
				catch ( err ) {
					console.log ( err );
				}
				myStartDragX = event.screenX;
				myStartDragY = event.screenY;
			},
			false
		);
		topBar.addEventListener (
			'dragend',
			( event ) => {
				myDialogX += event.screenX - myStartDragX;
				myDialogY += event.screenY - myStartDragY;
				myDialogX = Math.min ( Math.max ( myDialogX, 20 ), myScreenWidth - myDialogDiv.clientWidth -20 );
				myDialogY = Math.max ( myDialogY, 20 );
				let dialogMaxHeight = myScreenHeight - Math.max ( myDialogY, 0 ) - 20;
				myDialogDiv.setAttribute (
					'style',
					'top:' + myDialogY + 'px;left:' + myDialogX +'px;max-height:' + dialogMaxHeight +'px;'
				);
			},
			false
		);
	}

	/*
	--- myCreateHeaderDiv function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateHeaderDiv ( ) {
		myHeaderDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-HeaderDiv'
			},
			myDialogDiv
		);
	}

	/*
	--- myCreateContentDiv function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateContentDiv ( ) {
		myContentDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-ContentDiv'
			},
			myDialogDiv
		);
	}

	/*
	--- myCreateErrorDiv function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateErrorDiv ( ) {
		myErrorDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-ErrorDiv TravelNotes-BaseDialog-ErrorDivHidden'
			},
			myDialogDiv
		);
	}

	/*
	--- myCreateErrorDiv function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateFooterDiv ( ) {
		myFooterDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-FooterDiv'
			},
			myDialogDiv
		);
		myOkButton = myHTMLElementsFactory.create (
			'div',
			{
				innerHTML : '&#x1f197;',
				className :
					'TravelNotes-BaseDialog-Button TravelNotes-BaseDialog-OkButton TravelNotes-BaseDialog-OkButton-Visible'
			},
			myFooterDiv
		);
		myOkButton.addEventListener (
			'click',
			( ) => {
				let returnValue = null;
				if ( myOkButtonListener ) {
					returnValue = myOkButtonListener ( );
					if ( ! returnValue ) {
						return;
					}
				}
				document.removeEventListener ( 'keydown', myOnKeyDown, true );
				document.getElementsByTagName ('body') [ 0 ].removeChild ( myBackgroundDiv );
				myOnOk ( returnValue );
			},
			false
		);

		// you understand?
		mySearchWaitBulletDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-SearchWaitBullet TravelNotes-BaseDialog-SearchWait-Hidden'
			},
			mySearchWaitDiv = myHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-BaseDialog-SearchWait TravelNotes-BaseDialog-SearchWait-Hidden'
				},
				myFooterDiv
			)
		);
	}

	/*
	--- myShowError function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myShowError ( errorText ) {
		myErrorDiv.innerHTML = errorText;
		myErrorDiv.classList.remove ( 'TravelNotes-BaseDialog-ErrorDivHidden' );
		myErrorDiv.classList.add ( 'TravelNotes-BaseDialog-ErrorDivVisible' );
	}

	/*
	--- myHideError function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myHideError ( ) {
		myErrorDiv.innerHTML = '';
		myErrorDiv.classList.add ( 'TravelNotes-BaseDialog-ErrorDivHidden' );
		myErrorDiv.classList.remove ( 'TravelNotes-BaseDialog-ErrorDivVisible' );
	}

	/*
	--- myCenter function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCenter ( ) {
		myDialogX = ( myScreenWidth - myDialogDiv.clientWidth ) / 2;
		myDialogY = ( myScreenHeight - myDialogDiv.clientHeight ) / 2;
		myDialogX = Math.min ( Math.max ( myDialogX, 20 ), myScreenWidth - myDialogDiv.clientWidth -20 );
		myDialogY = Math.max ( myDialogY, 20 );
		let dialogMaxHeight = myScreenHeight - Math.max ( myDialogY, 0 ) - 20;
		myDialogDiv.setAttribute (
			'style',
			'top:' + myDialogY + 'px;left:' + myDialogX +'px;max-height:' + dialogMaxHeight +'px;'
		);
	}

	/*
	--- myDisplay function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myDisplay ( onOk, onCancel ) {
		myOnOk = onOk;
		myOnCancel = onCancel;

		document.getElementsByTagName ('body') [ 0 ].appendChild ( myBackgroundDiv );
		document.addEventListener ( 'keydown', myOnKeyDown, true );

		myScreenWidth = myBackgroundDiv.clientWidth;
		myScreenHeight = myBackgroundDiv.clientHeight;
		myCenter ( );
	}

	/*
	--- myDisplay function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myShowWait ( ) {
		mySearchWaitBulletDiv.classList.remove ( 'TravelNotes-BaseDialog-SearchWait-Hidden' );
		mySearchWaitBulletDiv.classList.add ( 'TravelNotes-BaseDialog-SearchWait-Visible' );
		mySearchWaitDiv.classList.remove ( 'TravelNotes-BaseDialog-SearchWait-Hidden' );
		mySearchWaitDiv.classList.add ( 'TravelNotes-BaseDialog-SearchWait-Visible' );
		myOkButton.classList.remove ( 'TravelNotes-BaseDialog-OkButton-Visible' );
		myOkButton.classList.add ( 'TravelNotes-BaseDialog-OkButton-Hidden' );
	}

	/*
	--- myDisplay function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myHideWait ( ) {
		mySearchWaitBulletDiv.classList.remove ( 'TravelNotes-BaseDialog-SearchWait-Visible' );
		mySearchWaitBulletDiv.classList.add ( 'TravelNotes-BaseDialog-SearchWait-Hidden' );
		mySearchWaitDiv.classList.remove ( 'TravelNotes-BaseDialog-SearchWait-Visible' );
		mySearchWaitDiv.classList.add ( 'TravelNotes-BaseDialog-SearchWait-Hidden' );
		myOkButton.classList.remove ( 'TravelNotes-BaseDialog-OkButton-Hidden' );
		myOkButton.classList.add ( 'TravelNotes-BaseDialog-OkButton-Visible' );
	}

	/*
	--- myShow function -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myShow ( ) {
		return new Promise ( myDisplay );
	}

	// the dialog is created, but not displayed
	myCreateBackgroundDiv ( );
	myCreateDialogDiv ( );
	myCreateTopBar ( );
	myCreateHeaderDiv ( );
	myCreateContentDiv ( );
	myCreateErrorDiv ( );
	myCreateFooterDiv ( );

	/*
	--- BaseDialog object ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			set okButtonListener ( Listener ) { myOkButtonListener = Listener; },

			set cancelButtonListener ( Listener ) { myCancelButtonListener = Listener; },

			set escapeKeyListener ( Listener ) { myEscapeKeyEventListener = Listener; },

			showError : errorText => myShowError ( errorText ),
			hideError : ( ) => myHideError ( ),

			showWait : ( ) => myShowWait ( ),
			hideWait : ( ) =>myHideWait ( ),

			get title ( ) { return myHeaderDiv.innerHTML; },
			set title ( Title ) { myHeaderDiv.innerHTML = Title; },

			get header ( ) { return myHeaderDiv; },
			set header ( Header ) { myHeaderDiv = Header; },

			get content ( ) { return myContentDiv; },
			set content ( Content ) { myContentDiv = Content; },

			get footer ( ) { return myFooterDiv; },
			set footer ( Footer ) { myFooterDiv = Footer; },

			get okButton ( ) { return myOkButton; },

			show : ( ) => { return myShow ( ) ; }
		}
	);
}

/*
--- End of BaseDialog.js file -----------------------------------------------------------------------------------------
*/