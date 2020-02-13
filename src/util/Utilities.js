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
--- Utilities.js file -------------------------------------------------------------------------------------------------
This file contains:
	- the newUtilities function
Changes:
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191122
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';

import { LAT_LNG, ZERO, ONE, TWO } from '../util/Constants.js';

function newUtilities ( ) {

	/*
	--- myGetUUID function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetUUID ( ) {
		function Random4 ( ) {
			const HEXADECIMAL = 16;
			const TWO_EXP_16 = 65536;
			return Math
				.floor ( ( ONE + Math.random ( ) ) * TWO_EXP_16 )
				.toString ( HEXADECIMAL )
				.substring ( ONE );
		}
		return Random4 ( ) +
			Random4 ( ) + '-' +
			Random4 ( ) + '-' +
			Random4 ( ) + '-' +
			Random4 ( ) + '-' +
			Random4 ( ) +
			Random4 ( ) +
			Random4 ( );
	}

	/* --- End of myGetUUID function --- */

	/*
	--- myStorageAvailable function -----------------------------------------------------------------------------------

	This function test if the storage API is available ( the API can be deactived by user....)
	Adapted from MDN :-)

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myStorageAvailable ( type ) {
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

	/* --- End of storageAvailable function --- */

	/*
	--- myFileAPIAvailable function -----------------------------------------------------------------------------------

	This function test if the File API is available

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myFileAPIAvailable ( ) {
		try {

			// FF...
			new File ( [ 'testdata' ], { type : 'text/plain' } );
			return true;
		}
		catch ( err ) {
			if ( window.navigator.msSaveOrOpenBlob ) {

				// edge IE 11...
				return true;
			}
			return false;
		}
	}

	/* --- End of myFileAPIAvailable function --- */

	/*
	--- mySaveFile function -------------------------------------------------------------------------------------------

	This function save data to a local file

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySaveFile ( filename, text, type ) {
		if ( window.navigator.msSaveOrOpenBlob ) {

			// https://msdn.microsoft.com/en-us/library/hh779016(v=vs.85).aspx
			// edge IE 11...
			try {
				window.navigator.msSaveOrOpenBlob ( new Blob ( [ text ] ), filename );
			}
			catch ( err ) {
				console.log ( err ? err : 'An error occurs when saving file' );
			}
		}
		else {

			// FF...
			// http://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
			try {
				let mapFile = window.URL.createObjectURL ( new File ( [ text ], { type : type || 'text/plain' } ) );
				let element = document.createElement ( 'a' );
				element.setAttribute ( 'href', mapFile );
				element.setAttribute ( 'download', filename );
				element.style.display = 'none';
				document.body.appendChild ( element );
				element.click ( );
				document.body.removeChild ( element );
				window.URL.revokeObjectURL ( mapFile );
			}
			catch ( err ) {
				console.log ( err ? err : 'An error occurs when saving file' );
			}
		}
	}

	/* --- End of mySaveFile function --- */

	/*
	--- myFormatTime function -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myFormatTime ( time ) {

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

	/* --- End of myFormatTime function --- */

	/*
	--- myFormatDistance function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myFormatDistance ( distance ) {

		const M_IN_KM = 1000;
		const DISTANCE_ROUND = 10;
		const THREE = 3;

		let iDistance = Math.floor ( distance );
		if ( ZERO === iDistance ) {
			return '';
		}
		return Math.floor ( iDistance / M_IN_KM ) +
			',' +
			Math.floor ( ( iDistance % M_IN_KM ) / DISTANCE_ROUND ).toFixed ( ZERO )
				.padStart ( TWO, '0' )
				.padEnd ( THREE, '0' ) +
			'\u00A0km';
	}

	/* --- End of myFormatDistance function --- */

	/*
	--- myFormatLat function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myFormatLat ( lat ) {
		return (
			lat > ZERO
				?
				lat.toFixed ( LAT_LNG.fixed ) + '\u00A0N'
				:
				( -lat ).toFixed ( LAT_LNG.fixed ) + '\u00A0S'
		);
	}

	/* --- End of myFormatLat function --- */

	/*
	--- myFormatLng function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myFormatLng ( lng ) {
		return (
			lng > ZERO
				?
				lng.toFixed ( LAT_LNG.fixed ) + '\u00A0E'
				:
				( -lng ).toFixed ( LAT_LNG.fixed ) + '\u00A0W'
		);
	}

	/* --- End of myFormatLng function --- */

	/*
	--- myFormatLatLng function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myFormatLatLng ( latLng ) {
		if ( ZERO === latLng [ ZERO ] && ZERO === latLng [ ONE ] ) {
			return '';
		}
		return myFormatLat ( latLng [ ZERO ] ) + '\u00A0-\u00A0' + myFormatLng ( latLng [ ONE ] );
	}

	/* --- End of myFormatLatLng function --- */

	/*
	--- Utilities object ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			get UUID ( ) { return myGetUUID ( ); },

			storageAvailable : type => myStorageAvailable ( type ),

			fileAPIAvailable : ( ) => myFileAPIAvailable ( ),

			saveFile : ( filename, text, type ) => mySaveFile ( filename, text, type ),

			formatTime : time => myFormatTime ( time ),

			formatDistance : distance => myFormatDistance ( distance ),

			formatLat : lat => myFormatLat ( lat ),

			formatLng : lng => myFormatLng ( lng ),

			formatLatLng : latLng => myFormatLatLng ( latLng )
		}
	);
}

export { newUtilities };

/*
--- End of Utilities.js file ------------------------------------------------------------------------------------------
*/