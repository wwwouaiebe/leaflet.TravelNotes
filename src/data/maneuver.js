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
--- Maneuver.js file --------------------------------------------------------------------------------------------------
This file contains:
	- the Maneuver object
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

	var s_ObjType = require ( '../data/ObjType' ) ( 'Maneuver', require ( './Version' ) );

	/*
	--- maneuver function ---------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var maneuver = function ( ) {

		// Private variables

		var m_ObjId = require ( '../data/ObjId' ) ( );

		var m_IconName = '';

		var m_Instruction = '';

		var m_ItineraryPointObjId = -1;

		var m_Distance = 0;

		var m_Duration = 0;

		var m_GetObject = function ( ) {
			return {
				iconName : m_IconName,
				instruction : m_Instruction,
				distance : parseFloat ( m_Distance.toFixed ( 2 ) ),
				duration : m_Duration,
				itineraryPointObjId : m_ItineraryPointObjId,
				objId : m_ObjId,
				objType : s_ObjType.object
			};
		};
		
		var m_SetObject = function ( something ) {
			something = s_ObjType.validate ( something );
			m_IconName = something.iconName || '';
			m_Instruction = something.instruction || '';
			m_Distance = something.distance || 0;
			m_Duration = something.duration || 0;
			m_ItineraryPointObjId = something.itineraryPointObjId || -1;
			m_ObjId = require ( '../data/ObjId' ) ( );
		};

		/*
		--- maneuver object -------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{
				
				get iconName ( ) { return m_IconName;},
				set iconName ( IconName ) { m_IconName = IconName; },

				get instruction ( ) { return m_Instruction;},
				set instruction ( Instruction ) { m_Instruction = Instruction; },

				get itineraryPointObjId ( ) { return m_ItineraryPointObjId;},
				set itineraryPointObjId ( ItineraryPointObjId ) { m_ItineraryPointObjId = ItineraryPointObjId; },

				get distance ( ) { return m_Distance;},
				set distance ( Distance ) { m_Distance = Distance; },

				get duration ( ) { return m_Duration;},
				set duration ( Duration ) { m_Duration = Duration; },

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
		module.exports = maneuver;
	}

} ) ( );

/*
--- End of Maneuver.js file -------------------------------------------------------------------------------------------
*/