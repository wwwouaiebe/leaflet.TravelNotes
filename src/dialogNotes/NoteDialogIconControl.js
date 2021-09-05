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

@file NoteDialogIconControl.js
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

const OUR_DEFAULT_ICON = '?????';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogIconControl
@classdesc This class is the iconContent control of the NoteDialog
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogIconControl {

	/**
	A reference to the noteDialog
	@private
	*/

	#noteDialog = null;

	/**
	HTMLElements
	@private
	*/

	#iconDiv = null;
	#iconTextArea = null;

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
		this.#iconDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv',
				textContent : theTranslator.getText ( 'NoteDialog - Icon content' )
			}
		);
		this.#iconTextArea = theHTMLElementsFactory.create (
			'textarea',
			{
				className : 'TravelNotes-NoteDialog-TextArea',
				placeholder : OUR_DEFAULT_ICON,
				rows : theConfig.noteDialog.areaHeight.icon,
				dataset : { Name : 'iconContent' }
			},
			this.#iconDiv
		);

		this.#eventListeners.onFocusControl = new AllControlsFocusEL ( this.#noteDialog, false );
		this.#eventListeners.onInputUpdated = new AllControlsInputEL ( this.#noteDialog );
		this.#iconTextArea.addEventListener ( 'focus', this.#eventListeners.onFocusControl );
		this.#iconTextArea.addEventListener ( 'input', this.#eventListeners.onInputUpdated );
	}

	destructor ( ) {
		this.#iconTextArea.removeEventListener ( 'focus', this.#eventListeners.onFocusControl );
		this.#iconTextArea.removeEventListener ( 'input', this.#eventListeners.onInputUpdated );
		this.#eventListeners.onFocusControl.destructor ( );
		this.#eventListeners.onInputUpdated.destructor ( );
		this.#noteDialog = null;
	}

	/**
	return an array with the HTML elements of the control
	@readonly
	*/

	get HTMLElements ( ) { return [ this.#iconDiv ]; }

	/**
	The icon value in the control
	*/

	get iconContent ( ) { return this.#iconTextArea.value; }

	set iconContent ( Value ) { this.#iconTextArea.value = Value; }

}

export default NoteDialogIconControl;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogIconControl.js file

@------------------------------------------------------------------------------------------------------------------------------
*/