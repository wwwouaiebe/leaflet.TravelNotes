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
--- OsmSearchContextMenu.js file --------------------------------------------------------------------------------------
This file contains:
	- the newOsmSearchContextMenu function
Changes:
	- v1.12.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newBaseContextMenu } from '../contextMenus/BaseContextMenu.js';
import { theNoteEditor } from '../core/NoteEditor.js';
import { newZoomer } from '../core/Zoomer.js';
import { theTranslator } from '../UI/Translator.js';

/**
@----------------------------------------------------------------------------------------------------------------------

@file OsmSearchContextMenu.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License

@----------------------------------------------------------------------------------------------------------------------
*/

/**
@----------------------------------------------------------------------------------------------------------------------

@module OsmSearchContextMenu

@----------------------------------------------------------------------------------------------------------------------
*/

/**
@----------------------------------------------------------------------------------------------------------------------

@function newOsmSearchContextMenu
@desc constructor of OsmSearchContextMenu objects
@param  {event} contextMenuEvent the event that have triggered the menu (can be a JS event or a Leaflet event)
@param {HTMLElement} [parentDiv] the html element in witch the menu will be added.
When null, the body of the html page is selected
@return {Object} an instance of a OsmSearchContextMenu object
@listens mouseenter mouseleave click keydown keypress keyup
@private

@----------------------------------------------------------------------------------------------------------------------
*/

function newOsmSearchContextMenu ( contextMenuEvent, parentDiv ) {

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
				context : theNoteEditor,
				name : theTranslator.getText ( 'OsmSearchContextMenu - Create a travel note with this result' ),
				action : theNoteEditor.newSearchNote,
				param : contextMenuEvent.originalEvent.searchResult
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
	@------------------------------------------------------------------------------------------------------------------
	 
	@class OsmSearchContextMenu
	@classdesc a BaseContextMenu object with items completed for OsmSearch items
	@see BaseContextMenu
	@hideconstructor
	
	@------------------------------------------------------------------------------------------------------------------
	*/

	let osmSearchContextMenu = newBaseContextMenu ( contextMenuEvent, parentDiv );
	osmSearchContextMenu.init ( myGetMenuItems ( ) );

	return Object.seal ( osmSearchContextMenu );
}

export {

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function newOsmSearchContextMenu
	@desc constructor of OsmSearchContextMenu objects
	@param  {event} contextMenuEvent the event that have triggered the menu (can be a JS event or a Leaflet event)
	@param {HTMLElement} [parentDiv] the html element in witch the menu will be added.
	When null, the body of the html page is selected
	@return {Object} an instance of a OsmSearchContextMenu object
	@listens mouseenter mouseleave click keydown keypress keyup

	@------------------------------------------------------------------------------------------------------------------
	*/

	newOsmSearchContextMenu
};

/*
--- End of OsmSearchContextMenu.js file --------------------------------------------------------------------------------
*/