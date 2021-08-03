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
Doc reviewed ...
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
import { ZERO, MAX_COLOR_VALUE } from '../util/Constants.js';

const OUR_COLOR_ROWS_NUMBER = 6;
const OUR_SLIDER_MAX_VALUE = 100;

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ColorControlEventListeners
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ColorControlEventListeners {

	constructor ( ) {
		this.colorDiv = null;
		this.colorButtons = [];
		this.redInput = null;
		this.greenInput = null;
		this.blueInput = null;
		this.newColor = new Color;
		this.colorSampleDiv = null;
		this.sliderMaxValue = OUR_SLIDER_MAX_VALUE;
		this.colorRowsNumber = OUR_COLOR_ROWS_NUMBER;
	}

	/**
	Event listener for the red color buttons
	*/

	onColorInput ( ) {
		this.newColor.red = parseInt ( this.redInput.value );
		this.newColor.green = parseInt ( this.greenInput.value );
		this.newColor.blue = parseInt ( this.blueInput.value );
		this.colorSampleDiv.style [ 'background-color' ] = this.newColor.cssColor;
		this.colorSampleDiv.color = this.newColor;
	}

	/**
	Event listener for the color buttons
	@private
	*/

	onColorButtonClick ( clickEvent ) {
		this.newColor = clickEvent.target.color.clone ( );
		this.redInput.value = this.newColor.red;
		this.greenInput.value = this.newColor.green;
		this.blueInput.value = this.newColor.blue;
		this.colorSampleDiv.style [ 'background-color' ] = this.newColor.cssColor;
		this.colorSampleDiv.color = this.newColor;
	}

	/**
	This method change the color buttons after a red button click or red slider input event
	@private
	*/

	onRedColorButtonOrSlider ( redValue ) {
		for ( let rowCounter = ZERO; rowCounter < this.colorRowsNumber; ++ rowCounter ) {
			for ( let cellCounter = ZERO; cellCounter < this.colorRowsNumber; ++ cellCounter ) {
				let colorButton = this.colorButtons [ ( this.colorRowsNumber * rowCounter ) + cellCounter ];
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
			Math.ceil ( inputEvent.target.valueAsNumber * ( MAX_COLOR_VALUE / this.sliderMaxValue ) )
		);
	}

	/**
	Event listener for the red color buttons
	@private
	*/

	onRedColorButtonClick ( clickEvent ) {
		this.onRedColorButtonOrSlider ( MAX_COLOR_VALUE - clickEvent.target.color.blue );

	}
}

export default ColorControlEventListeners;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of ColorControlEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/