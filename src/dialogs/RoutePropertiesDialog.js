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

import BaseDialogV3 from '../dialogs/BaseDialogV3.js';
import theTranslator from '../UI/Translator.js';
import ColorControl from '../dialogs/ColorControl.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theConfig from '../data/Config.js';
import { ZERO } from '../util/Constants.js';

const OUR_ROUTE_MIN_WIDTH = 1;
const OUR_ROUTE_MAX_WIDTH = 40;

class RoutePropertiesDialog extends BaseDialogV3 {

	#route = null;
	#colorControl = null;

	#nameInput = null;
	#widthInput = null;
	#dashSelect = null;
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

	constructor ( route ) {
		super ( );
		this.#route = route;
		this.#colorControl = new ColorControl ( route.color );
	}

	onOk ( ) {

		this.#route.color = this.#colorControl.cssColor;
		if ( this.#route.computedName !== this.#nameInput.value ) {
			this.#route.name = this.#nameInput.value;
		}
		this.#route.width = parseInt ( this.#widthInput.value );
		this.#route.chain = this.#chainInput.checked;
		this.#route.dashArray = this.#dashSelect.selectedIndex;

		this.#route.validateData ( );

		super.onOk ( );
	}

	/**
	Get the title of the dialog
	@readonly
	*/

	get title ( ) { return theTranslator.getText ( 'RoutePropertiesDialog - Route properties' ); }

	/**
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