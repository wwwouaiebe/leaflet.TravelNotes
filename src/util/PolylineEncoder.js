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
Doc reviewed 20200803
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

@module PolylineEncoder
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { ZERO, ONE } from '../util/Constants.js';

const OUR_NUMBER5 = 5;
const OUR_NUMBER10 = 10;
const OUR_NUMBER31 = 0x1f;
const OUR_NUMBER32 = 0x20;
const OUR_NUMBER63 = 0x3f;
const OUR_NUMBER100 = 100;
const OUR_DOT5 = 0.5;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourPython2Round
@desc This function round a number in the same wat than Python 2
@param {number} value The value to round
@return {number} The rounded value
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourPython2Round ( value ) {
	return Math.floor ( Math.abs ( value ) + OUR_DOT5 ) * ( ZERO <= value ? ONE : -ONE );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourEncode
@desc Helper function for the polylineEncoder.encode ( ) method
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/* eslint-disable no-bitwise */
function ourEncode ( current, previous, factor ) {
	let currentRound = ourPython2Round ( current * factor );
	let previousRound = ourPython2Round ( previous * factor );
	let coordinate = currentRound - previousRound;
	coordinate <<= ONE;
	if ( ZERO > currentRound - previousRound ) {
		coordinate = ~ coordinate;
	}
	let output = '';
	while ( OUR_NUMBER32 <= coordinate ) {
		output += String.fromCharCode ( ( OUR_NUMBER32 | ( coordinate & OUR_NUMBER31 ) ) + OUR_NUMBER63 );
		coordinate >>= OUR_NUMBER5;
	}
	output += String.fromCharCode ( coordinate + OUR_NUMBER63 );
	return output;
}
/* eslint-enable no-bitwise */

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc Encoder/decoder to encode or decode a polyline into a string
@see https://github.com/Project-OSRM/osrm-frontend/blob/master/WebContent/routing/OSRM.RoutingGeometry.js
@see https://github.com/graphhopper/directions-api-js-client/blob/master/src/GHUtil.js GHUtil.prototype.decodePath
@see https://developers.google.com/maps/documentation/utilities/polylinealgorithm
@see https://github.com/mapbox/polyline
@see {@link thePolylineEncoder} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/
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

class polylineEncoder {

	/*
	encode an array of 2d coordinates to a string
	@param {array.<array.<number>>} coordinates the coordinates to encode
	@param {number} precision the precision used for decimals
	@return {string} the encoded coordinates
	*/

	encode ( coordinates, precision ) {
		if ( ! coordinates.length ) {
			return '';
		}

		let factor = Math.pow ( OUR_NUMBER10, Number.isInteger ( precision ) ? precision : OUR_NUMBER5 );
		let output =
				ourEncode ( coordinates[ ZERO ][ ZERO ], ZERO, factor ) +
				ourEncode ( coordinates[ ZERO ][ ONE ], ZERO, factor );

		for ( let coordCounter = ONE; coordCounter < coordinates.length; coordCounter ++ ) {
			let currentCoord = coordinates[ coordCounter ];
			let previousCoord = coordinates[ coordCounter - ONE ];
			output += ourEncode ( currentCoord [ ZERO ], previousCoord [ ZERO ], factor );
			output += ourEncode ( currentCoord [ ONE ], previousCoord [ ONE ], factor );
		}

		return output;
	}

	/*
	decode a string into an array of 2d or 3d coordinates
	@param {string } encodedString the string to decode
	@param {number} precision the precision used for decimals
	@param {boolean} is3D true when the encoded polyline is a 3d polyline
	@return {array.<array.<number>>} the decoded coordinates
	*/

	decode ( encodedString, precision, is3D = false ) {

		let index = ZERO;
		let lat = ZERO;
		let lng = ZERO;
		let elev = ZERO;
		let coordinates = [];
		let factor = Math.pow ( OUR_NUMBER10, precision );

		/* eslint-disable no-bitwise */
		while ( index < encodedString.length ) {
			let byte = null;
			let shift = ZERO;
			let result = ZERO;
			do {
				byte = encodedString.charCodeAt ( index ++ ) - OUR_NUMBER63;
				result |= ( byte & OUR_NUMBER31 ) << shift;
				shift += OUR_NUMBER5;
			} while ( OUR_NUMBER32 <= byte );
			let deltaLat = ( ( result & ONE ) ? ~ ( result >> ONE ) : ( result >> ONE ) );
			lat += deltaLat;

			shift = ZERO;
			result = ZERO;
			do {
				byte = encodedString.charCodeAt ( index ++ ) - OUR_NUMBER63;
				result |= ( byte & OUR_NUMBER31 ) << shift;
				shift += OUR_NUMBER5;
			} while ( OUR_NUMBER32 <= byte );
			let deltaLon = ( ( result & ONE ) ? ~ ( result >> ONE ) : ( result >> ONE ) );
			lng += deltaLon;

			if ( is3D ) {
				shift = ZERO;
				result = ZERO;
				do {
					byte = encodedString.charCodeAt ( index ++ ) - OUR_NUMBER63;
					result |= ( byte & OUR_NUMBER31 ) << shift;
					shift += OUR_NUMBER5;
				} while ( OUR_NUMBER32 <= byte );
				let deltaEle = ( ( result & ONE ) ? ~ ( result >> ONE ) : ( result >> ONE ) );
				elev += deltaEle;
				coordinates.push ( [ lat / factor, lng / factor, elev / OUR_NUMBER100 ] );
			}
			else {
				coordinates.push ( [ lat / factor, lng / factor ] );
			}
		}
		/* eslint-enable no-bitwise */

		return coordinates;
	}
}

const ourPolylineEncoder = Object.freeze ( new polylineEncoder ( ) );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of polylineEncoder class
	@type {PolylineEncoder}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourPolylineEncoder as thePolylineEncoder
};

/*
--- End of PolylineEncoder.js file --------------------------------------------------------------------------------------------
*/