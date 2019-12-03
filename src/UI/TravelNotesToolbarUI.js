/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- TravelNotesToolbarUI.js file --------------------------------------------------------------------------------------
This file contains:
	- the TravelNotesToolbarUI function
	- the gc_TravelNotesToolbarUI object
Changes:
	- v1.6.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { gc_TravelNotesToolbarUI };

import { g_Translator } from '../UI/Translator.js';
import { g_Config } from '../data/Config.js';
import { g_APIKeysManager } from '../core/APIKeysManager.js';
import { gc_GeoLocator } from '../core/GeoLocator.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

/*
--- newTravelNotesToolbarUI function ----------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newTravelNotesToolbarUI ( ) {

	let m_GeoLocationButton = null;
	let m_HTMLElementsFactory = newHTMLElementsFactory ( ) ;
	let m_PinButton = null;
	let m_TimerId = null;

	/*
	--- m_OnMouseEnterControl function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnMouseEnterControl ( ) {
		if ( m_TimerId ) {
			clearTimeout ( m_TimerId );
			m_TimerId = null;
		}
		document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.remove ( 'TravelNotes-Control-MainDiv-Minimize' );
		document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.add ( 'TravelNotes-Control-MainDiv-Maximize' );
	}
	
	/*
	--- m_OnMouseLeaveControlfunction ---------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnMouseLeaveControl ( ) {
		m_TimerId = setTimeout (
			( ) => {
				document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.remove ( 'TravelNotes-Control-MainDiv-Maximize' );
				document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.add ( 'TravelNotes-Control-MainDiv-Minimize' );
			},
			g_Config.travelEditor.timeout
		);
	}

	/*
	--- m_OnGeoLocationStatusChanged function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_OnGeoLocationStatusChanged ( status ) {
		switch ( status ) {
			case 1:
				m_GeoLocationButton.classList.remove ( "TravelNotes-Control-GeoLocationButton-Striked" );
				break;
			case 2:
				m_GeoLocationButton.classList.add ( "TravelNotes-Control-GeoLocationButton-Striked" );
				break;
			default:
				if ( m_GeoLocationButton ) {
					m_GeoLocationButton.parentNode.removeChild ( m_GeoLocationButton );
					m_GeoLocationButton = null;
				}
				break;
		}
	}
	
	/*
	--- m_CreateUI function -------------------------------------------------------------------------------------------

	This function creates the UI
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_CreateUI ( controlDiv ){ 
	
		if ( document.getElementById ( 'TravelNotes-Control-TravelNotesToolbarDiv' ) ) {
			return;
		}
		
		let buttonsDiv = m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-Control-TravelNotesToolbarDiv', 
				className : 'TravelNotes-Control-ButtonsDiv'
			}, 
			controlDiv
		);
		
		m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-Control-HomeButton', 
				className: 'TravelNotes-Control-Button', 
				title : 'Help',
				innerHTML : '<a class="TravelNotes-Control-LinkButton" href="' + window.location.origin + '" target="_blank">&#x1f3e0;</a>' 
			}, 
			buttonsDiv
		);
		m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-Control-HelpButton', 
				className: 'TravelNotes-Control-Button', 
				title : 'Help',
				innerHTML : '<a class="TravelNotes-Control-LinkButton" href="https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/gh-pages/TravelNotesGuides" target="_blank">?</a>' 
			}, 
			buttonsDiv
		);
		m_HTMLElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-Control-ContactButton', 
				className: 'TravelNotes-Control-Button', 
				title : 'Contact',
				innerHTML : '<a class="TravelNotes-Control-LinkButton" href="' + ( g_Config.travelNotesToolbarUI.contactMail || window.location.origin ) + '" target="_blank">@</a>' //'&#x23CD;'
			}, 
			buttonsDiv
		);
		if ( g_Config.APIKeys.showDialogButton ) {
			//API keys button
			m_HTMLElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-ApiKeysButton', 
					className: 'TravelNotes-Control-Button', 
					title : g_Translator.getText ( 'TravelEditorUI - API keys' ), 
					innerHTML : '&#x1f511;'
				}, 
				buttonsDiv 
			)
			.addEventListener ( 
				'click', 
				clickEvent => {
					clickEvent.stopPropagation ( );
					g_APIKeysManager.dialog ( );
				}, 
				false 
			);
		}
		if ( 0 < gc_GeoLocator.status ) {
			//GeoLocator button
			m_GeoLocationButton = m_HTMLElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-GeoLocatorButton', 
					className: 'TravelNotes-Control-Button', 
					title : g_Translator.getText ( 'TravelEditorUI - Geo location' ), 
					innerHTML : '&#x1f310;'
				}, 
				buttonsDiv 
			);
			m_GeoLocationButton.addEventListener ( 
				'click', 
				clickEvent => {
					clickEvent.stopPropagation ( );
					gc_GeoLocator.switch ( );
				}, 
				false 
			);
		}
		
		// pin button
		m_PinButton = m_HTMLElementsFactory.create (
			'span',
			{ 
				innerHTML : '&#x274c;', 
				id : 'TravelNotes-Control-PinButton', 
			},
			buttonsDiv
		);
		m_PinButton.addEventListener ( 
			'click', 
			event => {
				let control = document.getElementById ( 'TravelNotes-Control-MainDiv' );
				if ( 10060 === event.target.innerHTML.charCodeAt ( 0 ) ) {
					event.target.innerHTML = '&#x1f4cc;';
					control.addEventListener ( 'mouseenter', m_OnMouseEnterControl, false );
					control.addEventListener ( 'mouseleave', m_OnMouseLeaveControl, false );
				}
				else
				{
					event.target.innerHTML = '&#x274c;';
					control.removeEventListener ( 'mouseenter', m_OnMouseEnterControl, false );
					control.removeEventListener ( 'mouseleave', m_OnMouseLeaveControl, false );
				}
			}, 
			false 
		);
		if ( g_Config.travelEditor.startMinimized ) {
			m_PinButton.innerHTML = '&#x1f4cc;';
			controlDiv.addEventListener ( 'mouseenter', m_OnMouseEnterControl, false );
			controlDiv.addEventListener ( 'mouseleave', m_OnMouseLeaveControl, false );
			controlDiv.classList.add ( 'TravelNotes-Control-MainDiv-Minimize' );
		}
		else {
			controlDiv.classList.add ( 'TravelNotes-Control-MainDiv-Maximize' );
		}
	}

	/*
	--- TravelNotesToolbarUI object -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			createUI : controlDiv => m_CreateUI ( controlDiv ),
			
			geoLocationStatusChanged : ( status ) => m_OnGeoLocationStatusChanged ( status )
		}
	);
}

/* 
--- gc_TravelNotesToolbarUI object ------------------------------------------------------------------------------------

The one and only one TravelNotesToolbarUI

-----------------------------------------------------------------------------------------------------------------------
*/

const gc_TravelNotesToolbarUI = newTravelNotesToolbarUI ( );	

/*
--- End of TravelNotesToolbarUI.js file -------------------------------------------------------------------------------
*/