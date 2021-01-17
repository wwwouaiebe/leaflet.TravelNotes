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
		- issue #150 : Merge travelNotes and plugins
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

import { ZERO, ONE, TWO } from '../util/Constants.js';
import { theGeometry } from '../util/Geometry.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewPolylineRouteProvider
@desc constructor for PolylineRouteProvider object
@return {PolylineRouteProvider} an instance of PolylineRouteProvider object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewPolylineRouteProvider ( ) {

	const LAT = 0;
	const LNG = 1;

	const DEGREE180 = 180;
	const DEGREE360 = 360;

	const DEGREE_TO_RADIANS = Math.PI / DEGREE180;
	const RADIANS_TO_DEGREE = DEGREE180 / Math.PI;

	const HALF_PI = Math.PI / TWO;

	const MIN_ANGULAR_DISTANCE = 0.1;

	let myUserLanguage = 'fr';
	let myRoute = null;

	const myInstructionsList = {
		en : { kStart : 'Start', kContinue : 'Continue', kEnd : 'Stop' },
		fr : { kStart : 'Départ', kContinue : 'Continuer', kEnd : 'Arrivée' }
	};

	const myIconNames = {
		kStart : 'kDepartDefault',
		kContinue : 'kContinueStraight',
		kEnd : 'kArriveDefault'
	};

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddManeuver
	@desc Add a maneuver to the itinerary
	@param {number} itineraryPointObjId the objId of the itineraryPoint linked to the maneuver
	@param {string} position the position of the maneuver. Must be kStart or kEnd
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddManeuver ( itineraryPointObjId, position ) {
		let maneuver = window.TaN.maneuver;

		maneuver.iconName = myIconNames [ position ];
		maneuver.instruction =
			myInstructionsList [ myUserLanguage ]
				?
				myInstructionsList [ myUserLanguage ] [ position ]
				:
				myInstructionsList.en [ position ];
		maneuver.duration = ZERO;
		maneuver.itineraryPointObjId = itineraryPointObjId;

		myRoute.itinerary.maneuvers.add ( maneuver );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddItineraryPoint
	@desc Add a itineraryPoint to the itineraryPoints collection
	@param {array.<number>} latLng the position of the itineraryPoint
	@return {number} the objId of the new itineraryPoint
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddItineraryPoint ( latLng ) {
		let itineraryPoint = window.TaN.itineraryPoint;
		itineraryPoint.latLng = latLng;
		myRoute.itinerary.itineraryPoints.add ( itineraryPoint );
		return itineraryPoint.objId;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myAddIntermediateItineraryPoints
	@desc this function add 64 intermediates points on a stuff of great circle
	@param {WayPoint} startWayPoint the starting wayPoint
	@param {WayPoint} endWayPoint the ending wayPoint
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myAddIntermediateItineraryPoints ( startWayPoint, endWaypoint ) {

		// first conversion to radian
		let latLngStartPoint = [
			startWayPoint.lat * DEGREE_TO_RADIANS,
			startWayPoint.lng * DEGREE_TO_RADIANS
		];
		let latLngEndPoint = [
			endWaypoint.lat * DEGREE_TO_RADIANS,
			endWaypoint.lng * DEGREE_TO_RADIANS
		];

		// searching the direction: from west to east or east to west...
		let WestEast =
			( endWaypoint.lng - startWayPoint.lng + DEGREE360 ) % DEGREE360 > DEGREE180
				?
				-ONE
				:
				ONE;

		// computing the distance
		let angularDistance = theGeometry.getArcFromSummitArcArc (
			latLngEndPoint [ LNG ] - latLngStartPoint [ LNG ],
			HALF_PI - latLngStartPoint [ LAT ],
			HALF_PI - latLngEndPoint [ LAT ]
		);

		if ( MIN_ANGULAR_DISTANCE > angularDistance * RADIANS_TO_DEGREE ) {
			return;
		}

		// and the direction at the start point
		let direction = theGeometry.getSummitFromArcArcArc (
			HALF_PI - latLngStartPoint [ LAT ],
			angularDistance,
			HALF_PI - latLngEndPoint [ LAT ]
		);

		let addedSegments = 64;
		let itineraryPoints = [];

		// loop to compute the added segments
		for ( let counter = 1; counter <= addedSegments; counter ++ ) {
			let partialDistance = angularDistance * counter / addedSegments;

			// computing the opposite arc to the start point
			let tmpArc = theGeometry.getArcFromSummitArcArc (
				direction,
				HALF_PI - latLngStartPoint [ LAT ],
				partialDistance
			);

			// computing the lng
			let deltaLng = theGeometry.getSummitFromArcArcArc (
				HALF_PI - latLngStartPoint [ LAT ],
				tmpArc,
				partialDistance
			);

			// adding the itinerary point to a tmp array
			let itineraryPoint = window.TaN.itineraryPoint;
			itineraryPoint.latLng = [
				( HALF_PI - tmpArc ) * RADIANS_TO_DEGREE,
				( latLngStartPoint [ LNG ] + ( WestEast * deltaLng ) ) * RADIANS_TO_DEGREE
			];
			itineraryPoints.push ( itineraryPoint );
		}

		// last added itinerary point  is the same than the end waypoint, so we remove and we adapt the lng
		// of the end waypoint ( we can have a difference of 360 degree due to computing east or west
		endWaypoint.lng = itineraryPoints.pop ( ).lng;

		// adding itinerary points to the route
		itineraryPoints.forEach ( itineraryPoint => myRoute.itinerary.itineraryPoints.add ( itineraryPoint ) );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myParseGreatCircle
	@desc this function set a stuff of great circle as itinerary
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myParseGreatCircle ( ) {
		let wayPointsIterator = myRoute.wayPoints.iterator;
		let previousWayPoint = null;
		while ( ! wayPointsIterator.done ) {
			if ( wayPointsIterator.first ) {

				// first point... adding an itinerary point and the start maneuver
				previousWayPoint = wayPointsIterator.value;
				myAddManeuver (
					myAddItineraryPoint ( wayPointsIterator.value.latLng ),
					'kStart'
				);
			}
			else {

				// next points.... adding intermediate points, itinerary point and maneuver
				myAddIntermediateItineraryPoints (
					previousWayPoint,
					wayPointsIterator.value
				);
				myAddManeuver (
					myAddItineraryPoint ( wayPointsIterator.value.latLng ),
					wayPointsIterator.last ? 'kEnd' : 'kContinue'
				);
				previousWayPoint = wayPointsIterator.value;
			}
		}

		// moving complete travel if needed, so we are always near the origine
		let maxLng = -Number.MAX_VALUE;
		let itineraryPointsIterator = myRoute.itinerary.itineraryPoints.iterator;
		while ( ! itineraryPointsIterator.done ) {
			maxLng = Math.max ( maxLng, itineraryPointsIterator.value.lng );
		}
		let deltaLng = ( maxLng % DEGREE360 ) - maxLng;

		itineraryPointsIterator = myRoute.itinerary.itineraryPoints.iterator;
		while ( ! itineraryPointsIterator.done ) {
			itineraryPointsIterator.value.lng += deltaLng;
		}
		wayPointsIterator = myRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			wayPointsIterator.value.lng += deltaLng;
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myParseCircle
	@desc this function set a circle as itinerary
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myParseCircle ( ) {

		let centerPoint = [
			myRoute.wayPoints.first.lat * DEGREE_TO_RADIANS,
			myRoute.wayPoints.first.lng * DEGREE_TO_RADIANS
		];

		let distancePoint = [
			myRoute.wayPoints.last.lat * DEGREE_TO_RADIANS,
			myRoute.wayPoints.last.lng * DEGREE_TO_RADIANS
		];

		let angularDistance = theGeometry.getArcFromSummitArcArc (
			centerPoint [ LNG ] - distancePoint [ LNG ],
			HALF_PI - centerPoint [ LAT ],
			HALF_PI - distancePoint [ LAT ]
		);

		let addedSegments = 360;
		let itineraryPoints = [];

		// loop to compute the added segments
		for ( let counter = 0; counter <= addedSegments; counter ++ ) {

			let direction = ( Math.PI / ( TWO * addedSegments ) ) + ( ( Math.PI * counter ) / addedSegments );

			let tmpArc = theGeometry.getArcFromSummitArcArc (
				direction,
				angularDistance,
				HALF_PI - centerPoint [ LAT ]
			);

			let deltaLng = theGeometry.getSummitFromArcArcArc (
				HALF_PI - centerPoint [ LAT ],
				tmpArc,
				angularDistance
			);
			let itineraryPoint = window.TaN.itineraryPoint;
			itineraryPoint.latLng = [
				( HALF_PI - tmpArc ) * RADIANS_TO_DEGREE,
				( centerPoint [ LNG ] + deltaLng ) * RADIANS_TO_DEGREE
			];
			itineraryPoints.push ( itineraryPoint );

			itineraryPoint = window.TaN.itineraryPoint;
			itineraryPoint.latLng = [
				( HALF_PI - tmpArc ) * RADIANS_TO_DEGREE,
				( centerPoint [ LNG ] - deltaLng ) * RADIANS_TO_DEGREE
			];
			itineraryPoints.unshift ( itineraryPoint );
			if ( counter === addedSegments ) {
				myAddManeuver ( itineraryPoint.objId, 'kStart' );
				itineraryPoint = window.TaN.itineraryPoint;
				itineraryPoint.latLng = [
					( HALF_PI - tmpArc ) * RADIANS_TO_DEGREE,
					( centerPoint [ LNG ] - deltaLng ) * RADIANS_TO_DEGREE
				];
				myAddManeuver ( itineraryPoint.objId, 'kEnd' );
				itineraryPoints.push ( itineraryPoint );
			}
		}

		itineraryPoints.forEach ( itineraryPoint => myRoute.itinerary.itineraryPoints.add ( itineraryPoint ) );

	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myParseResponse
	@desc Build a polyline (as stuff of a great circle) or a circle from the start and end wayPoints
	@param {function} returnOnOk a function to call when the response is parsed correctly
	@param {function} returnOnError a function to call when an error occurs
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myParseResponse ( returnOnOk, returnOnError ) {
		try {
			myRoute.itinerary.itineraryPoints.removeAll ( );
			myRoute.itinerary.maneuvers.removeAll ( );
			myRoute.itinerary.hasProfile = false;
			myRoute.itinerary.ascent = ZERO;
			myRoute.itinerary.descent = ZERO;

			switch ( myRoute.itinerary.transitMode ) {
			case 'line' :
				myParseGreatCircle ( );
				break;
			case 'circle' :
				myParseCircle ( );
				break;
			default :
				break;
			}
			returnOnOk ( myRoute );
		}
		catch ( err ) { returnOnError ( err ); }
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myGetPromiseRoute
	@desc build a polyline or a circle into the route itinerary object
	@param {route} route a Route object with at least two WayPoints completed
	@return a Promise completed with a function that build a polyline or a circle in the itinerary
	in the route itinerary
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myGetPromiseRoute ( route ) {
		myRoute = route;
		return new Promise ( myParseResponse );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class PolylineRouteProvider
	@classdesc This class implements the Provider interface for a Polyline. It's not possible to instanciate
	this class because the class is not exported from the module. Only one instance is created and added to the list
	of Providers of TravelNotes
	@see Provider for a description of methods
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	return {

		getPromiseRoute : route => myGetPromiseRoute ( route ),
		get icon ( ) {
			return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAIAAAC0Ujn1AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3\
					RJTUUH4ggaBh8z7ov/KQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAqElEQVRIx9VW0Q6AIAgU5v\
					//sr1Us0I6EGy5HnLR3XnAhFprJWdxSVuJ0FX7SLS/uEzDVJ8cMdAuOJfXCBPR/gSn8cHNMz+7DLEa3ccf5QSo7itPpBzoYAOuCH\
					TbdvEMqQBb5hoGp1G0RbIYg9bFvqXaUnxKPiURHNDfg8PxLMrYNHYabe5GxI2eUqWvHj3YgTjJjWXX7vS18u2wEDT0rJlDoie0fw\
					5mG+C/L0HylIYKAAAAAElFTkSuQmCC';
		},
		get name ( ) { return 'Polyline'; },
		get transitModes ( ) { return { line : true, circle : true }; },
		get providerKeyNeeded ( ) { return false; },

		get providerKey ( ) { return ONE; },
		set providerKey ( ProviderKey ) { },

		get userLanguage ( ) { return myUserLanguage; },
		set userLanguage ( UserLanguage ) { myUserLanguage = UserLanguage; }

	};
}

window.TaN.addProvider ( ourNewPolylineRouteProvider ( ) );

/*
--- End of PolylineRouteProvider.js file --------------------------------------------------------------------------------------
*/