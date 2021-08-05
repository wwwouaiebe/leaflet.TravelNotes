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

import { ZERO, DIALOG_DRAG_MARGIN } from '../util/Constants.js';

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
	Ok button click event listener
	*/

	onOkButtonClick ( ) {
		if ( this.#baseDialog.canClose ( ) ) {
			this.#baseDialog.onOk ( );
		}
	}

	/**
	Cancel button click event listener
	*/

	onCancelButtonClick ( ) {
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

}

export default BaseDialogEventListeners;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of BaseDialogEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/