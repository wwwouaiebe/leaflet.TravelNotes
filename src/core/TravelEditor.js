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
Doc reviewed 20191121
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { polyline } from '../polyline/Polyline.js';

import { theTranslator } from '../UI/Translator.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theConfig } from '../data/Config.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';
import { theRouteEditor } from '../core/RouteEditor.js';
import { newUtilities } from '../util/Utilities.js';
import { newRoute } from '../data/Route.js';
import { newTravel } from '../data/Travel.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';

import { THE_CONST } from '../util/Constants.js';

/*
--- newTravelEditor function ------------------------------------------------------------------------------------------

Patterns : Closure and Singleton

-----------------------------------------------------------------------------------------------------------------------
*/

function newTravelEditor ( ) {

	let myUtilities = newUtilities ( );
	let myDataSearchEngine = newDataSearchEngine ( );
	let myEventDispatcher = newEventDispatcher ( );

	/*
	--- myEditRoute function ------------------------------------------------------------------------------------------

	This function start the edition of a route

	parameters:
	- routeObjId : the TravelNotes route objId to edit

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myEditRoute ( routeObjId ) {
		if ( THE_CONST.route.edited.editedChanged === theTravelNotesData.travel.editedRoute.edited ) {

			// not possible to edit - the current edited route is not saved or cancelled
			theErrorsUI.showError (
				theTranslator.getText ( 'RouteEditor - Not possible to edit a route without a save or cancel' )
			);
			return;
		}
		if ( THE_CONST.invalidObjId !== theTravelNotesData.editedRouteObjId ) {

			// the current edited route is not changed. Cleaning the editors
			theRouteEditor.cancelEdition ( );
		}

		// We verify that the provider  for this route is available
		let initialRoute = myDataSearchEngine.getRoute ( routeObjId );
		let providerName = initialRoute.itinerary.provider;
		if (
			providerName
				&&
				( '' !== providerName )
				&&
				( ! theTravelNotesData.providers.get ( providerName.toLowerCase ( ) ) )
		) {
			theErrorsUI.showError (
				theTranslator.getText (
					'RouteEditor - Not possible to edit a route created with this provider',
					{ provider : providerName }
				)
			);
			return;
		}

		// Provider and transit mode are changed in the itinerary editor
		if ( providerName && '' !== providerName ) {
			myEventDispatcher.dispatch ( 'setprovider', { provider : providerName } );
		}
		let transitMode = initialRoute.itinerary.transitMode;
		if ( transitMode && '' !== transitMode ) {
			myEventDispatcher.dispatch ( 'settransitmode', { transitMode : transitMode } );
		}

		// The edited route is pushed in the editors
		theTravelNotesData.travel.editedRoute = newRoute ( );
		initialRoute.edited = THE_CONST.route.edited.editedNoChange;

		// Route is cloned, so we can have a cancel button in the editor
		theTravelNotesData.travel.editedRoute.object = initialRoute.object;
		theTravelNotesData.editedRouteObjId = initialRoute.objId;
		theTravelNotesData.travel.editedRoute.hidden = false;
		initialRoute.hidden = false;
		theRouteEditor.chainRoutes ( );
		myEventDispatcher.dispatch (
			'routeupdated',
			{
				removedRouteObjId : initialRoute.objId,
				addedRouteObjId : theTravelNotesData.travel.editedRoute.objId
			}
		);
		myEventDispatcher.dispatch ( 'expandrouteui' );
		myEventDispatcher.dispatch ( 'setwaypointslist' );
		myEventDispatcher.dispatch ( 'setitinerary' );
	}

	/*
	--- myAddRoute function -------------------------------------------------------------------------------------------

	This function add a new route

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddRoute ( ) {
		let route = newRoute ( );
		theTravelNotesData.travel.routes.add ( route );
		myEventDispatcher.dispatch ( 'setrouteslist' );
		theRouteEditor.chainRoutes ( );
		myEventDispatcher.dispatch ( 'roadbookupdate' );
		if ( THE_CONST.route.edited.editedChanged !== theTravelNotesData.travel.editedRoute.edited ) {
			myEditRoute ( route.objId );
		}
	}

	/*
	--- myRemoveRoute function ----------------------------------------------------------------------------------------

	This function remove a route

	parameters :
	- routeObjId : the TravelNotes route objId to remove

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRemoveRoute ( routeObjId ) {
		if (
			routeObjId === theTravelNotesData.editedRouteObjId
			&&
			THE_CONST.route.edited.editedChanged === theTravelNotesData.travel.editedRoute.edited
		) {

			// cannot remove the route currently edited
			theErrorsUI.showError ( theTranslator.getText ( 'TravelEditor - Cannot remove an edited route' ) );
			return;
		}

		theTravelNotesData.travel.routes.remove ( routeObjId );

		theRouteEditor.chainRoutes ( );

		myEventDispatcher.dispatch (
			'routeupdated',
			{
				removedRouteObjId : routeObjId,
				addedRouteObjId : THE_CONST.invalidObjId
			}
		);
		myEventDispatcher.dispatch ( 'setrouteslist' );
		if ( routeObjId === theTravelNotesData.editedRouteObjId ) {
			theRouteEditor.cancelEdition ( );
		}
	}

	/*
	--- myRenameRoute function ----------------------------------------------------------------------------------------

	This function rename a route
	parameters :
	- routeObjId : the TravelNotes route objId to remove
	- routeName: the new name

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRenameRoute ( routeObjId, routeName ) {
		myDataSearchEngine.getRoute ( routeObjId ).name = routeName;
		if ( routeObjId === theTravelNotesData.editedRouteObjId ) {
			theTravelNotesData.travel.editedRoute.name = routeName;
		}
		myEventDispatcher.dispatch ( 'setrouteslist' );
		myEventDispatcher.dispatch ( 'roadbookupdate' );
	}

	/*
	--- mySwapRoute function ------------------------------------------------------------------------------------------

	This function changes the position of a route

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySwapRoute ( routeObjId, swapUp ) {
		theTravelNotesData.travel.routes.swap ( routeObjId, swapUp );
		theRouteEditor.chainRoutes ( );
		myEventDispatcher.dispatch ( 'setrouteslist' );
		myEventDispatcher.dispatch ( 'roadbookupdate' );
	}

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
	--- myCompressRoute function --------------------------------------------------------------------------------------

	This function compress the itinerary points of a route

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCompressRoute ( route ) {
		let objType = {};
		if ( THE_CONST.zero !== route.itinerary.itineraryPoints.length ) {
			objType = route.itinerary.itineraryPoints [ THE_CONST.zero ].objType;
		}
		let compressedItineraryPoints = { latLngs : [], distances : [], objIds : [], objType : objType };
		route.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				compressedItineraryPoints.latLngs.push ( [ itineraryPoint.lat, itineraryPoint.lng ] );
				compressedItineraryPoints.distances.push ( itineraryPoint.distance );
				compressedItineraryPoints.objIds.push ( itineraryPoint.objId );
			}
		);
		compressedItineraryPoints.latLngs =
			polyline.encode ( compressedItineraryPoints.latLngs, THE_CONST.polylinePrecision );
		route.itinerary.itineraryPoints = compressedItineraryPoints;
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

		// compressing the itineraryPoints
		let compressedTravel = theTravelNotesData.travel.object;
		compressedTravel.routes.forEach ( myCompressRoute );
		myCompressRoute ( compressedTravel.editedRoute );

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
		myEventDispatcher.dispatch ( 'removeallobjects' );
		theTravelNotesData.travel.editedRoute = newRoute ( );
		theTravelNotesData.editedRouteObjId = THE_CONST.invalidObjId;
		theTravelNotesData.travel = newTravel ( );
		theTravelNotesData.travel.routes.add ( newRoute ( ) );
		myEventDispatcher.dispatch ( 'setrouteslist' );
		myEventDispatcher.dispatch ( 'setwaypointslist' );
		myEventDispatcher.dispatch ( 'setitinerary' );
		myEventDispatcher.dispatch ( 'roadbookupdate' );
		myEventDispatcher.dispatch ( 'travelnotesfileloaded', { readOnly : false, name : '' } );
		if ( theConfig.travelEditor.startupRouteEdition ) {
			myEditRoute ( theTravelNotesData.travel.routes.first.objId );
		}
	}

	/*
	--- myZoomToTravel function ---------------------------------------------------------------------------------------

	This function zoom on the entire travel

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myZoomToTravel ( ) {
		let geometry = [];

		function pushNoteGeometry ( note ) {
			geometry.push ( note.latLng );
			geometry.push ( note.iconLatLng );
		}

		function pushRouteGeometry ( route ) {
			route.itinerary.itineraryPoints.forEach ( itineraryPoint => geometry.push ( itineraryPoint.latLng ) );
			route.notes.forEach (
				note => pushNoteGeometry ( note )
			);
		}

		theTravelNotesData.travel.routes.forEach (
			route => pushRouteGeometry ( route )
		);

		if ( THE_CONST.invalidObjId !== theTravelNotesData.travel.editedRouteObjId ) {
			pushRouteGeometry ( theTravelNotesData.travel.editedRoute );
		}

		theTravelNotesData.travel.notes.forEach (
			note => pushNoteGeometry ( note )
		);

		myEventDispatcher.dispatch (
			'zoomto',
			{
				geometry : [ geometry ]
			}
		);
	}

	/*
	--- travelEditor object -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{

			addRoute : ( ) => myAddRoute ( ),

			removeRoute : routeObjId => myRemoveRoute ( routeObjId ),

			editRoute : routeObjId => myEditRoute ( routeObjId ),

			renameRoute : ( routeObjId, routeName ) => myRenameRoute ( routeObjId, routeName ),

			swapRoute : ( routeObjId, swapUp ) => mySwapRoute ( routeObjId, swapUp ),

			routeDropped : ( draggedRouteObjId, targetRouteObjId, draggedBefore ) => myRouteDropped (
				draggedRouteObjId,
				targetRouteObjId,
				draggedBefore
			),

			saveTravel : ( ) => mySaveTravel ( ),

			clear : ( ) => myClear ( ),

			zoomToTravel : ( ) => myZoomToTravel ( )

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