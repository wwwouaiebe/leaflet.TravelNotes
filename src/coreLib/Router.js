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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Router.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module coreLib
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTravelNotesData from '../data/TravelNotesData.js';
import theGeometry from '../coreLib/Geometry.js';
import theErrorsUI from '../errorsUI/ErrorsUI.js';
import theEventDispatcher from '../coreLib/EventDispatcher.js';
import theSphericalTrigonometry from '../coreLib/SphericalTrigonometry.js';
import Zoomer from '../core/Zoomer.js';
import theProfileWindowsManager from '../core/ProfileWindowsManager.js';
import theRouteEditor from '../core/RouteEditor.js';

import { DISTANCE, ZERO } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class Router
@classdesc Start the routing and adapt the linked data after routing
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class Router {

	#routingRequestStarted = false;
	#zoomToRouteAfterRouting = false;

	/**
	This method compute the route, itineraryPoints and maneuvers distances
	@param {Route} route The route for witch the distances are computed
	@private
	*/

	#computeRouteDistances ( route ) {

		// Computing the distance between itineraryPoints
		let itineraryPointsIterator = route.itinerary.itineraryPoints.iterator;
		let maneuverIterator = route.itinerary.maneuvers.iterator;

		itineraryPointsIterator.done;
		maneuverIterator.done;

		maneuverIterator.value.distance = DISTANCE.defaultValue;
		maneuverIterator.done;
		route.distance = DISTANCE.defaultValue;
		route.duration = DISTANCE.defaultValue;

		while ( ! itineraryPointsIterator.done ) {
			itineraryPointsIterator.previous.distance = theSphericalTrigonometry.pointsDistance (
				itineraryPointsIterator.previous.latLng,
				itineraryPointsIterator.value.latLng
			);
			route.distance += itineraryPointsIterator.previous.distance;
			maneuverIterator.previous.distance += itineraryPointsIterator.previous.distance;
			if ( maneuverIterator.value.itineraryPointObjId === itineraryPointsIterator.value.objId ) {
				route.duration += maneuverIterator.previous.duration;
				maneuverIterator.value.distance = DISTANCE.defaultValue;
				if (
					maneuverIterator.next
					&&
					maneuverIterator.value.itineraryPointObjId === maneuverIterator.next.itineraryPointObjId
				) {

					// 2 maneuvers on the same itineraryPoint. We skip the first maneuver
					maneuverIterator.done;
					maneuverIterator.value.distance = DISTANCE.defaultValue;
				}
				maneuverIterator.done;

			}
		}
	}

	/**
	Error handler for the startRouting method
	@private
	*/

	#onRoutingError ( err ) {
		this.#routingRequestStarted = false;
		theErrorsUI.showError ( err );
		if ( err instanceof Error ) {
			console.error ( err );
		}
	}

	/**
	Success handler for the startRouting method
	@private
	*/

	#onRoutingOk ( ) {

		this.#routingRequestStarted = false;

		theTravelNotesData.travel.editedRoute.itinerary.validateData ( );

		let maneuversIterator = theTravelNotesData.travel.editedRoute.itinerary.maneuvers.iterator;
		while ( ! maneuversIterator.done ) {
			maneuversIterator.value.validateData ( );
		}

		let itineraryPointsIterator = theTravelNotesData.travel.editedRoute.itinerary.itineraryPoints.iterator;
		while ( ! itineraryPointsIterator.done ) {
			itineraryPointsIterator.value.validateData ( );
		}

		this.#computeRouteDistances ( theTravelNotesData.travel.editedRoute );

		// Placing the waypoints on the itinerary
		if ( 'circle' !== theTravelNotesData.travel.editedRoute.itinerary.transitMode ) {
			let wayPointsIterator = theTravelNotesData.travel.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
				if ( wayPointsIterator.first ) {
					wayPointsIterator.value.latLng =
						theTravelNotesData.travel.editedRoute.itinerary.itineraryPoints.first.latLng;
				}
				else if ( wayPointsIterator.last ) {
					wayPointsIterator.value.latLng =
						theTravelNotesData.travel.editedRoute.itinerary.itineraryPoints.last.latLng;
				}
				else {
					wayPointsIterator.value.latLng = theGeometry.getClosestLatLngDistance (
						theTravelNotesData.travel.editedRoute,
						wayPointsIterator.value.latLng
					).latLng;
				}
			}
		}

		// the position of the notes linked to the route is recomputed
		let notesIterator = theTravelNotesData.travel.editedRoute.notes.iterator;
		while ( ! notesIterator.done ) {
			let latLngDistance = theGeometry.getClosestLatLngDistance (
				theTravelNotesData.travel.editedRoute,
				notesIterator.value.latLng
			);
			notesIterator.value.latLng = latLngDistance.latLng;
			notesIterator.value.distance = latLngDistance.distance;
		}

		theRouteEditor.chainRoutes ( );

		// and the notes sorted
		theTravelNotesData.travel.editedRoute.notes.sort (
			( first, second ) => first.distance - second.distance
		);

		if ( this.#zoomToRouteAfterRouting ) {
			new Zoomer ( ).zoomToRoute ( theTravelNotesData.travel.editedRoute.objId );
		}

		theProfileWindowsManager.createProfile ( theTravelNotesData.travel.editedRoute );

		theEventDispatcher.dispatch (
			'routeupdated',
			{
				removedRouteObjId : theTravelNotesData.travel.editedRoute.objId,
				addedRouteObjId : theTravelNotesData.travel.editedRoute.objId
			}
		);

		theEventDispatcher.dispatch ( 'roadbookupdate' );
		theEventDispatcher.dispatch ( 'showitinerary' );
		theEventDispatcher.dispatch ( 'setrouteslist' );
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	This method start the routing for the edited route.
	@async
	@fires routeupdated
	@fires showitinerary
	@fires roadbookupdate
	*/

	startRouting ( ) {
		if (
			( ! this.#routingRequestStarted )
			&&
			theTravelNotesData.travel.editedRoute.haveValidWayPoints ( )
		) {
			this.#zoomToRouteAfterRouting = ZERO === theTravelNotesData.travel.editedRoute.itinerary.itineraryPoints.length;
			this.#routingRequestStarted = true;
			let routeProvider = theTravelNotesData.providers.get ( theTravelNotesData.routing.provider.toLowerCase ( ) );
			theTravelNotesData.travel.editedRoute.itinerary.provider = routeProvider.name;
			theTravelNotesData.travel.editedRoute.itinerary.transitMode = theTravelNotesData.routing.transitMode;
			routeProvider.getPromiseRoute ( theTravelNotesData.travel.editedRoute )
				.then ( ( ) => this.#onRoutingOk ( ) )
				.catch ( ( ) => this.#onRoutingError ( ) );
		}
	}
}

const theRouter = new Router ( );

export default theRouter;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of Router.js file

@------------------------------------------------------------------------------------------------------------------------------
*/