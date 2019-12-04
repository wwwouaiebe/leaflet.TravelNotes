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
--- FileLoader.js file ------------------------------------------------------------------------------------------------
This file contains:
	- the newFileLoader function
Changes:
	- v1.4.0:
		- created from TravelEditor
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
		- Issue #61 : Disable right context menu when readonly travel.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191122
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newFileLoader };

import { polyline } from '../polyline/Polyline.js';

import { g_Translator } from '../UI/Translator.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { gc_ErrorsUI } from '../UI/ErrorsUI.js';
import { g_RouteEditor } from '../core/RouteEditor.js';
import { newTravel } from '../data/Travel.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newRoadbookUpdate } from '../roadbook/RoadbookUpdate.js';

/*
--- fileLoader function -----------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newFileLoader ( ) {

	let m_MergeContent = false;
	let m_FileName = '';
	let m_IsFileReadOnly = false;
	let m_FileContent = {};
	let m_EventDispatcher = newEventDispatcher ( );

	/*
	--- m_DecompressRoute function ------------------------------------------------------------------------------------

	This function decompress a route
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_DecompressRoute ( route ) {
		route.itinerary.itineraryPoints.latLngs = polyline.decode ( route.itinerary.itineraryPoints.latLngs, 6 );
		let decompressedItineraryPoints = [];
		let latLngsCounter = 0;
		route.itinerary.itineraryPoints.latLngs.forEach (
			latLng => {
				let itineraryPoint = {};
				itineraryPoint.lat = latLng [ 0 ];
				itineraryPoint.lng = latLng [ 1 ];
				itineraryPoint.distance = route.itinerary.itineraryPoints.distances [ latLngsCounter ];
				itineraryPoint.objId = route.itinerary.itineraryPoints.objIds [ latLngsCounter ];
				itineraryPoint.objType = route.itinerary.itineraryPoints.objType;
				decompressedItineraryPoints.push ( itineraryPoint );
				latLngsCounter ++;
			}
		);
		route.itinerary.itineraryPoints = decompressedItineraryPoints;
	}
	
	/*
	--- m_DecompressFileContent function ------------------------------------------------------------------------------

	This function decompress the file data
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_DecompressFileContent ( ) {
		
		m_FileContent.routes.forEach ( m_DecompressRoute );
		if ( m_FileContent.editedRoute ) {
			// don't remove the if statment... files created with version < 1.5.0 don't have editedRoute...
			m_DecompressRoute ( m_FileContent.editedRoute );
		}
		if ( m_MergeContent ) {
			m_Merge ( );
		}
		else {
			m_Open ( );
		}
	}
	
	/*
	--- m_Merge function ----------------------------------------------------------------------------------------------

	This function merge the file data with the g_TravelNotesData.travel
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Merge ( ) {
		// ... and transform the data in the correct format
		let travel = newTravel ( );
		travel.object = m_FileContent;
		
		// routes are added with their notes
		let routesIterator = travel.routes.iterator;
		while ( ! routesIterator.done ) {
			g_TravelNotesData.travel.routes.add ( routesIterator.value );
		}
		// travel notes are added
		let notesIterator = travel.notes.iterator;
		while ( ! notesIterator.done ) {
			g_TravelNotesData.travel.notes.add ( notesIterator.value );
		}
		
		g_RouteEditor.chainRoutes ( );
	
		m_Display ( );
	}
	
	/*
	--- m_Open function -----------------------------------------------------------------------------------------------

	This function load the file data within the g_TravelNotesData.travel
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Open ( ) {
		g_TravelNotesData.travel.object = m_FileContent;
		g_TravelNotesData.editedRouteObjId = -1;

		if ( '' !== m_FileName ) {
			g_TravelNotesData.travel.name = m_FileName.substr ( 0, m_FileName.lastIndexOf ( '.' ) ) ;
		}
		g_TravelNotesData.travel.readOnly = m_IsFileReadOnly;
		g_TravelNotesData.travel.routes.forEach (
			route => {
				if ( 0 !== route.edited ) {
					g_TravelNotesData.editedRouteObjId = route.objId;
				}
			}
		);
		m_Display ( );
	}
	
	/*
	--- m_Display function --------------------------------------------------------------------------------------------

	This function update the screen
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Display ( ) {

		// the map is cleaned
		m_EventDispatcher.dispatch ( 'removeallobjects' );
		// routes are added with their notes
		let routesIterator = g_TravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {
			if ( 0 === routesIterator.value.edited ) {
				m_EventDispatcher.dispatch ( 
					'addroute', 
					{
						route : routesIterator.value,
						addNotes : true,
						addWayPoints : false,
						readOnly : m_IsFileReadOnly
					}
				);
			}
		}
		// edited route is added with notes and , depending of read only, waypoints
		if ( -1 !== g_TravelNotesData.editedRouteObjId ) {
			m_EventDispatcher.dispatch ( 
				'addroute', 
				{
					route : g_TravelNotesData.travel.editedRoute,
					addNotes : true,
					addWayPoints : ! m_IsFileReadOnly,
					readOnly : m_IsFileReadOnly
				}
			);
		}
		
		// travel notes are added
		let notesIterator = g_TravelNotesData.travel.notes.iterator;
		while ( ! notesIterator.done ) {
			m_EventDispatcher.dispatch ( 
				'addnote', 
				{ 
					note : notesIterator.value,
					readOnly : m_IsFileReadOnly
				}
			);
		}
		
		// zoom on the travel
		m_EventDispatcher.dispatch ( 'zoomtotravel' );

		// Editors and roadbook are filled
		if ( ! m_IsFileReadOnly ) {
		// Editors and HTML pages are filled
			m_EventDispatcher.dispatch ( 'setrouteslist' );
			if ( -1 !== g_TravelNotesData.editedRouteObjId ) {
				let providerName = g_TravelNotesData.travel.editedRoute.itinerary.provider;
				if ( providerName && ( '' !== providerName ) && ( ! g_TravelNotesData.providers.get ( providerName.toLowerCase ( ) ) ) )
				{
					gc_ErrorsUI.showError ( g_Translator.getText ( "FileLoader - Not possible to select as provider", {provider : providerName } ) );
				}
				else {
					// Provider and transit mode are changed in the itinerary editor
					let transitMode = g_TravelNotesData.travel.editedRoute.itinerary.transitMode;
					m_EventDispatcher.dispatch ( 'setprovider', { 'provider' : providerName } );
					
					if ( transitMode && '' !== transitMode ) {
						m_EventDispatcher.dispatch ( 'settransitmode', { 'transitMode' : transitMode } );
					}
				}
				g_RouteEditor.chainRoutes ( );
				m_EventDispatcher.dispatch ( 'expandrouteui' );
				m_EventDispatcher.dispatch ( 'setwaypointslist' );
				m_EventDispatcher.dispatch ( 'setitinerary' );
			}
			newRoadbookUpdate ( );
		}
		else {
			// control is hidden
			document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.add ( 'TravelNotes-Control-MainDiv-Hidden' );
			document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.remove ( 'TravelNotes-Control-MainDiv-Maximize' );
			document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.remove ( 'TravelNotes-Control-MainDiv-Minimize' );
		}
		g_TravelNotesData.map.fire ( 'travelnotesfileloaded', { readOnly : m_IsFileReadOnly, name : g_TravelNotesData.travel.name } );
	}
		
	/*
	--- m_OpenFile function -------------------------------------------------------------------------------------------

	This function open a local file
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OpenFile ( event ) {
		m_FileName = event.target.files [ 0 ].name;
		
		let fileReader = new FileReader( );
		fileReader.onload = function ( ) {
			try {
				m_FileContent =  JSON.parse ( fileReader.result );
				m_DecompressFileContent ( );
			}
			catch ( e ) {
				console.log ( e);
			}
		};
		fileReader.readAsText ( event.target.files [ 0 ] );
	}

	/*
	--- m_OpenLocalFile function --------------------------------------------------------------------------------------

	This function open a local file
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OpenLocalFile ( event ) {
		m_MergeContent = false;
		m_IsFileReadOnly = false;
		m_OpenFile ( event );
	}
	
	/*
	--- m_MergeLocalFile function -------------------------------------------------------------------------------------

	This function open a local file
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_MergeLocalFile ( event ) {
		
		m_MergeContent = true;
		m_IsFileReadOnly = false;
		m_OpenFile ( event );
	}
	
	/*
	--- m_OpenDistantFile function ------------------------------------------------------------------------------------

	This function open a local file
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OpenDistantFile ( fileContent ) {
		window.L.travelNotes.rightContextMenu = false;
		m_IsFileReadOnly = true;
		m_FileContent = fileContent;
		m_DecompressFileContent ( );
	}

	/*
	--- FileLoader object ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			openLocalFile : event => m_OpenLocalFile ( event ),
			mergeLocalFile : event => m_MergeLocalFile ( event ),
			openDistantFile : fileContent => m_OpenDistantFile ( fileContent )
		}
	);
}
	
/*
--- End of FileLoader.js file -----------------------------------------------------------------------------------------
*/	