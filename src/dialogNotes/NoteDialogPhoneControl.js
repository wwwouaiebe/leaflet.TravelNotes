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

@file NoteDialogPhoneControl.js
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
import { AllControlsFocusEL, AllControlsInputEL } from '../dialogNotes/NoteDialogEventListeners.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogPhoneControl
@classdesc This class is the phone control of the NoteDialog
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogPhoneControl {

	/**
	A reference to the noteDialog
	@private
	*/

	#noteDialog = null;

	/**
	HTMLElements
	@private
	*/

	#phoneHeaderDiv = null;
	#phoneInputDiv = null;
	#phoneInput = null;

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

		this.#phoneHeaderDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv'
			}
		);

		theHTMLElementsFactory.create (
			'text',
			{
				value : '\u00a0' + theTranslator.getText ( 'NoteDialog - Phone' )
			},
			this.#phoneHeaderDiv
		);

		this.#phoneInputDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv'
			}
		);

		this.#phoneInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				dataset : { Name : 'phone' }
			},
			this.#phoneInputDiv
		);

		this.#eventListeners.onFocusControl = new AllControlsFocusEL ( this.#noteDialog, false );
		this.#eventListeners.onInputUpdated = new AllControlsInputEL ( this.#noteDialog );
		this.#phoneInput.addEventListener ( 'focus', this.#eventListeners.onFocusControl );
		this.#phoneInput.addEventListener ( 'input', this.#eventListeners.onInputUpdated );
	}

	destructor ( ) {
		this.#phoneInput.removeEventListener ( 'focus', this.#eventListeners.onFocusControl );
		this.#phoneInput.removeEventListener ( 'input', this.#eventListeners.onInputUpdated );
		this.#eventListeners.onFocusControl.destructor ( );
		this.#eventListeners.onInputUpdated.destructor ( );
		this.#noteDialog = null;
	}

	/**
	return an array with the HTML elements of the control
	@readonly
	*/

	get HTMLElements ( ) { return [ this.#phoneHeaderDiv, this.#phoneInputDiv ]; }

	/**
	The phone number in the control
	*/

	get phone ( ) { return this.#phoneInput.value; }

	set phone ( Value ) { this.#phoneInput.value = Value; }

}

export default NoteDialogPhoneControl;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogPhoneControl.js file

@------------------------------------------------------------------------------------------------------------------------------
*/