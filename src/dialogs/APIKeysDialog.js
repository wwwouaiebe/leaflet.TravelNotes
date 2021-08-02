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
Doc reviewed 20210802
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

@module APIKeysDialog
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import BaseDialogV3 from '../dialogs/BaseDialogV3.js';
import APIKeysDialogToolbar from '../dialogs/APIKeysDialogToolbar.js';
import APIKeysDialogEventListeners from '../dialogs/APIKeysDialogEventListeners.js';
import theTranslator from '../UI/Translator.js';
import { ZERO } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class APIKeysDialog
@classdesc This class is the APIKeys dialog
@extends BaseDialogV3
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class APIKeysDialog extends BaseDialogV3 {

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

	/**
	Create the #APIKeysControlsContainer
	@private
	*/

	#createAPIKeysControlsContainer ( ) {
		this.#APIKeysControlsContainer = document.createElement ( 'div' );
		this.#APIKeysControlsContainer.addEventListener (
			'apikeydeleted',
			APIKeysDialogEventListeners.onAPIKeyDeleted,
			false
		);
	}

	constructor ( APIKeys, haveAPIKeysFile ) {

		super ( );

		APIKeysDialogEventListeners.APIKeysDialog = this;
		this.#toolbar = new APIKeysDialogToolbar ( haveAPIKeysFile );
		this.#createAPIKeysControlsContainer ( );

		APIKeysDialogEventListeners.addAPIKeys ( APIKeys );
	}

	/**
	Remove all elements from the #APIKeysControlsContainer and add the existing APIKeys
	*/

	refreshAPIKeys ( ) {
		while ( this.#APIKeysControlsContainer.firstChild ) {
			this.#APIKeysControlsContainer.removeChild ( this.#APIKeysControlsContainer.firstChild );
		}
		APIKeysDialogEventListeners.APIKeysControls.forEach (
			APIKeyControl => { this.#APIKeysControlsContainer.appendChild ( APIKeyControl.HTMLElements [ ZERO ] ); }
		);
	}

	/**
	Overload of the BaseDialog.canClose ( ) method.
	*/

	canClose ( ) {
		return APIKeysDialogEventListeners.validateAPIKeys ( );
	}

	/**
	Overload of the BaseDialog.onCancel ( ) method. Called when the cancel button is clicked
	*/

	onCancel ( ) {
		APIKeysDialogEventListeners.reset ( );
		super.onCancel ( );
	}

	/**
	Overload of the BaseDialog.onOk ( ) method. Called when the Ok button is clicked
	*/

	onOk ( ) {
		let APIKeys = [];
		APIKeysDialogEventListeners.APIKeysControls.forEach (
			APIKeyControl => APIKeys.push ( APIKeyControl.APIKey )
		);
		APIKeysDialogEventListeners.reset ( );
		super.onOk ( APIKeys );
	}

	/**
	Return the dialog title. Overload of the BaseDialog.title property
	@readonly
	*/

	get title ( ) { return theTranslator.getText ( 'APIKeysDialog - API keys' ); }

	/**
	return the content of the dialog box. Overload of the BaseDialog.content property
	@readonly
	*/

	get content ( ) {
		return [ this.#toolbar.rootHTMLElement, this.#APIKeysControlsContainer ];
	}
}

export default APIKeysDialog;

/*
--- End of APIKeysDialog.js file --------------------------------------------------------------------------------------
*/