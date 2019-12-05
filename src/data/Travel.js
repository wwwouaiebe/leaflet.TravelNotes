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

/*eslint no-fallthrough: ["error", { "commentPattern": "eslint break omitted intentionally" }]*/

export { newTravel };

import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';
import { newCollection } from '../data/Collection.js';
import { newRoute } from '../data/Route.js';

/*
--- newTravel function --------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newTravel ( ) {

	const s_ObjType = newObjType ( 'Travel' );

	let m_EditedRoute = newRoute ( );

	let m_Name = 'TravelNotes';

	let m_Routes = newCollection ( 'Route' );
	
	let m_Notes = newCollection ( 'Note' );

	let m_ObjId = newObjId ( );

	let m_ReadOnly = false;
	
	let m_UserData = {};

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
				something.editedRoute = newRoute ( );
				// eslint break omitted intentionally
			case '1.5.0':
				something.objType.version = '1.6.0';
				break;
			default:
				throw 'invalid version for ' + s_ObjType.name;
			}
		}
		let properties = Object.getOwnPropertyNames ( something );
		[ 'name', 'editedRoute', 'routes', 'userData', 'objId' ].forEach (
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
			editedRoute : m_EditedRoute.object,
			name : m_Name,
			routes : m_Routes.object,
			notes : m_Notes.object,
			userData : m_UserData,
			readOnly : m_ReadOnly,
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
		m_EditedRoute.object = something.editedRoute;
		m_Name = something.name || '';
		m_UserData = something.userData || {};
		m_ReadOnly = something.readOnly || false;
		m_Routes.object = something.routes || [];
		m_Notes.object = something.notes || [];
		m_ObjId = newObjId ( );
	}
	
	/*
	--- travel object -------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	return Object.seal (
		{
			get editedRoute ( ) { return m_EditedRoute; },
			set editedRoute ( editedRoute ) { m_EditedRoute = editedRoute; },

			get routes ( ) { return m_Routes; },

			get notes ( ) { return m_Notes; },

			get name ( ) { return m_Name; },
			set name ( Name ) { m_Name = Name; },
			
			get readOnly ( ) { return m_ReadOnly; },
			set readOnly ( ReadOnly ) { m_ReadOnly = ReadOnly; },

			get userData ( ) { return m_UserData; },
			set userData ( UserData ) { m_UserData = UserData; },

			get objId ( ) { return m_ObjId; },

			get objType ( ) { return s_ObjType; },

			get object ( ) { return m_GetObject ( ); },
			set object ( something ) { m_SetObject ( something ); }
		}
	);
}

/*
--- End of Travel.js file ---------------------------------------------------------------------------------------------
*/