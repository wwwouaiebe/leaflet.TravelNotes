import BaseDialogV3 from '../dialogs/BaseDialogV3.js';
import NoteDialogAddressControl from '../dialogs/NoteDialogAddressControl.js';
import NoteDialogLinkControl from '../dialogs/NoteDialogLinkControl.js';
import NoteDialogPhoneControl from '../dialogs/NoteDialogPhoneControl.js';
import NoteDialogEventListeners from '../dialogs/NoteDialogEventListeners.js';

class NoteDialogV3 extends BaseDialogV3 {

	#note = null
	#addressControl = null;
	#linkControl = null;
	#phoneControl = null;

	constructor ( note ) {
		super ( );
		this.#note = note;
		this.#addressControl = new NoteDialogAddressControl ( note );
		this.#linkControl = new NoteDialogLinkControl ( note );
		this.#phoneControl = new NoteDialogPhoneControl ( note.phone );
		NoteDialogEventListeners.noteDialog = this;
	}

	get content ( ) {
		return [].concat (
			this.#addressControl.content,
			this.#linkControl.content,
			this.#phoneControl.content
		);
	}

	onOk ( ) {
		this.#note.address = this.#addressControl.value;
		this.#note.url = this.#linkControl.value;
		this.#note.phone = this.#phoneControl.value;

		super.onOk ( );
	}

}

export default NoteDialogV3;