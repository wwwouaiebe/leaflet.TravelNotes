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

@file PasswordDialogEventListeners.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module PasswordDialogEventListeners
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@--------------------------------------------------------------------------------------------------------------------------

@class OnMouseDownEyeEventListener
@classdesc mousedown event listener for the eye button
@hideconstructor
@private

@--------------------------------------------------------------------------------------------------------------------------
*/

class OnMouseDownEyeEventListener {

	#passwordInput = null;

	constructor ( passwordInput ) {
		this.#passwordInput = passwordInput;
	}

	destructor ( ) {
		this.#passwordInput = null;
	}

	handleEvent ( mouseDownEvent ) {
		mouseDownEvent.stopPropagation;
		this.#passwordInput.type = 'text';
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class OnMouseUpEyeEventListener
@classdesc mouseup event listener for the eye button
@hideconstructor
@private

@--------------------------------------------------------------------------------------------------------------------------
*/

class OnMouseUpEyeEventListener {

	#passwordInput = null;

	constructor ( passwordInput ) {
		this.#passwordInput = passwordInput;
	}

	destructor ( ) {
		this.#passwordInput = null;
	}

	handleEvent ( mouseUpEvent ) {
		mouseUpEvent.stopPropagation;
		this.#passwordInput.type = 'password';
		this.#passwordInput.focus ( );
	}
}

export { OnMouseDownEyeEventListener, OnMouseUpEyeEventListener };

/*
@------------------------------------------------------------------------------------------------------------------------------

end of PasswordDialogEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/