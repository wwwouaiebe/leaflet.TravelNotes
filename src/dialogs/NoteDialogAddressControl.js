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

@file NoteDialogAddressControl.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module NoteDialogAddressControl
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theTranslator from '../UI/Translator.js';
import NoteDialogEventListeners from '../dialogs/NoteDialogEventListeners.js';
import GeoCoder from '../core/GeoCoder.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogAddressControl
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogAddressControl {

	#addressHeaderDiv = null;
	#addressInputDiv = null;
	#addressInput = null;
	#note = null;

	async #onAddressButtonClick ( ) {
		NoteDialogEventListeners.noteDialog.hideOkButton ( );
		let address = await new GeoCoder ( ).getAddress ( this.#note.latLng );
		NoteDialogEventListeners.noteDialog.showOkButton ( );
		if ( address.statusOk ) {
			let addressString = address.street;
			if ( '' !== address.city ) {
				addressString += ' <span class="TravelNotes-NoteHtml-Address-City">' + address.city + '</span>';
			}
			this.#addressInput.value = addressString;

		}
		else {
			NoteDialogEventListeners.noteDialog.showError (
				theTranslator.getText ( 'Notedialog - an error occurs when searching the adress' )
			);
		}
		NoteDialogEventListeners.onInputControl ( );
	}

	constructor ( note ) {
		this.#note = note;
		this.#addressHeaderDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv'
			}
		);
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'NoteDialog - Reset address' ),
				textContent : '🔄'
			},
			this.#addressHeaderDiv
		)
			.addEventListener ( 'click', ( ) => { this.#onAddressButtonClick ( ); }, false );

		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'NoteDialog - Address' )
			},
			this.#addressHeaderDiv
		);

		this.#addressInputDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv'
			}
		);
		this.#addressInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				value : note.address,
				className : 'TravelNotes-NoteDialog-InputText'
			},
			this.#addressInputDiv
		);

		this.#addressInput.addEventListener ( 'focus', NoteDialogEventListeners.onFocusControl, false );
		this.#addressInput.addEventListener ( 'input', NoteDialogEventListeners.onInputControl, false );

	}

	get content ( ) { return [ this.#addressHeaderDiv, this.#addressInputDiv ]; }

	get value ( ) { return this.#addressInput.value; }

}

export default NoteDialogAddressControl;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogAddressControl.js file

@------------------------------------------------------------------------------------------------------------------------------
*/