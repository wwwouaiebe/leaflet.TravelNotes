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
--- ProfileWindow.js file ---------------------------------------------------------------------------------------------
This file contains:
	- the newProfileWindow function
Changes:
	- v1.7.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { newFloatWindow } from '../dialogs/FloatWindow.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newGeometry } from '../util/Geometry.js';
import { newObjId } from '../data/ObjId.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { theNoteEditor } from '../core/NoteEditor.js';
import { newUtilities } from '../util/Utilities.js';

import { THE_CONST } from '../util/Constants.js';

/*
--- newProfileWindow function -----------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newProfileWindow ( ) {

	let myProfileWindow = null;
	let mySvg = null;

	let myRoute = null;
	let myMinElev = 0;
	let myMaxElev = 0;
	let myVScale = 1;
	let myHScale = 1;
	let myAscentScale = 1;
	let myDeltaElev = 0;

	let myAscent = 0;
	let myDescent = 0;

	const SVG_MARGIN = 50;
	const SVG_HEIGHT = 500;
	const SVG_WIDTH = 1000;
	const SVG_V_DELTA_TEXT = 30;
	const SVG_H_DELTA_TEXT = 10;

	let myGeometry = newGeometry ( );
	let myEventDispatcher = newEventDispatcher ( );
	let myUtilities = newUtilities ( );

	let myLatLngObjId = newObjId ( );
	let myMarker = null;
	let myElevText = null;
	let myAscentText = null;
	let myDistanceText = null;

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
	--- myCreateSvgProfile function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateProfile ( ) {
		myCreateSvg ( );
		myCreateProfilePolyline ( );
		myCreateAscentPolyline ( );
	}

	/*
	--- myOnClose function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnClose ( ) {
		myEventDispatcher.dispatch ( 'removeobject', { objId : myLatLngObjId } );
	}

	/*
	--- myOnShow function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnShow ( ) {
		myRoute =	newDataSearchEngine ( ).getRoute ( myProfileWindow.data );
		if ( ! myRoute ) {
			return;
		}
		myMaxElev = THE_CONST.zero;
		myMinElev = Number.MAX_VALUE;
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

		myProfileWindow.header.innerHTML = theTranslator.getText ( 'ProfileWindow - Profile' );
		myCreateProfile ( );
		myProfileWindow.content.appendChild ( mySvg );
		let ascentDiv = newHTMLElementsFactory ( ).create (
			'div',
			{
				className : 'TravelNotes-ProfileWindow-Ascent'
			}
		);
		ascentDiv.innerHTML = theTranslator.getText (
			'ProfileWindow - Ascent: {ascent} m. - Descent: {descend} m.',
			{ ascent : myAscent.toFixed ( THE_CONST.zero ), descend : myDescent.toFixed ( THE_CONST.zero ) }
		);
		myProfileWindow.content.appendChild ( ascentDiv );
	}

	/*
	--- myCreateWindow function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateWindow ( ) {
		myProfileWindow = newFloatWindow ( );
		myProfileWindow.onShow = myOnShow;
		myProfileWindow.onClose = myOnClose;
	}

	/*
	--- main function -------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	myCreateWindow ( );

	return myProfileWindow;
}

export { newProfileWindow };

/*
--- End of ProfileWindow.js file --------------------------------------------------------------------------------------
*/