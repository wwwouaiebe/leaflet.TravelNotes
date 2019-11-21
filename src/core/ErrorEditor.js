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
--- ErrorEditor.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the newErrorEditor function
Changes:
	- v1.0.0:
		- created
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191121
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { g_ErrorEditor };

import { newErrorEditorUI } from '../UI/ErrorEditorUI.js';

function newErrorEditor ( ) {

	return Object.seal (
		{
			showError : error  => { newErrorEditorUI ( ).message = '<span class="TravelNotes-Control-Error">' + error + '</span>'; },
			clear : ( )  => { newErrorEditorUI ( ).message = ''; }
		}
	);
}

let g_ErrorEditor = newErrorEditor ( );

/*
--- End of ErrorEditor.js file ----------------------------------------------------------------------------------------
*/