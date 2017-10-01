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
--- L.TravelNotes.Control.js file -------------------------------------------------------------------------------------
This file contains:
	- the L.TravelNotes.Control object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
Doc reviewed 20171001
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	L.TravelNotes = L.TravelNotes || {};
	L.travelNotes = L.travelNotes || {};
	
	L.TravelNotes.Control = L.Control.extend ( {
		
			options : {
				position: 'topright'
			},
			
			initialize: function ( options ) {
					L.Util.setOptions( this, options );
			},
			
			onAdd : function ( Map ) {
				var controlElement = require ( './UI/UserInterface' ) ( ).UI;
				
				return controlElement; 
			}
		}
	);

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	L.travelNotes.control = function ( options ) {
		return new L.TravelNotes.Control ( options );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = L.travelNotes.control;
	}

}());

/*
--- End of L.TravelNotes.Control.js file ------------------------------------------------------------------------------
*/