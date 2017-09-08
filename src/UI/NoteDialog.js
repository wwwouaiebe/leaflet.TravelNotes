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

		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;

		var baseDialog = require ( '../UI/BaseDialog' ) ( );
		baseDialog.title = _Translator.getText ( 'NoteDialog - Title' );
		
		// content
		var content = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-ContentDiv',
			},
			baseDialog.content
		);
		
		// Toolbar
		var toolbarDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-ToolbarDiv',
				id : 'TravelNotes-NoteDialog-ToolbarDiv'
			},
			content
		);
		var focusControl = null;

		var onInsertStyle = function ( event ) {
			if ( ! focusControl ) {
				return;
			}
			var bInsertBeforeAndAfter = event.target.htmlAfter && 0 < event.target.htmlAfter.length;
			var selectionStart = focusControl.selectionStart;
			var selectionEnd = focusControl.selectionEnd;
			var oldText = focusControl.value;
			focusControl.value = oldText.substring ( 0, selectionStart ) + 
				( bInsertBeforeAndAfter ? event.target.htmlBefore + oldText.substring ( selectionStart, selectionEnd ) + event.target.htmlAfter : event.target.htmlBefore ) + 
				oldText.substring ( selectionEnd );
			focusControl.setSelectionRange ( 
				bInsertBeforeAndAfter || selectionStart === selectionEnd ? selectionStart + event.target.htmlBefore.length : selectionStart,
				( bInsertBeforeAndAfter ? selectionEnd : selectionStart ) + event.target.htmlBefore.length );
			focusControl.focus ( );
		};	
		
		var addEditorButtons = function ( buttons ) {
			buttons.forEach ( 
				function ( button ) {
					var newButton = htmlElementsFactory.create ( 
						'div',
						{
							innerHTML : button.title || '?',
							htmlBefore : button.htmlBefore || '',
							htmlAfter : button.htmlAfter || '',
							className : 'TravelNotes-NoteDialog-EditorButton'
						},
						toolbarDiv
					);
					newButton.addEventListener ( 'click', onInsertStyle, false );
				}
			);
		};
		
		addEditorButtons (
			[
				{
					title : 'div',
					htmlBefore : '<div>',
					htmlAfter :  '</div>'
				},
				{
					title : 'p',
					htmlBefore : '<p>',
					htmlAfter : '</p>'
				},
				{
					title : 'span',
					htmlBefore : '<span>',
					htmlAfter : '</span>'
				},
				{
					title : 'a',
					htmlBefore : '<a target="_blank" href="">',
					htmlAfter : '</a>'
				},
			]
		);
		
		// IconHtmlContent
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - IconHtmlContentTitle' )
			},
			content
		);
		var iconHtmlContent = htmlElementsFactory.create ( 
			'textarea',
			{ 
				className : 'TravelNotes-NoteDialog-TextArea',
				id: 'TravelNotes-NoteDialog-TextArea-IconHtmlContent'
			},
			content
		);
		iconHtmlContent.addEventListener (
			'focus',
			function ( event ) {
				focusControl = iconHtmlContent;
			},
			false
		);
			
		// PopupContent
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - PopupContentTitle' )
			},
			content
		);
		var popUpContent = htmlElementsFactory.create ( 
			'textarea',
			{ 
				className : 'TravelNotes-NoteDialog-TextArea',
				id: 'TravelNotes-NoteDialog-TextArea-PopupContent'
			},
			content
		);
		popUpContent.addEventListener (
			'focus',
			function ( event ) {
				focusControl = popUpContent;
			},
			false
		);
		
		// tooltip
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - TooltipTitle' )
			},
			content
		);
		var tooltip = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Tooltip'
			},
			content
		);
		tooltip.addEventListener (
			'focus',
			function ( event ) {
				focusControl = tooltip;
			},
			false
		);
		
		// Adress
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - AdressTitle' )
			},
			content
		);
		var adress = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Adress'
			},
			content
		);
		adress.addEventListener (
			'focus',
			function ( event ) {
				focusControl = adress;
			},
			false
		);
		// link
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - LinkTitle' )
			},
			content
		);
		var link = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Link'
			},
			content
		);
		link.addEventListener (
			'focus',
			function ( event ) {
				focusControl = null;
			},
			false
		);
		// phone
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - PhoneTitle' )
			},
			content
		);
		var phone = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Phone'
			},
			content
		);
		phone.addEventListener (
			'focus',
			function ( event ) {
				focusControl = phone;
			},
			false
		);
		
		baseDialog.center ( );
		return;
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getNoteDialog;
	}

}());
