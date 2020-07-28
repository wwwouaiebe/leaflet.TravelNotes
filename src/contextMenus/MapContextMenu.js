/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/**
@----------------------------------------------------------------------------------------------------------------------

@file MapContextMenu.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License

@----------------------------------------------------------------------------------------------------------------------
*/

/**
@----------------------------------------------------------------------------------------------------------------------

@module MapContextMenu

@----------------------------------------------------------------------------------------------------------------------
*/

import { newBaseContextMenu } from '../contextMenus/BaseContextMenu.js';
import { theWayPointEditor } from '../core/WayPointEditor.js';
import { theNoteEditor } from '../core/NoteEditor.js';
import { theRouteEditor } from '../core/RouteEditor.js';
import { theTravelEditor } from '../core/TravelEditor.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theTranslator } from '../UI/Translator.js';
import { newAboutDialog } from '../dialogs/AboutDialog.js';
import { newZoomer } from '../core/Zoomer.js';

import { LAT_LNG, INVALID_OBJ_ID } from '../util/Constants.js';

/**
@----------------------------------------------------------------------------------------------------------------------

@function newMapContextMenu
@desc constructor of MapContextMenu objects
@param  {event} contextMenuEvent the event that have triggered the menu (can be a JS event or a Leaflet event)
@return {Object} an instance of a MapContextMenu object
@listens mouseenter mouseleave click keydown keypress keyup
@private

@----------------------------------------------------------------------------------------------------------------------
*/

function newMapContextMenu ( contextMenuEvent ) {

	let myLatLng = [ contextMenuEvent.latlng.lat, contextMenuEvent.latlng.lng ];
	let myZoomer = newZoomer ( );

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function myGetMenuItems
	@desc get an array with the menu items
	@return {array.Object} the menu items
	@private

	@------------------------------------------------------------------------------------------------------------------
	*/

	function myGetMenuItems ( ) {
		return [
			{
				context : theWayPointEditor,
				name : theTranslator.getText ( 'MapContextMenu - Select this point as start point' ),
				action :
					( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId )
					&&
					( LAT_LNG.defaultValue === theTravelNotesData.travel.editedRoute.wayPoints.first.lat )
						?
						theWayPointEditor.setStartPoint
						:
						null,
				param : myLatLng
			},
			{
				context : theWayPointEditor,
				name : theTranslator.getText ( 'MapContextMenu - Select this point as way point' ),
				action :
					( INVALID_OBJ_ID === theTravelNotesData.editedRouteObjId )
						?
						null
						:
						theWayPointEditor.addWayPoint,
				param : myLatLng
			},
			{
				context : theWayPointEditor,
				name : theTranslator.getText ( 'MapContextMenu - Select this point as end point' ),
				action :
					( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId )
					&&
					( LAT_LNG.defaultValue === theTravelNotesData.travel.editedRoute.wayPoints.last.lat )
						?
						theWayPointEditor.setEndPoint
						:
						null,
				param : myLatLng
			},
			{
				context : theTravelEditor,
				name : theTranslator.getText ( 'MapContextMenu - Add a route' ),
				action : theTravelEditor.addRoute
			},
			{
				context : theRouteEditor,
				name : theTranslator.getText ( 'MapContextMenu - Hide all routes' ),
				action : theRouteEditor.hideRoutes
			},
			{
				context : theRouteEditor,
				name : theTranslator.getText ( 'MapContextMenu - Show all routes' ),
				action : theRouteEditor.showRoutes
			},
			{
				context : theNoteEditor,
				name : theTranslator.getText ( 'MapContextMenu - New travel note' ),
				action : theNoteEditor.newTravelNote,
				param : myLatLng
			},
			{
				context : theNoteEditor,
				name : theTranslator.getText ( 'MapContextMenu - Hide all notes' ),
				action : theNoteEditor.hideNotes
			},
			{
				context : theNoteEditor,
				name : theTranslator.getText ( 'MapContextMenu - Show all notes' ),
				action : theNoteEditor.showNotes
			},
			{
				context : myZoomer,
				name : theTranslator.getText ( 'MapContextMenu - Zoom to travel' ),
				action : myZoomer.zoomToTravel
			},
			{
				context : null,
				name : theTranslator.getText ( 'MapContextMenu - About Travel & Notes' ),
				action : newAboutDialog
			}
		];
	}

	/**
	@------------------------------------------------------------------------------------------------------------------
	 
	@class MapContextMenu
	@classdesc a BaseContextMenu object with items completed for maps
	@see BaseContextMenu
	@hideconstructor
	
	@------------------------------------------------------------------------------------------------------------------
	*/

	let mapContextMenu = newBaseContextMenu ( contextMenuEvent );
	mapContextMenu.init ( myGetMenuItems ( ) );

	return Object.seal ( mapContextMenu );
}

export {

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function newMapContextMenu
	@desc constructor of MapContextMenu objects
	@param  {event} contextMenuEvent the event that have triggered the menu (can be a JS event or a Leaflet event)
	@return {Object} an instance of a MapContextMenu object
	@listens mouseenter mouseleave click keydown keypress keyup

	@------------------------------------------------------------------------------------------------------------------
	*/

	newMapContextMenu
};

/*
--- End of MapContextMenu.js file ------------------------------------------------------------------------------------
*/