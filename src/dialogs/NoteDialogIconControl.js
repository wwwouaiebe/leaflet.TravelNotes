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

@file NoteDialogIconControl.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module NoteDialogIconControl
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theTranslator from '../UI/Translator.js';
import theConfig from '../data/Config.js';
import NoteDialogEventListeners from '../dialogs/NoteDialogEventListeners.js';

const OUR_DEFAULT_ICON = '?????';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogIconControl
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogIconControl {

	#iconDiv = null;
	#iconTextArea = null;

	constructor ( ) {
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
				rows : theConfig.noteDialog.areaHeight.icon
			},
			this.#iconDiv
		);

		this.#iconTextArea.addEventListener ( 'focus', NoteDialogEventListeners.onFocusControl, false );
		this.#iconTextArea.addEventListener ( 'input', NoteDialogEventListeners.onInputControl, false );
	}

	get content ( ) { return [ this.#iconDiv ]; }

	get iconContent ( ) { return this.#iconTextArea.value; }

	set iconContent ( Value ) { this.#iconTextArea.value = Value; }

}

export default NoteDialogIconControl;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogIconControl.js file

@------------------------------------------------------------------------------------------------------------------------------
*/