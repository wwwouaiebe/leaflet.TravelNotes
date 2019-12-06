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
--- Maneuver.js file --------------------------------------------------------------------------------------------------
This file contains:
	- the newManeuver function
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

import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';

const ourObjType = newObjType ( 'Maneuver' );

/*
--- newManeuver function ------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newManeuver ( ) {

	// Private variables

	let myObjId = newObjId ( );

	let myIconName = '';

	let myInstruction = '';

	let myItineraryPointObjId = -1;

	let myDistance = 0;

	let myDuration = 0;

	/*
	--- myValidate function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myValidate ( something ) {
		if ( ! Object.getOwnPropertyNames ( something ).includes ( 'objType' ) ) {
			throw 'No objType for ' + ourObjType.name;
		}
		ourObjType.validate ( something.objType );
		if ( ourObjType.version !== something.objType.version ) {
			switch ( something.objType.version ) {
			case '1.0.0' :
			case '1.1.0' :
			case '1.2.0' :
			case '1.3.0' :
			case '1.4.0' :
			case '1.5.0' :
				something.objType.version = '1.6.0';
				break;
			default :
				throw 'invalid version for ' + ourObjType.name;
			}
		}
		let properties = Object.getOwnPropertyNames ( something );
		[ 'iconName', 'instruction', 'distance', 'duration', 'itineraryPointObjId', 'objId' ].forEach (
			property => {
				if ( ! properties.includes ( property ) ) {
					throw 'No ' + property + ' for ' + ourObjType.name;
				}
			}
		);
		return something;
	}

	/*
	--- myGetObject function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetObject ( ) {
		return {
			iconName : myIconName,
			instruction : myInstruction,
			distance : parseFloat ( myDistance.toFixed ( 2 ) ),
			duration : myDuration,
			itineraryPointObjId : myItineraryPointObjId,
			objId : myObjId,
			objType : ourObjType.object
		};
	}

	/*
	--- mySetObject function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetObject ( something ) {
		something = myValidate ( something );
		myIconName = something.iconName || '';
		myInstruction = something.instruction || '';
		myDistance = something.distance || 0;
		myDuration = something.duration || 0;
		myItineraryPointObjId = something.itineraryPointObjId || -1;
		myObjId = newObjId ( );
	}

	/*
	--- maneuver object -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{

			get iconName ( ) { return myIconName; },
			set iconName ( IconName ) { myIconName = IconName; },

			get instruction ( ) { return myInstruction; },
			set instruction ( Instruction ) { myInstruction = Instruction; },

			get itineraryPointObjId ( ) { return myItineraryPointObjId; },
			set itineraryPointObjId ( ItineraryPointObjId ) { myItineraryPointObjId = ItineraryPointObjId; },

			get distance ( ) { return myDistance; },
			set distance ( Distance ) { myDistance = Distance; },

			get duration ( ) { return myDuration; },
			set duration ( Duration ) { myDuration = Duration; },

			get objId ( ) { return myObjId; },

			get objType ( ) { return ourObjType; },

			get object ( ) { return myGetObject ( ); },
			set object ( something ) { mySetObject ( something ); }
		}
	);
}

export { newManeuver };

/*
--- End of Maneuver.js file -------------------------------------------------------------------------------------------
*/