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

import theDataSearchEngine from '../data/DataSearchEngine.js';
import theTravelNotesData from '../data/TravelNotesData.js';
import NoteContextMenu from '../contextMenus/NoteContextMenu.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@module coreMapEditor
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteMarkerContextMenuEL
@classdesc contextmenu event listener for the notes marker
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteMarkerContextMenuEL {

	static handleEvent ( contextMenuEvent ) {
		new NoteContextMenu ( contextMenuEvent ).show ( );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteMarkerDragEndEL
@classdesc dragend event listener for the notes marker
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteMarkerDragEndEL {

	static handleEvent ( dragEndEvent ) {

		// The TravelNotes note linked to the marker is searched...
		let draggedNote = theDataSearchEngine.getNoteAndRoute ( dragEndEvent.target.objId ).note;

		// ... new coordinates are saved in the TravelNotes note...
		draggedNote.iconLatLng = [ dragEndEvent.target.getLatLng ( ).lat, dragEndEvent.target.getLatLng ( ).lng ];

		// ... then the layerGroup is searched...
		let draggedLayerGroup = theTravelNotesData.mapObjects.get ( dragEndEvent.target.objId );

		// ... and finally the polyline is updated with the new coordinates
		draggedLayerGroup.getLayer (
			draggedLayerGroup.polylineId
		)
			.setLatLngs (
				[ draggedNote.latLng, draggedNote.iconLatLng ]
			);
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class NoteMarkerDragEL
@classdesc drag event listener for the notes marker
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class NoteMarkerDragEL {

	static handleEvent ( dragEvent ) {

		// The TravelNotes note linked to the marker is searched...
		let draggedNote = theDataSearchEngine.getNoteAndRoute ( dragEvent.target.objId ).note;

		// ... then the layerGroup is searched...
		let draggedLayerGroup = theTravelNotesData.mapObjects.get ( dragEvent.target.objId );

		// ... and finally the polyline is updated with the new coordinates
		draggedLayerGroup.getLayer ( draggedLayerGroup.polylineId )
			.setLatLngs ( [ draggedNote.latLng, [ dragEvent.latlng.lat, dragEvent.latlng.lng ] ] );
	}
}

export {
	NoteMarkerContextMenuEL,
	NoteMarkerDragEndEL,
	NoteMarkerDragEL
};

/*
@------------------------------------------------------------------------------------------------------------------------------

end of NoteMarkerEventListeners.js file

@------------------------------------------------------------------------------------------------------------------------------
*/