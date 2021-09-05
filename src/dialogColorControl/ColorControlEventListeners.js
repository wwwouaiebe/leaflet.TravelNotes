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

@file ColorControlEventListeners.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module dialogColorControl
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import Color from '../dialogColorControl/Color.js';
import { ZERO, COLOR_CONTROL } from '../main/Constants.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class RedSliderInputEL
@classdesc Input event listener for the red slider
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class RedSliderInputEL {

	#redSlider = null;
	#colorButtons = null;

	/*
	constructor
	*/

	constructor ( redSlider, colorButtons ) {
		this.#redSlider = redSlider;
		this.#colorButtons = colorButtons;
		Object.freeze ( this );
	}

	destructor ( ) {
		this.#redSlider = null;
		this.#colorButtons = null;
	}

	/**
	Event listener method
	*/

	handleEvent ( inputEvent ) {
		inputEvent.stopPropagation ( );
		let newColor = new Color ( );

		// Math.ceil because with JS 100 * 2.55 = 254.99999....
		newColor.red =
			Math.ceil ( inputEvent.target.valueAsNumber * ( COLOR_CONTROL.maxColorValue / COLOR_CONTROL.sliderMaxValue ) );
		for ( let rowCounter = ZERO; rowCounter < COLOR_CONTROL.rowsNumber; ++ rowCounter ) {
			newColor.blue = rowCounter * COLOR_CONTROL.deltaColor;
			for ( let cellCounter = ZERO; cellCounter < COLOR_CONTROL.rowsNumber; ++ cellCounter ) {
				newColor.green = cellCounter * COLOR_CONTROL.deltaColor;
				this.#colorButtons [ ( COLOR_CONTROL.rowsNumber * rowCounter ) + cellCounter ]
					.style [ 'background-color' ] = newColor.cssColor;
			}
		}

	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class ColorInputEL
@classdesc Input event for the color inputs
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class ColorInputEL {

	#colorControl = null;
	#inputs = null;

	/*
	constructor
	*/

	constructor ( colorControl, inputs ) {
		this.#colorControl = colorControl;
		this.#inputs = inputs;
		Object.freeze ( this );
	}

	destructor ( ) {
		this.#colorControl = null;
		this.#inputs = null;
	}

	/**
	Event listener method
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

/**
@--------------------------------------------------------------------------------------------------------------------------

@class ColorButtonClickEL
@classdesc click event listener for the color buttons
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class ColorButtonClickEL {

	#colorControl = null;

	/*
	constructor
	*/

	constructor ( colorControl ) {
		this.#colorControl = colorControl;
		Object.freeze ( this );
	}

	destructor ( ) {
		this.#colorControl = null;
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
	RedSliderInputEL,
	ColorInputEL,
	ColorButtonClickEL
};

/*
@------------------------------------------------------------------------------------------------------------------------------

end of ColorControlEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/