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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210730
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
import { FocusControlEventListener, InputUpdatedEventListener } from '../dialogs/NoteDialogEventListeners.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogTooltipControl
@classdesc This class is the tooltipContent control of the NoteDialog
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogTooltipControl {

	#noteDialog = null;
	#tooltipDiv = null;
	#tooltipInput = null

	constructor ( noteDialog ) {
		this.#noteDialog = noteDialog;
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
				dataset : { Name : 'tooltipContent' }
			},
			this.#tooltipDiv
		);

		this.#tooltipInput.addEventListener ( 'focus', new FocusControlEventListener ( this.#noteDialog, false ) );
		this.#tooltipInput.addEventListener ( 'input', new InputUpdatedEventListener ( this.#noteDialog ) );
	}

	/**
	return an array with the HTML elements of the control
	@readonly
	*/

	get HTMLElements ( ) { return [ this.#tooltipDiv ]; }

	get tooltipContent ( ) { return this.#tooltipInput.value; }

	set tooltipContent ( Value ) { this.#tooltipInput.value = Value; }

}

export default NoteDialogTooltipControl;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogTooltipControl.js file

@------------------------------------------------------------------------------------------------------------------------------
*/