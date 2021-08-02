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
Doc reviewed ...
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
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import DataEncryptor from '../util/DataEncryptor.js';
import theTranslator from '../UI/Translator.js';
import APIKeysDialogKeyControl from '../dialogs/APIKeysDialogKeyControl.js';
import { ZERO } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class APIKeysDialogEventListeners
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class APIKeysDialogEventListeners {

	static APIKeysDialog = null;
	static newAPIKeys = [];

	static APIKeysControls = new Map ( );

	static addAPIKey ( APIKey ) {
		let APIKeyControl = new APIKeysDialogKeyControl ( APIKey );
		APIKeysDialogEventListeners.APIKeysControls.set (
			APIKeyControl.objId,
			APIKeyControl
		);
	}

	static addAPIKeys ( APIKeys ) {
		APIKeysDialogEventListeners.APIKeysControls.clear ( );
		APIKeys.forEach ( APIKeysDialogEventListeners.addAPIKey );
	}

	static onAddNewAPIKeyClick ( ) {
		APIKeysDialogEventListeners.addAPIKey ( { providerName : '', providerKey : '' } );
		APIKeysDialogEventListeners.APIKeysDialog.refreshAPIKeys ( );
	}

	static onAPIKeyDeleted ( ApiKeyDeletedEvent ) {
		console.log ( 'b' );
		APIKeysDialogEventListeners.APIKeysControls.delete ( ApiKeyDeletedEvent.data.objId );
		APIKeysDialogEventListeners.APIKeysDialog.refreshAPIKeys ( );
	}

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
		APIKeysDialogEventListeners.APIKeysDialog.refreshAPIKeys ( );
		APIKeysDialogEventListeners.APIKeysDialog.hideWait ( );
		APIKeysDialogEventListeners.APIKeysDialog.hideError ( );

		// APIKeysDialogEventListeners.APIKeysDialog.keyboardEventListenerEnabled = true;
	}

	static #onErrorDecrypt ( err ) {
		APIKeysDialogEventListeners.APIKeysDialog.hideWait ( );

		// APIKeysDialogEventListeners.APIKeysDialog.keyboardEventListenerEnabled = true;
		if ( err && 'Canceled by user' !== err ) {
			APIKeysDialogEventListeners.APIKeysDialog.showError (
				theTranslator.getText ( 'APIKeysDialog - An error occurs when reading the file' )
			);
		}
	}

	static #onOpenSecureFileInputChange ( changeEvent ) {
		APIKeysDialogEventListeners.APIKeysDialog.hideError ( );
		APIKeysDialogEventListeners.APIKeysDialog.showWait ( );

		// APIKeysDialogEventListeners.APIKeysDialog.keyboardEventListenerEnabled = false;
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

	static onOpenSecureFileButtonClick ( ) {
		let OpenSecureFileInput = theHTMLElementsFactory.create ( 'input', { type : 'file' } );
		OpenSecureFileInput.addEventListener (
			'change',
			APIKeysDialogEventListeners.#onOpenSecureFileInputChange,
			false
		);
		OpenSecureFileInput.click ( );
	}
}

export default APIKeysDialogEventListeners;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of APIKeysDialogEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/