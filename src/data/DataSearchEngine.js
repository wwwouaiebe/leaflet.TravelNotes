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
	- v1.4.0:
		- created from DataManager
	- v1.5.0:
		- Issue ♯52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file DataSearchEngine.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} NoteAndRoute
@desc An object to store a Note and the Route on witch the Note is attached
@property {?Note} note the searched Note or null if the note is not found
@property {?Route} route the Route on witch the Note is attached or null if the Note is a travel note
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module data
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTravelNotesData from '../data/TravelNotesData.js';
import theGeometry from '../coreLib/Geometry.js';
import theSphericalTrigonometry from '../coreLib/SphericalTrigonometry.js';

import { ZERO, INVALID_OBJ_ID, LAT_LNG } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class DataSearchEngine
@classdesc Class with helper methods to search data
@see {@link theDataSearchEngine} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class DataSearchEngine {

	#setNearestRouteData ( route, latLng, nearestRouteData ) {
		if ( route.objId !== theTravelNotesData.editedRouteObjId ) {
			let pointAndDistance = theGeometry.getClosestLatLngDistance ( route, latLng );
			if ( pointAndDistance ) {
				let distanceToRoute = theSphericalTrigonometry.pointsDistance (
					latLng,
					pointAndDistance.latLng
				);
				if ( distanceToRoute < nearestRouteData.distance ) {
					nearestRouteData.route = route;
					nearestRouteData.distance = distanceToRoute;
					nearestRouteData.latLngOnRoute = pointAndDistance.latLng;
					nearestRouteData.distanceOnRoute = pointAndDistance.distance;
				}
			}
		}
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	This method search route data for the nearest route of a given point
	@param {Array.<number>} latLng The latitude and longitude of the point
	@return {RouteData} A routeData object
	@private
	*/

	getNearestRouteData ( latLng ) {
		let nearestRouteData = {
			distance : Number.MAX_VALUE,
			route : null,
			distanceOnRoute : ZERO,
			latLngOnRoute : [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ]
		};

		theTravelNotesData.travel.routes.forEach ( route => this.#setNearestRouteData ( route, latLng, nearestRouteData ) );
		if ( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId ) {
			this.#setNearestRouteData ( theTravelNotesData.travel.editedRoute, latLng, nearestRouteData );
		}

		return Object.freeze ( nearestRouteData	);
	}

	/**
	Search a route with the route objId
	@param {!number} objId the objId of the route to search
	@return (?Route) the searched route or null if not found
	*/

	getRoute ( routeObjId ) {
		let route = null;
		route = theTravelNotesData.travel.routes.getAt ( routeObjId );
		if ( ! route ) {
			if ( routeObjId === theTravelNotesData.travel.editedRoute.objId ) {
				route = theTravelNotesData.travel.editedRoute;
			}
		}
		return route;
	}

	/**
	Search a Note and a Route with the Note objId
	@param {!number} objId the objId of the note to search
	@return (NoteAndRoute) a NoteAndRoute object with the route and note
	*/

	getNoteAndRoute ( noteObjId ) {
		let note = null;
		let route = null;
		note = theTravelNotesData.travel.notes.getAt ( noteObjId );
		if ( ! note ) {
			let routeIterator = theTravelNotesData.travel.routes.iterator;
			while ( ! ( routeIterator.done || note ) ) {
				note = routeIterator.value.notes.getAt ( noteObjId );
				if ( note ) {
					route = routeIterator.value;
				}
			}
			if ( ! note ) {
				note = theTravelNotesData.travel.editedRoute.notes.getAt ( noteObjId );
				if ( note ) {
					route = theTravelNotesData.travel.editedRoute;
				}
			}
		}
		return Object.freeze ( { note : note, route : route } );
	}

	/**
	Search a WayPoint with the WayPoint objId
	@param {!number} objId the objId of the note to search
	@return (NoteAndRoute) a NoteAndRoute object with the route and note
	*/

	getWayPoint ( wayPointObjId ) {
		let wayPoint = theTravelNotesData.travel.editedRoute.wayPoints.getAt ( wayPointObjId );
		if ( ! wayPoint ) {
			let routeIterator = theTravelNotesData.travel.routes.iterator;
			while ( ! ( routeIterator.done || wayPoint ) ) {
				wayPoint = routeIterator.value.wayPoints.getAt ( wayPointObjId );
			}
		}
		return wayPoint;
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of DataSearchEngine class
@type {DataSearchEngine}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theDataSearchEngine = new DataSearchEngine ( );

export default theDataSearchEngine;

/*
--- End of DataSearchEngine.js file -------------------------------------------------------------------------------------------
*/