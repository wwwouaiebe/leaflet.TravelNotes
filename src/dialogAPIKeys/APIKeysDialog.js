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
	- v1.10.0:
		- Issue ♯107 : Add a button to reload the APIKeys file in the API keys dialog
	- v1.11.0:
		- Issue ♯108 : Add a warning when an error occurs when reading the APIKeys file at startup reopened
	- v1.11.0:
		- Issue ♯113 : When more than one dialog is opened, using thr Esc or Return key close all the dialogs
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯137 : Remove html tags from json files
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file APIKeysDialog.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module dialogAPIKeys

@------------------------------------------------------------------------------------------------------------------------------
*/

import BaseDialog from '../dialogBase/BaseDialog.js';
import APIKeysDialogToolbar from '../dialogAPIKeys/APIKeysDialogToolbar.js';
import { APIKeyDeletedEL } from '../dialogAPIKeys/APIKeysDialogEventListeners.js';
import theTranslator from '../UILib/Translator.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import APIKeysDialogKeyControl from '../dialogAPIKeys/APIKeysDialogKeyControl.js';

import { ZERO } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class APIKeysDialog
@classdesc This class is the APIKeys dialog
@extends BaseDialog
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class APIKeysDialog extends BaseDialog {

	/**
	A map to store the APIKeyControl object
	@private
	*/

	#APIKeysControls = new Map ( );

	/**
	The dialog toolbar
	@private
	*/

	#toolbar = null;

	/**
	A div that contains the APIKeyControls
	@private
	*/

	#APIKeysControlsContainer = null

	#onAPIKeyDeletedEventListener = null;

	/**
	Create the #APIKeysControlsContainer
	@private
	*/

	#createAPIKeysControlsContainer ( ) {
		this.#APIKeysControlsContainer = theHTMLElementsFactory.create ( 'div' );
		this.#onAPIKeyDeletedEventListener = new APIKeyDeletedEL ( this, this.#APIKeysControls );
		this.#APIKeysControlsContainer.addEventListener (
			'apikeydeleted',
			this.#onAPIKeyDeletedEventListener,
			false
		);
	}

	constructor ( APIKeys, haveAPIKeysFile ) {

		super ( );

		this.#toolbar = new APIKeysDialogToolbar ( this, this.#APIKeysControls, haveAPIKeysFile );
		this.#createAPIKeysControlsContainer ( );
		this.addAPIKeys ( APIKeys );
	}

	#destructor ( ) {
		this.#toolbar.destructor ( );
		this.#APIKeysControlsContainer.removeEventListener (
			'apikeydeleted',
			this.#onAPIKeyDeletedEventListener,
			false
		);
		this.#onAPIKeyDeletedEventListener.destructor ( );
	}

	/**
	Validate the APIKeys. Each APIKey must have a not empty name and a not empty key.
	Duplicate APIKey names are not allowed
	@return {boolean} true when all the keys are valid and not duplicated
	*/

	validateAPIKeys ( ) {
		this.hideError ( );
		let haveEmptyValues = false;
		let providersNames = [];
		this.#APIKeysControls.forEach (
			APIKeyControl => {
				haveEmptyValues =
					haveEmptyValues ||
					'' === APIKeyControl.providerName
					||
					'' === APIKeyControl.providerKey;
				providersNames.push ( APIKeyControl.providerName );
			}
		);
		let haveDuplicate = false;
		providersNames.forEach (
			providerName => {
				haveDuplicate =
					haveDuplicate ||
					providersNames.indexOf ( providerName ) !== providersNames.lastIndexOf ( providerName );
			}
		);
		if ( haveEmptyValues ) {
			this.showError (
				theTranslator.getText ( 'APIKeysDialog - empty API key name or value' )
			);
			return false;
		}
		else if ( haveDuplicate ) {
			this.showError (
				theTranslator.getText ( 'APIKeysDialog - duplicate API key name found' )
			);
			return false;
		}
		return true;
	}

	/**
	Add an array of APIKeys to the dialog.
	@param {Array.<APIKey>} APIKeys An array with the APIKeys to add
	*/

	addAPIKeys ( APIKeys ) {
		this.#APIKeysControls.clear ( );
		APIKeys.forEach (
			APIKey => {
				let APIKeyControl = new APIKeysDialogKeyControl ( APIKey );
				this.#APIKeysControls.set ( APIKeyControl.objId, APIKeyControl );
			}
		);
		this.refreshAPIKeys ( );
	}

	/**
	Remove all elements from the #APIKeysControlsContainer and add the existing APIKeys
	*/

	refreshAPIKeys ( ) {
		while ( this.#APIKeysControlsContainer.firstChild ) {
			this.#APIKeysControlsContainer.removeChild ( this.#APIKeysControlsContainer.firstChild );
		}
		this.#APIKeysControls.forEach (
			APIKeyControl => { this.#APIKeysControlsContainer.appendChild ( APIKeyControl.HTMLElements [ ZERO ] ); }
		);
	}

	/**
	Overload of the BaseDialog.canClose ( ) method.
	*/

	canClose ( ) {
		return this.validateAPIKeys ( );
	}

	/**
	Overload of the BaseDialog.onCancel ( ) method. Called when the cancel button is clicked
	*/

	onCancel ( ) {
		this.#destructor ( );
		super.onCancel ( );
	}

	/**
	Overload of the BaseDialog.onOk ( ) method. Called when the Ok button is clicked
	*/

	onOk ( ) {
		let APIKeys = [];
		this.#APIKeysControls.forEach (
			APIKeyControl => APIKeys.push ( APIKeyControl.APIKey )
		);
		if ( super.onOk ( APIKeys ) ) {
			this.#destructor ( );
		}
	}

	/**
	Return the dialog title. Overload of the BaseDialog.title property
	@readonly
	*/

	get title ( ) { return theTranslator.getText ( 'APIKeysDialog - API keys' ); }

	/**
	Get an array with the HTMLElements that have to be added in the content of the dialog.
	@readonly
	*/

	get contentHTMLElements ( ) {
		return [ this.#toolbar.rootHTMLElement, this.#APIKeysControlsContainer ];
	}
}

export default APIKeysDialog;

/*
--- End of APIKeysDialog.js file --------------------------------------------------------------------------------------
*/