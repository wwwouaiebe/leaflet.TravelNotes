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
		- Issue #107 : Add a button to reload the APIKeys file in the API keys dialog
	- v1.11.0:
		- Issue #108 : Add a warning when an error occurs when reading the APIKeys file at startup reopened
	- v1.11.0:
		- Issue #113 : When more than one dialog is opened, using thr Esc or Return key close all the dialogs
	- v2.0.0:
		- Issue #135 : Remove innerHTML from code
		- Issue #137 : Remove html tags from json files
Doc reviewed 20200812
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file APIKeysDialog.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module APIKeysDialog
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { newPasswordDialog } from '../dialogs/PasswordDialog.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theUtilities } from '../util/Utilities.js';
import { newDataEncryptor } from '../util/DataEncryptor.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';
import { ZERO, ONE, HTTP_STATUS_OK } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewAPIKeysDialog
@desc constructor for APIKeysDialog objects
@param {Array.<APIKey>} APIKeys
@return {APIKeysDialog} an instance of APIKeysDialog object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/* eslint-disable-next-line max-statements */
function ourNewAPIKeysDialog ( APIKeys, haveAPIKeysFile ) {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class APIKeysDialog
	@classdesc a BaseDialog object completed for API keys
	@see {@link newAPIKeysDialog} for constructor
	@augments BaseDialog
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	let myAPIKeysDialog = null;
	let myToolbarDiv = null;
	let myAPIKeysDiv = null;
	let myOpenSecureFileInput = null;
	let myOpenUnsecureFileInput = null;
	let myReloadKeysFromServerFileButton = null;
	let mySaveKeysToSecureFileButton = null;
	let myRestoreKeysFromSecureFileButton = null;
	let myAddNewKeyButton = null;
	let mySaveKeysToUnsecureFileButton = null;
	let myRestoreKeysFromUnsecureFileButton = null;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myGetAPIKeys
	@desc This method returns the API keys
	@return {Array.<APIKey>}  An array with the API keys
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myGetAPIKeys ( ) {
		let dlgAPIKeys = [];
		let rows = myAPIKeysDiv.childNodes;
		for ( let counter = ZERO; counter < rows.length; counter ++ ) {
			dlgAPIKeys.push (
				{
					providerName : rows [ counter ].childNodes [ ZERO ].value,
					providerKey : rows [ counter ].childNodes [ ONE ].value
				}
			);
		}
		return dlgAPIKeys;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myVerifyKeys
	@desc This method validates the API keys
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myVerifyKeys ( ) {
		let returnValue = true;
		myAPIKeysDialog.hideError ( );
		let rows = myAPIKeysDiv.childNodes;
		for ( let counter = ZERO; counter < rows.length; counter ++ ) {
			returnValue = returnValue && '' !== rows [ counter ].childNodes [ ZERO ].value;
			returnValue = returnValue && '' !== rows [ counter ].childNodes [ ONE ].value;
		}
		if ( ! returnValue ) {
			myAPIKeysDialog.showError ( theTranslator.getText ( 'APIKeysDialog - empty API key name or value' ) );
		}

		return returnValue;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnDeleteApiKeyRowButton
	@desc Event listener for the delete API key buttons
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnDeleteApiKeyRowButton ( clickEvent ) {
		clickEvent.stopPropagation ( );
		clickEvent.target.parentNode.parentNode.removeChild ( clickEvent.target.parentNode );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateAPIKeyRow
	@desc This method creates a row in the API keys list
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateAPIKeyRow ( APIKey ) {
		let APIKeyRow = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-APIKeysDialog-ApiKeyRow'
			},
			myAPIKeysDiv
		);
		theHTMLElementsFactory.create (
			'input',
			{
				className : 'TravelNotes-APIKeysDialog-ApiKeyName TravelNotes-APIKeysDialog-Input',
				value : APIKey.providerName,
				placeholder : theTranslator.getText ( 'APIKeysDialog - provider name' )
			},
			APIKeyRow
		);
		theHTMLElementsFactory.create (
			'input',
			{
				className : 'TravelNotes-APIKeysDialog-ApiKeyValue TravelNotes-APIKeysDialog-Input',
				value : APIKey.providerKey,
				placeholder : theTranslator.getText ( 'APIKeysDialog - API key' ),
				type : theConfig.APIKeys.showAPIKeysInDialog ? 'text' : 'password'
			},
			APIKeyRow
		);

		theHTMLElementsFactory.create (
			'div',
			{
				className :
					'TravelNotes-BaseDialog-Button ' +
					'TravelNotes-APIKeysDialog-AtRightButton TravelNotes-APIKeysDialog-DeleteRowButton',
				title : theTranslator.getText ( 'APIKeysDialog - delete API key' ),
				textContent : '❌'
			},
			APIKeyRow
		)
			.addEventListener ( 'click', myOnDeleteApiKeyRowButton, false );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnErrorDecrypt
	@desc Error handler for the DataEncryptor
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnErrorDecrypt ( err ) {
		myAPIKeysDialog.hideWait ( );
		myAPIKeysDialog.keyboardEventListenerEnabled = true;
		if ( err && 'Canceled by user' !== err ) {
			myAPIKeysDialog.showError ( theTranslator.getText ( 'APIKeysDialog - An error occurs when reading the file' ) );
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnOkDecrypt
	@desc Succes handler for the DataEncryptor on decrypt
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkDecrypt ( data ) {
		let decryptedAPIKeys = null;
		try {
			decryptedAPIKeys = JSON.parse ( new TextDecoder ( ).decode ( data ) );
		}
		catch ( err ) {
			myOnErrorDecrypt ( err );
			return;
		}
		while ( myAPIKeysDiv.firstChild ) {
			myAPIKeysDiv.removeChild ( myAPIKeysDiv.firstChild );
		}
		decryptedAPIKeys.forEach ( APIKey => myCreateAPIKeyRow ( APIKey ) );
		myAPIKeysDialog.hideWait ( );
		myAPIKeysDialog.hideError ( );
		myAPIKeysDialog.keyboardEventListenerEnabled = true;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myDecryptAPIKeysFile
	@desc This method is called when a 'APIKeys' file is found on the web server
	The methos ask a password to the user and try to decode the file
	@param {ArrayBuffer} data the data to decode
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myDecryptAPIKeysFile ( data ) {
		newDataEncryptor ( ).decryptData (
			data,
			myOnOkDecrypt,
			myOnErrorDecrypt,
			newPasswordDialog ( false ).show ( )
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnReloadKeysFromServerFileButtonClick
	@desc Event listener for the reload server file button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnReloadKeysFromServerFileButtonClick ( clickEvent ) {
		clickEvent.stopPropagation ( );
		myAPIKeysDialog.showWait ( );
		myAPIKeysDialog.keyboardEventListenerEnabled = false;

		fetch ( window.location.href.substr ( ZERO, window.location.href.lastIndexOf ( '/' ) + ONE ) + 'APIKeys' )
			.then (
				response => {
					if ( HTTP_STATUS_OK === response.status && response.ok ) {
						response.arrayBuffer ( ).then ( myDecryptAPIKeysFile );
					}
					else {
						myOnErrorDecrypt ( new Error ( 'Invalid http status' ) );
					}
				}
			)
			.catch (
				err => {
					myOnErrorDecrypt ( err );
					if ( err instanceof Error ) {
						console.error ( err );
					}
				}
			);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnErrorEncrypt
	@desc Error handler for the DataEncryptor on encrypt
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnErrorEncrypt ( ) {
		myAPIKeysDialog.showError ( theTranslator.getText ( 'APIKeysDialog - An error occurs when saving the keys' ) );
		myAPIKeysDialog.hideWait ( );
		myAPIKeysDialog.keyboardEventListenerEnabled = true;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnOkEncrypt
	@desc Succes handler for the DataEncryptor on encrypt
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkEncrypt ( data ) {
		myAPIKeysDialog.hideError ( );
		myAPIKeysDialog.hideWait ( );
		let blobUrl = URL.createObjectURL ( data );
		let element = document.createElement ( 'a' );
		element.setAttribute ( 'href', blobUrl );
		element.setAttribute ( 'download', 'APIKeys' );
		element.style.display = 'none';
		document.body.appendChild ( element );
		element.click ( );
		document.body.removeChild ( element );
		window.URL.revokeObjectURL ( blobUrl );
		myAPIKeysDialog.keyboardEventListenerEnabled = true;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnSaveKeysToSecureFileButtonClick
	@desc Event listener for the save to secure file button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSaveKeysToSecureFileButtonClick ( clickEvent ) {
		clickEvent.stopPropagation ( );
		myAPIKeysDialog.hideError ( );
		if ( ! myVerifyKeys ( ) ) {
			return;
		}
		myAPIKeysDialog.showWait ( );
		myAPIKeysDialog.keyboardEventListenerEnabled = false;
		newDataEncryptor ( ).encryptData (
			new window.TextEncoder ( ).encode ( JSON.stringify ( myGetAPIKeys ( ) ) ),
			myOnOkEncrypt,
			myOnErrorEncrypt,
			newPasswordDialog ( true ).show ( )
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnRestoreKeysFromSecureFileButtonChange
	@desc Event listener for the restore from secure file button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnRestoreKeysFromSecureFileButtonChange ( changeEvent ) {
		myAPIKeysDialog.hideError ( );
		myAPIKeysDialog.showWait ( );
		myAPIKeysDialog.keyboardEventListenerEnabled = false;
		changeEvent.stopPropagation ( );
		let fileReader = new FileReader ( );
		fileReader.onload = function ( ) {
			newDataEncryptor ( ).decryptData (
				fileReader.result,
				myOnOkDecrypt,
				myOnErrorDecrypt,
				newPasswordDialog ( false ).show ( )
			);
		};
		fileReader.readAsArrayBuffer ( changeEvent.target.files [ ZERO ] );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnOpenSecureFileButtonClick
	@desc Event listener for the open secure file fake button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOpenSecureFileButtonClick ( ) {
		myOpenSecureFileInput.click ( );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnRestoreKeysFromSecureFileButtonChange
	@desc Event listener for the add new key button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnAddNewKeyButtonClick ( clickEvent ) {
		clickEvent.stopPropagation ( );
		myCreateAPIKeyRow ( { providerName : '', providerKey : '' } );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnSaveKeysToUnsecureFileButtonClick
	@desc Event listener for save keys to unsecure file button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSaveKeysToUnsecureFileButtonClick ( clickEvent ) {
		clickEvent.stopPropagation ( );
		myAPIKeysDialog.hideError ( );
		if ( ! myVerifyKeys ( ) ) {
			return;
		}
		theUtilities.saveFile ( 'APIKeys.json', JSON.stringify ( myGetAPIKeys ( ) ) );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnRestoreKeysFromUnecureFileButtonChange
	@desc Event listener for restore keys from unsecure file button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnRestoreKeysFromUnecureFileButtonChange ( changeEvent ) {
		changeEvent.stopPropagation ( );
		myAPIKeysDialog.hideError ( );
		let fileReader = new FileReader ( );
		fileReader.onload = function ( ) {
			try {
				let jsonAPIKeys = JSON.parse ( fileReader.result );

				while ( myAPIKeysDiv.firstChild ) {
					myAPIKeysDiv.removeChild ( myAPIKeysDiv.firstChild );
				}
				jsonAPIKeys.forEach ( jsonAPIKey => myCreateAPIKeyRow ( jsonAPIKey ) );
			}
			catch ( err ) {
				myAPIKeysDialog.showError ( err.message );
				if ( err instanceof Error ) {
					console.error ( err );
				}
			}
		};
		fileReader.readAsText ( changeEvent.target.files [ ZERO ] );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnOpenUnsecureFileButtonClick
	@desc Event listener for the open unsecure file fake button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOpenUnsecureFileButtonClick ( ) {
		myOpenUnsecureFileInput.click ( );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnOkButtonClick
	@desc Event listener for the ok button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkButtonClick ( ) {

		myAPIKeysDialog.hideError ( );
		if ( ! myVerifyKeys ( ) ) {
			return;
		}
		return myGetAPIKeys ( );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateDialog
	@desc This method creates the dialog
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDialog ( ) {
		myAPIKeysDialog = newBaseDialog ( );
		myAPIKeysDialog.title = theTranslator.getText ( 'APIKeysDialog - API keys' );
		myAPIKeysDialog.okButtonListener = myOnOkButtonClick;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateReloadKeysFromServerFileButton
	@desc This method creates the reload server file button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateReloadKeysFromServerFileButton ( ) {
		if ( haveAPIKeysFile ) {
			myReloadKeysFromServerFileButton = theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-BaseDialog-Button',
					title : theTranslator.getText ( 'APIKeysDialog - Reload from server' ),
					textContent : '🔄'
				},
				myToolbarDiv
			);
			myReloadKeysFromServerFileButton.addEventListener ( 'click', myOnReloadKeysFromServerFileButtonClick, false );
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateSaveKeysToSecureFileButton
	@desc This method creates the save to secure file button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateSaveKeysToSecureFileButton ( ) {
		mySaveKeysToSecureFileButton = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'APIKeysDialog - Save to file' ),
				textContent : '💾'
			},
			myToolbarDiv
		);
		mySaveKeysToSecureFileButton.addEventListener ( 'click', myOnSaveKeysToSecureFileButtonClick, false );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateRestoreKeysFromSecureFileButton
	@desc This method creates the restore from secure file button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateRestoreKeysFromSecureFileButton ( ) {
		myOpenSecureFileInput = theHTMLElementsFactory.create (
			'input',
			{
				className : 'TravelNotes-BaseDialog-OpenFileInput',
				type : 'file'
			},
			myToolbarDiv
		);
		myOpenSecureFileInput.addEventListener ( 'change', myOnRestoreKeysFromSecureFileButtonChange,	false );
		myRestoreKeysFromSecureFileButton = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'APIKeysDialog - Open file' ),
				textContent : '📂'
			},
			myToolbarDiv
		);
		myRestoreKeysFromSecureFileButton.addEventListener ( 'click', myOnOpenSecureFileButtonClick, false );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateAddNewKeyButton
	@desc This method creates the add new key button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateAddNewKeyButton ( ) {
		myAddNewKeyButton = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'APIKeysDialog - new API key' ),
				textContent : '+'
			},
			myToolbarDiv
		);
		myAddNewKeyButton.addEventListener ( 'click', myOnAddNewKeyButtonClick, false );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateSaveKeysToUnsecureFileButton
	@desc This method creates the save to unsecure file button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateSaveKeysToUnsecureFileButton ( ) {
		mySaveKeysToUnsecureFileButton = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button TravelNotes-APIKeysDialog-AtRightButton',
				title : theTranslator.getText ( 'APIKeysDialog - Save to json file' ),
				textContent : '💾'
			},
			myToolbarDiv
		);
		mySaveKeysToUnsecureFileButton.addEventListener ( 'click', myOnSaveKeysToUnsecureFileButtonClick, false );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateRestoreKeysFromUnsecureFileButton
	@desc This method creates the restore from unsecure file button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateRestoreKeysFromUnsecureFileButton ( ) {
		myOpenUnsecureFileInput = theHTMLElementsFactory.create (
			'input',
			{
				className : 'TravelNotes-BaseDialog-OpenFileInput',
				type : 'file'
			},
			myToolbarDiv
		);
		myOpenUnsecureFileInput.addEventListener ( 'change', myOnRestoreKeysFromUnecureFileButtonChange, false );
		myRestoreKeysFromUnsecureFileButton = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'APIKeysDialog - Open json file' ),
				textContent : '📂'
			},
			myToolbarDiv
		);
		myRestoreKeysFromUnsecureFileButton.addEventListener ( 'click', myOnOpenUnsecureFileButtonClick, false );

	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateToolbar
	@desc This method creates the toolbar of the dialog
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateToolbar ( ) {
		myToolbarDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-APIKeysDialog-ToolbarDiv'
			},
			myAPIKeysDialog.content
		);

		if ( window.crypto && window.crypto.subtle && window.crypto.subtle.importKey && window.isSecureContext ) {
			myCreateReloadKeysFromServerFileButton ( );
			myCreateSaveKeysToSecureFileButton ( );
			myCreateRestoreKeysFromSecureFileButton ( );
		}

		myCreateAddNewKeyButton ( );

		if ( theConfig.APIKeys.dialogHaveUnsecureButtons ) {
			myCreateSaveKeysToUnsecureFileButton ( );
			myCreateRestoreKeysFromUnsecureFileButton ( );
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateToolbar
	@desc This method creates the toolbar of the dialog
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateAPIKeysList ( ) {
		myAPIKeysDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-APIKeysDialog-DataDiv'
			},
			myAPIKeysDialog.content
		);
		APIKeys.forEach ( APIKey => myCreateAPIKeyRow ( APIKey ) );
	}

	myCreateDialog ( );
	myCreateToolbar ( );
	myCreateAPIKeysList ( );

	theErrorsUI.showHelp (
		'<p>' + theTranslator.getText ( 'Help - Complete the APIKeys1' ) + '</p>' +
		'<p>' + theTranslator.getText ( 'Help - Complete the APIKeys2' ) + '</p>' +
		'<p>' + theTranslator.getText ( 'Help - Complete the APIKeys3' ) + '</p>'
	);

	return myAPIKeysDialog;
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newAPIKeysDialog
	@desc constructor for APIKeysDialog objects
	@param {Array.<APIKey>} APIKeys
	@return {APIKeysDialog} an instance of APIKeysDialog object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewAPIKeysDialog as newAPIKeysDialog
};

/*
--- End of APIKeysDialog.js file --------------------------------------------------------------------------------------
*/