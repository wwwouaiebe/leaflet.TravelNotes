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

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogEventListeners
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogEventListeners {

	static focusControl = null;

	static noteDialog = null;

	static onFocusControl ( focusEvent ) {
		NoteDialogEventListeners.focusControl = focusEvent.target;
	}

	static onClearFocusControl ( ) {
		NoteDialogEventListeners.focusControl = null;
	}

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

	static onInputControl ( ) {

		/*
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
			theNoteHTMLViewsFactory.getNoteTextAndIconHTML (
				'TravelNotes-NoteDialog-',
				{ note : myPreviewNote, route : null }
			)
		);
		*/

	}

}

export default NoteDialogEventListeners;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/