/*
Copyright - 2020 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- ProfileWindow.js file ---------------------------------------------------------------------------------------------
This file contains:
	- the newProfileWindow function
Changes:
	- v1.7.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { newProfileFactory } from '../core/ProfileFactory.js';
import { newFloatWindow } from '../dialogs/FloatWindow.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

import { THE_CONST } from '../util/Constants.js';

/*
--- newProfileWindow function -----------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newProfileWindow ( ) {

	let myProfileWindow = null;
	let myAscentDiv = null;
	let myRoute = null;
	let myProfileFactory = newProfileFactory ( );

	/*
	--- myCreateSvgProfile function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateProfile ( ) {

		myProfileFactory.createProfile ( myProfileWindow.data );
		myProfileWindow.header.innerHTML = theTranslator.getText ( 'ProfileWindow - Profile {name}', myRoute );
		myProfileWindow.content.appendChild ( myProfileFactory.svg );
		myAscentDiv = newHTMLElementsFactory ( ).create (
			'div',
			{
				className : 'TravelNotes-ProfileWindow-Ascent'
			}
		);
		myAscentDiv.innerHTML = theTranslator.getText (
			'ProfileWindow - Ascent: {ascent} m. - Descent: {descent} m.',
			{ ascent : myProfileFactory.ascent, descent : myProfileFactory.descent }
		);
		myProfileWindow.content.appendChild ( myAscentDiv );
	}

	/*
	--- myOnClose function --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnClose ( ) {
		myProfileFactory.clean ( );
	}

	/*
	--- myOnShow function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnShow ( ) {
		myRoute = newDataSearchEngine ( ).getRoute ( myProfileWindow.data );
		if ( ! myRoute ) {
			return;
		}
		myCreateProfile ( );
	}

	/*
	--- myUpdate function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myUpdate ( routeObjId ) {
		myProfileWindow.data = routeObjId;
		myRoute =	newDataSearchEngine ( ).getRoute ( myProfileWindow.data );
		if ( ! myRoute ) {
			return;
		}
		if ( THE_CONST.zero === myRoute.itinerary.itineraryPoints.length ) {
			myProfileWindow.close ( );
			return;
		}

		myProfileWindow.content.removeChild ( myAscentDiv );
		myProfileWindow.content.removeChild ( myProfileFactory.svg );
		myCreateProfile ( );
	}

	/*
	--- main function -------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	myProfileWindow = newFloatWindow ( );
	myProfileWindow.onShow = myOnShow;
	myProfileWindow.onClose = myOnClose;
	myProfileWindow.update = myUpdate;

	return Object.seal ( myProfileWindow );
}

export { newProfileWindow };

/*
--- End of ProfileWindow.js file --------------------------------------------------------------------------------------
*/