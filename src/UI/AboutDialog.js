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
--- AboutDialog.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the AboutDialog function
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

'use strict';

export { newAboutDialog };

import { g_Translator } from '../UI/Translator.js';

import { newBaseDialog } from '../UI/BaseDialog.js';
import { newHTMLElementsFactory } from '../UI/HTMLElementsFactory.js';
import { currentVersion } from '../data/Version.js';

var newAboutDialog = function ( ) {
	
	var baseDialog = newBaseDialog ( );
	baseDialog.title = g_Translator.getText ( 'AboutDialog - About Travel & Notes' );
	
	var aboutDiv = newHTMLElementsFactory ( ).create (
		'div',
		{
			id : 'TravelNotes-AboutDialog-AboutDiv'
		},
		baseDialog.content
	);
	
	aboutDiv.innerHTML = 
		"<p>This  program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or any later version.</p>" +
		"<p>Copyright - 2017 2019 - wwwouaiebe</p>" +
		"<p>Contact : <a href='http://www.ouaie.be/blog/pages/contact' target='_blank'>http://www.ouaie.be/</a></p>" +
		"<p>GitHub : <a href='https://github.com/wwwouaiebe/leaflet.TravelNotes' target='_blank'>https://github.com/wwwouaiebe/leaflet.TravelNotes</a></p>" +
		"<p>Version : " + currentVersion +'.' +
		"<p>This program uses:" +
		" <a href='https://leafletjs.com/' target='_blank'>leaflet</a>," +
		" <a href='https://github.com/mapbox/polyline' target='_blank'>mapbox/polyline</a>," +
		" <a href='https://github.com/Project-OSRM/osrm-text-instructions' target='_blank'>Project-OSRM/osrm-text-instructions</a> and " +
		" <a href='https://github.com/drolbr/Overpass-API' target='_blank'>the Overpass API</a></p>";
	
	baseDialog.center ( );
	
	return baseDialog;
};

/*
--- End of AboutDialog.js file ----------------------------------------------------------------------------------------
*/	