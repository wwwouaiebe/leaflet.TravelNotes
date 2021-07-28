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
		- Issue ♯120 : Review the UserInterface
Doc reviewed 20200825
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file ProfileContextMenu.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module ProfileContextMenu
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import BaseContextMenu from '../contextMenus/BaseContextMenu.js';
import theTranslator from '../UI/Translator.js';
import theNoteEditor from '../core/NoteEditor.js';
import Zoomer from '../core/Zoomer.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class ProfileContextMenu
@classdesc this class implements the BaseContextMenu class for the profiles
@implements {BaseContextMenu}
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class ProfileContextMenu extends BaseContextMenu {

	#contextMenuEvent = null;

	constructor ( contextMenuEvent, parentDiv = null ) {
		super ( contextMenuEvent, parentDiv );
		this.#contextMenuEvent = contextMenuEvent;
		this.menuItems =
		[
			{
				itemText : theTranslator.getText ( 'ProfileContextMenu - Add a note to the route at this point' ),
				doAction : true
			},
			{
				itemText : theTranslator.getText ( 'ProfileContextMenu - Zoom to this point' ),
				doAction : true
			}
		];
	}

	/* eslint-disable no-magic-numbers */

	doAction ( selectedItemObjId ) {
		switch ( selectedItemObjId ) {
		case 0 :
			theNoteEditor.newRouteNote (
				{
					routeObjId : this.#contextMenuEvent.routeObjId,
					lat : this.#contextMenuEvent.latlng.lat,
					lng : this.#contextMenuEvent.latlng.lng
				}
			);
			break;
		case 1 :
			new Zoomer ( ).zoomToLatLng ( [ this.#contextMenuEvent.latlng.lat, this.#contextMenuEvent.latlng.lng ] );
			break;
		default :
			break;
		}
	}

	/* eslint-enable no-magic-numbers */

}

export default ProfileContextMenu;