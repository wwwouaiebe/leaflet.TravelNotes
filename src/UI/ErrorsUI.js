/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- ErrorsUI.js file ---------------------------------------------------------------------------------------------
This file contains:
	- the newErrorsUI function
	- the theErrorsUI object
Changes:
	- v1.6.0:
		- created
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theConfig } from '../data/Config.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theTranslator } from '../UI/Translator.js';

/*
--- newErrorsUI function ----------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newErrorsUI ( ) {

	let myErrorDiv = null;
	let myTimerId = null;
	let myShowHelpInput = null;
	let myShowHelpDiv = null;
	let myCancelButton = null;
	let myShowHelp = theConfig.errorUI.showHelp;
	let myHTMLElementsFactory = newHTMLElementsFactory ( );

	/*
	--- myOnHelpInputChange function ----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnHelpInputChange ( ) {
		myShowHelp = ! myShowHelpInput.checked;
	}

	/*
	--- myOnTimer function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnTimer ( ) {
		if ( myTimerId ) {
			clearTimeout ( myTimerId );
			myTimerId = null;
		}
		myErrorDiv.classList.remove ( 'TravelNotes-ErrorsUI-Error' );
		myErrorDiv.classList.remove ( 'TravelNotes-ErrorsUI-Warning' );
		myErrorDiv.classList.remove ( 'TravelNotes-ErrorsUI-Info' );
		myErrorDiv.classList.remove ( 'TravelNotes-ErrorsUI-Help' );
		myErrorDiv.classList.add ( 'TravelNotes-ErrorsUI-Hidden' );
		if ( myShowHelpInput ) {
			myShowHelpInput.removeEventListener ( 'change', myOnHelpInputChange, false );
			myShowHelpInput = null;
			myShowHelpDiv = null;
		}
		myErrorDiv.innerHTML = '';
	}

	/*
	--- myAddHelpCheckbox function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myAddHelpCheckbox ( ) {
		myShowHelpDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ErrorsUI-HelpInputDiv'
			},
			myErrorDiv
		);
		myShowHelpInput = myHTMLElementsFactory.create (
			'input',
			{
				id : 'TravelNotes-ErrorsUI-HelpInput',
				type : 'checkbox'
			},
			myShowHelpDiv
		);
		myShowHelpInput.addEventListener ( 'change', myOnHelpInputChange, false );
		myHTMLElementsFactory.create (
			'label',
			{
				id : 'TravelNotes-ErrorsUI-HelpInputLabel',
				for : 'TravelNotes-ErrorsUI-HelpInput',
				innerHTML : theTranslator.getText ( 'ErrorUI - Dont show again' )
			},
			myShowHelpDiv
		);
	}

	/*
	--- myShow function -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myShow ( message, errorLevel ) {

		if (
			( 'Error' === errorLevel && ! theConfig.errorUI.showError )
				||
				( 'Warning' === errorLevel && ! theConfig.errorUI.showWarning )
				||
				( 'Info' === errorLevel && ! theConfig.errorUI.showInfo )
				||
				( 'Help' === errorLevel && ! theConfig.errorUI.showHelp )
				||
				( 'Help' === errorLevel && ! myShowHelp )
		) {
			return;
		}
		if ( myTimerId ) {
			myOnTimer ( );
		}

		let headerDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ErrorsUI-Header'
			},
			myErrorDiv
		);
		myCancelButton = myHTMLElementsFactory.create (
			'span',
			{
				id : 'TravelNotes-ErrorsUI-CancelButton',
				innerHTML : '&#x274c'
			},
			headerDiv
		);
		myCancelButton.addEventListener ( 'click', myOnTimer, false );
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ErrorsUI-Message',
				innerHTML : message
			},
			myErrorDiv
		);

		myErrorDiv.classList.add ( 'TravelNotes-ErrorsUI-' + errorLevel );
		let timeOutDuration = theConfig.errorUI.timeOut;
		if ( 'Help' === errorLevel ) {
			myAddHelpCheckbox ( );
			timeOutDuration = theConfig.errorUI.helpTimeOut;
		}

		myErrorDiv.classList.remove ( 'TravelNotes-ErrorsUI-Hidden' );
		myTimerId = setTimeout ( myOnTimer, timeOutDuration );
	}

	/*
	--- myCreateUI function -------------------------------------------------------------------------------------------

	This function creates the UI

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateUI ( ) {

		if ( document.getElementById ( 'TravelNotes-ErrorsUI' ) ) {
			return;
		}

		myErrorDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ErrorsUI',
				className : 'TravelNotes-ErrorsUI-Hidden'
			},
			document.querySelector ( 'body' )
		);

	}

	/*
	--- ErrorsUI object ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return {

		createUI : ( ) => myCreateUI ( ),

		showError : error => myShow ( error, 'Error' ),

		showWarning : warning => myShow ( warning, 'Warning' ),

		showInfo : info => myShow ( info, 'Info' ),

		showHelp : help => myShow ( help, 'Help' )

	};
}

const theErrorsUI = newErrorsUI ( );

export { theErrorsUI };

/*
--- End of ErrorsUI.js file --------------------------------------------------------------------------------------
*/