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

@file OpenRouteServiceRouteProvider.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module OpenRouteServiceRouteProvider
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { thePolylineEncoder } from '../util/PolylineEncoder.js';
import { ZERO, ONE, TWO, LAT, LNG, ELEVATION, LAT_LNG, HTTP_STATUS_OK } from '../util/Constants.js';

const OUR_OPEN_ROUTE_LAT_LNG_ROUND = 5;

const OUR_ICON_LIST = [
	'kTurnLeft',
	'kTurnRight',
	'kTurnSharpLeft',
	'kTurnSharpRight',
	'kTurnSlightLeft',
	'kTurnSlightRight',
	'kContinueStraight',
	'kRoundaboutRight',
	'kRoundaboutExit',
	'kUturnLeft',
	'kArriveDefault',
	'kDepartDefault',
	'kStayLeft',
	'kStayRight'
];

let ourProviderKey = '';
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

	if ( ! response.routes || ZERO === response.routes.length ) {
		onError ( new Error ( 'Route not found' ) );
		return;
	}
	response.routes [ ZERO ].geometry = thePolylineEncoder.decode (
		response.routes [ ZERO ].geometry,
		[ OUR_OPEN_ROUTE_LAT_LNG_ROUND, OUR_OPEN_ROUTE_LAT_LNG_ROUND, TWO ]
	);
	ourRoute.itinerary.itineraryPoints.removeAll ( );
	ourRoute.itinerary.maneuvers.removeAll ( );
	ourRoute.itinerary.hasProfile = true;
	ourRoute.itinerary.ascent = ZERO;
	ourRoute.itinerary.descent = ZERO;

	let wayPointIndex = ZERO;
	let itineraryPoint = window.TaN.itineraryPoint;
	itineraryPoint.lat = response.routes [ ZERO ].geometry [ wayPointIndex ] [ LAT ];
	itineraryPoint.lng = response.routes [ ZERO ].geometry [ wayPointIndex ] [ LNG ];
	itineraryPoint.elev = response.routes [ ZERO ].geometry [ wayPointIndex ] [ ELEVATION ];
	ourRoute.itinerary.itineraryPoints.add ( itineraryPoint );
	wayPointIndex ++;

	response.routes [ ZERO ].segments.forEach (
		function ( segment ) {
			segment.steps.forEach (
				function ( step ) {
					let maneuver = window.TaN.maneuver;
					maneuver.iconName = OUR_ICON_LIST [ step.type ] || 'kUndefined';
					maneuver.instruction = step.instruction;
					maneuver.duration = step.duration;
					maneuver.distance = step.distance;
					maneuver.itineraryPointObjId = ourRoute.itinerary.itineraryPoints.last.objId;
					ourRoute.itinerary.maneuvers.add ( maneuver );
					while ( wayPointIndex <= step.way_points [ ONE ] ) {
						if (
							itineraryPoint.lat !== response.routes [ ZERO ].geometry [ wayPointIndex ] [ LAT ]
							||
							itineraryPoint.lng !== response.routes [ ZERO ].geometry [ wayPointIndex ] [ LNG ]
						) {
							itineraryPoint = window.TaN.itineraryPoint;
							itineraryPoint.lat = response.routes [ ZERO ].geometry [ wayPointIndex ] [ LAT ];
							itineraryPoint.lng = response.routes [ ZERO ].geometry [ wayPointIndex ] [ LNG ];
							itineraryPoint.elev = response.routes [ ZERO ].geometry [ wayPointIndex ] [ ELEVATION ];
							ourRoute.itinerary.itineraryPoints.add ( itineraryPoint );
						}
						wayPointIndex ++;
					}
				}
			);
		}
	);
	let wayPointsIterator = ourRoute.wayPoints.iterator;
	response.routes [ ZERO ].way_points.forEach (
		function ( wayPoint ) {
			if ( ! wayPointsIterator.done ) {
				wayPointsIterator.value.latLng = response.routes [ ZERO ].geometry [ wayPoint ];
			}
		}
	);

	onOk ( ourRoute );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetBody
