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
--- Itinerary.js file -------------------------------------------------------------------------------------------------
This file contains:
	- the newItinerary function
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

export { newItinerary };

import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';
import { newCollection } from '../data/Collection.js';

/*
--- newItinerary function -----------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newItinerary ( ) {

	const s_ObjType = newObjType ( 'Itinerary' );

	let m_Provider = '';

	let m_TransitMode = '';

	let m_ItineraryPoints = newCollection ( 'ItineraryPoint' );

	let m_Maneuvers = newCollection ( 'Maneuver' );

	let m_ObjId = newObjId ( );

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
		['itineraryPoints', 'maneuvers', 'provider', 'transitMode', 'objId' ].forEach (
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
			itineraryPoints : m_ItineraryPoints.object,
			maneuvers : m_Maneuvers.object,
			provider : m_Provider,
			transitMode : m_TransitMode,
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
		m_ItineraryPoints.object = something.itineraryPoints || [];
		m_Maneuvers.object = something.maneuvers || [];
		m_Provider = something.provider || '';
		m_TransitMode = something.transitMode || '';
		m_ObjId = newObjId ( );
		
		// rebuilding links between maneuvers and itineraryPoints
		let itineraryPointObjIdMap = new Map ( );
		let sourceCounter = 0;
		let targetIterator = m_ItineraryPoints.iterator;
		while ( ! targetIterator.done ) {
			itineraryPointObjIdMap.set ( something.itineraryPoints [ sourceCounter ].objId, targetIterator.value.objId );
			sourceCounter ++;
		}
		let maneuverIterator = m_Maneuvers.iterator;
		while ( ! maneuverIterator.done ) {
			maneuverIterator.value.itineraryPointObjId = itineraryPointObjIdMap.get ( maneuverIterator.value.itineraryPointObjId );
		}
	}
	
	/*
	--- itinerary object ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	return Object.seal (
		{

			get itineraryPoints ( ) { return m_ItineraryPoints; },

			get maneuvers ( ) { return m_Maneuvers; },

			get provider ( ) { return m_Provider; },
			set provider ( Provider ) { m_Provider = Provider; },

			get transitMode ( ) { return m_TransitMode; },
			set transitMode ( TransitMode ) { m_TransitMode = TransitMode; },

			get objId ( ) { return m_ObjId; },

			get objType ( ) { return s_ObjType; },

			get object ( ) { return m_GetObject ( );},
			set object ( something ) { m_SetObject ( something ); }
			
		}
	);
}

/*
--- End of Itinerary.js file ------------------------------------------------------------------------------------------
*/