/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
	- v1.4.0:
		- created from DataManager
		- added searchPointMarker, previousSearchLimit, nextSearchLimit to config
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #63 : Find a better solution for provider keys upload
		- Issue #75 : Merge Maps and TravelNotes
	- v1.9.0:
		- issue #101 : Add a print command for a route
	- v1.11.0:
		- Issue #110 : Add a command to create a SVG icon from osm for each maneuver
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20200731
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Config.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module Config
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/* eslint no-magic-numbers: "off" */

let ourPrivateConfig = {
	autoLoad : false,
	map :
	{
		center : {
			lat : 50.50923,
			lng : 5.49542
		},
		zoom : 12
	},
	travelNotesToolbarUI :
	{
		contactMail : 'https://github.com/wwwouaiebe/leaflet.TravelNotes/issues'
	},
	layersToolbarUI : {
		haveLayersToolbarUI : true,
		toolbarTimeOut : 1500,
		contactMail : 'https://github.com/wwwouaiebe/leaflet.TravelNotes/issues',
		theDevil : {
			addButton : false,
			title : 'Reminder! The devil will know everything about you',
			text : '&#x1f47f;'
		}
	},
	mouseUI : {
		haveMouseUI : true
	},
	errorUI :
	{
		timeOut : 10000,
		helpTimeOut : 30000,
		showError : true,
		showWarning : true,
		showInfo : true,
		showHelp : true
	},
	geoLocation : {
		color : 'red',
		radius : 11,
		zoomToPosition : true,
		zoomFactor : 17,
		options : {
			enableHighAccuracy : false,
			maximumAge : 0,
			timeout : Infinity
		}
	},
	APIKeys : {
		showDialogButton : true,
		saveToSessionStorage : true,
		showAPIKeysInDialog : true,
		dialogHaveUnsecureButtons : true
	},
	contextMenu : {
		timeout : 1500
	},
	routing : {
		auto : true
	},
	language : 'fr',
	itineraryPointMarker : {
		color : 'red',
		weight : 2,
		radius : 7,
		fill : false
	},
	searchPointMarker : {
		color : 'green',
		weight : 4,
		radius : 20,
		fill : false
	},
	searchPointPolyline : {
		color : 'green',
		weight : 4,
		radius : 20,
		fill : false
	},
	previousSearchLimit : {
		color : 'green',
		fill : false,
		weight : 1
	},
	nextSearchLimit : {
		color : 'red',
		fill : false,
		weight : 1
	},
	wayPoint : {
		reverseGeocoding : false
	},
	route : {
		color : '#ff0000',
		width : 3,
		dashArray : 0,
		dashChoices : [
			{
				text : '——————',
				iDashArray : null
			},
			{
				text : '— — — — —',
				iDashArray : [ 4, 2 ]
			},
			{
				text : '—‧—‧—‧—‧—',
				iDashArray : [ 4, 2, 0, 2 ]
			},
			{
				text : '················',
				iDashArray : [ 0, 2 ]
			}
		],
		elev : {
			smooth : true,
			smoothCoefficient : 0.25,
			smoothPoints : 3
		},
		showDragTooltip : 3
	},
	note : {
		reverseGeocoding : false,
		grip : {
			size : 10,
			opacity : 0
		},
		polyline : {
			color : 'gray',
			weight : 1
		},
		style : '',
		svgIconWidth : 200,
		svgAnleMaxDirection :
		{
			right : 35,
			slightRight : 80,
			continue : 100,
			slightLeft : 145,
			left : 200,
			sharpLeft : 270,
			sharpRight : 340
		},
		svgZoom : 17,
		svgAngleDistance : 10,
		svgHamletDistance : 200,
		svgVillageDistance : 400,
		svgCityDistance : 1200,
		svgTownDistance : 1500,
		svgTimeOut : 15000,
		cityPrefix : '<span class="TravelNotes-NoteHtml-Address-City">',
		cityPostfix : '</span>',
		maxManeuversNotes : 100
	},
	itineraryPointZoom : 17,
	routeEditor : {
		displayEditionInHTMLPage : true
	},
	travelEditor : {
		clearAfterSave : true,
		startMinimized : true,
		timeout : 1000,
		startupRouteEdition : true
	},
	haveBeforeUnloadWarning : true,
	overpassApiUrl : 'https://lz4.overpass-api.de/api/interpreter',
	nominatim :
	{
		url : 'https://nominatim.openstreetmap.org/',
		language : '*'
	},
	printRouteMap :
	{
		isEnabled : true,
		maxTiles : 240,
		paperWidth : 287,
		paperHeight : 200,
		pageBreak : false,
		printNotes : true,
		borderWidth : 30,
		zoomFactor : 15,
		entryPointMarker : {
			color : 'green',
			weight : 4,
			radius : 10,
			fill : true,
			fillOpacity : 1
		},
		exitPointMarker : {
			color : 'red',
			weight : 4,
			radius : 10,
			fill : true,
			fillOpacity : 1
		}
	},
	haveCrypto : false,
	itineraryPane :
	{
		showNotes : true,
		showManeuvers : false
	}
};

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCopyObjectTo
@desc copy the properties between two objects
@param {Object} source The source object
@param {Object} target The target object
@example
This method:
- search recursively all target properties
- foreach found property, search the same property in source
- copy the property value from source to target if found
- search recursively all sources properties
- foreach found property search the same property in target
- copy the property value from source to target
So:
- if a property is missing in the user config, the property is selected from the default config
- if a property is in the user config but missing in the default config, the property is also added (and reminder
  that the user can have more dashChoices than the default config )
