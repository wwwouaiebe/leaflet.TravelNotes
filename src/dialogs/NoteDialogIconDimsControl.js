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

@file NoteDialogIconDimsControl.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module NoteDialogIconDimsControl
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import NoteDialogEventListeners from '../dialogs/NoteDialogEventListeners.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theTranslator from '../UI/Translator.js';
import { ZERO, ICON_DIMENSIONS } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogIconDimsControl
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogIconDimsControl {

	#iconDimsDiv = null;
	#iconWidthInput = null;
	#iconHeightInput = null;

	constructor ( ) {
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
				value : ZERO === ICON_DIMENSIONS.width
			},
			this.#iconDimsDiv
		);

		this.#iconWidthInput.addEventListener ( 'input', NoteDialogEventListeners.onInputControl, false );

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
				value : ICON_DIMENSIONS.height
			},
			this.#iconDimsDiv
		);

		this.#iconHeightInput.addEventListener ( 'input', NoteDialogEventListeners.onInputControl, false );
	}

	get content ( ) { return [ this.#iconDimsDiv ]; }

	get iconWidth ( ) { return this.#iconWidthInput.value; }

	get iconHeight ( ) { return this.#iconHeightInput.value; }

	set iconWidth ( Value ) { this.#iconWidthInput.value = Value; }

	set iconHeight ( Value ) { this.#iconHeightInput.value = Value; }

}

export default NoteDialogIconDimsControl;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogIconDimsControl.js file

@------------------------------------------------------------------------------------------------------------------------------
*/