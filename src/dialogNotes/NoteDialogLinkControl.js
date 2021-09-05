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
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file NoteDialogLinkControl.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module dialogNotes
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theTranslator from '../UILib/Translator.js';
import theConfig from '../data/Config.js';
import {
	AllControlsFocusEL,
	UrlInputBlurEL,
	AllControlsInputEL
} from '../dialogNotes/NoteDialogEventListeners.js';

import { ZERO, ONE, LAT_LNG } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogLinkControl
@classdesc This class is the url control of the NoteDialog
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogLinkControl {

	/**
	A reference to the noteDialog
	@private
	*/

	#noteDialog = null;

	/**
	HTMLElements
	@private
	*/

	#linkHeaderDiv = null;
	#linkInputDiv = null;
	#linkInput = null;

	/**
	Event listeners
	@private
	*/

	#eventListeners = {
		onFocusControl : null,
		onInputUpdated : null,
		onBlurUrlInput : null
	}

	/**
	The Devil button...
	@private
	*/

	#createTheDevilButton ( latLng ) {
		if ( theConfig.noteDialog.theDevil.addButton ) {
			theHTMLElementsFactory.create (
				'text',
				{
					value : '👿'
				},
				theHTMLElementsFactory.create (
					'a',
					{
						href : 'https://www.google.com/maps/@' +
							latLng [ ZERO ].toFixed ( LAT_LNG.fixed ) + ',' +
							latLng [ ONE ].toFixed ( LAT_LNG.fixed ) + ',' +
							theConfig.noteDialog.theDevil.zoomFactor + 'z',
						target : '_blank',
						title : 'Reminder! The devil will know everything about you'
					},
					theHTMLElementsFactory.create (
						'div',
						{
							className : 'TravelNotes-BaseDialog-Button',
							title : 'Reminder! The devil will know everything about you'
						},
						this.#linkHeaderDiv
					)
				)
			);
		}
	}

	/*
	constructor
	*/

	constructor ( noteDialog, latLng ) {
		Object.freeze ( this );
		this.#noteDialog = noteDialog;
		this.#linkHeaderDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv'
			}
		);

		this.#createTheDevilButton ( latLng );

		theHTMLElementsFactory.create (
			'text',
			{
				value : theTranslator.getText ( 'NoteDialog - Link' )
			},
			this.#linkHeaderDiv
		);

		this.#linkInputDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv'
			}
		);

		this.#linkInput = theHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				dataset : { Name : 'url' }
			},
			this.#linkInputDiv
		);

		this.#eventListeners.onFocusControl = new AllControlsFocusEL ( this.#noteDialog, true );
		this.#eventListeners.onInputUpdated = new AllControlsInputEL ( this.#noteDialog );
		this.#eventListeners.onBlurUrlInput = new UrlInputBlurEL ( this.#noteDialog );
		this.#linkInput.addEventListener ( 'focus', this.#eventListeners.onFocusControl );
		this.#linkInput.addEventListener ( 'input', this.#eventListeners.onInputUpdated );
		this.#linkInput.addEventListener ( 'blur', this.#eventListeners.onBlurUrlInput );
	}

	destructor ( ) {
		this.#linkInput.removeEventListener ( 'focus', this.#eventListeners.onFocusControl );
		this.#linkInput.removeEventListener ( 'input', this.#eventListeners.onInputUpdated );
		this.#linkInput.removeEventListener ( 'blur', this.#eventListeners.onBlurUrlInput );
		this.#eventListeners.onFocusControl.destructor ( );
		this.#eventListeners.onInputUpdated.destructor ( );
		this.#eventListeners.onBlurUrlInput.destructor ( );
		this.#noteDialog = null;
	}

	/**
	return an array with the HTML elements of the control
	@readonly
	*/

	get HTMLElements ( ) { return [ this.#linkHeaderDiv, this.#linkInputDiv ]; }

	/**
	The url value in the control
	*/

	get url ( ) { return this.#linkInput.value; }

	set url ( Value ) { this.#linkInput.value = Value; }

}

export default NoteDialogLinkControl;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogLinkControl.js file

@------------------------------------------------------------------------------------------------------------------------------
*/