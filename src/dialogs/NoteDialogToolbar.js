/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- NoteDialogToolbar.js file -----------------------------------------------------------------------------------------
This file contains:
	- the newNoteDialogToolbar function
	- the theNoteDialogToolbar object
Changes:
	- v1.6.0:
		- created

Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

import { THE_CONST } from '../util/Constants.js';

/*
--- newNoteDialogToolbar function -------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newNoteDialogToolbar ( ) {

	let myButtons = [];
	let mySelectOptions = [];
	let myToolbarDiv = null;
	let myIconsSelect = null;
	let myOnSelectEventListener = null;
	let myOnButtonClickEventListener = null;

	let myHTMLElementsFactory = newHTMLElementsFactory ( );

	/*
	--- myAddButtons function -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddSelectOptions ( ) {
		mySelectOptions.forEach (
			selectOption => myIconsSelect.add (
				myHTMLElementsFactory.create (
					'option',
					{
						text : selectOption.name
					}
				)
			)
		);
		myIconsSelect.selectedIndex = THE_CONST.notFound;
	}

	/*
	--- myAddButtons function -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddButtons ( ) {
		myButtons.forEach (
			editionButton => {
				let newButton = myHTMLElementsFactory.create (
					'button',
					{
						type : 'button',
						innerHTML : editionButton.title || '?',
						htmlBefore : editionButton.htmlBefore || '',
						htmlAfter : editionButton.htmlAfter || '',
						className : 'TravelNotes-NoteDialog-EditorButton'
					},
					myToolbarDiv
				);
				newButton.addEventListener ( 'click', myOnButtonClickEventListener, false );

			}
		);
	}

	/*
	--- myOnOpenUserDataFileInputChange function ----------------------------------------------------------------------

	event handler for

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOpenFileInputChange ( changeEvent ) {
		let fileReader = new FileReader ( );
		fileReader.onload = function ( ) {
			try {
				let newButtonsAndIcons = JSON.parse ( fileReader.result );
				myButtons = myButtons.concat ( newButtonsAndIcons.editionButtons );
				mySelectOptions =
					mySelectOptions.concat ( newButtonsAndIcons.preDefinedIconsList );
				mySelectOptions.sort (
					( first, second ) => first.name.localeCompare ( second.name )
				);

				let oldButton = null;
				while ( THE_CONST.zero < document.getElementsByClassName ( 'TravelNotes-NoteDialog-EditorButton' ).length ) {
					oldButton = document.getElementsByClassName ( 'TravelNotes-NoteDialog-EditorButton' ) [ THE_CONST.zero ];
					oldButton.removeEventListener ( 'click', myOnButtonClickEventListener, false );
					myToolbarDiv.removeChild ( oldButton );
				}
				myAddButtons ( );
				for (
					let elementCounter = myIconsSelect.length - THE_CONST.number1;
					elementCounter >= THE_CONST.zero;
					elementCounter --
				) {
					myIconsSelect.remove ( elementCounter );
				}
				myAddSelectOptions ( );
			}
			catch ( err ) {
				console.log ( err ? err : 'An error occurs when opening the file' );
			}
		};
		fileReader.readAsText ( changeEvent.target.files [ THE_CONST.zero ] );
	}

	/*
	--- End of myOnOpenUserDataFileInputChange function ---
	*/

	/*
	---  myCreateToolbarButtonsAndSelect function ---------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateToolbarButtonsAndSelect ( ) {

		myIconsSelect = myHTMLElementsFactory.create (
			'select',
			{
				className : 'TravelNotes-NoteDialog-Select',
				id : 'TravelNotes-NoteDialog-IconSelect'
			},
			myToolbarDiv
		);
		myIconsSelect.addEventListener ( 'change', myOnSelectEventListener, false );
		myAddSelectOptions ( );

		// open userdata button ...
		// ...with the well know hack to hide the file input ( a div + an input + a fake div + a button )
		let openFileDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-NoteDialog-OpenEditorFileDiv'
			},
			myToolbarDiv
		);
		let openFileInput = myHTMLElementsFactory.create (
			'input',
			{
				id : 'TravelNotes-NoteDialog-OpenEditorFileInput',
				type : 'file',
				accept : '.json'
			},
			openFileDiv
		);
		openFileInput.addEventListener ( 'change', myOnOpenFileInputChange, false );
		let openFileFakeDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-NoteDialog-OpenStyleFakeDiv'
			},
			openFileDiv
		);
		let openFileButton = myHTMLElementsFactory.create (
			'button',
			{
				id : 'TravelNotes-NoteDialog-OpenEditorFileButton',
				title : theTranslator.getText ( 'NoteDialog - Open a configuration file' ),
				innerHTML : '&#x1F4C2;'
			},
			openFileFakeDiv
		);
		openFileButton.addEventListener (
			'click',
			( ) => openFileInput.click ( ),
			false
		);

		myAddButtons ( );
	}

	/*
	--- myCreateToolbar function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateToolbar ( onSelectEventListener, onButtonClickEventListener ) {

		myOnSelectEventListener = onSelectEventListener;
		myOnButtonClickEventListener = onButtonClickEventListener;

		myToolbarDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-ToolbarDiv',
				id : 'TravelNotes-NoteDialog-ToolbarDiv'
			}
		);

		myCreateToolbarButtonsAndSelect ( );

		return myToolbarDiv;
	}

	/*
	--- mySetSelectOptions function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetSelectOptions ( selectOptions ) {
		mySelectOptions = mySelectOptions.concat ( selectOptions );
		mySelectOptions.sort ( ( first, second ) => first.name.localeCompare ( second.name ) );
	}

	/*
	--- NoteDialogToolbar object --------------------------------------------------------------------------------------

	Creation of the toolbar

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			set selectOptions ( SelectOptions ) { mySetSelectOptions ( SelectOptions ); },

			set buttons ( Buttons ) { myButtons = myButtons.concat ( Buttons ); },

			getIconData : index => mySelectOptions [ index ],

			createToolbar :
				(
					onSelectEventListener,
					onButtonClickEventListener
				) => myCreateToolbar (
					onSelectEventListener,
					onButtonClickEventListener
				)
		}
	);
}

const theNoteDialogToolbar = newNoteDialogToolbar ( );

export { theNoteDialogToolbar };

/*
--- End of NoteDialogToolbar.js file ----------------------------------------------------------------------------------
*/