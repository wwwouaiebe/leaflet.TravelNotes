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

@file NoteDialogPhoneContent.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module NoteDialogPhoneContent
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theTranslator from '../UI/Translator.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogPhoneContent
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogPhoneContent {

	#phoneHeaderDiv = null;
	#phoneInputDiv = null;
	#phoneInput = null;

	constructor ( phone ) {

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
				value : phone
			},
			this.#phoneInputDiv
		);

		/*
		this.#phoneInput.addEventListener ( 'focus', myOnFocusControl, false );
		this.#phoneInput.addEventListener ( 'input', myOnInputControl, false );
		*/

	}

	get content ( ) { return [ this.#phoneHeaderDiv, this.#phoneInputDiv ]; }

	get value ( ) { return this.#phoneInput.value; }

}

export default NoteDialogPhoneContent;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogPhoneContent.js file

@------------------------------------------------------------------------------------------------------------------------------
*/