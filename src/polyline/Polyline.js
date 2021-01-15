/* eslint no-bitwise: "off" */

const ZERO = 0;
const ONE = 1;

const NUMBER5 = 5;
const NUMBER10 = 10;
const NUMBER31 = 0x1f;
const NUMBER32 = 0x20;
const NUMBER63 = 0x3f;
const NUMBER100 = 100;

function python2Round ( value ) {

	// Google's polyline algorithm uses the same rounding strategy as Python 2, which is different from JS for negative values
	return Math.floor ( Math.abs ( value ) + 0.5 ) * ( ZERO <= value ? ONE : -ONE );
}

function encode ( current, previous, factor ) {
	current = python2Round ( current * factor );
	previous = python2Round ( previous * factor );
	let coordinate = current - previous;
	coordinate <<= ONE;
	if ( ZERO > current - previous ) {
		coordinate = ~ coordinate;
	}
	let output = '';
	while ( NUMBER32 <= coordinate ) {
		output += String.fromCharCode ( ( NUMBER32 | ( coordinate & NUMBER31 ) ) + NUMBER63 );
		coordinate >>= NUMBER5;
	}
	output += String.fromCharCode ( coordinate + NUMBER63 );
	return output;
}

/**
 * Decodes to a [latitude, longitude] coordinates array.
 *
 * This is adapted from the implementation in Project-OSRM.
 *
 * @param {String} str
 * @param {Number} precision
 * @returns {Array}
 *
 * @see https://github.com/Project-OSRM/osrm-frontend/blob/master/WebContent/routing/OSRM.RoutingGeometry.js
 */

let polyline = {

	encode : function ( coordinates, precision ) {
		if ( ! coordinates.length ) {
			return '';
		}

		let factor = Math.pow ( NUMBER10, Number.isInteger ( precision ) ? precision : NUMBER5 ),
			output = encode ( coordinates[ ZERO ][ ZERO ], ZERO, factor ) + encode ( coordinates[ ZERO ][ ONE ], ZERO, factor );

		for ( let i = ONE; i < coordinates.length; i ++ ) {
			let a = coordinates[ i ],
				b = coordinates[ i - ONE ];
			output += encode ( a[ ZERO ], b[ ZERO ], factor );
			output += encode ( a[ ONE ], b[ ONE ], factor );
		}

		return output;
	},

	/*
	--- myDecodePath function -----------------------------------------------------------------------------------------

	Adapted from https://github.com/graphhopper/directions-api-js-client/blob/master/src/GHUtil.js
	See GHUtil.prototype.decodePath
	See also https://developers.google.com/maps/documentation/utilities/polylinealgorithm
	Some adaptation for eslint and inverted lat and lng in the results...

	-------------------------------------------------------------------------------------------------------------------
	*/

	decode : function ( encodedString, precision, is3D = false ) {

		let index = ZERO;
		let lat = ZERO;
		let lng = ZERO;
		let elev = ZERO;
		let coordinates = [];
		let factor = Math.pow ( NUMBER10, precision );

		while ( index < encodedString.length ) {
			let byte = null;
			let shift = ZERO;
			let result = ZERO;
			do {
				byte = encodedString.charCodeAt ( index ++ ) - NUMBER63;
				result |= ( byte & NUMBER31 ) << shift;
				shift += NUMBER5;
			} while ( NUMBER32 <= byte );
			let deltaLat = ( ( result & ONE ) ? ~ ( result >> ONE ) : ( result >> ONE ) );
			lat += deltaLat;

			shift = ZERO;
			result = ZERO;
			do {
				byte = encodedString.charCodeAt ( index ++ ) - NUMBER63;
				result |= ( byte & NUMBER31 ) << shift;
				shift += NUMBER5;
			} while ( NUMBER32 <= byte );
			let deltaLon = ( ( result & ONE ) ? ~ ( result >> ONE ) : ( result >> ONE ) );
			lng += deltaLon;

			if ( is3D ) {
				shift = ZERO;
				result = ZERO;
				do {
					byte = encodedString.charCodeAt ( index ++ ) - NUMBER63;
					result |= ( byte & NUMBER31 ) << shift;
					shift += NUMBER5;
				} while ( NUMBER32 <= byte );
				let deltaEle = ( ( result & ONE ) ? ~ ( result >> ONE ) : ( result >> ONE ) );
				elev += deltaEle;
				coordinates.push ( [ lat / factor, lng / factor, elev / NUMBER100 ] );
			}
			else {
				coordinates.push ( [ lat / factor, lng / factor ] );
			}
		}

		return coordinates;
	}
};

export { polyline };