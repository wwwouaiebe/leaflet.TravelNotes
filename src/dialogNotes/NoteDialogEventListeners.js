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

@file NoteDialogEventListeners.js
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

import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';
import theTranslator from '../UILib/Translator.js';
import GeoCoder from '../coreLib/GeoCoder.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class NoteDialogGeoCoderHelper
@classdesc Helper class for the address button
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogGeoCoderHelper {

	#noteDialog = null;

	#onAddressUpdatedByGeoCoder ( address ) {
		this.#noteDialog.hideWait ( );
		let addressString = address.street;
		if ( '' !== address.city ) {
			addressString += ' <span class="TravelNotes-NoteHtml-Address-City">' + address.city + '</span>';
		}

		this.#noteDialog.setControlsValues ( { address : addressString } );
		this.#noteDialog.updatePreview ( { address : addressString } );
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

	setAddressWithGeoCoder ( latLng ) {
		this.#noteDialog.showWait ( );
		this.#noteDialog.hideError ( );
		new GeoCoder ( ).getAddressWithPromise ( latLng )
			.then ( address => { this.#onAddressUpdatedByGeoCoder ( address ); } )
			.catch (
				err => {
					if ( err ) {
						console.error ( err );
					}
					this.#noteDialog.hideWait ( );
					this.#noteDialog.showError (
						theTranslator.getText ( 'Notedialog - an error occurs when searching the adress' )
					);
				}
			);
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class AddressButtonClickEL
@classdesc Click event listener for the AddressButtonClickEL class
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class AddressButtonClickEL {

	#noteDialog = null;
	#latLng = null;
	#geoCoderHelper = null;

	/*
	constructor
	*/

	constructor ( noteDialog, latLng ) {
		Object.freeze ( this );
		this.#noteDialog = noteDialog;
		this.#latLng = latLng;
		this.#geoCoderHelper = new NoteDialogGeoCoderHelper ( this.#noteDialog );
	}

	destructor ( ) {
		this.#noteDialog = null;
		this.#geoCoderHelper.destructor ( );
	}

	handleEvent ( clickEvent ) {
		clickEvent.stopPropagation ( );
		this.#geoCoderHelper.setAddressWithGeoCoder ( this.#latLng );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class AllControlsFocusEL
@classdesc Focus event listener for all controls
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class AllControlsFocusEL {

	#noteDialog = null;
	#disableFocusControl = false;

	/*
	constructor
	*/

	constructor ( noteDialog, disableFocusControl ) {
		Object.freeze ( this );
		this.#noteDialog = noteDialog;
		this.#disableFocusControl = disableFocusControl;
	}

	destructor ( ) {
		this.#noteDialog = null;
	}

	handleEvent ( focusEvent ) {
		focusEvent.stopPropagation ( );
		if ( this.#disableFocusControl ) {
			this.#noteDialog.focusControl = null;
		}
		else {
			this.#noteDialog.focusControl = focusEvent.target;
		}
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class UrlInputBlurEL
@classdesc blur event listener for url input
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class UrlInputBlurEL {

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

	handleEvent ( blurEvent ) {
		blurEvent.stopPropagation ( );
		if ( '' === blurEvent.target.value ) {
			this.#noteDialog.hideError ( );
			return;
		}

		let verifyResult = theHTMLSanitizer.sanitizeToUrl ( blurEvent.target.value );
		if ( '' === verifyResult.errorsString ) {
			this.#noteDialog.hideError ( );
		}
		else {
			this.#noteDialog.showError ( theTranslator.getText ( 'NoteDialog - invalidUrl' ) );
		}
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class AllControlsInputEL
@classdesc input event listener for all control
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class AllControlsInputEL {

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

	handleEvent ( inputUpdatedEvent ) {
		inputUpdatedEvent.stopPropagation ( );
		let noteData = {};
		noteData [ inputUpdatedEvent.target.dataset.tanName ] = inputUpdatedEvent.target.value;
		this.#noteDialog.updatePreview ( noteData );
	}
}

export {
	AddressButtonClickEL,
	NoteDialogGeoCoderHelper,
	AllControlsFocusEL,
	UrlInputBlurEL,
	AllControlsInputEL
};

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/