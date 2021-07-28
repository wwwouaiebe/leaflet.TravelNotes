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
Doc reviewed ...
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file OsmSearchWaitUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module OsmSearchWaitUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import OsmSearchToolbarUI from '../UI/OsmSearchToolbarUI.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class OsmSearchWaitUI
@classdesc This the waitUI for the OsmSearch
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class OsmSearchWaitUI {

	#waitDiv = null;
	#waitBullet = null;

	constructor ( ) {
		this.#waitDiv = theHTMLElementsFactory.create (
			'div',
			{ className : 'TravelNotes-WaitAnimation' },
		);
		OsmSearchToolbarUI.osmSearchWaitUI = this;
		this.#waitDiv.classList.add ( 'TravelNotes-Hidden' );
	}

	/**
	show the wait UI
	*/

	showWait ( ) {
		this.#waitBullet = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-WaitAnimationBullet'
			},
			this.#waitDiv
		);
		this.#waitDiv.classList.remove ( 'TravelNotes-Hidden' );
	}

	/**
	hide the wait UI
	*/

	hideWait ( ) {
		if ( this.#waitBullet ) {
			this.#waitDiv.removeChild ( this.#waitBullet );
			this.#waitBullet = null;
		}
		this.#waitDiv.classList.add ( 'TravelNotes-Hidden' );
	}

	get waitHTMLElement ( ) { return this.#waitDiv; }
}

export default OsmSearchWaitUI;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of OsmSearchWaitUI.js file

@------------------------------------------------------------------------------------------------------------------------------
*/