import theUtilities from '../util/Utilities.js';
import theNoteDialogToolbarData from '../dialogs/NoteDialogToolbarData.js';
import theTranslator from '../UI/Translator.js';
import MapIconFromOsmFactory from '../core/MapIconFromOsmFactory.js';
import { ZERO, INVALID_OBJ_ID } from '../util/Constants.js';

class EditionButtonsEventListener {

	#noteDialog = null;

	constructor ( noteDialog ) {
		this.#noteDialog = noteDialog;
	}

	/**
	click event listener fot the toolbar edition buttons. Update the current control value
	*/

	handleEvent ( clickEvent ) {
		if ( ! this.#noteDialog.focusControl ) {
			return;
		}
		let button = clickEvent.target;
		while ( ! button.htmlBefore ) {
			button = button.parentNode;
		}
		let selectionStart = this.#noteDialog.focusControl.selectionStart;
		let selectionEnd = this.#noteDialog.focusControl.selectionEnd;

		this.#noteDialog.focusControl.value =
			this.#noteDialog.focusControl.value.slice ( ZERO, selectionStart ) +
			button.htmlBefore +
			(
				ZERO === button.htmlAfter.length
					?
					''
					:
					this.#noteDialog.focusControl.value.slice ( selectionStart, selectionEnd )
			) +
			button.htmlAfter +
			this.#noteDialog.focusControl.value.slice ( selectionEnd );

		if ( selectionStart === selectionEnd || ZERO === button.htmlAfter.length ) {
			selectionStart += button.htmlBefore.length;
			selectionEnd = selectionStart;
		}
		else {
			selectionEnd += button.htmlBefore.length + button.htmlAfter.length;
		}
		this.#noteDialog.focusControl.setSelectionRange ( selectionStart, selectionEnd );
		this.#noteDialog.focusControl.focus ( );
		let noteData = {};
		noteData [ this.#noteDialog.focusControl.dataset.tanName ] = this.#noteDialog.focusControl.value;
		this.#noteDialog.updatePreview ( noteData );
	}
}

class IconSelectEventListener {

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

	constructor ( noteDialog ) {
		this.#noteDialog = noteDialog;
	}

	/**
	Change event listener for the select icon on the toolbar
	*/

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

class ToogleContentsButtonEventListener {

	#noteDialog = null;

	constructor ( noteDialog ) {
		this.#noteDialog = noteDialog;
	}

	/**
	click event listener for the toogle button on the toolbar
	*/

	handleEvent ( clickEvent ) {
		clickEvent.target.textContent = '▼' === clickEvent.target.textContent ? '▶' : '▼';
		this.#noteDialog.toogleContents ( );
	}
}

class OpenFileInputEventListener {

	#noteDialogToolbar = null;

	constructor ( noteDialogToolbar ) {
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

class OpenFileButtonEventListener {

	#noteDialogToolbar = null;

	constructor ( noteDialogToolbar ) {
		this.#noteDialogToolbar = noteDialogToolbar;
	}

	/**
	click event listener for the open file button on the toolbar
	*/

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		theUtilities.openFile ( new OpenFileInputEventListener ( this.#noteDialogToolbar ), '.json' );
	}
}

export {
	EditionButtonsEventListener,
	IconSelectEventListener,
	OpenFileButtonEventListener,
	ToogleContentsButtonEventListener
};