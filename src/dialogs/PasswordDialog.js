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
	- v1.11.0:
		- Issue ♯113 : When more than one dialog is opened, using thr Esc or Return key close all the dialogs
	- v2.0.0:
		- Issue ♯137 : Remove html tags from json files
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210801
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file PasswordDialog.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module PasswordDialog
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTranslator from '../UI/Translator.js';
import BaseDialog from '../dialogs/BaseDialog.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';

const OUR_PSWD_MIN_LENGTH = 12;

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

	handleEvent ( mouseUpEvent ) {
		mouseUpEvent.stopPropagation;
		this.#passwordInput.type = 'password';
		this.#passwordInput.focus ( );
	}
}

/**
@--------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class is the password dialog
@extends BaseDialog

@--------------------------------------------------------------------------------------------------------------------------
*/

class PasswordDialog extends BaseDialog {

	/**
	The password html div
	@private
	*/

	#passwordDiv = null;

	/**
	the password html input
	@private
	*/

	#passwordInput = null;

	/** the eye html span
	@private
	*/

	#eyeSpan = null;

	/**
	the verifyPassword constructor parameter
	@private
	*/

	#verifyPassword = false;

	/**
	The constructor
	@param {boolean} verifyPassword When true the password must be conform to the password rules
	*/

	constructor ( verifyPassword ) {
		super ( );
		this.#verifyPassword = verifyPassword;
		this.#passwordDiv = theHTMLElementsFactory.create ( 'div', { id : 'TravelNotes-PasswordDialog-PasswordDiv' } );
		this.#passwordInput = theHTMLElementsFactory.create ( 'input', { type : 'password' }, this.#passwordDiv );
		this.#eyeSpan = theHTMLElementsFactory.create (
			'span',
			{
				id : 'TravelNotes-PasswordDialog-EyeSpan',
				textContent : '👁️'
			},
			this.#passwordDiv
		);
		this.#eyeSpan.addEventListener (
			'mousedown',
			new OnMouseDownEyeEventListener ( this.#passwordInput ),
			false );
		this.#eyeSpan.addEventListener (
			'mouseup',
			new OnMouseUpEyeEventListener ( this.#passwordInput ),
			false
		);
	}

	/**
	Overload of the BaseDialog.canClose ( ) method.
	*/

	canClose ( ) {
		this.hideError ( );
		if ( this.#verifyPassword ) {
			if (
				( this.#passwordInput.value.length < OUR_PSWD_MIN_LENGTH )
				||
				! this.#passwordInput.value.match ( /[0-9]+/ )
				||
				! this.#passwordInput.value.match ( /[a-z]+/ )
				||
				! this.#passwordInput.value.match ( /[A-Z]+/ )
				||
				! this.#passwordInput.value.match ( /[^0-9a-zA-Z]/ )
			) {
				this.showError (
					'<p>' + theTranslator.getText ( 'PasswordDialog - Password rules1' ) + '</p><ul>' +
					'<li>' + theTranslator.getText ( 'PasswordDialog - Password rules2' ) + '</li>' +
					'<li>' + theTranslator.getText ( 'PasswordDialog - Password rules3' ) + '</li>' +
					'<li>' + theTranslator.getText ( 'PasswordDialog - Password rules4' ) + '</li>' +
					'<li>' + theTranslator.getText ( 'PasswordDialog - Password rules5' ) + '</li>' +
					'<li>' + theTranslator.getText ( 'PasswordDialog - Password rules6' ) + '</li></ul>'
				);
				this.#passwordInput.focus ( );
				return false;
			}
		}
		return true;
	}

	/**
	Overload of the BaseDialog.onOk ( ) method.
	@return the password encoded with TextEncoder
	*/

	onOk ( ) {
		super.onOk ( new window.TextEncoder ( ).encode ( this.#passwordInput.value ) );
	}

	/**
	Overload of the BaseDialog.onShow ( ) method.
	*/

	onShow ( ) {
		this.#passwordInput.focus ( );
	}

	/**
	Get an array with the HTMLElements that have to be added in the content of the dialog.
	@readonly
	*/

	get contentHTMLElements ( ) { return [ this.#passwordDiv ]; }

	/**
	Return the dialog title. Overload of the BaseDialog.title property
	@readonly
	*/

	get title ( ) { return theTranslator.getText ( 'PasswordDialog - password' ); }

}

export default PasswordDialog;

/*
--- End of PasswordDialog.js file ---------------------------------------------------------------------------------------------
*/