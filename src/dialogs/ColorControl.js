import theTranslator from '../UI/Translator.js';
import theConfig from '../data/Config.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import ColorControlEventListeners from '../dialogs/ColorControlEventListeners.js';
import Color from '../dialogs/Color.js';

import { ZERO, MIN_COLOR_VALUE, MAX_COLOR_VALUE } from '../util/Constants.js';

const OUR_COLOR_CELLS_NUMBER = 6;

const OUR_DELTA_COLOR = 51;
const OUR_SLIDER_STEP = 20;

class ColorControl {

	#createColorButtonsDiv ( ) {
		let colorButtonsDiv = theHTMLElementsFactory.create ( 'div', null, this.CCEL.colorDiv );
		let cellColor = new Color ( theConfig.colorDialog.initialRed, MIN_COLOR_VALUE, MIN_COLOR_VALUE );

		for ( let rowCounter = ZERO; rowCounter < this.CCEL.colorRowsNumber; ++ rowCounter ) {
			let colorButtonsRowDiv = theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-ColorDialog-RowColorDiv'
				},
				colorButtonsDiv
			);

			cellColor.green = MIN_COLOR_VALUE;

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

				colorButtonCellDiv.addEventListener (
					'click',
					this.CCEL.onColorButtonClick.bind ( this.CCEL ),
					false );
				cellColor.green += OUR_DELTA_COLOR;
				this.CCEL.colorButtons.push ( colorButtonCellDiv );
			}
			cellColor.blue += OUR_DELTA_COLOR;
		}
	}

	#createRedSliderDiv ( ) {
		let redSliderDiv = theHTMLElementsFactory.create ( 'div', null, this.CCEL.colorDiv );
		let sliderValue =
			Math.ceil ( theConfig.colorDialog.initialRed * ( this.CCEL.sliderMaxValue / MAX_COLOR_VALUE ) );
		let redSliderInput = theHTMLElementsFactory.create ( 'input',
			{
				type : 'range',
				className : 'TravelNotes-ColorDialog-SliderInput',
				value : sliderValue,
				min : ZERO,
				max : this.CCEL.sliderMaxValue,
				step : OUR_SLIDER_STEP

			},
			redSliderDiv
		);

		redSliderInput.addEventListener (
			'input',
			this.CCEL.onRedColorSliderInput.bind ( this.CCEL ),
			false );
		redSliderInput.focus ( );
	}

	#createRedButtonsDiv ( ) {
		let redButtonsDiv = theHTMLElementsFactory.create ( 'div', null, this.CCEL.colorDiv );
		let cellColor = new Color ( MAX_COLOR_VALUE, MIN_COLOR_VALUE, MIN_COLOR_VALUE );
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

			colorButtonCellDiv.addEventListener (
				'click',
				this.CCEL.onRedColorButtonClick.bind ( this.CCEL ),
				false );
			cellColor.green += OUR_DELTA_COLOR;
			cellColor.blue += OUR_DELTA_COLOR;
		}
	}

	#createColorInputDiv ( ) {
		let rvbDiv = theHTMLElementsFactory.create ( 'div', null, this.CCEL.colorDiv );
		theHTMLElementsFactory.create ( 'text', { value : theTranslator.getText ( 'ColorDialog - Red' ) }, rvbDiv	);
		this.CCEL.redInput = theHTMLElementsFactory.create ( 'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				value : this.CCEL.newColor.red,
				min : MIN_COLOR_VALUE,
				max : MAX_COLOR_VALUE
			},
			rvbDiv
		);

		this.CCEL.redInput.addEventListener (
			'input',
			this.CCEL.onColorInput.bind ( this.CCEL ),
			false
		);
		theHTMLElementsFactory.create ( 'text', { value : theTranslator.getText ( 'ColorDialog - Green' ) }, rvbDiv );
		this.CCEL.greenInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				value : this.CCEL.newColor.green,
				min : MIN_COLOR_VALUE,
				max : MAX_COLOR_VALUE
			},
			rvbDiv
		);

		this.CCEL.greenInput.addEventListener (
			'input',
			this.CCEL.onColorInput.bind ( this.CCEL ),
			false );
		theHTMLElementsFactory.create ( 'text', { value : theTranslator.getText ( 'ColorDialog - Blue' ) }, rvbDiv );
		this.CCEL.blueInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				value : this.CCEL.newColor.blue,
				min : MIN_COLOR_VALUE,
				max : MAX_COLOR_VALUE
			},
			rvbDiv
		);

		this.CCEL.blueInput.addEventListener (
			'input',
			this.CCEL.onColorInput.bind ( this.CCEL ),
			false
		);
	}

	#createColorSampleDiv ( ) {
		this.CCEL.colorSampleDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ColorDialog-ColorSampleDiv'
			},
			this.CCEL.colorDiv
		);
		this.CCEL.colorSampleDiv.style [ 'background-color' ] = this.CCEL.newColor.cssColor;
		this.CCEL.colorSampleDiv.color = this.CCEL.newColor;
	}

	constructor ( cssColor ) {

		this.CCEL = new ColorControlEventListeners ( );

		this.CCEL.newColor.cssColor = cssColor;

		this.CCEL.colorDiv = theHTMLElementsFactory.create (
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

	get HTMLElements ( ) { return [ this.CCEL.colorDiv ]; }

	get cssColor ( ) { return this.CCEL.newColor.cssColor; }

}

export default ColorControl;