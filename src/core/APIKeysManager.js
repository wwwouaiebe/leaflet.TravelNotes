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
	- v1.10.0:
		- Issue ♯107 : Add a button to reload the APIKeys file in the API keys dialog
	- v1.11.0:
		- Issue ♯108 : Add a warning when an error occurs when reading the APIKeys file at startup reopened
	- v2.0.0:
		- Issue ♯133 : Outphase reading the APIKeys with the url
		- Issue ♯137 : Remove html tags from json files
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests 20210903

-----------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file APIKeysManager.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
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

@module core
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import APIKeysDialog from '../dialogAPIKeys/APIKeysDialog.js';
import theUtilities from '../UILib/Utilities.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theConfig from '../data/Config.js';
import theEventDispatcher from '../coreLib/EventDispatcher.js';
import DataEncryptor from '../coreLib/DataEncryptor.js';
import PasswordDialog from '../dialogPassword/PasswordDialog.js';
import theTranslator from '../UILib/Translator.js';
import theErrorsUI from '../errorsUI/ErrorsUI.js';

import { ZERO, ONE, HTTP_STATUS_OK } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc API keys manager
@see {@link theAPIKeysManager} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class APIKeysManager {

	#haveAPIKeysFile = false;

	#APIKeysMap = new Map;

	/**
	This method is called when the 'APIKkeys' file is decoded correctly
	@param {string} decryptedData the decoded API keys as JSON string
	@private
	*/

	#onOkDecryptServerFile ( decryptedData ) {
		let APIKeys = JSON.parse ( new TextDecoder ( ).decode ( decryptedData ) );
		this.#resetAPIKeys ( APIKeys );
	}

	/**
	This method is called when the 'APIKkeys' file is not decoded correctly
	@param {Error} err
	@private
	*/

	#onErrorDecryptServerFile ( err ) {

		// Showing the error if not cancelled by user
		if ( err instanceof Error ) {
			console.error ( err );
		}
		if ( err && 'Canceled by user' !== err ) {
			theErrorsUI.showError (
				theTranslator.getText ( 'APIKeysManager - An error occurs when reading the APIKeys file' )
			);
		}
	}

	/**
	This method is called when a 'APIKeys' file is found on the web server
	The methos ask a password to the user and try to decode the file
	@param {ArrayBuffer} data the data to decode
	@private
	*/

	#onServerFileFound ( data ) {
		if ( window.isSecureContext && window.crypto && window.crypto.subtle && window.crypto.subtle.importKey ) {
			new DataEncryptor ( ).decryptData (
				data,
				decryptedData => this.#onOkDecryptServerFile ( decryptedData ),
				err => this.#onErrorDecryptServerFile ( err ),
				new PasswordDialog ( false ).show ( )
			);
		}
	}

	/**
	This method get an API key from the JS map
	@param {string} providerName the provider name
	@return {string} the API key
	@private
	*/

	#getAPIKey ( providerName ) {
		return this.#APIKeysMap.get ( providerName.toLowerCase ( ) );
	}

	/**
	 This method add an API key to the JS map
	@param {string} providerName the provider name
	@param {string} key the API key
	@private
	*/

	#setAPIKey ( providerName, key ) {
		this.#APIKeysMap.set ( providerName.toLowerCase ( ), key );
	}

	/**
	This method set the API keys from the session storage
	@return {!number} the number of API keys restored
	@private
	*/

	#setAPIKeysFromSessionStorage ( ) {
		let APIKeysCounter = ZERO;
		for ( let counter = ZERO; counter < sessionStorage.length; counter ++ ) {
			let keyName = sessionStorage.key ( counter );
			if ( 'ProviderKey' === keyName.substr ( keyName.length - 'ProviderKey'.length ) ) {
				this.#setAPIKey (
					keyName.substr ( ZERO, keyName.length - 'ProviderKey'.length ),
					atob ( sessionStorage.getItem ( keyName ) )
				);
				APIKeysCounter ++;
			}
		}
		theTravelNotesData.providers.forEach (
			provider => { provider.providerKey = ( this.#getAPIKey ( provider.name ) || '' ); }
		);
		return APIKeysCounter;
	}

	/**
	This method replace all the API keys from the map and storage with the given APIKeys
	@param {Array.<APIKey>} APIKeys the new APIKeys
	@fires providersadded
	@private
	*/

	#resetAPIKeys ( APIKeys ) {
		sessionStorage.clear ( );
		this.#APIKeysMap.clear ( );
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
				this.#setAPIKey ( APIKey.providerName, APIKey.providerKey );
			}
		);
		theTravelNotesData.providers.forEach (
			provider => { provider.providerKey = ( this.#getAPIKey ( provider.name ) || '' ); }
		);

		theEventDispatcher.dispatch ( 'providersadded' );
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	Verify that a provider key is known
	@param {string} providerName the provider name for witch the API key is searched
	@return {boolean} true when the provider API key is known
	*/

	hasKey ( providerName ) { return this.#APIKeysMap.has ( providerName.toLowerCase ( ) ); }

	/**
	Get the url from the layer
	@param {Object} layer the layer for witch the url must returned
	@return {string} the url for the given layer or null if the url cannot be given
	*/

	getUrl ( layer ) {
		if ( layer.providerKeyNeeded ) {
			let providerKey = this.#APIKeysMap.get ( layer.providerName.toLowerCase ( ) );
			if ( providerKey ) {
				return layer.url.replace ( '{providerKey}', providerKey );
			}
			return null;
		}
		return layer.url;
	}

	/**
	This method try to restore the API keys from the storage. If not possible the method search
	a file named 'APIKeys' on the web server. If the file is found, ask the file password to the user
	and try to decode the file.
	@fires providersadded
	@async
	*/

	setKeysFromServerFile ( ) {

		let keysRestoredFromStorage = false;

		// Try first to restore keys from storage
		if ( ZERO !== this.#setAPIKeysFromSessionStorage ( ) ) {
			theEventDispatcher.dispatch ( 'providersadded' );
			keysRestoredFromStorage = true;
		}

		// otherwise searching on the server
		fetch ( window.location.href.substr ( ZERO, window.location.href.lastIndexOf ( '/' ) + ONE ) + 'APIKeys' )
			.then (
				response => {
					if ( HTTP_STATUS_OK === response.status && response.ok ) {
						this.#haveAPIKeysFile = true;
						if ( ! keysRestoredFromStorage ) {
							response.arrayBuffer ( ).then ( data => this.#onServerFileFound ( data ) );
						}
					}
				}
			)
			.catch (
				err => {
					if ( err instanceof Error ) {
						console.error ( err );
					}
				}
			);
	}

	/**
	This method show the APIKeys dialog and update the APIKeys when the user close the dialog.
	@fires providersadded
	@async
	*/

	setKeysFromDialog ( ) {

		// preparing a list of providers and provider keys for the dialog
		let ApiKeys = [];
		this.#APIKeysMap.forEach (
			( providerKey, providerName ) => {
				ApiKeys.push ( Object.seal ( { providerName : providerName, providerKey : providerKey } ) );
			}
		);
		ApiKeys.sort ( ( first, second ) => first.providerName.localeCompare ( second.providerName ) );

		// showing dialog
		new APIKeysDialog ( ApiKeys, this.#haveAPIKeysFile )
			.show ( )
			.then ( APIKeys => this.#resetAPIKeys ( APIKeys ) )
			.catch (
				err => {
					if ( err instanceof Error ) {
						console.error ( err );
					}
				}
			);
	}

	/**
	This method add a provider
	@param {Provider} provider the provider to add
	*/

	addProvider ( providerClass ) {
		let provider = new providerClass ( );
		let providerName = provider.name.toLowerCase ( );

		// searching if we have already the provider key
		let providerKey = this.#getAPIKey ( providerName );

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

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of APIKeysManager class
@type {APIKeysManager}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theAPIKeysManager = new APIKeysManager ( );

export default theAPIKeysManager;

/*
--- End of APIKeysManager.js file ---------------------------------------------------------------------------------------------
*/