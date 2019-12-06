/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- OsmSearchEngine.js file -------------------------------------------------------------------------------------------
This file contains:
	- the newOsmSearchEngine function
Changes:
	- v1.4.0:
		- created
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191122
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newOsmSearchEngine };

import { theConfig } from '../data/Config.js';
import { newObjId } from '../data/ObjId.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';

let ourOsmSearchStarted = false;
let ourSearchParameters = { searchPhrase : '', bbox : null };
let ourPreviousSearchRectangleObjId = -1;
let ourNextSearchRectangleObjId = -1;
let ourSearchLimits = ( window.osmSearch ) ? window.osmSearch.searchLimits : null;

/*
--- ourDrawSearchRectangle function --------------------------------------------------------------------------------

This function draw the search limits on the map

-------------------------------------------------------------------------------------------------------------------
*/

function ourDrawSearchRectangle ( ) {
	if ( ! ourSearchParameters.bbox ) {
		return;
	}
	if ( -1 === ourPreviousSearchRectangleObjId ) {
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

/*
--- ourOnSearchSuccess function ---------------------------------------------------------------------------------------

Promise success function for osmSearch

-----------------------------------------------------------------------------------------------------------------------
*/

function ourOnSearchSuccess ( searchData ) {
	theTravelNotesData.searchData = searchData;
	ourOsmSearchStarted = false;
	ourDrawSearchRectangle ( );
	newEventDispatcher ( ).dispatch ( 'updatesearch' );
}

/*
--- ourOnSearchError function -----------------------------------------------------------------------------------------

Promise error function for osmSearch

-----------------------------------------------------------------------------------------------------------------------
*/

function ourOnSearchError ( err ) {
	console.log ( err ? err : 'An error occurs in the search' );
	ourOsmSearchStarted = false;
}

/*
--- ourOnMapChange function -------------------------------------------------------------------------------------------

change event listener for the map

-----------------------------------------------------------------------------------------------------------------------
*/

function ourOnMapChange ( ) {
	let mapCenter = theTravelNotesData.map.getCenter ( );
	if ( -1 === ourNextSearchRectangleObjId ) {
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

/*
--- osmSearchEngine function ------------------------------------------------------------------------------------------

This function returns the osmSearchEngine object

-----------------------------------------------------------------------------------------------------------------------
*/

function newOsmSearchEngine ( ) {

	let myEventDispatcher = newEventDispatcher ( );

	/*
	--- mySearch function ---------------------------------------------------------------------------------------------

	This function start the search

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySearch ( ) {
		if ( ourOsmSearchStarted ) {
			return;
		}

		ourOsmSearchStarted = true;

		let mapBounds =  theTravelNotesData.map.getBounds ( );
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
			searchPhrase : document.getElementById ( 'TravelNotes-Control-SearchInput' ).value
		};
		theTravelNotesData.searchData = [];
		window.osmSearch.getSearchPromise ( ourSearchParameters ).then (  ourOnSearchSuccess, ourOnSearchError  );
	}

	/*
	--- myShow function -----------------------------------------------------------------------------------------------

	This function enable maps event and draw the search limits

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myShow ( ) {

		theTravelNotesData.map.on ( 'zoom', ourOnMapChange );
		theTravelNotesData.map.on ( 'move', ourOnMapChange );
		ourOnMapChange ( );
		ourDrawSearchRectangle ( );
	}

	/*
	--- myShow function -----------------------------------------------------------------------------------------------

	This function disable maps event and remove the search limits

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myHide ( ) {
		theTravelNotesData.map.off ( 'zoom', ourOnMapChange );
		theTravelNotesData.map.off ( 'move', ourOnMapChange );
		if ( -1 !== ourNextSearchRectangleObjId ) {
			myEventDispatcher.dispatch ( 'removeobject', { objId : ourNextSearchRectangleObjId } );
			ourNextSearchRectangleObjId = -1;
		}
		if ( -1 !== ourPreviousSearchRectangleObjId ) {
			myEventDispatcher.dispatch ( 'removeobject', { objId : ourPreviousSearchRectangleObjId } );
			ourPreviousSearchRectangleObjId = -1;
		}
	}

	/*
	--- osmSearchEngine object ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			search : ( ) => mySearch ( ),

			show : ( ) => myShow ( ),

			hide : ( ) => myHide ( )
		}
	);
}

/*
--- End of OsmSearchEngine.js file ------------------------------------------------------------------------------------
*/