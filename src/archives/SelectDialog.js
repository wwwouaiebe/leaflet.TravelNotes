/*
Copyright - 2018 - Christian Guyette - Contact: http//www.ouaie.be/

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
--- SelectDialog.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the SelectDialog object
	- the module.exports implementation
Changes:
	- v1.3.0:
		- created
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var SelectDialog = function (  returnOnOk, returnOnError ) {
		
		var onCancelButtonClick = function ( ) {

			returnOnError ( 'Cancelled by user' );
		};
		
		var onOkButtonClick = function ( ) {

			returnOnOk ( new Promise ( _NextPromise ) );
		};

		console.log ( '_Response SelectDialog' );
		console.log ( _Response );

		if ( 0 === responses [ 0 ].length ) {
			
			return;
		}
		
		var baseDialog = require ( '../UI/BaseDialog' ) ( );
		baseDialog.title = require ( '../UI/Translator' ) ( ).getText ( 'SelectDialog - Select an item' );
		
		baseDialog.addClickOkButtonEventListener ( onOkButtonClick );
		baseDialog.addClickCancelButtonEventListener (onCancelButtonClick );
		baseDialog.addEscapeKeyEventListener (onCancelButtonClick );
		
		var selectDiv = require ( './HTMLElementsFactory' ) ( ).create (
			'div',
			{
				id : 'TravelNotes-SelectDialog-SelectDiv'
			},
			baseDialog.content
		);
		
		var selectElement = require ( './HTMLElementsFactory' ) ( ).create (
			'select',
			{
				id : 'TravelNotes-SelectDialog-SelectElement'
			},
			selectDiv
		);
		responses [ 0 ].forEach ( function ( dataElement ) { require ( './HTMLElementsFactory' ) ( ).create ('option',{ text : dataElement }, selectElement ); } );
		
		selectElement.selectedIndex = 0;
		
		baseDialog.center ( );
		
		return baseDialog;
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = SelectDialog;
	}

}());

/*
--- End of SelectDialog.js file ----------------------------------------------------------------------------------------
*/	