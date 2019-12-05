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
--- AttributionsUI.js file --------------------------------------------------------------------------------------------
This file contains:
	- the newAttributionsUI function
	- the gc_AttributionsUI object
Changes:
	- v1.6.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { gc_AttributionsUI };

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

/*
--- newAttributionsUI function ----------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newAttributionsUI ( ) {

	let m_AttributionsUIDiv = null;

	/*
	--- m_SetAttributions function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SetAttributions ( attributions ) {
		m_AttributionsUIDiv.innerHTML =
			'&copy; <a href="http://leafletjs.com/" target="_blank" title="Leaflet">Leaflet</a> ' +
			attributions +
			'| &copy; <a href="https://github.com/wwwouaiebe" target="_blank" ' +
			'title="https://github.com/wwwouaiebe">Maps & TravelNotes</a> ';
	}

	/*
	--- m_CreateUI function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateUI ( ) {
		m_AttributionsUIDiv = newHTMLElementsFactory ( ).create (
			'div',
			{
				id : 'TravelNotes-AttributionsUI'
			},
			document.getElementsByTagName ( 'body' ) [ 0 ]
		);
		m_SetAttributions ( '' );

	}

	/*
	--- AttributionsUI object ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			set attributions ( Attributions ) { m_SetAttributions ( Attributions ); },
			createUI : ( ) => m_CreateUI ( )
		}
	);
}

const gc_AttributionsUI = newAttributionsUI ( );

/*
--- End of AttributionsUI.js file -------------------------------------------------------------------------------------
*/