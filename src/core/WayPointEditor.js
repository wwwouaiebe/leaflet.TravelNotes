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
	- v1.8.0:
		- issue #97 : Improve adding a new waypoint to a route
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20191121
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theConfig } from '../data/Config.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theRouteEditor } from '../core/RouteEditor.js';
import { newWayPointPropertiesDialog } from '../dialogs/WayPointPropertiesDialog.js';
import { newGeoCoder } from '../core/GeoCoder.js';
import { newWayPoint } from '../data/WayPoint.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newGeometry } from '../util/Geometry.js';

import { ROUTE_EDITION_STATUS, LAT_LNG, TWO } from '../util/Constants.js';

/*
--- newWayPointEditor function ----------------------------------------------------------------------------------------

Patterns : Closure and Singleton

-----------------------------------------------------------------------------------------------------------------------
*/

function newWayPointEditor ( ) {

	let myEventDispatcher = newEventDispatcher ( );
	let myGeometry = newGeometry ( );

	/*
	--- myWayPointProperties function -------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myWayPointProperties ( wayPointObjId ) {
		let wayPoint = theTravelNotesData.travel.editedRoute.wayPoints.getAt ( wayPointObjId );
		let wayPointPropertiesDialog = newWayPointPropertiesDialog ( wayPoint );

		wayPointPropertiesDialog.show ( ).then (
			( ) => {
				myEventDispatcher.dispatch ( 'setrouteslist' );
			}
		)
			.catch ( err => console.log ( err ? err : 'An error occurs in the waypoint properties dialog' ) );
	}

	/*
	--- myRenameWayPoint function -------------------------------------------------------------------------------------

	This function rename a wayPoint

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRenameWayPoint ( wayPointData, wayPointObjId ) {
		theTravelNotesData.travel.editedRoute.edited = ROUTE_EDITION_STATUS.editedChanged;
		let wayPoint = theTravelNotesData.travel.editedRoute.wayPoints.getAt ( wayPointObjId );
		wayPoint.name = wayPointData.name;
		wayPoint.address = wayPointData.address;
		myEventDispatcher.dispatch ( 'setrouteslist' );
	}

	/*
	--- myRenameWayPointWithGeocoder function -------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRenameWayPointWithGeocoder ( latLng, wayPointObjId ) {
		if ( ! theConfig.wayPoint.reverseGeocoding ) {
			return;
		}

		let geoCoder = newGeoCoder ( );

		function setAdressFromGeocoder ( geoCoderResponse ) {
			myRenameWayPoint (
				geoCoder.parseResponse ( geoCoderResponse ),
				wayPointObjId
			);
		}

		geoCoder.getPromiseAddress ( latLng )
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

	function myAddWayPoint ( latLng ) {
		theTravelNotesData.travel.editedRoute.edited = ROUTE_EDITION_STATUS.editedChanged;
		let wayPoint = newWayPoint ( );
		wayPoint.latLng = latLng;
		myRenameWayPointWithGeocoder ( latLng, wayPoint.objId );
		theTravelNotesData.travel.editedRoute.wayPoints.add ( wayPoint );
		myEventDispatcher.dispatch (
			'addwaypoint',
			{
				wayPoint : theTravelNotesData.travel.editedRoute.wayPoints.last,
				letter : theTravelNotesData.travel.editedRoute.wayPoints.length - TWO
			}
		);
		theTravelNotesData.travel.editedRoute.wayPoints.swap ( wayPoint.objId, true );
		theRouteEditor.startRouting ( );
	}

	/*
	--- myAddWayPointOnRoute function ---------------------------------------------------------------------------------

	This function add a waypoint at a given position on the edited route

	parameters:
	- latLng :

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddWayPointOnRoute ( initialLatLng, finalLatLng ) {
		let newWayPointDistance = myGeometry.getClosestLatLngDistance (
			theTravelNotesData.travel.editedRoute,
			initialLatLng
		).distance;
		theTravelNotesData.travel.editedRoute.edited = ROUTE_EDITION_STATUS.editedChanged;
		let wayPoint = newWayPoint ( );
		wayPoint.latLng = finalLatLng;
		myRenameWayPointWithGeocoder ( finalLatLng, wayPoint.objId );
		theTravelNotesData.travel.editedRoute.wayPoints.add ( wayPoint );
		myEventDispatcher.dispatch (
			'addwaypoint',
			{
				wayPoint : theTravelNotesData.travel.editedRoute.wayPoints.last,
				letter : theTravelNotesData.travel.editedRoute.wayPoints.length - TWO
			}
		);

		let wayPointsIterator = theTravelNotesData.travel.editedRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			let latLngDistance = myGeometry.getClosestLatLngDistance (
				theTravelNotesData.travel.editedRoute,
				wayPointsIterator.value.latLng
			);
			if ( newWayPointDistance < latLngDistance.distance ) {
				theTravelNotesData.travel.editedRoute.wayPoints.moveTo (
					wayPoint.objId, wayPointsIterator.value.objId, true
				);
				break;
			}
		}
		theRouteEditor.startRouting ( );
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
		myEventDispatcher.dispatch ( 'setrouteslist' );
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
				initialLatLng,
				finalLatLng
			) => myAddWayPointOnRoute (
				initialLatLng,
				finalLatLng
			),

			reverseWayPoints : ( ) => myReverseWayPoints ( ),

			removeWayPoint : wayPointObjId => myRemoveWayPoint ( wayPointObjId ),

			setStartPoint : latLng => mySetStartPoint ( latLng ),

			setEndPoint : latLng => mySetEndPoint ( latLng ),

			wayPointDragEnd : wayPointObjId => myWayPointDragEnd ( wayPointObjId ),

			wayPointProperties : wayPointObjId => myWayPointProperties ( wayPointObjId )
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