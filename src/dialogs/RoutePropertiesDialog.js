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
--- RoutePropertiesDialog.js file -------------------------------------------------------------------------------------
This file contains:
	- the newRoutePropertiesDialog function
Changes:
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #36: Add a linetype property to route
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #66 : Work with promises for dialogs
Doc reviewed 20191124
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/
	
'use strict';

export { newRoutePropertiesDialog };

import { g_Translator } from '../UI/Translator.js';
import { g_Config } from '../data/Config.js';
import { newColorDialog } from '../dialogs/ColorDialog.js';
import { newHTMLElementsFactory } from '../UI/HTMLElementsFactory.js';

/*
--- newRoutePropertiesDialog function ---------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newRoutePropertiesDialog ( route ) {
	
	let m_HTMLElementsFactory = newHTMLElementsFactory ( ) ;
	let m_RoutePropertiesDialog = null;
	let m_RoutePropertiesDiv = null;
	let m_WidthInput = null;
	let m_ChainInput = null;
	let m_DashSelect = null;
	/*
	--- m_OnOkButtonClick function ------------------------------------------------------------------------------------

	click event listener for the ok button

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnOkButtonClick ( ) {
		route.color = document.getElementById ( 'TravelNotes-ColorDialog-ColorSampleDiv' ).color;
		route.width = parseInt ( m_WidthInput.value );
		route.chain = m_ChainInput.checked;
		route.dashArray = m_DashSelect.selectedIndex;

		return route;
	}

	/*
	--- m_CreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateDialog ( ) {
		// the dialog base is created
		m_RoutePropertiesDialog = newColorDialog ( route.color );
		m_RoutePropertiesDialog.title = g_Translator.getText ( 'RoutePropertiesDialog - Route properties' );
		m_RoutePropertiesDialog.okButtonListener = m_OnOkButtonClick;
	}

	/*
	--- m_CreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateRoutePropertiesDiv ( ) {
		m_RoutePropertiesDiv = m_HTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-RoutePropertiesDialog-MainDataDiv'
			},
			m_RoutePropertiesDialog.content
		);
	}
	
	/*
	--- m_CreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateWidthDiv ( ) {
		let widthDiv = m_HTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-WithDiv'
			},
			m_RoutePropertiesDiv
		);
		widthDiv.innerHTML = '<span>' + g_Translator.getText ( 'RoutePropertiesDialog - Width') + '</span>';
		m_WidthInput =  m_HTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				id : 'TravelNotes-RoutePropertiesDialog-WidthInput'
				
			},
			widthDiv
		);
		m_WidthInput.value = route.width;
		m_WidthInput.min = 1;
		m_WidthInput.max = 40;
	}

	/*
	--- m_CreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateDashDiv ( ) {
		let dashDiv = m_HTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-dashDiv'
			},
			m_RoutePropertiesDiv
		);
		dashDiv.innerHTML = '<span>' + g_Translator.getText ( 'RoutePropertiesDialog - Linetype') + '</span>';
		m_DashSelect = m_HTMLElementsFactory.create (
			'select',
			{
				className : 'TravelNotes-RoutePropertiesDialog-Select',
				id : 'TravelNotes-RoutePropertiesDialog-DashSelect'
			},
			dashDiv
		);

		let dashChoices = g_Config.route.dashChoices;
		for ( let optionsCounter = 0; optionsCounter < dashChoices.length; optionsCounter ++ ) {
			m_DashSelect.add ( m_HTMLElementsFactory.create ( 'option', { text :  dashChoices [ optionsCounter ].text } ) );
		}
		m_DashSelect.selectedIndex = route.dashArray < dashChoices.length ? route.dashArray : 0;
	}
	
	/*
	--- m_CreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateChainDiv ( ) {
		let chainDiv = m_HTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-ChainDiv'
			},
			m_RoutePropertiesDiv
		);
		chainDiv.innerHTML = '<span>' + g_Translator.getText ( 'RoutePropertiesDialog - Chained route') + '</span>';
		m_ChainInput =  m_HTMLElementsFactory.create (
			'input',
			{
				type : 'checkbox',
				id : 'TravelNotes-RoutePropertiesDialog-ChainInput'			
			},
			chainDiv
		);
		m_ChainInput.checked = route.chain;
	}


	
	m_CreateDialog ( );
	m_CreateRoutePropertiesDiv ( );
	m_CreateWidthDiv ( );
	m_CreateDashDiv ( );
	m_CreateChainDiv ( );
	
	return m_RoutePropertiesDialog;
}

/*
--- End of RoutePropertiesDialog.js file ------------------------------------------------------------------------------
*/	