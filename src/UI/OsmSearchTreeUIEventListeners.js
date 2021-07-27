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
Doc reviewed 20210727
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file OsmSearchTreeUIEventListeners.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module OsmSearchTreeUIEventListeners
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { MOUSE_WHEEL_FACTORS } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class OsmSearchTreeUIEventListeners
@classdesc This class contains the event listeners for the tree
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

class OsmSearchTreeUIEventListeners {

	/**
	A reference to the OsmSearchTreeUI object
	*/

	static osmSearchTreeUI = null;

	/**
	Helper function to select or unselected all the items childrens of a given item
	*/

	static selectItem ( item, isSelected ) {
		item.isSelected = isSelected;
		item.items.forEach (
			subItem => { OsmSearchTreeUIEventListeners.selectItem ( subItem, isSelected ); }
		);
	}

	/**
	change event listener for the tree checkboxes
	*/

	static onCheckboxChange ( changeEvent ) {
		OsmSearchTreeUIEventListeners.selectItem ( changeEvent.target.parentNode.dictItem, changeEvent.target.checked );
		OsmSearchTreeUIEventListeners.osmSearchTreeUI.redraw ( );
	}

	/**
	wheel event listener for the tree
	*/

	static onWheel ( wheelEvent ) {
		if ( wheelEvent.deltaY ) {
			wheelEvent.target.scrollTop +=
				wheelEvent.deltaY * MOUSE_WHEEL_FACTORS [ wheelEvent.deltaMode ];
		}
		wheelEvent.stopPropagation ( );
	}

	/**
	click event listener for tree arrows
	*/

	static onArrowClick ( clickEvent ) {
		clickEvent.target.parentNode.dictItem.isExpanded = ! clickEvent.target.parentNode.dictItem.isExpanded;
		OsmSearchTreeUIEventListeners.osmSearchTreeUI.redraw ( );
	}

}

export default OsmSearchTreeUIEventListeners;

/*
@------------------------------------------------------------------------------------------------------------------------------

end of OsmSearchTreeUIEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/