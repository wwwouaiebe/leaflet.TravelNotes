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

@file NoteDialogPhoneControl.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module NoteDialogPhoneControl
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theTranslator from '../UI/Translator.js';
import NoteDialogEventListeners from '../dialogs/NoteDialogEventListeners.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogPhoneControl
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogPhoneControl {

	#phoneHeaderDiv = null;
	#phoneInputDiv = null;
	#phoneInput = null;

	#onInputControl ( ) {
		let dispatchedEvent = new Event ( 'inputupdated' );
		dispatchedEvent.data = { phone : this.#phoneInput.value };
		this.#phoneHeaderDiv.parentNode.parentNode.dispatchEvent ( dispatchedEvent );
	}

	constructor ( ) {

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
				dataName : 'phone'
			},
			this.#phoneInputDiv
		);

		this.#phoneInput.addEventListener ( 'focus', NoteDialogEventListeners.onFocusControl, false );

		this.#phoneInput.addEventListener (
			'input',
			( ) => { this.#onInputControl ( ); },
			false
		);
	}

	get content ( ) { return [ this.#phoneHeaderDiv, this.#phoneInputDiv ]; }

	get phone ( ) { return this.#phoneInput.value; }

	set phone ( Value ) { this.#phoneInput.value = Value; }

}

export default NoteDialogPhoneControl;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogPhoneControl.js file

@------------------------------------------------------------------------------------------------------------------------------
*/