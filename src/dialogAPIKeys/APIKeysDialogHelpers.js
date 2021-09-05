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
Doc reviewed 20210901
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

import theUtilities from '../UILib/Utilities.js';
import theTranslator from '../UILib/Translator.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class DataEncryptorHandlers
@classdesc handlers for DataEncryptor
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class DataEncryptorHandlers {

	#APIKeysDialog = null;

	/*
	constructor
	*/

	constructor ( APIKeysDialog ) {
		this.#APIKeysDialog = APIKeysDialog;
		Object.freeze ( this );
	}

	destructor ( ) {
		this.#APIKeysDialog = null;
	}

	/**
	onErrorDecrypt handler for the DataEncryptor
	*/

	onErrorDecrypt ( err ) {
		this.#APIKeysDialog.hideWait ( );
		this.#APIKeysDialog.keyboardELEnabled = true;
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
		this.#APIKeysDialog.keyboardELEnabled = true;
	}

	/**
	onOkEncrypt handler for the DataEncryptor
	@private
	*/

	onOkEncrypt ( data ) {
		this.#APIKeysDialog.hideError ( );
		this.#APIKeysDialog.hideWait ( );
		theUtilities.saveFile ( 'APIKeys', data );
		this.#APIKeysDialog.keyboardELEnabled = true;
	}

	/**
	onErrorEncrypt handler for the DataEncryptor
	@private
	*/

	onErrorEncrypt ( ) {
		this.#APIKeysDialog.showError (
			theTranslator.getText ( 'APIKeysDialog - An error occurs when saving the keys' )
		);
		this.#APIKeysDialog.hideWait ( );
		this.#APIKeysDialog.keyboardELEnabled = true;
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

	/*
	constructor
	*/

	constructor ( APIKeysControls ) {
		this.#APIKeysControls = APIKeysControls;
		Object.freeze ( this );
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