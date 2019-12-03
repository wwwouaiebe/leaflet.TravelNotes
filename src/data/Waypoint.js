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
--- WayPoint.js file --------------------------------------------------------------------------------------------------
This file contains:
	- the newWayPoint function
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191122
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newWayPoint };

import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';

const s_ObjType = newObjType ( 'WayPoint' );

/*
--- newWayPoint function ------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newWayPoint ( ) {
	
	let m_Name = '';

	let m_Lat = 0;

	let m_Lng = 0;

	let m_ObjId = newObjId ( );

	function m_GetUIName ( ) {
		if ( '' !== m_Name ) {
			return m_Name;
		}
		if ( ( 0 !== m_Lat ) && ( 0 !== m_Lng ) ) {
			return m_Lat.toFixed ( 6 ) + ( 0 < m_Lat ? ' N - ' : ' S - ' ) + m_Lng.toFixed ( 6 )  + ( 0 < m_Lng ? ' E' : ' W' );
		}
		return '';
	}
	
	/*
	--- m_Validate function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Validate ( something ) {
		if ( ! Object.getOwnPropertyNames ( something ).includes ( 'objType' ) ) {
			throw 'No objType for ' + s_ObjType.name;
		}
		s_ObjType.validate ( something.objType );
		if ( s_ObjType.version !== something.objType.version ) {
			switch ( something.objType.version ) {
				case '1.0.0':
				case '1.1.0':
				case '1.2.0':
				case '1.3.0':
				case '1.4.0':
				case '1.5.0':
					something.objType.version = '1.6.0';
					break;
				default:
					throw 'invalid version for ' + s_ObjType.name;
			}
		}
		let properties = Object.getOwnPropertyNames ( something );
		[ 'name', 'lat', 'lng', 'objId' ].forEach (
			property => {
				if ( ! properties.includes ( property ) ) {
					throw 'No ' + property + ' for ' + s_ObjType.name;
				}
			}
		)
		return something;
	}
		
	/*
	--- m_GetObject function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetObject ( ) {
		return {
			name : m_Name,
			lat : parseFloat ( m_Lat.toFixed ( 6 ) ),
			lng : parseFloat ( m_Lng.toFixed ( 6 ) ),
			objId : m_ObjId,
			objType : s_ObjType.object
		};
	}
	
	/*
	--- m_SetObject function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SetObject ( something ) {
		something = m_Validate ( something );
		m_Name = something.name || '';
		m_Lat = something.lat || 0;
		m_Lng = something.lng || 0;
		m_ObjId = newObjId ( );
	}
	
	/*
	--- wayPoint object -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{

			get name ( ) { return m_Name; },
			set name ( Name ) { m_Name = Name; },

			get UIName ( ) { return m_GetUIName ( ); },

			get lat ( ) { return m_Lat; },
			set lat ( Lat ) { m_Lat = Lat; },

			get lng ( ) { return m_Lng; },
			set lng ( Lng ) { m_Lng = Lng; },

			get latLng ( ) { return [ m_Lat, m_Lng ]; },
			set latLng ( LatLng ) { m_Lat = LatLng [ 0 ]; m_Lng = LatLng [ 1 ]; },

			get objId ( ) { return m_ObjId; },

			get objType ( ) { return s_ObjType; },

			get object ( ) { return m_GetObject ( ); },
			set object ( something ) { m_SetObject ( something ); }
		}
	);
}

/*
--- End of WayPoint.js file -------------------------------------------------------------------------------------------
*/