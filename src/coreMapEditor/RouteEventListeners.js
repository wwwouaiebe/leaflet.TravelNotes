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

@file RouteEventListeners.js
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

import RouteContextMenu from '../contextMenus/RouteContextMenu.js';
import theDataSearchEngine from '../data/DataSearchEngine.js';
import theGeometry from '../coreLib/Geometry.js';
import theUtilities from '../UILib/Utilities.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import { ZERO } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class RouteMouseOverOrMoveEL
@classdesc mouseover and mousemove event listener for the routes
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class RouteMouseOverOrMoveEL {

	static handleEvent ( mapEvent ) {
		let route = theDataSearchEngine.getRoute ( mapEvent.target.objId );
		let distance = theGeometry.getClosestLatLngDistance ( route, [ mapEvent.latlng.lat, mapEvent.latlng.lng ] )
			.distance;
		distance += route.chainedDistance;
		distance = theUtilities.formatDistance ( distance );
		let polyline = theTravelNotesData.mapObjects.get ( mapEvent.target.objId );
		polyline.closeTooltip ( );
		let tooltipText = route.computedName;
		if ( ! theTravelNotesData.travel.readOnly ) {
			tooltipText += ( ZERO === tooltipText.length ? '' : ' - ' );
			tooltipText += distance;
		}
		polyline.setTooltipContent ( tooltipText );
		polyline.openTooltip ( mapEvent.latlng );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class RouteContextMenuEL
@classdesc contextmenu event listener for the routes
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class RouteContextMenuEL {

	static handleEvent ( contextMenuEvent ) {
		window.L.DomEvent.stopPropagation ( contextMenuEvent );
		new RouteContextMenu ( contextMenuEvent ).show ( );
	}
}

export {
	RouteMouseOverOrMoveEL,
	RouteContextMenuEL
};

/*
@------------------------------------------------------------------------------------------------------------------------------

end of RouteEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/