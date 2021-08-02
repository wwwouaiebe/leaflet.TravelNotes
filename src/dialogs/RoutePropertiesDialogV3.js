import BaseDialogV3 from '../dialogs/BaseDialogV3.js';
import theTranslator from '../UI/Translator.js';
import ColorControl from '../dialogs/ColorControl.js';

class RoutePropertiesDialogV3 extends BaseDialogV3 {

	#route = null;
	#colorControl = null;

	constructor ( route ) {
		super ( );
		this.#route = route;
		this.#colorControl = new ColorControl ( route.color );
	}

	/**
	Called after the ok button will be clicked and before the dialog will be closed.
	@return {boolean} true when the dialog can be closed, false otherwise.
	*/

	canClose ( ) {
		return true;
	}

	/**
	Get the title of the dialog
	@readonly
	*/

	get title ( ) { return theTranslator.getText ( 'RoutePropertiesDialog - Route properties' ); }

	/**
	Get an array with the HTMLElements that have to be added in the content of the dialog.
	@readonly
	*/

	get contentHTMLElements ( ) {
		return [].concat (
			this.#colorControl.HTMLElements
		);
	}

}

export default RoutePropertiesDialogV3;