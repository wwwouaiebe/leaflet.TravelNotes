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
--- ProfileWindow.js file ---------------------------------------------------------------------------------------------
This file contains:
	- the newProfileWindow function
Changes:
	- v1.7.0:
		- created
	- v1.8.0:
		- Issue #99 : Add distance in the elevation window
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { newObjId } from '../data/ObjId.js';
import { newFloatWindow } from '../dialogs/FloatWindow.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newGeometry } from '../util/Geometry.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newUtilities } from '../util/Utilities.js';
import { theNoteEditor } from '../core/NoteEditor.js';
import { newProfileFactory } from '../core/ProfileFactory.js';

import { SVG_PROFILE, ZERO, ONE, TWO } from '../util/Constants.js';

/*
--- newProfileWindow function -----------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newProfileWindow ( ) {

	let myLatLngObjId = newObjId ( );

	let mySvg = null;
	let myMarker = null;
	let myElevText = null;
	let myAscentText = null;
	let myDistanceText = null;

	let myProfileWindow = null;

	let myAscentDiv = null;
	let myRoute = null;

	let myGeometry = newGeometry ( );
	let myEventDispatcher = newEventDispatcher ( );
	let myUtilities = newUtilities ( );

	/*
	--- myOnSvgClick function -----------------------------------------------------------------------------------------

	Event listener for the svg

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSvgClick ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		let clientRect = mySvg.getBoundingClientRect ( );
		let routeDist =
		(
			( mouseEvent.clientX - clientRect.x -
				(
					( SVG_PROFILE.margin /
					( ( TWO * SVG_PROFILE.margin ) + SVG_PROFILE.width ) ) * clientRect.width )
			) /
			(
				( SVG_PROFILE.width /
				( ( TWO * SVG_PROFILE.margin ) + SVG_PROFILE.width ) ) * clientRect.width )
		) * myRoute.distance;
		let latLngElevOnRoute = myGeometry.getLatLngElevAtDist ( myRoute, routeDist );
		if ( latLngElevOnRoute ) {
			myEventDispatcher.dispatch (
				'zoomto',
				{
					latLng : [ latLngElevOnRoute [ ZERO ], latLngElevOnRoute [ ONE ] ]
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
		mouseEvent.preventDefault ( );
		mouseEvent.stopPropagation ( );
		let clientRect = mySvg.getBoundingClientRect ( );
		let routeDist =
		(
			( mouseEvent.clientX - clientRect.x -
				(
					( SVG_PROFILE.margin /
						( ( TWO * SVG_PROFILE.margin ) + SVG_PROFILE.width )
					) * clientRect.width )
			) /
			(
				( SVG_PROFILE.width /
					( ( TWO * SVG_PROFILE.margin ) + SVG_PROFILE.width )
				) * clientRect.width )
		) * myRoute.distance;
		let latLngElevOnRoute = myGeometry.getLatLngElevAtDist ( myRoute, routeDist );
		if ( latLngElevOnRoute ) {
			theNoteEditor.newRouteNote (
				myRoute.objId,
				{
					latlng : {
						lat : latLngElevOnRoute [ ZERO ],
						lng : latLngElevOnRoute [ ONE ]
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
		mouseEvent.stopPropagation ( );
		let clientRect = mySvg.getBoundingClientRect ( );
		let routeDist =
		(
			( mouseEvent.clientX - clientRect.x -
				(
					( SVG_PROFILE.margin /
					( ( TWO * SVG_PROFILE.margin ) + SVG_PROFILE.width )
					) * clientRect.width )
			) /
			(
				( SVG_PROFILE.width /
				( ( TWO * SVG_PROFILE.margin ) + SVG_PROFILE.width )
				) * clientRect.width )
		) * myRoute.distance;
		let latLngElevOnRoute = myGeometry.getLatLngElevAtDist ( myRoute, routeDist );
		if ( latLngElevOnRoute ) {
			const THREE = 3;

			// itinerary point marker on the map
			myEventDispatcher.dispatch ( 'removeobject', { objId : myLatLngObjId } );
			myEventDispatcher.dispatch (
				'additinerarypointmarker',
				{
					objId : myLatLngObjId,
					latLng : [ latLngElevOnRoute [ ZERO ], latLngElevOnRoute [ ONE ] ]
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
				( ( TWO * SVG_PROFILE.margin ) + SVG_PROFILE.width ) *
				( mouseEvent.clientX - clientRect.x ) / clientRect.width;
			let markerY = SVG_PROFILE.margin + SVG_PROFILE.height;

			// line
			myMarker = document.createElementNS ( 'http://www.w3.org/2000/svg', 'polyline' );
			myMarker.setAttributeNS (
				null,
				'points',
				String ( markerX ) + ',' + SVG_PROFILE.margin + ' ' + markerX + ',' + markerY
			);
			myMarker.setAttributeNS ( null, 'class', 'TravelNotes-SvgProfile-markerPolyline' );
			mySvg.appendChild ( myMarker );

			// texts
			let textAnchor = routeDist > myRoute.distance / TWO ? 'end' : 'start';
			let deltaMarkerX =
				routeDist > myRoute.distance / TWO
					?
					-SVG_PROFILE.xDeltaText
					:
					SVG_PROFILE.xDeltaText;

			// distance
			myDistanceText = document.createElementNS ( 'http://www.w3.org/2000/svg', 'text' );
			myDistanceText.appendChild (
				document.createTextNode ( myUtilities.formatDistance ( routeDist ) )
			);
			myDistanceText.setAttributeNS ( null, 'class', 'TravelNotes-SvgProfile-elevText' );
			myDistanceText.setAttributeNS ( null, 'x', markerX + deltaMarkerX );
			myDistanceText.setAttributeNS ( null, 'y', SVG_PROFILE.margin + SVG_PROFILE.yDeltaText );
			myDistanceText.setAttributeNS ( null, 'text-anchor', textAnchor );
			mySvg.appendChild ( myDistanceText );

			// elevation
			myElevText = document.createElementNS ( 'http://www.w3.org/2000/svg', 'text' );
			myElevText.appendChild (
				document.createTextNode (
					'Alt. ' + latLngElevOnRoute [ TWO ].toFixed ( ZERO ) + ' m.'
				)
			);
			myElevText.setAttributeNS ( null, 'class', 'TravelNotes-SvgProfile-elevText' );
			myElevText.setAttributeNS ( null, 'x', markerX + deltaMarkerX );
			myElevText.setAttributeNS (
				null,
				'y',
				SVG_PROFILE.margin + ( SVG_PROFILE.yDeltaText * TWO )
			);
			myElevText.setAttributeNS ( null, 'text-anchor', textAnchor );
			mySvg.appendChild ( myElevText );

			// pente
			myAscentText = document.createElementNS ( 'http://www.w3.org/2000/svg', 'text' );
			myAscentText.appendChild (
				document.createTextNode (
					'Pente ' + latLngElevOnRoute [ THREE ].toFixed ( ZERO ) + ' % '
				)
			);
			myAscentText.setAttributeNS ( null, 'class', 'TravelNotes-SvgProfile-elevText' );
			myAscentText.setAttributeNS ( null, 'x', markerX + deltaMarkerX );
			myAscentText.setAttributeNS (
				null,
				'y',
				SVG_PROFILE.margin + ( SVG_PROFILE.yDeltaText * THREE )
			);
			myAscentText.setAttributeNS ( null, 'text-anchor', textAnchor );
			mySvg.appendChild ( myAscentText );
		}
	}

	/*
	--- myClean function ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myClean ( ) {
		if ( mySvg ) {
			mySvg.removeEventListener ( 'click', myOnSvgClick,	false );
			mySvg.removeEventListener ( 'contextmenu', myOnSvgContextMenu, false );
			mySvg.removeEventListener ( 'mousemove', myOnSvgMouseMove, false );
			myEventDispatcher.dispatch ( 'removeobject', { objId : myLatLngObjId } );

			myProfileWindow.content.removeChild ( myAscentDiv );
			myProfileWindow.content.removeChild ( mySvg );
		}

		mySvg = null;
		myMarker = null;
		myAscentText = null;
		myDistanceText = null;
		myElevText = null;
		myAscentDiv = null;
	}

	/*
	--- myOnClose function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnClose ( ) {
		myClean ( );
		myEventDispatcher.dispatch (
			'profileclosed',
			{
				objId : myRoute.objId
			}
		);

	}

	/*
	--- myUpdate function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myUpdate ( route ) {
		myClean ( );
		myRoute = route;
		mySvg = newProfileFactory ( ).createSvg ( route );

		myProfileWindow.header.innerHTML = theTranslator.getText ( 'ProfileWindow - Profile {name}', myRoute );
		myProfileWindow.content.appendChild ( mySvg );
		mySvg.addEventListener ( 'click', myOnSvgClick,	false );
		mySvg.addEventListener ( 'contextmenu', myOnSvgContextMenu, false );
		mySvg.addEventListener ( 'mousemove', myOnSvgMouseMove, false );

		myAscentDiv = newHTMLElementsFactory ( ).create (
			'div',
			{
				className : 'TravelNotes-ProfileWindow-Ascent',
				innerHTML : theTranslator.getText (
					'ProfileWindow - Ascent: {ascent} m. - Descent: {descent} m. - Distance: {distance}',
					{
						ascent : myRoute.itinerary.ascent.toFixed ( ZERO ),
						descent : myRoute.itinerary.descent.toFixed ( ZERO ),
						distance : myUtilities.formatDistance ( myRoute.distance )
					}
				)
			}
		);
		myProfileWindow.content.appendChild ( myAscentDiv );

	}

	/*
	--- main function -------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	myProfileWindow = newFloatWindow ( );
	myProfileWindow.createWindow ( );
	myProfileWindow.onClose = myOnClose;

	myProfileWindow.update = myUpdate;

	return Object.seal ( myProfileWindow );
}

export { newProfileWindow };

/*
--- End of ProfileWindow.js file --------------------------------------------------------------------------------------
*/