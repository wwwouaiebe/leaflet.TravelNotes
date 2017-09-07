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

	var getNoteDialog = function ( ) {
		
		var dialogBase = require ( '../UI/DialogBase' ) ( );
		dialogBase.title = _Translator.getText ( 'NoteDialog - Title' );
		
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		var form = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialogForm',
			},
			dialogBase.content
		);
		var noteText = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'textarea',
				className : 'TravelNotes-NoteTextInput',
			},
			form
		);
		
		dialogBase.center ( );
		return;
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getNoteDialog;
	}

}());
