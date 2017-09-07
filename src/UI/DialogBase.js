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

	var getDialogBase = function ( ) {
		
		var _DialogObjId = require ( '../data/ObjId' ) ( );

		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		var body = document.getElementsByTagName('body') [0];
		var tmpDiv = htmlElementsFactory.create ( 'div', { className : 'ContextMenu-Panel'} , body );
		var _ScreenWidth = tmpDiv.clientWidth;
		var _ScreenHeight = tmpDiv.clientHeight;
		body.removeChild ( tmpDiv );
		
		var _DialogContainer = htmlElementsFactory.create ( 
			'div',
			{ 
				id : 'TravelNotes-DialogContainer-' + _DialogObjId,
				className : 'TravelNotes-BaseDialogContainer'
			},
			body 
		);

		var cancelButton = htmlElementsFactory.create ( 
			'div',
			{ 
				innerHTML: '&#x274c', 
				className : 'TravelNotes-DialogCancelButton',
				title : _Translator.getText ( "DialogBase - close" )
			},
			_DialogContainer
		);
		cancelButton.addEventListener ( 
			'click',
			function ( ) {
				document.getElementsByTagName('body') [0].removeChild ( _DialogContainer );
				_DialogContainer = null;
			},
			false
		);
		var _DialogHeader = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-DialogHeaderDiv',
			},
			_DialogContainer
		);		
		var _ContentDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-DialogContentDiv',
			},
			_DialogContainer
		);
		
		var buttonsDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-DialogButtonsDiv',
			},
			_DialogContainer
		);
		var okButton = htmlElementsFactory.create ( 
			'div',
			{ 
				innerHTML: '&#x274c', 
				className : 'TravelNotes-DialogOkButton',
			},
			buttonsDiv
		);
		okButton.addEventListener ( 
			'click',
			function ( ) {
				document.getElementsByTagName('body') [0].removeChild ( _DialogContainer );
				_DialogContainer = null;
			},
			false
		);				
		
		return {
			
			get title ( ) { return _DialogHeader.innerHTML; },
			set title ( Title ) { _DialogHeader.innerHTML = Title; },
			center : function ( ) {
				var dialogTop = ( _ScreenHeight - _DialogContainer.clientHeight ) / 2;
				var dialogLeft = ( _ScreenWidth - _DialogContainer.clientWidth ) / 2;
				_DialogContainer.setAttribute ( "style", "top:" + dialogTop + "px;left:" + dialogLeft +"px;" );
			},
			get content ( ) { return _ContentDiv;},
			set content ( Content ) { _ContentDiv = Content; },

		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getDialogBase;
	}

}());
