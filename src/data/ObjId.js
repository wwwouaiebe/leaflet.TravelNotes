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
	- v1.0.0:
		- created
	- v1.4.0:
		- Initialization changed
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20200731
Tests ...
*/

/**
@----------------------------------------------------------------------------------------------------------------------

@file ObjId.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@----------------------------------------------------------------------------------------------------------------------
*/

/**
@----------------------------------------------------------------------------------------------------------------------

@module ObjId
@private

@----------------------------------------------------------------------------------------------------------------------
*/

import { ZERO } from '../util/Constants.js';

let theTravelNotesObjId = ZERO;

/**
@----------------------------------------------------------------------------------------------------------------------

@function myNewObjId
@desc Generator for ObjId
@return {!number} a unique ObjId
@private

@----------------------------------------------------------------------------------------------------------------------
*/

function myNewObjId ( ) {
	++ theTravelNotesObjId;
	return theTravelNotesObjId;
}

export {

	/**
	@------------------------------------------------------------------------------------------------------------------

	@function newObjId
	@desc Generator for ObjId
	@return {!number} a unique ObjId
	@global

	@------------------------------------------------------------------------------------------------------------------
	*/

	myNewObjId as newObjId

};

/*
--- End of ObjId.js file ----------------------------------------------------------------------------------------------
*/