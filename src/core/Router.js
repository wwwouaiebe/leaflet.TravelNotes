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

	var _RequestStarted = false;
	var _DataManager = require ( '../Data/DataManager' ) ( );
	var _RouteProvider = _DataManager.providers.get ( 'mapzen' );
	
	var getRouter = function ( ) {

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
		
		var _ParseResponse = function ( requestResponse ) {
			_RouteProvider.parseResponse ( requestResponse, _DataManager.editedRoute, _DataManager.config.language );
			_RequestStarted = false;
			_DataManager.editedRoute.itinerary.provider = _RouteProvider.name;
			_DataManager.editedRoute.itinerary.transitMode = _DataManager.routing.transitMode;
			_DataManager.editedRoute.distance = 0;
			_DataManager.editedRoute.duration = 0;
			
			var maneuverIterator = _DataManager.editedRoute.itinerary.maneuvers.iterator;
			while ( ! maneuverIterator.done ) {
				_DataManager.editedRoute.distance += maneuverIterator.value.distance;
				_DataManager.editedRoute.duration += maneuverIterator.value.duration;
			}

			
			require ( './RouteEditor' ) ( ).endRouting ( );
		};
		
		var _ParseError = function ( status, statusText ) {
			_RequestStarted = false;
			console.log ( "Response status: %d (%s)", status, statusText);
		};
		
		var _StartRequest = function ( ) {
			
			_RouteProvider = _DataManager.providers.get ( _DataManager.routing.provider );

			_RequestStarted = true;

			var providerKey = '';
			if ( require ( '../util/Utilities' ) ( ).storageAvailable ( 'sessionStorage' ) ) {
				providerKey = atob ( sessionStorage.getItem ( _RouteProvider.name.toLowerCase ( ) ) );
			}
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
		
		var _StartRouting = function ( ) {
			if ( _RequestStarted ) {
				return false;
			}
			if ( ! _HaveValidWayPoints ( ) ) {
				return false;
			}
			_StartRequest ( );
			
			return true;
		};
	
		return {
			startRouting : function ( ) {
				_StartRouting ( );
			}
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRouter;
	}

}());
