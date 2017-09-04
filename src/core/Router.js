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

	var _RouteProvider = require ( './DefaultRouteProvider' ) ( );
	var _RequestStarted = false;
	
	var getRouter = function ( ) {

		var _Route = null;

		var _HaveValidWayPoints = function ( ) {
			var haveLatLng = function ( wayPoint, result ) {
				if ( null === result ) { 
					result = true;
				}
				result &= ( ( 0 !== wayPoint.lat ) &&  ( 0 !== wayPoint.lng ) );
				return result;
			};
			
			return _Route.wayPoints.forEach ( haveLatLng );
		};
		
		var _ParseResponse = function ( requestResponse ) {

			console.log ( _Route.object );

			_RouteProvider.parseResponse ( requestResponse, _Route );

			console.log ( _Route.object );

			_RequestStarted = false;
		};
		
		var _ParseError = function ( status, statusText ) {
			_RequestStarted = false;
			console.log ( "Response status: %d (%s)", status, statusText);
		};
		
		var _StartRequest = function ( ) {

			/*
			_RequestStarted = true;
			_RouteProvider.getUrl ( _Route.wayPoints );
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
				_RouteProvider.getUrl ( _Route.wayPoints ),
				true
			);
			xmlHttpRequest.send ( null );
			*/
			_ParseResponse ( '{"code":"Ok","waypoints":[{"hint":"cdo8ho3aPIYrAAAAAQAAAEkAAAAAAAAAKwAAAAEAAABJAAAAAAAAAF_bAAB911MAZ7YCA6DXUwA-tgIDAwDfA3NqiII=","location":[5.494653,50.509415],"name":"Chemin du Sârtê"},{"hint":"Ug4fhmbaPIYDAAAAOgAAAAAAAAAAAAAAAwAAADoAAAAAAAAAAAAAAF_bAAAS01MAJq4CAxnTUwAqrgIDAACvCHNqiII=","location":[5.493522,50.507302],"name":"Chemin des Patars"}],"routes":[{"legs":[{"steps":[{"intersections":[{"out":0,"entry":[true],"location":[5.494653,50.509415],"bearings":[242]}],"geometry":"mezi_ByvjnIxKjd@rExTdInU|GjL","duration":17.5,"distance":128.6,"name":"Chemin du Sârtê","weight":17.5,"mode":"driving","maneuver":{"bearing_after":242,"location":[5.494653,50.509415],"type":"depart","bearing_before":0,"modifier":"left"}},{"intersections":[{"out":1,"in":0,"entry":[false,true,true],"location":[5.493132,50.508798],"bearings":[45,135,315]}],"geometry":"{~xi_BwwgnIdFgMjUc`@vHoNpEyOzAoOlCuI","duration":27.9,"distance":156.1,"name":"Basse Voie","weight":27.9,"mode":"driving","maneuver":{"bearing_after":127,"location":[5.493132,50.508798],"type":"turn","bearing_before":222,"modifier":"left"}},{"intersections":[{"out":1,"in":2,"entry":[true,true,false],"location":[5.494842,50.507947],"bearings":[60,240,300]}],"geometry":"uiwi_BsbknIr@rA~ClI~^xfA","duration":16.6,"distance":118.2,"name":"Chemin des Patars","weight":16.6,"mode":"driving","maneuver":{"bearing_after":233,"location":[5.494842,50.507947],"type":"turn","bearing_before":122,"modifier":"right"}},{"intersections":[{"out":1,"in":0,"entry":[false,true,true],"location":[5.493484,50.507329],"bearings":[60,135,240]}],"geometry":"acvi_BwmhnIt@kA","duration":0.3,"distance":4,"name":"Chemin des Patars","weight":0.3,"mode":"driving","maneuver":{"bearing_after":137,"location":[5.493484,50.507329],"type":"continue","bearing_before":234,"modifier":"left"}},{"intersections":[{"in":0,"entry":[true],"location":[5.493522,50.507302],"bearings":[318]}],"geometry":"kavi_BcphnI","duration":0,"distance":0,"name":"Chemin des Patars","weight":0,"mode":"driving","maneuver":{"bearing_after":0,"bearing_before":138,"type":"arrive","location":[5.493522,50.507302]}}],"weight":62.3,"distance":406.9,"annotation":{"distance":[48.053484,27.357381,31.25925,21.957237,20.584292,54.690544,24.674083,22.326272,19.362671,14.445628,4.146022,14.789333,99.242275,4.030407]},"summary":"Chemin du Sârtê, Basse Voie","duration":62.3}],"weight_name":"routability","geometry":"mezi_ByvjnIxKjd@rExTdInU|GjLdFgMjUc`@vHoNpEyOzAoOlCuIr@rA~ClI~^xfAt@kA","weight":62.3,"distance":406.9,"duration":62.3}]}' );
			
		};
		
		var _StartRouting = function ( route ) {

			if ( _RequestStarted ) {
				return;
			}
			
			_Route = route;
			if ( ! _HaveValidWayPoints ( ) ) {
				return;
			}
			_StartRequest ( );
		};
	
		return {
			startRouting : function ( route ) {
				_StartRouting ( route );
			}
			
			
			
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRouter;
	}

}());
