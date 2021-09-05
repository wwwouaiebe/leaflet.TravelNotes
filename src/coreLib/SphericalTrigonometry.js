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

@file SphericalTrigonometry.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module coreLib
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { ZERO, ONE, DEGREES, EARTH_RADIUS } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class SphericalTrigonometry
@classdesc This class contains methods for spherical trigonometry operations
@see {@link theSphericalTrigonometry} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class SphericalTrigonometry {

	/**
	This method normalize a longitude (always between -180° and 180°)
	@param {number} Lng The longitude to normalize
	@return {number} The normalized longitude
	@private
	*/

	#normalizeLng ( Lng ) {
		return ( ( Lng + DEGREES.d540 ) % DEGREES.d360 ) - DEGREES.d180;
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**

	This method gives an arc of a spherical triangle when the 2 others arcs and the opposite summit are know
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

	This method is also the well know cosinus law written in an other way....
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
	This method returns the distance between two points
	Since v1.7.0 we use the simple spherical law of cosines formula
	(cos c = cos a cos b + sin a sin b cos C). The delta with the Leaflet method is
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

			// the method runs infinitely when latLngStartPoint === latLngEndPoint :-(
			return ZERO;
		}
		let latStartPoint = latLngStartPoint [ ZERO ] * DEGREES.toRadians;
		let latEndPoint = latLngEndPoint [ ZERO ] * DEGREES.toRadians;
		let deltaLng =
			(
				this.#normalizeLng ( latLngEndPoint [ ONE ] ) -
				this.#normalizeLng ( latLngStartPoint [ ONE ] )
			)
			* DEGREES.toRadians;
		return Math.acos (
			( Math.sin ( latStartPoint ) * Math.sin ( latEndPoint ) ) +
				( Math.cos ( latStartPoint ) * Math.cos ( latEndPoint ) * Math.cos ( deltaLng ) )
		) * EARTH_RADIUS;
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of SphericalTrigonometry class
@type {SphericalTrigonometry}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theSphericalTrigonometry = new SphericalTrigonometry ( );

export default theSphericalTrigonometry;

/*
--- End of SphericalTrigonometry.js file --------------------------------------------------------------------------------------
*/