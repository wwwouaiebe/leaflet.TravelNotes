/*
Copyright - 2019 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- MouseUI.js file ---------------------------------------------------------------------------------------------------
This file contains:
	- the newMouseUI function
	- the theMouseUI object
Changes:
	- v1.6.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { newUtilities } from '../util/Utilities.js';

import { THE_CONST } from '../util/Constants.js';

/*
--- newMouseUI function -----------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newMouseUI ( ) {

	let myMouseDiv = null;

	let myMousePos = null;
	let myZoom = null;
	let myFileName = '';
	let myUtilities = newUtilities ( );

	/*
	--- myUpdate function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myUpdate ( ) {
		myMouseDiv.innerHTML = '<span>' +
		myMousePos +
		'&nbsp;-&nbsp;Zoom&nbsp;:&nbsp;' +
		myZoom +
		( '' === myFileName ? '' : '&nbsp;-&nbsp;' + myFileName ) +
		'</span>';
	}

	/*
	--- mySetMousePos function ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetMousePos ( mousePos ) {
		myMousePos = myUtilities.formatLat ( mousePos.lat ) + '&nbsp;-&nbsp;' + myUtilities.formatLng ( mousePos.lng );
		myUpdate ( );
	}

	/*
	--- mySetZoom function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetZoom ( zoom ) {
		myZoom = zoom;
		myUpdate ( );
	}

	/*
	--- mySetFileName function ----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function mySetFileName ( fileName ) {
		myFileName = fileName;
		myUpdate ( );
	}

	/*
	--- myCreateUI function -------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateUI ( ) {

		myZoom = theTravelNotesData.map.getZoom ( );
		let mousePos = theTravelNotesData.map.getCenter ( );
		myMousePos = myUtilities.formatLat ( mousePos.lat ) + '&nbsp;-&nbsp;' + myUtilities.formatLng ( mousePos.lng );
		myMouseDiv = newHTMLElementsFactory ( ).create (
			'div',
			{
				id : 'TravelNotes-MouseControl'
			},
			document.getElementsByTagName ( 'body' ) [ THE_CONST.zero ]
		);
		theTravelNotesData.map.on (
			'mousemove',
			mouseMoveEvent => {
				myMousePos =
					myUtilities.formatLat ( mouseMoveEvent.latlng.lat ) +
					'&nbsp;-&nbsp;' +
					myUtilities.formatLng ( mouseMoveEvent.latlng.lng );
				myUpdate ( );
			}
		);
		theTravelNotesData.map.on (
			'zoomend',
			( ) => {
				myZoom = theTravelNotesData.map.getZoom ( );
				myUpdate ( );
			}
		);
		document.addEventListener (
			'travelnotesfileloaded',
			TravelNotesFileLoadedEvent => {
				myFileName = TravelNotesFileLoadedEvent.name || '';
				myUpdate ( );
			},
			false
		);

	}

	/*
	--- MouseUI object ------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			createUI : ( ) => myCreateUI ( ),
			set mousePos ( MousePos ) { mySetMousePos ( MousePos ); },
			set zoom ( Zoom ) { mySetZoom ( Zoom ); },
			set fileName ( FileName ) { mySetFileName ( FileName ); }
		}
	);
}

const theMouseUI = newMouseUI ( );

export { theMouseUI };

/*
--- End of MouseUI.js file --------------------------------------------------------------------------------------------
*/