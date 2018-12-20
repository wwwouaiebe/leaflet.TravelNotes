/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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
	- 
Changes:
	- v1.4.0:
		- created

Doc reviewed 20181219
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var s_NoteObjId  = 0;
	
	/*
	--- onDragStart function ------------------------------------------------------------------------------------------

	drag start event listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onDragStart = function  ( dragEvent ) {
		dragEvent.stopPropagation ( ); 
		try {
			dragEvent.dataTransfer.setData ( 'Text', dragEvent.target.dataObjId );
			dragEvent.dataTransfer.dropEffect = "move";
		}
		catch ( e ) {
		}
		// for this #@!& MS Edge... don't remove - 1 otherwise crasy things comes in FF
		// MS Edge know the dataTransfer object, but the objects linked to the event are different in the drag event and the drop event
		s_NoteObjId = dragEvent.target.noteObjId - 1;
	};
	
	/*
	--- onDragOver function -------------------------------------------------------------------------------------------

	drag over event listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onDragOver = function ( event ) {
		event.preventDefault ( );
	};
	
	/*
	--- onDrop function -----------------------------------------------------------------------------------------------

	drop listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onDrop = function ( dragEvent ) { 
		dragEvent.preventDefault ( );
		var element = dragEvent.target;

		while ( ! element.noteObjId ) {
			element = element.parentElement;
		}
		var clientRect = element.getBoundingClientRect ( );
		
		// for this #@!& MS Edge... don't remove + 1 otherwise crazy things comes in FF
		require ( '../core/NoteEditor' ).noteDropped ( 
			s_NoteObjId + 1, 
			element.noteObjId, 
			dragEvent.clientY - clientRect.top < clientRect.bottom - dragEvent.clientY
		);
	};
	
	/*
	--- onTravelNoteContextMenu function ------------------------------------------------------------------------------

	contextmenu event listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onTravelNoteContextMenu = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		clickEvent.preventDefault ( );
		var element = clickEvent.target;
		while ( ! element.noteObjId ) {
			element = element.parentNode;
		}
		require ( '../core/MapEditor' ) ( ).zoomToNote ( element.noteObjId );
	};
	
	/*
	--- onTravelNoteClick function ------------------------------------------------------------------------------------

	click event listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onTravelNoteClick = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		clickEvent.preventDefault ( );
		var element = clickEvent.target;
		while ( ! element.noteObjId ) {
			element = element.parentNode;
		}
		require ( '../core/NoteEditor' ) ( ).editNote ( element.noteObjId );
	};
	
	/*
	--- travelNotesPaneUI function ------------------------------------------------------------------------------------

	This function returns the travelNotesPaneUI object

	-------------------------------------------------------------------------------------------------------------------
	*/

	var travelNotesPaneUI = function ( ) {
	
		/*
		--- m_Remove function -----------------------------------------------------------------------------------------

		This function removes the content

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Remove = function ( ) {

			var dataDiv = document.getElementById ( 'TravelNotes-Control-ItineraryDataDiv' );
			if ( ! dataDiv ) {
				return;
			}

			var travelNotesDiv = dataDiv.firstChild;
			if ( travelNotesDiv ) {
				travelNotesDiv.childNodes.forEach (
					function ( childNode  ) {
						childNode.removeEventListener ( 'click' , onTravelNoteClick, false );
						childNode.removeEventListener ( 'contextmenu' , onTravelNoteContextMenu, false );
						childNode.removeEventListener ( 'dragstart', onDragStart, false );	
					}
				);
				dataDiv.removeChild ( travelNotesDiv );
			}
		};
		
		/*
		--- m_Add function --------------------------------------------------------------------------------------------

		This function adds the content

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_Add = function ( ) {

			document.getElementById ( 'TravelNotes-Control-ItineraryPaneButton' ).classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
			document.getElementById ( 'TravelNotes-Control-TravelNotesPaneButton' ).classList.add ( 'TravelNotes-Control-ActivePaneButton' );
			if ( window.osmSearch ) {
				document.getElementById ( 'TravelNotes-Control-SearchPaneButton' ).classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
			}
			
			var htmlViewsFactory = require ( '../UI/HTMLViewsFactory' ) ( );
			htmlViewsFactory.classNamePrefix = 'TravelNotes-Control-';
			
			var dataDiv = document.getElementById ( 'TravelNotes-Control-ItineraryDataDiv' );
			if ( ! dataDiv ) {
				return;
			}

			var travelNotesDiv = htmlViewsFactory.travelNotesHTML;
			travelNotesDiv.addEventListener ( 'drop', onDrop, false );
			travelNotesDiv.addEventListener ( 'dragover', onDragOver, false );
			
			dataDiv.appendChild ( travelNotesDiv );
			travelNotesDiv.childNodes.forEach (
				function ( childNode  ) {
					childNode.addEventListener ( 'click' , onTravelNoteClick, false );
					childNode.addEventListener ( 'contextmenu' , onTravelNoteContextMenu, false );
					childNode.draggable = true;
					childNode.addEventListener ( 'dragstart', onDragStart, false );	
					childNode.classList.add ( 'TravelNotes-SortableList-MoveCursor' );				}
			);
		};

		/*
		--- travelNotesPaneUI object ----------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/
		
		return Object.seal (
			{
				remove : function ( ) { m_Remove ( ); },
				add : function ( ) { m_Add ( ); }
			}
		);
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = travelNotesPaneUI;
	}

}());

/*
--- End of TravelNotesPaneUI.js file ----------------------------------------------------------------------------------
*/		