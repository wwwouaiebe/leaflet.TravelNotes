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
--- ManeuverContextMenu.js file ---------------------------------------------------------------------------------------
This file contains:
	- the newManeuverContextMenu function
Changes:
	- v1.12.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newBaseContextMenu } from '../contextMenus/BaseContextMenu.js';
import { newZoomer } from '../core/Zoomer.js';
import { theTranslator } from '../UI/Translator.js';
import { theNoteEditor } from '../core/NoteEditor.js';
import { theRouteEditor } from '../core/RouteEditor.js';

function newManeuverContextMenu ( contextMenuEvent, parentDiv ) {

	let myManeuverObjId = contextMenuEvent.maneuverObjId;
	let myZoomer = newZoomer ( );

	/*
	--- myGetMenuItems function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetMenuItems ( ) {

		return [

			{
				context : theNoteEditor,
				name : theTranslator.getText ( 'ManeuverContextMenu - Create a maneuver note' ),
				action : theNoteEditor.newManeuverNote,
				param : contextMenuEvent.originalEvent.latLng
			},
			{
				context : theRouteEditor,
				name : theTranslator.getText ( 'ManeuverContextMenu - Delete this maneuver' ),
				action : theRouteEditor.removeManeuver,
				param : myManeuverObjId
			},
			{
				context : myZoomer,
				name : theTranslator.getText ( 'ManeuverContextMenu - Zoom to this maneuver' ),
				action : myZoomer.zoomToManeuver,
				param : myManeuverObjId
			}
		];
	}

	/*
	--- NoteContextMenu object function -------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	let maneuverContextMenu = newBaseContextMenu ( contextMenuEvent, parentDiv );
	maneuverContextMenu.init ( myGetMenuItems ( ) );

	return Object.seal ( maneuverContextMenu );
}

export { newManeuverContextMenu };

/*
--- End of ManeuverContextMenu.js file --------------------------------------------------------------------------------
*/