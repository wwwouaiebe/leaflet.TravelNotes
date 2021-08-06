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
import {
	RestoreKeysFromUnsecureFileButtonEventListener,
	ReloadKeysFromServerButtonEventListener,
	RestoreKeysFromSecureFileButtonEventListener,
	SaveKeysToSecureFileButtonEventListener,
	SaveKeysToUnsecureFileButtonEventListener,
	NewAPIKeyButtonEventListener
} from '../dialogs/APIKeysDialogEventListeners.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class APIKeysDialogToolbar
@classdesc This is the toolbar for the APIKeysDialog. Display 5 buttons on top of dialog.
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class APIKeysDialogToolbar {

	#APIKeysDialog = null;

	/**
	A map where the APIKeysDialogKeyControl objects are stored
	*/

	#APIKeysControls = null;

	/**
	Store the status of the APIKeys file
	@private
	*/

	#haveAPIKeysFile = false

	/**
	The root HTML element of the control
	@private
	*/

	#rootHTMLElement = null;

	/**
	Create the ReloadKeysFromServerFile Button
	@private
	*/

	#createReloadKeysFromServerButton ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'APIKeysDialog - Reload from server' ),
				textContent : '🔄'
			},
			this.#rootHTMLElement
		)
			.addEventListener (
				'click',
				new ReloadKeysFromServerButtonEventListener ( this.#APIKeysDialog ),
				false
			);
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
			.addEventListener (
				'click',
				new SaveKeysToSecureFileButtonEventListener ( this.#APIKeysDialog, this.#APIKeysControls ),
				false
			);

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
			.addEventListener (
				'click',
				new RestoreKeysFromSecureFileButtonEventListener ( this.#APIKeysDialog ),
				false
			);
	}

	/**
	Create the AddNewAPIKey Button
	@private
	*/

	#createNewAPIKeyButton ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'APIKeysDialog - new API key' ),
				textContent : '+'
			},
			this.#rootHTMLElement
		)
			.addEventListener (
				'click',
				new NewAPIKeyButtonEventListener ( this.#APIKeysDialog, this.#APIKeysControls ),
				false
			);
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
		)
			.addEventListener (
				'click',
				new SaveKeysToUnsecureFileButtonEventListener ( this.#APIKeysDialog, this.#APIKeysControls ),
				false
			);
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
		)
			.addEventListener (
				'click',
				new RestoreKeysFromUnsecureFileButtonEventListener ( this.#APIKeysDialog ),
				false
			);
	}

	/**
	Add the buttons to the toolbar
	@private
	*/

	#addToolbarButtons ( ) {
		if ( window.crypto && window.crypto.subtle && window.crypto.subtle.importKey && window.isSecureContext ) {
			if ( this.#haveAPIKeysFile ) {
				this.#createReloadKeysFromServerButton ( );
			}
			this.#createSaveKeysToSecureFileButton ( );
			this.#createRestoreKeysFromSecureFileButton ( );
		}

		this.#createNewAPIKeyButton ( );

		if ( theConfig.APIKeysDialog.haveUnsecureButtons ) {
			this.#createSaveKeysToUnsecureFileButton ( );
			this.#createRestoreKeysFromUnsecureFileButton ( );
		}
	}

	/**
	constructor
	@param {boolean} haveAPIKeysFile A boolean indicating if a APIKeys file was found on the server whenthe apps is launching
	*/

	constructor ( APIKeysDialog, APIKeysControls, haveAPIKeysFile ) {
		this.#APIKeysDialog = APIKeysDialog;
		this.#APIKeysControls = APIKeysControls;
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