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

import { theCurrentVersion } from '../data/Version.js';

/*
--- newObjType function -------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newObjType ( objTypeName ) {

	const myName = objTypeName;

	const myVersion = theCurrentVersion;

	/*
	--- myGetObject function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetObject ( ) {
		return {
			name : myName,
			version : myVersion
		};
	}

	/*
	--- myValidate function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myValidate ( something ) {

		if ( ! Object.getOwnPropertyNames ( something ).includes ( 'name' ) ) {
			throw 'No name for ' + myName;
		}
		if ( myName !== something.name ) {
			throw 'Invalid name for ' + myName;
		}
		if ( ! Object.getOwnPropertyNames ( something ).includes ( 'version' ) ) {
			throw 'No version for ' + myName;
		}
	}

	/*
	--- objType object ------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{

			get name ( ) { return myName; },

			get version ( ) { return myVersion; },

			get object ( ) { return myGetObject ( ); },

			validate : something => myValidate ( something )

		}
	);
}

/*
--- End of ObjType.js file ----------------------------------------------------------------------------------------------
*/