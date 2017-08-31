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

	var _Route = require ( './Route' ) ( );
	var _RouteInitialObjId = -1;
	var _RouteChanged = false;
	
	var getRouteEditor = function ( ) {

		var _RouteEditorUI = require ( './RouteEditorUI' ) ( );
	
		return {
			
			saveEdition : function ( ) {
				var travelData = require ( './TravelData' ) ( );
				travelData.routes.replace ( _RouteInitialObjId, _Route );
				_RouteChanged = false;
				// It's needed to rewrite the route list due to objId's changes
				require ( './RoutesListEditorUI') ( ).writeRoutesList ( travelData.routes );
				this.editRoute ( _Route.objId );
			},
			
			cancelEdition : function ( ) {
				_RouteChanged = false;
				this.editRoute ( _RouteInitialObjId );
			},
			
			editRoute : function ( routeObjId ) { 
				console.log ( 'a' );
				if ( _RouteChanged ) {
				console.log ( 'b' );
					require ( './ErrorEditor' ) ( ).showError ( "Il n'est pas possible d'éditer une route sans sauver ou abandonner les modifications" );
					return;
				}
				console.log ( 'C' );
				_Route = require ( './Route' ) ( );
				var route = require ( './TravelData' ) ( ).routes.getAt ( routeObjId );
				_RouteInitialObjId = route.objId;
				// Route is cloned, so we can have a cancel button in the editor
				_Route.object = route.object;
				_RouteEditorUI .expand ( );
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			addWayPoint : function ( latLng ) {
				_RouteChanged = true;
				var newWayPoint = require ( './Waypoint.js' ) ( );
				if ( latLng ) {
					newWayPoint.latLng = latLng;
				}
				_Route.wayPoints.add ( newWayPoint );
				_Route.wayPoints.swap ( newWayPoint.objId, true );
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			reverseWayPoints : function ( ) {
				_RouteChanged = true;
				_Route.wayPoints.reverse ( );
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			removeAllWayPoints : function ( ) {
				_RouteChanged = true;
				_Route.wayPoints.removeAll ( true );
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			removeWayPoint : function ( wayPointObjId ) {
				_RouteChanged = true;
				_Route.wayPoints.remove ( wayPointObjId );
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			renameWayPoint : function ( wayPointObjId, wayPointName ) {
				_RouteChanged = true;
				_Route.wayPoints.getAt ( wayPointObjId ).name = wayPointName;
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			swapWayPoints : function ( wayPointObjId, swapUp ) {
				_RouteChanged = true;
				_Route.wayPoints.swap ( wayPointObjId, swapUp );
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			get contextMenu ( ) {
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, name : "Sélectionner cet endroit comme point de départ", 
						action : ( -1 !== _RouteInitialObjId ) ? this.setStartPointFromContextMenu : null
					} 
				);
				contextMenu.push ( 
					{
						context : this, name : "Sélectionner cet endroit comme point intermédiaire", 
						action : ( -1 !== _RouteInitialObjId ) ? this.addPointFromContextMenu : null
					}
				);
				contextMenu.push (
					{ 
						context : this, name : "Sélectionner cet endroit comme point de fin", 
						action : ( -1 !== _RouteInitialObjId ) ? this.setEndPointFromContextMenu : null
					}
				);
				return contextMenu;
			},
			
			setStartPoint : function ( latLng ) {
				_RouteChanged = true;
				_Route.wayPoints.first.latLng = latLng;
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			setEndPoint : function ( latLng ) {
				_RouteChanged = true;
				_Route.wayPoints.last.latLng = latLng;
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			setStartPointFromContextMenu : function ( mapClickEvent ) {
				this.setStartPoint ( [ mapClickEvent.latlng.lat, mapClickEvent.latlng.lng ] );
			},
			
			setEndPointFromContextMenu : function ( mapClickEvent ) {
				this.setEndPoint ( [ mapClickEvent.latlng.lat, mapClickEvent.latlng.lng ] );
			},
			
			addPointFromContextMenu : function ( mapClickEvent ) {
				this.addWayPoint ( [ mapClickEvent.latlng.lat, mapClickEvent.latlng.lng ] );
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRouteEditor;
	}

}());
