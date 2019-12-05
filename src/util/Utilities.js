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

import { g_Translator } from '../UI/Translator.js';

function newUtilities ( ) {

	/* 
	--- m_getUUID function --------------------------------------------------------------------------------------------
	
	This function test if the storage API is available ( the API can be deactived by user....)
	Adapted from MDN :-)

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_getUUID ( ) { 
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
			Random4 ( ) ;
	}

	/* --- End of m_getUUID function --- */		

	/* 
	--- m_storageAvailable function -----------------------------------------------------------------------------------
	
	This function test if the storage API is available ( the API can be deactived by user....)
	Adapted from MDN :-)

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_storageAvailable ( type ) {
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
	--- m_fileAPIAvailable function -----------------------------------------------------------------------------------
	
	This function test if the File API is available 

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_fileAPIAvailable ( ) {
		try {

			// FF...
			new File ( [ 'testdata' ], { type : 'text/plain' } );
			return true;
		}
		catch ( Error ) {
			if (window.navigator.msSaveOrOpenBlob ) {

				//edge IE 11...
				return true;
			}
			else {
				return false;
			}
		}
	}

	/* --- End of m_fileAPIAvailable function --- */		

	/* 
	--- m_saveFile function -------------------------------------------------------------------------------------------
	
	This function save data to a local file

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_saveFile ( filename, text, type ) {
		if ( ! type ) {
			type = 'text/plain';
		}
		if ( window.navigator.msSaveOrOpenBlob ) {

			//https://msdn.microsoft.com/en-us/library/hh779016(v=vs.85).aspx
			//edge IE 11...
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

	/* --- End of m_saveFile function --- */		

	/* 
	--- m_formatTime function -----------------------------------------------------------------------------------------
	
	This function save data to a local file

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_formatTime ( time ) {
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
				+ g_Translator.getText ( 'Utilities - Day' ) + 
				'&nbsp;' + 
				hours + 
				'&nbsp;' + 
				g_Translator.getText ( 'Utilities - Hour' );
		}
		else if ( 0 < hours ) {
			return hours + 
				'&nbsp;' 
				+ g_Translator.getText ( 'Utilities - Hour' ) 
				+'&nbsp;' + 
				minutes + 
				'&nbsp;' 
				+ g_Translator.getText ( 'Utilities - Minute' );
		}
		else if ( 0 < minutes ) {
			return minutes + 
				'&nbsp;' + 
				g_Translator.getText ( 'Utilities - Minute' );
		}
		else {
			return seconds + '&nbsp;' + g_Translator.getText ( 'Utilities - Second' );
		}
	}
	
	/* --- End of m_formatTime function --- */		

	/* 
	--- m_formatDistance function -------------------------------------------------------------------------------------
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_formatDistance ( distance ) {
		distance = Math.floor ( distance );
		if ( 0 === distance ) {
			return '';
		} 
		else {
			return Math.floor ( distance / 1000 ) +
				',' + 
				Math.floor ( ( distance % 1000 ) / 10 ).toFixed ( 0 )
					.padStart ( 2, '0' )
					.padEnd ( 3, '0') + 
				'&nbsp;km';
		}
	}
	
	/* --- End of m_formatDistance function --- */		

	/* 
	--- m_formatLat function ------------------------------------------------------------------------------------------
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_formatLat ( lat ) {
		return ( lat > 0 ? lat.toFixed ( 6 ) + '&nbsp;N' : ( -lat ).toFixed ( 6 ) + '&nbsp;S' );
	}
	
	/* --- End of m_formatLat function --- */		

	/* 
	--- m_formatLng function ------------------------------------------------------------------------------------------
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_formatLng ( lng ) {
		return ( lng > 0 ? lng.toFixed ( 6 ) + '&nbsp;E' : ( -lng ).toFixed ( 6 ) + '&nbsp;W' );
	}
	
	/* --- End of m_formatLng function --- */		

	/* 
	--- m_formatLatLng function ---------------------------------------------------------------------------------------
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_formatLatLng ( latLng ) {
		return m_formatLat ( latLng [ 0 ] ) + '&nbsp;-&nbsp;' + m_formatLng ( latLng [ 1 ] );
	}

	/* --- End of m_formatLatLng function --- */		

	/* 
	--- Utilities object ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			get UUID ( ) { return m_getUUID ( ) },
						
			storageAvailable : type =>  m_storageAvailable ( type ),

			fileAPIAvailable : ( ) => { return m_fileAPIAvailable ( ); },
			
			saveFile : ( filename, text, type ) => m_saveFile ( filename, text, type ),

			formatTime : time => { return m_formatTime ( time ); },
			
			formatDistance : distance => { return m_formatDistance ( distance ); },
			
			formatLat : lat => { return m_formatLat ( lat ); },

			formatLng : lng => { return m_formatLng ( lng ); },
			
			formatLatLng : latLng => { return m_formatLatLng ( latLng ); }
		}
	);
}

/*
--- End of Utilities.js file ------------------------------------------------------------------------------------------
*/	