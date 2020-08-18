/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
	- v1.4.0:
		- created
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20200804
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file OsmSearchEngine.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module OsmSearchEngine
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theConfig } from '../data/Config.js';
import { newObjId } from '../data/ObjId.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { INVALID_OBJ_ID } from '../util/Constants.js';

let ourOsmSearchStarted = false;
let ourSearchParameters = { searchPhrase : '', bbox : null };
let ourPreviousSearchRectangleObjId = INVALID_OBJ_ID;
let ourNextSearchRectangleObjId = INVALID_OBJ_ID;
let ourSearchLimits = ( window.osmSearch ) ? window.osmSearch.searchLimits : null;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourDrawPreviousSearchRectangle
@desc Draw the previous search rectangle on the map
@fires removeobject
@fires addrectangle
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourDrawPreviousSearchRectangle ( ) {
	if ( ! ourSearchParameters.bbox ) {
		return;
	}
	if ( INVALID_OBJ_ID === ourPreviousSearchRectangleObjId ) {
		ourPreviousSearchRectangleObjId = newObjId ( );
	}
	else {
		newEventDispatcher ( ).dispatch ( 'removeobject', { objId : ourPreviousSearchRectangleObjId } );
	}
	newEventDispatcher ( ).dispatch (
		'addrectangle',
		{
			objId : ourPreviousSearchRectangleObjId,
			bounds : [
				[ ourSearchParameters.bbox.southWest.lat, ourSearchParameters.bbox.southWest.lng ],
				[ ourSearchParameters.bbox.northEast.lat, ourSearchParameters.bbox.northEast.lng ]
			],
			properties : theConfig.previousSearchLimit
		}
	);

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnSearchSuccess
@desc Success handler for the osmSearch.getSearchPromise ( ) method
@param {Object} searchData The search result returned by osmSearch
@fires updatesearch
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnSearchSuccess ( searchData ) {
	theTravelNotesData.searchData = searchData;
	ourOsmSearchStarted = false;
	ourDrawPreviousSearchRectangle ( );
	newEventDispatcher ( ).dispatch ( 'showsearch' );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnSearchError
@desc Error handler for the osmSearch.getSearchPromise ( ) method
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnSearchError ( err ) {
	console.log ( err ? err : 'An error occurs in the search' );
	ourOsmSearchStarted = false;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnMapChange
@desc event listener for the map zoom and pan. Redraw the next search rectangle on the map
@fires removeobject
@fires addrectangle
@listens zoom
@listens move
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnMapChange ( ) {
	let mapCenter = theTravelNotesData.map.getCenter ( );
	if ( INVALID_OBJ_ID === ourNextSearchRectangleObjId ) {
		ourNextSearchRectangleObjId = newObjId ( );
	}
	else {
		newEventDispatcher ( ).dispatch ( 'removeobject', { objId : ourNextSearchRectangleObjId } );
	}
	newEventDispatcher ( ).dispatch (
		'addrectangle',
		{
			objId : ourNextSearchRectangleObjId,
			bounds : [
				[ mapCenter.lat - ourSearchLimits.lat, mapCenter.lng - ourSearchLimits.lng ],
				[ mapCenter.lat + ourSearchLimits.lat, mapCenter.lng + ourSearchLimits.lng ]
			],
			properties : theConfig.nextSearchLimit
		}
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewOsmSearchEngine
@desc constructor of OsmSearchEngine object
@return {OsmSearchEngine} an instance of OsmSearchEngine object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewOsmSearchEngine ( ) {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class
	@classdesc This class is the interface betwween TravelNotes and the external module osmSearch
	@see {@link newOsmSearchEngine} for constructor
	@see {@link https://github.com/wwwouaiebe/osmSearch} for osmSearch
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class OsmSearchEngine {

		/**
		This method start a new search
		@param {string} searchPhrase The search string to be passed to osmSearch
		@fires updatesearch
		@fires removeobject
		@fires addrectangle
		@async
		*/

		search ( searchPhrase ) {
			if ( ourOsmSearchStarted ) {
				return;
			}
			ourOsmSearchStarted = true;
			let mapBounds = theTravelNotesData.map.getBounds ( );
			ourSearchParameters = {
				bbox : {
					southWest : {
						lat : mapBounds.getSouthWest ( ).lat,
						lng : mapBounds.getSouthWest ( ).lng
					},
					northEast : {
						lat : mapBounds.getNorthEast ( ).lat,
						lng : mapBounds.getNorthEast ( ).lng
					}
				},
				searchPhrase : searchPhrase
			};
			theTravelNotesData.searchData = [];
			window.osmSearch.getSearchPromise ( ourSearchParameters ).then ( ourOnSearchSuccess, ourOnSearchError );
		}

		/**
		This method show on the map the next search rectangle and the previous search rectangle
		@fires removeobject
		@fires addrectangle
		*/

		show ( ) {
			theTravelNotesData.map.on ( 'zoom', ourOnMapChange );
			theTravelNotesData.map.on ( 'move', ourOnMapChange );
			ourOnMapChange ( );
			ourDrawPreviousSearchRectangle ( );
		}

		/**
		This method remove from the map the next search rectangle and the previous search rectangle
		@fires removeobject
		*/

		hide ( ) {
			let eventDispatcher = newEventDispatcher ( );
			theTravelNotesData.map.off ( 'zoom', ourOnMapChange );
			theTravelNotesData.map.off ( 'move', ourOnMapChange );
			if ( INVALID_OBJ_ID !== ourNextSearchRectangleObjId ) {
				eventDispatcher.dispatch ( 'removeobject', { objId : ourNextSearchRectangleObjId } );
				ourNextSearchRectangleObjId = INVALID_OBJ_ID;
			}
			if ( INVALID_OBJ_ID !== ourPreviousSearchRectangleObjId ) {
				eventDispatcher.dispatch ( 'removeobject', { objId : ourPreviousSearchRectangleObjId } );
				ourPreviousSearchRectangleObjId = INVALID_OBJ_ID;
			}
		}
	}

	return Object.seal ( new OsmSearchEngine );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newOsmSearchEngine
	@desc constructor of OsmSearchEngine object
	@return {OsmSearchEngine} an instance of OsmSearchEngine object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewOsmSearchEngine as newOsmSearchEngine
};

/*
--- End of OsmSearchEngine.js file --------------------------------------------------------------------------------------------
*/