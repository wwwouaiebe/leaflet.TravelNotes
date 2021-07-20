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
		- Issue ♯65 : Time to go to ES6 modules?
		- Issue ♯66 : Work with promises for dialogs
		- Issue ♯68 : Review all existing promises.
		- Issue ♯76 : Add a devil button in the noteDialog.
	- v1.11.0:
		- Issue ♯110 : Add a command to create a SVG icon from osm for each maneuver
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯138 : Protect the app - control html entries done by user.
		- Issue ♯144 : Add an error message when a bad json file is loaded from the noteDialog
	- v2.2.0:
		- Issue ♯64 : Improve geocoding
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
import theConfig from '../data/Config.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theHTMLSanitizer } from '../util/HTMLSanitizer.js';
import { newSvgIconFromOsmFactory } from '../core/SvgIconFromOsmFactory.js';
import GeoCoder from '../core/GeoCoder.js';
import { theNoteDialogToolbar } from '../dialogs/NoteDialogToolbar.js';
import Note from '../data/Note.js';
import { theHTMLViewsFactory } from '../UI/HTMLViewsFactory.js';

import { LAT_LNG, ZERO, INVALID_OBJ_ID, ICON_DIMENSIONS } from '../util/Constants.js';

const OUR_DEFAULT_ICON = '?????';

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

