import theTranslator from '../UI/Translator.js';
import theConfig from '../data/Config.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import { ZERO, ONE, TWO, THREE, HEXADECIMAL } from '../util/Constants.js';

const FIVE = 5;
const OUR_MIN_COLOR_VALUE = 0;
const OUR_MAX_COLOR_VALUE = 255;
const OUR_COLOR_CELLS_NUMBER = 6;
const OUR_COLOR_ROWS_NUMBER = 6;
const OUR_DELTA_COLOR = 51;

const OUR_SLIDER_MAX_VALUE = 100;
const OUR_SLIDER_STEP = 20;

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc a simple helper classe for the ColorControl

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

		this.red = 'number' === typeof red && OUR_MAX_COLOR_VALUE >= red ? red : OUR_MAX_COLOR_VALUE;

		/**
		The green value of the color
		*/

		this.green = 'number' === typeof green && OUR_MAX_COLOR_VALUE >= green ? green : OUR_MAX_COLOR_VALUE;

		/**
		The blue value of the color
		*/

		this.blue = 'number' === typeof blue && OUR_MAX_COLOR_VALUE >= blue ? blue : OUR_MAX_COLOR_VALUE;

		Object.seal ( this );
	}

	/**
	the color in the css HEX format '#RRGGBB'
	*/

	get cssColor ( ) {
		return '\u0023' +
			this.red.toString ( HEXADECIMAL ).padStart ( TWO, '0' ) +
			this.green.toString ( HEXADECIMAL ).padStart ( TWO, '0' ) +
			this.blue.toString ( HEXADECIMAL ).padStart ( TWO, '0' );
	}
	set cssColor ( cssColor ) {
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

class ColorControlEventListeners {
	/**
	Event listener for the color buttons
	@private
	*/

	onColorButtonClick ( clickEvent ) {
		myNewColor = clickEvent.target.color.clone ( );
		myRedInput.value = myNewColor.red;
		myGreenInput.value = myNewColor.green;
		myBlueInput.value = myNewColor.blue;
		myColorSampleDiv.style [ 'background-color' ] = myNewColor.cssColor;
		myColorSampleDiv.color = myNewColor;
	}

	/**
	This method change the color buttons after a red button click or red slider input event
	@private
	*/

	onRedColorButtonOrSlider ( redValue ) {
		for ( let rowCounter = ZERO; rowCounter < OUR_COLOR_ROWS_NUMBER; ++ rowCounter ) {
			for ( let cellCounter = ZERO; cellCounter < OUR_COLOR_ROWS_NUMBER; ++ cellCounter ) {
				let colorButton = myColorButtons [ ( OUR_COLOR_ROWS_NUMBER * rowCounter ) + cellCounter ];
				colorButton.color.red = redValue;
				colorButton.style [ 'background-color' ] = colorButton.color.cssColor;
			}
		}
	}

	/**
	Event listener for the red color slider
	@private
	*/

	onRedColorSliderInput ( inputEvent ) {

		// Math.ceil because with JS 100 * 2.55 = 254.99999....
		this.onRedColorButtonOrSlider (
			Math.ceil ( inputEvent.target.valueAsNumber * ( OUR_MAX_COLOR_VALUE / OUR_SLIDER_MAX_VALUE ) )
		);
	}

	/**
	Event listener for the red color buttons
	@private
	*/

	onRedColorButtonClick ( clickEvent ) {
		this.onRedColorButtonOrSlider ( OUR_MAX_COLOR_VALUE - clickEvent.target.color.blue );

	}
}

class ColorControl {

	#colorDiv = null;

	#colorButtons = [];

	#redInput = null;
	#greenInput = null;
	#blueInput = null;

	#newColor = new Color;

	#colorSampleDiv = null;

	#createColorButtonsDiv ( ) {
		let colorButtonsDiv = theHTMLElementsFactory.create ( 'div', null, this.#colorDiv );
		let cellColor = new Color ( theConfig.colorDialog.initialRed, OUR_MIN_COLOR_VALUE, OUR_MIN_COLOR_VALUE );

		for ( let rowCounter = ZERO; rowCounter < OUR_COLOR_ROWS_NUMBER; ++ rowCounter ) {
			let colorButtonsRowDiv = theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-ColorDialog-RowColorDiv'
				},
				colorButtonsDiv
			);

			cellColor.green = OUR_MIN_COLOR_VALUE;

			for ( let cellCounter = ZERO; cellCounter < OUR_COLOR_CELLS_NUMBER; ++ cellCounter ) {
				let colorButtonCellDiv = theHTMLElementsFactory.create (
					'div',
					{
						className : 'TravelNotes-ColorDialog-CellColorDiv'
					},
					colorButtonsRowDiv
				);
				colorButtonCellDiv.color = cellColor.clone ( );
				colorButtonCellDiv.style [ 'background-color' ] = cellColor.cssColor;

				// colorButtonCellDiv.addEventListener ( 'click', myOnColorButtonClick, false );
				cellColor.green += OUR_DELTA_COLOR;
				this.#colorButtons.push ( colorButtonCellDiv );
			}
			cellColor.blue += OUR_DELTA_COLOR;
		}
	}

	#createRedSliderDiv ( ) {
		let redSliderDiv = theHTMLElementsFactory.create ( 'div', null, this.#colorDiv );
		let sliderValue =
			Math.ceil ( theConfig.colorDialog.initialRed * ( OUR_SLIDER_MAX_VALUE / OUR_MAX_COLOR_VALUE ) );
		let redSliderInput = theHTMLElementsFactory.create ( 'input',
			{
				type : 'range',
				className : 'TravelNotes-ColorDialog-SliderInput',
				value : sliderValue,
				min : ZERO,
				max : OUR_SLIDER_MAX_VALUE,
				step : OUR_SLIDER_STEP

			},
			redSliderDiv
		);

		// redSliderInput.addEventListener ( 'input', myOnRedColorSliderInput, false );
		redSliderInput.focus ( );
	}

	#createRedButtonsDiv ( ) {
		let redButtonsDiv = theHTMLElementsFactory.create ( 'div', null, this.#colorDiv );
		let cellColor = new Color ( OUR_MAX_COLOR_VALUE, OUR_MIN_COLOR_VALUE, OUR_MIN_COLOR_VALUE );
		let redButtonsRowDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-RowColorDiv',
				id : 'TravelNotes-ColorDialog-RedButtonsRowDiv'
			},
			redButtonsDiv
		);
		for ( let cellCounter = ZERO; cellCounter < OUR_COLOR_CELLS_NUMBER; ++ cellCounter ) {
			let colorButtonCellDiv = theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-ColorDialog-CellColorDiv'
				},
				redButtonsRowDiv
			);
			colorButtonCellDiv.color = cellColor.clone ( );
			colorButtonCellDiv.style [ 'background-color' ] = colorButtonCellDiv.color.cssColor;

			// colorButtonCellDiv.addEventListener ( 'click', myOnRedColorButtonClick, false );
			cellColor.green += OUR_DELTA_COLOR;
			cellColor.blue += OUR_DELTA_COLOR;
		}
	}

	#createColorInputDiv ( ) {
		let rvbDiv = theHTMLElementsFactory.create ( 'div', null, this.#colorDiv );
		theHTMLElementsFactory.create ( 'text', { value : theTranslator.getText ( 'ColorDialog - Red' ) }, rvbDiv	);
		this.#redInput = theHTMLElementsFactory.create ( 'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				value : this.#newColor.red,
				min : OUR_MIN_COLOR_VALUE,
				max : OUR_MAX_COLOR_VALUE
			},
			rvbDiv
		);

		// myRedInput.addEventListener ( 'input', myOnColorInput, false );
		theHTMLElementsFactory.create ( 'text', { value : theTranslator.getText ( 'ColorDialog - Green' ) }, rvbDiv );
		this.#greenInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				value : this.#newColor.green,
				min : OUR_MIN_COLOR_VALUE,
				max : OUR_MAX_COLOR_VALUE
			},
			rvbDiv
		);

		// myGreenInput.addEventListener ( 'input', myOnColorInput, false );
		theHTMLElementsFactory.create ( 'text', { value : theTranslator.getText ( 'ColorDialog - Blue' ) }, rvbDiv );
		this.#blueInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				value : this.#newColor.blue,
				min : OUR_MIN_COLOR_VALUE,
				max : OUR_MAX_COLOR_VALUE
			},
			rvbDiv
		);

		// myBlueInput.addEventListener ( 'input', myOnColorInput, false );
	}

	#createColorSampleDiv ( ) {
		this.#colorSampleDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ColorDialog-ColorSampleDiv'
			},
			this.#colorDiv
		);
		this.#colorSampleDiv.style [ 'background-color' ] = this.#newColor.cssColor;
		this.#colorSampleDiv.color = this.#newColor;
	}

	constructor ( cssColor ) {

		this.#newColor.cssColor = cssColor;

		this.#colorDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ColorDialog-ColorDiv'
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

	get HTMLElements ( ) { return [ this.#colorDiv ]; }

}

export default ColorControl;