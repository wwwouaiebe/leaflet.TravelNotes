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
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
	- v1.7.0:
		- issue #89 : Add elevation graph
Doc reviewed 20191122
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';

import { THE_CONST } from '../util/Constants.js';

const ourObjType = newObjType ( 'ItineraryPoint' );

/*
--- newItineraryPoint function ------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newItineraryPoint ( ) {

	let myLat = THE_CONST.latLng.defaultValue;

	let myLng = THE_CONST.latLng.defaultValue;

	let myDistance = THE_CONST.distance.defaultValue;

	let myElev = THE_CONST.elev.defaultValue;

	let myObjId = newObjId ( );

	/*
	--- myValidate function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myValidate ( something ) {
		if ( ! Object.getOwnPropertyNames ( something ).includes ( 'objType' ) ) {
			throw new Error ( 'No objType for ' + ourObjType.name );
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
			case '1.6.0' :
				something.elev = THE_CONST.elev.defaultValue;
				something.objType.version = '1.7.0';
				break;
			default :
				throw new Error ( 'invalid version for ' + ourObjType.name );
			}
		}
		let properties = Object.getOwnPropertyNames ( something );
		[ 'lat', 'lng', 'distance', 'elev', 'objId' ].forEach (
			property => {
				if ( ! properties.includes ( property ) ) {
					throw new Error ( 'No ' + property + ' for ' + ourObjType.name );
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
			lat : parseFloat ( myLat.toFixed ( THE_CONST.latLng.fixed ) ),
			lng : parseFloat ( myLng.toFixed ( THE_CONST.latLng.fixed ) ),
			distance : parseFloat ( myDistance.toFixed ( THE_CONST.distance.fixed ) ),
			elev : parseFloat ( myElev.toFixed ( THE_CONST.elev.fixed ) ),
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
		myLat = otherthing.lat || THE_CONST.latLng.defaultValue;
		myLng = otherthing.lng || THE_CONST.latLng.defaultValue;
		myDistance = otherthing.distance || THE_CONST.distance.defaultValue;
		myElev = otherthing.elev || THE_CONST.elev.defaultValue;
		myObjId = newObjId ( );
	}

	/*
	--- itineraryPoint object -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{

			get lat ( ) { return myLat; },
			set lat ( Lat ) { myLat = Lat; },

			get lng ( ) { return myLng; },
			set lng ( Lng ) { myLng = Lng; },

			get latLng ( ) { return [ myLat, myLng ]; },
			set latLng ( LatLng ) {
				myLat = LatLng [ THE_CONST.zero ];
				myLng = LatLng [ THE_CONST.number1 ];
			},

			get distance ( ) { return myDistance; },
			set distance ( Distance ) { myDistance = Distance; },

			get elev ( ) { return myElev; },
			set elev ( Elev ) { myElev = Elev; },

			get objId ( ) { return myObjId; },

			get objType ( ) { return ourObjType; },

			get object ( ) { return myGetObject ( ); },
			set object ( something ) { mySetObject ( something ); }
		}
	);
}

export { newItineraryPoint };

/*
--- End of ItineraryPoint.js file -------------------------------------------------------------------------------------
*/