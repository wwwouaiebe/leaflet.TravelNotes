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
	- v1.7.0:
		- created
Doc reviewed 20200825
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file IndexedDb.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/
/**
@------------------------------------------------------------------------------------------------------------------------------

@module IndexedDb
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

const DB_VERSION = 1;
let ourDb = null;

/**
@--------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class contains methods for accessing the window.indexedDb
@see {@link theIndexedDb} for the one and only one instance of this class
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class IndexedDb {

	/**
	Open the indexedDb
	@return {Promise} A Promise  that fullfil when the indexedDb is opened or reject when a problem occurs
	*/

	getOpenPromise ( ) {
		function openDb ( onOk, onError ) {
			if ( ourDb ) {
				onOk ( );
				return;
			}
			let openRequest = window.indexedDB.open ( 'TravelNotesDb', DB_VERSION );
			openRequest.onerror = function ( ) {
				ourDb = null;
				onError ( new Error ( 'Not possible to open the db' ) );
			};
			openRequest.onsuccess = function ( successEvent ) {
				ourDb = successEvent.target.result;
				onOk ( );
			};
			openRequest.onupgradeneeded = function ( upgradeEvent ) {
				ourDb = upgradeEvent.target.result;
				ourDb.createObjectStore ( 'Travels', { keyPath : 'UUID' } );
			};
		}

		return new Promise ( openDb );
	}

	/**
	Read data in the indexedDb.
	@param {string} UUID An UUID used to identify the data in the indexedDb
	@return {Promise} A promise that fullfil when the data are read or reject when a problem occurs
	The success handler receive the data as parameter
	*/

	getReadPromise ( UUID ) {
		function read ( onOk, onError ) {
			if ( ! ourDb ) {
				onError ( new Error ( 'Database not opened' ) );
				return;
			}
			let transaction = ourDb.transaction ( [ 'Travels' ], 'readonly' );
			transaction.onerror = function ( ) {
				onError ( new Error ( 'Transaction error' ) );
			};

			let travelsObjectStore = transaction.objectStore ( 'Travels' );
			let getRequest = travelsObjectStore.get ( UUID );
			getRequest.onsuccess = function ( successEvent ) {
				onOk ( successEvent.target.result ? successEvent.target.result.data : null );
			};
		}

		return new Promise ( read );
	}

	/**
	Write data in the indexedDb.
	@param {string} UUID An UUID used to identify the data in the indexedDb
	@param {any} data The data to put in the indexedDb
	@return {Promise} A promise that fullfil when the data are written or reject when a problem occurs
	*/

	getWritePromise ( UUID, data ) {
		function write ( onOk, onError ) {
			if ( ! ourDb ) {
				onError ( new Error ( 'Database not opened' ) );
				return;
			}
			let transaction = null;
			try {
				transaction = ourDb.transaction ( [ 'Travels' ], 'readwrite' );
			}
			catch ( err ) {
				onError ( err );
				return;
			}
			transaction.onerror = function ( ) {
				onError ( new Error ( 'Transaction error' ) );
			};
			let travelsObjectStore = transaction.objectStore ( 'Travels' );
			let putRequest = travelsObjectStore.put ( { UUID : UUID, data : data } );
			putRequest.onsuccess = function ( ) {
				onOk ( );
			};
		}

		return new Promise ( write );
	}

	/**
	Remove the data in the indexedDb and close it
	@param {string} UUID An UUID used to identify the data in the indexedDb
	*/

	closeDb ( UUID ) {
		if ( ! ourDb ) {
			return;
		}
		if ( ! UUID ) {
			ourDb.close ( );
			ourDb = null;
			return;
		}
		let transaction = ourDb.transaction ( [ 'Travels' ], 'readwrite' );
		transaction.onerror = function ( ) {
		};
		let travelsObjectStore = transaction.objectStore ( 'Travels' );
		let deleteRequest = travelsObjectStore.delete ( UUID );
		deleteRequest.onerror = function ( ) {
			ourDb.close ( );
			ourDb = null;
		};
		deleteRequest.onsuccess = function ( ) {
			ourDb.close ( );
			ourDb = null;
		};
	}
}

const ourIndexedDb = Object.freeze ( new IndexedDb );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of IndexedDb class
	@type {IndexedDb}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourIndexedDb as theIndexedDb
};

/*
--- End of IndexedDb.js file --------------------------------------------------------------------------------------------------

*/