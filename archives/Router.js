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
--- Router.js file -------------------------------------------------------------------------------------------------
This file contains:
	- the newRouter function
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #35 : Add something to draw polylines on the map.
	- v1.3.0:
		- Reviewed way of working to use Promise
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- splitted with WaypointEditor
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191122
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

'use strict';

export { newRouter };

import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { g_ErrorEditor } from '../core/ErrorEditor.js';
import { g_RouteEditor } from '../core/RouteEditor.js';
import { newGeometry } from '../util/Geometry.js';

var s_RequestStarted = false;

/*
--- newRouter function --------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newRouter ( ) {
	
	/*
	--- m_HaveValidWayPoints function ---------------------------------------------------------------------------------

	This function verify that the waypoints have coordinates

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_HaveValidWayPoints ( ) {
		return g_TravelNotesData.travel.editedRoute.wayPoints.forEach ( 
			function ( wayPoint, result ) {
				if ( null === result ) { 
					result = true;
				}
				result &= ( ( 0 !== wayPoint.lat ) &&  ( 0 !== wayPoint.lng ) );
				return result;
			}
		);
	}
	
	/*
	--- m_EndError function -------------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_EndError ( message ) {

		s_RequestStarted = false;

		g_ErrorEditor ( ).showError ( message );
	}

	/*
	--- m_EndOk function ----------------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_EndOk ( ) {

		s_RequestStarted = false;

		// since v1.4.0 we consider that the L.latLng.distanceTo ( ) function is the only
		// valid function to compute the distances. So all distances are always 
		// recomputed with this function.
		
		g_RouteEditor.computeRouteDistances ( g_TravelNotesData.travel.editedRoute );

		// Placing the waypoints on the itinerary
		let wayPointsIterator = g_TravelNotesData.travel.editedRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done )
		{
			if ( wayPointsIterator.first ) {
				wayPointsIterator.value.latLng = g_TravelNotesData.travel.editedRoute.itinerary.itineraryPoints.first.latLng;
			}
			else if ( wayPointsIterator.last ) {
				wayPointsIterator.value.latLng = g_TravelNotesData.travel.editedRoute.itinerary.itineraryPoints.last.latLng;
			}
			else{
				wayPointsIterator.value.latLng = newGeometry ( ).getClosestLatLngDistance ( g_TravelNotesData.travel.editedRoute, wayPointsIterator.value.latLng ).latLng;
			}
		}	
		
		// and calling the route editor for displaying the results
		g_RouteEditor.endRouting ( );
	}
	
	/*
	--- m_StartRouting function ---------------------------------------------------------------------------------------

		This function start the routing :-)

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_StartRouting ( ) {

		// We verify that another request is not loaded
		if ( s_RequestStarted ) {
			return false;
		}
		
		// Control of the wayPoints
		if ( ! m_HaveValidWayPoints ( ) ) {
			return false;
		}
		
		s_RequestStarted = true;

		// Choosing the correct route provider
		let routeProvider = g_TravelNotesData.providers.get ( g_TravelNotesData.routing.provider.toLowerCase ( ) );

		// provider name and transit mode are added to the road
		g_TravelNotesData.travel.editedRoute.itinerary.provider = routeProvider.name;
		g_TravelNotesData.travel.editedRoute.itinerary.transitMode = g_TravelNotesData.routing.transitMode;

		routeProvider.getPromiseRoute ( g_TravelNotesData.travel.editedRoute, null ).then (  m_EndOk, m_EndError  );

		return true;
	}

	/*
	--- Router object -------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			startRouting : ( ) => { return m_StartRouting ( ); }
		}
	);
}

/*
--- End of Router.js file ---------------------------------------------------------------------------------------------
*/