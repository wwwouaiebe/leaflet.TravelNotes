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

@file PublicTransportRouteProvider.js
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

import { ZERO, ONE, LAT_LNG, HTTP_STATUS_OK } from '../main/Constants.js';
import SelectDialog from '../dialogs/SelectDialog.js';
import PublicTransportRouteBuilder from '../routeProviders/PublicTransportRouteBuilder.js';
import BaseRouteProvider from '../routeProviders/BaseRouteProvider.js';

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

class PublicTransportRouteProvider extends BaseRouteProvider {

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
	@private
	*/

	#parseResponse ( waysNodes, onOk, onError ) {
		let publicTransportRouteBuilder = new PublicTransportRouteBuilder ( this.#route );
		publicTransportRouteBuilder.buildRoute ( waysNodes, onOk, onError );
	}

	/**
	@private
	*/

	#getWaysNodesUrl ( relationId ) {
		return window.TaN.overpassApiUrl + '?data=[out:json];rel(' +
			relationId.toFixed ( ZERO ) +
			');way(r)->.e;way.e["railway"="rail"];(._;>;rel(' +
			relationId.toFixed ( ZERO ) +
			'););out;';
	}

	/**
	@private
	*/

	#getDialogPromise ( relations ) {

		if ( ZERO === relations.elements.length ) {
			return Promise.reject ( new Error ( 'No relations found' ) );
		}

		let selectOptionsData = [];
		relations.elements.forEach (
			relationElement => {
				selectOptionsData.push ( { text : relationElement.tags.name, objId : relationElement.id } );
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
	@private
	*/

	#getRelationsUrl ( ) {
		return window.TaN.overpassApiUrl +
			'?data=[out:json];node["public_transport"="stop_position"]["train"="yes"](around:400.0,' +
			this.#route.wayPoints.first.lat.toFixed ( LAT_LNG.fixed ) +
			',' +
			this.#route.wayPoints.first.lng.toFixed ( LAT_LNG.fixed ) +
			')->.s;rel(bn.s)->.s;node["public_transport"="stop_position"]["train"="yes"](around:400.0,' +
			this.#route.wayPoints.last.lat.toFixed ( LAT_LNG.fixed ) +
			',' +
			this.#route.wayPoints.last.lng.toFixed ( LAT_LNG.fixed ) +
			')->.e;rel(bn.e)->.e;rel.e.s;out tags;';
	}

	/**
	call the provider, wait for the response and then parse the provider response. Notice that we have two calls to the
	Provider: one for the relation list and one for the ways and nodes. Notice also the dialog box between the 2 calls.
	@param {function} onOk a function to pass to the ourParseResponse
	@param {function} onError a function to pass to ourParseResponse or to call when an error occurs
	@private
	*/

	#getRoute ( onOk, onError ) {
		fetch ( this.#getRelationsUrl ( ) )
			.then (
				responseRelations => {
					if ( HTTP_STATUS_OK === responseRelations.status && responseRelations.ok ) {
						responseRelations.json ( )
							.then ( relations => this.#getDialogPromise ( relations ) )
							.then ( relationId => fetch ( this.#getWaysNodesUrl ( relationId ) ) )
							.then (
								responseWaysNodes => {
									if ( HTTP_STATUS_OK === responseWaysNodes.status && responseWaysNodes.ok ) {
										responseWaysNodes.json ( )
											.then ( waysNodes => this.#parseResponse ( waysNodes, onOk, onError ) );
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

	/*
	constructor
	*/

	constructor ( ) {
		super ( );
	}

	get icon ( ) {
		return 'data:image/svg+xml;utf8,' +
			'<svg viewBox="-3 -3 20 20" xmlns="http://www.w3.org/2000/svg"> <g fill="rgb(128,0,0)">' +
			'<path d="M 5,0 C 3.025911,-0.0084 1,3 1,7 l 0,2 c 0,1 1,2 2,2 l 8,0 c 1,0 2,-1 2,-2 L 13,7 C 13,3 11,0 9,0 z m ' +
			'-1,3 6,0 c 0,0 1,1 1,3 L 3.03125,6 C 2.994661,3.9916 4,3 4,3 z M 3,8 6,8 6,9 3,9 z m 5,0 3,0 0,1 -3,0 z m -6,4 ' +
			'-1,2 3,0 1,-2 z m 7,0 1,2 3,0 -1,-2 z"/></g></svg>';
	}

	getPromiseRoute ( route ) {
		this.#route = route;
		return new Promise ( ( onOk, onError ) => this.#getRoute ( onOk, onError ) );
	}

	get name ( ) { return 'PublicTransport'; }

	get title ( ) { return 'Public Transport on OpenStreetMap'; }

	get transitModes ( ) { return [ 'train' ]; }

	get providerKeyNeeded ( ) { return false; }

	get providerKey ( ) { return ONE; }
	set providerKey ( providerKey ) { }

	get userLanguage ( ) { return this.#userLanguage; }
	set userLanguage ( userLanguage ) { this.#userLanguage = userLanguage; }

}

window.TaN.addProvider ( PublicTransportRouteProvider );

/*
--- End of PublicTransportRouteProvider.js file -------------------------------------------------------------------------------
*/