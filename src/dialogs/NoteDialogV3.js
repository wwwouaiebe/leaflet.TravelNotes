import BaseDialogV3 from '../dialogs/BaseDialogV3.js';
import NoteDialogToolbarV3 from '../dialogs/NoteDialogToolbarV3.js';
import NoteDialogIconDimsControl from '../dialogs/NoteDialogIconDimsControl.js';
import NoteDialogIconControl from '../dialogs/NoteDialogIconControl.js';
import NoteDialogTooltipControl from '../dialogs/NoteDialogTooltipControl.js';
import NoteDialogPopupControl from '../dialogs/NoteDialogPopupControl.js';
import NoteDialogAddressControl from '../dialogs/NoteDialogAddressControl.js';
import NoteDialogLinkControl from '../dialogs/NoteDialogLinkControl.js';
import NoteDialogPhoneControl from '../dialogs/NoteDialogPhoneControl.js';
import NoteDialogPreviewControl from '../dialogs/NoteDialogPreviewControl.js';
import NoteDialogEventListeners from '../dialogs/NoteDialogEventListeners.js';

import Note from '../data/Note.js';

class NoteDialogV3 extends BaseDialogV3 {

	#note = null;
	#startGeoCoder = false;
	#previewNote = null;

	#iconDimsControl = null;
	#iconControl = null;
	#tooltipControl = null;
	#popupControl = null;
	#addressControl = null;
	#linkControl = null;
	#phoneControl = null;
	#previewControl = null;

	constructor ( note, routeObjId, startGeoCoder ) {
		super ( );
		this.#note = note;
		this.#startGeoCoder = startGeoCoder;
		NoteDialogEventListeners.previewNote = new Note ( );
		NoteDialogEventListeners.previewNote.jsonObject = note.jsonObject;

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
	}

	updatePreview ( ) {
		this.#previewControl.update ( );
	}

	onShow ( ) {
		this.container.addEventListener ( 'inputupdated', NoteDialogEventListeners.onInputUpdated );
		if ( this.#startGeoCoder ) {
			this.#addressControl.startGeoCoder ( );
		}
	}

	get content ( ) {

		return [].concat (
			new NoteDialogToolbarV3 ( ).content,
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

	onOk ( ) {
		this.getControlsValues ( this.#note );
		super.onOk ( );
	}

}

export default NoteDialogV3;