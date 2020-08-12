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
Changes:
	- v1.6.0:
		- created
		- Issue #69 : ContextMenu and ContextMenuFactory are unclear.
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20200727
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file NoteContextMenu.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module NoteContextMenu
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { newBaseContextMenu } from '../contextMenus/BaseContextMenu.js';
import { theDataSearchEngine } from '../data/DataSearchEngine.js';
import { theNoteEditor } from '../core/NoteEditor.js';
import { newZoomer } from '../core/Zoomer.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theTranslator } from '../UI/Translator.js';

import { ZERO, INVALID_OBJ_ID } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewNoteContextMenu
@desc constructor of NoteContextMenu objects
@param  {event} contextMenuEvent the event that have triggered the menu (can be a JS event or a Leaflet event)
@param {HTMLElement} [parentDiv] the html element in witch the menu will be added.
When null, the body of the html page is selected
@return {NoteContextMenu} an instance of a NoteContextMenu object
@listens mouseenter mouseleave click keydown keypress keyup
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewNoteContextMenu ( contextMenuEvent, parentDiv ) {

	let myNoteObjId = contextMenuEvent.noteObjId || contextMenuEvent.target.objId;
	let myZoomer = newZoomer ( );

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myGetMenuItems
	@desc get an array with the menu items
	@return {array.Object} the menu items
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myGetMenuItems ( ) {

		let route = theDataSearchEngine.getNoteAndRoute ( myNoteObjId ).route;

		return [
			{
				context : theNoteEditor,
				name : theTranslator.getText ( 'NoteContextMenu - Edit this note' ),
				action : theNoteEditor.editNote,
				param : myNoteObjId
			},
			{
				context : theNoteEditor,
				name : theTranslator.getText ( 'NoteContextMenu - Delete this note' ),
				action : theNoteEditor.removeNote,
				param : myNoteObjId
			},
			{
				context : myZoomer,
				name : theTranslator.getText ( 'NoteContextMenu - Zoom to note' ),
				action : myZoomer.zoomToNote,
				param : myNoteObjId
			},
			{
				context : theNoteEditor,
				name :
					route
						?
						theTranslator.getText ( 'NoteContextMenu - Detach note from route' )
						:
						theTranslator.getText ( 'NoteContextMenu - Attach note to route' ),
				action :
					theTravelNotesData.travel.routes.length !== ZERO
					&&
					INVALID_OBJ_ID === theTravelNotesData.editedRouteObjId
						?
						( route ? theNoteEditor.detachNoteFromRoute : theNoteEditor.attachNoteToRoute )
						:
						null,
				param : myNoteObjId
			}
		];
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class NoteContextMenu
	@classdesc a BaseContextMenu object with items completed for Notes
	@see {@link newNoteContextMenu} for constructor
	@augments BaseContextMenu
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	let noteContextMenu = newBaseContextMenu ( contextMenuEvent, myGetMenuItems ( ), parentDiv );

	return Object.seal ( noteContextMenu );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newNoteContextMenu
	@desc constructor of NoteContextMenu objects
	@param  {event} contextMenuEvent the event that have triggered the menu (can be a JS event or a Leaflet event)
	@param {HTMLElement} [parentDiv] the html element in witch the menu will be added.
	When null, the body of the html page is selected
	@return {NoteContextMenu} an instance of a NoteContextMenu object
	@listens mouseenter mouseleave click keydown keypress keyup
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewNoteContextMenu as newNoteContextMenu
};

/*
--- End of NoteContextMenu.js file --------------------------------------------------------------------------------------------
*/