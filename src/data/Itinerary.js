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
--- Itinerary.js file -------------------------------------------------------------------------------------------------
This file contains:
	- the Itinerary object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20181216
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	var s_ObjType = require ( '../data/ObjType' ) ( 'Itinerary', require ( './Version' ) );

	/*
	--- itinerary function --------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var itinerary = function ( ) {

		// Private variables

		var m_Provider = '';

		var m_TransitMode = '';

		var m_ItineraryPoints = require ( '../data/Collection' ) ( 'ItineraryPoint' );

		var m_Maneuvers = require ( '../data/Collection' ) ( 'Maneuver' );

		var m_ObjId = require ( '../data/ObjId' ) ( );

		/*
		--- m_GetObject function --------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetObject = function ( ) {
			return {
				itineraryPoints : m_ItineraryPoints.object,
				maneuvers : m_Maneuvers.object,
				provider : m_Provider,
				transitMode : m_TransitMode,
				objId : m_ObjId,
				objType : s_ObjType.object
			};
		};
		
		/*
		--- m_SetObject function --------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SetObject = function ( something ) {
			something = s_ObjType.validate ( something );
			m_ItineraryPoints.object = something.itineraryPoints || [];
			m_Maneuvers.object = something.maneuvers || [];
			m_Provider = something.provider || '';
			m_TransitMode = something.transitMode || '';
			m_ObjId = require ( '../data/ObjId' ) ( );
			
			// rebuilding links between maneuvers and itineraryPoints
			var itineraryPointObjIdMap = new Map ( );
			var sourceCounter = 0;
			var targetIterator = m_ItineraryPoints.iterator;
			while ( ! targetIterator.done ) {
				itineraryPointObjIdMap.set ( something.itineraryPoints [ sourceCounter ].objId, targetIterator.value.objId );
				sourceCounter ++;
			}
			var maneuverIterator = m_Maneuvers.iterator;
			while ( ! maneuverIterator.done ) {
				maneuverIterator.value.itineraryPointObjId = itineraryPointObjIdMap.get ( maneuverIterator.value.itineraryPointObjId );
			}
		};
		
		/*
		--- itinerary object ------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
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
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = itinerary;
	}

} ) ( );

/*
--- End of Itinerary.js file ------------------------------------------------------------------------------------------
*/