/*
Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/

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
Changes:
	- v1.12.0:
		- created
	- v1.13.0:
		- Issue #126 : Add a command "select as start/end/intermediate point" in the osmSearch context menu
		- Issue #128 : Unify osmSearch and notes icons and data
Doc reviewed 20200727
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file OsmSearchContextMenu.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module OsmSearchContextMenu
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { newBaseContextMenu } from '../contextMenus/BaseContextMenu.js';
import theNoteEditor from '../core/NoteEditor.js';
import { newZoomer } from '../core/Zoomer.js';
import { theTranslator } from '../UI/Translator.js';
import { theWayPointEditor } from '../core/WayPointEditor.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import { LAT_LNG, INVALID_OBJ_ID } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewOsmSearchContextMenu
@desc constructor of OsmSearchContextMenu objects
@param  {event} contextMenuEvent the event that have triggered the menu (can be a JS event or a Leaflet event)
@param {HTMLElement} [parentDiv] the html element in witch the menu will be added.
When null, the body of the html page is selected
@return {OsmSearchContextMenu} an instance of a OsmSearchContextMenu object
@listens mouseenter mouseleave click keydown keypress keyup
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewOsmSearchContextMenu ( contextMenuEvent, parentDiv ) {

	let myZoomer = newZoomer ( );

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myGetMenuItems
	@desc get an array with the menu items
	@return {array.<MenuItem>} the menu items
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myGetMenuItems ( ) {

		let latLng = contextMenuEvent.originalEvent.latLng;

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
				param : latLng
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
				param : latLng
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
				param : latLng
			},
			{
				context : theNoteEditor,
				name : theTranslator.getText ( 'OsmSearchContextMenu - Create a route note with this result' ),
				action : theNoteEditor.newSearchNote,
				param : { osmElement : contextMenuEvent.originalEvent.osmElement, isTravelNote : false }
			},
			{
				context : theNoteEditor,
				name : theTranslator.getText ( 'OsmSearchContextMenu - Create a travel note with this result' ),
				action : theNoteEditor.newSearchNote,
				param : { osmElement : contextMenuEvent.originalEvent.osmElement, isTravelNote : true }
			},
			{
				context : theNoteEditor,
				name : theNoteEditor.osmSearchNoteDialog
					?
					theTranslator.getText ( 'OsmSearchContextMenu - Hide note dialog' )
					:
					theTranslator.getText ( 'OsmSearchContextMenu - Show note dialog' ),
				action : theNoteEditor.changeOsmSearchNoteDialog
			},
			{
				context : myZoomer,
				name : theTranslator.getText ( 'OsmSearchContextMenu - Zoom to this result' ),
				action : myZoomer.zoomToPoi,
				param : {
					latLng : contextMenuEvent.originalEvent.latLng,
					geometry : contextMenuEvent.originalEvent.geometry
				}
			}
		];
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class OsmSearchContextMenu
	@classdesc a BaseContextMenu object with items completed for OsmSearch items
	@see {@link newOsmSearchContextMenu} for constructor
	@augments BaseContextMenu
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	return newBaseContextMenu ( contextMenuEvent, myGetMenuItems ( ), parentDiv );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newOsmSearchContextMenu
	@desc constructor of OsmSearchContextMenu objects
	@param  {event} contextMenuEvent the event that have triggered the menu (can be a JS event or a Leaflet event)
	@param {HTMLElement} [parentDiv] the html element in witch the menu will be added.
	When null, the body of the html page is selected
	@return {OsmSearchContextMenu} an instance of a OsmSearchContextMenu object
	@listens mouseenter mouseleave click keydown keypress keyup
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewOsmSearchContextMenu as newOsmSearchContextMenu
};

/*
--- End of OsmSearchContextMenu.js file ---------------------------------------------------------------------------------------
*/