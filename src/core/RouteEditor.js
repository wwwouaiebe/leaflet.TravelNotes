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

	var _DataManager = require ( '../Data/DataManager' ) ( );
	var _Config = require ( '../util/Config' ) ( );
	var _Translator = require ( '../UI/Translator' ) ( );
	
	var _NoteEditor = require ( '../core/NoteEditor' ) ( );
	var _MapEditor = require ( '../core/MapEditor' ) ( );
	
	var getRouteEditor = function ( ) {

		var _RouteEditorUI = require ( '../UI/RouteEditorUI' ) ( );
		
		return {
			startRouting : function ( ) {
			if ( ! _Config.routing.auto ) {
				return;
			}
			
			require ( './MapEditor' ) ( ).removeObject ( _DataManager.editedRoute.objId );
			require ( './Router' ) ( ).startRouting ( _DataManager.editedRoute );
			},
			
			endRouting : function ( ) {
				require ( './ItineraryEditor' ) ( ).setItinerary ( );
				require ( './MapEditor' ) ( ).addRoute ( _DataManager.editedRoute );
				_RouteEditorUI.setWayPointsList ( );
				var wayPointIterator = _DataManager.editedRoute.wayPoints.iterator;
				while ( ! wayPointIterator.done ) {
					require ( './MapEditor' ) ( ).moveWayPoint ( wayPointIterator.value );
				}
			},
			
			saveEdition : function ( ) {
				var newRouteObjId = _DataManager.travel.routes.replace ( _DataManager.editedRoute.routeInitialObjId, _DataManager.editedRoute );
				_DataManager.editedRoute.routeChanged = false;
				// It's needed to rewrite the route list due to objId's changes
				require ( '../UI/TravelEditorUI') ( ).setRoutesList ( );
				this.clear ( );
			},
			
			cancelEdition : function ( ) {
				require ( './MapEditor' ) ( ).removeObject ( _DataManager.editedRoute.objId );
				require ( './MapEditor' ) ( ).addRoute ( _DataManager.travel.routes.getAt ( _DataManager.editedRoute.routeInitialObjId ) );
				_DataManager.editedRoute.routeChanged = false;
				this.clear ( );
			},
			
			editRoute : function ( routeObjId ) { 
				if ( _DataManager.editedRoute.routeChanged ) {
					require ( './ErrorEditor' ) ( ).showError ( _Translator.getText ( "RouteEditor-Not possible to edit a route without a save or cancel" ) );
					return;
				}
				_DataManager.editedRoute = require ( '../Data/Route' ) ( );
				var route = _DataManager.travel.routes.getAt ( routeObjId );
				_DataManager.editedRoute.routeInitialObjId = route.objId;
				// Route is cloned, so we can have a cancel button in the editor
				_DataManager.editedRoute.object = route.object;
				_RouteEditorUI .expand ( );
				_RouteEditorUI.setWayPointsList ( );
				require ( './ItineraryEditor' ) ( ).setItinerary ( );
				require ( './MapEditor' ) ( ).removeObject ( routeObjId );
				require ( './MapEditor' ) ( ).addRoute ( _DataManager.editedRoute );
			},
			
			removeRoute : function ( routeObjId ) { 
				require ( './TravelEditor' ) ( ).removeRoute ( routeObjId );
			},
			
			addWayPoint : function ( latLng ) {
				_DataManager.editedRoute.routeChanged = true;
				var newWayPoint = require ( '../Data/Waypoint.js' ) ( );
				if ( latLng ) {
					newWayPoint.latLng = latLng;
				}
				_DataManager.editedRoute.wayPoints.add ( newWayPoint );
				_MapEditor.addWayPoint ( _DataManager.editedRoute.wayPoints.last, _DataManager.editedRoute.wayPoints.length - 2 );
				_DataManager.editedRoute.wayPoints.swap ( newWayPoint.objId, true );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			reverseWayPoints : function ( ) {
				_DataManager.editedRoute.routeChanged = true;
				var wayPointsIterator = _DataManager.editedRoute.wayPoints.iterator;
				while ( ! wayPointsIterator.done ) {
					_MapEditor.removeObject ( wayPointsIterator.value.objId );
				}
				_DataManager.editedRoute.wayPoints.reverse ( );
				wayPointsIterator = _DataManager.editedRoute.wayPoints.iterator;
				var wayPointsCounter = 0;
				while ( ! wayPointsIterator.done ) {
					_MapEditor.addWayPoint ( wayPointsIterator.value, wayPointsIterator .first ? 'A' : ( wayPointsIterator.last ? 'B' : ( ++ wayPointsCounter ).toFixed ( 0 ) ) );
				}
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			removeAllWayPoints : function ( ) {
				_DataManager.editedRoute.routeChanged = true;
				var wayPointsIterator = _DataManager.editedRoute.wayPoints.iterator;
				while ( ! wayPointsIterator.done ) {
					_MapEditor.removeObject ( wayPointsIterator.value.objId );
				}
				_DataManager.editedRoute.wayPoints.removeAll ( true );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			removeWayPoint : function ( wayPointObjId ) {
				_DataManager.editedRoute.routeChanged = true;
				_MapEditor.removeObject ( wayPointObjId );
				_DataManager.editedRoute.wayPoints.remove ( wayPointObjId );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			renameWayPoint : function ( wayPointObjId, wayPointName ) {
				_DataManager.editedRoute.routeChanged = true;
				_DataManager.editedRoute.wayPoints.getAt ( wayPointObjId ).name = wayPointName;
				_RouteEditorUI.setWayPointsList ( );
			},
			
			swapWayPoints : function ( wayPointObjId, swapUp ) {
				_DataManager.editedRoute.routeChanged = true;
				_DataManager.editedRoute.wayPoints.swap ( wayPointObjId, swapUp );
				_RouteEditorUI.setWayPointsList (  );
				this.startRouting ( );
			},
			
			setStartPoint : function ( latLng ) {
				_DataManager.editedRoute.routeChanged = true;
				if ( 0 !== _DataManager.editedRoute.wayPoints.first.lat ) {
					_MapEditor.removeObject ( _DataManager.editedRoute.wayPoints.first.objId );
				}
				_DataManager.editedRoute.wayPoints.first.latLng = latLng;
				_MapEditor.addWayPoint ( _DataManager.editedRoute.wayPoints.first, 'A' );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			setEndPoint : function ( latLng ) {
				_DataManager.editedRoute.routeChanged = true;
				if ( 0 !== _DataManager.editedRoute.wayPoints.last.lat ) {
					_MapEditor.removeObject ( _DataManager.editedRoute.wayPoints.last.objId );
				}
				_DataManager.editedRoute.wayPoints.last.latLng = latLng;
				_MapEditor.addWayPoint ( _DataManager.editedRoute.wayPoints.last, 'B' );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			wayPointDragEnd : function ( wayPointObjId ) {
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			getMapContextMenu :function ( latLng ) {
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Select this point as start point" ), 
						action : ( -1 !== _DataManager.editedRoute.routeInitialObjId ) ? this.setStartPoint : null,
						param : latLng
					} 
				);
				contextMenu.push ( 
					{
						context : this, 
						name : _Translator.getText ( "RouteEditor - Select this point as way point" ), 
						action : ( -1 !== _DataManager.editedRoute.routeInitialObjId ) ? this.addWayPoint : null,
						param : latLng
					}
				);
				contextMenu.push (
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Select this point as end point" ), 
						action : ( -1 !== _DataManager.editedRoute.routeInitialObjId ) ? this.setEndPoint : null,
						param : latLng
					}
				);
				return contextMenu;
			},
			
			getRouteContextMenu : function ( routeObjId ) {
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Edit this route" ), 
						action : ( ( _DataManager.editedRoute.routeInitialObjId !== routeObjId ) && ( ! _DataManager.editedRoute.routeChanged ) ) ? this.editRoute : null,
						param: routeObjId
					} 
				);
				contextMenu.push ( 
					{
						context : this, 
						name : _Translator.getText ( "RouteEditor - Delete this route" ), 
						action : ( ( _DataManager.editedRoute.routeInitialObjId !== routeObjId ) && ( ! _DataManager.editedRoute.routeChanged ) ) ? this.removeRoute :null,
						param: routeObjId
					}
				);
				contextMenu.push ( 
					{
						context : _NoteEditor, 
						name : _Translator.getText ( "RouteEditor - Add a note on the route" ), 
						action : _NoteEditor.newRouteNote,
						param: routeObjId
					}
				);
				contextMenu.push (
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Save modifications on this route" ), 
						action : ( _DataManager.editedRoute.routeInitialObjId === routeObjId ) ? this.saveEdition : null,
					}
				);
				contextMenu.push (
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Cancel modifications on this route" ), 
						action : ( _DataManager.editedRoute.routeInitialObjId === routeObjId ) ? this.cancelEdition : null
					}
				);
				return contextMenu;
			},
			
			clear : function ( ) {
					_DataManager.editedRoute = require ( '../data/Route' ) ( );
					_DataManager.editedRoute.routeChanged = false;
					_DataManager.editedRoute.routeInitialObjId = -1;
					require ( '../UI/RouteEditorUI' ) ( ).setWayPointsList (  );
					require ( '../UI/ItineraryEditorUI' ) ( ).setItinerary ( );
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRouteEditor;
	}

}());
