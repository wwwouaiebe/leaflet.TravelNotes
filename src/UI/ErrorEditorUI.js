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
		if ( ! document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).innerHTML.length ) {
			return;
		}	
		document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).classList.contains ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-Control-ErrorExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25b2;';
		document.getElementById ( 'TravelNotes-Control-ErrorExpandButton' ).title = hiddenList ? _Translator.getText ( 'ErrorEditorUI - Show' ) : _Translator.getText ( 'ErrorEditorUI - Hide' );
	};

	// User interface

	var getErrorEditorUI = function ( ) {
				
		var _CreateUI = function ( controlDiv ){ 
		
			if ( document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ) ) {
				return;
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-ErrorDataDiv', className : 'TravelNotes-Control-DataDiv TravelNotes-Control-HiddenList'}, controlDiv );
			
			var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-ErrorHeaderDiv', className : 'TravelNotes-Control-HeaderDiv'}, controlDiv );
			var expandButton = htmlElementsFactory.create (
				'span',
				{ 
					innerHTML : '&#x25b6;',
					title : _Translator.getText ( 'ErrorEditorUI - Show' ),
					id : 'TravelNotes-Control-ErrorExpandButton',
					className : 'TravelNotes-Control-ExpandButton'
				},
				headerDiv );
			expandButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : 'Erreurs&nbsp;:', id : 'TravelNotes-Control-ErrorHeaderText', className : 'TravelNotes-Control-HeaderText'}, headerDiv );
			
		};

		var _ExpandUI = function ( ) {
			document.getElementById ( 'TravelNotes-Control-ErrorExpandButton' ).innerHTML = '&#x25b2;';
			document.getElementById ( 'TravelNotes-Control-ErrorExpandButton' ).title = _Translator.getText ( 'ErrorEditorUI - Hide' );
			document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).classList.remove ( 'TravelNotes-Control-HiddenList' );
		};
		
		var _ReduceUI = function ( ) {
			document.getElementById ( 'TravelNotes-Control-ErrorExpandButton' ).innerHTML = '&#x25b6;';
			document.getElementById ( 'TravelNotes-Control-ErrorExpandButton' ).title = _Translator.getText ( 'ErrorEditorUI - Show' );
			document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).add ( 'TravelNotes-Control-HiddenList' );
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
			
			set message ( Message ) { document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).innerHTML = Message; },
			
			get message (  ) { return document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).innerHTML; }
			
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getErrorEditorUI;
	}

}());
