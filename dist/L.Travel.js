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

	/* 
	--- SortableList object -----------------------------------------------------------------------------
	
	------------------------------------------------------------------------------------------------------------------------
	*/

	var SortableList = function ( options, Parent ) {
		
		var HTMLElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		this.items = [];
		
		this._setItemsClasses = function ( )
		{
			for ( var itemPosition = 0; itemPosition < this.items.length; itemPosition ++ ){
				var item = this.items [ itemPosition ];
				var draggable = true;
				var deleteBtnClass = ' deleteBtn';
				var upArrowBtnClass = ' upArrowBtn';
				var downArrowBtnclass = ' downArrowBtn';
				var cursorClass = ' moveCursor';
				var placeholder = '';
				var itemName = '';
				if ( 0 === this.options.listType ) {
					placeholder = this.options.placeholder;
					if ( 0 === itemPosition ) {
						upArrowBtnClass = ' noUpArrowBtn';
					}
					if ( this.items.length === itemPosition + 1 ) {
						downArrowBtnclass = ' noDownArrowBtn';
					}
				}
				else if ( 1 === this.options.listType ) {
					placeholder = this.options.placeholders [ 1];
					itemName = itemPosition;
					if ( 0 === itemPosition ) {
						draggable = false;
						deleteBtnClass = ' noDeleteBtn';
						upArrowBtnClass = ' noUpArrowBtn';
						downArrowBtnclass = ' noDownArrowBtn';
						cursorClass = '';
						placeholder = this.options.placeholders [ 0];
						itemName = this.options.texts [ 0 ];
					}
					if ( 1 === itemPosition ) {
						upArrowBtnClass = ' noUpArrowBtn';
					}
					if ( this.items.length - 2 === itemPosition ) {
						downArrowBtnclass = ' noDownArrowBtn';
					}
					if ( this.items.length - 1 === itemPosition ) {
						draggable = false;
						deleteBtnClass = ' noDeleteBtn';
						upArrowBtnClass = ' noUpArrowBtn';
						downArrowBtnclass = ' noDownArrowBtn';
						cursorClass = '';
						placeholder = this.options.placeholders [ 2];
						itemName = this.options.texts [ 2 ];
					}
				}
				var className = 'SortableListItem' ;
				item.className = className + deleteBtnClass + upArrowBtnClass + downArrowBtnclass + cursorClass ;
				if ( item.draggable ) {
					item.removeEventListener ( 'dragstart', onDragStart, false );	
				}
				item.draggable = draggable;
				if ( draggable ) {
					item.addEventListener ( 'dragstart', onDragStart, false );	
				}
				item.firstChild.innerHTML = itemName;
				item.firstChild.nextSibling.placeholder = placeholder;
			}
		};

		this.removeItem = function ( ) {
			this._setItemsClasses ( );
		};
		
		this.moveItem = function ( ) {
			this._setItemsClasses ( );
		};
		
		this.addItem = function ( ) {
	
			var ItemContainer = HTMLElementsFactory.create ( 'div', { draggable : false   }, this.Container );

			HTMLElementsFactory.create ( 'span', { className : 'SortableListTextIndex' }, ItemContainer );
			HTMLElementsFactory.create ( 'input', { type : 'text', className : 'SortableListInput'}, ItemContainer );
			HTMLElementsFactory.create ( 'span', { className : 'SortableListDeleteBtn', innerHTML : '&#x1f5d1;' }, ItemContainer );
			HTMLElementsFactory.create ( 'span', { className : 'SortableListUpArrowBtn', innerHTML : String.fromCharCode( 8679 ) }, ItemContainer );
			HTMLElementsFactory.create ( 'span', { className : 'SortableListDownArrowBtn', innerHTML : String.fromCharCode( 8681 ) }, ItemContainer );

						
			this.items.push ( ItemContainer );
			this._setItemsClasses ( );
		};
		
		this._create = function ( options, Parent ) {

			// options
			
			// options.listType = 0 : all items can be sorted or deleted
			// options.listType = 1 : all items except first and last can be sorted or deleted
			
			this.options = { minSize : 2, listType : 0, placeholder : '', placeholders : [] , texts : [] } ;
			for ( var option in options ) {
				this.options [ option ] = options [ option ];
			}
			this.Container = HTMLElementsFactory.create ( 'div', { className : 'SortableListContainer' } );
			this.Container.addEventListener ( 'dragover', onDragOver, false );
			this.Container.addEventListener ( 'drop', onDrop, false );

			if ( Parent ) {
				Parent.appendChild ( this.Container );
			}
			
			for ( var ItemCounter = 0; ItemCounter < this.options.minSize; ItemCounter++ )
			{
				this.addItem ( );
			}
		};
		
		this._create ( options, Parent );
		
	};

	var sortableList = function ( options, Parent ) {
		return new SortableList ( options, Parent );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = sortableList;
	}

}());

},{"./HTMLElementsFactory":1}]},{},[4]);
