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
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #68 : Review all existing promises.
Doc reviewed 20191122
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newGeoCoder };
import { newHttpRequestBuilder } from '../util/HttpRequestBuilder.js';
import { g_Config } from '../data/Config.js';

function newGeoCoder ( ) {

	/*
	--- m_GetPromiseAddress function ----------------------------------------------------------------------------------

	This function creates the address promise

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetPromiseAddress ( latLng ) {

		let NominatimUrl =
			g_Config.nominatim.url + 'reverse?format=json&lat=' +
			latLng [ 0 ] + '&lon=' + latLng [ 1 ] +
			'&zoom=18&addressdetails=1';
		let nominatimLanguage = g_Config.nominatim.language;
		if (  nominatimLanguage && nominatimLanguage !== '*' ) {
			NominatimUrl += '&accept-language=' + nominatimLanguage;
		}
		let requestHeaders = null;

		if (  nominatimLanguage && nominatimLanguage === '*' ) {
			requestHeaders = [ { headerName : 'accept-language', headerValue : '' } ];
		}

		return newHttpRequestBuilder ( ).getJsonPromise ( NominatimUrl, requestHeaders );
	}

	/*
	--- End of m_GetPromiseAddress function ---
	*/

	/*
	--- geoCoder object -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			getPromiseAddress : ( latLng ) => { return m_GetPromiseAddress ( latLng ); }
		}
	);

}

/*
--- End of GeoCoder.js file -------------------------------------------------------------------------------------------
*/