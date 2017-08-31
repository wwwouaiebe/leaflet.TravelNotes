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
	
	var _Translator = require ( './Translator' ) ( );

	var _ItineraryDiv = null;

	var getItineraryUI = function ( ) {

		var _CreateItineraryEditorUI = function ( ) {
			
			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;

			_ItineraryDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-ItineraryDiv', className : 'TravelControl-TabBoxContentsDiv'} );
		
		};

		if ( ! _ItineraryDiv ) {
			_CreateItineraryEditorUI ( );
		}

		return {
			get UI ( ) { return _ItineraryDiv; }
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getItineraryUI;
	}

}());
	