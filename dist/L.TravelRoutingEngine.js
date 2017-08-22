(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
	
	L.TravelRoutingEngine.Control = L.Control.extend ( {
		
			options : {
				position: 'topright'
			},
			
			initialize: function ( options ) {
					L.Util.setOptions( this, options );
			},
			
			onAdd : function ( Map ) {
				return require ('./L.TravelRoutingEngine.ControlUI' ) ( Map );
			}
		}
	);

	L.travelRoutingEngine.control = function ( options ) {
		return new L.TravelRoutingEngine.Control ( options );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = L.travelRoutingEngine.control;
	}

}());

},{"./L.TravelRoutingEngine.ControlUI":2}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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
	
	/* 
	--- L.TravelRoutingEngine.Interface object -----------------------------------------------------------------------------
	
	This object contains all you need to use TravelRoutingEngine :-)
	
	Patterns : Closure
	------------------------------------------------------------------------------------------------------------------------
	*/

	L.TravelRoutingEngine.getInterface = function ( ) {

	
		return {

			/* --- public methods --- */
			
			/* addControl ( ) method --- 
			
			This method add the control 
			
			Parameters :
			
			*/

			addControl : function ( Map, DivControlId, options ) {
				if ( DivControlId )
				{
					document.getElementById ( DivControlId ).innerHTML = require ('./L.TravelRoutingEngine.ControlUI' ) ( Map ).outerHTML;
				}
				else
				{
					if ( typeof module !== 'undefined' && module.exports ) {
						Map.addControl ( require ('./L.TravelRoutingEngine.Control' ) ( options ) );
					}
					else {
						Map.addControl ( L.marker.pin.control ( options ) );
					}
				}
			},
			
			addWayPoint : function ( WayPoint, WayPointPosition ) {
				console.log ( 'addWayPoint' );
			},
			
		};
	};
	
	/* --- End of L.TravelRoutingEngine.Interface object --- */		

	L.travelRoutingEngine.interface = function ( ) {
		return L.TravelRoutingEngine.getInterface ( );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = L.travelRoutingEngine.interface;
	}

}());

},{"./L.TravelRoutingEngine.Control":1,"./L.TravelRoutingEngine.ControlUI":2}]},{},[3]);
