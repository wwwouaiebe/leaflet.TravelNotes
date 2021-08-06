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

import { ZERO, ONE, TWO, THREE, HEXADECIMAL, MIN_COLOR_VALUE, MAX_COLOR_VALUE } from '../util/Constants.js';

const FIVE = 5;

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc a simple helper classe for the ColorControl

@------------------------------------------------------------------------------------------------------------------------------
*/

class Color {

	#red = MAX_COLOR_VALUE;
	#green = MAX_COLOR_VALUE;
	#blue = MAX_COLOR_VALUE;

	/**
	@param {?number} red The red value of the color. Must be between 0 and 255. If null set to 255
	@param {?number} green The green value of the color. Must be between 0 and 255. If null set to 255
	@param {?number} blue The blue value of the color. Must be between 0 and 255. If null set to 255
	*/

	constructor ( red, green, blue ) {

		/**
		The red value of the color
		*/

		this.#red =
			'number' === typeof red && MAX_COLOR_VALUE >= red && MIN_COLOR_VALUE <= red ? red : MAX_COLOR_VALUE;

		/**
		The green value of the color
		*/

		this.#green =
			'number' === typeof green && MAX_COLOR_VALUE >= green && MIN_COLOR_VALUE <= green ? green : MAX_COLOR_VALUE;

		/**
		The blue value of the color
		*/

		this.#blue =
			'number' === typeof blue && MAX_COLOR_VALUE >= blue && MIN_COLOR_VALUE <= blue ? blue : MAX_COLOR_VALUE;

		Object.seal ( this );
	}

	/**
	The red value of the color
	*/

	get red ( ) { return this.#red; }

	set red ( red ) {
		if ( 'number' === typeof red && MAX_COLOR_VALUE >= red && MIN_COLOR_VALUE <= red ) {
			this.#red = red;
		}
	}

	/**
	The green value of the color
	*/

	get green ( ) { return this.#green; }

	set green ( green ) {
		if ( 'number' === typeof green && MAX_COLOR_VALUE >= green && MIN_COLOR_VALUE <= green ) {
			this.#green = green;
		}
	}

	/**
	The blue value of the color
	*/

	get blue ( ) { return this.#blue; }

	set blue ( blue ) {
		if ( 'number' === typeof blue && MAX_COLOR_VALUE >= blue && MIN_COLOR_VALUE <= blue ) {
			this.#blue = blue;
		}
	}

	/**
	get the color in the css HEX format '#RRGGBB'
	*/

	get cssColor ( ) {
		return '\u0023' +
			this.#red.toString ( HEXADECIMAL ).padStart ( TWO, '0' ) +
			this.#green.toString ( HEXADECIMAL ).padStart ( TWO, '0' ) +
			this.#blue.toString ( HEXADECIMAL ).padStart ( TWO, '0' );
	}

	/**
	set the color from a cssColor in the HEX format or the rgb () format
	*/

	set cssColor ( cssColor ) {
		if ( '#' === cssColor [ ZERO ] ) {
			this.#red = Number.parseInt ( cssColor.substr ( ONE, TWO ), HEXADECIMAL );
			this.#green = Number.parseInt ( cssColor.substr ( THREE, TWO ), HEXADECIMAL );
			this.#blue = Number.parseInt ( cssColor.substr ( FIVE, TWO ), HEXADECIMAL );
		}
		else if ( 'rgb' === cssColor.substr ( ZERO, THREE ) ) {
			[ this.#red, this.#green, this.#blue ] =
				Array.from ( cssColor.match ( /[0-9]{1,3}/g ), value => Number.parseInt ( value ) );
		}
	}

	/**
	return a clone of the Color
	@return {color} a new color Oject similar to this Color
	*/

	clone ( ) { return new Color ( this.#red, this.#green, this.#blue ); }

	/**
	copy the RGB values of th this Color to the color given as parameter
	@param {Color} color the destination color
	*/

	copyTo ( color ) {
		color.red = this.#red;
		color.green = this.#green;
		color.blue = this.#blue;
	}
}

export default Color;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of Color.js file

@------------------------------------------------------------------------------------------------------------------------------
*/