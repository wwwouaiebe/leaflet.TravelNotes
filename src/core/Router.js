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
--- Router.js file -------------------------------------------------------------------------------------------------
This file contains:
	- the Router object
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
Doc reviewed 20181218
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/


( function ( ){
	
	'use strict';

	var s_RequestStarted = false;

	var g_TravelNotesData = require ( '../L.TravelNotes' );
	
	/*
	--- router function -----------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var router = function ( ) {
		
		/*
		--- m_HaveValidWayPoints function ------------------------------------------------------------------------------

		This function verify that the waypoints have coordinates

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_HaveValidWayPoints = function ( ) {
			return g_TravelNotesData.editedRoute.wayPoints.forEach ( 
				function ( wayPoint, result ) {
					if ( null === result ) { 
						result = true;
					}
					result &= ( ( 0 !== wayPoint.lat ) &&  ( 0 !== wayPoint.lng ) );
					return result;
				}
			);
		};
		
		/*
		--- m_EndError function ---------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_EndError = function ( message ) {

			s_RequestStarted = false;

			require ( '../core/ErrorEditor' ) ( ).showError ( message );
		};
	
		/*
		--- m_EndOk function -----------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_EndOk = function ( message ) {

			s_RequestStarted = false;
			
			// Computing the distance between itineraryPoints if not know ( depending of the provider...)
			var itineraryPointsIterator = g_TravelNotesData.editedRoute.itinerary.itineraryPoints.iterator;
			var routeDistance = 0;
			var dummy = itineraryPointsIterator.done;
			var previousPoint = itineraryPointsIterator.value;
			while ( ! itineraryPointsIterator.done ) {
				if ( 0 === previousPoint.distance ) {
					previousPoint.distance = L.latLng ( previousPoint.latLng ).distanceTo ( L.latLng ( itineraryPointsIterator.value.latLng ));
				}
				routeDistance += previousPoint.distance;
				previousPoint = itineraryPointsIterator.value;
			}

			// Computing the complete route distance and duration based on the values given by the providers in the maneuvers
			//var routeDistance = g_TravelNotesData.editedRoute.distance;
			g_TravelNotesData.editedRoute.distance = 0;
			g_TravelNotesData.editedRoute.duration = 0;
			var maneuverIterator = g_TravelNotesData.editedRoute.itinerary.maneuvers.iterator;
			while ( ! maneuverIterator.done ) {
				g_TravelNotesData.editedRoute.distance += maneuverIterator.value.distance;
				g_TravelNotesData.editedRoute.duration += maneuverIterator.value.duration;
			}
			
			if ( 0 != g_TravelNotesData.editedRoute.distance ) {
				// Computing a correction factor for distance betwwen itinerayPoints
				var correctionFactor = g_TravelNotesData.editedRoute.distance / routeDistance;
				itineraryPointsIterator = g_TravelNotesData.editedRoute.itinerary.itineraryPoints.iterator;
				while ( ! itineraryPointsIterator.done ) {
					itineraryPointsIterator.value.distance *= correctionFactor;
				}
			}
			else {
				g_TravelNotesData.editedRoute.distance = routeDistance;
			}

			// Placing the waypoints on the itinerary
			var wayPointsIterator = g_TravelNotesData.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done )
			{
				if ( wayPointsIterator.first ) {
					wayPointsIterator.value.latLng = g_TravelNotesData.editedRoute.itinerary.itineraryPoints.first.latLng;
				}
				else if ( wayPointsIterator.last ) {
					wayPointsIterator.value.latLng = g_TravelNotesData.editedRoute.itinerary.itineraryPoints.last.latLng;
				}
				else{
					wayPointsIterator.value.latLng = require ( './RouteEditor' ) ( ).getClosestLatLngDistance ( g_TravelNotesData.editedRoute, wayPointsIterator.value.latLng ).latLng;
				}
			}	
			
			// and calling the route editor for displaying the results
			require ( './RouteEditor' ) ( ).endRouting ( );
		};
		
		/*
		--- m_StartRouting function -----------------------------------------------------------------------------------

			This function start the routing :-)

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_StartRouting = function ( ) {

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
			var routeProvider = g_TravelNotesData.providers.get ( g_TravelNotesData.routing.provider );

			// provider name and transit mode are added to the road
			g_TravelNotesData.editedRoute.itinerary.provider = routeProvider.name;
			g_TravelNotesData.editedRoute.itinerary.transitMode = g_TravelNotesData.routing.transitMode;

			routeProvider.getPromiseRoute ( g_TravelNotesData.editedRoute, null ).then (  m_EndOk, m_EndError  );

			return true;
		};
	
		/*
		--- Router object ---------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{
				startRouting : function ( ) { return m_StartRouting ( );
				}
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = router;
	}

}());

/*
--- End of Router.js file ---------------------------------------------------------------------------------------------
*/