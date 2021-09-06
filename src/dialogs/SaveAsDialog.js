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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
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

@module dialogs
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTranslator from '../UILib/Translator.js';
import BaseDialog from '../dialogBase/BaseDialog.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class SaveAsDialog
@classdesc A saveAsDialog object completed for making a partial save of the edited travel
Create an instance of the dialog, then execute the show ( ) method. The selected values are returned as parameter of the
succes handler of the Promise returned by the show ( ) method.
@extends BaseDialog
@example
new SaveAsDialog (  )
	.show ( )
	.then ( removeData => doSomethingWithTheDataToRemove )
	.catch ( error => doSomethingWithTheError );
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class SaveAsDialog extends BaseDialog {

	#removeTravelNotesInput = null;
	#removeRoutesNotesInput = null;
	#removeManeuversInput = null;
	#removeTravelNotesDiv = null;
	#removeRoutesNotesDiv = null;
	#removeManeuversDiv = null;

	/**
	Create an input div and an input HTMLelements
	@param {string} inputText The text to display near the input
	@return {Array.<HTMLElement>} An array with the div and the input HTMLelement
	@private
	*/

	#createInputDiv ( inputText ) {
		let inputDiv = theHTMLElementsFactory.create ( 'div', null );
		let input = theHTMLElementsFactory.create (
			'input',
			{
				type : 'checkbox',
				checked : false
			},
			inputDiv
		);
		theHTMLElementsFactory.create ( 'text', { value : inputText }, inputDiv );
		return [ inputDiv, input ];
	}

	/*
	constructor
	*/

	constructor ( options = {} ) {
		super ( options );
		[ this.#removeTravelNotesDiv, this.#removeTravelNotesInput ] =
			this.#createInputDiv ( theTranslator.getText ( 'SaveAsDialog - Remove Travel Notes' ) );
		[ this.#removeRoutesNotesDiv, this.#removeRoutesNotesInput ] =
			this.#createInputDiv ( theTranslator.getText ( 'SaveAsDialog - Remove Routes Notes' ) );
		[ this.#removeManeuversDiv, this.#removeManeuversInput ] =
			this.#createInputDiv ( theTranslator.getText ( 'SaveAsDialog - Remove Maneuvers' ) );
	}

	/**
	Ok button handler.
	*/

	onOk ( ) {
		super.onOk (
			Object.freeze (
				{
					removeTravelNotes : this.#removeTravelNotesInput.checked,
					removeRoutesNotes : this.#removeRoutesNotesInput.checked,
					removeManeuvers : this.#removeManeuversInput.checked
				}
			)
		);
	}

	/**
	Get an array with the HTMLElements that have to be added in the content of the dialog.
	@readonly
	*/

	get contentHTMLElements ( ) {
		return [
			this.#removeTravelNotesDiv,
			this.#removeRoutesNotesDiv,
			this.#removeManeuversDiv
		];
	}

	/**
	Get the title of the dialog
	@readonly
	*/

	get title ( ) { return theTranslator.getText ( 'SaveAsDialog - SaveAs' ); }

}

export default SaveAsDialog;

/*
--- End of SaveAsDialog.js file -----------------------------------------------------------------------------------------------
*/