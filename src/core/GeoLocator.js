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

export { gc_GeoLocator };
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { g_Config } from '../data/Config.js';

/*
--- newGeoLocator function --------------------------------------------------------------------------------------------

Patterns : Closure

-----------------------------------------------------------------------------------------------------------------------
*/

function newGeoLocator ( ) {

	let m_Status = 0; // ( -1 refused by user, 0 disabled (http or not working ), 1 available but not working, 2 working )
	let m_WatchId = null;
	let m_EventDispatcher = newEventDispatcher ( );
	
	/*
	--- m_ShowPosition function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ShowPosition ( position ) {
		m_EventDispatcher.dispatch ( 'geolocationpositionchanged', { position : position } )
	}
	
	/*
	--- m_Error function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Error ( positionError ) {
		if ( 1 === positionError.code ) { // access not allowed by user
			m_Status = -1;
		}
		m_Stop ( );
	}
	
	/*
	--- m_Start function ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Start ( ) {
		m_Status = 2;
		m_EventDispatcher.dispatch ( 'geolocationstatuschanged', { status : m_Status } );
		navigator.geolocation.getCurrentPosition ( m_ShowPosition, m_Error, g_Config.geoLocation.options );
		m_WatchId = navigator.geolocation.watchPosition ( m_ShowPosition, m_Error, g_Config.geoLocation.options );
	}
	
	/*
	--- m_Stop function -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Stop ( ) {
		if ( 2 === m_Status ) {
			m_Status = 1;
		}

		//if ( m_WatchId ) FF: the m_WatchId is always 0 so we cannot use m_WatchId to see if the geolocation is running
		m_EventDispatcher.dispatch ( 'geolocationstatuschanged', { status : m_Status } );
		navigator.geolocation.clearWatch ( m_WatchId );
		m_WatchId = null;
	}

	/*
	--- m_Switch function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_Switch ( ) {
		switch ( m_Status ) {
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
	
	m_Status = ( "geolocation" in navigator ) ? 1 : 0;
	
	/*
	--- GeoLocator object ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			get status ( ) { return m_Status; },
			switch : ( ) => { return m_Switch ( ); }
			
		}
	);
}

const gc_GeoLocator = newGeoLocator ( );

/*
--- End of GeoLocator.js file -----------------------------------------------------------------------------------------
*/	