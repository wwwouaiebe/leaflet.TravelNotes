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
	- v1.0.0:
		- created
	- v1.3.0:
		- added the possibility to have an event listener on the cancel button and escape key in
		the derived dialog boxes
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
		- Issue ♯66 : Work with promises for dialogs
		- Issue ♯68 : Review all existing promises.
		- Issue ♯63 : Find a better solution for provider keys upload
	- v1.11.0:
		- Issue ♯110 : Add a command to create a SVG icon from osm for each maneuver
		- Issue ♯113 : When more than one dialog is opened, using thr Esc or Return key close all the dialogs
	- v2.0.0:
		- Issue ♯134 : Remove node.setAttribute ( 'style', blablabla) in the code
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯138 : Protect the app - control html entries done by user.
	- v2.2.0:
		- Issue ♯155 : Enable pan and zoom on the map when a dialog is displayed
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210803
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file BaseDialog.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module BaseDialog
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/*

Box model

+- .TravelNotes-BaseDialog-BackgroundDiv ---------------------------------------------------------------------------+
|                                                                                                                   |
| +- .TravelNotes-BaseDialog-Container -------------------------------------------------------------+               |
| |                                                                                                 |               |
| | +- .TravelNotes-BaseDialog-TopBar ------------------------------------------------------------+ |               |
| | |                                                                                             | |               |
| | | +- .TravelNotes-BaseDialog-CancelButton ---+                                                | |               |
| | | |  BaseDialog.cancelButton                 |                                                | |               |
| | | +------------------------------------------+                                                | |               |
| | +---------------------------------------------------------------------------------------------+ |               |
| |                                                                                                 |               |
| | +- .TravelNotes-BaseDialog-HeaderDiv ---------------------------------------------------------+ |               |
| | |  BaseDialog.title                                                                           | |               |
| | +---------------------------------------------------------------------------------------------+ |               |
| |                                                                                                 |               |
| | +- .TravelNotes-BaseDialog-ContentDiv --------------------------------------------------------+ |               |
| | |  BaseDialog.content                                                                         | |               |
| | |                                                                                             | |               |
| | |                                                                                             | |               |
| | |                                                                                             | |               |
| | |                                                                                             | |               |
| | +---------------------------------------------------------------------------------------------+ |               |
| |                                                                                                 |               |
| | +- .TravelNotes-BaseDialog-ErrorDiv ----------------------------------------------------------+ |               |
| | |                                                                                             | |               |
| | +---------------------------------------------------------------------------------------------+ |               |
| |                                                                                                 |               |
| | +- .TravelNotes-BaseDialog-FooterDiv ---------------------------------------------------------+ |               |
| | |                                                                                             | |               |
| | | +- .TravelNotes-BaseDialog-SearchWait ----------------------------------------------------+ | |               |
| | | |                                                                                         | | |               |
| | | +-----------------------------------------------------------------------------------------+ | |               |
| | |                                                                                             | |               |
| | | +- .TravelNotes-BaseDialog-Button ---------+                                                | |               |
| | | |  BaseDialog.okButton                     |                                                | |               |
| | | +------------------------------------------+                                                | |               |
| | +---------------------------------------------------------------------------------------------+ |               |
| +-------------------------------------------------------------------------------------------------+               |
|                                                                                                                   |
|                                                                                                                   |
|                                                                                                                   |
+-------------------------------------------------------------------------------------------------------------------+
*/

import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theTranslator from '../UI/Translator.js';
import BaseDialogEventListeners from '../dialogs/BaseDialogEventListeners.js';
import theHTMLSanitizer from '../util/HTMLSanitizer.js';
import BaseDialogKeydownEventListener from '../dialogs/BaseDialogKeydownEventListener.js';
import { theBackgroundEventListeners } from '../dialogs/BaseDialogBackgroundEventListeners.js';

