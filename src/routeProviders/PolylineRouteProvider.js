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
Doc reviewed ...
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

@module PolylineRouteProvider
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theSphericalTrigonometry from '../util/SphericalTrigonometry.js';
import { ZERO, ONE, TWO, LAT, LNG, DEGREES } from '../util/Constants.js';

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

let ourUserLanguage = 'fr';
let ourRoute = null;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourAddManeuver
@desc Add a maneuver to the itinerary
@param {number} itineraryPointObjId the objId of the itineraryPoint linked to the maneuver
@param {string} position the position of the maneuver. Must be kStart or kEnd
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourAddManeuver ( itineraryPointObjId, position ) {
	let maneuver = window.TaN.maneuver;

	maneuver.iconName = OUR_ICON_NAMES [ position ];
	maneuver.instruction =
		OUR_INSTRUCTIONS_LIST [ ourUserLanguage ]
			?
			OUR_INSTRUCTIONS_LIST [ ourUserLanguage ] [ position ]
			:
			OUR_INSTRUCTIONS_LIST.en [ position ];
	maneuver.duration = ZERO;
	maneuver.itineraryPointObjId = itineraryPointObjId;

	ourRoute.itinerary.maneuvers.add ( maneuver );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourAddItineraryPoint
@desc Add a itineraryPoint to the itineraryPoints collection
@param {array.<number>} latLng the position of the itineraryPoint
@return {number} the objId of the new itineraryPoint
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourAddItineraryPoint ( latLng ) {
	let itineraryPoint = window.TaN.itineraryPoint;
	itineraryPoint.latLng = latLng;
	ourRoute.itinerary.itineraryPoints.add ( itineraryPoint );
	return itineraryPoint.objId;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourAddIntermediateItineraryPoints
@desc this function add 64 intermediates points on a stuff of great circle
@param {WayPoint} startWayPoint the starting wayPoint
@param {WayPoint} endWayPoint the ending wayPoint
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourAddIntermediateItineraryPoints ( startWayPoint, endWaypoint ) {

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
		let itineraryPoint = window.TaN.itineraryPoint;
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
	itineraryPoints.forEach ( itineraryPoint => ourRoute.itinerary.itineraryPoints.add ( itineraryPoint ) );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourParseGreatCircle
@desc this function set a stuff of great circle as itinerary
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourParseGreatCircle ( ) {
	let wayPointsIterator = ourRoute.wayPoints.iterator;
	let previousWayPoint = null;
	while ( ! wayPointsIterator.done ) {
		if ( wayPointsIterator.first ) {

			// first point... adding an itinerary point and the start maneuver
			previousWayPoint = wayPointsIterator.value;
			ourAddManeuver (
				ourAddItineraryPoint ( wayPointsIterator.value.latLng ),
				'kStart'
			);
		}
		else {

			// next points.... adding intermediate points, itinerary point and maneuver
			ourAddIntermediateItineraryPoints (
				previousWayPoint,
				wayPointsIterator.value
			);
			ourAddManeuver (
				ourAddItineraryPoint ( wayPointsIterator.value.latLng ),
				wayPointsIterator.last ? 'kEnd' : 'kContinue'
			);
			previousWayPoint = wayPointsIterator.value;
		}
	}

	// moving complete travel if needed, so we are always near the origine
	let maxLng = -Number.MAX_VALUE;
	let itineraryPointsIterator = ourRoute.itinerary.itineraryPoints.iterator;
	while ( ! itineraryPointsIterator.done ) {
		maxLng = Math.max ( maxLng, itineraryPointsIterator.value.lng );
	}
	let deltaLng = ( maxLng % DEGREES.d360 ) - maxLng;

	itineraryPointsIterator = ourRoute.itinerary.itineraryPoints.iterator;
	while ( ! itineraryPointsIterator.done ) {
		itineraryPointsIterator.value.lng += deltaLng;
	}
	wayPointsIterator = ourRoute.wayPoints.iterator;
	while ( ! wayPointsIterator.done ) {
		wayPointsIterator.value.lng += deltaLng;
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourParseCircle
@desc this function set a circle as itinerary
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourParseCircle ( ) {

	let centerPoint = [
		ourRoute.wayPoints.first.lat * DEGREES.toRadians,
		ourRoute.wayPoints.first.lng * DEGREES.toRadians
	];

	let distancePoint = [
		ourRoute.wayPoints.last.lat * DEGREES.toRadians,
		ourRoute.wayPoints.last.lng * DEGREES.toRadians
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
		let itineraryPoint = window.TaN.itineraryPoint;
		itineraryPoint.latLng = [
			( OUR_HALF_PI - tmpArc ) * DEGREES.fromRadians,
			( centerPoint [ LNG ] + deltaLng ) * DEGREES.fromRadians
		];
		itineraryPoints.push ( itineraryPoint );

		itineraryPoint = window.TaN.itineraryPoint;
		itineraryPoint.latLng = [
			( OUR_HALF_PI - tmpArc ) * DEGREES.fromRadians,
			( centerPoint [ LNG ] - deltaLng ) * DEGREES.fromRadians
		];
		itineraryPoints.unshift ( itineraryPoint );
		if ( counter === addedSegments ) {
			ourAddManeuver ( itineraryPoint.objId, 'kStart' );
			itineraryPoint = window.TaN.itineraryPoint;
			itineraryPoint.latLng = [
				( OUR_HALF_PI - tmpArc ) * DEGREES.fromRadians,
				( centerPoint [ LNG ] - deltaLng ) * DEGREES.fromRadians
			];
			ourAddManeuver ( itineraryPoint.objId, 'kEnd' );
			itineraryPoints.push ( itineraryPoint );
		}
	}

	itineraryPoints.forEach ( itineraryPoint => ourRoute.itinerary.itineraryPoints.add ( itineraryPoint ) );

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourParseResponse
@desc Build a polyline (as stuff of a great circle) or a circle from the start and end wayPoints
@param {function} onOk a function to call when the response is parsed correctly
@param {function} onError a function to call when an error occurs
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourParseResponse ( onOk, onError ) {
	try {
		ourRoute.itinerary.itineraryPoints.removeAll ( );
		ourRoute.itinerary.maneuvers.removeAll ( );
		ourRoute.itinerary.hasProfile = false;
		ourRoute.itinerary.ascent = ZERO;
		ourRoute.itinerary.descent = ZERO;

		switch ( ourRoute.itinerary.transitMode ) {
		case 'line' :
			ourParseGreatCircle ( );
			break;
		case 'circle' :
			ourParseCircle ( );
			break;
		default :
			break;
		}
		onOk ( ourRoute );
	}
	catch ( err ) { onError ( err ); }
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetPromiseRoute
@desc build a polyline or a circle into the route itinerary object
@param {route} route a Route object with at least two WayPoints completed
@return a Promise completed with a function that build a polyline or a circle in the itinerary
in the route itinerary
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetPromiseRoute ( route ) {
	ourRoute = route;
	return new Promise ( ourParseResponse );
}

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

class PolylineRouteProvider {

	constructor ( ) {
		Object.freeze ( this );
	}

	getPromiseRoute ( route ) { return ourGetPromiseRoute ( route ); }

	get icon ( ) {
		return 'data:image/svg+xml;utf8,<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" > <circle cx="12" c' +
		'y="12" r="3" stroke="rgb(0,0,0)" fill="transparent" /> <line x1="5" y1="17" x2="11" y2="2" stroke="rgb(0,0,0)" ' +
		'/> <line x1="3" y1="6" x2="17" y2="9" stroke="rgb(191,0,0)" /> <line x1="3" y1="16" x2="17" y2="5" stroke="rgb(' +
		'255,204,0)" /> </svg>';
	}

	get name ( ) { return 'Polyline'; }

	get title ( ) { return 'Polyline & Circle'; }

	get transitModes ( ) { return [ 'line', 'circle' ]; }

	get providerKeyNeeded ( ) { return false; }

	get providerKey ( ) { return ONE; }
	set providerKey ( ProviderKey ) { }

	get userLanguage ( ) { return ourUserLanguage; }
	set userLanguage ( UserLanguage ) { ourUserLanguage = UserLanguage; }

}

window.TaN.addProvider ( new PolylineRouteProvider ( ) );

/*
--- End of PolylineRouteProvider.js file --------------------------------------------------------------------------------------
*/