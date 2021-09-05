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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
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

@module UILib
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

const OUR_DB_VERSION = 1;

/**
@--------------------------------------------------------------------------------------------------------------------------

@class IndexedDb
@classdesc This class contains methods for accessing the window.indexedDb
@see {@link theIndexedDb} for the one and only one instance of this class
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class IndexedDb {

	#indexedDb = null;

	#UUID = null;
	#data = null;

	/**
	Perform the open operations
	@private
	*/

	#open ( onOk, onError ) {
		if ( this.#indexedDb ) {
			onOk ( );
			return;
		}
		let openRequest = window.indexedDB.open ( 'TravelNotesDb', OUR_DB_VERSION );
		openRequest.onerror = ( ) => {
			this.#indexedDb = null;
			onError ( new Error ( 'Not possible to open the db' ) );
		};
		openRequest.onsuccess = successEvent => {
			this.#indexedDb = successEvent.target.result;
			onOk ( );
		};
		openRequest.onupgradeneeded = upgradeEvent => {
			this.#indexedDb = upgradeEvent.target.result;
			this.#indexedDb.createObjectStore ( 'Travels', { keyPath : 'UUID' } );
		};
	}

	/**
	Perform the read operations
	@private
	*/

	#read ( onOk, onError ) {
		if ( ! this.#indexedDb ) {
			onError ( new Error ( 'Database not opened' ) );
			return;
		}
		let transaction = this.#indexedDb.transaction ( [ 'Travels' ], 'readonly' );
		transaction.onerror = ( ) => onError ( new Error ( 'Transaction error' ) );

		let travelsObjectStore = transaction.objectStore ( 'Travels' );
		let getRequest = travelsObjectStore.get ( this.#UUID );
		getRequest.onsuccess = successEvent => onOk ( successEvent.target.result ? successEvent.target.result.data : null );
	}

	/**
	Perform the write operations
	@private
	*/

	#write ( onOk, onError ) {
		if ( ! this.#indexedDb ) {
			onError ( new Error ( 'Database not opened' ) );
			return;
		}
		let transaction = null;
		try {
			transaction = this.#indexedDb.transaction ( [ 'Travels' ], 'readwrite' );
		}
		catch ( err ) {
			onError ( err );
			return;
		}
		transaction.onerror = ( ) => onError ( new Error ( 'Transaction error' ) );
		let travelsObjectStore = transaction.objectStore ( 'Travels' );
		let putRequest = travelsObjectStore.put ( { UUID : this.#UUID, data : this.#data } );
		putRequest.onsuccess = ( ) => onOk ( );
	}

	/**
	Perform the close operations
	@private
	*/

	#close ( ) {
		this.#indexedDb.close ( );
		this.#indexedDb = null;
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	Open the indexedDb
	@return {Promise} A Promise  that fullfil when the indexedDb is opened or reject when a problem occurs
	*/

	getOpenPromise ( ) {
		return new Promise ( ( onOk, onError ) => this.#open ( onOk, onError ) );
	}

	/**
	Read data in the indexedDb.
	@param {string} UUID An UUID used to identify the data in the indexedDb
	@return {Promise} A promise that fullfil when the data are read or reject when a problem occurs
	The success handler receive the data as parameter
	*/

	getReadPromise ( UUID ) {
		this.#UUID = UUID;
		return new Promise ( ( onOk, onError ) => this.#read ( onOk, onError ) );
	}

	/**
	Write data in the indexedDb.
	@param {string} UUID An UUID used to identify the data in the indexedDb
	@param {any} data The data to put in the indexedDb
	@return {Promise} A promise that fullfil when the data are written or reject when a problem occurs
	*/

	getWritePromise ( UUID, data ) {
		this.#UUID = UUID;
		this.#data = data;

		return new Promise ( ( onOk, onError ) => this.#write ( onOk, onError ) );
	}

	/**
	Remove the data in the indexedDb and close it
	@param {string} UUID An UUID used to identify the data in the indexedDb
	*/

	closeDb ( UUID ) {
		if ( ! this.#indexedDb ) {
			return;
		}
		if ( ! UUID ) {
			this.#close ( );
			return;
		}

		let transaction = this.#indexedDb.transaction ( [ 'Travels' ], 'readwrite' );
		transaction.onerror = ( ) => { };
		let travelsObjectStore = transaction.objectStore ( 'Travels' );

		let deleteRequest = travelsObjectStore.delete ( UUID );
		deleteRequest.onerror = ( ) => this.#close ( );
		deleteRequest.onsuccess = ( ) => this.#close ( );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of IndexedDb class
@type {IndexedDb}
@constant
@global

@--------------------------------------------------------------------------------------------------------------------------
*/

const theIndexedDb = new IndexedDb ( );

export default theIndexedDb;

/*
--- End of IndexedDb.js file --------------------------------------------------------------------------------------------------

*/