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

	
	var getRouteEditor = function ( ) {

		var _Config = require ( '../util/Config' ) ( );
		
		var _Translator = require ( '../UI/Translator' ) ( );

		var _RouteEditorUI = require ( '../UI/RouteEditorUI' ) ( );
		
		return {
			
			startRouting : function ( ) {
			if ( ! _Config.routing.auto ) {
				return;
			}
			
			require ( './MapEditor' ) ( ).removeObject ( global.editedRoute.objId );
			require ( './Router' ) ( ).startRouting ( global.editedRoute );
			},
			
			endRouting : function ( ) {
				require ( './ItineraryEditor' ) ( ).setItinerary ( );
				require ( './MapEditor' ) ( ).addRoute ( global.editedRoute );
			},
			
			saveEdition : function ( ) {
				global.travelData.routes.replace ( global.editedRoute.routeInitialObjId, global.editedRoute );
				global.editedRoute.routeChanged = false;
				// It's needed to rewrite the route list due to objId's changes
				require ( '../UI/TravelEditorUI') ( ).setRoutesList ( );
				if ( _Config.routeEditor.clearAfterSave ) {
					this.clear ( );
				}
				else {
					this.editRoute ( global.editedRoute.objId );
				}
			},
			
			cancelEdition : function ( ) {
				global.editedRoute.routeChanged = false;
				if ( _Config.routeEditor.clearAfterCancel ) {
					this.clear ( );
				}
				else {
					this.editRoute ( global.editedRoute.routeInitialObjId );
				}
			},
			
			editRoute : function ( routeObjId ) { 
				if ( global.editedRoute.routeChanged ) {
					require ( './ErrorEditor' ) ( ).showError ( _Translator.getText ( "RouteEditor-Not possible to edit a route without a save or cancel" ) );
					return;
				}
				global.editedRoute = require ( '../Data/Route' ) ( );
				var route = global.travelData.routes.getAt ( routeObjId );
				global.editedRoute.routeInitialObjId = route.objId;
				// Route is cloned, so we can have a cancel button in the editor
				global.editedRoute.object = route.object;
				_RouteEditorUI .expand ( );
				_RouteEditorUI.setWayPointsList ( );
				require ( './ItineraryEditor' ) ( ).setItinerary ( );
			},
			
			addWayPoint : function ( latLng ) {
				global.editedRoute.routeChanged = true;
				var newWayPoint = require ( '../Data/Waypoint.js' ) ( );
				if ( latLng ) {
					newWayPoint.latLng = latLng;
				}
				global.editedRoute.wayPoints.add ( newWayPoint );
				global.editedRoute.wayPoints.swap ( newWayPoint.objId, true );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			reverseWayPoints : function ( ) {
				global.editedRoute.routeChanged = true;
				global.editedRoute.wayPoints.reverse ( );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			removeAllWayPoints : function ( ) {
				global.editedRoute.routeChanged = true;
				global.editedRoute.wayPoints.removeAll ( true );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			removeWayPoint : function ( wayPointObjId ) {
				global.editedRoute.routeChanged = true;
				global.editedRoute.wayPoints.remove ( wayPointObjId );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			renameWayPoint : function ( wayPointObjId, wayPointName ) {
				global.editedRoute.routeChanged = true;
				global.editedRoute.wayPoints.getAt ( wayPointObjId ).name = wayPointName;
				_RouteEditorUI.setWayPointsList ( );
			},
			
			swapWayPoints : function ( wayPointObjId, swapUp ) {
				global.editedRoute.routeChanged = true;
				global.editedRoute.wayPoints.swap ( wayPointObjId, swapUp );
				_RouteEditorUI.setWayPointsList (  );
				this.startRouting ( );
			},
			
			get mapContextMenu ( ) {
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, name : _Translator.getText ( "RouteEditor - Select this point as start point" ), 
						action : ( -1 !== global.editedRoute.routeInitialObjId ) ? this.setStartPointFromContextMenu : null
					} 
				);
				contextMenu.push ( 
					{
						context : this, name : _Translator.getText ( "RouteEditor - Select this point as way point" ), 
						action : ( -1 !== global.editedRoute.routeInitialObjId ) ? this.addPointFromContextMenu : null
					}
				);
				contextMenu.push (
					{ 
						context : this, name : _Translator.getText ( "RouteEditor - Select this point as end point" ), 
						action : ( -1 !== global.editedRoute.routeInitialObjId ) ? this.setEndPointFromContextMenu : null
					}
				);
				return contextMenu;
			},
			
			get routeContextMenu ( ) {
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, name : _Translator.getText ( "RouteEditor - Edit this route" ), 
						action : null
					} 
				);
				contextMenu.push ( 
					{
						context : this, name : _Translator.getText ( "RouteEditor - Delete this route" ), 
						action : null
					}
				);
				contextMenu.push (
					{ 
						context : this, name : _Translator.getText ( "RouteEditor - Save this route" ), 
						action : null
					}
				);
				contextMenu.push (
					{ 
						context : this, name : _Translator.getText ( "RouteEditor - Cancel this route" ), 
						action : null
					}
				);
				return contextMenu;
			},
			
			setStartPoint : function ( latLng ) {
				global.editedRoute.routeChanged = true;
				global.editedRoute.wayPoints.first.latLng = latLng;
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			setEndPoint : function ( latLng ) {
				global.editedRoute.routeChanged = true;
				global.editedRoute.wayPoints.last.latLng = latLng;
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			setStartPointFromContextMenu : function ( mapClickEvent ) {
				this.setStartPoint ( [ mapClickEvent.latlng.lat, mapClickEvent.latlng.lng ] );
			},
			
			setEndPointFromContextMenu : function ( mapClickEvent ) {
				this.setEndPoint ( [ mapClickEvent.latlng.lat, mapClickEvent.latlng.lng ] );
			},
			
			addPointFromContextMenu : function ( mapClickEvent ) {
				this.addWayPoint ( [ mapClickEvent.latlng.lat, mapClickEvent.latlng.lng ] );
			},
			clear : function ( ) {
					global.editedRoute = require ( '../data/Route' ) ( );
					global.editedRoute.routeChanged = false;
					global.editedRoute.routeInitialObjId = -1;
					require ( '../UI/RouteEditorUI' ) ( ).setWayPointsList (  );
					require ( '../UI/ItineraryEditorUI' ) ( ).setItinerary ( );
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRouteEditor;
	}

}());
