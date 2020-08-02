/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
Doc reviewed 20200802
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file GeoCoder.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} GeoCoderAddress
@desc An address
@property {string} name The name of the point or an empty string
@property {string} street The house number and the street of the point or an empty string
@property {string} city The city of the point or an empty string

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module GeoCoder
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { newHttpRequestBuilder } from '../util/HttpRequestBuilder.js';
import { theConfig } from '../data/Config.js';
import { ZERO, ONE } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function myNewGeoCoder
@desc constructor for GeoCoder objects
@return {GeoCoder} an instance of GeoCoder object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function myNewGeoCoder ( ) {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class GeoCoder
	@classdesc This class call Nominatim and parse the response
	@see {@link newGeoCoder} for constructor
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class GeoCoder {

		/**
		Parse the Nominatim response
		@param {Object} geoCoderResponse the response from Nominatim
		@return {GeoCoderAddress} the name and address of the point
		*/

		parseResponse ( geoCoderData ) {
			let street = '';
			let namedetails = '';
			let city = '';
			if ( ! geoCoderData.error ) {

				// street
				if ( geoCoderData.address.house_number ) {
					street += geoCoderData.address.house_number + ' ';
				}
				if ( geoCoderData.address.road ) {
					street += geoCoderData.address.road + ' ';
				}
				else if ( geoCoderData.address.pedestrian ) {
					street += geoCoderData.address.pedestrian + ' ';
				}

				// city
				if ( geoCoderData.address.village ) {
					city = geoCoderData.address.village;
				}
				else if ( geoCoderData.address.town ) {
					city = geoCoderData.address.town;
				}
				else if ( geoCoderData.address.city ) {
					city = geoCoderData.address.city;
				}

				// country
				if ( '' === street && '' === city ) {
					street = geoCoderData.address.country;
				}

				// name
				namedetails = geoCoderData.namedetails.name || '';
				if ( street.includes ( namedetails ) || city.includes ( namedetails ) ) {
					namedetails = '';
				}
			}

			return {
				name : namedetails,
				street : street,
				city : city
			};
		}

		/**
		get a Promise that will search an address from a point
		@param {Array.<number>} latLng the lat and lng of the point for witch the address is searched
		@return {Promise} a Promise that fulfill with the Nominatim response
		*/

		getPromiseAddress ( latLng ) {
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
	}

	return Object.seal ( new GeoCoder );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newGeoCoder
	@desc constructor for GeoCoder objects
	@return {GeoCoder} an instance of GeoCoder object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	myNewGeoCoder as newGeoCoder
};

/*
--- End of GeoCoder.js file ---------------------------------------------------------------------------------------------------
*/