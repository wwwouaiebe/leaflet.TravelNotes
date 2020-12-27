/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
		- issue #103 : Review the attributions
	- v1.14.0:
		- Issue #135 : Remove innerHTML from code
Doc reviewed 20200821
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file AttributionsUI.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module AttributionsUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theHTMLParserSerializer } from '../util/HTMLParserSerializer.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc The attributions UI
@see {@link theAttributionsUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class AttributionsUI {

	/**
	creates the Attributions UI.
	*/

	createUI ( ) {
		theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-AttributionsUI'
			},
			document.querySelector ( 'body' )
		);
		this.attributions = '';
	}

	/**
	Add/replace the given attributions to the UI. Leaflet, OpenStreetMap and TravelNotes must always be credited.
	*/

	set attributions ( attributions ) {
		let attributionsString =
			'<span>&copy; <a href="https://leafletjs.com/" target="_blank" title="Leaflet">Leaflet</a> ' +
			'| &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" ' +
			'title="OpenStreetMap contributors">OpenStreetMap contributors</a> ' +
			attributions +
			'| &copy; <a href="https://github.com/wwwouaiebe" target="_blank" ' +
			'title="https://github.com/wwwouaiebe">Travel & Notes</a></span>';

		let attributDiv = document.getElementById ( 'TravelNotes-AttributionsUI' );
		while ( attributDiv.firstChild ) {
			attributDiv.removeChild ( attributDiv.firstChild );
		}

		attributDiv.appendChild ( theHTMLParserSerializer.parse ( attributionsString ).firstChild.firstChild );

	}
}

const ourAttributionsUI = Object.seal ( new AttributionsUI );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of AttributionsUI class
	@type {AttributionsUI}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourAttributionsUI as theAttributionsUI
};

/*
--- End of AttributionsUI.js file ---------------------------------------------------------------------------------------------
*/