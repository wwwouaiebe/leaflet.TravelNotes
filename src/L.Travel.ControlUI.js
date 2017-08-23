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
		
		var MainDiv = HTMLElementsFactory.create ( 'div', { id : 'TravelControl-MainDiv' } );

		HTMLElementsFactory.create ( 'span', { innerHTML : 'Routes&nbsp;:'}, MainDiv );
		
		var sortableList = require ( './SortableList' );
		var RoutesList = sortableList ( { minSize : 1, placeholder : 'Route' }, MainDiv );
				
		HTMLElementsFactory.create ( 'span', { innerHTML : 'Points de passage&nbsp;:' }, MainDiv );
		var WaypointsList = sortableList ( { minSize : 4, listType : 1, placeholders : [ 'Start', 'Via', 'End' ], texts : [ 'A', 'index', 'B' ]  }, MainDiv );


		HTMLElementsFactory.create ( 'div', { id : 'TravelControl-WayPointsDiv', innerHTML : 'C'}, MainDiv );
		HTMLElementsFactory.create ( 'span', { innerHTML : 'Itinéraire&nbsp;:' }, MainDiv );
		HTMLElementsFactory.create ( 'div', { id : 'TravelControl-ItineraryDiv', innerHTML : 'D'}, MainDiv );
		
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
