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
Doc reviewed ...
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file NoteDialogTooltipControl.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module NoteDialogTooltipControl
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';
import theTranslator from '../UI/Translator.js';
import NoteDialogEventListeners from '../dialogs/NoteDialogEventListeners.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogTooltipControl
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogTooltipControl {

	#tooltipDiv = null;
	#tooltipInput = null

	#onInputControl ( ) {
		let dispatchedEvent = new Event ( 'inputupdated' );
		dispatchedEvent.data = { tooltipContent : this.#tooltipInput.value };
		this.#tooltipDiv.parentNode.parentNode.dispatchEvent ( dispatchedEvent );
	}

	constructor ( ) {
		this.#tooltipDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv',
				textContent : theTranslator.getText ( 'NoteDialog - Tooltip content' )
			}
		);
		this.#tooltipInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				dataName : 'tooltipContent'
			},
			this.#tooltipDiv
		);

		this.#tooltipInput.addEventListener ( 'focus', NoteDialogEventListeners.onFocusControl, false );
		this.#tooltipInput.addEventListener (
			'input',
			( ) => { this.#onInputControl ( ); },
			false
		);
	}

	get content ( ) { return [ this.#tooltipDiv ]; }

	get tooltipContent ( ) { return this.#tooltipInput.value; }

	set tooltipContent ( Value ) { this.#tooltipInput.value = Value; }

}

export default NoteDialogTooltipControl;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogTooltipControl.js file

@------------------------------------------------------------------------------------------------------------------------------
*/