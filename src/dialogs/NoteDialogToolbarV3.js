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

@file NoteDialogToolbarV3.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module NoteDialogToolbarV3
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theNoteDialogToolbarData from '../dialogs/NoteDialogToolbarData.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theTranslator from '../UI/Translator.js';
import theHTMLSanitizer from '../util/HTMLSanitizer.js';

import { NOT_FOUND, ZERO } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogToolbarV3
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogToolbarV3 {

	#toolbarDiv = null;
	#iconSelect = null;

	#addIconsSelector ( ) {
		this.#iconSelect = theHTMLElementsFactory.create (
			'select',
			{
				className : 'TravelNotes-NoteDialog-Select',
				id : 'TravelNotes-NoteDialog-IconSelect'
			},
			this.#toolbarDiv
		);

		/*
		ourIconsSelect.addEventListener ( 'change', ourDialogFunctions.onSelectEventListener, false );
		*/

		theNoteDialogToolbarData.icons.forEach (
			selectOption => {
				this.#iconSelect.add ( theHTMLElementsFactory.create ( 'option', { text : selectOption [ ZERO ] } ) );
			}
		);
		this.#iconSelect.selectedIndex = NOT_FOUND;
	}

	#addToolbarButtons ( ) {

		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'NoteDialog - show hidden contents' ),
				textContent : '▼' // 25b6 = '▶'  25bc = ▼
			},
			this.#toolbarDiv
		);

		/*
		toggleContentsButton.addEventListener ( 'click', ourToggleContentsButtonClick, false );
		*/

		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'NoteDialog - Open a configuration file' ),
				textContent : '📂'
			},
			this.#toolbarDiv
		);

		/*
		openFileButton.addEventListener ( 'click', ourOnOpenFileButtonClick, false );
		*/

	}

	#addEditionButtons ( ) {
		theNoteDialogToolbarData.buttons.forEach (
			editionButton => {
				let newButton = theHTMLElementsFactory.create (
					'div',
					{
						htmlBefore : editionButton.htmlBefore || '',
						htmlAfter : editionButton.htmlAfter || '',
						className : 'TravelNotes-NoteDialog-EditorButton'
					},
					this.#toolbarDiv
				);
				theHTMLSanitizer.sanitizeToHtmlElement ( editionButton.title || '?', newButton );

				/*
				newButton.addEventListener ( 'click', ourDialogFunctions.onButtonClickEventListener, false );
				*/

			}
		);
	}

	constructor ( ) {

		this.#toolbarDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-ToolbarDiv',
				id : 'TravelNotes-NoteDialog-ToolbarDiv'
			}
		);

		this.#addIconsSelector ( );
		this.#addToolbarButtons ( );
		this.#addEditionButtons ( );
	}

	get content ( ) {
		return [ this.#toolbarDiv ];
	}

}

export default NoteDialogToolbarV3;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogToolbarV3.js file

@------------------------------------------------------------------------------------------------------------------------------
*/