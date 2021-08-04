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
	A reference to the BaseDialog js instance
	*/

	#baseDialog = null;

	constructor ( baseDialog ) {

		this.#baseDialog = baseDialog;

		/**
		A reference to the container HTML div
		*/

		this.containerDiv = null;

		/**
		A reference to the background HTML div
		*/

		this.backgroundDiv = null;

	}

	/**
	The x screen coordinate for dialog dragging
	@private
	*/

	#dragStartX = ZERO;

	/**
	The y screen coordinate for dialog dragging
	@private
	*/

	#dragStartY = ZERO;

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
	Ok button click event listener
	*/

	onOkButtonClick ( ) {
		if ( this.#baseDialog.canClose ( ) ) {
			document.body.removeChild ( this.backgroundDiv );
			this.#baseDialog.onOk ( );
		}
	}

	/**
	Cancel button click event listener
	*/

	onCancelButtonClick ( ) {
		document.body.removeChild ( this.backgroundDiv );
		this.#baseDialog.onCancel ( );
	}

	/**
	Top bar dragstart event listener
	*/

	onTopBarDragStart ( dragStartEvent ) {
		try {
			dragStartEvent.dataTransfer.setData ( 'Text', '1' );
		}
		catch ( err ) {
			if ( err instanceof Error ) {
				console.error ( err );
			}
		}
		this.#dragStartX = dragStartEvent.screenX;
		this.#dragStartY = dragStartEvent.screenY;
	}

	/**
	Top bar dragend event listener
	*/

	onTopBarDragEnd ( dragEndEvent ) {
		this.containerDiv.dialogX += dragEndEvent.screenX - this.#dragStartX;
		this.containerDiv.dialogX =
			Math.min (
				Math.max ( this.containerDiv.dialogX, DIALOG_DRAG_MARGIN ),
				this.backgroundDiv.clientWidth -
					this.containerDiv.clientWidth -
					DIALOG_DRAG_MARGIN
			);

		this.containerDiv.dialogY += dragEndEvent.screenY - this.#dragStartY;
		this.containerDiv.dialogY =
			Math.max ( this.containerDiv.dialogY, DIALOG_DRAG_MARGIN );

		let dialogMaxHeight =
			this.backgroundDiv.clientHeight -
			Math.max ( this.containerDiv.dialogY, ZERO ) -
			DIALOG_DRAG_MARGIN;

		this.containerDiv.style.left = String ( this.containerDiv.dialogX ) + 'px';
		this.containerDiv.style.top = String ( this.containerDiv.dialogY ) + 'px';
		this.containerDiv.style [ 'max-height' ] = String ( dialogMaxHeight ) + 'px';
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