- if a property is changed in the user config, the property is adapted
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourCopyObjectTo ( source, target ) {
	if ( ( 'object' !== typeof source ) || ( 'object' !== typeof target ) ) {
		return;
	}
	try {
		for ( let property in target ) {
			if ( 'object' === typeof target [ property ] ) {
				ourCopyObjectTo ( source [ property ], target [ property ] );
			}
			else {
				target [ property ] = source [ property ] || target [ property ];
			}
		}

		for ( let property in source ) {
			if ( 'object' === typeof source [ property ] ) {
				if ( '[object Array]' === Object.prototype.toString.call ( source [ property ] ) ) {
					target [ property ] = target [ property ] || [];
				}
				else {
					target [ property ] = target [ property ] || {};
				}
				ourCopyObjectTo ( source [ property ], target [ property ] );
			}
			else {
				target [ property ] = source [ property ];
			}
		}
	}
	catch ( err ) {
		console.log ( err ? err : 'Not possible to overload Config' );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourFreeze
@desc Freeze an object recursively
@param {Object} object The object to freeze
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourFreeze ( object ) {
	for ( let property in object ) {
		if ( 'object' === typeof object [ property ] ) {
			object [ property ] = ourFreeze ( object [ property ] );
		}
	}

	return Object.freeze ( object );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc Class used to store the configuration of the code
@see {@link theConfig} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class Config {
	get autoLoad ( ) { return ourPrivateConfig.autoLoad; }
	get map ( ) { return ourPrivateConfig.map; }
	get travelNotesToolbarUI ( ) { return ourPrivateConfig.travelNotesToolbarUI; }
	get layersToolbarUI ( ) { return ourPrivateConfig.layersToolbarUI; }
	get mouseUI ( ) { return ourPrivateConfig.mouseUI; }
	get errorUI ( ) { return ourPrivateConfig.errorUI; }
	get APIKeys ( ) { return ourPrivateConfig.APIKeys; }
	get contextMenu ( ) { return ourPrivateConfig.contextMenu; }
	get routing ( ) { return ourPrivateConfig.routing; }
	get language ( ) { return ourPrivateConfig.language; }
	get itineraryPointMarker ( ) { return ourPrivateConfig.itineraryPointMarker; }
	get searchPointMarker ( ) { return ourPrivateConfig.searchPointMarker; }
	get searchPointPolyline ( ) { return ourPrivateConfig.searchPointPolyline; }
	get previousSearchLimit ( ) { return ourPrivateConfig.previousSearchLimit; }
	get nextSearchLimit ( ) { return ourPrivateConfig.nextSearchLimit; }
	get wayPoint ( ) { return ourPrivateConfig.wayPoint; }
	get route ( ) { return ourPrivateConfig.route; }
	get note ( ) { return ourPrivateConfig.note; }
	get itineraryPointZoom ( ) { return ourPrivateConfig.itineraryPointZoom; }
	get routeEditor ( ) { return ourPrivateConfig.routeEditor; }
	get travelEditor ( ) { return ourPrivateConfig.travelEditor; }
	get haveBeforeUnloadWarning ( ) { return ourPrivateConfig.haveBeforeUnloadWarning; }
	get overpassApiUrl ( ) { return ourPrivateConfig.overpassApiUrl; }
	get nominatim ( ) { return ourPrivateConfig.nominatim; }
	get geoLocation ( ) { return ourPrivateConfig.geoLocation; }
	get printRouteMap ( ) { return ourPrivateConfig.printRouteMap; }
	get haveCrypto ( ) { return ourPrivateConfig.haveCrypto; }
	get itineraryPane ( ) { return ourPrivateConfig.itineraryPane; }

	overload ( source ) {
		ourCopyObjectTo ( source, ourPrivateConfig );
		ourPrivateConfig = ourFreeze ( ourPrivateConfig );
	}

}

let ourConfig = new Config;

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of Config class
	@type {Config}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourConfig as theConfig
};

/*
--- End of Config.js file -----------------------------------------------------------------------------------------------------
*/