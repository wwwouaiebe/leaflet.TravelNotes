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
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue ♯36: Add a linetype property to route
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
		- Issue ♯66 : Work with promises for dialogs
		- Issue ♯63 : Find a better solution for provider keys upload
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
Doc reviewed 20200815
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file RoutePropertiesDialog.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module RoutePropertiesDialog
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import theConfig from '../data/Config.js';
import { newColorDialog } from '../dialogs/ColorDialog.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import { ZERO } from '../util/Constants.js';

const OUR_ROUTE_MIN_WIDTH = 1;
const OUR_ROUTE_MAX_WIDTH = 40;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewRoutePropertiesDialog
@desc constructor for RoutePropertiesDialog objects
@param {Route} route The route for wich the properties have to be edited
@return {RoutePropertiesDialog} an instance of RoutePropertiesDialog object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewRoutePropertiesDialog ( route ) {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class RoutePropertiesDialog
	@classdesc A ColorDialog object completed for edition of route properties
	Create an instance of the dialog, then execute the show ( ) method. The edited route is given as parameter of the
	succes handler of the Promise returned by the show ( ) method.
	@example
	newRoutePropertiesDialog ( route )
		.show ( )
		.then ( route => doSomethingWithTheRoute )
		.catch ( error => doSomethingWithTheError );
	@see {@link newRoutePropertiesDialog} for constructor
	@augments ColorDialog
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	let myRoutePropertiesDialog = null;

	let myRoutePropertiesDiv = null;
	let myNameInput = null;
	let myWidthInput = null;
	let myChainInput = null;
	let myDashSelect = null;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnOkButtonClick
	@desc Event listener for the ok button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkButtonClick ( ) {
		route.color = document.getElementById ( 'TravelNotes-ColorDialog-ColorSampleDiv' ).color.cssColor;
		if ( route.computedName !== myNameInput.value ) {
			route.name = myNameInput.value;
		}
		route.width = parseInt ( myWidthInput.value );
		route.chain = myChainInput.checked;
		route.dashArray = myDashSelect.selectedIndex;

		route.validateData ( );

		return route;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateDialog
	@desc This method creates the dialog
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDialog ( ) {
		myRoutePropertiesDialog = newColorDialog ( route.color );
		myRoutePropertiesDialog.title = theTranslator.getText ( 'RoutePropertiesDialog - Route properties' );
		myRoutePropertiesDialog.okButtonListener = myOnOkButtonClick;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateRoutePropertiesDiv
	@desc This method creates the route properties div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateRoutePropertiesDiv ( ) {
		myRoutePropertiesDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-RoutePropertiesDialog-MainDataDiv'
			}
		);
		myRoutePropertiesDialog.content.insertBefore (
			myRoutePropertiesDiv,
			myRoutePropertiesDialog.content.firstChild
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateNameDiv
	@desc This method creates the name div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateNameDiv ( ) {
		let nameDiv = theHTMLElementsFactory.create ( 'div', null, myRoutePropertiesDiv );
		theHTMLElementsFactory.create (
			'div',
			{
				textContent : theTranslator.getText ( 'RoutePropertiesDialog - Name' )
			},
			nameDiv
		);
		let inputNameDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-NameInputDiv'
			},
			nameDiv
		);
		myNameInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				id : 'TravelNotes-RoutePropertiesDialog-NameInput',
				value : route.computedName
			},
			inputNameDiv
		);

	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateWidthDiv
	@desc This method creates the route width div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateWidthDiv ( ) {
		let widthDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv'
			},
			myRoutePropertiesDiv
		);
		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'RoutePropertiesDialog - Width' )
			},
			theHTMLElementsFactory.create ( 'span', null, widthDiv )
		);

		myWidthInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				id : 'TravelNotes-RoutePropertiesDialog-WidthInput',
				value : route.width,
				min : OUR_ROUTE_MIN_WIDTH,
				max : OUR_ROUTE_MAX_WIDTH
			},
			widthDiv
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateDashDiv
	@desc This method creates the route dash div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDashDiv ( ) {
		let dashDiv = theHTMLElementsFactory.create (
			'div',
			{ className : 'TravelNotes-RoutePropertiesDialog-DataDiv'			},
			myRoutePropertiesDiv
		);
		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'RoutePropertiesDialog - Linetype' )
			},
			theHTMLElementsFactory.create ( 'span', null, dashDiv )
		);
		myDashSelect = theHTMLElementsFactory.create ( 'select', null, dashDiv );
		let dashChoices = theConfig.route.dashChoices;
		for ( let optionsCounter = ZERO; optionsCounter < dashChoices.length; optionsCounter ++ ) {
			myDashSelect.add ( theHTMLElementsFactory.create ( 'option', { text : dashChoices [ optionsCounter ].text } ) );
		}
		myDashSelect.selectedIndex = route.dashArray < dashChoices.length ? route.dashArray : ZERO;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateChainDiv
	@desc This method creates the route chain div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateChainDiv ( ) {
		let chainDiv = theHTMLElementsFactory.create (
			'div',
			{ className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-ChainDiv'			},
			myRoutePropertiesDiv
		);
		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'RoutePropertiesDialog - Chained route' )
			},
			theHTMLElementsFactory.create ( 'span', null, chainDiv )
		);

		myChainInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'checkbox',
				checked : route.chain
			},
			chainDiv
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateColorHeaderDiv
	@desc This method creates the color header div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateColorHeaderDiv ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				textContent : theTranslator.getText ( 'RoutePropertiesDialog - Color' ),
				id : 'TravelNotes-RoutePropertiesDialog-ColorHeaderDiv'
			},
			myRoutePropertiesDiv
		);
	}

	myCreateDialog ( );
	myCreateRoutePropertiesDiv ( );
	myCreateNameDiv ( );
	myCreateWidthDiv ( );
	myCreateDashDiv ( );
	myCreateChainDiv ( );
	myCreateColorHeaderDiv ( );

	return myRoutePropertiesDialog;
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newRoutePropertiesDialog
	@desc constructor for RoutePropertiesDialog objects
	@param {Route} route The route to edit at the dialog opening
	@return {RoutePropertiesDialog} an instance of RoutePropertiesDialog object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewRoutePropertiesDialog as newRoutePropertiesDialog
};

/*
--- End of RoutePropertiesDialog.js file --------------------------------------------------------------------------------------
*/