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
Doc reviewed 20210803
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

@module ColorControl
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTranslator from '../UI/Translator.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import { RedSliderEventListener, ColorInputEventListener, ColorButtonClickEventListener }
	from '../dialogs/ColorControlEventListeners.js';
import Color from '../dialogs/Color.js';

import { ZERO, COLOR_CONTROL } from '../util/Constants.js';

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

	#createColorButtonsDiv ( ) {
		let colorButtonsDiv = theHTMLElementsFactory.create ( 'div', null, this.#colorDiv );
		let cellColor = new Color ( COLOR_CONTROL.initialRed, COLOR_CONTROL.minColorValue, COLOR_CONTROL.minColorValue 	);
		let buttonEventListener = new ColorButtonClickEventListener ( this );

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
				colorButtonCellDiv.addEventListener ( 'click', buttonEventListener, false );
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
		let redSliderInput = theHTMLElementsFactory.create ( 'input',
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

		redSliderInput.addEventListener (
			'input',
			new RedSliderEventListener ( redSliderInput, this.#colorButtons ),
			false );

		redSliderInput.focus ( );
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

		inputHtmlElement.addEventListener (
			'input',
			new ColorInputEventListener ( this, this.#inputs ),
			false
		);

		return inputHtmlElement;
	}

	/**
	Create the Color Input div
	@private
	*/

	#createColorInputsDiv ( ) {
		this.#rgbDiv = theHTMLElementsFactory.create ( 'div', null, this.#colorDiv );

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

	/**
	@param {string} cssColor the initial color of the control in the css hex format ( #rrggbb )
	*/

	constructor ( cssColor ) {

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