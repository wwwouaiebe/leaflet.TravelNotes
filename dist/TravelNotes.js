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

/*
--- RouteEditor.js file -------------------------------------------------------------------------------------------------
This file contains:
	- the RouteEditor object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #28 : Disable "select this point as start point " and "select this point as end point" when a start point or end point is already present
		- Issue #30 : Add a context menu with delete command to the waypoints
		- Issue #33 : Add a command to hide a route
		- Issue #34 : Add a command to show all routes
	- v1.3.0:
		- added cutRoute method (not tested...)
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- modified getClosestLatLngDistance to avoid crash on empty routes
		- fixed issue #45
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var g_TravelNotesData = require ( '../L.TravelNotes' );
	
	var s_ZoomToRoute = false;

		
	/*
	--- routeEditor function ------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var routeEditor = function ( ) {
		
		var m_DataSearchEngine  = require ( '../Data/DataSearchEngine' ) ( );
		var m_Translator = require ( '../UI/Translator' ) ( );
		var m_NoteEditor = require ( '../core/NoteEditor' ) ( );
		var m_MapEditor = require ( '../core/MapEditor' ) ( );
		var m_RouteEditorUI = require ( '../UI/RouteEditorUI' ) ( );

		/*
		--- m_CutRoute function ---------------------------------------------------------------------------------------

		This function cut a route at a given point
		Warning: not tested, not used!!!
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CutRoute = function ( route, latLng ) {

			// an array is created with 2 clones of the route
			var routes = [ require ( '../data/Route' ) ( ), require ( '../data/Route' ) ( ) ];
			routes [ 0 ].object = route.object;
			routes [ 1 ].object = route.object;
			
			// and the itineraryPoints are removed
			routes [ 0 ].itinerary.itineraryPoints.removeAll ( );
			routes [ 1 ].itinerary.itineraryPoints.removeAll ( );
			
			// the distance between the origin and the cutting point is computed
			var cuttingPointLatLngDistance = m_GetClosestLatLngDistance ( route, latLng );

			// iteration on the itineraryPoints
			var itineraryPointIterator = route.itinerary.itineraryPoints.iterator;
			var iterationDistance = 0;
			var itineraryPoint;
			var previousItineraryPoint = null;
			
			var routeCounter = 0;
			while ( ! itineraryPointIterator.done ) {
				itineraryPoint = require ( '../data/ItineraryPoint' ) ( );
				itineraryPoint.object = itineraryPointIterator.value.object;
				if ( 0 === routeCounter && 0 != iterationDistance && iterationDistance > cuttingPointLatLngDistance.distance ) {
					// we have passed the cutting point...
					var removedDistance = L.latLng ( cuttingPointLatLngDistance.latLng ).distanceTo ( L.latLng ( itineraryPointIterator.value.latLng ) );
					// a new point is created at the cutting point position and added to the first route.
					var cuttingPoint = require ( '../data/ItineraryPoint' ) ( );
					cuttingPoint.latLng = cuttingPointLatLngDistance.latLng;
					routes [ 0 ].itinerary.itineraryPoints.add ( cuttingPoint );
					routes [ 0 ].distance = iterationDistance - removedDistance;
					if ( previousItineraryPoint ) {
						previousItineraryPoint.distance -= removedDistance;
					}

					routeCounter = 1;
					
					// a new point is created at the cutting point position and added to the second route.
					cuttingPoint = require ( '../data/ItineraryPoint' ) ( );
					cuttingPoint.latLng = cuttingPointLatLngDistance.latLng;
					cuttingPoint.distance = removedDistance;
					routes [ 1 ].itinerary.itineraryPoints.add ( cuttingPoint );
					iterationDistance = removedDistance;
				}
				routes [ routeCounter ].itinerary.itineraryPoints.add ( itineraryPoint );
				iterationDistance +=itineraryPointIterator.value.distance;
				previousItineraryPoint = itineraryPoint;
			}
			routes [ routeCounter ].distance = iterationDistance;

			return routes;
		};

		/*
		--- m_ComputeRouteDistances function -----------------------------------------------------------------------

		This function compute the route, itineraryPoints and maneuvers distances
		
		parameters:
		- route : the TravelNotes route object to be used

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ComputeRouteDistances = function ( route ) {
			// Computing the distance between itineraryPoints
			var itineraryPointsIterator = route.itinerary.itineraryPoints.iterator;
			var maneuverIterator = route.itinerary.maneuvers.iterator;
			var dummy = itineraryPointsIterator.done;
			dummy = maneuverIterator.done;
			var previousItineraryPoint = itineraryPointsIterator.value;
			var previousManeuver = maneuverIterator.value;
			previousManeuver.distance = 0;
			dummy = maneuverIterator.done;
			route.distance = 0;
			route.duration = 0;
			while ( ! itineraryPointsIterator.done ) {
				previousItineraryPoint.distance = L.latLng ( previousItineraryPoint.latLng ).distanceTo ( L.latLng ( itineraryPointsIterator.value.latLng ));
				if (  maneuverIterator.value.itineraryPointObjId === itineraryPointsIterator.value.objId ) {
					route.duration += previousManeuver.duration;
					previousManeuver =  maneuverIterator.value;
					maneuverIterator.value.distance = 0;
					dummy = maneuverIterator.done;
				}
				route.distance += previousItineraryPoint.distance;
				previousManeuver.distance += previousItineraryPoint.distance;
				previousItineraryPoint = itineraryPointsIterator.value;
			}
		};

		/*
		--- m_GetClosestLatLngDistance function -----------------------------------------------------------------------

		This function search the nearest point on a route from a given point and compute the distance
		between the beginning of the route and the nearest point
		
		parameters:
		- route : the TravelNotes route object to be used
		- latLng : the coordinates of the point

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetClosestLatLngDistance = function ( route, latLng ) {
			
			if ( 0 === route.itinerary.itineraryPoints.length ) {
				return null;
			}
			// an iterator on the route points is created...
			var itineraryPointIterator = route.itinerary.itineraryPoints.iterator;
			// ... and placed on the first point
			var dummy = itineraryPointIterator.done;
			// the smallest distance is initialized ...
			var minDistance = Number.MAX_VALUE;
			// projections of points are made
			var point = L.Projection.SphericalMercator.project ( L.latLng ( latLng [ 0 ], latLng [ 1 ] ) );
			var point1 = L.Projection.SphericalMercator.project ( L.latLng ( itineraryPointIterator.value.lat, itineraryPointIterator.value.lng ) );
			// variables initialization
			var closestLatLng = null;
			var closestDistance = 0;
			var endSegmentDistance = itineraryPointIterator.value.distance;
			// iteration on the route points
			while ( ! itineraryPointIterator.done ) {
				// projection of the second point...
				var point2 = L.Projection.SphericalMercator.project ( L.latLng ( itineraryPointIterator.value.lat, itineraryPointIterator.value.lng ) );
				// and distance is computed
				var distance = L.LineUtil.pointToSegmentDistance ( point, point1, point2 );
				if ( distance < minDistance )
				{
					// we have found the smallest distance ... till now :-)
					minDistance = distance;
					// the nearest point is computed
					closestLatLng = L.Projection.SphericalMercator.unproject ( L.LineUtil.closestPointOnSegment ( point, point1, point2 ) );
					// and the distance also
					closestDistance = endSegmentDistance - closestLatLng.distanceTo ( L.latLng ( itineraryPointIterator.value.lat, itineraryPointIterator.value.lng ) );
				}
				// we prepare the iteration for the next point...
				endSegmentDistance += itineraryPointIterator.value.distance;
				point1 = point2;
			}
			
			return { latLng : [ closestLatLng.lat, closestLatLng.lng ], distance : closestDistance };
		};
	
		/*
		--- m_SaveGpx function ----------------------------------------------------------------------------------------

		This function save the currently edited route to a GPX file
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SaveGpx = function ( ) {
			// initializations...
			var tab0 = "\n";
			var tab1 = "\n\t";
			var tab2 = "\n\t\t";
			var tab3 = "\n\t\t\t";
			var timeStamp = "time='" + new Date ( ).toISOString ( ) + "' ";
			
			// header
			var gpxString = "<?xml version='1.0'?>" + tab0;
			gpxString += "<gpx xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xsi:schemaLocation='http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd' version='1.1' creator='leaflet.TravelNotes'>";

			// waypoints
			var wayPointsIterator = g_TravelNotesData.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done )
			{
				gpxString += 
					tab1 + "<wpt lat='" + wayPointsIterator.value.lat + "' lon='" + wayPointsIterator.value.lng + "' " +
					timeStamp + "/>";
				
			}
			
			// route
			gpxString += tab1 + "<rte>";
			var maneuverIterator = g_TravelNotesData.editedRoute.itinerary.maneuvers.iterator;
			while ( ! maneuverIterator.done ) {
				var wayPoint = g_TravelNotesData.editedRoute.itinerary.itineraryPoints.getAt ( maneuverIterator.value.itineraryPointObjId );
				var instruction = maneuverIterator.value.instruction.replace ( '&', '&amp;' ).replace ( '\'', '&apos;' ).replace ('\"', '&quote;').replace ( '>', '&gt;' ).replace ( '<', '&lt;');
				gpxString +=
					tab2 + "<rtept lat='" + wayPoint.lat + "' lon='" + wayPoint.lng +"' " + timeStamp + "desc='" + instruction + "' />" ;
			}
			gpxString += tab1 + "</rte>";
			
			// track
			gpxString += tab1 + "<trk>";
			gpxString += tab2 + "<trkseg>";
			var itineraryPointsIterator = g_TravelNotesData.editedRoute.itinerary.itineraryPoints.iterator;
			while ( ! itineraryPointsIterator.done ) {
				gpxString +=
					tab3 + "<trkpt lat='" + itineraryPointsIterator.value.lat + "' lon='" + itineraryPointsIterator.value.lng + "' " + timeStamp + " />";
			}
			gpxString += tab2 + "</trkseg>";				
			gpxString += tab1 + "</trk>";
			
			// eof
			gpxString += tab0 + "</gpx>";
			
			// file is saved
			var fileName = g_TravelNotesData.editedRoute.name;
			if ( '' === fileName ) {
				fileName = 'TravelNote';
			}
			fileName += '.gpx';
			require ( '../util/Utilities' ) ( ).saveFile ( fileName, gpxString );
		};
		
		/*
		--- m_GetRouteHTML function -----------------------------------------------------------------------------------

		This function returns an HTML string with the route contents. This string will be used in the
		route popup and on the roadbook page
		
		parameters:
		- route : the TravelNotes route object
		- classNamePrefix : a string that will be added to all the HTML classes

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetRouteHTML = function ( route, classNamePrefix ) {
			
			var utilities = require ( '../util/Utilities' ) ( );

			var returnValue = '<div class="' + classNamePrefix + 'Route-Header-Name">' +
				route.name + 
				'</div>';
			if (0 !== route.distance ) {
				returnValue += '<div class="' + classNamePrefix + 'Route-Header-Distance">' +
					m_Translator.getText ( 'RouteEditor - Distance', { distance : utilities.formatDistance ( route.distance ) } ) + '</div>' +
					'<div class="' + classNamePrefix + 'Route-Header-Duration">' +
					m_Translator.getText ( 'RouteEditor - Duration', { duration : utilities.formatTime ( route.duration ) } ) + '</div>';
			}
			
			return returnValue;
		};
			
		/*
		--- m_ChainRoutes function ------------------------------------------------------------------------------------

		This function recompute the distances when routes are chained
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ChainRoutes = function ( ) {
			var routesIterator = g_TravelNotesData.travel.routes.iterator;
			var chainedDistance = 0;
			while ( ! routesIterator.done ) {
				if ( routesIterator.value.chain ) {
					routesIterator.value.chainedDistance = chainedDistance;
					chainedDistance += routesIterator.value.distance;
				}
				else {
					routesIterator.value.chainedDistance = 0;
				}
				var notesIterator = routesIterator.value.notes.iterator;
				while (! notesIterator.done ) {
					notesIterator.value.chainedDistance = routesIterator.value.chainedDistance;
				}
			}
		};
			
		/*
		--- m_StartRouting function -----------------------------------------------------------------------------------

		This function start the router
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_StartRouting = function ( ) {
			if ( ! g_TravelNotesData.config.routing.auto ) {
				return;
			}
			s_ZoomToRoute = 0 === g_TravelNotesData.editedRoute.itinerary.itineraryPoints.length;
			require ( '../core/Router' ) ( ).startRouting ( g_TravelNotesData.editedRoute );
		};
			
			
		/*
		--- m_EndRouting function -------------------------------------------------------------------------------------

		This function is called by the router when a routing operation is successfully finished
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_EndRouting = function ( ) {
			// the previous route is removed from the leaflet map
			m_MapEditor.removeRoute ( g_TravelNotesData.editedRoute, true, true );
			
			// the position of the notes linked to the route is recomputed
			var notesIterator = g_TravelNotesData.editedRoute.notes.iterator;
			while ( ! notesIterator.done ) {
				var latLngDistance = m_GetClosestLatLngDistance ( g_TravelNotesData.editedRoute, notesIterator.value.latLng );
				notesIterator.value.latLng = latLngDistance.latLng;
				notesIterator.value.distance = latLngDistance.distance;
			}
			
			// and the notes sorted
			g_TravelNotesData.editedRoute.notes.sort ( function ( a, b ) { return a.distance - b.distance; } );
			
			// the new route is added to the map
			m_MapEditor.addRoute ( g_TravelNotesData.editedRoute, true, true );
			if ( s_ZoomToRoute ) {
				m_MapEditor.zoomToRoute ( g_TravelNotesData.editedRoute.objId );
			}
			
			// and the itinerary and waypoints are displayed
			require ( '../UI/DataPanesUI' ) ( ).setItinerary ( );
			m_RouteEditorUI.setWayPointsList ( );
			
			// the HTML page is adapted ( depending of the config.... )
			m_ChainRoutes ( );
			require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
		};

		/*
		--- m_SaveEdition function ------------------------------------------------------------------------------------

		This function save the current edited route
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SaveEdition = function ( ) {
			// the edited route is cloned
			var clonedRoute = require ( '../data/Route' ) ( );
			clonedRoute.object = g_TravelNotesData.editedRoute.object;
			// and the initial route replaced with the clone
			g_TravelNotesData.travel.routes.replace ( g_TravelNotesData.routeEdition.routeInitialObjId, clonedRoute );
			g_TravelNotesData.routeEdition.routeInitialObjId = clonedRoute.objId;
			m_CancelEdition ( );
		};
			
		/*
		--- m_CancelEdition function ----------------------------------------------------------------------------------

		This function cancel the current edited route
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CancelEdition = function ( ) {
			m_MapEditor.removeRoute ( g_TravelNotesData.editedRoute, true, true );
			if ( -1 !== g_TravelNotesData.routeEdition.routeInitialObjId ) {
				m_MapEditor.addRoute ( m_DataSearchEngine.getRoute ( g_TravelNotesData.routeEdition.routeInitialObjId ), true, false );
			}

			g_TravelNotesData.editedRoute = require ( '../data/Route' ) ( );
			g_TravelNotesData.routeEdition.routeChanged = false;
			g_TravelNotesData.routeEdition.routeInitialObjId = -1;
			require ( '../UI/TravelEditorUI' ) ( ).setRoutesList ( );
			m_RouteEditorUI.setWayPointsList ( );
			m_RouteEditorUI .reduce ( );
			require ( '../UI/DataPanesUI' ) ( ).setItinerary ( );
			m_ChainRoutes ( );
			require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
		};
		
		/*
		--- m_RouteProperties function --------------------------------------------------------------------------------

		This function opens the RouteProperties dialog
		
		parameters:
		- routeObjId : 

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_RouteProperties = function ( routeObjId ) {
			var route = m_DataSearchEngine.getRoute ( routeObjId );
			require ( '../UI/RoutePropertiesDialog' ) ( route );
		};
			
		/*
		--- m_HideRoute function --------------------------------------------------------------------------------------

		This function hide a route on the map
		
		parameters:
		- routeObjId : the route objId that was clicked

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_HideRoute = function ( routeObjId ) {
			var route = m_DataSearchEngine.getRoute ( routeObjId );
			if ( route ) {
				m_MapEditor.removeRoute ( route, true, true );
				route.hidden = true;
			}
		};
			
		/*
		--- m_ShowRoutes function -------------------------------------------------------------------------------------

		This function show all the hidden routes
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ShowRoutes = function ( ) {
			var routesIterator = g_TravelNotesData.travel.routes.iterator;
			while ( ! routesIterator.done ) {
				if ( routesIterator.value.hidden ) {
					m_MapEditor.addRoute ( routesIterator.value, true, true, false );
				}
			}
		};

		/*
		--- routeEditor object ----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{
				
				cutRoute : function ( route, latLng ) { return m_CutRoute ( route, latLng ); },
				
				computeRouteDistances : function ( route ) { m_ComputeRouteDistances ( route ); },

				getClosestLatLngDistance : function ( route, latLng ) { return m_GetClosestLatLngDistance ( route, latLng ); },

				saveGpx : function ( ) { m_SaveGpx ( ); },
				
				getRouteHTML : function ( route, classNamePrefix ) { return m_GetRouteHTML ( route, classNamePrefix ); },

				chainRoutes : function ( ) { m_ChainRoutes ( ); },
				
				startRouting : function ( ) { m_StartRouting ( ); },
				
				endRouting : function ( ) { m_EndRouting ( ); },

				saveEdition : function ( ) { m_SaveEdition ( ); },
				
				cancelEdition : function ( ) { m_CancelEdition ( ); },
				
				routeProperties : function ( routeObjId ) { m_RouteProperties ( routeObjId ); },
			
				hideRoute : function ( routeObjId ) { m_HideRoute ( routeObjId ); },

				showRoutes : function ( ) { m_ShowRoutes ( ); },
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = routeEditor;
	}

}());

/*
--- End of RouteEditor.js file ----------------------------------------------------------------------------------------
*/
},{"../Data/DataSearchEngine":3,"../L.TravelNotes":8,"../UI/DataPanesUI":14,"../UI/RouteEditorUI":22,"../UI/RoutePropertiesDialog":23,"../UI/Translator":26,"../UI/TravelEditorUI":27,"../core/MapEditor":34,"../core/NoteEditor":35,"../core/Router":38,"../core/TravelEditor":40,"../data/ItineraryPoint":47,"../data/Route":52,"../util/Utilities":58}],3:[function(require,module,exports){
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

/*
--- DataSearchEngine.js file ------------------------------------------------------------------------------------------
This file contains:
	- the DataSearchEngine object
	- the module.exports implementation
Changes:
	- v1.4.0:
		- created from DataManager
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';
	
	var dataSearchEngine = function ( ) {

		var g_TravelNotesData = require ( '../L.TravelNotes' );
		
		/*
		--- m_getRoute function ---------------------------------------------------------------------------------------

		This function returns a route when giving the routeObjId
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetRoute = function ( routeObjId ) {
			var route = null;
			route = g_TravelNotesData.travel.routes.getAt ( routeObjId );
			if ( ! route ) {
				if ( routeObjId === g_TravelNotesData.editedRoute.objId ) {
					route = g_TravelNotesData.editedRoute;
				}
			}
			if ( ! route ) {
				console.log ( 'Invalid noteObjId ' + routeObjId + ' for function DataSearchEngine.getRoute ( )' );
			}

			return route;
		};

		/*
		--- m_GetNoteAndRoute method ----------------------------------------------------------------------------------

		This function returns a note and a route ( when the note is linked to a route ) from the noteObjId
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetNoteAndRoute = function ( noteObjId ) {
			var note = null;
			note = g_TravelNotesData.travel.notes.getAt ( noteObjId );
			if ( note ) {
				return { note : note, route : null };
			}
			var routeIterator = g_TravelNotesData.travel.routes.iterator;
			while ( ! routeIterator.done ) {
				note = routeIterator.value.notes.getAt ( noteObjId );
				if ( note ) {
					return { note : note, route : routeIterator.value };
				}
			}
			note = g_TravelNotesData.editedRoute.notes.getAt ( noteObjId );
			if ( ! note ) {
				console.log ( 'Invalid noteObjId ' + noteObjId + ' for function DataSearchEngine.getNote ( )' );
				return { note : null, route : null };
			}

			return { note : note, route : g_TravelNotesData.editedRoute };
		};
		
		/*
		--- m_GetWayPoint method --------------------------------------------------------------------------------------

		This function returns a wayPoint from the wayPointObjId
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetWayPoint = function ( wayPointObjId ) {
			var wayPoint = null;
			var routeIterator = g_TravelNotesData.travel.routes.iterator;
			while ( ! routeIterator.done ) {
				wayPoint = routeIterator.value.wayPoints.getAt ( wayPointObjId );
				if ( wayPoint ) {
					return wayPoint;
				}
			}
			wayPoint = g_TravelNotesData.editedRoute.wayPoints.getAt ( wayPointObjId );
			if ( ! wayPoint ) {
				console.log ( 'Invalid wayPointObjId ' + wayPointObjId + ' for function DataSearchEngine.getWayPoint ( )' );
				return null;
			}
			return wayPoint;
		};

		/* 
		--- dataSearchEngine object -----------------------------------------------------------------------------------
		
		---------------------------------------------------------------------------------------------------------------
		*/
		
		return Object.seal ( 
			{
				getRoute : function ( routeObjId ) { return m_GetRoute ( routeObjId ); },
				getNoteAndRoute : function ( noteObjId ) { return m_GetNoteAndRoute ( noteObjId ); },
				getWayPoint : function ( wayPointObjId ) { return m_GetWayPoint ( wayPointObjId ); }
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = dataSearchEngine;
	}

} ) ( );

/*
--- End of DataSearchEngine.js file -----------------------------------------------------------------------------------
*/
},{"../L.TravelNotes":8}],4:[function(require,module,exports){
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

/*
--- Itinerary.js file -------------------------------------------------------------------------------------------------
This file contains:
	- the Itinerary object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	var s_ObjType = require ( '../data/ObjType' ) ( 'Itinerary', require ( './Version' ) );

	/*
	--- itinerary function --------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var itinerary = function ( ) {

		// Private variables

		var m_Provider = '';

		var m_TransitMode = '';

		var m_ItineraryPoints = require ( '../data/Collection' ) ( 'ItineraryPoint' );

		var m_Maneuvers = require ( '../data/Collection' ) ( 'Maneuver' );

		var m_ObjId = require ( '../data/ObjId' ) ( );

		/*
		--- m_GetObject function --------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetObject = function ( ) {
			return {
				itineraryPoints : m_ItineraryPoints.object,
				maneuvers : m_Maneuvers.object,
				provider : m_Provider,
				transitMode : m_TransitMode,
				objId : m_ObjId,
				objType : s_ObjType.object
			};
		};
		
		/*
		--- m_SetObject function --------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SetObject = function ( something ) {
			something = s_ObjType.validate ( something );
			m_ItineraryPoints.object = something.itineraryPoints || [];
			m_Maneuvers.object = something.maneuvers || [];
			m_Provider = something.provider || '';
			m_TransitMode = something.transitMode || '';
			m_ObjId = require ( '../data/ObjId' ) ( );
			
			// rebuilding links between maneuvers and itineraryPoints
			var itineraryPointObjIdMap = new Map ( );
			var sourceCounter = 0;
			var targetIterator = m_ItineraryPoints.iterator;
			while ( ! targetIterator.done ) {
				itineraryPointObjIdMap.set ( something.itineraryPoints [ sourceCounter ].objId, targetIterator.value.objId );
				sourceCounter ++;
			}
			var maneuverIterator = m_Maneuvers.iterator;
			while ( ! maneuverIterator.done ) {
				maneuverIterator.value.itineraryPointObjId = itineraryPointObjIdMap.get ( maneuverIterator.value.itineraryPointObjId );
			}
		};
		
		/*
		--- itinerary object ------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/
		
		return Object.seal (
			{

				get itineraryPoints ( ) { return m_ItineraryPoints; },

				get maneuvers ( ) { return m_Maneuvers; },

				get provider ( ) { return m_Provider; },
				set provider ( Provider ) { m_Provider = Provider; },

				get transitMode ( ) { return m_TransitMode; },
				set transitMode ( TransitMode ) { m_TransitMode = TransitMode; },

				get objId ( ) { return m_ObjId; },

				get objType ( ) { return s_ObjType; },

				get object ( ) { return m_GetObject ( );},
				set object ( something ) { m_SetObject ( something ); }
				
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = itinerary;
	}

} ) ( );

/*
--- End of Itinerary.js file ------------------------------------------------------------------------------------------
*/
},{"../data/Collection":43,"../data/ObjId":50,"../data/ObjType":51,"./Version":7}],5:[function(require,module,exports){
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

/*
--- Route.js file -----------------------------------------------------------------------------------------------------
This file contains:
	- the Route object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	-v1.1.0:
		- Issue #33: Add a command to hide a route
		- Issue #36: Add a linetype property to route
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	var s_ObjType = require ( '../data/ObjType' ) ( 'Route', require ( './Version' ) );

	/*
	--- route function ------------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var route = function ( ) {

		var m_Name = '';

		var m_WayPoints = require ( '../data/Collection' ) ( 'WayPoint' );
		m_WayPoints.add ( require ( '../data/Waypoint' ) ( ) );
		m_WayPoints.add ( require ( '../data/Waypoint' ) ( ) );

		var m_Notes = require ( '../data/Collection' ) ( 'Note' );

		var m_Itinerary = require ( '../data/Itinerary' ) ( );

		var m_Width = require ( '../L.TravelNotes' ).config.route.width || 5;

		var m_Color = require ( '../L.TravelNotes' ).config.route.color || '#ff0000';
		
		var m_DashArray = require ( '../L.TravelNotes' ).config.route.dashArray || 0;

		var m_Chain = false;

		var m_ChainedDistance = 0;

		var m_Distance = 0;

		var m_Duration = 0;
		
		var m_Hidden = false;

		var m_ObjId = require ( '../data/ObjId' ) ( );

		var m_GetObject = function ( ) {
			return {
				name : m_Name,
				wayPoints : m_WayPoints.object,
				notes : m_Notes.object,
				itinerary : m_Itinerary.object,
				width : m_Width,
				color : m_Color,
				dashArray : m_DashArray,
				chain :m_Chain,
				distance : parseFloat ( m_Distance.toFixed ( 2 ) ),
				duration : m_Duration,
				hidden : m_Hidden,
				chainedDistance : parseFloat ( m_ChainedDistance.toFixed ( 2 ) ),
				objId : m_ObjId,
				objType : s_ObjType.object
			};
		};
		
		var m_SetObject = function ( something ) {
			something = s_ObjType.validate ( something );
			m_Name = something.name || '';
			m_WayPoints.object = something.wayPoints || [];
			m_Notes.object = something.notes || [];
			m_Itinerary.object = something.itinerary || require ( './Itinerary' ) ( ).object;
			m_Width = something.width || 5;
			m_Color = something.color || '#000000';
			m_DashArray = something.dashArray || 0;
			m_Chain = something.chain || false;
			m_Distance = something.distance;
			m_Duration = something.duration;
			m_Hidden = something.hidden || false;
			m_ChainedDistance = something.chainedDistance;
			m_ObjId = require ( '../data/ObjId' ) ( );
		};

		/*
		--- route object -----------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal ( 
			{

				get wayPoints ( ) { return m_WayPoints; },

				get itinerary ( ) { return m_Itinerary; },

				get notes ( ) { return m_Notes; },

				get name ( ) { return m_Name; },
				set name ( Name ) { m_Name = Name;},

				get width ( ) { return m_Width; },
				set width ( Width ) { m_Width = Width; },

				get color ( ) { return m_Color; },
				set color ( Color ) { m_Color = Color; },

				get dashArray ( ) { return m_DashArray; },
				set dashArray ( DashArray ) { m_DashArray = DashArray; },

				get chain ( ) { return m_Chain; },
				set chain ( Chain ) { m_Chain = Chain; },

				get chainedDistance ( ) { return m_ChainedDistance; },
				set chainedDistance ( ChainedDistance ) { m_ChainedDistance = ChainedDistance; },

				get distance ( ) { return m_Distance; },
				set distance ( Distance ) { m_Distance = Distance; },

				get duration ( ) { return m_Duration; },
				set duration ( Duration ) { m_Duration = Duration; },

				get hidden ( ) { return m_Hidden; },
				set hidden ( Hidden ) { m_Hidden = Hidden; },

				get objId ( ) { return m_ObjId; },

				get objType ( ) { return s_ObjType; },

				get object ( ) { return m_GetObject ( ); },
				set object ( something ) { m_SetObject ( something ); }
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = route;
	}

} ) ( );

/*
--- End of Route.js file ----------------------------------------------------------------------------------------------
*/
},{"../L.TravelNotes":8,"../data/Collection":43,"../data/Itinerary":46,"../data/ObjId":50,"../data/ObjType":51,"../data/Waypoint":57,"./Itinerary":4,"./Version":7}],6:[function(require,module,exports){
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

/*
--- Travel.js file ----------------------------------------------------------------------------------------------------
This file contains:
	- the Travel object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	var s_ObjType = require ( '../data/ObjType' ) ( 'Travel', require ( './Version' ) );

	/*
	--- travel function -----------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var travel = function ( ) {

		// Private variables

		var m_Name = 'TravelNotes';

		var m_Routes = require ( '../data/Collection' ) ( 'Route' );

		var m_Notes = require ( '../data/Collection' ) ( 'Note' );

		var m_ObjId = require ( '../data/ObjId' ) ( );

		var m_ReadOnly = false;
		
		var m_UserData = {};

		var m_GetObject = function ( ) {
			return {
				name : m_Name,
				routes : m_Routes.object,
				notes : m_Notes.object,
				userData : m_UserData,
				readOnly : m_ReadOnly,
				objId : m_ObjId,
				objType : s_ObjType.object
			};
		};
		
		var m_SetObject = function ( something ) {
			something = s_ObjType.validate ( something );
			m_Name = something.name || '';
			m_UserData = something.userData || {};
			m_ReadOnly = something.readOnly || false;
			m_Routes.object = something.routes || [];
			m_Notes.object = something.notes || [];
			m_ObjId = require ( '../data/ObjId' ) ( );
		};
		
		/*
		--- travel object ---------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/
		
		return Object.seal (
			{
				get routes ( ) { return m_Routes; },

				get notes ( ) { return m_Notes; },

				get name ( ) { return m_Name; },
				set name ( Name ) { m_Name = Name; },
				
				get readOnly ( ) { return m_ReadOnly; },
				set readOnly ( ReadOnly ) { m_ReadOnly = ReadOnly; },

				get userData ( ) { return m_UserData; },
				set userData ( UserData ) { m_UserData = UserData;},

				get objId ( ) { return m_ObjId; },

				get objType ( ) { return s_ObjType; },

				get object ( ) { return m_GetObject ( ); },
				set object ( something ) { m_SetObject ( something ); }
			}
		);
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = travel;
	}

} ) ( );

/*
--- End of Travel.js file ---------------------------------------------------------------------------------------------
*/
},{"../data/Collection":43,"../data/ObjId":50,"../data/ObjType":51,"./Version":7}],7:[function(require,module,exports){
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
/*
--- Version.js file ---------------------------------------------------------------------------------------------------
This file contains:
	- the version number
	- v1.4.0:
		- created from DataManager
Doc reviewed 20190919

-----------------------------------------------------------------------------------------------------------------------
*/
( function ( ) {
	
	'use strict';
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = '1.4.0';
	}
	
} ) ( );

/*
--- End of Version.js file --------------------------------------------------------------------------------------------
*/
},{}],8:[function(require,module,exports){
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

/*
--- L.TravelNotes.js file -------------------------------------------------------------------------------------
This file contains:
	- the L.TravelNotes object
Changes:
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #26 : added confirmation message before leaving the page when data modified.
		- Issue #27 : push directly the route in the editor when starting a new travel
	- v1.3.0:
		- Improved _ReadURL method
		- Working with Promise at startup
		- Added baseDialog property
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- removing interface
		- moving file functions from TravelEditor to the new FileLoader
		- added loading of osmSearch

Doc reviewed 20171001
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/


( function ( ){
	
	'use strict';


	/* 
	--- TravelNotes object --------------------------------------------------------------------------------------------
	
	This object contains all you need to use TravelNotes :-)
	
	Patterns : Closure
	-------------------------------------------------------------------------------------------------------------------
	*/

	var TravelNotes = function ( ) {

		var _TravelNotesData = require ( './data/TravelNotesData' ) ( );
		if ( typeof module !== 'undefined' && module.exports ) {
			module.exports = _TravelNotesData;
		}
		
		var _LeftUserContextMenuData = [];
		var _RightUserContextMenuData = [];
		var _HaveLeftContextMenu = false;
		var _HaveRightContextMenu = false;
		
		var _Langage = null;
		
		var _TravelUrl = null;
	
		/*
		--- _ReadURL function -----------------------------------------------------------------------------------------

		This function extract the route providers API key from the url

		---------------------------------------------------------------------------------------------------------------
		*/

		var _ReadURL = function ( ) {
			var newUrlSearch = '?' ;
			( decodeURI ( window.location.search ).substr ( 1 ).split ( '&' ) ).forEach ( 
				function ( urlSearchSubString ){
					if ( 'fil=' === urlSearchSubString.substr ( 0, 4 ).toLowerCase ( ) ) {
						// Needed to first extract the file name because the file name 
						// can contains some = chars (see base64 specs)
						_TravelUrl = decodeURIComponent ( escape( atob ( urlSearchSubString.substr ( 4 ) ) ) );
						newUrlSearch += ( newUrlSearch === '?' ) ? '' :  '&';
						newUrlSearch += urlSearchSubString;
					}
					else {
						var param = urlSearchSubString.split ( '=' );
						if ( 2 === param.length ) {
							if ( -1 !== param [ 0 ].indexOf ( 'ProviderKey' )  ) {
								var providerName = param [ 0 ].substr ( 0, param [ 0 ].length - 11 ).toLowerCase ( );
								var provider = _TravelNotesData.providers.get ( providerName );
								if ( provider && provider.providerKeyNeeded ) {
									provider.providerKey = param [ 1 ];
								}
								sessionStorage.setItem ( providerName, btoa ( param [ 1 ] ) );
							}
							else {
								newUrlSearch += ( newUrlSearch === '?' ) ? '' :  '&';
								newUrlSearch += urlSearchSubString;
								if ( 'lng' === param [ 0 ].toLowerCase ( ) ) {
									_Langage = param [ 1 ].toLowerCase ( );
								}
							}
						}
					}
				}
			);
			var stateObj = { index: "bar" };
			history.replaceState ( stateObj, "page", newUrlSearch );
			
			_TravelNotesData.providers.forEach (
				function ( provider ) {
					if ( provider.providerKeyNeeded && 0 === provider.providerKey ) {
						var providerKey = null;
						if ( require ( './util/Utilities' ) ( ).storageAvailable ( 'sessionStorage' ) ) {
							providerKey = sessionStorage.getItem ( provider.name.toLowerCase ( ) ) ;
						}
						if ( providerKey ) {
							provider.providerKey = atob ( providerKey );
						}
						else {
							_TravelNotesData.providers.delete ( provider.name.toLowerCase( ) );
						}
					}
				}
			);
		};

		/*
		--- End of _ReadURL function ---
		*/
		
		/*
		--- _StartXMLHttpRequest function -----------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var _XMLHttpRequestUrl = '';

		var _StartXMLHttpRequest = function ( returnOnOk, returnOnError ) {
			
			var xmlHttpRequest = new XMLHttpRequest ( );
			xmlHttpRequest.timeout = 20000;
			
			xmlHttpRequest.ontimeout = function ( event ) {
				returnOnError ( 'XMLHttpRequest TimeOut. File : ' + xmlHttpRequest.responseURL );
			};
			
			xmlHttpRequest.onreadystatechange = function ( ) {
				if ( xmlHttpRequest.readyState === 4 ) {
					if ( xmlHttpRequest.status === 200 ) {
						var response;
						try {
							response = JSON.parse ( xmlHttpRequest.responseText );
						}
						catch ( e ) {
							returnOnError ( 'JSON parsing error. File : ' + xmlHttpRequest.responseURL );
						}
						returnOnOk ( response );
					}
					else {
						returnOnError ( 'Error XMLHttpRequest - Status : ' + xmlHttpRequest.status + ' - StatusText : ' + xmlHttpRequest.statusText + ' - File : ' + xmlHttpRequest.responseURL );
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
		--- _AddControl function --------------------------------------------------------------------------------------

		This function add the control on the HTML page

		---------------------------------------------------------------------------------------------------------------
		*/

		var _AddControl = function ( map, divControlId ) {
			
			_TravelNotesData.map = map;
			_ReadURL ( );
			
			var promises = [];
			// loading config
			_XMLHttpRequestUrl = window.location.href.substr (0, window.location.href.lastIndexOf( '/') + 1 ) +'TravelNotesConfig.json';
			promises.push ( new Promise ( _StartXMLHttpRequest ) );
			// loading translations
			_XMLHttpRequestUrl = window.location.href.substr (0, window.location.href.lastIndexOf( '/') + 1 ) + 'TravelNotes' + ( _Langage || _TravelNotesData.config.language).toUpperCase ( )  + '.json';
			promises.push ( new Promise ( _StartXMLHttpRequest ) );
			// loading travel
			if ( _TravelUrl ) {
				_XMLHttpRequestUrl = _TravelUrl;
				promises.push (  new Promise ( _StartXMLHttpRequest ) );
			}
			
			Promise.all ( promises ).then ( 
				// promises succeeded
				function ( values ) {
					// config adaptation
					if ( _Langage ) {
						values [ 0 ].language = _Langage;
					}
					_TravelNotesData.config = values [ 0 ];
					
					if ( window.osmSearch ) {
						window.osmSearch.getDictionaryPromise ( _TravelNotesData.config.language, 'travelNotes' )
						.then ( 
							function ( ) { console.log ( 'Dictionary loaded' ); },
							function ( error ) { console.log ( error ); }
						);
					}
					else {
						console.log ( 'osmSearch not found' );
					}

					_TravelNotesData.providers.forEach (
						function ( provider ) {
							provider.userLanguage =  _TravelNotesData.config.language;
						}
					);
					// translations adaptation
					require ( './UI/Translator' ) ( ).setTranslations ( values [ 1 ] );
					// loading new travel
					_TravelNotesData.travel = require ( './data/Travel' ) ( );
					_TravelNotesData.travel.routes.add ( require ( './data/Route' ) ( ) );
					_TravelNotesData.editedRoute = ( require ( './data/Route' ) ( ) );
					// user interface is added
					document.getElementById ( divControlId ).appendChild ( require ( './UI/UserInterface' ) ( ).UI );
					require ( './UI/TravelEditorUI' ) ( ).setRoutesList ( _TravelNotesData.travel.routes );
					require ( './core/TravelEditor' ) ( ).updateRoadBook ( true );

					if ( _TravelUrl ) {
						// loading travel...
						require ( './core/FileLoader' ) ( ).openDistantFile ( values [ 2 ] );
					}
					else {
						if ( _TravelNotesData.config.travelEditor.startupRouteEdition ) {
							require ( './core/TravelEditor' ) ( ).editRoute ( _TravelNotesData.travel.routes.first.objId );
						}
						else {
							require ( './UI/RouteEditorUI' ) ( ) .reduce ( );
						}	
					}
				}
			).catch ( 
				// promises failed
				function ( error ) {
					console.log ( error );
					//document.getElementsByTagName ( 'body' )[0].innerHTML = error;
				}
			);
		};
		
		/*
		--- End of _AddControl function ---
		*/
		
		/*
		--- _OnMapClick function --------------------------------------------------------------------------------------

		Map click event handler
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _OnMapClick = function ( event ) {
			if ( _TravelNotesData.travel.readOnly ) {
				return;
			}
			require ( './UI/ContextMenu' ) ( 
				event, 
				require ( './UI/ContextMenuFactory' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] )
				.concat ( _LeftUserContextMenuData ) 
			);
		};
		
		/*
		--- _OnMapContextMenu function --------------------------------------------------------------------------------

		Map context menu event handler
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _OnMapContextMenu = function ( event ) {
			if ( _TravelNotesData.travel.readOnly ) {
				return;
			}
			require ( './UI/ContextMenu' ) (
				event, 
				require ( './UI/ContextMenuFactory' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] )
				.concat ( _RightUserContextMenuData )
			);
		};

		return {

			/*
			--- addControl method --------------------------------------------------------------------------------------

			This method add the control on the page

			-----------------------------------------------------------------------------------------------------------
			*/

			addControl : function ( map, divControlId ) { return _AddControl ( map, divControlId );}, 
			
			/*
			--- addProvider method ------------------------------------------------------------------------------------

			This method add a provider to the providers map

			-----------------------------------------------------------------------------------------------------------
			*/
			
			addProvider : function ( provider ) { _TravelNotesData.providers.set ( provider.name.toLowerCase( ), provider ); },
			
			/*
			--- addMapContextMenu method ------------------------------------------------------------------------------

			This method add the map context menus

			-----------------------------------------------------------------------------------------------------------
			*/

			addMapContextMenu : function ( leftButton, rightButton ) {
				if ( leftButton ) {
					_TravelNotesData.map.on ( 'click', _OnMapClick );
					_HaveLeftContextMenu = true;
				}
				if ( rightButton ) {
					_TravelNotesData.map.on ( 'contextmenu', _OnMapClick );
					_HaveRightContextMenu = true;
				}
			},

			/*
			--- getters and setters -----------------------------------------------------------------------------------

			-----------------------------------------------------------------------------------------------------------
			*/

			get baseDialog ( ) { return require ( './UI/baseDialog' ) ( ); },

			get userData ( ) { return _TravelNotesData.travel.userData;},
			set userData ( userData ) { _TravelNotesData.travel.userData = userData;},
			
			get rightContextMenu ( ) { return _HaveRightContextMenu; },
			set rightContextMenu ( RightContextMenu ) { 
				if  ( ( RightContextMenu ) && ( ! _HaveRightContextMenu ) ) {
					_TravelNotesData.map.on ( 'contextmenu', _OnMapContextMenu );
					_HaveRightContextMenu = true;
				}
				else if ( ( ! RightContextMenu ) && ( _HaveRightContextMenu ) ) {
					_TravelNotesData.map.off ( 'contextmenu', _OnMapContextMenu );
					_HaveRightContextMenu = false;
				}
			},
			
			get leftContextMenu ( ) { return _HaveLeftContextMenu; },
			set leftContextMenu ( LeftContextMenu ) { 
				if  ( ( LeftContextMenu ) && ( ! _HaveLeftContextMenu ) ) {
					_TravelNotesData.map.on ( 'click', _OnMapClick );
					_HaveLeftContextMenu = true;
				}
				else if ( ( ! LeftContextMenu ) && ( _HaveLeftContextMenu ) ) {
					_TravelNotesData.map.off ( 'click', _OnMapClick );
					_HaveLeftContextMenu = false;
				}
			},
			
			get leftUserContextMenu ( ) { return _LeftUserContextMenuData; },
			set leftUserContextMenu ( LeftUserContextMenu ) {_LeftUserContextMenuData = LeftUserContextMenu; },
			
			get rightUserContextMenu ( ) { return _RightUserContextMenuData; },
			set rightUserContextMenu ( RightUserContextMenu ) {_RightUserContextMenuData = RightUserContextMenu; },
			
			get maneuver ( ) { return require ( './data/Maneuver' ) ( ); },
			
			get itineraryPoint ( ) { return require ( './data/ItineraryPoint' ) ( );},
			
			get version ( ) { return require ( './data/Version' ) ; }
		};
	};
	L.travelNotes = TravelNotes ( );
	
}());

/*
--- End of L.TravelNotes.js file --------------------------------------------------------------------------------------
*/

},{"./UI/ContextMenu":12,"./UI/ContextMenuFactory":13,"./UI/RouteEditorUI":22,"./UI/Translator":26,"./UI/TravelEditorUI":27,"./UI/UserInterface":29,"./UI/baseDialog":30,"./core/FileLoader":32,"./core/TravelEditor":40,"./data/ItineraryPoint":47,"./data/Maneuver":48,"./data/Route":52,"./data/Travel":53,"./data/TravelNotesData":54,"./data/Version":55,"./util/Utilities":58}],9:[function(require,module,exports){
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

/*
--- AboutDialog.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the AboutDialog object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20170929
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var AboutDialog = function ( color ) {
		
		var baseDialog = require ( '../UI/BaseDialog' ) ( );
		baseDialog.title = require ( '../UI/Translator' ) ( ).getText ( 'AboutDialog - About Travel & Notes' );
		
		var aboutDiv = require ( './HTMLElementsFactory' ) ( ).create (
			'div',
			{
				id : 'TravelNotes-AboutDialog-AboutDiv'
			},
			baseDialog.content
		);
		
		aboutDiv.innerHTML = 
			"<p>This  program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or any later version.</p>" +
			"<p>Copyright - 2017 2019 - wwwouaiebe</p>" +
			"<p>Contact : <a href='http://www.ouaie.be/blog/pages/contact' target='_blank'>http://www.ouaie.be/</a></p>" +
			"<p>GitHub : <a href='https://github.com/wwwouaiebe/leaflet.TravelNotes' target='_blank'>https://github.com/wwwouaiebe/leaflet.TravelNotes</a></p>" +
			"<p>Version : " + require ( '../data/Version' ) +'.' +
			"<p>This program uses:" +
			" <a href='https://leafletjs.com/' target='_blank'>leaflet</a>," +
			" <a href='https://github.com/mapbox/polyline' target='_blank'>mapbox/polyline</a>," +
			" <a href='https://github.com/Project-OSRM/osrm-text-instructions' target='_blank'>Project-OSRM/osrm-text-instructions</a> and " +
			" <a href='https://github.com/drolbr/Overpass-API' target='_blank'>the Overpass API</a></p>";
		
		baseDialog.center ( );
		
		return baseDialog;
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = AboutDialog;
	}

}());

/*
--- End of AboutDialog.js file ----------------------------------------------------------------------------------------
*/	
},{"../UI/BaseDialog":10,"../UI/Translator":26,"../data/Version":55,"./HTMLElementsFactory":16}],10:[function(require,module,exports){
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


/*
--- BaseDialog.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the BaseDialog object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.3.0:
		- added the possibility to have an event listener on the cancel button and escape key in
		the derived dialog boxes (see addClickCancelButtonEventListener addEscapeKeyEventListener)
Doc reviewed 20170928
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	
	var BaseDialog = function ( ) {
		
		var okButtonListener = null;
		var cancelButtonListener = null;
		var escapeKeyEventListener = null;
		
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		var onKeyDown = function ( keyBoardEvent ) {
			if ( 'Escape' === keyBoardEvent.key || 'Esc' === keyBoardEvent.key ) {
				if ( escapeKeyEventListener ) {
					if ( ! escapeKeyEventListener ( ) ) {
						return;
					}
				}

				document.removeEventListener ( 'keydown', onKeyDown, true );
				document.getElementsByTagName('body') [0].removeChild ( document.getElementById ( "TravelNotes-BaseDialog-BackgroundDiv" ) );
			}
		};
		
		// A new element covering the entire screen is created, with drag and drop event listeners
		var body = document.getElementsByTagName('body') [0];
		var backgroundDiv = htmlElementsFactory.create ( 'div', { id: 'TravelNotes-BaseDialog-BackgroundDiv', className : 'TravelNotes-BaseDialog-BackgroundDiv'} , body );
		backgroundDiv.addEventListener ( 
			'dragover', 
			function ( event ) {
				return;
			},
			false
		);	
		backgroundDiv.addEventListener ( 
			'drop', 
			function ( event ) {
				return;
			},
			false
		);	

		// variables initialization for drag and drop
		var screenWidth = backgroundDiv.clientWidth;
		var screenHeight = backgroundDiv.clientHeight;
		
		var startDragX = 0;
		var startDragY = 0;
		
		var dialogX = 0;
		var dialogY = 0;

		// the dialog is created
		var dialogContainer = htmlElementsFactory.create ( 
			'div',
			{ 
				id : 'TravelNotes-BaseDialog-Container',
				className : 'TravelNotes-BaseDialog-Container',
			},
			backgroundDiv
		);
		var topBar = htmlElementsFactory.create ( 
			'div',
			{ 
				id : 'TravelNotes-BaseDialog-TopBar',
				className : 'TravelNotes-BaseDialog-TopBar',
				draggable : true
			},
			dialogContainer
		);
		var cancelButton = htmlElementsFactory.create ( 
			'div',
			{ 
				innerHTML: '&#x274c', 
				id : 'TravelNotes-BaseDialog-CancelButton',
				title : require ( '../UI/Translator' ) ( ).getText ( "BaseDialog - Cancel" )
			},
			topBar
		);
		cancelButton.addEventListener ( 
			'click',
			function ( ) {
				if ( cancelButtonListener ) {
					if ( ! cancelButtonListener ( ) ) {
						return;
					}
				}
				document.removeEventListener ( 'keydown', onKeyDown, true );
				document.getElementsByTagName('body') [0].removeChild ( backgroundDiv );
			},
			false
		);
		topBar.addEventListener ( 
			'dragstart', 
			function ( event ) {
				try {
					event.dataTransfer.setData ( 'Text', '1' );
				}
				catch ( e ) {
				}
				startDragX = event.screenX;
				startDragY = event.screenY;
			},
			false
		);	
		topBar.addEventListener ( 
			'dragend', 
			function ( event ) {
				dialogX += event.screenX - startDragX;
				dialogY += event.screenY - startDragY;
				dialogX = Math.min ( Math.max ( dialogX, 20 ),screenWidth - dialogContainer.clientWidth -20 );
				dialogY = Math.max ( dialogY, 20 );
				var dialogMaxHeight = screenHeight - Math.max ( dialogY, 0 ) - 20;
				dialogContainer.setAttribute ( "style", "top:" + dialogY + "px;left:" + dialogX +"px;max-height:" + dialogMaxHeight +"px;" );
			},
			false 
		);
		var headerDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-HeaderDiv',
				id : 'TravelNotes-BaseDialog-HeaderDiv'
			},
			dialogContainer
		);		
		var contentDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-ContentDiv',
				id : 'TravelNotes-BaseDialog-ContentDiv'
			},
			dialogContainer
		);
		var errorDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-ErrorDiv TravelNotes-BaseDialog-ErrorDivHidden',
				id : 'TravelNotes-BaseDialog-ErrorDiv',
			},
			dialogContainer
		);
		var footerDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-FooterDiv',
				id : 'TravelNotes-BaseDialog-FooterDiv',
			},
			dialogContainer
		);
		var okButton = htmlElementsFactory.create ( 
			'div',
			{ 
				innerHTML: '&#x1f4be;', 
				id : 'TravelNotes-BaseDialog-OkButton',
				className : 'TravelNotes-BaseDialog-Button'
			},
			footerDiv
		);
		okButton.addEventListener ( 
			'click',
			function ( ) {
				if ( okButtonListener ) {
					if ( ! okButtonListener ( ) ) {
						return;
					}
				}
				document.removeEventListener ( 'keydown', onKeyDown, true );
				document.getElementsByTagName('body') [0].removeChild ( backgroundDiv );
			},
			false
		);				
		document.addEventListener ( 'keydown', onKeyDown, true );
		
		/*
		--- BaseDialog object -----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return {
			
			addClickOkButtonEventListener : function ( listener ) {
				okButtonListener = listener;
			},
			
			addClickCancelButtonEventListener : function ( listener ) {
				cancelButtonListener = listener;
			},
			
			addEscapeKeyEventListener : function ( listener ) {
				escapeKeyEventListener = listener;
			},
			
			get title ( ) { return headerDiv.innerHTML; },
			set title ( Title ) { headerDiv.innerHTML = Title; },
			
			center : function ( ) {
				dialogX = ( screenWidth - dialogContainer.clientWidth ) / 2;
				dialogY = ( screenHeight - dialogContainer.clientHeight ) / 2;
				dialogX = Math.min ( Math.max ( dialogX, 20 ),screenWidth - dialogContainer.clientWidth -20 );
				dialogY = Math.max ( dialogY, 20 );
				var dialogMaxHeight = screenHeight - Math.max ( dialogY, 0 ) - 20;
				dialogContainer.setAttribute ( "style", "top:" + dialogY + "px;left:" + dialogX +"px;max-height:" + dialogMaxHeight +"px;" );
			},

			get header ( ) { return headerDiv;},
			set header ( Header ) { headerDiv = Header; },
			
			get content ( ) { return contentDiv;},
			set content ( Content ) { contentDiv = Content; },

			get footer ( ) { return footerDiv;},
			set footer ( Footer ) { footerDiv = Footer; }
			
		};
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = BaseDialog;
	}

}());

/*
--- End of BaseDialog.js file -----------------------------------------------------------------------------------------
*/
},{"../UI/Translator":26,"./HTMLElementsFactory":16}],11:[function(require,module,exports){
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

/*
--- ColorDialog.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the ColorDialog object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
Doc reviewed 20170929
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	
	var onOkButtonClick = function ( ) {
		return true;
	};

	var ColorDialog = function ( color ) {
		
		/*
		--- colorToNumbers function -------------------------------------------------------------------------------------------

		This function transforms a css color into an object { r : xx, g : xx, b : xx}

		---------------------------------------------------------------------------------------------------------------
		*/

		var colorToNumbers = function ( color ) {
			return {
				r : parseInt ( color.substr ( 1, 2 ), 16 ),
				g : parseInt ( color.substr ( 3, 2 ), 16 ), 
				b : parseInt ( color.substr ( 5, 2 ), 16 ), 
			};
		};
		
		/*
		--- colorToNumbers function -------------------------------------------------------------------------------------------

		This function transforms 3 numbers into a css color

		---------------------------------------------------------------------------------------------------------------
		*/
		var numbersToColor = function ( r, g, b ) {
			// MS Edge do't know padStart...
			if ( ! String.prototype.padStart ) {
				String.prototype.padStart = function padStart ( targetLength, padString ) {
					targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
					padString = String ( padString || ' ' );
					if ( this.length > targetLength ) {
						return String ( this );
					}
					else {
						targetLength = targetLength - this.length;
						if ( targetLength > padString.length ) {
							padString += padString.repeat ( targetLength / padString.length ); //append to original to ensure we are longer than needed
						}
						return padString.slice ( 0, targetLength ) + String ( this );
					}
				};
			}			
			
			return '#' + 
				parseInt ( r ).toString(16).padStart ( 2, '0' ) + 
				parseInt ( g ).toString(16).padStart ( 2, '0' ) + 
				parseInt ( b ).toString(16).padStart ( 2, '0' ) ;
		};

		// Click event handler on a color button
		var onColorClick = function ( event ) {
			newColor = event.target.colorValue;
			var numbers = colorToNumbers ( newColor );
			redInput.value = numbers.r;
			greenInput.value = numbers.g;
			blueInput.value = numbers.b;
			document.getElementById ( 'TravelNotes-ColorDialog-ColorSampleDiv').setAttribute ( 'style', 'background-color:'+ event.target.colorValue +';' );
		};
		
		// Click event handler on a red color button
		var onRedColorClick = function ( event ) {
			var r = event.target.redValue;
			var g = 255;
			var b = 255;
			var rowCounter = 0;
			while ( ++ rowCounter < 7 ) {
				var cellCounter = 0;
				g = 255;
				while ( ++ cellCounter < 7 ) {
					var button = document.getElementById ( ( 'TravelNotes-ColorDialog-CellColorDiv' + rowCounter ) + cellCounter );
					button.colorValue = numbersToColor ( r, g, b );
					button.setAttribute ( 'style', 'background-color:' + numbersToColor ( r, g, b ) );
					g -= 51;
				}
				b -= 51;
			}
		};
	
		// Red, green or blue input event handler 
		var onColorInput = function ( )  {
			newColor = numbersToColor ( redInput.value, greenInput.value, blueInput.value );
			document.getElementById ( 'TravelNotes-ColorDialog-ColorSampleDiv').setAttribute ( 'style', 'background-color:' + newColor + ';' );
		};
		

		var newColor = color;
		var translator = require ( '../UI/Translator' ) ( );		
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;

		// the dialog base is created
		var baseDialog = require ( '../UI/BaseDialog' ) ( );
		baseDialog.title = translator.getText ( 'ColorDialog - Colors' );
		baseDialog.addClickOkButtonEventListener ( onOkButtonClick );
		baseDialog.getNewColor = function ( ) {
			return newColor;
		};
		
		// elements are added to the base dialog content
		var colorDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-ColorDiv',
				id : 'TravelNotes-ColorDialog-ColorDiv'
			},
			baseDialog.content
		);
		var buttonsDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-ButtonsDiv',
				id : 'TravelNotes-ColorDialog-ButtonsDiv'
			},
			colorDiv
		);

		var r = 255;
		var g = 255;
		var b = 255;		
		var rowCounter = 0;
		
		// loop on the 7 rows
		while ( ++ rowCounter < 8 ) {			
			var colorButtonsRowDiv = htmlElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-ColorDialog-RowColorDiv',
					id : 'TravelNotes-ColorDialog-RowColorDiv' +rowCounter
				},
				buttonsDiv
			);
			
			var cellCounter = 0;
			g = 255;
			
			// loop on the 6 cells
			while ( ++ cellCounter < 7 ) {
				var className = 'TravelNotes-ColorDialog-CellColorDiv';
				if ( rowCounter < 7 ) {
					className = 'TravelNotes-ColorDialog-CellColorDiv TravelNotes-ColorDialog-RedDiv';
				}
				var colorButtonCellDiv = htmlElementsFactory.create (
					'div',
					{
						className : 'TravelNotes-ColorDialog-CellColorDiv',
						id : ( 'TravelNotes-ColorDialog-CellColorDiv' + rowCounter ) + cellCounter
					},
					colorButtonsRowDiv
				);
				if ( rowCounter < 7 ) {
					colorButtonCellDiv.setAttribute ( 'style', 'background-color:' + numbersToColor ( r, g, b ) );
					colorButtonCellDiv.colorValue = numbersToColor ( r, g, b );
					colorButtonCellDiv.addEventListener ( 'click', onColorClick, false );
					g -= 51;
				}
				else
				{
					r = ( cellCounter - 1 ) * 51;
					var buttonColor = numbersToColor ( 255, r, r );
					colorButtonCellDiv.setAttribute ( 'style', 'background-color:' + buttonColor );
					colorButtonCellDiv.redValue = 255 - r;
					colorButtonCellDiv.addEventListener ( 'click', onRedColorClick, false );
				}
			}
			b -= 51;
		}
		
		var rvbDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-DataDiv',
				id : 'TravelNotes-ColorDialog-DataDiv'
			},
			colorDiv
		);
		
		// ... red ...
		htmlElementsFactory.create (
			'text',
			{
				data : translator.getText ( 'ColorDialog - Red'),
			},
			rvbDiv
		);
		var redInput =  htmlElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				id : 'TravelNotes-ColorDialog-RedInput'
				
			},
			rvbDiv
		);
		redInput.value = colorToNumbers ( color ).r;
		redInput.min = 0;
		redInput.max = 255;
		
		redInput.addEventListener ( 'input', onColorInput, false );
		
		// ... and green...
		htmlElementsFactory.create (
			'text',
			{
				data : translator.getText ( 'ColorDialog - Green'),
			},
			rvbDiv
		);
		var greenInput =  htmlElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				id : 'TravelNotes-ColorDialog-GreenInput'
			},
			rvbDiv
		);
		greenInput.value = colorToNumbers ( color ).g;
		greenInput.min = 0;
		greenInput.max = 255;
		greenInput.addEventListener ( 'input', onColorInput, false );

		// ... and blue
		htmlElementsFactory.create (
			'text',
			{
				data : translator.getText ( 'ColorDialog - Blue'),
			},
			rvbDiv
		);
		var blueInput =  htmlElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				id : 'TravelNotes-ColorDialog-BlueInput'
			},
			rvbDiv
		);
		blueInput.value = colorToNumbers ( color ).b;
		blueInput.min = 0;
		blueInput.max = 255;
		blueInput.addEventListener ( 'input', onColorInput, false );
		
		// Sample color
		var colorSampleDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-ColorSampleDiv',
				id : 'TravelNotes-ColorDialog-ColorSampleDiv'
			},
			colorDiv
		);
		colorSampleDiv.setAttribute ( 'style', 'background-color:'+ color +';' );

		
		// and the dialog is centered on the screen
		baseDialog.center ( );
		
		return baseDialog;
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = ColorDialog;
	}

}());

/*
--- End of ColorDialog.js file ----------------------------------------------------------------------------------------
*/	
},{"../UI/BaseDialog":10,"../UI/Translator":26,"./HTMLElementsFactory":16}],12:[function(require,module,exports){
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

/*
--- ContextMenu.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the ContextMenu object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20170929
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var _MenuItems = [];
	var _ContextMenuContainer = null;
	var _OriginalEvent = null;
	var _FocusIsOnItem = 0;
	var _Lat = 0;
	var _Lng = 0;
	var _TimerId = null;
	
	/*
	--- onCloseMenu function ------------------------------------------------------------------------------------------

	event listener for the close button. Alson called from others events

	-------------------------------------------------------------------------------------------------------------------
	*/
		
	var onCloseMenu = function ( ) {
		
		if ( _TimerId ) {
			clearTimeout ( _TimerId );
			_TimerId = null;
		}
		
		_Lat = 0;
		_Lng = 0;
		
		// removing event listeners
		document.removeEventListener ( 'keydown', onKeyDown, true );
		document.removeEventListener ( 'keypress', onKeyPress, true );
		document.removeEventListener ( 'keyup', onKeyUp, true );
		
		// removing menu items
		var childNodes = _ContextMenuContainer.childNodes;
		childNodes [ 0 ].firstChild.removeEventListener ( 'click', onCloseMenu, false );
		for ( var childNodesCounter = 1; childNodesCounter < childNodes.length; childNodesCounter ++ ) {
			childNodes [ childNodesCounter ].firstChild.removeEventListener ( 'click', onCloseMenu, false );
		}
		
		// removing the menu container
		document.getElementsByTagName('body') [0].removeChild ( _ContextMenuContainer );
		_ContextMenuContainer = null;
		_FocusIsOnItem = 0;
	};
	
	/*
	--- onKeyDown function --------------------------------------------------------------------------------------------

	Keyboard event listener

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onKeyDown = function ( keyBoardEvent ) {
		
		if ( _ContextMenuContainer ) {
			keyBoardEvent.preventDefault ( );
			keyBoardEvent.stopPropagation ( );
		}
		if ( 'Escape' === keyBoardEvent.key || 'Esc' === keyBoardEvent.key ) {
			onCloseMenu ( );
		}
		if ( 'ArrowDown' === keyBoardEvent.key  || 'ArrowRight' === keyBoardEvent.key  ||  'Tab' === keyBoardEvent.key ){
			_FocusIsOnItem = _FocusIsOnItem >= _MenuItems.length ? 1 : ++ _FocusIsOnItem;
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus ( );
		}
		if ( 'ArrowUp' === keyBoardEvent.key  || 'ArrowLeft' === keyBoardEvent.key ){
			_FocusIsOnItem = _FocusIsOnItem <= 1 ? _MenuItems.length : -- _FocusIsOnItem;
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus ( );
		}
		if ( 'Home' === keyBoardEvent.key ) {
			_FocusIsOnItem = 1;
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus ( );
		}
		if ( 'End' === keyBoardEvent.key ) {
			_FocusIsOnItem = _MenuItems.length;
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus ( );
		}
		if ( ( 'Enter' === keyBoardEvent.key )  && ( _FocusIsOnItem > 0 ) && ( _MenuItems[ _FocusIsOnItem -1 ].action ) ) {
			_ContextMenuContainer.childNodes[ _FocusIsOnItem ].firstChild.click ( );
		}
	};
	
	/*
	--- onKeyPress function -------------------------------------------------------------------------------------------

	Keyboard event listener

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onKeyPress = function ( keyBoardEvent ) {
		keyBoardEvent.preventDefault ( );
		keyBoardEvent.stopPropagation ( );
	};
	
	/*
	--- onKeyUp function ----------------------------------------------------------------------------------------------

	Keyboard event listener

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onKeyUp = function ( keyBoardEvent ) {
		keyBoardEvent.preventDefault ( );
		keyBoardEvent.stopPropagation ( );
	};

	/*
	--- onClickItem function ------------------------------------------------------------------------------------------

	Mouse click event listener

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickItem = function ( event ) {
		event.stopPropagation ( );
		if ( _MenuItems[ event.target.menuItem ].param ) {
			_MenuItems[ event.target.menuItem ].action.call ( 
				_MenuItems[ event.target.menuItem ].context,
				_MenuItems[ event.target.menuItem ].param,
				_OriginalEvent
			);
		}
		else {
			_MenuItems[ event.target.menuItem ].action.call ( 
				_MenuItems[ event.target.menuItem ].context,
				_OriginalEvent
			);
		}
		onCloseMenu ( );
	};
	
	/*
	--- ContextMenu object --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var ContextMenu = function ( event, userMenu ) {
		// stopPropagation ( ) and preventDefault ( ) are not working correctly on leaflet events, so the event continue and bubble.
		// To avoid the menu close directly, we compare the lat and lng of the event with the lat and lng of the previous event
		// and we stop the procedure if equals.
		if  ( ( event.latlng.lat === _Lat ) && ( event.latlng.lng === _Lng ) ) {
			_Lat = 0;
			_Lng = 0;
			return;
		}
		else
		{
			_Lat = event.latlng.lat;
			_Lng = event.latlng.lng;
		}
		
		_OriginalEvent = event; 
		
		// the menu is already opened, so we suppose the user will close the menu by clicking outside...
		if ( _ContextMenuContainer ) {
			onCloseMenu ( );
			return;
		}
		
		_MenuItems = userMenu;
		var body = document.getElementsByTagName('body') [0];
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		// a dummy div is created to find the screen width and height
		var dummyDiv = htmlElementsFactory.create ( 'div', { className : 'TravelNotes-ContextMenu-Panel'} , body );
		var screenWidth = dummyDiv.clientWidth;
		var screenHeight = dummyDiv.clientHeight;
		body.removeChild ( dummyDiv );
		
		// and then the menu is created
		_ContextMenuContainer = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-ContextMenu-Container',className : 'TravelNotes-ContextMenu-Container'}, body );
		_ContextMenuContainer.addEventListener ( 
			'mouseenter',
			function ( ) { 
				if ( _TimerId ) {
					clearTimeout ( _TimerId );
					_TimerId = null;
				}
			},
			false
		);
		_ContextMenuContainer.addEventListener ( 'mouseleave', function ( ) { _TimerId = setTimeout ( onCloseMenu, require ( '../L.TravelNotes' ).config.contextMenu.timeout ); }, false );
		// close button
		var closeButton = htmlElementsFactory.create ( 
			'div',
			{ 
				innerHTML: '&#x274c', 
				className : 'TravelNotes-ContextMenu-CloseButton',
				title : require ( './Translator' ) ( ).getText ( "ContextMenu - Close" )
			},
			_ContextMenuContainer
		);
		closeButton.addEventListener ( 'click', onCloseMenu, false );

		// items
		var menuItemCounter = 0;
		_MenuItems.forEach ( 
			function ( menuItem ) {
				var itemContainer = htmlElementsFactory.create ( 'div', { className : 'TravelNotes-ContextMenu-ItemContainer'},_ContextMenuContainer);
				var item = htmlElementsFactory.create ( 
					'button', 
					{ 
						innerHTML : menuItem.name,
						id : 'TravelNotes-ContextMenu-Item' + menuItemCounter,
						className : menuItem.action ? 'TravelNotes-ContextMenu-Item' : 'TravelNotes-ContextMenu-Item TravelNotes-ContextMenu-ItemDisabled'
					},
					itemContainer
				);
				if ( menuItem.action ) {
					item.addEventListener ( 'click', onClickItem, false );
				}
				item.menuItem = menuItemCounter;
				++ menuItemCounter;
			}
		);
		
		// the menu is positionned ( = top left where the user have clicked but the menu must be completely in the window...
		var menuTop = Math.min ( event.originalEvent.clientY, screenHeight - _ContextMenuContainer.clientHeight - 20 );
		var menuLeft = Math.min ( event.originalEvent.clientX, screenWidth - _ContextMenuContainer.clientWidth - 20 );
		_ContextMenuContainer.setAttribute ( "style", "top:" + menuTop + "px;left:" + menuLeft +"px;" );
		
		// keyboard event listeners
		document.addEventListener ( 'keydown', onKeyDown, true );
		document.addEventListener ( 'keypress', onKeyPress, true );
		document.addEventListener ( 'keyup', onKeyUp, true );
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = ContextMenu;
	}

}());

/*
--- End of ContextMenu.js file ----------------------------------------------------------------------------------------
*/	

},{"../L.TravelNotes":8,"./HTMLElementsFactory":16,"./Translator":26}],13:[function(require,module,exports){
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

/*
--- ContextMenuFactory.js file ----------------------------------------------------------------------------------------
This file contains:
	- the ContextMenuFactory object
	- the module.exports implementation
Changes:
	- v1.4.0:
		- created

Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var g_TravelNotesData = require ( '../L.TravelNotes' );
		
	/*
	--- contextMenuFactory function -----------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var contextMenuFactory = function ( ) {
		
			var m_MapEditor = require ( '../core/MapEditor' ) ( );
			var m_NoteEditor = require ( '../core/NoteEditor' ) ( );
			var m_RouteEditor = require ( '../core/RouteEditor' ) ( );
			var m_TravelEditor = require ( '../core/TravelEditor' ) ( );
			var m_WaypointEditor = require ( '../core/waypointEditor' ) ( );
			var m_Translator = require ( '../UI/Translator' ) ( );

			/*
		--- m_GetMapContextMenu function ------------------------------------------------------------------------------

		This function gives the route part of the map context menu
		
		parameters:
		- latLng : the coordinates where the map was clicked

		-----------------------------------------------------------------------------------------------------------
		*/

		var m_GetMapContextMenu = function ( latLng ) {
			return [
				{ 
					context : m_WaypointEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Select this point as start point" ), 
					action : ( -1 !== g_TravelNotesData.routeEdition.routeInitialObjId ) && ( 0 === g_TravelNotesData.editedRoute.wayPoints.first.lat ) ? require ( '../core/waypointEditor' ) ( ).setStartPoint : null,
					param : latLng
				},
				{
					context : m_WaypointEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Select this point as way point" ), 
					action : ( -1 !== g_TravelNotesData.routeEdition.routeInitialObjId ) ? require ( '../core/waypointEditor' ) ( ).addWayPoint : null,
					param : latLng
				},
				{ 
					context : m_WaypointEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Select this point as end point" ), 
					action : ( -1 !== g_TravelNotesData.routeEdition.routeInitialObjId ) && ( 0 === g_TravelNotesData.editedRoute.wayPoints.last.lat ) ? require ( '../core/waypointEditor' ) ( ).setEndPoint : null,
					param : latLng
				},
				{ 
					context : m_NoteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - New travel note" ), 
					action : m_NoteEditor.newTravelNote,
					param : latLng
				},
				{ 
					context : m_NoteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Hide notes" ), 
					action : m_NoteEditor.hideNotes
				},
				{ 
					context : m_NoteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Show notes" ), 
					action : m_NoteEditor.showNotes
				},
				{ 
					context : m_RouteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Show all routes" ), 
					action : m_RouteEditor.showRoutes
				}, 
				{ 
					context : m_MapEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Zoom to travel" ), 
					action : m_MapEditor.zoomToTravel
				},
				{ 
					context : null,
					name : m_Translator.getText ( "ContextMenuFactory - About Travel & Notes" ), 
					action : require ( '../UI/AboutDialog' )
				} 
			];
		};

		/*
		--- m_GetWayPointContextMenu function --------------------------------------------------------------------------

		This function gives the wayPoint context menu
		
		parameters:
		- wayPointObjId : the wayPoint objId that was clicked

		-----------------------------------------------------------------------------------------------------------
		*/

		var m_GetWayPointContextMenu = function ( wayPointObjId ) {
			return [
				{ 
					context : m_WaypointEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Delete this waypoint" ), 
					action : ( ( g_TravelNotesData.editedRoute.wayPoints.first.objId !== wayPointObjId ) && ( g_TravelNotesData.editedRoute.wayPoints.last.objId !== wayPointObjId ) ) ? require ( '../core/waypointEditor' ) ( ).removeWayPoint : null,
					param: wayPointObjId
				} 
			];
		};
		
		/*
		--- m_GetRouteContextMenu function ----------------------------------------------------------------------------

		This function gives the route context menu
		
		parameters:
		- routeObjId : the route objId that was clicked

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetRouteContextMenu = function ( routeObjId ) {
			return [
				{ 
					context : m_RouteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Edit this route" ), 
					action : ( ( g_TravelNotesData.routeEdition.routeInitialObjId !== routeObjId ) && ( ! g_TravelNotesData.routeEdition.routeChanged ) ) ? m_TravelEditor.editRoute : null,
					param: routeObjId
				},
				{
					context : m_TravelEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Delete this route" ), 
					action : ( ( g_TravelNotesData.routeEdition.routeInitialObjId !== routeObjId ) && ( ! g_TravelNotesData.routeEdition.routeChanged ) ) ? m_TravelEditor.removeRoute : null,
					param: routeObjId
				},
				{
					context : m_RouteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Hide this route" ), 
					action : ( g_TravelNotesData.editedRoute.objId !== routeObjId ) ? m_RouteEditor.hideRoute : null,
					param: routeObjId
				},
				{
					context : m_WaypointEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Add a waypoint on the route" ), 
					action : ( -1 !== g_TravelNotesData.routeEdition.routeInitialObjId ) ? m_WaypointEditor.addWayPointOnRoute : null,
					param: routeObjId
				},
				{
					context : m_NoteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Add a note on the route" ), 
					action : m_NoteEditor.newRouteNote,
					param: routeObjId
				},
				{
					context : m_RouteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Properties" ), 
					action : m_RouteEditor.routeProperties,
					param: routeObjId
				},
				{
					context : m_MapEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Zoom to route" ), 
					action : m_MapEditor.zoomToRoute,
					param: routeObjId
				},
				{ 
					context : m_RouteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Save modifications on this route" ), 
					action : ( g_TravelNotesData.editedRoute.objId === routeObjId ) ? m_RouteEditor.saveEdition : null,
				},
				{ 
					context : m_RouteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Cancel modifications on this route" ), 
					action : ( g_TravelNotesData.editedRoute.objId === routeObjId ) ? m_RouteEditor.cancelEdition : null
				}
			];
		};		

		/*
		--- m_GetNoteContextMenu function -----------------------------------------------------------------------------

		This function gives the note context menu
		
		parameters:
		- noteObjId : the note objId that was clicked

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetNoteContextMenu = function ( noteObjId ) {
			var contextMenu = [];
			contextMenu.push ( 
				{ 
					context : m_NoteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Edit this note" ), 
					action : m_NoteEditor.editNote,
					param : noteObjId
				} 
			);
			contextMenu.push ( 
				{ 
					context : m_NoteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Delete this note" ), 
					action : m_NoteEditor.removeNote,
					param : noteObjId
				} 
			);
			contextMenu.push ( 
				{ 
					context : m_NoteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Zoom to note" ), 
					action : m_NoteEditor.zoomToNote,
					param : noteObjId
				} 
			);
			
			var route = require ( '../data/DataSearchEngine' ) ( ).getNoteAndRoute ( noteObjId ).route;
			contextMenu.push ( 
				{ 
					context : m_NoteEditor, 
					name : route ?  m_Translator.getText ( "ContextMenuFactory - Detach note from route" ) : m_Translator.getText ( "ContextMenuFactory - Attach note to route" ), 
					action : ( ( g_TravelNotesData.travel.routes.length !== 0 &&  -1 === g_TravelNotesData.routeEdition.routeInitialObjId ) ? ( route ? m_NoteEditor.detachNoteFromRoute : m_NoteEditor.attachNoteToRoute ) : null ),
					param : noteObjId
				} 
			);
			
			return contextMenu;
		};
		
		/*
		--- contextMenuFactory object ---------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/
		
		return Object.seal (
			{
				getMapContextMenu :function ( latLng ) { return m_GetMapContextMenu ( latLng ); },

				getWayPointContextMenu : function ( wayPointObjId ) { return m_GetWayPointContextMenu ( wayPointObjId ); },

				getRouteContextMenu : function ( routeObjId ) { return m_GetRouteContextMenu ( routeObjId ); },
				
				getNoteContextMenu : function ( noteObjId ) { return m_GetNoteContextMenu ( noteObjId ) ; }
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = contextMenuFactory;
	}

}());

/*
--- End of ContextMenuFactory.js file ---------------------------------------------------------------------------------
*/		
},{"../L.TravelNotes":8,"../UI/AboutDialog":9,"../UI/Translator":26,"../core/MapEditor":34,"../core/NoteEditor":35,"../core/RouteEditor":37,"../core/TravelEditor":40,"../core/waypointEditor":42,"../data/DataSearchEngine":45}],14:[function(require,module,exports){
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

/*
--- dataPanesUI.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the dataPanesUI object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.3.0:
		- added train button
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var s_ActivePaneIndex = -1;
	
	/*
	--- onWheel function ----------------------------------------------------------------------------------------------

	wheel event listener for the data div

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onWheel = function ( wheelEvent ) { 
		if ( wheelEvent.deltaY ) {
			wheelEvent.target.scrollTop = wheelEvent.target.scrollTop + wheelEvent.deltaY * 10 ;
		}
		wheelEvent.stopPropagation ( );
	};

	/*
	--- onClickItineraryPaneButton function ---------------------------------------------------------------------------

	click event listener for the itinerary pane button

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickItineraryPaneButton = function ( clickEvent ) {
		dataPanesUI ( ).setItinerary ( );
	};

	/*
	--- onClickTravelNotesPaneButton function -------------------------------------------------------------------------

	click event listener for the travel notes pane button

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickTravelNotesPaneButton = function ( clickEvent ) {
		dataPanesUI ( ).setTravelNotes ( );
	};

	/*
	--- onClickSearchPaneButton function ------------------------------------------------------------------------------

	click event listener for the search pane button

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickSearchPaneButton = function ( clickEvent ) {
		dataPanesUI ( ).setSearch ( );
	};

	/*
	--- dataPanesUI function ------------------------------------------------------------------------------------------

	This function returns the dataPanesUI object

	-------------------------------------------------------------------------------------------------------------------
	*/

	var dataPanesUI = function ( ) {

		var m_TravelNotesPaneUI = require ( '../UI/TravelNotesPaneUI' ) ( );
		var m_SearchPaneUI = require ( '../UI/SearchPaneUI' ) ( );
		var m_ItineraryPaneUI = require ( '../UI/ItineraryPaneUI' ) ( );

		/*
		--- m_CreateUI function ---------------------------------------------------------------------------------------

		This function creates the UI

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreateUI = function ( controlDiv ) {
			
			if ( document.getElementById ( 'TravelNotes-Control-ItineraryDataDiv' ) ) {
				return;
			}

			var htmlElementsFactory = require ( '../UI/HTMLElementsFactory' ) ( ) ;

			var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-ItineraryHeaderDiv', className : 'TravelNotes-Control-HeaderDiv'}, controlDiv );
			
			htmlElementsFactory.create ( 
				'div', 
				{ 
					innerHTML : require ( '../UI/Translator' ) ( ).getText ( 'DataPanesUI - Itinerary' ), 
					id : 'TravelNotes-Control-ItineraryPaneButton', 
					className : 'TravelNotes-Control-PaneButton'
				},
				headerDiv 
			).addEventListener ( 'click', onClickItineraryPaneButton, false );
			
			htmlElementsFactory.create ( 
				'div', 
				{ 
					innerHTML : require ( '../UI/Translator' ) ( ).getText ( 'DataPanesUI - Travel notes' ), 
					id : 'TravelNotes-Control-TravelNotesPaneButton', 
					className : 'TravelNotes-Control-PaneButton'
				},
				headerDiv 
			).addEventListener ( 'click', onClickTravelNotesPaneButton, false );
			
			if ( window.osmSearch ) {
				htmlElementsFactory.create ( 
					'div', 
					{ 
						innerHTML : require ( '../UI/Translator' ) ( ).getText ( 'DataPanesUI - Search' ), 
						id : 'TravelNotes-Control-SearchPaneButton', 
						className : 'TravelNotes-Control-PaneButton'
					},
					headerDiv 
				).addEventListener ( 'click', onClickSearchPaneButton, false );
			}
			
			htmlElementsFactory.create ( 
				'div', 
				{
					id : 'TravelNotes-Control-ItineraryDataDiv', 
					className : 'TravelNotes-Control-DataDiv'
				},
			controlDiv ).addEventListener ( 'wheel', onWheel, false );
		};

		/*
		--- m_RemoveActivePane function -------------------------------------------------------------------------------

		This function remove the active pane contents

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_RemoveActivePane = function ( ) {
			switch ( s_ActivePaneIndex ) {
				case 0:
					m_ItineraryPaneUI.remove ( );
					break;
				case 1:
					m_TravelNotesPaneUI.remove ( );
					break;
				case 2 :
					if ( window.osmSearch ) {
						m_SearchPaneUI.remove ( );
					}
					break;
				default:
					break;
			}
		};

		/*
		--- m_SetItinerary function -----------------------------------------------------------------------------------

		This function set the itinerary pane contents

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SetItinerary = function ( ) { 
			m_RemoveActivePane ( );
			m_ItineraryPaneUI.add ( );

			s_ActivePaneIndex = 0;
		};

		/*
		--- m_UpdateItinerary function --------------------------------------------------------------------------------

		This function set the itinerary pane contents only when this pane is active

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_UpdateItinerary = function ( ) {
			if ( 0 === s_ActivePaneIndex ) {
				m_ItineraryPaneUI.remove ( );
				m_ItineraryPaneUI.add ( );
			}
		};
		
		/*
		--- m_SetItinerary function -----------------------------------------------------------------------------------

		This function set the travel notes pane contents

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SetTravelNotes = function ( ) { 
			m_RemoveActivePane ( );
			m_TravelNotesPaneUI.add ( );
			s_ActivePaneIndex = 1;
		};
		
		/*
		--- m_UpdateTravelNotes function ------------------------------------------------------------------------------

		This function set the travel notes pane contents only when this pane is active

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_UpdateTravelNotes = function ( ) {
			if ( 1 === s_ActivePaneIndex ) {
				m_TravelNotesPaneUI.remove ( );
				m_TravelNotesPaneUI.add ( );
			}
		};
		
		/*
		--- m_SetSearch function --------------------------------------------------------------------------------------

		This function set the search pane contents

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SetSearch = function ( ) { 
			m_RemoveActivePane ( );
			m_SearchPaneUI.add ( );

			s_ActivePaneIndex = 2;

		};
		
		/*
		--- m_UpdateSearch function -----------------------------------------------------------------------------------

		This function set the travel notes pane contents only when this pane is active

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_UpdateSearch = function ( ) {
			if ( 2 === s_ActivePaneIndex ) {
				m_SearchPaneUI.remove ( );
				m_SearchPaneUI.add ( );
			}
		};
		
		/* 
		--- dataPanesUI object ----------------------------------------------------------------------------------------
		
		---------------------------------------------------------------------------------------------------------------
		*/
		
		return Object.seal (
			{
				
				createUI : function ( controlDiv ) { m_CreateUI ( controlDiv ); },
				
				setItinerary : function ( ) { m_SetItinerary ( ); },
				updateItinerary : function ( ) { m_UpdateItinerary ( ); },

				setTravelNotes : function ( ) { m_SetTravelNotes ( ); },
				updateTravelNotes : function ( ) { m_UpdateTravelNotes ( ); },
				
				setSearch : function ( ) { m_SetSearch ( ); },
				updateSearch : function ( ) { m_UpdateSearch ( ); }
				
			}
		);
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = dataPanesUI;
	}

}());

/*
--- End of dataPanesUI.js file ----------------------------------------------------------------------------------------
*/	
},{"../UI/HTMLElementsFactory":16,"../UI/ItineraryPaneUI":19,"../UI/SearchPaneUI":24,"../UI/Translator":26,"../UI/TravelNotesPaneUI":28}],15:[function(require,module,exports){
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

/*
--- ErrorEditorUI.js file ---------------------------------------------------------------------------------------------
This file contains:
	- the ErrorEditorUI object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var _TimerId = null;

	var ErrorEditorUI = function ( ) {
				
		var translator = require ( './Translator' ) ( );

		/*
		--- _ReduceUI function ----------------------------------------------------------------------------------------

		This function reduces the UI
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _ReduceUI = function ( ) {
			document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).classList.add ( 'TravelNotes-Control-HiddenList' );
			//document.getElementById ( 'TravelNotes-Control-ErrorHeaderDiv' ).classList.add ( 'TravelNotes-Control-HiddenList' );
			document.getElementById ( 'TravelNotes-Control-ErrorMessageDiv' ).innerHTML = '';
		};
		
		/*
		--- _SetMessage function ----------------------------------------------------------------------------------------

		This function add a message, expand the UI and start a timer
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _SetMessage = function ( message ) {
			if ( _TimerId ) {
				clearTimeout ( _TimerId );
				_TimerId = null;
			}
			document.getElementById ( 'TravelNotes-Control-ErrorMessageDiv' ).innerHTML = message;
			document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).classList.remove ( 'TravelNotes-Control-HiddenList' );
			//document.getElementById ( 'TravelNotes-Control-ErrorHeaderDiv' ).classList.remove ( 'TravelNotes-Control-HiddenList' );
			_TimerId = setTimeout ( _ReduceUI, require ( '../L.TravelNotes' ).config.errorMessages.timeout );
		};
		
		/*
		--- _CreateUI function ----------------------------------------------------------------------------------------

		This function creates the UI
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _CreateUI = function ( controlDiv ){ 
		
			if ( document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ) ) {
				return;
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			var dataDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-ErrorDataDiv', className : 'TravelNotes-Control-DataDiv TravelNotes-Control-HiddenList'}, controlDiv );
			var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-ErrorHeaderDiv', className : 'TravelNotes-Control-HeaderDiv TravelNotes-Control-HiddenList'}, dataDiv );
			var expandButton = htmlElementsFactory.create (
				'span',
				{ 
					innerHTML : '&#x274c',
					title : translator.getText ( 'ErrorEditorUI - Hide' ),
					id : 'TravelNotes-Control-ErrorExpandButton',
					className : 'TravelNotes-Control-HiddenList'
				},
				headerDiv 
			);
			expandButton.addEventListener ( 
				'click' ,
				function ( clickEvent ) {
					clickEvent.stopPropagation ( );
					if ( ! document.getElementById ( 'TravelNotes-Control-ErrorMessageDiv' ).innerHTML.length ) {
						return;
					}	
					_ReduceUI ( );
				},
				false 
			);
			var messageDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-ErrorMessageDiv'}, dataDiv );
		};
				
		/*
		--- ErrorEditorUI object --------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return {
			
			createUI : function ( controlDiv ) { _CreateUI ( controlDiv ); },
	
			set message ( message ) { _SetMessage ( message );	},
			
			get message (  ) { return document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).innerHTML; }		
		};
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = ErrorEditorUI;
	}

}());

/*
--- End of ErrorEditorUI.js file --------------------------------------------------------------------------------------
*/	
},{"../L.TravelNotes":8,"./HTMLElementsFactory":16,"./Translator":26}],16:[function(require,module,exports){
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

/*
--- HTMLElementsFactory.js file ---------------------------------------------------------------------------------------
This file contains:
	- the HTMLElementsFactory object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	/* 
	--- HTMLElementsFactory object ------------------------------------------------------------------------------------
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var HTMLElementsFactory = function ( ) {

		/* 
		--- HTMLElementsFactory object --------------------------------------------------------------------------------
		
		---------------------------------------------------------------------------------------------------------------
		*/

		return {
			create : function ( tagName, properties, parentNode ) {
				var element;
				if ( 'text' === tagName.toLowerCase ( ) ) {
					element = document.createTextNode ( '' );
				}
				else {
					element = document.createElement ( tagName );
				}
				if ( parentNode ) {
					parentNode.appendChild ( element );
				}
				if ( properties )
				{
					for ( var property in properties ) {
						try {
							element [ property ] = properties [ property ];
						}
						catch ( e ) {
							console.log ( "Invalid property : " + property );
						}
					}
				}
				return element;
			}
			
		};
			
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = HTMLElementsFactory;
	}

}());

/*
--- End of HTMLElementsFactory.js file --------------------------------------------------------------------------------
*/	

},{}],17:[function(require,module,exports){
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

/*
--- HTMLViewsFactory.js file ------------------------------------------------------------------------------------------
This file contains:
	- the HTMLViewsFactory object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- Added noteObjId in the _AddNoteHTML function
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var _HTMLElementsFactory = require ( '../UI/HTMLElementsFactory' ) ( );
	var _TravelNotesData = require ( '../L.TravelNotes' );
	var _Translator = require ( '../UI/Translator' ) ( );
	var _Utilities = require ( '../util/Utilities' ) ( );
	var _NoteEditor = require ( '../core/NoteEditor' ) ( );
	var _RouteEditor = require ( '../core/RouteEditor' ) ( );
	
	var m_SvgIconSize = require ( '../L.TravelNotes' ).config.note.svgIconWidth;
	
	var _ClassNamePrefix = 'TravelNotes-Control-';

	var HTMLViewsFactory = function ( ) {
				
		/*
		--- _AddNoteHTML function -------------------------------------------------------------------------------------

		This function add to the rowDiv parameter two div with the note icon ant the note content

		---------------------------------------------------------------------------------------------------------------
		*/

		var _AddNoteHTML = function ( note, rowDiv ) {
			var iconCell = _HTMLElementsFactory.create (
				'div',
				{ 
					className : _ClassNamePrefix + 'Travel-Notes-IconCell',
					innerHTML : note.iconContent
				}, 
				rowDiv
			);
			if ( ( 'svg' === iconCell.firstChild.tagName ) && ( 'TravelNotes-Roadbook-' === _ClassNamePrefix ) ) {
				iconCell.firstChild.setAttributeNS ( null, "viewBox", "0 0 " + m_SvgIconSize + " " + m_SvgIconSize);
			}
			
			var noteElement = _HTMLElementsFactory.create (
				'div',
				{ 
					className : _ClassNamePrefix + 'Travel-Notes-Cell',
					innerHTML : _NoteEditor.getNoteHTML ( note, _ClassNamePrefix )
				}, 
				rowDiv
			);
			rowDiv.noteObjId = note.objId;
		};
				
		/*
		--- _GetTravelHeaderHTML function -----------------------------------------------------------------------------

		This function returns an HTML element with the travel's header

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetTravelHeaderHTML = function ( ) {
			var travelHeaderHTML = _HTMLElementsFactory.create ( 'div', { className :  _ClassNamePrefix + 'Travel-Header' } ); 
			_HTMLElementsFactory.create ( 
				'div',
				{ 
					className : _ClassNamePrefix + 'Travel-Header-Name',
					innerHTML: _TravelNotesData.travel.name
				},
				travelHeaderHTML
			); 
			
			var travelDistance = 0;
			var travelRoutesIterator = _TravelNotesData.travel.routes.iterator;
			while ( ! travelRoutesIterator.done ) {
				_HTMLElementsFactory.create ( 
					'div',
					{ 
						className : _ClassNamePrefix + 'Travel-Header-RouteName',
						innerHTML: '<a href="#route' +  travelRoutesIterator.value.objId + '">' + travelRoutesIterator.value.name + '</a>' + '&nbsp;:&nbsp;' + _Utilities.formatDistance ( travelRoutesIterator.value.distance ) + '.'
					},
					travelHeaderHTML
				); 
				if ( travelRoutesIterator.value.chain ) {
					travelDistance += travelRoutesIterator.value.distance;
				}
			}

			_HTMLElementsFactory.create ( 
				'div',
				{ 
					className : _ClassNamePrefix + 'Travel-Header-TravelDistance',
					innerHTML:  _Translator.getText ( 'HTMLViewsFactory - Travel distance&nbsp;:&nbsp;{distance}', { distance : _Utilities.formatDistance ( travelDistance ) } )
				},
				travelHeaderHTML
			); 

			return travelHeaderHTML;
		};

				
		/*
		--- _GetTravelNotesHTML function ------------------------------------------------------------------------------

		This function returns an HTML element with the travel's notes

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetTravelNotesHTML = function ( ) {
			var travelNotesHTML = _HTMLElementsFactory.create ( 'div', { className :  _ClassNamePrefix + 'Travel-Notes'} ); 
			var travelNotesIterator = _TravelNotesData.travel.notes.iterator;
			while ( ! travelNotesIterator.done ) {
				var rowDiv = _HTMLElementsFactory.create ( 
					'div', 
					{ className : _ClassNamePrefix + 'Travel-Notes-Row'}, 
					travelNotesHTML
				);
				 _AddNoteHTML ( travelNotesIterator.value, rowDiv ) ;
			}
			
			return travelNotesHTML;
		};
				
		/*
		--- _GetRouteHeaderHTML function ------------------------------------------------------------------------------

		This function returns an HTML element with the route header

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetRouteHeaderHTML = function ( route ) {
			return _HTMLElementsFactory.create ( 
				'div',
				{ 
					className : _ClassNamePrefix + 'Route-Header',
					id : 'route' + route.objId,
					innerHTML: _RouteEditor.getRouteHTML ( route, _ClassNamePrefix )
				}
			); 
		};
				
		/*
		--- _GetRouteManeuversAndNotesHTML function -------------------------------------------------------------------

		This function returns an HTML element with the route maneuvers and notes

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetRouteManeuversAndNotesHTML = function ( route ) {
			var routeManeuversAndNotesHTML = _HTMLElementsFactory.create ( 'div', { className : _ClassNamePrefix + 'Route-ManeuversAndNotes' } ); 
			
			var notesIterator = route.notes.iterator;
			var notesDone =  notesIterator.done;
			var notesDistance = ! notesDone ? notesIterator.value.distance : Number.MAX_VALUE;
			var previousNotesDistance = notesDistance;
			
			var maneuversIterator = route.itinerary.maneuvers.iterator;
			var maneuversDone = maneuversIterator.done;
			var maneuversDistance = 0;
			
			
			while ( ! ( maneuversDone && notesDone ) ) {
				var rowDiv = _HTMLElementsFactory.create ( 
					'div', 
					{ className : _ClassNamePrefix + 'Route-ManeuversAndNotes-Row' }, 
					routeManeuversAndNotesHTML
				);

				if ( maneuversDistance <= notesDistance ) {
					if ( ! maneuversDone ) {
						rowDiv.className = _ClassNamePrefix + 'Route-Maneuvers-Row';
						_HTMLElementsFactory.create (
							'div',
							{ 
								className : _ClassNamePrefix + 'Route-ManeuversAndNotes-IconCell ' + 'TravelNotes-ManeuverNote-' + maneuversIterator.value.iconName,
							}, 
							rowDiv
						);
						
						var maneuverText = 
							'<div>' +  maneuversIterator.value.instruction + '</div>';
						
						if ( 0 < maneuversIterator.value.distance ) {
							maneuverText +=	'<div>' + 
								_Translator.getText ( 
									'HTMLViewsFactory - To next instruction&nbsp;:&nbsp;{distance}&nbsp;-&nbsp;{duration}', 
									{
										distance : _Utilities.formatDistance ( maneuversIterator.value.distance ),
										duration : _Utilities.formatTime (maneuversIterator.value.duration )
									}
								) + '</div>';
						}
						_HTMLElementsFactory.create (
							'div',
							{ 
								className : _ClassNamePrefix + 'Route-ManeuversAndNotes-Cell',
								innerHTML : maneuverText
							}, 
							rowDiv
						);
						
						rowDiv.objId= require ( '../data/ObjId' ) ( );
						rowDiv.latLng = route.itinerary.itineraryPoints.getAt ( maneuversIterator.value.itineraryPointObjId ).latLng;
						rowDiv.maneuverObjId = maneuversIterator.value.objId;
						
						maneuversDistance +=  maneuversIterator.value.distance;
						maneuversDone = maneuversIterator.done;
						if ( maneuversDone ) {
							maneuversDistance = Number.MAX_VALUE;
						}
					}
				}
				else {
					if ( ! notesDone ) {
						rowDiv.className = _ClassNamePrefix + 'Route-Notes-Row';

						_AddNoteHTML ( notesIterator.value, rowDiv );

						rowDiv.objId= require ( '../data/ObjId' ) ( );
						rowDiv.latLng = notesIterator.value.latLng;
						rowDiv.noteObjId = notesIterator.value.objId;
						previousNotesDistance = notesIterator.value.distance;
						notesDone = notesIterator.done;
						notesDistance = notesDone ? Number.MAX_VALUE :  notesIterator.value.distance;
						if ( ! notesDone  ) {
							var nextDistance = notesIterator.value.distance - previousNotesDistance;
							if ( 9 < nextDistance ) {
								_HTMLElementsFactory.create (
									'div',
									{ 
										className : _ClassNamePrefix + 'NoteHtml-NextDistance',
										innerHTML : _Translator.getText ( 'HTMLViewsFactory - Next distance&nbsp;:&nbsp;{distance}', { distance : _Utilities.formatDistance ( nextDistance ) } )
									}, 
									rowDiv.lastChild
								);	
							}
						}
					}
				}	
			}
			
			return routeManeuversAndNotesHTML;
		};
				
		/*
		--- _GetRouteFooterHTML function ------------------------------------------------------------------------------

		This function returns an HTML element with the route footer

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetRouteFooterHTML = function ( route ) {
			var innerHTML = '';
			if ( ( '' !== route.itinerary.provider ) && ( '' !== route.itinerary.transitMode ) ) {
				innerHTML = _Translator.getText ( 
					'HTMLViewsFactory - Itinerary computed by {provider} and optimized for {transitMode}', 
					{
						provider: route.itinerary.provider, 
						transitMode : _Translator.getText ( 'HTMLViewsFactory - TransitMode ' +	route.itinerary.transitMode )
					} 
				);
			}
			
			return _HTMLElementsFactory.create ( 'div', { className : _ClassNamePrefix + 'RouteFooter',	innerHTML : innerHTML } ); 
		};
				
		/*
		--- _GetTravelFooterHTML function -----------------------------------------------------------------------------

		This function returns an HTML element with the travel's footer

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetTravelFooterHTML = function ( ) {
			return _HTMLElementsFactory.create ( 
				'div',
				{ 
					className : _ClassNamePrefix + 'TravelFooter',
					innerHTML : _Translator.getText ( 'HTMLViewsFactory - Travel footer' )
				} 
			); 
		};
				
		/*
		--- _GetTravelHTML function -----------------------------------------------------------------------------------

		This function returns an HTML element with the complete travel

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetTravelHTML = function ( ) {
			
			var travelHTML = _HTMLElementsFactory.create ( 'div', { className : _ClassNamePrefix + 'Travel'} ); 
			
			travelHTML.appendChild ( _GetTravelHeaderHTML ( ) );
			travelHTML.appendChild ( _GetTravelNotesHTML ( ) );
			
			var travelRoutesIterator = _TravelNotesData.travel.routes.iterator;
			while ( ! travelRoutesIterator.done ) {
				var useEditedRoute = _TravelNotesData.config.routeEditor.displayEditionInHTMLPage && travelRoutesIterator.value.objId === _TravelNotesData.routeEdition.routeInitialObjId;
				travelHTML.appendChild ( _GetRouteHeaderHTML ( useEditedRoute ? _TravelNotesData.editedRoute : travelRoutesIterator.value ) );
				travelHTML.appendChild ( _GetRouteManeuversAndNotesHTML ( useEditedRoute ? _TravelNotesData.editedRoute :travelRoutesIterator.value ) );
				travelHTML.appendChild ( _GetRouteFooterHTML ( useEditedRoute ? _TravelNotesData.editedRoute : travelRoutesIterator.value ) );
			}
			
			travelHTML.appendChild ( _GetTravelFooterHTML ( ) );

			return travelHTML;
		};

		/* 
		--- HTMLViewsFactory object -----------------------------------------------------------------------------------
		
		---------------------------------------------------------------------------------------------------------------
		*/

		return {
			
			set classNamePrefix ( ClassNamePrefix ) { _ClassNamePrefix = ClassNamePrefix; },
			get classNamePrefix ( ) { return _ClassNamePrefix; },
			
			get travelHeaderHTML ( )  { return _GetTravelHeaderHTML ( ); }, 
			
			get travelNotesHTML ( )  { return _GetTravelNotesHTML ( ); }, 
			
			get routeHeaderHTML ( )  { return _GetRouteHeaderHTML ( _TravelNotesData.editedRoute ); }, 
			
			get routeManeuversAndNotesHTML ( )  { return _GetRouteManeuversAndNotesHTML ( _TravelNotesData.editedRoute ); }, 
			
			get routeFooterHTML ( )  { return _GetRouteFooterHTML ( _TravelNotesData.editedRoute ); }, 
			
			get travelFooterHTML ( )  { return _GetTravelFooterHTML ( ); }, 
			
			get travelHTML ( ) { return  _GetTravelHTML ( ); }
		};
			
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = HTMLViewsFactory;
	}

}());

/*
--- End of HTMLViewsFactory.js file --------------------------------------------------------------------------------
*/	
},{"../L.TravelNotes":8,"../UI/HTMLElementsFactory":16,"../UI/Translator":26,"../core/NoteEditor":35,"../core/RouteEditor":37,"../data/ObjId":50,"../util/Utilities":58}],18:[function(require,module,exports){
arguments[4][16][0].apply(exports,arguments)
},{"dup":16}],19:[function(require,module,exports){
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

/*
--- ItineraryPaneUI.js file -------------------------------------------------------------------------------------------
This file contains:
	- 
Changes:
	- v1.4.0:
		- created

Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
		/*
	--- onInstructionClick function -----------------------------------------------------------------------------------

	click event listener for the instruction

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onInstructionClick = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		var element = clickEvent.target;
		while ( ! element.latLng ) {
			element = element.parentNode;
		}
		require ( '../core/MapEditor' ) ( ).zoomToPoint ( element.latLng );
	};
	
	/*
	--- onInstructionContextMenu function -----------------------------------------------------------------------------

	contextmenu event listener for the instruction

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onInstructionContextMenu = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		clickEvent.preventDefault ( );
		var element = clickEvent.target;
		while ( ! element.latLng ) {
			element = element.parentNode;
		}
		if ( element.maneuverObjId ) {
			require ( '../core/NoteEditor' ) ( ).newManeuverNote ( element.maneuverObjId, element.latLng );
		} 
		else if ( element.noteObjId ) {
			require ( '../core/NoteEditor' ) ( ).editNote ( element.noteObjId );
		}
	};
	
	/*
	--- onInstructionMouseEnter function ------------------------------------------------------------------------------

	mouseenter event listener for the instruction

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onInstructionMouseEnter = function ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		require ( '../core/MapEditor' ) ( ).addItineraryPointMarker ( mouseEvent.target.objId, mouseEvent.target.latLng  );
	};
	
	/*
	--- onInstructionMouseLeave function ------------------------------------------------------------------------------

	mouseleave event listener for the instruction

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onInstructionMouseLeave = function ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		require ( '../core/MapEditor' ) ( ).removeObject ( mouseEvent.target.objId );
	};

	/*
	--- itineraryPaneUI function --------------------------------------------------------------------------------------

	This function returns the itineraryPaneUI object

	-------------------------------------------------------------------------------------------------------------------
	*/

	var itineraryPaneUI = function ( ) {
	
		/*
		--- m_Remove function -----------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_Remove = function ( ) {
			
			var dataDiv = document.getElementById ( 'TravelNotes-Control-ItineraryDataDiv' );
			if ( ! dataDiv ) {
				return;
			}
			
			// removing previous header 
			var routeHeader = document.getElementsByClassName ( 'TravelNotes-Control-Route-Header' ) [ 0 ];
			if ( routeHeader ) {
				dataDiv.removeChild ( routeHeader );
			}
			
			// removing previous itinerary
			var childCounter;
			var childNodes;
			var childNode;			
			var routeManeuversNotesList = document.getElementsByClassName ( 'TravelNotes-Control-Route-ManeuversAndNotes' ) [ 0 ];
			if ( routeManeuversNotesList ) {
				childNodes = routeManeuversNotesList.childNodes;
				for ( childCounter = 0; childCounter < childNodes.length; childCounter ++ ) {
					childNode = childNodes [ childCounter ];
					childNode.removeEventListener ( 'click' , onInstructionClick, false );
					childNode.removeEventListener ( 'contextmenu' , onInstructionContextMenu, false );
					childNode.removeEventListener ( 'mouseenter' , onInstructionMouseEnter, false );
					childNode.removeEventListener ( 'mouseleave' , onInstructionMouseLeave, false );
				}
				dataDiv.removeChild ( routeManeuversNotesList );
			}
		};
				
		/*
		--- m_Add function --------------------------------------------------------------------------------------------

		This function add the itinerary to the UI

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Add = function ( ) {
			
			document.getElementById ( 'TravelNotes-Control-ItineraryPaneButton' ).classList.add ( 'TravelNotes-Control-ActivePaneButton' );
			document.getElementById ( 'TravelNotes-Control-TravelNotesPaneButton' ).classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
			if ( window.osmSearch ) {
				document.getElementById ( 'TravelNotes-Control-SearchPaneButton' ).classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
			}
			
			var htmlViewsFactory = require ( '../UI/HTMLViewsFactory' ) ( );
			htmlViewsFactory.classNamePrefix = 'TravelNotes-Control-';
			
			var dataDiv = document.getElementById ( 'TravelNotes-Control-ItineraryDataDiv' );
			if ( ! dataDiv ) {
				return;
			}
			
			// adding new header
			dataDiv.appendChild ( htmlViewsFactory.routeHeaderHTML );
			
			
			// adding new itinerary
			dataDiv.appendChild ( htmlViewsFactory.routeManeuversAndNotesHTML );
			
			// adding event listeners 
			var childCounter;
			var childNodes;
			var childNode;			
			var routeManeuversNotesList = document.getElementsByClassName ( 'TravelNotes-Control-Route-ManeuversAndNotes' ) [ 0 ];
			if ( routeManeuversNotesList ) {
				childNodes = routeManeuversNotesList.childNodes;
				for ( childCounter = 0; childCounter < childNodes.length; childCounter ++ ) {
					childNode = childNodes [ childCounter ];
					childNode.addEventListener ( 'click' , onInstructionClick, false );
					childNode.addEventListener ( 'contextmenu' , onInstructionContextMenu, false );
					childNode.addEventListener ( 'mouseenter' , onInstructionMouseEnter, false );
					childNode.addEventListener ( 'mouseleave' , onInstructionMouseLeave, false );
				}
			}
		};

		/*
		--- itineraryPaneUI object ------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{
				remove : function ( ) { m_Remove ( ); },
				add : function ( ) { m_Add ( ); }
			}
		);
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = itineraryPaneUI;
	}

}());

/*
--- End of ItineraryPaneUI.js file ------------------------------------------------------------------------------------
*/		
},{"../UI/HTMLViewsFactory":17,"../core/MapEditor":34,"../core/NoteEditor":35}],20:[function(require,module,exports){
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

/*
--- NoteDialog.js file ------------------------------------------------------------------------------------------------
This file contains:
	- the NoteDialog object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.3.0:
		- changed message
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- added reset button for address
		- added svg icons
		- reviewed code
		- added language for TravelNotesDialogXX.json file
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var g_Translator = require ( '../UI/Translator' ) ( );
	var g_UserButtonsAndIcons = { editionButtons : [], preDefinedIconsList : [] };
	var g_TravelNotesButtonsAndIcons = { editionButtons : [], preDefinedIconsList : [] };
	var g_AllButtonsAndIcons = { editionButtons : [], preDefinedIconsList : [] };
	
	
	/*
	--- NoteDialog function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var NoteDialog = function ( note, routeObjId, newNote ) {
		
		var m_BaseDialog = null;
		var m_NoteDataDiv = null;
		var m_FocusControl = null;
		var m_HtmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		var m_LatLng = note.latLng;
		var m_Address = '';
		var m_City = '';

		/*
		--- onOkButtonClick function ----------------------------------------------------------------------------------

		click event listener for the ok button

		-------------------------------------------------------------------------------------------------------------------
		*/

		var onOkButtonClick = function ( ) {
			// Verifying that the icon is not empty. A note with an empty icon cannot be viewed on the map
			// and then, cannot be edited or removed!
			if ( 0 === document.getElementById ( 'TravelNotes-NoteDialog-TextArea-IconHtmlContent' ).value.length ) {
				document.getElementById ( 'TravelNotes-BaseDialog-ErrorDiv' ).innerHTML = g_Translator.getText ( 'Notedialog - The icon content cannot be empty' );
				document.getElementById ( 'TravelNotes-BaseDialog-ErrorDiv' ).classList.remove ( 'TravelNotes-BaseDialog-ErrorDivHidden' );
				return false;
			}
			// saving values in the note.
			note.iconWidth = document.getElementById ( 'TravelNotes-NoteDialog-WidthNumberInput' ).value;
			note.iconHeight = document.getElementById ( 'TravelNotes-NoteDialog-HeightNumberInput' ).value;
			note.iconContent = document.getElementById ( 'TravelNotes-NoteDialog-TextArea-IconHtmlContent' ).value;
			note.popupContent = document.getElementById ( 'TravelNotes-NoteDialog-TextArea-PopupContent' ).value;
			note.tooltipContent = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value;
			note.address = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Adress' ).value;
			note.url = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Link' ).value;
			note.phone = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Phone' ).value;
			note.latLng = m_LatLng;
			require ( '../core/NoteEditor' ) ( ).afterNoteDialog ( note, routeObjId );
			return true;
		};
	
		/*
		--- End of onOkButtonClick function ---
		*/
		
		/*
		--- onGeocoderResponse function -------------------------------------------------------------------------------

		Handler for the geoCoder call
		
		---------------------------------------------------------------------------------------------------------------
		*/
		var onGeocoderResponse = function ( geoCoderData ) {
			m_Address = '';
			m_City = '';
			if ( geoCoderData.address.house_number ) {
				m_Address += geoCoderData.address.house_number + ' ';
			}
			if ( geoCoderData.address.road ) {
				m_Address += geoCoderData.address.road + ' ';
			}
			else if ( geoCoderData.address.pedestrian ) {
				m_Address += geoCoderData.address.pedestrian + ' ';
			}
			if (  geoCoderData.address.village ) {
				m_City = geoCoderData.address.village;
			}
			else if ( geoCoderData.address.town ) {
				m_City = geoCoderData.address.town;
			}
			else if ( geoCoderData.address.city ) {
				m_City = geoCoderData.address.city;
			}
			if ( '' !== m_City ) {
				m_Address += require ( '../L.TravelNotes' ).config.note.cityPrefix + m_City + require ( '../L.TravelNotes' ).config.note.cityPostfix;
			}
			if ( 0 === m_Address.length ) {
				m_Address += geoCoderData.address.country;
			}
			if ( ( require ( '../L.TravelNotes' ).config.note.reverseGeocoding )  && ( '' === note.address ) && newNote ) {
				document.getElementById ( 'TravelNotes-NoteDialog-InputText-Adress').value = m_Address;
			}
		};
		
		/*
		--- End of onGeocoderResponse function ---
		*/
		
		/*
		--- onSvgIcon function ----------------------------------------------------------------------------------------

		event handler for predefined icons list
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var onSvgIcon = function ( data ) {
			document.getElementById ( 'TravelNotes-NoteDialog-TextArea-IconHtmlContent' ).value = data.svg.outerHTML;
			var directionArrow = '';
			if ( null !== data.direction ) {
				var cfgDirection = require ( '../L.TravelNotes' ).config.note.svgAnleMaxDirection;
				if ( data.direction < cfgDirection.right ) {
					document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = g_Translator.getText ( 'NoteDialog - Turn right');
					directionArrow = String.fromCodePoint ( 0x1F882 );
				}
				else if ( data.direction < cfgDirection.slightRight ) {
					document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = g_Translator.getText ( 'NoteDialog - Turn slight right');
					directionArrow = String.fromCodePoint ( 0x1F885 );
				}
				else if ( data.direction < cfgDirection.continue ) {
					document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = g_Translator.getText ( 'NoteDialog - Continue');
					directionArrow = String.fromCodePoint ( 0x1F881 );
				}
				else if ( data.direction < cfgDirection.slightLeft ) {
					document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = g_Translator.getText ( 'NoteDialog - Turn slight left');
					directionArrow = String.fromCodePoint ( 0x1F884 );
				}
				else if ( data.direction < cfgDirection.left ) {
					document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = g_Translator.getText ( 'NoteDialog - Turn left');
					directionArrow = String.fromCodePoint ( 0x1F880 );
				}
				else if ( data.direction < cfgDirection.sharpLeft ) {
					document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = g_Translator.getText ( 'NoteDialog - Turn sharp left');
					directionArrow = String.fromCodePoint ( 0x1F887 );
				}
				else if ( data.direction < cfgDirection.sharpRight ) {
					document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = g_Translator.getText ( 'NoteDialog - Turn sharp right');
					directionArrow = String.fromCodePoint ( 0x1F886 );
				}
				else {
					document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = g_Translator.getText ( 'NoteDialog - Turn right');
					directionArrow = String.fromCodePoint ( 0x1F882 );
				}
			}
			if ( -1 === data.startStop ) {
				document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = g_Translator.getText ( 'NoteDialog - Start');
			}
			else if ( 1 === data.startStop ) {
				document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = g_Translator.getText ( 'NoteDialog - Stop');
			}
			
			var address = '';
			var showPlace = 0;
			for ( var counter = 0; counter < data.streets.length; counter ++ ) {
				if ( ( 0 === counter  || data.streets.length - 1 === counter ) && data.streets [ counter ] === '' ) {
					address += '???';
					showPlace ++;
				}
				else {
					address += data.streets [ counter ];
					showPlace --;
				}
				switch ( counter ) {
					case data.streets.length - 2:
						address += directionArrow;
						break;
					case data.streets.length - 1:
						break;
					default:
					address += String.fromCodePoint ( 0x2AA5 );
						break;
				}
			}
			if ( ! data.city && '' !== m_City ) {
				data.city = m_City;
			}
			if ( data.city ) {
				address += ' ' + require ( '../L.TravelNotes' ).config.note.cityPrefix + data.city + require ( '../L.TravelNotes' ).config.note.cityPostfix;
			}
			if ( data.place && data.place !== data.city  && showPlace !== 2 ) {
				address += ' (' + data.place + ')';
			}
			document.getElementById ( 'TravelNotes-NoteDialog-InputText-Adress').value = address;
			
			document.getElementById ( 'TravelNotes-BaseDialog-OkButton' ).style.visibility = 'visible';
			m_LatLng = data.latLng;
		};
		
		/*
		--- End of onSvgIcon function ---
		*/

		/*
		--- onErrorSvgIcon function -----------------------------------------------------------------------------------

		event handler for predefined icons list
		
		---------------------------------------------------------------------------------------------------------------
		*/
		var onErrorSvgIcon = function ( ) {
			document.getElementById ( 'TravelNotes-BaseDialog-ErrorDiv' ).innerHTML = g_Translator.getText ( 'Notedialog - an error occurs when creating the SVG icon' );
			document.getElementById ( 'TravelNotes-BaseDialog-ErrorDiv' ).classList.remove ( 'TravelNotes-BaseDialog-ErrorDivHidden' );
			document.getElementById ( 'TravelNotes-BaseDialog-OkButton' ).style.visibility = 'visible';
		};

		/*
		--- End of onErrorSvgIcon function ---
		*/

		/*
		--- onPredefinedIconListSelectChange function -----------------------------------------------------------------

		event handler for predefined icons list
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var onPredefinedIconListSelectChange = function ( changeEvent ) {

			var preDefinedIcon = g_AllButtonsAndIcons.preDefinedIconsList [ changeEvent.target.selectedIndex ];
			if ( preDefinedIcon.name === g_Translator.getText ( 'NoteDialog - SVG icon from OSM') ) {
				document.getElementById ( 'TravelNotes-BaseDialog-OkButton' ).style.visibility = 'hidden';
				require ( '../core/SvgIconFromOsmFactory' ) ( ).getPromiseSvgIcon ( note.latLng, routeObjId).then ( onSvgIcon, onErrorSvgIcon );
			}
			else{
				document.getElementById ( 'TravelNotes-NoteDialog-WidthNumberInput' ).value = preDefinedIcon.width ;
				document.getElementById ( 'TravelNotes-NoteDialog-HeightNumberInput' ).value = preDefinedIcon.height ;
				document.getElementById ( 'TravelNotes-NoteDialog-TextArea-IconHtmlContent' ).value = preDefinedIcon.icon ;
				document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = preDefinedIcon.tooltip ;
			}
		};

		/*
		--- End of onPredefinedIconListSelectChange function ---
		*/

		/*
		--- onClickEditionButton function -----------------------------------------------------------------------------

		event handler for edition with the styles buttons
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var onClickEditionButton = function ( event ) {
			if ( ! m_FocusControl ) {
				return;
			}
			var button = event.target;
			while ( ! button.htmlBefore ) {
				button = button.parentNode;
			}
			var bInsertBeforeAndAfter = button.htmlAfter && 0 < button.htmlAfter.length;
			var selectionStart = m_FocusControl.selectionStart;
			var selectionEnd = m_FocusControl.selectionEnd;
			var oldText = m_FocusControl.value;
			m_FocusControl.value = oldText.substring ( 0, selectionStart ) + 
				( bInsertBeforeAndAfter ? button.htmlBefore + oldText.substring ( selectionStart, selectionEnd ) + button.htmlAfter : button.htmlBefore ) + 
				oldText.substring ( selectionEnd );
			m_FocusControl.setSelectionRange ( 
				bInsertBeforeAndAfter || selectionStart === selectionEnd ? selectionStart + button.htmlBefore.length : selectionStart,
				( bInsertBeforeAndAfter ? selectionEnd : selectionStart ) + button.htmlBefore.length );
			m_FocusControl.focus ( );
		};	

		/*
		--- End of onClickEditionButton function ---
		*/

		/*
		--- onOpenUserDataFileInputChange function --------------------------------------------------------------------

		event handler for 
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var onOpenUserDataFileInputChange = function ( event ) {
			var fileReader = new FileReader( );
			fileReader.onload = function ( event ) {
				try {
					var newUserButtonsAndIcons = JSON.parse ( fileReader.result ) ;
					g_UserButtonsAndIcons.editionButtons = g_UserButtonsAndIcons.editionButtons.concat ( newUserButtonsAndIcons.editionButtons );
					g_UserButtonsAndIcons.preDefinedIconsList = g_UserButtonsAndIcons.preDefinedIconsList.concat ( newUserButtonsAndIcons.preDefinedIconsList );
					m_AddEditionButtons ( newUserButtonsAndIcons.editionButtons );
					m_AddPreDefinedIconsList ( );
				}
				catch ( e )
				{
				}
			};
			var fileName = event.target.files [ 0 ].name;
			fileReader.readAsText ( event.target.files [ 0 ] );
		};

		/*
		--- End of onOpenUserDataFileInputChange function ---
		*/

		/*
		--- onFocusControl function -----------------------------------------------------------------------------------

		event handler for 
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var onFocusControl = function ( event ) {
			m_FocusControl = event.target;
		};
		
		/*
		--- End of onFocusControl function ---
		*/

		/*
		--- m_AddPreDefinedIconsList function ---------------------------------------------------------------------------

		function to add the predefined icons to the select

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_AddPreDefinedIconsList = function ( ) {
			g_AllButtonsAndIcons.preDefinedIconsList = g_TravelNotesButtonsAndIcons.preDefinedIconsList.concat ( g_UserButtonsAndIcons.preDefinedIconsList );

			if ( -1 < routeObjId ) {
				g_AllButtonsAndIcons.preDefinedIconsList.push ( { name : g_Translator.getText ( 'NoteDialog - SVG icon from OSM'), icon : '', tooltip : '', width : 40, height : 40 } );
			}

			g_AllButtonsAndIcons.preDefinedIconsList.sort ( function ( a, b ) { return a.name.localeCompare ( b.name );} );
			var elementCounter = 0;
			var preDefinedIconsSelect = document.getElementById ( 'TravelNotes-NoteDialog-IconSelect' );
			for ( elementCounter = preDefinedIconsSelect.length - 1; elementCounter>= 0; elementCounter -- ) {
				preDefinedIconsSelect.remove ( elementCounter );
			}
			for ( elementCounter = 0; elementCounter < g_AllButtonsAndIcons.preDefinedIconsList.length; elementCounter ++ ) {
				var option = m_HtmlElementsFactory.create ( 'option', { text :  g_AllButtonsAndIcons.preDefinedIconsList [ elementCounter ].name } );
				preDefinedIconsSelect.add ( option );
			}
		};

		/*
		--- End of m_AddPreDefinedIconsList function ---
		*/

		/*
		--- m_AddEditionButtons function ------------------------------------------------------------------------------

		function to add buttons on the toolbar
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_AddEditionButtons = function ( editionButtons ) {
			editionButtons.forEach ( 
				function ( editionButton ) {
					var newButton = m_HtmlElementsFactory.create ( 
						'button',
						{
							type : 'button',
							innerHTML : editionButton.title || '?',
							htmlBefore : editionButton.htmlBefore || '',
							htmlAfter : editionButton.htmlAfter || '',
							className : 'TravelNotes-NoteDialog-EditorButton'
						},
						document.getElementById ( 'TravelNotes-NoteDialog-ToolbarDiv' )
					);
					newButton.addEventListener ( 'click', onClickEditionButton, false );
				}
			);
		};

		/*
		--- End of m_AddEditionButtons function ---
		*/
		
		/*
		--- m_CreateBaseDialog function -------------------------------------------------------------------------------

		Creation of the base dialog
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreateBaseDialog = function ( ) {
		
			// the dialog base is created
			m_BaseDialog = require ( '../UI/BaseDialog' ) ( );
			m_BaseDialog.title = g_Translator.getText ( 'NoteDialog - Note' );
			m_BaseDialog.addClickOkButtonEventListener ( onOkButtonClick );

			m_NoteDataDiv = m_HtmlElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-NoteDialog-MainDataDiv'
				},
				m_BaseDialog.content
			);
		};
		
		/*
		--- End of m_CreateBaseDialog function ---
		*/

		/*
		--- m_CreateToolbar function -------------------------------------------------------------------------------

		Creation of the toolbar 
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreateToolbar = function ( ) {
			var toolbarDiv = m_HtmlElementsFactory.create ( 
				'div',
				{ 
					className : 'TravelNotes-NoteDialog-ToolbarDiv',
					id : 'TravelNotes-NoteDialog-ToolbarDiv'
				},
				m_NoteDataDiv
			);
			
			// a select is added for the predefined icons
			var preDefinedIconsSelect = m_HtmlElementsFactory.create (
				'select',
				{
					className : 'TravelNotes-NoteDialog-Select',
					id : 'TravelNotes-NoteDialog-IconSelect'
				},
				toolbarDiv
			);
			
			// change event listener on the select
			preDefinedIconsSelect.addEventListener ( 'change', onPredefinedIconListSelectChange, false );
			

			// open userdata button ... with the well know hack to hide the file input ( a div + an input + a fake div + a button )
			var openUserDataFileDiv = m_HtmlElementsFactory.create ( 
				'div', 
				{ 
					id: 'TravelNotes-NoteDialog-OpenEditorFileDiv'
				}, 
				toolbarDiv 
			);
			var openUserDataFileInput = m_HtmlElementsFactory.create ( 
				'input',
				{
					id : 'TravelNotes-NoteDialog-OpenEditorFileInput', 
					type : 'file',
					accept : '.json'
				},
				openUserDataFileDiv
			);
			openUserDataFileInput.addEventListener ( 'change', onOpenUserDataFileInputChange, false );
			var openUserDataFileFakeDiv = m_HtmlElementsFactory.create ( 
				'div', 
				{ 
					id: 'TravelNotes-NoteDialog-OpenStyleFakeDiv'
				}, 
				openUserDataFileDiv 
			);
			var openUserDataFileButton = m_HtmlElementsFactory.create ( 
				'button', 
				{ 
					id : 'TravelNotes-NoteDialog-OpenEditorFileButton', 
					className: 'TravelNotes-NoteDialog-EditorButton', 
					title : g_Translator.getText ( 'NoteDialog - Open a configuration file' ), 
					innerHTML : '&#x23CD;'
				}, 
				openUserDataFileFakeDiv 
			);
			
			openUserDataFileButton.addEventListener ( 'click' , function ( ) { openUserDataFileInput.click ( ); }, false );
			
			// personnalised buttons from server file are restored
			m_AddEditionButtons ( g_TravelNotesButtonsAndIcons.editionButtons );
			
			// personnalised buttons from local file are restored
			m_AddEditionButtons ( g_UserButtonsAndIcons.editionButtons );

			m_AddPreDefinedIconsList ( );
		};
		
		/*
		--- End of m_CreateToolbar function ---
		*/

		/*
		--- m_CreateIconDimensions function ---------------------------------------------------------------------------

		Creation of icon dimensions...
		
		---------------------------------------------------------------------------------------------------------------
		*/
		var m_CreateIconDimensions = function ( ) {
			var iconDimensionsDiv = m_HtmlElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-NoteDialog-DataDiv',
					id : 'TravelNotes-NoteDialog-DimensionsDataDiv'
				},
				m_NoteDataDiv
			);
			
			// ... width ...
			m_HtmlElementsFactory.create (
				'text',
				{
					data : g_Translator.getText ( 'NoteDialog - Icon width'),
				},
				iconDimensionsDiv
			);
			var widthInput =  m_HtmlElementsFactory.create (
				'input',
				{
					type : 'number',
					className : 'TravelNotes-NoteDialog-NumberInput',
					id : 'TravelNotes-NoteDialog-WidthNumberInput'
					
				},
				iconDimensionsDiv
			);
			widthInput.value = note.iconWidth;
			
			// ... and height
			m_HtmlElementsFactory.create (
				'text',
				{
					data : g_Translator.getText ( 'NoteDialog - Icon height'),
				},
				iconDimensionsDiv
			);
			var heightInput =  m_HtmlElementsFactory.create (
				'input',
				{
					type : 'number',
					className : 'TravelNotes-NoteDialog-NumberInput',
					id : 'TravelNotes-NoteDialog-HeightNumberInput'
				},
				iconDimensionsDiv
			);
			heightInput.value = note.iconHeight;
		};

		/*
		--- End of m_CreateIconDimensions function ---
		*/

		/*
		--- m_CreateIconContent function ---------------------------------------------------------------------------

		Creation of icon content
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreateIconContent = function ( ) {
			m_HtmlElementsFactory.create ( 
				'div',
				{ 
					className : 'TravelNotes-NoteDialog-TitleDiv',
					id : 'TravelNotes-NoteDialog-IconContentTitleDiv',
					innerHTML : g_Translator.getText ( 'NoteDialog - Icon content' )
				},
				m_NoteDataDiv
			);
			var iconHtmlContent = m_HtmlElementsFactory.create ( 
				'textarea',
				{ 
					className : 'TravelNotes-NoteDialog-TextArea',
					id: 'TravelNotes-NoteDialog-TextArea-IconHtmlContent'
				},
				m_NoteDataDiv
			);
			iconHtmlContent.addEventListener ( 'focus', onFocusControl, false );
			iconHtmlContent.value = note.iconContent;
		};
		
		/*
		--- End of m_CreateIconContent function ---
		*/

		/*
		--- m_CreatePopupContent function ---------------------------------------------------------------------------

		Creation of popup content
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreatePopupContent = function ( ) {
			m_HtmlElementsFactory.create ( 
				'div',
				{ 
					className : 'TravelNotes-NoteDialog-TitleDiv',
					innerHTML : g_Translator.getText ( 'NoteDialog - Text' )
				},
				m_NoteDataDiv
			);
			var popUpContent = m_HtmlElementsFactory.create ( 
				'textarea',
				{ 
					className : 'TravelNotes-NoteDialog-TextArea',
					id: 'TravelNotes-NoteDialog-TextArea-PopupContent'
				},
				m_NoteDataDiv
			);
			popUpContent.addEventListener ( 'focus', onFocusControl, false );
			popUpContent.value = note.popupContent;
		};
		
		/*
		--- End of m_CreatePopupContent function ---
		*/

		/*
		--- m_CreateTooltipContent function ---------------------------------------------------------------------------

		Creation of tooltip content
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreateTooltipContent = function ( ) {
			m_HtmlElementsFactory.create ( 
				'div',
				{ 
					className : 'TravelNotes-NoteDialog-TitleDiv',
					innerHTML : g_Translator.getText ( 'NoteDialog - Tooltip content' )
				},
				m_NoteDataDiv
			);
			var tooltip = m_HtmlElementsFactory.create ( 
				'input',
				{ 
					type : 'text',
					className : 'TravelNotes-NoteDialog-InputText',
					id: 'TravelNotes-NoteDialog-InputText-Tooltip'
				},
				m_NoteDataDiv
			);
			tooltip.addEventListener ( 'focus', onFocusControl, false );
			tooltip.value = note.tooltipContent;
		};
		
		/*
		--- End of m_CreateTooltipContent function ---
		*/

		/*
		--- m_CreateAddressContent function ---------------------------------------------------------------------------

		Creation of address content
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreateAddressContent = function ( ) {
			m_HtmlElementsFactory.create ( 
				'div',
				{ 
					className : 'TravelNotes-NoteDialog-TitleDiv',
					innerHTML : '<span id=\'TravelNotes-NoteDialog-Reset-Address-Button\'>&#x1f504;</span>&nbsp;' + g_Translator.getText ( 'NoteDialog - Address&nbsp;:' )
				},
				m_NoteDataDiv
			);
			document.getElementById ( 'TravelNotes-NoteDialog-Reset-Address-Button' ).addEventListener ( 
				'click', 
				function ( ) { address.value = m_Address; },
				false 
			);
			
			var address = m_HtmlElementsFactory.create ( 
				'input',
				{ 
					type : 'text',
					className : 'TravelNotes-NoteDialog-InputText',
					id: 'TravelNotes-NoteDialog-InputText-Adress'
				},
				m_NoteDataDiv
			);
			address.addEventListener ( 'focus', onFocusControl, false );
			address.value = note.address;
			
			// geolocalization
			require ( '../core/GeoCoder' ) ( ).getPromiseAddress ( note.lat, note.lng ).then ( onGeocoderResponse );
		};
		
		/*
		--- End of m_CreateAddressContent function ---
		*/

		/*
		--- m_CreateLinkContent function ------------------------------------------------------------------------------

		Creation of link content
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreateLinkContent = function ( ) {
			m_HtmlElementsFactory.create ( 
				'div',
				{ 
					className : 'TravelNotes-NoteDialog-TitleDiv',
					innerHTML : g_Translator.getText ( 'NoteDialog - Link' )
				},
				m_NoteDataDiv
			);
			var link = m_HtmlElementsFactory.create ( 
				'input',
				{ 
					type : 'text',
					className : 'TravelNotes-NoteDialog-InputText',
					id: 'TravelNotes-NoteDialog-InputText-Link'
				},
				m_NoteDataDiv
			);
			link.addEventListener (
				'focus',
				function ( event ) {
					m_FocusControl = null;
				},
				false
			);
			link.value = note.url;
		};
		
		/*
		--- End of m_CreateLinkContent function ---
		*/

		/*
		--- m_CreatePhoneContent function -----------------------------------------------------------------------------

		Creation of phone content
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreatePhoneContent = function ( ) {
			m_HtmlElementsFactory.create ( 
				'div',
				{ 
					className : 'TravelNotes-NoteDialog-TitleDiv',
					innerHTML : g_Translator.getText ( 'NoteDialog - Phone' )
				},
				m_NoteDataDiv
			);
			var phone = m_HtmlElementsFactory.create ( 
				'input',
				{ 
					type : 'text',
					className : 'TravelNotes-NoteDialog-InputText',
					id: 'TravelNotes-NoteDialog-InputText-Phone'
				},
				m_NoteDataDiv
			);
			phone.addEventListener ( 'focus', onFocusControl, false );
			phone.value = note.phone;
		};
		
		/*
		--- End of m_CreatePhoneContent function ---
		*/

		/*
		--- m_LoadIconsAndButtons function ----------------------------------------------------------------------------

		loading predefined icons and buttons
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_LoadIconsAndButtons = function ( ) {
			if ( 0 === g_TravelNotesButtonsAndIcons.preDefinedIconsList.length ) {
				var buttonsHttpRequest = new XMLHttpRequest ( );
				buttonsHttpRequest.onreadystatechange = function ( event ) {
					if ( this.readyState === buttonsHttpRequest.DONE ) {
						if ( this.status === 200 ) {
							try {
								g_TravelNotesButtonsAndIcons = JSON.parse ( this.responseText );
								m_AddEditionButtons ( g_TravelNotesButtonsAndIcons.editionButtons );
								g_TravelNotesButtonsAndIcons.preDefinedIconsList.push ( { name : '', icon : '', tooltip : '', width : 40, height : 40 } );
								m_AddPreDefinedIconsList ( );
							}
							catch ( e )
							{
								console.log ( 'Error reading TravelNotesNoteDialog.json' );
							}
						} 
						else {
							console.log ( 'Error sending request for TravelNotesNoteDialog' + require ( '../L.TravelNotes' ).config.language.toUpperCase ( ) + '.json' );
						}
					}
				};
				buttonsHttpRequest.open ( 
					'GET',
					window.location.href.substr (0, window.location.href.lastIndexOf( '/') + 1 ) +'TravelNotesNoteDialog' + require ( '../L.TravelNotes' ).config.language.toUpperCase ( ) + '.json',
					true
				);
				buttonsHttpRequest.send ( null );
			}
		};
		
		/*
		--- End of m_LoadIconsAndButtons function ---
		*/

		/*
		--- Main function ----------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		m_CreateBaseDialog ( );
		m_CreateToolbar ( );
		m_CreateIconDimensions ( );
		m_CreateIconContent ( );
		m_CreatePopupContent ( );
		m_CreateTooltipContent ( );
		m_CreateAddressContent ( );
		m_CreateLinkContent ( );
		m_CreatePhoneContent ( );
		m_LoadIconsAndButtons ( );
		
		// and the dialog is centered on the screen
		m_BaseDialog.center ( );
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = NoteDialog;
	}

}());

/*
--- End of NoteDialog.js file -----------------------------------------------------------------------------------------
*/	
},{"../L.TravelNotes":8,"../UI/BaseDialog":10,"../UI/Translator":26,"../core/GeoCoder":33,"../core/NoteEditor":35,"../core/SvgIconFromOsmFactory":39,"./HTMLElementsFactory":16}],21:[function(require,module,exports){
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

/*
--- ProvidersToolbarUI.js file -----------------------------------------------------------------------------------------
This file contains:
	- the providersToolbarUI object
	- the module.exports implementation
Changes:
	- v1.4.0:
		- created
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var g_TravelNotesData = require ( '../L.TravelNotes' );
	
	/*
	--- onProviderButtonClick function --------------------------------------------------------------------------------

	click event listener for the providers button

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onProviderButtonClick = function ( clickEvent ) {
		
		clickEvent.stopPropagation ( );

		g_TravelNotesData.routing.provider = clickEvent.target.provider;

		document.getElementsByClassName ( 'TravelNotes-Control-ActiveProviderImgButton' ) [ 0 ].classList.remove ( 'TravelNotes-Control-ActiveProviderImgButton' );
		clickEvent.target.classList.add ( 'TravelNotes-Control-ActiveProviderImgButton' ); 

		// activating the transit mode buttons, depending of the capabilities of the provider
		var provider = g_TravelNotesData.providers.get ( clickEvent.target.provider );
		if ( provider.transitModes.car ) {
			document.getElementById ( 'TravelNotes-Control-carImgButton' ).classList.remove ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		else {
			document.getElementById ( 'TravelNotes-Control-carImgButton' ).classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		if ( provider.transitModes.bike ) {
			document.getElementById ( 'TravelNotes-Control-bikeImgButton' ).classList.remove ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		else {
			document.getElementById ( 'TravelNotes-Control-bikeImgButton' ).classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		if ( provider.transitModes.pedestrian ) {
			document.getElementById ( 'TravelNotes-Control-pedestrianImgButton' ).classList.remove ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		else {
			document.getElementById ( 'TravelNotes-Control-pedestrianImgButton' ).classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		if ( provider.transitModes.train ) {
			document.getElementById ( 'TravelNotes-Control-trainImgButton' ).classList.remove ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		else {
			document.getElementById ( 'TravelNotes-Control-trainImgButton' ).classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		
		if ( ! g_TravelNotesData.providers.get ( clickEvent.target.provider ).transitModes [ g_TravelNotesData.routing.transitMode ] ) {
			if ( provider.transitModes.bike ) {
				document.getElementById ( 'TravelNotes-Control-bikeImgButton' ).click ( );
			}
			else if ( provider.transitModes.pedestrian )  {
				document.getElementById ( 'TravelNotes-Control-pedestrianImgButton' ).click ( );
			}
			else if ( provider.transitModes.car )  {
				document.getElementById ( 'TravelNotes-Control-carImgButton' ).click ( );
			}
			else if ( provider.transitModes.train )  {
				document.getElementById ( 'TravelNotes-Control-trainImgButton' ).click ( );
			}
		}
		
		require ( '../core/RouteEditor' ) ( ).startRouting ( );
	};

	/*
	--- onClickTransitModeButton function -----------------------------------------------------------------------------

	click event listener  for the transit modes buttons

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickTransitModeButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );

		g_TravelNotesData.routing.transitMode = clickEvent.target.transitMode;

		document.getElementsByClassName ( 'TravelNotes-Control-ActiveTransitModeImgButton' ) [ 0 ].classList.remove ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
		clickEvent.target.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );

		require ( '../core/RouteEditor' ) ( ).startRouting ( );
	};
	
	/*
	--- providersToolbarUI function -----------------------------------------------------------------------------------

	This function returns the providersToolbarUI object

	-------------------------------------------------------------------------------------------------------------------
	*/

	var providersToolbarUI = function ( ) {
		
		var m_ButtonsDiv = null;
		var m_HtmlElementsFactory = require ( '../UI/HtmlElementsFactory' ) ( );
		var m_activeButton = false;
		var m_BikeButton = null;
		var m_PedestrianButton = null;
		var m_CarButton = null;
		var m_TrainButton = null;
		
		/*
		--- m_createProviderButton function -------------------------------------------------------------------------

		This function creates a provider button

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_createProviderButton = function ( provider ) {
			
			var providerButton = m_HtmlElementsFactory.create (
				'img',
					{ 
						src : "data:image/png;base64," + provider.icon,
						id : 'TravelNotes-Control-'+ provider.name + 'ImgButton', 
						className : 'TravelNotes-Control-ImgButton',
						title : provider.name
					},
				m_ButtonsDiv
			);
			providerButton.provider = provider.name.toLowerCase ( );
			providerButton.addEventListener ( 'click', onProviderButtonClick, false );
			// when loading the control, the first provider will be the active provider
			if ( ! m_activeButton ) {
				providerButton.classList.add ( 'TravelNotes-Control-ActiveProviderImgButton' );
				g_TravelNotesData.routing.provider = providerButton.provider;
				m_activeButton = true;
				
				// ... and the first possible transit mode will be the active transit mode
				if ( provider.transitModes.bike ) {
					m_BikeButton.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
					g_TravelNotesData.routing.transitMode = 'bike';
				} else if ( provider.transitModes.pedestrian ) {
					m_PedestrianButton.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
					g_TravelNotesData.routing.transitMode = 'pedestrian';
				} else if ( provider.transitModes.car ) {
					m_CarButton.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
					g_TravelNotesData.routing.transitMode = 'car';
				} else if ( provider.transitModes.train ) {
					m_TrainButton.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
					g_TravelNotesData.routing.transitMode = 'train';
				} 
				
				// deactivating transit mode buttons if not supported by the provider
				if ( ! provider.transitModes.car ) {
					m_CarButton.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
				}
				if ( ! provider.transitModes.pedestrian ) {
					m_PedestrianButton.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
				}
				if ( ! provider.transitModes.bike ) {
					m_BikeButton.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
				}
				if ( ! provider.transitModes.train ) {
					m_TrainButton.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
				}
			}
		};


		/*
		--- m_createProvidersButtons function -------------------------------------------------------------------------

		This function creates the providers buttons

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_createProvidersButtons = function ( ) {
			if ( g_TravelNotesData.providers ) {
				m_activeButton = false;
				g_TravelNotesData.providers.forEach ( m_createProviderButton );
			}
		};
		
		/*
		--- m_createTransitModesButtons function ----------------------------------------------------------------------

		This function creates the transit modes buttons

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_createTransitModesButtons = function ( ) {
			m_BikeButton = m_HtmlElementsFactory.create (
				'img',
					{ 
						src : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AoaESkaC0SxrgAABMdJREFUSMfNl1loVGcYhp//n+WcZmbiJE4WjVKVaLWOGxglilFTSmYUF1ILKiIILSjplQiKS65EXG4UvBGrQvVCUAdjoRrEGmtwjQbtWKlpEsTGGDMxkzKTzHr+XiRucbK4ts/lOd/5X853vuU9gj4YN+48Dx58DUBOzrmhnZ0qXykWJBKqKJlkYjyusgAsFtFqMnHPbBa/CcEvaWnir5YWT1vvM3ojUl2cPv1XamqK8fv/MBcWPtwfDhuLlWKYUvSLECAEzTabPHP16uc/uN1fJp6fNShhpRROZ+WSzk7jVDyuTLwDFotIpqXJb4LBkgohRP/Cbvc5/H6krhsnolFVOtAbDoQQoGnCF4nIb91uDL/f8+KefDXQ70e6XOpIJPL+ot2Zg0hElbpc6ojf/7qWBPB6q1FKoevqRCBgrOYDEwgYq3VdnVBK4fVWd2cjL6+SpqYSnM5zi4PBZAUfEafTtCQY9JzJy6tENjWVsH79ZWs4bJziIxMOG6fWr79sbWoq6S4uTTt7MBo1vuMToGnyx2jU+71ITz/rCoWM3w2D3AFKBUj0NIL5nYWl5IndLidJw2CsUgOJwtSp6SQSC7h5czZO50vhIUPMTJrkYMIEO8OHa4Op9FzDYKyUEs9gWqelJUpbm8GcOdcJBmOAARjEYgZFRUOoqZnNyJGDEkZKPOZIRM0bTIricUU8blBePhaQKAXJZBzDUMyYkcnly21cvx7sPRpSEomoeWZgQv9hSUAxYoSD8+efsmdPIxkZVgBMJrDZTKxdO4YLF56Sm/sZT5509jzX76SdYI7FurdMKoqKMti8eQyZmVakFOTkaGzaFGP79gZCoSSaJpk82UFl5VN2727k+PEpxGIGHR0Jdu5s4Natf1KeG4uprD7Lc86cDPbuHc/y5Xd4/DhKa+tXNDZ2cfJkC9euFXLw4EMMA6ZNG8KOHfUcPjyZKVPSWbnyNg0NEXy+aaxadYcbN1KLS6tVtKZK75YtY1ix4i51dZ0sWpTF3bshurqSZGdruN3VLFyYS3HxUEKhJAsXZpGbq1Faeovt28dz716IpUtvs21bfs+neh2rVbSagftAVu+edTotdHUl0XVJdraV+fOvcejQJPLzbSj1lHXr/GiapL09gc83lWg0ycyZDk6ffozNZiIUSpKdbe3p/ze4LzVNVKVIBJcuteHxuOjqSrJvXyNpaSaKi134fM2AoL6+C6/Xxf79X7Bx45/Y7RZ27XpIeXkdoVCcuXMzuXIldZVrmqgSdvvZwnDYuNK7l9PTzVRVzUAIQV1dmLlzh7Jhw32OHm16ZY0r8vPTSCQUXm8WW7fmc/p0C263g5wcK7NmXePZs/gbO9pmk7MGGJkJvN5cRo9O4+efW3j0KNKXaQEMJk50sGzZMOrrwxw79nfKlno+MgexJFR/Lumt458vCQlQVmYvs1hEgj79oHiLNdB3vMUiEmVl9rL/3gh4vdW0t5ec0XXp+1iiui597e0lZ7zeal4YgZecky6XOvKhfZfLJX8KBMQa8BgpXabbjREIiDW6LnxCvL+gEKDrwhcIiDVuN8b/wtCnXJ4FBRfp6PBU1NaO0h0OeUBKmgeTASFASpodDnmgtnaU3tHhqSgouDj4f6dP8dP2L6C7Ld6Z4dDBAAAAAElFTkSuQmCC",
						id : 'TravelNotes-Control-bikeImgButton', 
						className : 'TravelNotes-Control-ImgButton'
					},
				m_ButtonsDiv
			);
			m_BikeButton.transitMode = 'bike';
			m_BikeButton.addEventListener ( 'click', onClickTransitModeButton, false );
			
			m_PedestrianButton = m_HtmlElementsFactory.create (
				'img',
					{ 
						src : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AoaESo7bADyMwAABNlJREFUSMe1V19oU1cY/52Te5Ob3DR/SfzTNNCufxRXxmarONCnPbi+ykYrFdRSkeJLX5ykZcKcFfG5oIJ2Y2sVFZQ+iPoiUhC128OIiJrUlgQTm9o0t23SJufmnj2k2ura5syx7ynknu/7nd93vr8E6wghBJxzAEAgAEsmc3pToWD1y3L6M8NQfABA6eIUY54xs3kh5Xb3JONx5D/WXdX2Wh9crkPIZAbAOVBRcbpvYaHuO87lDZyTCs7lFaochDAQwucANmmzRa7PzfWECFm2IQTsdrdiZuYqHI5quVg80J7P113WdR+AIsTEBEmagsUSOayq539PpVLM5WpFJnO1POOtW+GMRH4dKRa9jZxTABz/TggIMSDLU+Fg8NDuaBTaxyfoux8ORxsAwG7vrI5Ehl7pur+Rc/IJoCX3c05QKGxsnJgYemW3d1avxPgH42AQzkRi6JWuOz3ljReX7k3KnpQkLb158/6aWGyZOS0F0kF4vX45mRwY0XV3WdCGBhsePvwa3d1BAEZZYF13e5LJgRGv1y87nQdLjCmlMAwDqvrj4Wx2x6XyDAw8eLADe/b4AQCqehu5nJj7bbYnHbncT5cppaCGYYBzIJ+vu7TiydcNnP7+GBKJRQwPJ5HL6YLvTlEo1F3iHDAMo4Rkt5/qK6UMFwK+du0NurvDePt2EQ0NdkE9Dl33wW4/1QcApKoKltevrz01DLVWNGKbmhwYHd1dCrEiR0vLY9y7Ny0UaJRmo5WV339OZ2b6NgGyXzRRVFXC4OCXKwwBd+/uRH//VkHmsn9mpm8TZUzxcU4comzb2zciEFCg6yWQZ8/mcOJEGF1dNaivV8tb4MTBmOKjkpSuLdXe8lJZacb5819g374/QEiphJpMBGfPvlxiTwSAZUjSdC0tdZnyCiYTwfBwMx49SuPOnSkA7P3/7/QZM4SC0zCsPkn0bX0+GU+eTCMUGgNAcO7cGEwmCbOzFITI2Lv3ESYmFsWruar2tmWzu4bEjhtLxY4jn/8G2ayByck8mpsfY36+CPEAfbif6ronSggTLgKAgQsXtmF+nuLIkTC2bHGhpcUj3EwIYdB1b5TK8uIUIXxW9LbBoBXt7VW4ciWOGzeSuHnzNQYHvxJ3MeGzZvPiFHW7Q0mApcTUiujtrYHVChw79hyAjOPHX6JYJLh4cZtQwyCEpVyuUJLG48hbrS+uA6aySvX1Kjo7q9HV9fS9a6PRHG7dSqCtLYBAwFp2OlGUF9fjceRJKbcAWf6N67p3zbciBBgZ2Ym6OjsaGh4gk1luDmYzQT7/LUKhZzhzZnyN0kkgSdNg7AAhBKCUUhACWCyRjvVc1dxcgV273Dh58jkymQ+DsVAwcPToX1AUsm5GmM2RjiXQ0tVcroMAbsvZ7Nk/GdvYuNoF/H4ZGzZYEA7PrcpIUSgoBXI5Y9VskOU3Yafzh+2MtTBN++W/jD7iIklauqpqf834+Eejz7tBLBaDpij3myRJS4sNBeXzXpK0tKLcbxofh+Z0tq0/3tbWwhmLDYww5vv/x9vlDaIV0Sg0jye03WYbPSxJ0xBJtQ8H+mlus412eDwntkej0Fyu1k9dYX7uW1ioX3OFoZQB4HOEsEmr9RNXmLWWtspKWDRt9aVN1z1jsryQcjh6komE2NL2N0SHF0QJfjNNAAAAAElFTkSuQmCC",
						id : 'TravelNotes-Control-pedestrianImgButton', 
						className : 'TravelNotes-Control-ImgButton'
					},
				m_ButtonsDiv
			);
			m_PedestrianButton.transitMode = 'pedestrian';
			m_PedestrianButton.addEventListener ( 'click', onClickTransitModeButton, false );
			
			m_CarButton = m_HtmlElementsFactory.create (
				'img',
					{ 
						src : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AoaESgBmDpJAwAABQBJREFUSMe9V09MFFcY/703szOz7PLP2WVBV6rtdm21HqhG2wiCh8bL2jWhsl71IhqJJ4oHL4RIxKP1HzESLh4MEGPkoAeNYRWtGkPShGRF+aeFld2psd0BZnZmXg+LW4SdrW3EX/Iub775fe/7977vEdigrCyMmZnrAABZbvGoavkGSh0hy3LtNAzuS57nZAAwTVPhOHOEUnXAstL9Ltd0TFFOJ5dyLAXJtSnLMhRFwaNHoDt3nj2v66vDjHHljDkAsIXf2CKKzB4haRBixgVh6vrAwNEj27bB8ng8SCaTH6aYMcDtPh3StM/6DKNIACz8N1Dw/J+6KI7Xp1It/YTkkliEwsJmnD8PIopdvbOzX90wDPf/UAoAFgzDLczOfn1Dkrp6T5wAKSpqtre4tRXk5MkLV3W9ch8+IgRhsqel5XCkrS0bn4xiWZaRTCqQpK5eTfPVYwUgiq/75ucP/uT1ZmJOvd4wFEWBy9UR0nXPiigFAF331LtcHaFkMomysnDG4mgUdNeuq3OZmK4ceD6lP34ccVZVwSIZN5y9qGlfHLJPJAa/X4LbzeUlnp21MDk5Z1csAChE8XmnpjU1Eln+2fPmzXe/WZZYbkcoyxympn6AaaahKCrIkvpgjKGkpACSJCAQuI2JibR9oVEtXlz862ZeVSs2MMaV57NkzRoHBIFi06aHGB5+m/XC4sIIBAoxMrILfr+YVzFjXPncXPkGSikfytxIeapyIQKHDlUAAIJBN3p7t+Lata0IBt0AGBobVy/IsrxcjDlACL+Htyx3zT+nz3GnEqCyUkJ39wSOHYvh7t1vUVvrz37fu3cNotHfUVs7BElywO+XAKj5VIMxdw01TS5onwwWHjzYjp6ebaiokFBdXYJUSl8mNT9voq6uBH6/hO7uLXjy5HtQamsKTJMLUo7j5NwWMxw44Mf27TIKCnjs3u1DNFqDVGq5bDJp4M6dHQiHV6OggMeWLaU4enQt7Hg5jltF88WjqIjPNo13aGj4fJnc/v3r32swAFBcnD9vqGmaSm5XE5w58xINDYMgBKiru4ebN+NIpxlGR1WMjWXW6KgKTbMwOKigunoAhACHDz/CqVNjsOM1TVPhBOHHsGG4KnOfK41z577BunWFcDgscByDzyfh9u04Xr5UMTmZWT6fhFevVAQCBaiqKkVpKYfLl6fzNI3UEE9pKgr4duSOB0EqZQAAVNXAyIiKp0/fgudJ1qWEAJcujYEQAll2LMiaiwaG5ZyEpKK8ZRn9hKSPM8bnul3R1TWJUGgtLlyYwtDQX3njtn69E01NQVy58gqMEZvyTIMxo586ndMxQsy4Hdn4eBr37ycwPj6/YIH9mprScO9eAs+eaXnuBTPudE7HFprELxc1LZCnSVhLh5W804e9LIUgPO/U9aZGAgDDw6CbN1+dM82VbYscl9JjsYgzEIBFy8rC2LgRlihO1BNirphSQkyI4nh9IAArOwh4vV7MzCQ+7egDAIlEAoQAra0H9wnCRM/HVioIEz2trQf3EYLsjP1eFrS3N7Pjx49ERPF138dwe8a9r/va2o5E2tub2QcO9B0hTVv3aQb6d/B4ZKhqS/+tWxGnJL3opFSLE2IsOifJcXYCQgxQqsUl6UXn4GDEqaot/V6v58PfTpmECyORWPpo4/dYlrvGMLggz3OrFh5tf1BqPuO4VNSyjBsuVzymKB3/+mj7G1dPIltjqpC6AAAAAElFTkSuQmCC",
						id : 'TravelNotes-Control-carImgButton', 
						className : 'TravelNotes-Control-ImgButton'
					},
				m_ButtonsDiv
			);
			m_CarButton.transitMode = 'car';
			m_CarButton.addEventListener ( 'click', onClickTransitModeButton, false );
			
			m_TrainButton = m_HtmlElementsFactory.create (
				'img',
					{ 
						src : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4goTCiEjvCsRvgAABXRJREFUSMe9V11MFFcU/u7MsDPLrgvu7A80BEhLsRIxEFIlcSXBF41BN2ExqC8kPHQraV80iA+GhKAYaLUihkLaaErig1FCiCZq2kQDjS0YfcGYQKtBg7DL7hbFHdaZnTu3D0tR7C7aRvxeJrn3zP3O3z3nXIIUcLm8mJ0dBADIcpNDUbLWcVxalWFYKnSd/1QQeBkAKKURnqd/cJwyZBjxqxbLzHgk0hF+84w3QZItyrKMSCSC0VFwFRVnuzXtIy9jfBZjaQDY4m/stSMSa4TEQQgNmEzTg0NDXzVs2gTD4XAgHA6/GzFjgNXaUaWqef26bjMBBv4bOAjCvCaKk75otOkqIckkXsOaNY3o7gYRxXOXFxY+u6Lr1v9BCgAGdN1qWlhYf0WSzl0+ehTEZmtMbXFLC8jx499f1LTcPXiPMJmeXGpqOlDb2roUnwSxLMsIhyOQpHOXVdXtwypAFIP9L1/W1zidiZhzTqcXkUgEFkt7laY5VoUUADTN4bNY2qvC4TBcLm/C4uFhcJWVF2OJmK4eBCGq3blTay4thUESbjjbo6qf+JMlks3GYX7egNfrgtv9A+bn55Geng673Y7du3eD0iL4/ffx6JECm03A3JwOxlJnuyj+2auqX3/Jy/Jhh6Ks72SMtyZPDAJNY9i40Yq+vi9QU1OD6elp5OXlIRgMorp6C4qL14BSBkWhCAY1CAJgJL0MDIyl52Rm5v8kKEr2Osb4rJQXw0iob7ebMDIygvLy8qW9/Px89PT0oKSkBGfOfItTpwK4fz8KWU5DMBhH8hrBZ8ViWes4jhOqEhUpORwOEW63Cdu2CSgvL8fY2BgYY2CMobOzEzt27IDD4UBnZydevEi42WYTUp7HWBoIEXYJhmHd+qr8/Rvd3RuQns5j374NOH/+PLKzs9HX1wdCCOx2O+rq6pCTkwNN00AIQSCgYnx8AUAsFTUYs24VKOULl9fe5XjyJIbm5s9x4sQJlJSUwO12g1KaUtHe3l7k5lbg3r35FBIElPKFHM/z8koWHzu2BUNDQ7h27RpKS0tXJAUAv9+Pykr7ChIMPM/bhbfdPb/fj4GBAfT39y+tud1ubN68GRkZGQiFQpiamsKzZ8+gKApisRhGR/sAFK18pymlEYA4U1lNKUVlZSUuXLiA7du3w25fbg1J0nri8Tiam39ewdU0IvA8nYjHmTOVZnv37kVhYSE8Hg/YYmX45zs5OYmZmRmUlZVBkqTF0qhB1/W3uJpOcBwXHU7RlgEA1dXV4HkegiDgwIEGdHR8A13XQQjBxMQEPB4P2tvbl+T379+PgwcPrUBMQEh0mEjSd1tU9eNfGUse7p07HcjOlvD0aRPMZjMGBgaW9nw+HyoqKqAoCjRNA6UUU1NTuH79OmZmfkxOS3SI4iMPWbv2sOP58/IxwxBTVi9CgPr6HITDzXC5XJAkCV1dXSltOnToF5w8qSav1pwayMj4vViYm+sIi2LXoKoWJG0SZjOBIHAoK7OB484gM/M31NXV4e7du7h5U0Ju7gzM5hhu3bqFkZEReDzHcfr0wgoj0dPBubmOMAGABw/AFRdfjFG6um2R56Pa+HituaAABudyeVFUBEMUH/sIoatGSgiFKE76CgpgLA0CTqcTs7OhDzv6AEAoFAIhQEtL/R6T6fGl901qMj2+1NJSv4cQLM3Yy8bbtrZGduRIQ60oBvvfh9sT7g32t7Y21La1NbJ3HOjbq1Q1/8MM9K+avwxFabp640atWZIe9nKcGiBEf01PkkR3AkJ0cJwakKSHvbdv15oVpemq0+l497dTIuG8CIXefLQJuwzDulXX+UJB4O2LTeQvjqMTPB8dNgz9isUSGI9E2t/6aPsbwfNWty4y/a8AAAAASUVORK5CYII=",
						id : 'TravelNotes-Control-trainImgButton', 
						className : 'TravelNotes-Control-ImgButton'
					},
				m_ButtonsDiv
			);
			m_TrainButton.transitMode = 'train';
			m_TrainButton.addEventListener ( 'click', onClickTransitModeButton, false );

		};

		/*
		--- m_CreateUI function ---------------------------------------------------------------------------------------

		This function creates the UI

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreateUI = function ( controlDiv ) {

			m_ButtonsDiv = m_HtmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-ItineraryButtonsDiv', className : 'TravelNotes-Control-ButtonsDiv' }, controlDiv );

			m_createTransitModesButtons ( );
			m_createProvidersButtons ( );
		
		};
		
		/*
		--- m_SetProvider function ------------------------------------------------------------------------------------

		This function set the provider

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SetProvider = function ( providerName ) {
			 var button = document.getElementById ( 'TravelNotes-Control-'+ providerName + 'ImgButton' );
			 if ( button ) {
				 button.click ( );
			 }
		
		};
		
		/*
		--- m_SetProvider function ------------------------------------------------------------------------------------

		This function set the transit mode

		---------------------------------------------------------------------------------------------------------------
		*/
		var m_SetTransitMode = function ( transitMode ) {
			var button = document.getElementById ( 'TravelNotes-Control-' + transitMode + 'ImgButton' );
			 if ( button ) {
				 button.click ( );
			 }
		};
		
		/* 
		--- providersToolbarUI object ---------------------------------------------------------------------------------
		
		---------------------------------------------------------------------------------------------------------------
		*/
		
		return Object.seal (
			{
				
				createUI : function ( controlDiv ) { m_CreateUI ( controlDiv ); },
				
				get provider ( ) { return g_TravelNotesData.routing.provider; },
				set provider ( providerName ) { m_SetProvider ( providerName ); },
				
				get transitMode ( ) { return g_TravelNotesData.routing.transitMode; },
				set transitMode ( transitMode ) { m_SetTransitMode ( transitMode ); }
			}
		);
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = providersToolbarUI;
	}

}());

/*
--- End of ProvidersToolbarUI.js file ---------------------------------------------------------------------------------
*/	
},{"../L.TravelNotes":8,"../UI/HtmlElementsFactory":18,"../core/RouteEditor":37}],22:[function(require,module,exports){
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

/*
--- RouteEditorUI.js file ---------------------------------------------------------------------------------------------
This file contains:
	- the RouteEditorUI object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var m_Translator = require ( './Translator' ) ( );
	var m_WayPointsList = null;

	/*
	--- event listener for Expand button ------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickExpandButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );

		if ( -1 === require ( '../L.TravelNotes' ).routeEdition.routeInitialObjId ) {
			return;
		}

		document.getElementById ( 'TravelNotes-Control-RouteHeaderDiv' ).classList.toggle ( 'TravelNotes-Control-SmallHeader' );
		document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-Control-RouteButtonsDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.contains ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25bc;';
		document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).title = hiddenList ? m_Translator.getText ( 'RouteEditorUI - Show' ) : m_Translator.getText ( 'RouteEditorUI - Hide' );
	};

	/*
	--- event listeners for sortableList ------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSortableListDelete = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/WaypointEditor' ) ( ).removeWayPoint ( event.itemNode.dataObjId );
	};
	
	var onSortableListUpArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/WaypointEditor' ) ( ).swapWayPoints ( event.itemNode.dataObjId, true );
	};
	
	var onSortableListDownArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/WaypointEditor' ) ( ).swapWayPoints ( event.itemNode.dataObjId, false );
	};

	var onSortableListChange = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/WaypointEditor' ) ( ).renameWayPoint ( event.dataObjId, event.changeValue );
	};
	
	var onSortableListDrop = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/WaypointEditor' ) ( ).wayPointDropped ( event.draggedObjId, event.targetObjId, event.draggedBefore );
	};
	
	/*
	--- event listener for Expand list button -------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickExpandListButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.toggle ( 'TravelNotes-Control-ExpandedList' );
		var expandedList = document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.contains ( 'TravelNotes-Control-ExpandedList' );
		document.getElementById ( 'TravelNotes-Control-ExpandWayPointsListButton' ).innerHTML = expandedList ? '&#x25b3;' : '&#x25bd;';
		document.getElementById ( 'TravelNotes-Control-ExpandWayPointsListButton' ).title = expandedList ? m_Translator.getText ( 'RouteEditorUI - Reduce the list' ) : m_Translator.getText ( 'RouteEditorUI - Expand the list' );		
	};

	/*
	--- event listener for Cancel route button ------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickCancelRouteButton = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/RouteEditor' ) ( ).cancelEdition ( );
	};
	
	/*
	--- event listener for save route button --------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickSaveRouteButton = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/RouteEditor' ) ( ).saveEdition ( );
	};

	/*
	--- event listener for GPX button ---------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickGpxButton = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/RouteEditor' ) ( ).saveGpx ( );
	};
	
	/*
	--- event listener for Reverse waypoints button -------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickReverseWayPointsButton = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/WaypointEditor' ) ( ).reverseWayPoints ( );
	};
	
	/*
	--- event listener for Remove all waypoints button ----------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickRemoveAllWayPointsButton = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/WaypointEditor' ) ( ).removeAllWayPoints ( );
	};
	
	/*
	--- routeEditorUI function ----------------------------------------------------------------------------------------

	This function creates the UI
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var routeEditorUI = function ( ) {
				
		/*
		--- m_CreateUI function ---------------------------------------------------------------------------------------

		This function creates the UI
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreateUI = function ( controlDiv ){ 

			if ( document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ) ) {
				return;
			}
			
			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			// header div
			var headerDiv = htmlElementsFactory.create (
				'div',
				{ 
					id : 'TravelNotes-Control-RouteHeaderDiv',
					className : 'TravelNotes-Control-HeaderDiv'
				},
				controlDiv
			);

			// expand button
			htmlElementsFactory.create ( 
				'span', 
				{ 
					innerHTML : '&#x25bc;',
					id : 'TravelNotes-Control-RouteExpandButton',
					className : 'TravelNotes-Control-ExpandButton'
				},
				headerDiv 
			)
			.addEventListener ( 'click' , onClickExpandButton, false );
			
			// title
			htmlElementsFactory.create ( 
				'span', 
				{ 
					innerHTML : 
					m_Translator.getText ( 'RouteEditorUI - Waypoints' ), 
					id : 'TravelNotes-Control-RouteHeaderText',
					className : 'TravelNotes-Control-HeaderText'
				},
				headerDiv 
			);

			// data div
			var dataDiv = htmlElementsFactory.create ( 
				'div',
				{ 
					id : 'TravelNotes-Control-RouteDataDiv', 
					className : 'TravelNotes-Control-DataDiv'
				},
				controlDiv
			);
			
			// wayPoints list
			m_WayPointsList = require ( './SortableList' ) ( 
				{
					minSize : 0,
					listStyle : 'LimitedSort',
					id : 'TravelNotes-Control-RouteWaypointsList'
				}, 
				dataDiv
			);
			m_WayPointsList.container.addEventListener ( 'SortableListDelete', onSortableListDelete, false );
			m_WayPointsList.container.addEventListener ( 'SortableListUpArrow', onSortableListUpArrow, false	);
			m_WayPointsList.container.addEventListener ( 'SortableListDownArrow', onSortableListDownArrow, false );
			m_WayPointsList.container.addEventListener ( 'SortableListChange', onSortableListChange, false );
			m_WayPointsList.container.addEventListener ( 'SortableListDrop', onSortableListDrop, false );

			// buttons div
			var buttonsDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-RouteButtonsDiv', 
					className : 'TravelNotes-Control-ButtonsDiv'
				},
				controlDiv
			);
			
			// expand list button
			htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-ExpandWayPointsListButton', 
					className: 'TravelNotes-Control-Button', 
					title : m_Translator.getText ( 'RouteEditorUI - Expand the list' ), 
					innerHTML : '&#x25bd;'
				}, 
				buttonsDiv 
			)
			.addEventListener ( 'click' , onClickExpandListButton, false );

			// cancel route button
			htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelNotes-Control-CancelRouteButton',
					className: 'TravelNotes-Control-Button', 
					title : m_Translator.getText ( 'RouteEditorUI - Cancel' ), 
					innerHTML : '&#x274c'
				},
				buttonsDiv 
			)
			.addEventListener ( 'click', onClickCancelRouteButton, false );
			
			// save route button
			htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelNotes-Control-SaveRouteButton',
					className: 'TravelNotes-Control-Button', 
					title : m_Translator.getText ( 'RouteEditorUI - Save' ), 
					innerHTML : '&#x1f4be;'
				},
				buttonsDiv 
			)
			.addEventListener ( 'click', onClickSaveRouteButton, false );
			
			// gpx button
			htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelNotes-Control-gpxButton',
					className: 'TravelNotes-Control-Button', 
					title : m_Translator.getText ( 'RouteEditorUI - Save the route in a gpx file' ), 
					innerHTML : 'gpx'
				},
				buttonsDiv 
			)
			.addEventListener ( 'click', onClickGpxButton, false );
			
			// reverse wayPoints button
			htmlElementsFactory.create ( 
				'div',
				{ 
					id : 'TravelNotes-Control-ReverseWayPointsButton', 
					className: 'TravelNotes-Control-Button', 
					title : m_Translator.getText ( 'RouteEditorUI - Invert waypoints' ),  
					innerHTML : '&#x21C5;'
				},
				buttonsDiv
			)
			.addEventListener ( 'click' , onClickReverseWayPointsButton, false );
					
			// remove all wayPoints button
			htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-RemoveAllWayPointsButton', 
					className: 'TravelNotes-Control-Button',
					title: m_Translator.getText ( 'RouteEditorUI - Delete all waypoints' ),
					innerHTML : '&#x267b;'
				}, 
				buttonsDiv
			)
			.addEventListener ( 'click' , onClickRemoveAllWayPointsButton, false );
		};
	
		/*
		--- m_ExpandUI function ---------------------------------------------------------------------------------------

		This function expands the UI
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ExpandUI = function ( ) {
			document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).innerHTML = '&#x25bc;';
			document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).title = 'Masquer';
			document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.remove ( 'TravelNotes-Control-HiddenList' );
			document.getElementById ( 'TravelNotes-Control-RouteButtonsDiv' ).classList.remove ( 'TravelNotes-Control-HiddenList' );
		};
		
		/*
		--- m_ReduceUI function ---------------------------------------------------------------------------------------

		This function reduces the UI
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ReduceUI = function ( ) {
			document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).innerHTML = '&#x25b6;';
			document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).title = 'Afficher';
			document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.add ( 'TravelNotes-Control-HiddenList' );
			document.getElementById ( 'TravelNotes-Control-RouteButtonsDiv' ).classList.add ( 'TravelNotes-Control-HiddenList' );
		};
		
		/*
		--- m_SetWayPointsList function -------------------------------------------------------------------------------

		This function fill the wayPoints list
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SetWayPointsList = function ( ) {
			m_WayPointsList.removeAllItems ( );

			if ( -1 === require ( '../L.TravelNotes' ).routeEdition.routeInitialObjId ) {
				return;
			}
			
			var wayPointsIterator = require ( '../L.TravelNotes' ).editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
				var indexName = wayPointsIterator.first ? 'A' : ( wayPointsIterator.last ? ' B' : wayPointsIterator.index );
				var placeholder = wayPointsIterator.first ? m_Translator.getText ( 'RouteEditorUI - Start' ) : ( wayPointsIterator.last ? m_Translator.getText ( 'RouteEditorUI - End' ) : m_Translator.getText ( 'RouteEditorUI - Via' ) );
				m_WayPointsList.addItem ( wayPointsIterator.value.UIName, indexName, placeholder, wayPointsIterator.value.objId, wayPointsIterator.last );
			}
		};
		
		/*
		--- routeEditorUI object --------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return  Object.seal (
			{
				createUI : function ( controlDiv ) { 
					m_CreateUI ( controlDiv ); 
				},
		
				expand : function ( ) {
					m_ExpandUI ( );
				},
				
				reduce : function ( ) {
					m_ReduceUI ( );
				},

				setWayPointsList : function ( ) {
					m_SetWayPointsList ( );
				}
			}
		);
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = routeEditorUI;
	}

}());

/*
--- End of RouteEditorUI.js file --------------------------------------------------------------------------------------
*/
},{"../L.TravelNotes":8,"../core/RouteEditor":37,"../core/WaypointEditor":41,"./HTMLElementsFactory":16,"./SortableList":25,"./Translator":26}],23:[function(require,module,exports){
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

/*
--- RoutePropertiesDialog.js file -------------------------------------------------------------------------------------
This file contains:
	- the RoutePropertiesDialog object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #36: Add a linetype property to route
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

	var _Translator = require ( '../UI/Translator' ) ( );


	/*
	--- RoutePropertiesDialog function --------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var RoutePropertiesDialog = function ( route ) {
		
		/*
		--- onOkButtonClick function --------------------------------------------------------------------------------------

		click event listener for the ok button

		-------------------------------------------------------------------------------------------------------------------
		*/

		var onOkButtonClick = function ( ) {
			route.color = colorDialog.getNewColor ( );
			route.width = parseInt ( widthInput.value );
			route.chain = chainInput.checked;
			route.dashArray = dashSelect.selectedIndex;

			require ( '../core/MapEditor' ) ( ).editRoute ( route );
			require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
			require ( '../UI/TravelEditorUI' ) ( ).setRoutesList ( );
			require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
			return true;
		};

		// the dialog base is created
		var colorDialog = require ( '../UI/ColorDialog' ) ( route.color );
		colorDialog.title = _Translator.getText ( 'RoutePropertiesDialog - Route properties' );
		colorDialog.addClickOkButtonEventListener ( onOkButtonClick );
		
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;

		var routePropertiesDiv = htmlElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-RoutePropertiesDialog-MainDataDiv'
			},
			colorDialog.content
		);
		
		// ... width ...
		var widthDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-WithDiv'
			},
			routePropertiesDiv
		);
		widthDiv.innerHTML = '<span>' + _Translator.getText ( 'RoutePropertiesDialog - Width') + '</span>';
		var widthInput =  htmlElementsFactory.create (
			'input',
			{
				type : 'number',
				id : 'TravelNotes-RoutePropertiesDialog-WidthInput'
				
			},
			widthDiv
		);
		widthInput.value = route.width;
		widthInput.min = 1;
		widthInput.max = 40;

		// dash
		var dashDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-dashDiv'
			},
			routePropertiesDiv
		);
		dashDiv.innerHTML = '<span>' + _Translator.getText ( 'RoutePropertiesDialog - Linetype') + '</span>';
		var dashSelect = htmlElementsFactory.create (
			'select',
			{
				className : 'TravelNotes-RoutePropertiesDialog-Select',
				id : 'TravelNotes-RoutePropertiesDialog-DashSelect'
			},
			dashDiv
		);

		var dashChoices = require ( '../L.TravelNotes' ).config.route.dashChoices;
		for ( var optionsCounter = 0; optionsCounter < dashChoices.length; optionsCounter ++ ) {
			dashSelect.add ( htmlElementsFactory.create ( 'option', { text :  dashChoices [ optionsCounter ].text } ) );
		}
		dashSelect.selectedIndex = route.dashArray < dashChoices.length ? route.dashArray : 0;
		
		// chain
		var chainDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-ChainDiv'
			},
			routePropertiesDiv
		);
		chainDiv.innerHTML = '<span>' + _Translator.getText ( 'RoutePropertiesDialog - Chained route') + '</span>';
		var chainInput =  htmlElementsFactory.create (
			'input',
			{
				type : 'checkbox',
				id : 'TravelNotes-RoutePropertiesDialog-ChainInput'			
			},
			chainDiv
		);
		chainInput.checked = route.chain;
		return colorDialog;
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = RoutePropertiesDialog;
	}

}());

/*
--- End of RoutePropertiesDialog.js file ------------------------------------------------------------------------------
*/	
},{"../L.TravelNotes":8,"../UI/ColorDialog":11,"../UI/Translator":26,"../UI/TravelEditorUI":27,"../core/MapEditor":34,"../core/RouteEditor":37,"../core/TravelEditor":40,"./HTMLElementsFactory":16}],24:[function(require,module,exports){
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

/*
--- SearchPaneUI.js file ----------------------------------------------------------------------------------------------
This file contains:
	- 
Changes:
	- v1.4.0:
		- created

Doc reviewed 20190919

Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var s_OsmSearchEngine = require ( '../core/OsmSearchEngine' ) ( );
	var s_SearchInputValue = '';
	
	var onKeyDownInputChange = function ( keyBoardEvent ) {
		if ( 'Enter' === keyBoardEvent.key ) {
			onSearchInputChange ( keyBoardEvent );
		}
	};

	/*
	--- onSearchInputChange function ----------------------------------------------------------------------------------

	change event listener for the search input

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSearchInputChange = function ( event ) {
		// saving the search phrase
		s_SearchInputValue = document.getElementById ( 'TravelNotes-Control-SearchInput' ).value;

		var searchDiv = document.getElementById ( 'TravelNotes-Control-SearchDiv' );
		// removing previous search results
		var searchResultsElements = document.getElementsByClassName ( 'TravelNotes-Control-SearchResult' );
		while ( 0 !== searchResultsElements.length ) {
			// cannot use forEach because searchResultsElements is directly updated when removing an element!!!
			searchResultsElements [ 0 ].removeEventListener ( 'click' , onSearchResultClick, false );
			searchResultsElements [ 0 ].removeEventListener ( 'contextmenu' , onSearchResultContextMenu, false );
			searchResultsElements [ 0 ].removeEventListener ( 'mouseenter' , onSearchResultMouseEnter, false );
			searchResultsElements [ 0 ].removeEventListener ( 'mouseleave' , onSearchResultMouseLeave, false );
			searchDiv.removeChild ( searchResultsElements [ 0 ] );
		}
		if ( ! document.getElementById ( 'TravelNotes-Control-SearchWaitBullet' ) ) {
			// adding wait animation
			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-SearchWaitBullet' }, htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-SearchWait' }, searchDiv ) );
		}
		// search...
		s_OsmSearchEngine.search ( );
	};
	
	/*
	--- onSearchResultClick function ----------------------------------------------------------------------------------

	click event listener for the search

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSearchResultClick = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		var element = clickEvent.target;
		while ( ! element.latLng ) {
			element = element.parentNode;
		}
		require ( '../core/MapEditor' ) ( ).zoomToSearchResult ( element.latLng, element.geometry );
	};
	
	/*
	--- onSearchResultContextMenu function ----------------------------------------------------------------------------

	contextmenu event listener for the search

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSearchResultContextMenu = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		clickEvent.preventDefault ( );
		var element = clickEvent.target;
		while ( ! element.latLng ) {
			element = element.parentNode;
		}
		require ( '../core/NoteEditor' ) ( ).newSearchNote ( element.searchResult );
	};
	
	/*
	--- onSearchResultMouseEnter function -----------------------------------------------------------------------------

	mouseenter event listener for the search

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSearchResultMouseEnter = function ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		require ( '../core/MapEditor' ) ( ).addSearchPointMarker ( mouseEvent.target.objId, mouseEvent.target.latLng, mouseEvent.target.geometry );
	};
	
	/*
	--- onSearchResultMouseLeave function -----------------------------------------------------------------------------

	mouseleave event listener for the search

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSearchResultMouseLeave = function ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		require ( '../core/MapEditor' ) ( ).removeObject ( mouseEvent.target.objId );
	};

	/*
	--- searchPaneUI function -----------------------------------------------------------------------------------------

	This function returns the searchPaneUI object

	-------------------------------------------------------------------------------------------------------------------
	*/

	var searchPaneUI = function ( ) {

		/*
		--- m_Remove function -----------------------------------------------------------------------------------------

		This function removes the content

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Remove = function ( ) {
			
			var dataDiv = document.getElementById ( 'TravelNotes-Control-ItineraryDataDiv' );
			if ( ! dataDiv ) {
				return;
			}
			
			s_OsmSearchEngine.hide ( );
			
			var searchButton = document.getElementById ( 'TravelNotes-Control-SearchButton' );
			if ( searchButton ) {
				searchButton.removeEventListener ( 'click', onSearchInputChange, false );
			}
			
			var searchInputElement = document.getElementById ( 'TravelNotes-Control-SearchInput' );
			if ( searchInputElement ) {
				searchInputElement.removeEventListener ( 'change', onSearchInputChange, false );
			}
			var searchDiv = document.getElementById ( 'TravelNotes-Control-SearchDiv' );
			
			var searchResultsElements = document.getElementsByClassName ( 'TravelNotes-Control-SearchResult' );
			
			Array.prototype.forEach.call ( 
				searchResultsElements,
				function ( searchResultsElement ) {
					searchResultsElement.removeEventListener ( 'click' , onSearchResultClick, false );
					searchResultsElement.removeEventListener ( 'contextmenu' , onSearchResultContextMenu, false );
					searchResultsElement.removeEventListener ( 'mouseenter' , onSearchResultMouseEnter, false );
					searchResultsElement.removeEventListener ( 'mouseleave' , onSearchResultMouseLeave, false );
				}
			);
			
			if ( searchDiv ) {
				dataDiv.removeChild ( searchDiv );
			}
		};
		
		/*
		--- m_Add function ---------------------------------------------------------------------------------------------

		This function adds the content

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_Add = function ( ) {
			
			document.getElementById ( 'TravelNotes-Control-ItineraryPaneButton' ).classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
			document.getElementById ( 'TravelNotes-Control-TravelNotesPaneButton' ).classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
			document.getElementById ( 'TravelNotes-Control-SearchPaneButton' ).classList.add ( 'TravelNotes-Control-ActivePaneButton' );

			var dataDiv = document.getElementById ( 'TravelNotes-Control-ItineraryDataDiv' );
			if ( ! dataDiv ) {
				return;
			}
			
			s_OsmSearchEngine.show ( );
			
			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			var searchDiv = htmlElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-Control-SearchDiv'
				},
				dataDiv
			);
			var searchButton = htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelNotes-Control-SearchButton',
					className: 'TravelNotes-Control-Button', 
					title : require ( './Translator' ) ( ).getText ( 'SearchPaneUI - Search OpenStreetMap' ), 
					innerHTML : '&#x1f50e'
				},
				searchDiv 
			);
			searchButton.addEventListener ( 'click', onSearchInputChange, false );

			var searchInput = htmlElementsFactory.create ( 
				'input', 
				{ 
					type : 'text', 
					id : 'TravelNotes-Control-SearchInput', 
					placeholder : require ( './Translator' ) ( ).getText ( 'SearchPaneUI - Search phrase' ),
					value: s_SearchInputValue
				},
				searchDiv 
			);
			searchInput.addEventListener ( 'change', onSearchInputChange, false );
			searchInput.addEventListener ( 'keydown', onKeyDownInputChange, false );
			searchInput.focus ( );
			var resultsCounter = 0;
			require ( '../L.TravelNotes' ).searchData.forEach ( 
				function ( searchResult ) {
					var searchResultDiv = htmlElementsFactory.create (
						'div',
						{
							id : 'TravelNotes-Control-SearchResult'+ (resultsCounter ++ ),
							className :	'TravelNotes-Control-SearchResult',
							innerHTML : ( searchResult.description != '' ? '<p class=\'TravelNotes-Control-SearchResultDescription\'>' + searchResult.description + '</p>' : '' ) +
								( searchResult.tags.name ?  '<p>' + searchResult.tags.name + '</p>' : '' ) +
								( searchResult.tags [ 'addr:street' ] ? '<p>' + searchResult.tags [ 'addr:street' ] + ' ' + ( searchResult.tags [ 'addr:housenumber' ] ? searchResult.tags [ 'addr:housenumber' ] : '' ) +'</p>' : '' ) +
								( searchResult.tags [ 'addr:city' ] ? '<p>' + ( searchResult.tags [ 'addr:postcode' ] ? searchResult.tags [ 'addr:postcode' ] + ' ' : '' ) + searchResult.tags [ 'addr:city' ] + '</p>' : '' ) +
								( searchResult.tags.phone ? '<p>' + searchResult.tags.phone + '</p>' : '' ) +
								( searchResult.tags.email ? '<p><a href=\'mailto:' + searchResult.tags.email + '\'>' + searchResult.tags.email + '</a></p>' : '' ) +
								( searchResult.tags.website ? '<p><a href=\''+ searchResult.tags.website +'\' target=\'_blank\'>' + searchResult.tags.website + '</a></p>' : '' ) +
								( searchResult.ranking ? '<p>&#x26ab;' + searchResult.ranking + '</p>' : '' )
						},
						searchDiv
					);
					searchResultDiv.searchResult = searchResult;
					searchResultDiv.objId = require ( '../data/ObjId' ) ( );
					searchResultDiv.osmId = searchResult.id;
					searchResultDiv.latLng = L.latLng ( [ searchResult.lat, searchResult.lon ] );
					searchResultDiv.geometry = searchResult.geometry;
					searchResultDiv.addEventListener ( 'click' , onSearchResultClick, false );
					searchResultDiv.addEventListener ( 'contextmenu' , onSearchResultContextMenu, false );
					searchResultDiv.addEventListener ( 'mouseenter' , onSearchResultMouseEnter, false );
					searchResultDiv.addEventListener ( 'mouseleave' , onSearchResultMouseLeave, false );
				}
			);	
		};
	
		/*
		--- travelNotesPaneUI object ----------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal ( 
			{
				remove : function ( ) { m_Remove ( ); },
				add : function ( ) { m_Add ( ); },
			}
		);
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = searchPaneUI;
	}

}());

/*
--- End of SearchPaneUI.js file ---------------------------------------------------------------------------------------
*/		
},{"../L.TravelNotes":8,"../core/MapEditor":34,"../core/NoteEditor":35,"../core/OsmSearchEngine":36,"../data/ObjId":50,"./HTMLElementsFactory":16,"./Translator":26}],25:[function(require,module,exports){
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

/*
--- SortableList.js file ----------------------------------------------------------------------------------------------
This file contains:
	- the SortableList object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var _Translator = require ( '../UI/Translator' ) ( );
	
	var _DataObjId  = 0;

	var onDragStart = function  ( dragEvent ) {
		dragEvent.stopPropagation ( ); 
		try {
			dragEvent.dataTransfer.setData ( 'Text', dragEvent.target.dataObjId );
			dragEvent.dataTransfer.dropEffect = "move";
		}
		catch ( e ) {
		}
		// for this #@!& MS Edge... don't remove - 1 otherwise crasy things comes in FF
		// MS Edge know the dataTransfer object, but the objects linked to the event are different in the drag event and the drop event
		_DataObjId = dragEvent.target.dataObjId - 1;
	};
	
	var onDragOver = function ( event ) {
		event.preventDefault ( );
	};
	
	var onDrop = function ( dragEvent ) { 
		dragEvent.preventDefault ( );
		var element = dragEvent.target;
		while ( ! element.dataObjId ) {
			element = element.parentElement;
		}
		var clientRect = element.getBoundingClientRect ( );
		var event = new Event ( 'SortableListDrop' );
		
		// for this #@!& MS Edge... don't remove + 1 otherwise crasy things comes in FF
		//event.draggedObjId = parseInt ( dragEvent.dataTransfer.getData("Text") );
		event.draggedObjId = _DataObjId + 1;

		event.targetObjId = element.dataObjId;
		event.draggedBefore = ( dragEvent.clientY - clientRect.top < clientRect.bottom - dragEvent.clientY );
		element.parentNode.dispatchEvent ( event );
	};

	var onDeleteButtonClick = function ( ClickEvent ) {
		var event = new Event ( 'SortableListDelete' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation();
	};
	
	var onUpArrowButtonClick = function ( ClickEvent ) {
		var event = new Event ( 'SortableListUpArrow' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation();
	};
	
	var onDownArrowButtonClick = function ( ClickEvent ) {
		var event = new Event ( 'SortableListDownArrow' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation();
	};
	
	var onRightArrowButtonClick = function ( ClickEvent ) {
		var event = new Event ( 'SortableListRightArrow' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation();
	};
	
	var onChange = function ( changeEvent ) {
		var event = new Event ( 'SortableListChange' );
		event.dataObjId = changeEvent.target.parentNode.dataObjId;
		event.changeValue = changeEvent.target.value;
		changeEvent.target.parentNode.parentNode.dispatchEvent ( event );
		changeEvent.stopPropagation();
	};
	
	var onWheel = function ( wheelEvent ) { 
		if ( wheelEvent.deltaY ) {
			wheelEvent.target.scrollTop = wheelEvent.target.scrollTop + wheelEvent.deltaY * 10 ;
		}
		wheelEvent.stopPropagation ( );
	};
	
	/* 
	--- SortableList object -------------------------------------------------------------------------------------------
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var SortableList = function ( options, parentNode ) {
		
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		this.items = [];
		
		/*
		--- removeAllItems method -------------------------------------------------------------------------------------
		This method ...
		---------------------------------------------------------------------------------------------------------------
		*/

		this.removeAllItems = function ( ) {
			for ( var ItemCounter = 0; ItemCounter < this.items.length; ItemCounter ++ ) {
				this.container.removeChild ( this.items [ ItemCounter ] );
			}
			this.items.length = 0;
		};
		
		/*
		--- addItem method --------------------------------------------------------------------------------------------
		This method ...
		---------------------------------------------------------------------------------------------------------------
		*/

		this.addItem = function ( name, indexName, placeholder, dataObjId, isLastItem  ) {
	
			name = name || '';
			indexName = indexName || '';
			placeholder = placeholder || '';
			dataObjId = dataObjId || -1;
			
			var item = htmlElementsFactory.create ( 'div', { draggable : false , className : 'TravelNotes-SortableList-Item' } );

			htmlElementsFactory.create ( 'div', { className : 'TravelNotes-SortableList-ItemTextIndex' , innerHTML : indexName }, item );
			var inputElement = htmlElementsFactory.create ( 'input', { type : 'text', className : 'TravelNotes-SortableList-ItemInput', placeholder : placeholder, value: name}, item );
			inputElement.addEventListener ( 'change' , onChange, false );

			//Workaround for issue #8
			inputElement.addEventListener ( 
				'focus',
				function ( event ) {
					event.target.parentElement.draggable = false;
				},
				false
			);
			inputElement.addEventListener ( 
				'blur',
				function ( event ) {
					event.target.parentElement.draggable = event.target.parentElement.canDrag;
				},
				false
			);
				
			var upArrowButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					className : 'TravelNotes-SortableList-ItemUpArrowButton', 
					title : _Translator.getText ('SortableList - Move up' ),
					innerHTML : String.fromCharCode( 8679 )
				}, 
				item
			);
			upArrowButton.addEventListener ( 'click', onUpArrowButtonClick, false );
			var downArrowButton = htmlElementsFactory.create (
				'div', 
				{ 
					className : 'TravelNotes-SortableList-ItemDownArrowButton', 
					title : _Translator.getText ('SortableList - Move down' ), 
					innerHTML : String.fromCharCode( 8681 ) 
				},
				item 
			);
			downArrowButton.addEventListener ( 'click', onDownArrowButtonClick, false );
			var rightArrowButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					className : 'TravelNotes-SortableList-ItemRightArrowButton', 
					title : _Translator.getText ('SortableList - Edit' ), 
					innerHTML : String.fromCharCode( 8688 ) 
				},
			item );
			if ( 'AllSort' === this.options.listStyle ) {
				rightArrowButton.addEventListener ( 'click', onRightArrowButtonClick, false );
			}
			var deleteButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					className : 'TravelNotes-SortableList-ItemDeleteButton', 
					title : _Translator.getText ('SortableList - Delete' ),
					innerHTML : '&#x267b;' 
				},
				item 
			);
			deleteButton.addEventListener ( 'click', onDeleteButtonClick, false );
			item.dataObjId = dataObjId; 

			item.canDrag = false;
			if ( ( ( 'LimitedSort' !== this.options.listStyle ) || ( 1 < this.items.length ) ) && ( ! isLastItem  ) ){
				item.draggable = true;
				item.addEventListener ( 'dragstart', onDragStart, false );	
				item.classList.add ( 'TravelNotes-SortableList-MoveCursor' );
				item.canDrag = true;
			}
			
			this.items.push ( item );

			this.container.appendChild ( item );
		};
		
		/*
		--- _create method --------------------------------------------------------------------------------------------
		This method ...
		---------------------------------------------------------------------------------------------------------------
		*/

		this._create = function ( options, parentNode ) {

			// options
			
			// options.listStyle = 'AllSort' : all items can be sorted or deleted
			// options.listStyle = 'LimitedSort' : all items except first and last can be sorted or deleted
			
			this.options = { minSize : 2, listStyle : 'AllSort', id : 'TravelNotes-SortableList-Container' } ;
			for ( var option in options ) {
				this.options [ option ] = options [ option ];
			}
			if ( ( 'LimitedSort' === this.options.listStyle ) && ( 2 > this.options.minSize ) )
			{
				this.options.minSize = 0;
			}
			this.container = htmlElementsFactory.create ( 'div', { id : options.id, className : 'TravelNotes-SortableList-Container' } );
			this.container.classList.add ( this.options.listStyle );
			this.container.addEventListener ( 'drop', onDrop, false );
			this.container.addEventListener ( 'dragover', onDragOver, false );
			this.container.addEventListener ( 'wheel', onWheel, false );

			if ( parentNode ) {
				parentNode.appendChild ( this.container );
			}
			
			for ( var itemCounter = 0; itemCounter < this.options.minSize; itemCounter++ )
			{
				this.addItem ( );
			}
		};
		
		this._create ( options, parentNode );
		
	};
	
	/* 
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	var sortableList = function ( options, parentNode ) {
		return new SortableList ( options, parentNode );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = sortableList;
	}

}());

/*
--- End of SortableList.js file ---------------------------------------------------------------------------------------
*/	

},{"../UI/Translator":26,"./HTMLElementsFactory":16}],26:[function(require,module,exports){
(function (global){
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

/*
--- Translator.js file ------------------------------------------------------------------------------------------------
This file contains:
	- the Translator object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {
	
	'use strict';
	var Translator = function ( ) {
		
		if ( ! global.translations ) {
			global.translations = new Map ( );
		}

		return {
			
			setTranslations : function ( translations ) {
				translations.forEach (
					function ( translation ) {
						global.translations.set ( translation.msgid, translation.msgstr );
					}
				);
			},
			
			getText : function ( msgid , params ) { 
				var translation = global.translations.get ( msgid );
				if ( params && translation ) {
					Object.getOwnPropertyNames ( params ).forEach (
						function ( propertyName ) {
							translation = translation.replace ( '{' + propertyName + '}' , params [ propertyName ] ); 
						}
					);
				}
				
				return translation ? translation : msgid;
			}
		};
	};
	
	/* 
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = Translator;
	}

} ) ( );

/*
--- End of Translator.js file -----------------------------------------------------------------------------------------
*/	

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],27:[function(require,module,exports){
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

/*
--- TravelEditorUI.js file --------------------------------------------------------------------------------------------
This file contains:
	- the TravelEditorUI object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #26 : added confirmation message before leaving the page when data modified.
		- Issue #31 : Add a command to import from others maps
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- moving file functions from TravelEditor to the new FileLoader
		- modified event listener for cancel travel button ( issue #45 )
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var m_Translator = require ( './Translator' ) ( );
	var g_TravelNotesData = require ( '../L.TravelNotes' );
	var m_RoutesList = null;

	/*
	--- event listeners for mouse on the control ----------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	var m_TimerId = null;
	
	var onMouseEnterControl = function ( event ) {
		if ( m_TimerId ) {
			clearTimeout ( m_TimerId );
			m_TimerId = null;
		}
		document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.remove ( 'TravelNotes-Control-MainDiv-Minimize' );
		document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.add ( 'TravelNotes-Control-MainDiv-Maximize' );
	};
	
	var onTimeOut = function ( ) {
		document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.remove ( 'TravelNotes-Control-MainDiv-Maximize' );
		document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.add ( 'TravelNotes-Control-MainDiv-Minimize' );
	};
	
	var onMouseLeaveControl =function ( event ) {
		m_TimerId = setTimeout(onTimeOut, g_TravelNotesData.config.travelEditor.timeout );
	};

	/*
	--- event listener for Expand button ------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickExpandButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		document.getElementById ( 'TravelNotes-Control-TravelHeaderDiv' ).classList.toggle ( 'TravelNotes-Control-SmallHeader' );
		document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-ControlTravelButtonsDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ).classList.contains ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-ControlTravelExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25bc;';
		document.getElementById ( 'TravelNotes-ControlTravelExpandButton' ).title = hiddenList ? m_Translator.getText ( 'TravelEditorUI - Show' ) : m_Translator.getText ( 'TravelEditorUI - Hide' );
		clickEvent.stopPropagation ( );
	};
	
	/*
	--- event listener for Pin button ---------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickPinButton = function ( event ) {
		var control = document.getElementById ( 'TravelNotes-Control-MainDiv' );
		if ( 10060 === event.target.innerHTML.charCodeAt ( 0 ) ) {
			event.target.innerHTML = '&#x1f4cc;';
			control.addEventListener ( 'mouseenter', onMouseEnterControl, false );
			control.addEventListener ( 'mouseleave', onMouseLeaveControl, false );
		}
		else
		{
			event.target.innerHTML = '&#x274c;';
			control.removeEventListener ( 'mouseenter', onMouseEnterControl, false );
			control.removeEventListener ( 'mouseleave', onMouseLeaveControl, false );
		}
	};

	/*
	--- event listeners for sortableList ------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSortableListDelete = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).removeRoute ( event.itemNode.dataObjId );
	};

	var onSortableListUpArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).swapRoute ( event.itemNode.dataObjId, true );
	};
	
	var onSortableListDownArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).swapRoute ( event.itemNode.dataObjId, false );
	};
	
	var onSortableListRightArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).editRoute ( event.itemNode.dataObjId );
	};

	var onSortableListChange = function ( event ) {
		event.stopPropagation();
		require ( '../core/TravelEditor' ) ( ).renameRoute ( event.dataObjId, event.changeValue );
	};

	var onSortableListDrop = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).routeDropped ( event.draggedObjId, event.targetObjId, event.draggedBefore );
	}; 
	
	/*
	--- event listener for Expand list button -------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickExpandListButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ).classList.toggle ( 'TravelNotes-Control-ExpandedList' );
		var expandedList = document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ).classList.contains ( 'TravelNotes-Control-ExpandedList' );
		document.getElementById ( 'TravelNotes-Control-ExpandRoutesListButton' ).innerHTML = expandedList ? '&#x25b3;' : '&#x25bd;';
		document.getElementById ( 'TravelNotes-Control-ExpandRoutesListButton' ).title = expandedList ? m_Translator.getText ( 'TravelEditorUI - Reduce the list' ) : m_Translator.getText ( 'TravelEditorUI - Expand the list' );		
	};
	
	/*
	--- event listener for Cancel travel button -----------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	var onCancelTravelClick = function ( clickEvent ) {
		clickEvent.stopPropagation();
		require ( '../core/TravelEditor' ) ( ).clear ( );
		if ( require ( '../L.TravelNotes' ).config.travelEditor.startupRouteEdition ) {
			require ( '../core/RouteEditor' ) ( ).editRoute ( require ( '../L.TravelNotes' ).travel.routes.first.objId );
		}
		require ( '../L.TravelNotes' ).map.fire ( 'travelnotesfileloaded', { readOnly : false, name : '' } );
	};
				
	/*
	--- event listener for save travel button -------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickSaveTravelButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).saveTravel ( );
	};

	/*
	--- event listener for open travel input  -------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onChangeOpenTravelInput = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		require ( '../core/RouteEditor' ) ( ).cancelEdition ( );
		require ( '../core/FileLoader' ) ( ).openLocalFile ( clickEvent );
	};
	
	/*
	--- event listener for open travel  button ------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickOpenTravelButton = function ( ) 
	{ 
		if ( ! require ( '../core/TravelEditor' ) ( ).confirmClose ( ) )
		{
			return;
		}
		document.getElementById ( 'TravelNotes-Control-OpenTravelInput' ).click ( );
	};
	
	/*
	--- event listeners for import travel input and button ------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onChangeImportTravelInput = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		require ( '../core/FileLoader' ) ( ).mergeLocalFile ( clickEvent );
	};
	
	var onClickImportTravelButton = function ( event ) 
	{ 
		document.getElementById ( 'TravelNotes-Control-ImportTravelInput' ).click ( );
	};

	/*
	--- _event listeners for add route button -------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickAddRouteButton = function ( event ) {
		event.stopPropagation();
		require ( '../core/TravelEditor' ) ( ).addRoute ( );
	};
		

	/*
	--- travelEditorUI function ---------------------------------------------------------------------------------------

	This function creates the UI
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var travelEditorUI = function ( ) {
				
		/*
		--- m_CreateUI function ---------------------------------------------------------------------------------------

		This function creates the UI
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreateUI = function ( controlDiv ){ 
		
			if ( document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ) ) {
				return;
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			// header
			var headerDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-TravelHeaderDiv', 
					className : 'TravelNotes-Control-HeaderDiv'
				},
				controlDiv
			);

			// expand button
			htmlElementsFactory.create (
				'span',
				{ 
					innerHTML : '&#x25bc;', 
					id : 'TravelNotes-ControlTravelExpandButton', 
					className : 'TravelNotes-Control-ExpandButton'
				},
				headerDiv
			)
			.addEventListener ( 'click' , onClickExpandButton, false );

			// title
			htmlElementsFactory.create ( 
				'span', 
				{ 
					innerHTML : m_Translator.getText ( 'TravelEditorUI - Travel routes' ), 
					id : 'TravelNotes-Control-TravelHeaderText', 
					className : 'TravelNotes-Control-HeaderText'
				},
				headerDiv 
			);
		
			// pin button
			var pinButton = htmlElementsFactory.create (
				'span',
				{ 
					innerHTML : '&#x274c;', 
					id : 'TravelNotes-Control-PinButton', 
				},
				headerDiv
			);
			pinButton.addEventListener ( 'click', onClickPinButton, false );

			// data div
			var dataDiv = htmlElementsFactory.create ( 
				'div',
				{ 
					id : 'TravelNotes-Control-TravelDataDiv', 
					className : 'TravelNotes-Control-DataDiv'
				},
				controlDiv 
			);
			
			// Routes list
			m_RoutesList = require ( './SortableList' ) ( { minSize : 0, id : 'TravelNotes-Control-TravelRoutesList' }, dataDiv );
			m_RoutesList.container.addEventListener ( 'SortableListDelete', onSortableListDelete, false );
			m_RoutesList.container.addEventListener ( 'SortableListUpArrow', onSortableListUpArrow, false );
			m_RoutesList.container.addEventListener ( 'SortableListDownArrow', onSortableListDownArrow, false );
			m_RoutesList.container.addEventListener ( 'SortableListRightArrow', onSortableListRightArrow, false );
			m_RoutesList.container.addEventListener ( 'SortableListChange', onSortableListChange, false );
			m_RoutesList.container.addEventListener ( 'SortableListDrop', onSortableListDrop, false );
			
			// buttons div
			var buttonsDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-ControlTravelButtonsDiv', 
					className : 'TravelNotes-Control-ButtonsDiv'
				}, 
				controlDiv
			);

			// expand list button
			htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-ExpandRoutesListButton', 
					className: 'TravelNotes-Control-Button', 
					title : m_Translator.getText ( 'TravelEditorUI - Expand the list' ), 
					innerHTML : '&#x25bd;'
				}, 
				buttonsDiv 
			)
			.addEventListener ( 'click' , onClickExpandListButton, false );
			
			// cancel travel button
			htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelNotes-Control-CancelTravelButton',
					className: 'TravelNotes-Control-Button', 
					title : m_Translator.getText ( 'TravelEditorUI - Cancel travel' ), 
					innerHTML : '&#x274c'
				},
				buttonsDiv 
			)
			.addEventListener ( 'click', onCancelTravelClick, false );

			// save travel button
			htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-SaveTravelButton', 
					className: 'TravelNotes-Control-Button', 
					title : m_Translator.getText ( 'TravelEditorUI - Save travel' ), 
					innerHTML : '&#x1f4be;'
				}, 
				buttonsDiv 
			)
			.addEventListener ( 'click', onClickSaveTravelButton, false );

			// open travel button with the well know hack....
			// See also UserInterface.js. Click events are first going to the interface div...
			var openTravelDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id: 'TravelNotes-Control-OpenTravelDiv'
				}, 
				buttonsDiv 
			);
			htmlElementsFactory.create ( 
				'input',
				{
					id : 'TravelNotes-Control-OpenTravelInput', 
					type : 'file',
					accept : '.trv'
				},
				openTravelDiv
			)
			.addEventListener ( 'change', onChangeOpenTravelInput, false );
			var openTravelFakeDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id: 'TravelNotes-Control-OpenTravelFakeDiv'
				}, 
				openTravelDiv 
			);
			htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-OpenTravelButton', 
					className: 'TravelNotes-Control-Button', 
					title : m_Translator.getText ( 'TravelEditorUI - Open travel' ), 
					innerHTML : '&#x1F4C2;'
				}, 
				openTravelFakeDiv 
			)
			.addEventListener ( 'click' , onClickOpenTravelButton, false );

			// import travel button with the well know hack....
			var importTravelDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id: 'TravelNotes-Control-ImportTravelDiv'
				}, 
				buttonsDiv 
			);
			htmlElementsFactory.create ( 
				'input',
				{
					id : 'TravelNotes-Control-ImportTravelInput', 
					type : 'file',
					accept : '.trv,.map'
				},
				importTravelDiv
			)
			.addEventListener ( 'change', onChangeImportTravelInput, false );
			var importTravelFakeDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id: 'TravelNotes-Control-ImportTravelFakeDiv'
				}, 
				importTravelDiv 
			);
			htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-ImportTravelButton', 
					className: 'TravelNotes-Control-Button', 
					title : m_Translator.getText ( 'TravelEditorUI - Import travel' ), 
					innerHTML : '&#x1F30F;'
				}, 
				importTravelFakeDiv 
			)
			.addEventListener ( 'click' , onClickImportTravelButton, false );

			// roadbook button
			htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-OpenTravelRoadbookButton', 
					className: 'TravelNotes-Control-Button', 
					title : m_Translator.getText ( 'TravelEditorUI - Open travel roadbook' ), 
					innerHTML : '<a id="TravelNotes-Control-OpenTravelRoadbookLink" href="TravelNotesRoadbook.html?page=' + g_TravelNotesData.UUID + '" target="_blank">&#x1F4CB;</a>' //'&#x23CD;'
				}, 
				buttonsDiv
			);

			// add route button
			htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-AddRoutesButton', 
					className: 'TravelNotes-Control-Button', 
					title : m_Translator.getText ( 'TravelEditorUI - New route' ), 
					innerHTML : '+'
				}, 
				buttonsDiv 
			)
			.addEventListener ( 'click' , onClickAddRouteButton, false );
			if ( g_TravelNotesData.config.travelEditor.startMinimized ) {
				pinButton.innerHTML = '&#x1f4cc;';
				controlDiv.addEventListener ( 'mouseenter', onMouseEnterControl, false );
				controlDiv.addEventListener ( 'mouseleave', onMouseLeaveControl, false );
				controlDiv.classList.add ( 'TravelNotes-Control-MainDiv-Minimize' );
			}
			else {
				controlDiv.classList.add ( 'TravelNotes-Control-MainDiv-Maximize' );
			}
		};	
		
		/*
		--- m_SetRoutesList function ----------------------------------------------------------------------------------

		This function fill the routes list
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SetRoutesList = function (  ) {
			m_RoutesList.removeAllItems ( );
			var routesIterator = g_TravelNotesData.travel.routes.iterator;
			while ( ! routesIterator.done ) {
				m_RoutesList.addItem ( routesIterator.value.name, routesIterator.value.chain ? '&#x26d3;' : '', m_Translator.getText ( 'TravelEditorUI - Route' ) ,routesIterator.value.objId, false );
			}
		};

		/*
		--- travelEditorUI object -------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{
				createUI : function ( controlDiv ) { m_CreateUI ( controlDiv ); },
				
				setRoutesList : function (  ) { m_SetRoutesList ( );	}
			}
		);
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = travelEditorUI;
	}

}());

/*
--- End of TravelEditorUI.js file -------------------------------------------------------------------------------------
*/
},{"../L.TravelNotes":8,"../core/FileLoader":32,"../core/RouteEditor":37,"../core/TravelEditor":40,"./HTMLElementsFactory":16,"./SortableList":25,"./Translator":26}],28:[function(require,module,exports){
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

/*
--- TravelNotesPaneUI.js file -----------------------------------------------------------------------------------------
This file contains:
	- 
Changes:
	- v1.4.0:
		- created

Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var s_NoteObjId  = 0;
	
	/*
	--- onDragStart function ------------------------------------------------------------------------------------------

	drag start event listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onDragStart = function  ( dragEvent ) {
		dragEvent.stopPropagation ( ); 
		try {
			dragEvent.dataTransfer.setData ( 'Text', dragEvent.target.dataObjId );
			dragEvent.dataTransfer.dropEffect = "move";
		}
		catch ( e ) {
		}
		// for this #@!& MS Edge... don't remove - 1 otherwise crasy things comes in FF
		// MS Edge know the dataTransfer object, but the objects linked to the event are different in the drag event and the drop event
		s_NoteObjId = dragEvent.target.noteObjId - 1;
	};
	
	/*
	--- onDragOver function -------------------------------------------------------------------------------------------

	drag over event listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onDragOver = function ( event ) {
		event.preventDefault ( );
	};
	
	/*
	--- onDrop function -----------------------------------------------------------------------------------------------

	drop listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onDrop = function ( dragEvent ) { 
		dragEvent.preventDefault ( );
		var element = dragEvent.target;

		while ( ! element.noteObjId ) {
			element = element.parentElement;
		}
		var clientRect = element.getBoundingClientRect ( );
		
		// for this #@!& MS Edge... don't remove + 1 otherwise crazy things comes in FF
		require ( '../core/NoteEditor' ) ( ).noteDropped ( 
			s_NoteObjId + 1, 
			element.noteObjId, 
			dragEvent.clientY - clientRect.top < clientRect.bottom - dragEvent.clientY
		);
	};
	
	/*
	--- onTravelNoteClick function ------------------------------------------------------------------------------------

	click event listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onTravelNoteClick = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		clickEvent.preventDefault ( );
		var element = clickEvent.target;
		while ( ! element.noteObjId ) {
			element = element.parentNode;
		}
		require ( '../core/MapEditor' ) ( ).zoomToNote ( element.noteObjId );
	};
	
	/*
	--- onTravelNoteContextMenu function ------------------------------------------------------------------------------

	contextmenu event listener for the notes

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onTravelNoteContextMenu = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		clickEvent.preventDefault ( );
		var element = clickEvent.target;
		while ( ! element.noteObjId ) {
			element = element.parentNode;
		}
		require ( '../core/NoteEditor' ) ( ).editNote ( element.noteObjId );
	};
	
	/*
	--- travelNotesPaneUI function ------------------------------------------------------------------------------------

	This function returns the travelNotesPaneUI object

	-------------------------------------------------------------------------------------------------------------------
	*/

	var travelNotesPaneUI = function ( ) {
	
		/*
		--- m_Remove function -----------------------------------------------------------------------------------------

		This function removes the content

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Remove = function ( ) {

			var dataDiv = document.getElementById ( 'TravelNotes-Control-ItineraryDataDiv' );
			if ( ! dataDiv ) {
				return;
			}

			var travelNotesDiv = dataDiv.firstChild;
			if ( travelNotesDiv ) {
				travelNotesDiv.childNodes.forEach (
					function ( childNode  ) {
						childNode.removeEventListener ( 'click' , onTravelNoteClick, false );
						childNode.removeEventListener ( 'contextmenu' , onTravelNoteContextMenu, false );
						childNode.removeEventListener ( 'dragstart', onDragStart, false );	
					}
				);
				dataDiv.removeChild ( travelNotesDiv );
			}
		};
		
		/*
		--- m_Add function --------------------------------------------------------------------------------------------

		This function adds the content

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_Add = function ( ) {

			document.getElementById ( 'TravelNotes-Control-ItineraryPaneButton' ).classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
			document.getElementById ( 'TravelNotes-Control-TravelNotesPaneButton' ).classList.add ( 'TravelNotes-Control-ActivePaneButton' );
			if ( window.osmSearch ) {
				document.getElementById ( 'TravelNotes-Control-SearchPaneButton' ).classList.remove ( 'TravelNotes-Control-ActivePaneButton' );
			}
			
			var htmlViewsFactory = require ( '../UI/HTMLViewsFactory' ) ( );
			htmlViewsFactory.classNamePrefix = 'TravelNotes-Control-';
			
			var dataDiv = document.getElementById ( 'TravelNotes-Control-ItineraryDataDiv' );
			if ( ! dataDiv ) {
				return;
			}

			var travelNotesDiv = htmlViewsFactory.travelNotesHTML;
			travelNotesDiv.addEventListener ( 'drop', onDrop, false );
			travelNotesDiv.addEventListener ( 'dragover', onDragOver, false );
			
			dataDiv.appendChild ( travelNotesDiv );
			travelNotesDiv.childNodes.forEach (
				function ( childNode  ) {
					childNode.addEventListener ( 'click' , onTravelNoteClick, false );
					childNode.addEventListener ( 'contextmenu' , onTravelNoteContextMenu, false );
					childNode.draggable = true;
					childNode.addEventListener ( 'dragstart', onDragStart, false );	
					childNode.classList.add ( 'TravelNotes-SortableList-MoveCursor' );				}
			);
		};

		/*
		--- travelNotesPaneUI object ----------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/
		
		return Object.seal (
			{
				remove : function ( ) { m_Remove ( ); },
				add : function ( ) { m_Add ( ); }
			}
		);
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = travelNotesPaneUI;
	}

}());

/*
--- End of TravelNotesPaneUI.js file ----------------------------------------------------------------------------------
*/		
},{"../UI/HTMLViewsFactory":17,"../core/MapEditor":34,"../core/NoteEditor":35}],29:[function(require,module,exports){
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

/*
--- UserInterface.js file ---------------------------------------------------------------------------------------------
This file contains:
	- the UserInterface object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #31 : Add a command to import from others maps
Doc reviewed 20170929
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var UserInterface = function ( ) {

		var m_MainDiv = document.getElementById ( 'TravelNotes-Control-MainDiv' );

		var m_CreateUI = function ( ){ 
			m_MainDiv = require ( './HTMLElementsFactory' ) ( ).create ( 'div', { id : 'TravelNotes-Control-MainDiv' } );
			require ( './HTMLElementsFactory' ) ( ).create ( 'div', { id : 'TravelNotes-Control-MainDiv-Title', innerHTML : 'Travel&nbsp;&amp;&nbsp;Notes' }, m_MainDiv);
			require ( './TravelEditorUI' ) ( ).createUI ( m_MainDiv ); 
			require ( './RouteEditorUI' ) ( ).createUI ( m_MainDiv ); 
			require ( './DataPanesUI' ) ( ).createUI ( m_MainDiv ); 
			require ( './ProvidersToolbarUI' ) ( ).createUI ( m_MainDiv ); 
			require ( './ErrorEditorUI' ) ( ).createUI ( m_MainDiv ); 
			
			m_MainDiv.addEventListener ( 
				'click',
				function ( event ) {

					if  ( event.target.classList.contains (  "TravelNotes-SortableList-ItemInput" ) ) {
						return; 
					}
					if ( event.target.id && -1 !== [ "TravelNotes-Control-OpenTravelInput", "TravelNotes-Control-OpenTravelButton", "TravelNotes-Control-ImportTravelInput", "TravelNotes-Control-ImportTravelButton", "TravelNotes-Control-OpenTravelRoadbookLink" ].indexOf ( event.target.id ) ) {
						return;
					}
					event.stopPropagation ( );
					event.preventDefault ( );
				},
				false
			);
			
			m_MainDiv.addEventListener ( 
				'dblclick',
				function ( event ) {
					event.stopPropagation ( );
					event.preventDefault ( );
				},
				false
			);
			
			m_MainDiv.addEventListener ( 
				'wheel',
				function ( event ) {
					event.stopPropagation ( );
					event.preventDefault ( );
				},
				false
			);
		};
		
		if ( ! m_MainDiv ) {
			m_CreateUI ( );
		}
		
		return {
			get UI ( ) { return m_MainDiv; }
		};
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = UserInterface;
	}

}());

/*
--- End of UserInterface.js file --------------------------------------------------------------------------------------
*/	
},{"./DataPanesUI":14,"./ErrorEditorUI":15,"./HTMLElementsFactory":16,"./ProvidersToolbarUI":21,"./RouteEditorUI":22,"./TravelEditorUI":27}],30:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"../UI/Translator":26,"./HTMLElementsFactory":16,"dup":10}],31:[function(require,module,exports){
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

/*
--- ErrorEditor.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the ErrorEditor object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var ErrorEditor = function ( ) {

		return {
			
			showError : function ( error ) {
				var header = '<span class="TravelNotes-Control-Error">';
				var footer = '</span>';
				require ( '../UI/ErrorEditorUI' ) ( ).message = header + error + footer;
			},

			clear : function ( ) {
				require ( '../UI/ErrorEditorUI' ) ( ).message = '';
			}
		};
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = ErrorEditor;
	}

}());

/*
--- End of ErrorEditor.js file ----------------------------------------------------------------------------------------
*/
},{"../UI/ErrorEditorUI":15}],32:[function(require,module,exports){
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

/*
--- FileLoader.js file ----------------------------------------------------------------------------------------------
This file contains:
	- the FileLoader object
	- the module.exports implementation
Changes:
	- v1.4.0:
		- created from TravelEditor
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	/*
	--- fileLoader function -------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	var fileLoader = function ( ) {

		var g_TravelNotesData = require ( '../L.TravelNotes' );
	
		var m_MergeContent = false;
		var m_FileName = '';
		var m_IsFileReadOnly = false;
		var m_FileContent = {};
		
		/*
		--- m_DecompressFileContent function --------------------------------------------------------------------------

		This function decompress the file data
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_DecompressFileContent = function ( ) {
			
			m_FileContent.routes.forEach ( 
				function ( route ) {
					route.itinerary.itineraryPoints.latLngs = require ( '@mapbox/polyline' ).decode ( route.itinerary.itineraryPoints.latLngs, 6 );
					var decompressedItineraryPoints = [];
					var latLngsCounter = 0;
					route.itinerary.itineraryPoints.latLngs.forEach (
						function ( latLng ) {
							var itineraryPoint = {};
							itineraryPoint.lat = latLng [ 0 ];
							itineraryPoint.lng = latLng [ 1 ];
							itineraryPoint.distance = route.itinerary.itineraryPoints.distances [ latLngsCounter ];
							itineraryPoint.objId = route.itinerary.itineraryPoints.objIds [ latLngsCounter ];
							itineraryPoint.objType = route.itinerary.itineraryPoints.objType;
							decompressedItineraryPoints.push ( itineraryPoint );
							latLngsCounter ++;
						}
					);
					route.itinerary.itineraryPoints = decompressedItineraryPoints;
				}
			);
			
			if ( m_MergeContent ) {
				m_Merge ( );
			}
			else {
				m_Open ( );
			}
		};
		
		/*
		--- m_Merge function ------------------------------------------------------------------------------------------

		This function merge the file data with the g_TravelNotesData.travel
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Merge = function ( ) {
			// ... and transform the data in the correct format
			var travel = require ( '../Data/Travel' ) ( );
			travel.object = m_FileContent;
			
			// routes are added with their notes
			var routesIterator = travel.routes.iterator;
			while ( ! routesIterator.done ) {
				g_TravelNotesData.travel.routes.add ( routesIterator.value );
			}
			// travel notes are added
			var notesIterator = travel.notes.iterator;
			while ( ! notesIterator.done ) {
				g_TravelNotesData.travel.notes.add ( notesIterator.value );
			}
			
			require ( '../Core/RouteEditor' ) ( ).chainRoutes ( );
		
			m_Display ( );
		};
		
		/*
		--- m_Open function -------------------------------------------------------------------------------------------

		This function load the file data within the g_TravelNotesData.travel
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Open = function ( ) {
			g_TravelNotesData.travel.object = m_FileContent;
			if ( '' !== m_FileName ) {
				g_TravelNotesData.travel.name = m_FileName.substr ( 0, m_FileName.lastIndexOf ( '.' ) ) ;
			}
			g_TravelNotesData.travel.readOnly = m_IsFileReadOnly;			
			
			m_Display ( );
		};
		
		/*
		--- m_Display function -----------------------------------------------------------------------------------------

		This function update the screen
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Display = function ( ) {
			
			var mapEditor = require ( '../core/MapEditor' ) ( );

			// the map is cleaned
			mapEditor.removeAllObjects ( );
			
			// routes are added with their notes
			var routesIterator = g_TravelNotesData.travel.routes.iterator;
			while ( ! routesIterator.done ) {
				mapEditor.addRoute ( routesIterator.value, true, false, m_IsFileReadOnly );
			}
			
			// travel notes are added
			var notesIterator = g_TravelNotesData.travel.notes.iterator;
			while ( ! notesIterator.done ) {
				mapEditor.addNote ( notesIterator.value, m_IsFileReadOnly );
			}
			
			// zoom on the travel
			mapEditor.zoomToTravel ( );

			// Editors and roadbook are filled
			if ( ! m_IsFileReadOnly ) {
			// Editors and HTML pages are filled
				require ( '../UI/TravelEditorUI' ) ( ). setRoutesList ( );
				require ( '../core/TravelEditor' ) ( ).updateRoadBook ( false );
			}
			else {
				// control is hidden
				document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.add ( 'TravelNotes-Control-MainDiv-Hidden' );
				document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.remove ( 'TravelNotes-Control-MainDiv-Maximize' );
				document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.remove ( 'TravelNotes-Control-MainDiv-Minimize' );
			}
			g_TravelNotesData.map.fire ( 'travelnotesfileloaded', { readOnly : m_IsFileReadOnly, name : g_TravelNotesData.travel.name } );
		};
			
		/*
		--- m_OpenFile function ---------------------------------------------------------------------------------------

		This function open a local file
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_OpenFile = function ( event ) {
			m_FileName = event.target.files [ 0 ].name;
			
			var fileReader = new FileReader( );
			fileReader.onload = function ( event ) {
				try {
					m_FileContent =  JSON.parse ( fileReader.result );
					m_DecompressFileContent ( );
				}
				catch ( e ) {
				}
			};
			fileReader.readAsText ( event.target.files [ 0 ] );
		};

		/*
		--- m_OpenLocalFile function ----------------------------------------------------------------------------------

		This function open a local file
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_OpenLocalFile = function ( event ) {
			m_MergeContent = false;
			m_IsFileReadOnly = false;
			m_OpenFile ( event );
		};
		
		/*
		--- m_MergeLocalFile function ---------------------------------------------------------------------------------

		This function open a local file
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_MergeLocalFile = function ( event ) {
			m_MergeContent = true;
			m_IsFileReadOnly = false;
			m_OpenFile ( event );
		};
		
		/*
		--- m_OpenDistantFile function --------------------------------------------------------------------------------

		This function open a local file
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_OpenDistantFile = function ( fileContent ) {
			m_IsFileReadOnly = true;
			m_FileContent = fileContent;
			m_DecompressFileContent ( );
		};
	
		/*
		--- FileLoader object -----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{
				openLocalFile : function ( event ) { m_OpenLocalFile ( event ); },
				mergeLocalFile : function ( event ) { m_MergeLocalFile ( event ); },
				openDistantFile : function ( fileContent ) { m_OpenDistantFile ( fileContent ); }
			}
		);
	};
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = fileLoader;
	}

}());

/*
--- End of FileLoader.js file -----------------------------------------------------------------------------------------
*/	
},{"../Core/RouteEditor":2,"../Data/Travel":6,"../L.TravelNotes":8,"../UI/TravelEditorUI":27,"../core/MapEditor":34,"../core/TravelEditor":40,"@mapbox/polyline":1}],33:[function(require,module,exports){
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

/*
--- GeoCoder.js file --------------------------------------------------------------------------------------------------
This file contains:
	- the GeoCoder object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- Working with Promise
		- returning the complete Nominatim responce in place of a computed address
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var s_RequestStarted = false;
	
	var GeoCoder = function ( ) {
	
		var m_ObjId = -1;
		var m_Lat = 0;
		var m_Lng = 0;

		/*
		--- m_StartXMLHttpRequest function -----------------------------------------------------------------------------

		This function start the http request to OSM

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_StartXMLHttpRequest = function ( returnOnOk, returnOnError ) {

			var xmlHttpRequest = new XMLHttpRequest ( );
			xmlHttpRequest.timeout = require ( '../L.TravelNotes' ).config.note.svgTimeOut;
			
			xmlHttpRequest.ontimeout = function ( event ) {
				returnOnError ( 'TimeOut error' );
			};

			xmlHttpRequest.onreadystatechange = function ( ) { 
				if ( xmlHttpRequest.readyState == 4 ) {
					if ( xmlHttpRequest.status == 200 ) {
						s_RequestStarted = false;
						var response;
						try {
							response = JSON.parse( this.responseText );
						}
						catch ( e ) {
							s_RequestStarted = false;
							returnOnError ( 'Parsing error' );
						}
						s_RequestStarted = false;
						response.objId = m_ObjId;
						returnOnOk ( response );	
					}
					else {
						s_RequestStarted = false;
						returnOnError ( 'Status : ' + this.status + ' statusText : ' + this.statusText );
					}
				}
			};  
			var NominatimUrl = 
				require ( '../L.TravelNotes' ).config.nominatim.url + 'reverse?format=json&lat=' + 
				m_Lat + '&lon=' + m_Lng + 
				'&zoom=18&addressdetails=1';
			var nominatimLanguage = require ( '../L.TravelNotes' ).config.nominatim.language;
			if (  nominatimLanguage && nominatimLanguage !== '*' ) {
				NominatimUrl += '&accept-language=' + nominatimLanguage;
			}
			xmlHttpRequest.open ( "GET", NominatimUrl, true );
			if (  nominatimLanguage && nominatimLanguage === '*' ) {
				xmlHttpRequest.setRequestHeader ( 'accept-language', '' );
			}
			xmlHttpRequest.overrideMimeType ( 'application/json' );
			xmlHttpRequest.send ( null );
		};

		/*
		--- End of _StartXMLHttpRequest function ---
		*/

		/*
		--- m_GetPromiseAddress function ------------------------------------------------------------------------------

		This function creates the address promise

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_GetPromiseAddress = function ( lat, lng, objId ) {
			if ( s_RequestStarted ) {
				return Promise.reject ( );
			}
			s_RequestStarted = true;
			
			m_ObjId = objId || -1;
			m_Lat = lat;
			m_Lng = lng;
			
			return new Promise ( m_StartXMLHttpRequest );
		};
		
		/*
		--- End of m_GetPromiseAddress function ---
		*/

		/*
		--- geoCoder object -------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/
		
		return Object.seal (
			{
				getPromiseAddress : function ( lat, lng, objId ) { return m_GetPromiseAddress ( lat, lng, objId ); }				
			}
		);
			
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = GeoCoder;
	}

}());

/*
--- End of GeoCoder.js file -------------------------------------------------------------------------------------------
*/
},{"../L.TravelNotes":8}],34:[function(require,module,exports){
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

/*
--- MapEditor.js file -------------------------------------------------------------------------------------------------
This file contains:
	- the MapEditor object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	-v1.1.0:
		- Issue #29 : added tooltip to startpoint, waypoints and endpoint
		- Issue #30: Add a context menu with delete command to the waypoints
		- Issue #36: Add a linetype property to route
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- added redrawNote, zoomToNote, addRectangle and addSearchPointMarker methods
		- removed partial distance in the tooltip when readOnly
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var g_TravelNotesData = require ( '../L.TravelNotes' );

	var MapEditor = function ( ) {

		var m_DataSearchEngine  = require ( '../Data/DataSearchEngine' ) ( );

		/*
		--- m_UpdateRouteTooltip function -----------------------------------------------------------------------------

		This function updates the route tooltip with the distance when the mouse move on the polyline

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_UpdateRouteTooltip = function ( event ) { 
			var route = m_DataSearchEngine.getRoute (  event.target.objId );
			var distance = require ( '../core/RouteEditor' ) ( ).getClosestLatLngDistance ( route, [ event.latlng.lat, event.latlng.lng ] ).distance;
			distance += route.chainedDistance;
			distance = require ( '../util/Utilities' ) ( ).formatDistance ( distance );
			var polyline = g_TravelNotesData.mapObjects.get ( event.target.objId );
			polyline.closeTooltip ( );
			var tooltipText = m_DataSearchEngine.getRoute ( event.target.objId ).name;
			if ( ! g_TravelNotesData.travel.readOnly ) {
				tooltipText += ( 0 === tooltipText.length ? '' : ' - ' );
				tooltipText += distance;
			}
			polyline.setTooltipContent ( tooltipText );
			polyline.openTooltip (  event.latlng );
		};
	
		/*
		--- m_AddTo function ------------------------------------------------------------------------------------------

		This function add a leaflet object to the leaflet map and to the JavaScript map

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_AddTo = function ( objId, object ) {
			object.objId = objId;
			object.addTo ( g_TravelNotesData.map );
			g_TravelNotesData.mapObjects.set ( objId, object );
		};
		
		/*
		--- m_RemoveObject function -----------------------------------------------------------------------------------

		This function remove a leaflet object from the leaflet map and from the JavaScript map

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_RemoveObject = function ( objId ) {
			var layer = g_TravelNotesData.mapObjects.get ( objId );
			if ( layer ) {
				L.DomEvent.off ( layer );
				g_TravelNotesData.map.removeLayer ( layer );
				g_TravelNotesData.mapObjects.delete ( objId );
			}
		};
		
		/*
		--- m_GetLatLngBounds function --------------------------------------------------------------------------------

		This function build a L.latLngBounds object from an array of points

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetLatLngBounds = function ( latLngs ) {
			var sw = L.latLng ( [ 90, 180] );
			var ne = L.latLng ( [ -90, -180 ] );
			latLngs.forEach ( 
				function ( latLng ) {
					sw.lat = Math.min ( sw.lat, latLng [ 0 ] );
					sw.lng = Math.min ( sw.lng, latLng [ 1 ] );
					ne.lat = Math.max ( ne.lat, latLng [ 0 ] );
					ne.lng = Math.max ( ne.lng, latLng [ 1 ] );
				}
			);
			return L.latLngBounds( sw, ne );
		};
		
		/*
		--- m_GetRouteLatLng function ---------------------------------------------------------------------------------

		This function returns an array of points from a route and the notes linked to the route

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetRouteLatLng = function ( route ) {
			var latLngs = [];
			route.itinerary.itineraryPoints.forEach ( 
				function ( itineraryPoint ) {
					latLngs.push ( itineraryPoint.latLng );
				}
			);
			route.notes.forEach ( 
				function ( note ) {
					latLngs.push ( note.latLng );
					latLngs.push ( note.iconLatLng );
				}
			);
			return latLngs;
		};
		
		/*
		--- m_getDashArray function -----------------------------------------------------------------------------------

		This function returns the dashArray used for the polyline representation. See also leaflet docs

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_getDashArray = function ( route ) {
			if ( route.dashArray >= g_TravelNotesData.config.route.dashChoices.length ) {
				route.dashArray = 0;
			}
			var iDashArray = g_TravelNotesData.config.route.dashChoices [ route.dashArray ].iDashArray;
			if ( iDashArray ) {
				var dashArray = '';
				var dashCounter = 0;
				for ( dashCounter = 0; dashCounter < iDashArray.length - 1; dashCounter ++ ) {
					dashArray += iDashArray [ dashCounter ] * route.width + ',';
				}
				dashArray += iDashArray [ dashCounter ] * route.width ;
				
				return dashArray;
			}
			return null;
		};

		/*
		--- m_RemoveRoute function --------------------------------------------------------------------------------

		This function remove a route and eventually the attached notes and waypoints 
		from the leaflet map and the JavaScript map
		
		parameters:
		- route : a TravelNotes route object.
		- removeNotes : a boolean. Linked notes are removed when true
		- removeWayPoints : a boolean. Linked waypoints are removed when true

		-----------------------------------------------------------------------------------------------------------
		*/
		
		var m_RemoveRoute = function ( route, removeNotes, removeWayPoints ) {
			m_RemoveObject ( route.objId );
			if ( removeNotes ) {
				var notesIterator = route.notes.iterator;
				while ( ! notesIterator.done ) {
					m_RemoveObject ( notesIterator.value.objId );
				}
			}
			if ( removeWayPoints ) {
				var wayPointsIterator = route.wayPoints.iterator;
				while ( ! wayPointsIterator.done ) {
					m_RemoveObject ( wayPointsIterator.value.objId );
				}
			}
		};
				
		/*
		--- m_AddRoute function -----------------------------------------------------------------------------------

		This function add a route and eventually the attached notes and waypoints 
		to the leaflet map and the JavaScript map

		parameters:
		- route : a TravelNotes route object.
		- addNotes : a boolean. Attached notes are added when true
		- addWayPoints : a boolean. Attached waypoints are added when true
		- readOnly : a boolean. Created objects cannot be edited when true.

		-----------------------------------------------------------------------------------------------------------
		*/

		var m_AddRoute = function ( route, addNotes, addWayPoints, readOnly ) {
			readOnly = readOnly || false;
			
			// an array of points is created
			var latLng = [];
			var pointsIterator = route.itinerary.itineraryPoints.iterator;
			while ( ! pointsIterator.done ) {
				latLng.push ( pointsIterator.value.latLng );
			}
			
			// the leaflet polyline is created and added to the map
			var polyline = L.polyline ( latLng, { color : route.color, weight : route.width, dashArray : m_getDashArray ( route ) } );
			m_AddTo ( route.objId, polyline );
			// tooltip and popup are created
			polyline.bindTooltip ( 
				 route.name,
				{ sticky : true, direction : 'right' }
			);
			polyline.on ( 'mouseover' , m_UpdateRouteTooltip	);
			polyline.on ( 'mousemove' , m_UpdateRouteTooltip );
			
			polyline.bindPopup ( 
				function ( layer ) {
					var route = m_DataSearchEngine.getRoute ( layer.objId );
					return require ( '../core/RouteEditor' )( ).getRouteHTML ( route, 'TravelNotes-' );
				}
			);
			
			// left click event
			L.DomEvent.on ( polyline, 'click', function ( event ) { event.target.openPopup ( event.latlng ); } );
			// right click event
			if ( ! readOnly ) {
				L.DomEvent.on ( 
					polyline, 
					'contextmenu', 
					function ( event ) {
						require ( '../UI/ContextMenu' ) ( event, require ( '../UI/ContextMenuFactory' )( ).getRouteContextMenu ( event.target.objId ) );
					}
				);
			}
			
			// notes are added
			if ( addNotes ) {
				var notesIterator = route.notes.iterator;
				while ( ! notesIterator.done ) {
					m_AddNote ( notesIterator.value, readOnly );
				}
			}

			// waypoints are added
			if ( addWayPoints ) {
				var wayPointsIterator = g_TravelNotesData.editedRoute.wayPoints.iterator;
				while ( ! wayPointsIterator.done ) {
					m_AddWayPoint ( wayPointsIterator.value, wayPointsIterator .first ? 'A' : ( wayPointsIterator.last ? 'B' :  wayPointsIterator.index ) );
				}
			}
		};
			
		/*
		--- m_EditRoute function --------------------------------------------------------------------------------------

		This function changes the color and width of a route

		parameters:
		- route : a TravelNotes route object.

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_EditRoute = function ( route ) {
			var polyline = g_TravelNotesData.mapObjects.get ( route.objId );
			polyline.setStyle( { color : route.color, weight : route.width, dashArray : m_getDashArray ( route ) } );
		};
			
		/*
		--- m_RemoveAllObjects function ---------------------------------------------------------------------------

		This function remove all the objects from the leaflet map and from the JavaScript map

		-----------------------------------------------------------------------------------------------------------
		*/

		var m_RemoveAllObjects = function ( ) {
			g_TravelNotesData.mapObjects.forEach ( 
				function ( travelObjectValue, travelObjectKey, travelObjects ) {
					L.DomEvent.off ( travelObjectValue );
					g_TravelNotesData.map.removeLayer ( travelObjectValue );
				}
			);
			g_TravelNotesData.mapObjects.clear ( );
		};
		
		/*
		--- m_ZoomToPoint function ------------------------------------------------------------------------------------

		This function zoom on a given point

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ZoomToPoint = function ( latLng ) {
			g_TravelNotesData.map.setView ( latLng, g_TravelNotesData.config.itineraryPointZoom );
		};

		/*
		--- m_ZoomToSearchResult function -----------------------------------------------------------------------------

		This function zoom on a search result

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ZoomToSearchResult = function ( latLng, geometry ) {
			if ( geometry ) {
				var latLngs = [];
				geometry.forEach ( 
					function ( geometryPart ) {
						latLngs = latLngs.concat ( geometryPart );
					}
				);
				g_TravelNotesData.map.fitBounds ( m_GetLatLngBounds ( latLngs ) );
			}
			else
			{
				m_ZoomToPoint ( latLng );
			}
		};
		
		/*
		--- m_ZoomToNote function ------------------------------------------------------------------------------------

		This function zoom on a note

		parameters:
		- noteObjId : the TravelNotes objId of the desired note

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ZoomToNote = function ( noteObjId ) {
			m_ZoomToPoint ( m_DataSearchEngine.getNoteAndRoute ( noteObjId ).note.iconLatLng );
		};
			
		/*
		--- m_ZoomToRoute function ------------------------------------------------------------------------------------

		This function zoom on a route

		parameters:
		- routeObjId : the TravelNotes objId of the desired route

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ZoomToRoute = function ( routeObjId ) {
			var latLngs = m_GetRouteLatLng (  m_DataSearchEngine.getRoute ( routeObjId ) );
			if ( 0 !== latLngs.length ) {
				g_TravelNotesData.map.fitBounds ( m_GetLatLngBounds ( latLngs ) );
			}
		};

		/*
		--- m_ZoomToTravel function -----------------------------------------------------------------------------------

		This function zoom on the entire travel

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ZoomToTravel = function ( ) {				
			var latLngs = [];
			g_TravelNotesData.travel.routes.forEach (
				function ( route ) {
					latLngs = latLngs.concat ( m_GetRouteLatLng ( route ) );
				}
			);
			g_TravelNotesData.travel.notes.forEach (
				function ( note ) {
					latLngs.push ( note.latLng );
					latLngs.push ( note.iconLatLng );
				}
			);
			if ( 0 !== latLngs.length ) {
				g_TravelNotesData.map.fitBounds ( m_GetLatLngBounds ( latLngs ) );
			}
		};
			
		/*
		--- m_AddItineraryPointMarker function ------------------------------------------------------------------------

		This function add a leaflet circleMarker at a given point
		
		parameters:
		- objId : a unique identifier to attach to the circleMarker
		- latLng : the center of the circleMarker

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_AddItineraryPointMarker = function ( objId, latLng ) {
			m_AddTo ( 
				objId,
				L.circleMarker ( latLng, g_TravelNotesData.config.itineraryPointMarker )
			);
		};

		/*
		--- m_AddSearchPointMarker function ---------------------------------------------------------------------------

		This function add a leaflet circleMarker at a given point
		
		parameters:
		- objId : a unique identifier to attach to the circleMarker
		- latLng : the center of the circleMarker

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_AddSearchPointMarker = function ( objId, latLng, geometry ) {

			var showGeometry = false;
			if ( geometry ) {
				var latLngs = [];
				geometry.forEach ( 
					function ( geometryPart ) {
						latLngs = latLngs.concat ( geometryPart );
					}
				);
				var geometryBounds = m_GetLatLngBounds ( latLngs );
				var mapBounds = g_TravelNotesData.map.getBounds ( );
				showGeometry = ( ( geometryBounds.getEast ( ) - geometryBounds.getWest ( ) ) / (  mapBounds.getEast ( ) - mapBounds.getWest ( ) ) ) > 0.01 &&
					( ( geometryBounds.getNorth ( ) - geometryBounds.getSouth ( ) ) / (  mapBounds.getNorth ( ) - mapBounds.getSouth ( ) ) ) > 0.01;
			}
			if ( showGeometry ) {
				m_AddTo ( objId, L.polyline ( geometry, g_TravelNotesData.config.searchPointPolyline ) );
			}
			else {
				m_AddTo ( objId, L.circleMarker ( latLng, g_TravelNotesData.config.searchPointMarker ) );
			}
		};
			
		/*
		--- m_AddRectangle method -----------------------------------------------------------------------------------

		This method draw a rectangle on the map
		
		parameters:
		- objId : a unique identifier to attach to the rectangle
		- bounds : the lower left and upper right corner of the rectangle ( see leaflet docs )
		- properties : the properties of the rectangle 

		-----------------------------------------------------------------------------------------------------------
		*/

		var m_AddRectangle = function ( objId, bounds, properties ) {
			m_AddTo (
				objId,
				L.rectangle ( bounds, properties )
			);
		};
		
		/*
		--- m_AddWayPoint function ------------------------------------------------------------------------------------

		This function add a TravelNotes waypoint object to the leaflet map

		parameters:
		- wayPoint : a TravelNotes waypoint object
		- letter : the letter to be displayed under the waypoint

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_AddWayPoint = function ( wayPoint, letter ) {
			if ( ( 0 === wayPoint.lat ) && ( 0 === wayPoint.lng  ) ) {
				return;
			}
			
			// a HTML element is created, with different class name, depending of the waypont position. See also WayPoints.css
			var iconHtml = '<div class="TravelNotes-WayPoint TravelNotes-WayPoint' + 
			( 'A' === letter ? 'Start' : ( 'B' === letter ? 'End' : 'Via' ) ) + 
			'"></div><div class="TravelNotes-WayPointText">' + letter + '</div>';
			
			// a leaflet marker is created...
			var marker = L.marker ( 
				wayPoint.latLng,
				{ 
					icon : L.divIcon ( { iconSize: [ 40 , 40 ], iconAnchor: [ 20, 40 ], html : iconHtml, className : 'TravelNotes-WayPointStyle' } ),
					draggable : true
				} 
			);	

			marker.bindTooltip ( function ( wayPoint ) { return m_DataSearchEngine.getWayPoint ( wayPoint.objId ).UIName; } );
			marker.getTooltip ( ).options.offset  = [ 20, -20 ];

			L.DomEvent.on ( 
				marker, 
				'contextmenu', 
				function ( event ) { 
					require ( '../UI/ContextMenu' ) ( event, require ( '../UI/ContextMenuFactory' ) ( ).getWayPointContextMenu ( event.target.objId ) );	
				}
			);
			
			// ... and added to the map...
			marker.objId = wayPoint.objId;
			m_AddTo ( wayPoint.objId, marker );
			
			// ... and a dragend event listener is created
			L.DomEvent.on (
				marker,
				'dragend', 
				function ( event ) {
					var wayPoint = g_TravelNotesData.editedRoute.wayPoints.getAt ( event.target.objId );
					wayPoint.latLng = [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng ];
					require ( '../core/WaypointEditor' )( ).wayPointDragEnd ( event.target.objId );
				}
			);
		};

		/*
		--- m_RedrawNote function -------------------------------------------------------------------------------------

		This function redraw a note object on the leaflet map

		parameters:
		- note : a TravelNotes note object

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_RedrawNote = function  ( note ) {
			m_RemoveObject ( note.objId );
			m_AddNote ( note );
		};
			
		/*
		--- m_AddNote function ----------------------------------------------------------------------------------------

		This function add a TravelNotes note object to the leaflet map

		parameters:
		- note : a TravelNotes note object
		- readOnly : a boolean. Created objects cannot be edited when true

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_AddNote = function ( note, readOnly ) {
			
			readOnly = readOnly || false;
			
			// first a marker is created at the note position. This marker is empty and transparent, so 
			// not visible on the map but the marker can be dragged
			var bullet = L.marker ( 
				note.latLng,
				{ 
					icon : L.divIcon ( 
						{ 
							iconSize: [ 
								g_TravelNotesData.config.note.grip.size , 
								g_TravelNotesData.config.note.grip.size
							], 
							iconAnchor: [ 
								g_TravelNotesData.config.note.grip.size / 2,
								g_TravelNotesData.config.note.grip.size / 2 
							],
							html : '<div></div>'
						}
					),
					zIndexOffset : -1000 ,
					opacity : g_TravelNotesData.config.note.grip.opacity,
					draggable : ! readOnly
				} 
			);	
			bullet.objId = note.objId;
			
			if ( ! readOnly ) {
				// event listener for the dragend event
				L.DomEvent.on ( 
					bullet, 
					'dragend', 
					function ( event ) {
						// the TravelNotes note and route are searched...
						var noteAndRoute = m_DataSearchEngine.getNoteAndRoute ( event.target.objId );
						var note = noteAndRoute.note;
						var route = noteAndRoute.route;
						// ... then the layerGroup is searched...
						var layerGroup = g_TravelNotesData.mapObjects.get ( event.target.objId );
						if ( null != route ) {
							// the note is attached to the route, so we have to find the nearest point on the route and the distance since the start of the route
							var latLngDistance = require ( '../core/RouteEditor' ) ( ).getClosestLatLngDistance ( route, [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng] );
							// coordinates and distance are changed in the note
							note.latLng = latLngDistance.latLng;
							note.distance = latLngDistance.distance;
							// notes are sorted on the distance
							route.notes.sort ( function ( a, b ) { return a.distance - b.distance; } );
							// the coordinates of the bullet are adapted
							layerGroup.getLayer ( layerGroup.bulletId ).setLatLng ( latLngDistance.latLng );
							require ( '../UI/DataPanesUI' ) ( ).updateItinerary ( );
						}
						else {
							// the note is not attached to a route, so the coordinates of the note can be directly changed
							note.latLng = [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng ];
							require ( '../UI/DataPanesUI' ) ( ).updateTravelNotes ( );
						}
						// in all cases, the polyline is updated
						layerGroup.getLayer ( layerGroup.polylineId ).setLatLngs ( [ note.latLng, note.iconLatLng ] );
						// and the HTML page is adapted
						require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
					}
				);
				// event listener for the drag event
				L.DomEvent.on ( 
					bullet, 
					'drag', 
					function ( event ) {
						var note = m_DataSearchEngine.getNoteAndRoute ( event.target.objId ).note;
						var layerGroup = g_TravelNotesData.mapObjects.get ( event.target.objId );
						layerGroup.getLayer ( layerGroup.polylineId ).setLatLngs ( [ [ event.latlng.lat, event.latlng.lng ], note.iconLatLng ] );
					}
				);
			}
			
			// a second marker is now created. The icon created by the user is used for this marker
			var icon = L.divIcon (
				{ 
					iconSize: [ note.iconWidth, note.iconHeight ], 
					iconAnchor: [note.iconWidth / 2, note.iconHeight / 2 ],
					popupAnchor: [ 0, - note.iconHeight / 2 ], 
					html : note.iconContent,
					className : g_TravelNotesData.config.note.style
				}
			);
			var marker = L.marker ( 
				note.iconLatLng,
				{
					icon : icon,
					draggable : ! readOnly
				}
			);	
			marker.objId = note.objId;
			
			// a popup is binded to the the marker...
			marker.bindPopup (
				function ( layer ) {
					var note = m_DataSearchEngine.getNoteAndRoute ( layer.objId ).note;
					return require ( '../core/NoteEditor' )( ).getNoteHTML ( note, 'TravelNotes-' );
				}			
			);
			
			// ... and also a tooltip
			if ( 0 !== note.tooltipContent.length ) {
				marker.bindTooltip ( function ( layer ) { return m_DataSearchEngine.getNoteAndRoute ( layer.objId ).note.tooltipContent; } );
				marker.getTooltip ( ).options.offset [ 0 ] = note.iconWidth / 2;
			}
			if ( ! readOnly ) {
				// event listener for the contextmenu event
				L.DomEvent.on ( 
					marker, 
					'contextmenu', 
					function ( event ) { 
						require ( '../UI/ContextMenu' ) ( event, require ( '../UI/ContextMenuFactory' ) ( ).getNoteContextMenu ( event.target.objId ) );	
					}
				);
				// event listener for the dragend event
				L.DomEvent.on ( 
					marker, 
					'dragend',
					function ( event ) {
						// The TravelNotes note linked to the marker is searched...
						var note = m_DataSearchEngine.getNoteAndRoute ( event.target.objId ).note;
						// ... new coordinates are saved in the TravelNotes note...
						note.iconLatLng = [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng ];
						// ... then the layerGroup is searched...
						var layerGroup = g_TravelNotesData.mapObjects.get ( event.target.objId );
						// ... and finally the polyline is updated with the new coordinates
						layerGroup.getLayer ( layerGroup.polylineId ).setLatLngs ( [ note.latLng, note.iconLatLng ] );
					}
				);
				// event listener for the drag event
				L.DomEvent.on ( 
					marker, 
					'drag',
					function ( event ) {
						// The TravelNotes note linked to the marker is searched...
						var note = m_DataSearchEngine.getNoteAndRoute ( event.target.objId ).note;
						// ... then the layerGroup is searched...
						var layerGroup = g_TravelNotesData.mapObjects.get ( event.target.objId );
						// ... and finally the polyline is updated with the new coordinates
						layerGroup.getLayer ( layerGroup.polylineId ).setLatLngs ( [ note.latLng, [ event.latlng.lat, event.latlng.lng ] ] );
					}
				);
			}
			
			// Finally a polyline is created between the 2 markers
			var polyline = L.polyline ( [ note.latLng, note.iconLatLng ], g_TravelNotesData.config.note.polyline );
			polyline.objId = note.objId;
			
			// The 3 objects are added to a layerGroup
			var layerGroup = L.layerGroup ( [ marker, polyline, bullet ] );
			layerGroup.markerId = L.Util.stamp ( marker );
			layerGroup.polylineId = L.Util.stamp ( polyline );
			layerGroup.bulletId = L.Util.stamp ( bullet );
			
			// and the layerGroup added to the leaflet map and JavaScript map
			m_AddTo ( note.objId, layerGroup );
		};

		/*
		--- m_EditNote function ---------------------------------------------------------------------------------------

		This function changes a note after edition by the user

		parameters:
		- note : the TravelNotes note object modified by the user
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_EditNote = function ( note ) {
			
			// a new icon is created
			var icon = L.divIcon (
				{ 
					iconSize: [ note.iconWidth, note.iconHeight ], 
					iconAnchor: [note.iconWidth / 2, note.iconHeight / 2 ],
					popupAnchor: [ 0, -note.iconHeight / 2 ], 
					html : note.iconContent,
					className : g_TravelNotesData.config.note.style
				}
			);
			// and the marker icon replaced by the new one
			var layerGroup = g_TravelNotesData.mapObjects.get ( note.objId );
			var marker = layerGroup.getLayer ( layerGroup.markerId );
			marker.setIcon ( icon );
			
			// then, the tooltip is changed
			marker.unbindTooltip ( );
			if ( 0 !== note.tooltipContent.length ) {
				marker.bindTooltip ( function ( layer ) { return m_DataSearchEngine.getNoteAndRoute ( layer.objId ).note.tooltipContent; } );
				marker.getTooltip ( ).options.offset [ 0 ] = note.iconWidth / 2;
			}
			if ( marker.isPopupOpen( ) ) {
				marker.closePopup ( );
				marker.openPopup ( );
			}
		};
		
		/*
		--- MapEditor object ------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{
				
				removeRoute : function ( route, removeNotes, removeWayPoints ) { m_RemoveRoute ( route, removeNotes, removeWayPoints ); },
				
				addRoute : function ( route, addNotes, addWayPoints, readOnly ) { m_AddRoute ( route, addNotes, addWayPoints, readOnly ); },
				
				editRoute : function ( route ) { m_EditRoute ( route ); },
				
				removeObject : function ( objId ) { m_RemoveObject ( objId ); },
				
				removeAllObjects : function ( ) { m_RemoveAllObjects ( ); },
				
				zoomToPoint : function ( latLng ) { m_ZoomToPoint ( latLng ); },
				
				zoomToSearchResult : function ( latLng, geometry ) { m_ZoomToSearchResult ( latLng, geometry ); },
				
				zoomToNote : function ( noteObjId ) { m_ZoomToNote ( noteObjId ); },
				
				zoomToRoute : function ( routeObjId ) { m_ZoomToRoute ( routeObjId );  },
				
				zoomToTravel : function ( ) { m_ZoomToTravel ( ); },

				addItineraryPointMarker : function ( objId, latLng ) { m_AddItineraryPointMarker ( objId, latLng ); },
				
				addSearchPointMarker : function ( objId, latLng, geometry ) { m_AddSearchPointMarker ( objId, latLng, geometry ); },

				addRectangle : function ( objId, bounds, properties ) { m_AddRectangle ( objId, bounds, properties ); },
				
				addWayPoint : function ( wayPoint, letter ) { m_AddWayPoint  ( wayPoint, letter ); },

				redrawNote : function  ( note ) { m_RedrawNote ( note ); },
				
				addNote : function ( note, readOnly ) { m_AddNote ( note, readOnly ); },			
				
				editNote : function ( note ) { m_EditNote ( note ); }
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = MapEditor;
	}

}());

/*
--- End of MapEditor.js file ------------------------------------------------------------------------------------------
*/
},{"../Data/DataSearchEngine":3,"../L.TravelNotes":8,"../UI/ContextMenu":12,"../UI/ContextMenuFactory":13,"../UI/DataPanesUI":14,"../core/NoteEditor":35,"../core/RouteEditor":37,"../core/TravelEditor":40,"../core/WaypointEditor":41,"../util/Utilities":58}],35:[function(require,module,exports){
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

/*
--- NoteEditor.js file -------------------------------------------------------------------------------------------------
This file contains:
	- the NoteEditor object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- added newSearchNote method and modified endNoteDialog for update of the travel note pane
		- added attachNoteToRoute and detachNoteFromRoute methods
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var g_TravelNotesData = require ( '../L.TravelNotes' );
	
	var NoteEditor = function ( ) {
		
		var m_Translator = require ( '../UI/Translator' ) ( );
		var m_DataSearchEngine  = require ( '../Data/DataSearchEngine' ) ( );
	
		/*
		--- m_AttachNoteToRoute function ------------------------------------------------------------------------------

		This function transform a travel note into a route note ( when possible )
		
		parameters:
		- noteObjId : the objId of the note to transform

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_AttachNoteToRoute = function ( noteObjId ) {
			var noteAndRoute = m_DataSearchEngine.getNoteAndRoute ( noteObjId );
			var distance = Number.MAX_VALUE;
			var selectedRoute = null;
			var newNoteLatLng = null;
			var newNoteDistance = null;

			g_TravelNotesData.travel.routes.forEach ( 
				function ( route ) {
					var pointAndDistance = require ( '../core/RouteEditor' ) ( ).getClosestLatLngDistance ( route, noteAndRoute.note.latLng );
					if ( pointAndDistance ) {
						var distanceToRoute = L.latLng ( noteAndRoute.note.latLng ).distanceTo ( L.latLng ( pointAndDistance.latLng ) );
						if ( distanceToRoute < distance ) {
							distance = distanceToRoute;
							selectedRoute = route;
							newNoteLatLng = pointAndDistance.latLng;
							newNoteDistance = pointAndDistance.distance;
						}
					}
				}
			);
			
			if ( selectedRoute ) {
				g_TravelNotesData.travel.notes.remove (  noteObjId );
				noteAndRoute.note.distance = newNoteDistance;
				noteAndRoute.note.latLng = newNoteLatLng;
				noteAndRoute.note.chainedDistance = selectedRoute.chainedDistance;

				// ... the chainedDistance is adapted...
				selectedRoute.notes.add ( noteAndRoute.note );
				// and the notes sorted
				selectedRoute.notes.sort ( function ( a, b ) { return a.distance - b.distance; } );

				require ( '../core/MapEditor' ) ( ).redrawNote ( noteAndRoute.note );
				require ( '../UI/DataPanesUI' ) ( ).updateItinerary ( );
				require ( '../UI/DataPanesUI' ) ( ).updateTravelNotes ( );
				// and the HTML page is adapted
				require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
			}
		};

		/*
		--- m_DetachNoteFromRoute function ----------------------------------------------------------------------------

		This function transform a route note into a travel note
		
		parameters:
		- noteObjId : the objId of the note to transform

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_DetachNoteFromRoute = function ( noteObjId ) {
			// the note and the route are searched
			var noteAndRoute = m_DataSearchEngine.getNoteAndRoute ( noteObjId );
			noteAndRoute.route.notes.remove ( noteObjId );
			noteAndRoute.note.distance = -1;
			noteAndRoute.note.chainedDistance = 0;
			g_TravelNotesData.travel.notes.add ( noteAndRoute.note );
			
			require ( '../UI/DataPanesUI' ) ( ).updateItinerary ( );
			require ( '../UI/DataPanesUI' ) ( ).updateTravelNotes ( );
			// and the HTML page is adapted
			require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
		};

		/*
		--- m_NewNote function ----------------------------------------------------------------------------------------

		This function create a new TravelNotes note object
		
		parameters:
		- latLng : the coordinates of the new note

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_NewNote = function ( latLng ) {
			var note = require ( '../data/Note' ) ( );
			note.latLng = latLng;
			note.iconLatLng = latLng;
			
			return note;
		};
		
		/*
		--- m_NewRouteNote function -----------------------------------------------------------------------------------

		This function start the creation of a TravelNotes note object linked with a route
		
		parameters:
		- routeObjId : the objId of the route to witch the note will be linked
		- event : the event that have triggered the method ( a right click on the 
		route polyline and then a choice in a context menu)

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_NewRouteNote = function ( routeObjId, event ) {
			// the nearest point and distance on the route is searched
			var latLngDistance = require ( '../core/RouteEditor' ) ( ).getClosestLatLngDistance ( 
				m_DataSearchEngine.getRoute ( routeObjId ),
				[ event.latlng.lat, event.latlng.lng ] 
			);
			
			// the note is created
			var note = m_NewNote ( latLngDistance.latLng );
			note.distance = latLngDistance.distance;
			
			// and displayed in a dialog box
			require ( '../UI/NoteDialog' ) ( note, routeObjId, true );
		};
		
		/*
		--- m_NewSearchNote function ----------------------------------------------------------------------------------

		This function start the creation of a TravelNotes note object linked to a search
		
		parameters:
		- searchResult : the search results with witch the note will be created

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_NewSearchNote = function ( searchResult ) {
			var note = m_NewNote ( [ searchResult.lat, searchResult.lon ] );
			
			note.address = ( searchResult.tags [ 'addr:housenumber' ] ? searchResult.tags [ 'addr:housenumber' ] + ' ' : '' ) +
				( searchResult.tags [ 'addr:street' ] ? searchResult.tags [ 'addr:street' ] + ' ' : '' ) +
				( searchResult.tags [ 'addr:city' ] ? searchResult.tags [ 'addr:city' ] + ' ' : '' );
			
			note.url = searchResult.tags.website || '';
			note.phone = searchResult.tags.phone || '';
			note.tooltipContent = searchResult.tags.name || '';
			note.popupContent = searchResult.tags.name || '';
			
			require ( '../UI/NoteDialog' ) ( note, -1, true );
		};
		
		/*
		--- m_NewManeuverNote function --------------------------------------------------------------------------------

		This function start the creation of a TravelNotes note object linked to a maneuver
		
		parameters:
		- maneuverObjId : the objId of the maneuver
		- latLng : the coordinates of the maneuver

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_NewManeuverNote = function ( maneuverObjId, latLng ) {
			// the nearest point and distance on the route is searched
			var latLngDistance = require ( '../core/RouteEditor' ) ( ).getClosestLatLngDistance ( 
				g_TravelNotesData.editedRoute,
				latLng
			);
			// the maneuver is searched
			var maneuver = g_TravelNotesData.editedRoute.itinerary.maneuvers.getAt ( maneuverObjId );

			// the note is created
			var note = m_NewNote ( latLng );
			note.distance = latLngDistance.distance;
			note.iconContent = "<div class='TravelNotes-ManeuverNote TravelNotes-ManeuverNote-" + maneuver.iconName + "'></div>";
			note.popupContent = maneuver.instruction;
			note.iconWidth = 40;
			note.iconHeight = 40;

			// and displayed in a dialog box
			require ( '../UI/NoteDialog' ) ( note, g_TravelNotesData.editedRoute.objId, true );
		};

		/*
		--- m_NewTravelNote function ----------------------------------------------------------------------------------

		This function start the creation f a TravelNotes note object
		
		parameters:
		- latLng : the coordinates of the new note

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_NewTravelNote = function ( latLng ) {
			// the note is created
			var note = m_NewNote ( latLng );

			// and displayed in a dialog box
			require ( '../UI/NoteDialog' ) ( note, -1, true );
		};

		/*
		--- m_AfterNoteDialog function --------------------------------------------------------------------------------

		This function is called when the user push on the ok button of the note dialog
		
		parameters:
		- note : the note modified in the dialog box
		- routeObjId : the TravelNotes route objId passed to the note dialog box

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_AfterNoteDialog = function ( note, routeObjId ) {
			var noteAndRoute = m_DataSearchEngine.getNoteAndRoute ( note.objId );
			if ( noteAndRoute.note ) {
				// it's an existing note. The note is changed on the map
				require ( '../core/MapEditor' ) ( ).redrawNote ( note );
				if ( ! noteAndRoute.route ) {
					// it's a travel note. UI is also adapted
					require ( '../UI/DataPanesUI' ) ( ).setTravelNotes ( );
				}
				else {
					require ( '../UI/DataPanesUI' ) ( ).setItinerary ( );
				}
			}
			else {
				// it's a new note
				if ( -1 === routeObjId ) {
					// it's a global note
					g_TravelNotesData.travel.notes.add ( note );
					require ( '../UI/DataPanesUI' ) ( ).setTravelNotes ( );
				}
				else {
					// the note is linked with a route, so...
					var route = m_DataSearchEngine.getRoute ( routeObjId );
					route.notes.add ( note );
					// ... the chainedDistance is adapted...
					note.chainedDistance = route.chainedDistance;
					// and the notes sorted
					route.notes.sort ( function ( a, b ) { return a.distance - b.distance; } );
					// and in the itinerary is adapted...
					require ( '../UI/DataPanesUI' ) ( ).setItinerary ( );
				}
				// the note is added to the leaflet map
				require ( '../core/MapEditor' ) ( ).addNote ( note );
			}
			// and the HTML page is adapted
			require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
		};
		
		/*
		--- m_EditNote function ---------------------------------------------------------------------------------------

		This function start the modification of a note
		
		parameters:
		- noteObjId : the objId of the edited note

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_EditNote = function ( noteObjId ) {
			var noteAndRoute = m_DataSearchEngine.getNoteAndRoute ( noteObjId );
			require ( '../UI/NoteDialog' ) ( noteAndRoute.note, null === noteAndRoute.route ? -1 : noteAndRoute.route.objId, false );
		};

		/*
		--- m_RemoveNote function -------------------------------------------------------------------------------------

		This function removes a note
		
		parameters:
		- noteObjId : the objId of the note to remove

		-----------------------------------------------------------------------------------------------------------
		*/

		var m_RemoveNote = function ( noteObjId ) {
			// the note is removed from the leaflet map
			require ( '../core/MapEditor' ) ( ).removeObject ( noteObjId );
			// the note and the route are searched
			var noteAndRoute = m_DataSearchEngine.getNoteAndRoute ( noteObjId );
			if ( noteAndRoute.route ) {
				// it's a route note
				noteAndRoute.route.notes.remove ( noteObjId );
				require ( '../UI/DataPanesUI' ) ( ).updateItinerary ( );
			}
			else {
				// it's a travel note
				g_TravelNotesData.travel.notes.remove ( noteObjId );
				require ( '../UI/DataPanesUI' ) ( ).updateTravelNotes( );
			}
			// and the HTML page is adapted
			require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
		};
		
		/*
		--- m_HideNotes function --------------------------------------------------------------------------------------

		This function hide the notes on the map
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_HideNotes = function ( ) {
			var notesIterator = g_TravelNotesData.travel.notes.iterator;
			while ( ! notesIterator.done ) {
				require ( '../core/MapEditor' ) ( ).removeObject ( notesIterator.value.objId );
			}
			var routesIterator = g_TravelNotesData.travel.routes.iterator;
			while ( ! routesIterator.done ) {
				notesIterator = routesIterator.value.notes.iterator;
				while ( ! notesIterator.done ) {
					require ( '../core/MapEditor' ) ( ).removeObject ( notesIterator.value.objId );					
				}
			}
		};
			
		/*
		--- m_ShowNotes function --------------------------------------------------------------------------------------

		This function show the notes on the map
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ShowNotes = function ( ) {
			m_HideNotes ( );
			var notesIterator = g_TravelNotesData.travel.notes.iterator;
			while ( ! notesIterator.done ) {
				require ( '../core/MapEditor' ) ( ).addNote ( notesIterator.value );
			}
			var routesIterator = g_TravelNotesData.travel.routes.iterator;
			while ( ! routesIterator.done ) {
				notesIterator = routesIterator.value.notes.iterator;
				while ( ! notesIterator.done ) {
					require ( '../core/MapEditor' ) ( ).addNote ( notesIterator.value );					
				}
			}
		};
			
		/*
		--- m_ZoomToNote function -------------------------------------------------------------------------------------

		This function zoom to a given note
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ZoomToNote = function ( noteObjId ) {
			require ( '../core/MapEditor' ) ( ).zoomToPoint ( m_DataSearchEngine.getNoteAndRoute ( noteObjId).note.latLng );
		};
		
		/*
		--- m_NoteDropped function ------------------------------------------------------------------------------------

		This function changes the position of a note after a drag and drop
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_NoteDropped = function(  draggedNoteObjId, targetNoteObjId, draggedBefore ) {
			g_TravelNotesData.travel.notes.moveTo ( draggedNoteObjId, targetNoteObjId, draggedBefore );
			require ( '../UI/DataPanesUI' ) ( ).updateTravelNotes( );
			require ( '../core/TravelEditor' ) ( ).updateRoadBook ( );
		};
			
		/*
		--- m_GetNoteHTML function --------------------------------------------------------------------------------------

		This function returns an HTML string with the note contents. This string will be used in the
		note popup and on the roadbook page
		
		parameters:
		- note : the TravelNotes object
		- classNamePrefix : a string that will be added to all the HTML classes

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetNoteHTML = function ( note, classNamePrefix ) {
		
			var noteText = '';
			if ( 0 !== note.tooltipContent.length ) {
				noteText += '<div class="' + classNamePrefix + 'NoteHtml-TooltipContent">' + note.tooltipContent + '</div>';
			}
			if ( 0 !== note.popupContent.length ) {
				noteText += '<div class="' + classNamePrefix + 'NoteHtml-PopupContent">' + note.popupContent + '</div>';
			}
			if ( 0 !== note.address.length ) {
				noteText += '<div class="' + classNamePrefix + 'NoteHtml-Address">' + m_Translator.getText ( 'NoteEditor - Address' )  + note.address + '</div>';
			}
			if ( 0 !== note.phone.length ) {
				noteText += '<div class="' + classNamePrefix + 'NoteHtml-Phone">' + m_Translator.getText ( 'NoteEditor - Phone' )  + note.phone + '</div>';
			}
			if ( 0 !== note.url.length ) {
				noteText += '<div class="' + classNamePrefix + 'NoteHtml-Url">' + m_Translator.getText ( 'NoteEditor - Link' ) + '<a href="' + note.url + '" target="_blank">' + note.url.substr ( 0, 40 ) + '...' +'</a></div>';
			}
			var utilities = require ( '../util/Utilities' ) ( );
			noteText += '<div class="' + classNamePrefix + 'NoteHtml-LatLng">' + 
				m_Translator.getText ( 
					'NoteEditor - Latitude Longitude',
					{ 
						lat : utilities.formatLat ( note.lat ),
						lng : utilities.formatLng ( note.lng )
					}
				) + '</div>';
				
			if ( -1 !== note.distance ) {
				noteText += '<div class="' + classNamePrefix + 'NoteHtml-Distance">' +
					m_Translator.getText ( 
						'NoteEditor - Distance', 
						{ 
							distance: utilities.formatDistance ( note.chainedDistance + note.distance )
						}
					) + '</div>';
			}
			
			return noteText;
		};
				
		/*
		--- noteEditor object -----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{	
			
				newRouteNote : function ( routeObjId, event ) { m_NewRouteNote ( routeObjId, event ); },
				
				newSearchNote : function ( searchResult ) { m_NewSearchNote ( searchResult ); },
			
				newManeuverNote : function ( maneuverObjId, latLng ) { m_NewManeuverNote ( maneuverObjId, latLng ); },
			
				newTravelNote : function ( latLng ) { m_NewTravelNote ( latLng ); },
			
				afterNoteDialog : function ( note, routeObjId ) { m_AfterNoteDialog ( note, routeObjId ); },	
			
				editNote : function ( noteObjId ) {	m_EditNote ( noteObjId ); },
			
				removeNote : function ( noteObjId ) { m_RemoveNote ( noteObjId ); },
			
				hideNotes : function ( ) { m_HideNotes ( ); },
				
				showNotes : function ( ) { m_ShowNotes ( ); },
				
				zoomToNote : function ( noteObjId ) { m_ZoomToNote ( noteObjId ); },
							
				attachNoteToRoute : function ( noteObjId ) { m_AttachNoteToRoute ( noteObjId ); },
				
				detachNoteFromRoute : function ( noteObjId ) { m_DetachNoteFromRoute ( noteObjId ); },
				
				noteDropped : function ( draggedNoteObjId, targetNoteObjId, draggedBefore ) { m_NoteDropped (  draggedNoteObjId, targetNoteObjId, draggedBefore ); },
				
				getNoteHTML : function ( note, classNamePrefix ) { return m_GetNoteHTML ( note, classNamePrefix ); }		
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = NoteEditor;
	}

}());

/*
--- End of NoteEditor.js file -----------------------------------------------------------------------------------------
*/
},{"../Data/DataSearchEngine":3,"../L.TravelNotes":8,"../UI/DataPanesUI":14,"../UI/NoteDialog":20,"../UI/Translator":26,"../core/MapEditor":34,"../core/RouteEditor":37,"../core/TravelEditor":40,"../data/Note":49,"../util/Utilities":58}],36:[function(require,module,exports){
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

/*
--- OsmSearchEngine.js file -------------------------------------------------------------------------------------------
This file contains:
	- 
Changes:
	- v1.4.0:
		- created

Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var g_TravelNotesData = require ( '../L.TravelNotes' );

	var s_OsmSearchStarted = false;
	var s_SearchParameters = { searchPhrase : '', bbox : null };
	var s_PreviousSearchRectangleObjId = -1;
	var s_NextSearchRectangleObjId = -1;
	var s_SearchLimits = ( window.osmSearch ) ? window.osmSearch.searchLimits : null;
	
	/*
	--- s_DrawSearchRectangle function --------------------------------------------------------------------------------

	This function draw the search limits on the map

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	var s_DrawSearchRectangle = function ( ) {
		if ( ! s_SearchParameters.bbox ) {
			return;
		}
		if ( -1 !== s_PreviousSearchRectangleObjId ) {
			require ( '../core/MapEditor' ) ( ).removeObject ( s_PreviousSearchRectangleObjId );
		}
		else {
			s_PreviousSearchRectangleObjId = require ( '../data/ObjId' ) ( );
		}
		require ( '../core/MapEditor' ) ( ).addRectangle ( 
			s_PreviousSearchRectangleObjId, 
			L.latLngBounds ( s_SearchParameters.bbox.southWest, s_SearchParameters.bbox.northEast ) , 
			g_TravelNotesData.config.previousSearchLimit 
		);
	};
	
	/*
	--- onSearchSuccess function --------------------------------------------------------------------------------------

	Promise success function for osmSearch

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSearchSuccess = function ( searchData ) {
		g_TravelNotesData.searchData = searchData;
		s_OsmSearchStarted = false;
		s_DrawSearchRectangle ( );
		require ( '../UI/DataPanesUI' ) ( ).updateSearch ( );
	};
	
	/*
	--- onSearchError function ----------------------------------------------------------------------------------------

	Promise error function for osmSearch

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSearchError = function ( error ) {
		console.log ( error );
		s_OsmSearchStarted = false;
	};

	/*
	--- onMapChange function ------------------------------------------------------------------------------------------

	change event listener for the map

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onMapChange = function ( event ) {
		var mapCenter = g_TravelNotesData.map.getCenter ( );
		if ( -1 !== s_NextSearchRectangleObjId ) {
			require ( '../core/MapEditor' ) ( ).removeObject ( s_NextSearchRectangleObjId );
		}
		else {
			s_NextSearchRectangleObjId = require ( '../data/ObjId' ) ( );
		}
		require ( '../core/MapEditor' ) ( ).addRectangle ( 
			s_NextSearchRectangleObjId, 
			L.latLngBounds ( L.latLng ( mapCenter.lat - s_SearchLimits.lat, mapCenter.lng - s_SearchLimits.lng ), L.latLng (  mapCenter.lat + s_SearchLimits.lat, mapCenter.lng + s_SearchLimits.lng ) ), 
			g_TravelNotesData.config.nextSearchLimit );
	};

	/*
	--- osmSearchEngine function --------------------------------------------------------------------------------------

	This function returns the osmSearchEngine object

	-------------------------------------------------------------------------------------------------------------------
	*/

	var osmSearchEngine = function ( ) {

		/*
		--- m_Search function -----------------------------------------------------------------------------------------

		This function start the search

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Search = function ( ) {
			if ( s_OsmSearchStarted ) {
				return;
			}
			
			s_OsmSearchStarted = true;
			
			var mapBounds =  g_TravelNotesData.map.getBounds ( );
			s_SearchParameters = {
				bbox : { southWest : mapBounds.getSouthWest ( ), northEast : mapBounds.getNorthEast ( ) },
				searchPhrase : document.getElementById ( 'TravelNotes-Control-SearchInput' ).value
			};
			g_TravelNotesData.searchData = [];
			window.osmSearch.getSearchPromise ( s_SearchParameters ).then (  onSearchSuccess, onSearchError  );
		};
		
		/*
		--- m_Show function -------------------------------------------------------------------------------------------

		This function enable maps event and draw the search limits

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Show = function ( ) {
			g_TravelNotesData.map.on ( 'zoom', onMapChange );
			g_TravelNotesData.map.on ( 'move', onMapChange );
			onMapChange ( );
			s_DrawSearchRectangle ( );
		};
		
		/*
		--- m_Show function -------------------------------------------------------------------------------------------

		This function disable maps event and remove the search limits

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Hide = function ( ) {
			g_TravelNotesData.map.off ( 'zoom', onMapChange );
			g_TravelNotesData.map.off ( 'move', onMapChange );
			if ( -1 !== s_NextSearchRectangleObjId ) {
				require ( '../core/MapEditor' ) ( ).removeObject ( s_NextSearchRectangleObjId );
				s_NextSearchRectangleObjId = -1;
			}
			if ( -1 !== s_PreviousSearchRectangleObjId ) {
				require ( '../core/MapEditor' ) ( ).removeObject ( s_PreviousSearchRectangleObjId );
				s_PreviousSearchRectangleObjId = -1;
			}
		};
		
		/*
		--- osmSearchEngine object ------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/
		
		return Object.seal (
			{
				search : function ( ) { m_Search ( ); },
				
				show : function ( ) { m_Show ( ); },
				
				hide : function ( ) { m_Hide ( ); }
			}
		);
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = osmSearchEngine;
	}

}());

/*
--- End of OsmSearchEngine.js file ------------------------------------------------------------------------------------
*/		
},{"../L.TravelNotes":8,"../UI/DataPanesUI":14,"../core/MapEditor":34,"../data/ObjId":50}],37:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"../Data/DataSearchEngine":3,"../L.TravelNotes":8,"../UI/DataPanesUI":14,"../UI/RouteEditorUI":22,"../UI/RoutePropertiesDialog":23,"../UI/Translator":26,"../UI/TravelEditorUI":27,"../core/MapEditor":34,"../core/NoteEditor":35,"../core/Router":38,"../core/TravelEditor":40,"../data/ItineraryPoint":47,"../data/Route":52,"../util/Utilities":58,"dup":2}],38:[function(require,module,exports){
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

/*
--- Router.js file -------------------------------------------------------------------------------------------------
This file contains:
	- the Router object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #35 : Add something to draw polylines on the map.
	- v1.3.0:
		- Reviewed way of working to use Promise
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- splitted with WaypointEditor
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/


( function ( ){
	
	'use strict';

	var s_RequestStarted = false;

	var g_TravelNotesData = require ( '../L.TravelNotes' );
	
	/*
	--- router function -----------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var router = function ( ) {
		
		/*
		--- m_HaveValidWayPoints function ------------------------------------------------------------------------------

		This function verify that the waypoints have coordinates

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_HaveValidWayPoints = function ( ) {
			return g_TravelNotesData.editedRoute.wayPoints.forEach ( 
				function ( wayPoint, result ) {
					if ( null === result ) { 
						result = true;
					}
					result &= ( ( 0 !== wayPoint.lat ) &&  ( 0 !== wayPoint.lng ) );
					return result;
				}
			);
		};
		
		/*
		--- m_EndError function ---------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_EndError = function ( message ) {

			s_RequestStarted = false;

			require ( '../core/ErrorEditor' ) ( ).showError ( message );
		};
	
		/*
		--- m_EndOk function -----------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_EndOk = function ( message ) {

			s_RequestStarted = false;

			// since v1.4.0 we consider that the L.latLng.distanceTo ( ) function is the only
			// valid function to compute the distances. So all distances are always 
			// recomputed with this function.
			
			require ( './RouteEditor' ) ( ).computeRouteDistances ( g_TravelNotesData.editedRoute );

			// Placing the waypoints on the itinerary
			var wayPointsIterator = g_TravelNotesData.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done )
			{
				if ( wayPointsIterator.first ) {
					wayPointsIterator.value.latLng = g_TravelNotesData.editedRoute.itinerary.itineraryPoints.first.latLng;
				}
				else if ( wayPointsIterator.last ) {
					wayPointsIterator.value.latLng = g_TravelNotesData.editedRoute.itinerary.itineraryPoints.last.latLng;
				}
				else{
					wayPointsIterator.value.latLng = require ( './RouteEditor' ) ( ).getClosestLatLngDistance ( g_TravelNotesData.editedRoute, wayPointsIterator.value.latLng ).latLng;
				}
			}	
			
			// and calling the route editor for displaying the results
			require ( './RouteEditor' ) ( ).endRouting ( );
		};
		
		/*
		--- m_StartRouting function -----------------------------------------------------------------------------------

			This function start the routing :-)

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_StartRouting = function ( ) {

			// We verify that another request is not loaded
			if ( s_RequestStarted ) {
				return false;
			}
			
			// Control of the wayPoints
			if ( ! m_HaveValidWayPoints ( ) ) {
				return false;
			}
			
			s_RequestStarted = true;

			// Choosing the correct route provider
			var routeProvider = g_TravelNotesData.providers.get ( g_TravelNotesData.routing.provider );

			// provider name and transit mode are added to the road
			g_TravelNotesData.editedRoute.itinerary.provider = routeProvider.name;
			g_TravelNotesData.editedRoute.itinerary.transitMode = g_TravelNotesData.routing.transitMode;

			routeProvider.getPromiseRoute ( g_TravelNotesData.editedRoute, null ).then (  m_EndOk, m_EndError  );

			return true;
		};
	
		/*
		--- Router object ---------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{
				startRouting : function ( ) { return m_StartRouting ( );
				}
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = router;
	}

}());

/*
--- End of Router.js file ---------------------------------------------------------------------------------------------
*/
},{"../L.TravelNotes":8,"../core/ErrorEditor":31,"./RouteEditor":37}],39:[function(require,module,exports){
/*
Copyright - 2019 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- SvgIconFromOsmFactory.js file -------------------------------------------------------------------------------------
This file contains:
	-
Changes:
	- v1.4.0:
		- created
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/


( function ( ){
	
	'use strict';

	var g_TravelNotesData = require ( '../L.TravelNotes' );

	var s_RequestStarted = false;

	var svgIconFromOsmFactory = function ( ) {

		var m_IconLatLng = L.latLng ( 0, 0 ); // the icon lat and lng
		var m_IconDistance = 0; // the icon distance from the beginning of the route
		var m_IconPoint = null;
		var m_Route = null; // the L.TravelNotes route object
		
		var m_Response = {}; // the xmlHttpRequest parsed
		
		var m_WaysMap = new Map ( );
		var m_NodesMap = new Map ( );
		var m_Places = [];
		var m_Place = null;
		var m_City = null;
		
		var m_Svg = null; // the svg element
		var m_StartStop = 0; // a flag to indicates where is the icon : -1 on the first node, 1 on the end node, 0 on an intermediate node
		
		var m_Translation = L.point ( 0, 0 );
		var m_Rotation = 0;
		var m_Direction = null;
		
		var m_SvgIconSize = require ( '../L.TravelNotes' ).config.note.svgIconWidth;
		var m_SvgZoom = require ( '../L.TravelNotes' ).config.note.svgZoom;
		var m_SvgAngleDistance = require ( '../L.TravelNotes' ).config.note.svgAngleDistance;
		
		var m_IncomingPoint = null;
		var m_OutgoingPoint = null;
		var m_PassingStreets = [];
				
		/*
		--- m_CreateNodesAndWaysMaps function -------------------------------------------------------------------------

		This function create the way and node maps from the XmlHttpRequest response

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreateNodesAndWaysMaps = function ( )
		{
			m_WaysMap.clear ( );
			m_NodesMap.clear ( );
			// Elements are pushed in 2 maps: 1 for nodes and 1 for ways
			m_Response.elements.forEach (
				function ( element ) {
					switch ( element.type ) {
						case 'area' :
							if ( element.tags && element.tags.boundary && element.tags.name ) {
								m_City = element.tags.name;
							}
							break;
						case 'way' :
							// replacing the nodes property with the nodesId property to 
							// avoid confusion between nodes and nodesId. The element.nodes contains nodesIds!!
							element.nodesIds = element.nodes;
							delete element.nodes;
							m_WaysMap.set ( element.id, element );
							break;
						case 'node' :
							m_NodesMap.set ( element.id, element );
							if ( element.tags && element.tags.place && [ 'town', 'city', 'village', 'hamlet' ].includes ( element.tags.place ) ) {
								m_Places.push ( element );
							}
							break;
						default:
							break;
					}
				}
			);
		};
		
		/*
		--- End of m_CreateNodesAndWaysMaps function ---
		*/

		/*
		--- m_SearchItineraryPoints function --------------------------------------------------------------------------

		This function search the nearest route point from the icon and compute the distance from the begining of the route

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SearchItineraryPoints = function ( ) {
			// Searching the nearest itinerary point
			var minDistance = Number.MAX_VALUE;
			var distance = 0;
			
			// Iteration on the points...
			m_Route.itinerary.itineraryPoints.forEach ( 
				function ( itineraryPoint ) {
					var pointDistance = m_IconLatLng.distanceTo ( L.latLng ( itineraryPoint.latLng ) );
					if ( minDistance > pointDistance ) {
						minDistance = pointDistance;
						m_IconPoint = itineraryPoint;
						m_IconDistance = distance;
					}
					distance += itineraryPoint.distance;
				}
			);
			
			// The coordinates of the nearest point are used as position of the icon
			m_IconLatLng = L.latLng ( m_IconPoint.latLng );
			var latLngCompare = function ( itineraryPoint ) {
				var isntWayPoint = true;
				m_Route.wayPoints.forEach ( 
					function ( wayPoint ) {
						if ( ( Math.abs ( itineraryPoint.lat - wayPoint.lat ) < 0.00001 ) && ( Math.abs ( itineraryPoint.lng - wayPoint.lng ) < 0.00001 ) ) {
							isntWayPoint = false;
						}
					}
				);
				return  isntWayPoint && ( m_IconPoint.lat !== itineraryPoint.lat || m_IconPoint.lng !== itineraryPoint.lng );
			};
			
			m_IncomingPoint = m_Route.itinerary.itineraryPoints.previous ( m_IconPoint.objId, latLngCompare );
			m_OutgoingPoint = m_Route.itinerary.itineraryPoints.next ( m_IconPoint.objId, latLngCompare );
		};
		
		/*
		--- End of m_SearchItineraryPoints function ---
		*/
		
		/*
		--- m_SearchHamlet function -----------------------------------------------------------------------------------

		This function 

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SearchHamlet = function ( ) {
			var minDistance = Number.MAX_VALUE;
			m_Places.forEach (
				function ( place ) {
				var placeDistance = L.latLng ( m_IconPoint.latLng ).distanceTo ( L.latLng ( place.lat, place.lon ) );
					if ( minDistance > placeDistance ) {
						minDistance = placeDistance;
						m_Place = place.tags.name;
					}
				}
			);
		};
		
		/*
		--- End of m_SearchHamlet function ---
		*/

		/*
		--- m_SearchPassingStreets function -----------------------------------------------------------------------------

		This function 

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SearchPassingStreets = function ( ) {

			var iconPointId = -1;
			var incomingPointId = -1;
			var outgoingPointId = -1;
			var iconPointDistance = Number.MAX_VALUE;
			var incomingPointDistance = Number.MAX_VALUE;
			var outgoingPointDistance = Number.MAX_VALUE;
			var pointDistance = 0;
			m_NodesMap.forEach (
				function ( node ) {
					if ( m_IconPoint ) {
						pointDistance =  L.latLng ( node.lat, node.lon ).distanceTo ( L.latLng ( m_IconPoint.lat, m_IconPoint.lng ) );
						if ( pointDistance < iconPointDistance ) {
							iconPointId = node.id;
							iconPointDistance = pointDistance;
						}
					}
					if ( m_IncomingPoint ) {
						pointDistance =  L.latLng ( node.lat, node.lon ).distanceTo ( L.latLng ( m_IncomingPoint.lat, m_IncomingPoint.lng ) );
						if ( pointDistance < incomingPointDistance ) {
							incomingPointId = node.id;
							incomingPointDistance = pointDistance;
						}
					}
					if ( m_OutgoingPoint   ) {
						pointDistance =  L.latLng ( node.lat, node.lon ).distanceTo ( L.latLng ( m_OutgoingPoint.lat, m_OutgoingPoint.lng ) );
						if ( pointDistance < outgoingPointDistance ) {
							outgoingPointId = node.id;
							outgoingPointDistance = pointDistance;
						}
					}
				}
			);
			var incomingStreet = '';
			var outgoingStreet = '';
			m_WaysMap.forEach ( 
				function ( way ) {
					var name = ( way.tags.name ? way.tags.name : '' ) + ( way.tags.name && way.tags.ref ? ' '  : '' ) + ( way.tags.ref ? '[' + way.tags.ref + ']' : '' );
					if ( way.nodesIds.includes ( iconPointId ) ) {
						var isClosed = way.nodesIds [ 0 ] === way.nodesIds [ way.nodesIds.length - 1 ];
						var isInOutStreet = ( 0 !== way.nodesIds.indexOf ( iconPointId ) ) && ( way.nodesIds.length - 1 !== way.nodesIds.lastIndexOf ( iconPointId ) );
						var isIncomingStreet = way.nodesIds.includes ( incomingPointId );
						var isOutgoingStreet = way.nodesIds.includes ( outgoingPointId );
						var isSimpleStreet = ! isInOutStreet && ! isIncomingStreet && ! isOutgoingStreet;
						var haveName = name!== '';
						
						if ( isSimpleStreet && haveName )  {
							m_PassingStreets.push ( name );
						}
						if ( ( isInOutStreet && haveName ) || ( isClosed && haveName ) )  {
							if ( ! isIncomingStreet && ! isOutgoingStreet ) {
								m_PassingStreets.push ( name );
								m_PassingStreets.push ( name );
							}
							else if ( ( isIncomingStreet && ! isOutgoingStreet ) || ( ! isIncomingStreet && isOutgoingStreet ) ) {
								m_PassingStreets.push ( name );
							}
						}
						if ( isIncomingStreet )  {
							incomingStreet = haveName ? name : '???';
						}
						if ( isOutgoingStreet )  {
							outgoingStreet =  haveName ? name : '???';
						}
					}
				}
			);
			m_PassingStreets.unshift ( incomingStreet );
			m_PassingStreets.push ( outgoingStreet );
		};

		/*
		--- End of m_SearchPassingStreets function ---
		*/

		/*
		--- m_ComputeTranslation function -----------------------------------------------------------------------------

		This function compute the needed translation to have the icon at the center point of the SVG

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ComputeTranslation = function ( ) {
			m_Translation = L.point ( m_SvgIconSize / 2, m_SvgIconSize / 2 ).subtract ( g_TravelNotesData.map.project ( m_IconLatLng, m_SvgZoom ) );
		};
		
		/*
		--- End of m_ComputeTranslation function ---
		*/

		/*
		--- m_ComputeRotationAndDirection function --------------------------------------------------------------------

		This function compute the rotation needed to have the SVG oriented on the itinerary and the direction to take after the icon

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ComputeRotationAndDirection = function ( ) {
			// searching points at least at 10 m ( m_SvgAngleDistance ) from the icon point, one for rotation and one for direction
			var distance = 0;
			var rotationItineraryPoint = m_Route.itinerary.itineraryPoints.first;
			var directionItineraryPoint = m_Route.itinerary.itineraryPoints.last;
			var directionPointReached = false;

			m_Route.itinerary.itineraryPoints.forEach ( 
				function ( itineraryPoint ) {
					if ( m_IconDistance - distance > m_SvgAngleDistance ) {
						rotationItineraryPoint = itineraryPoint;
					}
					if ( distance - m_IconDistance > m_SvgAngleDistance && ! directionPointReached ) {
						directionItineraryPoint = itineraryPoint;
						directionPointReached = true;
					}
					distance += itineraryPoint.distance;
				}
			);
			
			var iconPoint = g_TravelNotesData.map.project ( m_IconLatLng , m_SvgZoom ).add ( m_Translation );
			// computing rotation... if possible
			if ( m_IconPoint.objId !== m_Route.itinerary.itineraryPoints.first.objId  ) {
				var rotationPoint = g_TravelNotesData.map.project ( L.latLng ( rotationItineraryPoint.latLng ), m_SvgZoom ).add ( m_Translation );
				m_Rotation = Math.atan (  ( iconPoint.y - rotationPoint.y ) / ( rotationPoint.x - iconPoint.x ) ) * 180 / Math.PI;
				if ( 0 > m_Rotation ) {
					m_Rotation += 360;
				}
				m_Rotation -= 270;
				
				// point 0,0 of the svg is the UPPER left corner
				if ( 0 > rotationPoint.x - iconPoint.x ) {
					m_Rotation += 180;
				}
			}
			//computing direction ... if possible

			if ( m_IconPoint.objId !== m_Route.itinerary.itineraryPoints.last.objId  ) {
				var directionPoint = g_TravelNotesData.map.project ( L.latLng ( directionItineraryPoint.latLng ), m_SvgZoom ).add ( m_Translation );
				m_Direction = Math.atan (  ( iconPoint.y - directionPoint.y ) / ( directionPoint.x - iconPoint.x ) ) * 180 / Math.PI;
				// point 0,0 of the svg is the UPPER left corner
				if ( 0 > directionPoint.x - iconPoint.x ) {
					m_Direction += 180;
				}
				m_Direction -= m_Rotation;
				// setting direction between 0 and 360
				while ( 0 > m_Direction ) {
					m_Direction += 360;
				}
				while ( 360 < m_Direction ) {
					m_Direction -= 360;
				}
			}
			if ( m_IconPoint.objId === m_Route.itinerary.itineraryPoints.first.objId  ) {
				m_Rotation = - m_Direction - 90;
				m_Direction = null;
				m_StartStop = -1;
			}
			
			if ( m_IconLatLng.lat === m_Route.itinerary.itineraryPoints.last.lat  && m_IconLatLng.lng === m_Route.itinerary.itineraryPoints.last.lng ) { //using lat & lng because last point is sometime duplicated
				m_Direction = null;
				m_StartStop = 1;
			}
		};

		/*
		--- End of m_ComputeRotationAndDirection function ---
		*/

		/*
		--- m_CreateRoute function ------------------------------------------------------------------------------------

		This function create the SVG polyline for the route

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreateRoute = function ( ) {
			// to avoid a big svg, all points outside the svg viewBox are not added
			var index = -1;
			var firstPointIndex = -1;
			var lastPointIndex = -1;
			var points = [];
			m_Route.itinerary.itineraryPoints.forEach ( 
				function ( itineraryPoint ) {
					index++;
					var point = g_TravelNotesData.map.project ( L.latLng ( itineraryPoint.latLng ), m_SvgZoom ).add ( m_Translation );
					points.push ( point );
					var pointIsInside = point.x >= 0 && point.y >= 0 && point.x <=  m_SvgIconSize && point.y <= m_SvgIconSize;
					if ( pointIsInside ) {
						if ( -1 === firstPointIndex )  {
							firstPointIndex = index;
						}
						lastPointIndex = index;
					}
				}
			);
			if ( -1 !== firstPointIndex && -1 !== lastPointIndex ) {
				if ( 0 < firstPointIndex ) {
					firstPointIndex --;
				}
				if ( m_Route.itinerary.itineraryPoints.length -1 > lastPointIndex ) {
					lastPointIndex ++;
				}
				var pointsAttribute = '';
				for ( index = firstPointIndex; index <= lastPointIndex; index ++ ) {
						pointsAttribute += points[ index ].x.toFixed ( 0 ) + ',' + points[ index ].y.toFixed ( 0 ) + ' ';
				}
				var polyline = document.createElementNS ( "http://www.w3.org/2000/svg", "polyline" );
				polyline.setAttributeNS ( null, "points", pointsAttribute );
				polyline.setAttributeNS ( null, "class", "TravelNotes-OSM-Itinerary" );
				polyline.setAttributeNS ( null, "transform",  "rotate(" + m_Rotation + "," + m_SvgIconSize / 2 + "," + m_SvgIconSize / 2 + ")" );
				m_Svg.appendChild ( polyline );
			}
			
		};
	
		/*
		--- End of m_CreateRoute function ---
		*/

		/*
		--- m_CreateWays function -------------------------------------------------------------------------------------

		This function creates the ways from OSM

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreateWays = function ( ) {
			
			// to avoid a big svg, all points outside the svg viewBox are not added
			m_WaysMap.forEach ( 
				function ( way ) {
					var firstPointIndex = -1;
					var lastPointIndex = -1;
					var index = -1;
					var points = [ ];
					way.nodesIds.forEach (
						function ( nodeId ) {
							index ++;
							var node = m_NodesMap.get ( nodeId );
							var point = g_TravelNotesData.map.project ( L.latLng ( node.lat, node.lon ), m_SvgZoom ).add ( m_Translation );
							points.push ( point );
							var pointIsInside = point.x >= 0 && point.y >= 0 && point.x <=  m_SvgIconSize && point.y <= m_SvgIconSize;
							if ( pointIsInside ) {
								if ( -1 === firstPointIndex )  {
									firstPointIndex = index;
								}
								lastPointIndex = index;
							}
						}
					);
					if ( -1 !== firstPointIndex && -1 !== lastPointIndex ) {
						if ( 0 < firstPointIndex ) {
							firstPointIndex --;
						}
						if ( way.nodesIds.length -1 > lastPointIndex ) {
							lastPointIndex ++;
						}
						var pointsAttribute = '';
						for ( index = firstPointIndex; index <= lastPointIndex; index ++ ) {
								pointsAttribute += points[ index ].x.toFixed ( 0 ) + ',' + points[ index ].y.toFixed ( 0 ) + ' ';
						}

						var polyline = document.createElementNS ( "http://www.w3.org/2000/svg", "polyline" );
						polyline.setAttributeNS ( null, "points", pointsAttribute );
						polyline.setAttributeNS ( null, "class", "TravelNotes-OSM-Highway TravelNotes-OSM-Highway-" + way.tags.highway );
						polyline.setAttributeNS ( null, "transform", "rotate(" + m_Rotation + "," + m_SvgIconSize / 2 + "," + m_SvgIconSize / 2 + ")" );
						
						m_Svg.appendChild ( polyline );
					}
				}
			);
			
		};

		/*
		--- End of m_CreateWays function ---
		*/

		/*
		--- m_createSvg function ----------------------------------------------------------------------------------

		This function creates the SVG

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_createSvg = function ( returnOnOk, returnOnError ) {
			m_CreateNodesAndWaysMaps ( );

			m_Svg = document.createElementNS ( "http://www.w3.org/2000/svg", "svg" );
			m_Svg.setAttributeNS ( null, "viewBox", "" + m_SvgIconSize / 4 + " " + m_SvgIconSize / 4 + " " + m_SvgIconSize / 2 + " " + m_SvgIconSize / 2 );
			m_Svg.setAttributeNS ( null, "class", "TravelNotes-SvgIcon" );
			
			m_SearchItineraryPoints ( );
			m_SearchPassingStreets ( );
			m_SearchHamlet ( );
			m_ComputeTranslation ( );
			m_ComputeRotationAndDirection ( );
			m_CreateRoute ( );
			m_CreateWays ( );
		};
		
		/*
		--- End of m_createSvg function ---
		*/
		
		/*
		--- m_StartXMLHttpRequest function -----------------------------------------------------------------------------

		This function start the http request to OSM

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_StartXMLHttpRequest = function ( returnOnOk, returnOnError ) {

			var xmlHttpRequest = new XMLHttpRequest ( );
			xmlHttpRequest.timeout = require ( '../L.TravelNotes' ).config.note.svgTimeOut;
			
			xmlHttpRequest.ontimeout = function ( event ) {
				returnOnError ( 'TimeOut error' );
			};
			
			xmlHttpRequest.onreadystatechange = function ( ) {
				if ( xmlHttpRequest.readyState === 4 ) {
					if ( xmlHttpRequest.status === 200 ) {
						try {
							m_Response = JSON.parse ( xmlHttpRequest.responseText );
						}
						catch ( e ) {
							s_RequestStarted = false;
							returnOnError ( 'Parsing error' );
						}
						m_createSvg ( );
						s_RequestStarted = false;
						returnOnOk ( { svg : m_Svg, direction : m_Direction, startStop: m_StartStop, city : m_City, place: m_Place, streets: m_PassingStreets, latLng : m_IconPoint.latLng } );
					}
					else {
						s_RequestStarted = false;
						returnOnError ( 'Status : ' + this.status + ' statusText : ' + this.statusText );
					}
				}
			};

			var requestLatLng = m_IconLatLng.lat.toFixed ( 6 ) + ',' + m_IconLatLng.lng.toFixed ( 6 );
			var requestCityDistance = '500,';


			var requestUrl = require ( '../L.TravelNotes' ).config.overpassApiUrl + '?data=[out:json][timeout:' + require ( '../L.TravelNotes' ).config.note.svgTimeOut + '];' +
				'way[highway](around:' + ( m_SvgIconSize * 1.5 ).toFixed ( 0 ) + ',' + requestLatLng + ')->.a;(.a >;.a;)->.a;.a out;' +
				'is_in(' + requestLatLng + ')->.e;' +
				'area.e[admin_level="2"][name="United Kingdom"]->.f;' +
				'area.e[admin_level="8"]->.g;' +
				'area.e[admin_level="10"]->.h;' +
				'if(f.count(deriveds)==0){.g->.i;}else{if(h.count(deriveds)==0){.g->.i;}else{.h->.i;}}.i out;' +
				'(node(area.i)[place="village"];node(area.i)[place="hamlet"];node(area.i)[place="city"];node(area.i)[place="town"];)->.k;' +
				'( ' +
				'node(around:' + require ( '../L.TravelNotes' ).config.note.svgHamletDistance + ',' + requestLatLng + ')[place="hamlet"];' +
				'node(around:' + require ( '../L.TravelNotes' ).config.note.svgVillageDistance + ',' + requestLatLng + ')[place="village"];' +
				'node(around:' + require ( '../L.TravelNotes' ).config.note.svgCityDistance + ',' + requestLatLng + ')[place="city"];' +
				'node(around:' + require ( '../L.TravelNotes' ).config.note.svgTownDistance + ',' + requestLatLng + ')[place="town"];' +
				')->.l;' +
				'node.k.l->.m;' +
				'.m out;';

			xmlHttpRequest.open ( "GET", requestUrl, true);
			xmlHttpRequest.overrideMimeType ( 'application/json' );
			xmlHttpRequest.send ( null );
		
		};
		
		/*
		--- End of _StartXMLHttpRequest function ---
		*/

		/*
		--- m_GetPromiseSvgIcon function ------------------------------------------------------------------------------

		This function creates the SVG promise

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_GetPromiseSvgIcon = function ( iconLatLng, routeObjId ) {
			
			// We verify that another request is not loaded
			if ( s_RequestStarted ) {
				return Promise.reject ( );
			}
			s_RequestStarted = true;
			
			m_IconLatLng = L.latLng ( iconLatLng );
			m_Route = require ( '../Data/DataSearchEngine' ) ( ).getRoute ( routeObjId );
			m_Response = {};
			m_Svg = null;
			m_City = null;
			
			return new Promise ( m_StartXMLHttpRequest );
		};
		
		/*
		--- End of m_GetPromiseSvgIcon function ---
		*/
		
		/*
		--- svgIconFromOsmFactory object ------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{
				getPromiseSvgIcon : function ( iconLatLng, routeObjId ) { return m_GetPromiseSvgIcon ( iconLatLng, routeObjId ); }				
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = svgIconFromOsmFactory;
	}

}());

/*
--- End of svgIconFromOsmFactory.js file ------------------------------------------------------------------------------
*/
},{"../Data/DataSearchEngine":3,"../L.TravelNotes":8}],40:[function(require,module,exports){
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

/*
--- TravelEditor.js file ----------------------------------------------------------------------------------------------
This file contains:
	- the TravelEditor object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #26 : added confirmation message before leaving the page when data modified.
		- Issue #27 : push directly the route in the editor when starting a new travel
		- Issue #31 : Add a command to import from others maps
		- Issue #34 : Add a command to show all routes
		- Issue #37 : Add the file name and mouse coordinates somewhere
	- v1.3.0:
		- moved JSON.parse, due to use of Promise
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- moving file functions from TravelEditor to the new FileLoader
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var g_TravelNotesData = require ( '../L.TravelNotes' );

	var s_haveBeforeUnloadWarning = false;
	var s_haveUnloadCleanStorage = false;

	/*
	--- travelEditor function -----------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var travelEditor = function ( ) {

		var m_Translator = require ( '../UI/Translator' ) ( );
		var m_TravelEditorUI = require ( '../UI/TravelEditorUI' ) ( );
	
		/*
		--- m_UpdateRoadBook function ---------------------------------------------------------------------------------

		This function changes the HTML page content
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_UpdateRoadBook = function ( isNewTravel ) {

			if ( ! s_haveUnloadCleanStorage ) {
				window.addEventListener( 
					'unload', 
					function ( event ) {
						localStorage.removeItem ( require ( '../L.TravelNotes' ).UUID + "-TravelNotesHTML" );
					}
				);
				s_haveUnloadCleanStorage = true;
			}

			if ( ! isNewTravel && ! s_haveBeforeUnloadWarning && g_TravelNotesData.config.haveBeforeUnloadWarning ) {
				window.addEventListener( 
					'beforeunload', 
					function ( event ) {
						event.returnValue = 'x';
						return 'x'; 
					}
				);
				s_haveBeforeUnloadWarning = true;
			}
			
			if ( require ( '../util/Utilities' ) ( ).storageAvailable ( 'localStorage' ) ) {
				var htmlViewsFactory = require ( '../UI/HTMLViewsFactory' ) ( );
				htmlViewsFactory.classNamePrefix = 'TravelNotes-Roadbook-';
				localStorage.setItem ( g_TravelNotesData.UUID + "-TravelNotesHTML", htmlViewsFactory.travelHTML.outerHTML );
			}
		};

		/*
		--- m_AddRoute function ---------------------------------------------------------------------------------------

		This function add a new route
		
		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_AddRoute = function ( ) {
			g_TravelNotesData.travel.routes.add ( require ( '../Data/Route' ) ( ) );
			m_TravelEditorUI.setRoutesList ( );
			require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
			m_UpdateRoadBook ( );
		};
		
		/*
		--- m_RemoveRoute function ------------------------------------------------------------------------------------

		This function remove a route

		parameters :
		- routeObjId : the TravelNotes route objId to remove
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_RemoveRoute = function ( routeObjId ) {
			if ( routeObjId === g_TravelNotesData.routeEdition.routeInitialObjId && g_TravelNotesData.routeEdition.routeChanged ) {
				// cannot remove the route currently edited
				require ( './ErrorEditor' ) ( ).showError ( m_Translator.getText ( 'TravelEditor - Cannot remove an edited route' ) );
				return;
			}

			require ( './MapEditor' ) ( ).removeRoute ( require ( '../Data/DataSearchEngine' ) ( ).getRoute ( routeObjId ), true, true );
			g_TravelNotesData.travel.routes.remove ( routeObjId );
			m_TravelEditorUI.setRoutesList ( );
			if ( routeObjId === g_TravelNotesData.routeEdition.routeInitialObjId  ) {
				require ( './RouteEditor' ) ( ).cancelEdition ( );
			}
			require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
			m_UpdateRoadBook ( );
		};
		
		/*
		--- m_EditRoute function --------------------------------------------------------------------------------------

		This function start the edition of a route
		
		parameters:
		- routeObjId : the TravelNotes route objId to edit

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_EditRoute = function ( routeObjId ) { 
			if ( g_TravelNotesData.routeEdition.routeChanged ) {
				// not possible to edit - the current edited route is not saved or cancelled
				require ( '../core/ErrorEditor' ) ( ).showError ( m_Translator.getText ( "RouteEditor - Not possible to edit a route without a save or cancel" ) );
				return;
			}
			if ( -1 !== g_TravelNotesData.routeEdition.routeInitialObjId ) {
				// the current edited route is not changed. Cleaning the editors
				require ( '../core/RouteEditor' ) ( ).cancelEdition ( );
			}
			// We verify that the provider  for this route is available
			var initialRoute = require ( '../data/DataSearchEngine' ) ( ).getRoute ( routeObjId );
			var providerName = initialRoute.itinerary.provider;
			if ( providerName && ( '' !== providerName ) && ( ! g_TravelNotesData.providers.get ( providerName.toLowerCase ( ) ) ) )
			{
				require ( '../core/ErrorEditor' ) ( ).showError ( m_Translator.getText ( "RouteEditor - Not possible to edit a route created with this provider", {provider : providerName } ) );
				return;
			}
			// Provider and transit mode are changed in the itinerary editor
			require ( '../UI/ProvidersToolbarUI') ( ).provider = providerName;
			var transitMode = initialRoute.itinerary.transitMode;
			if ( transitMode && '' !== transitMode ) {
				require ( '../UI/ProvidersToolbarUI') ( ).transitMode = transitMode;
			}
			// The edited route is pushed in the editors
			g_TravelNotesData.editedRoute = require ( '../data/Route' ) ( );
			// Route is cloned, so we can have a cancel button in the editor
			g_TravelNotesData.editedRoute.object = initialRoute.object;
			g_TravelNotesData.routeEdition.routeInitialObjId = initialRoute.objId;
			g_TravelNotesData.editedRoute.hidden = false;
			initialRoute.hidden = false;
			var mapEditor = require ( '../core/MapEditor' ) ( );
			mapEditor.removeRoute ( initialRoute, true, false );
			mapEditor.addRoute ( g_TravelNotesData.editedRoute, true, true );
			require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
			var routeEditorUI = require ( '../UI/RouteEditorUI' ) ( );
			routeEditorUI .expand ( );
			routeEditorUI.setWayPointsList ( );
			require ( '../UI/DataPanesUI' ) ( ).setItinerary ( );
		};
		
		/*
		--- m_RenameRoute function ------------------------------------------------------------------------------------

		This function rename a route
		parameters :
		- routeObjId : the TravelNotes route objId to remove
		- routeName: the new name
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_RenameRoute = function ( routeObjId, routeName ) {
			require ( '../Data/DataSearchEngine' ) ( ).getRoute ( routeObjId ).name = routeName;
			m_TravelEditorUI.setRoutesList ( );
			if ( routeObjId === g_TravelNotesData.routeEdition.routeInitialObjId ) {
				g_TravelNotesData.editedRoute.name = routeName;
			}
			m_UpdateRoadBook ( );
		};
		
		/*
		--- m_SwapRoute function --------------------------------------------------------------------------------------

		This function changes the position of a route
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SwapRoute = function ( routeObjId, swapUp ) {
			g_TravelNotesData.travel.routes.swap ( routeObjId, swapUp );
			m_TravelEditorUI.setRoutesList ( );
			require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
			m_UpdateRoadBook ( );
		};
		
		/*
		--- m_RouteDropped function -----------------------------------------------------------------------------------

		This function changes the position of a route after a drag and drop
		
		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_RouteDropped = function ( draggedRouteObjId, targetRouteObjId, draggedBefore ) {
			g_TravelNotesData.travel.routes.moveTo ( draggedRouteObjId, targetRouteObjId, draggedBefore );
			m_TravelEditorUI.setRoutesList ( );
			require ( '../core/RouteEditor' ) ( ).chainRoutes ( );
			m_UpdateRoadBook ( );
		};


		/*
		--- m_SaveTravel function -------------------------------------------------------------------------------------

		This function save a travel to a local file
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SaveTravel = function ( ) {
			if ( g_TravelNotesData.routeEdition.routeChanged ) {
				require ( './ErrorEditor' ) ( ).showError ( m_Translator.getText ( "TravelEditor - Not possible to save a travel without a save or cancel" ) );
			}
			else {
				var routesIterator = g_TravelNotesData.travel.routes.iterator;
				while ( ! routesIterator.done ) {
					routesIterator.value.hidden = false;
				}
					
				// compressing the itineraryPoints
				var compressedTravel = g_TravelNotesData.travel.object;
				compressedTravel.routes.forEach (
					function ( route ) {
						var objType = {};
						if ( 0 !== route.itinerary.itineraryPoints.length ) {
							objType = route.itinerary.itineraryPoints [ 0 ].objType;
						}
						var compressedItineraryPoints = { latLngs : [] , distances : [], objIds : [],objType : objType  };
						route.itinerary.itineraryPoints.forEach ( 
							function ( itineraryPoint ) {
								compressedItineraryPoints.latLngs.push ( [ itineraryPoint.lat, itineraryPoint.lng ] );
								compressedItineraryPoints.distances.push ( itineraryPoint.distance );
								compressedItineraryPoints.objIds.push ( itineraryPoint.objId );
							}
						);
						compressedItineraryPoints.latLngs = require ( '@mapbox/polyline' ).encode ( compressedItineraryPoints.latLngs, 6 );
						route.itinerary.itineraryPoints = compressedItineraryPoints;
					}
				);
				// save file
				require ( '../util/Utilities' ) ( ).saveFile ( compressedTravel.name + '.trv', JSON.stringify ( compressedTravel ) );
			}
		};
		
		/*
		--- m_ConfirmClose function -----------------------------------------------------------------------------------

		This function ask a confirmation to the user
		
		---------------------------------------------------------------------------------------------------------------
		*/
		var m_ConfirmClose = function ( ) {
			if ( s_haveBeforeUnloadWarning ) {
				return window.confirm ( m_Translator.getText ( "TravelEditor - This page ask to close; data are perhaps not saved." ) );
			}
			return true;
		};
		
		/*
		--- m_Clear function ------------------------------------------------------------------------------------------

		This function remove completely the current travel
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Clear = function ( ) {
			if ( ! m_ConfirmClose ( ) )
			{
				return;
			}
			require ( '../core/MapEditor' ) ( ).removeAllObjects ( );
			g_TravelNotesData.editedRoute = require ( '../Data/Route' ) ( );
			g_TravelNotesData.routeEdition.routeChanged = false;
			g_TravelNotesData.routeEdition.routeInitialObjId = -1;
			g_TravelNotesData.travel = require ( '../Data/Travel' ) ( );
			g_TravelNotesData.travel.routes.add ( require ( '../Data/Route' ) ( ) );
			require ( '../UI/TravelEditorUI' ) ( ). setRoutesList ( );
			require ( '../UI/RouteEditorUI' ) ( ).setWayPointsList (  );
			require ( '../UI/DataPanesUI' ) ( ).setItinerary ( );
			m_UpdateRoadBook ( true );
		};

		/*
		--- travelEditor object ---------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{

				updateRoadBook : function ( isNewTravel ) { m_UpdateRoadBook ( isNewTravel ); },

				addRoute : function ( ) { m_AddRoute ( ); },

				removeRoute : function ( routeObjId ) { m_RemoveRoute ( routeObjId ); },

				editRoute : function ( routeObjId ) { m_EditRoute ( routeObjId ); },
				
				renameRoute : function ( routeObjId, routeName ) { m_RenameRoute ( routeObjId, routeName ); },

				swapRoute : function ( routeObjId, swapUp ) { m_SwapRoute  ( routeObjId, swapUp ); },

				routeDropped : function ( draggedRouteObjId, targetRouteObjId, draggedBefore ) { m_RouteDropped ( draggedRouteObjId, targetRouteObjId, draggedBefore ); },
				
				saveTravel : function ( ) { m_SaveTravel ( ); },

				confirmClose : function ( ) { return m_ConfirmClose ( ); },

				clear : function ( ) { m_Clear ( ); },

			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = travelEditor;
	}

}());

/*
--- End of TravelEditor.js file ---------------------------------------------------------------------------------------
*/
},{"../Data/DataSearchEngine":3,"../Data/Route":5,"../Data/Travel":6,"../L.TravelNotes":8,"../UI/DataPanesUI":14,"../UI/HTMLViewsFactory":17,"../UI/ProvidersToolbarUI":21,"../UI/RouteEditorUI":22,"../UI/Translator":26,"../UI/TravelEditorUI":27,"../core/ErrorEditor":31,"../core/MapEditor":34,"../core/RouteEditor":37,"../data/DataSearchEngine":45,"../data/Route":52,"../util/Utilities":58,"./ErrorEditor":31,"./MapEditor":34,"./RouteEditor":37,"@mapbox/polyline":1}],41:[function(require,module,exports){
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

/*
--- WaypointEditor.js file -------------------------------------------------------------------------------------------------
This file contains:
	- the WaypointEditor object
	- the module.exports implementation
Changes:
	- v1.4.0:
		- created from RouteEditor

Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var g_TravelNotesData = require ( '../L.TravelNotes' );

		
	/*
	--- waypointEditor function ------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var waypointEditor = function ( ) {
		
		var m_MapEditor = require ( '../core/MapEditor' ) ( );
		var m_RouteEditor = require ( '../core/RouteEditor' ) ( );
		var m_RouteEditorUI = require ( '../UI/RouteEditorUI' ) ( );


		/*
		--- m_AddWayPoint function ------------------------------------------------------------------------------------

		This function add a waypoint 
		
		parameters:
		- latLng : 

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_AddWayPoint = function ( latLng, distance ) {
			g_TravelNotesData.routeEdition.routeChanged = true;
			var newWayPoint = require ( '../data/Waypoint.js' ) ( );
			if ( latLng ) {
				newWayPoint.latLng = latLng;
				if ( g_TravelNotesData.config.wayPoint.reverseGeocoding ) {
					require ( '../core/GeoCoder' ) ( ).getPromiseAddress ( latLng [ 0 ], latLng [ 1 ], newWayPoint.objId ).then ( m_GeocoderRenameWayPoint );
				}
			}
			g_TravelNotesData.editedRoute.wayPoints.add ( newWayPoint );
			m_MapEditor.addWayPoint ( g_TravelNotesData.editedRoute.wayPoints.last, g_TravelNotesData.editedRoute.wayPoints.length - 2 );
			if ( distance ) {
				var wayPointsIterator = g_TravelNotesData.editedRoute.wayPoints.iterator;
				while ( ! wayPointsIterator.done ) {
					var latLngDistance = m_RouteEditor.getClosestLatLngDistance ( 
						g_TravelNotesData.editedRoute,
						wayPointsIterator.value.latLng 
					);
					if ( distance < latLngDistance.distance ) {
						g_TravelNotesData.editedRoute.wayPoints.moveTo ( newWayPoint.objId, wayPointsIterator.value.objId, true );
						break;
					}
				}
			}
			else {
				g_TravelNotesData.editedRoute.wayPoints.swap ( newWayPoint.objId, true );
			}
			m_RouteEditorUI.setWayPointsList ( );
			m_RouteEditor.startRouting ( );
		};
			
		/*
		--- m_AddWayPointOnRoute function -----------------------------------------------------------------------------

		This function add a waypoint at a given position on the edited route
		
		parameters:
		- latLng : 

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_AddWayPointOnRoute = function ( routeObjId, event ) {
			var latLngDistance = m_RouteEditor.getClosestLatLngDistance ( 
				require ( '../Data/DataSearchEngine' ) ( ).getRoute ( routeObjId ),
				[ event.latlng.lat, event.latlng.lng ] 
			);
			m_AddWayPoint ( latLngDistance.latLng, latLngDistance.distance );
		};
		
		/*
		--- m_ReverseWayPoints function -------------------------------------------------------------------------------

		This function reverse the waypoints order
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ReverseWayPoints = function ( ) {
			g_TravelNotesData.routeEdition.routeChanged = true;
			var wayPointsIterator = g_TravelNotesData.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
				m_MapEditor.removeObject ( wayPointsIterator.value.objId );
			}
			g_TravelNotesData.editedRoute.wayPoints.reverse ( );
			wayPointsIterator = g_TravelNotesData.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
				m_MapEditor.addWayPoint ( wayPointsIterator.value, wayPointsIterator .first ? 'A' : ( wayPointsIterator.last ? 'B' : wayPointsIterator.index ) );
			}
			m_RouteEditorUI.setWayPointsList ( );
			m_RouteEditor.startRouting ( );
		};
			
		/*
		--- m_RemoveAllWayPoints function -----------------------------------------------------------------------------

		This function remove all waypoints except the first and last ( see also Collection ...)
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_RemoveAllWayPoints = function ( ) {
			g_TravelNotesData.routeEdition.routeChanged = true;
			var wayPointsIterator = g_TravelNotesData.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
				m_MapEditor.removeObject ( wayPointsIterator.value.objId );
			}
			g_TravelNotesData.editedRoute.wayPoints.removeAll ( true );
			m_RouteEditorUI.setWayPointsList ( );
			m_RouteEditor.startRouting ( );
		};
		
		/*
		--- m_RemoveWayPoint function ---------------------------------------------------------------------------------

		This function remove a waypoint
		
		parameters:
		- wayPointObjId : the waypoint objId to remove

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_RemoveWayPoint = function ( wayPointObjId ) {
			g_TravelNotesData.routeEdition.routeChanged = true;
			m_MapEditor.removeObject ( wayPointObjId );
			g_TravelNotesData.editedRoute.wayPoints.remove ( wayPointObjId );
			m_RouteEditorUI.setWayPointsList ( );
			m_RouteEditor.startRouting ( );
		};

		/*
		--- m_RenameWayPoint function ---------------------------------------------------------------------------------

		This function rename a wayPoint
		
		parameters:
		- wayPointObjId : the waypoint objId to rename
		- wayPointName : the new name

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_RenameWayPoint = function ( wayPointName, wayPointObjId ) {
			g_TravelNotesData.routeEdition.routeChanged = true;
			g_TravelNotesData.editedRoute.wayPoints.getAt ( wayPointObjId ).name = wayPointName;
			m_RouteEditorUI.setWayPointsList ( );
		};
		
		/*
		--- m_GeocoderRenameWayPoint function ---------------------------------------------------------------------------------

		This function rename a wayPoint with the geoCoder response
		
		parameters:
		- geoCoderData : data returned by the geoCoder

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GeocoderRenameWayPoint = function ( geoCoderData ) {
			var address = '';
			if ( geoCoderData.address.house_number ) {
				address += geoCoderData.address.house_number + ' ';
			}
			if ( geoCoderData.address.road ) {
				address += geoCoderData.address.road + ' ';
			}
			else if ( geoCoderData.address.pedestrian ) {
				address += geoCoderData.address.pedestrian + ' ';
			}
			if (  geoCoderData.address.village ) {
				address += geoCoderData.address.village;
			}
			else if ( geoCoderData.address.town ) {
				address += geoCoderData.address.town;
			}
			else if ( geoCoderData.address.city ) {
				address += geoCoderData.address.city;
			}
			if ( 0 === address.length ) {
				address += geoCoderData.address.country;
			}
			m_RenameWayPoint ( address, geoCoderData.objId );
		};
		
		/*
		--- m_SwapWayPoints function ----------------------------------------------------------------------------------

		This function change the order of two waypoints
		
		parameters:
		- wayPointObjId : the waypoint objId to swap
		- swapUp : when true the waypoint is swapped with the previous one, otherwise with the next

		-----------------------------------------------------------------------------------------------------------
		*/

		var m_SwapWayPoints = function ( wayPointObjId, swapUp ) {
			g_TravelNotesData.routeEdition.routeChanged = true;
			g_TravelNotesData.editedRoute.wayPoints.swap ( wayPointObjId, swapUp );
			m_RouteEditorUI.setWayPointsList (  );
			m_RouteEditor.startRouting ( );
		};
			
		/*
		--- m_SetStartPoint function ----------------------------------------------------------------------------------

		This function set the start waypoint
		
		parameters:
		- latLng : the coordinates of the start waypoint

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SetStartPoint = function ( latLng ) {
			g_TravelNotesData.routeEdition.routeChanged = true;
			if ( 0 !== g_TravelNotesData.editedRoute.wayPoints.first.lat ) {
				m_MapEditor.removeObject ( g_TravelNotesData.editedRoute.wayPoints.first.objId );
			}
			g_TravelNotesData.editedRoute.wayPoints.first.latLng = latLng;
			if ( g_TravelNotesData.config.wayPoint.reverseGeocoding ) {
				require ( '../core/GeoCoder' ) ( ).getPromiseAddress ( latLng [ 0 ], latLng [ 1 ], g_TravelNotesData.editedRoute.wayPoints.first.objId ).then ( m_GeocoderRenameWayPoint );
			}
			m_MapEditor.addWayPoint ( g_TravelNotesData.editedRoute.wayPoints.first, 'A' );
			m_RouteEditorUI.setWayPointsList ( );
			m_RouteEditor.startRouting ( );
		};
			
		/*
		--- m_SetEndPoint function ------------------------------------------------------------------------------------

		This function set the end waypoint
		
		parameters:
		- latLng : the coordinates of the end waypoint


		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SetEndPoint = function ( latLng ) {
			g_TravelNotesData.routeEdition.routeChanged = true;
			if ( 0 !== g_TravelNotesData.editedRoute.wayPoints.last.lat ) {
				m_MapEditor.removeObject ( g_TravelNotesData.editedRoute.wayPoints.last.objId );
			}
			g_TravelNotesData.editedRoute.wayPoints.last.latLng = latLng;
			if ( g_TravelNotesData.config.wayPoint.reverseGeocoding ) {
				require ( '../core/GeoCoder' ) ( ).getPromiseAddress ( latLng [ 0 ], latLng [ 1 ], g_TravelNotesData.editedRoute.wayPoints.last.objId ).then ( m_GeocoderRenameWayPoint );
			}
			m_MapEditor.addWayPoint ( g_TravelNotesData.editedRoute.wayPoints.last, 'B' );
			m_RouteEditorUI.setWayPointsList ( );
			m_RouteEditor.startRouting ( );
		};
			
		/*
		--- m_WayPointDragEnd function --------------------------------------------------------------------------------

		This function is called when the dragend event is fired on a waypoint
		
		parameters:
		- wayPointObjId : the TravelNotes waypoint objId

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_WayPointDragEnd = function ( wayPointObjId ) {
			g_TravelNotesData.routeEdition.routeChanged = true;
			if ( g_TravelNotesData.config.wayPoint.reverseGeocoding ) {
				var latLng = g_TravelNotesData.editedRoute.wayPoints.getAt ( wayPointObjId ).latLng;
				require ( '../core/GeoCoder' ) ( ).getPromiseAddress ( latLng [ 0 ], latLng [ 1 ], wayPointObjId ).then ( m_GeocoderRenameWayPoint );
			}
			m_RouteEditorUI.setWayPointsList ( );
			m_RouteEditor.startRouting ( );
		};
		
		/*
		--- m_WayPointDropped function --------------------------------------------------------------------------------

		This function is called when the drop event is fired on a waypoint
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_WayPointDropped = function ( draggedWayPointObjId, targetWayPointObjId, draggedBefore ) {
			g_TravelNotesData.routeEdition.routeChanged = true;
			if ( targetWayPointObjId === g_TravelNotesData.editedRoute.wayPoints.first.objId && draggedBefore ) {
				return;
			}
			if ( targetWayPointObjId === g_TravelNotesData.editedRoute.wayPoints.last.objId && ( ! draggedBefore ) )	{
				return;
			}
			g_TravelNotesData.editedRoute.wayPoints.moveTo ( draggedWayPointObjId, targetWayPointObjId, draggedBefore );
			m_RouteEditorUI.setWayPointsList ( );
			var wayPointsIterator = g_TravelNotesData.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
					m_MapEditor.removeObject ( wayPointsIterator.value.objId );
					m_MapEditor.addWayPoint ( wayPointsIterator.value, wayPointsIterator.first ? 'A' : ( wayPointsIterator.last ? 'B' :  wayPointsIterator.index ) );
			}
			m_RouteEditor.startRouting ( );
		};
		
		/*
		--- waypointEditor object ----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{
				addWayPoint : function ( latLng ) { m_AddWayPoint ( latLng ); },
				
				addWayPointOnRoute : function ( routeObjId, event ) { m_AddWayPointOnRoute ( routeObjId, event ); },
				
				reverseWayPoints : function ( ) { m_ReverseWayPoints ( ); },
			
				removeAllWayPoints : function ( ) { m_RemoveAllWayPoints ( ); },
				
				removeWayPoint : function ( wayPointObjId ) { m_RemoveWayPoint ( wayPointObjId ); },
				
				renameWayPoint : function ( wayPointName, wayPointObjId ) { m_RenameWayPoint ( wayPointName, wayPointObjId ); },
				
				swapWayPoints : function ( wayPointObjId, swapUp ) { m_SwapWayPoints ( wayPointObjId, swapUp ); },
				
				setStartPoint : function ( latLng ) { m_SetStartPoint ( latLng ); },

				setEndPoint : function ( latLng ) { m_SetEndPoint ( latLng ); },

				wayPointDragEnd : function ( wayPointObjId ) { m_WayPointDragEnd ( wayPointObjId ); },

				wayPointDropped : function ( draggedWayPointObjId, targetWayPointObjId, draggedBefore ) { m_WayPointDropped ( draggedWayPointObjId, targetWayPointObjId, draggedBefore ); },
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = waypointEditor;
	}

}());

/*
--- End of WaypointEditor.js file ----------------------------------------------------------------------------------------
*/
},{"../Data/DataSearchEngine":3,"../L.TravelNotes":8,"../UI/RouteEditorUI":22,"../core/GeoCoder":33,"../core/MapEditor":34,"../core/RouteEditor":37,"../data/Waypoint.js":57}],42:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"../Data/DataSearchEngine":3,"../L.TravelNotes":8,"../UI/RouteEditorUI":22,"../core/GeoCoder":33,"../core/MapEditor":34,"../core/RouteEditor":37,"../data/Waypoint.js":57,"dup":41}],43:[function(require,module,exports){
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

/*
--- Collection.js file ------------------------------------------------------------------------------------------------
This file contains:
	- the Collection object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- added next and previous method
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	/*
	--- collection function -------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var collection = function ( objName ) {

		var m_Array = [];

		var m_ObjName = objName;

		/*
		--- m_Add function --------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_Add = function ( object ) {
			if ( ( ! object.objType ) || ( ! object.objType.name ) || ( object.objType.name !== m_ObjName ) ) {
				throw 'invalid object name for add function';
			}
			m_Array.push ( object );

			return;
		};

		/*
		--- m_First function ------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_First = function ( ) {
			return m_Array [ 0 ];
		};

		/*
		--- m_ForEach function ----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ForEach = function ( funct ) {
			var result = null;
			var iterator = m_Iterator ( );
			while ( ! iterator.done ) {
					result = funct ( iterator.value, result );
			}
			return result;
		};

		/*
		--- m_GetAt function ------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetAt = function ( objId ) {
			var index = m_IndexOfObjId ( objId );
			if ( -1 === index ) {
				return null;
			}
			return m_Array [ index ];
		};

		/*
		--- m_GetObject function --------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetObject = function ( ) {
			var array = [ ];
			var iterator = m_Iterator ( );
			while ( ! iterator.done ) {
				array.push ( iterator.value.object );
			}

			return array;
		};
		
		/*
		--- m_MoveTo function -----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_MoveTo = function ( objId, targetObjId, moveBefore ) {
			var oldPosition = m_IndexOfObjId ( objId );
			var newPosition = m_IndexOfObjId ( targetObjId );
			if ( ! moveBefore ) {
				newPosition ++;
			}
			m_Array.splice ( newPosition, 0, m_Array [ oldPosition ] );
			if ( newPosition < oldPosition )
			{
				oldPosition ++ ;
			}
			m_Array.splice ( oldPosition, 1 );
		};

		/*
		--- m_IndexOfObjId function -----------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_IndexOfObjId = function ( objId ) {
			return m_Array.findIndex ( 
				function ( element ) {
					return element.objId === objId;
				} 
			);
		};

		/*
		--- m_Iterator function ---------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Iterator = function ( ) {
			var nextIndex = -1;
			return {
			   get value ( ) { return nextIndex < m_Array.length ?  m_Array [ nextIndex ] : null; },
			   get done ( ) { return ++ nextIndex  >= m_Array.length; },
			   get first ( ) { return 0 === nextIndex; },
			   get last ( ) { return nextIndex  >= m_Array.length - 1; },
			   get index ( ) { return nextIndex; }
			};
		};

		/*
		--- m_Last function -------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Last = function ( ) {
			return m_Array [ m_Array.length - 1 ];
		};

		/*
		--- m_NextOrPrevious function ---------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_NextOrPrevious = function ( objId, condition, direction ) {
			var index = m_IndexOfObjId ( objId );
			if ( -1 === index ) {
				throw 'invalid objId for next or previous function';
			}
			
			if ( ! condition ) {
				condition = function ( ) { return true; };
			}
			index += direction;
			
			while ( ( -1 < index ) && ( index < m_Array.length ) && ! condition ( m_Array [ index ] ) ) {
							index += direction;
			}
			if ( -1 === index || m_Array.length === index ) {
				return null;
			}
			
			return m_Array [ index ];
		};
		
		/*
		--- m_Remove function -----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Remove = function ( objId ) {
			var index = m_IndexOfObjId ( objId );
			if ( -1 === index ) {
				throw 'invalid objId for remove function';
			}
			m_Array.splice ( m_IndexOfObjId ( objId ), 1 );
		};

		/*
		--- m_RemoveAll function --------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_RemoveAll = function ( ExceptFirstLast ) {
			if ( ExceptFirstLast ) {
				m_Array.splice ( 1, m_Array.length - 2 );
			}
			else {
				m_Array.length = 0;
			}
		};

		/*
		--- m_Replace function ----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Replace = function ( oldObjId, object ) {
			var index = m_IndexOfObjId ( oldObjId );
			if ( -1 === index ) {
				throw 'invalid objId for replace function';
			}
			m_Array [ index ] = object;
		};

		/*
		--- m_Reverse function ----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Reverse = function ( ) {
			m_Array.reverse ( );
		};

		/*
		--- m_SetObject function --------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SetObject = function ( something ) {
			m_Array.length = 0;
			var newObject;
			something.forEach (
				function ( arrayObject ) {
					switch ( m_ObjName ) {
						case 'Route' :
						newObject = require ( '../data/Route' ) ( );
						break;
						case 'Note' :
						newObject = require ( '../data/Note' ) ( );
						break;
						case 'WayPoint' :
						newObject = require ( '../data/WayPoint' ) ( );
						break;
						case 'Maneuver' :
						newObject = require ( '../data/Maneuver' ) ( );
						break;
						case 'ItineraryPoint' :
						newObject = require ( '../data/ItineraryPoint' ) ( );
						break;
						default:
						throw ( 'invalid ObjName ( ' + m_ObjName +' ) in Collection.m_SetObject' );
					}
					newObject.object = arrayObject;
					m_Add ( newObject );
				}
			);
		};

		/*
		--- m_Sort function -------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Sort = function ( compareFunction ) {
			m_Array.sort ( compareFunction );
		};

		/*
		--- m_Swap function -------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Swap = function ( objId, swapUp ) {
			var index = m_IndexOfObjId ( objId );
			if ( ( -1 === index ) || ( ( 0 === index ) && swapUp ) || ( ( m_Array.length - 1 === index ) && ( ! swapUp ) ) ) {
				throw 'invalid objId for swap function';
			}
			var tmp = m_Array [ index ];
			m_Array [ index ] = m_Array [ index + ( swapUp ? -1 : 1  ) ];
			m_Array [ index + ( swapUp ? -1 : 1  ) ] = tmp;
		};

		/*
		--- Collection object -----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{

				/*
				--- add function --------------------------------------------------------------------------------------

				This function add an object to the collection
				throw when the object type is invalid

				-------------------------------------------------------------------------------------------------------
				*/

				add : function ( object ) {
					m_Add ( object );
				},

				/*
				--- forEach function ----------------------------------------------------------------------------------

				This function executes a function on each object of the collection and returns the final result

				-------------------------------------------------------------------------------------------------------
				*/

				forEach : function ( funct ) {
					return m_ForEach ( funct );
				},

				/*
				--- getAt function ------------------------------------------------------------------------------------

				This function returns the object with the given objId or null when the object is not found
				
				-------------------------------------------------------------------------------------------------------
				*/

				getAt : function ( objId ) {
					return m_GetAt ( objId );
				},

				/*
				--- moveTo function -----------------------------------------------------------------------------------

				This function move the object identified by objId to the position ocuped by the object
				identified by targetObjId 

				-------------------------------------------------------------------------------------------------------
				*/
				
				moveTo : function ( objId, targetObjId, moveBefore ) {
					m_MoveTo ( objId, targetObjId, moveBefore );
				},
				
				/*
				--- next function -----------------------------------------------------------------------------------

				This function 

				-------------------------------------------------------------------------------------------------------
				*/

				next : function ( objId, condition ) {
					return m_NextOrPrevious ( objId, condition, 1 );
				},
				
				/*
				--- previous function ---------------------------------------------------------------------------------

				This function 

				-------------------------------------------------------------------------------------------------------
				*/

				previous : function ( objId, condition ) {
					return m_NextOrPrevious ( objId, condition, -1 );
				},
				
				/*
				--- remove function -----------------------------------------------------------------------------------

				This function remove the object with the given objId
				throw when the object is not found

				-------------------------------------------------------------------------------------------------------
				*/

				remove : function ( objId ) {
					m_Remove ( objId );
				},

				/*
				--- removeAll function --------------------------------------------------------------------------------

				This function remove all objects in the collection
				when the exceptFirstLast parameter is true, first and last objects in the collection are not removed

				-------------------------------------------------------------------------------------------------------
				*/

				removeAll : function ( exceptFirstLast ) {
					m_RemoveAll ( exceptFirstLast );
				},

				/*
				--- replace function ----------------------------------------------------------------------------------

				This function replace the object identified by oldObjId with a new object
				throw when the object type is invalid

				-------------------------------------------------------------------------------------------------------
				*/

				replace : function ( oldObjId, object ) {
					m_Replace ( oldObjId, object );
				},

				/*
				--- reverse function ----------------------------------------------------------------------------------

				This function reverse the objects in the collection

				-------------------------------------------------------------------------------------------------------
				*/

				reverse : function ( ) {
					m_Reverse ( );
				},

				/*
				--- sort function -------------------------------------------------------------------------------------

				This function sort the collection, using the compare function

				-------------------------------------------------------------------------------------------------------
				*/

				sort : function ( compareFunction ) {
					m_Sort ( compareFunction );
				},

				/*
				--- swap function -------------------------------------------------------------------------------------

				This function move up ( when swapUp is true ) or move down an object in the collection
				throw when the swap is not possible

				-------------------------------------------------------------------------------------------------------
				*/

				swap : function ( objId, swapUp ) {
					m_Swap ( objId, swapUp );
				},

				/*
				--- first getter --------------------------------------------------------------------------------------

				The first object in the collection

				-------------------------------------------------------------------------------------------------------
				*/

				get first ( ) {
					return m_First ( );
				},

				/*
				--- iterator getter -----------------------------------------------------------------------------------

				Returns an iterator on the collection.
				The iterator have the following properties:
				value : the object pointed by the iterator
				done : true when the iterator is at the end of the collection. Each time this property is called, the iterator move to the next object
				first : true when the iterator is on the first object
				last : true when the iterator is on the last object
				index : the current position of the iterator in the collection

				-------------------------------------------------------------------------------------------------------
				*/
				get iterator ( ) {
					return m_Iterator ( );
				},

				/*
				--- last getter ---------------------------------------------------------------------------------------

				The last object in the collection

				-------------------------------------------------------------------------------------------------------
				*/

				get last ( ) {
					return m_Last ( );
				},

				/*
				--- length getter -------------------------------------------------------------------------------------

				The length of the collection

				-------------------------------------------------------------------------------------------------------
				*/

				get length ( ) {
					return m_Array.length;
				},

				/*
				--- object getter -------------------------------------------------------------------------------------

				Transform the collection into an array that can be used with JSON

				-------------------------------------------------------------------------------------------------------
				*/

				get object ( ) {
					return m_GetObject ( );
				},

				/*
				--- object setter -------------------------------------------------------------------------------------

				Transform an array to a collection
				throw when an object in the array have an invalid type

				-------------------------------------------------------------------------------------------------------
				*/

				set object ( something ) {
					m_SetObject ( something );
				}

			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = collection;
	}

} ) ( );

/*
--- End of Collection.js file -----------------------------------------------------------------------------------------
*/
},{"../data/ItineraryPoint":47,"../data/Maneuver":48,"../data/Note":49,"../data/Route":52,"../data/WayPoint":56}],44:[function(require,module,exports){
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

/*
--- Config.js file ----------------------------------------------------------------------------------------------------
This file contains:
	- the Config object
	- the module.exports implementation
Changes:
	- v1.4.0:
		- created from DataManager
		- added searchPointMarker, previousSearchLimit, nextSearchLimit to config
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/
( function ( ) {
	
	'use strict';

	var config = function ( ) {

		var m_Config = {
			contextMenu : {
				timeout : 1500
			},
			errorMessages : {
				timeout : 20000
			},
			routing : {
				auto : true
			},
			language : 'fr',
			itineraryPointMarker : {
				color : 'red',
				weight : 2,
				radius : 7,
				fill : false
			},
			searchPointMarker : {
				color : 'green',
				weight : 4,
				radius : 20,
				fill : false
			},
			searchPointPolyline : {
				color : 'green',
				weight : 4,
				radius : 20,
				fill : false,
			},
			previousSearchLimit : {
				color : "green",
				fill : false,
				weight : 1
			},
			nextSearchLimit : {
				color : "red",
				fill : false,
				weight : 1
			},
			wayPoint : {
				reverseGeocoding : false
			},
			route : {
				color : '#ff0000',
				width : 3,
				dashArray : 0,
				dashChoices : [
					{ 
						text : "——————",
						iDashArray : null
					}, 
					{
						text : "— — — — —",
						iDashArray : [ 4, 2 ] 
					}, 
					{
						text : "—‧—‧—‧—‧—",
						iDashArray : [ 4, 2, 0, 2 ] 
					}, 
					{
						text : "················",
						iDashArray : [ 0, 2 ] 
					}
				]
			},
			note : {
				reverseGeocoding : false,
				grip : { 
					size : 10,
					opacity: 0 
				},
				polyline : {
					color : 'gray',
					weight : 1
				},
				style : 'TravelNotes-NotesStyle',
				svgIconWidth : 200,
				svgAnleMaxDirection:
				{
					right:35,
					slightRight:80,
					continue:100,
					slightLeft:145,
					left:200,
					sharpLeft:270,
					sharpRight:340
				},
				svgZoom : 17,
				svgAngleDistance : 10,
				svgHamletDistance : 200,
				svgVillageDistance : 400,
				svgCityDistance : 1200,
				svgTownDistance : 1500,
				svgTimeOut : 15000,
				cityPrefix : "<span class='TravelNotes-NoteHtml-Address-City'>",
				cityPostfix : "</span>"
			},
			itineraryPointZoom: 17,
			routeEditor : {
				displayEditionInHTMLPage : true
			},
			travelEditor : {
				clearAfterSave : true,
				startMinimized : true,
				timeout : 1000,
				startupRouteEdition:true
			},
			haveBeforeUnloadWarning : true,
			overpassApiUrl : "https://lz4.overpass-api.de/api/interpreter",
			nominatim:
			{
				url: "https://nominatim.openstreetmap.org/",
				language :"*"
			}

		};		

		/*
		--- m_CopyObjectTo function -----------------------------------------------------------------------------------

		This method:
			- search recursively all dest properties
			- foreach found property, search the same property in source
			- copy the property value from source to dest if found
			- search recursively all sources properties
			- foreach found property search the same property in dest
			- copy the property value from source to dest
			
			So: 
				- if a property is missing in the user config, the property is selected from the default config
				- if a property is in the user config but missing in the default config, the property is also added (and reminder
				  that the user can have more dashChoices than the default config )
				- if a property is changed in the user config, the property is adapted
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CopyObjectTo = function ( source, dest ) {
			if ( ( 'object' !== typeof source ) || ( 'object' !== typeof dest ) ) {
				return;
			}
			try {
				var property;
				for ( property in dest ) {
					if ( 'object' === typeof dest [ property ] ) {
						m_CopyObjectTo ( source [ property ], dest [ property ] );
					}
					else {
						dest [ property ] = source [ property ] || dest [ property ];
					}
				}

				for ( property in source ) {
					if ( 'object' === typeof source [ property ] ) {
						if ( Object.prototype.toString.call ( source [ property ] ) == '[object Array]' ) {
							dest [ property ] = dest [ property ] || [];
						}
						else {
							dest [ property ] = dest [ property ] || {};
						}
						m_CopyObjectTo ( source [ property ], dest [ property ] );
					}
					else {
						dest [ property ] = source [ property ];
					}
				}
			}
			catch ( e ) {
				console.log ( e );
				console.log ( 'Not possible to overload Config' );
			}
			
			return;
		};
		
		/*
		--- m_Freeze function -----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Freeze = function ( object ) {
			var property;
			for ( property in object ) {
				if ( 'object' === typeof object [ property ] ) {
					object [ property ] = m_Freeze (  object [ property ] );
				}
			}
			
			return Object.freeze (object );
		};
		
		/*
		--- m_Overload function ---------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Overload = function ( source ) {
			m_CopyObjectTo ( source, m_Config );
			m_Config = m_Freeze ( m_Config );
		};
	
		/* 
		--- config object ---------------------------------------------------------------------------------------------
		
		---------------------------------------------------------------------------------------------------------------
		*/

		return {
			
			get contextMenu ( ) { return m_Config.contextMenu; },
			get errorMessages ( ) { return m_Config.errorMessages; },
			get routing ( ) { return m_Config.routing; },
			get language ( ) { return m_Config.language; },
			get itineraryPointMarker ( ) { return m_Config.itineraryPointMarker; },
			get searchPointMarker ( ) { return m_Config.searchPointMarker; },
			get searchPointPolyline ( ) { return m_Config.searchPointPolyline; },
			get previousSearchLimit ( ) { return m_Config.previousSearchLimit; },
			get nextSearchLimit ( ) { return m_Config.nextSearchLimit; },
			get wayPoint ( ) { return m_Config.wayPoint; },
			get route ( ) { return m_Config.route; },
			get note ( ) { return m_Config.note; },
			get itineraryPointZoom ( ) { return m_Config.itineraryPointZoom; },
			get routeEditor ( ) { return m_Config.routeEditor; },
			get travelEditor ( ) { return m_Config.travelEditor; },
			get haveBeforeUnloadWarning ( ) { return m_Config.haveBeforeUnloadWarning; },
			get overpassApiUrl ( ) { return m_Config.overpassApiUrl; },
			get nominatim ( ) { return m_Config.nominatim; },
			
			overload : function ( newConfig ) { m_Overload ( newConfig ) ;}
			
		};
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = config ( );
	}
	
} ) ( );

/*
--- End of Config.js file ---------------------------------------------------------------------------------------------
*/

},{}],45:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"../L.TravelNotes":8,"dup":3}],46:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"../data/Collection":43,"../data/ObjId":50,"../data/ObjType":51,"./Version":55,"dup":4}],47:[function(require,module,exports){
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

/*
--- ItineraryPoint.js file --------------------------------------------------------------------------------------------
This file contains:
	- the ItineraryPoint object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	var s_ObjType = require ( '../data/ObjType' ) ( 'ItineraryPoint', require ( './Version' ) );

	/*
	--- itineraryPoint function ---------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var itineraryPoint = function ( ) {

		var m_Lat = 0;

		var m_Lng = 0;

		var m_Distance = 0;

		var m_ObjId = require ( '../data/ObjId' ) ( );

		var m_GetObject = function ( ) {
			return {
				lat : parseFloat ( m_Lat.toFixed ( 6 ) ),
				lng : parseFloat ( m_Lng.toFixed ( 6 ) ),
				distance : parseFloat ( m_Distance.toFixed ( 2 ) ),
				objId : m_ObjId,
				objType : s_ObjType.object
			};
		};
		
		var m_SetObject = function ( something ) {
			something = s_ObjType.validate ( something );
			m_Lat = something.lat || 0;
			m_Lng = something.lng || 0;
			m_Distance = something.distance || 0;
			m_ObjId = require ( '../data/ObjId' ) ( );
		};
		
		/*
		--- itineraryPoint object -------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/
		
		return Object.seal (
			{

				get lat ( ) { return m_Lat;},
				set lat ( Lat ) { m_Lat = Lat; },

				get lng ( ) { return m_Lng;},
				set lng ( Lng ) { m_Lng = Lng; },

				get latLng ( ) { return [ m_Lat, m_Lng ];},
				set latLng ( LatLng ) { m_Lat = LatLng [ 0 ]; m_Lng = LatLng [ 1 ]; },

				get distance ( ) { return m_Distance;},
				set distance ( Distance ) { m_Distance = Distance; },

				get objId ( ) { return m_ObjId; },

				get objType ( ) { return s_ObjType; },

				get object ( ) { return m_GetObject ( ); },
				set object ( something ) { m_SetObject ( something ); }
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = itineraryPoint;
	}

} ) ( );

/*
--- End of ItineraryPoint.js file -------------------------------------------------------------------------------------
*/
},{"../data/ObjId":50,"../data/ObjType":51,"./Version":55}],48:[function(require,module,exports){
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

/*
--- Maneuver.js file --------------------------------------------------------------------------------------------------
This file contains:
	- the Maneuver object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	var s_ObjType = require ( '../data/ObjType' ) ( 'Maneuver', require ( './Version' ) );

	/*
	--- maneuver function ---------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var maneuver = function ( ) {

		// Private variables

		var m_ObjId = require ( '../data/ObjId' ) ( );

		var m_IconName = '';

		var m_Instruction = '';

		var m_ItineraryPointObjId = -1;

		var m_Distance = 0;

		var m_Duration = 0;

		var m_GetObject = function ( ) {
			return {
				iconName : m_IconName,
				instruction : m_Instruction,
				distance : parseFloat ( m_Distance.toFixed ( 2 ) ),
				duration : m_Duration,
				itineraryPointObjId : m_ItineraryPointObjId,
				objId : m_ObjId,
				objType : s_ObjType.object
			};
		};
		
		var m_SetObject = function ( something ) {
			something = s_ObjType.validate ( something );
			m_IconName = something.iconName || '';
			m_Instruction = something.instruction || '';
			m_Distance = something.distance || 0;
			m_Duration = something.duration || 0;
			m_ItineraryPointObjId = something.itineraryPointObjId || -1;
			m_ObjId = require ( '../data/ObjId' ) ( );
		};

		/*
		--- maneuver object -------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{
				
				get iconName ( ) { return m_IconName;},
				set iconName ( IconName ) { m_IconName = IconName; },

				get instruction ( ) { return m_Instruction;},
				set instruction ( Instruction ) { m_Instruction = Instruction; },

				get itineraryPointObjId ( ) { return m_ItineraryPointObjId;},
				set itineraryPointObjId ( ItineraryPointObjId ) { m_ItineraryPointObjId = ItineraryPointObjId; },

				get distance ( ) { return m_Distance;},
				set distance ( Distance ) { m_Distance = Distance; },

				get duration ( ) { return m_Duration;},
				set duration ( Duration ) { m_Duration = Duration; },

				get objId ( ) { return m_ObjId; },

				get objType ( ) { return s_ObjType; },

				get object ( ) { return m_GetObject ( ); },
				set object ( something ) { m_SetObject ( something ); }
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = maneuver;
	}

} ) ( );

/*
--- End of Maneuver.js file -------------------------------------------------------------------------------------------
*/
},{"../data/ObjId":50,"../data/ObjType":51,"./Version":55}],49:[function(require,module,exports){
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

/*
--- Note.js file ------------------------------------------------------------------------------------------------------
This file contains:
	- the Note object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	var s_ObjType = require ( '../data/ObjType' ) ( 'Note', require ( './Version' ) );

	/*
	--- note function -------------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var note = function ( ) {

		var m_ObjId = require ( '../data/ObjId' ) ( );

		var m_IconHeight = 40;

		var m_IconWidth = 40;

		var m_IconContent = '';

		var m_PopupContent = '';

		var m_TooltipContent = '';

		var m_Phone = '';

		var m_Url = '';

		var m_Address = '';

		var m_IconLat = 0;

		var m_IconLng = 0;

		var m_Lat = 0;

		var m_Lng = 0;

		var m_Distance = -1;

		var m_ChainedDistance = 0;

		var m_GetObject = function ( ) {
			return {
				iconHeight : m_IconHeight,
				iconWidth : m_IconWidth,
				iconContent : m_IconContent,
				popupContent : m_PopupContent,
				tooltipContent : m_TooltipContent,
				phone : m_Phone,
				url : m_Url,
				address : m_Address,
				iconLat : parseFloat ( m_IconLat.toFixed ( 6 ) ),
				iconLng : parseFloat ( m_IconLng.toFixed ( 6 ) ),
				lat : parseFloat ( m_Lat.toFixed ( 6 ) ),
				lng : parseFloat ( m_Lng.toFixed ( 6 ) ),
				distance : parseFloat ( m_Distance.toFixed ( 2 ) ),
				chainedDistance : parseFloat ( m_ChainedDistance.toFixed ( 2 ) ),
				objId : m_ObjId,
				objType : s_ObjType.object
			};
		};
		
		var m_SetObject = function ( something ) {
			something = s_ObjType.validate ( something );
			m_IconHeight = something.iconHeight || 40;
			m_IconWidth = something.iconWidth || 40;
			m_IconContent = something.iconContent || '';
			m_PopupContent = something.popupContent || '';
			m_TooltipContent = something.tooltipContent || '';
			m_Phone = something.phone || '';
			m_Url = something.url || '';
			m_Address = something.address || '';
			m_IconLat = something.iconLat || 0;
			m_IconLng = something.iconLng || 0;
			m_Lat = something.lat || 0;
			m_Lng = something.lng || 0;
			m_Distance = something.distance || -1;
			m_ChainedDistance = something.chainedDistance;
			m_ObjId = require ( '../data/ObjId' ) ( );
		};
		
		/*
		--- note object -----------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{

				get isRouteNote ( ) { return m_Distance !== -1; },

				get iconHeight ( ) { return m_IconHeight;},
				set iconHeight ( IconHeight ) { m_IconHeight = IconHeight; },

				get iconWidth ( ) { return m_IconWidth;},
				set iconWidth ( IconWidth ) { m_IconWidth = IconWidth; },

				get iconContent ( ) { return m_IconContent;},
				set iconContent ( IconContent ) { m_IconContent = IconContent; },

				get popupContent ( ) { return m_PopupContent;},
				set popupContent ( PopupContent ) { m_PopupContent = PopupContent; },

				get tooltipContent ( ) { return m_TooltipContent;},
				set tooltipContent ( TooltipContent ) { m_TooltipContent = TooltipContent; },

				get phone ( ) { return m_Phone;},
				set phone ( Phone ) { m_Phone = Phone; },

				get url ( ) { return m_Url;},
				set url ( Url ) { m_Url = Url; },

				get address ( ) { return m_Address;},
				set address ( Address ) { m_Address = Address; },

				get iconLat ( ) { return m_IconLat;},
				set iconLat ( IconLat ) { m_IconLat = IconLat; },

				get iconLng ( ) { return m_IconLng;},
				set iconLng ( IconLng ) { m_IconLng = IconLng; },

				get iconLatLng ( ) { return [ m_IconLat, m_IconLng ];},
				set iconLatLng ( IconLatLng ) { m_IconLat = IconLatLng [ 0 ]; m_IconLng = IconLatLng [ 1 ]; },

				get lat ( ) { return m_Lat;},
				set lat ( Lat ) { m_Lat = Lat; },

				get lng ( ) { return m_Lng;},
				set lng ( Lng ) { m_Lng = Lng; },

				get latLng ( ) { return [ m_Lat, m_Lng ];},
				set latLng ( LatLng ) { m_Lat = LatLng [ 0 ]; m_Lng = LatLng [ 1 ]; },

				get distance ( ) { return m_Distance; },
				set distance ( Distance ) { m_Distance = Distance; },

				get chainedDistance ( ) { return m_ChainedDistance; },
				set chainedDistance ( ChainedDistance ) { m_ChainedDistance = ChainedDistance; },

				get objId ( ) { return m_ObjId; },

				get objType ( ) { return s_ObjType; },

				get object ( ) { return m_GetObject ( ); },
				set object ( something ) { m_SetObject ( something ); }
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = note;
	}

} ) ( );

/*
--- End of Note.js file -----------------------------------------------------------------------------------------------
*/
},{"../data/ObjId":50,"../data/ObjType":51,"./Version":55}],50:[function(require,module,exports){
(function (global){
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


/*
--- ObjId.js file -----------------------------------------------------------------------------------------------------

Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Initialization changed
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	/*
	--- objId function ------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var objId = function ( ) {
		if ( ! global.TravelNotesObjId ) {
			global.TravelNotesObjId = 0;
		}
		
		return ++ global.TravelNotesObjId;
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = objId;

	}

} ) ( );

/*
--- End of ObjId.js file ----------------------------------------------------------------------------------------------
*/
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],51:[function(require,module,exports){
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

/*
--- ObjType.js file ---------------------------------------------------------------------------------------------------
This file contains:
	- the ObjType object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	/*
	--- objType function ----------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var objType = function ( name, version ) {

		var m_Name = name;

		var m_Version = version;
		
		var m_GetObject = function ( ) {
			return {
				name : m_Name,
				version : m_Version
			};
		};
		
		var m_Validate = function ( something ) {
			if ( ! something.objType ) {
				throw 'No objType for ' + m_Name;
			}
			if ( ! something.objType.name ) {
				throw 'No name for ' + m_Name;
			}
			if ( m_Name !== something.objType.name ) {
				throw 'Invalid name for ' + m_Name;
			}
			if ( ! something.objType.version ) {
				throw 'No version for ' + m_Name;
			}
			if ( m_Version !== something.objType.version ) {
				if ( '1.0.0' === something.objType.version ) {
					//start upgrade from 1.0.0 to 1.1.0
					if ( 'Route' === something.objType.name ) {
						something.dashArray = 0;
						something.hidden = false;
					}
					something.objType.version = '1.1.0';
					//end upgrade from 1.0.0 to 1.1.0
				}
				if ( '1.1.0' === something.objType.version ) {
					something.objType.version = '1.2.0';
					//end upgrade from 1.1.0 to 1.2.0
				}
				if ( '1.2.0' === something.objType.version ) {
					something.objType.version = '1.3.0';
					//end upgrade from 1.2.0 to 1.3.0
				}
				if ( '1.3.0' === something.objType.version ) {
					something.objType.version = '1.4.0';
					//end upgrade from 1.3.0 to 1.4.0
				}
				if ( m_Version !== something.objType.version ) {
					throw 'invalid version for ' + m_Name;
				}
			}
			if ( ! something.objId ) {
				throw 'No objId for ' + m_Name;
			}
			return something;
		};

		/*
		--- objType object --------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{

				get name ( ) { return m_Name; },

				get version ( ) { return m_Version; },

				get object ( ) { return m_GetObject ( ); },

				validate : function ( something ) { return m_Validate ( something ); }
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = objType;
	}

} ) ( );

/*
--- End of ObjType.js file ----------------------------------------------------------------------------------------------
*/
},{}],52:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"../L.TravelNotes":8,"../data/Collection":43,"../data/Itinerary":46,"../data/ObjId":50,"../data/ObjType":51,"../data/Waypoint":57,"./Itinerary":46,"./Version":55,"dup":5}],53:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"../data/Collection":43,"../data/ObjId":50,"../data/ObjType":51,"./Version":55,"dup":6}],54:[function(require,module,exports){
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

/*
--- TravelNotesData.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the TravelNotesData object
	- the module.exports implementation
Changes:
	- v1.4.0:
		- created from DataManager
		- added searchData
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	/*
	--- travelNotesData function --------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var travelNotesData = function ( ) {

		var m_TravelNotesData = {
			config : require ( '../data/Config' ),
			map : null,
			providers : new Map ( ),
			mapObjects : new Map ( ),
			travel : require ( '../data/Travel' ) ( ),
			editedRoute : null,
			routeEdition : Object.seal ( { routeChanged : false, routeInitialObjId : -1 } ),
			routing : Object.seal ( { provider : '', transitMode : ''} ),
			searchData : [],
			UUID : require ( '../util/Utilities' ) ( ).UUID
		};
		
		/*
		--- travelNotesData object ------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{

				get config ( ) { return m_TravelNotesData.config; },
				set config ( Config ) { m_TravelNotesData.config.overload ( Config ); },

				get map ( ) { return m_TravelNotesData.map; },
				set map ( Map ) { m_TravelNotesData.map = Map; },

				get providers ( ) { return m_TravelNotesData.providers; },

				get mapObjects ( ) { return m_TravelNotesData.mapObjects; },

				get travel ( ) { return m_TravelNotesData.travel; },
				set travel ( Travel ) { m_TravelNotesData.travel = Travel; },

				get editedRoute ( ) { return m_TravelNotesData.editedRoute; },
				set editedRoute ( editedRoute ) { m_TravelNotesData.editedRoute = editedRoute; },

				get routeEdition ( ) { return m_TravelNotesData.routeEdition; },
				
				get routing ( ) { return m_TravelNotesData.routing; },
				
				get searchData ( ) { return m_TravelNotesData.searchData; },
				set searchData ( SearchData ) { m_TravelNotesData.searchData = SearchData; },

				get UUID ( ) { return m_TravelNotesData.UUID; }
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = travelNotesData;
	}

} ) ( );

/*
--- End of TravelNotesData.js file ------------------------------------------------------------------------------------
*/
},{"../data/Config":44,"../data/Travel":53,"../util/Utilities":58}],55:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],56:[function(require,module,exports){
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

/*
--- WayPoint.js file --------------------------------------------------------------------------------------------------
This file contains:
	- the WayPoint object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	var s_ObjType = require ( '../data/ObjType' ) ( 'WayPoint', require ( './Version' ) );

	/*
	--- wayPoint function ---------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var wayPoint = function ( ) {

		var m_Name = '';

		var m_Lat = 0;

		var m_Lng = 0;

		var m_ObjId = require ( '../data/ObjId' ) ( );

		var m_GetUIName = function ( ) {
			if ( '' !== m_Name ) {
				return m_Name;
			}
			if ( ( 0 !== m_Lat ) && ( 0 !== m_Lng ) ) {
				return m_Lat.toFixed ( 6 ) + ( 0 < m_Lat ? ' N - ' : ' S - ' ) + m_Lng.toFixed ( 6 )  + ( 0 < m_Lng ? ' E' : ' W' );
			}
			return '';
		};
		
		var m_GetObject = function ( ) {
			return {
				name : m_Name,
				lat : parseFloat ( m_Lat.toFixed ( 6 ) ),
				lng : parseFloat ( m_Lng.toFixed ( 6 ) ),
				objId : m_ObjId,
				objType : s_ObjType.object
			};
		};
		
		var m_SetObject =function ( something ) {
			something = s_ObjType.validate ( something );
			m_Name = something.name || '';
			m_Lat = something.lat || 0;
			m_Lng = something.lng || 0;
			m_ObjId = require ( '../data/ObjId' ) ( );
		};
		
		/*
		--- wayPoint object -------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{

				get name ( ) { return m_Name; },
				set name ( Name ) { m_Name = Name;},

				get UIName ( ) { return m_GetUIName ( ); },

				get lat ( ) { return m_Lat;},
				set lat ( Lat ) { m_Lat = Lat; },

				get lng ( ) { return m_Lng;},
				set lng ( Lng ) { m_Lng = Lng; },

				get latLng ( ) { return [ m_Lat, m_Lng ];},
				set latLng ( LatLng ) { m_Lat = LatLng [ 0 ]; m_Lng = LatLng [ 1 ]; },

				get objId ( ) { return m_ObjId; },

				get objType ( ) { return s_ObjType; },

				get object ( ) { return m_GetObject ( ); },
				set object ( something ) { m_SetObject ( something ); }
			}
		);
	};


	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = wayPoint;
	}

} ) ( );

/*
--- End of WayPoint.js file -------------------------------------------------------------------------------------------
*/
},{"../data/ObjId":50,"../data/ObjType":51,"./Version":55}],57:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"../data/ObjId":50,"../data/ObjType":51,"./Version":55,"dup":56}],58:[function(require,module,exports){
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


(function() {
	
	'use strict';
	
	var _Translator = require ( '../UI/Translator' ) ( );
	
	var getUtilities = function ( ) {

		/*
		--- getUUID function --------------------------------------------------------------------------------------------------
		
		This function returns an unique identifier like UUID
		Adapted from stackoverflow.com :-)

		------------------------------------------------------------------------------------------------------------------------
		*/

		var getUUID = function ( ) {
			function Random4 ( ) {
				return Math.floor ( ( 1 + Math.random ( ) ) * 0x10000 ).toString ( 16 ).substring ( 1 );
			}
			return Random4 ( ) + Random4 ( ) + '-' + Random4 ( ) + '-' + Random4 ( ) + '-' +Random4 ( ) + '-' + Random4 ( ) + Random4 ( ) + Random4 ( ) ;
		};

		return {
			
			/*
			--- UUID getter --------------------------------------------------------------------------------------------------------
			*/

			get UUID ( ) { return getUUID ( ); },
						
			/* 
			--- storageAvailable function ------------------------------------------------------------------------------------------
			
			This function test if the storage API is available ( the API can be deactived by user....)
			Adapted from MDN :-)

			------------------------------------------------------------------------------------------------------------------------
			*/
			
			storageAvailable: function ( type ) {
				try {
					var storage = window [ type ];
					var	x = '__storage_test__';
					storage.setItem ( x, x );
					storage.removeItem ( x );
					return true;
				}
				catch ( e ) {
					return false;
				}				
			},
			/* --- End of storageAvailable function --- */		

			/* 
			--- fileAPIAvailable function ------------------------------------------------------------------------------------------
			
			This function test if the File API is available 

			------------------------------------------------------------------------------------------------------------------------
			*/

			fileAPIAvailable : function ( ) {
				try {
					// FF...
					var testFileData = new File ( [ 'testdata' ], { type: 'text/plain' } );
					return true;
				}
				catch ( Error ) {
					if (window.navigator.msSaveOrOpenBlob ) {
					//edge IE 11...
						return true;
					}
					else {
						return false;
					}
				}
			},
			/* 
			--- saveFile function --------------------------------------------------------------------------------------------------
			
			This function data to a local file

			------------------------------------------------------------------------------------------------------------------------
			*/

			saveFile : function ( filename, text, type ) {
				if ( ! type ) {
					type = 'text/plain';
				}
				if ( window.navigator.msSaveOrOpenBlob ) {
					//https://msdn.microsoft.com/en-us/library/hh779016(v=vs.85).aspx
					//edge IE 11...
					try {
						window.navigator.msSaveOrOpenBlob ( new Blob ( [ text ] ), filename ); 
					}
					catch ( Error ) {
					}
				}
				else {
					// FF...
					// http://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
					try {
						var mapFile = window.URL.createObjectURL ( new File ( [ text ], { type: type } ) );
						var element = document.createElement ( 'a' );
						element.setAttribute( 'href', mapFile );
						element.setAttribute( 'download', filename );
						element.style.display = 'none';
						document.body.appendChild ( element );
						element.click ( );
						document.body.removeChild ( element );
						window.URL.revokeObjectURL ( mapFile );
					}
					catch ( Error ) {
					}				
				}
			},
			
			formatTime : function ( time ) {
				time = Math.floor ( time );
				if ( 0 === time ) {
					return '';
				}
				var days = Math.floor ( time / 86400 );
				var hours = Math.floor ( time % 86400 / 3600 );
				var minutes = Math.floor ( time % 3600 / 60 );
				var seconds = Math.floor ( time % 60 );
				if ( 0 < days ) {
					return days + '&nbsp;' + _Translator.getText ( 'Utilities - Day' ) + '&nbsp;' + hours + '&nbsp;' + _Translator.getText ( 'Utilities - Hour' );
				}
				else if ( 0 < hours ) {
					return hours + '&nbsp;' + _Translator.getText ( 'Utilities - Hour' ) +'&nbsp;' + minutes + '&nbsp;' + _Translator.getText ( 'Utilities - Minute' );
				}
				else if ( 0 < minutes ) {
					return minutes + '&nbsp;' + _Translator.getText ( 'Utilities - Minute' );
				}
				else {
					return seconds + '&nbsp;' + _Translator.getText ( 'Utilities - Second' );
				}
				return '';
			},
			
			formatDistance : function ( distance ) {
				distance = Math.floor ( distance );
				if ( 0 === distance ) {
					return '';
				} 
				else {
					return Math.floor ( distance / 1000 ) +',' + Math.floor ( ( distance % 1000 ) / 10 ).toFixed ( 0 ).padStart ( 2, '0' ).padEnd ( 3, '0') + '&nbsp;km';
				}
			},
			
			formatLat : function ( lat ) {
				return ( lat > 0 ? lat.toFixed ( 6 ) + '&nbsp;N' : ( -lat ).toFixed ( 6 ) + '&nbsp;S' );
			},
			
			formatLng : function ( lng ) {
				return ( lng > 0 ? lng.toFixed ( 6 ) + '&nbsp;E' : ( -lng ).toFixed ( 6 ) + '&nbsp;W' );
			},
			
			formatLatLng : function ( latLng ) {
				return this.formatLat ( latLng [ 0 ] ) + '&nbsp;-&nbsp;' + this.formatLng ( latLng [ 1 ] );
			}
		};
	};
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getUtilities;
	}

} ) ( );

},{"../UI/Translator":26}]},{},[8]);
