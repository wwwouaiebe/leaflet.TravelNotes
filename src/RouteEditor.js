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

		return {
			
			editRoute : function ( route ) { 
				_RouteChanged = false;
				_RouteInitialObjId = route.objId;
				// Route is cloned, so we can have a cancel button in the editor
				_Route.object = route.object;
				require ( './RouteEditorUI' ) ( ).setRouteData ( _Route );
			},
			
			addWayPoint : function ( ) {
				_RouteChanged = true;
				var newWayPoint = require ( './Waypoint.js' ) ( );
				_Route.addWayPoint ( newWayPoint );
				return _Route.wayPoints;
			},
			
			reverseWayPoints : function ( ) {
				_RouteChanged = true;
				_Route.wayPoints.reverse ( );
				return _Route.wayPoints;
			},
			
			removeAllWayPoints : function ( ) {
				_RouteChanged = true;
				_Route.removeAllWayPoints (  );
				return _Route.wayPoints;
			},
			
			removeWayPoint : function ( wayPointObjId ) {
				_RouteChanged = true;
				_Route.removeWayPoint ( wayPointObjId );
				return _Route.wayPoints;
			},
			
			renameWayPoint : function ( wayPointObjId, wayPointName ) {
				_RouteChanged = true;
				_Route.wayPoints [ _Route.indexOfWayPoint ( wayPointObjId ) ].name = wayPointName;
			},
			
			swapWayPoints : function ( wayPointObjId, MoveUp ) {
				_RouteChanged = true;
				_Route.swapWayPoints ( wayPointObjId, MoveUp );
				return _Route.wayPoints;
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRouteEditor;
	}

}());
