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
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue ♯28 : Disable "select this point as start point " and "select this point as end point"
			when a start point or end point is already present
		- Issue ♯30 : Add a context menu with delete command to the waypoints
		- Issue ♯33 : Add a command to hide a route
		- Issue ♯34 : Add a command to show all routes
	- v1.3.0:
		- added cutRoute method (not tested...)
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- modified getClosestLatLngDistance to avoid crash on empty routes
		- fixed Issue ♯45
	- v1.5.0:
		- Issue ♯52 : when saving the travel to the file, save also the edited route.
		- Issue ♯62 : Remove time from route popup when readonly travel.
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
		- Issue ♯66 : Work with promises for dialogs
		- Issue ♯70 : Put the get...HTML functions outside of the editors
		- Issue ♯68 : Review all existing promises.
	- v1.9.0:
		- Issue ♯101 : Add a print command for a route
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v2.0.0:
		- Issue ♯138 : Protect the app - control html entries done by user.
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210715
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file RouteEditor.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module RouteEditor
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTranslator from '../UI/Translator.js';
import theAPIKeysManager from '../core/APIKeysManager.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theErrorsUI from '../UI/ErrorsUI.js';
import theDataSearchEngine from '../data/DataSearchEngine.js';
import Route from '../data/Route.js';
import GpxFactory from '../core/GpxFactory.js';
import { newRoutePropertiesDialog } from '../dialogs/RoutePropertiesDialog.js';
import PrintRouteMapDialog from '../dialogs/PrintRouteMapDialog.js';
import theEventDispatcher from '../util/EventDispatcher.js';
import theGeometry from '../util/Geometry.js';
import theSphericalTrigonometry from '../util/SphericalTrigonometry.js';
import Zoomer from '../core/Zoomer.js';
import theProfileWindowsManager from '../core/ProfileWindowsManager.js';
import { newPrintFactory } from '../printMap/PrintFactory.js';
import { ROUTE_EDITION_STATUS, DISTANCE, LAT_LNG, ZERO, INVALID_OBJ_ID } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class contains methods fot Routes creation or modifications
@see {@link theRouteEditor} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class RouteEditor {

	#zoomToRouteAfterRouting = false;
	#routingRequestStarted = false;

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
	This method verify that all waypoints have valid coordinates ( reminder: a route have always a startpoint
	and an endpoint!)
	@param {Route} route The route for witch the waypoints are verified
	@return {boolean} true when all waypoints have valid coordinates
	@private
	*/

	#haveValidWayPoints ( route ) {
		let haveValidWayPoints = true;
		route.wayPoints.forEach (
			wayPoint => {
				haveValidWayPoints =
					haveValidWayPoints
					&&
					LAT_LNG.defaultValue !== wayPoint.lat
					&&
					LAT_LNG.defaultValue !== wayPoint.lng;
			}
		);
		return haveValidWayPoints;
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

		this.chainRoutes ( );

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

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	This method add a route to the Travel and, if no other route is beind edited,
	start the edition of this new route
	@fires setprovider
	@fires settransitmode
	@fires routeupdated
	@fires showitinerary
	@fires setrouteslist
	@fires roadbookupdate
	*/

	addRoute ( ) {
		let route = new Route ( );
		theTravelNotesData.travel.routes.add ( route );
		if ( ROUTE_EDITION_STATUS.editedChanged === theTravelNotesData.travel.editedRoute.editionStatus ) {
			this.chainRoutes ( );
			theEventDispatcher.dispatch ( 'setrouteslist' );
			theEventDispatcher.dispatch ( 'roadbookupdate' );
		}
		else {
			this.editRoute ( route.objId );
		}
	}

	/**
	This method start the edition of a route
	@param {!number} routeObjId The objId of the route to edit.
	@fires setprovider
	@fires settransitmode
	@fires routeupdated
	@fires showitinerary
	@fires setrouteslist
	@fires roadbookupdate
	*/

	editRoute ( routeObjId ) {
		if ( ROUTE_EDITION_STATUS.editedChanged === theTravelNotesData.travel.editedRoute.editionStatus ) {

			// not possible to edit - the current edited route is not saved or cancelled
			theErrorsUI.showError (
				theTranslator.getText ( 'RouteEditor - Not possible to edit a route without a save or cancel' )
			);
			return;
		}

		// We verify that the provider  for this route is available
		let initialRoute = theDataSearchEngine.getRoute ( routeObjId );
		let providerName = initialRoute.itinerary.provider;
		let provider = theTravelNotesData.providers.get ( providerName.toLowerCase ( ) );
		if (
			providerName
			&&
			( '' !== providerName )
			&&
			(
				( ! provider )
				||
				( provider.providerKeyNeeded && ! theAPIKeysManager.hasKey ( providerName ) )
			)
		) {
			theErrorsUI.showError (
				theTranslator.getText (
					'RouteEditor - Not possible to edit a route created with this provider',
					{ provider : providerName }
				)
			);
			return;
		}

		if ( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId ) {

			// the current edited route is not changed. Cleaning the editors
			this.cancelEdition ( );
		}

		// Provider and transit mode are changed in the itinerary editor
		if ( providerName && '' !== providerName ) {
			theEventDispatcher.dispatch ( 'setprovider', { provider : providerName } );
		}
		let transitMode = initialRoute.itinerary.transitMode;
		if ( transitMode && '' !== transitMode ) {
			theEventDispatcher.dispatch ( 'settransitmode', { transitMode : transitMode } );
		}

		// The edited route is pushed in the editors
		theTravelNotesData.travel.editedRoute = new Route ( );
		initialRoute.editionStatus = ROUTE_EDITION_STATUS.editedNoChange;

		// Route is cloned, so we can have a cancel button in the editor
		theTravelNotesData.travel.editedRoute.jsonObject = initialRoute.jsonObject;
		theTravelNotesData.editedRouteObjId = initialRoute.objId;
		theTravelNotesData.travel.editedRoute.hidden = false;
		initialRoute.hidden = false;
		theProfileWindowsManager.updateProfile (
			theTravelNotesData.editedRouteObjId,
			theTravelNotesData.travel.editedRoute
		);
		this.chainRoutes ( );
		theEventDispatcher.dispatch (
			'routeupdated',
			{
				removedRouteObjId : initialRoute.objId,
				addedRouteObjId : theTravelNotesData.travel.editedRoute.objId
			}
		);

		theEventDispatcher.dispatch ( 'roadbookupdate' );
		theEventDispatcher.dispatch ( 'showitinerary' );
		theEventDispatcher.dispatch ( 'setrouteslist' );
	}

	/**
	This method removes a route from the travel
	@param {!number} routeObjId The objId of the Route to remove.
	@fires routeupdated
	@fires showitinerary
	@fires setrouteslist
	@fires roadbookupdate
	*/

	removeRoute ( routeObjId ) {
		let routeToDeleteObjId = routeObjId;
		if (
			(
				routeToDeleteObjId === theTravelNotesData.editedRouteObjId
				||
				routeToDeleteObjId === theTravelNotesData.travel.editedRoute.objId
			)
		) {
			if ( ROUTE_EDITION_STATUS.editedChanged === theTravelNotesData.travel.editedRoute.editionStatus ) {

				// cannot remove the route currently edited and changed
				theErrorsUI.showError ( theTranslator.getText ( 'TravelEditor - Cannot remove an edited route' ) );
				return;
			}

			routeToDeleteObjId = theTravelNotesData.editedRouteObjId;
			this.cancelEdition ( );

		}

		theEventDispatcher.dispatch (
			'routeupdated',
			{
				removedRouteObjId : routeToDeleteObjId,
				addedRouteObjId : INVALID_OBJ_ID
			}
		);

		theTravelNotesData.travel.routes.remove ( routeToDeleteObjId );
		theProfileWindowsManager.deleteProfile ( routeToDeleteObjId );
		this.chainRoutes ( );

		theEventDispatcher.dispatch ( 'roadbookupdate' );
		theEventDispatcher.dispatch ( 'setrouteslist' );
	}

	/**
	This method save the route to a gpx file
	@param {!number} routeObjId The objId of the Route to save.
	*/

	saveGpx ( routeObjId ) {
		new GpxFactory ( ).routeToGpx ( routeObjId );
	}

	/**
	This method recompute the distances for all the chained routes and their notes
	*/

	chainRoutes ( ) {
		let routesIterator = theTravelNotesData.travel.routes.iterator;
		let chainedDistance = DISTANCE.defaultValue;
		while ( ! routesIterator.done ) {
			if ( routesIterator.value.chain ) {
				routesIterator.value.chainedDistance = chainedDistance;
				chainedDistance += routesIterator.value.distance;
			}
			else {
				routesIterator.value.chainedDistance = DISTANCE.defaultValue;
			}
			let notesIterator = routesIterator.value.notes.iterator;
			while ( ! notesIterator.done ) {
				notesIterator.value.chainedDistance = routesIterator.value.chainedDistance;
			}
		}
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
			this.#haveValidWayPoints ( theTravelNotesData.travel.editedRoute )
		) {
			this.#zoomToRouteAfterRouting = ZERO === theTravelNotesData.travel.editedRoute.itinerary.itineraryPoints.length;
			this.#routingRequestStarted = true;
			let routeProvider = theTravelNotesData.providers.get ( theTravelNotesData.routing.provider.toLowerCase ( ) );
			theTravelNotesData.travel.editedRoute.itinerary.provider = routeProvider.name;
			theTravelNotesData.travel.editedRoute.itinerary.transitMode = theTravelNotesData.routing.transitMode;
			routeProvider.getPromiseRoute ( theTravelNotesData.travel.editedRoute, null )
				.then ( ( ) => { this.#onRoutingOk ( ); } )
				.catch ( ( ) => { this.#onRoutingError ( ); } );
		}
	}

	/**
	This method save the edited route
	@fires routeupdated
	@fires showitinerary
	@fires setrouteslist
	@fires roadbookupdate
	*/

	saveEdition ( ) {

		// the edited route is cloned
		let clonedRoute = new Route ( );
		clonedRoute.jsonObject = theTravelNotesData.travel.editedRoute.jsonObject;

		// and the initial route replaced with the clone
		theTravelNotesData.travel.routes.replace ( theTravelNotesData.editedRouteObjId, clonedRoute );
		theTravelNotesData.editedRouteObjId = clonedRoute.objId;
		this.cancelEdition ( );
	}

	/**
	This method cancel the route edition
	@fires routeupdated
	@fires showitinerary
	@fires setrouteslist
	@fires roadbookupdate
	*/

	cancelEdition ( ) {

		// !!! order is important!!!
		let editedRoute = theDataSearchEngine.getRoute ( theTravelNotesData.editedRouteObjId );
		editedRoute.editionStatus = ROUTE_EDITION_STATUS.notEdited;

		theProfileWindowsManager.updateProfile (
			theTravelNotesData.travel.editedRoute.objId,
			editedRoute
		);

		theEventDispatcher.dispatch (
			'routeupdated',
			{
				removedRouteObjId : theTravelNotesData.travel.editedRoute.objId,
				addedRouteObjId : theTravelNotesData.editedRouteObjId
			}
		);

		theTravelNotesData.editedRouteObjId = INVALID_OBJ_ID;
		theTravelNotesData.travel.editedRoute = new Route ( );
		this.chainRoutes ( );

		theEventDispatcher.dispatch ( 'roadbookupdate' );
		theEventDispatcher.dispatch ( 'setrouteslist' );
		theEventDispatcher.dispatch ( 'showitinerary' );
	}

	/**
	This method show the RoutePropertiesDialog
	@param {!number} routeObjId The objId of the Route for witch the properties must be edited
	@async
	@fires routepropertiesupdated
	@fires setrouteslist
	@fires roadbookupdate
	@fires updateitinerary
	*/

	routeProperties ( routeObjId ) {
		let route = theDataSearchEngine.getRoute ( routeObjId );
		let routePropertiesDialog = newRoutePropertiesDialog ( route );

		routePropertiesDialog.show ( ).then (
			( ) => {
				this.chainRoutes ( );
				if ( this.#haveValidWayPoints ( route ) ) {
					theEventDispatcher.dispatch (
						'routepropertiesupdated',
						{
							routeObjId : route.objId
						}
					);
				}
				theEventDispatcher.dispatch ( 'roadbookupdate' );
				theEventDispatcher.dispatch ( 'setrouteslist' );
				theEventDispatcher.dispatch ( 'updateitinerary' );
			}
		)
			.catch (
				err => {
					if ( err instanceof Error ) {
						console.error ( err );
					}
				}
			);
	}

	/**
	This method show the PrintRouteMapDialog and then print the maps
	@param {!number} routeObjId The objId of the Route for witch the maps must be printed
	@async
	*/

	printRouteMap ( routeObjId ) {
		new PrintRouteMapDialog ( )
			.show ( )
			.then ( printData => newPrintFactory ( ).print ( printData, routeObjId ) )
			.catch (
				err => {
					if ( err instanceof Error ) {
						console.error ( err );
					}
				}
			);
	}

	/**
	This method show a route on the map
	@param {!number} routeObjId The objId of the Route to show
	*/

	showRoute ( routeObjId ) {
		theDataSearchEngine.getRoute ( routeObjId ).hidden = false;
		theEventDispatcher.dispatch (
			'routeupdated',
			{
				removedRouteObjId : INVALID_OBJ_ID,
				addedRouteObjId : routeObjId
			}
		);
		theEventDispatcher.dispatch ( 'setrouteslist' );
	}

	/**
	This method hide a route on the map
	@param {!number} routeObjId The objId of the Route to show
	*/

	hideRoute ( routeObjId ) {
		theDataSearchEngine.getRoute ( routeObjId ).hidden = true;
		theEventDispatcher.dispatch (
			'routeupdated',
			{
				removedRouteObjId : routeObjId,
				addedRouteObjId : INVALID_OBJ_ID
			}
		);
		theEventDispatcher.dispatch ( 'setrouteslist' );
	}

	/**
	This method shows all the routes on the map
	*/

	showRoutes ( ) {
		let routesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {
			if ( routesIterator.value.hidden ) {
				routesIterator.value.hidden = false;
				theEventDispatcher.dispatch (
					'routeupdated',
					{
						removedRouteObjId : INVALID_OBJ_ID,
						addedRouteObjId : routesIterator.value.objId
					}
				);
			}
		}
		theEventDispatcher.dispatch ( 'setrouteslist' );
	}

	/**
	This method hide all the routes on the map
	*/

	hideRoutes ( ) {
		let routesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {
			if (
				! routesIterator.value.hidden
				&&
				routesIterator.value.objId !== theTravelNotesData.editedRouteObjId
			) {
				routesIterator.value.hidden = true;
				theEventDispatcher.dispatch (
					'routeupdated',
					{
						removedRouteObjId : routesIterator.value.objId,
						addedRouteObjId : INVALID_OBJ_ID
					}
				);
			}
		}
		theEventDispatcher.dispatch ( 'setrouteslist' );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of RouteEditor class
@type {RouteEditor}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theRouteEditor = new RouteEditor ( );

export default theRouteEditor;

/*
--- End of RouteEditor.js file ------------------------------------------------------------------------------------------------
*/