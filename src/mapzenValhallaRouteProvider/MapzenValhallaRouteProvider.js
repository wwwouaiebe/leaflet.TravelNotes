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

import { polyline } from '../polyline/Polyline.js';
import { ZERO, HTTP_STATUS_OK } from '../util/Constants.js';

function newMapzenValhallaRouteProvider ( ) {

	const MAPZEN_LAT_LNG_ROUND = 6;

	let myProviderKey = '';
	let myUserLanguage = 'fr';
	let myRoute = null;

	let myIconList = [
		'kUndefined', // kNone = 0;
		'kDepartDefault', // kStart = 1;
		'kDepartRight', // kStartRight = 2;
		'kDepartLeft', // kStartLeft = 3;
		'kArriveDefault', // kDestination = 4;
		'kArriveRight', // kDestinationRight = 5;
		'kArriveLeft', // kDestinationLeft = 6;
		'kNewNameStraight', // kBecomes = 7;
		'kContinueStraight', // kContinue = 8;
		'kTurnSlightRight', // kSlightRight = 9;
		'kTurnRight', // kRight = 10;
		'kTurnSharpRight', // kSharpRight = 11;
		'kUturnRight', // kUturnRight = 12;
		'kUturnLeft', // kUturnLeft = 13;
		'kTurnSharpLeft', // kSharpLeft = 14;
		'kTurnLeft', // kLeft = 15;
		'kTurnSlightLeft', // kSlightLeft = 16;
		'kUndefined', // kRampStraight = 17;
		'kOnRampRight', // kRampRight = 18;
		'kOnRampLeft', // kRampLeft = 19;
		'kOffRampRight', // kExitRight = 20;
		'kOffRampLeft', // kExitLeft = 21;
		'kStayStraight', // kStayStraight = 22;
		'kStayRight', // kStayRight = 23;
		'kStayLeft', // kStayLeft = 24;
		'kMergeDefault', // kMerge = 25;
		'kRoundaboutRight', // kRoundaboutEnter = 26;
		'kRoundaboutExit', // kRoundaboutExit = 27;
		'kFerryEnter', // kFerryEnter = 28;
		'kFerryExit', // kFerryExit = 29;
		'kUndefined', // kTransit = 30;
		'kUndefined', // kTransitTransfer = 31;
		'kUndefined', // kTransitRemainOn = 32;
		'kUndefined', // kTransitConnectionStart = 33;
		'kUndefined', // kTransitConnectionTransfer = 34;
		'kUndefined', // kTransitConnectionDestination = 35;
		'kUndefined' // kPostTransitConnectionDestination = 36;
	];

	/*
	--- myParseResponse function --------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myParseResponse ( response, returnOnOk, returnOnError ) {

		const M_IN_KM = 1000;

		if ( ZERO === response.trip.legs.length ) {
			returnOnError ( 'Route not found' );
		}

		myRoute.itinerary.itineraryPoints.removeAll ( );
		myRoute.itinerary.maneuvers.removeAll ( );

		response.trip.legs.forEach (
			leg => {
				leg.shape = polyline.decode ( leg.shape, MAPZEN_LAT_LNG_ROUND, false );
				let itineraryPoints = [];
				for ( let shapePointCounter = ZERO; shapePointCounter < leg.shape.length; shapePointCounter ++ ) {
					let itineraryPoint = window.L.travelNotes.itineraryPoint;
					itineraryPoint.latLng = leg.shape [ shapePointCounter ];
					itineraryPoints.push ( itineraryPoint );
					myRoute.itinerary.itineraryPoints.add ( itineraryPoint );
				}
				leg.maneuvers.forEach (
					mapzenManeuver => {
						let travelNotesManeuver = window.L.travelNotes.maneuver;
						travelNotesManeuver.iconName = myIconList [ mapzenManeuver.type || ZERO ];
						travelNotesManeuver.instruction = mapzenManeuver.instruction || '';
						travelNotesManeuver.distance = ( mapzenManeuver.length || ZERO ) * M_IN_KM;
						travelNotesManeuver.duration = mapzenManeuver.time || ZERO;
						travelNotesManeuver.itineraryPointObjId = itineraryPoints [ mapzenManeuver.begin_shape_index ].objId;
						myRoute.itinerary.maneuvers.add ( travelNotesManeuver );
					}
				);
			}
		);

		let wayPointsIterator = myRoute.wayPoints.iterator;
		response.trip.locations.forEach (
			curLocation => {
				if ( ! wayPointsIterator.done ) {
					wayPointsIterator.value.latLng = [ curLocation.lat, curLocation.lon ];
				}
			}
		);

		returnOnOk ( myRoute );
	}

	/*
	--- myGetUrl function ---------------------------------------------------------------------------------------------

	This function ...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetUrl ( ) {

		let request = {
			locations : [],
			costing : '',
			directions_options : { language : myUserLanguage },  // eslint-disable-line
			costing_options : {} // eslint-disable-line
		};

		let wayPointsIterator = myRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			request.locations.push (
				{
					lat : wayPointsIterator.value.lat,
					lon : wayPointsIterator.value.lng,
					type : wayPointsIterator.first || wayPointsIterator.last ? 'break' : 'through'
				}
			);
		}

		const MANEUVER_PENALTY = 30;
		switch ( myRoute.itinerary.transitMode ) {
		case 'bike' :
			request.costing = 'bicycle';
			request.costing_options = {  // eslint-disable-line
				bicycle : {
					maneuver_penalty : MANEUVER_PENALTY,  // eslint-disable-line
					bicycle_type : 'Cross',  // eslint-disable-line
					cycling_speed : '20.0',  // eslint-disable-line
					use_roads : '0.25',  // eslint-disable-line
					use_hills : '0.25'  // eslint-disable-line
				}
			};

			break;
		case 'pedestrian' :
			request.costing = 'pedestrian';
			request.costing_options = { pedestrian : { walking_speed : '4.0' } };  // eslint-disable-line
			break;
		case 'car' :
			request.costing = 'auto';
			request.costing_options = { auto : { country_crossing_cost : '60' } };  // eslint-disable-line
			break;
		default :
			break;
		}

		return 'https://api.stadiamaps.com/route?json=' + JSON.stringify ( request ) + '&api_key=' + myProviderKey;
	}

	/*
	--- myGetRoute function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetRoute ( onOk, onError ) {
		fetch ( myGetUrl ( ) )
			.then (
				response => {
					if ( HTTP_STATUS_OK === response.status && response.ok ) {
						response.json ( )
							.then ( result => myParseResponse ( result, onOk, onError ) );
					}
					else {
						onError ( new Error ( 'Invalid status ' + response.status ) );
					}
				}
			);
	}

	/*
	--- myGetPromiseRoute function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetPromiseRoute ( route ) {

		myRoute = route;
		return new Promise ( myGetRoute );
	}

	/*
	--- MapzenValhallaRouteProvider object ----------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return {

		getPromiseRoute : route => myGetPromiseRoute ( route ),
		get icon ( ) {
			return 'data:image/png;base64,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';
		},
		get name ( ) { return 'MapzenValhalla'; },
		get transitModes ( ) { return { car : true, bike : true, pedestrian : true, train : false }; },

		get providerKeyNeeded ( ) { return true; },

		get providerKey ( ) { return myProviderKey.length; },
		set providerKey ( ProviderKey ) { myProviderKey = ProviderKey; },

		get userLanguage ( ) { return myUserLanguage; },
		set userLanguage ( UserLanguage ) { myUserLanguage = UserLanguage; }
	};
}

window.L.travelNotes.addProvider ( newMapzenValhallaRouteProvider ( ) );