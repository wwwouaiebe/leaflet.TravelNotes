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
Doc reviewed 20210802
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
@classdesc This is the toolbar for the APIKeysDialog. Display 5 buttons on top of dialog.
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class APIKeysDialogToolbar {

	/**
	The root HTML element of the control
	@private
	*/

	#rootHTMLElement = null;

	/**
	Store the status of the APIKeys file
	@private
	*/

	#haveAPIKeysFile = false

	/**
	Create the ReloadKeysFromServerFile Button
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
				this.#rootHTMLElement
			).addEventListener ( 'click', APIKeysDialogEventListeners.onReloadAPIKeysFromServerButtonClick, false );
		}
	}

	/**
	Create the SaveKeysToSecureFile Button
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
			this.#rootHTMLElement
		)
			.addEventListener ( 'click', APIKeysDialogEventListeners.onSaveKeysToSecureFileButtonClick, false );

	}

	/**
	Create the RestoreKeysFromSecureFile Button
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
			this.#rootHTMLElement
		)
			.addEventListener ( 'click', APIKeysDialogEventListeners.onOpenSecureFileButtonClick, false );
	}

	/**
	Create the AddNewAPIKey Button
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
			this.#rootHTMLElement
		)
			.addEventListener ( 'click', APIKeysDialogEventListeners.onAddNewAPIKeyButtonClick, false );
	}

	/**
	Create the SaveKeysToUnsecureFile Button
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
			this.#rootHTMLElement
		).addEventListener ( 'click', APIKeysDialogEventListeners.onSaveKeysToUnsecureFileButtonClick, false );
	}

	/**
	Create the RestoreKeysFromUnsecureFile Button
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
			this.#rootHTMLElement
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

	/**
	constructor
	@param {boolean} haveAPIKeysFile A boolean indicating if a APIKeys file was found on the server whenthe apps is launching
	*/

	constructor ( haveAPIKeysFile ) {
		this.#haveAPIKeysFile = haveAPIKeysFile;
		this.#rootHTMLElement = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-APIKeysDialog-ToolbarDiv'
			}
		);

		this.#addToolbarButtons ( );

	}

	/**
	get the rootHTMLElement of the toolbar
	@readonly
	*/

	get rootHTMLElement ( ) {
		return this.#rootHTMLElement;
	}

}

export default APIKeysDialogToolbar;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of APIKeysDialogToolbar.js file

@------------------------------------------------------------------------------------------------------------------------------
*/