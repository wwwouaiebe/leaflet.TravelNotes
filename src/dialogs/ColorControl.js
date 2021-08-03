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
import ColorControlEventListeners from '../dialogs/ColorControlEventListeners.js';
import Color from '../dialogs/Color.js';

import { ZERO, MIN_COLOR_VALUE, MAX_COLOR_VALUE } from '../util/Constants.js';

const OUR_COLOR_CELLS_NUMBER = 6;
const OUR_DELTA_COLOR = 51;
const OUR_SLIDER_STEP = 20;

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ColorControl
@classdesc html control for color selection
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ColorControl {

	#colorDiv = null;

	/**
	Create the Color Buttons div
	@private
	*/

	#createColorButtonsDiv ( ) {
		let colorButtonsDiv = theHTMLElementsFactory.create ( 'div', null, this.#colorDiv );
		let cellColor = new Color ( theConfig.colorDialog.initialRed, MIN_COLOR_VALUE, MIN_COLOR_VALUE );

		for ( let rowCounter = ZERO; rowCounter < this.eventListeners.colorRowsNumber; ++ rowCounter ) {
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
				colorButtonCellDiv.color = cellColor.clone ( );
				colorButtonCellDiv.style [ 'background-color' ] = cellColor.cssColor;

				colorButtonCellDiv.addEventListener (
					'click',
					this.eventListeners.onColorButtonClick.bind ( this.eventListeners ),
					false );
				cellColor.green += OUR_DELTA_COLOR;
				this.eventListeners.colorButtons.push ( colorButtonCellDiv );
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
			Math.ceil ( theConfig.colorDialog.initialRed * ( this.eventListeners.sliderMaxValue / MAX_COLOR_VALUE ) );
		let redSliderInput = theHTMLElementsFactory.create ( 'input',
			{
				type : 'range',
				value : sliderValue,
				min : ZERO,
				max : this.eventListeners.sliderMaxValue,
				step : OUR_SLIDER_STEP

			},
			redSliderDiv
		);

		redSliderInput.addEventListener (
			'input',
			this.eventListeners.onRedColorSliderInput.bind ( this.eventListeners ),
			false );
		redSliderInput.focus ( );
	}

	/**
	Create the Red Buttons div
	@private
	*/

	#createRedButtonsDiv ( ) {
		let redButtonsDiv = theHTMLElementsFactory.create ( 'div', null, this.#colorDiv );
		let cellColor = new Color ( MAX_COLOR_VALUE, MIN_COLOR_VALUE, MIN_COLOR_VALUE );
		let redButtonsRowDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ColorControl-RedButtonsRowDiv'
			},
			redButtonsDiv
		);
		for ( let cellCounter = ZERO; cellCounter < OUR_COLOR_CELLS_NUMBER; ++ cellCounter ) {
			let colorButtonCellDiv = theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-ColorControl-CellColorDiv'
				},
				redButtonsRowDiv
			);
			colorButtonCellDiv.color = cellColor.clone ( );
			colorButtonCellDiv.style [ 'background-color' ] = colorButtonCellDiv.color.cssColor;

			colorButtonCellDiv.addEventListener (
				'click',
				this.eventListeners.onRedColorButtonClick.bind ( this.eventListeners ),
				false );
			cellColor.green += OUR_DELTA_COLOR;
			cellColor.blue += OUR_DELTA_COLOR;
		}
	}

	/**
	Create the Color Input div
	@private
	*/

	#createColorInputDiv ( ) {
		let rvbDiv = theHTMLElementsFactory.create ( 'div', null, this.#colorDiv );
		theHTMLElementsFactory.create ( 'text', { value : theTranslator.getText ( 'ColorDialog - Red' ) }, rvbDiv	);
		this.eventListeners.redInput = theHTMLElementsFactory.create ( 'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorControl-NumberInput',
				value : this.eventListeners.newColor.red,
				min : MIN_COLOR_VALUE,
				max : MAX_COLOR_VALUE
			},
			rvbDiv
		);

		this.eventListeners.redInput.addEventListener (
			'input',
			this.eventListeners.onColorInput.bind ( this.eventListeners ),
			false
		);
		theHTMLElementsFactory.create ( 'text', { value : theTranslator.getText ( 'ColorDialog - Green' ) }, rvbDiv );
		this.eventListeners.greenInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorControl-NumberInput',
				value : this.eventListeners.newColor.green,
				min : MIN_COLOR_VALUE,
				max : MAX_COLOR_VALUE
			},
			rvbDiv
		);

		this.eventListeners.greenInput.addEventListener (
			'input',
			this.eventListeners.onColorInput.bind ( this.eventListeners ),
			false );
		theHTMLElementsFactory.create ( 'text', { value : theTranslator.getText ( 'ColorDialog - Blue' ) }, rvbDiv );
		this.eventListeners.blueInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorControl-NumberInput',
				value : this.eventListeners.newColor.blue,
				min : MIN_COLOR_VALUE,
				max : MAX_COLOR_VALUE
			},
			rvbDiv
		);

		this.eventListeners.blueInput.addEventListener (
			'input',
			this.eventListeners.onColorInput.bind ( this.eventListeners ),
			false
		);
	}

	/**
	Create the Color Sample div
	@private
	*/

	#createColorSampleDiv ( ) {
		this.eventListeners.colorSampleDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ColorControl-ColorSampleDiv'
			},
			this.#colorDiv
		);
		this.eventListeners.colorSampleDiv.style [ 'background-color' ] = this.eventListeners.newColor.cssColor;
		this.eventListeners.colorSampleDiv.color = this.eventListeners.newColor;
	}

	/**
	@param {string} cssColor the initial color of the control in the css hex format ( #rrggbb )
	*/

	constructor ( cssColor ) {

		this.eventListeners = new ColorControlEventListeners ( );

		this.eventListeners.newColor.cssColor = cssColor;

		this.#colorDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ColorControl-ColorDiv'
			}
		);
		this.#createColorButtonsDiv ( );

		if ( theConfig.colorDialog.haveSlider ) {
			this.#createRedSliderDiv ( );
		}
		else {
			this.#createRedButtonsDiv ( );
		}
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

	get cssColor ( ) { return this.eventListeners.newColor.cssColor; }

}

export default ColorControl;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of ColorControlEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/