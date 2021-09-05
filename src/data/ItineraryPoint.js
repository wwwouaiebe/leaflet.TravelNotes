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
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
	- v1.7.0:
		- Issue ♯89 : Add elevation graph
	- v2.0.0:
		- Issue ♯138 : Protect the app - control html entries done by user.
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file ItineraryPoint.js
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

import ObjId from '../data/ObjId.js';
import ObjType from '../data/ObjType.js';
import { ELEV, LAT_LNG, DISTANCE, ZERO, ONE, INVALID_OBJ_ID } from '../main/Constants.js';

const OUR_OBJ_TYPE = new ObjType ( 'ItineraryPoint' );

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ItineraryPoint
@classdesc This class represent an itinerary point
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ItineraryPoint {

	#objId = INVALID_OBJ_ID;;

	/**
	performs the upgrade from previous versions
	@param {Object} itineraryPoint an itineraryPoint to upgrade
	@throws {Error} when the itineraryPoint version is invalid
	@private
	*/

	#upgradeObject ( itineraryPoint ) {
		switch ( itineraryPoint.objType.version ) {
		case '1.0.0' :
		case '1.1.0' :
		case '1.2.0' :
		case '1.3.0' :
		case '1.4.0' :
		case '1.5.0' :
		case '1.6.0' :
			itineraryPoint.elev = ELEV.defaultValue;
			// eslint break omitted intentionally
		case '1.7.0' :
		case '1.7.1' :
		case '1.8.0' :
		case '1.9.0' :
		case '1.10.0' :
		case '1.11.0' :
		case '1.12.0' :
		case '1.13.0' :
		case '2.0.0' :
		case '2.1.0' :
		case '2.2.0' :
			itineraryPoint.objType.version = '2.3.0';
			break;
		default :
			throw new Error ( 'invalid version for ' + OUR_OBJ_TYPE.name );
		}
	}

	/**
	Verify that the parameter can be transformed to an ItineraryPoint and performs the upgrate if needed
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
		[ 'lat', 'lng', 'distance', 'elev', 'objId' ].forEach (
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
		the latitude of the ItineraryPoint
		@type {number}
		*/

		this.lat = LAT_LNG.defaultValue;

		/**
		the longitude of the ItineraryPoint
		@type {number}
		*/

		this.lng = LAT_LNG.defaultValue;

		/**
		the distance between the beginning of the itinerary and the ItineraryPoint
		@type {number}
		*/

		this.distance = DISTANCE.defaultValue;

		/**
		the elevation (if any)  of the ItineraryPoint
		@type {number}
		*/

		this.elev = ELEV.defaultValue;

		this.#objId = ObjId.nextObjId;

		Object.seal ( this );
	}

	/**
	the latitude and longitude of the ItineraryPoint
	@type {number[]}
	*/

	get latLng ( ) { return [ this.lat, this.lng ]; }
	set latLng ( LatLng ) {
		this.lat = LatLng [ ZERO ];
		this.lng = LatLng [ ONE ];
	}

	/**
	the ObjType of the WayPoint.
	@type {ObjType}
	@readonly
	*/

	get objType ( ) { return OUR_OBJ_TYPE; }

	/**
	the objId of the ItineraryPoint. objId are unique identifier given by the code
	@readonly
	@type {!number}
	*/

	get objId ( ) { return this.#objId; }

	/**
	An object literal with the ItineraryPoint properties and without any methods.
	This object can be used with the JSON object
	@type {Object}
	*/

	get jsonObject ( ) {
		return {
			lat : parseFloat ( this.lat.toFixed ( LAT_LNG.fixed ) ),
			lng : parseFloat ( this.lng.toFixed ( LAT_LNG.fixed ) ),
			distance : parseFloat ( this.distance.toFixed ( DISTANCE.fixed ) ),
			elev : parseFloat ( this.elev.toFixed ( ELEV.fixed ) ),
			objId : this.#objId,
			objType : OUR_OBJ_TYPE.jsonObject
		};
	}

	set jsonObject ( something ) {
		let otherthing = this.#validateObject ( something );
		this.lat = otherthing.lat || LAT_LNG.defaultValue;
		this.lng = otherthing.lng || LAT_LNG.defaultValue;
		this.distance = otherthing.distance || DISTANCE.defaultValue;
		this.elev = otherthing.elev || ELEV.defaultValue;
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
		if ( 'number' !== typeof ( this.lat ) ) {
			this.lat = LAT_LNG.defaultValue;
		}
		if ( 'number' !== typeof ( this.lng ) ) {
			this.lng = LAT_LNG.defaultValue;
		}
		if ( 'number' !== typeof ( this.distance ) ) {
			this.distance = DISTANCE.defaultValue;
		}
		if ( 'number' !== typeof ( this.elev ) ) {
			this.elev = ELEV.defaultValue;
		}
	}
}

export default ItineraryPoint;

/*
--- End of ItineraryPoint.js file ---------------------------------------------------------------------------------------------
*/