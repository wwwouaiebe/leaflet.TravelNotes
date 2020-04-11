/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/
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
--- Collection.js file ------------------------------------------------------------------------------------------------
This file contains:
	- the newCollection function
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- added next and previous method
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
	- v1.8.0:
		- Issue #100 : Fix circular dependancies with Collection
Doc reviewed 20191122
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { ZERO, ONE, TWO, NOT_FOUND } from '../util/Constants.js';

/*
--- newCollection function ----------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newCollection ( newObjFunction ) {

	const SWAP_UP = -1;
	const SWAP_DOWN = 1;
	const NEXT = 1;
	const PREVIOUS = -1;

	const myObjName = newObjFunction ( ).objType.name;

	const myNewObjFunction = newObjFunction;

	let myArray = [];

	/*
	--- myAdd function ------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAdd ( object ) {
		if ( ( ! object.objType ) || ( ! object.objType.name ) || ( object.objType.name !== myObjName ) ) {
			throw new Error ( 'invalid object name for add function' );
		}
		myArray.push ( object );

	}

	/*
	--- myFirst function ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myFirst ( ) {
		return myArray [ ZERO ];
	}

	/*
	--- myIterator function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
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

	/*
	--- myForEach function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myForEach ( funct ) {
		let result = null;
		let iterator = myIterator ( );
		while ( ! iterator.done ) {
			result = funct ( iterator.value, result );
		}
		return result;
	}

	/*
	--- myIndexOfObjId function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myIndexOfObjId ( objId ) {
		let index = myArray.findIndex (
			element => element.objId === objId
		);
		return index;
	}

	/*
	--- myGetAt function ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetAt ( objId ) {
		let index = myIndexOfObjId ( objId );
		if ( NOT_FOUND === index ) {
			return null;
		}
		return myArray [ index ];
	}

	/*
	--- myGetObject function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetObject ( ) {
		let array = [ ];
		let iterator = myIterator ( );
		while ( ! iterator.done ) {
			array.push ( iterator.value.object );
		}

		return array;
	}

	/*
	--- myMoveTo function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myMoveTo ( objId, targetObjId, moveBefore ) {
		let oldPosition = myIndexOfObjId ( objId );
		let newPosition = myIndexOfObjId ( targetObjId );
		if ( ! moveBefore ) {
			newPosition ++;
		}
		myArray.splice ( newPosition, ZERO, myArray [ oldPosition ] );
		if ( newPosition < oldPosition ) {
			oldPosition ++;
		}
		myArray.splice ( oldPosition, ONE );
	}

	/*
	--- myLast function -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myLast ( ) {
		return myArray [ myArray.length - ONE ];
	}

	/*
	--- myNextOrPrevious function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myNextOrPrevious ( objId, condition, direction ) {
		let index = myIndexOfObjId ( objId );
		if ( NOT_FOUND === index ) {
			throw new Error ( 'invalid objId for next or previous function' );
		}

		let otherCondition = condition;
		if ( ! otherCondition ) {
			otherCondition = ( ) => true;
		}
		index += direction;

		while ( ( NOT_FOUND < index ) && ( index < myArray.length ) && ! otherCondition ( myArray [ index ] ) ) {
			index += direction;
		}
		if ( NOT_FOUND === index || myArray.length === index ) {
			return null;
		}

		return myArray [ index ];
	}

	/*
	--- myRemove function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRemove ( objId ) {
		let index = myIndexOfObjId ( objId );
		if ( NOT_FOUND === index ) {
			throw new Error ( 'invalid objId for remove function' );
		}
		myArray.splice ( myIndexOfObjId ( objId ), ONE );
	}

	/*
	--- myRemoveAll function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRemoveAll ( ExceptFirstLast ) {
		if ( ExceptFirstLast ) {
			myArray.splice ( ONE, myArray.length - TWO );
		}
		else {
			myArray.length = ZERO;
		}
	}

	/*
	--- myReplace function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myReplace ( oldObjId, object ) {
		let index = myIndexOfObjId ( oldObjId );
		if ( NOT_FOUND === index ) {
			throw new Error ( 'invalid objId for replace function' );
		}
		myArray [ index ] = object;
	}

	/*
	--- myReverse function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myReverse ( ) {
		myArray.reverse ( );
	}

	/*
	--- mySetObject function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetObject ( something ) {
		myArray.length = ZERO;
		let newObject = null;

		something.forEach (
			arrayObject => {
				newObject = myNewObjFunction ( );
				newObject.object = arrayObject;
				myAdd ( newObject );
			}
		);
	}

	/*
	--- mySort function -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySort ( compareFunction ) {
		myArray.sort ( compareFunction );
	}

	/*
	--- mySwap function -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySwap ( objId, swapUp ) {
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

	/*
	--- Collection object ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{

			/*
			--- add function ------------------------------------------------------------------------------------------

			This function add an object to the collection
			throw when the object type is invalid

			-----------------------------------------------------------------------------------------------------------
			*/

			add : object => myAdd ( object ),

			/*
			--- forEach function --------------------------------------------------------------------------------------

			This function executes a function on each object of the collection and returns the final result

			-----------------------------------------------------------------------------------------------------------
			*/

			forEach : funct => myForEach ( funct ),

			/*
			--- getAt function ----------------------------------------------------------------------------------------

			This function returns the object with the given objId or null when the object is not found

			-----------------------------------------------------------------------------------------------------------
			*/

			getAt : objId => myGetAt ( objId ),

			/*
			--- moveTo function ---------------------------------------------------------------------------------------

			This function move the object identified by objId to the position ocuped by the object
			identified by targetObjId

			-----------------------------------------------------------------------------------------------------------
			*/

			moveTo : ( objId, targetObjId, moveBefore ) => myMoveTo ( objId, targetObjId, moveBefore ),

			/*
			--- next function -----------------------------------------------------------------------------------------

			-----------------------------------------------------------------------------------------------------------
			*/

			next : ( objId, condition ) => myNextOrPrevious ( objId, condition, NEXT ),

			/*
			--- previous function -------------------------------------------------------------------------------------

			-----------------------------------------------------------------------------------------------------------
			*/

			previous : ( objId, condition ) => myNextOrPrevious ( objId, condition, PREVIOUS ),

			/*
			--- remove function ---------------------------------------------------------------------------------------

			This function remove the object with the given objId
			throw when the object is not found

			-----------------------------------------------------------------------------------------------------------
			*/

			remove : objId => myRemove ( objId ),

			/*
			--- removeAll function ------------------------------------------------------------------------------------

			This function remove all objects in the collection
			when the exceptFirstLast parameter is true, first and last objects in the collection are not removed

			-----------------------------------------------------------------------------------------------------------
			*/

			removeAll : exceptFirstLast => myRemoveAll ( exceptFirstLast ),

			/*
			--- replace function --------------------------------------------------------------------------------------

			This function replace the object identified by oldObjId with a new object
			throw when the object type is invalid

			-----------------------------------------------------------------------------------------------------------
			*/

			replace : ( oldObjId, object ) => myReplace ( oldObjId, object ),

			/*
			--- reverse function --------------------------------------------------------------------------------------

			This function reverse the objects in the collection

			-----------------------------------------------------------------------------------------------------------
			*/

			reverse : ( ) => myReverse ( ),

			/*
			--- sort function -----------------------------------------------------------------------------------------

			This function sort the collection, using the compare function

			-----------------------------------------------------------------------------------------------------------
			*/

			sort : compareFunction => mySort ( compareFunction ),

			/*
			--- swap function -----------------------------------------------------------------------------------------

			This function move up ( when swapUp is true ) or move down an object in the collection
			throw when the swap is not possible

			-----------------------------------------------------------------------------------------------------------
			*/

			swap : ( objId, swapUp ) =>	mySwap ( objId, swapUp ),

			/*
			--- first getter ------------------------------------------------------------------------------------------

			The first object in the collection

			-----------------------------------------------------------------------------------------------------------
			*/

			get first ( ) {
				return myFirst ( );
			},

			/*
			--- iterator getter ---------------------------------------------------------------------------------------

			Returns an iterator on the collection.
			The iterator have the following properties:
			value : the object pointed by the iterator
			done : true when the iterator is at the end of the collection.
				Each time this property is called, the iterator move to the next object
			first : true when the iterator is on the first object
			last : true when the iterator is on the last object
			index : the current position of the iterator in the collection

			-----------------------------------------------------------------------------------------------------------
			*/

			get iterator ( ) {
				return myIterator ( );
			},

			/*
			--- last getter -------------------------------------------------------------------------------------------

			The last object in the collection

			-----------------------------------------------------------------------------------------------------------
			*/

			get last ( ) {
				return myLast ( );
			},

			/*
			--- length getter -----------------------------------------------------------------------------------------

			The length of the collection

			-----------------------------------------------------------------------------------------------------------
			*/

			get length ( ) {
				return myArray.length;
			},

			/*
			--- object getter -----------------------------------------------------------------------------------------

			Transform the collection into an array that can be used with JSON

			-----------------------------------------------------------------------------------------------------------
			*/

			get object ( ) {
				return myGetObject ( );
			},

			/*
			--- object setter -----------------------------------------------------------------------------------------

			Transform an array to a collection
			throw when an object in the array have an invalid type

			-----------------------------------------------------------------------------------------------------------
			*/

			set object ( something ) {
				mySetObject ( something );
			}

		}
	);
}

export { newCollection };

/*
--- End of Collection.js file -----------------------------------------------------------------------------------------
*/