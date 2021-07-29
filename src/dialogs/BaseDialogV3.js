import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theTranslator from '../UI/Translator.js';

import { ZERO, TWO } from '../util/Constants.js';

const OUR_DRAG_MARGIN = 20;

/**
@--------------------------------------------------------------------------------------------------------------------------

@class BaseDialogEvents
@classdesc This class contains static methods, static variables and event listeners for the BaseDialog class
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class BaseDialogEvents {
	static backgroundDiv = null;
	static containerDiv = null;

	static #dragStartX = ZERO;
	static #dragStartY = ZERO;
	static baseDialog = null;

	/**
	Reset the variables
	*/

	static reset ( ) {
		BaseDialogEvents.backgroundDiv = null;
		BaseDialogEvents.containerDiv = null;
		BaseDialogEvents.#dragStartX = ZERO;
		BaseDialogEvents.#dragStartY = ZERO;
		BaseDialogEvents.baseDialog = null;
	}

	/**
	Ok button click event listener
	*/

	static onOkButtonClick ( ) {
		BaseDialogEvents.onCloseDialog ( );
		document.body.removeChild ( BaseDialogEvents.backgroundDiv );
		BaseDialogEvents.baseDialog.onOk ( );
	}

	/**
	Cancel button click event listener
	*/

	static onCancelButtonClick ( ) {
		BaseDialogEvents.onCloseDialog ( );
		document.body.removeChild ( BaseDialogEvents.backgroundDiv );
		BaseDialogEvents.baseDialog.onCancel ( );
	}

	/**
	Event listener removing on close dialog
	*/

	static onCloseDialog ( ) {
		BaseDialogEvents.containerDiv.topBar.cancelButton.removeEventListener (
			'click', BaseDialogEvents.onCancelButtonClick, false
		);
		BaseDialogEvents.containerDiv.footerDiv.okButton.addEventListener ( 'click', BaseDialogEvents.onOkButtonClick, false );
		BaseDialogEvents.containerDiv.topBar.removeEventListener ( 'dragstart', BaseDialogEvents.onTopBarDragStart, false );
		BaseDialogEvents.containerDiv.topBar.removeEventListener ( 'dragend', BaseDialogEvents.onTopBarDragEnd, false );
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
		BaseDialogEvents.#dragStartX = dragStartEvent.screenX;
		BaseDialogEvents.#dragStartX = dragStartEvent.screenY;
	}

	/**
	Top bar dragend event listener
	*/

	static onTopBarDragEnd ( dragEndEvent ) {
		BaseDialogEvents.containerDiv.dialogX += dragEndEvent.screenX - BaseDialogEvents.#dragStartX;
		BaseDialogEvents.containerDiv.dialogX = Math.min (
			Math.max ( BaseDialogEvents.containerDiv.dialogX, OUR_DRAG_MARGIN ),
			BaseDialogEvents.backgroundDiv.clientWidth - BaseDialogEvents.containerDiv.clientWidth - OUR_DRAG_MARGIN
		);

		BaseDialogEvents.containerDiv.dialogY += dragEndEvent.screenY - BaseDialogEvents.#dragStartX;
		BaseDialogEvents.containerDiv.dialogY = Math.max ( BaseDialogEvents.containerDiv.dialogY, OUR_DRAG_MARGIN );

		let dialogMaxHeight =
			BaseDialogEvents.backgroundDiv.clientHeight -
			Math.max ( BaseDialogEvents.containerDiv.dialogY, ZERO ) -
			OUR_DRAG_MARGIN;

		BaseDialogEvents.containerDiv.style.left = String ( BaseDialogEvents.containerDiv.dialogX ) + 'px';
		BaseDialogEvents.containerDiv.style.top = String ( BaseDialogEvents.containerDiv.dialogY ) + 'px';
		BaseDialogEvents.containerDiv.style [ 'max-height' ] = String ( dialogMaxHeight ) + 'px';
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

	#onOk = null;
	#onError = null;

	/**
	Cancel button handler
	*/

	onCancel ( ) {
		this.#onError ( 'Canceled by user' );
	}

	/**
	Ok button handler
	*/

	onOk ( ) {

		// this.#onOk ( );
		this.#onError ( 'Ok by user' );
	}

	/**
	create the background
	*/

	#createBackgroundDiv ( ) {

		// A new element covering the entire screen is created, with drag and drop event listeners
		BaseDialogEvents.backgroundDiv = theHTMLElementsFactory.create (
			'div',
			{ id : 'TravelNotes-Background', className : 'TravelNotes-Background' }
		);
		BaseDialogEvents.backgroundDiv.addEventListener ( 'dragover', ( ) => null, false );
		BaseDialogEvents.backgroundDiv.addEventListener ( 'drop', ( ) => null, false );

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
		BaseDialogEvents.containerDiv = theHTMLElementsFactory.create (
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
			BaseDialogEvents.backgroundDiv
		);
	}

	/**
	create the animation top bar
	*/

	#CreateTopBar ( ) {

		BaseDialogEvents.containerDiv.topBar = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-TopBar',
				draggable : true,
				cancelButton : null
			},
			BaseDialogEvents.containerDiv
		);
		BaseDialogEvents.containerDiv.topBar.addEventListener ( 'dragstart', BaseDialogEvents.onTopBarDragStart, false );
		BaseDialogEvents.containerDiv.topBar.addEventListener ( 'dragend', BaseDialogEvents.onTopBarDragEnd, false );

		BaseDialogEvents.containerDiv.topBar.cancelButton = theHTMLElementsFactory.create (
			'div',
			{
				textContent : '❌',
				className : 'TravelNotes-BaseDialog-CancelButton',
				title : theTranslator.getText ( 'BaseDialog - Cancel' )
			},
			BaseDialogEvents.containerDiv.topBar
		);
		BaseDialogEvents.containerDiv.topBar.cancelButton.addEventListener (
			'click', BaseDialogEvents.onCancelButtonClick, false
		);
	}

	/**
	create the dialog wait animation
	*/

	#createWaitDiv ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-WaitAnimationBullet TravelNotes-Hidden'
			},
			theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-WaitAnimation TravelNotes-Hidden'
				},
				BaseDialogEvents.containerDiv.waitDiv = theHTMLElementsFactory.create (
					'div',
					{
						className : 'TravelNotes-BaseDialog-WaitDiv'
					},
					BaseDialogEvents.containerDiv
				)
			)
		);
	}

	/**
	create the dialog footer
	*/

	#createFooterDiv ( ) {
		BaseDialogEvents.containerDiv.footerDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-FooterDiv',
				okButton : null
			},
			BaseDialogEvents.containerDiv
		);

		BaseDialogEvents.containerDiv.footerDiv.okButton = theHTMLElementsFactory.create (
			'div',
			{
				textContent : '🆗',
				className : 'TravelNotes-BaseDialog-Button'
			},
			BaseDialogEvents.containerDiv.footerDiv
		);
		BaseDialogEvents.containerDiv.footerDiv.okButton.addEventListener ( 'click', BaseDialogEvents.onOkButtonClick, false );
	}

	/**
	Center the dialog o the screen
	*/

	#centerDialog ( ) {
		BaseDialogEvents.containerDiv.dialogX =
			( BaseDialogEvents.backgroundDiv.clientWidth - BaseDialogEvents.containerDiv.clientWidth ) / TWO;
		BaseDialogEvents.containerDiv.dialogY =
			( BaseDialogEvents.backgroundDiv.clientHeight - BaseDialogEvents.containerDiv.clientHeight ) / TWO;

		BaseDialogEvents.containerDiv.dialogX = Math.min (
			Math.max ( BaseDialogEvents.containerDiv.dialogX, OUR_DRAG_MARGIN ),
			BaseDialogEvents.backgroundDiv.clientWidth - BaseDialogEvents.containerDiv.clientWidth - OUR_DRAG_MARGIN
		);
		BaseDialogEvents.containerDiv.dialogY = Math.max ( BaseDialogEvents.containerDiv.dialogY, OUR_DRAG_MARGIN );

		let dialogMaxHeight =
			BaseDialogEvents.backgroundDiv.clientHeight -
			Math.max ( BaseDialogEvents.containerDiv.dialogY, ZERO ) -
			OUR_DRAG_MARGIN;
		BaseDialogEvents.containerDiv.style.top = String ( BaseDialogEvents.containerDiv.dialogY ) + 'px';
		BaseDialogEvents.containerDiv.style.left = String ( BaseDialogEvents.containerDiv.dialogX ) + 'px';
		BaseDialogEvents.containerDiv.style [ 'max-height' ] = String ( dialogMaxHeight ) + 'px';
	}

	/**
	Build and show the dialog
	*/

	#show ( onOk, onError ) {
		this.#onOk = onOk;
		this.#onError = onError;

		this.#createBackgroundDiv ( );
		this.#CreateContainerDiv ( );
		this.#CreateTopBar ( );
		BaseDialogEvents.containerDiv.headerDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-HeaderDiv'
			},
			BaseDialogEvents.containerDiv
		);
		BaseDialogEvents.containerDiv.contentDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-ContentDiv'
			},
			BaseDialogEvents.containerDiv
		);
		this.content.forEach ( content => BaseDialogEvents.containerDiv.contentDiv.appendChild ( content ) );
		BaseDialogEvents.containerDiv.errorDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-ErrorDiv TravelNotes-Hidden'
			},
			BaseDialogEvents.containerDiv
		);
		this.#createFooterDiv ( );

		document.body.appendChild ( BaseDialogEvents.backgroundDiv );
		this.#centerDialog ( );
	}

	constructor ( ) {
		BaseDialogEvents.reset ( );
		BaseDialogEvents.baseDialog = this;

	}

	get content ( ) {
		return [];
	}

	/**
	*/

	show ( ) {
		return new Promise ( ( onOk, onError ) => this.#show ( onOk, onError ) );
	}

}

export default BaseDialogV3;