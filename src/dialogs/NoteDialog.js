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
Doc reviewed 20210730
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

@module NoteDialog
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import BaseDialogV3 from '../dialogs/BaseDialogV3.js';
import NoteDialogToolbar from '../dialogs/NoteDialogToolbar.js';
import NoteDialogIconDimsControl from '../dialogs/NoteDialogIconDimsControl.js';
import NoteDialogIconControl from '../dialogs/NoteDialogIconControl.js';
import NoteDialogTooltipControl from '../dialogs/NoteDialogTooltipControl.js';
import NoteDialogPopupControl from '../dialogs/NoteDialogPopupControl.js';
import NoteDialogAddressControl from '../dialogs/NoteDialogAddressControl.js';
import NoteDialogLinkControl from '../dialogs/NoteDialogLinkControl.js';
import NoteDialogPhoneControl from '../dialogs/NoteDialogPhoneControl.js';
import NoteDialogPreviewControl from '../dialogs/NoteDialogPreviewControl.js';
import NoteDialogEventListeners from '../dialogs/NoteDialogEventListeners.js';
import theHTMLSanitizer from '../util/HTMLSanitizer.js';
import theTranslator from '../UI/Translator.js';
import Note from '../data/Note.js';
import theConfig from '../data/Config.js';

import { ZERO, ONE } from '../util/Constants.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class NoteDialog
@classdesc This class create and manage the NoteDialog
@extends BaseDialogV3
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialog extends BaseDialogV3 {

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
	A clone of the #note used to store the modifications and display the preview
	@private
	*/

	#previewNote = null;

	/**
	Controls
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

	constructor ( note, routeObjId, startGeoCoder ) {
		super ( );
		this.#note = note;
		this.#startGeoCoder = startGeoCoder;
		NoteDialogEventListeners.routeObjId = routeObjId;

		NoteDialogEventListeners.previewNote = new Note ( );
		NoteDialogEventListeners.previewNote.jsonObject = note.jsonObject;

		this.#toolbar = new NoteDialogToolbar ( );
		this.#iconDimsControl = new NoteDialogIconDimsControl ( );
		this.#iconControl = new NoteDialogIconControl ( );
		this.#tooltipControl = new NoteDialogTooltipControl ( );
		this.#popupControl = new NoteDialogPopupControl ( );
		this.#addressControl = new NoteDialogAddressControl ( note.latLng, startGeoCoder );
		this.#linkControl = new NoteDialogLinkControl ( note.latLng );
		this.#phoneControl = new NoteDialogPhoneControl ( );

		this.#previewControl = new NoteDialogPreviewControl ( );

		NoteDialogEventListeners.noteDialog = this;
		this.setControlsValues ( note );
		Object.seal ( this );
	}

	/**
	Update the toolbar. Called when new toolbar buttons and predefined icons are loaded
	*/

	updateToolbar ( ) {
		this.#toolbar.update ( );
	}

	/**
	Update the preview of the icons. Used by event listeners
	*/

	updatePreview ( ) {
		this.#previewControl.update ( );
	}

	/**
	Overload of the BaseDialog.onShow ( ) method.
	*/

	onShow ( ) {
		if ( this.#startGeoCoder ) {
			NoteDialogEventListeners.setAddressWithGeoCoder ( );
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

		// saving values in the note.
		this.getControlsValues ( this.#note );

		// latLng can change for map icons, so we save the value from the preview note
		this.#note.latLng = NoteDialogEventListeners.previewNote.latLng;

		// Sanitizing the html code entered by the user
		this.#note.validateData ( );

		return true;
	}

	/**
	Overload of the BaseDialog.onCancel ( ) method. Called when the cancel button is clicked
	*/

	onCancel ( ) {
		NoteDialogEventListeners.reset ( );
		super.onCancel ( );
	}

	/**
	Overload of the BaseDialog.onOk ( ) method. Called when the Ok button is clicked
	*/

	onOk ( ) {
		NoteDialogEventListeners.reset ( );
		super.onOk ( );
	}

	/**
	Return the dialog title. Overload of the BaseDialog.title property
	@readonly
	*/

	get title ( ) { return theTranslator.getText ( 'NoteDialog - Note' ); }

	/**
	return the content of the dialog box. Overload of the BaseDialog.content property
	@readonly
	*/

	get content ( ) {
		return [].concat (
			this.#toolbar.content,
			this.#iconDimsControl.content,
			this.#iconControl.content,
			this.#tooltipControl.content,
			this.#popupControl.content,
			this.#addressControl.content,
			this.#linkControl.content,
			this.#phoneControl.content,
			this.#previewControl.content
		);
	}

	/**
	return the footer of the dialog box. Overload of the BaseDialog.footer property
	@readonly
	*/

	get footer ( ) {
		return [].concat (
			this.#previewControl.content
		);
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
			this.#iconDimsControl.content [ ZERO ].classList.toggle ( 'TravelNotes-Hidden' );
		}
		if ( theConfig.noteDialog.mask.iconTextArea ) {
			this.#iconControl.content [ ZERO ].classList.toggle ( 'TravelNotes-Hidden' );
		}
		if ( theConfig.noteDialog.mask.popupContent ) {
			this.#popupControl.content [ ZERO ].classList.toggle ( 'TravelNotes-Hidden' );
		}
		if ( theConfig.noteDialog.mask.tooltip ) {
			this.#tooltipControl.content [ ZERO ].classList.toggle ( 'TravelNotes-Hidden' );
		}
		if ( theConfig.noteDialog.mask.address ) {
			this.#addressControl.content [ ZERO ].classList.toggle ( 'TravelNotes-Hidden' );
			this.#addressControl.content [ ONE ].classList.toggle ( 'TravelNotes-Hidden' );
		}
		if ( theConfig.noteDialog.mask.link ) {
			this.#linkControl.content [ ZERO ].classList.toggle ( 'TravelNotes-Hidden' );
			this.#linkControl.content [ ONE ].classList.toggle ( 'TravelNotes-Hidden' );
		}
		if ( theConfig.noteDialog.mask.phone ) {
			this.#phoneControl.content [ ZERO ].classList.toggle ( 'TravelNotes-Hidden' );
			this.#phoneControl.content [ ONE ].classList.toggle ( 'TravelNotes-Hidden' );
		}
	}

}

export default NoteDialog;

/*
--- End of NoteDialog.js file -------------------------------------------------------------------------------------------------
*/