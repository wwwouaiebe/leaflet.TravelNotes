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
Doc reviewed 20210726
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file osmSearchControlUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module osmSearchControlUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import OsmSearchToolbarUI from '../UI/OsmSearchToolbarUI.js';
import OsmSearchTreeUI from '../UI/OsmSearchTreeUI.js';
import OsmSearchWaitUI from '../UI/OsmSearchWaitUI.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class osmSearchControlUI
@classdesc This class add or remove the search toolbar and search tree on the pane control
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class osmSearchControlUI {

	/**
	A reference to the OsmSearchTreeUI object
	*/

	#osmSearchTreeUI = null;

	/**
	A reference to the OsmSearchToolbarUI object
	*/

	#osmSearchToolbar = null;

	/**
	A reference to the OsmSearchWaitUI Object
	*/

	#osmSearchWaitUI = null;

	constructor ( ) {
		this.#osmSearchToolbar = new OsmSearchToolbarUI ( );
		this.#osmSearchTreeUI = new OsmSearchTreeUI ( );
		this.#osmSearchWaitUI = new OsmSearchWaitUI ( );
	}

	/**
	Add the treeHTMLElement to the paneControl
	*/

	addControl ( paneControl ) {
		paneControl.appendChild ( this.#osmSearchToolbar.toolbarHTMLElement );
		paneControl.appendChild ( this.#osmSearchTreeUI.treeHTMLElement );
		paneControl.appendChild ( this.#osmSearchWaitUI.waitHTMLElement );
	}

	/**
	Remove thetreeHTMLElement from the paneControl
	*/

	clearControl ( paneControl ) {
		paneControl.removeChild ( this.#osmSearchTreeUI.treeHTMLElement );
		paneControl.removeChild ( this.#osmSearchToolbar.toolbarHTMLElement );
		this.#osmSearchWaitUI.hideWait ( );
		paneControl.removeChild ( this.#osmSearchWaitUI.waitHTMLElement );
	}
}

export default osmSearchControlUI;

/*
--- End of osmSearchControlUI.js file -----------------------------------------------------------------------------------------
*/