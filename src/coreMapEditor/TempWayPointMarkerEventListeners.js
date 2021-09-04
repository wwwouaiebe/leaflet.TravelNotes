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

@file TempWayPointMarkerEventListeners.js
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

import theTravelNotesData from '../data/TravelNotesData.js';
import RouteContextMenu from '../contextMenus/RouteContextMenu.js';
import theWayPointEditor from '../core/WayPointEditor.js';

import { ZERO, ONE } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TempWayPointMarkerELData
@classdesc This class contains shared data by the event listeners for the temp waypoint
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TempWayPointMarkerELData {
	static marker = null;
	static initialLatLng = null;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TempWayPointMarkerMouseOutEL
@classdesc mouseout event listener for the temp waypoint marker
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TempWayPointMarkerMouseOutEL {

	static handleEvent ( ) {
		if ( TempWayPointMarkerELData.marker ) {
			window.L.DomEvent.off ( TempWayPointMarkerELData.marker );
			theTravelNotesData.map.removeLayer ( TempWayPointMarkerELData.marker );
			TempWayPointMarkerELData.marker = null;
		}
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TempWayPointMarkerDragStartEL
@classdesc dragstart event listener for the temp waypoint marker
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TempWayPointMarkerDragStartEL {

	static handleEvent ( ) {
		window.L.DomEvent.off (
			TempWayPointMarkerELData.marker,
			'mouseout',
			TempWayPointMarkerMouseOutEL.handleEvent
		);
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TempWayPointMarkerContextMenuEL
@classdesc contextmenu event listener for the temp waypoint marker
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TempWayPointMarkerContextMenuEL {

	static handleEvent ( contextMenuEvent ) {
		contextMenuEvent.latlng.lat = TempWayPointMarkerELData.initialLatLng [ ZERO ];
		contextMenuEvent.latlng.lng = TempWayPointMarkerELData.initialLatLng [ ONE ];
		contextMenuEvent.target.objId = theTravelNotesData.travel.editedRoute.objId;
		new RouteContextMenu ( contextMenuEvent ).show ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TempWayPointMarkerDragEndEL
@classdesc dragend event listener for the temp waypoint marker
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TempWayPointMarkerDragEndEL {

	static handleEvent ( dragEndEvent ) {
		theWayPointEditor.addWayPointOnRoute (
			TempWayPointMarkerELData.initialLatLng,
			[ dragEndEvent.target.getLatLng ( ).lat, dragEndEvent.target.getLatLng ( ).lng ]
		);
		if ( TempWayPointMarkerELData.marker ) {
			window.L.DomEvent.off (
				TempWayPointMarkerELData.marker,
				'dragstart',
				TempWayPointMarkerDragStartEL.handleEvent
			);
			window.L.DomEvent.off (
				TempWayPointMarkerELData.marker,
				'dragend',
				TempWayPointMarkerDragEndEL.handleEvent
			);
			window.L.DomEvent.off (
				TempWayPointMarkerELData.marker,
				'contextmenu',
				TempWayPointMarkerContextMenuEL.handleEvent
			);
			theTravelNotesData.map.removeLayer ( TempWayPointMarkerELData.marker );
			TempWayPointMarkerELData.marker = null;
		}
	}
}

export {
	TempWayPointMarkerELData,
	TempWayPointMarkerMouseOutEL,
	TempWayPointMarkerDragStartEL,
	TempWayPointMarkerContextMenuEL,
	TempWayPointMarkerDragEndEL
};

/*
@------------------------------------------------------------------------------------------------------------------------------

end of TempWayPointMarkerEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/