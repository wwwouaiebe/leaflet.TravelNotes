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

@file NoteDialogPreviewControl.js
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
import theNoteHTMLViewsFactory from '../viewsFactories/NoteHTMLViewsFactory.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogPreviewControl
@classdesc This class is the notePreview control of the NotDialog
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogPreviewControl {

	/**
	HTMLElements
	@private
	*/

	#previewNote = null;
	#previewDiv = null;

	/*
	constructor
	*/

	constructor ( previewNote ) {
		Object.freeze ( this );
		this.#previewNote = previewNote;
		this.#previewDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-PreviewDiv'
			}
		);
		this.#previewDiv.appendChild (
			theNoteHTMLViewsFactory.getNoteTextAndIconHTML (
				'TravelNotes-NoteDialog-',
				{ note : this.#previewNote, route : null }
			)
		);
	}

	update ( ) {
		this.#previewDiv.textContent = '';
		this.#previewDiv.appendChild (
			theNoteHTMLViewsFactory.getNoteTextAndIconHTML (
				'TravelNotes-NoteDialog-',
				{ note : this.#previewNote, route : null }
			)
		);
	}

	/**
	return an array with the HTML elements of the control
	@readonly
	*/

	get HTMLElements ( ) { return [ this.#previewDiv ]; }

}

export default NoteDialogPreviewControl;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogPreviewControl.js file

@------------------------------------------------------------------------------------------------------------------------------
*/