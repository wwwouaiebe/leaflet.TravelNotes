/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
	- v1.4.0:
		- created
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20200818
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file TravelNotesPaneUI.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module TravelNotesPaneUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { newHTMLViewsFactory } from '../UI/HTMLViewsFactory.js';
import { theNoteEditor } from '../core/NoteEditor.js';
import { newNoteContextMenu } from '../contextMenus/NoteContextMenu.js';
import { LAT_LNG, ZERO, DATA_PANE_ID } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewTravelNotesPaneUI
@desc constructor for TravelNotesPaneUI objects
@return {TravelNotesPaneUI} an instance of TravelNotesPaneUI object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewTravelNotesPaneUI ( ) {

	let myNoteObjId = ZERO;
	let myDataDiv = null;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnNoteDragStart
	@desc drag start event listener for the notes
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnNoteDragStart ( dragEvent ) {
		dragEvent.stopPropagation ( );
		try {
			dragEvent.dataTransfer.setData ( 'Text', dragEvent.target.dataObjId );
			dragEvent.dataTransfer.dropEffect = 'move';
		}
		catch ( err ) {
			console.log ( err );
		}

		myNoteObjId = dragEvent.target.noteObjId;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnNotesListDragOver
	@desc drag over event listener for the notes
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnNotesListDragOver ( dragEvent ) {
		dragEvent.preventDefault ( );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnNoteDrop
	@desc drop event listener for the notes
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnNoteDrop ( dragEvent ) {
		dragEvent.preventDefault ( );
		let element = dragEvent.target;

		while ( ! element.noteObjId ) {
			element = element.parentElement;
		}
		let clientRect = element.getBoundingClientRect ( );

		theNoteEditor.travelNoteDropped (
			myNoteObjId,
			element.noteObjId,
			dragEvent.clientY - clientRect.top < clientRect.bottom - dragEvent.clientY
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnNoteContextMenu
	@desc drop event listener for the notes
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnNoteContextMenu ( contextMenuEvent ) {
		contextMenuEvent.stopPropagation ( );
		contextMenuEvent.preventDefault ( );
		let element = contextMenuEvent.target;
		while ( ! element.noteObjId ) {
			element = element.parentNode;
		}
		contextMenuEvent.latlng = { lat : LAT_LNG.defaultValue, lng : LAT_LNG.defaultValue };
		contextMenuEvent.fromUI = true;
		contextMenuEvent.originalEvent =
			{
				clientX : contextMenuEvent.clientX,
				clientY : contextMenuEvent.clientY,
				latLng : element.latLng
			};
		if ( element.noteObjId ) {
			contextMenuEvent.noteObjId = element.noteObjId;
			newNoteContextMenu ( contextMenuEvent, myDataDiv ).show ( );
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class TravelNotesPaneUI
	@classdesc This class manages the travel notes pane UI
	@see {@link newTravelNotesPaneUI} for constructor
	@see {@link DataPanesUI} for pane UI management
	@implements {PaneUI}
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class TravelNotesPaneUI {

		/**
		This function removes all the elements from the data div
		*/

		remove ( dataDiv ) {
			myDataDiv = dataDiv;
			let travelNotesDiv = dataDiv.firstChild;
			if ( travelNotesDiv ) {
				travelNotesDiv.childNodes.forEach (
					childNode => {
						childNode.removeEventListener ( 'contextmenu', myOnNoteContextMenu, false );
						childNode.removeEventListener ( 'dragstart', myOnNoteDragStart, false );
					}
				);
				myDataDiv.removeChild ( travelNotesDiv );
			}
		}

		/**
		This function add the travel notes to the data div
		*/

		add ( dataDiv ) {
			myDataDiv = dataDiv;
			let htmlViewsFactory = newHTMLViewsFactory ( 'TravelNotes-UI-' );
			let travelNotesDiv = htmlViewsFactory.travelNotesHTML;
			travelNotesDiv.addEventListener ( 'drop', myOnNoteDrop, false );
			travelNotesDiv.addEventListener ( 'dragover', myOnNotesListDragOver, false );
			myDataDiv.appendChild ( travelNotesDiv );
			travelNotesDiv.childNodes.forEach (
				childNode => {
					childNode.draggable = true;
					childNode.addEventListener ( 'contextmenu', myOnNoteContextMenu, false );
					childNode.addEventListener ( 'dragstart', myOnNoteDragStart, false );
					childNode.classList.add ( 'TravelNotes-UI-MoveCursor' );
				}
			);
		}

		/**
		This function returns the pane id
		*/

		getId ( ) { return DATA_PANE_ID.travelNotesPane; }

		/**
		This function returns the text to add in the pane button
		*/

		getButtonText ( ) { return theTranslator.getText ( 'DataPanesUI - Travel notes' ); }
	}

	return Object.freeze ( new TravelNotesPaneUI );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newTravelNotesPaneUI
	@desc constructor for TravelNotesPaneUI objects
	@return {TravelNotesPaneUI} an instance of TravelNotesPaneUI object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewTravelNotesPaneUI as newTravelNotesPaneUI
};

/*
--- End of TravelNotesPaneUI.js file ------------------------------------------------------------------------------------------
*/