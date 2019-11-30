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

import { g_Translator } from '../UI/Translator.js';
import { g_Config } from '../data/Config.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { newPasswordDialog } from '../dialogs/PasswordDialog.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newDataEncryptor } from '../util/DataEncryptor.js';


/*
--- newAPIKeysDialog function -----------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newAPIKeysDialog ( APIkeysMap ) {
	
	let m_HTMLElementsFactory = newHTMLElementsFactory ( ) ;
	let m_APIKeysDialog = null;
	let m_ToolbarDiv = null;
	let m_APIKeysDiv = null;

	
	/*
	--- m_OnOkButtonClick function ------------------------------------------------------------------------------------

	click event listener for the ok button

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnOkButtonClick ( ) {

		if ( ! m_VerifyKeys ( ) ) {
			return;
		}
		
		return m_GetAPIKeys ( );
	}
	
	/*
	--- m_VerifyKeys function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_VerifyKeys ( ) {
		let returnValue = true;
		m_APIKeysDialog.hideError ( );
		let rows = m_APIKeysDiv.childNodes;
		for ( let counter = 0; counter < rows.length; counter ++ ) {
			returnValue &= ( '' !== rows [ counter ].childNodes [ 0 ].value && '' !== rows [ counter ].childNodes [ 1 ].value );		
		}
		if ( ! returnValue ) {
			m_APIKeysDialog.showError ( g_Translator.getText ( 'APIKeysDialog - empty API key name or value' ) );
		}
		
		return returnValue;
	}

	/*
	--- m_OnErrorEncrypt function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnErrorEncrypt ( ) {
		m_APIKeysDialog.showError ( g_Translator.getText ( 'APIKeysDialog - An error occurs when saving the keys' ) );
		m_APIKeysDialog.hideWait ( );
	}

	/*
	--- m_OnOkEncrypt function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnOkEncrypt ( data ) {
		m_APIKeysDialog.hideError ( );
		m_APIKeysDialog.hideWait ( );
		var blobUrl = URL.createObjectURL ( data );
		var element = document.createElement ( 'a' );
		element.setAttribute( 'href', blobUrl );
		element.setAttribute( 'download', 'APIKeys' );
		element.style.display = 'none';
		document.body.appendChild ( element );
		element.click ( );
		document.body.removeChild ( element );
		window.URL.revokeObjectURL ( blobUrl );		
	}

	/*
	--- m_GetAPIKeys function -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	function m_GetAPIKeys ( ) {
		let APIKeys = [];
		let rows = m_APIKeysDiv.childNodes;
		for ( let counter = 0; counter < rows.length; counter ++ ) {
			APIKeys.push ( 
				{ 
					providerName : rows [ counter ].childNodes [ 0 ].value,
					providerKey : rows [ counter ].childNodes [ 1 ].value
				}
			)
		}
		return APIKeys;
	}
	/*
	--- m_SaveKeysToFile function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_SaveKeysToFile ( ) {
		if ( ! m_VerifyKeys ( ) ) {
			return;
		}
		m_APIKeysDialog.showWait ( );
		newDataEncryptor ( ).encryptData ( 
			new window.TextEncoder ( ).encode ( JSON.stringify ( m_GetAPIKeys ( ) ) ), 
			m_OnOkEncrypt, 
			m_OnErrorEncrypt, 
			newPasswordDialog ( true ).show ( ) 
		);		
	}
	
	/*
	--- m_OnOkDecrypt function ------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnOkDecrypt ( data ) {
		let APIKeys = null;
		try {
			APIKeys = JSON.parse ( new TextDecoder ( ).decode ( data ) );
		}
		catch ( err ) {
			m_OnErrorDecrypt ( );
			return;
		}
		
		while ( m_APIKeysDiv.firstChild ) {
			m_APIKeysDiv.removeChild( m_APIKeysDiv.firstChild );
		}	
		
		APIKeys.forEach ( APIKey => m_CreateAPIKeyRow ( APIKey.providerKey, APIKey.providerName ) );
		m_APIKeysDialog.hideWait ( );
		m_APIKeysDialog.hideError ( );
	}
	
	/*
	--- m_OnErrorDecrypt function ------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function  m_OnErrorDecrypt (  ) {
		m_APIKeysDialog.hideWait ( );
		m_APIKeysDialog.showError ( g_Translator.getText ( 'APIKeysDialog - An error occurs when reading the file' ) );		
	}

	/*
	--- m_OnOpenFileInputChange function ------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnOpenFileInputChange ( event ) {
		m_APIKeysDialog.showWait ( );
		event.stopPropagation ( );
		var fileReader = new FileReader( );
		fileReader.onload = function ( ) {
			newDataEncryptor ( ).decryptData (
				fileReader.result,		
				m_OnOkDecrypt,
				m_OnErrorDecrypt,
				newPasswordDialog ( false ).show ( ) 
			);
		};
		fileReader.readAsArrayBuffer ( event.target.files [ 0 ] );

	}
	
	/*
	--- m_CreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateDialog ( ) {
		// the dialog base is created
		m_APIKeysDialog = newBaseDialog ( );
		m_APIKeysDialog.title = g_Translator.getText ( 'APIKeysDialog - API keys' );
		m_APIKeysDialog.okButtonListener = m_OnOkButtonClick;
		m_ToolbarDiv = m_HTMLElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-APIKeysDialog-ToolbarDiv',
				id : 'TravelNotes-APIKeysDialog-ToolbarDiv'
			},
			m_APIKeysDialog.content
		);
		m_APIKeysDiv = m_HTMLElementsFactory.create ( 
			'div', 
			{
				id : 'TravelNotes-APIKeysDialog-DataDiv'
			},
			m_APIKeysDialog.content
		);
	}
	
	
	/*
	--- m_CreateToolbar function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateToolbar ( ) {

		// save button
		m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-APIKeysDialog-SaveToFileButton', 
				className: 'TravelNotes-APIKeysDialog-Button', 
				title : g_Translator.getText ( 'APIKeysDialog - Save to file' ), 
				innerHTML : '&#x1f4be;'
			}, 
			m_ToolbarDiv 
		)
		.addEventListener ( 
			'click', 
			clickEvent => {
				clickEvent.stopPropagation ( );
				m_SaveKeysToFile ( );
			}, 
			false 
		);

		let openFileDiv = m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id: 'TravelNotes-APIKeysDialog-OpenFileDiv'
			}, 
			m_ToolbarDiv 
		);
		m_HTMLElementsFactory.create ( 
			'input',
			{
				id : 'TravelNotes-APIKeysDialog-OpenFileInput', 
				type : 'file'
			},
			openFileDiv
		)
		.addEventListener ( 
			'change', 
			event => { m_OnOpenFileInputChange ( event ) }, 
			false
		);
		let openFileFakeDiv = m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id: 'TravelNotes-APIKeysDialog-OpenFileFakeDiv'
			}, 
			openFileDiv 
		);
		m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-APIKeysDialog-OpenFileButton', 
				className: 'TravelNotes-APIKeysDialog-Button', 
				title : g_Translator.getText ( 'APIKeysDialog - Open file' ), 
				innerHTML : '&#x1F4C2;'
			}, 
			openFileFakeDiv 
		)
		.addEventListener ( 
			'click' , 
			( ) => { document.getElementById ( 'TravelNotes-APIKeysDialog-OpenFileInput' ).click ( ); }, 
			false 
		);
		
		m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-APIKeysDialog-NewKeyButton', 
				className: 'TravelNotes-APIKeysDialog-Button', 
				title : g_Translator.getText ( 'APIKeysDialog - new API key' ), 
				innerHTML : '+'
			}, 
			m_ToolbarDiv 
		)
		.addEventListener ( 
			'click', 
			clickEvent => {
				clickEvent.stopPropagation ( );
				m_CreateAPIKeyRow ( '', '' );
			}, 
			false 
		);
		
	}
	
	/*
	--- m_CreateAPIKeyRow function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateAPIKeyRow ( APIKeyValue, APIKeyName ) {
		let APIKeyRow = m_HTMLElementsFactory.create ( 
			'div',
			{
				className : 'TravelNotes-APIKeysDialog-ApiKeyRow'
			},
			m_APIKeysDiv
		);
		m_HTMLElementsFactory.create (
			'input',
			{
				className : 'TravelNotes-APIKeysDialog-ApiKeyName TravelNotes-APIKeysDialog-Input',
				value : APIKeyName,
				placeholder : g_Translator.getText ( 'APIKeysDialog - provider name' )
			},
			APIKeyRow
		);
		m_HTMLElementsFactory.create (
			'input',
			{
				className : 'TravelNotes-APIKeysDialog-ApiKeyValue TravelNotes-APIKeysDialog-Input',
				value : APIKeyValue,
				placeholder : g_Translator.getText ( 'APIKeysDialog - API key' ),
				type: g_Config.APIKeys.showAPIKeysInDialog ? 'text' : 'password'
			},
			APIKeyRow
		);
		
		m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				className: 'TravelNotes-APIKeysDialog-Button TravelNotes-APIKeysDialog-DeleteButton', 
				title : g_Translator.getText ( 'APIKeysDialog - delete API key' ), 
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
	--- m_CreateContent function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateContent ( ) {
		APIkeysMap.forEach ( ( APIKeyValue, APIKeyName ) => m_CreateAPIKeyRow ( APIKeyValue, APIKeyName  ) );
	}

	/*
	--- main function -------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	m_CreateDialog ( );
	m_CreateToolbar ( );
	m_CreateContent ( );
	
	return m_APIKeysDialog;
}

/*
--- End of APIKeysDialog.js file --------------------------------------------------------------------------------------
*/	
