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

Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
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
			
			// adding travel notes
			var travelNotesDiv = htmlViewsFactory.travelNotesHTML;
			dataDiv.appendChild ( travelNotesDiv );
			travelNotesDiv.childNodes.forEach (
				function ( childNode  ) {
					childNode.addEventListener ( 'click' , onTravelNoteClick, false );
					childNode.addEventListener ( 'contextmenu' , onTravelNoteContextMenu, false );
				}
			);
		};

		return {
			remove : function ( ) { m_Remove ( ); },
			add : function ( ) { m_Add ( ); }
		};
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