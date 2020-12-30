/*
Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/

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
	- v1.14.0:
		- Issue #135 : Remove innerHTML from code
		- Issue #138 : Protect the app - control html entries done by user.
Doc reviewed 20200815
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file NoteDialog.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module NoteDialog
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theHTMLParserSerializer } from '../util/HTMLParserSerializer.js';
import { newSvgIconFromOsmFactory } from '../core/SvgIconFromOsmFactory.js';
import { newGeoCoder } from '../core/GeoCoder.js';
import { theNoteDialogToolbar } from '../dialogs/NoteDialogToolbar.js';

import { LAT_LNG, ZERO, INVALID_OBJ_ID, ICON_DIMENSIONS } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewNoteDialog
@desc constructor for NoteDialog objects
@param {Note} note The note to edit
@param {!number} routeObjId The objId of the route to witch the note is attached. = INVALID_OBJ_ID if none
@param {boolean} startGeoCoder If true the GeoCoder will be called and the address replaced with the GeoCoder result
at the dialog opening
@return {NoteDialog} an instance of NoteDialog object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewNoteDialog ( note, routeObjId, startGeoCoder ) {

	let myFocusControl = null;
	let myGeoCoder = newGeoCoder ( );
	let myLatLng = note.latLng;
	let myAddress = '';
	let myCity = '';

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class NoteDialog
	@classdesc a BaseDialog object completed for notes.
	Create an instance of the dialog, then execute the show ( ) method. The edited note is given as parameter of the
	succes handler of the Promise returned by the show ( ) method.
	@example
	newNoteDialog ( newNote ( ), INVALID_OBJ_ID, true )
		.show ( )
		.then ( note => doSomethingWithTheNote )
		.catch ( error => doSomethingWithTheError );
	@see {@link newNoteDialog} for constructor
	@augments BaseDialog
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

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

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnOkButtonClick
	@desc Event listener for the ok button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkButtonClick ( ) {

		// Verifying that the icon is not empty. A note with an empty icon cannot be viewed on the map
		// and then, cannot be edited or removed!

		if ( '' === myIconHtmlContent.value ) {
			myNoteDialog.showError ( theTranslator.getText ( 'Notedialog - The icon content cannot be empty' ) );
			return;
		}
		if ( '' !== myUrlInput.value ) {
			if ( ! theHTMLParserSerializer.validateUrl ( myUrlInput.value ) ) {
				myNoteDialog.showError ( theTranslator.getText ( 'Notedialog - invalidUrl' ) );
				return;
			}
		}

		// saving values in the note.
		note.iconWidth = Number.parseInt ( myWidthInput.value );
		note.iconHeight = Number.parseInt ( myHeightInput.value );
		note.iconContent = myIconHtmlContent.value;
		note.popupContent = myPopupContent.value;
		note.tooltipContent = myTooltipContent.value;
		note.address = myAddressInput.value;
		note.url = myUrlInput.value;
		note.phone = myPhoneInput.value;
		note.latLng = myLatLng;
		note.validateData ( );

		return note;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnGeocoderSucces
	@desc Succes handler for the GeoCoder
	@param {Object} geoCoderData The GeoCoder response received from Nominatim
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnGeocoderSucces ( geoCoderData ) {
		let response = myGeoCoder.parseResponse ( geoCoderData );
		myAddress = response.street;
		if ( '' !== response.city ) {
			myAddress += ' ' + theConfig.note.cityPrefix + response.city + theConfig.note.cityPostfix;
		}
		myCity = response.city;

		if ( ( theConfig.note.reverseGeocoding ) && ( '' === note.address ) && startGeoCoder ) {
			myAddressInput.value = myAddress;
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnGeocoderError
	@desc Error handler for the GeoCoder
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnGeocoderError ( err ) {
		myNoteDialog.showError ( theTranslator.getText ( 'Notedialog - an error occurs when searching the adress' ) );
		console.log ( err ? err : 'an error occurs when searching the adress.' );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnSvgIconSuccess
	@desc Success handler for the SvgIcomFromOsmFactory
	@param {OsmNoteData} osmNoteData the data received from osm for the note creation
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSvgIconSuccess ( osmNoteData ) {
		myIconHtmlContent.value = osmNoteData.svg.outerHTML;
		myTooltipContent.value = osmNoteData.tooltip;

		let address = osmNoteData.streets;
		let city = '' === osmNoteData.city ? myCity : osmNoteData.city;
		if ( '' !== city ) {
			address += ' ' + theConfig.note.cityPrefix + city + theConfig.note.cityPostfix;
		}
		if ( osmNoteData.place && osmNoteData.place !== city ) {
			address += ' (' + osmNoteData.place + ')';
		}

		myAddressInput.value = address;
		myLatLng = osmNoteData.latLng;

		myNoteDialog.hideWait ( );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnSvgIconError
	@desc Error handler for the SvgIcomFromOsmFactory
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnSvgIconError ( err ) {
		myNoteDialog.hideWait ( );
		myNoteDialog.showError ( theTranslator.getText ( 'Notedialog - an error occurs when creating the SVG icon' ) );
		console.log ( err ? err : 'an error occurs when creating the SVG icon.' );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnPredefinedIconListSelectChange
	@desc Event listener for the predefined icon list
	@private

	@--------------------------------------------------------------------------------------------------------------------------
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
					.then ( myOnSvgIconSuccess )
					.catch ( myOnSvgIconError );
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

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnClickEditionButton
	@desc Event listener for the edition buttons
	@private

	@--------------------------------------------------------------------------------------------------------------------------
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

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnAddressButtonClick
	@desc Event listener for the address button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnAddressButtonClick ( ) {
		myAddressInput.value = myAddress;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnFocusControl
	@desc Event listener for textarea and input text
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnFocusControl ( focusEvent ) {
		myFocusControl = focusEvent.target;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnBlurControl
	@desc Event listener for textarea and input text
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnBlurControl ( blurEvent ) {
		let verifyResult = theHTMLParserSerializer.verify ( blurEvent.target.value );
		blurEvent.target.value = verifyResult.htmlString;
		if ( '' !== verifyResult.errorsString ) {
			myFocusControl = null;
			myNoteDialog.showError ( verifyResult.errorsString );
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateDialog
	@desc This method creates the dialog
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDialog ( ) {

		// the dialog base is created
		myNoteDialog = newBaseDialog ( );
		myNoteDialog.title = theTranslator.getText ( 'NoteDialog - Note' );
		myNoteDialog.okButtonListener = myOnOkButtonClick;

		myNoteDataDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-NoteDialog-MainDataDiv'
			},
			myNoteDialog.content
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateToolbar
	@desc This method creates the toolbar
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateToolbar ( ) {
		myNoteDataDiv.appendChild (
			theNoteDialogToolbar.createToolbar (
				myOnPredefinedIconListSelectChange,
				myOnClickEditionButton
			)
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateIconDimensions
	@desc This method creates the icon dimensions div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateIconDimensions ( ) {
		let iconDimensionsDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv'
			},
			myNoteDataDiv
		);
		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'NoteDialog - Icon width' )
			},
			iconDimensionsDiv
		);
		myWidthInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-NoteDialog-NumberInput',
				value : ZERO === note.iconWidth ? ICON_DIMENSIONS.width : note.iconWidth
			},
			iconDimensionsDiv
		);
		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'NoteDialog - Icon height' )
			},
			iconDimensionsDiv
		);
		myHeightInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-NoteDialog-NumberInput',
				value : ZERO === note.iconHeight ? ICON_DIMENSIONS.height : note.iconHeight
			},
			iconDimensionsDiv
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateIconContent
	@desc This method creates the icon content div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateIconContent ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv',
				textContent : theTranslator.getText ( 'NoteDialog - Icon content' )
			},
			myNoteDataDiv
		);
		myIconHtmlContent = theHTMLElementsFactory.create (
			'textarea',
			{
				className : 'TravelNotes-NoteDialog-TextArea',
				value : note.iconContent
			},
			myNoteDataDiv
		);
		myIconHtmlContent.addEventListener ( 'focus', myOnFocusControl, false );
		myIconHtmlContent.addEventListener ( 'blur', myOnBlurControl, false );

	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateIconContent
	@desc This method creates the popup content div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreatePopupContent ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv',
				textContent : theTranslator.getText ( 'NoteDialog - Text' )
			},
			myNoteDataDiv
		);
		myPopupContent = theHTMLElementsFactory.create (
			'textarea',
			{
				className : 'TravelNotes-NoteDialog-TextArea',
				value : note.popupContent
			},
			myNoteDataDiv
		);
		myPopupContent.addEventListener ( 'focus', myOnFocusControl, false );
		myPopupContent.addEventListener ( 'blur', myOnBlurControl, false );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateTooltipContent
	@desc This method creates the tooltip content div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateTooltipContent ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv',
				textContent : theTranslator.getText ( 'NoteDialog - Tooltip content' )
			},
			myNoteDataDiv
		);
		myTooltipContent = theHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				value : note.tooltipContent
			},
			myNoteDataDiv
		);
		myTooltipContent.addEventListener ( 'focus', myOnFocusControl, false );
		myTooltipContent.addEventListener ( 'blur', myOnBlurControl, false );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateAddressContent
	@desc This method creates the address content div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateAddressContent ( ) {
		let addressHeader = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv'
			},
			myNoteDataDiv
		);
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'NoteDialog - Reset address' ),
				textContent : '🔄'
			},
			addressHeader
		)
			.addEventListener ( 'click', myOnAddressButtonClick, false );
		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'NoteDialog - Address' )
			},
			addressHeader
		);

		myAddressInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				value : note.address,
				className : 'TravelNotes-NoteDialog-InputText'
			},
			theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-NoteDialog-DataDiv'
				},
				myNoteDataDiv
			)
		);
		myAddressInput.addEventListener ( 'focus', myOnFocusControl, false );
		myAddressInput.addEventListener ( 'blur', myOnBlurControl, false );

		myGeoCoder.getPromiseAddress ( note.latLng )
			.then ( myOnGeocoderSucces )
			.catch ( myOnGeocoderError );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateLinkContent
	@desc This method creates the link content div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateLinkContent ( ) {

		let linkHeader = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv'
			},
			myNoteDataDiv
		);

		if ( theConfig.note.theDevil.addButton ) {
			theHTMLElementsFactory.create (
				'text',
				{
					value : theConfig.note.theDevil.text
				},
				theHTMLElementsFactory.create (
					'a',
					{
						href : 'https://www.google.com/maps/@' +
							note.lat.toFixed ( LAT_LNG.fixed ) + ',' +
							note.lng.toFixed ( LAT_LNG.fixed ) + ',' +
							theConfig.note.theDevil.noteZoom + 'z',
						target : '_blank',
						title : theConfig.note.theDevil.title
					},
					theHTMLElementsFactory.create (
						'div',
						{
							className : 'TravelNotes-BaseDialog-Button',
							title : 'Home'
						},
						linkHeader
					)
				)
			);
		}

		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'NoteDialog - Link' )
			},
			linkHeader
		);
		myUrlInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				value : note.url
			},
			myNoteDataDiv
		);
		myUrlInput.addEventListener (
			'focus',
			( ) => { myFocusControl = null; },
			false
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreatePhoneContent
	@desc This method creates the phone content div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreatePhoneContent ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv',
				textContent : theTranslator.getText ( 'NoteDialog - Phone' )
			},
			myNoteDataDiv
		);
		myPhoneInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				value : note.phone
			},
			myNoteDataDiv
		);
		myPhoneInput.addEventListener ( 'focus', myOnFocusControl, false );
		myPhoneInput.addEventListener ( 'blur', myOnBlurControl, false );
	}

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

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newNoteDialog
	@desc constructor for NoteDialog objects
	@param {Note} note The note to edit
	@param {!number} routeObjId The objId of the route to witch the note is attached. = INVALID_OBJ_ID if none
	@param {boolean} startGeoCoder If true the GeoCoder will be called and the address replaced with the GeoCoder result
	at the dialog opening
	@return {NoteDialog} an instance of NoteDialog object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewNoteDialog as newNoteDialog
};

/*
--- End of NoteDialog.js file -------------------------------------------------------------------------------------------------
*/