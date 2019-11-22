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
--- ItineraryPoint.js file --------------------------------------------------------------------------------------------
This file contains:
	- the newItineraryPoint function
	- the module.exports implementation
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

'use strict';

export { newItineraryPoint };

import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';

/*
--- newItineraryPoint function ------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newItineraryPoint ( ) {

	const s_ObjType = newObjType ( 'ItineraryPoint' );
	
	let m_Lat = 0;

	let m_Lng = 0;

	let m_Distance = 0;

	let m_ObjId = newObjId ( );

	function m_GetObject ( ) {
		return {
			lat : parseFloat ( m_Lat.toFixed ( 6 ) ),
			lng : parseFloat ( m_Lng.toFixed ( 6 ) ),
			distance : parseFloat ( m_Distance.toFixed ( 2 ) ),
			objId : m_ObjId,
			objType : s_ObjType.object
		};
	}
	
	function m_SetObject ( something ) {
		something = s_ObjType.validate ( something );
		m_Lat = something.lat || 0;
		m_Lng = something.lng || 0;
		m_Distance = something.distance || 0;
		m_ObjId = newObjId ( );
	}
	
	/*
	--- itineraryPoint object -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	return Object.seal (
		{

			get lat ( ) { return m_Lat;},
			set lat ( Lat ) { m_Lat = Lat; },

			get lng ( ) { return m_Lng;},
			set lng ( Lng ) { m_Lng = Lng; },

			get latLng ( ) { return [ m_Lat, m_Lng ];},
			set latLng ( LatLng ) { m_Lat = LatLng [ 0 ]; m_Lng = LatLng [ 1 ]; },

			get distance ( ) { return m_Distance;},
			set distance ( Distance ) { m_Distance = Distance; },

			get objId ( ) { return m_ObjId; },

			get objType ( ) { return s_ObjType; },

			get object ( ) { return m_GetObject ( ); },
			set object ( something ) { m_SetObject ( something ); }
		}
	);
}

/*
--- End of ItineraryPoint.js file -------------------------------------------------------------------------------------
*/