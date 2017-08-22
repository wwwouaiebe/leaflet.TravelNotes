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
	
	L.TravelRoutingEngine = L.TravelRoutingEngine || {};
	L.travelRoutingEngine = L.travelRoutingEngine || {};

	var _Map; // A reference to the map

	/* 
	--- L.TravelRoutingEngine.ControlUI object -----------------------------------------------------------------------------
	
	This object build the control contains
	
	Patterns : Closure
	------------------------------------------------------------------------------------------------------------------------
	*/

	L.TravelRoutingEngine.getControlUI = function ( Map ) {

		_Map = Map;
		var MainDiv = L.DomUtil.create ( 'div', 'TravelRoutingEngineControl-MainDiv' );
		MainDiv.id = 'TravelRoutingEngineControl-MainDiv';
		MainDiv.innerHTML = 'AAA';

		return MainDiv;
			
	};

	
	/* --- End of L.TravelRoutingEngine.ControlUI object --- */		

	L.travelRoutingEngine.ControlUI = function ( Map ) {
		return L.TravelRoutingEngine.getControlUI ( Map );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = L.travelRoutingEngine.ControlUI;
	}

}());
