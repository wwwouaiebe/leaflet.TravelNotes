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
Doc reviewed 20170925
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

	var Collection = function ( objName ) {

		// Private variables and functions

		var _Array = [];

		var _ObjName = objName;

		var _Add = function ( object ) {
			if ( ( ! object.objType ) || ( ! object.objType.name ) || ( object.objType.name !== _ObjName ) ) {
				throw 'invalid object name for add function';
			}
			_Array.push ( object );

			return;
		};

		var _First = function ( ) {
			return _Array [ 0 ];
		};

		var _ForEach = function ( funct ) {
			var result = null;
			var iterator = _Iterator ( );
			while ( ! iterator.done ) {
					result = funct ( iterator.value, result );
			}
			return result;
		};

		var _GetAt = function ( objId ) {
			var index = _IndexOfObjId ( objId );
			if ( -1 === index ) {
				return null;
			}
			return _Array [ index ];
		};

		var _GetObject = function ( ) {
			var array = [ ];
			var iterator = _Iterator ( );
			while ( ! iterator.done ) {
				array.push ( iterator.value.object );
			}

			return array;
		};
		
		var _MoveTo = function ( objId, targetObjId, moveBefore ) {
			var oldPosition = _IndexOfObjId ( objId );
			var newPosition = _IndexOfObjId ( targetObjId );
			if ( ! moveBefore ) {
				newPosition ++;
			}
			_Array.splice ( newPosition, 0, _Array [ oldPosition ] );
			if ( newPosition < oldPosition )
			{
				oldPosition ++ ;
			}
			_Array.splice ( oldPosition, 1 );
		};

		var _IndexOfObjId = function ( objId ) {
			function haveObjId ( element ) {
				return element.objId === objId;
			}
			return _Array.findIndex ( haveObjId );
		};

		var _Iterator = function ( ) {
			var nextIndex = -1;
			return {
			   get value ( ) { return nextIndex < _Array.length ?  _Array [ nextIndex ] : null; },
			   get done ( ) { return ++ nextIndex  >= _Array.length; },
			   get first ( ) { return 0 === nextIndex; },
			   get last ( ) { return nextIndex  >= _Array.length - 1; },
			   get index ( ) { return nextIndex; }
			};
		};

		var _Last = function ( ) {
			return _Array [ _Array.length - 1 ];
		};

		var _Remove = function ( objId ) {
			var index = _IndexOfObjId ( objId );
			if ( -1 === index ) {
				throw 'invalid objId for remove function';
			}
			_Array.splice ( _IndexOfObjId ( objId ), 1 );
		};

		var _RemoveAll = function ( ExceptFirstLast ) {
			if ( ExceptFirstLast ) {
				_Array.splice ( 1, _Array.length - 2 );
			}
			else {
				_Array.length = 0;
			}
		};

		var _Replace = function ( oldObjId, object ) {
			var index = _IndexOfObjId ( oldObjId );
			if ( -1 === index ) {
				throw 'invalid objId for replace function';
			}
			_Array [ index ] = object;
		};

		var _Reverse = function ( ) {
			_Array.reverse ( );
		};

		var _SetObject = function ( Objects ) {
			_Array.length = 0;
			var newObject;
			for (var objectCounter = 0; objectCounter < Objects.length; objectCounter ++ ) {
				switch ( _ObjName ) {
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
					throw ( 'invalid ObjName ( ' + _ObjName +' ) in Collection._SetObject' );
				}
				newObject.object = Objects [ objectCounter ];
				_Add ( newObject );
			}
		};

		var _Sort = function ( compareFunction ) {
			_Array.sort ( compareFunction );
		};

		var _Swap = function ( objId, swapUp ) {
			var index = _IndexOfObjId ( objId );
			if ( ( -1 === index ) || ( ( 0 === index ) && swapUp ) || ( ( _Array.length - 1 === index ) && ( ! swapUp ) ) ) {
				throw 'invalid objId for swap function';
			}
			var tmp = _Array [ index ];
			_Array [ index ] = _Array [ index + ( swapUp ? -1 : 1  ) ];
			_Array [ index + ( swapUp ? -1 : 1  ) ] = tmp;
		};

		// Collection object

		return {

			/*
			--- add function ------------------------------------------------------------------------------------------

			This function add an object to the collection
			throw when the object type is invalid

			-----------------------------------------------------------------------------------------------------------
			*/

			add : function ( object ) {
				_Add ( object );
			},

			/*
			--- forEach function --------------------------------------------------------------------------------------

			This function executes a function on each object of the collection and returns the final result

			-----------------------------------------------------------------------------------------------------------
			*/

			forEach : function ( funct ) {
				return _ForEach ( funct );
			},

			/*
			--- getAt function ----------------------------------------------------------------------------------------

			This function returns the object with the given objId or null when the object is not found

			-----------------------------------------------------------------------------------------------------------
			*/

			getAt : function ( objId ) {
				return _GetAt ( objId );
			},

			/*
			--- moveTo function ----------------------------------------------------------------------------------------

			This function move the object identified by objId to the position ocuped by the object
			identified by targetObjId 

			-----------------------------------------------------------------------------------------------------------
			*/
			moveTo : function ( objId, targetObjId, moveBefore ) {
				_MoveTo ( objId, targetObjId, moveBefore );
			},
			/*
			--- remove function ---------------------------------------------------------------------------------------

			This function remove the object with the given objId
			throw when the object is not found

			-----------------------------------------------------------------------------------------------------------
			*/

			remove : function ( objId ) {
				_Remove ( objId );
			},

			/*
			--- removeAll function ------------------------------------------------------------------------------------

			This function remove all objects in the collection
			when the exceptFirstLast parameter is true, first and last objects in the collection are not removed

			-----------------------------------------------------------------------------------------------------------
			*/

			removeAll : function ( exceptFirstLast ) {
				_RemoveAll ( exceptFirstLast );
			},

			/*
			--- replace function --------------------------------------------------------------------------------------

			This function replace the object identified by oldObjId with a new object
			throw when the object type is invalid

			-----------------------------------------------------------------------------------------------------------
			*/

			replace : function ( oldObjId, object ) {
				_Replace ( oldObjId, object );
			},

			/*
			--- reverse function --------------------------------------------------------------------------------------

			This function reverse the objects in the collection

			-----------------------------------------------------------------------------------------------------------
			*/

			reverse : function ( ) {
				_Reverse ( );
			},

			/*
			--- sort function -----------------------------------------------------------------------------------------

			This function sort the collection, using the compare function

			-----------------------------------------------------------------------------------------------------------
			*/

			sort : function ( compareFunction ) {
				_Sort ( compareFunction );
			},

			/*
			--- swap function -----------------------------------------------------------------------------------------

			This function move up ( when sapUp is true ) or move down an object in the collection
			throw when the swap is not possible

			-----------------------------------------------------------------------------------------------------------
			*/

			swap : function ( objId, swapUp ) {
				_Swap ( objId, swapUp );
			},

			/*
			--- first getter ------------------------------------------------------------------------------------------

			The first object in the collection

			-----------------------------------------------------------------------------------------------------------
			*/

			get first ( ) {
				return _First ( );
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
				return _Iterator ( );
			},

			/*
			--- last getter -------------------------------------------------------------------------------------------

			The last object in the collection

			-----------------------------------------------------------------------------------------------------------
			*/

			get last ( ) {
				return _Last ( );
			},

			/*
			--- length getter -----------------------------------------------------------------------------------------

			The length of the collection

			-----------------------------------------------------------------------------------------------------------
			*/

			get length ( ) {
				return _Array.length;
			},

			/*
			--- object getter -----------------------------------------------------------------------------------------

			Transform the collection into an array that can be used with JSON

			-----------------------------------------------------------------------------------------------------------
			*/

			get object ( ) {
				return _GetObject ( );
			},

			/*
			--- object setter -----------------------------------------------------------------------------------------

			Transform an array to a collection
			throw when an object in the array have an invalid type

			-----------------------------------------------------------------------------------------------------------
			*/

			set object ( Object ) {
				_SetObject ( Object );
			}

		};
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = Collection;
	}

} ) ( );

/*
--- End of Collection.js file -----------------------------------------------------------------------------------------
*/