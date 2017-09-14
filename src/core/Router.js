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
	var _Config = require ( '../util/Config' ) ( );
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
			_RouteProvider.parseResponse ( requestResponse, _DataManager.editedRoute, _Config.language );
			_RequestStarted = false;			
			require ( './RouteEditor' ) ( ).endRouting ( );
		};
		
		var _ParseError = function ( status, statusText ) {
			_RequestStarted = false;
			console.log ( "Response status: %d (%s)", status, statusText);
		};
		
		var _StartRequest = function ( ) {
			
console.log ( _DataManager.routing.provider );
console.log ( _DataManager.routing.transitMode );
			
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
				_RouteProvider.getUrl ( _DataManager.editedRoute.wayPoints, _DataManager.routing.transitMode, providerKey, _Config.language, null ),
				true
			);
			
			xmlHttpRequest.send ( null );

			// GraphHopper:
			//_ParseResponse ('{"hints":{"visited_nodes.average":"16.0","visited_nodes.sum":"16"},"paths":[{"instructions":[{"distance":125.967,"sign":0,"interval":[0,3],"text":"Continuez sur Chemin du Sârtê","time":17441,"street_name":"Chemin du Sârtê"},{"distance":156.064,"sign":-2,"interval":[3,8],"text":"Tournez à gauche sur Basse Voie","time":31212,"street_name":"Basse Voie"},{"distance":255.674,"sign":2,"interval":[8,10],"text":"Tournez à droite sur Chemin des Patars","time":32394,"street_name":"Chemin des Patars"},{"distance":0.0,"sign":4,"interval":[10,10],"text":"Arrivée","time":0,"street_name":""}],"descend":7.1020050048828125,"ascend":2.402008056640625,"distance":537.705,"bbox":[5.491862,50.506651,5.494842,50.509404],"weight":81.048982,"points_encoded":true,"points":"wbhsHidp`@z@tD^fA\\h@Tm@fByCRu@Hu@La@zBnGdCbI","transfers":0,"legs":[],"details":{},"time":81047,"snapped_waypoints":"wbhsHidp`@dPdP"}],"info":{"took":2,"copyrights":["GraphHopper","OpenStreetMap contributors"]}}' );
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
