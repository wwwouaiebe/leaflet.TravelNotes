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
	- v2.1.0:
		- created
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file PolylineEncoder.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module coreLib
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { ZERO, ONE } from '../main/Constants.js';

const OUR_NUMBER5 = 5;
const OUR_NUMBER10 = 10;
const OUR_NUMBER31 = 0x1f;
const OUR_NUMBER32 = 0x20;
const OUR_NUMBER63 = 0x3f;
const OUR_DOT5 = 0.5;

/*
Encoded Polyline Algorithm Format

Polyline encoding is a lossy compression algorithm that allows you to store a series of coordinates as a single string.
Point coordinates are encoded using signed values. If you only have a few static points, you may also wish to use the
interactive polyline encoding utility.

The encoding process converts a binary value into a series of character codes for ASCII characters using the familiar
base64 encoding scheme: to ensure proper display of these characters, encoded values are summed with 63
(the ASCII character '?') before converting them into ASCII. The algorithm also checks for additional character codes
for a given point by checking the least significant bit of each byte group; if this bit is set to 1, the point is not
yet fully formed and additional data must follow.

Additionally, to conserve space, points only include the offset from the previous point (except of course for the first
point). All points are encoded in Base64 as signed integers, as latitudes and longitudes are signed values. The encoding
format within a polyline needs to represent two coordinates representing latitude and longitude to a reasonable precision.
Given a maximum longitude of +/- 180 degrees to a precision of 5 decimal places (180.00000 to -180.00000), this results
in the need for a 32 bit signed binary integer value.

Note that the backslash is interpreted as an escape character within string literals. Any output of this utility should
convert backslash characters to double-backslashes within string literals.

The steps for encoding such a signed value are specified below.

    Take the initial signed value:
    -179.9832104
    Take the decimal value and multiply it by 1e5, rounding the result:
    -17998321
    Convert the decimal value to binary. Note that a negative value must be calculated using its two's complement by
	inverting the binary value and adding one to the result:
    00000001 00010010 10100001 11110001
    11111110 11101101 01011110 00001110
    11111110 11101101 01011110 00001111
    Left-shift the binary value one bit:
    11111101 11011010 10111100 00011110
    If the original decimal value is negative, invert this encoding:
    00000010 00100101 01000011 11100001
    Break the binary value out into 5-bit chunks (starting from the right hand side):
    00001 00010 01010 10000 11111 00001
    Place the 5-bit chunks into reverse order:
    00001 11111 10000 01010 00010 00001
    OR each value with 0x20 if another bit chunk follows:
    100001 111111 110000 101010 100010 000001
    Convert each value to decimal:
    33 63 48 42 34 1
    Add 63 to each value:
    96 126 111 105 97 64
    Convert each value to its ASCII equivalent:
    `~oia@

The table below shows some examples of encoded points, showing the encodings as a series of offsets from
previous points.

Example

Points: (38.5, -120.2), (40.7, -120.95), (43.252, -126.453)
Latitude Longitude	Latitude	Longitude  	Change In  	Change In  	Encoded 	Encoded 	Encoded
					in E5 		in E5		Latitude	Longitude	Latitude	Longitude	Point
38.5 	-120.2 		3850000		-12020000 	+3850000 	-12020000 	_p~iF 		~ps|U 		_p~iF~ps|U
40.7 	-120.95 	4070000		-12095000 	+220000 	-75000 		_ulL 		nnqC 		_ulLnnqC
43.252 	-126.453 	4325200		-12645300 	+255200 	-550300 	_mqN 		vxq`@ 		_mqNvxq`@

Encoded polyline: _p~iF~ps|U_ulLnnqC_mqNvxq`@
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@class PolylineEncoder
@classdesc Encoder/decoder to encode or decode a polyline into a string.
Based on Mark McClure polyline encoder (more info needed...)
@see https://github.com/Project-OSRM/osrm-frontend/blob/master/WebContent/routing/OSRM.RoutingGeometry.js
@see https://github.com/graphhopper/directions-api-js-client/blob/master/src/GHUtil.js GHUtil.prototype.decodePath
@see https://developers.google.com/maps/documentation/utilities/polylinealgorithm
@see https://github.com/mapbox/polyline
@see {@link thePolylineEncoder} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class PolylineEncoder {

	/**
	This method round a number in the same way than Python 2
	@param {number} value The value to round
	@return {number} The rounded value
	@private
	*/

	#python2Round ( value ) {
		return Math.floor ( Math.abs ( value ) + OUR_DOT5 ) * ( ZERO <= value ? ONE : -ONE );
	}

	/**
	Helper method for the encode...
	@private
	*/

	#encodeDelta ( current, previous, factorD ) {
		let currentCoordRound = this.#python2Round ( current * factorD );
		let previousCoordRound = this.#python2Round ( previous * factorD );
		let coordinateDelta = currentCoordRound - previousCoordRound;
		/* eslint-disable no-bitwise */
		coordinateDelta <<= ONE;
		if ( ZERO > currentCoordRound - previousCoordRound ) {
			coordinateDelta = ~ coordinateDelta;
		}
		let outputDelta = '';
		while ( OUR_NUMBER32 <= coordinateDelta ) {
			outputDelta += String.fromCharCode ( ( OUR_NUMBER32 | ( coordinateDelta & OUR_NUMBER31 ) ) + OUR_NUMBER63 );
			coordinateDelta >>= OUR_NUMBER5;
		}
		/* eslint-enable no-bitwise */
		outputDelta += String.fromCharCode ( coordinateDelta + OUR_NUMBER63 );
		return outputDelta;
	}

	/**
	tmp variable for decode and decodeDelta methods communication (cannot use parameter the two functions are modifying the
	value )
	@private
	*/

	#index = ZERO;

	/**
	Helper method for the decode...
	@private
	*/

	#decodeDelta ( encodedString ) {
		let byte = null;
		let shift = ZERO;
		let result = ZERO;
		do {
			byte = encodedString.charCodeAt ( this.#index ++ ) - OUR_NUMBER63;
			/* eslint-disable no-bitwise */
			result |= ( byte & OUR_NUMBER31 ) << shift;
			shift += OUR_NUMBER5;
		} while ( OUR_NUMBER32 <= byte );
		return ( ( result & ONE ) ? ~ ( result >> ONE ) : ( result >> ONE ) );
		/* eslint-enable no-bitwise */
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	encode an array of coordinates to a string ( coordinates can be 1d or 2d or 3d or more...)
	@param {array.<array.<number>>} coordinates the coordinates to encode
	@param {Array.<number>} precisions an array with the precision to use for each dimension
	@return {string} the encoded coordinates
	*/

	encode ( coordinatesArray, precisions ) {
		if ( ! coordinatesArray.length ) {
			return '';
		}

		let dimensions = precisions.length;
		let factors = Array.from ( precisions, precision => Math.pow ( OUR_NUMBER10, precision ) );

		let output = '';
		for ( let counter = 0; counter < dimensions; counter ++ ) {
			output += this.#encodeDelta ( coordinatesArray [ ZERO ] [ counter ], ZERO, factors [ counter ] );
		}
		for ( let coordCounter = ONE; coordCounter < coordinatesArray.length; coordCounter ++ ) {
			let currentCoord = coordinatesArray [ coordCounter ];
			let previousCoord = coordinatesArray [ coordCounter - ONE ];
			for ( let counter = 0; counter < dimensions; counter ++ ) {
				output += this.#encodeDelta ( currentCoord [ counter ], previousCoord [ counter ], factors [ counter ] );
			}
		}

		return output;
	}

	/**
	decode a string into an array of coordinates (coordinates can be 1d, 2d, 3d or more...)
	@param {string } encodedString the string to decode
	@param {Array.<number>} precisions an array with the precision to use for each dimension
	@return {array.<array.<number>>} the decoded coordinates
	*/

	decode ( encodedString, precisions ) {
		let dimensions = precisions.length;
		if ( ! encodedString || ZERO === encodedString.length ) {
			return [ ];
		}

		this.#index = ZERO;
		let allDecodedValues = [];
		let factors = Array.from ( precisions, precision => Math.pow ( OUR_NUMBER10, precision ) );
		let tmpValues = new Array ( dimensions ).fill ( ZERO );

		while ( this.#index < encodedString.length ) {
			let decodedValues = new Array ( dimensions ).fill ( ZERO );
			for ( let coordCounter = 0; coordCounter < dimensions; coordCounter ++ ) {
				tmpValues [ coordCounter ] += this.#decodeDelta ( encodedString );
				decodedValues [ coordCounter ] = tmpValues [ coordCounter ] / factors [ coordCounter ];
			}
			allDecodedValues.push ( decodedValues );
		}

		return allDecodedValues;
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of PolylineEncoder class
@type {PolylineEncoder}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const thePolylineEncoder = new PolylineEncoder ( );

export default thePolylineEncoder;

/*
--- End of PolylineEncoder.js file --------------------------------------------------------------------------------------------
*/