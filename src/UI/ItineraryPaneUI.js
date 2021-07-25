/*
Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/

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
		- Issue ♯65 : Time to go to ES6 modules?
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210725
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file ItineraryPaneUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
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

import PaneUI from '../UI/PaneUI.js';
import theHTMLViewsFactory from '../UI/HTMLViewsFactory.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theTranslator from '../UI/Translator.js';
import theConfig from '../data/Config.js';
import { newNoteContextMenu } from '../contextMenus/NoteContextMenu.js';
import { newManeuverContextMenu } from '../contextMenus/ManeuverContextMenu.js';
import theEventDispatcher from '../util/EventDispatcher.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import { INVALID_OBJ_ID, LAT_LNG, PANE_ID } from '../util/Constants.js';

class ManeuverOrNoteEventListeners {

	static onContextMenu ( contextMenuEvent ) {
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
			newManeuverContextMenu (
				contextMenuEvent,
				document.getElementById ( 'TravelNotes-PanesManagerUI-PaneDataDiv' )
			).show ( );
		}
		else if ( element.noteObjId ) {
			contextMenuEvent.noteObjId = element.noteObjId;
			newNoteContextMenu (
				contextMenuEvent,
				document.getElementById ( 'TravelNotes-PanesManagerUI-PaneDataDiv' )
			).show ( );
		}
	}

	static onMouseEnter ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		theEventDispatcher.dispatch (
			'additinerarypointmarker',
			{
				objId : mouseEvent.target.objId,
				latLng : mouseEvent.target.latLng
			}
		);
	}

	static onMouseLeave ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		theEventDispatcher.dispatch ( 'removeobject', { objId : mouseEvent.target.objId } );
	}
}

class ShowNotesCheckboxEventListeners {

	static onClick ( ) {
		document.querySelectorAll ( '.TravelNotes-ItineraryPaneUI-Route-Notes-Row' ).forEach (
			noteRow => { noteRow.classList.toggle ( 'TravelNotes-Hidden' ); }
		);
	}
}

class ShowManeuversCheckboxEventListeners {

	static onClick ( ) {
		document.querySelectorAll ( '.TravelNotes-ItineraryPaneUI-Route-Maneuvers-Row' ).forEach (
			maneuverRow => { maneuverRow.classList.toggle ( 'TravelNotes-Hidden' ); }
		);
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class ItineraryPaneUI
@classdesc This class manages the itinerary pane UI
@see {@link PanesManagerUI} for pane UI management
@extends PaneUI
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class ItineraryPaneUI extends PaneUI {

	#routeHeader = null;
	#checkBoxesDiv = null;

	#showNotesCheckBox = null;
	#showManeuversCheckBox = null;
	#showNotes = theConfig.itineraryPaneUI.showNotes;
	#showManeuvers = theConfig.itineraryPaneUI.showManeuvers;

	/**
	Create the controls div
	@private
	*/

	#addControls ( ) {
		this.#checkBoxesDiv = theHTMLElementsFactory.create ( 'div', null, this.paneControlDiv );
		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'ItineraryPaneUI - Show notes' )
			},
			this.#checkBoxesDiv
		);
		this.#showNotesCheckBox = theHTMLElementsFactory.create (
			'input',
			{
				type : 'checkbox',
				id : 'TravelNotes-ItineraryPane-ShowNotesInput',
				checked : this.#showNotes
			},
			this.#checkBoxesDiv
		);
		this.#showNotesCheckBox.addEventListener ( 'click', ShowNotesCheckboxEventListeners.onClick, false );
		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'ItineraryPaneUI - Show maneuvers' )
			},
			this.#checkBoxesDiv
		);
		this.#showManeuversCheckBox = theHTMLElementsFactory.create (
			'input',
			{
				type : 'checkbox',
				id : 'TravelNotes-ItineraryPane-ShowManeuversInput',
				checked : this.#showManeuvers
			},
			this.#checkBoxesDiv
		);
		this.#showManeuversCheckBox.addEventListener ( 'click', ShowManeuversCheckboxEventListeners.onClick, false );
		this.#routeHeader = theHTMLViewsFactory.getRouteHeaderHTML (
			'TravelNotes-ItineraryPaneUI-',
			theTravelNotesData.travel.editedRoute
		);
		this.paneControlDiv.appendChild ( this.#routeHeader );
	}

	/**
	Add notes and maneuvers to the pane data div
	@private
	*/

	#addData ( ) {
		this.paneDataDiv.appendChild (
			theHTMLViewsFactory.getEditedRouteManeuversAndNotesHTML ( 'TravelNotes-ItineraryPaneUI-' )
		);

		document.querySelectorAll (
			'.TravelNotes-ItineraryPaneUI-Route-Notes-Row, .TravelNotes-ItineraryPaneUI-Route-Maneuvers-Row'
		).forEach (
			row => {
				row.addEventListener ( 'contextmenu', ManeuverOrNoteEventListeners.onContextMenu, false );
				row.addEventListener ( 'mouseenter', ManeuverOrNoteEventListeners.onMouseEnter, false );
				row.addEventListener ( 'mouseleave', ManeuverOrNoteEventListeners.onMouseLeave, false );
			}
		);
		if ( ! this.#showNotesCheckBox.checked ) {
			document.querySelectorAll ( '.TravelNotes-ItineraryPaneUI-Route-Notes-Row' ).forEach (
				noteRow => { noteRow.classList.toggle ( 'TravelNotes-Hidden' ); }
			);
		}
		if ( ! this.#showManeuversCheckBox.checked ) {
			document.querySelectorAll ( '.TravelNotes-ItineraryPaneUI-Route-Maneuvers-Row' ).forEach (
				maneuverRow => { maneuverRow.classList.toggle ( 'TravelNotes-Hidden' ); }
			);
		}
	}

	/**
	Remove all controls from the pane controls div
	@private
	*/

	#clearPaneControlDiv ( ) {
		if ( this.#checkBoxesDiv ) {
			if ( this.#showManeuversCheckBox ) {
				this.#showManeuvers = this.#showManeuversCheckBox.checked;
				this.#showManeuversCheckBox.removeEventListener ( 'click', ShowManeuversCheckboxEventListeners.onClick, false );
				this.#checkBoxesDiv.removeChild ( this.#showManeuversCheckBox );
				this.#showManeuversCheckBox = null;
			}
			if ( this.#showNotesCheckBox ) {
				this.#showNotes = this.#showNotesCheckBox.checked;
				this.#showNotesCheckBox.removeEventListener ( 'click', ShowNotesCheckboxEventListeners.onClick, false );
				this.#checkBoxesDiv.removeChild ( this.#showNotesCheckBox );
				this.#showNotesCheckBox = null;
			}
			this.paneControlDiv.removeChild ( this.#checkBoxesDiv );
			this.#checkBoxesDiv = null;
		}
		if ( this.#routeHeader ) {
			this.paneControlDiv.removeChild ( this.#routeHeader );
			this.#routeHeader = null;
		}
	}

	/**
	Remove all notes and maneuvers from the pane data div
	@private
	*/

	#clearPaneDataDiv ( ) {
		document.querySelectorAll (
			'.TravelNotes-ItineraryPaneUI-Route-Notes-Row, .TravelNotes-ItineraryPaneUI-Route-Maneuvers-Row'
		).forEach (
			row => {
				row.removeEventListener ( 'contextmenu', ManeuverOrNoteEventListeners.onContextMenu, false );
				row.removeEventListener ( 'mouseenter', ManeuverOrNoteEventListeners.onMouseEnter, false );
				row.removeEventListener ( 'mouseleave', ManeuverOrNoteEventListeners.onMouseLeave, false );
			}
		);
		let routeAndNotesElement = document.querySelector ( '.TravelNotes-ItineraryPaneUI-Route-ManeuversAndNotes' );
		if ( routeAndNotesElement ) {
			this.paneDataDiv.removeChild ( routeAndNotesElement );
		}
	}

	constructor ( ) {
		super ( );
		Object.seal ( this );
	}

	/**
	This function removes all the elements from the data div and control div
	*/

	remove ( ) {
		this.#clearPaneDataDiv ( );
		this.#clearPaneControlDiv ( );
	}

	/**
	This function add the  maneuver and notes to the data div and controls to the controls div
	*/

	add ( ) {
		if ( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId ) {
			this.#addControls ( );
			this.#addData ( );
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

}

export default ItineraryPaneUI;

/*
--- End of ItineraryPaneUI.js file ------------------------------------------------------------------------------------
*/