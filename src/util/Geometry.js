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
--- Geometry.js file -------------------------------------------------------------------------------------------------
This file contains:
	- the newGeometry function
Changes:
	- v1.6.0:
		- created
	-v1.7.0:
		- modified way of working for myPointsDistance ( )
		- issue #89 : Add elevation graph => new method getLatLngElevAtDist ( )
	- v1.9.0:
		- issue #101 : Add a print command for a route
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/* global L */

import { theTravelNotesData } from '../data/TravelNotesData.js';

import { DISTANCE, ZERO, ONE } from '../util/Constants.js';

/*
--- newGeometry function ----------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newGeometry ( ) {

	const DEGREE_180 = 180;
	const DEGREE_360 = 360;
	const DEGREE_540 = 540;

	/*
	--- myGetLatLngElevAtDist function --------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetLatLngElevAtDist ( route, distance ) {
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
		const HUNDRED = 100;
		return [
			previousItineraryPoint.lat + ( ( itineraryPointsIterator.value.lat - previousItineraryPoint.lat ) * scale ),
			previousItineraryPoint.lng + ( ( itineraryPointsIterator.value.lng - previousItineraryPoint.lng ) * scale ),
			previousItineraryPoint.elev + ( ( itineraryPointsIterator.value.elev - previousItineraryPoint.elev ) * scale ),
			HUNDRED *
				( itineraryPointsIterator.value.elev - previousItineraryPoint.elev ) / previousItineraryPoint.distance
		];
	}

	/*
	--- myGetLatLngBounds function ------------------------------------------------------------------------------------

	This function build a L.latLngBounds object from an array of points

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetLatLngBounds ( latLngs ) {

		const MAX_LAT = 90;
		const MIN_LAT = -90;
		const MAX_LNG = 180;
		const MIN_LNG = -180;

		let sw = L.latLng ( [ MAX_LAT, MAX_LNG ] );
		let ne = L.latLng ( [ MIN_LAT, MIN_LNG ] );
		latLngs.forEach (
			latLng => {
				sw.lat = Math.min ( sw.lat, latLng [ ZERO ] );
				sw.lng = Math.min ( sw.lng, latLng [ ONE ] );
				ne.lat = Math.max ( ne.lat, latLng [ ZERO ] );
				ne.lng = Math.max ( ne.lng, latLng [ ONE ] );
			}
		);
		return L.latLngBounds ( sw, ne );
	}

	/*
	--- myGetClosestLatLngDistance function ---------------------------------------------------------------------------

	This function search the nearest point on a route from a given point and compute the distance
	between the beginning of the route and the nearest point

	parameters:
	- route : the TravelNotes route object to be used
	- latLng : the coordinates of the point

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetClosestLatLngDistance ( route, latLng ) {

		if ( ZERO === route.itinerary.itineraryPoints.length ) {
			return null;
		}

		// an iterator on the route points is created...
		let itineraryPointIterator = route.itinerary.itineraryPoints.iterator;

		// ... and placed on the first point
		itineraryPointIterator.done;

		// the smallest distance is initialized ...
		let minDistance = Number.MAX_VALUE;

		// projections of points are made
		let point = L.Projection.SphericalMercator.project (
			L.latLng ( latLng [ ZERO ], latLng [ ONE ] ) );
		let point1 = L.Projection.SphericalMercator.project (
			L.latLng ( itineraryPointIterator.value.lat, itineraryPointIterator.value.lng )
		);

		// variables initialization
		let closestLatLng = null;
		let closestDistance = DISTANCE.defaultValue;
		let endSegmentDistance = itineraryPointIterator.value.distance;

		// iteration on the route points
		while ( ! itineraryPointIterator.done ) {

			// projection of the second point...
			let point2 = L.Projection.SphericalMercator.project (
				L.latLng ( itineraryPointIterator.value.lat, itineraryPointIterator.value.lng )
			);

			// and distance is computed
			let distance = L.LineUtil.pointToSegmentDistance ( point, point1, point2 );
			if ( distance < minDistance ) {

				// we have found the smallest distance ... till now :-)
				minDistance = distance;

				// the nearest point is computed
				closestLatLng = L.Projection.SphericalMercator.unproject (
					L.LineUtil.closestPointOnSegment ( point, point1, point2 )
				);

				// and the distance also
				closestDistance =
					endSegmentDistance -
					closestLatLng.distanceTo (
						L.latLng ( itineraryPointIterator.value.lat, itineraryPointIterator.value.lng )
					);
			}

			// we prepare the iteration for the next point...
			endSegmentDistance += itineraryPointIterator.value.distance;
			point1 = point2;
		}

		return { latLng : [ closestLatLng.lat, closestLatLng.lng ], distance : closestDistance };
	}

	/*
	--- myNormalizeLng function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myNormalizeLng ( Lng ) {
		return ( ( Lng + DEGREE_540 ) % DEGREE_360 ) - DEGREE_180;
	}

	/*
	--- myPointsDistance function -------------------------------------------------------------------------------------

	This function returns the distance between two points

	parameters:
	- latLngStartPoint and  latLngEndPoint: the coordinates of the two points. Must be an array of two numbers
			with the lat and lng of the points
	-------------------------------------------------------------------------------------------------------------------
	*/

	function myPointsDistance ( latLngStartPoint, latLngEndPoint ) {

		// since v1.4.0 we consider that the L.latLng.distanceTo ( ) function is the only
		// valid function to compute the distances. So all distances are always
		// recomputed with this function.

		// return L.latLng ( latLngStartPoint ).distanceTo ( L.latLng ( latLngEndPoint ) );

		if (
			latLngStartPoint [ ZERO ] === latLngEndPoint [ ZERO ]
			&&
			latLngStartPoint [ ONE ] === latLngEndPoint [ ONE ]
		) {

			// the function runs infinitely when latLngStartPoint === latLngEndPoint :-(
			return ZERO;
		}

		// and since v1.7.0 we use the simple spherical law of cosines formula
		// (cos c = cos a cos b + sin a sin b cos C). The delta with the Leaflet function is
		// always < 10e-3 m. The error due to the earth radius is a lot bigger...
		// Notice: leaflet uses the haversine formula.
		const toRadians = Math.PI / DEGREE_180;
		const earthRadius = 6371e3;
		let latStartPoint = latLngStartPoint [ ZERO ] * toRadians;
		let latEndPoint = latLngEndPoint [ ZERO ] * toRadians;
		let deltaLng =
			(
				myNormalizeLng ( latLngEndPoint [ ONE ] ) -
				myNormalizeLng ( latLngStartPoint [ ONE ] )
			)
			* toRadians;
		return Math.acos (
			( Math.sin ( latStartPoint ) * Math.sin ( latEndPoint ) ) +
				( Math.cos ( latStartPoint ) * Math.cos ( latEndPoint ) * Math.cos ( deltaLng ) )
		) * earthRadius;
	}

	/*
	--- myProject function --------------------------------------------------------------------------------------------

	This function transforms a lat lng coordinate to pixel coordinate relative to the CRS origin

	parameters:
	- latLng: the coordinates of the two points. Must be an array of two numbers
			with the lat and lng of the point
	-------------------------------------------------------------------------------------------------------------------
	*/

	function myProject ( latLng, zoom ) {
		let projection = theTravelNotesData.map.project ( L.latLng ( latLng ), zoom );
		return [ projection.x, projection.y ];
	}

	/*
	--- myScreenCoordToLatLng function --------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myScreenCoordToLatLng ( xScreen, yScreen ) {
		let latLng = theTravelNotesData.map.containerPointToLatLng ( L.point ( xScreen, yScreen ) );
		return [ latLng.lat, latLng.lng ];
	}

	/*
	--- myAddPoint function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddPoint ( point1, point2 ) {
		return [
			point1 [ ZERO ] + point2 [ ZERO ],
			point1 [ ONE ] + point2 [ ONE ]
		];
	}

	/*
	--- mySubtrackPoint function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySubtrackPoints ( point1, point2 ) {
		return [
			point1 [ ZERO ] - point2 [ ZERO ],
			point1 [ ONE ] - point2 [ ONE ]
		];
	}

	/*
	--- Geometry object -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			getLatLngElevAtDist : ( route, distance ) => myGetLatLngElevAtDist ( route, distance ),
			getClosestLatLngDistance : ( route, latLng ) => myGetClosestLatLngDistance ( route, latLng ),
			getLatLngBounds : latLngs => myGetLatLngBounds ( latLngs ),
			pointsDistance :
				( latLngStartPoint, latLngEndPoint ) => myPointsDistance ( latLngStartPoint, latLngEndPoint ),
			project : ( latLng, zoom ) => myProject ( latLng, zoom ),
			screenCoordToLatLng : ( xScreen, yScreen ) => myScreenCoordToLatLng ( xScreen, yScreen ),
			addPoints : ( point1, point2 ) => myAddPoint ( point1, point2 ),
			subtrackPoints : ( point1, point2 ) => mySubtrackPoints ( point1, point2 )
		}
	);
}

export { newGeometry };

/*
--- End of Geometry.js file -------------------------------------------------------------------------------------------
*/