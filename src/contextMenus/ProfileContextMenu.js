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
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewProfileContextMenu
@desc constructor of WayPointContextMenu objects
@param  {event} contextMenuEvent the event that have triggered the menu (can be a JS event or a Leaflet event)
@return {ProfileContextMenu} an instance of a ProfileContextMenu object
@listens mouseenter mouseleave click keydown keypress keyup
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewProfileContextMenu ( contextMenuEvent ) {

	let zoomer = new Zoomer ( );

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myGetMenuItems
	@desc get an array with the menu items
	@return {array.<MenuItem>} the menu items
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myGetMenuItems ( ) {
		return [
			{
				context : theNoteEditor,
				name : theTranslator.getText ( 'ProfileContextMenu - Add a note to the route at this point' ),
				action : theNoteEditor.newRouteNote,
				param : {
					routeObjId : contextMenuEvent.routeObjId,
					lat : contextMenuEvent.latlng.lat,
					lng : contextMenuEvent.latlng.lng
				}
			},
			{
				context : zoomer,
				name : theTranslator.getText ( 'ProfileContextMenu - Zoom to this point' ),
				action : zoomer.zoomToLatLng,
				param : [ contextMenuEvent.latlng.lat, contextMenuEvent.latlng.lng ]
			}
		];
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class ProfileContextMenu
	@classdesc a BaseContextMenu object with items completed for ProfileWindows
	@see {@link newProfileContextMenu} for constructor
	@augments BaseContextMenu
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	return new BaseContextMenu ( contextMenuEvent, myGetMenuItems ( ) );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newProfileContextMenu
	@desc constructor of ProfileContextMenu objects
	@param  {event} contextMenuEvent the event that have triggered the menu (can be a JS event or a Leaflet event)
	@return {ProfileContextMenu} an instance of a ProfileContextMenu object
	@listens mouseenter mouseleave click keydown keypress keyup
	@global

	@--------------------------------------------------------------------------------------------------------------------------

	*/

	ourNewProfileContextMenu as newProfileContextMenu
};