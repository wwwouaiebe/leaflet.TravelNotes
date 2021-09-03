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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
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

@module dialogs
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import BaseDialog from '../dialogBase/BaseDialog.js';
import theTranslator from '../UILib/Translator.js';
import ColorControl from '../dialogColorControl/ColorControl.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theConfig from '../data/Config.js';
import { ZERO } from '../main/Constants.js';

const OUR_ROUTE_MIN_WIDTH = 1;
const OUR_ROUTE_MAX_WIDTH = 40;

/**
@------------------------------------------------------------------------------------------------------------------------------

@class RoutePropertiesDialog
@classdesc This class is the route properties dialog
@extends BaseDialog
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class RoutePropertiesDialog extends BaseDialog {

	/**
	A reference to the route
	@private
	*/

	#route = null;

	/**
	The colorControl object used in the dialog
	@private
	*/

	#colorControl = null;

	/**
	The route name input in the dialog
	@private
	*/

	#nameInput = null;

	/**
	The route width input in the dialog
	@private
	*/

	#widthInput = null;

	/**
	The route dash select in the dialog
	@private
	*/

	#dashSelect = null;

	/**
	The route chain check box in the dialog
	@private
	*/

	#chainInput = null;

	/**
	This method creates the name div
	@private
	*/

	#createNameDiv ( ) {
		let nameHeaderDiv = theHTMLElementsFactory.create (
			'div',
			{
				textContent : theTranslator.getText ( 'RoutePropertiesDialog - Name' )
			}
		);
		let nameInputDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-NameInputDiv'
			}
		);
		this.#nameInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				id : 'TravelNotes-RoutePropertiesDialog-NameInput',
				value : this.#route.computedName
			},
			nameInputDiv
		);
		return [ nameHeaderDiv, nameInputDiv ];
	}

	/**
	This method creates the route width div
	@private
	*/

	#createWidthDiv ( ) {
		let widthDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv'
			}
		);
		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'RoutePropertiesDialog - Width' )
			},
			theHTMLElementsFactory.create ( 'span', null, widthDiv )
		);

		this.#widthInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				id : 'TravelNotes-RoutePropertiesDialog-WidthInput',
				value : this.#route.width,
				min : OUR_ROUTE_MIN_WIDTH,
				max : OUR_ROUTE_MAX_WIDTH
			},
			widthDiv
		);

		return widthDiv;
	}

	/**
	This method creates the route dash div
	@private
	*/

	#createDashDiv ( ) {
		let dashDiv = theHTMLElementsFactory.create (
			'div',
			{ className : 'TravelNotes-RoutePropertiesDialog-DataDiv' }
		);
		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'RoutePropertiesDialog - Linetype' )
			},
			theHTMLElementsFactory.create ( 'span', null, dashDiv )
		);
		this.#dashSelect = theHTMLElementsFactory.create ( 'select', null, dashDiv );
		let dashChoices = theConfig.route.dashChoices;
		for ( let optionsCounter = ZERO; optionsCounter < dashChoices.length; optionsCounter ++ ) {
			this.#dashSelect.add ( theHTMLElementsFactory.create ( 'option', { text : dashChoices [ optionsCounter ].text } ) );
		}
		this.#dashSelect.selectedIndex = this.#route.dashArray < dashChoices.length ? this.#route.dashArray : ZERO;

		return dashDiv;
	}

	/**
	This method creates the route chain div
	@private
	*/

	#createChainDiv ( ) {
		let chainDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-ChainDiv'
			}
		);
		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'RoutePropertiesDialog - Chained route' )
			},
			theHTMLElementsFactory.create ( 'span', null, chainDiv )
		);

		this.#chainInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'checkbox',
				checked : this.#route.chain
			},
			chainDiv
		);

		return chainDiv;
	}

	/**
	This method creates the color header div
	@private
	*/

	#createColorHeaderDiv ( ) {
		return theHTMLElementsFactory.create (
			'div',
			{
				textContent : theTranslator.getText ( 'RoutePropertiesDialog - Color' ),
				id : 'TravelNotes-RoutePropertiesDialog-ColorHeaderDiv'
			}
		);
	}

	/*
	constructor
	@param {Route} route The route for witch the properties are edited
	*/

	constructor ( route ) {
		super ( );
		this.#route = route;
		this.#colorControl = new ColorControl ( route.color );
	}

	/**
	Overload of the BaseDialog.onCancel ( ) method.
	*/

	onCancel ( ) {
		this.#colorControl.destructor ( );
		super.onCancel ( );
	}

	/**
	Overload of the BaseDialog.onOk ( ) method. Called when the Ok button is clicked.
	Push the new route properties in the route and validate the route
	*/

	onOk ( ) {

		this.#route.color = this.#colorControl.cssColor;
		if ( this.#route.computedName !== this.#nameInput.value ) {
			this.#route.name = this.#nameInput.value;
		}
		this.#route.width = parseInt ( this.#widthInput.value );
		this.#route.chain = this.#chainInput.checked;
		this.#route.dashArray = this.#dashSelect.selectedIndex;

		this.#route.validateData ( );
		this.#colorControl.destructor ( );

		super.onOk ( );
	}

	/**
	Get the title of the dialog
	@readonly
	*/

	get title ( ) { return theTranslator.getText ( 'RoutePropertiesDialog - Route properties' ); }

	/**
	Overload of the BaseDialog.contentHTMLElements property.
	Get an array with the HTMLElements that have to be added in the content of the dialog.
	@readonly
	*/

	get contentHTMLElements ( ) {
		return [].concat (

			this.#createNameDiv ( ),
			this.#createWidthDiv ( ),
			this.#createDashDiv ( ),
			this.#createChainDiv ( ),
			this.#createColorHeaderDiv ( ),
			this.#colorControl.HTMLElements
		);
	}
}

export default RoutePropertiesDialog;

/*
--- End of RoutePropertiesDialog.js file --------------------------------------------------------------------------------------
*/