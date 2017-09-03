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
		var _WayPointObjId = -1;
		var _NoteObjId = -1;
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
						
			get wayPointObjId ( ) { return _WayPointObjId;},
			
			set wayPointObjId ( WayPointObjId ) { _WayPointObjId = WayPointObjId; },
			
			get noteObjId ( ) { return _NoteObjId;},
			
			set noteObjId ( NoteObjId ) { _NoteObjId = NoteObjId; },
			
			get maneuverObjId ( ) { return _ManeuverObjId;},
			
			set maneuverObjId ( ManeuverObjId ) { _ManeuverObjId = ManeuverObjId; },
			
			get objId ( ) { return _ObjId; },
			
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				return {
					lat : _Lat,
					lng : _Lng,
					distance : _Distance,
					wayPointObjId : _WayPointObjId,
					noteObjId : _NoteObjId,
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
				_WayPointObjId = Object.wayPointObjId || -1;
				_NoteObjId = Object.noteObjId || -1;
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