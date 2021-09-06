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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

import theTranslator from '../UILib/Translator.js';
import ObjId from '../data/ObjId.js';
import FloatWindow from '../dialogFloatWindow/FloatWindow.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theGeometry from '../coreLib/Geometry.js';
import theEventDispatcher from '../coreLib/EventDispatcher.js';
import theUtilities from '../UILib/Utilities.js';
import ProfileContextMenu from '../contextMenus/ProfileContextMenu.js';
import ProfileFactory from '../coreLib/ProfileFactory.js';
import theDataSearchEngine from '../data/DataSearchEngine.js';
import { SVG_NS, SVG_PROFILE, ZERO, ONE, TWO, THREE } from '../main/Constants.js';

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

@module dialogProfileWindow

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@--------------------------------------------------------------------------------------------------------------------------

@class BaseSvgEL
@classdesc Base class for Svg event listeners
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class BaseSvgEL {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	getlatLngElevOnRouteAtMousePosition ( mouseEvent ) {
		let route = theDataSearchEngine.getRoute ( Number.parseInt ( mouseEvent.currentTarget.dataset.tanObjId ) );
		let clientRect = mouseEvent.currentTarget.getBoundingClientRect ( );
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
			) * route.distance;
		if ( ZERO < routeDist && routeDist < route.distance ) {
			return theGeometry.getLatLngElevAtDist ( route, routeDist );
		}

		return null;
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class SvgContextMenuEL
@classdesc contextmenu event listener for svg profile
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class SvgContextMenuEL extends BaseSvgEL {

	/*
	constructor
	*/

	constructor ( ) {
		super ( );
	}

	handleEvent ( mouseEvent ) {
		mouseEvent.preventDefault ( );
		mouseEvent.stopPropagation ( );

		let latLngElevOnRoute = this.getlatLngElevOnRouteAtMousePosition ( mouseEvent );
		if ( latLngElevOnRoute ) {
			mouseEvent.latlng = {
				lat : latLngElevOnRoute.latLng [ ZERO ],
				lng : latLngElevOnRoute.latLng [ ONE ]
			};
			new ProfileContextMenu ( mouseEvent ).show ( );
		}
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class SvgMouseLeaveEL
@classdesc mouseleave event listener for svg profile
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class SvgMouseLeaveEL {

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	handleEvent ( mouseLeaveEvent ) {
		mouseLeaveEvent.preventDefault ( );
		mouseLeaveEvent.stopPropagation ( );
		theEventDispatcher.dispatch (
			'removeobject',
			{ objId : Number.parseInt ( mouseLeaveEvent.currentTarget.dataset.tanMarkerObjId ) }
		);
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class SvgMouseMoveEL
@classdesc mousemove event listener for svg profile
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class SvgMouseMoveEL extends BaseSvgEL {

	/*
	constructor
	*/

	constructor ( ) {
		super ( );
	}

	#marker = null;
	#distanceText = null;
	#elevText = null;
	#ascentText = null;
	#textAnchor = null;
	#markerX = null;
	#profileSvg = null;

	#createSvgText ( text, markerY ) {
		let svgText = document.createElementNS ( SVG_NS, 'text' );
		svgText.appendChild ( document.createTextNode ( text ) );
		svgText.setAttributeNS ( null, 'class', 'TravelNotes-Route-SvgProfile-elevText' );
		svgText.setAttributeNS ( null, 'x', this.#markerX );
		svgText.setAttributeNS ( null, 'y', markerY );
		svgText.setAttributeNS ( null, 'text-anchor', this.#textAnchor );
		this.#profileSvg.appendChild ( svgText );

		return svgText;
	}

	handleEvent ( mouseEvent ) {

		mouseEvent.preventDefault ( );
		mouseEvent.stopPropagation ( );

		this.#profileSvg = mouseEvent.currentTarget;
		let latLngElevOnRoute = this.getlatLngElevOnRouteAtMousePosition ( mouseEvent );
		if ( latLngElevOnRoute ) {

			// itinerary point marker on the map
			let markerObjId = Number.parseInt ( this.#profileSvg.dataset.tanMarkerObjId );
			theEventDispatcher.dispatch ( 'removeobject', { objId : markerObjId } );
			theEventDispatcher.dispatch (
				'additinerarypointmarker',
				{
					objId : markerObjId,
					latLng : latLngElevOnRoute.latLng
				}
			);

			// Line and text on svg
			if ( this.#marker ) {
				this.#profileSvg.removeChild ( this.#marker );
				this.#profileSvg.removeChild ( this.#distanceText );
				this.#profileSvg.removeChild ( this.#elevText );
				this.#profileSvg.removeChild ( this.#ascentText );
			}
			let clientRect = this.#profileSvg.getBoundingClientRect ( );
			this.#markerX =
				( ( TWO * SVG_PROFILE.margin ) + SVG_PROFILE.width ) *
				( mouseEvent.clientX - clientRect.x ) / clientRect.width;
			let markerY = SVG_PROFILE.margin + SVG_PROFILE.height;

			// line
			this.#marker = document.createElementNS ( SVG_NS, 'polyline' );
			this.#marker.setAttributeNS (
				null,
				'points',
				String ( this.#markerX ) + ',' + SVG_PROFILE.margin + ' ' + this.#markerX + ',' + markerY
			);
			this.#marker.setAttributeNS ( null, 'class', 'TravelNotes-Route-SvgProfile-markerPolyline' );
			this.#profileSvg.appendChild ( this.#marker );

			// texts
			let route = theDataSearchEngine.getRoute ( Number.parseInt ( this.#profileSvg.dataset.tanObjId ) );
			this.#textAnchor = latLngElevOnRoute.routeDistance > route.distance / TWO ? 'end' : 'start';
			this.#markerX +=
				latLngElevOnRoute.routeDistance > route.distance / TWO
					?
					-SVG_PROFILE.xDeltaText
					:
					SVG_PROFILE.xDeltaText;

			// distance
			this.#distanceText = this.#createSvgText (
				theUtilities.formatDistance ( latLngElevOnRoute.routeDistance ),
				SVG_PROFILE.margin + SVG_PROFILE.yDeltaText,
			);

			this.#elevText = this.#createSvgText (
				'Alt. ' + latLngElevOnRoute.elev.toFixed ( ZERO ) + ' m.',
				SVG_PROFILE.margin + ( SVG_PROFILE.yDeltaText * TWO )
			);

			this.#ascentText = this.#createSvgText (
				'Pente ' + latLngElevOnRoute.ascent.toFixed ( ZERO ) + ' % ',
				SVG_PROFILE.margin + ( SVG_PROFILE.yDeltaText * THREE )
			);
		}
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class ProfileWindow
@classdesc a float window containing a route profile
@extends FloatWindow
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class ProfileWindow extends FloatWindow {

	/**
	The svg profile
	@private
	*/

	#svg = null;

	/**
	A div under the svg profile with some texts
	@private
	*/

	#ascentDiv = null;

	/**
	The route for witch the profile is diplayed
	@private
	*/

	#route = null;

	/**
	Event listeners
	@private
	*/

	#eventListeners = {
		onSvgContextMenu : null,
		onSvgMouseMove : null,
		onSvgMouseLeave : null
	}

	/**
	An objId for the position marker
	*/

	#markerObjId = ObjId.nextObjId;

	/**
	This method removes the svg and event listeners from the window
	@private
	*/

	#clean ( ) {
		if ( this.#svg ) {
			this.#svg.removeEventListener ( 'contextmenu', this.#eventListeners.onSvgContextMenu, false );
			this.#svg.removeEventListener ( 'mousemove', this.#eventListeners.onSvgMouseMove, false );
			this.#svg.removeEventListener ( 'mouseleave', this.#eventListeners.onSvgMouseLeave, false );

			theEventDispatcher.dispatch ( 'removeobject', { objId : this.#markerObjId } );

			this.content.removeChild ( this.#ascentDiv );
			this.content.removeChild ( this.#svg );
		}

		this.#svg = null;
		this.#ascentDiv = null;
	}

	/*
	constructor
	*/

	constructor ( ) {
		super ( );
		this.#eventListeners.onSvgContextMenu = new SvgContextMenuEL ( );
		this.#eventListeners.onSvgMouseMove = new SvgMouseMoveEL ( );
		this.#eventListeners.onSvgMouseLeave = new SvgMouseLeaveEL ( );
	}

	/**
	Clean and close the window
	*/

	close ( ) {
		this.#clean ( );
		theEventDispatcher.dispatch (
			'profileclosed',
			{
				objId : this.#route.objId
			}
		);
		super.close ( );
	}

	/**
	Update the window's content
	*/

	update ( route ) {
		this.#clean ( );
		this.#route = route;
		this.#svg = new ProfileFactory ( ).createSvg ( this.#route );
		this.#svg.dataset.tanObjId = route.objId;
		this.#svg.dataset.tanMarkerObjId = this.#markerObjId;

		this.header.textContent = theTranslator.getText (
			'ProfileWindow - Profile {name}',
			{ name : this.#route.computedName }
		);
		this.content.appendChild ( this.#svg );

		this.#svg.addEventListener ( 'contextmenu', this.#eventListeners.onSvgContextMenu, false );
		this.#svg.addEventListener ( 'mousemove', this.#eventListeners.onSvgMouseMove, false );
		this.#svg.addEventListener ( 'mouseleave', this.#eventListeners.onSvgMouseLeave, false );

		this.#ascentDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ProfileWindow-Ascent',
				textContent : theTranslator.getText (
					'ProfileWindow - Ascent: {ascent} m. - Descent: {descent} m. - Distance: {distance}',
					{
						ascent : this.#route.itinerary.ascent.toFixed ( ZERO ),
						descent : this.#route.itinerary.descent.toFixed ( ZERO ),
						distance : theUtilities.formatDistance ( this.#route.distance )
					}
				)
			}
		);
		this.content.appendChild ( this.#ascentDiv );
	}
}

export default ProfileWindow;

/*
--- End of ProfileWindow.js file ----------------------------------------------------------------------------------------------
*/