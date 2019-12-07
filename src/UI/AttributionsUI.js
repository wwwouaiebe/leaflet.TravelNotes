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
	- the theAttributionsUI object
Changes:
	- v1.6.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

import  { OUR_CONST } from '../util/Constants.js';

/*
--- newAttributionsUI function ----------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newAttributionsUI ( ) {

	let myAttributionsUIDiv = null;

	/*
	--- mySetAttributions function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetAttributions ( attributions ) {
		myAttributionsUIDiv.innerHTML =
			'&copy; <a href="http://leafletjs.com/" target="_blank" title="Leaflet">Leaflet</a> ' +
			attributions +
			'| &copy; <a href="https://github.com/wwwouaiebe" target="_blank" ' +
			'title="https://github.com/wwwouaiebe">Maps & TravelNotes</a> ';
	}

	/*
	--- myCreateUI function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateUI ( ) {
		myAttributionsUIDiv = newHTMLElementsFactory ( ).create (
			'div',
			{
				id : 'TravelNotes-AttributionsUI'
			},
			document.getElementsByTagName ( 'body' ) [ OUR_CONST.zero ]
		);
		mySetAttributions ( '' );

	}

	/*
	--- AttributionsUI object ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			set attributions ( Attributions ) { mySetAttributions ( Attributions ); },
			createUI : ( ) => myCreateUI ( )
		}
	);
}

const theAttributionsUI = newAttributionsUI ( );

export { theAttributionsUI };

/*
--- End of AttributionsUI.js file -------------------------------------------------------------------------------------
*/