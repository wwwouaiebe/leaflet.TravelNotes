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
--- TravelEditorUI.js file --------------------------------------------------------------------------------------------
This file contains:
	- the newTravelEditorUI function
Changes:
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #26 : added confirmation message before leaving the page when data modified.
		- Issue #31 : Add a command to import from others maps
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- moving file functions from TravelEditor to the new FileLoader
		- modified event listener for cancel travel button ( issue #45 )
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
		- Issue #60 : Add translations for roadbook
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #63 : Find a better solution for provider keys upload
		- Issue #75 : Merge Maps and TravelNotes
Doc reviewed 20191125
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';
import { theRouteEditor } from '../core/RouteEditor.js';
import { theTravelEditor } from '../core/TravelEditor.js';

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newSortableList } from '../UI/SortableList.js';
import { newFileLoader } from '../core/FileLoader.js';
import { THE_CONST } from '../util/Constants.js';

/*
--- travelEditorUI function -------------------------------------------------------------------------------------------

This function creates the UI

-----------------------------------------------------------------------------------------------------------------------
*/

function newTravelEditorUI ( ) {

	let myRoutesList = null;

	/*
	--- event listeners for mouse on the control ----------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	let myHTMLElementsFactory = newHTMLElementsFactory ( );
	let myControlDiv = null;

	/*
	--- myCreateHeaderDiv function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateHeaderDiv ( ) {
		let headerDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-TravelHeaderDiv',
				className : 'TravelNotes-Control-HeaderDiv'
			},
			myControlDiv
		);

		// expand button
		myHTMLElementsFactory.create (
			'span',
			{
				innerHTML : '&#x25bc;',
				id : 'TravelNotes-ControlTravelExpandButton',
				className : 'TravelNotes-Control-ExpandButton'
			},
			headerDiv
		)
			.addEventListener (
				'click',
				clickEvent => {
					clickEvent.stopPropagation ( );
					document.getElementById ( 'TravelNotes-Control-TravelHeaderDiv' )
						.classList.toggle ( 'TravelNotes-Control-SmallHeader' );
					document.getElementById ( 'TravelNotes-Control-TravelDataDiv' )
						.classList.toggle ( 'TravelNotes-Control-HiddenList' );
					document.getElementById ( 'TravelNotes-ControlTravelButtonsDiv' )
						.classList.toggle ( 'TravelNotes-Control-HiddenList' );
					let hiddenList = document.getElementById ( 'TravelNotes-Control-TravelDataDiv' )
						.classList.contains ( 'TravelNotes-Control-HiddenList' );
					document.getElementById ( 'TravelNotes-ControlTravelExpandButton' ).innerHTML =
						hiddenList ? '&#x25b6;' : '&#x25bc;';
					document.getElementById ( 'TravelNotes-ControlTravelExpandButton' ).title =
						hiddenList
							?
							theTranslator.getText ( 'TravelEditorUI - Show' )
							:
							theTranslator.getText ( 'TravelEditorUI - Hide' );
					clickEvent.stopPropagation ( );
				},
				false );

		// title
		myHTMLElementsFactory.create (
			'span',
			{
				innerHTML : theTranslator.getText ( 'TravelEditorUI - Travel routes' ),
				id : 'TravelNotes-Control-TravelHeaderText',
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
				id : 'TravelNotes-Control-TravelDataDiv',
				className : 'TravelNotes-Control-DataDiv'
			},
			myControlDiv
		);

		// Routes list
		myRoutesList = newSortableList ( { minSize : THE_CONST.zero, id : 'TravelNotes-Control-TravelRoutesList' }, dataDiv );
		myRoutesList.container.addEventListener (
			'SortableListDelete',
			sortableListDeleteEvent => {
				sortableListDeleteEvent.stopPropagation ( );
				theTravelEditor.removeRoute ( sortableListDeleteEvent.itemNode.dataObjId );
			},
			false
		);
		myRoutesList.container.addEventListener (
			'SortableListUpArrow',
			sortableListUpArrowEvent => {
				sortableListUpArrowEvent.stopPropagation ( );
				theTravelEditor.swapRoute ( sortableListUpArrowEvent.itemNode.dataObjId, true );
			},
			false
		);
		myRoutesList.container.addEventListener (
			'SortableListDownArrow',
			sortableListDownArrowEvent => {
				sortableListDownArrowEvent.stopPropagation ( );
				theTravelEditor.swapRoute ( sortableListDownArrowEvent.itemNode.dataObjId, false );
			},
			false
		);
		myRoutesList.container.addEventListener (
			'SortableListRightArrow',
			sortableListRightArrowEvent => {
				sortableListRightArrowEvent.stopPropagation ( );
				theTravelEditor.editRoute ( sortableListRightArrowEvent.itemNode.dataObjId );
			},
			false
		);
		myRoutesList.container.addEventListener (
			'SortableListChange',
			sortableListChangeEvent => {
				sortableListChangeEvent.stopPropagation ();
				theTravelEditor.renameRoute (
					sortableListChangeEvent.dataObjId,
					sortableListChangeEvent.changeValue
				);
			},
			false
		);
		myRoutesList.container.addEventListener (
			'SortableListDrop',
			sortableListDropEvent => {
				sortableListDropEvent.stopPropagation ( );
				theTravelEditor.routeDropped (
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
		let buttonsDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ControlTravelButtonsDiv',
				className : 'TravelNotes-Control-ButtonsDiv'
			},
			myControlDiv
		);

		// expand list button
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-ExpandRoutesListButton',
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'TravelEditorUI - Expand the list' ),
				innerHTML : '&#x25bd;'
			},
			buttonsDiv
		)
			.addEventListener (
				'click',
				clickEvent => {
					clickEvent.stopPropagation ( );
					document.getElementById ( 'TravelNotes-Control-TravelDataDiv' )
						.classList.toggle ( 'TravelNotes-Control-ExpandedList' );
					let expandedList = document.getElementById ( 'TravelNotes-Control-TravelDataDiv' )
						.classList.contains ( 'TravelNotes-Control-ExpandedList' );
					document.getElementById ( 'TravelNotes-Control-ExpandRoutesListButton' ).innerHTML =
						expandedList ? '&#x25b3;' : '&#x25bd;';
					document.getElementById ( 'TravelNotes-Control-ExpandRoutesListButton' ).title =
						expandedList
							?
							theTranslator.getText ( 'TravelEditorUI - Reduce the list' )
							:
							theTranslator.getText ( 'TravelEditorUI - Expand the list' );
				},
				false
			);

		// cancel travel button
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-CancelTravelButton',
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'TravelEditorUI - Cancel travel' ),
				innerHTML : '&#x274c'
			},
			buttonsDiv
		)
			.addEventListener (
				'click',
				clickEvent => {
					clickEvent.stopPropagation ();
					theTravelEditor.clear ( );
					if ( theConfig.travelEditor.startupRouteEdition ) {
						theTravelEditor.editRoute ( theTravelNotesData.travel.routes.first.objId );
					}
					theTravelNotesData.map.fire ( 'travelnotesfileloaded', { readOnly : false, name : '' } );
				},
				false
			);

		// save travel button
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-SaveTravelButton',
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'TravelEditorUI - Save travel' ),
				innerHTML : '&#x1f4be;'
			},
			buttonsDiv
		)
			.addEventListener (
				'click',
				clickEvent => {
					clickEvent.stopPropagation ( );
					theTravelEditor.saveTravel ( );
				},
				false
			);

		// open travel button with the well know hack....
		// See also UserInterface.js. Click events are first going to the interface div...
		let openTravelDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-OpenTravelDiv'
			},
			buttonsDiv
		);
		myHTMLElementsFactory.create (
			'input',
			{
				id : 'TravelNotes-Control-OpenTravelInput',
				type : 'file',
				accept : '.trv'
			},
			openTravelDiv
		)
			.addEventListener (
				'change',
				changeEvent => {
					changeEvent.stopPropagation ( );
					theRouteEditor.cancelEdition ( );
					newFileLoader ( ).openLocalFile ( changeEvent );
				},
				false
			);
		let openTravelFakeDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-OpenTravelFakeDiv'
			},
			openTravelDiv
		);
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-OpenTravelButton',
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'TravelEditorUI - Open travel' ),
				innerHTML : '&#x1F4C2;'
			},
			openTravelFakeDiv
		)
			.addEventListener (
				'click',
				( ) => {
					if ( ! window.confirm (
						theTranslator.getText ( 'TravelEditor - This page ask to close; data are perhaps not saved.' )
					)
					) {
						return;
					}
					document.getElementById ( 'TravelNotes-Control-OpenTravelInput' ).click ( );
				},
				false
			);

		// import travel button with the well know hack....
		let importTravelDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-ImportTravelDiv'
			},
			buttonsDiv
		);
		myHTMLElementsFactory.create (
			'input',
			{
				id : 'TravelNotes-Control-ImportTravelInput',
				type : 'file',
				accept : '.trv,.map'
			},
			importTravelDiv
		)
			.addEventListener (
				'change',
				clickEvent => {
					clickEvent.stopPropagation ( );
					newFileLoader ( ).mergeLocalFile ( clickEvent );
				},
				false
			);
		let importTravelFakeDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-ImportTravelFakeDiv'
			},
			importTravelDiv
		);
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-ImportTravelButton',
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'TravelEditorUI - Import travel' ),
				innerHTML : '&#x1F30F;'
			},
			importTravelFakeDiv
		)
			.addEventListener (
				'click',
				( ) => {
					if ( THE_CONST.invalidObjId === theTravelNotesData.editedRouteObjId ) {
						document.getElementById ( 'TravelNotes-Control-ImportTravelInput' ).click ( );
					}
					else {
						theErrorsUI.showError (
							theTranslator.getText ( 'TravelEditorUI - Not possible to merge a travel when a route is edited' )
						);
					}
				},
				false
			);

		// roadbook button
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-OpenTravelRoadbookButton',
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'TravelEditorUI - Open travel roadbook' ),
				innerHTML :
					'<a class="TravelNotes-Control-LinkButton" href="TravelNotesRoadbook.html?lng=' +
					theConfig.language +
					'&page=' +
					theTravelNotesData.UUID +
					'" target="_blank">&#x1F4CB;</a>'
			},
			buttonsDiv
		);

		// add route button
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-Control-AddRoutesButton',
				className : 'TravelNotes-Control-Button',
				title : theTranslator.getText ( 'TravelEditorUI - New route' ),
				innerHTML : '+'
			},
			buttonsDiv
		)
			.addEventListener (
				'click',
				clickEvent => {
					clickEvent.stopPropagation ();
					theTravelEditor.addRoute ( );
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

		if ( document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ) ) {
			return;
		}

		myControlDiv = controlDiv;

		myCreateHeaderDiv ( );

		myCreateDataDiv ( );

		myCreateButtonsDiv ( );

	}

	/*
	--- mySetRoutesList function --------------------------------------------------------------------------------------

	This function fill the routes list

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetRoutesList ( ) {
		myRoutesList.removeAllItems ( );
		let routesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {
			myRoutesList.addItem (
				routesIterator.value.name,
				routesIterator.value.chain ? '&#x26d3;' : '',
				theTranslator.getText ( 'TravelEditorUI - Route' ),
				routesIterator.value.objId,
				false
			);
		}
	}

	/*
	--- travelEditorUI object -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			createUI : controlDiv => myCreateUI ( controlDiv ),

			setRoutesList : ( ) => mySetRoutesList ( )
		}
	);
}

/*
--- theTravelEditorUI object ------------------------------------------------------------------------------------------

The one and only one travelEditorUI

-----------------------------------------------------------------------------------------------------------------------
*/

const theTravelEditorUI = newTravelEditorUI ( );

export { theTravelEditorUI };

/*
--- End of TravelEditorUI.js file -------------------------------------------------------------------------------------
*/