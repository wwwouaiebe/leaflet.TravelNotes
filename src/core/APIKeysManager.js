/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
	- v1.10.0:
		- Issue #107 : Add a button to reload the APIKeys file in the API keys dialog
	- v1.11.0:
		- Issue #108 : Add a warning when an error occurs when reading the APIKeys file at startup reopened
Doc reviewed 20200801
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file APIKeysManager.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} APIKey
@desc An object to store a provider name and  API key
@property {string} providerName The provider name
@property {string} providerKey The provider API key
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module APIKeysManager
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { newAPIKeysDialog } from '../dialogs/APIKeysDialog.js';
import { theUtilities } from '../util/Utilities.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theConfig } from '../data/Config.js';
import { theEventDispatcher } from '../util/EventDispatcher.js';
import { theHttpRequestBuilder } from '../util/HttpRequestBuilder.js';
import { newDataEncryptor } from '../util/DataEncryptor.js';
import { newPasswordDialog } from '../dialogs/PasswordDialog.js';
import { theTranslator } from '../UI/Translator.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';

import { ZERO, ONE, TWO } from '../util/Constants.js';

let ourKeysMap = new Map;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetKey
@desc This method get an API key from the JS map
@param {string} providerName the provider name
@return {string} the API key
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetKey ( providerName ) {
	return ourKeysMap.get ( providerName.toLowerCase ( ) );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourSetKey
@desc This method add an API key to the JS map
@param {string} providerName the provider name
@param {string} key the API key
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourSetKey ( providerName, key ) {
	ourKeysMap.set ( providerName.toLowerCase ( ), key );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourSetKeysFromSessionStorage
@desc This method set the API keys from the session storage
@return {!number} the number of API keys restored
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourSetKeysFromSessionStorage ( ) {
	let APIKeysCounter = ZERO;
	for ( let counter = ZERO; counter < sessionStorage.length; counter ++ ) {
		let keyName = sessionStorage.key ( counter );
		if ( 'ProviderKey' === keyName.substr ( keyName.length - 'ProviderKey'.length ) ) {
			ourSetKey (
				keyName.substr ( ZERO, keyName.length - 'ProviderKey'.length ),
				atob ( sessionStorage.getItem ( keyName ) )
			);
			APIKeysCounter ++;
		}
	}
	theTravelNotesData.providers.forEach (
		provider => { provider.providerKey = ( ourGetKey ( provider.name ) || '' ); }
	);
	return APIKeysCounter;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourResetAPIKeys
@desc This method replace all the API keys from the map and storage with the given APIKeys
@param {Array.<APIKey>} APIKeys the new APIKeys
@fires providersadded
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourResetAPIKeys ( APIKeys ) {
	sessionStorage.clear ( );
	ourKeysMap.clear ( );
	let saveToSessionStorage =
		theUtilities.storageAvailable ( 'sessionStorage' )
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
			ourSetKey ( APIKey.providerName, APIKey.providerKey );
		}
	);
	theTravelNotesData.providers.forEach (
		provider => { provider.providerKey = ( ourGetKey ( provider.name ) || '' ); }
	);

	theEventDispatcher.dispatch ( 'providersadded' );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnOkDecryptServerFile
@desc This method is called when the 'APIKkeys' file is decoded correctly
@param {string} data the decoded API keys as JSON string
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnOkDecryptServerFile ( data ) {
	let APIKeys = JSON.parse ( new TextDecoder ( ).decode ( data ) );
	ourResetAPIKeys ( APIKeys );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnErrorDecryptServerFile
@desc This method is called when the 'APIKkeys' file is not decoded correctly
@param {Error} err
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnErrorDecryptServerFile ( err ) {

	// Showing the error if not cancelled by user
	console.log ( err ? err : 'An error occurs when reading the APIKeys file' );
	if ( err && 'Canceled by user' !== err ) {
		theErrorsUI.showError (
			theTranslator.getText ( 'APIKeysManager - An error occurs when reading the APIKeys file' )
		);
	}

	// display help for the demo
	theErrorsUI.showHelp ( theTranslator.getText ( 'Help - Continue with interface' ) );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnServerFileFound
@desc This method is called when a 'APIKeys' file is found on the web server
The methos ask a password to the user and try to decode the file
@param {ArrayBuffer} data the data to decode
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnServerFileFound ( data ) {
	newDataEncryptor ( ).decryptData (
		data,
		ourOnOkDecryptServerFile,
		ourOnErrorDecryptServerFile,
		newPasswordDialog ( false ).show ( )
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc API keys manager
@see {@link theAPIKeysManager} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class APIKeysManager {

	/**
	Get a provider API key
	@param {string} providerName the provider name for witch the API key is asked
	@return {string} the provider API key or null if key not found
	*/

	getKey ( providerName ) { return ourGetKey ( providerName ); }

	/**
	This method try to restore the API keys from the storage. If not possible the method search
	a file named 'APIKeys' on the web server. If the file is found, ask the file password to the user
	and try to decode the file.
	@fires providersadded
	@async
	*/

	setKeysFromServerFile ( ) {

		// Try first to restore keys from storage
		if ( ZERO !== ourSetKeysFromSessionStorage ( ) ) {
			theEventDispatcher.dispatch ( 'providersadded' );
			return;
		}

		// otherwise searching on the server
		if ( theConfig.haveCrypto ) {
			theHttpRequestBuilder.getBinaryPromise (
				window.location.href.substr ( ZERO, window.location.href.lastIndexOf ( '/' ) + ONE ) +
					'APIKeys'
			)
				.then ( ourOnServerFileFound )
				.catch ( err => console.log ( err ? err : 'APIKeys not found on server' ) );
		}
	}

	/**
	This method set an API key from a string
	@param {string} urlString a string with the provider name followed by 'ProviderKey=' followed by the provider API key
	*/

	setKeyFromUrl ( urlString ) {
		let urlSubStrings = urlString.split ( '=' );
		if ( TWO === urlSubStrings.length ) {
			let providerName =
				urlSubStrings [ ZERO ]
					.substr ( ZERO, urlSubStrings [ ZERO ].length - 'ProviderKey'.length )
					.toLowerCase ( );
			let providerKey = urlSubStrings [ ONE ];
			if ( theUtilities.storageAvailable ( 'sessionStorage' ) && theConfig.APIKeys.saveToSessionStorage ) {
				sessionStorage.setItem ( providerName + 'ProviderKey', btoa ( providerKey ) );
			}
			ourSetKey ( providerName, providerKey );
			let provider = theTravelNotesData.providers.get ( providerName );
			if ( provider ) {
				provider.providerKey = providerKey;
			}
		}
	}

	/**
	This method show the APIKeys dialog and update the APIKeys when the user close the dialog.
	@fires providersadded
	@async
	*/

	setKeysFromDialog ( ) {

		// preparing a list of providers and provider keys for the dialog
		let ApiKeys = [];
		ourKeysMap.forEach (
			( providerKey, providerName ) => ApiKeys.push ( { providerName : providerName, providerKey : providerKey } )
		);
		ApiKeys.sort (
			( first, second ) => first.providerName.localeCompare ( second.providerName )
		);

		// showing dialog
		newAPIKeysDialog ( ApiKeys )
			.show ( )
			.then ( APIKeys => ourResetAPIKeys ( APIKeys ) )
			.catch ( err => console.log ( err ? err : 'canceled by user' ) );
	}

	/**
	This method add a provider
	@param {Provider} provider the provider to add
	*/

	addProvider ( provider ) {
		let providerName = provider.name.toLowerCase ( );

		// searching if we have already the provider key
		let providerKey = ourGetKey ( providerName );

		// no provider key. Searching in the storage
		if ( provider.providerKeyNeeded && ! providerKey ) {
			if ( theUtilities.storageAvailable ( 'sessionStorage' ) ) {
				providerKey = sessionStorage.getItem ( providerName );
				if ( providerKey ) {
					providerKey = atob ( providerKey );
				}
			}
		}

		// adding the provider key to the provider
		if ( provider.providerKeyNeeded && providerKey ) {
			provider.providerKey = providerKey;
		}

		// adding the provider to the available providers
		theTravelNotesData.providers.set ( provider.name.toLowerCase ( ), provider );
	}
}

const ourAPIKeysManager = Object.seal ( new APIKeysManager	);

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of APIKeysManager class
	@type {APIKeysManager}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourAPIKeysManager as theAPIKeysManager
};

/*
--- End of APIKeysManager.js file ---------------------------------------------------------------------------------------------
*/