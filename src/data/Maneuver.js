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
Doc reviewed 20200730
Tests ...
*/

/**
@----------------------------------------------------------------------------------------------------------------------

@file Maneuver.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License

@----------------------------------------------------------------------------------------------------------------------
*/

import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';
import { DISTANCE, INVALID_OBJ_ID } from '../util/Constants.js';

const ourObjType = newObjType ( 'Maneuver' );

/**
@----------------------------------------------------------------------------------------------------------------------

@function myNewManeuver
@desc Constructor for a Maneuver object
@return {Maneuver} an instance of a Maneuver object
@private

@----------------------------------------------------------------------------------------------------------------------
*/

function myNewManeuver ( ) {

	let myObjId = newObjId ( );

	let myIconName = '';

	let myInstruction = '';

	let myItineraryPointObjId = -1;

	let myDistance = DISTANCE.defaultValue;

	let myDuration = DISTANCE.defaultValue;

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myValidate
	@desc verify that the parameter can be transformed to a Maneuver and performs the upgrate if needed
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
	@------------------------------------------------------------------------------------------------------------------

	@class Maneuver
	@classdesc This class represent a maneuver
	@see {@link newManeuver} for constructor
	@hideconstructor

	@------------------------------------------------------------------------------------------------------------------
	*/

	class Maneuver {

		/**
		The icon displayed with the Maneuver in the roadbook
		@type {string}
		*/

		get iconName ( ) { return myIconName; }
		set iconName ( IconName ) { myIconName = IconName; }

		/**
		The instruction of the Maneuver
		@type {string}
		*/

		get instruction ( ) { return myInstruction; }
		set instruction ( Instruction ) { myInstruction = Instruction; }

		/**
		The objId of the ItineraryPoint at the same position than the Maneuver
		@type {!number}
		*/

		get itineraryPointObjId ( ) { return myItineraryPointObjId; }
		set itineraryPointObjId ( ItineraryPointObjId ) { myItineraryPointObjId = ItineraryPointObjId; }

		/**
		The distance between the Maneuver and the next Maneuver
		@type {number}
		*/

		get distance ( ) { return myDistance; }
		set distance ( Distance ) { myDistance = Distance; }

		/**
		The time between the Maneuver and the next Maneuver
		@type {number}
		*/

		get duration ( ) { return myDuration; }
		set duration ( Duration ) { myDuration = Duration; }

		/**
		the objId of the Maneuver. objId are unique identifier given by the code
		@readonly
		@type {!number}
		*/

		get objId ( ) { return myObjId; }

		/**
		the ObjType of the Maneuver.
		@type {ObjType}
		@readonly
		*/

		get objType ( ) { return ourObjType; }

		/**
		An object literal with the Maneuver properties and without any methods.
		This object can be used with the JSON object
		@type {Object}
		*/

		get object ( ) {
			return {
				iconName : myIconName,
				instruction : myInstruction,
				distance : parseFloat ( myDistance.toFixed ( DISTANCE.fixed ) ),
				duration : myDuration,
				itineraryPointObjId : myItineraryPointObjId,
				objId : myObjId,
				objType : ourObjType.object
			};
		}
		set object ( something ) {
			let otherthing = myValidate ( something );
			myIconName = otherthing.iconName || '';
			myInstruction = otherthing.instruction || '';
			myDistance = otherthing.distance || DISTANCE.defaultValue;
			myDuration = otherthing.duration || DISTANCE.defaultValue;
			myItineraryPointObjId = otherthing.itineraryPointObjId || INVALID_OBJ_ID;
			myObjId = newObjId ( );
		}
	}
	return Object.seal ( new Maneuver );
}

export {

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function newManeuver
	@desc Construct a Maneuver object
	@return {Maneuver} an instance of a Maneuver object
	@global

	@------------------------------------------------------------------------------------------------------------------
	*/

	myNewManeuver as newManeuver
};

/*
--- End of Maneuver.js file -------------------------------------------------------------------------------------------
*/