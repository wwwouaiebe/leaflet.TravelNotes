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
Doc reviewed 20200727
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file WayPointContextMenu.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module WayPointContextMenu
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { newBaseContextMenu } from '../contextMenus/BaseContextMenu.js';
import { theWayPointEditor } from '../core/WayPointEditor.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import { theTranslator } from '../UI/Translator.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewWayPointContextMenu
@desc constructor of WayPointContextMenu objects
@param  {event} contextMenuEvent the event that have triggered the menu (can be a JS event or a Leaflet event)
@return {WayPointContextMenu} an instance of a WayPointContextMenu object
@listens mouseenter mouseleave click keydown keypress keyup
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewWayPointContextMenu ( contextMenuEvent ) {

	let myWayPointObjId = contextMenuEvent.target.objId;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myGetMenuItems
	@desc get an array with the menu items
	@return {array.<MenuItem>} the menu items
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myGetMenuItems ( ) {
		let isMidWayPoint =
			theTravelNotesData.travel.editedRoute.wayPoints.first.objId !== myWayPointObjId
			&&
			theTravelNotesData.travel.editedRoute.wayPoints.last.objId !== myWayPointObjId;
		return [
			{
				context : theWayPointEditor,
				name : theTranslator.getText ( 'WayPointContextMenu - Delete this waypoint' ),
				action : isMidWayPoint ? theWayPointEditor.removeWayPoint : null,
				param : myWayPointObjId
			},
			{
				context : theWayPointEditor,
				name : theTranslator.getText ( 'WayPointContextMenu - Modify properties' ),
				action : theWayPointEditor.wayPointProperties,
				param : myWayPointObjId
			}
		];
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class WayPointContextMenu
	@classdesc a BaseContextMenu object with items completed for wayPoints
	@see {@link newWayPointContextMenu} for constructor
	@augments BaseContextMenu
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	return newBaseContextMenu ( contextMenuEvent, myGetMenuItems ( ) );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newWayPointContextMenu
	@desc constructor of WayPointContextMenu objects
	@param  {event} contextMenuEvent the event that have triggered the menu (can be a JS event or a Leaflet event)
	@return {WayPointContextMenu} an instance of a WayPointContextMenu object
	@listens mouseenter mouseleave click keydown keypress keyup
	@global

	@--------------------------------------------------------------------------------------------------------------------------

	*/

	ourNewWayPointContextMenu as newWayPointContextMenu

};

/*
--- End of WayPointContextMenu.js file ----------------------------------------------------------------------------------------
*/