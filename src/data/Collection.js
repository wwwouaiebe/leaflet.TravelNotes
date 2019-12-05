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

export { newCollection };

import { newRoute } from '../data/Route.js';
import { newNote } from '../data/Note.js';
import { newWayPoint } from '../data/WayPoint.js';
import { newManeuver } from '../data/Maneuver.js';
import { newItineraryPoint } from '../data/ItineraryPoint.js';


/*
--- newCollection function ----------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newCollection ( objName ) {

	let m_Array = [];

	let m_ObjName = objName;

	/*
	--- m_Add function ------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_Add ( object ) {
		if ( ( ! object.objType ) || ( ! object.objType.name ) || ( object.objType.name !== m_ObjName ) ) {
			throw 'invalid object name for add function';
		}
		m_Array.push ( object );

		return;
	}

	/*
	--- m_First function ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_First ( ) {
		return m_Array [ 0 ];
	}

	/*
	--- m_ForEach function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ForEach ( funct ) {
		let result = null;
		let iterator = m_Iterator ( );
		while ( ! iterator.done ) {
			result = funct ( iterator.value, result );
		}
		return result;
	}

	/*
	--- m_GetAt function ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetAt ( objId ) {
		let index = m_IndexOfObjId ( objId );
		if ( -1 === index ) {
			return null;
		}
		return m_Array [ index ];
	}

	/*
	--- m_GetObject function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetObject ( ) {
		let array = [ ];
		let iterator = m_Iterator ( );
		while ( ! iterator.done ) {
			array.push ( iterator.value.object );
		}

		return array;
	}
	
	/*
	--- m_MoveTo function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_MoveTo ( objId, targetObjId, moveBefore ) {
		let oldPosition = m_IndexOfObjId ( objId );
		let newPosition = m_IndexOfObjId ( targetObjId );
		if ( ! moveBefore ) {
			newPosition ++;
		}
		m_Array.splice ( newPosition, 0, m_Array [ oldPosition ] );
		if ( newPosition < oldPosition ) {
			oldPosition ++ ;
		}
		m_Array.splice ( oldPosition, 1 );
	}

	/*
	--- m_IndexOfObjId function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_IndexOfObjId ( objId ) {
		return m_Array.findIndex ( element => { return element.objId === objId; } );
	}

	/*
	--- m_Iterator function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Iterator ( ) {
		let nextIndex = -1;
		return {
			get value ( ) { return nextIndex < m_Array.length ?  m_Array [ nextIndex ] : null; },
			get done ( ) { return ++ nextIndex  >= m_Array.length; },
			get first ( ) { return 0 === nextIndex; },
			get last ( ) { return nextIndex  >= m_Array.length - 1; },
			get index ( ) { return nextIndex; }
		};
	}

	/*
	--- m_Last function -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Last ( ) {
		return m_Array [ m_Array.length - 1 ];
	}

	/*
	--- m_NextOrPrevious function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_NextOrPrevious ( objId, condition, direction ) {
		let index = m_IndexOfObjId ( objId );
		if ( -1 === index ) {
			throw 'invalid objId for next or previous function';
		}
		
		if ( ! condition ) {
			condition = function ( ) { return true; };
		}
		index += direction;
		
		while ( ( -1 < index ) && ( index < m_Array.length ) && ! condition ( m_Array [ index ] ) ) {
			index += direction;
		}
		if ( -1 === index || m_Array.length === index ) {
			return null;
		}
		
		return m_Array [ index ];
	}
	
	/*
	--- m_Remove function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Remove ( objId ) {
		let index = m_IndexOfObjId ( objId );
		if ( -1 === index ) {
			throw 'invalid objId for remove function';
		}
		m_Array.splice ( m_IndexOfObjId ( objId ), 1 );
	}

	/*
	--- m_RemoveAll function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_RemoveAll ( ExceptFirstLast ) {
		if ( ExceptFirstLast ) {
			m_Array.splice ( 1, m_Array.length - 2 );
		}
		else {
			m_Array.length = 0;
		}
	}

	/*
	--- m_Replace function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Replace ( oldObjId, object ) {
		let index = m_IndexOfObjId ( oldObjId );
		if ( -1 === index ) {
			throw 'invalid objId for replace function';
		}
		m_Array [ index ] = object;
	}

	/*
	--- m_Reverse function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Reverse ( ) {
		m_Array.reverse ( );
	}

	/*
	--- m_SetObject function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SetObject ( something ) {
		m_Array.length = 0;
		let newObject;
		something.forEach (
			arrayObject => {
				switch ( m_ObjName ) {
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
				default:
					throw ( 'invalid ObjName ( ' + m_ObjName +' ) in Collection.m_SetObject' );
				}
				newObject.object = arrayObject;
				m_Add ( newObject );
			}
		);
	}
	
	/*
	--- m_Sort function -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Sort ( compareFunction ) {
		m_Array.sort ( compareFunction );
	}

	/*
	--- m_Swap function -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Swap ( objId, swapUp ) {
		let index = m_IndexOfObjId ( objId );
		if ( ( -1 === index ) || ( ( 0 === index ) && swapUp ) || ( ( m_Array.length - 1 === index ) && ( ! swapUp ) ) ) {
			throw 'invalid objId for swap function';
		}
		let tmp = m_Array [ index ];
		m_Array [ index ] = m_Array [ index + ( swapUp ? -1 : 1  ) ];
		m_Array [ index + ( swapUp ? -1 : 1  ) ] = tmp;
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

			add : object => m_Add ( object ),

			/*
			--- forEach function --------------------------------------------------------------------------------------

			This function executes a function on each object of the collection and returns the final result

			-----------------------------------------------------------------------------------------------------------
			*/

			forEach : funct => { return m_ForEach ( funct ); },

			/*
			--- getAt function ----------------------------------------------------------------------------------------

			This function returns the object with the given objId or null when the object is not found
			
			-----------------------------------------------------------------------------------------------------------
			*/

			getAt : ( objId ) => { return m_GetAt ( objId ); },

			/*
			--- moveTo function ---------------------------------------------------------------------------------------

			This function move the object identified by objId to the position ocuped by the object
			identified by targetObjId 

			-----------------------------------------------------------------------------------------------------------
			*/
			
			moveTo : ( objId, targetObjId, moveBefore ) => m_MoveTo ( objId, targetObjId, moveBefore ),
			
			/*
			--- next function -----------------------------------------------------------------------------------------

			This function 

			-----------------------------------------------------------------------------------------------------------
			*/

			next : ( objId, condition ) => { return m_NextOrPrevious ( objId, condition, 1 ); },
			
			/*
			--- previous function -------------------------------------------------------------------------------------

			This function 

			-----------------------------------------------------------------------------------------------------------
			*/

			previous : ( objId, condition ) => { return m_NextOrPrevious ( objId, condition, -1 ); },
			
			/*
			--- remove function ---------------------------------------------------------------------------------------

			This function remove the object with the given objId
			throw when the object is not found

			-----------------------------------------------------------------------------------------------------------
			*/

			remove : objId => m_Remove ( objId ),

			/*
			--- removeAll function ------------------------------------------------------------------------------------

			This function remove all objects in the collection
			when the exceptFirstLast parameter is true, first and last objects in the collection are not removed

			-----------------------------------------------------------------------------------------------------------
			*/

			removeAll : exceptFirstLast => m_RemoveAll ( exceptFirstLast ),

			/*
			--- replace function --------------------------------------------------------------------------------------

			This function replace the object identified by oldObjId with a new object
			throw when the object type is invalid

			-----------------------------------------------------------------------------------------------------------
			*/

			replace : ( oldObjId, object ) => m_Replace ( oldObjId, object ),

			/*
			--- reverse function --------------------------------------------------------------------------------------

			This function reverse the objects in the collection

			-----------------------------------------------------------------------------------------------------------
			*/

			reverse : ( ) => m_Reverse ( ),

			/*
			--- sort function -----------------------------------------------------------------------------------------

			This function sort the collection, using the compare function

			-----------------------------------------------------------------------------------------------------------
			*/

			sort : compareFunction => m_Sort ( compareFunction ),

			/*
			--- swap function -----------------------------------------------------------------------------------------

			This function move up ( when swapUp is true ) or move down an object in the collection
			throw when the swap is not possible

			-----------------------------------------------------------------------------------------------------------
			*/

			swap : ( objId, swapUp ) =>	m_Swap ( objId, swapUp ),

			/*
			--- first getter ------------------------------------------------------------------------------------------

			The first object in the collection

			-----------------------------------------------------------------------------------------------------------
			*/

			get first ( ) {
				return m_First ( );
			},

			/*
			--- iterator getter ---------------------------------------------------------------------------------------

			Returns an iterator on the collection.
			The iterator have the following properties:
			value : the object pointed by the iterator
			done : true when the iterator is at the end of the collection. Each time this property is called, the iterator move to the next object
			first : true when the iterator is on the first object
			last : true when the iterator is on the last object
			index : the current position of the iterator in the collection

			-----------------------------------------------------------------------------------------------------------
			*/
			
			get iterator ( ) {
				return m_Iterator ( );
			},

			/*
			--- last getter -------------------------------------------------------------------------------------------

			The last object in the collection

			-----------------------------------------------------------------------------------------------------------
			*/

			get last ( ) {
				return m_Last ( );
			},

			/*
			--- length getter -----------------------------------------------------------------------------------------

			The length of the collection

			-----------------------------------------------------------------------------------------------------------
			*/

			get length ( ) {
				return m_Array.length;
			},

			/*
			--- object getter -----------------------------------------------------------------------------------------

			Transform the collection into an array that can be used with JSON

			-----------------------------------------------------------------------------------------------------------
			*/

			get object ( ) {
				return m_GetObject ( );
			},

			/*
			--- object setter -----------------------------------------------------------------------------------------

			Transform an array to a collection
			throw when an object in the array have an invalid type

			-----------------------------------------------------------------------------------------------------------
			*/

			set object ( something ) {
				m_SetObject ( something );
			}

		}
	);
}

/*
--- End of Collection.js file -----------------------------------------------------------------------------------------
*/