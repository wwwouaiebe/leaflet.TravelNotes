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
import theConfig from '../data/Config.js';

import { ZERO, ONE } from '../util/Constants.js';

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
	#toolbar = null;

	constructor ( note, routeObjId, startGeoCoder ) {
		super ( );
		this.#note = note;
		this.#startGeoCoder = startGeoCoder;
		NoteDialogEventListeners.routeObjId = routeObjId;
		NoteDialogEventListeners.previewNote = new Note ( );
		NoteDialogEventListeners.previewNote.jsonObject = note.jsonObject;

		this.#toolbar = new NoteDialogToolbarV3 ( );
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

	updateToolbar ( ) {
		this.#toolbar.update ( );
	}

	updatePreview ( ) {
		this.#previewControl.update ( );
	}

	onShow ( ) {
		if ( this.#startGeoCoder ) {
			NoteDialogEventListeners.setAddressWithGeoCoder ( );
		}

		this.toogleContents ( );
	}

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
		NoteDialogEventListeners.reset ( );
		super.onOk ( );
	}

	onCancel ( ) {
		NoteDialogEventListeners.reset ( );
		super.onCancel ( );
	}

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

export default NoteDialogV3;