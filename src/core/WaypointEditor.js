/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- WayPointEditor.js file --------------------------------------------------------------------------------------------
This file contains:
	- the newWayPointEditor function
	- the theWayPointEditor object
Changes:
	- v1.4.0:
		- created from RouteEditor
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #68 : Review all existing promises.
Doc reviewed 20191121
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theConfig } from '../data/Config.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theRouteEditor } from '../core/RouteEditor.js';

import { newGeoCoder } from '../core/GeoCoder.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { newWayPoint } from '../data/WayPoint.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newGeometry } from '../util/Geometry.js';

import { ROUTE_EDITION_STATUS, LAT_LNG, ZERO, TWO } from '../util/Constants.js';

/*
--- newWayPointEditor function ----------------------------------------------------------------------------------------

Patterns : Closure and Singleton

-----------------------------------------------------------------------------------------------------------------------
*/

function newWayPointEditor ( ) {

	let myEventDispatcher = newEventDispatcher ( );
	let myGeometry = newGeometry ( );

	/*
	--- myRenameWayPoint function -------------------------------------------------------------------------------------

	This function rename a wayPoint

	parameters:
	- wayPointObjId : the waypoint objId to rename
	- wayPointName : the new name

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRenameWayPoint ( wayPointName, wayPointObjId ) {
		theTravelNotesData.travel.editedRoute.edited = ROUTE_EDITION_STATUS.editedChanged;
		theTravelNotesData.travel.editedRoute.wayPoints.getAt ( wayPointObjId ).name = wayPointName;
		myEventDispatcher.dispatch ( 'setwaypointslist' );
	}

	/*
	--- myRenameWayPointWithGeocoder function -----------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRenameWayPointWithGeocoder ( latLng, wayPointObjId ) {

		if ( ! theConfig.wayPoint.reverseGeocoding ) {
			return;
		}

		function setAdressFromGeocoder ( geoCoderData ) {
			let address = '';
			if ( geoCoderData.address.house_number ) {
				address += geoCoderData.address.house_number + ' ';
			}
			if ( geoCoderData.address.road ) {
				address += geoCoderData.address.road + ' ';
			}
			else if ( geoCoderData.address.pedestrian ) {
				address += geoCoderData.address.pedestrian + ' ';
			}
			if ( geoCoderData.address.village ) {
				address += geoCoderData.address.village;
			}
			else if ( geoCoderData.address.town ) {
				address += geoCoderData.address.town;
			}
			else if ( geoCoderData.address.city ) {
				address += geoCoderData.address.city;
			}
			if ( ZERO === address.length ) {
				address += geoCoderData.address.country;
			}
			myRenameWayPoint ( address, wayPointObjId );
		}

		newGeoCoder ( ).getPromiseAddress ( latLng )
			.then ( setAdressFromGeocoder )
			.catch ( err => console.log ( err ? err : 'An error occurs in the geoCoder' ) );
	}

	/*
	--- myAddWayPoint function ----------------------------------------------------------------------------------------

	This function add a waypoint

	parameters:
	- latLng :

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddWayPoint ( latLng, distance ) {
		theTravelNotesData.travel.editedRoute.edited = ROUTE_EDITION_STATUS.editedChanged;
		let wayPoint = newWayPoint ( );
		if ( latLng ) {
			wayPoint.latLng = latLng;
			myRenameWayPointWithGeocoder ( latLng, wayPoint.objId );
		}
		theTravelNotesData.travel.editedRoute.wayPoints.add ( wayPoint );
		myEventDispatcher.dispatch (
			'addwaypoint',
			{
				wayPoint : theTravelNotesData.travel.editedRoute.wayPoints.last,
				letter : theTravelNotesData.travel.editedRoute.wayPoints.length - TWO
			}
		);
		if ( distance ) {
			let wayPointsIterator = theTravelNotesData.travel.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
				let latLngDistance = myGeometry.getClosestLatLngDistance (
					theTravelNotesData.travel.editedRoute,
					wayPointsIterator.value.latLng
				);
				if ( distance < latLngDistance.distance ) {
					theTravelNotesData.travel.editedRoute.wayPoints.moveTo (
						wayPoint.objId, wayPointsIterator.value.objId, true
					);
					break;
				}
			}
		}
		else {
			theTravelNotesData.travel.editedRoute.wayPoints.swap ( wayPoint.objId, true );
		}
		myEventDispatcher.dispatch ( 'setwaypointslist' );
		theRouteEditor.startRouting ( );
	}

	/*
	--- myAddWayPointOnRoute function ---------------------------------------------------------------------------------

	This function add a waypoint at a given position on the edited route

	parameters:
	- latLng :

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddWayPointOnRoute ( routeObjId, mapContextMenuEvent ) {
		let latLngDistance = myGeometry.getClosestLatLngDistance (
			newDataSearchEngine ( ).getRoute ( routeObjId ),
			[ mapContextMenuEvent.latlng.lat, mapContextMenuEvent.latlng.lng ]
		);
		myAddWayPoint ( latLngDistance.latLng, latLngDistance.distance );
	}

	/*
	--- myReverseWayPoints function -----------------------------------------------------------------------------------

	This function reverse the waypoints order

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myReverseWayPoints ( ) {
		theTravelNotesData.travel.editedRoute.edited = ROUTE_EDITION_STATUS.editedChanged;
		let wayPointsIterator = theTravelNotesData.travel.editedRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			myEventDispatcher.dispatch ( 'removeobject', { objId : wayPointsIterator.value.objId } );
		}
		theTravelNotesData.travel.editedRoute.wayPoints.reverse ( );
		wayPointsIterator = theTravelNotesData.travel.editedRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			myEventDispatcher.dispatch (
				'addwaypoint',
				{
					wayPoint : wayPointsIterator.value,
					letter :
						wayPointsIterator .first ? 'A' : ( wayPointsIterator.last ? 'B' : wayPointsIterator.index )
				}
			);
		}
		myEventDispatcher.dispatch ( 'setwaypointslist' );
		theRouteEditor.startRouting ( );
	}

	/*
	--- myRemoveAllWayPoints function ---------------------------------------------------------------------------------

	This function remove all waypoints except the first and last ( see also Collection ...)

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRemoveAllWayPoints ( ) {
		theTravelNotesData.travel.editedRoute.edited = ROUTE_EDITION_STATUS.editedChanged;
		let wayPointsIterator = theTravelNotesData.travel.editedRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			myEventDispatcher.dispatch ( 'removeobject', { objId : wayPointsIterator.value.objId } );
		}
		theTravelNotesData.travel.editedRoute.wayPoints.removeAll ( true );
		myEventDispatcher.dispatch ( 'setwaypointslist' );
		theRouteEditor.startRouting ( );
	}

	/*
	--- myRemoveWayPoint function -------------------------------------------------------------------------------------

	This function remove a waypoint

	parameters:
	- wayPointObjId : the waypoint objId to remove

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRemoveWayPoint ( wayPointObjId ) {
		theTravelNotesData.travel.editedRoute.edited = ROUTE_EDITION_STATUS.editedChanged;
		myEventDispatcher.dispatch ( 'removeobject', { objId : wayPointObjId } );
		theTravelNotesData.travel.editedRoute.wayPoints.remove ( wayPointObjId );
		myEventDispatcher.dispatch ( 'setwaypointslist' );
		theRouteEditor.startRouting ( );
	}

	/*
	--- mySwapWayPoints function --------------------------------------------------------------------------------------

	This function change the order of two waypoints

	parameters:
	- wayPointObjId : the waypoint objId to swap
	- swapUp : when true the waypoint is swapped with the previous one, otherwise with the next

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySwapWayPoints ( wayPointObjId, swapUp ) {
		theTravelNotesData.travel.editedRoute.edited = ROUTE_EDITION_STATUS.editedChanged;
		theTravelNotesData.travel.editedRoute.wayPoints.swap ( wayPointObjId, swapUp );
		myEventDispatcher.dispatch ( 'setwaypointslist' );
		theRouteEditor.startRouting ( );
	}

	/*
	--- mySetStartPoint function --------------------------------------------------------------------------------------

	This function set the start waypoint

	parameters:
	- latLng : the coordinates of the start waypoint

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetStartPoint ( latLng ) {
		theTravelNotesData.travel.editedRoute.edited = ROUTE_EDITION_STATUS.editedChanged;
		if ( LAT_LNG.defaultValue !== theTravelNotesData.travel.editedRoute.wayPoints.first.lat ) {
			myEventDispatcher.dispatch (
				'removeobject',
				{ objId : theTravelNotesData.travel.editedRoute.wayPoints.first.objId }
			);
		}
		theTravelNotesData.travel.editedRoute.wayPoints.first.latLng = latLng;
		if ( theConfig.wayPoint.reverseGeocoding ) {
			myRenameWayPointWithGeocoder ( latLng, theTravelNotesData.travel.editedRoute.wayPoints.first.objId );
		}
		myEventDispatcher.dispatch (
			'addwaypoint',
			{
				wayPoint : theTravelNotesData.travel.editedRoute.wayPoints.first,
				letter : 'A'
			}
		);
		myEventDispatcher.dispatch ( 'setwaypointslist' );
		theRouteEditor.startRouting ( );
	}

	/*
	--- mySetEndPoint function ----------------------------------------------------------------------------------------

	This function set the end waypoint

	parameters:
	- latLng : the coordinates of the end waypoint

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetEndPoint ( latLng ) {
		theTravelNotesData.travel.editedRoute.edited = ROUTE_EDITION_STATUS.editedChanged;
		if ( LAT_LNG.defaultValue !== theTravelNotesData.travel.editedRoute.wayPoints.last.lat ) {
			myEventDispatcher.dispatch (
				'removeobject',
				{ objId : theTravelNotesData.travel.editedRoute.wayPoints.last.objId }
			);
		}
		theTravelNotesData.travel.editedRoute.wayPoints.last.latLng = latLng;
		if ( theConfig.wayPoint.reverseGeocoding ) {
			myRenameWayPointWithGeocoder ( latLng, theTravelNotesData.travel.editedRoute.wayPoints.last.objId );
		}
		myEventDispatcher.dispatch (
			'addwaypoint',
			{
				wayPoint : theTravelNotesData.travel.editedRoute.wayPoints.last,
				letter : 'B'
			}
		);
		myEventDispatcher.dispatch ( 'setwaypointslist' );
		theRouteEditor.startRouting ( );
	}

	/*
	--- myWayPointDragEnd function ------------------------------------------------------------------------------------

	This function is called when the dragend event is fired on a waypoint

	parameters:
	- wayPointObjId : the TravelNotes waypoint objId

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myWayPointDragEnd ( wayPointObjId ) {
		theTravelNotesData.travel.editedRoute.edited = ROUTE_EDITION_STATUS.editedChanged;
		if ( theConfig.wayPoint.reverseGeocoding ) {
			myRenameWayPointWithGeocoder (
				theTravelNotesData.travel.editedRoute.wayPoints.getAt ( wayPointObjId ).latLng, wayPointObjId
			);
		}
		myEventDispatcher.dispatch ( 'setwaypointslist' );
		theRouteEditor.startRouting ( );
	}

	/*
	--- myWayPointDropped function ------------------------------------------------------------------------------------

	This function is called when the drop event is fired on a waypoint

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myWayPointDropped ( draggedWayPointObjId, targetWayPointObjId, draggedBefore ) {
		theTravelNotesData.travel.editedRoute.edited = ROUTE_EDITION_STATUS.editedChanged;
		if ( targetWayPointObjId === theTravelNotesData.travel.editedRoute.wayPoints.first.objId && draggedBefore ) {
			return;
		}
		if ( targetWayPointObjId === theTravelNotesData.travel.editedRoute.wayPoints.last.objId && ( ! draggedBefore ) )	{
			return;
		}
		theTravelNotesData.travel.editedRoute.wayPoints.moveTo (
			draggedWayPointObjId, targetWayPointObjId, draggedBefore
		);
		myEventDispatcher.dispatch ( 'setwaypointslist' );
		let wayPointsIterator = theTravelNotesData.travel.editedRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			myEventDispatcher.dispatch ( 'removeobject', { objId : wayPointsIterator.value.objId } );
			myEventDispatcher.dispatch (
				'addwaypoint',
				{
					wayPoint : wayPointsIterator.value,
					letter : wayPointsIterator.first ? 'A' : ( wayPointsIterator.last ? 'B' : wayPointsIterator.index )
				}
			);
		}
		theRouteEditor.startRouting ( );
	}

	/*
	--- wayPointEditor object -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			addWayPoint : latLng => myAddWayPoint ( latLng ),

			addWayPointOnRoute : (
				routeObjId,
				mapContextMenuEvent
			) => myAddWayPointOnRoute (
				routeObjId,
				mapContextMenuEvent
			),

			reverseWayPoints : ( ) => myReverseWayPoints ( ),

			removeAllWayPoints : ( ) => myRemoveAllWayPoints ( ),

			removeWayPoint : wayPointObjId => myRemoveWayPoint ( wayPointObjId ),

			renameWayPoint : ( wayPointName, wayPointObjId ) => myRenameWayPoint ( wayPointName, wayPointObjId ),

			swapWayPoints : ( wayPointObjId, swapUp ) => mySwapWayPoints ( wayPointObjId, swapUp ),

			setStartPoint : latLng => mySetStartPoint ( latLng ),

			setEndPoint : latLng => mySetEndPoint ( latLng ),

			wayPointDragEnd : wayPointObjId => myWayPointDragEnd ( wayPointObjId ),

			wayPointDropped : (
				draggedWayPointObjId,
				targetWayPointObjId,
				draggedBefore
			) => myWayPointDropped (
				draggedWayPointObjId,
				targetWayPointObjId,
				draggedBefore
			)
		}
	);
}

/*
--- theWayPointEditor object -------------------------------------------------------------------------------------------

The one and only one wayPointEditor

-----------------------------------------------------------------------------------------------------------------------
*/

const theWayPointEditor = newWayPointEditor ( );

export { theWayPointEditor };

/*
--- End of WayPointEditor.js file -------------------------------------------------------------------------------------
*/