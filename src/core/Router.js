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

	var _RouteProvider = global.providers.get ( 'mapbox' );
	var _RequestStarted = false;
	var _DataManager = require ( '../Data/DataManager' ) ( );
	
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
			_RouteProvider.parseResponse ( requestResponse, _DataManager.editedRoute );
			_RequestStarted = false;			
			require ( './RouteEditor' ) ( ).endRouting ( );
		};
		
		var _ParseError = function ( status, statusText ) {
			_RequestStarted = false;
			console.log ( "Response status: %d (%s)", status, statusText);
		};
		
		var _StartRequest = function ( ) {

			_RequestStarted = true;
		
			var providerKey = '';
			if ( require ( '../util/Utilities' ) ( ).storageAvailable ( 'sessionStorage' ) ) {
				providerKey = atob ( sessionStorage.getItem ( _RouteProvider.name ) );
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
				_RouteProvider.getUrl ( _DataManager.editedRoute.wayPoints, providerKey ),
				true
			);
			xmlHttpRequest.send ( null );
			
			//_ParseResponse ('{"waypoints":[{"name":"Rue dèl Creû","location":[5.491895,50.508507]},{"name":"Basse Voie","location":[5.493796,50.508389]}],"routes":[{"legs":[{"steps":[{"intersections":[{"out":0,"entry":[true],"location":[5.491895,50.508507],"bearings":[57]}],"geometry":"ulxi_BmjenImRum@{CkQ","duration":24.8,"distance":85.7,"name":"Rue dèl Creû","weight":50.7,"mode":"driving","maneuver":{"bearing_after":57,"bearing_before":0,"type":"depart","location":[5.491895,50.508507],"instruction":"Head northeast on Rue dèl Creû"}},{"intersections":[{"out":0,"in":1,"entry":[true,false,true],"location":[5.492936,50.508896],"bearings":[135,225,315]},{"out":1,"in":2,"entry":[true,true,false],"location":[5.493132,50.508798],"bearings":[45,135,315]}],"geometry":"_eyi_BokgnIbEgKdFgMjQgZ","duration":18.1,"distance":83.2,"name":"Basse Voie","weight":33.5,"mode":"driving","maneuver":{"bearing_after":127,"location":[5.492936,50.508896],"type":"turn","bearing_before":49,"modifier":"right","instruction":"Turn right onto Basse Voie"}},{"intersections":[{"in":0,"entry":[true],"location":[5.493796,50.508389],"bearings":[317]}],"geometry":"iexi_BgainI","duration":0,"distance":0,"name":"Basse Voie","weight":0,"mode":"driving","maneuver":{"bearing_after":0,"location":[5.493796,50.508389],"type":"arrive","bearing_before":137,"modifier":"right","instruction":"You have arrived at your destination, on the right"}}],"weight":84.2,"distance":168.9,"annotation":{"distance":[63.15520198369543,22.533279297721318,17.6359876189832,20.584291773535234,44.94976490861426]},"summary":"Rue dèl Creû, Basse Voie","duration":42.9}],"weight_name":"routability","geometry":"ulxi_BmjenImRum@{CkQbEgKdFgMjQgZ","weight":84.2,"distance":168.9,"duration":42.9}],"code":"Ok","uuid":"cj79efog600szv1nnqg7kb0ki"}');
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
