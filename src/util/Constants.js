/* eslint no-magic-numbers: "off" */

export const DISTANCE = Object.freeze ( {
	fixed : 2,
	invalid : -1,
	defaultValue : 0
} );

/**

@------------------------------------------------------------------------------------------------------------------------------

Enum for geolocation status
@readonly
@enum {Object}
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

export const PANE_ID = Object.freeze ( {
	invalidPane : '43a6a53e-008a-4910-80a6-7a87d301ea15',
	itineraryPane : '8fbf0da7-4e6f-4bc7-8e20-1388461ccde7',
	travelNotesPane : 'dffe782b-07df-4b81-a318-f287c0cf5ec6',
	searchPane : '228f00d7-43a8-4c13-897d-70400cb6dd58'
} );

export const ELEV = Object.freeze ( {
	fixed : 2,
	defaultValue : 0
} );

export const LAT_LNG = Object.freeze ( {
	defaultValue : 0,
	fixed : 6
} );

export const ROUTE_EDITION_STATUS = Object.freeze ( {
	notEdited : 0,
	editedNoChange : 1,
	editedChanged : 2
} );

export const SVG_PROFILE = Object.freeze ( {
	margin : 100,
	height : 500,
	width : 1000,
	yDeltaText : 30,
	xDeltaText : 10,
	vScales : [ 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000 ],
	hScales : [ 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000 ]
} );

export const ICON_DIMENSIONS = Object.freeze ( {
	width : 40,
	height : 40
} );

export const MOUSE_WHEEL_FACTORS = [ 0.3, 10, 1 ];

export const INVALID_OBJ_ID = -1;

export const NOT_FOUND = -1;

export const ZERO = 0;

export const ONE = 1;

export const TWO = 2;