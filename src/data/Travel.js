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
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
	- v1.8.0:
		- Issue #100 : Fix circular dependancies with Collection
Doc reviewed 20200731
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Travel.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module Travel
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/* eslint no-fallthrough: ["error", { "commentPattern": "eslint break omitted intentionally" }]*/

import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';
import { newCollection } from '../data/Collection.js';
import { newRoute } from '../data/Route.js';
import { newNote } from '../data/Note.js';

const ourObjType = newObjType ( 'Travel' );
const ourObjIds = new WeakMap ( );

/**
@--------------------------------------------------------------------------------------------------------------------------

@function ourValidate
@desc verify that the parameter can be transformed to a Travel and performs the upgrate if needed
@param {Object} something an object to validate
@return {Object} the validated object
@throws {Error} when the parameter is invalid
@private

@--------------------------------------------------------------------------------------------------------------------------
*/

function ourValidate ( something ) {
	if ( ! Object.getOwnPropertyNames ( something ).includes ( 'objType' ) ) {
		throw new Error ( 'No objType for ' + ourObjType.name );
	}
	ourObjType.validate ( something.objType );
	if ( ourObjType.version !== something.objType.version ) {
		switch ( something.objType.version ) {
		case '1.0.0' :
		case '1.1.0' :
		case '1.2.0' :
		case '1.3.0' :
		case '1.4.0' :
			something.editedRoute = newRoute ( );
			// eslint break omitted intentionally
		case '1.5.0' :
			if ( something.userData.layerId ) {

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
				].find ( layerConversion => layerConversion.layerId === something.userData.layerId );
				if ( layerConvert ) {
					something.layerName = layerConvert.layerName;
				}
				else {
					something.layerName = 'OSM - Color';
				}
			}
			else {
				something.layerName = 'OSM - Color';
			}
			// eslint break omitted intentionally
		case '1.6.0' :
		case '1.7.0' :
		case '1.7.1' :
		case '1.8.0' :
		case '1.9.0' :
		case '1.10.0' :
		case '1.11.0' :
			something.objType.version = '1.12.0';
			break;
		default :
			throw new Error ( 'invalid version for ' + ourObjType.name );
		}
	}
	let properties = Object.getOwnPropertyNames ( something );
	[ 'name', 'editedRoute', 'routes', 'userData', 'objId' ].forEach (
		property => {
			if ( ! properties.includes ( property ) ) {
				throw new Error ( 'No ' + property + ' for ' + ourObjType.name );
			}
		}
	);
	return something;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class Travel
@classdesc This class represent a travel
@see {@link newTravel} for constructor
@hideconstructor

@-----------------------------------------------------------------------------------------------------------------------------
*/

class Travel {

	constructor ( ) {

		/**
		the route currently edited
		@type {Route}
		*/

		this.editedRoute = newRoute ( );

		/**
		a Collection of Routes
		@type {Collection.<Route>}
		@readonly
		*/

		this.routes = newCollection ( newRoute );

		/**
		a Collection of Notes
		@type {Collection.<Note>}
		@readonly
		*/

		this.notes = newCollection ( newNote );

		/**
		the background map name
		@type {string}
		*/

		this.layerName = 'OSM - Color';

		/**
		the Travel name
		@type {string}
		*/

		this.name = 'TravelNotes';

		/**
		a boolean indicates when the Travel is read only
		@type {boolean}
		*/

		this.readOnly = false;

		/**
		Free data that are saved or restored with the Travel. Must only respect the JSON rules
		@type {object}
		*/

		this.userData = {};

		ourObjIds.set ( this, newObjId ( ) );

	}

	/**
	the objId of the Travel. objId are unique identifier given by the code
	@readonly
	@type {!number}
	*/

	get objId ( ) { return ourObjIds.get ( this ); }

	/**
	the ObjType of the Travel.
	@type {ObjType}
	@readonly
	*/

	get objType ( ) { return ourObjType; }

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
			userData : this.userData,
			readOnly : this.readOnly,
			objId : ourObjIds.get ( this ),
			objType : ourObjType.jsonObject
		};
	}
	set jsonObject ( something ) {
		let otherthing = ourValidate ( something );
		this.editedRoute.jsonObject = otherthing.editedRoute;
		this.layerName = something.layerName || 'OSM - Color';
		this.name = otherthing.name || '';
		this.userData = otherthing.userData || {};
		this.readOnly = otherthing.readOnly || false;
		this.routes.jsonObject = otherthing.routes || [];
		this.notes.jsonObject = otherthing.notes || [];
		ourObjIds.set ( this, newObjId ( ) );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewTravel
@desc Constructor for a Travel object
@return {Travel} an instance of a Travel object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewTravel ( ) {

	return Object.seal ( new Travel );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newTravel
	@desc Constructor for a Travel object
	@return {Travel} an instance of a Travel object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewTravel as newTravel
};

/*
--- End of Travel.js file -----------------------------------------------------------------------------------------------------
*/