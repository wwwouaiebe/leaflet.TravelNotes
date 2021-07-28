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

@file EditedRouteEventListeners.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module EditedRouteEventListeners
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theTranslator from '../UI/Translator.js';
import theDataSearchEngine from '../data/DataSearchEngine.js';
import TempWayPointMarkerEventListeners from '../mapEditor/TempWayPointMarkerEventListeners.js';
import { ROUTE_EDITION_STATUS, NOT_FOUND, ZERO, ONE, TWO, WAY_POINT_ICON_SIZE } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class EditedRouteEventListeners
@classdesc This class contains the event listeners for the edited route
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class EditedRouteEventListeners {

	static #showDragTooltip = ONE;

	/**
	mouseover event listener
	@listens mouseover
	*/

	static onMouseOver ( mapEvent ) {
		let route = theDataSearchEngine.getRoute ( mapEvent.target.objId );
		if ( ROUTE_EDITION_STATUS.notEdited !== route.editionStatus ) {
			TempWayPointMarkerEventListeners.tempWayPointInitialLatLng = [ mapEvent.latlng.lat, mapEvent.latlng.lng ];
			if ( TempWayPointMarkerEventListeners.tempWayPointMarker ) {
				TempWayPointMarkerEventListeners.tempWayPointMarker.setLatLng ( mapEvent.latlng );
			}
			else {

				// a HTML element is created, with different class name, depending of the waypont position.
				// See also WayPoints.css
				let iconHtml = '<div class="TravelNotes-Map-WayPoint TravelNotes-Map-WayPointTmp' +
				'"></div><div class="TravelNotes-Map-WayPointText">?</div>';

				// a leaflet marker is created...
				TempWayPointMarkerEventListeners.tempWayPointMarker = window.L.marker (
					mapEvent.latlng,
					{
						icon : window.L.divIcon (
							{
								iconSize : [ WAY_POINT_ICON_SIZE, WAY_POINT_ICON_SIZE ],
								iconAnchor : [
									WAY_POINT_ICON_SIZE / TWO,
									WAY_POINT_ICON_SIZE
								],
								html : iconHtml,
								className : 'TravelNotes-Map-WayPointStyle'
							}
						),
						draggable : true
					}
				);
				if (
					NOT_FOUND === theConfig.route.showDragTooltip
					||
					EditedRouteEventListeners.#showDragTooltip <= theConfig.route.showDragTooltip
				) {
					EditedRouteEventListeners.#showDragTooltip ++;
					TempWayPointMarkerEventListeners.tempWayPointMarker.bindTooltip (
						theTranslator.getText ( 'MapEditor - Drag and drop to add a waypoint' )
					);
					TempWayPointMarkerEventListeners.tempWayPointMarker.getTooltip ( ).options.offset = [	ZERO, ZERO ];

				}
				TempWayPointMarkerEventListeners.tempWayPointMarker.addTo ( theTravelNotesData.map );
				window.L.DomEvent.on (
					TempWayPointMarkerEventListeners.tempWayPointMarker,
					'mouseout',
					TempWayPointMarkerEventListeners.onMouseOut
				);
				window.L.DomEvent.on (
					TempWayPointMarkerEventListeners.tempWayPointMarker,
					'dragstart',
					TempWayPointMarkerEventListeners.onDragStart
				);
				window.L.DomEvent.on (
					TempWayPointMarkerEventListeners.tempWayPointMarker,
					'dragend',
					TempWayPointMarkerEventListeners.onDragEnd
				);
				window.L.DomEvent.on (
					TempWayPointMarkerEventListeners.tempWayPointMarker,
					'contextmenu',
					TempWayPointMarkerEventListeners.onContextMenu
				);
			}
		}
	}
}

export default EditedRouteEventListeners;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of EditedRouteEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/