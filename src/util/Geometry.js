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
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/* global L */

import { theTravelNotesData } from '../data/TravelNotesData.js';

import { THE_CONST } from '../util/Constants.js';

/*
--- newGeometry function ----------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newGeometry ( ) {

	/*
	--- myGetLatLngBounds function ------------------------------------------------------------------------------------

	This function build a L.latLngBounds object from an array of points

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetLatLngBounds ( latLngs ) {
		let sw = L.latLng ( [ THE_CONST.latLng.maxLat, THE_CONST.latLng.maxLng ] );
		let ne = L.latLng ( [ THE_CONST.latLng.minLat, THE_CONST.latLng.minLng ] );
		latLngs.forEach (
			latLng => {
				sw.lat = Math.min ( sw.lat, latLng [ THE_CONST.zero ] );
				sw.lng = Math.min ( sw.lng, latLng [ THE_CONST.number1 ] );
				ne.lat = Math.max ( ne.lat, latLng [ THE_CONST.zero ] );
				ne.lng = Math.max ( ne.lng, latLng [ THE_CONST.number1 ] );
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

		if ( THE_CONST.zero === route.itinerary.itineraryPoints.length ) {
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
			L.latLng ( latLng [ THE_CONST.zero ], latLng [ THE_CONST.number1 ] ) );
		let point1 = L.Projection.SphericalMercator.project (
			L.latLng ( itineraryPointIterator.value.lat, itineraryPointIterator.value.lng )
		);

		// variables initialization
		let closestLatLng = null;
		let closestDistance = THE_CONST.distance.defaultValue;
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
		return ( ( Lng + THE_CONST.angle.degree540 ) % THE_CONST.angle.degree360 ) - THE_CONST.angle.degree180;
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
			latLngStartPoint [ THE_CONST.zero ] === latLngEndPoint [ THE_CONST.zero ]
			&&
			latLngStartPoint [ THE_CONST.number1 ] === latLngEndPoint [ THE_CONST.number1 ]
		) {

			// the function runs infinitely when latLngStartPoint === latLngStartPoint :-(
			return THE_CONST.zero;
		}

		// and since v1.7.0 we use the simple spherical law of cosines formula
		// (cos c = cos a cos b + sin a sin b cos C). The delta with the Leaflet function is
		// always < 10e-3 m. The error due to the earth radius is a lot bigger...
		// Notice: leaflet uses the haversine formula.
		const toRadians = Math.PI / THE_CONST.angle.degree180;
		const earthRadius = 6371e3;
		let latStartPoint = latLngStartPoint [ THE_CONST.zero ] * toRadians;
		let latEndPoint = latLngEndPoint [ THE_CONST.zero ] * toRadians;
		let deltaLng =
			(
				myNormalizeLng ( latLngEndPoint [ THE_CONST.number1 ] ) -
				myNormalizeLng ( latLngStartPoint [ THE_CONST.number1 ] )
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
	--- myAddPoint function -------------------------------------------------------------------------------------------

	This function transforms a lat lng coordinate to pixel coordinate relative to the CRS origin

	parameters:
	- latLng: the coordinates of the two points. Must be an array of two numbers
			with the lat and lng of the point
	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddPoint ( point1, point2 ) {
		return [
			point1 [ THE_CONST.zero ] + point2 [ THE_CONST.zero ],
			point1 [ THE_CONST.number1 ] + point2 [ THE_CONST.number1 ]
		];
	}

	/*
	--- mySubtrackPoint function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySubtrackPoints ( point1, point2 ) {
		return [
			point1 [ THE_CONST.zero ] - point2 [ THE_CONST.zero ],
			point1 [ THE_CONST.number1 ] - point2 [ THE_CONST.number1 ]
		];
	}

	/*
	--- Geometry object -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			getClosestLatLngDistance : ( route, latLng ) => myGetClosestLatLngDistance ( route, latLng ),
			getLatLngBounds : latLngs => myGetLatLngBounds ( latLngs ),
			pointsDistance :
				( latLngStartPoint, latLngEndPoint ) => myPointsDistance ( latLngStartPoint, latLngEndPoint ),
			project : ( latLng, zoom ) => myProject ( latLng, zoom ),
			addPoints : ( point1, point2 ) => myAddPoint ( point1, point2 ),
			subtrackPoints : ( point1, point2 ) => mySubtrackPoints ( point1, point2 )
		}
	);
}

export { newGeometry };

/*
--- End of Geometry.js file -------------------------------------------------------------------------------------------
*/