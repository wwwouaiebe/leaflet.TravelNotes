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
Doc reviewed 20210727
Tests ...
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

@module TempWayPointMarkerEventListeners
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTravelNotesData from '../data/TravelNotesData.js';
import RouteContextMenu from '../contextMenus/RouteContextMenu.js';
import theWayPointEditor from '../core/WayPointEditor.js';

import { ZERO, ONE } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TempWayPointMarkerEventListeners
@classdesc This class contains the event listeners for the temp waypoint
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TempWayPointMarkerEventListeners {

	static tempWayPointMarker = null;
	static tempWayPointInitialLatLng = null;

	/**
	mouseout event listener
	@listens mouseout
	*/

	static onMouseOut ( ) {
		if ( TempWayPointMarkerEventListeners.tempWayPointMarker ) {
			window.L.DomEvent.off ( TempWayPointMarkerEventListeners.tempWayPointMarker );
			theTravelNotesData.map.removeLayer ( TempWayPointMarkerEventListeners.tempWayPointMarker );
			TempWayPointMarkerEventListeners.tempWayPointMarker = null;
		}
	}

	/**
	dragstart event listener
	@listens dragstart
	*/

	static onDragStart ( ) {
		window.L.DomEvent.off (
			TempWayPointMarkerEventListeners.tempWayPointMarker,
			'mouseout',
			TempWayPointMarkerEventListeners.onMouseOut
		);
	}

	/**
	contextmenu event listener
	@listens contextmenu
	*/

	static onContextMenu ( contextMenuEvent ) {
		contextMenuEvent.latlng.lat = TempWayPointMarkerEventListeners.tempWayPointInitialLatLng [ ZERO ];
		contextMenuEvent.latlng.lng = TempWayPointMarkerEventListeners.tempWayPointInitialLatLng [ ONE ];
		contextMenuEvent.target.objId = theTravelNotesData.travel.editedRoute.objId;
		new RouteContextMenu ( contextMenuEvent ).show ( );
	}

	/**
	dragend event listener
	@listens dragend
	@private
	*/

	static onDragEnd ( dragEndEvent ) {
		theWayPointEditor.addWayPointOnRoute (
			TempWayPointMarkerEventListeners.tempWayPointInitialLatLng,
			[ dragEndEvent.target.getLatLng ( ).lat, dragEndEvent.target.getLatLng ( ).lng ]
		);
		if ( TempWayPointMarkerEventListeners.tempWayPointMarker ) {
			window.L.DomEvent.off (
				TempWayPointMarkerEventListeners.tempWayPointMarker,
				'dragstart',
				TempWayPointMarkerEventListeners.onDragStart
			);
			window.L.DomEvent.off (
				TempWayPointMarkerEventListeners.tempWayPointMarker,
				'dragend',
				TempWayPointMarkerEventListeners.onDragEnd
			);
			window.L.DomEvent.off (
				TempWayPointMarkerEventListeners.tempWayPointMarker,
				'contextmenu',
				TempWayPointMarkerEventListeners.onContextMenu
			);
			theTravelNotesData.map.removeLayer ( TempWayPointMarkerEventListeners.tempWayPointMarker );
			TempWayPointMarkerEventListeners.tempWayPointMarker = null;
		}
	}
}

export default TempWayPointMarkerEventListeners;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of TempWayPointMarkerEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/