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
				if ( _RouteChanged ) {
					return;
				}
				_Route = require ( './Route' ) ( );
				var route = require ( './TravelData' ) ( ).routes.getAt ( routeObjId );
				_RouteInitialObjId = route.objId;
				// Route is cloned, so we can have a cancel button in the editor
				_Route.object = route.object;
				_RouteEditorUI .expand ( );
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			addWayPoint : function ( ) {
				_RouteChanged = true;
				var newWayPoint = require ( './Waypoint.js' ) ( );
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
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRouteEditor;
	}

}());
