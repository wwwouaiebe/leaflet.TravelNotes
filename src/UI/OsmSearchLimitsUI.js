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

@file OsmSearchLimitsUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module OsmSearchLimitsUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import ObjId from '../data/ObjId.js';
import theConfig from '../data/Config.js';
import theEventDispatcher from '../util/EventDispatcher.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theOsmSearchEngine from '../core/OsmSearchEngine.js';
import { INVALID_OBJ_ID } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class OsmSearchLimitsUI
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class OsmSearchLimitsUI {

	#previousSearchLimitObjId = INVALID_OBJ_ID;
	static #searchLimitObjId = INVALID_OBJ_ID;

	/**
	Event listener for the map zoom and pan. Redraw the next search rectangle on the map
	@fires removeobject
	@fires addrectangle
	@listens zoom
	@listens move
	@private
	*/

	static #onMapChange ( ) {
		if ( INVALID_OBJ_ID === OsmSearchLimitsUI.#searchLimitObjId ) {
			OsmSearchLimitsUI.#searchLimitObjId = ObjId.nextObjId;
		}
		else {
			theEventDispatcher.dispatch ( 'removeobject', { objId : OsmSearchLimitsUI.#searchLimitObjId } );
		}

		theEventDispatcher.dispatch (
			'addrectangle',
			{
				objId : OsmSearchLimitsUI.#searchLimitObjId,
				bounds : theOsmSearchEngine.searchBounds,
				properties : theConfig.osmSearch.nextSearchLimit
			}
		);
	}

	/**
	Draw the previous search rectangle on the map
	@fires removeobject
	@fires addrectangle
	@private
	*/

	#drawPreviousSearchlimit ( ) {
		let previousSearchBounds = theOsmSearchEngine.previousSearchBounds;
		if ( ! previousSearchBounds ) {
			return;
		}
		if ( INVALID_OBJ_ID === this.#previousSearchLimitObjId ) {
			this.#previousSearchLimitObjId = ObjId.nextObjId;
		}
		else {
			theEventDispatcher.dispatch ( 'removeobject', { objId : this.#previousSearchLimitObjId } );
		}
		theEventDispatcher.dispatch (
			'addrectangle',
			{
				objId : this.#previousSearchLimitObjId,
				bounds : [
					[ previousSearchBounds.getSouthWest ( ).lat, previousSearchBounds.getSouthWest ( ).lng ],
					[ previousSearchBounds.getNorthEast ( ).lat, previousSearchBounds.getNorthEast ( ).lng ]
				],
				properties : theConfig.osmSearch.previousSearchLimit
			}
		);

	}

	/**
	Add maps event listeners and search rectangles on the map
	*/

	show ( ) {
		theTravelNotesData.map.on ( 'zoom', OsmSearchLimitsUI.#onMapChange );
		theTravelNotesData.map.on ( 'move', OsmSearchLimitsUI.#onMapChange );
		OsmSearchLimitsUI.#onMapChange ( );
		this.#drawPreviousSearchlimit ( );
	}

	/**
	Remove maps event listeners and search rectangles on the map
	*/

	hide ( ) {
		let eventDispatcher = theEventDispatcher;
		theTravelNotesData.map.off ( 'zoom', OsmSearchLimitsUI.#onMapChange );
		theTravelNotesData.map.off ( 'move', OsmSearchLimitsUI.#onMapChange );
		if ( INVALID_OBJ_ID !== OsmSearchLimitsUI.#searchLimitObjId ) {
			eventDispatcher.dispatch ( 'removeobject', { objId : OsmSearchLimitsUI.#searchLimitObjId } );
			OsmSearchLimitsUI.#searchLimitObjId = INVALID_OBJ_ID;
		}
		if ( INVALID_OBJ_ID !== this.#previousSearchLimitObjId ) {
			eventDispatcher.dispatch ( 'removeobject', { objId : this.#previousSearchLimitObjId } );
			this.#previousSearchLimitObjId = INVALID_OBJ_ID;
		}
	}
}

export default OsmSearchLimitsUI;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of OsmSearchLimitsUI.js file

@------------------------------------------------------------------------------------------------------------------------------
*/