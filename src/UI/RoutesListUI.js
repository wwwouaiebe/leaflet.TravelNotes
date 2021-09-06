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
Doc reviewed 20210901
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

@module travelUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theTravelNotesData from '../data/TravelNotesData.js';
import theHTMLElementsFactory from '../UILib/HTMLElementsFactory.js';
import {
	RouteDragStartEL,
	RouteDropEL,
	RouteContextMenuEL,
	RoutesListDragOverEL,
	RoutesListWheelEL
} from '../UI/RoutesListUIEventListeners.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class RoutesListUI
@classdesc This class is the Routes List part of the UI
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class RoutesListUI {

	/**
	The route lst HTMLElement
	*/

	#routesListHTMLElement = null;

	/**
	Event listeners
	*/

	#routeContextMenuEventListener = new RouteContextMenuEL ( );
	#routeDropEventListener = new RouteDropEL ( );
	#routeDragStartEventListener = new RouteDragStartEL ( );

	/*
	constructor
	*/

	constructor ( UIMainHTMLElement ) {
		Object.freeze ( this );
		this.#routesListHTMLElement = theHTMLElementsFactory.create (
			'div',
			{ className : 'TravelNotes-TravelUI-RoutesListDiv' },
			UIMainHTMLElement
		);
		this.#routesListHTMLElement.addEventListener ( 'dragover', new RoutesListDragOverEL ( ) );
		this.#routesListHTMLElement.addEventListener ( 'wheel', new RoutesListWheelEL ( ) );
	}

	/*
	Toogle the visibility of the routes list
	*/

	toogleExpand ( ) {
		this.#routesListHTMLElement.classList.toggle ( 'TravelNotes-Hidden' );
		return this.#routesListHTMLElement.classList.contains ( 'TravelNotes-Hidden' );
	}

	/**
	Removes all routes from the routes list and add the routes that are in the TravelNotesData.travel object
	*/

	setRoutesList ( ) {
		while ( this.#routesListHTMLElement.firstChild ) {
			this.#routesListHTMLElement.firstChild.removeEventListener ( 'dragstart', this.#routeDragStartEventListener );
			this.#routesListHTMLElement.firstChild.removeEventListener ( 'drop', this.#routeDropEventListener );
			this.#routesListHTMLElement.firstChild.removeEventListener ( 'contextmenu', this.#routeContextMenuEventListener );
			this.#routesListHTMLElement.removeChild ( this.#routesListHTMLElement.firstChild );
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

			let routeHTMLElement = theHTMLElementsFactory.create (
				'div',
				{
					draggable : true,
					className :
						'TravelNotes-TravelUI-RoutesList-Item TravelNotes-UI-MoveCursor' +
						( routesIterator.value.hidden ? ' TravelNotes-TravelUI-RoutesList-HiddenItem' : '' ),
					dataset : { ObjId : route.objId },
					textContent : routeName
				},
				this.#routesListHTMLElement
			);

			routeHTMLElement.addEventListener ( 'dragstart', this.#routeDragStartEventListener );
			routeHTMLElement.addEventListener ( 'drop', this.#routeDropEventListener );
			routeHTMLElement.addEventListener ( 'contextmenu', this.#routeContextMenuEventListener );
		}
	}
}

export default RoutesListUI;

/*
--- End of RoutesListUI.js file ------------------------------------------------------------------------------------------------
*/