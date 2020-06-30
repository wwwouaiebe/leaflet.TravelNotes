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
--- APIKeysDialog.js file ---------------------------------------------------------------------------------------------
This file contains:
	- the newAPIKeysDialog function
Changes:
	- v1.6.0:
		- created
	- v1.10.0:
		- Issue #107 : Add a button to reload the APIKeys file in the API keys dialog
	- v1.11.0:
		- Issue #108 : Add a warning when an error occurs when reading the APIKeys file at startup reopened
	- v1.11.0:
		- Issue #113 : When more than one dialog is opened, using thr Esc or Return key close all the dialogs
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { newPasswordDialog } from '../dialogs/PasswordDialog.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newUtilities } from '../util/Utilities.js';
import { newDataEncryptor } from '../util/DataEncryptor.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';
import { newHttpRequestBuilder } from '../util/HttpRequestBuilder.js';

import { ZERO, ONE } from '../util/Constants.js';

/*
--- newAPIKeysDialog function -----------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newAPIKeysDialog ( APIKeys ) {

	let myHTMLElementsFactory = newHTMLElementsFactory ( );
	let myAPIKeysDialog = null;
	let myToolbarDiv = null;
	let myAPIKeysDiv = null;
	let myOpenFileInput = null;
	let myOpenJsonFileInput = null;

	/*
	--- myGetAPIKeys function -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
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

	/*
	--- myVerifyKeys function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
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

	/*
	--- myOnOkButtonClick function ------------------------------------------------------------------------------------

	click event listener for the ok button

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkButtonClick ( ) {

		myAPIKeysDialog.hideError ( );
		if ( ! myVerifyKeys ( ) ) {
			return;
		}

		return myGetAPIKeys ( );
	}

	/*
	--- myCreateAPIKeyRow function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateAPIKeyRow ( APIKey ) {
		let APIKeyRow = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-APIKeysDialog-ApiKeyRow'
			},
			myAPIKeysDiv
		);
		myHTMLElementsFactory.create (
			'input',
			{
				className : 'TravelNotes-APIKeysDialog-ApiKeyName TravelNotes-APIKeysDialog-Input',
				value : APIKey.providerName,
				placeholder : theTranslator.getText ( 'APIKeysDialog - provider name' )
			},
			APIKeyRow
		);
		myHTMLElementsFactory.create (
			'input',
			{
				className : 'TravelNotes-APIKeysDialog-ApiKeyValue TravelNotes-APIKeysDialog-Input',
				value : APIKey.providerKey,
				placeholder : theTranslator.getText ( 'APIKeysDialog - API key' ),
				type : theConfig.APIKeys.showAPIKeysInDialog ? 'text' : 'password'
			},
			APIKeyRow
		);

		myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-APIKeysDialog-Button TravelNotes-APIKeysDialog-DeleteButton',
				title : theTranslator.getText ( 'APIKeysDialog - delete API key' ),
				innerHTML : '&#x274c'
			},
			APIKeyRow
		)
			.addEventListener (
				'click',
				clickEvent => {
					clickEvent.stopPropagation ( );
					clickEvent.target.parentNode.parentNode.removeChild ( clickEvent.target.parentNode );
				},
				false
			);

	}

	/*
	--- myOnErrorEncrypt function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnErrorEncrypt ( ) {
		myAPIKeysDialog.showError ( theTranslator.getText ( 'APIKeysDialog - An error occurs when saving the keys' ) );
		myAPIKeysDialog.hideWait ( );
		myAPIKeysDialog.keyboardEventListenerEnabled = true;
	}

	/*
	--- myOnOkEncrypt function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
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

	/*
	--- mySaveKeysToFile function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySaveKeysToFile ( ) {

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

	/*
	--- mySaveKeysToJsonFile function ---------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySaveKeysToJsonFile ( ) {
		myAPIKeysDialog.hideError ( );

		if ( ! myVerifyKeys ( ) ) {
			return;
		}
		newUtilities ( ).saveFile ( 'APIKeys.json', JSON.stringify ( myGetAPIKeys ( ) ) );
	}

	/*
	--- myOnErrorDecrypt function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnErrorDecrypt ( err ) {
		myAPIKeysDialog.hideWait ( );
		myAPIKeysDialog.keyboardEventListenerEnabled = true;
		if ( err && 'Canceled by user' !== err ) {
			myAPIKeysDialog.showError ( theTranslator.getText ( 'APIKeysDialog - An error occurs when reading the file' ) );
		}
	}

	/*
	--- myOnOkDecrypt function ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
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

	/*
	--- myOnReloadServerFile function ---------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnReloadServerFile ( clickEvent ) {
		clickEvent.stopPropagation ( );
		if ( theConfig.haveCrypto ) {
			myAPIKeysDialog.showWait ( );
			myAPIKeysDialog.keyboardEventListenerEnabled = false;
			newHttpRequestBuilder ( ).getBinaryPromise (
				window.location.href.substr ( ZERO, window.location.href.lastIndexOf ( '/' ) + ONE ) +
					'APIKeys'
			)
				.then (
					data => {
						newDataEncryptor ( ).decryptData (
							data,
							myOnOkDecrypt,
							myOnErrorDecrypt,
							newPasswordDialog ( false ).show ( )
						);
					}
				)
				.catch (
					() => {
						myAPIKeysDialog.showError (
							theTranslator.getText ( 'APIKeysDialog - An error occurs when loading the APIKeys file' )
						);
						myAPIKeysDialog.hideWait ( );
						myAPIKeysDialog.keyboardEventListenerEnabled = true;
					}
				);
		}

	}

	/*
	--- myOnOpenFileInputChange function ------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOpenFileInputChange ( changeEvent ) {
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

	/*
	--- myOnOpenJsonFileInputChange function --------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOpenJsonFileInputChange ( changeEvent ) {
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
				console.log ( err ? err : 'An error occurs when reading the file' );
			}
		};
		fileReader.readAsText ( changeEvent.target.files [ ZERO ] );
	}

	/*
	--- myCreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDialog ( ) {

		// the dialog base is created
		myAPIKeysDialog = newBaseDialog ( );
		myAPIKeysDialog.title = theTranslator.getText ( 'APIKeysDialog - API keys' );
		myAPIKeysDialog.okButtonListener = myOnOkButtonClick;
		myToolbarDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-APIKeysDialog-ToolbarDiv',
				id : 'TravelNotes-APIKeysDialog-ToolbarDiv'
			},
			myAPIKeysDialog.content
		);
		myAPIKeysDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-APIKeysDialog-DataDiv'
			},
			myAPIKeysDialog.content
		);
	}

	/*
	--- myCreateToolbar function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateToolbar ( ) {

		if ( theConfig.haveCrypto ) {

			// reload button
			myHTMLElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-APIKeysDialog-reloadFileButton',
					className : 'TravelNotes-APIKeysDialog-Button',
					title : theTranslator.getText ( 'APIKeysDialog - Reload from server' ),
					innerHTML : '&#x1f504;'
				},
				myToolbarDiv
			)
				.addEventListener ( 'click', myOnReloadServerFile, false );

			// save button
			myHTMLElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-APIKeysDialog-SaveToFileButton',
					className : 'TravelNotes-APIKeysDialog-Button',
					title : theTranslator.getText ( 'APIKeysDialog - Save to file' ),
					innerHTML : '&#x1f4be;'
				},
				myToolbarDiv
			)
				.addEventListener (
					'click',
					clickEvent => {
						clickEvent.stopPropagation ( );
						mySaveKeysToFile ( );
					},
					false
				);

			let openFileDiv = myHTMLElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-APIKeysDialog-OpenFileDiv'
				},
				myToolbarDiv
			);
			myOpenFileInput = myHTMLElementsFactory.create (
				'input',
				{
					id : 'TravelNotes-APIKeysDialog-OpenFileInput',
					type : 'file'
				},
				openFileDiv
			);
			myOpenFileInput.addEventListener (
				'change',
				changeEvent => { myOnOpenFileInputChange ( changeEvent ); },
				false
			);
			let openFileFakeDiv = myHTMLElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-APIKeysDialog-OpenFileFakeDiv'
				},
				openFileDiv
			);
			myHTMLElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-APIKeysDialog-OpenFileButton',
					className : 'TravelNotes-APIKeysDialog-Button',
					title : theTranslator.getText ( 'APIKeysDialog - Open file' ),
					innerHTML : '&#x1F4C2;'
				},
				openFileFakeDiv
			)
				.addEventListener (
					'click',
					( ) => { myOpenFileInput.click ( ); },
					false
				);
		}

		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-APIKeysDialog-NewKeyButton',
				className : 'TravelNotes-APIKeysDialog-Button',
				title : theTranslator.getText ( 'APIKeysDialog - new API key' ),
				innerHTML : '+'
			},
			myToolbarDiv
		)
			.addEventListener (
				'click',
				clickEvent => {
					clickEvent.stopPropagation ( );
					myCreateAPIKeyRow ( { providerName : '', providerKey : '' } );
				},
				false
			);

		if ( theConfig.APIKeys.dialogHaveUnsecureButtons ) {
			myHTMLElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-APIKeysDialog-SaveToJsonFileButton',
					className : 'TravelNotes-APIKeysDialog-Button',
					title : theTranslator.getText ( 'APIKeysDialog - Save to json file' ),
					innerHTML : '&#x1f4be;'
				},
				myToolbarDiv
			)
				.addEventListener (
					'click',
					clickEvent => {
						clickEvent.stopPropagation ( );
						mySaveKeysToJsonFile ( );
					},
					false
				);

			let openJsonFileDiv = myHTMLElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-APIKeysDialog-OpenJsonFileDiv'
				},
				myToolbarDiv
			);
			myOpenJsonFileInput = myHTMLElementsFactory.create (
				'input',
				{
					id : 'TravelNotes-APIKeysDialog-OpenJsonFileInput',
					type : 'file'
				},
				openJsonFileDiv
			);
			myOpenJsonFileInput.addEventListener (
				'change',
				changeEvent => { myOnOpenJsonFileInputChange ( changeEvent ); },
				false
			);
			let openJsonFileFakeDiv = myHTMLElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-APIKeysDialog-OpenJsonFileFakeDiv'
				},
				openJsonFileDiv
			);
			myHTMLElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-APIKeysDialog-OpenJsonFileButton',
					className : 'TravelNotes-APIKeysDialog-Button',
					title : theTranslator.getText ( 'APIKeysDialog - Open json file' ),
					innerHTML : '&#x1F4C2;'
				},
				openJsonFileFakeDiv
			)
				.addEventListener (
					'click',
					( ) => { myOpenJsonFileInput.click ( ); },
					false
				);
		}
	}

	/*
	--- myCreateContent function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateContent ( ) {
		APIKeys.forEach ( APIKey => myCreateAPIKeyRow ( APIKey ) );
	}

	/*
	--- main function -------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	myCreateDialog ( );
	myCreateToolbar ( );
	myCreateContent ( );
	theErrorsUI.showHelp ( theTranslator.getText ( 'Help - Complete the APIKeys' ) );

	return myAPIKeysDialog;
}

export { newAPIKeysDialog };

/*
--- End of APIKeysDialog.js file --------------------------------------------------------------------------------------
*/