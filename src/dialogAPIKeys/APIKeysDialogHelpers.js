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

@file ApiKeysDialogHelpers.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module dialogAPIKeys
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theUtilities from '../util/Utilities.js';
import theTranslator from '../UI/Translator.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class DataEncryptorHandlers
@classdesc handlers for DataEncryptor
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class DataEncryptorHandlers {

	#APIKeysDialog = null;

	constructor ( APIKeysDialog ) {
		this.#APIKeysDialog = APIKeysDialog;
	}

	destructor ( ) {
		this.#APIKeysDialog = null;
	}

	/**
	onErrorDecrypt handler for the DataEncryptor
	*/

	onErrorDecrypt ( err ) {
		this.#APIKeysDialog.hideWait ( );
		this.#APIKeysDialog.keyboardEventListenerEnabled = true;
		if ( err && 'Canceled by user' !== err ) {
			this.#APIKeysDialog.showError (
				theTranslator.getText ( 'APIKeysDialog - An error occurs when reading the file' )
			);
		}
	}

	/**
	onOkDecrypt handler for the DataEncryptor
	*/

	onOkDecrypt ( data ) {
		try {
			this.#APIKeysDialog.addAPIKeys (
				JSON.parse ( new TextDecoder ( ).decode ( data ) )
			);
		}
		catch ( err ) {
			this.onErrorDecrypt ( err );
			return;
		}
		this.#APIKeysDialog.hideWait ( );
		this.#APIKeysDialog.hideError ( );
		this.#APIKeysDialog.keyboardEventListenerEnabled = true;
	}

	/**
	onOkEncrypt handler for the DataEncryptor
	@private
	*/

	#onOkEncrypt ( data ) {
		this.#APIKeysDialog.hideError ( );
		this.#APIKeysDialog.hideWait ( );
		theUtilities.saveFile ( 'APIKeys', data );
		this.#APIKeysDialog.keyboardEventListenerEnabled = true;
	}

	/**
	onErrorEncrypt handler for the DataEncryptor
	@private
	*/

	#onErrorEncrypt ( ) {
		this.#APIKeysDialog.showError (
			theTranslator.getText ( 'APIKeysDialog - An error occurs when saving the keys' )
		);
		this.#APIKeysDialog.hideWait ( );
		this.#APIKeysDialog.keyboardEventListenerEnabled = true;
	}

}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class SaveAPIKeysHelper
@classdesc shared methods for save to file buttons event listeners
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class SaveAPIKeysHelper {

	#APIKeysControls = null;

	constructor ( APIKeysControls ) {
		this.#APIKeysControls = APIKeysControls;
	}

	destructor ( ) {
		this.#APIKeysControls = null;
	}

	/**
	Transform the APIKeysControls value into a JSON string
	*/

	getAPIKeysJsonString ( ) {
		let APIKeys = [];
		this.#APIKeysControls.forEach (
			APIKeyControl => { APIKeys.push ( APIKeyControl.APIKey ); }
		);
		return JSON.stringify ( APIKeys );
	}

}

export { DataEncryptorHandlers, SaveAPIKeysHelper };

/*
@------------------------------------------------------------------------------------------------------------------------------

end of ApiKeysDialogHelpers.js file

@------------------------------------------------------------------------------------------------------------------------------
*/