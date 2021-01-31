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
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20200825
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Utilities.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module Utilities
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { LAT_LNG, ZERO, ONE, TWO, THREE, HEXADECIMAL, DISTANCE } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class contains utility methods
@see {@link theUtilities} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class Utilities {

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	Gives an UUID
	*/

	get UUID ( ) {
		const UUID_LENGHT = 8;
		const UUID_STRLENGHT = 4;
		let randomValues = new Uint16Array ( UUID_LENGHT );
		const UUID_SEPARATORS = [ '', '-', '-', '-', '-', '', '', '' ];
		window.crypto.getRandomValues ( randomValues );
		let UUID = '';
		for ( let counter = ZERO; counter < UUID_LENGHT; counter ++ ) {
			UUID += randomValues [ counter ].toString ( HEXADECIMAL ).padStart ( UUID_STRLENGHT, '0' ) +
				UUID_SEPARATORS [ counter ];
		}
		return UUID;
	}

	/**
	Test the availibility of the storage
	@param {string} type The type of storage. Must be 'sessionStorage' or 'localStorage'
	*/

	storageAvailable ( type ) {
		try {
			let storage = window [ type ];
			let	testString = '__storage_test__';
			storage.setItem ( testString, testString );
			storage.removeItem ( testString );
			return true;
		}
		catch ( err ) {
			return false;
		}
	}

	/**
	Save a string to a file
	@param {string} fileName The file name
	@param {string} fileContent The file content
	@param {?string} fileMimeType The mime type of the file. Default to 'text/plain'
	*/

	saveFile ( fileName, fileContent, fileMimeType ) {
		try {
			let objURL = window.URL.createObjectURL (
				new File ( [ fileContent ], fileName, { type : fileMimeType || 'text/plain' } )
			);
			let element = document.createElement ( 'a' );
			element.setAttribute ( 'href', objURL );
			element.setAttribute ( 'download', fileName );
			element.click ( );
			window.URL.revokeObjectURL ( objURL );
		}
		catch ( err ) {
			if ( err instanceof Error ) {
				console.error ( err );
			}
		}
	}

	/**
	Transform a time to a string
	@param {number} time The time in seconds
	*/

	formatTime ( time ) {
		const SECOND_IN_DAY = 86400;
		const SECOND_IN_HOUR = 3600;
		const SECOND_IN_MINUT = 60;
		let iTtime = Math.floor ( time );
		if ( ZERO === iTtime ) {
			return '';
		}
		let days = Math.floor ( iTtime / SECOND_IN_DAY );
		let hours = Math.floor ( iTtime % SECOND_IN_DAY / SECOND_IN_HOUR );
		let minutes = Math.floor ( iTtime % SECOND_IN_HOUR / SECOND_IN_MINUT );
		let seconds = Math.floor ( iTtime % SECOND_IN_MINUT );
		if ( ZERO < days ) {
			return days +
				'\u00A0'
				+ theTranslator.getText ( 'Utilities - Day' ) +
				'\u00A0' +
				hours +
				'\u00A0' +
				theTranslator.getText ( 'Utilities - Hour' );
		}
		else if ( ZERO < hours ) {
			return hours +
				'\u00A0'
				+ theTranslator.getText ( 'Utilities - Hour' )
				+ '\u00A0' +
				minutes +
				'\u00A0'
				+ theTranslator.getText ( 'Utilities - Minute' );
		}
		else if ( ZERO < minutes ) {
			return minutes +
				'\u00A0' +
				theTranslator.getText ( 'Utilities - Minute' );
		}
		return seconds + '\u00A0' + theTranslator.getText ( 'Utilities - Second' );
	}

	/**
	Transform a distance to a string
	@param {number} distance The distance in meters
	*/

	formatDistance ( distance ) {
		const DISTANCE_ROUND = 10;

		let iDistance = Math.floor ( distance );
		if ( ZERO >= iDistance ) {
			return '0\u00A0km';
		}
		return Math.floor ( iDistance / DISTANCE.metersInKm ) +
			',' +
			Math.floor ( ( iDistance % DISTANCE.metersInKm ) / DISTANCE_ROUND ).toFixed ( ZERO )
				.padStart ( TWO, '0' )
				.padEnd ( THREE, '0' ) +
			'\u00A0km';
	}

	/**
	Transform a latitude to a string
	@param {number} lat The latitude
	*/

	formatLat ( lat ) {
		return (
			lat > ZERO
				?
				lat.toFixed ( LAT_LNG.fixed ) + '\u00A0N'
				:
				( -lat ).toFixed ( LAT_LNG.fixed ) + '\u00A0S'
		);
	}

	/**
	Transform a longitude to a string
	@param {number} lng The longitude
	*/

	formatLng ( lng ) {
		return (
			lng > ZERO
				?
				lng.toFixed ( LAT_LNG.fixed ) + '\u00A0E'
				:
				( -lng ).toFixed ( LAT_LNG.fixed ) + '\u00A0W'
		);
	}

	/**
	Transform a latitude + longitude to a string
	@param {Array.<number>} latLng The latitude and longitude
	*/

	formatLatLng ( latLng ) {
		if ( ZERO === latLng [ ZERO ] && ZERO === latLng [ ONE ] ) {
			return '';
		}
		return this.formatLat ( latLng [ ZERO ] ) + '\u00A0-\u00A0' + this.formatLng ( latLng [ ONE ] );
	}
}

const OUR_UTILITIES = new Utilities ( );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of Utilities class
	@type {Utilities}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	OUR_UTILITIES as theUtilities
};

/*
--- End of Utilities.js file --------------------------------------------------------------------------------------------------
*/