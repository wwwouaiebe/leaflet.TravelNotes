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

@file NoteDialogAddressControl.js
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
import {
	AddressButtonClickEL,
	AllControlsFocusEL,
	AllControlsInputEL
} from '../dialogNotes/NoteDialogEventListeners.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogAddressControl
@classdesc This class is the address control of the NoteDialog
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogAddressControl {

	/**
	A reference to the noteDialog
	@private
	*/

	#noteDialog = null;

	/**
	HTMLElements
	@private
	*/

	#addressHeaderDiv = null;
	#addressInputDiv = null;
	#addressInput = null;
	#addressButton = null;

	/**
	The latLng used for geocoding
	@private
	*/

	#latLng = null;

	/**
	Event listeners
	@private
	*/

	#eventListeners = {
		onFocusControl : null,
		onInputUpdated : null,
		onAddressButtonClick : null
	}

	/*
	constructor
	*/

	constructor ( noteDialog, latLng ) {
		Object.freeze ( this );
		this.#noteDialog = noteDialog;
		this.#latLng = latLng;
		this.#addressHeaderDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv'
			}
		);
		this.#addressButton = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'NoteDialog - Reset address' ),
				textContent : '🔄'
			},
			this.#addressHeaderDiv
		);

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
				className : 'TravelNotes-NoteDialog-InputText',
				dataset : { Name : 'address' }
			},
			this.#addressInputDiv
		);

		this.#eventListeners.onFocusControl = new AllControlsFocusEL ( this.#noteDialog, false );
		this.#eventListeners.onInputUpdated = new AllControlsInputEL ( this.#noteDialog );
		this.#eventListeners.onAddressButtonClick = new AddressButtonClickEL ( this.#noteDialog, this.#latLng );
		this.#addressInput.addEventListener ( 'focus', this.#eventListeners.onFocusControl );
		this.#addressInput.addEventListener ( 'input', this.#eventListeners.onInputUpdated );
		this.#addressButton.addEventListener ( 'click', this.#eventListeners.onAddressButtonClick );
	}

	destructor ( ) {
		this.#addressInput.removeEventListener ( 'focus', this.#eventListeners.onFocusControl );
		this.#addressInput.removeEventListener ( 'input', this.#eventListeners.onInputUpdated );
		this.#addressButton.removeEventListener ( 'click', this.#eventListeners.onAddressButtonClick );
		this.#eventListeners.onFocusControl.destructor ( );
		this.#eventListeners.onInputUpdated.destructor ( );
		this.#eventListeners.onAddressButtonClick.destructor ( );
	}

	/**
	return an array with the HTML elements of the control
	@readonly
	*/

	get HTMLElements ( ) {
		return [ this.#addressHeaderDiv, this.#addressInputDiv ];
	}

	/**
	The address value in the control
	*/

	get address ( ) { return this.#addressInput.value; }

	set address ( Value ) { this.#addressInput.value = Value; }

}

export default NoteDialogAddressControl;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogAddressControl.js file

@------------------------------------------------------------------------------------------------------------------------------
*/