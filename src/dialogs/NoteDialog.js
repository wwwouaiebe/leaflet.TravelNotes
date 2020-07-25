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
	- v1.11.0:
		- Issue #110 : Add a command to create a SVG icon from osm for each maneuver
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20191124
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newSvgIconFromOsmFactory } from '../core/SvgIconFromOsmFactory.js';
import { newGeoCoder } from '../core/GeoCoder.js';
import { theNoteDialogToolbar } from '../dialogs/NoteDialogToolbar.js';

import { LAT_LNG, ZERO, INVALID_OBJ_ID, ICON_DIMENSIONS } from '../util/Constants.js';

/*
--- newNoteDialog function --------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newNoteDialog ( note, routeObjId, newNote ) {

	let myFocusControl = null;
	let myHTMLElementsFactory = newHTMLElementsFactory ( );
	let myGeoCoder = newGeoCoder ( );
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
	let myAddressInput = null;
	let myUrlInput = null;
	let myPhoneInput = null;

	/*
	--- myOnOkButtonClick function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkButtonClick ( ) {

		// Verifying that the icon is not empty. A note with an empty icon cannot be viewed on the map
		// and then, cannot be edited or removed!
		if ( ZERO === myIconHtmlContent.value.length ) {
			myNoteDialog.showError ( theTranslator.getText ( 'Notedialog - The icon content cannot be empty' ) );
			return;
		}

		// saving values in the note.
		note.iconWidth = myWidthInput.value;
		note.iconHeight = myHeightInput.value;
		note.iconContent = myIconHtmlContent.value;
		note.popupContent = myPopupContent.value;
		note.tooltipContent = myTooltipContent.value;
		note.address = myAddressInput.value;
		note.url = myUrlInput.value;
		note.phone = myPhoneInput.value;
		note.latLng = myLatLng;

		return note;
	}

	/*
	--- myOnGeocoderResponse function ---------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnGeocoderResponse ( geoCoderData ) {

		let response = myGeoCoder.parseResponse ( geoCoderData );
		myAddress = response.street;
		if ( '' !== response.city ) {
			myAddress += ' ' + theConfig.note.cityPrefix + response.city + theConfig.note.cityPostfix;
		}
		myCity = response.city;

		if ( ( theConfig.note.reverseGeocoding ) && ( '' === note.address ) && newNote ) {
			myAddressInput.value = myAddress;
		}
	}

	/*
	--- myOnGeocoderError function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnGeocoderError ( err ) {
		myNoteDialog.showError ( theTranslator.getText ( 'Notedialog - an error occurs when searching the adress' ) );
		console.log ( err ? err : 'an error occurs when searching the adress.' );
	}

	/*
	--- myOnSvgIcon function ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSvgIcon ( svgData ) {
		myIconHtmlContent.value = svgData.svg.outerHTML;
		myTooltipContent.value = svgData.tooltip;

		let address = svgData.streets;
		let city = '' === svgData.city ? myCity : svgData.city;
		if ( '' !== city ) {
			address += ' ' + theConfig.note.cityPrefix + city + theConfig.note.cityPostfix;
		}
		if ( svgData.place && svgData.place !== city ) {
			address += ' (' + svgData.place + ')';
		}

		myAddressInput.value = address;
		myLatLng = svgData.latLng;

		myNoteDialog.hideWait ( );
	}

	/*
	--- myOnErrorSvgIcon function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnErrorSvgIcon ( err ) {
		myNoteDialog.hideWait ( );
		myNoteDialog.showError ( theTranslator.getText ( 'Notedialog - an error occurs when creating the SVG icon' ) );
		console.log ( err ? err : 'an error occurs when creating the SVG icon.' );
	}

	/*
	--- myOnPredefinedIconListSelectChange function -------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnPredefinedIconListSelectChange ( changeEvent ) {

		let preDefinedIcon = theNoteDialogToolbar.getIconData ( changeEvent.target.selectedIndex );

		if ( 'SvgIcon' === preDefinedIcon.icon ) {
			if ( INVALID_OBJ_ID === routeObjId ) {
				myNoteDialog.showError (
					theTranslator.getText ( 'Notedialog - not possible to create a SVG icon for a travel note' )
				);
			}
			else {
				myNoteDialog.showWait ( );
				newSvgIconFromOsmFactory ( ).getPromiseIconAndAdress ( note.latLng, routeObjId )
					.then ( myOnSvgIcon )
					.catch ( myOnErrorSvgIcon );
			}
		}
		else {
			myNoteDialog.hideError ( );
			myWidthInput.value = preDefinedIcon.width;
			myHeightInput.value = preDefinedIcon.height;
			myIconHtmlContent.value = preDefinedIcon.icon;
			myTooltipContent.value = preDefinedIcon.tooltip;
		}
	}

	/*
	--- myOnClickEditionButton function -------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnClickEditionButton ( clickEvent ) {
		if ( ! myFocusControl ) {
			return;
		}
		let button = clickEvent.target;
		while ( ! button.htmlBefore ) {
			button = button.parentNode;
		}
		let bInsertBeforeAndAfter = button.htmlAfter && ZERO < button.htmlAfter.length;
		let selectionStart = myFocusControl.selectionStart;
		let selectionEnd = myFocusControl.selectionEnd;
		let oldText = myFocusControl.value;
		myFocusControl.value =
			oldText.substring ( ZERO, selectionStart ) +
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
	--- myOnFocusControl function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnFocusControl ( focusEvent ) {
		myFocusControl = focusEvent.target;
	}

	/*
	--- myCreateDialog function ---------------------------------------------------------------------------------------

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
	--- myCreateToolbar function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateToolbar ( ) {
		myNoteDataDiv.appendChild (
			theNoteDialogToolbar.createToolbar (
				myOnPredefinedIconListSelectChange,
				myOnClickEditionButton
			)
		);
	}

	/*
	--- myCreateIconDimensions function -------------------------------------------------------------------------------

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
				data : theTranslator.getText ( 'NoteDialog - Icon width' )
			},
			iconDimensionsDiv
		);
		myWidthInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-NoteDialog-NumberInput',
				id : 'TravelNotes-NoteDialog-WidthNumberInput'

			},
			iconDimensionsDiv
		);
		myWidthInput.value = ZERO === note.iconWidth ? ICON_DIMENSIONS.width : note.iconWidth;

		// ... and height
		myHTMLElementsFactory.create (
			'text',
			{
				data : theTranslator.getText ( 'NoteDialog - Icon height' )
			},
			iconDimensionsDiv
		);
		myHeightInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-NoteDialog-NumberInput',
				id : 'TravelNotes-NoteDialog-HeightNumberInput'
			},
			iconDimensionsDiv
		);
		myHeightInput.value = ZERO === note.iconHeight ? ICON_DIMENSIONS.height : note.iconHeight;
	}

	/*
	--- myCreateIconContent function ----------------------------------------------------------------------------------

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
	--- myCreatePopupContent function ---------------------------------------------------------------------------------

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
	--- myCreateTooltipContent function -------------------------------------------------------------------------------

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
	--- myCreateAddressContent function -------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateAddressContent ( ) {

		let addressHeader = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-TitleDiv'
			},
			myNoteDataDiv
		);
		myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-Button',

				title : theTranslator.getText ( 'NoteDialog - Reset address' ),
				innerHTML : '&#x1f504;'
			},
			addressHeader
		)
			.addEventListener (
				'click',
				( ) => { myAddressInput.value = myAddress; },
				false
			);
		myHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'NoteDialog - Address' )
			},
			addressHeader
		);

		myAddressInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				value : note.address,
				className : 'TravelNotes-NoteDialog-InputText',
				id : 'TravelNotes-NoteDialog-InputText-Adress'
			},
			myHTMLElementsFactory.create ( 'div', null, myNoteDataDiv )
		);
		myAddressInput.addEventListener ( 'focus', myOnFocusControl, false );

		// geolocalization
		myGeoCoder.getPromiseAddress ( note.latLng )
			.then ( myOnGeocoderResponse )
			.catch ( myOnGeocoderError );

		/*
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
			function ( ) { myAddressInput.value = myAddress; },
			false
		);
		myAddressInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id : 'TravelNotes-NoteDialog-InputText-Adress'
			},
			myNoteDataDiv
		);
		myAddressInput.addEventListener ( 'focus', myOnFocusControl, false );
		myAddressInput.value = note.address;

		// geolocalization
		myGeoCoder.getPromiseAddress ( note.latLng )
			.then ( myOnGeocoderResponse )
			.catch ( myOnGeocoderError );
		*/

	}

	/*
	--- myCreateLinkContent function ----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateLinkContent ( ) {
		myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : ( theConfig.layersToolbarUI.theDevil.addButton ?
					( '<a href="https://www.google.com/maps/@' +
					note.lat.toFixed ( LAT_LNG.fixed ) +
					',' +
					note.lng.toFixed ( LAT_LNG.fixed ) +
					',' +
					theConfig.layersToolbarUI.theDevil.noteZoom +
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
	--- myCreatePhoneContent function ---------------------------------------------------------------------------------

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

	return myNoteDialog;
}

export { newNoteDialog };

/*
--- End of NoteDialog.js file -----------------------------------------------------------------------------------------
*/