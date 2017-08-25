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

	/* 
	--- L.Travel.ControlUI object -----------------------------------------------------------------------------
	
	This object build the control contains
	
	Patterns : Closure
	------------------------------------------------------------------------------------------------------------------------
	*/
	var RoutesList = null;
	var wayPointsList = null;
	
	var onClickDeleteRouteBtn = function ( clickEvent ) {
		RoutesList.removeAllItems ( );
	};
	var onClickAddRouteBtn = function ( clickEvent ) {
		RoutesList.addItem ( );
	};

	L.Travel.getControlUI = function ( ) {
		this.setTravelData = function ( travelData ) {
			var routes = travelData.routes;
			for ( var routesCounter = 0; routesCounter < routes.length; routesCounter ++ ) {
				routes [ routesCounter ].uiObjId = RoutesList.addItem ( routes [ routesCounter ].name, routes [ routesCounter ].objId );
			}
		};
		
		this.createUI = function ( ){ 
			var HTMLElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			var sortableList = require ( './SortableList' );
			
			this.MainDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-MainDiv' } );

			var routesDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-RoutesDiv'}, this.MainDiv );
			HTMLElementsFactory.create ( 'h3', { innerHTML : 'Routes&nbsp;:'}, routesDiv );
			RoutesList = sortableList ( { minSize : 0, placeholder : 'Route' }, routesDiv );
			
			var routesButtonsDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-routesButtonsDiv'}, routesDiv );
			var addRouteBtn = HTMLElementsFactory.create ( 'span', { id : 'TravelControl-addRoutesBtn', className: 'TravelControl-btn', innerHTML : '+'/*'&#x2719;'*/}, routesButtonsDiv );
			addRouteBtn.addEventListener ( 'click' , onClickAddRouteBtn, false );

			var deleteRouteBtn = HTMLElementsFactory.create ( 'span', { id : 'TravelControl-deleteRoutesBtn', className: 'TravelControl-btn', innerHTML : '&#x1f5d1;'}, routesButtonsDiv );
			deleteRouteBtn.addEventListener ( 'click' , onClickDeleteRouteBtn, false );
					
			var wayPointsDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-WayPointsDiv'}, this.MainDiv );
			HTMLElementsFactory.create ( 'h3', { innerHTML : 'Points de passage&nbsp;:' }, wayPointsDiv );
			wayPointsList = sortableList ( { minSize : 0, listType : 1, placeholders : [ 'Start', 'Via', 'End' ], texts : [ 'A', 'index', 'B' ]  }, wayPointsDiv );

			var wayPointsButtonsDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-wayPointsButtonsDiv'}, wayPointsDiv );
			var addWayPointsBtn = HTMLElementsFactory.create ( 'span', { id : 'TravelControl-addWayPointsBtn', className: 'TravelControl-btn', innerHTML : '+'/*'&#x2719;'*/}, wayPointsButtonsDiv );
			var reverseWayPointsBtn = HTMLElementsFactory.create ( 'span', { id : 'TravelControl-reverseWayPointsBtn', className: 'TravelControl-btn', innerHTML : '&#x21C5;'}, wayPointsButtonsDiv );
			var deleteWayPointsBtn = HTMLElementsFactory.create ( 'span', { id : 'TravelControl-deleteWayPointsBtn', className: 'TravelControl-btn', innerHTML : '&#x1f5d1;'}, wayPointsButtonsDiv );

			var itineraryDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-ItineraryDiv'}, this.MainDiv );

			HTMLElementsFactory.create ( 'h3', { innerHTML : 'Itinéraire&nbsp;:' }, itineraryDiv );
			var errorDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-ItineraryDiv'}, this.MainDiv );
		};

		this.createUI ( );
		var travelData = require ( './TravelData' ) ( );
		this.setTravelData ( travelData );
		
		return this.MainDiv;

	};

	
	/* --- End of L.Travel.ControlUI object --- */		

	L.travel.ControlUI = function ( ) {
		return L.Travel.getControlUI ( );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = L.travel.ControlUI;
	}

}());
