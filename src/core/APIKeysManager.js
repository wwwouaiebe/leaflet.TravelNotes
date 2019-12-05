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
--- APIKeysManager.js file --------------------------------------------------------------------------------------------
This file contains:
	- the newAPIKeysManager function
	- the g_APIKeysManager object
Changes:
	- v1.6.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { g_APIKeysManager };

import { newAPIKeysDialog } from '../dialogs/APIKeysDialog.js';
import { newUtilities } from '../util/Utilities.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { g_Config } from '../data/Config.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newHttpRequestBuilder } from '../util/HttpRequestBuilder.js';
import { newDataEncryptor } from '../util/DataEncryptor.js';
import { newPasswordDialog } from '../dialogs/PasswordDialog.js';
import { g_Translator } from '../UI/Translator.js';
import { gc_ErrorsUI } from '../UI/ErrorsUI.js';

let s_KeysMap = new Map;

/*
--- newAPIKeysManager function ----------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newAPIKeysManager ( ) {
	
	/*
	--- m_GetKey function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_GetKey ( providerName ) {
		return s_KeysMap.get ( providerName.toLowerCase ( ) );
	}
	
	/*
	--- m_SetKey function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SetKey ( providerName, key ) {
		s_KeysMap.set ( providerName.toLowerCase ( ), key );
	}
	
	/*
	--- m_FromUrl function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_FromUrl ( urlString ) {
		let urlSubStrings = urlString.split ( '=' );
		if ( 2 === urlSubStrings.length ) {
			let providerName = urlSubStrings [ 0 ].substr ( 0, urlSubStrings [ 0 ].length - 11 ).toLowerCase ( );
			let providerKey = urlSubStrings [ 1 ] ;
			if ( newUtilities ( ).storageAvailable ( 'sessionStorage' ) && g_Config.APIKeys.saveToSessionStorage ) {
				sessionStorage.setItem ( providerName + 'ProviderKey', btoa (providerKey ) );
			}
			m_SetKey ( providerName, providerKey );
			let provider = g_TravelNotesData.providers.get ( providerName );
			if ( provider ) {
				provider.providerKey = providerKey;
			}
		}
	}
	
	/*
	--- m_FromSessionStorage function ---------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_FromSessionStorage ( ) {
		let APIKeysCounter = 0;
		for ( let counter  = 0; counter < sessionStorage.length ; counter ++ ) {
			var keyName = sessionStorage.key ( counter );
			if ( 'ProviderKey' === keyName.substr ( keyName.length - 11 ) ) {
				m_SetKey ( keyName.substr ( 0, keyName.length - 11), atob ( sessionStorage.getItem ( keyName ) ) );
				APIKeysCounter ++;
			}
		}
		g_TravelNotesData.providers.forEach ( provider => { provider.providerKey = ( m_GetKey ( provider.name ) || '' ); } );
		return APIKeysCounter;
	}

	/*
	--- m_AddProvider function ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_AddProvider ( provider ) { 
		let providerName = provider.name.toLowerCase ( );
		let providerKey = m_GetKey ( providerName );
		
		if ( provider.providerKeyNeeded && ! providerKey ) {
			if ( newUtilities ( ).storageAvailable ( 'sessionStorage' ) ) {
				providerKey = sessionStorage.getItem ( providerName );
				if ( providerKey ) {
					providerKey = atob ( providerKey );
				}
			}
		}
		if ( provider.providerKeyNeeded && providerKey ) {
			provider.providerKey = providerKey;
		}
		g_TravelNotesData.providers.set ( provider.name.toLowerCase ( ), provider );
	}

	/*
	--- m_resetAPIKeys function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_resetAPIKeys ( APIKeys ) {
		sessionStorage.clear ( );
		s_KeysMap.clear ( );
		let saveToSessionStorage = newUtilities ( ).storageAvailable ( 'sessionStorage' ) && g_Config.APIKeys.saveToSessionStorage;
		APIKeys.forEach (
			APIKey => {
				if ( saveToSessionStorage ) {
					sessionStorage.setItem ( ( APIKey.providerName  ).toLowerCase ( ) + 'ProviderKey', btoa ( APIKey.providerKey ) );
				}
				m_SetKey ( APIKey.providerName, APIKey.providerKey );
			}
		);
		g_TravelNotesData.providers.forEach ( provider => { provider.providerKey = ( m_GetKey ( provider.name ) || '' ); } );
		
		newEventDispatcher ( ).dispatch ( 'providersadded' );
	}

	/*
	--- m_Dialog function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_Dialog ( ) {
		let ApiKeys = [];
		s_KeysMap.forEach (
			( providerKey, providerName ) => ApiKeys.push ( { providerName : providerName, providerKey : providerKey } )
		)
		ApiKeys.sort ( function ( first, second ) { return first.providerName.localeCompare ( second.providerName ); } );
		newAPIKeysDialog ( ApiKeys )
			.show ( )
			.then ( APIKeys => m_resetAPIKeys ( APIKeys ) )
			.catch ( err => console.log ( err ? err : 'canceled by user' )); 
	}
	
	/*
	--- m_OnOkDecrypt function ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnOkDecrypt ( data ) {
		let APIKeys = JSON.parse ( new TextDecoder ( ).decode ( data ) )
		m_resetAPIKeys ( APIKeys );
	}
	
	/*
	--- m_OnErrorDecrypt function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnErrorDecrypt ( err ) {
		console.log ( err ? err : 'An error occurs when reading the APIKeys file' );
	}

	/*
	--- m_OnServerFile function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnServerFile ( data ) {
		gc_ErrorsUI.showHelp ( g_Translator.getText ( 'Help - gives a password for the APIKeys file or cancel' ) );
		newDataEncryptor ( ).decryptData (
			data,		
			m_OnOkDecrypt,
			m_OnErrorDecrypt,
			newPasswordDialog ( false ).show ( ) 
		);
	}
	
	/*
	--- m_FromServerFile function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_FromServerFile ( ) {
		if ( 0 !== m_FromSessionStorage ( ) ) {
			newEventDispatcher ( ).dispatch ( 'providersadded' );
			return;
		}
		newHttpRequestBuilder ( ).getBinaryPromise (
			window.location.href.substr (0, window.location.href.lastIndexOf ( '/') + 1 ) +
				'APIKeys' 
		)
			.then ( m_OnServerFile )
			.catch ( err => console.log ( err? err : 'APIKeys not found on server' ) );
	}
	
	/*
	--- APIKeysManager object -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	return Object.seal (
		{
			fromServerFile : ( ) => m_FromServerFile ( ),
			fromUrl : ( urlString ) => m_FromUrl ( urlString ),
			dialog : ( )=> m_Dialog ( ),
			getKey : providerName => { return m_GetKey ( providerName ); },
			setKey : ( providerName, key ) => m_SetKey ( providerName, key ),
			addProvider : provider => m_AddProvider ( provider )
		}
	);
}

/* 
--- g_APIKeysManager object -------------------------------------------------------------------------------------------

The one and only one noteEditor

-----------------------------------------------------------------------------------------------------------------------
*/

const g_APIKeysManager = newAPIKeysManager ( );

	
/*
--- End of APIKeysManager.js file -------------------------------------------------------------------------------------
*/	