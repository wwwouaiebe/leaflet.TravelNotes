import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theTranslator from '../UI/Translator.js';

import { ZERO, TWO } from '../util/Constants.js';

const OUR_DRAG_MARGIN = 20;

/**
@--------------------------------------------------------------------------------------------------------------------------

@class BaseDialogEventListeners
@classdesc This class contains static methods, static variables and event listeners for the BaseDialog class
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class BaseDialogEventListeners {
	static backgroundDiv = null;
	static containerDiv = null;

	static #dragStartX = ZERO;
	static #dragStartY = ZERO;
	static baseDialog = null;

	/**
	Reset the variables
	*/

	static reset ( ) {
		BaseDialogEventListeners.backgroundDiv = null;
		BaseDialogEventListeners.containerDiv = null;
		BaseDialogEventListeners.#dragStartX = ZERO;
		BaseDialogEventListeners.#dragStartY = ZERO;
		BaseDialogEventListeners.baseDialog = null;
	}

	/**
	Ok button click event listener
	*/

	static onOkButtonClick ( ) {
		if ( BaseDialogEventListeners.baseDialog.beforeOk ( ) ) {
			BaseDialogEventListeners.onCloseDialog ( );
			document.body.removeChild ( BaseDialogEventListeners.backgroundDiv );
			BaseDialogEventListeners.baseDialog.onOk ( );
			BaseDialogEventListeners.reset ( );
		}
	}

	/**
	Cancel button click event listener
	*/

	static onCancelButtonClick ( ) {
		BaseDialogEventListeners.onCloseDialog ( );
		document.body.removeChild ( BaseDialogEventListeners.backgroundDiv );
		BaseDialogEventListeners.baseDialog.onCancel ( );
		BaseDialogEventListeners.reset ( );
	}

	/**
	Event listener removing on close dialog
	*/

	static onCloseDialog ( ) {
		BaseDialogEventListeners.containerDiv.topBar.cancelButton.removeEventListener (
			'click', BaseDialogEventListeners.onCancelButtonClick, false
		);
		BaseDialogEventListeners.containerDiv.footerDiv.okButton.addEventListener (
			'click',
			BaseDialogEventListeners.onOkButtonClick,
			false
		);
		BaseDialogEventListeners.containerDiv.topBar.removeEventListener (
			'dragstart',
			BaseDialogEventListeners.onTopBarDragStart,
			false
		);
		BaseDialogEventListeners.containerDiv.topBar.removeEventListener (
			'dragend',
			BaseDialogEventListeners.onTopBarDragEnd,
			false
		);

	}

	/**
	Top bar dragstart event listener
	*/

	static onTopBarDragStart ( dragStartEvent ) {
		try {
			dragStartEvent.dataTransfer.setData ( 'Text', '1' );
		}
		catch ( err ) {
			if ( err instanceof Error ) {
				console.error ( err );
			}
		}
		BaseDialogEventListeners.#dragStartX = dragStartEvent.screenX;
		BaseDialogEventListeners.#dragStartX = dragStartEvent.screenY;
	}

	/**
	Top bar dragend event listener
	*/

	static onTopBarDragEnd ( dragEndEvent ) {
		BaseDialogEventListeners.containerDiv.dialogX += dragEndEvent.screenX - BaseDialogEventListeners.#dragStartX;
		BaseDialogEventListeners.containerDiv.dialogX =
			Math.min (
				Math.max ( BaseDialogEventListeners.containerDiv.dialogX, OUR_DRAG_MARGIN ),
				BaseDialogEventListeners.backgroundDiv.clientWidth -
					BaseDialogEventListeners.containerDiv.clientWidth -
					OUR_DRAG_MARGIN
			);

		BaseDialogEventListeners.containerDiv.dialogY += dragEndEvent.screenY - BaseDialogEventListeners.#dragStartX;
		BaseDialogEventListeners.containerDiv.dialogY =
			Math.max ( BaseDialogEventListeners.containerDiv.dialogY, OUR_DRAG_MARGIN );

		let dialogMaxHeight =
			BaseDialogEventListeners.backgroundDiv.clientHeight -
			Math.max ( BaseDialogEventListeners.containerDiv.dialogY, ZERO ) -
			OUR_DRAG_MARGIN;

		BaseDialogEventListeners.containerDiv.style.left = String ( BaseDialogEventListeners.containerDiv.dialogX ) + 'px';
		BaseDialogEventListeners.containerDiv.style.top = String ( BaseDialogEventListeners.containerDiv.dialogY ) + 'px';
		BaseDialogEventListeners.containerDiv.style [ 'max-height' ] = String ( dialogMaxHeight ) + 'px';
	}

}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class BaseDialogV3
@classdesc Base class used for dialogs
@abstract
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class BaseDialogV3 {

	#onPromiseOkFct = null;
	#onPromiseErrorFct = null;

	/**
	Cancel button handler
	*/

	onCancel ( ) {
		BaseDialogEventListeners.reset ( );
		this.#onPromiseErrorFct ( 'Canceled by user' );
	}

	/**
	Called before the dialog will be closed with the ok button. Can be overloaded in the derived classes
	@return {boolean} true when the dialog can be closed, false otherwise.
	*/

	beforeOk ( ) {
		return true;
	}

	/**
	Ok button handler
	*/

	onOk ( ) {
		this.#onPromiseOkFct ( );
	}

	/**
	create the background
	*/

	#createBackgroundDiv ( ) {

		// A new element covering the entire screen is created, with drag and drop event listeners
		BaseDialogEventListeners.backgroundDiv = theHTMLElementsFactory.create (
			'div',
			{ id : 'TravelNotes-Background', className : 'TravelNotes-Background' }
		);
		BaseDialogEventListeners.backgroundDiv.addEventListener ( 'dragover', ( ) => null, false );
		BaseDialogEventListeners.backgroundDiv.addEventListener ( 'drop', ( ) => null, false );

		/*
		myBackgroundDiv.addEventListener ( 'mousedown', myOnMouseDownBackground, false );
		myBackgroundDiv.addEventListener ( 'mouseup', myOnMouseUpBackground, false );
		myBackgroundDiv.addEventListener ( 'mousemove', myOnMouseMoveBackground, false );
		myBackgroundDiv.addEventListener ( 'wheel', myOnMouseWheelBackground, false );
		myBackgroundDiv.addEventListener ( 'contextmenu', myOnContextMenu, false );
		*/

	}

	/**
	create the dialog container
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
	create the animation top bar
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
	create the dialog wait animation
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
	create the dialog footer
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
	Center the dialog o the screen
	*/

	#centerDialog ( ) {
		BaseDialogEventListeners.containerDiv.dialogX =
			( BaseDialogEventListeners.backgroundDiv.clientWidth - BaseDialogEventListeners.containerDiv.clientWidth ) / TWO;
		BaseDialogEventListeners.containerDiv.dialogY =
			( BaseDialogEventListeners.backgroundDiv.clientHeight - BaseDialogEventListeners.containerDiv.clientHeight ) / TWO;

		BaseDialogEventListeners.containerDiv.dialogX = Math.min (
			Math.max ( BaseDialogEventListeners.containerDiv.dialogX, OUR_DRAG_MARGIN ),
			BaseDialogEventListeners.backgroundDiv.clientWidth -
				BaseDialogEventListeners.containerDiv.clientWidth -
				OUR_DRAG_MARGIN
		);
		BaseDialogEventListeners.containerDiv.dialogY = Math.max (
			BaseDialogEventListeners.containerDiv.dialogY,
			OUR_DRAG_MARGIN
		);

		let dialogMaxHeight =
			BaseDialogEventListeners.backgroundDiv.clientHeight -
			Math.max ( BaseDialogEventListeners.containerDiv.dialogY, ZERO ) -
			OUR_DRAG_MARGIN;
		BaseDialogEventListeners.containerDiv.style.top = String ( BaseDialogEventListeners.containerDiv.dialogY ) + 'px';
		BaseDialogEventListeners.containerDiv.style.left = String ( BaseDialogEventListeners.containerDiv.dialogX ) + 'px';
		BaseDialogEventListeners.containerDiv.style [ 'max-height' ] = String ( dialogMaxHeight ) + 'px';
	}

	/**
	Build and show the dialog
	*/

	#show ( onPromiseOkFct, onPromiseErrorFct ) {
		this.#onPromiseOkFct = onPromiseOkFct;
		this.#onPromiseErrorFct = onPromiseErrorFct;

		this.#createBackgroundDiv ( );
		this.#CreateContainerDiv ( );
		this.#CreateTopBar ( );
		BaseDialogEventListeners.containerDiv.headerDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-HeaderDiv'
			},
			BaseDialogEventListeners.containerDiv
		);

		BaseDialogEventListeners.containerDiv.contentDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-ContentDiv'
			},
			BaseDialogEventListeners.containerDiv
		);
		this.content.forEach ( content => BaseDialogEventListeners.containerDiv.contentDiv.appendChild ( content ) );

		BaseDialogEventListeners.containerDiv.errorDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-ErrorDiv TravelNotes-Hidden'
			},
			BaseDialogEventListeners.containerDiv
		);
		this.#createWaitDiv ( );
		this.#createFooterDiv ( );

		document.body.appendChild ( BaseDialogEventListeners.backgroundDiv );
		this.#centerDialog ( );
		this.onShow ( );
	}

	constructor ( ) {
		BaseDialogEventListeners.reset ( );
		BaseDialogEventListeners.baseDialog = this;

	}

	onShow ( ) {}

	get content ( ) { return []; }

	/**
	return the footer of the dialog box.
	*/

	get footer ( ) {
		return [];
	}

	get container ( ) { return BaseDialogEventListeners.containerDiv; }

	/**
	*/

	show ( ) {
		return new Promise ( ( onOk, onError ) => this.#show ( onOk, onError ) );
	}

	hideWait ( ) {
		BaseDialogEventListeners.containerDiv.waitDiv.classList.add ( 'TravelNotes-Hidden' );
		BaseDialogEventListeners.containerDiv.footerDiv.okButton.classList.remove ( 'TravelNotes-Hidden' );
	}

	showWait ( ) {
		BaseDialogEventListeners.containerDiv.waitDiv.classList.remove ( 'TravelNotes-Hidden' );
		BaseDialogEventListeners.containerDiv.footerDiv.okButton.classList.add ( 'TravelNotes-Hidden' );
	}

	showError ( errorText ) {
		BaseDialogEventListeners.containerDiv.errorDiv.textContent = errorText;
		BaseDialogEventListeners.containerDiv.errorDiv.classList.remove ( 'TravelNotes-Hidden' );
	}

	hideError ( ) {
		BaseDialogEventListeners.containerDiv.errorDiv.textContent = '';
		BaseDialogEventListeners.containerDiv.errorDiv.classList.add ( 'TravelNotes-Hidden' );
	}

}

export default BaseDialogV3;