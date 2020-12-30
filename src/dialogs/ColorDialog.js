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
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #66 : Work with promises for dialogs
	- v1.14.0:
		- Issue #134 : Remove node.setAttribute ( 'style', blablabla) in the code
Doc reviewed 20200814
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file ColorDialog.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module ColorDialog
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { theConfig } from '../data/Config.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { ZERO, ONE, TWO } from '../util/Constants.js';

const MIN_COLOR_VALUE = 0;
const MAX_COLOR_VALUE = 255;
const HEXADECIMAL = 16;
const TWO_EXP_8 = 256;

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc a simple helper classe for the ColorDialog

@------------------------------------------------------------------------------------------------------------------------------
*/

class Color {

	/**
	@param {?number} red The red value of the color. Must be between 0 and 255. If null set to 255
	@param {?number} green The green value of the color. Must be between 0 and 255. If null set to 255
	@param {?number} blue The blue value of the color. Must be between 0 and 255. If null set to 255
	*/

	constructor ( red, green, blue ) {

		/**
		The red value of the color
		*/

		this.red = ( 'number' === typeof red ? red : MAX_COLOR_VALUE ) % TWO_EXP_8;

		/**
		The green value of the color
		*/

		this.green = ( 'number' === typeof green ? green : MAX_COLOR_VALUE ) % TWO_EXP_8;

		/**
		The blue value of the color
		*/

		this.blue = ( 'number' === typeof blue ? blue : MAX_COLOR_VALUE ) % TWO_EXP_8;
	}

	/**
	the color in the css HEX format '#RRGGBB'
	*/

	get cssColor ( ) {
		return '#' +
			this.red.toString ( HEXADECIMAL ).padStart ( TWO, '0' ) +
			this.green.toString ( HEXADECIMAL ).padStart ( TWO, '0' ) +
			this.blue.toString ( HEXADECIMAL ).padStart ( TWO, '0' );
	}
	set cssColor ( cssColor ) {
		const THREE = 3;
		const FIVE = 5;
		this.red = parseInt ( cssColor.substr ( ONE, TWO ), HEXADECIMAL );
		this.green = parseInt ( cssColor.substr ( THREE, TWO ), HEXADECIMAL );
		this.blue = parseInt ( cssColor.substr ( FIVE, TWO ), HEXADECIMAL );
	}

	/**
	return a clone of the Color
	*/

	clone ( ) { return new Color ( this.red, this.green, this.blue ); }

	/**
	copy the RGB values of th this Color to the color given as parameter
	@param {Color} color the destination color
	*/

