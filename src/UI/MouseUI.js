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
--- MouseUI.js file ---------------------------------------------------------------------------------------------------
This file contains:
	- the newMouseUI function
	- the gc_MouseUI object
Changes:
	- v1.6.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { gc_MouseUI };

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { newUtilities } from '../util/Utilities.js';

/*
--- newMouseUI function -----------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newMouseUI ( ) {
	
	let m_MouseDiv = null;
	
	let m_MousePos = null;
	let m_Zoom = null;
	let m_FileName = '';
	let m_Utilities = newUtilities ( );
	
	/*
	--- m_Update function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Update ( ) {
		m_MouseDiv.innerHTML = '<span>' + 
		m_MousePos + 
		'&nbsp;-&nbsp;Zoom&nbsp;:&nbsp;' + 
		m_Zoom + 
		( m_FileName !=='' ? '&nbsp;-&nbsp;' + m_FileName : '' ) + 
		'</span>';
	}
	
	/*
	--- m_SetMousePos function ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SetMousePos ( mousePos ) {
		m_MousePos = m_Utilities.formatLat ( mousePos.lat ) + '&nbsp;-&nbsp;' + m_Utilities.formatLng ( mousePos.lng );
		m_Update ( );
	}
	
	/*
	--- m_SetZoom function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SetZoom ( zoom ) {
		m_Zoom = zoom;
		m_Update ( );
	}
	
	/*
	--- m_SetFileName function ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SetFileName ( fileName ) {
		m_FileName = fileName;
		m_Update ( );
	}
	
	/*
	--- m_CreateUI function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateUI ( ) {
		
		m_Zoom = g_TravelNotesData.map.getZoom ( );
		let mousePos = g_TravelNotesData.map.getCenter ( );
		m_MousePos = m_Utilities.formatLat ( mousePos.lat ) + '&nbsp;-&nbsp;' + m_Utilities.formatLng ( mousePos.lng );
		m_MouseDiv = newHTMLElementsFactory ( ).create ( 
			'div',
			{
				id : 'TravelNotes-MouseControl'
			},
			document.getElementsByTagName ( 'body' ) [ 0 ]
		);
		g_TravelNotesData.map.on ( 
			'mousemove',
			event => { gc_MouseUI.mousePos = event.latlng; }
		);
		g_TravelNotesData.map.on ( 
			'zoomend', 
			( ) => { gc_MouseUI.zoom = g_TravelNotesData.map.getZoom ( ); }
		);
		g_TravelNotesData.map.on ( 
			'travelnotesfileloaded',
			event => { gc_MouseUI.fileName = event.name || ''; }
		);

	}
	
	/*
	--- MouseUI object ------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			createUI : ( ) => m_CreateUI ( ),
			set mousePos ( MousePos ) { m_SetMousePos ( MousePos ) },
			set zoom ( Zoom ) { m_SetZoom ( Zoom ) },
			set fileName ( FileName ) { m_SetFileName ( FileName ) }
		}
	);
}

const gc_MouseUI = newMouseUI ( );
	
/*
--- End of MouseUI.js file --------------------------------------------------------------------------------------------
*/		