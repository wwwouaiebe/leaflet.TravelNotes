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

@file NoteDialogIconDimsControl.js
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
import { AllControlsInputEL } from '../dialogNotes/NoteDialogEventListeners.js';
import { ICON_DIMENSIONS } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogIconDimsControl
@classdesc This class is the icnWidth and iconHeight control of the NoteDialog
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogIconDimsControl {

	/**
	A reference to the noteDialog
	@private
	*/

	#noteDialog = null;

	/**
	HTMLElements
	@private
	*/

	#iconDimsDiv = null;
	#iconWidthInput = null;
	#iconHeightInput = null;

	/**
	Event listeners
	@private
	*/

	#eventListeners = {
		onInputUpdated : null
	}

	/*
	constructor
	*/

	constructor ( noteDialog ) {
		Object.freeze ( this );
		this.#noteDialog = noteDialog;
		this.#iconDimsDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv'
			}
		);
		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'NoteDialog - Icon width' )
			},
			this.#iconDimsDiv
		);
		this.#iconWidthInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-NoteDialog-NumberInput',
				value : ICON_DIMENSIONS.width,
				dataset : { Name : 'iconWidth' }
			},
			this.#iconDimsDiv
		);

		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'NoteDialog - Icon height' )
			},
			this.#iconDimsDiv
		);
		this.#iconHeightInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-NoteDialog-NumberInput',
				value : ICON_DIMENSIONS.height,
				dataset : { Name : 'iconHeight' }
			},
			this.#iconDimsDiv
		);

		this.#eventListeners.onInputUpdated = new AllControlsInputEL ( this.#noteDialog );
		this.#iconWidthInput.addEventListener ( 'input', this.#eventListeners.onInputUpdated );
		this.#iconHeightInput.addEventListener ( 'input', this.#eventListeners.onInputUpdated );
	}

	destructor ( ) {
		this.#iconWidthInput.removeEventListener ( 'input', this.#eventListeners.onInputUpdated );
		this.#iconHeightInput.removeEventListener ( 'input', this.#eventListeners.onInputUpdated );
		this.#eventListeners.onInputUpdated.destructor ( );
		this.#noteDialog = null;
	}

	/**
	return an array with the HTML elements of the control
	@readonly
	*/

	get HTMLElements ( ) { return [ this.#iconDimsDiv ]; }

	/**
	The icon width value in the control
	*/

	get iconWidth ( ) { return Number.parseInt ( this.#iconWidthInput.value ); }

	set iconWidth ( Value ) { this.#iconWidthInput.value = Value; }

	/**
	The icon width height in the control
	*/

	get iconHeight ( ) { return Number.parseInt ( this.#iconHeightInput.value ); }

	set iconHeight ( Value ) { this.#iconHeightInput.value = Value; }

}

export default NoteDialogIconDimsControl;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogIconDimsControl.js file

@------------------------------------------------------------------------------------------------------------------------------
*/