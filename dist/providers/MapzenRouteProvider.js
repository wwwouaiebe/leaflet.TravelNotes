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
		var _SimplifiedInstructions = 
		{
			fr : [
				"", //kNone = 0;
				"Départ", //kStart = 1;
				"Départ à votre droite", //kStartRight = 2;
				"Départ à votre gauche", //kStartLeft = 3;
				"Arrivée", //kDestination = 4;
				"Arrivée à droite", //kDestinationRight = 5;
				"Arrvée à gauche", //kDestinationLeft = 6;
				"Continuer", //kBecomes = 7;
				"Continuer", //kContinue = 8;
				"Tourner légèrement à droite", //kSlightRight = 9;
				"Tourner  à droite", //kRight = 10;
				"Tourner franchement à droite", //kSharpRight = 11;
				"Demi-tour vers la droite", //kUturnRight = 12;
				"Demi-tour vers la gauche", //kUturnLeft = 13;
				"Tourner franchement à gauche", //kSharpLeft = 14;
				"Tourner à gauche", //kLeft = 15;
				"Tourner légèrement à gauche", //kSlightLeft = 16;
				"Prendre l'entrée en face", //kRampStraight = 17;
				"Prendre l'entrée à droite", //kRampRight = 18;
				"Prendre l'entrée à gauche", //kRampLeft = 19;
				"Prendre la sortie à droite", //kExitRight = 20;
				"Prendre la sortie à gauche", //kExitLeft = 21;
				"Rester au centre", //kStayStraight = 22;
				"Rester à droite", //kStayRight = 23;
				"Rester à gauche", //kStayLeft = 24;
				"Fusionner", //kMerge = 25;
				"Entrer dans le rond-point", //kRoundaboutEnter = 26;
				"Sortir du rond-point", //kRoundaboutExit = 27;
				"Entrer dans le ferry", //kFerryEnter = 28;
				"Sortir du ferry", //kFerryExit = 29;
				"", //kTransit = 30;
				"", //kTransitTransfer = 31;
				"", //kTransitRemainOn = 32;
				"", //kTransitConnectionStart = 33;
				"", //kTransitConnectionTransfer = 34;
				"", //kTransitConnectionDestination = 35;
				"", //kPostTransitConnectionDestination = 36;
			]
		};
		


		var _ParseResponse = function ( requestResponse, route ) {
			
			var userLanguage = 'fr';

			var response = JSON.parse ( requestResponse );	
			
			route.itinerary.itineraryPoints.removeAll ( );
			route.itinerary.maneuvers.removeAll ( );
			
			var itineraryPointsDistance = 0;
			var maneuversDistance = 0;
			response.trip.legs.forEach ( 
				function ( leg ) {
					leg.shape = require ( 'polyline' ).decode ( leg.shape , 6 );
					var itineraryPoints = [];
					for ( var shapePointCounter = 0; shapePointCounter < leg.shape.length; shapePointCounter ++ ) {
						var itineraryPoint = L.travelNotes.interface ( ).itineraryPoint;
						itineraryPoint.latLng = leg.shape [ shapePointCounter ];
						if ( shapePointCounter !== leg.shape.length - 1 ) {
							itineraryPoint.distance = L.latLng ( leg.shape [ shapePointCounter ] ).distanceTo ( L.latLng ( leg.shape [ shapePointCounter + 1 ] ) );
							itineraryPointsDistance += itineraryPoint.distance;
						}
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
							travelNotesManeuver.direction = '---';
							travelNotesManeuver.simplifiedInstruction = _SimplifiedInstructions [ userLanguage ] [ mapzenManeuver.type || 0 ]; 
							travelNotesManeuver.distance = ( mapzenManeuver.length || 0 ) * 1000;
							maneuversDistance += travelNotesManeuver.distance;
							travelNotesManeuver.duration = mapzenManeuver.time || 0;
							travelNotesManeuver.itineraryPointObjId = itineraryPoints [ mapzenManeuver.begin_shape_index ].objId;
							itineraryPoints [ mapzenManeuver.begin_shape_index ] = travelNotesManeuver.objId;
							route.itinerary.maneuvers.add ( travelNotesManeuver );
						}
					);
				}
			);
			var distanceCorrection = maneuversDistance /itineraryPointsDistance;
			var itineraryPointsIterator = route.itinerary.itineraryPoints.iterator;
			while ( ! itineraryPointsIterator.done ) {
				itineraryPointsIterator.value.distance = itineraryPointsIterator.value.distance * distanceCorrection; 
			}
		};
		
		return {
			get icon ( ) { return ''; },
			getUrl : function ( wayPoints, transitMode, providerKey ) {	return '';},
			parseResponse : function ( requestResponse, route ) { _ParseResponse ( requestResponse, route );},
			get name ( ) { return 'mapzen';},
			get transitModes ( ) { return [ 'car', 'bike', 'pedestrian' ]; }
		};
	};
	
	L.travelNotes.interface ( ).addProvider ( getMapzenRouteProvider ( ) );

}());

},{"polyline":1}]},{},[2]);
