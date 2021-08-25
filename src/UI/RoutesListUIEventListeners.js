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
Doc reviewed 20210815
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file RoutesListUIEventListeners.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module RoutesListUIEventListeners
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import RouteContextMenu from '../contextMenus/RouteContextMenu.js';
import theTravelEditor from '../core/TravelEditor.js';

import { MOUSE_WHEEL_FACTORS } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class RoutesListDragOverEventListener
@classdesc dragover event listener for the RoutesList based on the EventListener API.
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class RoutesListDragOverEventListener {

	constructor ( ) {
	}

	/**
	dragover event listener
	*/

	handleEvent ( dragEvent ) {
		dragEvent.preventDefault ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class RouteDragStartEventListener
@classdesc dragstart event listener for the routes based on the EventListener API.
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class RouteDragStartEventListener {

	constructor ( ) {
	}

	/**
	@desc dragstart event listener
	*/

	handleEvent ( dragEvent ) {
		dragEvent.stopPropagation ( );
		try {
			dragEvent.dataTransfer.setData ( 'ObjId', dragEvent.target.dataset.tanObjId );
			dragEvent.dataTransfer.dropEffect = 'move';
		}
		catch ( err ) {
			if ( err instanceof Error ) {
				console.error ( err );
			}
		}
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class RouteDropEventListener
@classdesc drop event listener for the routes based on the EventListener API.
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class RouteDropEventListener {

	constructor ( ) {
	}

	/**
	drop event listener
	*/

	handleEvent ( dropEvent ) {
		dropEvent.preventDefault ( );
		let targetElement = dropEvent.target;
		let clientRect = targetElement.getBoundingClientRect ( );
		theTravelEditor.routeDropped (
			Number.parseInt ( dropEvent.dataTransfer.getData ( 'ObjId' ) ),
			Number.parseInt ( targetElement.dataset.tanObjId ),
			( dropEvent.clientY - clientRect.top < clientRect.bottom - dropEvent.clientY )
		);
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class RoutesListWheelEventListener
@classdesc wheel event listener for the RoutesList based on the EventListener API.
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class RoutesListWheelEventListener {

	constructor ( ) {
	}

	handleEvent ( wheelEvent ) {
		wheelEvent.stopPropagation ( );
		if ( wheelEvent.deltaY ) {
			wheelEvent.target.scrollTop +=
					wheelEvent.deltaY * MOUSE_WHEEL_FACTORS [ wheelEvent.deltaMode ];
		}
		wheelEvent.stopPropagation ( );
	}

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class RouteContextMenuEventListener
@classdesc contextmenu event listener for the routes based on the EventListener API.
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class RouteContextMenuEventListener {

	constructor ( ) {
	}

	handleEvent ( contextMenuEvent ) {
		contextMenuEvent.stopPropagation ( );
		contextMenuEvent.preventDefault ( );
		new RouteContextMenu ( contextMenuEvent, contextMenuEvent.target.parentNode ).show ( );
	}
}

export {
	RouteDragStartEventListener,
	RouteDropEventListener,
	RouteContextMenuEventListener,
	RoutesListDragOverEventListener,
	RoutesListWheelEventListener
};

/*
@------------------------------------------------------------------------------------------------------------------------------

end of RoutesListUIEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/