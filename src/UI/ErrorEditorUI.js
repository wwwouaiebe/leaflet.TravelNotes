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
--- ErrorEditorUI.js file ---------------------------------------------------------------------------------------------
This file contains:
	- the newErrorEditorUI function
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newErrorEditorUI };

import { g_Translator } from '../UI/Translator.js';
import { g_Config } from '../data/Config.js';

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

let g_TimerId = null;

function newErrorEditorUI ( ) {
			
	/*
	--- m_ReduceUI function -------------------------------------------------------------------------------------------

	This function reduces the UI
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ReduceUI ( ) {
		document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).classList.add ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-Control-ErrorMessageDiv' ).innerHTML = '';
	}
	
	/*
	--- m_SetMessage function -----------------------------------------------------------------------------------------

	This function add a message, expand the UI and start a timer
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SetMessage ( message ) {
		if ( g_TimerId ) {
			clearTimeout ( g_TimerId );
			g_TimerId = null;
		}
		document.getElementById ( 'TravelNotes-Control-ErrorMessageDiv' ).innerHTML = message;
		document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).classList.remove ( 'TravelNotes-Control-HiddenList' );
		g_TimerId = setTimeout ( m_ReduceUI, g_Config.errorMessages.timeout );
	}
	
	/*
	--- m_CreateUI function -------------------------------------------------------------------------------------------

	This function creates the UI
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateUI ( controlDiv ){ 
	
		if ( document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ) ) {
			return;
		}

		let htmlElementsFactory = newHTMLElementsFactory ( ) ;
		let dataDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-ErrorDataDiv', className : 'TravelNotes-Control-DataDiv TravelNotes-Control-HiddenList'}, controlDiv );
		let headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-ErrorHeaderDiv', className : 'TravelNotes-Control-HeaderDiv TravelNotes-Control-HiddenList'}, dataDiv );
		let expandButton = htmlElementsFactory.create (
			'span',
			{ 
				innerHTML : '&#x274c',
				title : g_Translator.getText ( 'ErrorEditorUI - Hide' ),
				id : 'TravelNotes-Control-ErrorExpandButton',
				className : 'TravelNotes-Control-HiddenList'
			},
			headerDiv 
		);
		expandButton.addEventListener ( 
			'click' ,
			clickEvent => {
				clickEvent.stopPropagation ( );
				if ( ! document.getElementById ( 'TravelNotes-Control-ErrorMessageDiv' ).innerHTML.length ) {
					return;
				}	
				m_ReduceUI ( );
			},
			false 
		);
		htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-ErrorMessageDiv'}, dataDiv );
	}
			
	/*
	--- ErrorEditorUI object ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return {
		
		createUI : controlDiv => m_CreateUI ( controlDiv ),

		set message ( message ) { m_SetMessage ( message );	},
		
		get message (  ) { return document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).innerHTML; }		
	};
}
	
/*
--- End of ErrorEditorUI.js file --------------------------------------------------------------------------------------
*/	