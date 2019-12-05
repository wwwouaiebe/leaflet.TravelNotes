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

import { g_Config } from '../data/Config.js';
import { newObjId } from '../data/ObjId.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';

var s_OsmSearchStarted = false;
var s_SearchParameters = { searchPhrase : '', bbox : null };
var s_PreviousSearchRectangleObjId = -1;
var s_NextSearchRectangleObjId = -1;
var s_SearchLimits = ( window.osmSearch ) ? window.osmSearch.searchLimits : null;

/*
--- s_DrawSearchRectangle function --------------------------------------------------------------------------------

This function draw the search limits on the map

-------------------------------------------------------------------------------------------------------------------
*/

function s_DrawSearchRectangle ( ) {
	if ( ! s_SearchParameters.bbox ) {
		return;
	}
	if ( -1 !== s_PreviousSearchRectangleObjId ) {
		newEventDispatcher ( ).dispatch ( 'removeobject', { objId : s_PreviousSearchRectangleObjId } );
	}
	else {
		s_PreviousSearchRectangleObjId = newObjId ( );
	}
	newEventDispatcher ( ).dispatch ( 
		'addrectangle', 
		{ 
			objId : s_PreviousSearchRectangleObjId,
			bounds : [ 
				[ s_SearchParameters.bbox.southWest.lat, s_SearchParameters.bbox.southWest.lng ], 
				[ s_SearchParameters.bbox.northEast.lat, s_SearchParameters.bbox.northEast.lng ] 
			],
			properties : g_Config.previousSearchLimit 
		}
	);
	
}

/*
--- onSearchSuccess function ------------------------------------------------------------------------------------------

Promise success function for osmSearch

-----------------------------------------------------------------------------------------------------------------------
*/

function onSearchSuccess ( searchData ) {
	g_TravelNotesData.searchData = searchData;
	s_OsmSearchStarted = false;
	s_DrawSearchRectangle ( );
	newEventDispatcher ( ).dispatch ( 'updatesearch' );
}

/*
--- onSearchError function --------------------------------------------------------------------------------------------

Promise error function for osmSearch

-----------------------------------------------------------------------------------------------------------------------
*/

function onSearchError ( err ) {
	console.log ( err ? err : 'An error occurs in the search' );
	s_OsmSearchStarted = false;
}

/*
--- onMapChange function ----------------------------------------------------------------------------------------------

change event listener for the map

-----------------------------------------------------------------------------------------------------------------------
*/

function onMapChange ( ) {
	let mapCenter = g_TravelNotesData.map.getCenter ( );
	if ( -1 !== s_NextSearchRectangleObjId ) {
		newEventDispatcher ( ).dispatch ( 'removeobject', { objId : s_NextSearchRectangleObjId } );
	}
	else {
		s_NextSearchRectangleObjId = newObjId ( );
	}
	newEventDispatcher ( ).dispatch ( 
		'addrectangle', 
		{ 
			objId : s_NextSearchRectangleObjId,
			bounds : [ 
				[ mapCenter.lat - s_SearchLimits.lat, mapCenter.lng - s_SearchLimits.lng ], 
				[ mapCenter.lat + s_SearchLimits.lat, mapCenter.lng + s_SearchLimits.lng ]
			],
			properties : g_Config.nextSearchLimit
		}
	);
}

/*
--- osmSearchEngine function ------------------------------------------------------------------------------------------

This function returns the osmSearchEngine object

-----------------------------------------------------------------------------------------------------------------------
*/

function newOsmSearchEngine ( ) {
	
	let m_EventDispatcher = newEventDispatcher ( );

	/*
	--- m_Search function ---------------------------------------------------------------------------------------------

	This function start the search

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Search ( ) {
		if ( s_OsmSearchStarted ) {
			return;
		}
		
		s_OsmSearchStarted = true;
		
		let mapBounds =  g_TravelNotesData.map.getBounds ( );
		s_SearchParameters = {
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
		g_TravelNotesData.searchData = [];
		window.osmSearch.getSearchPromise ( s_SearchParameters ).then (  onSearchSuccess, onSearchError  );
	}
	
	/*
	--- m_Show function -----------------------------------------------------------------------------------------------

	This function enable maps event and draw the search limits

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Show ( ) {
		
		g_TravelNotesData.map.on ( 'zoom', onMapChange );
		g_TravelNotesData.map.on ( 'move', onMapChange );
		onMapChange ( );
		s_DrawSearchRectangle ( );
	}
	
	/*
	--- m_Show function -----------------------------------------------------------------------------------------------

	This function disable maps event and remove the search limits

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Hide ( ) {
		g_TravelNotesData.map.off ( 'zoom', onMapChange );
		g_TravelNotesData.map.off ( 'move', onMapChange );
		if ( -1 !== s_NextSearchRectangleObjId ) {
			m_EventDispatcher.dispatch ( 'removeobject', { objId : s_NextSearchRectangleObjId } );
			s_NextSearchRectangleObjId = -1;
		}
		if ( -1 !== s_PreviousSearchRectangleObjId ) {
			m_EventDispatcher.dispatch ( 'removeobject', { objId : s_PreviousSearchRectangleObjId } );
			s_PreviousSearchRectangleObjId = -1;
		}
	}
	
	/*
	--- osmSearchEngine object ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	return Object.seal (
		{
			search : ( ) => m_Search ( ),
			
			show : ( ) => m_Show ( ),
			
			hide : ( ) => m_Hide ( )
		}
	);
}

/*
--- End of OsmSearchEngine.js file ------------------------------------------------------------------------------------
*/		