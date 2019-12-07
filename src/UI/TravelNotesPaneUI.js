/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- TravelNotesPaneUI.js file -----------------------------------------------------------------------------------------
This file contains:
	- the newTravelNotesPaneUI function
Changes:
	- v1.4.0:
		- created
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newHTMLViewsFactory } from '../UI/HTMLViewsFactory.js';
import { theNoteEditor } from '../core/NoteEditor.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';

import  { OUR_CONST } from '../util/Constants.js';

/*
--- newTravelNotesPaneUI function -------------------------------------------------------------------------------------

This function returns the travelNotesPaneUI object

-----------------------------------------------------------------------------------------------------------------------
*/

function newTravelNotesPaneUI ( ) {

	let myNoteObjId  = 0;

	let myEventDispatcher = newEventDispatcher ( );

	/*
	--- myOnDragStart function ----------------------------------------------------------------------------------------

	drag start event listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnDragStart ( dragEvent ) {
		dragEvent.stopPropagation ( );
		try {
			dragEvent.dataTransfer.setData ( 'Text', dragEvent.target.dataObjId );
			dragEvent.dataTransfer.dropEffect = 'move';
		}
		catch ( err ) {
			console.log ( err );
		}

		// for this #@!& MS Edge... don't remove - OUR_CONST.number1 otherwise crasy things comes in FF
		// MS Edge know the dataTransfer object, but the objects linked to the event are
		// different in the drag event and the drop event
		myNoteObjId = dragEvent.target.noteObjId - OUR_CONST.number1;
	}

	/*
	--- myOnDragOver function -----------------------------------------------------------------------------------------

	drag over event listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnDragOver ( dragEvent ) {
		dragEvent.preventDefault ( );
	}

	/*
	--- myOnDrop function ---------------------------------------------------------------------------------------------

	drop listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnDrop ( dragEvent ) {
		dragEvent.preventDefault ( );
		let element = dragEvent.target;

		while ( ! element.noteObjId ) {
			element = element.parentElement;
		}
		let clientRect = element.getBoundingClientRect ( );

		// for this #@!& MS Edge... don't remove + OUR_CONST.number1 otherwise crazy things comes in FF
		theNoteEditor.noteDropped (
			myNoteObjId + OUR_CONST.number1,
			element.noteObjId,
			dragEvent.clientY - clientRect.top < clientRect.bottom - dragEvent.clientY
		);
	}

	/*
	--- myOnTravelNoteClick function ----------------------------------------------------------------------------------

	click event listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnTravelNoteClick ( clickEvent ) {
		clickEvent.stopPropagation ( );
		clickEvent.preventDefault ( );
		let element = clickEvent.target;
		while ( ! element.noteObjId ) {
			element = element.parentNode;
		}
		myEventDispatcher.dispatch (
			'zoomtonote',
			{
				noteObjId : element.noteObjId
			}
		);
	}

	/*
	--- myOnTravelNoteContextMenu function ----------------------------------------------------------------------------

	contextmenu event listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnTravelNoteContextMenu ( clickEvent ) {
		clickEvent.stopPropagation ( );
		clickEvent.preventDefault ( );
		let element = clickEvent.target;
		while ( ! element.noteObjId ) {
			element = element.parentNode;
		}
		theNoteEditor.editNote ( element.noteObjId );
	}

	/*
	--- myRemove function ---------------------------------------------------------------------------------------------

	This function removes the content

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRemove ( ) {

		let dataDiv = document.getElementById ( 'TravelNotes-Control-DataPanesDiv' );
		if ( ! dataDiv ) {
			return;
		}

		let travelNotesDiv = dataDiv.firstChild;
		if ( travelNotesDiv ) {
			travelNotesDiv.childNodes.forEach (
				childNode => {
					childNode.removeEventListener ( 'click', myOnTravelNoteClick, false );
					childNode.removeEventListener ( 'contextmenu', myOnTravelNoteContextMenu, false );
					childNode.removeEventListener ( 'dragstart', myOnDragStart, false );
				}
			);
			dataDiv.removeChild ( travelNotesDiv );
		}
	}

	/*
	--- myAdd function ------------------------------------------------------------------------------------------------

	This function adds the content

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAdd ( ) {

		document.getElementById ( 'TravelNotes-Control-ItineraryPaneButton' )
			.classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
		document.getElementById ( 'TravelNotes-Control-TravelNotesPaneButton' )
			.classList.add ( 'TravelNotes-Control-ActivePaneButton' );
		if ( window.osmSearch ) {
			document.getElementById ( 'TravelNotes-Control-SearchPaneButton' )
				.classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
		}

		let htmlViewsFactory = newHTMLViewsFactory ( 'TravelNotes-Control-' );
		let dataDiv = document.getElementById ( 'TravelNotes-Control-DataPanesDiv' );
		if ( ! dataDiv ) {
			return;
		}

		let travelNotesDiv = htmlViewsFactory.travelNotesHTML;
		travelNotesDiv.addEventListener ( 'drop', myOnDrop, false );
		travelNotesDiv.addEventListener ( 'dragover', myOnDragOver, false );

		dataDiv.appendChild ( travelNotesDiv );
		travelNotesDiv.childNodes.forEach (
			childNode => {
				childNode.addEventListener ( 'click', myOnTravelNoteClick, false );
				childNode.addEventListener ( 'contextmenu', myOnTravelNoteContextMenu, false );
				childNode.draggable = true;
				childNode.addEventListener ( 'dragstart', myOnDragStart, false );
				childNode.classList.add ( 'TravelNotes-SortableList-MoveCursor' );
			}
		);
	}

	/*
	--- travelNotesPaneUI object --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			remove : ( ) => myRemove ( ),
			add : ( ) => myAdd ( )
		}
	);
}

export { newTravelNotesPaneUI };

/*
--- End of TravelNotesPaneUI.js file ----------------------------------------------------------------------------------
*/