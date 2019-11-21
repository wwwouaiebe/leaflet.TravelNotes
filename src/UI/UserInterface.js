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
--- UserInterface.js file ---------------------------------------------------------------------------------------------
This file contains:
	- the newUserInterface function
Changes:
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #31 : Add a command to import from others maps
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

'use strict';

export { newUserInterface };

import { newHTMLElementsFactory } from '../UI/HTMLElementsFactory.js';
import { newTravelEditorUI } from '../UI/TravelEditorUI.js';
import { newRouteEditorUI } from '../UI/RouteEditorUI.js';
import { newDataPanesUI } from '../UI/DataPanesUI.js';
import { newProvidersToolbarUI } from '../UI/ProvidersToolbarUI.js';
import { newErrorEditorUI } from '../UI/ErrorEditorUI.js';

var newUserInterface = function ( ) {

	var m_MainDiv = document.getElementById ( 'TravelNotes-Control-MainDiv' );

	var m_CreateUI = function ( ){ 
		var htmlElementsFactory = newHTMLElementsFactory ( );
		m_MainDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-MainDiv' } );
		htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-MainDiv-Title', innerHTML : 'Travel&nbsp;&amp;&nbsp;Notes' }, m_MainDiv);
		newTravelEditorUI ( ).createUI ( m_MainDiv ); 
		newRouteEditorUI ( ).createUI ( m_MainDiv ); 
		newDataPanesUI ( ).createUI ( m_MainDiv ); 
		newProvidersToolbarUI ( ).createUI ( m_MainDiv ); 
		newErrorEditorUI ( ).createUI ( m_MainDiv ); 
		
		m_MainDiv.addEventListener ( 
			'click',
			function ( event ) {

				if  ( event.target.classList.contains (  "TravelNotes-SortableList-ItemInput" ) ) {
					return; 
				}
				if ( event.target.id && -1 !== [ "TravelNotes-Control-OpenTravelInput", "TravelNotes-Control-OpenTravelButton", "TravelNotes-Control-ImportTravelInput", "TravelNotes-Control-ImportTravelButton", "TravelNotes-Control-OpenTravelRoadbookLink" ].indexOf ( event.target.id ) ) {
					return;
				}
				event.stopPropagation ( );
				event.preventDefault ( );
			},
			false
		);
		
		m_MainDiv.addEventListener ( 
			'dblclick',
			function ( event ) {
				event.stopPropagation ( );
				event.preventDefault ( );
			},
			false
		);
		
		m_MainDiv.addEventListener ( 
			'wheel',
			function ( event ) {
				event.stopPropagation ( );
				event.preventDefault ( );
			},
			false
		);
	};
	
	if ( ! m_MainDiv ) {
		m_CreateUI ( );
	}
	
	return {
		get UI ( ) { return m_MainDiv; }
	};
};

/*
--- End of UserInterface.js file --------------------------------------------------------------------------------------
*/	