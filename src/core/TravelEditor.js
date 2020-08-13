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
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #26 : added confirmation message before leaving the page when data modified.
		- Issue #27 : push directly the route in the editor when starting a new travel
		- Issue #31 : Add a command to import from others maps
		- Issue #34 : Add a command to show all routes
		- Issue #37 : Add the file name and mouse coordinates somewhere
	- v1.3.0:
		- moved JSON.parse, due to use of Promise
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- moving file functions from TravelEditor to the new FileLoader
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
	- v1.7.0:
		- Issue #90 : Open profiles are not closed when opening a travel or when starting a new travel
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20200810
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file TravelEditor.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module TravelEditor
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theConfig } from '../data/Config.js';
import { theRouteEditor } from '../core/RouteEditor.js';
import { newUtilities } from '../util/Utilities.js';
import { newRoute } from '../data/Route.js';
import { newTravel } from '../data/Travel.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newFileCompactor } from '../core/FileCompactor.js';
import { theProfileWindowsManager } from '../core/ProfileWindowsManager.js';
import { INVALID_OBJ_ID } from '../util/Constants.js';

let ourUtilities = newUtilities ( );
let ourEventDispatcher = newEventDispatcher ( );

/**
@--------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class contains methods fot Travel creation or modifications
@see {@link theTravelEditor} for the one and only one instance of this class
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class TravelEditor {

	/**
	This method is called when a route is dropped in the TravelUI and then routes reordered.
	@param {!number} draggedRouteObjId The objId of the dragged route
	@param {!number} targetRouteObjId The objId of the route on witch the drop was executed
	@param {boolean} draggedBefore when true the dragged route is moved before the target route
	when false after
	@fires setrouteslist
	@fires roadbookupdate
	*/

	routeDropped ( draggedRouteObjId, targetRouteObjId, draggedBefore )		{
		theTravelNotesData.travel.routes.moveTo ( draggedRouteObjId, targetRouteObjId, draggedBefore );
		theRouteEditor.chainRoutes ( );
		ourEventDispatcher.dispatch ( 'setrouteslist' );
		ourEventDispatcher.dispatch ( 'roadbookupdate' );
	}

	/**
	This method save the current travel to a file
	*/

	saveTravel ( ) {
		let routesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {
			routesIterator.value.hidden = false;
		}
		let compressedTravel = newFileCompactor ( ).compress ( theTravelNotesData.travel );
		ourUtilities.saveFile ( compressedTravel.name + '.trv', JSON.stringify ( compressedTravel ) );
	}

	/**
	This method clear the current travel and start a new travel
	@fires removeallobjects
	@fires setrouteslist
	@fires setitinerary
	@fires travelnameupdated
	@fires roadbookupdate
	*/

	clear ( ) {
		if ( ! window.confirm ( theTranslator.getText (
			'TravelEditor - This page ask to close; data are perhaps not saved.' ) ) ) {
			return;
		}
		theProfileWindowsManager.deleteAllProfiles ( );
		ourEventDispatcher.dispatch ( 'removeallobjects' );
		theTravelNotesData.travel.editedRoute = newRoute ( );
		theTravelNotesData.editedRouteObjId = INVALID_OBJ_ID;
		theTravelNotesData.travel = newTravel ( );
		theTravelNotesData.travel.routes.add ( newRoute ( ) );
		ourEventDispatcher.dispatch ( 'setrouteslist' );
		ourEventDispatcher.dispatch ( 'setitinerary' );
		ourEventDispatcher.dispatch ( 'roadbookupdate' );
		ourEventDispatcher.dispatch ( 'travelnameupdated' );
		if ( theConfig.travelEditor.startupRouteEdition ) {
			theRouteEditor.editRoute ( theTravelNotesData.travel.routes.first.objId );
		}
	}

}

const ourTravelEditor = Object.seal ( new TravelEditor );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of TravelEditor class
	@type {TravelEditor}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourTravelEditor as theTravelEditor
};

/*
--- End of TravelEditor.js file -----------------------------------------------------------------------------------------------
*/