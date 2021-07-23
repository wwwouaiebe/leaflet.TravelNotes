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
	- v2.2.0:
		- created
Doc reviewed ...
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file SaveAsDialog.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module SaveAsDialog
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewSaveAsDialog
@desc constructor for SaveAsDialog objects
@return {SaveAsDialog} an instance of SaveAsDialog object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewSaveAsDialog ( ) {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class SaveAsDialog
	@classdesc A saveAsDialog object completed for making a partial save of the edited travel
	Create an instance of the dialog, then execute the show ( ) method. The selected values are returned as parameter of the
	succes handler of the Promise returned by the show ( ) method.
	@example
	newSaveAsDialog (  )
		.show ( )
		.then ( removeData => doSomethingWithTheDataToRemove )
		.catch ( error => doSomethingWithTheError );
	@see {@link newSaveAsDialog} for constructor
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	let mySaveAsDialog = null;
	let mySaveAsDiv = null;
	let myRemoveTravelNotesInput = null;
	let myRemoveRoutesNotesInput = null;
	let myRemoveManeuversInput = null;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnOkButtonClick
	@desc Event listener for the ok button
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkButtonClick ( ) {
		return Object.freeze (
			{
				removeTravelNotes : myRemoveTravelNotesInput.checked,
				removeRoutesNotes : myRemoveRoutesNotesInput.checked,
				removeManeuvers : myRemoveManeuversInput.checked
			}
		);
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateInputDiv
	@desc This method creates a div with a checkbox and a text
	@param {string} inputText the text to display
	@return {HTMLInputElement} the input element in the div
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateInputDiv ( inputText ) {
		let inputDiv = theHTMLElementsFactory.create ( 'div', null, mySaveAsDiv );
		let input = theHTMLElementsFactory.create (
			'input',
			{
				type : 'checkbox',
				checked : false
			},
			inputDiv
		);
		theHTMLElementsFactory.create ( 'text', { value : inputText }, inputDiv );
		return input;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myCreateDialog
	@desc This method creates the dialog
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDialog ( ) {
		mySaveAsDialog = newBaseDialog ( );
		mySaveAsDialog.title = theTranslator.getText ( 'SaveAsDialog - SaveAs' );
		mySaveAsDialog.okButtonListener = myOnOkButtonClick;
		mySaveAsDiv = theHTMLElementsFactory.create ( 'div', null, mySaveAsDialog.content );
		myRemoveTravelNotesInput = myCreateInputDiv ( theTranslator.getText ( 'SaveAsDialog - Remove Travel Notes' ) );
		myRemoveRoutesNotesInput = myCreateInputDiv ( theTranslator.getText ( 'SaveAsDialog - Remove Routes Notes' ) );
		myRemoveManeuversInput = myCreateInputDiv ( theTranslator.getText ( 'SaveAsDialog - Remove Maneuvers' ) );
	}

	myCreateDialog ( );
	return mySaveAsDialog;
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newSaveAsDialog
	@desc constructor for SaveAsDialog objects
	@return {SaveAsDialog} an instance of SaveAsDialog object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewSaveAsDialog as newSaveAsDialog
};

/*
--- End of SaveAsDialog.js file -----------------------------------------------------------------------------------------------
*/