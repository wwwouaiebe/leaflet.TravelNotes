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
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/
	
'use strict';

export { newUtilities };

import { g_Translator } from '../UI/Translator.js';

var newUtilities = function ( ) {

	return {
		
		/*
		--- UUID getter -----------------------------------------------------------------------------------------------
		*/

		get UUID ( ) { 
			function Random4 ( ) {
				return Math.floor ( ( 1 + Math.random ( ) ) * 0x10000 ).toString ( 16 ).substring ( 1 );
			}
			return Random4 ( ) + Random4 ( ) + '-' + Random4 ( ) + '-' + Random4 ( ) + '-' +Random4 ( ) + '-' + Random4 ( ) + Random4 ( ) + Random4 ( ) ;
		},
					
		/* 
		--- storageAvailable function ---------------------------------------------------------------------------------
		
		This function test if the storage API is available ( the API can be deactived by user....)
		Adapted from MDN :-)

		---------------------------------------------------------------------------------------------------------------
		*/
		
		storageAvailable: function ( type ) {
			try {
				var storage = window [ type ];
				var	x = '__storage_test__';
				storage.setItem ( x, x );
				storage.removeItem ( x );
				return true;
			}
			catch ( e ) {
				return false;
			}				
		},
		/* --- End of storageAvailable function --- */		

		/* 
		--- fileAPIAvailable function ---------------------------------------------------------------------------------
		
		This function test if the File API is available 

		---------------------------------------------------------------------------------------------------------------
		*/

		fileAPIAvailable : function ( ) {
			try {
				// FF...
				new File ( [ 'testdata' ], { type: 'text/plain' } );
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
		},
		/* 
		--- saveFile function -----------------------------------------------------------------------------------------
		
		This function data to a local file

		---------------------------------------------------------------------------------------------------------------
		*/

		saveFile : function ( filename, text, type ) {
			if ( ! type ) {
				type = 'text/plain';
			}
			if ( window.navigator.msSaveOrOpenBlob ) {
				//https://msdn.microsoft.com/en-us/library/hh779016(v=vs.85).aspx
				//edge IE 11...
				try {
					window.navigator.msSaveOrOpenBlob ( new Blob ( [ text ] ), filename ); 
				}
				catch ( e ) {
					console.log ( e );
				}
			}
			else {
				// FF...
				// http://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
				try {
					var mapFile = window.URL.createObjectURL ( new File ( [ text ], { type: type } ) );
					var element = document.createElement ( 'a' );
					element.setAttribute( 'href', mapFile );
					element.setAttribute( 'download', filename );
					element.style.display = 'none';
					document.body.appendChild ( element );
					element.click ( );
					document.body.removeChild ( element );
					window.URL.revokeObjectURL ( mapFile );
				}
				catch ( e ) {
					console.log ( e );
				}				
			}
		},
		
		formatTime : function ( time ) {
			time = Math.floor ( time );
			if ( 0 === time ) {
				return '';
			}
			var days = Math.floor ( time / 86400 );
			var hours = Math.floor ( time % 86400 / 3600 );
			var minutes = Math.floor ( time % 3600 / 60 );
			var seconds = Math.floor ( time % 60 );
			if ( 0 < days ) {
				return days + '&nbsp;' + g_Translator.getText ( 'Utilities - Day' ) + '&nbsp;' + hours + '&nbsp;' + g_Translator.getText ( 'Utilities - Hour' );
			}
			else if ( 0 < hours ) {
				return hours + '&nbsp;' + g_Translator.getText ( 'Utilities - Hour' ) +'&nbsp;' + minutes + '&nbsp;' + g_Translator.getText ( 'Utilities - Minute' );
			}
			else if ( 0 < minutes ) {
				return minutes + '&nbsp;' + g_Translator.getText ( 'Utilities - Minute' );
			}
			else {
				return seconds + '&nbsp;' + g_Translator.getText ( 'Utilities - Second' );
			}
		},
		
		formatDistance : function ( distance ) {
			distance = Math.floor ( distance );
			if ( 0 === distance ) {
				return '';
			} 
			else {
				return Math.floor ( distance / 1000 ) +',' + Math.floor ( ( distance % 1000 ) / 10 ).toFixed ( 0 ).padStart ( 2, '0' ).padEnd ( 3, '0') + '&nbsp;km';
			}
		},
		
		formatLat : function ( lat ) {
			return ( lat > 0 ? lat.toFixed ( 6 ) + '&nbsp;N' : ( -lat ).toFixed ( 6 ) + '&nbsp;S' );
		},
		
		formatLng : function ( lng ) {
			return ( lng > 0 ? lng.toFixed ( 6 ) + '&nbsp;E' : ( -lng ).toFixed ( 6 ) + '&nbsp;W' );
		},
		
		formatLatLng : function ( latLng ) {
			return this.formatLat ( latLng [ 0 ] ) + '&nbsp;-&nbsp;' + this.formatLng ( latLng [ 1 ] );
		}
	};
};
