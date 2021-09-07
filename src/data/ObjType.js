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
	- v1.0.0:
		- created
	- v1.5.0:
		- Issue ♯52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file ObjType.js
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

import { NOT_FOUND } from '../main/Constants.js';
import { theDataVersion } from '../data/Version.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class ObjType
@classdesc This class represent a ObjType

@--------------------------------------------------------------------------------------------------------------------------
*/

class ObjType {

	#objTypeName = '';
	#validObjTypeNames = [ 'Itinerary', 'ItineraryPoint', 'Maneuver', 'Note', 'Route', 'Travel', 'WayPoint' ];

	/*
	constructor
	*/

	constructor ( objTypeName ) {
		if ( NOT_FOUND === this.#validObjTypeNames.indexOf ( objTypeName ) ) {
			throw new Error ( 'Invalid ObjType name : ' + objTypeName );
		}
		this.#objTypeName = objTypeName;
		Object.freeze ( this );
	}

	/**
	the name of the ObjType
	@type {string}
	*/

	get name ( ) { return this.#objTypeName; }

	/**
	the version of the ObjType
	@type {string}
	*/

	get version ( ) { return theDataVersion; }

	/**
	An object literal with the ObjType properties and without any methods.
	This object can be used with the JSON object
	@type {Object}
	*/

	get jsonObject ( ) {
		return {
			name : this.#objTypeName,
			version : theDataVersion
		};
	}

	/**
	Verify that the ObjType is valid
	@throws when the ObjType is invalid
	*/

	validate ( something ) {
		if ( ! Object.getOwnPropertyNames ( something ).includes ( 'name' ) ) {
			throw new Error ( 'No name for ' + this.#objTypeName );
		}
		if ( this.#objTypeName !== something.name ) {
			throw new Error ( 'Invalid name for ' + this.#objTypeName );
		}
		if ( ! Object.getOwnPropertyNames ( something ).includes ( 'version' ) ) {
			throw new Error ( 'No version for ' + this.#objTypeName );
		}
	}
}

export default ObjType;

/*
--- End of ObjType.js file ----------------------------------------------------------------------------------------------------
*/