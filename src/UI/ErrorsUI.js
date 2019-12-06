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
	--- myOnTimer function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnTimer ( ) {
		myTimerId = null;
		myErrorDiv.classList.remove ( 'TravelNotes-ErrorUI-Error' );
		myErrorDiv.classList.remove ( 'TravelNotes-ErrorUI-Warning' );
		myErrorDiv.classList.remove ( 'TravelNotes-ErrorUI-Info' );
		myErrorDiv.classList.remove ( 'TravelNotes-ErrorUI-Help' );
		myErrorDiv.classList.add ( 'TravelNotes-ErrorUI-Hidden' );
		myCancelButton.removeEventListener ( 'click', myOnTimer, false );
		myCancelButton = null;
		myShowHelpDiv = null;
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
				id : 'TravelNotes-ErrorUI-HelpInputDiv'
			},
			myErrorDiv
		);
		myShowHelpInput = myHTMLElementsFactory.create (
			'input',
			{
				id : 'TravelNotes-ErrorUI-HelpInput',
				type : 'checkbox'
			},
			myShowHelpDiv
		);
		myShowHelpInput.addEventListener (
			'change',
			( ) => { myShowHelp = myShowHelpInput.checked; },
			false
		);
		myHTMLElementsFactory.create (
			'label',
			{
				id : 'TravelNotes-ErrorUI-HelpInputLabel',
				for : 'TravelNotes-ErrorUI-HelpInput',
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
				id : 'TravelNotes-ErrorUI-Header'
			},
			myErrorDiv
		);
		myCancelButton = myHTMLElementsFactory.create (
			'span',
			{
				id : 'TravelNotes-ErrorUI-CancelButton',
				innerHTML : '&#x274c'
			},
			headerDiv
		);
		myCancelButton.addEventListener ( 'click', myOnTimer, false );
		myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ErrorUI-Message',
				innerHTML : message
			},
			myErrorDiv
		);

		myErrorDiv.classList.add ( 'TravelNotes-ErrorUI-' + errorLevel );

		if ( 'Help' === errorLevel ) {
			myAddHelpCheckbox ( );
		}

		myErrorDiv.classList.remove ( 'TravelNotes-ErrorUI-Hidden' );
		myTimerId = setTimeout ( myOnTimer, theConfig.errorUI.timeOut );
	}

	/*
	--- myCreateUI function -------------------------------------------------------------------------------------------

	This function creates the UI

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateUI ( ) {

		if ( document.getElementById ( 'TravelNotes-ErrorUI' ) ) {
			return;
		}

		myErrorDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ErrorUI',
				className : 'TravelNotes-ErrorUI-Hidden'
			},
			document.getElementsByTagName ( 'body' ) [ 0 ]
		);

	}

	/*
	--- ErrorsUI object ------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return {

		createUI : ( ) => myCreateUI ( ),

		showError : error  => myShow ( error, 'Error' ),

		showWarning : warning  => myShow ( warning, 'Warning' ),

		showInfo : info  => myShow ( info, 'Info' ),

		showHelp : help  => myShow ( help, 'Help' )

	};
}

const theErrorsUI = newErrorsUI ( );

export { theErrorsUI };

/*
--- End of ErrorsUI.js file --------------------------------------------------------------------------------------
*/