(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

/**
 * Based off of [the offical Google document](https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
 *
 * Some parts from [this implementation](http://facstaff.unca.edu/mcmcclur/GoogleMaps/EncodePolyline/PolylineEncoder.js)
 * by [Mark McClure](http://facstaff.unca.edu/mcmcclur/)
 *
 * @module polyline
 */

var polyline = {};

function py2_round(value) {
    // Google's polyline algorithm uses the same rounding strategy as Python 2, which is different from JS for negative values
    return Math.floor(Math.abs(value) + 0.5) * (value >= 0 ? 1 : -1);
}

function encode(current, previous, factor) {
    current = py2_round(current * factor);
    previous = py2_round(previous * factor);
    var coordinate = current - previous;
    coordinate <<= 1;
    if (current - previous < 0) {
        coordinate = ~coordinate;
    }
    var output = '';
    while (coordinate >= 0x20) {
        output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 63);
        coordinate >>= 5;
    }
    output += String.fromCharCode(coordinate + 63);
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
polyline.decode = function(str, precision) {
    var index = 0,
        lat = 0,
        lng = 0,
        coordinates = [],
        shift = 0,
        result = 0,
        byte = null,
        latitude_change,
        longitude_change,
        factor = Math.pow(10, Number.isInteger(precision) ? precision : 5);

    // Coordinates have variable length when encoded, so just keep
    // track of whether we've hit the end of the string. In each
    // loop iteration, a single coordinate is decoded.
    while (index < str.length) {

        // Reset shift, result, and byte
        byte = null;
        shift = 0;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        shift = result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        lat += latitude_change;
        lng += longitude_change;

        coordinates.push([lat / factor, lng / factor]);
    }

    return coordinates;
};

/**
 * Encodes the given [latitude, longitude] coordinates array.
 *
 * @param {Array.<Array.<Number>>} coordinates
 * @param {Number} precision
 * @returns {String}
 */
polyline.encode = function(coordinates, precision) {
    if (!coordinates.length) { return ''; }

    var factor = Math.pow(10, Number.isInteger(precision) ? precision : 5),
        output = encode(coordinates[0][0], 0, factor) + encode(coordinates[0][1], 0, factor);

    for (var i = 1; i < coordinates.length; i++) {
        var a = coordinates[i], b = coordinates[i - 1];
        output += encode(a[0], b[0], factor);
        output += encode(a[1], b[1], factor);
    }

    return output;
};

function flipped(coords) {
    var flipped = [];
    for (var i = 0; i < coords.length; i++) {
        flipped.push(coords[i].slice().reverse());
    }
    return flipped;
}

/**
 * Encodes a GeoJSON LineString feature/geometry.
 *
 * @param {Object} geojson
 * @param {Number} precision
 * @returns {String}
 */
polyline.fromGeoJSON = function(geojson, precision) {
    if (geojson && geojson.type === 'Feature') {
        geojson = geojson.geometry;
    }
    if (!geojson || geojson.type !== 'LineString') {
        throw new Error('Input must be a GeoJSON LineString');
    }
    return polyline.encode(flipped(geojson.coordinates), precision);
};

/**
 * Decodes to a GeoJSON LineString geometry.
 *
 * @param {String} str
 * @param {Number} precision
 * @returns {Object}
 */
polyline.toGeoJSON = function(str, precision) {
    var coords = polyline.decode(str, precision);
    return {
        type: 'LineString',
        coordinates: flipped(coords)
    };
};

if (typeof module === 'object' && module.exports) {
    module.exports = polyline;
}

},{}],2:[function(require,module,exports){
/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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

( function ( ){
	
	'use strict';

	var getGraphHopperRouteProvider = function ( ) {

		var _ProviderKey = '';
		var _UserLanguage = 'fr';
		var _Options;
		var _Route;
		var _Response = '';

		var _NextPromise = 0;
		var _Promises = [];
		var _XMLHttpRequestUrl = '';

		var _IconList = 
		[
			"kUndefined",
			"kTurnSharpLeft", //TURN_SHARP_LEFT = -3
			"kTurnLeft", //TURN_LEFT = -2
			"kTurnSlightLeft", //TURN_SLIGHT_LEFT = -1
			"kContinueStraight", //CONTINUE_ON_STREET = 0
			"kTurnSlightRight", //TURN_SLIGHT_RIGHT = 1
			"kTurnRight", //TURN_RIGHT = 2
			"kTurnSharpRight", //TURN_SHARP_RIGHT = 3
			"kArriveDefault", //FINISH = 4
			"kUndefined", //VIA_REACHED = 5
			"kRoundaboutRight", //USE_ROUNDABOUT = 6
		];

		/*
		--- _ParseResponse function -----------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _ParseResponse = function ( returnOnOk, returnOnError ) {
			
			if ( 0 === _Response.paths.length ) {
				returnOnError ( 'Route not found' );
			}

			_Route.itinerary.itineraryPoints.removeAll ( );
			_Route.itinerary.maneuvers.removeAll ( );
			
			_Response.paths.forEach ( 
				function ( path ) {
					path.points = require ( '@mapbox/polyline' ).decode ( path.points );
					path.snapped_waypoints = require ( '@mapbox/polyline' ).decode ( path.snapped_waypoints );

					var itineraryPoints = [];
					for ( var pointsCounter = 0; pointsCounter < path.points.length; pointsCounter ++ ) {
						var itineraryPoint = L.travelNotes.itineraryPoint;
						itineraryPoint.latLng = path.points [ pointsCounter ];
						itineraryPoints.push ( itineraryPoint );
						_Route.itinerary.itineraryPoints.add ( itineraryPoint );
					}

					path.instructions.forEach (
						function ( instruction) {
							var maneuver = L.travelNotes.maneuver;
							maneuver.iconName = _IconList [ instruction.sign + 4 || 0]  ;
							maneuver.instruction = instruction.text || '';
							maneuver.duration = instruction.time / 1000;
							maneuver.distance = instruction.distance;
							/*maneuversDistance += maneuver.distance;*/
							maneuver.itineraryPointObjId = itineraryPoints [ instruction.interval [ 0 ] ].objId;
							_Route.itinerary.maneuvers.add ( maneuver );							
						}
					);

					var wayPointsIterator = _Route.wayPoints.iterator;
					path.snapped_waypoints.forEach ( 
						function ( location ) {
							if ( ! wayPointsIterator.done ) {
								wayPointsIterator.value.latLng = location;
							}
						}
					);
				}
			);
			
			returnOnOk ( '' );
		};
		
		/*
		--- End of _ParseResponse function ---
		*/

		/*
		--- _GetUrl function ------------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetUrl = function ( ) {
			
			var wayPointsToString = function ( wayPoint, result )  {
				if ( null === result ) {
					result = '';
				}
				else {
					result += '&'; 
				}	
				result += 'point=' + wayPoint.lat.toFixed ( 6 ) + ',' + wayPoint.lng.toFixed ( 6 ) ;
				return result;
			};
			var wayPointsString = _Route.wayPoints.forEach ( wayPointsToString );
			
			var vehicle = '';
			switch ( _Route.itinerary.transitMode ) {
				case 'bike':
				{
					vehicle = 'bike';
					break;
				}
				case 'pedestrian':
				{
					vehicle = 'foot';
					break;
				}
				case 'car':
				{
					vehicle = 'car';
					break;
				}
			}
			
			return 'https://graphhopper.com/api/1/route?' + wayPointsString +
				 '&instructions=true&type=json&key=' + _ProviderKey + '&locale=' + _UserLanguage +
				 '&vehicle=' + vehicle;
		};
		
		/*
		--- End of _GetUrl function ---
		*/

		/*
		--- _StartXMLHttpRequest function -----------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _StartXMLHttpRequest = function ( returnOnOk, returnOnError ) {
			
			var xmlHttpRequest = new XMLHttpRequest ( );
			xmlHttpRequest.timeout = 5000;
			
			xmlHttpRequest.ontimeout = function ( event ) {
				returnOnError ( 'TimeOut error' );
			};
			
			xmlHttpRequest.onreadystatechange = function ( ) {
				if ( xmlHttpRequest.readyState === 4 ) {
					if ( xmlHttpRequest.status === 200 ) {
						try {
							_Response = JSON.parse ( xmlHttpRequest.responseText );
						}
						catch ( e ) {
							returnOnError ( 'JSON parsing error' );
						}
						returnOnOk ( new Promise ( _Promises [ _NextPromise ++ ] ) );
					}
					else {
						returnOnError ( 'Status : ' + this.status + ' statusText : ' + this.statusText );
					}
				}
			};
			
			xmlHttpRequest.open ( "GET", _XMLHttpRequestUrl, true );
			xmlHttpRequest.overrideMimeType ( 'application/json' );
			xmlHttpRequest.send ( null );
			
		};

		/*
		--- End of _StartXMLHttpRequest function ---
		*/

		/*
		--- _GetPromiseRoute function ---------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetPromiseRoute = function ( route, options ) {
			_Route = route;
			_Options = options;
			_Response = '';
			
			_XMLHttpRequestUrl = _GetUrl ( );
			
			_NextPromise = 0;
			_Promises = [];
			
			_Promises.push ( _StartXMLHttpRequest );
			_Promises.push ( _ParseResponse );
			
			return new Promise ( _Promises [ _NextPromise ++ ] );
		};
		
		/*
		--- End of _GetPromiseRoute function ---
		*/

		return {
			
			getPromiseRoute : function ( route, options ) {
				return _GetPromiseRoute ( route, options );
			},
			get icon ( ) {
				return 'iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAIAAAC0Ujn1AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AocDyYTxtPEYwAABGtJREFUSMedVU1MXFUUPue+9+bNAMMUZrCFVAsiDEGpJlpdtCY0sTU1xIA1QNSNIcYGuyAuxBp1oU1DYu2iNlKsJopVYy2lkpiyoCCptLWF1DKFkpb/YShvmBmYX97/dUECw5sBpj2r97577pdzv3vud/BLzw8XF3s5ZGG9QAQA0CggAEGgFDYLRVffsu/HUlcNAyQ5J0NApzGXXxwLKvNLhCNcbrqlNJvfYaWavjE7hyzLIUuTFYIskd2RByduRfu9im9pBed3ZG79oCzr9QKqrMtOgXLIrquDOBqcONQjeyIGXJoKTX/URyUtu6aIStoGhZOk4mpBeeL97kTelXB/dj3QPoYseThq5HD6yFV5Npq4xMadcvZof8zlRwZTpUYTE7w0Fb4ya8CLi4vb2toGBgZ6enpqa2sBQAvLvtYRLaauR52gNaW+s/cMWGFhYUdHh9PpXP4tLy/Pz89vamqSugXze7r8JJMCNcGl4YDkDq/BCGloaHA6nVPy3GnvhZvRYQdrq/n0QFrzqVgw8sQV03gh6lTfRBBEEO8F1YAYD9rt9sP1hyflB4cmm9oDPYLsd8XGjkyfsrxgB4DB367tztipUHUTaqqDNBMxNGxlZSUQOOO96JG9PDERJCwyZjSpqAPAqGd898xTKtE2o1Z1bUE0ZFRUVLiptz96FyC+GVAcCy5/3fnr5nO2Ei1BE2K4w8Q3VlJSMhpzT8tzGHclakCUJkLLf5c6O19z7EnUhBhMg8ngDBnhaOSuOBlvBsTC+n9d7aKhoaFnYAcibkjNoml7BqzNOd92PsyKqzsJKt6Y7+eRlQRZlsNTC9t4OwW6vtYULE9ncw5LPPj18eOuvluEEkAABH1Jnfn8XzUsx+f4Zrx55hy6UV/rNG2nw7onN9A+vmq+kvLLmydyDjotpVm6rC92TkWuzxnOHvWHHivNAqDxV218jVSneY3PZ4+yo664N7lE58+ObOT9MdnGWuka5kR70qmeTvb9/u6B8lch5WCBSSPmzTwEgAWmV/3vWPsnb5w72NxyWhAERVEopQzD8DwviqIgCIYtNmtmAOQU/BqARebY7I+Z7xQODAy4+m/3Xv67u6v7Wt9V1+3B6urqxPxtubmJNoLP3nk76QBbHkIFfN5e264XM0rzTA4GiFvwvOJ8ORQJGZIDiwsnY21/+LoYJMt704h53QGGgCrV7ovu+6L7O+HC8rQUml2JvEVFRVm2LYvBEKYiSLKZgap/Sfh2MHGlvr4+CpJXCcDaB5kqNTEznqP9VDVKl5OTU1dXJ8i+McnziFVTSdtaXwZ5vAFvaWmxWq03wsMLagjhkaqmGiX56Sdv/PTxh422TBvP8w6Ho7W1taqqSqHKGV+7CblUOyRpZLOZXxU3lGkF8x5he/7jAKBQ9YvZ78/5u8yEj++uNGLGUlcNC0yK1DpQC5r2btm13/ZSHueYleb/XOi9HOpnkVnbuGBCBhvd33Qs/MMhAw8TPHIssirVJConsRSq1tr3/Q+O4QqEHeMWIQAAAABJRU5ErkJggg==';
			},
			get name ( ) { return 'GraphHopper';},
			get transitModes ( ) { return { car : true, bike : true, pedestrian : true, train : false } ; },
			get providerKeyNeeded ( ) { return true; },

			get providerKey ( ) { return _ProviderKey.length; },
			set providerKey ( ProviderKey ) { if ( '' === _ProviderKey ) { _ProviderKey = ProviderKey;}},
			
			get userLanguage ( ) { return _UserLanguage; },
			set userLanguage ( UserLanguage ) { _UserLanguage = UserLanguage; }

		};
	};
	
	L.travelNotes.addProvider ( getGraphHopperRouteProvider ( ) );

}());

},{"@mapbox/polyline":1}]},{},[2]);
