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
--- AboutDialog.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the AboutDialog object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20170929
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var AboutDialog = function ( color ) {
		
		var baseDialog = require ( '../UI/BaseDialog' ) ( );
		baseDialog.title = require ( '../UI/Translator' ) ( ).getText ( 'AboutDialog - About Travel & Notes' );
		
		var aboutDiv = require ( './HTMLElementsFactory' ) ( ).create (
			'div',
			{
				id : 'TravelNotes-AboutDialog-AboutDiv'
			},
			baseDialog.content
		);
		
		aboutDiv.innerHTML = 
			"<p>This  program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or any later version.</p>" +
			"<p>Copyright - 2017 2018 - Christian Guyette</p>" +
			"<p>Contact : <a href='http://www.ouaie.be/blog/pages/contact' target='_blank'>http://www.ouaie.be/</a></p>" +
			"<p>GitHub : <a href='https://github.com/wwwouaiebe/leaflet.TravelNotes' target='_blank'>https://github.com/wwwouaiebe/leaflet.TravelNotes</a></p>" +
			"<p>Version : " + require ( '../data/Version' ) +'.';
		
		baseDialog.center ( );
		
		return baseDialog;
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = AboutDialog;
	}

}());

/*
--- End of AboutDialog.js file ----------------------------------------------------------------------------------------
*/	