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
Doc reviewed 20200816
Tests ...
*/

import { theTranslator } from '../UI/Translator.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { ZERO } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@file FloatWindow.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module FloatWindow
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewFloatWindow
@desc constructor for FloatWindow objects
@return {FloatWindow} an instance of FloatWindow object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewFloatWindow ( ) {

	const DRAG_MARGIN = 20;

	let myWindowDiv = null;
	let myHeaderDiv = null;
	let myContentDiv = null;

	let myStartDragX = ZERO;
	let myStartDragY = ZERO;
	let myWindowX = ZERO;
	let myWindowY = ZERO;
	let myScreenWidth = ZERO;
	let myScreenHeight = ZERO;

	let myOnClose = null;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnTopBarDragStart
	@desc Drag start event listener for the top bar
	@listens dragstart
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnTopBarDragStart ( dragStartEvent ) {
		try {
			dragStartEvent.dataTransfer.setData ( 'Text', '1' );
		}
		catch ( err ) {
			console.log ( err );
		}
		myStartDragX = dragStartEvent.screenX;
		myStartDragY = dragStartEvent.screenY;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnTopBarDragEnd
	@desc Drag end event listener for the top bar
	@listens dragend
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnTopBarDragEnd ( dragEndEvent ) {
		myWindowX += dragEndEvent.screenX - myStartDragX;
		myWindowY += dragEndEvent.screenY - myStartDragY;
		myWindowX = Math.min (
			Math.max ( myWindowX, DRAG_MARGIN ),
			myScreenWidth - myWindowDiv.clientWidth - DRAG_MARGIN
		);
		myWindowY = Math.max ( myWindowY, DRAG_MARGIN );
		let dialogMaxHeight =
			myScreenHeight - Math.max ( myWindowY, ZERO ) - DRAG_MARGIN;
		myWindowDiv.setAttribute (
			'style',
			'top:' + myWindowY + 'px;left:' + myWindowX + 'px;max-height:' + dialogMaxHeight + 'px;'
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateWindow
	@desc This method creates the window
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateWindow ( ) {
		myScreenWidth = theTravelNotesData.map.getContainer ( ).clientWidth;
		myScreenHeight = theTravelNotesData.map.getContainer ( ).clientHeight;
		myWindowDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-FloatWindow-Container'
			},
			document.querySelector ( 'body' )
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myClose
	@desc This method closes the window
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myClose ( ) {
		if ( myOnClose ) {
			myOnClose ( );
		}
		document.querySelector ( 'body' ).removeChild ( myWindowDiv );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateTopBar
	@desc This method creates the window
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateTopBar ( ) {
		let topBar = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-FloatWindow-TopBar',
				draggable : true
			},
			myWindowDiv
		);
		topBar.addEventListener ( 'dragstart', myOnTopBarDragStart, false );
		topBar.addEventListener ( 'dragend', myOnTopBarDragEnd, false );

		theHTMLElementsFactory.create (
			'div',
			{
				innerHTML : '&#x274c',
				className : 'TravelNotes-FloatWindow-CancelButton',
				title : theTranslator.getText ( 'FloatWindow - Close' )
			},
			topBar
		)
			.addEventListener ( 'click', myClose, false );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateHeaderDiv
	@desc This method creates the header div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateHeaderDiv ( ) {
		myHeaderDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-FloatWindow-HeaderDiv'
			},
			myWindowDiv
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateHeaderDiv
	@desc This method creates the content div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateContentDiv ( ) {
		myContentDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-FloatWindow-ContentDiv'
			},
			myWindowDiv
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class
	@classdesc This class is the base for all the floating windows
	@see {@link newFloatWindow} for constructor
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class FloatWindow {

		/**
		Create the window directly on the screen
		*/

		createWindow ( ) {
			myCreateWindow ( );
			myCreateTopBar ( );
			myCreateHeaderDiv ( );
			myCreateContentDiv ( );
		}

		/**
		Close the window
		*/

		close ( ) { myClose ( ); }

		/**
		A function that will be executed when the dialog is closed
		*/

		set onClose ( OnClose ) { myOnClose = OnClose; }

		/**
		The header of the window. Read only but remember it's an HTMLElement...
		@readonly
		*/

		get header ( ) { return myHeaderDiv; }

		/**
		The content of the window. Read only but remember it's an HTMLElement...
		@readonly
		*/

		get content ( ) { return myContentDiv; }
	}

	return new FloatWindow;
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newFloatWindow
	@desc constructor for FloatWindow objects
	@return {FloatWindow} an instance of FloatWindow object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewFloatWindow as newFloatWindow
};

/*
--- End of FloatWindow.js file ------------------------------------------------------------------------------------------------
*/