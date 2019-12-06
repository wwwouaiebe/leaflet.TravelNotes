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

export { newUtilities };

import { theTranslator } from '../UI/Translator.js';

function newUtilities ( ) {

	/*
	--- myGetUUID function --------------------------------------------------------------------------------------------

	This function test if the storage API is available ( the API can be deactived by user....)
	Adapted from MDN :-)

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetUUID ( ) {
		function Random4 ( ) {
			return Math.floor ( ( 1 + Math.random ( ) ) * 0x10000 ).toString ( 16 )
				.substring ( 1 );
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
		catch ( Error ) {
			if ( window.navigator.msSaveOrOpenBlob ) {

				// edge IE 11...
				return true;
			}
			else {
				return false;
			}
		}
	}

	/* --- End of myFileAPIAvailable function --- */

	/*
	--- mySaveFile function -------------------------------------------------------------------------------------------

	This function save data to a local file

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySaveFile ( filename, text, type ) {
		if ( ! type ) {
			type = 'text/plain';
		}
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
				let mapFile = window.URL.createObjectURL ( new File ( [ text ], { type : type } ) );
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

	This function save data to a local file

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myFormatTime ( time ) {
		time = Math.floor ( time );
		if ( 0 === time ) {
			return '';
		}
		let days = Math.floor ( time / 86400 );
		let hours = Math.floor ( time % 86400 / 3600 );
		let minutes = Math.floor ( time % 3600 / 60 );
		let seconds = Math.floor ( time % 60 );
		if ( 0 < days ) {
			return days +
				'&nbsp;'
				+ theTranslator.getText ( 'Utilities - Day' ) +
				'&nbsp;' +
				hours +
				'&nbsp;' +
				theTranslator.getText ( 'Utilities - Hour' );
		}
		else if ( 0 < hours ) {
			return hours +
				'&nbsp;'
				+ theTranslator.getText ( 'Utilities - Hour' )
				+ '&nbsp;' +
				minutes +
				'&nbsp;'
				+ theTranslator.getText ( 'Utilities - Minute' );
		}
		else if ( 0 < minutes ) {
			return minutes +
				'&nbsp;' +
				theTranslator.getText ( 'Utilities - Minute' );
		}
		else {
			return seconds + '&nbsp;' + theTranslator.getText ( 'Utilities - Second' );
		}
	}

	/* --- End of myFormatTime function --- */

	/*
	--- myFormatDistance function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myFormatDistance ( distance ) {
		distance = Math.floor ( distance );
		if ( 0 === distance ) {
			return '';
		}
		else {
			return Math.floor ( distance / 1000 ) +
				',' +
				Math.floor ( ( distance % 1000 ) / 10 ).toFixed ( 0 )
					.padStart ( 2, '0' )
					.padEnd ( 3, '0' ) +
				'&nbsp;km';
		}
	}

	/* --- End of myFormatDistance function --- */

	/*
	--- myFormatLat function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myFormatLat ( lat ) {
		return ( lat > 0 ? lat.toFixed ( 6 ) + '&nbsp;N' : ( -lat ).toFixed ( 6 ) + '&nbsp;S' );
	}

	/* --- End of myFormatLat function --- */

	/*
	--- myFormatLng function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myFormatLng ( lng ) {
		return ( lng > 0 ? lng.toFixed ( 6 ) + '&nbsp;E' : ( -lng ).toFixed ( 6 ) + '&nbsp;W' );
	}

	/* --- End of myFormatLng function --- */

	/*
	--- myFormatLatLng function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myFormatLatLng ( latLng ) {
		return myFormatLat ( latLng [ 0 ] ) + '&nbsp;-&nbsp;' + myFormatLng ( latLng [ 1 ] );
	}

	/* --- End of myFormatLatLng function --- */

	/*
	--- Utilities object ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			get UUID ( ) { return myGetUUID ( ); },

			storageAvailable : type =>  myStorageAvailable ( type ),

			fileAPIAvailable : ( ) => { return myFileAPIAvailable ( ); },

			saveFile : ( filename, text, type ) => mySaveFile ( filename, text, type ),

			formatTime : time => { return myFormatTime ( time ); },

			formatDistance : distance => { return myFormatDistance ( distance ); },

			formatLat : lat => { return myFormatLat ( lat ); },

			formatLng : lng => { return myFormatLng ( lng ); },

			formatLatLng : latLng => { return myFormatLatLng ( latLng ); }
		}
	);
}

/*
--- End of Utilities.js file ------------------------------------------------------------------------------------------
*/