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
Doc reviewed 20170928
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var _Translator = require ( '../UI/Translator' ) ( );
	var _DataManager = require ( '../Data/DataManager' ) ( );
	var _MapEditor = require ( '../core/MapEditor' ) ( );
	var _TravelEditorUI = require ( '../UI/TravelEditorUI' ) ( );

	var _haveBeforeUnloadListener = false;
	var onBeforeUnload = function ( event ) {
		event.returnValue = 'x';
		return 'x';
	};
	
	var TravelEditor = function ( ) {
		
		/*
		--- _ChangeTravelHTML function --------------------------------------------------------------------------------

		This function changes the HTML page content
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _ChangeTravelHTML = function ( isNewTravel ) {
			if ( ! isNewTravel ) {
				if ( ! _haveBeforeUnloadListener && _DataManager.config.haveBeforeUnloadWarning ) {
					window.addEventListener( 
						'beforeunload', 
						function ( event ) {
							event.returnValue = 'x';
							return 'x'; 
						}
					);
					_haveBeforeUnloadListener = true;
				}
			}
			if ( require ( '../util/Utilities' ) ( ).storageAvailable ( 'localStorage' ) ) {
				var htmlViewsFactory = require ( '../UI/HTMLViewsFactory' ) ( );
				htmlViewsFactory.classNamePrefix = 'TravelNotes-Roadbook-';
				localStorage.setItem ( _DataManager.UUID + "-TravelNotesHTML", htmlViewsFactory.travelHTML.outerHTML );
			}
		};

		/*
		--- _ConvertAndDecompressFile function --------------------------------------------------------------------------------

		This function convert old files (.map) and decompress the travel
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _ConvertAndDecompressFile  = function ( compressedTravel, fileName  ) {
			// decompressing the itineraryPoints
			compressedTravel.routes.forEach ( 
				function ( route ) {
					route.itinerary.itineraryPoints.latLngs = require ( '@mapbox/polyline' ).decode ( route.itinerary.itineraryPoints.latLngs, 6 );
					var decompressedItineraryPoints = [];
					var latLngsCounter = 0;
					route.itinerary.itineraryPoints.latLngs.forEach (
						function ( latLng ) {
							var itineraryPoint = {};
							itineraryPoint.lat = latLng [ 0 ];
							itineraryPoint.lng = latLng [ 1 ];
							itineraryPoint.distance = route.itinerary.itineraryPoints.distances [ latLngsCounter ];
							itineraryPoint.objId = route.itinerary.itineraryPoints.objIds [ latLngsCounter ];
							itineraryPoint.objType = route.itinerary.itineraryPoints.objType;
							decompressedItineraryPoints.push ( itineraryPoint );
							latLngsCounter ++;
						}
					);
					route.itinerary.itineraryPoints = decompressedItineraryPoints;
				}
			);
			return compressedTravel;
		};
		
		/*
		--- _ImportFile function --------------------------------------------------------------------------------------

		This function import a file content 

		---------------------------------------------------------------------------------------------------------------
		*/

		var _ImportFile = function ( compressedTravel, fileName ) {
			// converting and decompressing the file
			var importData = _ConvertAndDecompressFile ( compressedTravel, fileName );
			if ( ! importData ) {
				return;
			}
			// ... and transform the data in the correct format
			var importTravel = require ( '../Data/Travel') ( );
			importTravel.object = importData;
			
			// routes are added with their notes
			var routesIterator = importTravel.routes.iterator;
			while ( ! routesIterator.done ) {
				_DataManager.travel.routes.add ( routesIterator.value );
				_MapEditor.addRoute ( routesIterator.value, true, false, false );
			}
			// travel notes are added
			var notesIterator = importTravel.notes.iterator;
			while ( ! notesIterator.done ) {
				_DataManager.travel.notes.add ( notesIterator.value );
				_MapEditor.addNote ( notesIterator.value, false );
			}
			
			// zoom on the travel
			_MapEditor.zoomToTravel ( );
			
			// updating UI and html page
			require ( '../UI/TravelEditorUI' ) ( ). setRoutesList ( );
			_ChangeTravelHTML ( );
		
		};
		
		/*
		--- _LoadFile function ----------------------------------------------------------------------------------------

		This function load a file content 

		---------------------------------------------------------------------------------------------------------------
		*/

		var _LoadFile = function ( compressedTravel, fileName, readOnly ) {

			// converting and decompressing the file
			var travel = _ConvertAndDecompressFile ( compressedTravel, fileName );
			if ( ! travel ) {
				return;
			}
			// ... and transform the data in the correct format
			_DataManager.travel.object = travel;

			// ... travel name = file name
			if ( '' !== fileName ) {
				_DataManager.travel.name = fileName.substr ( 0, fileName.lastIndexOf ( '.' ) ) ;
			}

			_DataManager.travel.readOnly = readOnly;
			
			// the map is cleaned
			_MapEditor.removeAllObjects ( );
			
			// routes are added with their notes
			var routesIterator = _DataManager.travel.routes.iterator;
			while ( ! routesIterator.done ) {
				_MapEditor.addRoute ( routesIterator.value, true, false, readOnly );
			}
			
			// travel notes are added
			var notesIterator = _DataManager.travel.notes.iterator;
			while ( ! notesIterator.done ) {
				_MapEditor.addNote ( notesIterator.value, readOnly );
			}
			
			// zoom on the travel
			_MapEditor.zoomToTravel ( );
			
			// Editors and HTML pages are filled
			if ( ! readOnly ) {
			// Editors and HTML pages are filled
				require ( '../UI/TravelEditorUI' ) ( ). setRoutesList ( );
				_ChangeTravelHTML ( );
			}
			else {
				// control is hidden
				document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.add ( 'TravelNotes-Control-MainDiv-Hidden' );
				document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.remove ( 'TravelNotes-Control-MainDiv-Maximize' );
				document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.remove ( 'TravelNotes-Control-MainDiv-Minimize' );
			}
			_DataManager.map.fire ( 'travelnotesfileloaded', { readOnly : readOnly, name : _DataManager.travel.name } );
		};
		
		/*
		--- TravelEditor object ---------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return {

			/*
			--- changeTravelHTML method -------------------------------------------------------------------------------

			This method changes the HTML page content
			
			-----------------------------------------------------------------------------------------------------------
			*/

			changeTravelHTML : function ( isNewTravel ) {
				_ChangeTravelHTML ( isNewTravel );
			},

			/*
			--- addRoute method ---------------------------------------------------------------------------------------

			This method add a new route
			
			-----------------------------------------------------------------------------------------------------------
			*/

			addRoute : function ( ) {
				_DataManager.travel.routes.add ( require ( '../Data/Route' ) ( ) );
				_TravelEditorUI.setRoutesList ( );
				require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
				this.changeTravelHTML ( );
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
				if ( routeObjId === _DataManager.editedRoute.routeInitialObjId && _DataManager.editedRoute.routeChanged ) {
					// cannot remove the route currently edited
					require ( './ErrorEditor' ) ( ).showError ( _Translator.getText ( 'TravelEditor - Cannot remove an edited route' ) );
					return;
				}

				require ( './MapEditor' ) ( ).removeRoute ( _DataManager.getRoute ( routeObjId ), true, true );
				_DataManager.travel.routes.remove ( routeObjId );
				_TravelEditorUI.setRoutesList ( );
				if ( routeObjId === _DataManager.editedRoute.routeInitialObjId  ) {
					require ( './RouteEditor') ( ).clear ( );
				}
				require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
				this.changeTravelHTML ( );
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
				_DataManager.getRoute ( routeObjId ).name = routeName;
				_TravelEditorUI.setRoutesList ( );
				if ( routeObjId === _DataManager.editedRoute.routeInitialObjId ) {
					_DataManager.editedRoute.name = routeName;
				}
				this.changeTravelHTML ( );
			},

			/*
			--- swapRoute method --------------------------------------------------------------------------------------

			This method changes the position of a route
			
			-----------------------------------------------------------------------------------------------------------
			*/

			swapRoute : function ( routeObjId, swapUp ) {
				_DataManager.travel.routes.swap ( routeObjId, swapUp );
				_TravelEditorUI.setRoutesList ( );
				require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
				this.changeTravelHTML ( );
			},

			/*
			--- routeDropped method --------------------------------------------------------------------------------------

			This method changes the position of a route after a drag and drop
			
			-----------------------------------------------------------------------------------------------------------
			*/
			
			routeDropped : function ( draggedRouteObjId, targetRouteObjId, draggedBefore ) {
				_DataManager.travel.routes.moveTo ( draggedRouteObjId, targetRouteObjId, draggedBefore );
				_TravelEditorUI.setRoutesList ( );
				require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
				this.changeTravelHTML ( );
			},
			
			/*
			--- saveTravel method -------------------------------------------------------------------------------------

			This method save the travel to a local file
			
			-----------------------------------------------------------------------------------------------------------
			*/

			saveTravel : function ( ) {
				if ( _DataManager.editedRoute.routeChanged ) {
					require ( './ErrorEditor' ) ( ).showError ( _Translator.getText ( "TravelEditor - Not possible to save a travel without a save or cancel" ) );
				}
				else {
					var routesIterator = _DataManager.travel.routes.iterator;
					while ( ! routesIterator.done ) {
						routesIterator.value.hidden = false;
					}
						
					// compressing the itineraryPoints
					var compressedTravel = _DataManager.travel.object;
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
			--- openTravel method -------------------------------------------------------------------------------------

			This method open a travel from a local file
			
			-----------------------------------------------------------------------------------------------------------
			*/

			importTravel : function ( event ) {
				var fileReader = new FileReader( );
				fileReader.onload = function ( event ) {
					try {
						_ImportFile ( JSON.parse ( fileReader.result ), fileName );
					}
					catch ( e ) {
					}
				};
				var fileName = event.target.files [ 0 ].name;
				fileReader.readAsText ( event.target.files [ 0 ] );
			},
			/*
			--- openTravel method -------------------------------------------------------------------------------------

			This method open a travel from a local file
			
			-----------------------------------------------------------------------------------------------------------
			*/

			openTravel : function ( event ) {
				var fileReader = new FileReader( );
				fileReader.onload = function ( event ) {
					_MapEditor.removeAllObjects ( );
					_DataManager.editedRoute = require ( '../Data/Route') ( );
					_DataManager.editedRoute.routeChanged = false;
					_DataManager.editedRoute.routeInitialObjId = -1;
					require ( '../UI/RouteEditorUI') ( ).setWayPointsList (  );
					require ( '../core/ItineraryEditor' ) ( ).setItinerary ( );
					try {
						_LoadFile ( JSON.parse ( fileReader.result ), fileName, false );
					}
					catch ( e ) {
					}
				};
				var fileName = event.target.files [ 0 ].name;
				fileReader.readAsText ( event.target.files [ 0 ] );
			},

			/*
			--- openServerTravel method -------------------------------------------------------------------------------

			This method open a travel from a distant file
			
			-----------------------------------------------------------------------------------------------------------
			*/

			openServerTravel : function ( compressedTravel ) {
				_LoadFile ( compressedTravel, '', true );
			},

			/*
			--- confirmClose method ------------------------------------------------------------------------------------------

			This method ask a confirmation to the user
			
			-----------------------------------------------------------------------------------------------------------
			*/
			confirmClose : function ( ) {
				if ( _haveBeforeUnloadListener ) {
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
				_DataManager.map.fire ( 'travelnotesfileloaded', { readOnly : false, name : '' } );
				_MapEditor.removeAllObjects ( );
				_DataManager.editedRoute = require ( '../Data/Route') ( );
				_DataManager.editedRoute.routeChanged = false;
				_DataManager.editedRoute.routeInitialObjId = -1;
				_DataManager.travel = require ( '../Data/Travel' ) ( );
				require ( '../UI/TravelEditorUI' ) ( ). setRoutesList ( );
				require ( '../UI/RouteEditorUI') ( ).setWayPointsList (  );
				require ( '../core/ItineraryEditor' ) ( ).setItinerary ( );
				this.changeTravelHTML ( true );
				if ( _DataManager.config.travelEditor.startupRouteEdition ) {
					this.editRoute ( _DataManager.travel.routes.first.objId );
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