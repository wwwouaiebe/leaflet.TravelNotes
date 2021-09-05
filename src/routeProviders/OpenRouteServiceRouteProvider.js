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

@file OpenRouteServiceRouteProvider.js
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

import thePolylineEncoder from '../coreLib/PolylineEncoder.js';
import ItineraryPoint from '../data/ItineraryPoint.js';
import Maneuver from '../data/Maneuver.js';
import BaseRouteProvider from '../routeProviders/BaseRouteProvider.js';

import { ZERO, ONE, TWO, LAT, LNG, ELEVATION, LAT_LNG, HTTP_STATUS_OK } from '../main/Constants.js';

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

class OpenRouteServiceRouteProvider extends BaseRouteProvider {

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
	Parse the response from the provider and add the received itinerary to the route itinerary
	@param {Object} response the itinerary received from the provider
	@param {function} onOk a function to call when the response is parsed correctly
	@param {function} onError a function to call when an error occurs
	@private
	*/

	#parseResponse ( response, onOk, onError ) {

		if ( ! response.routes || ZERO === response.routes.length ) {
			onError ( new Error ( 'Route not found' ) );
			return;
		}
		response.routes [ ZERO ].geometry = thePolylineEncoder.decode (
			response.routes [ ZERO ].geometry,
			[ OUR_OPEN_ROUTE_LAT_LNG_ROUND, OUR_OPEN_ROUTE_LAT_LNG_ROUND, TWO ]
		);
		this.#route.itinerary.itineraryPoints.removeAll ( );
		this.#route.itinerary.maneuvers.removeAll ( );
		this.#route.itinerary.hasProfile = true;
		this.#route.itinerary.ascent = ZERO;
		this.#route.itinerary.descent = ZERO;

		let wayPointIndex = ZERO;
		let itineraryPoint = new ItineraryPoint ( );
		itineraryPoint.lat = response.routes [ ZERO ].geometry [ wayPointIndex ] [ LAT ];
		itineraryPoint.lng = response.routes [ ZERO ].geometry [ wayPointIndex ] [ LNG ];
		itineraryPoint.elev = response.routes [ ZERO ].geometry [ wayPointIndex ] [ ELEVATION ];
		this.#route.itinerary.itineraryPoints.add ( itineraryPoint );
		wayPointIndex ++;

		response.routes [ ZERO ].segments.forEach (
			segment => {
				segment.steps.forEach (
					step => {
						let maneuver = new Maneuver ( );
						maneuver.iconName = OUR_ICON_LIST [ step.type ] || 'kUndefined';
						maneuver.instruction = step.instruction;
						maneuver.duration = step.duration;
						maneuver.distance = step.distance;
						maneuver.itineraryPointObjId = this.#route.itinerary.itineraryPoints.last.objId;
						this.#route.itinerary.maneuvers.add ( maneuver );
						while ( wayPointIndex <= step.way_points [ ONE ] ) {
							if (
								itineraryPoint.lat !== response.routes [ ZERO ].geometry [ wayPointIndex ] [ LAT ]
								||
								itineraryPoint.lng !== response.routes [ ZERO ].geometry [ wayPointIndex ] [ LNG ]
							) {
								itineraryPoint = new ItineraryPoint ( );
								itineraryPoint.lat = response.routes [ ZERO ].geometry [ wayPointIndex ] [ LAT ];
								itineraryPoint.lng = response.routes [ ZERO ].geometry [ wayPointIndex ] [ LNG ];
								itineraryPoint.elev = response.routes [ ZERO ].geometry [ wayPointIndex ] [ ELEVATION ];
								this.#route.itinerary.itineraryPoints.add ( itineraryPoint );
							}
							wayPointIndex ++;
						}
					}
				);
			}
		);
		let wayPointsIterator = this.#route.wayPoints.iterator;
		response.routes [ ZERO ].way_points.forEach (
			wayPoint => {
				if ( ! wayPointsIterator.done ) {
					wayPointsIterator.value.latLng = response.routes [ ZERO ].geometry [ wayPoint ];
				}
			}
		);

		onOk ( this.#route );
	}

	/**
	Gives the url to call
	@return {string} a string with the url and transitMode
	@private
	*/

