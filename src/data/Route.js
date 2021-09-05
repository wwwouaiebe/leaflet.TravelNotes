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
	-v1.1.0:
		- Issue ♯33: Add a command to hide a route
		- Issue ♯36: Add a linetype property to route
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.5.0:
		- Issue ♯52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
	- v1.8.0:
		- Issue ♯100 : Fix circular dependancies with Collection
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v2.0.0:
		- Issue ♯138 : Protect the app - control html entries done by user.
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Route.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module data
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/* eslint no-fallthrough: ["error", { "commentPattern": "eslint break omitted intentionally" }]*/

import theConfig from '../data/Config.js';
import ObjId from '../data/ObjId.js';
import ObjType from '../data/ObjType.js';
import Collection from '../data/Collection.js';
import WayPoint from '../data/WayPoint.js';
import Itinerary from '../data/Itinerary.js';
import Note from '../data/Note.js';
import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';
import { ROUTE_EDITION_STATUS, DISTANCE, ZERO, INVALID_OBJ_ID, LAT_LNG } from '../main/Constants.js';

const OUR_OBJ_TYPE = new ObjType ( 'Route' );

/**
@--------------------------------------------------------------------------------------------------------------------------

@class Route
@classdesc This class represent a route
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class Route {

	#objId = INVALID_OBJ_ID;;

	/**
	Performs the upgrade
	@param {Object} route a route to upgrade
	@throws {Error} when the route version is invalid
	@private
	*/

	#upgradeObject ( route ) {
		switch ( route.objType.version ) {
		case '1.0.0' :
			route.dashArray = ZERO;
			route.hidden = false;
			// eslint break omitted intentionally
		case '1.1.0' :
		case '1.2.0' :
		case '1.3.0' :
		case '1.4.0' :
			route.edited = ROUTE_EDITION_STATUS.notEdited;
			// eslint break omitted intentionally
		case '1.5.0' :
		case '1.6.0' :
		case '1.7.0' :
		case '1.7.1' :
		case '1.8.0' :
		case '1.9.0' :
		case '1.10.0' :
		case '1.11.0' :
			route.editionStatus = route.edited;
			// eslint break omitted intentionally
		case '1.12.0' :
		case '1.13.0' :
		case '2.0.0' :
		case '2.1.0' :
		case '2.2.0' :
			route.objType.version = '2.3.0';
			break;
		default :
			throw new Error ( 'invalid version for ' + OUR_OBJ_TYPE.name );
		}
	}

	/**
	Verify that the parameter can be transformed to a Route and performs the upgrate if needed
	@param {Object} something an object to validate
	@return {Object} the validated object
	@throws {Error} when the parameter is invalid
	@private
	*/

	#validateObject ( something ) {
		if ( ! Object.getOwnPropertyNames ( something ).includes ( 'objType' ) ) {
			throw new Error ( 'No objType for ' + OUR_OBJ_TYPE.name );
		}
		OUR_OBJ_TYPE.validate ( something.objType );
		if ( OUR_OBJ_TYPE.version !== something.objType.version ) {
			this.#upgradeObject ( something );
		}
		let properties = Object.getOwnPropertyNames ( something );
		[
			'name',
			'wayPoints',
			'notes',
			'itinerary',
			'width',
			'color',
			'dashArray',
			'chain',
			'distance',
			'duration',
			'editionStatus',
			'hidden',
			'chainedDistance',
			'objId'
		].forEach (
			property => {
				if ( ! properties.includes ( property ) ) {
					throw new Error ( 'No ' + property + ' for ' + OUR_OBJ_TYPE.name );
				}
			}
		);
		return something;
	}

	/*
	constructor
	*/

	constructor ( ) {

		/**
		the name of the Route
		@type {string}
		*/

		this.name = '';

		/**
		a Collection of WayPoints
		@type {Collection.<WayPoint>}
		@readonly
		*/

		this.wayPoints = new Collection ( WayPoint );
		this.wayPoints.add ( new WayPoint ( ) );
		this.wayPoints.add ( new WayPoint ( ) );

		/**
		a Collection of Notes
		@type {Collection.<Note>}
		@readonly
		*/

		this.notes = new Collection ( Note );

		/**
		the Route Itinerary
		@type {Itinerary}
		*/

		this.itinerary = new Itinerary ( );

		/**
		the width of the Leaflet polyline used to represent the Route on the map
		@type {!number}
		*/

		this.width = theConfig.route.width;

		/**
		the color of the Leaflet polyline used to represent the Route on the map
		using the css format '#rrggbb'
		@type {string}
		*/

		this.color = theConfig.route.color;

		/**
		the dash of the Leaflet polyline used to represent the Route on the map.
		It's the index of the dash in the array Config.route.dashChoices
		@type {!number}
		*/

		this.dashArray = theConfig.route.dashArray;

		/**
		boolean indicates if the route is chained
		@type {boolean}
		*/

		this.chain = true;

		/**
		the distance betwween the starting point of the traval and the starting point
		of the route if the route is chained, otherwise DISTANCE.defaultValue
		@type {!number}
		*/

		this.chainedDistance = DISTANCE.defaultValue;

		/**
		the length of the route or DISTANCE.defaultValue if the Itinerary is not anymore computed
		@type {number}
		*/

		this.distance = DISTANCE.defaultValue;

		/**
		the duration of the route or DISTANCE.defaultValue if the Itinerary is not anymore computed
		@type {number}
		*/

		this.duration = DISTANCE.defaultValue;

		/**
		A number indicating the status of the route.
		See ROUTE_EDITION_STATUS for possible values
		@type {!number}
		*/

		this.editionStatus = ROUTE_EDITION_STATUS.notEdited;

		/**
		a boolean set to true when the route is hidden on the map
		@type {boolean}
		*/

		this.hidden = false;

		this.#objId = ObjId.nextObjId;

		Object.seal ( this );
	}

	/**
	A name computed from the starting WayPoint and ending WayPoint names and addresses
	@type {string}
	@readonly
	*/

	get computedName ( ) {
		let computedName = this.name;
		if ( '' === computedName ) {
			computedName =
				( '' === this.wayPoints.first.fullName ? '???' : this.wayPoints.first.fullName ) +
				' ⮞ ' +
				( '' === this.wayPoints.last.fullName ? '???' : this.wayPoints.last.fullName );
		}

		return computedName;
	}

	/**
	the objId of the Route. objId are unique identifier given by the code
	@readonly
	@type {!number}
	*/

	get objId ( ) { return this.#objId; }

	/**
	the ObjType of the Route.
	@type {ObjType}
	@readonly
	*/

	get objType ( ) { return OUR_OBJ_TYPE; }

	/**
	This method verify that all waypoints have valid coordinates ( reminder: a route have always a startpoint
	and an endpoint!)
	@return {boolean} true when all waypoints have valid coordinates
	@private
	*/

	haveValidWayPoints ( ) {
		let haveValidWayPoints = true;
		this.wayPoints.forEach (
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
	An object literal with the WayPoint properties and without any methods.
	This object can be used with the JSON object
	@type {Object}
	*/

	get jsonObject ( ) {
		return {
			name : this.name,
			wayPoints : this.wayPoints.jsonObject,
			notes : this.notes.jsonObject,
			itinerary : this.itinerary.jsonObject,
			width : this.width,
			color : this.color,
			dashArray : this.dashArray,
			chain : this.chain,
			distance : parseFloat ( this.distance.toFixed ( DISTANCE.fixed ) ),
			duration : this.duration,
			editionStatus : this.editionStatus,
			hidden : this.hidden,
			chainedDistance : parseFloat ( this.chainedDistance.toFixed ( DISTANCE.fixed ) ),
			objId : this.#objId,
			objType : OUR_OBJ_TYPE.jsonObject
		};
	}
	set jsonObject ( something ) {
		let otherthing = this.#validateObject ( something );
		this.name = otherthing.name || '';
		this.wayPoints.jsonObject = otherthing.wayPoints || [];
		this.notes.jsonObject = otherthing.notes || [];
		this.itinerary.jsonObject = otherthing.itinerary || new Itinerary ( ).jsonObject;
		this.width = otherthing.width || theConfig.route.width;
		this.color = otherthing.color || '\u0023000000';
		this.dashArray = otherthing.dashArray || ZERO;
		this.chain = otherthing.chain || false;
		this.distance = otherthing.distance;
		this.duration = otherthing.duration;
		this.editionStatus = otherthing.editionStatus || ROUTE_EDITION_STATUS.notEdited;
		this.hidden = otherthing.hidden || false;
		this.chainedDistance = otherthing.chainedDistance;
		this.#objId = ObjId.nextObjId;
		this.validateData ( );
	}

	/*
	This method verify that the data stored in the object have the correct type, and,
	for html string data, that they not contains invalid tags and attributes.
	This method must be called each time the data are modified by the user or when
	a file is opened
	*/

	validateData ( ) {
		if ( 'string' === typeof ( this.name ) ) {
			this.name = theHTMLSanitizer.sanitizeToJsString ( this.name );
		}
		else {
			this.name = '';
		}
		if ( 'number' !== typeof ( this.width ) ) {
			this.width = theConfig.route.width;
		}
		if ( 'string' === typeof ( this.color ) ) {
			this.color = theHTMLSanitizer.sanitizeToColor ( this.color ) || theConfig.route.color;
		}
		else {
			this.color = theConfig.route.color;
		}
		if ( 'number' !== typeof ( this.dashArray ) ) {
			this.dashArray = ZERO;
		}
		if ( this.dashArray >= theConfig.route.dashChoices.length ) {
			this.dashArray = ZERO;
		}
		if ( 'boolean' !== typeof ( this.chain ) ) {
			this.chain = false;
		}
		if ( 'number' !== typeof ( this.distance ) ) {
			this.distance = DISTANCE.defaultValue;
		}
		if ( 'number' !== typeof ( this.duration ) ) {
			this.duration = DISTANCE.defaultValue;
		}
		if ( 'number' !== typeof ( this.editionStatus ) ) {
			this.editionStatus = ROUTE_EDITION_STATUS.notEdited;
		}
		if ( 'boolean' !== typeof ( this.hidden ) ) {
			this.hidden = false;
		}
		if ( 'number' !== typeof ( this.chainedDistance ) ) {
			this.chainedDistance = DISTANCE.defaultValue;
		}
	}
}

export default Route;

/*
--- End of Route.js file ------------------------------------------------------------------------------------------------------
*/