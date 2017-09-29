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
	
	var TravelEditor = function ( ) {
		
		/*
		--- _ChangeTravelHTML function --------------------------------------------------------------------------------

		This function changes the HTML page content
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _ChangeTravelHTML = function ( ) {
			if ( require ( '../util/Utilities' ) ( ).storageAvailable ( 'localStorage' ) ) {
				var htmlViewsFactory = require ( '../UI/HTMLViewsFactory' ) ( );
				htmlViewsFactory.classNamePrefix = 'TravelNotes-Roadbook-';
				localStorage.setItem ( _DataManager.UUID + "-TravelNotesHTML", htmlViewsFactory.travelHTML.outerHTML );
			}
		};

		/*
		--- _LoadFile function ----------------------------------------------------------------------------------------

		This function load a file content 

		---------------------------------------------------------------------------------------------------------------
		*/

		var _LoadFile = function ( textFile, readOnly ) {
			
			try {
				_DataManager.travel.object = JSON.parse ( textFile ) ;
			}
			catch ( e ) {
				return;
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
			else
			{
				// control is hidden
				document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.add ( 'TravelNotes-Control-HiddenControl' );
			}
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

			changeTravelHTML : function ( ) {
				_ChangeTravelHTML ( );
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
					require ( './ErrorEditor' ) ( ).showError ( _Translator.getText ( 'TravelEditor - cannot remove an edited route' ) );
					return;
				}

				require ( './MapEditor' ) ( ).removeObject ( routeObjId );
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
			--- saveTravel method -------------------------------------------------------------------------------------

			This method save the travel to a local file
			
			-----------------------------------------------------------------------------------------------------------
			*/

			saveTravel : function ( ) {
				if ( _DataManager.editedRoute.routeChanged ) {
					require ( './ErrorEditor' ) ( ).showError ( _Translator.getText ( "TravelEditor - Not possible to save a travel without a save or cancel" ) );
				}
				else {
					require ( '../util/Utilities' ) ( ).saveFile ( _DataManager.travel.name, JSON.stringify ( _DataManager.travel.object ) );
				}
			},

			/*
			--- openTravel method -------------------------------------------------------------------------------------

			This method open a travel from a local file
			
			-----------------------------------------------------------------------------------------------------------
			*/

			openTravel : function ( event ) {
				var fileReader = new FileReader( );
				fileReader.onload = function ( event ) {
					_DataManager.travel.name = fileName;
					_LoadFile ( fileReader.result, false );
				};
				var fileName = event.target.files [ 0 ].name;
				fileReader.readAsText ( event.target.files [ 0 ] );
			},

			/*
			--- openServerTravel method -------------------------------------------------------------------------------

			This method open a travel from a distant file
			
			-----------------------------------------------------------------------------------------------------------
			*/

			openServerTravel : function ( ) {
				var urlSearch = decodeURI ( window.location.search );
				var serverUrl = null;
				if ( 'fil=' === urlSearch.substr ( 1, 4 ) ) {
					serverUrl = atob ( urlSearch.substr ( 5 ) );
					var xmlHttpRequest = new XMLHttpRequest ( );
					xmlHttpRequest.onreadystatechange = function ( event ) {
						if ( this.readyState === XMLHttpRequest.DONE ) {
							if ( this.status === 200 ) {
								_LoadFile ( this.responseText, true );
							} 
						}
					};
					xmlHttpRequest.open ( 'GET', serverUrl, true	) ;
					xmlHttpRequest.send ( null );
				}
			},

			/*
			--- clear method ------------------------------------------------------------------------------------------

			This method remove completely the current travel
			
			-----------------------------------------------------------------------------------------------------------
			*/

			clear : function ( ) {
				_MapEditor.removeAllObjects ( );
				_DataManager.editedRoute = require ( '../Data/Route') ( );
				_DataManager.editedRoute.routeChanged = false;
				_DataManager.editedRoute.routeInitialObjId = -1;
				_DataManager.travel = require ( '../Data/Travel' ) ( );
				require ( '../UI/TravelEditorUI' ) ( ). setRoutesList ( );
				require ( '../UI/RouteEditorUI') ( ).setWayPointsList (  );
				require ( '../core/ItineraryEditor' ) ( ).setItinerary ( );
				this.changeTravelHTML ( );
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
				var contextMenu = [];
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
						name : _Translator.getText ( "TravelEditor - About" ), 
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