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
	- v2.1.0:
		- created
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file OsrmTextInstructions.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module routeProviders
@see https://github.com/Project-OSRM/osrm-text-instructions

@desc This file is an adaptation for ES6 of the osrm-text-instruction project
The osrmTextInstructions object code is the same than the code in the osrm-text-instruction/index.js.
If changes are done in osrm-text-instruction, they can be reported there without major problems.
Language json files are installed by the grunt.js file. Adapt this file if you will more languages.
Don't rename variables for compatibility with osrm-text-instructions

@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/* eslint-disable max-lines */

import { ZERO, ONE, NOT_FOUND, HTTP_STATUS_OK } from '../main/Constants.js';

const OUR_OSRM_LANGUAGES = [
	'ar',
	'da',
	'de',
	'en',
	'eo',
	'es',
	'es-ES',
	'fi',
	'fr',
	'he',
	'hu',
	'id',
	'it',
	'ja',
	'ko',
	'my',
	'nl',
	'no',
	'pl',
	'pt-BR',
	'pt-PT',
	'ro',
	'ru',
	'sl',
	'sv',
	'tr',
	'uk',
	'vi',
	'yo',
	'zh-Hans'
];

// working only with v5
const OUR_VERSION = 'v5';

let languages =
{
	supportedCodes : [ ],
	instructions : {},
	grammars : {},
	abbreviations : {}
};

// references to avoid rewriting OsrmTextInstructions
let instructions = languages.instructions;
let grammars = languages.grammars;
let abbreviations = languages.abbreviations;

