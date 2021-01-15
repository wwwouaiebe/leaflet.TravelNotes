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

import { polyline } from '../polyline/Polyline.js';
import { osrmTextInstructions } from '../providersUtil/OsrmTextInstructions.js';
import { theIconList } from '../providersUtil/IconList.js';
import { ZERO, ONE, TWO } from '../util/Constants.js';

function newMapboxRouteProvider ( ) {

	const MY_POLYLINE_PRECISION = 6;
	const MY_LAT_LNG_ROUND = 6;

	let myProviderKey = '';
	let myUserLanguage = 'fr';
	let myRoute = null;

	/*
	--- myParseResponse function ----------------------------------------------------------------------------------

	---------------------------------------------------------------------------------------------------------------
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
			polyline.decode ( response.routes [ ZERO ].geometry, MY_POLYLINE_PRECISION );

		response.routes [ ZERO ].legs.forEach (
			function ( leg ) {
				let lastPointWithDistance = ZERO;
				leg.steps.forEach (
					function ( step ) {
						step.geometry = polyline.decode ( step.geometry, MY_POLYLINE_PRECISION );

						// bug Mapbox for car: geometry have 2 points for 'arrive' maneuver type
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

						let maneuver = window.L.travelNotes.maneuver;
						maneuver.iconName =
							theIconList [ step.maneuver.type ]
								?
								theIconList [ step.maneuver.type ] [ step.maneuver.modifier ]
								||
								theIconList [ step.maneuver.type ] [ 'default' ]
								:
								theIconList [ 'default' ] [ 'default' ];

						maneuver.instruction = osrmTextInstructions.compile ( myUserLanguage, step );
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
							let itineraryPoint = window.L.travelNotes.itineraryPoint;
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

	/*
	--- myGetUrl function -----------------------------------------------------------------------------------------

	---------------------------------------------------------------------------------------------------------------
	*/

	function myGetUrl ( ) {
		let wayPointsString = null;
		myRoute.wayPoints.forEach (
			wayPoint => {
				wayPointsString = wayPointsString ? wayPointsString + ';' : '';
				wayPointsString +=
					wayPoint.lng.toFixed ( MY_LAT_LNG_ROUND ) + ',' +
					wayPoint.lat.toFixed ( MY_LAT_LNG_ROUND );
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
			console.log ( 'invalid transitMode' );
			return;
		}
		return 'https://api.mapbox.com/directions/v5/' +
			profile +
			wayPointsString +
			'?geometries=polyline6&overview=full&steps=true&annotations=distance&access_token=' +
			myProviderKey;
	}

	/*
	--- myGetXHRJsonPromise function ------------------------------------------------------------------------------

	This function ...

	---------------------------------------------------------------------------------------------------------------
	*/

	function myGetXHRJsonPromise ( url, requestHeaders ) {

		/*
		--- jsonRequest function ----------------------------------------------------------------------------------

		-----------------------------------------------------------------------------------------------------------
		*/

		function jsonRequest ( onOk, onError ) {

			const READY_STATE_DONE = 4;
			const HTTP_STATUS_OK = 200;
			const HTTP_STATUS_ERR = 400;
			const REQUEST_TIME_OUT = 15000;

			let xmlHttpRequest = new XMLHttpRequest ( );
			xmlHttpRequest.timeout = REQUEST_TIME_OUT;

			xmlHttpRequest.onreadystatechange = function ( ) {
				if ( READY_STATE_DONE === xmlHttpRequest.readyState ) {
					if ( HTTP_STATUS_OK === xmlHttpRequest.status ) {
						let response = null;
						try {
							response = JSON.parse ( xmlHttpRequest.responseText );
							onOk ( response );
						}
						catch ( err ) {
							onError ( new Error ( 'JSON parsing error. File : ' + xmlHttpRequest.responseURL ) );
						}
					}
					else if ( HTTP_STATUS_ERR <= xmlHttpRequest.status ) {
						onError (
							new Error ( 'Error HTTP ' + xmlHttpRequest.status + ' ' + xmlHttpRequest.statusText )
						);
					}
					else {
						onError ( new Error ( 'Error XMLHttpRequest - File : ' + xmlHttpRequest.responseURL ) );
					}
				}
			};
			xmlHttpRequest.open ( 'GET', url, true );
			if ( requestHeaders ) {
				requestHeaders.forEach (
					header => xmlHttpRequest.setRequestHeader ( header.headerName, header.headerValue )
				);
			}
			xmlHttpRequest.overrideMimeType ( 'application/json' );
			xmlHttpRequest.send ( null );
		}

		return new Promise ( jsonRequest );
	}

	/*
	--- myGetRoute function ---------------------------------------------------------------------------------------

	---------------------------------------------------------------------------------------------------------------
	*/

	function myGetRoute ( onOk, onError ) {

		myGetXHRJsonPromise ( myGetUrl ( ) )
			.then ( response => myParseResponse ( response, onOk, onError ) )
			.catch ( err => onError ( err ) );

	}

	/*
	--- myGetPromiseRoute function --------------------------------------------------------------------------------

	---------------------------------------------------------------------------------------------------------------
	*/

	function myGetPromiseRoute ( route ) {
		myRoute = route;
		return new Promise ( myGetRoute );
	}

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
		set userLanguage ( UserLanguage ) { myUserLanguage = UserLanguage; }
	};
}

window.L.travelNotes.addProvider ( newMapboxRouteProvider ( ) );