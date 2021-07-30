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

import { ZERO } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogEventListeners
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogEventListeners {

	static previewNote = null;

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

	static onInputUpdated ( inputUpdatedEvent ) {
		for ( const property in inputUpdatedEvent.data ) {
			NoteDialogEventListeners.previewNote [ property ] = inputUpdatedEvent.data [ property ];
		}
		NoteDialogEventListeners.noteDialog.updatePreview ( );
	}

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

}

export default NoteDialogEventListeners;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/