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
Doc reviewed 20210714
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

@module Config
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theHTMLSanitizer } from '../util/HTMLSanitizer.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc Class used to store the configuration of the code
@see {@link theConfig} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class Config {

	/**
	The default configuration
	*/

	/* eslint-disable no-magic-numbers */
	#config = {
		APIKeys : {
			saveToSessionStorage : true
		},
		APIKeysDialog : {
			haveUnsecureButtons : true,
			showAPIKeys : true,
			showButton : true
		},
		colorDialog : {
			haveSlider : true,
			initialRed : 0
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
			timeOut : 40,
			url : 'https://lz4.overpass-api.de/api/interpreter'
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

	/**
	copy the properties between two objects
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
	*/

	/* eslint-disable max-depth */

	#copyObjectTo ( source, target ) {
		if ( ( 'object' !== typeof source ) || ( 'object' !== typeof target ) ) {
			return;
		}
		try {

			// iteration on target.
			for ( let property in target ) {
				if ( 'object' === typeof target [ property ] ) {
					this.#copyObjectTo ( source [ property ], target [ property ] );
				}
				else if ( typeof ( source [ property ] ) === typeof ( target [ property ] ) ) {
					if ( 'string' === typeof ( target [ property ] ) ) {
						if ( 'color' === property ) {
							target [ property ] = theHTMLSanitizer.sanitizeToColor ( source [ property ] )
								||
								target [ property ];
						}
						else if ( 'url' === property ) {
							target [ property ] = theHTMLSanitizer.sanitizeToUrl ( source [ property ] ).url;
						}
						else {
							target [ property ] =
									theHTMLSanitizer.sanitizeToJsString ( source [ property ] );
						}
					}
					else {
						target [ property ] = source [ property ] || target [ property ];
					}
				}
			}

			// iteration on source
			for ( let property in source ) {
				if ( 'object' === typeof source [ property ] ) {
					if ( '[object Array]' === Object.prototype.toString.call ( source [ property ] ) ) {
						target [ property ] = target [ property ] || [];
					}
					else {
						target [ property ] = target [ property ] || {};
					}
					this.#copyObjectTo ( source [ property ], target [ property ] );
				}
				else if ( 'string' === typeof ( target.property ) ) {
					target [ property ] =
								theHTMLSanitizer.sanitizeToHtmlString ( source [ property ], [] ).htmlString;
				}
				else {
					target [ property ] = source [ property ];
				}
			}
		}
		catch ( err ) {
			if ( err instanceof Error ) {
				console.error ( err );
			}
		}
	}

	/* eslint-enable max-depth */

	/**
	Freeze an object recursively
	@param {Object} object The object to freeze
	@private
	*/

	#freeze ( object ) {
		for ( let property in object ) {
			if ( 'object' === typeof object [ property ] ) {
				object [ property ] = this.#freeze ( object [ property ] );
			}
		}

		return Object.freeze ( object );
	}

	/**
	The config for API keys
	@type {Object}
	@readonly
	*/

	get APIKeys ( ) { return this.#config.APIKeys; }

	/**
	The config for the APIKeys dialog
	@type {Object}
	@readonly
	*/

	get APIKeysDialog ( ) { return this.#config.APIKeysDialog; }

	/**
	The config for the color dialog
	@type {Object}
	@readonly
	*/

	get colorDialog ( ) { return this.#config.colorDialog; }

	/**
	The config for the context menus
	@type {Object}
	@readonly
	*/

	get contextMenu ( ) { return this.#config.contextMenu; }

	/**
	The config for the errors UI
	@type {Object}
	@readonly
	*/

	get errorsUI ( ) { return this.#config.errorsUI; }

	/**
	The config for the geocoder
	@type {Object}
	@readonly
	*/

	get geoCoder ( ) { return this.#config.geoCoder; }

	/**
	The config for the geoLocation
	@type {Object}
	@readonly
	*/

	get geoLocation ( ) { return this.#config.geoLocation; }

	/**
	The config for the itineraryPane UI
	@type {Object}
	@readonly
	*/

	get itineraryPaneUI ( ) { return this.#config.itineraryPaneUI; }

	/**
	The config for itinerary points
	@type {Object}
	@readonly
	*/

	get itineraryPoint ( ) { return this.#config.itineraryPoint; }

	/**
	The config for the layersTollbar UI
	@type {Object}
	@readonly
	*/

	get layersToolbarUI ( ) { return this.#config.layersToolbarUI; }

	/**
	The config for the map
	@type {Object}
	@readonly
	*/

	get map ( ) { return this.#config.map; }

	/**
	The config for the mouse UI
	@type {Object}
	@readonly
	*/

	get mouseUI ( ) { return this.#config.mouseUI; }

	/**
	The config for Nominatim
	@type {Object}
	@readonly
	*/

	get nominatim ( ) { return this.#config.nominatim; }

	/**
	The config for the notes
	@type {Object}
	@readonly
	*/

	get note ( ) { return this.#config.note; }

	/**
	The config for the notes dialog
	@type {Object}
	@readonly
	*/

	get noteDialog ( ) { return this.#config.noteDialog; }

	/**
	The config for the OSM Search
	@type {Object}
	@readonly
	*/

	get osmSearch ( ) { return this.#config.osmSearch; }

	/**
	The config for the OverpassAPI
	@type {Object}
	@readonly
	*/

	get overpassApi ( ) { return this.#config.overpassApi; }

	/**
	The config for the print route
	@type {Object}
	@readonly
	*/

	get printRouteMap ( ) { return this.#config.printRouteMap; }

	/**
	The config for routes
	@type {Object}
	@readonly
	*/

	get route ( ) { return this.#config.route; }

	/**
	The config for the route editor
	@type {Object}
	@readonly
	*/

	get routeEditor ( ) { return this.#config.routeEditor; }

	/**
	The config for the Travel Editor
	@type {Object}
	@readonly
	*/

	get travelEditor ( ) { return this.#config.travelEditor; }

	/**
	The config for travelNotes apperance
	@type {Object}
	@readonly
	*/

	get travelNotes ( ) { return this.#config.travelNotes; }

	/**
	The config for TravelNotesToolbar UI
	@type {Object}
	@readonly
	*/

	get travelNotesToolbarUI ( ) { return this.#config.travelNotesToolbarUI; }

	/**
	The config for waypoints
	@type {Object}
	@readonly
	*/

	get wayPoint ( ) { return this.#config.wayPoint; }

	/**
	Overload the default config with another config. The config can be overloaded only once!
	*/

	overload ( source ) {
		this.#copyObjectTo ( source, this.#config );
		this.#config = this.#freeze ( this.#config );
	}

}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of Config class
@type {Config}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theConfig = new Config ( );

export default theConfig;

/*
--- End of Config.js file -----------------------------------------------------------------------------------------------------
*/