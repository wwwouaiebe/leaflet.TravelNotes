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
--- ObjType.js file ---------------------------------------------------------------------------------------------------
This file contains:
	- the newObjType function
Changes:
	- v1.0.0:
		- created
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191122
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newObjType };

import { currentVersion } from '../data/Version.js';

/*
--- newObjType function -------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newObjType ( name ) {

	const m_Name = name;

	const m_Version = currentVersion;
	
	/*
	--- m_GetObject function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetObject ( ) {
		return {
			name : m_Name,
			version : m_Version
		};
	}
		
	/*
	--- m_Validate function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Validate ( something ) {
		
		if ( ! Object.getOwnPropertyNames ( something ).includes ( 'name' ) ) {
			throw 'No name for ' + m_Name;
		}
		if ( m_Name !== something.name ) {
			throw 'Invalid name for ' + m_Name;
		}
		if ( ! Object.getOwnPropertyNames ( something ).includes ( 'version' ) ) {
			throw 'No version for ' + m_Name;
		}
	}

	/*
	--- objType object ------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{

			get name ( ) { return m_Name; },

			get version ( ) { return m_Version; },

			get object ( ) { return m_GetObject ( ); },

			validate : something => { return m_Validate ( something ); }
			
		}
	);
}

/*
--- End of ObjType.js file ----------------------------------------------------------------------------------------------
*/