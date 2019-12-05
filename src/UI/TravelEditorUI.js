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

export { gc_TravelEditorUI };

import { g_Translator } from '../UI/Translator.js';
import { g_Config } from '../data/Config.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { gc_ErrorsUI } from '../UI/ErrorsUI.js';
import { g_RouteEditor } from '../core/RouteEditor.js';
import { g_TravelEditor } from '../core/TravelEditor.js';

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newSortableList } from '../UI/SortableList.js';
import { newFileLoader } from '../core/FileLoader.js';

let m_RoutesList = null;

/*
--- travelEditorUI function -------------------------------------------------------------------------------------------

This function creates the UI

-----------------------------------------------------------------------------------------------------------------------
*/

function newTravelEditorUI ( ) {
			
	/*
	--- event listeners for mouse on the control ----------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	let m_HTMLElementsFactory = newHTMLElementsFactory ( ) ;
	let m_ControlDiv = null;
	
	/*
	--- m_CreateHeaderDiv function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateHeaderDiv ( ) {
		let headerDiv = m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-Control-TravelHeaderDiv', 
				className : 'TravelNotes-Control-HeaderDiv'
			},
			m_ControlDiv
		);

		// expand button
		m_HTMLElementsFactory.create (
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
							g_Translator.getText ( 'TravelEditorUI - Show' ) 
							:
							g_Translator.getText ( 'TravelEditorUI - Hide' );
					clickEvent.stopPropagation ( );
				}, 
				false );

		// title
		m_HTMLElementsFactory.create ( 
			'span', 
			{ 
				innerHTML : g_Translator.getText ( 'TravelEditorUI - Travel routes' ), 
				id : 'TravelNotes-Control-TravelHeaderText', 
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
				id : 'TravelNotes-Control-TravelDataDiv', 
				className : 'TravelNotes-Control-DataDiv'
			},
			m_ControlDiv 
		);
		
		// Routes list
		m_RoutesList = newSortableList ( { minSize : 0, id : 'TravelNotes-Control-TravelRoutesList' }, dataDiv );
		m_RoutesList.container.addEventListener ( 
			'SortableListDelete', 
			event => {
				event.stopPropagation ( );
				g_TravelEditor.removeRoute ( event.itemNode.dataObjId );
			}, 
			false 
		);
		m_RoutesList.container.addEventListener ( 
			'SortableListUpArrow', 
			event => {
				event.stopPropagation ( );
				g_TravelEditor.swapRoute ( event.itemNode.dataObjId, true );
			}, 
			false
		);
		m_RoutesList.container.addEventListener ( 
			'SortableListDownArrow', 
			event => {
				event.stopPropagation ( );
				g_TravelEditor.swapRoute ( event.itemNode.dataObjId, false );
			}, 
			false 
		);
		m_RoutesList.container.addEventListener ( 
			'SortableListRightArrow', 
			event => {
				event.stopPropagation ( );
				g_TravelEditor.editRoute ( event.itemNode.dataObjId );
			}, 
			false 
		);
		m_RoutesList.container.addEventListener ( 
			'SortableListChange', 
			event => {
				event.stopPropagation ();
				g_TravelEditor.renameRoute ( event.dataObjId, event.changeValue );
			}, 
			false 
		);
		m_RoutesList.container.addEventListener ( 
			'SortableListDrop', 
			event => {
				event.stopPropagation ( );
				g_TravelEditor.routeDropped ( event.draggedObjId, event.targetObjId, event.draggedBefore );
			}, 
			false 
		);
	}

	/*
	--- m_CreateButtonsDiv function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateButtonsDiv ( ) {
		let buttonsDiv = m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-ControlTravelButtonsDiv', 
				className : 'TravelNotes-Control-ButtonsDiv'
			}, 
			m_ControlDiv
		);

		// expand list button
		m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-Control-ExpandRoutesListButton', 
				className : 'TravelNotes-Control-Button', 
				title : g_Translator.getText ( 'TravelEditorUI - Expand the list' ), 
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
							g_Translator.getText ( 'TravelEditorUI - Reduce the list' )
							: 
							g_Translator.getText ( 'TravelEditorUI - Expand the list' );		
				}, 
				false 
			);
		
		// cancel travel button
		m_HTMLElementsFactory.create (
			'div', 
			{ 
				id : 'TravelNotes-Control-CancelTravelButton',
				className : 'TravelNotes-Control-Button', 
				title : g_Translator.getText ( 'TravelEditorUI - Cancel travel' ), 
				innerHTML : '&#x274c'
			},
			buttonsDiv 
		)
			.addEventListener ( 
				'click', 
				clickEvent => {
					clickEvent.stopPropagation ();
					g_TravelEditor.clear ( );
					if ( g_Config.travelEditor.startupRouteEdition ) {
						g_TravelEditor.editRoute ( g_TravelNotesData.travel.routes.first.objId );
					}
					g_TravelNotesData.map.fire ( 'travelnotesfileloaded', { readOnly : false, name : '' } );
				}, 
				false 
			);

		// save travel button
		m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-Control-SaveTravelButton', 
				className : 'TravelNotes-Control-Button', 
				title : g_Translator.getText ( 'TravelEditorUI - Save travel' ), 
				innerHTML : '&#x1f4be;'
			}, 
			buttonsDiv 
		)
			.addEventListener ( 
				'click', 
				clickEvent => {
					clickEvent.stopPropagation ( );
					g_TravelEditor.saveTravel ( );
				}, 
				false 
			);

		// open travel button with the well know hack....
		// See also UserInterface.js. Click events are first going to the interface div...
		let openTravelDiv = m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-Control-OpenTravelDiv'
			}, 
			buttonsDiv 
		);
		m_HTMLElementsFactory.create ( 
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
				clickEvent => {
					clickEvent.stopPropagation ( );
					g_RouteEditor.cancelEdition ( );
					newFileLoader ( ).openLocalFile ( clickEvent );
				}, 
				false
			);
		let openTravelFakeDiv = m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-Control-OpenTravelFakeDiv'
			}, 
			openTravelDiv 
		);
		m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-Control-OpenTravelButton', 
				className : 'TravelNotes-Control-Button', 
				title : g_Translator.getText ( 'TravelEditorUI - Open travel' ), 
				innerHTML : '&#x1F4C2;'
			}, 
			openTravelFakeDiv 
		)
			.addEventListener ( 
				'click', 
				( ) => { 
					if ( ! window.confirm ( 
						g_Translator.getText ( "TravelEditor - This page ask to close; data are perhaps not saved." )
					) 
					) {
						return;
					}
					document.getElementById ( 'TravelNotes-Control-OpenTravelInput' ).click ( );
				}, 
				false 
			);

		// import travel button with the well know hack....
		let importTravelDiv = m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-Control-ImportTravelDiv'
			}, 
			buttonsDiv 
		);
		m_HTMLElementsFactory.create ( 
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
		let importTravelFakeDiv = m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-Control-ImportTravelFakeDiv'
			}, 
			importTravelDiv 
		);
		m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-Control-ImportTravelButton', 
				className : 'TravelNotes-Control-Button', 
				title : g_Translator.getText ( 'TravelEditorUI - Import travel' ), 
				innerHTML : '&#x1F30F;'
			}, 
			importTravelFakeDiv 
		)
			.addEventListener ( 
				'click', 
				( ) => { 
					if ( -1 === g_TravelNotesData.editedRouteObjId  ) {
						document.getElementById ( 'TravelNotes-Control-ImportTravelInput' ).click ( );
					}
					else {
						gc_ErrorsUI.showError ( 
							g_Translator.getText ( "TravelEditorUI - Not possible to merge a travel when a route is edited" ) 
						);
					}
				},
				false 
			);

		// roadbook button
		m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-Control-OpenTravelRoadbookButton', 
				className : 'TravelNotes-Control-Button', 
				title : g_Translator.getText ( 'TravelEditorUI - Open travel roadbook' ), 
				innerHTML : 
					'<a class="TravelNotes-Control-LinkButton" href="TravelNotesRoadbook.html?lng=' + 
					g_Config.language +
					'&page=' + 
					g_TravelNotesData.UUID + 
					'" target="_blank">&#x1F4CB;</a>'
			}, 
			buttonsDiv
		);
				
		// add route button
		m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-Control-AddRoutesButton', 
				className : 'TravelNotes-Control-Button', 
				title : g_Translator.getText ( 'TravelEditorUI - New route' ), 
				innerHTML : '+'
			}, 
			buttonsDiv 
		)
			.addEventListener ( 
				'click', 
				event => {
					event.stopPropagation ();
					g_TravelEditor.addRoute ( );
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
	
		if ( document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ) ) {
			return;
		}
		
		m_ControlDiv = controlDiv;

		m_CreateHeaderDiv ( );
		
		m_CreateDataDiv ( );
		
		m_CreateButtonsDiv ( )
		
	}
	
	/*
	--- m_SetRoutesList function --------------------------------------------------------------------------------------

	This function fill the routes list
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SetRoutesList (  ) {
		m_RoutesList.removeAllItems ( );
		let routesIterator = g_TravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {
			m_RoutesList.addItem ( 
				routesIterator.value.name, 
				routesIterator.value.chain ? '&#x26d3;' : '',
				g_Translator.getText ( 'TravelEditorUI - Route' ), 
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
			createUI : controlDiv => m_CreateUI ( controlDiv ),
			
			setRoutesList : (  ) => m_SetRoutesList ( )
		}
	);
}

/* 
--- gc_TravelEditorUI object ------------------------------------------------------------------------------------------

The one and only one travelEditorUI

-----------------------------------------------------------------------------------------------------------------------
*/

const gc_TravelEditorUI = newTravelEditorUI ( );	

/*
--- End of TravelEditorUI.js file -------------------------------------------------------------------------------------
*/