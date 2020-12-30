/*
Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/

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
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #66 : Work with promises for dialogs
		- Issue #68 : Review all existing promises.
	- v1.14.0:
		- Issue #135 : Remove innerHTML from code
Doc reviewed 20200812
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file AboutDialog.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module AboutDialog
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { theHTMLParserSerializer } from '../util/HTMLParserSerializer.js';
import { theCurrentVersion } from '../data/Version.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function myNewAboutDialog
@desc constructor for AboutDialog objects
@return {AboutDialog} an instance of AboutDialog object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function myNewAboutDialog ( ) {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class AboutDialog
	@classdesc a BaseDialog object adapted for the About dialog
	@see {@link newAboutDialog} for constructor
	@augments BaseDialog
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	let aboutDialog = newBaseDialog ( );
	aboutDialog.title = theTranslator.getText ( 'AboutDialog - About Travel & Notes' );

	let aboutString =
		'<div id="TravelNotes-AboutDialog-AboutDiv">' +
		'<p>This  program is free software; you can redistribute it and/or modify it under the terms of the ' +
		'GNU General Public License as published by the Free Software Foundation; either version 3 of the License, ' +
		'or any later version.</p>' +
		'<p>Copyright - 2017 2021 - wwwouaiebe</p>' +
		'<p>Contact : <a href="https://www.ouaie.be/blog/pages/Contact" target="_blank">https://www.ouaie.be/</a></p>' +
		'<p>GitHub : <a href="https://github.com/wwwouaiebe/leaflet.TravelNotes" target="_blank">' +
		'https://github.com/wwwouaiebe/leaflet.TravelNotes</a></p>' +
		'<p>Version : ' + theCurrentVersion + '.' +
		'<p>This program uses:' +
		' <a href="https://leafletjs.com/" target="_blank">leaflet</a>,' +
		' <a href="https://github.com/mapbox/polyline" target="_blank">mapbox/polyline</a>,' +
		' <a href="https://github.com/Project-OSRM/osrm-text-instructions" target="_blank">' +
		'Project-OSRM/osrm-text-instructions</a> and ' +
		' <a href="https://github.com/drolbr/Overpass-API" target="_blank">the Overpass API</a></p></div>';

	theHTMLParserSerializer.parse ( aboutString, aboutDialog.content );

	aboutDialog.show ( ).then ( )
		.catch ( err => console.log ( err ? err : 'An error occurs in the dialog' ) );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newAboutDialog
	@desc constructor for AboutDialog objects
	@return {AboutDialog} an instance of AboutDialog object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	myNewAboutDialog as newAboutDialog
};

/*
--- End of AboutDialog.js file ------------------------------------------------------------------------------------------------
*/