/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
		- Issue #65 : Time to go to ES6 modules?
	- v1.7.0:
		- issue #89 : Add elevation graph
Doc reviewed 20200730
Tests ...
*/

/**
@----------------------------------------------------------------------------------------------------------------------

@file ItineraryPoint.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@----------------------------------------------------------------------------------------------------------------------
*/

/**
@----------------------------------------------------------------------------------------------------------------------

@module ItineraryPoint
@private

@----------------------------------------------------------------------------------------------------------------------
*/

/* eslint no-fallthrough: ["error", { "commentPattern": "eslint break omitted intentionally" }]*/

import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';
import { ELEV, LAT_LNG, DISTANCE, ZERO, ONE } from '../util/Constants.js';

const ourObjType = newObjType ( 'ItineraryPoint' );

/**
@----------------------------------------------------------------------------------------------------------------------

@function myNewItineraryPoint
@desc Constructor for an ItineraryPoint object
@return {ItineraryPoint} an instance of a ItineraryPoint object
@private

@----------------------------------------------------------------------------------------------------------------------
*/

function myNewItineraryPoint ( ) {

	let myLat = LAT_LNG.defaultValue;

	let myLng = LAT_LNG.defaultValue;

	let myDistance = DISTANCE.defaultValue;

	let myElev = ELEV.defaultValue;

	let myObjId = newObjId ( );

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myValidate
	@desc verify that the parameter can be transformed to an ItineraryPoint and performs the upgrate if needed
	@param {Object} something an object to validate
	@return {Object} the validated object
	@throws {Error} when the parameter is invalid
	@private

	@------------------------------------------------------------------------------------------------------------------
	*/

	function myValidate ( something ) {
		if ( ! Object.getOwnPropertyNames ( something ).includes ( 'objType' ) ) {
			throw new Error ( 'No objType for ' + ourObjType.name );
		}
		ourObjType.validate ( something.objType );
		if ( ourObjType.version !== something.objType.version ) {
			switch ( something.objType.version ) {
			case '1.0.0' :
			case '1.1.0' :
			case '1.2.0' :
			case '1.3.0' :
			case '1.4.0' :
			case '1.5.0' :
			case '1.6.0' :
				something.elev = ELEV.defaultValue;
				// eslint break omitted intentionally
			case '1.7.0' :
			case '1.7.1' :
			case '1.8.0' :
			case '1.9.0' :
			case '1.10.0' :
			case '1.11.0' :
				something.objType.version = '1.12.0';
				break;
			default :
				throw new Error ( 'invalid version for ' + ourObjType.name );
			}
		}
		let properties = Object.getOwnPropertyNames ( something );
		[ 'lat', 'lng', 'distance', 'elev', 'objId' ].forEach (
			property => {
				if ( ! properties.includes ( property ) ) {
					throw new Error ( 'No ' + property + ' for ' + ourObjType.name );
				}
			}
		);
		return something;
	}

	/**
	@------------------------------------------------------------------------------------------------------------------

	@class ItineraryPoint
	@classdesc This class represent an itinerary point
	@see {@link newItineraryPoint} for constructor
	@hideconstructor

	@------------------------------------------------------------------------------------------------------------------
	*/

	class ItineraryPoint {

		/**
		the latitude of the ItineraryPoint
		@type {number}
		*/

		get lat ( ) { return myLat; }
		set lat ( Lat ) { myLat = Lat; }

		/**
		the longitude of the ItineraryPoint
		@type {number}
		*/

		get lng ( ) { return myLng; }
		set lng ( Lng ) { myLng = Lng; }

		/**
		the latitude and longitude of the ItineraryPoint
		@type {number[]}
		*/

		get latLng ( ) { return [ myLat, myLng ]; }
		set latLng ( LatLng ) {
			myLat = LatLng [ ZERO ];
			myLng = LatLng [ ONE ];
		}

		/**
		the distance between the beginning of the itinerary and the ItineraryPoint
		@type {number}
		*/

		get distance ( ) { return myDistance; }
		set distance ( Distance ) { myDistance = Distance; }

		/**
		the elevation (if any)  of the ItineraryPoint
		@type {number}
		*/

		get elev ( ) { return myElev; }
		set elev ( Elev ) { myElev = Elev; }

		/**
		the objId of the ItineraryPoint. objId are unique identifier given by the code
		@readonly
		@type {!number}
		*/

		get objId ( ) { return myObjId; }

		/**
		the ObjType of the WayPoint.
		@type {ObjType}
		@readonly
		*/

		get objType ( ) { return ourObjType; }

		/**
		An object literal with the ItineraryPoint properties and without any methods.
		This object can be used with the JSON object
		@type {Object}
		*/

		get jsonObject ( ) {
			return {
				lat : parseFloat ( myLat.toFixed ( LAT_LNG.fixed ) ),
				lng : parseFloat ( myLng.toFixed ( LAT_LNG.fixed ) ),
				distance : parseFloat ( myDistance.toFixed ( DISTANCE.fixed ) ),
				elev : parseFloat ( myElev.toFixed ( ELEV.fixed ) ),
				objId : myObjId,
				objType : ourObjType.jsonObject
			};
		}
		set jsonObject ( something ) {
			let otherthing = myValidate ( something );
			myLat = otherthing.lat || LAT_LNG.defaultValue;
			myLng = otherthing.lng || LAT_LNG.defaultValue;
			myDistance = otherthing.distance || DISTANCE.defaultValue;
			myElev = otherthing.elev || ELEV.defaultValue;
			myObjId = newObjId ( );
		}
	}

	return Object.seal ( new ItineraryPoint );
}

export {

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function newItineraryPoint
	@desc Constructor an ItineraryPoint object
	@return {ItineraryPoint} an instance of a ItineraryPoint object
	@global

	@------------------------------------------------------------------------------------------------------------------
	*/

	myNewItineraryPoint as newItineraryPoint
};

/*
--- End of ItineraryPoint.js file -------------------------------------------------------------------------------------
*/