/*
Copyright - 2019 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- IndexedDB.js file -------------------------------------------------------------------------------------------------
This file contains:
	-
Changes:
	- v1.7.0:
		- created

Doc reviewed
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

const DB_VERSION = 1;

/*
--- newIndexedDb function ---------------------------------------------------------------------------------------------

This function ...

-----------------------------------------------------------------------------------------------------------------------
*/

function newIndexedDb ( ) {

	let myDb = null;

	/*
	--- myCloseDb function --------------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCloseDb ( UUID ) {
		if ( ! myDb ) {
			return;
		}
		if ( ! UUID ) {
			myDb.close ( );
			myDb = null;
			return;
		}
		let transaction = myDb.transaction ( [ 'Travels' ], 'readwrite' );
		transaction.onerror = function ( ) {
		};
		let travelsObjectStore = transaction.objectStore ( 'Travels' );
		let deleteRequest = travelsObjectStore.delete ( UUID );
		deleteRequest.onerror = function ( ) {
			myDb.close ( );
			myDb = null;
		};
		deleteRequest.onsuccess = function ( ) {
			myDb.close ( );
			myDb = null;
		};

	}

	/*
	--- myGetReadPromise function -------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetReadPromise ( UUID ) {

		function read ( onOk, onError ) {
			if ( ! myDb ) {
				onError ( new Error ( 'Database not opened' ) );
				return;
			}
			let transaction = myDb.transaction ( [ 'Travels' ], 'readonly' );
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

	/*
	--- myGetWritePromise function ------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetWritePromise ( UUID, data ) {

		function write ( onOk, onError ) {
			if ( ! myDb ) {
				onError ( new Error ( 'Database not opened' ) );
				return;
			}
			let transaction = null;
			try {
				transaction = myDb.transaction ( [ 'Travels' ], 'readwrite' );
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

	/*
	--- myGetOpenPromise function -------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetOpenPromise ( ) {

		function openDb ( onOk, onError ) {

			if ( myDb ) {
				onOk ( );
				return;
			}

			let openRequest = window.indexedDB.open ( 'TravelNotesDb', DB_VERSION );

			openRequest.onerror = function ( ) {
				myDb = null;
				onError ( new Error ( 'Not possible to open the db' ) );
			};

			openRequest.onsuccess = function ( successEvent ) {
				myDb = successEvent.target.result;
				onOk ( );
			};

			openRequest.onupgradeneeded = function ( upgradeEvent ) {
				myDb = upgradeEvent.target.result;
				myDb.createObjectStore ( 'Travels', { keyPath : 'UUID' } );
			};

		}

		return new Promise ( openDb );
	}

	/*
	--- IndexedDB object ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			getOpenPromise : ( ) => myGetOpenPromise ( ),
			getReadPromise : UUID => myGetReadPromise ( UUID ),
			getWritePromise : ( UUID, data ) => myGetWritePromise ( UUID, data ),
			closeDb : UUID => myCloseDb ( UUID )
		}
	);
}

/*
--- theIndexedDb object -----------------------------------------------------------------------------------------------

The one and only one indexedDB

-----------------------------------------------------------------------------------------------------------------------
*/

const theIndexedDb = newIndexedDb ( );

export { theIndexedDb };

/*
--- End of IndexedDb.js file ------------------------------------------------------------------------------------------

*/