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

import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';
import { newCollection } from '../data/Collection.js';

import { THE_CONST } from '../util/Constants.js';

const ourObjType = newObjType ( 'Itinerary' );

/*
--- newItinerary function ---------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newItinerary ( ) {

	let myProvider = '';

	let myTransitMode = '';

	let myItineraryPoints = newCollection ( 'ItineraryPoint' );

	let myManeuvers = newCollection ( 'Maneuver' );

	let myObjId = newObjId ( );

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
		[ 'itineraryPoints', 'maneuvers', 'provider', 'transitMode', 'objId' ].forEach (
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
			itineraryPoints : myItineraryPoints.object,
			maneuvers : myManeuvers.object,
			provider : myProvider,
			transitMode : myTransitMode,
			objId : myObjId,
			objType : ourObjType.object
		};
	}

	/*
	--- mySetObject function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetObject ( something ) {
		let otherthing = myValidate ( something );
		myItineraryPoints.object = otherthing.itineraryPoints || [];
		myManeuvers.object = otherthing.maneuvers || [];
		myProvider = otherthing.provider || '';
		myTransitMode = otherthing.transitMode || '';
		myObjId = newObjId ( );

		// rebuilding links between maneuvers and itineraryPoints
		let itineraryPointObjIdMap = new Map ( );
		let sourceCounter = THE_CONST.zero;
		let targetIterator = myItineraryPoints.iterator;
		while ( ! targetIterator.done ) {
			itineraryPointObjIdMap.set ( otherthing.itineraryPoints [ sourceCounter ].objId, targetIterator.value.objId );
			sourceCounter ++;
		}
		let maneuverIterator = myManeuvers.iterator;
		while ( ! maneuverIterator.done ) {
			maneuverIterator.value.itineraryPointObjId =
				itineraryPointObjIdMap.get ( maneuverIterator.value.itineraryPointObjId );
		}
	}

	/*
	--- itinerary object ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{

			get itineraryPoints ( ) { return myItineraryPoints; },

			get maneuvers ( ) { return myManeuvers; },

			get provider ( ) { return myProvider; },
			set provider ( Provider ) { myProvider = Provider; },

			get transitMode ( ) { return myTransitMode; },
			set transitMode ( TransitMode ) { myTransitMode = TransitMode; },

			get objId ( ) { return myObjId; },

			get objType ( ) { return ourObjType; },

			get object ( ) { return myGetObject ( ); },
			set object ( something ) { mySetObject ( something ); }

		}
	);
}

export { newItinerary };

/*
--- End of Itinerary.js file ------------------------------------------------------------------------------------------
*/