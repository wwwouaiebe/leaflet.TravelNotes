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
Doc reviewed 20191124
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newBaseContextMenu } from '../contextMenus/BaseContextMenu.js';
import { theWayPointEditor } from '../core/WayPointEditor.js';
import { theNoteEditor } from '../core/NoteEditor.js';
import { theRouteEditor } from '../core/RouteEditor.js';
import { theTravelEditor } from '../core/TravelEditor.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theTranslator } from '../UI/Translator.js';

/*
--- newRouteContextMenu function --------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newRouteContextMenu ( contextMenuEvent ) {

	let myRouteObjId = contextMenuEvent.target.objId;

	/*
	--- myGetMenuItems function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetMenuItems ( ) {
		return [
			{
				context : theRouteEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Edit this route' ),
				action :
					(
						( theTravelNotesData.editedRouteObjId !== myRouteObjId )
						&& ( 2 !== theTravelNotesData.travel.editedRoute.edited )
					) ?
						theTravelEditor.editRoute
						:
						null,
				param : myRouteObjId
			},
			{
				context : theTravelEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Delete this route' ),
				action :
					(
						( myRouteObjId )
						&&
						( 2 !== theTravelNotesData.travel.editedRoute.edited )
					)
						?
						theTravelEditor.removeRoute
						:
						null,
				param : myRouteObjId
			},
			{
				context : theRouteEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Hide this route' ),
				action :
					( theTravelNotesData.travel.editedRoute.objId === myRouteObjId )
						?
						null :
						theRouteEditor.hideRoute,
				param : myRouteObjId
			},
			{
				context : theWayPointEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Add a waypoint on the route' ),
				action : ( -1 === theTravelNotesData.editedRouteObjId ) ? null : theWayPointEditor.addWayPointOnRoute,
				param : myRouteObjId
			},
			{
				context : theNoteEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Add a note on the route' ),
				action : theNoteEditor.newRouteNote,
				param : myRouteObjId
			},
			{
				context : theRouteEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Properties' ),
				action : theRouteEditor.routeProperties,
				param : myRouteObjId
			},
			{
				context : theRouteEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Zoom to route' ),
				action : theRouteEditor.zoomToRoute,
				param : myRouteObjId
			},
			{
				context : theRouteEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Save modifications on this route' ),
				action : ( theTravelNotesData.travel.editedRoute.objId === myRouteObjId ) ? theRouteEditor.saveEdition : null
			},
			{
				context : theRouteEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Cancel modifications on this route' ),
				action : ( theTravelNotesData.travel.editedRoute.objId === myRouteObjId ) ? theRouteEditor.cancelEdition : null
			}
		];
	}

	/*
	--- RouteContextMenu object function ------------------------------------------------------------------------------
	-------------------------------------------------------------------------------------------------------------------
	*/

	let routeContextMenu = newBaseContextMenu ( event );
	routeContextMenu.init ( myGetMenuItems ( ) );

	return Object.seal ( routeContextMenu );
}

export { newRouteContextMenu };

/*
--- End of RouteContextMenu.js file -----------------------------------------------------------------------------------
*/