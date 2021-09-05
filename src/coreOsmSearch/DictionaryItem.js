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

@file DictionaryItem.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module coreOsmSearch
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';
import ObjId from '../data/ObjId.js';
import { INVALID_OBJ_ID } from '../main/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class DictionaryItem
@classdesc This class is used to represent a branch of the dictionary tree.
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class DictionaryItem {

	#objId = INVALID_OBJ_ID;

	constructor ( itemName, isRoot ) {
		this.name = theHTMLSanitizer.sanitizeToJsString ( itemName );
		this.items = [];
		this.filterTagsArray = [];
		this.elementTypes = [ 'node', 'way', 'relation' ];
		this.isSelected = false;
		this.isExpanded = false;
		this.isRoot = false;
		if ( isRoot ) {
			this.isExpanded = true;
			this.isRoot = true;
		}
		this.#objId = ObjId.nextObjId;
		Object.seal ( this );
	}

	get objId ( ) { return this.#objId; }
}

export default DictionaryItem;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of DictionaryItem.js file

@------------------------------------------------------------------------------------------------------------------------------
*/