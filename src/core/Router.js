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
Doc reviewed 20170928
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/


( function ( ){
	
	'use strict';

	var _RequestStarted = false;
	var _RouteProvider = null;

	var _DataManager = require ( '../Data/DataManager' ) ( );
	var _Translator = require ( '../UI/Translator' ) ( );
	
	var Router = function ( ) {
		
		/*
		--- _HaveValidWayPoints function ------------------------------------------------------------------------------

		This function verify that the waypoints have coordinates

		---------------------------------------------------------------------------------------------------------------
		*/

		var _HaveValidWayPoints = function ( ) {
			return _DataManager.editedRoute.wayPoints.forEach ( 
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
		--- End of _HaveValidWayPoints function ---
		*/

		/*
		--- _EndError function -----------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _EndError = function ( message ) {

			_RequestStarted = false;

			require ( '../core/ErrorEditor' ) ( ).showError ( message );
		};
	
		/*
		--- End of _EndError function ---
		*/

		/*
		--- _EndOk function -----------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _EndOk = function ( message ) {

			_RequestStarted = false;
			
			// Computing the distance between itineraryPoints if not know ( depending of the provider...)
			var itineraryPointsIterator = _DataManager.editedRoute.itinerary.itineraryPoints.iterator;
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
			//var routeDistance = _DataManager.editedRoute.distance;
			_DataManager.editedRoute.distance = 0;
			_DataManager.editedRoute.duration = 0;
			var maneuverIterator = _DataManager.editedRoute.itinerary.maneuvers.iterator;
			while ( ! maneuverIterator.done ) {
				_DataManager.editedRoute.distance += maneuverIterator.value.distance;
				_DataManager.editedRoute.duration += maneuverIterator.value.duration;
			}
			
			if ( 0 != _DataManager.editedRoute.distance ) {
				// Computing a correction factor for distance betwwen itinerayPoints
				var correctionFactor = _DataManager.editedRoute.distance / routeDistance;
				itineraryPointsIterator = _DataManager.editedRoute.itinerary.itineraryPoints.iterator;
				while ( ! itineraryPointsIterator.done ) {
					itineraryPointsIterator.value.distance *= correctionFactor;
				}
			}
			else {
				_DataManager.editedRoute.distance = routeDistance;
			}

			// Placing the waypoints on the itinerary
			var wayPointsIterator = _DataManager.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done )
			{
				if ( wayPointsIterator.first ) {
					wayPointsIterator.value.latLng = _DataManager.editedRoute.itinerary.itineraryPoints.first.latLng;
				}
				else if ( wayPointsIterator.last ) {
					wayPointsIterator.value.latLng = _DataManager.editedRoute.itinerary.itineraryPoints.last.latLng;
				}
				else{
					wayPointsIterator.value.latLng = require ( './RouteEditor' ) ( ).getClosestLatLngDistance ( _DataManager.editedRoute, wayPointsIterator.value.latLng ).latLng;
				}
			}	
			
			// and calling the route editor for displaying the results
			require ( './RouteEditor' ) ( ).endRouting ( );
		};
		
		/*
		--- End of _EndOk function ---
		*/
			
		/*
		--- _StartRouting function ------------------------------------------------------------------------------------

			This function start the routing :-)

		---------------------------------------------------------------------------------------------------------------
		*/

		var _StartRouting = function ( ) {

			// We verify that another request is not loaded
			if ( _RequestStarted ) {
				return false;
			}
			
			// Control of the wayPoints
			if ( ! _HaveValidWayPoints ( ) ) {
				return false;
			}
			
			_RequestStarted = true;

			// Choosing the correct route provider
			_RouteProvider = _DataManager.providers.get ( _DataManager.routing.provider );

			// provider name and transit mode are added to the road
			_DataManager.editedRoute.itinerary.provider = _RouteProvider.name;
			_DataManager.editedRoute.itinerary.transitMode = _DataManager.routing.transitMode;

			_RouteProvider.getPromiseRoute ( _DataManager.editedRoute, null ).then (  _EndOk, _EndError  );

			return true;
		};
	
		/*
		--- End of _StartRouting function ---
		*/

		/*
		--- Router object ---------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return {

			/*
			--- startRouting method -----------------------------------------------------------------------------------

			This method start the routing :-)
			
			-----------------------------------------------------------------------------------------------------------
			*/

			startRouting : function ( ) {
				return _StartRouting ( );
			}
		};
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = Router;
	}

}());

/*
--- End of Router.js file ---------------------------------------------------------------------------------------------
*/