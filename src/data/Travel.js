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
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

'use strict';

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

var newTravel = function ( ) {

	const s_ObjType = newObjType ( 'Travel' );

	var m_EditedRoute = newRoute ( );

	var m_Name = 'TravelNotes';

	var m_Routes = newCollection ( 'Route' );
	
	var m_Notes = newCollection ( 'Note' );

	var m_ObjId = newObjId ( );

	var m_ReadOnly = false;
	
	var m_UserData = {};

	var m_GetObject = function ( ) {
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
	};
	
	var m_SetObject = function ( something ) {
		something = s_ObjType.validate ( something );
		m_EditedRoute.object = something.editedRoute || newRoute ( );
		m_Name = something.name || '';
		m_UserData = something.userData || {};
		m_ReadOnly = something.readOnly || false;
		m_Routes.object = something.routes || [];
		m_Notes.object = something.notes || [];
		m_ObjId = newObjId ( );
	};
	
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
			set userData ( UserData ) { m_UserData = UserData;},

			get objId ( ) { return m_ObjId; },

			get objType ( ) { return s_ObjType; },

			get object ( ) { return m_GetObject ( ); },
			set object ( something ) { m_SetObject ( something ); }
		}
	);
};

/*
--- End of Travel.js file ---------------------------------------------------------------------------------------------
*/