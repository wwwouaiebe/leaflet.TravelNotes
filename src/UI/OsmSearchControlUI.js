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

@file OsmSearchControlUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module osmSearchPaneUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import OsmSearchToolbarUI from '../UI/OsmSearchToolbarUI.js';
import OsmSearchTreeUI from '../UI/OsmSearchTreeUI.js';
import OsmSearchWaitUI from '../UI/OsmSearchWaitUI.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class OsmSearchControlUI
@classdesc This class add or remove the search toolbar and search tree on the pane control
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class OsmSearchControlUI {

	/**
	A reference to the OsmSearchTreeUI object
	@private
	*/

	#osmSearchTreeUI = null;

	/**
	A reference to the OsmSearchToolbarUI object
	@private
	*/

	#osmSearchToolbar = null;

	/**
	A reference to the OsmSearchWaitUI Object
	@private
	*/

	#osmSearchWaitUI = null;

	/**
	A reference to the pane control html element
	@private
	*/

	#paneControl = null;

	/*
	constructor
	*/

	constructor ( paneControl ) {
		Object.freeze ( this );
		this.#paneControl = paneControl;
		this.#osmSearchTreeUI = new OsmSearchTreeUI ( );
		this.#osmSearchWaitUI = new OsmSearchWaitUI ( );
		this.#osmSearchToolbar = new OsmSearchToolbarUI ( this.#osmSearchTreeUI, this.#osmSearchWaitUI );
	}

	/**
	Add the treeHTMLElement to the paneControl
	*/

	addControl ( ) {
		this.#paneControl.appendChild ( this.#osmSearchToolbar.toolbarHTMLElement );
		this.#paneControl.appendChild ( this.#osmSearchTreeUI.treeHTMLElement );
		this.#paneControl.appendChild ( this.#osmSearchWaitUI.waitHTMLElement );
	}

	/**
	Remove thetreeHTMLElement from the paneControl
	*/

	clearControl ( ) {
		this.#paneControl.removeChild ( this.#osmSearchTreeUI.treeHTMLElement );
		this.#paneControl.removeChild ( this.#osmSearchToolbar.toolbarHTMLElement );
		this.#osmSearchWaitUI.hideWait ( );
		this.#paneControl.removeChild ( this.#osmSearchWaitUI.waitHTMLElement );
	}
}

export default OsmSearchControlUI;

/*
--- End of osmSearchControlUI.js file -----------------------------------------------------------------------------------------
*/