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
Doc reviewed 20170928
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var _Translator = require ( '../UI/Translator' ) ( );
	var _TravelNotesData = require ( '../L.TravelNotes' );
	var _DataSearchEngine  = require ( '../Data/DataSearchEngine' ) ( );
	var _MapEditor = require ( '../core/MapEditor' ) ( );
	var _TravelEditorUI = require ( '../UI/TravelEditorUI' ) ( );

	var _haveBeforeUnloadWarning = false;
	var _haveUnloadCleanStorage = false;
	
	var TravelEditor = function ( ) {
		
		/*
		--- _UpdateRoadBook function --------------------------------------------------------------------------------

		This function changes the HTML page content
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _UpdateRoadBook = function ( isNewTravel ) {

			if ( ! _haveUnloadCleanStorage ) {
				window.addEventListener( 
					'unload', 
					function ( event ) {
						localStorage.removeItem ( require ( '../L.TravelNotes' ).UUID + "-TravelNotesHTML" );
					}
				);
				_haveUnloadCleanStorage = true;
			}

			if ( ! isNewTravel && ! _haveBeforeUnloadWarning && _TravelNotesData.config.haveBeforeUnloadWarning ) {
				window.addEventListener( 
					'beforeunload', 
					function ( event ) {
						event.returnValue = 'x';
						return 'x'; 
					}
				);
				_haveBeforeUnloadWarning = true;
			}
			
			if ( require ( '../util/Utilities' ) ( ).storageAvailable ( 'localStorage' ) ) {
				var htmlViewsFactory = require ( '../UI/HTMLViewsFactory' ) ( );
				htmlViewsFactory.classNamePrefix = 'TravelNotes-Roadbook-';
				localStorage.setItem ( _TravelNotesData.UUID + "-TravelNotesHTML", htmlViewsFactory.travelHTML.outerHTML );
			}
		};

		/*
		--- TravelEditor object ---------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return {

			/*
			--- updateRoadBook method -------------------------------------------------------------------------------

			This method changes the HTML page content
			
			-----------------------------------------------------------------------------------------------------------
			*/

			updateRoadBook : function ( isNewTravel ) {
				_UpdateRoadBook ( isNewTravel );
			},

			/*
			--- addRoute method ---------------------------------------------------------------------------------------

			This method add a new route
			
			-----------------------------------------------------------------------------------------------------------
			*/

			addRoute : function ( ) {
				_TravelNotesData.travel.routes.add ( require ( '../Data/Route' ) ( ) );
				_TravelEditorUI.setRoutesList ( );
				require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
				this.updateRoadBook ( );
			},

			/*
			--- editRoute method --------------------------------------------------------------------------------------

			This method edit a route
			
			parameters :
			- routeObjId : the TravelNotes route objId to edit
			
			-----------------------------------------------------------------------------------------------------------
			*/

			editRoute : function ( routeObjId ) {
				require ( '../core/RouteEditor' ) ( ).editRoute ( routeObjId );
			},

			/*
			--- removeRoute method ------------------------------------------------------------------------------------

			This method remove a route

			parameters :
			- routeObjId : the TravelNotes route objId to remove
			
			-----------------------------------------------------------------------------------------------------------
			*/

			removeRoute : function ( routeObjId ) {
				if ( routeObjId === _TravelNotesData.routeEdition.routeInitialObjId && _TravelNotesData.routeEdition.routeChanged ) {
					// cannot remove the route currently edited
					require ( './ErrorEditor' ) ( ).showError ( _Translator.getText ( 'TravelEditor - Cannot remove an edited route' ) );
					return;
				}

				require ( './MapEditor' ) ( ).removeRoute ( _DataSearchEngine.getRoute ( routeObjId ), true, true );
				_TravelNotesData.travel.routes.remove ( routeObjId );
				_TravelEditorUI.setRoutesList ( );
				if ( routeObjId === _TravelNotesData.routeEdition.routeInitialObjId  ) {
					require ( './RouteEditor' ) ( ).clear ( );
				}
				require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
				this.updateRoadBook ( );
			},

			/*
			--- renameRoute method ------------------------------------------------------------------------------------

			This method rename a route
			parameters :
			- routeObjId : the TravelNotes route objId to remove
			- routeName: the new name
			
			-----------------------------------------------------------------------------------------------------------
			*/

			renameRoute : function ( routeObjId, routeName ) {
				_DataSearchEngine.getRoute ( routeObjId ).name = routeName;
				_TravelEditorUI.setRoutesList ( );
				if ( routeObjId === _TravelNotesData.routeEdition.routeInitialObjId ) {
					_TravelNotesData.editedRoute.name = routeName;
				}
				this.updateRoadBook ( );
			},

			/*
			--- swapRoute method --------------------------------------------------------------------------------------

			This method changes the position of a route
			
			-----------------------------------------------------------------------------------------------------------
			*/

			swapRoute : function ( routeObjId, swapUp ) {
				_TravelNotesData.travel.routes.swap ( routeObjId, swapUp );
				_TravelEditorUI.setRoutesList ( );
				require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
				this.updateRoadBook ( );
			},

			/*
			--- routeDropped method --------------------------------------------------------------------------------------

			This method changes the position of a route after a drag and drop
			
			-----------------------------------------------------------------------------------------------------------
			*/
			
			routeDropped : function ( draggedRouteObjId, targetRouteObjId, draggedBefore ) {
				_TravelNotesData.travel.routes.moveTo ( draggedRouteObjId, targetRouteObjId, draggedBefore );
				_TravelEditorUI.setRoutesList ( );
				require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
				this.updateRoadBook ( );
			},
			
			/*
			--- saveTravel method -------------------------------------------------------------------------------------

			This method save the travel to a local file
			
			-----------------------------------------------------------------------------------------------------------
			*/

			saveTravel : function ( ) {
				if ( _TravelNotesData.routeEdition.routeChanged ) {
					require ( './ErrorEditor' ) ( ).showError ( _Translator.getText ( "TravelEditor - Not possible to save a travel without a save or cancel" ) );
				}
				else {
					var routesIterator = _TravelNotesData.travel.routes.iterator;
					while ( ! routesIterator.done ) {
						routesIterator.value.hidden = false;
					}
						
					// compressing the itineraryPoints
					var compressedTravel = _TravelNotesData.travel.object;
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
			},

			/*
			--- confirmClose method ------------------------------------------------------------------------------------------

			This method ask a confirmation to the user
			
			-----------------------------------------------------------------------------------------------------------
			*/
			confirmClose : function ( ) {
				if ( _haveBeforeUnloadWarning ) {
					return window.confirm ( _Translator.getText ( "TravelEditor - This page ask to close; data are perhaps not saved." ) );
				}
				return true;
			},



			/*
			--- clear method ------------------------------------------------------------------------------------------

			This method remove completely the current travel
			
			-----------------------------------------------------------------------------------------------------------
			*/

			clear : function ( ) {
				if ( ! this.confirmClose ( ) )
				{
					return;
				}
				_TravelNotesData.map.fire ( 'travelnotesfileloaded', { readOnly : false, name : '' } );
				_MapEditor.removeAllObjects ( );
				_TravelNotesData.editedRoute = require ( '../Data/Route' ) ( );
				_TravelNotesData.routeEdition.routeChanged = false;
				_TravelNotesData.routeEdition.routeInitialObjId = -1;
				_TravelNotesData.travel = require ( '../Data/Travel' ) ( );
				_TravelNotesData.travel.routes.add ( require ( '../Data/Route' ) ( ) );
				require ( '../UI/TravelEditorUI' ) ( ). setRoutesList ( );
				require ( '../UI/RouteEditorUI' ) ( ).setWayPointsList (  );
				require ( '../core/ItineraryEditor' ) ( ).setItinerary ( );
				this.updateRoadBook ( true );
				if ( _TravelNotesData.config.travelEditor.startupRouteEdition ) {
					this.editRoute ( _TravelNotesData.travel.routes.first.objId );
				}
			},

			/*
			--- getMapContextMenu method ------------------------------------------------------------------------------

			This method gives the travel part of the map context menu
			
			parameters:
			- latLng : the coordinates where the map was clicked

			-----------------------------------------------------------------------------------------------------------
			*/

			getMapContextMenu :function ( latLng ) {
				var mapEditor = require ( '../core/MapEditor' ) ( );
				var routeEditor = require ( '../core/RouteEditor' ) ( );
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : routeEditor, 
						name : _Translator.getText ( "TravelEditor - Show all routes" ), 
						action : routeEditor.showRoutes
					} 
				);
				contextMenu.push ( 
					{ 
						context : mapEditor, 
						name : _Translator.getText ( "TravelEditor - Zoom to travel" ), 
						action : mapEditor.zoomToTravel
					} 
				);
				contextMenu.push ( 
					{ 
						context : null,
						name : _Translator.getText ( "TravelEditor - About Travel & Notes" ), 
						action : require ( '../UI/AboutDialog' )
					} 
				);
				
				return contextMenu;
			}
		};
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = TravelEditor;
	}

}());

/*
--- End of TravelEditor.js file ---------------------------------------------------------------------------------------
*/