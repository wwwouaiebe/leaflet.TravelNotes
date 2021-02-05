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
Doc reviewed 20200727
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file ManeuverContextMenu.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module ManeuverContextMenu
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { newBaseContextMenu } from '../contextMenus/BaseContextMenu.js';
import { newZoomer } from '../core/Zoomer.js';
import { theTranslator } from '../UI/Translator.js';

/*
import { theNoteEditor } from '../core/NoteEditor.js';
import { theRouteEditor } from '../core/RouteEditor.js';
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewManeuverContextMenu
@desc constructor of ManeuverContextMenu objects
@param  {event} contextMenuEvent the event that have triggered the menu (can be a JS event or a Leaflet event)
@param {HTMLElement} [parentDiv] the html element in witch the menu will be added.
When null, the body of the html page is selected
@return {ManeuverContextMenu} an instance of a ManeuverContextMenu object
@listens mouseenter mouseleave click keydown keypress keyup
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewManeuverContextMenu ( contextMenuEvent, parentDiv ) {

	let myManeuverObjId = contextMenuEvent.maneuverObjId;
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

		return [

			/*
			{
				context : theNoteEditor,
				name : theTranslator.getText ( 'ManeuverContextMenu - Replace with a maneuver note' ),
				action : theNoteEditor.newManeuverNote,
				param : myManeuverObjId
			},
			{
				context : theRouteEditor,
				name : theTranslator.getText ( 'ManeuverContextMenu - Delete this maneuver' ),
				action : theRouteEditor.removeManeuver,
				param : myManeuverObjId
			},
			*/

			{
				context : myZoomer,
				name : theTranslator.getText ( 'ManeuverContextMenu - Zoom to this maneuver' ),
				action : myZoomer.zoomToManeuver,
				param : myManeuverObjId
			}
		];
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class ManeuverContextMenu
	@classdesc a BaseContextMenu object with items completed for maneuvers
	@see {@link newManeuverContextMenu} for constructor
	@augments BaseContextMenu
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	return newBaseContextMenu ( contextMenuEvent, myGetMenuItems ( ), parentDiv );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newManeuverContextMenu
	@desc constructor of ManeuverContextMenu objects
	@param  {event} contextMenuEvent the event that have triggered the menu (can be a JS event or a Leaflet event)
	@param {HTMLElement} [parentDiv] the html element in witch the menu will be added.
	When null, the body of the html page is selected
	@return {ManeuverContextMenu} an instance of a ManeuverContextMenu object
	@listens mouseenter mouseleave click keydown keypress keyup
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewManeuverContextMenu as newManeuverContextMenu
};

/*
--- End of ManeuverContextMenu.js file ----------------------------------------------------------------------------------------
*/