	#getUrl ( ) {
		let requestString = 'https://api.openrouteservice.org/v2/directions/';
		switch ( this.#route.itinerary.transitMode ) {
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
	Gives the request headers
	@return {Array.<object>} an with the needed request headers
	@private
	*/

	#getRequestHeaders ( ) {

		let orsHeaders = new Headers ( );
		orsHeaders.append ( 'Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8' );
		orsHeaders.append ( 'Content-Type', 'application/json' );
		orsHeaders.append ( 'Authorization', this.#providerKey );

		return orsHeaders;
	}

	/**
	Gives the options and wayPoints for the request body
	@return {string} a string with the wayPoint coordinates, elevation param and language in JSON format
	@private
	*/

	#getBody ( ) {
		let wayPointsString = null;
		this.#route.wayPoints.forEach (
			wayPoint => {
				wayPointsString = wayPointsString ? wayPointsString + ',' : '{"coordinates":[';
				wayPointsString +=
					'[' + wayPoint.lng.toFixed ( LAT_LNG.fixed ) +
					',' + wayPoint.lat.toFixed ( LAT_LNG.fixed ) + ']';
			}
		);
		wayPointsString += '],"elevation":"true","language":"' + this.userLanguage + '"}';

		return wayPointsString;

	}

	/**
	Implementation of the base class #getRoute ( )
	@private
	*/

	#getRoute ( onOk, onError ) {
		fetch ( this.#getUrl ( ), { method : 'POST', headers : this.#getRequestHeaders ( ), body : this.#getBody ( ) } )
			.then (
				response => {
					if ( HTTP_STATUS_OK === response.status && response.ok ) {
						response.json ( )
							.then ( result => this.#parseResponse ( result, onOk, onError ) );
					}
					else {
						onError ( new Error ( 'Invalid status ' + response.status ) );
					}
				}
			);
	}

	/*
	constructor
	*/

	constructor ( ) {
		super ( );
	}

	get icon ( ) {
		return '' +
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QAzwBfAF8OMuGdAAAACXBIWX' +
			'MAAA7DAAAOwwHHb6hkAAAAB3RJTUUH4QoBEgIhgj0YgQAAAmdJREFUSMftlk9LYlEYxn+WinqdaWga0owaa9RWFS2iTZt27YJu5K' +
			'4bFNSqFkFEcaHvUNAmUjdCGdQHqE8QGVGRY1BpOZEFGepo+WcW43WySWYZAz6rc5/3HH7nfR84XJV/ZCTPO6iKd1IFXAFXwP8/WP' +
			'3a0FutmEURQ2sr5PMkgkEi6+ukr64A6HS5SvZnUilSoRBht5v09TVVgoDF6eRDeztqg4FMPE48EODH5ibP0ejbHWvq6vg2O4umpo' +
			'bvskxAltHW1mKbn0drMpUADyQJvyRxubKC0W6naWwMgObxcT739nK5vMzhxARXHg+1PT20TE2VH7VZFKnW6Yj4fDzd3vIcjRLx+V' +
			'Dr9ZgGBv4alwqIn5wAoLNYADC2tQEg2O3kczke/X4OJInAwkJ5sHIoeXZW9JS1UnupvErFx44OAH5eXPzef34OQIMo4lhcRHA4/p' +
			'2x2mgEIJtMFj1lrdQUvcz68fiYcOE7tLpKy/Q0+sZGDE1N2ObmeNjfJ+x2k43F3u5YgVQLQtGrLgAziUQJ2D86yvnSErlMhiqNhs' +
			'zDAwDPd3cEZJmwx8NTwfvU1cXXycnyo44HAsV8FAk2GwCJ09PSfPN5Ynt7XHu9GO12zENDf4q5HPe7u5zMzBDx+QAwWK3lwTdbW2' +
			'TTacyiiNZkQltfj3lwkEwqxc329ptZ3e/skAyHqevrQ2syYZNlOl0uarq7IZcrZq40Vbz46z8QXXMzDaKIodBpMhgksrFBKhQqyf' +
			'ZAkopnvvT3YxkeJnZ4SHhtDYvTieBwoBYEsskkj0dHRLxesvF4eXDlra6AK+AKuAIup1+E4uxBnFG6zQAAAABJRU5ErkJggg==';
	}

	getPromiseRoute ( route ) {
		this.#route = route;
		return new Promise ( ( onOk, onError ) => this.#getRoute ( onOk, onError ) );
	}

	get name ( ) { return 'OpenRouteService'; }

	get title ( ) { return 'OpenRouteService'; }

	get transitModes ( ) { return [ 'bike', 'pedestrian', 'car' ]; }

	get providerKeyNeeded ( ) { return true; }

	get providerKey ( ) { return this.#providerKey.length; }
	set providerKey ( providerKey ) { this.#providerKey = providerKey; }

	get userLanguage ( ) { return this.#userLanguage; }
	set userLanguage ( userLanguage ) { this.#userLanguage = userLanguage; }
}

window.TaN.addProvider ( OpenRouteServiceRouteProvider );

/*
--- End of OpenRouteServiceRouteProvider.js file ------------------------------------------------------------------------------
*/