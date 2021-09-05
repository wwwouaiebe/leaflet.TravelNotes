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
		- Issue ♯65 : Time to go to ES6 modules?
	- v2.4.0:
		- Issue ♯174 : UUID generator is not rfc 4122 compliant
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
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

@module UILib

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTranslator from '../UILib/Translator.js';
import { LAT_LNG, ZERO, ONE, TWO, THREE, HEXADECIMAL, DISTANCE } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class Utilities
@classdesc This class contains utility methods
@see {@link theUtilities} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class Utilities {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	Gives an UUID conform to the rfc 4122 section 4.4
	*/

	get UUID ( ) {
		const UUID_LENGHT = 16;
		const UUID_STRLENGHT = 2;
		let randomValues = new Uint8Array ( UUID_LENGHT );
		const UUID_SEPARATORS = [ '', '', '', '-', '', '-', '', '-', '', '-', '', '', '', '', '', '' ];

		window.crypto.getRandomValues ( randomValues );

		/* eslint-disable no-bitwise */
		/* eslint-disable no-magic-numbers */
		/*
		rfc 4122 section 4.4 : Set the four most significant bits (bits 12 through 15) of the
		time_hi_and_version field to the 4-bit version number from section 4.1.3.
		*/

		randomValues [ 6 ] = ( randomValues [ 6 ] & 0x0f ) | 0x40;

		/*
		rfc 4122 section 4.4 : Set the two most significant bits (bits 6 and 7) of the
		clock_seq_hi_and_reserved to zero and one, respectively.
		*/

		randomValues [ 8 ] = ( randomValues [ 8 ] & 0x3f ) | 0x80;
		/* eslint-enable no-bitwise */
		/* eslint-enable no-magic-numbers */

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
	Open a file
	@param {function} eventListener a change event listener to use when the file is opened

	*/

	openFile ( eventListener, acceptFileType ) {
		let openFileInput = document.createElement ( 'input' );
		openFileInput.type = 'file';
		if ( acceptFileType ) {
			openFileInput.accept = acceptFileType;
		}
		openFileInput.addEventListener (
			'change',
			eventListener,
			false
		);
		openFileInput.click ( );
	}

	/**
	Save a string to a file
	@param {string} fileName The file name
	@param {string} fileContent The file content
	@param {?string} fileMimeType The mime type of the file. Default to 'text/plain'
	*/

	saveFile ( fileName, fileContent, fileMimeType ) {
		try {
			let objURL = null;
			if ( fileMimeType ) {
				objURL = window.URL.createObjectURL (
					new File ( [ fileContent ], fileName, { type : fileMimeType } )
				);
			}
			else {
				objURL = URL.createObjectURL ( fileContent );
			}
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

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of Utilities class
@type {Utilities}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theUtilities = new Utilities ( );

export default theUtilities;

/*
--- End of Utilities.js file --------------------------------------------------------------------------------------------------
*/