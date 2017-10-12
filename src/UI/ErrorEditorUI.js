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
--- ErrorEditorUI.js file ---------------------------------------------------------------------------------------------
This file contains:
	- the ErrorEditorUI object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
Doc reviewed 20170929
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var _TimerId = null;

	var ErrorEditorUI = function ( ) {
				
		var translator = require ( './Translator' ) ( );

		/*
		--- _ReduceUI function ----------------------------------------------------------------------------------------

		This function reduces the UI
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _ReduceUI = function ( ) {
			document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).classList.add ( 'TravelNotes-Control-HiddenList' );
			//document.getElementById ( 'TravelNotes-Control-ErrorHeaderDiv' ).classList.add ( 'TravelNotes-Control-HiddenList' );
			document.getElementById ( 'TravelNotes-Control-ErrorMessageDiv' ).innerHTML = '';
		};
		
		/*
		--- _SetMessage function ----------------------------------------------------------------------------------------

		This function add a message, expand the UI and start a timer
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _SetMessage = function ( message ) {
			if ( _TimerId ) {
				clearTimeout ( _TimerId );
				_TimerId = null;
			}
			document.getElementById ( 'TravelNotes-Control-ErrorMessageDiv' ).innerHTML = message;
			document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).classList.remove ( 'TravelNotes-Control-HiddenList' );
			//document.getElementById ( 'TravelNotes-Control-ErrorHeaderDiv' ).classList.remove ( 'TravelNotes-Control-HiddenList' );
			_TimerId = setTimeout ( _ReduceUI, require ( '../data/DataManager' ) ( ).config.errorMessages.timeout );
		};
		
		/*
		--- _CreateUI function ----------------------------------------------------------------------------------------

		This function creates the UI
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _CreateUI = function ( controlDiv ){ 
		
			if ( document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ) ) {
				return;
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			var dataDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-ErrorDataDiv', className : 'TravelNotes-Control-DataDiv TravelNotes-Control-HiddenList'}, controlDiv );
			var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-ErrorHeaderDiv', className : 'TravelNotes-Control-HeaderDiv TravelNotes-Control-HiddenList'}, dataDiv );
			var expandButton = htmlElementsFactory.create (
				'span',
				{ 
					innerHTML : '&#x274c',
					title : translator.getText ( 'ErrorEditorUI - Hide' ),
					id : 'TravelNotes-Control-ErrorExpandButton',
					className : 'TravelNotes-Control-HiddenList'
				},
				headerDiv 
			);
			expandButton.addEventListener ( 
				'click' ,
				function ( clickEvent ) {
					clickEvent.stopPropagation ( );
					if ( ! document.getElementById ( 'TravelNotes-Control-ErrorMessageDiv' ).innerHTML.length ) {
						return;
					}	
					_ReduceUI ( );
				},
				false 
			);
			var messageDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-ErrorMessageDiv'}, dataDiv );
		};
				
		/*
		--- ErrorEditorUI object --------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return {
			
			createUI : function ( controlDiv ) { 
				_CreateUI ( controlDiv ); 
			},
	
			set message ( message )
			{ 
				_SetMessage ( message );
			},
			
			get message (  ) { return document.getElementById ( 'TravelNotes-Control-ErrorDataDiv' ).innerHTML; }
			
		};
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = ErrorEditorUI;
	}

}());

/*
--- End of ErrorEditorUI.js file --------------------------------------------------------------------------------------
*/	