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
	- v1.8.0:
		- Issue #100 : Fix circular dependancies with Collection
Doc reviewed 20200731
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/**
@----------------------------------------------------------------------------------------------------------------------

@file Itinerary.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@----------------------------------------------------------------------------------------------------------------------
*/

/**
@----------------------------------------------------------------------------------------------------------------------

@module Itinerary
@private

@----------------------------------------------------------------------------------------------------------------------
*/

/* eslint no-fallthrough: ["error", { "commentPattern": "eslint break omitted intentionally" }]*/

import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';
import { newCollection } from '../data/Collection.js';
import { newItineraryPoint } from '../data/ItineraryPoint.js';
import { newManeuver } from '../data/Maneuver.js';
import { ZERO } from '../util/Constants.js';

const ourObjType = newObjType ( 'Itinerary' );

/**
@----------------------------------------------------------------------------------------------------------------------

@function myNewItinerary
@desc Constructor for an Itinerary object
@return {Itinerary} an instance of a Itinerary object
@private

@----------------------------------------------------------------------------------------------------------------------
*/

function myNewItinerary ( ) {

	let myHasProfile = false;
	let myAscent = ZERO;
	let myDescent = ZERO;
	let myProvider = '';
	let myTransitMode = '';
	let myItineraryPoints = newCollection ( newItineraryPoint );
	let myManeuvers = newCollection ( newManeuver );
	let myObjId = newObjId ( );

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myValidate
	@desc verify that the parameter can be transformed to a Itinerary and performs the upgrate if needed
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
				something.hasProfile = false;
				something.ascent = ZERO;
				something.descent = ZERO;
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
					throw new Error ( 'No ' + property + ' for ' + ourObjType.name );
				}
			}
		);
		return something;
	}

	/**
	@------------------------------------------------------------------------------------------------------------------

	@class Itinerary
	@classdesc This class represent an itinerary
	@see {@link newItinerary} for constructor
	@hideconstructor

	@------------------------------------------------------------------------------------------------------------------
	*/

	class Itinerary	{

		/**
		a boolean set to true when the itinerary have a profile
		@type {boolean}
		*/

		get hasProfile ( ) { return myHasProfile; }
		set hasProfile ( HasProfile ) { myHasProfile = HasProfile; }

		/**
		the ascent of the Itinerary when a profile exists, otherwise ZERO
		@type {!number}
		*/

		get ascent ( ) { return myAscent; }
		set ascent ( Ascent ) { myAscent = Ascent; }

		/**
		the descent of the Itinerary when a profile exists, otherwise ZERO
		@type {!number}
		*/

		get descent ( ) { return myDescent; }
		set descent ( Descent ) { myDescent = Descent; }

		/**
		a Collection of ItineraryPoints
		@type {Collection.<ItineraryPoint>}
		@readonly
		*/

		get itineraryPoints ( ) { return myItineraryPoints; }

		/**
		a Collection of Maneuvers
		@type {Collection.<Maneuver>}
		@readonly
		*/

		get maneuvers ( ) { return myManeuvers; }

		/**
		the provider name used for this Itinerary
		@type {string}
		*/

		get provider ( ) { return myProvider; }
		set provider ( Provider ) { myProvider = Provider; }

		/**
		the transit mode used for this Itinerary
		@type {string}
		*/

		get transitMode ( ) { return myTransitMode; }
		set transitMode ( TransitMode ) { myTransitMode = TransitMode; }

		/**
		the objId of the Itinerary. objId are unique identifier given by the code
		@readonly
		@type {!number}
		*/

		get objId ( ) { return myObjId; }

		/**
		the ObjType of the Itinerary.
		@type {ObjType}
		@readonly
		*/

		get objType ( ) { return ourObjType; }

		/**
		An object literal with the Itinerary properties and without any methods.
		This object can be used with the JSON object
		@type {Object}
		*/

		get jsonObject ( ) {
			return {
				hasProfile : myHasProfile,
				ascent : myAscent,
				descent : myDescent,
				itineraryPoints : myItineraryPoints.jsonObject,
				maneuvers : myManeuvers.jsonObject,
				provider : myProvider,
				transitMode : myTransitMode,
				objId : myObjId,
				objType : ourObjType.jsonObject
			};
		}
		set jsonObject ( something ) {
			let otherthing = myValidate ( something );
			myHasProfile = otherthing.hasProfile || false;
			myAscent = otherthing.ascent || ZERO;
			myDescent = otherthing.descent || ZERO;
			myItineraryPoints.jsonObject = otherthing.itineraryPoints || [];
			myManeuvers.jsonObject = otherthing.maneuvers || [];
			myProvider = otherthing.provider || '';
			myTransitMode = otherthing.transitMode || '';
			myObjId = newObjId ( );

			// rebuilding links between maneuvers and itineraryPoints
			let itineraryPointObjIdMap = new Map ( );
			let sourceCounter = ZERO;
			let targetIterator = myItineraryPoints.iterator;
			while ( ! targetIterator.done ) {
				itineraryPointObjIdMap.set ( otherthing.itineraryPoints [ sourceCounter ].objId, targetIterator.value.objId );
				sourceCounter ++;
			}
			let maneuverIterator = myManeuvers.iterator;
			while ( ! maneuverIterator.done ) {
				maneuverIterator.value.itineraryPointObjId =
					itineraryPointObjIdMap.get ( maneuverIterator.value.itineraryPointObjId );
			}
		}
	}
	return Object.seal ( new Itinerary );
}

export {

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function newItinerary
	@desc Constructor for an Itinerary object
	@return {Itinerary} an instance of a Itinerary object
	@global

	@------------------------------------------------------------------------------------------------------------------
	*/

	myNewItinerary as newItinerary
};

/*
--- End of Itinerary.js file ------------------------------------------------------------------------------------------
*/