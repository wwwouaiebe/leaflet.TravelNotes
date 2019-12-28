/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- Config.js file ----------------------------------------------------------------------------------------------------
This file contains:
	- the newConfig function
	- the theConfig object
Changes:
	- v1.4.0:
		- created from DataManager
		- added searchPointMarker, previousSearchLimit, nextSearchLimit to config
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #63 : Find a better solution for provider keys upload
		- Issue #75 : Merge Maps and TravelNotes
Doc reviewed 20191121
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

/* eslint no-magic-numbers: "off" */

/*
--- newConfig funtion -------------------------------------------------------------------------------------------------

This function returns a config object

Patterns : Closure and Singleton
-----------------------------------------------------------------------------------------------------------------------
*/

function newConfig ( ) {

	let myConfig = {
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
			]
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
			cityPostfix : '</span>'
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
		haveCrypto : false
	};

	/*
	--- myCopyObjectTo function -----------------------------------------------------------------------------------

	This method:
		- search recursively all dest properties
		- foreach found property, search the same property in source
		- copy the property value from source to dest if found
		- search recursively all sources properties
		- foreach found property search the same property in dest
		- copy the property value from source to dest

		So:
			- if a property is missing in the user config, the property is selected from the default config
			- if a property is in the user config but missing in the default config, the property is also added (and reminder
			  that the user can have more dashChoices than the default config )
			- if a property is changed in the user config, the property is adapted

	---------------------------------------------------------------------------------------------------------------
	*/

	function myCopyObjectTo ( source, dest ) {
		if ( ( 'object' !== typeof source ) || ( 'object' !== typeof dest ) ) {
			return;
		}
		try {
			for ( let property in dest ) {
				if ( 'object' === typeof dest [ property ] ) {
					myCopyObjectTo ( source [ property ], dest [ property ] );
				}
				else {
					dest [ property ] = source [ property ] || dest [ property ];
				}
			}

			for ( let property in source ) {
				if ( 'object' === typeof source [ property ] ) {
					if ( '[object Array]' === Object.prototype.toString.call ( source [ property ] ) ) {
						dest [ property ] = dest [ property ] || [];
					}
					else {
						dest [ property ] = dest [ property ] || {};
					}
					myCopyObjectTo ( source [ property ], dest [ property ] );
				}
				else {
					dest [ property ] = source [ property ];
				}
			}
		}
		catch ( err ) {
			console.log ( err ? err : 'Not possible to overload Config' );
		}
	}

	/*
	--- myFreeze function -----------------------------------------------------------------------------------------

	---------------------------------------------------------------------------------------------------------------
	*/

	function myFreeze ( object ) {
		for ( let property in object ) {
			if ( 'object' === typeof object [ property ] ) {
				object [ property ] = myFreeze ( object [ property ] );
			}
		}

		return Object.freeze ( object );
	}

	/*
	--- myOverload function ---------------------------------------------------------------------------------------

	---------------------------------------------------------------------------------------------------------------
	*/

	function myOverload ( source ) {
		myCopyObjectTo ( source, myConfig );
		myConfig = myFreeze ( myConfig );
	}

	/*
	--- config object ---------------------------------------------------------------------------------------------

	---------------------------------------------------------------------------------------------------------------
	*/

	return {
		get autoLoad ( ) { return myConfig.autoLoad; },
		get map ( ) { return myConfig.map; },
		get travelNotesToolbarUI ( ) { return myConfig.travelNotesToolbarUI; },
		get layersToolbarUI ( ) { return myConfig.layersToolbarUI; },
		get mouseUI ( ) { return myConfig.mouseUI; },
		get errorUI ( ) { return myConfig.errorUI; },
		get APIKeys ( ) { return myConfig.APIKeys; },
		get contextMenu ( ) { return myConfig.contextMenu; },
		get routing ( ) { return myConfig.routing; },
		get language ( ) { return myConfig.language; },
		get itineraryPointMarker ( ) { return myConfig.itineraryPointMarker; },
		get searchPointMarker ( ) { return myConfig.searchPointMarker; },
		get searchPointPolyline ( ) { return myConfig.searchPointPolyline; },
		get previousSearchLimit ( ) { return myConfig.previousSearchLimit; },
		get nextSearchLimit ( ) { return myConfig.nextSearchLimit; },
		get wayPoint ( ) { return myConfig.wayPoint; },
		get route ( ) { return myConfig.route; },
		get note ( ) { return myConfig.note; },
		get itineraryPointZoom ( ) { return myConfig.itineraryPointZoom; },
		get routeEditor ( ) { return myConfig.routeEditor; },
		get travelEditor ( ) { return myConfig.travelEditor; },
		get haveBeforeUnloadWarning ( ) { return myConfig.haveBeforeUnloadWarning; },
		get overpassApiUrl ( ) { return myConfig.overpassApiUrl; },
		get nominatim ( ) { return myConfig.nominatim; },
		get geoLocation ( ) { return myConfig.geoLocation; },
		get haveCrypto ( ) { return myConfig.haveCrypto; },

		overload : source => myOverload ( source )

	};
}

/*
--- theConfig object ---------------------------------------------------------------------------------------------------

The one and only one config

-----------------------------------------------------------------------------------------------------------------------
*/

let theConfig = newConfig ( );

export { theConfig };

/*
--- End of Config.js file ---------------------------------------------------------------------------------------------
*/