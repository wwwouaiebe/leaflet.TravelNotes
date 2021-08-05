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

@file BaseDialogKeydownEventListener.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module BaseDialogKeydownEventListener
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@class BaseDialogKeydownEventListener
@classdesc BaseDialog keydown event listener besed on the EventListener API.
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class BaseDialogKeydownEventListener {

	#baseDialog = null;

	constructor ( baseDialog ) {
		this.#baseDialog = baseDialog;
	}

	handleEvent ( keyDownEvent ) {

		if ( ! this.#baseDialog.keyboardEventListenerEnabled ) {
			return;
		}

		if ( 'Escape' === keyDownEvent.key || 'Esc' === keyDownEvent.key ) {
			this.#baseDialog.onCancel ( );
		}
		else if ( 'Enter' === keyDownEvent.key && this.#baseDialog.canClose ( ) ) {
			this.#baseDialog.onOk ( );
		}

	}
}

export default BaseDialogKeydownEventListener;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of BaseDialogKeydownEventListener.js file

@------------------------------------------------------------------------------------------------------------------------------
*/