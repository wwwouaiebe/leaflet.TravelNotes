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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210802
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file APIKeysDialogEventListeners.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module APIKeysDialogEventListeners
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import PasswordDialog from '../dialogs/PasswordDialog.js';
import DataEncryptor from '../util/DataEncryptor.js';
import theUtilities from '../util/Utilities.js';
import theTranslator from '../UI/Translator.js';
import APIKeysDialogKeyControl from '../dialogs/APIKeysDialogKeyControl.js';
import { ZERO, ONE, HTTP_STATUS_OK } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class APIKeysDialogEventListeners
@classdesc Event listeners for the APIKeysDialog
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class APIKeysDialogEventListeners {

	/**
	A reference to the current APIKeysDialog
	*/

	static APIKeysDialog = null;

	/**
	A map where the APIKeysDialogKeyControl objects are stored
	*/

	static APIKeysControls = new Map ( );

	/**
	reset the global variables
	*/

	static reset ( ) {
		APIKeysDialogEventListeners.APIKeysDialog = null;
		APIKeysDialogEventListeners.APIKeysControls.clear ( );
	}

	/**
	Add a new APIKey and create a APIKeysDialogKeyControl for this APIKey
	@param {APIKey} APIKey The APIKey to add
	@private
	*/

	static #addAPIKey ( APIKey ) {
		let APIKeyControl = new APIKeysDialogKeyControl ( APIKey );
		APIKeysDialogEventListeners.APIKeysControls.set (
			APIKeyControl.objId,
			APIKeyControl
		);
	}

	/**
	Add an array of APIKeys to the APIKeysControls map and to the dialog
	*/

	static addAPIKeys ( APIKeys ) {
		APIKeysDialogEventListeners.APIKeysControls.clear ( );
		APIKeys.forEach ( APIKeysDialogEventListeners.#addAPIKey );
		APIKeysDialogEventListeners.APIKeysDialog.refreshAPIKeys ( );
	}

	/**
	event listener for the addNewAPIKeyButton on the toolbar.
	Create a new APIKey and add this APIKey to the APIKeysControls map and to the dialog
	*/

	static onAddNewAPIKeyButtonClick ( clickEvent ) {
		clickEvent.stopPropagation ( );
		APIKeysDialogEventListeners.#addAPIKey ( Object.seal ( { providerName : '', providerKey : '' } ) );
		APIKeysDialogEventListeners.APIKeysDialog.refreshAPIKeys ( );
	}

	/**
	apikeydeleted event listener.
	delete the APIKey from the APIKeysControls map and from the dialog
	*/

	static onAPIKeyDeleted ( ApiKeyDeletedEvent ) {
		ApiKeyDeletedEvent.stopPropagation ( );
		APIKeysDialogEventListeners.APIKeysControls.delete ( ApiKeyDeletedEvent.data.objId );
		APIKeysDialogEventListeners.APIKeysDialog.refreshAPIKeys ( );
	}

	/**
	Validate the APIKeys.
	Verify that the providerName and provider key are not empty.
	Verify duplicate providerName
	*/

	static validateAPIKeys ( ) {
		APIKeysDialogEventListeners.APIKeysDialog.hideError ( );
		let haveEmptyValues = false;
		let providersNames = [];
		APIKeysDialogEventListeners.APIKeysControls.forEach (
			APIKeyControl => {
				haveEmptyValues =
					haveEmptyValues ||
					'' === APIKeyControl.providerName
					||
					'' === APIKeyControl.providerKey;
				providersNames.push ( APIKeyControl.providerName );
			}
		);
		let haveDuplicate = false;
		providersNames.forEach (
			providerName => {
				haveDuplicate =
					haveDuplicate ||
					providersNames.indexOf ( providerName ) !== providersNames.lastIndexOf ( providerName );
			}
		);
		if ( haveEmptyValues ) {
			APIKeysDialogEventListeners.APIKeysDialog.showError (
				theTranslator.getText ( 'APIKeysDialog - empty API key name or value' )
			);
			return false;
		}
		else if ( haveDuplicate ) {
			APIKeysDialogEventListeners.APIKeysDialog.showError (
				theTranslator.getText ( 'APIKeysDialog - duplicate API key name found' )
			);
			return false;
		}
		return true;
	}

	/**
	Transform the APIKeysControls value into a JSON string
	@private
	*/

	static #getAPIKeysJsonString ( ) {
		let APIKeys = [];
		APIKeysDialogEventListeners.APIKeysControls.forEach (
			APIKeyControl => { APIKeys.push ( APIKeyControl.APIKey ); }
		);
		return JSON.stringify ( APIKeys );
	}

	/**
	click event listener for the SaveKeysToUnsecureFileButton
	*/

	static onSaveKeysToUnsecureFileButtonClick ( clickEvent ) {
		clickEvent.stopPropagation ( );
		if ( ! APIKeysDialogEventListeners.validateAPIKeys ( ) ) {
			return;
		}
		theUtilities.saveFile (
			'APIKeys.json',
			APIKeysDialogEventListeners.#getAPIKeysJsonString ( )
		);
	}

	/**
	onOkEncrypt handler for the DataEncryptor
	@private
	*/

	static #onOkEncrypt ( data ) {
		APIKeysDialogEventListeners.APIKeysDialog.hideError ( );
		APIKeysDialogEventListeners.APIKeysDialog.hideWait ( );
		theUtilities.saveFile (
			'APIKeys',
			data
		);

		APIKeysDialogEventListeners.APIKeysDialog.keyboardEventListenerEnabled = true;
	}

	/**
	onErrorEncrypt handler for the DataEncryptor
	@private
	*/

	static #onErrorEncrypt ( ) {
		APIKeysDialogEventListeners.APIKeysDialog.showError (
			theTranslator.getText ( 'APIKeysDialog - An error occurs when saving the keys' )
		);
		APIKeysDialogEventListeners.APIKeysDialog.hideWait ( );

		APIKeysDialogEventListeners.APIKeysDialog.keyboardEventListenerEnabled = true;
	}

	/**
	click event listener for the SaveKeysToSecureFileButton
	*/

	static onSaveKeysToSecureFileButtonClick ( clickEvent ) {
		clickEvent.stopPropagation ( );
		if ( ! APIKeysDialogEventListeners.validateAPIKeys ( ) ) {
			return;
		}
		APIKeysDialogEventListeners.APIKeysDialog.showWait ( );

		APIKeysDialogEventListeners.APIKeysDialog.keyboardEventListenerEnabled = false;

		new DataEncryptor ( ).encryptData (
			new window.TextEncoder ( ).encode ( APIKeysDialogEventListeners.#getAPIKeysJsonString ( ) ),
			APIKeysDialogEventListeners.#onOkEncrypt,
			APIKeysDialogEventListeners.#onErrorEncrypt,
			new PasswordDialog ( true ).show ( )
		);
	}

	/**
	onOkDecrypt handler for the DataEncryptor
	@private
	*/

	static #onOkDecrypt ( data ) {
		try {
			APIKeysDialogEventListeners.addAPIKeys (
				JSON.parse ( new TextDecoder ( ).decode ( data ) )
			);
		}
		catch ( err ) {
			APIKeysDialogEventListeners.onErrorDecrypt ( err );
			return;
		}
		APIKeysDialogEventListeners.APIKeysDialog.hideWait ( );
		APIKeysDialogEventListeners.APIKeysDialog.hideError ( );

		APIKeysDialogEventListeners.APIKeysDialog.keyboardEventListenerEnabled = true;
	}

	/**
	onErrorDecrypt handler for the DataEncryptor
	@private
	*/

	static #onErrorDecrypt ( err ) {
		APIKeysDialogEventListeners.APIKeysDialog.hideWait ( );

		APIKeysDialogEventListeners.APIKeysDialog.keyboardEventListenerEnabled = true;
		if ( err && 'Canceled by user' !== err ) {
			APIKeysDialogEventListeners.APIKeysDialog.showError (
				theTranslator.getText ( 'APIKeysDialog - An error occurs when reading the file' )
			);
		}
	}

	/**
	Change event listener for the OpenSecureFile action
	The input is created by theUtilities.openFile method
	See onOpenSecureFileButtonClick ( )
	@private
	*/

	static #onOpenSecureFileInputChange ( changeEvent ) {
		APIKeysDialogEventListeners.APIKeysDialog.hideError ( );
		APIKeysDialogEventListeners.APIKeysDialog.showWait ( );

		APIKeysDialogEventListeners.APIKeysDialog.keyboardEventListenerEnabled = false;
		changeEvent.stopPropagation ( );
		let fileReader = new FileReader ( );
		fileReader.onload = ( ) => {
			new DataEncryptor ( ).decryptData (
				fileReader.result,
				APIKeysDialogEventListeners.#onOkDecrypt,
				APIKeysDialogEventListeners.#onErrorDecrypt,
				new PasswordDialog ( false ).show ( )
			);
		};
		fileReader.readAsArrayBuffer ( changeEvent.target.files [ ZERO ] );
	}

	/**
	click event listener for the OpenSecureFileButton
	*/

	static onOpenSecureFileButtonClick ( ) {
		APIKeysDialogEventListeners.APIKeysDialog.hideError ( );
		theUtilities.openFile (	APIKeysDialogEventListeners.#onOpenSecureFileInputChange );
	}

	/**
	Change event listener for the OpenUnsecureFile action
	The input is created by theUtilities.openFile method
	See onOpenUnsecureFileButtonClick ( )
	@private
	*/

	static #onOpenUnsecureFileInputChange ( changeEvent ) {
		changeEvent.stopPropagation ( );
		let fileReader = new FileReader ( );
		fileReader.onload = ( ) => {
			try {
				APIKeysDialogEventListeners.addAPIKeys (
					JSON.parse ( fileReader.result )
				);
			}
			catch ( err ) {
				APIKeysDialogEventListeners.APIKeysDialog.showError ( err.message );
				if ( err instanceof Error ) {
					console.error ( err );
				}
			}
		};
		fileReader.readAsText ( changeEvent.target.files [ ZERO ] );
	}

	/**
	click event listener for the OpenSecureFileButton
	*/

	static onOpenUnsecureFileButtonClick ( ) {
		APIKeysDialogEventListeners.APIKeysDialog.hideError ( );
		theUtilities.openFile (	APIKeysDialogEventListeners.#onOpenUnsecureFileInputChange, '.json' );
	}

	/**
	click event listener for the ReloadAPIKeysFromServerButton
	*/

	static onReloadAPIKeysFromServerButtonClick ( clickEvent ) {
		clickEvent.stopPropagation ( );
		APIKeysDialogEventListeners.APIKeysDialog.hideError ( );
		APIKeysDialogEventListeners.APIKeysDialog.showWait ( );

		APIKeysDialogEventListeners.APIKeysDialog.keyboardEventListenerEnabled = false;

		// myAPIKeysDialog.keyboardEventListenerEnabled = false;

		fetch ( window.location.href.substr ( ZERO, window.location.href.lastIndexOf ( '/' ) + ONE ) + 'APIKeys' )
			.then (
				response => {
					if ( HTTP_STATUS_OK === response.status && response.ok ) {
						response.arrayBuffer ( ).then (
							data => {
								new DataEncryptor ( ).decryptData (
									data,
									APIKeysDialogEventListeners.#onOkDecrypt,
									APIKeysDialogEventListeners.#onErrorDecrypt,
									new PasswordDialog ( false ).show ( )
								);
							}
						);
					}
					else {
						APIKeysDialogEventListeners.#onErrorDecrypt ( new Error ( 'Invalid http status' ) );
					}
				}
			)
			.catch (
				err => {
					APIKeysDialogEventListeners.#onErrorDecrypt ( err );
					if ( err instanceof Error ) {
						console.error ( err );
					}
				}
			);
	}

}

export default APIKeysDialogEventListeners;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of APIKeysDialogEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/