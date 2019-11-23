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
--- RouteContextMenu.js file ------------------------------------------------------------------------------------------
This file contains:
	- 
Changes:
	- v1.6.0:
		- created
		- Issue #69 : ContextMenu and ContextMenuFactory are unclear.
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newRouteContextMenu };

import { newBaseContextMenu } from '../contextMenus/BaseContextMenu.js';
import { g_WayPointEditor} from '../core/WayPointEditor.js';
import { g_NoteEditor} from '../core/NoteEditor.js';
import { g_RouteEditor} from '../core/RouteEditor.js';
import { g_MapEditor} from '../core/MapEditor.js';
import { g_TravelEditor} from '../core/TravelEditor.js';
import { g_TravelNotesData} from '../data/TravelNotesData.js';
import { g_Translator } from '../UI/Translator.js';

/*
--- newRouteContextMenu function --------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newRouteContextMenu ( event ) {
	
	let m_RouteObjId = event.target.objId;

	/*
	--- m_GetMenuItems function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GetMenuItems ( ) {
		return [
			{ 
				context : g_RouteEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Edit this route" ), 
				action : ( ( g_TravelNotesData.editedRouteObjId !== m_RouteObjId ) && ( 2 !== g_TravelNotesData.travel.editedRoute.edited ) ) ? g_TravelEditor.editRoute : null,
				param: m_RouteObjId
			},
			{
				context : g_TravelEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Delete this route" ), 
				action : ( (m_RouteObjId) && ( 2 !== g_TravelNotesData.travel.editedRoute.edited ) ) ? g_TravelEditor.removeRoute : null,
				param: m_RouteObjId
			},
			{
				context : g_RouteEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Hide this route" ), 
				action : ( g_TravelNotesData.travel.editedRoute.objId !== m_RouteObjId ) ? g_RouteEditor.hideRoute : null,
				param: m_RouteObjId
			},
			{
				context : g_WayPointEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Add a waypoint on the route" ), 
				action : ( -1 !== g_TravelNotesData.editedRouteObjId ) ? g_WayPointEditor.addWayPointOnRoute : null,
				param: m_RouteObjId
			},
			{
				context : g_NoteEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Add a note on the route" ), 
				action : g_NoteEditor.newRouteNote,
				param: m_RouteObjId
			},
			{
				context : g_RouteEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Properties" ), 
				action : g_RouteEditor.routeProperties,
				param: m_RouteObjId
			},
			{
				context : g_MapEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Zoom to route" ), 
				action : g_MapEditor.zoomToRoute,
				param: m_RouteObjId
			},
			{ 
				context : g_RouteEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Save modifications on this route" ), 
				action : ( g_TravelNotesData.travel.editedRoute.objId === m_RouteObjId ) ? g_RouteEditor.saveEdition : null,
			},
			{ 
				context : g_RouteEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Cancel modifications on this route" ), 
				action : ( g_TravelNotesData.travel.editedRoute.objId === m_RouteObjId ) ? g_RouteEditor.cancelEdition : null
			}
		];
	}
	
	/*
	--- RouteContextMenu object function ------------------------------------------------------------------------------
	-------------------------------------------------------------------------------------------------------------------
	*/

	let routeContextMenu = newBaseContextMenu ( event );
	routeContextMenu.init ( m_GetMenuItems ( ) );
	
	return Object.seal ( routeContextMenu );
}

/*
--- End of RouteContextMenu.js file -----------------------------------------------------------------------------------
*/		