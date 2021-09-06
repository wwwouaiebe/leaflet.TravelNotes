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

@file NoteDialogToolbarEventListeners.js
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

import theUtilities from '../UILib/Utilities.js';
import theNoteDialogToolbarData from '../dialogNotes/NoteDialogToolbarData.js';
import theTranslator from '../UILib/Translator.js';
import MapIconFromOsmFactory from '../coreMapIcon/MapIconFromOsmFactory.js';
import { ZERO, INVALID_OBJ_ID } from '../main/Constants.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class EditionButtonsClickEL
@classdesc click event listener for the edition buttons
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class EditionButtonsClickEL {

	#noteDialog = null;

	/*
	constructor
	*/

	constructor ( noteDialog ) {
		Object.freeze ( this );
		this.#noteDialog = noteDialog;
	}

	destructor ( ) {
		this.#noteDialog = null;
	}

	/**
	click event listener fot the toolbar edition buttons. Update the current control value
	*/

	handleEvent ( clickEvent ) {
		if ( ! this.#noteDialog.focusControl ) {
			return;
		}
		let button = clickEvent.currentTarget;
		let selectionStart = this.#noteDialog.focusControl.selectionStart;
		let selectionEnd = this.#noteDialog.focusControl.selectionEnd;

		this.#noteDialog.focusControl.value =
			this.#noteDialog.focusControl.value.slice ( ZERO, selectionStart ) +
			button.dataset.tanHtmlBefore +
			(
				ZERO === button.dataset.tanHtmlAfter.length
					?
					''
					:
					this.#noteDialog.focusControl.value.slice ( selectionStart, selectionEnd )
			) +
			button.dataset.tanHtmlAfter +
			this.#noteDialog.focusControl.value.slice ( selectionEnd );

		if ( selectionStart === selectionEnd || ZERO === button.dataset.tanHtmlAfter.length ) {
			selectionStart += button.dataset.tanHtmlBefore.length;
			selectionEnd = selectionStart;
		}
		else {
			selectionEnd += button.dataset.tanHtmlBefore.length + button.dataset.tanHtmlAfter.length;
		}
		this.#noteDialog.focusControl.setSelectionRange ( selectionStart, selectionEnd );
		this.#noteDialog.focusControl.focus ( );
		let noteData = {};
		noteData [ this.#noteDialog.focusControl.dataset.tanName ] = this.#noteDialog.focusControl.value;
		this.#noteDialog.updatePreview ( noteData );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class IconSelectorChangeEL
@classdesc change event listener for the icon selector
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class IconSelectorChangeEL {

	#noteDialog = null;

	/**
	Helper method for the onIconSelectChange mehod
	@private
	*/

	#updatePreviewAndControls ( noteData )	{
		this.#noteDialog.setControlsValues ( noteData );
		this.#noteDialog.updatePreview ( noteData );
	}

	/**
	Svg Map icon creation
	@private
	*/

	#onMapIcon ( ) {
		if ( INVALID_OBJ_ID === this.#noteDialog.mapIconData.routeObjId ) {
			this.#noteDialog.showError (
				theTranslator.getText ( 'Notedialog - not possible to create a SVG icon for a travel note' )
			);
			return;
		}

		this.#noteDialog.showWait ( );
		new MapIconFromOsmFactory ( ).getIconAndAdressWithPromise (
			this.#noteDialog.mapIconData.latLng,
			this.#noteDialog.mapIconData.routeObjId
		)
			.then (
				mapIconData => {
					this.#noteDialog.hideWait ( );
					this.#updatePreviewAndControls ( mapIconData.noteData );
				}
			)
			.catch (
				( ) => {
					this.#noteDialog.hideWait ( );
					this.#noteDialog.showError (
						theTranslator.getText ( 'Notedialog - an error occurs when creating the SVG icon' )
					);
				}
			);
	}

	/*
	constructor
	*/

	constructor ( noteDialog ) {
		Object.freeze ( this );
		this.#noteDialog = noteDialog;
	}

	destructor ( ) {
		this.#noteDialog = null;
	}

	handleEvent ( changeEvent ) {
		changeEvent.stopPropagation ( );
		let preDefinedIcon = theNoteDialogToolbarData.getIconData ( changeEvent.target.selectedIndex );

		if ( 'SvgIcon' === preDefinedIcon.icon ) {
			this.#onMapIcon ( );
			return;
		}

		this.#updatePreviewAndControls (
			{
				iconContent : preDefinedIcon.icon,
				iconHeight : preDefinedIcon.height,
				iconWidth : preDefinedIcon.width,
				tooltipContent : preDefinedIcon.tooltip
			}
		);
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class ToogleContentsButtonClickEL
@classdesc click event listener for the toogle button
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class ToogleContentsButtonClickEL {

	#noteDialog = null;

	/*
	constructor
	*/

	constructor ( noteDialog ) {
		Object.freeze ( this );
		this.#noteDialog = noteDialog;
	}

	destructor ( ) {
		this.#noteDialog = null;
	}

	/**
	click event listener for the toogle button on the toolbar
	*/

	handleEvent ( clickEvent ) {
		clickEvent.target.textContent = '▼' === clickEvent.target.textContent ? '▶' : '▼';
		this.#noteDialog.toogleContents ( );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class OpenFileInputChangeEL
@classdesc change event listener for the temp open file input
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class OpenFileInputChangeEL {

	#noteDialogToolbar = null;

	/*
	constructor
	*/

	constructor ( noteDialogToolbar ) {
		Object.freeze ( this );
		this.#noteDialogToolbar = noteDialogToolbar;
	}

	/**
	Change event listener for the input associated on the open file button
	@private
	*/

	handleEvent ( changeEvent ) {
		changeEvent.stopPropagation ( );
		let fileReader = new FileReader ( );
		fileReader.onload = ( ) => {
			let fileContent = {};
			try {
				fileContent = JSON.parse ( fileReader.result );
				theNoteDialogToolbarData.loadJson ( fileContent );
				this.#noteDialogToolbar.update ( );
			}
			catch ( err ) {
				if ( err instanceof Error ) {
					console.error ( err );
				}
			}
		};
		fileReader.readAsText ( changeEvent.target.files [ ZERO ] );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class OpenFileButtonClickEL
@classdesc click event listener for the open file button
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class OpenFileButtonClickEL {

	#noteDialogToolbar = null;

	/*
	constructor
	*/

	constructor ( noteDialogToolbar ) {
		Object.freeze ( this );
		this.#noteDialogToolbar = noteDialogToolbar;
	}

	destructor ( ) {
		this.#noteDialogToolbar = null;
	}

	/**
	click event listener for the open file button on the toolbar
	*/

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		theUtilities.openFile ( new OpenFileInputChangeEL ( this.#noteDialogToolbar ), '.json' );
	}
}

export {
	EditionButtonsClickEL,
	IconSelectorChangeEL,
	OpenFileButtonClickEL,
	ToogleContentsButtonClickEL
};

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogToolbarEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/