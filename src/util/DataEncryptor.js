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
		- created
Doc reviewed 20200825
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file DataEncryptor.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module DataEncryptor
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewDataEncryptor ( ) {

	function myImportKey ( pswd ) {
		return window.crypto.subtle.importKey (
			'raw',
			pswd,
			{ name : 'PBKDF2' },
			false,
			[ 'deriveKey' ]
		);
	}

	/* eslint-disable no-magic-numbers */

	function myDeriveKey ( deriveKey ) {
		return window.crypto.subtle.deriveKey (
			{
				name : 'PBKDF2',
				salt : new window.TextEncoder ( ).encode (
					'Tire la chevillette la bobinette cherra. Le Petit Chaperon rouge tira la chevillette.'
				),
				iterations : 1000000,
				hash : 'SHA-256'
			},
			deriveKey,
			{
				name : 'AES-GCM',
				length : 256
			},
			false,
			[ 'encrypt', 'decrypt' ]
		);
	}

	/* eslint-disable-next-line max-params */
	function myDecryptData ( data, onOk, onError, pswdPromise ) {
		function decrypt ( decryptKey ) {
			return window.crypto.subtle.decrypt (
				{
					name : 'AES-GCM',
					iv : new Uint8Array ( data.slice ( 0, 16 ) )
				},
				decryptKey,
				new Uint8Array ( data.slice ( 16 ) )
			);
		}
		pswdPromise
			.then ( myImportKey )
			.then ( myDeriveKey )
			.then ( decrypt )
			.then ( onOk )
			.catch ( onError );
	}

	/* eslint-disable-next-line max-params */
	function myEncryptData ( data, onOk, onError, pswdPromise ) {
		let ivBytes = window.crypto.getRandomValues ( new Uint8Array ( 16 ) );
		function encrypt ( encryptKey ) {
			return window.crypto.subtle.encrypt (
				{
					name : 'AES-GCM',
					iv : ivBytes
				},
				encryptKey,
				data
			);
		}
		function returnValue ( cipherText ) {
			onOk (
				new Blob (
					[ ivBytes, new Uint8Array ( cipherText ) ],
					{ type : 'application/octet-stream' }
				)
			);
		}
		pswdPromise
			.then ( myImportKey )
			.then ( myDeriveKey )
			.then ( encrypt )
			.then ( returnValue )
			.catch ( onError );
	}
	/* eslint-enable no-magic-numbers */

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class
	@classdesc This class is used to encrypt an decrypt data with a password
	@see {@link newDataEncryptor} for constructor
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class DataEncryptor {

		constructor ( ) {
			Object.freeze ( this );
		}

		/**
		@param {Uint8Array} data The data to encrypt. See TextEncoder ( ) to transform string to Uint8Array
		@param {function} onOk A function to execute when the encryption succeeds
		@param {function} onError A function to execute when the encryption fails
		@param {Promise} pswdPromise A Promise that fullfil with a password. Typically a dialog...
		*/

		/* eslint-disable-next-line max-params */
		encryptData ( data, onOk, onError, pswdPromise ) { myEncryptData ( data, onOk, onError, pswdPromise ); }

		/**
		@param {Uint8Array} data The data to decrypt. See TextDecoder ( ) to transform Uint8Array to string
		@param {function} onOk A function to execute when the decryption succeeds
		@param {function} onError A function to execute when the decryption fails
		@param {Promise} pswdPromise A Promise that fullfil with a password. Typically a dialog...
		*/

		/* eslint-disable-next-line max-params */
		decryptData ( data, onOk, onError, pswdPromise ) { myDecryptData ( data, onOk, onError, pswdPromise ); }
	}

	return new DataEncryptor ( );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newDataEncryptor
	@desc constructor for DataEncryptor objects
	@return {DataEncryptor} an instance of DataEncryptor object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewDataEncryptor as newDataEncryptor
};

/*
--- End of DataEncryptor.js file ----------------------------------------------------------------------------------------------
*/