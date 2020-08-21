/*
Copyright - 2019 - wwwouaiebe - Contact: http//www.ouaie.be/

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
Doc reviewed 20200821
Tests ...
*/

import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

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
		document.getElementById ( 'TravelNotes-AttributionsUI' ).innerHTML =
			'&copy; <a href="http://leafletjs.com/" target="_blank" title="Leaflet">Leaflet</a> ' +
			'| &copy; <a href="http://www.openstreetmap.org/copyright" target="_blank" ' +
			'title="OpenStreetMap contributors">OpenStreetMap contributors</a> ' +
			attributions +
			'| &copy; <a href="https://github.com/wwwouaiebe" target="_blank" ' +
			'title="https://github.com/wwwouaiebe">Travel & Notes</a> ';
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