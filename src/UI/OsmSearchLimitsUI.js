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

@module osmSearchPaneUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import ObjId from '../data/ObjId.js';
import theConfig from '../data/Config.js';
import theEventDispatcher from '../coreLib/EventDispatcher.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theOsmSearchEngine from '../coreOsmSearch/OsmSearchEngine.js';
import { INVALID_OBJ_ID } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class OsmSearchLimitsUI
@classdesc This class manages the search limits on the map
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class OsmSearchLimitsUI {

	/**
	ObjId's for the limits
	@private
	*/

	#previousSearchLimitObjId = INVALID_OBJ_ID;
	#searchLimitObjId = INVALID_OBJ_ID;

	/**
	Draw the search limit on the map.
	Also used as event listener for pan and zoom operations on the map.
	@fires removeobject
	@fires addrectangle
	@listens zoom
	@listens move
	@private
	*/

	#drawSearchLimit ( ) {
		if ( INVALID_OBJ_ID === this.#searchLimitObjId ) {
			this.#searchLimitObjId = ObjId.nextObjId;
		}
		else {
			theEventDispatcher.dispatch ( 'removeobject', { objId : this.#searchLimitObjId } );
		}

		theEventDispatcher.dispatch (
			'addrectangle',
			{
				objId : this.#searchLimitObjId,
				bounds : theOsmSearchEngine.searchBounds,
				properties : theConfig.osmSearch.nextSearchLimit
			}
		);
	}

	/**
	Draw the previous search limit on the map
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

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	Add maps event listeners and search limits on the map
	*/

	show ( ) {
		theTravelNotesData.map.on ( 'zoom', this.#drawSearchLimit, this );
		theTravelNotesData.map.on ( 'move', this.#drawSearchLimit, this );
		this.#drawSearchLimit ( );
		this.#drawPreviousSearchlimit ( );
	}

	/**
	Remove maps event listeners and search limits on the map
	*/

	hide ( ) {
		theTravelNotesData.map.off ( 'zoom', this.#drawSearchLimit, this );
		theTravelNotesData.map.off ( 'move', this.#drawSearchLimit, this );
		if ( INVALID_OBJ_ID !== this.#searchLimitObjId ) {
			theEventDispatcher.dispatch ( 'removeobject', { objId : this.#searchLimitObjId } );
			this.#searchLimitObjId = INVALID_OBJ_ID;
		}
		if ( INVALID_OBJ_ID !== this.#previousSearchLimitObjId ) {
			theEventDispatcher.dispatch ( 'removeobject', { objId : this.#previousSearchLimitObjId } );
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