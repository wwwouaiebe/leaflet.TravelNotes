/*
'ar', 'da', 'de', 'en', 'eo', 'es', 'es-ES', 'fi', 'fr', 'he', 'hu', 'id', 'it', 'ja', 'ko', 'my',
'nl', 'no', 'pl', 'pt-BR', 'pt-PT', 'ro', 'ru', 'sl', 'sv', 'tr', 'uk', 'vi', 'yo', 'zh-Hans';
*/

/* eslint max-params: "off" */
/* eslint camelcase: "off" */
/* eslint complexity: "off" */
/* eslint max-statements: "off" */

const ZERO = 0;
const ONE = 1;
const NOT_FOUND = -1;

const STATUS_OK = 200;

const NNE = 20;
const ENE = 70;
const ESE = 110;
const SSE = 160;
const SSW = 200;
const WSW = 250;
const WNW = 290;
const NNW = 340;
const NORTH = 360;

let languages =
{
	supportedCodes : [ 'en', 'fr' ],
	instructions : {},
	grammars : {},
	abbreviations : {}
};

async function parseJson ( data, lngCode, response ) {
	await response.json ( )
		.then ( result => { languages [ data ] [ lngCode ] = result; } );
}

async function fetchJson ( data, lngCode ) {
	await fetch ( 'TravelNotesProviders/languages/' + data + '/' + lngCode + '.json' )
		.then ( response => {
			if ( STATUS_OK === response.status && response.ok ) {
				parseJson ( data, lngCode, response );
			}
		}
		);
}

languages.supportedCodes.forEach ( lngCode => {
	fetchJson ( 'instructions', lngCode );
	fetchJson ( 'grammars', lngCode );
	fetchJson ( 'abbreviations', lngCode );
}
);

const version = 'v5';
let instructions = languages.instructions;
let grammars = languages.grammars;
let abbreviations = languages.abbreviations;

