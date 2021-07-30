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
Doc reviewed ...
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file NoteDialogToolbarData.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module NoteDialogToolbarData
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLSanitizer from '../util/HTMLSanitizer.js';

import { ZERO, ONE, ICON_DIMENSIONS } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogToolbarData
@classdesc coming soon...
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogToolbarData {

	#editionButtons = [];
	#preDefinedIconsMap = new Map ( );
	#preDefinedIcons = [];

	constructor ( ) {
	}

	get buttons ( ) { return this.#editionButtons; }

	get icons ( ) {
		return this.#preDefinedIcons;
	}

	getIconData ( index ) {
		return this.#preDefinedIcons [ index ] [ ONE ];
	}

	loadJson ( jsonData ) {
		if ( jsonData.editionButtons ) {
			this.#editionButtons = this.#editionButtons.concat ( jsonData.editionButtons );
		}
		jsonData.preDefinedIconsList.forEach (
			predefinedIcon => {
				predefinedIcon.name = theHTMLSanitizer.sanitizeToJsString ( predefinedIcon.name ) || '?';
				predefinedIcon.icon = theHTMLSanitizer.sanitizeToHtmlString ( predefinedIcon.icon ).htmlString || '?';
				predefinedIcon.tooltip = theHTMLSanitizer.sanitizeToJsString ( predefinedIcon.tooltip ) || '?';
				predefinedIcon.width = predefinedIcon.width || ICON_DIMENSIONS.width;
				predefinedIcon.height = predefinedIcon.height || ICON_DIMENSIONS.height;
				this.#preDefinedIconsMap.set ( predefinedIcon.name, predefinedIcon );
			}
		);
		this.#preDefinedIcons = Array.from ( this.#preDefinedIconsMap ).sort (
			( first, second ) => first [ ZERO ].localeCompare ( second [ ZERO ] )
		);
	}
}

const theNoteDialogToolbarData = new NoteDialogToolbarData ( );

export default theNoteDialogToolbarData;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogToolbarData.js file

@------------------------------------------------------------------------------------------------------------------------------
*/