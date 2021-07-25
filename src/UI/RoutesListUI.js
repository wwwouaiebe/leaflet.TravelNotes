/*
Copyright - 2017 2021 - wwwouaiebe - Contact: http//www.ouaie.be/

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
Doc reviewed 20210725
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file RoutesListUI.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module RoutesListUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { newRouteContextMenu } from '../contextMenus/RouteContextMenu.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theTravelEditor from '../core/TravelEditor.js';
import theHTMLElementsFactory from '../util/HTMLElementsFactory.js';

import { LAT_LNG, ZERO, MOUSE_WHEEL_FACTORS } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class RoutesListDragEventListeners
@classdesc This class contains the event listeners for the RoutesList drag oprations
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class RoutesListDragEventListeners {

	static #draggedRouteObjId = ZERO;

	/**
	@function ourOnRouteDragStart
	@desc dragstart event listener
	*/

	static dragStart ( dragEvent ) {
		dragEvent.stopPropagation ( );
		try {
			dragEvent.dataTransfer.setData ( 'Text', dragEvent.target.objId );
			dragEvent.dataTransfer.dropEffect = 'move';
			dragEvent.dataTransfer.routeObjId = dragEvent.target.objId;
		}
		catch ( err ) {
			if ( err instanceof Error ) {
				console.error ( err );
			}
		}
		RoutesListDragEventListeners.#draggedRouteObjId = dragEvent.target.objId;
	}

	/**
	dragover event listener
	*/

	static dragOver ( dragEvent ) {
		dragEvent.preventDefault ( );
	}

	/**
	drop event listener
	*/

	static drop ( dropEvent ) {
		dropEvent.preventDefault ( );
		let element = dropEvent.target;
		while ( ! element.objId ) {
			element = element.parentElement;
		}
		let clientRect = element.getBoundingClientRect ( );
		theTravelEditor.routeDropped (
			RoutesListDragEventListeners.#draggedRouteObjId,
			element.objId,
			( dropEvent.clientY - clientRect.top < clientRect.bottom - dropEvent.clientY )
		);
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class RoutesListEventListeners
@classdesc This class contains the event listeners for the RoutesList
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class RoutesListEventListeners {

	/*
	wheel event listener
	*/

	static onWheel ( wheelEvent ) {
		if ( wheelEvent.deltaY ) {
			wheelEvent.target.scrollTop +=
					wheelEvent.deltaY * MOUSE_WHEEL_FACTORS [ wheelEvent.deltaMode ];
		}
		wheelEvent.stopPropagation ( );
	}

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class RoutesEventListeners
@classdesc This class contains the event listeners for the Routes
@private
@------------------------------------------------------------------------------------------------------------------------------
*/

class RoutesEventListeners {

	static contextMenu ( contextMenuEvent ) {
		contextMenuEvent.stopPropagation ( );
		contextMenuEvent.preventDefault ( );
		contextMenuEvent.latlng = { lat : LAT_LNG.defaultValue, lng : LAT_LNG.defaultValue };
		contextMenuEvent.fromUI = true;
		contextMenuEvent.originalEvent =
			{
				clientX : contextMenuEvent.clientX,
				clientY : contextMenuEvent.clientY
			};
		newRouteContextMenu ( contextMenuEvent, contextMenuEvent.target.parentNode ).show ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class RoutesListUI
@classdesc This class is the Routes List part of the UI
@see {@link theRoutesListUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class RoutesListUI {

	#routesList = null;

	/**
	This method creates the routes list header div
	@private
*/

	#createRouteListDiv ( uiMainDiv ) {
		this.#routesList = theHTMLElementsFactory.create (
			'div',
			{
				className : 'List'
			},
			uiMainDiv
		);
		this.#routesList.addEventListener ( 'drop', RoutesListDragEventListeners.drop, false );
		this.#routesList.addEventListener ( 'dragover', RoutesListDragEventListeners.dragOver, false );
		this.#routesList.addEventListener ( 'wheel', RoutesListEventListeners.onWheel, false );
	}

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	creates the user interface
	@param {HTMLElement} uiMainDiv The HTML element in witch the different elements of the UI have to be created
	*/

	createUI ( uiMainDiv ) {
		this.#createRouteListDiv ( uiMainDiv );
	}

	/*
	Toogle the visibility of the routes list
	*/

	toogleExpand ( ) {
		this.#routesList.classList.toggle ( 'TravelNotes-Hidden' );
		return this.#routesList.classList.contains ( 'TravelNotes-Hidden' );
	}

	/**
	Removes all routes from the routes list and add the routes that are in the TravelNotesData.travel object
	*/

	setRoutesList ( ) {
		while ( this.#routesList.firstChild ) {
			this.#routesList.firstChild.removeEventListener ( 'dragstart', RoutesListDragEventListeners.dragStart, false );
			this.#routesList.firstChild.removeEventListener ( 'contextmenu', RoutesEventListeners.contextMenu, false );
			this.#routesList.removeChild ( this.#routesList.firstChild );
		}

		let routesIterator = theTravelNotesData.travel.routes.iterator;
		while ( ! routesIterator.done ) {
			let route = routesIterator.value.objId === theTravelNotesData.editedRouteObjId
				?
				theTravelNotesData.travel.editedRoute
				:
				routesIterator.value;
			let routeName =
				( routesIterator.value.objId === theTravelNotesData.editedRouteObjId ? '🔴\u00a0' : '' ) +
				( route.chain ? '⛓\u00a0' : '' ) +
				(
					routesIterator.value.objId === theTravelNotesData.editedRouteObjId ?
						theTravelNotesData.travel.editedRoute.computedName :
						route.computedName
				);
			let routeDiv = theHTMLElementsFactory.create (
				'div',
				{
					draggable : true,
					className :
						'TravelNotes-TravelUI-RoutesList-Item TravelNotes-UI-MoveCursor' +
						( routesIterator.value.hidden ? ' TravelNotes-TravelUI-RoutesList-HiddenItem' : '' ),
					objId :
						routesIterator.value.objId === theTravelNotesData.editedRouteObjId
							?
							theTravelNotesData.travel.editedRoute.objId
							:
							routesIterator.value.objId,
					canDrag : true,
					textContent : routeName
				},
				this.#routesList
			);

			routeDiv.addEventListener ( 'dragstart', RoutesListDragEventListeners.dragStart, false );
			routeDiv.addEventListener ( 'contextmenu', RoutesEventListeners.contextMenu, false );
		}
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of RoutesListUI class
@type {RoutesListUI}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theRoutesListUI = new RoutesListUI ( );

export default theRoutesListUI;

/*
--- End of RoutesListUI.js file ------------------------------------------------------------------------------------------------
*/