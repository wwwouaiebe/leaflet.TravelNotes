(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


(function() {
	
	'use strict';
	
	var getCollection = function ( objName ) {
		
		var _Array = [];
		var _ObjName = objName;
		
		var _IndexOfObjId = function ( objId ) {
			function haveObjId ( element ) {
				return element.objId === objId;
			}
			return _Array.findIndex ( haveObjId );
		};
		
		var _Add = function ( object ) {
			if ( ( ! object.objType ) || ( ! object.objType.name ) || ( object.objType.name !== _ObjName ) ) {
				throw 'invalid object name for add function';
			}
			_Array.push ( object );

			return;
		};
		
		var _GetAt = function ( objId ) {
			var index = _IndexOfObjId ( objId );
			if ( -1 === index ) {
				throw 'invalid objId for getAt function';
			}
			return _Array [ index ];
		};
		
		var _Reverse = function ( ) {
			_Array.reverse ( );
		};
		
		var _Remove = function ( objId ) {
			var index = _IndexOfObjId ( objId );
			if ( -1 === index ) {
				throw 'invalid objId for remove function';
			}
			_Array.splice ( _IndexOfObjId ( objId ), 1 );
		};
		
		var _Replace = function ( oldObjId, object ) {
			var index = _IndexOfObjId ( oldObjId );
			if ( -1 === index ) {
				throw 'invalid objId for replace function';
			}
			_Array [ index ] = object;
		};
		
		var _RemoveAll = function ( ExceptFirstLast ) {
			if ( ExceptFirstLast ) {
				_Array.splice ( 1, _Array.length - 2 );
			}
			else {
				_Array.length = 0;
			}
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
		
		var _Iterator = function ( ) {
			var nextIndex = -1;   
			return {
			   get value ( ) { return nextIndex < _Array.length ?  _Array [ nextIndex ] : null; },
			   get done ( ) { return ++ nextIndex  >= _Array.length; },
			   get first ( ) { return 0 === nextIndex; },
			   get last ( ) { return nextIndex  >= _Array.length - 1; }
			};
		};
		
		var _First = function ( ) {
			return _Array [ 0 ];
		};

		var _Last = function ( ) {
			return _Array [ _Array.length - 1 ];
		};
		
		var _GetObject = function ( ) {
			var array = [ ];
			var iterator = _Iterator ( );
			while ( ! iterator.done ) {
				array.push ( iterator.value.object );
			}
			
			return array;
		};
		
		var _SetObject = function ( Objects ) {
			var constructor;
			switch ( _ObjName ) {
				case 'Route' :
				constructor = require ( './Route' );
				break;
				case 'Note' :
				constructor = require ( './Note' );
				break;
				case 'WayPoint' :
				constructor = require ( './WayPoint' );
				break;
			}
			_Array.length = 0;
			for (var objectCounter = 0; objectCounter < Objects.length; objectCounter ++ ) {
				var newObject = constructor ( );
				newObject.object = Objects [ objectCounter ];
				_Add ( newObject );
			}
		};

		return {
			
			add : function ( object ) { 
				_Add ( object );
			},
			getAt : function ( objId ) {
				return _GetAt ( objId );
			},
			
			reverse : function ( ) {
				_Reverse ( );
			},
			
			remove : function ( objId ) {
				_Remove ( objId );
			},
			
			replace : function ( oldObjId, object ) {
				_Replace ( oldObjId, object ); 
			},
			
			removeAll : function ( ExceptFirstLast ) {
				_RemoveAll ( ExceptFirstLast );
			},
			
			swap : function ( objId, swapUp ) {
				_Swap ( objId, swapUp );
			},
			
			get iterator ( ) { 
				return _Iterator ( ); 
			},
			
			get first ( ) {
				return _First ( );
			},
			
			get last ( ) {
				return _Last ( );
			},
			
			get object ( ) { 
				return _GetObject ( );
			},
			
			set object ( Object ) {
				_SetObject ( Object );
			}
			
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getCollection;
	}

} ) ( );


},{"./Note":3,"./Route":6,"./WayPoint":8}],2:[function(require,module,exports){
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


(function() {
	
	'use strict';
	
	var _ObjType = require ( './ObjType' ) ( 'Geom', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );

	var getGeom = function ( ) {
		
		var _Pnts ="";
		var _Precision = 6;
		var _Color = "#000000";
		var _Weight = 5;
		
		var _ObjId = require ( './ObjId' ) ( );
		
		return {

			get pnts ( ) { return _Pnts; },
			
			set pnts ( Pnts ) { _Pnts = Pnts; },
			
			get precision ( ) { return _Precision; },
			
			set precision ( Precision ) { _Precision = Precision; },
			
			get color ( ) { return _Color; },
			
			set color ( Color ) { _Color = Color; },
			
			get weight ( ) { return _Weight; },
			
			set weight ( Weight ) { _Weight = Weight; },
			
			get objId ( ) { return _ObjId; },
			
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				return {
					pnts : _Pnts,
					precision : _Precision,
					color : _Color,
					weight : _Weight,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_Pnts = Object.pnts || '';
				_Precision = Object.precision || 6;
				_Color = Object.color || '#000000';
				_Weight = Object.weight || 5;
				_ObjId = require ( './ObjId' ) ( );
			}
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getGeom;
	}

} ) ( );

/* --- End of MapData.js file --- */
},{"../UI/Translator":19,"./ObjId":4,"./ObjType":5}],3:[function(require,module,exports){
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

(function() {
	
	'use strict';
	
	var _ObjType = require ( './ObjType' ) ( 'Note', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );

	var getNote = function ( ) {
		
		var _ObjId = require ( './ObjId' ) ( );
		var _Text = '';
		var _Phone = '';
		var _Url = '';
		var _Address = '';
		var _CategoryId = '';
		var _IconLat = 0;
		var _IconLng = 0;
		var _Lat = 0;
		var _Lng = 0;
		
		return {

			get text ( ) { return _Text;},
			
			set text ( Text ) { _Text = Text; },
			
			get phone ( ) { return _Phone;},
			
			set phone ( Phone ) { _Phone = Phone; },
			
			get url ( ) { return _Url;},
			
			set url ( Url ) { _Url = Url; },
			
			get address ( ) { return _Address;},
			
			set address ( Address ) { _Address = Address; },
			
			get categoryId ( ) { return _CategoryId;},
			
			set categoryId ( CategoryId ) { _CategoryId = CategoryId; },
			
			get iconLat ( ) { return _IconLat;},
			
			set iconLat ( IconLat ) { _IconLat = IconLat; },
			
			get iconLng ( ) { return _IconLng;},
			
			set iconLng ( IconLng ) { _IconLng = IconLng; },
			
			get iconLatLng ( ) { return [ _IconLat, _IconLng ];},
			
			set iconLatLng ( IconLatLng ) { _IconLat = IconLatLng [ 0 ]; _IconLng = IconLatLng [ 1 ]; },

			get lat ( ) { return _Lat;},
			
			set lat ( Lat ) { _Lat = Lat; },
			
			get lng ( ) { return _Lng;},
			
			set lng ( Lng ) { _Lng = Lng; },
			
			get latLng ( ) { return [ _Lat, _Lng ];},
			
			set latLng ( LatLng ) { _Lat = LatLng [ 0 ]; _Lng = LatLng [ 1 ]; },
			
			get objId ( ) { return _ObjId; },
			
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				return {
					text : _Text,
					phone : _Phone,
					url : _Url,
					address : _Address,
					categoryId : _CategoryId,
					iconLat : _IconLat,
					iconLng : _IconLng,
					lat : _Lat,
					lng : _Lng,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_Text = Object.text || '';
				_Phone = Object.phone || '';
				_Url = Object.url || '';
				_Address = Object.address || '';
				_CategoryId = Object.categoryId || '';
				_IconLat = Object._IconLat || 0;
				_IconLng = Object._IconLng || 0;
				_Lat = Object.lat || 0;
				_Lng = Object.lng || 0;
				_ObjId = require ( './ObjId' ) ( );
			}
		};
	};
	
	/* --- End of getNote function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getNote;
	}

} ) ( );

},{"../UI/Translator":19,"./ObjId":4,"./ObjType":5}],4:[function(require,module,exports){
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


(function() {
	
	'use strict';

	var _ObjId = 0;
	
	var getObjId = function ( ) {
		return ++ _ObjId;
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getObjId;
	}

} ) ( );

/* --- End of MapData.js file --- */
},{}],5:[function(require,module,exports){
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


(function() {
	
	'use strict';
	
	var getObjType = function ( name, version ) {
	
		var _Name = name;
		var _Version = version;
		
		return {
		
			get name ( ) { return _Name; },
			
			get version ( ) { return _Version; },
			
			get object ( ) {
				return {
					name : _Name,
					version : _Version
				};
			},
			validate : function ( object ) {
				if ( ! object.objType ) {
					throw 'No objType for ' + _Name;
				}
				if ( ! object.objType.name ) {
					throw 'No name for ' + _Name;
				}
				if ( _Name !== object.objType.name ) {
					throw 'Invalid name for ' + _Name;
				}
				if ( ! object.objType.version ) {
					throw 'No version for ' + _Name;
				}
				if ( _Version !== object.objType.version ) {
					throw 'invalid version for ' + _Name;
				}
				if ( ! object.objId ) {
					throw 'No objId for ' + _Name;
				}
				return object;
			}
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getObjType;
	}

} ) ( );
},{}],6:[function(require,module,exports){
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


(function() {
	
	'use strict';

	var _ObjType = require ( './ObjType' ) ( 'Route', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );

	var getRoute = function ( ) {
		
		var _Name = '';
		var _WayPoints = require ( './Collection' ) ( 'WayPoint' );
		_WayPoints.add ( require ( './Waypoint' ) ( ) );
		_WayPoints.add ( require ( './Waypoint' ) ( ) );
		var _Notes = require ( './Collection' ) ( 'Note' );
		
		var _Geom = require ( './Geom' ) ( );
		
		var _ObjId = require ( './ObjId' ) ( );
		
		return {
			get name ( ) { return _Name; },
			set name ( Name ) { _Name = Name;},
			
			get wayPoints ( ) { return _WayPoints; },
			
			get notes ( ) { return _Notes; },

			get geom ( ) { return _Geom; },
			set geom ( Geom ) { _Geom = Geom; },
			
			get objId ( ) { return _ObjId; },
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				return {
					name : _Name,
					wayPoints : _WayPoints.object,
					notes : _Notes.object,
					geom : _Geom.object,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_Name = Object.name || '';
				_WayPoints.object = Object.wayPoints;
				_Notes.object = Object.notes;
				_Geom.object = Object.geom;
				_ObjId = require ( './ObjId' ) ( );
			}
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRoute;
	}

} ) ( );

/* --- End of MapData.js file --- */
},{"../UI/Translator":19,"./Collection":1,"./Geom":2,"./ObjId":4,"./ObjType":5,"./Waypoint":9}],7:[function(require,module,exports){
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


(function() {
	
	'use strict';
	
	var _ObjType = require ( './ObjType' ) ( 'TravelData', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );
	
	// one and only one object TravelData is possible
	
	var _Name = '';
	var _Routes = require ( './Collection' ) ( 'Route' );
	var _Notes = require ( './Collection' ) ( 'Note' );
	var _ObjId = -1;

	var getTravelData = function ( ) {
		
		return {
			
			get routes ( ) { return _Routes; },
			
			get notes ( ) { return _Notes; },
			
			get objId ( ) { return _ObjId; },
			
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				return {
					name : _Name,
					routes : _Routes.object,
					notes : _Notes.object,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_Name = Object.name || '';
				_Routes.object = Object.routes;
				_Notes.object = Object.notes;
				_ObjId = require ( './ObjId' ) ( );
			},
			toString : function ( ) { return this.object; }
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getTravelData;
	}

} ) ( );

/* --- End of MapData.js file --- */
},{"../UI/Translator":19,"./Collection":1,"./ObjId":4,"./ObjType":5}],8:[function(require,module,exports){
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

(function() {
	
	'use strict';
	
	var _ObjType = require ( './ObjType' ) ( 'WayPoint', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );

	var getWayPoint = function ( ) {
		
		var _Name = '';
		var _Lat = 0;
		var _Lng = 0;
		
		var _ObjId = require ( './ObjId' ) ( );
		
		return {
			
			get name ( ) { return _Name; },
			
			set name ( Name ) { _Name = Name;},
			
			get UIName ( ) {
				if ( '' !== _Name ) {
					return _Name;
				}
				if ( ( 0 !== _Lat ) && ( 0 !== _Lng ) ) {
					return _Lat.toFixed ( 5 ) + ( 0 < _Lat ? ' N - ' : ' S - ' ) + _Lng.toFixed ( 5 )  + ( 0 < _Lng ? ' E' : ' W' );
				}
				return '';
			},
			
			get lat ( ) { return _Lat;},
			
			set lat ( Lat ) { _Lat = Lat; },
			
			get lng ( ) { return _Lng;},
			
			set lng ( Lng ) { _Lng = Lng; },
			
			get latLng ( ) { return [ _Lat, _Lng ];},
			
			set latLng ( LatLng ) { _Lat = LatLng [ 0 ]; _Lng = LatLng [ 1 ]; },

			get objId ( ) { return _ObjId; },
			
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				return {
					name : _Name,
					lat : _Lat,
					lng : _Lng,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_Name = Object.name || '';
				_Lat = Object.lat || 0;
				_Lng = Object.lng || 0;
				_ObjId = require ( './ObjId' ) ( );
			}
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getWayPoint;
	}

} ) ( );

/* --- End of MapData.js file --- */
},{"../UI/Translator":19,"./ObjId":4,"./ObjType":5}],9:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"../UI/Translator":19,"./ObjId":4,"./ObjType":5,"dup":8}],10:[function(require,module,exports){
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

( function ( ){
	
	'use strict';
	
	L.Travel = L.Travel || {};
	L.travel = L.travel || {};
	
	L.Travel.Control = L.Control.extend ( {
		
			options : {
				position: 'topright'
			},
			
			initialize: function ( options ) {
					L.Util.setOptions( this, options );
			},
			
			onAdd : function ( Map ) {
				var controlElement = require ( './UI/UserInterface' ) ( ).UI;
				var initialRoutes = require ( './Data/TravelData' ) ( ).routes;
				require ( './UI/RoutesListEditorUI' ) ( ).writeRoutesList ( initialRoutes );
				
				return controlElement; 
			}
		}
	);

	L.travel.control = function ( options ) {
		return new L.Travel.Control ( options );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = L.travel.control;
	}

}());

},{"./Data/TravelData":7,"./UI/RoutesListEditorUI":17,"./UI/UserInterface":20}],11:[function(require,module,exports){
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

( function ( ){
	
	'use strict';
	
	L.Travel = L.Travel || {};
	L.travel = L.travel || {};
	
	var _LeftUserContextMenu = [];
	var _RightUserContextMenu = [];
	var _RightContextMenu = false;
	var _LeftContextMenu = false;

	
	/* 
	--- L.Travel.Interface object -----------------------------------------------------------------------------
	
	This object contains all you need to use Travel :-)
	
	Patterns : Closure
	------------------------------------------------------------------------------------------------------------------------
	*/

	L.Travel.getInterface = function ( ) {

		var _TravelData = require ( './Data/TravelData' ) ( );
		_TravelData.object =
		{
			name : "TravelData sample",
			routes : 
			[
				{
					name : "Chemin du Sârtê",
					wayPoints : 
					[
						{
							name : "Chemin du Sârtê 1 - Anthisnes",
							lat : 50.50881,
							lng : 5.49314,
							objId : -1,
							objType : 
							{
								name : "WayPoint",
								version : "1.0.0"
							}
						},
						{
							name : "Chemin du Sârtê 22 - Anthisnes",
							lat : 50.50937,
							lng : 5.49470,
							objId : -2,
							objType :
							{
								name : "WayPoint",
								version : "1.0.0"
							}
						}
					],
					notes : [],
					geom :
					{
						pnts : "w~xi_BwwgnIaHkLgIkUmEyTcLie@",
						precision :6,
						color : "#0000ff",
						weight : "5",
						objId : -3,
						objType :
						{
							name : "Geom",
							version : "1.0.0"
						}
					},
					objId : -4,
					objType :
					{
						name : "Route",
						version : require ( './UI/Translator' ) ( ).getText ( 'Version' )
					}
				}
			],
			notes : [],
			objId : -5,
			objType : 
			{
				name : "TravelData",
				version : "1.0.0"
			}
		};
		console.log ( _TravelData.object );

		var onMapClick = function ( event ) {
			require ('./UI/ContextMenu' ) ( event, _LeftUserContextMenu );
		};
		var onMapContextMenu = function ( event ) {
			require ('./UI/ContextMenu' ) ( event, _RightUserContextMenu );
		};

		var _Map;
		return {

			/* --- public methods --- */
			
			/* addControl ( ) method --- 
			
			This method add the control 
			
			Parameters :
			
			*/

			addControl : function ( map, divControlId, options ) {
				if ( divControlId )	{
					document.getElementById ( divControlId ).appendChild ( require ( './UI/UserInterface' ) ( ).UI );
					var initialRoutes = require ( './Data/TravelData' ) ( ).routes;
					require ( './UI/RoutesListEditorUI' ) ( ).writeRoutesList ( initialRoutes );
				}	
				else {
					if ( typeof module !== 'undefined' && module.exports ) {
						map.addControl ( require ('./L.Travel.Control' ) ( options ) );
					}
				}
				_Map = map;
			},
			
			addMapContextMenu : function ( leftButton, rightButton ) {
				if ( leftButton ) {
					_Map.on ( 'click', onMapClick );
				}
				if ( rightButton ) {
					_Map.on ( 'contextmenu', onMapClick );
				}
			},
			get rightContextMenu ( ) { return _RightContextMenu; },
			
			set rightContextMenu ( RightContextMenu ) { 
				if  ( ( RightContextMenu ) && ( ! _RightContextMenu ) ) {
					_Map.on ( 'contextmenu', onMapContextMenu );
					_RightContextMenu = true;
				}
				else if ( ( ! RightContextMenu ) && ( _RightContextMenu ) ) {
					_Map.off ( 'contextmenu', onMapContextMenu );
					_RightContextMenu = false;
				}
			},
			
			get leftContextMenu ( ) { return _LeftContextMenu; },
			
			set leftContextMenu ( LeftContextMenu ) { 
				if  ( ( LeftContextMenu ) && ( ! _LeftContextMenu ) ) {
					_Map.on ( 'click', onMapClick );
					_LeftContextMenu = true;
				}
				else if ( ( ! LeftContextMenu ) && ( _LeftContextMenu ) ) {
					_Map.off ( 'click', onMapClick );
					_LeftContextMenu = false;
				}
			},
			
			get leftUserContextMenu ( ) { return _LeftUserContextMenu; },
			
			set leftUserContextMenu ( LeftUserContextMenu ) {_LeftUserContextMenu = LeftUserContextMenu; },
			
			get rightUserContextMenu ( ) { return _RightUserContextMenu; },
			
			set rightUserContextMenu ( RightUserContextMenu ) {_RightUserContextMenu = RightUserContextMenu; },
			
			get version ( ) { return '1.0.0'; }
		};
	};
	
	/* --- End of L.Travel.Interface object --- */		

	L.travel.interface = function ( ) {
		return L.Travel.getInterface ( );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = L.travel.interface;
	}

}());

},{"./Data/TravelData":7,"./L.Travel.Control":10,"./UI/ContextMenu":12,"./UI/RoutesListEditorUI":17,"./UI/Translator":19,"./UI/UserInterface":20}],12:[function(require,module,exports){
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

( function ( ){
	
	'use strict';
	
	var _Translator = require ( './Translator' ) ( );
	var _MenuItems = [];
	var _ContextMenuContainer = null;
	var _OriginalEvent = null;
	var _FocusIsOnItem = 0;
	
	var onCloseMenu = function ( ) {
		document.removeEventListener ( 'keydown', onKeyDown, true );
		document.removeEventListener ( 'keypress', onKeyPress, true );
		document.removeEventListener ( 'keyup', onKeyUp, true );
		var childNodes = _ContextMenuContainer.childNodes;
		childNodes [ 0 ].firstChild.removeEventListener ( 'click', onCloseMenu, false );
		for ( var childNodesCounter = 1; childNodesCounter < childNodes.length; childNodesCounter ++ ) {
			childNodes [ childNodesCounter ].firstChild.removeEventListener ( 'click', onCloseMenu, false );
		}
		
		document.getElementsByTagName('body') [0].removeChild ( _ContextMenuContainer );
		_ContextMenuContainer = null;
	};
	
	var onKeyDown = function ( keyBoardEvent ) {
		if ( _ContextMenuContainer ) {
			keyBoardEvent.preventDefault ( );
			keyBoardEvent.stopPropagation ( );
		}
		if ( 'Escape' === keyBoardEvent.key || 'Esc' === keyBoardEvent.key ) {
			onCloseMenu ( );
		}
		if ( 'ArrowDown' === keyBoardEvent.key  || 'ArrowRight' === keyBoardEvent.key  ||  'Tab' === keyBoardEvent.key ){
			_FocusIsOnItem ++;
			if ( _FocusIsOnItem > _MenuItems.length ) {
				_FocusIsOnItem = 1;
			}
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus( );
		}
		if ( 'ArrowUp' === keyBoardEvent.key  || 'ArrowLeft' === keyBoardEvent.key ){
			_FocusIsOnItem --;
			if ( _FocusIsOnItem < 1 ) {
				_FocusIsOnItem = _MenuItems.length;
			}
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus( );
		}
		if ( 'Home' === keyBoardEvent.key ) {
			_FocusIsOnItem = 1;
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus( );
		}
		if ( 'End' === keyBoardEvent.key ) {
			_FocusIsOnItem = _MenuItems.length;
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus( );
		}
		if ( ( 'Enter' === keyBoardEvent.key )  && ( _FocusIsOnItem > 0 ) && ( _MenuItems[ _FocusIsOnItem - 1 ].action ) ) {
			_MenuItems[ _FocusIsOnItem - 1 ].action ( );
			onCloseMenu ( );
		}
			
	};
	
	var onKeyPress = function ( keyBoardEvent ) {
		keyBoardEvent.preventDefault ( );
		keyBoardEvent.stopPropagation ( );
	};
	
	var onKeyUp = function ( keyBoardEvent ) {
		keyBoardEvent.preventDefault ( );
		keyBoardEvent.stopPropagation ( );
	};

	var onClickItem = function ( event ) {
		event.stopPropagation ( );
		_MenuItems[ event.target.menuItem ].action.call ( 
			_MenuItems[ event.target.menuItem ].context,
			_OriginalEvent
		);
		onCloseMenu ( );
	};
	
	var getContextMenu = function ( event, userMenu ) {

		_OriginalEvent = event; 
		
		if ( _ContextMenuContainer ) {
			onCloseMenu ( );
			return;
		}
		_MenuItems.length = 0;
		
		_MenuItems = require ( '../core/RouteEditor' ) ( ).contextMenu.concat ( userMenu );
		
		//ContextMenu-Container
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		var body = document.getElementsByTagName('body') [0];
		var tmpDiv = htmlElementsFactory.create ( 'div', { className : 'ContextMenu-Panel'} , body );
		var screenWidth = tmpDiv.clientWidth;
		var screenHeight = tmpDiv.clientHeight;
		body.removeChild ( tmpDiv );
		
		_ContextMenuContainer = htmlElementsFactory.create ( 'div', { id : 'ContextMenu-Container',className : 'ContextMenu-Container'}, body );
		
		var closeButton = htmlElementsFactory.create ( 
			'div',
			{ 
				innerHTML: '&#x274c', 
				className : 'ContextMenu-CloseButton',
				title : _Translator.getText ( "ContextMenu - close" )
			},
			_ContextMenuContainer
		);
		closeButton.addEventListener ( 'click', onCloseMenu, false );
		
		for ( var menuItemCounter = 0; menuItemCounter < _MenuItems.length; menuItemCounter ++ ) {
			var itemContainer = htmlElementsFactory.create ( 'div', { className : 'ContextMenu-ItemContainer'},_ContextMenuContainer);
			var item = htmlElementsFactory.create ( 
				'button', 
				{ 
					innerHTML : _MenuItems [ menuItemCounter ].name,
					id : 'ContextMenu-Item' + menuItemCounter,
					className : _MenuItems [ menuItemCounter ].action ? 'ContextMenu-Item' : 'ContextMenu-Item ContextMenu-ItemDisabled'
				},
				itemContainer
			);
			if ( _MenuItems [ menuItemCounter ].action ) {
				item.addEventListener ( 'click', onClickItem, false );
			}
			item.menuItem = menuItemCounter;
		}
		
		var menuTop = Math.min ( event.originalEvent.clientY, screenHeight - _ContextMenuContainer.clientHeight - 20 );
		var menuLeft = Math.min ( event.originalEvent.clientX, screenWidth - _ContextMenuContainer.clientWidth - 20 );
		_ContextMenuContainer.setAttribute ( "style", "top:" + menuTop + "px;left:" + menuLeft +"px;" );
		document.addEventListener ( 'keydown', onKeyDown, true );
		document.addEventListener ( 'keypress', onKeyPress, true );
		document.addEventListener ( 'keyup', onKeyUp, true );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getContextMenu;
	}

}());

},{"../core/RouteEditor":22,"./HTMLElementsFactory":14,"./Translator":19}],13:[function(require,module,exports){
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

( function ( ){
	
	'use strict';

	var _Translator = require ( './Translator' ) ( );
	
	var onClickExpandButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		if ( ! document.getElementById ( 'TravelControl-ErrorDataDiv' ).innerHTML.length ) {
			return;
		}	
		document.getElementById ( 'TravelControl-ErrorDataDiv' ).classList.toggle ( 'TravelControl-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelControl-ErrorDataDiv' ).classList.contains ( 'TravelControl-HiddenList' );
		document.getElementById ( 'TravelControl-ErrorExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25b2;';
		document.getElementById ( 'TravelControl-ErrorExpandButton' ).title = hiddenList ? _Translator.getText ( 'ErrorEditorUI - Show' ) : _Translator.getText ( 'ErrorEditorUI - Hide' );
	};

	// User interface

	var _UICreated = false;

	var getErrorEditorUI = function ( ) {
				
		var _CreateUI = function ( controlDiv ){ 
		
			if ( _UICreated ) {
				return;
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			htmlElementsFactory.create ( 'div', { id : 'TravelControl-ErrorDataDiv', className : 'TravelControl-DataDiv TravelControl-HiddenList'}, controlDiv );
			
			var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-ErrorHeaderDiv', className : 'TravelControl-HeaderDiv'}, controlDiv );
			var expandButton = htmlElementsFactory.create (
				'span',
				{ 
					innerHTML : '&#x25b6;',
					title : _Translator.getText ( 'ErrorEditorUI - Show' ),
					id : 'TravelControl-ErrorExpandButton',
					className : 'TravelControl-ExpandButton'
				},
				headerDiv );
			expandButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : 'Erreurs&nbsp;:', id : 'TravelControl-ErrorHeaderText', className : 'TravelControl-HeaderText'}, headerDiv );
			
			_UICreated = true;
		};

		var _ExpandUI = function ( ) {
			document.getElementById ( 'TravelControl-ErrorExpandButton' ).innerHTML = '&#x25b2;';
			document.getElementById ( 'TravelControl-ErrorExpandButton' ).title = _Translator.getText ( 'ErrorEditorUI - Hide' );
			document.getElementById ( 'TravelControl-ErrorDataDiv' ).classList.remove ( 'TravelControl-HiddenList' );
		};
		
		var _ReduceUI = function ( ) {
			document.getElementById ( 'TravelControl-ErrorExpandButton' ).innerHTML = '&#x25b6;';
			document.getElementById ( 'TravelControl-ErrorExpandButton' ).title = _Translator.getText ( 'ErrorEditorUI - Show' );
			document.getElementById ( 'TravelControl-ErrorDataDiv' ).add ( 'TravelControl-HiddenList' );
		};

		return {
			
			createUI : function ( controlDiv ) { 
				_CreateUI ( controlDiv ); 
			},
	
			expand : function ( ) {
				_ExpandUI ( );
			},
			
			reduce : function ( ) {
				_ReduceUI ( );
			},
			
			set message ( Message ) { document.getElementById ( 'TravelControl-ErrorDataDiv' ).innerHTML = Message; },
			
			get message (  ) { return document.getElementById ( 'TravelControl-ErrorDataDiv' ).innerHTML; }
			
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getErrorEditorUI;
	}

}());

},{"./HTMLElementsFactory":14,"./Translator":19}],14:[function(require,module,exports){
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

( function ( ){
	
	'use strict';
	
	/* 
	--- HTMLElementsFactory object -----------------------------------------------------------------------------
	
	Patterns : Closure
	------------------------------------------------------------------------------------------------------------------------
	*/

	var getHTMLElementsFactory = function ( ) {

		return {
			create : function ( tagName, properties, parentNode ) {
				var element;
				if ( 'text' === tagName.toLowerCase ( ) ) {
					element = document.createTextNode ( '' );
				}
				else {
					element = document.createElement ( tagName );
				}
				if ( parentNode ) {
					parentNode.appendChild ( element );
				}
				if ( properties )
				{
					for ( var property in properties ) {
						try {
							element [ property ] = properties [ property ];
						}
						catch ( e ) {
							console.log ( "Invalid property : " + property );
						}
					}
				}
				return element;
			}
			
		};
			
	};

	/* --- End of L.Travel.ControlUI object --- */		

	var HTMLElementsFactory = function ( ) {
		return getHTMLElementsFactory ( );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = HTMLElementsFactory;
	}

}());

},{}],15:[function(require,module,exports){
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

( function ( ){
	
	'use strict';
	
	var _Translator = require ( './Translator' ) ( );

	var onClickExpandButton = function ( clickEvent ) {
		
		document.getElementById ( 'TravelControl-ItineraryNotesHeaderDiv' ).classList.toggle ( 'TravelControl-SmallHeader' );
		document.getElementById ( 'TravelControlItineraryNotesDataDiv' ).classList.toggle ( 'TravelControl-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelControlItineraryNotesDataDiv' ).classList.contains ( 'TravelControl-HiddenList' );
		document.getElementById ( 'TravelControl-ItineraryNotesExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25bc;';
		document.getElementById ( 'TravelControl-ItineraryNotesExpandButton' ).title = hiddenList ? _Translator.getText ( 'ItineraryNotesEditorUI - Show' ) : _Translator.getText ( 'ItineraryNotesEditorUI - Hide' );

		clickEvent.stopPropagation ( );
	};

	var _UICreated = false;
	
	var getItineraryNotesUI = function ( ) {
		
		var _CreateUI = function ( controlDiv ) {
			
			if ( _UICreated ) {
				return;
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;

			var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-ItineraryNotesHeaderDiv', className : 'TravelControl-HeaderDiv'}, controlDiv );
			var expandButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc;', id : 'TravelControl-ItineraryNotesExpandButton', className : 'TravelControl-ExpandButton'}, headerDiv );
			expandButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 
				'span', 
				{ 
					innerHTML : _Translator.getText ( 'ItineraryNotesEditorUI - Itinerary and notes' ), 
					id : 'TravelControl-ItineraryNotesHeaderText', 
					className : 'TravelControl-HeaderText'
				},
				headerDiv 
			);
			var DataDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControlItineraryNotesDataDiv', className : 'TravelControl-DataDiv'}, controlDiv );
			DataDiv.innerHTML= "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam sodales hendrerit.Ut velit mauris, egestas sed, gravida nec, ornare ut, mi. Aenean ut orci vel massa suscipit pulvinar. Nulla sollicitudin. Fusce varius, ligula non tempus aliquam, nunc turpis ullamcorper nibh, in tempus sapien eros vitae ligula. Pellentesque rhoncus nunc et augue. Integer id felis. Curabitur aliquet pellentesque diam. Integer quis metus vitae elit lobortis egestas. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Morbi vel erat non mauris convallis vehicula. Nulla et sapien. Integer tortor tellus, aliquam faucibus, convallis id, congue eu, quam. Mauris ullamcorper felis vitae erat. Proin feugiat, augue non elementum posuere, metus purus iaculis lectus, et tristique ligula justo vitae magna.Aliquam convallis sollicitudin purus. Praesent aliquam, enim at fermentum mollis, ligula massa adipiscing nisl, ac euismod nibh nisl eu lectus. Fusce vulputate sem at sapien. Vivamus leo. Aliquam euismod libero eu enim. Nulla nec felis sed leo placerat imperdiet. Aenean suscipit nulla in justo. Suspendisse cursus rutrum augue. Nulla tincidunt tincidunt mi. Curabitur iaculis, lorem vel rhoncus faucibus, felis magna fermentum augue, et ultricies lacus lorem varius purus. Curabitur eu ametLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam sodales hendrerit.Ut velit mauris, egestas sed, gravida nec, ornare ut, mi. Aenean ut orci vel massa suscipit pulvinar. Nulla sollicitudin. Fusce varius, ligula non tempus aliquam, nunc turpis ullamcorper nibh, in tempus sapien eros vitae ligula. Pellentesque rhoncus nunc et augue. Integer id felis. Curabitur aliquet pellentesque diam. Integer quis metus vitae elit lobortis egestas. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Morbi vel erat non mauris convallis vehicula. Nulla et sapien. Integer tortor tellus, aliquam faucibus, convallis id, congue eu, quam. Mauris ullamcorper felis vitae erat. Proin feugiat, augue non elementum posuere, metus purus iaculis lectus, et tristique ligula justo vitae magna.Aliquam convallis sollicitudin purus. Praesent aliquam, enim at fermentum mollis, ligula massa adipiscing nisl, ac euismod nibh nisl eu lectus. Fusce vulputate sem at sapien. Vivamus leo. Aliquam euismod libero eu enim. Nulla nec felis sed leo placerat imperdiet. Aenean suscipit nulla in justo. Suspendisse cursus rutrum augue. Nulla tincidunt tincidunt mi. Curabitur iaculis, lorem vel rhoncus faucibus, felis magna fermentum augue, et ultricies lacus lorem varius purus. Curabitur eu amet";
			//DataDiv.innerHTML= "Lorem ipsum";
		};


		return {
			createUI : function ( controlDiv ) { 
				_CreateUI ( controlDiv ); 
			}
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getItineraryNotesUI;
	}

}());
	
},{"./HTMLElementsFactory":14,"./Translator":19}],16:[function(require,module,exports){
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

( function ( ){
	
	'use strict';
	
	var _Translator = require ( './Translator' ) ( );

	var onAddWayPointButton = function ( event ) {
		event.stopPropagation ( );
		var newWayPoints = require ( '../core/RouteEditor' ) ( ).addWayPoint ( );
	};
	
	var onReverseWayPointsButton = function ( event )
	{
		event.stopPropagation ( );
		var newWayPoints = require ( '../core/RouteEditor' ) ( ).reverseWayPoints ( );
	};
	
	var onRemoveAllWayPointsButton = function ( event )
	{
		event.stopPropagation ( );
		var newWayPoints = require ( '../core/RouteEditor' ) ( ).removeAllWayPoints ( );
	};
	
	// Events for buttons and input on the waypoints list items
	
	var onWayPointsListDelete = function ( event ) {
		event.stopPropagation ( );
		var newWayPoints = require ( '../core/RouteEditor' ) ( ).removeWayPoint ( event.itemNode.dataObjId );
	};

	var onWayPointsListUpArrow = function ( event ) {
		event.stopPropagation ( );
		var newWayPoints = require ( '../core/RouteEditor' ) ( ).swapWayPoints ( event.itemNode.dataObjId, true );
	};

	var onWayPointsListDownArrow = function ( event ) {
		event.stopPropagation ( );
		var newWayPoints = require ( '../core/RouteEditor' ) ( ).swapWayPoints ( event.itemNode.dataObjId, false );
	};

	var onWayPointsListRightArrow = function ( event ) {
		event.stopPropagation ( );
	};

	var onWayPointslistChange = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/RouteEditor' ) ( ).renameWayPoint ( event.dataObjId, event.changeValue );
	};

	var onSaveRouteButton = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/RouteEditor' ) ( ).saveEdition ( );
	};
	
	var onCancelRouteButton = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/RouteEditor' ) ( ).cancelEdition ( );
	};
	
	var onClickExpandButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		document.getElementById ( 'TravelControl-WaypointsHeaderDiv' ).classList.toggle ( 'TravelControl-SmallHeader' );
		document.getElementById ( 'TravelControl-WaypointsDataDiv' ).classList.toggle ( 'TravelControl-HiddenList' );
		document.getElementById ( 'TravelControl-WayPointsButtonsDiv' ).classList.toggle ( 'TravelControl-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelControl-WaypointsDataDiv' ).classList.contains ( 'TravelControl-HiddenList' );
		document.getElementById ( 'TravelControl-WayPointsExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25bc;';
		document.getElementById ( 'TravelControl-WayPointsExpandButton' ).title = hiddenList ? _Translator.getText ( 'RouteEditorUI - Show' ) : _Translator.getText ( 'RouteEditorUI - Hide' );
	};
	
	var onClickExpandListButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		
		document.getElementById ( 'TravelControl-WaypointsDataDiv' ).classList.toggle ( 'TravelControl-ExpandedList' );
		var expandedList = document.getElementById ( 'TravelControl-WaypointsDataDiv' ).classList.contains ( 'TravelControl-ExpandedList' );
		document.getElementById ( 'TravelControl-ExpandWayPointsListButton' ).innerHTML = expandedList ? '&#x25b3;' : '&#x25bd;';
		document.getElementById ( 'TravelControl-ExpandWayPointsListButton' ).title = expandedList ? _Translator.getText ( 'RoutesListEditorUI - Show' ) : _Translator.getText ( 'RoutesListEditorUI - Hide' );		
	};

	// User interface
	
	var _WayPointsList = null;

	var _UICreated = false;

	var getRouteEditorUI = function ( ) {
				
		var _CreateUI = function ( controlDiv ){ 

			if ( _UICreated ) {
				return;
			}
			
			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-WaypointsHeaderDiv', className : 'TravelControl-HeaderDiv'}, controlDiv );
			var expandButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc;', id : 'TravelControl-WayPointsExpandButton', className : 'TravelControl-ExpandButton'}, headerDiv );
			expandButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : _Translator.getText ( 'RouteEditorUI - Waypoints' ), id : 'TravelControl-WayPointsHeaderText',className : 'TravelControl-HeaderText'}, headerDiv );
			var dataDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-WaypointsDataDiv', className : 'TravelControl-DataDiv'}, controlDiv );
			_WayPointsList = require ( './SortableList' ) ( 
				{
					minSize : 0,
					listStyle : 'LimitedSort',
					placeholders : [ _Translator.getText ( 'RouteEditorUI - Start' ), _Translator.getText ( 'RouteEditorUI - Via' ), _Translator.getText ( 'RouteEditorUI - End' ) ],
					indexNames : [ 'A', 'index', 'B' ],
					id : 'TravelControl-WaypointsList'
				}, 
				dataDiv
			);
			_WayPointsList.container.addEventListener ( 'SortableListDelete', onWayPointsListDelete, false );
			_WayPointsList.container.addEventListener ( 'SortableListUpArrow', onWayPointsListUpArrow, false );
			_WayPointsList.container.addEventListener ( 'SortableListDownArrow', onWayPointsListDownArrow, false );
			_WayPointsList.container.addEventListener ( 'SortableListChange', onWayPointslistChange, false );

			var buttonsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-WayPointsButtonsDiv', className : 'TravelControl-ButtonsDiv'}, controlDiv );
			
			var expandListButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelControl-ExpandWayPointsListButton', 
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Expand the list' ), 
					innerHTML : '&#x25bd;'
				}, 
				buttonsDiv 
			);
			expandListButton.addEventListener ( 'click' , onClickExpandListButton, false );

			var saveRouteButton = htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelControl-SaveRouteButton',
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Save' ), 
					innerHTML : '&#x1f4be;'
				},
				buttonsDiv 
			);
			saveRouteButton.addEventListener ( 'click', onSaveRouteButton, false );
			var cancelRouteButton = htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelControl-CancelRouteButton',
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Cancel' ), 
					innerHTML : '&#x274c'
				},
				buttonsDiv 
			);
			cancelRouteButton.addEventListener ( 'click', onCancelRouteButton, false );
			var reverseWayPointsButton = htmlElementsFactory.create ( 
				'div',
				{ 
					id : 'TravelControl-ReverseWayPointsButton', 
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Invert waypoints' ),  
					innerHTML : '&#x21C5;'
				},
				buttonsDiv
			);
			reverseWayPointsButton.addEventListener ( 'click' , onReverseWayPointsButton, false );
			var addWayPointButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelControl-AddWayPointButton',
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Add waypoint' ), 
					innerHTML : '+'
				},
				buttonsDiv 
			);
			addWayPointButton.addEventListener ( 'click', onAddWayPointButton, false );
			var removeAllWayPointsButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelControl-RemoveAllWayPointsButton', 
					className: 'TravelControl-Button',
					title: _Translator.getText ( 'RouteEditorUI - Delete all waypoints' ),
					innerHTML : '&#x267b;'
				}, 
				buttonsDiv
			);
			removeAllWayPointsButton.addEventListener ( 'click' , onRemoveAllWayPointsButton, false );

		};
	
		var _ExpandUI = function ( ) {
			document.getElementById ( 'TravelControl-WayPointsExpandButton' ).innerHTML = '&#x25bc;';
			document.getElementById ( 'TravelControl-WayPointsExpandButton' ).title = 'Masquer';
			document.getElementById ( 'TravelControl-WaypointsDataDiv' ).classList.remove ( 'TravelControl-HiddenList' );
			document.getElementById ( 'TravelControl-WaypointsDataDiv' ).classList.remove ( 'TravelControl-HiddenList' );
		};
		
		var _ReduceUI = function ( ) {
			document.getElementById ( 'TravelControl-WayPointsExpandButton' ).innerHTML = '&#x25b6;';
			document.getElementById ( 'TravelControl-WayPointsExpandButton' ).title = 'Afficher';
			document.getElementById ( 'TravelControl-WaypointsButtonsDiv' ).classList.add ( 'TravelControl-HiddenList' );
			document.getElementById ( 'TravelControl-WaypointsButtonsDiv' ).classList.add ( 'TravelControl-HiddenList' );
		};

		
		return {
			createUI : function ( controlDiv ) { 
				_CreateUI ( controlDiv ); 
			},
	
			expand : function ( ) {
				_ExpandUI ( );
			},
			
			reduce : function ( ) {
				_ReduceUI ( );
			},

			writeWayPointsList : function ( newWayPoints ) {
				_WayPointsList.removeAllItems ( );
				
				var wayPointsIterator = newWayPoints.iterator;
				while ( ! wayPointsIterator.done ) {
					_WayPointsList.addItem ( wayPointsIterator.value.UIName, wayPointsIterator.value.objId, wayPointsIterator.last );
				}
			}
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRouteEditorUI;
	}

}());

},{"../core/RouteEditor":22,"./HTMLElementsFactory":14,"./SortableList":18,"./Translator":19}],17:[function(require,module,exports){
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

( function ( ){
	
	'use strict';
	
	var _Translator = require ( './Translator' ) ( );
	
	// Events listeners for buttons under the routes list
	var onClickDeleteAllRoutesButton = function ( clickEvent ) {
		clickEvent.stopPropagation();
		require ( '../core/RoutesListEditor' ) ( ).removeAllRoutes ( );
	};

	var onClickAddRouteButton = function ( event ) {
		event.stopPropagation();
		require ( '../core/RoutesListEditor' ) ( ).addRoute ( );
	};
	
	// Events for buttons and input on the routes list items
	var onRoutesListDelete = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/RoutesListEditor' ) ( ).removeRoute ( event.itemNode.dataObjId );
	};

	var onRoutesListUpArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/RoutesListEditor' ) ( ).swapRoute ( event.itemNode.dataObjId, true );
	};

	var onRoutesListDownArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/RoutesListEditor' ) ( ).swapRoute ( event.itemNode.dataObjId, false );
	};

	var onRoutesListRightArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/RoutesListEditor' ) ( ).editRoute ( event.itemNode.dataObjId );
	};
	
	var onRouteslistChange = function ( event ) {
		event.stopPropagation();
		require ( '../core/RoutesListEditor' ) ( ).renameRoute ( event.dataObjId, event.changeValue );
	};
	
	var onClickExpandButton = function ( clickEvent ) {

		clickEvent.stopPropagation ( );
		
		document.getElementById ( 'TravelControl-RoutesHeaderDiv' ).classList.toggle ( 'TravelControl-SmallHeader' );
		document.getElementById ( 'TravelControl-RoutesDataDiv' ).classList.toggle ( 'TravelControl-HiddenList' );
		document.getElementById ( 'TravelControl-RoutesButtonsDiv' ).classList.toggle ( 'TravelControl-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelControl-RoutesDataDiv' ).classList.contains ( 'TravelControl-HiddenList' );
		document.getElementById ( 'TravelControl-RoutesExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25bc;';
		document.getElementById ( 'TravelControl-RoutesExpandButton' ).title = hiddenList ? _Translator.getText ( 'RoutesListEditorUI - Show' ) : _Translator.getText ( 'RoutesListEditorUI - Hide' );

		clickEvent.stopPropagation ( );
	};
	
	var onClickExpandListButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		
		document.getElementById ( 'TravelControl-RoutesDataDiv' ).classList.toggle ( 'TravelControl-ExpandedList' );
		var expandedList = document.getElementById ( 'TravelControl-RoutesDataDiv' ).classList.contains ( 'TravelControl-ExpandedList' );
		document.getElementById ( 'TravelControl-ExpandRoutesListButton' ).innerHTML = expandedList ? '&#x25b3;' : '&#x25bd;';
		document.getElementById ( 'TravelControl-ExpandRoutesListButton' ).title = expandedList ? _Translator.getText ( 'RoutesListEditorUI - Show' ) : _Translator.getText ( 'RoutesListEditorUI - Hide' );		
	};

	// User interface

	var _RoutesList = null;

	var _UICreated = false;
	
	var getRoutesListEditorUI = function ( ) {
		
		var _CreateUI = function ( controlDiv ){ 
		
			if ( _UICreated ) {
				return;
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			// Routes
			
			var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesHeaderDiv', className : 'TravelControl-HeaderDiv'}, controlDiv );
			var expandButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc;', id : 'TravelControl-RoutesExpandButton', className : 'TravelControl-ExpandButton'}, headerDiv );
			expandButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : _Translator.getText ( 'RoutesListEditorUI - Routes' ), id : 'TravelControl-RoutesHeaderText', className : 'TravelControl-HeaderText'}, headerDiv );
			var dataDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesDataDiv', className : 'TravelControl-DataDiv'}, controlDiv );
			
			_RoutesList = require ( './SortableList' ) ( { minSize : 0, placeholders : [ _Translator.getText ( 'RoutesListEditorUI - Route' )], id : 'TravelControl-RouteList' }, dataDiv );
			_RoutesList.container.addEventListener ( 'SortableListDelete', onRoutesListDelete, false );
			_RoutesList.container.addEventListener ( 'SortableListUpArrow', onRoutesListUpArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListDownArrow', onRoutesListDownArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListRightArrow', onRoutesListRightArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListChange', onRouteslistChange, false );
			
			var buttonsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesButtonsDiv', className : 'TravelControl-ButtonsDiv' }, controlDiv );

			var expandListButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelControl-ExpandRoutesListButton', 
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'RoutesListEditorUI - Expand the list' ), 
					innerHTML : '&#x25bd;'
				}, 
				buttonsDiv 
			);
			expandListButton.addEventListener ( 'click' , onClickExpandListButton, false );
			
			var addRouteButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelControl-AddRoutesButton', 
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'RoutesListEditorUI - New route' ), 
					innerHTML : '+'
				}, 
				buttonsDiv 
			);
			addRouteButton.addEventListener ( 'click' , onClickAddRouteButton, false );

			var deleteAllRoutesButton = htmlElementsFactory.create ( 
				'div',
				{ 
					id : 'TravelControl-DeleteAllRoutesButton', 
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'RoutesListEditorUI - Delete all routes' ), 
					innerHTML : '&#x267b;'
				},
				buttonsDiv
			);
			deleteAllRoutesButton.addEventListener ( 'click' , onClickDeleteAllRoutesButton, false );	
		};
		
		
		return {
			createUI : function ( controlDiv ) { 
				_CreateUI ( controlDiv ); 
			},
			
			writeRoutesList : function ( newRoutes ) {
				_RoutesList.removeAllItems ( );
				var routesIterator = newRoutes.iterator;
				while ( ! routesIterator.done ) {
					_RoutesList.addItem ( routesIterator.value.name, routesIterator.value.objId, false );
				}
			}
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRoutesListEditorUI;
	}

}());

},{"../core/RoutesListEditor":23,"./HTMLElementsFactory":14,"./SortableList":18,"./Translator":19}],18:[function(require,module,exports){
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
( function ( ){
	
	'use strict';
	
	
	var onDragStart = function  ( DragEvent ) {
		DragEvent.stopPropagation(); // needed to avoid map movements
		try {
			DragEvent.dataTransfer.setData ( 'Text', '1' );
		}
		catch ( e ) {
		}
		console.log ( 'onDragStart' );
	};
	
	var onDragOver = function ( DragEvent ) {
		DragEvent.preventDefault();
		console.log ( 'onDragOver' );
	};
	
	var onDrop = function ( DragEvent ) { 
		DragEvent.preventDefault();
		var data = DragEvent.dataTransfer.getData("Text");
		console.log ( 'onDrop' );
	};

	/*
	var onDragEnd = function ( DragEvent ) { 
		console.log ( 'onDragEnd' );
	};
	
	var onDragEnter = function ( DragEvent ) { 
		console.log ( 'onDragLeave' );
	};
	var onDragLeave = function ( DragEvent ) { 
		console.log ( 'onDragEnter' );
	};
	*/	
	
	var onDeleteButtonClick = function ( ClickEvent ) {
		var event = new Event ( 'SortableListDelete' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation();
	};
	
	var onUpArrowButtonClick = function ( ClickEvent ) {
		var event = new Event ( 'SortableListUpArrow' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation();
	};
	
	var onDownArrowButtonClick = function ( ClickEvent ) {
		var event = new Event ( 'SortableListDownArrow' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation();
	};
	
	var onRightArrowButtonClick = function ( ClickEvent ) {
		var event = new Event ( 'SortableListRightArrow' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation();
	};
	
	var onChange = function ( changeEvent ) {
		console.log ( 'onChange' );
		var event = new Event ( 'SortableListChange' );
		event.dataObjId = changeEvent.target.parentNode.dataObjId;
		event.changeValue = changeEvent.target.value;
		changeEvent.target.parentNode.parentNode.dispatchEvent ( event );
		changeEvent.stopPropagation();
	};
	
	/* 
	--- SortableList object --------------------------------------------------------------------------------------------------
	
	--------------------------------------------------------------------------------------------------------------------------
	*/

	var SortableList = function ( options, parentNode ) {
		
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		this.items = [];
		
		/*
		--- removeAllItems method ----------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/

		this.removeAllItems = function ( ) {
			for ( var ItemCounter = 0; ItemCounter < this.items.length; ItemCounter ++ ) {
				this.container.removeChild ( this.items [ ItemCounter ] );
			}
			this.items.length = 0;
		};
		
		/*
		--- addItem method -----------------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/

		this.addItem = function ( name, dataObjId, isLastItem ) {
	
			name = name || '';
			dataObjId = dataObjId || -1;
			
			var placeholder = '';
			if ( 1 === this.options.placeholders.length ) {
				placeholder = this.options.placeholders [ 0 ];
			}
			if ( 3 === this.options.placeholders.length ) {
				switch ( this.items.length ) {
					case 0:
					placeholder = this.options.placeholders [ 0 ];
					break;
					default:
					placeholder = this.options.placeholders [ 1 ];
					break;
				}
				if ( isLastItem ) {
					placeholder = this.options.placeholders [ 2 ];
				}
			}
			
			var indexName = '';
			if ( 1 === this.options.indexNames.length ) {
				indexName = this.options.indexNames [ 0 ];
			}
			if ( 3 === this.options.indexNames.length ) {
				switch ( this.items.length ) {
					case 0:
					indexName = this.options.indexNames [ 0 ];
					break;
					default:
					indexName = this.options.indexNames [ 1 ];
					break;
				}
				if ( isLastItem ) {
					indexName = this.options.indexNames [ 2 ];
				}
			}
			if ( 'index' === indexName )
			{
				indexName = this.items.length;
			}
			
			var item = htmlElementsFactory.create ( 'div', { draggable : false , className : 'SortableList-Item' } );

			htmlElementsFactory.create ( 'div', { className : 'SortableList-ItemTextIndex' , innerHTML : indexName }, item );
			var inputElement = htmlElementsFactory.create ( 'input', { type : 'text', className : 'SortableList-ItemInput', placeholder : placeholder, value: name}, item );
			inputElement.addEventListener ( 'change' , onChange, false );
			var upArrowButton = htmlElementsFactory.create ( 'div', { className : 'SortableList-ItemUpArrowButton', title : 'Déplacer vers le haut', innerHTML : String.fromCharCode( 8679 ) }, item );
			upArrowButton.addEventListener ( 'click', onUpArrowButtonClick, false );
			var downArrowButton = htmlElementsFactory.create ( 'div', { className : 'SortableList-ItemDownArrowButton', title : 'Déplacer vers le bas', innerHTML : String.fromCharCode( 8681 ) }, item );
			downArrowButton.addEventListener ( 'click', onDownArrowButtonClick, false );
			var rightArrowButton = htmlElementsFactory.create ( 'div', { className : 'SortableList-ItemRightArrowButton', title : 'Éditer', innerHTML : String.fromCharCode( 8688 ) }, item );
			if ( 'AllSort' === this.options.listStyle ) {
				rightArrowButton.addEventListener ( 'click', onRightArrowButtonClick, false );
			}
			var deleteButton = htmlElementsFactory.create ( 'div', { className : 'SortableList-ItemDeleteButton', title : 'Supprimer', innerHTML : '&#x267b;' }, item );
			deleteButton.addEventListener ( 'click', onDeleteButtonClick, false );
			item.dataObjId = dataObjId; 

			this.items.push ( item );

			if ( ( ( 'LimitedSort' !== this.options.listStyle ) || ( 1 < this.items.length ) ) && ( ! isLastItem  ) ){
				item.draggable = true;
				item.addEventListener ( 'dragstart', onDragStart, false );	
				item.classList.add ( 'SortableList-MoveCursor' );
			}
	
			this.container.appendChild ( item );
		};
		
		
		/*
		--- _create method -----------------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/

		this._create = function ( options, parentNode ) {

			// options
			
			// options.listStyle = 'AllSort' : all items can be sorted or deleted
			// options.listStyle = 'LimitedSort' : all items except first and last can be sorted or deleted
			
			this.options = { minSize : 2, listStyle : 'AllSort', placeholders : [] , indexNames : [], id : 'SortableList-Container' } ;
			for ( var option in options ) {
				this.options [ option ] = options [ option ];
			}
			if ( ( 'LimitedSort' === this.options.listStyle ) && ( 2 > this.options.minSize ) )
			{
				this.options.minSize = 0;
			}
			this.container = htmlElementsFactory.create ( 'div', { id : options.id, className : 'SortableList-Container' } );
			this.container.classList.add ( this.options.listStyle );
			this.container.addEventListener ( 'dragover', onDragOver, false );
			this.container.addEventListener ( 'drop', onDrop, false );

			if ( parentNode ) {
				parentNode.appendChild ( this.container );
			}
			
			for ( var itemCounter = 0; itemCounter < this.options.minSize; itemCounter++ )
			{
				this.addItem ( );
			}
		};
		
		this._create ( options, parentNode );
		
	};

	var sortableList = function ( options, parentNode ) {
		return new SortableList ( options, parentNode );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = sortableList;
	}

}());

},{"./HTMLElementsFactory":14}],19:[function(require,module,exports){
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

(function() {
	
	'use strict';

	var _Fr =
	[
		{
			msgid : "ContextMenu - close",
			msgstr : "Fermer"
		},
		{
			msgid : "ErrorEditorUI - Show",
			msgstr : "Afficher"
		},
		{
			msgid : "ErrorEditorUI - Hide",
			msgstr : "Masquer"
		},
		{
			msgid : "ItineraryNotesEditorUI - Itinerary and notes",
			msgstr : "Itinéraire et notes"
		},
		{
			msgid : "ItineraryNotesEditorUI - Show",
			msgstr : "Afficher"
		},
		{
			msgid : "ItineraryNotesEditorUI - Hide",
			msgstr : "Masquer"
		},
		{
			msgid : "NoteCategory-Id01",
			msgstr : "A&#xe9;roport"
		},
		{
			msgid : "NoteCategory-Id02",
			msgstr : "Mont&#xe9;e"
		},
		{
			msgid : "NoteCategory-Id03",
			msgstr : "Distributeur de billets"
		},
		{
			msgid : "NoteCategory-Id04",
			msgstr : "Attention requise"
		},
		{
			msgid : "NoteCategory-Id05",
			msgstr : "V&#xe9;los admis"
		},
		{
			msgid : "NoteCategory-Id06",
			msgstr : "Autobus"
		},
		{
			msgid : "NoteCategory-Id07",
			msgstr : "Photo"
		},
		{
			msgid : "NoteCategory-Id08",
			msgstr : "Camping"
		},
		{
			msgid : "NoteCategory-Id09",
			msgstr : "Ferry"
		},
		{
			msgid : "NoteCategory-Id10",
			msgstr : "Auberge de jeunesse"
		},
		{
			msgid : "NoteCategory-Id11",
			msgstr : "Point d\'information"
		},
		{
			msgid : "NoteCategory-Id12",
			msgstr : "Parc national"
		},
		{
			msgid : "NoteCategory-Id13",
			msgstr : "V&#xe9;los mal vus"
		},
		{
			msgid : "NoteCategory-Id14",
			msgstr : "Parc r&#xe9;gional"
		},
		{
			msgid : "NoteCategory-Id15",
			msgstr : "Entretien v&#xe9;lo"
		},
		{
			msgid : "NoteCategory-Id16",
			msgstr : "Magasin"
		},
		{
			msgid : "NoteCategory-Id17",
			msgstr : "Aide"
		},
		{
			msgid : "NoteCategory-Id18",
			msgstr : "Stop"
		},
		{
			msgid : "NoteCategory-Id19",
			msgstr : "Table"
		},
		{
			msgid : "NoteCategory-Id20",
			msgstr : "Toilettes"
		},
		{
			msgid : "NoteCategory-Id21",
			msgstr : "Gare"
		},
		{
			msgid : "NoteCategory-Id22",
			msgstr : "Tunnel"
		},
		{
			msgid : "NoteCategory-Id23",
			msgstr : "Point d\'eau"
		},
		{
			msgid : "NoteCategory-Id24",
			msgstr : "Chambre d\'hotes"
		},
		{
			msgid : "NoteCategory-Id25",
			msgstr : "Cafetaria"
		},
		{
			msgid : "NoteCategory-Id26",
			msgstr : "Restaurant"
		},
		{
			msgid : "NoteCategory-Id27",
			msgstr : "H&#xf4;tel"
		},
		{
			msgid : "NoteCategory-Id28",
			msgstr : "D&#xe9;part"
		},
		{
			msgid : "NoteCategory-Id29",
			msgstr : "Entr&#xe9;e du ferry"
		},
		{
			msgid : "NoteCategory-Id30",
			msgstr : "Sortie du ferry"
		},
		{
			msgid : "NoteCategory-Id31",
			msgstr : "Continuer"
		},
		{
			msgid : "NoteCategory-Id32",
			msgstr : "Tourner l&#xe9;g&#xe8;rement &#xe0; gauche"
		},
		{
			msgid : "NoteCategory-Id33",
			msgstr : "Tourner &#xe0; gauche"
		},
		{
			msgid : "NoteCategory-Id34",
			msgstr : "Tourner fort &#xe0; gauche"
		},
		{
			msgid : "NoteCategory-Id35",
			msgstr : "Tourner l&#xe9;g&#xe8;rement &#xe0; droite"
		},
		{
			msgid : "NoteCategory-Id36",
			msgstr : "Tourner &#xe0; droite"
		},
		{
			msgid : "NoteCategory-Id37",
			msgstr : "Tourner fort &#xe0; droite"
		},
		{
			msgid : "NoteCategory-Id38",
			msgstr : "Point noeud v&#xe9;lo"
		},
		{
			msgid : "RouteEditor-Not possible to edit a route without a save or cancel",
			msgstr : "Il n'est pas possible d'éditer une route sans sauver ou abandonner les modifications"
		},
		{
			msgid : "RouteEditor - Select this point as start point",
			msgstr : "Sélectionner cet endroit comme point de départ"
		},
		{
			msgid : "RouteEditor - Select this point as way point",
			msgstr : "Sélectionner cet endroit comme point intermédiaire"
		},
		{
			msgid : "RouteEditor - Select this point as end point",
			msgstr : "Sélectionner cet endroit comme point de fin"
		},
		{
			msgid : "RouteEditorUI - Show",
			msgstr : "Afficher"
		},
		{
			msgid : "RouteEditorUI - Hide",
			msgstr : "Masquer"
		},
		{
			msgid : "RouteEditorUI - Waypoints",
			msgstr : "Points de passage&nbsp;:"
		},
		{
			msgid : "RouteEditorUI - Start",
			msgstr : "Départ"
		},
		{
			msgid : "RouteEditorUI - Via",
			msgstr : "Point de passage"
		},
		{
			msgid : "RouteEditorUI - End",
			msgstr : "Fin"
		},
		{
			msgid : "RouteEditorUI - Save",
			msgstr : "Sauver les modifications"
		},
		{
			msgid : "RouteEditorUI - Cancel",
			msgstr : "Abandonner les modifications"
		},
		{
			msgid : "RouteEditorUI - Invert waypoints",
			msgstr : "Inverser les points de passage"
		},
		{
			msgid : "RouteEditorUI - Add waypoint",
			msgstr : "Ajouter un point de passage"
		},
		{
			msgid : "RouteEditorUI - Delete all waypoints",
			msgstr : "Supprimer tous les points de passage"
		},
		{
			msgid : "RoutesListEditorUI - Show",
			msgstr : "Afficher"
		},
		{
			msgid : "RoutesListEditorUI - Hide",
			msgstr : "Masquer"
		},
		{
			msgid : "RoutesListEditorUI - Routes",
			msgstr : "Routes&nbsp;:"
		},
		{
			msgid : "RoutesListEditorUI - Route",
			msgstr : "Route"
		},
		{
			msgid : "RoutesListEditorUI - ",
			msgstr : "xxx"
		},
		{
			msgid : "RoutesListEditorUI - ",
			msgstr : "xxx"
		},
		{
			msgid : "RoutesListEditorUI - ",
			msgstr : "xxx"
		},
		{
			msgid : "RoutesListEditorUI - New route",
			msgstr : "Nouvelle route"
		},
		{
			msgid : "RoutesListEditorUI - Delete all routes",
			msgstr : "Supprimer toutes les routes"
		},

	];
	
	var _Translations = null;
	
	var getTranslator = function ( textId ) {
		if ( ! _Translations ) {
			_Translations = new Map ( );
			for ( var messageCounter = 0; messageCounter < _Fr.length; messageCounter ++ ) {
				_Translations.set ( _Fr [ messageCounter ].msgid, _Fr [ messageCounter ].msgstr );
			}
			_Translations.set ( 'Version', '1.0.0' );
		}
		return {
			getText : function ( textId ) { 
				var translation = _Translations.get ( textId );
				return translation === undefined ? textId : translation;
			}
		};
	};
	
	/* --- End of getNote function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getTranslator;
	}

} ) ( );

},{}],20:[function(require,module,exports){
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

( function ( ){
	
	'use strict';
	
	var _MainDiv = null;

	// User interface
	
	var getControlUI = function ( ) {

		var _CreateUI = function ( ){ 

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			_MainDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-MainDiv' } );
			
			require ( './RoutesListEditorUI' ) ( ).createUI ( _MainDiv ); 

			require ( './RouteEditorUI' ) ( ).createUI ( _MainDiv ); 

			require ( './ItineraryNotesUI' ) ( ).createUI ( _MainDiv ); 

			require ( './ErrorEditorUI' ) ( ).createUI ( _MainDiv ); 
		};
		if ( ! _MainDiv ) {
			_CreateUI ( );
		}
		
		return {
			get UI ( ) { return _MainDiv; }
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getControlUI;
	}

}());

},{"./ErrorEditorUI":13,"./HTMLElementsFactory":14,"./ItineraryNotesUI":15,"./RouteEditorUI":16,"./RoutesListEditorUI":17}],21:[function(require,module,exports){
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

( function ( ){
	
	'use strict';

	var getErrorEditor = function ( ) {

		return {
			
			showError : function ( error ) {
				var header = '<span class="TravelControl-Error">';
				var footer = '</span>';
				require ( '../UI/ErrorEditorUI' ) ( ).message = header + error + footer;
				require ( '../UI/ErrorEditorUI' ) ( ).expand ( );
			},

			clear : function ( routeObjId ) {
				require ( '../UI/ErrorEditorUI' ) ( ).message = '';
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getErrorEditor;
	}

}());

},{"../UI/ErrorEditorUI":13}],22:[function(require,module,exports){
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

( function ( ){
	
	'use strict';

	var _Route = require ( '../Data/Route' ) ( );
	var _RouteInitialObjId = -1;
	var _RouteChanged = false;
	var _Translator = require ( '../UI/Translator' ) ( );
	
	var getRouteEditor = function ( ) {

		var _RouteEditorUI = require ( '../UI/RouteEditorUI' ) ( );
	
		return {
			
			saveEdition : function ( ) {
				var travelData = require ( '../Data/TravelData' ) ( );
				travelData.routes.replace ( _RouteInitialObjId, _Route );
				_RouteChanged = false;
				// It's needed to rewrite the route list due to objId's changes
				require ( '../UI/RoutesListEditorUI') ( ).writeRoutesList ( travelData.routes );
				this.editRoute ( _Route.objId );
			},
			
			cancelEdition : function ( ) {
				_RouteChanged = false;
				this.editRoute ( _RouteInitialObjId );
			},
			
			editRoute : function ( routeObjId ) { 
				if ( _RouteChanged ) {
					require ( './ErrorEditor' ) ( ).showError ( _Translator.getText ( "RouteEditor-Not possible to edit a route without a save or cancel" ) );
					return;
				}
				_Route = require ( '../Data/Route' ) ( );
				var route = require ( '../Data/TravelData' ) ( ).routes.getAt ( routeObjId );
				_RouteInitialObjId = route.objId;
				// Route is cloned, so we can have a cancel button in the editor
				_Route.object = route.object;
				_RouteEditorUI .expand ( );
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			addWayPoint : function ( latLng ) {
				_RouteChanged = true;
				var newWayPoint = require ( '../Data/Waypoint.js' ) ( );
				if ( latLng ) {
					newWayPoint.latLng = latLng;
				}
				_Route.wayPoints.add ( newWayPoint );
				_Route.wayPoints.swap ( newWayPoint.objId, true );
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			reverseWayPoints : function ( ) {
				_RouteChanged = true;
				_Route.wayPoints.reverse ( );
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			removeAllWayPoints : function ( ) {
				_RouteChanged = true;
				_Route.wayPoints.removeAll ( true );
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			removeWayPoint : function ( wayPointObjId ) {
				_RouteChanged = true;
				_Route.wayPoints.remove ( wayPointObjId );
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			renameWayPoint : function ( wayPointObjId, wayPointName ) {
				_RouteChanged = true;
				_Route.wayPoints.getAt ( wayPointObjId ).name = wayPointName;
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			swapWayPoints : function ( wayPointObjId, swapUp ) {
				_RouteChanged = true;
				_Route.wayPoints.swap ( wayPointObjId, swapUp );
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			get contextMenu ( ) {
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, name : _Translator.getText ( "RouteEditor - Select this point as start point" ), 
						action : ( -1 !== _RouteInitialObjId ) ? this.setStartPointFromContextMenu : null
					} 
				);
				contextMenu.push ( 
					{
						context : this, name : _Translator.getText ( "RouteEditor - Select this point as way point" ), 
						action : ( -1 !== _RouteInitialObjId ) ? this.addPointFromContextMenu : null
					}
				);
				contextMenu.push (
					{ 
						context : this, name : _Translator.getText ( "RouteEditor - Select this point as end point" ), 
						action : ( -1 !== _RouteInitialObjId ) ? this.setEndPointFromContextMenu : null
					}
				);
				return contextMenu;
			},
			
			setStartPoint : function ( latLng ) {
				_RouteChanged = true;
				_Route.wayPoints.first.latLng = latLng;
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			setEndPoint : function ( latLng ) {
				_RouteChanged = true;
				_Route.wayPoints.last.latLng = latLng;
				_RouteEditorUI.writeWayPointsList ( _Route.wayPoints );
			},
			
			setStartPointFromContextMenu : function ( mapClickEvent ) {
				this.setStartPoint ( [ mapClickEvent.latlng.lat, mapClickEvent.latlng.lng ] );
			},
			
			setEndPointFromContextMenu : function ( mapClickEvent ) {
				this.setEndPoint ( [ mapClickEvent.latlng.lat, mapClickEvent.latlng.lng ] );
			},
			
			addPointFromContextMenu : function ( mapClickEvent ) {
				this.addWayPoint ( [ mapClickEvent.latlng.lat, mapClickEvent.latlng.lng ] );
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRouteEditor;
	}

}());

},{"../Data/Route":6,"../Data/TravelData":7,"../Data/Waypoint.js":9,"../UI/RouteEditorUI":16,"../UI/RoutesListEditorUI":17,"../UI/Translator":19,"./ErrorEditor":21}],23:[function(require,module,exports){
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

( function ( ){
	
	'use strict';

	var _TravelData = require ( '../Data/TravelData' ) ( );
	var _RoutesListChanged = false;
	
	var getRoutesListEditor = function ( ) {

		var _RoutesListEditorUI = require ( '../UI/RoutesListEditorUI' ) ( );

		return {
			
			addRoute : function ( ) {
				_RoutesListChanged = true;
				var newRoute = require ( '../Data/Route' ) ( );
				_TravelData.routes.add ( newRoute );
				_RoutesListEditorUI.writeRoutesList ( _TravelData.routes );
			},

			editRoute : function ( routeObjId ) {
				_RoutesListChanged = true;
				require ( './RouteEditor' ) ( ).editRoute ( routeObjId );
			},

			removeRoute : function ( routeObjId ) {
				_RoutesListChanged = true;
				_TravelData.routes.remove ( routeObjId );
				_RoutesListEditorUI.writeRoutesList ( _TravelData.routes );
			},

			removeAllRoutes : function ( routeObjId ) {
				_RoutesListChanged = true;
				_TravelData.routes.removeAll ( );
				_RoutesListEditorUI.writeRoutesList ( _TravelData.routes );
			},

			renameRoute : function ( routeObjId, routeName ) {
				_RoutesListChanged = true;
				_TravelData.routes.getAt ( routeObjId ).name = routeName;
				_RoutesListEditorUI.writeRoutesList ( _TravelData.routes );
			},

			swapRoute : function ( routeObjId, swapUp ) {
				_RoutesListChanged = true;
				_TravelData.routes.swap ( routeObjId, swapUp );
				_RoutesListEditorUI.writeRoutesList ( _TravelData.routes );
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRoutesListEditor;
	}

}());

},{"../Data/Route":6,"../Data/TravelData":7,"../UI/RoutesListEditorUI":17,"./RouteEditor":22}]},{},[11]);
