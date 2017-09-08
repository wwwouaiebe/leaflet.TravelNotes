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

/*
To do: translations
*/

( function ( ){
	
	'use strict';

	var _Translator = require ( '../UI/Translator' ) ( );

	var getBaseDialog = function ( ) {
		
		var dialogObjId = require ( '../data/ObjId' ) ( );

		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		var body = document.getElementsByTagName('body') [0];
		var backgroundDiv = htmlElementsFactory.create ( 'div', { id: 'TravelNotes-BaseDialog-BackgroundDiv', className : 'TravelNotes-BaseDialog-BackgroundDiv'} , body );
		backgroundDiv.addEventListener ( 
			'dragover', 
			function ( event ) {
				return;
			},
			false
		);	
		backgroundDiv.addEventListener ( 
			'drop', 
			function ( event ) {
				return;
			},
			false
		);	

		var screenWidth = backgroundDiv.clientWidth;
		var screenHeight = backgroundDiv.clientHeight;
		
		var startDragX = 0;
		var startDragY = 0;
		
		var dialogTop = 0;
		var dialogLeft = 0;

		var dialogContainer = htmlElementsFactory.create ( 
			'div',
			{ 
				id : 'TravelNotes-BaseDialog-Container-' + dialogObjId,
				className : 'TravelNotes-BaseDialog-Container',
				draggable : true
			},
			backgroundDiv
		);
		dialogContainer.addEventListener ( 
			'dragstart', 
			function ( event ) {
				try {
					event.dataTransfer.setData ( 'Text', '1' );
				}
				catch ( e ) {
				}
				startDragX = event.screenX;
				startDragY = event.screenY;
			},
			false
		);	
		dialogContainer.addEventListener ( 
			'dragend', 
			function ( event ) {
				dialogLeft -= startDragX - event.screenX;
				dialogTop -= startDragY - event.screenY;
				dialogContainer.setAttribute ( "style", "top:" + dialogTop + "px;left:" + dialogLeft +"px;" );
			},
			false 
		);
		var cancelButton = htmlElementsFactory.create ( 
			'div',
			{ 
				innerHTML: '&#x274c', 
				id : 'TravelNotes-BaseDialog-CancelButton',
				className : 'TravelNotes-BaseDialog-Button',
				title : _Translator.getText ( "DialogBase - close" )
			},
			dialogContainer
		);
		cancelButton.addEventListener ( 
			'click',
			function ( ) {
				document.getElementsByTagName('body') [0].removeChild ( backgroundDiv );
			},
			false
		);
		var dialogHeader = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-HeaderDiv',
			},
			dialogContainer
		);		
		
		var contentDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-DialogContentDiv',
			},
			dialogContainer
		);
		
		var buttonsDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-DialogButtonsDiv',
			},
			dialogContainer
		);
		var okButton = htmlElementsFactory.create ( 
			'div',
			{ 
				innerHTML: '&#x1f4be;', 
				id : 'TravelNotes-DialogOkButton',
				className : 'TravelNotes-DialogButton'
			},
			buttonsDiv
		);
		okButton.addEventListener ( 
			'click',
			function ( ) {
				document.getElementsByTagName('body') [0].removeChild ( backgroundDiv );
			},
			false
		);				
		
		return {
			
			get title ( ) { return dialogHeader.innerHTML; },
			set title ( Title ) { dialogHeader.innerHTML = Title; },
			center : function ( ) {
				dialogTop = ( screenHeight - dialogContainer.clientHeight ) / 2;
				dialogLeft = ( screenWidth - dialogContainer.clientWidth ) / 2;
				dialogContainer.setAttribute ( "style", "top:" + dialogTop + "px;left:" + dialogLeft +"px;" );
			},
			get content ( ) { return contentDiv;},
			set content ( Content ) { contentDiv = Content; },

		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getBaseDialog;
	}

}());
