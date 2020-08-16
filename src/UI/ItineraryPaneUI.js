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
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newHTMLViewsFactory } from '../UI/HTMLViewsFactory.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { newNoteContextMenu } from '../contextMenus/NoteContextMenu.js';
import { newManeuverContextMenu } from '../contextMenus/ManeuverContextMenu.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { INVALID_OBJ_ID, LAT_LNG } from '../util/Constants.js';

/*
--- itineraryPaneUI function ------------------------------------------------------------------------------------------

This function returns the itineraryPaneUI object

-----------------------------------------------------------------------------------------------------------------------
*/

function newItineraryPaneUI ( ) {

	let myEventDispatcher = newEventDispatcher ( );
	let myShowNotes = theConfig.itineraryPane.showNotes;
	let myShowManeuvers = theConfig.itineraryPane.showManeuvers;
	let myDataDiv = null;
	let myRouteHeader = null;
	let myHTMLViewsFactory = newHTMLViewsFactory ( 'TravelNotes-UI-' );
	let myCheckBoxesDiv = null;

	/*
	--- myOnInstructionContextMenu function ---------------------------------------------------------------------------

	contextmenu event listener for the instruction

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnInstructionContextMenu ( contextMenuEvent ) {
		contextMenuEvent.stopPropagation ( );
		contextMenuEvent.preventDefault ( );
		let element = contextMenuEvent.target;
		while ( ! element.latLng ) {
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
		if ( element.maneuverObjId ) {
			contextMenuEvent.maneuverObjId = element.maneuverObjId;
			newManeuverContextMenu ( contextMenuEvent, myDataDiv ).show ( );
		}
		else if ( element.noteObjId ) {
			contextMenuEvent.noteObjId = element.noteObjId;
			newNoteContextMenu ( contextMenuEvent, myDataDiv ).show ( );
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
	--- myOnShowNotesClick function ----------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnShowNotesClick ( clickEvent ) {
		myShowNotes = clickEvent.target.checked;
		document.querySelectorAll ( '.TravelNotes-UI-Route-Notes-Row' ).forEach (
			noteRow => { noteRow.classList.toggle ( 'TravelNotes-UI-Route-Notes-Row-Hidden' ); }
		);

	}

	/*
	--- myOnShowManeuversClick function -------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnShowManeuversClick ( clickEvent ) {
		myShowManeuvers = clickEvent.target.checked;
		document.querySelectorAll ( '.TravelNotes-UI-Route-Maneuvers-Row' ).forEach (
			maneuverRow => { maneuverRow.classList.toggle ( 'TravelNotes-UI-Route-Maneuvers-Row-Hidden' ); }
		);

	}

	/*
	--- myRemove function ---------------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRemove ( ) {

		// removing previous header
		if ( myRouteHeader ) {
			myDataDiv.removeChild ( myRouteHeader );
			myRouteHeader = null;
		}

		if ( myCheckBoxesDiv ) {
			document.querySelector ( '#TravelNotes-ItineraryPane-ShowNotesInput' )
				.removeEventListener ( 'click', myOnShowManeuversClick, false );
			document.querySelector ( '#TravelNotes-ItineraryPane-ShowManeuversInput' )
				.removeEventListener ( 'click', myOnShowNotesClick, false );
			myDataDiv.removeChild ( myCheckBoxesDiv );
			myCheckBoxesDiv = null;
		}

		document.querySelectorAll ( '.TravelNotes-UI-Route-Notes-Row, .TravelNotes-UI-Route-Maneuvers-Row' ).forEach (
			row => {
				row.removeEventListener ( 'contextmenu', myOnInstructionContextMenu, false );
				row.removeEventListener ( 'mouseenter', myOnInstructionMouseEnter, false );
				row.removeEventListener ( 'mouseleave', myOnInstructionMouseLeave, false );
			}
		);

		// removing previous itinerary
		myDataDiv.removeChild ( document.querySelector ( '.TravelNotes-UI-Route-ManeuversAndNotes' ) );
	}

	/*
	--- myAdd function ------------------------------------------------------------------------------------------------

	This function add the itinerary to the UI

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAdd ( ) {

		if ( ! myDataDiv ) {
			myDataDiv = document.getElementById ( 'TravelNotes-DataPanesUI-DataPanesDiv' );
		}
		document.getElementById ( 'TravelNotes-DataPanesUI-ItineraryPaneButton' )
			.classList.add ( 'TravelNotes-DataPaneUI-ActivePaneButton' );
		document.getElementById ( 'TravelNotes-DataPanesUI-TravelNotesPaneButton' )
			.classList.remove ( 'TravelNotes-DataPaneUI-ActivePaneButton' );
		if ( window.osmSearch ) {
			document.getElementById ( 'TravelNotes-DataPaneUI-SearchPaneButton' )
				.classList.remove ( 'TravelNotes-DataPaneUI-ActivePaneButton' );
		}

		if ( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId ) {

			// checkboxes
			myCheckBoxesDiv = theHTMLElementsFactory.create ( 'div', null, myDataDiv );

			theHTMLElementsFactory.create (
				'text',
				{
					value : theTranslator.getText ( 'ItineraryPaneUI - Show notes' )
				},
				myCheckBoxesDiv
			);

			theHTMLElementsFactory.create (
				'input',
				{
					type : 'checkbox',
					id : 'TravelNotes-ItineraryPane-ShowNotesInput',
					checked : myShowNotes
				},
				myCheckBoxesDiv
			)
				.addEventListener ( 'click', myOnShowNotesClick, false );

			theHTMLElementsFactory.create (
				'text',
				{
					value : theTranslator.getText ( 'ItineraryPaneUI - Show maneuvers' )
				},
				myCheckBoxesDiv
			);

			theHTMLElementsFactory.create (
				'input',
				{
					type : 'checkbox',
					id : 'TravelNotes-ItineraryPane-ShowManeuversInput',
					checked : myShowManeuvers
				},
				myCheckBoxesDiv
			)
				.addEventListener ( 'click', myOnShowManeuversClick, false );

			// route header
			myRouteHeader = myHTMLViewsFactory.routeHeaderHTML;
			myDataDiv.appendChild ( myRouteHeader );
		}

		// itinerary and notes
		myDataDiv.appendChild ( myHTMLViewsFactory.routeManeuversAndNotesHTML );

		document.querySelectorAll ( '.TravelNotes-UI-Route-Notes-Row, .TravelNotes-UI-Route-Maneuvers-Row' ).forEach (
			row => {
				row.addEventListener ( 'contextmenu', myOnInstructionContextMenu, false );
				row.addEventListener ( 'mouseenter', myOnInstructionMouseEnter, false );
				row.addEventListener ( 'mouseleave', myOnInstructionMouseLeave, false );
			}
		);

		if ( ! myShowNotes ) {
			document.querySelectorAll ( '.TravelNotes-UI-Route-Notes-Row' ).forEach (
				noteRow => { noteRow.classList.toggle ( 'TravelNotes-UI-Route-Notes-Row-Hidden' ); }
			);
		}
		if ( ! myShowManeuvers ) {
			document.querySelectorAll ( '.TravelNotes-UI-Route-Maneuvers-Row' ).forEach (
				maneuverRow => { maneuverRow.classList.toggle ( 'TravelNotes-UI-Route-Maneuvers-Row-Hidden' ); }
			);
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