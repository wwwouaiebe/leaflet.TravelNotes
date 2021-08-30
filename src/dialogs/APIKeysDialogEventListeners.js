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
/* eslint-disable max-lines */

import PasswordDialog from '../dialogs/PasswordDialog.js';
import DataEncryptor from '../util/DataEncryptor.js';
import theUtilities from '../util/Utilities.js';
import theTranslator from '../UI/Translator.js';
import APIKeysDialogKeyControl from '../dialogs/APIKeysDialogKeyControl.js';
import { ZERO, ONE, HTTP_STATUS_OK } from '../util/Constants.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class OpenSecureFileInputEventListener
@classdesc Event listener for the apikeydeleted event
@hideconstructor
@private

@--------------------------------------------------------------------------------------------------------------------------
*/

class OnAPIKeyDeletedEventListener {

	#APIKeysDialog = null;
	#APIKeysControls = null;

	constructor ( APIKeysDialog, APIKeysControls ) {
		this.#APIKeysDialog = APIKeysDialog;
		this.#APIKeysControls = APIKeysControls;
	}

	destructor ( ) {
		this.#APIKeysDialog = null;
		this.#APIKeysControls = null;
	}

	/**
	Event listener method
	*/

	handleEvent ( ApiKeyDeletedEvent ) {
		ApiKeyDeletedEvent.stopPropagation ( );
		this.#APIKeysControls.delete ( ApiKeyDeletedEvent.data.objId );
		this.#APIKeysDialog.refreshAPIKeys ( );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class OpenSecureFileInputEventListener
@classdesc Event listener for change event on the open unsecure file input
@hideconstructor
@private

@--------------------------------------------------------------------------------------------------------------------------
*/

class OpenUnsecureFileInputEventListener {

	#APIKeysDialog = null;

	constructor ( APIKeysDialog ) {
		this.#APIKeysDialog = APIKeysDialog;
	}

	destructor ( ) {
		this.#APIKeysDialog = null;
	}

	/**
	Event listener method
	*/

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

@class RestoreKeysFromUnsecureFileButtonEventListener
@classdesc Event listener for click event on the restore keys from unsecure file button based on the EventListener API.
@hideconstructor
@private

@--------------------------------------------------------------------------------------------------------------------------
*/

class RestoreKeysFromUnsecureFileButtonEventListener {

	#APIKeysDialog = null;
	#openUnsecureFileInputEventListener = null;

	constructor ( APIKeysDialog ) {
		this.#APIKeysDialog = APIKeysDialog;
		this.#openUnsecureFileInputEventListener = new OpenUnsecureFileInputEventListener ( this.#APIKeysDialog );
	}

	destructor ( ) {
		this.#APIKeysDialog = null;
		this.#openUnsecureFileInputEventListener.destructor ( );
	}

	/**
	Event listener method
	*/

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		this.#APIKeysDialog.hideError ( );
		theUtilities.openFile (	this.#openUnsecureFileInputEventListener, '.json' );

	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class DataEncryptorEventListeners
@classdesc onOkDecrypt and onErrorDecrypt event listeners for DataEncryptor
@hideconstructor
@private

@--------------------------------------------------------------------------------------------------------------------------
*/

class DataEncryptorEventListeners {

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
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class ReloadKeysFromServerButtonEventListener
@classdesc Event listener for click event on the reload keys from server file button based on the EventListener API.
@hideconstructor
@private

@--------------------------------------------------------------------------------------------------------------------------
*/

class ReloadKeysFromServerButtonEventListener {

	#APIKeysDialog = null;
	#dataEncryptorEventListener = null;

	constructor ( APIKeysDialog ) {
		this.#APIKeysDialog = APIKeysDialog;
		this.#dataEncryptorEventListener = new DataEncryptorEventListeners ( this.#APIKeysDialog );
	}

	destructor ( ) {
		this.#APIKeysDialog = null;
		this.#dataEncryptorEventListener.destructor ( );
	}

	/**
	Event listener method
	*/

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		this.#APIKeysDialog.hideError ( );
		this.#APIKeysDialog.showWait ( );
		this.#APIKeysDialog.keyboardEventListenerEnabled = false;

		fetch ( window.location.href.substr ( ZERO, window.location.href.lastIndexOf ( '/' ) + ONE ) + 'APIKeys' )
			.then (
				response => {
					if ( HTTP_STATUS_OK === response.status && response.ok ) {
						response.arrayBuffer ( ).then (
							data => {
								new DataEncryptor ( ).decryptData (
									data,
									tmpData => { this.#dataEncryptorEventListener.onOkDecrypt ( tmpData ); },
									err => { this.#dataEncryptorEventListener.onErrorDecrypt ( err ); },
									new PasswordDialog ( false ).show ( )
								);
							}
						);
					}
					else {
						this.#dataEncryptorEventListener.onErrorDecrypt ( new Error ( 'Invalid http status' ) );
					}
				}
			)
			.catch (
				err => {
					this.#dataEncryptorEventListener.onErrorDecrypt ( err );
					if ( err instanceof Error ) {
						console.error ( err );
					}
				}
			);
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class OpenSecureFileInputEventListener
@classdesc Event listener for change event on the open secure file input
@hideconstructor
@private

@--------------------------------------------------------------------------------------------------------------------------
*/

class OpenSecureFileInputEventListener {

	#APIKeysDialog = null;
	#dataEncryptorEventListener = null;

	constructor ( APIKeysDialog ) {
		this.#APIKeysDialog = APIKeysDialog;
		this.#dataEncryptorEventListener = new DataEncryptorEventListeners ( this.#APIKeysDialog );
	}

	destructor ( ) {
		this.#APIKeysDialog = null;
		this.#dataEncryptorEventListener.destructor ( );
	}

	/**
	Event listener method
	*/

	/**
	Event listener method
	*/

	handleEvent ( changeEvent ) {
		changeEvent.stopPropagation ( );
		this.#APIKeysDialog.showWait ( );
		this.#APIKeysDialog.keyboardEventListenerEnabled = false;
		let fileReader = new FileReader ( );
		fileReader.onload = ( ) => {
			new DataEncryptor ( ).decryptData (
				fileReader.result,
				data => { this.#dataEncryptorEventListener.onOkDecrypt ( data ); },
				err => { this.#dataEncryptorEventListener.onErrorDecrypt ( err ); },
				new PasswordDialog ( false ).show ( )
			);
		};
		fileReader.readAsArrayBuffer ( changeEvent.target.files [ ZERO ] );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class RestoreKeysFromSecureFileButtonEventListener
@classdesc Event listener for click event on the restore keys from secure file button based on the EventListener API.
@hideconstructor
@private

@--------------------------------------------------------------------------------------------------------------------------
*/

class RestoreKeysFromSecureFileButtonEventListener {

	#APIKeysDialog = null;
	#openSecureFileInputEventListener = null;

	constructor ( APIKeysDialog ) {
		this.#APIKeysDialog = APIKeysDialog;
		this.#openSecureFileInputEventListener = new OpenSecureFileInputEventListener ( this.#APIKeysDialog );
	}

	destructor ( ) {
		this.#APIKeysDialog = null;
		this.#openSecureFileInputEventListener.destructor ( );
	}

	/**
	Event listener method
	*/

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		this.#APIKeysDialog.hideError ( );
		theUtilities.openFile (	this.#openSecureFileInputEventListener );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class SaveAPIKeysHelper
@classdesc shared methods for save to file buttons
@hideconstructor
@private

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

/**
@--------------------------------------------------------------------------------------------------------------------------

@class SaveKeysToSecureFileButtonEventListener
@classdesc Event listener for click event on the saveAPIKeys to secure file button based on the EventListener API.
@hideconstructor
@private

@--------------------------------------------------------------------------------------------------------------------------
*/

class SaveKeysToSecureFileButtonEventListener {

	#APIKeysDialog = null;
	#APIKeysControls = null;
	#saveAPIKeysHelper = null;

	constructor ( APIKeysDialog, APIKeysControls ) {
		this.#APIKeysDialog = APIKeysDialog;
		this.#APIKeysControls = APIKeysControls;
		this.#saveAPIKeysHelper = new SaveAPIKeysHelper ( this.#APIKeysControls );
	}

	destructor ( ) {
		this.#APIKeysDialog = null;
		this.#APIKeysControls = null;
		this.#saveAPIKeysHelper.destructor ( );
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

	/**
	Event listener method
	*/

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		if ( ! this.#APIKeysDialog.validateAPIKeys ( ) ) {
			return;
		}
		this.#APIKeysDialog.showWait ( );

		this.#APIKeysDialog.keyboardEventListenerEnabled = false;

		new DataEncryptor ( ).encryptData (
			new window.TextEncoder ( ).encode ( this.#saveAPIKeysHelper.getAPIKeysJsonString ( ) ),
			data => this.#onOkEncrypt ( data ),
			( ) => this.#onErrorEncrypt ( ),
			new PasswordDialog ( true ).show ( )
		);
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class SaveKeysToUnsecureFileButtonEventListener
@classdesc Event listener for click event on the saveAPIKeys to unsecure file button based on the EventListener API.
@hideconstructor
@private

@--------------------------------------------------------------------------------------------------------------------------
*/

class SaveKeysToUnsecureFileButtonEventListener {

	#APIKeysDialog = null;
	#APIKeysControls = null;
	#saveAPIKeysHelper = null;

	constructor ( APIKeysDialog, APIKeysControls ) {
		this.#APIKeysDialog = APIKeysDialog;
		this.#APIKeysControls = APIKeysControls;
		this.#saveAPIKeysHelper = new SaveAPIKeysHelper ( this.#APIKeysControls );
	}

	destructor ( ) {
		this.#APIKeysDialog = null;
		this.#APIKeysControls = null;
		this.#saveAPIKeysHelper.destructor ( );
	}

	/**
	Event listener method
	*/

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

@class NewAPIKeyButtonEventListener
@classdesc Event listener for click event on the add new APIKey button based on the EventListener API.
@hideconstructor
@private

@--------------------------------------------------------------------------------------------------------------------------
*/

class NewAPIKeyButtonEventListener {

	#APIKeysDialog = null;
	#APIKeysControls = null;

	constructor ( APIKeysDialog, APIKeysControls ) {
		this.#APIKeysDialog = APIKeysDialog;
		this.#APIKeysControls = APIKeysControls;
	}

	destructor ( ) {
		this.#APIKeysDialog = null;
		this.#APIKeysControls = null;
	}

	/**
	Event listener method
	*/

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		let APIKey = Object.seal ( { providerName : '', providerKey : '' } );
		let APIKeyControl = new APIKeysDialogKeyControl ( APIKey );
		this.#APIKeysControls.set ( APIKeyControl.objId, APIKeyControl );
		this.#APIKeysDialog.refreshAPIKeys ( );
	}
}

export {
	OnAPIKeyDeletedEventListener,
	RestoreKeysFromUnsecureFileButtonEventListener,
	ReloadKeysFromServerButtonEventListener,
	RestoreKeysFromSecureFileButtonEventListener,
	SaveKeysToSecureFileButtonEventListener,
	SaveKeysToUnsecureFileButtonEventListener,
	NewAPIKeyButtonEventListener
};

/* eslint-enable max-lines */

/*
@------------------------------------------------------------------------------------------------------------------------------

end of APIKeysDialogEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/