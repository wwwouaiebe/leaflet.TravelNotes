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
	
	var _TravelData = require ( './TravelData' ) ( );

	var _RoutesList = null;

	var _RoutesDiv = null;

	// Events listeners for buttons under the routes list
	var onClickDeleteAllRoutesButton = function ( clickEvent ) {
		_RoutesList.removeAllItems ( );

		_TravelData.routes.removeAll ( );	

		clickEvent.stopPropagation();
	};
	
	var onClickAddRouteButton = function ( clickEvent ) {
		var newRoute = require ( './Route' ) ( );
		
		_TravelData.routes.add ( newRoute );
		
		_RoutesList.addItem ( newRoute.name, newRoute.objId );

		clickEvent.stopPropagation();
	};
	
	var onClickExpandButton = function ( clickEvent ) {
		
		clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.toggle ( 'TravelControl-HiddenList' );
		clickEvent.target.parentNode.parentNode.childNodes[ 2 ].classList.toggle ( 'TravelControl-HiddenList' );
		clickEvent.target.innerHTML = clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.contains ( 'TravelControl-HiddenList' ) ? '&#x25b6;' : '&#x25bc;';
		clickEvent.target.title = clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.contains ( 'TravelControl-HiddenList' ) ? 'Afficher' : 'Masquer';

		clickEvent.stopPropagation ( );
	};
	
	// Events for buttons and input on the routes list items
	
	var onRoutesListDelete = function ( event ) {
		_TravelData.routes.remove ( event.itemNode.dataObjId );
		
		event.itemNode.parentNode.removeChild ( event.itemNode );
		
		event.stopPropagation ( );
	};

	var onRoutesListUpArrow = function ( event ) {
		_TravelData.routes.swap ( event.itemNode.dataObjId, true );
		event.itemNode.parentNode.insertBefore ( event.itemNode, event.itemNode.previousSibling );

		event.stopPropagation ( );
	};

	var onRoutesListDownArrow = function ( event ) {
		_TravelData.routes.swap ( event.itemNode.dataObjId, false );
		event.itemNode.parentNode.insertBefore ( event.itemNode.nextSibling, event.itemNode );
		
		event.stopPropagation ( );
	};

	var onRoutesListRightArrow = function ( event ) {
		event.stopPropagation();
		require ( './RouteEditor' ) ( ).editRoute ( _TravelData.routes.getAt ( event.itemNode.dataObjId ) );

		event.stopPropagation ( );
	};
	
	var onRouteslistChange = function ( event ) {
		_TravelData.routes.getAt ( event.dataObjId ).name = event.changeValue;
		
		event.stopPropagation();
	};
	
	var getRoutesUI = function ( ) {

		var _SetTravelData = function ( ) {
			var routes = _TravelData.routes;
			console.log ( _TravelData.object );
			var iterator = _TravelData.routes.iterator;
			while ( ! iterator.done ) {
				iterator.value.uiObjId = _RoutesList.addItem ( iterator.value.name, iterator.value.objId );
			}
		};
		
		var _CreateRoutesUI = function ( ){ 

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			// Routes
			_RoutesDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesDiv', className : 'TravelControl-Div'} );
			
			var headerRoutesDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesHeaderDiv', className : 'TravelControl-HeaderDiv'}, _RoutesDiv );
			var expandRouteButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc;', id : 'TravelControl-RoutesExpandButton', className : 'TravelControl-ExpandButton'}, headerRoutesDiv );
			expandRouteButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : 'Routes&nbsp;:', id : 'TravelControl-RoutesHeaderText', className : 'TravelControl-HeaderText'}, headerRoutesDiv );
			
			_RoutesList = require ( './SortableList' ) ( { minSize : 0, placeholders : ['Route'], id : 'TravelControl-RouteList' }, _RoutesDiv );
			_RoutesList.container.addEventListener ( 'SortableListDelete', onRoutesListDelete, false );
			_RoutesList.container.addEventListener ( 'SortableListUpArrow', onRoutesListUpArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListDownArrow', onRoutesListDownArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListRightArrow', onRoutesListRightArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListChange', onRouteslistChange, false );
			
			var routesButtonsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesButtonsDiv', className : 'TravelControl-ButtonsDiv' }, _RoutesDiv );
			var addRouteButton = htmlElementsFactory.create ( 'span', { id : 'TravelControl-AddRoutesButton', className: 'TravelControl-Button', title : 'Nouvelle route', innerHTML : '+'/*'&#x2719;'*/}, routesButtonsDiv );
			addRouteButton.addEventListener ( 'click' , onClickAddRouteButton, false );

			var deleteAllRoutesButton = htmlElementsFactory.create ( 
				'span',
				{ 
					id : 'TravelControl-DeleteAllRoutesButton', 
					className: 'TravelControl-Button', 
					title : 'Supprimer toutes les routes', 
					innerHTML : '&#x1f5d1;'
				},
				routesButtonsDiv
			);
			deleteAllRoutesButton.addEventListener ( 'click' , onClickDeleteAllRoutesButton, false );	
		};
		
		if ( ! _RoutesDiv ) {
			_CreateRoutesUI ( );
			_SetTravelData ( );
		}
		
		return {
			get UI ( ) { return _RoutesDiv; }
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRoutesUI;
	}

}());
