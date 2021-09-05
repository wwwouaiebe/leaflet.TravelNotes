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
	- v1.6.0:
		- created
	- v1.9.0:
		- Issue ♯103 : Review the attributions
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯136 : Remove html entities from js string
		- Issue ♯138 : Protect the app - control html entries done by user.
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file AttributionsUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module attributionsUI

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc The attributions UI
@see {@link theAttributionsUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class AttributionsUI {

	#attributionsDiv = null;

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	creates the Attributions UI.
	*/

	createUI ( ) {
		this.#attributionsDiv = theHTMLElementsFactory.create ( 'div', { id : 'TravelNotes-AttributionsUI' }, document.body );

		// this.attributions = '';
	}

	/**
	Add/replace the given attributions to the UI. Leaflet, OpenStreetMap and TravelNotes must always be credited.
	*/

	set attributions ( attributions ) {
		let attributionsString =
			'© <a href="https://leafletjs.com/" target="_blank" title="Leaflet">Leaflet</a> ' +
			'| © <a href="https://www.openstreetmap.org/copyright" target="_blank" ' +
			'title="OpenStreetMap contributors">OpenStreetMap contributors</a> ' +
			attributions +
			'| © <a href="https://github.com/wwwouaiebe" target="_blank" ' +
			'title="https://github.com/wwwouaiebe">Travel & Notes</a>';

		while ( this.#attributionsDiv.firstChild ) {
			this.#attributionsDiv.removeChild ( this.#attributionsDiv.firstChild );
		}
		theHTMLSanitizer.sanitizeToHtmlElement ( attributionsString, this.#attributionsDiv );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of AttributionsUI class
@type {AttributionsUI}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theAttributionsUI = new AttributionsUI ( );

export default theAttributionsUI;

/*
--- End of AttributionsUI.js file ---------------------------------------------------------------------------------------------
*/