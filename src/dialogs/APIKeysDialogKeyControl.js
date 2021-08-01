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

@file APIKeysDialogKeyControl.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module APIKeysDialogKeyControl
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTranslator from '../UI/Translator.js';
import theConfig from '../data/Config.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import ObjId from '../data/ObjId.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class APIKeysDialogKeyControl
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class APIKeysDialogKeyControl {

	#APIKeyDiv = null;
	#providerNameInput = null;
	#providerKeyInput = null;
	#objId = ObjId.nextObjId;

	constructor ( APIKey ) {

		this.#APIKeyDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-APIKeysDialog-ApiKeyRow'
			}
		);

		this.#providerNameInput = theHTMLElementsFactory.create (
			'input',
			{
				className : 'TravelNotes-APIKeysDialog-ApiKeyName TravelNotes-APIKeysDialog-Input',
				value : APIKey.providerName,
				placeholder : theTranslator.getText ( 'APIKeysDialog - provider name' )
			},
			this.#APIKeyDiv
		);

		this.#providerKeyInput = theHTMLElementsFactory.create (
			'input',
			{
				className : 'TravelNotes-APIKeysDialog-ApiKeyValue TravelNotes-APIKeysDialog-Input',
				value : APIKey.providerKey,
				placeholder : theTranslator.getText ( 'APIKeysDialog - API key' ),
				type : theConfig.APIKeysDialog.showAPIKeys ? 'text' : 'password'
			},
			this.#APIKeyDiv
		);

		theHTMLElementsFactory.create (
			'div',
			{
				className :
					'TravelNotes-BaseDialog-Button ' +
					'TravelNotes-APIKeysDialog-AtRightButton TravelNotes-APIKeysDialog-DeleteRowButton',
				title : theTranslator.getText ( 'APIKeysDialog - delete API key' ),
				textContent : '❌'
			},
			this.#APIKeyDiv
		);

		/*
			.addEventListener ( 'click', myOnDeleteApiKeyRowButton, false );
		*/

	}

	get objId ( ) { return this.#objId; }

	get content ( ) {
		return this.#APIKeyDiv;
	}

	get providerName ( ) { return this.#providerNameInput.value; }

	get providerKey ( ) { return this.#providerKeyInput.value; }

	get APIKey ( ) {
		return {
			providerName : this.#providerNameInput.value,
			providerKey : this.#providerKeyInput.value
		};
	}

}

export default APIKeysDialogKeyControl;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of APIKeysDialogKeyControl.js file

@------------------------------------------------------------------------------------------------------------------------------
*/