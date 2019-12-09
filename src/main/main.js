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
--- main.js file ------------------------------------------------------------------------------------------------------
This file contains:
	-
	Changes:
	- v1.6.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theConfig } from '../data/Config.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { newHttpRequestBuilder } from '../util/HttpRequestBuilder.js';
import { theTravelNotes } from '../main/TravelNotes.js';

import { THE_CONST } from '../util/Constants.js';

window.L.travelNotes = theTravelNotes;

newHttpRequestBuilder ( ).getJsonPromise (
	window.location.href.substr ( THE_CONST.zero, window.location.href.lastIndexOf ( '/' ) + THE_CONST.number1 ) +
	'TravelNotesConfig.json'
)
	.then (
		config => {
			theConfig.overload ( config );

			if ( ! theConfig.autoLoad ) {
				return;
			}
			newHTMLElementsFactory ( ).create (
				'div',
				{ id : 'Map' },
				document.getElementsByTagName ( 'body' ) [ THE_CONST.zero ]
			);
			newHTMLElementsFactory ( ).create (
				'div',
				{ id : 'TravelNotes' },
				document.getElementsByTagName ( 'body' ) [ THE_CONST.zero ]
			);

			let map = window.L.map ( 'Map', { attributionControl : false, zoomControl : false } )
				.setView ( [ theConfig.map.center.lat, theConfig.map.center.lng ], theConfig.map.zoom );
			theTravelNotes.addControl ( map, 'TravelNotes' );
			theTravelNotes.rightContextMenu = true;
		}
	);

/*
--- End of Main file --------------------------------------------------------------------------------------------------
*/