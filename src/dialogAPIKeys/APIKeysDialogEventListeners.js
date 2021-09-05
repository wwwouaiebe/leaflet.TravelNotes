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

@file APIKeysDialogEventListeners.js
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

import PasswordDialog from '../dialogPassword/PasswordDialog.js';
import DataEncryptor from '../coreLib/DataEncryptor.js';
import theUtilities from '../UILib/Utilities.js';
import APIKeysDialogKeyControl from '../dialogAPIKeys/APIKeysDialogKeyControl.js';
import { DataEncryptorHandlers, SaveAPIKeysHelper } from '../dialogAPIKeys/APIKeysDialogHelpers.js';

import { ZERO, ONE, HTTP_STATUS_OK } from '../main/Constants.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class APIKeyDeletedEL
@classdesc Event listener for the apikeydeleted event
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class APIKeyDeletedEL {

	#APIKeysDialog = null;
	#APIKeysControls = null;

	/*
	constructor
	*/

	constructor ( APIKeysDialog, APIKeysControls ) {
		this.#APIKeysDialog = APIKeysDialog;
		this.#APIKeysControls = APIKeysControls;
		Object.freeze ( this );
	}

	destructor ( ) {
		this.#APIKeysDialog = null;
		this.#APIKeysControls = null;
	}

	handleEvent ( ApiKeyDeletedEvent ) {
		ApiKeyDeletedEvent.stopPropagation ( );
		this.#APIKeysControls.delete ( ApiKeyDeletedEvent.data.objId );
		this.#APIKeysDialog.refreshAPIKeys ( );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class OpenUnsecureFileChangeEL
@classdesc change event listener for the open unsecure file input
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class OpenUnsecureFileChangeEL {

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

	handleEvent ( changeEvent ) {
		changeEvent.stopPropagation ( );
		let fileReader = new FileReader ( );
		fileReader.onload = ( ) => {
			try {
				this.#APIKeysDialog.addAPIKeys (
					JSON.parse ( fileReader.result )
				);
			}
			catch ( err ) {
				this.#APIKeysDialog.showError ( err.message );
				if ( err instanceof Error ) {
					console.error ( err );
				}
			}
		};
		fileReader.readAsText ( changeEvent.target.files [ ZERO ] );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class RestoreFromUnsecureFileButtonClickEL
@classdesc click event listener for the restore keys from unsecure file button
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class RestoreFromUnsecureFileButtonClickEL {

	#APIKeysDialog = null;
	#openUnsecureFileInputEventListener = null;

	/*
	constructor
	*/

	constructor ( APIKeysDialog ) {
		this.#APIKeysDialog = APIKeysDialog;
		this.#openUnsecureFileInputEventListener = new OpenUnsecureFileChangeEL ( this.#APIKeysDialog );
		Object.freeze ( this );
	}

	destructor ( ) {
		this.#APIKeysDialog = null;
		this.#openUnsecureFileInputEventListener.destructor ( );
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		this.#APIKeysDialog.hideError ( );
		theUtilities.openFile (	this.#openUnsecureFileInputEventListener, '.json' );

	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class ReloadFromServerButtonClickEL
@classdesc click event listener for the reload keys from server file button
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class ReloadFromServerButtonClickEL {

	#APIKeysDialog = null;
	#dataEncryptorHandlers = null;

	/*
	constructor
	*/

	constructor ( APIKeysDialog ) {
		this.#APIKeysDialog = APIKeysDialog;
		this.#dataEncryptorHandlers = new DataEncryptorHandlers ( this.#APIKeysDialog );
		Object.freeze ( this );
	}

	destructor ( ) {
		this.#APIKeysDialog = null;
		this.#dataEncryptorHandlers.destructor ( );
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		this.#APIKeysDialog.hideError ( );
		this.#APIKeysDialog.showWait ( );
		this.#APIKeysDialog.keyboardELEnabled = false;

		fetch ( window.location.href.substr ( ZERO, window.location.href.lastIndexOf ( '/' ) + ONE ) + 'APIKeys' )
			.then (
				response => {
					if ( HTTP_STATUS_OK === response.status && response.ok ) {
						response.arrayBuffer ( ).then (
							data => {
								new DataEncryptor ( ).decryptData (
									data,
									tmpData => { this.#dataEncryptorHandlers.onOkDecrypt ( tmpData ); },
									err => { this.#dataEncryptorHandlers.onErrorDecrypt ( err ); },
									new PasswordDialog ( false ).show ( )
								);
							}
						);
					}
					else {
						this.#dataEncryptorHandlers.onErrorDecrypt ( new Error ( 'Invalid http status' ) );
					}
				}
			)
			.catch (
				err => {
					this.#dataEncryptorHandlers.onErrorDecrypt ( err );
					if ( err instanceof Error ) {
						console.error ( err );
					}
				}
			);
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class OpenSecureFileChangeEL
@classdesc Change event listener for the open secure file input
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class OpenSecureFileChangeEL {

	#APIKeysDialog = null;
	#dataEncryptorHandlers = null;

	/*
	constructor
	*/

	constructor ( APIKeysDialog ) {
		this.#APIKeysDialog = APIKeysDialog;
		this.#dataEncryptorHandlers = new DataEncryptorHandlers ( this.#APIKeysDialog );
		Object.freeze ( this );
	}

	destructor ( ) {
		this.#APIKeysDialog = null;
		this.#dataEncryptorHandlers.destructor ( );
	}

	handleEvent ( changeEvent ) {
		changeEvent.stopPropagation ( );
		this.#APIKeysDialog.showWait ( );
		this.#APIKeysDialog.keyboardELEnabled = false;
		let fileReader = new FileReader ( );
		fileReader.onload = ( ) => {
			new DataEncryptor ( ).decryptData (
				fileReader.result,
				data => { this.#dataEncryptorHandlers.onOkDecrypt ( data ); },
				err => { this.#dataEncryptorHandlers.onErrorDecrypt ( err ); },
				new PasswordDialog ( false ).show ( )
			);
		};
		fileReader.readAsArrayBuffer ( changeEvent.target.files [ ZERO ] );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class RestoreFromSecureFileButtonClickEL
@classdesc click event listener for the restore keys from secure file button
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class RestoreFromSecureFileButtonClickEL {

	#APIKeysDialog = null;
	#openSecureFileInputEventListener = null;

	/*
	constructor
	*/

	constructor ( APIKeysDialog ) {
		this.#APIKeysDialog = APIKeysDialog;
		this.#openSecureFileInputEventListener = new OpenSecureFileChangeEL ( this.#APIKeysDialog );
		Object.freeze ( this );
	}

	destructor ( ) {
		this.#APIKeysDialog = null;
		this.#openSecureFileInputEventListener.destructor ( );
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		this.#APIKeysDialog.hideError ( );
		theUtilities.openFile (	this.#openSecureFileInputEventListener );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class SaveToSecureFileButtonClickEL
@classdesc Click event listener for the saveAPIKeys to secure file button
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class SaveToSecureFileButtonClickEL {

	#APIKeysDialog = null;
	#APIKeysControls = null;
	#saveAPIKeysHelper = null;
	#dataEncryptorHandlers = null;

	/*
	constructor
	*/

	constructor ( APIKeysDialog, APIKeysControls ) {
		this.#APIKeysDialog = APIKeysDialog;
		this.#APIKeysControls = APIKeysControls;
		this.#saveAPIKeysHelper = new SaveAPIKeysHelper ( this.#APIKeysControls );
		this.#dataEncryptorHandlers = new DataEncryptorHandlers ( this.#APIKeysDialog );
		Object.freeze ( this );
	}

	destructor ( ) {
		this.#APIKeysDialog = null;
		this.#APIKeysControls = null;
		this.#saveAPIKeysHelper.destructor ( );
		this.#dataEncryptorHandlers.destructor ( );
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		if ( ! this.#APIKeysDialog.validateAPIKeys ( ) ) {
			return;
		}
		this.#APIKeysDialog.showWait ( );

		this.#APIKeysDialog.keyboardELEnabled = false;

		new DataEncryptor ( ).encryptData (
			new window.TextEncoder ( ).encode ( this.#saveAPIKeysHelper.getAPIKeysJsonString ( ) ),
			data => this.#dataEncryptorHandlers.onOkEncrypt ( data ),
			( ) => this.#dataEncryptorHandlers.onErrorEncrypt ( ),
			new PasswordDialog ( true ).show ( )
		);
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class SaveToUnsecureFileButtonClickEL
@classdesc Click event listener for the saveAPIKeys to unsecure file button
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class SaveToUnsecureFileButtonClickEL {

	#APIKeysDialog = null;
	#APIKeysControls = null;
	#saveAPIKeysHelper = null;

	/*
	constructor
	*/

	constructor ( APIKeysDialog, APIKeysControls ) {
		this.#APIKeysDialog = APIKeysDialog;
		this.#APIKeysControls = APIKeysControls;
		this.#saveAPIKeysHelper = new SaveAPIKeysHelper ( this.#APIKeysControls );
		Object.freeze ( this );
	}

	destructor ( ) {
		this.#APIKeysDialog = null;
		this.#APIKeysControls = null;
		this.#saveAPIKeysHelper.destructor ( );
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		if ( ! this.#APIKeysDialog.validateAPIKeys ( ) ) {
			return;
		}
		theUtilities.saveFile (
			'APIKeys.json',
			this.#saveAPIKeysHelper.getAPIKeysJsonString ( ),
			'application/json'
		);
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class NewAPIKeyButtonClickEL
@classdesc Click event listener for the add new APIKey button
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class NewAPIKeyButtonClickEL {

	#APIKeysDialog = null;
	#APIKeysControls = null;

	/*
	constructor
	*/

	constructor ( APIKeysDialog, APIKeysControls ) {
		this.#APIKeysDialog = APIKeysDialog;
		this.#APIKeysControls = APIKeysControls;
		Object.freeze ( this );
	}

	destructor ( ) {
		this.#APIKeysDialog = null;
		this.#APIKeysControls = null;
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		let APIKey = Object.seal ( { providerName : '', providerKey : '' } );
		let APIKeyControl = new APIKeysDialogKeyControl ( APIKey );
		this.#APIKeysControls.set ( APIKeyControl.objId, APIKeyControl );
		this.#APIKeysDialog.refreshAPIKeys ( );
	}
}

export {
	APIKeyDeletedEL,
	RestoreFromUnsecureFileButtonClickEL,
	ReloadFromServerButtonClickEL,
	RestoreFromSecureFileButtonClickEL,
	SaveToSecureFileButtonClickEL,
	SaveToUnsecureFileButtonClickEL,
	NewAPIKeyButtonClickEL
};

/*
@------------------------------------------------------------------------------------------------------------------------------

end of APIKeysDialogEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/