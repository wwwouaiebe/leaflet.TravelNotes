/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- Working with Promise
		- returning the complete Nominatim responce in place of a computed address
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var s_RequestStarted = false;
	
	var GeoCoder = function ( ) {
	
		var m_ObjId = -1;
		var m_Lat = 0;
		var m_Lng = 0;

		/*
		--- m_StartXMLHttpRequest function -----------------------------------------------------------------------------

		This function start the http request to OSM

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_StartXMLHttpRequest = function ( returnOnOk, returnOnError ) {

			var xmlHttpRequest = new XMLHttpRequest ( );
			xmlHttpRequest.timeout = require ( '../L.TravelNotes' ).config.note.svgTimeOut;
			
			xmlHttpRequest.ontimeout = function ( event ) {
				returnOnError ( 'TimeOut error' );
			};

			xmlHttpRequest.onreadystatechange = function ( ) { 
				if ( xmlHttpRequest.readyState == 4 ) {
					if ( xmlHttpRequest.status == 200 ) {
						s_RequestStarted = false;
						var response;
						try {
							response = JSON.parse( this.responseText );
						}
						catch ( e ) {
							s_RequestStarted = false;
							returnOnError ( 'Parsing error' );
						}
						s_RequestStarted = false;
						response.objId = m_ObjId;
						returnOnOk ( response );	
					}
					else {
						s_RequestStarted = false;
						returnOnError ( 'Status : ' + this.status + ' statusText : ' + this.statusText );
					}
				}
			};  
			var NominatimUrl = 
				require ( '../L.TravelNotes' ).config.nominatim.url + 'reverse?format=json&lat=' + 
				m_Lat + '&lon=' + m_Lng + 
				'&zoom=18&addressdetails=1';
			var nominatimLanguage = require ( '../L.TravelNotes' ).config.nominatim.language;
			if (  nominatimLanguage && nominatimLanguage !== '*' ) {
				NominatimUrl += '&accept-language=' + nominatimLanguage;
			}
			xmlHttpRequest.open ( "GET", NominatimUrl, true );
			if (  nominatimLanguage && nominatimLanguage === '*' ) {
				xmlHttpRequest.setRequestHeader ( 'accept-language', '' );
			}
			xmlHttpRequest.overrideMimeType ( 'application/json' );
			xmlHttpRequest.send ( null );
		};

		/*
		--- End of _StartXMLHttpRequest function ---
		*/

		/*
		--- m_GetPromiseAddress function ------------------------------------------------------------------------------

		This function creates the address promise

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_GetPromiseAddress = function ( lat, lng, objId ) {
			if ( s_RequestStarted ) {
				return Promise.reject ( );
			}
			s_RequestStarted = true;
			
			m_ObjId = objId || -1;
			m_Lat = lat;
			m_Lng = lng;
			
			return new Promise ( m_StartXMLHttpRequest );
		};
		
		/*
		--- End of m_GetPromiseAddress function ---
		*/

		/*
		--- geoCoder object -------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/
		
		return Object.seal (
			{
				getPromiseAddress : function ( lat, lng, objId ) { return m_GetPromiseAddress ( lat, lng, objId ); }				
			}
		);
			
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