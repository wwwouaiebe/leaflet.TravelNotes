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
		
		document.getElementById ( 'TravelControl-ItineraryHeaderDiv' ).classList.toggle ( 'TravelControl-SmallHeader' );
		document.getElementById ( 'TravelControlItineraryDataDiv' ).classList.toggle ( 'TravelControl-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelControlItineraryDataDiv' ).classList.contains ( 'TravelControl-HiddenList' );
		document.getElementById ( 'TravelControl-ItineraryExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25bc;';
		document.getElementById ( 'TravelControl-ItineraryExpandButton' ).title = hiddenList ? _Translator.getText ( 'ItineraryEditorUI - Show' ) : _Translator.getText ( 'ItineraryEditorUI - Hide' );

		clickEvent.stopPropagation ( );
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
			dataDiv.innerHTML= "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam sodales hendrerit.Ut velit mauris, egestas sed, gravida nec, ornare ut, mi. Aenean ut orci vel massa suscipit pulvinar. Nulla sollicitudin. Fusce varius, ligula non tempus aliquam, nunc turpis ullamcorper nibh, in tempus sapien eros vitae ligula. Pellentesque rhoncus nunc et augue. Integer id felis. Curabitur aliquet pellentesque diam. Integer quis metus vitae elit lobortis egestas. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Morbi vel erat non mauris convallis vehicula. Nulla et sapien. Integer tortor tellus, aliquam faucibus, convallis id, congue eu, quam. Mauris ullamcorper felis vitae erat. Proin feugiat, augue non elementum posuere, metus purus iaculis lectus, et tristique ligula justo vitae magna.Aliquam convallis sollicitudin purus. Praesent aliquam, enim at fermentum mollis, ligula massa adipiscing nisl, ac euismod nibh nisl eu lectus. Fusce vulputate sem at sapien. Vivamus leo. Aliquam euismod libero eu enim. Nulla nec felis sed leo placerat imperdiet. Aenean suscipit nulla in justo. Suspendisse cursus rutrum augue. Nulla tincidunt tincidunt mi. Curabitur iaculis, lorem vel rhoncus faucibus, felis magna fermentum augue, et ultricies lacus lorem varius purus. Curabitur eu ametLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam sodales hendrerit.Ut velit mauris, egestas sed, gravida nec, ornare ut, mi. Aenean ut orci vel massa suscipit pulvinar. Nulla sollicitudin. Fusce varius, ligula non tempus aliquam, nunc turpis ullamcorper nibh, in tempus sapien eros vitae ligula. Pellentesque rhoncus nunc et augue. Integer id felis. Curabitur aliquet pellentesque diam. Integer quis metus vitae elit lobortis egestas. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Morbi vel erat non mauris convallis vehicula. Nulla et sapien. Integer tortor tellus, aliquam faucibus, convallis id, congue eu, quam. Mauris ullamcorper felis vitae erat. Proin feugiat, augue non elementum posuere, metus purus iaculis lectus, et tristique ligula justo vitae magna.Aliquam convallis sollicitudin purus. Praesent aliquam, enim at fermentum mollis, ligula massa adipiscing nisl, ac euismod nibh nisl eu lectus. Fusce vulputate sem at sapien. Vivamus leo. Aliquam euismod libero eu enim. Nulla nec felis sed leo placerat imperdiet. Aenean suscipit nulla in justo. Suspendisse cursus rutrum augue. Nulla tincidunt tincidunt mi. Curabitur iaculis, lorem vel rhoncus faucibus, felis magna fermentum augue, et ultricies lacus lorem varius purus. Curabitur eu amet";
			//dataDiv.innerHTML= "Lorem ipsum";
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
		
		var _Itinerary = function ( itinerary ) {

			console.log ( itinerary.object );
		
			var dataDiv = document.getElementById ( 'TravelControl-ItineraryDataDiv' );
			if ( ! dataDiv ) {
				return;
			}
			
			dataDiv.innerHTML = '';
			
			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			var itineraryDiv = htmlElementsFactory.create (
				'div',
					{ className : 'TravelControl-TableDataDiv'}, 
				dataDiv
			);
			var maneuverIterator = itinerary.maneuvers.iterator;
			while ( ! maneuverIterator.done ) {
				var rowDataDiv = htmlElementsFactory.create ( 
					'div', 
					{ className : 'TravelControl-RowDataDiv'}, 
					itineraryDiv
				);
				
				htmlElementsFactory.create (
					'div',
					{ 
						className : 'TravelControl-CellDataDiv TravelControl-iconCellDataDiv TravelControl-' + maneuverIterator.value.iconName,
					}, 
					rowDataDiv
				);
				htmlElementsFactory.create (
					'div',
					{ 
						className : 'TravelControl-CellDataDiv',
						innerHTML : maneuverIterator.value.simplifiedInstruction
					}, 
					rowDataDiv
				);
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
	