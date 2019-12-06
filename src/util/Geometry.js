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
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/* global L */

export { newGeometry };
import { theTravelNotesData } from '../data/TravelNotesData.js';

/*
--- newGeometry function ----------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newGeometry  ( ) {

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

		if ( 0 === route.itinerary.itineraryPoints.length ) {
			return null;
		}

		// an iterator on the route points is created...
		let itineraryPointIterator = route.itinerary.itineraryPoints.iterator;

		// ... and placed on the first point
		itineraryPointIterator.done;

		// the smallest distance is initialized ...
		let minDistance = Number.MAX_VALUE;

		// projections of points are made
		let point = L.Projection.SphericalMercator.project ( L.latLng ( latLng [ 0 ], latLng [ 1 ] ) );
		let point1 = L.Projection.SphericalMercator.project (
			L.latLng ( itineraryPointIterator.value.lat, itineraryPointIterator.value.lng )
		);

		// variables initialization
		let closestLatLng = null;
		let closestDistance = 0;
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
		return L.latLng ( latLngStartPoint ).distanceTo ( L.latLng ( latLngEndPoint ) );
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
		return [ point1 [ 0 ] + point2 [ 0 ],   point1 [ 1 ] + point2 [ 1 ] ];
	}

	/*
	--- mySubtrackPoint function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySubtrackPoints ( point1, point2 ) {
		return [ point1 [ 0 ] - point2 [ 0 ],   point1 [ 1 ] - point2 [ 1 ] ];
	}

	/*
	--- Geometry object -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			getClosestLatLngDistance : ( route, latLng ) => myGetClosestLatLngDistance ( route, latLng ),
			pointsDistance :
				( latLngStartPoint, latLngEndPoint ) => myPointsDistance ( latLngStartPoint, latLngEndPoint ),
			project : ( latLng, zoom ) => myProject ( latLng, zoom ),
			addPoints : ( point1, point2 ) => myAddPoint ( point1, point2 ),
			subtrackPoints : ( point1, point2 ) => mySubtrackPoints ( point1, point2 )
		}
	);
}

/*
--- End of Geometry.js file -------------------------------------------------------------------------------------------
*/