import BaseDialogV3 from '../dialogs/BaseDialogV3.js';
import NoteDialogPhoneContent from '../dialogs/NoteDialogPhoneContent.js';
import NoteDialogLinkContent from '../dialogs/NoteDialogLinkContent.js';

class NoteDialogV3 extends BaseDialogV3 {

	#note = null
	#linkContent = null;
	#phoneContent = null;

	constructor ( note ) {
		super ( );
		this.#note = note;
		this.#linkContent = new NoteDialogLinkContent ( note );
		this.#phoneContent = new NoteDialogPhoneContent ( note.phone );
	}

	get content ( ) {
		return [].concat (
			this.#linkContent.content,
			this.#phoneContent.content
		);
	}

	onOk ( ) {
		this.#note.url = this.#linkContent.value;
		this.#note.phone = this.#phoneContent.value;

		super.onOk ( );
	}

}

export default NoteDialogV3;