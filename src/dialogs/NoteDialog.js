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
		- Issue #76 : Add a devil button in the noteDialog.
Doc reviewed 20191124
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newNoteDialog };

import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newSvgIconFromOsmFactory } from '../core/SvgIconFromOsmFactory.js';
import { newGeoCoder } from '../core/GeoCoder.js';
import { newHttpRequestBuilder } from '../util/HttpRequestBuilder.js';

let theUserButtonsAndIcons = { editionButtons : [], preDefinedIconsList : [] };
let theTravelNotesButtonsAndIcons = { editionButtons : [], preDefinedIconsList : [] };
let theAllButtonsAndIcons = { editionButtons : [], preDefinedIconsList : [] };

/*
--- newNoteDialog function --------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newNoteDialog ( note, routeObjId, newNote ) {

	let myFocusControl = null;
	let myHTMLElementsFactory = newHTMLElementsFactory ( ) ;
	let myLatLng = note.latLng;
	let myAddress = '';
	let myCity = '';

	let myNoteDialog = null;
	let myNoteDataDiv = null;
	let myIconHtmlContent = null;
	let myWidthInput = null;
	let myHeightInput = null;
	let myPopupContent = null;
	let myTooltipContent = null;
	let myAdressInput = null;
	let myUrlInput = null;
	let myPhoneInput = null;
	let myResetAdressButton = null;
	let myPredefinedIconsSelect = null;
	let myToolbarDiv = null;

	/*
	--- myOnOkButtonClick function ------------------------------------------------------------------------------------

	click event listener for the ok button

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkButtonClick ( ) {

		// Verifying that the icon is not empty. A note with an empty icon cannot be viewed on the map
		// and then, cannot be edited or removed!
		if ( 0 === myIconHtmlContent.value.length ) {
			myNoteDialog.showError ( theTranslator.getText ( 'Notedialog - The icon content cannot be empty' ) );
		}

		// saving values in the note.
		note.iconWidth = myWidthInput.value;
		note.iconHeight = myHeightInput.value;
		note.iconContent = myIconHtmlContent.value;
		note.popupContent = myPopupContent.value;
		note.tooltipContent = myTooltipContent.value;
		note.address = myAdressInput.value;
		note.url = myUrlInput.value;
		note.phone = myPhoneInput.value;
		note.latLng = myLatLng;

		return note;
	}

	/*
	--- End of myOnOkButtonClick function ---
	*/

	/*
	--- myOnGeocoderResponse function ---------------------------------------------------------------------------------

	Handler for the geoCoder call

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnGeocoderResponse ( geoCoderData ) {
		myAddress = '';
		myCity = '';
		if ( geoCoderData.address.house_number ) {
			myAddress += geoCoderData.address.house_number + ' ';
		}
		if ( geoCoderData.address.road ) {
			myAddress += geoCoderData.address.road + ' ';
		}
		else if ( geoCoderData.address.pedestrian ) {
			myAddress += geoCoderData.address.pedestrian + ' ';
		}
		if (  geoCoderData.address.village ) {
			myCity = geoCoderData.address.village;
		}
		else if ( geoCoderData.address.town ) {
			myCity = geoCoderData.address.town;
		}
		else if ( geoCoderData.address.city ) {
			myCity = geoCoderData.address.city;
		}
		if ( '' !== myCity ) {
			myAddress += theConfig.note.cityPrefix + myCity + theConfig.note.cityPostfix;
		}
		if ( 0 === myAddress.length ) {
			myAddress += geoCoderData.address.country;
		}
		if ( ( theConfig.note.reverseGeocoding )  && ( '' === note.address ) && newNote ) {
			myAdressInput.value = myAddress;
		}
	}

	/*
	--- End of myOnGeocoderResponse function ---
	*/

	/*
	--- myOnGeocoderError function -------------------------------------------------------------------------------------

	Error handler for the geoCoder call

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnGeocoderError ( err ) {
		myNoteDialog.showError ( theTranslator.getText ( 'Notedialog - an error occurs when searching the adress' ) );
		console.log ( err ? err : 'an error occurs when searching the adress.' );
	}

	/*
	--- End of myOnGeocoderError function ---
	*/

	/*
	--- myOnSvgIcon function ------------------------------------------------------------------------------------------

	event handler for predefined icons list

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSvgIcon ( data ) {
		myIconHtmlContent.value = data.svg.outerHTML;
		let directionArrow = '';
		if ( null !== data.direction ) {
			let cfgDirection = theConfig.note.svgAnleMaxDirection;
			if ( data.direction < cfgDirection.right ) {
				myTooltipContent.value = theTranslator.getText ( 'NoteDialog - Turn right');
				directionArrow = String.fromCodePoint ( 0x1F882 );
			}
			else if ( data.direction < cfgDirection.slightRight ) {
				myTooltipContent.value = theTranslator.getText ( 'NoteDialog - Turn slight right');
				directionArrow = String.fromCodePoint ( 0x1F885 );
			}
			else if ( data.direction < cfgDirection.continue ) {
				myTooltipContent.value = theTranslator.getText ( 'NoteDialog - Continue');
				directionArrow = String.fromCodePoint ( 0x1F881 );
			}
			else if ( data.direction < cfgDirection.slightLeft ) {
				myTooltipContent.value = theTranslator.getText ( 'NoteDialog - Turn slight left');
				directionArrow = String.fromCodePoint ( 0x1F884 );
			}
			else if ( data.direction < cfgDirection.left ) {
				myTooltipContent.value = theTranslator.getText ( 'NoteDialog - Turn left');
				directionArrow = String.fromCodePoint ( 0x1F880 );
			}
			else if ( data.direction < cfgDirection.sharpLeft ) {
				myTooltipContent.value = theTranslator.getText ( 'NoteDialog - Turn sharp left');
				directionArrow = String.fromCodePoint ( 0x1F887 );
			}
			else if ( data.direction < cfgDirection.sharpRight ) {
				myTooltipContent.value = theTranslator.getText ( 'NoteDialog - Turn sharp right');
				directionArrow = String.fromCodePoint ( 0x1F886 );
			}
			else {
				myTooltipContent.value = theTranslator.getText ( 'NoteDialog - Turn right');
				directionArrow = String.fromCodePoint ( 0x1F882 );
			}
		}
		if ( -1 === data.startStop ) {
			myTooltipContent.value = theTranslator.getText ( 'NoteDialog - Start');
		}
		else if ( 1 === data.startStop ) {
			myTooltipContent.value = theTranslator.getText ( 'NoteDialog - Stop');
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
		if ( ! data.city && '' !== myCity ) {
			data.city = myCity;
		}
		if ( data.city ) {
			address += ' ' + theConfig.note.cityPrefix + data.city + theConfig.note.cityPostfix;
		}
		if ( data.place && data.place !== data.city  && showPlace !== 2 ) {
			address += ' (' + data.place + ')';
		}
		myAdressInput.value = address;

		myNoteDialog.hideWait ( );
		myLatLng = data.latLng;
	}

	/*
	--- End of myOnSvgIcon function ---
	*/

	/*
	--- myOnErrorSvgIcon function -------------------------------------------------------------------------------------

	event handler for predefined icons list

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnErrorSvgIcon ( err ) {
		myNoteDialog.hideWait ( );
		myNoteDialog.showError ( theTranslator.getText ( 'Notedialog - an error occurs when creating the SVG icon' ) );
		console.log ( err ? err : 'an error occurs when creating the SVG icon.' );
	}

	/*
	--- End of myOnErrorSvgIcon function ---
	*/

	/*
	--- myOnPredefinedIconListSelectChange function -------------------------------------------------------------------

	event handler for predefined icons list

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnPredefinedIconListSelectChange ( changeEvent ) {

		let preDefinedIcon = theAllButtonsAndIcons.preDefinedIconsList [ changeEvent.target.selectedIndex ];
		if ( preDefinedIcon.name === theTranslator.getText ( 'NoteDialog - SVG icon from OSM') ) {
			myNoteDialog.showWait ( );
			newSvgIconFromOsmFactory ( ).getPromiseIconAndAdress ( note.latLng, routeObjId)
				.then ( myOnSvgIcon )
				.catch ( myOnErrorSvgIcon );
		}
		else {
			myWidthInput.value = preDefinedIcon.width ;
			myHeightInput = preDefinedIcon.height ;
			myIconHtmlContent.value = preDefinedIcon.icon ;
			myTooltipContent.value = preDefinedIcon.tooltip ;
		}
	}

	/*
	--- End of myOnPredefinedIconListSelectChange function ---
	*/

	/*
	--- myOnClickEditionButton function -------------------------------------------------------------------------------

	event handler for edition with the styles buttons

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnClickEditionButton ( event ) {
		if ( ! myFocusControl ) {
			return;
		}
		let button = event.target;
		while ( ! button.htmlBefore ) {
			button = button.parentNode;
		}
		let bInsertBeforeAndAfter = button.htmlAfter && 0 < button.htmlAfter.length;
		let selectionStart = myFocusControl.selectionStart;
		let selectionEnd = myFocusControl.selectionEnd;
		let oldText = myFocusControl.value;
		myFocusControl.value =
			oldText.substring ( 0, selectionStart ) +
			(
				bInsertBeforeAndAfter
					?
					button.htmlBefore + oldText.substring ( selectionStart, selectionEnd ) + button.htmlAfter
					:
					button.htmlBefore
			) +
			oldText.substring ( selectionEnd );
		myFocusControl.setSelectionRange (
			bInsertBeforeAndAfter || selectionStart === selectionEnd
				?
				selectionStart + button.htmlBefore.length
				:
				selectionStart,
			( bInsertBeforeAndAfter ? selectionEnd : selectionStart ) + button.htmlBefore.length
		);
		myFocusControl.focus ( );
	}

	/*
	--- End of myOnClickEditionButton function ---
	*/

	/*
	--- myOnOpenUserDataFileInputChange function ------------------------------------------------------------------------

	event handler for

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOpenUserDataFileInputChange ( event ) {
		let fileReader = new FileReader ( );
		fileReader.onload = function ( ) {
			try {
				let newUserButtonsAndIcons = JSON.parse ( fileReader.result ) ;
				theUserButtonsAndIcons.editionButtons =
					theUserButtonsAndIcons.editionButtons.concat ( newUserButtonsAndIcons.editionButtons );
				theUserButtonsAndIcons.preDefinedIconsList =
					theUserButtonsAndIcons.preDefinedIconsList.concat ( newUserButtonsAndIcons.preDefinedIconsList );
				myAddEditionButtons ( newUserButtonsAndIcons.editionButtons );
				myAddPreDefinedIconsList ( );
			}
			catch ( err ) {
				console.log ( err ? err : 'An error occurs when opening the file' );
			}
		};
		fileReader.readAsText ( event.target.files [ 0 ] );
	}

	/*
	--- End of myOnOpenUserDataFileInputChange function ---
	*/

	/*
	--- myOnFocusControl function ---------------------------------------------------------------------------------------

	event handler for

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnFocusControl ( event ) {
		myFocusControl = event.target;
	}

	/*
	--- End of myOnFocusControl function ---
	*/

	/*
	--- myAddPreDefinedIconsList function -----------------------------------------------------------------------------

	function to add the predefined icons to the select

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddPreDefinedIconsList ( ) {
		theAllButtonsAndIcons.preDefinedIconsList =
			theTravelNotesButtonsAndIcons.preDefinedIconsList.concat ( theUserButtonsAndIcons.preDefinedIconsList );

		if ( -1 < routeObjId ) {
			theAllButtonsAndIcons.preDefinedIconsList.push (
				{
					name : theTranslator.getText ( 'NoteDialog - SVG icon from OSM'),
					icon : '',
					tooltip : '',
					width : 40,
					height : 40
				}
			);
		}

		theAllButtonsAndIcons.preDefinedIconsList.sort (
			( first, second ) => { return first.name.localeCompare ( second.name ); }
		);
		let elementCounter = 0;
		for ( elementCounter = myPredefinedIconsSelect.length - 1; elementCounter>= 0; elementCounter -- ) {
			myPredefinedIconsSelect.remove ( elementCounter );
		}
		for ( elementCounter = 0; elementCounter < theAllButtonsAndIcons.preDefinedIconsList.length; elementCounter ++ ) {
			myPredefinedIconsSelect.add (
				myHTMLElementsFactory.create (
					'option',
					{
						text : theAllButtonsAndIcons.preDefinedIconsList [ elementCounter ].name
					}
				)
			);
		}
	}

	/*
	--- End of myAddPreDefinedIconsList function ---
	*/

	/*
	--- myAddEditionButtons function ----------------------------------------------------------------------------------

	function to add buttons on the toolbar
	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddEditionButtons ( editionButtons ) {
		editionButtons.forEach (
			function ( editionButton ) {
				let newButton = myHTMLElementsFactory.create (
					'button',
					{
						type : 'button',
						innerHTML : editionButton.title || '?',
						htmlBefore : editionButton.htmlBefore || '',
						htmlAfter : editionButton.htmlAfter || '',
						className : 'TravelNotes-NoteDialog-EditorButton'
					},
					myToolbarDiv
				);
				newButton.addEventListener ( 'click', myOnClickEditionButton, false );
			}
		);
	}

	/*
	--- End of myAddEditionButtons function ---
	*/

	/*
	--- myCreateDialog function ---------------------------------------------------------------------------------------

	Creation of the base dialog

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDialog ( ) {

		// the dialog base is created
		myNoteDialog = newBaseDialog ( );
		myNoteDialog.title = theTranslator.getText ( 'NoteDialog - Note' );
		myNoteDialog.okButtonListener = myOnOkButtonClick;

		myNoteDataDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-NoteDialog-MainDataDiv'
			},
			myNoteDialog.content
		);
	}

	/*
	--- End of myCreateBaseDialog function ---
	*/

	/*
	--- myCreateToolbar function --------------------------------------------------------------------------------------

	Creation of the toolbar

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateToolbar ( ) {
		myToolbarDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-ToolbarDiv',
				id : 'TravelNotes-NoteDialog-ToolbarDiv'
			},
			myNoteDataDiv
		);

		// a select is added for the predefined icons
		myPredefinedIconsSelect = myHTMLElementsFactory.create (
			'select',
			{
				className : 'TravelNotes-NoteDialog-Select',
				id : 'TravelNotes-NoteDialog-IconSelect'
			},
			myToolbarDiv
		);

		// change event listener on the select
		myPredefinedIconsSelect.addEventListener ( 'change', myOnPredefinedIconListSelectChange, false );

		// open userdata button ... with the well know hack to hide the file input ( a div + an input + a fake div + a button )
		let openUserDataFileDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-NoteDialog-OpenEditorFileDiv'
			},
			myToolbarDiv
		);
		let openUserDataFileInput = myHTMLElementsFactory.create (
			'input',
			{
				id : 'TravelNotes-NoteDialog-OpenEditorFileInput',
				type : 'file',
				accept : '.json'
			},
			openUserDataFileDiv
		);
		openUserDataFileInput.addEventListener ( 'change', myOnOpenUserDataFileInputChange, false );
		let openUserDataFileFakeDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-NoteDialog-OpenStyleFakeDiv'
			},
			openUserDataFileDiv
		);
		let openUserDataFileButton = myHTMLElementsFactory.create (
			'button',
			{
				id : 'TravelNotes-NoteDialog-OpenEditorFileButton',
				className : 'TravelNotes-NoteDialog-EditorButton',
				title : theTranslator.getText ( 'NoteDialog - Open a configuration file' ),
				innerHTML : '&#x23CD;'
			},
			openUserDataFileFakeDiv
		);

		openUserDataFileButton.addEventListener (
			'click',
			( ) => openUserDataFileInput.click ( ),
			false
		);

		// personnalised buttons from server file are restored
		myAddEditionButtons ( theTravelNotesButtonsAndIcons.editionButtons );

		// personnalised buttons from local file are restored
		myAddEditionButtons ( theUserButtonsAndIcons.editionButtons );
	}

	/*
	--- End of myCreateToolbar function ---
	*/

	/*
	--- myCreateIconDimensions function -------------------------------------------------------------------------------

	Creation of icon dimensions...

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateIconDimensions ( ) {
		let iconDimensionsDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv',
				id : 'TravelNotes-NoteDialog-DimensionsDataDiv'
			},
			myNoteDataDiv
		);

		// ... width ...
		myHTMLElementsFactory.create (
			'text',
			{
				data : theTranslator.getText ( 'NoteDialog - Icon width')
			},
			iconDimensionsDiv
		);
		myWidthInput =  myHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-NoteDialog-NumberInput',
				id : 'TravelNotes-NoteDialog-WidthNumberInput'

			},
			iconDimensionsDiv
		);
		myWidthInput.value = note.iconWidth;

		// ... and height
		myHTMLElementsFactory.create (
			'text',
			{
				data : theTranslator.getText ( 'NoteDialog - Icon height')
			},
			iconDimensionsDiv
		);
		myHeightInput =  myHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-NoteDialog-NumberInput',
				id : 'TravelNotes-NoteDialog-HeightNumberInput'
			},
			iconDimensionsDiv
		);
		myHeightInput.value = note.iconHeight;
	}

	/*
	--- End of myCreateIconDimensions function ---
	*/

	/*
	--- myCreateIconContent function ----------------------------------------------------------------------------------

	Creation of icon content

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateIconContent ( ) {
		myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-TitleDiv',
				id : 'TravelNotes-NoteDialog-IconContentTitleDiv',
				innerHTML : theTranslator.getText ( 'NoteDialog - Icon content' )
			},
			myNoteDataDiv
		);
		myIconHtmlContent = myHTMLElementsFactory.create (
			'textarea',
			{
				className : 'TravelNotes-NoteDialog-TextArea',
				id : 'TravelNotes-NoteDialog-TextArea-IconHtmlContent'
			},
			myNoteDataDiv
		);
		myIconHtmlContent.addEventListener ( 'focus', myOnFocusControl, false );
		myIconHtmlContent.value = note.iconContent;
	}

	/*
	--- End of myCreateIconContent function ---
	*/

	/*
	--- myCreatePopupContent function ---------------------------------------------------------------------------------

	Creation of popup content

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreatePopupContent ( ) {
		myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : theTranslator.getText ( 'NoteDialog - Text' )
			},
			myNoteDataDiv
		);
		myPopupContent = myHTMLElementsFactory.create (
			'textarea',
			{
				className : 'TravelNotes-NoteDialog-TextArea',
				id : 'TravelNotes-NoteDialog-TextArea-PopupContent'
			},
			myNoteDataDiv
		);
		myPopupContent.addEventListener ( 'focus', myOnFocusControl, false );
		myPopupContent.value = note.popupContent;
	}

	/*
	--- End of myCreatePopupContent function ---
	*/

	/*
	--- myCreateTooltipContent function -------------------------------------------------------------------------------

	Creation of tooltip content

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateTooltipContent ( ) {
		myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : theTranslator.getText ( 'NoteDialog - Tooltip content' )
			},
			myNoteDataDiv
		);
		myTooltipContent = myHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id : 'TravelNotes-NoteDialog-InputText-Tooltip'
			},
			myNoteDataDiv
		);
		myTooltipContent.addEventListener ( 'focus', myOnFocusControl, false );
		myTooltipContent.value = note.tooltipContent;
	}

	/*
	--- End of myCreateTooltipContent function ---
	*/

	/*
	--- myCreateAddressContent function -------------------------------------------------------------------------------

	Creation of address content

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateAddressContent ( ) {
		myResetAdressButton = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML :
					'<span id="TravelNotes-NoteDialog-Reset-Address-Button">&#x1f504;</span>&nbsp;' +
					theTranslator.getText ( 'NoteDialog - Address&nbsp;:' )
			},
			myNoteDataDiv
		);
		myResetAdressButton.addEventListener (
			'click',
			function ( ) { myAdressInput.value = myAddress; },
			false
		);
		myAdressInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id : 'TravelNotes-NoteDialog-InputText-Adress'
			},
			myNoteDataDiv
		);
		myAdressInput.addEventListener ( 'focus', myOnFocusControl, false );
		myAdressInput.value = note.address;

		// geolocalization
		newGeoCoder ( ).getPromiseAddress ( note.latLng )
			.then ( myOnGeocoderResponse )
			.catch ( myOnGeocoderError );

	}

	/*
	--- End of myCreateAddressContent function ---
	*/

	/*
	--- myCreateLinkContent function ----------------------------------------------------------------------------------

	Creation of link content

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateLinkContent ( ) {
		myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : ( theConfig.layersToolbarUI.theDevil.addButton ?
					( '<a href="https://www.google.com/maps/@' +
					note.lat.toFixed ( 6 ) +
					',' +
					note.lng.toFixed ( 6 ) +
					',' +
					17 +
					'z" target="_blank" title="' +
					theConfig.layersToolbarUI.theDevil.title +
					'" >' +
					theConfig.layersToolbarUI.theDevil.text +
					'</a> ' )
					: '' ) +
					theTranslator.getText ( 'NoteDialog - Link' )
			},
			myNoteDataDiv
		);
		myUrlInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id : 'TravelNotes-NoteDialog-InputText-Link'
			},
			myNoteDataDiv
		);
		myUrlInput.addEventListener (
			'focus',
			function ( ) {
				myFocusControl = null;
			},
			false
		);
		myUrlInput.value = note.url;
	}

	/*
	--- End of myCreateLinkContent function ---
	*/

	/*
	--- myCreatePhoneContent function ---------------------------------------------------------------------------------

	Creation of phone content

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreatePhoneContent ( ) {
		myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : theTranslator.getText ( 'NoteDialog - Phone' )
			},
			myNoteDataDiv
		);
		myPhoneInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id : 'TravelNotes-NoteDialog-InputText-Phone'
			},
			myNoteDataDiv
		);
		myPhoneInput.addEventListener ( 'focus', myOnFocusControl, false );
		myPhoneInput.value = note.phone;
	}

	/*
	--- End of myCreatePhoneContent function ---
	*/

	/*
	--- myLoadIconsAndButtons function --------------------------------------------------------------------------------

	loading predefined icons and buttons

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myLoadIconsAndButtons ( ) {

		function loadIconsAndButtons ( travelNotesButtonsAndIcons ) {
			theTravelNotesButtonsAndIcons = travelNotesButtonsAndIcons;
			myAddEditionButtons ( theTravelNotesButtonsAndIcons.editionButtons );
			theTravelNotesButtonsAndIcons.preDefinedIconsList.push (
				{
					name : '',
					icon : '',
					tooltip : '',
					width : 40,
					height : 40
				}
			);
			myAddPreDefinedIconsList ( );
		}

		newHttpRequestBuilder ( ).getJsonPromise (
			window.location.href.substr (0, window.location.href.lastIndexOf ( '/') + 1 ) +
			'TravelNotesNoteDialog' +
			theConfig.language.toUpperCase ( ) +
			'.json'
		)
			.then ( loadIconsAndButtons )
			.catch ( err => console.log ( err? err : 'An error occurs when loading icons and buttons' ) );
	}

	/*
	--- End of myLoadIconsAndButtons function ---
	*/

	/*
	--- Main function -------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	myCreateDialog ( );
	myCreateToolbar ( );
	myCreateIconDimensions ( );
	myCreateIconContent ( );
	myCreatePopupContent ( );
	myCreateTooltipContent ( );
	myCreateAddressContent ( );
	myCreateLinkContent ( );
	myCreatePhoneContent ( );
	myLoadIconsAndButtons ( );
	myAddPreDefinedIconsList ( );

	return myNoteDialog;
}

/*
--- End of NoteDialog.js file -----------------------------------------------------------------------------------------
*/