let osrmTextInstructions =
{
	capitalizeFirstLetter : function ( language, string ) {
		return string.charAt ( ZERO ).toLocaleUpperCase ( language ) + string.slice ( ONE );
	},

	ordinalize : function ( language, number ) {

		// Transform numbers to their translated ordinalized value
		if ( ! language ) {
			throw new Error ( 'No language code provided' );
		}

		return instructions[ language ][ version ].constants.ordinalize[ number.toString () ] || '';
	},

	directionFromDegree : function ( language, degree ) {

		// Transform degrees to their translated compass direction
		if ( ! language ) {
			throw new Error ( 'No language code provided' );
		}
		if ( ! degree && ZERO !== degree ) {

			// step had no bearing_after degree, ignoring
			return '';
		}
		else if ( ZERO > degree && NORTH < degree ) {
			throw new Error ( 'Degree ' + degree + ' invalid' );
		}
		else if ( NNE >= degree ) {
			return instructions[ language ][ version ].constants.direction.north;
		}
		else if ( ENE > degree ) {
			return instructions[ language ][ version ].constants.direction.northeast;
		}
		else if ( ESE >= degree ) {
			return instructions[ language ][ version ].constants.direction.east;
		}
		else if ( SSE > degree ) {
			return instructions[ language ][ version ].constants.direction.southeast;
		}
		else if ( SSW >= degree ) {
			return instructions[ language ][ version ].constants.direction.south;
		}
		else if ( WSW > degree ) {
			return instructions[ language ][ version ].constants.direction.southwest;
		}
		else if ( WNW >= degree ) {
			return instructions[ language ][ version ].constants.direction.west;
		}
		else if ( NNW > degree ) {
			return instructions[ language ][ version ].constants.direction.northwest;
		}
		else {
			return instructions[ language ][ version ].constants.direction.north;
		}

	},

	laneConfig : function ( step ) {

		// Reduce any lane combination down to a contracted lane diagram
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
	},

	getWayName : function ( language, step, options ) {
		let classes = options ? options.classes || [] : [];
		if ( 'object' !== typeof step ) {
			throw new Error ( 'step must be an Object' );
		}
		if ( ! language ) {
			throw new Error ( 'No language code provided' );
		}
		if ( ! Array.isArray ( classes ) ) {
			throw new Error ( 'classes must be an Array or undefined' );
		}

		let wayName = '';
		let stepName = step.name || '';
		let ref = ( step.ref || '' ).split ( ';' )[ ZERO ];

		// Remove hacks from Mapbox Directions mixing ref into name
		if ( stepName === step.ref ) {

			// if both are the same we assume that there used to be an empty name, with the ref being filled in for it
			// we only need to retain the ref then
			stepName = '';
		}
		stepName = stepName.replace ( ' (' + step.ref + ')', '' );

		// In attempt to avoid using the highway name of a way,
		// check and see if the step has a class which should signal
		// the ref should be used instead of the name.
		let wayMotorway = NOT_FOUND !== classes.indexOf ( 'motorway' );

		if ( stepName && ref && stepName !== ref && ! wayMotorway ) {
			let phrase = instructions[ language ][ version ].phrase[ 'name and ref' ] ||
				instructions.en[ version ].phrase[ 'name and ref' ];
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
	},

	/**
	 * Formulate a localized text instruction from a step.
	 *
	 * @param  {string} language		   Language code.
	 * @param  {object} step			   Step including maneuver property.
	 * @param  {object} opts			   Additional options.
	 * @param  {string} opts.legIndex	  Index of leg in the route.
	 * @param  {string} opts.legCount	  Total number of legs in the route.
	 * @param  {array}  opts.classes	   List of road classes.
	 * @param  {string} opts.waypointName  Name of waypoint for arrival instruction.
	 *
	 * @return {string} Localized text instruction.
	 */

	compile : function ( language, step, opts ) {
		if ( ! language ) {
			throw new Error ( 'No language code provided' );
		}
		if ( NOT_FOUND === languages.supportedCodes.indexOf ( language ) ) {
			throw new Error ( 'language code ' + language + ' not loaded' );
		}
		if ( ! step.maneuver ) {
			throw new Error ( 'No step maneuver provided' );
		}

		let options = opts || {};
		let type = step.maneuver.type;
		let modifier = step.maneuver.modifier;
		let mode = step.mode;

		// driving_side will only be defined in OSRM 5.14+
		let side = step.driving_side;

		if ( ! type ) {
			throw new Error ( 'Missing step maneuver type' );
		}
		if ( 'depart' !== type && 'arrive' !== type && ! modifier ) {
			throw new Error ( 'Missing step maneuver modifier' );
		}

		if ( ! instructions[ language ][ version ][ type ] ) {

			// Log for debugging
			console.log ( 'Encountered unknown instruction type: ' + type ); // eslint-disable-line no-console
			// OSRM specification assumes turn types can be added without
			// major version changes. Unknown types are to be treated as
			// type `turn` by clients
			type = 'turn';
		}

		// Use special instructions if available, otherwise `defaultinstruction`
		let instructionObject = null;
		if ( instructions[ language ][ version ].modes[ mode ] ) {
			instructionObject = instructions[ language ][ version ].modes[ mode ];
		}
		else {

			// omit side from off ramp if same as driving_side
			// note: side will be undefined if the input is from OSRM <5.14
			// but the condition should still evaluate properly regardless
			let omitSide = 'off ramp' === type && ZERO <= modifier.indexOf ( side );
			if ( instructions[ language ][ version ][ type ][ modifier ] && ! omitSide ) {
				instructionObject = instructions[ language ][ version ][ type ][ modifier ];
			}
			else {
				instructionObject = instructions[ language ][ version ][ type ].default;
			}
		}

		// Special case handling
		let laneInstruction = null;
		switch ( type ) {
		case 'use lane' :
			laneInstruction = instructions[ language ][ version ].constants.lanes[ this.laneConfig ( step ) ];
			if ( ! laneInstruction ) {

				// If the lane combination is not found, default to continue straight
				instructionObject = instructions[ language ][ version ][ 'use lane' ].no_lanes;
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

			// NOOP, since no special logic for that type
		}

		// Decide way_name with special handling for name and ref
		let wayName = this.getWayName ( language, step, options );

		// Decide which instruction string to use
		// Destination takes precedence over name
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

		// Replace tokens
		// NOOP if they don't exist
		let replaceTokens = {
			way_name : wayName,
			destination : firstDestination,
			exit : ( step.exits || '' ).split ( ';' )[ ZERO ],
			exit_number : this.ordinalize ( language, step.maneuver.exit || ONE ),
			rotary_name : step.rotary_name,
			lane_instruction : laneInstruction,
			modifier : instructions[ language ][ version ].constants.modifier[ modifier ],
			direction : this.directionFromDegree ( language, step.maneuver.bearing_after ),
			nth : nthWaypoint,
			waypoint_name : options.waypointName
		};

		return this.tokenize ( language, instruction, replaceTokens, options );
	},
	grammarize : function ( language, nameToProceed, grammar ) {
		if ( ! language ) {
			throw new Error ( 'No language code provided' );
		}

		// Process way/rotary/any name with applying grammar rules if any
		if ( grammar && grammars && grammars[ language ] && grammars[ language ][ version ] ) {
			let rules = grammars[ language ][ version ][ grammar ];
			if ( rules ) {

				// Pass original name to rules' regular expressions enclosed with spaces for simplier parsing
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
	},
	abbreviations : abbreviations,
	tokenize : function ( language, instruction, tokens, options ) {
		if ( ! language ) {
			throw new Error ( 'No language code provided' );
		}

		// Keep this function context to use in inline function below (no arrow functions in ES4)
		let that = this;
		let startedWithToken = false;
		let output = instruction.replace ( /\{(\w+)(?::(\w+))?\}/g, function ( token, tag, grammar, offset ) {
			let value = tokens[ tag ];

			// Return unknown token unchanged
			if ( 'undefined' === typeof value ) {
				return token;
			}

			value = that.grammarize ( language, value, grammar );

			// If this token appears at the beginning of the instruction, capitalize it.
			if ( ZERO === offset && instructions[ language ].meta.capitalizeFirstLetter ) {
				startedWithToken = true;
				value = that.capitalizeFirstLetter ( language, value );
			}

			if ( options && options.formatToken ) {
				value = options.formatToken ( tag, value );
			}

			return value;
		} )
			.replace ( / {2}/g, ' ' ); // remove excess spaces

		if ( ! startedWithToken && instructions[ language ].meta.capitalizeFirstLetter ) {
			return this.capitalizeFirstLetter ( language, output );
		}

		return output;
	}
};

export { osrmTextInstructions };