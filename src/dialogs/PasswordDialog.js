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
--- PasswordDialog.js file --------------------------------------------------------------------------------------------
This file contains:
	- the newPasswordDialog.js function
Changes:
	- v1.6.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/
	
export { newPasswordDialog };

import { g_Translator } from '../UI/Translator.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

/*
--- newPasswordDialog function ----------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newPasswordDialog ( verifyPassword ) {
	
	let m_HTMLElementsFactory = newHTMLElementsFactory ( ) ;
	let m_PasswordDialog = null;
	let m_PasswordDiv = null;
	let m_PasswordInput = null
	
	/*
	--- m_OnOkButtonClick function ------------------------------------------------------------------------------------

	click event listener for the ok button

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnOkButtonClick ( ) {
		m_PasswordDialog.hideError ( );
		if ( verifyPassword ) {
			if ( ( m_PasswordInput.value.length < 12 ) || ! m_PasswordInput.value.match ( RegExp ( '[0-9]+' ) )|| ! m_PasswordInput.value.match ( RegExp ( '[a-z]+' ) )|| ! m_PasswordInput.value.match ( RegExp ( '[A-Z]+' ) ) || ! m_PasswordInput.value.match ( RegExp ( '[^0-9a-zA-Z]' ) ) ) {
				m_PasswordDialog.showError ( g_Translator.getText ( 'PasswordDialog - Password rules' )); 
				m_PasswordInput.focus ( );
				return;
			}
		}
		
		document.removeEventListener ( 'keydown', m_OnKeyDown, false );
		return new window.TextEncoder ( ).encode ( m_PasswordInput.value );
	}
	
	/*
	--- m_OnKeyDown function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnKeyDown ( keyBoardEvent ) {
		if ( 'Enter' === keyBoardEvent.key  ) {
			m_PasswordDialog.okButton.click ( );
		}
	}
	
	/*
	--- m_CreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnEscape ( ) {
		document.removeEventListener ( 'keydown', m_OnKeyDown, false );
		return true;
	}
	
	/*
	--- m_CreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateDialog ( ) {
		// the dialog base is created
		m_PasswordDialog = newBaseDialog ( );
		m_PasswordDialog.title = g_Translator.getText ( 'PasswordDialog - password' );
		m_PasswordDialog.okButtonListener = m_OnOkButtonClick;
		m_PasswordDiv = m_HTMLElementsFactory.create ( 
			'div', 
			{
				id : 'TravelNotes-PasswordDialog-DataDiv'
			},
			m_PasswordDialog.content
		);
		document.addEventListener ( 'keydown', m_OnKeyDown, false );
		m_PasswordDialog.escapeKeyListener = m_OnEscape;
	}
	
	/*
	--- m_CreateContent function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateContent ( ) {
		m_PasswordInput = m_HTMLElementsFactory.create ( 
			'input', 
			{
				id : 'TravelNotes-PasswordDialog-PasswordInput',
				type: 'password'
			},
			m_PasswordDiv
		);
		m_PasswordInput.focus ( );
	}

	/*
	--- main function -------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	m_CreateDialog ( );
	m_CreateContent ( );
	
	return m_PasswordDialog;
}

/*
--- End of PasswordDialog.js file -------------------------------------------------------------------------------------
*/	