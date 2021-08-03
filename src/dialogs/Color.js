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

@file Color.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module Color
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { ONE, TWO, THREE, HEXADECIMAL, MAX_COLOR_VALUE } from '../util/Constants.js';

const FIVE = 5;

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

		this.red = 'number' === typeof red && MAX_COLOR_VALUE >= red ? red : MAX_COLOR_VALUE;

		/**
		The green value of the color
		*/

		this.green = 'number' === typeof green && MAX_COLOR_VALUE >= green ? green : MAX_COLOR_VALUE;

		/**
		The blue value of the color
		*/

		this.blue = 'number' === typeof blue && MAX_COLOR_VALUE >= blue ? blue : MAX_COLOR_VALUE;

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

export default Color;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of Color.js file

@------------------------------------------------------------------------------------------------------------------------------
*/