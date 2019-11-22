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
--- ItineraryPaneUI.js file -------------------------------------------------------------------------------------------
This file contains:
	- the newItineraryPaneUI function
Changes:
	- v1.4.0:
		- created
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

'use strict';

export { newItineraryPaneUI };

import { newHTMLViewsFactory } from '../UI/HTMLViewsFactory.js';
import { g_MapEditor } from '../core/MapEditor.js';
import { g_NoteEditor } from '../core/NoteEditor.js';

/*
--- onInstructionClick function ---------------------------------------------------------------------------------------

click event listener for the instruction

-----------------------------------------------------------------------------------------------------------------------
*/

var onInstructionClick = function ( clickEvent ) {
	clickEvent.stopPropagation ( );
	var element = clickEvent.target;
	while ( ! element.latLng ) {
		element = element.parentNode;
	}
	g_MapEditor.zoomToPoint ( element.latLng );
};

/*
--- onInstructionContextMenu function ---------------------------------------------------------------------------------

contextmenu event listener for the instruction

-----------------------------------------------------------------------------------------------------------------------
*/

var onInstructionContextMenu = function ( clickEvent ) {
	clickEvent.stopPropagation ( );
	clickEvent.preventDefault ( );
	var element = clickEvent.target;
	while ( ! element.latLng ) {
		element = element.parentNode;
	}
	if ( element.maneuverObjId ) {
		g_NoteEditor.newManeuverNote ( element.maneuverObjId, element.latLng );
	} 
	else if ( element.noteObjId ) {
		g_NoteEditor.editNote ( element.noteObjId );
	}
};

/*
--- onInstructionMouseEnter function ----------------------------------------------------------------------------------

mouseenter event listener for the instruction

-----------------------------------------------------------------------------------------------------------------------
*/

var onInstructionMouseEnter = function ( mouseEvent ) {
	mouseEvent.stopPropagation ( );
	g_MapEditor.addItineraryPointMarker ( mouseEvent.target.objId, mouseEvent.target.latLng  );
};

/*
--- onInstructionMouseLeave function ----------------------------------------------------------------------------------

mouseleave event listener for the instruction

-----------------------------------------------------------------------------------------------------------------------
*/

var onInstructionMouseLeave = function ( mouseEvent ) {
	mouseEvent.stopPropagation ( );
	g_MapEditor.removeObject ( mouseEvent.target.objId );
};

/*
--- itineraryPaneUI function ------------------------------------------------------------------------------------------

This function returns the itineraryPaneUI object

-----------------------------------------------------------------------------------------------------------------------
*/

var newItineraryPaneUI = function ( ) {

	/*
	--- m_Remove function ---------------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	var m_Remove = function ( ) {
		
		var dataDiv = document.getElementById ( 'TravelNotes-Control-ItineraryDataDiv' );
		if ( ! dataDiv ) {
			return;
		}
		
		// removing previous header 
		var routeHeader = document.getElementsByClassName ( 'TravelNotes-Control-Route-Header' ) [ 0 ];
		if ( routeHeader ) {
			dataDiv.removeChild ( routeHeader );
		}
		
		// removing previous itinerary
		var childCounter;
		var childNodes;
		var childNode;			
		var routeManeuversNotesList = document.getElementsByClassName ( 'TravelNotes-Control-Route-ManeuversAndNotes' ) [ 0 ];
		if ( routeManeuversNotesList ) {
			childNodes = routeManeuversNotesList.childNodes;
			for ( childCounter = 0; childCounter < childNodes.length; childCounter ++ ) {
				childNode = childNodes [ childCounter ];
				childNode.removeEventListener ( 'click' , onInstructionClick, false );
				childNode.removeEventListener ( 'contextmenu' , onInstructionContextMenu, false );
				childNode.removeEventListener ( 'mouseenter' , onInstructionMouseEnter, false );
				childNode.removeEventListener ( 'mouseleave' , onInstructionMouseLeave, false );
			}
			dataDiv.removeChild ( routeManeuversNotesList );
		}
	};
			
	/*
	--- m_Add function ------------------------------------------------------------------------------------------------

	This function add the itinerary to the UI

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_Add = function ( ) {
		
		document.getElementById ( 'TravelNotes-Control-ItineraryPaneButton' ).classList.add ( 'TravelNotes-Control-ActivePaneButton' );
		document.getElementById ( 'TravelNotes-Control-TravelNotesPaneButton' ).classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
		if ( window.osmSearch ) {
			document.getElementById ( 'TravelNotes-Control-SearchPaneButton' ).classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
		}
		
		var htmlViewsFactory = newHTMLViewsFactory ( );
		htmlViewsFactory.classNamePrefix = 'TravelNotes-Control-';
		
		var dataDiv = document.getElementById ( 'TravelNotes-Control-ItineraryDataDiv' );
		if ( ! dataDiv ) {
			return;
		}
		
		// adding new header
		dataDiv.appendChild ( htmlViewsFactory.routeHeaderHTML );
		
		
		// adding new itinerary
		dataDiv.appendChild ( htmlViewsFactory.routeManeuversAndNotesHTML );
		
		// adding event listeners 
		var childCounter;
		var childNodes;
		var childNode;			
		var routeManeuversNotesList = document.getElementsByClassName ( 'TravelNotes-Control-Route-ManeuversAndNotes' ) [ 0 ];
		if ( routeManeuversNotesList ) {
			childNodes = routeManeuversNotesList.childNodes;
			for ( childCounter = 0; childCounter < childNodes.length; childCounter ++ ) {
				childNode = childNodes [ childCounter ];
				childNode.addEventListener ( 'click' , onInstructionClick, false );
				childNode.addEventListener ( 'contextmenu' , onInstructionContextMenu, false );
				childNode.addEventListener ( 'mouseenter' , onInstructionMouseEnter, false );
				childNode.addEventListener ( 'mouseleave' , onInstructionMouseLeave, false );
			}
		}
	};

	/*
	--- itineraryPaneUI object ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			remove : function ( ) { m_Remove ( ); },
			add : function ( ) { m_Add ( ); }
		}
	);
};
	
/*
--- End of ItineraryPaneUI.js file ------------------------------------------------------------------------------------
*/		