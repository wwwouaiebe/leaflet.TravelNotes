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

export { newTravelNotesPaneUI };

import { newHTMLViewsFactory } from '../UI/HTMLViewsFactory.js';
import { g_NoteEditor } from '../core/NoteEditor.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';

let s_NoteObjId  = 0;

/*
--- newTravelNotesPaneUI function -------------------------------------------------------------------------------------

This function returns the travelNotesPaneUI object

-----------------------------------------------------------------------------------------------------------------------
*/

function newTravelNotesPaneUI ( ) {

	let m_EventDispatcher = newEventDispatcher ( );

	/*
	--- m_OnDragStart function ----------------------------------------------------------------------------------------

	drag start event listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnDragStart ( dragEvent ) {
		dragEvent.stopPropagation ( ); 
		try {
			dragEvent.dataTransfer.setData ( 'Text', dragEvent.target.dataObjId );
			dragEvent.dataTransfer.dropEffect = "move";
		}
		catch ( err ) {
			console.log ( err );
		}

		// for this #@!& MS Edge... don't remove - 1 otherwise crasy things comes in FF
		// MS Edge know the dataTransfer object, but the objects linked to the event are 
		// different in the drag event and the drop event
		s_NoteObjId = dragEvent.target.noteObjId - 1;
	}

	/*
	--- m_OnDragOver function -----------------------------------------------------------------------------------------

	drag over event listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnDragOver ( event ) {
		event.preventDefault ( );
	}

	/*
	--- m_OnDrop function ---------------------------------------------------------------------------------------------

	drop listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnDrop ( dragEvent ) { 
		dragEvent.preventDefault ( );
		let element = dragEvent.target;

		while ( ! element.noteObjId ) {
			element = element.parentElement;
		}
		let clientRect = element.getBoundingClientRect ( );
		
		// for this #@!& MS Edge... don't remove + 1 otherwise crazy things comes in FF
		g_NoteEditor.noteDropped ( 
			s_NoteObjId + 1, 
			element.noteObjId, 
			dragEvent.clientY - clientRect.top < clientRect.bottom - dragEvent.clientY
		);
	}

	/*
	--- m_OnTravelNoteClick function ----------------------------------------------------------------------------------

	click event listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnTravelNoteClick ( clickEvent ) {
		clickEvent.stopPropagation ( );
		clickEvent.preventDefault ( );
		let element = clickEvent.target;
		while ( ! element.noteObjId ) {
			element = element.parentNode;
		}
		m_EventDispatcher.dispatch ( 
			'zoomtonote', 
			{ 
				noteObjId : element.noteObjId
			}
		);
	}

	/*
	--- m_OnTravelNoteContextMenu function ----------------------------------------------------------------------------

	contextmenu event listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnTravelNoteContextMenu ( clickEvent ) {
		clickEvent.stopPropagation ( );
		clickEvent.preventDefault ( );
		let element = clickEvent.target;
		while ( ! element.noteObjId ) {
			element = element.parentNode;
		}
		g_NoteEditor.editNote ( element.noteObjId );
	}

	/*
	--- m_Remove function ---------------------------------------------------------------------------------------------

	This function removes the content

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Remove ( ) {

		let dataDiv = document.getElementById ( 'TravelNotes-Control-DataPanesDiv' );
		if ( ! dataDiv ) {
			return;
		}

		let travelNotesDiv = dataDiv.firstChild;
		if ( travelNotesDiv ) {
			travelNotesDiv.childNodes.forEach (
				childNode => {
					childNode.removeEventListener ( 'click', m_OnTravelNoteClick, false );
					childNode.removeEventListener ( 'contextmenu', m_OnTravelNoteContextMenu, false );
					childNode.removeEventListener ( 'dragstart', m_OnDragStart, false );	
				}
			);
			dataDiv.removeChild ( travelNotesDiv );
		}
	}
	
	/*
	--- m_Add function ------------------------------------------------------------------------------------------------

	This function adds the content

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_Add ( ) {

		document.getElementById ( 'TravelNotes-Control-ItineraryPaneButton' ).classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
		document.getElementById ( 'TravelNotes-Control-TravelNotesPaneButton' ).classList.add ( 'TravelNotes-Control-ActivePaneButton' );
		if ( window.osmSearch ) {
			document.getElementById ( 'TravelNotes-Control-SearchPaneButton' ).classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
		}
		
		let htmlViewsFactory = newHTMLViewsFactory ( 'TravelNotes-Control-' );		
		let dataDiv = document.getElementById ( 'TravelNotes-Control-DataPanesDiv' );
		if ( ! dataDiv ) {
			return;
		}

		let travelNotesDiv = htmlViewsFactory.travelNotesHTML;
		travelNotesDiv.addEventListener ( 'drop', m_OnDrop, false );
		travelNotesDiv.addEventListener ( 'dragover', m_OnDragOver, false );
		
		dataDiv.appendChild ( travelNotesDiv );
		travelNotesDiv.childNodes.forEach (
			childNode => {
				childNode.addEventListener ( 'click', m_OnTravelNoteClick, false );
				childNode.addEventListener ( 'contextmenu', m_OnTravelNoteContextMenu, false );
				childNode.draggable = true;
				childNode.addEventListener ( 'dragstart', m_OnDragStart, false );	
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
			remove : ( ) => m_Remove ( ),
			add : ( ) => m_Add ( )
		}
	);
}

/*
--- End of TravelNotesPaneUI.js file ----------------------------------------------------------------------------------
*/		