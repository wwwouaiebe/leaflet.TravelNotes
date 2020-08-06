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
--- TravelEditor.js file ----------------------------------------------------------------------------------------------
This file contains:
	- the newTravelEditor function
	- the theTravelEditor object
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
Doc reviewed 20191121
Tests ...

-----------------------------------------------------------------------------------------------------------------------
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

/*
--- newTravelEditor function ------------------------------------------------------------------------------------------

Patterns : Closure and Singleton

-----------------------------------------------------------------------------------------------------------------------
*/

function newTravelEditor ( ) {

	let myUtilities = newUtilities ( );
	let myEventDispatcher = newEventDispatcher ( );

	/*
	--- myRouteDropped function ---------------------------------------------------------------------------------------

	This function changes the position of a route after a drag and drop

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRouteDropped ( draggedRouteObjId, targetRouteObjId, draggedBefore ) {
		theTravelNotesData.travel.routes.moveTo ( draggedRouteObjId, targetRouteObjId, draggedBefore );
		theRouteEditor.chainRoutes ( );
		myEventDispatcher.dispatch ( 'setrouteslist' );
		myEventDispatcher.dispatch ( 'roadbookupdate' );
	}

	/*
	--- mySaveTravel function -----------------------------------------------------------------------------------------

	This function save a travel to a local file

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySaveTravel ( ) {
		let routesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {
			routesIterator.value.hidden = false;
		}

		let compressedTravel = newFileCompactor ( ).compress ( theTravelNotesData.travel );

		// save file
		myUtilities.saveFile ( compressedTravel.name + '.trv', JSON.stringify ( compressedTravel ) );
	}

	/*
	--- myClear function ----------------------------------------------------------------------------------------------

	This function remove completely the current travel

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myClear ( ) {
		if ( ! window.confirm ( theTranslator.getText (
			'TravelEditor - This page ask to close; data are perhaps not saved.' ) ) ) {
			return;
		}
		theProfileWindowsManager.deleteAllProfiles ( );
		myEventDispatcher.dispatch ( 'removeallobjects' );
		theTravelNotesData.travel.editedRoute = newRoute ( );
		theTravelNotesData.editedRouteObjId = INVALID_OBJ_ID;
		theTravelNotesData.travel = newTravel ( );
		theTravelNotesData.travel.routes.add ( newRoute ( ) );
		myEventDispatcher.dispatch ( 'setrouteslist' );
		myEventDispatcher.dispatch ( 'setitinerary' );
		myEventDispatcher.dispatch ( 'roadbookupdate' );
		myEventDispatcher.dispatch ( 'travelnameupdated' );
		if ( theConfig.travelEditor.startupRouteEdition ) {
			theRouteEditor.editRoute ( theTravelNotesData.travel.routes.first.objId );
		}
	}

	/*
	--- travelEditor object -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{

			routeDropped : ( draggedRouteObjId, targetRouteObjId, draggedBefore ) => myRouteDropped (
				draggedRouteObjId,
				targetRouteObjId,
				draggedBefore
			),

			saveTravel : ( ) => mySaveTravel ( ),

			clear : ( ) => myClear ( )

		}
	);
}

/*
--- theTravelEditor object ---------------------------------------------------------------------------------------------

The one and only one TravelEditor

-----------------------------------------------------------------------------------------------------------------------
*/

const theTravelEditor = newTravelEditor ( );

export { theTravelEditor };

/*
--- End of TravelEditor.js file ---------------------------------------------------------------------------------------
*/