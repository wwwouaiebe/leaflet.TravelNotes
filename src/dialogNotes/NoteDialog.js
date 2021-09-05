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
	- v1.0.0:
		- created
	- v1.3.0:
		- changed message
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- added reset button for address
		- added svg icons
		- reviewed code
		- added language for TravelNotesDialogXX.json file
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
		- Issue ♯66 : Work with promises for dialogs
		- Issue ♯68 : Review all existing promises.
		- Issue ♯76 : Add a devil button in the noteDialog.
	- v1.11.0:
		- Issue ♯110 : Add a command to create a SVG icon from osm for each maneuver
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯138 : Protect the app - control html entries done by user.
		- Issue ♯144 : Add an error message when a bad json file is loaded from the noteDialog
	- v2.2.0:
		- Issue ♯64 : Improve geocoding
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file NoteDialog.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module dialogNotes

@------------------------------------------------------------------------------------------------------------------------------
*/

import BaseDialog from '../dialogBase/BaseDialog.js';
import NoteDialogToolbar from '../dialogNotes/NoteDialogToolbar.js';
import NoteDialogIconDimsControl from '../dialogNotes/NoteDialogIconDimsControl.js';
import NoteDialogIconControl from '../dialogNotes/NoteDialogIconControl.js';
import NoteDialogTooltipControl from '../dialogNotes/NoteDialogTooltipControl.js';
import NoteDialogPopupControl from '../dialogNotes/NoteDialogPopupControl.js';
import NoteDialogAddressControl from '../dialogNotes/NoteDialogAddressControl.js';
import NoteDialogLinkControl from '../dialogNotes/NoteDialogLinkControl.js';
import NoteDialogPhoneControl from '../dialogNotes/NoteDialogPhoneControl.js';
import NoteDialogPreviewControl from '../dialogNotes/NoteDialogPreviewControl.js';
import { NoteDialogGeoCoderHelper } from '../dialogNotes/NoteDialogEventListeners.js';
import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';
import theTranslator from '../UILib/Translator.js';
import Note from '../data/Note.js';
import theConfig from '../data/Config.js';

