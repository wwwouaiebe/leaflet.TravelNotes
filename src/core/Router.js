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
Doc reviewed 20170928
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/


( function ( ){
	
	'use strict';

	var _RequestStarted = false;
	var _RouteProvider = null;

	var _DataManager = require ( '../Data/DataManager' ) ( );
	var _Translator = require( '../UI/Translator' ) ( );
	
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
		--- _ParseResponse function -----------------------------------------------------------------------------------

		This function parse the provider response

		---------------------------------------------------------------------------------------------------------------
		*/

		var _ParseResponse = function ( requestResponse ) {

			_RequestStarted = false;
			// the response is passed to the routeProvider object for parsing. 
			if ( ! _RouteProvider.parseResponse ( requestResponse, _DataManager.editedRoute, _DataManager.config.language ) ) {
				require ( '../core/ErrorEditor' ) ( ).showError ( _Translator.getText ( 'Router - An error occurs when parsing the response' ) );
				return;
			}
			
			// provider name and transit mode are added to the road
			_DataManager.editedRoute.itinerary.provider = _RouteProvider.name;
			_DataManager.editedRoute.itinerary.transitMode = _DataManager.routing.transitMode;

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
			
			// Computing the complete route distance ad duration based on the values given by the providers in the maneuvers
			_DataManager.editedRoute.distance = 0;
			_DataManager.editedRoute.duration = 0;
			var maneuverIterator = _DataManager.editedRoute.itinerary.maneuvers.iterator;
			while ( ! maneuverIterator.done ) {
				_DataManager.editedRoute.distance += maneuverIterator.value.distance;
				_DataManager.editedRoute.duration += maneuverIterator.value.duration;
			}

			// Computing a correction factor for distance betwwen itinerayPoints
			var correctionFactor = _DataManager.editedRoute.distance / routeDistance;
			itineraryPointsIterator = _DataManager.editedRoute.itinerary.itineraryPoints.iterator;
			while ( ! itineraryPointsIterator.done ) {
				itineraryPointsIterator.value.distance *= correctionFactor;
			}

			// and calling the route editor for displaying the results
			require ( './RouteEditor' ) ( ).endRouting ( );
		};
		
		/*
		--- _ParseError function --------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _ParseError = function ( status, statusText ) {
			_RequestStarted = false;
			require ( '../core/ErrorEditor' ) ( ).showError ( _Translator.getText ( 'Router - An error occurs when sending the request', {status : status, statusText : statusText} ) );
		};
		
		/*
		--- _StartRequest function ------------------------------------------------------------------------------------

		This function launch the http request

		---------------------------------------------------------------------------------------------------------------
		*/

		var _StartRequest = function ( ) {
			
			_RequestStarted = true;

			// Choosing the correct route provider
			_RouteProvider = _DataManager.providers.get ( _DataManager.routing.provider );

			// Searching the provider key
			var providerKey = '';
			if ( require ( '../util/Utilities' ) ( ).storageAvailable ( 'sessionStorage' ) ) {
				providerKey = atob ( sessionStorage.getItem ( _RouteProvider.name.toLowerCase ( ) ) );
			}
			
			// creating the http request
			var xmlHttpRequest = new XMLHttpRequest ( );
			xmlHttpRequest.onreadystatechange = function ( event ) {
				if ( this.readyState === XMLHttpRequest.DONE ) {
					if ( this.status === 200 ) {
						_ParseResponse ( this.responseText );
					} 
					else {
						_ParseError ( this.status, this.statusText );
					}
				}
			};
			xmlHttpRequest.open ( 
				'GET',
				_RouteProvider.getUrl ( _DataManager.editedRoute.wayPoints, _DataManager.routing.transitMode, providerKey, _DataManager.config.language, null ),
				true
			);
			xmlHttpRequest.send ( null );
		};
		
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
			
			
			// Controle of the wayPoints
			if ( ! _HaveValidWayPoints ( ) ) {
				return false;
			}
			
			_StartRequest ( );

			return true;
		};
	
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