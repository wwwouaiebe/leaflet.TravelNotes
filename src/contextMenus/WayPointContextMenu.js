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
--- WayPointContextMenu.js file ---------------------------------------------------------------------------------------
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
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theTranslator } from '../UI/Translator.js';

/*
--- newWayPointContextMenu function -----------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newWayPointContextMenu ( contextMenuEvent ) {

	let myWayPointObjId = contextMenuEvent.target.objId;

	/*
	--- myGetMenuItems function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetMenuItems ( ) {
		let isMidWayPoint =
			theTravelNotesData.travel.editedRoute.wayPoints.first.objId !== myWayPointObjId
			&&
			theTravelNotesData.travel.editedRoute.wayPoints.last.objId !== myWayPointObjId;
		return [
			{
				context : theWayPointEditor,
				name : theTranslator.getText ( 'ContextMenuFactory - Delete this waypoint' ),
				action : isMidWayPoint ? theWayPointEditor.removeWayPoint : null,
				param : myWayPointObjId
			}
		];
	}

	/*
	--- WayPointContextMenu object function ---------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	let wayPointContextMenu = newBaseContextMenu ( contextMenuEvent );
	wayPointContextMenu.init ( myGetMenuItems ( ) );

	return Object.seal ( wayPointContextMenu );
}

export { newWayPointContextMenu };

/*
--- End of WayPointContextMenu.js file ------------------------------------------------------------------------------------
*/