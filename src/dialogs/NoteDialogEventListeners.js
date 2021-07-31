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
Doc reviewed ...
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file NoteDialogEventListeners.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module NoteDialogEventListeners
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLSanitizer from '../util/HTMLSanitizer.js';
import theTranslator from '../UI/Translator.js';
import theNoteDialogToolbarData from '../dialogs/NoteDialogToolbarData.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import MapIconFromOsmFactory from '../core/MapIconFromOsmFactory.js';
import GeoCoder from '../core/GeoCoder.js';

import { ZERO, INVALID_OBJ_ID } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogEventListeners
@classdesc container for the NoteDialog event listeners, static functions and static variables
@see NoteDialogAddressControl
@see NoteDialogIconControl
@see NoteDialogIconDimsControl
@see NoteDialogLinkControl
@see NoteDialogPhoneControl
@see NoteDialogPopupControl
@see NoteDialogToolbarV3
@see NoteDialogTooltipControl
@see NoteDialogV3
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogEventListeners {

	/**
	The Note used for preview
	*/

	static previewNote = null;

	/**
	The dialog control that have the focus. Used for toolbar edition buttons
	*/

	static focusControl = null;

	/**
	A reference to the NoteDiaog object
	*/

	static noteDialog = null;

	/**
	The routeObjId of the route on witch the note is attached
	*/

	static routeObjId = INVALID_OBJ_ID;

	/**
	Rest static vars function. Must be called when the dialog is closed ( cancel or ok... )
	*/

	static reset ( ) {
		NoteDialogEventListeners.previewNote = null;
		NoteDialogEventListeners.focusControl = null;
		NoteDialogEventListeners.noteDialog = null;
		NoteDialogEventListeners.routeObjId = INVALID_OBJ_ID;
	}

	/**
	focus event listener for controls
	*/

	static onFocusControl ( focusEvent ) {
		NoteDialogEventListeners.focusControl = focusEvent.target;
	}

	/**
	focus event listener for controls when the toolbar editions buttons cannot be used
	*/

	static onClearFocusControl ( ) {
		NoteDialogEventListeners.focusControl = null;
	}

	/**
	blur event listener for the url input. Verify that the url is a valid url.
	*/

	static onBlurUrlInput ( blurEvent ) {
		if ( '' === blurEvent.target.value ) {
			return;
		}

		let verifyResult = theHTMLSanitizer.sanitizeToUrl ( blurEvent.target.value );
		if ( '' === verifyResult.errorsString ) {
			NoteDialogEventListeners.noteDialog.hideError ( );
		}
		else {
			NoteDialogEventListeners.noteDialog.showError ( theTranslator.getText ( 'NoteDialog - invalidUrl' ) );
		}
	}

	/**
	Input event listeners for controls
	*/

	static onInputUpdated ( inputUpdatedEvent ) {
		NoteDialogEventListeners.previewNote [ inputUpdatedEvent.target.dataName ] = inputUpdatedEvent.target.value;
		NoteDialogEventListeners.noteDialog.updatePreview ( );
	}

	/**
	click event listener fot the toolbar edition buttons. Update the current control value*/

	static onClickEditionButton ( clickEvent ) {
		if ( ! NoteDialogEventListeners.focusControl ) {
			return;
		}
		let button = clickEvent.target;
		while ( ! button.htmlBefore ) {
			button = button.parentNode;
		}
		let selectionStart = NoteDialogEventListeners.focusControl.selectionStart;
		let selectionEnd = NoteDialogEventListeners.focusControl.selectionEnd;

		NoteDialogEventListeners.focusControl.value =
			NoteDialogEventListeners.focusControl.value.slice ( ZERO, selectionStart ) +
			button.htmlBefore +
			(
				ZERO === button.htmlAfter.length
					?
					''
					:
					NoteDialogEventListeners.focusControl.value.slice ( selectionStart, selectionEnd )
			) +
			button.htmlAfter +
			NoteDialogEventListeners.focusControl.value.slice ( selectionEnd );

		if ( selectionStart === selectionEnd || ZERO === button.htmlAfter.length ) {
			selectionStart += button.htmlBefore.length;
			selectionEnd = selectionStart;
		}
		else {
			selectionEnd += button.htmlBefore.length + button.htmlAfter.length;
		}
		NoteDialogEventListeners.focusControl.setSelectionRange ( selectionStart, selectionEnd );
		NoteDialogEventListeners.focusControl.focus ( );
		NoteDialogEventListeners.previewNote [ NoteDialogEventListeners.focusControl.dataName ] =
			NoteDialogEventListeners.focusControl.value;

		NoteDialogEventListeners.noteDialog.updatePreview ( );
	}

	/**
	click event listener for the toogle button on the toolbar
	*/

	static onToogleContentsButtonClick ( clickEvent ) {
		clickEvent.target.textContent = '▼' === clickEvent.target.textContent ? '▶' : '▼';
		NoteDialogEventListeners.noteDialog.toogleContents ( );
	}

	/**
	Change event listener for the input associated on the open file button
	@private
	*/

	static #onOpenFileInputChange ( changeEvent ) {
		changeEvent.stopPropagation ( );
		let fileReader = new FileReader ( );
		fileReader.onload = ( ) => {
			let fileContent = {};
			try {
				fileContent = JSON.parse ( fileReader.result );
				theNoteDialogToolbarData.loadJson ( fileContent );
				NoteDialogEventListeners.noteDialog.updateToolbar ( );
			}
			catch ( err ) {
				if ( err instanceof Error ) {
					console.error ( err );
				}
			}
		};
		fileReader.readAsText ( changeEvent.target.files [ ZERO ] );
	}

	/**
	click event listener for the open file button on the toolbar
	*/

	static onOpenFileButtonCkick ( ) {
		let openFileInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'file',
				accept : '.json'
			}
		);
		openFileInput.addEventListener ( 'change', NoteDialogEventListeners.#onOpenFileInputChange, false );
		openFileInput.click ( );
	}

	/**
	Helper method for the onIconSelectChange mehod
	@private
	*/

	#updatePreviewAndControls ( noteData )	{
		NoteDialogEventListeners.noteDialog.setControlsValues ( noteData );
		for ( const property in noteData ) {
			NoteDialogEventListeners.previewNote [ property ] = noteData [ property ];
		}
		NoteDialogEventListeners.noteDialog.updatePreview ( );
	}

	/**
	Svg Map icon creation
	@private
	*/

	static #onMapIcon ( ) {
		if ( INVALID_OBJ_ID === NoteDialogEventListeners.routeObjId ) {
			NoteDialogEventListeners.noteDialog.showError (
				theTranslator.getText ( 'Notedialog - not possible to create a SVG icon for a travel note' )
			);
			return;
		}

		NoteDialogEventListeners.noteDialog.showWait ( );
		new MapIconFromOsmFactory ( ).getIconAndAdressWithPromise (
			NoteDialogEventListeners.previewNote.latLng,
			NoteDialogEventListeners.routeObjId
		)
			.then (
				mapIconData => {
					NoteDialogEventListeners.noteDialog.hideWait ( );
					NoteDialogEventListeners.#updatePreviewAndControls ( mapIconData.noteData );
				}
			)
			.catch (
				( ) => {
					NoteDialogEventListeners.noteDialog.hideWait ( );
					NoteDialogEventListeners.noteDialog.showError (
						theTranslator.getText ( 'Notedialog - an error occurs when creating the SVG icon' )
					);
				}
			);
	}

	/**
	Change event listener for the select icon on the toolbar
	*/

	static onIconSelectChange ( changeEvent ) {
		let preDefinedIcon = theNoteDialogToolbarData.getIconData ( changeEvent.target.selectedIndex );

		if ( 'SvgIcon' === preDefinedIcon.icon ) {
			NoteDialogEventListeners.#onMapIcon ( );
			return;
		}

		NoteDialogEventListeners.#updatePreviewAndControls (
			{
				iconContent : preDefinedIcon.icon,
				iconHeight : preDefinedIcon.height,
				iconWidth : preDefinedIcon.width,
				tooltipContent : preDefinedIcon.tooltip
			}
		);
	}

	/**
	Geocoder success event listener
	@private
	*/

	static #onAddressUpdatedByGeoCoder ( address ) {
		NoteDialogEventListeners.noteDialog.hideWait ( );
		let addressString = address.street;
		if ( '' !== address.city ) {
			addressString += ' <span class="TravelNotes-NoteHtml-Address-City">' + address.city + '</span>';
		}

		NoteDialogEventListeners.previewNote.address = addressString;
		NoteDialogEventListeners.noteDialog.updatePreview ( );
		NoteDialogEventListeners.noteDialog.setControlsValues ( { address : addressString } );
	}

	/**
	click event listener for the reset address button. Also called when a new note is created
	*/

	static setAddressWithGeoCoder ( ) {
		NoteDialogEventListeners.noteDialog.showWait ( );
		new GeoCoder ( ).getAddressWithPromise ( NoteDialogEventListeners.previewNote.latLng )
			.then ( NoteDialogEventListeners.#onAddressUpdatedByGeoCoder )
			.catch (
				err => {
					if ( err ) {
						console.error ( err );
					}
					NoteDialogEventListeners.noteDialog.hideWait ( );
					NoteDialogEventListeners.noteDialog.showError (
						theTranslator.getText ( 'Notedialog - an error occurs when searching the adress' )
					);
				}
			);

	}

}

export default NoteDialogEventListeners;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/