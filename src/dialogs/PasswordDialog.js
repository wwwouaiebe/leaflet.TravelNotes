/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
		- Issue #113 : When more than one dialog is opened, using thr Esc or Return key close all the dialogs
	- v1.14.0:
		- Issue #137 : Remove html tags from json files
Doc reviewed 20200815
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file PasswordDialog.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
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

import { theTranslator } from '../UI/Translator.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewPasswordDialog
@desc constructor for PasswordDialog objects
@param {boolean} verifyPassword When true the password must follow the password rules
@return {PasswordDialog} an instance of PasswordDialog object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewPasswordDialog ( verifyPassword ) {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class PasswordDialog
	@classdesc A BaseDialog object completed for passwords.
	Create an instance of the dialog, then execute the show ( ) method. The typed password, encoded in an UInt8Array with
	window.TextEncoder ( ).encode ( ) is given as parameter of the succes handler of the Promise returned by
	the show ( ) method.
	@example
	newPasswordDialog ( true )
		.show ( )
		.then ( password => doSomethingWithThePassword )
		.catch ( error => doSomethingWithTheError );
	@see {@link newPasswordDialog} for constructor
	@augments BaseDialog
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	let myPasswordDialog = null;
	let myPasswordDataDiv = null;
	let myPasswordInput = null;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnOkButtonClick
	@desc Event listener for the ok button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkButtonClick ( ) {

		const PSWD_MIN_LENGTH = 12;

		myPasswordDialog.hideError ( );
		if ( verifyPassword ) {
			if (
				( myPasswordInput.value.length < PSWD_MIN_LENGTH )
				||
				! myPasswordInput.value.match ( RegExp ( '[0-9]+' ) )
				||
				! myPasswordInput.value.match ( RegExp ( '[a-z]+' ) )
				||
				! myPasswordInput.value.match ( RegExp ( '[A-Z]+' ) )
				||
				! myPasswordInput.value.match ( RegExp ( '[^0-9a-zA-Z]' ) )
			) {
				myPasswordDialog.showError (
					'<p>' + theTranslator.getText ( 'PasswordDialog - Password rules1' ) + '</p><ul>' +
					'<li>' + theTranslator.getText ( 'PasswordDialog - Password rules2' ) + '</li>' +
					'<li>' + theTranslator.getText ( 'PasswordDialog - Password rules3' ) + '</li>' +
					'<li>' + theTranslator.getText ( 'PasswordDialog - Password rules4' ) + '</li>' +
					'<li>' + theTranslator.getText ( 'PasswordDialog - Password rules5' ) + '</li>' +
					'<li>' + theTranslator.getText ( 'PasswordDialog - Password rules6' ) + '</li></ul>'
				);
				myPasswordInput.focus ( );
				return;
			}
		}

		return new window.TextEncoder ( ).encode ( myPasswordInput.value );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateDialog
	@desc This method creates the dialog
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDialog ( ) {
		myPasswordDialog = newBaseDialog ( );
		myPasswordDialog.title = theTranslator.getText ( 'PasswordDialog - password' );
		myPasswordDialog.okButtonListener = myOnOkButtonClick;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateContent
	@desc This method creates the dialog content
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateContent ( ) {
		myPasswordDataDiv = theHTMLElementsFactory.create ( 'div', null, myPasswordDialog.content );
		myPasswordInput = theHTMLElementsFactory.create ( 'input', { type : 'password' }, myPasswordDataDiv );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnShow
	@desc This method is executed when the show method is called
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnShow ( ) {
		myPasswordInput.focus ( );
	}

	myCreateDialog ( );
	myCreateContent ( );
	myPasswordDialog.onShow = myOnShow;

	return myPasswordDialog;
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newPasswordDialog
	@desc constructor for PasswordDialog objects
	@param {boolean} verifyPassword When true the password must follow the password rules
	@return {PasswordDialog} an instance of PasswordDialog object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewPasswordDialog as newPasswordDialog
};

/*
--- End of PasswordDialog.js file ---------------------------------------------------------------------------------------------
*/