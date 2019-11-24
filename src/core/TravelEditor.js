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

import { g_Config } from '../data/Config.js';
import { g_Translator } from '../UI/Translator.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { g_ErrorEditor } from '../core/ErrorEditor.js';
import { g_MapEditor } from '../core/MapEditor.js';
import { g_RouteEditor } from '../core/RouteEditor.js';

import { newTravelEditorUI } from '../UI/TravelEditorUI.js';
import { newRouteEditorUI } from '../UI/RouteEditorUI.js';
import { newDataPanesUI } from '../UI/DataPanesUI.js';
import { newHTMLViewsFactory } from '../UI/HTMLViewsFactory.js';
import { newProvidersToolbarUI } from '../UI/ProvidersToolbarUI.js';
import { newUtilities } from '../util/Utilities.js';
import { newRoute } from '../data/Route.js';
import { newTravel } from '../data/Travel.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';


let s_haveBeforeUnloadWarning = false;
let s_haveUnloadCleanStorage = false;

/*
--- travelEditor function ---------------------------------------------------------------------------------------------

Patterns : Closure and Singleton

-----------------------------------------------------------------------------------------------------------------------
*/

function newTravelEditor ( ) {

	let m_TravelEditorUI = newTravelEditorUI ( );
	let m_RouteEditorUI = newRouteEditorUI ( );
	let m_Utilities = newUtilities ( );
	let m_DataSearchEngine  = newDataSearchEngine ( );
	let m_DataPanesUIFactory = newDataPanesUI ( );
	
	/*
	--- m_UpdateRoadBook function -------------------------------------------------------------------------------------

	This function changes the HTML page content
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_UpdateRoadBook ( isNewTravel ) {

		if ( ! s_haveUnloadCleanStorage ) {
			window.addEventListener( 
				'unload', 
				( ) => localStorage.removeItem ( g_TravelNotesData.UUID + "-TravelNotesHTML" )
			);
			s_haveUnloadCleanStorage = true;
		}

		if ( ! isNewTravel && ! s_haveBeforeUnloadWarning && g_Config.haveBeforeUnloadWarning ) {
			window.addEventListener( 
				'beforeunload', 
				event => {
					event.returnValue = 'x';
					return 'x'; 
				}
			);
			s_haveBeforeUnloadWarning = true;
		}
		
		if ( m_Utilities.storageAvailable ( 'localStorage' ) ) {
			let htmlViewsFactory = newHTMLViewsFactory ( 'TravelNotes-Roadbook-' );
			localStorage.setItem ( g_TravelNotesData.UUID + "-TravelNotesHTML", htmlViewsFactory.travelHTML.outerHTML );
		}
	}

	/*
	--- m_AddRoute function -------------------------------------------------------------------------------------------

	This function add a new route
	
	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_AddRoute ( ) {
		let route = newRoute ( );
		g_TravelNotesData.travel.routes.add ( route );
		m_TravelEditorUI.setRoutesList ( );
		g_RouteEditor.chainRoutes ( );
		m_UpdateRoadBook ( );
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

		g_MapEditor.removeRoute ( m_DataSearchEngine.getRoute ( routeObjId ), true, true );
		g_TravelNotesData.travel.routes.remove ( routeObjId );
		m_TravelEditorUI.setRoutesList ( );
		if ( routeObjId === g_TravelNotesData.editedRouteObjId  ) {
			g_RouteEditor.cancelEdition ( );
		}
		g_RouteEditor.chainRoutes ( );
		m_UpdateRoadBook ( );
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
		let providersToolbarUI = newProvidersToolbarUI ( );
		if ( providerName && '' !== providerName ) {
			providersToolbarUI.provider = providerName;
		}
		let transitMode = initialRoute.itinerary.transitMode;
		if ( transitMode && '' !== transitMode ) {
			providersToolbarUI.transitMode = transitMode;
		}
		// The edited route is pushed in the editors
		g_TravelNotesData.travel.editedRoute = newRoute ( );
		initialRoute.edited = 1;
		// Route is cloned, so we can have a cancel button in the editor
		g_TravelNotesData.travel.editedRoute.object = initialRoute.object;
		g_TravelNotesData.editedRouteObjId = initialRoute.objId;
		g_TravelNotesData.travel.editedRoute.hidden = false;
		initialRoute.hidden = false;
		g_MapEditor.removeRoute ( initialRoute, true, false );
		g_MapEditor.addRoute ( g_TravelNotesData.travel.editedRoute, true, true );
		g_RouteEditor.chainRoutes ( );
		m_RouteEditorUI .expand ( );
		m_RouteEditorUI.setWayPointsList ( );
		m_DataPanesUIFactory.setItinerary ( );
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
		m_TravelEditorUI.setRoutesList ( );
		if ( routeObjId === g_TravelNotesData.editedRouteObjId ) {
			g_TravelNotesData.travel.editedRoute.name = routeName;
		}
		m_UpdateRoadBook ( );
	}
	
	/*
	--- m_SwapRoute function ------------------------------------------------------------------------------------------

	This function changes the position of a route
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SwapRoute ( routeObjId, swapUp ) {
		g_TravelNotesData.travel.routes.swap ( routeObjId, swapUp );
		m_TravelEditorUI.setRoutesList ( );
		g_RouteEditor.chainRoutes ( );
		m_UpdateRoadBook ( );
	}
	
	/*
	--- m_RouteDropped function ---------------------------------------------------------------------------------------

	This function changes the position of a route after a drag and drop
	
	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_RouteDropped ( draggedRouteObjId, targetRouteObjId, draggedBefore ) {
		g_TravelNotesData.travel.routes.moveTo ( draggedRouteObjId, targetRouteObjId, draggedBefore );
		m_TravelEditorUI.setRoutesList ( );
		g_RouteEditor.chainRoutes ( );
		m_UpdateRoadBook ( );
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
	--- m_ConfirmClose function ---------------------------------------------------------------------------------------

	This function ask a confirmation to the user
	
	-------------------------------------------------------------------------------------------------------------------
	*/
	function m_ConfirmClose ( ) {
		if ( s_haveBeforeUnloadWarning ) {
			return window.confirm ( g_Translator.getText ( "TravelEditor - This page ask to close; data are perhaps not saved." ) );
		}
		return true;
	}
	
	/*
	--- m_Clear function ----------------------------------------------------------------------------------------------

	This function remove completely the current travel
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Clear ( ) {
		if ( ! m_ConfirmClose ( ) )
		{
			return;
		}
		g_MapEditor.removeAllObjects ( );
		g_TravelNotesData.travel.editedRoute = newRoute ( );
		g_TravelNotesData.editedRouteObjId = -1;
		g_TravelNotesData.travel = newTravel ( );
		g_TravelNotesData.travel.routes.add ( newRoute ( ) );
		m_TravelEditorUI. setRoutesList ( );
		m_RouteEditorUI.setWayPointsList (  );
		m_DataPanesUIFactory.setItinerary ( );
		m_UpdateRoadBook ( true );
	}

	/*
	--- travelEditor object -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{

			updateRoadBook : isNewTravel => m_UpdateRoadBook ( isNewTravel ),

			addRoute : ( ) => m_AddRoute ( ),

			removeRoute : routeObjId => m_RemoveRoute ( routeObjId ),

			editRoute : routeObjId => m_EditRoute ( routeObjId ),
			
			renameRoute : ( routeObjId, routeName ) => m_RenameRoute ( routeObjId, routeName ),

			swapRoute : ( routeObjId, swapUp ) => m_SwapRoute  ( routeObjId, swapUp ),

			routeDropped : ( draggedRouteObjId, targetRouteObjId, draggedBefore ) => m_RouteDropped ( draggedRouteObjId, targetRouteObjId, draggedBefore ),
			
			saveTravel : ( ) => m_SaveTravel ( ),

			confirmClose : ( ) => { return m_ConfirmClose ( ); },

			clear : ( ) => m_Clear ( )

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