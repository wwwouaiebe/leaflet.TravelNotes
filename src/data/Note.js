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
	
	var _ObjName = 'Note';
	var _ObjVersion = '1.0.0';

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
			get objName ( ) { return _ObjName; },
			get objVersion ( ) { return _ObjVersion; },
			
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
					objName : _ObjName,
					objVersion : _ObjVersion
				};
			},
			set object ( Object ) {
				if ( ! Object.objVersion ) {
					throw 'No ObjVersion for Note';
				}
				if ( '1.0.0' !== Object.objVersion ) {
					throw 'invalid objVersion for Note';
				}
				if ( ! Object.objName ) {
					throw 'No objName for Note';
				}
				if ( 'Note' !== Object.objName ) {
					throw 'Invalid objName for Note';
				}
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
