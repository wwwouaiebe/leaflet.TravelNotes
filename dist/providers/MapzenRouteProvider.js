(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

function encode(coordinate, factor) {
    coordinate = Math.round(coordinate * factor);
    coordinate <<= 1;
    if (coordinate < 0) {
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
        factor = Math.pow(10, precision || 5);

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

    var factor = Math.pow(10, precision || 5),
        output = encode(coordinates[0][0], factor) + encode(coordinates[0][1], factor);

    for (var i = 1; i < coordinates.length; i++) {
        var a = coordinates[i], b = coordinates[i - 1];
        output += encode(a[0] - b[0], factor);
        output += encode(a[1] - b[1], factor);
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
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

	var getMapzenRouteProvider = function ( ) {
		var _IconList = [
			"kUndefined",//kNone = 0;
			"kDepartDefault",//kStart = 1;
			"kDepartRight",//kStartRight = 2;
			"kDepartLeft",//kStartLeft = 3;
			"kArriveDefault",//kDestination = 4;
			"kArriveRight",//kDestinationRight = 5;
			"kArriveLeft",//kDestinationLeft = 6;
			"kNewNameStraight",//kBecomes = 7;
			"kContinueStraight",//kContinue = 8;
			"kTurnSlightRight",//kSlightRight = 9;
			"kTurnRight",//kRight = 10;
			"kTurnSharpRight",//kSharpRight = 11;
			"kUturnRight",//kUturnRight = 12;
			"kUturnLeft",//kUturnLeft = 13;
			"kTurnSharpLeft",//kSharpLeft = 14;
			"kTurnLeft",//kLeft = 15;
			"kTurnSlightLeft",//kSlightLeft = 16;
			"kUndefined",//kRampStraight = 17;
			"kOnRampRight",//kRampRight = 18;
			"kOnRampLeft",//kRampLeft = 19;
			"kOffRampRight",//kExitRight = 20;
			"kOffRampLeft",//kExitLeft = 21;
			"kStayStraight",//kStayStraight = 22;
			"kStayRight",//kStayRight = 23;
			"kStayLeft",//kStayLeft = 24;
			"kMergeDefault",//kMerge = 25;
			"kRoundaboutRight",//kRoundaboutEnter = 26;
			"kRoundaboutExit",//kRoundaboutExit = 27;
			"kFerryEnter",//kFerryEnter = 28;
			"kFerryExit",//kFerryExit = 29;
			"kUndefined",//kTransit = 30;
			"kUndefined",//kTransitTransfer = 31;
			"kUndefined",//kTransitRemainOn = 32;
			"kUndefined",//kTransitConnectionStart = 33;
			"kUndefined",//kTransitConnectionTransfer = 34;
			"kUndefined",//kTransitConnectionDestination = 35;
			"kUndefined",//kPostTransitConnectionDestination = 36;
		];

		var _ParseResponse = function ( requestResponse, route, userLanguage ) {
			
			var response = null;
			try {
				response = JSON.parse( requestResponse );
			}
			catch ( e ) {
				return false;
			}
			
			if ( 0 === response.trip.legs.length ) {
				return false;
			}

			route.itinerary.itineraryPoints.removeAll ( );
			route.itinerary.maneuvers.removeAll ( );
			
			response.trip.legs.forEach ( 
				function ( leg ) {
					leg.shape = require ( 'polyline' ).decode ( leg.shape , 6 );
					var itineraryPoints = [];
					for ( var shapePointCounter = 0; shapePointCounter < leg.shape.length; shapePointCounter ++ ) {
						var itineraryPoint = L.travelNotes.interface ( ).itineraryPoint;
						itineraryPoint.latLng = leg.shape [ shapePointCounter ];
						itineraryPoints.push ( itineraryPoint );
						route.itinerary.itineraryPoints.add ( itineraryPoint );
					}
					leg.maneuvers.forEach (
						function ( mapzenManeuver ) {
							var travelNotesManeuver = L.travelNotes.interface ( ).maneuver;
							travelNotesManeuver.iconName = _IconList [ mapzenManeuver.type || 0 ];
							travelNotesManeuver.instruction = mapzenManeuver.instruction || '';
							travelNotesManeuver.streetName = '';
							if ( mapzenManeuver.street_names ) {
								mapzenManeuver.street_names.forEach (
									function ( streetName ) {
										travelNotesManeuver.streetName += streetName + ' ';
									}
								);
							}
							travelNotesManeuver.distance = ( mapzenManeuver.length || 0 ) * 1000;
							travelNotesManeuver.duration = mapzenManeuver.time || 0;
							travelNotesManeuver.itineraryPointObjId = itineraryPoints [ mapzenManeuver.begin_shape_index ].objId;
							route.itinerary.maneuvers.add ( travelNotesManeuver );
						}
					);
				}
			);
			
			var wayPointsIterator = route.wayPoints.iterator;
			response.trip.locations.forEach ( 
				function ( location ) {
					if ( ! wayPointsIterator.done ) {
						wayPointsIterator.value.latLng = [ location.lat, location.lon ];
					}
				}
			);
			
			return true;
		};

		var _GetUrl = function ( wayPoints, transitMode, providerKey, userLanguage, options ) {
			
			var request = {};
			request.locations = [];

			var wayPointsIterator = wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
				request.locations.push ( { lat : wayPointsIterator.value.lat, lon : wayPointsIterator.value.lng, type : ( ( wayPointsIterator.first || wayPointsIterator.last ) ? "break" : "through" ) } );
			}
			
			switch ( transitMode ) {
				case 'car':
				request.costing = "auto";
				request.costing_options = { auto: { country_crossing_cost :"60" } };
				break;
				case 'bike':
				request.costing = "bicycle";
				request.costing_options = { bicycle : { maneuver_penalty : 30, bicycle_type : "Cross", cycling_speed : "20.0", use_roads :"0.25", use_hills :"0.25" } };
				break;
				case 'pedestrian': 
				request.costing = "pedestrian";
				request.costing_options = { pedestrian : { walking_speed :"4.0" } };
				break;
				default:
				console.log ( 'invalid transitMode' );
				return;
			}
			request.directions_options = { language : userLanguage };
			
			
			return 'https://valhalla.mapzen.com/route?json=' + JSON.stringify ( request )  + '&api_key=' + providerKey;
		};
		
		return {
			get icon ( ) { return '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'; },
			getUrl : function ( wayPoints, transitMode, providerKey, userLanguage, options ) {	return _GetUrl( wayPoints, transitMode, providerKey, userLanguage, options );},
			parseResponse : function ( requestResponse, route, userLanguage ) { return _ParseResponse ( requestResponse, route, userLanguage );},
			get name ( ) { return 'Mapzen';},
			get transitModes ( ) { return { car : true, bike : true, pedestrian : true}; },
			get providerKeyNeeded ( ) { return true; }
		};
	};
	
	L.travelNotes.interface ( ).addProvider ( getMapzenRouteProvider ( ) );

}());

},{"polyline":1}]},{},[2]);
