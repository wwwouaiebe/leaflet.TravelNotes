/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- ErrorsUI.js file ---------------------------------------------------------------------------------------------
This file contains:
	- the newErrorsUI function
	- the gc_ErrorsUI object
Changes:
	- v1.6.0:
		- created
Doc reviewed 
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { gc_ErrorsUI };
import { g_Config } from '../data/Config.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { g_Translator } from '../UI/Translator.js';

/*
--- newErrorsUI function ----------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newErrorsUI ( ) {
	
	let m_ErrorDiv = null;
	let m_TimerId = null;
	let m_ShowHelpInput = null;
	let m_ShowHelpDiv = null;
	let m_CancelButton = null;
	let m_ShowHelp = g_Config.errorUI.showHelp;
	let m_HTMLElementsFactory = newHTMLElementsFactory ( );
	
	/*
	--- m_OnTimer function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnTimer ( ) {
		m_TimerId = null;
		m_ErrorDiv.classList.remove ( 'TravelNotes-ErrorUI-Error' );
		m_ErrorDiv.classList.remove ( 'TravelNotes-ErrorUI-Warning' );
		m_ErrorDiv.classList.remove ( 'TravelNotes-ErrorUI-Info' );
		m_ErrorDiv.classList.remove ( 'TravelNotes-ErrorUI-Help' );
		m_ErrorDiv.classList.add ( 'TravelNotes-ErrorUI-Hidden' );
		m_CancelButton.removeEventListener ( 'click', m_OnTimer, false );
		m_CancelButton = null;
		m_ShowHelpDiv = null;
		m_ErrorDiv.innerHTML = '';
	}
	
	/*
	--- m_AddHelpCheckbox function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_AddHelpCheckbox ( ) {
		m_ShowHelpDiv = m_HTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ErrorUI-HelpInputDiv'				
			},
			m_ErrorDiv
		);
		m_ShowHelpInput = m_HTMLElementsFactory.create (
			'input',
			{
				id : 'TravelNotes-ErrorUI-HelpInput',
				type : 'checkbox'
			},
			m_ShowHelpDiv
		);
		m_ShowHelpInput.addEventListener ( 'change', ( ) => { m_ShowHelp = m_ShowHelpInput.checked; }, false );
		m_HTMLElementsFactory.create (
			'label',
			{
				id : 'TravelNotes-ErrorUI-HelpInputLabel',
				for : 'TravelNotes-ErrorUI-HelpInput',
				innerHTML : g_Translator.getText ( 'ErrorUI - Dont show again' )
			},
			m_ShowHelpDiv
		);
	}

	/*
	--- m_Show function -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Show ( message, errorLevel ) {
		
		if (
			( 'Error' === errorLevel && ! g_Config.errorUI.showError ) 
				||
				( 'Warning' === errorLevel && ! g_Config.errorUI.showWarning ) 
				||
				( 'Info' === errorLevel && ! g_Config.errorUI.showInfo ) 
				||
				( 'Help' === errorLevel && ! g_Config.errorUI.showHelp ) 
				|| 
				( 'Help' === errorLevel && ! m_ShowHelp ) 
		) {
			return;
		}
		if ( m_TimerId ) {
			m_OnTimer ( );
		}
		
		let headerDiv = m_HTMLElementsFactory.create ( 
			'div',
			{
				id : 'TravelNotes-ErrorUI-Header'
			},
			m_ErrorDiv
		);
		m_CancelButton = m_HTMLElementsFactory.create (
			'span',
			{
				id : 'TravelNotes-ErrorUI-CancelButton',
				innerHTML : '&#x274c'
			},
			headerDiv
		);
		m_CancelButton.addEventListener ( 'click', m_OnTimer, false );
		m_HTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ErrorUI-Message',
				innerHTML : message
			},
			m_ErrorDiv
		);
	
		m_ErrorDiv.classList.add ( 'TravelNotes-ErrorUI-' + errorLevel );
		
		if ( 'Help' === errorLevel ) {
			m_AddHelpCheckbox ( );
		}

		m_ErrorDiv.classList.remove ( 'TravelNotes-ErrorUI-Hidden' );
		m_TimerId = setTimeout ( m_OnTimer, g_Config.errorUI.timeOut );
	}
	
	/*
	--- m_CreateUI function -------------------------------------------------------------------------------------------

	This function creates the UI
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateUI ( ) {
		
		if ( document.getElementById ( 'TravelNotes-ErrorUI' ) ) {
			return;
		}

		m_ErrorDiv = m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-ErrorUI', 
				className : 'TravelNotes-ErrorUI-Hidden'
			}, 
			document.getElementsByTagName ( 'body' ) [ 0 ]
		)
		
		
	}
			
	/*
	--- ErrorsUI object ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return {
		
		createUI : ( ) => m_CreateUI ( ),

		showError : error  => m_Show ( error, 'Error' ),
		
		showWarning : warning  => m_Show ( warning, 'Warning' ),
		
		showInfo : info  => m_Show ( info, 'Info' ),
		
		showHelp : help  => m_Show ( help, 'Help' )
		
	};
}

const gc_ErrorsUI = newErrorsUI ( );
	
/*
--- End of ErrorsUI.js file --------------------------------------------------------------------------------------
*/	