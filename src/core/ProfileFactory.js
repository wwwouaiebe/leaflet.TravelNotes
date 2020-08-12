/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
		- Issue #98 : Elevation is not modified in the itinerary pane
Doc reviewed 20200805
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file ProfileFactory.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module ProfileFactory
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theConfig } from '../data/Config.js';
import { SVG_PROFILE, ZERO, ONE, TWO } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewProfileFactory
@desc constructor of ProfileFactory object
@return {ProfileFactory} an instance of ProfileFactory object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewProfileFactory ( ) {

	let mySvg = null;
	let myVScale = ONE;
	let myHScale = ONE;

	let myMinElev = Number.MAX_VALUE;
	let myMaxElev = ZERO;
	let myDeltaElev = ZERO;

	let myRoute = null;

	let mySmoothDistance = ZERO;
	let mySmoothCoefficient = theConfig.route.elev.smoothCoefficient;
	let mySmoothPoints = theConfig.route.elev.smoothPoints;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function createTmpPoints
	@desc this method creates a map with temporary points that are all at the same distance.
	Elevation of tmp points is computed from the elevation of the route to smooth
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function createTmpPoints ( ) {

		let tmpPointsDistance = 0;
		let tmpPointElev = 0;
		let tmpPoints = [];
		let itineraryPointsIterator = myRoute.itinerary.itineraryPoints.iterator;
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
			tmpPointsDistance += mySmoothDistance;

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
		tmpPoints.push ( { distance : itineraryPointsDistance, elev : myRoute.itinerary.itineraryPoints.last.elev } );

		return tmpPoints;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function createSmoothPoints
	@creates a map form the tmppoints with smooth elevation
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function createSmoothPoints ( ) {
		let tmpPoints = createTmpPoints ( );
		let smoothPoints = new Map;

		let deltaElev = ( tmpPoints [ mySmoothPoints ].elev - tmpPoints [ ZERO ].elev ) / mySmoothPoints;

		let pointCounter = ZERO;

		// Computing the first elevs
		for ( pointCounter = ZERO; pointCounter < mySmoothPoints; pointCounter ++ ) {
			smoothPoints.set (
				pointCounter * mySmoothDistance,
				{
					distance : pointCounter * mySmoothDistance,
					elev : tmpPoints [ ZERO ].elev + ( deltaElev * pointCounter )
				}
			);
		}

		// Computing next elevs
		for ( pointCounter = mySmoothPoints; pointCounter < tmpPoints.length - mySmoothPoints; pointCounter ++ ) {
			let elevSum = ZERO;
			for (
				let pointNumber = pointCounter - mySmoothPoints;
				pointCounter + mySmoothPoints >= pointNumber;
				pointNumber ++
			) {
				elevSum += tmpPoints [ pointNumber ].elev;
			}
			smoothPoints.set (
				tmpPoints [ pointCounter ].distance,
				{
					distance : tmpPoints [ pointCounter ].distance,
					elev : elevSum / ( ( mySmoothPoints * TWO ) + ONE )
				}
			);
		}

		pointCounter --;

		deltaElev = mySmoothDistance * (
			tmpPoints [ tmpPoints.length - ONE ].elev -
				tmpPoints [ tmpPoints.length - ONE - mySmoothPoints ].elev
		) /
			(
				tmpPoints [ tmpPoints.length - ONE ].distance -
				tmpPoints [ tmpPoints.length - ONE - mySmoothPoints ].distance
			);

		// Computing the last elevs
		smoothPoints.set (
			tmpPoints [ pointCounter ].distance + mySmoothDistance,
			{
				distance : tmpPoints [ pointCounter ].distance + mySmoothDistance,
				elev : tmpPoints [ pointCounter ].elev + deltaElev
			}
		);
		smoothPoints.set (
			tmpPoints [ pointCounter ].distance + ( mySmoothDistance * TWO ),
			{
				distance : tmpPoints [ pointCounter ].distance + ( mySmoothDistance * TWO ),
				elev : tmpPoints [ pointCounter ].elev + ( deltaElev * TWO )
			}
		);

		return smoothPoints;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function mySmooth
	@desc this method smooth the elevations of the route
	@param {Route} route The Route to smooth
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function mySmooth ( route ) {

		// some computations to prepare the job...
		myRoute = route;
		let itineraryPointsIterator = myRoute.itinerary.itineraryPoints.iterator;
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

		const TEN = 10;
		mySmoothDistance = Math.floor ( mySmoothCoefficient / ( elev / distance ) ) * TEN;
		if ( distance <= TWO * mySmoothPoints * mySmoothDistance ) {
			return;
		}

		// creating smooth points
		let smoothPoints = createSmoothPoints ( );

		itineraryPointsIterator = myRoute.itinerary.itineraryPoints.iterator;

		// we skip the first itinerary point
		itineraryPointsIterator.done;
		let itineraryPointsTotalDistance = itineraryPointsIterator.value.distance;

		// loop on the itinerary point to push the smooth elev
		while ( ! itineraryPointsIterator.done ) {
			let previousIronPoint = smoothPoints.get (
				Math.floor ( itineraryPointsTotalDistance / mySmoothDistance ) * mySmoothDistance );
			let nextIronPoint = smoothPoints.get (
				Math.ceil ( itineraryPointsTotalDistance / mySmoothDistance ) * mySmoothDistance );
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
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateProfilePolyline
	@desc this method creates the profile polyline in the svg element
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateProfilePolyline ( ) {
		let pointsAttribute = '';
		let distance = ZERO;
		let xPolyline = ZERO;
		let yPolyline = ZERO;
		myRoute.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				xPolyline = ( SVG_PROFILE.margin + ( myHScale * distance ) ).toFixed ( ZERO );
				yPolyline =
					(
						SVG_PROFILE.margin +
						( myVScale * ( myMaxElev - itineraryPoint.elev ) )
					)
						.toFixed ( ZERO );
				pointsAttribute += xPolyline + ',' + yPolyline + ' ';
				distance += itineraryPoint.distance;
			}
		);
		let polyline = document.createElementNS ( 'http://www.w3.org/2000/svg', 'polyline' );
		polyline.setAttributeNS ( null, 'points', pointsAttribute );
		polyline.setAttributeNS ( null, 'class', 'TravelNotes-SvgProfile-profilePolyline' );
		mySvg.appendChild ( polyline );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateFramePolyline
	@desc this method creates the frame polyline in the svg element
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateFramePolyline ( ) {
		const LEFT = SVG_PROFILE.margin.toFixed ( ZERO );
		const BOTTOM = ( SVG_PROFILE.margin + SVG_PROFILE.height ).toFixed ( ZERO );
		const RIGHT = ( SVG_PROFILE.margin + SVG_PROFILE.width ).toFixed ( ZERO );
		const TOP = SVG_PROFILE.margin.toFixed ( ZERO );
		let pointsAttribute =
			LEFT + ',' + TOP + ' ' + LEFT + ',' + BOTTOM + ' ' +
			RIGHT + ',' + BOTTOM + ' ' + RIGHT + ',' + TOP;
		let polyline = document.createElementNS ( 'http://www.w3.org/2000/svg', 'polyline' );
		polyline.setAttributeNS ( null, 'points', pointsAttribute );
		polyline.setAttributeNS ( null, 'class', 'TravelNotes-SvgProfile-framePolyline' );
		mySvg.appendChild ( polyline );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateDistanceTexts
	@desc this method creates the distance texts in the svg element
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDistanceTexts ( ) {

		const MAX_X_LEGEND_NUMBER = 8;
		const BOTTOM_TEXT = SVG_PROFILE.margin + SVG_PROFILE.height + ( SVG_PROFILE.margin / TWO );
		const M_IN_KM = 1000;

		let minDelta = Number.MAX_VALUE;
		let selectedScale = 0;
		SVG_PROFILE.hScales.forEach (
			scale => {
				let currentDelta = Math.abs ( ( myRoute.distance / MAX_X_LEGEND_NUMBER ) - scale );
				if ( currentDelta < minDelta ) {
					minDelta = currentDelta;
					selectedScale = scale;
				}
			}
		);
		let distance = Math.ceil ( myRoute.chainedDistance / selectedScale ) * selectedScale;
		while ( distance < myRoute.distance + myRoute.chainedDistance ) {
			let distanceText = document.createElementNS ( 'http://www.w3.org/2000/svg', 'text' );

			distanceText.appendChild (
				document.createTextNode (
					M_IN_KM < selectedScale || ZERO < myRoute.chainedDistance
						?
						( distance / M_IN_KM ) + ' km'
						:
						distance + ' m '
				)
			);
			distanceText.setAttributeNS ( null, 'class', 'TravelNotes-SvgProfile-distLegend' );
			distanceText.setAttributeNS (
				null,
				'x',
				SVG_PROFILE.margin + ( ( distance - myRoute.chainedDistance ) * myHScale )
			);
			distanceText.setAttributeNS ( null, 'y', BOTTOM_TEXT );
			distanceText.setAttributeNS ( null, 'text-anchor', 'start' );
			mySvg.appendChild ( distanceText );
			distance += selectedScale;
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateElevTexts
	@desc this method creates the elevation texts in the svg element
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateElevTexts ( ) {

		const MAX_Y_LEGEND_NUMBER = 4;

		let minDelta = Number.MAX_VALUE;
		let selectedScale = ZERO;
		SVG_PROFILE.vScales.forEach (
			scale => {
				let currentDelta = Math.abs ( ( myDeltaElev / MAX_Y_LEGEND_NUMBER ) - scale );
				if ( currentDelta < minDelta ) {
					minDelta = currentDelta;
					selectedScale = scale;
				}
			}
		);
		let elev = Math.ceil ( myMinElev / selectedScale ) * selectedScale;
		const RIGHT_TEXT =
			(
				SVG_PROFILE.margin +
				SVG_PROFILE.width +
				SVG_PROFILE.xDeltaText
			).toFixed ( ZERO );
		const LEFT_TEXT = ( SVG_PROFILE.margin - SVG_PROFILE.xDeltaText ).toFixed ( ZERO );
		while ( elev < myMaxElev ) {
			let elevTextY = SVG_PROFILE.margin + ( ( myMaxElev - elev ) * myVScale );
			let rightElevText = document.createElementNS ( 'http://www.w3.org/2000/svg', 'text' );
			rightElevText.appendChild ( document.createTextNode ( elev.toFixed ( ZERO ) ) );
			rightElevText.setAttributeNS ( null, 'class', 'TravelNotes-SvgProfile-elevLegend' );
			rightElevText.setAttributeNS ( null, 'x', RIGHT_TEXT );
			rightElevText.setAttributeNS ( null, 'y', elevTextY );
			rightElevText.setAttributeNS ( null, 'text-anchor', 'start' );
			mySvg.appendChild ( rightElevText );
			let leftElevText = document.createElementNS ( 'http://www.w3.org/2000/svg', 'text' );
			leftElevText.appendChild ( document.createTextNode ( elev.toFixed ( ZERO ) ) );
			leftElevText.setAttributeNS ( null, 'class', 'TravelNotes-SvgProfile-elevLegend' );
			leftElevText.setAttributeNS ( null, 'x', LEFT_TEXT );
			leftElevText.setAttributeNS ( null, 'y', elevTextY );
			leftElevText.setAttributeNS ( null, 'text-anchor', 'end' );
			mySvg.appendChild ( leftElevText );
			elev += selectedScale;
		}

	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateSvgElement
	@desc this method creates the svg element
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateSvgElement ( ) {
		mySvg = document.createElementNS ( 'http://www.w3.org/2000/svg', 'svg' );
		mySvg.setAttributeNS (
			null,
			'viewBox',
			'0 0 ' + ( SVG_PROFILE.width + ( TWO * SVG_PROFILE.margin ) ) +
			' ' + ( SVG_PROFILE.height + ( TWO * SVG_PROFILE.margin ) )
		);
		mySvg.setAttributeNS ( null, 'class', 'TravelNotes-SvgProfile' );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateSvg
	@desc this method creates the svg with the Route profile. This svg is displayed in the profile window and in the roadbook
	@param {Route} route The route for witch the svg must be created
	@return the svg element with the profile
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateSvg ( route ) {

		// Doing some computations for min and max elev and scale...
		myRoute = route;
		myMinElev = Number.MAX_VALUE;
		myMaxElev = ZERO;
		myRoute.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				myMaxElev = Math.max ( myMaxElev, itineraryPoint.elev );
				myMinElev = Math.min ( myMinElev, itineraryPoint.elev );
			}
		);
		myDeltaElev = myMaxElev - myMinElev;
		myVScale = SVG_PROFILE.height / myDeltaElev;
		myHScale = SVG_PROFILE.width / myRoute.distance;

		// ... then creates the svg
		myCreateSvgElement ( );
		myCreateProfilePolyline ( );
		myCreateFramePolyline ( );
		myCreateElevTexts ( );
		myCreateDistanceTexts ( );

		return mySvg;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class
	@classdesc This class provides methods to build a Route profile
	@see {@link newProfileFactory} for constructor
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class ProfileFactory {

		/**
		This method smooth the Route elevation. Some elevations are not correct due to imprecisions in the elev files
		so it's needed to smooth these strange elevs
		@param {Route} route The Route to smooth
		*/

		smooth ( route ) { mySmooth ( route ); }

		/**
		this method creates the svg with the Route profile. This svg is displayed in the profile window and in the roadbook
		@param {Route} route The route for witch the svg must be created
		@return the svg element with the profile
		*/

		createSvg ( route ) { return myCreateSvg ( route ); }
	}

	return Object.seal ( new ProfileFactory );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newProfileFactory
	@desc constructor for ProfileFactory objects
	@return {ProfileFactory} an instance of ProfileFactory object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewProfileFactory as newProfileFactory
};

/*
--- End of ProfileFactory.js file ---------------------------------------------------------------------------------------------
*/