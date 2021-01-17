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

@file GraphHopperRouteProvider.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module GraphHopperRouteProvider
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { thePolylineEncoder } from '../util/PolylineEncoder.js';
import { ZERO, LAT_LNG, HTTP_STATUS_OK } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewGraphHopperRouteProvider
@desc constructor for GraphHopperRouteProvider object
@return {GraphHopperRouteProvider} an instance of GraphHopperRouteProvider object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewGraphHopperRouteProvider ( ) {

	const GRAPHHOPPER_LAT_LNG_ROUND = 5;
	const FOUR = 4;
	const METERS_IN_KILOMETERS = 1000;

	const LAT = 0;
	const LNG = 1;
	const ELEV = 2;

	let myProviderKey = '';
	let myUserLanguage = 'fr';
	let myRoute = null;

	let myIconList =
	[
		'kUndefined',
		'kTurnSharpLeft', // TURN_SHARP_LEFT = -3
		'kTurnLeft', // TURN_LEFT = -2
		'kTurnSlightLeft', // TURN_SLIGHT_LEFT = -1
		'kContinueStraight', // CONTINUE_ON_STREET = 0
		'kTurnSlightRight', // TURN_SLIGHT_RIGHT = 1
		'kTurnRight', // TURN_RIGHT = 2
		'kTurnSharpRight', // TURN_SHARP_RIGHT = 3
		'kArriveDefault', // FINISH = 4
		'kArriveDefault', // VIA_REACHED = 5
		'kRoundaboutRight' // USE_ROUNDABOUT = 6
	];

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myParseResponse
	@desc parse the response from the provider and add the received itinerary to the myRoute itinerary
	@param {Object} response the itinerary received from the provider
	@param {function} returnOnOk a function to call when the response is parsed correctly
	@param {function} returnOnError a function to call when an error occurs
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myParseResponse ( response, returnOnOk, returnOnError ) {

		if ( ZERO === response.paths.length ) {
			returnOnError ( 'Route not found' );
		}

		myRoute.itinerary.itineraryPoints.removeAll ( );
		myRoute.itinerary.maneuvers.removeAll ( );
		myRoute.itinerary.hasProfile = true;
		myRoute.itinerary.ascent = ZERO;
		myRoute.itinerary.descent = ZERO;
		response.paths.forEach (
			path => {
				path.points = thePolylineEncoder.decode ( path.points, GRAPHHOPPER_LAT_LNG_ROUND, true );
				/* eslint-disable-next-line camelcase */
				path.snapped_waypoints = thePolylineEncoder.decode ( path.snapped_waypoints, GRAPHHOPPER_LAT_LNG_ROUND, true );
				let itineraryPoints = [];
				for ( let pointsCounter = ZERO; pointsCounter < path.points.length; pointsCounter ++ ) {
					let itineraryPoint = window.TaN.itineraryPoint;
					itineraryPoint.lat = path.points [ pointsCounter ] [ LAT ];
					itineraryPoint.lng = path.points [ pointsCounter ] [ LNG ];
					itineraryPoint.elev = path.points [ pointsCounter ] [ ELEV ];
					itineraryPoints.push ( itineraryPoint );
					myRoute.itinerary.itineraryPoints.add ( itineraryPoint );
				}

				let previousIconName = '';
				path.instructions.forEach (
					instruction => {
						let maneuver = window.TaN.maneuver;
						maneuver.iconName = myIconList [ instruction.sign + FOUR || ZERO ];
						if ( 'kArriveDefault' === previousIconName && 'kContinueStraight' === maneuver.iconName ) {
							maneuver.iconName = 'kDepartDefault';
						}
						previousIconName = maneuver.iconName;
						maneuver.instruction = instruction.text || '';
						maneuver.duration = instruction.time / METERS_IN_KILOMETERS;
						maneuver.distance = instruction.distance;
						maneuver.itineraryPointObjId = itineraryPoints [ instruction.interval [ ZERO ] ].objId;
						myRoute.itinerary.maneuvers.add ( maneuver );

					}
				);

				let wayPointsIterator = myRoute.wayPoints.iterator;
				path.snapped_waypoints.forEach (
					latLngElev => {
						if ( ! wayPointsIterator.done ) {
							wayPointsIterator.value.lat = latLngElev [ LAT ];
							wayPointsIterator.value.lng = latLngElev [ LNG ];
						}
					}
				);
			}
		);

		returnOnOk ( myRoute );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myGetUrl
	@desc gives the url to call
	@return {string} a string with the url, wayPoints, transitMode, user language and API key
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myGetUrl ( ) {
		let wayPointsString = null;
		myRoute.wayPoints.forEach (
			wayPoint => {
				wayPointsString = wayPointsString ? wayPointsString + '&' : '';
				wayPointsString +=
					'point=' +
					wayPoint.lat.toFixed ( LAT_LNG.fixed ) + ',' +
					wayPoint.lng.toFixed ( LAT_LNG.fixed );
			}
		);

		let vehicle = '';
		switch ( myRoute.itinerary.transitMode ) {
		case 'bike' :
			vehicle = 'bike';
			break;
		case 'pedestrian' :
			vehicle = 'foot';
			break;
		case 'car' :
			vehicle = 'car';
			break;
		default :
			break;
		}

		return 'https://graphhopper.com/api/1/route?' + wayPointsString +
			'&instructions=true&elevation=true&type=json&key=' + myProviderKey + '&locale=' + myUserLanguage +
			'&vehicle=' + vehicle;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myGetRoute
	@desc call the provider, wait for the response and then parse the provider response
	@param {function} onOk a function to pass to the myParseResponse
	@param {function} onError a function to pass to myParseResponse or to call when an error occurs
	@private

	@--------------------------------------------------------------------------------------------------------------------------
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

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myGetPromiseRoute
	@desc call the provider, wait for the response and then parse the provider response into the route itinerary object
	@param {route} route a Route object with at least two WayPoints completed
	@return a Promise completed with a function that call the provider, wait the response and then will parse the response
	in the route itinerary
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myGetPromiseRoute ( route ) {

		myRoute = route;
		return new Promise ( myGetRoute );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class GraphHopperRouteProvider
	@classdesc This class implements the Provider interface for Graphhopper. It's not possible to instanciate
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
					RJTUUH4AocDyYTxtPEYwAABGtJREFUSMedVU1MXFUUPue+9+bNAMMUZrCFVAsiDEGpJlpdtCY0sTU1xIA1QNSNIcYGuyAuxBp1oU\
					1DYu2iNlKsJopVYy2lkpiyoCCptLWF1DKFkpb/YShvmBmYX97/dUECw5sBpj2r97577pdzv3vud/BLzw8XF3s5ZGG9QAQA0CggAE\
					GgFDYLRVffsu/HUlcNAyQ5J0NApzGXXxwLKvNLhCNcbrqlNJvfYaWavjE7hyzLIUuTFYIskd2RByduRfu9im9pBed3ZG79oCzr9Q\
					KqrMtOgXLIrquDOBqcONQjeyIGXJoKTX/URyUtu6aIStoGhZOk4mpBeeL97kTelXB/dj3QPoYseThq5HD6yFV5Npq4xMadcvZof8\
					zlRwZTpUYTE7w0Fb4ya8CLi4vb2toGBgZ6enpqa2sBQAvLvtYRLaauR52gNaW+s/cMWGFhYUdHh9PpXP4tLy/Pz89vamqSugXze7\
					r8JJMCNcGl4YDkDq/BCGloaHA6nVPy3GnvhZvRYQdrq/n0QFrzqVgw8sQV03gh6lTfRBBEEO8F1YAYD9rt9sP1hyflB4cmm9oDPY\
					Lsd8XGjkyfsrxgB4DB367tztipUHUTaqqDNBMxNGxlZSUQOOO96JG9PDERJCwyZjSpqAPAqGd898xTKtE2o1Z1bUE0ZFRUVLiptz\
					96FyC+GVAcCy5/3fnr5nO2Ei1BE2K4w8Q3VlJSMhpzT8tzGHclakCUJkLLf5c6O19z7EnUhBhMg8ngDBnhaOSuOBlvBsTC+n9d7a\
					KhoaFnYAcibkjNoml7BqzNOd92PsyKqzsJKt6Y7+eRlQRZlsNTC9t4OwW6vtYULE9ncw5LPPj18eOuvluEEkAABH1Jnfn8XzUsx+\
					f4Zrx55hy6UV/rNG2nw7onN9A+vmq+kvLLmydyDjotpVm6rC92TkWuzxnOHvWHHivNAqDxV218jVSneY3PZ4+yo664N7lE58+ObO\
					T9MdnGWuka5kR70qmeTvb9/u6B8lch5WCBSSPmzTwEgAWmV/3vWPsnb5w72NxyWhAERVEopQzD8DwviqIgCIYtNmtmAOQU/BqARe\
					bY7I+Z7xQODAy4+m/3Xv67u6v7Wt9V1+3B6urqxPxtubmJNoLP3nk76QBbHkIFfN5e264XM0rzTA4GiFvwvOJ8ORQJGZIDiwsnY2\
					1/+LoYJMt704h53QGGgCrV7ovu+6L7O+HC8rQUml2JvEVFRVm2LYvBEKYiSLKZgap/Sfh2MHGlvr4+CpJXCcDaB5kqNTEznqP9VD\
					VKl5OTU1dXJ8i+McnziFVTSdtaXwZ5vAFvaWmxWq03wsMLagjhkaqmGiX56Sdv/PTxh422TBvP8w6Ho7W1taqqSqHKGV+7CblUOy\
					RpZLOZXxU3lGkF8x5he/7jAKBQ9YvZ78/5u8yEj++uNGLGUlcNC0yK1DpQC5r2btm13/ZSHueYleb/XOi9HOpnkVnbuGBCBhvd33\
					Qs/MMhAw8TPHIssirVJConsRSq1tr3/Q+O4QqEHeMWIQAAAABJRU5ErkJggg==';
		},
		get name ( ) { return 'GraphHopper'; },
		get transitModes ( ) { return { car : true, bike : true, pedestrian : true, train : false }; },
		get providerKeyNeeded ( ) { return true; },

		get providerKey ( ) { return myProviderKey.length; },
		set providerKey ( ProviderKey ) { myProviderKey = ProviderKey; },

		get userLanguage ( ) { return myUserLanguage; },
		set userLanguage ( UserLanguage ) { myUserLanguage = UserLanguage; }

	};
}

window.TaN.addProvider ( ourNewGraphHopperRouteProvider ( ) );

/*
--- End of GraphHopperRouteProvider.js file -----------------------------------------------------------------------------------
*/