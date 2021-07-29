import BaseDialogV3 from '../dialogs/BaseDialogV3.js';
import NoteDialogToolbarV3 from '../dialogs/NoteDialogToolbarV3.js';
import NoteDialogIconDimsControl from '../dialogs/NoteDialogIconDimsControl.js';
import NoteDialogIconControl from '../dialogs/NoteDialogIconControl.js';
import NoteDialogTooltipControl from '../dialogs/NoteDialogTooltipControl.js';
import NoteDialogPopupControl from '../dialogs/NoteDialogPopupControl.js';
import NoteDialogAddressControl from '../dialogs/NoteDialogAddressControl.js';
import NoteDialogLinkControl from '../dialogs/NoteDialogLinkControl.js';
import NoteDialogPhoneControl from '../dialogs/NoteDialogPhoneControl.js';
import NoteDialogEventListeners from '../dialogs/NoteDialogEventListeners.js';

class NoteDialogV3 extends BaseDialogV3 {

	#note = null
	#iconDimsControl = null;
	#iconControl = null;
	#tooltipControl = null;
	#popupControl = null;
	#addressControl = null;
	#linkControl = null;
	#phoneControl = null;

	constructor ( note ) {
		super ( );
		this.#note = note;
		this.#iconDimsControl = new NoteDialogIconDimsControl ( note );
		this.#iconControl = new NoteDialogIconControl ( note.iconContent );
		this.#tooltipControl = new NoteDialogTooltipControl ( note.tooltipContent );
		this.#popupControl = new NoteDialogPopupControl ( note.popupContent );
		this.#addressControl = new NoteDialogAddressControl ( note );
		this.#linkControl = new NoteDialogLinkControl ( note );
		this.#phoneControl = new NoteDialogPhoneControl ( note.phone );
		NoteDialogEventListeners.noteDialog = this;
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
			this.#phoneControl.content
		);
	}

	onOk ( ) {
		[ this.#note.iconWidth, this.#note.iconHeight ] = this.#iconDimsControl.value;
		this.#note.iconContent = this.#iconControl.value;
		this.#note.tooltipContent = this.#tooltipControl.value;
		this.#note.popupContent = this.#popupControl.value;
		this.#note.address = this.#addressControl.value;
		this.#note.url = this.#linkControl.value;
		this.#note.phone = this.#phoneControl.value;

		super.onOk ( );
	}

}

export default NoteDialogV3;