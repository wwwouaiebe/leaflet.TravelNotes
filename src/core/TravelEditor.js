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

( function ( ){
	
	'use strict';
	
	var _Config = require ( '../util/Config' ) ( );
	var _Translator = require ( '../UI/Translator' ) ( );
	var _DataManager = require ( '../Data/DataManager' ) ( );

	var getTravelEditor = function ( ) {

		var _TravelEditorUI = require ( '../UI/TravelEditorUI' ) ( );
		var _Translator = require ( '../UI/Translator' ) ( );

		return {
			
			addRoute : function ( ) {
				_DataManager.travel.routes.add ( require ( '../Data/Route' ) ( ) );
				_TravelEditorUI.setRoutesList ( );
			},

			editRoute : function ( routeObjId ) {
				require ( './RouteEditor' ) ( ).editRoute ( routeObjId );
			},

			removeRoute : function ( routeObjId ) {
				if ( routeObjId === _DataManager.editedRoute.routeInitialObjId && _DataManager.editedRoute.routeChanged ) {
					require ( './ErrorEditor' ) ( ).showError ( _Translator.getText ( 'TravelEditor - cannot remove an edited route' ) );
				}
				else {
					require ( './MapEditor' ) ( ).removeObject ( routeObjId );
					_DataManager.travel.routes.remove ( routeObjId );
					_TravelEditorUI.setRoutesList ( );
					if ( routeObjId === _DataManager.editedRoute.routeInitialObjId  ) {
						require ( './RouteEditor') ( ).clear ( );
					}
				}
			},

			renameRoute : function ( routeObjId, routeName ) {
				_DataManager.travel.routes.getAt ( routeObjId ).name = routeName;
				_TravelEditorUI.setRoutesList ( );
				if ( routeObjId === _DataManager.editedRoute.routeInitialObjId ) {
					_DataManager.editedRoute.name = routeName;
				}
			},

			swapRoute : function ( routeObjId, swapUp ) {
				_DataManager.travel.routes.swap ( routeObjId, swapUp );
				_TravelEditorUI.setRoutesList ( );
			},
			
			saveTravel : function ( ) {
				if ( _DataManager.editedRoute.routeChanged ) {
					require ( './ErrorEditor' ) ( ).showError ( _Translator.getText ( "TravelEditor - Not possible to save a travel without a save or cancel" ) );
				}
				else {
					require ( '../util/Utilities' ) ( ).saveFile ( _DataManager.travel.name, JSON.stringify ( _DataManager.travel.object ) );
				}
			},
			
			openTravel : function ( event ) {
				var fileReader = new FileReader( );
				fileReader.onload = function ( event ) {
					_DataManager.travel.object = JSON.parse ( fileReader.result ) ;
					_DataManager.travel.name = fileName;
					require ( '../core/RouteEditor' ) ( ).clear ( );
					require ( '../UI/TravelEditorUI' ) ( ). setRoutesList ( );
					require ( '../core/MapEditor' ) ( ).removeAllObjects ( );
					var routesIterator = _DataManager.travel.routes.iterator;
					while ( ! routesIterator.done ) {
						require ( '../core/MapEditor' ) ( ).addRoute ( routesIterator.value );
					}
					var notesIterator = _DataManager.travel.notes.iterator;
					while ( ! notesIterator.done ) {
						require ( '../core/MapEditor' ) ( ).addTravelNote ( notesIterator.value );
					}
				};
				var fileName = event.target.files [ 0 ].name;
				fileReader.readAsText ( event.target.files [ 0 ] );
			},
			
			clear : function ( ) {
				_DataManager.editedRoute = require ( '../Data/Route') ( );
				_DataManager.editedRoute.routeChanged = false;
				_DataManager.editedRoute.routeInitialObjId = -1;
				_DataManager.travel = require ( '../Data/Travel' ) ( );
				require ( '../core/RouteEditor' ) ( ).clear ( );
				require ( '../UI/TravelEditorUI' ) ( ). setRoutesList ( );
				require ( '../core/MapEditor' ) ( ).removeAllObjects ( );
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getTravelEditor;
	}

}());
