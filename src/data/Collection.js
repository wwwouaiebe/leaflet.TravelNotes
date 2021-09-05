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
		- added next and previous method
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
	- v1.8.0:
		- Issue ♯100 : Fix circular dependancies with Collection
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Collection.js
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

import { ZERO, ONE, TWO, NOT_FOUND } from '../main/Constants.js';

const OUR_SWAP_UP = -1;
const OUR_SWAP_DOWN = 1;
const OUR_NEXT = 1;
const OUR_PREVIOUS = -1;

/**
@--------------------------------------------------------------------------------------------------------------------------

@class CollectionIterator
@classdesc iterator for Collection class
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class CollectionIterator {

	/**
	The collection used by the iterator
	*/

	#collection = null;

	/**
	The current index
	*/

	#index = NOT_FOUND;

	/*
	constructor
	*/

	constructor ( collection ) {
		this.#collection = collection;
		Object.freeze ( this );
	}

	/**
	The object pointed by the iterator
	@type {Object}
	@readonly
	*/

	get value ( ) { return this.#index < this.#collection.length ? this.#collection.at ( this.#index ) : null; }

	/**
	The object before the object pointed by the iterator or null if iterator is on the first object
	@type {Object}
	@readonly
	*/

	get previous ( ) { return ZERO >= this.#index ? null : this.#collection.at ( this.#index - ONE ); }

	/**
	The object after the object pointed by the iterator or null if iterator is on the last object
	@type {Object}
	@readonly
	*/

	get next ( ) { return this.#index < this.#collection.length - ONE ? this.#collection.at ( this.#index + ONE ) : null; }

	/**
	Move the iterator to the next object and return true when the end of the Collection is reached
	@type {boolean}
	@readonly
	*/

	get done ( ) { return ++ this.#index >= this.#collection.length; }

	/**
	returns true when the iterator is on the first object
	@type {boolean}
	@readonly
	*/

	get first ( ) { return ZERO === this.#index; }

	/**
	returns true when the iterator is on the last object
	@type {boolean}
	@readonly
	*/

	get last ( ) { return this.#index >= this.#collection.length - ONE; }

	/**
	returns The position of the iterator in the Collection
	@type {number}
	@readonly
	*/

	get index ( ) { return this.#index; }
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class Collection
@classdesc Class used to store objects in an iterable
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class Collection {

	/**
	The array where objects are stored
	@private
	*/

	#array = [];

	/**
	The class name of objects stored in the collection
	@private
	*/

	#objName = '';

	/*
	The class definition of objects stored in the collection
	@private
	*/

	#classCollection = null;

	/**
	Return the position of an object in the Collection
	@param {!number} objId The objId of the object to locate
	@return {number} the position of the object in the Collection
	@private
	*/

	#indexOfObjId ( objId ) {
		let index = this.#array.findIndex (
			element => element.objId === objId
		);
		return index;
	}

	/**
	Gives the previous or next object in the collection that fullfil a given condition
	@param {!number} objId The objId of the object from witch the search start
	@param {?function} condition A fonction used to compare the objects. If null, ( ) => true is used
	@param (!number} direction The direction to follow. Must be OUR_NEXT or OUR_PREVIOUS
	@return (?Object) An object or null if nothing found
	@throws When direction is not OUR_NEXT or OUR_PREVIOUS or when the starting object is not found
	@private
	*/

	#nextOrPrevious ( objId, condition, direction ) {
		let index = this.#indexOfObjId ( objId );
		if ( NOT_FOUND === index ) {
			throw new Error ( 'invalid objId for next or previous function' );
		}
		if ( direction !== OUR_NEXT && direction !== OUR_PREVIOUS ) {
			throw new Error ( 'invalid direction' );
		}

		let otherCondition = condition;
		if ( ! otherCondition ) {
			otherCondition = ( ) => true;
		}
		index += direction;

		while ( ( NOT_FOUND < index ) && ( index < this.#array.length ) && ! otherCondition ( this.#array [ index ] ) ) {
			index += direction;
		}
		if ( NOT_FOUND === index || this.#array.length === index ) {
			return null;
		}

		return this.#array [ index ];
	}

	/*
	constructor
	@param {class} classCollection The class of objects that have to be stored in the collection
	*/

	constructor ( classCollection ) {
		this.#classCollection = classCollection;
		let tmpObject = new classCollection ( );
		if ( ( ! tmpObject.objType ) || ( ! tmpObject.objType.name ) ) {
			throw new Error ( 'invalid object name for collection' );
		}
		this.#objName = tmpObject.objType.name;
		Object.freeze ( this );
	}

	/**
	Add an object at the end of the collection
	@param {Object} object The object to add
	@throws when the object type is invalid
	*/

	add ( object ) {
		if ( ( ! object.objType ) || ( ! object.objType.name ) || ( object.objType.name !== this.#objName ) ) {
			throw new Error ( 'invalid object name for add function' );
		}
		this.#array.push ( object );
	}

	/**
	Search an object in the collection with the index
	@param {!number} index The position of the desired object in the array
	@return the object at the position or null if not found
	*/

	at ( index ) {
		if ( index < this.#array.length && index > NOT_FOUND ) {
			return this.#array [ index ];
		}
		return null;
	}

	/**
	Executes a function on each object of the Collection and returns the final result
	@param {function} funct The function to execute
	@return The final result
	*/

	forEach ( funct ) {
		let result = null;
		let iterator = this.iterator;
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
		let index = this.#indexOfObjId ( objId );
		if ( NOT_FOUND === index ) {
			return null;
		}
		return this.#array [ index ];
	}

	/**
	Move an object near another object in the Collection
	@param {!number} objId The objId of the object to move
	@param {!number} targetObjId The objId of the object near witch the object will be moved
	@param {boolean} moveBefore When true, the object is moved before the target, when false after the target
	@throws when objId or targetObjId are invalid
	*/

	moveTo ( objId, targetObjId, moveBefore ) {
		let oldPosition = this.#indexOfObjId ( objId );
		let newPosition = this.#indexOfObjId ( targetObjId );
		if ( NOT_FOUND === oldPosition || NOT_FOUND === newPosition ) {
			throw new Error ( 'invalid objId for function  myMoveTo' );
		}
		if ( ! moveBefore ) {
			newPosition ++;
		}
		this.#array.splice ( newPosition, ZERO, this.#array [ oldPosition ] );
		if ( newPosition < oldPosition ) {
			oldPosition ++;
		}
		this.#array.splice ( oldPosition, ONE );
	}

	/**
	@desc gives the next object in the collection that fullfil a given condition
	@param {!number} objId The objId of the object from witch the search start
	@param {?function} condition A fonction used to compare the objects. If null, ( ) => true is used
	@return (?Object) An object or null if nothing found
	@throws When the starting object is not found
	*/

	next ( objId, condition ) { return this.#nextOrPrevious ( objId, condition, OUR_NEXT ); }

	/**
	@desc gives the previous object in the collection that fullfil a given condition
	@param {!number} objId The objId of the object from witch the search start
	@param {?function} condition A fonction used to compare the objects. If null, ( ) => true is used
	@return (?Object) An object or null if nothing found
	@throws When the starting object is not found
	*/

	previous ( objId, condition ) { return this.#nextOrPrevious ( objId, condition, OUR_PREVIOUS ); }

	/**
	Remove an object from the Collection
	@param {!number} objId The objId of the object to remove
	@throws when the object is not found
	*/

	remove ( objId ) {
		let index = this.#indexOfObjId ( objId );
		if ( NOT_FOUND === index ) {
			throw new Error ( 'invalid objId for remove function' );
		}
		this.#array.splice ( this.#indexOfObjId ( objId ), ONE );
	}

	/**
	Remove all objects from the Collection
	@param {?boolean} exceptFirstLast When true, first and last objects are not removed
	*/

	removeAll ( exceptFirstLast ) {
		if ( exceptFirstLast ) {
			this.#array.splice ( ONE, this.#array.length - TWO );
		}
		else {
			this.#array.length = ZERO;
		}
	}

	/**
	Replace an object in the Collection with another object
	@param {!number} oldObjId the objId of the object to replace
	@param {Object} newObject The new object
	@throws when the object type of newObject is invalid or when the object to replace is not found
	*/

	replace ( oldObjId, newObject ) {
		let index = this.#indexOfObjId ( oldObjId );
		if ( NOT_FOUND === index ) {
			throw new Error ( 'invalid objId for replace function' );
		}
		if ( ( ! newObject.objType ) || ( ! newObject.objType.name ) || ( newObject.objType.name !== this.#objName ) ) {
			throw new Error ( 'invalid object name for replace function' );
		}
		this.#array [ index ] = newObject;
	}

	/**
	Reverse the objects in the collection
	*/

	reverse ( ) { this.#array.reverse ( ); }

	/**
	Sort the collection, using a function
	@param {function} compareFunction The function to use to compare objects in the Collection
	*/

	sort ( compareFunction ) { this.#array.sort ( compareFunction ); }

	/**
	Reverse an Object with the previous or next object in the Collection
	@param {!number} objId The objId of the object to swap
	@param {boolean} swapUp When true the object is swapped with the previous one,
	when false with the next one
	@throws when the object is not found or when the swap is not possible
	*/

	swap ( objId, swapUp ) {
		let index = this.#indexOfObjId ( objId );
		if (
			( NOT_FOUND === index )
			||
			( ( ZERO === index ) && swapUp )
			||
			( ( this.#array.length - ONE === index ) && ( ! swapUp ) )
		) {
			throw new Error ( 'invalid objId for swap function' );
		}
		let tmp = this.#array [ index ];
		this.#array [ index ] = this.#array [ index + ( swapUp ? OUR_SWAP_UP : OUR_SWAP_DOWN ) ];
		this.#array [ index + ( swapUp ? OUR_SWAP_UP : OUR_SWAP_DOWN ) ] = tmp;
	}

	/**
	The first object of the Collection
	@type {Object}
	@readonly
	*/

	get first ( ) { return this.#array [ ZERO ]; }

	/**
	An iterator on the Collection
	@type {CollectionIterator}
	@readonly
	@see {@link module:Collection~CollectionIterator}
	*/

	get iterator ( ) {
		return new CollectionIterator ( this );
	}

	/**
	The last object of the Collection
	@type {Object}
	@readonly
	*/

	get last ( ) { return this.#array [ this.#array.length - ONE ]; }

	/**
	The length of the Collection
	@type {number}
	@readonly
	*/

	get length ( ) { return this.#array.length; }

	/**
	an Array with the objects in the collection
	@type {Array}
	*/

	get jsonObject ( ) {
		let array = [ ];
		let iterator = this.iterator;
		while ( ! iterator.done ) {
			array.push ( iterator.value.jsonObject );
		}

		return array;
	}
	set jsonObject ( something ) {
		this.#array.length = ZERO;
		let newObject = null;

		something.forEach (
			arrayObject => {
				newObject = new this.#classCollection ( );
				newObject.jsonObject = arrayObject;
				this.add ( newObject );
			}
		);
	}
}

export default Collection;

/*
--- End of Collection.js file -------------------------------------------------------------------------------------------------
*/