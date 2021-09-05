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
	- v1.6.0:
		- created
	-v1.7.0:
		- modified way of working for myPointsDistance ( )
		- Issue ♯89 : Add elevation graph => new method getLatLngElevAtDist ( )
	- v1.9.0:
		- Issue ♯101 : Add a print command for a route
	- v1.13.0:
		- Issue ♯125 : Outphase osmSearch and add it to TravelNotes
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Geometry.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} LatLngElevOnRoute
@desc An object to store the latitude, longitude, elevation, ascent and distance of a point on a route
@property {Array.<number>} latLng The latitude and longitude of the point
@property {number} elev The elevation of the point
@property {number} ascent The ascent since the previous ItineraryPoint
@property {number} routeDistance The distance since the beginning of the route
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} LatLngDistance
@desc An object to store a latitude, longitude and distance
@property {Array.<number>} latLng The latitude and longitude
@property {number} distance The distance
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module coreLib
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTravelNotesData from '../data/TravelNotesData.js';
import { DISTANCE, ZERO, ONE, TWO, DEGREES, LAT_LNG, EARTH_RADIUS } from '../main/Constants.js';

const HUNDRED = 100;

/**
@------------------------------------------------------------------------------------------------------------------------------

@class Geometry
@classdesc This class contains methods for geometry operations requiring call to Leaflet functions
@see {@link theGeometry} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class Geometry {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	Compute the latitude, longitude, elevation, ascent and distance of a point on a route when only the distance between
	the beginning of the route and the point is know
	@param {Route} route The route
	@param {number} distance The distance (units: meter)
	@return {LatLngElevOnRoute} A LatLngElevOnRoute with the desired values
	*/

	getLatLngElevAtDist ( route, distance ) {
		if ( route.distance <= distance || ZERO >= distance ) {
			return null;
		}
		let nearestDistance = 0;
		let itineraryPointsIterator = route.itinerary.itineraryPoints.iterator;
		while ( nearestDistance < distance && ! itineraryPointsIterator.done ) {
			nearestDistance += itineraryPointsIterator.value.distance;
		}
		let previousItineraryPoint = itineraryPointsIterator.value;
		itineraryPointsIterator.done;
		let scale = ( previousItineraryPoint.distance - nearestDistance + distance ) / previousItineraryPoint.distance;
		return Object.freeze (
			{
				latLng :
					[
						previousItineraryPoint.lat +
						( ( itineraryPointsIterator.value.lat - previousItineraryPoint.lat ) * scale ),
						previousItineraryPoint.lng +
						( ( itineraryPointsIterator.value.lng - previousItineraryPoint.lng ) * scale )
					],
				elev :
					previousItineraryPoint.elev +
					( ( itineraryPointsIterator.value.elev - previousItineraryPoint.elev ) * scale ),
				ascent :
					HUNDRED *
					( itineraryPointsIterator.value.elev - previousItineraryPoint.elev ) /
					previousItineraryPoint.distance,
				routeDistance : distance
			}
		);
	}

	/**
	This method search the nearest point on a route from a given point and compute the distance
	between the beginning of the route and the nearest point
	@param {Route} route The route object to be used
	@param {Array.<number>} latLng The latitude and longitude of the point
	@return {LatLngDistance} An object with the latitude, longitude and distance
	*/

	getClosestLatLngDistance ( route, latLng ) {
		if ( ZERO === route.itinerary.itineraryPoints.length ) {
			return null;
		}
		let itineraryPointIterator = route.itinerary.itineraryPoints.iterator;
		itineraryPointIterator.done;
		let minDistance = Number.MAX_VALUE;

		// projections of points are made
		let point = window.L.Projection.SphericalMercator.project (
			window.L.latLng ( latLng [ ZERO ], latLng [ ONE ] ) );
		let point1 = window.L.Projection.SphericalMercator.project (
			window.L.latLng ( itineraryPointIterator.value.lat, itineraryPointIterator.value.lng )
		);
		let closestLatLng = null;
		let closestDistance = DISTANCE.defaultValue;
		let endSegmentDistance = itineraryPointIterator.value.distance;
		while ( ! itineraryPointIterator.done ) {
			let point2 = window.L.Projection.SphericalMercator.project (
				window.L.latLng ( itineraryPointIterator.value.lat, itineraryPointIterator.value.lng )
			);
			let distance = window.L.LineUtil.pointToSegmentDistance ( point, point1, point2 );
			if ( distance < minDistance ) {
				minDistance = distance;
				closestLatLng = window.L.Projection.SphericalMercator.unproject (
					window.L.LineUtil.closestPointOnSegment ( point, point1, point2 )
				);
				closestDistance =
					endSegmentDistance -
					closestLatLng.distanceTo (
						window.L.latLng ( itineraryPointIterator.value.lat, itineraryPointIterator.value.lng )
					);
			}
			endSegmentDistance += itineraryPointIterator.value.distance;
			point1 = point2;
		}

		return Object.freeze (
			{
				latLng : [ closestLatLng.lat, closestLatLng.lng ],
				distance : closestDistance
			}
		);
	}

	/**
	This method build a window.L.latLngBounds object from an array of points
	@param {Array.<Array.<number>>} latLngs the array of latitude and longitude
	@return {Object} a Leaflet latLngBounds object
	*/

	getLatLngBounds ( latLngs ) {
		let sw = window.L.latLng ( [ LAT_LNG.maxLat, LAT_LNG.maxLng ] );
		let ne = window.L.latLng ( [ LAT_LNG.minLat, LAT_LNG.minLng ] );
		latLngs.forEach (
			latLng => {
				sw.lat = Math.min ( sw.lat, latLng [ ZERO ] );
				sw.lng = Math.min ( sw.lng, latLng [ ONE ] );
				ne.lat = Math.max ( ne.lat, latLng [ ZERO ] );
				ne.lng = Math.max ( ne.lng, latLng [ ONE ] );
			}
		);
		return window.L.latLngBounds ( sw, ne );
	}

	/**
	This method returns a window.L.latLngBounds that represents a square
	@param {Array.<number>} latLngCenter The latitude and longitude of the center of the square
	@param {number} dimension The half length of the square side in meter.
	*/

	getSquareBoundingBox ( latLngCenter, dimension ) {
		let deltaLat = ( dimension / EARTH_RADIUS ) * DEGREES.fromRadians;
		let latCenterRad = latLngCenter [ ZERO ] * DEGREES.toRadians;
		let deltaLng =
			Math.acos (
				( Math.cos ( dimension / EARTH_RADIUS ) - ( Math.sin ( latCenterRad ) ** TWO ) ) /
				( Math.cos ( latCenterRad ) ** TWO )
			) * DEGREES.fromRadians;
		return window.L.latLngBounds (
			window.L.latLng ( [ latLngCenter [ ZERO ] - deltaLat, latLngCenter [ ONE ] - deltaLng ] ),
			window.L.latLng ( [ latLngCenter [ ZERO ] + deltaLat, latLngCenter [ ONE ] + deltaLng ] )
		);
	}

	/**
	This method transforms a lat lng coordinate to pixel coordinate relative to the CRS origin using the Leaflet
	method map.project
	@param {Array.<number>} latLng The latitude and longitude of the point
	@param {number} zoom The zoom factor to use
	@return {Array.<number>} An array with the projected point
	*/

	project ( latLng, zoom ) {
		let projection = theTravelNotesData.map.project ( window.L.latLng ( latLng ), zoom );
		return [ projection.x, projection.y ];
	}

	/**
	Transform a screen coordinate to a latLng using the Leaflet map.containerPointToLatLng method
	@param {number} xScreen  The x screen coordinate
	@param {number} yScreen  The y screen coordinate
	@return {Array.<number>} The latitude and longitude of the point
	*/

	screenCoordToLatLng ( xScreen, yScreen ) {
		let latLng = theTravelNotesData.map.containerPointToLatLng ( window.L.point ( xScreen, yScreen ) );
		return [ latLng.lat, latLng.lng ];
	}

	/**
	Add two points
	@param {Array.<number>} point1 the first point to add
	@param {Array.<number>} point2 the second point to add
	@return {Array.<number>}
	*/

	addPoints ( point1, point2 ) {
		return [
			point1 [ ZERO ] + point2 [ ZERO ],
			point1 [ ONE ] + point2 [ ONE ]
		];
	}

	/**
	Subtrack two points
	@param {Array.<number>} point1 the first point
	@param {Array.<number>} point2 the point to subtrack
	@return {Array.<number>}
	*/

	subtrackPoints ( point1, point2 ) {
		return [
			point1 [ ZERO ] - point2 [ ZERO ],
			point1 [ ONE ] - point2 [ ONE ]
		];
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of Geometry class
@type {Geometry}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theGeometry = new Geometry ( );

export default theGeometry;

/*
--- End of Geometry.js file ---------------------------------------------------------------------------------------------------
*/