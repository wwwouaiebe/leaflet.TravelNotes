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

@file APIKeysDialogV3.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module APIKeysDialogV3
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import BaseDialogV3 from '../dialogs/BaseDialogV3.js';
import APIKeysDialogToolbar from '../dialogs/APIKeysDialogToolbar.js';
import APIKeysDialogEventListeners from '../dialogs/APIKeysDialogEventListeners.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class APIKeysDialogV3
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class APIKeysDialogV3 extends BaseDialogV3 {

	#toolbar = null;
	#APIKeysControlsContainer = null

	#createAPIKeysControlsContainer ( ) {
		this.#APIKeysControlsContainer = theHTMLElementsFactory.create ( 'div' );
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

		this.refreshAPIKeys ( );
	}

	refreshAPIKeys ( ) {
		while ( this.#APIKeysControlsContainer.firstChild ) {
			this.#APIKeysControlsContainer.removeChild ( this.#APIKeysControlsContainer.firstChild );
		}
		APIKeysDialogEventListeners.APIKeysControls.forEach (
			APIKeyControl => { this.#APIKeysControlsContainer.appendChild ( APIKeyControl.content ); }
		);
	}

	canClose ( ) {
		return APIKeysDialogEventListeners.validateAPIKeys ( );
	}

	onOk ( ) {
		let APIKeys = [];
		APIKeysDialogEventListeners.APIKeysControls.forEach (
			APIKeyControl => APIKeys.push ( APIKeyControl.APIKey )
		);
		APIKeysDialogEventListeners.APIKeysControls.clear ( );
		super.onOk ( APIKeys );
	}

	onCancel ( ) {
		APIKeysDialogEventListeners.APIKeysControls.clear ( );
		super.onCancel ( );
	}

	get content ( ) {
		return [].concat (
			this.#toolbar.content,
			this.#APIKeysControlsContainer
		);
	}
}

export default APIKeysDialogV3;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of APIKeysDialogV3.js file

@------------------------------------------------------------------------------------------------------------------------------
*/