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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210815
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file ItineraryDataUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module ItineraryDataUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theRouteHTMLViewsFactory from '../UI/RouteHTMLViewsFactory.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import NoteContextMenu from '../contextMenus/NoteContextMenu.js';
import ManeuverContextMenu from '../contextMenus/ManeuverContextMenu.js';
import theEventDispatcher from '../util/EventDispatcher.js';
import { ZERO } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ContextMenuManeuverEventListener
@classdesc contextmenu event listener for the maneuvers
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class ContextMenuManeuverEventListener {

	#paneData = null;

	constructor ( paneData ) {
		this.#paneData = paneData;
	}

	handleEvent ( contextMenuEvent ) {
		contextMenuEvent.stopPropagation ( );
		contextMenuEvent.preventDefault ( );
		let maneuverElement = contextMenuEvent.target;
		while ( ! maneuverElement.dataset.tanObjId ) {
			maneuverElement = maneuverElement.parentNode;
		}
		contextMenuEvent.target.dataset.tanObjId = maneuverElement.dataset.tanObjId;
		new ManeuverContextMenu ( contextMenuEvent, this.#paneData ).show ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ContextMenuNoteEventListener
@classdesc contextmenu event listener for the notes
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class ContextMenuNoteEventListener {

	#paneData = null;

	constructor ( paneData ) {
		this.#paneData = paneData;
	}

	handleEvent ( contextMenuEvent ) {
		contextMenuEvent.stopPropagation ( );
		contextMenuEvent.preventDefault ( );
		let maneuverElement = contextMenuEvent.target;
		while ( ! maneuverElement.dataset.tanObjId ) {
			maneuverElement = maneuverElement.parentNode;
		}
		contextMenuEvent.target.dataset.tanObjId = maneuverElement.dataset.tanObjId;
		new NoteContextMenu ( contextMenuEvent, this.#paneData ).show ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class MouseEnterManeuverEventListener
@classdesc mouseenter event listener for maneuvers
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class MouseEnterManeuverEventListener {
	handleEvent ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		theEventDispatcher.dispatch (
			'additinerarypointmarker',
			{
				objId : Number.parseInt ( mouseEvent.target.dataset.tanMarkerObjId ),
				latLng :
					theTravelNotesData.travel.editedRoute.itinerary.itineraryPoints.getAt (
						theTravelNotesData.travel.editedRoute.itinerary.maneuvers.getAt (
							Number.parseInt ( mouseEvent.target.dataset.tanObjId )
						).itineraryPointObjId
					).latLng
			}
		);
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class MouseEnterNoteEventListener
@classdesc mouseenter event listener for notes
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class MouseEnterNoteEventListener {

	handleEvent ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		theEventDispatcher.dispatch (
			'additinerarypointmarker',
			{
				objId : Number.parseInt ( mouseEvent.target.dataset.tanMarkerObjId ),
				latLng :
					theTravelNotesData.travel.editedRoute.notes.getAt (
						Number.parseInt ( mouseEvent.target.dataset.tanObjId )
					).latLng
			}
		);
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class MouseleaveNoteOrManeuverEventListener
@classdesc mouseleave event listener notes and maneuvers
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class MouseleaveNoteOrManeuverEventListener {

	handleEvent ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		theEventDispatcher.dispatch (
			'removeobject',
			{ objId : Number.parseInt ( mouseEvent.target.dataset.tanMarkerObjId ) }
		);
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ItineraryDataUI
@classdesc This class manages the dataPane for the itineraries
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ItineraryDataUI {

	/**
	A reference to the paneData
	@private
	*/

	#paneData = null;

	/** An array with the notes
	@private
	*/

	#notesHTML = [];

	/** An array with the maneuvers
	@private
	*/

	#maneuversHTML = [];

	/**
	An HTMLElement with notes and maneuvers for the edited route
	@private
	*/

	#routeManeuversAndNotesHTML = null;

	/**
	event listeners
	@private
	*/

	#eventListeners = {
		onContextMenu : null,
		onMouseEnter : null,
		onMouseLeave : null
	};

	constructor ( paneData ) {
		this.#paneData = paneData;
		this.#eventListeners.onContextMenuManeuver = new ContextMenuManeuverEventListener ( this.#paneData );
		this.#eventListeners.onContextMenuNote = new ContextMenuNoteEventListener ( this.#paneData );
		this.#eventListeners.onMouseEnterManeuver = new MouseEnterManeuverEventListener ( );
		this.#eventListeners.onMouseEnterNote = new MouseEnterNoteEventListener ( );
		this.#eventListeners.onMouseLeave = new MouseleaveNoteOrManeuverEventListener ( );
	}

	/**
	Show or hide the notes
	*/

	toggleNotes ( ) {
		this.#notesHTML.forEach ( noteHTML => noteHTML.classList.toggle ( 'TravelNotes-Hidden' ) );
	}

	/**
	Show or hide the maneuvers
	*/

	toggleManeuvers ( ) {
		this.#maneuversHTML.forEach ( maneuverHTML => maneuverHTML.classList.toggle ( 'TravelNotes-Hidden' ) );
	}

	/**
	Add the notes and maneuvers for the edited route to the paneData
	*/

	addData ( ) {
		this.#routeManeuversAndNotesHTML = theRouteHTMLViewsFactory.getRouteManeuversAndNotesHTML (
			'TravelNotes-ItineraryPaneUI-',
			theTravelNotesData.travel.editedRoute,
			true
		);
		this.#routeManeuversAndNotesHTML.childNodes.forEach (
			routeOrManeuverHTML => {
				if ( 'Maneuver' === routeOrManeuverHTML.dataset.tanObjType ) {
					routeOrManeuverHTML.addEventListener ( 'contextmenu', this.#eventListeners.onContextMenuManeuver );
					routeOrManeuverHTML.addEventListener ( 'mouseenter', this.#eventListeners.onMouseEnterManeuver );
					routeOrManeuverHTML.addEventListener ( 'mouseleave', this.#eventListeners.onMouseLeave );
					this.#maneuversHTML.push ( routeOrManeuverHTML );
				}
				else if ( 'Note' === routeOrManeuverHTML.dataset.tanObjType ) {
					routeOrManeuverHTML.addEventListener ( 'contextmenu', this.#eventListeners.onContextMenuNote );
					routeOrManeuverHTML.addEventListener ( 'mouseenter', this.#eventListeners.onMouseEnterNote );
					routeOrManeuverHTML.addEventListener ( 'mouseleave', this.#eventListeners.onMouseLeave );
					this.#notesHTML.push ( routeOrManeuverHTML );
				}
			}
		);
		this.#paneData.appendChild ( this.#routeManeuversAndNotesHTML );
	}

	/**
	Remove the notes and maneuvers for the edited route from the paneData
	*/

	clearData ( ) {
		this.#maneuversHTML.forEach (
			maneuverHTML => {
				maneuverHTML.removeEventListener ( 'contextmenu', this.#eventListeners.onContextMenuManeuver );
				maneuverHTML.removeEventListener ( 'mouseenter', this.#eventListeners.onMouseEnterManeuver );
				maneuverHTML.removeEventListener ( 'mouseleave', this.#eventListeners.onMouseLeave );
			}
		);
		this.#maneuversHTML.length = ZERO;
		this.#notesHTML.forEach (
			noteHTML => {
				noteHTML.removeEventListener ( 'contextmenu', this.#eventListeners.onContextMenuNote );
				noteHTML.removeEventListener ( 'mouseenter', this.#eventListeners.onMouseEnterNote );
				noteHTML.removeEventListener ( 'mouseleave', this.#eventListeners.onMouseLeave );
			}
		);
		this.#notesHTML.length = ZERO;
		if ( this.#routeManeuversAndNotesHTML ) {
			this.#paneData.removeChild ( this.#routeManeuversAndNotesHTML );
		}
		this.#routeManeuversAndNotesHTML = null;
	}
}

export default ItineraryDataUI;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of ItineraryDataUI.js file

@------------------------------------------------------------------------------------------------------------------------------
*/