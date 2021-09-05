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
	- v1.11.0:
		- created
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file TwoButtonsDialog.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} TwoButtonsDialogContent
@desc An object to store the content displayed in a TwoButtonsDialog
@property {?string} title The title of the dialog
@property {?string} okButtonContent The text displayed on the ok button. Default OK
@property {?string} secondButtonContent The text displayed on the second button. When none, the second button is not displayed
@property {?string} textContent The text displayed in the dialog
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module dialogs
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import BaseDialog from '../dialogBase/BaseDialog.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class TwoButtonsDialog
@classdesc A customizable dialog with two buttons.
Create an instance of the dialog, then execute the show ( ) method. The Promise returned by the show ( ) method fullfil
when the first button is used and reject when the second button or the cancel button on the topbar is used
@example
newTwoButtonsDialog (
	{
		title : 'Two buttons dialog',
		firstButtonText : 'Yes',
		secondButtonText : 'No',
		text : 'This is a sample of TwoButtonsDialog
	}
)
	.show ( )
	.then ( ( ) => doSomethingOnOkButtonClick )
	.catch ( error => doSomethingWithTheError );
@extends BaseDialog
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class TwoButtonsDialog extends BaseDialog {

	#options = null;

	/*
	constructor
	*/

	constructor ( options = {} ) {
		super ( options );
		this.#options = options;
	}

	/**
	Get an array with the HTMLElements that have to be added in the content of the dialog.
	Can be overloaded in the derived classes
	@readonly
	*/

	get contentHTMLElements ( ) {
		return [
			theHTMLElementsFactory.create (
				'div',
				{
					textContent : this.#options.text || ''
				}
			)
		];
	}

	/**
	Get the title of the dialog. Can be overloaded in the derived classes
	@readonly
	*/

	get title ( ) { return this.#options.title || ''; }
}

export default TwoButtonsDialog;

/*
--- End of TwoButtonsDialog.js file -------------------------------------------------------------------------------------------
*/