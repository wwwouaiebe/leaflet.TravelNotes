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
--- ContextMenuFactory.js file ----------------------------------------------------------------------------------------
This file contains:
	- the newContextMenuFactory object
Changes:
	- v1.4.0:
		- created
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

'use strict';

export { newContextMenuFactory };

import { g_Translator } from '../UI/Translator.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { g_WayPointEditor } from '../core/WayPointEditor.js';
import { g_MapEditor } from '../core/MapEditor.js';
import { g_RouteEditor } from '../core/RouteEditor.js';
import { g_NoteEditor } from '../core/NoteEditor.js';
import { g_TravelEditor } from '../core/TravelEditor.js';

import { newAboutDialog } from '../UI/AboutDialog.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';


/*
--- newContextMenuFactory function ------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

var newContextMenuFactory = function ( ) {
	
		/*
	--- m_GetMapContextMenu function ----------------------------------------------------------------------------------

	This function gives the route part of the map context menu
	
	parameters:
	- latLng : the coordinates where the map was clicked

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_GetMapContextMenu = function ( latLng ) {
		return [
			{ 
				context : g_WayPointEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Select this point as start point" ), 
				action : ( -1 !== g_TravelNotesData.editedRouteObjId ) && ( 0 === g_TravelNotesData.travel.editedRoute.wayPoints.first.lat ) ? g_WayPointEditor.setStartPoint : null,
				param : latLng
			},
			{
				context : g_WayPointEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Select this point as way point" ), 
				action : ( -1 !== g_TravelNotesData.editedRouteObjId ) ? g_WayPointEditor.addWayPoint : null,
				param : latLng
			},
			{ 
				context : g_WayPointEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Select this point as end point" ), 
				action : ( -1 !== g_TravelNotesData.editedRouteObjId ) && ( 0 === g_TravelNotesData.travel.editedRoute.wayPoints.last.lat ) ? g_WayPointEditor.setEndPoint : null,
				param : latLng
			},
			{ 
				context : g_NoteEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - New travel note" ), 
				action : g_NoteEditor.newTravelNote,
				param : latLng
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
				context : g_MapEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Zoom to travel" ), 
				action : g_MapEditor.zoomToTravel
			},
			{ 
				context : null,
				name : g_Translator.getText ( "ContextMenuFactory - About Travel & Notes" ), 
				action : newAboutDialog
			} 
		];
	};

	/*
	--- m_GetWayPointContextMenu function -----------------------------------------------------------------------------

	This function gives the wayPoint context menu
	
	parameters:
	- wayPointObjId : the wayPoint objId that was clicked

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_GetWayPointContextMenu = function ( wayPointObjId ) {
		return [
			{ 
				context : g_WayPointEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Delete this waypoint" ), 
				action : ( ( g_TravelNotesData.travel.editedRoute.wayPoints.first.objId !== wayPointObjId ) && ( g_TravelNotesData.travel.editedRoute.wayPoints.last.objId !== wayPointObjId ) ) ? g_WayPointEditor.removeWayPoint : null,
				param: wayPointObjId
			} 
		];
	};
	
	/*
	--- m_GetRouteContextMenu function --------------------------------------------------------------------------------

	This function gives the route context menu
	
	parameters:
	- routeObjId : the route objId that was clicked

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_GetRouteContextMenu = function ( routeObjId ) {
		return [
			{ 
				context : g_RouteEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Edit this route" ), 
				action : ( ( g_TravelNotesData.editedRouteObjId !== routeObjId ) && ( 2 !== g_TravelNotesData.travel.editedRoute.edited ) ) ? g_TravelEditor.editRoute : null,
				param: routeObjId
			},
			{
				context : g_TravelEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Delete this route" ), 
				action : ( ( g_TravelNotesData.editedRouteObjId !== routeObjId ) && ( 2 !== g_TravelNotesData.travel.editedRoute.edited ) ) ? g_TravelEditor.removeRoute : null,
				param: routeObjId
			},
			{
				context : g_RouteEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Hide this route" ), 
				action : ( g_TravelNotesData.travel.editedRoute.objId !== routeObjId ) ? g_RouteEditor.hideRoute : null,
				param: routeObjId
			},
			{
				context : g_WayPointEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Add a waypoint on the route" ), 
				action : ( -1 !== g_TravelNotesData.editedRouteObjId ) ? g_WayPointEditor.addWayPointOnRoute : null,
				param: routeObjId
			},
			{
				context : g_NoteEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Add a note on the route" ), 
				action : g_NoteEditor.newRouteNote,
				param: routeObjId
			},
			{
				context : g_RouteEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Properties" ), 
				action : g_RouteEditor.routeProperties,
				param: routeObjId
			},
			{
				context : g_MapEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Zoom to route" ), 
				action : g_MapEditor.zoomToRoute,
				param: routeObjId
			},
			{ 
				context : g_RouteEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Save modifications on this route" ), 
				action : ( g_TravelNotesData.travel.editedRoute.objId === routeObjId ) ? g_RouteEditor.saveEdition : null,
			},
			{ 
				context : g_RouteEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Cancel modifications on this route" ), 
				action : ( g_TravelNotesData.travel.editedRoute.objId === routeObjId ) ? g_RouteEditor.cancelEdition : null
			}
		];
	};		

	/*
	--- m_GetNoteContextMenu function ---------------------------------------------------------------------------------

	This function gives the note context menu
	
	parameters:
	- noteObjId : the note objId that was clicked

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_GetNoteContextMenu = function ( noteObjId ) {
		var contextMenu = [];
		contextMenu.push ( 
			{ 
				context : g_NoteEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Edit this note" ), 
				action : g_NoteEditor.editNote,
				param : noteObjId
			} 
		);
		contextMenu.push ( 
			{ 
				context : g_NoteEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Delete this note" ), 
				action : g_NoteEditor.removeNote,
				param : noteObjId
			} 
		);
		contextMenu.push ( 
			{ 
				context : g_NoteEditor, 
				name : g_Translator.getText ( "ContextMenuFactory - Zoom to note" ), 
				action : g_NoteEditor.zoomToNote,
				param : noteObjId
			} 
		);
		
		var route = newDataSearchEngine ( ).getNoteAndRoute ( noteObjId ).route;
		contextMenu.push ( 
			{ 
				context : g_NoteEditor, 
				name : route ?  g_Translator.getText ( "ContextMenuFactory - Detach note from route" ) : g_Translator.getText ( "ContextMenuFactory - Attach note to route" ), 
				action : ( ( g_TravelNotesData.travel.routes.length !== 0 &&  -1 === g_TravelNotesData.editedRouteObjId ) ? ( route ? g_NoteEditor.detachNoteFromRoute : g_NoteEditor.attachNoteToRoute ) : null ),
				param : noteObjId
			} 
		);
		
		return contextMenu;
	};
	
	/*
	--- contextMenuFactory object -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	return Object.seal (
		{
			getMapContextMenu :function ( latLng ) { return m_GetMapContextMenu ( latLng ); },

			getWayPointContextMenu : function ( wayPointObjId ) { return m_GetWayPointContextMenu ( wayPointObjId ); },

			getRouteContextMenu : function ( routeObjId ) { return m_GetRouteContextMenu ( routeObjId ); },
			
			getNoteContextMenu : function ( noteObjId ) { return m_GetNoteContextMenu ( noteObjId ) ; }
		}
	);
};

/*
--- End of ContextMenuFactory.js file ---------------------------------------------------------------------------------
*/		