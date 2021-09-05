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
	- v1.7.0:
		- created
	- v1.8.0:
		- Issue ♯98 : Elevation is not modified in the itinerary pane
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file ProfileFactory.js
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

import theConfig from '../data/Config.js';
import { SVG_NS, SVG_PROFILE, ZERO, ONE, TWO, DISTANCE } from '../main/Constants.js';

const TEN = 10;

const OUR_LEFT_PROFILE = SVG_PROFILE.margin.toFixed ( ZERO );
const OUR_BOTTOM_PROFILE = ( SVG_PROFILE.margin + SVG_PROFILE.height ).toFixed ( ZERO );
const OUR_RIGHT_PROFILE = ( SVG_PROFILE.margin + SVG_PROFILE.width ).toFixed ( ZERO );
const OUR_TOP_PROFILE = SVG_PROFILE.margin.toFixed ( ZERO );
const OUR_MAX_X_LEGEND_NUMBER = 8;
const OUR_MAX_Y_LEGEND_NUMBER = 4;
const OUR_RIGHT_TEXT_PROFILE = ( SVG_PROFILE.margin + SVG_PROFILE.width + SVG_PROFILE.xDeltaText ).toFixed ( ZERO );
const OUR_LEFT_TEXT_PROFILE = ( SVG_PROFILE.margin - SVG_PROFILE.xDeltaText ).toFixed ( ZERO );
const OUR_BOTTOM_TEXT_PROFILE = SVG_PROFILE.margin + SVG_PROFILE.height + ( SVG_PROFILE.margin / TWO );

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class provides methods to build a Route profile
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ProfileFactory {

	#route = null;

	#smoothDistance = ZERO;
	#smoothPoints = theConfig.route.elev.smoothPoints;

	#svg = null;
	#VScale = ONE;
	#HScale = ONE;

	#minElev = Number.MAX_VALUE;
	#maxElev = ZERO;
	#deltaElev = ZERO;

	/**
	This method creates a map with temporary points that are all at the same distance.
	Elevation of tmp points is computed from the elevation of the route to smooth
	@private
	*/

	#createTmpPoints ( ) {

		let tmpPointsDistance = 0;
		let tmpPointElev = 0;
		let tmpPoints = [];
		let itineraryPointsIterator = this.#route.itinerary.itineraryPoints.iterator;
		let itineraryPointsDistance = 0;

		// going to the first itinerary point
		let done = itineraryPointsIterator.done;

		// adding the first itinerary point to the tmpPoints
		tmpPoints.push ( { distance : tmpPointsDistance, elev : itineraryPointsIterator.value.elev } );

		// going to the second itinerary point
		itineraryPointsDistance += itineraryPointsIterator.value.distance;
		done = itineraryPointsIterator.done;

		// loop on next itinerary points
		while ( ! done ) {
			tmpPointsDistance += this.#smoothDistance;

			// loop on the itinerary points till we pass the itinerary point distance
			while ( tmpPointsDistance >= itineraryPointsDistance && ! done ) {
				itineraryPointsDistance += itineraryPointsIterator.value.distance;
				done = itineraryPointsIterator.done;
			}
			if ( ! done ) {

				// adding tmpPoint
				let ascentFactor = ( itineraryPointsIterator.value.elev - itineraryPointsIterator.previous.elev ) /
					itineraryPointsIterator.previous.distance;
				tmpPointElev =
					itineraryPointsIterator.value.elev -
					( ( itineraryPointsDistance - tmpPointsDistance ) * ascentFactor );
				tmpPoints.push ( { distance : tmpPointsDistance, elev : tmpPointElev } );
			}
		}

		// last itinerary point is added
		tmpPoints.push ( { distance : itineraryPointsDistance, elev : this.#route.itinerary.itineraryPoints.last.elev } );

		return tmpPoints;
	}

	/**
	Create a map from the tmppoints with smooth elevation
	@private
	*/

	#createSmoothPoints ( ) {
		let tmpPoints = this.#createTmpPoints ( );
		let smoothPoints = new Map;

		let deltaElev = ( tmpPoints [ this.#smoothPoints ].elev - tmpPoints [ ZERO ].elev ) / this.#smoothPoints;

		let pointCounter = ZERO;

		// Computing the first elevs
		for ( pointCounter = ZERO; pointCounter < this.#smoothPoints; pointCounter ++ ) {
			smoothPoints.set (
				pointCounter * this.#smoothDistance,
				{
					distance : pointCounter * this.#smoothDistance,
					elev : tmpPoints [ ZERO ].elev + ( deltaElev * pointCounter )
				}
			);
		}

		// Computing next elevs
		for ( pointCounter = this.#smoothPoints; pointCounter < tmpPoints.length - this.#smoothPoints; pointCounter ++ ) {
			let elevSum = ZERO;
			for (
				let pointNumber = pointCounter - this.#smoothPoints;
				pointCounter + this.#smoothPoints >= pointNumber;
				pointNumber ++
			) {
				elevSum += tmpPoints [ pointNumber ].elev;
			}
			smoothPoints.set (
				tmpPoints [ pointCounter ].distance,
				{
					distance : tmpPoints [ pointCounter ].distance,
					elev : elevSum / ( ( this.#smoothPoints * TWO ) + ONE )
				}
			);
		}

		pointCounter --;

		deltaElev = this.#smoothDistance * (
			tmpPoints [ tmpPoints.length - ONE ].elev -
				tmpPoints [ tmpPoints.length - ONE - this.#smoothPoints ].elev
		) /
			(
				tmpPoints [ tmpPoints.length - ONE ].distance -
				tmpPoints [ tmpPoints.length - ONE - this.#smoothPoints ].distance
			);

		// Computing the last elevs
		smoothPoints.set (
			tmpPoints [ pointCounter ].distance + this.#smoothDistance,
			{
				distance : tmpPoints [ pointCounter ].distance + this.#smoothDistance,
				elev : tmpPoints [ pointCounter ].elev + deltaElev
			}
		);
		smoothPoints.set (
			tmpPoints [ pointCounter ].distance + ( this.#smoothDistance * TWO ),
			{
				distance : tmpPoints [ pointCounter ].distance + ( this.#smoothDistance * TWO ),
				elev : tmpPoints [ pointCounter ].elev + ( deltaElev * TWO )
			}
		);

		return smoothPoints;
	}

	/**
	This method creates the profile polyline in the svg element
	@private
	*/

	#createProfilePolyline ( ) {
		let pointsAttribute = '';
		let distance = ZERO;
		let xPolyline = ZERO;
		let yPolyline = ZERO;
		this.#route.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				xPolyline = ( SVG_PROFILE.margin + ( this.#HScale * distance ) ).toFixed ( ZERO );
				yPolyline =
					(
						SVG_PROFILE.margin +
						( this.#VScale * ( this.#maxElev - itineraryPoint.elev ) )
					)
						.toFixed ( ZERO );
				pointsAttribute += xPolyline + ',' + yPolyline + ' ';
				distance += itineraryPoint.distance;
			}
		);
		let polyline = document.createElementNS ( SVG_NS, 'polyline' );
		polyline.setAttributeNS ( null, 'points', pointsAttribute );
		polyline.setAttributeNS ( null, 'class', 'TravelNotes-Route-SvgProfile-profilePolyline' );
		this.#svg.appendChild ( polyline );
	}

	/**
	This method creates the frame polyline in the svg element
	@private
	*/

	#createFramePolyline ( ) {
		let pointsAttribute =
			OUR_LEFT_PROFILE + ',' + OUR_TOP_PROFILE + ' ' + OUR_LEFT_PROFILE + ',' + OUR_BOTTOM_PROFILE + ' ' +
			OUR_RIGHT_PROFILE + ',' + OUR_BOTTOM_PROFILE + ' ' + OUR_RIGHT_PROFILE + ',' + OUR_TOP_PROFILE;
		let polyline = document.createElementNS ( SVG_NS, 'polyline' );
		polyline.setAttributeNS ( null, 'points', pointsAttribute );
		polyline.setAttributeNS ( null, 'class', 'TravelNotes-Route-SvgProfile-framePolyline' );
		this.#svg.appendChild ( polyline );
	}

	/**
	This method creates the distance texts in the svg element
	@private
	*/

	#createDistanceTexts ( ) {

		let minDelta = Number.MAX_VALUE;
		let selectedScale = 0;
		SVG_PROFILE.hScales.forEach (
			scale => {
				let currentDelta = Math.abs ( ( this.#route.distance / OUR_MAX_X_LEGEND_NUMBER ) - scale );
				if ( currentDelta < minDelta ) {
					minDelta = currentDelta;
					selectedScale = scale;
				}
			}
		);
		let distance = Math.ceil ( this.#route.chainedDistance / selectedScale ) * selectedScale;
		while ( distance < this.#route.distance + this.#route.chainedDistance ) {
			let distanceText = document.createElementNS ( SVG_NS, 'text' );

			distanceText.appendChild (
				document.createTextNode (
					DISTANCE.metersInKm < selectedScale || ZERO < this.#route.chainedDistance
						?
						( distance / DISTANCE.metersInKm ) + ' km'
						:
						distance + ' m '
				)
			);
			distanceText.setAttributeNS ( null, 'class', 'TravelNotes-Route-SvgProfile-distLegend' );
			distanceText.setAttributeNS (
				null,
				'x',
				SVG_PROFILE.margin + ( ( distance - this.#route.chainedDistance ) * this.#HScale )
			);
			distanceText.setAttributeNS ( null, 'y', OUR_BOTTOM_TEXT_PROFILE );
			distanceText.setAttributeNS ( null, 'text-anchor', 'start' );
			this.#svg.appendChild ( distanceText );
			distance += selectedScale;
		}
	}

	/**
	This method creates the elevation texts in the svg element
	@private
	*/

	#createElevTexts ( ) {

		let minDelta = Number.MAX_VALUE;
		let selectedScale = ZERO;
		SVG_PROFILE.vScales.forEach (
			scale => {
				let currentDelta = Math.abs ( ( this.#deltaElev / OUR_MAX_Y_LEGEND_NUMBER ) - scale );
				if ( currentDelta < minDelta ) {
					minDelta = currentDelta;
					selectedScale = scale;
				}
			}
		);
		let elev = Math.ceil ( this.#minElev / selectedScale ) * selectedScale;
		while ( elev < this.#maxElev ) {
			let elevTextY = SVG_PROFILE.margin + ( ( this.#maxElev - elev ) * this.#VScale );
			let rightElevText = document.createElementNS ( SVG_NS, 'text' );
			rightElevText.appendChild ( document.createTextNode ( elev.toFixed ( ZERO ) ) );
			rightElevText.setAttributeNS ( null, 'class', 'TravelNotes-Route-SvgProfile-elevLegend' );
			rightElevText.setAttributeNS ( null, 'x', OUR_RIGHT_TEXT_PROFILE );
			rightElevText.setAttributeNS ( null, 'y', elevTextY );
			rightElevText.setAttributeNS ( null, 'text-anchor', 'start' );
			this.#svg.appendChild ( rightElevText );
			let leftElevText = document.createElementNS ( SVG_NS, 'text' );
			leftElevText.appendChild ( document.createTextNode ( elev.toFixed ( ZERO ) ) );
			leftElevText.setAttributeNS ( null, 'class', 'TravelNotes-Route-SvgProfile-elevLegend' );
			leftElevText.setAttributeNS ( null, 'x', OUR_LEFT_TEXT_PROFILE );
			leftElevText.setAttributeNS ( null, 'y', elevTextY );
			leftElevText.setAttributeNS ( null, 'text-anchor', 'end' );
			this.#svg.appendChild ( leftElevText );
			elev += selectedScale;
		}

	}

	/**
	This method creates the svg element
	@private
	*/

	#createSvgElement ( ) {
		this.#svg = document.createElementNS ( SVG_NS, 'svg' );
		this.#svg.setAttributeNS (
			null,
			'viewBox',
			'0 0 ' + ( SVG_PROFILE.width + ( TWO * SVG_PROFILE.margin ) ) +
			' ' + ( SVG_PROFILE.height + ( TWO * SVG_PROFILE.margin ) )
		);
		this.#svg.setAttributeNS ( null, 'class', 'TravelNotes-Route-SvgProfile' );
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	This method smooth the Route elevation. Some elevations are not correct due to imprecisions in the elev files
	so it's needed to smooth these strange elevs
	@param {Route} route The Route to smooth
	*/

	smooth ( route ) {

		// some computations to prepare the job...
		this.#route = route;
		let itineraryPointsIterator = this.#route.itinerary.itineraryPoints.iterator;
		let distance = ZERO;
		let elev = ZERO;
		while ( ! itineraryPointsIterator.done ) {
			distance += itineraryPointsIterator.value.distance;
			elev +=
				itineraryPointsIterator.next
					?
					Math.abs ( itineraryPointsIterator.value.elev - itineraryPointsIterator.next.elev )
					:
					ZERO;

		}

		this.#smoothDistance = Math.floor ( theConfig.route.elev.smoothCoefficient / ( elev / distance ) ) * TEN;
		if ( distance <= TWO * this.#smoothPoints * this.#smoothDistance ) {
			return;
		}

		// creating smooth points
		let smoothPoints = this.#createSmoothPoints ( );

		itineraryPointsIterator = this.#route.itinerary.itineraryPoints.iterator;

		// we skip the first itinerary point
		itineraryPointsIterator.done;
		let itineraryPointsTotalDistance = itineraryPointsIterator.value.distance;

		// loop on the itinerary point to push the smooth elev
		while ( ! itineraryPointsIterator.done ) {
			let previousIronPoint = smoothPoints.get (
				Math.floor ( itineraryPointsTotalDistance / this.#smoothDistance ) * this.#smoothDistance );
			let nextIronPoint = smoothPoints.get (
				Math.ceil ( itineraryPointsTotalDistance / this.#smoothDistance ) * this.#smoothDistance );
			if ( previousIronPoint && nextIronPoint ) {
				let deltaDist = itineraryPointsTotalDistance - previousIronPoint.distance;
				let ascentFactor = ( nextIronPoint.elev - previousIronPoint.elev ) /
					( nextIronPoint.distance - previousIronPoint.distance );
				itineraryPointsIterator.value.elev = previousIronPoint.elev + ( deltaDist * ascentFactor );
			}
			itineraryPointsTotalDistance += itineraryPointsIterator.value.distance;
		}
	}

	/**
	this method creates the svg with the Route profile. This svg is displayed in the profile window and in the roadbook
	@param {Route} route The route for witch the svg must be created
	@return the svg element with the profile
	*/

	createSvg ( route ) {

		// Doing some computations for min and max elev and scale...
		this.#route = route;
		this.#minElev = Number.MAX_VALUE;
		this.#maxElev = ZERO;
		this.#route.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				this.#maxElev = Math.max ( this.#maxElev, itineraryPoint.elev );
				this.#minElev = Math.min ( this.#minElev, itineraryPoint.elev );
			}
		);
		this.#deltaElev = this.#maxElev - this.#minElev;
		this.#VScale = SVG_PROFILE.height / this.#deltaElev;
		this.#HScale = SVG_PROFILE.width / this.#route.distance;

		// ... then creates the svg
		this.#createSvgElement ( );
		this.#createProfilePolyline ( );
		this.#createFramePolyline ( );
		this.#createElevTexts ( );
		this.#createDistanceTexts ( );

		return this.#svg;
	}
}

export default ProfileFactory;

/*
--- End of ProfileFactory.js file ---------------------------------------------------------------------------------------------
*/