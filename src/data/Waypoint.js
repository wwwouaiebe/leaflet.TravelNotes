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
--- WayPoint.js file --------------------------------------------------------------------------------------------------
This file contains:
	- the WayPoint object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
Doc reviewed 20170926
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	var _ObjType = require ( '../data/ObjType' ) ( 'WayPoint', require ( '../data/DataManager' ) ( ).version );

	var WayPoint = function ( ) {

		// Private variables

		var _Name = '';

		var _Lat = 0;

		var _Lng = 0;

		var _ObjId = require ( '../data/ObjId' ) ( );

		return {

			// getters and setters...

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
				_ObjId = require ( '../data/ObjId' ) ( );
			}
		};
	};


	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = WayPoint;
	}

} ) ( );


/*
--- End of WayPoint.js file -------------------------------------------------------------------------------------------
*/