@desc gives the options and wayPoints for the request body
@return {string} a string with the wayPoint coordinates, elevation param and language in JSON format
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetBody ( ) {
	let wayPointsString = null;
	ourRoute.wayPoints.forEach (
		wayPoint => {
			wayPointsString = wayPointsString ? wayPointsString + ',' : '{"coordinates":[';
			wayPointsString +=
				'[' + wayPoint.lng.toFixed ( LAT_LNG.fixed ) +
				',' + wayPoint.lat.toFixed ( LAT_LNG.fixed ) + ']';
		}
	);
	wayPointsString += '],"elevation":"true","language":"' + ourUserLanguage + '"}';

	return wayPointsString;

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetUrl
@desc gives the url to call
@return {string} a string with the url and transitMode
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetUrl ( ) {
	let requestString = 'https://api.openrouteservice.org/v2/directions/';
	switch ( ourRoute.itinerary.transitMode ) {
	case 'car' :
		requestString += 'driving-car';
		break;
	case 'bike' :
		requestString += 'cycling-regular';
		break;
	case 'pedestrian' :
		requestString += 'foot-walking';
		break;
	default :
		return;
	}
	return requestString;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetRequestHeaders
@desc gives the request headers
@return {Array.<object>} an with the needed request headers
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetRequestHeaders ( ) {

	let orsHeaders = new Headers ( );
	orsHeaders.append ( 'Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8' );
	orsHeaders.append ( 'Content-Type', 'application/json' );
	orsHeaders.append ( 'Authorization', ourProviderKey );

	return orsHeaders;
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

	fetch ( ourGetUrl ( ), { method : 'POST', headers : ourGetRequestHeaders ( ), body : ourGetBody ( ) } )
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

@class OpenRouteServiceRouteProvider
@classdesc This class implements the Provider interface for OpenRouteService. It's not possible to instanciate
this class because the class is not exported from the module. Only one instance is created and added to the list
of Providers of TravelNotes
@see Provider for a description of methods
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class OpenRouteServiceRouteProvider {

	constructor ( ) {
		Object.freeze ( this );
	}

	getPromiseRoute ( route ) { return ourGetPromiseRoute ( route ); }

	get icon ( ) {
		return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QAzwBfAF8OMuGdAAAACXBIWX\
				MAAA7DAAAOwwHHb6hkAAAAB3RJTUUH4QoBEgIhgj0YgQAAAmdJREFUSMftlk9LYlEYxn+WinqdaWga0owaa9RWFS2iTZt27YJu5K\
				4bFNSqFkFEcaHvUNAmUjdCGdQHqE8QGVGRY1BpOZEFGepo+WcW43WySWYZAz6rc5/3HH7nfR84XJV/ZCTPO6iKd1IFXAFXwP8/WP\
				3a0FutmEURQ2sr5PMkgkEi6+ukr64A6HS5SvZnUilSoRBht5v09TVVgoDF6eRDeztqg4FMPE48EODH5ibP0ejbHWvq6vg2O4umpo\
				bvskxAltHW1mKbn0drMpUADyQJvyRxubKC0W6naWwMgObxcT739nK5vMzhxARXHg+1PT20TE2VH7VZFKnW6Yj4fDzd3vIcjRLx+V\
				Dr9ZgGBv4alwqIn5wAoLNYADC2tQEg2O3kczke/X4OJInAwkJ5sHIoeXZW9JS1UnupvErFx44OAH5eXPzef34OQIMo4lhcRHA4/p\
				2x2mgEIJtMFj1lrdQUvcz68fiYcOE7tLpKy/Q0+sZGDE1N2ObmeNjfJ+x2k43F3u5YgVQLQtGrLgAziUQJ2D86yvnSErlMhiqNhs\
				zDAwDPd3cEZJmwx8NTwfvU1cXXycnyo44HAsV8FAk2GwCJ09PSfPN5Ynt7XHu9GO12zENDf4q5HPe7u5zMzBDx+QAwWK3lwTdbW2\
				TTacyiiNZkQltfj3lwkEwqxc329ptZ3e/skAyHqevrQ2syYZNlOl0uarq7IZcrZq40Vbz46z8QXXMzDaKIodBpMhgksrFBKhQqyf\
				ZAkopnvvT3YxkeJnZ4SHhtDYvTieBwoBYEsskkj0dHRLxesvF4eXDlra6AK+AKuAIup1+E4uxBnFG6zQAAAABJRU5ErkJggg==';
	}

	get name ( ) { return 'OpenRouteService'; }

	get title ( ) { return 'OpenRouteService'; }

	get transitModes ( ) { return { car : true, bike : true, pedestrian : true, train : false }; }

	get providerKeyNeeded ( ) { return true; }

	get providerKey ( ) { return ourProviderKey.length; }
	set providerKey ( ProviderKey ) { ourProviderKey = ProviderKey; }

	get userLanguage ( ) { return ourUserLanguage; }
	set userLanguage ( UserLanguage ) { ourUserLanguage = UserLanguage; }
}

window.TaN.addProvider ( new OpenRouteServiceRouteProvider ( ) );

/*
--- End of OpenRouteServiceRouteProvider.js file ------------------------------------------------------------------------------
*/