import { ZERO, TWO, DIALOG_DRAG_MARGIN } from '../util/Constants.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class BaseDialog
@classdesc Base class used for dialogs
@abstract
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class BaseDialog {

	#BDEL = null;

	#backgroundDiv = null;
	#containerDiv = null;
	#errorDiv = null;
	#waitDiv = null;
	#okButton = null;

	keyboardEventListenerEnabled = true;

	#keydownEventListener = null;

	#options = null;

	/**
	onOk promise function
	@private
	*/

	#onPromiseOkFct = null;

	/**
	onError promise function
	@private
	*/

	#onPromiseErrorFct = null;

	/**
	Create the background
	@private
	*/

	#createBackgroundDiv ( ) {

		// A new element covering the entire screen is created, with drag and drop event listeners
		this.#backgroundDiv = theHTMLElementsFactory.create (
			'div',
			{ id : 'TravelNotes-Background', className : 'TravelNotes-Background' }
		);

		this.#BDEL.backgroundDiv = this.#backgroundDiv;

		this.#backgroundDiv.addEventListener ( 'dragover', ( ) => null, false );
		this.#backgroundDiv.addEventListener ( 'drop', ( ) => null, false );

		this.#backgroundDiv.addEventListener (
			'mousedown',
			theBackgroundEventListeners.onMouseDown,
			false
		);
		this.#backgroundDiv.addEventListener (
			'mouseup',
			theBackgroundEventListeners.onMouseUp,
			false
		);
		this.#backgroundDiv.addEventListener (
			'mousemove',
			theBackgroundEventListeners.onMouseMove,
			false
		);
		this.#backgroundDiv.addEventListener (
			'wheel',
			theBackgroundEventListeners.onMouseWheel,
			false
		);
		this.#backgroundDiv.addEventListener (
			'contextmenu',
			theBackgroundEventListeners.onContextMenu,
			false
		);
	}

	/**
	Create the dialog container
	@private
	*/

	#CreateContainerDiv ( ) {

		// the dialog is created
		this.#containerDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Container',
				dialogX : ZERO,
				dialogY : ZERO
			},
			this.#backgroundDiv
		);
		this.#BDEL.containerDiv = this.#containerDiv;
	}

	/**
	Create the animation top bar
	@private
	*/

	#CreateTopBar ( ) {

		let topBar = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-TopBar',
				draggable : true
			},
			this.#containerDiv
		);
		topBar.addEventListener (
			'dragstart',
			this.#BDEL.onTopBarDragStart.bind ( this.#BDEL ),
			false
		);
		topBar.addEventListener (
			'dragend',
			this.#BDEL.onTopBarDragEnd.bind ( this.#BDEL ),
			false
		);

		let cancelButton = theHTMLElementsFactory.create (
			'div',
			{
				textContent : '❌',
				className : 'TravelNotes-BaseDialog-CancelButton',
				title : theTranslator.getText ( 'BaseDialog - Cancel' )
			},
			topBar
		);
		cancelButton.addEventListener (
			'click',

			// BaseDialogEventListeners.onCancelButtonClick,
			this.#BDEL.onCancelButtonClick.bind ( this.#BDEL ),
			false
		);
	}

	/**
	Create the header div
	@private
	*/

	#createHeaderDiv ( ) {

		theHTMLElementsFactory.create (
			'text',
			{
				value : this.title
			}
			,
			theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-BaseDialog-HeaderDiv'
				},
				this.#containerDiv
			)
		);
	}

	/**
	Create the content div
	@private
	*/

	#createContentDiv ( ) {
		let contentDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-ContentDiv'
			},
			this.#containerDiv
		);

		this.contentHTMLElements.forEach (
			contentHTMLElement => contentDiv.appendChild ( contentHTMLElement )
		);
	}

	/**
	Create the error div
	@private
	*/

	#createErrorDiv ( ) {
		this.#errorDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-ErrorDiv TravelNotes-Hidden'
			},
			this.#containerDiv
		);
	}

	/**
	Create the dialog wait animation
	@private
	*/

	#createWaitDiv ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-WaitAnimationBullet'
			},
			theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-WaitAnimation'
				},
				this.#waitDiv = theHTMLElementsFactory.create (
					'div',
					{
						className : 'TravelNotes-BaseDialog-WaitDiv  TravelNotes-Hidden'
					},
					this.#containerDiv
				)
			)
		);
	}

	/**
	Create the dialog footer
	@private
	*/

	#createFooterDiv ( ) {
		let footerDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-FooterDiv'
			},
			this.#containerDiv
		);

		this.#okButton = theHTMLElementsFactory.create (
			'div',
			{
				textContent : this.#options.firstButtonText || '🆗',
				className : 'TravelNotes-BaseDialog-Button'
			},
			footerDiv
		);
		if ( this.#options.firstButtonText ) {
			this.#okButton.style [ 'background-color' ] = 'green';
		}
		this.#okButton.addEventListener (
			'click',
			this.#BDEL.onOkButtonClick.bind ( this.#BDEL ),
			false
		);

		if ( this.#options.secondButtonText ) {
			let secondButton = theHTMLElementsFactory.create (
				'div',
				{
					textContent : this.#options.secondButtonText,
					className : 'TravelNotes-BaseDialog-Button'
				},
				footerDiv
			);
			secondButton.style [ 'background-color' ] = 'red';
			secondButton.addEventListener (
				'click',
				BaseDialogEventListeners.onCancelButtonClick,
				false
			);
		}

		this.footerHTMLElements.forEach (
			footerHTMLElement => footerDiv.appendChild ( footerHTMLElement )
		);
	}

	/**
	Create the HTML dialog
	@private
	*/

	#createHTML ( ) {
		this.#createBackgroundDiv ( );
		this.#CreateContainerDiv ( );
		this.#CreateTopBar ( );
		this.#createHeaderDiv ( );
		this.#createContentDiv ( );
		this.#createErrorDiv ( );
		this.#createWaitDiv ( );
		this.#createFooterDiv ( );
	}

	/**
	Center the dialog o the screen
	@private
	*/

	#centerDialog ( ) {
		this.#containerDiv.dialogX =
			( this.#backgroundDiv.clientWidth - this.#containerDiv.clientWidth ) / TWO;
		this.#containerDiv.dialogY =
			( this.#backgroundDiv.clientHeight - this.#containerDiv.clientHeight ) / TWO;

		this.#containerDiv.dialogX = Math.min (
			Math.max ( this.#containerDiv.dialogX, DIALOG_DRAG_MARGIN ),
			this.#backgroundDiv.clientWidth -
				this.#containerDiv.clientWidth -
				DIALOG_DRAG_MARGIN
		);
		this.#containerDiv.dialogY = Math.max (
			this.#containerDiv.dialogY,
			DIALOG_DRAG_MARGIN
		);

		let dialogMaxHeight =
			this.#backgroundDiv.clientHeight -
			Math.max ( this.#containerDiv.dialogY, ZERO ) -
			DIALOG_DRAG_MARGIN;
		this.#containerDiv.style.top = String ( this.#containerDiv.dialogY ) + 'px';
		this.#containerDiv.style.left = String ( this.#containerDiv.dialogX ) + 'px';
		this.#containerDiv.style [ 'max-height' ] = String ( dialogMaxHeight ) + 'px';
	}

	/**
	Build and show the dialog
	@private
	*/

	#show ( onPromiseOkFct, onPromiseErrorFct ) {

		this.#onPromiseOkFct = onPromiseOkFct;
		this.#onPromiseErrorFct = onPromiseErrorFct;

		this.#createHTML ( );
		document.body.appendChild ( this.#backgroundDiv );
		this.#centerDialog ( );
		document.addEventListener ( 'keydown', this.#keydownEventListener, { capture : true } );

		this.onShow ( );
	}

	constructor ( options = {} ) {
		this.#BDEL = new BaseDialogEventListeners ( this );
		this.#keydownEventListener = new BaseDialogKeydownEventListener ( this );
		this.#options = options;
	}

	/**
	Cancel button handler. Can be overloaded in the derived classes
	*/

	onCancel ( ) {
		document.body.removeChild ( this.#backgroundDiv );
		document.removeEventListener ( 'keydown', this.#keydownEventListener, { capture : true } );
		this.#onPromiseErrorFct ( 'Canceled by user' );
	}

	/**
	Called after the ok button will be clicked and before the dialog will be closed.
	Can be overloaded in the derived classes
	@return {boolean} true when the dialog can be closed, false otherwise.
	*/

	canClose ( ) {
		return true;
	}

	/**
	Ok button handler. Can be overloaded in the derived classes, but you have always to call super.onOk ( ).
	@param {} returnValue a value that will be returned to the onOk handler of the Promise
	*/

	onOk ( returnValue ) {
		document.body.removeChild ( this.#backgroundDiv );

		document.removeEventListener ( 'keydown', this.#keydownEventListener, { capture : true } );
		this.#onPromiseOkFct ( returnValue );
	}

	/**
	Called when the dialog is show. Can be overloaded in the derived classes
	*/

	onShow ( ) {}

	/**
	Get the title of the dialog. Can be overloaded in the derived classes
	@readonly
	*/

	get title ( ) { return ''; }

	/**
	Get an array with the HTMLElements that have to be added in the content of the dialog.
	Can be overloaded in the derived classes
	@readonly
	*/

	get contentHTMLElements ( ) { return []; }

	/**
	Get an array with the HTMLElements that have to be added in the footer of the dialog
	Can be overloaded in the derived classes
	@readonly
	*/

	get footerHTMLElements ( ) {
		return [];
	}

	/**
	Show the dialog
	*/

	show ( ) {
		return new Promise ( ( onOk, onError ) => this.#show ( onOk, onError ) );
	}

	/**
	Show the wait section of the dialog and hide the okbutton
	*/

	showWait ( ) {
		this.#waitDiv.classList.remove ( 'TravelNotes-Hidden' );
		this.#okButton.classList.add ( 'TravelNotes-Hidden' );
	}

	/**
	Hide the wait section of the dialog and show the okbutton
	*/

	hideWait ( ) {
		this.#waitDiv.classList.add ( 'TravelNotes-Hidden' );
		this.#okButton.classList.remove ( 'TravelNotes-Hidden' );
	}

	/**
	Show the error section of the dialog
	*/

	showError ( errorText ) {

		theHTMLSanitizer.sanitizeToHtmlElement (
			errorText,
			this.#errorDiv
		);
		this.#errorDiv.classList.remove ( 'TravelNotes-Hidden' );
	}

	/**
	Hide the error section of the dialog
	*/

	hideError ( ) {
		this.#errorDiv.textContent = '';
		this.#errorDiv.classList.add ( 'TravelNotes-Hidden' );
	}

}

export default BaseDialog;

/*
--- End of BaseDialog.js file -------------------------------------------------------------------------------------------------
*/