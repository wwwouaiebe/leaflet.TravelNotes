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
Doc reviewed 20210901
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

@module errorsUI

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';
import theTranslator from '../UILib/Translator.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class show a message on the screen
@see {@link theErrorsUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ErrorsUI {

	/**
	@private
	*/

	#mainHTMLElement = null;

	/**
	@private
	*/

	#messageHTMLElement = null;

	/**
	@private
	*/

	#timerId = null;

	/**
	@private
	*/

	#showHelpInput = null;

	/**
	@private
	*/

	#showHelpHTMLElement = null;

	/**
	@private
	*/

	#showHelp = theConfig.errorsUI.showHelp;

	/**
	Event listener for the input change for the show help checkbox
	@private
	*/

	#onHelpInputChange ( ) {
		this.#showHelp = ! this.#showHelpInput.checked;
	}

	/**
	Hide the help window
	@private
	*/

	#hide ( ) {
		if ( this.#timerId ) {
			clearTimeout ( this.#timerId );
			this.#timerId = null;
		}
		this.#mainHTMLElement.classList.remove ( 'TravelNotes-ErrorsUI-Error' );
		this.#mainHTMLElement.classList.remove ( 'TravelNotes-ErrorsUI-Warning' );
		this.#mainHTMLElement.classList.remove ( 'TravelNotes-ErrorsUI-Info' );
		this.#mainHTMLElement.classList.remove ( 'TravelNotes-ErrorsUI-Help' );
		this.#mainHTMLElement.classList.add ( 'TravelNotes-Hidden' );
		this.#showHelpHTMLElement.classList.add ( 'TravelNotes-Hidden' );
		this.#messageHTMLElement.textContent = '';
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
			( 'Help' === errorLevel && ! this.#showHelp )
		) {
			return;
		}
		if ( this.#timerId ) {
			clearTimeout ( this.#timerId );
			this.#timerId = null;
		}
		theHTMLSanitizer.sanitizeToHtmlElement ( message, this.#messageHTMLElement );
		this.#mainHTMLElement.classList.add ( 'TravelNotes-ErrorsUI-' + errorLevel );
		this.#mainHTMLElement.classList.remove ( 'TravelNotes-Hidden' );

		let timeOutDuration = theConfig.errorsUI.timeOut;
		if ( 'Help' === errorLevel ) {
			this.#showHelpHTMLElement.classList.remove ( 'TravelNotes-Hidden' );
			timeOutDuration = theConfig.errorsUI.helpTimeOut;
		}
		this.#timerId = setTimeout ( ( ) => this.#hide ( ), timeOutDuration );
	}

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	creates the user interface
	*/

	createUI ( ) {
		if ( this.#mainHTMLElement ) {
			return;
		}
		this.#mainHTMLElement = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ErrorsUI',
				className : 'TravelNotes-Hidden'
			},
			document.body
		);
		let headerDiv = theHTMLElementsFactory.create ( 'div', null, this.#mainHTMLElement );
		theHTMLElementsFactory.create (
			'span',
			{
				id : 'TravelNotes-ErrorsUI-CancelButton',
				textContent : '❌'
			},
			headerDiv
		)
			.addEventListener ( 'click', ( ) => this.#hide ( ), false );
		this.#messageHTMLElement = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ErrorsUI-Message'
			},
			this.#mainHTMLElement
		);
		this.#showHelpHTMLElement = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ErrorsUI-HelpInputDiv',
				className : 'TravelNotes-Hidden'
			},
			this.#mainHTMLElement
		);
		this.#showHelpInput = theHTMLElementsFactory.create (
			'input',
			{
				id : 'TravelNotes-ErrorsUI-HelpInput',
				type : 'checkbox'
			},
			this.#showHelpHTMLElement
		);
		this.#showHelpInput.addEventListener ( 'change', ( ) => this.#onHelpInputChange ( ), false );
		theHTMLElementsFactory.create (
			'label',
			{
				id : 'TravelNotes-ErrorsUI-HelpInputLabel',
				htmlFor : 'TravelNotes-ErrorsUI-HelpInput',
				textContent : theTranslator.getText ( 'ErrorUI - Dont show again' )
			},
			this.#showHelpHTMLElement
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