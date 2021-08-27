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

@file PublicTransportRouteProvider.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module PublicTransportRouteProvider
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { ZERO, ONE, LAT_LNG, HTTP_STATUS_OK } from '../util/Constants.js';
import SelectDialog from '../dialogs/SelectDialog.js';
import PublicTransportRouteBuilder from '../routeProviders/PublicTransportRouteBuilder.js';


let ourUserLanguage = 'fr';
let ourRoute = null;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourParseResponse
@desc coming soon...
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourParseResponse ( response, onOk, onError ) {
	let publicTransportRouteBuilder = new PublicTransportRouteBuilder ( ourRoute );
	publicTransportRouteBuilder.buildRoute ( response, onOk, onError );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetRelationsUrl
@desc coming soon...
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetRelationsUrl ( ) {
	return window.TaN.overpassApiUrl +
		'?data=[out:json];node["public_transport"="stop_position"]["train"="yes"](around:400.0,' +
		ourRoute.wayPoints.first.lat.toFixed ( LAT_LNG.fixed ) +
		',' +
		ourRoute.wayPoints.first.lng.toFixed ( LAT_LNG.fixed ) +
		')->.s;rel(bn.s)->.s;node["public_transport"="stop_position"]["train"="yes"](around:400.0,' +
		ourRoute.wayPoints.last.lat.toFixed ( LAT_LNG.fixed ) +
		',' +
		ourRoute.wayPoints.last.lng.toFixed ( LAT_LNG.fixed ) +
		')->.e;rel(bn.e)->.e;rel.e.s;out tags;';
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetWayNodesUrl
@desc coming soon...
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetWayNodesUrl ( relationId ) {
	return window.TaN.overpassApiUrl + '?data=[out:json];rel(' +
		relationId.toFixed ( ZERO ) +
		');way(r)->.e;way.e["railway"="rail"];(._;>;rel(' +
		relationId.toFixed ( ZERO ) +
		'););out;';
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetDialogPromise
@desc coming soon...
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetDialogPromise ( response ) {

	if ( ZERO === response.elements.length ) {
		return Promise.reject ( new Error ( 'No relations found' ) );
	}

	let selectOptionsData = [];
	response.elements.forEach (
		dataElement => {
			selectOptionsData.push ( { text : dataElement.tags.name, objId : dataElement.id } );
		}
	);

	let selectDialog = new SelectDialog (
		{
			title : 'Relations',
			text : 'select a relation : ',
			selectOptionsData : selectOptionsData
		}
	);

	// baseDialog.show ( ) return a Promise...
	return selectDialog.show ( );

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourGetRoute
@desc call the provider, wait for the response and then parse the provider response. Notice that we have two calls to the
Provider: one for the relation list and one for the ways and nodes. Notice also the dialog box between the 2 calls.
@param {function} onOk a function to pass to the ourParseResponse
@param {function} onError a function to pass to ourParseResponse or to call when an error occurs
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourGetRoute ( onOk, onError ) {

	fetch ( ourGetRelationsUrl ( ) )
		.then (
			responseRelations => {
				if ( HTTP_STATUS_OK === responseRelations.status && responseRelations.ok ) {
					responseRelations.json ( )
						.then ( ourGetDialogPromise )
						.then ( relationId => fetch ( ourGetWayNodesUrl ( relationId ) ) )
						.then (
							responseWayNodes => {
								if ( HTTP_STATUS_OK === responseWayNodes.status && responseWayNodes.ok ) {
									responseWayNodes.json ( )
										.then ( wayNodes => ourParseResponse ( wayNodes, onOk, onError ) );
								}
								else {
									onError ( new Error ( 'An error occurs...' ) );
								}
							}
						)
						.catch ( ( ) => onError ( new Error ( 'An error occurs...' ) ) );
				}
				else {
					onError ( new Error ( 'An error occurs...' ) );
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

@class PublicTransportRouteProvider
@classdesc This class implements the Provider interface for PublicTransport. It's not possible to instanciate
this class because the class is not exported from the module. Only one instance is created and added to the list
of Providers of TravelNotes
@see Provider for a description of methods
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class PublicTransportRouteProvider {

	constructor ( ) {
		Object.freeze ( this );
	}

	getPromiseRoute ( route ) { return ourGetPromiseRoute ( route ); }

	get icon ( ) {
		return 'data:image/svg+xml;utf8,' +
			'<svg viewBox="-3 -3 20 20" xmlns="http://www.w3.org/2000/svg"> <g fill="rgb(128,0,0)">' +
			'<path d="M 5,0 C 3.025911,-0.0084 1,3 1,7 l 0,2 c 0,1 1,2 2,2 l 8,0 c 1,0 2,-1 2,-2 L 13,7 C 13,3 11,0 9,0 z m ' +
			'-1,3 6,0 c 0,0 1,1 1,3 L 3.03125,6 C 2.994661,3.9916 4,3 4,3 z M 3,8 6,8 6,9 3,9 z m 5,0 3,0 0,1 -3,0 z m -6,4 ' +
			'-1,2 3,0 1,-2 z m 7,0 1,2 3,0 -1,-2 z"/></g></svg>';

	}

	get name ( ) { return 'PublicTransport'; }

	get title ( ) { return 'Public Transport on OpenStreetMap'; }

	get transitModes ( ) { return [ 'train' ]; }

	get providerKeyNeeded ( ) { return false; }

	get providerKey ( ) { return ONE; }
	set providerKey ( ProviderKey ) { }

	get userLanguage ( ) { return ourUserLanguage; }
	set userLanguage ( UserLanguage ) { ourUserLanguage = UserLanguage; }
}

window.TaN.addProvider ( new PublicTransportRouteProvider ( ) );

/*
--- End of PublicTransportRouteProvider.js file -------------------------------------------------------------------------------
*/