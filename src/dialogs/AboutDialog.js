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
		- Issue ♯65 : Time to go to ES6 modules?
		- Issue ♯66 : Work with promises for dialogs
		- Issue ♯68 : Review all existing promises.
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯138 : Protect the app - control html entries done by user.
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
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

@module dialogs

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import theTranslator from '../UILib/Translator.js';
import BaseDialog from '../dialogBase/BaseDialog.js';
import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';
import { theAppVersion } from '../data/Version.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class AboutDialog
@classdesc This class is the 'About' dialog
@extends BaseDialog
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class AboutDialog extends BaseDialog {

	#aboutDiv = null;

	/*
	constructor
	*/

	constructor ( options = {} ) {
		super ( options );
		this.#aboutDiv = theHTMLElementsFactory.create ( 'div', { id : 'TravelNotes-AboutDialog-AboutDiv' } );

		theHTMLSanitizer.sanitizeToHtmlElement (
			'<p>This  program is free software; you can redistribute it and/or modify it under the terms of the ' +
				'GNU General Public License as published by the Free Software Foundation; either version 3 of the License, ' +
				'or any later version.</p>' +
				'<p>Copyright - 2017 2021 - wwwouaiebe</p>' +
				'<p>Contact : <a href="https://www.ouaie.be/pages/Contact" target="_blank">https://www.ouaie.be/</a></p>' +
				'<p>GitHub : <a href="https://github.com/wwwouaiebe/leaflet.TravelNotes" target="_blank">' +
				'https://github.com/wwwouaiebe/leaflet.TravelNotes</a></p>' +
				'<p>Version : ' + theAppVersion + '.' +
				'<p>This program uses:' +
				' <a href="https://leafletjs.com/" target="_blank">leaflet</a>,' +
				' <a href="https://github.com/Project-OSRM/osrm-text-instructions" target="_blank">' +
				'Project-OSRM/osrm-text-instructions</a> and ' +
				' <a href="https://github.com/drolbr/Overpass-API" target="_blank">the Overpass API</a></p>',
			this.#aboutDiv
		);
	}

	/**
	Get an array with the HTMLElements that have to be added in the content of the dialog.
	@readonly
	*/

	get contentHTMLElements ( ) { return [ this.#aboutDiv ]; }

	get title ( ) { return theTranslator.getText ( 'AboutDialog - About Travel & Notes' ); }

}

export default AboutDialog;

/*
--- End of AboutDialog.js file ------------------------------------------------------------------------------------------------
*/