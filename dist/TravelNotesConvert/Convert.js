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

/*
--- srcConvert.js file ------------------------------------------------------------------------------------------------

Quick and dirty convert tool for files created with the old maps (versions < 2.0.0 )

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	var getTravel = function ( ) {
		return {
			name : "",
			routes : [ ],
			notes : [ ],
			userData : { },
			objId : -1,
			objType : { name :"Travel", version : "1.0.0" }
		};
	};

	var getRoute = function ( ) {
		return {
			name : "",
			wayPoints : [ ],
			notes: [ ],
			itinerary : 
			{
				itineraryPoints : {},
				maneuvers: [ ],
				provider:"",
				transitMode : "bike",
				objId: -1,
				objType : { name : "Itinerary", version: "1.0.0" }
			},
			width : 3,
			color : "#ff0000",
			chain : false,
			distance : 0,
			duration : 0,
			chainedDistance : 0,
			objId : -1,
			objType : { name : "Route", version : "1.0.0" }
		};
	};

	var getNote = function ( ) {
		return {
			iconHeight : 40,
			iconWidth : 40,
			iconContent : "",
			popupContent : "",
			tooltipContent : "",
			phone : "",
			url : "",
			address : "",
			iconLat : 0,
			iconLng : 0,
			lat : 0,
			lng : 0,
			distance : -1,
			chainedDistance : 0,
			objId : -1,
			objType : { name : "Note", version : "1.0.0" }
		};
	};

	var getWayPoint = function ( ) {
		return {
			name : "",
			lat : 0,
			lng : 0,
			objId : -1,
			objType : { name : "WayPoint", version :"1.0.0" }
		};
	};

	var getItineraryPoints = function ( ) {
		return {
			latLngs : "",
			distances : [],
			objIds : [],
			objType : {"name":"ItineraryPoint","version":"1.0.0"}
		};
	};
	
	window.convertMapsData = {};

	window.convertMapsData.mapsDataToTravelNotes = function ( data) {
		var mapsData = JSON.parse ( data );
		var newTravel = getTravel ( );
		if ( mapsData.polylines ) {
			mapsData.polylines.forEach ( 
				function ( polyline ) {
					var newRoute = getRoute ( );
					newRoute.width = polyline.options.weight;
					newRoute.color = polyline.options.color;
					newRoute.name = polyline.name;
					if ( mapsData.routingEngine && mapsData.routingEngine.wayPoints ) {
						mapsData.routingEngine.wayPoints.forEach ( 
							function ( wayPoint ) {
								// sometime waypoint is null :-( ...
								if ( wayPoint ) {
									var newWayPoint = getWayPoint ( );
									newWayPoint.lat = wayPoint.lat;
									newWayPoint.lng = wayPoint.lng;	
									newRoute.wayPoints.push ( newWayPoint );
								}
							}
						);
					}
					if ( polyline.pnts ) {
						var newItineraryPoints = getItineraryPoints ( );
						var points = require ( 'polyline' ).decode ( polyline.pnts , polyline.precision || 5 );
						newItineraryPoints.latLngs = require ( 'polyline' ).encode ( points , 6 );
						points.forEach ( 
							function ( ) {
								newItineraryPoints.distances.push ( 0 );
								newItineraryPoints.objIds.push ( -1 );
							}
						);
						newRoute.itinerary.itineraryPoints = newItineraryPoints;
					}
					newTravel.routes.push ( newRoute );
				}
			);
		}
		if ( mapsData.pins ) {
			mapsData.pins.forEach ( 
				function ( pin ) {
					var newNote = getNote ( );
					if ( pin.options.text ) {
						newNote.popupContent = pin.options.text;
					}
					if ( pin.options.address ) {
						newNote.address = pin.options.address;
					}
					if ( pin.options.url ) {
						newNote.url = pin.options.url;
					}
					if ( pin.options.phone ) {
						newNote.phone = pin.options.phone;
					}
					newNote.lat = pin.latLng.lat;
					newNote.lng = pin.latLng.lng;
					newNote.iconLat = pin.latLng.lat;
					newNote.iconLng = pin.latLng.lng;
					newNote.iconContent = "<div class='TravelNotes-MapNote TravelNotes-MapNoteCategory-00" + pin.options.pinCategoryId + "'></div>";
					newTravel.notes.push ( newNote );
				}
			);
		}
		if ( mapsData.map && mapsData.map.layerId ) {
			newTravel.userData = {};
			newTravel.userData.layerId = mapsData.map.layerId;
		}
		return JSON.stringify ( newTravel );
	};
} ) ( );

},{"polyline":1}]},{},[2]);
