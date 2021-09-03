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
	- v1.12.0:
		- created
	- v2.0.0:
		- Issue ♯135 : Remove innerHTML from code
		- Issue ♯138 : Protect the app - control html entries done by user.
	-v2.2.0:
		- Issue ♯129 : Add an indicator when the travel is modified and not saved
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Constants.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module main
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/* eslint no-magic-numbers: "off" */

/**

@------------------------------------------------------------------------------------------------------------------------------

@readonly
@enum {Object}
@desc Enum for the ColorControl
@property {number} minColorValue
@property {number} maxColorValue
@property {number} rowsNumber
@property {number} cellsNumber
@property {number} deltaColor
@property {number} sliderMaxValue
@property {number} sliderStep
@property {number} initialRed
@public

@------------------------------------------------------------------------------------------------------------------------------
 */

export const COLOR_CONTROL = Object.freeze ( {
	minColorValue : 0,
	maxColorValue : 255,
	rowsNumber : 6,
	cellsNumber : 6,
	deltaColor : 51,
	sliderMaxValue : 100,
	sliderStep : 20,
	initialRed : 0
} );

/**

@------------------------------------------------------------------------------------------------------------------------------

@readonly
@enum {Object}
@desc Enum for the save status displayed with the coordinates and zoom values
@property {string} notSaved The string to display when the travel is modified since more than 5 minutes
@property {string} modified The string to display when the travel is modified since less than 5 minutes
@property {string} saved The string to display when the travel is not modified
@public

@------------------------------------------------------------------------------------------------------------------------------
 */

export const SAVE_STATUS = Object.freeze ( {
	notSaved : '🔴', // red circle
	modified : '🟡', // yellow circle
	saved : '🟢' // green circle
} );

/**

@------------------------------------------------------------------------------------------------------------------------------

@readonly
@enum {Object}
@desc Enum for distances
@property {number} fixed The decimal length used for distances
@property {number} invalid The distance is invalid
@property {number} defaultValue Default value for distances
@public

@------------------------------------------------------------------------------------------------------------------------------
 */

export const DISTANCE = Object.freeze ( {
	fixed : 2,
	invalid : -1,
	defaultValue : 0,
	metersInKm : 1000
} );

/**

@------------------------------------------------------------------------------------------------------------------------------

@readonly
@enum {Object}
@desc Enum for geolocation status
@property {number} refusedByUser The user don't accept to be localized
@property {number} disabled The geolocation is not available (disabled in the browser or unsecure context)
@property {number} inactive The geolocation is inactive
@property {number} active the geolocation is active
@public

@------------------------------------------------------------------------------------------------------------------------------
 */

export const GEOLOCATION_STATUS = Object.freeze ( {
	refusedByUser : -1,
	disabled : 0,
	inactive : 1,
	active : 2
} );

/**

@------------------------------------------------------------------------------------------------------------------------------

@readonly
@enum {Object}
@desc Enum for id's for panes in thePaneManagerUI
@property {string} invalidPane The current pane is invalid
@property {string} itineraryPane The itinerary pane
@property {string} travelNotesPane The travel notes pane
@property {string} searchPane The search pane
@public

@------------------------------------------------------------------------------------------------------------------------------
 */

export const PANE_ID = Object.freeze ( {
	invalidPane : '43a6a53e-008a-4910-80a6-7a87d301ea15',
	itineraryPane : '8fbf0da7-4e6f-4bc7-8e20-1388461ccde7',
	travelNotesPane : 'dffe782b-07df-4b81-a318-f287c0cf5ec6',
	searchPane : '228f00d7-43a8-4c13-897d-70400cb6dd58'
} );

/**

@------------------------------------------------------------------------------------------------------------------------------

@readonly
@enum {Object}
@desc Enum for elevations
@property {number} fixed The decimal length used for elevation
@property {number} defaultValue Default value for elevation
@public

@------------------------------------------------------------------------------------------------------------------------------
 */

export const ELEV = Object.freeze ( {
	fixed : 2,
	defaultValue : 0
} );

