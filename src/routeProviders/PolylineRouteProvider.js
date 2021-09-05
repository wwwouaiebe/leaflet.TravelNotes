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
	- v2.1.0:
		- Issue ♯150 : Merge travelNotes and plugins
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file PolylineRouteProvider.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module routeProviders
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theSphericalTrigonometry from '../coreLib/SphericalTrigonometry.js';
import ItineraryPoint from '../data/ItineraryPoint.js';
import Maneuver from '../data/Maneuver.js';
import BaseRouteProvider from '../routeProviders/BaseRouteProvider.js';

import { ZERO, ONE, TWO, LAT, LNG, DEGREES } from '../main/Constants.js';

const OUR_HALF_PI = Math.PI / TWO;

const OUR_INSTRUCTIONS_LIST = Object.freeze (
	{
		en : Object.freeze ( { kStart : 'Start', kContinue : 'Continue', kEnd : 'Stop' } ),
		fr : Object.freeze ( { kStart : 'Départ', kContinue : 'Continuer', kEnd : 'Arrivée' } )
	}
);

const OUR_ICON_NAMES = Object.freeze (
	{
		kStart : 'kDepartDefault',
		kContinue : 'kContinueStraight',
		kEnd : 'kArriveDefault'
	}
);

/**
@------------------------------------------------------------------------------------------------------------------------------

@class PolylineRouteProvider
@classdesc This class implements the Provider interface for a Polyline. It's not possible to instanciate
this class because the class is not exported from the module. Only one instance is created and added to the list
of Providers of TravelNotes
@see Provider for a description of methods
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class PolylineRouteProvider extends BaseRouteProvider {

	#userLanguage = 'fr';

	/**
	The provider key. Will be set by TravelNotes
	@private
	*/

	#providerKey = '';

	/**
	A reference to the edited route
	*/

	#route = null;

	/**
	Add a maneuver to the itinerary
	@param {number} itineraryPointObjId the objId of the itineraryPoint linked to the maneuver
	@param {string} position the position of the maneuver. Must be kStart or kEnd
	@private
	*/

	#addManeuver ( itineraryPointObjId, position ) {
		let maneuver = new Maneuver ( );

		maneuver.iconName = OUR_ICON_NAMES [ position ];
		maneuver.instruction =
			OUR_INSTRUCTIONS_LIST [ this.userLanguage ]
				?
				OUR_INSTRUCTIONS_LIST [ this.userLanguage ] [ position ]
				:
				OUR_INSTRUCTIONS_LIST.en [ position ];
		maneuver.duration = ZERO;
		maneuver.itineraryPointObjId = itineraryPointObjId;

		this.#route.itinerary.maneuvers.add ( maneuver );
	}

	/**
	Add a itineraryPoint to the itineraryPoints collection
	@param {array.<number>} latLng the position of the itineraryPoint
	@return {number} the objId of the new itineraryPoint
	@private
	*/

	#addItineraryPoint ( latLng ) {
		let itineraryPoint = new ItineraryPoint ( );
		itineraryPoint.latLng = latLng;
		this.#route.itinerary.itineraryPoints.add ( itineraryPoint );
		return itineraryPoint.objId;
	}

	/**
	This method add 64 intermediates points on a stuff of great circle
	@param {WayPoint} startWayPoint the starting wayPoint
	@param {WayPoint} endWayPoint the ending wayPoint
	@private
	*/

	#addIntermediateItineraryPoints ( startWayPoint, endWaypoint ) {

		// first conversion to radian
		let latLngStartPoint = [
			startWayPoint.lat * DEGREES.toRadians,
			startWayPoint.lng * DEGREES.toRadians
		];
		let latLngEndPoint = [
			endWaypoint.lat * DEGREES.toRadians,
			endWaypoint.lng * DEGREES.toRadians
		];

		// searching the direction: from west to east or east to west...
		let WestEast =
			( endWaypoint.lng - startWayPoint.lng + DEGREES.d360 ) % DEGREES.d360 > DEGREES.d180
				?
				-ONE
				:
				ONE;

		// computing the distance
		let angularDistance = theSphericalTrigonometry.arcFromSummitArcArc (
			latLngEndPoint [ LNG ] - latLngStartPoint [ LNG ],
			OUR_HALF_PI - latLngStartPoint [ LAT ],
			OUR_HALF_PI - latLngEndPoint [ LAT ]
		);

		/* for short distances a single line is ok */
		/* eslint-disable-next-line no-magic-numbers */
		if ( 0.1 > angularDistance * DEGREES.fromRadians ) {
			return;
		}

		// and the direction at the start point
		let direction = theSphericalTrigonometry.summitFromArcArcArc (
			OUR_HALF_PI - latLngStartPoint [ LAT ],
			angularDistance,
			OUR_HALF_PI - latLngEndPoint [ LAT ]
		);

		let addedSegments = 64;
		let itineraryPoints = [];

		// loop to compute the added segments
		for ( let counter = 1; counter <= addedSegments; counter ++ ) {
			let partialDistance = angularDistance * counter / addedSegments;

			// computing the opposite arc to the start point
			let tmpArc = theSphericalTrigonometry.arcFromSummitArcArc (
				direction,
				OUR_HALF_PI - latLngStartPoint [ LAT ],
				partialDistance
			);

			// computing the lng
			let deltaLng = theSphericalTrigonometry.summitFromArcArcArc (
				OUR_HALF_PI - latLngStartPoint [ LAT ],
				tmpArc,
				partialDistance
			);

			// adding the itinerary point to a tmp array
			let itineraryPoint = new ItineraryPoint ( );
			itineraryPoint.latLng = [
				( OUR_HALF_PI - tmpArc ) * DEGREES.fromRadians,
				( latLngStartPoint [ LNG ] + ( WestEast * deltaLng ) ) * DEGREES.fromRadians
			];
			itineraryPoints.push ( itineraryPoint );
		}

		// last added itinerary point  is the same than the end waypoint, so we remove and we adapt the lng
		// of the end waypoint ( we can have a difference of 360 degree due to computing east or west
		endWaypoint.lng = itineraryPoints.pop ( ).lng;

		// adding itinerary points to the route
		itineraryPoints.forEach ( itineraryPoint => this.#route.itinerary.itineraryPoints.add ( itineraryPoint ) );
	}

	/**
	Set a stuff of great circle as itinerary
	*/

	#parseGreatCircle ( ) {
		let wayPointsIterator = this.#route.wayPoints.iterator;
		let previousWayPoint = null;
		while ( ! wayPointsIterator.done ) {
			if ( wayPointsIterator.first ) {

				// first point... adding an itinerary point and the start maneuver
				previousWayPoint = wayPointsIterator.value;
				this.#addManeuver (
					this.#addItineraryPoint ( wayPointsIterator.value.latLng ),
					'kStart'
				);
			}
			else {

				// next points.... adding intermediate points, itinerary point and maneuver
				this.#addIntermediateItineraryPoints (
					previousWayPoint,
					wayPointsIterator.value
				);
				this.#addManeuver (
					this.#addItineraryPoint ( wayPointsIterator.value.latLng ),
					wayPointsIterator.last ? 'kEnd' : 'kContinue'
				);
				previousWayPoint = wayPointsIterator.value;
			}
		}

		// moving complete travel if needed, so we are always near the origine
		let maxLng = -Number.MAX_VALUE;
		let itineraryPointsIterator = this.#route.itinerary.itineraryPoints.iterator;
		while ( ! itineraryPointsIterator.done ) {
			maxLng = Math.max ( maxLng, itineraryPointsIterator.value.lng );
		}
		let deltaLng = ( maxLng % DEGREES.d360 ) - maxLng;

		itineraryPointsIterator = this.#route.itinerary.itineraryPoints.iterator;
		while ( ! itineraryPointsIterator.done ) {
			itineraryPointsIterator.value.lng += deltaLng;
		}
		wayPointsIterator = this.#route.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			wayPointsIterator.value.lng += deltaLng;
		}
	}

	/**
	this function set a circle as itinerary
	@private
	*/

	#parseCircle ( ) {

		let centerPoint = [
			this.#route.wayPoints.first.lat * DEGREES.toRadians,
			this.#route.wayPoints.first.lng * DEGREES.toRadians
		];

		let distancePoint = [
			this.#route.wayPoints.last.lat * DEGREES.toRadians,
			this.#route.wayPoints.last.lng * DEGREES.toRadians
		];

		let angularDistance = theSphericalTrigonometry.arcFromSummitArcArc (
			centerPoint [ LNG ] - distancePoint [ LNG ],
			OUR_HALF_PI - centerPoint [ LAT ],
			OUR_HALF_PI - distancePoint [ LAT ]
		);

		let addedSegments = 360;
		let itineraryPoints = [];

		// loop to compute the added segments
		for ( let counter = 0; counter <= addedSegments; counter ++ ) {

			let direction = ( Math.PI / ( TWO * addedSegments ) ) + ( ( Math.PI * counter ) / addedSegments );

			let tmpArc = theSphericalTrigonometry.arcFromSummitArcArc (
				direction,
				angularDistance,
				OUR_HALF_PI - centerPoint [ LAT ]
			);

			let deltaLng = theSphericalTrigonometry.summitFromArcArcArc (
				OUR_HALF_PI - centerPoint [ LAT ],
				tmpArc,
				angularDistance
			);
			let itineraryPoint = new ItineraryPoint ( );
			itineraryPoint.latLng = [
				( OUR_HALF_PI - tmpArc ) * DEGREES.fromRadians,
				( centerPoint [ LNG ] + deltaLng ) * DEGREES.fromRadians
			];
			itineraryPoints.push ( itineraryPoint );

			itineraryPoint = new ItineraryPoint ( );
			itineraryPoint.latLng = [
				( OUR_HALF_PI - tmpArc ) * DEGREES.fromRadians,
				( centerPoint [ LNG ] - deltaLng ) * DEGREES.fromRadians
			];
			itineraryPoints.unshift ( itineraryPoint );
			if ( counter === addedSegments ) {
				this.#addManeuver ( itineraryPoint.objId, 'kStart' );
				itineraryPoint = new ItineraryPoint ( );
				itineraryPoint.latLng = [
					( OUR_HALF_PI - tmpArc ) * DEGREES.fromRadians,
					( centerPoint [ LNG ] - deltaLng ) * DEGREES.fromRadians
				];
				this.#addManeuver ( itineraryPoint.objId, 'kEnd' );
				itineraryPoints.push ( itineraryPoint );
			}
		}

		itineraryPoints.forEach ( itineraryPoint => this.#route.itinerary.itineraryPoints.add ( itineraryPoint ) );

	}

	/**
	Build a polyline (as stuff of a great circle) or a circle from the start and end wayPoints
	@param {function} onOk a function to call when the response is parsed correctly
	@param {function} onError a function to call when an error occurs
	@private
	*/

	#parseResponse ( onOk, onError ) {
		try {
			this.#route.itinerary.itineraryPoints.removeAll ( );
			this.#route.itinerary.maneuvers.removeAll ( );
			this.#route.itinerary.hasProfile = false;
			this.#route.itinerary.ascent = ZERO;
			this.#route.itinerary.descent = ZERO;

			switch ( this.#route.itinerary.transitMode ) {
			case 'line' :
				this.#parseGreatCircle ( );
				break;
			case 'circle' :
				this.#parseCircle ( );
				break;
			default :
				break;
			}
			onOk ( this.#route );
		}
		catch ( err ) { onError ( err ); }
	}

	/*
	constructor
	*/

	constructor ( ) {
		super ( );
	}

	get icon ( ) {
		return 'data:image/svg+xml;utf8,<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" > <circle cx="12" c' +
			'y="12" r="3" stroke="rgb(0,0,0)" fill="transparent" /> <line x1="5" y1="17" x2="11" y2="2" stroke="rgb(0,0,0)" ' +
			'/> <line x1="3" y1="6" x2="17" y2="9" stroke="rgb(191,0,0)" /> <line x1="3" y1="16" x2="17" y2="5" stroke="rgb(' +
			'255,204,0)" /> </svg>';
	}

	getPromiseRoute ( route ) {
		this.#route = route;
		return new Promise ( ( onOk, onError ) => this.#parseResponse ( onOk, onError ) );
	}

	get name ( ) { return 'Polyline'; }

	get title ( ) { return 'Polyline & Circle'; }

	get transitModes ( ) { return [ 'line', 'circle' ]; }

	get providerKeyNeeded ( ) { return false; }

	get providerKey ( ) { return ONE; }
	set providerKey ( providerKey ) { }

	get userLanguage ( ) { return this.#userLanguage; }
	set userLanguage ( userLanguage ) { this.#userLanguage = userLanguage; }
}

window.TaN.addProvider ( PolylineRouteProvider );

/*
--- End of PolylineRouteProvider.js file --------------------------------------------------------------------------------------
*/