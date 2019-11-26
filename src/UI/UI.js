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
--- UserInterface.js file ---------------------------------------------------------------------------------------------
This file contains:
	- the newUserInterface function
Changes:
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #31 : Add a command to import from others maps
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

'use strict';

export { gc_UI };

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { gc_TravelEditorUI } from '../UI/TravelEditorUI.js';
import { gc_RouteEditorUI } from '../UI/RouteEditorUI.js';
import { gc_DataPanesUI } from '../UI/DataPanesUI.js';
import { gc_ProvidesToolbarUI } from '../UI/ProvidersToolbarUI.js';
import { newErrorEditorUI } from '../UI/ErrorEditorUI.js';

/*
--- newUserInterface function -----------------------------------------------------------------------------------------

This function returns the UserInterface object

-----------------------------------------------------------------------------------------------------------------------
*/

function newUI ( ) {

	let m_MainDiv = null;

	/*
	--- m_CreateUI function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateUI( controlDiv ){ 
		if ( document.getElementById ( 'TravelNotes-Control-MainDiv' ) ) {
			return;
		}
		let htmlElementsFactory = newHTMLElementsFactory ( );
		m_MainDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-MainDiv' }, controlDiv );
		htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-MainDiv-Title', innerHTML : 'Travel&nbsp;&amp;&nbsp;Notes' }, m_MainDiv);
		
		gc_TravelEditorUI.createUI ( m_MainDiv ); 
		gc_RouteEditorUI.createUI ( m_MainDiv ); 
		gc_DataPanesUI.createUI ( m_MainDiv ); 
		
		gc_ProvidesToolbarUI.createUI ( m_MainDiv ); 
		newErrorEditorUI ( ).createUI ( m_MainDiv ); 

		m_MainDiv.addEventListener ( 'setrouteslist', ( ) => gc_TravelEditorUI.setRoutesList ( ) , false );

		m_MainDiv.addEventListener ( 'expandrouteui', ( ) => gc_RouteEditorUI.expandUI ( ), false );
		m_MainDiv.addEventListener ( 'reducerouteui', ( ) => gc_RouteEditorUI.reduceUI ( ), false );
		m_MainDiv.addEventListener ( 'setwaypointslist', ( ) => gc_RouteEditorUI.setWayPointsList ( ), false );

		m_MainDiv.addEventListener ( 'setitinerary', ( ) => gc_DataPanesUI.setItinerary ( ), false );
		m_MainDiv.addEventListener ( 'updateitinerary', ( ) => gc_DataPanesUI.updateItinerary ( ), false );
		m_MainDiv.addEventListener ( 'settravelnotes', ( ) => gc_DataPanesUI.setTravelNotes ( ), false );
		m_MainDiv.addEventListener ( 'updatetravelnotes', ( ) => gc_DataPanesUI.updateTravelNotes ( ), false );
		m_MainDiv.addEventListener ( 'setsearch', ( ) => gc_DataPanesUI.setSearch ( ), false );
		m_MainDiv.addEventListener ( 'updatesearch', ( ) => gc_DataPanesUI.updateSearch ( ), false );

		m_MainDiv.addEventListener ( 
			'setprovider',
			event => {
				if ( event.data && event.data.provider ) {
					gc_ProvidesToolbarUI.provider = event.data.provider;
				}
			},
			false 
		);
		m_MainDiv.addEventListener ( 
			'settransitmode',
			event => {
				if ( event.data && event.data.provider ) {
					gc_ProvidesToolbarUI.transitMode = event.data.transitMode;
				}
			},
			false 
		);
		
		m_MainDiv.addEventListener ( 
			'click',
			function ( event ) {

				if  ( event.target.classList.contains (  "TravelNotes-SortableList-ItemInput" ) ) {
					return; 
				}
				if ( event.target.id && -1 !== [ "TravelNotes-Control-OpenTravelInput", "TravelNotes-Control-OpenTravelButton", "TravelNotes-Control-ImportTravelInput", "TravelNotes-Control-ImportTravelButton", "TravelNotes-Control-OpenTravelRoadbookLink" ].indexOf ( event.target.id ) ) {
					return;
				}
				event.stopPropagation ( );
				event.preventDefault ( );
			},
			false
		);
		
		m_MainDiv.addEventListener ( 
			'dblclick',
			function ( event ) {
				event.stopPropagation ( );
				event.preventDefault ( );
			},
			false
		);
		
		m_MainDiv.addEventListener ( 
			'wheel',
			function ( event ) {
				event.stopPropagation ( );
				event.preventDefault ( );
			},
			false
		);
	}
	
	if ( ! m_MainDiv ) {
		m_CreateUI ( );
	}
	
	/*
	--- UI object -----------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return {
		createUI : controlDiv => m_CreateUI ( controlDiv )
	};
}

/* 
--- gc_UI object ------------------------------------------------------------------------------------------------------

The one and only one UI object

-----------------------------------------------------------------------------------------------------------------------
*/

const gc_UI = newUI ( );	



/*
--- End of UserInterface.js file --------------------------------------------------------------------------------------
*/	