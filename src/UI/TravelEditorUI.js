/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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
	- the TravelEditorUI object
	- the module.exports implementation
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
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var m_Translator = require ( './Translator' ) ( );
	var g_TravelNotesData = require ( '../L.TravelNotes' );
	var m_RoutesList = null;

	/*
	--- event listeners for mouse on the control ----------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	var m_TimerId = null;
	
	var onMouseEnterControl = function ( event ) {
		if ( m_TimerId ) {
			clearTimeout ( m_TimerId );
			m_TimerId = null;
		}
		document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.remove ( 'TravelNotes-Control-MainDiv-Minimize' );
		document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.add ( 'TravelNotes-Control-MainDiv-Maximize' );
	};
	
	var onTimeOut = function ( ) {
		document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.remove ( 'TravelNotes-Control-MainDiv-Maximize' );
		document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.add ( 'TravelNotes-Control-MainDiv-Minimize' );
	};
	
	var onMouseLeaveControl =function ( event ) {
		m_TimerId = setTimeout(onTimeOut, g_TravelNotesData.config.travelEditor.timeout );
	};

	/*
	--- event listener for Expand button ------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickExpandButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		document.getElementById ( 'TravelNotes-Control-TravelHeaderDiv' ).classList.toggle ( 'TravelNotes-Control-SmallHeader' );
		document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-ControlTravelButtonsDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ).classList.contains ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-ControlTravelExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25bc;';
		document.getElementById ( 'TravelNotes-ControlTravelExpandButton' ).title = hiddenList ? m_Translator.getText ( 'TravelEditorUI - Show' ) : m_Translator.getText ( 'TravelEditorUI - Hide' );
		clickEvent.stopPropagation ( );
	};
	
	/*
	--- event listener for Pin button ---------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickPinButton = function ( event ) {
		var control = document.getElementById ( 'TravelNotes-Control-MainDiv' );
		if ( 10060 === event.target.innerHTML.charCodeAt ( 0 ) ) {
			event.target.innerHTML = '&#x1f4cc;';
			control.addEventListener ( 'mouseenter', onMouseEnterControl, false );
			control.addEventListener ( 'mouseleave', onMouseLeaveControl, false );
		}
		else
		{
			event.target.innerHTML = '&#x274c;';
			control.removeEventListener ( 'mouseenter', onMouseEnterControl, false );
			control.removeEventListener ( 'mouseleave', onMouseLeaveControl, false );
		}
	};

	/*
	--- event listeners for sortableList ------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSortableListDelete = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).removeRoute ( event.itemNode.dataObjId );
	};

	var onSortableListUpArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).swapRoute ( event.itemNode.dataObjId, true );
	};
	
	var onSortableListDownArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).swapRoute ( event.itemNode.dataObjId, false );
	};
	
	var onSortableListRightArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).editRoute ( event.itemNode.dataObjId );
	};

	var onSortableListChange = function ( event ) {
		event.stopPropagation();
		require ( '../core/TravelEditor' ) ( ).renameRoute ( event.dataObjId, event.changeValue );
	};

	var onSortableListDrop = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).routeDropped ( event.draggedObjId, event.targetObjId, event.draggedBefore );
	}; 
	
	/*
	--- event listener for Expand list button -------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickExpandListButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ).classList.toggle ( 'TravelNotes-Control-ExpandedList' );
		var expandedList = document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ).classList.contains ( 'TravelNotes-Control-ExpandedList' );
		document.getElementById ( 'TravelNotes-Control-ExpandRoutesListButton' ).innerHTML = expandedList ? '&#x25b3;' : '&#x25bd;';
		document.getElementById ( 'TravelNotes-Control-ExpandRoutesListButton' ).title = expandedList ? m_Translator.getText ( 'TravelEditorUI - Reduce the list' ) : m_Translator.getText ( 'TravelEditorUI - Expand the list' );		
	};
	
	/*
	--- event listener for Cancel travel button -----------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	var onCancelTravelClick = function ( clickEvent ) {
		clickEvent.stopPropagation();
		require ( '../core/TravelEditor' ) ( ).clear ( );
		if ( require ( '../L.TravelNotes' ).config.travelEditor.startupRouteEdition ) {
			require ( '../core/RouteEditor' ) ( ).editRoute ( require ( '../L.TravelNotes' ).travel.routes.first.objId );
		}
		require ( '../L.TravelNotes' ).map.fire ( 'travelnotesfileloaded', { readOnly : false, name : '' } );
	};
				
	/*
	--- event listener for save travel button -------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickSaveTravelButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).saveTravel ( );
	};

	/*
	--- event listener for open travel input  -------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onChangeOpenTravelInput = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		require ( '../core/RouteEditor' ) ( ).cancelEdition ( );
		require ( '../core/FileLoader' ) ( ).openLocalFile ( clickEvent );
	};
	
	/*
	--- event listener for open travel  button ------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickOpenTravelButton = function ( ) 
	{ 
		if ( ! require ( '../core/TravelEditor' ) ( ).confirmClose ( ) )
		{
			return;
		}
		document.getElementById ( 'TravelNotes-Control-OpenTravelInput' ).click ( );
	};
	
	/*
	--- event listeners for import travel input and button ------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onChangeImportTravelInput = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		require ( '../core/FileLoader' ) ( ).mergeLocalFile ( clickEvent );
	};
	
	var onClickImportTravelButton = function ( event ) 
	{ 
		document.getElementById ( 'TravelNotes-Control-ImportTravelInput' ).click ( );
	};

	/*
	--- _event listeners for add route button -------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickAddRouteButton = function ( event ) {
		event.stopPropagation();
		require ( '../core/TravelEditor' ) ( ).addRoute ( );
	};
		

	/*
	--- travelEditorUI function ---------------------------------------------------------------------------------------

	This function creates the UI
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var travelEditorUI = function ( ) {
				
		/*
		--- m_CreateUI function ---------------------------------------------------------------------------------------

		This function creates the UI
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_CreateUI = function ( controlDiv ){ 
		
			if ( document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ) ) {
				return;
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			// header
			var headerDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-TravelHeaderDiv', 
					className : 'TravelNotes-Control-HeaderDiv'
				},
				controlDiv
			);

			// expand button
			htmlElementsFactory.create (
				'span',
				{ 
					innerHTML : '&#x25bc;', 
					id : 'TravelNotes-ControlTravelExpandButton', 
					className : 'TravelNotes-Control-ExpandButton'
				},
				headerDiv
			)
			.addEventListener ( 'click' , onClickExpandButton, false );

			// title
			htmlElementsFactory.create ( 
				'span', 
				{ 
					innerHTML : m_Translator.getText ( 'TravelEditorUI - Travel routes' ), 
					id : 'TravelNotes-Control-TravelHeaderText', 
					className : 'TravelNotes-Control-HeaderText'
				},
				headerDiv 
			);
		
			// pin button
			var pinButton = htmlElementsFactory.create (
				'span',
				{ 
					innerHTML : '&#x274c;', 
					id : 'TravelNotes-Control-PinButton', 
				},
				headerDiv
			);
			pinButton.addEventListener ( 'click', onClickPinButton, false );

			// data div
			var dataDiv = htmlElementsFactory.create ( 
				'div',
				{ 
					id : 'TravelNotes-Control-TravelDataDiv', 
					className : 'TravelNotes-Control-DataDiv'
				},
				controlDiv 
			);
			
			// Routes list
			m_RoutesList = require ( './SortableList' ) ( { minSize : 0, id : 'TravelNotes-Control-TravelRoutesList' }, dataDiv );
			m_RoutesList.container.addEventListener ( 'SortableListDelete', onSortableListDelete, false );
			m_RoutesList.container.addEventListener ( 'SortableListUpArrow', onSortableListUpArrow, false );
			m_RoutesList.container.addEventListener ( 'SortableListDownArrow', onSortableListDownArrow, false );
			m_RoutesList.container.addEventListener ( 'SortableListRightArrow', onSortableListRightArrow, false );
			m_RoutesList.container.addEventListener ( 'SortableListChange', onSortableListChange, false );
			m_RoutesList.container.addEventListener ( 'SortableListDrop', onSortableListDrop, false );
			
			// buttons div
			var buttonsDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-ControlTravelButtonsDiv', 
					className : 'TravelNotes-Control-ButtonsDiv'
				}, 
				controlDiv
			);

			// expand list button
			htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-ExpandRoutesListButton', 
					className: 'TravelNotes-Control-Button', 
					title : m_Translator.getText ( 'TravelEditorUI - Expand the list' ), 
					innerHTML : '&#x25bd;'
				}, 
				buttonsDiv 
			)
			.addEventListener ( 'click' , onClickExpandListButton, false );
			
			// cancel travel button
			htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelNotes-Control-CancelTravelButton',
					className: 'TravelNotes-Control-Button', 
					title : m_Translator.getText ( 'TravelEditorUI - Cancel travel' ), 
					innerHTML : '&#x274c'
				},
				buttonsDiv 
			)
			.addEventListener ( 'click', onCancelTravelClick, false );

			// save travel button
			htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-SaveTravelButton', 
					className: 'TravelNotes-Control-Button', 
					title : m_Translator.getText ( 'TravelEditorUI - Save travel' ), 
					innerHTML : '&#x1f4be;'
				}, 
				buttonsDiv 
			)
			.addEventListener ( 'click', onClickSaveTravelButton, false );

			// open travel button with the well know hack....
			// See also UserInterface.js. Click events are first going to the interface div...
			var openTravelDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id: 'TravelNotes-Control-OpenTravelDiv'
				}, 
				buttonsDiv 
			);
			htmlElementsFactory.create ( 
				'input',
				{
					id : 'TravelNotes-Control-OpenTravelInput', 
					type : 'file',
					accept : '.trv'
				},
				openTravelDiv
			)
			.addEventListener ( 'change', onChangeOpenTravelInput, false );
			var openTravelFakeDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id: 'TravelNotes-Control-OpenTravelFakeDiv'
				}, 
				openTravelDiv 
			);
			htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-OpenTravelButton', 
					className: 'TravelNotes-Control-Button', 
					title : m_Translator.getText ( 'TravelEditorUI - Open travel' ), 
					innerHTML : '&#x1F4C2;'
				}, 
				openTravelFakeDiv 
			)
			.addEventListener ( 'click' , onClickOpenTravelButton, false );

			// import travel button with the well know hack....
			var importTravelDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id: 'TravelNotes-Control-ImportTravelDiv'
				}, 
				buttonsDiv 
			);
			htmlElementsFactory.create ( 
				'input',
				{
					id : 'TravelNotes-Control-ImportTravelInput', 
					type : 'file',
					accept : '.trv,.map'
				},
				importTravelDiv
			)
			.addEventListener ( 'change', onChangeImportTravelInput, false );
			var importTravelFakeDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id: 'TravelNotes-Control-ImportTravelFakeDiv'
				}, 
				importTravelDiv 
			);
			htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-ImportTravelButton', 
					className: 'TravelNotes-Control-Button', 
					title : m_Translator.getText ( 'TravelEditorUI - Import travel' ), 
					innerHTML : '&#x1F30F;'
				}, 
				importTravelFakeDiv 
			)
			.addEventListener ( 'click' , onClickImportTravelButton, false );

			// roadbook button
			htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-OpenTravelRoadbookButton', 
					className: 'TravelNotes-Control-Button', 
					title : m_Translator.getText ( 'TravelEditorUI - Open travel roadbook' ), 
					innerHTML : '<a id="TravelNotes-Control-OpenTravelRoadbookLink" href="TravelNotesRoadbook.html?page=' + g_TravelNotesData.UUID + '" target="_blank">&#x1F4CB;</a>' //'&#x23CD;'
				}, 
				buttonsDiv
			);

			// add route button
			htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-AddRoutesButton', 
					className: 'TravelNotes-Control-Button', 
					title : m_Translator.getText ( 'TravelEditorUI - New route' ), 
					innerHTML : '+'
				}, 
				buttonsDiv 
			)
			.addEventListener ( 'click' , onClickAddRouteButton, false );
			if ( g_TravelNotesData.config.travelEditor.startMinimized ) {
				pinButton.innerHTML = '&#x1f4cc;';
				controlDiv.addEventListener ( 'mouseenter', onMouseEnterControl, false );
				controlDiv.addEventListener ( 'mouseleave', onMouseLeaveControl, false );
				controlDiv.classList.add ( 'TravelNotes-Control-MainDiv-Minimize' );
			}
			else {
				controlDiv.classList.add ( 'TravelNotes-Control-MainDiv-Maximize' );
			}
		};	
		
		/*
		--- m_SetRoutesList function ----------------------------------------------------------------------------------

		This function fill the routes list
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var m_SetRoutesList = function (  ) {
			m_RoutesList.removeAllItems ( );
			var routesIterator = g_TravelNotesData.travel.routes.iterator;
			while ( ! routesIterator.done ) {
				m_RoutesList.addItem ( routesIterator.value.name, routesIterator.value.chain ? '&#x26d3;' : '', m_Translator.getText ( 'TravelEditorUI - Route' ) ,routesIterator.value.objId, false );
			}
		};

		/*
		--- travelEditorUI object -------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{
				createUI : function ( controlDiv ) { m_CreateUI ( controlDiv ); },
				
				setRoutesList : function (  ) { m_SetRoutesList ( );	}
			}
		);
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = travelEditorUI;
	}

}());

/*
--- End of TravelEditorUI.js file -------------------------------------------------------------------------------------
*/