/* eslint-disable-next-line max-statements */
function ourNewNoteDialog ( note, routeObjId, startGeoCoder ) {

	let myFocusControl = null;
	let myGeoCoder = new GeoCoder ( );
	let myLatLng = note.latLng;
	let myPreviewNote = null;

	let myIconDimensionsDiv = null;
	let myIconContentDiv = null;
	let myPopupContentDiv = null;
	let myTooltipContentDiv = null;
	let myAddressHeaderDiv = null;
	let myAddressInputDiv = null;
	let myLinkHeaderDiv = null;
	let myLinkInputDiv = null;
	let myPhoneHeaderDiv = null;
	let myPhoneInputDiv = null;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class NoteDialog
	@classdesc a BaseDialog object completed for notes.
	Create an instance of the dialog, then execute the show ( ) method. The edited note is given as parameter of the
	succes handler of the Promise returned by the show ( ) method.
	@example
	newNoteDialog ( new Note ( ), INVALID_OBJ_ID, true )
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
	let myLinkInput = null;
	let myPhoneInput = null;
	let myPreviewDiv = null;

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
		if ( '' !== myLinkInput.value ) {
			if ( '' === theHTMLSanitizer.sanitizeToUrl ( myLinkInput.value ).url ) {
				myNoteDialog.showError ( theTranslator.getText ( 'NoteDialog - invalidUrl' ) );
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
		note.url = myLinkInput.value;
		note.phone = myPhoneInput.value;
		note.latLng = myLatLng;
		note.validateData ( );

		return note;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnInputControl
	@desc Event listener for textarea and input text
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnInputControl ( ) {
		if ( '' === myIconHtmlContent.value ) {
			myPreviewNote.iconContent = OUR_DEFAULT_ICON;
		}
		else {
			myPreviewNote.iconContent = myIconHtmlContent.value;
		}
		myPreviewNote.popupContent = myPopupContent.value;
		myPreviewNote.tooltipContent = myTooltipContent.value;
		myPreviewNote.address = myAddressInput.value;
		myPreviewNote.url = myLinkInput.value;
		myPreviewNote.phone = myPhoneInput.value;
		myPreviewNote.iconWidth = myWidthInput.value;
		myPreviewNote.iconHeight = myHeightInput.value;
		myPreviewDiv.textContent = '';
		myPreviewDiv.appendChild (
			theHTMLViewsFactory.getNoteTextAndIconHTML (
				'TravelNotes-NoteDialog-',
				{ note : myPreviewNote, route : null }
			)
		);
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
		let address = geoCoderData.street;
		if ( '' !== geoCoderData.city ) {
			address += ' <span class="TravelNotes-NoteHtml-Address-City">' + geoCoderData.city + '</span>';
		}
		myAddressInput.value = address;
		myNoteDialog.okButton.classList.remove ( 'TravelNotes-Hidden' );
		myOnInputControl ( );
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
		if ( err instanceof Error ) {
			console.error ( err );
		}
		myNoteDialog.okButton.classList.remove ( 'TravelNotes-Hidden' );
		myOnInputControl ( );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnAddressButtonClick
	@desc Event listener for the address button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	async function myOnAddressButtonClick ( ) {
		myNoteDialog.okButton.classList.add ( 'TravelNotes-Hidden' );
		let address = await myGeoCoder.getAddress ( note.latLng );
		if ( address.statusOk ) {
			myOnGeocoderSucces ( address );
		}
		else {
			myOnGeocoderError ( );
		}
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
		if ( '' !== osmNoteData.city ) {
			address += ' <span class="TravelNotes-NoteHtml-Address-City">' + osmNoteData.city + '</span>';
		}
		if ( osmNoteData.place && osmNoteData.place !== osmNoteData.city ) {
			address += ' (' + osmNoteData.place + ')';
		}

		myAddressInput.value = address;
		myLatLng = osmNoteData.latLng;

		myNoteDialog.hideWait ( );
		myOnInputControl ( );
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
		if ( err instanceof Error ) {
			console.error ( err );
		}
		myOnInputControl ( );
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
			myOnInputControl ( );
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
		let selectionStart = myFocusControl.selectionStart;
		let selectionEnd = myFocusControl.selectionEnd;

		myFocusControl.value =
			myFocusControl.value.slice ( ZERO, selectionStart ) +
			button.htmlBefore +
			( ZERO === button.htmlAfter.length ? '' : myFocusControl.value.slice ( selectionStart, selectionEnd ) ) +
			button.htmlAfter +
			myFocusControl.value.slice ( selectionEnd );

		if ( selectionStart === selectionEnd || ZERO === button.htmlAfter.length ) {
			selectionStart += button.htmlBefore.length;
			selectionEnd = selectionStart;
		}
		else {
			selectionEnd += button.htmlBefore.length + button.htmlAfter.length;
		}
		myFocusControl.setSelectionRange ( selectionStart, selectionEnd );
		myFocusControl.focus ( );

		myOnInputControl ( );
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

	@function myOnBlurUrlInput
	@desc Event listener for url input
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnBlurUrlInput ( blurEvent ) {
		if ( '' === blurEvent.target.value ) {
			return;
		}
		let verifyResult = theHTMLSanitizer.sanitizeToUrl ( blurEvent.target.value );
		if ( '' === verifyResult.errorsString ) {
			myNoteDialog.hideError ( );
		}
		else {
			myNoteDialog.showError ( theTranslator.getText ( 'NoteDialog - invalidUrl' ) );
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myShowHideContents
	@desc This method show/hode contents
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myToggleContents ( ) {
		if ( theConfig.noteDialog.mask.iconsDimension ) {
			myIconDimensionsDiv.classList.toggle ( 'TravelNotes-Hidden' );
		}
		if ( theConfig.noteDialog.mask.iconTextArea ) {
			myIconContentDiv.classList.toggle ( 'TravelNotes-Hidden' );
		}
		if ( theConfig.noteDialog.mask.popupContent ) {
			myPopupContentDiv.classList.toggle ( 'TravelNotes-Hidden' );
		}
		if ( theConfig.noteDialog.mask.tooltip ) {
			myTooltipContentDiv.classList.toggle ( 'TravelNotes-Hidden' );
		}
		if ( theConfig.noteDialog.mask.address ) {
			myAddressHeaderDiv.classList.toggle ( 'TravelNotes-Hidden' );
			myAddressInputDiv.classList.toggle ( 'TravelNotes-Hidden' );
		}
		if ( theConfig.noteDialog.mask.link ) {
			myLinkHeaderDiv.classList.toggle ( 'TravelNotes-Hidden' );
			myLinkInputDiv.classList.toggle ( 'TravelNotes-Hidden' );
		}
		if ( theConfig.noteDialog.mask.phone ) {
			myPhoneHeaderDiv.classList.toggle ( 'TravelNotes-Hidden' );
			myPhoneInputDiv.classList.toggle ( 'TravelNotes-Hidden' );
		}
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
				{
					onButtonClickEventListener : myOnClickEditionButton,
					onSelectEventListener : myOnPredefinedIconListSelectChange,
					hideError : myNoteDialog.hideError,
					showError : myNoteDialog.showError,
					toggleContents : myToggleContents
				}
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
		myIconDimensionsDiv = theHTMLElementsFactory.create (
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
			myIconDimensionsDiv
		);
		myWidthInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-NoteDialog-NumberInput',
				value : ZERO === note.iconWidth ? ICON_DIMENSIONS.width : note.iconWidth
			},
			myIconDimensionsDiv
		);
		myWidthInput.addEventListener ( 'input', myOnInputControl, false );

		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'NoteDialog - Icon height' )
			},
			myIconDimensionsDiv
		);
		myHeightInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-NoteDialog-NumberInput',
				value : ZERO === note.iconHeight ? ICON_DIMENSIONS.height : note.iconHeight
			},
			myIconDimensionsDiv
		);
		myHeightInput.addEventListener ( 'input', myOnInputControl, false );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateIconContent
	@desc This method creates the icon content div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateIconContent ( ) {
		myIconContentDiv = theHTMLElementsFactory.create (
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
				value : note.iconContent,
				placeholder : OUR_DEFAULT_ICON,
				rows : theConfig.noteDialog.areaHeight.icon
			},
			myIconContentDiv
		);
		myIconHtmlContent.addEventListener ( 'focus', myOnFocusControl, false );
		myIconHtmlContent.addEventListener ( 'input', myOnInputControl, false );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreatePopupContent
	@desc This method creates the popup content div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreatePopupContent ( ) {
		myPopupContentDiv = theHTMLElementsFactory.create (
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
				value : note.popupContent,
				rows : theConfig.noteDialog.areaHeight.popupContent
			},
			myPopupContentDiv
		);
		myPopupContent.addEventListener ( 'focus', myOnFocusControl, false );
		myPopupContent.addEventListener ( 'input', myOnInputControl, false );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateTooltipContent
	@desc This method creates the tooltip content div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateTooltipContent ( ) {
		myTooltipContentDiv = theHTMLElementsFactory.create (
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
			myTooltipContentDiv
		);
		myTooltipContent.addEventListener ( 'focus', myOnFocusControl, false );
		myTooltipContent.addEventListener ( 'input', myOnInputControl, false );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateAddressContent
	@desc This method creates the address content div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateAddressContent ( ) {
		myAddressHeaderDiv = theHTMLElementsFactory.create (
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
			myAddressHeaderDiv
		)
			.addEventListener ( 'click', myOnAddressButtonClick, false );
		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'NoteDialog - Address' )
			},
			myAddressHeaderDiv
		);

		myAddressInputDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv'
			},
			myNoteDataDiv
		);
		myAddressInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				value : note.address,
				className : 'TravelNotes-NoteDialog-InputText'
			},
			myAddressInputDiv
		);
		myAddressInput.addEventListener ( 'focus', myOnFocusControl, false );
		myAddressInput.addEventListener ( 'input', myOnInputControl, false );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateLinkContent
	@desc This method creates the link content div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateLinkContent ( ) {

		myLinkHeaderDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv'
			},
			myNoteDataDiv
		);

		if ( theConfig.noteDialog.theDevil.addButton ) {
			theHTMLElementsFactory.create (
				'text',
				{
					value : '👿'
				},
				theHTMLElementsFactory.create (
					'a',
					{
						href : 'https://www.google.com/maps/@' +
							note.lat.toFixed ( LAT_LNG.fixed ) + ',' +
							note.lng.toFixed ( LAT_LNG.fixed ) + ',' +
							theConfig.noteDialog.theDevil.zoomFactor + 'z',
						target : '_blank',
						title : 'Reminder! The devil will know everything about you'
					},
					theHTMLElementsFactory.create (
						'div',
						{
							className : 'TravelNotes-BaseDialog-Button',
							title : 'Reminder! The devil will know everything about you'
						},
						myLinkHeaderDiv
					)
				)
			);
		}

		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'NoteDialog - Link' )
			},
			myLinkHeaderDiv
		);

		myLinkInputDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv'
			},
			myNoteDataDiv
		);

		myLinkInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				value : note.url
			},
			myLinkInputDiv
		);
		myLinkInput.addEventListener (
			'focus',
			( ) => { myFocusControl = null; },
			false
		);
		myLinkInput.addEventListener ( 'blur', myOnBlurUrlInput, false );
		myLinkInput.addEventListener ( 'input', myOnInputControl, false );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreatePhoneContent
	@desc This method creates the phone content div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreatePhoneContent ( ) {
		myPhoneHeaderDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv'
			},
			myNoteDataDiv
		);

		theHTMLElementsFactory.create (
			'text',
			{
				value : '\u00a0' + theTranslator.getText ( 'NoteDialog - Phone' )
			},
			myPhoneHeaderDiv
		);
		myPhoneInputDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv'
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
			myPhoneInputDiv
		);
		myPhoneInput.addEventListener ( 'focus', myOnFocusControl, false );
		myPhoneInput.addEventListener ( 'input', myOnInputControl, false );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreatePreviewContent
	@desc This method creates the preview content div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreatePreviewContent ( ) {
		myPreviewDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-PreviewDiv'
			},
			myNoteDialog.footer
		);

		myPreviewDiv.appendChild (
			theHTMLViewsFactory.getNoteTextAndIconHTML (
				'TravelNotes-NoteDialog-',
				{ note : myPreviewNote, route : null }
			)
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateDialog
	@desc This method creates the dialog
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDialog ( ) {

		myPreviewNote = new Note ( );
		myPreviewNote.jsonObject = note.jsonObject;
		if ( '' === myPreviewNote.iconContent ) {
			myPreviewNote.iconContent = OUR_DEFAULT_ICON;
		}

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
		myCreateToolbar ( );
		myCreateIconDimensions ( );
		myCreateIconContent ( );
		myCreateTooltipContent ( );
		myCreatePopupContent ( );
		myCreateAddressContent ( );
		myCreateLinkContent ( );
		myCreatePhoneContent ( );
		myCreatePreviewContent ( );
		if ( '' === note.address && startGeoCoder && theConfig.note.reverseGeocoding ) {
			myOnAddressButtonClick ( );
		}
		myToggleContents ( );
	}

	myCreateDialog ( );

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