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
		- Issue #66 : Work with promises for dialogs
		- Issue #68 : Review all existing promises.
Doc reviewed 20191124
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

'use strict';

export { newNoteDialog };

import { g_Translator } from '../UI/Translator.js';
import { g_Config } from '../data/Config.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newSvgIconFromOsmFactory } from '../core/SvgIconFromOsmFactory.js';
import { newGeoCoder } from '../core/GeoCoder.js';


let g_UserButtonsAndIcons = { editionButtons : [], preDefinedIconsList : [] };
let g_TravelNotesButtonsAndIcons = { editionButtons : [], preDefinedIconsList : [] };
let g_AllButtonsAndIcons = { editionButtons : [], preDefinedIconsList : [] };

/*
--- newNoteDialog function --------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newNoteDialog ( note, routeObjId , newNote ) {
	
	let m_FocusControl = null;
	let m_HtmlElementsFactory = newHTMLElementsFactory ( ) ;
	let m_LatLng = note.latLng;
	let m_Address = '';
	let m_City = '';
	
	let m_NoteDialog = null;
	let m_NoteDataDiv = null;
	let m_IconHtmlContent = null;
	let m_WidthInput = null;
	let m_HeightInput = null;
	let m_PopupContent = null;
	let m_TooltipContent = null;
	let m_AdressInput = null;
	let m_UrlInput = null;
	let m_PhoneInput = null;
	let m_ResetAdressButton = null;
	let m_PredefinedIconsSelect = null;
	let m_ToolbarDiv = null;

	/*
	--- m_OnOkButtonClick function ------------------------------------------------------------------------------------

	click event listener for the ok button

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnOkButtonClick ( ) {
		// Verifying that the icon is not empty. A note with an empty icon cannot be viewed on the map
		// and then, cannot be edited or removed!
		if ( 0 === m_IconHtmlContent.value.length ) {
			m_NoteDialog.showError ( g_Translator.getText ( 'Notedialog - The icon content cannot be empty' ) );
		}
		// saving values in the note.
		note.iconWidth = m_WidthInput.value;
		note.iconHeight = m_HeightInput.value;
		note.iconContent = m_IconHtmlContent.value;
		note.popupContent = m_PopupContent.value;
		note.tooltipContent = m_TooltipContent.value;
		note.address = m_AdressInput.value;
		note.url = m_UrlInput.value;
		note.phone = m_PhoneInput.value;
		note.latLng = m_LatLng;

		return note;
	}

	/*
	--- End of m_OnOkButtonClick function ---
	*/
	
	/*
	--- m_OnGeocoderResponse function ---------------------------------------------------------------------------------

	Handler for the geoCoder call
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnGeocoderResponse ( geoCoderData ) {
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
			m_AdressInput.value = m_Address;
		}
	}

	/*
	--- End of m_OnGeocoderResponse function ---
	*/

	/*
	--- m_OnGeocoderError function -------------------------------------------------------------------------------------

	Error handler for the geoCoder call
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnGeocoderError ( err ) {
		m_NoteDialog.showError ( g_Translator.getText ( 'Notedialog - an error occurs when searching the adress' ) );
		console.log ( err ? err : "an error occurs when searching the adress." );
	}

	/*
	--- End of m_OnGeocoderError function ---
	*/
	
	/*
	--- m_OnSvgIcon function ------------------------------------------------------------------------------------------

	event handler for predefined icons list
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnSvgIcon ( data ) {
		m_IconHtmlContent.value = data.svg.outerHTML;
		let directionArrow = '';
		if ( null !== data.direction ) {
			let cfgDirection = g_Config.note.svgAnleMaxDirection;
			if ( data.direction < cfgDirection.right ) {
				m_TooltipContent.value = g_Translator.getText ( 'NoteDialog - Turn right');
				directionArrow = String.fromCodePoint ( 0x1F882 );
			}
			else if ( data.direction < cfgDirection.slightRight ) {
				m_TooltipContent.value = g_Translator.getText ( 'NoteDialog - Turn slight right');
				directionArrow = String.fromCodePoint ( 0x1F885 );
			}
			else if ( data.direction < cfgDirection.continue ) {
				m_TooltipContent.value = g_Translator.getText ( 'NoteDialog - Continue');
				directionArrow = String.fromCodePoint ( 0x1F881 );
			}
			else if ( data.direction < cfgDirection.slightLeft ) {
				m_TooltipContent.value = g_Translator.getText ( 'NoteDialog - Turn slight left');
				directionArrow = String.fromCodePoint ( 0x1F884 );
			}
			else if ( data.direction < cfgDirection.left ) {
				m_TooltipContent.value = g_Translator.getText ( 'NoteDialog - Turn left');
				directionArrow = String.fromCodePoint ( 0x1F880 );
			}
			else if ( data.direction < cfgDirection.sharpLeft ) {
				m_TooltipContent.value = g_Translator.getText ( 'NoteDialog - Turn sharp left');
				directionArrow = String.fromCodePoint ( 0x1F887 );
			}
			else if ( data.direction < cfgDirection.sharpRight ) {
				m_TooltipContent.value = g_Translator.getText ( 'NoteDialog - Turn sharp right');
				directionArrow = String.fromCodePoint ( 0x1F886 );
			}
			else {
				m_TooltipContent.value = g_Translator.getText ( 'NoteDialog - Turn right');
				directionArrow = String.fromCodePoint ( 0x1F882 );
			}
		}
		if ( -1 === data.startStop ) {
			m_TooltipContent.value = g_Translator.getText ( 'NoteDialog - Start');
		}
		else if ( 1 === data.startStop ) {
			m_TooltipContent.value = g_Translator.getText ( 'NoteDialog - Stop');
		}
		
		let address = '';
		let showPlace = 0;
		for ( let counter = 0; counter < data.streets.length; counter ++ ) {
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
		m_AdressInput.value = address;
		
		document.getElementById ( 'TravelNotes-BaseDialog-OkButton' ).style.visibility = 'visible';
		m_LatLng = data.latLng;
	}
	
	/*
	--- End of m_OnSvgIcon function ---
	*/

	/*
	--- m_OnErrorSvgIcon function -------------------------------------------------------------------------------------

	event handler for predefined icons list
	
	-------------------------------------------------------------------------------------------------------------------
	*/
	function m_OnErrorSvgIcon ( err ) {
		document.getElementById ( 'TravelNotes-BaseDialog-OkButton' ).style.visibility = 'visible';
		m_NoteDialog.showError ( g_Translator.getText ( 'Notedialog - an error occurs when creating the SVG icon' ) );
		console.log ( err ? err : "an error occurs when creating the SVG icon." )
	}

	/*
	--- End of m_OnErrorSvgIcon function ---
	*/

	/*
	--- m_OnPredefinedIconListSelectChange function -------------------------------------------------------------------

	event handler for predefined icons list
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnPredefinedIconListSelectChange ( changeEvent ) {

		let preDefinedIcon = g_AllButtonsAndIcons.preDefinedIconsList [ changeEvent.target.selectedIndex ];
		if ( preDefinedIcon.name === g_Translator.getText ( 'NoteDialog - SVG icon from OSM') ) {
			document.getElementById ( 'TravelNotes-BaseDialog-OkButton' ).style.visibility = 'hidden';
			newSvgIconFromOsmFactory ( ).getPromiseSvgIcon ( note.latLng, routeObjId).then ( m_OnSvgIcon ).catch ( m_OnErrorSvgIcon );
		}
		else{
			m_WidthInput.value = preDefinedIcon.width ;
			m_HeightInput = preDefinedIcon.height ;
			m_IconHtmlContent.value = preDefinedIcon.icon ;
			m_TooltipContent.value = preDefinedIcon.tooltip ;
		}
	}

	/*
	--- End of m_OnPredefinedIconListSelectChange function ---
	*/

	/*
	--- m_OnClickEditionButton function -------------------------------------------------------------------------------

	event handler for edition with the styles buttons
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnClickEditionButton ( event ) {
		if ( ! m_FocusControl ) {
			return;
		}
		let button = event.target;
		while ( ! button.htmlBefore ) {
			button = button.parentNode;
		}
		let bInsertBeforeAndAfter = button.htmlAfter && 0 < button.htmlAfter.length;
		let selectionStart = m_FocusControl.selectionStart;
		let selectionEnd = m_FocusControl.selectionEnd;
		let oldText = m_FocusControl.value;
		m_FocusControl.value = oldText.substring ( 0, selectionStart ) + 
			( bInsertBeforeAndAfter ? button.htmlBefore + oldText.substring ( selectionStart, selectionEnd ) + button.htmlAfter : button.htmlBefore ) + 
			oldText.substring ( selectionEnd );
		m_FocusControl.setSelectionRange ( 
			bInsertBeforeAndAfter || selectionStart === selectionEnd ? selectionStart + button.htmlBefore.length : selectionStart,
			( bInsertBeforeAndAfter ? selectionEnd : selectionStart ) + button.htmlBefore.length );
		m_FocusControl.focus ( );
	}

	/*
	--- End of m_OnClickEditionButton function ---
	*/

	/*
	--- m_OnOpenUserDataFileInputChange function ------------------------------------------------------------------------

	event handler for 
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnOpenUserDataFileInputChange ( event ) {
		let fileReader = new FileReader( );
		fileReader.onload = function ( ) {
			try {
				let newUserButtonsAndIcons = JSON.parse ( fileReader.result ) ;
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
	}

	/*
	--- End of m_OnOpenUserDataFileInputChange function ---
	*/

	/*
	--- m_OnFocusControl function ---------------------------------------------------------------------------------------

	event handler for 
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnFocusControl ( event ) {
		m_FocusControl = event.target;
	}
	
	/*
	--- End of m_OnFocusControl function ---
	*/

	/*
	--- m_AddPreDefinedIconsList function -----------------------------------------------------------------------------

	function to add the predefined icons to the select

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_AddPreDefinedIconsList ( ) {
		g_AllButtonsAndIcons.preDefinedIconsList = g_TravelNotesButtonsAndIcons.preDefinedIconsList.concat ( g_UserButtonsAndIcons.preDefinedIconsList );

		if ( -1 < routeObjId ) {
			g_AllButtonsAndIcons.preDefinedIconsList.push ( { name : g_Translator.getText ( 'NoteDialog - SVG icon from OSM'), icon : '', tooltip : '', width : 40, height : 40 } );
		}

		g_AllButtonsAndIcons.preDefinedIconsList.sort ( function ( a, b ) { return a.name.localeCompare ( b.name );} );
		let elementCounter = 0;
		for ( elementCounter = m_PredefinedIconsSelect.length - 1; elementCounter>= 0; elementCounter -- ) {
			m_PredefinedIconsSelect.remove ( elementCounter );
		}
		for ( elementCounter = 0; elementCounter < g_AllButtonsAndIcons.preDefinedIconsList.length; elementCounter ++ ) {
			let option = m_HtmlElementsFactory.create ( 'option', { text :  g_AllButtonsAndIcons.preDefinedIconsList [ elementCounter ].name } );
			m_PredefinedIconsSelect.add ( option );
		}
	}

	/*
	--- End of m_AddPreDefinedIconsList function ---
	*/

	/*
	--- m_AddEditionButtons function ----------------------------------------------------------------------------------

	function to add buttons on the toolbar
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_AddEditionButtons ( editionButtons ) {
		editionButtons.forEach ( 
			function ( editionButton ) {
				let newButton = m_HtmlElementsFactory.create ( 
					'button',
					{
						type : 'button',
						innerHTML : editionButton.title || '?',
						htmlBefore : editionButton.htmlBefore || '',
						htmlAfter : editionButton.htmlAfter || '',
						className : 'TravelNotes-NoteDialog-EditorButton'
					},
					m_ToolbarDiv
				);
				newButton.addEventListener ( 'click', m_OnClickEditionButton, false );
			}
		);
	}

	/*
	--- End of m_AddEditionButtons function ---
	*/
	
	/*
	--- m_CreateDialog function ---------------------------------------------------------------------------------------

	Creation of the base dialog
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateDialog ( ) {
	
		// the dialog base is created
		m_NoteDialog = newBaseDialog ( );
		m_NoteDialog.title = g_Translator.getText ( 'NoteDialog - Note' );
		m_NoteDialog.okButtonListener = m_OnOkButtonClick;

		m_NoteDataDiv = m_HtmlElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-NoteDialog-MainDataDiv'
			},
			m_NoteDialog.content
		);
	}
	
	/*
	--- End of m_CreateBaseDialog function ---
	*/

	/*
	--- m_CreateToolbar function --------------------------------------------------------------------------------------

	Creation of the toolbar 
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateToolbar ( ) {
		m_ToolbarDiv = m_HtmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-ToolbarDiv',
				id : 'TravelNotes-NoteDialog-ToolbarDiv'
			},
			m_NoteDataDiv
		);
		
		// a select is added for the predefined icons
		m_PredefinedIconsSelect = m_HtmlElementsFactory.create (
			'select',
			{
				className : 'TravelNotes-NoteDialog-Select',
				id : 'TravelNotes-NoteDialog-IconSelect'
			},
			m_ToolbarDiv
		);
		
		// change event listener on the select
		m_PredefinedIconsSelect.addEventListener ( 'change', m_OnPredefinedIconListSelectChange, false );
		

		// open userdata button ... with the well know hack to hide the file input ( a div + an input + a fake div + a button )
		let openUserDataFileDiv = m_HtmlElementsFactory.create ( 
			'div', 
			{ 
				id: 'TravelNotes-NoteDialog-OpenEditorFileDiv'
			}, 
			m_ToolbarDiv 
		);
		let openUserDataFileInput = m_HtmlElementsFactory.create ( 
			'input',
			{
				id : 'TravelNotes-NoteDialog-OpenEditorFileInput', 
				type : 'file',
				accept : '.json'
			},
			openUserDataFileDiv
		);
		openUserDataFileInput.addEventListener ( 'change', m_OnOpenUserDataFileInputChange, false );
		let openUserDataFileFakeDiv = m_HtmlElementsFactory.create ( 
			'div', 
			{ 
				id: 'TravelNotes-NoteDialog-OpenStyleFakeDiv'
			}, 
			openUserDataFileDiv 
		);
		let openUserDataFileButton = m_HtmlElementsFactory.create ( 
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
	}
	
	/*
	--- End of m_CreateToolbar function ---
	*/

	/*
	--- m_CreateIconDimensions function -------------------------------------------------------------------------------

	Creation of icon dimensions...
	
	-------------------------------------------------------------------------------------------------------------------
	*/
	function m_CreateIconDimensions ( ) {
		let iconDimensionsDiv = m_HtmlElementsFactory.create (
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
		m_WidthInput =  m_HtmlElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-NoteDialog-NumberInput',
				id : 'TravelNotes-NoteDialog-WidthNumberInput'
				
			},
			iconDimensionsDiv
		);
		m_WidthInput.value = note.iconWidth;
		
		// ... and height
		m_HtmlElementsFactory.create (
			'text',
			{
				data : g_Translator.getText ( 'NoteDialog - Icon height'),
			},
			iconDimensionsDiv
		);
		m_HeightInput =  m_HtmlElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-NoteDialog-NumberInput',
				id : 'TravelNotes-NoteDialog-HeightNumberInput'
			},
			iconDimensionsDiv
		);
		m_HeightInput.value = note.iconHeight;
	}

	/*
	--- End of m_CreateIconDimensions function ---
	*/

	/*
	--- m_CreateIconContent function ----------------------------------------------------------------------------------

	Creation of icon content
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateIconContent ( ) {
		m_HtmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				id : 'TravelNotes-NoteDialog-IconContentTitleDiv',
				innerHTML : g_Translator.getText ( 'NoteDialog - Icon content' )
			},
			m_NoteDataDiv
		);
		m_IconHtmlContent = m_HtmlElementsFactory.create ( 
			'textarea',
			{ 
				className : 'TravelNotes-NoteDialog-TextArea',
				id: 'TravelNotes-NoteDialog-TextArea-IconHtmlContent'
			},
			m_NoteDataDiv
		);
		m_IconHtmlContent.addEventListener ( 'focus', m_OnFocusControl, false );
		m_IconHtmlContent.value = note.iconContent;
	}
	
	/*
	--- End of m_CreateIconContent function ---
	*/

	/*
	--- m_CreatePopupContent function ---------------------------------------------------------------------------------

	Creation of popup content
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreatePopupContent ( ) {
		m_HtmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : g_Translator.getText ( 'NoteDialog - Text' )
			},
			m_NoteDataDiv
		);
		m_PopupContent = m_HtmlElementsFactory.create ( 
			'textarea',
			{ 
				className : 'TravelNotes-NoteDialog-TextArea',
				id: 'TravelNotes-NoteDialog-TextArea-PopupContent'
			},
			m_NoteDataDiv
		);
		m_PopupContent.addEventListener ( 'focus', m_OnFocusControl, false );
		m_PopupContent.value = note.popupContent;
	}
	
	/*
	--- End of m_CreatePopupContent function ---
	*/

	/*
	--- m_CreateTooltipContent function -------------------------------------------------------------------------------

	Creation of tooltip content
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateTooltipContent ( ) {
		m_HtmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : g_Translator.getText ( 'NoteDialog - Tooltip content' )
			},
			m_NoteDataDiv
		);
		m_TooltipContent = m_HtmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Tooltip'
			},
			m_NoteDataDiv
		);
		m_TooltipContent.addEventListener ( 'focus', m_OnFocusControl, false );
		m_TooltipContent.value = note.tooltipContent;
	}
	
	/*
	--- End of m_CreateTooltipContent function ---
	*/

	/*
	--- m_CreateAddressContent function -------------------------------------------------------------------------------

	Creation of address content
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateAddressContent ( ) {
		m_ResetAdressButton = m_HtmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : '<span id=\'TravelNotes-NoteDialog-Reset-Address-Button\'>&#x1f504;</span>&nbsp;' + g_Translator.getText ( 'NoteDialog - Address&nbsp;:' )
			},
			m_NoteDataDiv
		);
		m_ResetAdressButton.addEventListener ( 
			'click', 
			function ( ) { m_AdressInput.value = m_Address; },
			false 
		);
		m_AdressInput = m_HtmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Adress'
			},
			m_NoteDataDiv
		);
		m_AdressInput.addEventListener ( 'focus', m_OnFocusControl, false );
		m_AdressInput.value = note.address;
		// geolocalization
		newGeoCoder ( ).getPromiseAddress ( note.lat, note.lng ).then ( m_OnGeocoderResponse ).catch ( m_OnGeocoderError );
		
	}
	
	/*
	--- End of m_CreateAddressContent function ---
	*/

	/*
	--- m_CreateLinkContent function ----------------------------------------------------------------------------------

	Creation of link content
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateLinkContent ( ) {
		m_HtmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : g_Translator.getText ( 'NoteDialog - Link' )
			},
			m_NoteDataDiv
		);
		m_UrlInput = m_HtmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Link'
			},
			m_NoteDataDiv
		);
		m_UrlInput.addEventListener (
			'focus',
			function ( ) {
				m_FocusControl = null;
			},
			false
		);
		m_UrlInput.value = note.url;
	}
	
	/*
	--- End of m_CreateLinkContent function ---
	*/

	/*
	--- m_CreatePhoneContent function ---------------------------------------------------------------------------------

	Creation of phone content
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreatePhoneContent ( ) {
		m_HtmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : g_Translator.getText ( 'NoteDialog - Phone' )
			},
			m_NoteDataDiv
		);
		m_PhoneInput = m_HtmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Phone'
			},
			m_NoteDataDiv
		);
		m_PhoneInput.addEventListener ( 'focus', m_OnFocusControl, false );
		m_PhoneInput.value = note.phone;
	}
	
	/*
	--- End of m_CreatePhoneContent function ---
	*/

	/*
	--- m_LoadIconsAndButtons function --------------------------------------------------------------------------------

	loading predefined icons and buttons
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_LoadIconsAndButtons ( ) {
		if ( 0 === g_TravelNotesButtonsAndIcons.preDefinedIconsList.length ) {
			let buttonsHttpRequest = new XMLHttpRequest ( );
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
	}
	
	/*
	--- End of m_LoadIconsAndButtons function ---
	*/

	/*
	--- Main function -------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	m_CreateDialog ( );
	m_CreateToolbar ( );
	m_CreateIconDimensions ( );
	m_CreateIconContent ( );
	m_CreatePopupContent ( );
	m_CreateTooltipContent ( );
	m_CreateAddressContent ( );
	m_CreateLinkContent ( );
	m_CreatePhoneContent ( );
	m_LoadIconsAndButtons ( );
	m_AddPreDefinedIconsList ( );

	return m_NoteDialog;
}
	
/*
--- End of NoteDialog.js file -----------------------------------------------------------------------------------------
*/	