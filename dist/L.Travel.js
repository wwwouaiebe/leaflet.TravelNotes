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
	
	/* 
	--- HTMLElementsFactory object -----------------------------------------------------------------------------
	
	Patterns : Closure
	------------------------------------------------------------------------------------------------------------------------
	*/

	var getHTMLElementsFactory = function ( ) {

		return {
			create : function ( TagName, Properties, Parent ) {
				var Element;
				if ( 'text' === TagName.toLowerCase ( ) ) {
					Element = document.createTextNode ( '' );
				}
				else {
					Element = document.createElement ( TagName );
				}
				if ( Parent ) {
					Parent.appendChild ( Element );
				}
				if ( Properties )
				{
					for ( var prop in Properties ) {
						try {
							Element [ prop ] = Properties [ prop ];
						}
						catch ( e ) {
							console.log ( "Invalid property : " + prop );
						}
					}
				}
				return Element;
			}
			
		};
			
	};

	
	/* --- End of L.Travel.ControlUI object --- */		

	var HTMLElementsFactory = function ( ) {
		return getHTMLElementsFactory ( );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = HTMLElementsFactory;
	}

}());

},{}],2:[function(require,module,exports){
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
	
	L.Travel.Control = L.Control.extend ( {
		
			options : {
				position: 'topright'
			},
			
			initialize: function ( options ) {
					L.Util.setOptions( this, options );
			},
			
			onAdd : function ( Map ) {
				return require ('./L.Travel.ControlUI' ) ( Map );
			}
		}
	);

	L.travel.control = function ( options ) {
		return new L.Travel.Control ( options );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = L.travel.control;
	}

}());

},{"./L.Travel.ControlUI":3}],3:[function(require,module,exports){
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

},{"./HTMLElementsFactory":1,"./SortableList":5}],4:[function(require,module,exports){
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
	
	/* 
	--- L.Travel.Interface object -----------------------------------------------------------------------------
	
	This object contains all you need to use Travel :-)
	
	Patterns : Closure
	------------------------------------------------------------------------------------------------------------------------
	*/

	L.Travel.getInterface = function ( ) {

	
		return {

			/* --- public methods --- */
			
			/* addControl ( ) method --- 
			
			This method add the control 
			
			Parameters :
			
			*/

			addControl : function ( Map, options ) {
				if ( typeof module !== 'undefined' && module.exports ) {
					Map.addControl ( require ('./L.Travel.Control' ) ( options ) );
				}
				else {
					Map.addControl ( L.marker.pin.control ( options ) );
				}
			},
			
			addWayPoint : function ( WayPoint, WayPointPosition ) {
				console.log ( 'addWayPoint' );
			},
			
		};
	};
	
	/* --- End of L.Travel.Interface object --- */		

	L.travel.interface = function ( ) {
		return L.Travel.getInterface ( );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = L.travel.interface;
	}

}());

},{"./L.Travel.Control":2}],5:[function(require,module,exports){
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
	
	/* 
	--- SortableList object -----------------------------------------------------------------------------
	
	------------------------------------------------------------------------------------------------------------------------
	*/
	
	var onDragStart = function  ( DragEvent ) {
		DragEvent.stopPropagation(); // needed to avoid map movements
		try {
			DragEvent.dataTransfer.setData ( 'Text', '1' );
		}
		catch ( e ) {
		}
		console.log ( 'onDragStart' );
	};
	
	var onDragOver = function ( DragEvent ) {
		DragEvent.preventDefault();
		console.log ( 'onDragOver' );
	};
	
	var onDrop = function ( DragEvent ) { 
		DragEvent.preventDefault();
		var data = DragEvent.dataTransfer.getData("Text");
		console.log ( 'onDrop' );
	};

	/*
	var onDragEnd = function ( DragEvent ) { 
		console.log ( 'onDragEnd' );
	};
	
	var onDragEnter = function ( DragEvent ) { 
		console.log ( 'onDragLeave' );
	};
	var onDragLeave = function ( DragEvent ) { 
		console.log ( 'onDragEnter' );
	};
	*/

	var HTMLElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;

	
	var SortableList = function ( options, Parent ) {

		
		this.addItem = function ( options ) {
	
			var ItemContainer = HTMLElementsFactory.create ( 'div', { draggable : options.sortable, className : 'SortableListItem' + ( options.sortable ? ' MoveCursor': '')  }, this.Container );
			if ( options.sortable ) {
				L.DomEvent.on ( ItemContainer, 'dragstart', onDragStart );
				//L.DomEvent.on ( ItemContainer, 'dragenter', onDragEnter );
				//L.DomEvent.on ( ItemContainer, 'dragleave', onDragLeave );
				//L.DomEvent.on ( ItemContainer, 'dragend', onDragEnd );
				
				HTMLElementsFactory.create ( 'span', { className : 'SortableListTextArrow', innerHTML : String.fromCharCode( 8645 ) }, ItemContainer );
			}
			else {
				HTMLElementsFactory.create ( 'span', { className : 'SortableListTextArrow', innerHTML : '&nbsp;' }, ItemContainer );
			}
			HTMLElementsFactory.create ( 'span', { className : 'SortableListTextIndex', innerHTML : options.text }, ItemContainer );
			HTMLElementsFactory.create ( 'input', { type : 'text', className : 'SortableListInput', placeholder : options.placeholder }, ItemContainer );
			if ( options.sortable ) {
				HTMLElementsFactory.create ( 'span', { className : 'SortableListDelButton', innerHTML : '&#x1f5d1;' }, ItemContainer );
			}
			
			
			this.items [ this.size ] = ItemContainer;
			this.size ++;
		};
		
		this.setOptions = function ( options ) {
			for ( var option in options ) {
				this.options [ option ] = options [ option ];
			}
		};
		
		this.initialize = function ( options, Parent ) {
			this.options = { minSize : 2, listType : 0, placeholder : '', placeholders : [] , texts : [] } ;
			this.setOptions (options );
			this.size = 0;
			this.items = [];
			this.Container = HTMLElementsFactory.create ( 'div', { className : 'SortableListContainer' } );


			
			if ( Parent ) {
				Parent.appendChild ( this.Container );
				L.DomEvent.on ( Parent, 'dragover', onDragOver );
				L.DomEvent.on ( Parent, 'drop', onDrop );
			}
			for ( var ItemCounter = 0; ItemCounter < this.options.minSize; ItemCounter++ )
			{
				var itemOptions = { sortable : true , placeholder : this.options.placeholder, text : ''};
				itemOptions.sortable = true;
				if ( 1 === this.options.listType ) {
					if ( 0 === ItemCounter ) {
						itemOptions = { sortable : false , placeholder : this.options.placeholders [ 0 ], text : this.options.texts [ 0 ]};
					}
					else if ( ItemCounter === this.options.minSize - 1 )
					{
						itemOptions = { sortable : false , placeholder : this.options.placeholders [ 2 ], text : this.options.texts [ 2 ]};
					}
					else
					{
						itemOptions = { sortable : true , placeholder : this.options.placeholders [ 1 ], text : ItemCounter };
					}
				}
				this.addItem ( itemOptions );
			}
		};
		
		this.initialize ( options, Parent );
		
	};

	var sortableList = function ( options, Parent ) {
		return new SortableList ( options, Parent );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = sortableList;
	}

}());

},{"./HTMLElementsFactory":1}]},{},[4]);
