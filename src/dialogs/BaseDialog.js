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
		this.#BDEL.backgroundDiv = theHTMLElementsFactory.create (
			'div',
			{ id : 'TravelNotes-Background', className : 'TravelNotes-Background' }
		);
		this.#BDEL.backgroundDiv.addEventListener ( 'dragover', ( ) => null, false );
		this.#BDEL.backgroundDiv.addEventListener ( 'drop', ( ) => null, false );

		this.#BDEL.backgroundDiv.addEventListener (
			'mousedown',
			BaseDialogEventListeners.onMouseDownBackground,
			false
		);
		this.#BDEL.backgroundDiv.addEventListener (
			'mouseup',
			BaseDialogEventListeners.onMouseUpBackground,
			false
		);
		this.#BDEL.backgroundDiv.addEventListener (
			'mousemove',
			BaseDialogEventListeners.onMouseMoveBackground,
			false
		);
		this.#BDEL.backgroundDiv.addEventListener (
			'wheel',
			BaseDialogEventListeners.onMouseWheelBackground,
			false
		);
		this.#BDEL.backgroundDiv.addEventListener (
			'contextmenu',
			BaseDialogEventListeners.onContextMenuBackground,
			false
		);
	}

	/**
	Create the dialog container
	@private
	*/

	#CreateContainerDiv ( ) {

		// the dialog is created
		this.#BDEL.containerDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Container',
				dialogX : ZERO,
				dialogY : ZERO,
				topBar : null,
				headerDiv : null,
				contentDiv : null,
				errorDiv : null,
				waitDiv : null,
				footerDiv : null
			},
			this.#BDEL.backgroundDiv
		);
	}

	/**
	Create the animation top bar
	@private
	*/

	#CreateTopBar ( ) {

		this.#BDEL.containerDiv.topBar = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-TopBar',
				draggable : true,
				cancelButton : null
			},
			this.#BDEL.containerDiv
		);
		this.#BDEL.containerDiv.topBar.addEventListener (
			'dragstart',
			this.#BDEL.onTopBarDragStart.bind ( this.#BDEL ),
			false
		);
		this.#BDEL.containerDiv.topBar.addEventListener (
			'dragend',
			this.#BDEL.onTopBarDragEnd.bind ( this.#BDEL ),
			false
		);

		this.#BDEL.containerDiv.topBar.cancelButton = theHTMLElementsFactory.create (
			'div',
			{
				textContent : '❌',
				className : 'TravelNotes-BaseDialog-CancelButton',
				title : theTranslator.getText ( 'BaseDialog - Cancel' )
			},
			this.#BDEL.containerDiv.topBar
		);
		this.#BDEL.containerDiv.topBar.cancelButton.addEventListener (
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
		this.#BDEL.containerDiv.headerDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-HeaderDiv'
			},
			this.#BDEL.containerDiv
		);

		theHTMLElementsFactory.create (
			'text',
			{
				value : this.title
			}
			,
			this.#BDEL.containerDiv.headerDiv
		);
	}

	/**
	Create the content div
	@private
	*/

	#createContentDiv ( ) {
		this.#BDEL.containerDiv.contentDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-ContentDiv'
			},
			this.#BDEL.containerDiv
		);

		this.contentHTMLElements.forEach (
			contentHTMLElement => this.#BDEL.containerDiv.contentDiv.appendChild ( contentHTMLElement )
		);
	}

	/**
	Create the error div
	@private
	*/

	#createErrorDiv ( ) {
		this.#BDEL.containerDiv.errorDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-ErrorDiv TravelNotes-Hidden'
			},
			this.#BDEL.containerDiv
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
				this.#BDEL.containerDiv.waitDiv = theHTMLElementsFactory.create (
					'div',
					{
						className : 'TravelNotes-BaseDialog-WaitDiv  TravelNotes-Hidden'
					},
					this.#BDEL.containerDiv
				)
			)
		);
	}

	/**
	Create the dialog footer
	@private
	*/

	#createFooterDiv ( ) {
		this.#BDEL.containerDiv.footerDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-FooterDiv',
				okButton : null
			},
			this.#BDEL.containerDiv
		);

		this.#BDEL.containerDiv.footerDiv.okButton = theHTMLElementsFactory.create (
			'div',
			{
				textContent : this.#options.firstButtonText || '🆗',
				className : 'TravelNotes-BaseDialog-Button'
			},
			this.#BDEL.containerDiv.footerDiv
		);
		if ( this.#options.firstButtonText ) {
			this.#BDEL.containerDiv.footerDiv.okButton.style [ 'background-color' ] = 'green';
		}
		this.#BDEL.containerDiv.footerDiv.okButton.addEventListener (
			'click',

			// BaseDialogEventListeners.onOkButtonClick,
			this.#BDEL.onOkButtonClick.bind ( this.#BDEL ),
			false
		);

		if ( this.#options.secondButtonText ) {
			this.#BDEL.containerDiv.footerDiv.secondButton = theHTMLElementsFactory.create (
				'div',
				{
					textContent : this.#options.secondButtonText,
					className : 'TravelNotes-BaseDialog-Button'
				},
				this.#BDEL.containerDiv.footerDiv
			);
			this.#BDEL.containerDiv.footerDiv.secondButton.style [ 'background-color' ] = 'red';
			this.#BDEL.containerDiv.footerDiv.secondButton.addEventListener (
				'click',
				BaseDialogEventListeners.onCancelButtonClick,
				false
			);
		}

		this.footerHTMLElements.forEach (
			footerHTMLElement => this.#BDEL.containerDiv.footerDiv.appendChild ( footerHTMLElement )
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
		this.#BDEL.containerDiv.dialogX =
			( this.#BDEL.backgroundDiv.clientWidth - this.#BDEL.containerDiv.clientWidth ) / TWO;
		this.#BDEL.containerDiv.dialogY =
			( this.#BDEL.backgroundDiv.clientHeight - this.#BDEL.containerDiv.clientHeight ) / TWO;

		this.#BDEL.containerDiv.dialogX = Math.min (
			Math.max ( this.#BDEL.containerDiv.dialogX, DIALOG_DRAG_MARGIN ),
			this.#BDEL.backgroundDiv.clientWidth -
				this.#BDEL.containerDiv.clientWidth -
				DIALOG_DRAG_MARGIN
		);
		this.#BDEL.containerDiv.dialogY = Math.max (
			this.#BDEL.containerDiv.dialogY,
			DIALOG_DRAG_MARGIN
		);

		let dialogMaxHeight =
			this.#BDEL.backgroundDiv.clientHeight -
			Math.max ( this.#BDEL.containerDiv.dialogY, ZERO ) -
			DIALOG_DRAG_MARGIN;
		this.#BDEL.containerDiv.style.top = String ( this.#BDEL.containerDiv.dialogY ) + 'px';
		this.#BDEL.containerDiv.style.left = String ( this.#BDEL.containerDiv.dialogX ) + 'px';
		this.#BDEL.containerDiv.style [ 'max-height' ] = String ( dialogMaxHeight ) + 'px';
	}

	/**
	Build and show the dialog
	@private
	*/

	#show ( onPromiseOkFct, onPromiseErrorFct ) {

		this.#onPromiseOkFct = onPromiseOkFct;
		this.#onPromiseErrorFct = onPromiseErrorFct;

		this.#createHTML ( );
		document.body.appendChild ( this.#BDEL.backgroundDiv );
		this.#centerDialog ( );
		document.addEventListener ( 'keydown', BaseDialogEventListeners.onKeyDown, true );

		this.onShow ( );
	}

	constructor ( options = {} ) {
		this.#BDEL = new BaseDialogEventListeners ( this );
		this.#options = options;
	}

	/**
	Cancel button handler. Can be overloaded in the derived classes
	*/

	onCancel ( ) {
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
		this.#BDEL.containerDiv.waitDiv.classList.remove ( 'TravelNotes-Hidden' );
		this.#BDEL.containerDiv.footerDiv.okButton.classList.add ( 'TravelNotes-Hidden' );
	}

	/**
	Hide the wait section of the dialog and show the okbutton
	*/

	hideWait ( ) {
		this.#BDEL.containerDiv.waitDiv.classList.add ( 'TravelNotes-Hidden' );
		this.#BDEL.containerDiv.footerDiv.okButton.classList.remove ( 'TravelNotes-Hidden' );
	}

	/**
	Show the error section of the dialog
	*/

	showError ( errorText ) {

		theHTMLSanitizer.sanitizeToHtmlElement (
			errorText,
			this.#BDEL.containerDiv.errorDiv
		);
		this.#BDEL.containerDiv.errorDiv.classList.remove ( 'TravelNotes-Hidden' );
	}

	/**
	Hide the error section of the dialog
	*/

	hideError ( ) {
		this.#BDEL.containerDiv.errorDiv.textContent = '';
		this.#BDEL.containerDiv.errorDiv.classList.add ( 'TravelNotes-Hidden' );
	}

}

export default BaseDialog;

/*
--- End of BaseDialog.js file -------------------------------------------------------------------------------------------------
*/