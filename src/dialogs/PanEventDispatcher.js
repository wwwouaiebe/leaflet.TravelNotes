import { ZERO } from '../util/Constants.js';

class PanEventListenerData {

	#panOngoing = false;
	#startPanX = ZERO;
	#startPanY = ZERO;
	#target = null;

	#dispatchEvent ( mouseEvent, action ) {
		let panEvent = new Event ( 'pan' );
		panEvent.startX = this.#startPanX;
		panEvent.startY = this.#startPanY;
		panEvent.endX = mouseEvent.screenX;
		panEvent.endY = mouseEvent.screenY;
		panEvent.action = action;

		this.#target.dispatchEvent ( panEvent );

	}

	constructor ( target ) {
		this.#target = target;
	}

	mouseDownPan ( mouseEvent ) {
		this.#panOngoing = true;
		this.#startPanX = mouseEvent.screenX;
		this.#startPanY = mouseEvent.screenY;
		this.#dispatchEvent ( mouseEvent, 'start' );
	}

	mouseUpPan ( mouseEvent ) {
		this.#dispatchEvent ( mouseEvent, 'end' );
		this.#panOngoing = false;
	}

	mouseMovePan ( mouseEvent ) {
		if ( this.#panOngoing ) {
			this.#dispatchEvent ( mouseEvent, 'move' );
		}
	}
}

class MouseDownPanEventListener {

	#panEventListenerData = null;

	constructor ( panEventListenerData ) {
		this.#panEventListenerData = panEventListenerData;
	}

	handleEvent ( mouseDownEvent ) {
		this.#panEventListenerData.mouseDownPan ( mouseDownEvent );
	}

}

class MouseUpPanEventListener {

	#panEventListenerData = null;

	constructor ( panEventListenerData ) {
		this.#panEventListenerData = panEventListenerData;
	}

	handleEvent ( mouseUpEvent ) {
		this.#panEventListenerData.mouseUpPan ( mouseUpEvent );
	}

}

class MouseMovePanEventListener {

	#panEventListenerData = null;

	constructor ( panEventListenerData ) {
		this.#panEventListenerData = panEventListenerData;
	}

	handleEvent ( mouseMoveEvent ) {
		this.#panEventListenerData. mouseMovePan ( mouseMoveEvent );
	}

}

class PanEventDispatcher {

	#target = null;
	#panEventListenerData = null;
	#eventListeners = {
		mouseUp : null,
		mouseDown : null,
		mouseMove : null
	}

	attachTo ( target ) {
		this.#target = target;
		this.#panEventListenerData = new PanEventListenerData ( target );
		this.#eventListeners.mouseDown = new MouseDownPanEventListener ( this.#panEventListenerData );
		this.#eventListeners.mouseUp = new MouseUpPanEventListener ( this.#panEventListenerData );
		this.#eventListeners.mouseMove = new MouseMovePanEventListener ( this.#panEventListenerData );
		this.#target.addEventListener ( 'mousedown', this.#eventListeners.mouseDown );
		this.#target.addEventListener ( 'mouseup', this.#eventListeners.mouseUp );
		this.#target.addEventListener ( 'mousemove', this.#eventListeners.mouseMove );
	}

	detach ( ) {
		this.#target.removeEventListener ( 'mousedown', this.#eventListeners.mouseDown );
		this.#target.removeEventListener ( 'mouseup', this.#eventListeners.mouseUp );
		this.#target.removeEventListener ( 'mousemove', this.#eventListeners.mouseMove );
		this.#eventListeners.mouseDown = null;
		this.#eventListeners.mouseUp = null;
		this.#eventListeners.mouseMove = null;
		this.#panEventListenerData = null;
		this.#target = null;
	}
}

export default PanEventDispatcher;