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
		- Issue #128 : Unify osmSearch and notes icons and data
	- v1.14.0:
		- Issue #135 : Remove innerHTML from code
Doc reviewed 20200815
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

@module NoteDialogToolbar
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theHTMLParserSerializer } from '../util/HTMLParserSerializer.js';
import { ZERO, ONE, NOT_FOUND } from '../util/Constants.js';

let ourButtons = [];
let ourSelectOptions = [];
let ourToolbarDiv = null;
let ourIconsSelect = null;
let ourOpenFileInput = null;
let ourOnSelectEventListener = null;
let ourOnButtonClickEventListener = null;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourAddSelectOptions
@desc This function add options to the select input
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourAddSelectOptions ( ) {
	ourSelectOptions.forEach (
		selectOption => ourIconsSelect.add (
			theHTMLElementsFactory.create (
				'option',
				{
					text : selectOption.name
				}
			)
		)
	);
	ourIconsSelect.selectedIndex = NOT_FOUND;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourAddButtons
@desc This function add buttons on the toolbar
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourAddButtons ( ) {
	ourButtons.forEach (
		editionButton => {
			let newButton = theHTMLElementsFactory.create (
				'button',
				{
					type : 'button',
					htmlBefore : editionButton.htmlBefore || '',
					htmlAfter : editionButton.htmlAfter || '',
					className : 'TravelNotes-NoteDialog-EditorButton'
				},
				ourToolbarDiv
			);
			theHTMLParserSerializer.parse ( editionButton.title || '?', newButton );

			newButton.addEventListener ( 'click', ourOnButtonClickEventListener, false );

		}
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnOpenFileInputChange
@desc Event listener for the open file input
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnOpenFileInputChange ( changeEvent ) {
	let fileReader = new FileReader ( );
	fileReader.onload = function ( ) {
		try {
			let newButtonsAndIcons = JSON.parse ( fileReader.result );
			ourButtons = ourButtons.concat ( newButtonsAndIcons.editionButtons );
			ourSelectOptions =
				ourSelectOptions.concat ( newButtonsAndIcons.preDefinedIconsList );
			ourSelectOptions.sort (
				( first, second ) => first.name.localeCompare ( second.name )
			);

			document.querySelectorAll ( '.TravelNotes-NoteDialog-EditorButton' ).forEach (
				oldButton => {
					oldButton.removeEventListener ( 'click', ourOnButtonClickEventListener, false );
					ourToolbarDiv.removeChild ( oldButton );
				}
			);
			ourAddButtons ( );
			for (
				let elementCounter = ourIconsSelect.length - ONE;
				elementCounter >= ZERO;
				elementCounter --
			) {
				ourIconsSelect.remove ( elementCounter );
			}
			ourAddSelectOptions ( );
		}
		catch ( err ) {
			console.log ( err ? err : 'An error occurs when opening the file' );
		}
	};
	fileReader.readAsText ( changeEvent.target.files [ ZERO ] );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnOpenFileButtonClick
@desc Event listener for the open file button
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnOpenFileButtonClick ( ) {
	ourOpenFileInput.click ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateToolbarButtons
@desc This function creates the open file button and add the others buttons on the toolbar
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateToolbarButtons ( ) {
	ourOpenFileInput = theHTMLElementsFactory.create (
		'input',
		{
			className : 'TravelNotes-BaseDialog-OpenFileInput',
			type : 'file'
		},
		ourToolbarDiv
	);
	ourOpenFileInput.addEventListener ( 'change', ourOnOpenFileInputChange,	false );
	let openFileButton = theHTMLElementsFactory.create (
		'div',
		{
			className : 'TravelNotes-BaseDialog-Button',
			title : theTranslator.getText ( 'NoteDialog - Open a configuration file' ),
			textContent : '📂'
		},
		ourToolbarDiv
	);
	openFileButton.addEventListener ( 'click', ourOnOpenFileButtonClick, false );

	ourAddButtons ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCreateToolbarButtons
@desc This function creates the select input on the toolbar and add the options to the select input
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCreateToolbarSelect ( ) {
	ourIconsSelect = theHTMLElementsFactory.create (
		'select',
		{
			className : 'TravelNotes-NoteDialog-Select',
			id : 'TravelNotes-NoteDialog-IconSelect'
		},
		ourToolbarDiv
	);
	ourIconsSelect.addEventListener ( 'change', ourOnSelectEventListener, false );
	ourAddSelectOptions ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc A helper class to creates the toolbar in the NoteDialog and manages the select and buttons on this toolbar
@see {@link theNoteDialogToolbar} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogToolbar {

	/**
	Options added to the select input
	@param {Array.<NoteDialogToolbarSelectOption>} selectOptions An array of NoteDialogToolbarSelectOptions
	*/

	set selectOptions ( selectOptions ) {
		ourSelectOptions = ourSelectOptions.concat ( selectOptions );
		ourSelectOptions.sort ( ( first, second ) => first.name.localeCompare ( second.name ) );
	}

	/**
	Buttons added to the toolbar
	@param {Array.<NoteDialogToolbarButton>} buttons An array of NoteDialogToolbarButtons
	*/

	set buttons ( buttons ) {
		ourButtons = ourButtons.concat ( buttons );
	}

	/**
	Gives the data needed to creates the icon corresponding to a select option
	@param {number} Index the position in the preDefinedIconsList
	@return {NoteDialogToolbarSelectOption} the icon data
	*/

	getIconData ( index ) {
		return ourSelectOptions [ index ];
	}

	getIconDataFromName ( selectOptionName ) {
		let selectOption = ourSelectOptions.find ( selOption => selOption.name === selectOptionName );
		return selectOption ? selectOption.icon : null;
	}

	/**
	Creates the toolbar
	@param {function} onSelectEventListener the event listener to be activated when the user select an option
	@param {function} onButtonClickEventListener the event listener to be activated when the user click on a button
	*/

	createToolbar ( onSelectEventListener, onButtonClickEventListener ) {
		ourOnSelectEventListener = onSelectEventListener;
		ourOnButtonClickEventListener = onButtonClickEventListener;

		ourToolbarDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-ToolbarDiv',
				id : 'TravelNotes-NoteDialog-ToolbarDiv'
			}
		);

		ourCreateToolbarSelect ( );
		ourCreateToolbarButtons ( );
		return ourToolbarDiv;
	}
}

const ourNoteDialogToolbar = Object.seal ( new NoteDialogToolbar );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of NoteDialogToolbar class
	@type {NoteDialogToolbar}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNoteDialogToolbar as theNoteDialogToolbar
};

/*
--- End of NoteDialogToolbar.js file ------------------------------------------------------------------------------------------
*/