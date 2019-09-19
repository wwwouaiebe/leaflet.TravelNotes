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
	- 
Changes:
	- v1.4.0:
		- created

Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var g_TravelNotesData = require ( '../L.TravelNotes' );

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
	
	var s_DrawSearchRectangle = function ( ) {
		if ( ! s_SearchParameters.bbox ) {
			return;
		}
		if ( -1 !== s_PreviousSearchRectangleObjId ) {
			require ( '../core/MapEditor' ) ( ).removeObject ( s_PreviousSearchRectangleObjId );
		}
		else {
			s_PreviousSearchRectangleObjId = require ( '../data/ObjId' ) ( );
		}
		require ( '../core/MapEditor' ) ( ).addRectangle ( 
			s_PreviousSearchRectangleObjId, 
			L.latLngBounds ( s_SearchParameters.bbox.southWest, s_SearchParameters.bbox.northEast ) , 
			g_TravelNotesData.config.previousSearchLimit 
		);
	};
	
	/*
	--- onSearchSuccess function --------------------------------------------------------------------------------------

	Promise success function for osmSearch

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSearchSuccess = function ( searchData ) {
		g_TravelNotesData.searchData = searchData;
		s_OsmSearchStarted = false;
		s_DrawSearchRectangle ( );
		require ( '../UI/DataPanesUI' ) ( ).updateSearch ( );
	};
	
	/*
	--- onSearchError function ----------------------------------------------------------------------------------------

	Promise error function for osmSearch

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSearchError = function ( error ) {
		console.log ( error );
		s_OsmSearchStarted = false;
	};

	/*
	--- onMapChange function ------------------------------------------------------------------------------------------

	change event listener for the map

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onMapChange = function ( event ) {
		var mapCenter = g_TravelNotesData.map.getCenter ( );
		if ( -1 !== s_NextSearchRectangleObjId ) {
			require ( '../core/MapEditor' ) ( ).removeObject ( s_NextSearchRectangleObjId );
		}
		else {
			s_NextSearchRectangleObjId = require ( '../data/ObjId' ) ( );
		}
		require ( '../core/MapEditor' ) ( ).addRectangle ( 
			s_NextSearchRectangleObjId, 
			L.latLngBounds ( L.latLng ( mapCenter.lat - s_SearchLimits.lat, mapCenter.lng - s_SearchLimits.lng ), L.latLng (  mapCenter.lat + s_SearchLimits.lat, mapCenter.lng + s_SearchLimits.lng ) ), 
			g_TravelNotesData.config.nextSearchLimit );
	};

	/*
	--- osmSearchEngine function --------------------------------------------------------------------------------------

	This function returns the osmSearchEngine object

	-------------------------------------------------------------------------------------------------------------------
	*/

	var osmSearchEngine = function ( ) {

		/*
		--- m_Search function -----------------------------------------------------------------------------------------

		This function start the search

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Search = function ( ) {
			if ( s_OsmSearchStarted ) {
				return;
			}
			
			s_OsmSearchStarted = true;
			
			var mapBounds =  g_TravelNotesData.map.getBounds ( );
			s_SearchParameters = {
				bbox : { southWest : mapBounds.getSouthWest ( ), northEast : mapBounds.getNorthEast ( ) },
				searchPhrase : document.getElementById ( 'TravelNotes-Control-SearchInput' ).value
			};
			g_TravelNotesData.searchData = [];
			window.osmSearch.getSearchPromise ( s_SearchParameters ).then (  onSearchSuccess, onSearchError  );
		};
		
		/*
		--- m_Show function -------------------------------------------------------------------------------------------

		This function enable maps event and draw the search limits

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Show = function ( ) {
			g_TravelNotesData.map.on ( 'zoom', onMapChange );
			g_TravelNotesData.map.on ( 'move', onMapChange );
			onMapChange ( );
			s_DrawSearchRectangle ( );
		};
		
		/*
		--- m_Show function -------------------------------------------------------------------------------------------

		This function disable maps event and remove the search limits

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Hide = function ( ) {
			g_TravelNotesData.map.off ( 'zoom', onMapChange );
			g_TravelNotesData.map.off ( 'move', onMapChange );
			if ( -1 !== s_NextSearchRectangleObjId ) {
				require ( '../core/MapEditor' ) ( ).removeObject ( s_NextSearchRectangleObjId );
				s_NextSearchRectangleObjId = -1;
			}
			if ( -1 !== s_PreviousSearchRectangleObjId ) {
				require ( '../core/MapEditor' ) ( ).removeObject ( s_PreviousSearchRectangleObjId );
				s_PreviousSearchRectangleObjId = -1;
			}
		};
		
		/*
		--- osmSearchEngine object ------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/
		
		return Object.seal (
			{
				search : function ( ) { m_Search ( ); },
				
				show : function ( ) { m_Show ( ); },
				
				hide : function ( ) { m_Hide ( ); }
			}
		);
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = osmSearchEngine;
	}

}());

/*
--- End of OsmSearchEngine.js file ------------------------------------------------------------------------------------
*/		