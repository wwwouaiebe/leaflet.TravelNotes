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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file ColorControl.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module dialogColorControl

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTranslator from '../UILib/Translator.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import { RedSliderInputEL, ColorInputEL, ColorButtonClickEL }
	from '../dialogColorControl/ColorControlEventListeners.js';
import Color from '../dialogColorControl/Color.js';

import { ZERO, COLOR_CONTROL } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ColorControl
@classdesc html control for color selection
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ColorControl {

	/**
	the main HTMLElement
	@private
	*/

	#colorDiv = null;

	/** An array with the color buttons of the ColorControl
	@private
	*/

	#colorButtons = [];

	/**
	The red, green and blue input htmlElement of the ColorControl
	@private
	*/

	#inputs = {
		red : null,
		green : null,
		blue : null
	};

	#redSliderInput = null;

	/**
	A div that contains the red green and blue inputs
	@private
	*/

	#rgbDiv = null;

	/**
	The sample color div of the color control
	@private
	*/

	#colorSampleDiv = null;

	/**
	The new color
	@private
	*/

	#newColor = new Color;

	/**
	Create the Color Buttons div
	@private
	*/

	#eventListeners = {
		onColorButtonClick : null,
		onColorInput : null,
		onRedSliderInput : null
	}

	#createColorButtonsDiv ( ) {
		let colorButtonsDiv = theHTMLElementsFactory.create ( 'div', null, this.#colorDiv );
		let cellColor = new Color ( COLOR_CONTROL.initialRed, COLOR_CONTROL.minColorValue, COLOR_CONTROL.minColorValue 	);
		this.#eventListeners.onColorButtonClick = new ColorButtonClickEL ( this );

		for ( let rowCounter = ZERO; rowCounter < COLOR_CONTROL.rowsNumber; ++ rowCounter ) {
			let colorButtonsRowDiv = theHTMLElementsFactory.create ( 'div', null, colorButtonsDiv );

			cellColor.green = COLOR_CONTROL.minColorValue;

			for ( let cellCounter = ZERO; cellCounter < COLOR_CONTROL.cellsNumber; ++ cellCounter ) {
				let colorButtonCellDiv = theHTMLElementsFactory.create (
					'div',
					{
						className : 'TravelNotes-ColorControl-CellColorDiv'
					},
					colorButtonsRowDiv
				);
				colorButtonCellDiv.style [ 'background-color' ] = cellColor.cssColor;
				colorButtonCellDiv.addEventListener ( 'click', this.#eventListeners.onColorButtonClick, false );
				cellColor.green += COLOR_CONTROL.deltaColor;
				this.#colorButtons.push ( colorButtonCellDiv );
			}
			cellColor.blue += COLOR_CONTROL.deltaColor;
		}
	}

	/**
	Create the Red Slider div
	@private
	*/

	#createRedSliderDiv ( ) {
		let redSliderDiv = theHTMLElementsFactory.create ( 'div', null, this.#colorDiv );
		this.#redSliderInput = theHTMLElementsFactory.create ( 'input',
			{
				type : 'range',
				value : Math.ceil (
					COLOR_CONTROL.initialRed * ( COLOR_CONTROL.sliderMaxValue / COLOR_CONTROL.maxColorValue )
				),
				min : ZERO,
				max : COLOR_CONTROL.sliderMaxValue,
				step : COLOR_CONTROL.sliderStep

			},
			redSliderDiv
		);

		this.#eventListeners.onRedSliderInput = new RedSliderInputEL ( this.#redSliderInput, this.#colorButtons );
		this.#redSliderInput.addEventListener ( 'input', this.#eventListeners.onRedSliderInput, false );

		this.#redSliderInput.focus ( );
	}

	/**
	create the color inputs and text
	@private*/

	#createColorInput ( inputText, inputValue ) {
		theHTMLElementsFactory.create ( 'text', { value : inputText }, this.#rgbDiv	);
		let inputHtmlElement = theHTMLElementsFactory.create ( 'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorControl-NumberInput',
				value : inputValue,
				min : COLOR_CONTROL.minColorValue,
				max : COLOR_CONTROL.maxColorValue
			},
			this.#rgbDiv
		);
		inputHtmlElement.addEventListener ( 'input', this.#eventListeners.onColorInput, false );

		return inputHtmlElement;
	}

	/**
	Create the Color Input div
	@private
	*/

	#createColorInputsDiv ( ) {
		this.#rgbDiv = theHTMLElementsFactory.create ( 'div', null, this.#colorDiv );

		this.#eventListeners.onColorInput = new ColorInputEL ( this, this.#inputs );

		this.#inputs.red = this.#createColorInput (
			theTranslator.getText ( 'ColorControl - Red' ),
			this.#newColor.red,
		);
		this.#inputs.green = this.#createColorInput (
			theTranslator.getText ( 'ColorControl - Green' ),
			this.#newColor.green,
		);
		this.#inputs.blue = this.#createColorInput (
			theTranslator.getText ( 'ColorControl - Blue' ),
			this.#newColor.blue,
		);
	}

	/**
	Create the Color Sample div
	@private
	*/

	#createColorSampleDiv ( ) {
		this.#colorSampleDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ColorControl-ColorSampleDiv'
			},
			this.#colorDiv
		);
		this.#colorSampleDiv.style [ 'background-color' ] = this.#newColor.cssColor;
	}

	/*
	constructor
	*/

	constructor ( cssColor ) {
		Object.freeze ( this );
		this.#newColor.cssColor = cssColor;
		this.#colorDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ColorControl-ColorDiv'
			}
		);
		this.#createColorButtonsDiv ( );
		this.#createRedSliderDiv ( );
		this.#createColorInputsDiv ( );
		this.#createColorSampleDiv ( );
	}

	destructor ( ) {
		this.#colorButtons.forEach (
			colorButton => {
				colorButton.removeEventListener ( 'click', this.#eventListeners.onColorButtonClick, false );
			}
		);
		this.#eventListeners.onColorButtonClick.destructor ( );

		for ( const colorInput in this.#inputs ) {
			this.#inputs [ colorInput ].removeEventListener ( 'input', this.#eventListeners.onColorInput, false );
		}
		this.#eventListeners.onColorInput.destructor ( );

		this.#redSliderInput.removeEventListener ( 'input', this.#eventListeners.onRedSliderInput, false );
		this.#eventListeners.onRedSliderInput.destructor ( );
	}

	/**
	return an array with the HTML elements of the control
	@readonly
	*/

	get HTMLElements ( ) { return [ this.#colorDiv ]; }

	/**
	return the color selected in the control in the css hex format ( #rrggbb )
	@readonly
	*/

	get cssColor ( ) { return this.#newColor.cssColor; }

	/**
	set the inputs, sample div and newColor to the color given as parameter
	*/

	set color ( newColor ) {
		this.#inputs.red.value = newColor.red;
		this.#inputs.green.value = newColor.green;
		this.#inputs.blue.value = newColor.blue;
		this.#colorSampleDiv.style [ 'background-color' ] = newColor.cssColor;
		newColor.copyTo ( this.#newColor );
	}

}

export default ColorControl;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of ColorControlEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/