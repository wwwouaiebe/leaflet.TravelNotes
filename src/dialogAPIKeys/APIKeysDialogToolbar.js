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

@file APIKeysDialogToolbar.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module dialogAPIKeys
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTranslator from '../UILib/Translator.js';
import theConfig from '../data/Config.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import {
	RestoreFromUnsecureFileButtonClickEL,
	ReloadFromServerButtonClickEL,
	RestoreFromSecureFileButtonClickEL,
	SaveToSecureFileButtonClickEL,
	SaveToUnsecureFileButtonClickEL,
	NewAPIKeyButtonClickEL
} from '../dialogAPIKeys/APIKeysDialogEventListeners.js';

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

	#reloadKeysFromServerButton = null;
	#saveKeysToSecureFileButton = null;
	#restoreKeysFromSecureFileButton = null;
	#newAPIKeyButton = null;
	#saveKeysToUnsecureFileButton = null;
	#restoreKeysFromUnsecureFileButton = null;

	#reloadKeysFromServerButtonEventListener = null;
	#saveKeysToSecureFileButtonEventListener = null;
	#restoreKeysFromSecureFileButtonEventListener = null;
	#newAPIKeyButtonEventListener = null;
	#saveKeysToUnsecureFileButtonEventListener = null;
	#restoreKeysFromUnsecureFileButtonEventListener = null;

	/**
	Create the ReloadKeysFromServerFile Button
	@private
	*/

	#createReloadKeysFromServerButton ( ) {
		this.#reloadKeysFromServerButton = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'APIKeysDialog - Reload from server' ),
				textContent : '🔄'
			},
			this.#rootHTMLElement
		);
		this.#reloadKeysFromServerButtonEventListener =
			new ReloadFromServerButtonClickEL ( this.#APIKeysDialog );
		this.#reloadKeysFromServerButton.addEventListener (
			'click',
			this.#reloadKeysFromServerButtonEventListener,
			false
		);
	}

	/**
	Create the SaveKeysToSecureFile Button
	@private
	*/

	#createSaveKeysToSecureFileButton ( ) {
		this.#saveKeysToSecureFileButton = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'APIKeysDialog - Save to file' ),
				textContent : '💾'
			},
			this.#rootHTMLElement
		);
		this.#saveKeysToSecureFileButtonEventListener =
			new SaveToSecureFileButtonClickEL ( this.#APIKeysDialog, this.#APIKeysControls );
		this.#saveKeysToSecureFileButton.addEventListener (
			'click',
			this.#saveKeysToSecureFileButtonEventListener,
			false
		);
	}

	/**
	Create the RestoreKeysFromSecureFile Button
	@private
	*/

	#createRestoreKeysFromSecureFileButton ( ) {
		this.#restoreKeysFromSecureFileButton = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'APIKeysDialog - Open file' ),
				textContent : '📂'
			},
			this.#rootHTMLElement
		);
		this.#restoreKeysFromSecureFileButtonEventListener =
			new RestoreFromSecureFileButtonClickEL ( this.#APIKeysDialog );
		this.#restoreKeysFromSecureFileButton.addEventListener (
			'click',
			this.#restoreKeysFromSecureFileButtonEventListener,
			false
		);
	}

	/**
	Create the AddNewAPIKey Button
	@private
	*/

	#createNewAPIKeyButton ( ) {
		this.#newAPIKeyButton = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'APIKeysDialog - new API key' ),
				textContent : '+'
			},
			this.#rootHTMLElement
		);
		this.#newAPIKeyButtonEventListener =
			new NewAPIKeyButtonClickEL ( this.#APIKeysDialog, this.#APIKeysControls );
		this.#newAPIKeyButton.addEventListener (
			'click',
			this.#newAPIKeyButtonEventListener,
			false
		);
	}

	/**
	Create the SaveKeysToUnsecureFile Button
	@private
	*/

	#createSaveKeysToUnsecureFileButton ( ) {
		this.#saveKeysToUnsecureFileButton = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button TravelNotes-APIKeysDialog-AtRightButton',
				title : theTranslator.getText ( 'APIKeysDialog - Save to json file' ),
				textContent : '💾'
			},
			this.#rootHTMLElement
		);
		this.#saveKeysToUnsecureFileButtonEventListener =
			new SaveToUnsecureFileButtonClickEL ( this.#APIKeysDialog, this.#APIKeysControls );
		this.#saveKeysToUnsecureFileButton.addEventListener (
			'click',
			this.#saveKeysToUnsecureFileButtonEventListener,
			false
		);
	}

	/**
	Create the RestoreKeysFromUnsecureFile Button
	@private
	*/

	#createRestoreKeysFromUnsecureFileButton ( ) {
		this.#restoreKeysFromUnsecureFileButton = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-BaseDialog-Button',
				title : theTranslator.getText ( 'APIKeysDialog - Open json file' ),
				textContent : '📂'
			},
			this.#rootHTMLElement
		);
		this.#restoreKeysFromUnsecureFileButtonEventListener =
			new RestoreFromUnsecureFileButtonClickEL ( this.#APIKeysDialog );
		this.#restoreKeysFromUnsecureFileButton.addEventListener (
			'click',
			this.#restoreKeysFromUnsecureFileButtonEventListener,
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

	/*
	constructor
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
		Object.freeze ( this );
	}

	destructor ( ) {
		if ( this.#reloadKeysFromServerButton ) {
			this.#reloadKeysFromServerButton.removeEventListener (
				'click',
				this.#reloadKeysFromServerButtonEventListener,
				false
			);
			this.#reloadKeysFromServerButtonEventListener.destructor ( );
		}
		if ( this.#saveKeysToSecureFileButton ) {
			this.#saveKeysToSecureFileButton.removeEventListener (
				'click',
				this.#saveKeysToSecureFileButtonEventListener,
				false
			);
			this.#saveKeysToSecureFileButtonEventListener.destructor ( );
		}
		if ( this.#restoreKeysFromSecureFileButton ) {
			this.#restoreKeysFromSecureFileButton.removeEventListener (
				'click',
				this.#restoreKeysFromSecureFileButtonEventListener,
				false
			);
			this.#restoreKeysFromSecureFileButtonEventListener.destructor ( );
		}
		if ( this.#newAPIKeyButton ) {
			this.#newAPIKeyButton.removeEventListener (
				'click',
				this.#newAPIKeyButtonEventListener,
				false
			);
			this.#newAPIKeyButtonEventListener.destructor ( );
		}
		if ( this.#saveKeysToUnsecureFileButton ) {
			this.#saveKeysToUnsecureFileButton.removeEventListener (
				'click',
				this.#saveKeysToUnsecureFileButtonEventListener,
				false
			);
			this.#saveKeysToUnsecureFileButtonEventListener.destructor ( );
		}
		if ( this.#restoreKeysFromUnsecureFileButton ) {
			this.#restoreKeysFromUnsecureFileButton.removeEventListener (
				'click',
				this.#restoreKeysFromUnsecureFileButtonEventListener,
				false
			);
			this.#restoreKeysFromUnsecureFileButtonEventListener.destructor ( );
		}
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