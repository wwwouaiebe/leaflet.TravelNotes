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
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.5.0:
		- Issue ♯52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue ♯65 : Time to go to ES6 modules?
	- v1.8.0:
		- Issue ♯100 : Fix circular dependancies with Collection
	- v2.0.0:
		- Issue ♯138 : Protect the app - control html entries done by user.
		- Issue ♯140 : Remove userData
		- Issue ♯146 : Add the travel name in the document title...
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Travel.js
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

/* eslint no-fallthrough: ["error", { "commentPattern": "eslint break omitted intentionally" }]*/

import ObjId from '../data/ObjId.js';
import ObjType from '../data/ObjType.js';
import Collection from '../data/Collection.js';
import Route from '../data/Route.js';
import Note from '../data/Note.js';
import theHTMLSanitizer from '../coreLib/HTMLSanitizer.js';
import { INVALID_OBJ_ID } from '../main/Constants.js';

const OUR_OBJ_TYPE = new ObjType ( 'Travel' );

/**
@------------------------------------------------------------------------------------------------------------------------------

@class Travel
@classdesc This class represent a travel

@-----------------------------------------------------------------------------------------------------------------------------
*/

class Travel {

	#objId = INVALID_OBJ_ID;

	/**
	Performs the upgrade
	@param {Object} travel a travel to upgrade
	@throws {Error} when the travel version is invalid
	@private
	*/

	/* eslint-disable-next-line complexity */
	#upgradeObject ( travel ) {
		switch ( travel.objType.version ) {
		case '1.0.0' :
		case '1.1.0' :
		case '1.2.0' :
		case '1.3.0' :
		case '1.4.0' :
			travel.editedRoute = new Route ( );
			// eslint break omitted intentionally
		case '1.5.0' :
			if ( travel.userData.layerId ) {

				// old layersId from maps are converted to TravelNotes layerName
				let layerConvert =
					[
						{ layerId : '0', layerName : 'OSM - Color' },
						{ layerId : '1', layerName : 'OSM - Black and White' },
						{ layerId : '2', layerName : 'Thunderforest - Transport' },
						{ layerId : '3', layerName : 'Thunderforest - OpenCycleMap' },
						{ layerId : '4', layerName : 'Thunderforest - Outdoors' },
						{ layerId : '5', layerName : 'Esri - Aerial view' },
						{ layerId : '6', layerName : 'Kartverket - Norway' },
						{ layerId : '7', layerName : 'IGN-NGI - Belgium now' },
						{ layerId : '12', layerName : 'Thunderforest - Landscape' },
						{ layerId : '24', layerName : 'Lantmäteriet - Sweden' },
						{ layerId : '25', layerName : 'Maanmittauslaitos - Finland' }
					].find ( layerConversion => layerConversion.layerId === travel.userData.layerId );
				if ( layerConvert ) {
					travel.layerName = layerConvert.layerName;
				}
				else {
					travel.layerName = 'OSM - Color';
				}
			}
			else {
				travel.layerName = 'OSM - Color';
			}
			// eslint break omitted intentionally
		case '1.6.0' :
		case '1.7.0' :
		case '1.7.1' :
		case '1.8.0' :
		case '1.9.0' :
		case '1.10.0' :
		case '1.11.0' :
		case '1.12.0' :
		case '1.13.0' :
		case '2.0.0' :
		case '2.1.0' :
		case '2.2.0' :
			travel.objType.version = '2.3.0';
			break;
		default :
			throw new Error ( 'invalid version for ' + OUR_OBJ_TYPE.name );
		}
	}

	/**
	Verify that the parameter can be transformed to a Travel and performs the upgrate if needed
	@param {Object} something an object to validate
	@return {Object} the validated object
	@throws {Error} when the parameter is invalid
	@private
	*/

	#validateObject ( something ) {
		if ( ! Object.getOwnPropertyNames ( something ).includes ( 'objType' ) ) {
			throw new Error ( 'No objType for ' + OUR_OBJ_TYPE.name );
		}
		OUR_OBJ_TYPE.validate ( something.objType );
		if ( OUR_OBJ_TYPE.version !== something.objType.version ) {
			this.#upgradeObject ( something );
		}
		let properties = Object.getOwnPropertyNames ( something );
		[ 'name', 'editedRoute', 'routes', 'objId' ].forEach (
			property => {
				if ( ! properties.includes ( property ) ) {
					throw new Error ( 'No ' + property + ' for ' + OUR_OBJ_TYPE.name );
				}
			}
		);
		return something;
	}

	/*
	constructor
	*/

	constructor ( ) {

		/**
		the route currently edited
		@type {Route}
		*/

		this.editedRoute = new Route ( );

		/**
		a Collection of Routes
		@type {Collection.<Route>}
		@readonly
		*/

		this.routes = new Collection ( Route );

		/**
		a Collection of Notes
		@type {Collection.<Note>}
		@readonly
		*/

		this.notes = new Collection ( Note );

		/**
		the background map name
		@type {string}
		*/

		this.layerName = 'OSM - Color';

		/**
		the Travel name
		@type {string}
		*/

		this.name = '';

		/**
		a boolean indicates when the Travel is read only
		@type {boolean}
		*/

		this.readOnly = false;

		this.#objId = ObjId.nextObjId;

		Object.seal ( this );
	}

	/**
	the objId of the Travel. objId are unique identifier given by the code
	@readonly
	@type {!number}
	*/

	get objId ( ) { return this.#objId; }

	/**
	the ObjType of the Travel.
	@type {ObjType}
	@readonly
	*/

	get objType ( ) { return OUR_OBJ_TYPE; }

	/**
	An object literal with the Travel properties and without any methods.
	This object can be used with the JSON object
	@type {Object}
	*/

	get jsonObject ( ) {
		return {
			editedRoute : this.editedRoute.jsonObject,
			layerName : this.layerName,
			name : this.name,
			routes : this.routes.jsonObject,
			notes : this.notes.jsonObject,
			readOnly : this.readOnly,
			objId : this.#objId,
			objType : OUR_OBJ_TYPE.jsonObject
		};
	}
	set jsonObject ( something ) {
		let otherthing = this.#validateObject ( something );
		this.editedRoute.jsonObject = otherthing.editedRoute;
		this.layerName = something.layerName || 'OSM - Color';
		this.name = otherthing.name || '';
		this.readOnly = otherthing.readOnly || false;
		this.routes.jsonObject = otherthing.routes || [];
		this.notes.jsonObject = otherthing.notes || [];
		this.#objId = ObjId.nextObjId;
		this.validateData ( );
	}

	/*
	This method verify that the data stored in the object have the correct type, and,
	for html string data, that they not contains invalid tags and attributes.
	This method must be called each time the data are modified by the user or when
	a file is opened
	*/

	validateData ( ) {
		if ( 'string' === typeof ( this.layerName ) ) {
			this.layerName = theHTMLSanitizer.sanitizeToJsString ( this.layerName );
		}
		else {
			this.layerName = 'OSM - Color';
		}
		if ( 'string' === typeof ( this.name ) ) {
			this.name = theHTMLSanitizer.sanitizeToJsString ( this.name );
		}
		else {
			this.name = 'TravelNotes';
		}
		if ( 'boolean' !== typeof ( this.readOnly ) ) {
			this.readOnly = true;
		}
	}
}

export default Travel;

/*
--- End of Travel.js file -----------------------------------------------------------------------------------------------------
*/