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
		_TravelData.removeAllRoutes ( );	
	};
	
	var onClickAddRouteBtn = function ( clickEvent ) {
		_TravelData.addRoute ( RoutesList.addItem ( ) );
	};
	
	var onClickExpandBtn = function ( clickEvent ) {
		
		clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.toggle ( 'TravelControl-HiddenList' );
		clickEvent.target.parentNode.parentNode.childNodes[ 2 ].classList.toggle ( 'TravelControl-HiddenList' );
		clickEvent.target.innerHTML = clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.contains ( 'TravelControl-HiddenList' ) ? '&#x25b6;' : '&#x25bc;';
	};

	L.Travel.getControlUI = function ( ) {
		this.setTravelData = function ( ) {
			var routes = _TravelData.routes;
			for ( var routesCounter = 0; routesCounter < routes.length; routesCounter ++ ) {
				routes [ routesCounter ].uiObjId = RoutesList.addItem ( routes [ routesCounter ].name, routes [ routesCounter ].objId );
			}
		};
		
		this.createUI = function ( ){ 
			var HTMLElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			var sortableList = require ( './SortableList' );
			
			this.MainDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-MainDiv' } );

			var routesDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-RoutesDiv'}, this.MainDiv );
			var headerRoutesDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-HeaderRoutesDiv', className : 'TravelControl-HeaderDiv'}, routesDiv );
			var expandRouteButton = HTMLElementsFactory.create ( 'span', { innerHTML : '&#x25bc;', className : 'TravelControl-ExpandButton'}, headerRoutesDiv );
			expandRouteButton.addEventListener ( 'click' , onClickExpandBtn, false );
			HTMLElementsFactory.create ( 'span', { innerHTML : 'Routes&nbsp;:', className : 'TravelControl-HeaderText'}, headerRoutesDiv );
			
			RoutesList = sortableList ( { minSize : 0, placeholders : ['Route'] }, routesDiv );
			
			var routesButtonsDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-routesButtonsDiv'}, routesDiv );
			var addRouteBtn = HTMLElementsFactory.create ( 'span', { id : 'TravelControl-addRoutesBtn', className: 'TravelControl-btn', innerHTML : '+'/*'&#x2719;'*/}, routesButtonsDiv );
			addRouteBtn.addEventListener ( 'click' , onClickAddRouteBtn, false );

			var deleteRouteBtn = HTMLElementsFactory.create ( 'span', { id : 'TravelControl-deleteRoutesBtn', className: 'TravelControl-btn', innerHTML : '&#x1f5d1;'}, routesButtonsDiv );
			deleteRouteBtn.addEventListener ( 'click' , onClickDeleteRouteBtn, false );
					
			var wayPointsDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-WayPointsDiv'}, this.MainDiv );
			var headerWayPointsDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-HeaderWaypointsDiv', className : 'TravelControl-HeaderDiv'}, wayPointsDiv );
			var expandWayPointsButton = HTMLElementsFactory.create ( 'span', { innerHTML : '&#x25bc', className : 'TravelControl-ExpandButton'}, headerWayPointsDiv );
			expandWayPointsButton.addEventListener ( 'click' , onClickExpandBtn, false );
			HTMLElementsFactory.create ( 'span', { innerHTML : 'Points de passage&nbsp;:', className : 'TravelControl-HeaderText'}, headerWayPointsDiv );

			wayPointsList = sortableList ( { minSize : 5, listStyle : 'LimitedSort', placeholders : [ 'Start', 'Via', 'End' ], indexNames : [ 'A', 'index', 'B' ]  }, wayPointsDiv );

			var wayPointsButtonsDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-wayPointsButtonsDiv'}, wayPointsDiv );
			var addWayPointsBtn = HTMLElementsFactory.create ( 'span', { id : 'TravelControl-addWayPointsBtn', className: 'TravelControl-btn', innerHTML : '+'/*'&#x2719;'*/}, wayPointsButtonsDiv );
			var reverseWayPointsBtn = HTMLElementsFactory.create ( 'span', { id : 'TravelControl-reverseWayPointsBtn', className: 'TravelControl-btn', innerHTML : '&#x21C5;'}, wayPointsButtonsDiv );
			var deleteWayPointsBtn = HTMLElementsFactory.create ( 'span', { id : 'TravelControl-deleteWayPointsBtn', className: 'TravelControl-btn', innerHTML : '&#x1f5d1;'}, wayPointsButtonsDiv );

			var itineraryDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-ItineraryDiv'}, this.MainDiv );

			HTMLElementsFactory.create ( 'span', { innerHTML : 'Itinéraire&nbsp;:', className : 'TravelControl-HeaderText' }, itineraryDiv );
			var errorDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-ItineraryDiv'}, this.MainDiv );
		};

		this.createUI ( );
		this.setTravelData ( );
		
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
