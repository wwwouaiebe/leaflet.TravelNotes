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
--- Route.js file -----------------------------------------------------------------------------------------------------
This file contains:
	- the newRoute function
Changes:
	- v1.0.0:
		- created
	-v1.1.0:
		- Issue #33: Add a command to hide a route
		- Issue #36: Add a linetype property to route
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191122
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/* eslint no-fallthrough: ["error", { "commentPattern": "eslint break omitted intentionally" }]*/

import { theConfig } from '../data/Config.js';

import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';
import { newCollection } from '../data/Collection.js';
import { newWayPoint } from '../data/WayPoint.js';
import { newItinerary } from '../data/Itinerary.js';

import { THE_CONST } from '../util/Constants.js';

const ourObjType = newObjType ( 'Route' );

/*
--- newRoute function ---------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newRoute ( ) {

	let myName = '';

	let myWayPoints = newCollection ( 'WayPoint' );
	myWayPoints.add ( newWayPoint ( ) );
	myWayPoints.add ( newWayPoint ( ) );

	let myNotes = newCollection ( 'Note' );

	let myItinerary = newItinerary ( );

	let myWidth = theConfig.route.width;

	let myColor = theConfig.route.color;

	let myDashArray = theConfig.route.dashArray;

	let myChain = false;

	let myChainedDistance = THE_CONST.distance.defaultValue;

	let myDistance = THE_CONST.distance.defaultValue;

	let myDuration = THE_CONST.distance.defaultValue;

	let myEdited = THE_CONST.route.edited.notEdited;

	function mySetEdited ( edited ) {
		if (
			typeof edited !== 'number'
			||
			THE_CONST.route.edited.notEdited > edited
			||
			THE_CONST.route.edited.editedChanged < edited
		) {
			throw 'Invalid value for Route.edited : ' + edited;
		}
		else {
			myEdited = edited;
		}
	}

	let myHidden = false;

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
				something.dashArray = THE_CONST.zero;
				something.hidden = false;
				// eslint break omitted intentionally
			case '1.1.0' :
				// eslint break omitted intentionally
			case '1.2.0' :
				// eslint break omitted intentionally
			case '1.3.0' :
				// eslint break omitted intentionally
			case '1.4.0' :
				something.edited = THE_CONST.route.edited.notEdited;
				// eslint break omitted intentionally
			case '1.5.0' :
				something.objType.version = '1.6.0';
				break;
			default :
				throw 'invalid version for ' + ourObjType.name;
			}
		}
		let properties = Object.getOwnPropertyNames ( something );
		[
			'name',
			'wayPoints',
			'notes',
			'itinerary',
			'width',
			'color',
			'dashArray',
			'chain',
			'distance',
			'duration',
			'edited',
			'hidden',
			'chainedDistance',
			'objId'
		].forEach (
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
			name : myName,
			wayPoints : myWayPoints.object,
			notes : myNotes.object,
			itinerary : myItinerary.object,
			width : myWidth,
			color : myColor,
			dashArray : myDashArray,
			chain : myChain,
			distance : parseFloat ( myDistance.toFixed ( THE_CONST.distance.fixed ) ),
			duration : myDuration,
			edited : myEdited,
			hidden : myHidden,
			chainedDistance : parseFloat ( myChainedDistance.toFixed ( THE_CONST.distance.fixed ) ),
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
		myName = something.name || '';
		myWayPoints.object = something.wayPoints || [];
		myNotes.object = something.notes || [];
		myItinerary.object = something.itinerary || newItinerary ( ).object;
		myWidth = something.width || theConfig.route.width;
		myColor = something.color || '#000000';
		myDashArray = something.dashArray || THE_CONST.zero;
		myChain = something.chain || false;
		myDistance = something.distance;
		myDuration = something.duration;
		myEdited = something.edited || THE_CONST.route.edited.notEdited;
		myHidden = something.hidden || false;
		myChainedDistance = something.chainedDistance;
		myObjId = newObjId ( );
	}

	/*
	--- route object --------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{

			get wayPoints ( ) { return myWayPoints; },

			get itinerary ( ) { return myItinerary; },

			get notes ( ) { return myNotes; },

			get name ( ) { return myName; },
			set name ( Name ) { myName = Name; },

			get width ( ) { return myWidth; },
			set width ( Width ) { myWidth = Width; },

			get color ( ) { return myColor; },
			set color ( Color ) { myColor = Color; },

			get dashArray ( ) { return myDashArray; },
			set dashArray ( DashArray ) { myDashArray = DashArray; },

			get chain ( ) { return myChain; },
			set chain ( Chain ) { myChain = Chain; },

			get chainedDistance ( ) { return myChainedDistance; },
			set chainedDistance ( ChainedDistance ) { myChainedDistance = ChainedDistance; },

			get distance ( ) { return myDistance; },
			set distance ( Distance ) { myDistance = Distance; },

			get duration ( ) { return myDuration; },
			set duration ( Duration ) { myDuration = Duration; },

			get edited ( ) { return myEdited; },
			set edited ( Edited ) { mySetEdited ( Edited ); },

			get hidden ( ) { return myHidden; },
			set hidden ( Hidden ) { myHidden = Hidden; },

			get objId ( ) { return myObjId; },

			get objType ( ) { return ourObjType; },

			get object ( ) { return myGetObject ( ); },
			set object ( something ) { mySetObject ( something ); }
		}
	);
}

export { newRoute };

/*
--- End of Route.js file ----------------------------------------------------------------------------------------------
*/