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
Doc reviewed 20170925
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {
	
	'use strict';
	
	var _ObjType = require ( './ObjType' ) ( 'Maneuver', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );

	var Maneuver = function ( ) {
		
		// Private variables
		
		var _ObjId = require ( './ObjId' ) ( );

		var _IconName = '';

		var _Instruction = '';

		var _ItineraryPointObjId = -1;

		var _Distance = 0;

		var _Duration = 0;
		
		return {

			// getters and setters...

			get iconName ( ) { return _IconName;},
			set iconName ( IconName ) { _IconName = IconName; },
						
			get instruction ( ) { return _Instruction;},
			set instruction ( Instruction ) { _Instruction = Instruction; },
						
			get itineraryPointObjId ( ) { return _ItineraryPointObjId;},
			set itineraryPointObjId ( ItineraryPointObjId ) { _ItineraryPointObjId = ItineraryPointObjId; },
						
			get distance ( ) { return _Distance;},
			set distance ( Distance ) { _Distance = Distance; },
			
			get duration ( ) { return _Duration;},
			set duration ( Duration ) { _Duration = Duration; },
						
			get objId ( ) { return _ObjId; },
			
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				return {
					iconName : _IconName,
					instruction : _Instruction,
					distance : _Distance,
					duration : _Duration,
					itineraryPointObjId : _ItineraryPointObjId,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_IconName = Object.iconName || '';
				_Instruction = Object.instruction || '';
				_Distance = Object.distance || 0;
				_Duration = Object.duration || 0;
				_ItineraryPointObjId = Object.itineraryPointObjId || -1;
				_ObjId = require ( './ObjId' ) ( );
			}
		};
	};
	
	/* 
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = Maneuver;
	}

} ) ( );

/*
--- End of Maneuver.js file -------------------------------------------------------------------------------------------
*/