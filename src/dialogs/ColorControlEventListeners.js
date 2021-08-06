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

@file ColorControlEventListeners.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module ColorControlEventListeners
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import Color from '../dialogs/Color.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ColorControlEventListeners
@classdesc Container for vars and event listeners for the ColorControl
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

/*

class ColorControlEventListeners {

	constructor ( ) {

		this.newColor = new Color;

		this.sliderMaxValue = OUR_SLIDER_MAX_VALUE;

		this.colorRowsNumber = OUR_COLOR_ROWS_NUMBER;
	}

	#onRedColorButtonOrSlider ( redValue ) {
		for ( let rowCounter = ZERO; rowCounter < this.colorRowsNumber; ++ rowCounter ) {
			for ( let cellCounter = ZERO; cellCounter < this.colorRowsNumber; ++ cellCounter ) {
				let colorButton = this.colorButtons [ ( this.colorRowsNumber * rowCounter ) + cellCounter ];
				colorButton.color.red = redValue;
				colorButton.style [ 'background-color' ] = colorButton.color.cssColor;
			}
		}
	}

	onRedColorSliderInput ( inputEvent ) {

		// Math.ceil because with JS 100 * 2.55 = 254.99999....
		this.#onRedColorButtonOrSlider (
			Math.ceil ( inputEvent.target.valueAsNumber * ( MAX_COLOR_VALUE / this.sliderMaxValue ) )
		);
	}

	onRedColorButtonClick ( clickEvent ) {
		this.#onRedColorButtonOrSlider ( MAX_COLOR_VALUE - clickEvent.target.color.blue );

	}
}

*/

class ColorInputEventListener {

	#colorControl = null;
	#inputs = null;

	constructor ( colorControl, inputs ) {
		this.#colorControl = colorControl;
		this.#inputs = inputs;
	}

	/**
	Event listener for the color input
	*/

	handleEvent ( inputEvent ) {
		inputEvent.stopPropagation ( );
		let newColor = new Color (
			Number.parseInt ( this.#inputs.red.value ),
			Number.parseInt ( this.#inputs.green.value ),
			Number.parseInt ( this.#inputs.blue.value )
		);
		this.#colorControl.color = newColor;
	}
}

class ColorButtonClickEventListener {

	#colorControl = null;

	constructor ( colorControl ) {
		this.#colorControl = colorControl;
	}

	/**
	Event listener method
	*/

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		let newColor = new Color ( );
		newColor.cssColor = clickEvent.target.style [ 'background-color' ];
		this.#colorControl.color = newColor;
	}

}

export {
	ColorInputEventListener,
	ColorButtonClickEventListener
};

/*
@------------------------------------------------------------------------------------------------------------------------------

end of ColorControlEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/