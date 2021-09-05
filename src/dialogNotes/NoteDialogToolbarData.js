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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
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

@module dialogNotes
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';

import { ZERO, ONE, ICON_DIMENSIONS } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteDialogToolbarData
@classdesc This class is a container for the edition buttons and predefined icons
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteDialogToolbarData {

	#editionButtons = [];
	#preDefinedIconsMap = new Map ( );
	#preDefinedIcons = [];

	/*
	constructor
	*/

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	the edition buttons
	*/

	get buttons ( ) { return this.#editionButtons; }

	/**
	the predefined icons
	*/

	get icons ( ) {
		return this.#preDefinedIcons;
	}

	/**
	get and icon from the icon position in the array
	*/

	getIconData ( index ) {
		return this.#preDefinedIcons [ index ] [ ONE ];
	}

	/**
	get and icon from the icon name
	*/

	getIconContentFromName ( iconName ) {
		let preDefinedIcon = this.#preDefinedIconsMap.get ( iconName );
		return preDefinedIcon ? preDefinedIcon.icon : '';
	}

	/**
	Load a json file with predefined icons and / or edition buttons
	*/

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

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of NoteDialogToolbarData class
@type {NoteDialogToolbarData}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theNoteDialogToolbarData = new NoteDialogToolbarData ( );

export default theNoteDialogToolbarData;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteDialogToolbarData.js file

@------------------------------------------------------------------------------------------------------------------------------
*/