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
--- DataEncryptor.js file ---------------------------------------------------------------------------------------------
This file contains:
	- the newDataEncryptor function
Changes:
	- v1.6.0:
		- created
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newDataEncryptor };

/*
--- dataEncryptor function ----------------------------------------------------------------------------------------

-------------------------------------------------------------------------------------------------------------------
*/

function newDataEncryptor ( ) {

	/*
	--- myImportKey function --------------------------------------------------------------------------------------

	---------------------------------------------------------------------------------------------------------------
	*/

	function myImportKey ( pswd ) {
		return window.crypto.subtle.importKey (
			'raw',
			pswd,
			{ name : 'PBKDF2' },
			false,
			[ 'deriveKey' ]
		);
	}

	/*
	--- myDeriveKey function --------------------------------------------------------------------------------------

	---------------------------------------------------------------------------------------------------------------
	*/

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

	/*
	--- myEncryptData object --------------------------------------------------------------------------------------

	---------------------------------------------------------------------------------------------------------------
	*/

	function myDecryptData ( data, onOk, onError, pswdPromise ) {

		/*
		--- decrypt function --------------------------------------------------------------------------------------

		-----------------------------------------------------------------------------------------------------------
		*/

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

	/*
	--- myEncryptData object --------------------------------------------------------------------------------------

	---------------------------------------------------------------------------------------------------------------
	*/

	function myEncryptData ( data, onOk, onError, pswdPromise ) {

		let ivBytes = window.crypto.getRandomValues ( new Uint8Array ( 16 ) );

		/*
		--- encrypt function --------------------------------------------------------------------------------------

		-----------------------------------------------------------------------------------------------------------
		*/

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

		/*
		--- returnValue function --------------------------------------------------------------------------------------

		-----------------------------------------------------------------------------------------------------------
		*/

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

	/*
	--- dataEncryptor object --------------------------------------------------------------------------------------

	---------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			encryptData : function ( data, onOk, onError, pswdPromise ) { myEncryptData ( data, onOk, onError, pswdPromise ); },
			decryptData : function ( data, onOk, onError, pswdPromise ) { myDecryptData ( data, onOk, onError, pswdPromise ); }
		}
	);
}

/*
--- End of DataEncryptor.js file --------------------------------------------------------------------------------------
*/