/*
Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/

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
		- Issue ♯65 : Time to go to ES6 modules?
		- Issue ♯68 : Review all existing promises.
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v2.0.0:
		- Issue ♯138 : Protect the app - control html entries done by user.
		- Issue ♯148 : Nominatim gives bad responses for cities... find a temporary solution.
	- v2.2.0:
		- Issue ♯64 : Improve geocoding
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file GeoCoder.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
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
@property {boolean} statusOk A status indicating that all the requests are executed correctly

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module coreLib
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import OverpassAPIDataLoader from '../coreLib/OverpassAPIDataLoader.js';
import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';

import { ZERO, ONE, HTTP_STATUS_OK } from '../main/Constants.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class GeoCoder
@classdesc This class call Nominatim and parse the response
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class GeoCoder {

	#nominatimStatusOk = true;

	#queryDistance = Math.max (
		theConfig.geoCoder.distances.hamlet,
		theConfig.geoCoder.distances.village,
		theConfig.geoCoder.distances.city,
		theConfig.geoCoder.distances.town
	);

	#latLng = null;

	#overpassAPIDataLoader = null;

	#nominatimData = null;

	/**
	this method merge the data from Nominatim and theOverpassAPI
	@private
	*/

	#mergeData ( ) {
		let city = null;
		if ( this.#overpassAPIDataLoader.city ) {
			city = this.#overpassAPIDataLoader.city;
			if ( this.#overpassAPIDataLoader.place ) {
				city += ' (' + this.#overpassAPIDataLoader.place + ')';
			}
			if ( ! city ) {
				city = this.#overpassAPIDataLoader.country;
			}
		}
		let street = null;
		let nameDetails = null;
		if ( this.#nominatimData ) {
			street = this.#nominatimData.street;
			nameDetails = this.#nominatimData.nameDetails || '';
			if ( ! city ) {
				city = this.#nominatimData.country;
			}
		}

		city = city || '';
		street = street || '';
		nameDetails = nameDetails || '';

		if ( street.includes ( nameDetails ) || city.includes ( nameDetails ) ) {
			nameDetails = '';
		}

		return Object.freeze (
			{
				name : theHTMLSanitizer.sanitizeToJsString ( nameDetails ),
				street : theHTMLSanitizer.sanitizeToJsString ( street ),
				city : theHTMLSanitizer.sanitizeToJsString ( city ),
				statusOk : this.#nominatimStatusOk // && this.#overpassAPIDataLoader.statusOk
			}
		);
	}

	/**
	This method...
	@private
	*/

	#parseNominatimData ( nominatimData ) {
		let street = '';
		if ( nominatimData.error ) {
			this.#nominatimStatusOk = false;
		}
		else {

			// street
			if ( nominatimData.address.house_number ) {
				street += nominatimData.address.house_number + ' ';
			}
			if ( nominatimData.address.road ) {
				street += nominatimData.address.road + ' ';
			}
			else if ( nominatimData.address.pedestrian ) {
				street += nominatimData.address.pedestrian + ' ';
			}
			this.#nominatimData = {
				street : street,
				nameDetails : nominatimData.namedetails.name,
				country : nominatimData.address.country
			};
		}
	}

	/**
	This method...
	@private
	*/

	async #loadNominatimData ( ) {
		let nominatimUrl =
			theConfig.nominatim.url + 'reverse?format=json&lat=' +
			this.#latLng [ ZERO ] + '&lon=' + this.#latLng [ ONE ] +
			'&zoom=18&addressdetails=1&namedetails=1';
		let nominatimLanguage = theConfig.nominatim.language;
		if ( nominatimLanguage && '*' !== nominatimLanguage ) {
			nominatimUrl += '&accept-language=' + nominatimLanguage;
		}
		let nominatimHeaders = new Headers ( );
		if ( nominatimLanguage && '*' === nominatimLanguage ) {
			nominatimHeaders.append ( 'accept-language', '' );
		}

		let nominatimResponse = await fetch ( nominatimUrl, { headers : nominatimHeaders } );
		if (
			HTTP_STATUS_OK === nominatimResponse.status
			&&
			nominatimResponse.ok
		) {
			this.#nominatimStatusOk = this.#nominatimStatusOk && true;
			let nominatimData = await nominatimResponse.json ( );
			this.#parseNominatimData ( nominatimData );
		}
		else {
			this.#nominatimStatusOk = false;
		}
	}

	/**
	This method...
	@private
	*/

	#getOverpassQueries ( ) {
		return [
			'is_in(' + this.#latLng [ ZERO ] + ',' + this.#latLng [ ONE ] +
			')->.e;area.e[admin_level][boundary="administrative"];out;' +
			'node(around:' + this.#queryDistance + ',' + this.#latLng [ ZERO ] + ',' + this.#latLng [ ONE ] +
			')[place];out;'
		];
	}

	async #execGetAddress ( ) {
		this.#nominatimStatusOk = true;
		this.#nominatimData = null;
		this.#overpassAPIDataLoader = new OverpassAPIDataLoader (
			{ searchWays : false, searchRelations : false, setGeometry : true }
		);
		await this.#overpassAPIDataLoader.loadData ( this.#getOverpassQueries ( ), this.#latLng );
		await this.#loadNominatimData ( );
		return this.#mergeData ( );
	}

	async #exeGetAdressWithPromise ( onOk, onError ) {
		let result = await this.#execGetAddress ( );
		if ( result.statusOk ) {
			onOk ( result );
		}
		else {
			onError ( 'An error occurs...' );
		}
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	This method search an address from a latitude and longitude
	@param {Array.<number>} latLng the latitude and longitude to be used to search the address
	@return {GeoCoderAddress} the address at the given point. The GeoCoderAddress.statusOk must be verified
	before using the data.
	*/

	async getAddressAsync ( latLng ) {
		this.#latLng = latLng;
		return this.#execGetAddress ( );
	}

	getAddressWithPromise ( latLng ) {
		this.#latLng = latLng;
		return new Promise ( ( onOk, onError ) => this.#exeGetAdressWithPromise ( onOk, onError ) );
	}

}
export default GeoCoder;

/*
--- End of GeoCoder.js file ---------------------------------------------------------------------------------------------------
*/