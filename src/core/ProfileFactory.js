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

import { newGeometry } from '../util/Geometry.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { theNoteEditor } from '../core/NoteEditor.js';
import { newUtilities } from '../util/Utilities.js';
import { newObjId } from '../data/ObjId.js';

import { THE_CONST } from '../util/Constants.js';

/*
--- newProfileFactory function ----------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newProfileFactory ( ) {

	let mySvg = null;

	let myMarker = null;
	let myElevText = null;
	let myAscentText = null;
	let myDistanceText = null;

	let myLatLngObjId = newObjId ( );

	let myRoute = null;

	let myMinElev = THE_CONST.zero;
	let myMaxElev = THE_CONST.zero;
	let myVScale = THE_CONST.number1;
	let myHScale = THE_CONST.number1;
	let myDeltaElev = THE_CONST.zero;

	let myAscent = THE_CONST.zero;
	let myDescent = THE_CONST.zero;
	let myAscentScale = THE_CONST.number1;

	let myGeometry = newGeometry ( );
	let myEventDispatcher = newEventDispatcher ( );
	let myUtilities = newUtilities ( );

	const SVG_MARGIN = 50;
	const SVG_HEIGHT = 500;
	const SVG_WIDTH = 1000;
	const SVG_V_DELTA_TEXT = 30;
	const SVG_H_DELTA_TEXT = 10;

	const DIST_BTW_POINTS = 50;
	const ADDED_TMP_POINTS = 3;

	/*
	--- myOnSvgClick function -----------------------------------------------------------------------------------------

	Event listener for the svg

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSvgClick ( mouseEvent ) {
		let clientRect = mySvg.getBoundingClientRect ( );
		let routeDist =
		(
			( mouseEvent.clientX - clientRect.x -
				( ( SVG_MARGIN / ( ( THE_CONST.number2 * SVG_MARGIN ) + SVG_WIDTH ) ) * clientRect.width )
			) /
			( ( SVG_WIDTH / ( ( THE_CONST.number2 * SVG_MARGIN ) + SVG_WIDTH ) ) * clientRect.width )
		) * myRoute.distance;
		let latLngElevOnRoute = myGeometry.getLatLngElevAtDist ( myRoute, routeDist );
		if ( latLngElevOnRoute ) {
			myEventDispatcher.dispatch (
				'zoomto',
				{
					latLng : [ latLngElevOnRoute [ THE_CONST.zero ], latLngElevOnRoute [ THE_CONST.number1 ] ]
				}
			);
		}
	}

	/*
	--- myOnSvgContextMenu function -----------------------------------------------------------------------------------

	Event listener for the svg

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSvgContextMenu ( mouseEvent ) {
		let clientRect = mySvg.getBoundingClientRect ( );
		let routeDist =
		(
			( mouseEvent.clientX - clientRect.x -
				( ( SVG_MARGIN / ( ( THE_CONST.number2 * SVG_MARGIN ) + SVG_WIDTH ) ) * clientRect.width )
			) /
			( ( SVG_WIDTH / ( ( THE_CONST.number2 * SVG_MARGIN ) + SVG_WIDTH ) ) * clientRect.width )
		) * myRoute.distance;
		let latLngElevOnRoute = myGeometry.getLatLngElevAtDist ( myRoute, routeDist );
		if ( latLngElevOnRoute ) {
			theNoteEditor.newRouteNote (
				myRoute.objId,
				{
					latlng : {
						lat : latLngElevOnRoute [ THE_CONST.zero ],
						lng : latLngElevOnRoute [ THE_CONST.number1 ]
					}
				}
			);
		}
	}

	/*
	--- myOnSvgMouseMove function -------------------------------------------------------------------------------------

	Event listener for the svg

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSvgMouseMove ( mouseEvent ) {
		let clientRect = mySvg.getBoundingClientRect ( );
		let routeDist =
		(
			( mouseEvent.clientX - clientRect.x -
				( ( SVG_MARGIN / ( ( THE_CONST.number2 * SVG_MARGIN ) + SVG_WIDTH ) ) * clientRect.width )
			) /
			( ( SVG_WIDTH / ( ( THE_CONST.number2 * SVG_MARGIN ) + SVG_WIDTH ) ) * clientRect.width )
		) * myRoute.distance;
		let latLngElevOnRoute = myGeometry.getLatLngElevAtDist ( myRoute, routeDist );
		if ( latLngElevOnRoute ) {

			// itinerary point marker on the map
			myEventDispatcher.dispatch ( 'removeobject', { objId : myLatLngObjId } );
			myEventDispatcher.dispatch (
				'additinerarypointmarker',
				{
					objId : myLatLngObjId,
					latLng : [ latLngElevOnRoute [ THE_CONST.zero ], latLngElevOnRoute [ THE_CONST.number1 ] ]
				}
			);

			// Line and text on svg
			if ( myMarker ) {
				mySvg.removeChild ( myMarker );
				mySvg.removeChild ( myDistanceText );
				mySvg.removeChild ( myElevText );
				mySvg.removeChild ( myAscentText );
			}
			let markerX =
				( ( THE_CONST.number2 * SVG_MARGIN ) + SVG_WIDTH ) *
				( mouseEvent.clientX - clientRect.x ) / clientRect.width;
			let markerY = SVG_MARGIN + SVG_HEIGHT;

			// line
			myMarker = document.createElementNS ( 'http://www.w3.org/2000/svg', 'polyline' );
			myMarker.setAttributeNS (
				null,
				'points',
				String ( markerX ) + ',' + SVG_MARGIN + ' ' + markerX + ',' + markerY
			);
			myMarker.setAttributeNS ( null, 'class', 'TravelNotes-SvgProfile-markerPolyline' );
			mySvg.appendChild ( myMarker );

			// texts
			let textAnchor = routeDist > myRoute.distance / THE_CONST.number2 ? 'end' : 'start';
			let deltaMarkerX = routeDist > myRoute.distance / THE_CONST.number2 ? -SVG_H_DELTA_TEXT : SVG_H_DELTA_TEXT;

			// distance
			myDistanceText = document.createElementNS ( 'http://www.w3.org/2000/svg', 'text' );
			myDistanceText.appendChild (
				document.createTextNode ( myUtilities.formatDistance ( routeDist ) )
			);
			myDistanceText.setAttributeNS ( null, 'class', 'TravelNotes-SvgProfile-elevText' );
			myDistanceText.setAttributeNS ( null, 'x', markerX + deltaMarkerX );
			myDistanceText.setAttributeNS ( null, 'y', SVG_MARGIN + SVG_V_DELTA_TEXT );
			myDistanceText.setAttributeNS ( null, 'text-anchor', textAnchor );
			mySvg.appendChild ( myDistanceText );

			// elevation
			myElevText = document.createElementNS ( 'http://www.w3.org/2000/svg', 'text' );
			myElevText.appendChild (
				document.createTextNode (
					'Alt. ' + latLngElevOnRoute [ THE_CONST.number2 ].toFixed ( THE_CONST.zero ) + ' m.'
				)
			);
			myElevText.setAttributeNS ( null, 'class', 'TravelNotes-SvgProfile-elevText' );
			myElevText.setAttributeNS ( null, 'x', markerX + deltaMarkerX );
			myElevText.setAttributeNS ( null, 'y', SVG_MARGIN + ( SVG_V_DELTA_TEXT * THE_CONST.number2 ) );
			myElevText.setAttributeNS ( null, 'text-anchor', textAnchor );
			mySvg.appendChild ( myElevText );

			// pente
			myAscentText = document.createElementNS ( 'http://www.w3.org/2000/svg', 'text' );
			myAscentText.appendChild (
				document.createTextNode (
					'Pente ' + latLngElevOnRoute [ THE_CONST.number3 ].toFixed ( THE_CONST.zero ) + ' % '
				)
			);
			myAscentText.setAttributeNS ( null, 'class', 'TravelNotes-SvgProfile-elevText' );
			myAscentText.setAttributeNS ( null, 'x', markerX + deltaMarkerX );
			myAscentText.setAttributeNS ( null, 'y', SVG_MARGIN + ( SVG_V_DELTA_TEXT * THE_CONST.number3 ) );
			myAscentText.setAttributeNS ( null, 'text-anchor', textAnchor );
			mySvg.appendChild ( myAscentText );
		}
	}

	/*
	--- myCreateSvg function ------------------------------------------------------------------------------------------

	This function creates the SVG

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateSvg ( ) {
		mySvg = document.createElementNS ( 'http://www.w3.org/2000/svg', 'svg' );
		mySvg.setAttributeNS (
			null,
			'viewBox',
			'0 0 ' + ( SVG_WIDTH + ( THE_CONST.number2 * SVG_MARGIN ) ) +
			' ' + ( SVG_HEIGHT + ( THE_CONST.number2 * SVG_MARGIN ) )
		);
		mySvg.setAttributeNS ( null, 'class', 'TravelNotes-SvgProfile' );

		mySvg.addEventListener ( 'click', myOnSvgClick,	false );
		mySvg.addEventListener ( 'contextmenu', myOnSvgContextMenu, false );
		mySvg.addEventListener ( 'mousemove', myOnSvgMouseMove, false );
	}

	/*
	--- myCreateProfilePolyline function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateProfilePolyline ( ) {
		let pointsAttribute = '';
		let distance = THE_CONST.zero;
		let xPolyline = THE_CONST.zero;
		let yPolyline = THE_CONST.zero;
		myRoute.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				xPolyline = ( SVG_MARGIN + ( myHScale * distance ) ).toFixed ( THE_CONST.zero );
				yPolyline = ( SVG_MARGIN + ( myVScale * ( myMaxElev - itineraryPoint.elev ) ) ).toFixed ( THE_CONST.zero );
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
	--- myCreateAscentPolyline function -------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateAscentPolyline ( ) {
		let pointsAttribute = '';
		let distance = THE_CONST.zero;
		let ascent = THE_CONST.zero;
		let previousElev = myRoute.itinerary.itineraryPoints.first.elev;
		let xPolyline = THE_CONST.zero;
		let yPolyline = THE_CONST.zero;
		myAscentScale = SVG_HEIGHT / myAscent;
		myRoute.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				let deltaAscent = itineraryPoint.elev - previousElev;
				if ( THE_CONST.zero < deltaAscent ) {
					ascent += deltaAscent;
				}
				xPolyline = ( SVG_MARGIN + ( myHScale * distance ) ).toFixed ( THE_CONST.zero );
				yPolyline = ( SVG_MARGIN + SVG_HEIGHT - ( myAscentScale * ascent ) ).toFixed ( THE_CONST.zero );
				pointsAttribute += xPolyline + ',' + yPolyline + ' ';
				distance += itineraryPoint.distance;
				previousElev = itineraryPoint.elev;
			}
		);
		let polyline = document.createElementNS ( 'http://www.w3.org/2000/svg', 'polyline' );
		polyline.setAttributeNS ( null, 'points', pointsAttribute );
		polyline.setAttributeNS ( null, 'class', 'TravelNotes-SvgProfile-ascentPolyline' );
		mySvg.appendChild ( polyline );
	}

	/*
	--- createTmpPoints function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function createTmpPoints ( ) {
		let tmpPointsDistance = 0;
		let tmpPointElev = 0;
		let tmpPoints = [];
		let itineraryPointsIterator = myRoute.itinerary.itineraryPoints.iterator;

		// go to the first itinerary point
		let done = itineraryPointsIterator.done;
		let previousItineraryPoint = itineraryPointsIterator.value;
		let previousItineraryPointTotalDistance = 0;
		let currentItineraryPointTotalDistance = itineraryPointsIterator.value.distance;

		// go to the second itinerary point
		done = itineraryPointsIterator.done;

		// adding  some (depending of ADDED_TMP_POINTS) points at the beginning of tmpPoints
		let ascentFactor = ( itineraryPointsIterator.value.elev - previousItineraryPoint.elev ) /
			previousItineraryPoint.distance;
		for ( let pointCounter = ADDED_TMP_POINTS; pointCounter > THE_CONST.zero; pointCounter -- ) {
			tmpPoints.push (
				{
					distance : -( DIST_BTW_POINTS * pointCounter ),
					elev : previousItineraryPoint.elev -
						( DIST_BTW_POINTS * pointCounter * ascentFactor )
				}
			);
		}

		// adding the first itinerary point to the tmpPoints
		tmpPoints.push ( { distance : tmpPointsDistance, elev : previousItineraryPoint.elev } );

		// loop on next itinerary points
		while ( ! done ) {
			tmpPointsDistance += DIST_BTW_POINTS;

			// loop on the itinerary points till we pass the itinerary point distance
			while ( tmpPointsDistance >= currentItineraryPointTotalDistance && ! done ) {
				previousItineraryPointTotalDistance += previousItineraryPoint.distance;
				previousItineraryPoint = itineraryPointsIterator.value;
				currentItineraryPointTotalDistance += itineraryPointsIterator.value.distance;
				done = itineraryPointsIterator.done;
			}
			if ( ! done ) {

				// adding tmpPoint
				ascentFactor = ( itineraryPointsIterator.value.elev - previousItineraryPoint.elev ) /
					previousItineraryPoint.distance;
				tmpPointElev =
					previousItineraryPoint.elev +
					( ( tmpPointsDistance - previousItineraryPointTotalDistance ) * ascentFactor );
				tmpPoints.push ( { distance : tmpPointsDistance, elev : tmpPointElev } );
			}
		}

		// adding  some (depending of ADDED_TMP_POINTS) points at the end of tmpPoints
		for ( let pointCounter = THE_CONST.zero; pointCounter < ADDED_TMP_POINTS; pointCounter ++ ) {
			tmpPointElev += DIST_BTW_POINTS * ascentFactor;
			tmpPoints.push ( { distance : tmpPointsDistance, elev : tmpPointElev } );
			tmpPointsDistance += DIST_BTW_POINTS;
		}

		console.log ( 'tmpPoints' );
		console.log ( tmpPoints );

		return tmpPoints;
	}

	/*
	--- createIronPoints function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function createIronPoints ( ) {
		let tmpPoints = createTmpPoints ( );
		let ironPoints = new Map;
		let elevSum = THE_CONST.zero;

		// Computing the first elev
		for ( let pointCounter = THE_CONST.zero; pointCounter <= ADDED_TMP_POINTS * THE_CONST.number2; pointCounter ++ ) {
			elevSum += tmpPoints [ pointCounter ].elev;
		}

		// Computing next elevs
		for ( let pointCounter = ADDED_TMP_POINTS; pointCounter < tmpPoints.length - ADDED_TMP_POINTS; pointCounter ++ ) {

			elevSum = 0;
			for ( let pointNumber = pointCounter - 3; pointCounter + 3 >= pointNumber; pointNumber ++ ) {
				elevSum += tmpPoints [ pointNumber ].elev;
			}
			ironPoints.set (
				tmpPoints [ pointCounter ].distance,
				{
					distance : tmpPoints [ pointCounter ].distance,
					elev : elevSum / ( ( ADDED_TMP_POINTS * THE_CONST.number2 ) + THE_CONST.number1 )
				}
			);
		}

		console.log ( 'ironPoints' );
		console.log ( ironPoints );

		return ironPoints;
	}

	/*
	--- aaa function --------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function aaa ( ) {

		let ironPoints = createIronPoints ( );

		let itineraryPointsIterator = myRoute.itinerary.itineraryPoints.iterator;

		// we skip the first itinerary point
		itineraryPointsIterator.done;
		let itineraryPointsTotalDistance = itineraryPointsIterator.value.distance;

		// loop on the itinerary point to push the corrected elev
		while ( ! itineraryPointsIterator.done ) {
			let previousIronPoint = ironPoints.get (
				Math.floor ( itineraryPointsTotalDistance / DIST_BTW_POINTS ) * DIST_BTW_POINTS );
			let nextIronPoint = ironPoints.get (
				Math.ceil ( itineraryPointsTotalDistance / DIST_BTW_POINTS ) * DIST_BTW_POINTS );
			if ( previousIronPoint && nextIronPoint ) {
				let deltaDist = itineraryPointsTotalDistance - previousIronPoint.distance;
				let ascentFactor = ( nextIronPoint.elev - previousIronPoint.elev ) /
					( nextIronPoint.distance - previousIronPoint.distance );

				// console.log ( itineraryPointsIterator.value.elev );
				itineraryPointsIterator.value.elev = previousIronPoint.elev + ( deltaDist * ascentFactor );

				// console.log ( itineraryPointsIterator.value.elev );
				// console.log ( '---' );
			}
			itineraryPointsTotalDistance += itineraryPointsIterator.value.distance;
		}
	}

	/*
	--- myClean function ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myClean ( ) {
		mySvg.removeEventListener ( 'click', myOnSvgClick,	false );
		mySvg.removeEventListener ( 'contextmenu', myOnSvgContextMenu, false );
		mySvg.removeEventListener ( 'mousemove', myOnSvgMouseMove, false );
		myEventDispatcher.dispatch ( 'removeobject', { objId : myLatLngObjId } );
	}

	/*
	--- myCreateSvgProfile function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateProfile ( routeObjId ) {
		myRoute = newDataSearchEngine ( ).getRoute ( routeObjId );

		myMaxElev = THE_CONST.zero;
		myMinElev = Number.MAX_VALUE;
		myVScale = THE_CONST.number1;
		myHScale = THE_CONST.number1;
		myAscentScale = THE_CONST.number1;
		myDeltaElev = THE_CONST.zero;

		myAscent = THE_CONST.zero;
		myDescent = THE_CONST.zero;

		myMarker = null;
		myElevText = null;
		myAscentText = null;
		myDistanceText = null;

		if ( mySvg ) {
			myClean ( );
		}
		aaa ( );

		let previousElev = myRoute.itinerary.itineraryPoints.first.elev;
		myRoute.itinerary.itineraryPoints.forEach (
			itineraryPoint => {
				myMaxElev = Math.max ( myMaxElev, itineraryPoint.elev );
				myMinElev = Math.min ( myMinElev, itineraryPoint.elev );
				let deltaElev = itineraryPoint.elev - previousElev;
				if ( THE_CONST.zero > deltaElev ) {
					myDescent -= deltaElev;
				}
				else {
					myAscent += deltaElev;
				}
				previousElev = itineraryPoint.elev;
			}
		);
		myDeltaElev = myMaxElev - myMinElev;
		myVScale = SVG_HEIGHT / myDeltaElev;
		myHScale = SVG_WIDTH / myRoute.distance;
		myCreateSvg ( );
		myCreateProfilePolyline ( );
		myCreateAscentPolyline ( );
	}

	/*
	--- ProfileFactory object function --------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			createProfile : routeObjId => myCreateProfile ( routeObjId ),
			get svg ( ) { return mySvg; },
			get ascent ( ) { return myAscent.toFixed ( THE_CONST.zero ); },
			get descent ( ) { return myDescent.toFixed ( THE_CONST.zero ); },
			clean : ( ) => myClean ( )
		}
	);
}

export { newProfileFactory };

/*
--- End of ProfileFactory.js file -------------------------------------------------------------------------------------
*/