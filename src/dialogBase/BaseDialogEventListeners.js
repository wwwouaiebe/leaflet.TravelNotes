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
Doc reviewed 20210901
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

@module dialogBase
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theGeometry from '../coreLib/Geometry.js';
import theTravelNotesData from '../data/TravelNotesData.js';

import { ZERO, ONE, LAT_LNG, DIALOG_DRAG_MARGIN } from '../main/Constants.js';

const ZOOM_DISPLACMENT = 50;

/**
@--------------------------------------------------------------------------------------------------------------------------

@class OkButtonClickEL
@classdesc click event listener for the ok button
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class OkButtonClickEL {

	#baseDialog = null;

	/*
	constructor
	*/

	constructor ( baseDialog ) {
		Object.freeze ( this );
		this.#baseDialog = baseDialog;
	}

	destructor ( ) {
		this.#baseDialog = null;
	}

	/**
	Event listener method
	*/

	handleEvent ( ) {
		this.#baseDialog.onOk ( );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class CancelButtonClickEL
@classdesc click event listener for the cancel button
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class CancelButtonClickEL {

	#baseDialog = null;

	/*
	constructor
	*/

	constructor ( baseDialog ) {
		Object.freeze ( this );
		this.#baseDialog = baseDialog;
	}

	destructor ( ) {
		this.#baseDialog = null;
	}

	/**
	Event listener method
	*/

	handleEvent ( ) {
		this.#baseDialog.onCancel ( );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class TopBarDragStartEL
@classdesc dragstart event listener for the top bar
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class TopBarDragStartEL {

	#dragData = null;

	/*
	constructor
	*/

	constructor ( dragData ) {
		Object.freeze ( this );
		this.#dragData = dragData;
	}

	destructor ( ) {
		this.#dragData = null;
	}

	/**
	Event listener method
	*/

	handleEvent ( dragStartEvent ) {
		this.#dragData.dragStartX = dragStartEvent.screenX;
		this.#dragData.dragStartY = dragStartEvent.screenY;
		dragStartEvent.dataTransfer.dropEffect = 'move';
		dragStartEvent.dataTransfer.effectAllowed = 'move';
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class TopBarDragEndEL
@classdesc dragend event event listener for the top bar
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class TopBarDragEndEL {

	#dragData = null;
	#containerDiv = null;
	#backgroundDiv= null;

	/*
	constructor
	*/

	constructor ( dragData, containerDiv, backgroundDiv ) {
		Object.freeze ( this );
		this.#dragData = dragData;
		this.#containerDiv = containerDiv;
		this.#backgroundDiv = backgroundDiv;
	}

	destructor ( ) {
		this.#dragData = null;
		this.#containerDiv = null;
		this.#backgroundDiv = null;
	}

	/**
	Event listener method
	*/

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

@class KeyboardKeydownEL
@classdesc keydown event listener
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class KeyboardKeydownEL {

	#baseDialog = null;

	/*
	constructor
	*/

	constructor ( baseDialog ) {
		Object.freeze ( this );
		this.#baseDialog = baseDialog;
	}

	destructor ( ) {
		this.#baseDialog = null;
	}

	/**
	Event listener method
	*/

	handleEvent ( keyDownEvent ) {

		if ( ! this.#baseDialog.keyboardELEnabled ) {
			return;
		}

		if ( 'Escape' === keyDownEvent.key || 'Esc' === keyDownEvent.key ) {
			this.#baseDialog.onCancel ( );
		}
		else if ( 'Enter' === keyDownEvent.key ) {
			this.#baseDialog.onOk ( );
		}

	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class BackgroundLeftPanEL
@classdesc leftpan event listener for the background
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class BackgroundLeftPanEL {

	#mapCenter = [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ];

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	handleEvent ( leftPanEvent ) {
		if ( 'start' === leftPanEvent.action ) {
			this.#mapCenter = theTravelNotesData.map.getCenter ( );
			return;
		}
		let latLngAtStart = theGeometry.screenCoordToLatLng (
			leftPanEvent.startX,
			leftPanEvent.startY
		);
		let latLngAtEnd = theGeometry.screenCoordToLatLng ( leftPanEvent.endX, leftPanEvent.endY );
		theTravelNotesData.map.panTo (
			[
				this.#mapCenter.lat +
					latLngAtStart [ ZERO ] -
					latLngAtEnd [ ZERO ],
				this.#mapCenter.lng +
					latLngAtStart [ ONE ] -
					latLngAtEnd [ ONE ]
			]
		);
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class BackgroundRightPanEL
@classdesc rightpan event listener for the background
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class BackgroundRightPanEL {

	#initialZoom = ZERO;
	#startPoint = null;

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	handleEvent ( rightPanEvent ) {
		if ( 'start' === rightPanEvent.action ) {
			this.#initialZoom = theTravelNotesData.map.getZoom ( );
			this.#startPoint = window.L.point ( rightPanEvent.clientX, rightPanEvent.clientY );
			return;
		}
		let zoom = Math.floor ( this.#initialZoom + ( ( rightPanEvent.startY - rightPanEvent.endY ) / ZOOM_DISPLACMENT ) );
		zoom = Math.min ( theTravelNotesData.map.getMaxZoom ( ), zoom );
		zoom = Math.max ( theTravelNotesData.map.getMinZoom ( ), zoom );
		theTravelNotesData.map.setZoomAround ( this.#startPoint, zoom );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class BackgroundWheelEL
@classdesc wheel event listener for the background
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class BackgroundWheelEL {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	handleEvent ( wheelEvent ) {
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
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class BackgroundContextMenuEL
@classdesc contextmenu event listener for the background
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class BackgroundContextMenuEL {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	handleEvent ( contextmenuEvent ) {
		contextmenuEvent.preventDefault ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class BackgroundDragOverEL
@classdesc BaseDialog drag over event listener based on the EventListener API.
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class BackgroundDragOverEL {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	handleEvent ( dragEvent ) {
		dragEvent.preventDefault ( );
	}
}

export {
	OkButtonClickEL,
	CancelButtonClickEL,
	TopBarDragStartEL,
	TopBarDragEndEL,
	KeyboardKeydownEL,
	BackgroundLeftPanEL,
	BackgroundRightPanEL,
	BackgroundWheelEL,
	BackgroundContextMenuEL,
	BackgroundDragOverEL
};

/*
@------------------------------------------------------------------------------------------------------------------------------

end of BaseDialogEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/