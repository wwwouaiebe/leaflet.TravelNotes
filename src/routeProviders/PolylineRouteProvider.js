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

function newPolylineRouteProvider ( ) {

	const ZERO = 0;
	const ONE = 1;
	const TWO = 2;

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

	/*
	--- myGetArcFromSummitArcArc function -------------------------------------------------------------------------

	This function gives an arc of a spherical triangle when the 2 others ars and the opposite summit are know
	It's the well know cosinus law
	cos a = cos b cos c + sin b sin c cos A
	cos b =	cos c cos a + sin c sin a cos B
	cos c = cos a cos b + sin a sin b cos C

	---------------------------------------------------------------------------------------------------------------
	*/

	function myGetArcFromSummitArcArc ( summit, arc1, arc2 ) {
		return Math.acos (
			( Math.cos ( arc1 ) * Math.cos ( arc2 ) ) +
			( Math.sin ( arc1 ) * Math.sin ( arc2 ) * Math.cos ( summit ) )
		);
	}

	/*
	--- myGetSummitFromArcArcArc function -------------------------------------------------------------------------

	This function is also the well know cosinus law written in an other way....
	cos C = ( cos c - cos a cos b ) / sin a sin b

	---------------------------------------------------------------------------------------------------------------
	*/

	function myGetSummitFromArcArcArc ( arc1, arc2, oppositeArc ) {
		return Math.acos (
			( Math.cos ( oppositeArc ) - ( Math.cos ( arc1 ) * Math.cos ( arc2 ) ) ) /
			( Math.sin ( arc1 ) * Math.sin ( arc2 ) )
		);
	}

	/*
	--- myAddManeuver function ------------------------------------------------------------------------------------

	---------------------------------------------------------------------------------------------------------------
	*/

	function myAddManeuver ( itineraryPointObjId, position ) {
		let maneuver = window.L.travelNotes.maneuver;

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

	/*
	--- myAddItineraryPoint function ------------------------------------------------------------------------------

	---------------------------------------------------------------------------------------------------------------
	*/

	function myAddItineraryPoint ( latLng ) {
		let itineraryPoint = window.L.travelNotes.itineraryPoint;
		itineraryPoint.latLng = latLng;
		myRoute.itinerary.itineraryPoints.add ( itineraryPoint );
		return itineraryPoint.objId;
	}

	/*
	--- myAddIntermediateItineraryPoints function -----------------------------------------------------------------

	---------------------------------------------------------------------------------------------------------------
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
		let angularDistance = myGetArcFromSummitArcArc (
			latLngEndPoint [ LNG ] - latLngStartPoint [ LNG ],
			HALF_PI - latLngStartPoint [ LAT ],
			HALF_PI - latLngEndPoint [ LAT ]
		);

		if ( MIN_ANGULAR_DISTANCE > angularDistance * RADIANS_TO_DEGREE ) {
			return;
		}

		// and the direction at the start point
		let direction = myGetSummitFromArcArcArc (
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
			let tmpArc = myGetArcFromSummitArcArc (
				direction,
				HALF_PI - latLngStartPoint [ LAT ],
				partialDistance
			);

			// computing the lng
			let deltaLng = myGetSummitFromArcArcArc (
				HALF_PI - latLngStartPoint [ LAT ],
				tmpArc,
				partialDistance
			);

			// adding the itinerary point to a tmp array
			let itineraryPoint = window.L.travelNotes.itineraryPoint;
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

	/*
	--- myParseGreatCircle function -------------------------------------------------------------------------------

	---------------------------------------------------------------------------------------------------------------
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

	/*
	--- myParseCircle function ------------------------------------------------------------------------------------

	This function ...

	---------------------------------------------------------------------------------------------------------------
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

		let angularDistance = myGetArcFromSummitArcArc (
			centerPoint [ LNG ] - distancePoint [ LNG ],
			HALF_PI - centerPoint [ LAT ],
			HALF_PI - distancePoint [ LAT ]
		);

		let addedSegments = 360;
		let itineraryPoints = [];

		// loop to compute the added segments
		for ( let counter = 0; counter <= addedSegments; counter ++ ) {

			let direction = ( Math.PI / ( TWO * addedSegments ) ) + ( ( Math.PI * counter ) / addedSegments );

			let tmpArc = myGetArcFromSummitArcArc (
				direction,
				angularDistance,
				HALF_PI - centerPoint [ LAT ]
			);

			let deltaLng = myGetSummitFromArcArcArc (
				HALF_PI - centerPoint [ LAT ],
				tmpArc,
				angularDistance
			);
			let itineraryPoint = window.L.travelNotes.itineraryPoint;
			itineraryPoint.latLng = [
				( HALF_PI - tmpArc ) * RADIANS_TO_DEGREE,
				( centerPoint [ LNG ] + deltaLng ) * RADIANS_TO_DEGREE
			];
			itineraryPoints.push ( itineraryPoint );

			itineraryPoint = window.L.travelNotes.itineraryPoint;
			itineraryPoint.latLng = [
				( HALF_PI - tmpArc ) * RADIANS_TO_DEGREE,
				( centerPoint [ LNG ] - deltaLng ) * RADIANS_TO_DEGREE
			];
			itineraryPoints.unshift ( itineraryPoint );
			if ( counter === addedSegments ) {
				myAddManeuver ( itineraryPoint.objId, 'kStart' );
				itineraryPoint = window.L.travelNotes.itineraryPoint;
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

	/*
	--- myParseResponse function ----------------------------------------------------------------------------------

	This function ...

	---------------------------------------------------------------------------------------------------------------
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

	/*
	--- myGetPromiseRoute function --------------------------------------------------------------------------------

	This function ...

	---------------------------------------------------------------------------------------------------------------
	*/

	function myGetPromiseRoute ( route ) {
		myRoute = route;
		return new Promise ( myParseResponse );
	}

	/*
	--- PolylineRouteProvider object function ---------------------------------------------------------------------

	This function ...

	---------------------------------------------------------------------------------------------------------------
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

window.L.travelNotes.addProvider ( newPolylineRouteProvider ( ) );