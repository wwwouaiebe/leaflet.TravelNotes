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
	- the ContextMenuFactory object
	- the module.exports implementation
Changes:
	- v1.4.0:
		- created

Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var g_TravelNotesData = require ( '../L.TravelNotes' );
		
	/*
	--- contextMenuFactory function -----------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var contextMenuFactory = function ( ) {
		
			var m_MapEditor = require ( '../core/MapEditor' ) ( );
			var m_NoteEditor = require ( '../core/NoteEditor' ) ( );
			var m_RouteEditor = require ( '../core/RouteEditor' ) ( );
			var m_TravelEditor = require ( '../core/TravelEditor' ) ( );
			var m_WaypointEditor = require ( '../core/waypointEditor' ) ( );
			var m_Translator = require ( '../UI/Translator' ) ( );

			/*
		--- m_GetMapContextMenu function ------------------------------------------------------------------------------

		This function gives the route part of the map context menu
		
		parameters:
		- latLng : the coordinates where the map was clicked

		-----------------------------------------------------------------------------------------------------------
		*/

		var m_GetMapContextMenu = function ( latLng ) {
			return [
				{ 
					context : m_WaypointEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Select this point as start point" ), 
					action : ( -1 !== g_TravelNotesData.routeEdition.routeInitialObjId ) && ( 0 === g_TravelNotesData.editedRoute.wayPoints.first.lat ) ? require ( '../core/waypointEditor' ) ( ).setStartPoint : null,
					param : latLng
				},
				{
					context : m_WaypointEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Select this point as way point" ), 
					action : ( -1 !== g_TravelNotesData.routeEdition.routeInitialObjId ) ? require ( '../core/waypointEditor' ) ( ).addWayPoint : null,
					param : latLng
				},
				{ 
					context : m_WaypointEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Select this point as end point" ), 
					action : ( -1 !== g_TravelNotesData.routeEdition.routeInitialObjId ) && ( 0 === g_TravelNotesData.editedRoute.wayPoints.last.lat ) ? require ( '../core/waypointEditor' ) ( ).setEndPoint : null,
					param : latLng
				},
				{ 
					context : m_NoteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - New travel note" ), 
					action : m_NoteEditor.newTravelNote,
					param : latLng
				},
				{ 
					context : m_NoteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Hide notes" ), 
					action : m_NoteEditor.hideNotes
				},
				{ 
					context : m_NoteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Show notes" ), 
					action : m_NoteEditor.showNotes
				},
				{ 
					context : m_RouteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Show all routes" ), 
					action : m_RouteEditor.showRoutes
				}, 
				{ 
					context : m_MapEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Zoom to travel" ), 
					action : m_MapEditor.zoomToTravel
				},
				{ 
					context : null,
					name : m_Translator.getText ( "ContextMenuFactory - About Travel & Notes" ), 
					action : require ( '../UI/AboutDialog' )
				} 
			];
		};

		/*
		--- m_GetWayPointContextMenu function --------------------------------------------------------------------------

		This function gives the wayPoint context menu
		
		parameters:
		- wayPointObjId : the wayPoint objId that was clicked

		-----------------------------------------------------------------------------------------------------------
		*/

		var m_GetWayPointContextMenu = function ( wayPointObjId ) {
			return [
				{ 
					context : m_WaypointEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Delete this waypoint" ), 
					action : ( ( g_TravelNotesData.editedRoute.wayPoints.first.objId !== wayPointObjId ) && ( g_TravelNotesData.editedRoute.wayPoints.last.objId !== wayPointObjId ) ) ? require ( '../core/waypointEditor' ) ( ).removeWayPoint : null,
					param: wayPointObjId
				} 
			];
		};
		
		/*
		--- m_GetRouteContextMenu function ----------------------------------------------------------------------------

		This function gives the route context menu
		
		parameters:
		- routeObjId : the route objId that was clicked

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetRouteContextMenu = function ( routeObjId ) {
			return [
				{ 
					context : m_RouteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Edit this route" ), 
					action : ( ( g_TravelNotesData.routeEdition.routeInitialObjId !== routeObjId ) && ( ! g_TravelNotesData.routeEdition.routeChanged ) ) ? m_TravelEditor.editRoute : null,
					param: routeObjId
				},
				{
					context : m_TravelEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Delete this route" ), 
					action : ( ( g_TravelNotesData.routeEdition.routeInitialObjId !== routeObjId ) && ( ! g_TravelNotesData.routeEdition.routeChanged ) ) ? m_TravelEditor.removeRoute : null,
					param: routeObjId
				},
				{
					context : m_RouteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Hide this route" ), 
					action : ( g_TravelNotesData.editedRoute.objId !== routeObjId ) ? m_RouteEditor.hideRoute : null,
					param: routeObjId
				},
				{
					context : m_WaypointEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Add a waypoint on the route" ), 
					action : ( -1 !== g_TravelNotesData.routeEdition.routeInitialObjId ) ? m_WaypointEditor.addWayPointOnRoute : null,
					param: routeObjId
				},
				{
					context : m_NoteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Add a note on the route" ), 
					action : m_NoteEditor.newRouteNote,
					param: routeObjId
				},
				{
					context : m_RouteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Properties" ), 
					action : m_RouteEditor.routeProperties,
					param: routeObjId
				},
				{
					context : m_MapEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Zoom to route" ), 
					action : m_MapEditor.zoomToRoute,
					param: routeObjId
				},
				{ 
					context : m_RouteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Save modifications on this route" ), 
					action : ( g_TravelNotesData.editedRoute.objId === routeObjId ) ? m_RouteEditor.saveEdition : null,
				},
				{ 
					context : m_RouteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Cancel modifications on this route" ), 
					action : ( g_TravelNotesData.editedRoute.objId === routeObjId ) ? m_RouteEditor.cancelEdition : null
				}
			];
		};		

		/*
		--- m_GetNoteContextMenu function -----------------------------------------------------------------------------

		This function gives the note context menu
		
		parameters:
		- noteObjId : the note objId that was clicked

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_GetNoteContextMenu = function ( noteObjId ) {
			var contextMenu = [];
			contextMenu.push ( 
				{ 
					context : m_NoteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Edit this note" ), 
					action : m_NoteEditor.editNote,
					param : noteObjId
				} 
			);
			contextMenu.push ( 
				{ 
					context : m_NoteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Delete this note" ), 
					action : m_NoteEditor.removeNote,
					param : noteObjId
				} 
			);
			contextMenu.push ( 
				{ 
					context : m_NoteEditor, 
					name : m_Translator.getText ( "ContextMenuFactory - Zoom to note" ), 
					action : m_NoteEditor.zoomToNote,
					param : noteObjId
				} 
			);
			
			var route = require ( '../data/DataSearchEngine' ) ( ).getNoteAndRoute ( noteObjId ).route;
			contextMenu.push ( 
				{ 
					context : m_NoteEditor, 
					name : route ?  m_Translator.getText ( "ContextMenuFactory - Detach note from route" ) : m_Translator.getText ( "ContextMenuFactory - Attach note to route" ), 
					action : ( ( g_TravelNotesData.travel.routes.length !== 0 &&  -1 === g_TravelNotesData.routeEdition.routeInitialObjId ) ? ( route ? m_NoteEditor.detachNoteFromRoute : m_NoteEditor.attachNoteToRoute ) : null ),
					param : noteObjId
				} 
			);
			
			return contextMenu;
		};
		
		/*
		--- contextMenuFactory object ---------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
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
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = contextMenuFactory;
	}

}());

/*
--- End of ContextMenuFactory.js file ---------------------------------------------------------------------------------
*/		