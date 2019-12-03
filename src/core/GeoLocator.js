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
--- GeoLocator.js file ------------------------------------------------------------------------------------------------
This file contains:
	- the newGeoLocator function
Changes:
	- v1.6.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/*
--- newGeoLocator function --------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/
export { newGeoLocator };
//import { newEventDispatcher } from '../util/EventDispatcher.js';
import { g_Config } from '../data/Config.js';

/*
--- newGeoLocator function --------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newGeoLocator ( ) {

	let m_Status = 0; // ( 0 unknown or disabled, 1 available but not working, 2 working )
	let m_WatchId = null;
	
	/*
	--- m_ShowPosition function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ShowPosition ( position ) {
		console.log ( position );
	}
	
	/*
	--- m_Start function ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Start ( ) {
		m_Status = 2;
		navigator.geolocation.getCurrentPosition ( m_ShowPosition , m_Stop, g_Config.options );
		m_WatchId = navigator.geolocation.watchPosition ( m_ShowPosition, m_Stop );
		
	}
	
	/*
	--- m_Stop function -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Stop ( ) {
		m_Status = 1;
		if ( m_WatchId ) {
			navigator.geolocation.clearWatch ( m_WatchId );
		}
		m_WatchId = null;
	}

	/*
	--- m_Switch function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Switch ( ) {
		
		switch ( m_Status )
		{
			case 0:
				break;
			case 1:
				m_Start ( );
				break;
			case 2:
				m_Stop ( );
				break;
			default:
				break;
		}
		
		return m_Status;
	}
	
	m_Status = ( "geolocation" in navigator ) ? 0 : 1;
	
	/*
	--- GeoLocator object ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/
	return Object.seal (
		{
			get status ( ) { return m_Status; },
			switch : ( ) => { return m_Switch ( ); },
			
		}
	);
}

/*
--- End of GeoLocator.js file -----------------------------------------------------------------------------------------
*/	

