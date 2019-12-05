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
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newItineraryPaneUI };

import { newHTMLViewsFactory } from '../UI/HTMLViewsFactory.js';
import { g_NoteEditor } from '../core/NoteEditor.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';

/*
--- itineraryPaneUI function ------------------------------------------------------------------------------------------

This function returns the itineraryPaneUI object

-----------------------------------------------------------------------------------------------------------------------
*/

function newItineraryPaneUI ( ) {

	let m_EventDispatcher = newEventDispatcher ( );

	/*
	--- m_OnInstructionClick function ---------------------------------------------------------------------------------

	click event listener for the instruction

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnInstructionClick ( clickEvent ) {
		clickEvent.stopPropagation ( );
		let element = clickEvent.target;
		while ( ! element.latLng ) {
			element = element.parentNode;
		}
		m_EventDispatcher.dispatch ( 
			'zoomtopoint', 
			{ 
				latLng : element.latLng
			}
		);
	}

	/*
	--- m_OnInstructionContextMenu function ---------------------------------------------------------------------------

	contextmenu event listener for the instruction

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnInstructionContextMenu ( clickEvent ) {
		clickEvent.stopPropagation ( );
		clickEvent.preventDefault ( );
		let element = clickEvent.target;
		while ( ! element.latLng ) {
			element = element.parentNode;
		}
		if ( element.maneuverObjId ) {
			g_NoteEditor.newManeuverNote ( element.maneuverObjId, element.latLng );
		} 
		else if ( element.noteObjId ) {
			g_NoteEditor.editNote ( element.noteObjId );
		}
	}

	/*
	--- m_OnInstructionMouseEnter function ----------------------------------------------------------------------------

	mouseenter event listener for the instruction

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnInstructionMouseEnter ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		m_EventDispatcher.dispatch ( 
			'additinerarypointmarker', 
			{ 
				objId : mouseEvent.target.objId,
				latLng : mouseEvent.target.latLng
			}
		);
	}

	/*
	--- m_OnInstructionMouseLeave function ----------------------------------------------------------------------------

	mouseleave event listener for the instruction

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnInstructionMouseLeave ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		m_EventDispatcher.dispatch ( 'removeobject', { objId : mouseEvent.target.objId } );
	}

	/*
	--- m_Remove function ---------------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_Remove ( ) {
		
		let dataDiv = document.getElementById ( 'TravelNotes-Control-DataPanesDiv' );
		if ( ! dataDiv ) {
			return;
		}
		
		// removing previous header 
		let routeHeader = document.getElementsByClassName ( 'TravelNotes-Control-Route-Header' ) [ 0 ];
		if ( routeHeader ) {
			dataDiv.removeChild ( routeHeader );
		}
		
		// removing previous itinerary
		let childCounter;
		let childNodes;
		let childNode;			
		let routeManeuversNotesList = 
			document.getElementsByClassName ( 'TravelNotes-Control-Route-ManeuversAndNotes' ) [ 0 ];
		if ( routeManeuversNotesList ) {
			childNodes = routeManeuversNotesList.childNodes;
			for ( childCounter = 0; childCounter < childNodes.length; childCounter ++ ) {
				childNode = childNodes [ childCounter ];
				childNode.removeEventListener ( 'click', m_OnInstructionClick, false );
				childNode.removeEventListener ( 'contextmenu', m_OnInstructionContextMenu, false );
				childNode.removeEventListener ( 'mouseenter', m_OnInstructionMouseEnter, false );
				childNode.removeEventListener ( 'mouseleave', m_OnInstructionMouseLeave, false );
			}
			dataDiv.removeChild ( routeManeuversNotesList );
		}
	}
			
	/*
	--- m_Add function ------------------------------------------------------------------------------------------------

	This function add the itinerary to the UI

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Add ( ) {
		
		document.getElementById ( 'TravelNotes-Control-ItineraryPaneButton' )
			.classList.add ( 'TravelNotes-Control-ActivePaneButton' );
		document.getElementById ( 'TravelNotes-Control-TravelNotesPaneButton' )
			.classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
		if ( window.osmSearch ) {
			document.getElementById ( 'TravelNotes-Control-SearchPaneButton' )
				.classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
		}
		
		let htmlViewsFactory = newHTMLViewsFactory ( 'TravelNotes-Control-' );
		
		let dataDiv = document.getElementById ( 'TravelNotes-Control-DataPanesDiv' );
		if ( ! dataDiv ) {
			return;
		}
		
		// adding new header
		dataDiv.appendChild ( htmlViewsFactory.routeHeaderHTML );
		
		// adding new itinerary
		dataDiv.appendChild ( htmlViewsFactory.routeManeuversAndNotesHTML );
		
		// adding event listeners 
		let childCounter;
		let childNodes;
		let childNode;			
		let routeManeuversNotesList = 
			document.getElementsByClassName ( 'TravelNotes-Control-Route-ManeuversAndNotes' ) [ 0 ];
		if ( routeManeuversNotesList ) {
			childNodes = routeManeuversNotesList.childNodes;
			for ( childCounter = 0; childCounter < childNodes.length; childCounter ++ ) {
				childNode = childNodes [ childCounter ];
				childNode.addEventListener ( 'click', m_OnInstructionClick, false );
				childNode.addEventListener ( 'contextmenu', m_OnInstructionContextMenu, false );
				childNode.addEventListener ( 'mouseenter', m_OnInstructionMouseEnter, false );
				childNode.addEventListener ( 'mouseleave', m_OnInstructionMouseLeave, false );
			}
		}
	}

	/*
	--- itineraryPaneUI object ----------------------------------------------------------------------------------------

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
--- End of ItineraryPaneUI.js file ------------------------------------------------------------------------------------
*/		