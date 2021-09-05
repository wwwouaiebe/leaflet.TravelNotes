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
	- v1.6.0:
		- created
		- Issue ♯69 : ContextMenu and ContextMenuFactory are unclear.
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file NoteContextMenu.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module contextMenus
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import BaseContextMenu from '../contextMenus/BaseContextMenu.js';
import theDataSearchEngine from '../data/DataSearchEngine.js';
import theNoteEditor from '../core/NoteEditor.js';
import Zoomer from '../core/Zoomer.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theTranslator from '../UILib/Translator.js';

import { INVALID_OBJ_ID } from '../main/Constants.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class NoteContextMenu
@classdesc this class implements the BaseContextMenu class for the notes
@extends BaseContextMenu
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class NoteContextMenu extends BaseContextMenu {

	#noteObjId = INVALID_OBJ_ID;
	#route = null;

	/*
	constructor
	@param {Event} contextMenuEvent. The event that have triggered the menu
	@param {Object} parentNode The parent node of the menu. Can be null for leaflet objects
	*/

	constructor ( contextMenuEvent, parentNode = null ) {
		super ( contextMenuEvent, parentNode );
		this.#noteObjId = this.eventData.targetObjId;
		this.#route = theDataSearchEngine.getNoteAndRoute ( this.#noteObjId ).route;
	}

	/* eslint-disable no-magic-numbers */

	doAction ( selectedItemObjId ) {
		switch ( selectedItemObjId ) {
		case 0 :
			theNoteEditor.editNote ( this.#noteObjId );
			break;
		case 1 :
			theNoteEditor.removeNote ( this.#noteObjId );
			break;
		case 2 :
			new Zoomer ( ).zoomToNote ( this.#noteObjId );
			break;
		case 3 :
			if ( this.#route ) {
				theNoteEditor.detachNoteFromRoute ( this.#noteObjId );
			}
			else {
				theNoteEditor.attachNoteToRoute ( this.#noteObjId );
			}
			break;
		default :
			break;
		}
	}

	/* eslint-enable no-magic-numbers */

	get menuItems ( ) {
		return [
			{
				itemText : theTranslator.getText ( 'NoteContextMenu - Edit this note' ),
				isActive : true
			},
			{
				itemText : theTranslator.getText ( 'NoteContextMenu - Delete this note' ),
				isActive : true
			},
			{
				itemText : theTranslator.getText ( 'NoteContextMenu - Zoom to note' ),
				isActive : true
			},
			{
				itemText : theTranslator.getText (
					this.#route
						?
						'NoteContextMenu - Detach note from route'
						:
						'NoteContextMenu - Attach note to route'
				),
				isActive : INVALID_OBJ_ID === theTravelNotesData.editedRouteObjId
			}
		];
	}
}

export default NoteContextMenu;

/*
--- End of NoteContextMenu.js file --------------------------------------------------------------------------------------------
*/