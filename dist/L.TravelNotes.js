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
		
		var _Sort = function ( compareFunction ) {
			_Array.sort ( compareFunction );
		};
		
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
				return null;
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
		
		var _ForEach = function ( funct ) {
			var result = null;
			var iterator = _Iterator ( );
			while ( ! iterator.done ) {
					result = funct ( iterator.value, result );
			}
			return result;
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
			_Array.length = 0;
			var newObject;
			for (var objectCounter = 0; objectCounter < Objects.length; objectCounter ++ ) {
				switch ( _ObjName ) {
					case 'Route' :
					newObject = require ( './Route' ) ( );
					break;
					case 'Note' :
					newObject = require ( './Note' ) ( );
					break;
					case 'WayPoint' :
					newObject = require ( './WayPoint' ) ( );
					break;
					case 'Maneuver' :
					newObject = require ( './Maneuver' ) ( );
					break;
					case 'ItineraryPoint' :
					newObject = require ( './ItineraryPoint' ) ( );
					break;
					default: 
					throw ( 'invalid ObjName ( ' + _ObjName +' ) in Collection._SetObject' );
				}
				newObject.object = Objects [ objectCounter ];
				_Add ( newObject );
			}
		};

		return {
			
			sort : function ( compareFunction ) {
				_Sort ( compareFunction );
			},
			
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
			
			forEach : function ( funct ) {
				return _ForEach ( funct );
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
			},
			
			get length ( ) { return _Array.length; }
			
		};
	};
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getCollection;
	}

} ) ( );


},{"./ItineraryPoint":4,"./Maneuver":5,"./Note":6,"./Route":9,"./WayPoint":11}],2:[function(require,module,exports){
(function (global){
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
	
	var getDataManager = function ( ) {

		return {
			init : function ( map ) {
				global.map = map;
				global.travelObjId = 0;
				global.editedRoute = require ( '../Data/Route' ) ( );
				global.editedRoute.routeChanged = false;
				global.editedRoute.routeInitialObjId = -1;
				global.travel = require ( '../Data/Travel' ) ( );
				global.mapObjects = new Map ( );
				global.routing = {};
				global.UUID = require ( '../util/Utilities' ) ( ).UUID;
			},
			get UUID ( ) { return global.UUID; },
			
			get routing ( ) { return global.routing; },
			set routing ( Routing ) { global.routing = Routing; },
			get providers ( ) { return global.providers; },
			get editedRoute ( ) { return global.editedRoute; },
			
			set editedRoute ( editedRoute ) { global.editedRoute = editedRoute; },
			
			get travel ( ) { return global.travel; },
			
			set travel ( travel ) { global.travel = travel; },
			
			get mapObjects ( ) { return global.mapObjects; },
			
			get map ( ) { return global.map; },
			
			getNoteAndRoute : function ( noteObjId ) {
				var note = null;
				note = this.travel.notes.getAt ( noteObjId );
				if ( note ) {
					return { note : note, route : null };
				}
				var routeIterator = this.travel.routes.iterator;
				while ( ! routeIterator.done ) {
					note = routeIterator.value.notes.getAt ( noteObjId );
					if ( note ) {
						return { note : note, route : routeIterator.value };
					}
				}
				note = this.editedRoute.notes.getAt (noteObjId );
				if ( ! note ) {
					console.log ( 'Invalid noteObjId ' + noteObjId + ' for function DataManager.getNote ( )' );
					return { note : null, route : null };
				}
				
				return { note : note, route : this.editedRoute };
			},
			
			getRoute : function ( routeObjId ) {
				var route = null;
				route = this.travel.routes.getAt ( routeObjId );
				if ( ! route ) {
					if ( routeObjId === this.editedRoute.objId ) {
						route = this.editedRoute;
					}
				}
				if ( ! route ) {
					console.log ( 'Invalid noteObjId ' + routeObjId + ' for function DataManager.getRoute ( )' );
				}
				
				return route;
			}			
		};
	};
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getDataManager;
	}

} ) ( );

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../Data/Route":9,"../Data/Travel":10,"../util/Utilities":50}],3:[function(require,module,exports){
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
	
	var _ObjType = require ( './ObjType' ) ( 'Itinerary', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );


	var getItinerary = function ( ) {
		
		var _ObjId = require ( './ObjId' ) ( );

		var _ItineraryPoints = require ( './Collection' ) ( 'ItineraryPoint' );

		var _Maneuvers = require ( './Collection' ) ( 'Maneuver' );
		
		var _Provider = '';
		
		var _TransitMode = '';
		
		return {
			
			get itineraryPoints ( ) { return _ItineraryPoints; },

			get maneuvers ( ) { return _Maneuvers; },
	 
			get objId ( ) { return _ObjId; },
			
			get objType ( ) { return _ObjType; },
			
			get provider ( ) { return _Provider; },
			
			set provider ( Provider ) { _Provider = Provider; },

			get transitMode ( ) { return _TransitMode; },
			
			set transitMode ( TransitMode ) { _TransitMode = TransitMode; },
			
			get object ( ) {
				return {
					itineraryPoints : _ItineraryPoints.object,
					maneuvers : _Maneuvers.object,
					provider : _Provider,
					transitMode : _TransitMode,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_ItineraryPoints.object = Object.itineraryPoints || [];
				_Maneuvers.object = Object.maneuvers || [];
				_Provider = Object.provider || '';
				_TransitMode = Object.transitMode || '';
				_ObjId = require ( './ObjId' ) ( );
				// rebuilding links between maneuvers and itineraryPoints
				var itineraryPointObjIdMap = new Map ( );
				var sourceCounter = 0;
				var targetIterator = _ItineraryPoints.iterator;
				while ( ! targetIterator.done ) {
					itineraryPointObjIdMap.set ( Object.itineraryPoints [ sourceCounter ].objId, targetIterator.value.objId );
					sourceCounter ++;
				}
				var maneuverIterator = _Maneuvers.iterator;
				while ( ! maneuverIterator.done ) {
					maneuverIterator.value.itineraryPointObjId = itineraryPointObjIdMap.get ( maneuverIterator.value.itineraryPointObjId );
				}
			}
		};
	};
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getItinerary;
	}

} ) ( );

},{"../UI/Translator":27,"./Collection":1,"./ObjId":7,"./ObjType":8}],4:[function(require,module,exports){
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
	
	var _ObjType = require ( './ObjType' ) ( 'ItineraryPoint', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );

	var getItineraryPoint = function ( ) {
		
		var _Lat = 0;
		var _Lng = 0;
		var _Distance = 0;
		var _ManeuverObjId = -1;
		
		var _ObjId = require ( './ObjId' ) ( );
		
		return {
			
			get lat ( ) { return _Lat;},
			
			set lat ( Lat ) { _Lat = Lat; },
			
			get lng ( ) { return _Lng;},
			
			set lng ( Lng ) { _Lng = Lng; },
			
			get latLng ( ) { return [ _Lat, _Lng ];},
			
			set latLng ( LatLng ) { _Lat = LatLng [ 0 ]; _Lng = LatLng [ 1 ]; },

			get distance ( ) { return _Distance;},
			
			set distance ( Distance ) { _Distance = Distance; },
						
			get maneuverObjId ( ) { return _ManeuverObjId;},
			
			set maneuverObjId ( ManeuverObjId ) { _ManeuverObjId = ManeuverObjId; },
			
			get objId ( ) { return _ObjId; },
			
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				return {
					lat : _Lat,
					lng : _Lng,
					distance : _Distance,
					maneuverObjId : _ManeuverObjId,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_Lat = Object.lat || 0;
				_Lng = Object.lng || 0;
				_Distance = Object.distance || 0;
				_ManeuverObjId = Object.maneuverObjId || -1;
				_ObjId = require ( './ObjId' ) ( );
			}
		};
	};
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getItineraryPoint;
	}

} ) ( );

/* --- End of MapData.js file --- */
},{"../UI/Translator":27,"./ObjId":7,"./ObjType":8}],5:[function(require,module,exports){
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
	
	var _ObjType = require ( './ObjType' ) ( 'Maneuver', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );

	var getManeuver = function ( ) {
		
		var _ObjId = require ( './ObjId' ) ( );

		var _IconName = '';
		var _Instruction = '';
		var _SimplifiedInstruction = '';
		var _StreetName = '';
		var _Direction = '';
		var _ItineraryPointObjId = -1;
		var _Distance = 0;
		var _Duration = 0;
		
		return {

			get iconName ( ) { return _IconName;},
			
			set iconName ( IconName ) { _IconName = IconName; },
						
			get instruction ( ) { return _Instruction;},
			
			set instruction ( Instruction ) { _Instruction = Instruction; },
						
			get simplifiedInstruction ( ) { return _SimplifiedInstruction;},
			
			set simplifiedInstruction ( SimplifiedInstruction ) { _SimplifiedInstruction = SimplifiedInstruction; },
						
			get streetName ( ) { return _StreetName;},
			
			set streetName ( StreetName ) { _StreetName = StreetName; },
						
			get direction ( ) { return _Direction;},
			
			set direction ( Direction ) { _Direction = Direction; },
						
			get itineraryPointObjId ( ) { return _ItineraryPointObjId;},
			
			set itineraryPointObjId ( ItineraryPointObjId ) { _ItineraryPointObjId = ItineraryPointObjId; },
						
			get distance ( ) { return _Distance;},
			
			set distance ( Distance ) { _Distance = Distance; },
			
			get duration ( ) { return _Duration;},
			
			set duration ( Duration ) { _Duration = Duration; },
						
			get objId ( ) { return _ObjId; },
			
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				return {
					iconName : _IconName,
					instruction : _Instruction,
					simplifiedInstruction : _SimplifiedInstruction,
					streetName :_StreetName,
					direction :_Direction,
					distance : _Distance,
					duration : _Duration,
					itineraryPointObjId : _ItineraryPointObjId,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_IconName = Object.iconName || '';
				_Instruction = Object.instruction || '';
				_SimplifiedInstruction = Object.simplifiedInstruction || '';
				_StreetName = Object.streetName || '';
				_Direction = Object.direction || '';
				_Distance = Object.distance || 0;
				_Duration = Object.duration || 0;
				_ItineraryPointObjId = Object.itineraryPointObjId || -1;
				_ObjId = require ( './ObjId' ) ( );
			}
		};
	};
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getManeuver;
	}

} ) ( );

},{"../UI/Translator":27,"./ObjId":7,"./ObjType":8}],6:[function(require,module,exports){
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

		var _IconHeight = 40;
		var _IconWidth = 40;
		var _IconContent = '';
		var _PopupContent = '';
		var _TooltipContent = '';

		var _Phone = '';
		var _Url = '';
		var _Address = '';

		var _CategoryId = '';

		var _IconLat = 0;
		var _IconLng = 0;
		var _Lat = 0;
		var _Lng = 0;
		var _Distance = -1;
		
		return {
			
			get isRouteNote ( ) { return _Distance !== -1; },

			get iconHeight ( ) { return _IconHeight;},
			
			set iconHeight ( IconHeight ) { _IconHeight = IconHeight; },

			get iconWidth ( ) { return _IconWidth;},
			
			set iconWidth ( IconWidth ) { _IconWidth = IconWidth; },

			get iconContent ( ) { return _IconContent;},
			
			set iconContent ( IconContent ) { _IconContent = IconContent; },

			get popupContent ( ) { return _PopupContent;},
			
			set popupContent ( PopupContent ) { _PopupContent = PopupContent; },

			get tooltipContent ( ) { return _TooltipContent;},
			
			set tooltipContent ( TooltipContent ) { _TooltipContent = TooltipContent; },

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
			
			get distance ( ) { return _Distance; },
			
			set distance ( Distance ) { _Distance = Distance; },

			get objId ( ) { return _ObjId; },
			
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				return {
					iconHeight : _IconHeight,
                    iconWidth : _IconWidth,
                    iconContent : _IconContent, 
                    popupContent : _PopupContent,
                    tooltipContent : _TooltipContent,
					phone : _Phone,
					url : _Url,
					address : _Address,
					categoryId : _CategoryId,
					iconLat : _IconLat,
					iconLng : _IconLng,
					lat : _Lat,
					lng : _Lng,
					distance : _Distance,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_IconHeight = Object.iconHeight || 40;
				_IconWidth = Object.iconWidth || 40;
				_IconContent = Object.iconContent || '';
				_PopupContent = Object.popupContent || '';
				_TooltipContent = Object.tooltipContent || '';
				_Phone = Object.phone || '';
				_Url = Object.url || '';
				_Address = Object.address || '';
				_CategoryId = Object.categoryId || '';
				_IconLat = Object.iconLat || 0;
				_IconLng = Object.iconLng || 0;
				_Lat = Object.lat || 0;
				_Lng = Object.lng || 0;
				_Distance = Object.distance || -1;
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

},{"../UI/Translator":27,"./ObjId":7,"./ObjType":8}],7:[function(require,module,exports){
(function (global){
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

	
	var getObjId = function ( ) {
		return ++ global.travelObjId;
	};
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getObjId;
		
	}

} ) ( );

/* --- End of MapData.js file --- */
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(require,module,exports){
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
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getObjType;
	}

} ) ( );
},{}],9:[function(require,module,exports){
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
		
		var _Itinerary = require ( './Itinerary' ) ( );
		
		var _Width = require ( '../util/Config' ) ( ).route.width || 5;
		
		var _Color = require ( '../util/Config' ) ( ).route.color || '#ff0000';
		
		var _Chain = false;
		
		var _ObjId = require ( './ObjId' ) ( );
		
		return {
			get name ( ) { return _Name; },
			set name ( Name ) { _Name = Name;},
			
			get wayPoints ( ) { return _WayPoints; },
			
			get notes ( ) { return _Notes; },
			
			get itinerary ( ) { return _Itinerary; },

			get width ( ) { return _Width; },
			set width ( Width ) { _Width = Width; },
			
			get color ( ) { return _Color; },
			set color ( Color ) { _Color = Color; },
			
			get chain ( ) { return _Chain; },
			set chain ( Chain ) { _Chain = Chain; },
			
			get objId ( ) { return _ObjId; },
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				return {
					name : _Name,
					wayPoints : _WayPoints.object,
					notes : _Notes.object,
					itinerary : _Itinerary.object,
					width : _Width,
					color : _Color,
					chain :_Chain,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_Name = Object.name || '';
				_WayPoints.object = Object.wayPoints || [];
				_Notes.object = Object.notes || [];
				_Itinerary.object = Object.itinerary || require ( './Itinerary' ) ( ).object;
				_Width = Object.width || 5;
				_Color = Object.color || '#000000';
				_Chain = Object.chain || false;
				_ObjId = require ( './ObjId' ) ( );
			}
		};
	};
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRoute;
	}

} ) ( );

