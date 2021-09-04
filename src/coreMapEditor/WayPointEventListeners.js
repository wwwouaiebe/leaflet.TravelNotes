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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests 20210902
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file WayPointEventListeners.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module coreMapEditor
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theWayPointEditor from '../core/WayPointEditor.js';
import WayPointContextMenu from '../contextMenus/WayPointContextMenu.js';
import theTravelNotesData from '../data/TravelNotesData.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class WayPointContextMenuEL
@classdesc contextmenu event listener for the waypoint marker
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class WayPointContextMenuEL {

	static handleEvent ( contextMenuEvent ) {
		new WayPointContextMenu ( contextMenuEvent ).show ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class WayPointDragEndEL
@classdesc dragend event listener for the waypoint marker
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class WayPointDragEndEL {

	static handleEvent ( dragEndEvent ) {
		let draggedWayPoint = theTravelNotesData.travel.editedRoute.wayPoints.getAt ( dragEndEvent.target.objId );
		draggedWayPoint.latLng = [ dragEndEvent.target.getLatLng ( ).lat, dragEndEvent.target.getLatLng ( ).lng ];
		theWayPointEditor.wayPointDragEnd ( dragEndEvent.target.objId );
	}
}

export { WayPointContextMenuEL, WayPointDragEndEL };

/*
@------------------------------------------------------------------------------------------------------------------------------

end of WayPointEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/