(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var languages = require('./languages');
var instructions = languages.instructions;

module.exports = function(version, _options) {
    var opts = {};
    opts.hooks = {};
    opts.hooks.tokenizedInstruction = ((_options || {}).hooks || {}).tokenizedInstruction;

    Object.keys(instructions).forEach(function(code) {
        if (!instructions[code][version]) { throw 'invalid version ' + version + ': ' + code + ' not supported'; }
    });

    return {
        capitalizeFirstLetter: function(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },
        ordinalize: function(language, number) {
            // Transform numbers to their translated ordinalized value
            if (!language) throw new Error('No language code provided');

            return instructions[language][version].constants.ordinalize[number.toString()] || '';
        },
        directionFromDegree: function(language, degree) {
            // Transform degrees to their translated compass direction
            if (!language) throw new Error('No language code provided');
            if (!degree && degree !== 0) {
                // step had no bearing_after degree, ignoring
                return '';
            } else if (degree >= 0 && degree <= 20) {
                return instructions[language][version].constants.direction.north;
            } else if (degree > 20 && degree < 70) {
                return instructions[language][version].constants.direction.northeast;
            } else if (degree >= 70 && degree <= 110) {
                return instructions[language][version].constants.direction.east;
            } else if (degree > 110 && degree < 160) {
                return instructions[language][version].constants.direction.southeast;
            } else if (degree >= 160 && degree <= 200) {
                return instructions[language][version].constants.direction.south;
            } else if (degree > 200 && degree < 250) {
                return instructions[language][version].constants.direction.southwest;
            } else if (degree >= 250 && degree <= 290) {
                return instructions[language][version].constants.direction.west;
            } else if (degree > 290 && degree < 340) {
                return instructions[language][version].constants.direction.northwest;
            } else if (degree >= 340 && degree <= 360) {
                return instructions[language][version].constants.direction.north;
            } else {
                throw new Error('Degree ' + degree + ' invalid');
            }
        },
        laneConfig: function(step) {
            // Reduce any lane combination down to a contracted lane diagram
            if (!step.intersections || !step.intersections[0].lanes) throw new Error('No lanes object');

            var config = [];
            var currentLaneValidity = null;

            step.intersections[0].lanes.forEach(function (lane) {
                if (currentLaneValidity === null || currentLaneValidity !== lane.valid) {
                    if (lane.valid) {
                        config.push('o');
                    } else {
                        config.push('x');
                    }
                    currentLaneValidity = lane.valid;
                }
            });

            return config.join('');
        },
        compile: function(language, step, options) {
            if (!language) throw new Error('No language code provided');
            if (languages.supportedCodes.indexOf(language) === -1) throw new Error('language code ' + language + ' not loaded');
            if (!step.maneuver) throw new Error('No step maneuver provided');

            var type = step.maneuver.type;
            var modifier = step.maneuver.modifier;
            var mode = step.mode;

            if (!type) { throw new Error('Missing step maneuver type'); }
            if (type !== 'depart' && type !== 'arrive' && !modifier) { throw new Error('Missing step maneuver modifier'); }

            if (!instructions[language][version][type]) {
                // Log for debugging
                console.log('Encountered unknown instruction type: ' + type); // eslint-disable-line no-console
                // OSRM specification assumes turn types can be added without
                // major version changes. Unknown types are to be treated as
                // type `turn` by clients
                type = 'turn';
            }

            // Use special instructions if available, otherwise `defaultinstruction`
            var instructionObject;
            if (instructions[language][version].modes[mode]) {
                instructionObject = instructions[language][version].modes[mode];
            } else if (instructions[language][version][type][modifier]) {
                instructionObject = instructions[language][version][type][modifier];
            } else {
                instructionObject = instructions[language][version][type].default;
            }

            // Special case handling
            var laneInstruction;
            switch (type) {
            case 'use lane':
                laneInstruction = instructions[language][version].constants.lanes[this.laneConfig(step)];

                if (!laneInstruction) {
                    // If the lane combination is not found, default to continue straight
                    instructionObject = instructions[language][version]['use lane'].no_lanes;
                }
                break;
            case 'rotary':
            case 'roundabout':
                if (step.rotary_name && step.maneuver.exit && instructionObject.name_exit) {
                    instructionObject = instructionObject.name_exit;
                } else if (step.rotary_name && instructionObject.name) {
                    instructionObject = instructionObject.name;
                } else if (step.maneuver.exit && instructionObject.exit) {
                    instructionObject = instructionObject.exit;
                } else {
                    instructionObject = instructionObject.default;
                }
                break;
            default:
                // NOOP, since no special logic for that type
            }

            // Decide way_name with special handling for name and ref
            var wayName;
            var name = step.name || '';
            var ref = (step.ref || '').split(';')[0];

            // Remove hacks from Mapbox Directions mixing ref into name
            if (name === step.ref) {
                // if both are the same we assume that there used to be an empty name, with the ref being filled in for it
                // we only need to retain the ref then
                name = '';
            }
            name = name.replace(' (' + step.ref + ')', '');

            // In attempt to avoid using the highway name of a way,
            // check and see if the step has a class which should signal
            // the ref should be used instead of the name.
            var wayMotorway = false;
 			/*
            if (options && options.classes) {
                wayMotorway = options.classes.some((className) => ['motorway'].indexOf(className) > -1);
            }
 			*/
            if (name && ref && name !== ref && !wayMotorway) {
                wayName = name + ' (' + ref + ')';
            } else if (name && ref && wayMotorway && (/\d/).test(ref)) {
                wayName = ref;
            } else if (!name && ref) {
                wayName = ref;
            } else {
                wayName = name;
            }

            // Decide which instruction string to use
            // Destination takes precedence over name
            var instruction;
            if (step.destinations && step.exits && instructionObject.exit_destination) {
                instruction = instructionObject.exit_destination;
            } else if (step.destinations && instructionObject.destination) {
                instruction = instructionObject.destination;
            } else if (step.exits && instructionObject.exit) {
                instruction = instructionObject.exit;
            } else if (wayName && instructionObject.name) {
                instruction = instructionObject.name;
            } else {
                instruction = instructionObject.default;
            }

            if (opts.hooks.tokenizedInstruction) {
                instruction = opts.hooks.tokenizedInstruction(instruction);
            }

            var nthWaypoint = options && options.legIndex >= 0 && options.legIndex !== options.legCount - 1 ? this.ordinalize(language, options.legIndex + 1) : '';

            // Replace tokens
            // NOOP if they don't exist
            instruction = instruction
                .replace('{way_name}', wayName)
                .replace('{destination}', (step.destinations || '').split(',')[0])
                .replace('{exit}', (step.exits || '').split(';')[0])
                .replace('{exit_number}', this.ordinalize(language, step.maneuver.exit || 1))
                .replace('{rotary_name}', step.rotary_name)
                .replace('{lane_instruction}', laneInstruction)
                .replace('{modifier}', instructions[language][version].constants.modifier[modifier])
                .replace('{direction}', this.directionFromDegree(language, step.maneuver.bearing_after))
                .replace('{nth}', nthWaypoint)
                .replace(/ {2}/g, ' '); // remove excess spaces

            if (instructions[language].meta.capitalizeFirstLetter) {
                instruction = this.capitalizeFirstLetter(instruction);
            }

            return instruction;
        }
    };
};

},{"./languages":2}],2:[function(require,module,exports){
// Load all language files excplicitely to allow integration
// with bundling tools like webpack and browserify
var instructionsDe = require('./languages/translations/de.json');
var instructionsEn = require('./languages/translations/en.json');
var instructionsEs = require('./languages/translations/es.json');
var instructionsFr = require('./languages/translations/fr.json');
var instructionsId = require('./languages/translations/id.json');
var instructionsIt = require('./languages/translations/it.json');
var instructionsNl = require('./languages/translations/nl.json');
var instructionsPl = require('./languages/translations/pl.json');
var instructionsPtBr = require('./languages/translations/pt-BR.json');
var instructionsRu = require('./languages/translations/ru.json');
var instructionsSv = require('./languages/translations/sv.json');
var instructionsUk = require('./languages/translations/uk.json');
var instructionsVi = require('./languages/translations/vi.json');
var instructionsZhHans = require('./languages/translations/zh-Hans.json');


// Create a list of supported codes
var instructions = {
    'de': instructionsDe,
    'en': instructionsEn,
    'es': instructionsEs,
    'fr': instructionsFr,
    'id': instructionsId,
    'it': instructionsIt,
    'nl': instructionsNl,
    'pl': instructionsPl,
    'pt-BR': instructionsPtBr,
    'ru': instructionsRu,
    'sv': instructionsSv,
    'uk': instructionsUk,
    'vi': instructionsVi,
    'zh-Hans': instructionsZhHans
};

module.exports = {
    supportedCodes: Object.keys(instructions),
    instructions: instructions
};

},{"./languages/translations/de.json":3,"./languages/translations/en.json":4,"./languages/translations/es.json":5,"./languages/translations/fr.json":6,"./languages/translations/id.json":7,"./languages/translations/it.json":8,"./languages/translations/nl.json":9,"./languages/translations/pl.json":10,"./languages/translations/pt-BR.json":11,"./languages/translations/ru.json":12,"./languages/translations/sv.json":13,"./languages/translations/uk.json":14,"./languages/translations/vi.json":15,"./languages/translations/zh-Hans.json":16}],3:[function(require,module,exports){
module.exports={
    "meta": {
        "capitalizeFirstLetter": true
    },
    "v5": {
        "constants": {
            "ordinalize": {
                "1": "erste",
                "2": "zweite",
                "3": "dritte",
                "4": "vierte",
                "5": "fünfte",
                "6": "sechste",
                "7": "siebente",
                "8": "achte",
                "9": "neunte",
                "10": "zehnte"
            },
            "direction": {
                "north": "Norden",
                "northeast": "Nordosten",
                "east": "Osten",
                "southeast": "Südosten",
                "south": "Süden",
                "southwest": "Südwesten",
                "west": "Westen",
                "northwest": "Nordwesten"
            },
            "modifier": {
                "left": "links",
                "right": "rechts",
                "sharp left": "scharf links",
                "sharp right": "scharf rechts",
                "slight left": "leicht links",
                "slight right": "leicht rechts",
                "straight": "geradeaus",
                "uturn": "180°-Wendung"
            },
            "lanes": {
                "xo": "Rechts halten",
                "ox": "Links halten",
                "xox": "Mittlere Spur nutzen",
                "oxo": "Rechts oder links halten"
            }
        },
        "modes": {
            "ferry": {
                "default": "Fähre nehmen",
                "name": "Fähre nehmen {way_name}",
                "destination": "Fähre nehmen Richtung {destination}"
            }
        },
        "arrive": {
            "default": {
                "default": "Sie haben Ihr {nth} Ziel erreicht"
            },
            "left": {
                "default": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich links"
            },
            "right": {
                "default": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich rechts"
            },
            "sharp left": {
                "default": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich links"
            },
            "sharp right": {
                "default": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich rechts"
            },
            "slight right": {
                "default": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich rechts"
            },
            "slight left": {
                "default": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich links"
            },
            "straight": {
                "default": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich geradeaus"
            }
        },
        "continue": {
            "default": {
                "default": "{modifier} weiterfahren",
                "name": "{modifier} weiterfahren auf {way_name}",
                "destination": "{modifier} weiterfahren Richtung {destination}"
            },
            "slight left": {
                "default": "Leicht links weiter",
                "name": "Leicht links weiter auf {way_name}",
                "destination": "Leicht links weiter Richtung {destination}"
            },
            "slight right": {
                "default": "Leicht rechts weiter",
                "name": "Leicht rechts weiter auf {way_name}",
                "destination": "Leicht rechts weiter Richtung {destination}"
            },
            "uturn": {
                "default": "180°-Wendung",
                "name": "180°-Wendung auf {way_name}",
                "destination": "180°-Wendung Richtung {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Fahren Sie Richtung {direction}",
                "name": "Fahren Sie Richtung {direction} auf {way_name}"
            }
        },
        "end of road": {
            "default": {
                "default": "{modifier} abbiegen",
                "name": "{modifier} abbiegen auf {way_name}",
                "destination": "{modifier} abbiegen Richtung {destination}"
            },
            "straight": {
                "default": "Geradeaus weiterfahren",
                "name": "Geradeaus weiterfahren auf {way_name}",
                "destination": "Geradeaus weiterfahren Richtung {destination}"
            },
            "uturn": {
                "default": "180°-Wendung am Ende der Straße",
                "name": "180°-Wendung auf {way_name} am Ende der Straße",
                "destination": "180°-Wendung Richtung {destination} am Ende der Straße"
            }
        },
        "fork": {
            "default": {
                "default": "{modifier} halten an der Gabelung",
                "name": "{modifier} halten an der Gabelung auf {way_name}",
                "destination": "{modifier}  halten an der Gabelung Richtung {destination}"
            },
            "slight left": {
                "default": "Links halten an der Gabelung",
                "name": "Links halten an der Gabelung auf {way_name}",
                "destination": "Links halten an der Gabelung Richtung {destination}"
            },
            "slight right": {
                "default": "Rechts halten an der Gabelung",
                "name": "Rechts halten an der Gabelung auf {way_name}",
                "destination": "Rechts halten an der Gabelung Richtung {destination}"
            },
            "sharp left": {
                "default": "Scharf links abbiegen an der Gabelung",
                "name": "Scharf links abbiegen an der Gabelung auf {way_name}",
                "destination": "Scharf links abbiegen an der Gabelung Richtung {destination}"
            },
            "sharp right": {
                "default": "Scharf rechts abbiegen an der Gabelung",
                "name": "Scharf rechts abbiegen an der Gabelung auf {way_name}",
                "destination": "Scharf rechts abbiegen an der Gabelung Richtung {destination}"
            },
            "uturn": {
                "default": "180°-Wendung",
                "name": "180°-Wendung auf {way_name}",
                "destination": "180°-Wendung Richtung {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "{modifier} auffahren",
                "name": "{modifier} auffahren auf {way_name}",
                "destination": "{modifier} auffahren Richtung {destination}"
            },
            "slight left": {
                "default": "Leicht links auffahren",
                "name": "Leicht links auffahren auf {way_name}",
                "destination": "Leicht links auffahren Richtung {destination}"
            },
            "slight right": {
                "default": "Leicht rechts auffahren",
                "name": "Leicht rechts auffahren auf {way_name}",
                "destination": "Leicht rechts auffahren Richtung {destination}"
            },
            "sharp left": {
                "default": "Scharf links auffahren",
                "name": "Scharf links auffahren auf {way_name}",
                "destination": "Scharf links auffahren Richtung {destination}"
            },
            "sharp right": {
                "default": "Scharf rechts auffahren",
                "name": "Scharf rechts auffahren auf {way_name}",
                "destination": "Scharf rechts auffahren Richtung {destination}"
            },
            "uturn": {
                "default": "180°-Wendung",
                "name": "180°-Wendung auf {way_name}",
                "destination": "180°-Wendung Richtung {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "{modifier} weiterfahren",
                "name": "{modifier} weiterfahren auf {way_name}",
                "destination": "{modifier} weiterfahren Richtung {destination}"
            },
            "straight": {
                "default": "Geradeaus weiterfahren",
                "name": "Weiterfahren auf {way_name}",
                "destination": "Weiterfahren in Richtung {destination}"
            },
            "sharp left": {
                "default": "Scharf links",
                "name": "Scharf links auf {way_name}",
                "destination": "Scharf links Richtung {destination}"
            },
            "sharp right": {
                "default": "Scharf rechts",
                "name": "Scharf rechts auf {way_name}",
                "destination": "Scharf rechts Richtung {destination}"
            },
            "slight left": {
                "default": "Leicht links weiter",
                "name": "Leicht links weiter auf {way_name}",
                "destination": "Leicht links weiter Richtung {destination}"
            },
            "slight right": {
                "default": "Leicht rechts weiter",
                "name": "Leicht rechts weiter auf {way_name}",
                "destination": "Leicht rechts weiter Richtung {destination}"
            },
            "uturn": {
                "default": "180°-Wendung",
                "name": "180°-Wendung auf {way_name}",
                "destination": "180°-Wendung Richtung {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "{modifier} weiterfahren",
                "name": "{modifier} weiterfahren auf {way_name}",
                "destination": "{modifier} weiterfahren Richtung {destination}"
            },
            "uturn": {
                "default": "180°-Wendung",
                "name": "180°-Wendung auf {way_name}",
                "destination": "180°-Wendung Richtung {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Ausfahrt nehmen",
                "name": "Ausfahrt nehmen auf {way_name}",
                "destination": "Ausfahrt nehmen Richtung {destination}",
                "exit": "Ausfahrt {exit} nehmen",
                "exit_destination": "Ausfahrt {exit} nehmen Richtung {destination}"
            },
            "left": {
                "default": "Ausfahrt links nehmen",
                "name": "Ausfahrt links nehmen auf {way_name}",
                "destination": "Ausfahrt links nehmen Richtung {destination}",
                "exit": "Ausfahrt {exit} links nehmen",
                "exit_destination": "Ausfahrt {exit} links nehmen Richtung {destination}"
            },
            "right": {
                "default": "Ausfahrt rechts nehmen",
                "name": "Ausfahrt rechts nehmen Richtung {way_name}",
                "destination": "Ausfahrt rechts nehmen Richtung {destination}",
                "exit": "Ausfahrt {exit} rechts nehmen",
                "exit_destination": "Ausfahrt {exit} nehmen Richtung {destination}"
            },
            "sharp left": {
                "default": "Ausfahrt links nehmen",
                "name": "Ausfahrt links Seite nehmen auf {way_name}",
                "destination": "Ausfahrt links nehmen Richtung {destination}",
                "exit": "Ausfahrt {exit} links nehmen",
                "exit_destination": "Ausfahrt{exit} links nehmen Richtung {destination}"
            },
            "sharp right": {
                "default": "Ausfahrt rechts nehmen",
                "name": "Ausfahrt rechts nehmen auf {way_name}",
                "destination": "Ausfahrt rechts nehmen Richtung {destination}",
                "exit": "Ausfahrt {exit} rechts nehmen",
                "exit_destination": "Ausfahrt {exit} nehmen Richtung {destination}"
            },
            "slight left": {
                "default": "Ausfahrt links nehmen",
                "name": "Ausfahrt links nehmen auf {way_name}",
                "destination": "Ausfahrt links nehmen Richtung {destination}",
                "exit": "Ausfahrt {exit} nehmen",
                "exit_destination": "Ausfahrt {exit} links nehmen Richtung {destination}"
            },
            "slight right": {
                "default": "Ausfahrt rechts nehmen",
                "name": "Ausfahrt rechts nehmen auf {way_name}",
                "destination": "Ausfahrt rechts nehmen Richtung {destination}",
                "exit": "Ausfahrt {exit} rechts nehmen",
                "exit_destination": "Ausfahrt {exit} nehmen Richtung {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Auffahrt nehmen",
                "name": "Auffahrt nehmen auf {way_name}",
                "destination": "Auffahrt nehmen Richtung {destination}"
            },
            "left": {
                "default": "Auffahrt links nehmen",
                "name": "Auffahrt links nehmen auf {way_name}",
                "destination": "Auffahrt links nehmen Richtung {destination}"
            },
            "right": {
                "default": "Auffahrt rechts nehmen",
                "name": "Auffahrt rechts nehmen auf {way_name}",
                "destination": "Auffahrt rechts nehmen Richtung {destination}"
            },
            "sharp left": {
                "default": "Auffahrt links nehmen",
                "name": "Auffahrt links nehmen auf {way_name}",
                "destination": "Auffahrt links nehmen Richtung {destination}"
            },
            "sharp right": {
                "default": "Auffahrt rechts nehmen",
                "name": "Auffahrt rechts nehmen auf {way_name}",
                "destination": "Auffahrt rechts nehmen Richtung {destination}"
            },
            "slight left": {
                "default": "Auffahrt links Seite nehmen",
                "name": "Auffahrt links nehmen auf {way_name}",
                "destination": "Auffahrt links nehmen Richtung {destination}"
            },
            "slight right": {
                "default": "Auffahrt rechts nehmen",
                "name": "Auffahrt rechts nehmen auf {way_name}",
                "destination": "Auffahrt rechts nehmen Richtung {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "In den Kreisverkehr fahren",
                    "name": "Im Kreisverkehr die Ausfahrt auf {way_name} nehmen",
                    "destination": "Im Kreisverkehr die Ausfahrt Richtung {destination} nehmen"
                },
                "name": {
                    "default": "In {rotary_name} fahren",
                    "name": "In {rotary_name} die Ausfahrt auf {way_name} nehmen",
                    "destination": "In {rotary_name} die Ausfahrt Richtung {destination} nehmen"
                },
                "exit": {
                    "default": "Im Kreisverkehr die {exit_number} Ausfahrt nehmen",
                    "name": "Im Kreisverkehr die {exit_number} Ausfahrt nehmen auf {way_name}",
                    "destination": "Im Kreisverkehr die {exit_number} Ausfahrt nehmen Richtung {destination}"
                },
                "name_exit": {
                    "default": "In den Kreisverkehr fahren und {exit_number} Ausfahrt nehmen",
                    "name": "In den Kreisverkehr fahren und {exit_number} Ausfahrt nehmen auf {way_name}",
                    "destination": "In den Kreisverkehr fahren und {exit_number} Ausfahrt nehmen Richtung {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "Im Kreisverkehr die {exit_number} Ausfahrt nehmen",
                    "name": "Im Kreisverkehr die {exit_number} Ausfahrt nehmen auf {way_name}",
                    "destination": "Im Kreisverkehr die {exit_number} Ausfahrt nehmen Richtung {destination}"
                },
                "default": {
                    "default": "In den Kreisverkehr fahren",
                    "name": "Im Kreisverkehr die Ausfahrt auf {way_name} nehmen",
                    "destination": "Im Kreisverkehr die Ausfahrt Richtung {destination} nehmen"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "Am Kreisverkehr {modifier}",
                "name": "Am Kreisverkehr {modifier} auf {way_name}",
                "destination": "Am Kreisverkehr {modifier} Richtung {destination}"
            },
            "left": {
                "default": "Am Kreisverkehr links abbiegen",
                "name": "Am Kreisverkehr links auf {way_name}",
                "destination": "Am Kreisverkehr links Richtung {destination}"
            },
            "right": {
                "default": "Am Kreisverkehr rechts abbiegen",
                "name": "Am Kreisverkehr rechts auf {way_name}",
                "destination": "Am Kreisverkehr rechts Richtung {destination}"
            },
            "straight": {
                "default": "Am Kreisverkehr geradeaus weiterfahren",
                "name": "Am Kreisverkehr geradeaus weiterfahren auf {way_name}",
                "destination": "Am Kreisverkehr geradeaus weiterfahren Richtung {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "{modifier} abbiegen",
                "name": "{modifier} abbiegen auf {way_name}",
                "destination": "{modifier} abbiegen Richtung {destination}"
            },
            "left": {
                "default": "Links abbiegen",
                "name": "Links abbiegen auf {way_name}",
                "destination": "Links abbiegen Richtung {destination}"
            },
            "right": {
                "default": "Rechts abbiegen",
                "name": "Rechts abbiegen auf {way_name}",
                "destination": "Rechts abbiegen Richtung {destination}"
            },
            "straight": {
                "default": "Geradeaus weiterfahren",
                "name": "Geradeaus weiterfahren auf {way_name}",
                "destination": "Geradeaus weiterfahren Richtung {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Geradeaus weiterfahren"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}
},{}],4:[function(require,module,exports){
module.exports={
    "meta": {
        "capitalizeFirstLetter": true
    },
    "v5": {
        "constants": {
            "ordinalize": {
                "1": "1st",
                "2": "2nd",
                "3": "3rd",
                "4": "4th",
                "5": "5th",
                "6": "6th",
                "7": "7th",
                "8": "8th",
                "9": "9th",
                "10": "10th"
            },
            "direction": {
                "north": "north",
                "northeast": "northeast",
                "east": "east",
                "southeast": "southeast",
                "south": "south",
                "southwest": "southwest",
                "west": "west",
                "northwest": "northwest"
            },
            "modifier": {
                "left": "left",
                "right": "right",
                "sharp left": "sharp left",
                "sharp right": "sharp right",
                "slight left": "slight left",
                "slight right": "slight right",
                "straight": "straight",
                "uturn": "U-turn"
            },
            "lanes": {
                "xo": "Keep right",
                "ox": "Keep left",
                "xox": "Keep in the middle",
                "oxo": "Keep left or right"
            }
        },
        "modes": {
            "ferry": {
                "default": "Take the ferry",
                "name": "Take the ferry {way_name}",
                "destination": "Take the ferry towards {destination}"
            }
        },
        "arrive": {
            "default": {
                "default": "You have arrived at your {nth} destination"
            },
            "left": {
                "default": "You have arrived at your {nth} destination, on the left"
            },
            "right": {
                "default": "You have arrived at your {nth} destination, on the right"
            },
            "sharp left": {
                "default": "You have arrived at your {nth} destination, on the left"
            },
            "sharp right": {
                "default": "You have arrived at your {nth} destination, on the right"
            },
            "slight right": {
                "default": "You have arrived at your {nth} destination, on the right"
            },
            "slight left": {
                "default": "You have arrived at your {nth} destination, on the left"
            },
            "straight": {
                "default": "You have arrived at your {nth} destination, straight ahead"
            }
        },
        "continue": {
            "default": {
                "default": "Continue {modifier}",
                "name": "Continue {modifier} onto {way_name}",
                "destination": "Continue {modifier} towards {destination}"
            },
            "straight": {
                "default": "Continue straight",
                "name": "Continue onto {way_name}",
                "destination": "Continue towards {destination}"
            },
            "slight left": {
                "default": "Continue slightly left",
                "name": "Continue slightly left onto {way_name}",
                "destination": "Continue slightly left towards {destination}"
            },
            "slight right": {
                "default": "Continue slightly right",
                "name": "Continue slightly right onto {way_name}",
                "destination": "Continue slightly right towards {destination}"
            },
            "uturn": {
                "default": "Make a U-turn",
                "name": "Make a U-turn onto {way_name}",
                "destination": "Make a U-turn towards {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Head {direction}",
                "name": "Head {direction} on {way_name}"
            }
        },
        "end of road": {
            "default": {
                "default": "Turn {modifier}",
                "name": "Turn {modifier} onto {way_name}",
                "destination": "Turn {modifier} towards {destination}"
            },
            "straight": {
                "default": "Continue straight",
                "name": "Continue straight onto {way_name}",
                "destination": "Continue straight towards {destination}"
            },
            "uturn": {
                "default": "Make a U-turn at the end of the road",
                "name": "Make a U-turn onto {way_name} at the end of the road",
                "destination": "Make a U-turn towards {destination} at the end of the road"
            }
        },
        "fork": {
            "default": {
                "default": "Keep {modifier} at the fork",
                "name": "Keep {modifier} at the fork onto {way_name}",
                "destination": "Keep {modifier} at the fork towards {destination}"
            },
            "slight left": {
                "default": "Keep left at the fork",
                "name": "Keep left at the fork onto {way_name}",
                "destination": "Keep left at the fork towards {destination}"
            },
            "slight right": {
                "default": "Keep right at the fork",
                "name": "Keep right at the fork onto {way_name}",
                "destination": "Keep right at the fork towards {destination}"
            },
            "sharp left": {
                "default": "Take a sharp left at the fork",
                "name": "Take a sharp left at the fork onto {way_name}",
                "destination": "Take a sharp left at the fork towards {destination}"
            },
            "sharp right": {
                "default": "Take a sharp right at the fork",
                "name": "Take a sharp right at the fork onto {way_name}",
                "destination": "Take a sharp right at the fork towards {destination}"
            },
            "uturn": {
                "default": "Make a U-turn",
                "name": "Make a U-turn onto {way_name}",
                "destination": "Make a U-turn towards {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Merge {modifier}",
                "name": "Merge {modifier} onto {way_name}",
                "destination": "Merge {modifier} towards {destination}"
            },
            "slight left": {
                "default": "Merge left",
                "name": "Merge left onto {way_name}",
                "destination": "Merge left towards {destination}"
            },
            "slight right": {
                "default": "Merge right",
                "name": "Merge right onto {way_name}",
                "destination": "Merge right towards {destination}"
            },
            "sharp left": {
                "default": "Merge left",
                "name": "Merge left onto {way_name}",
                "destination": "Merge left towards {destination}"
            },
            "sharp right": {
                "default": "Merge right",
                "name": "Merge right onto {way_name}",
                "destination": "Merge right towards {destination}"
            },
            "uturn": {
                "default": "Make a U-turn",
                "name": "Make a U-turn onto {way_name}",
                "destination": "Make a U-turn towards {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Continue {modifier}",
                "name": "Continue {modifier} onto {way_name}",
                "destination": "Continue {modifier} towards {destination}"
            },
            "straight": {
                "default": "Continue straight",
                "name": "Continue onto {way_name}",
                "destination": "Continue towards {destination}"
            },
            "sharp left": {
                "default": "Take a sharp left",
                "name": "Take a sharp left onto {way_name}",
                "destination": "Take a sharp left towards {destination}"
            },
            "sharp right": {
                "default": "Take a sharp right",
                "name": "Take a sharp right onto {way_name}",
                "destination": "Take a sharp right towards {destination}"
            },
            "slight left": {
                "default": "Continue slightly left",
                "name": "Continue slightly left onto {way_name}",
                "destination": "Continue slightly left towards {destination}"
            },
            "slight right": {
                "default": "Continue slightly right",
                "name": "Continue slightly right onto {way_name}",
                "destination": "Continue slightly right towards {destination}"
            },
            "uturn": {
                "default": "Make a U-turn",
                "name": "Make a U-turn onto {way_name}",
                "destination": "Make a U-turn towards {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Continue {modifier}",
                "name": "Continue {modifier} onto {way_name}",
                "destination": "Continue {modifier} towards {destination}"
            },
            "uturn": {
                "default": "Make a U-turn",
                "name": "Make a U-turn onto {way_name}",
                "destination": "Make a U-turn towards {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Take the ramp",
                "name": "Take the ramp onto {way_name}",
                "destination": "Take the ramp towards {destination}",
                "exit": "Take exit {exit}",
                "exit_destination": "Take exit {exit} towards {destination}"
            },
            "left": {
                "default": "Take the ramp on the left",
                "name": "Take the ramp on the left onto {way_name}",
                "destination": "Take the ramp on the left towards {destination}",
                "exit": "Take exit {exit} on the left",
                "exit_destination": "Take exit {exit} on the left towards {destination}"
            },
            "right": {
                "default": "Take the ramp on the right",
                "name": "Take the ramp on the right onto {way_name}",
                "destination": "Take the ramp on the right towards {destination}",
                "exit": "Take exit {exit} on the right",
                "exit_destination": "Take exit {exit} on the right towards {destination}"
            },
            "sharp left": {
                "default": "Take the ramp on the left",
                "name": "Take the ramp on the left onto {way_name}",
                "destination": "Take the ramp on the left towards {destination}",
                "exit": "Take exit {exit} on the left",
                "exit_destination": "Take exit {exit} on the left towards {destination}"
            },
            "sharp right": {
                "default": "Take the ramp on the right",
                "name": "Take the ramp on the right onto {way_name}",
                "destination": "Take the ramp on the right towards {destination}",
                "exit": "Take exit {exit} on the right",
                "exit_destination": "Take exit {exit} on the right towards {destination}"
            },
            "slight left": {
                "default": "Take the ramp on the left",
                "name": "Take the ramp on the left onto {way_name}",
                "destination": "Take the ramp on the left towards {destination}",
                "exit": "Take exit {exit} on the left",
                "exit_destination": "Take exit {exit} on the left towards {destination}"
            },
            "slight right": {
                "default": "Take the ramp on the right",
                "name": "Take the ramp on the right onto {way_name}",
                "destination": "Take the ramp on the right towards {destination}",
                "exit": "Take exit {exit} on the right",
                "exit_destination": "Take exit {exit} on the right towards {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Take the ramp",
                "name": "Take the ramp onto {way_name}",
                "destination": "Take the ramp towards {destination}"
            },
            "left": {
                "default": "Take the ramp on the left",
                "name": "Take the ramp on the left onto {way_name}",
                "destination": "Take the ramp on the left towards {destination}"
            },
            "right": {
                "default": "Take the ramp on the right",
                "name": "Take the ramp on the right onto {way_name}",
                "destination": "Take the ramp on the right towards {destination}"
            },
            "sharp left": {
                "default": "Take the ramp on the left",
                "name": "Take the ramp on the left onto {way_name}",
                "destination": "Take the ramp on the left towards {destination}"
            },
            "sharp right": {
                "default": "Take the ramp on the right",
                "name": "Take the ramp on the right onto {way_name}",
                "destination": "Take the ramp on the right towards {destination}"
            },
            "slight left": {
                "default": "Take the ramp on the left",
                "name": "Take the ramp on the left onto {way_name}",
                "destination": "Take the ramp on the left towards {destination}"
            },
            "slight right": {
                "default": "Take the ramp on the right",
                "name": "Take the ramp on the right onto {way_name}",
                "destination": "Take the ramp on the right towards {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Enter the rotary",
                    "name": "Enter the rotary and exit onto {way_name}",
                    "destination": "Enter the rotary and exit towards {destination}"
                },
                "name": {
                    "default": "Enter {rotary_name}",
                    "name": "Enter {rotary_name} and exit onto {way_name}",
                    "destination": "Enter {rotary_name} and exit towards {destination}"
                },
                "exit": {
                    "default": "Enter the rotary and take the {exit_number} exit",
                    "name": "Enter the rotary and take the {exit_number} exit onto {way_name}",
                    "destination": "Enter the rotary and take the {exit_number} exit towards {destination}"
                },
                "name_exit": {
                    "default": "Enter {rotary_name} and take the {exit_number} exit",
                    "name": "Enter {rotary_name} and take the {exit_number} exit onto {way_name}",
                    "destination": "Enter {rotary_name} and take the {exit_number} exit towards {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "Enter the roundabout and take the {exit_number} exit",
                    "name": "Enter the roundabout and take the {exit_number} exit onto {way_name}",
                    "destination": "Enter the roundabout and take the {exit_number} exit towards {destination}"
                },
                "default": {
                    "default": "Enter the roundabout",
                    "name": "Enter the roundabout and exit onto {way_name}",
                    "destination": "Enter the roundabout and exit towards {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "At the roundabout make a {modifier}",
                "name": "At the roundabout make a {modifier} onto {way_name}",
                "destination": "At the roundabout make a {modifier} towards {destination}"
            },
            "left": {
                "default": "At the roundabout turn left",
                "name": "At the roundabout turn left onto {way_name}",
                "destination": "At the roundabout turn left towards {destination}"
            },
            "right": {
                "default": "At the roundabout turn right",
                "name": "At the roundabout turn right onto {way_name}",
                "destination": "At the roundabout turn right towards {destination}"
            },
            "straight": {
                "default": "At the roundabout continue straight",
                "name": "At the roundabout continue straight onto {way_name}",
                "destination": "At the roundabout continue straight towards {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Make a {modifier}",
                "name": "Make a {modifier} onto {way_name}",
                "destination": "Make a {modifier} towards {destination}"
            },
            "left": {
                "default": "Turn left",
                "name": "Turn left onto {way_name}",
                "destination": "Turn left towards {destination}"
            },
            "right": {
                "default": "Turn right",
                "name": "Turn right onto {way_name}",
                "destination": "Turn right towards {destination}"
            },
            "straight": {
                "default": "Go straight",
                "name": "Go straight onto {way_name}",
                "destination": "Go straight towards {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Continue straight"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}

},{}],5:[function(require,module,exports){
module.exports={
    "meta": {
        "capitalizeFirstLetter": true
    },
    "v5": {
        "constants": {
            "ordinalize": {
                "1": "1ª",
                "2": "2ª",
                "3": "3ª",
                "4": "4ª",
                "5": "5ª",
                "6": "6ª",
                "7": "7ª",
                "8": "8ª",
                "9": "9ª",
                "10": "10ª"
            },
            "direction": {
                "north": "norte",
                "northeast": "noreste",
                "east": "este",
                "southeast": "sureste",
                "south": "sur",
                "southwest": "suroeste",
                "west": "oeste",
                "northwest": "noroeste"
            },
            "modifier": {
                "left": "izquierda",
                "right": "derecha",
                "sharp left": "cerrada a la izquierda",
                "sharp right": "cerrada a la derecha",
                "slight left": "ligeramente a la izquierda",
                "slight right": "ligeramente a la derecha",
                "straight": "recto",
                "uturn": "cambio de sentido"
            },
            "lanes": {
                "xo": "Mantengase a la derecha",
                "ox": "Mantengase a la izquierda",
                "xox": "Mantengase en el medio",
                "oxo": "Mantengase a la izquierda o derecha"
            }
        },
        "modes": {
            "ferry": {
                "default": "Coge el ferry",
                "name": "Coge el ferry {way_name}",
                "destination": "Coge el ferry a  {destination}"
            }
        },
        "arrive": {
            "default": {
                "default": "Has llegado a tu {nth} destino"
            },
            "left": {
                "default": "Has llegado a tu {nth} destino, a la izquierda"
            },
            "right": {
                "default": "Has llegado a tu {nth} destino, a la derecha"
            },
            "sharp left": {
                "default": "Has llegado a tu {nth} destino, a la izquierda"
            },
            "sharp right": {
                "default": "Has llegado a tu {nth} destino, a la derecha"
            },
            "slight right": {
                "default": "Has llegado a tu {nth} destino, a la derecha"
            },
            "slight left": {
                "default": "Has llegado a tu {nth} destino, a la izquierda"
            },
            "straight": {
                "default": "Has llegado a tu {nth} destino, en frente"
            }
        },
        "continue": {
            "default": {
                "default": "Continúe {modifier}",
                "name": "Continúe {modifier} en {way_name}",
                "destination": "Continúe {modifier} hacia {destination}"
            },
            "straight": {
                "default": "Continúe recto",
                "name": "Continúe en {way_name}",
                "destination": "Continúe hacia {destination}"
            },
            "slight left": {
                "default": "Continúe ligeramente a la izquierda",
                "name": "Continúe ligeramente a la izquierda en {way_name}",
                "destination": "Continúe ligeramente a la izquierda hacia {destination}"
            },
            "slight right": {
                "default": "Continúe ligeramente a la derecha",
                "name": "Continúe ligeramente a la derecha en {way_name}",
                "destination": "Continúe ligeramente a la derecha hacia {destination}"
            },
            "uturn": {
                "default": "Haz un cambio de sentido",
                "name": "Haz un cambio de sentido en  {way_name}",
                "destination": "Haz un cambio de sentido hacia  {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Ve a  {direction}",
                "name": "Ve a  {direction} en  {way_name}"
            }
        },
        "end of road": {
            "default": {
                "default": "Gire  a  {modifier}",
                "name": "Gire a  {modifier} en  {way_name}",
                "destination": "Gire a  {modifier} hacia  {destination}"
            },
            "straight": {
                "default": "Continúe recto",
                "name": "Continúe recto en  {way_name}",
                "destination": "Continúe recto hacia {destination}"
            },
            "uturn": {
                "default": "Haz un cambio de sentido al final de la via",
                "name": "Haz un cambio de sentido en  {way_name} al final de la via",
                "destination": "Haz un cambio de sentido hacia  {destination} al final de la via"
            }
        },
        "fork": {
            "default": {
                "default": "Mantengase  {modifier} en el cruce",
                "name": "Mantengase  {modifier} en el cruce en  {way_name}",
                "destination": "Mantengase  {modifier} en el cruce hacia  {destination}"
            },
            "slight left": {
                "default": "Mantengase a la izquierda en el cruce",
                "name": "Mantengase a la izquierda en el cruce en  {way_name}",
                "destination": "Mantengase a la izquierda en el cruce hacia  {destination}"
            },
            "slight right": {
                "default": "Mantengase a la derecha en el cruce",
                "name": "Mantengase a la derecha en el cruce en {way_name}",
                "destination": "Mantengase a la derecha en el cruce hacia  {destination}"
            },
            "sharp left": {
                "default": "Gire a la izquierda en el cruce",
                "name": "Gire a la izquierda en el cruce en {way_name}",
                "destination": "Gire a la izquierda en el cruce hacia {destination}"
            },
            "sharp right": {
                "default": "Gire a la derecha en el cruce",
                "name": "Gire a la derecha en el cruce en {way_name}",
                "destination": "Gire a la derecha en el cruce hacia {destination}"
            },
            "uturn": {
                "default": "Haz un cambio de sentido",
                "name": "Haz un cambio de sentido en  {way_name}",
                "destination": "Haz un cambio de sentido hacia  {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Gire  a  {modifier}",
                "name": "Gire a  {modifier} en  {way_name}",
                "destination": "Gire a  {modifier} hacia  {destination}"
            },
            "slight left": {
                "default": "Gire a la izquierda",
                "name": "Gire a la izquierda en  {way_name}",
                "destination": "Gire a la izquierda hacia  {destination}"
            },
            "slight right": {
                "default": "Gire a la derecha",
                "name": "Gire a la derecha en  {way_name}",
                "destination": "Gire a la derecha hacia  {destination}"
            },
            "sharp left": {
                "default": "Gire a la izquierda",
                "name": "Gire a la izquierda en  {way_name}",
                "destination": "Gire a la izquierda hacia  {destination}"
            },
            "sharp right": {
                "default": "Gire a la derecha",
                "name": "Gire a la derecha en  {way_name}",
                "destination": "Gire a la derecha hacia  {destination}"
            },
            "uturn": {
                "default": "Haz un cambio de sentido",
                "name": "Haz un cambio de sentido en  {way_name}",
                "destination": "Haz un cambio de sentido hacia  {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Continúe {modifier}",
                "name": "Continúe {modifier} en {way_name}",
                "destination": "Continúe {modifier} hacia {destination}"
            },
            "straight": {
                "default": "Continúe recto",
                "name": "Continúe en {way_name}",
                "destination": "Continúe hacia {destination}"
            },
            "sharp left": {
                "default": "Gire a la izquierda",
                "name": "Gire a la izquierda en {way_name}",
                "destination": "Gire a la izquierda hacia {destination}"
            },
            "sharp right": {
                "default": "Gire a la derecha",
                "name": "Gire a la derecha en {way_name}",
                "destination": "Gire a la derecha hacia {destination}"
            },
            "slight left": {
                "default": "Continúe ligeramente a la izquierda",
                "name": "Continúe ligeramente a la izquierda en {way_name}",
                "destination": "Continúe ligeramente a la izquierda hacia {destination}"
            },
            "slight right": {
                "default": "Continúe ligeramente a la derecha",
                "name": "Continúe ligeramente a la derecha en {way_name}",
                "destination": "Continúe ligeramente a la derecha hacia {destination}"
            },
            "uturn": {
                "default": "Haz un cambio de sentido",
                "name": "Haz un cambio de sentido en  {way_name}",
                "destination": "Haz un cambio de sentido hacia  {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Continúe {modifier}",
                "name": "Continúe {modifier} en {way_name}",
                "destination": "Continúe {modifier} hacia {destination}"
            },
            "uturn": {
                "default": "Haz un cambio de sentido",
                "name": "Haz un cambio de sentido en  {way_name}",
                "destination": "Haz un cambio de sentido hacia  {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Ve cuesta abajo",
                "name": "Ve cuesta abajo en {way_name}",
                "destination": "Ve cuesta abajo hacia {destination}",
                "exit": "Tome la salida {exit}",
                "exit_destination": "Tome la salida {exit} hacia {destination}"
            },
            "left": {
                "default": "Ve cuesta abajo en la izquierda",
                "name": "Ve cuesta abajo en la izquierda en {way_name}",
                "destination": "Ve cuesta abajo en la izquierda hacia {destination}",
                "exit": "Tome la salida {exit} en la izquierda",
                "exit_destination": "Tome la salida {exit} en la izquierda hacia {destination}"
            },
            "right": {
                "default": "Ve cuesta abajo en la derecha",
                "name": "Ve cuesta abajo en la derecha en {way_name}",
                "destination": "Ve cuesta abajo en la derecha hacia {destination}",
                "exit": "Tome la salida {exit} en la derecha",
                "exit_destination": "Tome la salida {exit} en la derecha hacia {destination}"
            },
            "sharp left": {
                "default": "Ve cuesta abajo en la izquierda",
                "name": "Ve cuesta abajo en la izquierda en {way_name}",
                "destination": "Ve cuesta abajo en la izquierda hacia {destination}",
                "exit": "Tome la salida {exit} en la izquierda",
                "exit_destination": "Tome la salida {exit} en la izquierda hacia {destination}"
            },
            "sharp right": {
                "default": "Ve cuesta abajo en la derecha",
                "name": "Ve cuesta abajo en la derecha en {way_name}",
                "destination": "Ve cuesta abajo en la derecha hacia {destination}",
                "exit": "Tome la salida {exit} en la derecha",
                "exit_destination": "Tome la salida {exit} en la derecha hacia {destination}"
            },
            "slight left": {
                "default": "Ve cuesta abajo en la izquierda",
                "name": "Ve cuesta abajo en la izquierda en {way_name}",
                "destination": "Ve cuesta abajo en la izquierda hacia {destination}",
                "exit": "Tome la salida {exit} en la izquierda",
                "exit_destination": "Tome la salida {exit} en la izquierda hacia {destination}"
            },
            "slight right": {
                "default": "Ve cuesta abajo en la derecha",
                "name": "Ve cuesta abajo en la derecha en {way_name}",
                "destination": "Ve cuesta abajo en la derecha hacia {destination}",
                "exit": "Tome la salida {exit} en la derecha",
                "exit_destination": "Tome la salida {exit} en la derecha hacia {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Ve cuesta abajo",
                "name": "Ve cuesta abajo en {way_name}",
                "destination": "Ve cuesta abajo hacia {destination}"
            },
            "left": {
                "default": "Ve cuesta abajo en la izquierda",
                "name": "Ve cuesta abajo en la izquierda en {way_name}",
                "destination": "Ve cuesta abajo en la izquierda hacia {destination}"
            },
            "right": {
                "default": "Ve cuesta abajo en la derecha",
                "name": "Ve cuesta abajo en la derecha en {way_name}",
                "destination": "Ve cuesta abajo en la derecha hacia {destination}"
            },
            "sharp left": {
                "default": "Ve cuesta abajo en la izquierda",
                "name": "Ve cuesta abajo en la izquierda en {way_name}",
                "destination": "Ve cuesta abajo en la izquierda hacia {destination}"
            },
            "sharp right": {
                "default": "Ve cuesta abajo en la derecha",
                "name": "Ve cuesta abajo en la derecha en {way_name}",
                "destination": "Ve cuesta abajo en la derecha hacia {destination}"
            },
            "slight left": {
                "default": "Ve cuesta abajo en la izquierda",
                "name": "Ve cuesta abajo en la izquierda en {way_name}",
                "destination": "Ve cuesta abajo en la izquierda hacia {destination}"
            },
            "slight right": {
                "default": "Ve cuesta abajo en la derecha",
                "name": "Ve cuesta abajo en la derecha en {way_name}",
                "destination": "Ve cuesta abajo en la derecha hacia {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Entra en la rotonda",
                    "name": "Entra en la rotonda y sal en {way_name}",
                    "destination": "Entra en la rotonda y sal hacia {destination}"
                },
                "name": {
                    "default": "Entra en {rotary_name}",
                    "name": "Entra en {rotary_name} y sal en {way_name}",
                    "destination": "Entra en {rotary_name} y sal hacia {destination}"
                },
                "exit": {
                    "default": "Entra en la rotonda y toma la {exit_number} salida",
                    "name": "Entra en la rotonda y toma la {exit_number} salida a {way_name}",
                    "destination": "Entra en la rotonda y toma la {exit_number} salida hacia {destination}"
                },
                "name_exit": {
                    "default": "Entra en {rotary_name} y coge la {exit_number} salida",
                    "name": "Entra en {rotary_name} y coge la {exit_number} salida en {way_name}",
                    "destination": "Entra en {rotary_name} y coge la {exit_number} salida hacia {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "Entra en la rotonda y toma la {exit_number} salida",
                    "name": "Entra en la rotonda y toma la {exit_number} salida a {way_name}",
                    "destination": "Entra en la rotonda y toma la {exit_number} salida hacia {destination}"
                },
                "default": {
                    "default": "Entra en la rotonda",
                    "name": "Entra en la rotonda y sal en {way_name}",
                    "destination": "Entra en la rotonda y sal hacia {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "En la rotonda siga {modifier}",
                "name": "En la rotonda siga {modifier} en {way_name}",
                "destination": "En la rotonda siga {modifier} hacia {destination}"
            },
            "left": {
                "default": "En la rotonda gira a la izquierda",
                "name": "En la rotonda gira a la izquierda en {way_name}",
                "destination": "En la rotonda gira a la izquierda hacia {destination}"
            },
            "right": {
                "default": "En la rotonda gira a la derecha",
                "name": "En la rotonda gira a la derecha en {way_name}",
                "destination": "En la rotonda gira a la derecha hacia {destination}"
            },
            "straight": {
                "default": "En la rotonda continúe recto",
                "name": "En la rotonda continúe recto en {way_name}",
                "destination": "En la rotonda continúe recto hacia {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Siga {modifier}",
                "name": "Siga {modifier} en {way_name}",
                "destination": "Siga {modifier} hacia {destination}"
            },
            "left": {
                "default": "Gire a la izquierda",
                "name": "Gire a la izquierda en  {way_name}",
                "destination": "Gire a la izquierda hacia  {destination}"
            },
            "right": {
                "default": "Gire a la derecha",
                "name": "Gire a la derecha en  {way_name}",
                "destination": "Gire a la derecha hacia  {destination}"
            },
            "straight": {
                "default": "Ve recto",
                "name": "Ve recto en  {way_name}",
                "destination": "Ve recto hacia  {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Continúe recto"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}
},{}],6:[function(require,module,exports){
module.exports={
    "meta": {
        "capitalizeFirstLetter": true
    },
    "v5": {
        "constants": {
            "ordinalize": {
                "1": "première",
                "2": "seconde",
                "3": "troisième",
                "4": "quatrième",
                "5": "cinquième",
                "6": "sixième",
                "7": "setpième",
                "8": "huitième",
                "9": "neuvième",
                "10": "dixième"
            },
            "direction": {
                "north": "le nord",
                "northeast": "le nord-est",
                "east": "l'est",
                "southeast": "le sud-est",
                "south": "le sud",
                "southwest": "le sud-ouest",
                "west": "l'ouest",
                "northwest": "le nord-ouest"
            },
            "modifier": {
                "left": "à gauche",
                "right": "à droite",
                "sharp left": "franchement à gauche",
                "sharp right": "franchement à droite",
                "slight left": "légèrement à gauche",
                "slight right": "légèrement à droite",
                "straight": "tout droit",
                "uturn": "demi-tour"
            },
            "lanes": {
                "xo": "Serrer à droite",
                "ox": "Serrer à gauche",
                "xox": "Rester au milieu",
                "oxo": "Rester à gauche ou à droite"
            }
        },
        "modes": {
            "ferry": {
                "default": "Prendre le ferry",
                "name": "Prendre le ferry {way_name}",
                "destination": "Prendre le ferry en direction de {destination}"
            }
        },
        "arrive": {
            "default": {
                "default": "Vous êtes arrivés à votre {nth} destination"
            },
            "left": {
                "default": "Vous êtes arrivés à votre {nth} destination, sur la gauche"
            },
            "right": {
                "default": "Vous êtes arrivés à votre {nth} destination, sur la droite"
            },
            "sharp left": {
                "default": "Vous êtes arrivés à votre {nth} destination, sur la gauche"
            },
            "sharp right": {
                "default": "Vous êtes arrivés à votre {nth} destination, sur la droite"
            },
            "slight right": {
                "default": "Vous êtes arrivés à votre {nth} destination, sur la droite"
            },
            "slight left": {
                "default": "Vous êtes arrivés à votre {nth} destination, sur la gauche"
            },
            "straight": {
                "default": "Vous êtes arrivés à votre {nth} destination, droit devant"
            }
        },
        "continue": {
            "default": {
                "default": "Continuer {modifier}",
                "name": "Continuer {modifier} sur {way_name}",
                "destination": "Continuer {modifier} en direction de {destination}"
            },
            "straight": {
                "default": "Continuer tout droit",
                "name": "Continuer tout droit sur {way_name}",
                "destination": "Continuer tout droit en direction de {destination}"
            },
            "slight left": {
                "default": "Continuer légèrement à gauche",
                "name": "Continuer légèrement à gauche sur {way_name}",
                "destination": "Continuer légèrement à gauche en direction de {destination}"
            },
            "slight right": {
                "default": "Continuer légèrement à droite",
                "name": "Continuer légèrement à droite sur {way_name}",
                "destination": "Continuer légèrement à droite en direction de {destination}"
            },
            "uturn": {
                "default": "Faire demi-tour",
                "name": "Faire demi-tour sur {way_name}",
                "destination": "Faire demi-tour en direction de {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Rouler vers {direction}",
                "name": "Rouler vers {direction} sur {way_name}"
            }
        },
        "end of road": {
            "default": {
                "default": "Tourner {modifier}",
                "name": "Tourner {modifier} sur {way_name}",
                "destination": "Tourner {modifier} en direction de {destination}"
            },
            "straight": {
                "default": "Continuer tout droit",
                "name": "Continuer tout droit sur {way_name}",
                "destination": "Continuer tout droit en direction de {destination}"
            },
            "uturn": {
                "default": "Faire demi-tour à la fin de la route",
                "name": "Faire demi-tour à la fin de la route {way_name}",
                "destination": "Faire demi-tour à la fin de la route en direction de {destination}"
            }
        },
        "fork": {
            "default": {
                "default": "Rester {modifier} à l'embranchement",
                "name": "Rester {modifier} à l'embranchement sur {way_name}",
                "destination": "Rester {modifier} à l'embranchement en direction de {destination}"
            },
            "slight left": {
                "default": "Rester à gauche à l'embranchement",
                "name": "Rester à gauche à l'embranchement sur {way_name}",
                "destination": "Rester à gauche à l'embranchement en direction de {destination}"
            },
            "slight right": {
                "default": "Rester à droite à l'embranchement",
                "name": "Rester à droite à l'embranchement sur {way_name}",
                "destination": "Rester à droite à l'embranchement en direction de {destination}"
            },
            "sharp left": {
                "default": "Prendre à gauche à l'embranchement",
                "name": "Prendre à gauche à l'embranchement sur {way_name}",
                "destination": "Prendre à gauche à l'embranchement en direction de {destination}"
            },
            "sharp right": {
                "default": "Prendre à droite à l'embranchement",
                "name": "Prendre à droite à l'embranchement sur {way_name}",
                "destination": "Prendre à droite à l'embranchement en direction de {destination}"
            },
            "uturn": {
                "default": "Faire demi-tour",
                "name": "Faire demi-tour sur {way_name}",
                "destination": "Faire demi-tour en direction de {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Rejoindre {modifier}",
                "name": "Rejoindre {modifier} sur {way_name}",
                "destination": "Rejoindre {modifier} en direction de {destination}"
            },
            "slight left": {
                "default": "Rejoindre légèrement par la gauche",
                "name": "Rejoindre {way_name} légèrement par la gauche",
                "destination": "Rejoindre légèrement par la gauche la route en direction de {destination}"
            },
            "slight right": {
                "default": "Rejoindre légèrement par la droite",
                "name": "Rejoindre {way_name} légèrement par la droite",
                "destination": "Rejoindre légèrement par la droite la route en direction de {destination}"
            },
            "sharp left": {
                "default": "Rejoindre par la gauche",
                "name": "Rejoindre {way_name} par la gauche",
                "destination": "Rejoindre par la gauche la route en direction de {destination}"
            },
            "sharp right": {
                "default": "Rejoindre par la droite",
                "name": "Rejoindre {way_name} par la droite",
                "destination": "Rejoindre par la droite la route en direction de {destination}"
            },
            "uturn": {
                "default": "Fair demi-tour",
                "name": "Fair demi-tour sur {way_name}",
                "destination": "Fair demi-tour en direction de {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Continuer {modifier}",
                "name": "Continuer {modifier} sur {way_name}",
                "destination": "Continuer {modifier} en direction de {destination}"
            },
            "sharp left": {
                "default": "Prendre à gauche",
                "name": "Prendre à gauche sur {way_name}",
                "destination": "Prendre à gauche en direction de {destination}"
            },
            "sharp right": {
                "default": "Prendre à droite",
                "name": "Prendre à droite sur {way_name}",
                "destination": "Prendre à droite en direction de {destination}"
            },
            "slight left": {
                "default": "Continuer légèrement à gauche",
                "name": "Continuer légèrement à gauche sur {way_name}",
                "destination": "Continuer légèrement à gauche en direction de {destination}"
            },
            "slight right": {
                "default": "Continuer légèrement à droite",
                "name": "Continuer légèrement à droite sur {way_name}",
                "destination": "Continuer légèrement à droite en direction de {destination}"
            },
            "uturn": {
                "default": "Fair demi-tour",
                "name": "Fair demi-tour sur {way_name}",
                "destination": "Fair demi-tour en direction de {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Continuer {modifier}",
                "name": "Continuer {modifier} sur {way_name}",
                "destination": "Continuer {modifier} en direction de {destination}"
            },
            "uturn": {
                "default": "Fair demi-tour",
                "name": "Fair demi-tour sur {way_name}",
                "destination": "Fair demi-tour en direction de {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Prendre la sortie",
                "name": "Prendre la sortie sur {way_name}",
                "destination": "Prendre la sortie en direction de {destination}"
            },
            "left": {
                "default": "Prendre la sortie à gauche",
                "name": "Prendre la sortie à gauche sur {way_name}",
                "destination": "Prendre la sortie à gauche en direction de {destination}"
            },
            "right": {
                "default": "Prendre la sortie à droite",
                "name": "Prendre la sortie à droite sur {way_name}",
                "destination": "Prendre la sortie à droite en direction de {destination}"
            },
            "sharp left": {
                "default": "Prendre la sortie à gauche",
                "name": "Prendre la sortie à gauche sur {way_name}",
                "destination": "Prendre la sortie à gauche en direction de {destination}"
            },
            "sharp right": {
                "default": "Prendre la sortie à droite",
                "name": "Prendre la sortie à droite sur {way_name}",
                "destination": "Prendre la sortie à droite en direction de {destination}"
            },
            "slight left": {
                "default": "Prendre la sortie à gauche",
                "name": "Prendre la sortie à gauche sur {way_name}",
                "destination": "Prendre la sortie à gauche en direction de {destination}"
            },
            "slight right": {
                "default": "Prendre la sortie à droite",
                "name": "Prendre la sortie à droite sur {way_name}",
                "destination": "Prendre la sortie à droite en direction de {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Prendre la sortie",
                "name": "Prendre la sortie sur {way_name}",
                "destination": "Prendre la sortie en direction de {destination}"
            },
            "left": {
                "default": "Prendre la sortie à gauche",
                "name": "Prendre la sortie à gauche sur {way_name}",
                "destination": "Prendre la sortie à gauche en direction de {destination}"
            },
            "right": {
                "default": "Prendre la sortie à droite",
                "name": "Prendre la sortie à droite sur {way_name}",
                "destination": "Prendre la sortie à droite en direction de {destination}"
            },
            "sharp left": {
                "default": "Prendre la sortie à gauche",
                "name": "Prendre la sortie à gauche sur {way_name}",
                "destination": "Prendre la sortie à gauche en direction de {destination}"
            },
            "sharp right": {
                "default": "Prendre la sortie à droite",
                "name": "Prendre la sortie à droite sur {way_name}",
                "destination": "Prendre la sortie à droite en direction de {destination}"
            },
            "slight left": {
                "default": "Prendre la sortie à gauche",
                "name": "Prendre la sortie à gauche sur {way_name}",
                "destination": "Prendre la sortie à gauche en direction de {destination}"
            },
            "slight right": {
                "default": "Prendre la sortie à droite",
                "name": "Prendre la sortie à droite sur {way_name}",
                "destination": "Prendre la sortie à droite en direction de {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Entrer dans le rond-point",
                    "name": "Entrer dans le rond-point et sortir par {way_name}",
                    "destination": "Entrer dans le rond-point et sortir en direction de {destination}"
                },
                "name": {
                    "default": "Entrer dans le rond-point {rotary_name}",
                    "name": "Entrer dans le rond-point {rotary_name} et sortir par {way_name}",
                    "destination": "Entrer dans le rond-point {rotary_name} et sortir en direction de {destination}"
                },
                "exit": {
                    "default": "Entrer dans le rond-point et prendre la {exit_number} sortie",
                    "name": "Entrer dans le rond-point et prendre la {exit_number} sortie sur {way_name}",
                    "destination": "Entrer dans le rond-point et prendre la {exit_number} sortie en direction de {destination}"
                },
                "name_exit": {
                    "default": "Entrer dans le rond-point {rotary_name} et prendre la {exit_number} sortie",
                    "name": "Entrer dans le rond-point {rotary_name} et prendre la {exit_number} sortie sur {way_name}",
                    "destination": "Entrer dans le rond-point {rotary_name} et prendre la {exit_number} sortie en direction de {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "Entrer dans le rond-point et prendre la {exit_number} sortie",
                    "name": "Entrer dans le rond-point et prendre la {exit_number} sortie sur {way_name}",
                    "destination": "Entrer dans le rond-point et prendre la {exit_number} sortie en direction de {destination}"
                },
                "default": {
                    "default": "Entrer dans le rond-point",
                    "name": "Entrer dans le rond-point et sortir par {way_name}",
                    "destination": "Entrer dans le rond-point et sortir en direction de {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "Au rond-point, tourner {modifier}",
                "name": "Au rond-point, tourner {modifier} sur {way_name}",
                "destination": "Au rond-point, tourner {modifier} en direction de {destination}"
            },
            "left": {
                "default": "Au rond-point, tourner à gauche",
                "name": "Au rond-point, tourner à gauche sur {way_name}",
                "destination": "Au rond-point, tourner à gauche en direction de {destination}"
            },
            "right": {
                "default": "Au rond-point, tourner à droite",
                "name": "Au rond-point, tourner à droite sur {way_name}",
                "destination": "Au rond-point, tourner à droite en direction de {destination}"
            },
            "straight": {
                "default": "Au rond-point, continuer tout droit",
                "name": "Au rond-point, continuer tout droit sur {way_name}",
                "destination": "Au rond-point, continuer tout droit en direction de {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Tourner {modifier}",
                "name": "Tourner {modifier} sur {way_name}",
                "destination": "Tourner {modifier} en direction de {destination}"
            },
            "left": {
                "default": "Tourner à gauche",
                "name": "Tourner à gauche sur {way_name}",
                "destination": "Tourner à gauche en direction de {destination}"
            },
            "right": {
                "default": "Tourner à droite",
                "name": "Tourner à droite sur {way_name}",
                "destination": "Tourner à droite en direction de {destination}"
            },
            "straight": {
                "default": "Aller tout droit",
                "name": "Aller tout droit sur {way_name}",
                "destination": "Aller tout droit en direction de {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Continuer tout droit"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}

},{}],7:[function(require,module,exports){
module.exports={
    "meta": {
        "capitalizeFirstLetter": true
    },
    "v5": {
        "constants": {
            "ordinalize": {
                "1": "1",
                "2": "2",
                "3": "3",
                "4": "4",
                "5": "5",
                "6": "6",
                "7": "7",
                "8": "8",
                "9": "9",
                "10": "10"
            },
            "direction": {
                "north": "utara",
                "northeast": "timur laut",
                "east": "timur",
                "southeast": "tenggara",
                "south": "selatan",
                "southwest": "barat daya",
                "west": "barat",
                "northwest": "barat laut"
            },
            "modifier": {
                "left": "kiri",
                "right": "kanan",
                "sharp left": "tajam kiri",
                "sharp right": "tajam kanan",
                "slight left": "agak ke kiri",
                "slight right": "agak ke kanan",
                "straight": "lurus",
                "uturn": "putar balik"
            },
            "lanes": {
                "xo": "Tetap di kanan",
                "ox": "Tetap di kiri",
                "xox": "Tetap di tengah",
                "oxo": "Tetap di kiri atau kanan"
            }
        },
        "modes": {
            "ferry": {
                "default": "Naik ferry",
                "name": "Naik ferry di {way_name}",
                "destination": "Naik ferry menuju {destination}"
            }
        },
        "arrive": {
            "default": {
                "default": "Anda telah tiba di tujuan ke-{nth}"
            },
            "left": {
                "default": "Anda telah tiba di tujuan ke-{nth}, di sebelah kiri"
            },
            "right": {
                "default": "Anda telah tiba di tujuan ke-{nth}, di sebelah kanan"
            },
            "sharp left": {
                "default": "Anda telah tiba di tujuan ke-{nth}, di sebelah kiri"
            },
            "sharp right": {
                "default": "Anda telah tiba di tujuan ke-{nth}, di sebelah kanan"
            },
            "slight right": {
                "default": "Anda telah tiba di tujuan ke-{nth}, di sebelah kanan"
            },
            "slight left": {
                "default": "Anda telah tiba di tujuan ke-{nth}, di sebelah kiri"
            },
            "straight": {
                "default": "Anda telah tiba di tujuan ke-{nth}, lurus saja"
            }
        },
        "continue": {
            "default": {
                "default": "Terus {modifier}",
                "name": "Terus {modifier} ke {way_name}",
                "destination": "Teruskan {modifier} menuju {destination}"
            },
            "straight": {
                "default": "Lurus terus",
                "name": "Terus ke {way_name}",
                "destination": "Terus menuju {destination}"
            },
            "slight left": {
                "default": "Tetap agak di kiri",
                "name": "Tetap agak di kiri ke {way_name}",
                "destination": "Tetap agak di kiri menuju {destination}"
            },
            "slight right": {
                "default": "Tetap agak di kanan",
                "name": "Tetap agak di kanan ke {way_name}",
                "destination": "Tetap agak di kanan menuju {destination}"
            },
            "uturn": {
                "default": "Putar balik",
                "name": "Putar balik ke arah {way_name}",
                "destination": "Putar balik menuju {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Arah {direction}",
                "name": "Arah {direction} di {way_name}"
            }
        },
        "end of road": {
            "default": {
                "default": "Belok {modifier}",
                "name": "Belok {modifier} ke {way_name}",
                "destination": "Belok {modifier} menuju {destination}"
            },
            "straight": {
                "default": "Lurus terus",
                "name": "Tetap lurus ke {way_name} ",
                "destination": "Tetap lurus menuju {destination}"
            },
            "uturn": {
                "default": "Putar balik di akhir jalan",
                "name": "Putar balik di {way_name} di akhir jalan",
                "destination": "Putar balik menuju {destination} di akhir jalan"
            }
        },
        "fork": {
            "default": {
                "default": "Tetap {modifier} di pertigaan",
                "name": "Tetap {modifier} di pertigaan ke {way_name}",
                "destination": "Tetap {modifier} di pertigaan menuju {destination}"
            },
            "slight left": {
                "default": "Tetap di kiri pada pertigaan",
                "name": "Tetap di kiri pada pertigaan ke arah {way_name}",
                "destination": "Tetap di kiri pada pertigaan menuju {destination}"
            },
            "slight right": {
                "default": "Tetap di kanan pada pertigaan",
                "name": "Tetap di kanan pada pertigaan ke arah {way_name}",
                "destination": "Tetap di kanan pada pertigaan menuju {destination}"
            },
            "sharp left": {
                "default": "Belok kiri pada pertigaan",
                "name": "Belok kiri pada pertigaan ke arah {way_name}",
                "destination": "Belok kiri pada pertigaan menuju {destination}"
            },
            "sharp right": {
                "default": "Belok kanan pada pertigaan",
                "name": "Belok kanan pada pertigaan ke arah {way_name}",
                "destination": "Belok kanan pada pertigaan menuju {destination}"
            },
            "uturn": {
                "default": "Putar balik",
                "name": "Putar balik ke arah {way_name}",
                "destination": "Putar balik menuju {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Bergabung {modifier}",
                "name": "Bergabung {modifier} ke arah {way_name}",
                "destination": "Bergabung {modifier} menuju {destination}"
            },
            "slight left": {
                "default": "Bergabung di kiri",
                "name": "Bergabung di kiri ke arah {way_name}",
                "destination": "Bergabung di kiri menuju {destination}"
            },
            "slight right": {
                "default": "Bergabung di kanan",
                "name": "Bergabung di kanan ke arah {way_name}",
                "destination": "Bergabung di kanan menuju {destination}"
            },
            "sharp left": {
                "default": "Bergabung di kiri",
                "name": "Bergabung di kiri ke arah {way_name}",
                "destination": "Bergabung di kiri menuju {destination}"
            },
            "sharp right": {
                "default": "Bergabung di kanan",
                "name": "Bergabung di kanan ke arah {way_name}",
                "destination": "Bergabung di kanan menuju {destination}"
            },
            "uturn": {
                "default": "Putar balik",
                "name": "Putar balik ke arah {way_name}",
                "destination": "Putar balik menuju {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Lanjutkan {modifier}",
                "name": "Lanjutkan {modifier} menuju {way_name}",
                "destination": "Lanjutkan {modifier} menuju {destination}"
            },
            "sharp left": {
                "default": "Belok kiri tajam",
                "name": "Belok kiri tajam ke arah {way_name}",
                "destination": "Belok kiri tajam menuju {destination}"
            },
            "sharp right": {
                "default": "Belok kanan tajam",
                "name": "Belok kanan tajam ke arah {way_name}",
                "destination": "Belok kanan tajam menuju {destination}"
            },
            "slight left": {
                "default": "Lanjut dengan agak ke kiri",
                "name": "Lanjut dengan agak di kiri ke {way_name}",
                "destination": "Tetap agak di kiri menuju {destination}"
            },
            "slight right": {
                "default": "Tetap agak di kanan",
                "name": "Tetap agak di kanan ke {way_name}",
                "destination": "Tetap agak di kanan menuju {destination}"
            },
            "uturn": {
                "default": "Putar balik",
                "name": "Putar balik ke arah {way_name}",
                "destination": "Putar balik menuju {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Lanjutkan {modifier}",
                "name": "Lanjutkan {modifier} menuju {way_name}",
                "destination": "Lanjutkan {modifier} menuju {destination}"
            },
            "uturn": {
                "default": "Putar balik",
                "name": "Putar balik ke arah {way_name}",
                "destination": "Putar balik menuju {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Ambil jalan melandai",
                "name": "Ambil jalan melandai ke {way_name}",
                "destination": "Ambil jalan melandai menuju {destination}"
            },
            "left": {
                "default": "Ambil jalan yang melandai di sebelah kiri",
                "name": "Ambil jalan melandai di sebelah kiri ke arah {way_name}",
                "destination": "Ambil jalan melandai di sebelah kiri menuju {destination}"
            },
            "right": {
                "default": "Ambil jalan melandai di sebelah kanan",
                "name": "Ambil jalan melandai di sebelah kanan ke {way_name}",
                "destination": "Ambil jalan melandai di sebelah kanan menuju {destination}"
            },
            "sharp left": {
                "default": "Ambil jalan yang melandai di sebelah kiri",
                "name": "Ambil jalan melandai di sebelah kiri ke arah {way_name}",
                "destination": "Ambil jalan melandai di sebelah kiri menuju {destination}"
            },
            "sharp right": {
                "default": "Ambil jalan melandai di sebelah kanan",
                "name": "Ambil jalan melandai di sebelah kanan ke {way_name}",
                "destination": "Ambil jalan melandai di sebelah kanan menuju {destination}"
            },
            "slight left": {
                "default": "Ambil jalan yang melandai di sebelah kiri",
                "name": "Ambil jalan melandai di sebelah kiri ke arah {way_name}",
                "destination": "Ambil jalan melandai di sebelah kiri menuju {destination}"
            },
            "slight right": {
                "default": "Ambil jalan melandai di sebelah kanan",
                "name": "Ambil jalan melandai di sebelah kanan ke {way_name}",
                "destination": "Ambil jalan melandai di sebelah kanan  menuju {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Ambil jalan melandai",
                "name": "Ambil jalan melandai ke {way_name}",
                "destination": "Ambil jalan melandai menuju {destination}"
            },
            "left": {
                "default": "Ambil jalan yang melandai di sebelah kiri",
                "name": "Ambil jalan melandai di sebelah kiri ke arah {way_name}",
                "destination": "Ambil jalan melandai di sebelah kiri menuju {destination}"
            },
            "right": {
                "default": "Ambil jalan melandai di sebelah kanan",
                "name": "Ambil jalan melandai di sebelah kanan ke {way_name}",
                "destination": "Ambil jalan melandai di sebelah kanan  menuju {destination}"
            },
            "sharp left": {
                "default": "Ambil jalan yang melandai di sebelah kiri",
                "name": "Ambil jalan melandai di sebelah kiri ke arah {way_name}",
                "destination": "Ambil jalan melandai di sebelah kiri menuju {destination}"
            },
            "sharp right": {
                "default": "Ambil jalan melandai di sebelah kanan",
                "name": "Ambil jalan melandai di sebelah kanan ke {way_name}",
                "destination": "Ambil jalan melandai di sebelah kanan  menuju {destination}"
            },
            "slight left": {
                "default": "Ambil jalan yang melandai di sebelah kiri",
                "name": "Ambil jalan melandai di sebelah kiri ke arah {way_name}",
                "destination": "Ambil jalan melandai di sebelah kiri menuju {destination}"
            },
            "slight right": {
                "default": "Ambil jalan melandai di sebelah kanan",
                "name": "Ambil jalan melandai di sebelah kanan ke {way_name}",
                "destination": "Ambil jalan melandai di sebelah kanan  menuju {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Masuk bundaran",
                    "name": "Masuk bundaran dan keluar arah {way_name}",
                    "destination": "Masuk bundaran dan keluar menuju {destination}"
                },
                "name": {
                    "default": "Masuk {rotary_name}",
                    "name": "Masuk {rotary_name} dan keluar arah {way_name}",
                    "destination": "Masuk {rotary_name} dan keluar menuju {destination}"
                },
                "exit": {
                    "default": "Masuk bundaran dan ambil jalan keluar {exit_number}",
                    "name": "Masuk bundaran dan ambil jalan keluar {exit_number} arah {way_name}",
                    "destination": "Masuk bundaran dan ambil jalan keluar {exit_number} menuju {destination}"
                },
                "name_exit": {
                    "default": "Masuk {rotary_name} dan ambil jalan keluar {exit_number}",
                    "name": "Masuk {rotary_name} dan ambil jalan keluar {exit_number} arah {way_name}",
                    "destination": "Masuk {rotary_name} dan ambil jalan keluar {exit_number} menuju {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "Masuk bundaran dan ambil jalan keluar {exit_number}",
                    "name": "Masuk bundaran dan ambil jalan keluar {exit_number} arah {way_name}",
                    "destination": "Masuk bundaran dan ambil jalan keluar {exit_number} menuju {destination}"
                },
                "default": {
                    "default": "Masuk bundaran",
                    "name": "Masuk bundaran dan keluar arah {way_name}",
                    "destination": "Masuk bundaran dan keluar menuju {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "Di bundaran, lakukan {modifier}",
                "name": "Di bundaran, lakukan {modifier} ke arah {way_name}",
                "destination": "Di bundaran, lakukan {modifier} menuju {destination}"
            },
            "left": {
                "default": "Di bundaran belok kiri",
                "name": "Di bundaran, belok kiri arah {way_name}",
                "destination": "Di bundaran, belok kiri menuju {destination}"
            },
            "right": {
                "default": "Di bundaran belok kanan",
                "name": "Di bundaran belok kanan ke arah {way_name}",
                "destination": "Di bundaran belok kanan menuju {destination}"
            },
            "straight": {
                "default": "Di bundaran tetap lurus",
                "name": "Di bundaran tetap lurus ke arah {way_name}",
                "destination": "Di bundaran tetap lurus menuju {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Lakukan {modifier}",
                "name": "Lakukan {modifier} ke arah {way_name}",
                "destination": "Lakukan {modifier} menuju {destination}"
            },
            "left": {
                "default": "Belok kiri",
                "name": "Belok kiri ke {way_name}",
                "destination": "Belok kiri menuju {destination}"
            },
            "right": {
                "default": "Belok kanan",
                "name": "Belok kanan ke {way_name}",
                "destination": "Belok kanan menuju {destination}"
            },
            "straight": {
                "default": "Lurus",
                "name": "Lurus arah {way_name}",
                "destination": "Lurus menuju {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Lurus terus"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}

},{}],8:[function(require,module,exports){
module.exports={
    "meta": {
        "capitalizeFirstLetter": true
    },
    "v5": {
        "constants": {
            "ordinalize": {
                "1": "1ª",
                "2": "2ª",
                "3": "3ª",
                "4": "4ª",
                "5": "5ª",
                "6": "6ª",
                "7": "7ª",
                "8": "8ª",
                "9": "9ª",
                "10": "10ª"
            },
            "direction": {
                "north": "nord",
                "northeast": "nord-est",
                "east": "est",
                "southeast": "sud-est",
                "south": "sud",
                "southwest": "sud-ovest",
                "west": "ovest",
                "northwest": "nord-ovest"
            },
            "modifier": {
                "left": "sinistra",
                "right": "destra",
                "sharp left": "sinistra",
                "sharp right": "destra",
                "slight left": "sinistra leggermente",
                "slight right": "destra leggermente",
                "straight": "dritto",
                "uturn": "inversione a U"
            },
            "lanes": {
                "xo": "Mantieni la destra",
                "ox": "Mantieni la sinistra",
                "xox": "Rimani in mezzo",
                "oxo": "Mantieni la destra o la sinistra"
            }
        },
        "modes": {
            "ferry": {
                "default": "Prendi il traghetto",
                "name": "Prendi il traghetto {way_name}",
                "destination": "Prendi il traghetto verso {destination}"
            }
        },
        "arrive": {
            "default": {
                "default": "Sei arrivato alla tua {nth} destinazione"
            },
            "left": {
                "default": "sei arrivato alla tua {nth} destinazione, sulla sinistra"
            },
            "right": {
                "default": "sei arrivato alla tua {nth} destinazione, sulla destra"
            },
            "sharp left": {
                "default": "sei arrivato alla tua {nth} destinazione, sulla sinistra"
            },
            "sharp right": {
                "default": "sei arrivato alla tua {nth} destinazione, sulla destra"
            },
            "slight right": {
                "default": "sei arrivato alla tua {nth} destinazione, sulla destra"
            },
            "slight left": {
                "default": "sei arrivato alla tua {nth} destinazione, sulla sinistra"
            },
            "straight": {
                "default": "sei arrivato alla tua {nth} destinazione, si trova davanti a te"
            }
        },
        "continue": {
            "default": {
                "default": "Continua a {modifier}",
                "name": "Continua a {modifier} in {way_name}",
                "destination": "Continua a {modifier} verso {destination}"
            },
            "straight": {
                "default": "Continua dritto",
                "name": "Continua in {way_name}",
                "destination": "Continua verso {destination}"
            },
            "slight left": {
                "default": "Continua leggermente a sinistra",
                "name": "Continua leggermente a sinistra in {way_name}",
                "destination": "Continua leggermente a sinistra verso {destination}"
            },
            "slight right": {
                "default": "Continua leggermente a destra",
                "name": "Continua leggermente a destra in {way_name} ",
                "destination": "Continua leggermente a destra verso {destination}"
            },
            "uturn": {
                "default": "Fai un'inversione a U",
                "name": "Fai un'inversione a U in {way_name}",
                "destination": "Fai un'inversione a U verso {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Continua verso {direction}",
                "name": "Continua verso {direction} in {way_name}"
            }
        },
        "end of road": {
            "default": {
                "default": "Gira a {modifier}",
                "name": "Gira a {modifier} in {way_name}",
                "destination": "Gira a {modifier} verso {destination}"
            },
            "straight": {
                "default": "Continua dritto",
                "name": "Continua dritto in {way_name}",
                "destination": "Continua dritto verso {destination}"
            },
            "uturn": {
                "default": "Fai un'inversione a U alla fine della strada",
                "name": "Fai un'inversione a U in {way_name} alla fine della strada",
                "destination": "Fai un'inversione a U verso {destination} alla fine della strada"
            }
        },
        "fork": {
            "default": {
                "default": "Mantieni la {modifier} al bivio",
                "name": "Mantieni la {modifier} al bivio in {way_name}",
                "destination": "Mantieni la {modifier} al bivio verso {destination}"
            },
            "slight left": {
                "default": "Mantieni la sinistra al bivio",
                "name": "Mantieni la sinistra al bivio in {way_name}",
                "destination": "Mantieni la sinistra al bivio verso {destination}"
            },
            "slight right": {
                "default": "Mantieni la destra al bivio",
                "name": "Mantieni la destra al bivio in {way_name}",
                "destination": "Mantieni la destra al bivio verso {destination}"
            },
            "sharp left": {
                "default": "Svolta a sinistra al bivio",
                "name": "Svolta a sinistra al bivio in {way_name}",
                "destination": "Svolta a sinistra al bivio verso {destination}"
            },
            "sharp right": {
                "default": "Svolta a destra al bivio",
                "name": "Svolta a destra al bivio in {way_name}",
                "destination": "Svolta a destra al bivio verso {destination}"
            },
            "uturn": {
                "default": "Fai un'inversione a U",
                "name": "Fai un'inversione a U in {way_name}",
                "destination": "Fai un'inversione a U verso {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Immettiti a {modifier}",
                "name": "Immettiti {modifier} in {way_name}",
                "destination": "Immettiti {modifier} verso {destination}"
            },
            "slight left": {
                "default": "Immettiti a sinistra",
                "name": "Immetiti a sinistra in {way_name}",
                "destination": "Immettiti a sinistra verso {destination}"
            },
            "slight right": {
                "default": "Immettiti a destra",
                "name": "Immettiti a destra in {way_name}",
                "destination": "Immettiti a destra verso {destination}"
            },
            "sharp left": {
                "default": "Immettiti a sinistra",
                "name": "Immetiti a sinistra in {way_name}",
                "destination": "Immettiti a sinistra verso {destination}"
            },
            "sharp right": {
                "default": "Immettiti a destra",
                "name": "Immettiti a destra in {way_name}",
                "destination": "Immettiti a destra verso {destination}"
            },
            "uturn": {
                "default": "Fai un'inversione a U",
                "name": "Fai un'inversione a U in {way_name}",
                "destination": "Fai un'inversione a U verso {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Continua a {modifier}",
                "name": "Continua a {modifier} in {way_name}",
                "destination": "Continua a {modifier} verso {destination}"
            },
            "straight": {
                "default": "Continua dritto",
                "name": "Continua in {way_name}",
                "destination": "Continua verso {destination}"
            },
            "sharp left": {
                "default": "Svolta a sinistra",
                "name": "Svolta a sinistra in {way_name}",
                "destination": "Svolta a sinistra verso {destination}"
            },
            "sharp right": {
                "default": "Svolta a destra",
                "name": "Svolta a destra in {way_name}",
                "destination": "Svolta a destra verso {destination}"
            },
            "slight left": {
                "default": "Continua leggermente a sinistra",
                "name": "Continua leggermente a sinistra in {way_name}",
                "destination": "Continua leggermente a sinistra verso {destination}"
            },
            "slight right": {
                "default": "Continua leggermente a destra",
                "name": "Continua leggermente a destra in {way_name} ",
                "destination": "Continua leggermente a destra verso {destination}"
            },
            "uturn": {
                "default": "Fai un'inversione a U",
                "name": "Fai un'inversione a U in {way_name}",
                "destination": "Fai un'inversione a U verso {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Continua a {modifier}",
                "name": "Continua a {modifier} in {way_name}",
                "destination": "Continua a {modifier} verso {destination}"
            },
            "uturn": {
                "default": "Fai un'inversione a U",
                "name": "Fai un'inversione a U in {way_name}",
                "destination": "Fai un'inversione a U verso {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Prendi la rampa",
                "name": "Prendi la rampa in {way_name}",
                "destination": "Prendi la rampa verso {destination}",
                "exit": "Prendi l'uscita {exit}",
                "exit_destination": "Prendi l'uscita  {exit} verso {destination}"
            },
            "left": {
                "default": "Prendi la rampa a sinistra",
                "name": "Prendi la rampa a sinistra in {way_name}",
                "destination": "Prendi la rampa a sinistra verso {destination}",
                "exit": "Prendi l'uscita {exit} a sinistra",
                "exit_destination": "Prendi la {exit}  uscita a sinistra verso {destination}"
            },
            "right": {
                "default": "Prendi la rampa a destra",
                "name": "Prendi la rampa a destra in {way_name}",
                "destination": "Prendi la rampa a destra verso {destination}",
                "exit": "Prendi la {exit} uscita a destra",
                "exit_destination": "Prendi la {exit} uscita a destra verso {destination}"
            },
            "sharp left": {
                "default": "Prendi la rampa a sinistra",
                "name": "Prendi la rampa a sinistra in {way_name}",
                "destination": "Prendi la rampa a sinistra verso {destination}",
                "exit": "Prendi l'uscita {exit} a sinistra",
                "exit_destination": "Prendi la {exit}  uscita a sinistra verso {destination}"
            },
            "sharp right": {
                "default": "Prendi la rampa a destra",
                "name": "Prendi la rampa a destra in {way_name}",
                "destination": "Prendi la rampa a destra verso {destination}",
                "exit": "Prendi la {exit} uscita a destra",
                "exit_destination": "Prendi la {exit} uscita a destra verso {destination}"
            },
            "slight left": {
                "default": "Prendi la rampa a sinistra",
                "name": "Prendi la rampa a sinistra in {way_name}",
                "destination": "Prendi la rampa a sinistra verso {destination}",
                "exit": "Prendi l'uscita {exit} a sinistra",
                "exit_destination": "Prendi la {exit}  uscita a sinistra verso {destination}"
            },
            "slight right": {
                "default": "Prendi la rampa a destra",
                "name": "Prendi la rampa a destra in {way_name}",
                "destination": "Prendi la rampa a destra verso {destination}",
                "exit": "Prendi la {exit} uscita a destra",
                "exit_destination": "Prendi la {exit} uscita a destra verso {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Prendi la rampa",
                "name": "Prendi la rampa in {way_name}",
                "destination": "Prendi la rampa verso {destination}"
            },
            "left": {
                "default": "Prendi la rampa a sinistra",
                "name": "Prendi la rampa a sinistra in {way_name}",
                "destination": "Prendi la rampa a sinistra verso {destination}"
            },
            "right": {
                "default": "Prendi la rampa a destra",
                "name": "Prendi la rampa a destra in {way_name}",
                "destination": "Prendi la rampa a destra verso {destination}"
            },
            "sharp left": {
                "default": "Prendi la rampa a sinistra",
                "name": "Prendi la rampa a sinistra in {way_name}",
                "destination": "Prendi la rampa a sinistra verso {destination}"
            },
            "sharp right": {
                "default": "Prendi la rampa a destra",
                "name": "Prendi la rampa a destra in {way_name}",
                "destination": "Prendi la rampa a destra verso {destination}"
            },
            "slight left": {
                "default": "Prendi la rampa a sinistra",
                "name": "Prendi la rampa a sinistra in {way_name}",
                "destination": "Prendi la rampa a sinistra verso {destination}"
            },
            "slight right": {
                "default": "Prendi la rampa a destra",
                "name": "Prendi la rampa a destra in {way_name}",
                "destination": "Prendi la rampa a destra verso {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Immettiti nella rotonda",
                    "name": "Immettiti nella ritonda ed esci in {way_name}",
                    "destination": "Immettiti nella ritonda ed esci verso {destination}"
                },
                "name": {
                    "default": "Immettiti in {rotary_name}",
                    "name": "Immettiti in {rotary_name} ed esci su {way_name}",
                    "destination": "Immettiti in {rotary_name} ed esci verso {destination}"
                },
                "exit": {
                    "default": "Immettiti nella rotonda e prendi la {exit_number} uscita",
                    "name": "Immettiti nella rotonda e prendi la {exit_number} uscita in {way_name}",
                    "destination": "Immettiti nella rotonda e prendi la {exit_number} uscita verso   {destination}"
                },
                "name_exit": {
                    "default": "Immettiti in {rotary_name} e prendi la {exit_number} uscita",
                    "name": "Immettiti in {rotary_name} e prendi la {exit_number} uscita in {way_name}",
                    "destination": "Immettiti in {rotary_name} e prendi la {exit_number}  uscita verso {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "Immettiti nella rotonda e prendi la {exit_number} uscita",
                    "name": "Immettiti nella rotonda e prendi la {exit_number} uscita in {way_name}",
                    "destination": "Immettiti nella rotonda e prendi la {exit_number} uscita verso {destination}"
                },
                "default": {
                    "default": "Entra nella rotonda",
                    "name": "Entra nella rotonda e prendi l'uscita in {way_name}",
                    "destination": "Entra nella rotonda e prendi l'uscita verso {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "Alla rotonda fai una {modifier}",
                "name": "Alla rotonda fai una {modifier} in {way_name}",
                "destination": "Alla rotonda fai una {modifier} verso {destination}"
            },
            "left": {
                "default": "Alla rotonda svolta a sinistra",
                "name": "Alla rotonda svolta a sinistra in {way_name}",
                "destination": "Alla rotonda svolta a sinistra verso {destination}"
            },
            "right": {
                "default": "Alla rotonda svolta a destra",
                "name": "Alla rotonda svolta a destra in {way_name}",
                "destination": "Alla rotonda svolta a destra verso {destination}"
            },
            "straight": {
                "default": "Alla rotonda prosegui dritto",
                "name": "Alla rotonda prosegui dritto in {way_name}",
                "destination": "Alla rotonda prosegui dritto verso {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Fai una {modifier}",
                "name": "Fai una {modifier} in {way_name}",
                "destination": "Fai una {modifier} verso {destination}"
            },
            "left": {
                "default": "Svolta a sinistra",
                "name": "Svolta a sinistra in {way_name}",
                "destination": "Svolta a sinistra verso {destination}"
            },
            "right": {
                "default": "Gira a destra",
                "name": "Svolta a destra in {way_name}",
                "destination": "Svolta a destra verso {destination}"
            },
            "straight": {
                "default": "Prosegui dritto",
                "name": "Continua su {way_name}",
                "destination": "Continua verso {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Continua dritto"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}
},{}],9:[function(require,module,exports){
module.exports={
    "meta": {
        "capitalizeFirstLetter": true
    },
    "v5": {
        "constants": {
            "ordinalize": {
                "1": "1e",
                "2": "2e",
                "3": "3e",
                "4": "4e",
                "5": "5e",
                "6": "6e",
                "7": "7e",
                "8": "8e",
                "9": "9e",
                "10": "10e"
            },
            "direction": {
                "north": "noord",
                "northeast": "noordoost",
                "east": "oost",
                "southeast": "zuidoost",
                "south": "zuid",
                "southwest": "zuidwest",
                "west": "west",
                "northwest": "noordwest"
            },
            "modifier": {
                "left": "links",
                "right": "rechts",
                "sharp left": "linksaf",
                "sharp right": "rechtsaf",
                "slight left": "links",
                "slight right": "rechts",
                "straight": "rechtdoor",
                "uturn": "omkeren"
            },
            "lanes": {
                "xo": "Rechts aanhouden",
                "ox": "Links aanhouden",
                "xox": "In het midden blijven",
                "oxo": "Links of rechts blijven"
            }
        },
        "modes": {
            "ferry": {
                "default": "Neem het veer",
                "name": "Neem het veer {way_name}",
                "destination": "Neem het veer naar {destination}"
            }
        },
        "arrive": {
            "default": {
                "default": "Je bent gearriveerd op de {nth} bestemming."
            },
            "left": {
                "default": "Je bent gearriveerd. De {nth} bestemming bevindt zich links."
            },
            "right": {
                "default": "Je bent gearriveerd. De {nth} bestemming bevindt zich rechts."
            },
            "sharp left": {
                "default": "Je bent gearriveerd. De {nth} bestemming bevindt zich links."
            },
            "sharp right": {
                "default": "Je bent gearriveerd. De {nth} bestemming bevindt zich rechts."
            },
            "slight right": {
                "default": "Je bent gearriveerd. De {nth} bestemming bevindt zich rechts."
            },
            "slight left": {
                "default": "Je bent gearriveerd. De {nth} bestemming bevindt zich links."
            },
            "straight": {
                "default": "Je bent gearriveerd. De {nth} bestemming bevindt zich voor je."
            }
        },
        "continue": {
            "default": {
                "default": "Ga {modifier}",
                "name": "Ga {modifier} naar {way_name}",
                "destination": "Ga {modifier} richting {destination}"
            },
            "straight": {
                "default": "Ga rechtdoor",
                "name": "Ga rechtdoor naar {way_name}",
                "destination": "Ga rechtdoor richting {destination}"
            },
            "slight left": {
                "default": "Links aanhouden",
                "name": "Links aanhouden naar {way_name}",
                "destination": "Links aanhouden richting {destination}"
            },
            "slight right": {
                "default": "Rechts aanhouden",
                "name": "Rechts aanhouden naar {way_name}",
                "destination": "Rechts aanhouden richting {destination}"
            },
            "uturn": {
                "default": "Keer om",
                "name": "Keer om naar {way_name}",
                "destination": "Keer om richting {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Vertrek in {direction}elijke richting",
                "name": "Neem {way_name} in {direction}elijke richting"
            }
        },
        "end of road": {
            "default": {
                "default": "Ga {modifier}",
                "name": "Ga {modifier} naar {way_name}",
                "destination": "Ga {modifier} richting {destination}"
            },
            "straight": {
                "default": "Ga in de aangegeven richting",
                "name": "Ga naar {way_name}",
                "destination": "Ga richting {destination}"
            },
            "uturn": {
                "default": "Keer om",
                "name": "Keer om naar {way_name}",
                "destination": "Keer om richting {destination}"
            }
        },
        "fork": {
            "default": {
                "default": "Ga {modifier} op de splitsing",
                "name": "Ga {modifier} op de splitsing naar {way_name}",
                "destination": "Ga {modifier} op de splitsing richting {destination}"
            },
            "slight left": {
                "default": "Links aanhouden op de splitsing",
                "name": "Links aanhouden op de splitsing naar {way_name}",
                "destination": "Links aanhouden op de splitsing richting {destination}"
            },
            "slight right": {
                "default": "Rechts aanhouden op de splitsing",
                "name": "Rechts aanhouden op de splitsing naar {way_name}",
                "destination": "Rechts aanhouden op de splitsing richting {destination}"
            },
            "sharp left": {
                "default": "Linksaf op de splitsing",
                "name": "Linksaf op de splitsing naar {way_name}",
                "destination": "Linksaf op de splitsing richting {destination}"
            },
            "sharp right": {
                "default": "Rechtsaf op de splitsing",
                "name": "Rechtsaf op de splitsing naar {way_name}",
                "destination": "Rechtsaf op de splitsing richting {destination}"
            },
            "uturn": {
                "default": "Keer om",
                "name": "Keer om naar {way_name}",
                "destination": "Keer om richting {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Bij de splitsing {modifier}",
                "name": "Bij de splitsing {modifier} naar {way_name}",
                "destination": "Bij de splitsing {modifier} richting {destination}"
            },
            "slight left": {
                "default": "Bij de splitsing links aanhouden",
                "name": "Bij de splitsing links aanhouden naar {way_name}",
                "destination": "Bij de splitsing links aanhouden richting {destination}"
            },
            "slight right": {
                "default": "Bij de splitsing rechts aanhouden",
                "name": "Bij de splitsing rechts aanhouden naar {way_name}",
                "destination": "Bij de splitsing rechts aanhouden richting {destination}"
            },
            "sharp left": {
                "default": "Bij de splitsing linksaf",
                "name": "Bij de splitsing linksaf naar {way_name}",
                "destination": "Bij de splitsing linksaf richting {destination}"
            },
            "sharp right": {
                "default": "Bij de splitsing rechtsaf",
                "name": "Bij de splitsing rechtsaf naar {way_name}",
                "destination": "Bij de splitsing rechtsaf richting {destination}"
            },
            "uturn": {
                "default": "Keer om",
                "name": "Keer om naar {way_name}",
                "destination": "Keer om richting {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Ga {modifier}",
                "name": "Ga {modifier} naar {way_name}",
                "destination": "Ga {modifier} richting {destination}"
            },
            "sharp left": {
                "default": "Linksaf",
                "name": "Linksaf naar {way_name}",
                "destination": "Linksaf richting {destination}"
            },
            "sharp right": {
                "default": "Rechtsaf",
                "name": "Rechtsaf naar {way_name}",
                "destination": "Rechtsaf richting {destination}"
            },
            "slight left": {
                "default": "Links aanhouden",
                "name": "Links aanhouden naar {way_name}",
                "destination": "Links aanhouden richting {destination}"
            },
            "slight right": {
                "default": "Rechts aanhouden",
                "name": "Rechts aanhouden naar {way_name}",
                "destination": "Rechts aanhouden richting {destination}"
            },
            "uturn": {
                "default": "Keer om",
                "name": "Keer om naar {way_name}",
                "destination": "Keer om richting {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Ga {modifier}",
                "name": "Ga {modifier} naar {way_name}",
                "destination": "Ga {modifier} richting {destination}"
            },
            "uturn": {
                "default": "Keer om",
                "name": "Keer om naar {way_name}",
                "destination": "Keer om richting {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Neem de afrit",
                "name": "Neem de afrit naar {way_name}",
                "destination": "Neem de afrit richting {destination}"
            },
            "left": {
                "default": "Neem de afrit links",
                "name": "Neem de afrit links naar {way_name}",
                "destination": "Neem de afrit links richting {destination}"
            },
            "right": {
                "default": "Neem de afrit rechts",
                "name": "Neem de afrit rechts naar {way_name}",
                "destination": "Neem de afrit rechts richting {destination}"
            },
            "sharp left": {
                "default": "Neem de afrit links",
                "name": "Neem de afrit links naar {way_name}",
                "destination": "Neem de afrit links richting {destination}"
            },
            "sharp right": {
                "default": "Neem de afrit rechts",
                "name": "Neem de afrit rechts naar {way_name}",
                "destination": "Neem de afrit rechts richting {destination}"
            },
            "slight left": {
                "default": "Neem de afrit links",
                "name": "Neem de afrit links naar {way_name}",
                "destination": "Neem de afrit links richting {destination}"
            },
            "slight right": {
                "default": "Neem de afrit rechts",
                "name": "Neem de afrit rechts naar {way_name}",
                "destination": "Neem de afrit rechts richting {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Neem de oprit",
                "name": "Neem de oprit naar {way_name}",
                "destination": "Neem de oprit richting {destination}"
            },
            "left": {
                "default": "Neem de oprit links",
                "name": "Neem de oprit links naar {way_name}",
                "destination": "Neem de oprit links richting {destination}"
            },
            "right": {
                "default": "Neem de oprit rechts",
                "name": "Neem de oprit rechts naar {way_name}",
                "destination": "Neem de oprit rechts richting {destination}"
            },
            "sharp left": {
                "default": "Neem de oprit links",
                "name": "Neem de oprit links naar {way_name}",
                "destination": "Neem de oprit links richting {destination}"
            },
            "sharp right": {
                "default": "Neem de oprit rechts",
                "name": "Neem de oprit rechts naar {way_name}",
                "destination": "Neem de oprit rechts richting {destination}"
            },
            "slight left": {
                "default": "Neem de oprit links",
                "name": "Neem de oprit links naar {way_name}",
                "destination": "Neem de oprit links richting {destination}"
            },
            "slight right": {
                "default": "Neem de oprit rechts",
                "name": "Neem de oprit rechts naar {way_name}",
                "destination": "Neem de oprit rechts richting {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Ga het knooppunt op",
                    "name": "Verlaat het knooppunt naar {way_name}",
                    "destination": "Verlaat het knooppunt richting {destination}"
                },
                "name": {
                    "default": "Ga het knooppunt {rotary_name} op",
                    "name": "Verlaat het knooppunt {rotary_name} naar {way_name}",
                    "destination": "Verlaat het knooppunt {rotary_name} richting {destination}"
                },
                "exit": {
                    "default": "Ga het knooppunt op en neem afslag {exit_number}",
                    "name": "Ga het knooppunt op en neem afslag {exit_number} naar {way_name}",
                    "destination": "Ga het knooppunt op en neem afslag {exit_number} richting {destination}"
                },
                "name_exit": {
                    "default": "Ga het knooppunt {rotary_name} op en neem afslag {exit_number}",
                    "name": "Ga het knooppunt {rotary_name} op en neem afslag {exit_number} naar {way_name}",
                    "destination": "Ga het knooppunt {rotary_name} op en neem afslag {exit_number} richting {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "Ga de rotonde op en neem afslag {exit_number}",
                    "name": "Ga de rotonde op en neem afslag {exit_number} naar {way_name}",
                    "destination": "Ga de rotonde op en neem afslag {exit_number} richting {destination}"
                },
                "default": {
                    "default": "Ga de rotonde op",
                    "name": "Verlaat de rotonde naar {way_name}",
                    "destination": "Verlaat de rotonde richting {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "Ga {modifier} op de rotonde",
                "name": "Ga {modifier} op de rotonde naar {way_name}",
                "destination": "Ga {modifier} op de rotonde richting {destination}"
            },
            "left": {
                "default": "Ga links op de rotonde",
                "name": "Ga links op de rotonde naar {way_name}",
                "destination": "Ga links op de rotonde richting {destination}"
            },
            "right": {
                "default": "Ga rechts op de rotonde",
                "name": "Ga rechts op de rotonde naar {way_name}",
                "destination": "Ga rechts op de rotonde richting {destination}"
            },
            "straight": {
                "default": "Rechtdoor op de rotonde",
                "name": "Rechtdoor op de rotonde naar {way_name}",
                "destination": "Rechtdoor op de rotonde richting {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Ga {modifier}",
                "name": "Ga {modifier} naar {way_name}",
                "destination": "Ga {modifier} richting {destination}"
            },
            "left": {
                "default": "Ga linksaf",
                "name": "Ga linksaf naar {way_name}",
                "destination": "Ga linksaf richting {destination}"
            },
            "right": {
                "default": "Ga rechtsaf",
                "name": "Ga rechtsaf naar {way_name}",
                "destination": "Ga rechtsaf richting {destination}"
            },
            "straight": {
                "default": "Ga rechtdoor",
                "name": "Ga rechtdoor naar {way_name}",
                "destination": "Ga rechtdoor richting {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Rechtdoor"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}

},{}],10:[function(require,module,exports){
module.exports={
    "meta": {
        "capitalizeFirstLetter": true
    },
    "v5": {
        "constants": {
            "ordinalize": {
                "1": "1.",
                "2": "2.",
                "3": "3.",
                "4": "4.",
                "5": "5.",
                "6": "6.",
                "7": "7.",
                "8": "8.",
                "9": "9.",
                "10": "10."
            },
            "direction": {
                "north": "północ",
                "northeast": "północny wschód",
                "east": "wschód",
                "southeast": "południowy wschód",
                "south": "południe",
                "southwest": "południowy zachód",
                "west": "zachód",
                "northwest": "północny zachód"
            },
            "modifier": {
                "left": "lewo",
                "right": "prawo",
                "sharp left": "ostro w lewo",
                "sharp right": "ostro w prawo",
                "slight left": "łagodnie w lewo",
                "slight right": "łagodnie w prawo",
                "straight": "prosto",
                "uturn": "zawróć"
            },
            "lanes": {
                "xo": "Trzymaj się prawej strony",
                "ox": "Trzymaj się lewej strony",
                "xox": "Trzymaj się środka",
                "oxo": "Trzymaj się lewej lub prawej strony"
            }
        },
        "modes": {
            "ferry": {
                "default": "Weź prom",
                "name": "Weź prom {way_name}",
                "destination": "Weź prom w kierunku {destination}"
            }
        },
        "arrive": {
            "default": {
                "default": "Dojechano do miejsca docelowego {nth}"
            },
            "left": {
                "default": "Dojechano do miejsca docelowego {nth}, po lewej stronie"
            },
            "right": {
                "default": "Dojechano do miejsca docelowego {nth}, po prawej stronie"
            },
            "sharp left": {
                "default": "Dojechano do miejsca docelowego {nth}, po lewej stronie"
            },
            "sharp right": {
                "default": "Dojechano do miejsca docelowego {nth}, po prawej stronie"
            },
            "slight right": {
                "default": "Dojechano do miejsca docelowego {nth}, po prawej stronie"
            },
            "slight left": {
                "default": "Dojechano do miejsca docelowego {nth}, po lewej stronie"
            },
            "straight": {
                "default": "Dojechano do miejsca docelowego {nth} , prosto"
            }
        },
        "continue": {
            "default": {
                "default": "Kontynuuj {modifier}",
                "name": "Kontynuuj {modifier} na {way_name}",
                "destination": "Kontynuuj {modifier} w kierunku {destination}"
            },
            "straight": {
                "default": "Kontynuuj prosto",
                "name": "Kontynuuj na {way_name}",
                "destination": "Kontynuuj w kierunku {destination}"
            },
            "slight left": {
                "default": "Kontynuuj łagodnie w lewo",
                "name": "Kontynuuj łagodnie w lewo na {way_name}",
                "destination": "Kontynuuj łagodnie w lewo w kierunku {destination}"
            },
            "slight right": {
                "default": "Kontynuuj łagodnie w prawo",
                "name": "Kontynuuj łagodnie w prawo na {way_name}",
                "destination": "Kontynuuj łagodnie w prawo w kierunku {destination}"
            },
            "uturn": {
                "default": "Zawróć",
                "name": "Zawróć na {way_name}",
                "destination": "Zawróć w kierunku {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Kieruj się {direction}",
                "name": "Kieruj się {direction} na {way_name}"
            }
        },
        "end of road": {
            "default": {
                "default": "Skręć {modifier}",
                "name": "Skręć {modifier} na {way_name}",
                "destination": "Skręć {modifier} w kierunku {destination}"
            },
            "straight": {
                "default": "Kontynuuj prosto",
                "name": "Kontynuuj prosto na {way_name}",
                "destination": "Kontynuuj prosto w kierunku {destination}"
            },
            "uturn": {
                "default": "Zawróć na końcu ulicy",
                "name": "Zawróć na końcu ulicy na {way_name}",
                "destination": "Zawróć na końcu ulicy w kierunku {destination}"
            }
        },
        "fork": {
            "default": {
                "default": "Na rozwidleniu trzymaj się {modifier}",
                "name": "Na rozwidleniu trzymaj się {modifier} na {way_name}",
                "destination": "Na rozwidleniu trzymaj się {modifier} w kierunku {destination}"
            },
            "slight left": {
                "default": "Na rozwidleniu trzymaj się lewej strony",
                "name": "Na rozwidleniu trzymaj się lewej strony w {way_name}",
                "destination": "Na rozwidleniu trzymaj się lewej strony w kierunku {destination}"
            },
            "slight right": {
                "default": "Na rozwidleniu trzymaj się prawej strony",
                "name": "Na rozwidleniu trzymaj się prawej strony na {way_name}",
                "destination": "Na rozwidleniu trzymaj się prawej strony w kierunku {destination}"
            },
            "sharp left": {
                "default": "Na rozwidleniu skręć ostro w lewo",
                "name": "Na rozwidleniu skręć ostro w lew na {way_name}",
                "destination": "Na rozwidleniu skręć ostro w lewo w kierunku {destination}"
            },
            "sharp right": {
                "default": "Na rozwidleniu skręć ostro w prawo",
                "name": "Na rozwidleniu skręć ostro w prawo na {way_name}",
                "destination": "Na rozwidleniu skręć ostro w prawo w kierunku {destination}"
            },
            "uturn": {
                "default": "Zawróć",
                "name": "Zawróć na {way_name}",
                "destination": "Zawróć w kierunku {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Włącz się {modifier}",
                "name": "Włącz się {modifier} na {way_name}",
                "destination": "Włącz się {modifier} w kierunku {destination}"
            },
            "slight left": {
                "default": "Włącz się z lewej strony",
                "name": "Włącz się z lewej strony na {way_name}",
                "destination": "Włącz się z lewej strony w kierunku {destination}"
            },
            "slight right": {
                "default": "Włącz się z prawej strony",
                "name": "Włącz się z prawej strony na {way_name}",
                "destination": "Włącz się z prawej strony w kierunku {destination}"
            },
            "sharp left": {
                "default": "Włącz się z lewej strony",
                "name": "Włącz się z lewej strony na {way_name}",
                "destination": "Włącz się z lewej strony w kierunku {destination}"
            },
            "sharp right": {
                "default": "Włącz się z prawej strony",
                "name": "Włącz się z prawej strony na {way_name}",
                "destination": "Włącz się z prawej strony w kierunku {destination}"
            },
            "uturn": {
                "default": "Zawróć",
                "name": "Zawróć na {way_name}",
                "destination": "Zawróć w kierunku {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Kontynuuj {modifier}",
                "name": "Kontynuuj {modifier} na {way_name}",
                "destination": "Kontynuuj {modifier} w kierunku {destination}"
            },
            "sharp left": {
                "default": "Skręć ostro w lewo",
                "name": "Skręć ostro w lewo w {way_name}",
                "destination": "Skręć ostro w lewo w kierunku {destination}"
            },
            "sharp right": {
                "default": "Skręć ostro w prawo",
                "name": "Skręć ostro w prawo na {way_name}",
                "destination": "Skręć ostro w prawo w kierunku {destination}"
            },
            "slight left": {
                "default": "Kontynuuj łagodnie w lewo",
                "name": "Kontynuuj łagodnie w lewo na {way_name}",
                "destination": "Kontynuuj łagodnie w lewo w kierunku {destination}"
            },
            "slight right": {
                "default": "Kontynuuj łagodnie w prawo",
                "name": "Kontynuuj łagodnie w prawo na {way_name}",
                "destination": "Kontynuuj łagodnie w prawo w kierunku {destination}"
            },
            "uturn": {
                "default": "Zawróć",
                "name": "Zawróć na {way_name}",
                "destination": "Zawróć w kierunku {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Kontynuuj {modifier}",
                "name": "Kontynuuj {modifier} na {way_name}",
                "destination": "Kontynuuj {modifier} w kierunku {destination}"
            },
            "uturn": {
                "default": "Zawróć",
                "name": "Zawróć na {way_name}",
                "destination": "Zawróć w kierunku {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Zjedź",
                "name": "Weź zjazd na {way_name}",
                "destination": "Weź zjazd w kierunku {destination}",
                "exit": "Take exit {exit}",
                "exit_destination": "Take exit {exit} towards {destination}"
            },
            "left": {
                "default": "Weź zjazd po lewej",
                "name": "Weź zjazd po lewej na {way_name}",
                "destination": "Weź zjazd po lewej w kierunku {destination}",
                "exit": "Take exit {exit} on the left",
                "exit_destination": "Take exit {exit} on the left towards {destination}"
            },
            "right": {
                "default": "Weź zjazd po prawej",
                "name": "Weź zjazd po prawej na {way_name}",
                "destination": "Weź zjazd po prawej w kierunku {destination}",
                "exit": "Take exit {exit}",
                "exit_destination": "Take exit {exit} on the right towards {destination}"
            },
            "sharp left": {
                "default": "Weź zjazd po lewej",
                "name": "Weź zjazd po lewej na {way_name}",
                "destination": "Weź zjazd po lewej w kierunku {destination}",
                "exit": "Take exit {exit} on the left",
                "exit_destination": "Take exit {exit} on the left towards {destination}"
            },
            "sharp right": {
                "default": "Weź zjazd po prawej",
                "name": "Weź zjazd po prawej na {way_name}",
                "destination": "Weź zjazd po prawej w kierunku {destination}",
                "exit": "Take exit {exit}",
                "exit_destination": "Take exit {exit} on the right towards {destination}"
            },
            "slight left": {
                "default": "Weź zjazd po lewej",
                "name": "Weź zjazd po lewej na {way_name}",
                "destination": "Weź zjazd po lewej w kierunku {destination}",
                "exit": "Take exit {exit} on the left",
                "exit_destination": "Take exit {exit} on the left towards {destination}"
            },
            "slight right": {
                "default": "Weź zjazd po prawej",
                "name": "Weź zjazd po prawej na {way_name}",
                "destination": "Weź zjazd po prawej w kierunku {destination}",
                "exit": "Take exit {exit}",
                "exit_destination": "Take exit {exit} on the right towards {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Weź zjazd",
                "name": "Weź zjazd na {way_name}",
                "destination": "Weź zjazd w kierunku {destination}"
            },
            "left": {
                "default": "Weź zjazd po lewej",
                "name": "Weź zjazd po lewej na {way_name}",
                "destination": "Weź zjazd po lewej w kierunku {destination}"
            },
            "right": {
                "default": "Weź zjazd po prawej",
                "name": "Weź zjazd po prawej na {way_name}",
                "destination": "Weź zjazd po prawej w kierunku {destination}"
            },
            "sharp left": {
                "default": "Weź zjazd po lewej",
                "name": "Weź zjazd po lewej na {way_name}",
                "destination": "Weź zjazd po lewej w kierunku {destination}"
            },
            "sharp right": {
                "default": "Weź zjazd po prawej",
                "name": "Weź zjazd po prawej na {way_name}",
                "destination": "Weź zjazd po prawej w kierunku {destination}"
            },
            "slight left": {
                "default": "Weź zjazd po lewej",
                "name": "Weź zjazd po lewej na {way_name}",
                "destination": "Weź zjazd po lewej w kierunku {destination}"
            },
            "slight right": {
                "default": "Weź zjazd po prawej",
                "name": "Weź zjazd po prawej na {way_name}",
                "destination": "Weź zjazd po prawej w kierunku {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Wjedź na rondo",
                    "name": "Wjedź na rondo i skręć na {way_name}",
                    "destination": "Wjedź na rondo i skręć w kierunku {destination}"
                },
                "name": {
                    "default": "Wjedź na {rotary_name}",
                    "name": "Wjedź na {rotary_name} i skręć na {way_name}",
                    "destination": "Wjedź na {rotary_name} i skręć w kierunku {destination}"
                },
                "exit": {
                    "default": "Wjedź na rondo i wyjedź {exit_number} zjazdem",
                    "name": "Wjedź na rondo i wyjedź {exit_number} zjazdem na {way_name}",
                    "destination": "Wjedź na rondo i wyjedź {exit_number} zjazdem w kierunku {destination}"
                },
                "name_exit": {
                    "default": "Wjedź na {rotary_name} i wyjedź {exit_number} zjazdem",
                    "name": "Wjedź na {rotary_name} i wyjedź {exit_number} zjazdem na {way_name}",
                    "destination": "Wjedź na {rotary_name} i wyjedź {exit_number} zjazdem w kierunku {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "Wjedź na rondo i wyjedź {exit_number} zjazdem",
                    "name": "Wjedź na rondo i wyjedź {exit_number} zjazdem na {way_name}",
                    "destination": "Wjedź na rondo i wyjedź {exit_number} zjazdem w kierunku {destination}"
                },
                "default": {
                    "default": "Wjedź na rondo",
                    "name": "Wjedź na rondo i wyjedź na {way_name}",
                    "destination": "Wjedź na rondo i wyjedź w kierunku {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "Na rondzie weź {modifier}",
                "name": "Na rondzie weź {modifier} na {way_name}",
                "destination": "Na rondzie weź {modifier} w kierunku {destination}"
            },
            "left": {
                "default": "Na rondzie skręć w lewo",
                "name": "Na rondzie skręć lewo na {way_name}",
                "destination": "Na rondzie skręć w lewo w kierunku {destination}"
            },
            "right": {
                "default": "Na rondzie skręć w prawo",
                "name": "Na rondzie skręć w prawo na {way_name}",
                "destination": "Na rondzie skręć w prawo w kierunku {destination}"
            },
            "straight": {
                "default": "Na rondzie kontynuuj prosto",
                "name": "Na rondzie kontynuuj prosto na {way_name}",
                "destination": "Na rondzie kontynuuj prosto w kierunku {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "{modifier}",
                "name": "{modifier} na {way_name}",
                "destination": "{modifier} w kierunku {destination}"
            },
            "left": {
                "default": "Skręć w lewo",
                "name": "Skręć w lewo na {way_name}",
                "destination": "Skręć w lewo w kierunku {destination}"
            },
            "right": {
                "default": "Skręć w prawo",
                "name": "Skręć w prawo na {way_name}",
                "destination": "Skręć w prawo w kierunku {destination}"
            },
            "straight": {
                "default": "Jedź prosto",
                "name": "Jedź prosto na {way_name}",
                "destination": "Jedź prosto w kierunku {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Kontynuuj prosto"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}

},{}],11:[function(require,module,exports){
module.exports={
    "meta": {
        "capitalizeFirstLetter": true
    },
    "v5": {
        "constants": {
            "ordinalize": {
                "1": "1º",
                "2": "2º",
                "3": "3º",
                "4": "4º",
                "5": "5º",
                "6": "6º",
                "7": "7º",
                "8": "8º",
                "9": "9º",
                "10": "10º"
            },
            "direction": {
                "north": "norte",
                "northeast": "nordeste",
                "east": "leste",
                "southeast": "sudeste",
                "south": "sul",
                "southwest": "sudoeste",
                "west": "oeste",
                "northwest": "noroeste"
            },
            "modifier": {
                "left": "à esquerda",
                "right": "à direita",
                "sharp left": "acentuadamente à esquerda",
                "sharp right": "acentuadamente à direita",
                "slight left": "ligeiramente à esquerda",
                "slight right": "ligeiramente à direita",
                "straight": "reto",
                "uturn": "retorno"
            },
            "lanes": {
                "xo": "Mantenha-se à direita",
                "ox": "Mantenha-se à esquerda",
                "xox": "Mantenha-se ao centro",
                "oxo": "Mantenha-se à esquerda ou direita"
            }
        },
        "modes": {
            "ferry": {
                "default": "Pegue a balsa",
                "name": "Pegue a balsa {way_name}",
                "destination": "Pegue a balsa sentido {destination}"
            }
        },
        "arrive": {
            "default": {
                "default": "Você chegou ao seu {nth} destino"
            },
            "left": {
                "default": "Você chegou ao seu {nth} destino, à esquerda"
            },
            "right": {
                "default": "Você chegou ao seu {nth} destino, à direita"
            },
            "sharp left": {
                "default": "Você chegou ao seu {nth} destino, à esquerda"
            },
            "sharp right": {
                "default": "Você chegou ao seu {nth} destino, à direita"
            },
            "slight right": {
                "default": "Você chegou ao seu {nth} destino, à direita"
            },
            "slight left": {
                "default": "Você chegou ao seu {nth} destino, à esquerda"
            },
            "straight": {
                "default": "Você chegou ao seu {nth} destino, em frente"
            }
        },
        "continue": {
            "default": {
                "default": "Continue {modifier}",
                "name": "Continue {modifier} em {way_name}",
                "destination": "Continue {modifier} sentido {destination}"
            },
            "straight": {
                "default": "Continue reto",
                "name": "Continue em {way_name}",
                "destination": "Continue até {destination}"
            },
            "slight left": {
                "default": "Continue ligeiramente à esquerda",
                "name": "Continue ligeiramente à esquerda em {way_name}",
                "destination": "Continue ligeiramente à esquerda sentido {destination}"
            },
            "slight right": {
                "default": "Continue ligeiramente à direita",
                "name": "Continue ligeiramente à direita em {way_name}",
                "destination": "Continue ligeiramente à direita sentido {destination}"
            },
            "uturn": {
                "default": "Faça o retorno",
                "name": "Faça o retorno em {way_name}",
                "destination": "Faça o retorno sentido {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Siga {direction}",
                "name": "Siga {direction} em {way_name}"
            }
        },
        "end of road": {
            "default": {
                "default": "Vire {modifier}",
                "name": "Vire {modifier} em {way_name}",
                "destination": "Vire {modifier} sentido {destination}"
            },
            "straight": {
                "default": "Continue reto",
                "name": "Continue reto em {way_name}",
                "destination": "Continue reto sentido {destination}"
            },
            "uturn": {
                "default": "Faça o retorno no fim da rua",
                "name": "Faça o retorno em {way_name} no fim da rua",
                "destination": "Faça o retorno sentido {destination} no fim da rua"
            }
        },
        "fork": {
            "default": {
                "default": "Mantenha-se {modifier} na bifurcação",
                "name": "Mantenha-se {modifier} na bifurcação em {way_name}",
                "destination": "Mantenha-se {modifier} na bifurcação sentido {destination}"
            },
            "slight left": {
                "default": "Mantenha-se à esquerda na bifurcação",
                "name": "Mantenha-se à esquerda na bifurcação em {way_name}",
                "destination": "Mantenha-se à esquerda na bifurcação sentido {destination}"
            },
            "slight right": {
                "default": "Mantenha-se à direita na bifurcação",
                "name": "Mantenha-se à direita na bifurcação em {way_name}",
                "destination": "Mantenha-se à direita na bifurcação sentido {destination}"
            },
            "sharp left": {
                "default": "Vire acentuadamente à esquerda na bifurcação",
                "name": "Vire acentuadamente à esquerda na bifurcação em {way_name}",
                "destination": "Vire acentuadamente à esquerda na bifurcação sentido {destination}"
            },
            "sharp right": {
                "default": "Vire acentuadamente à direita na bifurcação",
                "name": "Vire acentuadamente à direita na bifurcação em {way_name}",
                "destination": "Vire acentuadamente à direita na bifurcação sentido {destination}"
            },
            "uturn": {
                "default": "Faça o retorno",
                "name": "Faça o retorno em {way_name}",
                "destination": "Faça o retorno sentido {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Entre {modifier}",
                "name": "Entre {modifier} na {way_name}",
                "destination": "Entre {modifier} em direção à {destination}"
            },
            "slight left": {
                "default": "Entre à esquerda",
                "name": "Entre à esquerda na {way_name}",
                "destination": "Entre à esquerda em direção à {destination}"
            },
            "slight right": {
                "default": "Entre à direita",
                "name": "Entre à direita na {way_name}",
                "destination": "Entre à direita em direção à {destination}"
            },
            "sharp left": {
                "default": "Entre à esquerda",
                "name": "Entre à esquerda na {way_name}",
                "destination": "Entre à esquerda em direção à {destination}"
            },
            "sharp right": {
                "default": "Entre à direita",
                "name": "Entre à direita na {way_name}",
                "destination": "Entre à direita em direção à {destination}"
            },
            "uturn": {
                "default": "Faça o retorno",
                "name": "Faça o retorno em {way_name}",
                "destination": "Faça o retorno sentido {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Continue {modifier}",
                "name": "Continue {modifier} em {way_name}",
                "destination": "Continue {modifier} sentido {destination}"
            },
            "straight": {
                "default": "Continue em frente",
                "name": "Continue em {way_name}",
                "destination": "Continue em direção à {destination}"
            },
            "sharp left": {
                "default": "Vire acentuadamente à esquerda",
                "name": "Vire acentuadamente à esquerda em {way_name}",
                "destination": "Vire acentuadamente à esquerda sentido {destination}"
            },
            "sharp right": {
                "default": "Vire acentuadamente à direita",
                "name": "Vire acentuadamente à direita em {way_name}",
                "destination": "Vire acentuadamente à direita sentido {destination}"
            },
            "slight left": {
                "default": "Continue ligeiramente à esquerda",
                "name": "Continue ligeiramente à esquerda em {way_name}",
                "destination": "Continue ligeiramente à esquerda sentido {destination}"
            },
            "slight right": {
                "default": "Continue ligeiramente à direita",
                "name": "Continue ligeiramente à direita em {way_name}",
                "destination": "Continue ligeiramente à direita sentido {destination}"
            },
            "uturn": {
                "default": "Faça o retorno",
                "name": "Faça o retorno em {way_name}",
                "destination": "Faça o retorno sentido {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Continue {modifier}",
                "name": "Continue {modifier} em {way_name}",
                "destination": "Continue {modifier} sentido {destination}"
            },
            "uturn": {
                "default": "Faça o retorno",
                "name": "Faça o retorno em {way_name}",
                "destination": "Faça o retorno sentido {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Pegue a rampa",
                "name": "Pegue a rampa em {way_name}",
                "destination": "Pegue a rampa sentido {destination}",
                "exit": "Pegue a saída {exit}",
                "exit_destination": "Pegue a saída {exit} em direção à {destination}"
            },
            "left": {
                "default": "Pegue a rampa à esquerda",
                "name": "Pegue a rampa à esquerda em {way_name}",
                "destination": "Pegue a rampa à esquerda sentido {destination}",
                "exit": "Pegue a saída {exit} à esquerda",
                "exit_destination": "Pegue a saída {exit}  à esquerda em direção à {destination}"
            },
            "right": {
                "default": "Pegue a rampa à direita",
                "name": "Pegue a rampa à direita em {way_name}",
                "destination": "Pegue a rampa à direita sentido {destination}",
                "exit": "Pegue a saída {exit} à direita",
                "exit_destination": "Pegue a saída {exit} à direita em direção à {destination}"
            },
            "sharp left": {
                "default": "Pegue a rampa à esquerda",
                "name": "Pegue a rampa à esquerda em {way_name}",
                "destination": "Pegue a rampa à esquerda sentido {destination}",
                "exit": "Pegue a saída {exit} à esquerda",
                "exit_destination": "Pegue a saída {exit}  à esquerda em direção à {destination}"
            },
            "sharp right": {
                "default": "Pegue a rampa à direita",
                "name": "Pegue a rampa à direita em {way_name}",
                "destination": "Pegue a rampa à direita sentido {destination}",
                "exit": "Pegue a saída {exit} à direita",
                "exit_destination": "Pegue a saída {exit} à direita em direção à {destination}"
            },
            "slight left": {
                "default": "Pegue a rampa à esquerda",
                "name": "Pegue a rampa à esquerda em {way_name}",
                "destination": "Pegue a rampa à esquerda sentido {destination}",
                "exit": "Pegue a saída {exit} à esquerda",
                "exit_destination": "Pegue a saída {exit}  à esquerda em direção à {destination}"
            },
            "slight right": {
                "default": "Pegue a rampa à direita",
                "name": "Pegue a rampa à direita em {way_name}",
                "destination": "Pegue a rampa à direita sentido {destination}",
                "exit": "Pegue a saída {exit} à direita",
                "exit_destination": "Pegue a saída {exit} à direita em direção à {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Pegue a rampa",
                "name": "Pegue a rampa em {way_name}",
                "destination": "Pegue a rampa sentido {destination}"
            },
            "left": {
                "default": "Pegue a rampa à esquerda",
                "name": "Pegue a rampa à esquerda em {way_name}",
                "destination": "Pegue a rampa à esquerda sentido {destination}"
            },
            "right": {
                "default": "Pegue a rampa à direita",
                "name": "Pegue a rampa à direita em {way_name}",
                "destination": "Pegue a rampa à direita sentid {destination}"
            },
            "sharp left": {
                "default": "Pegue a rampa à esquerda",
                "name": "Pegue a rampa à esquerda em {way_name}",
                "destination": "Pegue a rampa à esquerda sentido {destination}"
            },
            "sharp right": {
                "default": "Pegue a rampa à direita",
                "name": "Pegue a rampa à direita em {way_name}",
                "destination": "Pegue a rampa à direita sentido {destination}"
            },
            "slight left": {
                "default": "Pegue a rampa à esquerda",
                "name": "Pegue a rampa à esquerda em {way_name}",
                "destination": "Pegue a rampa à esquerda sentido {destination}"
            },
            "slight right": {
                "default": "Pegue a rampa à direita",
                "name": "Pegue a rampa à direita em {way_name}",
                "destination": "Pegue a rampa à direita sentido {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Entre na rotatória",
                    "name": "Entre na rotatória e saia em {way_name}",
                    "destination": "Entre na rotatória e saia sentido {destination}"
                },
                "name": {
                    "default": "Entre em {rotary_name}",
                    "name": "Entre em {rotary_name} e saia em {way_name}",
                    "destination": "Entre em {rotary_name} e saia sentido {destination}"
                },
                "exit": {
                    "default": "Entre na rotatória e saia na {exit_number} saída",
                    "name": "Entre na rotatória e saia na {exit_number} saída em {way_name}",
                    "destination": "Entre na rotatória e saia na {exit_number} saída sentido {destination}"
                },
                "name_exit": {
                    "default": "Entre em {rotary_name} e saia na {exit_number} saída",
                    "name": "Entre em {rotary_name} e saia na {exit_number} saída em {way_name}",
                    "destination": "Entre em {rotary_name} e saia na {exit_number} saída sentido {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "Entre na rotatória e saia na {exit_number} saída",
                    "name": "Entre na rotatória e saia na {exit_number} saída em {way_name}",
                    "destination": "Entre na rotatória e saia na {exit_number} saída sentido {destination}"
                },
                "default": {
                    "default": "Entre na rotatória",
                    "name": "Entre na rotatória e saia em {way_name}",
                    "destination": "Entre na rotatória e saia sentido {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "Na rotatória, vire {modifier}",
                "name": "Na rotatória, vire {modifier} na {way_name}",
                "destination": "Na rotatória, vire {modifier} em direção à {destination}"
            },
            "left": {
                "default": "Na rotatória vire à esquerda",
                "name": "Na rotatória vire à esquerda em {way_name}",
                "destination": "Na rotatória vire à esquerda sentido {destination}"
            },
            "right": {
                "default": "Na rotatória vire à direita",
                "name": "Na rotatória vire à direita em {way_name}",
                "destination": "Na rotatória vire à direita sentido {destination}"
            },
            "straight": {
                "default": "Na rotatória siga reto",
                "name": "Na rotatória siga reto em {way_name}",
                "destination": "Na rotatória siga reto sentido {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Siga {modifier}",
                "name": "Siga {modifier} em {way_name}",
                "destination": "Siga {modifier} sentido {destination}"
            },
            "left": {
                "default": "Vire à esquerda",
                "name": "Vire à esquerda em {way_name}",
                "destination": "Vire à esquerda sentido {destination}"
            },
            "right": {
                "default": "Vire à direita",
                "name": "Vire à direita em {way_name}",
                "destination": "Vire à direita sentido {destination}"
            },
            "straight": {
                "default": "Siga reto",
                "name": "Siga reto em {way_name}",
                "destination": "Siga reto sentido {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Continue reto"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}
},{}],12:[function(require,module,exports){
module.exports={
    "meta": {
        "capitalizeFirstLetter": true
    },
    "v5": {
        "constants": {
            "ordinalize": {
                "1": "первый",
                "2": "второй",
                "3": "третий",
                "4": "четвёртый",
                "5": "пятый",
                "6": "шестой",
                "7": "седьмой",
                "8": "восьмой",
                "9": "девятый",
                "10": "десятый"
            },
            "direction": {
                "north": "северном",
                "northeast": "северо-восточном",
                "east": "восточном",
                "southeast": "юго-восточном",
                "south": "южном",
                "southwest": "юго-западном",
                "west": "западном",
                "northwest": "северо-западном"
            },
            "modifier": {
                "left": "налево",
                "right": "направо",
                "sharp left": "налево",
                "sharp right": "направо",
                "slight left": "левее",
                "slight right": "правее",
                "straight": "прямо",
                "uturn": "на разворот"
            },
            "lanes": {
                "xo": "Держитесь правее",
                "ox": "Держитесь левее",
                "xox": "Держитесь посередине",
                "oxo": "Держитесь слева или справа"
            }
        },
        "modes": {
            "ferry": {
                "default": "Погрузитесь на паром",
                "name": "Погрузитесь на паром {way_name}",
                "destination": "Погрузитесь на паром в направлении {destination}"
            }
        },
        "arrive": {
            "default": {
                "default": "Вы прибыли в {nth} пункт назначения"
            },
            "left": {
                "default": "Вы прибыли в {nth} пункт назначения, он находится слева"
            },
            "right": {
                "default": "Вы прибыли в {nth} пункт назначения, он находится справа"
            },
            "sharp left": {
                "default": "Вы прибыли в {nth} пункт назначения, он находится слева"
            },
            "sharp right": {
                "default": "Вы прибыли в {nth} пункт назначения, он находится справа"
            },
            "slight right": {
                "default": "Вы прибыли в {nth} пункт назначения, он находится справа"
            },
            "slight left": {
                "default": "Вы прибыли в {nth} пункт назначения, он находится слева"
            },
            "straight": {
                "default": "Вы прибыли в {nth} пункт назначения, он находится перед вами"
            }
        },
        "continue": {
            "default": {
                "default": "Двигайтесь {modifier}",
                "name": "Двигайтесь {modifier} по {way_name}",
                "destination": "Двигайтесь {modifier} в направлении {destination}"
            },
            "straight": {
                "default": "Двигайтесь прямо",
                "name": "Продолжите движение по {way_name}",
                "destination": "Продолжите движение в направлении {destination}"
            },
            "slight left": {
                "default": "Плавно поверните налево",
                "name": "Плавно поверните налево на {way_name}",
                "destination": "Плавно поверните налево в направлении {destination}"
            },
            "slight right": {
                "default": "Плавно поверните направо",
                "name": "Плавно поверните направо на {way_name}",
                "destination": "Плавно поверните направо в направлении {destination}"
            },
            "uturn": {
                "default": "Развернитесь",
                "name": "Развернитесь на {way_name}",
                "destination": "Развернитесь в направлении {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Двигайтесь в {direction} направлении",
                "name": "Двигайтесь в {direction} направлении по {way_name}"
            }
        },
        "end of road": {
            "default": {
                "default": "Поверните {modifier}",
                "name": "Поверните {modifier} на {way_name}",
                "destination": "Поверните {modifier} в направлении {destination}"
            },
            "straight": {
                "default": "Двигайтесь прямо",
                "name": "Двигайтесь прямо по {way_name}",
                "destination": "Двигайтесь прямо в направлении {destination}"
            },
            "uturn": {
                "default": "В конце дороги развернитесь",
                "name": "Развернитесь в конце {way_name}",
                "destination": "В конце дороги развернитесь в направлении {destination}"
            }
        },
        "fork": {
            "default": {
                "default": "На развилке двигайтесь {modifier}",
                "name": "На развилке двигайтесь {modifier} на {way_name}",
                "destination": "На развилке двигайтесь {modifier} в направлении {destination}"
            },
            "slight left": {
                "default": "На развилке держитесь левее",
                "name": "На развилке держитесь левее на {way_name}",
                "destination": "На развилке держитесь левее и продолжите движение в направлении {destination}"
            },
            "slight right": {
                "default": "На развилке держитесь правее",
                "name": "На развилке держитесь правее на {way_name}",
                "destination": "На развилке держитесь правее и продолжите движение в направлении {destination}"
            },
            "sharp left": {
                "default": "На развилке резко поверните налево",
                "name": "На развилке резко поверните налево на {way_name}",
                "destination": "На развилке резко поверните налево и продолжите движение в направлении {destination}"
            },
            "sharp right": {
                "default": "На развилке резко поверните направо",
                "name": "На развилке резко поверните направо на {way_name}",
                "destination": "На развилке резко поверните направо и продолжите движение в направлении {destination}"
            },
            "uturn": {
                "default": "На развилке развернитесь",
                "name": "На развилке развернитесь на {way_name}",
                "destination": "На развилке развернитесь и продолжите движение в направлении {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Перестройтесь {modifier}",
                "name": "Перестройтесь {modifier} на {way_name}",
                "destination": "Перестройтесь {modifier} в направлении {destination}"
            },
            "slight left": {
                "default": "Перестройтесь левее",
                "name": "Перестройтесь левее на {way_name}",
                "destination": "Перестройтесь левее в направлении {destination}"
            },
            "slight right": {
                "default": "Перестройтесь правее",
                "name": "Перестройтесь правее на {way_name}",
                "destination": "Перестройтесь правее в направлении {destination}"
            },
            "sharp left": {
                "default": "Перестраивайтесь левее",
                "name": "Перестраивайтесь левее на {way_name}",
                "destination": "Перестраивайтесь левее в направлении {destination}"
            },
            "sharp right": {
                "default": "Перестраивайтесь правее",
                "name": "Перестраивайтесь правее на {way_name}",
                "destination": "Перестраивайтесь правее в направлении {destination}"
            },
            "uturn": {
                "default": "Развернитесь",
                "name": "Развернитесь на {way_name}",
                "destination": "Развернитесь в направлении {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Двигайтесь {modifier}",
                "name": "Двигайтесь {modifier} на {way_name}",
                "destination": "Двигайтесь {modifier} в направлении {destination}"
            },
            "straight": {
                "default": "Двигайтесь прямо",
                "name": "Продолжите движение по {way_name}",
                "destination": "Продолжите движение в направлении {destination}"
            },
            "sharp left": {
                "default": "Резко поверните налево",
                "name": "Резко поверните налево на {way_name}",
                "destination": "Резко поверните налево и продолжите движение в направлении {destination}"
            },
            "sharp right": {
                "default": "Резко поверните направо",
                "name": "Резко поверните направо на {way_name}",
                "destination": "Резко поверните направо и продолжите движение в направлении {destination}"
            },
            "slight left": {
                "default": "Плавно поверните налево",
                "name": "Плавно поверните налево на {way_name}",
                "destination": "Плавно поверните налево в направлении {destination}"
            },
            "slight right": {
                "default": "Плавно поверните направо",
                "name": "Плавно поверните направо на {way_name}",
                "destination": "Плавно поверните направо в направлении {destination}"
            },
            "uturn": {
                "default": "Развернитесь",
                "name": "Развернитесь на {way_name}",
                "destination": "Развернитесь и продолжите движение в направлении {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Двигайтесь {modifier}",
                "name": "Двигайтесь {modifier} по {way_name}",
                "destination": "Двигайтесь {modifier} в направлении {destination}"
            },
            "uturn": {
                "default": "Развернитесь",
                "name": "Развернитесь на {way_name}",
                "destination": "Развернитесь и продолжите движение в направлении {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Сверните на съезд",
                "name": "Сверните на съезд на {way_name}",
                "destination": "Сверните на съезд в направлении {destination}",
                "exit": "Сверните на съезд {exit}",
                "exit_destination": "Сверните на съезд {exit} в направлении {destination}"
            },
            "left": {
                "default": "Сверните на левый съезд",
                "name": "Сверните на левый съезд на {way_name}",
                "destination": "Сверните на левый съезд в направлении {destination}",
                "exit": "Сверните на съезд {exit} слева",
                "exit_destination": "Сверните на съезд {exit} слева в направлении {destination}"
            },
            "right": {
                "default": "Сверните на правый съезд",
                "name": "Сверните на правый съезд на {way_name}",
                "destination": "Сверните на правый съезд в направлении {destination}",
                "exit": "Сверните на съезд {exit} справа",
                "exit_destination": "Сверните на съезд {exit} справа в направлении {destination}"
            },
            "sharp left": {
                "default": "Поверните налево на съезд",
                "name": "Поверните налево на съезд на {way_name}",
                "destination": "Поверните налево на съезд в направлении {destination}",
                "exit": "Поверните налево на съезд {exit}",
                "exit_destination": "Поверните налево на съезд {exit} в направлении {destination}"
            },
            "sharp right": {
                "default": "Поверните направо на съезд",
                "name": "Поверните направо на съезд на {way_name}",
                "destination": "Поверните направо на съезд в направлении {destination}",
                "exit": "Поверните направо на съезд {exit}",
                "exit_destination": "Поверните направо на съезд {exit} в направлении {destination}"
            },
            "slight left": {
                "default": "Перестройтесь левее на съезд",
                "name": "Перестройтесь левее на съезд на {way_name}",
                "destination": "Перестройтесь левее на съезд в направлении {destination}",
                "exit": "Перестройтесь левее на {exit}",
                "exit_destination": "Перестройтесь левее на съезд {exit} в направлении {destination}"
            },
            "slight right": {
                "default": "Перестройтесь правее на съезд",
                "name": "Перестройтесь правее на съезд на {way_name}",
                "destination": "Перестройтесь правее на съезд в направлении {destination}",
                "exit": "Перестройтесь правее на съезд {exit}",
                "exit_destination": "Перестройтесь правее на съезд {exit} в направлении {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Сверните на автомагистраль",
                "name": "Сверните на въезд на {way_name}",
                "destination": "Сверните на въезд на автомагистраль в направлении {destination}"
            },
            "left": {
                "default": "Сверните на левый въезд на автомагистраль",
                "name": "Сверните на левый въезд на {way_name}",
                "destination": "Сверните на левый въезд на автомагистраль в направлении {destination}"
            },
            "right": {
                "default": "Сверните на правый въезд на автомагистраль",
                "name": "Сверните на правый въезд на {way_name}",
                "destination": "Сверните на правый въезд на автомагистраль в направлении {destination}"
            },
            "sharp left": {
                "default": "Поверните на левый въезд на автомагистраль",
                "name": "Поверните на левый въезд на {way_name}",
                "destination": "Поверните на левый въезд на автомагистраль в направлении {destination}"
            },
            "sharp right": {
                "default": "Поверните на правый въезд на автомагистраль",
                "name": "Поверните на правый въезд на {way_name}",
                "destination": "Поверните на правый въезд на автомагистраль в направлении {destination}"
            },
            "slight left": {
                "default": "Перестройтесь левее на въезд на автомагистраль",
                "name": "Перестройтесь левее на {way_name}",
                "destination": "Перестройтесь левее на автомагистраль в направлении {destination}"
            },
            "slight right": {
                "default": "Перестройтесь правее на въезд на автомагистраль",
                "name": "Перестройтесь правее на {way_name}",
                "destination": "Перестройтесь правее на автомагистраль в направлении {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Продолжите движение по круговой развязке",
                    "name": "На круговой  развязке сверните на {way_name}",
                    "destination": "На круговой  развязке сверните в направлении {destination}"
                },
                "name": {
                    "default": "Продолжите движение по {rotary_name} с круговым движением",
                    "name": "На {rotary_name} с круговым движением сверните на {way_name}",
                    "destination": "На {rotary_name} с круговым движением сверните в направлении {destination}"
                },
                "exit": {
                    "default": "На круговой развязке сверните на {exit_number} съезд",
                    "name": "На круговой развязке сверните на {exit_number} съезд на {way_name}",
                    "destination": "На круговой развязке сверните на {exit_number} съезд в направлении {destination}"
                },
                "name_exit": {
                    "default": "На {rotary_name} с круговым движением сверните на {exit_number} съезд",
                    "name": "На {rotary_name} с круговым движением сверните на {exit_number} съезд на {way_name}",
                    "destination": "На {rotary_name} с круговым движением сверните на {exit_number} съезд в направлении {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "На круговой  развязке сверните на {exit_number} съезд",
                    "name": "На круговой  развязке сверните на {exit_number} съезд на {way_name}",
                    "destination": "На круговой  развязке сверните на {exit_number} съезд в направлении {destination}"
                },
                "default": {
                    "default": "Продолжите движение по круговой развязке",
                    "name": "На круговой развязке сверните на {way_name}",
                    "destination": "На круговой развязке сверните в направлении {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "На круговой развязке двигайтесь {modifier}",
                "name": "На круговой развязке двигайтесь {modifier} на {way_name}",
                "destination": "На круговой развязке двигайтесь {modifier} в направлении {destination}"
            },
            "left": {
                "default": "На круговой развязке сверните налево",
                "name": "На круговой развязке сверните налево на {way_name}",
                "destination": "На круговой развязке сверните налево в направлении {destination}"
            },
            "right": {
                "default": "На круговой развязке сверните направо",
                "name": "На круговой развязке сверните направо на {way_name}",
                "destination": "На круговой развязке сверните направо в направлении {destination}"
            },
            "straight": {
                "default": "На круговой развязке двигайтесь прямо",
                "name": "На круговой развязке двигайтесь по {way_name}",
                "destination": "На круговой развязке двигайтесь в направлении {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Двигайтесь {modifier}",
                "name": "Двигайтесь {modifier} на {way_name}",
                "destination": "Двигайтесь {modifier}  в направлении {destination}"
            },
            "left": {
                "default": "Поверните налево",
                "name": "Поверните налево на {way_name}",
                "destination": "Поверните налево в направлении {destination}"
            },
            "right": {
                "default": "Поверните направо",
                "name": "Поверните направо на {way_name}",
                "destination": "Поверните направо  в направлении {destination}"
            },
            "straight": {
                "default": "Двигайтесь прямо",
                "name": "Двигайтесь по {way_name}",
                "destination": "Двигайтесь в направлении {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Продолжайте движение прямо"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}
},{}],13:[function(require,module,exports){
module.exports={
    "meta": {
        "capitalizeFirstLetter": true
    },
    "v5": {
        "constants": {
            "ordinalize": {
                "1": "1:a",
                "2": "2:a",
                "3": "3:e",
                "4": "4:e",
                "5": "5:e",
                "6": "6:e",
                "7": "7:e",
                "8": "8:e",
                "9": "9:e",
                "10": "10:e"
            },
            "direction": {
                "north": "norr",
                "northeast": "nordost",
                "east": "öster",
                "southeast": "sydost",
                "south": "söder",
                "southwest": "sydväst",
                "west": "väster",
                "northwest": "nordväst"
            },
            "modifier": {
                "left": "vänster",
                "right": "höger",
                "sharp left": "vänster",
                "sharp right": "höger",
                "slight left": "vänster",
                "slight right": "höger",
                "straight": "rakt fram",
                "uturn": "U-sväng"
            },
            "lanes": {
                "xo": "Håll till höger",
                "ox": "Håll till vänster",
                "xox": "Håll till mitten",
                "oxo": "Håll till vänster eller höger"
            }
        },
        "modes": {
            "ferry": {
                "default": "Ta färjan",
                "name": "Ta färjan på {way_name}",
                "destination": "Ta färjan mot {destination}"
            }
        },
        "arrive": {
            "default": {
                "default": "Du är framme vid din {nth} destination"
            },
            "left": {
                "default": "Du är framme vid din {nth} destination, till vänster"
            },
            "right": {
                "default": "Du är framme vid din {nth} destination, till höger"
            },
            "sharp left": {
                "default": "Du är framme vid din {nth} destination, skarpt till vänster"
            },
            "sharp right": {
                "default": "Du är framme vid din {nth} destination, skarpt till höger"
            },
            "slight right": {
                "default": "Du är framme vid din {nth} destination, till höger"
            },
            "slight left": {
                "default": "Du är framme vid din {nth} destination, till vänster"
            },
            "straight": {
                "default": "Du är framme vid din {nth} destination, rakt fram"
            }
        },
        "continue": {
            "default": {
                "default": "Fortsätt {modifier}",
                "name": "Fortsätt {modifier} in på {way_name}",
                "destination": "Fortsätt {modifier} mot {destination}"
            },
            "straight": {
                "default": "Fortsätt rakt fram",
                "name": "Fortsätt in på {way_name}",
                "destination": "Fortsätt mot {destination}"
            },
            "slight left": {
                "default": "Fortsätt åt vänster",
                "name": "Fortsätt åt vänster in på {way_name}",
                "destination": "Fortsätt åt vänster mot {destination}"
            },
            "slight right": {
                "default": "Fortsätt åt höger",
                "name": "Fortsätt åt höger in på {way_name}",
                "destination": "Fortsätt åt höger mot {destination}"
            },
            "uturn": {
                "default": "Gör en U-sväng",
                "name": "Gör en U-sväng in på {way_name}",
                "destination": "Gör en U-sväng mot {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Kör åt {direction}",
                "name": "Kör åt {direction} på {way_name}"
            }
        },
        "end of road": {
            "default": {
                "default": "Sväng {modifier}",
                "name": "Sväng {modifier} in på {way_name}",
                "destination": "Sväng {modifier} mot {destination}"
            },
            "straight": {
                "default": "Fortsätt rakt fram",
                "name": "Fortsätt rakt fram in på {way_name}",
                "destination": "Fortsätt rakt fram mot {destination}"
            },
            "uturn": {
                "default": "Gör en U-sväng i slutet av vägen",
                "name": "Gör en U-sväng in på {way_name} i slutet av vägen",
                "destination": "Gör en U-sväng mot {destination} i slutet av vägen"
            }
        },
        "fork": {
            "default": {
                "default": "Håll till {modifier} där vägen delar sig",
                "name": "Håll till {modifier} in på {way_name}",
                "destination": "Håll till {modifier} mot {destination}"
            },
            "slight left": {
                "default": "Håll till vänster där vägen delar sig",
                "name": "Håll till vänster in på {way_name}",
                "destination": "Håll till vänster mot {destination}"
            },
            "slight right": {
                "default": "Håll till höger där vägen delar sig",
                "name": "Håll till höger in på {way_name}",
                "destination": "Håll till höger mot {destination}"
            },
            "sharp left": {
                "default": "Sväng vänster där vägen delar sig",
                "name": "Sväng vänster in på {way_name}",
                "destination": "Sväng vänster mot {destination}"
            },
            "sharp right": {
                "default": "Sväng höger där vägen delar sig",
                "name": "Sväng höger in på {way_name}",
                "destination": "Sväng höger mot {destination}"
            },
            "uturn": {
                "default": "Gör en U-sväng",
                "name": "Gör en U-sväng in på {way_name}",
                "destination": "Gör en U-sväng mot {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Byt till {modifier} körfält",
                "name": "Byt till {modifier} körfält in på {way_name}",
                "destination": "Byt till {modifier} körfält mot {destination}"
            },
            "slight left": {
                "default": "Byt till vänstra körfältet",
                "name": "Byt till vänstra körfältet in på {way_name}",
                "destination": "Byt till vänstra körfältet mot {destination}"
            },
            "slight right": {
                "default": "Byt till högra körfältet",
                "name": "Byt till högra körfältet in på {way_name}",
                "destination": "Byt till högra körfältet mot {destination}"
            },
            "sharp left": {
                "default": "Byt till vänstra körfältet",
                "name": "Byt till vänstra körfältet in på {way_name}",
                "destination": "Byt till vänstra körfältet mot {destination}"
            },
            "sharp right": {
                "default": "Byt till högra körfältet",
                "name": "Byt till högra körfältet in på {way_name}",
                "destination": "Byt till högra körfältet mot {destination}"
            },
            "uturn": {
                "default": "Gör en U-sväng",
                "name": "Gör en U-sväng in på {way_name}",
                "destination": "Gör en U-sväng mot {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Fortsätt {modifier}",
                "name": "Fortsätt {modifier} på {way_name}",
                "destination": "Fortsätt {modifier} mot {destination}"
            },
            "straight": {
                "default": "Fortsätt rakt fram",
                "name": "Fortsätt in på {way_name}",
                "destination": "Fortsätt mot {destination}"
            },
            "sharp left": {
                "default": "Gör en skarp vänstersväng",
                "name": "Gör en skarp vänstersväng in på {way_name}",
                "destination": "Gör en skarp vänstersväng mot {destination}"
            },
            "sharp right": {
                "default": "Gör en skarp högersväng",
                "name": "Gör en skarp högersväng in på {way_name}",
                "destination": "Gör en skarp högersväng mot {destination}"
            },
            "slight left": {
                "default": "Fortsätt med lätt vänstersväng",
                "name": "Fortsätt med lätt vänstersväng in på {way_name}",
                "destination": "Fortsätt med lätt vänstersväng mot {destination}"
            },
            "slight right": {
                "default": "Fortsätt med lätt högersväng",
                "name": "Fortsätt med lätt högersväng in på {way_name}",
                "destination": "Fortsätt med lätt högersväng mot {destination}"
            },
            "uturn": {
                "default": "Gör en U-sväng",
                "name": "Gör en U-sväng in på {way_name}",
                "destination": "Gör en U-sväng mot {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Fortsätt {modifier}",
                "name": "Fortsätt {modifier} på {way_name}",
                "destination": "Fortsätt {modifier} mot {destination}"
            },
            "uturn": {
                "default": "Gör en U-sväng",
                "name": "Gör en U-sväng in på {way_name}",
                "destination": "Gör en U-sväng mot {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Ta avfarten",
                "name": "Ta avfarten in på {way_name}",
                "destination": "Ta avfarten mot {destination}",
                "exit": "Ta avfart {exit} ",
                "exit_destination": "Ta avfart {exit} mot {destination}"
            },
            "left": {
                "default": "Ta avfarten till vänster",
                "name": "Ta avfarten till vänster in på {way_name}",
                "destination": "Ta avfarten till vänster mot {destination}",
                "exit": "Ta avfart {exit} till vänster",
                "exit_destination": "Ta avfart {exit} till vänster mot {destination}"
            },
            "right": {
                "default": "Ta avfarten till höger",
                "name": "Ta avfarten till höger in på {way_name}",
                "destination": "Ta avfarten till höger mot {destination}",
                "exit": "Ta avfart {exit} till höger",
                "exit_destination": "Ta avfart {exit} till höger mot {destination}"
            },
            "sharp left": {
                "default": "Ta avfarten till vänster",
                "name": "Ta avfarten till vänster in på {way_name}",
                "destination": "Ta avfarten till vänster mot {destination}",
                "exit": "Ta avfart {exit} till vänster",
                "exit_destination": "Ta avfart {exit} till vänster mot {destination}"
            },
            "sharp right": {
                "default": "Ta avfarten till höger",
                "name": "Ta avfarten till höger in på {way_name}",
                "destination": "Ta avfarten till höger mot {destination}",
                "exit": "Ta avfart {exit} till höger",
                "exit_destination": "Ta avfart {exit} till höger mot {destination}"
            },
            "slight left": {
                "default": "Ta avfarten till vänster",
                "name": "Ta avfarten till vänster in på {way_name}",
                "destination": "Ta avfarten till vänster mot {destination}",
                "exit": "Ta avfart {exit} till vänster",
                "exit_destination": "Ta avfart{exit} till vänster mot {destination}"
            },
            "slight right": {
                "default": "Ta avfarten till höger",
                "name": "Ta avfarten till höger in på {way_name}",
                "destination": "Ta avfarten till höger mot {destination}",
                "exit": "Ta avfart {exit} till höger",
                "exit_destination": "Ta avfart {exit} till höger mot {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Ta påfarten",
                "name": "Ta påfarten in på {way_name}",
                "destination": "Ta påfarten mot {destination}"
            },
            "left": {
                "default": "Ta påfarten till vänster",
                "name": "Ta påfarten till vänster in på {way_name}",
                "destination": "Ta påfarten till vänster mot {destination}"
            },
            "right": {
                "default": "Ta påfarten till höger",
                "name": "Ta påfarten till höger in på {way_name}",
                "destination": "Ta påfarten till höger mot {destination}"
            },
            "sharp left": {
                "default": "Ta påfarten till vänster",
                "name": "Ta påfarten till vänster in på {way_name}",
                "destination": "Ta påfarten till vänster mot {destination}"
            },
            "sharp right": {
                "default": "Ta påfarten till höger",
                "name": "Ta påfarten till höger in på {way_name}",
                "destination": "Ta påfarten till höger mot {destination}"
            },
            "slight left": {
                "default": "Ta påfarten till vänster",
                "name": "Ta påfarten till vänster in på {way_name}",
                "destination": "Ta påfarten till vänster mot {destination}"
            },
            "slight right": {
                "default": "Ta påfarten till höger",
                "name": "Ta påfarten till höger in på {way_name}",
                "destination": "Ta påfarten till höger mot {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Kör in i rondellen",
                    "name": "I rondellen ta av in på {way_name}",
                    "destination": "I rondellen ta av mot {destination}"
                },
                "name": {
                    "default": "Kör in i {rotary_name}",
                    "name": "I {rotary_name} ta av in på {way_name}",
                    "destination": "I {rotary_name} ta av mot {destination}"
                },
                "exit": {
                    "default": "I rondellen ta {exit_number} avfarten",
                    "name": "I rondellen ta {exit_number} avfarten in på {way_name}",
                    "destination": "I rondellen ta {exit_number} avfarten mot {destination}"
                },
                "name_exit": {
                    "default": "I {rotary_name} ta {exit_number} avfarten",
                    "name": "I {rotary_name} ta {exit_number}  avfarten in på {way_name}",
                    "destination": "I {rotary_name} ta {exit_number} avfarten mot {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "I rondellen ta {exit_number} avfarten",
                    "name": "I rondellen ta {exit_number} avfarten in på {way_name}",
                    "destination": "I rondellen ta {exit_number} avfarten mot {destination}"
                },
                "default": {
                    "default": "Kör in i rondellen",
                    "name": "I rondellen ta av mot {way_name}",
                    "destination": "I rondellen ta av mot {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "I rondellen sväng {modifier}",
                "name": "I rondellen sväng {modifier} in på {way_name}",
                "destination": "I rondellen sväng {modifier} mot {destination}"
            },
            "left": {
                "default": "I rondellen sväng vänster",
                "name": "I rondellen sväng vänster in på {way_name}",
                "destination": "I rondellen sväng vänster mot {destination}"
            },
            "right": {
                "default": "I rondellen sväng höger",
                "name": "I rondellen sväng höger in på {way_name}",
                "destination": "I rondellen sväng höger mot {destination}"
            },
            "straight": {
                "default": "I rondellen fortsätt rakt fram",
                "name": "I rondellen fortsätt rakt fram in på {way_name}",
                "destination": "I rondellen fortsätt rakt fram mot {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Sväng {modifier}",
                "name": "Sväng {modifier} in på {way_name}",
                "destination": "Sväng {modifier} mot {destination}"
            },
            "left": {
                "default": "Sväng vänster",
                "name": "Sväng vänster in på {way_name}",
                "destination": "Sväng vänster mot {destination}"
            },
            "right": {
                "default": "Sväng höger",
                "name": "Sväng höger in på {way_name}",
                "destination": "Sväng höger mot {destination}"
            },
            "straight": {
                "default": "Kör rakt fram",
                "name": "Kör rakt fram in på {way_name}",
                "destination": "Kör rakt fram mot {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Fortsätt rakt fram"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}
},{}],14:[function(require,module,exports){
module.exports={
    "meta": {
        "capitalizeFirstLetter": true
    },
    "v5": {
        "constants": {
            "ordinalize": {
                "1": "1й",
                "2": "2й",
                "3": "3й",
                "4": "4й",
                "5": "5й",
                "6": "6й",
                "7": "7й",
                "8": "8й",
                "9": "9й",
                "10": "10й"
            },
            "direction": {
                "north": "північ",
                "northeast": "північний схід",
                "east": "схід",
                "southeast": "південний схід",
                "south": "південь",
                "southwest": "південний захід",
                "west": "захід",
                "northwest": "північний захід"
            },
            "modifier": {
                "left": "ліворуч",
                "right": "праворуч",
                "sharp left": "різко ліворуч",
                "sharp right": "різко праворуч",
                "slight left": "плавно ліворуч",
                "slight right": "плавно праворуч",
                "straight": "прямо",
                "uturn": "розворот"
            },
            "lanes": {
                "xo": "Тримайтесь праворуч",
                "ox": "Тримайтесь ліворуч",
                "xox": "Тримайтесь в середині",
                "oxo": "Тримайтесь праворуч або ліворуч"
            }
        },
        "modes": {
            "ferry": {
                "default": "Скористайтесь поромом",
                "name": "Скористайтесь поромом {way_name}",
                "destination": "Скористайтесь поромом у напрямку {destination}"
            }
        },
        "arrive": {
            "default": {
                "default": "Ви прибули у ваш {nth} пункт призначення"
            },
            "left": {
                "default": "Ви прибули у ваш {nth} пункт призначення, він – ліворуч"
            },
            "right": {
                "default": "Ви прибули у ваш {nth} пункт призначення, він – праворуч"
            },
            "sharp left": {
                "default": "Ви прибули у ваш {nth} пункт призначення, він – ліворуч"
            },
            "sharp right": {
                "default": "Ви прибули у ваш {nth} пункт призначення, він – праворуч"
            },
            "slight right": {
                "default": "Ви прибули у ваш {nth} пункт призначення, він – праворуч"
            },
            "slight left": {
                "default": "Ви прибули у ваш {nth} пункт призначення, він – ліворуч"
            },
            "straight": {
                "default": "Ви прибули у ваш {nth} пункт призначення, він – прямо перед вами"
            }
        },
        "continue": {
            "default": {
                "default": "Рухайтесь {modifier}",
                "name": "Рухайтесь {modifier} на {way_name}",
                "destination": "Рухайтесь {modifier} у напрямку {destination}"
            },
            "straight": {
                "default": "Продовжуйте рух прямо",
                "name": "Рухайтесь по {way_name}",
                "destination": "Рухайтесь у напрямку {destination}"
            },
            "slight left": {
                "default": "Прийміть плавно ліворуч",
                "name": "Рухайтесь плавно ліворуч на {way_name}",
                "destination": "Рухайтесь плавно ліворуч у напрямку {destination}"
            },
            "slight right": {
                "default": "Прийміть плавно праворуч",
                "name": "Рухайтесь плавно праворуч на {way_name}",
                "destination": "Рухайтесь плавно праворуч у напрямку {destination}"
            },
            "uturn": {
                "default": "Здійсніть розворот",
                "name": "Здійсніть розворот на {way_name}",
                "destination": "Здійсніть розворот у напрямку {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Прямуйте на {direction}",
                "name": "Прямуйте на {direction} по {way_name}"
            }
        },
        "end of road": {
            "default": {
                "default": "Поверніть {modifier}",
                "name": "Поверніть {modifier} на {way_name}",
                "destination": "Поверніть {modifier} у напрямку {destination}"
            },
            "straight": {
                "default": "Продовжуйте рух прямо",
                "name": "Продовжуйте рух прямо по {way_name}",
                "destination": "Продовжуйте рух прямо у напрямку {destination}"
            },
            "uturn": {
                "default": "Здійсніть розворот в кінці дороги",
                "name": "Здійсніть розворот на {way_name} в кінці дороги",
                "destination": "Здійсніть розворот у напрямку {destination} в кінці дороги"
            }
        },
        "fork": {
            "default": {
                "default": "На роздоріжжі тримайтеся {modifier}",
                "name": "На роздоріжжі тримайтеся {modifier} і виїжджайте на {way_name}",
                "destination": "На роздоріжжі тримайтеся {modifier} у напрямку {destination}"
            },
            "slight left": {
                "default": "На роздоріжжі тримайтеся ліворуч",
                "name": "На роздоріжжі тримайтеся ліворуч і виїжджайте на {way_name}",
                "destination": "На роздоріжжі тримайтеся ліворуч у напрямку {destination}"
            },
            "slight right": {
                "default": "На роздоріжжі тримайтеся праворуч",
                "name": "На роздоріжжі тримайтеся праворуч і виїжджайте на {way_name}",
                "destination": "На роздоріжжі тримайтеся праворуч у напрямку {destination}"
            },
            "sharp left": {
                "default": "На роздоріжжі різко поверніть ліворуч",
                "name": "На роздоріжжі різко поверніть ліворуч на {way_name}",
                "destination": "На роздоріжжі різко поверніть ліворуч в напрямку {destination}"
            },
            "sharp right": {
                "default": "На роздоріжжі різко поверніть праворуч",
                "name": "На роздоріжжі різко поверніть праворуч на {way_name}",
                "destination": "На роздоріжжі різко поверніть праворуч в напрямку {destination}"
            },
            "uturn": {
                "default": "Здійсніть розворот",
                "name": "Здійсніть розворот на {way_name}",
                "destination": "Здійсніть розворот у напрямку {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Приєднайтеся до потоку {modifier}",
                "name": "Приєднайтеся до потоку {modifier} на {way_name}",
                "destination": "Приєднайтеся до потоку {modifier} у напрямку {destination}"
            },
            "slight left": {
                "default": "Приєднайтеся до потоку ліворуч",
                "name": "Приєднайтеся до потоку ліворуч на {way_name}",
                "destination": "Приєднайтеся до потоку ліворуч у напрямку {destination}"
            },
            "slight right": {
                "default": "Приєднайтеся до потоку праворуч",
                "name": "Приєднайтеся до потоку праворуч на {way_name}",
                "destination": "Приєднайтеся до потоку праворуч у напрямку {destination}"
            },
            "sharp left": {
                "default": "Приєднайтеся до потоку ліворуч",
                "name": "Приєднайтеся до потоку ліворуч на {way_name}",
                "destination": "Приєднайтеся до потоку ліворуч у напрямку {destination}"
            },
            "sharp right": {
                "default": "Приєднайтеся до потоку праворуч",
                "name": "Приєднайтеся до потоку праворуч на {way_name}",
                "destination": "Приєднайтеся до потоку праворуч у напрямку {destination}"
            },
            "uturn": {
                "default": "Здійсніть розворот",
                "name": "Здійсніть розворот на {way_name}",
                "destination": "Здійсніть розворот у напрямку {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Рухайтесь {modifier}",
                "name": "Рухайтесь {modifier} на {way_name}",
                "destination": "Рухайтесь {modifier} у напрямку {destination}"
            },
            "straight": {
                "default": "Продовжуйте рух прямо",
                "name": "Продовжуйте рух по {way_name}",
                "destination": "Продовжуйте рух у напрямку {destination}"
            },
            "sharp left": {
                "default": "Прийміть різко ліворуч",
                "name": "Прийміть різко ліворуч на {way_name}",
                "destination": "Прийміть різко ліворуч у напрямку {destination}"
            },
            "sharp right": {
                "default": "Прийміть різко праворуч",
                "name": "Прийміть різко праворуч на {way_name}",
                "destination": "Прийміть різко праворуч у напрямку {destination}"
            },
            "slight left": {
                "default": "Прийміть плавно ліворуч",
                "name": "Рухайтесь плавно ліворуч на {way_name}",
                "destination": "Рухайтесь плавно ліворуч у напрямку {destination}"
            },
            "slight right": {
                "default": "Прийміть плавно праворуч",
                "name": "Рухайтесь плавно праворуч на {way_name}",
                "destination": "Рухайтесь плавно праворуч у напрямку {destination}"
            },
            "uturn": {
                "default": "Здійсніть розворот",
                "name": "Здійсніть розворот на {way_name}",
                "destination": "Здійсніть розворот у напрямку {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Рухайтесь {modifier}",
                "name": "Рухайтесь {modifier} на {way_name}",
                "destination": "Рухайтесь {modifier} у напрямку {destination}"
            },
            "uturn": {
                "default": "Здійсніть розворот",
                "name": "Здійсніть розворот на {way_name}",
                "destination": "Здійсніть розворот у напрямку {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Рухайтесь на зʼїзд",
                "name": "Рухайтесь на зʼїзд на {way_name}",
                "destination": "Рухайтесь на зʼїзд у напрямку {destination}",
                "exit": "Оберіть з'їзд {exit}",
                "exit_destination": "Оберіть з'їзд {exit} у напрямку {destination}"
            },
            "left": {
                "default": "Рухайтесь на зʼїзд ліворуч",
                "name": "Рухайтесь на зʼїзд ліворуч на {way_name}",
                "destination": "Рухайтесь на зʼїзд ліворуч у напрямку {destination}",
                "exit": "Оберіть з'їзд {exit} ліворуч",
                "exit_destination": "Оберіть з'їзд {exit} ліворуч у напрямку {destination}"
            },
            "right": {
                "default": "Рухайтесь на зʼїзд праворуч",
                "name": "Рухайтесь на зʼїзд праворуч на {way_name}",
                "destination": "Рухайтесь на зʼїзд праворуч у напрямку {destination}",
                "exit": "Оберіть з'їзд {exit} праворуч",
                "exit_destination": "Оберіть з'їзд {exit} праворуч у напрямку {destination}"
            },
            "sharp left": {
                "default": "Рухайтесь на зʼїзд ліворуч",
                "name": "Рухайтесь на зʼїзд ліворуч на {way_name}",
                "destination": "Рухайтесь на зʼїзд ліворуч у напрямку {destination}",
                "exit": "Оберіть з'їзд {exit} ліворуч",
                "exit_destination": "Оберіть з'їзд {exit} ліворуч у напрямку {destination}"
            },
            "sharp right": {
                "default": "Рухайтесь на зʼїзд праворуч",
                "name": "Рухайтесь на зʼїзд праворуч на {way_name}",
                "destination": "Рухайтесь на зʼїзд праворуч у напрямку {destination}",
                "exit": "Оберіть з'їзд {exit} праворуч",
                "exit_destination": "Оберіть з'їзд {exit} праворуч у напрямку {destination}"
            },
            "slight left": {
                "default": "Рухайтесь на зʼїзд ліворуч",
                "name": "Рухайтесь на зʼїзд ліворуч на {way_name}",
                "destination": "Рухайтесь на зʼїзд ліворуч у напрямку {destination}",
                "exit": "Оберіть з'їзд {exit} ліворуч",
                "exit_destination": "Оберіть з'їзд {exit} ліворуч у напрямку {destination}"
            },
            "slight right": {
                "default": "Рухайтесь на зʼїзд праворуч",
                "name": "Рухайтесь на зʼїзд праворуч на {way_name}",
                "destination": "Рухайтесь на зʼїзд праворуч у напрямку {destination}",
                "exit": "Оберіть з'їзд {exit} праворуч",
                "exit_destination": "Оберіть з'їзд {exit} праворуч у напрямку {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Рухайтесь на вʼїзд",
                "name": "Рухайтесь на вʼїзд на {way_name}",
                "destination": "Рухайтесь на вʼїзд у напрямку {destination}"
            },
            "left": {
                "default": "Рухайтесь на вʼїзд ліворуч",
                "name": "Рухайтесь на вʼїзд ліворуч на {way_name}",
                "destination": "Рухайтесь на вʼїзд ліворуч у напрямку {destination}"
            },
            "right": {
                "default": "Рухайтесь на вʼїзд праворуч",
                "name": "Рухайтесь на вʼїзд праворуч на {way_name}",
                "destination": "Рухайтесь на вʼїзд праворуч у напрямку {destination}"
            },
            "sharp left": {
                "default": "Рухайтесь на вʼїзд ліворуч",
                "name": "Рухайтесь на вʼїзд ліворуч на {way_name}",
                "destination": "Рухайтесь на вʼїзд ліворуч у напрямку {destination}"
            },
            "sharp right": {
                "default": "Рухайтесь на вʼїзд праворуч",
                "name": "Рухайтесь на вʼїзд праворуч на {way_name}",
                "destination": "Рухайтесь на вʼїзд праворуч у напрямку {destination}"
            },
            "slight left": {
                "default": "Рухайтесь на вʼїзд ліворуч",
                "name": "Рухайтесь на вʼїзд ліворуч на {way_name}",
                "destination": "Рухайтесь на вʼїзд ліворуч у напрямку {destination}"
            },
            "slight right": {
                "default": "Рухайтесь на вʼїзд праворуч",
                "name": "Рухайтесь на вʼїзд праворуч на {way_name}",
                "destination": "Рухайтесь на вʼїзд праворуч у напрямку {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Рухайтесь по колу",
                    "name": "Рухайтесь по колу до {way_name}",
                    "destination": "Рухайтесь по колу в напрямку {destination}"
                },
                "name": {
                    "default": "Рухайтесь по {rotary_name}",
                    "name": "Рухайтесь по {rotary_name} та поверніть на {way_name}",
                    "destination": "Рухайтесь по {rotary_name} та поверніть в напрямку {destination}"
                },
                "exit": {
                    "default": "Рухайтесь по колу та повереніть у {exit_number} з'їзд",
                    "name": "Рухайтесь по колу та поверніть у {exit_number} з'їзд на {way_name}",
                    "destination": "Рухайтесь по колу та поверніть у {exit_number} з'їзд у напрямку {destination}"
                },
                "name_exit": {
                    "default": "Рухайтесь по {rotary_name} та поверніть у {exit_number} з'їзд",
                    "name": "Рухайтесь по {rotary_name} та поверніть у {exit_number} з'їзд на {way_name}",
                    "destination": "Рухайтесь по {rotary_name} та поверніть у {exit_number} з'їзд в напрямку {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "Рухайтесь по кільцю та повереніть у {exit_number} з'їзд",
                    "name": "Рухайтесь по кільцю та поверніть у {exit_number} з'їзд на {way_name}",
                    "destination": "Рухайтесь по кільцю та поверніть у {exit_number} з'їзд у напрямку {destination}"
                },
                "default": {
                    "default": "Рухайтесь по кільцю",
                    "name": "Рухайтесь по кільцю до {way_name}",
                    "destination": "Рухайтесь по кільцю в напрямку {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "На кільці {modifier}",
                "name": "На кільці {modifier} на {way_name}",
                "destination": "На кільці {modifier} в напрямку {destination}"
            },
            "left": {
                "default": "На кільці поверніть ліворуч",
                "name": "На кільці поверніть ліворуч на {way_name}",
                "destination": "На кільці поверніть ліворуч в напрямку {destination}"
            },
            "right": {
                "default": "На кільці поверніть праворуч",
                "name": "На кільці поверніть праворуч на {way_name}",
                "destination": "На кільці поверніть праворуч в напрямку {destination}"
            },
            "straight": {
                "default": "На кільці продовжуйте рухатись прямо",
                "name": "На кільці продовжуйте рухатись прямо на {way_name}",
                "destination": "На кільці продовжуйте рухатись прямо в напрямку {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Рухайтесь {modifier}",
                "name": "Рухайтесь {modifier} на {way_name}",
                "destination": "Рухайтесь {modifier} в напрямку {destination}"
            },
            "left": {
                "default": "Поверніть ліворуч",
                "name": "Поверніть ліворуч на {way_name}",
                "destination": "Поверніть ліворуч у напрямку {destination}"
            },
            "right": {
                "default": "Поверніть праворуч",
                "name": "Поверніть праворуч на {way_name}",
                "destination": "Поверніть праворуч у напрямку {destination}"
            },
            "straight": {
                "default": "Рухайтесь прямо",
                "name": "Рухайтесь прямо по {way_name}",
                "destination": "Рухайтесь прямо у напрямку {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Продовжуйте рух прямо"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}
},{}],15:[function(require,module,exports){
module.exports={
    "meta": {
        "capitalizeFirstLetter": true
    },
    "v5": {
        "constants": {
            "ordinalize": {
                "1": "đầu tiên",
                "2": "thứ 2",
                "3": "thứ 3",
                "4": "thứ 4",
                "5": "thứ 5",
                "6": "thú 6",
                "7": "thứ 7",
                "8": "thứ 8",
                "9": "thứ 9",
                "10": "thứ 10"
            },
            "direction": {
                "north": "bắc",
                "northeast": "đông bắc",
                "east": "đông",
                "southeast": "đông nam",
                "south": "nam",
                "southwest": "tây nam",
                "west": "tây",
                "northwest": "tây bắc"
            },
            "modifier": {
                "left": "trái",
                "right": "phải",
                "sharp left": "trái gắt",
                "sharp right": "phải gắt",
                "slight left": "trái nghiêng",
                "slight right": "phải nghiêng",
                "straight": "thẳng",
                "uturn": "ngược"
            },
            "lanes": {
                "xo": "Đi bên phải",
                "ox": "Đi bên trái",
                "xox": "Đi vào giữa",
                "oxo": "Đi bên trái hay bên phải"
            }
        },
        "modes": {
            "ferry": {
                "default": "Lên phà",
                "name": "Lên phà {way_name}",
                "destination": "Lên phà đi {destination}"
            }
        },
        "arrive": {
            "default": {
                "default": "Đến nơi {nth}"
            },
            "left": {
                "default": "Đến nơi {nth} ở bên trái"
            },
            "right": {
                "default": "Đến nơi {nth} ở bên phải"
            },
            "sharp left": {
                "default": "Đến nơi {nth} ở bên trái"
            },
            "sharp right": {
                "default": "Đến nơi {nth} ở bên phải"
            },
            "slight right": {
                "default": "Đến nơi {nth} ở bên phải"
            },
            "slight left": {
                "default": "Đến nơi {nth} ở bên trái"
            },
            "straight": {
                "default": "Đến nơi {nth} ở trước mặt"
            }
        },
        "continue": {
            "default": {
                "default": "Chạy tiếp bên {modifier}",
                "name": "Chạy tiếp bên {modifier} trên {way_name}",
                "destination": "Chạy tiếp bên {modifier} đến {destination}"
            },
            "straight": {
                "default": "Chạy thẳng",
                "name": "Chạy tiếp trên {way_name}",
                "destination": "Chạy tiếp đến {destination}"
            },
            "slight left": {
                "default": "Nghiêng về bên trái",
                "name": "Nghiêng về bên trái vào {way_name}",
                "destination": "Nghiêng về bên trái đến {destination}"
            },
            "slight right": {
                "default": "Nghiêng về bên phải",
                "name": "Nghiêng về bên phải vào {way_name}",
                "destination": "Nghiêng về bên phải đến {destination}"
            },
            "uturn": {
                "default": "Quẹo ngược lại",
                "name": "Quẹo ngược lại {way_name}",
                "destination": "Quẹo ngược đến {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Đi về hướng {direction}",
                "name": "Đi về hướng {direction} trên {way_name}"
            }
        },
        "end of road": {
            "default": {
                "default": "Quẹo {modifier}",
                "name": "Quẹo {modifier} vào {way_name}",
                "destination": "Quẹo {modifier} đến {destination}"
            },
            "straight": {
                "default": "Chạy thẳng",
                "name": "Chạy tiếp trên {way_name}",
                "destination": "Chạy tiếp đến {destination}"
            },
            "uturn": {
                "default": "Quẹo ngược lại tại cuối đường",
                "name": "Quẹo ngược vào {way_name} tại cuối đường",
                "destination": "Quẹo ngược đến {destination} tại cuối đường"
            }
        },
        "fork": {
            "default": {
                "default": "Đi bên {modifier} ở ngã ba",
                "name": "Đi bên {modifier} ở ngã ba vào {way_name}",
                "destination": "Đi bên {modifier} ở ngã ba đến {destination}"
            },
            "slight left": {
                "default": "Nghiêng về bên trái ở ngã ba",
                "name": "Nghiêng về bên trái ở ngã ba vào {way_name}",
                "destination": "Nghiêng về bên trái ở ngã ba đến {destination}"
            },
            "slight right": {
                "default": "Nghiêng về bên phải ở ngã ba",
                "name": "Nghiêng về bên phải ở ngã ba vào {way_name}",
                "destination": "Nghiêng về bên phải ở ngã ba đến {destination}"
            },
            "sharp left": {
                "default": "Quẹo gắt bên trái ở ngã ba",
                "name": "Quẹo gắt bên trái ở ngã ba vào {way_name}",
                "destination": "Quẹo gắt bên trái ở ngã ba đến {destination}"
            },
            "sharp right": {
                "default": "Quẹo gắt bên phải ở ngã ba",
                "name": "Quẹo gắt bên phải ở ngã ba vào {way_name}",
                "destination": "Quẹo gắt bên phải ở ngã ba đến {destination}"
            },
            "uturn": {
                "default": "Quẹo ngược lại",
                "name": "Quẹo ngược lại {way_name}",
                "destination": "Quẹo ngược lại đến {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Nhập sang {modifier}",
                "name": "Nhập sang {modifier} vào {way_name}",
                "destination": "Nhập sang {modifier} đến {destination}"
            },
            "slight left": {
                "default": "Nhập sang trái",
                "name": "Nhập sang trái vào {way_name}",
                "destination": "Nhập sang trái đến {destination}"
            },
            "slight right": {
                "default": "Nhập sang phải",
                "name": "Nhập sang phải vào {way_name}",
                "destination": "Nhập sang phải đến {destination}"
            },
            "sharp left": {
                "default": "Nhập sang trái",
                "name": "Nhập sang trái vào {way_name}",
                "destination": "Nhập sang trái đến {destination}"
            },
            "sharp right": {
                "default": "Nhập sang phải",
                "name": "Nhập sang phải vào {way_name}",
                "destination": "Nhập sang phải đến {destination}"
            },
            "uturn": {
                "default": "Quẹo ngược lại",
                "name": "Quẹo ngược lại {way_name}",
                "destination": "Quẹo ngược lại đến {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Chạy tiếp bên {modifier}",
                "name": "Chạy tiếp bên {modifier} trên {way_name}",
                "destination": "Chạy tiếp bên {modifier} đến {destination}"
            },
            "straight": {
                "default": "Chạy thẳng",
                "name": "Chạy tiếp trên {way_name}",
                "destination": "Chạy tiếp đến {destination}"
            },
            "sharp left": {
                "default": "Quẹo gắt bên trái",
                "name": "Quẹo gắt bên trái vào {way_name}",
                "destination": "Quẹo gắt bên trái đến {destination}"
            },
            "sharp right": {
                "default": "Quẹo gắt bên phải",
                "name": "Quẹo gắt bên phải vào {way_name}",
                "destination": "Quẹo gắt bên phải đến {destination}"
            },
            "slight left": {
                "default": "Nghiêng về bên trái",
                "name": "Nghiêng về bên trái vào {way_name}",
                "destination": "Nghiêng về bên trái đến {destination}"
            },
            "slight right": {
                "default": "Nghiêng về bên phải",
                "name": "Nghiêng về bên phải vào {way_name}",
                "destination": "Nghiêng về bên phải đến {destination}"
            },
            "uturn": {
                "default": "Quẹo ngược lại",
                "name": "Quẹo ngược lại {way_name}",
                "destination": "Quẹo ngược lại đến {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Chạy tiếp bên {modifier}",
                "name": "Chạy tiếp bên {modifier} trên {way_name}",
                "destination": "Chạy tiếp bên {modifier} đến {destination}"
            },
            "uturn": {
                "default": "Quẹo ngược lại",
                "name": "Quẹo ngược lại {way_name}",
                "destination": "Quẹo ngược lại đến {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Đi đường nhánh",
                "name": "Đi đường nhánh {way_name}",
                "destination": "Đi đường nhánh đến {destination}",
                "exit": "Đi theo lối ra {exit}",
                "exit_destination": "Đi theo lối ra {exit} về hướng {destination}"
            },
            "left": {
                "default": "Đi đường nhánh bên trái",
                "name": "Đi đường nhánh {way_name} bên trái",
                "destination": "Đi đường nhánh bên trái đến {destination}",
                "exit": "Đi theo lối ra {exit} bên trái",
                "exit_destination": "Đi theo lối ra {exit} bên trái về hướng {destination}"
            },
            "right": {
                "default": "Đi đường nhánh bên phải",
                "name": "Đi đường nhánh {way_name} bên phải",
                "destination": "Đi đường nhánh bên phải đến {destination}",
                "exit": "Đi theo lối ra {exit} bên phải",
                "exit_destination": "Đi theo lối ra {exit} bên phải về hướng {destination}"
            },
            "sharp left": {
                "default": "Đi đường nhánh bên trái",
                "name": "Đi đường nhánh {way_name} bên trái",
                "destination": "Đi đường nhánh bên trái đến {destination}",
                "exit": "Đi theo lối ra {exit} bên trái",
                "exit_destination": "Đi theo lối ra {exit} bên trái về hướng {destination}"
            },
            "sharp right": {
                "default": "Đi đường nhánh bên phải",
                "name": "Đi đường nhánh {way_name} bên phải",
                "destination": "Đi đường nhánh bên phải đến {destination}",
                "exit": "Đi theo lối ra {exit} bên phải",
                "exit_destination": "Đi theo lối ra {exit} bên phải về hướng {destination}"
            },
            "slight left": {
                "default": "Đi đường nhánh bên trái",
                "name": "Đi đường nhánh {way_name} bên trái",
                "destination": "Đi đường nhánh bên trái đến {destination}",
                "exit": "Đi theo lối ra {exit} bên trái",
                "exit_destination": "Đi theo lối ra {exit} bên trái về hướng {destination}"
            },
            "slight right": {
                "default": "Đi đường nhánh bên phải",
                "name": "Đi đường nhánh {way_name} bên phải",
                "destination": "Đi đường nhánh bên phải đến {destination}",
                "exit": "Đi theo lối ra {exit} bên phải",
                "exit_destination": "Đi theo lối ra {exit} bên phải về hướng {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Đi đường nhánh",
                "name": "Đi đường nhánh {way_name}",
                "destination": "Đi đường nhánh đến {destination}"
            },
            "left": {
                "default": "Đi đường nhánh bên trái",
                "name": "Đi đường nhánh {way_name} bên trái",
                "destination": "Đi đường nhánh bên trái đến {destination}"
            },
            "right": {
                "default": "Đi đường nhánh bên phải",
                "name": "Đi đường nhánh {way_name} bên phải",
                "destination": "Đi đường nhánh bên phải đến {destination}"
            },
            "sharp left": {
                "default": "Đi đường nhánh bên trái",
                "name": "Đi đường nhánh {way_name} bên trái",
                "destination": "Đi đường nhánh bên trái đến {destination}"
            },
            "sharp right": {
                "default": "Đi đường nhánh bên phải",
                "name": "Đi đường nhánh {way_name} bên phải",
                "destination": "Đi đường nhánh bên phải đến {destination}"
            },
            "slight left": {
                "default": "Đi đường nhánh bên trái",
                "name": "Đi đường nhánh {way_name} bên trái",
                "destination": "Đi đường nhánh bên trái đến {destination}"
            },
            "slight right": {
                "default": "Đi đường nhánh bên phải",
                "name": "Đi đường nhánh {way_name} bên phải",
                "destination": "Đi đường nhánh bên phải đến {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Đi vào bùng binh",
                    "name": "Đi vào bùng binh và ra tại {way_name}",
                    "destination": "Vào bùng binh và ra để đi {destination}"
                },
                "name": {
                    "default": "Đi vào {rotary_name}",
                    "name": "Đi vào {rotary_name} và ra tại {way_name}",
                    "destination": "Đi và {rotary_name} và ra để đi {destination}"
                },
                "exit": {
                    "default": "Đi vào bùng binh và ra tại đường {exit_number}",
                    "name": "Đi vào bùng binh và ra tại đường {exit_number} tức {way_name}",
                    "destination": "Đi vào bùng binh và ra tại đường {exit_number} đến {destination}"
                },
                "name_exit": {
                    "default": "Đi vào {rotary_name} và ra tại đường {exit_number}",
                    "name": "Đi vào {rotary_name} và ra tại đường {exit_number} tức {way_name}",
                    "destination": "Đi vào {rotary_name} và ra tại đường {exit_number} đến {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "Đi vào vòng xuyến và ra tại đường {exit_number}",
                    "name": "Đi vào vòng xuyến và ra tại đường {exit_number} tức {way_name}",
                    "destination": "Đi vào vòng xuyến và ra tại đường {exit_number} đến {destination}"
                },
                "default": {
                    "default": "Đi vào vòng xuyến",
                    "name": "Đi vào vòng xuyến và ra tại {way_name}",
                    "destination": "Đi vào vòng xuyến và ra để đi {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "Đi bên {modifier} tại vòng xuyến",
                "name": "Đi bên {modifier} tại vòng xuyến để vào {way_name}",
                "destination": "Đi bên {modifier} tại vòng xuyến để đi {destination}"
            },
            "left": {
                "default": "Quẹo trái tại vòng xuyến",
                "name": "Quẹo trái tại vòng xuyến để vào {way_name}",
                "destination": "Quẹo trái tại vòng xuyến để đi {destination}"
            },
            "right": {
                "default": "Quẹo phải tại vòng xuyến",
                "name": "Quẹo phải ti vòng xuyến để vào {way_name}",
                "destination": "Quẹo phải tại vòng xuyến để đi {destination}"
            },
            "straight": {
                "default": "Chạy thẳng tại vòng xuyến",
                "name": "Chạy thẳng tại vòng xuyến để chạy tiếp trên {way_name}",
                "destination": "Chạy thẳng tại vòng xuyến để đi {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Quẹo {modifier}",
                "name": "Quẹo {modifier} vào {way_name}",
                "destination": "Quẹo {modifier} đến {destination}"
            },
            "left": {
                "default": "Quẹo trái",
                "name": "Quẹo trái vào {way_name}",
                "destination": "Quẹo trái đến {destination}"
            },
            "right": {
                "default": "Quẹo phải",
                "name": "Quẹo phải vào {way_name}",
                "destination": "Quẹo phải đến {destination}"
            },
            "straight": {
                "default": "Chạy thẳng",
                "name": "Chạy thẳng vào {way_name}",
                "destination": "Chạy thẳng đến {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Chạy thẳng"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}
},{}],16:[function(require,module,exports){
module.exports={
    "meta": {
        "capitalizeFirstLetter": false
    },
    "v5": {
        "constants": {
            "ordinalize": {
                "1": "第一",
                "2": "第二",
                "3": "第三",
                "4": "第四",
                "5": "第五",
                "6": "第六",
                "7": "第七",
                "8": "第八",
                "9": "第九",
                "10": "第十"
            },
            "direction": {
                "north": "北",
                "northeast": "东北",
                "east": "东",
                "southeast": "东南",
                "south": "南",
                "southwest": "西南",
                "west": "西",
                "northwest": "西北"
            },
            "modifier": {
                "left": "向左",
                "right": "向右",
                "sharp left": "向左",
                "sharp right": "向右",
                "slight left": "向左",
                "slight right": "向右",
                "straight": "直行",
                "uturn": "调头"
            },
            "lanes": {
                "xo": "靠右直行",
                "ox": "靠左直行",
                "xox": "保持在道路中间直行",
                "oxo": "保持在道路两侧直行"
            }
        },
        "modes": {
            "ferry": {
                "default": "乘坐轮渡",
                "name": "乘坐{way_name}轮渡",
                "destination": "乘坐开往{destination}的轮渡"
            }
        },
        "arrive": {
            "default": {
                "default": "您已经到达您的{nth}个目的地"
            },
            "left": {
                "default": "您已经到达您的{nth}个目的地，在道路左侧"
            },
            "right": {
                "default": "您已经到达您的{nth}个目的地，在道路右侧"
            },
            "sharp left": {
                "default": "您已经到达您的{nth}个目的地，在道路左侧"
            },
            "sharp right": {
                "default": "您已经到达您的{nth}个目的地，在道路右侧"
            },
            "slight right": {
                "default": "您已经到达您的{nth}个目的地，在道路右侧"
            },
            "slight left": {
                "default": "您已经到达您的{nth}个目的地，在道路左侧"
            },
            "straight": {
                "default": "您已经到达您的{nth}个目的地，在您正前方"
            }
        },
        "continue": {
            "default": {
                "default": "继续{modifier}",
                "name": "继续{modifier}，上{way_name}",
                "destination": "继续{modifier}行驶，前往{destination}"
            },
            "uturn": {
                "default": "调头",
                "name": "调头上{way_name}",
                "destination": "调头后前往{destination}"
            }
        },
        "depart": {
            "default": {
                "default": "出发向{direction}",
                "name": "出发向{direction}，上{way_name}"
            }
        },
        "end of road": {
            "default": {
                "default": "{modifier}行驶",
                "name": "{modifier}行驶，上{way_name}",
                "destination": "{modifier}行驶，前往{destination}"
            },
            "straight": {
                "default": "继续直行",
                "name": "继续直行，上{way_name}",
                "destination": "继续直行，前往{destination}"
            },
            "uturn": {
                "default": "在道路尽头调头",
                "name": "在道路尽头调头上{way_name}",
                "destination": "在道路尽头调头，前往{destination}"
            }
        },
        "fork": {
            "default": {
                "default": "在岔道保持{modifier}",
                "name": "在岔道保持{modifier}，上{way_name}",
                "destination": "在岔道保持{modifier}，前往{destination}"
            },
            "uturn": {
                "default": "调头",
                "name": "调头，上{way_name}",
                "destination": "调头，前往{destination}"
            }
        },
        "merge": {
            "default": {
                "default": "{modifier}并道",
                "name": "{modifier}并道，上{way_name}",
                "destination": "{modifier}并道，前往{destination}"
            },
            "uturn": {
                "default": "调头",
                "name": "调头，上{way_name}",
                "destination": "调头，前往{destination}"
            }
        },
        "new name": {
            "default": {
                "default": "继续{modifier}",
                "name": "继续{modifier}，上{way_name}",
                "destination": "继续{modifier}，前往{destination}"
            },
            "uturn": {
                "default": "调头",
                "name": "调头，上{way_name}",
                "destination": "调头，前往{destination}"
            }
        },
        "notification": {
            "default": {
                "default": "继续{modifier}",
                "name": "继续{modifier}，上{way_name}",
                "destination": "继续{modifier}，前往{destination}"
            },
            "uturn": {
                "default": "调头",
                "name": "调头，上{way_name}",
                "destination": "调头，前往{destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "上匝道",
                "name": "通过匝道驶入{way_name}",
                "destination": "通过匝道前往{destination}"
            },
            "left": {
                "default": "通过左边的匝道",
                "name": "通过左边的匝道驶入{way_name}",
                "destination": "通过左边的匝道前往{destination}"
            },
            "right": {
                "default": "通过右边的匝道",
                "name": "通过右边的匝道驶入{way_name}",
                "destination": "通过右边的匝道前往{destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "通过匝道",
                "name": "通过匝道驶入{way_name}",
                "destination": "通过匝道前往{destination}"
            },
            "left": {
                "default": "通过左边的匝道",
                "name": "通过左边的匝道驶入{way_name}",
                "destination": "通过左边的匝道前往{destination}"
            },
            "right": {
                "default": "通过右边的匝道",
                "name": "通过右边的匝道驶入{way_name}",
                "destination": "通过右边的匝道前往{destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "进入环岛",
                    "name": "通过环岛后驶入{way_name}",
                    "destination": "通过环岛前往{destination}"
                },
                "name": {
                    "default": "进入{rotary_name}环岛",
                    "name": "通过{rotary_name}环岛后驶入{way_name}",
                    "destination": "通过{rotary_name}环岛后前往{destination}"
                },
                "exit": {
                    "default": "进入环岛并从{exit_number}出口驶出",
                    "name": "进入环岛后从{exit_number}出口驶出进入{way_name}",
                    "destination": "进入环岛后从{exit_number}出口驶出前往{destination}"
                },
                "name_exit": {
                    "default": "进入{rotary_name}环岛后从{exit_number}出口驶出",
                    "name": "进入{rotary_name}环岛后从{exit_number}出口驶出进入{way_name}",
                    "destination": "进入{rotary_name}环岛后从{exit_number}出口驶出前往{destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "进入环岛后从{exit_number}出口驶出",
                    "name": "进入环岛后从{exit_number}出口驶出前往{way_name}",
                    "destination": "进入环岛后从{exit_number}出口驶出前往{destination}"
                },
                "default": {
                    "default": "进入环岛",
                    "name": "通过环岛后驶入{way_name}",
                    "destination": "通过环岛后前往{destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "在环岛{modifier}行驶",
                "name": "在环岛{modifier}行驶，上{way_name}",
                "destination": "在环岛{modifier}行驶，前往{destination}"
            },
            "left": {
                "default": "在环岛左转",
                "name": "在环岛左转，上{way_name}",
                "destination": "在环岛左转，前往{destination}"
            },
            "right": {
                "default": "在环岛右转",
                "name": "在环岛右转，上{way_name}",
                "destination": "在环岛右转，前往{destination}"
            },
            "straight": {
                "default": "在环岛继续直行",
                "name": "在环岛继续直行，上{way_name}",
                "destination": "在环岛继续直行，前往{destination}"
            }
        },
        "turn": {
            "default": {
                "default": "{modifier}转弯",
                "name": "{modifier}转弯，上{way_name}",
                "destination": "{modifier}转弯，前往{destination}"
            },
            "left": {
                "default": "左转",
                "name": "左转，上{way_name}",
                "destination": "左转，前往{destination}"
            },
            "right": {
                "default": "右转",
                "name": "右转，上{way_name}",
                "destination": "右转，前往{destination}"
            },
            "straight": {
                "default": "直行",
                "name": "直行，上{way_name}",
                "destination": "直行，前往{destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "继续直行"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}

},{}],17:[function(require,module,exports){
'use strict';

/**
 * Based off of [the offical Google document](https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
 *
 * Some parts from [this implementation](http://facstaff.unca.edu/mcmcclur/GoogleMaps/EncodePolyline/PolylineEncoder.js)
 * by [Mark McClure](http://facstaff.unca.edu/mcmcclur/)
 *
 * @module polyline
 */

var polyline = {};

function encode(coordinate, factor) {
    coordinate = Math.round(coordinate * factor);
    coordinate <<= 1;
    if (coordinate < 0) {
        coordinate = ~coordinate;
    }
    var output = '';
    while (coordinate >= 0x20) {
        output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 63);
        coordinate >>= 5;
    }
    output += String.fromCharCode(coordinate + 63);
    return output;
}

/**
 * Decodes to a [latitude, longitude] coordinates array.
 *
 * This is adapted from the implementation in Project-OSRM.
 *
 * @param {String} str
 * @param {Number} precision
 * @returns {Array}
 *
 * @see https://github.com/Project-OSRM/osrm-frontend/blob/master/WebContent/routing/OSRM.RoutingGeometry.js
 */
polyline.decode = function(str, precision) {
    var index = 0,
        lat = 0,
        lng = 0,
        coordinates = [],
        shift = 0,
        result = 0,
        byte = null,
        latitude_change,
        longitude_change,
        factor = Math.pow(10, precision || 5);

    // Coordinates have variable length when encoded, so just keep
    // track of whether we've hit the end of the string. In each
    // loop iteration, a single coordinate is decoded.
    while (index < str.length) {

        // Reset shift, result, and byte
        byte = null;
        shift = 0;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        shift = result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        lat += latitude_change;
        lng += longitude_change;

        coordinates.push([lat / factor, lng / factor]);
    }

    return coordinates;
};

/**
 * Encodes the given [latitude, longitude] coordinates array.
 *
 * @param {Array.<Array.<Number>>} coordinates
 * @param {Number} precision
 * @returns {String}
 */
polyline.encode = function(coordinates, precision) {
    if (!coordinates.length) { return ''; }

    var factor = Math.pow(10, precision || 5),
        output = encode(coordinates[0][0], factor) + encode(coordinates[0][1], factor);

    for (var i = 1; i < coordinates.length; i++) {
        var a = coordinates[i], b = coordinates[i - 1];
        output += encode(a[0] - b[0], factor);
        output += encode(a[1] - b[1], factor);
    }

    return output;
};

function flipped(coords) {
    var flipped = [];
    for (var i = 0; i < coords.length; i++) {
        flipped.push(coords[i].slice().reverse());
    }
    return flipped;
}

/**
 * Encodes a GeoJSON LineString feature/geometry.
 *
 * @param {Object} geojson
 * @param {Number} precision
 * @returns {String}
 */
polyline.fromGeoJSON = function(geojson, precision) {
    if (geojson && geojson.type === 'Feature') {
        geojson = geojson.geometry;
    }
    if (!geojson || geojson.type !== 'LineString') {
        throw new Error('Input must be a GeoJSON LineString');
    }
    return polyline.encode(flipped(geojson.coordinates), precision);
};

/**
 * Decodes to a GeoJSON LineString geometry.
 *
 * @param {String} str
 * @param {Number} precision
 * @returns {Object}
 */
polyline.toGeoJSON = function(str, precision) {
    var coords = polyline.decode(str, precision);
    return {
        type: 'LineString',
        coordinates: flipped(coords)
    };
};

if (typeof module === 'object' && module.exports) {
    module.exports = polyline;
}

},{}],18:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/
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


(function() {
	
	'use strict';
	
	var getCollection = function ( objName ) {
		
		var _Array = [];
		var _ObjName = objName;
		
		var _IndexOfObjId = function ( objId ) {
			function haveObjId ( element ) {
				return element.objId === objId;
			}
			return _Array.findIndex ( haveObjId );
		};
		
		var _Add = function ( object ) {
			if ( ( ! object.objType ) || ( ! object.objType.name ) || ( object.objType.name !== _ObjName ) ) {
				throw 'invalid object name for add function';
			}
			_Array.push ( object );

			return;
		};
		
		var _GetAt = function ( objId ) {
			var index = _IndexOfObjId ( objId );
			if ( -1 === index ) {
				throw 'invalid objId for getAt function';
			}
			return _Array [ index ];
		};
		
		var _Reverse = function ( ) {
			_Array.reverse ( );
		};
		
		var _Remove = function ( objId ) {
			var index = _IndexOfObjId ( objId );
			if ( -1 === index ) {
				throw 'invalid objId for remove function';
			}
			_Array.splice ( _IndexOfObjId ( objId ), 1 );
		};
		
		var _Replace = function ( oldObjId, object ) {
			var index = _IndexOfObjId ( oldObjId );
			if ( -1 === index ) {
				throw 'invalid objId for replace function';
			}
			_Array [ index ] = object;
		};
		
		var _RemoveAll = function ( ExceptFirstLast ) {
			if ( ExceptFirstLast ) {
				_Array.splice ( 1, _Array.length - 2 );
			}
			else {
				_Array.length = 0;
			}
		};
		
		var _Swap = function ( objId, swapUp ) {
			var index = _IndexOfObjId ( objId );
			if ( ( -1 === index ) || ( ( 0 === index ) && swapUp ) || ( ( _Array.length - 1 === index ) && ( ! swapUp ) ) ) {
				throw 'invalid objId for swap function';
			}
			var tmp = _Array [ index ];
			_Array [ index ] = _Array [ index + ( swapUp ? -1 : 1  ) ];
			_Array [ index + ( swapUp ? -1 : 1  ) ] = tmp;	
		};
		
		var _Iterator = function ( ) {
			var nextIndex = -1;   
			return {
			   get value ( ) { return nextIndex < _Array.length ?  _Array [ nextIndex ] : null; },
			   get done ( ) { return ++ nextIndex  >= _Array.length; },
			   get first ( ) { return 0 === nextIndex; },
			   get last ( ) { return nextIndex  >= _Array.length - 1; }
			};
		};
		
		var _First = function ( ) {
			return _Array [ 0 ];
		};

		var _Last = function ( ) {
			return _Array [ _Array.length - 1 ];
		};
		
		var _ForEach = function ( funct ) {
			var result = null;
			var iterator = _Iterator ( );
			while ( ! iterator.done ) {
					result = funct ( iterator.value, result );
			}
			return result;
		};
		
		var _GetObject = function ( ) {
			var array = [ ];
			var iterator = _Iterator ( );
			while ( ! iterator.done ) {
				array.push ( iterator.value.object );
			}
			
			return array;
		};
		
		var _SetObject = function ( Objects ) {
			var constructor;
			_Array.length = 0;
			var newObject;
			for (var objectCounter = 0; objectCounter < Objects.length; objectCounter ++ ) {
				switch ( _ObjName ) {
					case 'Route' :
					newObject = require ( './Route' ) ( );
					break;
					case 'Note' :
					newObject = require ( './Note' ) ( );
					break;
					case 'WayPoint' :
					newObject = require ( './WayPoint' ) ( );
					break;
					case 'Maneuver' :
					newObject = require ( './Maneuver' ) ( );
					break;
					case 'ItineraryPoint' :
					newObject = require ( './ItineraryPoint' ) ( );
					break;
					default: 
					throw ( 'invalid ObjName ( ' + _ObjName +' ) in Collection._SetObject' );
				}
				newObject.object = Objects [ objectCounter ];
				_Add ( newObject );
			}
		};

		return {
			
			add : function ( object ) { 
				_Add ( object );
			},
			getAt : function ( objId ) {
				return _GetAt ( objId );
			},
			
			reverse : function ( ) {
				_Reverse ( );
			},
			
			remove : function ( objId ) {
				_Remove ( objId );
			},
			
			replace : function ( oldObjId, object ) {
				_Replace ( oldObjId, object ); 
			},
			
			removeAll : function ( ExceptFirstLast ) {
				_RemoveAll ( ExceptFirstLast );
			},
			
			swap : function ( objId, swapUp ) {
				_Swap ( objId, swapUp );
			},
			
			forEach : function ( funct ) {
				return _ForEach ( funct );
			},
			
			get iterator ( ) { 
				return _Iterator ( ); 
			},
			
			get first ( ) {
				return _First ( );
			},
			
			get last ( ) {
				return _Last ( );
			},
			
			get object ( ) { 
				return _GetObject ( );
			},
			
			set object ( Object ) {
				_SetObject ( Object );
			},
			
			get length ( ) { return _Array.length; }
			
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getCollection;
	}

} ) ( );


},{"./ItineraryPoint":21,"./Maneuver":22,"./Note":23,"./Route":26,"./WayPoint":28}],19:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/
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


(function() {
	
	'use strict';
	
	var _ObjType = require ( './ObjType' ) ( 'Geom', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );

	var getGeom = function ( ) {
		
		var _Pnts ="";
		var _Precision = 6;
		var _Color = "#000000";
		var _Weight = 5;
		
		var _ObjId = require ( './ObjId' ) ( );
		
		return {

			get pnts ( ) { return _Pnts; },
			
			set pnts ( Pnts ) { _Pnts = Pnts; },
			
			get precision ( ) { return _Precision; },
			
			set precision ( Precision ) { _Precision = Precision; },
			
			get color ( ) { return _Color; },
			
			set color ( Color ) { _Color = Color; },
			
			get weight ( ) { return _Weight; },
			
			set weight ( Weight ) { _Weight = Weight; },
			
			get objId ( ) { return _ObjId; },
			
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				return {
					pnts : _Pnts,
					precision : _Precision,
					color : _Color,
					weight : _Weight,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_Pnts = Object.pnts || '';
				_Precision = Object.precision || 6;
				_Color = Object.color || '#000000';
				_Weight = Object.weight || 5;
				_ObjId = require ( './ObjId' ) ( );
			}
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getGeom;
	}

} ) ( );

},{"../UI/Translator":40,"./ObjId":24,"./ObjType":25}],20:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/
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

(function() {
	
	'use strict';
	
	var _ObjType = require ( './ObjType' ) ( 'Itinerary', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );


	var getItinerary = function ( ) {
		
		var _ObjId = require ( './ObjId' ) ( );

		var _ItineraryPoints = require ( './Collection' ) ( 'ItineraryPoint' );

		var _Maneuvers = require ( './Collection' ) ( 'Maneuver' );
		
		return {
			
			get itineraryPoints ( ) { return _ItineraryPoints; },

			get maneuvers ( ) { return _Maneuvers; },
	 
			get objId ( ) { return _ObjId; },
			
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				return {
					itineraryPoints : _ItineraryPoints.object,
					maneuvers : _Maneuvers.object,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_ItineraryPoints.object = Object.itineraryPoints || [];
				_Maneuvers.object = Object.maneuvers || [];
				_ObjId = require ( './ObjId' ) ( );
				// rebuilding links between maneuvers and itineraryPoints
				var itineraryPointObjIdMap = new Map ( );
				var sourceCounter = 0;
				var targetIterator = _ItineraryPoints.iterator;
				while ( ! targetIterator.done ) {
					itineraryPointObjIdMap.set ( Object.itineraryPoints [ sourceCounter ].objId, targetIterator.value.objId );
					sourceCounter ++;
				}
				var maneuverIterator = _Maneuvers.iterator;
				while ( ! maneuverIterator.done ) {
					maneuverIterator.value.itineraryPointObjId = itineraryPointObjIdMap.get ( maneuverIterator.value.itineraryPointObjId );
				}
			}
		};
	};
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getItinerary;
	}

} ) ( );

},{"../UI/Translator":40,"./Collection":18,"./ObjId":24,"./ObjType":25}],21:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/
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

(function() {
	
	'use strict';
	
	var _ObjType = require ( './ObjType' ) ( 'ItineraryPoint', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );

	var getItineraryPoint = function ( ) {
		
		var _Lat = 0;
		var _Lng = 0;
		var _Distance = 0;
		var _WayPointObjId = -1;
		var _NoteObjId = -1;
		var _ManeuverObjId = -1;
		
		var _ObjId = require ( './ObjId' ) ( );
		
		return {
			
			get lat ( ) { return _Lat;},
			
			set lat ( Lat ) { _Lat = Lat; },
			
			get lng ( ) { return _Lng;},
			
			set lng ( Lng ) { _Lng = Lng; },
			
			get latLng ( ) { return [ _Lat, _Lng ];},
			
			set latLng ( LatLng ) { _Lat = LatLng [ 0 ]; _Lng = LatLng [ 1 ]; },

			get distance ( ) { return _Distance;},
			
			set distance ( Distance ) { _Distance = Distance; },
						
			get wayPointObjId ( ) { return _WayPointObjId;},
			
			set wayPointObjId ( WayPointObjId ) { _WayPointObjId = WayPointObjId; },
			
			get noteObjId ( ) { return _NoteObjId;},
			
			set noteObjId ( NoteObjId ) { _NoteObjId = NoteObjId; },
			
			get maneuverObjId ( ) { return _ManeuverObjId;},
			
			set maneuverObjId ( ManeuverObjId ) { _ManeuverObjId = ManeuverObjId; },
			
			get objId ( ) { return _ObjId; },
			
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				return {
					lat : _Lat,
					lng : _Lng,
					distance : _Distance,
					wayPointObjId : _WayPointObjId,
					noteObjId : _NoteObjId,
					maneuverObjId : _ManeuverObjId,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_Lat = Object.lat || 0;
				_Lng = Object.lng || 0;
				_Distance = Object.distance || 0;
				_WayPointObjId = Object.wayPointObjId || -1;
				_NoteObjId = Object.noteObjId || -1;
				_ManeuverObjId = Object.maneuverObjId || -1;
				_ObjId = require ( './ObjId' ) ( );
			}
		};
	};
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getItineraryPoint;
	}

} ) ( );

/* --- End of MapData.js file --- */
},{"../UI/Translator":40,"./ObjId":24,"./ObjType":25}],22:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/
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

(function() {
	
	'use strict';
	
	var _ObjType = require ( './ObjType' ) ( 'Maneuver', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );

	var getItinerary = function ( ) {
		
		var _ObjId = require ( './ObjId' ) ( );

		var _IconName = '';
		var _Instruction = '';
		var _SimplifiedInstruction = '';
		var _StreetName = '';
		var _Direction = '';
		var _ItineraryPointObjId = -1;
		var _Distance = 0;
		var _Duration = 0;
		
		return {

			get iconName ( ) { return _IconName;},
			
			set iconName ( IconName ) { _IconName = IconName; },
						
			get instruction ( ) { return _Instruction;},
			
			set instruction ( Instruction ) { _Instruction = Instruction; },
						
			get simplifiedInstruction ( ) { return _SimplifiedInstruction;},
			
			set simplifiedInstruction ( SimplifiedInstruction ) { _SimplifiedInstruction = SimplifiedInstruction; },
						
			get streetName ( ) { return _StreetName;},
			
			set streetName ( StreetName ) { _StreetName = StreetName; },
						
			get direction ( ) { return _Direction;},
			
			set direction ( Direction ) { _Direction = Direction; },
						
			get itineraryPointObjId ( ) { return _ItineraryPointObjId;},
			
			set itineraryPointObjId ( ItineraryPointObjId ) { _ItineraryPointObjId = ItineraryPointObjId; },
						
			get distance ( ) { return _Distance;},
			
			set distance ( Distance ) { _Distance = Distance; },
			
			get duration ( ) { return _Duration;},
			
			set duration ( Duration ) { _Duration = Duration; },
						
			get objId ( ) { return _ObjId; },
			
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				return {
					iconName : _IconName,
					instruction : _Instruction,
					simplifiedInstruction : _SimplifiedInstruction,
					streetName :_StreetName,
					direction :_Direction,
					distance : _Distance,
					duration : _Duration,
					itineraryPointObjId : _ItineraryPointObjId,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_IconName = Object.iconName || '';
				_Instruction = Object.instruction || '';
				_SimplifiedInstruction = Object.simplifiedInstruction || '';
				_StreetName = Object.streetName || '';
				_Direction = Object.direction || '';
				_Distance = Object.distance || 0;
				_Duration = Object.duration || 0;
				_ItineraryPointObjId = Object.itineraryPointObjId || -1;
				_ObjId = require ( './ObjId' ) ( );
			}
		};
	};
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getItinerary;
	}

} ) ( );

},{"../UI/Translator":40,"./ObjId":24,"./ObjType":25}],23:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/
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

(function() {
	
	'use strict';
	
	var _ObjType = require ( './ObjType' ) ( 'Note', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );

	var getNote = function ( ) {
		
		var _ObjId = require ( './ObjId' ) ( );

		var _IconHeight = 40;
		var _IconWidth = 40;
		var _IconContent = '';
		var _PopupContent = '';
		var _TooltipContent = '';

		var _Phone = '';
		var _Url = '';
		var _Address = '';

		var _CategoryId = '';

		var _IconLat = 0;
		var _IconLng = 0;
		var _Lat = 0;
		var _Lng = 0;
		
		return {

			get iconHeight ( ) { return _IconHeight;},
			
			set iconHeight ( IconHeight ) { _IconHeight = IconHeight; },

			get iconWidth ( ) { return _IconWidth;},
			
			set iconWidth ( IconWidth ) { _IconWidth = IconWidth; },

			get iconContent ( ) { return _IconContent;},
			
			set iconContent ( IconContent ) { _IconContent = IconContent; },

			get popupContent ( ) { return _PopupContent;},
			
			set popupContent ( PopupContent ) { _PopupContent = PopupContent; },

			get tooltipContent ( ) { return _TooltipContent;},
			
			set tooltipContent ( TooltipContent ) { _TooltipContent = TooltipContent; },

			get phone ( ) { return _Phone;},
			
			set phone ( Phone ) { _Phone = Phone; },
			
			get url ( ) { return _Url;},
			
			set url ( Url ) { _Url = Url; },
			
			get address ( ) { return _Address;},
			
			set address ( Address ) { _Address = Address; },
			
			get categoryId ( ) { return _CategoryId;},
			
			set categoryId ( CategoryId ) { _CategoryId = CategoryId; },
			
			get iconLat ( ) { return _IconLat;},
			
			set iconLat ( IconLat ) { _IconLat = IconLat; },
			
			get iconLng ( ) { return _IconLng;},
			
			set iconLng ( IconLng ) { _IconLng = IconLng; },
			
			get iconLatLng ( ) { return [ _IconLat, _IconLng ];},
			
			set iconLatLng ( IconLatLng ) { _IconLat = IconLatLng [ 0 ]; _IconLng = IconLatLng [ 1 ]; },

			get lat ( ) { return _Lat;},
			
			set lat ( Lat ) { _Lat = Lat; },
			
			get lng ( ) { return _Lng;},
			
			set lng ( Lng ) { _Lng = Lng; },
			
			get latLng ( ) { return [ _Lat, _Lng ];},
			
			set latLng ( LatLng ) { _Lat = LatLng [ 0 ]; _Lng = LatLng [ 1 ]; },
			
			get objId ( ) { return _ObjId; },
			
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				return {
					iconHeight : _IconHeight,
                    iconWidth : _IconWidth,
                    iconContent : _IconContent, 
                    popupContent : _PopupContent,
                    tooltipContent : _TooltipContent,
					phone : _Phone,
					url : _Url,
					address : _Address,
					categoryId : _CategoryId,
					iconLat : _IconLat,
					iconLng : _IconLng,
					lat : _Lat,
					lng : _Lng,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_IconHeight = Object.iconHeight || 40;
				_IconWidth = Object.iconWidth || 40;
				_IconContent = Object.iconContent || '';
				_PopupContent = Object.popupContent || '';
				_TooltipContent = Object.tooltipContent || '';
				_Phone = Object.phone || '';
				_Url = Object.url || '';
				_Address = Object.address || '';
				_CategoryId = Object.categoryId || '';
				_IconLat = Object._IconLat || 0;
				_IconLng = Object._IconLng || 0;
				_Lat = Object.lat || 0;
				_Lng = Object.lng || 0;
				_ObjId = require ( './ObjId' ) ( );
			}
		};
	};
	
	/* --- End of getNote function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getNote;
	}

} ) ( );

},{"../UI/Translator":40,"./ObjId":24,"./ObjType":25}],24:[function(require,module,exports){
(function (global){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/
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


(function() {
	
	'use strict';

	
	var getObjId = function ( ) {
		return ++ global.travelObjId;
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getObjId;
		
	}

} ) ( );

/* --- End of MapData.js file --- */
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],25:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/
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


(function() {
	
	'use strict';
	
	var getObjType = function ( name, version ) {
	
		var _Name = name;
		var _Version = version;
		
		return {
		
			get name ( ) { return _Name; },
			
			get version ( ) { return _Version; },
			
			get object ( ) {
				return {
					name : _Name,
					version : _Version
				};
			},
			validate : function ( object ) {
				if ( ! object.objType ) {
					throw 'No objType for ' + _Name;
				}
				if ( ! object.objType.name ) {
					throw 'No name for ' + _Name;
				}
				if ( _Name !== object.objType.name ) {
					throw 'Invalid name for ' + _Name;
				}
				if ( ! object.objType.version ) {
					throw 'No version for ' + _Name;
				}
				if ( _Version !== object.objType.version ) {
					throw 'invalid version for ' + _Name;
				}
				if ( ! object.objId ) {
					throw 'No objId for ' + _Name;
				}
				return object;
			}
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getObjType;
	}

} ) ( );
},{}],26:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/
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


(function() {
	
	'use strict';

	var _ObjType = require ( './ObjType' ) ( 'Route', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );

	var getRoute = function ( ) {
		
		var _Name = '';
		var _WayPoints = require ( './Collection' ) ( 'WayPoint' );
		_WayPoints.add ( require ( './Waypoint' ) ( ) );
		_WayPoints.add ( require ( './Waypoint' ) ( ) );
		
		var _Notes = require ( './Collection' ) ( 'Note' );
		
		var _Itinerary = require ( './Itinerary' ) ( );
		
		var _Geom = require ( './Geom' ) ( );
		
		var _ObjId = require ( './ObjId' ) ( );
		
		return {
			get name ( ) { return _Name; },
			set name ( Name ) { _Name = Name;},
			
			get wayPoints ( ) { return _WayPoints; },
			
			get notes ( ) { return _Notes; },
			
			get itinerary ( ) { return _Itinerary; },

			get geom ( ) { return _Geom; },
			set geom ( Geom ) { _Geom = Geom; },
			
			get objId ( ) { return _ObjId; },
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				return {
					name : _Name,
					wayPoints : _WayPoints.object,
					notes : _Notes.object,
					itinerary : _Itinerary.object,
					geom : _Geom.object,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_Name = Object.name || '';
				_WayPoints.object = Object.wayPoints || [];
				_Notes.object = Object.notes || [];
				_Itinerary.object = Object.itinerary || require ( './Itinerary' ) ( ).object;
				_Geom.object = Object.geom || require ( './Geom' ) ( ).object;
				_ObjId = require ( './ObjId' ) ( );
			}
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRoute;
	}

} ) ( );

/* --- End of MapData.js file --- */
},{"../UI/Translator":40,"./Collection":18,"./Geom":19,"./Itinerary":20,"./ObjId":24,"./ObjType":25,"./Waypoint":29}],27:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/
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


(function() {
	
	'use strict';
	
	var _ObjType = require ( './ObjType' ) ( 'TravelData', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );
	
	// one and only one object TravelData is possible
	
	var _Name = '';
	var _Routes = require ( './Collection' ) ( 'Route' );
	_Routes.add ( require ( './Route' ) ( ) );

	var _Notes = require ( './Collection' ) ( 'Note' );
	var _ObjId = -1;

	var getTravelData = function ( ) {
		
		return {
			
			get routes ( ) { return _Routes; },
			
			get notes ( ) { return _Notes; },
			
			get objId ( ) { return _ObjId; },
			
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				return {
					name : _Name,
					routes : _Routes.object,
					notes : _Notes.object,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_Name = Object.name || '';
				_Routes.object = Object.routes || [];
				_Notes.object = Object.notes || [];
				_ObjId = require ( './ObjId' ) ( );
			},
			toString : function ( ) { return this.object; }
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getTravelData;
	}

} ) ( );

/* --- End of MapData.js file --- */
},{"../UI/Translator":40,"./Collection":18,"./ObjId":24,"./ObjType":25,"./Route":26}],28:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/
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

(function() {
	
	'use strict';
	
	var _ObjType = require ( './ObjType' ) ( 'WayPoint', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );

	var getWayPoint = function ( ) {
		
		var _Name = '';
		var _Lat = 0;
		var _Lng = 0;
		
		var _ObjId = require ( './ObjId' ) ( );
		
		return {
			
			get name ( ) { return _Name; },
			
			set name ( Name ) { _Name = Name;},
			
			get UIName ( ) {
				if ( '' !== _Name ) {
					return _Name;
				}
				if ( ( 0 !== _Lat ) && ( 0 !== _Lng ) ) {
					return _Lat.toFixed ( 6 ) + ( 0 < _Lat ? ' N - ' : ' S - ' ) + _Lng.toFixed ( 6 )  + ( 0 < _Lng ? ' E' : ' W' );
				}
				return '';
			},
			
			get lat ( ) { return _Lat;},
			
			set lat ( Lat ) { _Lat = Lat; },
			
			get lng ( ) { return _Lng;},
			
			set lng ( Lng ) { _Lng = Lng; },
			
			get latLng ( ) { return [ _Lat, _Lng ];},
			
			set latLng ( LatLng ) { _Lat = LatLng [ 0 ]; _Lng = LatLng [ 1 ]; },

			get objId ( ) { return _ObjId; },
			
			get objType ( ) { return _ObjType; },
			
			get object ( ) {
				return {
					name : _Name,
					lat : _Lat,
					lng : _Lng,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_Name = Object.name || '';
				_Lat = Object.lat || 0;
				_Lng = Object.lng || 0;
				_ObjId = require ( './ObjId' ) ( );
			}
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getWayPoint;
	}

} ) ( );

/* --- End of MapData.js file --- */
},{"../UI/Translator":40,"./ObjId":24,"./ObjType":25}],29:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"../UI/Translator":40,"./ObjId":24,"./ObjType":25,"dup":28}],30:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

( function ( ){
	
	'use strict';
	
	L.Travel = L.Travel || {};
	L.travel = L.travel || {};
	
	L.Travel.Control = L.Control.extend ( {
		
			options : {
				position: 'topright'
			},
			
			initialize: function ( options ) {
					L.Util.setOptions( this, options );
			},
			
			onAdd : function ( Map ) {
				var controlElement = require ( './UI/UserInterface' ) ( ).UI;
				
				return controlElement; 
			}
		}
	);

	L.travel.control = function ( options ) {
		return new L.Travel.Control ( options );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = L.travel.control;
	}

}());

},{"./UI/UserInterface":42}],31:[function(require,module,exports){
(function (global){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

( function ( ){
	
	'use strict';
	
	
	
	L.Travel = L.Travel || {};
	L.travel = L.travel || {};
	
	var _LeftUserContextMenu = [];
	var _RightUserContextMenu = [];
	var _RightContextMenu = false;
	var _LeftContextMenu = false;

	
	/* 
	--- L.Travel.Interface object -----------------------------------------------------------------------------
	
	This object contains all you need to use Travel :-)
	
	Patterns : Closure
	------------------------------------------------------------------------------------------------------------------------
	*/

	L.Travel.getInterface = function ( ) {


		var onMapClick = function ( event ) {
			require ('./UI/ContextMenu' ) ( 
				event, 
				require ( './core/RouteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] )
				.concat ( require ( './core/NoteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] ) )
				.concat ( _LeftUserContextMenu ) 
			);
		};
		var onMapContextMenu = function ( event ) {
			require ('./UI/ContextMenu' ) (
				event, 
				require ( './core/RouteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] )
				.concat ( require ( './core/NoteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] ) )
				.concat ( _RightUserContextMenu )
			);
		};

		return {

			/* --- public methods --- */
			
			/* addControl ( ) method --- 
			
			This method add the control 
			
			Parameters :
			
			*/

			addControl : function ( map, divControlId, options ) {
				
				global.travelObjId = 0;
				global.editedRoute = require ( './Data/Route') ( );
				global.editedRoute.routeChanged = false;
				global.editedRoute.routeInitialObjId = -1;
				global.travelData = require ( './Data/TravelData' ) ( );
				
				require ( './util/Utilities' ) ( ).readURL ( );
				
				if ( divControlId )	{
					document.getElementById ( divControlId ).appendChild ( require ( './UI/UserInterface' ) ( ).UI );
				}	
				else {
					if ( typeof module !== 'undefined' && module.exports ) {
						map.addControl ( require ('./L.Travel.Control' ) ( options ) );
					}
				}
				
				require ( './UI/TravelEditorUI' ) ( ).setRoutesList ( global.travelData.routes );
				
				global.map = map;
				global.map.travelObjects = new Map ( );
			},
			
			addMapContextMenu : function ( leftButton, rightButton ) {
				if ( leftButton ) {
					global.map.on ( 'click', onMapClick );
				}
				if ( rightButton ) {
					global.map.on ( 'contextmenu', onMapClick );
				}
			},
			get rightContextMenu ( ) { return _RightContextMenu; },
			
			set rightContextMenu ( RightContextMenu ) { 
				if  ( ( RightContextMenu ) && ( ! _RightContextMenu ) ) {
					global.map.on ( 'contextmenu', onMapContextMenu );
					_RightContextMenu = true;
				}
				else if ( ( ! RightContextMenu ) && ( _RightContextMenu ) ) {
					global.map.off ( 'contextmenu', onMapContextMenu );
					_RightContextMenu = false;
				}
			},
			
			get leftContextMenu ( ) { return _LeftContextMenu; },
			
			set leftContextMenu ( LeftContextMenu ) { 
				if  ( ( LeftContextMenu ) && ( ! _LeftContextMenu ) ) {
					global.map.on ( 'click', onMapClick );
					_LeftContextMenu = true;
				}
				else if ( ( ! LeftContextMenu ) && ( _LeftContextMenu ) ) {
					global.map.off ( 'click', onMapClick );
					_LeftContextMenu = false;
				}
			},
			
			get leftUserContextMenu ( ) { return _LeftUserContextMenu; },
			
			set leftUserContextMenu ( LeftUserContextMenu ) {_LeftUserContextMenu = LeftUserContextMenu; },
			
			get rightUserContextMenu ( ) { return _RightUserContextMenu; },
			
			set rightUserContextMenu ( RightUserContextMenu ) {_RightUserContextMenu = RightUserContextMenu; },
			
			get version ( ) { return '1.0.0'; }
		};
	};
	
	/* --- End of L.Travel.Interface object --- */		

	L.travel.interface = function ( ) {
		return L.Travel.getInterface ( );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = L.travel.interface;
	}

}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Data/Route":26,"./Data/TravelData":27,"./L.Travel.Control":30,"./UI/ContextMenu":33,"./UI/TravelEditorUI":41,"./UI/UserInterface":42,"./core/NoteEditor":47,"./core/RouteEditor":48,"./util/Utilities":63}],32:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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
To do: translations
*/

( function ( ){
	
	'use strict';

	var _Translator = require ( '../UI/Translator' ) ( );
	var _OkButtonListener = null;
	
	var getBaseDialog = function ( ) {
		
		_OkButtonListener = null;
		
		var dialogObjId = require ( '../data/ObjId' ) ( );

		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		var body = document.getElementsByTagName('body') [0];
		var backgroundDiv = htmlElementsFactory.create ( 'div', { id: 'TravelNotes-BaseDialog-BackgroundDiv', className : 'TravelNotes-BaseDialog-BackgroundDiv'} , body );
		backgroundDiv.addEventListener ( 
			'dragover', 
			function ( event ) {
				return;
			},
			false
		);	
		backgroundDiv.addEventListener ( 
			'drop', 
			function ( event ) {
				return;
			},
			false
		);	

		var screenWidth = backgroundDiv.clientWidth;
		var screenHeight = backgroundDiv.clientHeight;
		
		var startDragX = 0;
		var startDragY = 0;
		
		var dialogX = 0;
		var dialogY = 0;

		var dialogContainer = htmlElementsFactory.create ( 
			'div',
			{ 
				id : 'TravelNotes-BaseDialog-Container-' + dialogObjId,
				className : 'TravelNotes-BaseDialog-Container',
			},
			backgroundDiv
		);
		var topBar = htmlElementsFactory.create ( 
			'div',
			{ 
				id : 'TravelNotes-BaseDialog-TopBar',
				className : 'TravelNotes-BaseDialog-TopBar',
				draggable : true
			},
			dialogContainer
		);
		var cancelButton = htmlElementsFactory.create ( 
			'div',
			{ 
				innerHTML: '&#x274c', 
				id : 'TravelNotes-BaseDialog-CancelButton',
				title : _Translator.getText ( "DialogBase - close" )
			},
			topBar
		);
		topBar.addEventListener ( 
			'dragstart', 
			function ( event ) {
				try {
					event.dataTransfer.setData ( 'Text', '1' );
				}
				catch ( e ) {
				}
				startDragX = event.screenX;
				startDragY = event.screenY;
			},
			false
		);	
		topBar.addEventListener ( 
			'dragend', 
			function ( event ) {
				dialogX += event.screenX - startDragX;
				dialogY += event.screenY - startDragY;
				dialogContainer.setAttribute ( "style", "top:" + dialogY + "px;left:" + dialogX +"px;" );
			},
			false 
		);
		cancelButton.addEventListener ( 
			'click',
			function ( ) {
				document.getElementsByTagName('body') [0].removeChild ( backgroundDiv );
			},
			false
		);
		var headerDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-HeaderDiv',
			},
			dialogContainer
		);		
		
		var contentDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-ContentDiv',
			},
			dialogContainer
		);
		
		var footerDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-BaseDialog-FooterDiv',
			},
			dialogContainer
		);
		var okButton = htmlElementsFactory.create ( 
			'div',
			{ 
				innerHTML: '&#x1f4be;', 
				id : 'TravelNotes-BaseDialog-OkButton',
				className : 'TravelNotes-BaseDialog-Button'
			},
			footerDiv
		);
		okButton.addEventListener ( 
			'click',
			function ( ) {
				if ( _OkButtonListener ) {
					_OkButtonListener ( );
				}
				document.getElementsByTagName('body') [0].removeChild ( backgroundDiv );
			},
			false
		);				
		
		return {
			addClickOkButtonEventListener : function ( listener ) {
				_OkButtonListener = listener;
			},
			
			get title ( ) { return headerDiv.innerHTML; },
			set title ( Title ) { headerDiv.innerHTML = Title; },
			center : function ( ) {
				dialogY = ( screenHeight - dialogContainer.clientHeight ) / 2;
				dialogX = ( screenWidth - dialogContainer.clientWidth ) / 2;
				dialogContainer.setAttribute ( "style", "top:" + dialogY + "px;left:" + dialogX +"px;" );
			},

			get header ( ) { return headerDiv;},
			set header ( Header ) { headerDiv = Header; },
			
			get content ( ) { return contentDiv;},
			set content ( Content ) { contentDiv = Content; },

			get footer ( ) { return footerDiv;},
			set footer ( Footer ) { footerDiv = Footer; }
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getBaseDialog;
	}

}());

},{"../UI/Translator":40,"../data/ObjId":57,"./HTMLElementsFactory":35}],33:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

( function ( ){
	
	'use strict';
	
	var _Translator = require ( './Translator' ) ( );
	var _MenuItems = [];
	var _ContextMenuContainer = null;
	var _OriginalEvent = null;
	var _FocusIsOnItem = 0;
	var _Lat = 0;
	var _Lng = 0;
	
	var onCloseMenu = function ( ) {
		document.removeEventListener ( 'keydown', onKeyDown, true );
		document.removeEventListener ( 'keypress', onKeyPress, true );
		document.removeEventListener ( 'keyup', onKeyUp, true );
		var childNodes = _ContextMenuContainer.childNodes;
		childNodes [ 0 ].firstChild.removeEventListener ( 'click', onCloseMenu, false );
		for ( var childNodesCounter = 1; childNodesCounter < childNodes.length; childNodesCounter ++ ) {
			childNodes [ childNodesCounter ].firstChild.removeEventListener ( 'click', onCloseMenu, false );
		}
		
		document.getElementsByTagName('body') [0].removeChild ( _ContextMenuContainer );
		_ContextMenuContainer = null;
	};
	
	var onKeyDown = function ( keyBoardEvent ) {
		if ( _ContextMenuContainer ) {
			keyBoardEvent.preventDefault ( );
			keyBoardEvent.stopPropagation ( );
		}
		if ( 'Escape' === keyBoardEvent.key || 'Esc' === keyBoardEvent.key ) {
			onCloseMenu ( );
		}
		if ( 'ArrowDown' === keyBoardEvent.key  || 'ArrowRight' === keyBoardEvent.key  ||  'Tab' === keyBoardEvent.key ){
			_FocusIsOnItem ++;
			if ( _FocusIsOnItem > _MenuItems.length ) {
				_FocusIsOnItem = 1;
			}
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus( );
		}
		if ( 'ArrowUp' === keyBoardEvent.key  || 'ArrowLeft' === keyBoardEvent.key ){
			_FocusIsOnItem --;
			if ( _FocusIsOnItem < 1 ) {
				_FocusIsOnItem = _MenuItems.length;
			}
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus( );
		}
		if ( 'Home' === keyBoardEvent.key ) {
			_FocusIsOnItem = 1;
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus( );
		}
		if ( 'End' === keyBoardEvent.key ) {
			_FocusIsOnItem = _MenuItems.length;
			_ContextMenuContainer.childNodes [ _FocusIsOnItem ].firstChild.focus( );
		}
		if ( ( 'Enter' === keyBoardEvent.key )  && ( _FocusIsOnItem > 0 ) && ( _MenuItems[ _FocusIsOnItem - 1 ].action ) ) {
			_MenuItems[ _FocusIsOnItem - 1 ].action ( );
			onCloseMenu ( );
		}
			
	};
	
	var onKeyPress = function ( keyBoardEvent ) {
		keyBoardEvent.preventDefault ( );
		keyBoardEvent.stopPropagation ( );
	};
	
	var onKeyUp = function ( keyBoardEvent ) {
		keyBoardEvent.preventDefault ( );
		keyBoardEvent.stopPropagation ( );
	};

	var onClickItem = function ( event ) {
		event.stopPropagation ( );
		_MenuItems[ event.target.menuItem ].action.call ( 
			_MenuItems[ event.target.menuItem ].context,
			_MenuItems[ event.target.menuItem ].param ? _MenuItems[ event.target.menuItem ].param : _OriginalEvent
		);
		onCloseMenu ( );
	};
	
	var getContextMenu = function ( event, userMenu ) {

	// stopPropagation ( ) and preventDefault ( ) are not working correctly on leaflet events, so the event continue...
	// to avoid the menu close directly, we compare the lat and lng of the event with the lat and lng of the previous event
	// and we stop the procedure if equals.
		if  ( ( event.latlng.lat === _Lat ) && ( event.latlng.lng === _Lng ) ) {
			_Lat = 0;
			_Lng = 0;
			return;
		}
		else
		{
			_Lat = event.latlng.lat;
			_Lng = event.latlng.lng;
		}
		
		_OriginalEvent = event; 
		
		if ( _ContextMenuContainer ) {
			onCloseMenu ( );
			return;
		}
		_MenuItems = userMenu;
			
		//ContextMenu-Container
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		var body = document.getElementsByTagName('body') [0];
		var tmpDiv = htmlElementsFactory.create ( 'div', { className : 'ContextMenu-Panel'} , body );
		var screenWidth = tmpDiv.clientWidth;
		var screenHeight = tmpDiv.clientHeight;
		body.removeChild ( tmpDiv );
		
		_ContextMenuContainer = htmlElementsFactory.create ( 'div', { id : 'ContextMenu-Container',className : 'ContextMenu-Container'}, body );
		
		var closeButton = htmlElementsFactory.create ( 
			'div',
			{ 
				innerHTML: '&#x274c', 
				className : 'ContextMenu-CloseButton',
				title : _Translator.getText ( "ContextMenu - close" )
			},
			_ContextMenuContainer
		);
		closeButton.addEventListener ( 'click', onCloseMenu, false );
		
		for ( var menuItemCounter = 0; menuItemCounter < _MenuItems.length; menuItemCounter ++ ) {
			var itemContainer = htmlElementsFactory.create ( 'div', { className : 'ContextMenu-ItemContainer'},_ContextMenuContainer);
			var item = htmlElementsFactory.create ( 
				'button', 
				{ 
					innerHTML : _MenuItems [ menuItemCounter ].name,
					id : 'ContextMenu-Item' + menuItemCounter,
					className : _MenuItems [ menuItemCounter ].action ? 'ContextMenu-Item' : 'ContextMenu-Item ContextMenu-ItemDisabled'
				},
				itemContainer
			);
			if ( _MenuItems [ menuItemCounter ].action ) {
				item.addEventListener ( 'click', onClickItem, false );
			}
			item.menuItem = menuItemCounter;
		}
		
		var menuTop = Math.min ( event.originalEvent.clientY, screenHeight - _ContextMenuContainer.clientHeight - 20 );
		var menuLeft = Math.min ( event.originalEvent.clientX, screenWidth - _ContextMenuContainer.clientWidth - 20 );
		_ContextMenuContainer.setAttribute ( "style", "top:" + menuTop + "px;left:" + menuLeft +"px;" );
		document.addEventListener ( 'keydown', onKeyDown, true );
		document.addEventListener ( 'keypress', onKeyPress, true );
		document.addEventListener ( 'keyup', onKeyUp, true );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getContextMenu;
	}

}());

},{"./HTMLElementsFactory":35,"./Translator":40}],34:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

( function ( ){
	
	'use strict';

	var _Translator = require ( './Translator' ) ( );
	
	var onClickExpandButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		if ( ! document.getElementById ( 'TravelControl-ErrorDataDiv' ).innerHTML.length ) {
			return;
		}	
		document.getElementById ( 'TravelControl-ErrorDataDiv' ).classList.toggle ( 'TravelControl-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelControl-ErrorDataDiv' ).classList.contains ( 'TravelControl-HiddenList' );
		document.getElementById ( 'TravelControl-ErrorExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25b2;';
		document.getElementById ( 'TravelControl-ErrorExpandButton' ).title = hiddenList ? _Translator.getText ( 'ErrorEditorUI - Show' ) : _Translator.getText ( 'ErrorEditorUI - Hide' );
	};

	// User interface

	var getErrorEditorUI = function ( ) {
				
		var _CreateUI = function ( controlDiv ){ 
		
			if ( document.getElementById ( 'TravelControl-ErrorDataDiv' ) ) {
				return;
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			htmlElementsFactory.create ( 'div', { id : 'TravelControl-ErrorDataDiv', className : 'TravelControl-DataDiv TravelControl-HiddenList'}, controlDiv );
			
			var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-ErrorHeaderDiv', className : 'TravelControl-HeaderDiv'}, controlDiv );
			var expandButton = htmlElementsFactory.create (
				'span',
				{ 
					innerHTML : '&#x25b6;',
					title : _Translator.getText ( 'ErrorEditorUI - Show' ),
					id : 'TravelControl-ErrorExpandButton',
					className : 'TravelControl-ExpandButton'
				},
				headerDiv );
			expandButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : 'Erreurs&nbsp;:', id : 'TravelControl-ErrorHeaderText', className : 'TravelControl-HeaderText'}, headerDiv );
			
		};

		var _ExpandUI = function ( ) {
			document.getElementById ( 'TravelControl-ErrorExpandButton' ).innerHTML = '&#x25b2;';
			document.getElementById ( 'TravelControl-ErrorExpandButton' ).title = _Translator.getText ( 'ErrorEditorUI - Hide' );
			document.getElementById ( 'TravelControl-ErrorDataDiv' ).classList.remove ( 'TravelControl-HiddenList' );
		};
		
		var _ReduceUI = function ( ) {
			document.getElementById ( 'TravelControl-ErrorExpandButton' ).innerHTML = '&#x25b6;';
			document.getElementById ( 'TravelControl-ErrorExpandButton' ).title = _Translator.getText ( 'ErrorEditorUI - Show' );
			document.getElementById ( 'TravelControl-ErrorDataDiv' ).add ( 'TravelControl-HiddenList' );
		};

		return {
			
			createUI : function ( controlDiv ) { 
				_CreateUI ( controlDiv ); 
			},
	
			expand : function ( ) {
				_ExpandUI ( );
			},
			
			reduce : function ( ) {
				_ReduceUI ( );
			},
			
			set message ( Message ) { document.getElementById ( 'TravelControl-ErrorDataDiv' ).innerHTML = Message; },
			
			get message (  ) { return document.getElementById ( 'TravelControl-ErrorDataDiv' ).innerHTML; }
			
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getErrorEditorUI;
	}

}());

},{"./HTMLElementsFactory":35,"./Translator":40}],35:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

( function ( ){
	
	'use strict';
	
	/* 
	--- HTMLElementsFactory object -----------------------------------------------------------------------------
	
	Patterns : Closure
	------------------------------------------------------------------------------------------------------------------------
	*/

	var getHTMLElementsFactory = function ( ) {

		return {
			create : function ( tagName, properties, parentNode ) {
				var element;
				if ( 'text' === tagName.toLowerCase ( ) ) {
					element = document.createTextNode ( '' );
				}
				else {
					element = document.createElement ( tagName );
				}
				if ( parentNode ) {
					parentNode.appendChild ( element );
				}
				if ( properties )
				{
					for ( var property in properties ) {
						try {
							element [ property ] = properties [ property ];
						}
						catch ( e ) {
							console.log ( "Invalid property : " + property );
						}
					}
				}
				return element;
			}
			
		};
			
	};

	/* --- End of L.Travel.ControlUI object --- */		

	var HTMLElementsFactory = function ( ) {
		return getHTMLElementsFactory ( );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = HTMLElementsFactory;
	}

}());

},{}],36:[function(require,module,exports){
(function (global){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

( function ( ){
	
	'use strict';
	
	var _Translator = require ( './Translator' ) ( );
	var _Utilities = require ( '../util/Utilities' ) ( );

	var onClickExpandButton = function ( clickEvent ) {
		
		clickEvent.stopPropagation ( );

		document.getElementById ( 'TravelControl-ItineraryHeaderDiv' ).classList.toggle ( 'TravelControl-SmallHeader' );
		document.getElementById ( 'TravelControl-ItineraryDataDiv' ).classList.toggle ( 'TravelControl-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelControl-ItineraryDataDiv' ).classList.contains ( 'TravelControl-HiddenList' );
		document.getElementById ( 'TravelControl-ItineraryExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25bc;';
		document.getElementById ( 'TravelControl-ItineraryExpandButton' ).title = hiddenList ? _Translator.getText ( 'ItineraryEditorUI - Show' ) : _Translator.getText ( 'ItineraryEditorUI - Hide' );

	};
	
	var onInstructionClick = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		require ( '../core/MapEditor' ) ( ).zoomToItineraryPoint ( clickEvent.target.itineraryPointObjId );
	};

	var onInstructionContextMenu = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		clickEvent.preventDefault ( );
	};

	var onInstructionMouseEnter = function ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		require ( '../core/MapEditor' ) ( ).addItineraryPointMarker ( mouseEvent.target.itineraryPointObjId );
	};

	var onInstructionMouseLeave = function ( mouseEvent ) {
		mouseEvent.stopPropagation ( );
		require ( '../core/MapEditor' ) ( ).removeObject ( mouseEvent.target.itineraryPointObjId );
	};

	var getItineraryEditorUI = function ( ) {
		
		var _CreateUI = function ( controlDiv ) {
			
			if ( document.getElementById ( 'TravelControl-ItineraryDataDiv' ) ) {
				return;
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;

			var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-ItineraryHeaderDiv', className : 'TravelControl-HeaderDiv'}, controlDiv );
			var expandButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc;', id : 'TravelControl-ItineraryExpandButton', className : 'TravelControl-ExpandButton'}, headerDiv );
			expandButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 
				'span', 
				{ 
					innerHTML : _Translator.getText ( 'ItineraryEditorUI - Itinerary and notes' ), 
					id : 'TravelControl-ItineraryHeaderText', 
					className : 'TravelControl-HeaderText'
				},
				headerDiv 
			);
			var dataDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-ItineraryDataDiv', className : 'TravelControl-DataDiv'}, controlDiv );
		};
		
		var _AddEventListeners = function ( element )
		{
			element.addEventListener ( 'click' , onInstructionClick, false );
			element.addEventListener ( 'contextmenu' , onInstructionContextMenu, false );
			element.addEventListener ( 'mouseenter' , onInstructionMouseEnter, false );
			element.addEventListener ( 'mouseleave' , onInstructionMouseLeave, false );
		};
		
		var _RemoveEventListeners = function ( element )
		{
			element.removeEventListener ( 'click' , onInstructionClick, false );
			element.removeEventListener ( 'contextmenu' , onInstructionContextMenu, false );
			element.removeEventListener ( 'mouseenter' , onInstructionMouseEnter, false );
			element.removeEventListener ( 'mouseleave' , onInstructionMouseLeave, false );
		};
		
		var _SetItinerary = function ( ) {

			var itinerary = global.editedRoute.itinerary;
			
			var dataDiv = document.getElementById ( 'TravelControl-ItineraryDataDiv' );
			if ( ! dataDiv ) {
				return;
			}
			
			var maneuverList = document.getElementById ( 'TravelControl-ManeuverList' );
			if ( maneuverList ) {
				for ( var childCounter = 0; childCounter < maneuverList.childNodes.length; childCounter ++ ) {
					_RemoveEventListeners ( maneuverList.childNodes [ childCounter ] );
				}
				dataDiv.removeChild ( maneuverList );
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			maneuverList = htmlElementsFactory.create (
				'div',
					{
						id : 'TravelControl-ManeuverList',
						className : 'TravelControl-TableDataDiv'
					}, 
				dataDiv
			);
			var maneuverIterator = itinerary.maneuvers.iterator;
			while ( ! maneuverIterator.done ) {
				var rowDataDiv = htmlElementsFactory.create ( 
					'div', 
					{ className : 'TravelControl-RowDataDiv'}, 
					maneuverList
				);
				
				htmlElementsFactory.create (
					'div',
					{ 
						className : 'TravelControl-CellDataDiv TravelControl-iconCellDataDiv TravelControl-' + maneuverIterator.value.iconName + 'Small',
					}, 
					rowDataDiv
				);
				
				var instructionElement = htmlElementsFactory.create (
					'div',
					{ 
						className : 'TravelControl-CellDataDiv',
						innerHTML : maneuverIterator.value.simplifiedInstruction
					}, 
					rowDataDiv
				);
				instructionElement.itineraryPointObjId = maneuverIterator.value.itineraryPointObjId;
				_AddEventListeners ( instructionElement );
				htmlElementsFactory.create (
					'div',
					{ 
						className : 'TravelControl-CellDataDiv TravelControl-ItineraryStreetName',
						innerHTML : maneuverIterator.value.streetName
					}, 
					rowDataDiv
				);
				htmlElementsFactory.create (
					'div',
					{ 
						className : 'TravelControl-CellDataDiv',
						innerHTML : maneuverIterator.value.direction
					}, 
					rowDataDiv
				);
				htmlElementsFactory.create (
					'div',
					{ 
						className : 'TravelControl-CellDataDiv TravelControl-ItineraryDistance',
						innerHTML : _Utilities.formatDistance ( maneuverIterator.value.distance )
					}, 
					rowDataDiv
				);
				htmlElementsFactory.create (
					'div',
					{ 
						className : 'TravelControl-CellDataDiv',
						innerHTML : _Utilities.formatTime ( maneuverIterator.value.duration )
					}, 
					rowDataDiv
				);
			}

		};

		return {
			createUI : function ( controlDiv ) { 
				_CreateUI ( controlDiv ); 
			},
			setItinerary : function ( ) { _SetItinerary ( ); }
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getItineraryEditorUI;
	}

}());
	
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../core/MapEditor":45,"../util/Utilities":63,"./HTMLElementsFactory":35,"./Translator":40}],37:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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
To do: translations
*/

( function ( ){
	
	'use strict';

	var _Translator = require ( '../UI/Translator' ) ( );
	
	var styles = [];
	
	var _Note;
	
	var onOkButtonClick = function ( ) {
		console.log ( 'onOkButtonClick' );
		_Note.iconWidth = document.getElementById ( 'TravelNotes-NoteDialog-WidthNumberInput' ).value;
		_Note.iconHeight = document.getElementById ( 'TravelNotes-NoteDialog-HeightNumberInput' ).value;
		_Note.iconContent = document.getElementById ( 'TravelNotes-NoteDialog-TextArea-IconHtmlContent' ).value;
		_Note.popupContent = document.getElementById ( 'TravelNotes-NoteDialog-TextArea-PopupContent' ).value;
		_Note.tooltipContent = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Tooltip' ).value;
		_Note.address = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Adress' ).value;
		_Note.url = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Link' ).value;
		_Note.phone = document.getElementById ( 'TravelNotes-NoteDialog-InputText-Phone' ).value;
		require ( '../core/NoteEditor') ( ).addNote ( _Note );
	};

	var getNoteDialog = function ( note ) {
		
		_Note = note;

		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;

		// the dialog base is created
		var baseDialog = require ( '../UI/BaseDialog' ) ( );
		baseDialog.title = _Translator.getText ( 'NoteDialog - Title' );
		baseDialog.addClickOkButtonEventListener ( onOkButtonClick );
		
		// Toolbar
		var toolbarDiv = htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-ToolbarDiv',
				id : 'TravelNotes-NoteDialog-ToolbarDiv'
			},
			baseDialog.content
		);

		// function to add buttons on the toolbar from a object
		var addEditorButtons = function ( buttons ) {
			buttons.forEach ( 
				function ( button ) {
					var newButton = htmlElementsFactory.create ( 
						'button',
						{
							type : 'button',
							innerHTML : button.title || '?',
							htmlBefore : button.htmlBefore || '',
							htmlAfter : button.htmlAfter || '',
							className : 'TravelNotes-NoteDialog-EditorButton'
						},
						toolbarDiv
					);
					newButton.addEventListener ( 'click', onInsertStyle, false );
				}
			);
		};

		// open style button ... with the well know hack to hide the file input ( a div + an input + a fake div + a button )
		var openStyleDiv = htmlElementsFactory.create ( 
			'div', 
			{ 
				id: 'TravelNotes-NoteDialog-OpenStyleDiv'
			}, 
			toolbarDiv 
		);
		var openStyleInput = htmlElementsFactory.create ( 
			'input',
			{
				id : 'TravelNotes-NoteDialog-OpenStyleInput', 
				type : 'file',
				accept : '.json'
			},
			openStyleDiv
		);
		openStyleInput.addEventListener ( 
			'change', 
			function ( event ) {
				var fileReader = new FileReader( );
				fileReader.onload = function ( event ) {
					var newStyles = JSON.parse ( fileReader.result ) ;
					addEditorButtons ( newStyles );
					styles = styles.concat ( newStyles );
					console.log ( styles );
				};
				var fileName = event.target.files [ 0 ].name;
				fileReader.readAsText ( event.target.files [ 0 ] );
			},
			false
		);
		var openStyleFakeDiv = htmlElementsFactory.create ( 
			'div', 
			{ 
				id: 'TravelNotes-NoteDialog-OpenStyleFakeDiv'
			}, 
			openStyleDiv 
		);
		var openStyleButton = htmlElementsFactory.create ( 
			'div', 
			{ 
				id : 'TravelNotes-NoteDialog-OpenStyleButton', 
				className: 'TravelNotes-BaseDialog-Button', 
				title : _Translator.getText ( 'TravelEditorUI - Open travel' ), 
				innerHTML : '&#x23CD;'
			}, 
			openStyleFakeDiv 
		);
		openStyleButton.addEventListener ( 'click' , function ( ) { openStyleInput.click ( ); }, false );
	
		// event handler for edition with the styles buttons
		var focusControl = null;
		var onInsertStyle = function ( event ) {
			if ( ! focusControl ) {
				return;
			}
			var bInsertBeforeAndAfter = event.target.htmlAfter && 0 < event.target.htmlAfter.length;
			var selectionStart = focusControl.selectionStart;
			var selectionEnd = focusControl.selectionEnd;
			var oldText = focusControl.value;
			focusControl.value = oldText.substring ( 0, selectionStart ) + 
				( bInsertBeforeAndAfter ? event.target.htmlBefore + oldText.substring ( selectionStart, selectionEnd ) + event.target.htmlAfter : event.target.htmlBefore ) + 
				oldText.substring ( selectionEnd );
			focusControl.setSelectionRange ( 
				bInsertBeforeAndAfter || selectionStart === selectionEnd ? selectionStart + event.target.htmlBefore.length : selectionStart,
				( bInsertBeforeAndAfter ? selectionEnd : selectionStart ) + event.target.htmlBefore.length );
			focusControl.focus ( );
		};	
		
		// standard buttons for div, p, span and a
		addEditorButtons (
			[
				{
					title : 'div',
					htmlBefore : '<div>',
					htmlAfter :  '</div>'
				},
				{
					title : 'p',
					htmlBefore : '<p>',
					htmlAfter : '</p>'
				},
				{
					title : 'span',
					htmlBefore : '<span>',
					htmlAfter : '</span>'
				},
				{
					title : 'a',
					htmlBefore : '<a target="_blank" href="">',
					htmlAfter : '</a>'
				},
			]
		);
		
		// personnalised buttons are restored
		addEditorButtons ( styles );

		// radio buttons for the icon type...
		var iconRadioButtonDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv',
				id : 'TravelNotes-NoteDialog-IconTypeDataDiv'
			},
			baseDialog.content
		);
		
		// ...for the standard icons
		htmlElementsFactory.create (
			'text',
			{
				data : _Translator.getText ( 'NoteDialog - Standard icon'),
			},
			iconRadioButtonDiv
		);
		var iconRadioStandardInput = htmlElementsFactory.create (
			'input',
			{
				type : 'radio',
				className : 'TravelNotes-NoteDialog-RadioInput',
				id : 'TravelNotes-NoteDialog-RadioStandardInput'
			},
			iconRadioButtonDiv
		);
		// event handler for the radio button 
		iconRadioStandardInput.addEventListener (
			'click',
			function ( event ) {
				document.getElementById ( 'TravelNotes-NoteDialog-DimensionsDataDiv' ).classList.add ( 'TravelNotes-NoteDialog-Hidden' );
				document.getElementById ( 'TravelNotes-NoteDialog-TextArea-IconHtmlContent' ).classList.add ( 'TravelNotes-NoteDialog-Hidden' );
				document.getElementById ( 'TravelNotes-NoteDialog-IconContentTitleDiv' ).classList.add ( 'TravelNotes-NoteDialog-Hidden' );
				document.getElementById ( 'TravelNotes-NoteDialog-IconsListDataDiv' ).classList.remove ( 'TravelNotes-NoteDialog-Hidden' );
				document.getElementById ( 'TravelNotes-NoteDialog-RadioPersonnelInput' ).checked = false;
			},
			false
		);
			
		// ...and for the personnalzed icons
		htmlElementsFactory.create (
			'text',
			{
				data : _Translator.getText ( 'NoteDialog - Personnel icon' ),
			},
			iconRadioButtonDiv
		);
		var iconRadioPersonnalisedButton = htmlElementsFactory.create (
			'input',
			{
				type : 'radio',
				className : 'TravelNotes-NoteDialog-RadioInput',
				id : 'TravelNotes-NoteDialog-RadioPersonnelInput'
			},
			iconRadioButtonDiv
		);
		// event handler for the radio button 
		iconRadioPersonnalisedButton.addEventListener (
			'click',
			function ( event ) {
				document.getElementById ( 'TravelNotes-NoteDialog-DimensionsDataDiv' ).classList.remove ( 'TravelNotes-NoteDialog-Hidden' );
				document.getElementById ( 'TravelNotes-NoteDialog-TextArea-IconHtmlContent' ).classList.remove ( 'TravelNotes-NoteDialog-Hidden' );
				document.getElementById ( 'TravelNotes-NoteDialog-IconContentTitleDiv' ).classList.remove ( 'TravelNotes-NoteDialog-Hidden' );
				document.getElementById ( 'TravelNotes-NoteDialog-IconsListDataDiv' ).classList.add ( 'TravelNotes-NoteDialog-Hidden' );
				document.getElementById ( 'TravelNotes-NoteDialog-RadioStandardInput' ).checked = false;
			},
			false
		);
		
		// standard icons list
		var iconListDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv',
				id : 'TravelNotes-NoteDialog-IconsListDataDiv'
			},
			baseDialog.content
		);
		htmlElementsFactory.create (
			'text',
			{
				data : _Translator.getText ( 'NoteDialog - Choose an icon'),
			},
			iconListDiv
		);
		var styleSelect = htmlElementsFactory.create (
			'select',
			{
				className : 'TravelNotes-NoteDialog-Select',
				id : 'TravelNotes-NoteDialog-IconSelect'
			},
			iconListDiv
		);
		
		// icon dimensions...
		var iconDimensionsDiv = htmlElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-NoteDialog-DataDiv',
				id : 'TravelNotes-NoteDialog-DimensionsDataDiv'
			},
			baseDialog.content
		);
		
		// ... width ...
		htmlElementsFactory.create (
			'text',
			{
				data : _Translator.getText ( 'NoteDialog - Icon width'),
			},
			iconDimensionsDiv
		);
		var widthInput =  htmlElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-NoteDialog-NumberInput',
				id : 'TravelNotes-NoteDialog-WidthNumberInput'
				
			},
			iconDimensionsDiv
		);
		widthInput.value = note.iconWidth;
		
		// ... and height
		htmlElementsFactory.create (
			'text',
			{
				data : _Translator.getText ( 'NoteDialog - Icon height'),
			},
			iconDimensionsDiv
		);
		var heightInput =  htmlElementsFactory.create (
			'input',
			{
				type : 'number',
				className : 'TravelNotes-NoteDialog-NumberInput',
				id : 'TravelNotes-NoteDialog-HeightNumberInput'
			},
			iconDimensionsDiv
		);
		heightInput.value = note.iconHeight;
		
		// icon content
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				id : 'TravelNotes-NoteDialog-IconContentTitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - IconHtmlContentTitle' )
			},
			baseDialog.content
		);
		var iconHtmlContent = htmlElementsFactory.create ( 
			'textarea',
			{ 
				className : 'TravelNotes-NoteDialog-TextArea',
				id: 'TravelNotes-NoteDialog-TextArea-IconHtmlContent'
			},
			baseDialog.content
		);
		iconHtmlContent.addEventListener (
			'focus',
			function ( event ) {
				focusControl = iconHtmlContent;
			},
			false
		);
		iconHtmlContent.value = note.iconContent;
		// Popup content
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - PopupContentTitle' )
			},
			baseDialog.content
		);
		var popUpContent = htmlElementsFactory.create ( 
			'textarea',
			{ 
				className : 'TravelNotes-NoteDialog-TextArea',
				id: 'TravelNotes-NoteDialog-TextArea-PopupContent'
			},
			baseDialog.content
		);
		popUpContent.addEventListener (
			'focus',
			function ( event ) {
				focusControl = popUpContent;
			},
			false
		);
		popUpContent.value = note.popupContent;
		
		// tooltip content
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - TooltipTitle' )
			},
			baseDialog.content
		);
		var tooltip = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Tooltip'
			},
			baseDialog.content
		);
		tooltip.addEventListener (
			'focus',
			function ( event ) {
				focusControl = tooltip;
			},
			false
		);
		tooltip.value = note.tooltipContent;
		
		// Address
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - AdressTitle' )
			},
			baseDialog.content
		);
		var address = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Adress'
			},
			baseDialog.content
		);
		address.addEventListener (
			'focus',
			function ( event ) {
				focusControl = address;
			},
			false
		);
		address.value = note.address;
		
		// link
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - LinkTitle' )
			},
			baseDialog.content
		);
		var link = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Link'
			},
			baseDialog.content
		);
		link.addEventListener (
			'focus',
			function ( event ) {
				focusControl = null;
			},
			false
		);
		link.value = note.url;
		
		// phone
		htmlElementsFactory.create ( 
			'div',
			{ 
				className : 'TravelNotes-NoteDialog-TitleDiv',
				innerHTML : _Translator.getText ( 'NoteDialog - PhoneTitle' )
			},
			baseDialog.content
		);
		var phone = htmlElementsFactory.create ( 
			'input',
			{ 
				type : 'text',
				className : 'TravelNotes-NoteDialog-InputText',
				id: 'TravelNotes-NoteDialog-InputText-Phone'
			},
			baseDialog.content
		);
		phone.addEventListener (
			'focus',
			function ( event ) {
				focusControl = phone;
			},
			false
		);
		phone.value = note.phone;
		
		document.getElementById ( 'TravelNotes-NoteDialog-DimensionsDataDiv' ).classList.add ( 'TravelNotes-NoteDialog-Hidden' );
		document.getElementById ( 'TravelNotes-NoteDialog-TextArea-IconHtmlContent' ).classList.add ( 'TravelNotes-NoteDialog-Hidden' );
		document.getElementById ( 'TravelNotes-NoteDialog-IconContentTitleDiv' ).classList.add ( 'TravelNotes-NoteDialog-Hidden' );
		document.getElementById ( 'TravelNotes-NoteDialog-IconsListDataDiv' ).classList.remove ( 'TravelNotes-NoteDialog-Hidden' );
		document.getElementById ( 'TravelNotes-NoteDialog-RadioStandardInput' ).checked = true;

		// and the dialog is centered on the screen
		baseDialog.center ( );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getNoteDialog;
	}

}());

},{"../UI/BaseDialog":32,"../UI/Translator":40,"../core/NoteEditor":47,"./HTMLElementsFactory":35}],38:[function(require,module,exports){
(function (global){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

( function ( ){
	
	'use strict';
	
	var _Translator = require ( './Translator' ) ( );

	var onAddWayPointButton = function ( event ) {
		event.stopPropagation ( );
		var newWayPoints = require ( '../core/RouteEditor' ) ( ).addWayPoint ( );
	};
	
	var onReverseWayPointsButton = function ( event )
	{
		event.stopPropagation ( );
		var newWayPoints = require ( '../core/RouteEditor' ) ( ).reverseWayPoints ( );
	};
	
	var onRemoveAllWayPointsButton = function ( event )
	{
		event.stopPropagation ( );
		var newWayPoints = require ( '../core/RouteEditor' ) ( ).removeAllWayPoints ( );
	};
	
	// Events for buttons and input on the waypoints list items
	
	var onWayPointsListDelete = function ( event ) {
		event.stopPropagation ( );
		var newWayPoints = require ( '../core/RouteEditor' ) ( ).removeWayPoint ( event.itemNode.dataObjId );
	};

	var onWayPointsListUpArrow = function ( event ) {
		event.stopPropagation ( );
		var newWayPoints = require ( '../core/RouteEditor' ) ( ).swapWayPoints ( event.itemNode.dataObjId, true );
	};

	var onWayPointsListDownArrow = function ( event ) {
		event.stopPropagation ( );
		var newWayPoints = require ( '../core/RouteEditor' ) ( ).swapWayPoints ( event.itemNode.dataObjId, false );
	};

	var onWayPointsListRightArrow = function ( event ) {
		event.stopPropagation ( );
	};

	var onWayPointslistChange = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/RouteEditor' ) ( ).renameWayPoint ( event.dataObjId, event.changeValue );
	};

	var onSaveRouteButton = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/RouteEditor' ) ( ).saveEdition ( );
	};
	
	var onCancelRouteButton = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/RouteEditor' ) ( ).cancelEdition ( );
	};
	
	var onClickExpandButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		document.getElementById ( 'TravelControl-WaypointsHeaderDiv' ).classList.toggle ( 'TravelControl-SmallHeader' );
		document.getElementById ( 'TravelControl-WaypointsDataDiv' ).classList.toggle ( 'TravelControl-HiddenList' );
		document.getElementById ( 'TravelControl-WayPointsButtonsDiv' ).classList.toggle ( 'TravelControl-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelControl-WaypointsDataDiv' ).classList.contains ( 'TravelControl-HiddenList' );
		document.getElementById ( 'TravelControl-WayPointsExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25bc;';
		document.getElementById ( 'TravelControl-WayPointsExpandButton' ).title = hiddenList ? _Translator.getText ( 'RouteEditorUI - Show' ) : _Translator.getText ( 'RouteEditorUI - Hide' );
	};
	
	var onClickExpandListButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		
		document.getElementById ( 'TravelControl-WaypointsDataDiv' ).classList.toggle ( 'TravelControl-ExpandedList' );
		var expandedList = document.getElementById ( 'TravelControl-WaypointsDataDiv' ).classList.contains ( 'TravelControl-ExpandedList' );
		document.getElementById ( 'TravelControl-ExpandWayPointsListButton' ).innerHTML = expandedList ? '&#x25b3;' : '&#x25bd;';
		document.getElementById ( 'TravelControl-ExpandWayPointsListButton' ).title = expandedList ? _Translator.getText ( 'RouteEditorUI - Reduce the list' ) : _Translator.getText ( 'RouteEditorUI - Expand the list' );		
	};

	// User interface
	
	var _WayPointsList = null;

	var getRouteEditorUI = function ( ) {
				
		var _CreateUI = function ( controlDiv ){ 

			if ( document.getElementById ( 'TravelControl-WaypointsDataDiv' ) ) {
				return;
			}
			
			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-WaypointsHeaderDiv', className : 'TravelControl-HeaderDiv'}, controlDiv );
			var expandButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc;', id : 'TravelControl-WayPointsExpandButton', className : 'TravelControl-ExpandButton'}, headerDiv );
			expandButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : _Translator.getText ( 'RouteEditorUI - Waypoints' ), id : 'TravelControl-WayPointsHeaderText',className : 'TravelControl-HeaderText'}, headerDiv );
			var dataDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-WaypointsDataDiv', className : 'TravelControl-DataDiv'}, controlDiv );
			_WayPointsList = require ( './SortableList' ) ( 
				{
					minSize : 0,
					listStyle : 'LimitedSort',
					placeholders : [ _Translator.getText ( 'RouteEditorUI - Start' ), _Translator.getText ( 'RouteEditorUI - Via' ), _Translator.getText ( 'RouteEditorUI - End' ) ],
					indexNames : [ 'A', 'index', 'B' ],
					id : 'TravelControl-WaypointsList'
				}, 
				dataDiv
			);
			_WayPointsList.container.addEventListener ( 'SortableListDelete', onWayPointsListDelete, false );
			_WayPointsList.container.addEventListener ( 'SortableListUpArrow', onWayPointsListUpArrow, false );
			_WayPointsList.container.addEventListener ( 'SortableListDownArrow', onWayPointsListDownArrow, false );
			_WayPointsList.container.addEventListener ( 'SortableListChange', onWayPointslistChange, false );

			var buttonsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-WayPointsButtonsDiv', className : 'TravelControl-ButtonsDiv'}, controlDiv );
			
			var expandListButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelControl-ExpandWayPointsListButton', 
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Expand the list' ), 
					innerHTML : '&#x25bd;'
				}, 
				buttonsDiv 
			);
			expandListButton.addEventListener ( 'click' , onClickExpandListButton, false );

			var cancelRouteButton = htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelControl-CancelRouteButton',
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Cancel' ), 
					innerHTML : '&#x274c'
				},
				buttonsDiv 
			);
			cancelRouteButton.addEventListener ( 'click', onCancelRouteButton, false );
			var saveRouteButton = htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelControl-SaveRouteButton',
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Save' ), 
					innerHTML : '&#x1f4be;'
				},
				buttonsDiv 
			);
			saveRouteButton.addEventListener ( 'click', onSaveRouteButton, false );
			var reverseWayPointsButton = htmlElementsFactory.create ( 
				'div',
				{ 
					id : 'TravelControl-ReverseWayPointsButton', 
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Invert waypoints' ),  
					innerHTML : '&#x21C5;'
				},
				buttonsDiv
			);
			reverseWayPointsButton.addEventListener ( 'click' , onReverseWayPointsButton, false );
			var addWayPointButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelControl-AddWayPointButton',
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'RouteEditorUI - Add waypoint' ), 
					innerHTML : '+'
				},
				buttonsDiv 
			);
			addWayPointButton.addEventListener ( 'click', onAddWayPointButton, false );
			var removeAllWayPointsButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelControl-RemoveAllWayPointsButton', 
					className: 'TravelControl-Button',
					title: _Translator.getText ( 'RouteEditorUI - Delete all waypoints' ),
					innerHTML : '&#x267b;'
				}, 
				buttonsDiv
			);
			removeAllWayPointsButton.addEventListener ( 'click' , onRemoveAllWayPointsButton, false );
		};
	
		var _ExpandUI = function ( ) {
			document.getElementById ( 'TravelControl-WayPointsExpandButton' ).innerHTML = '&#x25bc;';
			document.getElementById ( 'TravelControl-WayPointsExpandButton' ).title = 'Masquer';
			document.getElementById ( 'TravelControl-WaypointsDataDiv' ).classList.remove ( 'TravelControl-HiddenList' );
			document.getElementById ( 'TravelControl-WaypointsDataDiv' ).classList.remove ( 'TravelControl-HiddenList' );
		};
		
		var _ReduceUI = function ( ) {
			document.getElementById ( 'TravelControl-WayPointsExpandButton' ).innerHTML = '&#x25b6;';
			document.getElementById ( 'TravelControl-WayPointsExpandButton' ).title = 'Afficher';
			document.getElementById ( 'TravelControl-WaypointsButtonsDiv' ).classList.add ( 'TravelControl-HiddenList' );
			document.getElementById ( 'TravelControl-WaypointsButtonsDiv' ).classList.add ( 'TravelControl-HiddenList' );
		};
		
		return {
			createUI : function ( controlDiv ) { 
				_CreateUI ( controlDiv ); 
			},
	
			expand : function ( ) {
				_ExpandUI ( );
			},
			
			reduce : function ( ) {
				_ReduceUI ( );
			},

			setWayPointsList : function ( ) {
				_WayPointsList.removeAllItems ( );

				if ( -1 === global.editedRoute.routeInitialObjId ) {
					return;
				}
				
				var wayPointsIterator = global.editedRoute.wayPoints.iterator;
				while ( ! wayPointsIterator.done ) {
					_WayPointsList.addItem ( wayPointsIterator.value.UIName, wayPointsIterator.value.objId, wayPointsIterator.last );
				}
			}
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRouteEditorUI;
	}

}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../core/RouteEditor":48,"./HTMLElementsFactory":35,"./SortableList":39,"./Translator":40}],39:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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
( function ( ){
	
	'use strict';
	
	
	var onDragStart = function  ( DragEvent ) {
		DragEvent.stopPropagation(); // needed to avoid map movements
		try {
			DragEvent.dataTransfer.setData ( 'Text', '1' );
		}
		catch ( e ) {
		}
		console.log ( 'onDragStart' );
	};
	
	var onDragOver = function ( DragEvent ) {
		DragEvent.preventDefault();
		console.log ( 'onDragOver' );
	};
	
	var onDrop = function ( DragEvent ) { 
		DragEvent.preventDefault();
		var data = DragEvent.dataTransfer.getData("Text");
		console.log ( 'onDrop' );
	};

	/*
	var onDragEnd = function ( DragEvent ) { 
		console.log ( 'onDragEnd' );
	};
	
	var onDragEnter = function ( DragEvent ) { 
		console.log ( 'onDragLeave' );
	};
	var onDragLeave = function ( DragEvent ) { 
		console.log ( 'onDragEnter' );
	};
	*/	
	
	var onDeleteButtonClick = function ( ClickEvent ) {
		var event = new Event ( 'SortableListDelete' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation();
	};
	
	var onUpArrowButtonClick = function ( ClickEvent ) {
		var event = new Event ( 'SortableListUpArrow' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation();
	};
	
	var onDownArrowButtonClick = function ( ClickEvent ) {
		var event = new Event ( 'SortableListDownArrow' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation();
	};
	
	var onRightArrowButtonClick = function ( ClickEvent ) {
		var event = new Event ( 'SortableListRightArrow' );
		event.itemNode = ClickEvent.target.parentNode;
		ClickEvent.target.parentNode.parentNode.dispatchEvent ( event );
		ClickEvent.stopPropagation();
	};
	
	var onChange = function ( changeEvent ) {
		console.log ( 'onChange' );
		var event = new Event ( 'SortableListChange' );
		event.dataObjId = changeEvent.target.parentNode.dataObjId;
		event.changeValue = changeEvent.target.value;
		changeEvent.target.parentNode.parentNode.dispatchEvent ( event );
		changeEvent.stopPropagation();
	};
	
	/* 
	--- SortableList object --------------------------------------------------------------------------------------------------
	
	--------------------------------------------------------------------------------------------------------------------------
	*/

	var SortableList = function ( options, parentNode ) {
		
		var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
		
		this.items = [];
		
		/*
		--- removeAllItems method ----------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/

		this.removeAllItems = function ( ) {
			for ( var ItemCounter = 0; ItemCounter < this.items.length; ItemCounter ++ ) {
				this.container.removeChild ( this.items [ ItemCounter ] );
			}
			this.items.length = 0;
		};
		
		/*
		--- addItem method -----------------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/

		this.addItem = function ( name, dataObjId, isLastItem ) {
	
			name = name || '';
			dataObjId = dataObjId || -1;
			
			var placeholder = '';
			if ( 1 === this.options.placeholders.length ) {
				placeholder = this.options.placeholders [ 0 ];
			}
			if ( 3 === this.options.placeholders.length ) {
				switch ( this.items.length ) {
					case 0:
					placeholder = this.options.placeholders [ 0 ];
					break;
					default:
					placeholder = this.options.placeholders [ 1 ];
					break;
				}
				if ( isLastItem ) {
					placeholder = this.options.placeholders [ 2 ];
				}
			}
			
			var indexName = '';
			if ( 1 === this.options.indexNames.length ) {
				indexName = this.options.indexNames [ 0 ];
			}
			if ( 3 === this.options.indexNames.length ) {
				switch ( this.items.length ) {
					case 0:
					indexName = this.options.indexNames [ 0 ];
					break;
					default:
					indexName = this.options.indexNames [ 1 ];
					break;
				}
				if ( isLastItem ) {
					indexName = this.options.indexNames [ 2 ];
				}
			}
			if ( 'index' === indexName )
			{
				indexName = this.items.length;
			}
			
			var item = htmlElementsFactory.create ( 'div', { draggable : false , className : 'SortableList-Item' } );

			htmlElementsFactory.create ( 'div', { className : 'SortableList-ItemTextIndex' , innerHTML : indexName }, item );
			var inputElement = htmlElementsFactory.create ( 'input', { type : 'text', className : 'SortableList-ItemInput', placeholder : placeholder, value: name}, item );
			inputElement.addEventListener ( 'change' , onChange, false );
			var upArrowButton = htmlElementsFactory.create ( 'div', { className : 'SortableList-ItemUpArrowButton', title : 'Déplacer vers le haut', innerHTML : String.fromCharCode( 8679 ) }, item );
			upArrowButton.addEventListener ( 'click', onUpArrowButtonClick, false );
			var downArrowButton = htmlElementsFactory.create ( 'div', { className : 'SortableList-ItemDownArrowButton', title : 'Déplacer vers le bas', innerHTML : String.fromCharCode( 8681 ) }, item );
			downArrowButton.addEventListener ( 'click', onDownArrowButtonClick, false );
			var rightArrowButton = htmlElementsFactory.create ( 'div', { className : 'SortableList-ItemRightArrowButton', title : 'Éditer', innerHTML : String.fromCharCode( 8688 ) }, item );
			if ( 'AllSort' === this.options.listStyle ) {
				rightArrowButton.addEventListener ( 'click', onRightArrowButtonClick, false );
			}
			var deleteButton = htmlElementsFactory.create ( 'div', { className : 'SortableList-ItemDeleteButton', title : 'Supprimer', innerHTML : '&#x267b;' }, item );
			deleteButton.addEventListener ( 'click', onDeleteButtonClick, false );
			item.dataObjId = dataObjId; 

			this.items.push ( item );

			if ( ( ( 'LimitedSort' !== this.options.listStyle ) || ( 1 < this.items.length ) ) && ( ! isLastItem  ) ){
				item.draggable = true;
				item.addEventListener ( 'dragstart', onDragStart, false );	
				item.classList.add ( 'SortableList-MoveCursor' );
			}
	
			this.container.appendChild ( item );
		};
		
		
		/*
		--- _create method -----------------------------------------------------------------------------------------------------

		This method ...

		------------------------------------------------------------------------------------------------------------------------
		*/

		this._create = function ( options, parentNode ) {

			// options
			
			// options.listStyle = 'AllSort' : all items can be sorted or deleted
			// options.listStyle = 'LimitedSort' : all items except first and last can be sorted or deleted
			
			this.options = { minSize : 2, listStyle : 'AllSort', placeholders : [] , indexNames : [], id : 'SortableList-Container' } ;
			for ( var option in options ) {
				this.options [ option ] = options [ option ];
			}
			if ( ( 'LimitedSort' === this.options.listStyle ) && ( 2 > this.options.minSize ) )
			{
				this.options.minSize = 0;
			}
			this.container = htmlElementsFactory.create ( 'div', { id : options.id, className : 'SortableList-Container' } );
			this.container.classList.add ( this.options.listStyle );
			this.container.addEventListener ( 'dragover', onDragOver, false );
			this.container.addEventListener ( 'drop', onDrop, false );

			if ( parentNode ) {
				parentNode.appendChild ( this.container );
			}
			
			for ( var itemCounter = 0; itemCounter < this.options.minSize; itemCounter++ )
			{
				this.addItem ( );
			}
		};
		
		this._create ( options, parentNode );
		
	};

	var sortableList = function ( options, parentNode ) {
		return new SortableList ( options, parentNode );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = sortableList;
	}

}());

},{"./HTMLElementsFactory":35}],40:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/
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

(function() {
	
	'use strict';

	var _Fr =
	[
		{
			msgid : "ContextMenu - close",
			msgstr : "Fermer"
		},
		{
			msgid : "ErrorEditorUI - Show",
			msgstr : "Afficher"
		},
		{
			msgid : "ErrorEditorUI - Hide",
			msgstr : "Masquer"
		},
		{
			msgid : "ItineraryEditorUI - Itinerary and notes",
			msgstr : "Itinéraire et notes"
		},
		{
			msgid : "ItineraryEditorUI - Show",
			msgstr : "Afficher"
		},
		{
			msgid : "ItineraryEditorUI - Hide",
			msgstr : "Masquer"
		},
		{
			msgid : "NoteCategory-Id01",
			msgstr : "A&#xe9;roport"
		},
		{
			msgid : "NoteCategory-Id02",
			msgstr : "Mont&#xe9;e"
		},
		{
			msgid : "NoteCategory-Id03",
			msgstr : "Distributeur de billets"
		},
		{
			msgid : "NoteCategory-Id04",
			msgstr : "Attention requise"
		},
		{
			msgid : "NoteCategory-Id05",
			msgstr : "V&#xe9;los admis"
		},
		{
			msgid : "NoteCategory-Id06",
			msgstr : "Autobus"
		},
		{
			msgid : "NoteCategory-Id07",
			msgstr : "Photo"
		},
		{
			msgid : "NoteCategory-Id08",
			msgstr : "Camping"
		},
		{
			msgid : "NoteCategory-Id09",
			msgstr : "Ferry"
		},
		{
			msgid : "NoteCategory-Id10",
			msgstr : "Auberge de jeunesse"
		},
		{
			msgid : "NoteCategory-Id11",
			msgstr : "Point d\'information"
		},
		{
			msgid : "NoteCategory-Id12",
			msgstr : "Parc national"
		},
		{
			msgid : "NoteCategory-Id13",
			msgstr : "V&#xe9;los mal vus"
		},
		{
			msgid : "NoteCategory-Id14",
			msgstr : "Parc r&#xe9;gional"
		},
		{
			msgid : "NoteCategory-Id15",
			msgstr : "Entretien v&#xe9;lo"
		},
		{
			msgid : "NoteCategory-Id16",
			msgstr : "Magasin"
		},
		{
			msgid : "NoteCategory-Id17",
			msgstr : "Aide"
		},
		{
			msgid : "NoteCategory-Id18",
			msgstr : "Stop"
		},
		{
			msgid : "NoteCategory-Id19",
			msgstr : "Table"
		},
		{
			msgid : "NoteCategory-Id20",
			msgstr : "Toilettes"
		},
		{
			msgid : "NoteCategory-Id21",
			msgstr : "Gare"
		},
		{
			msgid : "NoteCategory-Id22",
			msgstr : "Tunnel"
		},
		{
			msgid : "NoteCategory-Id23",
			msgstr : "Point d\'eau"
		},
		{
			msgid : "NoteCategory-Id24",
			msgstr : "Chambre d\'hotes"
		},
		{
			msgid : "NoteCategory-Id25",
			msgstr : "Cafetaria"
		},
		{
			msgid : "NoteCategory-Id26",
			msgstr : "Restaurant"
		},
		{
			msgid : "NoteCategory-Id27",
			msgstr : "H&#xf4;tel"
		},
		{
			msgid : "NoteCategory-Id28",
			msgstr : "D&#xe9;part"
		},
		{
			msgid : "NoteCategory-Id29",
			msgstr : "Entr&#xe9;e du ferry"
		},
		{
			msgid : "NoteCategory-Id30",
			msgstr : "Sortie du ferry"
		},
		{
			msgid : "NoteCategory-Id31",
			msgstr : "Continuer"
		},
		{
			msgid : "NoteCategory-Id32",
			msgstr : "Tourner l&#xe9;g&#xe8;rement &#xe0; gauche"
		},
		{
			msgid : "NoteCategory-Id33",
			msgstr : "Tourner &#xe0; gauche"
		},
		{
			msgid : "NoteCategory-Id34",
			msgstr : "Tourner fort &#xe0; gauche"
		},
		{
			msgid : "NoteCategory-Id35",
			msgstr : "Tourner l&#xe9;g&#xe8;rement &#xe0; droite"
		},
		{
			msgid : "NoteCategory-Id36",
			msgstr : "Tourner &#xe0; droite"
		},
		{
			msgid : "NoteCategory-Id37",
			msgstr : "Tourner fort &#xe0; droite"
		},
		{
			msgid : "NoteCategory-Id38",
			msgstr : "Point noeud v&#xe9;lo"
		},
		{
			msgid : "MapEditor - Distance",
			msgstr : "<span>Distance</span>&nbsp;:&nbsp;"
		},
		{
			msgid : "MapEditor - Duration",
			msgstr : "<span>Temps</span>&nbsp;:&nbsp;"
		},
		{
			msgid : "MapEditor - popup address",
			msgstr : "<span>Adresse</span>&nbsp;:&nbsp;"
		},
		{
			msgid : "MapEditor - popup phone",
			msgstr : "<span>Téléphone</span>&nbsp;:&nbsp;"
		},
		{
			msgid : "MapEditor - popup url",
			msgstr : "<span>Latitude</span>&nbsp;:&nbsp;"
		},
		{
			msgid : "MapEditor - popup lng",
			msgstr : "<span>&nbsp;-&nbsp;Longitude</span>&nbsp;:&nbsp;"
		},
		{
			msgid : "MapEditor - popup lat",
			msgstr : "<span>Lattitude</span>&nbsp;:&nbsp;"
		},
		{
			msgid : "NoteDialog - Title",
			msgstr : "Note"
		},
		{
			msgid : "NoteDialog - IconHtmlContentTitle",
			msgstr : "Contenu de l'icône&nbsp;:"
		},
		{
			msgid : "NoteDialog - PopupContentTitle",
			msgstr : "Contenu du popup&nbsp;:"
		},
		{
			msgid : "NoteDialog - AdressTitle",
			msgstr : "Addresse&nbsp;:"
		},
		{
			msgid : "NoteDialog - LinkTitle",
			msgstr : "Lien&nbsp;:"
		},
		{
			msgid : "NoteDialog - PhoneTitle",
			msgstr : "Téléphone&nbsp:"
		},
		{
			msgid : "NoteDialog - TooltipTitle",
			msgstr : "Contenu du tooltip&nbsp;:"
		},
		{
			msgid : "NoteDialog - Standard icon",
			msgstr : "Icône standard"
		},
		{
			msgid : "NoteDialog - Personnel icon",
			msgstr : "Icône personnalisée"
		},
		{
			msgid : "NoteDialog - Choose an icon",
			msgstr : "Icône : "
		},
		{
			msgid : "NoteDialog - Icon width",
			msgstr : "Largeur : "
		},
		{
			msgid : "NoteDialog - Icon height",
			msgstr : "Hauteur : "
		},
		{
			msgid : "RouteEditor-Not possible to edit a route without a save or cancel",
			msgstr : "Il n'est pas possible d'éditer une route sans sauver ou abandonner les modifications"
		},
		{
			msgid : "RouteEditor - Select this point as start point",
			msgstr : "Sélectionner cet endroit comme point de départ"
		},
		{
			msgid : "RouteEditor - Select this point as way point",
			msgstr : "Sélectionner cet endroit comme point intermédiaire"
		},
		{
			msgid : "RouteEditor - Select this point as end point",
			msgstr : "Sélectionner cet endroit comme point de fin"
		},
		{
			msgid : "RouteEditor - Edit this route",
			msgstr : "Éditer cette route"
		},
		{
			msgid : "RouteEditor - Delete this route",
			msgstr : "Supprimer cette route"
		},
		{
			msgid : "RouteEditor - Save modifications on this route",
			msgstr : "Sauver les modifications"
		},
		{
			msgid : "RouteEditor - Cancel modifications on this route",
			msgstr : "Abandonner les modifications"
		},
		{
			msgid : "RouteEditorUI - Show",
			msgstr : "Afficher"
		},
		{
			msgid : "RouteEditorUI - Hide",
			msgstr : "Masquer"
		},
		{
			msgid : "RouteEditorUI - Waypoints",
			msgstr : "Points de passage&nbsp;de la route:"
		},
		{
			msgid : "RouteEditorUI - Start",
			msgstr : "Départ"
		},
		{
			msgid : "RouteEditorUI - Via",
			msgstr : "Point de passage"
		},
		{
			msgid : "RouteEditorUI - End",
			msgstr : "Fin"
		},
		{
			msgid : "RouteEditorUI - Save",
			msgstr : "Sauver les modifications"
		},
		{
			msgid : "RouteEditorUI - Cancel",
			msgstr : "Abandonner les modifications"
		},
		{
			msgid : "RouteEditorUI - Invert waypoints",
			msgstr : "Inverser les points de passage"
		},
		{
			msgid : "RouteEditorUI - Add waypoint",
			msgstr : "Ajouter un point de passage"
		},
		{
			msgid : "RouteEditorUI - Delete all waypoints",
			msgstr : "Supprimer tous les points de passage"
		},
		{
			msgid : "RouteEditorUI - Reduce the list",
			msgstr : "Réduire"
		},
		{
			msgid : "RouteEditorUI - Expand the list",
			msgstr : "Étendre"
		},
		{
			msgid : "TravelEditorUI - Show",
			msgstr : "Afficher"
		},
		{
			msgid : "TravelEditorUI - Hide",
			msgstr : "Masquer"
		},
		{
			msgid : "TravelEditorUI - Routes",
			msgstr : "Routes du voyage&nbsp;:"
		},
		{
			msgid : "TravelEditorUI - Route",
			msgstr : "Route"
		},
		{
			msgid : "TravelEditorUI - Reduce the list",
			msgstr : "Réduire"
		},
		{
			msgid : "TravelEditorUI - Expand the list",
			msgstr : "Étendre"
		},
		{
			msgid : "TravelEditorUI - New route",
			msgstr : "Nouvelle route"
		},
		{
			msgid : "TravelEditorUI - Delete all routes",
			msgstr : "Supprimer toutes les routes"
		},
		{
			msgid : "TravelEditorUI - Save travel",
			msgstr : "Sauver dans un fichier"
		},
		{
			msgid : "TravelEditorUI - Open travel",
			msgstr : "Ouvrir un fichier"
		},
		{
			msgid : "TravelEditorUI - Undo",
			msgstr : "Réouvrir une route supprimée"
		},
		{
			msgid : "TravelEditor - cannot remove an edited route",
			msgstr : "Il n'est pas possible de supprimer une route quand celle-ci est en cours d'édition"
		},
		{
			msgid : "TravelEditor - Not possible to save a travel without a save or cancel",
			msgstr : "Des données non sauvées sont présentes dans l'éditeur de route. Sauvez ou abandonnez celles-ci avant de sauver le voyage dans un fichier"
		},
		{
			msgid : "TravelEditorUI - Cancel travel",
			msgstr : "Abandonner ce voyage"
		},
		{
			msgid : "Utilities - day",
			msgstr : "jours"
		},
		{
			msgid : "Utilities - hour",
			msgstr : "h"
		},
		{
			msgid : "Utilities - minute",
			msgstr : "m"
		},
		{
			msgid : "Utilities - second",
			msgstr : "s"
		},
		{
			msgid : "TravelEditorUI - ",
			msgstr : "xxx"
		},
		{
			msgid : "TravelEditorUI - ",
			msgstr : "xxx"
		},
		{
			msgid : "TravelEditorUI - ",
			msgstr : "xxx"
		},

	];
	
	var _Translations = null;
	
	var getTranslator = function ( textId ) {
		if ( ! _Translations ) {
			_Translations = new Map ( );
			for ( var messageCounter = 0; messageCounter < _Fr.length; messageCounter ++ ) {
				_Translations.set ( _Fr [ messageCounter ].msgid, _Fr [ messageCounter ].msgstr );
			}
			_Translations.set ( 'Version', '1.0.0' );
		}
		return {
			getText : function ( textId ) { 
				var translation = _Translations.get ( textId );
				return translation === undefined ? textId : translation;
			}
		};
	};
	
	/* --- End of getNote function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getTranslator;
	}

} ) ( );

},{}],41:[function(require,module,exports){
(function (global){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

( function ( ){
	
	'use strict';
	
	var _Translator = require ( './Translator' ) ( );
	
	// Events listeners for buttons under the routes list
	var onCancelTravelButton = function ( clickEvent ) {
		clickEvent.stopPropagation();
		require ( '../core/TravelEditor' ) ( ).clear ( );
	};

	var onClickAddRouteButton = function ( event ) {
		event.stopPropagation();
		require ( '../core/TravelEditor' ) ( ).addRoute ( );
	};
	
	// Events for buttons and input on the routes list items
	var onRoutesListDelete = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).removeRoute ( event.itemNode.dataObjId );
	};

	var onRoutesListUpArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).swapRoute ( event.itemNode.dataObjId, true );
	};

	var onRoutesListDownArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).swapRoute ( event.itemNode.dataObjId, false );
	};

	var onRoutesListRightArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).editRoute ( event.itemNode.dataObjId );
	};
	
	var onRouteslistChange = function ( event ) {
		event.stopPropagation();
		require ( '../core/TravelEditor' ) ( ).renameRoute ( event.dataObjId, event.changeValue );
	};
	
	var onClickSaveTravelButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).saveTravel ( );
	};	
	
	var onClickOpenTravelButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).openTravel ( clickEvent );
	};	
		
	var onClickUndoButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
	};	
		
	var onClickExpandButton = function ( clickEvent ) {

		clickEvent.stopPropagation ( );
		
		document.getElementById ( 'TravelControl-RoutesHeaderDiv' ).classList.toggle ( 'TravelControl-SmallHeader' );
		document.getElementById ( 'TravelControl-RoutesDataDiv' ).classList.toggle ( 'TravelControl-HiddenList' );
		document.getElementById ( 'TravelControl-RoutesButtonsDiv' ).classList.toggle ( 'TravelControl-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelControl-RoutesDataDiv' ).classList.contains ( 'TravelControl-HiddenList' );
		document.getElementById ( 'TravelControl-RoutesExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25bc;';
		document.getElementById ( 'TravelControl-RoutesExpandButton' ).title = hiddenList ? _Translator.getText ( 'TravelEditorUI - Show' ) : _Translator.getText ( 'TravelEditorUI - Hide' );

		clickEvent.stopPropagation ( );
	};
	
	var onClickExpandListButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		
		document.getElementById ( 'TravelControl-RoutesDataDiv' ).classList.toggle ( 'TravelControl-ExpandedList' );
		var expandedList = document.getElementById ( 'TravelControl-RoutesDataDiv' ).classList.contains ( 'TravelControl-ExpandedList' );
		document.getElementById ( 'TravelControl-ExpandRoutesListButton' ).innerHTML = expandedList ? '&#x25b3;' : '&#x25bd;';
		document.getElementById ( 'TravelControl-ExpandRoutesListButton' ).title = expandedList ? _Translator.getText ( 'TravelEditorUI - Reduce the list' ) : _Translator.getText ( 'TravelEditorUI - Expand the list' );		
	};

	// User interface

	var _RoutesList = null;

	var getTravelEditorUI = function ( ) {
				
		var _CreateUI = function ( controlDiv ){ 
		
			if ( document.getElementById ( 'TravelControl-RoutesDataDiv' ) ) {
				return;
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			// Routes
			
			var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesHeaderDiv', className : 'TravelControl-HeaderDiv'}, controlDiv );
			var expandButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc;', id : 'TravelControl-RoutesExpandButton', className : 'TravelControl-ExpandButton'}, headerDiv );
			expandButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : _Translator.getText ( 'TravelEditorUI - Routes' ), id : 'TravelControl-RoutesHeaderText', className : 'TravelControl-HeaderText'}, headerDiv );
			var dataDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesDataDiv', className : 'TravelControl-DataDiv'}, controlDiv );
			
			_RoutesList = require ( './SortableList' ) ( { minSize : 0, placeholders : [ _Translator.getText ( 'TravelEditorUI - Route' )], id : 'TravelControl-RouteList' }, dataDiv );
			_RoutesList.container.addEventListener ( 'SortableListDelete', onRoutesListDelete, false );
			_RoutesList.container.addEventListener ( 'SortableListUpArrow', onRoutesListUpArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListDownArrow', onRoutesListDownArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListRightArrow', onRoutesListRightArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListChange', onRouteslistChange, false );
			
			var buttonsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-RoutesButtonsDiv', className : 'TravelControl-ButtonsDiv' }, controlDiv );

			var expandListButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelControl-ExpandRoutesListButton', 
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Expand the list' ), 
					innerHTML : '&#x25bd;'
				}, 
				buttonsDiv 
			);
			expandListButton.addEventListener ( 'click' , onClickExpandListButton, false );
			
			var cancelTravelButton = htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelControl-CancelTravelButton',
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Cancel travel' ), 
					innerHTML : '&#x274c'
				},
				buttonsDiv 
			);
			cancelTravelButton.addEventListener ( 'click', onCancelTravelButton, false );

			var saveTravelButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelControl-SaveTravelButton', 
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Save travel' ), 
					innerHTML : '&#x1f4be;'
				}, 
				buttonsDiv 
			);
			saveTravelButton.addEventListener ( 'click' , onClickSaveTravelButton, false );

			var openTravelDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id: 'TravelControl-OpenTravelDiv'
				}, 
				buttonsDiv 
			);
			
			var openTravelInput = htmlElementsFactory.create ( 
				'input',
				{
					id : 'TravelControl-OpenTravelInput', 
					type : 'file',
					accept : '.trv'
				},
				openTravelDiv
			);
			openTravelInput.addEventListener ( 'change', onClickOpenTravelButton, false );

			var openTravelFakeDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id: 'TravelControl-OpenTravelFakeDiv'
				}, 
				openTravelDiv 
			);

			var openTravelButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelControl-OpenTravelButton', 
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Open travel' ), 
					innerHTML : '&#x23CD;'
				}, 
				openTravelFakeDiv 
			);
			openTravelButton.addEventListener ( 'click' , function ( ) { openTravelInput.click ( ); }, false );
			
			var undoButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelControl-UndoButton', 
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Undo' ), 
					innerHTML : '&#x21ba;'
				}, 
				buttonsDiv 
			);
			undoButton.addEventListener ( 'click' , onClickUndoButton, false );

			var addRouteButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelControl-AddRoutesButton', 
					className: 'TravelControl-Button', 
					title : _Translator.getText ( 'TravelEditorUI - New route' ), 
					innerHTML : '+'
				}, 
				buttonsDiv 
			);
			addRouteButton.addEventListener ( 'click' , onClickAddRouteButton, false );
		};	
		
		return {
			createUI : function ( controlDiv ) { 
				_CreateUI ( controlDiv ); 
			},
			
			setRoutesList : function (  ) {
				_RoutesList.removeAllItems ( );
				var routesIterator = global.travelData.routes.iterator;
				while ( ! routesIterator.done ) {
					_RoutesList.addItem ( routesIterator.value.name, routesIterator.value.objId, false );
				}
			}
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getTravelEditorUI;
	}

}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../core/TravelEditor":50,"./HTMLElementsFactory":35,"./SortableList":39,"./Translator":40}],42:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

( function ( ){
	
	'use strict';
	
	// User interface
	
	var getControlUI = function ( ) {

		var _MainDiv = document.getElementById ( 'TravelControl-MainDiv' );

		var _CreateUI = function ( ){ 

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			_MainDiv = htmlElementsFactory.create ( 'div', { id : 'TravelControl-MainDiv' } );

			require ( './TravelEditorUI' ) ( ).createUI ( _MainDiv ); 

			require ( './RouteEditorUI' ) ( ).createUI ( _MainDiv ); 

			require ( './ItineraryEditorUI' ) ( ).createUI ( _MainDiv ); 

			require ( './ErrorEditorUI' ) ( ).createUI ( _MainDiv ); 
		};
		
		if ( ! _MainDiv ) {
			_CreateUI ( );
		}
		
		return {
			get UI ( ) { return _MainDiv; }
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getControlUI;
	}

}());

},{"./ErrorEditorUI":34,"./HTMLElementsFactory":35,"./ItineraryEditorUI":36,"./RouteEditorUI":38,"./TravelEditorUI":41}],43:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

( function ( ){
	
	'use strict';

	var getErrorEditor = function ( ) {

		return {
			
			showError : function ( error ) {
				var header = '<span class="TravelControl-Error">';
				var footer = '</span>';
				require ( '../UI/ErrorEditorUI' ) ( ).message = header + error + footer;
				require ( '../UI/ErrorEditorUI' ) ( ).expand ( );
			},

			clear : function ( routeObjId ) {
				require ( '../UI/ErrorEditorUI' ) ( ).message = '';
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getErrorEditor;
	}

}());

},{"../UI/ErrorEditorUI":34}],44:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

( function ( ){
	
	'use strict';

	var getItineraryEditor = function ( ) {
		
		var _SetItinerary = function (  ) {
			require ( '../UI/ItineraryEditorUI' ) ( ).setItinerary ( );
		};

		return {
			setItinerary : function( ) { _SetItinerary (  );},
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getItineraryEditor;
	}

}());

},{"../UI/ItineraryEditorUI":36}],45:[function(require,module,exports){
(function (global){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

( function ( ){
	
	'use strict';
	
	var _Translator = require ( '../UI/Translator' ) ( );
	var _Config = require ( '../util/Config' ) ( );

	var getRouteTooltipText = function ( layer ) {
		var route = null;
		try {
			route = global.travelData.routes.getAt ( layer.objId );
		}
		catch ( e ) {
			if ( layer.objId === global.editedRoute.objId ) {
				route = global.editedRoute;
			}
		}
		return ( route ? route.name : '');
	};
	
	var getRoutePopupText = function ( layer ) {
		var route = null;
		try {
			route = global.travelData.routes.getAt ( layer.objId );
		}
		catch ( e ) {
			if ( layer.objId === global.editedRoute.objId ) {
				route = global.editedRoute;
			}
		}
		var distance = 0;
		var duration = 0;
		if ( route ) {
			var maneuverIterator = route.itinerary.maneuvers.iterator;
			while ( ! maneuverIterator.done ) {
				distance += maneuverIterator.value.distance;
				duration += maneuverIterator.value.duration;
			}
			distance = require ( '../util/Utilities' ) ( ).formatDistance ( distance );
			duration = require ( '../util/Utilities' ) ( ).formatTime ( duration );
		}
		var returnValue = '';
		if ( route ) {
			returnValue = '<div class="RoutePopup-Header">' +
			route.name + '</div><div class="RoutePopup-Distance">' +
			_Translator.getText ( 'MapEditor - Distance' ) + distance + '</div><div class="RoutePopup-Duration">' +
			_Translator.getText ( 'MapEditor - Duration' ) + duration + '</div>';
		}
		return returnValue;
	};
	
	var onRouteClick = function ( event ) {
		event.target.openPopup ( event.latlng );		
	};
	
	var onRouteContextMenu = function ( event ) {
		require ('../UI/ContextMenu' ) ( event, require ( './RouteEditor' ) ( ).getRouteContextMenu ( event.target.objId ) );
	};
	
	var getMapEditor = function ( ) {
		
		var _AddTo = function ( objId, object ) {
			object.objId = objId;
			global.map.addLayer ( object );
			global.map.travelObjects.set ( objId, object );
		};
		var _RemoveFrom = function ( objId ) {
			var layer = global.map.travelObjects.get ( objId );
			if ( layer ) {
				L.DomEvent.off ( layer );
				global.map.removeLayer ( layer );
				global.map.travelObjects.delete ( objId );
			}
			else {
				console.log ( 'Object not found for deletion : ' + objId );
			}
				
		};
		var _GetNotePopUpText = function ( note ) {
			var notePopupText = '';
			if ( 0 !== note.tooltipContent.length ) {
				notePopupText += '<div class="TravelNotes-PopupMapTooltipContent">' + note.tooltipContent + '</div>';
			}
			if ( 0 !== note.popupContent.length ) {
				notePopupText += '<div class="TravelNotes-PopupContent">' + note.popupContent + '</div>';
			}
			if ( 0 !== note.address.length ) {
				notePopupText += '<div class="TravelNotes-PopupAddress">' + _Translator.getText ( 'MapEditor - popup address' )  + note.address + '</div>';
			}
			if ( 0 !== note.phone.length ) {
				notePopupText += '<div class="TravelNotes-PopupPhone">' + _Translator.getText ( 'MapEditor - popup phone' )  + note.phone + '</div>';
			}
			if ( 0 !== note.url.length ) {
				notePopupText += '<div class="TravelNotes-PopupUrl">' + _Translator.getText ( 'MapEditor - popup url' ) + '<a href="' + note.url + '" target="_blank">' + note.url +'</a></div>';
			}
			notePopupText += '<div class="TravelNotes-PopupLatLng"><span>' + _Translator.getText ( 'MapEditor - popup lat' ) + '</span>' + note.lat.toFixed ( 6 ) + 
				'<span>' + _Translator.getText ( 'MapEditor - popup lng' ) + '</span>' + note.lng.toFixed ( 6 ) + '</div>';
				
			return notePopupText;
		};
		return {
			addRoute : function ( route ) {
				var latLng = [];
				var pointsIterator = route.itinerary.itineraryPoints.iterator;
				while ( ! pointsIterator.done ) {
					latLng.push ( pointsIterator.value.latLng );
				}
				var polyline = L.polyline ( 
					latLng,
					{
						color : route.geom.color,
						weight : route.geom.weight
					}
				);
				_AddTo ( route.objId, polyline );
				polyline.addTo ( global.map );
				polyline.bindTooltip ( getRouteTooltipText );
				polyline.bindPopup ( getRoutePopupText );
				L.DomEvent.on ( polyline, 'click', onRouteClick );
				L.DomEvent.on ( polyline, 'contextmenu', onRouteContextMenu );
			},
			removeObject : function ( objId ) {
				_RemoveFrom ( objId );
			},
			removeAllObjects : function ( ) {
				global.map.travelObjects.forEach ( 
					function ( travelObjectValue, travelObjectKey, travelObjects ) {
						L.DomEvent.off ( travelObjectValue );
						global.map.removeLayer ( travelObjectValue );
					}
				);
				global.map.travelObjects.clear ( );
			},
			addRoutes : function ( ) {
				var routesIterator = global.travelData.routes.iterator;
				while ( ! routesIterator.done ) {
					this.addRoute ( routesIterator.value );
				}
			},
			zoomToItineraryPoint : function ( itineraryPointObjId ) {
				map.setView ( 
					global.editedRoute.itinerary.itineraryPoints.getAt ( itineraryPointObjId ).latLng,
					_Config.itineraryPointZoom 
				);
			},
			addItineraryPointMarker : function ( itineraryPointObjId ) {
				_AddTo ( 
					itineraryPointObjId,
					L.circle ( global.editedRoute.itinerary.itineraryPoints.getAt ( itineraryPointObjId ).latLng, _Config.itineraryPointMarker )
				);
			},
			addTravelNote : function ( note ) {
				var icon = L.divIcon (
					{ 
						iconSize: [ note.iconWidth, note.iconHeight ], 
						iconAnchor: [note.iconWidth / 2, note.iconHeight / 2 ],
						popupAnchor: [ 0, -note.iconHeight / 2 ], 
						html : note.iconContent
					}
				);
				var marker = L.marker ( 
					note.latLng,
					{
						icon : icon,
						draggable : true,
						title : note.tooltipContent
					}
				);	
				marker.bindPopup ( _GetNotePopUpText ( note ) );
				_AddTo ( note.ObjId, marker );
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getMapEditor;
	}

}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../UI/ContextMenu":33,"../UI/Translator":40,"../util/Config":62,"../util/Utilities":63,"./RouteEditor":48}],46:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

( function ( ){
	
	'use strict';

	var getMapboxRouteProvider = function ( ) {
	
		var _IconList = 
		{
			"turn": {
				"default": "kUndefined",
				"sharp left": "kTurnSharpLeft",
				"left": "kTurnLeft",
				"slight left": "kTurnSlightLeft",
				"straight": "kTurnStraight",
				"slight right": "kTurnSlightRight",
				"right": "kTurnRight",
				"sharp right": "kTurnSharpRight",
				"uturn": "kTurnUturn"
			},
			"new name": {
				"default": "kUndefined",
				"sharp left": "kNewNameSharpLeft",
				"left": "kNewNameLeft",
				"slight left": "kNewNameSlightLeft",
				"straight": "kNewNameStraight",
				"slight right": "kNewNameSlightRight",
				"right": "kNewNameRight",
				"sharp right": "kNewNameSharpRight"
			},
			"depart": {
				"default": "kDepartDefault",
				"sharp left": "kDepartLeft",
				"left": "kDepartLeft",
				"slight left": "kDepartLeft",
				"straight": "kDepartDefault",
				"slight right": "kDepartRight",
				"right": "kDepartRight",
				"sharp right": "kDepartRight"
			},
			"arrive": {
				"default": "kArriveDefault",
				"sharp left": "kArriveLeft",
				"left": "kArriveLeft",
				"slight left": "kArriveLeft",
				"straight": "kArriveDefault",
				"slight right": "kArriveRight",
				"right": "kArriveRight",
				"sharp right": "kArriveRight"
			},
			"merge": {
				"default": "kMergeDefault",
				"sharp left": "kMergeLeft",
				"left": "kMergeLeft",
				"slight left": "kMergeLeft",
				"straight": "kMergeDefault",
				"slight right": "kMergeRight",
				"right": "kMergeRight",
				"sharp right": "kMergeRight"
			},
			"on ramp": {
				"default": "kUndefined",
				"sharp left": "kOnRampLeft",
				"left": "kOnRampLeft",
				"slight left": "kOnRampLeft",
				"slight right": "kOnRampRight",
				"right": "kOnRampRight",
				"sharp right": "kOnRampRight"
			},
			"off ramp": {
				"default": "kUndefined",
				"sharp left": "kOffRampLeft",
				"left": "kOffRampLeft",
				"slight left": "kOffRampLeft",
				"slight right": "kOffRampRight",
				"right": "kOffRampRight",
				"sharp right": "kOffRampRight"
			},
			"fork": {
				"default": "kUndefined",
				"sharp left": "kForkLeft",
				"left": "kForkLeft",
				"slight left": "kForkLeft",
				"slight right": "kForkRight",
				"right": "kForkRight",
				"sharp right": "kForkRight"
			},
			"end of road": {
				"default": "kUndefined",
				"sharp left": "kEndOfRoadLeft",
				"left": "kEndOfRoadLeft",
				"slight left": "kEndOfRoadLeft",
				"slight right": "kEndOfRoadRight",
				"right": "kEndOfRoadRight",
				"sharp right": "kEndOfRoadRight"
			},
			"continue": {
				"default": "kUndefined",
				"sharp left": "kContinueSharpLeft",
				"left": "kContinueLeft",
				"slight left": "SkContinuelightLeft",
				"straight": "kContinueStraight",
				"slight right": "kContinueSlightRight",
				"right": "kContinueRight",
				"sharp right": "kContinueSharpRight"
			},
			"roundabout": {
				"default": "kUndefined",
				"sharp left": "kRoundaboutLeft",
				"left": "kRoundaboutLeft",
				"slight left": "kRoundaboutLeft",
				"slight right": "kRoundaboutRight",
				"right": "kRoundaboutRight",
				"sharp right": "kRoundaboutRight"
			},
			"rotary": {
				"default": "kUndefined",
				"sharp left": "kRotaryLeft",
				"left": "kRotaryLeft",
				"slight left": "kRotaryLeft",
				"slight right": "kRotaryRight",
				"right": "kRotaryRight",
				"sharp right": "kRotaryRight"
			},
			"roundabout turn": {
				"default": "kUndefined",
				"sharp left": "kRoundaboutTurnSharpLeft",
				"left": "kRoundaboutTurnLeft",
				"slight left": "kRoundaboutTurnSlightLeft",
				"straight": "kRoundaboutTurnStraight",
				"slight right": "kRoundaboutTurnSlightRight",
				"right": "kRoundaboutTurnRight",
				"sharp right": "kRoundaboutTurnSharpRight"
			},
			"notification": {
				"default": "kUndefined"
			},
			"default" : {
				"default" : "kUndefined"
			}
		};
		
		var _DegreeToCompass = function ( degree ) {
			if ( null === degree ) {
				return '';
			} 
			else if ( degree >= 0 && degree <= 22 ) {
				return 'N.';
			} 
			else if ( degree > 22 && degree < 68 ) {
				return 'N.E.';
			} 
			else if ( degree >= 68 && degree <= 112 ) {
				return 'E.';
			} 
			else if ( degree > 112 && degree < 158 ) {
				return 'S.E.';
			} 
			else if ( degree >= 158 && degree <= 202 ) {
				return 'S.';
			} 
			else if ( degree > 202 && degree < 248 ) {
				return 'S.W.';
			} 
			else if ( degree >= 248 && degree <= 292 ) {
				return 'W.';
			} 
			else if ( degree > 292 && degree < 338 ) {
				return 'N.W.';
			} 
			else if ( degree >= 338 && degree <= 360 ) {
				return 'N.';
			} 
			else {
				return '';
			}
		};

		var _ParseResponse = function ( requestResponse, route ) {
			
			var response = JSON.parse( requestResponse );

			if ( "Ok" !== response.code )
			{
				return {};
			}
			
			if ( 0 === response.routes.length )
			{
				return {};
			}

			route.itinerary.itineraryPoints.removeAll ( );
			route.itinerary.maneuvers.removeAll ( );
			
			response.routes [ 0 ].geometry = require ( 'polyline' ).decode ( response.routes [ 0 ].geometry, 6 );

			var options = {};
			options.hooks= {};
			options.hooks.tokenizedInstruction = function ( instruction ) {
				if ( 'Rouler vers {direction}' === instruction ) {
					instruction = 'Départ';
				}
				return instruction;
			};

			var osrmTextInstructions = require('osrm-text-instructions')('v5', options );
			var language = 'fr';
			var lastPointWithDistance = 0;
			
			
			response.routes [ 0 ].legs.forEach ( 
				function ( leg ) {
					leg.steps.forEach ( 
						function ( step ) {
							step.geometry = require ( 'polyline' ).decode ( step.geometry, 6 );

							var maneuver = require ( '../data/Maneuver' ) ( );
							maneuver.iconName = _IconList [ step.maneuver.type ] ? _IconList [  step.maneuver.type ] [  step.maneuver.modifier ] || _IconList [  step.maneuver.type ] [ "default" ] : _IconList [ "default" ] [ "default" ];
							maneuver.instruction = osrmTextInstructions.compile ( language, step );
							maneuver.streetName = step.name;
							maneuver.direction = _DegreeToCompass ( step.maneuver.bearing_after );
							step.name = '';
							maneuver.simplifiedInstruction = osrmTextInstructions.compile ( language, step );
							maneuver.duration = step.duration;
							var distance = 0;
							for ( var geometryCounter = 0; ( 1 === step.geometry.length ) ? ( geometryCounter < 1 ) : ( geometryCounter < step.geometry.length )  ; geometryCounter ++ ) {
								var itineraryPoint = require ( '../data/ItineraryPoint' ) ( );
								itineraryPoint.latLng = [ step.geometry [ geometryCounter ] [ 0 ], step.geometry [ geometryCounter ] [ 1 ] ];
								itineraryPoint.distance = leg.annotation.distance [ lastPointWithDistance ] ? leg.annotation.distance [ lastPointWithDistance ] : 0;
								route.itinerary.itineraryPoints.add ( itineraryPoint );
								if (geometryCounter !== step.geometry.length - 1 ) {
									distance += itineraryPoint.distance;
									lastPointWithDistance++;
								}
								if ( 0 === geometryCounter ) {
									maneuver.itineraryPointObjId = itineraryPoint.objId;
									itineraryPoint.maneuverObjId = maneuver.objId;
								}
							}
							maneuver.distance = distance;
							route.itinerary.maneuvers.add ( maneuver );
						}
					);
				}
			);
			
			var wayPointsIterator = route.wayPoints.iterator;
			response.waypoints.forEach ( 
				function ( wayPoint ) {
					if ( ! wayPointsIterator.done ) {
						wayPointsIterator.value.latLng = [ wayPoint.location [ 1 ] , wayPoint.location [ 0 ] ];
					}
				}
			);
			return ;
		};
		
		var _GetUrl = function ( wayPoints, providerKey ) {
			
			var wayPointsToString = function ( wayPoint, result )  {
				if ( null === result ) {
					result = '';
				}
				result += wayPoint.lng.toFixed ( 6 ) + ',' + wayPoint.lat.toFixed ( 6 ) + ';' ;
				return result;
			};
			var wayPointsString = wayPoints.forEach ( wayPointsToString );
			
			return 'https://api.mapbox.com/directions/v5/mapbox/driving/' +
				 wayPointsString.substr ( 0, wayPointsString.length - 1 ) +
				'?geometries=polyline6&overview=full&steps=true&annotations=distance&access_token=' +
				providerKey;
		};
		
		return {
			getUrl : function ( wayPoints, providerKey ) {
				return _GetUrl ( wayPoints, providerKey );
			},
			parseResponse : function ( requestResponse, itinerary ) {
				_ParseResponse ( requestResponse, itinerary );
			},
			get name ( ) { return 'mapbox';}
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getMapboxRouteProvider;
	}

}());

},{"../data/ItineraryPoint":54,"../data/Maneuver":55,"osrm-text-instructions":1,"polyline":17}],47:[function(require,module,exports){
(function (global){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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
To do: translations
*/

( function ( ){
	
	'use strict';

	var _Translator = require ( '../UI/Translator' ) ( );
	
	var getNoteEditor = function ( ) {
		
		return {
			newNote :function ( latLng ) {
				console.log ( '----' );
				var note = require ( '../data/Note' ) ( );
				//note.object = JSON.parse ( '{"iconHeight":"42","iconWidth":"42","iconContent":"iconContent","popupContent":"popupContent","tooltipContent":"tooltipContent","phone":"phone","url":"link","address":"address","categoryId":"","iconLat":0,"iconLng":0,"lat":0,"lng":0,"objId":13,"objType":{"name":"Note","version":"1.0.0"}}' );
				note.latLng = latLng;
				note.iconContent = '<div class="TravelNotes-MapNote TravelNotes-MapNoteCategory-0001"></div>';
				console.log ( note.object );
				require ( '../UI/NoteDialog' ) ( note );
			},
			addNote : function ( note ) {
				console.log ( note.object );
				global.travelData.notes.add ( note );
				require ( '../core/MapEditor' ) ( ).addTravelNote ( note );
			},				
			getMapContextMenu :function ( latLng ) {
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "NoteEditor - new note" ), 
						action : this.newNote,
						param : latLng
					} 
				);
				return contextMenu;
			},

		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getNoteEditor;
	}

}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../UI/NoteDialog":37,"../UI/Translator":40,"../core/MapEditor":45,"../data/Note":56}],48:[function(require,module,exports){
(function (global){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

( function ( ){
	
	'use strict';

	
	var getRouteEditor = function ( ) {

		var _Config = require ( '../util/Config' ) ( );
		
		var _Translator = require ( '../UI/Translator' ) ( );

		var _RouteEditorUI = require ( '../UI/RouteEditorUI' ) ( );
		
		return {
			startRouting : function ( ) {
			if ( ! _Config.routing.auto ) {
				return;
			}
			
			require ( './MapEditor' ) ( ).removeObject ( global.editedRoute.objId );
			require ( './Router' ) ( ).startRouting ( global.editedRoute );
			},
			
			endRouting : function ( ) {
				require ( './ItineraryEditor' ) ( ).setItinerary ( );
				require ( './MapEditor' ) ( ).addRoute ( global.editedRoute );
			},
			
			saveEdition : function ( ) {
				var newRouteObjId = global.travelData.routes.replace ( global.editedRoute.routeInitialObjId, global.editedRoute );
				global.editedRoute.routeChanged = false;
				// It's needed to rewrite the route list due to objId's changes
				require ( '../UI/TravelEditorUI') ( ).setRoutesList ( );
				this.clear ( );
			},
			
			cancelEdition : function ( ) {
				require ( './MapEditor' ) ( ).removeObject ( global.editedRoute.objId );
				require ( './MapEditor' ) ( ).addRoute ( global.travelData.routes.getAt ( global.editedRoute.routeInitialObjId ) );
				global.editedRoute.routeChanged = false;
				this.clear ( );
			},
			
			editRoute : function ( routeObjId ) { 
				if ( global.editedRoute.routeChanged ) {
					require ( './ErrorEditor' ) ( ).showError ( _Translator.getText ( "RouteEditor-Not possible to edit a route without a save or cancel" ) );
					return;
				}
				global.editedRoute = require ( '../Data/Route' ) ( );
				var route = global.travelData.routes.getAt ( routeObjId );
				global.editedRoute.routeInitialObjId = route.objId;
				// Route is cloned, so we can have a cancel button in the editor
				global.editedRoute.object = route.object;
				_RouteEditorUI .expand ( );
				_RouteEditorUI.setWayPointsList ( );
				require ( './ItineraryEditor' ) ( ).setItinerary ( );
				require ( './MapEditor' ) ( ).removeObject ( routeObjId );
				require ( './MapEditor' ) ( ).addRoute ( global.editedRoute );
			},
			
			removeRoute : function ( routeObjId ) { 
				require ( './TravelEditor' ) ( ).removeRoute ( routeObjId );
			},
			
			addWayPoint : function ( latLng ) {
				global.editedRoute.routeChanged = true;
				var newWayPoint = require ( '../Data/Waypoint.js' ) ( );
				if ( latLng ) {
					newWayPoint.latLng = latLng;
				}
				global.editedRoute.wayPoints.add ( newWayPoint );
				global.editedRoute.wayPoints.swap ( newWayPoint.objId, true );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			reverseWayPoints : function ( ) {
				global.editedRoute.routeChanged = true;
				global.editedRoute.wayPoints.reverse ( );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			removeAllWayPoints : function ( ) {
				global.editedRoute.routeChanged = true;
				global.editedRoute.wayPoints.removeAll ( true );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			removeWayPoint : function ( wayPointObjId ) {
				global.editedRoute.routeChanged = true;
				global.editedRoute.wayPoints.remove ( wayPointObjId );
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			renameWayPoint : function ( wayPointObjId, wayPointName ) {
				global.editedRoute.routeChanged = true;
				global.editedRoute.wayPoints.getAt ( wayPointObjId ).name = wayPointName;
				_RouteEditorUI.setWayPointsList ( );
			},
			
			swapWayPoints : function ( wayPointObjId, swapUp ) {
				global.editedRoute.routeChanged = true;
				global.editedRoute.wayPoints.swap ( wayPointObjId, swapUp );
				_RouteEditorUI.setWayPointsList (  );
				this.startRouting ( );
			},
			
			getMapContextMenu :function ( latLng ) {
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Select this point as start point" ), 
						action : ( -1 !== global.editedRoute.routeInitialObjId ) ? this.setStartPoint : null,
						param : latLng
					} 
				);
				contextMenu.push ( 
					{
						context : this, 
						name : _Translator.getText ( "RouteEditor - Select this point as way point" ), 
						action : ( -1 !== global.editedRoute.routeInitialObjId ) ? this.addWayPoint : null,
						param : latLng
					}
				);
				contextMenu.push (
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Select this point as end point" ), 
						action : ( -1 !== global.editedRoute.routeInitialObjId ) ? this.setEndPoint : null,
						param : latLng
					}
				);
				return contextMenu;
			},
			
			getRouteContextMenu : function ( routeObjId ) {
				var contextMenu = [];
				contextMenu.push ( 
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Edit this route" ), 
						action : ( ( global.editedRoute.routeInitialObjId !== routeObjId ) && ( ! global.editedRoute.routeChanged ) ) ? this.editRoute : null,
						param: routeObjId
					} 
				);
				contextMenu.push ( 
					{
						context : this, 
						name : _Translator.getText ( "RouteEditor - Delete this route" ), 
						action : ( ( global.editedRoute.routeInitialObjId !== routeObjId ) && ( ! global.editedRoute.routeChanged ) ) ? this.removeRoute :null,
						param: routeObjId
					}
				);
				contextMenu.push (
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Save modifications on this route" ), 
						action : ( global.editedRoute.routeInitialObjId === routeObjId ) ? this.saveEdition : null,
					}
				);
				contextMenu.push (
					{ 
						context : this, 
						name : _Translator.getText ( "RouteEditor - Cancel modifications on this route" ), 
						action : ( global.editedRoute.routeInitialObjId === routeObjId ) ? this.cancelEdition : null
					}
				);
				return contextMenu;
			},
			
			setStartPoint : function ( latLng ) {
				global.editedRoute.routeChanged = true;
				global.editedRoute.wayPoints.first.latLng = latLng;
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			setEndPoint : function ( latLng ) {
				global.editedRoute.routeChanged = true;
				global.editedRoute.wayPoints.last.latLng = latLng;
				_RouteEditorUI.setWayPointsList ( );
				this.startRouting ( );
			},
			
			clear : function ( ) {
					global.editedRoute = require ( '../data/Route' ) ( );
					global.editedRoute.routeChanged = false;
					global.editedRoute.routeInitialObjId = -1;
					require ( '../UI/RouteEditorUI' ) ( ).setWayPointsList (  );
					require ( '../UI/ItineraryEditorUI' ) ( ).setItinerary ( );
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRouteEditor;
	}

}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../Data/Route":26,"../Data/Waypoint.js":29,"../UI/ItineraryEditorUI":36,"../UI/RouteEditorUI":38,"../UI/Translator":40,"../UI/TravelEditorUI":41,"../data/Route":59,"../util/Config":62,"./ErrorEditor":43,"./ItineraryEditor":44,"./MapEditor":45,"./Router":49,"./TravelEditor":50}],49:[function(require,module,exports){
(function (global){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

( function ( ){
	
	'use strict';

	var _RouteProvider = require ( './MapboxRouteProvider' ) ( );
	var _RequestStarted = false;
	
	var getRouter = function ( ) {

		var _HaveValidWayPoints = function ( ) {
			return global.editedRoute.wayPoints.forEach ( 
				function ( wayPoint, result ) {
					if ( null === result ) { 
						result = true;
					}
					result &= ( ( 0 !== wayPoint.lat ) &&  ( 0 !== wayPoint.lng ) );
					return result;
				}
			);
		};
		
		var _ParseResponse = function ( requestResponse ) {
			_RouteProvider.parseResponse ( requestResponse, global.editedRoute );
			_RequestStarted = false;			
			require ( './RouteEditor' ) ( ).endRouting ( );
		};
		
		var _ParseError = function ( status, statusText ) {
			_RequestStarted = false;
			console.log ( "Response status: %d (%s)", status, statusText);
		};
		
		var _StartRequest = function ( ) {

			_RequestStarted = true;
		
			var providerKey = '';
			if ( require ( '../util/Utilities' ) ( ).storageAvailable ( 'sessionStorage' ) ) {
				providerKey = atob ( sessionStorage.getItem ( _RouteProvider.name ) );
			}
			
			var xmlHttpRequest = new XMLHttpRequest ( );
			xmlHttpRequest.onreadystatechange = function ( event ) {
				if ( this.readyState === XMLHttpRequest.DONE ) {
					if ( this.status === 200 ) {
						_ParseResponse ( this.responseText );
					} 
					else {
						_ParseError ( this.status, this.statusText );
					}
				}
			};
			xmlHttpRequest.open ( 
				'GET',
				_RouteProvider.getUrl ( global.editedRoute.wayPoints, providerKey ),
				true
			);
			xmlHttpRequest.send ( null );
			
			//_ParseResponse ('{"waypoints":[{"name":"Rue dèl Creû","location":[5.491895,50.508507]},{"name":"Basse Voie","location":[5.493796,50.508389]}],"routes":[{"legs":[{"steps":[{"intersections":[{"out":0,"entry":[true],"location":[5.491895,50.508507],"bearings":[57]}],"geometry":"ulxi_BmjenImRum@{CkQ","duration":24.8,"distance":85.7,"name":"Rue dèl Creû","weight":50.7,"mode":"driving","maneuver":{"bearing_after":57,"bearing_before":0,"type":"depart","location":[5.491895,50.508507],"instruction":"Head northeast on Rue dèl Creû"}},{"intersections":[{"out":0,"in":1,"entry":[true,false,true],"location":[5.492936,50.508896],"bearings":[135,225,315]},{"out":1,"in":2,"entry":[true,true,false],"location":[5.493132,50.508798],"bearings":[45,135,315]}],"geometry":"_eyi_BokgnIbEgKdFgMjQgZ","duration":18.1,"distance":83.2,"name":"Basse Voie","weight":33.5,"mode":"driving","maneuver":{"bearing_after":127,"location":[5.492936,50.508896],"type":"turn","bearing_before":49,"modifier":"right","instruction":"Turn right onto Basse Voie"}},{"intersections":[{"in":0,"entry":[true],"location":[5.493796,50.508389],"bearings":[317]}],"geometry":"iexi_BgainI","duration":0,"distance":0,"name":"Basse Voie","weight":0,"mode":"driving","maneuver":{"bearing_after":0,"location":[5.493796,50.508389],"type":"arrive","bearing_before":137,"modifier":"right","instruction":"You have arrived at your destination, on the right"}}],"weight":84.2,"distance":168.9,"annotation":{"distance":[63.15520198369543,22.533279297721318,17.6359876189832,20.584291773535234,44.94976490861426]},"summary":"Rue dèl Creû, Basse Voie","duration":42.9}],"weight_name":"routability","geometry":"ulxi_BmjenImRum@{CkQbEgKdFgMjQgZ","weight":84.2,"distance":168.9,"duration":42.9}],"code":"Ok","uuid":"cj79efog600szv1nnqg7kb0ki"}');
		};
		
		var _StartRouting = function ( ) {
			if ( _RequestStarted ) {
				return;
			}
			if ( ! _HaveValidWayPoints ( ) ) {
				return;
			}
			_StartRequest ( );
		};
	
		return {
			startRouting : function ( ) {
				_StartRouting ( );
			}
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getRouter;
	}

}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../util/Utilities":63,"./MapboxRouteProvider":46,"./RouteEditor":48}],50:[function(require,module,exports){
(function (global){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

( function ( ){
	
	'use strict';
	
	var _Config = require ( '../util/Config' ) ( );
	var _Translator = require ( '../UI/Translator' ) ( );

	var getTravelEditor = function ( ) {

		var _TravelEditorUI = require ( '../UI/TravelEditorUI' ) ( );
		var _Translator = require ( '../UI/Translator' ) ( );

		return {
			
			addRoute : function ( ) {
				global.travelData.routes.add ( require ( '../Data/Route' ) ( ) );
				_TravelEditorUI.setRoutesList ( );
			},

			editRoute : function ( routeObjId ) {
				require ( './RouteEditor' ) ( ).editRoute ( routeObjId );
			},

			removeRoute : function ( routeObjId ) {
				if ( routeObjId === global.editedRoute.routeInitialObjId && global.editedRoute.routeChanged ) {
					require ( './ErrorEditor' ) ( ).showError ( _Translator.getText ( 'TravelEditor - cannot remove an edited route' ) );
				}
				else {
					require ( './MapEditor' ) ( ).removeObject ( routeObjId );
					global.travelData.routes.remove ( routeObjId );
					_TravelEditorUI.setRoutesList ( );
					if ( routeObjId === global.editedRoute.routeInitialObjId  ) {
						require ( './RouteEditor') ( ).clear ( );
					}
				}
			},

			renameRoute : function ( routeObjId, routeName ) {
				global.travelData.routes.getAt ( routeObjId ).name = routeName;
				_TravelEditorUI.setRoutesList ( );
				if ( routeObjId === global.editedRoute.routeInitialObjId ) {
					global.editedRoute.name = routeName;
				}
			},

			swapRoute : function ( routeObjId, swapUp ) {
				global.travelData.routes.swap ( routeObjId, swapUp );
				_TravelEditorUI.setRoutesList ( );
			},
			
			saveTravel : function ( ) {
				if ( global.editedRoute.routeChanged ) {
					require ( './ErrorEditor' ) ( ).showError ( _Translator.getText ( "TravelEditor - Not possible to save a travel without a save or cancel" ) );
				}
				else {
					require ( '../util/Utilities' ) ( ).saveFile ( 'TravelData.trv', JSON.stringify ( global.travelData.object ) );
				}
			},
			
			openTravel : function ( event ) {
				var fileReader = new FileReader( );
				fileReader.onload = function ( event ) {
					global.travelData.object = JSON.parse ( fileReader.result ) ;
					require ( '../core/RouteEditor' ) ( ).clear ( );
					require ( '../UI/TravelEditorUI' ) ( ). setRoutesList ( );
					require ( '../core/MapEditor' ) ( ).removeAllObjects ( );
					require ( '../core/MapEditor' ) ( ).addRoutes ( );
				};
				fileReader.readAsText ( event.target.files [ 0 ] );
			},
			
			clear : function ( ) {
				global.editedRoute = require ( '../Data/Route') ( );
				global.editedRoute.routeChanged = false;
				global.editedRoute.routeInitialObjId = -1;
				global.travelData = require ( '../Data/TravelData' ) ( );
				require ( '../core/RouteEditor' ) ( ).clear ( );
				require ( '../UI/TravelEditorUI' ) ( ). setRoutesList ( );
				require ( '../core/MapEditor' ) ( ).removeAllObjects ( );
			}
		};
	};

	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getTravelEditor;
	}

}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../Data/Route":26,"../Data/TravelData":27,"../UI/Translator":40,"../UI/TravelEditorUI":41,"../core/MapEditor":45,"../core/RouteEditor":48,"../util/Config":62,"../util/Utilities":63,"./ErrorEditor":43,"./MapEditor":45,"./RouteEditor":48}],51:[function(require,module,exports){
arguments[4][18][0].apply(exports,arguments)
},{"./ItineraryPoint":54,"./Maneuver":55,"./Note":56,"./Route":59,"./WayPoint":60,"dup":18}],52:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"../UI/Translator":40,"./ObjId":57,"./ObjType":58,"dup":19}],53:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"../UI/Translator":40,"./Collection":51,"./ObjId":57,"./ObjType":58,"dup":20}],54:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"../UI/Translator":40,"./ObjId":57,"./ObjType":58,"dup":21}],55:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"../UI/Translator":40,"./ObjId":57,"./ObjType":58,"dup":22}],56:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"../UI/Translator":40,"./ObjId":57,"./ObjType":58,"dup":23}],57:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"dup":24}],58:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"dup":25}],59:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"../UI/Translator":40,"./Collection":51,"./Geom":52,"./Itinerary":53,"./ObjId":57,"./ObjType":58,"./Waypoint":61,"dup":26}],60:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"../UI/Translator":40,"./ObjId":57,"./ObjType":58,"dup":28}],61:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"../UI/Translator":40,"./ObjId":57,"./ObjType":58,"dup":28}],62:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/
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


(function() {
	
	'use strict';
	
	var getConfig = function ( ) {
		
		return {
			routing : {
				auto : true
			},
			language : 'fr',
			itineraryPointMarker : {
				color : 'red',
				weight : 2,
				radius : 7,
				fill : false
			},
			itineraryPointZoom: 17,
			routeEditor : {
				clearAfterCancel : true,
				clearAfterSave : false,
			},
			travelEditor : {
				clearAfterSave : true
			}
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getConfig;
	}

} ) ( );

},{}],63:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/
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


(function() {
	
	'use strict';
	
	var _Translator = require ( '../UI/Translator' ) ( );
	
	var getUtilities = function ( ) {
		return {
			/* 
			--- storageAvailable function ------------------------------------------------------------------------------------------
			
			This function test if the storage API is available ( the API can be deactived by user....)
			Adapted from MDN :-)

			------------------------------------------------------------------------------------------------------------------------
			*/
			
			storageAvailable: function ( type ) {
				try {
					var storage = window [ type ];
					var	x = '__storage_test__';
					storage.setItem ( x, x );
					storage.removeItem ( x );
					return true;
				}
				catch ( e ) {
					return false;
				}				
			},
			/* --- End of storageAvailable function --- */		

			/* 
			--- fileAPIAvailable function ------------------------------------------------------------------------------------------
			
			This function test if the File API is available 

			------------------------------------------------------------------------------------------------------------------------
			*/

			fileAPIAvailable : function ( ) {
				try {
					// FF...
					var testFileData = new File ( [ 'testdata' ], { type: 'text/plain' } );
					return true;
				}
				catch ( Error ) {
					if (window.navigator.msSaveOrOpenBlob ) {
					//edge IE 11...
						return true;
					}
					else {
						return false;
					}
				}
			},
			/* 
			--- saveFile function --------------------------------------------------------------------------------------------------
			
			This function data to a local file

			------------------------------------------------------------------------------------------------------------------------
			*/

			saveFile : function ( filename, text, type ) {
				if ( ! type ) {
					type = 'text/plain';
				}
				if ( window.navigator.msSaveOrOpenBlob ) {
					//https://msdn.microsoft.com/en-us/library/hh779016(v=vs.85).aspx
					//edge IE 11...
					try {
						window.navigator.msSaveOrOpenBlob ( new Blob ( [ text ] ), filename ); 
					}
					catch ( Error ) {
					}
				}
				else {
					// FF...
					// http://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
					try {
						var mapFile = window.URL.createObjectURL ( new File ( [ text ], { type: type } ) );
						var element = document.createElement ( 'a' );
						element.setAttribute( 'href', mapFile );
						element.setAttribute( 'download', filename );
						element.style.display = 'none';
						document.body.appendChild ( element );
						element.click ( );
						document.body.removeChild ( element );
						window.URL.revokeObjectURL ( mapFile );
					}
					catch ( Error ) {
					}				
				}
			},
			
			formatTime : function ( time ) {
				time = Math.floor ( time );
				if ( 0 === time ) {
					return '';
				}
				var days = Math.floor ( time / 86400 );
				var hours = Math.floor ( time % 86400 / 3600 );
				var minutes = Math.floor ( time % 3600 / 60 );
				var seconds = Math.floor ( time % 60 );
				if ( 0 < days ) {
					return days + '&nbsp;' + _Translator.getText ( 'Utilities - day' ) + '&nbsp;' + hours + '&nbsp;h';
				}
				else if ( 0 < hours ) {
					return hours + '&nbsp;' + _Translator.getText ( 'Utilities - hour' ) +'&nbsp;' + minutes + '&nbsp;' + _Translator.getText ( 'Utilities - minute' );
				}
				else if ( 0 < minutes ) {
					return minutes + '&nbsp;' + _Translator.getText ( 'Utilities - minute' );
				}
				else {
					return seconds + '&nbsp;' + _Translator.getText ( 'Utilities - second' );
				}
				return '';
			},
			
			formatDistance : function ( distance ) {
				distance = Math.floor ( distance );
				if ( 0 === distance ) {
					return '';
				} 
				else if ( 1000 > distance ) {
					return distance + '&nbsp;m';
				}
				else {
					return Math.floor ( distance / 1000 ) +'.' + Math.floor ( ( distance % 1000 ) / 100 ) + '&nbsp;km';
				}
			},
			
			readURL : function ( ) {
				var urlSearch = decodeURI ( window.location.search ).substr ( 1 ).split ( '&' );
				var newUrlSearch = '?' ;
				for ( var urlCounter = 0; urlCounter < urlSearch.length; urlCounter ++ ) {
					var param = urlSearch [ urlCounter ].split ( '=' );
					if ( ( 2 === param.length ) && ( -1 !== param [ 0 ].indexOf ( 'ProviderKey' ) ) ) {
						if ( this.storageAvailable ( 'sessionStorage' ) ) {
							sessionStorage.setItem ( 
								param [ 0 ].substr ( 0, param [ 0 ].length - 11 ).toLowerCase ( ),
								btoa ( param [ 1 ] )
							);
						}
					}
					else {
						newUrlSearch += ( newUrlSearch === '?' ) ? '' :  '&';
						newUrlSearch += urlSearch [ urlCounter ];
					}
					
				}
				var stateObj = { index: "bar" };
				history.pushState(stateObj, "page", newUrlSearch );
			}
		};
	};
	
	/* --- End of getTravelData function --- */
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getUtilities;
	}

} ) ( );

},{"../UI/Translator":40}]},{},[31]);
