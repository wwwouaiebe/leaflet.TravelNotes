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
	- v1.6.0:
		- created
	- v1.13.0:
		- Issue ♯128 : Unify osmSearch and notes icons and data
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯138 : Protect the app - control html entries done by user.
		- Issue ♯144 : Add an error message when a bad json file is loaded from the noteDialog
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file NoteDialogToolbar.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} NoteDialogCfgFileContent
@desc An object with definitions for the creation of select options and buttons for the NoteDialogToolbar
@property {Array.<NoteDialogToolbarButton>} editionButtons An array with the buttons definitions
@property {Array.<NoteDialogToolbarSelectOption>} preDefinedIconsList An array with the select options definitions
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} NoteDialogToolbarSelectOption
@desc Select options definitions fot the NoteDialogToolbar
@property {string} name The name to be displayed in the select
@property {string} icon The html definition of the icon associated with this option
@property {string} tooltip The tooltip of the icon associated with this option
@property {number} width The width of the icon associated with this option
@property {number} height The height of the icon associated with this option
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} NoteDialogToolbarButton
@desc Buttons definitions fot the NoteDialogToolbar
@property {string} title The text to be displayed on the button. Can be HTML
@property {string} htmlBefore The text to be inserted before the cursor when clicking on the button
@property {?string} htmlAfter The text to be inserted after the cursor when clicking on the button. Optional
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module dialogNotes
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theNoteDialogToolbarData from '../dialogNotes/NoteDialogToolbarData.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theTranslator from '../UILib/Translator.js';
import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';
import {
	EditionButtonsClickEL,
	IconSelectorChangeEL,
	OpenFileButtonClickEL,
	ToogleContentsButtonClickEL
} from '../dialogNotes/NoteDialogToolbarEventListeners.js';

import { NOT_FOUND, ZERO } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogToolbar
@classdesc This class is the toolbar of the NoteDialog
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogToolbar {

	/**
	A reference to the noteDialog
	@private
	*/

	#noteDialog = null;

	/**
	HTMLElements
	@private
	*/

	#rootHTMLElement = null;
	#iconSelect = null;
	#toogleContentsButton = null;
	#openFileButton = null;
	#editionButtons = [];

	/**
	Event listeners
	@private
	*/

	#eventListeners = {
		onEditionButtonClick : null,
		onIconSelectChange : null,
		onToogleContentsButtonClick : null,
		onOpenFileButtonClick : null
	};

	/**
	Add the icon selector to the toolbar
	@private
	*/

	#addIconsSelector ( ) {
		this.#iconSelect = theHTMLElementsFactory.create (
			'select',
			{
				className : 'TravelNotes-NoteDialog-Select',
				id : 'TravelNotes-NoteDialog-IconSelect'
			},
			this.#rootHTMLElement
		);
		this.#iconSelect.addEventListener ( 'change', this.#eventListeners.onIconSelectChange, false );

		theNoteDialogToolbarData.icons.forEach (
			selectOption => {
				this.#iconSelect.add ( theHTMLElementsFactory.create ( 'option', { text : selectOption [ ZERO ] } ) );
			}
		);
		this.#iconSelect.selectedIndex = NOT_FOUND;
	}

	/**
	Add the toolbar buttons to the toolbar ( toogle and open file )
	@private
	*/

	#addToolbarButtons ( ) {

		this.#toogleContentsButton = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'NoteDialog - show hidden contents' ),
				textContent : '▼' // 25b6 = '▶'  25bc = ▼
			},
			this.#rootHTMLElement
		);
		this.#toogleContentsButton.addEventListener ( 'click', this.#eventListeners.onToogleContentsButtonClick, false );

		this.#openFileButton = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'NoteDialog - Open a configuration file' ),
				textContent : '📂'
			},
			this.#rootHTMLElement
		);
		this.#openFileButton.addEventListener ( 'click', this.#eventListeners.onOpenFileButtonClick, false );
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
						dataset : {
							HtmlBefore : editionButton.htmlBefore || '',
							HtmlAfter : editionButton.htmlAfter || ''
						},
						className : 'TravelNotes-NoteDialog-EditorButton'
					},
					this.#rootHTMLElement
				);
				theHTMLSanitizer.sanitizeToHtmlElement ( editionButton.title || '?', newButton );
				newButton.addEventListener ( 'click', this.#eventListeners.onEditionButtonClick, false );
				this.#editionButtons.push ( newButton );
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

	/**
	Remove event listeners on all htmlElements
	*/

	#removeEventListeners ( ) {
		this.#iconSelect.removeEventListener ( 'change', this.#eventListeners.onIconSelectChange, false );
		this.#toogleContentsButton.removeEventListener ( 'click', this.#eventListeners.onToogleContentsButtonClick, false );
		this.#openFileButton.removeEventListener ( 'click', this.#eventListeners.onOpenFileButtonClick, false );
		this.#editionButtons.forEach (
			button => { button.removeEventListener ( 'click', this.#eventListeners.onEditionButtonClick, false ); }
		);
	}

	/*
	constructor
	*/

	constructor ( noteDialog ) {
		Object.freeze ( this );
		this.#noteDialog = noteDialog;
		this.#rootHTMLElement = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-NoteDialog-ToolbarDiv'
			}
		);
		this.#eventListeners.onIconSelectChange = new IconSelectorChangeEL ( this.#noteDialog );
		this.#eventListeners.onToogleContentsButtonClick = new ToogleContentsButtonClickEL ( this.#noteDialog );
		this.#eventListeners.onOpenFileButtonClick = new OpenFileButtonClickEL ( this );
		this.#eventListeners.onEditionButtonClick = new EditionButtonsClickEL ( this.#noteDialog );

		this.#addToolbarElements ( );
	}

	destructor ( ) {
		this.#removeEventListeners ( );
		this.#eventListeners.onEditionButtonClick.destructor ( );
		this.#eventListeners.onIconSelectChange.destructor ( );
		this.#eventListeners.onToogleContentsButtonClick.destructor ( );
		this.#eventListeners.onOpenFileButtonClick.destructor ( );
		this.#noteDialog = null;
	}

	/**
	Refresh the toolbar - needed after a file upload.
	*/

	update ( ) {
		this.#removeEventListeners ( );
		this.#rootHTMLElement.textContent = '';
		this.#editionButtons = [];
		this.#addToolbarElements ( );
	}

	/**
	get the rootHTMLElement of the toolbar
	@readonly
	*/

	get rootHTMLElement ( ) { return this.#rootHTMLElement;	}

}

export default NoteDialogToolbar;

/*
--- End of NoteDialogToolbar.js file ------------------------------------------------------------------------------------------
*/