import { ZERO, ONE } from '../main/Constants.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class NoteDialog
@classdesc This class create and manage the NoteDialog
@extends BaseDialog
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialog extends BaseDialog {

	/**
	the currently edited note
	@private
	*/

	#note = null;

	/**
	A boolean indicating to start the geocoder when opening the dialog box.
	@private
	*/

	#startGeoCoder = false;

	/**
	The route ObjId on witch the note is attached
	@private
	*/

	#routeObjId = null;

	/**
	A clone of the #note used to store the modifications and display the preview
	@private
	*/

	#previewNote = null;

	/**
	The controls
	@private
	*/

	#iconDimsControl = null;
	#iconControl = null;
	#tooltipControl = null;
	#popupControl = null;
	#addressControl = null;
	#linkControl = null;
	#phoneControl = null;
	#previewControl = null;

	/**
	the toolbar
	@private
	*/

	#toolbar = null;

	/**
	The control that have currently the focusControl
	@private
	*/

	#focusControl = null;

	/*
	constructor
	*/

	constructor ( note, routeObjId, startGeoCoder ) {
		super ( );
		this.#note = note;
		this.#startGeoCoder = startGeoCoder;
		this.#routeObjId = routeObjId;

		this.#previewNote = new Note ( );
		this.#previewNote.jsonObject = note.jsonObject;

		this.#toolbar = new NoteDialogToolbar ( this );
		this.#iconDimsControl = new NoteDialogIconDimsControl ( this );
		this.#iconControl = new NoteDialogIconControl ( this );
		this.#tooltipControl = new NoteDialogTooltipControl ( this );
		this.#popupControl = new NoteDialogPopupControl ( this );
		this.#addressControl = new NoteDialogAddressControl ( this, note.latLng, startGeoCoder );
		this.#linkControl = new NoteDialogLinkControl ( this, note.latLng );
		this.#phoneControl = new NoteDialogPhoneControl ( this );
		this.#previewControl = new NoteDialogPreviewControl ( this.#previewNote );

		this.setControlsValues ( note );
	}

	#destructor ( ) {
		this.#toolbar.destructor ( );
		this.#iconDimsControl.destructor ( );
		this.#iconControl.destructor ( );
		this.#tooltipControl.destructor ( );
		this.#popupControl.destructor ( );
		this.#addressControl.destructor ( );
		this.#linkControl.destructor ( );
		this.#phoneControl.destructor ( );

	}

	/**
	The control that have currently the focus. Used for toolbar buttons
	*/

	set focusControl ( focusControl ) { this.#focusControl = focusControl; }

	get focusControl ( ) { return this.#focusControl; }

	/**
	Data needed for the map svg icon
	@readonly
	*/

	get mapIconData ( ) { return Object.freeze ( { latLng : this.#previewNote.latLng, routeObjId : this.#routeObjId } ); }

	/**
	Update the preview of the icons. Used by event listeners
	*/

	updatePreview ( noteData ) {
		for ( const property in noteData ) {
			this.#previewNote [ property ] = noteData [ property ];
		}
		this.#previewControl.update ( );
	}

	/**
	Overload of the BaseDialog.onShow ( ) method.
	*/

	onShow ( ) {
		if ( this.#startGeoCoder ) {
			new NoteDialogGeoCoderHelper ( this ).setAddressWithGeoCoder ( this.#previewNote.latLng );
		}

		this.toogleContents ( );
	}

	/**
	Overload of the BaseDialog.canClose ( ) method.
	*/

	canClose ( ) {
		if ( '' === this.#iconControl.iconContent ) {
			this.showError ( theTranslator.getText ( 'Notedialog - The icon content cannot be empty' ) );
			return false;
		}
		if ( '' !== this.#linkControl.url ) {
			if ( '' === theHTMLSanitizer.sanitizeToUrl ( this.#linkControl.url ).url ) {
				this.showError ( theTranslator.getText ( 'NoteDialog - invalidUrl' ) );
				return false;
			}
		}

		return true;
	}

	onCancel ( ) {
		this.#destructor ( );
		super.onCancel ( );
	}

	onOk ( ) {
		if ( super.onOk ( ) ) {

			// saving values in the note.
			this.getControlsValues ( this.#note );

			// latLng can change for map icons, so we save the value from the preview note
			this.#note.latLng = this.#previewNote.latLng;

			// Sanitizing the html code entered by the user
			this.#note.validateData ( );
			this.#destructor ( );
		}
	}

	/**
	Return the dialog title. Overload of the BaseDialog.title property
	@readonly
	*/

	get title ( ) { return theTranslator.getText ( 'NoteDialog - Note' ); }

	/**
	Get an array with the HTMLElements that have to be added in the content of the dialog.
	@readonly
	*/

	get contentHTMLElements ( ) {
		return [].concat (
			this.#toolbar.rootHTMLElement,
			this.#iconDimsControl.HTMLElements,
			this.#iconControl.HTMLElements,
			this.#tooltipControl.HTMLElements,
			this.#popupControl.HTMLElements,
			this.#addressControl.HTMLElements,
			this.#linkControl.HTMLElements,
			this.#phoneControl.HTMLElements
		);
	}

	/**
	Get an array with the HTMLElements that have to be added in the footer of the dialog
	@readonly
	*/

	get footerHTMLElements ( ) {
		return this.#previewControl.HTMLElements;
	}

	/**
	set the control values
	@param {Object} source An object with all the properties to update
	*/

	setControlsValues ( source ) {
		this.#iconDimsControl.iconHeight = source.iconHeight || this.#iconDimsControl.iconHeight;
		this.#iconDimsControl.iconWidth = source.iconWidth || this.#iconDimsControl.iconWidth;
		this.#iconControl.iconContent = source.iconContent || this.#iconControl.iconContent;
		this.#tooltipControl.tooltipContent = source.tooltipContent || this.#tooltipControl.tooltipContent;
		this.#popupControl.popupContent = source.popupContent || this.#popupControl.popupContent;
		this.#addressControl.address = source.address || this.#addressControl.address;
		this.#linkControl.url = source.url || this.#linkControl.url;
		this.#phoneControl.phone = source.phone || this.#phoneControl.phone;
	}

	/**
	put all the control values in the destination object
	@param {Object} destination. The object in witch the values will be added
	*/

	getControlsValues ( destination ) {
		destination.iconWidth = this.#iconDimsControl.iconHeight;
		destination.iconHeight = this.#iconDimsControl.iconWidth;
		destination.iconContent = this.#iconControl.iconContent;
		destination.tooltipContent = this.#tooltipControl.tooltipContent;
		destination.popupContent = this.#popupControl.popupContent;
		destination.address = this.#addressControl.address;
		destination.url = this.#linkControl.url;
		destination.phone = this.#phoneControl.phone;
	}

	/**
	Show or hide the dialog controls
	*/

	toogleContents ( ) {
		if ( theConfig.noteDialog.mask.iconsDimension ) {
			this.#iconDimsControl.HTMLElements [ ZERO ].classList.toggle ( 'TravelNotes-Hidden' );
		}
		if ( theConfig.noteDialog.mask.iconTextArea ) {
			this.#iconControl.HTMLElements [ ZERO ].classList.toggle ( 'TravelNotes-Hidden' );
		}
		if ( theConfig.noteDialog.mask.popupContent ) {
			this.#popupControl.HTMLElements [ ZERO ].classList.toggle ( 'TravelNotes-Hidden' );
		}
		if ( theConfig.noteDialog.mask.tooltip ) {
			this.#tooltipControl.HTMLElements [ ZERO ].classList.toggle ( 'TravelNotes-Hidden' );
		}
		if ( theConfig.noteDialog.mask.address ) {
			this.#addressControl.HTMLElements [ ZERO ].classList.toggle ( 'TravelNotes-Hidden' );
			this.#addressControl.HTMLElements [ ONE ].classList.toggle ( 'TravelNotes-Hidden' );
		}
		if ( theConfig.noteDialog.mask.link ) {
			this.#linkControl.HTMLElements [ ZERO ].classList.toggle ( 'TravelNotes-Hidden' );
			this.#linkControl.HTMLElements [ ONE ].classList.toggle ( 'TravelNotes-Hidden' );
		}
		if ( theConfig.noteDialog.mask.phone ) {
			this.#phoneControl.HTMLElements [ ZERO ].classList.toggle ( 'TravelNotes-Hidden' );
			this.#phoneControl.HTMLElements [ ONE ].classList.toggle ( 'TravelNotes-Hidden' );
		}
	}

}

export default NoteDialog;

/*
--- End of NoteDialog.js file -------------------------------------------------------------------------------------------------
*/