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
--- NoteDialog.js file ------------------------------------------------------------------------------------------------
This file contains:
	- the NoteDialog object
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

	var _Translator = require ( '../UI/Translator' ) ( );
	var _UserData = { editionButtons : [], preDefinedIconsList : [] };
	var _ServerData = { editionButtons : [], preDefinedIconsList : [] };
	var _GlobalData = { editionButtons : [], preDefinedIconsList : [] };
	var _Note;
	var _RouteObjId;
	
	
	/*
	--- onOkButtonClick function ----------------------------------------------------------------------------------

	click event listener for the ok button

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onOkButtonClick = function ( ) {
		// Verifying that the icon is not empty. A note with an empty icon cannot be viewed on the map
		// and then, cannot be edited or removed!
		if ( 0 === document.getElementById ( 'TravelNotes-NoteDialog-TextArea-IconHtmlContent' ).value.length ) {
			document.getElementById ( 'TravelNotes-BaseDialog-ErrorDiv' ).innerHTML = _Translator.getText ( 'Notedialog - empty icon content' );
			document.getElementById ( 'TravelNotes-BaseDialog-ErrorDiv' ).classList.remove ( 'TravelNotes-BaseDialog-ErrorDivHidden' );
			return false;
		}
		// saving values in the note.
		_Note.iconWidth = document.getElementById ( 'TravelNotes-NoteDialog-WidthNumberInput' ).value;
		_Note.iconHeight = document.getElementById ( 'TravelNotes-NoteDialog-HeightNumberInput' ).value;
		_Note.iconContent = document.getElementById ( 'TravelNotes-NoteDialog-TextArea-IconHtmlContent' ).value;
		_Note.popupContent = document.getElementById ( 'TravelNotes-NoteDialog-TextArea-PopupContent' ).value;
		_Note.tooltipContent = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value;
		_Note.address = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Adress' ).value;
		_Note.url = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Link' ).value;
		_Note.phone = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Phone' ).value;
		require ( '../core/NoteEditor') ( ).endNoteDialog ( _Note, _RouteObjId );
		return true;
	};

	/*
	--- NoteDialog function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var NoteDialog = function ( note, routeObjId, newNote ) {

		// function to add the predefined icons to the select
		var addPreDefinedIconsList = function ( ) {
			_GlobalData.preDefinedIconsList = _ServerData.preDefinedIconsList.concat ( _UserData.preDefinedIconsList );
			_GlobalData.preDefinedIconsList.sort ( function ( a, b ) { return a.name.localeCompare ( b.name );} );
			var elementCounter = 0;
			for ( elementCounter = preDefinedIconsSelect.length - 1; elementCounter>= 0; elementCounter -- ) {
				preDefinedIconsSelect.remove ( counter );
			}
			for ( elementCounter = 0; elementCounter < _GlobalData.preDefinedIconsList.length; elementCounter ++ ) {
				var option = htmlElementsFactory.create ( 'option', { text :  _GlobalData.preDefinedIconsList [ elementCounter ].name } );
				preDefinedIconsSelect.add ( option );
			}
		};

		// function to add buttons on the toolbar
		var addEditionButtons = function ( editionButtons ) {
			editionButtons.forEach ( 
				function ( editionButton ) {
					var newButton = htmlElementsFactory.create ( 
						'button',
						{
							type : 'button',
							innerHTML : editionButton.title || '?',
							htmlBefore : editionButton.htmlBefore || '',
							htmlAfter : editionButton.htmlAfter || '',
							className : 'TravelNotes-NoteDialog-EditorButton'
						},
						toolbarDiv
					);
					newButton.addEventListener ( 'click', onClickEditionButton, false );
				}
			);
		};

		// event handler for edition with the styles buttons
		var onClickEditionButton = function ( event ) {
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

		_Note = note;
		_RouteObjId = routeObjId;
		
		// the dialog base is created
		var baseDialog = require ( '../UI/BaseDialog' ) ( );
		baseDialog.title = _Translator.getText ( 'NoteDialog - Title' );
		baseDialog.addClickOkButtonEventListener ( onOkButtonClick );

		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;

		var NoteDataDiv = htmlElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-NoteDialog-MainDataDiv'
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
			NoteDataDiv
		);
		
		// a select is added for the predefined icons
		var preDefinedIconsSelect = htmlElementsFactory.create (
			'select',
			{
				className : 'TravelNotes-NoteDialog-Select',
				id : 'TravelNotes-NoteDialog-IconSelect'
			},
			toolbarDiv
		);
		
		// change event listener on the select
		preDefinedIconsSelect.addEventListener ( 
			'change', 
			function ( changeEvent ) {
				var index = preDefinedIconsSelect.selectedIndex ;
				var preDefinedIcon = _GlobalData.preDefinedIconsList [ preDefinedIconsSelect.selectedIndex ];
				widthInput.value = preDefinedIcon.width ;
				heightInput.value = preDefinedIcon.height ;
				iconHtmlContent.value = preDefinedIcon.icon ;
				tooltip.value = preDefinedIcon.tooltip ;
			},
			false 
		);
		
		var focusControl = null;

		// open userdata button ... with the well know hack to hide the file input ( a div + an input + a fake div + a button )
		var openUserDataFileDiv = htmlElementsFactory.create ( 
			'div', 
			{ 
				id: 'TravelNotes-NoteDialog-OpenEditorFileDiv'
			}, 
			toolbarDiv 
		);
		var openUserDataFileInput = htmlElementsFactory.create ( 
			'input',
			{
				id : 'TravelNotes-NoteDialog-OpenEditorFileInput', 
				type : 'file',
				accept : '.json'
			},
			openUserDataFileDiv
		);
		openUserDataFileInput.addEventListener ( 
			'change', 
			function ( event ) {
				var fileReader = new FileReader( );
				fileReader.onload = function ( event ) {
					try {
						var newEditorData = JSON.parse ( fileReader.result ) ;
						_UserData.editionButtons = _UserData.editionButtons.concat ( newEditorData.editionButtons );
						_UserData.preDefinedIconsList = _UserData.preDefinedIconsList.concat ( newEditorData.preDefinedIconsList );
						addEditionButtons ( newEditorData.editionButtons );
						addPreDefinedIconsList ( );
					}
					catch ( e )
					{
					}
				};
				var fileName = event.target.files [ 0 ].name;
				fileReader.readAsText ( event.target.files [ 0 ] );
			},
			false
		);
		var openUserDataFileFakeDiv = htmlElementsFactory.create ( 
			'div', 
			{ 
				id: 'TravelNotes-NoteDialog-OpenStyleFakeDiv'
			}, 
			openUserDataFileDiv 
		);
		var openUserDataFileButton = htmlElementsFactory.create ( 
			'button', 
			{ 
				id : 'TravelNotes-NoteDialog-OpenEditorFileButton', 
				className: 'TravelNotes-NoteDialog-EditorButton', 
				title : _Translator.getText ( 'TravelEditorUI - Open travel' ), 
				innerHTML : '&#x23CD;'
			}, 
			openUserDataFileFakeDiv 
		);
		
		openUserDataFileButton.addEventListener ( 'click' , function ( ) { openUserDataFileInput.click ( ); }, false );
	
		
		// standard buttons for div, p, span and a
		addEditionButtons (
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
		
		// personnalised buttons from server file are restored
		addEditionButtons ( _ServerData.editionButtons );
		// personnalised buttons from local file are restored
		addEditionButtons ( _UserData.editionButtons );
		addPreDefinedIconsList ( );
		
		// icon dimensions...
		var iconDimensionsDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv',
				id : 'TravelNotes-NoteDialog-DimensionsDataDiv'
			},
			NoteDataDiv
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
			NoteDataDiv
		);
		var iconHtmlContent = htmlElementsFactory.create ( 
			'textarea',
			{ 
				className : 'TravelNotes-NoteDialog-TextArea',
				id: 'TravelNotes-NoteDialog-TextArea-IconHtmlContent'
			},
			NoteDataDiv
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
			NoteDataDiv
		);
		var popUpContent = htmlElementsFactory.create ( 
			'textarea',
			{ 
				className : 'TravelNotes-NoteDialog-TextArea',
				id: 'TravelNotes-NoteDialog-TextArea-PopupContent'
			},
			NoteDataDiv
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
			NoteDataDiv
		);
		var tooltip = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Tooltip'
			},
			NoteDataDiv
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
			NoteDataDiv
		);
		var address = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Adress'
			},
			NoteDataDiv
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
			NoteDataDiv
		);
		var link = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Link'
			},
			NoteDataDiv
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
			NoteDataDiv
		);
		var phone = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Phone'
			},
			NoteDataDiv
		);
		phone.addEventListener (
			'focus',
			function ( event ) {
				focusControl = phone;
			},
			false
		);
		phone.value = note.phone;

		// predefined icons and editionButtons are loaded if not already done previously
		if ( 0 === _ServerData.preDefinedIconsList.length ) {
			var buttonsHttpRequest = new XMLHttpRequest ( );
			buttonsHttpRequest.onreadystatechange = function ( event ) {
				if ( this.readyState === buttonsHttpRequest.DONE ) {
					if ( this.status === 200 ) {
						try {
							_ServerData = JSON.parse ( this.responseText );
							addEditionButtons ( _ServerData.editionButtons );
							_ServerData.preDefinedIconsList.push ( { name : '', icon : '', tooltip : '', width : 40, height : 40 } );
							addPreDefinedIconsList ( );
						}
						catch ( e )
						{
							console.log ( 'Error reading TravelNotesNoteDialog.json' );
						}
					} 
					else {
						console.log ( 'Error sending request for TravelNotesNoteDialog.json' );
					}
				}
			};
			buttonsHttpRequest.open ( 
				'GET',
				window.location.href.substr (0, window.location.href.lastIndexOf( '/') + 1 ) +'TravelNotesNoteDialog.json',
				true
			);
			buttonsHttpRequest.send ( null );
		}

		// geolocalization
		if ( ( require ( '../data/DataManager' ) ( ).config.note.reverseGeocoding )  && ( '' === note.address ) && newNote ) {
			require ( '../core/GeoCoder' ) ( ).getAddress ( note.lat, note.lng, function ( newAddress ) { address.value = newAddress ; }, this );
		}
		
		// and the dialog is centered on the screen
		baseDialog.center ( );
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = NoteDialog;
	}

}());

/*
--- End of NoteDialog.js file -----------------------------------------------------------------------------------------
*/	