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
/*
Changes:
	- v2.1.0:
		- issue #150 : Merge travelNotes and plugins
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file MapboxRouteProvider.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module MapboxRouteProvider
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { thePolylineEncoder } from '../util/PolylineEncoder.js';
import { theOsrmTextInstructions } from '../routeProviders/OsrmTextInstructions.js';
import { ICON_LIST } from '../routeProviders/IconList.js';
import { ZERO, ONE, TWO, LAT_LNG, HTTP_STATUS_OK } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewMapboxRouteProvider
@desc constructor for MapboxRouteProvider object
@return {MapboxRouteProvider} an instance of MapboxRouteProvider object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewMapboxRouteProvider ( ) {

	const MAPBOX_LAT_LNG_ROUND = 6;

	let myProviderKey = '';
	let myUserLanguage = 'fr';
	let myRoute = null;

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

		if ( 'Ok' !== response.code ) {
			returnOnError ( new Error ( 'Response code not ok' ) );
		}

		if ( ZERO === response.routes.length ) {
			returnOnError ( new Error ( 'Route not found' ) );
		}

		myRoute.itinerary.itineraryPoints.removeAll ( );
		myRoute.itinerary.maneuvers.removeAll ( );
		myRoute.itinerary.hasProfile = false;
		myRoute.itinerary.ascent = ZERO;
		myRoute.itinerary.descent = ZERO;
		response.routes [ ZERO ].geometry =
			thePolylineEncoder.decode ( response.routes [ ZERO ].geometry, [ MAPBOX_LAT_LNG_ROUND, MAPBOX_LAT_LNG_ROUND ] );
		response.routes [ ZERO ].legs.forEach (
			function ( leg ) {
				let lastPointWithDistance = ZERO;
				leg.steps.forEach (
					function ( step ) {
						step.geometry = thePolylineEncoder.decode (
							step.geometry,
							[ MAPBOX_LAT_LNG_ROUND, MAPBOX_LAT_LNG_ROUND ]
						);
						if (
							'arrive' === step.maneuver.type
							&&
							TWO === step.geometry.length
							&&
							step.geometry [ ZERO ] [ ZERO ] === step.geometry [ ONE ] [ ZERO ]
							&&
							step.geometry [ ZERO ] [ ONE ] === step.geometry [ ONE ] [ ONE ]
						) {
							step.geometry.pop ( );
						}

						let maneuver = window.TaN.maneuver;
						maneuver.iconName =
							ICON_LIST [ step.maneuver.type ]
								?
								ICON_LIST [ step.maneuver.type ] [ step.maneuver.modifier ]
								||
								ICON_LIST [ step.maneuver.type ] [ 'default' ]
								:
								ICON_LIST [ 'default' ] [ 'default' ];

						maneuver.instruction = theOsrmTextInstructions.compile ( myUserLanguage, step );
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
							myRoute.itinerary.itineraryPoints.add ( itineraryPoint );
							if ( geometryCounter !== step.geometry.length - ONE ) {
								distance += itineraryPoint.distance;
								lastPointWithDistance ++;
							}
							if ( ZERO === geometryCounter ) {
								maneuver.itineraryPointObjId = itineraryPoint.objId;
							}
						}
						maneuver.distance = distance;
						myRoute.itinerary.maneuvers.add ( maneuver );
					}
				);
			}
		);

		let wayPointsIterator = myRoute.wayPoints.iterator;
		response.waypoints.forEach (
			function ( wayPoint ) {
				if ( ! wayPointsIterator.done ) {
					wayPointsIterator.value.latLng = [ wayPoint.location [ ONE ], wayPoint.location [ ZERO ] ];
				}
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
				wayPointsString = wayPointsString ? wayPointsString + ';' : '';
				wayPointsString +=
					wayPoint.lng.toFixed ( LAT_LNG.fixed ) + ',' +
					wayPoint.lat.toFixed ( LAT_LNG.fixed );
			}
		);

		let profile = '';
		switch ( myRoute.itinerary.transitMode ) {
		case 'car' :
			profile = 'mapbox/driving/';
			break;
		case 'bike' :
			profile = 'mapbox/cycling/';
			break;
		case 'pedestrian' :
			profile = 'mapbox/walking/';
			break;
		default :
			return;
		}
		return 'https://api.mapbox.com/directions/v5/' +
			profile +
			wayPointsString +
			'?geometries=polyline6&overview=full&steps=true&annotations=distance&access_token=' +
			myProviderKey;
	}

	/*
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

	@class MapboxRouteProvider
	@classdesc This class implements the Provider interface for Mapbox. It's not possible to instanciate
	this class because the class is not exported from the module. Only one instance is created and added to the list
	of Providers of TravelNotes
	@see Provider for a description of methods
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	return {

		getPromiseRoute : route => myGetPromiseRoute ( route ),
		get icon ( ) {
			return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWX\
					MAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AocEwcBrMn63AAAAk1JREFUSMftlj9oU1EUxn8neQ0thE6lgpO1TiptHhShJiIu2qHJA6\
					FudtBRUBcpouJUnRyqgpODVcG62LROHfzHexGiJWkEQbCr0IqVYKPStDkOpuYRfW1eTNCh33Tvufec717udz8ObOFfITqV3XA9Nj\
					n3W+xAMuO7pnhs7AQiwCqwpvBNVN47Vu8SQDSZwbFMqsexyUyHinQjtAEBwACyTiKyWM1heBzyMHDXdbplRCeiyexVCei8HTfpf5\
					gCwLFM9k/lEF3bpSIXgWNAm6vWceBercQrVfMwcBKhvVRcOwEst2zbXlldXQljGFeAoRpqbUjshSExgo9iM6kHLw7uUIDYTEr0ez\
					DuQeoJw7/8ZLRUCD/ZNz6/AFAqFDolWBr1WyVQh/C7JKgj6eFu0sPdSFBHgC6/RWq7sbCI0g60/gzoqWhy7v762LXzC/AR2NmQG6\
					tyE3jnCoUQHUN0DAi54m+BGw27sUAGyAOjZYUD9Fdty4vqLRX51Mg3bnUSkevAm6rc9XwFXtuWeafyHI0hDgCI6AXg8x/WlwTO+6\
					npS9V23HwKJMtW+ss+FCbsRORVU79TMdByFlhwhT60hELnmvqP+6dzpAf35BG9DBSBoqheej6w+2vsca55xC/jPei04sTN20AKsG\
					3LHN87cg17sKe5ztXHbFnHclrgDEDHwFGa41wuzMb7iCbncKzeHEBsKsuzQ74dsy6vxrF6K0pPROrqdOoibgT+O+LQJvONUFOul7\
					hmgCNlhzKArA/i+nK92tvN2t6/zd1C0/ADiOy3l0UZHxAAAAAASUVORK5CYII=';
		},
		get name ( ) { return 'Mapbox'; },

		get transitModes ( ) { return { car : true, bike : true, pedestrian : true, train : false }; },
		get providerKeyNeeded ( ) { return true; },

		get providerKey ( ) { return myProviderKey.length; },
		set providerKey ( ProviderKey ) { myProviderKey = ProviderKey; },

		get userLanguage ( ) { return myUserLanguage; },
		set userLanguage ( UserLanguage ) {
			myUserLanguage = theOsrmTextInstructions.loadLanguage ( UserLanguage );
		}
	};
}

window.TaN.addProvider ( ourNewMapboxRouteProvider ( ) );

/*
--- End of MapboxRouteProvider.js file ----------------------------------------------------------------------------------------
*/