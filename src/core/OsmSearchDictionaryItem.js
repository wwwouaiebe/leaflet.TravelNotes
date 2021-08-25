
import theHTMLSanitizer from '../util/HTMLSanitizer.js';
import ObjId from '../data/ObjId.js';
import { INVALID_OBJ_ID } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class is used to represent a branch of the dictionary tree.
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class OsmSearchDictionaryItem {

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
	}

	get objId ( ) { return this.#objId; }
}

export default OsmSearchDictionaryItem;