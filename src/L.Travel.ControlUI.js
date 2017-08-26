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
	
	L.Travel = L.Travel || {};
	L.travel = L.travel || {};

	var _Map; // A reference to the map
	var _TravelData = require ( './TravelData' ) ( );
	var _RoutesList = null;
	var _WayPointsList = null;

	/* 
	--- L.Travel.ControlUI object -----------------------------------------------------------------------------
	
	This object build the control contains
	
	Patterns : Closure
	------------------------------------------------------------------------------------------------------------------------
	*/
	
	var onClickDeleteRouteButton = function ( clickEvent ) {
		_RoutesList.removeAllItems ( );
		_TravelData.removeAllRoutes ( );	
	};
	
	var onClickAddRouteButton = function ( clickEvent ) {
		_TravelData.addRoute ( _RoutesList.addItem ( ) );
	};
	
	var onClickExpandButton = function ( clickEvent ) {
		
		clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.toggle ( 'TravelControl-HiddenList' );
		clickEvent.target.parentNode.parentNode.childNodes[ 2 ].classList.toggle ( 'TravelControl-HiddenList' );
		clickEvent.target.innerHTML = clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.contains ( 'TravelControl-HiddenList' ) ? '&#x25b6;' : '&#x25bc;';
		clickEvent.target.title = clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.contains ( 'TravelControl-HiddenList' ) ? 'Afficher' : 'Masquer';
	};
	var onSortableListDeleteElement = function ( event ) {
		console.log ( event.listId );
		console.log ( event.dataObjId );
	};

	L.Travel.getControlUI = function ( ) {

		this.setTravelData = function ( ) {
			var routes = _TravelData.routes;
			for ( var routesCounter = 0; routesCounter < routes.length; routesCounter ++ ) {
				routes [ routesCounter ].uiObjId = _RoutesList.addItem ( routes [ routesCounter ].name, routes [ routesCounter ].objId );
			}
		};
		
		this.createUI = function ( ){ 

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			this.mainDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-MainDiv' } );
			this.mainDiv.addEventListener ( 'SortableListDeleteElement', onSortableListDeleteElement, false );
			// Routes
			var routesDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesDiv', className : 'TravelControl-Div'}, this.mainDiv );
			
			var headerRoutesDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesHeaderDiv', className : 'TravelControl-HeaderDiv'}, routesDiv );
			var expandRouteButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc;', id : 'TravelControl-RoutesExpandButton', className : 'TravelControl-ExpandButton'}, headerRoutesDiv );
			expandRouteButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : 'Routes&nbsp;:', id : 'TravelControl-RoutesHeaderText', className : 'TravelControl-HeaderText'}, headerRoutesDiv );
			
			_RoutesList = require ( './SortableList' ) ( { minSize : 0, placeholders : ['Route'], id : 'TravelControl-RouteList' }, routesDiv );
			_RoutesList.container.addEventListener ( 'SortableListDeleteElement', onSortableListDeleteElement, false );
			
			var routesButtonsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesButtonsDiv', className : 'TravelControl-ButtonsDiv' }, routesDiv );
			var addRouteButton = htmlElementsFactory.create ( 'span', { id : 'TravelControl-AddRoutesButton', className: 'TravelControl-Button', title : 'Nouvelle route', innerHTML : '+'/*'&#x2719;'*/}, routesButtonsDiv );
			addRouteButton.addEventListener ( 'click' , onClickAddRouteButton, false );

			var deleteRouteButton = htmlElementsFactory.create ( 
				'span',
				{ 
					id : 'TravelControl-DeleteRoutesButton', 
					className: 'TravelControl-Button', 
					title : 'Supprimer toutes les routes', 
					innerHTML : '&#x1f5d1;'
				},
				routesButtonsDiv
			);
			deleteRouteButton.addEventListener ( 'click' , onClickDeleteRouteButton, false );
	
			// WayPoints
			var wayPointsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-WayPointsDiv', className : 'TravelControl-Div'}, this.mainDiv );
			
			var headerWayPointsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-WaypointsHeaderDiv', className : 'TravelControl-HeaderDiv'}, wayPointsDiv );
			var expandWayPointsButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc', id : 'TravelControl-WayPointsExpandButton', className : 'TravelControl-ExpandButton'}, headerWayPointsDiv );
			expandWayPointsButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : 'Points de passage&nbsp;:', id : 'TravelControl-WayPointsHeaderText',className : 'TravelControl-HeaderText'}, headerWayPointsDiv );

			_WayPointsList = require ( './SortableList' ) ( 
				{
					minSize : 5,
					listStyle : 'LimitedSort',
					placeholders : [ 'Start', 'Via', 'End' ],
					indexNames : [ 'A', 'index', 'B' ],
					id : 'TravelControl-WaypointsList'
				}, 
				wayPointsDiv
			);
			_WayPointsList.container.addEventListener ( 'SortableListDeleteElement', onSortableListDeleteElement, false );

			var wayPointsButtonsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-WayPointsButtonsDiv', className : 'TravelControl-ButtonsDiv'}, wayPointsDiv );
			var addWayPointsButton = htmlElementsFactory.create ( 
				'span', 
				{ 
					id : 'TravelControl-AddWayPointsButton',
					className: 'TravelControl-Button', 
					title : 'Ajouter un point de passage', 
					innerHTML : '+'
				},
				wayPointsButtonsDiv 
			);
			var reverseWayPointsButton = htmlElementsFactory.create ( 
				'span',
				{ 
					id : 'TravelControl-ReverseWayPointsButton', 
					className: 'TravelControl-Button', 
					title : 'Inverser les points de passage',  
					innerHTML : '&#x21C5;'
				},
				wayPointsButtonsDiv
			);
			var deleteWayPointsButton = htmlElementsFactory.create ( 
				'span', 
				{ 
					id : 'TravelControl-DeleteWayPointsButton', 
					className: 'TravelControl-Button',
					title: 'Supprimer tous les points de passage',
					innerHTML : '&#x1f5d1;'
				}, 
				wayPointsButtonsDiv
			);

			// Itinerary
			var itineraryDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-ItineraryDiv', className : 'TravelControl-Div'}, this.mainDiv );

			htmlElementsFactory.create ( 'span', { innerHTML : 'Itinéraire&nbsp;:', id : 'TravelControl-ItineraryHeaderText',className : 'TravelControl-HeaderText' }, itineraryDiv );
			
			// Errors
			var errorDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-ItineraryDiv', className : 'TravelControl-Div'}, this.mainDiv );
		};

		this.createUI ( );
		this.setTravelData ( );
		
		return this.mainDiv;

	};

	
	/* --- End of L.Travel.ControlUI object --- */		

	L.travel.ControlUI = function ( ) {
		return L.Travel.getControlUI ( );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = L.travel.ControlUI;
	}

}());
