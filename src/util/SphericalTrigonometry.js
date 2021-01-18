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
		- issue #89 : Add elevation graph => new method getLatLngElevAtDist ( )
	- v1.9.0:
		- issue #101 : Add a print command for a route
	- v1.13.0:
		- Issue #125 : Outphase osmSearch and add it to TravelNotes
Doc reviewed 20200824
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file SphericalTrigonometry.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module SphericalTrigonometry
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { ZERO, ONE } from '../util/Constants.js';

const DEGREE_180 = 180;
const DEGREE_360 = 360;
const DEGREE_540 = 540;

const TO_RADIANS = Math.PI / DEGREE_180;
const EARTH_RADIUS = 6371e3;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function myNormalizeLng
@desc This function normalize a longitude (always between -180° and 180°)
@param {number} Lng The longitude to normalize
@return {number} The normalized longitude
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function myNormalizeLng ( Lng ) {
	return ( ( Lng + DEGREE_540 ) % DEGREE_360 ) - DEGREE_180;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class contains methods for spherical trigonometry operations
@see {@link theSphericalTrigonometry} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class SphericalTrigonometry {

	/**

	This function gives an arc of a spherical triangle when the 2 others arcs and the opposite summit are know
	It's the well know cosinus law
	cos a = cos b cos c + sin b sin c cos A
	cos b =	cos c cos a + sin c sin a cos B
	cos c = cos a cos b + sin a sin b cos C

	@param {number} summit the opposite summit
	@param {number} arc1 the first arc
	@param {number} arc2 the second arc

	*/

	arcFromSummitArcArc ( summit, arc1, arc2 ) {
		return Math.acos (
			( Math.cos ( arc1 ) * Math.cos ( arc2 ) ) +
			( Math.sin ( arc1 ) * Math.sin ( arc2 ) * Math.cos ( summit ) )
		);
	}

	/**

	This function is also the well know cosinus law written in an other way....
	cos C = ( cos c - cos a cos b ) / sin a sin b

	@param {number} arc1 the first arc
	@param {number} arc2 the second arc
	@param {number} oppositeArc the opposite arc

	*/

	summitFromArcArcArc ( arc1, arc2, oppositeArc ) {
		return Math.acos (
			( Math.cos ( oppositeArc ) - ( Math.cos ( arc1 ) * Math.cos ( arc2 ) ) ) /
			( Math.sin ( arc1 ) * Math.sin ( arc2 ) )
		);
	}

	/**
	This function returns the distance between two points
	Since v1.7.0 we use the simple spherical law of cosines formula
	(cos c = cos a cos b + sin a sin b cos C). The delta with the Leaflet function is
	always < 10e-3 m. The error due to the earth radius is a lot bigger.
	Notice: leaflet uses the haversine formula.
	@param {Array.<number>} latLngStartPoint The coordinates of the start point
	@param {Array.<number>} latLngEndPoint The coordinates of the end point
	*/

	pointsDistance ( latLngStartPoint, latLngEndPoint ) {
		if (
			latLngStartPoint [ ZERO ] === latLngEndPoint [ ZERO ]
			&&
			latLngStartPoint [ ONE ] === latLngEndPoint [ ONE ]
		) {

			// the function runs infinitely when latLngStartPoint === latLngEndPoint :-(
			return ZERO;
		}
		let latStartPoint = latLngStartPoint [ ZERO ] * TO_RADIANS;
		let latEndPoint = latLngEndPoint [ ZERO ] * TO_RADIANS;
		let deltaLng =
			(
				myNormalizeLng ( latLngEndPoint [ ONE ] ) -
				myNormalizeLng ( latLngStartPoint [ ONE ] )
			)
			* TO_RADIANS;
		return Math.acos (
			( Math.sin ( latStartPoint ) * Math.sin ( latEndPoint ) ) +
				( Math.cos ( latStartPoint ) * Math.cos ( latEndPoint ) * Math.cos ( deltaLng ) )
		) * EARTH_RADIUS;
	}
}

const ourSphericalTrigonometry = Object.freeze ( new SphericalTrigonometry );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of SphericalTrigonometry class
	@type {SphericalTrigonometry}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourSphericalTrigonometry as theSphericalTrigonometry
};

/*
--- End of SphericalTrigonometry.js file --------------------------------------------------------------------------------------
*/