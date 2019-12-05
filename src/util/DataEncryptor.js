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
	--- m_ImportKey function --------------------------------------------------------------------------------------
	
	---------------------------------------------------------------------------------------------------------------
	*/

	function m_ImportKey ( pswd ) {
		return window.crypto.subtle.importKey (
			"raw", 
			pswd, 
			{ name : "PBKDF2" }, 
			false, 
			[ "deriveKey" ]
		);
	}
	
	/*
	--- m_DeriveKey function --------------------------------------------------------------------------------------
	
	---------------------------------------------------------------------------------------------------------------
	*/

	function m_DeriveKey ( deriveKey ) {
		return window.crypto.subtle.deriveKey (
			{
				name : "PBKDF2", 
				salt : new window.TextEncoder ( ).encode ( 
					"Tire la chevillette la bobinette cherra. Le Petit Chaperon rouge tira la chevillette." 
				), 
				iterations : 1000000, 
				hash : "SHA-256"
			},
			deriveKey,
			{
				name : "AES-GCM", 
				length : 256
			},
			false,
			[ "encrypt", "decrypt" ]
		);
	}

	/*
	--- m_EncryptData object --------------------------------------------------------------------------------------
	
	---------------------------------------------------------------------------------------------------------------
	*/

	function m_DecryptData ( data, onOk, onError, pswdPromise ) {

		/*
		--- decrypt function --------------------------------------------------------------------------------------
		
		-----------------------------------------------------------------------------------------------------------
		*/
		
		function decrypt ( decryptKey ) {
			return window.crypto.subtle.decrypt (
				{
					name : "AES-GCM", 
					iv : new Uint8Array ( data.slice ( 0, 16 ) )
				}, 
				decryptKey, 
				new Uint8Array ( data.slice ( 16 ) )
			);
		}

		pswdPromise
			.then ( m_ImportKey )
			.then ( m_DeriveKey )
			.then ( decrypt )
			.then ( onOk )
			.catch ( onError );
	}
	
	/*
	--- m_EncryptData object --------------------------------------------------------------------------------------
	
	---------------------------------------------------------------------------------------------------------------
	*/

	function m_EncryptData ( data, onOk, onError, pswdPromise ) {
		
		var ivBytes = window.crypto.getRandomValues ( new Uint8Array ( 16 ) );

		/*
		--- encrypt function --------------------------------------------------------------------------------------
		
		-----------------------------------------------------------------------------------------------------------
		*/
		
		function encrypt ( encryptKey ) {
			return window.crypto.subtle.encrypt (
				{
					name : "AES-GCM", 
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
					{type : "application/octet-stream"}
				)
			);
		}
		pswdPromise
			.then ( m_ImportKey )
			.then ( m_DeriveKey )
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
			encryptData : function ( data, onOk, onError, pswdPromise ) { m_EncryptData ( data, onOk, onError, pswdPromise ); },
			decryptData : function ( data, onOk, onError, pswdPromise ) { m_DecryptData ( data, onOk, onError, pswdPromise ); }
		}
	);
}
	

/*
--- End of DataEncryptor.js file --------------------------------------------------------------------------------------
*/