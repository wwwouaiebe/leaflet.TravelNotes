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
		- Issue #63 : Find a better solution for provider keys upload
Doc reviewed 20191124
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { newColorDialog } from '../dialogs/ColorDialog.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

import  { THE_CONST } from '../util/Constants.js';

/*
--- newRoutePropertiesDialog function ---------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newRoutePropertiesDialog ( route ) {

	let myHTMLElementsFactory = newHTMLElementsFactory ( );
	let myRoutePropertiesDialog = null;
	let myRoutePropertiesDiv = null;
	let myWidthInput = null;
	let myChainInput = null;
	let myDashSelect = null;

	/*
	--- myOnOkButtonClick function ------------------------------------------------------------------------------------

	click event listener for the ok button

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkButtonClick ( ) {
		route.color = document.getElementById ( 'TravelNotes-ColorDialog-ColorSampleDiv' ).color;
		route.width = parseInt ( myWidthInput.value );
		route.chain = myChainInput.checked;
		route.dashArray = myDashSelect.selectedIndex;

		return route;
	}

	/*
	--- myCreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDialog ( ) {

		// the dialog base is created
		myRoutePropertiesDialog = newColorDialog ( route.color );
		myRoutePropertiesDialog.title = theTranslator.getText ( 'RoutePropertiesDialog - Route properties' );
		myRoutePropertiesDialog.okButtonListener = myOnOkButtonClick;
	}

	/*
	--- myCreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateRoutePropertiesDiv ( ) {
		myRoutePropertiesDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-RoutePropertiesDialog-MainDataDiv'
			},
			myRoutePropertiesDialog.content
		);
	}

	/*
	--- myCreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateWidthDiv ( ) {
		let widthDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-WithDiv'
			},
			myRoutePropertiesDiv
		);
		widthDiv.innerHTML = '<span>' + theTranslator.getText ( 'RoutePropertiesDialog - Width' ) + '</span>';
		myWidthInput =  myHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				id : 'TravelNotes-RoutePropertiesDialog-WidthInput'

			},
			widthDiv
		);
		myWidthInput.value = route.width;
		myWidthInput.min = THE_CONST.route.minWidth;
		myWidthInput.max = THE_CONST.route.maxWidth;
	}

	/*
	--- myCreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDashDiv ( ) {
		let dashDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-dashDiv'
			},
			myRoutePropertiesDiv
		);
		dashDiv.innerHTML = '<span>' + theTranslator.getText ( 'RoutePropertiesDialog - Linetype' ) + '</span>';
		myDashSelect = myHTMLElementsFactory.create (
			'select',
			{
				className : 'TravelNotes-RoutePropertiesDialog-Select',
				id : 'TravelNotes-RoutePropertiesDialog-DashSelect'
			},
			dashDiv
		);

		let dashChoices = theConfig.route.dashChoices;
		for ( let optionsCounter = THE_CONST.zero; optionsCounter < dashChoices.length; optionsCounter ++ ) {
			myDashSelect.add ( myHTMLElementsFactory.create ( 'option', { text : dashChoices [ optionsCounter ].text } ) );
		}
		myDashSelect.selectedIndex = route.dashArray < dashChoices.length ? route.dashArray : THE_CONST.zero;
	}

	/*
	--- myCreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateChainDiv ( ) {
		let chainDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-ChainDiv'
			},
			myRoutePropertiesDiv
		);
		chainDiv.innerHTML = '<span>' + theTranslator.getText ( 'RoutePropertiesDialog - Chained route' ) + '</span>';
		myChainInput =  myHTMLElementsFactory.create (
			'input',
			{
				type : 'checkbox',
				id : 'TravelNotes-RoutePropertiesDialog-ChainInput'
			},
			chainDiv
		);
		myChainInput.checked = route.chain;
	}

	myCreateDialog ( );
	myCreateRoutePropertiesDiv ( );
	myCreateWidthDiv ( );
	myCreateDashDiv ( );
	myCreateChainDiv ( );

	return myRoutePropertiesDialog;
}

export { newRoutePropertiesDialog };

/*
--- End of RoutePropertiesDialog.js file ------------------------------------------------------------------------------
*/