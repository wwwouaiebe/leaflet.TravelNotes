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
	
	var styles = [];
	
	var _Note;
	var _RouteObjId;
	
	var onOkButtonClick = function ( ) {
		_Note.iconWidth = document.getElementById ( 'TravelNotes-NoteDialog-WidthNumberInput' ).value;
		_Note.iconHeight = document.getElementById ( 'TravelNotes-NoteDialog-HeightNumberInput' ).value;
		_Note.iconContent = document.getElementById ( 'TravelNotes-NoteDialog-TextArea-IconHtmlContent' ).value;
		_Note.popupContent = document.getElementById ( 'TravelNotes-NoteDialog-TextArea-PopupContent' ).value;
		_Note.tooltipContent = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value;
		_Note.address = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Adress' ).value;
		_Note.url = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Link' ).value;
		_Note.phone = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Phone' ).value;
		require ( '../core/NoteEditor') ( ).endNoteDialog ( _Note, _RouteObjId );
	};

	var getNoteDialog = function ( note, routeObjId ) {
		
		_Note = note;
		_RouteObjId = routeObjId;
		
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;

		// the dialog base is created
		var baseDialog = require ( '../UI/BaseDialog' ) ( );
		baseDialog.title = _Translator.getText ( 'NoteDialog - Title' );
		baseDialog.addClickOkButtonEventListener ( onOkButtonClick );
		
		// Toolbar
		var toolbarDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-ToolbarDiv',
				id : 'TravelNotes-NoteDialog-ToolbarDiv'
			},
			baseDialog.content
		);

		// function to add buttons on the toolbar from a object
		var addEditorButtons = function ( buttons ) {
			buttons.forEach ( 
				function ( button ) {
					var newButton = htmlElementsFactory.create ( 
						'button',
						{
							type : 'button',
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

		// open style button ... with the well know hack to hide the file input ( a div + an input + a fake div + a button )
		var openStyleDiv = htmlElementsFactory.create ( 
			'div', 
			{ 
				id: 'TravelNotes-NoteDialog-OpenStyleDiv'
			}, 
			toolbarDiv 
		);
		var openStyleInput = htmlElementsFactory.create ( 
			'input',
			{
				id : 'TravelNotes-NoteDialog-OpenStyleInput', 
				type : 'file',
				accept : '.json'
			},
			openStyleDiv
		);
		openStyleInput.addEventListener ( 
			'change', 
			function ( event ) {
				var fileReader = new FileReader( );
				fileReader.onload = function ( event ) {
					var newStyles = JSON.parse ( fileReader.result ) ;
					addEditorButtons ( newStyles );
					styles = styles.concat ( newStyles );
				};
				var fileName = event.target.files [ 0 ].name;
				fileReader.readAsText ( event.target.files [ 0 ] );
			},
			false
		);
		var openStyleFakeDiv = htmlElementsFactory.create ( 
			'div', 
			{ 
				id: 'TravelNotes-NoteDialog-OpenStyleFakeDiv'
			}, 
			openStyleDiv 
		);
		var openStyleButton = htmlElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-NoteDialog-OpenStyleButton', 
				className: 'TravelNotes-BaseDialog-Button', 
				title : _Translator.getText ( 'TravelEditorUI - Open travel' ), 
				innerHTML : '&#x23CD;'
			}, 
			openStyleFakeDiv 
		);
		openStyleButton.addEventListener ( 'click' , function ( ) { openStyleInput.click ( ); }, false );
	
		// event handler for edition with the styles buttons
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
		
		// standard buttons for div, p, span and a
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
		
		// personnalised buttons are restored
		addEditorButtons ( styles );

		// radio buttons for the icon type...
		var iconRadioButtonDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv',
				id : 'TravelNotes-NoteDialog-IconTypeDataDiv'
			},
			baseDialog.content
		);
		
		// ...for the standard icons
		htmlElementsFactory.create (
			'text',
			{
				data : _Translator.getText ( 'NoteDialog - Standard icon'),
			},
			iconRadioButtonDiv
		);
		var iconRadioStandardInput = htmlElementsFactory.create (
			'input',
			{
				type : 'radio',
				className : 'TravelNotes-NoteDialog-RadioInput',
				id : 'TravelNotes-NoteDialog-RadioStandardInput'
			},
			iconRadioButtonDiv
		);
		// event handler for the radio button 
		iconRadioStandardInput.addEventListener (
			'click',
			function ( event ) {
				document.getElementById ( 'TravelNotes-NoteDialog-DimensionsDataDiv' ).classList.add ( 'TravelNotes-NoteDialog-Hidden' );
				document.getElementById ( 'TravelNotes-NoteDialog-TextArea-IconHtmlContent' ).classList.add ( 'TravelNotes-NoteDialog-Hidden' );
				document.getElementById ( 'TravelNotes-NoteDialog-IconContentTitleDiv' ).classList.add ( 'TravelNotes-NoteDialog-Hidden' );
				document.getElementById ( 'TravelNotes-NoteDialog-IconsListDataDiv' ).classList.remove ( 'TravelNotes-NoteDialog-Hidden' );
				document.getElementById ( 'TravelNotes-NoteDialog-RadioPersonnelInput' ).checked = false;
			},
			false
		);
			
		// ...and for the personnalzed icons
		htmlElementsFactory.create (
			'text',
			{
				data : _Translator.getText ( 'NoteDialog - Personnel icon' ),
			},
			iconRadioButtonDiv
		);
		var iconRadioPersonnalisedButton = htmlElementsFactory.create (
			'input',
			{
				type : 'radio',
				className : 'TravelNotes-NoteDialog-RadioInput',
				id : 'TravelNotes-NoteDialog-RadioPersonnelInput'
			},
			iconRadioButtonDiv
		);
		// event handler for the radio button 
		iconRadioPersonnalisedButton.addEventListener (
			'click',
			function ( event ) {
				document.getElementById ( 'TravelNotes-NoteDialog-DimensionsDataDiv' ).classList.remove ( 'TravelNotes-NoteDialog-Hidden' );
				document.getElementById ( 'TravelNotes-NoteDialog-TextArea-IconHtmlContent' ).classList.remove ( 'TravelNotes-NoteDialog-Hidden' );
				document.getElementById ( 'TravelNotes-NoteDialog-IconContentTitleDiv' ).classList.remove ( 'TravelNotes-NoteDialog-Hidden' );
				document.getElementById ( 'TravelNotes-NoteDialog-IconsListDataDiv' ).classList.add ( 'TravelNotes-NoteDialog-Hidden' );
				document.getElementById ( 'TravelNotes-NoteDialog-RadioStandardInput' ).checked = false;
			},
			false
		);
		
		// standard icons list
		var iconListDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv',
				id : 'TravelNotes-NoteDialog-IconsListDataDiv'
			},
			baseDialog.content
		);
		htmlElementsFactory.create (
			'text',
			{
				data : _Translator.getText ( 'NoteDialog - Choose an icon'),
			},
			iconListDiv
		);
		var styleSelect = htmlElementsFactory.create (
			'select',
			{
				className : 'TravelNotes-NoteDialog-Select',
				id : 'TravelNotes-NoteDialog-IconSelect'
			},
			iconListDiv
		);
		
		// icon dimensions...
		var iconDimensionsDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv',
				id : 'TravelNotes-NoteDialog-DimensionsDataDiv'
			},
			baseDialog.content
		);
		
		// ... width ...
		htmlElementsFactory.create (
			'text',
			{
				data : _Translator.getText ( 'NoteDialog - Icon width'),
			},
			iconDimensionsDiv
		);
		var widthInput =  htmlElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-NoteDialog-NumberInput',
				id : 'TravelNotes-NoteDialog-WidthNumberInput'
				
			},
			iconDimensionsDiv
		);
		widthInput.value = note.iconWidth;
		
		// ... and height
		htmlElementsFactory.create (
			'text',
			{
				data : _Translator.getText ( 'NoteDialog - Icon height'),
			},
			iconDimensionsDiv
		);
		var heightInput =  htmlElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-NoteDialog-NumberInput',
				id : 'TravelNotes-NoteDialog-HeightNumberInput'
			},
			iconDimensionsDiv
		);
		heightInput.value = note.iconHeight;
		
		// icon content
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				id : 'TravelNotes-NoteDialog-IconContentTitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - IconHtmlContentTitle' )
			},
			baseDialog.content
		);
		var iconHtmlContent = htmlElementsFactory.create ( 
			'textarea',
			{ 
				className : 'TravelNotes-NoteDialog-TextArea',
				id: 'TravelNotes-NoteDialog-TextArea-IconHtmlContent'
			},
			baseDialog.content
		);
		iconHtmlContent.addEventListener (
			'focus',
			function ( event ) {
				focusControl = iconHtmlContent;
			},
			false
		);
		iconHtmlContent.value = note.iconContent;
		// Popup content
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - PopupContentTitle' )
			},
			baseDialog.content
		);
		var popUpContent = htmlElementsFactory.create ( 
			'textarea',
			{ 
				className : 'TravelNotes-NoteDialog-TextArea',
				id: 'TravelNotes-NoteDialog-TextArea-PopupContent'
			},
			baseDialog.content
		);
		popUpContent.addEventListener (
			'focus',
			function ( event ) {
				focusControl = popUpContent;
			},
			false
		);
		popUpContent.value = note.popupContent;
		
		// tooltip content
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - TooltipTitle' )
			},
			baseDialog.content
		);
		var tooltip = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Tooltip'
			},
			baseDialog.content
		);
		tooltip.addEventListener (
			'focus',
			function ( event ) {
				focusControl = tooltip;
			},
			false
		);
		tooltip.value = note.tooltipContent;
		
		// Address
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - AdressTitle' )
			},
			baseDialog.content
		);
		var address = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Adress'
			},
			baseDialog.content
		);
		address.addEventListener (
			'focus',
			function ( event ) {
				focusControl = address;
			},
			false
		);
		address.value = note.address;
		
		// link
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - LinkTitle' )
			},
			baseDialog.content
		);
		var link = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Link'
			},
			baseDialog.content
		);
		link.addEventListener (
			'focus',
			function ( event ) {
				focusControl = null;
			},
			false
		);
		link.value = note.url;
		
		// phone
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - PhoneTitle' )
			},
			baseDialog.content
		);
		var phone = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Phone'
			},
			baseDialog.content
		);
		phone.addEventListener (
			'focus',
			function ( event ) {
				focusControl = phone;
			},
			false
		);
		phone.value = note.phone;
		
		document.getElementById ( 'TravelNotes-NoteDialog-DimensionsDataDiv' ).classList.add ( 'TravelNotes-NoteDialog-Hidden' );
		document.getElementById ( 'TravelNotes-NoteDialog-TextArea-IconHtmlContent' ).classList.add ( 'TravelNotes-NoteDialog-Hidden' );
		document.getElementById ( 'TravelNotes-NoteDialog-IconContentTitleDiv' ).classList.add ( 'TravelNotes-NoteDialog-Hidden' );
		document.getElementById ( 'TravelNotes-NoteDialog-IconsListDataDiv' ).classList.remove ( 'TravelNotes-NoteDialog-Hidden' );
		document.getElementById ( 'TravelNotes-NoteDialog-RadioStandardInput' ).checked = true;

		// and the dialog is centered on the screen
		baseDialog.center ( );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getNoteDialog;
	}

}());
