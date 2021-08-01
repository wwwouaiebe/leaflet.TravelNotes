import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theTranslator from '../UI/Translator.js';
import BaseDialogEventListeners from '../dialogs/BaseDialogEventListeners.js';
import theHTMLSanitizer from '../util/HTMLSanitizer.js';

import { ZERO, TWO, DIALOG_DRAG_MARGIN } from '../util/Constants.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class BaseDialogV3
@classdesc Base class used for dialogs
@abstract
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class BaseDialogV3 {

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
		BaseDialogEventListeners.backgroundDiv = theHTMLElementsFactory.create (
			'div',
			{ id : 'TravelNotes-Background', className : 'TravelNotes-Background' }
		);
		BaseDialogEventListeners.backgroundDiv.addEventListener ( 'dragover', ( ) => null, false );
		BaseDialogEventListeners.backgroundDiv.addEventListener ( 'drop', ( ) => null, false );

		BaseDialogEventListeners.backgroundDiv.addEventListener (
			'mousedown',
			BaseDialogEventListeners.onMouseDownBackground,
			false
		);
		BaseDialogEventListeners.backgroundDiv.addEventListener (
			'mouseup',
			BaseDialogEventListeners.onMouseUpBackground,
			false
		);
		BaseDialogEventListeners.backgroundDiv.addEventListener (
			'mousemove',
			BaseDialogEventListeners.onMouseMoveBackground,
			false
		);
		BaseDialogEventListeners.backgroundDiv.addEventListener (
			'wheel',
			BaseDialogEventListeners.onMouseWheelBackground,
			false
		);
		BaseDialogEventListeners.backgroundDiv.addEventListener (
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
		BaseDialogEventListeners.containerDiv = theHTMLElementsFactory.create (
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
			BaseDialogEventListeners.backgroundDiv
		);
	}

	/**
	Create the animation top bar
	@private
	*/

	#CreateTopBar ( ) {

		BaseDialogEventListeners.containerDiv.topBar = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-TopBar',
				draggable : true,
				cancelButton : null
			},
			BaseDialogEventListeners.containerDiv
		);
		BaseDialogEventListeners.containerDiv.topBar.addEventListener (
			'dragstart',
			BaseDialogEventListeners.onTopBarDragStart,
			false
		);
		BaseDialogEventListeners.containerDiv.topBar.addEventListener (
			'dragend',
			BaseDialogEventListeners.onTopBarDragEnd,
			false
		);

		BaseDialogEventListeners.containerDiv.topBar.cancelButton = theHTMLElementsFactory.create (
			'div',
			{
				textContent : '❌',
				className : 'TravelNotes-BaseDialog-CancelButton',
				title : theTranslator.getText ( 'BaseDialog - Cancel' )
			},
			BaseDialogEventListeners.containerDiv.topBar
		);
		BaseDialogEventListeners.containerDiv.topBar.cancelButton.addEventListener (
			'click', BaseDialogEventListeners.onCancelButtonClick, false
		);
	}

	/**
	Create the header div
	@private
	*/

	#createHeaderDiv ( ) {
		BaseDialogEventListeners.containerDiv.headerDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-HeaderDiv'
			},
			BaseDialogEventListeners.containerDiv
		);

		theHTMLElementsFactory.create (
			'text',
			{
				value : this.title
			}
			,
			BaseDialogEventListeners.containerDiv.headerDiv
		);
	}

	/**
	Create the content div
	@private
	*/

	#createContentDiv ( ) {
		BaseDialogEventListeners.containerDiv.contentDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-ContentDiv'
			},
			BaseDialogEventListeners.containerDiv
		);

		this.content.forEach ( content => BaseDialogEventListeners.containerDiv.contentDiv.appendChild ( content ) );
	}

	/**
	Create the error div
	@private
	*/

	#createErrorDiv ( ) {
		BaseDialogEventListeners.containerDiv.errorDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-ErrorDiv TravelNotes-Hidden'
			},
			BaseDialogEventListeners.containerDiv
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
				BaseDialogEventListeners.containerDiv.waitDiv = theHTMLElementsFactory.create (
					'div',
					{
						className : 'TravelNotes-BaseDialog-WaitDiv  TravelNotes-Hidden'
					},
					BaseDialogEventListeners.containerDiv
				)
			)
		);
	}

	/**
	Create the dialog footer
	@private
	*/

	#createFooterDiv ( ) {
		BaseDialogEventListeners.containerDiv.footerDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-FooterDiv',
				okButton : null
			},
			BaseDialogEventListeners.containerDiv
		);

		BaseDialogEventListeners.containerDiv.footerDiv.okButton = theHTMLElementsFactory.create (
			'div',
			{
				textContent : '🆗',
				className : 'TravelNotes-BaseDialog-Button'
			},
			BaseDialogEventListeners.containerDiv.footerDiv
		);
		BaseDialogEventListeners.containerDiv.footerDiv.okButton.addEventListener (
			'click',
			BaseDialogEventListeners.onOkButtonClick,
			false
		);

		this.footer.forEach ( footer => BaseDialogEventListeners.containerDiv.footerDiv.appendChild ( footer ) );
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
		BaseDialogEventListeners.containerDiv.dialogX =
			( BaseDialogEventListeners.backgroundDiv.clientWidth - BaseDialogEventListeners.containerDiv.clientWidth ) / TWO;
		BaseDialogEventListeners.containerDiv.dialogY =
			( BaseDialogEventListeners.backgroundDiv.clientHeight - BaseDialogEventListeners.containerDiv.clientHeight ) / TWO;

		BaseDialogEventListeners.containerDiv.dialogX = Math.min (
			Math.max ( BaseDialogEventListeners.containerDiv.dialogX, DIALOG_DRAG_MARGIN ),
			BaseDialogEventListeners.backgroundDiv.clientWidth -
				BaseDialogEventListeners.containerDiv.clientWidth -
				DIALOG_DRAG_MARGIN
		);
		BaseDialogEventListeners.containerDiv.dialogY = Math.max (
			BaseDialogEventListeners.containerDiv.dialogY,
			DIALOG_DRAG_MARGIN
		);

		let dialogMaxHeight =
			BaseDialogEventListeners.backgroundDiv.clientHeight -
			Math.max ( BaseDialogEventListeners.containerDiv.dialogY, ZERO ) -
			DIALOG_DRAG_MARGIN;
		BaseDialogEventListeners.containerDiv.style.top = String ( BaseDialogEventListeners.containerDiv.dialogY ) + 'px';
		BaseDialogEventListeners.containerDiv.style.left = String ( BaseDialogEventListeners.containerDiv.dialogX ) + 'px';
		BaseDialogEventListeners.containerDiv.style [ 'max-height' ] = String ( dialogMaxHeight ) + 'px';
	}

	/**
	Build and show the dialog
	@private
	*/

	#show ( onPromiseOkFct, onPromiseErrorFct ) {

		this.#onPromiseOkFct = onPromiseOkFct;
		this.#onPromiseErrorFct = onPromiseErrorFct;

		this.#createHTML ( );
		document.body.appendChild ( BaseDialogEventListeners.backgroundDiv );
		this.#centerDialog ( );
		document.addEventListener ( 'keydown', BaseDialogEventListeners.onKeyDown, true );

		this.onShow ( );
	}

	constructor ( ) {
		BaseDialogEventListeners.reset ( );
		BaseDialogEventListeners.baseDialog = this;
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
	Get the HTML content section of the dialog is show. Can be overloaded in the derived classes
	@readonly
	*/

	get title ( ) { return ''; }

	get content ( ) { return []; }

	/**
	Get the HTML footer section of the dialog is show. Can be overloaded in the derived classes
	@readonly
	*/

	get footer ( ) {
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
		BaseDialogEventListeners.containerDiv.waitDiv.classList.remove ( 'TravelNotes-Hidden' );
		BaseDialogEventListeners.containerDiv.footerDiv.okButton.classList.add ( 'TravelNotes-Hidden' );
	}

	/**
	Hide the wait section of the dialog and show the okbutton
	*/

	hideWait ( ) {
		BaseDialogEventListeners.containerDiv.waitDiv.classList.add ( 'TravelNotes-Hidden' );
		BaseDialogEventListeners.containerDiv.footerDiv.okButton.classList.remove ( 'TravelNotes-Hidden' );
	}

	/**
	Show the error section of the dialog
	*/

	showError ( errorText ) {

		theHTMLSanitizer.sanitizeToHtmlElement (
			errorText,
			BaseDialogEventListeners.containerDiv.errorDiv
		);
		BaseDialogEventListeners.containerDiv.errorDiv.classList.remove ( 'TravelNotes-Hidden' );
	}

	/**
	Hide the error section of the dialog
	*/

	hideError ( ) {
		BaseDialogEventListeners.containerDiv.errorDiv.textContent = '';
		BaseDialogEventListeners.containerDiv.errorDiv.classList.add ( 'TravelNotes-Hidden' );
	}

}

export default BaseDialogV3;