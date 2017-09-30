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
--- GeoCoder.js file --------------------------------------------------------------------------------------------------
This file contains:
	- the GeoCoder object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
Doc reviewed 20170927
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var _RequestStarted = false;
	
	var GeoCoder = function ( ) {

		return {
			
			getAddress : function ( lat, lng, callback, context, parameter ) {
				if ( _RequestStarted ) {
					return;
				}
				_RequestStarted = true;
				var NominatimUrl = 
					'http://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&zoom=18&addressdetails=1&accept-language=' + require ( '../data/DataManager' ) ( ).config.language;
				var XmlHttpRequest = new XMLHttpRequest ( );
				XmlHttpRequest.onreadystatechange = function ( ) { 
					if ( XmlHttpRequest.readyState == 4 && XmlHttpRequest.status == 200 ) {
						_RequestStarted = false;
						var response;
						try {
							response = JSON.parse( this.responseText );
						}
						catch ( e ) {
							return;
						}
						var address = '';
						if ( undefined !== response.address.house_number ) {
							address += response.address.house_number + ' ';
						}
						if ( undefined !== response.address.road ) {
							address += response.address.road + ' ';
						}
						else if ( undefined !== response.address.pedestrian ) {
							address += response.address.pedestrian + ' ';
						}
						if ( undefined !== response.address.village ) {
							address += response.address.village;
						}
						else if ( undefined !== response.address.town ) {
							address += response.address.town;
						}
						else if ( undefined !== response.address.city ) {
							address += response.address.city;
						}
						if ( 0 === address.length ) {
							address += response.address.country;
						}
						callback.call ( context, address, parameter );
					}
				};  
				XmlHttpRequest.open ( "GET", NominatimUrl, true );
				XmlHttpRequest.send ( null );
			}
		};
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = GeoCoder;
	}

}());

/*
--- End of GeoCoder.js file -------------------------------------------------------------------------------------------
*/