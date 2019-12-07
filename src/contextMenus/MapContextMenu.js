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

import { newBaseContextMenu } from '../contextMenus/BaseContextMenu.js';
import { theWayPointEditor } from '../core/WayPointEditor.js';
import { theNoteEditor } from '../core/NoteEditor.js';
import { theRouteEditor } from '../core/RouteEditor.js';
import { theTravelEditor } from '../core/TravelEditor.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theTranslator } from '../UI/Translator.js';
import { newAboutDialog } from '../dialogs/AboutDialog.js';

import  { OUR_CONST } from '../util/Constants.js';

/*
--- newMapContextMenu function ----------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newMapContextMenu ( contextMenuEvent ) {

	let myLatLng = [ contextMenuEvent.latlng.lat, contextMenuEvent.latlng.lng ];

	/*
	--- myGetMenuItems function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetMenuItems ( ) {
		return [
			{
				context : theWayPointEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Select this point as start point' ),
				action :
					( OUR_CONST.invalidObjId !== theTravelNotesData.editedRouteObjId )
					&&
					( 0 === theTravelNotesData.travel.editedRoute.wayPoints.first.lat )
						?
						theWayPointEditor.setStartPoint
						:
						null,
				param : myLatLng
			},
			{
				context : theWayPointEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Select this point as way point' ),
				action : ( OUR_CONST.invalidObjId === theTravelNotesData.editedRouteObjId ) ? null : theWayPointEditor.addWayPoint,
				param : myLatLng
			},
			{
				context : theWayPointEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Select this point as end point' ),
				action :
					( OUR_CONST.invalidObjId !== theTravelNotesData.editedRouteObjId )
					&&
					( 0 === theTravelNotesData.travel.editedRoute.wayPoints.last.lat )
						?
						theWayPointEditor.setEndPoint
						:
						null,
				param : myLatLng
			},
			{
				context : theNoteEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - New travel note' ),
				action : theNoteEditor.newTravelNote,
				param : myLatLng
			},
			{
				context : theNoteEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Hide notes' ),
				action : theNoteEditor.hideNotes
			},
			{
				context : theNoteEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Show notes' ),
				action : theNoteEditor.showNotes
			},
			{
				context : theRouteEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Show all routes' ),
				action : theRouteEditor.showRoutes
			},
			{
				context : theTravelEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Zoom to travel' ),
				action : theTravelEditor.zoomToTravel
			},
			{
				context : null,
				name : theTranslator.getText ( 'ContextMenuFactory - About Travel & Notes' ),
				action : newAboutDialog
			}
		];
	}

	/*
	--- MapContextMenu object function --------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	let mapContextMenu = newBaseContextMenu ( contextMenuEvent );

	mapContextMenu.init ( myGetMenuItems ( ) );

	return Object.seal ( mapContextMenu );
}

export { newMapContextMenu };

/*
--- End of BaseContextMenu.js file ------------------------------------------------------------------------------------
*/