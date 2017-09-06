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

	var _RouteProvider = require ( './MapboxRouteProvider' ) ( );
	var _RequestStarted = false;
	
	var getRouter = function ( ) {

		var _HaveValidWayPoints = function ( ) {
			return global.editedRoute.wayPoints.forEach ( 
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

			_RouteProvider.parseResponse ( requestResponse, global.editedRoute );
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
				_RouteProvider.getUrl ( global.editedRoute.wayPoints, providerKey ),
				true
			);
			xmlHttpRequest.send ( null );
		};
		
		var _StartRouting = function ( ) {
			if ( _RequestStarted ) {
				return;
			}
			if ( ! _HaveValidWayPoints ( ) ) {
				return;
			}
			_StartRequest ( );
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