	copyTo ( color ) {
		color.red = this.red;
		color.green = this.green;
		color.blue = this.blue;
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewColorDialog
@desc constructor for ColorDialog objects
@param {string} cssColor The color to edit in the css HEX format '#RRGGBB'
@return {ColorDialog} an instance of ColorDialog object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewColorDialog ( cssColor ) {

	const COLOR_CELLS_NUMBER = 6;
	const COLOR_ROWS_NUMBER = 6;
	const DELTA_COLOR = 51;
	const SLIDER_MAX_VALUE = 100;
	const SLIDER_STEP = 20;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class ColorDialog
	@classdesc a BaseDialog object completed for color edition
	@see {@link newColorDialog} for constructor
	@augments BaseDialog
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	let myColorDialog = null;

	let myNewColor = new Color;
	myNewColor.cssColor = cssColor;

	let myColorDiv = null;
	let myColorButtons = [];
	let myRedInput = null;
	let myGreenInput = null;
	let myBlueInput = null;
	let myColorSampleDiv = null;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnColorButtonClick
	@desc Event listener for the color buttons
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnColorButtonClick ( clickEvent ) {
		myNewColor = clickEvent.target.color.clone ( );
		myRedInput.value = myNewColor.red;
		myGreenInput.value = myNewColor.green;
		myBlueInput.value = myNewColor.blue;
		myColorSampleDiv.style [ 'background-color' ] = myNewColor.cssColor;
		myColorSampleDiv.color = myNewColor;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnRedColorButtonOrSlider
	@desc this method change the color buttons after a red button click or red slider input event
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnRedColorButtonOrSlider ( redValue ) {
		for ( let rowCounter = ZERO; rowCounter < COLOR_ROWS_NUMBER; ++ rowCounter ) {
			for ( let cellCounter = ZERO; cellCounter < COLOR_ROWS_NUMBER; ++ cellCounter ) {
				let colorButton = myColorButtons [ ( COLOR_ROWS_NUMBER * rowCounter ) + cellCounter ];
				colorButton.color.red = redValue;
				colorButton.style [ 'background-color' ] = colorButton.color.cssColor;
			}
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnRedColorButtonClick
	@desc Event listener for the red color slider
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnRedColorSliderInput ( inputEvent ) {

		// Math.ceil because with JS 100 * 2.55 = 254.99999....
		myOnRedColorButtonOrSlider (
			Math.ceil ( inputEvent.target.valueAsNumber * ( MAX_COLOR_VALUE / SLIDER_MAX_VALUE ) )
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnRedColorButtonClick
	@desc Event listener for the red color buttons
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnRedColorButtonClick ( clickEvent ) {
		myOnRedColorButtonOrSlider ( MAX_COLOR_VALUE - clickEvent.target.color.blue );

	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnColorInput
	@desc Event listener for the red color buttons
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnColorInput ( ) {
		myNewColor.red = parseInt ( myRedInput.value );
		myNewColor.green = parseInt ( myGreenInput.value );
		myNewColor.blue = parseInt ( myBlueInput.value );
		myColorSampleDiv.style [ 'background-color' ] = myNewColor.cssColor;
		myColorSampleDiv.color = myNewColor;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateDialog
	@desc This method creates the dialog
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDialog ( ) {
		myColorDialog = newBaseDialog ( );
		myColorDialog.title = theTranslator.getText ( 'ColorDialog - Colors' );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateColorDiv
	@desc This method creates the color div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateColorDiv ( ) {
		myColorDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ColorDialog-ColorDiv'
			},
			myColorDialog.content
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateColorButtonsDiv
	@desc This method creates the color buttons div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateColorButtonsDiv ( ) {
		let colorButtonsDiv = theHTMLElementsFactory.create ( 'div', null, myColorDiv );
		let cellColor = new Color ( theConfig.colorDialog.initialRed, MIN_COLOR_VALUE, MIN_COLOR_VALUE );

		for ( let rowCounter = ZERO; rowCounter < COLOR_ROWS_NUMBER; ++ rowCounter ) {
			let colorButtonsRowDiv = theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-ColorDialog-RowColorDiv'
				},
				colorButtonsDiv
			);

			cellColor.green = MIN_COLOR_VALUE;

			for ( let cellCounter = ZERO; cellCounter < COLOR_CELLS_NUMBER; ++ cellCounter ) {
				let colorButtonCellDiv = theHTMLElementsFactory.create (
					'div',
					{
						className : 'TravelNotes-ColorDialog-CellColorDiv'
					},
					colorButtonsRowDiv
				);
				colorButtonCellDiv.color = cellColor.clone ( );
				colorButtonCellDiv.style [ 'background-color' ] = cellColor.cssColor;
				colorButtonCellDiv.addEventListener ( 'click', myOnColorButtonClick, false );
				cellColor.green += DELTA_COLOR;
				myColorButtons.push ( colorButtonCellDiv );
			}
			cellColor.blue += DELTA_COLOR;
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateRedButtonsDiv
	@desc This method creates the red color buttons div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateRedButtonsDiv ( ) {
		let redButtonsDiv = theHTMLElementsFactory.create ( 'div', null, myColorDiv );
		let cellColor = new Color ( MAX_COLOR_VALUE, MIN_COLOR_VALUE, MIN_COLOR_VALUE );
		let redButtonsRowDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-RowColorDiv',
				id : 'TravelNotes-ColorDialog-RedButtonsRowDiv'
			},
			redButtonsDiv
		);
		for ( let cellCounter = ZERO; cellCounter < COLOR_CELLS_NUMBER; ++ cellCounter ) {
			let colorButtonCellDiv = theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-ColorDialog-CellColorDiv'
				},
				redButtonsRowDiv
			);
			colorButtonCellDiv.color = cellColor.clone ( );
			colorButtonCellDiv.style [ 'background-color' ] = colorButtonCellDiv.color.cssColor;
			colorButtonCellDiv.addEventListener ( 'click', myOnRedColorButtonClick, false );
			cellColor.green += DELTA_COLOR;
			cellColor.blue += DELTA_COLOR;
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateRedSliderDiv
	@desc This method creates the red slider div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateRedSliderDiv ( ) {
		let redSliderDiv = theHTMLElementsFactory.create ( 'div', null, myColorDiv );
		let sliderValue =
			Math.ceil ( theConfig.colorDialog.initialRed * ( SLIDER_MAX_VALUE / MAX_COLOR_VALUE ) );
		let redSliderInput = theHTMLElementsFactory.create ( 'input',
			{
				type : 'range',
				className : 'TravelNotes-ColorDialog-SliderInput',
				value : sliderValue,
				min : ZERO,
				max : SLIDER_MAX_VALUE,
				step : SLIDER_STEP

			},
			redSliderDiv
		);
		redSliderInput.addEventListener ( 'input', myOnRedColorSliderInput, false );
		redSliderInput.focus ( );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateColorInputDiv
	@desc This method creates the color input div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateColorInputDiv ( ) {
		let rvbDiv = theHTMLElementsFactory.create ( 'div', null, myColorDiv );
		theHTMLElementsFactory.create ( 'text', { value : theTranslator.getText ( 'ColorDialog - Red' ) }, rvbDiv	);
		myRedInput = theHTMLElementsFactory.create ( 'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				value : myNewColor.red,
				min : MIN_COLOR_VALUE,
				max : MAX_COLOR_VALUE
			},
			rvbDiv
		);
		myRedInput.addEventListener ( 'input', myOnColorInput, false );
		theHTMLElementsFactory.create ( 'text', { value : theTranslator.getText ( 'ColorDialog - Green' ) }, rvbDiv );
		myGreenInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				value : myNewColor.green,
				min : MIN_COLOR_VALUE,
				max : MAX_COLOR_VALUE
			},
			rvbDiv
		);
		myGreenInput.addEventListener ( 'input', myOnColorInput, false );
		theHTMLElementsFactory.create ( 'text', { value : theTranslator.getText ( 'ColorDialog - Blue' ) }, rvbDiv );
		myBlueInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				value : myNewColor.blue,
				min : MIN_COLOR_VALUE,
				max : MAX_COLOR_VALUE
			},
			rvbDiv
		);
		myBlueInput.addEventListener ( 'input', myOnColorInput, false );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateColorSampleDiv
	@desc This method creates the color sample div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateColorSampleDiv ( ) {
		myColorSampleDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ColorDialog-ColorSampleDiv'
			},
			myColorDiv
		);
		myColorSampleDiv.style [ 'background-color' ] = myNewColor.cssColor;
		myColorSampleDiv.color = myNewColor;
	}

	myCreateDialog ( );
	myCreateColorDiv ( );
	myCreateColorButtonsDiv ( );
	if ( theConfig.colorDialog.haveSlider ) {
		myCreateRedSliderDiv ( );
	}
	else {
		myCreateRedButtonsDiv ( );
	}
	myCreateColorInputDiv ( );
	myCreateColorSampleDiv ( );

	return myColorDialog;
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newColorDialog
	@desc constructor for ColorDialog objects
	@return {ColorDialog} an instance of ColorDialog object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewColorDialog as newColorDialog
};

/*
--- End of ColorDialog.js file ------------------------------------------------------------------------------------------------
*/