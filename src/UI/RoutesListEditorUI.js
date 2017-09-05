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

( function ( ){
	
	'use strict';
	
	var _Translator = require ( './Translator' ) ( );
	
	// Events listeners for buttons under the routes list
	var onClickDeleteAllRoutesButton = function ( clickEvent ) {
		clickEvent.stopPropagation();
		require ( '../core/RoutesListEditor' ) ( ).removeAllRoutes ( );
	};

	var onClickAddRouteButton = function ( event ) {
		event.stopPropagation();
		require ( '../core/RoutesListEditor' ) ( ).addRoute ( );
	};
	
	// Events for buttons and input on the routes list items
	var onRoutesListDelete = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/RoutesListEditor' ) ( ).removeRoute ( event.itemNode.dataObjId );
	};

	var onRoutesListUpArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/RoutesListEditor' ) ( ).swapRoute ( event.itemNode.dataObjId, true );
	};

	var onRoutesListDownArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/RoutesListEditor' ) ( ).swapRoute ( event.itemNode.dataObjId, false );
	};

	var onRoutesListRightArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/RoutesListEditor' ) ( ).editRoute ( event.itemNode.dataObjId );
	};
	
	var onRouteslistChange = function ( event ) {
		event.stopPropagation();
		require ( '../core/RoutesListEditor' ) ( ).renameRoute ( event.dataObjId, event.changeValue );
	};
	
	var onClickExpandButton = function ( clickEvent ) {

		clickEvent.stopPropagation ( );
		
		document.getElementById ( 'TravelControl-RoutesHeaderDiv' ).classList.toggle ( 'TravelControl-SmallHeader' );
		document.getElementById ( 'TravelControl-RoutesDataDiv' ).classList.toggle ( 'TravelControl-HiddenList' );
		document.getElementById ( 'TravelControl-RoutesButtonsDiv' ).classList.toggle ( 'TravelControl-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelControl-RoutesDataDiv' ).classList.contains ( 'TravelControl-HiddenList' );
		document.getElementById ( 'TravelControl-RoutesExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25bc;';
		document.getElementById ( 'TravelControl-RoutesExpandButton' ).title = hiddenList ? _Translator.getText ( 'RoutesListEditorUI - Show' ) : _Translator.getText ( 'RoutesListEditorUI - Hide' );

		clickEvent.stopPropagation ( );
	};
	
	var onClickExpandListButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		
		document.getElementById ( 'TravelControl-RoutesDataDiv' ).classList.toggle ( 'TravelControl-ExpandedList' );
		var expandedList = document.getElementById ( 'TravelControl-RoutesDataDiv' ).classList.contains ( 'TravelControl-ExpandedList' );
		document.getElementById ( 'TravelControl-ExpandRoutesListButton' ).innerHTML = expandedList ? '&#x25b3;' : '&#x25bd;';
		document.getElementById ( 'TravelControl-ExpandRoutesListButton' ).title = expandedList ? _Translator.getText ( 'RoutesListEditorUI - Reduce the list' ) : _Translator.getText ( 'RoutesListEditorUI - Expand the list' );		
	};

	// User interface

	var _RoutesList = null;

	var getRoutesListEditorUI = function ( ) {
				
		var _CreateUI = function ( controlDiv ){ 
		
			if ( document.getElementById ( 'TravelControl-RoutesDataDiv' ) ) {
				return;
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			// Routes
			
			var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesHeaderDiv', className : 'TravelControl-HeaderDiv'}, controlDiv );
			var expandButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc;', id : 'TravelControl-RoutesExpandButton', className : 'TravelControl-ExpandButton'}, headerDiv );
			expandButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : _Translator.getText ( 'RoutesListEditorUI - Routes' ), id : 'TravelControl-RoutesHeaderText', className : 'TravelControl-HeaderText'}, headerDiv );
			var dataDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesDataDiv', className : 'TravelControl-DataDiv'}, controlDiv );
			
			_RoutesList = require ( './SortableList' ) ( { minSize : 0, placeholders : [ _Translator.getText ( 'RoutesListEditorUI - Route' )], id : 'TravelControl-RouteList' }, dataDiv );
			_RoutesList.container.addEventListener ( 'SortableListDelete', onRoutesListDelete, false );
			_RoutesList.container.addEventListener ( 'SortableListUpArrow', onRoutesListUpArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListDownArrow', onRoutesListDownArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListRightArrow', onRoutesListRightArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListChange', onRouteslistChange, false );
			
			var buttonsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesButtonsDiv', className : 'TravelControl-ButtonsDiv' }, controlDiv );

			var expandListButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelControl-ExpandRoutesListButton', 
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'RoutesListEditorUI - Expand the list' ), 
					innerHTML : '&#x25bd;'
				}, 
				buttonsDiv 
			);
			expandListButton.addEventListener ( 'click' , onClickExpandListButton, false );
			
			var addRouteButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelControl-AddRoutesButton', 
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'RoutesListEditorUI - New route' ), 
					innerHTML : '+'
				}, 
				buttonsDiv 
			);
			addRouteButton.addEventListener ( 'click' , onClickAddRouteButton, false );

			var deleteAllRoutesButton = htmlElementsFactory.create ( 
				'div',
				{ 
					id : 'TravelControl-DeleteAllRoutesButton', 
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'RoutesListEditorUI - Delete all routes' ), 
					innerHTML : '&#x267b;'
				},
				buttonsDiv
			);
			deleteAllRoutesButton.addEventListener ( 'click' , onClickDeleteAllRoutesButton, false );	
		};
		
		
		return {
			createUI : function ( controlDiv ) { 
				_CreateUI ( controlDiv ); 
			},
			
			writeRoutesList : function ( newRoutes ) {
				_RoutesList.removeAllItems ( );
				var routesIterator = newRoutes.iterator;
				while ( ! routesIterator.done ) {
					_RoutesList.addItem ( routesIterator.value.name, routesIterator.value.objId, false );
				}
			}
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRoutesListEditorUI;
	}

}());
