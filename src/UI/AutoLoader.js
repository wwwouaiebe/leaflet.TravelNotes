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
--- AutoLoader.js file ------------------------------------------------------------------------------------------------
This file contains:
	- the newEventDispatcher function
Changes:
	- v1.6.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { newAutoLoader };

import { g_Config } from '../data/Config.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

/*
--- newAutoLoader function --------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newAutoLoader ( ) {
	
	if ( ! g_Config.autoLoad ) {
		return;
	}
	newHTMLElementsFactory ( ).create ( 'div', { id : 'Map' },  document.getElementsByTagName ( 'body' ) [ 0 ] );
	newHTMLElementsFactory ( ).create ( 'div', { id : 'TravelNotes' }, document.getElementsByTagName ( 'body' ) [ 0 ] );

	let _Map = window.L.map ( 'Map', { attributionControl : false, zoomControl : false } )
		.setView ( [ g_Config.map.center.lat, g_Config.map.center.lng ], g_Config.map.zoom );
	window.L.travelNotes.addControl ( _Map, "TravelNotes" );
	window.L.travelNotes.rightContextMenu = true;
}

	
/*
--- End of AutoLoader.js file -----------------------------------------------------------------------------------------
*/	