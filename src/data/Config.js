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
	- v1.4.0:
		- created from DataManager
		- added searchPointMarker, previousSearchLimit, nextSearchLimit to config
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
		- Issue ♯63 : Find a better solution for provider keys upload
		- Issue ♯75 : Merge Maps and TravelNotes
	- v1.9.0:
		- Issue ♯101 : Add a print command for a route
	- v1.11.0:
		- Issue ♯110 : Add a command to create a SVG icon from osm for each maneuver
	- v1.12.0:
		- Issue ♯120 : Review the UserInterface
	- v2.0.0:
		- Issue ♯136 : Remove html entities from js string
		- Issue ♯138 : Protect the app - control html entries done by user.
		- Issue ♯139 : Remove Globals
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Config.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module data
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@class Config
@classdesc Class used to store the configuration of the code
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/
/* eslint-disable no-magic-numbers */

let theConfig = {
	APIKeys : {
		saveToSessionStorage : true
	},
	APIKeysDialog : {
		haveUnsecureButtons : true,
		showAPIKeys : true,
		showButton : true
	},
	contextMenu : {
		timeout : 1500
	},
	errorsUI :
	{
		helpTimeOut : 30000,
		showError : true,
		showHelp : true,
		showInfo : true,
		showWarning : true,
		timeOut : 10000
	},
	geoCoder : {
		distances : {
			city : 1200,
			hamlet : 200,
			town : 1500,
			village : 400
		},
		osmCityAdminLevel : {
			DEFAULT : '8',
			GB : '10'
		}
	},
	geoLocation : {
		marker : {
			color : '\u0023ff0000',
			radius : 11
		},
		options : {
			enableHighAccuracy : false,
			maximumAge : 0,
			timeout : Infinity
		},
		zoomFactor : 17,
		zoomToPosition : true
	},
	itineraryPaneUI :
	{
		showManeuvers : false,
		showNotes : true
	},
	itineraryPoint : {
		marker : {
			color : '\u0023ff0000',
			fill : false,
			radius : 7,
			weight : 2
		},
		zoomFactor : 17
	},
	layersToolbarUI : {
		haveLayersToolbarUI : true,
		toolbarTimeOut : 1500,
		theDevil : {
			addButton : false
		}
	},
	map :
	{
		center : {
			lat : 50.50923,
			lng : 5.49542
		},
		zoom : 12
	},
	mouseUI : {
		haveMouseUI : true
	},
	nominatim :
	{
		url : 'https://nominatim.openstreetmap.org/',
		language : '*'
	},
	note : {
		grip : {
			size : 10,
			opacity : 0,
			moveOpacity : 1
		},
		haveBackground : false,
		maxManeuversNotes : 100,
		polyline : {
			color : '\u0023808080',
			weight : 1
		},
		reverseGeocoding : false,
		svgIcon : {
			angleDistance : 10,
			angleDirection :
			{
				right : 35,
				slightRight : 80,
				continue : 100,
				slightLeft : 145,
				left : 200,
				sharpLeft : 270,
				sharpRight : 340
			},
			rcnRefDistance : 20,
			roadbookFactor : 1,
			zoom : 17
		}
	},
	noteDialog : {
		areaHeight : {
			icon : 2,
			popupContent : 8
		},
		mask : {
			iconsDimension : true,
			iconTextArea : false,
			tooltip : false,
			popupContent : false,
			address : false,
			link : false,
			phone : true
		},
		theDevil : {
			addButton : false,
			zoomFactor : 17
		}
	},
	osmSearch : {
		nextSearchLimit : {
			color : '\u0023ff0000',
			fill : false,
			weight : 1
		},
		previousSearchLimit : {
			color : '\u0023006400',
			fill : false,
			weight : 1
		},
		searchPointMarker : {
			color : '\u0023006400',
			fill : false,
			radius : 20,
			weight : 4
		},
		searchPointPolyline : {
			color : '\u0023006400',
			fill : false,
			weight : 4
		},
		showSearchNoteDialog : false
	},
	overpassApi : {
		useNwr : true,
		timeOut : 40,
		url : 'https://lz4.overpass-api.de/api/interpreter' // "https://overpass.openstreetmap.fr/api/interpreter"
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
			color : '\u002300ff00',
			weight : 4,
			radius : 10,
			fill : true,
			fillOpacity : 1
		},
		exitPointMarker : {
			color : '\u0023ff0000',
			weight : 4,
			radius : 10,
			fill : true,
			fillOpacity : 1
		}
	},
	route : {
		color : '\u0023ff0000',
		dashArray : 0,
		dashChoices : [
			{
				text : '——————',
				iDashArray : [ 0 ]
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
		showDragTooltip : 3,
		width : 3
	},
	routeEditor : {
		showEditedRouteInRoadbook : true
	},
	travelEditor : {
		startMinimized : true,
		startupRouteEdition : true,
		timeout : 1000
	},
	travelNotes : {
		autoLoad : true,
		haveBeforeUnloadWarning : true,
		language : 'fr'
	},
	travelNotesToolbarUI :
	{
		contactMail : {
			url : 'https://github.com/wwwouaiebe/leaflet.TravelNotes/issues'
		}
	},
	wayPoint : {
		reverseGeocoding : false,
		geocodingIncludeName : false
	}
};
/* eslint-enable no-magic-numbers */

export default theConfig;

/*
--- End of Config.js file -----------------------------------------------------------------------------------------------------
*/