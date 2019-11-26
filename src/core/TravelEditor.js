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
	- the g_TravelEditor object
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

export { g_TravelEditor };

import { polyline } from '../polyline/Polyline.js';

import { g_Translator } from '../UI/Translator.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { g_ErrorEditor } from '../core/ErrorEditor.js';
import { g_RouteEditor } from '../core/RouteEditor.js';
import { newUtilities } from '../util/Utilities.js';
import { newRoute } from '../data/Route.js';
import { newTravel } from '../data/Travel.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newRoadbookUpdate } from '../roadbook/RoadbookUpdate.js';

/*
--- newTravelEditor function ------------------------------------------------------------------------------------------

Patterns : Closure and Singleton

-----------------------------------------------------------------------------------------------------------------------
*/

function newTravelEditor ( ) {

	let m_Utilities = newUtilities ( );
	let m_DataSearchEngine  = newDataSearchEngine ( );
	let m_EventDispatcher = newEventDispatcher ( );
	
	/*
	--- m_AddRoute function -------------------------------------------------------------------------------------------

	This function add a new route
	
	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_AddRoute ( ) {
		let route = newRoute ( );
		g_TravelNotesData.travel.routes.add ( route );
		m_EventDispatcher.dispatch ( 'setrouteslist' );
		g_RouteEditor.chainRoutes ( );
		newRoadbookUpdate ( );
		if ( 2 !== g_TravelNotesData.travel.editedRoute.edited ) {
			m_EditRoute ( route.objId );
		}
	}
	
	/*
	--- m_RemoveRoute function ----------------------------------------------------------------------------------------

	This function remove a route

	parameters :
	- routeObjId : the TravelNotes route objId to remove
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_RemoveRoute ( routeObjId ) {
		if ( routeObjId === g_TravelNotesData.editedRouteObjId && 2 === g_TravelNotesData.travel.editedRoute.edited ) {
			// cannot remove the route currently edited
			g_ErrorEditor.showError ( g_Translator.getText ( 'TravelEditor - Cannot remove an edited route' ) );
			return;
		}

		m_EventDispatcher.dispatch ( 
			'removeroute', 
			{ 
				route: m_DataSearchEngine.getRoute ( routeObjId ),
				removeNotes: true, 
				removeWayPoints : true
			}
		);
		g_TravelNotesData.travel.routes.remove ( routeObjId );
		m_EventDispatcher.dispatch ( 'setrouteslist' );
		if ( routeObjId === g_TravelNotesData.editedRouteObjId  ) {
			g_RouteEditor.cancelEdition ( );
		}
		g_RouteEditor.chainRoutes ( );
		newRoadbookUpdate ( );
	}
	
	/*
	--- m_EditRoute function ------------------------------------------------------------------------------------------

	This function start the edition of a route
	
	parameters:
	- routeObjId : the TravelNotes route objId to edit

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_EditRoute ( routeObjId ) { 
		if ( 2 === g_TravelNotesData.travel.editedRoute.edited ) {
			// not possible to edit - the current edited route is not saved or cancelled
			g_ErrorEditor.showError ( g_Translator.getText ( "RouteEditor - Not possible to edit a route without a save or cancel" ) );
			return;
		}
		if ( -1 !== g_TravelNotesData.editedRouteObjId ) {
			// the current edited route is not changed. Cleaning the editors
			g_RouteEditor.cancelEdition ( );
		}
		// We verify that the provider  for this route is available
		let initialRoute = m_DataSearchEngine.getRoute ( routeObjId );
		let providerName = initialRoute.itinerary.provider;
		if ( providerName && ( '' !== providerName ) && ( ! g_TravelNotesData.providers.get ( providerName.toLowerCase ( ) ) ) )
		{
			g_ErrorEditor.showError ( g_Translator.getText ( "RouteEditor - Not possible to edit a route created with this provider", {provider : providerName } ) );
			return;
		}
		// Provider and transit mode are changed in the itinerary editor
		if ( providerName && '' !== providerName ) {
			m_EventDispatcher.dispatch ( 'setprovider', { provider : providerName } );
		}
		let transitMode = initialRoute.itinerary.transitMode;
		if ( transitMode && '' !== transitMode ) {
			m_EventDispatcher.dispatch ( 'settransitmode', { transitMode : transitMode } );
		}
		// The edited route is pushed in the editors
		g_TravelNotesData.travel.editedRoute = newRoute ( );
		initialRoute.edited = 1;
		// Route is cloned, so we can have a cancel button in the editor
		g_TravelNotesData.travel.editedRoute.object = initialRoute.object;
		g_TravelNotesData.editedRouteObjId = initialRoute.objId;
		g_TravelNotesData.travel.editedRoute.hidden = false;
		initialRoute.hidden = false;
		m_EventDispatcher.dispatch ( 
			'removeroute', 
			{ 
				route: initialRoute,
				removeNotes: true, 
				removeWayPoints : true
			}
		);
		m_EventDispatcher.dispatch ( 
			'addroute', 
			{
				route : g_TravelNotesData.travel.editedRoute,
				addNotes : true,
				addWayPoints : true,
				readOnly : false
			}
		);
		g_RouteEditor.chainRoutes ( );
		m_EventDispatcher.dispatch ( 'expandrouteui' );
		m_EventDispatcher.dispatch ( 'setwaypointslist' );
		m_EventDispatcher.dispatch ( 'setitinerary' );
	}
	
	/*
	--- m_RenameRoute function ----------------------------------------------------------------------------------------

	This function rename a route
	parameters :
	- routeObjId : the TravelNotes route objId to remove
	- routeName: the new name
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_RenameRoute ( routeObjId, routeName ) {
		m_DataSearchEngine.getRoute ( routeObjId ).name = routeName;
		m_EventDispatcher.dispatch ( 'setrouteslist' );
		if ( routeObjId === g_TravelNotesData.editedRouteObjId ) {
			g_TravelNotesData.travel.editedRoute.name = routeName;
		}
		newRoadbookUpdate ( );
	}
	
	/*
	--- m_SwapRoute function ------------------------------------------------------------------------------------------

	This function changes the position of a route
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SwapRoute ( routeObjId, swapUp ) {
		g_TravelNotesData.travel.routes.swap ( routeObjId, swapUp );
		m_EventDispatcher.dispatch ( 'setrouteslist' );
		g_RouteEditor.chainRoutes ( );
		newRoadbookUpdate ( );
	}
	
	/*
	--- m_RouteDropped function ---------------------------------------------------------------------------------------

	This function changes the position of a route after a drag and drop
	
	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_RouteDropped ( draggedRouteObjId, targetRouteObjId, draggedBefore ) {
		g_TravelNotesData.travel.routes.moveTo ( draggedRouteObjId, targetRouteObjId, draggedBefore );
		m_EventDispatcher.dispatch ( 'setrouteslist' );
		g_RouteEditor.chainRoutes ( );
newRoadbookUpdate ( );
	}

	/*
	--- m_CompressRoute function --------------------------------------------------------------------------------------

	This function compress the itinerary points of a route
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CompressRoute ( route ) {
		let objType = {};
		if ( 0 !== route.itinerary.itineraryPoints.length ) {
			objType = route.itinerary.itineraryPoints [ 0 ].objType;
		}
		let compressedItineraryPoints = { latLngs : [] , distances : [], objIds : [],objType : objType  };
		route.itinerary.itineraryPoints.forEach ( 
			itineraryPoint => {
				compressedItineraryPoints.latLngs.push ( [ itineraryPoint.lat, itineraryPoint.lng ] );
				compressedItineraryPoints.distances.push ( itineraryPoint.distance );
				compressedItineraryPoints.objIds.push ( itineraryPoint.objId );
			}
		);
		compressedItineraryPoints.latLngs = polyline.encode ( compressedItineraryPoints.latLngs, 6 );
		route.itinerary.itineraryPoints = compressedItineraryPoints;
	}

	/*
	--- m_SaveTravel function -----------------------------------------------------------------------------------------

	This function save a travel to a local file
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SaveTravel ( ) {
		let routesIterator = g_TravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {
			routesIterator.value.hidden = false;
		}
		
		// compressing the itineraryPoints
		let compressedTravel = g_TravelNotesData.travel.object;
		compressedTravel.routes.forEach ( m_CompressRoute );
		m_CompressRoute ( compressedTravel.editedRoute );
		// save file
		m_Utilities.saveFile ( compressedTravel.name + '.trv', JSON.stringify ( compressedTravel ) );
	}
	
	/*
	--- m_Clear function ----------------------------------------------------------------------------------------------

	This function remove completely the current travel
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Clear ( ) {
		if ( ! window.confirm ( g_Translator.getText ( "TravelEditor - This page ask to close; data are perhaps not saved." ) ) )
		{
			return;
		}
		m_EventDispatcher.dispatch ( 'removeallobjects' );
		g_TravelNotesData.travel.editedRoute = newRoute ( );
		g_TravelNotesData.editedRouteObjId = -1;
		g_TravelNotesData.travel = newTravel ( );
		g_TravelNotesData.travel.routes.add ( newRoute ( ) );
		m_EventDispatcher.dispatch ( 'setrouteslist' );
		m_EventDispatcher.dispatch ( 'setwaypointslist' );
		m_EventDispatcher.dispatch ( 'setitinerary' );
		newRoadbookUpdate ( );
	}
	
	
	/*
	--- m_ZoomToTravel function ---------------------------------------------------------------------------------------

	This function zoom on the entire travel

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ZoomToTravel ( ) {
		m_EventDispatcher.dispatch ( 'zoomtotravel' );
	}

	/*
	--- travelEditor object -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{

			addRoute : ( ) => m_AddRoute ( ),

			removeRoute : routeObjId => m_RemoveRoute ( routeObjId ),

			editRoute : routeObjId => m_EditRoute ( routeObjId ),
			
			renameRoute : ( routeObjId, routeName ) => m_RenameRoute ( routeObjId, routeName ),

			swapRoute : ( routeObjId, swapUp ) => m_SwapRoute  ( routeObjId, swapUp ),

			routeDropped : ( draggedRouteObjId, targetRouteObjId, draggedBefore ) => m_RouteDropped ( draggedRouteObjId, targetRouteObjId, draggedBefore ),
			
			saveTravel : ( ) => m_SaveTravel ( ),

			clear : ( ) => m_Clear ( ),
			
			zoomToTravel : ( ) => m_ZoomToTravel ( )

		}
	);
}

/* 
--- g_TravelEditor object ---------------------------------------------------------------------------------------------

The one and only one TravelEditor

-----------------------------------------------------------------------------------------------------------------------
*/

const g_TravelEditor = newTravelEditor ( );

/*
--- End of TravelEditor.js file ---------------------------------------------------------------------------------------
*/