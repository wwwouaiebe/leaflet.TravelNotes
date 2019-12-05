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
--- WayPointContextMenu.js file ---------------------------------------------------------------------------------------
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

export { newWayPointContextMenu };

import { newBaseContextMenu } from '../contextMenus/BaseContextMenu.js';
import { g_WayPointEditor } from '../core/WayPointEditor.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { g_Translator } from '../UI/Translator.js';

/*
--- newWayPointContextMenu function -----------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newWayPointContextMenu ( event ) {

	let m_WayPointObjId = event.target.objId;

	/*
	--- m_GetMenuItems function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetMenuItems ( ) {
		let isMidWayPoint =
			g_TravelNotesData.travel.editedRoute.wayPoints.first.objId !== m_WayPointObjId
			&&
			g_TravelNotesData.travel.editedRoute.wayPoints.last.objId !== m_WayPointObjId ;
		return [
			{
				context : g_WayPointEditor,
				name : g_Translator.getText ( "ContextMenuFactory - Delete this waypoint" ),
				action : isMidWayPoint ? g_WayPointEditor.removeWayPoint : null,
				param : m_WayPointObjId
			}
		];
	}

	/*
	--- WayPointContextMenu object function ---------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	let wayPointContextMenu = newBaseContextMenu ( event );
	wayPointContextMenu.init ( m_GetMenuItems ( ) );

	return Object.seal ( wayPointContextMenu );
}

/*
--- End of WayPointContextMenu.js file ------------------------------------------------------------------------------------
*/