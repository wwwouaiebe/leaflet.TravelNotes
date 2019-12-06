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

import { newBaseContextMenu } from '../contextMenus/BaseContextMenu.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { theNoteEditor } from '../core/NoteEditor.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theTranslator } from '../UI/Translator.js';

/*
--- newNoteContextMenu function ---------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newNoteContextMenu ( contextMenuEvent ) {

	let myNoteObjId = contextMenuEvent.target.objId;

	/*
	--- myGetMenuItems function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetMenuItems ( ) {

		let route = newDataSearchEngine ( ).getNoteAndRoute ( myNoteObjId ).route;

		return [
			{
				context : theNoteEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Edit this note' ),
				action : theNoteEditor.editNote,
				param : myNoteObjId
			},
			{
				context : theNoteEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Delete this note' ),
				action : theNoteEditor.removeNote,
				param : myNoteObjId
			},
			{
				context : theNoteEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Zoom to note' ),
				action : theNoteEditor.zoomToNote,
				param : myNoteObjId
			},
			{
				context : theNoteEditor,
				name :
					route
						?
						theTranslator.getText ( 'ContextMenuFactory - Detach note from route' )
						:
						theTranslator.getText ( 'ContextMenuFactory - Attach note to route' ),
				action :
					theTravelNotesData.travel.routes.length !== 0
					&&
					-1 === theTravelNotesData.editedRouteObjId
						?
						( route ? theNoteEditor.detachNoteFromRoute : theNoteEditor.attachNoteToRoute )
						:
						null,
				param : myNoteObjId
			}
		];
	}

	/*
	--- NoteContextMenu object function -------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	let noteContextMenu = newBaseContextMenu ( event );
	noteContextMenu.init ( myGetMenuItems ( ) );

	return Object.seal ( noteContextMenu );
}

export { newNoteContextMenu };

/*
--- End of BaseContextMenu.js file ------------------------------------------------------------------------------------
*/