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
	var _DataManager = require ( '../data/DataManager' ) ( );
	
	var GeoCoder = function ( ) {

		return {
			
			getAddress : function ( lat, lng, callback, context ) {
				if ( _RequestStarted ) {
					return;
				}
				_RequestStarted = true;
				var NominatimUrl = 
					'http://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&zoom=18&addressdetails=1&accept-language=' + _DataManager.config.language;
				var XmlHttpRequest = new XMLHttpRequest ( );
				XmlHttpRequest.onreadystatechange = function ( ) { 
					if ( XmlHttpRequest.readyState == 4 && XmlHttpRequest.status == 200 ) {
						_RequestStarted = false;
						var address = '';
						// The Nominatim response is parsed
						var response;
						try {
							response = JSON.parse( this.responseText );
console.log ( response );
						}
						catch ( e ) {
							return;
						}
						// House number is added
						if ( undefined !== response.address.house_number ) {
							address += response.address.house_number + ' ';
						}
						// Street name...
						if ( undefined !== response.address.road ) {
							address += response.address.road + ' ';
						}
						// or pedestrian name is added
						else if ( undefined !== response.address.pedestrian ) {
							address += response.address.pedestrian + ' ';
						}
						// City name. This can be 'village' or 'town' or 'city' in the Nomination response!
						if ( undefined !== response.address.village ) {
							address += response.address.village;
						}
						else if ( undefined !== response.address.town ) {
							address += response.address.town;
						}
						else if ( undefined !== response.address.city ) {
							address += response.address.city;
						}
						// If nothing found previously, the country is added
						if ( 0 === address.length ) {
							address += response.address.country;
						}
						callback.call ( context, address );
					}
				};  
				XmlHttpRequest.open ( "GET", NominatimUrl, true );
				XmlHttpRequest.send ( null );
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = GeoCoder;
	}

}());
