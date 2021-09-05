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

@file MapzenValhallaRouteProvider.js
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

import { ZERO, HTTP_STATUS_OK, DISTANCE } from '../main/Constants.js';

const OUR_MAPZEN_LAT_LNG_ROUND = 6;

const OUR_ICON_LIST = [
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

/**
@------------------------------------------------------------------------------------------------------------------------------

@class MapzenValhallaRouteProvider
@classdesc This class implements the Provider interface for MapzenValhalla. It's not possible to instanciate
this class because the class is not exported from the module. Only one instance is created and added to the list
of Providers of TravelNotes
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class MapzenValhallaRouteProvider extends BaseRouteProvider {

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
	Parse the provider response and complete the route with values received from the provider
	@private
	*/

	#parseResponse ( response, onOk, onError ) {
		if ( ZERO === response.trip.legs.length ) {
			onError ( 'Route not found' );
			return;
		}

		this.#route.itinerary.itineraryPoints.removeAll ( );
		this.#route.itinerary.maneuvers.removeAll ( );

		response.trip.legs.forEach (
			leg => {
				leg.shape = thePolylineEncoder.decode ( leg.shape, [ OUR_MAPZEN_LAT_LNG_ROUND, OUR_MAPZEN_LAT_LNG_ROUND ] );
				let itineraryPoints = [];
				for ( let shapePointCounter = ZERO; shapePointCounter < leg.shape.length; shapePointCounter ++ ) {
					let itineraryPoint = new ItineraryPoint ( );
					itineraryPoint.latLng = leg.shape [ shapePointCounter ];
					itineraryPoints.push ( itineraryPoint );
					this.#route.itinerary.itineraryPoints.add ( itineraryPoint );
				}
				leg.maneuvers.forEach (
					mapzenManeuver => {
						let travelNotesManeuver = new Maneuver ( );
						travelNotesManeuver.iconName = OUR_ICON_LIST [ mapzenManeuver.type || ZERO ];
						travelNotesManeuver.instruction = mapzenManeuver.instruction || '';
						travelNotesManeuver.distance = ( mapzenManeuver.length || ZERO ) * DISTANCE.metersInKm;
						travelNotesManeuver.duration = mapzenManeuver.time || ZERO;
						travelNotesManeuver.itineraryPointObjId = itineraryPoints [ mapzenManeuver.begin_shape_index ].objId;
						this.#route.itinerary.maneuvers.add ( travelNotesManeuver );
					}
				);
			}
		);

		let wayPointsIterator = this.#route.wayPoints.iterator;
		response.trip.locations.forEach (
			curLocation => {
				if ( ! wayPointsIterator.done ) {
					wayPointsIterator.value.latLng = [ curLocation.lat, curLocation.lon ];
				}
			}
		);

		onOk ( this.#route );
	}

	/**
	Get the complete url to be send to the provider
	@private
	*/

	#getUrl ( ) {
		let request = {
			locations : [],
			costing : '',
			/* eslint-disable-next-line camelcase */
			directions_options : { language : this.userLanguage },
			/* eslint-disable-next-line camelcase */
			costing_options : {}
		};

		let wayPointsIterator = this.#route.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			request.locations.push (
				{
					lat : wayPointsIterator.value.lat,
					lon : wayPointsIterator.value.lng,
					type : wayPointsIterator.first || wayPointsIterator.last ? 'break' : 'through'
				}
			);
		}

		switch ( this.#route.itinerary.transitMode ) {
		case 'bike' :
			request.costing = 'bicycle';
			/* eslint-disable-next-line camelcase */
			request.costing_options = {
				bicycle : {
					/* eslint-disable-next-line camelcase, no-magic-numbers*/
					maneuver_penalty : 30,
					/* eslint-disable-next-line camelcase */
					bicycle_type : 'Cross',
					/* eslint-disable-next-line camelcase */
					cycling_speed : '20.0',
					/* eslint-disable-next-line camelcase */
					use_roads : '0.25',
					/* eslint-disable-next-line camelcase */
					use_hills : '0.25'
				}
			};

			break;
		case 'pedestrian' :
			request.costing = 'pedestrian';
			/* eslint-disable-next-line camelcase */
			request.costing_options = { pedestrian : { walking_speed : '4.0' } };
			break;
		case 'car' :
			request.costing = 'auto';
			/* eslint-disable-next-line camelcase */
			request.costing_options = { auto : { country_crossing_cost : '60' } };
			break;
		default :
			break;
		}

		return 'https://api.stadiamaps.com/route?json=' + JSON.stringify ( request ) + '&api_key=' + this.#providerKey;

	}

	/**
	Implementation of the base class #getRoute ( )
	@private
	*/

	#getRoute ( onOk, onError ) {
		fetch ( this.#getUrl ( ) )
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

	getPromiseRoute ( route ) {
		this.#route = route;
		return new Promise ( ( onOk, onError ) => this.#getRoute ( onOk, onError ) );
	}

	get icon ( ) {
		return '' +
			'data:image/png;base64,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';
	}

	get name ( ) { return 'MapzenValhalla'; }

	get title ( ) { return 'Mapzen Valhalla with Stadia Maps'; }

	get transitModes ( ) { return [ 'bike', 'pedestrian', 'car' ]; }

	get providerKeyNeeded ( ) { return true; }

	get providerKey ( ) { return this.#providerKey.length; }
	set providerKey ( providerKey ) { this.#providerKey = providerKey; }

	get userLanguage ( ) { return this.#userLanguage; }
	set userLanguage ( userLanguage ) { this.#userLanguage = userLanguage; }
}

window.TaN.addProvider ( MapzenValhallaRouteProvider );

/*
--- End of MapzenValhallaRouteProvider.js file --------------------------------------------------------------------------------
*/