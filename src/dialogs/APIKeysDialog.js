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
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newAPIKeysDialog };

import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { newPasswordDialog } from '../dialogs/PasswordDialog.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newDataEncryptor } from '../util/DataEncryptor.js';

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

	/*
	--- myOnOkButtonClick function ------------------------------------------------------------------------------------

	click event listener for the ok button

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkButtonClick ( ) {

		if ( ! myVerifyKeys ( ) ) {
			return;
		}

		return myGetAPIKeys ( );
	}

	/*
	--- myVerifyKeys function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myVerifyKeys ( ) {
		let returnValue = true;
		myAPIKeysDialog.hideError ( );
		let rows = myAPIKeysDiv.childNodes;
		for ( let counter = 0; counter < rows.length; counter ++ ) {
			returnValue = returnValue && '' !== rows [ counter ].childNodes [ 0 ].value;
			returnValue = returnValue && '' !== rows [ counter ].childNodes [ 1 ].value;
		}
		if ( ! returnValue ) {
			myAPIKeysDialog.showError ( theTranslator.getText ( 'APIKeysDialog - empty API key name or value' ) );
		}

		return returnValue;
	}

	/*
	--- myOnErrorEncrypt function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnErrorEncrypt ( ) {
		myAPIKeysDialog.showError ( theTranslator.getText ( 'APIKeysDialog - An error occurs when saving the keys' ) );
		myAPIKeysDialog.hideWait ( );
	}

	/*
	--- myOnOkEncrypt function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkEncrypt ( data ) {
		myAPIKeysDialog.hideError ( );
		myAPIKeysDialog.hideWait ( );
		var blobUrl = URL.createObjectURL ( data );
		var element = document.createElement ( 'a' );
		element.setAttribute ( 'href', blobUrl );
		element.setAttribute ( 'download', 'APIKeys' );
		element.style.display = 'none';
		document.body.appendChild ( element );
		element.click ( );
		document.body.removeChild ( element );
		window.URL.revokeObjectURL ( blobUrl );
	}

	/*
	--- myGetAPIKeys function -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetAPIKeys ( ) {
		let APIKeys = [];
		let rows = myAPIKeysDiv.childNodes;
		for ( let counter = 0; counter < rows.length; counter ++ ) {
			APIKeys.push (
				{
					providerName : rows [ counter ].childNodes [ 0 ].value,
					providerKey : rows [ counter ].childNodes [ 1 ].value
				}
			);
		}
		return APIKeys;
	}

	/*
	--- mySaveKeysToFile function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySaveKeysToFile ( ) {
		if ( ! myVerifyKeys ( ) ) {
			return;
		}
		myAPIKeysDialog.showWait ( );
		newDataEncryptor ( ).encryptData (
			new window.TextEncoder ( ).encode ( JSON.stringify ( myGetAPIKeys ( ) ) ),
			myOnOkEncrypt,
			myOnErrorEncrypt,
			newPasswordDialog ( true ).show ( )
		);
	}

	/*
	--- myOnOkDecrypt function ------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkDecrypt ( data ) {
		let APIKeys = null;
		try {
			APIKeys = JSON.parse ( new TextDecoder ( ).decode ( data ) );
		}
		catch ( err ) {
			myOnErrorDecrypt ( );
			return;
		}

		while ( myAPIKeysDiv.firstChild ) {
			myAPIKeysDiv.removeChild ( myAPIKeysDiv.firstChild );
		}

		APIKeys.forEach ( APIKey => myCreateAPIKeyRow ( APIKey ) );
		myAPIKeysDialog.hideWait ( );
		myAPIKeysDialog.hideError ( );
	}

	/*
	--- myOnErrorDecrypt function ------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function  myOnErrorDecrypt (  ) {
		myAPIKeysDialog.hideWait ( );
		myAPIKeysDialog.showError ( theTranslator.getText ( 'APIKeysDialog - An error occurs when reading the file' ) );
	}

	/*
	--- myOnOpenFileInputChange function ------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOpenFileInputChange ( event ) {
		myAPIKeysDialog.showWait ( );
		event.stopPropagation ( );
		var fileReader = new FileReader ( );
		fileReader.onload = function ( ) {
			newDataEncryptor ( ).decryptData (
				fileReader.result,
				myOnOkDecrypt,
				myOnErrorDecrypt,
				newPasswordDialog ( false ).show ( )
			);
		};
		fileReader.readAsArrayBuffer ( event.target.files [ 0 ] );

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
			event => { myOnOpenFileInputChange ( event ); },
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

	return myAPIKeysDialog;
}

/*
--- End of APIKeysDialog.js file --------------------------------------------------------------------------------------
*/