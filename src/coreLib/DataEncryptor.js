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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...

-------------------------------------------------------------------------------------------------------------------------------
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

@module coreLib

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@class DataEncryptor
@classdesc This class is used to encrypt an decrypt data with a password
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class DataEncryptor {

	#salt = null;

	/* eslint-disable no-magic-numbers */

	#importKey ( pswd ) {
		return window.crypto.subtle.importKey (
			'raw',
			pswd,
			{ name : 'PBKDF2' },
			false,
			[ 'deriveKey' ]
		);
	}

	#deriveKey ( deriveKey, salt ) {
		return window.crypto.subtle.deriveKey (
			{
				name : 'PBKDF2',
				salt : new window.TextEncoder ( ).encode ( salt ),
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

	#decrypt ( decryptKey, data ) {
		return window.crypto.subtle.decrypt (
			{
				name : 'AES-GCM',
				iv : new Uint8Array ( data.slice ( 0, 16 ) )
			},
			decryptKey,
			new Uint8Array ( data.slice ( 16 ) )
		);
	}

	#encrypt ( encryptKey, ivBytes, data ) {
		return window.crypto.subtle.encrypt (
			{
				name : 'AES-GCM',
				iv : ivBytes
			},
			encryptKey,
			data
		);
	}

	/*
	constructor
	@param {string} salt Salt to be used for encoding and decoding operations. If none, a default value is provided.
	*/

	constructor ( salt ) {
		this.#salt = salt || 'Tire la chevillette la bobinette cherra. Le Petit Chaperon rouge tira la chevillette.';
		Object.freeze ( this );
	}

	/* eslint-disable max-params */

	/**
	This method encrypt data with a password
	@param {Uint8Array} data The data to encrypt. See TextEncoder ( ) to transform string to Uint8Array
	@param {function} onOk A function to execute when the encryption succeeds
	@param {function} onError A function to execute when the encryption fails
	@param {Promise} pswdPromise A Promise that fullfil with a password. Typically a dialog...
	*/

	encryptData ( data, onOk, onError, pswdPromise ) {
		let ivBytes = window.crypto.getRandomValues ( new Uint8Array ( 16 ) );
		pswdPromise
			.then ( this.#importKey )
			.then ( deriveKey => this.#deriveKey ( deriveKey, this.#salt ) )
			.then ( encryptKey => this.#encrypt ( encryptKey, ivBytes, data ) )
			.then (
				cipherText => {
					onOk (
						new Blob (
							[ ivBytes, new Uint8Array ( cipherText ) ],
							{ type : 'application/octet-stream' }
						)
					);
				}
			)
			.catch ( onError );
	}

	/**
	This method decrypt data with a password
	@param {Uint8Array} data The data to decrypt. See TextDecoder ( ) to transform Uint8Array to string
	@param {function} onOk A function to execute when the decryption succeeds
	@param {function} onError A function to execute when the decryption fails
	@param {Promise} pswdPromise A Promise that fullfil with a password. Typically a dialog...
	*/

	decryptData ( data, onOk, onError, pswdPromise ) {
		pswdPromise
			.then ( this.#importKey )
			.then ( deriveKey => this.#deriveKey ( deriveKey, this.#salt ) )
			.then ( decryptKey => this.#decrypt ( decryptKey, data ) )
			.then ( onOk )
			.catch ( onError );
	}
	/* eslint-disable max-params */
	/* eslint-enable no-magic-numbers */
}

export default DataEncryptor;

/*
--- End of DataEncryptor.js file ----------------------------------------------------------------------------------------------
*/