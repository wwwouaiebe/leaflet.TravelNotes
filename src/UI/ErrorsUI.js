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
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯138 : Protect the app - control html entries done by user.
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210724
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file ErrorsUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module ErrorsUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theHTMLSanitizer from '../util/HTMLSanitizer.js';
import { theTranslator } from '../UI/Translator.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class show a message on the screen
@see {@link theErrorsUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ErrorsUI {

	static #errorDiv = null;
	static #timerId = null;
	static #showHelpInput = null;
	static #showHelpDiv = null;
	static #showHelp = theConfig.errorsUI.showHelp;

	/**
	Event listener for the input change for the show help checkbox
	@private
	*/

	static #onHelpInputChange ( ) {
		ErrorsUI.#showHelp = ! ErrorsUI.#showHelpInput.checked;
	}

	/**
	Event listener for timer end
	@private
	*/

	static #onTimer ( ) {
		if ( ErrorsUI.#timerId ) {
			clearTimeout ( ErrorsUI.#timerId );
			ErrorsUI.#timerId = null;
		}
		ErrorsUI.#errorDiv.classList.remove ( 'TravelNotes-ErrorsUI-Error' );
		ErrorsUI.#errorDiv.classList.remove ( 'TravelNotes-ErrorsUI-Warning' );
		ErrorsUI.#errorDiv.classList.remove ( 'TravelNotes-ErrorsUI-Info' );
		ErrorsUI.#errorDiv.classList.remove ( 'TravelNotes-ErrorsUI-Help' );
		ErrorsUI.#errorDiv.classList.add ( 'TravelNotes-ErrorsUI-Hidden' );
		if ( ErrorsUI.#showHelpInput ) {
			ErrorsUI.#showHelpInput.removeEventListener ( 'change', ErrorsUI.#onHelpInputChange, false );
			ErrorsUI.#showHelpInput = null;
			ErrorsUI.#showHelpDiv = null;
		}
		ErrorsUI.#errorDiv.textContent = '';
	}

	/**
	This method add the show help checkbox in the help windows
	@private
	*/

	#addHelpCheckbox ( ) {
		ErrorsUI.#showHelpDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ErrorsUI-HelpInputDiv'
			},
			ErrorsUI.#errorDiv
		);
		ErrorsUI.#showHelpInput = theHTMLElementsFactory.create (
			'input',
			{
				id : 'TravelNotes-ErrorsUI-HelpInput',
				type : 'checkbox'
			},
			ErrorsUI.#showHelpDiv
		);
		ErrorsUI.#showHelpInput.addEventListener ( 'change', ErrorsUI.#onHelpInputChange, false );
		theHTMLElementsFactory.create (
			'label',
			{
				id : 'TravelNotes-ErrorsUI-HelpInputLabel',
				for : 'TravelNotes-ErrorsUI-HelpInput',
				textContent : theTranslator.getText ( 'ErrorUI - Dont show again' )
			},
			ErrorsUI.#showHelpDiv
		);
	}

	/**
	This method show the windows
	@param {string} message The message to be displayed
	@param {string} errorLevel The tpe of window to display
	@private
	*/

	#show ( message, errorLevel ) {
		if (
			( 'Error' === errorLevel && ! theConfig.errorsUI.showError )
			||
			( 'Warning' === errorLevel && ! theConfig.errorsUI.showWarning )
			||
			( 'Info' === errorLevel && ! theConfig.errorsUI.showInfo )
			||
			( 'Help' === errorLevel && ! theConfig.errorsUI.showHelp )
			||
			( 'Help' === errorLevel && ! ErrorsUI.#showHelp )
		) {
			return;
		}
		if ( ErrorsUI.#timerId ) {
			ErrorsUI.#onTimer ( );
		}
		let headerDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ErrorsUI-Header'
			},
			ErrorsUI.#errorDiv
		);
		theHTMLElementsFactory.create (
			'span',
			{
				id : 'TravelNotes-ErrorsUI-CancelButton',
				textContent : '❌'
			},
			headerDiv
		)
			.addEventListener ( 'click', ErrorsUI.#onTimer, false );

		theHTMLSanitizer.sanitizeToHtmlElement (
			message,
			theHTMLElementsFactory.create (
				'div',
				{
					id : 'TravelNotes-ErrorsUI-Message'
				},
				ErrorsUI.#errorDiv
			)
		);

		ErrorsUI.#errorDiv.classList.add ( 'TravelNotes-ErrorsUI-' + errorLevel );
		let timeOutDuration = theConfig.errorsUI.timeOut;
		if ( 'Help' === errorLevel ) {
			this.#addHelpCheckbox ( );
			timeOutDuration = theConfig.errorsUI.helpTimeOut;
		}
		ErrorsUI.#errorDiv.classList.remove ( 'TravelNotes-ErrorsUI-Hidden' );
		ErrorsUI.#timerId = setTimeout ( ErrorsUI.#onTimer, timeOutDuration );
	}

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	creates the user interface
	*/

	createUI ( ) {
		if ( ErrorsUI.#errorDiv ) {
			return;
		}
		ErrorsUI.#errorDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ErrorsUI',
				className : 'TravelNotes-ErrorsUI-Hidden'
			},
			document.body
		);
	}

	/**
	Show an error message ( a white text on a red background )
	@see theConfig.errorsUI.showError to disable or enable the error messages
	@param {string} error The error message to display
	*/

	showError ( error ) { this.#show ( error, 'Error' ); }

	/**
	Show an warning message ( a black text on an orange background )
	@see theConfig.errorsUI.showWarning to disable or enable the warning messages
	@param {string} warning The warning message to display
	*/

	showWarning ( warning ) { this.#show ( warning, 'Warning' ); }

	/**
	Show an info message ( a black text on a white background )
	@see theConfig.errorsUI.showInfo to disable or enable the info messages
	@param {string} info The info message to display
	*/

	showInfo ( info ) { this.#show ( info, 'Info' ); }

	/**
	Show a help message ( a black text on a white background )
	@see theConfig.errorsUI.showHelp to disable or enable the help messages and the
	checkbox in the UI to disable the help
	@param {string} help The help message to display
	*/

	showHelp ( help ) { this.#show ( help, 'Help' ); }

}

/**
@--------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of ErrorsUI class
@type {ErrorsUI}
@constant
@global

@--------------------------------------------------------------------------------------------------------------------------
*/

const theErrorsUI = new ErrorsUI ( );

export default theErrorsUI;

/*
--- End of ErrorsUI.js file ---------------------------------------------------------------------------------------------------
*/