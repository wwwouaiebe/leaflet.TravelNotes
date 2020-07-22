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
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20191122
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newHttpRequestBuilder } from '../util/HttpRequestBuilder.js';
import { theConfig } from '../data/Config.js';

import { ZERO, ONE } from '../util/Constants.js';

function newGeoCoder ( ) {

	/*
	--- myGetPromiseAddress function ----------------------------------------------------------------------------------

	This function creates the address promise

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetPromiseAddress ( latLng ) {

		let NominatimUrl =
			theConfig.nominatim.url + 'reverse?format=json&lat=' +
			latLng [ ZERO ] + '&lon=' + latLng [ ONE ] +
			'&zoom=18&addressdetails=1&namedetails=1';
		let nominatimLanguage = theConfig.nominatim.language;
		if ( nominatimLanguage && '*' !== nominatimLanguage ) {
			NominatimUrl += '&accept-language=' + nominatimLanguage;
		}
		let requestHeaders = null;

		if ( nominatimLanguage && '*' === nominatimLanguage ) {
			requestHeaders = [ { headerName : 'accept-language', headerValue : '' } ];
		}

		return newHttpRequestBuilder ( ).getJsonPromise ( NominatimUrl, requestHeaders );
	}

	/*
	--- myParseResponse function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myParseResponse ( geoCoderData ) {

		let address = '';
		let namedetails = '';
		if ( ! geoCoderData.error ) {
			if ( geoCoderData.address.house_number ) {
				address += geoCoderData.address.house_number + ' ';
			}
			if ( geoCoderData.address.road ) {
				address += geoCoderData.address.road + ' ';
			}
			else if ( geoCoderData.address.pedestrian ) {
				address += geoCoderData.address.pedestrian + ' ';
			}
			if ( geoCoderData.address.village ) {
				address += geoCoderData.address.village;
			}
			else if ( geoCoderData.address.town ) {
				address += geoCoderData.address.town;
			}
			else if ( geoCoderData.address.city ) {
				address += geoCoderData.address.city;
			}
			if ( ZERO === address.length ) {
				address += geoCoderData.address.country;
			}
			namedetails = geoCoderData.namedetails.name || '';
			if ( address.includes ( namedetails ) ) {
				namedetails = '';
			}
		}

		return {
			name : namedetails,
			address : address
		};
	}

	/*
	--- geoCoder object -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			parseResponse : geoCoderResponse => myParseResponse ( geoCoderResponse ),
			getPromiseAddress : latLng => myGetPromiseAddress ( latLng )
		}
	);

}

export { newGeoCoder };

/*
--- End of GeoCoder.js file -------------------------------------------------------------------------------------------
*/