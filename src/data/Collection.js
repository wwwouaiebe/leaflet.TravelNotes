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
Doc reviewed 20191122
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newRoute } from '../data/Route.js';
import { newNote } from '../data/Note.js';
import { newWayPoint } from '../data/WayPoint.js';
import { newManeuver } from '../data/Maneuver.js';
import { newItineraryPoint } from '../data/ItineraryPoint.js';

import { THE_CONST } from '../util/Constants.js';

/*
--- newCollection function ----------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newCollection ( objName ) {

	let myArray = [];

	let myObjName = objName;

	/*
	--- myAdd function ------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAdd ( object ) {
		if ( ( ! object.objType ) || ( ! object.objType.name ) || ( object.objType.name !== myObjName ) ) {
			throw 'invalid object name for add function';
		}
		myArray.push ( object );

		return;
	}

	/*
	--- myFirst function ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myFirst ( ) {
		return myArray [ THE_CONST.zero ];
	}

	/*
	--- myIterator function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myIterator ( ) {
		let nextIndex = THE_CONST.notFound;
		return {
			get value ( ) { return nextIndex < myArray.length ? myArray [ nextIndex ] : null; },
			get done ( ) { return ++ nextIndex >= myArray.length; },
			get first ( ) { return THE_CONST.zero === nextIndex; },
			get last ( ) { return nextIndex >= myArray.length - THE_CONST.number1; },
			get index ( ) { return nextIndex; }
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
		if ( THE_CONST.notFound === index ) {
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
		myArray.splice ( newPosition, THE_CONST.zero, myArray [ oldPosition ] );
		if ( newPosition < oldPosition ) {
			oldPosition ++;
		}
		myArray.splice ( oldPosition, THE_CONST.number1 );
	}

	/*
	--- myLast function -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myLast ( ) {
		return myArray [ myArray.length - THE_CONST.number1 ];
	}

	/*
	--- myNextOrPrevious function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myNextOrPrevious ( objId, condition, direction ) {
		let index = myIndexOfObjId ( objId );
		if ( THE_CONST.notFound === index ) {
			throw 'invalid objId for next or previous function';
		}

		let otherCondition = condition;
		if ( ! otherCondition ) {
			otherCondition = ( ) => true;
		}
		index += direction;

		while ( ( THE_CONST.notFound < index ) && ( index < myArray.length ) && ! otherCondition ( myArray [ index ] ) ) {
			index += direction;
		}
		if ( THE_CONST.notFound === index || myArray.length === index ) {
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
		if ( THE_CONST.notFound === index ) {
			throw 'invalid objId for remove function';
		}
		myArray.splice ( myIndexOfObjId ( objId ), THE_CONST.number1 );
	}

	/*
	--- myRemoveAll function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myRemoveAll ( ExceptFirstLast ) {
		if ( ExceptFirstLast ) {
			myArray.splice ( THE_CONST.number1, myArray.length - THE_CONST.number2 );
		}
		else {
			myArray.length = THE_CONST.zero;
		}
	}

	/*
	--- myReplace function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myReplace ( oldObjId, object ) {
		let index = myIndexOfObjId ( oldObjId );
		if ( THE_CONST.notFound === index ) {
			throw 'invalid objId for replace function';
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
		myArray.length = THE_CONST.zero;
		let newObject = null;
		something.forEach (
			arrayObject => {
				switch ( myObjName ) {
				case 'Route' :
					newObject = newRoute ( );
					break;
				case 'Note' :
					newObject = newNote ( );
					break;
				case 'WayPoint' :
					newObject = newWayPoint ( );
					break;
				case 'Maneuver' :
					newObject = newManeuver ( );
					break;
				case 'ItineraryPoint' :
					newObject = newItineraryPoint ( );
					break;
				default :
					throw ( 'invalid ObjName ( ' + myObjName + ' ) in Collection.mySetObject' );
				}
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
			( THE_CONST.notFound === index )
			||
			( ( THE_CONST.zero === index ) && swapUp )
			||
			( ( myArray.length - THE_CONST.number1 === index ) && ( ! swapUp ) )
		) {
			throw 'invalid objId for swap function';
		}
		let tmp = myArray [ index ];
		myArray [ index ] = myArray [ index + ( swapUp ? THE_CONST.collection.swapUp : THE_CONST.collection.swapDown ) ];
		myArray [ index + ( swapUp ? THE_CONST.collection.swapUp : THE_CONST.collection.swapDown ) ] = tmp;
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

			next : ( objId, condition ) => myNextOrPrevious ( objId, condition, THE_CONST.collection.direction.next ),

			/*
			--- previous function -------------------------------------------------------------------------------------

			-----------------------------------------------------------------------------------------------------------
			*/

			previous : ( objId, condition ) => myNextOrPrevious ( objId, condition, THE_CONST.collection.direction.previous ),

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