/*
Copyright - 2020 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- ProfileFactory.js file --------------------------------------------------------------------------------------------
This file contains:
	- the newProfileFactory function
Changes:
	- v1.7.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theConfig } from '../data/Config.js';

import { THE_CONST } from '../util/Constants.js';

/*
--- newProfileFactory function ----------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newProfileFactory ( ) {

	let mySvg = null;
	let myVScale = THE_CONST.number1;
	let myHScale = THE_CONST.number1;

	let myMinElev = Number.MAX_VALUE;
	let myMaxElev = THE_CONST.zero;
	let myDeltaElev = THE_CONST.zero;

	let myRoute = null;

	let mySmoothDistance = THE_CONST.zero;
	let mySmoothCoefficient = theConfig.route.elev.smoothCoefficient;
	let mySmoothPoints = theConfig.route.elev.smoothPoints;

	/*
	--- createTmpPoints function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function createTmpPoints ( ) {

		console.log ( 'myRoute.object' );
		console.log ( myRoute.object );

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

		console.log ( 'tmpPoints' );
		console.log ( tmpPoints );

		return tmpPoints;
	}

	/*
	--- createSmoothPoints function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function createSmoothPoints ( ) {
		let tmpPoints = createTmpPoints ( );
		let smoothPoints = new Map;

		let deltaElev = ( tmpPoints [ mySmoothPoints ].elev - tmpPoints [ THE_CONST.zero ].elev ) / mySmoothPoints;

		let pointCounter = THE_CONST.zero;

		// Computing the first elevs
		for ( pointCounter = THE_CONST.zero; pointCounter < mySmoothPoints; pointCounter ++ ) {
			smoothPoints.set (
				pointCounter * mySmoothDistance,
				{
					distance : pointCounter * mySmoothDistance,
					elev : tmpPoints [ THE_CONST.zero ].elev + ( deltaElev * pointCounter )
				}
			);
		}

		// Computing next elevs
		for ( pointCounter = mySmoothPoints; pointCounter < tmpPoints.length - mySmoothPoints; pointCounter ++ ) {
			let elevSum = THE_CONST.zero;
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
					elev : elevSum / ( ( mySmoothPoints * THE_CONST.number2 ) + THE_CONST.number1 )
				}
			);
		}

		pointCounter --;

		deltaElev = mySmoothDistance * (
			tmpPoints [ tmpPoints.length - THE_CONST.number1 ].elev -
				tmpPoints [ tmpPoints.length - THE_CONST.number1 - mySmoothPoints ].elev
		) /
			(
				tmpPoints [ tmpPoints.length - THE_CONST.number1 ].distance -
				tmpPoints [ tmpPoints.length - THE_CONST.number1 - mySmoothPoints ].distance
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
			tmpPoints [ pointCounter ].distance + ( mySmoothDistance * THE_CONST.number2 ),
			{
				distance : tmpPoints [ pointCounter ].distance + ( mySmoothDistance * THE_CONST.number2 ),
				elev : tmpPoints [ pointCounter ].elev + ( deltaElev * THE_CONST.number2 )
			}
		);

		console.log ( 'smoothPoints' );
		console.log ( smoothPoints );

		return smoothPoints;
	}

	/*
	--- mySmooth function --------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySmooth ( route ) {

		myRoute = route;
		let itineraryPointsIterator = myRoute.itinerary.itineraryPoints.iterator;
		let distance = THE_CONST.zero;
		let elev = THE_CONST.zero;
		while ( ! itineraryPointsIterator.done ) {
			distance += itineraryPointsIterator.value.distance;
			elev +=
				itineraryPointsIterator.next
					?
					Math.abs ( itineraryPointsIterator.value.elev - itineraryPointsIterator.next.elev )
					:
					THE_CONST.zero;

		}

		mySmoothDistance = Math.floor ( mySmoothCoefficient / ( elev / distance ) ) * THE_CONST.number10;

		console.log ( 'mySmoothDistance' );
		console.log ( mySmoothDistance );

		let smoothPoints = createSmoothPoints ( );

		itineraryPointsIterator = myRoute.itinerary.itineraryPoints.iterator;

		// we skip the first itinerary point
		itineraryPointsIterator.done;
		let itineraryPointsTotalDistance = itineraryPointsIterator.value.distance;

		// loop on the itinerary point to push the corrected elev
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

	/*
	--- myCreateProfilePolyline function ------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateProfilePolyline ( ) {
		let pointsAttribute = '';
		let distance = THE_CONST.zero;
		let xPolyline = THE_CONST.zero;
		let yPolyline = THE_CONST.zero;
		myRoute.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				xPolyline = ( THE_CONST.svgProfile.margin + ( myHScale * distance ) ).toFixed ( THE_CONST.zero );
				yPolyline =
					(
						THE_CONST.svgProfile.margin +
						( myVScale * ( myMaxElev - itineraryPoint.elev ) )
					)
						.toFixed ( THE_CONST.zero );
				pointsAttribute += xPolyline + ',' + yPolyline + ' ';
				distance += itineraryPoint.distance;
			}
		);
		let polyline = document.createElementNS ( 'http://www.w3.org/2000/svg', 'polyline' );
		polyline.setAttributeNS ( null, 'points', pointsAttribute );
		polyline.setAttributeNS ( null, 'class', 'TravelNotes-SvgProfile-profilePolyline' );
		mySvg.appendChild ( polyline );
	}

	/*
	--- myCreateFramePolylines function -------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	/*
	function myCreateFramePolylines ( ) {
		let yPolyline =
			( THE_CONST.svgProfile.margin + ( THE_CONST.svgProfile.height / THE_CONST.number2 ) ).toFixed ( THE_CONST.zero );
		let pointsAttribute = THE_CONST.svgProfile.margin.toFixed ( THE_CONST.zero ) + ',' +
		yPolyline + ' ' +
		( THE_CONST.svgProfile.margin + THE_CONST.svgProfile.width ).toFixed ( THE_CONST.zero ) + ' ' +
		yPolyline;
		let polyline = document.createElementNS ( 'http://www.w3.org/2000/svg', 'polyline' );
		polyline.setAttributeNS ( null, 'points', pointsAttribute );
		polyline.setAttributeNS ( null, 'class', 'TravelNotes-SvgProfile-framePolyline' );
		mySvg.appendChild ( polyline );
	}
	*/

	/*
	--- myCreateSvg function ------------------------------------------------------------------------------------------

	This function creates the SVG

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateSvg ( route ) {
		myRoute = route;

		let previousElev = myRoute.itinerary.itineraryPoints.first.elev;
		myMinElev = Number.MAX_VALUE;
		myMaxElev = THE_CONST.zero;
		myRoute.itinerary.ascent = THE_CONST.zero;
		myRoute.itinerary.descent = THE_CONST.zero;
		myRoute.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				myMaxElev = Math.max ( myMaxElev, itineraryPoint.elev );
				myMinElev = Math.min ( myMinElev, itineraryPoint.elev );
				let deltaElev = itineraryPoint.elev - previousElev;
				if ( THE_CONST.zero > deltaElev ) {
					myRoute.itinerary.descent -= deltaElev;
				}
				else {
					myRoute.itinerary.ascent += deltaElev;
				}
				previousElev = itineraryPoint.elev;
			}
		);
		myDeltaElev = myMaxElev - myMinElev;
		myVScale = THE_CONST.svgProfile.height / myDeltaElev;
		myHScale = THE_CONST.svgProfile.width / myRoute.distance;

		mySvg = document.createElementNS ( 'http://www.w3.org/2000/svg', 'svg' );
		mySvg.setAttributeNS (
			null,
			'viewBox',
			'0 0 ' + ( THE_CONST.svgProfile.width + ( THE_CONST.number2 * THE_CONST.svgProfile.margin ) ) +
			' ' + ( THE_CONST.svgProfile.height + ( THE_CONST.number2 * THE_CONST.svgProfile.margin ) )
		);
		mySvg.setAttributeNS ( null, 'class', 'TravelNotes-SvgProfile' );

		myCreateProfilePolyline ( );

		return mySvg;
	}

	/*
	--- ProfileFactory object function --------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			smooth : route => mySmooth ( route ),
			createSvg : route => myCreateSvg ( route )
		}
	);
}

export { newProfileFactory };

/*
--- End of ProfileFactory.js file -------------------------------------------------------------------------------------
*/