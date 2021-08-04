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
Doc reviewed ...
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file BaseDialogBackgroundEventListeners.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module BaseDialogBackgroundEventListeners
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theGeometry from '../util/Geometry.js';
import theTravelNotesData from '../data/TravelNotesData.js';

import { ZERO, ONE, LAT_LNG } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class BaseDialogBackgroundEventListeners
@classdesc Mouse event listeners on the background of the dialog boxes. Pan and zoom on the map.
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class BaseDialogBackgroundEventListeners {

	/**
	pan variables
	@private
	*/

	static #panMapData = {
		panOngoing : false,
		startPanX : ZERO,
		startPanY : ZERO,
		mapCenter : [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ]
	};

	/**
	mouse down on background event listener
	*/

	static onMouseDown ( mouseEvent ) {
		if ( 'TravelNotes-Background' !== mouseEvent.target.id ) {
			return;
		}

		BaseDialogBackgroundEventListeners.#panMapData.panOngoing = true;
		BaseDialogBackgroundEventListeners.#panMapData.startPanX = mouseEvent.screenX;
		BaseDialogBackgroundEventListeners.#panMapData.startPanY = mouseEvent.screenY;
		BaseDialogBackgroundEventListeners.#panMapData.mapCenter = theTravelNotesData.map.getCenter ( );
	}

	/**
	mouse move on background event listener
	*/

	static onMouseMove ( mouseEvent ) {
		if ( BaseDialogBackgroundEventListeners.#panMapData.panOngoing ) {
			mouseEvent.preventDefault ( );
			mouseEvent.stopPropagation ( );
			let latLngAtStart = theGeometry.screenCoordToLatLng (
				BaseDialogBackgroundEventListeners.#panMapData.startPanX,
				BaseDialogBackgroundEventListeners.#panMapData.startPanY
			);
			let latLngAtEnd = theGeometry.screenCoordToLatLng ( mouseEvent.screenX, mouseEvent.screenY );
			theTravelNotesData.map.panTo (
				[
					BaseDialogBackgroundEventListeners.#panMapData.mapCenter.lat +
						latLngAtStart [ ZERO ] -
						latLngAtEnd [ ZERO ],
					BaseDialogBackgroundEventListeners.#panMapData.mapCenter.lng +
						latLngAtStart [ ONE ] -
						latLngAtEnd [ ONE ]
				]
			);
		}
	}

	/**
	mouse up on background event listener
	*/

	static onMouseUp ( mouseEvent ) {
		if ( 'TravelNotes-Background' !== mouseEvent.target.id ) {
			return;
		}
		BaseDialogBackgroundEventListeners.onMouseMove ( mouseEvent );
		BaseDialogBackgroundEventListeners.#panMapData.panOngoing = false;
	}

	/**
	mouse wheel on background event listener
	*/

	static onMouseWheel ( wheelEvent ) {
		if ( 'TravelNotes-Background' !== wheelEvent.target.id ) {
			return;
		}

		let zoom = theTravelNotesData.map.getZoom ( ) + ( ZERO > wheelEvent.deltaY ? ONE : -ONE );
		zoom = Math.min ( theTravelNotesData.map.getMaxZoom ( ), zoom );
		zoom = Math.max ( theTravelNotesData.map.getMinZoom ( ), zoom );
		theTravelNotesData.map.setZoomAround (
			window.L.point ( wheelEvent.clientX, wheelEvent.clientY ),
			zoom
		);
	}

	/**
	context menu on background event listener
	*/

	static onContextMenu ( contextmenuEvent ) {
		contextmenuEvent.preventDefault ( );
	}

}

export { BaseDialogBackgroundEventListeners as theBackgroundEventListeners };

/*
@------------------------------------------------------------------------------------------------------------------------------

end of BaseDialogBackgroundEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/