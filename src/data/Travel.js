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
--- Travel.js file ----------------------------------------------------------------------------------------------------
This file contains:
	- the newTravel function
Changes:
	- v1.0.0:
		- created
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

export { newTravel };

import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';
import { newCollection } from '../data/Collection.js';
import { newRoute } from '../data/Route.js';

const ourObjType = newObjType ( 'Travel' );

/*
--- newTravel function --------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newTravel ( ) {

	let myEditedRoute = newRoute ( );

	let myName = 'TravelNotes';

	let myRoutes = newCollection ( 'Route' );

	let myNotes = newCollection ( 'Note' );

	let myObjId = newObjId ( );

	let myReadOnly = false;

	let myUserData = {};

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
				something.editedRoute = newRoute ( );
				// eslint break omitted intentionally
			case '1.5.0' :
				something.objType.version = '1.6.0';
				break;
			default :
				throw 'invalid version for ' + ourObjType.name;
			}
		}
		let properties = Object.getOwnPropertyNames ( something );
		[ 'name', 'editedRoute', 'routes', 'userData', 'objId' ].forEach (
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
			editedRoute : myEditedRoute.object,
			name : myName,
			routes : myRoutes.object,
			notes : myNotes.object,
			userData : myUserData,
			readOnly : myReadOnly,
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
		myEditedRoute.object = something.editedRoute;
		myName = something.name || '';
		myUserData = something.userData || {};
		myReadOnly = something.readOnly || false;
		myRoutes.object = something.routes || [];
		myNotes.object = something.notes || [];
		myObjId = newObjId ( );
	}

	/*
	--- travel object -------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			get editedRoute ( ) { return myEditedRoute; },
			set editedRoute ( editedRoute ) { myEditedRoute = editedRoute; },

			get routes ( ) { return myRoutes; },

			get notes ( ) { return myNotes; },

			get name ( ) { return myName; },
			set name ( Name ) { myName = Name; },

			get readOnly ( ) { return myReadOnly; },
			set readOnly ( ReadOnly ) { myReadOnly = ReadOnly; },

			get userData ( ) { return myUserData; },
			set userData ( UserData ) { myUserData = UserData; },

			get objId ( ) { return myObjId; },

			get objType ( ) { return ourObjType; },

			get object ( ) { return myGetObject ( ); },
			set object ( something ) { mySetObject ( something ); }
		}
	);
}

/*
--- End of Travel.js file ---------------------------------------------------------------------------------------------
*/