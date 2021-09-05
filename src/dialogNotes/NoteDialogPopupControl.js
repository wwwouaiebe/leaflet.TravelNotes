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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
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

@module dialogNotes
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theTranslator from '../UILib/Translator.js';
import theConfig from '../data/Config.js';
import { AllControlsFocusEL, AllControlsInputEL } from '../dialogNotes/NoteDialogEventListeners.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogPopupControl
@classdesc This class is the popupContent control of the NoteDialog
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogPopupControl {

	/**
	A reference to the noteDialog
	@private
	*/

	#noteDialog = null;

	/**
	HTMLElements
	@private
	*/

	#popupDiv = null;
	#popupTextArea = null;

	/**
	Event listeners
	@private
	*/

	#eventListeners = {
		onFocusControl : null,
		onInputUpdated : null
	}

	/*
	constructor
	*/

	constructor ( noteDialog ) {
		Object.freeze ( this );
		this.#noteDialog = noteDialog;
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
				rows : theConfig.noteDialog.areaHeight.popupContent,
				dataset : { Name : 'popupContent' }
			},
			this.#popupDiv
		);

		this.#eventListeners.onFocusControl = new AllControlsFocusEL ( this.#noteDialog, false );
		this.#eventListeners.onInputUpdated = new AllControlsInputEL ( this.#noteDialog );
		this.#popupTextArea.addEventListener ( 'focus', this.#eventListeners.onFocusControl );
		this.#popupTextArea.addEventListener ( 'input', this.#eventListeners.onInputUpdated );
	}

	destructor ( ) {
		this.#popupTextArea.removeEventListener ( 'focus', this.#eventListeners.onFocusControl );
		this.#popupTextArea.removeEventListener ( 'input', this.#eventListeners.onInputUpdated );
		this.#eventListeners.onFocusControl.destructor ( );
		this.#eventListeners.onInputUpdated.destructor ( );
		this.#noteDialog = null;
	}

	/**
	return an array with the HTML elements of the control
	@readonly
	*/

	get HTMLElements ( ) { return [ this.#popupDiv ]; }

	/**
	The popupcontent value in the control
	*/

	get popupContent ( ) { return this.#popupTextArea.value; }

	set popupContent ( Value ) { this.#popupTextArea.value = Value; }

}

export default NoteDialogPopupControl;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogPopupControl.js file

@------------------------------------------------------------------------------------------------------------------------------
*/