/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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
	- the newNoteDialog function
Changes:
	- v1.0.0:
		- created
	- v1.3.0:
		- changed message
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- added reset button for address
		- added svg icons
		- reviewed code
		- added language for TravelNotesDialogXX.json file
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

'use strict';

export { newNoteDialog };

import { g_Translator } from '../UI/Translator.js';
import { g_Config } from '../data/Config.js';
import { g_NoteEditor } from '../core/NoteEditor.js';

import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { newHTMLElementsFactory } from '../UI/HTMLElementsFactory.js';
import { newSvgIconFromOsmFactory } from '../core/SvgIconFromOsmFactory.js';
import { newGeoCoder } from '../core/GeoCoder.js';


var g_UserButtonsAndIcons = { editionButtons : [], preDefinedIconsList : [] };
var g_TravelNotesButtonsAndIcons = { editionButtons : [], preDefinedIconsList : [] };
var g_AllButtonsAndIcons = { editionButtons : [], preDefinedIconsList : [] };

/*
--- noteDialog function -----------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

var newNoteDialog = function ( note, routeObjId, newNote ) {
	
	var m_BaseDialog = null;
	var m_NoteDataDiv = null;
	var m_FocusControl = null;
	var m_HtmlElementsFactory = newHTMLElementsFactory ( ) ;
	var m_LatLng = note.latLng;
	var m_Address = '';
	var m_City = '';

	/*
	--- onOkButtonClick function --------------------------------------------------------------------------------------

	click event listener for the ok button

	-------------------------------------------------------------------------------------------------------------------
	*/

	var onOkButtonClick = function ( ) {
		// Verifying that the icon is not empty. A note with an empty icon cannot be viewed on the map
		// and then, cannot be edited or removed!
		if ( 0 === document.getElementById ( 'TravelNotes-NoteDialog-TextArea-IconHtmlContent' ).value.length ) {
			document.getElementById ( 'TravelNotes-BaseDialog-ErrorDiv' ).innerHTML = g_Translator.getText ( 'Notedialog - The icon content cannot be empty' );
			document.getElementById ( 'TravelNotes-BaseDialog-ErrorDiv' ).classList.remove ( 'TravelNotes-BaseDialog-ErrorDivHidden' );
			return false;
		}
		// saving values in the note.
		note.iconWidth = document.getElementById ( 'TravelNotes-NoteDialog-WidthNumberInput' ).value;
		note.iconHeight = document.getElementById ( 'TravelNotes-NoteDialog-HeightNumberInput' ).value;
		note.iconContent = document.getElementById ( 'TravelNotes-NoteDialog-TextArea-IconHtmlContent' ).value;
		note.popupContent = document.getElementById ( 'TravelNotes-NoteDialog-TextArea-PopupContent' ).value;
		note.tooltipContent = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value;
		note.address = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Adress' ).value;
		note.url = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Link' ).value;
		note.phone = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Phone' ).value;
		note.latLng = m_LatLng;
		g_NoteEditor.afterNoteDialog ( note, routeObjId );
		return true;
	};

	/*
	--- End of onOkButtonClick function ---
	*/
	
	/*
	--- onGeocoderResponse function -----------------------------------------------------------------------------------

	Handler for the geoCoder call
	
	-------------------------------------------------------------------------------------------------------------------
	*/
	var onGeocoderResponse = function ( geoCoderData ) {
		m_Address = '';
		m_City = '';
		if ( geoCoderData.address.house_number ) {
			m_Address += geoCoderData.address.house_number + ' ';
		}
		if ( geoCoderData.address.road ) {
			m_Address += geoCoderData.address.road + ' ';
		}
		else if ( geoCoderData.address.pedestrian ) {
			m_Address += geoCoderData.address.pedestrian + ' ';
		}
		if (  geoCoderData.address.village ) {
			m_City = geoCoderData.address.village;
		}
		else if ( geoCoderData.address.town ) {
			m_City = geoCoderData.address.town;
		}
		else if ( geoCoderData.address.city ) {
			m_City = geoCoderData.address.city;
		}
		if ( '' !== m_City ) {
			m_Address += g_Config.note.cityPrefix + m_City + g_Config.note.cityPostfix;
		}
		if ( 0 === m_Address.length ) {
			m_Address += geoCoderData.address.country;
		}
		if ( ( g_Config.note.reverseGeocoding )  && ( '' === note.address ) && newNote ) {
			document.getElementById ( 'TravelNotes-NoteDialog-InputText-Adress').value = m_Address;
		}
	};
	
	/*
	--- End of onGeocoderResponse function ---
	*/
	
	/*
	--- onSvgIcon function --------------------------------------------------------------------------------------------

	event handler for predefined icons list
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var onSvgIcon = function ( data ) {
		document.getElementById ( 'TravelNotes-NoteDialog-TextArea-IconHtmlContent' ).value = data.svg.outerHTML;
		var directionArrow = '';
		if ( null !== data.direction ) {
			var cfgDirection = g_Config.note.svgAnleMaxDirection;
			if ( data.direction < cfgDirection.right ) {
				document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = g_Translator.getText ( 'NoteDialog - Turn right');
				directionArrow = String.fromCodePoint ( 0x1F882 );
			}
			else if ( data.direction < cfgDirection.slightRight ) {
				document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = g_Translator.getText ( 'NoteDialog - Turn slight right');
				directionArrow = String.fromCodePoint ( 0x1F885 );
			}
			else if ( data.direction < cfgDirection.continue ) {
				document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = g_Translator.getText ( 'NoteDialog - Continue');
				directionArrow = String.fromCodePoint ( 0x1F881 );
			}
			else if ( data.direction < cfgDirection.slightLeft ) {
				document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = g_Translator.getText ( 'NoteDialog - Turn slight left');
				directionArrow = String.fromCodePoint ( 0x1F884 );
			}
			else if ( data.direction < cfgDirection.left ) {
				document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = g_Translator.getText ( 'NoteDialog - Turn left');
				directionArrow = String.fromCodePoint ( 0x1F880 );
			}
			else if ( data.direction < cfgDirection.sharpLeft ) {
				document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = g_Translator.getText ( 'NoteDialog - Turn sharp left');
				directionArrow = String.fromCodePoint ( 0x1F887 );
			}
			else if ( data.direction < cfgDirection.sharpRight ) {
				document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = g_Translator.getText ( 'NoteDialog - Turn sharp right');
				directionArrow = String.fromCodePoint ( 0x1F886 );
			}
			else {
				document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = g_Translator.getText ( 'NoteDialog - Turn right');
				directionArrow = String.fromCodePoint ( 0x1F882 );
			}
		}
		if ( -1 === data.startStop ) {
			document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = g_Translator.getText ( 'NoteDialog - Start');
		}
		else if ( 1 === data.startStop ) {
			document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = g_Translator.getText ( 'NoteDialog - Stop');
		}
		
		var address = '';
		var showPlace = 0;
		for ( var counter = 0; counter < data.streets.length; counter ++ ) {
			if ( ( 0 === counter  || data.streets.length - 1 === counter ) && data.streets [ counter ] === '' ) {
				address += '???';
				showPlace ++;
			}
			else {
				address += data.streets [ counter ];
				showPlace --;
			}
			switch ( counter ) {
				case data.streets.length - 2:
					address += directionArrow;
					break;
				case data.streets.length - 1:
					break;
				default:
				address += String.fromCodePoint ( 0x2AA5 );
					break;
			}
		}
		if ( ! data.city && '' !== m_City ) {
			data.city = m_City;
		}
		if ( data.city ) {
			address += ' ' + g_Config.note.cityPrefix + data.city + g_Config.note.cityPostfix;
		}
		if ( data.place && data.place !== data.city  && showPlace !== 2 ) {
			address += ' (' + data.place + ')';
		}
		document.getElementById ( 'TravelNotes-NoteDialog-InputText-Adress').value = address;
		
		document.getElementById ( 'TravelNotes-BaseDialog-OkButton' ).style.visibility = 'visible';
		m_LatLng = data.latLng;
	};
	
	/*
	--- End of onSvgIcon function ---
	*/

	/*
	--- onErrorSvgIcon function ---------------------------------------------------------------------------------------

	event handler for predefined icons list
	
	-------------------------------------------------------------------------------------------------------------------
	*/
	var onErrorSvgIcon = function ( ) {
		document.getElementById ( 'TravelNotes-BaseDialog-ErrorDiv' ).innerHTML = g_Translator.getText ( 'Notedialog - an error occurs when creating the SVG icon' );
		document.getElementById ( 'TravelNotes-BaseDialog-ErrorDiv' ).classList.remove ( 'TravelNotes-BaseDialog-ErrorDivHidden' );
		document.getElementById ( 'TravelNotes-BaseDialog-OkButton' ).style.visibility = 'visible';
	};

	/*
	--- End of onErrorSvgIcon function ---
	*/

	/*
	--- onPredefinedIconListSelectChange function ---------------------------------------------------------------------

	event handler for predefined icons list
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var onPredefinedIconListSelectChange = function ( changeEvent ) {

		var preDefinedIcon = g_AllButtonsAndIcons.preDefinedIconsList [ changeEvent.target.selectedIndex ];
		if ( preDefinedIcon.name === g_Translator.getText ( 'NoteDialog - SVG icon from OSM') ) {
			document.getElementById ( 'TravelNotes-BaseDialog-OkButton' ).style.visibility = 'hidden';
			newSvgIconFromOsmFactory ( ).getPromiseSvgIcon ( note.latLng, routeObjId).then ( onSvgIcon, onErrorSvgIcon );
		}
		else{
			document.getElementById ( 'TravelNotes-NoteDialog-WidthNumberInput' ).value = preDefinedIcon.width ;
			document.getElementById ( 'TravelNotes-NoteDialog-HeightNumberInput' ).value = preDefinedIcon.height ;
			document.getElementById ( 'TravelNotes-NoteDialog-TextArea-IconHtmlContent' ).value = preDefinedIcon.icon ;
			document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value = preDefinedIcon.tooltip ;
		}
	};

	/*
	--- End of onPredefinedIconListSelectChange function ---
	*/

	/*
	--- onClickEditionButton function ---------------------------------------------------------------------------------

	event handler for edition with the styles buttons
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var onClickEditionButton = function ( event ) {
		if ( ! m_FocusControl ) {
			return;
		}
		var button = event.target;
		while ( ! button.htmlBefore ) {
			button = button.parentNode;
		}
		var bInsertBeforeAndAfter = button.htmlAfter && 0 < button.htmlAfter.length;
		var selectionStart = m_FocusControl.selectionStart;
		var selectionEnd = m_FocusControl.selectionEnd;
		var oldText = m_FocusControl.value;
		m_FocusControl.value = oldText.substring ( 0, selectionStart ) + 
			( bInsertBeforeAndAfter ? button.htmlBefore + oldText.substring ( selectionStart, selectionEnd ) + button.htmlAfter : button.htmlBefore ) + 
			oldText.substring ( selectionEnd );
		m_FocusControl.setSelectionRange ( 
			bInsertBeforeAndAfter || selectionStart === selectionEnd ? selectionStart + button.htmlBefore.length : selectionStart,
			( bInsertBeforeAndAfter ? selectionEnd : selectionStart ) + button.htmlBefore.length );
		m_FocusControl.focus ( );
	};	

	/*
	--- End of onClickEditionButton function ---
	*/

	/*
	--- onOpenUserDataFileInputChange function ------------------------------------------------------------------------

	event handler for 
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var onOpenUserDataFileInputChange = function ( event ) {
		var fileReader = new FileReader( );
		fileReader.onload = function ( ) {
			try {
				var newUserButtonsAndIcons = JSON.parse ( fileReader.result ) ;
				g_UserButtonsAndIcons.editionButtons = g_UserButtonsAndIcons.editionButtons.concat ( newUserButtonsAndIcons.editionButtons );
				g_UserButtonsAndIcons.preDefinedIconsList = g_UserButtonsAndIcons.preDefinedIconsList.concat ( newUserButtonsAndIcons.preDefinedIconsList );
				m_AddEditionButtons ( newUserButtonsAndIcons.editionButtons );
				m_AddPreDefinedIconsList ( );
			}
			catch ( e )
			{
				console.log ( e );
			}
		};
		fileReader.readAsText ( event.target.files [ 0 ] );
	};

	/*
	--- End of onOpenUserDataFileInputChange function ---
	*/

	/*
	--- onFocusControl function ---------------------------------------------------------------------------------------

	event handler for 
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var onFocusControl = function ( event ) {
		m_FocusControl = event.target;
	};
	
	/*
	--- End of onFocusControl function ---
	*/

	/*
	--- m_AddPreDefinedIconsList function -----------------------------------------------------------------------------

	function to add the predefined icons to the select

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_AddPreDefinedIconsList = function ( ) {
		g_AllButtonsAndIcons.preDefinedIconsList = g_TravelNotesButtonsAndIcons.preDefinedIconsList.concat ( g_UserButtonsAndIcons.preDefinedIconsList );

		if ( -1 < routeObjId ) {
			g_AllButtonsAndIcons.preDefinedIconsList.push ( { name : g_Translator.getText ( 'NoteDialog - SVG icon from OSM'), icon : '', tooltip : '', width : 40, height : 40 } );
		}

		g_AllButtonsAndIcons.preDefinedIconsList.sort ( function ( a, b ) { return a.name.localeCompare ( b.name );} );
		var elementCounter = 0;
		var preDefinedIconsSelect = document.getElementById ( 'TravelNotes-NoteDialog-IconSelect' );
		for ( elementCounter = preDefinedIconsSelect.length - 1; elementCounter>= 0; elementCounter -- ) {
			preDefinedIconsSelect.remove ( elementCounter );
		}
		for ( elementCounter = 0; elementCounter < g_AllButtonsAndIcons.preDefinedIconsList.length; elementCounter ++ ) {
			var option = m_HtmlElementsFactory.create ( 'option', { text :  g_AllButtonsAndIcons.preDefinedIconsList [ elementCounter ].name } );
			preDefinedIconsSelect.add ( option );
		}
	};

	/*
	--- End of m_AddPreDefinedIconsList function ---
	*/

	/*
	--- m_AddEditionButtons function ----------------------------------------------------------------------------------

	function to add buttons on the toolbar
	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_AddEditionButtons = function ( editionButtons ) {
		editionButtons.forEach ( 
			function ( editionButton ) {
				var newButton = m_HtmlElementsFactory.create ( 
					'button',
					{
						type : 'button',
						innerHTML : editionButton.title || '?',
						htmlBefore : editionButton.htmlBefore || '',
						htmlAfter : editionButton.htmlAfter || '',
						className : 'TravelNotes-NoteDialog-EditorButton'
					},
					document.getElementById ( 'TravelNotes-NoteDialog-ToolbarDiv' )
				);
				newButton.addEventListener ( 'click', onClickEditionButton, false );
			}
		);
	};

	/*
	--- End of m_AddEditionButtons function ---
	*/
	
	/*
	--- m_CreateBaseDialog function -----------------------------------------------------------------------------------

	Creation of the base dialog
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_CreateBaseDialog = function ( ) {
	
		// the dialog base is created
		m_BaseDialog = newBaseDialog ( );
		m_BaseDialog.title = g_Translator.getText ( 'NoteDialog - Note' );
		m_BaseDialog.okButtonListener = onOkButtonClick;

		m_NoteDataDiv = m_HtmlElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-NoteDialog-MainDataDiv'
			},
			m_BaseDialog.content
		);
	};
	
	/*
	--- End of m_CreateBaseDialog function ---
	*/

	/*
	--- m_CreateToolbar function --------------------------------------------------------------------------------------

	Creation of the toolbar 
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_CreateToolbar = function ( ) {
		var toolbarDiv = m_HtmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-ToolbarDiv',
				id : 'TravelNotes-NoteDialog-ToolbarDiv'
			},
			m_NoteDataDiv
		);
		
		// a select is added for the predefined icons
		var preDefinedIconsSelect = m_HtmlElementsFactory.create (
			'select',
			{
				className : 'TravelNotes-NoteDialog-Select',
				id : 'TravelNotes-NoteDialog-IconSelect'
			},
			toolbarDiv
		);
		
		// change event listener on the select
		preDefinedIconsSelect.addEventListener ( 'change', onPredefinedIconListSelectChange, false );
		

		// open userdata button ... with the well know hack to hide the file input ( a div + an input + a fake div + a button )
		var openUserDataFileDiv = m_HtmlElementsFactory.create ( 
			'div', 
			{ 
				id: 'TravelNotes-NoteDialog-OpenEditorFileDiv'
			}, 
			toolbarDiv 
		);
		var openUserDataFileInput = m_HtmlElementsFactory.create ( 
			'input',
			{
				id : 'TravelNotes-NoteDialog-OpenEditorFileInput', 
				type : 'file',
				accept : '.json'
			},
			openUserDataFileDiv
		);
		openUserDataFileInput.addEventListener ( 'change', onOpenUserDataFileInputChange, false );
		var openUserDataFileFakeDiv = m_HtmlElementsFactory.create ( 
			'div', 
			{ 
				id: 'TravelNotes-NoteDialog-OpenStyleFakeDiv'
			}, 
			openUserDataFileDiv 
		);
		var openUserDataFileButton = m_HtmlElementsFactory.create ( 
			'button', 
			{ 
				id : 'TravelNotes-NoteDialog-OpenEditorFileButton', 
				className: 'TravelNotes-NoteDialog-EditorButton', 
				title : g_Translator.getText ( 'NoteDialog - Open a configuration file' ), 
				innerHTML : '&#x23CD;'
			}, 
			openUserDataFileFakeDiv 
		);
		
		openUserDataFileButton.addEventListener ( 'click' , function ( ) { openUserDataFileInput.click ( ); }, false );
		
		// personnalised buttons from server file are restored
		m_AddEditionButtons ( g_TravelNotesButtonsAndIcons.editionButtons );
		
		// personnalised buttons from local file are restored
		m_AddEditionButtons ( g_UserButtonsAndIcons.editionButtons );

		m_AddPreDefinedIconsList ( );
	};
	
	/*
	--- End of m_CreateToolbar function ---
	*/

	/*
	--- m_CreateIconDimensions function -------------------------------------------------------------------------------

	Creation of icon dimensions...
	
	-------------------------------------------------------------------------------------------------------------------
	*/
	var m_CreateIconDimensions = function ( ) {
		var iconDimensionsDiv = m_HtmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv',
				id : 'TravelNotes-NoteDialog-DimensionsDataDiv'
			},
			m_NoteDataDiv
		);
		
		// ... width ...
		m_HtmlElementsFactory.create (
			'text',
			{
				data : g_Translator.getText ( 'NoteDialog - Icon width'),
			},
			iconDimensionsDiv
		);
		var widthInput =  m_HtmlElementsFactory.create (
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
		m_HtmlElementsFactory.create (
			'text',
			{
				data : g_Translator.getText ( 'NoteDialog - Icon height'),
			},
			iconDimensionsDiv
		);
		var heightInput =  m_HtmlElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-NoteDialog-NumberInput',
				id : 'TravelNotes-NoteDialog-HeightNumberInput'
			},
			iconDimensionsDiv
		);
		heightInput.value = note.iconHeight;
	};

	/*
	--- End of m_CreateIconDimensions function ---
	*/

	/*
	--- m_CreateIconContent function ----------------------------------------------------------------------------------

	Creation of icon content
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_CreateIconContent = function ( ) {
		m_HtmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				id : 'TravelNotes-NoteDialog-IconContentTitleDiv',
				innerHTML : g_Translator.getText ( 'NoteDialog - Icon content' )
			},
			m_NoteDataDiv
		);
		var iconHtmlContent = m_HtmlElementsFactory.create ( 
			'textarea',
			{ 
				className : 'TravelNotes-NoteDialog-TextArea',
				id: 'TravelNotes-NoteDialog-TextArea-IconHtmlContent'
			},
			m_NoteDataDiv
		);
		iconHtmlContent.addEventListener ( 'focus', onFocusControl, false );
		iconHtmlContent.value = note.iconContent;
	};
	
	/*
	--- End of m_CreateIconContent function ---
	*/

	/*
	--- m_CreatePopupContent function ---------------------------------------------------------------------------------

	Creation of popup content
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_CreatePopupContent = function ( ) {
		m_HtmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : g_Translator.getText ( 'NoteDialog - Text' )
			},
			m_NoteDataDiv
		);
		var popUpContent = m_HtmlElementsFactory.create ( 
			'textarea',
			{ 
				className : 'TravelNotes-NoteDialog-TextArea',
				id: 'TravelNotes-NoteDialog-TextArea-PopupContent'
			},
			m_NoteDataDiv
		);
		popUpContent.addEventListener ( 'focus', onFocusControl, false );
		popUpContent.value = note.popupContent;
	};
	
	/*
	--- End of m_CreatePopupContent function ---
	*/

	/*
	--- m_CreateTooltipContent function -------------------------------------------------------------------------------

	Creation of tooltip content
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_CreateTooltipContent = function ( ) {
		m_HtmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : g_Translator.getText ( 'NoteDialog - Tooltip content' )
			},
			m_NoteDataDiv
		);
		var tooltip = m_HtmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Tooltip'
			},
			m_NoteDataDiv
		);
		tooltip.addEventListener ( 'focus', onFocusControl, false );
		tooltip.value = note.tooltipContent;
	};
	
	/*
	--- End of m_CreateTooltipContent function ---
	*/

	/*
	--- m_CreateAddressContent function -------------------------------------------------------------------------------

	Creation of address content
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_CreateAddressContent = function ( ) {
		m_HtmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : '<span id=\'TravelNotes-NoteDialog-Reset-Address-Button\'>&#x1f504;</span>&nbsp;' + g_Translator.getText ( 'NoteDialog - Address&nbsp;:' )
			},
			m_NoteDataDiv
		);
		document.getElementById ( 'TravelNotes-NoteDialog-Reset-Address-Button' ).addEventListener ( 
			'click', 
			function ( ) { address.value = m_Address; },
			false 
		);
		
		var address = m_HtmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Adress'
			},
			m_NoteDataDiv
		);
		address.addEventListener ( 'focus', onFocusControl, false );
		address.value = note.address;
		
		// geolocalization
		newGeoCoder ( ).getPromiseAddress ( note.lat, note.lng ).then ( onGeocoderResponse );
	};
	
	/*
	--- End of m_CreateAddressContent function ---
	*/

	/*
	--- m_CreateLinkContent function ----------------------------------------------------------------------------------

	Creation of link content
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_CreateLinkContent = function ( ) {
		m_HtmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : g_Translator.getText ( 'NoteDialog - Link' )
			},
			m_NoteDataDiv
		);
		var link = m_HtmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Link'
			},
			m_NoteDataDiv
		);
		link.addEventListener (
			'focus',
			function ( ) {
				m_FocusControl = null;
			},
			false
		);
		link.value = note.url;
	};
	
	/*
	--- End of m_CreateLinkContent function ---
	*/

	/*
	--- m_CreatePhoneContent function ---------------------------------------------------------------------------------

	Creation of phone content
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_CreatePhoneContent = function ( ) {
		m_HtmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : g_Translator.getText ( 'NoteDialog - Phone' )
			},
			m_NoteDataDiv
		);
		var phone = m_HtmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Phone'
			},
			m_NoteDataDiv
		);
		phone.addEventListener ( 'focus', onFocusControl, false );
		phone.value = note.phone;
	};
	
	/*
	--- End of m_CreatePhoneContent function ---
	*/

	/*
	--- m_LoadIconsAndButtons function --------------------------------------------------------------------------------

	loading predefined icons and buttons
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_LoadIconsAndButtons = function ( ) {
		if ( 0 === g_TravelNotesButtonsAndIcons.preDefinedIconsList.length ) {
			var buttonsHttpRequest = new XMLHttpRequest ( );
			buttonsHttpRequest.onreadystatechange = function ( ) {
				if ( this.readyState === buttonsHttpRequest.DONE ) {
					if ( this.status === 200 ) {
						try {
							g_TravelNotesButtonsAndIcons = JSON.parse ( this.responseText );
							m_AddEditionButtons ( g_TravelNotesButtonsAndIcons.editionButtons );
							g_TravelNotesButtonsAndIcons.preDefinedIconsList.push ( { name : '', icon : '', tooltip : '', width : 40, height : 40 } );
							m_AddPreDefinedIconsList ( );
						}
						catch ( e )
						{
							console.log ( 'Error reading TravelNotesNoteDialog.json' );
						}
					} 
					else {
						console.log ( 'Error sending request for TravelNotesNoteDialog' + g_Config.language.toUpperCase ( ) + '.json' );
					}
				}
			};
			buttonsHttpRequest.open ( 
				'GET',
				window.location.href.substr (0, window.location.href.lastIndexOf( '/') + 1 ) +'TravelNotesNoteDialog' + g_Config.language.toUpperCase ( ) + '.json',
				true
			);
			buttonsHttpRequest.send ( null );
		}
	};
	
	/*
	--- End of m_LoadIconsAndButtons function ---
	*/

	/*
	--- Main function -------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	m_CreateBaseDialog ( );
	m_CreateToolbar ( );
	m_CreateIconDimensions ( );
	m_CreateIconContent ( );
	m_CreatePopupContent ( );
	m_CreateTooltipContent ( );
	m_CreateAddressContent ( );
	m_CreateLinkContent ( );
	m_CreatePhoneContent ( );
	m_LoadIconsAndButtons ( );
	
	// and the dialog is centered on the screen
	m_BaseDialog.center ( );
};
	
/*
--- End of NoteDialog.js file -----------------------------------------------------------------------------------------
*/	