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
--- ColorDialog.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the newColorDialog function
Changes:
	- v1.0.0:
		- created
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #66 : Work with promises for dialogs
Doc reviewed 20191124
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

import { THE_CONST } from '../util/Constants.js';

/*
--- newColorDialog function -------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newColorDialog ( color ) {

	let myColorDialog = null;
	let myColorDiv = null;
	let myNewColor = color;
	let myRedInput = null;
	let myGreenInput = null;
	let myBlueInput = null;
	let myColorSampleDiv = null;
	let myHTMLElementsFactory = newHTMLElementsFactory ( );

	/*
	--- myColorToNumbers function -------------------------------------------------------------------------------------

	This function transforms a css color into an object { red : xx, green : xx, blue : xx}

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myColorToNumbers ( colorToNumbers ) {
		return {
			red : parseInt ( colorToNumbers.substr ( THE_CONST.number1, THE_CONST.number2 ), THE_CONST.hexadecimal ),
			green : parseInt ( colorToNumbers.substr ( THE_CONST.number3, THE_CONST.number2 ), THE_CONST.hexadecimal ),
			blue : parseInt ( colorToNumbers.substr ( THE_CONST.number5, THE_CONST.number2 ), THE_CONST.hexadecimal )
		};
	}

	/*
	--- myNumbersToColor function -------------------------------------------------------------------------------------

	This function transforms 3 numbers into a css color

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myNumbersToColor ( red, green, blue ) {

		return '#' +
			parseInt ( red ).toString ( THE_CONST.hexadecimal )
				.padStart ( THE_CONST.number2, '0' ) +
			parseInt ( green ).toString ( THE_CONST.hexadecimal )
				.padStart ( THE_CONST.number2, '0' ) +
			parseInt ( blue ).toString ( THE_CONST.hexadecimal )
				.padStart ( THE_CONST.number2, '0' );
	}

	/*
	--- myOnColorClick function ---------------------------------------------------------------------------------------

	Click event handler on a color button

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnColorClick ( clickEvent ) {
		myNewColor = clickEvent.target.colorValue;
		let numbers = myColorToNumbers ( myNewColor );
		myRedInput.value = numbers.red;
		myGreenInput.value = numbers.green;
		myBlueInput.value = numbers.blue;
		myColorSampleDiv.setAttribute ( 'style', 'background-color:' + clickEvent.target.colorValue + ';' );
		myColorSampleDiv.color = myNewColor;
	}

	/*
	--- myOnRedColorClick function ------------------------------------------------------------------------------------

	Click event handler on a red color button

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnRedColorClick ( clickEvent ) {
		let red = clickEvent.target.redValue;
		let green = THE_CONST.colorDialog.maxColorValue;
		let blue = THE_CONST.colorDialog.maxColorValue;
		let rowCounter = THE_CONST.zero;
		while ( ++ rowCounter <= THE_CONST.colorDialog.colorRowsNumber ) {
			let cellCounter = THE_CONST.zero;
			green = THE_CONST.colorDialog.maxColorValue;
			while ( ++ cellCounter <= THE_CONST.colorDialog.colorRowsNumber ) {
				let button = document.getElementById ( ( 'TravelNotes-ColorDialog-CellColorDiv' + rowCounter ) + cellCounter );
				button.colorValue = myNumbersToColor ( red, green, blue );
				button.setAttribute ( 'style', 'background-color:' + myNumbersToColor ( red, green, blue ) );
				green -= THE_CONST.colorDialog.deltaColor;
			}
			blue -= THE_CONST.colorDialog.deltaColor;
		}
	}

	/*
	--- myOnColorInput function ------------------------------------------------------------------------------------

	Red, green or blue input event handler

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnColorInput ( ) {
		myNewColor = myNumbersToColor ( myRedInput.value, myGreenInput.value, myBlueInput.value );
		myColorSampleDiv.setAttribute ( 'style', 'background-color:' + myNewColor + ';' );
		myColorSampleDiv.color = myNewColor;
	}

	/*
	--- myCreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDialog ( ) {

		// the dialog base is created
		myColorDialog = newBaseDialog ( );
		myColorDialog.title = theTranslator.getText ( 'ColorDialog - Colors' );
	}

	/*
	--- myCreateColorDiv function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateColorDiv ( ) {
		myColorDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-ColorDiv',
				id : 'TravelNotes-ColorDialog-ColorDiv'
			},
			myColorDialog.content
		);
	}

	/*
	--- myCreateButtonsDiv function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateButtonsDiv ( ) {
		let buttonsDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-ButtonsDiv',
				id : 'TravelNotes-ColorDialog-ButtonsDiv'
			},
			myColorDiv
		);

		let red = THE_CONST.colorDialog.maxColorValue;
		let green = THE_CONST.colorDialog.maxColorValue;
		let blue = THE_CONST.colorDialog.maxColorValue;
		let rowCounter = THE_CONST.zero;

		// loop on the 7 rows
		while ( ++ rowCounter <= THE_CONST.colorDialog.colorRowsNumber + THE_CONST.number1 ) {
			let colorButtonsRowDiv = myHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-ColorDialog-RowColorDiv',
					id : 'TravelNotes-ColorDialog-RowColorDiv' + rowCounter
				},
				buttonsDiv
			);

			let cellCounter = THE_CONST.zero;
			green = THE_CONST.colorDialog.maxColorValue;

			// loop on the 6 cells
			while ( ++ cellCounter <= THE_CONST.colorDialog.colorRowsNumber ) {
				let colorButtonCellDiv = myHTMLElementsFactory.create (
					'div',
					{
						className : 'TravelNotes-ColorDialog-CellColorDiv',
						id : ( 'TravelNotes-ColorDialog-CellColorDiv' + rowCounter ) + cellCounter
					},
					colorButtonsRowDiv
				);
				if ( rowCounter <= THE_CONST.colorDialog.colorRowsNumber ) {
					colorButtonCellDiv.setAttribute ( 'style', 'background-color:' + myNumbersToColor ( red, green, blue ) );
					colorButtonCellDiv.colorValue = myNumbersToColor ( red, green, blue );
					colorButtonCellDiv.addEventListener ( 'click', myOnColorClick, false );
					green -= THE_CONST.colorDialog.deltaColor;
				}
				else {
					red = ( cellCounter - THE_CONST.number1 ) * THE_CONST.colorDialog.deltaColor;
					let buttonColor = myNumbersToColor ( THE_CONST.colorDialog.maxColorValue, red, red );
					colorButtonCellDiv.setAttribute ( 'style', 'background-color:' + buttonColor );
					colorButtonCellDiv.redValue = THE_CONST.colorDialog.maxColorValue - red;
					colorButtonCellDiv.addEventListener ( 'click', myOnRedColorClick, false );
				}
			}
			blue -= THE_CONST.colorDialog.deltaColor;
		}
	}

	/*
	--- myCreateRvbDiv function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateRvbDiv ( ) {
		let rvbDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-DataDiv',
				id : 'TravelNotes-ColorDialog-DataDiv'
			},
			myColorDiv
		);

		// ... red ...
		myHTMLElementsFactory.create (
			'text',
			{
				data : theTranslator.getText ( 'ColorDialog - Red' )
			},
			rvbDiv
		);
		myRedInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				id : 'TravelNotes-ColorDialog-RedInput'

			},
			rvbDiv
		);
		myRedInput.value = myColorToNumbers ( myNewColor ).red;
		myRedInput.min = THE_CONST.colorDialog.minColorValue;
		myRedInput.max = THE_CONST.colorDialog.maxColorValue;

		myRedInput.addEventListener ( 'input', myOnColorInput, false );

		// ... and green...
		myHTMLElementsFactory.create (
			'text',
			{
				data : theTranslator.getText ( 'ColorDialog - Green' )
			},
			rvbDiv
		);
		myGreenInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				id : 'TravelNotes-ColorDialog-GreenInput'
			},
			rvbDiv
		);
		myGreenInput.value = myColorToNumbers ( myNewColor ).green;
		myGreenInput.min = THE_CONST.colorDialog.minColorValue;
		myGreenInput.max = THE_CONST.colorDialog.maxColorValue;
		myGreenInput.addEventListener ( 'input', myOnColorInput, false );

		// ... and blue
		myHTMLElementsFactory.create (
			'text',
			{
				data : theTranslator.getText ( 'ColorDialog - Blue' )
			},
			rvbDiv
		);
		myBlueInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				id : 'TravelNotes-ColorDialog-BlueInput'
			},
			rvbDiv
		);
		myBlueInput.value = myColorToNumbers ( myNewColor ).blue;
		myBlueInput.min = THE_CONST.colorDialog.minColorValue;
		myBlueInput.max = THE_CONST.colorDialog.maxColorValue;
		myBlueInput.addEventListener ( 'input', myOnColorInput, false );
	}

	/*
	--- myCreateColorSampleDiv function -------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateColorSampleDiv ( ) {
		myColorSampleDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-ColorSampleDiv',
				id : 'TravelNotes-ColorDialog-ColorSampleDiv'
			},
			myColorDiv
		);
		myColorSampleDiv.setAttribute ( 'style', 'background-color:' + myNewColor + ';' );
		myColorSampleDiv.color = myNewColor;
	}

	myCreateDialog ( );
	myCreateColorDiv ( );
	myCreateButtonsDiv ( );
	myCreateRvbDiv ( );
	myCreateColorSampleDiv ( );

	return myColorDialog;
}

export { newColorDialog };

/*
--- End of ColorDialog.js file ----------------------------------------------------------------------------------------
*/