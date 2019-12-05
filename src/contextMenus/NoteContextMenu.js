/*
Copyright - 2019 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- NoteContextMenu.js file -------------------------------------------------------------------------------------------
This file contains:
	-
Changes:
	- v1.6.0:
		- created
		- Issue #69 : ContextMenu and ContextMenuFactory are unclear.
Doc reviewed 20191124
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newNoteContextMenu };

import { newBaseContextMenu } from '../contextMenus/BaseContextMenu.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { g_NoteEditor} from '../core/NoteEditor.js';
import { g_TravelNotesData} from '../data/TravelNotesData.js';
import { g_Translator } from '../UI/Translator.js';

/*
--- newNoteContextMenu function ---------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newNoteContextMenu ( event ) {

	let m_NoteObjId = event.target.objId;

	/*
	--- m_GetMenuItems function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetMenuItems ( ) {

		let route = newDataSearchEngine ( ).getNoteAndRoute ( m_NoteObjId ).route;

		return [
			{
				context : g_NoteEditor,
				name : g_Translator.getText ( "ContextMenuFactory - Edit this note" ),
				action : g_NoteEditor.editNote,
				param : m_NoteObjId
			},
			{
				context : g_NoteEditor,
				name : g_Translator.getText ( "ContextMenuFactory - Delete this note" ),
				action : g_NoteEditor.removeNote,
				param : m_NoteObjId
			},
			{
				context : g_NoteEditor,
				name : g_Translator.getText ( "ContextMenuFactory - Zoom to note" ),
				action : g_NoteEditor.zoomToNote,
				param : m_NoteObjId
			},
			{
				context : g_NoteEditor,
				name :
					route
						?
						g_Translator.getText ( "ContextMenuFactory - Detach note from route" )
						:
						g_Translator.getText ( "ContextMenuFactory - Attach note to route" ),
				action :
					g_TravelNotesData.travel.routes.length !== 0
					&&
					-1 === g_TravelNotesData.editedRouteObjId
						?
						( route ? g_NoteEditor.detachNoteFromRoute : g_NoteEditor.attachNoteToRoute )
						:
						null,
				param : m_NoteObjId
			}
		];
	}

	/*
	--- NoteContextMenu object function -------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	let noteContextMenu = newBaseContextMenu ( event );
	noteContextMenu.init ( m_GetMenuItems ( ) );

	return Object.seal ( noteContextMenu );
}

/*
--- End of BaseContextMenu.js file ------------------------------------------------------------------------------------
*/