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
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { gc_RouteEditorUI };

import { g_Translator } from '../UI/Translator.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { g_RouteEditor } from '../core/RouteEditor.js';
import { g_WayPointEditor } from '../core/WayPointEditor.js';

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newSortableList } from '../UI/SortableList.js';

let m_WayPointsList = null;

/*
--- routeEditorUI function --------------------------------------------------------------------------------------------

This function creates the UI

-----------------------------------------------------------------------------------------------------------------------
*/

function newRouteEditorUI ( ) {

	let m_ControlDiv = null;
	let m_HTMLElementsFactory = newHTMLElementsFactory ( ) ;

	/*
	--- m_CreateHeaderDiv function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateHeaderDiv ( ) {
		let headerDiv = m_HTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-RouteHeaderDiv',
				className : 'TravelNotes-Control-HeaderDiv'
			},
			m_ControlDiv
		);

		// expand button
		m_HTMLElementsFactory.create (
			'span',
			{
				innerHTML : '&#x25bc;',
				id : 'TravelNotes-Control-RouteExpandButton',
				className : 'TravelNotes-Control-ExpandButton'
			},
			headerDiv
		)
			.addEventListener (
				'click',
				clickEvent => {
					clickEvent.stopPropagation ( );
					if ( -1 === g_TravelNotesData.editedRouteObjId ) {
						return;
					}
					document.getElementById ( 'TravelNotes-Control-RouteHeaderDiv' )
						.classList.toggle ( 'TravelNotes-Control-SmallHeader' );
					document.getElementById ( 'TravelNotes-Control-RouteDataDiv' )
						.classList.toggle ( 'TravelNotes-Control-HiddenList' );
					document.getElementById ( 'TravelNotes-Control-RouteButtonsDiv' )
						.classList.toggle ( 'TravelNotes-Control-HiddenList' );
					let hiddenList =
						document.getElementById ( 'TravelNotes-Control-RouteDataDiv' )
							.classList.contains ( 'TravelNotes-Control-HiddenList' );
					document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).innerHTML =
						hiddenList ? '&#x25b6;' : '&#x25bc;';
					document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).title =
						hiddenList
							?
							g_Translator.getText ( 'RouteEditorUI - Show' )
							:
							g_Translator.getText ( 'RouteEditorUI - Hide' );
				},
				false
			);

		// title
		m_HTMLElementsFactory.create (
			'span',
			{
				innerHTML :
				g_Translator.getText ( 'RouteEditorUI - Waypoints' ),
				id : 'TravelNotes-Control-RouteHeaderText',
				className : 'TravelNotes-Control-HeaderText'
			},
			headerDiv
		);
	}

	/*
	--- m_CreateDataDiv function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateDataDiv ( ) {
		let dataDiv = m_HTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-RouteDataDiv',
				className : 'TravelNotes-Control-DataDiv'
			},
			m_ControlDiv
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
		m_WayPointsList.container.addEventListener (
			'SortableListDelete',
			event => {
				event.stopPropagation ( );
				g_WayPointEditor.removeWayPoint ( event.itemNode.dataObjId );
			},
			false
		);
		m_WayPointsList.container.addEventListener (
			'SortableListUpArrow',
			event => {
				event.stopPropagation ( );
				g_WayPointEditor.swapWayPoints ( event.itemNode.dataObjId, true );
			},
			false
		);
		m_WayPointsList.container.addEventListener (
			'SortableListDownArrow',
			event => {
				event.stopPropagation ( );
				g_WayPointEditor.swapWayPoints ( event.itemNode.dataObjId, false );
			},
			false
		);
		m_WayPointsList.container.addEventListener (
			'SortableListChange',
			event => {
				event.stopPropagation ( );
				g_WayPointEditor.renameWayPoint ( event.dataObjId, event.changeValue );
			},
			false
		);
		m_WayPointsList.container.addEventListener (
			'SortableListDrop',
			event => {
				event.stopPropagation ( );
				g_WayPointEditor.wayPointDropped ( event.draggedObjId, event.targetObjId, event.draggedBefore );
			},
			false
		);
	}

	/*
	--- m_CreateButtonsDiv function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateButtonsDiv ( ) {

		// buttons div
		let buttonsDiv = m_HTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-RouteButtonsDiv',
				className : 'TravelNotes-Control-ButtonsDiv'
			},
			m_ControlDiv
		);

		// expand list button
		m_HTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-ExpandWayPointsListButton',
				className : 'TravelNotes-Control-Button',
				title : g_Translator.getText ( 'RouteEditorUI - Expand the list' ),
				innerHTML : '&#x25bd;'
			},
			buttonsDiv
		)
			.addEventListener (
				'click',
				clickEvent => {
					clickEvent.stopPropagation ( );
					document.getElementById ( 'TravelNotes-Control-RouteDataDiv' )
						.classList.toggle ( 'TravelNotes-Control-ExpandedList' );
					let expandedList =
						document.getElementById ( 'TravelNotes-Control-RouteDataDiv' )
							.classList.contains ( 'TravelNotes-Control-ExpandedList' );
					document.getElementById ( 'TravelNotes-Control-ExpandWayPointsListButton' ).innerHTML =
						expandedList ? '&#x25b3;' : '&#x25bd;';
					document.getElementById ( 'TravelNotes-Control-ExpandWayPointsListButton' ).title =
						expandedList
							?
							g_Translator.getText ( 'RouteEditorUI - Reduce the list' )
							:
							g_Translator.getText ( 'RouteEditorUI - Expand the list' );
				},
				false
			);

		// cancel route button
		m_HTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-CancelRouteButton',
				className : 'TravelNotes-Control-Button',
				title : g_Translator.getText ( 'RouteEditorUI - Cancel' ),
				innerHTML : '&#x274c'
			},
			buttonsDiv
		)
			.addEventListener (
				'click',
				event => {
					event.stopPropagation ( );
					g_RouteEditor.cancelEdition ( );
				},
				false
			);

		// save route button
		m_HTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-SaveRouteButton',
				className : 'TravelNotes-Control-Button',
				title : g_Translator.getText ( 'RouteEditorUI - Save' ),
				innerHTML : '&#x1f4be;'
			},
			buttonsDiv
		)
			.addEventListener (
				'click',
				event => {
					event.stopPropagation ( );
					g_RouteEditor.saveEdition ( );
				},
				false );

		// gpx button
		m_HTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-gpxButton',
				className : 'TravelNotes-Control-Button',
				title : g_Translator.getText ( 'RouteEditorUI - Save the route in a gpx file' ),
				innerHTML : 'gpx'
			},
			buttonsDiv
		)
			.addEventListener (
				'click',
				event => {
					event.stopPropagation ( );
					g_RouteEditor.saveGpx ( );
				},
				false
			);

		// reverse wayPoints button
		m_HTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-ReverseWayPointsButton',
				className : 'TravelNotes-Control-Button',
				title : g_Translator.getText ( 'RouteEditorUI - Invert waypoints' ),
				innerHTML : '&#x21C5;'
			},
			buttonsDiv
		)
			.addEventListener (
				'click',
				event => {
					event.stopPropagation ( );
					g_WayPointEditor.reverseWayPoints ( );
				},
				false
			);

		// remove all wayPoints button
		m_HTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-RemoveAllWayPointsButton',
				className : 'TravelNotes-Control-Button',
				title : g_Translator.getText ( 'RouteEditorUI - Delete all waypoints' ),
				innerHTML : '&#x267b;'
			},
			buttonsDiv
		)
			.addEventListener (
				'click',
				event => {
					event.stopPropagation ( );
					g_WayPointEditor.removeAllWayPoints ( );
				},
				false
			);
	}

	/*
	--- m_CreateUI function -------------------------------------------------------------------------------------------

	This function creates the UI

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateUI ( controlDiv ){

		if ( document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ) ) {
			return;
		}

		m_ControlDiv = controlDiv;

		m_CreateHeaderDiv ( );
		m_CreateDataDiv ( );
		m_CreateButtonsDiv ( );
	}

	/*
	--- m_ExpandUI function -------------------------------------------------------------------------------------------

	This function expands the UI

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ExpandUI ( ) {
		document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).innerHTML = '&#x25bc;';
		document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).title = 'Masquer';
		document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.remove ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-Control-RouteButtonsDiv' ).classList.remove ( 'TravelNotes-Control-HiddenList' );
	}

	/*
	--- m_ReduceUI function -------------------------------------------------------------------------------------------

	This function reduces the UI

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ReduceUI ( ) {
		document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).innerHTML = '&#x25b6;';
		document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).title = 'Afficher';
		document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.add ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-Control-RouteButtonsDiv' ).classList.add ( 'TravelNotes-Control-HiddenList' );
	}

	/*
	--- m_SetWayPointsList function -----------------------------------------------------------------------------------

	This function fill the wayPoints list

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SetWayPointsList ( ) {
		m_WayPointsList.removeAllItems ( );
		if ( -1 === g_TravelNotesData.editedRouteObjId ) {
			return;
		}
		let wayPointsIterator = g_TravelNotesData.travel.editedRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			let indexName = wayPointsIterator.first ? 'A' : ( wayPointsIterator.last ? ' B' : wayPointsIterator.index );
			let placeholder =
				wayPointsIterator.first
					?
					g_Translator.getText ( 'RouteEditorUI - Start' )
					:
					(
						wayPointsIterator.last
							?
							g_Translator.getText ( 'RouteEditorUI - End' )
							:
							g_Translator.getText ( 'RouteEditorUI - Via' )
					);
			m_WayPointsList.addItem (
				wayPointsIterator.value.UIName,
				indexName,
				placeholder,
				wayPointsIterator.value.objId,
				wayPointsIterator.last
			);
		}
	}

	/*
	--- routeEditorUI object ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return  Object.seal (
		{
			createUI : controlDiv => m_CreateUI ( controlDiv ),
			expandUI : ( ) => m_ExpandUI ( ),
			reduceUI : ( ) => m_ReduceUI ( ),
			setWayPointsList : ( ) => m_SetWayPointsList ( )
		}
	);
}

/*
--- gc_RouteEditorUI object --------------------------------------------------------------------------------------------

The one and only one routeEditorUI

-----------------------------------------------------------------------------------------------------------------------
*/

const gc_RouteEditorUI = newRouteEditorUI ( );

/*
--- End of RouteEditorUI.js file --------------------------------------------------------------------------------------
*/