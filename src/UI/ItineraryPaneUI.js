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

import { newHTMLViewsFactory } from '../UI/HTMLViewsFactory.js';
import { theNoteEditor } from '../core/NoteEditor.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';

import { ZERO } from '../util/Constants.js';

/*
--- itineraryPaneUI function ------------------------------------------------------------------------------------------

This function returns the itineraryPaneUI object

-----------------------------------------------------------------------------------------------------------------------
*/

function newItineraryPaneUI ( ) {

	let myEventDispatcher = newEventDispatcher ( );

	/*
	--- myOnInstructionClick function ---------------------------------------------------------------------------------

	click event listener for the instruction

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnInstructionClick ( clickEvent ) {
		clickEvent.stopPropagation ( );
		let element = clickEvent.target;
		while ( ! element.latLng ) {
			element = element.parentNode;
		}
		myEventDispatcher.dispatch (
			'zoomto',
			{
				latLng : element.latLng
			}
		);
	}

	/*
	--- myOnInstructionContextMenu function ---------------------------------------------------------------------------

	contextmenu event listener for the instruction

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnInstructionContextMenu ( clickEvent ) {
		clickEvent.stopPropagation ( );
		clickEvent.preventDefault ( );
		let element = clickEvent.target;
		while ( ! element.latLng ) {
			element = element.parentNode;
		}
		if ( element.maneuverObjId ) {
			theNoteEditor.newManeuverNote ( element.maneuverObjId, element.latLng );
		}
		else if ( element.noteObjId ) {
			theNoteEditor.editNote ( element.noteObjId );
		}
	}

	/*
	--- myOnInstructionMouseEnter function ----------------------------------------------------------------------------

	mouseenter event listener for the instruction

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnInstructionMouseEnter ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		myEventDispatcher.dispatch (
			'additinerarypointmarker',
			{
				objId : mouseEvent.target.objId,
				latLng : mouseEvent.target.latLng
			}
		);
	}

	/*
	--- myOnInstructionMouseLeave function ----------------------------------------------------------------------------

	mouseleave event listener for the instruction

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnInstructionMouseLeave ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		myEventDispatcher.dispatch ( 'removeobject', { objId : mouseEvent.target.objId } );
	}

	/*
	--- myRemove function ---------------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRemove ( ) {

		let dataDiv = document.getElementById ( 'TravelNotes-Control-DataPanesDiv' );
		if ( ! dataDiv ) {
			return;
		}

		// removing previous header
		let routeHeader = document.getElementsByClassName ( 'TravelNotes-Control-Route-Header' ) [ ZERO ];
		if ( routeHeader ) {
			dataDiv.removeChild ( routeHeader );
		}

		// removing previous itinerary
		let routeManeuversNotesList =
			document.getElementsByClassName ( 'TravelNotes-Control-Route-ManeuversAndNotes' ) [ ZERO ];
		if ( routeManeuversNotesList ) {
			let childNodes = routeManeuversNotesList.childNodes;
			for ( let childCounter = ZERO; childCounter < childNodes.length; childCounter ++ ) {
				let childNode = childNodes [ childCounter ];
				childNode.removeEventListener ( 'click', myOnInstructionClick, false );
				childNode.removeEventListener ( 'contextmenu', myOnInstructionContextMenu, false );
				childNode.removeEventListener ( 'mouseenter', myOnInstructionMouseEnter, false );
				childNode.removeEventListener ( 'mouseleave', myOnInstructionMouseLeave, false );
			}
			dataDiv.removeChild ( routeManeuversNotesList );
		}
	}

	/*
	--- myAdd function ------------------------------------------------------------------------------------------------

	This function add the itinerary to the UI

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAdd ( ) {

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
		let routeManeuversNotesList =
			document.getElementsByClassName ( 'TravelNotes-Control-Route-ManeuversAndNotes' ) [ ZERO ];
		if ( routeManeuversNotesList ) {
			let childNodes = routeManeuversNotesList.childNodes;
			for ( let childCounter = ZERO; childCounter < childNodes.length; childCounter ++ ) {
				let childNode = childNodes [ childCounter ];
				childNode.addEventListener ( 'click', myOnInstructionClick, false );
				childNode.addEventListener ( 'contextmenu', myOnInstructionContextMenu, false );
				childNode.addEventListener ( 'mouseenter', myOnInstructionMouseEnter, false );
				childNode.addEventListener ( 'mouseleave', myOnInstructionMouseLeave, false );
			}
		}
	}

	/*
	--- itineraryPaneUI object ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			remove : ( ) => myRemove ( ),
			add : ( ) => myAdd ( )
		}
	);
}

export { newItineraryPaneUI };

/*
--- End of ItineraryPaneUI.js file ------------------------------------------------------------------------------------
*/