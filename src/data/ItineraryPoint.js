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
--- ItineraryPoint.js file --------------------------------------------------------------------------------------------
This file contains:
	- the ItineraryPoint object
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

	var _ObjType = require ( '../data/ObjType' ) ( 'ItineraryPoint', require ( '../data/DataManager' ) ( ).version );

	/*
	--- ItineraryPoint object -----------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var ItineraryPoint = function ( ) {

		// Private variables

		var _Lat = 0;

		var _Lng = 0;

		var _Distance = 0;

		var _ObjId = require ( '../data/ObjId' ) ( );

		return {

			// getters and setters...

			get lat ( ) { return _Lat;},
			set lat ( Lat ) { _Lat = Lat; },

			get lng ( ) { return _Lng;},
			set lng ( Lng ) { _Lng = Lng; },

			get latLng ( ) { return [ _Lat, _Lng ];},
			set latLng ( LatLng ) { _Lat = LatLng [ 0 ]; _Lng = LatLng [ 1 ]; },

			get distance ( ) { return _Distance;},
			set distance ( Distance ) { _Distance = Distance; },

			get objId ( ) { return _ObjId; },

			get objType ( ) { return _ObjType; },

			get object ( ) {
				return {
					lat : parseFloat ( _Lat.toFixed ( 6 ) ),
					lng : parseFloat ( _Lng.toFixed ( 6 ) ),
					distance : parseFloat ( _Distance.toFixed ( 2 ) ),
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_Lat = Object.lat || 0;
				_Lng = Object.lng || 0;
				_Distance = Object.distance || 0;
				_ObjId = require ( '../data/ObjId' ) ( );
			}
		};
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = ItineraryPoint;
	}

} ) ( );

/*
--- End of ItineraryPoint.js file -------------------------------------------------------------------------------------
*/