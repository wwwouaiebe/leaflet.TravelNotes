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
	- v1.11.0:
		- created
	- v1.14.0:
		- Issue #135 : Remove innerHTML from code
Doc reviewed 20200815
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file TwoButtonsDialog.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
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

@module TwoButtonsDialog
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewRoutePropertiesDialog
@desc constructor for TwoButtonsDialog objects
@param {TwoButtonsDialogContent} content A TwoButtonsDialogContent object with the content to be displayed in the dialog
@return {TwoButtonsDialog} an instance of TwoButtonsDialog object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewTwoButtonsDialog ( content ) {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class TwoButtonsDialog
	@classdesc A customizable dialog with two buttons.
	Create an instance of the dialog, then execute the show ( ) method. The Promise returned by the show ( ) method fullfil
	when the first button is used and reject when the second button or the cancel button on the topbar is used
	@example
	newTwoButtonsDialog (
		{
			title : 'Two buttons dialog',
			okButtonContent : 'Yes',
			secondButtonContent : 'No',
			textContent : 'This is a sample of TwoButtonsDialog
		}
	)
		.show ( )
		.then ( ( ) => doSomethingOnOkButtonClick )
		.catch ( error => doSomethingWithTheError );
	@see {@link newTwoButtonsDialog} for constructor
	@augments BaseDialog
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	let myTwoButtonsDialog = null;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateDialog
	@desc This method creates the dialog
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDialog ( ) {

		myTwoButtonsDialog = newBaseDialog ( );
		myTwoButtonsDialog.footer.classList.add ( 'TravelNotes-TwoButtonsDialog-FooterDiv' );
		myTwoButtonsDialog.title = content.title || '';
		myTwoButtonsDialog.okButton.classList.add ( 'TravelNotes-TwoButtonsDialog-Button' );
		if ( content.okButtonContent ) {
			myTwoButtonsDialog.okButton.textContent = content.okButtonContent;
		}
		if ( content.secondButtonContent ) {
			let secondButton = theHTMLElementsFactory.create (
				'div',
				{
					textContent : content.secondButtonContent,
					className :	'TravelNotes-BaseDialog-Button TravelNotes-TwoButtonsDialog-Button'
				},
				myTwoButtonsDialog.footer
			);
			secondButton.addEventListener (
				'click',
				( ) => myTwoButtonsDialog.cancelButton.click ( ),
				true
			);
		}
		if ( content.textContent ) {
			theHTMLElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-TwoButtonsDialog-MessageDiv',
					textContent : content.textContent
				},
				myTwoButtonsDialog.content
			);
		}
	}

	myCreateDialog ( );

	return myTwoButtonsDialog;
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newTwoButtonsDialog
	@desc constructor for TwoButtonsDialog objects
	@param {TwoButtonsDialogContent} content A TwoButtonsDialogContent object with the content to be displayed in the dialog
	@return {TwoButtonsDialog} an instance of TwoButtonsDialog object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewTwoButtonsDialog as newTwoButtonsDialog
};

/*
--- End of TwoButtonsDialog.js file -------------------------------------------------------------------------------------------
*/