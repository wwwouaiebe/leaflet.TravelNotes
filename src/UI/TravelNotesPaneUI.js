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
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newHTMLViewsFactory } from '../UI/HTMLViewsFactory.js';
import { theNoteEditor } from '../core/NoteEditor.js';
import { newNoteContextMenu } from '../contextMenus/NoteContextMenu.js';

import { LAT_LNG, ZERO, ONE } from '../util/Constants.js';

/*
--- newTravelNotesPaneUI function -------------------------------------------------------------------------------------

This function returns the travelNotesPaneUI object

-----------------------------------------------------------------------------------------------------------------------
*/

function newTravelNotesPaneUI ( ) {

	let myNoteObjId = ZERO;
	let myDataDiv = null;

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

		// for this #@!& MS Edge... don't remove - ONE otherwise crasy things comes in FF
		// MS Edge know the dataTransfer object, but the objects linked to the event are
		// different in the drag event and the drop event
		myNoteObjId = dragEvent.target.noteObjId - ONE;
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

		// for this #@!& MS Edge... don't remove + ONE otherwise crazy things comes in FF
		theNoteEditor.noteDropped (
			myNoteObjId + ONE,
			element.noteObjId,
			dragEvent.clientY - clientRect.top < clientRect.bottom - dragEvent.clientY
		);
	}

	/*
	--- myOnTravelNoteContextMenu function ----------------------------------------------------------------------------

	contextmenu event listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnTravelNoteContextMenu ( contextMenuEvent ) {
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

	/*
	--- myRemove function ---------------------------------------------------------------------------------------------

	This function removes the content

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRemove ( ) {

		let travelNotesDiv = myDataDiv.firstChild;
		if ( travelNotesDiv ) {
			travelNotesDiv.childNodes.forEach (
				childNode => {
					childNode.removeEventListener ( 'contextmenu', myOnTravelNoteContextMenu, false );
					childNode.removeEventListener ( 'dragstart', myOnDragStart, false );
				}
			);
			myDataDiv.removeChild ( travelNotesDiv );
		}
	}

	/*
	--- myAdd function ------------------------------------------------------------------------------------------------

	This function adds the content

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAdd ( ) {

		if ( ! myDataDiv ) {
			myDataDiv = document.getElementById ( 'TravelNotes-DataPanesUI-DataPanesDiv' );
		}

		document.getElementById ( 'TravelNotes-DataPanesUI-ItineraryPaneButton' )
			.classList.remove ( 'TravelNotes-DataPaneUI-ActivePaneButton' );
		document.getElementById ( 'TravelNotes-DataPanesUI-TravelNotesPaneButton' )
			.classList.add ( 'TravelNotes-DataPaneUI-ActivePaneButton' );
		if ( window.osmSearch ) {
			document.getElementById ( 'TravelNotes-DataPaneUI-SearchPaneButton' )
				.classList.remove ( 'TravelNotes-DataPaneUI-ActivePaneButton' );
		}

		let htmlViewsFactory = newHTMLViewsFactory ( 'TravelNotes-UI-' );

		let travelNotesDiv = htmlViewsFactory.travelNotesHTML;
		travelNotesDiv.addEventListener ( 'drop', myOnDrop, false );
		travelNotesDiv.addEventListener ( 'dragover', myOnDragOver, false );

		myDataDiv.appendChild ( travelNotesDiv );
		travelNotesDiv.childNodes.forEach (
			childNode => {
				childNode.addEventListener ( 'contextmenu', myOnTravelNoteContextMenu, false );
				childNode.draggable = true;
				childNode.addEventListener ( 'dragstart', myOnDragStart, false );
				childNode.classList.add ( 'TravelNotes-UI-MoveCursor' );
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