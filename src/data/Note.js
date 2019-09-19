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
--- Note.js file ------------------------------------------------------------------------------------------------------
This file contains:
	- the Note object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
Doc reviewed 20190919
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	var s_ObjType = require ( '../data/ObjType' ) ( 'Note', require ( './Version' ) );

	/*
	--- note function -------------------------------------------------------------------------------------------------

	Patterns : Closure

	-------------------------------------------------------------------------------------------------------------------
	*/

	var note = function ( ) {

		var m_ObjId = require ( '../data/ObjId' ) ( );

		var m_IconHeight = 40;

		var m_IconWidth = 40;

		var m_IconContent = '';

		var m_PopupContent = '';

		var m_TooltipContent = '';

		var m_Phone = '';

		var m_Url = '';

		var m_Address = '';

		var m_IconLat = 0;

		var m_IconLng = 0;

		var m_Lat = 0;

		var m_Lng = 0;

		var m_Distance = -1;

		var m_ChainedDistance = 0;

		var m_GetObject = function ( ) {
			return {
				iconHeight : m_IconHeight,
				iconWidth : m_IconWidth,
				iconContent : m_IconContent,
				popupContent : m_PopupContent,
				tooltipContent : m_TooltipContent,
				phone : m_Phone,
				url : m_Url,
				address : m_Address,
				iconLat : parseFloat ( m_IconLat.toFixed ( 6 ) ),
				iconLng : parseFloat ( m_IconLng.toFixed ( 6 ) ),
				lat : parseFloat ( m_Lat.toFixed ( 6 ) ),
				lng : parseFloat ( m_Lng.toFixed ( 6 ) ),
				distance : parseFloat ( m_Distance.toFixed ( 2 ) ),
				chainedDistance : parseFloat ( m_ChainedDistance.toFixed ( 2 ) ),
				objId : m_ObjId,
				objType : s_ObjType.object
			};
		};
		
		var m_SetObject = function ( something ) {
			something = s_ObjType.validate ( something );
			m_IconHeight = something.iconHeight || 40;
			m_IconWidth = something.iconWidth || 40;
			m_IconContent = something.iconContent || '';
			m_PopupContent = something.popupContent || '';
			m_TooltipContent = something.tooltipContent || '';
			m_Phone = something.phone || '';
			m_Url = something.url || '';
			m_Address = something.address || '';
			m_IconLat = something.iconLat || 0;
			m_IconLng = something.iconLng || 0;
			m_Lat = something.lat || 0;
			m_Lng = something.lng || 0;
			m_Distance = something.distance || -1;
			m_ChainedDistance = something.chainedDistance;
			m_ObjId = require ( '../data/ObjId' ) ( );
		};
		
		/*
		--- note object -----------------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return Object.seal (
			{

				get isRouteNote ( ) { return m_Distance !== -1; },

				get iconHeight ( ) { return m_IconHeight;},
				set iconHeight ( IconHeight ) { m_IconHeight = IconHeight; },

				get iconWidth ( ) { return m_IconWidth;},
				set iconWidth ( IconWidth ) { m_IconWidth = IconWidth; },

				get iconContent ( ) { return m_IconContent;},
				set iconContent ( IconContent ) { m_IconContent = IconContent; },

				get popupContent ( ) { return m_PopupContent;},
				set popupContent ( PopupContent ) { m_PopupContent = PopupContent; },

				get tooltipContent ( ) { return m_TooltipContent;},
				set tooltipContent ( TooltipContent ) { m_TooltipContent = TooltipContent; },

				get phone ( ) { return m_Phone;},
				set phone ( Phone ) { m_Phone = Phone; },

				get url ( ) { return m_Url;},
				set url ( Url ) { m_Url = Url; },

				get address ( ) { return m_Address;},
				set address ( Address ) { m_Address = Address; },

				get iconLat ( ) { return m_IconLat;},
				set iconLat ( IconLat ) { m_IconLat = IconLat; },

				get iconLng ( ) { return m_IconLng;},
				set iconLng ( IconLng ) { m_IconLng = IconLng; },

				get iconLatLng ( ) { return [ m_IconLat, m_IconLng ];},
				set iconLatLng ( IconLatLng ) { m_IconLat = IconLatLng [ 0 ]; m_IconLng = IconLatLng [ 1 ]; },

				get lat ( ) { return m_Lat;},
				set lat ( Lat ) { m_Lat = Lat; },

				get lng ( ) { return m_Lng;},
				set lng ( Lng ) { m_Lng = Lng; },

				get latLng ( ) { return [ m_Lat, m_Lng ];},
				set latLng ( LatLng ) { m_Lat = LatLng [ 0 ]; m_Lng = LatLng [ 1 ]; },

				get distance ( ) { return m_Distance; },
				set distance ( Distance ) { m_Distance = Distance; },

				get chainedDistance ( ) { return m_ChainedDistance; },
				set chainedDistance ( ChainedDistance ) { m_ChainedDistance = ChainedDistance; },

				get objId ( ) { return m_ObjId; },

				get objType ( ) { return s_ObjType; },

				get object ( ) { return m_GetObject ( ); },
				set object ( something ) { m_SetObject ( something ); }
			}
		);
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = note;
	}

} ) ( );

/*
--- End of Note.js file -----------------------------------------------------------------------------------------------
*/