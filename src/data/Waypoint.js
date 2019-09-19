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
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	var s_ObjType = require ( '../data/ObjType' ) ( 'WayPoint', require ( './Version' ) );

	/*
	--- wayPoint function ---------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var wayPoint = function ( ) {

		var m_Name = '';

		var m_Lat = 0;

		var m_Lng = 0;

		var m_ObjId = require ( '../data/ObjId' ) ( );

		var m_GetUIName = function ( ) {
			if ( '' !== m_Name ) {
				return m_Name;
			}
			if ( ( 0 !== m_Lat ) && ( 0 !== m_Lng ) ) {
				return m_Lat.toFixed ( 6 ) + ( 0 < m_Lat ? ' N - ' : ' S - ' ) + m_Lng.toFixed ( 6 )  + ( 0 < m_Lng ? ' E' : ' W' );
			}
			return '';
		};
		
		var m_GetObject = function ( ) {
			return {
				name : m_Name,
				lat : parseFloat ( m_Lat.toFixed ( 6 ) ),
				lng : parseFloat ( m_Lng.toFixed ( 6 ) ),
				objId : m_ObjId,
				objType : s_ObjType.object
			};
		};
		
		var m_SetObject =function ( something ) {
			something = s_ObjType.validate ( something );
			m_Name = something.name || '';
			m_Lat = something.lat || 0;
			m_Lng = something.lng || 0;
			m_ObjId = require ( '../data/ObjId' ) ( );
		};
		
		/*
		--- wayPoint object -------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{

				get name ( ) { return m_Name; },
				set name ( Name ) { m_Name = Name;},

				get UIName ( ) { return m_GetUIName ( ); },

				get lat ( ) { return m_Lat;},
				set lat ( Lat ) { m_Lat = Lat; },

				get lng ( ) { return m_Lng;},
				set lng ( Lng ) { m_Lng = Lng; },

				get latLng ( ) { return [ m_Lat, m_Lng ];},
				set latLng ( LatLng ) { m_Lat = LatLng [ 0 ]; m_Lng = LatLng [ 1 ]; },

				get objId ( ) { return m_ObjId; },

				get objType ( ) { return s_ObjType; },

				get object ( ) { return m_GetObject ( ); },
				set object ( something ) { m_SetObject ( something ); }
			}
		);
	};


	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = wayPoint;
	}

} ) ( );

/*
--- End of WayPoint.js file -------------------------------------------------------------------------------------------
*/