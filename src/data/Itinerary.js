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
	- v1.8.0:
		- Issue ♯100 : Fix circular dependancies with Collection
	- v2.0.0:
		- Issue ♯138 : Protect the app - control html entries done by user.
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Itinerary.js
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
import Collection from '../data/Collection.js';
import ItineraryPoint from '../data/ItineraryPoint.js';
import Maneuver from '../data/Maneuver.js';
import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';
import { ZERO, INVALID_OBJ_ID } from '../main/Constants.js';

const OUR_OBJ_TYPE = new ObjType ( 'Itinerary' );

/**
@--------------------------------------------------------------------------------------------------------------------------

@class Itinerary
@classdesc This class represent an itinerary
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class Itinerary	{

	#objId = INVALID_OBJ_ID;;

	/**
	Performs the upgrade
	@param {Object} itinerary an itinerary to upgrade
	@throws {Error} when the itinerary version is invalid
	@private
	*/

	#upgradeObject ( itinerary ) {
		switch ( itinerary.objType.version ) {
		case '1.0.0' :
		case '1.1.0' :
		case '1.2.0' :
		case '1.3.0' :
		case '1.4.0' :
		case '1.5.0' :
		case '1.6.0' :
			itinerary.hasProfile = false;
			itinerary.ascent = ZERO;
			itinerary.descent = ZERO;
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
			itinerary.objType.version = '2.3.0';
			break;
		default :
			throw new Error ( 'invalid version for ' + OUR_OBJ_TYPE.name );
		}
	}

	/**
	Verify that the parameter can be transformed to a Itinerary and performs the upgrate if needed
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
		[ 	'hasProfile',
			'ascent',
			'descent',
			'itineraryPoints',
			'maneuvers',
			'provider',
			'transitMode',
			'objId' ].forEach (
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
		a boolean set to true when the itinerary have a profile
		@type {boolean}
		*/

		this.hasProfile = false;

		/**
		the ascent of the Itinerary when a profile exists, otherwise ZERO
		@type {!number}
		*/

		this.ascent = ZERO;

		/**
		the descent of the Itinerary when a profile exists, otherwise ZERO
		@type {!number}
		*/

		this.descent = ZERO;

		/**
		the provider name used for this Itinerary
		@type {string}
		*/

		this.provider = '';

		/**
		the transit mode used for this Itinerary
		@type {string}
		*/

		this.transitMode = '';

		/**
		a Collection of ItineraryPoints
		@type {Collection.<ItineraryPoint>}
		@readonly
		*/

		this.itineraryPoints = new Collection ( ItineraryPoint );

		/**
		a Collection of Maneuvers
		@type {Collection.<Maneuver>}
		@readonly
		*/

		this.maneuvers = new Collection ( Maneuver );

		this.#objId = ObjId.nextObjId;

		Object.seal ( this );
	}

	/**
	the ObjType of the Itinerary.
	@type {ObjType}
	@readonly
	*/

	get objType ( ) { return OUR_OBJ_TYPE; }

	/**
	the objId of the Itinerary. objId are unique identifier given by the code
	@readonly
	@type {!number}
	*/

	get objId ( ) { return this.#objId; }

	/**
	An object literal with the Itinerary properties and without any methods.
	This object can be used with the JSON object
	@type {Object}
	*/

	get jsonObject ( ) {
		return {
			hasProfile : this.hasProfile,
			ascent : this.ascent,
			descent : this.descent,
			itineraryPoints : this.itineraryPoints.jsonObject,
			maneuvers : this.maneuvers.jsonObject,
			provider : this.provider,
			transitMode : this.transitMode,
			objId : this.#objId,
			objType : OUR_OBJ_TYPE.jsonObject
		};
	}
	set jsonObject ( something ) {
		let otherthing = this.#validateObject ( something );
		this.hasProfile = otherthing.hasProfile || false;
		this.ascent = otherthing.ascent || ZERO;
		this.descent = otherthing.descent || ZERO;
		this.itineraryPoints.jsonObject = otherthing.itineraryPoints || [];
		this.maneuvers.jsonObject = otherthing.maneuvers || [];
		this.provider = otherthing.provider || '';
		this.transitMode = otherthing.transitMode || '';
		this.#objId = ObjId.nextObjId;

		// rebuilding links between maneuvers and itineraryPoints
		let itineraryPointObjIdMap = new Map ( );
		let sourceCounter = ZERO;
		let targetIterator = this.itineraryPoints.iterator;
		while ( ! targetIterator.done ) {
			itineraryPointObjIdMap.set ( otherthing.itineraryPoints [ sourceCounter ].objId, targetIterator.value.objId );
			sourceCounter ++;
		}
		let maneuverIterator = this.maneuvers.iterator;
		while ( ! maneuverIterator.done ) {
			maneuverIterator.value.itineraryPointObjId =
				itineraryPointObjIdMap.get ( maneuverIterator.value.itineraryPointObjId );
		}
		this.validateData ( );
	}

	/*
	This method verify that the data stored in the object have the correct type, and,
	for html string data, that they not contains invalid tags and attributes.
	This method must be called each time the data are modified by the user or when
	a file is opened
	*/

	validateData ( ) {
		if ( 'boolean' !== typeof ( this.hasProfile ) ) {
			this.hasProfile = false;
		}
		if ( 'number' !== typeof ( this.ascent ) ) {
			this.ascent = ZERO;
		}
		if ( 'number' !== typeof ( this.descent ) ) {
			this.descent = ZERO;
		}
		if ( 'string' === typeof ( this.provider ) ) {
			this.provider = theHTMLSanitizer.sanitizeToJsString ( this.provider );
		}
		else {
			this.provider = '';
		}
		if ( 'string' === typeof ( this.transitMode ) ) {
			this.transitMode = theHTMLSanitizer.sanitizeToJsString ( this.transitMode );
		}
		else {
			this.transitMode = '';
		}
	}
}

export default Itinerary;

/*
--- End of Itinerary.js file --------------------------------------------------------------------------------------------------
*/