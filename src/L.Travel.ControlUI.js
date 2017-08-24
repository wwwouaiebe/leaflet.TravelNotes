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

	L.Travel.getControlUI = function ( Map ) {

		var HTMLElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		var sortableList = require ( './SortableList' );
		
		var MainDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-MainDiv' } );

		var routesDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-RoutesDiv'}, MainDiv );
		HTMLElementsFactory.create ( 'h3', { innerHTML : 'Routes&nbsp;:'}, routesDiv );
		var RoutesList = sortableList ( { minSize : 1, placeholder : 'Route' }, routesDiv );
		
		var routesButtonsDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-routesButtonsDiv'}, routesDiv );
		var addRouteBtn = HTMLElementsFactory.create ( 'span', { id : 'TravelControl-addRoutesBtn', className: 'TravelControl-btn', innerHTML : '+'/*'&#x2719;'*/}, routesButtonsDiv );
		var deleteRouteBtn = HTMLElementsFactory.create ( 'span', { id : 'TravelControl-deleteRoutesBtn', className: 'TravelControl-btn', innerHTML : '&#x1f5d1;'}, routesButtonsDiv );
				
		var waypointsDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-WayPointsDiv'}, MainDiv );
		HTMLElementsFactory.create ( 'h3', { innerHTML : 'Points de passage&nbsp;:' }, waypointsDiv );
		var waypointsList = sortableList ( { minSize : 2, listType : 1, placeholders : [ 'Start', 'Via', 'End' ], texts : [ 'A', 'index', 'B' ]  }, waypointsDiv );

		var waypointsButtonsDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-waypointsButtonsDiv'}, waypointsDiv );
		var addWaypointsBtn = HTMLElementsFactory.create ( 'span', { id : 'TravelControl-addWaypointsBtn', className: 'TravelControl-btn', innerHTML : '+'/*'&#x2719;'*/}, waypointsButtonsDiv );
		var reverseWaypointsBtn = HTMLElementsFactory.create ( 'span', { id : 'TravelControl-reverseWaypointsBtn', className: 'TravelControl-btn', innerHTML : '&#x21C5;'}, waypointsButtonsDiv );
		var deleteWaypointsBtn = HTMLElementsFactory.create ( 'span', { id : 'TravelControl-deleteWaypointsBtn', className: 'TravelControl-btn', innerHTML : '&#x1f5d1;'}, waypointsButtonsDiv );

		var itineraryDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-ItineraryDiv'}, MainDiv );

		HTMLElementsFactory.create ( 'h3', { innerHTML : 'Itinéraire&nbsp;:' }, itineraryDiv );
		var errorDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-ItineraryDiv'}, MainDiv );
		
		return MainDiv;
	};

	
	/* --- End of L.Travel.ControlUI object --- */		

	L.travel.ControlUI = function ( Map ) {
		return L.Travel.getControlUI ( Map );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = L.travel.ControlUI;
	}

}());
