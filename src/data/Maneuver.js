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
		- Issue #65 : Time to go to ES6 modules?
	- v2.0.0:
		- Issue #138 : Protect the app - control html entries done by user.
Doc reviewed 20200730
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Maneuver.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module Maneuver
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/* eslint no-fallthrough: ["error", { "commentPattern": "eslint break omitted intentionally" }]*/

import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';
import { theHTMLSanitizer } from '../util/HTMLSanitizer.js';
import { DISTANCE, INVALID_OBJ_ID } from '../util/Constants.js';

const ourObjType = newObjType ( 'Maneuver' );
const ourObjIds = new WeakMap ( );

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourValidate
@desc verify that the parameter can be transformed to a Maneuver and performs the upgrate if needed
@param {Object} something an object to validate
@return {Object} the validated object
@throws {Error} when the parameter is invalid
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourValidate ( something ) {
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
		case '1.7.0' :
		case '1.7.1' :
		case '1.8.0' :
		case '1.9.0' :
		case '1.10.0' :
		case '1.11.0' :
			if ( 'kArriveDefault' === something.iconName ) {
				something.distance = DISTANCE.defaultValue;
			}
			// eslint break omitted intentionally
		case '1.12.0' :
		case '1.13.0' :
			something.objType.version = '2.0.0';
			break;
		default :
			throw new Error ( 'invalid version for ' + ourObjType.name );
		}
	}
	let properties = Object.getOwnPropertyNames ( something );
	[ 'iconName', 'instruction', 'distance', 'duration', 'itineraryPointObjId', 'objId' ].forEach (
		property => {
			if ( ! properties.includes ( property ) ) {
				throw new Error ( 'No ' + property + ' for ' + ourObjType.name );
			}
		}
	);
	return something;
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class Maneuver
@classdesc This class represent a maneuver
@see {@link newManeuver} for constructor
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class Maneuver {

	constructor ( ) {

		/**
		The icon displayed with the Maneuver in the roadbook
		@type {string}
		*/

		this.iconName = '';

		/**
		The instruction of the Maneuver
		@type {string}
		*/

		this.instruction = '';

		/**
		The objId of the ItineraryPoint at the same position than the Maneuver
		@type {!number}
		*/

		this.itineraryPointObjId = INVALID_OBJ_ID;

		/**
		The distance between the Maneuver and the next Maneuver
		@type {number}
		*/

		this.distance = DISTANCE.defaultValue;

		/**
		The time between the Maneuver and the next Maneuver
		@type {number}
		*/

		this.duration = DISTANCE.defaultValue;

		ourObjIds.set ( this, newObjId ( ) );

	}

	/**
	the ObjType of the Maneuver.
	@type {ObjType}
	@readonly
	*/

	get objType ( ) { return ourObjType; }

	/**
	the objId of the Maneuver. objId are unique identifier given by the code
	@readonly
	@type {!number}
	*/

	get objId ( ) { return ourObjIds.get ( this ); }

	/**
	An object literal with the Maneuver properties and without any methods.
	This object can be used with the JSON object
	@type {Object}
	*/

	get jsonObject ( ) {
		return {
			iconName : this.iconName,
			instruction : this.instruction,
			distance : parseFloat ( this.distance.toFixed ( DISTANCE.fixed ) ),
			duration : this.duration,
			itineraryPointObjId : this.itineraryPointObjId,
			objId : ourObjIds.get ( this ),
			objType : ourObjType.jsonObject
		};
	}
	set jsonObject ( something ) {
		let otherthing = ourValidate ( something );
		this.iconName = otherthing.iconName || '';
		this.instruction = otherthing.instruction || '';
		this.distance = otherthing.distance || DISTANCE.defaultValue;
		this.duration = otherthing.duration || DISTANCE.defaultValue;
		this.itineraryPointObjId = otherthing.itineraryPointObjId || INVALID_OBJ_ID;
		ourObjIds.set ( this, newObjId ( ) );
		this.validateData ( );
	}

	validateData ( ) {
		if ( 'string' === typeof ( this.iconName ) ) {
			this.iconName = theHTMLSanitizer.validateString ( this.iconName );
		}
		else {
			this.iconName = '';
		}
		if ( 'string' === typeof ( this.instruction ) ) {
			this.instruction = theHTMLSanitizer.validateString ( this.instruction );
		}
		else {
			this.instruction = '';
		}
		if ( 'number' !== typeof ( this.distance ) ) {
			this.distance = DISTANCE.defaultValue;
		}
		if ( 'number' !== typeof ( this.duration ) ) {
			this.duration = DISTANCE.defaultValue;
		}
		if ( 'number' !== typeof ( this.itineraryPointObjId ) ) {
			this.itineraryPointObjId = INVALID_OBJ_ID;
		}
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewManeuver
@desc Constructor for a Maneuver object
@return {Maneuver} an instance of a Maneuver object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewManeuver ( ) {
	return Object.seal ( new Maneuver );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newManeuver
	@desc Construct a Maneuver object
	@return {Maneuver} an instance of a Maneuver object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewManeuver as newManeuver
};

/*
--- End of Maneuver.js file ---------------------------------------------------------------------------------------------------
*/