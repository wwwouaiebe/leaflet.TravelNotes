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
		if ( ! document.getElementById ( 'TravelControl-ErrorDataDiv' ).innerHTML.length ) {
			return;
		}	
		document.getElementById ( 'TravelControl-ErrorDataDiv' ).classList.toggle ( 'TravelControl-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelControl-ErrorDataDiv' ).classList.contains ( 'TravelControl-HiddenList' );
		document.getElementById ( 'TravelControl-ErrorExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25b2;';
		document.getElementById ( 'TravelControl-ErrorExpandButton' ).title = hiddenList ? _Translator.getText ( 'ErrorEditorUI - Show' ) : _Translator.getText ( 'ErrorEditorUI - Hide' );
	};

	// User interface

	var _UICreated = false;

	var getErrorEditorUI = function ( ) {
				
		var _CreateUI = function ( controlDiv ){ 
		
			if ( _UICreated ) {
				return;
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			htmlElementsFactory.create ( 'div', { id : 'TravelControl-ErrorDataDiv', className : 'TravelControl-DataDiv TravelControl-HiddenList'}, controlDiv );
			
			var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-ErrorHeaderDiv', className : 'TravelControl-HeaderDiv'}, controlDiv );
			var expandButton = htmlElementsFactory.create (
				'span',
				{ 
					innerHTML : '&#x25b6;',
					title : _Translator.getText ( 'ErrorEditorUI - Show' ),
					id : 'TravelControl-ErrorExpandButton',
					className : 'TravelControl-ExpandButton'
				},
				headerDiv );
			expandButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : 'Erreurs&nbsp;:', id : 'TravelControl-ErrorHeaderText', className : 'TravelControl-HeaderText'}, headerDiv );
			
			_UICreated = true;
		};

		var _ExpandUI = function ( ) {
			document.getElementById ( 'TravelControl-ErrorExpandButton' ).innerHTML = '&#x25b2;';
			document.getElementById ( 'TravelControl-ErrorExpandButton' ).title = _Translator.getText ( 'ErrorEditorUI - Hide' );
			document.getElementById ( 'TravelControl-ErrorDataDiv' ).classList.remove ( 'TravelControl-HiddenList' );
		};
		
		var _ReduceUI = function ( ) {
			document.getElementById ( 'TravelControl-ErrorExpandButton' ).innerHTML = '&#x25b6;';
			document.getElementById ( 'TravelControl-ErrorExpandButton' ).title = _Translator.getText ( 'ErrorEditorUI - Show' );
			document.getElementById ( 'TravelControl-ErrorDataDiv' ).add ( 'TravelControl-HiddenList' );
		};

		return {
			
			createUI : function ( controlDiv ) { 
				_CreateUI ( controlDiv ); 
			},
	
			expand : function ( ) {
				_ExpandUI ( );
			},
			
			reduce : function ( ) {
				_ReduceUI ( );
			},
			
			set message ( Message ) { document.getElementById ( 'TravelControl-ErrorDataDiv' ).innerHTML = Message; },
			
			get message (  ) { return document.getElementById ( 'TravelControl-ErrorDataDiv' ).innerHTML; }
			
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getErrorEditorUI;
	}

}());
