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
import NoteDialogEventListeners from '../dialogs/NoteDialogEventListeners.js';

import { NOT_FOUND, ZERO } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogToolbarV3
@classdesc This class is the toolbar of the NoteDialog
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogToolbarV3 {

	#toolbarDiv = null;

	/**
	Add the icon selector to the toolbar
	@private
	*/

	#addIconsSelector ( ) {
		let iconSelect = theHTMLElementsFactory.create (
			'select',
			{
				className : 'TravelNotes-NoteDialog-Select',
				id : 'TravelNotes-NoteDialog-IconSelect'
			},
			this.#toolbarDiv
		);

		iconSelect.addEventListener ( 'change', NoteDialogEventListeners.onIconSelectChange, false );

		theNoteDialogToolbarData.icons.forEach (
			selectOption => {
				iconSelect.add ( theHTMLElementsFactory.create ( 'option', { text : selectOption [ ZERO ] } ) );
			}
		);
		iconSelect.selectedIndex = NOT_FOUND;
	}

	/**
	Add the toolbar buttons to the toolbar ( toogle and open file )
	@private
	*/

	#addToolbarButtons ( ) {

		let toogleContentsButton = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'NoteDialog - show hidden contents' ),
				textContent : '▼' // 25b6 = '▶'  25bc = ▼
			},
			this.#toolbarDiv
		);
		toogleContentsButton.addEventListener ( 'click', NoteDialogEventListeners.onToogleContentsButtonClick, false );

		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'NoteDialog - Open a configuration file' ),
				textContent : '📂'
			},
			this.#toolbarDiv
		).addEventListener ( 'click', NoteDialogEventListeners.onOpenFileButtonCkick, false );
	}

	/**
	Add the edition buttons to the toolbar
	@private
	*/

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
				newButton.addEventListener ( 'click', NoteDialogEventListeners.onClickEditionButton, false );
			}
		);
	}

	/**
	Add elements to the toolbar
	@private
	*/

	#addToolbarElements ( ) {
		this.#addIconsSelector ( );
		this.#addToolbarButtons ( );
		this.#addEditionButtons ( );
	}

	constructor ( ) {

		this.#toolbarDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-ToolbarDiv',
				id : 'TravelNotes-NoteDialog-ToolbarDiv'
			}
		);

		this.#addToolbarElements ( );

	}

	/**
	Refresh the toolbar - needed after a file upload.
	*/

	update ( ) {
		this.#toolbarDiv.innerText = '';
		this.#addToolbarElements ( );
	}

	/**
	get the control HTML
	*/

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