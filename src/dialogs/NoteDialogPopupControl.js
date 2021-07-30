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

@file NoteDialogPopupControl.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module NoteDialogPopupControl
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theTranslator from '../UI/Translator.js';
import theConfig from '../data/Config.js';
import NoteDialogEventListeners from '../dialogs/NoteDialogEventListeners.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogPopupControl
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogPopupControl {

	#popupDiv = null;
	#popupTextArea = null;

	constructor ( ) {
		this.#popupDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv',
				textContent : theTranslator.getText ( 'NoteDialog - Text' )
			}
		);
		this.#popupTextArea = theHTMLElementsFactory.create (
			'textarea',
			{
				className : 'TravelNotes-NoteDialog-TextArea',
				rows : theConfig.noteDialog.areaHeight.popupContent
			},
			this.#popupDiv
		);

		this.#popupTextArea.addEventListener ( 'focus', NoteDialogEventListeners.onFocusControl, false );
		this.#popupTextArea.addEventListener ( 'input', NoteDialogEventListeners.onInputControl, false );
	}

	get content ( ) { return [ this.#popupDiv ]; }

	get popupContent ( ) { return this.#popupTextArea.value; }

	set popupContent ( Value ) { this.#popupTextArea.value = Value; }

}

export default NoteDialogPopupControl;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogPopupControl.js file

@------------------------------------------------------------------------------------------------------------------------------
*/