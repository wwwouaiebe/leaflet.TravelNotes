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
		- Issue #120 : Review the UserInterface
	- v2.0.0:
		- Issue #135 : Remove innerHTML from code
		- Issue #138 : Protect the app - control html entries done by user.
Doc reviewed 20200821
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

import { theConfig } from '../data/Config.js';
import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theHTMLSanitizer } from '../util/HTMLSanitizer.js';
import { theTranslator } from '../UI/Translator.js';

let ourErrorDiv = null;
let ourTimerId = null;
let ourShowHelpInput = null;
let ourShowHelpDiv = null;
let ourShowHelp = theConfig.errorUI.showHelp;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnHelpInputChange
@desc Event listener for the input change for the show help checkbox
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnHelpInputChange ( ) {
	ourShowHelp = ! ourShowHelpInput.checked;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnTimer
@desc Event listener for timer end
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnTimer ( ) {
	if ( ourTimerId ) {
		clearTimeout ( ourTimerId );
		ourTimerId = null;
	}
	ourErrorDiv.classList.remove ( 'TravelNotes-ErrorsUI-Error' );
	ourErrorDiv.classList.remove ( 'TravelNotes-ErrorsUI-Warning' );
	ourErrorDiv.classList.remove ( 'TravelNotes-ErrorsUI-Info' );
	ourErrorDiv.classList.remove ( 'TravelNotes-ErrorsUI-Help' );
	ourErrorDiv.classList.add ( 'TravelNotes-ErrorsUI-Hidden' );
	if ( ourShowHelpInput ) {
		ourShowHelpInput.removeEventListener ( 'change', ourOnHelpInputChange, false );
		ourShowHelpInput = null;
		ourShowHelpDiv = null;
	}
	ourErrorDiv.textContent = '';
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourAddHelpCheckbox
@desc This method add the show help checkbox in the help windows
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourAddHelpCheckbox ( ) {
	ourShowHelpDiv = theHTMLElementsFactory.create (
		'div',
		{
			id : 'TravelNotes-ErrorsUI-HelpInputDiv'
		},
		ourErrorDiv
	);
	ourShowHelpInput = theHTMLElementsFactory.create (
		'input',
		{
			id : 'TravelNotes-ErrorsUI-HelpInput',
			type : 'checkbox'
		},
		ourShowHelpDiv
	);
	ourShowHelpInput.addEventListener ( 'change', ourOnHelpInputChange, false );
	theHTMLElementsFactory.create (
		'label',
		{
			id : 'TravelNotes-ErrorsUI-HelpInputLabel',
			for : 'TravelNotes-ErrorsUI-HelpInput',
			textContent : theTranslator.getText ( 'ErrorUI - Dont show again' )
		},
		ourShowHelpDiv
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourShow
@desc This method show the windows
@param {string} message The message to be displayed
@param {string} errorLevel The tpe of window to display
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourShow ( message, errorLevel ) {
	if (
		( 'Error' === errorLevel && ! theConfig.errorUI.showError )
		||
		( 'Warning' === errorLevel && ! theConfig.errorUI.showWarning )
		||
		( 'Info' === errorLevel && ! theConfig.errorUI.showInfo )
		||
		( 'Help' === errorLevel && ! theConfig.errorUI.showHelp )
		||
		( 'Help' === errorLevel && ! ourShowHelp )
	) {
		return;
	}
	if ( ourTimerId ) {
		ourOnTimer ( );
	}
	let headerDiv = theHTMLElementsFactory.create (
		'div',
		{
			id : 'TravelNotes-ErrorsUI-Header'
		},
		ourErrorDiv
	);
	theHTMLElementsFactory.create (
		'span',
		{
			id : 'TravelNotes-ErrorsUI-CancelButton',
			textContent : '❌'
		},
		headerDiv
	)
		.addEventListener ( 'click', ourOnTimer, false );

	theHTMLSanitizer.sanitizeToHtmlElement (
		message,
		theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ErrorsUI-Message'
			},
			ourErrorDiv
		)
	);

	ourErrorDiv.classList.add ( 'TravelNotes-ErrorsUI-' + errorLevel );
	let timeOutDuration = theConfig.errorUI.timeOut;
	if ( 'Help' === errorLevel ) {
		ourAddHelpCheckbox ( );
		timeOutDuration = theConfig.errorUI.helpTimeOut;
	}
	ourErrorDiv.classList.remove ( 'TravelNotes-ErrorsUI-Hidden' );
	ourTimerId = setTimeout ( ourOnTimer, timeOutDuration );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class show a message on the screen
@see {@link theErrorsUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ErrorsUI {

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	creates the user interface
	*/

	createUI ( ) {
		if ( ourErrorDiv ) {
			return;
		}
		ourErrorDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-ErrorsUI',
				className : 'TravelNotes-ErrorsUI-Hidden'
			},
			document.querySelector ( 'body' )
		);
	}

	/**
	Show an error message ( a white text on a red background )
	@see theConfig.errorUI.showError to disable or enable the error messages
	@param {string} error The error message to display
	*/

	showError ( error ) { ourShow ( error, 'Error' ); }

	/**
	Show an warning message ( a black text on an orange background )
	@see theConfig.errorUI.showWarning to disable or enable the warning messages
	@param {string} warning The warning message to display
	*/

	showWarning ( warning ) { ourShow ( warning, 'Warning' ); }

	/**
	Show an info message ( a black text on a white background )
	@see theConfig.errorUI.showInfo to disable or enable the info messages
	@param {string} info The info message to display
	*/

	showInfo ( info ) { ourShow ( info, 'Info' ); }

	/**
	Show a help message ( a black text on a white background )
	@see theConfig.errorUI.showHelp to disable or enable the help messages and the
	checkbox in the UI to disable the help
	@param {string} help The help message to display
	*/

	showHelp ( help ) { ourShow ( help, 'Help' ); }

}

const ourErrorsUI = new ErrorsUI ( );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of ErrorsUI class
	@type {ErrorsUI}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourErrorsUI as theErrorsUI
};

/*
--- End of ErrorsUI.js file ---------------------------------------------------------------------------------------------------
*/