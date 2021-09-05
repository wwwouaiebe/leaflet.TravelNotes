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

@file PanEventDispatcher.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module dialogPanEventDispatcher

@------------------------------------------------------------------------------------------------------------------------------
*/

import { ZERO, ONE, TWO, NOT_FOUND } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class MouseEL
@classdesc mouse event listener fro the target. Redispath the mouse events as leftpan or rightpan or middlepan events
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class MouseEL {

	#panOngoing = false;
	#startPanX = ZERO;
	#startPanY = ZERO;
	#target = null;
	#button = ZERO;
	#eventType = '';

	/**
	Redispatch the events as pan events
	@private
	*/

	#dispatchEvent ( mouseEvent, action ) {
		let panEvent = new Event ( this.#eventType );
		panEvent.startX = this.#startPanX;
		panEvent.startY = this.#startPanY;
		panEvent.endX = mouseEvent.screenX;
		panEvent.endY = mouseEvent.screenY;
		panEvent.clientX = mouseEvent.clientX;
		panEvent.clientY = mouseEvent.clientY;
		panEvent.action = action;
		this.#target.dispatchEvent ( panEvent );
	}

	/*
	constructor
	*/

	constructor ( target, button ) {
		Object.freeze ( this );
		this.#target = target;
		this.#button = button;
		switch ( button ) {
		case ZERO :
			this.#eventType = 'leftpan';
			break;
		case ONE :
			this.#eventType = 'middlepan';
			break;
		case TWO :
			this.#eventType = 'rightpan';
			break;
		default :
			this.#button = NOT_FOUND;
			break;
		}
	}

	/**
	handleEvent
	Save some data from the event and then redispatch as pan events
	*/

	handleEvent ( mouseEvent ) {
		switch ( mouseEvent.type ) {
		case 'mousedown' :
			if (
				mouseEvent.button === this.#button
				&&
				mouseEvent.target === this.#target
			) {
				this.#startPanX = mouseEvent.screenX;
				this.#startPanY = mouseEvent.screenY;
				this.#panOngoing = true;
				this.#dispatchEvent ( mouseEvent, 'start' );
			}
			break;
		case 'mouseup' :
			if (
				mouseEvent.button === this.#button
				&&
				this.#panOngoing
				&&
				( this.#startPanX !== mouseEvent.screenX || this.#startPanY !== mouseEvent.screenY )
			) {
				this.#dispatchEvent ( mouseEvent, 'end' );
			}
			this.#panOngoing = false;
			break;
		case 'mousemove' :
			if ( this.#panOngoing ) {
				if ( document.selection ) {
					document.selection.empty ();
				}
				else {
					window.getSelection ().removeAllRanges ();
				}
				this.#dispatchEvent ( mouseEvent, 'move' );
			}
			break;
		default :
			break;
		}
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class PanEventDispatcher
@classdesc Listen mouse event from an object and redispath the mouse events as leftpan or rightpan or middlepan events
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class PanEventDispatcher {

	/**
	static constant for the left button
	*/

	static get LEFT_BUTTON ( ) { return ZERO; }

	/**
	static constant for the middle button
	*/

	static get MIDDLE_BUTTON ( ) { return ONE; }

	/**
	static constant for the right button
	*/

	static get RIGHT_BUTTON ( ) { return TWO; }

	#target = null;
	#eventListener = null;

	/*
	constructor
	@param {HTMLElement} target The target for the event dispatcher
	@param {!number} button The button to use. must be PanEventDispatcher.LEFT_BUTTON or PanEventDispatcher.MIDDLE_BUTTON
	or PanEventDispatcher.RIGHTLEFT_BUTTON. Default value: PanEventDispatcher.LEFT_BUTTON
	*/

	constructor ( target, button = ZERO ) {

		this.#target = target;
		this.#eventListener = new MouseEL ( target, button );
		this.#target.addEventListener ( 'mousedown', this.#eventListener );
		this.#target.addEventListener ( 'mouseup', this.#eventListener );
		this.#target.addEventListener ( 'mousemove', this.#eventListener );
	}

	/**
	Detach the event dispatcher when not needed anymore, so the memory can be released
	*/

	detach ( ) {
		this.#target.removeEventListener ( 'mousedown', this.#eventListener );
		this.#target.removeEventListener ( 'mouseup', this.#eventListener );
		this.#target.removeEventListener ( 'mousemove', this.#eventListener );
		this.#eventListener = null;
		this.#target = null;
	}
}

export default PanEventDispatcher;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of PanEventDispatcher.js file

@------------------------------------------------------------------------------------------------------------------------------
*/