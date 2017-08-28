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
	
	var _WayPointsList = null;

	var _WayPointsDiv = null;

	
	//var _RouteEditor = require ( './RouteEditor' ) ( );

	var onAddWayPointButton = function ( event ) {
		event.stopPropagation ( );
		var newWayPoints = require ( './RouteEditor' ) ( ).addWayPoint ( );
	};
	
	var onReverseWayPointsButton = function ( event )
	{
		event.stopPropagation ( );
		var newWayPoints = require ( './RouteEditor' ) ( ).reverseWayPoints ( );
	};
	
	var onRemoveAllWayPointsButton = function ( event )
	{
		event.stopPropagation ( );
		var newWayPoints = require ( './RouteEditor' ) ( ).removeAllWayPoints ( );
	};
	
	// Events for buttons and input on the waypoints list items
	
	var onWayPointsListDelete = function ( event ) {
		event.stopPropagation ( );
		var newWayPoints = require ( './RouteEditor' ) ( ).removeWayPoint ( event.itemNode.dataObjId );
	};

	var onWayPointsListUpArrow = function ( event ) {
		event.stopPropagation ( );
		var newWayPoints = require ( './RouteEditor' ) ( ).swapWayPoints ( event.itemNode.dataObjId, true );
	};

	var onWayPointsListDownArrow = function ( event ) {
		event.stopPropagation ( );
		var newWayPoints = require ( './RouteEditor' ) ( ).swapWayPoints ( event.itemNode.dataObjId, false );
	};

	var onWayPointsListRightArrow = function ( event ) {
		event.stopPropagation ( );
	};

	var onWayPointslistChange = function ( event ) {
		event.stopPropagation ( );
		require ( './RouteEditor' ) ( ).renameWayPoint ( event.dataObjId, event.changeValue );
	};

	var onClickExpandButton = function ( clickEvent ) {
		clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.toggle ( 'TravelControl-HiddenList' );
		clickEvent.target.parentNode.parentNode.childNodes[ 2 ].classList.toggle ( 'TravelControl-HiddenList' );
		clickEvent.target.innerHTML = clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.contains ( 'TravelControl-HiddenList' ) ? '&#x25b6;' : '&#x25bc;';
		clickEvent.target.title = clickEvent.target.parentNode.parentNode.childNodes[ 1 ].classList.contains ( 'TravelControl-HiddenList' ) ? 'Afficher' : 'Masquer';

		clickEvent.stopPropagation ( );
	};
	
	// User interface
	
	var getRouteEditorUI = function ( ) {
				
		var _CreateRouteEditorUI = function ( ){ 

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			// WayPoints
			_WayPointsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-WayPointsDiv', className : 'TravelControl-Div'} );
			
			var headerWayPointsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-WaypointsHeaderDiv', className : 'TravelControl-HeaderDiv'}, _WayPointsDiv );
			var expandWayPointsButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc', id : 'TravelControl-WayPointsExpandButton', className : 'TravelControl-ExpandButton'}, headerWayPointsDiv );
			expandWayPointsButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : 'Points de passage&nbsp;:', id : 'TravelControl-WayPointsHeaderText',className : 'TravelControl-HeaderText'}, headerWayPointsDiv );

			_WayPointsList = require ( './SortableList' ) ( 
				{
					minSize : 0,
					listStyle : 'LimitedSort',
					placeholders : [ 'Start', 'Via', 'End' ],
					indexNames : [ 'A', 'index', 'B' ],
					id : 'TravelControl-WaypointsList'
				}, 
				_WayPointsDiv
			);
			_WayPointsList.container.addEventListener ( 'SortableListDelete', onWayPointsListDelete, false );
			_WayPointsList.container.addEventListener ( 'SortableListUpArrow', onWayPointsListUpArrow, false );
			_WayPointsList.container.addEventListener ( 'SortableListDownArrow', onWayPointsListDownArrow, false );
			_WayPointsList.container.addEventListener ( 'SortableListChange', onWayPointslistChange, false );

			var wayPointsButtonsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-WayPointsButtonsDiv', className : 'TravelControl-ButtonsDiv'}, _WayPointsDiv );
			var addWayPointButton = htmlElementsFactory.create ( 
				'span', 
				{ 
					id : 'TravelControl-AddWayPointButton',
					className: 'TravelControl-Button', 
					title : 'Ajouter un point de passage', 
					innerHTML : '+'
				},
				wayPointsButtonsDiv 
			);
			addWayPointButton.addEventListener ( 'click', onAddWayPointButton, false );
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
			reverseWayPointsButton.addEventListener ( 'click' , onReverseWayPointsButton, false );
			var removeAllWayPointsButton = htmlElementsFactory.create ( 
				'span', 
				{ 
					id : 'TravelControl-RemoveAllWayPointsButton', 
					className: 'TravelControl-Button',
					title: 'Supprimer tous les points de passage',
					innerHTML : '&#x1f5d1;'
				}, 
				wayPointsButtonsDiv
			);
			removeAllWayPointsButton.addEventListener ( 'click' , onRemoveAllWayPointsButton, false );

		};
	
		var _ExpandEditorUI = function ( ) {
			_WayPointsDiv.childNodes[ 0 ].firstChild.innerHTML = '&#x25bc;';
			_WayPointsDiv.childNodes[ 0 ].firstChild.title = 'Masquer';
			_WayPointsDiv.childNodes[ 1 ].classList.remove ( 'TravelControl-HiddenList' );
			_WayPointsDiv.childNodes[ 2 ].classList.remove ( 'TravelControl-HiddenList' );
		};
		
		var _ReduceEditorUI = function ( ) {
			_WayPointsDiv.childNodes[ 0 ].firstChild.innerHTML = '&#x25b6;';
			_WayPointsDiv.childNodes[ 0 ].firstChild.title = 'Afficher';
			_WayPointsDiv.childNodes[ 1 ].classList.add ( 'TravelControl-HiddenList' );
			_WayPointsDiv.childNodes[ 2 ].classList.add ( 'TravelControl-HiddenList' );
		};

		if ( ! _WayPointsDiv ) {
			_CreateRouteEditorUI ( );
			_ReduceEditorUI ( );
		}
		
		return {
			get UI ( ) { return _WayPointsDiv; },
	
			expand : function ( ) {
				_ExpandEditorUI ( );
			},
			reduce : function ( ) {
				_ReduceEditorUI ( );
			},

			writeWayPointsList : function ( newWayPoints ) {
				_WayPointsList.removeAllItems ( );
				
				var iterator = newWayPoints.iterator;
				while ( ! iterator.done ) {
					_WayPointsList.addItem ( iterator.value.UIName, iterator.value.objId, iterator.last );
				}
			}
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRouteEditorUI;
	}

}());
