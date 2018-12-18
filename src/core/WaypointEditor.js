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
--- WaypointEditor.js file -------------------------------------------------------------------------------------------------
This file contains:
	- the WaypointEditor object
	- the module.exports implementation
Changes:
	- v1.4.0:
		- created from RouteEditor

Doc reviewed 20181218
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var g_TravelNotesData = require ( '../L.TravelNotes' );

		
	/*
	--- waypointEditor function ------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var waypointEditor = function ( ) {
		
		var m_MapEditor = require ( '../core/MapEditor' ) ( );
		var m_RouteEditor = require ( '../core/RouteEditor' ) ( );
		var m_RouteEditorUI = require ( '../UI/RouteEditorUI' ) ( );


		/*
		--- m_AddWayPoint function ------------------------------------------------------------------------------------

		This function add a waypoint 
		
		parameters:
		- latLng : 

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_AddWayPoint = function ( latLng, distance ) {
			g_TravelNotesData.routeEdition.routeChanged = true;
			var newWayPoint = require ( '../data/Waypoint.js' ) ( );
			if ( latLng ) {
				newWayPoint.latLng = latLng;
				if ( g_TravelNotesData.config.wayPoint.reverseGeocoding ) {
					require ( '../core/GeoCoder' ) ( ).getAddress ( 
						latLng [ 0 ], 
						latLng [ 1 ], 
						m_RenameWayPoint, 
						newWayPoint.objId 
					);
				}
			}
			g_TravelNotesData.editedRoute.wayPoints.add ( newWayPoint );
			m_MapEditor.addWayPoint ( g_TravelNotesData.editedRoute.wayPoints.last, g_TravelNotesData.editedRoute.wayPoints.length - 2 );
			if ( distance ) {
				var wayPointsIterator = g_TravelNotesData.editedRoute.wayPoints.iterator;
				while ( ! wayPointsIterator.done ) {
					var latLngDistance = m_RouteEditor.getClosestLatLngDistance ( 
						g_TravelNotesData.editedRoute,
						wayPointsIterator.value.latLng 
					);
					if ( distance < latLngDistance.distance ) {
						g_TravelNotesData.editedRoute.wayPoints.moveTo ( newWayPoint.objId, wayPointsIterator.value.objId, true );
						break;
					}
				}
			}
			else {
				g_TravelNotesData.editedRoute.wayPoints.swap ( newWayPoint.objId, true );
			}
			m_RouteEditorUI.setWayPointsList ( );
			m_RouteEditor.startRouting ( );
		};
			
		/*
		--- m_AddWayPointOnRoute function -----------------------------------------------------------------------------

		This function add a waypoint at a given position on the edited route
		
		parameters:
		- latLng : 

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_AddWayPointOnRoute = function ( routeObjId, event ) {
			var latLngDistance = m_RouteEditor.getClosestLatLngDistance ( 
				require ( '../Data/DataSearchEngine' ) ( ).getRoute ( routeObjId ),
				[ event.latlng.lat, event.latlng.lng ] 
			);
			m_AddWayPoint ( latLngDistance.latLng, latLngDistance.distance );
		};
		
		/*
		--- m_ReverseWayPoints function -------------------------------------------------------------------------------

		This function reverse the waypoints order
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ReverseWayPoints = function ( ) {
			g_TravelNotesData.routeEdition.routeChanged = true;
			var wayPointsIterator = g_TravelNotesData.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
				m_MapEditor.removeObject ( wayPointsIterator.value.objId );
			}
			g_TravelNotesData.editedRoute.wayPoints.reverse ( );
			wayPointsIterator = g_TravelNotesData.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
				m_MapEditor.addWayPoint ( wayPointsIterator.value, wayPointsIterator .first ? 'A' : ( wayPointsIterator.last ? 'B' : wayPointsIterator.index ) );
			}
			m_RouteEditorUI.setWayPointsList ( );
			m_RouteEditor.startRouting ( );
		};
			
		/*
		--- m_RemoveAllWayPoints function -----------------------------------------------------------------------------

		This function remove all waypoints except the first and last ( see also Collection ...)
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_RemoveAllWayPoints = function ( ) {
			g_TravelNotesData.routeEdition.routeChanged = true;
			var wayPointsIterator = g_TravelNotesData.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
				m_MapEditor.removeObject ( wayPointsIterator.value.objId );
			}
			g_TravelNotesData.editedRoute.wayPoints.removeAll ( true );
			m_RouteEditorUI.setWayPointsList ( );
			m_RouteEditor.startRouting ( );
		};
		
		/*
		--- m_RemoveWayPoint function ---------------------------------------------------------------------------------

		This function remove a waypoint
		
		parameters:
		- wayPointObjId : the waypoint objId to remove

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_RemoveWayPoint = function ( wayPointObjId ) {
			g_TravelNotesData.routeEdition.routeChanged = true;
			m_MapEditor.removeObject ( wayPointObjId );
			g_TravelNotesData.editedRoute.wayPoints.remove ( wayPointObjId );
			m_RouteEditorUI.setWayPointsList ( );
			m_RouteEditor.startRouting ( );
		};

		/*
		--- m_RenameWayPoint function ---------------------------------------------------------------------------------

		This function rename a wayPoint
		
		parameters:
		- wayPointObjId : the waypoint objId to rename
		- wayPointName : the new name

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_RenameWayPoint = function ( wayPointName, wayPointObjId ) {
			g_TravelNotesData.routeEdition.routeChanged = true;
			g_TravelNotesData.editedRoute.wayPoints.getAt ( wayPointObjId ).name = wayPointName;
			m_RouteEditorUI.setWayPointsList ( );
		};
		
		/*
		--- m_SwapWayPoints function ----------------------------------------------------------------------------------

		This function change the order of two waypoints
		
		parameters:
		- wayPointObjId : the waypoint objId to swap
		- swapUp : when true the waypoint is swapped with the previous one, otherwise with the next

		-----------------------------------------------------------------------------------------------------------
		*/

		var m_SwapWayPoints = function ( wayPointObjId, swapUp ) {
			g_TravelNotesData.routeEdition.routeChanged = true;
			g_TravelNotesData.editedRoute.wayPoints.swap ( wayPointObjId, swapUp );
			m_RouteEditorUI.setWayPointsList (  );
			m_RouteEditor.startRouting ( );
		};
			
		/*
		--- m_SetStartPoint function ----------------------------------------------------------------------------------

		This function set the start waypoint
		
		parameters:
		- latLng : the coordinates of the start waypoint

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SetStartPoint = function ( latLng ) {
			g_TravelNotesData.routeEdition.routeChanged = true;
			if ( 0 !== g_TravelNotesData.editedRoute.wayPoints.first.lat ) {
				m_MapEditor.removeObject ( g_TravelNotesData.editedRoute.wayPoints.first.objId );
			}
			g_TravelNotesData.editedRoute.wayPoints.first.latLng = latLng;
			if ( g_TravelNotesData.config.wayPoint.reverseGeocoding ) {
				require ( '../core/GeoCoder' ) ( ).getAddress ( latLng [ 0 ], latLng [ 1 ], m_RenameWayPoint, g_TravelNotesData.editedRoute.wayPoints.first.objId );
			}
			m_MapEditor.addWayPoint ( g_TravelNotesData.editedRoute.wayPoints.first, 'A' );
			m_RouteEditorUI.setWayPointsList ( );
			m_RouteEditor.startRouting ( );
		};
			
		/*
		--- m_SetEndPoint function ------------------------------------------------------------------------------------

		This function set the end waypoint
		
		parameters:
		- latLng : the coordinates of the end waypoint


		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SetEndPoint = function ( latLng ) {
			g_TravelNotesData.routeEdition.routeChanged = true;
			if ( 0 !== g_TravelNotesData.editedRoute.wayPoints.last.lat ) {
				m_MapEditor.removeObject ( g_TravelNotesData.editedRoute.wayPoints.last.objId );
			}
			g_TravelNotesData.editedRoute.wayPoints.last.latLng = latLng;
			if ( g_TravelNotesData.config.wayPoint.reverseGeocoding ) {
				require ( '../core/GeoCoder' ) ( ).getAddress ( latLng [ 0 ], latLng [ 1 ], m_RenameWayPoint, g_TravelNotesData.editedRoute.wayPoints.last.objId );
			}
			m_MapEditor.addWayPoint ( g_TravelNotesData.editedRoute.wayPoints.last, 'B' );
			m_RouteEditorUI.setWayPointsList ( );
			m_RouteEditor.startRouting ( );
		};
			
		/*
		--- m_WayPointDragEnd function --------------------------------------------------------------------------------

		This function is called when the dragend event is fired on a waypoint
		
		parameters:
		- wayPointObjId : the TravelNotes waypoint objId

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_WayPointDragEnd = function ( wayPointObjId ) {
			g_TravelNotesData.routeEdition.routeChanged = true;
			if ( g_TravelNotesData.config.wayPoint.reverseGeocoding ) {
				var latLng = g_TravelNotesData.editedRoute.wayPoints.getAt ( wayPointObjId ).latLng;
				require ( '../core/GeoCoder' ) ( ).getAddress ( latLng [ 0 ], latLng [ 1 ], m_RenameWayPoint, wayPointObjId );
			}
			m_RouteEditorUI.setWayPointsList ( );
			m_RouteEditor.startRouting ( );
		};
		
		/*
		--- m_WayPointDropped function --------------------------------------------------------------------------------

		This function is called when the drop event is fired on a waypoint
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_WayPointDropped = function ( draggedWayPointObjId, targetWayPointObjId, draggedBefore ) {
			g_TravelNotesData.routeEdition.routeChanged = true;
			if ( targetWayPointObjId === g_TravelNotesData.editedRoute.wayPoints.first.objId && draggedBefore ) {
				return;
			}
			if ( targetWayPointObjId === g_TravelNotesData.editedRoute.wayPoints.last.objId && ( ! draggedBefore ) )	{
				return;
			}
			g_TravelNotesData.editedRoute.wayPoints.moveTo ( draggedWayPointObjId, targetWayPointObjId, draggedBefore );
			m_RouteEditorUI.setWayPointsList ( );
			var wayPointsIterator = g_TravelNotesData.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
					m_MapEditor.removeObject ( wayPointsIterator.value.objId );
					m_MapEditor.addWayPoint ( wayPointsIterator.value, wayPointsIterator.first ? 'A' : ( wayPointsIterator.last ? 'B' :  wayPointsIterator.index ) );
			}
			m_RouteEditor.startRouting ( );
		};
		
		/*
		--- waypointEditor object ----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{
				addWayPoint : function ( latLng, distance ) { m_AddWayPoint ( latLng, event, distance ); },
				
				addWayPointOnRoute : function ( routeObjId, event ) { m_AddWayPointOnRoute ( routeObjId, event ); },
				
				reverseWayPoints : function ( ) { m_ReverseWayPoints ( ); },
			
				removeAllWayPoints : function ( ) { m_RemoveAllWayPoints ( ); },
				
				removeWayPoint : function ( wayPointObjId ) { m_RemoveWayPoint ( wayPointObjId ); },
				
				renameWayPoint : function ( wayPointName, wayPointObjId ) { m_RenameWayPoint ( wayPointName, wayPointObjId ); },
				
				swapWayPoints : function ( wayPointObjId, swapUp ) { m_SwapWayPoints ( wayPointObjId, swapUp ); },
				
				setStartPoint : function ( latLng ) { m_SetStartPoint ( latLng ); },

				setEndPoint : function ( latLng ) { m_SetEndPoint ( latLng ); },

				wayPointDragEnd : function ( wayPointObjId ) { m_WayPointDragEnd ( wayPointObjId ); },

				wayPointDropped : function ( draggedWayPointObjId, targetWayPointObjId, draggedBefore ) { m_WayPointDropped ( draggedWayPointObjId, targetWayPointObjId, draggedBefore ); },
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = waypointEditor;
	}

}());

/*
--- End of WaypointEditor.js file ----------------------------------------------------------------------------------------
*/