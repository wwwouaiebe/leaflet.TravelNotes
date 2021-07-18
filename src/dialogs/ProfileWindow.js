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
Changes:
	- v1.7.0:
		- created
	- v1.8.0:
		- Issue ♯99 : Add distance in the elevation window
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
Doc reviewed 20200816
Tests ...
*/

import { theTranslator } from '../UI/Translator.js';
import ObjId from '../data/ObjId.js';
import { newFloatWindow } from '../dialogs/FloatWindow.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theGeometry } from '../util/Geometry.js';
import { theEventDispatcher } from '../util/EventDispatcher.js';
import { theUtilities } from '../util/Utilities.js';
import { newProfileContextMenu } from '../contextMenus/ProfileContextMenu.js';
import ProfileFactory from '../core/ProfileFactory.js';
import { SVG_NS, SVG_PROFILE, ZERO, ONE, TWO, THREE } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@file ProfileWindow.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module ProfileWindow
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewProfileWindow
@desc constructor for ProfileWindow objects
@return {ProfileWindow} an instance of ProfileWindow object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewProfileWindow ( ) {

	let myLatLngObjId = ObjId.nextObjId;

	let mySvg = null;
	let myMarker = null;
	let myElevText = null;
	let myAscentText = null;
	let myDistanceText = null;
	let myProfileWindow = null;
	let myAscentDiv = null;
	let myRoute = null;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myGetlatLngElevOnRouteAtMousePosition
	@desc This function gives the latitude, longitude and elevation of a route, depending of the mouse position
	on the svg profile
	@param {Event} mouseEvent The mouse event coming from the event listener that call this function
	@return {LatLngElevOnRoute} An Object with the LatLng, elevation, ascent and distance of the mouse event on the route
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myGetlatLngElevOnRouteAtMousePosition ( mouseEvent ) {
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
		return theGeometry.getLatLngElevAtDist ( myRoute, routeDist );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnSvgContextMenu
	@desc mouse contextmenu on the profile svg event listener. Show a context menu
	@listens contextmenu
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSvgContextMenu ( contextMenuEvent ) {
		contextMenuEvent.preventDefault ( );
		contextMenuEvent.stopPropagation ( );
		let latLngElevOnRoute = myGetlatLngElevOnRouteAtMousePosition ( contextMenuEvent );
		if ( latLngElevOnRoute ) {
			contextMenuEvent.routeObjId = myRoute.objId;

			// creating a fake leaflet contextmenuEvent...
			contextMenuEvent.latlng = {
				lat : latLngElevOnRoute.latLng [ ZERO ],
				lng : latLngElevOnRoute.latLng [ ONE ]
			};
			contextMenuEvent.originalEvent = {
				clientX : contextMenuEvent.clientX,
				clientY : contextMenuEvent.clientY
			};
			newProfileContextMenu ( contextMenuEvent ).show ( );
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnSvgMouseLeave
	@desc mouse leave on the profile svg event listener. Remove the marker on the map
	@listens mouseleave
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSvgMouseLeave ( ) {
		theEventDispatcher.dispatch ( 'removeobject', { objId : myLatLngObjId } );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnSvgMouseMove
	@desc mouse move on the profile svg event listener. Display a text with the distance, elevation and ascent at
	the given position. Show also a marker on the map
	@listens mousemove
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSvgMouseMove ( mouseEvent ) {
		let clientRect = mySvg.getBoundingClientRect ( );
		let latLngElevOnRoute = myGetlatLngElevOnRouteAtMousePosition ( mouseEvent );
		if ( latLngElevOnRoute ) {

			// itinerary point marker on the map
			theEventDispatcher.dispatch ( 'removeobject', { objId : myLatLngObjId } );
			theEventDispatcher.dispatch (
				'additinerarypointmarker',
				{
					objId : myLatLngObjId,
					latLng : latLngElevOnRoute.latLng
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
			myMarker = document.createElementNS ( SVG_NS, 'polyline' );
			myMarker.setAttributeNS (
				null,
				'points',
				String ( markerX ) + ',' + SVG_PROFILE.margin + ' ' + markerX + ',' + markerY
			);
			myMarker.setAttributeNS ( null, 'class', 'TravelNotes-Route-SvgProfile-markerPolyline' );
			mySvg.appendChild ( myMarker );

			// texts
			let textAnchor = latLngElevOnRoute.routeDistance > myRoute.distance / TWO ? 'end' : 'start';
			let deltaMarkerX =
				latLngElevOnRoute.routeDistance > myRoute.distance / TWO
					?
					-SVG_PROFILE.xDeltaText
					:
					SVG_PROFILE.xDeltaText;

			// distance
			myDistanceText = document.createElementNS ( SVG_NS, 'text' );
			myDistanceText.appendChild (
				document.createTextNode ( theUtilities.formatDistance ( latLngElevOnRoute.routeDistance ) )
			);
			myDistanceText.setAttributeNS ( null, 'class', 'TravelNotes-Route-SvgProfile-elevText' );
			myDistanceText.setAttributeNS ( null, 'x', markerX + deltaMarkerX );
			myDistanceText.setAttributeNS ( null, 'y', SVG_PROFILE.margin + SVG_PROFILE.yDeltaText );
			myDistanceText.setAttributeNS ( null, 'text-anchor', textAnchor );
			mySvg.appendChild ( myDistanceText );

			// elevation
			myElevText = document.createElementNS ( SVG_NS, 'text' );
			myElevText.appendChild (
				document.createTextNode (
					'Alt. ' + latLngElevOnRoute.elev.toFixed ( ZERO ) + ' m.'
				)
			);
			myElevText.setAttributeNS ( null, 'class', 'TravelNotes-Route-SvgProfile-elevText' );
			myElevText.setAttributeNS ( null, 'x', markerX + deltaMarkerX );
			myElevText.setAttributeNS (
				null,
				'y',
				SVG_PROFILE.margin + ( SVG_PROFILE.yDeltaText * TWO )
			);
			myElevText.setAttributeNS ( null, 'text-anchor', textAnchor );
			mySvg.appendChild ( myElevText );

			// pente
			myAscentText = document.createElementNS ( SVG_NS, 'text' );
			myAscentText.appendChild (
				document.createTextNode (
					'Pente ' + latLngElevOnRoute.ascent.toFixed ( ZERO ) + ' % '
				)
			);
			myAscentText.setAttributeNS ( null, 'class', 'TravelNotes-Route-SvgProfile-elevText' );
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

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myClean
	@desc This function removes the svg and event listeners from the window
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myClean ( ) {
		if ( mySvg ) {
			mySvg.removeEventListener ( 'contextmenu', myOnSvgContextMenu, false );
			mySvg.removeEventListener ( 'mousemove', myOnSvgMouseMove, false );
			mySvg.removeEventListener ( 'mouseleave', myOnSvgMouseLeave, false );
			theEventDispatcher.dispatch ( 'removeobject', { objId : myLatLngObjId } );

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

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnClose
	@desc This function closes the window
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnClose ( ) {
		myClean ( );
		theEventDispatcher.dispatch (
			'profileclosed',
			{
				objId : myRoute.objId
			}
		);

	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myUpdate
	@desc This function updates the window, removing the svg and adding a new one, build with the route given as parameter
	@param {Route} route The route used to update the svg profile
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myUpdate ( args ) {
		myClean ( );
		myRoute = args [ ZERO ];
		mySvg = new ProfileFactory ( ).createSvg ( myRoute );

		myProfileWindow.header.textContent = theTranslator.getText (
			'ProfileWindow - Profile {name}',
			{ name : myRoute.computedName }
		);
		myProfileWindow.content.appendChild ( mySvg );
		mySvg.addEventListener ( 'contextmenu', myOnSvgContextMenu, false );
		mySvg.addEventListener ( 'mousemove', myOnSvgMouseMove, false );
		mySvg.addEventListener ( 'mouseleave', myOnSvgMouseLeave, false );

		myAscentDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ProfileWindow-Ascent',
				textContent : theTranslator.getText (
					'ProfileWindow - Ascent: {ascent} m. - Descent: {descent} m. - Distance: {distance}',
					{
						ascent : myRoute.itinerary.ascent.toFixed ( ZERO ),
						descent : myRoute.itinerary.descent.toFixed ( ZERO ),
						distance : theUtilities.formatDistance ( myRoute.distance )
					}
				)
			}
		);
		myProfileWindow.content.appendChild ( myAscentDiv );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class ProfileWindow
	@classdesc a float window containing a route profile
	@see {@link newProfileWindow} for constructor
	@augments FloatWindow
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	myProfileWindow = newFloatWindow ( );
	myProfileWindow.createWindow ( );
	myProfileWindow.onClose = myOnClose;
	myProfileWindow.onUpdate = myUpdate;

	return myProfileWindow;
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newProfileWindow
	@desc constructor of newProfileWindow objects
	@return {ProfileWindow} an instance of a ProfileWindow object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewProfileWindow as newProfileWindow
};

/*
--- End of ProfileWindow.js file ----------------------------------------------------------------------------------------------
*/