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

import { theHTMLViewsFactory } from '../UI/HTMLViewsFactory.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { newNoteContextMenu } from '../contextMenus/NoteContextMenu.js';
import { newManeuverContextMenu } from '../contextMenus/ManeuverContextMenu.js';
import { theEventDispatcher } from '../util/EventDispatcher.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { INVALID_OBJ_ID, LAT_LNG, PANE_ID } from '../util/Constants.js';

function ourNewItineraryPaneUI ( ) {

	let myShowNotes = theConfig.itineraryPane.showNotes;
	let myShowManeuvers = theConfig.itineraryPane.showManeuvers;
	let myPaneDataDiv = null;
	let myPaneControlDiv = null;
	let myCheckBoxesDiv = null;
	let myRouteHeader = null;
	let myShowNotesCheckBox = null;
	let myShowManeuversCheckBox = null;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnManeuverOrNoteContextMenu
	@desc context menu event listener for maneuvers and notes
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnManeuverOrNoteContextMenu ( contextMenuEvent ) {
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
			newManeuverContextMenu ( contextMenuEvent, myPaneDataDiv ).show ( );
		}
		else if ( element.noteObjId ) {
			contextMenuEvent.noteObjId = element.noteObjId;
			newNoteContextMenu ( contextMenuEvent, myPaneDataDiv ).show ( );
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnManeuverOrNoteMouseEnter
	@desc mouse enter event listener for maneuvers and notes
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnManeuverOrNoteMouseEnter ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		theEventDispatcher.dispatch (
			'additinerarypointmarker',
			{
				objId : mouseEvent.target.objId,
				latLng : mouseEvent.target.latLng
			}
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnManeuverOrNoteMouseLeave
	@desc mouse leave event listener for maneuvers and notes
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnManeuverOrNoteMouseLeave ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		theEventDispatcher.dispatch ( 'removeobject', { objId : mouseEvent.target.objId } );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnShowNotesClick
	@desc click event listener for show notes check box
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnShowNotesClick ( clickEvent ) {
		myShowNotes = clickEvent.target.checked;
		document.querySelectorAll ( '.TravelNotes-UI-Route-Notes-Row' ).forEach (
			noteRow => { noteRow.classList.toggle ( 'TravelNotes-UI-Route-Notes-Row-Hidden' ); }
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnShowManeuversClick
	@desc click event listener for show maneuvers check box
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnShowManeuversClick ( clickEvent ) {
		myShowManeuvers = clickEvent.target.checked;
		document.querySelectorAll ( '.TravelNotes-UI-Route-Maneuvers-Row' ).forEach (
			maneuverRow => { maneuverRow.classList.toggle ( 'TravelNotes-UI-Route-Maneuvers-Row-Hidden' ); }
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myClearPaneControlDiv
	@desc Remove all controls from the pane controls div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myClearPaneControlDiv ( ) {
		if ( myCheckBoxesDiv ) {
			if ( myShowManeuversCheckBox ) {
				myShowManeuversCheckBox.removeEventListener ( 'click', myOnShowManeuversClick, false );
				myCheckBoxesDiv.removeChild ( myShowManeuversCheckBox );
				myShowManeuversCheckBox = null;
			}
			if ( myShowNotesCheckBox ) {
				myShowNotesCheckBox.removeEventListener ( 'click', myOnShowNotesClick, false );
				myCheckBoxesDiv.removeChild ( myShowNotesCheckBox );
				myShowNotesCheckBox = null;
			}
			myPaneControlDiv.removeChild ( myCheckBoxesDiv );
			myCheckBoxesDiv = null;
		}
		if ( myRouteHeader ) {
			myPaneControlDiv.removeChild ( myRouteHeader );
			myRouteHeader = null;
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myClearPaneDataDiv
	@desc Remove all notes and maneuvers from the pane data div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myClearPaneDataDiv ( ) {
		document.querySelectorAll ( '.TravelNotes-UI-Route-Notes-Row, .TravelNotes-UI-Route-Maneuvers-Row' ).forEach (
			row => {
				row.removeEventListener ( 'contextmenu', myOnManeuverOrNoteContextMenu, false );
				row.removeEventListener ( 'mouseenter', myOnManeuverOrNoteMouseEnter, false );
				row.removeEventListener ( 'mouseleave', myOnManeuverOrNoteMouseLeave, false );
			}
		);
		let routeAndNotesElement = document.querySelector ( '.TravelNotes-UI-Route-ManeuversAndNotes' );
		if ( routeAndNotesElement ) {
			myPaneDataDiv.removeChild ( routeAndNotesElement );
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddControls
	@desc Create the controls div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddControls ( ) {
		myCheckBoxesDiv = theHTMLElementsFactory.create ( 'div', null, myPaneControlDiv );
		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'ItineraryPaneUI - Show notes' )
			},
			myCheckBoxesDiv
		);
		myShowNotesCheckBox = theHTMLElementsFactory.create (
			'input',
			{
				type : 'checkbox',
				id : 'TravelNotes-ItineraryPane-ShowNotesInput',
				checked : myShowNotes
			},
			myCheckBoxesDiv
		);
		myShowNotesCheckBox.addEventListener ( 'click', myOnShowNotesClick, false );
		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'ItineraryPaneUI - Show maneuvers' )
			},
			myCheckBoxesDiv
		);
		myShowManeuversCheckBox = theHTMLElementsFactory.create (
			'input',
			{
				type : 'checkbox',
				id : 'TravelNotes-ItineraryPane-ShowManeuversInput',
				checked : myShowManeuvers
			},
			myCheckBoxesDiv
		);
		myShowManeuversCheckBox.addEventListener ( 'click', myOnShowManeuversClick, false );
		myRouteHeader = theHTMLViewsFactory.getRouteHeaderHTML ( 'TravelNotes-UI-', theTravelNotesData.travel.editedRoute );
		myPaneControlDiv.appendChild ( myRouteHeader );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddData
	@desc Add notes and maneuvers to the pane data div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddData ( ) {
		myPaneDataDiv.appendChild ( theHTMLViewsFactory.getEditedRouteManeuversAndNotesHTML ( 'TravelNotes-UI-' ) );

		document.querySelectorAll ( '.TravelNotes-UI-Route-Notes-Row, .TravelNotes-UI-Route-Maneuvers-Row' ).forEach (
			row => {
				row.addEventListener ( 'contextmenu', myOnManeuverOrNoteContextMenu, false );
				row.addEventListener ( 'mouseenter', myOnManeuverOrNoteMouseEnter, false );
				row.addEventListener ( 'mouseleave', myOnManeuverOrNoteMouseLeave, false );
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
	@see {@link PanesManagerUI} for pane UI management
	@implements {PaneUI}
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class ItineraryPaneUI {

		/**
		This function removes all the elements from the data div and control div
		*/

		remove ( ) {
			myClearPaneDataDiv ( );
			myClearPaneControlDiv ( );
		}

		/**
		This function add the  maneuver and notes to the data div and controls to the controls div
		*/

		add ( ) {
			if ( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId ) {
				myAddControls ( );
				myAddData ( );
			}
		}

		/**
		This function returns the pane id
		*/

		getId ( ) { return PANE_ID.itineraryPane; }

		/**
		This function returns the text to add in the pane button
		*/

		getButtonText ( ) { return theTranslator.getText ( 'PanesManagerUI - Itinerary' ); }

		/**
		Set the pane data div and pane control div
		*/

		setPaneDivs ( paneDataDiv, paneControlDiv ) {
			myPaneDataDiv = paneDataDiv;
			myPaneControlDiv = paneControlDiv;
		}
	}

	return Object.freeze ( new ItineraryPaneUI );
}

export { ourNewItineraryPaneUI as newItineraryPaneUI };

/*
--- End of ItineraryPaneUI.js file ------------------------------------------------------------------------------------
*/