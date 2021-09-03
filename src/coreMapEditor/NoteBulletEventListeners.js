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
Tests 20210902
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file newClass.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module coreMapEditor
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import theDataSearchEngine from '../data/DataSearchEngine.js';
import theEventDispatcher from '../coreLib/EventDispatcher.js';
import theGeometry from '../coreLib/Geometry.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteBulletDragEndEL
@classdesc dragend event listener for the notes bullet
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteBulletDragEndEL {

	static handleEvent ( dragEndEvent ) {

		// the TravelNotes note and route are searched...
		let noteAndRoute = theDataSearchEngine.getNoteAndRoute ( dragEndEvent.target.objId );
		let draggedNote = noteAndRoute.note;
		let route = noteAndRoute.route;

		// ... then the layerGroup is searched...
		let draggedLayerGroup = theTravelNotesData.mapObjects.get ( dragEndEvent.target.objId );
		if ( null === route ) {

			// the note is not attached to a route, so the coordinates of the note can be directly changed
			draggedNote.latLng = [ dragEndEvent.target.getLatLng ( ).lat, dragEndEvent.target.getLatLng ( ).lng ];
			theEventDispatcher.dispatch ( 'updatetravelnotes' );
		}
		else {

			// the note is attached to the route, so we have to find the nearest point on the route
			// and the distance since the start of the route
			let latLngDistance = theGeometry.getClosestLatLngDistance (
				route,
				[ dragEndEvent.target.getLatLng ( ).lat, dragEndEvent.target.getLatLng ( ).lng ]
			);

			// coordinates and distance are changed in the note
			draggedNote.latLng = latLngDistance.latLng;
			draggedNote.distance = latLngDistance.distance;

			// notes are sorted on the distance
			route.notes.sort (
				( first, second ) => first.distance - second.distance
			);

			// the coordinates of the bullet are adapted
			draggedLayerGroup.getLayer ( draggedLayerGroup.bulletId )
				.setLatLng ( latLngDistance.latLng );
			theEventDispatcher.dispatch ( 'updateitinerary' );
		}

		// in all cases, the polyline is updated
		draggedLayerGroup.getLayer ( draggedLayerGroup.polylineId )
			.setLatLngs ( [ draggedNote.latLng, draggedNote.iconLatLng ] );

		// and the HTML page is adapted
		theEventDispatcher.dispatch ( 'roadbookupdate' );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteBulletDragEL
@classdesc drag event listener for the notes bullet
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteBulletDragEL {

	static handleEvent ( dragEvent ) {
		let draggedNote = theDataSearchEngine.getNoteAndRoute ( dragEvent.target.objId ).note;
		let draggedLayerGroup = theTravelNotesData.mapObjects.get ( dragEvent.target.objId );
		draggedLayerGroup.getLayer ( draggedLayerGroup.polylineId )
			.setLatLngs ( [ [ dragEvent.latlng.lat, dragEvent.latlng.lng ], draggedNote.iconLatLng ] );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteBulletMouseEnterEL
@classdesc mouseenter event listener for the notes bullet
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteBulletMouseEnterEL {

	static handleEvent ( mouseEnterEvent ) {
		mouseEnterEvent.originalEvent.target.style.opacity = theConfig.note.grip.moveOpacity;
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteBulletMouseLeaveEL
@classdesc mouseleave event listener for the notes bullet
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteBulletMouseLeaveEL {

	static handleEvent ( mouseLeaveEvent ) {
		mouseLeaveEvent.originalEvent.target.style.opacity = theConfig.note.grip.opacity;
	}
}

export {
	NoteBulletDragEndEL,
	NoteBulletDragEL,
	NoteBulletMouseEnterEL,
	NoteBulletMouseLeaveEL
};

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteBulletEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/