/* --- End of MapData.js file --- */
},{"../UI/Translator":27,"../util/Config":48,"./Collection":1,"./Itinerary":3,"./ObjId":7,"./ObjType":8,"./Waypoint":12}],10:[function(require,module,exports){
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
	
	var _ObjType = require ( './ObjType' ) ( 'Travel', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );
	
	// one and only one object Travel is possible
	
	var _Name = 'TravelNotes.trv';
	var _Routes = require ( './Collection' ) ( 'Route' );
	_Routes.add ( require ( './Route' ) ( ) );

	var _Notes = require ( './Collection' ) ( 'Note' );
	var _ObjId = -1;

	var getTravel = function ( ) {
		
		return {
			
			get name ( ) { return _Name; },
			
			set name ( Name ) { _Name = Name;},
			
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
				_Routes.object = Object.routes || [];
				_Notes.object = Object.notes || [];
				_ObjId = require ( './ObjId' ) ( );
			},
			toString : function ( ) { return this.object; }
		};
	};
	
	/* --- End of getTravel function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getTravel;
	}

} ) ( );

/* --- End of Travel.js file --- */
},{"../UI/Translator":27,"./Collection":1,"./ObjId":7,"./ObjType":8,"./Route":9}],11:[function(require,module,exports){
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
					return _Lat.toFixed ( 6 ) + ( 0 < _Lat ? ' N - ' : ' S - ' ) + _Lng.toFixed ( 6 )  + ( 0 < _Lng ? ' E' : ' W' );
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
	
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getWayPoint;
	}

} ) ( );


},{"../UI/Translator":27,"./ObjId":7,"./ObjType":8}],12:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"../UI/Translator":27,"./ObjId":7,"./ObjType":8,"dup":11}],13:[function(require,module,exports){
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
	
	L.TravelNotes = L.TravelNotes || {};
	L.travelNotes = L.travelNotes || {};
	
	L.TravelNotes.Control = L.Control.extend ( {
		
			options : {
				position: 'topright'
			},
			
			initialize: function ( options ) {
					L.Util.setOptions( this, options );
			},
			
			onAdd : function ( Map ) {
				var controlElement = require ( './UI/UserInterface' ) ( ).UI;
				
				return controlElement; 
			}
		}
	);

	L.travelNotes.control = function ( options ) {
		return new L.TravelNotes.Control ( options );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = L.travelNotes.control;
	}

}());

},{"./UI/UserInterface":29}],14:[function(require,module,exports){
(function (global){
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
	
	
	
	L.TravelNotes = L.TravelNotes || {};
	L.travelNotes = L.travelNotes || {};
	
	var _LeftUserContextMenu = [];
	var _RightUserContextMenu = [];
	var _RightContextMenu = false;
	var _LeftContextMenu = false;
	
	var _DataManager = require ( './data/DataManager' ) ( );

	
	/* 
	--- L.TravelNotes.Interface object -----------------------------------------------------------------------------
	
	This object contains all you need to use TravelNotes :-)
	
	Patterns : Closure
	------------------------------------------------------------------------------------------------------------------------
	*/

	L.TravelNotes.getInterface = function ( ) {


		var onMapClick = function ( event ) {
			require ('./UI/ContextMenu' ) ( 
				event, 
				require ( './core/RouteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] )
				.concat ( require ( './core/NoteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] ) )
				.concat ( _LeftUserContextMenu ) 
			);
		};
		var onMapContextMenu = function ( event ) {
			require ('./UI/ContextMenu' ) (
				event, 
				require ( './core/RouteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] )
				.concat ( require ( './core/NoteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] ) )
				.concat ( _RightUserContextMenu )
			);
		};

		return {

			/* --- public methods --- */
			
			/* addControl ( ) method --- 
			
			This method add the control 
			
			Parameters :
			
			*/

			addControl : function ( map, divControlId, options ) {
				
				_DataManager.init ( map );
				
				require ( './util/Utilities' ) ( ).readURL ( );
				
				if ( divControlId )	{
					document.getElementById ( divControlId ).appendChild ( require ( './UI/UserInterface' ) ( ).UI );
				}	
				else {
					if ( typeof module !== 'undefined' && module.exports ) {
						map.addControl ( require ('./L.TravelNotes.Control' ) ( options ) );
					}
				}
				
				require ( './UI/TravelEditorUI' ) ( ).setRoutesList ( _DataManager.travel.routes );
				require ( './core/TravelEditor' ) ( ).openServerTravel ( );
			},
			
			addMapContextMenu : function ( leftButton, rightButton ) {
				if ( leftButton ) {
					_DataManager.map.on ( 'click', onMapClick );
				}
				if ( rightButton ) {
					_DataManager.map.on ( 'contextmenu', onMapClick );
				}
			},
			get rightContextMenu ( ) { return _RightContextMenu; },
			
			set rightContextMenu ( RightContextMenu ) { 
				if  ( ( RightContextMenu ) && ( ! _RightContextMenu ) ) {
					_DataManager.map.on ( 'contextmenu', onMapContextMenu );
					_RightContextMenu = true;
				}
				else if ( ( ! RightContextMenu ) && ( _RightContextMenu ) ) {
					_DataManager.map.off ( 'contextmenu', onMapContextMenu );
					_RightContextMenu = false;
				}
			},
			
			get leftContextMenu ( ) { return _LeftContextMenu; },
			
			set leftContextMenu ( LeftContextMenu ) { 
				if  ( ( LeftContextMenu ) && ( ! _LeftContextMenu ) ) {
					_DataManager.map.on ( 'click', onMapClick );
					_LeftContextMenu = true;
				}
				else if ( ( ! LeftContextMenu ) && ( _LeftContextMenu ) ) {
					_DataManager.map.off ( 'click', onMapClick );
					_LeftContextMenu = false;
				}
			},
			
			get leftUserContextMenu ( ) { return _LeftUserContextMenu; },
			
			set leftUserContextMenu ( LeftUserContextMenu ) {_LeftUserContextMenu = LeftUserContextMenu; },
			
			get rightUserContextMenu ( ) { return _RightUserContextMenu; },
			
			set rightUserContextMenu ( RightUserContextMenu ) {_RightUserContextMenu = RightUserContextMenu; },
			
			addProvider : function ( provider ) { 
			
				if ( ! global.providers ) {
					global.providers = new Map ( );
				}
				global.providers.set ( provider.name.toLowerCase( ), provider );
			},
			
			get maneuver ( ) { return require ( './data/Maneuver' ) ( ); },
			
			get itineraryPoint ( ) { return require ( './data/ItineraryPoint' ) ( );},
			
			get version ( ) { return '1.0.0'; }
		};
	};
	
	/* --- End of L.TravelNotes.Interface object --- */		

	L.travelNotes.interface = function ( ) {
		return L.TravelNotes.getInterface ( );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = L.travelNotes.interface;
	}

}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./L.TravelNotes.Control":13,"./UI/ContextMenu":18,"./UI/TravelEditorUI":28,"./UI/UserInterface":29,"./core/NoteEditor":33,"./core/RouteEditor":34,"./core/TravelEditor":36,"./data/DataManager":38,"./data/ItineraryPoint":40,"./data/Maneuver":41,"./util/Utilities":50}],15:[function(require,module,exports){
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
To do: translations
*/

( function ( ){
	
	'use strict';

	var _Translator = require ( '../UI/Translator' ) ( );
	
	var getAboutDialog = function ( color ) {
		
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;

		// the dialog base is created
		var baseDialog = require ( '../UI/BaseDialog' ) ( );
		baseDialog.title = _Translator.getText ( 'AboutDialog - Title' );
		
		var aboutDiv = htmlElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-AboutDialog-AboutDiv'
			},
			baseDialog.content
		);
		
		aboutDiv.innerHTML = 
			"<p>This  program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or any later version.</p>" +
			"<p>Copyright - 2017 - Christian Guyette</p>" +
			"<p>Contact : <a href='http://www.ouaie.be/blog/pages/contact' target='_blank'>http://www.ouaie.be/</a></p>" +
			"<p>GitHub : <a href='https://github.com/wwwouaiebe/leaflet.TravelNotes' target='_blank'>https://github.com/wwwouaiebe/leaflet.TravelNotes</a></p>" +
			"<p>Version : " + require ( '../UI/Translator' ) ( ).getText ( 'Version' ) +'.';
		
		// and the dialog is centered on the screen
		baseDialog.center ( );
		
		return baseDialog;
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getAboutDialog;
	}

}());

				
},{"../UI/BaseDialog":16,"../UI/Translator":27,"./HTMLElementsFactory":20}],16:[function(require,module,exports){
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
To do: translations
*/

( function ( ){
	
	'use strict';

	var _Translator = require ( '../UI/Translator' ) ( );
	var _OkButtonListener = null;

	var onKeyDown = function ( keyBoardEvent ) {
		if ( 'Escape' === keyBoardEvent.key || 'Esc' === keyBoardEvent.key ) {
			document.removeEventListener ( 'keydown', onKeyDown, true );
			document.getElementsByTagName('body') [0].removeChild ( document.getElementById ( "TravelNotes-BaseDialog-BackgroundDiv" ) );
		}
	};
	
	var getBaseDialog = function ( ) {
		
		_OkButtonListener = null;
		
		var dialogObjId = require ( '../data/ObjId' ) ( );

		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		var body = document.getElementsByTagName('body') [0];
		var backgroundDiv = htmlElementsFactory.create ( 'div', { id: 'TravelNotes-BaseDialog-BackgroundDiv', className : 'TravelNotes-BaseDialog-BackgroundDiv'} , body );
		backgroundDiv.addEventListener ( 
			'dragover', 
			function ( event ) {
				return;
			},
			false
		);	
		backgroundDiv.addEventListener ( 
			'drop', 
			function ( event ) {
				return;
			},
			false
		);	

		var screenWidth = backgroundDiv.clientWidth;
		var screenHeight = backgroundDiv.clientHeight;
		
		var startDragX = 0;
		var startDragY = 0;
		
		var dialogX = 0;
		var dialogY = 0;

		var dialogContainer = htmlElementsFactory.create ( 
			'div',
			{ 
				id : 'TravelNotes-BaseDialog-Container-' + dialogObjId,
				className : 'TravelNotes-BaseDialog-Container',
			},
			backgroundDiv
		);
		var topBar = htmlElementsFactory.create ( 
			'div',
			{ 
				id : 'TravelNotes-BaseDialog-TopBar',
				className : 'TravelNotes-BaseDialog-TopBar',
				draggable : true
			},
			dialogContainer
		);
		var cancelButton = htmlElementsFactory.create ( 
			'div',
			{ 
				innerHTML: '&#x274c', 
				id : 'TravelNotes-BaseDialog-CancelButton',
				title : _Translator.getText ( "DialogBase - close" )
			},
			topBar
		);
		cancelButton.addEventListener ( 
			'click',
			function ( ) {
				document.removeEventListener ( 'keydown', onKeyDown, true );
				document.getElementsByTagName('body') [0].removeChild ( backgroundDiv );
			},
			false
		);
		topBar.addEventListener ( 
			'dragstart', 
			function ( event ) {
				try {
					event.dataTransfer.setData ( 'Text', '1' );
				}
				catch ( e ) {
				}
				startDragX = event.screenX;
				startDragY = event.screenY;
			},
			false
		);	
		topBar.addEventListener ( 
			'dragend', 
			function ( event ) {
				dialogX += event.screenX - startDragX;
				dialogY += event.screenY - startDragY;
				dialogX = Math.min ( Math.max ( dialogX, 20 ),screenWidth - dialogContainer.clientWidth -20 );
				dialogY = Math.max ( dialogY, 20 );
				var dialogMaxHeight = screenHeight - Math.max ( dialogY, 0 ) - 20;
				dialogContainer.setAttribute ( "style", "top:" + dialogY + "px;left:" + dialogX +"px;max-height:" + dialogMaxHeight +"px;" );
			},
			false 
		);
		var headerDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-HeaderDiv',
			},
			dialogContainer
		);		
		
		var contentDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-ContentDiv',
			},
			dialogContainer
		);
		var errorDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-ErrorDiv TravelNotes-BaseDialog-ErrorDivHidden',
				id : 'TravelNotes-BaseDialog-ErrorDiv',
			},
			dialogContainer
		);
		var footerDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-FooterDiv',
			},
			dialogContainer
		);
		var okButton = htmlElementsFactory.create ( 
			'div',
			{ 
				innerHTML: '&#x1f4be;', 
				id : 'TravelNotes-BaseDialog-OkButton',
				className : 'TravelNotes-BaseDialog-Button'
			},
			footerDiv
		);
		okButton.addEventListener ( 
			'click',
			function ( ) {
				if ( _OkButtonListener ) {
					if ( ! _OkButtonListener ( ) ) {
						return;
					}
				}
				document.removeEventListener ( 'keydown', onKeyDown, true );
				document.getElementsByTagName('body') [0].removeChild ( backgroundDiv );
			},
			false
		);				
		document.addEventListener ( 'keydown', onKeyDown, true );
		
		return {
			addClickOkButtonEventListener : function ( listener ) {
				_OkButtonListener = listener;
			},
			
			get title ( ) { return headerDiv.innerHTML; },
			set title ( Title ) { headerDiv.innerHTML = Title; },
			center : function ( ) {
				dialogX = ( screenWidth - dialogContainer.clientWidth ) / 2;
				dialogY = ( screenHeight - dialogContainer.clientHeight ) / 2;
				dialogX = Math.min ( Math.max ( dialogX, 20 ),screenWidth - dialogContainer.clientWidth -20 );
				dialogY = Math.max ( dialogY, 20 );
				var dialogMaxHeight = screenHeight - Math.max ( dialogY, 0 ) - 20;
				dialogContainer.setAttribute ( "style", "top:" + dialogY + "px;left:" + dialogX +"px;max-height:" + dialogMaxHeight +"px;" );
			},

			get header ( ) { return headerDiv;},
			set header ( Header ) { headerDiv = Header; },
			
			get content ( ) { return contentDiv;},
			set content ( Content ) { contentDiv = Content; },

			get footer ( ) { return footerDiv;},
			set footer ( Footer ) { footerDiv = Footer; }
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getBaseDialog;
	}

}());

},{"../UI/Translator":27,"../data/ObjId":43,"./HTMLElementsFactory":20}],17:[function(require,module,exports){
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
To do: translations
*/

( function ( ){
	
	'use strict';

	var _Translator = require ( '../UI/Translator' ) ( );
	
	var onOkButtonClick = function ( ) {
		console.log ( 'onOkButtonClick - colorDialog' );
		return true;
	};

	var getColorDialog = function ( color ) {
		
		var colorToNumbers = function ( color ) {
			return {
				r : parseInt ( color.substr ( 1, 2 ), 16 ),
				g : parseInt ( color.substr ( 3, 2 ), 16 ), 
				b : parseInt ( color.substr ( 5, 2 ), 16 ), 
			};
		};
		
		var numbersToColor = function ( r, g, b ) {
			return '#' + 
				parseInt ( r ).toString(16).padStart ( 2, '0' ) + 
				parseInt ( g ).toString(16).padStart ( 2, '0' ) + 
				parseInt ( b ).toString(16).padStart ( 2, '0' ) ;
		};
		
		var newColor = color;
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;

		// the dialog base is created
		var baseDialog = require ( '../UI/BaseDialog' ) ( );
		baseDialog.title = _Translator.getText ( 'ColorDialog - Title' );
		baseDialog.addClickOkButtonEventListener ( onOkButtonClick );
		baseDialog.getNewColor = function ( ) {
			return newColor;
		};
		
		var colorDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-ColorDiv',
				id : 'TravelNotes-ColorDialog-ColorDiv'
			},
			baseDialog.content
		);
		var buttonsDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-ButtonsDiv',
				id : 'TravelNotes-ColorDialog-ButtonsDiv'
			},
			colorDiv
		);

		var setColor = function ( event ) {
			newColor = event.target.colorValue;
			var numbers = colorToNumbers ( newColor );
			redInput.value = numbers.r;
			greenInput.value = numbers.g;
			blueInput.value = numbers.b;
			document.getElementById ( 'TravelNotes-ColorDialog-ColorSampleDiv').setAttribute ( 'style', 'background-color:'+ event.target.colorValue +';' );
		};
		
		var changeColor = function ( event ) {
			var r = event.target.redValue;
			var g = 255;
			var b = 255;
			var rowCounter = 0;
			while ( ++ rowCounter < 7 ) {
				var cellCounter = 0;
				g = 255;
				while ( ++ cellCounter < 7 ) {
					var button = document.getElementById ( ( 'TravelNotes-ColorDialog-CellColorDiv' + rowCounter ) + cellCounter );
					button.colorValue = numbersToColor ( r, g, b );
					button.setAttribute ( 'style', 'background-color:' + numbersToColor ( r, g, b ) );
					g -= 51;
				}
				b -= 51;
			}
		};
		
		var r = 255;
		var g = 255;
		var b = 255;
		
		var rowCounter = 0;
		
		while ( ++ rowCounter < 8 ) {
			
			var colorButtonsRowDiv = htmlElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-ColorDialog-RowColorDiv',
					id : 'TravelNotes-ColorDialog-RowColorDiv' +rowCounter
				},
				buttonsDiv
			);
			
			var cellCounter = 0;
			g = 255;
			while ( ++ cellCounter < 7 ) {
				var className = 'TravelNotes-ColorDialog-CellColorDiv';
				if ( rowCounter < 7 ) {
					className = 'TravelNotes-ColorDialog-CellColorDiv TravelNotes-ColorDialog-RedDiv';
				}
				var colorButtonCellDiv = htmlElementsFactory.create (
					'div',
					{
						className : 'TravelNotes-ColorDialog-CellColorDiv',
						id : ( 'TravelNotes-ColorDialog-CellColorDiv' + rowCounter ) + cellCounter
					},
					colorButtonsRowDiv
				);
				if ( rowCounter < 7 ) {
					colorButtonCellDiv.setAttribute ( 'style', 'background-color:' + numbersToColor ( r, g, b ) );
					colorButtonCellDiv.colorValue = numbersToColor ( r, g, b );
					colorButtonCellDiv.addEventListener ( 'click', setColor, false );
					g -= 51;
				}
				else
				{
					r = ( cellCounter - 1 ) * 51;
					var buttonColor = numbersToColor ( 255, r, r );
					colorButtonCellDiv.setAttribute ( 'style', 'background-color:' + buttonColor );
					colorButtonCellDiv.redValue = 255 - r;
					colorButtonCellDiv.addEventListener ( 'click', changeColor, false );
				}
			}
			b -= 51;
		}
		
		var rvbDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-DataDiv',
				id : 'TravelNotes-ColorDialog-DataDiv'
			},
			colorDiv
		);
		
		var changeSampleColor = function ( )  {
			newColor = numbersToColor ( redInput.value, greenInput.value, blueInput.value );
			document.getElementById ( 'TravelNotes-ColorDialog-ColorSampleDiv').setAttribute ( 'style', 'background-color:' + newColor + ';' );
		};
		
		// ... red ...
		htmlElementsFactory.create (
			'text',
			{
				data : _Translator.getText ( 'ColorDialog - red'),
			},
			rvbDiv
		);
		var redInput =  htmlElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				id : 'TravelNotes-ColorDialog-RedInput'
				
			},
			rvbDiv
		);
		redInput.value = colorToNumbers ( color ).r;
		redInput.min = 0;
		redInput.max = 255;
		
		redInput.addEventListener ( 'input', changeSampleColor, false );
		
		// ... and green...
		htmlElementsFactory.create (
			'text',
			{
				data : _Translator.getText ( 'ColorDialog - green'),
			},
			rvbDiv
		);
		var greenInput =  htmlElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				id : 'TravelNotes-ColorDialog-GreenInput'
			},
			rvbDiv
		);
		greenInput.value = colorToNumbers ( color ).g;
		greenInput.min = 0;
		greenInput.max = 255;
		greenInput.addEventListener ( 'input', changeSampleColor, false );

		// ... and green
		htmlElementsFactory.create (
			'text',
			{
				data : _Translator.getText ( 'ColorDialog - blue'),
			},
			rvbDiv
		);
		var blueInput =  htmlElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-ColorDialog-NumberInput',
				id : 'TravelNotes-ColorDialog-BlueInput'
			},
			rvbDiv
		);
		blueInput.value = colorToNumbers ( color ).b;
		blueInput.min = 0;
		blueInput.max = 255;
		blueInput.addEventListener ( 'input', changeSampleColor, false );
		
		var colorSampleDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-ColorDialog-DataDiv',
				id : 'TravelNotes-ColorDialog-ColorSampleDiv'
			},
			colorDiv
		);
		colorSampleDiv.setAttribute ( 'style', 'background-color:'+ color +';' );

		
		// and the dialog is centered on the screen
		baseDialog.center ( );
		
		return baseDialog;
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getColorDialog;
	}

}());

		
},{"../UI/BaseDialog":16,"../UI/Translator":27,"./HTMLElementsFactory":20}],18:[function(require,module,exports){
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
	var _Lat = 0;
	var _Lng = 0;
	
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
		if ( _MenuItems[ event.target.menuItem ].param ) {
			_MenuItems[ event.target.menuItem ].action.call ( 
				_MenuItems[ event.target.menuItem ].context,
				_MenuItems[ event.target.menuItem ].param,
				_OriginalEvent
			);
		}
		else {
			_MenuItems[ event.target.menuItem ].action.call ( 
				_MenuItems[ event.target.menuItem ].context,
				_OriginalEvent
			);
		}
		_Lat = 0;
		_Lng = 0;
		onCloseMenu ( );
	};
	
	var getContextMenu = function ( event, userMenu ) {

	// stopPropagation ( ) and preventDefault ( ) are not working correctly on leaflet events, so the event continue...
	// to avoid the menu close directly, we compare the lat and lng of the event with the lat and lng of the previous event
	// and we stop the procedure if equals.
		if  ( ( event.latlng.lat === _Lat ) && ( event.latlng.lng === _Lng ) ) {
			_Lat = 0;
			_Lng = 0;
			return;
		}
		else
		{
			_Lat = event.latlng.lat;
			_Lng = event.latlng.lng;
		}
		
		_OriginalEvent = event; 
		
		if ( _ContextMenuContainer ) {
			onCloseMenu ( );
			return;
		}
		_MenuItems = userMenu;
			
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		var body = document.getElementsByTagName('body') [0];
		var tmpDiv = htmlElementsFactory.create ( 'div', { className : 'TravelNotes-ContextMenu-Panel'} , body );
		var screenWidth = tmpDiv.clientWidth;
		var screenHeight = tmpDiv.clientHeight;
		body.removeChild ( tmpDiv );
		
		_ContextMenuContainer = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-ContextMenu-Container',className : 'TravelNotes-ContextMenu-Container'}, body );
		
		var closeButton = htmlElementsFactory.create ( 
			'div',
			{ 
				innerHTML: '&#x274c', 
				className : 'TravelNotes-ContextMenu-CloseButton',
				title : _Translator.getText ( "ContextMenu - close" )
			},
			_ContextMenuContainer
		);
		closeButton.addEventListener ( 'click', onCloseMenu, false );
		
		for ( var menuItemCounter = 0; menuItemCounter < _MenuItems.length; menuItemCounter ++ ) {
			var itemContainer = htmlElementsFactory.create ( 'div', { className : 'TravelNotes-ContextMenu-ItemContainer'},_ContextMenuContainer);
			var item = htmlElementsFactory.create ( 
				'button', 
				{ 
					innerHTML : _MenuItems [ menuItemCounter ].name,
					id : 'TravelNotes-ContextMenu-Item' + menuItemCounter,
					className : _MenuItems [ menuItemCounter ].action ? 'TravelNotes-ContextMenu-Item' : 'TravelNotes-ContextMenu-Item TravelNotes-ContextMenu-ItemDisabled'
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

},{"./HTMLElementsFactory":20,"./Translator":27}],19:[function(require,module,exports){
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
		if ( ! document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).innerHTML.length ) {
			return;
		}	
		document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).classList.contains ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-Control-ErrorExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25b2;';
		document.getElementById ( 'TravelNotes-Control-ErrorExpandButton' ).title = hiddenList ? _Translator.getText ( 'ErrorEditorUI - Show' ) : _Translator.getText ( 'ErrorEditorUI - Hide' );
	};

	// User interface

	var getErrorEditorUI = function ( ) {
				
		var _CreateUI = function ( controlDiv ){ 
		
			if ( document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ) ) {
				return;
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-ErrorDataDiv', className : 'TravelNotes-Control-DataDiv TravelNotes-Control-HiddenList'}, controlDiv );
			
			var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-ErrorHeaderDiv', className : 'TravelNotes-Control-HeaderDiv'}, controlDiv );
			var expandButton = htmlElementsFactory.create (
				'span',
				{ 
					innerHTML : '&#x25b6;',
					title : _Translator.getText ( 'ErrorEditorUI - Show' ),
					id : 'TravelNotes-Control-ErrorExpandButton',
					className : 'TravelNotes-Control-ExpandButton'
				},
				headerDiv );
			expandButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : 'Erreurs&nbsp;:', id : 'TravelNotes-Control-ErrorHeaderText', className : 'TravelNotes-Control-HeaderText'}, headerDiv );
			
		};

		var _ExpandUI = function ( ) {
			document.getElementById ( 'TravelNotes-Control-ErrorExpandButton' ).innerHTML = '&#x25b2;';
			document.getElementById ( 'TravelNotes-Control-ErrorExpandButton' ).title = _Translator.getText ( 'ErrorEditorUI - Hide' );
			document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).classList.remove ( 'TravelNotes-Control-HiddenList' );
		};
		
		var _ReduceUI = function ( ) {
			document.getElementById ( 'TravelNotes-Control-ErrorExpandButton' ).innerHTML = '&#x25b6;';
			document.getElementById ( 'TravelNotes-Control-ErrorExpandButton' ).title = _Translator.getText ( 'ErrorEditorUI - Show' );
			document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).add ( 'TravelNotes-Control-HiddenList' );
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
			
			set message ( Message ) { document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).innerHTML = Message; },
			
			get message (  ) { return document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).innerHTML; }
			
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getErrorEditorUI;
	}

}());

},{"./HTMLElementsFactory":20,"./Translator":27}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
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
	--- HTMLViewsFactory object -----------------------------------------------------------------------------
	
	Patterns : Closure
	------------------------------------------------------------------------------------------------------------------------
	*/

	var _HTMLElementsFactory = require ( '../UI/HTMLElementsFactory' ) ( );
	var _DataManager = require ( '../data/DataManager' ) ( );
	var _Translator = require ( '../UI/Translator' ) ( );
	var _Utilities = require ( '../util/Utilities' ) ( );
	var _NoteEditor = require ( '../core/NoteEditor' ) ( );
	var _RouteEditor = require ( '../core/RouteEditor' ) ( );
	
	var _ClassNamePrefix = 'TravelNotes-Control-';
	
	var getHTMLViewsFactory = function ( ) {
				
		var _AddNoteHTML = function ( note, rowDiv ) {
			_HTMLElementsFactory.create (
				'div',
				{ 
					className : _ClassNamePrefix + 'Travel-Notes-IconCell',
					innerHTML : note.iconContent
				}, 
				rowDiv
			);
			var noteElement = _HTMLElementsFactory.create (
				'div',
				{ 
					className : _ClassNamePrefix + 'Travel-Notes-Cell',
					innerHTML : _NoteEditor.getNoteHTML ( note, _ClassNamePrefix )
				}, 
				rowDiv
			);
		};

		var _GetTravelHeaderHTML = function ( ) {
			var travelHeaderHTML = _HTMLElementsFactory.create ( 'div', { className :  _ClassNamePrefix + 'Travel-Header' } ); 
			_HTMLElementsFactory.create ( 
				'div',
				{ 
					className : _ClassNamePrefix + 'Travel-Header-Name',
					innerHTML: _DataManager.travel.name
				},
				travelHeaderHTML
			); 
			
			var travelRoutesIterator = _DataManager.travel.routes.iterator;
			while ( ! travelRoutesIterator.done ) {
				_HTMLElementsFactory.create ( 
					'div',
					{ 
						className : _ClassNamePrefix + 'Travel-Header-RouteName',
						innerHTML: travelRoutesIterator.value.name
					},
					travelHeaderHTML
				); 
			}
			
			return travelHeaderHTML;
		};

		var _GetTravelNotesHTML = function ( ) {
			var travelNotesHTML = _HTMLElementsFactory.create ( 'div', { className :  _ClassNamePrefix + 'Travel-Notes'} ); 
			var travelNotesIterator = _DataManager.travel.notes.iterator;
			while ( ! travelNotesIterator.done ) {
				var rowDiv = _HTMLElementsFactory.create ( 
					'div', 
					{ className : _ClassNamePrefix + 'Travel-Notes-Row'}, 
					travelNotesHTML
				);
				 _AddNoteHTML ( travelNotesIterator.value, rowDiv ) ;
			}
			
			return travelNotesHTML;
		};

		var _GetRouteHeaderHTML = function ( route ) {
			return _HTMLElementsFactory.create ( 
				'div',
				{ 
					className : _ClassNamePrefix + 'Route-Header',
					innerHTML: _RouteEditor.getRouteHTML ( route, _ClassNamePrefix )
				}
			); 
		};

		var _GetRouteManeuversAndNotesHTML = function ( route ) {
			var routeManeuversAndNotesHTML = _HTMLElementsFactory.create ( 'div', { className : _ClassNamePrefix + 'Route-ManeuversAndNotes' } ); 
			
			var notesIterator = route.notes.iterator;
			var notesDone =  notesIterator.done;
			var notesDistance = ! notesDone ? notesIterator.value.distance : 999999999;
			
			var maneuversIterator = route.itinerary.maneuvers.iterator;
			var maneuversDone = maneuversIterator.done;
			var maneuversDistance = 0;
			
			while ( ! ( maneuversDone && notesDone ) ) {
				var rowDiv = _HTMLElementsFactory.create ( 
					'div', 
					{ className : _ClassNamePrefix + 'Route-ManeuversAndNotes-Row' }, 
					routeManeuversAndNotesHTML
				);

				if ( maneuversDistance <= notesDistance ) {
					if ( ! maneuversDone ) {
						_HTMLElementsFactory.create (
							'div',
							{ 
								className : _ClassNamePrefix + 'Route-ManeuversAndNotes-IconCell ' + 'TravelNotes-ManeuverNote-' + maneuversIterator.value.iconName,
							}, 
							rowDiv
						);
						
						var maneuverText = 
							'<div>' +  maneuversIterator.value.instruction + '</div>';
						
						if ( 0 < maneuversIterator.value.distance ) {
							maneuverText +=	'<div>' + 
								_Translator.getText ( 
									'HTMLViewsFactory - ToNextInstruction', 
									{
										distance : _Utilities.formatDistance ( maneuversIterator.value.distance ),
										duration : _Utilities.formatTime (maneuversIterator.value.duration )
									}
								) + '</div>';
						}
						_HTMLElementsFactory.create (
							'div',
							{ 
								className : _ClassNamePrefix + 'Route-ManeuversAndNotes-Cell',
								innerHTML : maneuverText
							}, 
							rowDiv
						);
						
						rowDiv.objId= require ( '../data/ObjId' ) ( );
						rowDiv.latLng = route.itinerary.itineraryPoints.getAt ( maneuversIterator.value.itineraryPointObjId ).latLng;
						
						maneuversDistance +=  maneuversIterator.value.distance;
						maneuversDone = maneuversIterator.done;
						if ( maneuversDone ) {
							maneuversDistance = 999999999;
						}
					}
				}
				else {
					if ( ! notesDone ) {

						_AddNoteHTML ( notesIterator.value, rowDiv );

						rowDiv.objId= require ( '../data/ObjId' ) ( );
						rowDiv.latLng = notesIterator.value.latLng;
						
						notesDone = notesIterator.done;
						notesDistance = notesDone ? 999999999 :  notesIterator.value.distance;
					}
				}	
			}
			
			return routeManeuversAndNotesHTML;
		};

		var _GetRouteFooterHTML = function ( route ) {
			return _HTMLElementsFactory.create ( 
				'div', 
				{ 
					className : _ClassNamePrefix + 'RouteFooter',
					innerHTML : _Translator.getText ( 
						'HTMLViewsFactory - Route footer', 
						{
							provider: route.itinerary.provider, 
							transitMode : _Translator.getText ( 'HTMLViewsFactory - TransitMode ' +	route.itinerary.transitMode )
						} 
					)
				}
			); 
		};

		var _GetTravelFooterHTML = function ( ) {
			return _HTMLElementsFactory.create ( 
				'div',
				{ 
					className : _ClassNamePrefix + 'TravelFooter',
					innerHTML : _Translator.getText ( 'HTMLViewsFactory - Travel footer' )
				} 
			); 
		};

		var _GetTravelHTML = function ( ) {
			var travelHTML = _HTMLElementsFactory.create ( 'div', { className : _ClassNamePrefix + 'Travel'} ); 
			
			travelHTML.appendChild ( _GetTravelHeaderHTML ( ) );
			travelHTML.appendChild ( _GetTravelNotesHTML ( ) );
			
			var travelRoutesIterator = _DataManager.travel.routes.iterator;
			while ( ! travelRoutesIterator.done ) {
				travelHTML.appendChild ( _GetRouteHeaderHTML ( travelRoutesIterator.value ) );
				travelHTML.appendChild ( _GetRouteManeuversAndNotesHTML ( travelRoutesIterator.value ) );
				travelHTML.appendChild ( _GetRouteFooterHTML ( travelRoutesIterator.value ) );
			}
			
			travelHTML.appendChild ( _GetTravelFooterHTML ( ) );

			return travelHTML;
		};

		return {
			set classNamePrefix ( ClassNamePrefix ) { _ClassNamePrefix = ClassNamePrefix; },
			
			get classNamePrefix ( ) { return _ClassNamePrefix; },
			
			get travelHeaderHTML ( )  { return _GetTravelHeaderHTML ( ); }, 
			
			get travelNotesHTML ( )  { return _GetTravelNotesHTML ( ); }, 
			
			get routeHeaderHTML ( )  { return _GetRouteHeaderHTML ( _DataManager.editedRoute ); }, 
			
			get routeManeuversAndNotesHTML ( )  { return _GetRouteManeuversAndNotesHTML ( _DataManager.editedRoute ); }, 
			
			get routeFooterHTML ( )  { return _GetRouteFooterHTML ( _DataManager.editedRoute ); }, 
			
			get travelFooterHTML ( )  { return _GetTravelFooterHTML ( ); }, 
			
			get travelHTML ( ) { return  _GetTravelHTML ( ); }
		};
			
	};

	/* --- End of L.Travel.ControlUI object --- */		
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getHTMLViewsFactory;
	}

}());

},{"../UI/HTMLElementsFactory":20,"../UI/Translator":27,"../core/NoteEditor":33,"../core/RouteEditor":34,"../data/DataManager":38,"../data/ObjId":43,"../util/Utilities":50}],22:[function(require,module,exports){
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
	var _Utilities = require ( '../util/Utilities' ) ( );
	var _DataManager = require ( '../data/DataManager' ) ( );
	var _RouteEditor = require ( '../core/RouteEditor' ) ( );
	
	var onClickExpandButton = function ( clickEvent ) {
		
		clickEvent.stopPropagation ( );

		document.getElementById ( 'TravelNotes-Control-ItineraryHeaderDiv' ).classList.toggle ( 'TravelNotes-Control-SmallHeader' );
		document.getElementById ( 'TravelNotes-Control-ItineraryDataDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelNotes-Control-ItineraryDataDiv' ).classList.contains ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-Control-ItineraryExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25bc;';
		document.getElementById ( 'TravelNotes-Control-ItineraryExpandButton' ).title = hiddenList ? _Translator.getText ( 'ItineraryEditorUI - Show' ) : _Translator.getText ( 'ItineraryEditorUI - Hide' );

	};
	
	var onInstructionClick = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		var element = clickEvent.target;
		while ( ! element.latLng ) {
			element = element.parentNode;
		}
		require ( '../core/MapEditor' ) ( ).zoomToPoint ( element.latLng );
	};

	var onInstructionContextMenu = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		clickEvent.preventDefault ( );
		require ( '../core/NoteEditor' ) ( ).newManeuverNote ( clickEvent.target.maneuverObjId, clickEvent.target.itineraryPointObjId );
	};

	var onInstructionMouseEnter = function ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		require ( '../core/MapEditor' ) ( ).addItineraryPointMarker ( mouseEvent.target.objId, mouseEvent.target.latLng  );
	};

	var onInstructionMouseLeave = function ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		require ( '../core/MapEditor' ) ( ).removeObject ( mouseEvent.target.objId );
	};
	var onClicktransitModeButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		_DataManager.routing.transitMode = clickEvent.target.transitMode;
		document.getElementById ( 'TravelNotes-Control-BikeImgButton' ).classList.remove ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
		document.getElementById ( 'TravelNotes-Control-PedestrianImgButton' ).classList.remove ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
		document.getElementById ( 'TravelNotes-Control-CarImgButton' ).classList.remove ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
		clickEvent.target.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
		_RouteEditor.startRouting ( );
	};
	
	var onProviderButtonClick = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		_DataManager.routing.provider = clickEvent.target.provider;
		document.getElementsByClassName ( 'TravelNotes-Control-ActiveProviderImgButton' ) [ 0 ].classList.remove ( 'TravelNotes-Control-ActiveProviderImgButton' );
		clickEvent.target.classList.add ( 'TravelNotes-Control-ActiveProviderImgButton' ); 
		var provider = _DataManager.providers.get ( clickEvent.target.provider );
		if ( provider.transitModes.car ) {
			document.getElementById ( 'TravelNotes-Control-CarImgButton' ).classList.remove ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		else {
			document.getElementById ( 'TravelNotes-Control-CarImgButton' ).classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		if ( provider.transitModes.bike ) {
			document.getElementById ( 'TravelNotes-Control-BikeImgButton' ).classList.remove ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		else {
			document.getElementById ( 'TravelNotes-Control-BikeImgButton' ).classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		if ( provider.transitModes.pedestrian ) {
			document.getElementById ( 'TravelNotes-Control-PedestrianImgButton' ).classList.remove ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		else {
			document.getElementById ( 'TravelNotes-Control-PedestrianImgButton' ).classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
		}
		if ( ! _DataManager.providers.get ( clickEvent.target.provider ).transitModes [ _DataManager.routing.transitMode ] )
		{
			if ( provider.transitModes.bike ) {
				document.getElementById ( 'TravelNotes-Control-BikeImgButton' ).click ( );
			}
			else if ( provider.transitModes.pedestrian )  {
				document.getElementById ( 'TravelNotes-Control-PedestrianImgButton' ).click ( );
			}
			else if ( provider.transitModes.car )  {
				document.getElementById ( 'TravelNotes-Control-CarImgButton' ).click ( );
			}
		}
		_RouteEditor.startRouting ( );
	};

	var getItineraryEditorUI = function ( ) {

		var _CreateUI = function ( controlDiv ) {
			
			if ( document.getElementById ( 'TravelNotes-Control-ItineraryDataDiv' ) ) {
				return;
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;

			var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-ItineraryHeaderDiv', className : 'TravelNotes-Control-HeaderDiv'}, controlDiv );
			var expandButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc;', id : 'TravelNotes-Control-ItineraryExpandButton', className : 'TravelNotes-Control-ExpandButton'}, headerDiv );
			expandButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 
				'span', 
				{ 
					innerHTML : _Translator.getText ( 'ItineraryEditorUI - Itinerary and notes' ), 
					id : 'TravelNotes-Control-ItineraryHeaderText', 
					className : 'TravelNotes-Control-HeaderText'
				},
				headerDiv 
			);
			var dataDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-ItineraryDataDiv', className : 'TravelNotes-Control-DataDiv'}, controlDiv );
			var buttonsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-ItineraryButtonsDiv', className : 'TravelNotes-Control-ButtonsDiv' }, controlDiv );
			var bikeButton = htmlElementsFactory.create (
				'img',
					{ 
						src : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AoaESkaC0SxrgAABMdJREFUSMfNl1loVGcYhp//n+WcZmbiJE4WjVKVaLWOGxglilFTSmYUF1ILKiIILSjplQiKS65EXG4UvBGrQvVCUAdjoRrEGmtwjQbtWKlpEsTGGDMxkzKTzHr+XiRucbK4ts/lOd/5X853vuU9gj4YN+48Dx58DUBOzrmhnZ0qXykWJBKqKJlkYjyusgAsFtFqMnHPbBa/CcEvaWnir5YWT1vvM3ojUl2cPv1XamqK8fv/MBcWPtwfDhuLlWKYUvSLECAEzTabPHP16uc/uN1fJp6fNShhpRROZ+WSzk7jVDyuTLwDFotIpqXJb4LBkgohRP/Cbvc5/H6krhsnolFVOtAbDoQQoGnCF4nIb91uDL/f8+KefDXQ70e6XOpIJPL+ot2Zg0hElbpc6ojf/7qWBPB6q1FKoevqRCBgrOYDEwgYq3VdnVBK4fVWd2cjL6+SpqYSnM5zi4PBZAUfEafTtCQY9JzJy6tENjWVsH79ZWs4bJziIxMOG6fWr79sbWoq6S4uTTt7MBo1vuMToGnyx2jU+71ITz/rCoWM3w2D3AFKBUj0NIL5nYWl5IndLidJw2CsUgOJwtSp6SQSC7h5czZO50vhIUPMTJrkYMIEO8OHa4Op9FzDYKyUEs9gWqelJUpbm8GcOdcJBmOAARjEYgZFRUOoqZnNyJGDEkZKPOZIRM0bTIricUU8blBePhaQKAXJZBzDUMyYkcnly21cvx7sPRpSEomoeWZgQv9hSUAxYoSD8+efsmdPIxkZVgBMJrDZTKxdO4YLF56Sm/sZT5509jzX76SdYI7FurdMKoqKMti8eQyZmVakFOTkaGzaFGP79gZCoSSaJpk82UFl5VN2727k+PEpxGIGHR0Jdu5s4Natf1KeG4uprD7Lc86cDPbuHc/y5Xd4/DhKa+tXNDZ2cfJkC9euFXLw4EMMA6ZNG8KOHfUcPjyZKVPSWbnyNg0NEXy+aaxadYcbN1KLS6tVtKZK75YtY1ix4i51dZ0sWpTF3bshurqSZGdruN3VLFyYS3HxUEKhJAsXZpGbq1Faeovt28dz716IpUtvs21bfs+neh2rVbSagftAVu+edTotdHUl0XVJdraV+fOvcejQJPLzbSj1lHXr/GiapL09gc83lWg0ycyZDk6ffozNZiIUSpKdbe3p/ze4LzVNVKVIBJcuteHxuOjqSrJvXyNpaSaKi134fM2AoL6+C6/Xxf79X7Bx45/Y7RZ27XpIeXkdoVCcuXMzuXIldZVrmqgSdvvZwnDYuNK7l9PTzVRVzUAIQV1dmLlzh7Jhw32OHm16ZY0r8vPTSCQUXm8WW7fmc/p0C263g5wcK7NmXePZs/gbO9pmk7MGGJkJvN5cRo9O4+efW3j0KNKXaQEMJk50sGzZMOrrwxw79nfKlno+MgexJFR/Lumt458vCQlQVmYvs1hEgj79oHiLNdB3vMUiEmVl9rL/3gh4vdW0t5ec0XXp+1iiui597e0lZ7zeal4YgZecky6XOvKhfZfLJX8KBMQa8BgpXabbjREIiDW6LnxCvL+gEKDrwhcIiDVuN8b/wtCnXJ4FBRfp6PBU1NaO0h0OeUBKmgeTASFASpodDnmgtnaU3tHhqSgouDj4f6dP8dP2L6C7Ld6Z4dDBAAAAAElFTkSuQmCC",
						id : 'TravelNotes-Control-BikeImgButton', 
						className : 'TravelNotes-Control-ImgButton'
					},
				buttonsDiv
			);
			bikeButton.transitMode = 'bike';
			bikeButton.addEventListener ( 'click', onClicktransitModeButton, false );
			
			var pedestrianButton = htmlElementsFactory.create (
				'img',
					{ 
						src : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AoaESo7bADyMwAABNlJREFUSMe1V19oU1cY/52Te5Ob3DR/SfzTNNCufxRXxmarONCnPbi+ykYrFdRSkeJLX5ykZcKcFfG5oIJ2Y2sVFZQ+iPoiUhC128OIiJrUlgQTm9o0t23SJufmnj2k2ura5syx7ynknu/7nd93vr8E6wghBJxzAEAgAEsmc3pToWD1y3L6M8NQfABA6eIUY54xs3kh5Xb3JONx5D/WXdX2Wh9crkPIZAbAOVBRcbpvYaHuO87lDZyTCs7lFaochDAQwucANmmzRa7PzfWECFm2IQTsdrdiZuYqHI5quVg80J7P113WdR+AIsTEBEmagsUSOayq539PpVLM5WpFJnO1POOtW+GMRH4dKRa9jZxTABz/TggIMSDLU+Fg8NDuaBTaxyfoux8ORxsAwG7vrI5Ehl7pur+Rc/IJoCX3c05QKGxsnJgYemW3d1avxPgH42AQzkRi6JWuOz3ljReX7k3KnpQkLb158/6aWGyZOS0F0kF4vX45mRwY0XV3WdCGBhsePvwa3d1BAEZZYF13e5LJgRGv1y87nQdLjCmlMAwDqvrj4Wx2x6XyDAw8eLADe/b4AQCqehu5nJj7bbYnHbncT5cppaCGYYBzIJ+vu7TiydcNnP7+GBKJRQwPJ5HL6YLvTlEo1F3iHDAMo4Rkt5/qK6UMFwK+du0NurvDePt2EQ0NdkE9Dl33wW4/1QcApKoKltevrz01DLVWNGKbmhwYHd1dCrEiR0vLY9y7Ny0UaJRmo5WV339OZ2b6NgGyXzRRVFXC4OCXKwwBd+/uRH//VkHmsn9mpm8TZUzxcU4comzb2zciEFCg6yWQZ8/mcOJEGF1dNaivV8tb4MTBmOKjkpSuLdXe8lJZacb5819g374/QEiphJpMBGfPvlxiTwSAZUjSdC0tdZnyCiYTwfBwMx49SuPOnSkA7P3/7/QZM4SC0zCsPkn0bX0+GU+eTCMUGgNAcO7cGEwmCbOzFITI2Lv3ESYmFsWruar2tmWzu4bEjhtLxY4jn/8G2ayByck8mpsfY36+CPEAfbif6ronSggTLgKAgQsXtmF+nuLIkTC2bHGhpcUj3EwIYdB1b5TK8uIUIXxW9LbBoBXt7VW4ciWOGzeSuHnzNQYHvxJ3MeGzZvPiFHW7Q0mApcTUiujtrYHVChw79hyAjOPHX6JYJLh4cZtQwyCEpVyuUJLG48hbrS+uA6aySvX1Kjo7q9HV9fS9a6PRHG7dSqCtLYBAwFp2OlGUF9fjceRJKbcAWf6N67p3zbciBBgZ2Ym6OjsaGh4gk1luDmYzQT7/LUKhZzhzZnyN0kkgSdNg7AAhBKCUUhACWCyRjvVc1dxcgV273Dh58jkymQ+DsVAwcPToX1AUsm5GmM2RjiXQ0tVcroMAbsvZ7Nk/GdvYuNoF/H4ZGzZYEA7PrcpIUSgoBXI5Y9VskOU3Yafzh+2MtTBN++W/jD7iIklauqpqf834+Eejz7tBLBaDpij3myRJS4sNBeXzXpK0tKLcbxofh+Z0tq0/3tbWwhmLDYww5vv/x9vlDaIV0Sg0jye03WYbPSxJ0xBJtQ8H+mlus412eDwntkej0Fyu1k9dYX7uW1ioX3OFoZQB4HOEsEmr9RNXmLWWtspKWDRt9aVN1z1jsryQcjh6komE2NL2N0SHF0QJfjNNAAAAAElFTkSuQmCC",
						id : 'TravelNotes-Control-PedestrianImgButton', 
						className : 'TravelNotes-Control-ImgButton'
					},
				buttonsDiv
			);
			pedestrianButton.transitMode = 'pedestrian';
			pedestrianButton.addEventListener ( 'click', onClicktransitModeButton, false );
			
			var carButton = htmlElementsFactory.create (
				'img',
					{ 
						src : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AoaESgBmDpJAwAABQBJREFUSMe9V09MFFcY/703szOz7PLP2WVBV6rtdm21HqhG2wiCh8bL2jWhsl71IhqJJ4oHL4RIxKP1HzESLh4MEGPkoAeNYRWtGkPShGRF+aeFld2psd0BZnZmXg+LW4SdrW3EX/Iub775fe/7977vEdigrCyMmZnrAABZbvGoavkGSh0hy3LtNAzuS57nZAAwTVPhOHOEUnXAstL9Ltd0TFFOJ5dyLAXJtSnLMhRFwaNHoDt3nj2v66vDjHHljDkAsIXf2CKKzB4haRBixgVh6vrAwNEj27bB8ng8SCaTH6aYMcDtPh3StM/6DKNIACz8N1Dw/J+6KI7Xp1It/YTkkliEwsJmnD8PIopdvbOzX90wDPf/UAoAFgzDLczOfn1Dkrp6T5wAKSpqtre4tRXk5MkLV3W9ch8+IgRhsqel5XCkrS0bn4xiWZaRTCqQpK5eTfPVYwUgiq/75ucP/uT1ZmJOvd4wFEWBy9UR0nXPiigFAF331LtcHaFkMomysnDG4mgUdNeuq3OZmK4ceD6lP34ccVZVwSIZN5y9qGlfHLJPJAa/X4LbzeUlnp21MDk5Z1csAChE8XmnpjU1Eln+2fPmzXe/WZZYbkcoyxympn6AaaahKCrIkvpgjKGkpACSJCAQuI2JibR9oVEtXlz862ZeVSs2MMaV57NkzRoHBIFi06aHGB5+m/XC4sIIBAoxMrILfr+YVzFjXPncXPkGSikfytxIeapyIQKHDlUAAIJBN3p7t+Lata0IBt0AGBobVy/IsrxcjDlACL+Htyx3zT+nz3GnEqCyUkJ39wSOHYvh7t1vUVvrz37fu3cNotHfUVs7BElywO+XAKj5VIMxdw01TS5onwwWHjzYjp6ebaiokFBdXYJUSl8mNT9voq6uBH6/hO7uLXjy5HtQamsKTJMLUo7j5NwWMxw44Mf27TIKCnjs3u1DNFqDVGq5bDJp4M6dHQiHV6OggMeWLaU4enQt7Hg5jltF88WjqIjPNo13aGj4fJnc/v3r32swAFBcnD9vqGmaSm5XE5w58xINDYMgBKiru4ebN+NIpxlGR1WMjWXW6KgKTbMwOKigunoAhACHDz/CqVNjsOM1TVPhBOHHsGG4KnOfK41z577BunWFcDgscByDzyfh9u04Xr5UMTmZWT6fhFevVAQCBaiqKkVpKYfLl6fzNI3UEE9pKgr4duSOB0EqZQAAVNXAyIiKp0/fgudJ1qWEAJcujYEQAll2LMiaiwaG5ZyEpKK8ZRn9hKSPM8bnul3R1TWJUGgtLlyYwtDQX3njtn69E01NQVy58gqMEZvyTIMxo586ndMxQsy4Hdn4eBr37ycwPj6/YIH9mprScO9eAs+eaXnuBTPudE7HFprELxc1LZCnSVhLh5W804e9LIUgPO/U9aZGAgDDw6CbN1+dM82VbYscl9JjsYgzEIBFy8rC2LgRlihO1BNirphSQkyI4nh9IAArOwh4vV7MzCQ+7egDAIlEAoQAra0H9wnCRM/HVioIEz2trQf3EYLsjP1eFrS3N7Pjx49ERPF138dwe8a9r/va2o5E2tub2QcO9B0hTVv3aQb6d/B4ZKhqS/+tWxGnJL3opFSLE2IsOifJcXYCQgxQqsUl6UXn4GDEqaot/V6v58PfTpmECyORWPpo4/dYlrvGMLggz3OrFh5tf1BqPuO4VNSyjBsuVzymKB3/+mj7G1dPIltjqpC6AAAAAElFTkSuQmCC",
						id : 'TravelNotes-Control-CarImgButton', 
						className : 'TravelNotes-Control-ImgButton'
					},
				buttonsDiv
			);
			carButton.transitMode = 'car';
			carButton.addEventListener ( 'click', onClicktransitModeButton, false );
			
			if ( _DataManager.providers ) {
				var activeButton = false;
				_DataManager.providers.forEach (
					function ( provider ) {
						var providerButton = htmlElementsFactory.create (
							'img',
								{ 
									src : "data:image/png;base64," + provider.icon,
									id : 'TravelNotes-Control-'+ provider.name + 'ImgButton', 
									className : 'TravelNotes-Control-ImgButton',
									title : provider.name
								},
							buttonsDiv
						);
						providerButton.provider = provider.name.toLowerCase ( );
						providerButton.addEventListener ( 'click', onProviderButtonClick, false );
						if ( ! activeButton ) {
							providerButton.classList.add ( 'TravelNotes-Control-ActiveProviderImgButton' );
							_DataManager.routing.provider = providerButton.provider;
							activeButton = true;
							
							if ( provider.transitModes.bike ) {
								bikeButton.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
								_DataManager.routing.transitMode = 'bike';
							} else if ( provider.transitModes.pedestrian ) {
								pedestrianButton.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
								_DataManager.routing.transitMode = 'pedestrian';
							} else if ( provider.transitModes.car ) {
								carButton.classList.add ( 'TravelNotes-Control-ActiveTransitModeImgButton' );
								_DataManager.routing.transitMode = 'car';
							} 
							if ( ! provider.transitModes.car ) {
								carButton.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
							}
							if ( ! provider.transitModes.pedestrian ) {
								pedestrianButton.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
							}
							if ( ! provider.transitModes.bike ) {
								bikeButton.classList.add ( 'TravelNotes-Control-InactiveTransitModeImgButton' );
							}
						}
					}
				);
			}
		};
		
		var _AddEventListeners = function ( element )
		{
			element.addEventListener ( 'click' , onInstructionClick, false );
			//element.addEventListener ( 'contextmenu' , onInstructionContextMenu, false );
			element.addEventListener ( 'mouseenter' , onInstructionMouseEnter, false );
			element.addEventListener ( 'mouseleave' , onInstructionMouseLeave, false );
		};
		
		var _RemoveEventListeners = function ( element )
		{
			element.removeEventListener ( 'click' , onInstructionClick, false );
			//element.removeEventListener ( 'contextmenu' , onInstructionContextMenu, false );
			element.removeEventListener ( 'mouseenter' , onInstructionMouseEnter, false );
			element.removeEventListener ( 'mouseleave' , onInstructionMouseLeave, false );
		};
		
		var _SetItinerary = function ( ) {

			var htmlViewsFactory = require ( '../UI/HTMLViewsFactory' ) ( );
			htmlViewsFactory.classNamePrefix = 'TravelNotes-Control-';
			var dataDiv = document.getElementById ( 'TravelNotes-Control-ItineraryDataDiv' );
			if ( ! dataDiv ) {
				return;
			}
			var routeHeader = document.getElementsByClassName ( 'TravelNotes-Control-RouteHeader' ) [ 0 ];
			if ( routeHeader ) {
				dataDiv.removeChild ( routeHeader );
			}
			dataDiv.appendChild ( htmlViewsFactory.routeHeaderHTML );
			
			var childCounter;
			var childNodes;
			
			var routeManeuversNotesList = document.getElementsByClassName ( 'TravelNotes-Control-RouteManeuversNotesList' ) [ 0 ];
			if ( routeManeuversNotesList ) {
				childNodes = routeManeuversNotesList.childNodes;
				for ( childCounter = 0; childCounter < childNodes.length; childCounter ++ ) {
					_RemoveEventListeners ( childNodes [ childCounter ] );
				}
				dataDiv.removeChild ( routeManeuversNotesList );
			}
			
			dataDiv.appendChild ( htmlViewsFactory.routeManeuversAndNotesHTML );
			routeManeuversNotesList = document.getElementsByClassName ( 'TravelNotes-Control-RouteManeuversNotesList' ) [ 0 ];
			if ( routeManeuversNotesList ) {
				childNodes = routeManeuversNotesList.childNodes;
				for ( childCounter = 0; childCounter < childNodes.length; childCounter ++ ) {
					_AddEventListeners ( childNodes [ childCounter ] );
				}
			}
		};

		return {
			createUI : function ( controlDiv ) { 
				_CreateUI ( controlDiv ); 
			},
			setItinerary : function ( ) { _SetItinerary ( ); },
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getItineraryEditorUI;
	}

}());
	
},{"../UI/HTMLViewsFactory":21,"../core/MapEditor":32,"../core/NoteEditor":33,"../core/RouteEditor":34,"../data/DataManager":38,"../util/Utilities":50,"./HTMLElementsFactory":20,"./Translator":27}],23:[function(require,module,exports){
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
To do: translations
*/

( function ( ){
	
	'use strict';

	var _Translator = require ( '../UI/Translator' ) ( );
	
	var _LocalEditorData = { buttons : [], list : [] };
	var _Note;
	var _RouteObjId;
	
	var onOkButtonClick = function ( ) {
		if ( 0 === document.getElementById ( 'TravelNotes-NoteDialog-TextArea-IconHtmlContent' ).value.length ) {
			document.getElementById ( 'TravelNotes-BaseDialog-ErrorDiv' ).innerHTML = _Translator.getText ( 'Notedialog - empty icon content' );
			document.getElementById ( 'TravelNotes-BaseDialog-ErrorDiv' ).classList.remove ( 'TravelNotes-BaseDialog-ErrorDivHidden' );
			return false;
		}
		_Note.iconWidth = document.getElementById ( 'TravelNotes-NoteDialog-WidthNumberInput' ).value;
		_Note.iconHeight = document.getElementById ( 'TravelNotes-NoteDialog-HeightNumberInput' ).value;
		_Note.iconContent = document.getElementById ( 'TravelNotes-NoteDialog-TextArea-IconHtmlContent' ).value;
		_Note.popupContent = document.getElementById ( 'TravelNotes-NoteDialog-TextArea-PopupContent' ).value;
		_Note.tooltipContent = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value;
		_Note.address = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Adress' ).value;
		_Note.url = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Link' ).value;
		_Note.phone = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Phone' ).value;
		require ( '../core/NoteEditor') ( ).endNoteDialog ( _Note, _RouteObjId );
		return true;
	};

	var getNoteDialog = function ( note, routeObjId ) {

		_Note = note;
		_RouteObjId = routeObjId;
		
		var serverEditorList = [];
		var globalEditorList = [];
		
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;

		// the dialog base is created
		var baseDialog = require ( '../UI/BaseDialog' ) ( );
		baseDialog.title = _Translator.getText ( 'NoteDialog - Title' );
		baseDialog.addClickOkButtonEventListener ( onOkButtonClick );

		var NoteDataDiv = htmlElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-NoteDialog-MainDataDiv'
			},
			baseDialog.content
		);
		
		// Toolbar
		var toolbarDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-ToolbarDiv',
				id : 'TravelNotes-NoteDialog-ToolbarDiv'
			},
			NoteDataDiv
		);
		
		var editorSelect = htmlElementsFactory.create (
			'select',
			{
				className : 'TravelNotes-NoteDialog-Select',
				id : 'TravelNotes-NoteDialog-IconSelect'
			},
			toolbarDiv
		);
		editorSelect.addEventListener ( 
			'change', 
			function ( changeEvent ) {
				var index = editorSelect.selectedIndex ;
				widthInput.value = globalEditorList [ index ].width ;
				heightInput.value = globalEditorList [ index ].height ;
				iconHtmlContent.value = globalEditorList [ index ].icon ;
				tooltip.value = globalEditorList [ index ].tooltip ;
			},
			false 
		);
		
		
		var addEditorList = function ( ) {
			globalEditorList = serverEditorList.concat ( _LocalEditorData.list );
			console.log ( globalEditorList );
			globalEditorList.sort ( function ( a, b ) { return a.name.localeCompare ( b.name );} );
			var elementCounter = 0;
			for ( elementCounter = editorSelect.length - 1; elementCounter>= 0; elementCounter -- ) {
				editorSelect.remove ( counter );
			}
			for ( elementCounter = 0; elementCounter < globalEditorList.length; elementCounter ++ ) {
				var option = htmlElementsFactory.create ( 'option', { text :  globalEditorList [ elementCounter ].name } );
				editorSelect.add ( option );
			}
		};

		// function to add buttons on the toolbar from a object
		var addEditorButtons = function ( buttons ) {
			buttons.forEach ( 
				function ( button ) {
					var newButton = htmlElementsFactory.create ( 
						'button',
						{
							type : 'button',
							innerHTML : button.title || '?',
							htmlBefore : button.htmlBefore || '',
							htmlAfter : button.htmlAfter || '',
							className : 'TravelNotes-NoteDialog-EditorButton'
						},
						toolbarDiv
					);
					newButton.addEventListener ( 'click', onInsertStyle, false );
				}
			);
		};

		// open style button ... with the well know hack to hide the file input ( a div + an input + a fake div + a button )
		var openEditorFileDiv = htmlElementsFactory.create ( 
			'div', 
			{ 
				id: 'TravelNotes-NoteDialog-OpenEditorFileDiv'
			}, 
			toolbarDiv 
		);
		var openEditorFileInput = htmlElementsFactory.create ( 
			'input',
			{
				id : 'TravelNotes-NoteDialog-OpenEditorFileInput', 
				type : 'file',
				accept : '.json'
			},
			openEditorFileDiv
		);
		openEditorFileInput.addEventListener ( 
			'change', 
			function ( event ) {
				var fileReader = new FileReader( );
				fileReader.onload = function ( event ) {
					var newEditorData = JSON.parse ( fileReader.result ) ;
					_LocalEditorData.buttons = _LocalEditorData.buttons.concat ( newEditorData.buttons );
					_LocalEditorData.list = _LocalEditorData.list.concat ( newEditorData.list );
					addEditorButtons ( newEditorData.buttons );
					addEditorList ( );
				};
				var fileName = event.target.files [ 0 ].name;
				fileReader.readAsText ( event.target.files [ 0 ] );
			},
			false
		);
		var openEditorFileFakeDiv = htmlElementsFactory.create ( 
			'div', 
			{ 
				id: 'TravelNotes-NoteDialog-OpenStyleFakeDiv'
			}, 
			openEditorFileDiv 
		);
		var openEditorFileButton = htmlElementsFactory.create ( 
			'button', 
			{ 
				id : 'TravelNotes-NoteDialog-OpenEditorFileButton', 
				className: 'TravelNotes-NoteDialog-EditorButton', 
				title : _Translator.getText ( 'TravelEditorUI - Open travel' ), 
				innerHTML : '&#x23CD;'
			}, 
			openEditorFileFakeDiv 
		);
		
		openEditorFileButton.addEventListener ( 'click' , function ( ) { openEditorFileInput.click ( ); }, false );
	
		// event handler for edition with the styles buttons
		var focusControl = null;
		var onInsertStyle = function ( event ) {
			if ( ! focusControl ) {
				return;
			}
			var bInsertBeforeAndAfter = event.target.htmlAfter && 0 < event.target.htmlAfter.length;
			var selectionStart = focusControl.selectionStart;
			var selectionEnd = focusControl.selectionEnd;
			var oldText = focusControl.value;
			focusControl.value = oldText.substring ( 0, selectionStart ) + 
				( bInsertBeforeAndAfter ? event.target.htmlBefore + oldText.substring ( selectionStart, selectionEnd ) + event.target.htmlAfter : event.target.htmlBefore ) + 
				oldText.substring ( selectionEnd );
			focusControl.setSelectionRange ( 
				bInsertBeforeAndAfter || selectionStart === selectionEnd ? selectionStart + event.target.htmlBefore.length : selectionStart,
				( bInsertBeforeAndAfter ? selectionEnd : selectionStart ) + event.target.htmlBefore.length );
			focusControl.focus ( );
		};	
		
		// standard buttons for div, p, span and a
		addEditorButtons (
			[
				{
					title : 'div',
					htmlBefore : '<div>',
					htmlAfter :  '</div>'
				},
				{
					title : 'p',
					htmlBefore : '<p>',
					htmlAfter : '</p>'
				},
				{
					title : 'span',
					htmlBefore : '<span>',
					htmlAfter : '</span>'
				},
				{
					title : 'a',
					htmlBefore : '<a target="_blank" href="">',
					htmlAfter : '</a>'
				},
			]
		);
		
		// personnalised buttons from local file are restored
		addEditorButtons ( _LocalEditorData.buttons );

		// icon dimensions...
		var iconDimensionsDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv',
				id : 'TravelNotes-NoteDialog-DimensionsDataDiv'
			},
			NoteDataDiv
		);
		
		// ... width ...
		htmlElementsFactory.create (
			'text',
			{
				data : _Translator.getText ( 'NoteDialog - Icon width'),
			},
			iconDimensionsDiv
		);
		var widthInput =  htmlElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-NoteDialog-NumberInput',
				id : 'TravelNotes-NoteDialog-WidthNumberInput'
				
			},
			iconDimensionsDiv
		);
		widthInput.value = note.iconWidth;
		
		// ... and height
		htmlElementsFactory.create (
			'text',
			{
				data : _Translator.getText ( 'NoteDialog - Icon height'),
			},
			iconDimensionsDiv
		);
		var heightInput =  htmlElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-NoteDialog-NumberInput',
				id : 'TravelNotes-NoteDialog-HeightNumberInput'
			},
			iconDimensionsDiv
		);
		heightInput.value = note.iconHeight;
		
		// icon content
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				id : 'TravelNotes-NoteDialog-IconContentTitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - IconHtmlContentTitle' )
			},
			NoteDataDiv
		);
		var iconHtmlContent = htmlElementsFactory.create ( 
			'textarea',
			{ 
				className : 'TravelNotes-NoteDialog-TextArea',
				id: 'TravelNotes-NoteDialog-TextArea-IconHtmlContent'
			},
			NoteDataDiv
		);
		iconHtmlContent.addEventListener (
			'focus',
			function ( event ) {
				focusControl = iconHtmlContent;
			},
			false
		);
		iconHtmlContent.value = note.iconContent;
		// Popup content
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - PopupContentTitle' )
			},
			NoteDataDiv
		);
		var popUpContent = htmlElementsFactory.create ( 
			'textarea',
			{ 
				className : 'TravelNotes-NoteDialog-TextArea',
				id: 'TravelNotes-NoteDialog-TextArea-PopupContent'
			},
			NoteDataDiv
		);
		popUpContent.addEventListener (
			'focus',
			function ( event ) {
				focusControl = popUpContent;
			},
			false
		);
		popUpContent.value = note.popupContent;
		
		// tooltip content
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - TooltipTitle' )
			},
			NoteDataDiv
		);
		var tooltip = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Tooltip'
			},
			NoteDataDiv
		);
		tooltip.addEventListener (
			'focus',
			function ( event ) {
				focusControl = tooltip;
			},
			false
		);
		tooltip.value = note.tooltipContent;
		
		// Address
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - AdressTitle' )
			},
			NoteDataDiv
		);
		var address = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Adress'
			},
			NoteDataDiv
		);
		address.addEventListener (
			'focus',
			function ( event ) {
				focusControl = address;
			},
			false
		);
		address.value = note.address;
		
		// link
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - LinkTitle' )
			},
			NoteDataDiv
		);
		var link = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Link'
			},
			NoteDataDiv
		);
		link.addEventListener (
			'focus',
			function ( event ) {
				focusControl = null;
			},
			false
		);
		link.value = note.url;
		
		// phone
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - PhoneTitle' )
			},
			NoteDataDiv
		);
		var phone = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Phone'
			},
			NoteDataDiv
		);
		phone.addEventListener (
			'focus',
			function ( event ) {
				focusControl = phone;
			},
			false
		);
		phone.value = note.phone;
		
		var xmlHttpRequest = new XMLHttpRequest ( );
		xmlHttpRequest.onreadystatechange = function ( event ) {
			if ( this.readyState === XMLHttpRequest.DONE ) {
				if ( this.status === 200 ) {
					var serverEditorData;
					try {
						serverEditorData = JSON.parse ( this.responseText );
					}
					catch ( e )
					{
						console.log ( 'Error reading userNoteDialog.json' );
					}
					addEditorButtons ( serverEditorData.buttons );
					serverEditorList = serverEditorData.list;
					serverEditorList.push ( { name : '', icon : '', tooltip : '', width : 40, height : 40 } );
					addEditorList ( );
				} 
				else {
					console.log ( 'Error sending request for userNoteDialog.json' );
				}
			}
		};
		xmlHttpRequest.open ( 
			'GET',
			window.location.href.substr (0, window.location.href.lastIndexOf( '/') + 1 ) +'userNoteDialog.json',
			true
		);
		xmlHttpRequest.send ( null );

		// and the dialog is centered on the screen
		baseDialog.center ( );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getNoteDialog;
	}

}());

},{"../UI/BaseDialog":16,"../UI/Translator":27,"../core/NoteEditor":33,"./HTMLElementsFactory":20}],24:[function(require,module,exports){
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
	var _DataManager = require ( '../data/DataManager' ) ( );

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
	
	var onGpxButton = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/RouteEditor' ) ( ).saveGpx ( );
	};
	
	var onCancelRouteButton = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/RouteEditor' ) ( ).cancelEdition ( );
	};
	
	var onClickExpandButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		document.getElementById ( 'TravelNotes-Control-RouteHeaderDiv' ).classList.toggle ( 'TravelNotes-Control-SmallHeader' );
		document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-Control-RouteButtonsDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.contains ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25bc;';
		document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).title = hiddenList ? _Translator.getText ( 'RouteEditorUI - Show' ) : _Translator.getText ( 'RouteEditorUI - Hide' );
	};
	
	var onClickExpandListButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		
		document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.toggle ( 'TravelNotes-Control-ExpandedList' );
		var expandedList = document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.contains ( 'TravelNotes-Control-ExpandedList' );
		document.getElementById ( 'TravelNotes-Control-ExpandWayPointsListButton' ).innerHTML = expandedList ? '&#x25b3;' : '&#x25bd;';
		document.getElementById ( 'TravelNotes-Control-ExpandWayPointsListButton' ).title = expandedList ? _Translator.getText ( 'RouteEditorUI - Reduce the list' ) : _Translator.getText ( 'RouteEditorUI - Expand the list' );		
	};

	// User interface
	
	var _WayPointsList = null;

	var getRouteEditorUI = function ( ) {
				
		var _CreateUI = function ( controlDiv ){ 

			if ( document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ) ) {
				return;
			}
			
			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-RouteHeaderDiv', className : 'TravelNotes-Control-HeaderDiv'}, controlDiv );

			var expandButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc;', id : 'TravelNotes-Control-RouteExpandButton', className : 'TravelNotes-Control-ExpandButton'}, headerDiv );
			expandButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : _Translator.getText ( 'RouteEditorUI - Waypoints' ), id : 'TravelNotes-Control-RouteHeaderText',className : 'TravelNotes-Control-HeaderText'}, headerDiv );

			var dataDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-RouteDataDiv', className : 'TravelNotes-Control-DataDiv'}, controlDiv );
			_WayPointsList = require ( './SortableList' ) ( 
				{
					minSize : 0,
					listStyle : 'LimitedSort',
					placeholders : [ _Translator.getText ( 'RouteEditorUI - Start' ), _Translator.getText ( 'RouteEditorUI - Via' ), _Translator.getText ( 'RouteEditorUI - End' ) ],
					indexNames : [ 'A', 'index', 'B' ],
					id : 'TravelNotes-Control-RouteWaypointsList'
				}, 
				dataDiv
			);
			_WayPointsList.container.addEventListener ( 'SortableListDelete', onWayPointsListDelete, false );
			_WayPointsList.container.addEventListener ( 'SortableListUpArrow', onWayPointsListUpArrow, false );
			_WayPointsList.container.addEventListener ( 'SortableListDownArrow', onWayPointsListDownArrow, false );
			_WayPointsList.container.addEventListener ( 'SortableListChange', onWayPointslistChange, false );

			var buttonsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-RouteButtonsDiv', className : 'TravelNotes-Control-ButtonsDiv'}, controlDiv );
			
			var expandListButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-ExpandWayPointsListButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Expand the list' ), 
					innerHTML : '&#x25bd;'
				}, 
				buttonsDiv 
			);
			expandListButton.addEventListener ( 'click' , onClickExpandListButton, false );

			var cancelRouteButton = htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelNotes-Control-CancelRouteButton',
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Cancel' ), 
					innerHTML : '&#x274c'
				},
				buttonsDiv 
			);
			cancelRouteButton.addEventListener ( 'click', onCancelRouteButton, false );
			var saveRouteButton = htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelNotes-Control-SaveRouteButton',
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Save' ), 
					innerHTML : '&#x1f4be;'
				},
				buttonsDiv 
			);
			saveRouteButton.addEventListener ( 'click', onSaveRouteButton, false );
			var gpxButton = htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelNotes-Control-gpxButton',
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'RouteEditorUI - gpx' ), 
					innerHTML : 'gpx'
				},
				buttonsDiv 
			);
			gpxButton.addEventListener ( 'click', onGpxButton, false );
			var reverseWayPointsButton = htmlElementsFactory.create ( 
				'div',
				{ 
					id : 'TravelNotes-Control-ReverseWayPointsButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Invert waypoints' ),  
					innerHTML : '&#x21C5;'
				},
				buttonsDiv
			);
			reverseWayPointsButton.addEventListener ( 'click' , onReverseWayPointsButton, false );
			var addWayPointButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-AddWayPointButton',
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Add waypoint' ), 
					innerHTML : '+'
				},
				buttonsDiv 
			);
			addWayPointButton.addEventListener ( 'click', onAddWayPointButton, false );
			var removeAllWayPointsButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-RemoveAllWayPointsButton', 
					className: 'TravelNotes-Control-Button',
					title: _Translator.getText ( 'RouteEditorUI - Delete all waypoints' ),
					innerHTML : '&#x267b;'
				}, 
				buttonsDiv
			);
			removeAllWayPointsButton.addEventListener ( 'click' , onRemoveAllWayPointsButton, false );
		};
	
		var _ExpandUI = function ( ) {
			document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).innerHTML = '&#x25bc;';
			document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).title = 'Masquer';
			document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.remove ( 'TravelNotes-Control-HiddenList' );
			document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.remove ( 'TravelNotes-Control-HiddenList' );
		};
		
		var _ReduceUI = function ( ) {
			document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).innerHTML = '&#x25b6;';
			document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).title = 'Afficher';
			document.getElementById ( 'TravelNotes-Control-RouteButtonsDiv' ).classList.add ( 'TravelNotes-Control-HiddenList' );
			document.getElementById ( 'TravelNotes-Control-RouteButtonsDiv' ).classList.add ( 'TravelNotes-Control-HiddenList' );
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

			setWayPointsList : function ( ) {
				_WayPointsList.removeAllItems ( );

				if ( -1 === _DataManager.editedRoute.routeInitialObjId ) {
					return;
				}
				
				var wayPointsIterator = _DataManager.editedRoute.wayPoints.iterator;
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

},{"../core/RouteEditor":34,"../data/DataManager":38,"./HTMLElementsFactory":20,"./SortableList":26,"./Translator":27}],25:[function(require,module,exports){
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
To do: translations
*/

( function ( ){
	
	'use strict';

	var _Translator = require ( '../UI/Translator' ) ( );

	var getRoutePropertiesDialog = function ( route ) {
		
		var onOkButtonClick = function ( ) {
			route.color = colorDialog.getNewColor ( );
			route.width = parseInt ( widthInput.value );
			route.chain = chainInput.checked;
			require ( '../core/MapEditor' ) ( ).editRoute ( route );
			return true;
		};
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;

		// the dialog base is created
		var colorDialog = require ( '../UI/ColorDialog' ) ( route.color );
		colorDialog.title = _Translator.getText ( 'RoutePropertiesDialog - Title' );
		colorDialog.addClickOkButtonEventListener ( onOkButtonClick );
		
		var routePropertiesDiv = htmlElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-RoutePropertiesDialog-MainDataDiv'
			},
			colorDialog.content
		);
		// ... width ...
		var widthDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-WithDiv'
			},
			routePropertiesDiv
		);
		htmlElementsFactory.create (
			'text',
			{
				data : _Translator.getText ( 'RoutePropertiesDialog - Width'),
			},
			widthDiv
		);
		var widthInput =  htmlElementsFactory.create (
			'input',
			{
				type : 'number',
				id : 'TravelNotes-RoutePropertiesDialog-WidthInput'
				
			},
			widthDiv
		);
		widthInput.value = route.width;
		widthInput.min = 1;
		widthInput.max = 40;

		// chain
		var chainDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-ChainDiv'
			},
			routePropertiesDiv
		);
		var chainInput =  htmlElementsFactory.create (
			'input',
			{
				type : 'checkbox',
				id : 'TravelNotes-RoutePropertiesDialog-ChainInput'			
			},
			chainDiv
		);
		chainInput.checked = route.chain;
		htmlElementsFactory.create ( 
			'label',
			{
				for : 'TravelNotes-RoutePropertiesDialog-ChainInput',
				innerHTML : _Translator.getText ( 'RoutePropertiesDialog - Chain')
			},
			chainDiv
		);
		
		return colorDialog;
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRoutePropertiesDialog;
	}

}());

		
},{"../UI/ColorDialog":17,"../UI/Translator":27,"../core/MapEditor":32,"./HTMLElementsFactory":20}],26:[function(require,module,exports){
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
			
			var item = htmlElementsFactory.create ( 'div', { draggable : false , className : 'TravelNotes-SortableList-Item' } );

			htmlElementsFactory.create ( 'div', { className : 'TravelNotes-SortableList-ItemTextIndex' , innerHTML : indexName }, item );
			var inputElement = htmlElementsFactory.create ( 'input', { type : 'text', className : 'TravelNotes-SortableList-ItemInput', placeholder : placeholder, value: name}, item );
			inputElement.addEventListener ( 'change' , onChange, false );
			var upArrowButton = htmlElementsFactory.create ( 'div', { className : 'TravelNotes-SortableList-ItemUpArrowButton', title : 'Déplacer vers le haut', innerHTML : String.fromCharCode( 8679 ) }, item );
			upArrowButton.addEventListener ( 'click', onUpArrowButtonClick, false );
			var downArrowButton = htmlElementsFactory.create ( 'div', { className : 'TravelNotes-SortableList-ItemDownArrowButton', title : 'Déplacer vers le bas', innerHTML : String.fromCharCode( 8681 ) }, item );
			downArrowButton.addEventListener ( 'click', onDownArrowButtonClick, false );
			var rightArrowButton = htmlElementsFactory.create ( 'div', { className : 'TravelNotes-SortableList-ItemRightArrowButton', title : 'Éditer', innerHTML : String.fromCharCode( 8688 ) }, item );
			if ( 'AllSort' === this.options.listStyle ) {
				rightArrowButton.addEventListener ( 'click', onRightArrowButtonClick, false );
			}
			var deleteButton = htmlElementsFactory.create ( 'div', { className : 'TravelNotes-SortableList-ItemDeleteButton', title : 'Supprimer', innerHTML : '&#x267b;' }, item );
			deleteButton.addEventListener ( 'click', onDeleteButtonClick, false );
			item.dataObjId = dataObjId; 

			this.items.push ( item );

			if ( ( ( 'LimitedSort' !== this.options.listStyle ) || ( 1 < this.items.length ) ) && ( ! isLastItem  ) ){
				item.draggable = true;
				item.addEventListener ( 'dragstart', onDragStart, false );	
				item.classList.add ( 'TravelNotes-SortableList-MoveCursor' );
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
			
			this.options = { minSize : 2, listStyle : 'AllSort', placeholders : [] , indexNames : [], id : 'TravelNotes-SortableList-Container' } ;
			for ( var option in options ) {
				this.options [ option ] = options [ option ];
			}
			if ( ( 'LimitedSort' === this.options.listStyle ) && ( 2 > this.options.minSize ) )
			{
				this.options.minSize = 0;
			}
			this.container = htmlElementsFactory.create ( 'div', { id : options.id, className : 'TravelNotes-SortableList-Container' } );
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

},{"./HTMLElementsFactory":20}],27:[function(require,module,exports){
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
			msgid : "AboutDialog - Title",
			msgstr : "À propos de Travel & Notes"
		},
		{
			msgid : "ColorDialog - Title",
			msgstr : "Couleurs"
		},
		{
			msgid : "ColorDialog - red",
			msgstr : "Rouge"
		},
		{
			msgid : "ColorDialog - green",
			msgstr : "Vert"
		},
		{
			msgid : "ColorDialog - blue",
			msgstr : "Bleu"
		},
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
			msgid : "HTMLViewsFactory - ToNextInstruction",
			msgstr : "Jusqu'à la prochaine instruction&nbsp;:&nbsp;{distance}&nbsp;-&nbsp;{duration}"
		},
		{
			msgid : "HTMLViewsFactory - TransitMode bike",
			msgstr : "un vélo"
		},
		{
			msgid : "HTMLViewsFactory - TransitMode car",
			msgstr : "une voiture"
		},
		{
			msgid : "HTMLViewsFactory - TransitMode pedestrian",
			msgstr : "un piéton"
		},
		{
			msgid : "HTMLViewsFactory - Route footer",
			msgstr : "Cet itinéraire à été calculé par {provider} et optimisé pour {transitMode}"
		},
		{
			msgid : "HTMLViewsFactory - Travel footer",
			msgstr : "Réalisé avec <a href='https://github.com/wwwouaiebe/leaflet.TravelNotes' target='_blank'>Travel & Notes</a> <a href='http://www.ouaie.be/' target='_Blank'>© Christian Guyette 2017</a>"
		},
		{
			msgid : "ItineraryEditorUI - Itinerary and notes",
			msgstr : "Itinéraire et notes"
		},
		{
			msgid : "ItineraryEditorUI - Show",
			msgstr : "Afficher"
		},
		{
			msgid : "ItineraryEditorUI - Hide",
			msgstr : "Masquer"
		},
		{
			msgid : "NoteDialog - Title",
			msgstr : "Note"
		},
		{
			msgid : "NoteDialog - IconHtmlContentTitle",
			msgstr : "Contenu de l'icône&nbsp;:"
		},
		{
			msgid : "NoteDialog - PopupContentTitle",
			msgstr : "Contenu du popup&nbsp;:"
		},
		{
			msgid : "NoteDialog - AdressTitle",
			msgstr : "Adresse&nbsp;:"
		},
		{
			msgid : "NoteDialog - LinkTitle",
			msgstr : "Lien&nbsp;:"
		},
		{
			msgid : "NoteDialog - PhoneTitle",
			msgstr : "Téléphone&nbsp:"
		},
		{
			msgid : "NoteDialog - TooltipTitle",
			msgstr : "Contenu du tooltip&nbsp;:"
		},
		{
			msgid : "NoteDialog - Standard icon",
			msgstr : "Icône standard"
		},
		{
			msgid : "NoteDialog - Personnel icon",
			msgstr : "Icône personnalisée"
		},
		{
			msgid : "NoteDialog - Choose an icon",
			msgstr : "Icône : "
		},
		{
			msgid : "NoteDialog - Icon width",
			msgstr : "Largeur : "
		},
		{
			msgid : "NoteDialog - Icon height",
			msgstr : "Hauteur : "
		},
		{
			msgid : "NoteEditor - new travel note",
			msgstr : "Ajouter une note"
		},
		{
			msgid : "NoteEditor - edit note",
			msgstr : "Éditer cette note"
		},
		{
			msgid : "NoteEditor - delete note",
			msgstr : "Effacer cette note"
		},
		{
			msgid : "NoteEditor - zoom to travel",
			msgstr : "Zoom sur le voyage"
		},
		{
			msgid : "NoteEditor - About",
			msgstr : "À propos de Travel & Notes"
		},
		{
			msgid : "NoteEditor - address",
			msgstr : "<span>Adresse</span>&nbsp;:&nbsp;"
		},
		{
			msgid : "NoteEditor - phone",
			msgstr : "<span>Téléphone</span>&nbsp;:&nbsp;"
		},
		{
			msgid : "NoteEditor - url",
			msgstr : "<span>Url</span>&nbsp;:&nbsp;"
		},
		{
			msgid : "NoteEditor - latlng",
			msgstr : "<span>Latitude</span>&nbsp;:&nbsp;{lat}&nbsp;-&nbsp;<span>Longitude</span>&nbsp;:&nbsp;{lng}"
		},
		{
			msgid : "NoteEditor - distance",
			msgstr : "<span>Distance</span>&nbsp;:&nbsp;{distance}"
		},
		{
			msgid : "Notedialog - empty icon content",
			msgstr : "Le contenu de l'icône doit être complété."
		},
		{
			msgid : "RouteEditor - Distance",
			msgstr : "<span>Distance</span>&nbsp;:&nbsp;{distance}"
		},
		{
			msgid : "RouteEditor - Duration",
			msgstr : "<span>Temps</span>&nbsp;:&nbsp;{duration}"
		},
		{
			msgid : "RouteEditor-Not possible to edit a route without a save or cancel",
			msgstr : "Il n'est pas possible d'éditer une route sans sauver ou abandonner les modifications"
		},
		{
			msgid : "RouteEditor - Add a note on the route",
			msgstr : "Ajouter une note à ce trajet"
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
			msgid : "RouteEditor - Edit this route",
			msgstr : "Éditer cette route"
		},
		{
			msgid : "RouteEditor - Delete this route",
			msgstr : "Supprimer cette route"
		},
		{
			msgid : "RouteEditor - Properties",
			msgstr : "Propriétés"
		},
		{
			msgid : "RouteEditor - Zoom to route",
			msgstr : "Zoom sur le trajet"
		},
		{
			msgid : "RouteEditor - Save modifications on this route",
			msgstr : "Sauver les modifications"
		},
		{
			msgid : "RouteEditor - Cancel modifications on this route",
			msgstr : "Abandonner les modifications"
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
			msgstr : "Points de passage&nbsp;de la route:"
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
			msgid : "RouteEditorUI - Reduce the list",
			msgstr : "Réduire"
		},
		{
			msgid : "RouteEditorUI - Expand the list",
			msgstr : "Étendre"
		},
		{
			msgid : "RoutePropertiesDialog - Title",
			msgstr : "Propriétés du trajet"
		},
		{
			msgid : "RoutePropertiesDialog - Width",
			msgstr : "Largeur : "
		},
		{
			msgid : "RoutePropertiesDialog - Chain",
			msgstr : "Trajet&nbsp;chaîné"
		},
		{
			msgid : "TravelEditorUI - Show",
			msgstr : "Afficher"
		},
		{
			msgid : "TravelEditorUI - Hide",
			msgstr : "Masquer"
		},
		{
			msgid : "TravelEditorUI - Routes",
			msgstr : "Routes du voyage&nbsp;:"
		},
		{
			msgid : "TravelEditorUI - Route",
			msgstr : "Route"
		},
		{
			msgid : "TravelEditorUI - Reduce the list",
			msgstr : "Réduire"
		},
		{
			msgid : "TravelEditorUI - Expand the list",
			msgstr : "Étendre"
		},
		{
			msgid : "TravelEditorUI - New route",
			msgstr : "Nouvelle route"
		},
		{
			msgid : "TravelEditorUI - Delete all routes",
			msgstr : "Supprimer toutes les routes"
		},
		{
			msgid : "TravelEditorUI - Save travel",
			msgstr : "Sauver dans un fichier"
		},
		{
			msgid : "TravelEditorUI - Open travel",
			msgstr : "Ouvrir un fichier"
		},
		{
			msgid : "TravelEditorUI - Open travel roadbook",
			msgstr : "Ouvrir le livre de voyage"
		},
		{
			msgid : "TravelEditorUI - Undo",
			msgstr : "Réouvrir une route supprimée"
		},
		{
			msgid : "TravelEditor - cannot remove an edited route",
			msgstr : "Il n'est pas possible de supprimer une route quand celle-ci est en cours d'édition"
		},
		{
			msgid : "TravelEditor - Not possible to save a travel without a save or cancel",
			msgstr : "Des données non sauvées sont présentes dans l'éditeur de route. Sauvez ou abandonnez celles-ci avant de sauver le voyage dans un fichier"
		},
		{
			msgid : "TravelEditorUI - Cancel travel",
			msgstr : "Abandonner ce voyage"
		},
		{
			msgid : "Utilities - day",
			msgstr : "jours"
		},
		{
			msgid : "Utilities - hour",
			msgstr : "h"
		},
		{
			msgid : "Utilities - minute",
			msgstr : "min"
		},
		{
			msgid : "Utilities - second",
			msgstr : "sec"
		},
		{
			msgid : "TravelEditorUI - ",
			msgstr : "xxx"
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
			getText : function ( textId , params ) { 
				var translation = _Translations.get ( textId );
				if ( params && translation ) {
					Object.getOwnPropertyNames ( params ).forEach (
						function ( propertyName ) {
							translation = translation.replace ( '{' + propertyName + '}' , params [ propertyName ] ); 
						}
					);
				}
				
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

},{}],28:[function(require,module,exports){
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
	var _DataManager = require ( '../data/DataManager' ) ( );
	
	// Events listeners for buttons under the routes list
	var onCancelTravelButton = function ( clickEvent ) {
		clickEvent.stopPropagation();
		require ( '../core/TravelEditor' ) ( ).clear ( );
	};

	var onClickAddRouteButton = function ( event ) {
		event.stopPropagation();
		require ( '../core/TravelEditor' ) ( ).addRoute ( );
	};
	
	// Events for buttons and input on the routes list items
	var onRoutesListDelete = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).removeRoute ( event.itemNode.dataObjId );
	};

	var onRoutesListUpArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).swapRoute ( event.itemNode.dataObjId, true );
	};

	var onRoutesListDownArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).swapRoute ( event.itemNode.dataObjId, false );
	};

	var onRoutesListRightArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).editRoute ( event.itemNode.dataObjId );
	};
	
	var onRouteslistChange = function ( event ) {
		event.stopPropagation();
		require ( '../core/TravelEditor' ) ( ).renameRoute ( event.dataObjId, event.changeValue );
	};
	
	var onClickSaveTravelButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).saveTravel ( );
	};	
	
	var onClickOpenTravelButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).openTravel ( clickEvent );
	};	
		
	var onClickUndoButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
	};	
		
	var onClickExpandButton = function ( clickEvent ) {

		clickEvent.stopPropagation ( );
		
		document.getElementById ( 'TravelNotes-Control-TravelHeaderDiv' ).classList.toggle ( 'TravelNotes-Control-SmallHeader' );
		document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-ControlTravelButtonsDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ).classList.contains ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-ControlTravelExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25bc;';
		document.getElementById ( 'TravelNotes-ControlTravelExpandButton' ).title = hiddenList ? _Translator.getText ( 'TravelEditorUI - Show' ) : _Translator.getText ( 'TravelEditorUI - Hide' );

		clickEvent.stopPropagation ( );
	};
	
	var onClickExpandListButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		
		document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ).classList.toggle ( 'TravelNotes-Control-ExpandedList' );
		var expandedList = document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ).classList.contains ( 'TravelNotes-Control-ExpandedList' );
		document.getElementById ( 'TravelNotes-Control-ExpandRoutesListButton' ).innerHTML = expandedList ? '&#x25b3;' : '&#x25bd;';
		document.getElementById ( 'TravelNotes-Control-ExpandRoutesListButton' ).title = expandedList ? _Translator.getText ( 'TravelEditorUI - Reduce the list' ) : _Translator.getText ( 'TravelEditorUI - Expand the list' );		
	};

	// User interface

	var _RoutesList = null;

	var getTravelEditorUI = function ( ) {
				
		var _CreateUI = function ( controlDiv ){ 
		
			if ( document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ) ) {
				return;
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			// Routes
			
			var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-TravelHeaderDiv', className : 'TravelNotes-Control-HeaderDiv'}, controlDiv );

			var expandButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc;', id : 'TravelNotes-ControlTravelExpandButton', className : 'TravelNotes-Control-ExpandButton'}, headerDiv );
			expandButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : _Translator.getText ( 'TravelEditorUI - Routes' ), id : 'TravelNotes-Control-TravelHeaderText', className : 'TravelNotes-Control-HeaderText'}, headerDiv );
		
			var dataDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-TravelDataDiv', className : 'TravelNotes-Control-DataDiv'}, controlDiv );
			
			_RoutesList = require ( './SortableList' ) ( { minSize : 0, placeholders : [ _Translator.getText ( 'TravelEditorUI - Route' )], id : 'TravelNotes-Control-TravelRoutesList' }, dataDiv );
			_RoutesList.container.addEventListener ( 'SortableListDelete', onRoutesListDelete, false );
			_RoutesList.container.addEventListener ( 'SortableListUpArrow', onRoutesListUpArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListDownArrow', onRoutesListDownArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListRightArrow', onRoutesListRightArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListChange', onRouteslistChange, false );
			
			var buttonsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-ControlTravelButtonsDiv', className : 'TravelNotes-Control-ButtonsDiv' }, controlDiv );

			var expandListButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-ExpandRoutesListButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Expand the list' ), 
					innerHTML : '&#x25bd;'
				}, 
				buttonsDiv 
			);
			expandListButton.addEventListener ( 'click' , onClickExpandListButton, false );
			
			var cancelTravelButton = htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelNotes-Control-CancelTravelButton',
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Cancel travel' ), 
					innerHTML : '&#x274c'
				},
				buttonsDiv 
			);
			cancelTravelButton.addEventListener ( 'click', onCancelTravelButton, false );

			var saveTravelButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-SaveTravelButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Save travel' ), 
					innerHTML : '&#x1f4be;'
				}, 
				buttonsDiv 
			);
			saveTravelButton.addEventListener ( 'click' , onClickSaveTravelButton, false );

			var openTravelDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id: 'TravelNotes-Control-OpenTravelDiv'
				}, 
				buttonsDiv 
			);
			
			var openTravelInput = htmlElementsFactory.create ( 
				'input',
				{
					id : 'TravelNotes-Control-OpenTravelInput', 
					type : 'file',
					accept : '.trv'
				},
				openTravelDiv
			);
			openTravelInput.addEventListener ( 'change', onClickOpenTravelButton, false );

			var openTravelFakeDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id: 'TravelNotes-Control-OpenTravelFakeDiv'
				}, 
				openTravelDiv 
			);

			var openTravelButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-OpenTravelButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Open travel' ), 
					innerHTML : '&#x1F4C2;'
				}, 
				openTravelFakeDiv 
			);
			openTravelButton.addEventListener ( 'click' , function ( ) { openTravelInput.click ( ); }, false );
			
			var openTravelRoadbookButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-OpenTravelRoadbookButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Open travel roadbook' ), 
					innerHTML : '<a href="roadbook.html?page=' + _DataManager.UUID + '" target="_blank">&#x1F4CB;</a>' //'&#x23CD;'
				}, 
				buttonsDiv
			);

			var undoButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-UndoButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Undo' ), 
					innerHTML : '&#x21ba;'
				}, 
				buttonsDiv 
			);
			undoButton.addEventListener ( 'click' , onClickUndoButton, false );

			var addRouteButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-AddRoutesButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - New route' ), 
					innerHTML : '+'
				}, 
				buttonsDiv 
			);
			addRouteButton.addEventListener ( 'click' , onClickAddRouteButton, false );
		};	
		
		return {
			createUI : function ( controlDiv ) { 
				_CreateUI ( controlDiv ); 
			},
			
			setRoutesList : function (  ) {
				_RoutesList.removeAllItems ( );
				var routesIterator = _DataManager.travel.routes.iterator;
				while ( ! routesIterator.done ) {
					_RoutesList.addItem ( routesIterator.value.name, routesIterator.value.objId, false );
				}
			}
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getTravelEditorUI;
	}

}());

},{"../core/TravelEditor":36,"../data/DataManager":38,"./HTMLElementsFactory":20,"./SortableList":26,"./Translator":27}],29:[function(require,module,exports){
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
	
	// User interface
	
	var getControlUI = function ( ) {

		var _MainDiv = document.getElementById ( 'TravelNotes-Control-MainDiv' );

		var _CreateUI = function ( ){ 

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			_MainDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-MainDiv' } );

			require ( './TravelEditorUI' ) ( ).createUI ( _MainDiv ); 

			require ( './RouteEditorUI' ) ( ).createUI ( _MainDiv ); 

			require ( './ItineraryEditorUI' ) ( ).createUI ( _MainDiv ); 

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

},{"./ErrorEditorUI":19,"./HTMLElementsFactory":20,"./ItineraryEditorUI":22,"./RouteEditorUI":24,"./TravelEditorUI":28}],30:[function(require,module,exports){
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
				var header = '<span class="TravelNotes-Control-Error">';
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

},{"../UI/ErrorEditorUI":19}],31:[function(require,module,exports){
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

	var getItineraryEditor = function ( ) {
		
		var _SetItinerary = function (  ) {
			require ( '../UI/ItineraryEditorUI' ) ( ).setItinerary ( );
		};

		return {
			setItinerary : function( ) { _SetItinerary (  );},
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getItineraryEditor;
	}

}());

},{"../UI/ItineraryEditorUI":22}],32:[function(require,module,exports){
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
	
	var _Translator = require ( '../UI/Translator' ) ( );
	var _Config = require ( '../util/Config' ) ( );
	var _DataManager = require ( '../Data/DataManager' ) ( );
	var _Utilities = require ( '../util/Utilities' ) ( );

	var getNoteTooltipText = function ( layer ) {
		var note = _DataManager.getNoteAndRoute ( layer.objId ).note;
		return ( note ? note.tooltipContent : '');
	};
	
	var getNotePopUpText = function ( layer ) {
		var note = _DataManager.getNoteAndRoute ( layer.objId ).note;
		return require ( '../core/NoteEditor' )( ).getNoteHTML ( note, 'TravelNotes-' );
	};
	
	var getRouteTooltipText = function ( layer ) {
		var route = _DataManager.getRoute ( layer.objId );
		return ( route ? route.name : '');
	};

	var getRoutePopupText = function ( layer ) {
		var route = _DataManager.getRoute ( layer.objId );
		return require ( '../core/RouteEditor' )( ).getRouteHTML ( route, 'TravelNotes-' );
	};
	
	var onRouteClick = function ( event ) {
		event.target.openPopup ( event.latlng );		
	};
	
	var onRouteContextMenu = function ( event ) {
		require ('../UI/ContextMenu' ) ( event, require ( './RouteEditor' ) ( ).getRouteContextMenu ( event.target.objId ) );
	};

	var onTravelNoteContextMenu = function ( event ) {
		require ('../UI/ContextMenu' ) ( event, require ( './NoteEditor' ) ( ).getNoteContextMenu ( event.target.objId ) );
	};

	var onTravelNoteDragEnd = function ( event ) {
		var note = _DataManager.getNoteAndRoute ( event.target.objId ).note;
		note.iconLatLng = [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng ];
		var layerGroup = _DataManager.mapObjects.get ( event.target.objId );
		layerGroup.getLayer ( layerGroup.polylineId ).setLatLngs ( [ note.latLng, note.iconLatLng ] );
	};
	
	var onWayPointDragEnd = function ( event ) {
		var wayPoint = _DataManager.editedRoute.wayPoints.getAt ( event.target.objId );
		wayPoint.latLng = [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng ];
		require ( '../core/RouteEditor' ) ( ).wayPointDragEnd ( event.target.objId );
	};


	var onTravelNoteDrag = function ( event ) {
		var note = _DataManager.getNoteAndRoute ( event.target.objId ).note;
		var layerGroup = _DataManager.mapObjects.get ( event.target.objId );
		layerGroup.getLayer ( layerGroup.polylineId ).setLatLngs ( [ note.latLng, [ event.latlng.lat, event.latlng.lng ] ] );
	};
	
	var onBulletTravelNoteDragEnd = function ( event ) {
		var noteAndRoute = _DataManager.getNoteAndRoute ( event.target.objId );
		var note = noteAndRoute.note;
		var route = noteAndRoute.route;
		var layerGroup = _DataManager.mapObjects.get ( event.target.objId );
		if ( null != route ) {
			var latLngDistance = require ( '../util/TravelUtilities' ) ( ).getClosestLatLngDistance ( route, [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng] );
			note.latLng = latLngDistance.latLng;
			note.distance = latLngDistance.distance;
			layerGroup.getLayer ( layerGroup.bulletId ).setLatLng ( latLngDistance.latLng );
			route.notes.sort ( function ( a, b ) { return a.distance - b.distance; } );
		}
		else {
			note.latLng = [ event.target.getLatLng ( ).lat, event.target.getLatLng ( ).lng ];
		}
		layerGroup.getLayer ( layerGroup.polylineId ).setLatLngs ( [ note.latLng, note.iconLatLng ] );
		require ( '../core/TravelEditor' ) ( ).changeTravelHTML ( );
	};
	
	var onBulletTravelNoteDrag = function ( event ) {
		var note = _DataManager.getNoteAndRoute ( event.target.objId ).note;
		var layerGroup = _DataManager.mapObjects.get ( event.target.objId );
		layerGroup.getLayer ( layerGroup.polylineId ).setLatLngs ( [ [ event.latlng.lat, event.latlng.lng ], note.iconLatLng ] );
	};
	
	var getMapEditor = function ( ) {
		
		var _AddTo = function ( objId, object ) {
			object.objId = objId;
			object.addTo ( _DataManager.map );
			_DataManager.mapObjects.set ( objId, object );
		};
		var _RemoveFrom = function ( objId ) {
			var layer = _DataManager.mapObjects.get ( objId );
			if ( layer ) {
				L.DomEvent.off ( layer );
				_DataManager.map.removeLayer ( layer );
				_DataManager.mapObjects.delete ( objId );
			}
			else {
				console.log ( 'Object not found for deletion : ' + objId );
			}
				
		};
		
		var _GetLatLngBounds = function ( latLngs ) {
			var sw = L.latLng ( [ 90, 180] );
			var ne = L.latLng ( [ -90, -180 ] );
			latLngs.forEach ( 
				function ( latLng ) {
					sw.lat = Math.min ( sw.lat, latLng [ 0 ] );
					sw.lng = Math.min ( sw.lng, latLng [ 1 ] );
					ne.lat = Math.max ( ne.lat, latLng [ 0 ] );
					ne.lng = Math.max ( ne.lng, latLng [ 1 ] );
				}
			);
			return L.latLngBounds( sw, ne );
		};
		
		var _GetRouteLatLng = function ( route ) {
			var latLngs = [];
			route.itinerary.itineraryPoints.forEach ( 
				function ( itineraryPoint ) {
					latLngs.push ( itineraryPoint.latLng );
				}
			);
			route.notes.forEach ( 
				function ( note ) {
					latLngs.push ( note.latLng );
					latLngs.push ( note.iconLatLng );
				}
			);
			return latLngs;
		};
		
		return {
			
			removeRoute : function ( route, removeNotes, removeWayPoints ) {
				this.removeObject ( route.objId );
				if ( removeNotes ) {
					var notesIterator = route.notes.iterator;
					while ( ! notesIterator.done ) {
						this.removeObject ( notesIterator.value.objId );
					}
				}
				if ( removeWayPoints ) {
					var wayPointsIterator = route.wayPoints.iterator;
					while ( ! wayPointsIterator.done ) {
						this.removeObject ( wayPointsIterator.value.objId );
					}
				}
			},
			
			addRoute : function ( route, addNotes, addWayPoints ) {
				var latLng = [];
				var pointsIterator = route.itinerary.itineraryPoints.iterator;
				while ( ! pointsIterator.done ) {
					latLng.push ( pointsIterator.value.latLng );
				}
				var polyline = L.polyline ( 
					latLng,
					{
						color : route.color,
						weight : route.width
					}
				);
				_AddTo ( route.objId, polyline );
				polyline.addTo ( _DataManager.map );
				polyline.bindTooltip ( getRouteTooltipText );
				polyline.bindPopup ( getRoutePopupText );
				L.DomEvent.on ( polyline, 'click', onRouteClick );
				L.DomEvent.on ( polyline, 'contextmenu', onRouteContextMenu );
				
				if ( addNotes ) {
					var notesIterator = route.notes.iterator;
					while ( ! notesIterator.done ) {
						this.addNote ( notesIterator.value );
					}
				}

				if ( addWayPoints ) {
					var wayPointsIterator = _DataManager.editedRoute.wayPoints.iterator;
					var wayPointsCounter = 0;
					while ( ! wayPointsIterator.done ) {
						this.addWayPoint ( wayPointsIterator.value, wayPointsIterator .first ? 'A' : ( wayPointsIterator.last ? 'B' : ( ++ wayPointsCounter ).toFixed ( 0 ) ) );
					}
				}
								
			},
			
			editRoute : function ( route ) {
				var polyline = _DataManager.mapObjects.get ( route.objId );
				polyline.setStyle( { color : route.color, weight : route.width } );
			},
			
			removeObject : function ( objId ) {
				_RemoveFrom ( objId );
			},
			
			removeAllObjects : function ( ) {
				_DataManager.mapObjects.forEach ( 
					function ( travelObjectValue, travelObjectKey, travelObjects ) {
						L.DomEvent.off ( travelObjectValue );
						_DataManager.map.removeLayer ( travelObjectValue );
					}
				);
				_DataManager.mapObjects.clear ( );
			},
			
			zoomToPoint : function ( latLng ) {
				map.setView ( latLng, _Config.itineraryPointZoom );
			},
			
			zoomToRoute : function ( routeObjId ) {
				var latLngs = _GetRouteLatLng (  _DataManager.getRoute ( routeObjId ) );
				if ( 0 !== latLngs.length ) {
					_DataManager.map.fitBounds ( _GetLatLngBounds ( latLngs ) );
				}
			},
			
			zoomToTravel : function ( ) {				
				var latLngs = [];
				_DataManager.travel.routes.forEach (
					function ( route ) {
						latLngs = latLngs.concat ( _GetRouteLatLng ( route ) );
					}
				);
				travel.notes.forEach (
					function ( note ) {
						latLngs.push ( note.latLng );
						latLngs.push ( note.iconLatLng );
					}
				);
				if ( 0 !== latLngs.length ) {
					_DataManager.map.fitBounds ( _GetLatLngBounds ( latLngs ) );
				}
			},
			
			addItineraryPointMarker : function ( objId, latLng ) {
				_AddTo ( 
					objId,
					L.circleMarker ( latLng, _Config.itineraryPointMarker )
				);
			},
			
			addWayPoint : function ( wayPoint, letter ) {
				if ( ( 0 === wayPoint.lat ) && ( 0 === wayPoint.lng  ) ) {
					return;
				}
				var iconHtml = '<div class="TravelNotes-WayPoint TravelNotes-WayPoint' + 
				( 'A' === letter ? 'Start' : ( 'B' === letter ? 'End' : 'Via' ) )+ 
				'"></div><div class="TravelNotes-WayPointText">' + letter + '</div>';
				
				var marker = L.marker ( 
					wayPoint.latLng,
					{ 
						icon : L.divIcon ( { iconSize: [ 40 , 40 ], iconAnchor: [ 20, 40 ], html : iconHtml, className : 'TravelNotes-WayPointStyle' } ),
						draggable : true
					} 
				);	
				marker.objId = wayPoint.objId;
				_AddTo ( wayPoint.objId, marker );
				L.DomEvent.on ( marker, 'dragend', onWayPointDragEnd );
			},
			
			addNote : function ( note ) {
				var bullet = L.marker ( 
					note.latLng,
					{ 
						icon : L.divIcon ( { iconSize: [ _Config.note.grip.size , _Config.note.grip.size ], iconAnchor: [ _Config.note.grip.size / 2, _Config.note.grip.size / 2 ], html : '<div></div>'} ),
						zIndexOffset : -1000 ,
						opacity : _Config.note.grip.opacity,
						draggable : true
					} 
				);	
				bullet.objId = note.objId;
				L.DomEvent.on ( bullet, 'dragend', onBulletTravelNoteDragEnd );
				L.DomEvent.on ( bullet, 'drag', onBulletTravelNoteDrag );
				var icon = L.divIcon (
					{ 
						iconSize: [ note.iconWidth, note.iconHeight ], 
						iconAnchor: [note.iconWidth / 2, note.iconHeight / 2 ],
						popupAnchor: [ 0, - note.iconHeight / 2 ], 
						html : note.iconContent,
						className : _Config.note.style
					}
				);
				var marker = L.marker ( 
					note.iconLatLng,
					{
						icon : icon,
						draggable : true
					}
				);	
				marker.bindPopup ( getNotePopUpText );
				if ( 0 !== note.tooltipContent.length ) {
					marker.bindTooltip ( getNoteTooltipText );
					marker.getTooltip ( ).options.offset [ 0 ] = note.iconWidth / 2;
				}
				marker.objId = note.objId;
				var polyline = L.polyline ( [ note.latLng, note.iconLatLng ], _Config.note.polyline );
				polyline.objId = note.objId;
				var layerGroup = L.layerGroup ( [ marker, polyline, bullet ] );
				layerGroup.markerId = L.Util.stamp ( marker );
				layerGroup.polylineId = L.Util.stamp ( polyline );
				layerGroup.bulletId = L.Util.stamp ( bullet );
				_AddTo ( note.objId, layerGroup );
				L.DomEvent.on ( marker, 'contextmenu', onTravelNoteContextMenu );
				L.DomEvent.on ( marker, 'dragend', onTravelNoteDragEnd );
				L.DomEvent.on ( marker, 'drag', onTravelNoteDrag );
			},
			
			editNote : function ( note ) {
				var icon = L.divIcon (
					{ 
						iconSize: [ note.iconWidth, note.iconHeight ], 
						iconAnchor: [note.iconWidth / 2, note.iconHeight / 2 ],
						popupAnchor: [ 0, -note.iconHeight / 2 ], 
						html : note.iconContent,
						className : _Config.note.style
					}
				);
				var layerGroup = _DataManager.mapObjects.get ( note.objId );
				var marker = layerGroup.getLayer ( layerGroup.markerId );
				marker.setIcon ( icon );
				marker.unbindTooltip ( );
				if ( 0 !== note.tooltipContent.length ) {
					marker.bindTooltip ( getNoteTooltipText );
					marker.getTooltip ( ).options.offset [ 0 ] = note.iconWidth / 2;
				}
			}
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getMapEditor;
	}

}());

},{"../Data/DataManager":2,"../UI/ContextMenu":18,"../UI/Translator":27,"../core/NoteEditor":33,"../core/RouteEditor":34,"../core/TravelEditor":36,"../util/Config":48,"../util/TravelUtilities":49,"../util/Utilities":50,"./NoteEditor":33,"./RouteEditor":34}],33:[function(require,module,exports){
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
To do: translations
*/

( function ( ){
	
	'use strict';

	var _Translator = require ( '../UI/Translator' ) ( );
	var _DataManager = require ( '../Data/DataManager' ) ( );
	var _TravelUtilities = require ( '../util/TravelUtilities' ) ( );
	var _MapEditor = require ( '../core/MapEditor' ) ( );
	var _Utilities = require ( '../util/Utilities' ) ( );
	
	var getNoteEditor = function ( ) {
		
		return {	
			newNote : function ( latLng ) {
				var note = require ( '../data/Note' ) ( );
				note.latLng = latLng;
				note.iconLatLng = latLng;
				
				return note;
			},
			
			newRouteNote : function ( routeObjId, event ) {
				var latLngDistance = _TravelUtilities.getClosestLatLngDistance ( 
					_DataManager.getRoute ( routeObjId ),
					[ event.latlng.lat, event.latlng.lng ] 
				);
				var note = this.newNote ( latLngDistance.latLng );
				note.distance = latLngDistance.distance;
				require ( '../UI/NoteDialog' ) ( note, routeObjId );
			},
			
			newManeuverNote : function ( maneuverObjId, itineraryPointObjId ) {
				var latLng = _DataManager.editedRoute.itinerary.itineraryPoints.getAt (  itineraryPointObjId ).latLng;
				var latLngDistance = _TravelUtilities.getClosestLatLngDistance ( 
					_DataManager.editedRoute,
					latLng
				);
				var maneuver = _DataManager.editedRoute.itinerary.maneuvers.getAt ( maneuverObjId );
				var note = this.newNote ( latLng );
				note.distance = latLngDistance.distance;
				note.iconContent = "<div class='TravelNotes-ManeuverNote TravelNotes-ManeuverNote-" + maneuver.iconName + "'></div>";
				note.popupContent = maneuver.instruction;
				note.width = 40;
				note.height = 40;
				require ( '../UI/NoteDialog' ) ( note, _DataManager.editedRoute.objId );
			},
			
			newTravelNote : function ( latLng ) {
				var note = this.newNote ( latLng );
				require ( '../UI/NoteDialog' ) ( note, -1 );
			},
			
			endNoteDialog : function ( note, routeObjId ) {
				if ( _DataManager.getNoteAndRoute ( note.objId ).note ) {
					_MapEditor.editNote ( note );
					require ( '../UI/ItineraryEditorUI' ) ( ).setItinerary ( );
				}
				else {
					this.addNote ( note, routeObjId );
				}
				require ( '../core/TravelEditor' ) ( ).changeTravelHTML ( );
			},	

			addNote : function ( note, routeObjId ) {
				if ( -1 === note.distance ) {
					_DataManager.travel.notes.add ( note );
				}
				else {
					var notes = _DataManager.getRoute ( routeObjId ).notes;
					notes.add ( note );
					notes.sort ( function ( a, b ) { return a.distance - b.distance; } );
					require ( '../UI/ItineraryEditorUI' ) ( ).setItinerary ( );
				}
				_MapEditor.addNote ( note );
				require ( '../core/TravelEditor' ) ( ).changeTravelHTML ( );
			},

			editNote : function ( noteObjId ) {
				var noteAndRoute = _DataManager.getNoteAndRoute ( noteObjId );
				require ( '../UI/NoteDialog' ) ( noteAndRoute.note, null === noteAndRoute.route ? -1 : noteAndRoute.route.objId );
			},

			removeNote : function ( noteObjId ) {
				var noteAndRoute = _DataManager.getNoteAndRoute ( noteObjId );
				_MapEditor.removeObject ( noteObjId );
				if ( ! noteAndRoute.route ) {
					_DataManager.travel.notes.remove ( noteObjId );
				}
				else {
					noteAndRoute.route.notes.remove ( noteObjId );
					require ( '../UI/ItineraryEditorUI' ) ( ).setItinerary ( );
				}
				require ( '../core/TravelEditor' ) ( ).changeTravelHTML ( );
			},
			
			getMapContextMenu :function ( latLng ) {
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "NoteEditor - new travel note" ), 
						action : this.newTravelNote,
						param : latLng
					} 
				);
				contextMenu.push ( 
					{ 
						context : _MapEditor, 
						name : _Translator.getText ( "NoteEditor - zoom to travel" ), 
						action : _MapEditor.zoomToTravel
					} 
				);
				contextMenu.push ( 
					{ 
						context : null,
						name : _Translator.getText ( "NoteEditor - About" ), 
						action : require ( '../UI/AboutDialog' )
					} 
				);
				
				return contextMenu;
			},
			
			getNoteHTML : function ( note, classNamePrefix ) {

			var noteText = '';
				if ( 0 !== note.tooltipContent.length ) {
					noteText += '<div class="' + classNamePrefix + 'NoteHtml-TooltipContent">' + note.tooltipContent + '</div>';
				}
					if ( 0 !== note.popupContent.length ) {
					noteText += '<div class="' + classNamePrefix + 'NoteHtml-PopupContent">' + note.popupContent + '</div>';
				}
				if ( 0 !== note.address.length ) {
					noteText += '<div class="' + classNamePrefix + 'NoteHtml-Address">' + _Translator.getText ( 'NoteEditor - address' )  + note.address + '</div>';
				}
				if ( 0 !== note.phone.length ) {
					noteText += '<div class="' + classNamePrefix + 'NoteHtml-Phone">' + _Translator.getText ( 'NoteEditor - phone' )  + note.phone + '</div>';
				}
				if ( 0 !== note.url.length ) {
					noteText += '<div class="' + classNamePrefix + 'NoteHtml-Url">' + _Translator.getText ( 'NoteEditor - url' ) + '<a href="' + note.url + '" target="_blank">' + note.url +'</a></div>';
				}
				noteText += '<div class="' + classNamePrefix + 'NoteHtml-LatLng">' + 
					_Translator.getText ( 
						'NoteEditor - latlng',
						{ 
							lat : _Utilities.formatLat ( note.lat ),
							lng : _Utilities.formatLng ( note.lng )
						}
					) + '</div>';
					
				if ( -1 !== note.distance ) {
					noteText += '<div class="' + classNamePrefix + 'NoteHtml-Distance">' +
						_Translator.getText ( 
							'NoteEditor - distance', 
							{ 
								distance: _Utilities.formatDistance ( note.distance )
							}
						) + '</div>';
				}
				
				return noteText;
			},
			
			getNoteContextMenu :function ( noteObjId ) {
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "NoteEditor - edit note" ), 
						action : this.editNote,
						param : noteObjId
					} 
				);
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "NoteEditor - delete note" ), 
						action : this.removeNote,
						param : noteObjId
					} 
				);
				
				return contextMenu;
			}
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getNoteEditor;
	}

}());

},{"../Data/DataManager":2,"../UI/AboutDialog":15,"../UI/ItineraryEditorUI":22,"../UI/NoteDialog":23,"../UI/Translator":27,"../core/MapEditor":32,"../core/TravelEditor":36,"../data/Note":42,"../util/TravelUtilities":49,"../util/Utilities":50}],34:[function(require,module,exports){
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

	var _DataManager = require ( '../Data/DataManager' ) ( );
	var _Config = require ( '../util/Config' ) ( );
	var _Translator = require ( '../UI/Translator' ) ( );
	
	var _NoteEditor = require ( '../core/NoteEditor' ) ( );
	var _MapEditor = require ( '../core/MapEditor' ) ( );
	var _RouteEditorUI = require ( '../UI/RouteEditorUI' ) ( );
	var _ItineraryEditor = require ( '../core/ItineraryEditor' ) ( );
	var _Utilities = require ( '../util/Utilities' ) ( );
	
	var getRouteEditor = function ( ) {

		
		return {
			saveGpx : function ( ) {
				var tab0 = "\n";
				var tab1 = "\n\t";
				var tab2 = "\n\t\t";
				var tab3 = "\n\t\t\t";
				var timeStamp = "time='" + new Date ( ).toISOString ( ) + "' ";
				var gpxString = "<?xml version='1.0'?>" + tab0;
				gpxString += "<gpx xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xsi:schemaLocation='http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd' version='1.1' creator='Leaflet-Routing-Gpx'>";

				var wayPointsIterator = _DataManager.editedRoute.wayPoints.iterator;
				while ( ! wayPointsIterator.done )
				{
					gpxString += 
						tab1 + "<wpt lat='" + wayPointsIterator.value.lat + "' lon='" + wayPointsIterator.value.lng + "' " +
						timeStamp + "/>";
					
				}
				gpxString += tab1 + "<rte>";
				var maneuverIterator = _DataManager.editedRoute.itinerary.maneuvers.iterator;
				while ( ! maneuverIterator.done ) {
					var wayPoint = _DataManager.editedRoute.itinerary.itineraryPoints.getAt ( maneuverIterator.value.itineraryPointObjId );
					var instruction = maneuverIterator.value.instruction.replace ( '&', '&amp;' ).replace ( '\'', '&apos;' ).replace ('\"', '&quote;').replace ( '>', '&gt;' ).replace ( '<', '&lt;');
					gpxString +=
						tab2 + "<rtept lat='" + wayPoint.lat + "' lon='" + wayPoint.lng +"' " + timeStamp + "desc='" + instruction + "' />" ;
				}
				gpxString += tab1 + "</rte>";
				gpxString += tab1 + "<trk>";
				gpxString += tab2 + "<trkseg>";
				var itineraryPointsIterator = _DataManager.editedRoute.itinerary.itineraryPoints.iterator;
				while ( ! itineraryPointsIterator.done ) {
					gpxString +=
						tab3 + "<trkpt lat='" + itineraryPointsIterator.value.lat + "' lon='" + itineraryPointsIterator.value.lng + "' " + timeStamp + " />";
				}
				gpxString += tab2 + "</trkseg>";				
				gpxString += tab1 + "</trk>";
				gpxString += tab0 + "</gpx>";
				
				var fileName = _DataManager.editedRoute.name;
				if ( '' === fileName ) {
					fileName = 'TravelNote';
				}
				fileName += '.gpx';
				require ( '../util/Utilities' ) ( ).saveFile ( fileName, gpxString );
			},
			getRouteHTML : function ( route, classNamePrefix ) {
				var distance = 0;
				var duration = 0;

				var maneuverIterator = route.itinerary.maneuvers.iterator;
				while ( ! maneuverIterator.done ) {
					distance += maneuverIterator.value.distance;
					duration += maneuverIterator.value.duration;
				}
				distance = _Utilities.formatDistance ( distance );
				duration = _Utilities.formatTime ( duration );
				
				return '<div class="' + classNamePrefix + 'Route-Header-Name">' +
					route.name + 
					'</div><div class="' + classNamePrefix + 'Route-Header-Distance">' +
					_Translator.getText ( 'RouteEditor - Distance', { distance : distance } ) + '</div>' +
					'<div class="' + classNamePrefix + 'Route-Header-Duration">' +
					_Translator.getText ( 'RouteEditor - Duration', { duration : duration } ) + '</div>';
			},
			
			startRouting : function ( ) {
				if ( ! _Config.routing.auto ) {
					return;
				}
				require ( '../core/Router' ) ( ).startRouting ( _DataManager.editedRoute );
			},
			
			endRouting : function ( ) {
				_MapEditor.removeRoute ( _DataManager.editedRoute, true, true );
				var notesIterator = _DataManager.editedRoute.notes.iterator;
				while ( ! notesIterator.done ) {
					var latLngDistance = require ( '../util/TravelUtilities' ) ( ).getClosestLatLngDistance ( _DataManager.editedRoute, notesIterator.value.latLng );
					notesIterator.value.latLng = latLngDistance.latLng;
					notesIterator.value.distance = latLngDistance.distance;
				}
				
				_ItineraryEditor.setItinerary ( );
				_MapEditor.addRoute ( _DataManager.editedRoute, true, true );
				_MapEditor.zoomToRoute ( _DataManager.editedRoute.objId );
				_RouteEditorUI.setWayPointsList ( );
			},
			
			saveEdition : function ( ) {
				// the edited route is cloned
				var clonedRoute = require ( '../data/Route' ) ( );
				clonedRoute.object = _DataManager.editedRoute.object;
				// and the initial route replaced with the clone
				_DataManager.travel.routes.replace ( _DataManager.editedRoute.routeInitialObjId, clonedRoute );
				_DataManager.editedRoute.routeInitialObjId = clonedRoute.objId;
				this.clear ( );
				require ( '../core/TravelEditor' ) ( ).changeTravelHTML ( );
			},
			
			cancelEdition : function ( ) {
				this.clear ( );
			},
			
			clear : function ( ) {
				_MapEditor.removeRoute ( _DataManager.editedRoute, true, true );
				_MapEditor.addRoute ( _DataManager.getRoute ( _DataManager.editedRoute.routeInitialObjId ), true, false );

				_DataManager.editedRoute = require ( '../data/Route' ) ( );
				_DataManager.editedRoute.routeChanged = false;
				_DataManager.editedRoute.routeInitialObjId = -1;
				require ( '../UI/TravelEditorUI') ( ).setRoutesList ( );
				_RouteEditorUI.setWayPointsList (  );
				_ItineraryEditor.setItinerary ( );
			},
			
			editRoute : function ( routeObjId ) { 
				if ( _DataManager.editedRoute.routeChanged ) {
					require ( '../core/ErrorEditor' ) ( ).showError ( _Translator.getText ( "RouteEditor-Not possible to edit a route without a save or cancel" ) );
					return;
				}
				// Route is cloned, so we can have a cancel button in the editor
				var initialRoute = _DataManager.getRoute ( routeObjId );
				_DataManager.editedRoute = require ( '../data/Route' ) ( );
				_DataManager.editedRoute.object = initialRoute.object;
				_DataManager.editedRoute.routeInitialObjId = initialRoute.objId;
				_MapEditor.removeRoute ( initialRoute, true, false );
				_MapEditor.addRoute ( _DataManager.editedRoute, true, true );
				_RouteEditorUI .expand ( );
				_RouteEditorUI.setWayPointsList ( );
				_ItineraryEditor.setItinerary ( );
			},
			
			removeRoute : function ( routeObjId ) { 
				require ( '../core/TravelEditor' ) ( ).removeRoute ( routeObjId );
			},
			routeProperties : function ( routeObjId ) {
				var route = _DataManager.getRoute ( routeObjId );
				require ( '../UI/RoutePropertiesDialog' ) ( route );
			},
			addWayPoint : function ( latLng ) {
				_DataManager.editedRoute.routeChanged = true;
				var newWayPoint = require ( '../data/Waypoint.js' ) ( );
				if ( latLng ) {
					newWayPoint.latLng = latLng;
				}
				_DataManager.editedRoute.wayPoints.add ( newWayPoint );
				_MapEditor.addWayPoint ( _DataManager.editedRoute.wayPoints.last, _DataManager.editedRoute.wayPoints.length - 2 );
				_DataManager.editedRoute.wayPoints.swap ( newWayPoint.objId, true );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			reverseWayPoints : function ( ) {
				_DataManager.editedRoute.routeChanged = true;
				var wayPointsIterator = _DataManager.editedRoute.wayPoints.iterator;
				while ( ! wayPointsIterator.done ) {
					_MapEditor.removeObject ( wayPointsIterator.value.objId );
				}
				_DataManager.editedRoute.wayPoints.reverse ( );
				wayPointsIterator = _DataManager.editedRoute.wayPoints.iterator;
				var wayPointsCounter = 0;
				while ( ! wayPointsIterator.done ) {
					_MapEditor.addWayPoint ( wayPointsIterator.value, wayPointsIterator .first ? 'A' : ( wayPointsIterator.last ? 'B' : ( ++ wayPointsCounter ).toFixed ( 0 ) ) );
				}
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			removeAllWayPoints : function ( ) {
				_DataManager.editedRoute.routeChanged = true;
				var wayPointsIterator = _DataManager.editedRoute.wayPoints.iterator;
				while ( ! wayPointsIterator.done ) {
					_MapEditor.removeObject ( wayPointsIterator.value.objId );
				}
				_DataManager.editedRoute.wayPoints.removeAll ( true );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			removeWayPoint : function ( wayPointObjId ) {
				_DataManager.editedRoute.routeChanged = true;
				_MapEditor.removeObject ( wayPointObjId );
				_DataManager.editedRoute.wayPoints.remove ( wayPointObjId );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			renameWayPoint : function ( wayPointObjId, wayPointName ) {
				_DataManager.editedRoute.routeChanged = true;
				_DataManager.editedRoute.wayPoints.getAt ( wayPointObjId ).name = wayPointName;
				_RouteEditorUI.setWayPointsList ( );
			},
			
			swapWayPoints : function ( wayPointObjId, swapUp ) {
				_DataManager.editedRoute.routeChanged = true;
				_DataManager.editedRoute.wayPoints.swap ( wayPointObjId, swapUp );
				_RouteEditorUI.setWayPointsList (  );
				this.startRouting ( );
			},
			
			setStartPoint : function ( latLng ) {
				_DataManager.editedRoute.routeChanged = true;
				if ( 0 !== _DataManager.editedRoute.wayPoints.first.lat ) {
					_MapEditor.removeObject ( _DataManager.editedRoute.wayPoints.first.objId );
				}
				_DataManager.editedRoute.wayPoints.first.latLng = latLng;
				_MapEditor.addWayPoint ( _DataManager.editedRoute.wayPoints.first, 'A' );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			setEndPoint : function ( latLng ) {
				_DataManager.editedRoute.routeChanged = true;
				if ( 0 !== _DataManager.editedRoute.wayPoints.last.lat ) {
					_MapEditor.removeObject ( _DataManager.editedRoute.wayPoints.last.objId );
				}
				_DataManager.editedRoute.wayPoints.last.latLng = latLng;
				_MapEditor.addWayPoint ( _DataManager.editedRoute.wayPoints.last, 'B' );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			wayPointDragEnd : function ( wayPointObjId ) {
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			getMapContextMenu :function ( latLng ) {
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Select this point as start point" ), 
						action : ( -1 !== _DataManager.editedRoute.routeInitialObjId ) ? this.setStartPoint : null,
						param : latLng
					} 
				);
				contextMenu.push ( 
					{
						context : this, 
						name : _Translator.getText ( "RouteEditor - Select this point as way point" ), 
						action : ( -1 !== _DataManager.editedRoute.routeInitialObjId ) ? this.addWayPoint : null,
						param : latLng
					}
				);
				contextMenu.push (
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Select this point as end point" ), 
						action : ( -1 !== _DataManager.editedRoute.routeInitialObjId ) ? this.setEndPoint : null,
						param : latLng
					}
				);
				return contextMenu;
			},
			
			getRouteContextMenu : function ( routeObjId ) {
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Edit this route" ), 
						action : ( ( _DataManager.editedRoute.routeInitialObjId !== routeObjId ) && ( ! _DataManager.editedRoute.routeChanged ) ) ? this.editRoute : null,
						param: routeObjId
					} 
				);
				contextMenu.push ( 
					{
						context : this, 
						name : _Translator.getText ( "RouteEditor - Delete this route" ), 
						action : ( ( _DataManager.editedRoute.routeInitialObjId !== routeObjId ) && ( ! _DataManager.editedRoute.routeChanged ) ) ? this.removeRoute :null,
						param: routeObjId
					}
				);
				contextMenu.push ( 
					{
						context : _NoteEditor, 
						name : _Translator.getText ( "RouteEditor - Add a note on the route" ), 
						action : _NoteEditor.newRouteNote,
						param: routeObjId
					}
				);
				contextMenu.push ( 
					{
						context : this, 
						name : _Translator.getText ( "RouteEditor - Properties" ), 
						action : this.routeProperties,
						param: routeObjId
					}
				);
				contextMenu.push ( 
					{
						context : _MapEditor, 
						name : _Translator.getText ( "RouteEditor - Zoom to route" ), 
						action : _MapEditor.zoomToRoute,
						param: routeObjId
					}
				);
				contextMenu.push (
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Save modifications on this route" ), 
						action : ( _DataManager.editedRoute.objId === routeObjId ) ? this.saveEdition : null,
					}
				);
				contextMenu.push (
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Cancel modifications on this route" ), 
						action : ( _DataManager.editedRoute.objId === routeObjId ) ? this.cancelEdition : null
					}
				);
				return contextMenu;
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRouteEditor;
	}

}());

},{"../Data/DataManager":2,"../UI/RouteEditorUI":24,"../UI/RoutePropertiesDialog":25,"../UI/Translator":27,"../UI/TravelEditorUI":28,"../core/ErrorEditor":30,"../core/ItineraryEditor":31,"../core/MapEditor":32,"../core/NoteEditor":33,"../core/Router":35,"../core/TravelEditor":36,"../data/Route":45,"../data/Waypoint.js":47,"../util/Config":48,"../util/TravelUtilities":49,"../util/Utilities":50}],35:[function(require,module,exports){
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

	var _RequestStarted = false;
	var _DataManager = require ( '../Data/DataManager' ) ( );
	var _Config = require ( '../util/Config' ) ( );
	var _RouteProvider = _DataManager.providers.get ( 'mapzen' );
	
	var getRouter = function ( ) {

		var _HaveValidWayPoints = function ( ) {
			return _DataManager.editedRoute.wayPoints.forEach ( 
				function ( wayPoint, result ) {
					if ( null === result ) { 
						result = true;
					}
					result &= ( ( 0 !== wayPoint.lat ) &&  ( 0 !== wayPoint.lng ) );
					return result;
				}
			);
		};
		
		var _ParseResponse = function ( requestResponse ) {
			_RouteProvider.parseResponse ( requestResponse, _DataManager.editedRoute, _Config.language );
			_RequestStarted = false;
			_DataManager.editedRoute.itinerary.provider = _RouteProvider.name;
			_DataManager.editedRoute.itinerary.transitMode = _DataManager.routing.transitMode;
			
			require ( './RouteEditor' ) ( ).endRouting ( );
		};
		
		var _ParseError = function ( status, statusText ) {
			_RequestStarted = false;
			console.log ( "Response status: %d (%s)", status, statusText);
		};
		
		var _StartRequest = function ( ) {
			
			_RouteProvider = _DataManager.providers.get ( _DataManager.routing.provider );

			_RequestStarted = true;

			var providerKey = '';
			if ( require ( '../util/Utilities' ) ( ).storageAvailable ( 'sessionStorage' ) ) {
				providerKey = atob ( sessionStorage.getItem ( _RouteProvider.name.toLowerCase ( ) ) );
			}
			var xmlHttpRequest = new XMLHttpRequest ( );
			xmlHttpRequest.onreadystatechange = function ( event ) {
				if ( this.readyState === XMLHttpRequest.DONE ) {
					if ( this.status === 200 ) {
						_ParseResponse ( this.responseText );
					} 
					else {
						_ParseError ( this.status, this.statusText );
					}
				}
			};

			xmlHttpRequest.open ( 
				'GET',
				_RouteProvider.getUrl ( _DataManager.editedRoute.wayPoints, _DataManager.routing.transitMode, providerKey, _Config.language, null ),
				true
			);
			
			xmlHttpRequest.send ( null );
		};
		
		var _StartRouting = function ( ) {
			if ( _RequestStarted ) {
				return false;
			}
			if ( ! _HaveValidWayPoints ( ) ) {
				return false;
			}
			_StartRequest ( );
			
			return true;
		};
	
		return {
			startRouting : function ( ) {
				_StartRouting ( );
			}
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRouter;
	}

}());

},{"../Data/DataManager":2,"../util/Config":48,"../util/Utilities":50,"./RouteEditor":34}],36:[function(require,module,exports){
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
	
	var _Config = require ( '../util/Config' ) ( );
	var _Translator = require ( '../UI/Translator' ) ( );
	var _DataManager = require ( '../Data/DataManager' ) ( );
	var _MapEditor = require ( '../core/MapEditor' ) ( );
	var _Utilities = require ( '../util/Utilities' ) ( );
	var _HTMLViewsFactory = require ( '../UI/HTMLViewsFactory' ) ( );
	
	var getTravelEditor = function ( ) {

		var _TravelEditorUI = require ( '../UI/TravelEditorUI' ) ( );
		var _Translator = require ( '../UI/Translator' ) ( );

		var _ChangeTravelHTML = function ( ) {
			if ( _Utilities.storageAvailable ( 'localStorage' ) ) {
				_HTMLViewsFactory.classNamePrefix = 'TravelNotes-Roadbook-';
				localStorage.setItem ( _DataManager.UUID + "-TravelNotesHTML", require ( '../UI/HTMLViewsFactory' ) ( ).travelHTML.outerHTML );
			}
		};
		
		var _ReadFile = function ( textFile ) {
			_DataManager.travel.object = JSON.parse ( textFile ) ;
			require ( '../UI/TravelEditorUI' ) ( ). setRoutesList ( );
			_MapEditor.removeAllObjects ( );
			var routesIterator = _DataManager.travel.routes.iterator;
			while ( ! routesIterator.done ) {
				_MapEditor.addRoute ( routesIterator.value, true, false );
			}
			var notesIterator = _DataManager.travel.notes.iterator;
			while ( ! notesIterator.done ) {
				_MapEditor.addNote ( notesIterator.value );
			}
			_MapEditor.zoomToTravel ( );
			_ChangeTravelHTML ( );
		};
		
		
		return {
			
			changeTravelHTML : function ( ) { _ChangeTravelHTML ( ); },
			
			addRoute : function ( ) {
				_DataManager.travel.routes.add ( require ( '../Data/Route' ) ( ) );
				_TravelEditorUI.setRoutesList ( );
			},

			editRoute : function ( routeObjId ) {
				require ( './RouteEditor' ) ( ).editRoute ( routeObjId );
			},

			removeRoute : function ( routeObjId ) {
				if ( routeObjId === _DataManager.editedRoute.routeInitialObjId && _DataManager.editedRoute.routeChanged ) {
					require ( './ErrorEditor' ) ( ).showError ( _Translator.getText ( 'TravelEditor - cannot remove an edited route' ) );
				}
				else {
					require ( './MapEditor' ) ( ).removeObject ( routeObjId );
					_DataManager.travel.routes.remove ( routeObjId );
					_TravelEditorUI.setRoutesList ( );
					if ( routeObjId === _DataManager.editedRoute.routeInitialObjId  ) {
						require ( './RouteEditor') ( ).clear ( );
					}
				}
			},

			renameRoute : function ( routeObjId, routeName ) {
				_DataManager.getRoute ( routeObjId ).name = routeName;
				_TravelEditorUI.setRoutesList ( );
				if ( routeObjId === _DataManager.editedRoute.routeInitialObjId ) {
					_DataManager.editedRoute.name = routeName;
				}
			},

			swapRoute : function ( routeObjId, swapUp ) {
				_DataManager.travel.routes.swap ( routeObjId, swapUp );
				_TravelEditorUI.setRoutesList ( );
			},
			
			saveTravel : function ( ) {
				if ( _DataManager.editedRoute.routeChanged ) {
					require ( './ErrorEditor' ) ( ).showError ( _Translator.getText ( "TravelEditor - Not possible to save a travel without a save or cancel" ) );
				}
				else {
					require ( '../util/Utilities' ) ( ).saveFile ( _DataManager.travel.name, JSON.stringify ( _DataManager.travel.object ) );
				}
			},
			
			openTravel : function ( event ) {
				var fileReader = new FileReader( );
				fileReader.onload = function ( event ) {
					_DataManager.travel.name = fileName;
					_ReadFile ( fileReader.result );
				};
				var fileName = event.target.files [ 0 ].name;
				fileReader.readAsText ( event.target.files [ 0 ] );
			},
			
			openServerTravel : function ( ) {
				var urlSearch = decodeURI ( window.location.search );
				var serverUrl = null;
				if ( 'fil=' === urlSearch.substr ( 1, 4 ) ) {
					serverUrl = atob ( urlSearch.substr ( 5 ) );
					var xmlHttpRequest = new XMLHttpRequest ( );
					xmlHttpRequest.onreadystatechange = function ( event ) {
						if ( this.readyState === XMLHttpRequest.DONE ) {
							if ( this.status === 200 ) {
								_ReadFile ( this.responseText );
							} 
						}
					};
					xmlHttpRequest.open ( 'GET', serverUrl, true	) ;
					xmlHttpRequest.send ( null );
				}
			},
			clear : function ( ) {
				_DataManager.editedRoute = require ( '../Data/Route') ( );
				_DataManager.editedRoute.routeChanged = false;
				_DataManager.editedRoute.routeInitialObjId = -1;
				_DataManager.travel = require ( '../Data/Travel' ) ( );
				require ( '../core/RouteEditor' ) ( ).clear ( );
				require ( '../UI/TravelEditorUI' ) ( ). setRoutesList ( );
				_MapEditor.removeAllObjects ( );
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getTravelEditor;
	}

}());

},{"../Data/DataManager":2,"../Data/Route":9,"../Data/Travel":10,"../UI/HTMLViewsFactory":21,"../UI/Translator":27,"../UI/TravelEditorUI":28,"../core/MapEditor":32,"../core/RouteEditor":34,"../util/Config":48,"../util/Utilities":50,"./ErrorEditor":30,"./MapEditor":32,"./RouteEditor":34}],37:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"./ItineraryPoint":40,"./Maneuver":41,"./Note":42,"./Route":45,"./WayPoint":46,"dup":1}],38:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"../Data/Route":9,"../Data/Travel":10,"../util/Utilities":50,"dup":2}],39:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"../UI/Translator":27,"./Collection":37,"./ObjId":43,"./ObjType":44,"dup":3}],40:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"../UI/Translator":27,"./ObjId":43,"./ObjType":44,"dup":4}],41:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"../UI/Translator":27,"./ObjId":43,"./ObjType":44,"dup":5}],42:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"../UI/Translator":27,"./ObjId":43,"./ObjType":44,"dup":6}],43:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],44:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],45:[function(require,module,exports){
arguments[4][9][0].apply(exports,arguments)
},{"../UI/Translator":27,"../util/Config":48,"./Collection":37,"./Itinerary":39,"./ObjId":43,"./ObjType":44,"./Waypoint":47,"dup":9}],46:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"../UI/Translator":27,"./ObjId":43,"./ObjType":44,"dup":11}],47:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"../UI/Translator":27,"./ObjId":43,"./ObjType":44,"dup":11}],48:[function(require,module,exports){
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
	
	var getConfig = function ( ) {
		
		return {
			routing : {
				auto : true
			},
			language : 'fr',
			itineraryPointMarker : {
				color : 'red',
				weight : 2,
				radius : 7,
				fill : false
			},
			route : 
			{
				color : '#ff0000',
				width : 3
			},
			note : {
				grip : { 
					size : 10,
					opacity: 0 
				},
				polyline : {
					color : 'gray',
					weight : 1
				},
				style : 'TravelNotes-NotesStyle'
			},
			itineraryPointZoom: 17,
			routeEditor : {
				clearAfterCancel : true,
				clearAfterSave : false,
			},
			travelEditor : {
				clearAfterSave : true
			}
		};
	};
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getConfig;
	}

} ) ( );

},{}],49:[function(require,module,exports){
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
	
	var _DataManager = require ( '../Data/DataManager' ) ( );

	var getTravelUtilities = function ( ) {

		return {
			getClosestLatLngDistance : function ( route, latLng ) {
				
				var itineraryPointIterator = route.itinerary.itineraryPoints.iterator;
				var dummy = itineraryPointIterator.done;
				var minDistance = Number.MAX_VALUE;
				var point = L.Projection.SphericalMercator.project ( L.latLng ( latLng [ 0 ], latLng [ 1 ] ) );
				var point1 = L.Projection.SphericalMercator.project ( L.latLng ( itineraryPointIterator.value.lat, itineraryPointIterator.value.lng ) );
				var closestLatLng = null;
				var closestDistance = 0;
				var endSegmentDistance = itineraryPointIterator.value.distance;
				while ( ! itineraryPointIterator.done ) {
					var point2 = L.Projection.SphericalMercator.project ( L.latLng ( itineraryPointIterator.value.lat, itineraryPointIterator.value.lng ) );
					var distance = L.LineUtil.pointToSegmentDistance ( point, point1, point2 );
					if ( distance < minDistance )
					{
						minDistance = distance;
						closestLatLng = L.Projection.SphericalMercator.unproject ( L.LineUtil.closestPointOnSegment ( point, point1, point2 ) );
						closestDistance = endSegmentDistance - closestLatLng.distanceTo ( L.latLng ( itineraryPointIterator.value.lat, itineraryPointIterator.value.lng ) );
					}
					endSegmentDistance += itineraryPointIterator.value.distance;
					point1 = point2;
				}
				
				return { latLng : [ closestLatLng.lat, closestLatLng.lng ], distance : closestDistance };
			}
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getTravelUtilities;
	}

}());

},{"../Data/DataManager":2}],50:[function(require,module,exports){
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
	
	var _Translator = require ( '../UI/Translator' ) ( );
	
	var getUtilities = function ( ) {

		/*
		--- getUUID function --------------------------------------------------------------------------------------------------
		
		This function returns an unique identifier like UUID
		Adapted from stackoverflow.com :-)

		------------------------------------------------------------------------------------------------------------------------
		*/

		var getUUID = function ( ) {
			function Random4 ( ) {
				return Math.floor ( ( 1 + Math.random ( ) ) * 0x10000 ).toString ( 16 ).substring ( 1 );
			}
			return Random4 ( ) + Random4 ( ) + '-' + Random4 ( ) + '-' + Random4 ( ) + '-' +Random4 ( ) + '-' + Random4 ( ) + Random4 ( ) + Random4 ( ) ;
		};

		return {
			
			/*
			--- UUID getter --------------------------------------------------------------------------------------------------------
			*/

			get UUID ( ) { return getUUID ( ); },
						
			/* 
			--- storageAvailable function ------------------------------------------------------------------------------------------
			
			This function test if the storage API is available ( the API can be deactived by user....)
			Adapted from MDN :-)

			------------------------------------------------------------------------------------------------------------------------
			*/
			
			storageAvailable: function ( type ) {
				try {
					var storage = window [ type ];
					var	x = '__storage_test__';
					storage.setItem ( x, x );
					storage.removeItem ( x );
					return true;
				}
				catch ( e ) {
					return false;
				}				
			},
			/* --- End of storageAvailable function --- */		

			/* 
			--- fileAPIAvailable function ------------------------------------------------------------------------------------------
			
			This function test if the File API is available 

			------------------------------------------------------------------------------------------------------------------------
			*/

			fileAPIAvailable : function ( ) {
				try {
					// FF...
					var testFileData = new File ( [ 'testdata' ], { type: 'text/plain' } );
					return true;
				}
				catch ( Error ) {
					if (window.navigator.msSaveOrOpenBlob ) {
					//edge IE 11...
						return true;
					}
					else {
						return false;
					}
				}
			},
			/* 
			--- saveFile function --------------------------------------------------------------------------------------------------
			
			This function data to a local file

			------------------------------------------------------------------------------------------------------------------------
			*/

			saveFile : function ( filename, text, type ) {
				if ( ! type ) {
					type = 'text/plain';
				}
				if ( window.navigator.msSaveOrOpenBlob ) {
					//https://msdn.microsoft.com/en-us/library/hh779016(v=vs.85).aspx
					//edge IE 11...
					try {
						window.navigator.msSaveOrOpenBlob ( new Blob ( [ text ] ), filename ); 
					}
					catch ( Error ) {
					}
				}
				else {
					// FF...
					// http://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
					try {
						var mapFile = window.URL.createObjectURL ( new File ( [ text ], { type: type } ) );
						var element = document.createElement ( 'a' );
						element.setAttribute( 'href', mapFile );
						element.setAttribute( 'download', filename );
						element.style.display = 'none';
						document.body.appendChild ( element );
						element.click ( );
						document.body.removeChild ( element );
						window.URL.revokeObjectURL ( mapFile );
					}
					catch ( Error ) {
					}				
				}
			},
			
			formatTime : function ( time ) {
				time = Math.floor ( time );
				if ( 0 === time ) {
					return '';
				}
				var days = Math.floor ( time / 86400 );
				var hours = Math.floor ( time % 86400 / 3600 );
				var minutes = Math.floor ( time % 3600 / 60 );
				var seconds = Math.floor ( time % 60 );
				if ( 0 < days ) {
					return days + '&nbsp;' + _Translator.getText ( 'Utilities - day' ) + '&nbsp;' + hours + '&nbsp;h';
				}
				else if ( 0 < hours ) {
					return hours + '&nbsp;' + _Translator.getText ( 'Utilities - hour' ) +'&nbsp;' + minutes + '&nbsp;' + _Translator.getText ( 'Utilities - minute' );
				}
				else if ( 0 < minutes ) {
					return minutes + '&nbsp;' + _Translator.getText ( 'Utilities - minute' );
				}
				else {
					return seconds + '&nbsp;' + _Translator.getText ( 'Utilities - second' );
				}
				return '';
			},
			
			formatDistance : function ( distance ) {
				distance = Math.floor ( distance );
				if ( 0 === distance ) {
					return '';
				} 
				else if ( 1000 > distance ) {
					return distance.toFixed ( 0 ) + '&nbsp;m';
				}
				else {
					return Math.floor ( distance / 1000 ) +'.' + Math.floor ( ( distance % 1000 ) / 100 ) + '&nbsp;km';
				}
			},
			
			formatLat : function ( lat ) {
				return ( lat > 0 ? lat.toFixed ( 6 ) + '&nbsp;N' : ( -lat ).toFixed ( 6 ) + '&nbsp;S' );
			},
			
			formatLng : function ( lng ) {
				return ( lng > 0 ? lng.toFixed ( 6 ) + '&nbsp;E' : ( -lng ).toFixed ( 6 ) + '&nbsp;W' );
			},
			
			readURL : function ( ) {
				var urlSearch = decodeURI ( window.location.search ).substr ( 1 ).split ( '&' );
				var newUrlSearch = '?' ;
				for ( var urlCounter = 0; urlCounter < urlSearch.length; urlCounter ++ ) {
					var param = urlSearch [ urlCounter ].split ( '=' );
					if ( ( 2 === param.length ) && ( -1 !== param [ 0 ].indexOf ( 'ProviderKey' ) ) ) {
						if ( this.storageAvailable ( 'sessionStorage' ) ) {
							sessionStorage.setItem ( 
								param [ 0 ].substr ( 0, param [ 0 ].length - 11 ).toLowerCase ( ),
								btoa ( param [ 1 ] )
							);
						}
					}
					else {
						newUrlSearch += ( newUrlSearch === '?' ) ? '' :  '&';
						newUrlSearch += urlSearch [ urlCounter ];
					}
				}
				var stateObj = { index: "bar" };
				history.pushState(stateObj, "page", newUrlSearch );
			}
		};
	};
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getUtilities;
	}

} ) ( );

},{"../UI/Translator":27}]},{},[14]);
