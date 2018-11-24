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
--- RouteEditorUI.js file ---------------------------------------------------------------------------------------------
This file contains:
	- the RouteEditorUI object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20170929
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var _Translator = require ( './Translator' ) ( );
	var _WayPointsList = null;

	// Events handler for expand and expand list buttons
	
	var onClickExpandButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );

		if ( -1 === require ( '../L.TravelNotes' ).routeEdition.routeInitialObjId ) {
			return;
		}

		document.getElementById ( 'TravelNotes-Control-RouteHeaderDiv' ).classList.toggle ( 'TravelNotes-Control-SmallHeader' );
		document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-Control-RouteButtonsDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.contains ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25bc;';
		document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).title = hiddenList ? _Translator.getText ( 'RouteEditorUI - Show' ) : _Translator.getText ( 'RouteEditorUI - Hide' );
	};
	
	var onClickExpandListButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.toggle ( 'TravelNotes-Control-ExpandedList' );
		var expandedList = document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.contains ( 'TravelNotes-Control-ExpandedList' );
		document.getElementById ( 'TravelNotes-Control-ExpandWayPointsListButton' ).innerHTML = expandedList ? '&#x25b3;' : '&#x25bd;';
		document.getElementById ( 'TravelNotes-Control-ExpandWayPointsListButton' ).title = expandedList ? _Translator.getText ( 'RouteEditorUI - Reduce the list' ) : _Translator.getText ( 'RouteEditorUI - Expand the list' );		
	};

	var RouteEditorUI = function ( ) {
				
		/*
		--- _CreateUI function ----------------------------------------------------------------------------------------

		This function creates the UI
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _CreateUI = function ( controlDiv ){ 

			if ( document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ) ) {
				return;
			}
			
			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
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
			var expandButton = htmlElementsFactory.create ( 
				'span', 
				{ 
					innerHTML : '&#x25bc;',
					id : 'TravelNotes-Control-RouteExpandButton',
					className : 'TravelNotes-Control-ExpandButton'
				},
				headerDiv 
			);
			expandButton.addEventListener ( 'click' , onClickExpandButton, false );
			
			// title
			htmlElementsFactory.create ( 
				'span', 
				{ 
					innerHTML : 
					_Translator.getText ( 'RouteEditorUI - Waypoints' ), 
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
			_WayPointsList = require ( './SortableList' ) ( 
				{
					minSize : 0,
					listStyle : 'LimitedSort',
					id : 'TravelNotes-Control-RouteWaypointsList'
				}, 
				dataDiv
			);
			_WayPointsList.container.addEventListener ( 
				'SortableListDelete', 
				function ( event ) {
					event.stopPropagation ( );
					require ( '../core/RouteEditor' ) ( ).removeWayPoint ( event.itemNode.dataObjId );
				},
				false
			);
			_WayPointsList.container.addEventListener ( 
				'SortableListUpArrow', 
				function ( event ) {
					event.stopPropagation ( );
					require ( '../core/RouteEditor' ) ( ).swapWayPoints ( event.itemNode.dataObjId, true );
				},
				false
			);
			_WayPointsList.container.addEventListener ( 
				'SortableListDownArrow', 
				function ( event ) {
					event.stopPropagation ( );
					require ( '../core/RouteEditor' ) ( ).swapWayPoints ( event.itemNode.dataObjId, false );
				}, 
				false
			);
			_WayPointsList.container.addEventListener ( 
				'SortableListChange', 
				function ( event ) {
					event.stopPropagation ( );
					require ( '../core/RouteEditor' ) ( ).renameWayPoint ( event.dataObjId, event.changeValue );
				}, 
				false 
			);
			_WayPointsList.container.addEventListener ( 
				'SortableListDrop', 
				function ( event ) {
					event.stopPropagation ( );
					require ( '../core/RouteEditor' ) ( ).wayPointDropped ( event.draggedObjId, event.targetObjId, event.draggedBefore );
				}, 
				false 
			);

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
			var expandListButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-ExpandWayPointsListButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Expand the list' ), 
					innerHTML : '&#x25bd;'
				}, 
				buttonsDiv 
			);
			expandListButton.addEventListener ( 'click' , onClickExpandListButton, false );

			// cancel route button
			var cancelRouteButton = htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelNotes-Control-CancelRouteButton',
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Cancel' ), 
					innerHTML : '&#x274c'
				},
				buttonsDiv 
			);
			cancelRouteButton.addEventListener ( 
				'click', 
				function ( event ) {
					event.stopPropagation ( );
					require ( '../core/RouteEditor' ) ( ).cancelEdition ( );
				},
				false 
			);
			
			// save route button
			var saveRouteButton = htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelNotes-Control-SaveRouteButton',
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Save' ), 
					innerHTML : '&#x1f4be;'
				},
				buttonsDiv 
			);
			saveRouteButton.addEventListener ( 
				'click', 
				function ( event ) {
					event.stopPropagation ( );
					require ( '../core/RouteEditor' ) ( ).saveEdition ( );
				}, 
				false 
			);
			
			// gpx button
			var gpxButton = htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelNotes-Control-gpxButton',
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Save the route in a gpx file' ), 
					innerHTML : 'gpx'
				},
				buttonsDiv 
			);
			gpxButton.addEventListener ( 
				'click', 
				function ( event ) {
					event.stopPropagation ( );
					require ( '../core/RouteEditor' ) ( ).saveGpx ( );
				}, 
				false 
			);
			
			// reverse wayPoints button
			var reverseWayPointsButton = htmlElementsFactory.create ( 
				'div',
				{ 
					id : 'TravelNotes-Control-ReverseWayPointsButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Invert waypoints' ),  
					innerHTML : '&#x21C5;'
				},
				buttonsDiv
			);
			reverseWayPointsButton.addEventListener ( 
				'click' , 
				function ( event ) {
					event.stopPropagation ( );
					require ( '../core/RouteEditor' ) ( ).reverseWayPoints ( );
				},
				false 
			);
			
			// add wayPoint button
			// Todo... not usefull without geocoding...
			/*
			var addWayPointButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-AddWayPointButton',
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Add waypoint' ), 
					innerHTML : '+'
				},
				buttonsDiv 
			);
			
			addWayPointButton.addEventListener ( 
				'click', 
				function ( event ) {
					event.stopPropagation ( );
					require ( '../core/RouteEditor' ) ( ).addWayPoint ( );
				},
				false 
			);
			*/
			
			// remove all wayPoints button
			var removeAllWayPointsButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-RemoveAllWayPointsButton', 
					className: 'TravelNotes-Control-Button',
					title: _Translator.getText ( 'RouteEditorUI - Delete all waypoints' ),
					innerHTML : '&#x267b;'
				}, 
				buttonsDiv
			);
			removeAllWayPointsButton.addEventListener ( 
				'click' , 
				function ( event ) {
					event.stopPropagation ( );
					require ( '../core/RouteEditor' ) ( ).removeAllWayPoints ( );
				},
				false
			);
		};
	
		/*
		--- _ExpandUI function ----------------------------------------------------------------------------------------

		This function expands the UI
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _ExpandUI = function ( ) {
			document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).innerHTML = '&#x25bc;';
			document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).title = 'Masquer';
			document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.remove ( 'TravelNotes-Control-HiddenList' );
			document.getElementById ( 'TravelNotes-Control-RouteButtonsDiv' ).classList.remove ( 'TravelNotes-Control-HiddenList' );
		};
		
		/*
		--- _ReduceUI function ----------------------------------------------------------------------------------------

		This function reduces the UI
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _ReduceUI = function ( ) {
			document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).innerHTML = '&#x25b6;';
			document.getElementById ( 'TravelNotes-Control-RouteExpandButton' ).title = 'Afficher';
			document.getElementById ( 'TravelNotes-Control-RouteDataDiv' ).classList.add ( 'TravelNotes-Control-HiddenList' );
			document.getElementById ( 'TravelNotes-Control-RouteButtonsDiv' ).classList.add ( 'TravelNotes-Control-HiddenList' );
		};
		
		/*
		--- _SetWayPointsList function --------------------------------------------------------------------------------

		This function fill the wayPoints list
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _SetWayPointsList = function ( ) {
			_WayPointsList.removeAllItems ( );

			if ( -1 === require ( '../L.TravelNotes' ).routeEdition.routeInitialObjId ) {
				return;
			}
			
			var wayPointsIterator = require ( '../L.TravelNotes' ).editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
				var indexName = wayPointsIterator.first ? 'A' : ( wayPointsIterator.last ? ' B' : wayPointsIterator.index );
				var placeholder = 
					wayPointsIterator.first ? _Translator.getText ( 'RouteEditorUI - Start' ) : ( wayPointsIterator.last ? _Translator.getText ( 'RouteEditorUI - End' ) : _Translator.getText ( 'RouteEditorUI - Via' ) );
				_WayPointsList.addItem ( wayPointsIterator.value.UIName, indexName, placeholder, wayPointsIterator.value.objId, wayPointsIterator.last );
			}
		};
		
		/*
		--- RouteEditorUI object --------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return {
			createUI : function ( controlDiv ) { 
				_CreateUI ( controlDiv ); 
			},
	
			expand : function ( ) {
				_ExpandUI ( );
			},
			
			reduce : function ( ) {
				_ReduceUI ( );
			},

			setWayPointsList : function ( ) {
				_SetWayPointsList ( );
			}
		};
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = RouteEditorUI;
	}

}());

/*
--- End of RouteEditorUI.js file --------------------------------------------------------------------------------------
*/