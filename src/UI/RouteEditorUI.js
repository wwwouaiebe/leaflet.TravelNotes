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
--- RouteEditorUI.js file ---------------------------------------------------------------------------------------------
This file contains:
	- the newRouteEditorUI object
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

'use strict';

export { newRouteEditorUI };

import { g_Translator } from '../UI/Translator.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { g_RouteEditor } from '../core/RouteEditor.js';
import { g_WayPointEditor } from '../core/WayPointEditor.js';

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newSortableList } from '../UI/SortableList.js';

var m_WayPointsList = null;

/*
--- routeEditorUI function --------------------------------------------------------------------------------------------

This function creates the UI

-----------------------------------------------------------------------------------------------------------------------
*/

var newRouteEditorUI = function ( ) {
			
	/*
	--- event listener for Expand button ------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickExpandButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );

		if ( -1 === g_TravelNotesData.editedRouteObjId ) {
			return;
		}

		document.getElementById ( 'TravelNotes-Control-RouteHeaderDiv' ).classList.toggle ( 'TravelNotes-Control-SmallHeader' );
		document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-Control-RouteButtonsDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.contains ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25bc;';
		document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).title = hiddenList ? g_Translator.getText ( 'RouteEditorUI - Show' ) : g_Translator.getText ( 'RouteEditorUI - Hide' );
	};

	/*
	--- event listeners for sortableList ------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSortableListDelete = function ( event ) {
		event.stopPropagation ( );
		g_WayPointEditor.removeWayPoint ( event.itemNode.dataObjId );
	};

	var onSortableListUpArrow = function ( event ) {
		event.stopPropagation ( );
		g_WayPointEditor.swapWayPoints ( event.itemNode.dataObjId, true );
	};

	var onSortableListDownArrow = function ( event ) {
		event.stopPropagation ( );
		g_WayPointEditor.swapWayPoints ( event.itemNode.dataObjId, false );
	};

	var onSortableListChange = function ( event ) {
		event.stopPropagation ( );
		g_WayPointEditor.renameWayPoint ( event.dataObjId, event.changeValue );
	};

	var onSortableListDrop = function ( event ) {
		event.stopPropagation ( );
		g_WayPointEditor.wayPointDropped ( event.draggedObjId, event.targetObjId, event.draggedBefore );
	};

	/*
	--- event listener for Expand list button -------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickExpandListButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.toggle ( 'TravelNotes-Control-ExpandedList' );
		var expandedList = document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.contains ( 'TravelNotes-Control-ExpandedList' );
		document.getElementById ( 'TravelNotes-Control-ExpandWayPointsListButton' ).innerHTML = expandedList ? '&#x25b3;' : '&#x25bd;';
		document.getElementById ( 'TravelNotes-Control-ExpandWayPointsListButton' ).title = expandedList ? g_Translator.getText ( 'RouteEditorUI - Reduce the list' ) : g_Translator.getText ( 'RouteEditorUI - Expand the list' );		
	};

	/*
	--- event listener for Cancel route button ------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickCancelRouteButton = function ( event ) {
		event.stopPropagation ( );
		g_RouteEditor.cancelEdition ( );
	};

	/*
	--- event listener for save route button --------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickSaveRouteButton = function ( event ) {
		event.stopPropagation ( );
		g_RouteEditor.saveEdition ( );
	};

	/*
	--- event listener for GPX button ---------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickGpxButton = function ( event ) {
		event.stopPropagation ( );
		g_RouteEditor.saveGpx ( );
	};

	/*
	--- event listener for Reverse waypoints button -------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickReverseWayPointsButton = function ( event ) {
		event.stopPropagation ( );
		g_WayPointEditor.reverseWayPoints ( );
	};

	/*
	--- event listener for Remove all waypoints button ----------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickRemoveAllWayPointsButton = function ( event ) {
		event.stopPropagation ( );
		g_WayPointEditor.removeAllWayPoints ( );
	};
	/*
	--- m_CreateUI function -------------------------------------------------------------------------------------------

	This function creates the UI
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_CreateUI = function ( controlDiv ){ 

		if ( document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ) ) {
			return;
		}
		
		var htmlElementsFactory = newHTMLElementsFactory ( ) ;
		
		// header div
		var headerDiv = htmlElementsFactory.create (
			'div',
			{ 
				id : 'TravelNotes-Control-RouteHeaderDiv',
				className : 'TravelNotes-Control-HeaderDiv'
			},
			controlDiv
		);

		// expand button
		htmlElementsFactory.create ( 
			'span', 
			{ 
				innerHTML : '&#x25bc;',
				id : 'TravelNotes-Control-RouteExpandButton',
				className : 'TravelNotes-Control-ExpandButton'
			},
			headerDiv 
		)
		.addEventListener ( 'click' , onClickExpandButton, false );
		
		// title
		htmlElementsFactory.create ( 
			'span', 
			{ 
				innerHTML : 
				g_Translator.getText ( 'RouteEditorUI - Waypoints' ), 
				id : 'TravelNotes-Control-RouteHeaderText',
				className : 'TravelNotes-Control-HeaderText'
			},
			headerDiv 
		);

		// data div
		var dataDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				id : 'TravelNotes-Control-RouteDataDiv', 
				className : 'TravelNotes-Control-DataDiv'
			},
			controlDiv
		);
		
		// wayPoints list
		m_WayPointsList = newSortableList ( 
			{
				minSize : 0,
				listStyle : 'LimitedSort',
				id : 'TravelNotes-Control-RouteWaypointsList'
			}, 
			dataDiv
		);
		m_WayPointsList.container.addEventListener ( 'SortableListDelete', onSortableListDelete, false );
		m_WayPointsList.container.addEventListener ( 'SortableListUpArrow', onSortableListUpArrow, false	);
		m_WayPointsList.container.addEventListener ( 'SortableListDownArrow', onSortableListDownArrow, false );
		m_WayPointsList.container.addEventListener ( 'SortableListChange', onSortableListChange, false );
		m_WayPointsList.container.addEventListener ( 'SortableListDrop', onSortableListDrop, false );

		// buttons div
		var buttonsDiv = htmlElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-Control-RouteButtonsDiv', 
				className : 'TravelNotes-Control-ButtonsDiv'
			},
			controlDiv
		);
		
		// expand list button
		htmlElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-Control-ExpandWayPointsListButton', 
				className: 'TravelNotes-Control-Button', 
				title : g_Translator.getText ( 'RouteEditorUI - Expand the list' ), 
				innerHTML : '&#x25bd;'
			}, 
			buttonsDiv 
		)
		.addEventListener ( 'click' , onClickExpandListButton, false );

		// cancel route button
		htmlElementsFactory.create (
			'div', 
			{ 
				id : 'TravelNotes-Control-CancelRouteButton',
				className: 'TravelNotes-Control-Button', 
				title : g_Translator.getText ( 'RouteEditorUI - Cancel' ), 
				innerHTML : '&#x274c'
			},
			buttonsDiv 
		)
		.addEventListener ( 'click', onClickCancelRouteButton, false );
		
		// save route button
		htmlElementsFactory.create (
			'div', 
			{ 
				id : 'TravelNotes-Control-SaveRouteButton',
				className: 'TravelNotes-Control-Button', 
				title : g_Translator.getText ( 'RouteEditorUI - Save' ), 
				innerHTML : '&#x1f4be;'
			},
			buttonsDiv 
		)
		.addEventListener ( 'click', onClickSaveRouteButton, false );
		
		// gpx button
		htmlElementsFactory.create (
			'div', 
			{ 
				id : 'TravelNotes-Control-gpxButton',
				className: 'TravelNotes-Control-Button', 
				title : g_Translator.getText ( 'RouteEditorUI - Save the route in a gpx file' ), 
				innerHTML : 'gpx'
			},
			buttonsDiv 
		)
		.addEventListener ( 'click', onClickGpxButton, false );
		
		// reverse wayPoints button
		htmlElementsFactory.create ( 
			'div',
			{ 
				id : 'TravelNotes-Control-ReverseWayPointsButton', 
				className: 'TravelNotes-Control-Button', 
				title : g_Translator.getText ( 'RouteEditorUI - Invert waypoints' ),  
				innerHTML : '&#x21C5;'
			},
			buttonsDiv
		)
		.addEventListener ( 'click' , onClickReverseWayPointsButton, false );
				
		// remove all wayPoints button
		htmlElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-Control-RemoveAllWayPointsButton', 
				className: 'TravelNotes-Control-Button',
				title: g_Translator.getText ( 'RouteEditorUI - Delete all waypoints' ),
				innerHTML : '&#x267b;'
			}, 
			buttonsDiv
		)
		.addEventListener ( 'click' , onClickRemoveAllWayPointsButton, false );
	};

	/*
	--- m_ExpandUI function -------------------------------------------------------------------------------------------

	This function expands the UI
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_ExpandUI = function ( ) {
		document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).innerHTML = '&#x25bc;';
		document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).title = 'Masquer';
		document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.remove ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-Control-RouteButtonsDiv' ).classList.remove ( 'TravelNotes-Control-HiddenList' );
	};
	
	/*
	--- m_ReduceUI function -------------------------------------------------------------------------------------------

	This function reduces the UI
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_ReduceUI = function ( ) {
		document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).innerHTML = '&#x25b6;';
		document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).title = 'Afficher';
		document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.add ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-Control-RouteButtonsDiv' ).classList.add ( 'TravelNotes-Control-HiddenList' );
	};
	
	/*
	--- m_SetWayPointsList function -----------------------------------------------------------------------------------

	This function fill the wayPoints list
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_SetWayPointsList = function ( ) {
		m_WayPointsList.removeAllItems ( );
		if ( -1 === g_TravelNotesData.editedRouteObjId ) {
			return;
		}
		var wayPointsIterator = g_TravelNotesData.travel.editedRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			var indexName = wayPointsIterator.first ? 'A' : ( wayPointsIterator.last ? ' B' : wayPointsIterator.index );
			var placeholder = wayPointsIterator.first ? g_Translator.getText ( 'RouteEditorUI - Start' ) : ( wayPointsIterator.last ? g_Translator.getText ( 'RouteEditorUI - End' ) : g_Translator.getText ( 'RouteEditorUI - Via' ) );
			m_WayPointsList.addItem ( wayPointsIterator.value.UIName, indexName, placeholder, wayPointsIterator.value.objId, wayPointsIterator.last );
		}
	};
	
	/*
	--- routeEditorUI object ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return  Object.seal (
		{
			createUI : function ( controlDiv ) { 
				m_CreateUI ( controlDiv ); 
			},
	
			expand : function ( ) {
				m_ExpandUI ( );
			},
			
			reduce : function ( ) {
				m_ReduceUI ( );
			},

			setWayPointsList : function ( ) {
				m_SetWayPointsList ( );
			}
		}
	);
};

/*
--- End of RouteEditorUI.js file --------------------------------------------------------------------------------------
*/