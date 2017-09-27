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

( function ( ){
	
	'use strict';

	var getItineraryEditor = function ( ) {
		
		return {
			setItinerary : function ( ) {
				require ( '../UI/ItineraryEditorUI' ) ( ).setItinerary (  );
			},
			setProvider : function ( providerName ) {
				require ( '../UI/ItineraryEditorUI' ) ( ).setProvider ( providerName );
			},
			setTransitMode : function ( transitMode ) {
				require ( '../UI/ItineraryEditorUI' ) ( ).setTransitMode ( transitMode );
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getItineraryEditor;
	}

}());
