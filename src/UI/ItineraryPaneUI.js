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
Doc reviewed 20210901
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

@module itineraryPaneUI

@------------------------------------------------------------------------------------------------------------------------------
*/

import PaneUI from '../UI/PaneUI.js';
import theTranslator from '../UILib/Translator.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import ItineraryControlUI from '../UI/ItineraryControlUI.js';
import ItineraryDataUI from '../UI/ItineraryDataUI.js';
import { INVALID_OBJ_ID, PANE_ID } from '../main/Constants.js';

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

	/**
	the ItineraryDataUI Object
	@private
	*/

	#itineraryDataUI = null;

	/**
	the ItineraryControlUI Object
	@private
	*/

	#itineraryControlUI = null;

	/*
	constructor
	*/

	constructor ( paneData, paneControl ) {
		super ( paneData, paneControl );
		this.#itineraryDataUI = new ItineraryDataUI ( this.paneData );
		this.#itineraryControlUI = new ItineraryControlUI ( this.paneControl, this.#itineraryDataUI );
	}

	/**
	This method removes all the elements from the data div and control div
	*/

	remove ( ) {
		this.#itineraryDataUI.clearData ( );
		this.#itineraryControlUI.clearControl ( );
	}

	/**
	This method add the  maneuver and notes to the data div and controls to the controls div
	*/

	add ( ) {
		if ( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId ) {
			this.#itineraryDataUI.addData ( );
			this.#itineraryControlUI.addControl ( );
		}
	}

	/**
	This method returns the pane id
	*/

	getPaneId ( ) { return PANE_ID.itineraryPane; }

	/**
	This method returns the text to add in the pane button
	*/

	getButtonText ( ) { return theTranslator.getText ( 'PanesManagerUI - Itinerary' ); }

}

export default ItineraryPaneUI;

/*
--- End of ItineraryPaneUI.js file ------------------------------------------------------------------------------------
*/