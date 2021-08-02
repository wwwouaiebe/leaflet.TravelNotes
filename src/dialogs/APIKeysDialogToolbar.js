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

@file APIKeysDialogToolbar.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module APIKeysDialogToolbar
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTranslator from '../UI/Translator.js';
import theConfig from '../data/Config.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import APIKeysDialogEventListeners from '../dialogs/APIKeysDialogEventListeners.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class APIKeysDialogToolbar
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class APIKeysDialogToolbar {

	#toolbarDiv = null;
	#haveAPIKeysFile = false

	/**
	Create the ... Button
	@private
	*/

	#createReloadKeysFromServerFileButton ( ) {
		if ( this.#haveAPIKeysFile ) {
			theHTMLElementsFactory.create (
				'div',
				{
					className : 'TravelNotes-BaseDialog-Button',
					title : theTranslator.getText ( 'APIKeysDialog - Reload from server' ),
					textContent : '🔄'
				},
				this.#toolbarDiv
			).addEventListener ( 'click', APIKeysDialogEventListeners.onReloadAPIKeysFromServerButtonClick, false );
		}
	}

	/**
	Create the ... Button
	@private
	*/

	#createSaveKeysToSecureFileButton ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'APIKeysDialog - Save to file' ),
				textContent : '💾'
			},
			this.#toolbarDiv
		)
			.addEventListener ( 'click', APIKeysDialogEventListeners.onSaveKeysToSecureFileButtonClick, false );

	}

	/**
	Create the ... Button
	@private
	*/

	#createRestoreKeysFromSecureFileButton ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'APIKeysDialog - Open file' ),
				textContent : '📂'
			},
			this.#toolbarDiv
		)
			.addEventListener ( 'click', APIKeysDialogEventListeners.onOpenSecureFileButtonClick, false );
	}

	/**
	Create the ... Button
	@private
	*/

	#createAddNewAPIKeyButton ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'APIKeysDialog - new API key' ),
				textContent : '+'
			},
			this.#toolbarDiv
		)
			.addEventListener ( 'click', APIKeysDialogEventListeners.onAddNewAPIKeyClick, false );
	}

	/**
	Create the ... Button
	@private
	*/

	#createSaveKeysToUnsecureFileButton ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button TravelNotes-APIKeysDialog-AtRightButton',
				title : theTranslator.getText ( 'APIKeysDialog - Save to json file' ),
				textContent : '💾'
			},
			this.#toolbarDiv
		).addEventListener ( 'click', APIKeysDialogEventListeners.onSaveKeysToUnsecureFileButtonClick, false );
	}

	/**
	Create the ... Button
	@private
	*/

	#createRestoreKeysFromUnsecureFileButton ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'APIKeysDialog - Open json file' ),
				textContent : '📂'
			},
			this.#toolbarDiv
		).addEventListener ( 'click', APIKeysDialogEventListeners.onOpenUnsecureFileButtonClick, false );
	}

	/**
	Add the buttons to the toolbar
	@private
	*/

	#addToolbarButtons ( ) {
		if ( window.crypto && window.crypto.subtle && window.crypto.subtle.importKey && window.isSecureContext ) {
			this.#createReloadKeysFromServerFileButton ( );
			this.#createSaveKeysToSecureFileButton ( );
			this.#createRestoreKeysFromSecureFileButton ( );
		}

		this.#createAddNewAPIKeyButton ( );

		if ( theConfig.APIKeysDialog.haveUnsecureButtons ) {
			this.#createSaveKeysToUnsecureFileButton ( );
			this.#createRestoreKeysFromUnsecureFileButton ( );
		}
	}

	constructor ( haveAPIKeysFile ) {
		this.#haveAPIKeysFile = haveAPIKeysFile;
		this.#toolbarDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-APIKeysDialog-ToolbarDiv'
			}
		);

		this.#addToolbarButtons ( );

	}

	get content ( ) {
		return [ this.#toolbarDiv ];
	}

}

export default APIKeysDialogToolbar;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of APIKeysDialogToolbar.js file

@------------------------------------------------------------------------------------------------------------------------------
*/