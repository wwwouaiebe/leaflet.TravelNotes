/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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
	- the Config object
	- the module.exports implementation
Changes:
	- v1.4.0:
		- created from DataManager
		- added searchPointMarker, previousSearchLimit, nextSearchLimit to config
Doc reviewed 20181216
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/
( function ( ) {
	
	'use strict';

	var config = function ( ) {

		var m_Config = {
			contextMenu : {
				timeout : 1500
			},
			errorMessages : {
				timeout : 20000
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
				fill : false,
			},
			previousSearchLimit : {
				color : "green",
				fill : false,
				weight : 1
			},
			nextSearchLimit : {
				color : "red",
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
						text : "——————",
						iDashArray : null
					}, 
					{
						text : "— — — — —",
						iDashArray : [ 4, 2 ] 
					}, 
					{
						text : "—‧—‧—‧—‧—",
						iDashArray : [ 4, 2, 0, 2 ] 
					}, 
					{
						text : "················",
						iDashArray : [ 0, 2 ] 
					}
				]
			},
			note : {
				reverseGeocoding : false,
				grip : { 
					size : 10,
					opacity: 0 
				},
				polyline : {
					color : 'gray',
					weight : 1
				},
				style : 'TravelNotes-NotesStyle',
				svgIconWidth : 200,
				svgAnleMaxDirection:
				{
					right:35,
					slightRight:80,
					continue:100,
					slightLeft:145,
					left:200,
					sharpLeft:270,
					sharpRight:340
				},
				svgZoom : 17,
				svgAngleDistance : 10,
				svgHamletDistance : 200,
				svgVillageDistance : 400,
				svgCityDistance : 1200,
				svgTownDistance: 1500,
				
				cityPrefix : "<span class='TravelNotes-NoteHtml-Address-City'>",
				cityPostfix : "</span'>"
			},
			itineraryPointZoom: 17,
			routeEditor : {
				displayEditionInHTMLPage : true
			},
			travelEditor : {
				clearAfterSave : true,
				startMinimized : true,
				timeout : 1000,
				startupRouteEdition:true
			},
			haveBeforeUnloadWarning : true,
			overpassApiUrl : "https://lz4.overpass-api.de/api/interpreter" 

		};		

		/*
		--- m_CopyObjectTo function -----------------------------------------------------------------------------------

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

		var m_CopyObjectTo = function ( source, dest ) {
			if ( ( 'object' !== typeof source ) || ( 'object' !== typeof dest ) ) {
				return;
			}
			try {
				var property;
				for ( property in dest ) {
					if ( 'object' === typeof dest [ property ] ) {
						m_CopyObjectTo ( source [ property ], dest [ property ] );
					}
					else {
						dest [ property ] = source [ property ] || dest [ property ];
					}
				}

				for ( property in source ) {
					if ( 'object' === typeof source [ property ] ) {
						if ( Object.prototype.toString.call ( source [ property ] ) == '[object Array]' ) {
							dest [ property ] = dest [ property ] || [];
						}
						else {
							dest [ property ] = dest [ property ] || {};
						}
						m_CopyObjectTo ( source [ property ], dest [ property ] );
					}
					else {
						dest [ property ] = source [ property ];
					}
				}
			}
			catch ( e ) {
				console.log ( e );
				console.log ( 'Not possible to overload Config' );
			}
			
			return;
		};
		
		/*
		--- m_Freeze function -----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Freeze = function ( object ) {
			var property;
			for ( property in object ) {
				if ( 'object' === typeof object [ property ] ) {
					object [ property ] = m_Freeze (  object [ property ] );
				}
			}
			
			return Object.freeze (object );
		};
		
		/*
		--- m_Overload function ---------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		var m_Overload = function ( source ) {
			m_CopyObjectTo ( source, m_Config );
			m_Config = m_Freeze ( m_Config );
		};
	
		/* 
		--- config object ---------------------------------------------------------------------------------------------
		
		---------------------------------------------------------------------------------------------------------------
		*/

		return {
			
			get contextMenu ( ) { return m_Config.contextMenu; },
			get errorMessages ( ) { return m_Config.errorMessages; },
			get routing ( ) { return m_Config.routing; },
			get language ( ) { return m_Config.language; },
			get itineraryPointMarker ( ) { return m_Config.itineraryPointMarker; },
			get searchPointMarker ( ) { return m_Config.searchPointMarker; },
			get searchPointPolyline ( ) { return m_Config.searchPointPolyline; },
			get previousSearchLimit ( ) { return m_Config.previousSearchLimit; },
			get nextSearchLimit ( ) { return m_Config.nextSearchLimit; },
			get wayPoint ( ) { return m_Config.wayPoint; },
			get route ( ) { return m_Config.route; },
			get note ( ) { return m_Config.note; },
			get itineraryPointZoom ( ) { return m_Config.itineraryPointZoom; },
			get routeEditor ( ) { return m_Config.routeEditor; },
			get travelEditor ( ) { return m_Config.travelEditor; },
			get haveBeforeUnloadWarning ( ) { return m_Config.haveBeforeUnloadWarning; },
			get overpassApiUrl ( ) { return m_Config.overpassApiUrl; },
			
			overload : function ( newConfig ) { m_Overload ( newConfig ) ;}
			
		};
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = config ( );
	}
	
} ) ( );

/*
--- End of Config.js file ---------------------------------------------------------------------------------------------
*/
