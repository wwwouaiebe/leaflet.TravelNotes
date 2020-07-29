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
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20200728
Tests ...
*/

/**
@----------------------------------------------------------------------------------------------------------------------

@file WayPoint.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License

@----------------------------------------------------------------------------------------------------------------------
*/

/**
@----------------------------------------------------------------------------------------------------------------------

@module WayPoint

@----------------------------------------------------------------------------------------------------------------------
*/

import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';
import { newUtilities } from '../util/Utilities.js';
import { LAT_LNG, ZERO, ONE } from '../util/Constants.js';

const ourObjType = newObjType ( 'WayPoint' );

/**
@----------------------------------------------------------------------------------------------------------------------

@function newWayPoint
@desc constructor of WayPoint objects
@return {WayPoint} an instance of a WayPoint object
@private

@----------------------------------------------------------------------------------------------------------------------
*/

function newWayPoint ( ) {

	let myName = '';

	let myAddress = '';

	let myLat = LAT_LNG.defaultValue;

	let myLng = LAT_LNG.defaultValue;

	let myObjId = newObjId ( );

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myGetFullName
	@desc compute the full name of the wayPoint
	@return {string} the full name of the wayPoint
	@private

	@------------------------------------------------------------------------------------------------------------------
	*/

	function myGetFullName ( ) {
		let fullName = ( '' === myName ? myAddress : myName + ', ' + myAddress );
		if ( '' === fullName ) {
			fullName = newUtilities ( ).formatLatLng ( [ myLat, myLng ] );
		}

		return fullName;
	}

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myValidate
	@desc verify that the parameter can be transformed to a wayPoint and performs the upgrate if needed
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
				something.address = something.name;
				something.name = '';
				something.objType.version = '1.12.0';
				break;
			default :
				throw new Error ( 'invalid version for ' + ourObjType.name );
			}
		}
		let properties = Object.getOwnPropertyNames ( something );
		[ 'address', 'name', 'lat', 'lng', 'objId' ].forEach (
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

	@function myGetObject
	@desc transform the wayPoint into a object literal
	@return {Object} an object with the same properties than the wayPoint and without any methods.
	@private

	@------------------------------------------------------------------------------------------------------------------
	*/

	function myGetObject ( ) {
		return {
			name : myName,
			address : myAddress,
			lat : parseFloat ( myLat.toFixed ( LAT_LNG.fixed ) ),
			lng : parseFloat ( myLng.toFixed ( LAT_LNG.fixed ) ),
			objId : myObjId,
			objType : ourObjType.object
		};
	}

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function mySetObject
	@desc transform the an object literal into a wayPoint
	@param {Object} something an object to transform into a wayPoint
	@throws {Error} when the parameter cannot be transformed into a wayPoint
	@private

	@------------------------------------------------------------------------------------------------------------------
	*/

	function mySetObject ( something ) {
		let otherthing = myValidate ( something );
		myAddress = otherthing.address || '';
		myName = otherthing.name || '';
		myLat = otherthing.lat || LAT_LNG.defaultValue;
		myLng = otherthing.lng || LAT_LNG.defaultValue;
		myObjId = newObjId ( );
	}

	/*
	--- wayPoint object -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (

		/**
		@--------------------------------------------------------------------------------------------------------------

		@class
		@lends WayPoint.prototype

		@--------------------------------------------------------------------------------------------------------------
		*/

		{

			/**
			@classdesc class used to represent a wayPoint
			@hideconstructor
			@constructs
			 */

			// dummy constructor for jsdoc :-(
			dummy : () => {},

			/**
			the address of the wayPoint
			@type {string}
			*/

			get address ( ) { return myAddress; },
			set address ( Address ) { myAddress = Address; },

			/**
			the name of the wayPoint
			@type {string}
			*/

			get name ( ) { return myName; },
			set name ( Name ) { myName = Name; },

			/**
			the full name of the wayPoint. Full name is created with the name, address, latitude and longitude of the wayPoint
			@readonly
			@type {string}
			*/

			get fullName ( ) { return myGetFullName ( ); },

			/**
			the latitude of the wayPoint
			@type {number}
			*/

			get lat ( ) { return myLat; },
			set lat ( Lat ) { myLat = Lat; },

			/**
			the longitude of the wayPoint
			@type {number}
			*/

			get lng ( ) { return myLng; },
			set lng ( Lng ) { myLng = Lng; },

			/**
			the latitude and longitude of the wayPoint
			@type {number[]}
			*/

			get latLng ( ) { return [ myLat, myLng ]; },
			set latLng ( LatLng ) {
				myLat = LatLng [ ZERO ];
				myLng = LatLng [ ONE ];
			},

			/**
			the objId of the wayPoint. objId are unique identifier given by the code
			@readonly
			@type {!number}
			*/

			get objId ( ) { return myObjId; },

			/**
			the objType of the wayPoint. Always 'WayPoint'
			@readonly
			*/

			get objType ( ) { return ourObjType; },

			/**
			an object literal with the wayPoint properties and without any methods
			@type {Object}
			*/

			get object ( ) { return myGetObject ( ); },
			set object ( something ) { mySetObject ( something ); }
		}
	);
}

export {

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function newWayPoint
	@desc constructor of WayPoint objects
	@return {WayPoint} an instance of a WayPoint object

	@------------------------------------------------------------------------------------------------------------------
	*/

	newWayPoint
};

/*
--- End of WayPoint.js file -------------------------------------------------------------------------------------------
*/