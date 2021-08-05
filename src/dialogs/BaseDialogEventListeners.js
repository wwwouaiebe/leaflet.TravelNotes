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

@class BaseDialogOkButtonClickEventListener
@classdesc Event listener for click event on the ok button based on the EventListener API.
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class BaseDialogOkButtonClickEventListener {

	#baseDialog = null;

	constructor ( baseDialog ) {
		this.#baseDialog = baseDialog;
	}

	handleEvent ( ) {
		if ( this.#baseDialog.canClose ( ) ) {
			this.#baseDialog.onOk ( );
		}
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class BaseDialogCancelButtonClickEventListener
@classdesc Event listener for click event on the cancel button based on the EventListener API.
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class BaseDialogCancelButtonClickEventListener {

	#baseDialog = null;

	constructor ( baseDialog ) {
		this.#baseDialog = baseDialog;
	}

	handleEvent ( ) {
		this.#baseDialog.onCancel ( );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class BaseDialogTopBarDragStartEventListener
@classdesc Event listener for dragstart event on the top bar based on the EventListener API.
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class BaseDialogTopBarDragStartEventListener {

	#dragData = null;

	constructor ( dragData ) {
		this.#dragData = dragData;
	}

	handleEvent ( dragStartEvent ) {
		try {
			dragStartEvent.dataTransfer.setData ( 'Text', '1' );
		}
		catch ( err ) {
			if ( err instanceof Error ) {
				console.error ( err );
			}
		}
		this.#dragData.dragStartX = dragStartEvent.screenX;
		this.#dragData.dragStartY = dragStartEvent.screenY;
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class BaseDialogTopBarDragEndEventListener
@classdesc Event listener for dragend event on the top bar based on the EventListener API.
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class BaseDialogTopBarDragEndEventListener {

	#dragData = null;
	#containerDiv = null;
	#backgroundDiv= null;

	constructor ( dragData, containerDiv, backgroundDiv ) {
		this.#dragData = dragData;
		this.#containerDiv = containerDiv;
		this.#backgroundDiv = backgroundDiv;
	}

	handleEvent ( dragEndEvent ) {
		this.#dragData.dialogX += dragEndEvent.screenX - this.#dragData.dragStartX;
		this.#dragData.dialogX =
			Math.min (
				Math.max ( this.#dragData.dialogX, DIALOG_DRAG_MARGIN ),
				this.#backgroundDiv.clientWidth -
					this.#containerDiv.clientWidth -
					DIALOG_DRAG_MARGIN
			);

		this.#dragData.dialogY += dragEndEvent.screenY - this.#dragData.dragStartY;
		this.#dragData.dialogY =
			Math.max ( this.#dragData.dialogY, DIALOG_DRAG_MARGIN );

		let dialogMaxHeight =
			this.#backgroundDiv.clientHeight -
			Math.max ( this.#dragData.dialogY, ZERO ) -
			DIALOG_DRAG_MARGIN;

		this.#containerDiv.style.left = String ( this.#dragData.dialogX ) + 'px';
		this.#containerDiv.style.top = String ( this.#dragData.dialogY ) + 'px';
		this.#containerDiv.style [ 'max-height' ] = String ( dialogMaxHeight ) + 'px';
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class BaseDialogKeydownEventListener
@classdesc BaseDialog keydown event listener based on the EventListener API.
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class BaseDialogKeydownEventListener {

	#baseDialog = null;

	constructor ( baseDialog ) {
		this.#baseDialog = baseDialog;
	}

	handleEvent ( keyDownEvent ) {

		if ( ! this.#baseDialog.keyboardEventListenerEnabled ) {
			return;
		}

		if ( 'Escape' === keyDownEvent.key || 'Esc' === keyDownEvent.key ) {
			this.#baseDialog.onCancel ( );
		}
		else if ( 'Enter' === keyDownEvent.key && this.#baseDialog.canClose ( ) ) {
			this.#baseDialog.onOk ( );
		}

	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class BaseDialogBackgroundEventListeners
@classdesc Mouse event listeners on the background of the dialog boxes. Pan and zoom on the map.
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class BaseDialogBackgroundEventListeners {

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
	mouse down on background event listener
	*/

	static onMouseDown ( mouseEvent ) {
		if ( 'TravelNotes-Background' !== mouseEvent.target.id ) {
			return;
		}

		BaseDialogBackgroundEventListeners.#panMapData.panOngoing = true;
		BaseDialogBackgroundEventListeners.#panMapData.startPanX = mouseEvent.screenX;
		BaseDialogBackgroundEventListeners.#panMapData.startPanY = mouseEvent.screenY;
		BaseDialogBackgroundEventListeners.#panMapData.mapCenter = theTravelNotesData.map.getCenter ( );
	}

	/**
	mouse move on background event listener
	*/

	static onMouseMove ( mouseEvent ) {
		if ( BaseDialogBackgroundEventListeners.#panMapData.panOngoing ) {
			mouseEvent.preventDefault ( );
			mouseEvent.stopPropagation ( );
			let latLngAtStart = theGeometry.screenCoordToLatLng (
				BaseDialogBackgroundEventListeners.#panMapData.startPanX,
				BaseDialogBackgroundEventListeners.#panMapData.startPanY
			);
			let latLngAtEnd = theGeometry.screenCoordToLatLng ( mouseEvent.screenX, mouseEvent.screenY );
			theTravelNotesData.map.panTo (
				[
					BaseDialogBackgroundEventListeners.#panMapData.mapCenter.lat +
						latLngAtStart [ ZERO ] -
						latLngAtEnd [ ZERO ],
					BaseDialogBackgroundEventListeners.#panMapData.mapCenter.lng +
						latLngAtStart [ ONE ] -
						latLngAtEnd [ ONE ]
				]
			);
		}
	}

	/**
	mouse up on background event listener
	*/

	static onMouseUp ( mouseEvent ) {
		if ( 'TravelNotes-Background' !== mouseEvent.target.id ) {
			return;
		}
		BaseDialogBackgroundEventListeners.onMouseMove ( mouseEvent );
		BaseDialogBackgroundEventListeners.#panMapData.panOngoing = false;
	}

	/**
	mouse wheel on background event listener
	*/

	static onMouseWheel ( wheelEvent ) {
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

	static onContextMenu ( contextmenuEvent ) {
		contextmenuEvent.preventDefault ( );
	}

}

export {
	BaseDialogOkButtonClickEventListener,
	BaseDialogCancelButtonClickEventListener,
	BaseDialogTopBarDragStartEventListener,
	BaseDialogTopBarDragEndEventListener,
	BaseDialogKeydownEventListener,
	BaseDialogBackgroundEventListeners
};

/*
@------------------------------------------------------------------------------------------------------------------------------

end of BaseDialogEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/