/**
@------------------------------------------------------------------------------------------------------------------------------

@class OsrmTextInstructions
@classdesc This class contains methods to write / translate moneuver instructions in MapboxRouteProvider and OsrmRouteProvider
@see {@link theOsrmTextInstructions} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class OsrmTextInstructions 	{

	/**
	new version of the OsrmTextInstructions.directionFromDegree ( ) method
	@private
	*/

	#directionFromDegree ( language, degree ) {
		const NNE = 20;
		const ENE = 70;
		const ESE = 110;
		const SSE = 160;
		const SSW = 200;
		const WSW = 250;
		const WNW = 290;
		const NNW = 340;
		const NORTH = 360;

		if ( ! degree && ZERO !== degree ) {
			return '';
		}
		else if ( ZERO > degree && NORTH < degree ) {
			throw new Error ( 'Degree ' + degree + ' invalid' );
		}
		else if ( NNE >= degree ) {
			return instructions[ language ][ OUR_VERSION ].constants.direction.north;
		}
		else if ( ENE > degree ) {
			return instructions[ language ][ OUR_VERSION ].constants.direction.northeast;
		}
		else if ( ESE >= degree ) {
			return instructions[ language ][ OUR_VERSION ].constants.direction.east;
		}
		else if ( SSE > degree ) {
			return instructions[ language ][ OUR_VERSION ].constants.direction.southeast;
		}
		else if ( SSW >= degree ) {
			return instructions[ language ][ OUR_VERSION ].constants.direction.south;
		}
		else if ( WSW > degree ) {
			return instructions[ language ][ OUR_VERSION ].constants.direction.southwest;
		}
		else if ( WNW >= degree ) {
			return instructions[ language ][ OUR_VERSION ].constants.direction.west;
		}
		else if ( NNW > degree ) {
			return instructions[ language ][ OUR_VERSION ].constants.direction.northwest;
		}
		else {
			return instructions[ language ][ OUR_VERSION ].constants.direction.north;
		}
	}

	async #fetchJson ( data, lngCode ) {
		let response = await fetch ( 'TravelNotesProviders/languages/' + data + '/' + lngCode + '.json' );
		if ( HTTP_STATUS_OK === response.status && response.ok ) {
			let result = await response.json ( );
			languages [ data ] [ lngCode ] = result;
		}
	}

	/*
	constructor
	*/

	constructor ( ) {
		this.abbreviations = abbreviations;
		Object.freeze ( this );
	}

	loadLanguage ( lng ) {
		let language = NOT_FOUND === OUR_OSRM_LANGUAGES.indexOf ( lng ) ? 'en' : lng;
		[ 'instructions', 'grammars', 'abbreviations' ].forEach (
			data => this.#fetchJson ( data, language )
		);
		return language;
	}

	capitalizeFirstLetter ( language, string ) {
		return string.charAt ( ZERO ).toLocaleUpperCase ( language ) + string.slice ( ONE );
	}

	ordinalize ( language, number ) {
		return instructions[ language ][ OUR_VERSION ].constants.ordinalize[ number.toString () ] || '';
	}

	directionFromDegree ( language, degree ) {
		return this.#directionFromDegree ( language, degree );
	}

	laneConfig ( step ) {
		if ( ! step.intersections || ! step.intersections[ ZERO ].lanes ) {
			throw new Error ( 'No lanes object' );
		}
		let config = [];
		let currentLaneValidity = null;
		step.intersections[ ZERO ].lanes.forEach ( function ( lane ) {
			if ( null === currentLaneValidity || currentLaneValidity !== lane.valid ) {
				if ( lane.valid ) {
					config.push ( 'o' );
				}
				else {
					config.push ( 'x' );
				}
				currentLaneValidity = lane.valid;
			}
		} );
		return config.join ( '' );
	}

	/* eslint-disable-next-line complexity */
	getWayName ( language, step, options ) {
		let classes = options ? options.classes || [] : [];
		if ( 'object' !== typeof step ) {
			throw new Error ( 'step must be an Object' );
		}
		if ( ! Array.isArray ( classes ) ) {
			throw new Error ( 'classes must be an Array or undefined' );
		}
		let wayName = '';
		let stepName = step.name || '';
		let ref = ( step.ref || '' ).split ( ';' )[ ZERO ];
		if ( stepName === step.ref ) {
			stepName = '';
		}
		stepName = stepName.replace ( ' (' + step.ref + ')', '' );
		let wayMotorway = NOT_FOUND !== classes.indexOf ( 'motorway' );
		if ( stepName && ref && stepName !== ref && ! wayMotorway ) {
			let phrase = instructions[ language ][ OUR_VERSION ].phrase[ 'name and ref' ] ||
				instructions.en[ OUR_VERSION ].phrase[ 'name and ref' ];
			wayName = this.tokenize ( language, phrase, {
				name : stepName,
				ref : ref
			}, options );
		}
		else if ( stepName && ref && wayMotorway && ( /\d/ ).test ( ref ) ) {
			wayName = options && options.formatToken ? options.formatToken ( 'ref', ref ) : ref;
		}
		else if ( ! stepName && ref ) {
			wayName = options && options.formatToken ? options.formatToken ( 'ref', ref ) : ref;
		}
		else {
			wayName = options && options.formatToken ? options.formatToken ( 'name', stepName ) : stepName;
		}
		return wayName;
	}

	/* eslint-disable-next-line complexity, max-statements */
	compile ( language, step, opts ) {
		if ( ! step.maneuver ) {
			throw new Error ( 'No step maneuver provided' );
		}
		let options = opts || {};
		let type = step.maneuver.type;
		let modifier = step.maneuver.modifier;
		let mode = step.mode;
		let side = step.driving_side;
		if ( ! type ) {
			throw new Error ( 'Missing step maneuver type' );
		}
		if ( 'depart' !== type && 'arrive' !== type && ! modifier ) {
			throw new Error ( 'Missing step maneuver modifier' );
		}
		if ( ! instructions[ language ][ OUR_VERSION ][ type ] ) {
			/* eslint-disable-next-line no-console */
			console.log ( 'Encountered unknown instruction type: ' + type );
			type = 'turn';
		}
		let instructionObject = null;
		if ( instructions[ language ][ OUR_VERSION ].modes[ mode ] ) {
			instructionObject = instructions[ language ][ OUR_VERSION ].modes[ mode ];
		}
		else {
			let omitSide = 'off ramp' === type && ZERO <= modifier.indexOf ( side );
			if ( instructions[ language ][ OUR_VERSION ][ type ][ modifier ] && ! omitSide ) {
				instructionObject = instructions[ language ][ OUR_VERSION ][ type ][ modifier ];
			}
			else {
				instructionObject = instructions[ language ][ OUR_VERSION ][ type ].default;
			}
		}
		let laneInstruction = null;
		switch ( type ) {
		case 'use lane' :
			laneInstruction = instructions[ language ][ OUR_VERSION ].constants.lanes[ this.laneConfig ( step ) ];
			if ( ! laneInstruction ) {
				instructionObject = instructions[ language ][ OUR_VERSION ][ 'use lane' ].no_lanes;
			}
			break;
		case 'rotary' :
		case 'roundabout' :
			if ( step.rotary_name && step.maneuver.exit && instructionObject.name_exit ) {
				instructionObject = instructionObject.name_exit;
			}
			else if ( step.rotary_name && instructionObject.name ) {
				instructionObject = instructionObject.name;
			}
			else if ( step.maneuver.exit && instructionObject.exit ) {
				instructionObject = instructionObject.exit;
			}
			else {
				instructionObject = instructionObject.default;
			}
			break;
		default :
		}
		let wayName = this.getWayName ( language, step, options );
		let instruction = instructionObject.default;
		if ( step.destinations && step.exits && instructionObject.exit_destination ) {
			instruction = instructionObject.exit_destination;
		}
		else if ( step.destinations && instructionObject.destination ) {
			instruction = instructionObject.destination;
		}
		else if ( step.exits && instructionObject.exit ) {
			instruction = instructionObject.exit;
		}
		else if ( wayName && instructionObject.name ) {
			instruction = instructionObject.name;
		}
		else if ( options.waypointName && instructionObject.named ) {
			instruction = instructionObject.named;
		}
		let destinations = step.destinations && step.destinations.split ( ': ' );
		let destinationRef = destinations && destinations[ ZERO ].split ( ',' )[ ZERO ];
		let destination = destinations && destinations[ ONE ] && destinations[ ONE ].split ( ',' )[ ZERO ];
		let firstDestination = '';
		if ( destination && destinationRef ) {
			firstDestination = destinationRef + ': ' + destination;
		}
		else {
			firstDestination = destinationRef || destination || '';
		}

		let nthWaypoint =
			ZERO <= options.legIndex && options.legIndex !== options.legCount - ONE
				?
				this.ordinalize ( language, options.legIndex + ONE )
				:
				'';
		let replaceTokens = {
			/* eslint-disable-next-line camelcase */
			way_name : wayName,
			destination : firstDestination,
			exit : ( step.exits || '' ).split ( ';' )[ ZERO ],
			/* eslint-disable-next-line camelcase */
			exit_number : this.ordinalize ( language, step.maneuver.exit || ONE ),
			/* eslint-disable-next-line camelcase */
			rotary_name : step.rotary_name,
			/* eslint-disable-next-line camelcase */
			lane_instruction : laneInstruction,
			modifier : instructions[ language ][ OUR_VERSION ].constants.modifier[ modifier ],
			direction : this.directionFromDegree ( language, step.maneuver.bearing_after ),
			nth : nthWaypoint,
			/* eslint-disable-next-line camelcase */
			waypoint_name : options.waypointName
		};
		return this.tokenize ( language, instruction, replaceTokens, options );
	}

	grammarize ( language, nameToProceed, grammar ) {
		if ( grammar && grammars && grammars[ language ] && grammars[ language ][ OUR_VERSION ] ) {
			let rules = grammars[ language ][ OUR_VERSION ][ grammar ];
			if ( rules ) {
				let nameWithSpace = ' ' + nameToProceed + ' ';
				let flags = grammars[ language ].meta.regExpFlags || '';
				rules.forEach ( function ( rule ) {
					let re = new RegExp ( rule[ ZERO ], flags );
					nameWithSpace = nameWithSpace.replace ( re, rule[ ONE ] );
				} );

				return nameWithSpace.trim ();
			}
		}
		return nameToProceed;
	}

	/* eslint-disable-next-line max-params */
	tokenize ( language, instruction, tokens, options ) {
		let that = this;
		let startedWithToken = false;
		let output = instruction.replace (
			/* eslint-disable-next-line max-params */
			/\{(\w+)(?::(\w+))?\}/g, function ( token, tag, grammar, offset ) {
				let value = tokens[ tag ];
				if ( 'undefined' === typeof value ) {
					return token;
				}
				value = that.grammarize ( language, value, grammar );
				if ( ZERO === offset && instructions[ language ].meta.capitalizeFirstLetter ) {
					startedWithToken = true;
					value = that.capitalizeFirstLetter ( language, value );
				}
				if ( options && options.formatToken ) {
					value = options.formatToken ( tag, value );
				}
				return value;
			}
		)
			.replace ( / {2}/g, ' ' );
		if ( ! startedWithToken && instructions[ language ].meta.capitalizeFirstLetter ) {
			return this.capitalizeFirstLetter ( language, output );
		}
		return output;
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The one and only one instance of OsrmTextInstructions class
@type {OsrmTextInstructions}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theOsrmTextInstructions = new OsrmTextInstructions ( );

export default theOsrmTextInstructions;

/* eslint-enable max-lines */

/*
--- End of OsrmTextInstructions.js file ---------------------------------------------------------------------------------------
*/