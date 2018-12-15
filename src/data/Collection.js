/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/
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
	- the Collection object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
Doc reviewed 20181215
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	/*
	--- Collection object ---------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var collection = function ( objName ) {

		var m_Array = [];

		var m_ObjName = objName;

		/*
		--- m_Add function --------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_Add = function ( object ) {
			if ( ( ! object.objType ) || ( ! object.objType.name ) || ( object.objType.name !== m_ObjName ) ) {
				throw 'invalid object name for add function';
			}
			m_Array.push ( object );

			return;
		};

		/*
		--- m_First function ------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var m_First = function ( ) {
			return m_Array [ 0 ];
		};

		/*
		--- m_ForEach function ----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_ForEach = function ( funct ) {
			var result = null;
			var iterator = m_Iterator ( );
			while ( ! iterator.done ) {
					result = funct ( iterator.value, result );
			}
			return result;
		};

		/*
		--- m_GetAt function ------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetAt = function ( objId ) {
			var index = m_IndexOfObjId ( objId );
			if ( -1 === index ) {
				return null;
			}
			return m_Array [ index ];
		};

		/*
		--- m_GetObject function --------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetObject = function ( ) {
			var array = [ ];
			var iterator = m_Iterator ( );
			while ( ! iterator.done ) {
				array.push ( iterator.value.object );
			}

			return array;
		};
		
		/*
		--- m_MoveTo function -----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_MoveTo = function ( objId, targetObjId, moveBefore ) {
			var oldPosition = m_IndexOfObjId ( objId );
			var newPosition = m_IndexOfObjId ( targetObjId );
			if ( ! moveBefore ) {
				newPosition ++;
			}
			m_Array.splice ( newPosition, 0, m_Array [ oldPosition ] );
			if ( newPosition < oldPosition )
			{
				oldPosition ++ ;
			}
			m_Array.splice ( oldPosition, 1 );
		};

		/*
		--- m_IndexOfObjId function -----------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_IndexOfObjId = function ( objId ) {
			function haveObjId ( element ) {
				return element.objId === objId;
			}
			return m_Array.findIndex ( haveObjId );
		};

		/*
		--- m_Iterator function ---------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Iterator = function ( ) {
			var nextIndex = -1;
			return {
			   get value ( ) { return nextIndex < m_Array.length ?  m_Array [ nextIndex ] : null; },
			   get done ( ) { return ++ nextIndex  >= m_Array.length; },
			   get first ( ) { return 0 === nextIndex; },
			   get last ( ) { return nextIndex  >= m_Array.length - 1; },
			   get index ( ) { return nextIndex; }
			};
		};

		/*
		--- m_Last function -------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Last = function ( ) {
			return m_Array [ m_Array.length - 1 ];
		};

		/*
		--- m_Remove function -----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Remove = function ( objId ) {
			var index = m_IndexOfObjId ( objId );
			if ( -1 === index ) {
				throw 'invalid objId for remove function';
			}
			m_Array.splice ( m_IndexOfObjId ( objId ), 1 );
		};

		/*
		--- m_RemoveAll function --------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_RemoveAll = function ( ExceptFirstLast ) {
			if ( ExceptFirstLast ) {
				m_Array.splice ( 1, m_Array.length - 2 );
			}
			else {
				m_Array.length = 0;
			}
		};

		/*
		--- m_Replace function ----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Replace = function ( oldObjId, object ) {
			var index = m_IndexOfObjId ( oldObjId );
			if ( -1 === index ) {
				throw 'invalid objId for replace function';
			}
			m_Array [ index ] = object;
		};

		/*
		--- m_Reverse function ----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Reverse = function ( ) {
			m_Array.reverse ( );
		};

		/*
		--- m_SetObject function --------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SetObject = function ( Array ) {
			m_Array.length = 0;
			var newObject;
			Array.forEach (
				function ( arrayObject ) {
					switch ( m_ObjName ) {
						case 'Route' :
						newObject = require ( '../data/Route' ) ( );
						break;
						case 'Note' :
						newObject = require ( '../data/Note' ) ( );
						break;
						case 'WayPoint' :
						newObject = require ( '../data/WayPoint' ) ( );
						break;
						case 'Maneuver' :
						newObject = require ( '../data/Maneuver' ) ( );
						break;
						case 'ItineraryPoint' :
						newObject = require ( '../data/ItineraryPoint' ) ( );
						break;
						default:
						throw ( 'invalid ObjName ( ' + m_ObjName +' ) in Collection.m_SetObject' );
					}
					newObject.object = arrayObject;
					m_Add ( newObject );
				}
			);
		};

		/*
		--- m_Sort function -------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Sort = function ( compareFunction ) {
			m_Array.sort ( compareFunction );
		};

		/*
		--- m_Swap function -------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Swap = function ( objId, swapUp ) {
			var index = m_IndexOfObjId ( objId );
			if ( ( -1 === index ) || ( ( 0 === index ) && swapUp ) || ( ( m_Array.length - 1 === index ) && ( ! swapUp ) ) ) {
				throw 'invalid objId for swap function';
			}
			var tmp = m_Array [ index ];
			m_Array [ index ] = m_Array [ index + ( swapUp ? -1 : 1  ) ];
			m_Array [ index + ( swapUp ? -1 : 1  ) ] = tmp;
		};

		/*
		--- Collection object -----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{

				/*
				--- add function ------------------------------------------------------------------------------------------

				This function add an object to the collection
				throw when the object type is invalid

				-----------------------------------------------------------------------------------------------------------
				*/

				add : function ( object ) {
					m_Add ( object );
				},

				/*
				--- forEach function --------------------------------------------------------------------------------------

				This function executes a function on each object of the collection and returns the final result

				-----------------------------------------------------------------------------------------------------------
				*/

				forEach : function ( funct ) {
					return m_ForEach ( funct );
				},

				/*
				--- getAt function ----------------------------------------------------------------------------------------

				This function returns the object with the given objId or null when the object is not found

				-----------------------------------------------------------------------------------------------------------
				*/

				getAt : function ( objId ) {
					return m_GetAt ( objId );
				},

				/*
				--- moveTo function ---------------------------------------------------------------------------------------

				This function move the object identified by objId to the position ocuped by the object
				identified by targetObjId 

				-----------------------------------------------------------------------------------------------------------
				*/
				moveTo : function ( objId, targetObjId, moveBefore ) {
					m_MoveTo ( objId, targetObjId, moveBefore );
				},
				/*
				--- remove function ---------------------------------------------------------------------------------------

				This function remove the object with the given objId
				throw when the object is not found

				-----------------------------------------------------------------------------------------------------------
				*/

				remove : function ( objId ) {
					m_Remove ( objId );
				},

				/*
				--- removeAll function ------------------------------------------------------------------------------------

				This function remove all objects in the collection
				when the exceptFirstLast parameter is true, first and last objects in the collection are not removed

				-----------------------------------------------------------------------------------------------------------
				*/

				removeAll : function ( exceptFirstLast ) {
					m_RemoveAll ( exceptFirstLast );
				},

				/*
				--- replace function --------------------------------------------------------------------------------------

				This function replace the object identified by oldObjId with a new object
				throw when the object type is invalid

				-----------------------------------------------------------------------------------------------------------
				*/

				replace : function ( oldObjId, object ) {
					m_Replace ( oldObjId, object );
				},

				/*
				--- reverse function --------------------------------------------------------------------------------------

				This function reverse the objects in the collection

				-----------------------------------------------------------------------------------------------------------
				*/

				reverse : function ( ) {
					m_Reverse ( );
				},

				/*
				--- sort function -----------------------------------------------------------------------------------------

				This function sort the collection, using the compare function

				-----------------------------------------------------------------------------------------------------------
				*/

				sort : function ( compareFunction ) {
					m_Sort ( compareFunction );
				},

				/*
				--- swap function -----------------------------------------------------------------------------------------

				This function move up ( when swapUp is true ) or move down an object in the collection
				throw when the swap is not possible

				-----------------------------------------------------------------------------------------------------------
				*/

				swap : function ( objId, swapUp ) {
					m_Swap ( objId, swapUp );
				},

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

				set object ( Array ) {
					m_SetObject ( Array );
				}

			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = collection;
	}

} ) ( );

/*
--- End of Collection.js file -----------------------------------------------------------------------------------------
*/