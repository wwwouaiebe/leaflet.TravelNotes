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
		- added next and previous method
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
	- v1.8.0:
		- Issue #100 : Fix circular dependancies with Collection
Doc reviewed 20200729
Tests ...
*/

/**
@----------------------------------------------------------------------------------------------------------------------

@file Collection.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@----------------------------------------------------------------------------------------------------------------------
*/

/**
@----------------------------------------------------------------------------------------------------------------------

@module Collection
@private

@----------------------------------------------------------------------------------------------------------------------
*/

import { ZERO, ONE, TWO, NOT_FOUND } from '../util/Constants.js';

/**
@----------------------------------------------------------------------------------------------------------------------

@function myNewCollection
@desc constructor of Collection objects
@param {constructor} objectConstructor the constructor of objects to be stored in the Collection
@return {Collection} an instance of a Collection object
@private

@----------------------------------------------------------------------------------------------------------------------
*/

function myNewCollection ( objectConstructor ) {

	const SWAP_UP = -1;
	const SWAP_DOWN = 1;

	const myObjectConstructor = objectConstructor;
	let myArray = [];

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function mySetObjName
	@desc Search the name of the objects added to the Collection
	@return {string} the name of the object
	@throws When the object returned by objectConstructor don't have a name
	@private

	@------------------------------------------------------------------------------------------------------------------
	*/

	function mySetObjName ( ) {
		let tmpObject = myObjectConstructor ( );
		if ( ( ! tmpObject.objType ) || ( ! tmpObject.objType.name ) ) {
			throw new Error ( 'invalid object name for collection' );
		}
		return tmpObject.objType.name;
	}

	/* ---------------------------------------------------------------------------------------------------------------*/

	const myObjName = mySetObjName ( );

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myAdd
	@desc Add an object at the end of the Collection
	@param {Object} object The object to add
	@throws when the object type is invalid
	@private

	@------------------------------------------------------------------------------------------------------------------
	*/

	function myAdd ( object ) {
		if ( ( ! object.objType ) || ( ! object.objType.name ) || ( object.objType.name !== myObjName ) ) {
			throw new Error ( 'invalid object name for add function' );
		}
		myArray.push ( object );
	}

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myIterator
	@desc Manage an iterator on the collection
	@return {CollectionIterator} An iterator on the Collection
	@private

	@------------------------------------------------------------------------------------------------------------------
	*/

	function myIterator ( ) {
		let index = NOT_FOUND;
		return {
			get value ( ) { return index < myArray.length ? myArray [ index ] : null; },
			get previous ( ) { return ZERO >= index ? null : myArray [ index - ONE ]; },
			get next ( ) { return index < myArray.length - ONE ? myArray [ index + ONE ] : null; },
			get done ( ) { return ++ index >= myArray.length; },
			get first ( ) { return ZERO === index; },
			get last ( ) { return index >= myArray.length - ONE; },
			get index ( ) { return index; }
		};
	}

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myIndexOfObjId
	@desc return the position of an object in the Collection
	@param {!number} objId The objId of the object to locate
	@return {number} the position of the object in the Collection
	@private

	@------------------------------------------------------------------------------------------------------------------
	*/

	function myIndexOfObjId ( objId ) {
		let index = myArray.findIndex (
			element => element.objId === objId
		);
		return index;
	}

	/**
	@typedef {Object} CollectionIterator
	@desc An iterator on the Collection
	@property {Object} value The object pointed by the iterator
	@property {?Object} previous The object before the object pointed by the iterator or null if the iterator
	is on the first object
	@property {?Object} next The object after the object pointed by the iterator or null if the iterator
	is on the last object
	@property {boolean} done Move the iterator to the next object and return true when the end of the Collection
	is reached
	@property {boolean} first True when the iterator is on the first object of the Collection
	@property {boolean} last True when the iterator is on the last object of the Collection
	@property {number} index The position of the iterator in the Collection
	*/

	/**
	@--------------------------------------------------------------------------------------------------------------

	@class
	@classdesc Class used to store objects in an iterable
	@see {@link newCollection} for constructor
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------
	*/

	class Collection {

		/**
		Add an object at the end of the collection
		@param {Object} object The object to add
		@throws when the object type is invalid
		*/

		add ( object ) { myAdd ( object ); }

		/**
		Executes a function on each object of the Collection and returns the final result
		@param {function} funct The function to execute
		@return The final result
		*/

		forEach ( funct ) {
			let result = null;
			let iterator = myIterator ( );
			while ( ! iterator.done ) {
				result = funct ( iterator.value, result );
			}
			return result;
		}

		/**
		Search an object in the Collection
		@param {!number} objId The objId of the object to search
		@return the object with the given objId or null when the object is not found
		*/

		getAt ( objId ) {
			let index = myIndexOfObjId ( objId );
			if ( NOT_FOUND === index ) {
				return null;
			}
			return myArray [ index ];
		}

		/**
		Move an object near another object in the Collection
		@param {!number} objId The objId of the object to move
		@param {!number} targetObjId The objId of the object near witch the object will be moved
		@param {boolean} moveBefore When true, the object is moved before the target, when false after the target
		@throws when objId or targetObjId are invalid
		*/

		moveTo ( objId, targetObjId, moveBefore ) {
			let oldPosition = myIndexOfObjId ( objId );
			let newPosition = myIndexOfObjId ( targetObjId );
			if ( NOT_FOUND === oldPosition || NOT_FOUND === newPosition ) {
				throw new Error ( 'invalid objId for function  myMoveTo' );
			}
			if ( ! moveBefore ) {
				newPosition ++;
			}
			myArray.splice ( newPosition, ZERO, myArray [ oldPosition ] );
			if ( newPosition < oldPosition ) {
				oldPosition ++;
			}
			myArray.splice ( oldPosition, ONE );
		}

		/**
		Remove an object from the Collection
		@param {!number} objId The objId of the object to remove
		@throws when the object is not found
		*/

		remove ( objId ) {
			let index = myIndexOfObjId ( objId );
			if ( NOT_FOUND === index ) {
				throw new Error ( 'invalid objId for remove function' );
			}
			myArray.splice ( myIndexOfObjId ( objId ), ONE );
		}

		/**
		Remove all objects from the Collection
		@param {?boolean} exceptFirstLast When true, first and last objects are not removed
		*/

		removeAll ( exceptFirstLast ) {
			if ( exceptFirstLast ) {
				myArray.splice ( ONE, myArray.length - TWO );
			}
			else {
				myArray.length = ZERO;
			}
		}

		/**
		Replace an object in the Collection with another object
		@param {!number} oldObjId the objId of the object to replace
		@param (Object) newObject The new object
		@throws when the object type of newObject is invalid or when the object to replace is not found
		*/

		replace ( oldObjId, newObject ) {
			let index = myIndexOfObjId ( oldObjId );
			if ( NOT_FOUND === index ) {
				throw new Error ( 'invalid objId for replace function' );
			}
			if ( ( ! newObject.objType ) || ( ! newObject.objType.name ) || ( newObject.objType.name !== myObjName ) ) {
				throw new Error ( 'invalid object name for replace function' );
			}
			myArray [ index ] = newObject;
		}

		/**
		Reverse the objects in the collection
		*/

		reverse ( ) { myArray.reverse ( ); }

		/**
		Sort the collection, using a function
		@param {function} compareFunction The function to use to compare objects in the Collection
		*/

		sort ( compareFunction ) { myArray.sort ( compareFunction ); }

		/**
		Reverse an Object with the previous or next object in the Collection
		@param {!number} objId The objId of the object to swap
		@param {boolean} swapUp When true the object is swapped with the previous one,
		when false with the next one
		@throws when the object is not found or when the swap is not possible
		*/

		swap ( objId, swapUp ) {
			let index = myIndexOfObjId ( objId );
			if (
				( NOT_FOUND === index )
				||
				( ( ZERO === index ) && swapUp )
				||
				( ( myArray.length - ONE === index ) && ( ! swapUp ) )
			) {
				throw new Error ( 'invalid objId for swap function' );
			}
			let tmp = myArray [ index ];
			myArray [ index ] = myArray [ index + ( swapUp ? SWAP_UP : SWAP_DOWN ) ];
			myArray [ index + ( swapUp ? SWAP_UP : SWAP_DOWN ) ] = tmp;
		}

		/**
		The first object of the Collection
		@readonly
		*/

		get first ( ) { return myArray [ ZERO ]; }

		/**
		An iterator on the Collection
		@type {CollectionIterator}
		@readonly
		@see {@link module:Collection~CollectionIterator}
		*/

		get iterator ( ) { return myIterator ( ); }

		/**
		The last object of the Collection
		@readonly
		*/

		get last ( ) { return myArray [ myArray.length - ONE ]; }

		/**
		The length of the Collection
		@readonly
		*/

		get length ( ) { return myArray.length; }

		/**
		an Array with the objects in the collection
		@type {Array}
		*/

		get jsonObject ( ) {
			let array = [ ];
			let iterator = myIterator ( );
			while ( ! iterator.done ) {
				array.push ( iterator.value.jsonObject );
			}

			return array;
		}
		set jsonObject ( something ) {
			myArray.length = ZERO;
			let newObject = null;

			something.forEach (
				arrayObject => {
					newObject = myObjectConstructor ( );
					newObject.jsonObject = arrayObject;
					myAdd ( newObject );
				}
			);
		}
	}

	return Object.seal ( new Collection );
}

export {

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function newCollection
	@desc constructor of Collection objects
	@param {constructor} objectConstructor the constructor of objects to be stored in the Collection
	@return {Collection} an instance of a Collection object
	@global

	@------------------------------------------------------------------------------------------------------------------
	*/

	myNewCollection as newCollection
};

/*
--- End of Collection.js file -----------------------------------------------------------------------------------------
*/