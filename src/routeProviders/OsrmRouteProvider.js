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

@file OsrmRouteProvider.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module OsrmRouteProvider
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { thePolylineEncoder } from '../util/PolylineEncoder.js';
import { theOsrmTextInstructions } from '../routeProviders/OsrmTextInstructions.js';
import { ICON_LIST } from '../routeProviders/IconList.js';
import { ZERO, ONE, LAT_LNG, HTTP_STATUS_OK } from '../util/Constants.js';

const OUR_OSRM_ROUTE_LAT_LNG_ROUND = 6;

let ourUserLanguage = 'fr';
let ourRoute = null;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourParseResponse
@desc parse the response from the provider and add the received itinerary to the ourRoute itinerary
@param {Object} response the itinerary received from the provider
@param {function} onOk a function to call when the response is parsed correctly
@param {function} onError a function to call when an error occurs
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourParseResponse ( response, onOk, onError ) {

	if ( 'Ok' !== response.code ) {
		onError ( new Error ( 'Response code not ok' ) );
		return;
	}

	if ( ZERO === response.routes.length ) {
		onError ( new Error ( 'Route not found' ) );
		return;
	}

	ourRoute.itinerary.itineraryPoints.removeAll ( );
	ourRoute.itinerary.maneuvers.removeAll ( );
	ourRoute.itinerary.hasProfile = false;
	ourRoute.itinerary.ascent = ZERO;
	ourRoute.itinerary.descent = ZERO;

	response.routes [ ZERO ].geometry = thePolylineEncoder.decode (
		response.routes [ ZERO ].geometry,
		[ OUR_OSRM_ROUTE_LAT_LNG_ROUND, OUR_OSRM_ROUTE_LAT_LNG_ROUND ]
	);

	response.routes [ ZERO ].legs.forEach (
		function ( leg ) {
			let lastPointWithDistance = ZERO;
			leg.steps.forEach (
				function ( step ) {
					step.geometry = thePolylineEncoder.decode (
						step.geometry,
						[ OUR_OSRM_ROUTE_LAT_LNG_ROUND, OUR_OSRM_ROUTE_LAT_LNG_ROUND ]
					);
					let maneuver = window.TaN.maneuver;
					maneuver.iconName =
						ICON_LIST [ step.maneuver.type ]
							?
							ICON_LIST [ step.maneuver.type ] [ step.maneuver.modifier ]
							||
							ICON_LIST [ step.maneuver.type ] [ 'default' ]
							:
							ICON_LIST [ 'default' ] [ 'default' ];

					maneuver.instruction = theOsrmTextInstructions.compile ( ourUserLanguage, step );
					maneuver.duration = step.duration;
					let distance = ZERO;
					for (
						let geometryCounter = ZERO;
						( ONE === step.geometry.length )
							?
							( ONE > geometryCounter )
							:
							( geometryCounter < step.geometry.length );
						geometryCounter ++ ) {
						let itineraryPoint = window.TaN.itineraryPoint;
						itineraryPoint.latLng = [
							step.geometry [ geometryCounter ] [ ZERO ],
							step.geometry [ geometryCounter ] [ ONE ]
						];

						itineraryPoint.distance =
							leg.annotation.distance [ lastPointWithDistance ]
								?
								leg.annotation.distance [ lastPointWithDistance ]
								:
								ZERO;
						ourRoute.itinerary.itineraryPoints.add ( itineraryPoint );
						if ( geometryCounter !== step.geometry.length - ONE ) {
							distance += itineraryPoint.distance;
							lastPointWithDistance ++;
						}
						if ( ZERO === geometryCounter ) {
							maneuver.itineraryPointObjId = itineraryPoint.objId;
						}
					}
					maneuver.distance = distance;
					ourRoute.itinerary.maneuvers.add ( maneuver );
				}
			);
		}
	);

	let wayPointsIterator = ourRoute.wayPoints.iterator;
	response.waypoints.forEach (
		function ( wayPoint ) {
			if ( ! wayPointsIterator.done ) {
				wayPointsIterator.value.latLng = [ wayPoint.location [ ONE ], wayPoint.location [ ZERO ] ];
			}
		}
	);

	onOk ( ourRoute );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetUrl
@desc gives the url to call
@return {string} a string with the url, wayPoints, transitMode, user language and API key
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetUrl ( ) {

	let wayPointsString = null;
	ourRoute.wayPoints.forEach (
		wayPoint => {
			wayPointsString = wayPointsString ? wayPointsString + ';' : '';
			wayPointsString +=
				wayPoint.lng.toFixed ( LAT_LNG.fixed ) + ',' +
				wayPoint.lat.toFixed ( LAT_LNG.fixed );
		}
	);

	// openstreetmap.de server
	let transitModeString = '';
	switch ( ourRoute.itinerary.transitMode ) {
	case 'car' :
		transitModeString = 'routed-car';
		break;
	case 'bike' :
		transitModeString = 'routed-bike';
		break;
	case 'pedestrian' :
		transitModeString = 'routed-foot';
		break;
	default :
		return;
	}
	return 'https://routing.openstreetmap.de/' +
		transitModeString +
		'/route/v1/driving/' +
		wayPointsString +
		'?geometries=polyline6&overview=full&steps=true&annotations=distance';
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetRoute
@desc call the provider, wait for the response and then parse the provider response
@param {function} onOk a function to pass to the ourParseResponse
@param {function} onError a function to pass to ourParseResponse or to call when an error occurs
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetRoute ( onOk, onError ) {
	fetch ( ourGetUrl ( ) )
		.then (
			response => {
				if ( HTTP_STATUS_OK === response.status && response.ok ) {
					response.json ( )
						.then ( result => ourParseResponse ( result, onOk, onError ) );
				}
				else {
					onError ( new Error ( 'Invalid status ' + response.status ) );
				}
			}
		);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetPromiseRoute
@desc call the provider, wait for the response and then parse the provider response into the route itinerary object
@param {route} route a Route object with at least two WayPoints completed
@return a Promise completed with a function that call the provider, wait the response and then will parse the response
in the route itinerary
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetPromiseRoute ( route ) {
	ourRoute = route;
	return new Promise ( ourGetRoute );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class OsrmRouteProvider
@classdesc This class implements the Provider interface for Osrm. It's not possible to instanciate
this class because the class is not exported from the module. Only one instance is created and added to the list
of Providers of TravelNotes
@see Provider for a description of methods
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class OsrmRouteProvider {

	constructor ( ) {
		Object.freeze ( this );
	}

	getPromiseRoute ( route ) { return ourGetPromiseRoute ( route ); }

	get icon ( ) {
		return 'data:image/png;base64,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';
	}

	get name ( ) { return 'OSRM'; }

	get title ( ) { return 'OSRM'; }

	get transitModes ( ) { return { car : true, bike : true, pedestrian : true, train : false }; }

	get providerKeyNeeded ( ) { return false; }

	get providerKey ( ) { return ONE; }
	set providerKey ( ProviderKey ) { }

	get userLanguage ( ) { return ourUserLanguage; }
	set userLanguage ( UserLanguage ) {
		ourUserLanguage = theOsrmTextInstructions.loadLanguage ( UserLanguage );
	}
}

window.TaN.addProvider ( new OsrmRouteProvider ( ) );

/*
--- End of OsrmRouteProvider.js file ------------------------------------------------------------------------------------------
*/