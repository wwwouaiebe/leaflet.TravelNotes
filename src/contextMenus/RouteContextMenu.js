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
	- v1.7.0:
		- issue #89 : Add elevation graph
	- v1.8.0:
		- issue #97 : Improve adding a new waypoint to a route
	- v1.9.0:
		- issue #101 : Add a print command for a route
	- v1.11.0:
		- Issue #110 : Add a command to create a SVG icon from osm for each maneuver
Doc reviewed 20191124
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newBaseContextMenu } from '../contextMenus/BaseContextMenu.js';
import { theConfig } from '../data/Config.js';
import { theNoteEditor } from '../core/NoteEditor.js';
import { theRouteEditor } from '../core/RouteEditor.js';
import { theTravelEditor } from '../core/TravelEditor.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theTranslator } from '../UI/Translator.js';
import { newZoomer } from '../core/Zoomer.js';
import { theProfileWindowsManager } from '../core/ProfileWindowsManager.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';

import { ROUTE_EDITION_STATUS } from '../util/Constants.js';

/*
--- newRouteContextMenu function --------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newRouteContextMenu ( contextMenuEvent ) {

	let myRouteObjId = contextMenuEvent.target.objId;
	let myZoomer = newZoomer ( );

	/*
	--- myGetMenuItems function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetMenuItems ( ) {
		let menuItems = [
			{
				context : theRouteEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Edit this route' ),
				action :
					(
						( myRouteObjId === theTravelNotesData.travel.editedRoute.objId )
						|| ( ROUTE_EDITION_STATUS.editedChanged === theTravelNotesData.travel.editedRoute.edited )
					) ?
						null
						:
						theTravelEditor.editRoute,
				param : myRouteObjId
			},
			{
				context : theTravelEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Delete this route' ),
				action :
					(
						( myRouteObjId === theTravelNotesData.travel.editedRoute.objId )
						&&
						( ROUTE_EDITION_STATUS.editedChanged === theTravelNotesData.travel.editedRoute.edited )
					)
						?
						null
						:
						theTravelEditor.removeRoute,
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
				context : theNoteEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Add a note on the route' ),
				action : theNoteEditor.newRouteNote,
				param : myRouteObjId
			},
			{
				context : theNoteEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Create a note for each route maneuver' ),
				action : theNoteEditor.addAllManeuverNotes,
				param : myRouteObjId
			},
			{
				context : theRouteEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Properties' ),
				action : theRouteEditor.routeProperties,
				param : myRouteObjId
			},
			{
				context : myZoomer,
				name : theTranslator.getText ( 'ContextMenuFactory - Zoom to route' ),
				action : myZoomer.zoomToRoute,
				param : myRouteObjId
			},
			{
				context : theRouteEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - View the elevation' ),
				action :
					newDataSearchEngine ( ).getRoute ( myRouteObjId ).itinerary.hasProfile
						?
						theProfileWindowsManager.showProfile
						:
						null,
				param : myRouteObjId
			}
		];
		if ( theConfig.printRouteMap.isEnabled ) {
			menuItems.push (
				{
					context : theRouteEditor,
					name : theTranslator.getText ( 'ContextMenuFactory - Print route map' ),
					action : theRouteEditor.printRouteMap,
					param : myRouteObjId
				}
			);
		}
		menuItems = menuItems.concat (
			[
				{
					context : theRouteEditor,
					name : theTranslator.getText ( 'ContextMenuFactory - Save modifications on this route' ),
					action : ( theTravelNotesData.travel.editedRoute.objId === myRouteObjId )
						?
						theRouteEditor.saveEdition
						:
						null
				},
				{
					context : theRouteEditor,
					name : theTranslator.getText ( 'ContextMenuFactory - Cancel modifications on this route' ),
					action : ( theTravelNotesData.travel.editedRoute.objId === myRouteObjId )
						?
						theRouteEditor.cancelEdition
						:
						null
				}
			]
		);

		return menuItems;
	}

	/*
	--- RouteContextMenu object function ------------------------------------------------------------------------------
	-------------------------------------------------------------------------------------------------------------------
	*/

	let routeContextMenu = newBaseContextMenu ( contextMenuEvent );
	routeContextMenu.init ( myGetMenuItems ( ) );

	return Object.seal ( routeContextMenu );
}

export { newRouteContextMenu };

/*
--- End of RouteContextMenu.js file -----------------------------------------------------------------------------------
*/