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

@file ItineraryPaneUI.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module ItineraryPaneUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { newHTMLViewsFactory } from '../UI/HTMLViewsFactory.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { newNoteContextMenu } from '../contextMenus/NoteContextMenu.js';
import { newManeuverContextMenu } from '../contextMenus/ManeuverContextMenu.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { INVALID_OBJ_ID, LAT_LNG, DATA_PANE_ID } from '../util/Constants.js';

function ourNewItineraryPaneUI ( ) {

	let myEventDispatcher = newEventDispatcher ( );
	let myShowNotes = theConfig.itineraryPane.showNotes;
	let myShowManeuvers = theConfig.itineraryPane.showManeuvers;
	let myDataDiv = null;
	let myRouteHeader = null;
	let myHTMLViewsFactory = newHTMLViewsFactory ( 'TravelNotes-UI-' );
	let myCheckBoxesDiv = null;

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

	function myOnInstructionMouseLeave ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		myEventDispatcher.dispatch ( 'removeobject', { objId : mouseEvent.target.objId } );
	}

	function myOnShowNotesClick ( clickEvent ) {
		myShowNotes = clickEvent.target.checked;
		document.querySelectorAll ( '.TravelNotes-UI-Route-Notes-Row' ).forEach (
			noteRow => { noteRow.classList.toggle ( 'TravelNotes-UI-Route-Notes-Row-Hidden' ); }
		);

	}

	function myOnShowManeuversClick ( clickEvent ) {
		myShowManeuvers = clickEvent.target.checked;
		document.querySelectorAll ( '.TravelNotes-UI-Route-Maneuvers-Row' ).forEach (
			maneuverRow => { maneuverRow.classList.toggle ( 'TravelNotes-UI-Route-Maneuvers-Row-Hidden' ); }
		);

	}

	function myRemove ( dataDiv ) {
		myDataDiv = dataDiv;

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

	function myAdd ( dataDiv ) {
		myDataDiv = dataDiv;
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

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class ItineraryPaneUI
	@classdesc This class manages the itinerary pane UI
	@see {@link newItineraryPaneUI} for constructor
	@see {@link DataPanesUI} for pane UI management
	@implements {PaneUI}
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class ItineraryPaneUI {

		/**
		This function removes all the elements from the data div
		*/

		remove ( dataDiv ) {
			myRemove ( dataDiv );
		}

		/**
		This function add the search data to the data div
		*/

		add ( dataDiv ) {
			myAdd ( dataDiv );
		}

		/**
		This function returns the pane id
		*/

		getId ( ) { return DATA_PANE_ID.itineraryPane; }

		/**
		This function returns the text to add in the pane button
		*/

		getButtonText ( ) { return theTranslator.getText ( 'DataPanesUI - Itinerary' ); }
	}

	return Object.freeze ( new ItineraryPaneUI );
}

export { ourNewItineraryPaneUI as newItineraryPaneUI };

/*
--- End of ItineraryPaneUI.js file ------------------------------------------------------------------------------------
*/