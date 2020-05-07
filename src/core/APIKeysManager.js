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
	- the theAPIKeysManager object
Changes:
	- v1.6.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newAPIKeysDialog } from '../dialogs/APIKeysDialog.js';
import { newUtilities } from '../util/Utilities.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theConfig } from '../data/Config.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newHttpRequestBuilder } from '../util/HttpRequestBuilder.js';
import { newDataEncryptor } from '../util/DataEncryptor.js';
import { newPasswordDialog } from '../dialogs/PasswordDialog.js';
import { theTranslator } from '../UI/Translator.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';

import { ZERO, ONE, TWO } from '../util/Constants.js';

let ourKeysMap = new Map;

/*
--- newAPIKeysManager function ----------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newAPIKeysManager ( ) {

	/*
	--- myGetKey function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetKey ( providerName ) {
		return ourKeysMap.get ( providerName.toLowerCase ( ) );
	}

	/*
	--- mySetKey function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetKey ( providerName, key ) {
		ourKeysMap.set ( providerName.toLowerCase ( ), key );
	}

	/*
	--- myFromUrl function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myFromUrl ( urlString ) {
		let urlSubStrings = urlString.split ( '=' );
		if ( TWO === urlSubStrings.length ) {
			let providerName =
				urlSubStrings [ ZERO ]
					.substr ( ZERO, urlSubStrings [ ZERO ].length - 'ProviderKey'.length )
					.toLowerCase ( );
			let providerKey = urlSubStrings [ ONE ];
			if ( newUtilities ( ).storageAvailable ( 'sessionStorage' ) && theConfig.APIKeys.saveToSessionStorage ) {
				sessionStorage.setItem ( providerName + 'ProviderKey', btoa ( providerKey ) );
			}
			mySetKey ( providerName, providerKey );
			let provider = theTravelNotesData.providers.get ( providerName );
			if ( provider ) {
				provider.providerKey = providerKey;
			}
		}
	}

	/*
	--- myFromSessionStorage function ---------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myFromSessionStorage ( ) {
		let APIKeysCounter = ZERO;
		for ( let counter = ZERO; counter < sessionStorage.length; counter ++ ) {
			let keyName = sessionStorage.key ( counter );
			if ( 'ProviderKey' === keyName.substr ( keyName.length - 'ProviderKey'.length ) ) {
				mySetKey (
					keyName.substr ( ZERO, keyName.length - 'ProviderKey'.length ),
					atob ( sessionStorage.getItem ( keyName ) )
				);
				APIKeysCounter ++;
			}
		}
		theTravelNotesData.providers.forEach (
			provider => { provider.providerKey = ( myGetKey ( provider.name ) || '' ); }
		);
		return APIKeysCounter;
	}

	/*
	--- myAddProvider function ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddProvider ( provider ) {
		let providerName = provider.name.toLowerCase ( );
		let providerKey = myGetKey ( providerName );

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
		theTravelNotesData.providers.set ( provider.name.toLowerCase ( ), provider );
	}

	/*
	--- myResetAPIKeys function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myResetAPIKeys ( APIKeys ) {
		sessionStorage.clear ( );
		ourKeysMap.clear ( );
		let saveToSessionStorage =
			newUtilities ( ).storageAvailable ( 'sessionStorage' )
			&&
			theConfig.APIKeys.saveToSessionStorage;
		APIKeys.forEach (
			APIKey => {
				if ( saveToSessionStorage ) {
					sessionStorage.setItem (
						( APIKey.providerName ).toLowerCase ( ) + 'ProviderKey',
						btoa ( APIKey.providerKey )
					);
				}
				mySetKey ( APIKey.providerName, APIKey.providerKey );
			}
		);
		theTravelNotesData.providers.forEach (
			provider => { provider.providerKey = ( myGetKey ( provider.name ) || '' ); }
		);

		newEventDispatcher ( ).dispatch ( 'providersadded' );
	}

	/*
	--- myDialog function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myDialog ( ) {
		let ApiKeys = [];
		ourKeysMap.forEach (
			( providerKey, providerName ) => ApiKeys.push ( { providerName : providerName, providerKey : providerKey } )
		);
		ApiKeys.sort (
			( first, second ) => first.providerName.localeCompare ( second.providerName )
		);
		newAPIKeysDialog ( ApiKeys )
			.show ( )
			.then ( APIKeys => myResetAPIKeys ( APIKeys ) )
			.catch ( err => console.log ( err ? err : 'canceled by user' ) );
	}

	/*
	--- myOnOkDecrypt function ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkDecrypt ( data ) {
		let APIKeys = JSON.parse ( new TextDecoder ( ).decode ( data ) );
		myResetAPIKeys ( APIKeys );
	}

	/*
	--- myOnErrorDecrypt function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnErrorDecrypt ( err ) {
		console.log ( err ? err : 'An error occurs when reading the APIKeys file' );
		theErrorsUI.showHelp ( theTranslator.getText ( 'Help - Continue with interface' ) );
	}

	/*
	--- myOnServerFile function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnServerFile ( data ) {
		newDataEncryptor ( ).decryptData (
			data,
			myOnOkDecrypt,
			myOnErrorDecrypt,
			newPasswordDialog ( false ).show ( )
		);
	}

	/*
	--- myFromServerFile function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myFromServerFile ( ) {
		if ( ZERO !== myFromSessionStorage ( ) ) {
			newEventDispatcher ( ).dispatch ( 'providersadded' );
			return;
		}
		if ( theConfig.haveCrypto ) {
			newHttpRequestBuilder ( ).getBinaryPromise (
				window.location.href.substr ( ZERO, window.location.href.lastIndexOf ( '/' ) + ONE ) +
					'APIKeys'
			)
				.then ( myOnServerFile )
				.catch ( err => console.log ( err ? err : 'APIKeys not found on server' ) );
		}
	}

	/*
	--- APIKeysManager object -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			fromServerFile : ( ) => myFromServerFile ( ),
			fromUrl : urlString => myFromUrl ( urlString ),
			dialog : ( ) => myDialog ( ),
			getKey : providerName => myGetKey ( providerName ),
			setKey : ( providerName, key ) => mySetKey ( providerName, key ),
			addProvider : provider => myAddProvider ( provider )
		}
	);
}

/*
--- theAPIKeysManager object -------------------------------------------------------------------------------------------

The one and only one noteEditor

-----------------------------------------------------------------------------------------------------------------------
*/

const theAPIKeysManager = newAPIKeysManager ( );

export { theAPIKeysManager };

/*
--- End of APIKeysManager.js file -------------------------------------------------------------------------------------
*/