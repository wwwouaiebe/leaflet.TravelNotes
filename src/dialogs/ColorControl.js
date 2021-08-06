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
import theConfig from '../data/Config.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import {
	ColorInputEventListener,
	ColorButtonClickEventListener
} from '../dialogs/ColorControlEventListeners.js';
import Color from '../dialogs/Color.js';

import { ZERO, MIN_COLOR_VALUE, MAX_COLOR_VALUE } from '../util/Constants.js';

const OUR_COLOR_CELLS_NUMBER = 6;
const OUR_DELTA_COLOR = 51;
const OUR_SLIDER_STEP = 20;

const OUR_SLIDER_MAX_VALUE = 100;
const OUR_COLOR_ROWS_NUMBER = 6;

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ColorControl
@classdesc html control for color selection
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ColorControl {

	#colorDiv = null;

	/** An array with the color buttons of the ColorControl
	*/

	#colorButtons = [];

	/**
	The red input htmlElement of the ColorControl
	*/

	#inputs = {
		red : null,
		green : null,
		blue : null
	};

	/**
	The sample color div of the color control
	*/

	#colorSampleDiv = null;

	/**
	the new color
	*/

	#newColor = new Color;

	/**
	Create the Color Buttons div
	@private
	*/

	#createColorButtonsDiv ( ) {
		let colorButtonsDiv = theHTMLElementsFactory.create ( 'div', null, this.#colorDiv );
		let cellColor = new Color ( theConfig.colorDialog.initialRed, MIN_COLOR_VALUE, MIN_COLOR_VALUE );

		for ( let rowCounter = ZERO; rowCounter < OUR_COLOR_ROWS_NUMBER; ++ rowCounter ) {
			let colorButtonsRowDiv = theHTMLElementsFactory.create ( 'div', null, colorButtonsDiv );

			cellColor.green = MIN_COLOR_VALUE;

			for ( let cellCounter = ZERO; cellCounter < OUR_COLOR_CELLS_NUMBER; ++ cellCounter ) {
				let colorButtonCellDiv = theHTMLElementsFactory.create (
					'div',
					{
						className : 'TravelNotes-ColorControl-CellColorDiv'
					},
					colorButtonsRowDiv
				);

				// colorButtonCellDiv.color = cellColor.clone ( );
				colorButtonCellDiv.style [ 'background-color' ] = cellColor.cssColor;
				colorButtonCellDiv.addEventListener (
					'click',
					new ColorButtonClickEventListener ( this ),
					false
				);
				cellColor.green += OUR_DELTA_COLOR;
				this.#colorButtons.push ( colorButtonCellDiv );
			}
			cellColor.blue += OUR_DELTA_COLOR;
		}
	}

	/**
	Create the Red Slider div
	@private
	*/

	#createRedSliderDiv ( ) {
		let redSliderDiv = theHTMLElementsFactory.create ( 'div', null, this.#colorDiv );
		let sliderValue =
			Math.ceil ( theConfig.colorDialog.initialRed * ( OUR_SLIDER_MAX_VALUE / MAX_COLOR_VALUE ) );
		let redSliderInput = theHTMLElementsFactory.create ( 'input',
			{
				type : 'range',
				value : sliderValue,
				min : ZERO,
				max : OUR_SLIDER_MAX_VALUE,
				step : OUR_SLIDER_STEP

			},
			redSliderDiv
		);

		/*
		redSliderInput.addEventListener (
			'input',
			this.eventListeners.onRedColorSliderInput.bind ( this.eventListeners ),
			false );
		*/

		redSliderInput.focus ( );
	}

	/**
	Create the Color Input div
	@private
	*/

	#createColorInputDiv ( ) {
		let rvbDiv = theHTMLElementsFactory.create ( 'div', null, this.#colorDiv );
		theHTMLElementsFactory.create ( 'text', { value : theTranslator.getText ( 'ColorDialog - Red' ) }, rvbDiv	);
		this.#inputs.red = theHTMLElementsFactory.create ( 'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorControl-NumberInput',
				value : this.#newColor.red,
				min : MIN_COLOR_VALUE,
				max : MAX_COLOR_VALUE
			},
			rvbDiv
		);

		this.#inputs.red.addEventListener (
			'input',
			new ColorInputEventListener ( this, this.#inputs ),
			false
		);

		theHTMLElementsFactory.create ( 'text', { value : theTranslator.getText ( 'ColorDialog - Green' ) }, rvbDiv );
		this.#inputs.green = theHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorControl-NumberInput',
				value : this.#newColor.green,
				min : MIN_COLOR_VALUE,
				max : MAX_COLOR_VALUE
			},
			rvbDiv
		);
		this.#inputs.green.addEventListener (
			'input',
			new ColorInputEventListener ( this, this.#inputs ),
			false );

		theHTMLElementsFactory.create ( 'text', { value : theTranslator.getText ( 'ColorDialog - Blue' ) }, rvbDiv );
		this.#inputs.blue = theHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorControl-NumberInput',
				value : this.#newColor.blue,
				min : MIN_COLOR_VALUE,
				max : MAX_COLOR_VALUE
			},
			rvbDiv
		);
		this.#inputs.blue.addEventListener (
			'input',
			new ColorInputEventListener ( this, this.#inputs ),
			false
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

		// this.#colorSampleDiv.color = this.#newColor;
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
		this.#createColorInputDiv ( );
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