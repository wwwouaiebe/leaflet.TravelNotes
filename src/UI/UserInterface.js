/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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
	- the UserInterface object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #31 : Add a command to import from others maps
Doc reviewed 20170929
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var UserInterface = function ( ) {

		var m_MainDiv = document.getElementById ( 'TravelNotes-Control-MainDiv' );

		var m_CreateUI = function ( ){ 
			m_MainDiv = require ( './HTMLElementsFactory' ) ( ).create ( 'div', { id : 'TravelNotes-Control-MainDiv' } );
			require ( './HTMLElementsFactory' ) ( ).create ( 'div', { id : 'TravelNotes-Control-MainDiv-Title', innerHTML : 'Travel&nbsp;&amp;&nbsp;Notes' }, m_MainDiv);
			require ( './TravelEditorUI' ) ( ).createUI ( m_MainDiv ); 
			require ( './RouteEditorUI' ) ( ).createUI ( m_MainDiv ); 
			require ( './DataPanesUI' ) ( ).createUI ( m_MainDiv ); 
			require ( './ProvidersToolbarUI' ) ( ).createUI ( m_MainDiv ); 
			require ( './ErrorEditorUI' ) ( ).createUI ( m_MainDiv ); 
			
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
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = UserInterface;
	}

}());

/*
--- End of UserInterface.js file --------------------------------------------------------------------------------------
*/	