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
--- MapContextMenu.js file --------------------------------------------------------------------------------------------
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

export { newMapContextMenu };

import { newBaseContextMenu } from '../contextMenus/BaseContextMenu.js';
import { g_WayPointEditor} from '../core/WayPointEditor.js';
import { g_NoteEditor} from '../core/NoteEditor.js';
import { g_RouteEditor} from '../core/RouteEditor.js';
import { g_TravelEditor} from '../core/TravelEditor.js';
import { g_TravelNotesData} from '../data/TravelNotesData.js';
import { g_Translator } from '../UI/Translator.js';
import { newAboutDialog } from '../dialogs/AboutDialog.js';

/*
--- newMapContextMenu function ----------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newMapContextMenu ( event ) {
	
	let m_LatLng = [ event.latlng.lat, event.latlng.lng ];

	/*
	--- m_GetMenuItems function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	function m_GetMenuItems ( ) {
		return [
			{ 
				context : g_WayPointEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Select this point as start point" ), 
				action : 
					( -1 !== g_TravelNotesData.editedRouteObjId )
					&& 
					( 0 === g_TravelNotesData.travel.editedRoute.wayPoints.first.lat ) 
						? 
						g_WayPointEditor.setStartPoint 
						: 
						null,
				param : m_LatLng
			},
			{
				context : g_WayPointEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Select this point as way point" ), 
				action : ( -1 === g_TravelNotesData.editedRouteObjId ) ? null : g_WayPointEditor.addWayPoint,
				param : m_LatLng
			},
			{ 
				context : g_WayPointEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Select this point as end point" ), 
				action : 
					( -1 !== g_TravelNotesData.editedRouteObjId ) 
					&& 
					( 0 === g_TravelNotesData.travel.editedRoute.wayPoints.last.lat ) 
						? 
						g_WayPointEditor.setEndPoint 
						:
						null,
				param : m_LatLng
			},
			{ 
				context : g_NoteEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - New travel note" ), 
				action : g_NoteEditor.newTravelNote,
				param : m_LatLng
			},
			{ 
				context : g_NoteEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Hide notes" ), 
				action : g_NoteEditor.hideNotes
			},
			{ 
				context : g_NoteEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Show notes" ), 
				action : g_NoteEditor.showNotes
			},
			{ 
				context : g_RouteEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Show all routes" ), 
				action : g_RouteEditor.showRoutes
			}, 
			{ 
				context : g_TravelEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Zoom to travel" ), 
				action : g_TravelEditor.zoomToTravel
			},
			{ 
				context : null,
				name : g_Translator.getText ( "ContextMenuFactory - About Travel & Notes" ), 
				action : newAboutDialog
			} 
		];
	}
	
	/*
	--- MapContextMenu object function --------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	let mapContextMenu = newBaseContextMenu ( event );
	
	mapContextMenu.init ( m_GetMenuItems ( ) );
	
	return Object.seal ( mapContextMenu );
}

/*
--- End of BaseContextMenu.js file ------------------------------------------------------------------------------------
*/		