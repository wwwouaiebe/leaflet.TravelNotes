/*
Copyright - 2020 - wwwouaiebe - Contact: http//www.ouaie.be/

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
	- v1.7.0:
		- created
	- v2.0.0:
		- Issue ♯134 : Remove node.setAttribute ( 'style', blablabla) in the code
		- Issue ♯135 : Remove innerHTML from code
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

import theTranslator from '../UILib/Translator.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import { ZERO } from '../main/Constants.js';

const OUR_DRAG_MARGIN = 20;

/**
@------------------------------------------------------------------------------------------------------------------------------

@file FloatWindow.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module dialogFloatWindow

@------------------------------------------------------------------------------------------------------------------------------
*/

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
@classdesc dragend event listener for the top bar
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class TopBarDragEndEL {

	#dragData = null;
	#containerDiv = null;

	constructor ( dragData ) {
		Object.seal ( this );
		this.#dragData = dragData;
	}

	handleEvent ( dragEndEvent ) {
		let containerDiv = dragEndEvent.target.parentNode;
		this.#dragData.windowX += dragEndEvent.screenX - this.#dragData.dragStartX;
		this.#dragData.windowY += dragEndEvent.screenY - this.#dragData.dragStartY;
		this.#dragData.windowX = Math.min (
			Math.max ( this.#dragData.windowX, OUR_DRAG_MARGIN ),
			theTravelNotesData.map.getContainer ( ).clientWidth - containerDiv.clientWidth - OUR_DRAG_MARGIN
		);
		this.#dragData.windowY = Math.max ( this.#dragData.windowY, OUR_DRAG_MARGIN );
		let windowMaxHeight =
			theTravelNotesData.map.getContainer ( ).clientHeight - Math.max ( this.#dragData.windowY, ZERO ) - OUR_DRAG_MARGIN;
		containerDiv.style.top = String ( this.#dragData.windowY ) + 'px';
		containerDiv.style.left = String ( this.#dragData.windowX ) + 'px';
		containerDiv.style [ 'max-height' ] = String ( windowMaxHeight ) + 'px';
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class FloatWindow
@classdesc This class is the base for all the floating windows
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class FloatWindow {

	/**
	Shared data for drag and drop operations
	@private
	*/

	#dragData = Object.seal (
		{
			dragStartX : ZERO,
			dragStartY : ZERO,
			windowX : ZERO,
			windowY : ZERO
		}
	);

	/**
	The window container
	@private
	*/

	#containerDiv = null;

	/**
	The window top bar
	@private
	*/

	#topBar = null;

	/**
	The window header
	@private
	*/

	#headerDiv = null;

	/**
	The window content
	@private
	*/

	#contentDiv = null;

	/**
	event listeners
	@private
	*/

	#eventListeners = {
		onTopBarDragStart : null,
		onTopBarDragEnd : null
	}

	/**
	This method creates the window
	@private
	*/

	#createContainerDiv ( ) {

		this.#containerDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-FloatWindow-Container'
			},
			document.body
		);
	}

	/**
	@desc This method creates the topbar
	@private
	*/

	#createTopBar ( ) {
		this.#topBar = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-FloatWindow-TopBar',
				draggable : true
			},
			this.#containerDiv
		);
		this.#topBar.addEventListener ( 'dragstart', this.#eventListeners.onTopBarDragStart, false );
		this.#topBar.addEventListener ( 'dragend', this.#eventListeners.onTopBarDragEnd, false );

		theHTMLElementsFactory.create (
			'div',
			{
				textContent : '❌',
				className : 'TravelNotes-FloatWindow-CancelButton',
				title : theTranslator.getText ( 'FloatWindow - Close' )
			},
			this.#topBar
		).addEventListener ( 'click', ( ) => this.close ( ), false );
	}

	/**
	This method creates the header div
	*/

	#createHeaderDiv ( ) {
		this.#headerDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-FloatWindow-HeaderDiv'
			},
			this.#containerDiv
		);
	}

	/**
	This method creates the content div
	@private
	*/

	#createContentDiv ( ) {
		this.#contentDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-FloatWindow-ContentDiv'
			},
			this.#containerDiv
		);
	}

	constructor ( ) {
		this.#eventListeners.onTopBarDragStart = new TopBarDragStartEL ( this.#dragData );
		this.#eventListeners.onTopBarDragEnd = new TopBarDragEndEL ( this.#dragData );
		this.#createContainerDiv ( );
		this.#createTopBar ( );
		this.#createHeaderDiv ( );
		this.#createContentDiv ( );
		Object.seal ( this );
	}

	/**
	Close the window
	*/

	close ( ) {
		this.#topBar.removeEventListener ( 'dragstart', this.#eventListeners.onTopBarDragStart, false );
		this.#topBar.removeEventListener ( 'dragend', this.#eventListeners.onTopBarDragEnd, false );
		this.#eventListeners.onTopBarDragStart = null;
		this.#eventListeners.onTopBarDragEnd = null;
		document.body.removeChild ( this.#containerDiv );
	}

	/**
	Update the window
	*/

	update ( ) { }

	/**
	The header of the window. Read only but remember it's an HTMLElement...
	@readonly
	*/

	get header ( ) { return this.#headerDiv; }

	/**
	The content of the window. Read only but remember it's an HTMLElement...
	@readonly
	*/

	get content ( ) { return this.#contentDiv; }
}

export default FloatWindow;

/*
--- End of FloatWindow.js file ------------------------------------------------------------------------------------------------
*/