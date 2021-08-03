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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210803
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file BaseDialogEventListeners.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module BaseDialogEventListeners
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theGeometry from '../util/Geometry.js';
import theTravelNotesData from '../data/TravelNotesData.js';

import { ZERO, ONE, LAT_LNG, DIALOG_DRAG_MARGIN } from '../util/Constants.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class BaseDialogEventListeners
@classdesc This class contains static methods, static variables and event listeners for the BaseDialog class
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class BaseDialogEventListeners {

	/**
	A reference to the background HTML div
	*/

	static backgroundDiv = null;

	/**
	A reference to the container HTML div
	*/

	static containerDiv = null;

	/**
	A reference to the BaseDialog js instance
	*/

	static baseDialog = null;

	/**
	The x screen coordinate for dialog dragging
	@private
	*/

	static #dragStartX = ZERO;

	/**
	The y screen coordinate for dialog dragging
	@private
	*/

	static #dragStartY = ZERO;

	/**
	pan variables
	@private
	*/

	static #panMapData = {
		panOngoing : false,
		startPanX : ZERO,
		startPanY : ZERO,
		mapCenter : [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ]
	};

	/**
	stack to push and pop the global vars when more than one dialog is opened
	*/

	static #globalVarsStack = [];

	/**
	Push the global vars on the stack
	*/

	static globalVarsPush ( ) {
		BaseDialogEventListeners.#globalVarsStack.push (
			{
				backgroundDiv : BaseDialogEventListeners.backgroundDiv,
				containerDiv : BaseDialogEventListeners.containerDiv,
				dragStartX : BaseDialogEventListeners.#dragStartX,
				dragStartY : BaseDialogEventListeners.#dragStartY,
				baseDialog : BaseDialogEventListeners.baseDialog,
				panMapData : BaseDialogEventListeners.#panMapData
			}
		);
		BaseDialogEventListeners.reset ( );
	}

	/**
	Pop the global vars from the stack
	*/

	static globalVarsPop ( ) {
		let globalVars = BaseDialogEventListeners.#globalVarsStack.pop ( );

		BaseDialogEventListeners.backgroundDiv = globalVars.backgroundDiv;
		BaseDialogEventListeners.containerDiv = globalVars.containerDiv;
		BaseDialogEventListeners.#dragStartX = globalVars.dragStartX;
		BaseDialogEventListeners.#dragStartY = globalVars.dragStartY;
		BaseDialogEventListeners.baseDialog = globalVars.baseDialog;
		BaseDialogEventListeners.#panMapData = globalVars.panMapData;
	}

	/**
	Reset the variables
	*/

	static reset ( ) {
		BaseDialogEventListeners.backgroundDiv = null;
		BaseDialogEventListeners.containerDiv = null;
		BaseDialogEventListeners.#dragStartX = ZERO;
		BaseDialogEventListeners.#dragStartY = ZERO;
		BaseDialogEventListeners.baseDialog = null;
		BaseDialogEventListeners.#panMapData = {
			panOngoing : false,
			startPanX : ZERO,
			startPanY : ZERO,
			mapCenter : [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ]
		};
	}

	/**
	Ok button click event listener
	*/

	static onOkButtonClick ( ) {
		if ( BaseDialogEventListeners.baseDialog.canClose ( ) ) {
			BaseDialogEventListeners.onCloseDialog ( );
			document.body.removeChild ( BaseDialogEventListeners.backgroundDiv );
			BaseDialogEventListeners.baseDialog.onOk ( );
			BaseDialogEventListeners.globalVarsPop ( );
		}
	}

	/**
	Cancel button click event listener
	*/

	static onCancelButtonClick ( ) {
		BaseDialogEventListeners.onCloseDialog ( );
		document.body.removeChild ( BaseDialogEventListeners.backgroundDiv );
		BaseDialogEventListeners.baseDialog.onCancel ( );
		BaseDialogEventListeners.globalVarsPop ( );
	}

	/**
	Event listener removing on close dialog
	*/

	static onCloseDialog ( ) {
		BaseDialogEventListeners.containerDiv.topBar.cancelButton.removeEventListener (
			'click', BaseDialogEventListeners.onCancelButtonClick, false
		);
		BaseDialogEventListeners.containerDiv.footerDiv.okButton.removeEventListener (
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
		document.removeEventListener ( 'keydown', BaseDialogEventListeners.onKeyDown, true );

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
		BaseDialogEventListeners.#dragStartY = dragStartEvent.screenY;
	}

	/**
	Top bar dragend event listener
	*/

	static onTopBarDragEnd ( dragEndEvent ) {
		BaseDialogEventListeners.containerDiv.dialogX += dragEndEvent.screenX - BaseDialogEventListeners.#dragStartX;
		BaseDialogEventListeners.containerDiv.dialogX =
			Math.min (
				Math.max ( BaseDialogEventListeners.containerDiv.dialogX, DIALOG_DRAG_MARGIN ),
				BaseDialogEventListeners.backgroundDiv.clientWidth -
					BaseDialogEventListeners.containerDiv.clientWidth -
					DIALOG_DRAG_MARGIN
			);

		BaseDialogEventListeners.containerDiv.dialogY += dragEndEvent.screenY - BaseDialogEventListeners.#dragStartX;
		BaseDialogEventListeners.containerDiv.dialogY =
			Math.max ( BaseDialogEventListeners.containerDiv.dialogY, DIALOG_DRAG_MARGIN );

		let dialogMaxHeight =
			BaseDialogEventListeners.backgroundDiv.clientHeight -
			Math.max ( BaseDialogEventListeners.containerDiv.dialogY, ZERO ) -
			DIALOG_DRAG_MARGIN;

		BaseDialogEventListeners.containerDiv.style.left = String ( BaseDialogEventListeners.containerDiv.dialogX ) + 'px';
		BaseDialogEventListeners.containerDiv.style.top = String ( BaseDialogEventListeners.containerDiv.dialogY ) + 'px';
		BaseDialogEventListeners.containerDiv.style [ 'max-height' ] = String ( dialogMaxHeight ) + 'px';
	}

	/**
	keyboard event listener
	*/

	static onKeyDown ( keyBoardEvent ) {

		// if ( myKeyboardEventListenerEnabled ) {
		if ( 'Escape' === keyBoardEvent.key || 'Esc' === keyBoardEvent.key ) {
			BaseDialogEventListeners.onCancelButtonClick ( );
		}
		else if ( 'Enter' === keyBoardEvent.key ) {
			BaseDialogEventListeners.onOkButtonClick ( );
		}

		// }

	}

	/**
	mouse down on background event listener
	*/

	static onMouseDownBackground ( mouseEvent ) {
		if ( 'TravelNotes-Background' !== mouseEvent.target.id ) {
			return;
		}

		BaseDialogEventListeners.#panMapData.panOngoing = true;
		BaseDialogEventListeners.#panMapData.startPanX = mouseEvent.screenX;
		BaseDialogEventListeners.#panMapData.startPanY = mouseEvent.screenY;
		BaseDialogEventListeners.#panMapData.mapCenter = theTravelNotesData.map.getCenter ( );
	}

	/**
	mouse move on background event listener
	*/

	static onMouseMoveBackground ( mouseEvent ) {
		if ( BaseDialogEventListeners.#panMapData.panOngoing ) {
			mouseEvent.preventDefault ( );
			mouseEvent.stopPropagation ( );
			let latLngAtStart = theGeometry.screenCoordToLatLng (
				BaseDialogEventListeners.#panMapData.startPanX,
				BaseDialogEventListeners.#panMapData.startPanY
			);
			let latLngAtEnd = theGeometry.screenCoordToLatLng ( mouseEvent.screenX, mouseEvent.screenY );
			theTravelNotesData.map.panTo (
				[
					BaseDialogEventListeners.#panMapData.mapCenter.lat + latLngAtStart [ ZERO ] - latLngAtEnd [ ZERO ],
					BaseDialogEventListeners.#panMapData.mapCenter.lng + latLngAtStart [ ONE ] - latLngAtEnd [ ONE ]
				]
			);
		}
	}

	/**
	mouse up on background event listener
	*/

	static onMouseUpBackground ( mouseEvent ) {
		if ( 'TravelNotes-Background' !== mouseEvent.target.id ) {
			return;
		}
		BaseDialogEventListeners.onMouseMoveBackground ( mouseEvent );
		BaseDialogEventListeners.#panMapData.panOngoing = false;
	}

	/**
	mouse wheel on background event listener
	*/

	static onMouseWheelBackground ( wheelEvent ) {
		if ( 'TravelNotes-Background' !== wheelEvent.target.id ) {
			return;
		}

		let zoom = theTravelNotesData.map.getZoom ( ) + ( ZERO > wheelEvent.deltaY ? ONE : -ONE );
		zoom = Math.min ( theTravelNotesData.map.getMaxZoom ( ), zoom );
		zoom = Math.max ( theTravelNotesData.map.getMinZoom ( ), zoom );
		theTravelNotesData.map.setZoomAround (
			window.L.point ( wheelEvent.clientX, wheelEvent.clientY ),
			zoom
		);
	}

	/**
	context menu on background event listener
	*/

	static onContextMenuBackground ( contextmenuEvent ) {
		contextmenuEvent.preventDefault ( );
	}

}

export default BaseDialogEventListeners;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of BaseDialogEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/