/**

@------------------------------------------------------------------------------------------------------------------------------

@readonly
@enum {Object}
Enum for latitude and longitude
@desc @property {number} fixed The decimal length used for latitude and longitude
@property {number} defaultValue Default value for latitude and longitude
@public

@------------------------------------------------------------------------------------------------------------------------------
 */

export const LAT_LNG = Object.freeze ( {
	defaultValue : 0,
	fixed : 6,
	maxLat : 90,
	minLat : -90,
	maxLng : 180,
	minLng : -180
} );

/**

@------------------------------------------------------------------------------------------------------------------------------

@readonly
@enum {Object}
@desc Enum for edition status of a route
@property {number} notEdited The route is currently not edited
@property {number} editedNoChange The route is currently edited but without changes
@property {number} editedChanged The route is currently edited and changed
@public

@------------------------------------------------------------------------------------------------------------------------------
 */

export const ROUTE_EDITION_STATUS = Object.freeze ( {
	notEdited : 0,
	editedNoChange : 1,
	editedChanged : 2
} );

/**

@------------------------------------------------------------------------------------------------------------------------------

@readonly
@enum {Object}
@desc Enum for edition of a svg profile
@property {number} margin The margin around the elevation graph
@property {number} height The height of the elevation graph
@property {number} width The width of the elevation graph
@property {number} yDeltaText the vertical distance between texts of the flag
@property {number} xDeltaText the horizontal distance between the texts and the vertical line of the flag
@property {Array.<number>} vScales The possible scales for the elevation
@property {Array.<number>} hScales The possible scales for the distance
@public

@------------------------------------------------------------------------------------------------------------------------------
 */

export const SVG_PROFILE = Object.freeze ( {
	margin : 100,
	height : 500,
	width : 1000,
	yDeltaText : 30,
	xDeltaText : 10,
	vScales : [ 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000 ],
	hScales : [ 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000 ]
} );

/**

@------------------------------------------------------------------------------------------------------------------------------

@readonly
@enum {Object}
@desc Enum for default icon dimensions
@property {number} width The default width
@property {number} height The default height
@public

@------------------------------------------------------------------------------------------------------------------------------
 */

export const ICON_DIMENSIONS = Object.freeze ( {
	width : 40,
	height : 40,
	svgViewboxDim : 200
} );

/**

@------------------------------------------------------------------------------------------------------------------------------

@readonly
@enum {Object}
@desc Enum for angular operations
@public

@------------------------------------------------------------------------------------------------------------------------------
 */

export const DEGREES = Object.freeze ( {
	d0 : 0,
	d90 : 90,
	d180 : 180,
	d270 : 270,
	d360 : 360,
	d540 : 540,
	toRadians : Math.PI / 180,
	fromRadians : 180 / Math.PI
} );

/**

@------------------------------------------------------------------------------------------------------------------------------

@readonly
@enum {Object}
@desc Enum for map svg icons
@public

@------------------------------------------------------------------------------------------------------------------------------
 */

export const ICON_POSITION = Object.freeze ( {
	atStart : -1,
	onRoute : 0,
	atEnd : 1
} );

/**

@var {Array.<number>} MOUSE_WHEEL_FACTORS
@desc An array with correction factors to use in the wheel event (wheelEvent.deltaX and wheelEvent.deltaY are dependant of
wheelEvent.deltaMode and deltaMode is browser dependant...)
@constant
*/

export const MOUSE_WHEEL_FACTORS = [ 0.3, 10, 1 ];

export const INVALID_OBJ_ID = -1;

export const NOT_FOUND = -1;

export const ZERO = 0;

export const LAT = 0;

export const ONE = 1;

export const LNG = 1;

export const TWO = 2;

export const ELEVATION = 2;

export const THREE = 3;

export const HEXADECIMAL = 16;

export const HTTP_STATUS_OK = 200;

export const OSM_COUNTRY_ADMIN_LEVEL = '2';

export const SVG_NS = 'http://www.w3.org/2000/svg';

export const EARTH_RADIUS = 6371e3;

export const WAY_POINT_ICON_SIZE = 20;

export const DIALOG_DRAG_MARGIN = 20;

/*
--- End of Constants.js file --------------------------------------------------------------------------------------------------
*/