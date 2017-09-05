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
	
	var _Translator = require ( './Translator' ) ( );

	var onClickExpandButton = function ( clickEvent ) {
		
		clickEvent.stopPropagation ( );

		document.getElementById ( 'TravelControl-ItineraryHeaderDiv' ).classList.toggle ( 'TravelControl-SmallHeader' );
		document.getElementById ( 'TravelControlItineraryDataDiv' ).classList.toggle ( 'TravelControl-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelControlItineraryDataDiv' ).classList.contains ( 'TravelControl-HiddenList' );
		document.getElementById ( 'TravelControl-ItineraryExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25bc;';
		document.getElementById ( 'TravelControl-ItineraryExpandButton' ).title = hiddenList ? _Translator.getText ( 'ItineraryEditorUI - Show' ) : _Translator.getText ( 'ItineraryEditorUI - Hide' );

	};
	
	var onInstructionClick = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		console.log ( 'onInstructionClick pntObjId : ' + clickEvent.target.itineraryPointObjId );
	};

	var onInstructionContextMenu = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		console.log ( 'onInstructionContextMenu pntObjId : ' + clickEvent.target.itineraryPointObjId );
	};

	var onMouseEnter = function ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		console.log ( 'onMouseEnter pntObjId : ' + mouseEvent.target.itineraryPointObjId );
	};

	var onMouseLeave = function ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		console.log ( 'onMouseLeave pntObjId : ' + mouseEvent.target.itineraryPointObjId );
	};

	var getItineraryEditorUI = function ( ) {
		
		var _CreateUI = function ( controlDiv ) {
			
			if ( document.getElementById ( 'TravelControl-ItineraryDataDiv' ) ) {
				return;
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;

			var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-ItineraryHeaderDiv', className : 'TravelControl-HeaderDiv'}, controlDiv );
			var expandButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc;', id : 'TravelControl-ItineraryExpandButton', className : 'TravelControl-ExpandButton'}, headerDiv );
			expandButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 
				'span', 
				{ 
					innerHTML : _Translator.getText ( 'ItineraryEditorUI - Itinerary and notes' ), 
					id : 'TravelControl-ItineraryHeaderText', 
					className : 'TravelControl-HeaderText'
				},
				headerDiv 
			);
			var dataDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-ItineraryDataDiv', className : 'TravelControl-DataDiv'}, controlDiv );
		};
		
		var formatTime = function ( time ) {
			time = Math.floor ( time );
			if ( 0 === time ) {
				return '';
			}
			var days = Math.floor ( time / 86400 );
			var hours = Math.floor ( time % 86400 / 3600 );
			var minutes = Math.floor ( time % 3600 / 60 );
			var seconds = Math.floor ( time % 60 );
			if ( 0 < days ) {
				return days + '&nbsp;jours&nbsp;' + hours + '&nbsp;h';
			}
			else if ( 0 < hours ) {
				return hours + '&nbsp;h&nbsp;' + minutes + '&nbsp;m';
			}
			else if ( 0 < minutes ) {
				return minutes + '&nbsp;m';
			}
			else {
				return seconds + '&nbsp;s';
			}
			return '';
		};
		
		var formatDistance = function ( distance ) {
			distance = Math.floor ( distance );
			if ( 0 === distance ) {
				return '';
			} 
			else if ( 1000 > distance ) {
				return distance + '&nbsp;m';
			}
			else {
				return Math.floor ( distance / 1000 ) +'.' + Math.floor ( ( distance % 1000 ) / 100 ) + '&nbsp;km';
			}
		};
		
		var _AddEventListeners = function ( element )
		{
			element.addEventListener ( 'click' , onInstructionClick, false );
			element.addEventListener ( 'contextmenu' , onInstructionContextMenu, false );
			element.addEventListener ( 'mouseenter' , onMouseEnter, false );
			element.addEventListener ( 'mouseleave' , onMouseLeave, false );
		};
		
		var _RemoveEventListeners = function ( element )
		{
			element.removeEventListener ( 'click' , onInstructionClick, false );
			element.removeEventListener ( 'contextmenu' , onInstructionContextMenu, false );
			element.removeEventListener ( 'mouseenter' , onMouseEnter, false );
			element.removeEventListener ( 'mouseleave' , onMouseLeave, false );
		};
		
		var _Itinerary = function ( itinerary ) {

			console.log ( itinerary.object );
		
			var dataDiv = document.getElementById ( 'TravelControl-ItineraryDataDiv' );
			if ( ! dataDiv ) {
				return;
			}
			
			var maneuverList = document.getElementById ( 'TravelControl-ManeuverList' );
			if ( maneuverList ) {
				for ( var childCounter = 0; childCounter < maneuverList.childNodes.length; childCounter ++ ) {
					_RemoveEventListeners ( maneuverList.childNodes [ childCounter ] );
				}
				dataDiv.removeChild ( maneuverList );
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			maneuverList = htmlElementsFactory.create (
				'div',
					{
						id : 'TravelControl-ManeuverList',
						className : 'TravelControl-TableDataDiv'
					}, 
				dataDiv
			);
			var maneuverIterator = itinerary.maneuvers.iterator;
			while ( ! maneuverIterator.done ) {
				var rowDataDiv = htmlElementsFactory.create ( 
					'div', 
					{ className : 'TravelControl-RowDataDiv'}, 
					maneuverList
				);
				
				htmlElementsFactory.create (
					'div',
					{ 
						className : 'TravelControl-CellDataDiv TravelControl-iconCellDataDiv TravelControl-' + maneuverIterator.value.iconName + 'Small',
					}, 
					rowDataDiv
				);
				
				var instructionElement = htmlElementsFactory.create (
					'div',
					{ 
						className : 'TravelControl-CellDataDiv',
						innerHTML : maneuverIterator.value.simplifiedInstruction
					}, 
					rowDataDiv
				);
				instructionElement.itineraryPointObjId = maneuverIterator.value.itineraryPointObjId;
				_AddEventListeners ( instructionElement );
				htmlElementsFactory.create (
					'div',
					{ 
						className : 'TravelControl-CellDataDiv TravelControl-ItineraryStreetName',
						innerHTML : maneuverIterator.value.streetName
					}, 
					rowDataDiv
				);
				htmlElementsFactory.create (
					'div',
					{ 
						className : 'TravelControl-CellDataDiv',
						innerHTML : maneuverIterator.value.direction
					}, 
					rowDataDiv
				);
				htmlElementsFactory.create (
					'div',
					{ 
						className : 'TravelControl-CellDataDiv TravelControl-ItineraryDistance',
						innerHTML : formatDistance ( maneuverIterator.value.distance )
					}, 
					rowDataDiv
				);
				htmlElementsFactory.create (
					'div',
					{ 
						className : 'TravelControl-CellDataDiv',
						innerHTML : formatTime ( maneuverIterator.value.duration )
					}, 
					rowDataDiv
				);
			}

		};

		return {
			createUI : function ( controlDiv ) { 
				_CreateUI ( controlDiv ); 
			},
			set itinerary ( itinerary ) { _Itinerary ( itinerary ); },
			get itinerary ( ) { return null; }
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getItineraryEditorUI;
	}

}());
	