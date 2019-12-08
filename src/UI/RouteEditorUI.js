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

import { theTranslator } from '../UI/Translator.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theRouteEditor } from '../core/RouteEditor.js';
import { theWayPointEditor } from '../core/WayPointEditor.js';

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newSortableList } from '../UI/SortableList.js';
import { newUtilities } from '../util/Utilities.js';

import  { THE_CONST } from '../util/Constants.js';

let myWayPointsList = null;

/*
--- routeEditorUI function --------------------------------------------------------------------------------------------

This function creates the UI

-----------------------------------------------------------------------------------------------------------------------
*/

function newRouteEditorUI ( ) {

	let myControlDiv = null;
	let myHTMLElementsFactory = newHTMLElementsFactory ( );

	/*
	--- myCreateHeaderDiv function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateHeaderDiv ( ) {
		let headerDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-RouteHeaderDiv',
				className : 'TravelNotes-Control-HeaderDiv'
			},
			myControlDiv
		);

		// expand button
		myHTMLElementsFactory.create (
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
					if ( THE_CONST.invalidObjId === theTravelNotesData.editedRouteObjId ) {
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
							theTranslator.getText ( 'RouteEditorUI - Show' )
							:
							theTranslator.getText ( 'RouteEditorUI - Hide' );
				},
				false
			);

		// title
		myHTMLElementsFactory.create (
			'span',
			{
				innerHTML :
				theTranslator.getText ( 'RouteEditorUI - Waypoints' ),
				id : 'TravelNotes-Control-RouteHeaderText',
				className : 'TravelNotes-Control-HeaderText'
			},
			headerDiv
		);
	}

	/*
	--- myCreateDataDiv function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDataDiv ( ) {
		let dataDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-RouteDataDiv',
				className : 'TravelNotes-Control-DataDiv'
			},
			myControlDiv
		);

		// wayPoints list
		myWayPointsList = newSortableList (
			{
				minSize : THE_CONST.zero,
				listStyle : 'LimitedSort',
				id : 'TravelNotes-Control-RouteWaypointsList'
			},
			dataDiv
		);
		myWayPointsList.container.addEventListener (
			'SortableListDelete',
			sortableListDeleteEvent => {
				sortableListDeleteEvent.stopPropagation ( );
				theWayPointEditor.removeWayPoint ( sortableListDeleteEvent.itemNode.dataObjId );
			},
			false
		);
		myWayPointsList.container.addEventListener (
			'SortableListUpArrow',
			sortableListUpArrowEvent => {
				sortableListUpArrowEvent.stopPropagation ( );
				theWayPointEditor.swapWayPoints ( sortableListUpArrowEvent.itemNode.dataObjId, true );
			},
			false
		);
		myWayPointsList.container.addEventListener (
			'SortableListDownArrow',
			sortableListDownArrowEvent => {
				sortableListDownArrowEvent.stopPropagation ( );
				theWayPointEditor.swapWayPoints ( sortableListDownArrowEvent.itemNode.dataObjId, false );
			},
			false
		);
		myWayPointsList.container.addEventListener (
			'SortableListChange',
			SortableListChangeEvent => {
				SortableListChangeEvent.stopPropagation ( );
				theWayPointEditor.renameWayPoint (
					SortableListChangeEvent.dataObjId,
					SortableListChangeEvent.changeValue
				);
			},
			false
		);
		myWayPointsList.container.addEventListener (
			'SortableListDrop',
			sortableListDropEvent => {
				sortableListDropEvent.stopPropagation ( );
				theWayPointEditor.wayPointDropped (
					sortableListDropEvent.draggedObjId,
					sortableListDropEvent.targetObjId,
					sortableListDropEvent.draggedBefore
				);
			},
			false
		);
	}

	/*
	--- myCreateButtonsDiv function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateButtonsDiv ( ) {

		// buttons div
		let buttonsDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-RouteButtonsDiv',
				className : 'TravelNotes-Control-ButtonsDiv'
			},
			myControlDiv
		);

		// expand list button
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-ExpandWayPointsListButton',
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'RouteEditorUI - Expand the list' ),
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
							theTranslator.getText ( 'RouteEditorUI - Reduce the list' )
							:
							theTranslator.getText ( 'RouteEditorUI - Expand the list' );
				},
				false
			);

		// cancel route button
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-CancelRouteButton',
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'RouteEditorUI - Cancel' ),
				innerHTML : '&#x274c'
			},
			buttonsDiv
		)
			.addEventListener (
				'click',
				clickEvent => {
					clickEvent.stopPropagation ( );
					theRouteEditor.cancelEdition ( );
				},
				false
			);

		// save route button
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-SaveRouteButton',
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'RouteEditorUI - Save' ),
				innerHTML : '&#x1f4be;'
			},
			buttonsDiv
		)
			.addEventListener (
				'click',
				clickEvent => {
					clickEvent.stopPropagation ( );
					theRouteEditor.saveEdition ( );
				},
				false );

		// gpx button
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-gpxButton',
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'RouteEditorUI - Save the route in a gpx file' ),
				innerHTML : 'gpx'
			},
			buttonsDiv
		)
			.addEventListener (
				'click',
				clickEvent => {
					clickEvent.stopPropagation ( );
					theRouteEditor.saveGpx ( );
				},
				false
			);

		// reverse wayPoints button
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-ReverseWayPointsButton',
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'RouteEditorUI - Invert waypoints' ),
				innerHTML : '&#x21C5;'
			},
			buttonsDiv
		)
			.addEventListener (
				'click',
				clickEvent => {
					clickEvent.stopPropagation ( );
					theWayPointEditor.reverseWayPoints ( );
				},
				false
			);

		// remove all wayPoints button
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-RemoveAllWayPointsButton',
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'RouteEditorUI - Delete all waypoints' ),
				innerHTML : '&#x267b;'
			},
			buttonsDiv
		)
			.addEventListener (
				'click',
				clickEvent => {
					clickEvent.stopPropagation ( );
					theWayPointEditor.removeAllWayPoints ( );
				},
				false
			);
	}

	/*
	--- myCreateUI function -------------------------------------------------------------------------------------------

	This function creates the UI

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateUI ( controlDiv ) {

		if ( document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ) ) {
			return;
		}

		myControlDiv = controlDiv;

		myCreateHeaderDiv ( );
		myCreateDataDiv ( );
		myCreateButtonsDiv ( );
	}

	/*
	--- myExpandUI function -------------------------------------------------------------------------------------------

	This function expands the UI

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myExpandUI ( ) {
		document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).innerHTML = '&#x25bc;';
		document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).title = 'Masquer';
		document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.remove ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-Control-RouteButtonsDiv' ).classList.remove ( 'TravelNotes-Control-HiddenList' );
	}

	/*
	--- myReduceUI function -------------------------------------------------------------------------------------------

	This function reduces the UI

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myReduceUI ( ) {
		document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).innerHTML = '&#x25b6;';
		document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).title = 'Afficher';
		document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.add ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-Control-RouteButtonsDiv' ).classList.add ( 'TravelNotes-Control-HiddenList' );
	}

	/*
	--- mySetWayPointsList function -----------------------------------------------------------------------------------

	This function fill the wayPoints list

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetWayPointsList ( ) {
		myWayPointsList.removeAllItems ( );
		if ( THE_CONST.invalidObjId === theTravelNotesData.editedRouteObjId ) {
			return;
		}
		let wayPointsIterator = theTravelNotesData.travel.editedRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			let indexName = wayPointsIterator.first ? 'A' : ( wayPointsIterator.last ? ' B' : wayPointsIterator.index );
			let placeholder =
				wayPointsIterator.first
					?
					theTranslator.getText ( 'RouteEditorUI - Start' )
					:
					(
						wayPointsIterator.last
							?
							theTranslator.getText ( 'RouteEditorUI - End' )
							:
							theTranslator.getText ( 'RouteEditorUI - Via' )
					);
			myWayPointsList.addItem (
				newUtilities ( ).formatLatLng ( wayPointsIterator.value.latLng ),
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
			createUI : controlDiv => myCreateUI ( controlDiv ),
			expandUI : ( ) => myExpandUI ( ),
			reduceUI : ( ) => myReduceUI ( ),
			setWayPointsList : ( ) => mySetWayPointsList ( )
		}
	);
}

/*
--- theRouteEditorUI object --------------------------------------------------------------------------------------------

The one and only one routeEditorUI

-----------------------------------------------------------------------------------------------------------------------
*/

const theRouteEditorUI = newRouteEditorUI ( );

export { theRouteEditorUI };

/*
--- End of RouteEditorUI.js file --------------------------------------------------------------------------------------
*/