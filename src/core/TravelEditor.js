/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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
	- the TravelEditor object
	- the module.exports implementation
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
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var g_TravelNotesData = require ( '../L.TravelNotes' );

	var s_haveBeforeUnloadWarning = false;
	var s_haveUnloadCleanStorage = false;

	/*
	--- travelEditor function -----------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var travelEditor = function ( ) {

		var m_Translator = require ( '../UI/Translator' ) ( );
		var m_TravelEditorUI = require ( '../UI/TravelEditorUI' ) ( );
	
		/*
		--- m_UpdateRoadBook function ---------------------------------------------------------------------------------

		This function changes the HTML page content
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_UpdateRoadBook = function ( isNewTravel ) {

			if ( ! s_haveUnloadCleanStorage ) {
				window.addEventListener( 
					'unload', 
					function ( event ) {
						localStorage.removeItem ( require ( '../L.TravelNotes' ).UUID + "-TravelNotesHTML" );
					}
				);
				s_haveUnloadCleanStorage = true;
			}

			if ( ! isNewTravel && ! s_haveBeforeUnloadWarning && g_TravelNotesData.config.haveBeforeUnloadWarning ) {
				window.addEventListener( 
					'beforeunload', 
					function ( event ) {
						event.returnValue = 'x';
						return 'x'; 
					}
				);
				s_haveBeforeUnloadWarning = true;
			}
			
			if ( require ( '../util/Utilities' ) ( ).storageAvailable ( 'localStorage' ) ) {
				var htmlViewsFactory = require ( '../UI/HTMLViewsFactory' ) ( );
				htmlViewsFactory.classNamePrefix = 'TravelNotes-Roadbook-';
				localStorage.setItem ( g_TravelNotesData.UUID + "-TravelNotesHTML", htmlViewsFactory.travelHTML.outerHTML );
			}
		};

		/*
		--- m_AddRoute function ---------------------------------------------------------------------------------------

		This function add a new route
		
		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_AddRoute = function ( ) {
			g_TravelNotesData.travel.routes.add ( require ( '../Data/Route' ) ( ) );
			m_TravelEditorUI.setRoutesList ( );
			require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
			m_UpdateRoadBook ( );
		};
		
		/*
		--- m_RemoveRoute function ------------------------------------------------------------------------------------

		This function remove a route

		parameters :
		- routeObjId : the TravelNotes route objId to remove
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_RemoveRoute = function ( routeObjId ) {
			if ( routeObjId === g_TravelNotesData.routeEdition.routeInitialObjId && g_TravelNotesData.routeEdition.routeChanged ) {
				// cannot remove the route currently edited
				require ( './ErrorEditor' ) ( ).showError ( m_Translator.getText ( 'TravelEditor - Cannot remove an edited route' ) );
				return;
			}

			require ( './MapEditor' ) ( ).removeRoute ( require ( '../Data/DataSearchEngine' ) ( ).getRoute ( routeObjId ), true, true );
			g_TravelNotesData.travel.routes.remove ( routeObjId );
			m_TravelEditorUI.setRoutesList ( );
			if ( routeObjId === g_TravelNotesData.routeEdition.routeInitialObjId  ) {
				require ( './RouteEditor' ) ( ).cancelEdition ( );
			}
			require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
			m_UpdateRoadBook ( );
		};
		
		/*
		--- m_EditRoute function --------------------------------------------------------------------------------------

		This function start the edition of a route
		
		parameters:
		- routeObjId : the TravelNotes route objId to edit

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_EditRoute = function ( routeObjId ) { 
			if ( g_TravelNotesData.routeEdition.routeChanged ) {
				// not possible to edit - the current edited route is not saved or cancelled
				require ( '../core/ErrorEditor' ) ( ).showError ( m_Translator.getText ( "RouteEditor - Not possible to edit a route without a save or cancel" ) );
				return;
			}
			if ( -1 !== g_TravelNotesData.routeEdition.routeInitialObjId ) {
				// the current edited route is not changed. Cleaning the editors
				require ( '../core/RouteEditor' ) ( ).cancelEdition ( );
			}
			// We verify that the provider  for this route is available
			var initialRoute = require ( '../data/DataSearchEngine' ) ( ).getRoute ( routeObjId );
			var providerName = initialRoute.itinerary.provider;
			if ( providerName && ( '' !== providerName ) && ( ! g_TravelNotesData.providers.get ( providerName.toLowerCase ( ) ) ) )
			{
				require ( '../core/ErrorEditor' ) ( ).showError ( m_Translator.getText ( "RouteEditor - Not possible to edit a route created with this provider", {provider : providerName } ) );
				return;
			}
			// Provider and transit mode are changed in the itinerary editor
			require ( '../UI/ProvidersToolbarUI') ( ).provider = providerName;
			var transitMode = initialRoute.itinerary.transitMode;
			if ( transitMode && '' !== transitMode ) {
				require ( '../UI/ProvidersToolbarUI') ( ).transitMode = transitMode;
			}
			// The edited route is pushed in the editors
			g_TravelNotesData.editedRoute = require ( '../data/Route' ) ( );
			// Route is cloned, so we can have a cancel button in the editor
			g_TravelNotesData.editedRoute.object = initialRoute.object;
			g_TravelNotesData.routeEdition.routeInitialObjId = initialRoute.objId;
			g_TravelNotesData.editedRoute.hidden = false;
			initialRoute.hidden = false;
			var mapEditor = require ( '../core/MapEditor' ) ( );
			mapEditor.removeRoute ( initialRoute, true, false );
			mapEditor.addRoute ( g_TravelNotesData.editedRoute, true, true );
			require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
			var routeEditorUI = require ( '../UI/RouteEditorUI' ) ( );
			routeEditorUI .expand ( );
			routeEditorUI.setWayPointsList ( );
			require ( '../UI/DataPanesUI' ) ( ).setItinerary ( );
		};
		
		/*
		--- m_RenameRoute function ------------------------------------------------------------------------------------

		This function rename a route
		parameters :
		- routeObjId : the TravelNotes route objId to remove
		- routeName: the new name
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_RenameRoute = function ( routeObjId, routeName ) {
			require ( '../Data/DataSearchEngine' ) ( ).getRoute ( routeObjId ).name = routeName;
			m_TravelEditorUI.setRoutesList ( );
			if ( routeObjId === g_TravelNotesData.routeEdition.routeInitialObjId ) {
				g_TravelNotesData.editedRoute.name = routeName;
			}
			m_UpdateRoadBook ( );
		};
		
		/*
		--- m_SwapRoute function --------------------------------------------------------------------------------------

		This function changes the position of a route
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SwapRoute = function ( routeObjId, swapUp ) {
			g_TravelNotesData.travel.routes.swap ( routeObjId, swapUp );
			m_TravelEditorUI.setRoutesList ( );
			require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
			m_UpdateRoadBook ( );
		};
		
		/*
		--- m_RouteDropped function -----------------------------------------------------------------------------------

		This function changes the position of a route after a drag and drop
		
		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_RouteDropped = function ( draggedRouteObjId, targetRouteObjId, draggedBefore ) {
			g_TravelNotesData.travel.routes.moveTo ( draggedRouteObjId, targetRouteObjId, draggedBefore );
			m_TravelEditorUI.setRoutesList ( );
			require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
			m_UpdateRoadBook ( );
		};


		/*
		--- m_SaveTravel function -------------------------------------------------------------------------------------

		This function save a travel to a local file
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SaveTravel = function ( ) {
			if ( g_TravelNotesData.routeEdition.routeChanged ) {
				require ( './ErrorEditor' ) ( ).showError ( m_Translator.getText ( "TravelEditor - Not possible to save a travel without a save or cancel" ) );
			}
			else {
				var routesIterator = g_TravelNotesData.travel.routes.iterator;
				while ( ! routesIterator.done ) {
					routesIterator.value.hidden = false;
				}
					
				// compressing the itineraryPoints
				var compressedTravel = g_TravelNotesData.travel.object;
				compressedTravel.routes.forEach (
					function ( route ) {
						var objType = {};
						if ( 0 !== route.itinerary.itineraryPoints.length ) {
							objType = route.itinerary.itineraryPoints [ 0 ].objType;
						}
						var compressedItineraryPoints = { latLngs : [] , distances : [], objIds : [],objType : objType  };
						route.itinerary.itineraryPoints.forEach ( 
							function ( itineraryPoint ) {
								compressedItineraryPoints.latLngs.push ( [ itineraryPoint.lat, itineraryPoint.lng ] );
								compressedItineraryPoints.distances.push ( itineraryPoint.distance );
								compressedItineraryPoints.objIds.push ( itineraryPoint.objId );
							}
						);
						compressedItineraryPoints.latLngs = require ( '@mapbox/polyline' ).encode ( compressedItineraryPoints.latLngs, 6 );
						route.itinerary.itineraryPoints = compressedItineraryPoints;
					}
				);
				// save file
				require ( '../util/Utilities' ) ( ).saveFile ( compressedTravel.name + '.trv', JSON.stringify ( compressedTravel ) );
			}
		};
		
		/*
		--- m_ConfirmClose function -----------------------------------------------------------------------------------

		This function ask a confirmation to the user
		
		---------------------------------------------------------------------------------------------------------------
		*/
		var m_ConfirmClose = function ( ) {
			if ( s_haveBeforeUnloadWarning ) {
				return window.confirm ( m_Translator.getText ( "TravelEditor - This page ask to close; data are perhaps not saved." ) );
			}
			return true;
		};
		
		/*
		--- m_Clear function ------------------------------------------------------------------------------------------

		This function remove completely the current travel
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Clear = function ( ) {
			if ( ! m_ConfirmClose ( ) )
			{
				return;
			}
			require ( '../core/MapEditor' ) ( ).removeAllObjects ( );
			g_TravelNotesData.editedRoute = require ( '../Data/Route' ) ( );
			g_TravelNotesData.routeEdition.routeChanged = false;
			g_TravelNotesData.routeEdition.routeInitialObjId = -1;
			g_TravelNotesData.travel = require ( '../Data/Travel' ) ( );
			g_TravelNotesData.travel.routes.add ( require ( '../Data/Route' ) ( ) );
			require ( '../UI/TravelEditorUI' ) ( ). setRoutesList ( );
			require ( '../UI/RouteEditorUI' ) ( ).setWayPointsList (  );
			require ( '../UI/DataPanesUI' ) ( ).setItinerary ( );
			m_UpdateRoadBook ( true );
		};

		/*
		--- travelEditor object ---------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{

				updateRoadBook : function ( isNewTravel ) { m_UpdateRoadBook ( isNewTravel ); },

				addRoute : function ( ) { m_AddRoute ( ); },

				removeRoute : function ( routeObjId ) { m_RemoveRoute ( routeObjId ); },

				editRoute : function ( routeObjId ) { m_EditRoute ( routeObjId ); },
				
				renameRoute : function ( routeObjId, routeName ) { m_RenameRoute ( routeObjId, routeName ); },

				swapRoute : function ( routeObjId, swapUp ) { m_SwapRoute  ( routeObjId, swapUp ); },

				routeDropped : function ( draggedRouteObjId, targetRouteObjId, draggedBefore ) { m_RouteDropped ( draggedRouteObjId, targetRouteObjId, draggedBefore ); },
				
				saveTravel : function ( ) { m_SaveTravel ( ); },

				confirmClose : function ( ) { return m_ConfirmClose ( ); },

				clear : function ( ) { m_Clear ( ); },

			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = travelEditor;
	}

}());

/*
--- End of TravelEditor.js file ---------------------------------------------------------------------------------------
*/