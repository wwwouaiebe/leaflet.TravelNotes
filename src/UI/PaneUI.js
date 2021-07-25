import { PANE_ID } from '../util/Constants.js';

class PaneUI {

	constructor ( ) {
		this.paneDataDiv = null;
		this.paneControlDiv = null;
	}

	remove ( ) {
	}

	add ( ) {
	}

	getId ( ) {
		return PANE_ID.invalidPane;
	}

	getButtonText ( ) {
		return '';
	}

	setPaneDivs ( paneDataDiv, paneControlDiv ) {
		this.paneDataDiv = paneDataDiv;
		this.paneControlDiv = paneControlDiv;
	}
}

export default PaneUI;