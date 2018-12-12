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
--- ItineraryEditor.js file -------------------------------------------------------------------------------------------
This file contains:
	- the ItineraryEditor object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- added search and travel notes panes
		- added update functions for panes
Doc reviewed 20170927
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var ItineraryEditor = function ( ) {
		
		return {
			setItinerary : function ( ) { require ( '../UI/ItineraryEditorUI' ) ( ).setItinerary (  );},
			setTravelNotes : function ( ) { require ( '../UI/ItineraryEditorUI' ) ( ).setTravelNotes (  );},
			setSearch : function ( ) { require ( '../UI/ItineraryEditorUI' ) ( ).setSearch (  );},
			updateItinerary : function ( ) { require ( '../UI/ItineraryEditorUI' ) ( ).updateItinerary (  );},
			updateTravelNotes : function ( ) { require ( '../UI/ItineraryEditorUI' ) ( ).updateTravelNotes (  );},
			updateSearch : function ( ) { require ( '../UI/ItineraryEditorUI' ) ( ).updateSearch (  );},
			
			get provider ( ) { return require ( '../L.TravelNotes' ).routing.provider;},
			set provider ( providerName ) { require ( '../UI/ItineraryEditorUI' ) ( ).provider = providerName ;},
			
			get transitMode ( ) { return require ( '../L.TravelNotes' ).routing.transitMode; },
			set transitMode ( transitMode ) { require ( '../UI/ItineraryEditorUI' ) ( ).transitMode = transitMode ; }
		};
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = ItineraryEditor;
	}

}());

/*
--- End of ItineraryEditor.js file ------------------------------------------------------------------------------------
*/