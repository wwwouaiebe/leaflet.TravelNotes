(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var languages = require('./languages');
var instructions = languages.instructions;
var grammars = languages.grammars;
var abbreviations = languages.abbreviations;

module.exports = function(version) {
    Object.keys(instructions).forEach(function(code) {
        if (!instructions[code][version]) { throw 'invalid version ' + version + ': ' + code + ' not supported'; }
    });

    return {
        capitalizeFirstLetter: function(language, string) {
            return string.charAt(0).toLocaleUpperCase(language) + string.slice(1);
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
        getWayName: function(language, step, options) {
            var classes = options ? options.classes || [] : [];
            if (typeof step !== 'object') throw new Error('step must be an Object');
            if (!language) throw new Error('No language code provided');
            if (!Array.isArray(classes)) throw new Error('classes must be an Array or undefined');

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
            var wayMotorway = classes.indexOf('motorway') !== -1;

            if (name && ref && name !== ref && !wayMotorway) {
                var phrase = instructions[language][version].phrase['name and ref'] ||
                    instructions.en[version].phrase['name and ref'];
                wayName = this.tokenize(language, phrase, {
                    name: name,
                    ref: ref
                }, options);
            } else if (name && ref && wayMotorway && (/\d/).test(ref)) {
                wayName = options && options.formatToken ? options.formatToken('ref', ref) : ref;
            } else if (!name && ref) {
                wayName = options && options.formatToken ? options.formatToken('ref', ref) : ref;
            } else {
                wayName = options && options.formatToken ? options.formatToken('name', name) : name;
            }

            return wayName;
        },

        /**
         * Formulate a localized text instruction from a step.
         *
         * @param  {string} language           Language code.
         * @param  {object} step               Step including maneuver property.
         * @param  {object} opts               Additional options.
         * @param  {string} opts.legIndex      Index of leg in the route.
         * @param  {string} opts.legCount      Total number of legs in the route.
         * @param  {array}  opts.classes       List of road classes.
         * @param  {string} opts.waypointName  Name of waypoint for arrival instruction.
         *
         * @return {string} Localized text instruction.
         */
        compile: function(language, step, opts) {
            if (!language) throw new Error('No language code provided');
            if (languages.supportedCodes.indexOf(language) === -1) throw new Error('language code ' + language + ' not loaded');
            if (!step.maneuver) throw new Error('No step maneuver provided');
            var options = opts || {};

            var type = step.maneuver.type;
            var modifier = step.maneuver.modifier;
            var mode = step.mode;
            // driving_side will only be defined in OSRM 5.14+
            var side = step.driving_side;

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
            } else {
              // omit side from off ramp if same as driving_side
              // note: side will be undefined if the input is from OSRM <5.14
              // but the condition should still evaluate properly regardless
                var omitSide = type === 'off ramp' && modifier.indexOf(side) >= 0;
                if (instructions[language][version][type][modifier] && !omitSide) {
                    instructionObject = instructions[language][version][type][modifier];
                } else {
                    instructionObject = instructions[language][version][type].default;
                }
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
            var wayName = this.getWayName(language, step, options);

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
            } else if (options.waypointName && instructionObject.named) {
                instruction = instructionObject.named;
            } else {
                instruction = instructionObject.default;
            }

            var destinations = step.destinations && step.destinations.split(': ');
            var destinationRef = destinations && destinations[0].split(',')[0];
            var destination = destinations && destinations[1] && destinations[1].split(',')[0];
            var firstDestination;
            if (destination && destinationRef) {
                firstDestination = destinationRef + ': ' + destination;
            } else {
                firstDestination = destinationRef || destination || '';
            }

            var nthWaypoint = options.legIndex >= 0 && options.legIndex !== options.legCount - 1 ? this.ordinalize(language, options.legIndex + 1) : '';

            // Replace tokens
            // NOOP if they don't exist
            var replaceTokens = {
                'way_name': wayName,
                'destination': firstDestination,
                'exit': (step.exits || '').split(';')[0],
                'exit_number': this.ordinalize(language, step.maneuver.exit || 1),
                'rotary_name': step.rotary_name,
                'lane_instruction': laneInstruction,
                'modifier': instructions[language][version].constants.modifier[modifier],
                'direction': this.directionFromDegree(language, step.maneuver.bearing_after),
                'nth': nthWaypoint,
                'waypoint_name': options.waypointName
            };

            return this.tokenize(language, instruction, replaceTokens, options);
        },
        grammarize: function(language, name, grammar) {
            if (!language) throw new Error('No language code provided');
            // Process way/rotary name with applying grammar rules if any
            if (name && grammar && grammars && grammars[language] && grammars[language][version]) {
                var rules = grammars[language][version][grammar];
                if (rules) {
                    // Pass original name to rules' regular expressions enclosed with spaces for simplier parsing
                    var n = ' ' + name + ' ';
                    var flags = grammars[language].meta.regExpFlags || '';
                    rules.forEach(function(rule) {
                        var re = new RegExp(rule[0], flags);
                        n = n.replace(re, rule[1]);
                    });

                    return n.trim();
                }
            }

            return name;
        },
        abbreviations: abbreviations,
        tokenize: function(language, instruction, tokens, options) {
            if (!language) throw new Error('No language code provided');
            // Keep this function context to use in inline function below (no arrow functions in ES4)
            var that = this;
            var startedWithToken = false;
            var output = instruction.replace(/\{(\w+)(?::(\w+))?\}/g, function(token, tag, grammar, offset) {
                var value = tokens[tag];

                // Return unknown token unchanged
                if (typeof value === 'undefined') {
                    return token;
                }

                value = that.grammarize(language, value, grammar);

                // If this token appears at the beginning of the instruction, capitalize it.
                if (offset === 0 && instructions[language].meta.capitalizeFirstLetter) {
                    startedWithToken = true;
                    value = that.capitalizeFirstLetter(language, value);
                }

                if (options && options.formatToken) {
                    value = options.formatToken(tag, value);
                }

                return value;
            })
            .replace(/ {2}/g, ' '); // remove excess spaces

            if (!startedWithToken && instructions[language].meta.capitalizeFirstLetter) {
                return this.capitalizeFirstLetter(language, output);
            }

            return output;
        }
    };
};

},{"./languages":2}],2:[function(require,module,exports){
// Load all language files explicitly to allow integration
// with bundling tools like webpack and browserify
var instructionsDa = require('./languages/translations/da.json');
var instructionsDe = require('./languages/translations/de.json');
var instructionsEn = require('./languages/translations/en.json');
var instructionsEo = require('./languages/translations/eo.json');
var instructionsEs = require('./languages/translations/es.json');
var instructionsEsEs = require('./languages/translations/es-ES.json');
var instructionsFi = require('./languages/translations/fi.json');
var instructionsFr = require('./languages/translations/fr.json');
var instructionsHe = require('./languages/translations/he.json');
var instructionsId = require('./languages/translations/id.json');
var instructionsIt = require('./languages/translations/it.json');
var instructionsKo = require('./languages/translations/ko.json');
var instructionsMy = require('./languages/translations/my.json');
var instructionsNl = require('./languages/translations/nl.json');
var instructionsNo = require('./languages/translations/no.json');
var instructionsPl = require('./languages/translations/pl.json');
var instructionsPtBr = require('./languages/translations/pt-BR.json');
var instructionsPtPt = require('./languages/translations/pt-PT.json');
var instructionsRo = require('./languages/translations/ro.json');
var instructionsRu = require('./languages/translations/ru.json');
var instructionsSv = require('./languages/translations/sv.json');
var instructionsTr = require('./languages/translations/tr.json');
var instructionsUk = require('./languages/translations/uk.json');
var instructionsVi = require('./languages/translations/vi.json');
var instructionsZhHans = require('./languages/translations/zh-Hans.json');

// Load all grammar files
var grammarFr = require('./languages/grammar/fr.json');
var grammarRu = require('./languages/grammar/ru.json');

// Load all abbreviations files
var abbreviationsBg = require('./languages/abbreviations/bg.json');
var abbreviationsCa = require('./languages/abbreviations/ca.json');
var abbreviationsDa = require('./languages/abbreviations/da.json');
var ebbreviationsDe = require('./languages/abbreviations/de.json');
var abbreviationsEn = require('./languages/abbreviations/en.json');
var abbreviationsEs = require('./languages/abbreviations/es.json');
var abbreviationsFr = require('./languages/abbreviations/fr.json');
var abbreviationsHe = require('./languages/abbreviations/he.json');
var abbreviationsHu = require('./languages/abbreviations/hu.json');
var abbreviationsLt = require('./languages/abbreviations/lt.json');
var abbreviationsNl = require('./languages/abbreviations/nl.json');
var abbreviationsRu = require('./languages/abbreviations/ru.json');
var abbreviationsSl = require('./languages/abbreviations/sl.json');
var abbreviationsSv = require('./languages/abbreviations/sv.json');
var abbreviationsUk = require('./languages/abbreviations/uk.json');
var abbreviationsVi = require('./languages/abbreviations/vi.json');

// Create a list of supported codes
var instructions = {
    'da': instructionsDa,
    'de': instructionsDe,
    'en': instructionsEn,
    'eo': instructionsEo,
    'es': instructionsEs,
    'es-ES': instructionsEsEs,
    'fi': instructionsFi,
    'fr': instructionsFr,
    'he': instructionsHe,
    'id': instructionsId,
    'it': instructionsIt,
    'ko': instructionsKo,
    'my': instructionsMy,
    'nl': instructionsNl,
    'no': instructionsNo,
    'pl': instructionsPl,
    'pt-BR': instructionsPtBr,
    'pt-PT': instructionsPtPt,
    'ro': instructionsRo,
    'ru': instructionsRu,
    'sv': instructionsSv,
    'tr': instructionsTr,
    'uk': instructionsUk,
    'vi': instructionsVi,
    'zh-Hans': instructionsZhHans
};

// Create list of supported grammar
var grammars = {
    'fr': grammarFr,
    'ru': grammarRu
};

// Create list of supported abbrevations
var abbreviations = {
    'bg': abbreviationsBg,
    'ca': abbreviationsCa,
    'da': abbreviationsDa,
    'de': ebbreviationsDe,
    'en': abbreviationsEn,
    'es': abbreviationsEs,
    'fr': abbreviationsFr,
    'he': abbreviationsHe,
    'hu': abbreviationsHu,
    'lt': abbreviationsLt,
    'nl': abbreviationsNl,
    'ru': abbreviationsRu,
    'sl': abbreviationsSl,
    'sv': abbreviationsSv,
    'uk': abbreviationsUk,
    'vi': abbreviationsVi
};
module.exports = {
    supportedCodes: Object.keys(instructions),
    instructions: instructions,
    grammars: grammars,
    abbreviations: abbreviations
};

},{"./languages/abbreviations/bg.json":3,"./languages/abbreviations/ca.json":4,"./languages/abbreviations/da.json":5,"./languages/abbreviations/de.json":6,"./languages/abbreviations/en.json":7,"./languages/abbreviations/es.json":8,"./languages/abbreviations/fr.json":9,"./languages/abbreviations/he.json":10,"./languages/abbreviations/hu.json":11,"./languages/abbreviations/lt.json":12,"./languages/abbreviations/nl.json":13,"./languages/abbreviations/ru.json":14,"./languages/abbreviations/sl.json":15,"./languages/abbreviations/sv.json":16,"./languages/abbreviations/uk.json":17,"./languages/abbreviations/vi.json":18,"./languages/grammar/fr.json":19,"./languages/grammar/ru.json":20,"./languages/translations/da.json":21,"./languages/translations/de.json":22,"./languages/translations/en.json":23,"./languages/translations/eo.json":24,"./languages/translations/es-ES.json":25,"./languages/translations/es.json":26,"./languages/translations/fi.json":27,"./languages/translations/fr.json":28,"./languages/translations/he.json":29,"./languages/translations/id.json":30,"./languages/translations/it.json":31,"./languages/translations/ko.json":32,"./languages/translations/my.json":33,"./languages/translations/nl.json":34,"./languages/translations/no.json":35,"./languages/translations/pl.json":36,"./languages/translations/pt-BR.json":37,"./languages/translations/pt-PT.json":38,"./languages/translations/ro.json":39,"./languages/translations/ru.json":40,"./languages/translations/sv.json":41,"./languages/translations/tr.json":42,"./languages/translations/uk.json":43,"./languages/translations/vi.json":44,"./languages/translations/zh-Hans.json":45}],3:[function(require,module,exports){
module.exports={
    "abbreviations": {
        "международен": "Межд",
        "старши": "Стрш",
        "възел": "Въз",
        "пазар": "Mkt",
        "светисвети": "СвСв",
        "сестра": "сес",
        "уилям": "Ум",
        "апартаменти": "ап",
        "езеро": "Ез",
        "свети": "Св",
        "център": "Ц-р",
        "парк": "Пк",
        "маршрут": "М-т",
        "площад": "Пл",
        "национален": "Нац",
        "училище": "Уч",
        "река": "Рек",
        "поток": "П-к",
        "район": "Р-н",
        "крепост": "К-т",
        "паметник": "Пам",
        "университет": "Уни",
        "Връх": "Вр",
        "точка": "Точ",
        "планина": "Пл",
        "село": "с.",
        "височини": "вис",
        "младши": "Мл",
        "станция": "С-я",
        "проход": "Прох",
        "баща": "Бщ"
    },
    "classifications": {
        "шофиране": "Шоф",
        "плавен": "Пл",
        "място": "Мя",
        "тераса": "Тер",
        "магистрала": "М-ла",
        "площад": "Пл",
        "пеш": "Пеш",
        "залив": "З-в",
        "пътека": "П-ка",
        "платно": "Пл",
        "улица": "Ул",
        "алея": "Ал",
        "пешеходна": "Пеш",
        "точка": "Тч",
        "задминаване": "Задм",
        "кръгово": "Кр",
        "връх": "Вр",
        "съд": "Сд",
        "булевард": "Бул",
        "път": "Път",
        "скоростна": "Скор",
        "мост": "Мо"
    },
    "directions": {
        "северозапад": "СЗ",
        "североизток": "СИ",
        "югозапад": "ЮЗ",
        "югоизток": "ЮИ",
        "север": "С",
        "изток": "И",
        "юг": "Ю"
    }
}

},{}],4:[function(require,module,exports){
module.exports={
    "abbreviations": {
        "comunicacions": "Com.",
        "entitat de població": "Nucli",
        "disseminat": "Diss.",
        "cap de municipi": "Cap",
        "indret": "Indr.",
        "comarca": "Cca.",
        "relleu del litoral": "Lit.",
        "municipi": "Mun.",
        "xarxa hidrogràfica": "Curs Fluv.",
        "equipament": "Equip.",
        "orografia": "Orogr.",
        "barri": "Barri",
        "edificació": "Edif.",
        "edificació històrica": "Edif. Hist.",
        "entitat descentralitzada": "E.M.D.",
        "element hidrogràfic": "Hidr."
    },
    "classifications": {
        "rotonda": "Rot.",
        "carrerada": "Ca.",
        "jardí": "J.",
        "paratge": "Pge.",
        "pont": "Pont",
        "lloc": "Lloc",
        "rambla": "Rbla.",
        "cases": "Cses.",
        "barranc": "Bnc.",
        "plana": "Plana",
        "polígon": "Pol.",
        "muralla": "Mur.",
        "enllaç": "Ellaç",
        "antiga carretera": "Actra",
        "glorieta": "Glor.",
        "autovia": "Autv.",
        "prolongació": "Prol.",
        "calçada": "Cda.",
        "carretera": "Ctra.",
        "pujada": "Pda.",
        "torrent": "T.",
        "disseminat": "Disse",
        "barri": "B.",
        "cinturó": "Cinto",
        "passera": "Psera",
        "sender": "Send.",
        "carrer": "C.",
        "sèquia": "Sèq.",
        "blocs": "Bloc",
        "rambleta": "Rblt.",
        "partida": "Par.",
        "costa": "Cos.",
        "sector": "Sec.",
        "corraló": "Crral",
        "urbanització": "Urb.",
        "autopista": "Autp.",
        "grup": "Gr.",
        "platja": "Pja.",
        "jardins": "J.",
        "complex": "Comp.",
        "portals": "Ptals",
        "finca": "Fin.",
        "travessera": "Trav.",
        "plaça": "Pl.",
        "travessia": "Trv.",
        "polígon industrial": "PI.",
        "passatge": "Ptge.",
        "apartaments": "Apmt.",
        "mirador": "Mira.",
        "antic": "Antic",
        "accés": "Acc.",
        "colònia": "Col.",
        "corriol": "Crol.",
        "portal": "Ptal.",
        "porta": "Pta.",
        "port": "Port",
        "carreró": "Cró.",
        "riera": "Ra.",
        "circumval·lació": "Cval.",
        "baixada": "Bda.",
        "placeta": "Plta.",
        "escala": "Esc.",
        "gran via": "GV",
        "rial": "Rial",
        "conjunt": "Conj.",
        "avinguda": "Av.",
        "esplanada": "Esp.",
        "cantonada": "Cant.",
        "ronda": "Rda.",
        "corredor": "Cdor.",
        "drecera": "Drec.",
        "passadís": "Pdís.",
        "viaducte": "Vdct.",
        "passeig": "Pg.",
        "veïnat": "Veï."
    },
    "directions": {
        "sudest": "SE",
        "sudoest": "SO",
        "nordest": "NE",
        "nordoest": "NO",
        "est": "E",
        "nord": "N",
        "oest": "O",
        "sud": "S"
    }
}

},{}],5:[function(require,module,exports){
module.exports={
    "abbreviations": {
        "skole": "Sk.",
        "ved": "v.",
        "centrum": "C.",
        "sankt": "Skt.",
        "vestre": "v.",
        "hospital": "Hosp.",
        "stræde": "Str.",
        "nordre": "Nr.",
        "plads": "Pl.",
        "universitet": "Uni.",
        "vænge": "vg.",
        "station": "St."
    },
    "classifications": {
        "avenue": "Ave",
        "gammel": "Gl.",
        "dronning": "Dronn.",
        "sønder": "Sdr.",
        "nørre": "Nr.",
        "vester": "V.",
        "vestre": "V.",
        "øster": "Ø.",
        "østre": "Ø.",
        "boulevard": "Boul."
    },
    "directions": {
        "sydøst": "SØ",
        "nordvest": "NV",
        "syd": "S",
        "nordøst": "NØ",
        "sydvest": "SV",
        "vest": "V",
        "nord": "N",
        "øst": "Ø"
    }
}

},{}],6:[function(require,module,exports){
module.exports={
    "abbreviations": {},
    "classifications": {},
    "directions": {
        "osten": "O",
        "nordosten": "NO",
        "süden": "S",
        "nordwest": "NW",
        "norden": "N",
        "südost": "SO",
        "südwest": "SW",
        "westen": "W"
    }
}

},{}],7:[function(require,module,exports){
module.exports={
    "abbreviations": {
        "square": "Sq",
        "centre": "Ctr",
        "sister": "Sr",
        "lake": "Lk",
        "fort": "Ft",
        "route": "Rte",
        "william": "Wm",
        "national": "Nat’l",
        "junction": "Jct",
        "center": "Ctr",
        "saint": "St",
        "saints": "SS",
        "station": "Sta",
        "mount": "Mt",
        "junior": "Jr",
        "mountain": "Mtn",
        "heights": "Hts",
        "university": "Univ",
        "school": "Sch",
        "international": "Int’l",
        "apartments": "Apts",
        "crossing": "Xing",
        "creek": "Crk",
        "township": "Twp",
        "downtown": "Dtwn",
        "father": "Fr",
        "senior": "Sr",
        "point": "Pt",
        "river": "Riv",
        "market": "Mkt",
        "village": "Vil",
        "park": "Pk",
        "memorial": "Mem"
    },
    "classifications": {
        "place": "Pl",
        "circle": "Cir",
        "bypass": "Byp",
        "motorway": "Mwy",
        "crescent": "Cres",
        "road": "Rd",
        "cove": "Cv",
        "lane": "Ln",
        "square": "Sq",
        "street": "St",
        "freeway": "Fwy",
        "walk": "Wk",
        "plaza": "Plz",
        "parkway": "Pky",
        "avenue": "Ave",
        "pike": "Pk",
        "drive": "Dr",
        "highway": "Hwy",
        "footway": "Ftwy",
        "point": "Pt",
        "court": "Ct",
        "terrace": "Ter",
        "walkway": "Wky",
        "alley": "Aly",
        "expressway": "Expy",
        "bridge": "Br",
        "boulevard": "Blvd",
        "turnpike": "Tpk"
    },
    "directions": {
        "southeast": "SE",
        "northwest": "NW",
        "south": "S",
        "west": "W",
        "southwest": "SW",
        "north": "N",
        "east": "E",
        "northeast": "NE"
    }
}

},{}],8:[function(require,module,exports){
module.exports={
    "abbreviations": {
        "segunda": "2ª",
        "octubre": "8bre",
        "doctores": "Drs",
        "doctora": "Dra",
        "internacional": "Intl",
        "doctor": "Dr",
        "segundo": "2º",
        "señorita": "Srta",
        "doctoras": "Drs",
        "primera": "1ª",
        "primero": "1º",
        "san": "S",
        "colonia": "Col",
        "doña": "Dña",
        "septiembre": "7bre",
        "diciembre": "10bre",
        "señor": "Sr",
        "ayuntamiento": "Ayto",
        "señora": "Sra",
        "tercera": "3ª",
        "tercero": "3º",
        "don": "D",
        "santa": "Sta",
        "ciudad": "Cdad",
        "noviembre": "9bre",
        "departamento": "Dep"
    },
    "classifications": {
        "camino": "Cmno",
        "avenida": "Av",
        "paseo": "Pº",
        "autopista": "Auto",
        "calle": "C",
        "plaza": "Pza",
        "carretera": "Crta"
    },
    "directions": {
        "este": "E",
        "noreste": "NE",
        "sur": "S",
        "suroeste": "SO",
        "noroeste": "NO",
        "oeste": "O",
        "sureste": "SE",
        "norte": "N"
    }
}

},{}],9:[function(require,module,exports){
module.exports={
    "abbreviations": {
        "allée": "All",
        "aérodrome": "Aérod",
        "aéroport": "Aérop"
    },
    "classifications": {
        "centrale": "Ctrale",
        "campings": "Camp.",
        "urbains": "Urb.",
        "mineure": "Min.",
        "publique": "Publ.",
        "supérieur": "Sup.",
        "fédération": "Féd.",
        "notre-dame": "ND",
        "saint": "St",
        "centre hospitalier régional": "CHR",
        "exploitation": "Exploit.",
        "général": "Gal",
        "civiles": "Civ.",
        "maritimes": "Marit.",
        "aviation": "Aviat.",
        "iii": "3",
        "archéologique": "Archéo.",
        "musical": "Music.",
        "musicale": "Music.",
        "immeuble": "Imm.",
        "xv": "15",
        "hôtel": "Hôt.",
        "alpine": "Alp.",
        "communale": "Commun.",
        "v": "5",
        "global": "Glob.",
        "université": "Univ.",
        "confédéral": "Conféd.",
        "xx": "20",
        "x": "10",
        "piscine": "Pisc.",
        "dimanche": "di.",
        "fleuve": "Flv",
        "postaux": "Post.",
        "musicienne": "Music.",
        "département": "Dépt",
        "février": "Févr.",
        "municipales": "Munic.",
        "province": "Prov.",
        "communautés": "Commtés",
        "barrage": "Barr.",
        "mercredi": "me.",
        "présidentes": "Pdtes",
        "cafétérias": "Cafét.",
        "théâtral": "Thé.",
        "viticulteur": "Vitic.",
        "poste": "Post.",
        "spécialisée": "Spéc.",
        "agriculture": "Agric.",
        "infirmier": "Infirm.",
        "animation": "Anim.",
        "mondiale": "Mond.",
        "arrêt": "Arr.",
        "zone": "zon.",
        "municipaux": "Munic.",
        "grand": "Gd",
        "janvier": "Janv.",
        "fondateur": "Fond.",
        "première": "1re",
        "municipale": "Munic.",
        "direction": "Dir.",
        "anonyme": "Anon.",
        "départementale": "Dépt",
        "moyens": "Moy.",
        "novembre": "Nov.",
        "jardin": "Jard.",
        "petites": "Pet.",
        "privé": "Priv.",
        "centres": "Ctres",
        "forestier": "Forest.",
        "xiv": "14",
        "africaines": "Afric.",
        "sergent": "Sgt",
        "européenne": "Eur.",
        "privée": "Priv.",
        "café": "Cfé",
        "xix": "19",
        "hautes": "Htes",
        "major": "Mjr",
        "vendredi": "ve.",
        "municipalité": "Munic.",
        "sous-préfecture": "Ss-préf.",
        "spéciales": "Spéc.",
        "secondaires": "Second.",
        "viie": "7e",
        "moyenne": "Moy.",
        "commerciale": "Commerc.",
        "région": "Rég.",
        "américaines": "Amér.",
        "américains": "Amér.",
        "service": "Sce",
        "professeur": "Prof.",
        "départemental": "Dépt",
        "hôtels": "Hôt.",
        "mondiales": "Mond.",
        "ire": "1re",
        "caporal": "Capo.",
        "militaire": "Milit.",
        "lycée d'enseignement professionnel": "LEP",
        "adjudant": "Adj.",
        "médicale": "Méd.",
        "conférences": "Confér.",
        "universelle": "Univ.",
        "xiie": "12e",
        "supérieures": "Sup.",
        "naturel": "Natur.",
        "société nationale": "SN",
        "hospitalier": "Hosp.",
        "culturelle": "Cult.",
        "américain": "Amér.",
        "son altesse royale": "S.A.R.",
        "infirmière": "Infirm.",
        "viii": "8",
        "fondatrice": "Fond.",
        "madame": "Mme",
        "métropolitain": "Métrop.",
        "ophtalmologues": "Ophtalmos",
        "xviie": "18e",
        "viiie": "8e",
        "commerçante": "Commerç.",
        "centre d'enseignement du second degré": "CES",
        "septembre": "Sept.",
        "agriculteur": "Agric.",
        "xiii": "13",
        "pontifical": "Pontif.",
        "cafétéria": "Cafét.",
        "prince": "Pce",
        "vie": "6e",
        "archiduchesse": "Archid.",
        "occidental": "Occ.",
        "spectacles": "Spect.",
        "camping": "Camp.",
        "métro": "Mº",
        "arrondissement": "Arrond.",
        "viticole": "Vitic.",
        "ii": "2",
        "siècle": "Si.",
        "chapelles": "Chap.",
        "centre": "Ctre",
        "sapeur-pompiers": "Sap.-pomp.",
        "établissements": "Étabts",
        "société anonyme": "SA",
        "directeurs": "Dir.",
        "vii": "7",
        "culturel": "Cult.",
        "central": "Ctral",
        "métropolitaine": "Métrop.",
        "administrations": "Admin.",
        "amiraux": "Amir.",
        "sur": "s/",
        "premiers": "1ers",
        "provence-alpes-côte d'azur": "PACA",
        "cathédrale": "Cathéd.",
        "iv": "4",
        "postale": "Post.",
        "social": "Soc.",
        "spécialisé": "Spéc.",
        "district": "Distr.",
        "technologique": "Techno.",
        "viticoles": "Vitic.",
        "ix": "9",
        "protégés": "Prot.",
        "historiques": "Hist.",
        "sous": "s/s",
        "national": "Nal",
        "ambassade": "Amb.",
        "cafés": "Cfés",
        "agronomie": "Agro.",
        "sapeurs": "Sap.",
        "petits": "Pet.",
        "monsieur": "M.",
        "boucher": "Bouch.",
        "restaurant": "Restau.",
        "lycée": "Lyc.",
        "urbaine": "Urb.",
        "préfecture": "Préf.",
        "districts": "Distr.",
        "civil": "Civ.",
        "protégées": "Prot.",
        "sapeur": "Sap.",
        "théâtre": "Thé.",
        "collège": "Coll.",
        "mardi": "ma.",
        "mémorial": "Mémor.",
        "africain": "Afric.",
        "républicaine": "Républ.",
        "sociale": "Soc.",
        "spécial": "Spéc.",
        "technologie": "Techno.",
        "charcuterie": "Charc.",
        "commerces": "Commerc.",
        "fluviale": "Flv",
        "parachutistes": "Para.",
        "primaires": "Prim.",
        "directions": "Dir.",
        "présidentiel": "Pdtl",
        "nationales": "Nales",
        "après": "apr.",
        "samedi": "sa.",
        "unité": "U.",
        "xxiii": "23",
        "associé": "Assoc.",
        "électrique": "Électr.",
        "populaire": "Pop.",
        "asiatique": "Asiat.",
        "navigable": "Navig.",
        "présidente": "Pdte",
        "xive": "14e",
        "associés": "Assoc.",
        "pompiers": "Pomp.",
        "agricoles": "Agric.",
        "élém": "Élém.",
        "décembre": "Déc.",
        "son altesse": "S.Alt.",
        "après-midi": "a.-m.",
        "mineures": "Min.",
        "juillet": "Juil.",
        "aviatrices": "Aviat.",
        "fondation": "Fond.",
        "pontificaux": "Pontif.",
        "temple": "Tple",
        "européennes": "Eur.",
        "régionale": "Rég.",
        "informations": "Infos",
        "mondiaux": "Mond.",
        "infanterie": "Infant.",
        "archéologie": "Archéo.",
        "dans": "d/",
        "hospice": "Hosp.",
        "spectacle": "Spect.",
        "hôtels-restaurants": "Hôt.-Rest.",
        "hôtel-restaurant": "Hôt.-Rest.",
        "hélicoptère": "hélico",
        "xixe": "19e",
        "cliniques": "Clin.",
        "docteur": "Dr",
        "secondaire": "Second.",
        "municipal": "Munic.",
        "générale": "Gale",
        "château": "Chât.",
        "commerçant": "Commerç.",
        "avril": "Avr.",
        "clinique": "Clin.",
        "urbaines": "Urb.",
        "navale": "Nav.",
        "navigation": "Navig.",
        "asiatiques": "Asiat.",
        "pontificales": "Pontif.",
        "administrative": "Admin.",
        "syndicat": "Synd.",
        "lundi": "lu.",
        "petite": "Pet.",
        "maritime": "Marit.",
        "métros": "Mº",
        "enseignement": "Enseign.",
        "fluviales": "Flv",
        "historique": "Hist.",
        "comtés": "Ctés",
        "résidentiel": "Résid.",
        "international": "Int.",
        "supérieure": "Sup.",
        "centre hospitalier universitaire": "CHU",
        "confédération": "Conféd.",
        "boucherie": "Bouch.",
        "fondatrices": "Fond.",
        "médicaux": "Méd.",
        "européens": "Eur.",
        "orientaux": "Ori.",
        "naval": "Nav.",
        "étang": "Étg",
        "provincial": "Prov.",
        "junior": "Jr",
        "départementales": "Dépt",
        "musique": "Musiq.",
        "directrices": "Dir.",
        "maréchal": "Mal",
        "civils": "Civ.",
        "protégé": "Prot.",
        "établissement": "Étabt",
        "trafic": "Traf.",
        "aviateur": "Aviat.",
        "archives": "Arch.",
        "africains": "Afric.",
        "maternelle": "Matern.",
        "industrielle": "Ind.",
        "administratif": "Admin.",
        "oriental": "Ori.",
        "universitaire": "Univ.",
        "majeur": "Maj.",
        "haute": "Hte",
        "communal": "Commun.",
        "petit": "Pet.",
        "commune": "Commun.",
        "exploitant": "Exploit.",
        "conférence": "Confér.",
        "monseigneur": "Mgr",
        "pharmacien": "Pharm.",
        "jeudi": "je.",
        "primaire": "Prim.",
        "hélicoptères": "hélicos",
        "agronomique": "Agro.",
        "médecin": "Méd.",
        "ve": "5e",
        "pontificale": "Pontif.",
        "ier": "1er",
        "cinéma": "Ciné",
        "fluvial": "Flv",
        "occidentaux": "Occ.",
        "commerçants": "Commerç.",
        "banque": "Bq",
        "moyennes": "Moy.",
        "pharmacienne": "Pharm.",
        "démocratique": "Dém.",
        "cinémas": "Cinés",
        "spéciale": "Spéc.",
        "présidents": "Pdts",
        "directrice": "Dir.",
        "vi": "6",
        "basse": "Bas.",
        "xve": "15e",
        "état": "É.",
        "aviateurs": "Aviat.",
        "majeurs": "Maj.",
        "infirmiers": "Infirm.",
        "église": "Égl.",
        "confédérale": "Conféd.",
        "xxie": "21e",
        "comte": "Cte",
        "européen": "Eur.",
        "union": "U.",
        "pharmacie": "Pharm.",
        "infirmières": "Infirm.",
        "comté": "Cté",
        "sportive": "Sport.",
        "deuxième": "2e",
        "xvi": "17",
        "haut": "Ht",
        "médicales": "Méd.",
        "développé": "Dévelop.",
        "bâtiment": "Bât.",
        "commerce": "Commerc.",
        "ive": "4e",
        "associatif": "Assoc.",
        "rural": "Rur.",
        "cimetière": "Cim.",
        "régional": "Rég.",
        "ferroviaire": "Ferr.",
        "vers": "v/",
        "mosquée": "Mosq.",
        "mineurs": "Min.",
        "nautique": "Naut.",
        "châteaux": "Chât.",
        "sportif": "Sport.",
        "mademoiselle": "Mle",
        "école": "Éc.",
        "doyen": "Doy.",
        "industriel": "Ind.",
        "chapelle": "Chap.",
        "sociétés": "Stés",
        "internationale": "Int.",
        "coopératif": "Coop.",
        "hospices": "Hosp.",
        "xxii": "22",
        "parachutiste": "Para.",
        "alpines": "Alp.",
        "civile": "Civ.",
        "xvie": "17e",
        "états": "É.",
        "musée": "Msée",
        "centrales": "Ctrales",
        "globaux": "Glob.",
        "supérieurs": "Sup.",
        "syndicats": "Synd.",
        "archevêque": "Archev.",
        "docteurs": "Drs",
        "bibliothèque": "Biblio.",
        "lieutenant": "Lieut.",
        "république": "Rép.",
        "vétérinaire": "Vét.",
        "départementaux": "Dépt",
        "premier": "1er",
        "fluviaux": "Flv",
        "animé": "Anim.",
        "orientales": "Ori.",
        "technologiques": "Techno.",
        "princesse": "Pse",
        "routière": "Rout.",
        "coopérative": "Coop.",
        "scolaire": "Scol.",
        "écoles": "Éc.",
        "football": "Foot",
        "territoriale": "Territ.",
        "commercial": "Commerc.",
        "mineur": "Min.",
        "millénaires": "Mill.",
        "association": "Assoc.",
        "catholique": "Cathol.",
        "administration": "Admin.",
        "mairie": "Mair.",
        "portuaire": "Port.",
        "tertiaires": "Terti.",
        "théâtrale": "Thé.",
        "palais": "Pal.",
        "troisième": "3e",
        "directeur": "Dir.",
        "vétérinaires": "Vét.",
        "faculté": "Fac.",
        "occidentales": "Occ.",
        "viticulteurs": "Vitic.",
        "xvii": "18",
        "occidentale": "Occ.",
        "amiral": "Amir.",
        "professionnel": "Profess.",
        "administratives": "Admin.",
        "commerciales": "Commerc.",
        "saints": "Sts",
        "agronomes": "Agro.",
        "stade": "Std",
        "sous-préfet": "Ss-préf.",
        "senior": "Sr",
        "agronome": "Agro.",
        "terrain": "Terr.",
        "catholiques": "Cathol.",
        "résidentielle": "Résid.",
        "grands": "Gds",
        "exploitants": "Exploit.",
        "xiiie": "13e",
        "croix": "Cx",
        "généraux": "Gaux",
        "crédit": "Créd.",
        "cimetières": "Cim.",
        "antenne": "Ant.",
        "médical": "Méd.",
        "collèges": "Coll.",
        "musicien": "Music.",
        "apostolique": "Apost.",
        "postal": "Post.",
        "territorial": "Territ.",
        "urbanisme": "Urb.",
        "préfectorale": "Préf.",
        "fondateurs": "Fond.",
        "information": "Info.",
        "églises": "Égl.",
        "ophtalmologue": "Ophtalmo",
        "congrégation": "Congrég.",
        "charcutier": "Charc.",
        "étage": "ét.",
        "consulat": "Consul.",
        "public": "Publ.",
        "ferrée": "Ferr.",
        "matin": "mat.",
        "société anonyme à responsabilité limitée": "SARL",
        "monuments": "Mmts",
        "protection": "Prot.",
        "universel": "Univ.",
        "nationale": "Nale",
        "président": "Pdt",
        "provinciale": "Prov.",
        "agriculteurs": "Agric.",
        "préfectoral": "Préf.",
        "xxe": "20e",
        "alpins": "Alp.",
        "avant": "av.",
        "infirmerie": "Infirm.",
        "deux mil": "2000",
        "rurale": "Rur.",
        "administratifs": "Admin.",
        "octobre": "Oct.",
        "archipel": "Archip.",
        "communauté": "Commté",
        "globales": "Glob.",
        "alpin": "Alp.",
        "numéros": "Nºˢ",
        "lieutenant-colonel": "Lieut.-Col.",
        "jésus-christ": "J.-C.",
        "agricole": "Agric.",
        "sa majesté": "S.Maj.",
        "associative": "Assoc.",
        "xxi": "21",
        "présidentielle": "Pdtle",
        "moyen": "Moy.",
        "fédéral": "Féd.",
        "professionnelle": "Profess.",
        "tertiaire": "Terti.",
        "ixe": "9e",
        "hôpital": "Hôp.",
        "technologies": "Techno.",
        "iiie": "3e",
        "développement": "Dévelop.",
        "monument": "Mmt",
        "forestière": "Forest.",
        "numéro": "Nº",
        "viticulture": "Vitic.",
        "traversière": "Traver.",
        "technique": "Tech.",
        "électriques": "Électr.",
        "militaires": "Milit.",
        "pompier": "Pomp.",
        "américaine": "Amér.",
        "préfet": "Préf.",
        "congrégations": "Congrég.",
        "pâtissier": "Pâtiss.",
        "mondial": "Mond.",
        "ophtalmologie": "Ophtalm.",
        "sainte": "Ste",
        "africaine": "Afric.",
        "aviatrice": "Aviat.",
        "doyens": "Doy.",
        "société": "Sté",
        "majeures": "Maj.",
        "orientale": "Ori.",
        "ministère": "Min.",
        "archiduc": "Archid.",
        "territoire": "Territ.",
        "techniques": "Tech.",
        "île-de-france": "IDF",
        "globale": "Glob.",
        "xe": "10e",
        "xie": "11e",
        "majeure": "Maj.",
        "commerciaux": "Commerc.",
        "maire": "Mair.",
        "spéciaux": "Spéc.",
        "grande": "Gde",
        "messieurs": "MM",
        "colonel": "Col.",
        "millénaire": "Mill.",
        "xi": "11",
        "urbain": "Urb.",
        "fédérale": "Féd.",
        "ferré": "Ferr.",
        "rivière": "Riv.",
        "républicain": "Républ.",
        "grandes": "Gdes",
        "régiment": "Régim.",
        "hauts": "Hts",
        "catégorie": "Catég.",
        "basses": "Bas.",
        "xii": "12",
        "agronomiques": "Agro.",
        "iie": "2e",
        "protégée": "Prot.",
        "sapeur-pompier": "Sap.-pomp."
    },
    "directions": {
        "est-nord-est": "ENE",
        "nord-est": "NE",
        "ouest": "O",
        "sud-est": "SE",
        "est-sud-est": "ESE",
        "nord-nord-est": "NNE",
        "sud": "S",
        "nord-nord-ouest": "NNO",
        "nord-ouest": "NO",
        "nord": "N",
        "ouest-sud-ouest": "OSO",
        "ouest-nord-ouest": "ONO",
        "sud-ouest": "SO",
        "sud-sud-est": "SSE",
        "sud-sud-ouest": "SSO",
        "est": "E"
    }
}

},{}],10:[function(require,module,exports){
module.exports={
    "abbreviations": {
        "שדרות": "שד'"
    },
    "classifications": {},
    "directions": {}
}

},{}],11:[function(require,module,exports){
module.exports={
    "abbreviations": {},
    "classifications": {},
    "directions": {
        "kelet": "K",
        "északkelet": "ÉK",
        "dél": "D",
        "északnyugat": "ÉNY",
        "észak": "É",
        "délkelet": "DK",
        "délnyugat": "DNY",
        "nyugat": "NY"
    }
}

},{}],12:[function(require,module,exports){
module.exports={
    "abbreviations": {
        "apartamentai": "Apt",
        "aukštumos": "Aukš",
        "centras": "Ctr",
        "ežeras": "Ež",
        "fortas": "Ft",
        "greitkelis": "Grtkl",
        "juosta": "Jst",
        "kaimas": "Km",
        "kalnas": "Kln",
        "kelias": "Kl",
        "kiemelis": "Kml",
        "miestelis": "Mstl",
        "miesto centras": "M.Ctr",
        "mokykla": "Mok",
        "nacionalinis": "Nac",
        "paminklas": "Pmkl",
        "parkas": "Pk",
        "pusratis": "Psrt",
        "sankryža": "Skrž",
        "sesė": "Sesė",
        "skveras": "Skv",
        "stotis": "St",
        "šv": "Šv",
        "tarptautinis": "Trptaut",
        "taškas": "Tšk",
        "tėvas": "Tėv",
        "turgus": "Tgs",
        "universitetas": "Univ",
        "upė": "Up",
        "upelis": "Up",
        "vieta": "Vt"
    },
    "classifications": {
        "aikštė": "a.",
        "alėja": "al.",
        "aplinkkelis": "aplinkl.",
        "autostrada": "auto.",
        "bulvaras": "b.",
        "gatvė": "g.",
        "kelias": "kel.",
        "krantinė": "krant.",
        "prospektas": "pr.",
        "plentas": "pl.",
        "skersgatvis": "skg.",
        "takas": "tak.",
        "tiltas": "tlt."
    },
    "directions": {
        "pietūs": "P",
        "vakarai": "V",
        "šiaurė": "Š",
        "šiaurės vakarai": "ŠV",
        "pietryčiai": "PR",
        "šiaurės rytai": "ŠR",
        "rytai": "R",
        "pietvakariai": "PV"
    }
}

},{}],13:[function(require,module,exports){
module.exports={
    "abbreviations": {
        "centrum": "Cntrm",
        "nationaal": "Nat’l",
        "berg": "Brg",
        "meer": "Mr",
        "kruising": "Krsng",
        "toetreden": "Ttrdn"
    },
    "classifications": {
        "bypass": "Pass",
        "brug": "Br",
        "straat": "Str",
        "rechtbank": "Rbank",
        "snoek": "Snk",
        "autobaan": "Baan",
        "terras": "Trrs",
        "punt": "Pt",
        "plaza": "Plz",
        "rijden": "Rijd",
        "parkway": "Pky",
        "inham": "Nham",
        "snelweg": "Weg",
        "halve maan": "Maan",
        "cirkel": "Crkl",
        "laan": "Ln",
        "rijbaan": "Strook",
        "weg": "Weg",
        "lopen": "Lpn",
        "autoweg": "Weg",
        "boulevard": "Blvd",
        "plaats": "Plts",
        "steeg": "Stg",
        "voetpad": "Stoep"
    },
    "directions": {
        "noordoost": "NO",
        "westen": "W",
        "zuiden": "Z",
        "zuidwest": "ZW",
        "oost": "O",
        "zuidoost": "ZO",
        "noordwest": "NW",
        "noorden": "N"
    }
}

},{}],14:[function(require,module,exports){
module.exports={
    "abbreviations": {
        "апостола": "ап.",
        "апостолов": "апп.",
        "великомученика": "вмч",
        "великомученицы": "вмц.",
        "владение": "вл.",
        "город": "г.",
        "деревня": "д.",
        "имени": "им.",
        "мученика":"мч.",
        "мучеников": "мчч.",
        "мучениц": "мцц.",
        "мученицы": "мц.",
        "озеро": "о.",
        "посёлок": "п.",
        "преподобного":  "прп.",
        "преподобных": "прпп.",
        "река": "р.",
        "святителей": "свтт.",
        "святителя": "свт.",
        "священномученика": "сщмч.",
        "священномучеников": "сщмчч.",
        "станция": "ст.",
        "участок": "уч."
    },
    "classifications": {
        "проезд": "пр-д",
        "проспект": "пр.",
        "переулок": "пер.",
        "набережная": "наб.",
        "площадь": "пл.",
        "шоссе": "ш.",
        "бульвар": "б.",
        "тупик": "туп.",
        "улица": "ул."
    },
    "directions": {
        "восток": "В",
        "северо-восток": "СВ",
        "юго-восток": "ЮВ",
        "юго-запад": "ЮЗ",
        "северо-запад": "СЗ",
        "север": "С",
        "запад": "З",
        "юг": "Ю"
    }
}

},{}],15:[function(require,module,exports){
module.exports={
    "abbreviations": {},
    "classifications": {},
    "directions": {
        "vzhod": "V",
        "severovzhod": "SV",
        "jug": "J",
        "severozahod": "SZ",
        "sever": "S",
        "jugovzhod": "JV",
        "jugozahod": "JZ",
        "zahod": "Z"
    }
}

},{}],16:[function(require,module,exports){
module.exports={
    "abbreviations": {
        "sankta": "s:ta",
        "gamla": "G:la",
        "sankt": "s:t"
    },
    "classifications": {
        "Bro": "Br"
    },
    "directions": {
        "norr": "N",
        "sydöst": "SO",
        "väster": "V",
        "öster": "O",
        "nordväst": "NV",
        "sydväst": "SV",
        "söder": "S",
        "nordöst": "NO"
    }
}

},{}],17:[function(require,module,exports){
module.exports={
    "abbreviations": {},
    "classifications": {},
    "directions": {
        "схід": "Сх",
        "північний схід": "ПнСх",
        "південь": "Пд",
        "північний захід": "ПнЗд",
        "північ": "Пн",
        "південний схід": "ПдСх",
        "південний захід": "ПдЗх",
        "захід": "Зх"
    }
}

},{}],18:[function(require,module,exports){
module.exports={
    "abbreviations": {
        "viện bảo tàng": "VBT",
        "thị trấn": "Tt",
        "đại học": "ĐH",
        "căn cứ không quan": "CCKQ",
        "câu lạc bộ": "CLB",
        "bưu điện": "BĐ",
        "khách sạn": "KS",
        "khu du lịch": "KDL",
        "khu công nghiệp": "KCN",
        "khu nghỉ mát": "KNM",
        "thị xã": "Tx",
        "khu chung cư": "KCC",
        "phi trường": "PT",
        "trung tâm": "TT",
        "tổng công ty": "TCty",
        "trung học cơ sở": "THCS",
        "sân bay quốc tế": "SBQT",
        "trung học phổ thông": "THPT",
        "cao đẳng": "CĐ",
        "công ty": "Cty",
        "sân bay": "SB",
        "thành phố": "Tp",
        "công viên": "CV",
        "sân vận động": "SVĐ",
        "linh mục": "LM",
        "vườn quốc gia": "VQG"
    },
    "classifications": {
        "huyện lộ": "HL",
        "đường tỉnh": "ĐT",
        "quốc lộ": "QL",
        "xa lộ": "XL",
        "hương lộ": "HL",
        "tỉnh lộ": "TL",
        "đường huyện": "ĐH",
        "đường cao tốc": "ĐCT",
        "đại lộ": "ĐL",
        "việt nam": "VN",
        "quảng trường": "QT",
        "đường bộ": "ĐB"
    },
    "directions": {
        "tây": "T",
        "nam": "N",
        "đông nam": "ĐN",
        "đông bắc": "ĐB",
        "tây nam": "TN",
        "đông": "Đ",
        "bắc": "B"
    }
}

},{}],19:[function(require,module,exports){
module.exports={
    "meta": {
        "regExpFlags": "gi"
    },
    "v5": {
        "article": [
            ["^ Acc[èe]s ", " l’accès "],
            ["^ Aire ", " l’aire "],
            ["^ All[ée]e ", " l’allée "],
            ["^ Anse ", " l’anse "],
            ["^ (L['’])?Autoroute ", " l’autoroute "],
            ["^ Avenue ", " l’avenue "],
            ["^ Barreau ", " le barreau "],
            ["^ Boulevard ", " le boulevard "],
            ["^ Chemin ", " le chemin "],
            ["^ Petit[\\- ]Chemin ", " le petit chemin "],
            ["^ Cit[ée] ", " la cité "],
            ["^ Clos ", " le clos "],
            ["^ Corniche ", " la corniche "],
            ["^ Cour ", " la cour "],
            ["^ Cours ", " le cours "],
            ["^ D[ée]viation ", " la déviation "],
            ["^ Entr[ée]e ", " l’entrée "],
            ["^ Esplanade ", " l’esplanade "],
            ["^ Galerie ", " la galerie "],
            ["^ Impasse ", " l’impasse "],
            ["^ Lotissement ", " le lotissement "],
            ["^ Mont[ée]e ", " la montée "],
            ["^ Parc ", " le parc "],
            ["^ Parvis ", " le parvis "],
            ["^ Passage ", " le passage "],
            ["^ Place ", " la place "],
            ["^ Petit[\\- ]Pont ", " le petit-pont "],
            ["^ Pont ", " le pont "],
            ["^ Promenade ", " la promenade "],
            ["^ Quai ", " le quai "],
            ["^ Rocade ", " la rocade "],
            ["^ Rond[\\- ]?Point ", " le rond-point "],
            ["^ Route ", " la route "],
            ["^ Rue ", " la rue "],
            ["^ Grande Rue ", " la grande rue "],
            ["^ Sente ", " la sente "],
            ["^ Sentier ", " le sentier "],
            ["^ Sortie ", " la sortie "],
            ["^ Souterrain ", " le souterrain "],
            ["^ Square ", " le square "],
            ["^ Terrasse ", " la terrasse "],
            ["^ Traverse ", " la traverse "],
            ["^ Tunnel ", " le tunnel "],
            ["^ Viaduc ", " le viaduc "],
            ["^ Villa ", " la villa "],
            ["^ Village ", " le village "],
            ["^ Voie ", " la voie "],

            [" ([dl])'", " $1’"]
        ],
        "preposition": [
            ["^ Le ", "  du "],
            ["^ Les ", "  des "],
            ["^ La ", "  de La "],

            ["^ Acc[èe]s ", "  de l’accès "],
            ["^ Aire ", "  de l’aire "],
            ["^ All[ée]e ", "  de l’allée "],
            ["^ Anse ", "  de l’anse "],
            ["^ (L['’])?Autoroute ", "  de l’autoroute "],
            ["^ Avenue ", "  de l’avenue "],
            ["^ Barreau ", "  du barreau "],
            ["^ Boulevard ", "  du boulevard "],
            ["^ Chemin ", "  du chemin "],
            ["^ Petit[\\- ]Chemin ", "  du petit chemin "],
            ["^ Cit[ée] ", "  de la cité "],
            ["^ Clos ", "  du clos "],
            ["^ Corniche ", "  de la corniche "],
            ["^ Cour ", "  de la cour "],
            ["^ Cours ", "  du cours "],
            ["^ D[ée]viation ", "  de la déviation "],
            ["^ Entr[ée]e ", "  de l’entrée "],
            ["^ Esplanade ", "  de l’esplanade "],
            ["^ Galerie ", "  de la galerie "],
            ["^ Impasse ", "  de l’impasse "],
            ["^ Lotissement ", "  du lotissement "],
            ["^ Mont[ée]e ", "  de la montée "],
            ["^ Parc ", "  du parc "],
            ["^ Parvis ", "  du parvis "],
            ["^ Passage ", "  du passage "],
            ["^ Place ", "  de la place "],
            ["^ Petit[\\- ]Pont ", "  du petit-pont "],
            ["^ Pont ", "  du pont "],
            ["^ Promenade ", "  de la promenade "],
            ["^ Quai ", "  du quai "],
            ["^ Rocade ", "  de la rocade "],
            ["^ Rond[\\- ]?Point ", "  du rond-point "],
            ["^ Route ", "  de la route "],
            ["^ Rue ", "  de la rue "],
            ["^ Grande Rue ", "  de la grande rue "],
            ["^ Sente ", "  de la sente "],
            ["^ Sentier ", "  du sentier "],
            ["^ Sortie ", "  de la sortie "],
            ["^ Souterrain ", "  du souterrain "],
            ["^ Square ", "  du square "],
            ["^ Terrasse ", "  de la terrasse "],
            ["^ Traverse ", "  de la traverse "],
            ["^ Tunnel ", "  du tunnel "],
            ["^ Viaduc ", "  du viaduc "],
            ["^ Villa ", "  de la villa "],
            ["^ Village ", "  du village "],
            ["^ Voie ", "  de la voie "],

            ["^ ([AÂÀEÈÉÊËIÎÏOÔUÙÛÜYŸÆŒ])", "  d’$1"],
            ["^ (\\S)", "  de $1"],
            [" ([dl])'", " $1’"]
        ],
        "rotary": [
            ["^ Le ", "  le rond-point du "],
            ["^ Les ", "  le rond-point des "],
            ["^ La ", "  le rond-point de La "],

            ["^ Acc[èe]s ", " le rond-point de l’accès "],
            ["^ Aire ", "  le rond-point de l’aire "],
            ["^ All[ée]e ", "  le rond-point de l’allée "],
            ["^ Anse ", "  le rond-point de l’anse "],
            ["^ (L['’])?Autoroute ", "  le rond-point de l’autoroute "],
            ["^ Avenue ", "  le rond-point de l’avenue "],
            ["^ Barreau ", "  le rond-point du barreau "],
            ["^ Boulevard ", "  le rond-point du boulevard "],
            ["^ Chemin ", "  le rond-point du chemin "],
            ["^ Petit[\\- ]Chemin ", "  le rond-point du petit chemin "],
            ["^ Cit[ée] ", "  le rond-point de la cité "],
            ["^ Clos ", "  le rond-point du clos "],
            ["^ Corniche ", "  le rond-point de la corniche "],
            ["^ Cour ", "  le rond-point de la cour "],
            ["^ Cours ", "  le rond-point du cours "],
            ["^ D[ée]viation ", "  le rond-point de la déviation "],
            ["^ Entr[ée]e ", "  le rond-point de l’entrée "],
            ["^ Esplanade ", "  le rond-point de l’esplanade "],
            ["^ Galerie ", "  le rond-point de la galerie "],
            ["^ Impasse ", "  le rond-point de l’impasse "],
            ["^ Lotissement ", "  le rond-point du lotissement "],
            ["^ Mont[ée]e ", "  le rond-point de la montée "],
            ["^ Parc ", "  le rond-point du parc "],
            ["^ Parvis ", "  le rond-point du parvis "],
            ["^ Passage ", "  le rond-point du passage "],
            ["^ Place ", "  le rond-point de la place "],
            ["^ Petit[\\- ]Pont ", "  le rond-point du petit-pont "],
            ["^ Pont ", "  le rond-point du pont "],
            ["^ Promenade ", "  le rond-point de la promenade "],
            ["^ Quai ", "  le rond-point du quai "],
            ["^ Rocade ", "  le rond-point de la rocade "],
            ["^ Rond[\\- ]?Point ", "  le rond-point "],
            ["^ Route ", "  le rond-point de la route "],
            ["^ Rue ", "  le rond-point de la rue "],
            ["^ Grande Rue ", "  le rond-point de la grande rue "],
            ["^ Sente ", "  le rond-point de la sente "],
            ["^ Sentier ", "  le rond-point du sentier "],
            ["^ Sortie ", "  le rond-point de la sortie "],
            ["^ Souterrain ", "  le rond-point du souterrain "],
            ["^ Square ", "  le rond-point du square "],
            ["^ Terrasse ", "  le rond-point de la terrasse "],
            ["^ Traverse ", "  le rond-point de la traverse "],
            ["^ Tunnel ", "  le rond-point du tunnel "],
            ["^ Viaduc ", "  le rond-point du viaduc "],
            ["^ Villa ", "  le rond-point de la villa "],
            ["^ Village ", "  le rond-point du village "],
            ["^ Voie ", "  le rond-point de la voie "],

            ["^ ([AÂÀEÈÉÊËIÎÏOÔUÙÛÜYŸÆŒ])", "  le rond-point d’$1"],
            ["^ (\\S)", "  le rond-point de $1"],
            [" ([dl])'", " $1’"]
        ],
        "arrival": [
            ["^ Le ", "  au "],
            ["^ Les ", "  aux "],
            ["^ La ", "  à La "],
            ["^ (\\S)", "  à $1"],

            [" ([dl])'", " $1’"]
        ]
    }
}

},{}],20:[function(require,module,exports){
module.exports={
    "meta": {
        "regExpFlags": ""
    },
    "v5": {
        "accusative": [
            ["^ ([«\"])", " трасса $1"],

            ["^ (\\S+)ая [Аа]ллея ", " $1ую аллею "],
            ["^ (\\S+)ья [Аа]ллея ", " $1ью аллею "],
            ["^ (\\S+)яя [Аа]ллея ", " $1юю аллею "],
            ["^ (\\d+)-я (\\S+)ая [Аа]ллея ", " $1-ю $2ую аллею "],
            ["^ [Аа]ллея ", " аллею "],

            ["^ (\\S+)ая-(\\S+)ая [Уу]лица ", " $1ую-$2ую улицу "],
            ["^ (\\S+)ая [Уу]лица ", " $1ую улицу "],
            ["^ (\\S+)ья [Уу]лица ", " $1ью улицу "],
            ["^ (\\S+)яя [Уу]лица ", " $1юю улицу "],
            ["^ (\\d+)-я [Уу]лица ", " $1-ю улицу "],
            ["^ (\\d+)-я (\\S+)ая [Уу]лица ", " $1-ю $2ую улицу "],
            ["^ (\\S+)ая (\\S+)ая [Уу]лица ", " $1ую $2ую улицу "],
            ["^ (\\S+[вн])а [Уу]лица ", " $1у улицу "],
            ["^ (\\S+)ая (\\S+[вн])а [Уу]лица ", " $1ую $2у улицу "],
            ["^ Даньславля [Уу]лица ", " Даньславлю улицу "],
            ["^ Добрыня [Уу]лица ", " Добрыню улицу "],
            ["^ Людогоща [Уу]лица ", " Людогощу улицу "],
            ["^ [Уу]лица ", " улицу "],

            ["^ (\\d+)-я [Лл]иния ", " $1-ю линию "],
            ["^ (\\d+)-(\\d+)-я [Лл]иния ", " $1-$2-ю линию "],
            ["^ (\\S+)ая [Лл]иния ", " $1ую линию "],
            ["^ (\\S+)ья [Лл]иния ", " $1ью линию "],
            ["^ (\\S+)яя [Лл]иния ", " $1юю линию "],
            ["^ (\\d+)-я (\\S+)ая [Лл]иния ", " $1-ю $2ую линию "],
            ["^ [Лл]иния ", " линию "],

            ["^ (\\d+)-(\\d+)-я [Лл]инии ", " $1-$2-ю линии "],

            ["^ (\\S+)ая [Нн]абережная ", " $1ую набережную "],
            ["^ (\\S+)ья [Нн]абережная ", " $1ью набережную "],
            ["^ (\\S+)яя [Нн]абережная ", " $1юю набережную "],
            ["^ (\\d+)-я (\\S+)ая [Нн]абережная ", " $1-ю $2ую набережную "],
            ["^ [Нн]абережная ", " набережную "],

            ["^ (\\S+)ая [Пп]лощадь ", " $1ую площадь "],
            ["^ (\\S+)ья [Пп]лощадь ", " $1ью площадь "],
            ["^ (\\S+)яя [Пп]лощадь ", " $1юю площадь "],
            ["^ (\\S+[вн])а [Пп]лощадь ", " $1у площадь "],
            ["^ (\\d+)-я (\\S+)ая [Пп]лощадь ", " $1-ю $2ую площадь "],
            ["^ [Пп]лощадь ", " площадь "],

            ["^ (\\S+)ая [Пп]росека ", " $1ую просеку "],
            ["^ (\\S+)ья [Пп]росека ", " $1ью просеку "],
            ["^ (\\S+)яя [Пп]росека ", " $1юю просеку "],
            ["^ (\\d+)-я [Пп]росека ", " $1-ю просеку "],
            ["^ [Пп]росека ", " просеку "],

            ["^ (\\S+)ая [Ээ]стакада ", " $1ую эстакаду "],
            ["^ (\\S+)ья [Ээ]стакада ", " $1ью эстакаду "],
            ["^ (\\S+)яя [Ээ]стакада ", " $1юю эстакаду "],
            ["^ (\\d+)-я (\\S+)ая [Ээ]стакада ", " $1-ю $2ую эстакаду "],
            ["^ [Ээ]стакада ", " эстакаду "],

            ["^ (\\S+)ая [Мм]агистраль ", " $1ую магистраль "],
            ["^ (\\S+)ья [Мм]агистраль ", " $1ью магистраль "],
            ["^ (\\S+)яя [Мм]агистраль ", " $1юю магистраль "],
            ["^ (\\S+)ая (\\S+)ая [Мм]агистраль ", " $1ую $2ую магистраль "],
            ["^ (\\d+)-я (\\S+)ая [Мм]агистраль ", " $1-ю $2ую магистраль "],
            ["^ [Мм]агистраль ", " магистраль "],

            ["^ (\\S+)ая [Рр]азвязка ", " $1ую развязку "],
            ["^ (\\S+)ья [Рр]азвязка ", " $1ью развязку "],
            ["^ (\\S+)яя [Рр]азвязка ", " $1юю развязку "],
            ["^ (\\d+)-я (\\S+)ая [Рр]азвязка ", " $1-ю $2ую развязку "],
            ["^ [Рр]азвязка ", " развязку "],

            ["^ (\\S+)ая [Тт]расса ", " $1ую трассу "],
            ["^ (\\S+)ья [Тт]расса ", " $1ью трассу "],
            ["^ (\\S+)яя [Тт]расса ", " $1юю трассу "],
            ["^ (\\d+)-я (\\S+)ая [Тт]расса ", " $1-ю $2ую трассу "],
            ["^ [Тт]расса ", " трассу "],

            ["^ (\\S+)ая ([Аа]вто)?[Дд]орога ", " $1ую $2дорогу "],
            ["^ (\\S+)ья ([Аа]вто)?[Дд]орога ", " $1ью $2дорогу "],
            ["^ (\\S+)яя ([Аа]вто)?[Дд]орога ", " $1юю $2дорогу "],
            ["^ (\\S+)ая (\\S+)ая ([Аа]вто)?[Дд]орога ", " $1ую $2ую $3дорогу "],
            ["^ (\\d+)-я (\\S+)ая ([Аа]вто)?[Дд]орога ", " $1-ю $2ую $3дорогу "],
            ["^ ([Аа]вто)?[Дд]орога ", " $1дорогу "],

            ["^ (\\S+)ая [Дд]орожка ", " $1ую дорожку "],
            ["^ (\\S+)ья [Дд]орожка ", " $1ью дорожку "],
            ["^ (\\S+)яя [Дд]орожка ", " $1юю дорожку "],
            ["^ (\\d+)-я (\\S+)ая [Дд]орожка ", " $1-ю $2ую дорожку "],
            ["^ [Дд]орожка ", " дорожку "],

            ["^ (\\S+)ая [Кк]оса ", " $1ую косу "],
            ["^ (\\S+)ая [Хх]орда ", " $1ую хорду "],

            ["^ [Дд]убл[её]р ", " дублёр "]
        ],
        "dative": [
            ["^ ([«\"])", " трасса $1"],

            ["^ (\\S+)ая [Аа]ллея ", " $1ой аллее "],
            ["^ (\\S+)ья [Аа]ллея ", " $1ьей аллее "],
            ["^ (\\S+)яя [Аа]ллея ", " $1ей аллее "],
            ["^ (\\d+)-я (\\S+)ая [Аа]ллея ", " $1-й $2ой аллее "],
            ["^ [Аа]ллея ", " аллее "],

            ["^ (\\S+)ая-(\\S+)ая [Уу]лица ", " $1ой-$2ой улице "],
            ["^ (\\S+)ая [Уу]лица ", " $1ой улице "],
            ["^ (\\S+)ья [Уу]лица ", " $1ьей улице "],
            ["^ (\\S+)яя [Уу]лица ", " $1ей улице "],
            ["^ (\\d+)-я [Уу]лица ", " $1-й улице "],
            ["^ (\\d+)-я (\\S+)ая [Уу]лица ", " $1-й $2ой улице "],
            ["^ (\\S+)ая (\\S+)ая [Уу]лица ", " $1ой $2ой улице "],
            ["^ (\\S+[вн])а [Уу]лица ", " $1ой улице "],
            ["^ (\\S+)ая (\\S+[вн])а [Уу]лица ", " $1ой $2ой улице "],
            ["^ Даньславля [Уу]лица ", " Даньславлей улице "],
            ["^ Добрыня [Уу]лица ", " Добрыней улице "],
            ["^ Людогоща [Уу]лица ", " Людогощей улице "],
            ["^ [Уу]лица ", " улице "],

            ["^ (\\d+)-я [Лл]иния ", " $1-й линии "],
            ["^ (\\d+)-(\\d+)-я [Лл]иния ", " $1-$2-й линии "],
            ["^ (\\S+)ая [Лл]иния ", " $1ой линии "],
            ["^ (\\S+)ья [Лл]иния ", " $1ьей линии "],
            ["^ (\\S+)яя [Лл]иния ", " $1ей линии "],
            ["^ (\\d+)-я (\\S+)ая [Лл]иния ", " $1-й $2ой линии "],
            ["^ [Лл]иния ", " линии "],

            ["^ (\\d+)-(\\d+)-я [Лл]инии ", " $1-$2-й линиям "],

            ["^ (\\S+)ая [Нн]абережная ", " $1ой набережной "],
            ["^ (\\S+)ья [Нн]абережная ", " $1ьей набережной "],
            ["^ (\\S+)яя [Нн]абережная ", " $1ей набережной "],
            ["^ (\\d+)-я (\\S+)ая [Нн]абережная ", " $1-й $2ой набережной "],
            ["^ [Нн]абережная ", " набережной "],

            ["^ (\\S+)ая [Пп]лощадь ", " $1ой площади "],
            ["^ (\\S+)ья [Пп]лощадь ", " $1ьей площади "],
            ["^ (\\S+)яя [Пп]лощадь ", " $1ей площади "],
            ["^ (\\S+[вн])а [Пп]лощадь ", " $1ой площади "],
            ["^ (\\d+)-я (\\S+)ая [Пп]лощадь ", " $1-й $2ой площади "],
            ["^ [Пп]лощадь ", " площади "],

            ["^ (\\S+)ая [Пп]росека ", " $1ой просеке "],
            ["^ (\\S+)ья [Пп]росека ", " $1ьей просеке "],
            ["^ (\\S+)яя [Пп]росека ", " $1ей просеке "],
            ["^ (\\d+)-я [Пп]росека ", " $1-й просеке "],
            ["^ [Пп]росека ", " просеке "],

            ["^ (\\S+)ая [Ээ]стакада ", " $1ой эстакаде "],
            ["^ (\\S+)ья [Ээ]стакада ", " $1ьей эстакаде "],
            ["^ (\\S+)яя [Ээ]стакада ", " $1ей эстакаде "],
            ["^ (\\d+)-я (\\S+)ая [Ээ]стакада ", " $1-й $2ой эстакаде "],
            ["^ [Ээ]стакада ", " эстакаде "],

            ["^ (\\S+)ая [Мм]агистраль ", " $1ой магистрали "],
            ["^ (\\S+)ья [Мм]агистраль ", " $1ьей магистрали "],
            ["^ (\\S+)яя [Мм]агистраль ", " $1ей магистрали "],
            ["^ (\\S+)ая (\\S+)ая [Мм]агистраль ", " $1ой $2ой магистрали "],
            ["^ (\\d+)-я (\\S+)ая [Мм]агистраль ", " $1-й $2ой магистрали "],
            ["^ [Мм]агистраль ", " магистрали "],

            ["^ (\\S+)ая [Рр]азвязка ", " $1ой развязке "],
            ["^ (\\S+)ья [Рр]азвязка ", " $1ьей развязке "],
            ["^ (\\S+)яя [Рр]азвязка ", " $1ей развязке "],
            ["^ (\\d+)-я (\\S+)ая [Рр]азвязка ", " $1-й $2ой развязке "],
            ["^ [Рр]азвязка ", " развязке "],

            ["^ (\\S+)ая [Тт]расса ", " $1ой трассе "],
            ["^ (\\S+)ья [Тт]расса ", " $1ьей трассе "],
            ["^ (\\S+)яя [Тт]расса ", " $1ей трассе "],
            ["^ (\\d+)-я (\\S+)ая [Тт]расса ", " $1-й $2ой трассе "],
            ["^ [Тт]расса ", " трассе "],

            ["^ (\\S+)ая ([Аа]вто)?[Дд]орога ", " $1ой $2дороге "],
            ["^ (\\S+)ья ([Аа]вто)?[Дд]орога ", " $1ьей $2дороге "],
            ["^ (\\S+)яя ([Аа]вто)?[Дд]орога ", " $1ей $2дороге "],
            ["^ (\\S+)ая (\\S+)ая ([Аа]вто)?[Дд]орога ", " $1ой $2ой $3дороге "],
            ["^ (\\d+)-я (\\S+)ая ([Аа]вто)?[Дд]орога ", " $1-й $2ой $3дороге "],
            ["^ ([Аа]вто)?[Дд]орога ", " $1дороге "],

            ["^ (\\S+)ая [Дд]орожка ", " $1ой дорожке "],
            ["^ (\\S+)ья [Дд]орожка ", " $1ьей дорожке "],
            ["^ (\\S+)яя [Дд]орожка ", " $1ей дорожке "],
            ["^ (\\d+)-я (\\S+)ая [Дд]орожка ", " $1-й $2ой дорожке "],
            ["^ [Дд]орожка ", " дорожке "],

            ["^ (\\S+)во [Пп]оле ", " $1ву полю "],
            ["^ (\\S+)ая [Кк]оса ", " $1ой косе "],
            ["^ (\\S+)ая [Хх]орда ", " $1ой хорде "],
            ["^ (\\S+)[иоы]й [Пп]роток ", " $1ому протоку "],

            ["^ (\\S+н)ий [Бб]ульвар ", " $1ему бульвару "],
            ["^ (\\S+)[иоы]й [Бб]ульвар ", " $1ому бульвару "],
            ["^ (\\S+[иы]н) [Бб]ульвар ", " $1у бульвару "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Бб]ульвар ", " $1ому $2ему бульвару "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Бб]ульвар ", " $1ему $2ому бульвару "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Бб]ульвар ", " $1ому $2ому бульвару "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Бб]ульвар ", " $1ому $2у бульвару "],
            ["^ (\\d+)-й (\\S+н)ий [Бб]ульвар ", " $1-му $2ему бульвару "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Бб]ульвар ", " $1-му $2ому бульвару "],
            ["^ (\\d+)-й (\\S+[иы]н) [Бб]ульвар ", " $1-му $2у бульвару "],
            ["^ [Бб]ульвар ", " бульвару "],

            ["^ [Дд]убл[её]р ", " дублёру "],

            ["^ (\\S+н)ий [Зз]аезд ", " $1ему заезду "],
            ["^ (\\S+)[иоы]й [Зз]аезд ", " $1ому заезду "],
            ["^ (\\S+[еёо]в) [Зз]аезд ", " $1у заезду "],
            ["^ (\\S+[иы]н) [Зз]аезд ", " $1у заезду "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Зз]аезд ", " $1ому $2ему заезду "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Зз]аезд ", " $1ему $2ому заезду "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Зз]аезд ", " $1ому $2ому заезду "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Зз]аезд ", " $1ому $2у заезду "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Зз]аезд ", " $1ому $2у заезду "],
            ["^ (\\d+)-й (\\S+н)ий [Зз]аезд ", " $1-му $2ему заезду "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Зз]аезд ", " $1-му $2ому заезду "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Зз]аезд ", " $1-му $2у заезду "],
            ["^ (\\d+)-й (\\S+[иы]н) [Зз]аезд ", " $1-му $2у заезду "],
            ["^ [Зз]аезд ", " заезду "],

            ["^ (\\S+н)ий [Мм]ост ", " $1ему мосту "],
            ["^ (\\S+)[иоы]й [Мм]ост ", " $1ому мосту "],
            ["^ (\\S+[еёо]в) [Мм]ост ", " $1у мосту "],
            ["^ (\\S+[иы]н) [Мм]ост ", " $1у мосту "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Мм]ост ", " $1ому $2ему мосту "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Мм]ост ", " $1ему $2ому мосту "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Мм]ост ", " $1ому $2ому мосту "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Мм]ост ", " $1ому $2у мосту "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Мм]ост ", " $1ому $2у мосту "],
            ["^ (\\d+)-й [Мм]ост ", " $1-му мосту "],
            ["^ (\\d+)-й (\\S+н)ий [Мм]ост ", " $1-му $2ему мосту "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Мм]ост ", " $1-му $2ому мосту "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Мм]ост ", " $1-му $2у мосту "],
            ["^ (\\d+)-й (\\S+[иы]н) [Мм]ост ", " $1-му $2у мосту "],
            ["^ [Мм]ост ", " мосту "],

            ["^ (\\S+н)ий [Оо]бход ", " $1ему обходу "],
            ["^ (\\S+)[иоы]й [Оо]бход ", " $1ому обходу "],
            ["^ [Оо]бход ", " обходу "],

            ["^ (\\S+н)ий [Пп]арк ", " $1ему парку "],
            ["^ (\\S+)[иоы]й [Пп]арк ", " $1ому парку "],
            ["^ (\\S+[иы]н) [Пп]арк ", " $1у парку "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Пп]арк ", " $1ому $2ему парку "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Пп]арк ", " $1ему $2ому парку "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Пп]арк ", " $1ому $2ому парку "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Пп]арк ", " $1ому $2у парку "],
            ["^ (\\d+)-й (\\S+н)ий [Пп]арк ", " $1-му $2ему парку "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Пп]арк ", " $1-му $2ому парку "],
            ["^ (\\d+)-й (\\S+[иы]н) [Пп]арк ", " $1-му $2у парку "],
            ["^ [Пп]арк ", " парку "],

            ["^ (\\S+)[иоы]й-(\\S+)[иоы]й [Пп]ереулок ", " $1ому-$2ому переулку "],
            ["^ (\\d+)-й (\\S+)[иоы]й-(\\S+)[иоы]й [Пп]ереулок ", " $1-му $2ому-$3ому переулку "],
            ["^ (\\S+н)ий [Пп]ереулок ", " $1ему переулку "],
            ["^ (\\S+)[иоы]й [Пп]ереулок ", " $1ому переулку "],
            ["^ (\\S+[еёо]в) [Пп]ереулок ", " $1у переулку "],
            ["^ (\\S+[иы]н) [Пп]ереулок ", " $1у переулку "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Пп]ереулок ", " $1ому $2ему переулку "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Пп]ереулок ", " $1ему $2ому переулку "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Пп]ереулок ", " $1ому $2ому переулку "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Пп]ереулок ", " $1ому $2у переулку "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Пп]ереулок ", " $1ому $2у переулку "],
            ["^ (\\d+)-й [Пп]ереулок ", " $1-му переулку "],
            ["^ (\\d+)-й (\\S+н)ий [Пп]ереулок ", " $1-му $2ему переулку "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Пп]ереулок ", " $1-му $2ому переулку "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Пп]ереулок ", " $1-му $2у переулку "],
            ["^ (\\d+)-й (\\S+[иы]н) [Пп]ереулок ", " $1-му $2у переулку "],
            ["^ [Пп]ереулок ", " переулку "],

            ["^ [Пп]одъезд ", " подъезду "],

            ["^ (\\S+[еёо]в)-(\\S+)[иоы]й [Пп]роезд ", " $1у-$2ому проезду "],
            ["^ (\\S+н)ий [Пп]роезд ", " $1ему проезду "],
            ["^ (\\S+)[иоы]й [Пп]роезд ", " $1ому проезду "],
            ["^ (\\S+[еёо]в) [Пп]роезд ", " $1у проезду "],
            ["^ (\\S+[иы]н) [Пп]роезд ", " $1у проезду "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Пп]роезд ", " $1ому $2ему проезду "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Пп]роезд ", " $1ему $2ому проезду "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Пп]роезд ", " $1ому $2ому проезду "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Пп]роезд ", " $1ому $2у проезду "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Пп]роезд ", " $1ому $2у проезду "],
            ["^ (\\d+)-й [Пп]роезд ", " $1-му проезду "],
            ["^ (\\d+)-й (\\S+н)ий [Пп]роезд ", " $1-му $2ему проезду "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Пп]роезд ", " $1-му $2ому проезду "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Пп]роезд ", " $1-му $2у проезду "],
            ["^ (\\d+)-й (\\S+[иы]н) [Пп]роезд ", " $1-му $2у проезду "],
            ["^ (\\d+)-й (\\S+н)ий (\\S+)[иоы]й [Пп]роезд ", " $1-му $2ему $3ому проезду "],
            ["^ (\\d+)-й (\\S+)[иоы]й (\\S+)[иоы]й [Пп]роезд ", " $1-му $2ому $3ому проезду "],
            ["^ [Пп]роезд ", " проезду "],

            ["^ (\\S+н)ий [Пп]роспект ", " $1ему проспекту "],
            ["^ (\\S+)[иоы]й [Пп]роспект ", " $1ому проспекту "],
            ["^ (\\S+[иы]н) [Пп]роспект ", " $1у проспекту "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Пп]роспект ", " $1ому $2ему проспекту "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Пп]роспект ", " $1ему $2ому проспекту "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Пп]роспект ", " $1ому $2ому проспекту "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Пп]роспект ", " $1ому $2у проспекту "],
            ["^ (\\d+)-й (\\S+н)ий [Пп]роспект ", " $1-му $2ему проспекту "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Пп]роспект ", " $1-му $2ому проспекту "],
            ["^ (\\d+)-й (\\S+[иы]н) [Пп]роспект ", " $1-му $2у проспекту "],
            ["^ [Пп]роспект ", " проспекту "],

            ["^ (\\S+н)ий [Пп]утепровод ", " $1ему путепроводу "],
            ["^ (\\S+)[иоы]й [Пп]утепровод ", " $1ому путепроводу "],
            ["^ (\\S+[иы]н) [Пп]утепровод ", " $1у путепроводу "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Пп]утепровод ", " $1ому $2ему путепроводу "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Пп]утепровод ", " $1ему $2ому путепроводу "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Пп]утепровод ", " $1ому $2ому путепроводу "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Пп]утепровод ", " $1ому $2у путепроводу "],
            ["^ (\\d+)-й (\\S+н)ий [Пп]утепровод ", " $1-му $2ему путепроводу "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Пп]утепровод ", " $1-му $2ому путепроводу "],
            ["^ (\\d+)-й (\\S+[иы]н) [Пп]утепровод ", " $1-му $2у путепроводу "],
            ["^ [Пп]утепровод ", " путепроводу "],

            ["^ (\\S+н)ий [Сс]пуск ", " $1ему спуску "],
            ["^ (\\S+)[иоы]й [Сс]пуск ", " $1ому спуску "],
            ["^ (\\S+[еёо]в) [Сс]пуск ", " $1у спуску "],
            ["^ (\\S+[иы]н) [Сс]пуск ", " $1у спуску "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Сс]пуск ", " $1ому $2ему спуску "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Сс]пуск ", " $1ему $2ому спуску "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Сс]пуск ", " $1ому $2ому спуску "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Сс]пуск ", " $1ому $2у спуску "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Сс]пуск ", " $1ому $2у спуску "],
            ["^ (\\d+)-й (\\S+н)ий [Сс]пуск ", " $1-му $2ему спуску "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Сс]пуск ", " $1-му $2ому спуску "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Сс]пуск ", " $1-му $2у спуску "],
            ["^ (\\d+)-й (\\S+[иы]н) [Сс]пуск ", " $1-му $2у спуску "],
            ["^ [Сс]пуск ", " спуску "],

            ["^ (\\S+н)ий [Сс]ъезд ", " $1ему съезду "],
            ["^ (\\S+)[иоы]й [Сс]ъезд ", " $1ому съезду "],
            ["^ (\\S+[иы]н) [Сс]ъезд ", " $1у съезду "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Сс]ъезд ", " $1ому $2ему съезду "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Сс]ъезд ", " $1ему $2ому съезду "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Сс]ъезд ", " $1ому $2ому съезду "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Сс]ъезд ", " $1ому $2у съезду "],
            ["^ (\\d+)-й (\\S+н)ий [Сс]ъезд ", " $1-му $2ему съезду "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Сс]ъезд ", " $1-му $2ому съезду "],
            ["^ (\\d+)-й (\\S+[иы]н) [Сс]ъезд ", " $1-му $2у съезду "],
            ["^ [Сс]ъезд ", " съезду "],

            ["^ (\\S+н)ий [Тт][уо]ннель ", " $1ему тоннелю "],
            ["^ (\\S+)[иоы]й [Тт][уо]ннель ", " $1ому тоннелю "],
            ["^ (\\S+[иы]н) [Тт][уо]ннель ", " $1у тоннелю "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Тт][уо]ннель ", " $1ому $2ему тоннелю "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Тт][уо]ннель ", " $1ему $2ому тоннелю "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Тт][уо]ннель ", " $1ому $2ому тоннелю "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Тт][уо]ннель ", " $1ому $2у тоннелю "],
            ["^ (\\d+)-й (\\S+н)ий [Тт][уо]ннель ", " $1-му $2ему тоннелю "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Тт][уо]ннель ", " $1-му $2ому тоннелю "],
            ["^ (\\d+)-й (\\S+[иы]н) [Тт][уо]ннель ", " $1-му $2у тоннелю "],
            ["^ [Тт][уо]ннель ", " тоннелю "],

            ["^ (\\S+н)ий [Тт]ракт ", " $1ему тракту "],
            ["^ (\\S+)[иоы]й [Тт]ракт ", " $1ому тракту "],
            ["^ (\\S+[еёо]в) [Тт]ракт ", " $1у тракту "],
            ["^ (\\S+[иы]н) [Тт]ракт ", " $1у тракту "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Тт]ракт ", " $1ому $2ему тракту "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Тт]ракт ", " $1ему $2ому тракту "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Тт]ракт ", " $1ому $2ому тракту "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Тт]ракт ", " $1ому $2у тракту "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Тт]ракт ", " $1ому $2у тракту "],
            ["^ (\\d+)-й (\\S+н)ий [Тт]ракт ", " $1-му $2ему тракту "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Тт]ракт ", " $1-му $2ому тракту "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Тт]ракт ", " $1-му $2у тракту "],
            ["^ (\\d+)-й (\\S+[иы]н) [Тт]ракт ", " $1-му $2у тракту "],
            ["^ [Тт]ракт ", " тракту "],

            ["^ (\\S+н)ий [Тт]упик ", " $1ему тупику "],
            ["^ (\\S+)[иоы]й [Тт]упик ", " $1ому тупику "],
            ["^ (\\S+[еёо]в) [Тт]упик ", " $1у тупику "],
            ["^ (\\S+[иы]н) [Тт]упик ", " $1у тупику "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Тт]упик ", " $1ому $2ему тупику "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Тт]упик ", " $1ему $2ому тупику "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Тт]упик ", " $1ому $2ому тупику "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Тт]упик ", " $1ому $2у тупику "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Тт]упик ", " $1ому $2у тупику "],
            ["^ (\\d+)-й [Тт]упик ", " $1-му тупику "],
            ["^ (\\d+)-й (\\S+н)ий [Тт]упик ", " $1-му $2ему тупику "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Тт]упик ", " $1-му $2ому тупику "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Тт]упик ", " $1-му $2у тупику "],
            ["^ (\\d+)-й (\\S+[иы]н) [Тт]упик ", " $1-му $2у тупику "],
            ["^ [Тт]упик ", " тупику "],

            ["^ (\\S+[ео])е ([Пп]олу)?[Кк]ольцо ", " $1му $2кольцу "],
            ["^ (\\S+ье) ([Пп]олу)?[Кк]ольцо ", " $1му $2кольцу "],
            ["^ (\\S+[ео])е (\\S+[ео])е ([Пп]олу)?[Кк]ольцо ", " $1му $2му $3кольцу "],
            ["^ (\\S+ье) (\\S+[ео])е ([Пп]олу)?[Кк]ольцо ", " $1му $2му $3кольцу "],
            ["^ (\\d+)-е (\\S+[ео])е ([Пп]олу)?[Кк]ольцо ", " $1-му $2му $3кольцу "],
            ["^ (\\d+)-е (\\S+ье) ([Пп]олу)?[Кк]ольцо ", " $1-му $2му $3кольцу "],
            ["^ ([Пп]олу)?[Кк]ольцо ", " $1кольцу "],

            ["^ (\\S+[ео])е [Шш]оссе ", " $1му шоссе "],
            ["^ (\\S+ье) [Шш]оссе ", " $1му шоссе "],
            ["^ (\\S+[ео])е (\\S+[ео])е [Шш]оссе ", " $1му $2му шоссе "],
            ["^ (\\S+ье) (\\S+[ео])е [Шш]оссе ", " $1му $2му шоссе "],
            ["^ (\\d+)-е (\\S+[ео])е [Шш]оссе ", " $1-му $2му шоссе "],
            ["^ (\\d+)-е (\\S+ье) [Шш]оссе ", " $1-му $2му шоссе "],

            [" ([Тт])ретому ", " $1ретьему "],
            ["([жч])ому ", "$1ьему "],
            ["([жч])ой ", "$1ей "]
        ],
        "genitive": [
            ["^ ([«\"])", " трасса $1"],

            ["^ (\\S+)ая [Аа]ллея ", " $1ой аллеи "],
            ["^ (\\S+)ья [Аа]ллея ", " $1ьей аллеи "],
            ["^ (\\S+)яя [Аа]ллея ", " $1ей аллеи "],
            ["^ (\\d+)-я (\\S+)ая [Аа]ллея ", " $1-й $2ой аллеи "],
            ["^ [Аа]ллея ", " аллеи "],

            ["^ (\\S+)ая-(\\S+)ая [Уу]лица ", " $1ой-$2ой улицы "],
            ["^ (\\S+)ая [Уу]лица ", " $1ой улицы "],
            ["^ (\\S+)ья [Уу]лица ", " $1ьей улицы "],
            ["^ (\\S+)яя [Уу]лица ", " $1ей улицы "],
            ["^ (\\d+)-я [Уу]лица ", " $1-й улицы "],
            ["^ (\\d+)-я (\\S+)ая [Уу]лица ", " $1-й $2ой улицы "],
            ["^ (\\S+)ая (\\S+)ая [Уу]лица ", " $1ой $2ой улицы "],
            ["^ (\\S+[вн])а [Уу]лица ", " $1ой улицы "],
            ["^ (\\S+)ая (\\S+[вн])а [Уу]лица ", " $1ой $2ой улицы "],
            ["^ Даньславля [Уу]лица ", " Даньславлей улицы "],
            ["^ Добрыня [Уу]лица ", " Добрыней улицы "],
            ["^ Людогоща [Уу]лица ", " Людогощей улицы "],
            ["^ [Уу]лица ", " улицы "],

            ["^ (\\d+)-я [Лл]иния ", " $1-й линии "],
            ["^ (\\d+)-(\\d+)-я [Лл]иния ", " $1-$2-й линии "],
            ["^ (\\S+)ая [Лл]иния ", " $1ой линии "],
            ["^ (\\S+)ья [Лл]иния ", " $1ьей линии "],
            ["^ (\\S+)яя [Лл]иния ", " $1ей линии "],
            ["^ (\\d+)-я (\\S+)ая [Лл]иния ", " $1-й $2ой линии "],
            ["^ [Лл]иния ", " линии "],

            ["^ (\\d+)-(\\d+)-я [Лл]инии ", " $1-$2-й линий "],

            ["^ (\\S+)ая [Нн]абережная ", " $1ой набережной "],
            ["^ (\\S+)ья [Нн]абережная ", " $1ьей набережной "],
            ["^ (\\S+)яя [Нн]абережная ", " $1ей набережной "],
            ["^ (\\d+)-я (\\S+)ая [Нн]абережная ", " $1-й $2ой набережной "],
            ["^ [Нн]абережная ", " набережной "],

            ["^ (\\S+)ая [Пп]лощадь ", " $1ой площади "],
            ["^ (\\S+)ья [Пп]лощадь ", " $1ьей площади "],
            ["^ (\\S+)яя [Пп]лощадь ", " $1ей площади "],
            ["^ (\\S+[вн])а [Пп]лощадь ", " $1ой площади "],
            ["^ (\\d+)-я (\\S+)ая [Пп]лощадь ", " $1-й $2ой площади "],
            ["^ [Пп]лощадь ", " площади "],

            ["^ (\\S+)ая [Пп]росека ", " $1ой просеки "],
            ["^ (\\S+)ья [Пп]росека ", " $1ьей просеки "],
            ["^ (\\S+)яя [Пп]росека ", " $1ей просеки "],
            ["^ (\\d+)-я [Пп]росека ", " $1-й просеки "],
            ["^ [Пп]росека ", " просеки "],

            ["^ (\\S+)ая [Ээ]стакада ", " $1ой эстакады "],
            ["^ (\\S+)ья [Ээ]стакада ", " $1ьей эстакады "],
            ["^ (\\S+)яя [Ээ]стакада ", " $1ей эстакады "],
            ["^ (\\d+)-я (\\S+)ая [Ээ]стакада ", " $1-й $2ой эстакады "],
            ["^ [Ээ]стакада ", " эстакады "],

            ["^ (\\S+)ая [Мм]агистраль ", " $1ой магистрали "],
            ["^ (\\S+)ья [Мм]агистраль ", " $1ьей магистрали "],
            ["^ (\\S+)яя [Мм]агистраль ", " $1ей магистрали "],
            ["^ (\\S+)ая (\\S+)ая [Мм]агистраль ", " $1ой $2ой магистрали "],
            ["^ (\\d+)-я (\\S+)ая [Мм]агистраль ", " $1-й $2ой магистрали "],
            ["^ [Мм]агистраль ", " магистрали "],

            ["^ (\\S+)ая [Рр]азвязка ", " $1ой развязки "],
            ["^ (\\S+)ья [Рр]азвязка ", " $1ьей развязки "],
            ["^ (\\S+)яя [Рр]азвязка ", " $1ей развязки "],
            ["^ (\\d+)-я (\\S+)ая [Рр]азвязка ", " $1-й $2ой развязки "],
            ["^ [Рр]азвязка ", " развязки "],

            ["^ (\\S+)ая [Тт]расса ", " $1ой трассы "],
            ["^ (\\S+)ья [Тт]расса ", " $1ьей трассы "],
            ["^ (\\S+)яя [Тт]расса ", " $1ей трассы "],
            ["^ (\\d+)-я (\\S+)ая [Тт]расса ", " $1-й $2ой трассы "],
            ["^ [Тт]расса ", " трассы "],

            ["^ (\\S+)ая ([Аа]вто)?[Дд]орога ", " $1ой $2дороги "],
            ["^ (\\S+)ья ([Аа]вто)?[Дд]орога ", " $1ьей $2дороги "],
            ["^ (\\S+)яя ([Аа]вто)?[Дд]орога ", " $1ей $2дороги "],
            ["^ (\\S+)ая (\\S+)ая ([Аа]вто)?[Дд]орога ", " $1ой $2ой $3дороги "],
            ["^ (\\d+)-я (\\S+)ая ([Аа]вто)?[Дд]орога ", " $1-й $2ой $3дороги "],
            ["^ ([Аа]вто)?[Дд]орога ", " $1дороги "],

            ["^ (\\S+)ая [Дд]орожка ", " $1ой дорожки "],
            ["^ (\\S+)ья [Дд]орожка ", " $1ьей дорожки "],
            ["^ (\\S+)яя [Дд]орожка ", " $1ей дорожки "],
            ["^ (\\d+)-я (\\S+)ая [Дд]орожка ", " $1-й $2ой дорожки "],
            ["^ [Дд]орожка ", " дорожки "],

            ["^ (\\S+)во [Пп]оле ", " $1ва поля "],
            ["^ (\\S+)ая [Кк]оса ", " $1ой косы "],
            ["^ (\\S+)ая [Хх]орда ", " $1ой хорды "],
            ["^ (\\S+)[иоы]й [Пп]роток ", " $1ого протока "],

            ["^ (\\S+н)ий [Бб]ульвар ", " $1его бульвара "],
            ["^ (\\S+)[иоы]й [Бб]ульвар ", " $1ого бульвара "],
            ["^ (\\S+[иы]н) [Бб]ульвар ", " $1ого бульвара "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Бб]ульвар ", " $1ого $2его бульвара "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Бб]ульвар ", " $1его $2ого бульвара "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Бб]ульвар ", " $1ого $2ого бульвара "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Бб]ульвар ", " $1ого $2ого бульвара "],
            ["^ (\\d+)-й (\\S+н)ий [Бб]ульвар ", " $1-го $2его бульвара "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Бб]ульвар ", " $1-го $2ого бульвара "],
            ["^ (\\d+)-й (\\S+[иы]н) [Бб]ульвар ", " $1-го $2ого бульвара "],
            ["^ [Бб]ульвар ", " бульвара "],

            ["^ [Дд]убл[её]р ", " дублёра "],

            ["^ (\\S+н)ий [Зз]аезд ", " $1его заезда "],
            ["^ (\\S+)[иоы]й [Зз]аезд ", " $1ого заезда "],
            ["^ (\\S+[еёо]в) [Зз]аезд ", " $1а заезда "],
            ["^ (\\S+[иы]н) [Зз]аезд ", " $1а заезда "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Зз]аезд ", " $1ого $2его заезда "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Зз]аезд ", " $1его $2ого заезда "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Зз]аезд ", " $1ого $2ого заезда "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Зз]аезд ", " $1ого $2а заезда "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Зз]аезд ", " $1ого $2а заезда "],
            ["^ (\\d+)-й (\\S+н)ий [Зз]аезд ", " $1-го $2его заезда "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Зз]аезд ", " $1-го $2ого заезда "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Зз]аезд ", " $1-го $2а заезда "],
            ["^ (\\d+)-й (\\S+[иы]н) [Зз]аезд ", " $1-го $2а заезда "],
            ["^ [Зз]аезд ", " заезда "],

            ["^ (\\S+н)ий [Мм]ост ", " $1его моста "],
            ["^ (\\S+)[иоы]й [Мм]ост ", " $1ого моста "],
            ["^ (\\S+[еёо]в) [Мм]ост ", " $1а моста "],
            ["^ (\\S+[иы]н) [Мм]ост ", " $1а моста "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Мм]ост ", " $1ого $2его моста "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Мм]ост ", " $1его $2ого моста "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Мм]ост ", " $1ого $2ого моста "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Мм]ост ", " $1ого $2а моста "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Мм]ост ", " $1ого $2а моста "],
            ["^ (\\d+)-й [Мм]ост ", " $1-го моста "],
            ["^ (\\d+)-й (\\S+н)ий [Мм]ост ", " $1-го $2его моста "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Мм]ост ", " $1-го $2ого моста "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Мм]ост ", " $1-го $2а моста "],
            ["^ (\\d+)-й (\\S+[иы]н) [Мм]ост ", " $1-го $2а моста "],
            ["^ [Мм]ост ", " моста "],

            ["^ (\\S+н)ий [Оо]бход ", " $1его обхода "],
            ["^ (\\S+)[иоы]й [Оо]бход ", " $1ого обхода "],
            ["^ [Оо]бход ", " обхода "],

            ["^ (\\S+н)ий [Пп]арк ", " $1его парка "],
            ["^ (\\S+)[иоы]й [Пп]арк ", " $1ого парка "],
            ["^ (\\S+[иы]н) [Пп]арк ", " $1ого парка "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Пп]арк ", " $1ого $2его парка "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Пп]арк ", " $1его $2ого парка "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Пп]арк ", " $1ого $2ого парка "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Пп]арк ", " $1ого $2ого парка "],
            ["^ (\\d+)-й (\\S+н)ий [Пп]арк ", " $1-го $2его парка "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Пп]арк ", " $1-го $2ого парка "],
            ["^ (\\d+)-й (\\S+[иы]н) [Пп]арк ", " $1-го $2ого парка "],
            ["^ [Пп]арк ", " парка "],

            ["^ (\\S+)[иоы]й-(\\S+)[иоы]й [Пп]ереулок ", " $1ого-$2ого переулка "],
            ["^ (\\d+)-й (\\S+)[иоы]й-(\\S+)[иоы]й [Пп]ереулок ", " $1-го $2ого-$3ого переулка "],
            ["^ (\\S+н)ий [Пп]ереулок ", " $1его переулка "],
            ["^ (\\S+)[иоы]й [Пп]ереулок ", " $1ого переулка "],
            ["^ (\\S+[еёо]в) [Пп]ереулок ", " $1а переулка "],
            ["^ (\\S+[иы]н) [Пп]ереулок ", " $1а переулка "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Пп]ереулок ", " $1ого $2его переулка "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Пп]ереулок ", " $1его $2ого переулка "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Пп]ереулок ", " $1ого $2ого переулка "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Пп]ереулок ", " $1ого $2а переулка "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Пп]ереулок ", " $1ого $2а переулка "],
            ["^ (\\d+)-й [Пп]ереулок ", " $1-го переулка "],
            ["^ (\\d+)-й (\\S+н)ий [Пп]ереулок ", " $1-го $2его переулка "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Пп]ереулок ", " $1-го $2ого переулка "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Пп]ереулок ", " $1-го $2а переулка "],
            ["^ (\\d+)-й (\\S+[иы]н) [Пп]ереулок ", " $1-го $2а переулка "],
            ["^ [Пп]ереулок ", " переулка "],

            ["^ [Пп]одъезд ", " подъезда "],

            ["^ (\\S+[еёо]в)-(\\S+)[иоы]й [Пп]роезд ", " $1а-$2ого проезда "],
            ["^ (\\S+н)ий [Пп]роезд ", " $1его проезда "],
            ["^ (\\S+)[иоы]й [Пп]роезд ", " $1ого проезда "],
            ["^ (\\S+[еёо]в) [Пп]роезд ", " $1а проезда "],
            ["^ (\\S+[иы]н) [Пп]роезд ", " $1а проезда "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Пп]роезд ", " $1ого $2его проезда "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Пп]роезд ", " $1его $2ого проезда "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Пп]роезд ", " $1ого $2ого проезда "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Пп]роезд ", " $1ого $2а проезда "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Пп]роезд ", " $1ого $2а проезда "],
            ["^ (\\d+)-й [Пп]роезд ", " $1-го проезда "],
            ["^ (\\d+)-й (\\S+н)ий [Пп]роезд ", " $1-го $2его проезда "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Пп]роезд ", " $1-го $2ого проезда "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Пп]роезд ", " $1-го $2а проезда "],
            ["^ (\\d+)-й (\\S+[иы]н) [Пп]роезд ", " $1-го $2а проезда "],
            ["^ (\\d+)-й (\\S+н)ий (\\S+)[иоы]й [Пп]роезд ", " $1-го $2его $3ого проезда "],
            ["^ (\\d+)-й (\\S+)[иоы]й (\\S+)[иоы]й [Пп]роезд ", " $1-го $2ого $3ого проезда "],
            ["^ [Пп]роезд ", " проезда "],

            ["^ (\\S+н)ий [Пп]роспект ", " $1его проспекта "],
            ["^ (\\S+)[иоы]й [Пп]роспект ", " $1ого проспекта "],
            ["^ (\\S+[иы]н) [Пп]роспект ", " $1ого проспекта "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Пп]роспект ", " $1ого $2его проспекта "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Пп]роспект ", " $1его $2ого проспекта "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Пп]роспект ", " $1ого $2ого проспекта "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Пп]роспект ", " $1ого $2ого проспекта "],
            ["^ (\\d+)-й (\\S+н)ий [Пп]роспект ", " $1-го $2его проспекта "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Пп]роспект ", " $1-го $2ого проспекта "],
            ["^ (\\d+)-й (\\S+[иы]н) [Пп]роспект ", " $1-го $2ого проспекта "],
            ["^ [Пп]роспект ", " проспекта "],

            ["^ (\\S+н)ий [Пп]утепровод ", " $1его путепровода "],
            ["^ (\\S+)[иоы]й [Пп]утепровод ", " $1ого путепровода "],
            ["^ (\\S+[иы]н) [Пп]утепровод ", " $1ого путепровода "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Пп]утепровод ", " $1ого $2его путепровода "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Пп]утепровод ", " $1его $2ого путепровода "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Пп]утепровод ", " $1ого $2ого путепровода "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Пп]утепровод ", " $1ого $2ого путепровода "],
            ["^ (\\d+)-й (\\S+н)ий [Пп]утепровод ", " $1-го $2его путепровода "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Пп]утепровод ", " $1-го $2ого путепровода "],
            ["^ (\\d+)-й (\\S+[иы]н) [Пп]утепровод ", " $1-го $2ого путепровода "],
            ["^ [Пп]утепровод ", " путепровода "],

            ["^ (\\S+н)ий [Сс]пуск ", " $1его спуска "],
            ["^ (\\S+)[иоы]й [Сс]пуск ", " $1ого спуска "],
            ["^ (\\S+[еёо]в) [Сс]пуск ", " $1а спуска "],
            ["^ (\\S+[иы]н) [Сс]пуск ", " $1а спуска "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Сс]пуск ", " $1ого $2его спуска "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Сс]пуск ", " $1его $2ого спуска "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Сс]пуск ", " $1ого $2ого спуска "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Сс]пуск ", " $1ого $2а спуска "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Сс]пуск ", " $1ого $2а спуска "],
            ["^ (\\d+)-й (\\S+н)ий [Сс]пуск ", " $1-го $2его спуска "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Сс]пуск ", " $1-го $2ого спуска "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Сс]пуск ", " $1-го $2а спуска "],
            ["^ (\\d+)-й (\\S+[иы]н) [Сс]пуск ", " $1-го $2а спуска "],
            ["^ [Сс]пуск ", " спуска "],

            ["^ (\\S+н)ий [Сс]ъезд ", " $1его съезда "],
            ["^ (\\S+)[иоы]й [Сс]ъезд ", " $1ого съезда "],
            ["^ (\\S+[иы]н) [Сс]ъезд ", " $1ого съезда "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Сс]ъезд ", " $1ого $2его съезда "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Сс]ъезд ", " $1его $2ого съезда "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Сс]ъезд ", " $1ого $2ого съезда "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Сс]ъезд ", " $1ого $2ого съезда "],
            ["^ (\\d+)-й (\\S+н)ий [Сс]ъезд ", " $1-го $2его съезда "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Сс]ъезд ", " $1-го $2ого съезда "],
            ["^ (\\d+)-й (\\S+[иы]н) [Сс]ъезд ", " $1-го $2ого съезда "],
            ["^ [Сс]ъезд ", " съезда "],

            ["^ (\\S+н)ий [Тт][уо]ннель ", " $1его тоннеля "],
            ["^ (\\S+)[иоы]й [Тт][уо]ннель ", " $1ого тоннеля "],
            ["^ (\\S+[иы]н) [Тт][уо]ннель ", " $1ого тоннеля "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Тт][уо]ннель ", " $1ого $2его тоннеля "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Тт][уо]ннель ", " $1его $2ого тоннеля "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Тт][уо]ннель ", " $1ого $2ого тоннеля "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Тт][уо]ннель ", " $1ого $2ого тоннеля "],
            ["^ (\\d+)-й (\\S+н)ий [Тт][уо]ннель ", " $1-го $2его тоннеля "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Тт][уо]ннель ", " $1-го $2ого тоннеля "],
            ["^ (\\d+)-й (\\S+[иы]н) [Тт][уо]ннель ", " $1-го $2ого тоннеля "],
            ["^ [Тт][уо]ннель ", " тоннеля "],

            ["^ (\\S+н)ий [Тт]ракт ", " $1ем тракта "],
            ["^ (\\S+)[иоы]й [Тт]ракт ", " $1ого тракта "],
            ["^ (\\S+[еёо]в) [Тт]ракт ", " $1а тракта "],
            ["^ (\\S+[иы]н) [Тт]ракт ", " $1а тракта "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Тт]ракт ", " $1ого $2его тракта "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Тт]ракт ", " $1его $2ого тракта "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Тт]ракт ", " $1ого $2ого тракта "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Тт]ракт ", " $1ого $2а тракта "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Тт]ракт ", " $1ого $2а тракта "],
            ["^ (\\d+)-й (\\S+н)ий [Тт]ракт ", " $1-го $2его тракта "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Тт]ракт ", " $1-го $2ого тракта "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Тт]ракт ", " $1-го $2а тракта "],
            ["^ (\\d+)-й (\\S+[иы]н) [Тт]ракт ", " $1-го $2а тракта "],
            ["^ [Тт]ракт ", " тракта "],

            ["^ (\\S+н)ий [Тт]упик ", " $1его тупика "],
            ["^ (\\S+)[иоы]й [Тт]упик ", " $1ого тупика "],
            ["^ (\\S+[еёо]в) [Тт]упик ", " $1а тупика "],
            ["^ (\\S+[иы]н) [Тт]упик ", " $1а тупика "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Тт]упик ", " $1ого $2его тупика "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Тт]упик ", " $1его $2ого тупика "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Тт]упик ", " $1ого $2ого тупика "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Тт]упик ", " $1ого $2а тупика "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Тт]упик ", " $1ого $2а тупика "],
            ["^ (\\d+)-й [Тт]упик ", " $1-го тупика "],
            ["^ (\\d+)-й (\\S+н)ий [Тт]упик ", " $1-го $2его тупика "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Тт]упик ", " $1-го $2ого тупика "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Тт]упик ", " $1-го $2а тупика "],
            ["^ (\\d+)-й (\\S+[иы]н) [Тт]упик ", " $1-го $2а тупика "],
            ["^ [Тт]упик ", " тупика "],

            ["^ (\\S+[ео])е ([Пп]олу)?[Кк]ольцо ", " $1го $2кольца "],
            ["^ (\\S+ье) ([Пп]олу)?[Кк]ольцо ", " $1го $2кольца "],
            ["^ (\\S+[ео])е (\\S+[ео])е ([Пп]олу)?[Кк]ольцо ", " $1го $2го $3кольца "],
            ["^ (\\S+ье) (\\S+[ео])е ([Пп]олу)?[Кк]ольцо ", " $1го $2го $3кольца "],
            ["^ (\\d+)-е (\\S+[ео])е ([Пп]олу)?[Кк]ольцо ", " $1-го $2го $3кольца "],
            ["^ (\\d+)-е (\\S+ье) ([Пп]олу)?[Кк]ольцо ", " $1-го $2го $3кольца "],
            ["^ ([Пп]олу)?[Кк]ольцо ", " $1кольца "],

            ["^ (\\S+[ео])е [Шш]оссе ", " $1го шоссе "],
            ["^ (\\S+ье) [Шш]оссе ", " $1го шоссе "],
            ["^ (\\S+[ео])е (\\S+[ео])е [Шш]оссе ", " $1го $2го шоссе "],
            ["^ (\\S+ье) (\\S+[ео])е [Шш]оссе ", " $1го $2го шоссе "],
            ["^ (\\d+)-е (\\S+[ео])е [Шш]оссе ", " $1-го $2го шоссе "],
            ["^ (\\d+)-е (\\S+ье) [Шш]оссе ", " $1-го $2го шоссе "],

            [" ([Тт])ретого ", " $1ретьего "],
            ["([жч])ого ", "$1ьего "]
        ],
        "prepositional": [
            ["^ ([«\"])", " трасса $1"],

            ["^ (\\S+)ая [Аа]ллея ", " $1ой аллее "],
            ["^ (\\S+)ья [Аа]ллея ", " $1ьей аллее "],
            ["^ (\\S+)яя [Аа]ллея ", " $1ей аллее "],
            ["^ (\\d+)-я (\\S+)ая [Аа]ллея ", " $1-й $2ой аллее "],
            ["^ [Аа]ллея ", " аллее "],

            ["^ (\\S+)ая-(\\S+)ая [Уу]лица ", " $1ой-$2ой улице "],
            ["^ (\\S+)ая [Уу]лица ", " $1ой улице "],
            ["^ (\\S+)ья [Уу]лица ", " $1ьей улице "],
            ["^ (\\S+)яя [Уу]лица ", " $1ей улице "],
            ["^ (\\d+)-я [Уу]лица ", " $1-й улице "],
            ["^ (\\d+)-я (\\S+)ая [Уу]лица ", " $1-й $2ой улице "],
            ["^ (\\S+)ая (\\S+)ая [Уу]лица ", " $1ой $2ой улице "],
            ["^ (\\S+[вн])а [Уу]лица ", " $1ой улице "],
            ["^ (\\S+)ая (\\S+[вн])а [Уу]лица ", " $1ой $2ой улице "],
            ["^ Даньславля [Уу]лица ", " Даньславлей улице "],
            ["^ Добрыня [Уу]лица ", " Добрыней улице "],
            ["^ Людогоща [Уу]лица ", " Людогощей улице "],
            ["^ [Уу]лица ", " улице "],

            ["^ (\\d+)-я [Лл]иния ", " $1-й линии "],
            ["^ (\\d+)-(\\d+)-я [Лл]иния ", " $1-$2-й линии "],
            ["^ (\\S+)ая [Лл]иния ", " $1ой линии "],
            ["^ (\\S+)ья [Лл]иния ", " $1ьей линии "],
            ["^ (\\S+)яя [Лл]иния ", " $1ей линии "],
            ["^ (\\d+)-я (\\S+)ая [Лл]иния ", " $1-й $2ой линии "],
            ["^ [Лл]иния ", " линии "],

            ["^ (\\d+)-(\\d+)-я [Лл]инии ", " $1-$2-й линиях "],

            ["^ (\\S+)ая [Нн]абережная ", " $1ой набережной "],
            ["^ (\\S+)ья [Нн]абережная ", " $1ьей набережной "],
            ["^ (\\S+)яя [Нн]абережная ", " $1ей набережной "],
            ["^ (\\d+)-я (\\S+)ая [Нн]абережная ", " $1-й $2ой набережной "],
            ["^ [Нн]абережная ", " набережной "],

            ["^ (\\S+)ая [Пп]лощадь ", " $1ой площади "],
            ["^ (\\S+)ья [Пп]лощадь ", " $1ьей площади "],
            ["^ (\\S+)яя [Пп]лощадь ", " $1ей площади "],
            ["^ (\\S+[вн])а [Пп]лощадь ", " $1ой площади "],
            ["^ (\\d+)-я (\\S+)ая [Пп]лощадь ", " $1-й $2ой площади "],
            ["^ [Пп]лощадь ", " площади "],

            ["^ (\\S+)ая [Пп]росека ", " $1ой просеке "],
            ["^ (\\S+)ья [Пп]росека ", " $1ьей просеке "],
            ["^ (\\S+)яя [Пп]росека ", " $1ей просеке "],
            ["^ (\\d+)-я [Пп]росека ", " $1-й просеке "],
            ["^ [Пп]росека ", " просеке "],

            ["^ (\\S+)ая [Ээ]стакада ", " $1ой эстакаде "],
            ["^ (\\S+)ья [Ээ]стакада ", " $1ьей эстакаде "],
            ["^ (\\S+)яя [Ээ]стакада ", " $1ей эстакаде "],
            ["^ (\\d+)-я (\\S+)ая [Ээ]стакада ", " $1-й $2ой эстакаде "],
            ["^ [Ээ]стакада ", " эстакаде "],

            ["^ (\\S+)ая [Мм]агистраль ", " $1ой магистрали "],
            ["^ (\\S+)ья [Мм]агистраль ", " $1ьей магистрали "],
            ["^ (\\S+)яя [Мм]агистраль ", " $1ей магистрали "],
            ["^ (\\S+)ая (\\S+)ая [Мм]агистраль ", " $1ой $2ой магистрали "],
            ["^ (\\d+)-я (\\S+)ая [Мм]агистраль ", " $1-й $2ой магистрали "],
            ["^ [Мм]агистраль ", " магистрали "],

            ["^ (\\S+)ая [Рр]азвязка ", " $1ой развязке "],
            ["^ (\\S+)ья [Рр]азвязка ", " $1ьей развязке "],
            ["^ (\\S+)яя [Рр]азвязка ", " $1ей развязке "],
            ["^ (\\d+)-я (\\S+)ая [Рр]азвязка ", " $1-й $2ой развязке "],
            ["^ [Рр]азвязка ", " развязке "],

            ["^ (\\S+)ая [Тт]расса ", " $1ой трассе "],
            ["^ (\\S+)ья [Тт]расса ", " $1ьей трассе "],
            ["^ (\\S+)яя [Тт]расса ", " $1ей трассе "],
            ["^ (\\d+)-я (\\S+)ая [Тт]расса ", " $1-й $2ой трассе "],
            ["^ [Тт]расса ", " трассе "],

            ["^ (\\S+)ая ([Аа]вто)?[Дд]орога ", " $1ой $2дороге "],
            ["^ (\\S+)ья ([Аа]вто)?[Дд]орога ", " $1ьей $2дороге "],
            ["^ (\\S+)яя ([Аа]вто)?[Дд]орога ", " $1ей $2дороге "],
            ["^ (\\S+)ая (\\S+)ая ([Аа]вто)?[Дд]орога ", " $1ой $2ой $3дороге "],
            ["^ (\\d+)-я (\\S+)ая ([Аа]вто)?[Дд]орога ", " $1-й $2ой $3дороге "],
            ["^ ([Аа]вто)?[Дд]орога ", " $1дороге "],

            ["^ (\\S+)ая [Дд]орожка ", " $1ой дорожке "],
            ["^ (\\S+)ья [Дд]орожка ", " $1ьей дорожке "],
            ["^ (\\S+)яя [Дд]орожка ", " $1ей дорожке "],
            ["^ (\\d+)-я (\\S+)ая [Дд]орожка ", " $1-й $2ой дорожке "],
            ["^ [Дд]орожка ", " дорожке "],

            ["^ (\\S+)во [Пп]оле ", " $1вом поле "],
            ["^ (\\S+)ая [Кк]оса ", " $1ой косе "],
            ["^ (\\S+)ая [Хх]орда ", " $1ой хорде "],
            ["^ (\\S+)[иоы]й [Пп]роток ", " $1ом протоке "],

            ["^ (\\S+н)ий [Бб]ульвар ", " $1ем бульваре "],
            ["^ (\\S+)[иоы]й [Бб]ульвар ", " $1ом бульваре "],
            ["^ (\\S+[иы]н) [Бб]ульвар ", " $1ом бульваре "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Бб]ульвар ", " $1ом $2ем бульваре "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Бб]ульвар ", " $1ем $2ом бульваре "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Бб]ульвар ", " $1ом $2ом бульваре "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Бб]ульвар ", " $1ом $2ом бульваре "],
            ["^ (\\d+)-й (\\S+н)ий [Бб]ульвар ", " $1-м $2ем бульваре "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Бб]ульвар ", " $1-м $2ом бульваре "],
            ["^ (\\d+)-й (\\S+[иы]н) [Бб]ульвар ", " $1-м $2ом бульваре "],
            ["^ [Бб]ульвар ", " бульваре "],

            ["^ [Дд]убл[её]р ", " дублёре "],

            ["^ (\\S+н)ий [Зз]аезд ", " $1ем заезде "],
            ["^ (\\S+)[иоы]й [Зз]аезд ", " $1ом заезде "],
            ["^ (\\S+[еёо]в) [Зз]аезд ", " $1ом заезде "],
            ["^ (\\S+[иы]н) [Зз]аезд ", " $1ом заезде "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Зз]аезд ", " $1ом $2ем заезде "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Зз]аезд ", " $1ем $2ом заезде "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Зз]аезд ", " $1ом $2ом заезде "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Зз]аезд ", " $1ом $2ом заезде "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Зз]аезд ", " $1ом $2ом заезде "],
            ["^ (\\d+)-й (\\S+н)ий [Зз]аезд ", " $1-м $2ем заезде "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Зз]аезд ", " $1-м $2ом заезде "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Зз]аезд ", " $1-м $2ом заезде "],
            ["^ (\\d+)-й (\\S+[иы]н) [Зз]аезд ", " $1-м $2ом заезде "],
            ["^ [Зз]аезд ", " заезде "],

            ["^ (\\S+н)ий [Мм]ост ", " $1ем мосту "],
            ["^ (\\S+)[иоы]й [Мм]ост ", " $1ом мосту "],
            ["^ (\\S+[еёо]в) [Мм]ост ", " $1ом мосту "],
            ["^ (\\S+[иы]н) [Мм]ост ", " $1ом мосту "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Мм]ост ", " $1ом $2ем мосту "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Мм]ост ", " $1ем $2ом мосту "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Мм]ост ", " $1ом $2ом мосту "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Мм]ост ", " $1ом $2ом мосту "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Мм]ост ", " $1ом $2ом мосту "],
            ["^ (\\d+)-й [Мм]ост ", " $1-м мосту "],
            ["^ (\\d+)-й (\\S+н)ий [Мм]ост ", " $1-м $2ем мосту "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Мм]ост ", " $1-м $2ом мосту "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Мм]ост ", " $1-м $2ом мосту "],
            ["^ (\\d+)-й (\\S+[иы]н) [Мм]ост ", " $1-м $2ом мосту "],
            ["^ [Мм]ост ", " мосту "],

            ["^ (\\S+н)ий [Оо]бход ", " $1ем обходе "],
            ["^ (\\S+)[иоы]й [Оо]бход ", " $1ом обходе "],
            ["^ [Оо]бход ", " обходе "],

            ["^ (\\S+н)ий [Пп]арк ", " $1ем парке "],
            ["^ (\\S+)[иоы]й [Пп]арк ", " $1ом парке "],
            ["^ (\\S+[иы]н) [Пп]арк ", " $1ом парке "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Пп]арк ", " $1ом $2ем парке "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Пп]арк ", " $1ем $2ом парке "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Пп]арк ", " $1ом $2ом парке "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Пп]арк ", " $1ом $2ом парке "],
            ["^ (\\d+)-й (\\S+н)ий [Пп]арк ", " $1-м $2ем парке "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Пп]арк ", " $1-м $2ом парке "],
            ["^ (\\d+)-й (\\S+[иы]н) [Пп]арк ", " $1-м $2ом парке "],
            ["^ [Пп]арк ", " парке "],

            ["^ (\\S+)[иоы]й-(\\S+)[иоы]й [Пп]ереулок ", " $1ом-$2ом переулке "],
            ["^ (\\d+)-й (\\S+)[иоы]й-(\\S+)[иоы]й [Пп]ереулок ", " $1-м $2ом-$3ом переулке "],
            ["^ (\\S+н)ий [Пп]ереулок ", " $1ем переулке "],
            ["^ (\\S+)[иоы]й [Пп]ереулок ", " $1ом переулке "],
            ["^ (\\S+[еёо]в) [Пп]ереулок ", " $1ом переулке "],
            ["^ (\\S+[иы]н) [Пп]ереулок ", " $1ом переулке "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Пп]ереулок ", " $1ом $2ем переулке "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Пп]ереулок ", " $1ем $2ом переулке "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Пп]ереулок ", " $1ом $2ом переулке "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Пп]ереулок ", " $1ом $2ом переулке "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Пп]ереулок ", " $1ом $2ом переулке "],
            ["^ (\\d+)-й [Пп]ереулок ", " $1-м переулке "],
            ["^ (\\d+)-й (\\S+н)ий [Пп]ереулок ", " $1-м $2ем переулке "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Пп]ереулок ", " $1-м $2ом переулке "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Пп]ереулок ", " $1-м $2ом переулке "],
            ["^ (\\d+)-й (\\S+[иы]н) [Пп]ереулок ", " $1-м $2ом переулке "],
            ["^ [Пп]ереулок ", " переулке "],

            ["^ [Пп]одъезд ", " подъезде "],

            ["^ (\\S+[еёо]в)-(\\S+)[иоы]й [Пп]роезд ", " $1ом-$2ом проезде "],
            ["^ (\\S+н)ий [Пп]роезд ", " $1ем проезде "],
            ["^ (\\S+)[иоы]й [Пп]роезд ", " $1ом проезде "],
            ["^ (\\S+[еёо]в) [Пп]роезд ", " $1ом проезде "],
            ["^ (\\S+[иы]н) [Пп]роезд ", " $1ом проезде "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Пп]роезд ", " $1ом $2ем проезде "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Пп]роезд ", " $1ем $2ом проезде "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Пп]роезд ", " $1ом $2ом проезде "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Пп]роезд ", " $1ом $2ом проезде "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Пп]роезд ", " $1ом $2ом проезде "],
            ["^ (\\d+)-й [Пп]роезд ", " $1-м проезде "],
            ["^ (\\d+)-й (\\S+н)ий [Пп]роезд ", " $1-м $2ем проезде "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Пп]роезд ", " $1-м $2ом проезде "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Пп]роезд ", " $1-м $2ом проезде "],
            ["^ (\\d+)-й (\\S+[иы]н) [Пп]роезд ", " $1-м $2ом проезде "],
            ["^ (\\d+)-й (\\S+н)ий (\\S+)[иоы]й [Пп]роезд ", " $1-м $2ем $3ом проезде "],
            ["^ (\\d+)-й (\\S+)[иоы]й (\\S+)[иоы]й [Пп]роезд ", " $1-м $2ом $3ом проезде "],
            ["^ [Пп]роезд ", " проезде "],

            ["^ (\\S+н)ий [Пп]роспект ", " $1ем проспекте "],
            ["^ (\\S+)[иоы]й [Пп]роспект ", " $1ом проспекте "],
            ["^ (\\S+[иы]н) [Пп]роспект ", " $1ом проспекте "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Пп]роспект ", " $1ом $2ем проспекте "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Пп]роспект ", " $1ем $2ом проспекте "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Пп]роспект ", " $1ом $2ом проспекте "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Пп]роспект ", " $1ом $2ом проспекте "],
            ["^ (\\d+)-й (\\S+н)ий [Пп]роспект ", " $1-м $2ем проспекте "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Пп]роспект ", " $1-м $2ом проспекте "],
            ["^ (\\d+)-й (\\S+[иы]н) [Пп]роспект ", " $1-м $2ом проспекте "],
            ["^ [Пп]роспект ", " проспекте "],

            ["^ (\\S+н)ий [Пп]утепровод ", " $1ем путепроводе "],
            ["^ (\\S+)[иоы]й [Пп]утепровод ", " $1ом путепроводе "],
            ["^ (\\S+[иы]н) [Пп]утепровод ", " $1ом путепроводе "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Пп]утепровод ", " $1ом $2ем путепроводе "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Пп]утепровод ", " $1ем $2ом путепроводе "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Пп]утепровод ", " $1ом $2ом путепроводе "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Пп]утепровод ", " $1ом $2ом путепроводе "],
            ["^ (\\d+)-й (\\S+н)ий [Пп]утепровод ", " $1-м $2ем путепроводе "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Пп]утепровод ", " $1-м $2ом путепроводе "],
            ["^ (\\d+)-й (\\S+[иы]н) [Пп]утепровод ", " $1-м $2ом путепроводе "],
            ["^ [Пп]утепровод ", " путепроводе "],

            ["^ (\\S+н)ий [Сс]пуск ", " $1ем спуске "],
            ["^ (\\S+)[иоы]й [Сс]пуск ", " $1ом спуске "],
            ["^ (\\S+[еёо]в) [Сс]пуск ", " $1ом спуске "],
            ["^ (\\S+[иы]н) [Сс]пуск ", " $1ом спуске "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Сс]пуск ", " $1ом $2ем спуске "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Сс]пуск ", " $1ем $2ом спуске "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Сс]пуск ", " $1ом $2ом спуске "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Сс]пуск ", " $1ом $2ом спуске "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Сс]пуск ", " $1ом $2ом спуске "],
            ["^ (\\d+)-й (\\S+н)ий [Сс]пуск ", " $1-м $2ем спуске "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Сс]пуск ", " $1-м $2ом спуске "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Сс]пуск ", " $1-м $2ом спуске "],
            ["^ (\\d+)-й (\\S+[иы]н) [Сс]пуск ", " $1-м $2ом спуске "],
            ["^ [Сс]пуск ", " спуске "],

            ["^ (\\S+н)ий [Сс]ъезд ", " $1ем съезде "],
            ["^ (\\S+)[иоы]й [Сс]ъезд ", " $1ом съезде "],
            ["^ (\\S+[иы]н) [Сс]ъезд ", " $1ом съезде "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Сс]ъезд ", " $1ом $2ем съезде "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Сс]ъезд ", " $1ем $2ом съезде "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Сс]ъезд ", " $1ом $2ом съезде "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Сс]ъезд ", " $1ом $2ом съезде "],
            ["^ (\\d+)-й (\\S+н)ий [Сс]ъезд ", " $1-м $2ем съезде "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Сс]ъезд ", " $1-м $2ом съезде "],
            ["^ (\\d+)-й (\\S+[иы]н) [Сс]ъезд ", " $1-м $2ом съезде "],
            ["^ [Сс]ъезд ", " съезде "],

            ["^ (\\S+н)ий [Тт][уо]ннель ", " $1ем тоннеле "],
            ["^ (\\S+)[иоы]й [Тт][уо]ннель ", " $1ом тоннеле "],
            ["^ (\\S+[иы]н) [Тт][уо]ннель ", " $1ом тоннеле "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Тт][уо]ннель ", " $1ом $2ем тоннеле "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Тт][уо]ннель ", " $1ем $2ом тоннеле "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Тт][уо]ннель ", " $1ом $2ом тоннеле "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Тт][уо]ннель ", " $1ом $2ом тоннеле "],
            ["^ (\\d+)-й (\\S+н)ий [Тт][уо]ннель ", " $1-м $2ем тоннеле "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Тт][уо]ннель ", " $1-м $2ом тоннеле "],
            ["^ (\\d+)-й (\\S+[иы]н) [Тт][уо]ннель ", " $1-м $2ом тоннеле "],
            ["^ [Тт][уо]ннель ", " тоннеле "],

            ["^ (\\S+н)ий [Тт]ракт ", " $1ем тракте "],
            ["^ (\\S+)[иоы]й [Тт]ракт ", " $1ом тракте "],
            ["^ (\\S+[еёо]в) [Тт]ракт ", " $1ом тракте "],
            ["^ (\\S+[иы]н) [Тт]ракт ", " $1ом тракте "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Тт]ракт ", " $1ом $2ем тракте "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Тт]ракт ", " $1ем $2ом тракте "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Тт]ракт ", " $1ом $2ом тракте "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Тт]ракт ", " $1ом $2ом тракте "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Тт]ракт ", " $1ом $2ом тракте "],
            ["^ (\\d+)-й (\\S+н)ий [Тт]ракт ", " $1-м $2ем тракте "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Тт]ракт ", " $1-м $2ом тракте "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Тт]ракт ", " $1-м $2ом тракте "],
            ["^ (\\d+)-й (\\S+[иы]н) [Тт]ракт ", " $1-м $2ом тракте "],
            ["^ [Тт]ракт ", " тракте "],

            ["^ (\\S+н)ий [Тт]упик ", " $1ем тупике "],
            ["^ (\\S+)[иоы]й [Тт]упик ", " $1ом тупике "],
            ["^ (\\S+[еёо]в) [Тт]упик ", " $1ом тупике "],
            ["^ (\\S+[иы]н) [Тт]упик ", " $1ом тупике "],
            ["^ (\\S+)[иоы]й (\\S+н)ий [Тт]упик ", " $1ом $2ем тупике "],
            ["^ (\\S+н)ий (\\S+)[иоы]й [Тт]упик ", " $1ем $2ом тупике "],
            ["^ (\\S+)[иоы]й (\\S+)[иоы]й [Тт]упик ", " $1ом $2ом тупике "],
            ["^ (\\S+)[иоы]й (\\S+[еёо]в) [Тт]упик ", " $1ом $2ом тупике "],
            ["^ (\\S+)[иоы]й (\\S+[иы]н) [Тт]упик ", " $1ом $2ом тупике "],
            ["^ (\\d+)-й [Тт]упик ", " $1-м тупике "],
            ["^ (\\d+)-й (\\S+н)ий [Тт]упик ", " $1-м $2ем тупике "],
            ["^ (\\d+)-й (\\S+)[иоы]й [Тт]упик ", " $1-м $2ом тупике "],
            ["^ (\\d+)-й (\\S+[еёо]в) [Тт]упик ", " $1-м $2ом тупике "],
            ["^ (\\d+)-й (\\S+[иы]н) [Тт]упик ", " $1-м $2ом тупике "],
            ["^ [Тт]упик ", " тупике "],

            ["^ (\\S+[ео])е ([Пп]олу)?[Кк]ольцо ", " $1м $2кольце "],
            ["^ (\\S+ье) ([Пп]олу)?[Кк]ольцо ", " $1м $2кольце "],
            ["^ (\\S+[ео])е (\\S+[ео])е ([Пп]олу)?[Кк]ольцо ", " $1м $2м $3кольце "],
            ["^ (\\S+ье) (\\S+[ео])е ([Пп]олу)?[Кк]ольцо ", " $1м $2м $3кольце "],
            ["^ (\\d+)-е (\\S+[ео])е ([Пп]олу)?[Кк]ольцо ", " $1-м $2м $3кольце "],
            ["^ (\\d+)-е (\\S+ье) ([Пп]олу)?[Кк]ольцо ", " $1-м $2м $3кольце "],
            ["^ ([Пп]олу)?[Кк]ольцо ", " $1кольце "],

            ["^ (\\S+[ео])е [Шш]оссе ", " $1м шоссе "],
            ["^ (\\S+ье) [Шш]оссе ", " $1м шоссе "],
            ["^ (\\S+[ео])е (\\S+[ео])е [Шш]оссе ", " $1м $2м шоссе "],
            ["^ (\\S+ье) (\\S+[ео])е [Шш]оссе ", " $1м $2м шоссе "],
            ["^ (\\d+)-е (\\S+[ео])е [Шш]оссе ", " $1-м $2м шоссе "],
            ["^ (\\d+)-е (\\S+ье) [Шш]оссе ", " $1-м $2м шоссе "],

            [" ([Тт])ретом ", " $1ретьем "],
            ["([жч])ом ", "$1ьем "]
        ]
    }
}

},{}],21:[function(require,module,exports){
module.exports={
    "meta": {
        "capitalizeFirstLetter": true
    },
    "v5": {
        "constants": {
            "ordinalize": {
                "1": "første",
                "2": "anden",
                "3": "tredje",
                "4": "fjerde",
                "5": "femte",
                "6": "sjette",
                "7": "syvende",
                "8": "ottende",
                "9": "niende",
                "10": "tiende"
            },
            "direction": {
                "north": "Nord",
                "northeast": "Nordøst",
                "east": "Øst",
                "southeast": "Sydøst",
                "south": "Syd",
                "southwest": "Sydvest",
                "west": "Vest",
                "northwest": "Nordvest"
            },
            "modifier": {
                "left": "venstresving",
                "right": "højresving",
                "sharp left": "skarpt venstresving",
                "sharp right": "skarpt højresving",
                "slight left": "svagt venstresving",
                "slight right": "svagt højresving",
                "straight": "ligeud",
                "uturn": "U-vending"
            },
            "lanes": {
                "xo": "Hold til højre",
                "ox": "Hold til venstre",
                "xox": "Benyt midterste spor",
                "oxo": "Hold til højre eller venstre"
            }
        },
        "modes": {
            "ferry": {
                "default": "Tag færgen",
                "name": "Tag færgen {way_name}",
                "destination": "Tag færgen i retning {destination}"
            }
        },
        "phrase": {
            "two linked by distance": "{instruction_one} derefter, efter {distance}, {instruction_two}",
            "two linked": "{instruction_one}, derefter {instruction_two}",
            "one in distance": "Efter {distance} {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "afkørsel {exit}"
        },
        "arrive": {
            "default": {
                "default": "Du er ankommet til din {nth} destination",
                "upcoming": "Du vil ankomme til din {nth} destination",
                "short": "Du er ankommet",
                "short-upcoming": "Du vil ankomme",
                "named": "Du er ankommet til {waypoint_name}"
            },
            "left": {
                "default": "Du er ankommet til din {nth} destination, som befinder sig til venstre",
                "upcoming": "Du vil ankomme til din {nth} destination på venstre hånd",
                "short": "Du er ankommet",
                "short-upcoming": "Du vil ankomme",
                "named": "Du er ankommet til {waypoint_name}, som befinder sig til venstre"
            },
            "right": {
                "default": "Du er ankommet til din {nth} destination, som befinder sig til højre",
                "upcoming": "Du vil ankomme til din {nth} destination på højre hånd",
                "short": "Du er ankommet",
                "short-upcoming": "Du vil ankomme",
                "named": "Du er ankommet til {waypoint_name}, som befinder sig til højre"
            },
            "sharp left": {
                "default": "Du er ankommet til din {nth} destination, som befinder sig til venstre",
                "upcoming": "Du vil ankomme til din {nth} destination på venstre hånd",
                "short": "Du er ankommet",
                "short-upcoming": "Du vil ankomme",
                "named": "Du er ankommet til {waypoint_name}, som befinder sig til venstre"
            },
            "sharp right": {
                "default": "Du er ankommet til din {nth} destination, som befinder sig til højre",
                "upcoming": "Du vil ankomme til din {nth} destination på højre hånd",
                "short": "Du er ankommet",
                "short-upcoming": "Du vil ankomme",
                "named": "Du er ankommet til {waypoint_name}, som befinder sig til højre"
            },
            "slight right": {
                "default": "Du er ankommet til din {nth} destination, som befinder sig til højre",
                "upcoming": "Du vil ankomme til din {nth} destination på højre hånd",
                "short": "Du er ankommet",
                "short-upcoming": "Du vil ankomme",
                "named": "Du er ankommet til {waypoint_name}, som befinder sig til højre"
            },
            "slight left": {
                "default": "Du er ankommet til din {nth} destination, som befinder sig til venstre",
                "upcoming": "Du vil ankomme til din {nth} destination på venstre hånd",
                "short": "Du er ankommet",
                "short-upcoming": "Du vil ankomme",
                "named": "Du er ankommet til {waypoint_name}, som befinder sig til venstre"
            },
            "straight": {
                "default": "Du er ankommet til din {nth} destination, der befinder sig lige frem",
                "upcoming": "Du vil ankomme til din {nth} destination foran dig",
                "short": "Du er ankommet",
                "short-upcoming": "Du vil ankomme",
                "named": "Du er ankommet til {waypoint_name}, der befinder sig lige frem"
            }
        },
        "continue": {
            "default": {
                "default": "Drej til {modifier}",
                "name": "Drej til {modifier} videre ad {way_name}",
                "destination": "Drej til {modifier} mod {destination}",
                "exit": "Drej til {modifier} ad {way_name}"
            },
            "straight": {
                "default": "Fortsæt ligeud",
                "name": "Fortsæt ligeud ad {way_name}",
                "destination": "Fortsæt mod {destination}",
                "distance": "Fortsæt {distance} ligeud",
                "namedistance": "Fortsæt {distance} ad {way_name}"
            },
            "sharp left": {
                "default": "Drej skarpt til venstre",
                "name": "Drej skarpt til venstre videre ad {way_name}",
                "destination": "Drej skarpt til venstre mod {destination}"
            },
            "sharp right": {
                "default": "Drej skarpt til højre",
                "name": "Drej skarpt til højre videre ad {way_name}",
                "destination": "Drej skarpt til højre mod {destination}"
            },
            "slight left": {
                "default": "Drej left til venstre",
                "name": "Drej let til venstre videre ad {way_name}",
                "destination": "Drej let til venstre mod {destination}"
            },
            "slight right": {
                "default": "Drej let til højre",
                "name": "Drej let til højre videre ad {way_name}",
                "destination": "Drej let til højre mod {destination}"
            },
            "uturn": {
                "default": "Foretag en U-vending",
                "name": "Foretag en U-vending tilbage ad {way_name}",
                "destination": "Foretag en U-vending mod {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Kør mod {direction}",
                "name": "Kør mod {direction} ad {way_name}",
                "namedistance": "Fortsæt {distance} ad {way_name}mod {direction}"
            }
        },
        "end of road": {
            "default": {
                "default": "Drej til {modifier}",
                "name": "Drej til {modifier} ad {way_name}",
                "destination": "Drej til {modifier} mof {destination}"
            },
            "straight": {
                "default": "Fortsæt ligeud",
                "name": "Fortsæt ligeud ad {way_name}",
                "destination": "Fortsæt ligeud mod {destination}"
            },
            "uturn": {
                "default": "Foretag en U-vending for enden af vejen",
                "name": "Foretag en U-vending ad {way_name} for enden af vejen",
                "destination": "Foretag en U-vending mod {destination} for enden af vejen"
            }
        },
        "fork": {
            "default": {
                "default": "Hold til {modifier} ved udfletningen",
                "name": "Hold mod {modifier} på {way_name}",
                "destination": "Hold mod {modifier} mod {destination}"
            },
            "slight left": {
                "default": "Hold til venstre ved udfletningen",
                "name": "Hold til venstre på {way_name}",
                "destination": "Hold til venstre mod {destination}"
            },
            "slight right": {
                "default": "Hold til højre ved udfletningen",
                "name": "Hold til højre på {way_name}",
                "destination": "Hold til højre mod {destination}"
            },
            "sharp left": {
                "default": "Drej skarpt til venstre ved udfletningen",
                "name": "Drej skarpt til venstre ad {way_name}",
                "destination": "Drej skarpt til venstre mod {destination}"
            },
            "sharp right": {
                "default": "Drej skarpt til højre ved udfletningen",
                "name": "Drej skarpt til højre ad {way_name}",
                "destination": "Drej skarpt til højre mod {destination}"
            },
            "uturn": {
                "default": "Foretag en U-vending",
                "name": "Foretag en U-vending ad {way_name}",
                "destination": "Foretag en U-vending mod {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Flet til {modifier}",
                "name": "Flet til {modifier} ad {way_name}",
                "destination": "Flet til {modifier} mod {destination}"
            },
            "straight": {
                "default": "Flet",
                "name": "Flet ind på {way_name}",
                "destination": "Flet ind mod {destination}"
            },
            "slight left": {
                "default": "Flet til venstre",
                "name": "Flet til venstre ad {way_name}",
                "destination": "Flet til venstre mod {destination}"
            },
            "slight right": {
                "default": "Flet til højre",
                "name": "Flet til højre ad {way_name}",
                "destination": "Flet til højre mod {destination}"
            },
            "sharp left": {
                "default": "Flet til venstre",
                "name": "Flet til venstre ad {way_name}",
                "destination": "Flet til venstre mod {destination}"
            },
            "sharp right": {
                "default": "Flet til højre",
                "name": "Flet til højre ad {way_name}",
                "destination": "Flet til højre mod {destination}"
            },
            "uturn": {
                "default": "Foretag en U-vending",
                "name": "Foretag en U-vending ad {way_name}",
                "destination": "Foretag en U-vending mod {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Fortsæt {modifier}",
                "name": "Fortsæt {modifier} ad {way_name}",
                "destination": "Fortsæt {modifier} mod {destination}"
            },
            "straight": {
                "default": "Fortsæt ligeud",
                "name": "Fortsæt ad {way_name}",
                "destination": "Fortsæt mod {destination}"
            },
            "sharp left": {
                "default": "Drej skarpt til venstre",
                "name": "Drej skarpt til venstre ad {way_name}",
                "destination": "Drej skarpt til venstre mod {destination}"
            },
            "sharp right": {
                "default": "Drej skarpt til højre",
                "name": "Drej skarpt til højre ad {way_name}",
                "destination": "Drej skarpt til højre mod {destination}"
            },
            "slight left": {
                "default": "Fortsæt til venstre",
                "name": "Fortsæt til venstre ad {way_name}",
                "destination": "Fortsæt til venstre mod {destination}"
            },
            "slight right": {
                "default": "Fortsæt til højre",
                "name": "Fortsæt til højre ad {way_name}",
                "destination": "Fortsæt til højre mod {destination}"
            },
            "uturn": {
                "default": "Foretag en U-vending",
                "name": "Foretag en U-vending ad {way_name}",
                "destination": "Foretag en U-vending mod {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Fortsæt {modifier}",
                "name": "Fortsæt {modifier} ad {way_name}",
                "destination": "Fortsæt {modifier} mod {destination}"
            },
            "uturn": {
                "default": "Foretag en U-vending",
                "name": "Foretag en U-vending ad {way_name}",
                "destination": "Foretag en U-vending mod {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Tag afkørslen",
                "name": "Tag afkørslen ad {way_name}",
                "destination": "Tag afkørslen mod {destination}",
                "exit": "Vælg afkørsel {exit}",
                "exit_destination": "Vælg afkørsel {exit} mod {destination}"
            },
            "left": {
                "default": "Tag afkørslen til venstre",
                "name": "Tag afkørslen til venstre ad {way_name}",
                "destination": "Tag afkørslen til venstre mod {destination}",
                "exit": "Vælg afkørsel {exit} til venstre",
                "exit_destination": "Vælg afkørsel {exit} til venstre mod {destination}\n"
            },
            "right": {
                "default": "Tag afkørslen til højre",
                "name": "Tag afkørslen til højre ad {way_name}",
                "destination": "Tag afkørslen til højre mod {destination}",
                "exit": "Vælg afkørsel {exit} til højre",
                "exit_destination": "Vælg afkørsel {exit} til højre mod {destination}"
            },
            "sharp left": {
                "default": "Tag afkørslen til venstre",
                "name": "Tag afkørslen til venstre ad {way_name}",
                "destination": "Tag afkørslen til venstre mod {destination}",
                "exit": "Vælg afkørsel {exit} til venstre",
                "exit_destination": "Vælg afkørsel {exit} til venstre mod {destination}\n"
            },
            "sharp right": {
                "default": "Tag afkørslen til højre",
                "name": "Tag afkørslen til højre ad {way_name}",
                "destination": "Tag afkørslen til højre mod {destination}",
                "exit": "Vælg afkørsel {exit} til højre",
                "exit_destination": "Vælg afkørsel {exit} til højre mod {destination}"
            },
            "slight left": {
                "default": "Tag afkørslen til venstre",
                "name": "Tag afkørslen til venstre ad {way_name}",
                "destination": "Tag afkørslen til venstre mod {destination}",
                "exit": "Vælg afkørsel {exit} til venstre",
                "exit_destination": "Vælg afkørsel {exit} til venstre mod {destination}\n"
            },
            "slight right": {
                "default": "Tag afkørslen til højre",
                "name": "Tag afkørslen til højre ad {way_name}",
                "destination": "Tag afkørslen til højre mod {destination}",
                "exit": "Vælg afkørsel {exit} til højre",
                "exit_destination": "Vælg afkørsel {exit} til højre mod {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Tag afkørslen",
                "name": "Tag afkørslen ad {way_name}",
                "destination": "Tag afkørslen mod {destination}"
            },
            "left": {
                "default": "Tag afkørslen til venstre",
                "name": "Tag afkørslen til venstre ad {way_name}",
                "destination": "Tag afkørslen til venstre mod {destination}"
            },
            "right": {
                "default": "Tag afkørslen til højre",
                "name": "Tag afkørslen til højre ad {way_name}",
                "destination": "Tag afkørslen til højre mod {destination}"
            },
            "sharp left": {
                "default": "Tag afkørslen til venstre",
                "name": "Tag afkørslen til venstre ad {way_name}",
                "destination": "Tag afkørslen til venstre mod {destination}"
            },
            "sharp right": {
                "default": "Tag afkørslen til højre",
                "name": "Tag afkørslen til højre ad {way_name}",
                "destination": "Tag afkørslen til højre mod {destination}"
            },
            "slight left": {
                "default": "Tag afkørslen til venstre",
                "name": "Tag afkørslen til venstre ad {way_name}",
                "destination": "Tag afkørslen til venstre mod {destination}"
            },
            "slight right": {
                "default": "Tag afkørslen til højre",
                "name": "Tag afkørslen til højre ad {way_name}",
                "destination": "Tag afkørslen til højre mod {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Kør ind i rundkørslen",
                    "name": "Tag rundkørslen og kør fra ad {way_name}",
                    "destination": "Tag rundkørslen og kør mod {destination}"
                },
                "name": {
                    "default": "Kør ind i {rotary_name}",
                    "name": "Kør ind i {rotary_name} og kør ad {way_name} ",
                    "destination": "Kør ind i {rotary_name} og kør mod {destination}"
                },
                "exit": {
                    "default": "Tag rundkørslen og forlad ved {exit_number} afkørsel",
                    "name": "Tag rundkørslen og forlad ved {exit_number} afkørsel ad {way_name}",
                    "destination": "Tag rundkørslen og forlad ved {exit_number} afkørsel mod {destination}"
                },
                "name_exit": {
                    "default": "Kør ind i {rotary_name} og forlad ved {exit_number} afkørsel",
                    "name": "Kør ind i {rotary_name} og forlad ved {exit_number} afkørsel ad {way_name}",
                    "destination": "Kør ind i {rotary_name} og forlad ved {exit_number} afkørsel mod {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "Tag rundkørslen og forlad ved {exit_number} afkørsel",
                    "name": "Tag rundkørslen og forlad ved {exit_number} afkørsel ad {way_name}",
                    "destination": "Tag rundkørslen og forlad ved {exit_number} afkørsel mod {destination}"
                },
                "default": {
                    "default": "Kør ind i rundkørslen",
                    "name": "Tag rundkørslen og kør fra ad {way_name}",
                    "destination": "Tag rundkørslen og kør mod {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "Foretag et {modifier}",
                "name": "Foretag et {modifier} ad {way_name}",
                "destination": "Foretag et {modifier} mod {destination}"
            },
            "left": {
                "default": "Drej til venstre",
                "name": "Drej til venstre ad {way_name}",
                "destination": "Drej til venstre mod {destination}"
            },
            "right": {
                "default": "Drej til højre",
                "name": "Drej til højre ad {way_name}",
                "destination": "Drej til højre mod {destination}"
            },
            "straight": {
                "default": "Fortsæt ligeud",
                "name": "Fortsæt ligeud ad {way_name}",
                "destination": "Fortsæt ligeud mod {destination}"
            }
        },
        "exit roundabout": {
            "default": {
                "default": "Forlad rundkørslen",
                "name": "Forlad rundkørslen ad {way_name}",
                "destination": "Forlad rundkørslen mod  {destination}"
            }
        },
        "exit rotary": {
            "default": {
                "default": "Forlad rundkørslen",
                "name": "Forlad rundkørslen ad {way_name}",
                "destination": "Forlad rundkørslen mod {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Foretag et {modifier}",
                "name": "Foretag et {modifier} ad {way_name}",
                "destination": "Foretag et {modifier} mod {destination}"
            },
            "left": {
                "default": "Drej til venstre",
                "name": "Drej til venstre ad {way_name}",
                "destination": "Drej til venstre mod {destination}"
            },
            "right": {
                "default": "Drej til højre",
                "name": "Drej til højre ad {way_name}",
                "destination": "Drej til højre mod {destination}"
            },
            "straight": {
                "default": "Fortsæt ligeud",
                "name": "Kør ligeud ad {way_name}",
                "destination": "Kør ligeud mod {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Fortsæt ligeud"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}

},{}],22:[function(require,module,exports){
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
        "phrase": {
            "two linked by distance": "{instruction_one} danach in {distance} {instruction_two}",
            "two linked": "{instruction_one} danach {instruction_two}",
            "one in distance": "In {distance}, {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "exit {exit}"
        },
        "arrive": {
            "default": {
                "default": "Sie haben Ihr {nth} Ziel erreicht",
                "upcoming": "Sie haben Ihr {nth} Ziel erreicht",
                "short": "Sie haben Ihr {nth} Ziel erreicht",
                "short-upcoming": "Sie haben Ihr {nth} Ziel erreicht",
                "named": "Sie haben Ihr {waypoint_name}"
            },
            "left": {
                "default": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich links",
                "upcoming": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich links",
                "short": "Sie haben Ihr {nth} Ziel erreicht",
                "short-upcoming": "Sie haben Ihr {nth} Ziel erreicht",
                "named": "Sie haben Ihr {waypoint_name}, es befindet sich links"
            },
            "right": {
                "default": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich rechts",
                "upcoming": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich rechts",
                "short": "Sie haben Ihr {nth} Ziel erreicht",
                "short-upcoming": "Sie haben Ihr {nth} Ziel erreicht",
                "named": "Sie haben Ihr {waypoint_name}, es befindet sich rechts"
            },
            "sharp left": {
                "default": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich links",
                "upcoming": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich links",
                "short": "Sie haben Ihr {nth} Ziel erreicht",
                "short-upcoming": "Sie haben Ihr {nth} Ziel erreicht",
                "named": "Sie haben Ihr {waypoint_name}, es befindet sich links"
            },
            "sharp right": {
                "default": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich rechts",
                "upcoming": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich rechts",
                "short": "Sie haben Ihr {nth} Ziel erreicht",
                "short-upcoming": "Sie haben Ihr {nth} Ziel erreicht",
                "named": "Sie haben Ihr {waypoint_name}, es befindet sich rechts"
            },
            "slight right": {
                "default": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich rechts",
                "upcoming": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich rechts",
                "short": "Sie haben Ihr {nth} Ziel erreicht",
                "short-upcoming": "Sie haben Ihr {nth} Ziel erreicht",
                "named": "Sie haben Ihr {waypoint_name}, es befindet sich rechts"
            },
            "slight left": {
                "default": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich links",
                "upcoming": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich links",
                "short": "Sie haben Ihr {nth} Ziel erreicht",
                "short-upcoming": "Sie haben Ihr {nth} Ziel erreicht",
                "named": "Sie haben Ihr {waypoint_name}, es befindet sich links"
            },
            "straight": {
                "default": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich geradeaus",
                "upcoming": "Sie haben Ihr {nth} Ziel erreicht, es befindet sich geradeaus",
                "short": "Sie haben Ihr {nth} Ziel erreicht",
                "short-upcoming": "Sie haben Ihr {nth} Ziel erreicht",
                "named": "Sie haben Ihr {waypoint_name}, es befindet sich geradeaus"
            }
        },
        "continue": {
            "default": {
                "default": "{modifier} abbiegen",
                "name": "{modifier} weiterfahren auf {way_name}",
                "destination": "{modifier} abbiegen Richtung {destination}",
                "exit": "{modifier} abbiegen auf {way_name}"
            },
            "straight": {
                "default": "Geradeaus weiterfahren",
                "name": "Geradeaus weiterfahren auf {way_name}",
                "destination": "Weiterfahren in Richtung {destination}",
                "distance": "Geradeaus weiterfahren für {distance}",
                "namedistance": "Geradeaus weiterfahren auf {way_name} für {distance}"
            },
            "sharp left": {
                "default": "Scharf links",
                "name": "Scharf links weiterfahren auf {way_name}",
                "destination": "Scharf links Richtung {destination}"
            },
            "sharp right": {
                "default": "Scharf rechts",
                "name": "Scharf rechts weiterfahren auf {way_name}",
                "destination": "Scharf rechts Richtung {destination}"
            },
            "slight left": {
                "default": "Leicht links",
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
                "name": "Fahren Sie Richtung {direction} auf {way_name}",
                "namedistance": "Fahren Sie Richtung {direction} auf {way_name} für {distance}"
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
                "name": "Scharf links auf {way_name}",
                "destination": "Scharf links Richtung {destination}"
            },
            "sharp right": {
                "default": "Scharf rechts abbiegen an der Gabelung",
                "name": "Scharf rechts auf {way_name}",
                "destination": "Scharf rechts Richtung {destination}"
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
            "straight": {
                "default": "geradeaus auffahren",
                "name": "geradeaus auffahren auf {way_name}",
                "destination": "geradeaus auffahren Richtung {destination}"
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
        "exit roundabout": {
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
        "exit rotary": {
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

},{}],23:[function(require,module,exports){
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
        "phrase": {
            "two linked by distance": "{instruction_one}, then, in {distance}, {instruction_two}",
            "two linked": "{instruction_one}, then {instruction_two}",
            "one in distance": "In {distance}, {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "exit {exit}"
        },
        "arrive": {
            "default": {
                "default": "You have arrived at your {nth} destination",
                "upcoming": "You will arrive at your {nth} destination",
                "short": "You have arrived",
                "short-upcoming": "You will arrive",
                "named": "You have arrived at {waypoint_name}"
            },
            "left": {
                "default": "You have arrived at your {nth} destination, on the left",
                "upcoming": "You will arrive at your {nth} destination, on the left",
                "short": "You have arrived",
                "short-upcoming": "You will arrive",
                "named": "You have arrived at {waypoint_name}, on the left"
            },
            "right": {
                "default": "You have arrived at your {nth} destination, on the right",
                "upcoming": "You will arrive at your {nth} destination, on the right",
                "short": "You have arrived",
                "short-upcoming": "You will arrive",
                "named": "You have arrived at {waypoint_name}, on the right"
            },
            "sharp left": {
                "default": "You have arrived at your {nth} destination, on the left",
                "upcoming": "You will arrive at your {nth} destination, on the left",
                "short": "You have arrived",
                "short-upcoming": "You will arrive",
                "named": "You have arrived at {waypoint_name}, on the left"
            },
            "sharp right": {
                "default": "You have arrived at your {nth} destination, on the right",
                "upcoming": "You will arrive at your {nth} destination, on the right",
                "short": "You have arrived",
                "short-upcoming": "You will arrive",
                "named": "You have arrived at {waypoint_name}, on the right"
            },
            "slight right": {
                "default": "You have arrived at your {nth} destination, on the right",
                "upcoming": "You will arrive at your {nth} destination, on the right",
                "short": "You have arrived",
                "short-upcoming": "You will arrive",
                "named": "You have arrived at {waypoint_name}, on the right"
            },
            "slight left": {
                "default": "You have arrived at your {nth} destination, on the left",
                "upcoming": "You will arrive at your {nth} destination, on the left",
                "short": "You have arrived",
                "short-upcoming": "You will arrive",
                "named": "You have arrived at {waypoint_name}, on the left"
            },
            "straight": {
                "default": "You have arrived at your {nth} destination, straight ahead",
                "upcoming": "You will arrive at your {nth} destination, straight ahead",
                "short": "You have arrived",
                "short-upcoming": "You will arrive",
                "named": "You have arrived at {waypoint_name}, straight ahead"
            }
        },
        "continue": {
            "default": {
                "default": "Turn {modifier}",
                "name": "Turn {modifier} to stay on {way_name}",
                "destination": "Turn {modifier} towards {destination}",
                "exit": "Turn {modifier} onto {way_name}"
            },
            "straight": {
                "default": "Continue straight",
                "name": "Continue straight to stay on {way_name}",
                "destination": "Continue towards {destination}",
                "distance": "Continue straight for {distance}",
                "namedistance": "Continue on {way_name} for {distance}"
            },
            "sharp left": {
                "default": "Make a sharp left",
                "name": "Make a sharp left to stay on {way_name}",
                "destination": "Make a sharp left towards {destination}"
            },
            "sharp right": {
                "default": "Make a sharp right",
                "name": "Make a sharp right to stay on {way_name}",
                "destination": "Make a sharp right towards {destination}"
            },
            "slight left": {
                "default": "Make a slight left",
                "name": "Make a slight left to stay on {way_name}",
                "destination": "Make a slight left towards {destination}"
            },
            "slight right": {
                "default": "Make a slight right",
                "name": "Make a slight right to stay on {way_name}",
                "destination": "Make a slight right towards {destination}"
            },
            "uturn": {
                "default": "Make a U-turn",
                "name": "Make a U-turn and continue on {way_name}",
                "destination": "Make a U-turn towards {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Head {direction}",
                "name": "Head {direction} on {way_name}",
                "namedistance": "Head {direction} on {way_name} for {distance}"
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
                "name": "Keep {modifier} onto {way_name}",
                "destination": "Keep {modifier} towards {destination}"
            },
            "slight left": {
                "default": "Keep left at the fork",
                "name": "Keep left onto {way_name}",
                "destination": "Keep left towards {destination}"
            },
            "slight right": {
                "default": "Keep right at the fork",
                "name": "Keep right onto {way_name}",
                "destination": "Keep right towards {destination}"
            },
            "sharp left": {
                "default": "Take a sharp left at the fork",
                "name": "Take a sharp left onto {way_name}",
                "destination": "Take a sharp left towards {destination}"
            },
            "sharp right": {
                "default": "Take a sharp right at the fork",
                "name": "Take a sharp right onto {way_name}",
                "destination": "Take a sharp right towards {destination}"
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
            "straight": {
                "default": "Merge",
                "name": "Merge onto {way_name}",
                "destination": "Merge towards {destination}"
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
                    "default": "Enter the traffic circle",
                    "name": "Enter the traffic circle and exit onto {way_name}",
                    "destination": "Enter the traffic circle and exit towards {destination}"
                },
                "name": {
                    "default": "Enter {rotary_name}",
                    "name": "Enter {rotary_name} and exit onto {way_name}",
                    "destination": "Enter {rotary_name} and exit towards {destination}"
                },
                "exit": {
                    "default": "Enter the traffic circle and take the {exit_number} exit",
                    "name": "Enter the traffic circle and take the {exit_number} exit onto {way_name}",
                    "destination": "Enter the traffic circle and take the {exit_number} exit towards {destination}"
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
                    "default": "Enter the traffic circle and take the {exit_number} exit",
                    "name": "Enter the traffic circle and take the {exit_number} exit onto {way_name}",
                    "destination": "Enter the traffic circle and take the {exit_number} exit towards {destination}"
                },
                "default": {
                    "default": "Enter the traffic circle",
                    "name": "Enter the traffic circle and exit onto {way_name}",
                    "destination": "Enter the traffic circle and exit towards {destination}"
                }
            }
        },
        "roundabout turn": {
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
                "default": "Continue straight",
                "name": "Continue straight onto {way_name}",
                "destination": "Continue straight towards {destination}"
            }
        },
        "exit roundabout": {
            "default": {
                "default": "Exit the traffic circle",
                "name": "Exit the traffic circle onto {way_name}",
                "destination": "Exit the traffic circle towards {destination}"
            }
        },
        "exit rotary": {
            "default": {
                "default": "Exit the traffic circle",
                "name": "Exit the traffic circle onto {way_name}",
                "destination": "Exit the traffic circle towards {destination}"
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

},{}],24:[function(require,module,exports){
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
                "north": "norden",
                "northeast": "nord-orienten",
                "east": "orienten",
                "southeast": "sud-orienten",
                "south": "suden",
                "southwest": "sud-okcidenten",
                "west": "okcidenten",
                "northwest": "nord-okcidenten"
            },
            "modifier": {
                "left": "maldekstren",
                "right": "dekstren",
                "sharp left": "maldekstregen",
                "sharp right": "dekstregen",
                "slight left": "maldekstreten",
                "slight right": "dekstreten",
                "straight": "rekten",
                "uturn": "turniĝu malantaŭen"
            },
            "lanes": {
                "xo": "Veturu dekstre",
                "ox": "Veturu maldekstre",
                "xox": "Veturu meze",
                "oxo": "Veturu dekstre aŭ maldekstre"
            }
        },
        "modes": {
            "ferry": {
                "default": "Enpramiĝu",
                "name": "Enpramiĝu {way_name}",
                "destination": "Enpramiĝu direkte al {destination}"
            }
        },
        "phrase": {
            "two linked by distance": "{instruction_one} kaj post {distance} {instruction_two}",
            "two linked": "{instruction_one} kaj sekve {instruction_two}",
            "one in distance": "Post {distance}, {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "elveturejo {exit}"
        },
        "arrive": {
            "default": {
                "default": "Vi atingis vian {nth} celon",
                "upcoming": "Vi atingos vian {nth} celon",
                "short": "Vi atingis",
                "short-upcoming": "Vi atingos",
                "named": "Vi atingis {waypoint_name}"
            },
            "left": {
                "default": "Vi atingis vian {nth} celon ĉe maldekstre",
                "upcoming": "Vi atingos vian {nth} celon ĉe maldekstre",
                "short": "Vi atingis",
                "short-upcoming": "Vi atingos",
                "named": "Vi atingis {waypoint_name}, ĉe maldekstre"
            },
            "right": {
                "default": "Vi atingis vian {nth} celon ĉe dekstre",
                "upcoming": "Vi atingos vian {nth} celon ĉe dekstre",
                "short": "Vi atingis",
                "short-upcoming": "Vi atingos",
                "named": "Vi atingis {waypoint_name}, ĉe dekstre"
            },
            "sharp left": {
                "default": "Vi atingis vian {nth} celon ĉe maldekstre",
                "upcoming": "Vi atingos vian {nth} celon ĉe maldekstre",
                "short": "Vi atingis",
                "short-upcoming": "Vi atingos",
                "named": "Vi atingis {waypoint_name}, ĉe maldekstre"
            },
            "sharp right": {
                "default": "Vi atingis vian {nth} celon ĉe dekstre",
                "upcoming": "Vi atingos vian {nth} celon ĉe dekstre",
                "short": "Vi atingis",
                "short-upcoming": "Vi atingos",
                "named": "Vi atingis {waypoint_name}, ĉe dekstre"
            },
            "slight right": {
                "default": "Vi atingis vian {nth} celon ĉe dekstre",
                "upcoming": "Vi atingos vian {nth} celon ĉe dekstre",
                "short": "Vi atingis",
                "short-upcoming": "Vi atingos",
                "named": "Vi atingis {waypoint_name}, ĉe dekstre"
            },
            "slight left": {
                "default": "Vi atingis vian {nth} celon ĉe maldekstre",
                "upcoming": "Vi atingos vian {nth} celon ĉe maldekstre",
                "short": "Vi atingis",
                "short-upcoming": "Vi atingos",
                "named": "Vi atingis {waypoint_name}, ĉe maldekstre"
            },
            "straight": {
                "default": "Vi atingis vian {nth} celon",
                "upcoming": "Vi atingos vian {nth} celon rekte",
                "short": "Vi atingis",
                "short-upcoming": "Vi atingos",
                "named": "Vi atingis {waypoint_name} antaŭe"
            }
        },
        "continue": {
            "default": {
                "default": "Veturu {modifier}",
                "name": "Veturu {modifier} al {way_name}",
                "destination": "Veturu {modifier} direkte al {destination}",
                "exit": "Veturu {modifier} direkte al {way_name}"
            },
            "straight": {
                "default": "Veturu rekten",
                "name": "Veturu rekten al {way_name}",
                "destination": "Veturu rekten direkte al {destination}",
                "distance": "Veturu rekten dum {distance}",
                "namedistance": "Veturu rekten al {way_name} dum {distance}"
            },
            "sharp left": {
                "default": "Turniĝu ege maldekstren",
                "name": "Turniĝu ege maldekstren al {way_name}",
                "destination": "Turniĝu ege maldekstren direkte al {destination}"
            },
            "sharp right": {
                "default": "Turniĝu ege dekstren",
                "name": "Turniĝu ege dekstren al {way_name}",
                "destination": "Turniĝu ege dekstren direkte al {destination}"
            },
            "slight left": {
                "default": "Turniĝu ete maldekstren",
                "name": "Turniĝu ete maldekstren al {way_name}",
                "destination": "Turniĝu ete maldekstren direkte al {destination}"
            },
            "slight right": {
                "default": "Turniĝu ete dekstren",
                "name": "Turniĝu ete dekstren al {way_name}",
                "destination": "Turniĝu ete dekstren direkte al {destination}"
            },
            "uturn": {
                "default": "Turniĝu malantaŭen",
                "name": "Turniĝu malantaŭen al {way_name}",
                "destination": "Turniĝu malantaŭen direkte al {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Direktiĝu {direction}",
                "name": "Direktiĝu {direction} al {way_name}",
                "namedistance": "Direktiĝu {direction} al {way_name} tra {distance}"
            }
        },
        "end of road": {
            "default": {
                "default": "Veturu {modifier}",
                "name": "Veturu {modifier} direkte al {way_name}",
                "destination": "Veturu {modifier} direkte al {destination}"
            },
            "straight": {
                "default": "Veturu rekten",
                "name": "Veturu rekten al {way_name}",
                "destination": "Veturu rekten direkte al {destination}"
            },
            "uturn": {
                "default": "Turniĝu malantaŭen ĉe fino de la vojo",
                "name": "Turniĝu malantaŭen al {way_name} ĉe fino de la vojo",
                "destination": "Turniĝu malantaŭen direkte al {destination} ĉe fino de la vojo"
            }
        },
        "fork": {
            "default": {
                "default": "Daŭru {modifier} ĉe la vojforko",
                "name": "Pluu {modifier} al {way_name}",
                "destination": "Pluu {modifier} direkte al {destination}"
            },
            "slight left": {
                "default": "Maldekstren ĉe la vojforko",
                "name": "Pluu maldekstren al {way_name}",
                "destination": "Pluu maldekstren direkte al {destination}"
            },
            "slight right": {
                "default": "Dekstren ĉe la vojforko",
                "name": "Pluu dekstren al {way_name}",
                "destination": "Pluu dekstren direkte al {destination}"
            },
            "sharp left": {
                "default": "Ege maldekstren ĉe la vojforko",
                "name": "Turniĝu ege maldekstren al {way_name}",
                "destination": "Turniĝu ege maldekstren direkte al {destination}"
            },
            "sharp right": {
                "default": "Ege dekstren ĉe la vojforko",
                "name": "Turniĝu ege dekstren al {way_name}",
                "destination": "Turniĝu ege dekstren direkte al {destination}"
            },
            "uturn": {
                "default": "Turniĝu malantaŭen",
                "name": "Turniĝu malantaŭen al {way_name}",
                "destination": "Turniĝu malantaŭen direkte al {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Enveturu {modifier}",
                "name": "Enveturu {modifier} al {way_name}",
                "destination": "Enveturu {modifier} direkte al {destination}"
            },
            "straight": {
                "default": "Enveturu",
                "name": "Enveturu al {way_name}",
                "destination": "Enveturu direkte al {destination}"
            },
            "slight left": {
                "default": "Enveturu de maldekstre",
                "name": "Enveturu de maldekstre al {way_name}",
                "destination": "Enveturu de maldekstre direkte al {destination}"
            },
            "slight right": {
                "default": "Enveturu de dekstre",
                "name": "Enveturu de dekstre al {way_name}",
                "destination": "Enveturu de dekstre direkte al {destination}"
            },
            "sharp left": {
                "default": "Enveturu de maldekstre",
                "name": "Enveture de maldekstre al {way_name}",
                "destination": "Enveturu de maldekstre direkte al {destination}"
            },
            "sharp right": {
                "default": "Enveturu de dekstre",
                "name": "Enveturu de dekstre al {way_name}",
                "destination": "Enveturu de dekstre direkte al {destination}"
            },
            "uturn": {
                "default": "Turniĝu malantaŭen",
                "name": "Turniĝu malantaŭen al {way_name}",
                "destination": "Turniĝu malantaŭen direkte al {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Pluu {modifier}",
                "name": "Pluu {modifier} al {way_name}",
                "destination": "Pluu {modifier} direkte al {destination}"
            },
            "straight": {
                "default": "Veturu rekten",
                "name": "Veturu rekten al {way_name}",
                "destination": "Veturu rekten direkte al {destination}"
            },
            "sharp left": {
                "default": "Turniĝu ege maldekstren",
                "name": "Turniĝu ege maldekstren al {way_name}",
                "destination": "Turniĝu ege maldekstren direkte al {destination}"
            },
            "sharp right": {
                "default": "Turniĝu ege dekstren",
                "name": "Turniĝu ege dekstren al {way_name}",
                "destination": "Turniĝu ege dekstren direkte al {destination}"
            },
            "slight left": {
                "default": "Pluu ete maldekstren",
                "name": "Pluu ete maldekstren al {way_name}",
                "destination": "Pluu ete maldekstren direkte al {destination}"
            },
            "slight right": {
                "default": "Pluu ete dekstren",
                "name": "Pluu ete dekstren al {way_name}",
                "destination": "Pluu ete dekstren direkte al {destination}"
            },
            "uturn": {
                "default": "Turniĝu malantaŭen",
                "name": "Turniĝu malantaŭen al {way_name}",
                "destination": "Turniĝu malantaŭen direkte al {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Pluu {modifier}",
                "name": "Pluu {modifier} al {way_name}",
                "destination": "Pluu {modifier} direkte al {destination}"
            },
            "uturn": {
                "default": "Turniĝu malantaŭen",
                "name": "Turniĝu malantaŭen al {way_name}",
                "destination": "Turniĝu malantaŭen direkte al {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Direktiĝu al enveturejo",
                "name": "Direktiĝu al enveturejo al {way_name}",
                "destination": "Direktiĝu al enveturejo direkte al {destination}",
                "exit": "Direktiĝu al elveturejo {exit}",
                "exit_destination": "Direktiĝu al elveturejo {exit} direkte al {destination}"
            },
            "left": {
                "default": "Direktiĝu al enveturejo ĉe maldekstre",
                "name": "Direktiĝu al enveturejo ĉe maldekstre al {way_name}",
                "destination": "Direktiĝu al enveturejo ĉe maldekstre al {destination}",
                "exit": "Direktiĝu al elveturejo {exit} ĉe maldekstre",
                "exit_destination": "Direktiĝu al elveturejo {exit} ĉe maldekstre direkte al {destination}"
            },
            "right": {
                "default": "Direktiĝu al enveturejo ĉe dekstre",
                "name": "Direktiĝu al enveturejo ĉe dekstre al {way_name}",
                "destination": "Direktiĝu al enveturejo ĉe dekstre al {destination}",
                "exit": "Direktiĝu al {exit} elveturejo ĉe ldekstre",
                "exit_destination": "Direktiĝu al elveturejo {exit} ĉe dekstre direkte al {destination}"
            },
            "sharp left": {
                "default": "Direktiĝu al enveturejo ĉe maldekstre",
                "name": "Direktiĝu al enveturejo ĉe maldekstre al {way_name}",
                "destination": "Direktiĝu al enveturejo ĉe maldekstre al {destination}",
                "exit": "Direktiĝu al {exit} elveturejo ĉe maldekstre",
                "exit_destination": "Direktiĝu al elveturejo {exit} ĉe maldekstre direkte al {destination}"
            },
            "sharp right": {
                "default": "Direktiĝu al enveturejo ĉe dekstre",
                "name": "Direktiĝu al enveturejo ĉe dekstre al {way_name}",
                "destination": "Direktiĝu al enveturejo ĉe dekstre al {destination}",
                "exit": "Direktiĝu al elveturejo {exit} ĉe dekstre",
                "exit_destination": "Direktiĝu al elveturejo {exit} ĉe dekstre direkte al {destination}"
            },
            "slight left": {
                "default": "Direktiĝu al enveturejo ĉe maldekstre",
                "name": "Direktiĝu al enveturejo ĉe maldekstre al {way_name}",
                "destination": "Direktiĝu al enveturejo ĉe maldekstre al {destination}",
                "exit": "Direktiĝu al {exit} elveturejo ĉe maldekstre",
                "exit_destination": "Direktiĝu al elveturejo {exit} ĉe maldekstre direkte al {destination}"
            },
            "slight right": {
                "default": "Direktiĝu al enveturejo ĉe dekstre",
                "name": "Direktiĝu al enveturejo ĉe dekstre al {way_name}",
                "destination": "Direktiĝu al enveturejo ĉe dekstre al {destination}",
                "exit": "Direktiĝu al {exit} elveturejo ĉe ldekstre",
                "exit_destination": "Direktiĝu al elveturejo {exit} ĉe dekstre direkte al {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Direktiĝu al enveturejo",
                "name": "Direktiĝu al enveturejo al {way_name}",
                "destination": "Direktiĝu al enveturejo direkte al {destination}"
            },
            "left": {
                "default": "Direktiĝu al enveturejo ĉe maldekstre",
                "name": "Direktiĝu al enveturejo ĉe maldekstre al {way_name}",
                "destination": "Direktiĝu al enveturejo ĉe maldekstre al {destination}"
            },
            "right": {
                "default": "Direktiĝu al enveturejo ĉe dekstre",
                "name": "Direktiĝu al enveturejo ĉe dekstre al {way_name}",
                "destination": "Direktiĝu al enveturejo ĉe dekstre al {destination}"
            },
            "sharp left": {
                "default": "Direktiĝu al enveturejo ĉe maldekstre",
                "name": "Direktiĝu al enveturejo ĉe maldekstre al {way_name}",
                "destination": "Direktiĝu al enveturejo ĉe maldekstre al {destination}"
            },
            "sharp right": {
                "default": "Direktiĝu al enveturejo ĉe dekstre",
                "name": "Direktiĝu al enveturejo ĉe dekstre al {way_name}",
                "destination": "Direktiĝu al enveturejo ĉe dekstre al {destination}"
            },
            "slight left": {
                "default": "Direktiĝu al enveturejo ĉe maldekstre",
                "name": "Direktiĝu al enveturejo ĉe maldekstre al {way_name}",
                "destination": "Direktiĝu al enveturejo ĉe maldekstre al {destination}"
            },
            "slight right": {
                "default": "Direktiĝu al enveturejo ĉe dekstre",
                "name": "Direktiĝu al enveturejo ĉe dekstre al {way_name}",
                "destination": "Direktiĝu al enveturejo ĉe dekstre al {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Enveturu trafikcirklegon",
                    "name": "Enveturu trafikcirklegon kaj elveturu al {way_name}",
                    "destination": "Enveturu trafikcirklegon kaj elveturu direkte al {destination}"
                },
                "name": {
                    "default": "Enveturu {rotary_name}",
                    "name": "Enveturu {rotary_name} kaj elveturu al {way_name}",
                    "destination": "Enveturu {rotary_name} kaj elveturu direkte al {destination}"
                },
                "exit": {
                    "default": "Enveturu trafikcirklegon kaj sekve al {exit_number} elveturejo",
                    "name": "Enveturu trafikcirklegon kaj sekve al {exit_number} elveturejo al {way_name}",
                    "destination": "Enveturu trafikcirklegon kaj sekve al {exit_number} elveturejo direkte al {destination}"
                },
                "name_exit": {
                    "default": "Enveturu {rotary_name} kaj sekve al {exit_number} elveturejo",
                    "name": "Enveturu {rotary_name} kaj sekve al {exit_number} elveturejo al {way_name}",
                    "destination": "Enveturu {rotary_name} kaj sekve al {exit_number} elveturejo direkte al {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "Enveturu trafikcirklegon kaj sekve al {exit_number} elveturejo",
                    "name": "Enveturu trafikcirklegon kaj sekve al {exit_number} elveturejo al {way_name}",
                    "destination": "Enveturu trafikcirklegon kaj sekve al {exit_number} elveturejo direkte al {destination}"
                },
                "default": {
                    "default": "Enveturu trafikcirklegon",
                    "name": "Enveturu trafikcirklegon kaj elveturu al {way_name}",
                    "destination": "Enveturu trafikcirklegon kaj elveturu direkte al {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "Veturu {modifier}",
                "name": "Veturu {modifier} al {way_name}",
                "destination": "Veturu {modifier} direkte al {destination}"
            },
            "left": {
                "default": "Turniĝu maldekstren",
                "name": "Turniĝu maldekstren al {way_name}",
                "destination": "Turniĝu maldekstren direkte al {destination}"
            },
            "right": {
                "default": "Turniĝu dekstren",
                "name": "Turniĝu dekstren al {way_name}",
                "destination": "Turniĝu dekstren direkte al {destination}"
            },
            "straight": {
                "default": "Pluu rekten",
                "name": "Veturu rekten al {way_name}",
                "destination": "Veturu rekten direkte al {destination}"
            }
        },
        "exit roundabout": {
            "default": {
                "default": "Elveturu trafikcirklegon",
                "name": "Elveturu trafikcirklegon al {way_name}",
                "destination": "Elveturu trafikcirklegon direkte al {destination}"
            }
        },
        "exit rotary": {
            "default": {
                "default": "Eliru trafikcirklegon",
                "name": "Elveturu trafikcirklegon al {way_name}",
                "destination": "Elveturu trafikcirklegon direkte al {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Veturu {modifier}",
                "name": "Veturu {modifier} al {way_name}",
                "destination": "Veturu {modifier} direkte al {destination}"
            },
            "left": {
                "default": "Turniĝu maldekstren",
                "name": "Turniĝu maldekstren al {way_name}",
                "destination": "Turniĝu maldekstren direkte al {destination}"
            },
            "right": {
                "default": "Turniĝu dekstren",
                "name": "Turniĝu dekstren al {way_name}",
                "destination": "Turniĝu dekstren direkte al {destination}"
            },
            "straight": {
                "default": "Veturu rekten",
                "name": "Veturu rekten al {way_name}",
                "destination": "Veturu rekten direkte al {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Pluu rekten"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}

},{}],25:[function(require,module,exports){
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
                "left": "a la izquierda",
                "right": "a la derecha",
                "sharp left": "cerrada a la izquierda",
                "sharp right": "cerrada a la derecha",
                "slight left": "ligeramente a la izquierda",
                "slight right": "ligeramente a la derecha",
                "straight": "recto",
                "uturn": "cambio de sentido"
            },
            "lanes": {
                "xo": "Mantente a la derecha",
                "ox": "Mantente a la izquierda",
                "xox": "Mantente en el medio",
                "oxo": "Mantente a la izquierda o a la derecha"
            }
        },
        "modes": {
            "ferry": {
                "default": "Coge el ferry",
                "name": "Coge el ferry {way_name}",
                "destination": "Coge el ferry hacia {destination}"
            }
        },
        "phrase": {
            "two linked by distance": "{instruction_one} y luego en {distance}, {instruction_two}",
            "two linked": "{instruction_one} y luego {instruction_two}",
            "one in distance": "A {distance}, {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "salida {exit}"
        },
        "arrive": {
            "default": {
                "default": "Has llegado a tu {nth} destino",
                "upcoming": "Vas a llegar a tu {nth} destino",
                "short": "Has llegado",
                "short-upcoming": "Vas a llegar",
                "named": "Has llegado a {waypoint_name}"
            },
            "left": {
                "default": "Has llegado a tu {nth} destino, a la izquierda",
                "upcoming": "Vas a llegar a tu {nth} destino, a la izquierda",
                "short": "Has llegado",
                "short-upcoming": "Vas a llegar",
                "named": "Has llegado a {waypoint_name}, a la izquierda"
            },
            "right": {
                "default": "Has llegado a tu {nth} destino, a la derecha",
                "upcoming": "Vas a llegar a tu {nth} destino, a la derecha",
                "short": "Has llegado",
                "short-upcoming": "Vas a llegar",
                "named": "Has llegado a {waypoint_name}, a la derecha"
            },
            "sharp left": {
                "default": "Has llegado a tu {nth} destino, a la izquierda",
                "upcoming": "Vas a llegar a tu {nth} destino, a la izquierda",
                "short": "Has llegado",
                "short-upcoming": "Vas a llegar",
                "named": "Has llegado a {waypoint_name}, a la izquierda"
            },
            "sharp right": {
                "default": "Has llegado a tu {nth} destino, a la derecha",
                "upcoming": "Vas a llegar a tu {nth} destino, a la derecha",
                "short": "Has llegado",
                "short-upcoming": "Vas a llegar",
                "named": "Has llegado a {waypoint_name}, a la derecha"
            },
            "slight right": {
                "default": "Has llegado a tu {nth} destino, a la derecha",
                "upcoming": "Vas a llegar a tu {nth} destino, a la derecha",
                "short": "Has llegado",
                "short-upcoming": "Vas a llegar",
                "named": "Has llegado a {waypoint_name}, a la derecha"
            },
            "slight left": {
                "default": "Has llegado a tu {nth} destino, a la izquierda",
                "upcoming": "Vas a llegar a tu {nth} destino, a la izquierda",
                "short": "Has llegado",
                "short-upcoming": "Vas a llegar",
                "named": "Has llegado a {waypoint_name}, a la izquierda"
            },
            "straight": {
                "default": "Has llegado a tu {nth} destino, en frente",
                "upcoming": "Vas a llegar a tu {nth} destino, en frente",
                "short": "Has llegado",
                "short-upcoming": "Vas a llegar",
                "named": "Has llegado a {waypoint_name}, en frente"
            }
        },
        "continue": {
            "default": {
                "default": "Gire {modifier}",
                "name": "Cruce {modifier} en {way_name}",
                "destination": "Gire {modifier} hacia {destination}",
                "exit": "Gire {modifier} en {way_name}"
            },
            "straight": {
                "default": "Continúa recto",
                "name": "Continúa en {way_name}",
                "destination": "Continúa hacia {destination}",
                "distance": "Continúa recto por {distance}",
                "namedistance": "Continúa recto en {way_name} por {distance}"
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
                "default": "Gire a la izquierda",
                "name": "Doble levemente a la izquierda en {way_name}",
                "destination": "Gire a la izquierda hacia {destination}"
            },
            "slight right": {
                "default": "Gire a la izquierda",
                "name": "Doble levemente a la derecha en {way_name}",
                "destination": "Gire a la izquierda hacia {destination}"
            },
            "uturn": {
                "default": "Haz un cambio de sentido",
                "name": "Haz un cambio de sentido y continúa en {way_name}",
                "destination": "Haz un cambio de sentido hacia {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Dirígete al {direction}",
                "name": "Dirígete al {direction} por {way_name}",
                "namedistance": "Dirígete al {direction} en {way_name} por {distance}"
            }
        },
        "end of road": {
            "default": {
                "default": "Al final de la calle gira {modifier}",
                "name": "Al final de la calle gira {modifier} por {way_name}",
                "destination": "Al final de la calle gira {modifier} hacia {destination}"
            },
            "straight": {
                "default": "Al final de la calle continúa recto",
                "name": "Al final de la calle continúa recto por {way_name}",
                "destination": "Al final de la calle continúa recto hacia {destination}"
            },
            "uturn": {
                "default": "Al final de la calle haz un cambio de sentido",
                "name": "Al final de la calle haz un cambio de sentido en {way_name}",
                "destination": "Al final de la calle haz un cambio de sentido hacia {destination}"
            }
        },
        "fork": {
            "default": {
                "default": "Mantente {modifier} en el cruce",
                "name": "Mantente {modifier} por {way_name}",
                "destination": "Mantente {modifier} hacia {destination}"
            },
            "slight left": {
                "default": "Mantente a la izquierda en el cruce",
                "name": "Mantente a la izquierda por {way_name}",
                "destination": "Mantente a la izquierda hacia {destination}"
            },
            "slight right": {
                "default": "Mantente a la derecha en el cruce",
                "name": "Mantente a la derecha por {way_name}",
                "destination": "Mantente a la derecha hacia {destination}"
            },
            "sharp left": {
                "default": "Gira la izquierda en el cruce",
                "name": "Gira a la izquierda por {way_name}",
                "destination": "Gira a la izquierda hacia {destination}"
            },
            "sharp right": {
                "default": "Gira a la derecha en el cruce",
                "name": "Gira a la derecha por {way_name}",
                "destination": "Gira a la derecha hacia {destination}"
            },
            "uturn": {
                "default": "Haz un cambio de sentido",
                "name": "Haz un cambio de sentido en {way_name}",
                "destination": "Haz un cambio de sentido hacia {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Incorpórate {modifier}",
                "name": "Incorpórate {modifier} por {way_name}",
                "destination": "Incorpórate {modifier} hacia {destination}"
            },
            "straight": {
                "default": "Incorpórate",
                "name": "Incorpórate por {way_name}",
                "destination": "Incorpórate hacia {destination}"
            },
            "slight left": {
                "default": "Incorpórate a la izquierda",
                "name": "Incorpórate a la izquierda por {way_name}",
                "destination": "Incorpórate a la izquierda hacia {destination}"
            },
            "slight right": {
                "default": "Incorpórate a la derecha",
                "name": "Incorpórate a la derecha por {way_name}",
                "destination": "Incorpórate a la derecha hacia {destination}"
            },
            "sharp left": {
                "default": "Incorpórate a la izquierda",
                "name": "Incorpórate a la izquierda por {way_name}",
                "destination": "Incorpórate a la izquierda hacia {destination}"
            },
            "sharp right": {
                "default": "Incorpórate a la derecha",
                "name": "Incorpórate a la derecha por {way_name}",
                "destination": "Incorpórate a la derecha hacia {destination}"
            },
            "uturn": {
                "default": "Haz un cambio de sentido",
                "name": "Haz un cambio de sentido en {way_name}",
                "destination": "Haz un cambio de sentido hacia {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Continúa {modifier}",
                "name": "Continúa {modifier} por {way_name}",
                "destination": "Continúa {modifier} hacia {destination}"
            },
            "straight": {
                "default": "Continúa recto",
                "name": "Continúa por {way_name}",
                "destination": "Continúa hacia {destination}"
            },
            "sharp left": {
                "default": "Gira a la izquierda",
                "name": "Gira a la izquierda por {way_name}",
                "destination": "Gira a la izquierda hacia {destination}"
            },
            "sharp right": {
                "default": "Gira a la derecha",
                "name": "Gira a la derecha por {way_name}",
                "destination": "Gira a la derecha hacia {destination}"
            },
            "slight left": {
                "default": "Continúa ligeramente por la izquierda",
                "name": "Continúa ligeramente por la izquierda por {way_name}",
                "destination": "Continúa ligeramente por la izquierda hacia {destination}"
            },
            "slight right": {
                "default": "Continúa ligeramente por la derecha",
                "name": "Continúa ligeramente por la derecha por {way_name}",
                "destination": "Continúa ligeramente por la derecha hacia {destination}"
            },
            "uturn": {
                "default": "Haz un cambio de sentido",
                "name": "Haz un cambio de sentido en {way_name}",
                "destination": "Haz un cambio de sentido hacia {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Continúa {modifier}",
                "name": "Continúa {modifier} por {way_name}",
                "destination": "Continúa {modifier} hacia {destination}"
            },
            "uturn": {
                "default": "Haz un cambio de sentido",
                "name": "Haz un cambio de sentido en {way_name}",
                "destination": "Haz un cambio de sentido hacia {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Coge la cuesta abajo",
                "name": "Coge la cuesta abajo por {way_name}",
                "destination": "Coge la cuesta abajo hacia {destination}",
                "exit": "Coge la cuesta abajo {exit}",
                "exit_destination": "Coge la cuesta abajo {exit} hacia {destination}"
            },
            "left": {
                "default": "Coge la cuesta abajo de la izquierda",
                "name": "Coge la cuesta abajo de la izquierda por {way_name}",
                "destination": "Coge la cuesta abajo de la izquierda hacia {destination}",
                "exit": "Coge la cuesta abajo {exit} a tu izquierda",
                "exit_destination": "Coge la cuesta abajo {exit} a tu izquierda hacia {destination}"
            },
            "right": {
                "default": "Coge la cuesta abajo de la derecha",
                "name": "Coge la cuesta abajo de la derecha por {way_name}",
                "destination": "Coge la cuesta abajo de la derecha hacia {destination}",
                "exit": "Coge la cuesta abajo {exit}",
                "exit_destination": "Coge la cuesta abajo {exit} hacia {destination}"
            },
            "sharp left": {
                "default": "Coge la cuesta abajo de la izquierda",
                "name": "Coge la cuesta abajo de la izquierda por {way_name}",
                "destination": "Coge la cuesta abajo de la izquierda hacia {destination}",
                "exit": "Coge la cuesta abajo {exit} a tu izquierda",
                "exit_destination": "Coge la cuesta abajo {exit} a tu izquierda hacia {destination}"
            },
            "sharp right": {
                "default": "Coge la cuesta abajo de la derecha",
                "name": "Coge la cuesta abajo de la derecha por {way_name}",
                "destination": "Coge la cuesta abajo de la derecha hacia {destination}",
                "exit": "Coge la cuesta abajo {exit}",
                "exit_destination": "Coge la cuesta abajo {exit} hacia {destination}"
            },
            "slight left": {
                "default": "Coge la cuesta abajo de la izquierda",
                "name": "Coge la cuesta abajo de la izquierda por {way_name}",
                "destination": "Coge la cuesta abajo de la izquierda hacia {destination}",
                "exit": "Coge la cuesta abajo {exit} a tu izquierda",
                "exit_destination": "Coge la cuesta abajo {exit} a tu izquierda hacia {destination}"
            },
            "slight right": {
                "default": "Coge la cuesta abajo de la derecha",
                "name": "Coge la cuesta abajo de la derecha por {way_name}",
                "destination": "Coge la cuesta abajo de la derecha hacia {destination}",
                "exit": "Coge la cuesta abajo {exit}",
                "exit_destination": "Coge la cuesta abajo {exit} hacia {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Coge la cuesta",
                "name": "Coge la cuesta por {way_name}",
                "destination": "Coge la cuesta hacia {destination}"
            },
            "left": {
                "default": "Coge la cuesta de la izquierda",
                "name": "Coge la cuesta de la izquierda por {way_name}",
                "destination": "Coge la cuesta de la izquierda hacia {destination}"
            },
            "right": {
                "default": "Coge la cuesta de la derecha",
                "name": "Coge la cuesta de la derecha por {way_name}",
                "destination": "Coge la cuesta de la derecha hacia {destination}"
            },
            "sharp left": {
                "default": "Coge la cuesta de la izquierda",
                "name": "Coge la cuesta de la izquierda por {way_name}",
                "destination": "Coge la cuesta de la izquierda hacia {destination}"
            },
            "sharp right": {
                "default": "Coge la cuesta de la derecha",
                "name": "Coge la cuesta de la derecha por {way_name}",
                "destination": "Coge la cuesta de la derecha hacia {destination}"
            },
            "slight left": {
                "default": "Coge la cuesta de la izquierda",
                "name": "Coge la cuesta de la izquierda por {way_name}",
                "destination": "Coge la cuesta de la izquierda hacia {destination}"
            },
            "slight right": {
                "default": "Coge la cuesta de la derecha",
                "name": "Coge la cuesta de la derecha por {way_name}",
                "destination": "Coge la cuesta de la derecha hacia {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Incorpórate en la rotonda",
                    "name": "En la rotonda sal por {way_name}",
                    "destination": "En la rotonda sal hacia {destination}"
                },
                "name": {
                    "default": "En {rotary_name}",
                    "name": "En {rotary_name} sal por {way_name}",
                    "destination": "En {rotary_name} sal hacia {destination}"
                },
                "exit": {
                    "default": "En la rotonda toma la {exit_number} salida",
                    "name": "En la rotonda toma la {exit_number} salida por {way_name}",
                    "destination": "En la rotonda toma la {exit_number} salida hacia {destination}"
                },
                "name_exit": {
                    "default": "En {rotary_name} toma la {exit_number} salida",
                    "name": "En {rotary_name} toma la {exit_number} salida por {way_name}",
                    "destination": "En {rotary_name} toma la {exit_number} salida hacia {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "En la rotonda toma la {exit_number} salida",
                    "name": "En la rotonda toma la {exit_number} salida por {way_name}",
                    "destination": "En la rotonda toma la {exit_number} salida hacia {destination}"
                },
                "default": {
                    "default": "Incorpórate en la rotonda",
                    "name": "Incorpórate en la rotonda y sal en {way_name}",
                    "destination": "Incorpórate en la rotonda y sal hacia {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "Siga {modifier}",
                "name": "Siga {modifier} en {way_name}",
                "destination": "Siga {modifier} hacia {destination}"
            },
            "left": {
                "default": "Gire a la izquierda",
                "name": "Gire a la izquierda en {way_name}",
                "destination": "Gire a la izquierda hacia {destination}"
            },
            "right": {
                "default": "Gire a la derecha",
                "name": "Gire a la derecha en {way_name}",
                "destination": "Gire a la derecha hacia {destination}"
            },
            "straight": {
                "default": "Continúa recto",
                "name": "Continúa recto por {way_name}",
                "destination": "Continúa recto hacia {destination}"
            }
        },
        "exit roundabout": {
            "default": {
                "default": "Sal la rotonda",
                "name": "Toma la salida por {way_name}",
                "destination": "Toma la salida hacia {destination}"
            }
        },
        "exit rotary": {
            "default": {
                "default": "Sal la rotonda",
                "name": "Toma la salida por {way_name}",
                "destination": "Toma la salida hacia {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Gira {modifier}",
                "name": "Gira {modifier} por {way_name}",
                "destination": "Gira {modifier} hacia {destination}"
            },
            "left": {
                "default": "Gira a la izquierda",
                "name": "Gira a la izquierda por {way_name}",
                "destination": "Gira a la izquierda hacia {destination}"
            },
            "right": {
                "default": "Gira a la derecha",
                "name": "Gira a la derecha por {way_name}",
                "destination": "Gira a la derecha hacia {destination}"
            },
            "straight": {
                "default": "Continúa recto",
                "name": "Continúa recto por {way_name}",
                "destination": "Continúa recto hacia {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Continúa recto"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}

},{}],26:[function(require,module,exports){
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
                "slight left": "levemente a la izquierda",
                "slight right": "levemente a la derecha",
                "straight": "recto",
                "uturn": "cambio de sentido"
            },
            "lanes": {
                "xo": "Mantente a la derecha",
                "ox": "Mantente a la izquierda",
                "xox": "Mantente en el medio",
                "oxo": "Mantente a la izquierda o derecha"
            }
        },
        "modes": {
            "ferry": {
                "default": "Coge el ferry",
                "name": "Coge el ferry {way_name}",
                "destination": "Coge el ferry a {destination}"
            }
        },
        "phrase": {
            "two linked by distance": "{instruction_one} y luego a {distance}, {instruction_two}",
            "two linked": "{instruction_one} y luego {instruction_two}",
            "one in distance": "A {distance}, {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "salida {exit}"
        },
        "arrive": {
            "default": {
                "default": "Has llegado a tu {nth} destino",
                "upcoming": "Vas a llegar a tu {nth} destino",
                "short": "Has llegado",
                "short-upcoming": "Vas a llegar",
                "named": "Has llegado a {waypoint_name}"
            },
            "left": {
                "default": "Has llegado a tu {nth} destino, a la izquierda",
                "upcoming": "Vas a llegar a tu {nth} destino, a la izquierda",
                "short": "Has llegado",
                "short-upcoming": "Vas a llegar",
                "named": "Has llegado a {waypoint_name}, a la izquierda"
            },
            "right": {
                "default": "Has llegado a tu {nth} destino, a la derecha",
                "upcoming": "Vas a llegar a tu {nth} destino, a la derecha",
                "short": "Has llegado",
                "short-upcoming": "Vas a llegar",
                "named": "Has llegado a {waypoint_name}, a la derecha"
            },
            "sharp left": {
                "default": "Has llegado a tu {nth} destino, a la izquierda",
                "upcoming": "Vas a llegar a tu {nth} destino, a la izquierda",
                "short": "Has llegado",
                "short-upcoming": "Vas a llegar",
                "named": "Has llegado a {waypoint_name}, a la izquierda"
            },
            "sharp right": {
                "default": "Has llegado a tu {nth} destino, a la derecha",
                "upcoming": "Vas a llegar a tu {nth} destino, a la derecha",
                "short": "Has llegado",
                "short-upcoming": "Vas a llegar",
                "named": "Has llegado a {waypoint_name}, a la derecha"
            },
            "slight right": {
                "default": "Has llegado a tu {nth} destino, a la derecha",
                "upcoming": "Vas a llegar a tu {nth} destino, a la derecha",
                "short": "Has llegado",
                "short-upcoming": "Vas a llegar",
                "named": "Has llegado a {waypoint_name}, a la derecha"
            },
            "slight left": {
                "default": "Has llegado a tu {nth} destino, a la izquierda",
                "upcoming": "Vas a llegar a tu {nth} destino, a la izquierda",
                "short": "Has llegado",
                "short-upcoming": "Vas a llegar",
                "named": "Has llegado a {waypoint_name}, a la izquierda"
            },
            "straight": {
                "default": "Has llegado a tu {nth} destino, en frente",
                "upcoming": "Vas a llegar a tu {nth} destino, en frente",
                "short": "Has llegado",
                "short-upcoming": "Vas a llegar",
                "named": "Has llegado a {waypoint_name}, en frente"
            }
        },
        "continue": {
            "default": {
                "default": "Gira a {modifier}",
                "name": "Cruza a la{modifier}  en {way_name}",
                "destination": "Gira a {modifier} hacia {destination}",
                "exit": "Gira a {modifier} en {way_name}"
            },
            "straight": {
                "default": "Continúa recto",
                "name": "Continúa en {way_name}",
                "destination": "Continúa hacia {destination}",
                "distance": "Continúa recto por {distance}",
                "namedistance": "Continúa recto en {way_name} por {distance}"
            },
            "sharp left": {
                "default": "Gira a la izquierda",
                "name": "Gira a la izquierda en {way_name}",
                "destination": "Gira a la izquierda hacia {destination}"
            },
            "sharp right": {
                "default": "Gira a la derecha",
                "name": "Gira a la derecha en {way_name}",
                "destination": "Gira a la derecha hacia {destination}"
            },
            "slight left": {
                "default": "Gira a la izquierda",
                "name": "Dobla levemente a la izquierda en {way_name}",
                "destination": "Gira a la izquierda hacia {destination}"
            },
            "slight right": {
                "default": "Gira a la izquierda",
                "name": "Dobla levemente a la derecha en {way_name}",
                "destination": "Gira a la izquierda hacia {destination}"
            },
            "uturn": {
                "default": "Haz un cambio de sentido",
                "name": "Haz un cambio de sentido y continúa en {way_name}",
                "destination": "Haz un cambio de sentido hacia {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Ve a {direction}",
                "name": "Ve a {direction} en {way_name}",
                "namedistance": "Ve a {direction} en {way_name} por {distance}"
            }
        },
        "end of road": {
            "default": {
                "default": "Gira  a {modifier}",
                "name": "Gira a {modifier} en {way_name}",
                "destination": "Gira a {modifier} hacia {destination}"
            },
            "straight": {
                "default": "Continúa recto",
                "name": "Continúa recto en {way_name}",
                "destination": "Continúa recto hacia {destination}"
            },
            "uturn": {
                "default": "Haz un cambio de sentido al final de la via",
                "name": "Haz un cambio de sentido en {way_name} al final de la via",
                "destination": "Haz un cambio de sentido hacia {destination} al final de la via"
            }
        },
        "fork": {
            "default": {
                "default": "Mantente  {modifier} en el cruza",
                "name": "Mantente {modifier} en {way_name}",
                "destination": "Mantente {modifier} hacia {destination}"
            },
            "slight left": {
                "default": "Mantente a la izquierda en el cruza",
                "name": "Mantente a la izquierda en {way_name}",
                "destination": "Mantente a la izquierda hacia {destination}"
            },
            "slight right": {
                "default": "Mantente a la derecha en el cruza",
                "name": "Mantente a la derecha en {way_name}",
                "destination": "Mantente a la derecha hacia {destination}"
            },
            "sharp left": {
                "default": "Gira a la izquierda en el cruza",
                "name": "Gira a la izquierda en {way_name}",
                "destination": "Gira a la izquierda hacia {destination}"
            },
            "sharp right": {
                "default": "Gira a la derecha en el cruza",
                "name": "Gira a la derecha en {way_name}",
                "destination": "Gira a la derecha hacia {destination}"
            },
            "uturn": {
                "default": "Haz un cambio de sentido",
                "name": "Haz un cambio de sentido en {way_name}",
                "destination": "Haz un cambio de sentido hacia {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Incorpórate a {modifier}",
                "name": "Incorpórate a {modifier} en {way_name}",
                "destination": "Incorpórate a {modifier} hacia {destination}"
            },
            "straight": {
                "default": "Incorpórate",
                "name": "Incorpórate a {way_name}",
                "destination": "Incorpórate hacia {destination}"
            },
            "slight left": {
                "default": "Incorpórate a la izquierda",
                "name": "Incorpórate a la izquierda en {way_name}",
                "destination": "Incorpórate a la izquierda hacia {destination}"
            },
            "slight right": {
                "default": "Incorpórate a la derecha",
                "name": "Incorpórate a la derecha en {way_name}",
                "destination": "Incorpórate a la derecha hacia {destination}"
            },
            "sharp left": {
                "default": "Incorpórate a la izquierda",
                "name": "Incorpórate a la izquierda en {way_name}",
                "destination": "Incorpórate a la izquierda hacia {destination}"
            },
            "sharp right": {
                "default": "Incorpórate a la derecha",
                "name": "Incorpórate a la derecha en {way_name}",
                "destination": "Incorpórate a la derecha hacia {destination}"
            },
            "uturn": {
                "default": "Haz un cambio de sentido",
                "name": "Haz un cambio de sentido en {way_name}",
                "destination": "Haz un cambio de sentido hacia {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Continúa {modifier}",
                "name": "Continúa {modifier} en {way_name}",
                "destination": "Continúa {modifier} hacia {destination}"
            },
            "straight": {
                "default": "Continúa recto",
                "name": "Continúa en {way_name}",
                "destination": "Continúa hacia {destination}"
            },
            "sharp left": {
                "default": "Gira a la izquierda",
                "name": "Gira a la izquierda en {way_name}",
                "destination": "Gira a la izquierda hacia {destination}"
            },
            "sharp right": {
                "default": "Gira a la derecha",
                "name": "Gira a la derecha en {way_name}",
                "destination": "Gira a la derecha hacia {destination}"
            },
            "slight left": {
                "default": "Continúa levemente a la izquierda",
                "name": "Continúa levemente a la izquierda en {way_name}",
                "destination": "Continúa levemente a la izquierda hacia {destination}"
            },
            "slight right": {
                "default": "Continúa levemente a la derecha",
                "name": "Continúa levemente a la derecha en {way_name}",
                "destination": "Continúa levemente a la derecha hacia {destination}"
            },
            "uturn": {
                "default": "Haz un cambio de sentido",
                "name": "Haz un cambio de sentido en {way_name}",
                "destination": "Haz un cambio de sentido hacia {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Continúa {modifier}",
                "name": "Continúa {modifier} en {way_name}",
                "destination": "Continúa {modifier} hacia {destination}"
            },
            "uturn": {
                "default": "Haz un cambio de sentido",
                "name": "Haz un cambio de sentido en {way_name}",
                "destination": "Haz un cambio de sentido hacia {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Toma la salida",
                "name": "Toma la salida en {way_name}",
                "destination": "Toma la salida hacia {destination}",
                "exit": "Toma la salida {exit}",
                "exit_destination": "Toma la salida {exit} hacia {destination}"
            },
            "left": {
                "default": "Toma la salida en la izquierda",
                "name": "Toma la salida en la izquierda en {way_name}",
                "destination": "Toma la salida en la izquierda en {destination}",
                "exit": "Toma la salida {exit} en la izquierda",
                "exit_destination": "Toma la salida {exit} en la izquierda hacia {destination}"
            },
            "right": {
                "default": "Toma la salida en la derecha",
                "name": "Toma la salida en la derecha en {way_name}",
                "destination": "Toma la salida en la derecha hacia {destination}",
                "exit": "Toma la salida {exit} en la derecha",
                "exit_destination": "Toma la salida {exit} en la derecha hacia {destination}"
            },
            "sharp left": {
                "default": "Ve cuesta abajo en la izquierda",
                "name": "Ve cuesta abajo en la izquierda en {way_name}",
                "destination": "Ve cuesta abajo en la izquierda hacia {destination}",
                "exit": "Toma la salida {exit} en la izquierda",
                "exit_destination": "Toma la salida {exit} en la izquierda hacia {destination}"
            },
            "sharp right": {
                "default": "Ve cuesta abajo en la derecha",
                "name": "Ve cuesta abajo en la derecha en {way_name}",
                "destination": "Ve cuesta abajo en la derecha hacia {destination}",
                "exit": "Toma la salida {exit} en la derecha",
                "exit_destination": "Toma la salida {exit} en la derecha hacia {destination}"
            },
            "slight left": {
                "default": "Ve cuesta abajo en la izquierda",
                "name": "Ve cuesta abajo en la izquierda en {way_name}",
                "destination": "Ve cuesta abajo en la izquierda hacia {destination}",
                "exit": "Toma la salida {exit} en la izquierda",
                "exit_destination": "Toma la salida {exit} en la izquierda hacia {destination}"
            },
            "slight right": {
                "default": "Toma la salida en la derecha",
                "name": "Toma la salida en la derecha en {way_name}",
                "destination": "Toma la salida en la derecha hacia {destination}",
                "exit": "Toma la salida {exit} en la derecha",
                "exit_destination": "Toma la salida {exit} en la derecha hacia {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Toma la rampa",
                "name": "Toma la rampa en {way_name}",
                "destination": "Toma la rampa hacia {destination}"
            },
            "left": {
                "default": "Toma la rampa en la izquierda",
                "name": "Toma la rampa en la izquierda en {way_name}",
                "destination": "Toma la rampa en la izquierda hacia {destination}"
            },
            "right": {
                "default": "Toma la rampa en la derecha",
                "name": "Toma la rampa en la derecha en {way_name}",
                "destination": "Toma la rampa en la derecha hacia {destination}"
            },
            "sharp left": {
                "default": "Toma la rampa en la izquierda",
                "name": "Toma la rampa en la izquierda en {way_name}",
                "destination": "Toma la rampa en la izquierda hacia {destination}"
            },
            "sharp right": {
                "default": "Toma la rampa en la derecha",
                "name": "Toma la rampa en la derecha en {way_name}",
                "destination": "Toma la rampa en la derecha hacia {destination}"
            },
            "slight left": {
                "default": "Toma la rampa en la izquierda",
                "name": "Toma la rampa en la izquierda en {way_name}",
                "destination": "Toma la rampa en la izquierda hacia {destination}"
            },
            "slight right": {
                "default": "Toma la rampa en la derecha",
                "name": "Toma la rampa en la derecha en {way_name}",
                "destination": "Toma la rampa en la derecha hacia {destination}"
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
                "default": "Sigue {modifier}",
                "name": "Sigue {modifier} en {way_name}",
                "destination": "Sigue {modifier} hacia {destination}"
            },
            "left": {
                "default": "Gira a la izquierda",
                "name": "Gira a la izquierda en {way_name}",
                "destination": "Gira a la izquierda hacia {destination}"
            },
            "right": {
                "default": "Gira a la derecha",
                "name": "Gira a la derecha en {way_name}",
                "destination": "Gira a la derecha hacia {destination}"
            },
            "straight": {
                "default": "Continúa recto",
                "name": "Continúa recto en {way_name}",
                "destination": "Continúa recto hacia {destination}"
            }
        },
        "exit roundabout": {
            "default": {
                "default": "Sal la rotonda",
                "name": "Sal la rotonda en {way_name}",
                "destination": "Sal la rotonda hacia {destination}"
            }
        },
        "exit rotary": {
            "default": {
                "default": "Sal la rotonda",
                "name": "Sal la rotonda en {way_name}",
                "destination": "Sal la rotonda hacia {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Sigue {modifier}",
                "name": "Sigue {modifier} en {way_name}",
                "destination": "Sigue {modifier} hacia {destination}"
            },
            "left": {
                "default": "Gira a la izquierda",
                "name": "Gira a la izquierda en {way_name}",
                "destination": "Gira a la izquierda hacia {destination}"
            },
            "right": {
                "default": "Gira a la derecha",
                "name": "Gira a la derecha en {way_name}",
                "destination": "Gira a la derecha hacia {destination}"
            },
            "straight": {
                "default": "Ve recto",
                "name": "Ve recto en {way_name}",
                "destination": "Ve recto hacia {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Continúa recto"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}

},{}],27:[function(require,module,exports){
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
                "north": "pohjoiseen",
                "northeast": "koilliseen",
                "east": "itään",
                "southeast": "kaakkoon",
                "south": "etelään",
                "southwest": "lounaaseen",
                "west": "länteen",
                "northwest": "luoteeseen"
            },
            "modifier": {
                "left": "vasemmall(e/a)",
                "right": "oikeall(e/a)",
                "sharp left": "jyrkästi vasempaan",
                "sharp right": "jyrkästi oikeaan",
                "slight left": "loivasti vasempaan",
                "slight right": "loivasti oikeaan",
                "straight": "suoraan eteenpäin",
                "uturn": "U-käännös"
            },
            "lanes": {
                "xo": "Pysy oikealla",
                "ox": "Pysy vasemmalla",
                "xox": "Pysy keskellä",
                "oxo": "Pysy vasemmalla tai oikealla"
            }
        },
        "modes": {
            "ferry": {
                "default": "Aja lautalle",
                "name": "Aja lautalle {way_name}",
                "destination": "Aja lautalle, jonka määränpää on {destination}"
            }
        },
        "phrase": {
            "two linked by distance": "{instruction_one}, sitten {distance} päästä, {instruction_two}",
            "two linked": "{instruction_one}, sitten {instruction_two}",
            "one in distance": "{distance} päästä, {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "{exit}"
        },
        "arrive": {
            "default": {
                "default": "Olet saapunut {nth} määränpäähäsi",
                "upcoming": "Saavut {nth} määränpäähäsi",
                "short": "Olet saapunut",
                "short-upcoming": "Saavut",
                "named": "Olet saapunut määränpäähän {waypoint_name}"
            },
            "left": {
                "default": "Olet saapunut {nth} määränpäähäsi, joka on vasemmalla puolellasi",
                "upcoming": "Saavut {nth} määränpäähäsi, joka on vasemmalla puolellasi",
                "short": "Olet saapunut",
                "short-upcoming": "Saavut",
                "named": "Olet saapunut määränpäähän {waypoint_name}, joka on vasemmalla puolellasi"
            },
            "right": {
                "default": "Olet saapunut {nth} määränpäähäsi, joka on oikealla puolellasi",
                "upcoming": "Saavut {nth} määränpäähäsi, joka on oikealla puolellasi",
                "short": "Olet saapunut",
                "short-upcoming": "Saavut",
                "named": "Olet saapunut määränpäähän {waypoint_name}, joka on oikealla puolellasi"
            },
            "sharp left": {
                "default": "Olet saapunut {nth} määränpäähäsi, joka on vasemmalla puolellasi",
                "upcoming": "Saavut {nth} määränpäähäsi, joka on vasemmalla puolellasi",
                "short": "Olet saapunut",
                "short-upcoming": "Saavut",
                "named": "Olet saapunut määränpäähän {waypoint_name}, joka on vasemmalla puolellasi"
            },
            "sharp right": {
                "default": "Olet saapunut {nth} määränpäähäsi, joka on oikealla puolellasi",
                "upcoming": "Saavut {nth} määränpäähäsi, joka on oikealla puolellasi",
                "short": "Olet saapunut",
                "short-upcoming": "Saavut",
                "named": "Olet saapunut määränpäähän {waypoint_name}, joka on oikealla puolellasi"
            },
            "slight right": {
                "default": "Olet saapunut {nth} määränpäähäsi, joka on oikealla puolellasi",
                "upcoming": "Saavut {nth} määränpäähäsi, joka on oikealla puolellasi",
                "short": "Olet saapunut",
                "short-upcoming": "Saavut",
                "named": "Olet saapunut määränpäähän {waypoint_name}, joka on oikealla puolellasi"
            },
            "slight left": {
                "default": "Olet saapunut {nth} määränpäähäsi, joka on vasemmalla puolellasi",
                "upcoming": "Saavut {nth} määränpäähäsi, joka on vasemmalla puolellasi",
                "short": "Olet saapunut",
                "short-upcoming": "Saavut",
                "named": "Olet saapunut määränpäähän {waypoint_name}, joka on vasemmalla puolellasi"
            },
            "straight": {
                "default": "Olet saapunut {nth} määränpäähäsi, joka on suoraan edessäsi",
                "upcoming": "Saavut {nth} määränpäähäsi, suoraan edessä",
                "short": "Olet saapunut",
                "short-upcoming": "Saavut",
                "named": "Olet saapunut määränpäähän {waypoint_name}, joka on suoraan edessäsi"
            }
        },
        "continue": {
            "default": {
                "default": "Käänny {modifier}",
                "name": "Käänny {modifier} pysyäksesi tiellä {way_name}",
                "destination": "Käänny {modifier} suuntana {destination}",
                "exit": "Käänny {modifier} tielle {way_name}"
            },
            "straight": {
                "default": "Jatka suoraan eteenpäin",
                "name": "Jatka suoraan pysyäksesi tiellä {way_name}",
                "destination": "Jatka suuntana {destination}",
                "distance": "Jatka suoraan {distance}",
                "namedistance": "Jatka tiellä {way_name} {distance}"
            },
            "sharp left": {
                "default": "Jatka jyrkästi vasempaan",
                "name": "Jatka jyrkästi vasempaan pysyäksesi tiellä {way_name}",
                "destination": "Jatka jyrkästi vasempaan suuntana {destination}"
            },
            "sharp right": {
                "default": "Jatka jyrkästi oikeaan",
                "name": "Jatka jyrkästi oikeaan pysyäksesi tiellä {way_name}",
                "destination": "Jatka jyrkästi oikeaan suuntana {destination}"
            },
            "slight left": {
                "default": "Jatka loivasti vasempaan",
                "name": "Jatka loivasti vasempaan pysyäksesi tiellä {way_name}",
                "destination": "Jatka loivasti vasempaan suuntana {destination}"
            },
            "slight right": {
                "default": "Jatka loivasti oikeaan",
                "name": "Jatka loivasti oikeaan pysyäksesi tiellä {way_name}",
                "destination": "Jatka loivasti oikeaan suuntana {destination}"
            },
            "uturn": {
                "default": "Tee U-käännös",
                "name": "Tee U-käännös ja jatka tietä {way_name}",
                "destination": "Tee U-käännös suuntana {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Aja {direction}",
                "name": "Aja tietä {way_name} {direction}",
                "namedistance": "Aja {distance} {direction} tietä {way_name} "
            }
        },
        "end of road": {
            "default": {
                "default": "Käänny {modifier}",
                "name": "Käänny {modifier} tielle {way_name}",
                "destination": "Käänny {modifier} suuntana {destination}"
            },
            "straight": {
                "default": "Jatka suoraan eteenpäin",
                "name": "Jatka suoraan eteenpäin tielle {way_name}",
                "destination": "Jatka suoraan eteenpäin suuntana {destination}"
            },
            "uturn": {
                "default": "Tien päässä tee U-käännös",
                "name": "Tien päässä tee U-käännös tielle {way_name}",
                "destination": "Tien päässä tee U-käännös suuntana {destination}"
            }
        },
        "fork": {
            "default": {
                "default": "Jatka tienhaarassa {modifier}",
                "name": "Jatka {modifier} tielle {way_name}",
                "destination": "Jatka {modifier} suuntana {destination}"
            },
            "slight left": {
                "default": "Pysy vasemmalla tienhaarassa",
                "name": "Pysy vasemmalla tielle {way_name}",
                "destination": "Pysy vasemmalla suuntana {destination}"
            },
            "slight right": {
                "default": "Pysy oikealla tienhaarassa",
                "name": "Pysy oikealla tielle {way_name}",
                "destination": "Pysy oikealla suuntana {destination}"
            },
            "sharp left": {
                "default": "Käänny tienhaarassa jyrkästi vasempaan",
                "name": "Käänny tienhaarassa jyrkästi vasempaan tielle {way_name}",
                "destination": "Käänny tienhaarassa jyrkästi vasempaan suuntana {destination}"
            },
            "sharp right": {
                "default": "Käänny tienhaarassa jyrkästi oikeaan",
                "name": "Käänny tienhaarassa jyrkästi oikeaan tielle {way_name}",
                "destination": "Käänny tienhaarassa jyrkästi oikeaan suuntana {destination}"
            },
            "uturn": {
                "default": "Tee U-käännös",
                "name": "Tee U-käännös tielle {way_name}",
                "destination": "Tee U-käännös suuntana {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Liity {modifier}",
                "name": "Liity {modifier}, tielle {way_name}",
                "destination": "Liity {modifier}, suuntana {destination}"
            },
            "straight": {
                "default": "Liity",
                "name": "Liity tielle {way_name}",
                "destination": "Liity suuntana {destination}"
            },
            "slight left": {
                "default": "Liity vasemmalle",
                "name": "Liity vasemmalle, tielle {way_name}",
                "destination": "Liity vasemmalle, suuntana {destination}"
            },
            "slight right": {
                "default": "Liity oikealle",
                "name": "Liity oikealle, tielle {way_name}",
                "destination": "Liity oikealle, suuntana {destination}"
            },
            "sharp left": {
                "default": "Liity vasemmalle",
                "name": "Liity vasemmalle, tielle {way_name}",
                "destination": "Liity vasemmalle, suuntana {destination}"
            },
            "sharp right": {
                "default": "Liity oikealle",
                "name": "Liity oikealle, tielle {way_name}",
                "destination": "Liity oikealle, suuntana {destination}"
            },
            "uturn": {
                "default": "Tee U-käännös",
                "name": "Tee U-käännös tielle {way_name}",
                "destination": "Tee U-käännös suuntana {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Jatka {modifier}",
                "name": "Jatka {modifier} tielle {way_name}",
                "destination": "Jatka {modifier} suuntana {destination}"
            },
            "straight": {
                "default": "Jatka suoraan eteenpäin",
                "name": "Jatka tielle {way_name}",
                "destination": "Jatka suuntana {destination}"
            },
            "sharp left": {
                "default": "Käänny jyrkästi vasempaan",
                "name": "Käänny jyrkästi vasempaan tielle {way_name}",
                "destination": "Käänny jyrkästi vasempaan suuntana {destination}"
            },
            "sharp right": {
                "default": "Käänny jyrkästi oikeaan",
                "name": "Käänny jyrkästi oikeaan tielle {way_name}",
                "destination": "Käänny jyrkästi oikeaan suuntana {destination}"
            },
            "slight left": {
                "default": "Jatka loivasti vasempaan",
                "name": "Jatka loivasti vasempaan tielle {way_name}",
                "destination": "Jatka loivasti vasempaan suuntana {destination}"
            },
            "slight right": {
                "default": "Jatka loivasti oikeaan",
                "name": "Jatka loivasti oikeaan tielle {way_name}",
                "destination": "Jatka loivasti oikeaan suuntana {destination}"
            },
            "uturn": {
                "default": "Tee U-käännös",
                "name": "Tee U-käännös tielle {way_name}",
                "destination": "Tee U-käännös suuntana {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Jatka {modifier}",
                "name": "Jatka {modifier} tielle {way_name}",
                "destination": "Jatka {modifier} suuntana {destination}"
            },
            "uturn": {
                "default": "Tee U-käännös",
                "name": "Tee U-käännös tielle {way_name}",
                "destination": "Tee U-käännös suuntana {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Aja erkanemiskaistalle",
                "name": "Aja erkanemiskaistaa tielle {way_name}",
                "destination": "Aja erkanemiskaistalle suuntana {destination}",
                "exit": "Ota poistuminen {exit}",
                "exit_destination": "Ota poistuminen {exit}, suuntana {destination}"
            },
            "left": {
                "default": "Aja vasemmalla olevalle erkanemiskaistalle",
                "name": "Aja vasemmalla olevaa erkanemiskaistaa tielle {way_name}",
                "destination": "Aja vasemmalla olevalle erkanemiskaistalle suuntana {destination}",
                "exit": "Ota poistuminen {exit} vasemmalla",
                "exit_destination": "Ota poistuminen {exit} vasemmalla, suuntana {destination}"
            },
            "right": {
                "default": "Aja oikealla olevalle erkanemiskaistalle",
                "name": "Aja oikealla olevaa erkanemiskaistaa tielle {way_name}",
                "destination": "Aja oikealla olevalle erkanemiskaistalle suuntana {destination}",
                "exit": "Ota poistuminen {exit} oikealla",
                "exit_destination": "Ota poistuminen {exit} oikealla, suuntana {destination}"
            },
            "sharp left": {
                "default": "Aja vasemmalla olevalle erkanemiskaistalle",
                "name": "Aja vasemmalla olevaa erkanemiskaistaa tielle {way_name}",
                "destination": "Aja vasemmalla olevalle erkanemiskaistalle suuntana {destination}",
                "exit": "Ota poistuminen {exit} vasemmalla",
                "exit_destination": "Ota poistuminen {exit} vasemmalla, suuntana {destination}"
            },
            "sharp right": {
                "default": "Aja oikealla olevalle erkanemiskaistalle",
                "name": "Aja oikealla olevaa erkanemiskaistaa tielle {way_name}",
                "destination": "Aja oikealla olevalle erkanemiskaistalle suuntana {destination}",
                "exit": "Ota poistuminen {exit} oikealla",
                "exit_destination": "Ota poistuminen {exit} oikealla, suuntana {destination}"
            },
            "slight left": {
                "default": "Aja vasemmalla olevalle erkanemiskaistalle",
                "name": "Aja vasemmalla olevaa erkanemiskaistaa tielle {way_name}",
                "destination": "Aja vasemmalla olevalle erkanemiskaistalle suuntana {destination}",
                "exit": "Ota poistuminen {exit} vasemmalla",
                "exit_destination": "Ota poistuminen {exit} vasemmalla, suuntana {destination}"
            },
            "slight right": {
                "default": "Aja oikealla olevalle erkanemiskaistalle",
                "name": "Aja oikealla olevaa erkanemiskaistaa tielle {way_name}",
                "destination": "Aja oikealla olevalle erkanemiskaistalle suuntana {destination}",
                "exit": "Ota poistuminen {exit} oikealla",
                "exit_destination": "Ota poistuminen {exit} oikealla, suuntana {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Aja erkanemiskaistalle",
                "name": "Aja erkanemiskaistaa tielle {way_name}",
                "destination": "Aja erkanemiskaistalle suuntana {destination}"
            },
            "left": {
                "default": "Aja vasemmalla olevalle erkanemiskaistalle",
                "name": "Aja vasemmalla olevaa erkanemiskaistaa tielle {way_name}",
                "destination": "Aja vasemmalla olevalle erkanemiskaistalle suuntana {destination}"
            },
            "right": {
                "default": "Aja oikealla olevalle erkanemiskaistalle",
                "name": "Aja oikealla olevaa erkanemiskaistaa tielle {way_name}",
                "destination": "Aja oikealla olevalle erkanemiskaistalle suuntana {destination}"
            },
            "sharp left": {
                "default": "Aja vasemmalla olevalle erkanemiskaistalle",
                "name": "Aja vasemmalla olevaa erkanemiskaistaa tielle {way_name}",
                "destination": "Aja vasemmalla olevalle erkanemiskaistalle suuntana {destination}"
            },
            "sharp right": {
                "default": "Aja oikealla olevalle erkanemiskaistalle",
                "name": "Aja oikealla olevaa erkanemiskaistaa tielle {way_name}",
                "destination": "Aja oikealla olevalle erkanemiskaistalle suuntana {destination}"
            },
            "slight left": {
                "default": "Aja vasemmalla olevalle erkanemiskaistalle",
                "name": "Aja vasemmalla olevaa erkanemiskaistaa tielle {way_name}",
                "destination": "Aja vasemmalla olevalle erkanemiskaistalle suuntana {destination}"
            },
            "slight right": {
                "default": "Aja oikealla olevalle erkanemiskaistalle",
                "name": "Aja oikealla olevaa erkanemiskaistaa tielle {way_name}",
                "destination": "Aja oikealla olevalle erkanemiskaistalle suuntana {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Aja liikenneympyrään",
                    "name": "Aja liikenneympyrään ja valitse erkanemiskaista tielle {way_name}",
                    "destination": "Aja liikenneympyrään ja valitse erkanemiskaista suuntana {destination}"
                },
                "name": {
                    "default": "Aja liikenneympyrään {rotary_name}",
                    "name": "Aja liikenneympyrään {rotary_name} ja valitse erkanemiskaista tielle {way_name}",
                    "destination": "Aja liikenneympyrään {rotary_name} ja valitse erkanemiskaista suuntana {destination}"
                },
                "exit": {
                    "default": "Aja liikenneympyrään ja valitse {exit_number} erkanemiskaista",
                    "name": "Aja liikenneympyrään ja valitse {exit_number} erkanemiskaista tielle {way_name}",
                    "destination": "Aja liikenneympyrään ja valitse {exit_number} erkanemiskaista suuntana {destination}"
                },
                "name_exit": {
                    "default": "Aja liikenneympyrään {rotary_name} ja valitse {exit_number} erkanemiskaista",
                    "name": "Aja liikenneympyrään {rotary_name} ja valitse {exit_number} erkanemiskaista tielle {way_name}",
                    "destination": "Aja liikenneympyrään {rotary_name} ja valitse {exit_number} erkanemiskaista suuntana {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "Aja liikenneympyrään ja valitse {exit_number} erkanemiskaista",
                    "name": "Aja liikenneympyrään ja valitse {exit_number} erkanemiskaista tielle {way_name}",
                    "destination": "Aja liikenneympyrään ja valitse {exit_number} erkanemiskaista suuntana {destination}"
                },
                "default": {
                    "default": "Aja liikenneympyrään",
                    "name": "Aja liikenneympyrään ja valitse erkanemiskaista tielle {way_name}",
                    "destination": "Aja liikenneympyrään ja valitse erkanemiskaista suuntana {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "Käänny {modifier}",
                "name": "Käänny {modifier} tielle {way_name}",
                "destination": "Käänny {modifier} suuntana {destination}"
            },
            "left": {
                "default": "Käänny vasempaan",
                "name": "Käänny vasempaan tielle {way_name}",
                "destination": "Käänny vasempaan suuntana {destination}"
            },
            "right": {
                "default": "Käänny oikeaan",
                "name": "Käänny oikeaan tielle {way_name}",
                "destination": "Käänny oikeaan suuntana {destination}"
            },
            "straight": {
                "default": "Jatka suoraan eteenpäin",
                "name": "Jatka suoraan eteenpäin tielle {way_name}",
                "destination": "Jatka suoraan eteenpäin suuntana {destination}"
            }
        },
        "exit roundabout": {
            "default": {
                "default": "Poistu liikenneympyrästä",
                "name": "Poistu liikenneympyrästä tielle {way_name}",
                "destination": "Poistu liikenneympyrästä suuntana {destination}"
            }
        },
        "exit rotary": {
            "default": {
                "default": "Poistu liikenneympyrästä",
                "name": "Poistu liikenneympyrästä tielle {way_name}",
                "destination": "Poistu liikenneympyrästä suuntana {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Käänny {modifier}",
                "name": "Käänny {modifier} tielle {way_name}",
                "destination": "Käänny {modifier} suuntana {destination}"
            },
            "left": {
                "default": "Käänny vasempaan",
                "name": "Käänny vasempaan tielle {way_name}",
                "destination": "Käänny vasempaan suuntana {destination}"
            },
            "right": {
                "default": "Käänny oikeaan",
                "name": "Käänny oikeaan tielle {way_name}",
                "destination": "Käänny oikeaan suuntana {destination}"
            },
            "straight": {
                "default": "Aja suoraan eteenpäin",
                "name": "Aja suoraan eteenpäin tielle {way_name}",
                "destination": "Aja suoraan eteenpäin suuntana {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Jatka suoraan eteenpäin"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}

},{}],28:[function(require,module,exports){
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
                "7": "septième",
                "8": "huitième",
                "9": "neuvième",
                "10": "dixième"
            },
            "direction": {
                "north": "le nord",
                "northeast": "le nord-est",
                "east": "l’est",
                "southeast": "le sud-est",
                "south": "le sud",
                "southwest": "le sud-ouest",
                "west": "l’ouest",
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
                "xo": "Tenir la droite",
                "ox": "Tenir la gauche",
                "xox": "Rester au milieu",
                "oxo": "Tenir la gauche ou la droite"
            }
        },
        "modes": {
            "ferry": {
                "default": "Prendre le ferry",
                "name": "Prendre le ferry {way_name:article}",
                "destination": "Prendre le ferry en direction {destination:preposition}"
            }
        },
        "phrase": {
            "two linked by distance": "{instruction_one}, puis, dans {distance}, {instruction_two}",
            "two linked": "{instruction_one}, puis {instruction_two}",
            "one in distance": "Dans {distance}, {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "sortie n°{exit}"
        },
        "arrive": {
            "default": {
                "default": "Vous êtes arrivé à votre {nth} destination",
                "upcoming": "Vous arriverez à votre {nth} destination",
                "short": "Vous êtes arrivé",
                "short-upcoming": "Vous arriverez",
                "named": "Vous êtes arrivé {waypoint_name:arrival}"
            },
            "left": {
                "default": "Vous êtes arrivé à votre {nth} destination, sur la gauche",
                "upcoming": "Vous arriverez à votre {nth} destination, sur la gauche",
                "short": "Vous êtes arrivé",
                "short-upcoming": "Vous arriverez",
                "named": "Vous êtes arrivé {waypoint_name:arrival}, sur la gauche"
            },
            "right": {
                "default": "Vous êtes arrivé à votre {nth} destination, sur la droite",
                "upcoming": "Vous arriverez à votre {nth} destination, sur la droite",
                "short": "Vous êtes arrivé",
                "short-upcoming": "Vous arriverez",
                "named": "Vous êtes arrivé à  {waypoint_name:arrival}, sur la droite"
            },
            "sharp left": {
                "default": "Vous êtes arrivé à votre {nth} destination, sur la gauche",
                "upcoming": "Vous arriverez à votre {nth} destination, sur la gauche",
                "short": "Vous êtes arrivé",
                "short-upcoming": "Vous arriverez",
                "named": "Vous êtes arrivé {waypoint_name:arrival}, sur la gauche"
            },
            "sharp right": {
                "default": "Vous êtes arrivé à votre {nth} destination, sur la droite",
                "upcoming": "Vous arriverez à votre {nth} destination, sur la droite",
                "short": "Vous êtes arrivé",
                "short-upcoming": "Vous arriverez",
                "named": "Vous êtes arrivé {waypoint_name:arrival}, sur la droite"
            },
            "slight right": {
                "default": "Vous êtes arrivé à votre {nth} destination, sur la droite",
                "upcoming": "Vous arriverez à votre {nth} destination, sur la droite",
                "short": "Vous êtes arrivé",
                "short-upcoming": "Vous arriverez",
                "named": "Vous êtes arrivé {waypoint_name:arrival}, sur la droite"
            },
            "slight left": {
                "default": "Vous êtes arrivé à votre {nth} destination, sur la gauche",
                "upcoming": "Vous arriverez à votre {nth} destination, sur la gauche",
                "short": "Vous êtes arrivé",
                "short-upcoming": "Vous êtes arrivé",
                "named": "Vous êtes arrivé {waypoint_name:arrival}, sur la gauche"
            },
            "straight": {
                "default": "Vous êtes arrivé à votre {nth} destination, droit devant",
                "upcoming": "Vous arriverez à votre {nth} destination, droit devant",
                "short": "Vous êtes arrivé",
                "short-upcoming": "Vous êtes arrivé",
                "named": "Vous êtes arrivé {waypoint_name:arrival}, droit devant"
            }
        },
        "continue": {
            "default": {
                "default": "Tourner {modifier}",
                "name": "Tourner {modifier} pour rester sur {way_name:article}",
                "destination": "Tourner {modifier} en direction {destination:preposition}",
                "exit": "Tourner {modifier} sur {way_name:article}"
            },
            "straight": {
                "default": "Continuer tout droit",
                "name": "Continuer tout droit pour rester sur {way_name:article}",
                "destination": "Continuer tout droit en direction {destination:preposition}",
                "distance": "Continuer tout droit sur {distance}",
                "namedistance": "Continuer sur {way_name:article} sur {distance}"
            },
            "sharp left": {
                "default": "Tourner franchement à gauche",
                "name": "Tourner franchement à gauche pour rester sur {way_name:article}",
                "destination": "Tourner franchement à gauche en direction {destination:preposition}"
            },
            "sharp right": {
                "default": "Tourner franchement à droite",
                "name": "Tourner franchement à droite pour rester sur {way_name:article}",
                "destination": "Tourner franchement à droite en direction {destination:preposition}"
            },
            "slight left": {
                "default": "Tourner légèrement à gauche",
                "name": "Tourner légèrement à gauche pour rester sur {way_name:article}",
                "destination": "Tourner légèrement à gauche en direction {destination:preposition}"
            },
            "slight right": {
                "default": "Tourner légèrement à droite",
                "name": "Tourner légèrement à droite pour rester sur {way_name:article}",
                "destination": "Tourner légèrement à droite en direction {destination:preposition}"
            },
            "uturn": {
                "default": "Faire demi-tour",
                "name": "Faire demi-tour et continuer sur {way_name:article}",
                "destination": "Faire demi-tour en direction {destination:preposition}"
            }
        },
        "depart": {
            "default": {
                "default": "Se diriger vers {direction}",
                "name": "Se diriger vers {direction} sur {way_name:article}",
                "namedistance": "Se diriger vers {direction} sur {way_name:article} sur {distance}"
            }
        },
        "end of road": {
            "default": {
                "default": "Tourner {modifier}",
                "name": "Tourner {modifier} sur {way_name:article}",
                "destination": "Tourner {modifier} en direction {destination:preposition}"
            },
            "straight": {
                "default": "Continuer tout droit",
                "name": "Continuer tout droit sur {way_name:article}",
                "destination": "Continuer tout droit en direction {destination:preposition}"
            },
            "uturn": {
                "default": "Faire demi-tour à la fin de la route",
                "name": "Faire demi-tour à la fin {way_name:preposition}",
                "destination": "Faire demi-tour à la fin de la route en direction {destination:preposition}"
            }
        },
        "fork": {
            "default": {
                "default": "Tenir {modifier} à l’embranchement",
                "name": "Tenir {modifier} sur {way_name:article}",
                "destination": "Tenir {modifier} en direction {destination:preposition}"
            },
            "slight left": {
                "default": "Tenir la gauche à l’embranchement",
                "name": "Tenir la gauche sur {way_name:article}",
                "destination": "Tenir la gauche en direction {destination:preposition}"
            },
            "slight right": {
                "default": "Tenir la droite à l’embranchement",
                "name": "Tenir la droite sur {way_name:article}",
                "destination": "Tenir la droite en direction {destination:preposition}"
            },
            "sharp left": {
                "default": "Tourner franchement à gauche à l’embranchement",
                "name": "Tourner franchement à gauche sur {way_name:article}",
                "destination": "Tourner franchement à gauche en direction {destination:preposition}"
            },
            "sharp right": {
                "default": "Tourner franchement à droite à l’embranchement",
                "name": "Tourner franchement à droite sur {way_name:article}",
                "destination": "Tourner franchement à droite en direction {destination:preposition}"
            },
            "uturn": {
                "default": "Faire demi-tour",
                "name": "Faire demi-tour sur {way_name:article}",
                "destination": "Faire demi-tour en direction {destination:preposition}"
            }
        },
        "merge": {
            "default": {
                "default": "S’insérer {modifier}",
                "name": "S’insérer {modifier} sur {way_name:article}",
                "destination": "S’insérer {modifier} en direction {destination:preposition}"
            },
            "straight": {
                "default": "S’insérer",
                "name": "S’insérer sur {way_name:article}",
                "destination": "S’insérer en direction {destination:preposition}"
            },
            "slight left": {
                "default": "S’insérer légèrement à gauche",
                "name": "S’insérer légèrement à gauche sur {way_name:article}",
                "destination": "S’insérer légèrement à gauche en direction {destination:preposition}"
            },
            "slight right": {
                "default": "S’insérer légèrement à droite",
                "name": "S’insérer légèrement à droite sur {way_name:article}",
                "destination": "S’insérer à droite en direction {destination:preposition}"
            },
            "sharp left": {
                "default": "S’insérer à gauche",
                "name": "S’insérer à gauche sur {way_name:article}",
                "destination": "S’insérer à gauche en direction {destination:preposition}"
            },
            "sharp right": {
                "default": "S’insérer à droite",
                "name": "S’insérer à droite sur {way_name:article}",
                "destination": "S’insérer à droite en direction {destination:preposition}"
            },
            "uturn": {
                "default": "Faire demi-tour",
                "name": "Faire demi-tour sur {way_name:article}",
                "destination": "Faire demi-tour en direction {destination:preposition}"
            }
        },
        "new name": {
            "default": {
                "default": "Continuer {modifier}",
                "name": "Continuer {modifier} sur {way_name:article}",
                "destination": "Continuer {modifier} en direction {destination:preposition}"
            },
            "straight": {
                "default": "Continuer tout droit",
                "name": "Continuer tout droit sur {way_name:article}",
                "destination": "Continuer tout droit en direction {destination:preposition}"
            },
            "sharp left": {
                "default": "Tourner franchement à gauche",
                "name": "Tourner franchement à gauche sur {way_name:article}",
                "destination": "Tourner franchement à gauche en direction {destination:preposition}"
            },
            "sharp right": {
                "default": "Tourner franchement à droite",
                "name": "Tourner franchement à droite sur {way_name:article}",
                "destination": "Tourner franchement à droite en direction {destination:preposition}"
            },
            "slight left": {
                "default": "Continuer légèrement à gauche",
                "name": "Continuer légèrement à gauche sur {way_name:article}",
                "destination": "Continuer légèrement à gauche en direction {destination:preposition}"
            },
            "slight right": {
                "default": "Continuer légèrement à droite",
                "name": "Continuer légèrement à droite sur {way_name:article}",
                "destination": "Continuer légèrement à droite en direction {destination:preposition}"
            },
            "uturn": {
                "default": "Faire demi-tour",
                "name": "Faire demi-tour sur {way_name:article}",
                "destination": "Faire demi-tour en direction {destination:preposition}"
            }
        },
        "notification": {
            "default": {
                "default": "Continuer {modifier}",
                "name": "Continuer {modifier} sur {way_name:article}",
                "destination": "Continuer {modifier} en direction {destination:preposition}"
            },
            "uturn": {
                "default": "Faire demi-tour",
                "name": "Faire demi-tour sur {way_name:article}",
                "destination": "Faire demi-tour en direction {destination:preposition}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Prendre la sortie",
                "name": "Prendre la sortie sur {way_name:article}",
                "destination": "Prendre la sortie en direction {destination:preposition}",
                "exit": "Prendre la sortie {exit}",
                "exit_destination": "Prendre la sortie {exit} en direction {destination:preposition}"
            },
            "left": {
                "default": "Prendre la sortie à gauche",
                "name": "Prendre la sortie à gauche sur {way_name:article}",
                "destination": "Prendre la sortie à gauche en direction {destination:preposition}",
                "exit": "Prendre la sortie {exit} sur la gauche",
                "exit_destination": "Prendre la sortie {exit} sur la gauche en direction {destination:preposition}"
            },
            "right": {
                "default": "Prendre la sortie à droite",
                "name": "Prendre la sortie à droite sur {way_name:article}",
                "destination": "Prendre la sortie à droite en direction {destination:preposition}",
                "exit": "Prendre la sortie {exit} sur la droite",
                "exit_destination": "Prendre la sortie {exit} sur la droite en direction {destination:preposition}"
            },
            "sharp left": {
                "default": "Prendre la sortie à gauche",
                "name": "Prendre la sortie à gauche sur {way_name:article}",
                "destination": "Prendre la sortie à gauche en direction {destination:preposition}",
                "exit": "Prendre la sortie {exit} sur la gauche",
                "exit_destination": "Prendre la sortie {exit} sur la gauche en direction {destination:preposition}"
            },
            "sharp right": {
                "default": "Prendre la sortie à droite",
                "name": "Prendre la sortie à droite sur {way_name:article}",
                "destination": "Prendre la sortie à droite en direction {destination:preposition}",
                "exit": "Prendre la sortie {exit} sur la droite",
                "exit_destination": "Prendre la sortie {exit} sur la droite en direction {destination:preposition}"
            },
            "slight left": {
                "default": "Prendre la sortie à gauche",
                "name": "Prendre la sortie à gauche sur {way_name:article}",
                "destination": "Prendre la sortie à gauche en direction {destination:preposition}",
                "exit": "Prendre la sortie {exit} sur la gauche",
                "exit_destination": "Prendre la sortie {exit} sur la gauche en direction {destination:preposition}"
            },
            "slight right": {
                "default": "Prendre la sortie à droite",
                "name": "Prendre la sortie à droite sur {way_name:article}",
                "destination": "Prendre la sortie à droite en direction {destination:preposition}",
                "exit": "Prendre la sortie {exit} sur la droite",
                "exit_destination": "Prendre la sortie {exit} sur la droite en direction {destination:preposition}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Prendre la sortie",
                "name": "Prendre la sortie sur {way_name:article}",
                "destination": "Prendre la sortie en direction {destination:preposition}"
            },
            "left": {
                "default": "Prendre la sortie à gauche",
                "name": "Prendre la sortie à gauche sur {way_name:article}",
                "destination": "Prendre la sortie à gauche en direction {destination:preposition}"
            },
            "right": {
                "default": "Prendre la sortie à droite",
                "name": "Prendre la sortie à droite sur {way_name:article}",
                "destination": "Prendre la sortie à droite en direction {destination:preposition}"
            },
            "sharp left": {
                "default": "Prendre la sortie à gauche",
                "name": "Prendre la sortie à gauche sur {way_name:article}",
                "destination": "Prendre la sortie à gauche en direction {destination:preposition}"
            },
            "sharp right": {
                "default": "Prendre la sortie à droite",
                "name": "Prendre la sortie à droite sur {way_name:article}",
                "destination": "Prendre la sortie à droite en direction {destination:preposition}"
            },
            "slight left": {
                "default": "Prendre la sortie à gauche",
                "name": "Prendre la sortie à gauche sur {way_name:article}",
                "destination": "Prendre la sortie à gauche en direction {destination:preposition}"
            },
            "slight right": {
                "default": "Prendre la sortie à droite",
                "name": "Prendre la sortie à droite sur {way_name:article}",
                "destination": "Prendre la sortie à droite en direction {destination:preposition}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Prendre le rond-point",
                    "name": "Prendre le rond-point, puis sortir sur {way_name:article}",
                    "destination": "Prendre le rond-point, puis sortir en direction {destination:preposition}"
                },
                "name": {
                    "default": "Prendre {rotary_name:rotary}",
                    "name": "Prendre {rotary_name:rotary}, puis sortir par {way_name:article}",
                    "destination": "Prendre {rotary_name:rotary}, puis sortir en direction {destination:preposition}"
                },
                "exit": {
                    "default": "Prendre le rond-point, puis la {exit_number} sortie",
                    "name": "Prendre le rond-point, puis la {exit_number} sortie sur {way_name:article}",
                    "destination": "Prendre le rond-point, puis la {exit_number} sortie en direction {destination:preposition}"
                },
                "name_exit": {
                    "default": "Prendre {rotary_name:rotary}, puis la {exit_number} sortie",
                    "name": "Prendre {rotary_name:rotary}, puis la {exit_number} sortie sur {way_name:article}",
                    "destination": "Prendre {rotary_name:rotary}, puis la {exit_number} sortie en direction {destination:preposition}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "Prendre le rond-point, puis la {exit_number} sortie",
                    "name": "Prendre le rond-point, puis la {exit_number} sortie sur {way_name:article}",
                    "destination": "Prendre le rond-point, puis la {exit_number} sortie en direction {destination:preposition}"
                },
                "default": {
                    "default": "Prendre le rond-point",
                    "name": "Prendre le rond-point, puis sortir sur {way_name:article}",
                    "destination": "Prendre le rond-point, puis sortir en direction {destination:preposition}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "Tourner {modifier}",
                "name": "Tourner {modifier} sur {way_name:article}",
                "destination": "Tourner {modifier} en direction {destination:preposition}"
            },
            "left": {
                "default": "Tourner à gauche",
                "name": "Tourner à gauche sur {way_name:article}",
                "destination": "Tourner à gauche en direction {destination:preposition}"
            },
            "right": {
                "default": "Tourner à droite",
                "name": "Tourner à droite sur {way_name:article}",
                "destination": "Tourner à droite en direction {destination:preposition}"
            },
            "straight": {
                "default": "Continuer tout droit",
                "name": "Continuer tout droit sur {way_name:article}",
                "destination": "Continuer tout droit en direction {destination:preposition}"
            }
        },
        "exit roundabout": {
            "default": {
                "default": "Sortir du rond-point",
                "name": "Sortir du rond-point sur {way_name:article}",
                "destination": "Sortir du rond-point en direction {destination:preposition}"
            }
        },
        "exit rotary": {
            "default": {
                "default": "Sortir du rond-point",
                "name": "Sortir du rond-point sur {way_name:article}",
                "destination": "Sortir du rond-point en direction {destination:preposition}"
            }
        },
        "turn": {
            "default": {
                "default": "Tourner {modifier}",
                "name": "Tourner {modifier} sur {way_name:article}",
                "destination": "Tourner {modifier} en direction {destination:preposition}"
            },
            "left": {
                "default": "Tourner à gauche",
                "name": "Tourner à gauche sur {way_name:article}",
                "destination": "Tourner à gauche en direction {destination:preposition}"
            },
            "right": {
                "default": "Tourner à droite",
                "name": "Tourner à droite sur {way_name:article}",
                "destination": "Tourner à droite en direction {destination:preposition}"
            },
            "straight": {
                "default": "Aller tout droit",
                "name": "Aller tout droit sur {way_name:article}",
                "destination": "Aller tout droit en direction {destination:preposition}"
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

},{}],29:[function(require,module,exports){
module.exports={
    "meta": {
        "capitalizeFirstLetter": true
    },
    "v5": {
        "constants": {
            "ordinalize": {
                "1": "ראשונה",
                "2": "שניה",
                "3": "שלישית",
                "4": "רביעית",
                "5": "חמישית",
                "6": "שישית",
                "7": "שביעית",
                "8": "שמינית",
                "9": "תשיעית",
                "10": "עשירית"
            },
            "direction": {
                "north": "צפון",
                "northeast": "צפון מזרח",
                "east": "מזרח",
                "southeast": "דרום מזרח",
                "south": "דרום",
                "southwest": "דרום מערב",
                "west": "מערב",
                "northwest": "צפון מערב"
            },
            "modifier": {
                "left": "שמאלה",
                "right": "ימינה",
                "sharp left": "חדה שמאלה",
                "sharp right": "חדה ימינה",
                "slight left": "קלה שמאלה",
                "slight right": "קלה ימינה",
                "straight": "ישר",
                "uturn": "פניית פרסה"
            },
            "lanes": {
                "xo": "היצמד לימין",
                "ox": "היצמד לשמאל",
                "xox": "המשך בנתיב האמצעי",
                "oxo": "היצמד לימין או לשמאל"
            }
        },
        "modes": {
            "ferry": {
                "default": "עלה על המעבורת",
                "name": "עלה על המעבורת {way_name}",
                "destination": "עלה על המעבורת לכיוון {destination}"
            }
        },
        "phrase": {
            "two linked by distance": "{instruction_one}, ואז, בעוד{distance}, {instruction_two}",
            "two linked": "{instruction_one}, ואז {instruction_two}",
            "one in distance": "בעוד {distance}, {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "יציאה {exit}"
        },
        "arrive": {
            "default": {
                "default": "הגעת אל היעד ה{nth} שלך",
                "upcoming": "אתה תגיע אל היעד ה{nth} שלך",
                "short": "הגעת",
                "short-upcoming": "תגיע",
                "named": "הגעת אל {waypoint_name}"
            },
            "left": {
                "default": "הגעת אל היעד ה{nth} שלך משמאלך",
                "upcoming": "אתה תגיע אל היעד ה{nth} שלך משמאלך",
                "short": "הגעת",
                "short-upcoming": "תגיע",
                "named": "הגעת אל {waypoint_name} שלך משמאלך"
            },
            "right": {
                "default": "הגעת אל היעד ה{nth} שלך מימינך",
                "upcoming": "אתה תגיע אל היעד ה{nth} שלך מימינך",
                "short": "הגעת",
                "short-upcoming": "תגיע",
                "named": "הגעת אל {waypoint_name} שלך מימינך"
            },
            "sharp left": {
                "default": "הגעת אל היעד ה{nth} שלך משמאלך",
                "upcoming": "אתה תגיע אל היעד ה{nth} שלך משמאלך",
                "short": "הגעת",
                "short-upcoming": "תגיע",
                "named": "הגעת אל {waypoint_name} שלך משמאלך"
            },
            "sharp right": {
                "default": "הגעת אל היעד ה{nth} שלך מימינך",
                "upcoming": "אתה תגיע אל היעד ה{nth} שלך מימינך",
                "short": "הגעת",
                "short-upcoming": "תגיע",
                "named": "הגעת אל {waypoint_name} שלך מימינך"
            },
            "slight right": {
                "default": "הגעת אל היעד ה{nth} שלך מימינך",
                "upcoming": "אתה תגיע אל היעד ה{nth} שלך מימינך",
                "short": "הגעת",
                "short-upcoming": "תגיע",
                "named": "הגעת אל {waypoint_name} שלך מימינך"
            },
            "slight left": {
                "default": "הגעת אל היעד ה{nth} שלך משמאלך",
                "upcoming": "אתה תגיע אל היעד ה{nth} שלך משמאלך",
                "short": "הגעת",
                "short-upcoming": "תגיע",
                "named": "הגעת אל {waypoint_name} שלך משמאלך"
            },
            "straight": {
                "default": "הגעת אל היעד ה{nth} שלך, בהמשך",
                "upcoming": "אתה תגיע אל היעד ה{nth} שלך, בהמשך",
                "short": "הגעת",
                "short-upcoming": "תגיע",
                "named": "הגעת אל {waypoint_name}, בהמשך"
            }
        },
        "continue": {
            "default": {
                "default": "פנה {modifier}",
                "name": "פנה {modifier} כדי להישאר ב{way_name}",
                "destination": "פנה {modifier} לכיוון {destination}",
                "exit": "פנה {modifier} על {way_name}"
            },
            "straight": {
                "default": "המשך ישר",
                "name": "המשך ישר כדי להישאר על {way_name}",
                "destination": "המשך לכיוון {destination}",
                "distance": "המשך ישר לאורך {distance}",
                "namedistance": "המשך על {way_name} לאורך {distance}"
            },
            "sharp left": {
                "default": "פנה בחדות שמאלה",
                "name": "פנה בחדות שמאלה כדי להישאר על {way_name}",
                "destination": "פנה בחדות שמאלה לכיוון {destination}"
            },
            "sharp right": {
                "default": "פנה בחדות ימינה",
                "name": "פנה בחדות ימינה כדי להישאר על {way_name}",
                "destination": "פנה בחדות ימינה לכיוון {destination}"
            },
            "slight left": {
                "default": "פנה קלות שמאלה",
                "name": "פנה קלות שמאלה כדי להישאר על {way_name}",
                "destination": "פנה קלות שמאלה לכיוון {destination}"
            },
            "slight right": {
                "default": "פנה קלות ימינה",
                "name": "פנה קלות ימינה כדי להישאר על {way_name}",
                "destination": "פנה קלות ימינה לכיוון {destination}"
            },
            "uturn": {
                "default": "פנה פניית פרסה",
                "name": "פנה פניית פרסה והמשך על {way_name}",
                "destination": "פנה פניית פרסה לכיוון {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "התכוונן {direction}",
                "name": "התכוונן {direction} על {way_name}",
                "namedistance": "התכוונן {direction} על {way_name} לאורך {distance}"
            }
        },
        "end of road": {
            "default": {
                "default": "פנה {modifier}",
                "name": "פנה {modifier} על {way_name}",
                "destination": "פנה {modifier} לכיוון {destination}"
            },
            "straight": {
                "default": "המשך ישר",
                "name": "המשך ישר על {way_name}",
                "destination": "המשך ישר לכיוון {destination}"
            },
            "uturn": {
                "default": "פנה פניית פרסה בסוף הדרך",
                "name": "פנה פניית פרסה על {way_name} בסוף הדרך",
                "destination": "פנה פניית פרסה לכיוון {destination} בסוף הדרך"
            }
        },
        "fork": {
            "default": {
                "default": "היצמד {modifier} בהתפצלות",
                "name": "היצמד {modifier} על {way_name}",
                "destination": "היצמד {modifier} לכיוון {destination}"
            },
            "slight left": {
                "default": "היצמד לשמאל בהתפצלות",
                "name": "היצמד לשמאל על {way_name}",
                "destination": "היצמד לשמאל לכיוון {destination}"
            },
            "slight right": {
                "default": "היצמד ימינה בהתפצלות",
                "name": "היצמד לימין על {way_name}",
                "destination": "היצמד לימין לכיוון {destination}"
            },
            "sharp left": {
                "default": "פנה בחדות שמאלה בהתפצלות",
                "name": "פנה בחדות שמאלה על {way_name}",
                "destination": "פנה בחדות שמאלה לכיוון {destination}"
            },
            "sharp right": {
                "default": "פנה בחדות ימינה בהתפצלות",
                "name": "פנה בחדות ימינה על {way_name}",
                "destination": "פנה בחדות ימינה לכיוון {destination}"
            },
            "uturn": {
                "default": "פנה פניית פרסה",
                "name": "פנה פניית פרסה על {way_name}",
                "destination": "פנה פניית פרסה לכיוון {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "השתלב {modifier}",
                "name": "השתלב {modifier} על {way_name}",
                "destination": "השתלב {modifier} לכיוון {destination}"
            },
            "straight": {
                "default": "השתלב",
                "name": "השתלב על {way_name}",
                "destination": "השתלב לכיוון {destination}"
            },
            "slight left": {
                "default": "השתלב שמאלה",
                "name": "השתלב שמאלה על {way_name}",
                "destination": "השתלב שמאלה לכיוון {destination}"
            },
            "slight right": {
                "default": "השתלב ימינה",
                "name": "השתלב ימינה על {way_name}",
                "destination": "השתלב ימינה לכיוון {destination}"
            },
            "sharp left": {
                "default": "השתלב שמאלה",
                "name": "השתלב שמאלה על {way_name}",
                "destination": "השתלב שמאלה לכיוון {destination}"
            },
            "sharp right": {
                "default": "השתלב ימינה",
                "name": "השתלב ימינה על {way_name}",
                "destination": "השתלב ימינה לכיוון {destination}"
            },
            "uturn": {
                "default": "פנה פניית פרסה",
                "name": "פנה פניית פרסה על {way_name}",
                "destination": "פנה פניית פרסה לכיוון {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "המשך {modifier}",
                "name": "המשך {modifier} על {way_name}",
                "destination": "המשך {modifier} לכיוון {destination}"
            },
            "straight": {
                "default": "המשך ישר",
                "name": "המשך על {way_name}",
                "destination": "המשך לכיוון {destination}"
            },
            "sharp left": {
                "default": "פנה בחדות שמאלה",
                "name": "פנה בחדות שמאלה על {way_name}",
                "destination": "פנה בחדות שמאלה לכיוון {destination}"
            },
            "sharp right": {
                "default": "פנה בחדות ימינה",
                "name": "פנה בחדות ימינה על {way_name}",
                "destination": "פנה בחדות ימינה לכיוון {destination}"
            },
            "slight left": {
                "default": "המשך בנטייה קלה שמאלה",
                "name": "המשך בנטייה קלה שמאלה על {way_name}",
                "destination": "המשך בנטייה קלה שמאלה לכיוון {destination}"
            },
            "slight right": {
                "default": "המשך בנטייה קלה ימינה",
                "name": "המשך בנטייה קלה ימינה על {way_name}",
                "destination": "המשך בנטייה קלה ימינה לכיוון {destination}"
            },
            "uturn": {
                "default": "פנה פניית פרסה",
                "name": "פנה פניית פרסה על {way_name}",
                "destination": "פנה פניית פרסה לכיוון {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "המשך {modifier}",
                "name": "המשך {modifier} על {way_name}",
                "destination": "המשך {modifier} לכיוון {destination}"
            },
            "uturn": {
                "default": "פנה פניית פרסה",
                "name": "פנה פניית פרסה על {way_name}",
                "destination": "פנה פניית פרסה לכיוון {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "צא ביציאה",
                "name": "צא ביציאה על {way_name}",
                "destination": "צא ביציאה לכיוון {destination}",
                "exit": "צא ביציאה {exit}",
                "exit_destination": "צא ביציאה {exit} לכיוון {destination}"
            },
            "left": {
                "default": "צא ביציאה שמשמאלך",
                "name": "צא ביציאה שמשמאלך על {way_name}",
                "destination": "צא ביציאה שמשמאלך לכיוון {destination}",
                "exit": "צא ביציאה {exit} משמאלך",
                "exit_destination": "צא ביציאה {exit} משמאלך לכיוון {destination}"
            },
            "right": {
                "default": "צא ביציאה שמימינך",
                "name": "צא ביציאה שמימינך על {way_name}",
                "destination": "צא ביציאה שמימינך לכיוון {destination}",
                "exit": "צא ביציאה {exit} מימינך",
                "exit_destination": "צא ביציאה {exit} מימינך לכיוון {destination}"
            },
            "sharp left": {
                "default": "צא ביציאה שבשמאלך",
                "name": "צא ביציאה שמשמאלך על {way_name}",
                "destination": "צא ביציאה שמשמאלך לכיוון {destination}",
                "exit": "צא ביציאה {exit} משמאלך",
                "exit_destination": "צא ביציאה {exit} משמאלך לכיוון {destination}"
            },
            "sharp right": {
                "default": "צא ביציאה שמימינך",
                "name": "צא ביציאה שמימינך על {way_name}",
                "destination": "צא ביציאה שמימינך לכיוון {destination}",
                "exit": "צא ביציאה {exit} מימינך",
                "exit_destination": "צא ביציאה {exit} מימינך לכיוון {destination}"
            },
            "slight left": {
                "default": "צא ביציאה שבשמאלך",
                "name": "צא ביציאה שמשמאלך על {way_name}",
                "destination": "צא ביציאה שמשמאלך לכיוון {destination}",
                "exit": "צא ביציאה {exit} משמאלך",
                "exit_destination": "צא ביציאה {exit} משמאלך לכיוון {destination}"
            },
            "slight right": {
                "default": "צא ביציאה שמימינך",
                "name": "צא ביציאה שמימינך על {way_name}",
                "destination": "צא ביציאה שמימינך לכיוון {destination}",
                "exit": "צא ביציאה {exit} מימינך",
                "exit_destination": "צא ביציאה {exit} מימינך לכיוון {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "צא ביציאה",
                "name": "צא ביציאה על {way_name}",
                "destination": "צא ביציאה לכיוון {destination}"
            },
            "left": {
                "default": "צא ביציאה שבשמאלך",
                "name": "צא ביציאה שמשמאלך על {way_name}",
                "destination": "צא ביציאה שמשמאלך לכיוון {destination}"
            },
            "right": {
                "default": "צא ביציאה שמימינך",
                "name": "צא ביציאה שמימינך על {way_name}",
                "destination": "צא ביציאה שמימינך לכיוון {destination}"
            },
            "sharp left": {
                "default": "צא ביציאה שבשמאלך",
                "name": "צא ביציאה שמשמאלך על {way_name}",
                "destination": "צא ביציאה שמשמאלך לכיוון {destination}"
            },
            "sharp right": {
                "default": "צא ביציאה שמימינך",
                "name": "צא ביציאה שמימינך על {way_name}",
                "destination": "צא ביציאה שמימינך לכיוון {destination}"
            },
            "slight left": {
                "default": "צא ביציאה שבשמאלך",
                "name": "צא ביציאה שמשמאלך על {way_name}",
                "destination": "צא ביציאה שמשמאלך לכיוון {destination}"
            },
            "slight right": {
                "default": "צא ביציאה שמימינך",
                "name": "צא ביציאה שמימינך על {way_name}",
                "destination": "צא ביציאה שמימינך לכיוון {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "השתלב במעגל התנועה",
                    "name": "השתלב במעגל התנועה וצא על {way_name}",
                    "destination": "השתלב במעגל התנועה וצא לכיוון {destination}"
                },
                "name": {
                    "default": "היכנס ל{rotary_name}",
                    "name": "היכנס ל{rotary_name} וצא על {way_name}",
                    "destination": "היכנס ל{rotary_name} וצא לכיוון {destination}"
                },
                "exit": {
                    "default": "השתלב במעגל התנועה וצא ביציאה {exit_number}",
                    "name": "השתלב במעגל התנועה וצא ביציאה {exit_number} ל{way_name}",
                    "destination": "השתלב במעגל התנועה וצא ביציאה {exit_number} לכיוון {destination}"
                },
                "name_exit": {
                    "default": "היכנס ל{rotary_name} וצא ביציאה ה{exit_number}",
                    "name": "היכנס ל{rotary_name} וצא ביציאה ה{exit_number} ל{way_name}",
                    "destination": "היכנס ל{rotary_name} וצא ביציאה ה{exit_number} לכיוון {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "השתלב במעגל התנועה וצא ביציאה {exit_number}",
                    "name": "השתלב במעגל התנועה וצא ביציאה {exit_number} ל{way_name}",
                    "destination": "השתלב במעגל התנועה וצא ביציאה {exit_number} לכיוון {destination}"
                },
                "default": {
                    "default": "השתלב במעגל התנועה",
                    "name": "השתלב במעגל התנועה וצא על {way_name}",
                    "destination": "השתלב במעגל התנועה וצא לכיוון {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "פנה {modifier}",
                "name": "פנה {modifier} על {way_name}",
                "destination": "פנה {modifier} לכיוון {destination}"
            },
            "left": {
                "default": "פנה שמאלה",
                "name": "פנה שמאלה ל{way_name}",
                "destination": "פנה שמאלה לכיוון {destination}"
            },
            "right": {
                "default": "פנה ימינה",
                "name": "פנה ימינה ל{way_name}",
                "destination": "פנה ימינה לכיוון {destination}"
            },
            "straight": {
                "default": "המשך ישר",
                "name": "המשך ישר על {way_name}",
                "destination": "המשך ישר לכיוון {destination}"
            }
        },
        "exit roundabout": {
            "default": {
                "default": "צא ממעגל התנועה",
                "name": "צא ממעגל התנועה ל{way_name}",
                "destination": "צא ממעגל התנועה לכיוון {destination}"
            }
        },
        "exit rotary": {
            "default": {
                "default": "צא ממעגל התנועה",
                "name": "צא ממעגל התנועה ל{way_name}",
                "destination": "צא ממעגל התנועה לכיוון {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "פנה {modifier}",
                "name": "פנה {modifier} על {way_name}",
                "destination": "פנה {modifier} לכיוון {destination}"
            },
            "left": {
                "default": "פנה שמאלה",
                "name": "פנה שמאלה ל{way_name}",
                "destination": "פנה שמאלה לכיוון {destination}"
            },
            "right": {
                "default": "פנה ימינה",
                "name": "פנה ימינה ל{way_name}",
                "destination": "פנה ימינה לכיוון {destination}"
            },
            "straight": {
                "default": "המשך ישר",
                "name": "המשך ישר ל{way_name}",
                "destination": "המשך ישר לכיוון {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "המשך ישר"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}

},{}],30:[function(require,module,exports){
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
        "phrase": {
            "two linked by distance": "{instruction_one}, then, in {distance}, {instruction_two}",
            "two linked": "{instruction_one}, then {instruction_two}",
            "one in distance": "In {distance}, {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "exit {exit}"
        },
        "arrive": {
            "default": {
                "default": "Anda telah tiba di tujuan ke-{nth}",
                "upcoming": "Anda telah tiba di tujuan ke-{nth}",
                "short": "Anda telah tiba di tujuan ke-{nth}",
                "short-upcoming": "Anda telah tiba di tujuan ke-{nth}",
                "named": "Anda telah tiba di {waypoint_name}"
            },
            "left": {
                "default": "Anda telah tiba di tujuan ke-{nth}, di sebelah kiri",
                "upcoming": "Anda telah tiba di tujuan ke-{nth}, di sebelah kiri",
                "short": "Anda telah tiba di tujuan ke-{nth}",
                "short-upcoming": "Anda telah tiba di tujuan ke-{nth}",
                "named": "Anda telah tiba di {waypoint_name}, di sebelah kiri"
            },
            "right": {
                "default": "Anda telah tiba di tujuan ke-{nth}, di sebelah kanan",
                "upcoming": "Anda telah tiba di tujuan ke-{nth}, di sebelah kanan",
                "short": "Anda telah tiba di tujuan ke-{nth}",
                "short-upcoming": "Anda telah tiba di tujuan ke-{nth}",
                "named": "Anda telah tiba di {waypoint_name}, di sebelah kanan"
            },
            "sharp left": {
                "default": "Anda telah tiba di tujuan ke-{nth}, di sebelah kiri",
                "upcoming": "Anda telah tiba di tujuan ke-{nth}, di sebelah kiri",
                "short": "Anda telah tiba di tujuan ke-{nth}",
                "short-upcoming": "Anda telah tiba di tujuan ke-{nth}",
                "named": "Anda telah tiba di {waypoint_name}, di sebelah kiri"
            },
            "sharp right": {
                "default": "Anda telah tiba di tujuan ke-{nth}, di sebelah kanan",
                "upcoming": "Anda telah tiba di tujuan ke-{nth}, di sebelah kanan",
                "short": "Anda telah tiba di tujuan ke-{nth}",
                "short-upcoming": "Anda telah tiba di tujuan ke-{nth}",
                "named": "Anda telah tiba di {waypoint_name}, di sebelah kanan"
            },
            "slight right": {
                "default": "Anda telah tiba di tujuan ke-{nth}, di sebelah kanan",
                "upcoming": "Anda telah tiba di tujuan ke-{nth}, di sebelah kanan",
                "short": "Anda telah tiba di tujuan ke-{nth}",
                "short-upcoming": "Anda telah tiba di tujuan ke-{nth}",
                "named": "Anda telah tiba di {waypoint_name}, di sebelah kanan"
            },
            "slight left": {
                "default": "Anda telah tiba di tujuan ke-{nth}, di sebelah kiri",
                "upcoming": "Anda telah tiba di tujuan ke-{nth}, di sebelah kiri",
                "short": "Anda telah tiba di tujuan ke-{nth}",
                "short-upcoming": "Anda telah tiba di tujuan ke-{nth}",
                "named": "Anda telah tiba di {waypoint_name}, di sebelah kiri"
            },
            "straight": {
                "default": "Anda telah tiba di tujuan ke-{nth}, lurus saja",
                "upcoming": "Anda telah tiba di tujuan ke-{nth}, lurus saja",
                "short": "Anda telah tiba di tujuan ke-{nth}",
                "short-upcoming": "Anda telah tiba di tujuan ke-{nth}",
                "named": "Anda telah tiba di {waypoint_name}, lurus saja"
            }
        },
        "continue": {
            "default": {
                "default": "Belok {modifier}",
                "name": "Terus {modifier} ke {way_name}",
                "destination": "Belok {modifier} menuju {destination}",
                "exit": "Belok {modifier} ke {way_name}"
            },
            "straight": {
                "default": "Lurus terus",
                "name": "Terus ke {way_name}",
                "destination": "Terus menuju {destination}",
                "distance": "Continue straight for {distance}",
                "namedistance": "Continue on {way_name} for {distance}"
            },
            "sharp left": {
                "default": "Belok kiri tajam",
                "name": "Make a sharp left to stay on {way_name}",
                "destination": "Belok kiri tajam menuju {destination}"
            },
            "sharp right": {
                "default": "Belok kanan tajam",
                "name": "Make a sharp right to stay on {way_name}",
                "destination": "Belok kanan tajam menuju {destination}"
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
                "name": "Arah {direction} di {way_name}",
                "namedistance": "Head {direction} on {way_name} for {distance}"
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
                "name": "Belok kiri tajam ke arah {way_name}",
                "destination": "Belok kiri tajam menuju {destination}"
            },
            "sharp right": {
                "default": "Belok kanan pada pertigaan",
                "name": "Belok kanan tajam ke arah {way_name}",
                "destination": "Belok kanan tajam menuju {destination}"
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
            "straight": {
                "default": "Bergabung lurus",
                "name": "Bergabung lurus ke arah {way_name}",
                "destination": "Bergabung lurus menuju {destination}"
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
            "straight": {
                "default": "Lurus terus",
                "name": "Terus ke {way_name}",
                "destination": "Terus menuju {destination}"
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
                "destination": "Ambil jalan melandai menuju {destination}",
                "exit": "Take exit {exit}",
                "exit_destination": "Take exit {exit} towards {destination}"
            },
            "left": {
                "default": "Ambil jalan yang melandai di sebelah kiri",
                "name": "Ambil jalan melandai di sebelah kiri ke arah {way_name}",
                "destination": "Ambil jalan melandai di sebelah kiri menuju {destination}",
                "exit": "Take exit {exit} on the left",
                "exit_destination": "Take exit {exit} on the left towards {destination}"
            },
            "right": {
                "default": "Ambil jalan melandai di sebelah kanan",
                "name": "Ambil jalan melandai di sebelah kanan ke {way_name}",
                "destination": "Ambil jalan melandai di sebelah kanan menuju {destination}",
                "exit": "Take exit {exit} on the right",
                "exit_destination": "Take exit {exit} on the right towards {destination}"
            },
            "sharp left": {
                "default": "Ambil jalan yang melandai di sebelah kiri",
                "name": "Ambil jalan melandai di sebelah kiri ke arah {way_name}",
                "destination": "Ambil jalan melandai di sebelah kiri menuju {destination}",
                "exit": "Take exit {exit} on the left",
                "exit_destination": "Take exit {exit} on the left towards {destination}"
            },
            "sharp right": {
                "default": "Ambil jalan melandai di sebelah kanan",
                "name": "Ambil jalan melandai di sebelah kanan ke {way_name}",
                "destination": "Ambil jalan melandai di sebelah kanan menuju {destination}",
                "exit": "Take exit {exit} on the right",
                "exit_destination": "Take exit {exit} on the right towards {destination}"
            },
            "slight left": {
                "default": "Ambil jalan yang melandai di sebelah kiri",
                "name": "Ambil jalan melandai di sebelah kiri ke arah {way_name}",
                "destination": "Ambil jalan melandai di sebelah kiri menuju {destination}",
                "exit": "Take exit {exit} on the left",
                "exit_destination": "Take exit {exit} on the left towards {destination}"
            },
            "slight right": {
                "default": "Ambil jalan melandai di sebelah kanan",
                "name": "Ambil jalan melandai di sebelah kanan ke {way_name}",
                "destination": "Ambil jalan melandai di sebelah kanan  menuju {destination}",
                "exit": "Take exit {exit} on the right",
                "exit_destination": "Take exit {exit} on the right towards {destination}"
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
                "default": "Lurus terus",
                "name": "Tetap lurus ke {way_name} ",
                "destination": "Tetap lurus menuju {destination}"
            }
        },
        "exit roundabout": {
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
                "default": "Lurus terus",
                "name": "Tetap lurus ke {way_name} ",
                "destination": "Tetap lurus menuju {destination}"
            }
        },
        "exit rotary": {
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

},{}],31:[function(require,module,exports){
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
        "phrase": {
            "two linked by distance": "{instruction_one}, poi tra {distance},{instruction_two}",
            "two linked": "{instruction_one}, poi {instruction_two}",
            "one in distance": "tra {distance} {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "exit {exit}"
        },
        "arrive": {
            "default": {
                "default": "Sei arrivato alla tua {nth} destinazione",
                "upcoming": "Sei arrivato alla tua {nth} destinazione",
                "short": "Sei arrivato alla tua {nth} destinazione",
                "short-upcoming": "Sei arrivato alla tua {nth} destinazione",
                "named": "Sei arrivato a {waypoint_name}"
            },
            "left": {
                "default": "sei arrivato alla tua {nth} destinazione, sulla sinistra",
                "upcoming": "sei arrivato alla tua {nth} destinazione, sulla sinistra",
                "short": "Sei arrivato alla tua {nth} destinazione",
                "short-upcoming": "Sei arrivato alla tua {nth} destinazione",
                "named": "sei arrivato a {waypoint_name}, sulla sinistra"
            },
            "right": {
                "default": "sei arrivato alla tua {nth} destinazione, sulla destra",
                "upcoming": "sei arrivato alla tua {nth} destinazione, sulla destra",
                "short": "Sei arrivato alla tua {nth} destinazione",
                "short-upcoming": "Sei arrivato alla tua {nth} destinazione",
                "named": "sei arrivato a {waypoint_name}, sulla destra"
            },
            "sharp left": {
                "default": "sei arrivato alla tua {nth} destinazione, sulla sinistra",
                "upcoming": "sei arrivato alla tua {nth} destinazione, sulla sinistra",
                "short": "Sei arrivato alla tua {nth} destinazione",
                "short-upcoming": "Sei arrivato alla tua {nth} destinazione",
                "named": "sei arrivato a {waypoint_name}, sulla sinistra"
            },
            "sharp right": {
                "default": "sei arrivato alla tua {nth} destinazione, sulla destra",
                "upcoming": "sei arrivato alla tua {nth} destinazione, sulla destra",
                "short": "Sei arrivato alla tua {nth} destinazione",
                "short-upcoming": "Sei arrivato alla tua {nth} destinazione",
                "named": "sei arrivato a {waypoint_name}, sulla destra"
            },
            "slight right": {
                "default": "sei arrivato alla tua {nth} destinazione, sulla destra",
                "upcoming": "sei arrivato alla tua {nth} destinazione, sulla destra",
                "short": "Sei arrivato alla tua {nth} destinazione",
                "short-upcoming": "Sei arrivato alla tua {nth} destinazione",
                "named": "sei arrivato a {waypoint_name}, sulla destra"
            },
            "slight left": {
                "default": "sei arrivato alla tua {nth} destinazione, sulla sinistra",
                "upcoming": "sei arrivato alla tua {nth} destinazione, sulla sinistra",
                "short": "Sei arrivato alla tua {nth} destinazione",
                "short-upcoming": "Sei arrivato alla tua {nth} destinazione",
                "named": "sei arrivato a {waypoint_name}, sulla sinistra"
            },
            "straight": {
                "default": "sei arrivato alla tua {nth} destinazione, si trova davanti a te",
                "upcoming": "sei arrivato alla tua {nth} destinazione, si trova davanti a te",
                "short": "Sei arrivato alla tua {nth} destinazione",
                "short-upcoming": "Sei arrivato alla tua {nth} destinazione",
                "named": "sei arrivato a {waypoint_name}, si trova davanti a te"
            }
        },
        "continue": {
            "default": {
                "default": "Gira a {modifier}",
                "name": "Gira a {modifier} per stare su {way_name}",
                "destination": "Gira a {modifier} verso {destination}",
                "exit": "Gira a {modifier} in {way_name}"
            },
            "straight": {
                "default": "Continua dritto",
                "name": "Continua dritto per stare su {way_name}",
                "destination": "Continua verso {destination}",
                "distance": "Continua dritto per {distance}",
                "namedistance": "Continua su {way_name} per {distance}"
            },
            "sharp left": {
                "default": "Svolta a sinistra",
                "name": "Fai una stretta curva a sinistra per stare su {way_name}",
                "destination": "Svolta a sinistra verso {destination}"
            },
            "sharp right": {
                "default": "Svolta a destra",
                "name": "Fau una stretta curva a destra per stare su {way_name}",
                "destination": "Svolta a destra verso {destination}"
            },
            "slight left": {
                "default": "Fai una leggera curva a sinistra",
                "name": "Fai una leggera curva a sinistra per stare su {way_name}",
                "destination": "Fai una leggera curva a sinistra verso {destination}"
            },
            "slight right": {
                "default": "Fai una leggera curva a destra",
                "name": "Fai una leggera curva a destra per stare su {way_name}",
                "destination": "Fai una leggera curva a destra verso {destination}"
            },
            "uturn": {
                "default": "Fai un'inversione a U",
                "name": "Fai un'inversione ad U poi continua su {way_name}",
                "destination": "Fai un'inversione a U verso {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Continua verso {direction}",
                "name": "Continua verso {direction} in {way_name}",
                "namedistance": "Head {direction} on {way_name} for {distance}"
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
                "name": "Svolta a sinistra in {way_name}",
                "destination": "Svolta a sinistra verso {destination}"
            },
            "sharp right": {
                "default": "Svolta a destra al bivio",
                "name": "Svolta a destra in {way_name}",
                "destination": "Svolta a destra verso {destination}"
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
            "straight": {
                "default": "Immettiti a dritto",
                "name": "Immettiti dritto in {way_name}",
                "destination": "Immettiti dritto verso {destination}"
            },
            "slight left": {
                "default": "Immettiti a sinistra",
                "name": "Immettiti a sinistra in {way_name}",
                "destination": "Immettiti a sinistra verso {destination}"
            },
            "slight right": {
                "default": "Immettiti a destra",
                "name": "Immettiti a destra in {way_name}",
                "destination": "Immettiti a destra verso {destination}"
            },
            "sharp left": {
                "default": "Immettiti a sinistra",
                "name": "Immettiti a sinistra in {way_name}",
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
                "default": "Continua dritto",
                "name": "Continua dritto in {way_name}",
                "destination": "Continua dritto verso {destination}"
            }
        },
        "exit roundabout": {
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
                "default": "Continua dritto",
                "name": "Continua dritto in {way_name}",
                "destination": "Continua dritto verso {destination}"
            }
        },
        "exit rotary": {
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

},{}],32:[function(require,module,exports){
module.exports={
    "meta": {
        "capitalizeFirstLetter": false
    },
    "v5": {
        "constants": {
            "ordinalize": {
                "1": "첫번쩨",
                "2": "두번째",
                "3": "세번째",
                "4": "네번쩨",
                "5": "다섯번째",
                "6": "여섯번째",
                "7": "일곱번째",
                "8": "여덟번째",
                "9": "아홉번째",
                "10": "열번째"
            },
            "direction": {
                "north": "북쪽",
                "northeast": "북동쪽",
                "east": "동쪽",
                "southeast": "남동쪽",
                "south": "남쪽",
                "southwest": "남서쪽",
                "west": "서쪽",
                "northwest": "북서쪽"
            },
            "modifier": {
                "left": "좌회전",
                "right": "우회전",
                "sharp left": "바로좌회전",
                "sharp right": "바로우회전",
                "slight left": "조금왼쪽",
                "slight right": "조금오른쪽",
                "straight": "직진",
                "uturn": "유턴"
            },
            "lanes": {
                "xo": "우측차선 유지",
                "ox": "좌측차선 유지",
                "xox": "중앙유지",
                "oxo": "계속 좌측 또는 우측 차선"
            }
        },
        "modes": {
            "ferry": {
                "default": "페리를 타시오",
                "name": "페리를 타시오 {way_name}",
                "destination": "페리를 타고 {destination}까지 가세요."
            }
        },
        "phrase": {
            "two linked by distance": "{instruction_one}, 그리고, {distance} 안에, {instruction_two}",
            "two linked": "{instruction_one}, 그리고 {instruction_two}",
            "one in distance": "{distance} 내에, {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "{exit}번으로 나가세요."
        },
        "arrive": {
            "default": {
                "default": " {nth}목적지에 도착하였습니다.",
                "upcoming": "{nth}목적지에 곧 도착할 예정입니다.",
                "short": "도착하였습니다",
                "short-upcoming": "도착할 예정입니다.",
                "named": "경유지 {waypoint_name}에 도착하였습니다."
            },
            "left": {
                "default": "좌측에 {nth} 목적지가 있습니다.",
                "upcoming": "좌측에 {nth} 목적지에 도착할 예정입니다.",
                "short": "도착하였습니다",
                "short-upcoming": "목적지에 곧 도착할 예정입니다.",
                "named": "좌측에 경유지 {waypoint_name}에 도착하였습니다."
            },
            "right": {
                "default": "우측에 {nth} 목적지가 있습니다.",
                "upcoming": "우측에 {nth} 목적지에 도착할 예정입니다.",
                "short": "도착하였습니다",
                "short-upcoming": "목적지에 곧 도착할 예정입니다.",
                "named": "우측에 경유지 {waypoint_name}에 도착하였습니다."
            },
            "sharp left": {
                "default": "좌측에 {nth} 목적지가 있습니다.",
                "upcoming": "좌측에 {nth} 목적지에 도착할 예정입니다.",
                "short": "도착하였습니다",
                "short-upcoming": "목적지에 곧 도착할 예정입니다.",
                "named": "좌측에 경유지 {waypoint_name}에 도착하였습니다."
            },
            "sharp right": {
                "default": "우측에 {nth} 목적지가 있습니다.",
                "upcoming": "우측에 {nth} 목적지에 도착할 예정입니다.",
                "short": "도착하였습니다",
                "short-upcoming": "목적지에 곧 도착할 예정입니다.",
                "named": "우측에 경유지 {waypoint_name}에 도착하였습니다."
            },
            "slight right": {
                "default": "우측에 {nth} 목적지가 있습니다.",
                "upcoming": "우측에 {nth} 목적지에 도착할 예정입니다.",
                "short": "도착하였습니다",
                "short-upcoming": "목적지에 곧 도착할 예정입니다.",
                "named": "우측에 경유지 {waypoint_name}에 도착하였습니다."
            },
            "slight left": {
                "default": "좌측에 {nth} 목적지가 있습니다.",
                "upcoming": "좌측에 {nth} 목적지에 도착할 예정입니다.",
                "short": "도착하였습니다",
                "short-upcoming": "목적지에 곧 도착할 예정입니다.",
                "named": "좌측에 경유지 {waypoint_name}에 도착하였습니다."
            },
            "straight": {
                "default": "바로 앞에 {nth} 목적지가 있습니다.",
                "upcoming": "직진하시면 {nth} 목적지에 도착할 예정입니다.",
                "short": "도착하였습니다",
                "short-upcoming": "목적지에 곧 도착할 예정입니다.",
                "named": "정면에 경유지 {waypoint_name}에 도착하였습니다."
            }
        },
        "continue": {
            "default": {
                "default": "{modifier} 회전",
                "name": "{modifier} 회전하고 {way_name}로 직진해 주세요.",
                "destination": "{modifier} 회전하고 {destination}까지 가세요.",
                "exit": "{way_name} 쪽으로 {modifier} 회전 하세요."
            },
            "straight": {
                "default": "계속 직진해 주세요.",
                "name": "{way_name} 로 계속 직진해 주세요.",
                "destination": "{destination}까지 직진해 주세요.",
                "distance": "{distance}까지 직진해 주세요.",
                "namedistance": "{distance}까지 {way_name}로 가주세요."
            },
            "sharp left": {
                "default": "급좌회전 하세요.",
                "name": "급좌회전 하신 후 {way_name}로 가세요.",
                "destination": "급좌회전 하신 후 {destination}로 가세요."
            },
            "sharp right": {
                "default": "급우회전 하세요.",
                "name": "급우회전 하고 {way_name}로 가세요.",
                "destination": "급우회전 하신 후 {destination}로 가세요."
            },
            "slight left": {
                "default": "약간 좌회전하세요.",
                "name": "약간 좌회전 하고 {way_name}로 가세요.",
                "destination": "약간 좌회전 하신 후 {destination}로 가세요."
            },
            "slight right": {
                "default": "약간 우회전하세요.",
                "name": "약간 우회전 하고 {way_name}로 가세요.",
                "destination": "약간 우회전 하신 후 {destination}로 가세요."
            },
            "uturn": {
                "default": "유턴 하세요",
                "name": "유턴해서 {way_name}로 가세요.",
                "destination": "유턴하신 후 {destination}로 가세요."
            }
        },
        "depart": {
            "default": {
                "default": "{direction}로 가세요",
                "name": "{direction} 로 가서 {way_name} 를 이용하세요. ",
                "namedistance": "{direction}로 가서{way_name} 를 {distance}까지 가세요."
            }
        },
        "end of road": {
            "default": {
                "default": "{modifier} 회전하세요.",
                "name": "{modifier}회전하고 {way_name}로 가세요.",
                "destination": "{modifier}회전 하신 후 {destination}로 가세요."
            },
            "straight": {
                "default": "계속 직진해 주세요.",
                "name": "{way_name}로 계속 직진해 주세요.",
                "destination": "{destination}까지 직진해 주세요."
            },
            "uturn": {
                "default": "도로 끝까지 가서 유턴해 주세요.",
                "name": "도로 끝까지 가서 유턴해서 {way_name}로 가세요.",
                "destination": "도로 끝까지 가서 유턴해서 {destination} 까지 가세요."
            }
        },
        "fork": {
            "default": {
                "default": "갈림길에서 {modifier} 으로 가세요.",
                "name": "{modifier}하고 {way_name}로 가세요.",
                "destination": "{modifier}하고 {destination}까지 가세요."
            },
            "slight left": {
                "default": "갈림길에서 좌회전 하세요.",
                "name": "좌회전 해서 {way_name}로 가세요.",
                "destination": "좌회전 해서 {destination}까지 가세요."
            },
            "slight right": {
                "default": "갈림길에서 우회전 하세요.",
                "name": "우회전 해서 {way_name}로 가세요.",
                "destination": "우회전 해서 {destination}까지 가세요."
            },
            "sharp left": {
                "default": "갈림길에서 급좌회전 하세요.",
                "name": "급좌회전 해서 {way_name}로 가세요.",
                "destination": "급좌회전 해서 {destination}까지 가세요."
            },
            "sharp right": {
                "default": "갈림길에서 급우회전 하세요.",
                "name": "급우회전 해서 {way_name}로 가세요.",
                "destination": "급우회전 해서 {destination}까지 가세요."
            },
            "uturn": {
                "default": "유턴하세요.",
                "name": "유턴해서 {way_name}로 가세요.",
                "destination": "유턴해서 {destination}까지 가세요."
            }
        },
        "merge": {
            "default": {
                "default": "{modifier} 합류",
                "name": "{modifier} 합류하여 {way_name}로 가세요.",
                "destination": "{modifier} 합류하여 {destination}로 가세요."
            },
            "straight": {
                "default": "합류",
                "name": "{way_name}로 합류하세요.",
                "destination": "{destination}로 합류하세요."
            },
            "slight left": {
                "default": "좌측으로 합류하세요.",
                "name": "좌측{way_name}로 합류하세요.",
                "destination": "좌측으로 합류하여 {destination}까지 가세요."
            },
            "slight right": {
                "default": "우측으로 합류하세요.",
                "name": "우측{way_name}로 합류하세요.",
                "destination": "우측으로 합류하여 {destination}까지 가세요."
            },
            "sharp left": {
                "default": "좌측으로 합류하세요.",
                "name": "좌측{way_name}로 합류하세요.",
                "destination": "좌측으로 합류하여 {destination}까지 가세요."
            },
            "sharp right": {
                "default": "우측으로 합류하세요.",
                "name": "우측{way_name}로 합류하세요.",
                "destination": "우측으로 합류하여 {destination}까지 가세요."
            },
            "uturn": {
                "default": "유턴하세요.",
                "name": "유턴해서 {way_name}로 가세요.",
                "destination": "유턴해서 {destination}까지 가세요."
            }
        },
        "new name": {
            "default": {
                "default": "{modifier} 유지하세요.",
                "name": "{modifier} 유지해서 {way_name}로 가세요.",
                "destination": "{modifier} 유지해서 {destination}까지 가세요."
            },
            "straight": {
                "default": "직진해주세요.",
                "name": "{way_name}로 계속 가세요.",
                "destination": "{destination}까지 계속 가세요."
            },
            "sharp left": {
                "default": "급좌회전 하세요.",
                "name": "급좌회전 해서 {way_name}로 가세요.",
                "destination": "급좌회전 해서 {destination}까지 가세요."
            },
            "sharp right": {
                "default": "급우회전 하세요.",
                "name": "급우회전 해서 {way_name}로 가세요.",
                "destination": "급우회전 해서 {destination}까지 가세요."
            },
            "slight left": {
                "default": "약간 좌회전 해세요.",
                "name": "약간 좌회전해서 {way_name}로 가세요.",
                "destination": "약간 좌회전 해서 {destination}까지 가세요."
            },
            "slight right": {
                "default": "약간 우회전 해세요.",
                "name": "약간 우회전해서 {way_name}로 가세요.",
                "destination": "약간 우회전 해서 {destination}까지 가세요."
            },
            "uturn": {
                "default": "유턴해주세요.",
                "name": "유턴해서 {way_name}로 가세요.",
                "destination": "유턴해서 {destination}까지 가세요."
            }
        },
        "notification": {
            "default": {
                "default": "{modifier} 하세요.",
                "name": "{modifier}해서 {way_name}로 가세요.",
                "destination": "{modifier}해서 {destination}까지 가세요."
            },
            "uturn": {
                "default": "유턴하세요.",
                "name": "유턴해서 {way_name}로 가세요.",
                "destination": "유턴해서 {destination}까지 가세요."
            }
        },
        "off ramp": {
            "default": {
                "default": "램프로 진출해 주세요..",
                "name": "램프로 진출해서 {way_name}로 가세요.",
                "destination": "램프로 진출해서 {destination}까지 가세요.",
                "exit": "{exit} 출구로 나가세요.",
                "exit_destination": "{exit} 출구로 나가서 {destination}까지 가세요."
            },
            "left": {
                "default": "왼쪽의 램프로 진출해 주세요.",
                "name": "왼쪽의 램프로 진출해서 {way_name}로 가세요.",
                "destination": "왼쪽의 램프로 진출해서 {destination}까지 가세요.",
                "exit": "{exit} 왼쪽의 출구로 나가세요.",
                "exit_destination": "{exit} 왼쪽의 출구로 가나서 {destination}까지 가세요."
            },
            "right": {
                "default": "오른쪽의 램프로 진출해 주세요.",
                "name": "오른쪽의 램프로 진출해서 {way_name}로 가세요.",
                "destination": "오른쪽의 램프로 진출해서 {destination}까지 가세요.",
                "exit": "{exit} 오른쪽의 출구로 나가세요.",
                "exit_destination": "{exit} 오른쪽의 출구로 가나서 {destination}까지 가세요."
            },
            "sharp left": {
                "default": "왼쪽의 램프로 진출해 주세요.",
                "name": "왼쪽의 램프로 진출해서 {way_name}로 가세요.",
                "destination": "왼쪽의 램프로 진출해서 {destination}까지 가세요.",
                "exit": "{exit} 왼쪽의 출구로 나가세요.",
                "exit_destination": "{exit} 왼쪽의 출구로 가나서 {destination}까지 가세요."
            },
            "sharp right": {
                "default": "오른쪽의 램프로 진출해 주세요.",
                "name": "오른쪽의 램프로 진출해서 {way_name}로 가세요.",
                "destination": "오른쪽의 램프로 진출해서 {destination}까지 가세요.",
                "exit": "{exit} 오른쪽의 출구로 나가세요.",
                "exit_destination": "{exit} 오른쪽의 출구로 가나서 {destination}까지 가세요."
            },
            "slight left": {
                "default": "왼쪽의 램프로 진출해 주세요.",
                "name": "왼쪽의 램프로 진출해서 {way_name}로 가세요.",
                "destination": "왼쪽의 램프로 진출해서 {destination}까지 가세요.",
                "exit": "{exit} 왼쪽의 출구로 나가세요.",
                "exit_destination": "{exit} 왼쪽의 출구로 가나서 {destination}까지 가세요."
            },
            "slight right": {
                "default": "오른쪽의 램프로 진출해 주세요.",
                "name": "오른쪽의 램프로 진출해서 {way_name}로 가세요.",
                "destination": "오른쪽의 램프로 진출해서 {destination}까지 가세요.",
                "exit": "{exit} 오른쪽의 출구로 나가세요.",
                "exit_destination": "{exit} 오른쪽의 출구로 가나서 {destination}까지 가세요."
            }
        },
        "on ramp": {
            "default": {
                "default": "램프로 진입해 주세요..",
                "name": "램프로 진입해서 {way_name}로 가세요.",
                "destination": "램프로 진입해서 {destination}까지 가세요."
            },
            "left": {
                "default": "왼쪽의 램프로 진입해 주세요.",
                "name": "왼쪽의 램프로 진입해서 {way_name}로 가세요.",
                "destination": "왼쪽의 램프로 진입해서 {destination}까지 가세요."
            },
            "right": {
                "default": "오른쪽의 램프로 진입해 주세요.",
                "name": "오른쪽의 램프로 진입해서 {way_name}로 가세요.",
                "destination": "오른쪽의 램프로 진입해서 {destination}까지 가세요."
            },
            "sharp left": {
                "default": "왼쪽의 램프로 진입해 주세요.",
                "name": "왼쪽의 램프로 진입해서 {way_name}로 가세요.",
                "destination": "왼쪽의 램프로 진입해서 {destination}까지 가세요."
            },
            "sharp right": {
                "default": "오른쪽의 램프로 진입해 주세요.",
                "name": "오른쪽의 램프로 진입해서 {way_name}로 가세요.",
                "destination": "오른쪽의 램프로 진입해서 {destination}까지 가세요."
            },
            "slight left": {
                "default": "왼쪽의 램프로 진입해 주세요.",
                "name": "왼쪽의 램프로 진입해서 {way_name}로 가세요.",
                "destination": "왼쪽의 램프로 진입해서 {destination}까지 가세요."
            },
            "slight right": {
                "default": "오른쪽의 램프로 진입해 주세요.",
                "name": "오른쪽의 램프로 진입해서 {way_name}로 가세요.",
                "destination": "오른쪽의 램프로 진입해서 {destination}까지 가세요."
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "로터리로 진입하세요.",
                    "name": "로터리로 진입해서 {way_name} 나가세요.",
                    "destination": "로터리로 진입해서 {destination}로 나가세요."
                },
                "name": {
                    "default": "{rotary_name}로 진입하세요.",
                    "name": "{rotary_name}로 진입해서 {way_name}로 나가세요.",
                    "destination": "{rotary_name}로 진입해서 {destination}로 나가세요."
                },
                "exit": {
                    "default": "로터리로 진입해서 {exit_number} 출구로 나가세요.",
                    "name": "로터리로 진입해서 {exit_number} 출구로 나가 {way_name}로 가세요.",
                    "destination": "로터리로 진입해서 {exit_number} 출구로 나가 {destination}로 가세요."
                },
                "name_exit": {
                    "default": "{rotary_name}로 진입해서 {exit_number}번 출구로 나가세요.",
                    "name": "{rotary_name}로 진입해서 {exit_number}번 출구로 나가 {way_name}로 가세요.",
                    "destination": "{rotary_name}로 진입해서 {exit_number}번 출구로 나가 {destination}로 가세요."
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "로터리로 진입해서 {exit_number}로 나가세요.",
                    "name": "로터리로 진입해서 {exit_number}로 나가서 {way_name}로 가세요.",
                    "destination": "로터리로 진입해서 {exit_number}로 나가서 {destination}로 가세요."
                },
                "default": {
                    "default": "로터리로 진입하세요.",
                    "name": "로터리로 진입해서 {way_name} 나가세요.",
                    "destination": "로터리로 진입해서 {destination}로 나가세요."
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "{modifier} 하세요.",
                "name": "{modifier} 하시고 {way_name}로 가세요.",
                "destination": "{modifier} 하시고 {destination}까지 가세요."
            },
            "left": {
                "default": "좌회전 하세요.",
                "name": "좌회전 하시고 {way_name}로 가세요.",
                "destination": "좌회전 하시고 {destination}까지 가세요."
            },
            "right": {
                "default": "우회전 하세요.",
                "name": "우회전 하시고 {way_name}로 가세요.",
                "destination": "우회전 하시고 {destination}까지 가세요."
            },
            "straight": {
                "default": "직진 하세요.",
                "name": "직진하시고 {way_name}로 가세요.",
                "destination": "직진하시고 {destination}까지 가세요."
            }
        },
        "exit roundabout": {
            "default": {
                "default": "로타리에서 진출하세요.",
                "name": "로타리에서 진출해서 {way_name}로 가세요.",
                "destination": "로타리에서 진출해서 {destination}까지 가세요."
            }
        },
        "exit rotary": {
            "default": {
                "default": "로타리에서 진출하세요.",
                "name": "로타리에서 진출해서 {way_name}로 가세요.",
                "destination": "로타리에서 진출해서 {destination}까지 가세요."
            }
        },
        "turn": {
            "default": {
                "default": "{modifier} 하세요.",
                "name": "{modifier} 하시고 {way_name}로 가세요.",
                "destination": "{modifier} 하시고 {destination}까지 가세요."
            },
            "left": {
                "default": "좌회전 하세요.",
                "name": "좌회전 하시고 {way_name}로 가세요.",
                "destination": "좌회전 하시고 {destination}까지 가세요."
            },
            "right": {
                "default": "우회전 하세요.",
                "name": "우회전 하시고 {way_name}로 가세요.",
                "destination": "우회전 하시고 {destination}까지 가세요."
            },
            "straight": {
                "default": "직진 하세요.",
                "name": "직진하시고 {way_name}로 가세요.",
                "destination": "직진하시고 {destination}까지 가세요."
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "직진하세요."
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}

},{}],33:[function(require,module,exports){
module.exports={
    "meta": {
        "capitalizeFirstLetter": false
    },
    "v5": {
        "constants": {
            "ordinalize": {
                "1": "ပထမ",
                "2": "ဒုတိယ",
                "3": "တတိယ",
                "4": "စတုတၳ",
                "5": "ပဥၥမ",
                "6": "ဆဌမ",
                "7": "သတၱမ",
                "8": "အဌမ",
                "9": "နဝမ",
                "10": "ဒသမ"
            },
            "direction": {
                "north": "ေျမာက္အရပ္",
                "northeast": "အေရွ႕ေျမာက္အရပ္",
                "east": "အေရွ႕အရပ္",
                "southeast": "အေရွ႕ေတာင္အရပ္",
                "south": "ေတာင္အရပ္",
                "southwest": "အေနာက္ေတာင္အရပ္",
                "west": "အေနာက္အရပ္",
                "northwest": "အေနာက္ေျမာက္အရပ္"
            },
            "modifier": {
                "left": "ဘယ္ဘက္",
                "right": "ညာဘက္",
                "sharp left": "ဘယ္ဘက္ ေထာင့္ခ်ိဳး",
                "sharp right": "ညာဘက္ ေထာင္႔ခ်ိဳး",
                "slight left": "ဘယ္ဘက္ အနည္းငယ္",
                "slight right": "ညာဘက္ အနည္းငယ္",
                "straight": "ေျဖာင္႔ေျဖာင္႔တန္းတန္း",
                "uturn": "ဂ-ေကြ႔"
            },
            "lanes": {
                "xo": "ညာဘက္သို႕ဆက္သြားပါ",
                "ox": "ဘယ္ဘက္သို႕ဆက္သြားပါ",
                "xox": "အလယ္တြင္ဆက္ေနပါ",
                "oxo": "ဘယ္ သို႕မဟုတ္ ညာဘက္သို႕ ဆက္သြားပါ"
            }
        },
        "modes": {
            "ferry": {
                "default": "ဖယ္ရီ စီးသြားပါ",
                "name": "{way_name}ကို ဖယ္ရီစီးသြားပါ",
                "destination": "{destination}ဆီသို႕ ဖယ္ရီစီးသြားပါ"
            }
        },
        "phrase": {
            "two linked by distance": "{instruction_one}ျပီးေနာက္ {distance}အတြင္း {instruction_two}",
            "two linked": "{instruction_one}ျပီးေနာက္ {instruction_two}",
            "one in distance": "{distance}အတြင္း {instruction_one}",
            "name and ref": "{name}( {ref})",
            "exit with number": "{exit}မွထြက္ပါ"
        },
        "arrive": {
            "default": {
                "default": "{nth}သင္ သြားလိုေသာ ခရီးပန္းတိုင္သို႕ေရာက္ရွိျပီ",
                "upcoming": "သင္ သြားလိုေသာ {nth}ခရီးပန္းတိုင္သို႕ေရာက္လိမ့္မည္",
                "short": "သင္သြားလိုေသာ ေနရာသို႔ ေရာက္ရိွၿပီ",
                "short-upcoming": "သင္သြားလိုေသာ ေနရာသို႔ ေရာက္လိမ့္မည္",
                "named": "သင္ သည္ {waypoint_name} မွာ ေရာက္ရွိျပီ"
            },
            "left": {
                "default": "သင္ သြားလိုေသာ {nth}ခရီးပန္းတိုင္သို႕ဘယ္ဘက္တြင္ေရာက္ရွိျပီ",
                "upcoming": "သင္ သြားလိုေသာ {nth}ခရီးပန္းတိုင္သို႕ဘယ္ဘက္တြင္ေရာက္လိမ့္မည္",
                "short": "သင္သြားလိုေသာ ေနရာသို႔ ေရာက္ရိွၿပီ",
                "short-upcoming": "သင္သြားလိုေသာ ေနရာသို႔ ေရာက္လိမ့္မည္",
                "named": "သင္ သည္ {waypoint_name}မွာဘယ္ဘက္ေကြ႕ကာ ေရာက္ရွိျပီ"
            },
            "right": {
                "default": "သင္ သြားလိုေသာ {nth}ခရီးပန္းတိုင္သို႕ ညာဘက္ေကြ႕ကာ ေရာက္ရွိျပီ",
                "upcoming": "သင္ သြားလိုေသာ{nth} ခရီးပန္းတိုင္သို႕ ညာဘက္ေကြ႕ကာ ေရာက္လိမ့္မည္",
                "short": "သင္သြားလိုေသာ ေနရာသို႔ ေရာက္ရိွၿပီ",
                "short-upcoming": "သင္သြားလိုေသာ ေနရာသို႔ ေရာက္လိမ့္မည္",
                "named": "သင္ သည္ {waypoint_name} မွာညာဘက္ေကြ႕ကာ ေရာက္ရွိျပီ"
            },
            "sharp left": {
                "default": "သင္ သြားလိုေသာ {nth}ခရီးပန္းတိုင္သို႕ဘယ္ဘက္တြင္ေရာက္ရွိျပီ",
                "upcoming": "သင္ သြားလိုေသာ {nth}ခရီးပန္းတိုင္သို႕ဘယ္ဘက္တြင္ေရာက္ရွိျပီ",
                "short": "သင္သြားလိုေသာ ေနရာသို႔ ေရာက္ရိွၿပီ",
                "short-upcoming": "သင္သြားလိုေသာ ေနရာသို႔ ေရာက္လိမ့္မည္",
                "named": "သင္ သည္ {waypoint_name}မွာဘယ္ဘက္ေကြ႕ကာ ေရာက္ရွိျပီ"
            },
            "sharp right": {
                "default": "သင္ သြားလိုေသာ {nth}ခရီးပန္းတိုင္သို႕ ညာဘက္ေကြ႕ကာ ေရာက္ရွိျပီ",
                "upcoming": "သင္ သြားလိုေသာ{nth} ခရီးပန္းတိုင္သို႕ ညာဘက္ေကြ႕ကာ ေရာက္လိမ့္မည္",
                "short": "သင္သြားလိုေသာ ေနရာသို႔ ေရာက္ရိွၿပီ",
                "short-upcoming": "သင္သြားလိုေသာ ေနရာသို႔ ေရာက္လိမ့္မည္",
                "named": "သင္ သည္ {waypoint_name} မွာညာဘက္ေကြ႕ကာ ေရာက္ရွိျပီ"
            },
            "slight right": {
                "default": "သင္ သြားလိုေသာ {nth}ခရီးပန္းတိုင္သို႕ ညာဘက္ေကြ႕ကာ ေရာက္ရွိျပီ",
                "upcoming": "သင္ သြားလိုေသာ{nth} ခရီးပန္းတိုင္သို႕ ညာဘက္ေကြ႕ကာ ေရာက္လိမ့္မည္",
                "short": "သင္သြားလိုေသာ ေနရာသို႔ ေရာက္ရိွၿပီ",
                "short-upcoming": "သင္သြားလိုေသာ ေနရာသို႔ ေရာက္လိမ့္မည္",
                "named": "သင္ သည္ {waypoint_name} မွာညာဘက္ေကြ႕ကာ ေရာက္ရွိျပီ"
            },
            "slight left": {
                "default": "သင္ သြားလိုေသာ {nth}ခရီးပန္းတိုင္သို႕ဘယ္ဘက္တြင္ေရာက္ရွိျပီ",
                "upcoming": "သင္ သြားလိုေသာ {nth}ခရီးပန္းတိုင္သို႕ဘယ္ဘက္တြင္ေရာက္ရွိျပီ",
                "short": "သင္သြားလိုေသာ ေနရာသို႔ ေရာက္ရွိျပီ",
                "short-upcoming": "သင္သြားလိုေသာ ေနရာသို႔ ေရာက္လိမ့္မည္",
                "named": "သင္ သည္ {waypoint_name}မွာဘယ္ဘက္ေကြ႕ကာ ေရာက္ရွိျပီ"
            },
            "straight": {
                "default": "သင္ သြားလိုေသာ {nth}ခရီးပန္းတိုင္သို႕တည့္တည့္သြားကာရာက္ရွိျပီ",
                "upcoming": "သင္ သြားလိုေသာ {nth}ခရီးပန္းတိုင္သို႕တည့္တည့္သြားကာရာက္ရွိမည္",
                "short": "သင္သြားလိုေသာ ေနရာသို႔ ေရာက္ရွိျပီ",
                "short-upcoming": "သင္သြားလိုေသာ ေနရာသို႔ ေရာက္လိမ့္မည္",
                "named": "သင္ သည္ {waypoint_name}မွာတည့္တည့္သြားကာ ေရာက္ရွိျပီ"
            }
        },
        "continue": {
            "default": {
                "default": "{modifier}ကိုလွည့္ပါ",
                "name": "{way_name}​​ေပၚတြင္ေနရန္ {modifier}ကိုလွည့္ပါ",
                "destination": "{destination}ဆီသို႕ {modifier}ကို လွည္႕ပါ",
                "exit": "{way_name}​​ေပၚသို႕ {modifier}ကိုလွည့္ပါ"
            },
            "straight": {
                "default": "ေျဖာင္႔ေျဖာင္႔တန္းတန္း ဆက္သြားပါ",
                "name": "{way_name}​​ေပၚတြင္ေနရန္တည္တည့္ဆက္သြာပါ",
                "destination": "{destination}ဆီသို႕ဆက္သြားပါ",
                "distance": "{distance}ေလာက္ တည့္တည့္ ဆက္သြားပါ",
                "namedistance": "{way_name}​​ေပၚတြင္{distance}ေလာက္ဆက္သြားပါ"
            },
            "sharp left": {
                "default": "ဘယ္ဘက္ေထာင့္ခ်ိဳးေကြ႕ပါ",
                "name": "{way_name}​ေပၚတြင္ေနရန္ ဘယ္ဘက္ေထာင့္ခ်ိဳးေကြ႕ပါ",
                "destination": "{destination}ဆီသို႕ ဘယ္ဘက္ေထာင့္ခ်ိဳးေကြ႕ပါ"
            },
            "sharp right": {
                "default": "ညာဘက္ ေထာင္႔ခ်ိဳးေကြ႕ပါ",
                "name": "{way_name}​ေပၚတြင္ေနရန္ ညာဘက္ေထာင့္ခ်ိဳးေကြ႕ပါ",
                "destination": "{destination}ဆီသို႕ ညာဘက္ေထာင့္ခ်ိဳးေကြ႕ပါ"
            },
            "slight left": {
                "default": "ဘယ္ဘက္ အနည္းငယ္ေကြ႕ပါ",
                "name": "{way_name}​ေပၚတြင္ေနရန္ ဘယ္ဘက္အနည္းငယ္ေကြ႕ပါ",
                "destination": "{destination}ဆီသို႕ ဘယ္ဘက္အနည္းငယ္ခ်ိဳးေကြ႕ပါ"
            },
            "slight right": {
                "default": "ညာဘက္ အနည္းငယ္ခ်ိဳးေကြ႕ပါ",
                "name": "{way_name}​ေပၚတြင္ေနရန္ ညာဘက္အနည္းငယ္ေကြ႕ပါ",
                "destination": "{destination}ဆီသို႕ ညာဘက္အနည္းငယ္ခ်ိဳးေကြ႕ပါ"
            },
            "uturn": {
                "default": "ဂ-ေကြ႔ ေကြ႔ပါ",
                "name": "{way_name}လမ္းဘက္သို႕ ဂ-ေကြ႕ေကြ႕ျပီးဆက္သြားပါ",
                "destination": "{destination}ဆီသို႕ ဂေကြ႕ခ်ိဳးေကြ႕ပါ"
            }
        },
        "depart": {
            "default": {
                "default": "{direction}သို႕ ဦးတည္ပါ",
                "name": "{direction}ကို {way_name}အေပၚတြင္ ဦးတည္ပါ",
                "namedistance": "{direction}ကို {way_name}အေပၚတြင္{distance}ေလာက္ ဦးတည္ဆက္သြားပါ"
            }
        },
        "end of road": {
            "default": {
                "default": "{modifier}သို႕လွည့္ပါ",
                "name": "{way_name}​​ေပၚသို႕ {modifier}ကိုလွည့္ပါ",
                "destination": "{destination}ဆီသို႕ {modifier}ကို လွည္႕ပါ"
            },
            "straight": {
                "default": "ေျဖာင္႔ေျဖာင္႔တန္းတန္း ဆက္သြားပါ",
                "name": "{way_name}​​ေပၚသို႕တည့္တည့္ဆက္သြားပါ",
                "destination": "{destination}ဆီသို႕တည့္တည့္ဆက္သြားပါ"
            },
            "uturn": {
                "default": "လမ္းအဆံုးတြင္ ဂ-ေကြ႕ေကြ႕ပါ",
                "name": "လမ္းအဆံုးတြင္ {way_name}​​ေပၚသို႕ဂ-ေကြ႕ေကြ႕ပါ",
                "destination": "လမ္းအဆံုးတြင္{destination}ဆီသို႕ ဂေကြ႕ခ်ိဳးေကြ႕ပါ"
            }
        },
        "fork": {
            "default": {
                "default": "လမ္းဆံုလမ္းခြတြင္ {modifier}ကိုဆက္သြားပါ",
                "name": "{way_name}​​ေပၚသို႕ {modifier}ကိုဆက္သြားပါ",
                "destination": "{destination}ဆီသို႕ {modifier}ကို ဆက္သြားပါ"
            },
            "slight left": {
                "default": "လမ္းဆံုလမ္းခြတြင္ဘယ္ဘက္ကိုဆက္သြားပါ",
                "name": "{way_name}​​ေပၚသို႕ဘယ္ဘက္ကိုဆက္သြားပါ",
                "destination": "{destination}ဆီသို႕ဘယ္ဘက္ကို ဆက္သြားပါ"
            },
            "slight right": {
                "default": "လမ္းဆံုလမ္းခြတြင္ညာဘက္ကိုဆက္သြားပါ",
                "name": "{way_name}​​ေပၚသို႕ညာဘက္ကိုဆက္သြားပါ",
                "destination": "{destination}ဆီသို႕ညာဘက္ကို ဆက္သြားပါ"
            },
            "sharp left": {
                "default": "လမ္းဆံုလမ္းခြတြင္ဘယ္ဘက္ေထာင့္ခ်ိဳးကိုသြားပါ",
                "name": "{way_name}​ေပၚတြင္ေနရန္ ဘယ္ဘက္ေထာင့္ခ်ိဳးယူပါ",
                "destination": "{destination}ဆီသို႕ဘယ္ဘက္ေထာင့္ခ်ိဳး သြားပါ"
            },
            "sharp right": {
                "default": "လမ္းဆံုလမ္းခြတြင္ညာဘက္ေထာင့္ခ်ိဳးကိုသြားပါ",
                "name": "{way_name}​ေပၚသို႕ ညာဘက္ေထာင့္ခ်ိဳးယူပါ",
                "destination": "{destination}ဆီသို႕ညာဘက္ေထာင့္ခ်ိဳး သြားပါ"
            },
            "uturn": {
                "default": "ဂ-ေကြ႔ ေကြ႔ပါ",
                "name": "{way_name}သို႕ဂ-ေကြ႕ေကြ႕ပါ",
                "destination": "{destination}ဆီသို႕ ဂေကြ႕ခ်ိဳးေကြ႕ပါ"
            }
        },
        "merge": {
            "default": {
                "default": "{modifier}ကိုလာေရာက္ေပါင္းဆံုပါ",
                "name": "{way_name}​​ေပၚသို႕ {modifier}ကိုလာေရာက္ေပါင္းဆံုပါ",
                "destination": "{destination}ဆီသို႕ {modifier}ကို လာေရာက္ေပါင္းဆံုပါ"
            },
            "straight": {
                "default": "လာေရာက္ေပါင္းဆံုပါ",
                "name": "{way_name}​​ေပၚသို႕လာေရာက္ေပါင္းဆံုပါ",
                "destination": "{destination}ဆီသို႕ လာေရာက္ေပါင္းဆံုပါ"
            },
            "slight left": {
                "default": "ဘယ္ဘက္သို႕လာေရာက္ေပါင္းဆံုပါ",
                "name": "{way_name}​​ေပၚသို႕ဘယ္ဘက္ကိုလာေရာက္ေပါင္းဆံုပါ",
                "destination": "{destination}ဆီသို႕ဘယ္ဘက္ကို လာေရာက္ေပါင္းဆံုပါ"
            },
            "slight right": {
                "default": "ညာဘက္သို႕လာေရာက္ေပါင္းဆံုပါ",
                "name": "{way_name}​​ေပၚသို႕ညာဘက္ကိုလာေရာက္ေပါင္းဆံုပါ",
                "destination": "{destination}ဆီသို႕ညာဘက္ကို လာေရာက္ေပါင္းဆံုပါ"
            },
            "sharp left": {
                "default": "ဘယ္ဘက္သို႕လာေရာက္ေပါင္းဆံုပါ",
                "name": "{way_name}​​ေပၚသို႕ဘယ္ဘက္ကိုလာေရာက္ေပါင္းဆံုပါ",
                "destination": "{destination}ဆီသို႕ဘယ္ဘက္ကို လာေရာက္ေပါင္းဆံုပါ"
            },
            "sharp right": {
                "default": "ညာဘက္သို႕လာေရာက္ေပါင္းဆံုပါ",
                "name": "{way_name}​​ေပၚသို႕ညာဘက္ကိုလာေရာက္ေပါင္းဆံုပါ",
                "destination": "{destination}ဆီသို႕ညာဘက္ကို လာေရာက္ေပါင္းဆံုပါ"
            },
            "uturn": {
                "default": "ဂ-ေကြ႔ ေကြ႕ပါ",
                "name": "{way_name}လမ္းဘက္သို႔ ဂ-ေကြ႔ ေကြ႔ပါ ",
                "destination": "{destination}ဆီသို႕ ဂေကြ႕ခ်ိဳးေကြ႕ပါ"
            }
        },
        "new name": {
            "default": {
                "default": "{modifier}ကိုဆက္သြားပါ",
                "name": "{way_name}​​ေပၚသို႕ {modifier}ကိုဆက္သြားပါ",
                "destination": "{destination}ဆီသို႕ {modifier}ကို ဆက္သြားပါ"
            },
            "straight": {
                "default": "ေျဖာင္႔ေျဖာင္႔တန္းတန္း ဆက္သြားပါ",
                "name": "{way_name}​​ေပၚသို႕ဆက္သြားပါ",
                "destination": "{destination}ဆီသို႕ဆက္သြားပါ"
            },
            "sharp left": {
                "default": "ဘယ္ဘက္ေထာင့္ခ်ိဳးယူပါ",
                "name": "{way_name}​ေပၚတြင္ေနရန္ ဘယ္ဘက္ေထာင့္ခ်ိဳးယူပါ",
                "destination": "{destination}ဆီသို႕ဘယ္ဘက္ေထာင့္ခ်ိဳး သြားပါ"
            },
            "sharp right": {
                "default": "ညာဘက္ ေထာင္႔ခ်ိဳးယူပါ",
                "name": "{way_name}​ေပၚသို႕ ညာဘက္ေထာင့္ခ်ိဳးယူပါ",
                "destination": "{destination}ဆီသို႕ညာဘက္ေထာင့္ခ်ိဳး သြားပါ"
            },
            "slight left": {
                "default": "ဘယ္ဘက္ အနည္းငယ္ဆက္သြားပါ",
                "name": "{way_name}​​ေပၚသို႕ဘယ္ဘက္ အနည္းငယ္ဆက္သြားပါ",
                "destination": "{destination}ဆီသို႕ဘယ္ဘက္အနည္းငယ္ဆက္သြားပါ"
            },
            "slight right": {
                "default": "ညာဘက္ အနည္းငယ္ဆက္သြားပါ",
                "name": "{way_name}​​ေပၚသို႕ညာဘက္ အနည္းငယ္ဆက္သြားပါ",
                "destination": "{destination}ဆီသို႕ညာဘက္အနည္းငယ္ဆက္သြားပါ"
            },
            "uturn": {
                "default": "ဂ-ေကြ႔ ေကြ႔ပါ",
                "name": "{way_name}လမ္းဘက္သို႔ ဂ-ေကြ႔ ေကြ႔ပါ",
                "destination": "{destination}ဆီသို႕ ဂေကြ႕ခ်ိဳးေကြ႕ပါ"
            }
        },
        "notification": {
            "default": {
                "default": "{modifier}ကိုဆက္သြားပါ",
                "name": "{way_name}​​ေပၚသို႕ {modifier}ကိုဆက္သြားပါ",
                "destination": "{destination}ဆီသို႕ {modifier}ကို ဆက္သြားပါ"
            },
            "uturn": {
                "default": "ဂ-ေကြ႔ ေကြ႔ပါ",
                "name": "{way_name}လမ္းဘက္သို႔ ဂ-ေကြ႔ ေကြ႔ပါ",
                "destination": "{destination}ဆီသို႕ ဂေကြ႕ခ်ိဳးေကြ႕ပါ"
            }
        },
        "off ramp": {
            "default": {
                "default": "ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "name": "{way_name}​ေပၚသို႕ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "destination": "{destination}ဆီသို႕ ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "exit": "{exit}ကို ယူပါ",
                "exit_destination": "{destination}ဆီသို႕ {exit} ကိုယူပါ"
            },
            "left": {
                "default": "ဘယ္ဘက္သို႕ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "name": "{way_name}​ေပၚသို႕ဘယ္ဘက္ ​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "destination": "{destination}ဆီသို႕ ဘယ္ဘက္​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "exit": "ဘယ္ဘက္တြင္{exit}ကို ယူပါ",
                "exit_destination": "{destination}ဆီသို႕ဘယ္ဘက္မွ {exit} ကိုယူပါ"
            },
            "right": {
                "default": "ညာဘက္သို႕ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "name": "{way_name}​ေပၚသို႕ညာဘက္ ​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "destination": "{destination}ဆီသို႕ ညာဘက္​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "exit": "ညာဘက္တြင္{exit}ကို ယူပါ",
                "exit_destination": "{destination}ဆီသို႕ညာဘက္မွ {exit} ကိုယူပါ"
            },
            "sharp left": {
                "default": "ဘယ္ဘက္သို႕ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "name": "{way_name}​ေပၚသို႕ဘယ္ဘက္ ​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "destination": "{destination}ဆီသို႕ ဘယ္ဘက္​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "exit": "ဘယ္ဘက္တြင္{exit}ကို ယူပါ",
                "exit_destination": "{destination}ဆီသို႕ဘယ္ဘက္မွ {exit} ကိုယူပါ"
            },
            "sharp right": {
                "default": "ညာဘက္သို႕ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "name": "{way_name}​ေပၚသို႕ညာဘက္ ​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "destination": "{destination}ဆီသို႕ ညာဘက္​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "exit": "ညာဘက္တြင္{exit}ကို ယူပါ",
                "exit_destination": "{destination}ဆီသို႕ညာဘက္မွ {exit} ကိုယူပါ"
            },
            "slight left": {
                "default": "ဘယ္ဘက္သို႕ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "name": "{way_name}​ေပၚသို႕ဘယ္ဘက္ ​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "destination": "{destination}ဆီသို႕ ဘယ္ဘက္​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "exit": "ဘယ္ဘက္တြင္{exit}ကို ယူပါ",
                "exit_destination": "{destination}ဆီသို႕ဘယ္ဘက္မွ {exit} ကိုယူပါ"
            },
            "slight right": {
                "default": "ညာဘက္သို႕ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "name": "{way_name}​ေပၚသို႕ညာဘက္ ​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "destination": "{destination}ဆီသို႕ ညာဘက္​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "exit": "ညာဘက္တြင္{exit}ကို ယူပါ",
                "exit_destination": "{destination}ဆီသို႕ညာဘက္မွ {exit} ကိုယူပါ"
            }
        },
        "on ramp": {
            "default": {
                "default": "ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "name": "{way_name}​ေပၚသို႕ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "destination": "{destination}ဆီသို႕ ခ်ဥ္းကပ္လမ္းကိုယူပါ"
            },
            "left": {
                "default": "ဘယ္ဘက္သို႕ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "name": "{way_name}​ေပၚသို႕ဘယ္ဘက္ ​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "destination": "{destination}ဆီသို႕ ဘယ္ဘက္​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ"
            },
            "right": {
                "default": "ညာဘက္သို႕ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "name": "{way_name}​ေပၚသို႕ညာဘက္ ​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "destination": "{destination}ဆီသို႕ ညာဘက္​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ"
            },
            "sharp left": {
                "default": "ဘယ္ဘက္သို႕ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "name": "{way_name}​ေပၚသို႕ဘယ္ဘက္ ​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "destination": "{destination}ဆီသို႕ ဘယ္ဘက္​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ"
            },
            "sharp right": {
                "default": "ညာဘက္သို႕ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "name": "{way_name}​ေပၚသို႕ညာဘက္ ​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "destination": "{destination}ဆီသို႕ ညာဘက္​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ"
            },
            "slight left": {
                "default": "ဘယ္ဘက္သို႕ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "name": "{way_name}​ေပၚသို႕ဘယ္ဘက္ ​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "destination": "{destination}ဆီသို႕ ဘယ္ဘက္​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ"
            },
            "slight right": {
                "default": "ညာဘက္သို႕ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "name": "{way_name}​ေပၚသို႕ညာဘက္ ​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ",
                "destination": "{destination}ဆီသို႕ ညာဘက္​ေပၚတြင္ခ်ဥ္းကပ္လမ္းကိုယူပါ"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "အဝိုင္းပတ္သို႕ဝင္ပါ",
                    "name": "{way_name}ေပၚသို႔အဝိုင္းပတ္လမ္းမွထြက္ပါ ",
                    "destination": "{destination}ေပၚသို႔အဝိုင္းပတ္လမ္းမွထြက္ပါ"
                },
                "name": {
                    "default": "{rotary_name}သို႕ဝင္ပါ",
                    "name": "{rotary_name}အဝိုင္းပတ္ဝင္ျပီး{way_name}ေပၚသို႕ထြက္ပါ",
                    "destination": "{rotary_name}အဝိုင္းပတ္ဝင္ျပီး{destination}ဆီသို႕ထြက္ပါ"
                },
                "exit": {
                    "default": "အဝိုင္းပတ္ဝင္ျပီး{exit_number}ကိုယူကာျပန္ထြက္ပါ",
                    "name": "အဝိုင္းပတ္သို႕ဝင္ျပီး{exit_number}ကိုယူကာ{way_name}ေပၚသို႕ထြက္ပါ",
                    "destination": "အဝိုင္းပတ္ဝင္ျပီး{exit_number}ကိုယူကာ{destination}ဆီသို႕ထြက္ပါ"
                },
                "name_exit": {
                    "default": "{rotary_name}ကိုဝင္ျပီး {exit_number}ကိုယူကာထြက္ပါ",
                    "name": "{rotary_name}ကိုဝင္ျပီး{exit_number}ကိုယူကာ{way_name}ေပၚသို႕ထြက္ပါ",
                    "destination": "{rotary_name}ဝင္ျပီး{exit_number}ကိုယူကာ{destination}ဆီသို႕ထြက္ပါ"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "{exit_number}ေပၚသို႔အဝိုင္းပတ္လမ္းမွထြက္ပါ",
                    "name": "အဝိုင္းပတ္ဝင္ျပီး{exit_number}ကိုယူကာ{way_name}ေပၚသို႕ထြက္ပါ",
                    "destination": "အဝိုင္းပတ္ဝင္ျပီး{exit_number}ကိုယူကာ{destination}ဆီသို႕ထြက္ပါ"
                },
                "default": {
                    "default": "အဝိုင္းပတ္ဝင္ပါ",
                    "name": "{way_name}ေပၚသို႔အဝိုင္းပတ္လမ္းမွထြက္ပါ",
                    "destination": "{destination}ေပၚသို႔အဝိုင္းပတ္လမ္းမွထြက္ပါ"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "{modifier}ကိုလွည့္ပါ ",
                "name": "{modifier}​ေပၚသို{way_name}ကိုဆက္သြားပါ ",
                "destination": "{modifier}ဆီသို႕{destination}ကို ဆက္သြားပါ "
            },
            "left": {
                "default": "ဘယ္ဘက္သို႕ျပန္လွည္႔ပါ",
                "name": "{way_name}​ေပၚသို႕ဘယ္ဘက္ကိုဆက္သြားပါ ",
                "destination": "{destination}ဆီသို႕ဘယ္ဘက္မွ ေကြ႔ပါ"
            },
            "right": {
                "default": "ညာဘက္သို႔ျပန္လွည္႔ပါ",
                "name": "{way_name}​ေပၚသို႕ညာဘက္ကိုလာေရာက္ေပါင္းဆံုပါ ",
                "destination": "{destination}ညာဘက္သို႔ ေကြ႔ပါ"
            },
            "straight": {
                "default": "ေျဖာင္႔ေျဖာင္႔တန္းတန္း ဆက္သြားပါ",
                "name": "{way_name}​​ေပၚသို႕တည့္တည့္ဆက္သြားပါ",
                "destination": "{destination}ဆီသို႕တည့္တည့္ဆက္သြားပါ"
            }
        },
        "exit roundabout": {
            "default": {
                "default": "အဝိုင္းပတ္လမ္းမွထြက္ပါ",
                "name": "{way_name}ေပၚသို႔အဝိုင္းပတ္လမ္းမွထြက္ပါ",
                "destination": "ဦးတည္အဝိုင္းပတ္လမ္းမွထြက္ပါ{destination}"
            }
        },
        "exit rotary": {
            "default": {
                "default": "အဝိုင္းပတ္လမ္းမွထြက္ပါဦးတည္အဝိုင္းပတ္လမ္းမွထြက္ပါ",
                "name": "{way_name}ေပၚသို႔အဝိုင္းပတ္လမ္းမွထြက္ပါ",
                "destination": "ဦးတည္အဝိုင္းပတ္လမ္းမွထြက္ပါ{destination}"
            }
        },
        "turn": {
            "default": {
                "default": "{modifier}ကိုလွည့္ပါ ",
                "name": "{modifier}​ေပၚသို{way_name}ကိုဆက္သြားပါ ",
                "destination": "{modifier}ဆီသို႕{destination}ကို ဆက္သြားပါ "
            },
            "left": {
                "default": "ဘယ္ဘက္သို႕ျပန္လွည္႔ပါ",
                "name": "{way_name}​ေပၚသို႕ဘယ္ဘက္ကိုဆက္သြားပါ ",
                "destination": "{destination}ဘယ္ဘက္သို႔ ေကြ႔ပါ"
            },
            "right": {
                "default": "ညာဘက္သို႔ျပန္လွည္႔ပါ",
                "name": "{way_name}​ေပၚသို႕ညာဘက္ကိုလာေရာက္ေပါင္းဆံုပါ ",
                "destination": "{destination}ညာဘက္သို႔ ေကြ႔ပါ"
            },
            "straight": {
                "default": "တည္႔တည္႔သြားပါ",
                "name": "{way_name}",
                "destination": "{destination}ဆီသို႕တည့္တည့္သြားပါ"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "ေျဖာင္႔ေျဖာင္႔တန္းတန္း ဆက္သြားပါ"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}

},{}],34:[function(require,module,exports){
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
                "sharp left": "scherpe bocht naar links",
                "sharp right": "scherpe bocht naar rechts",
                "slight left": "iets naar links",
                "slight right": "iets naar rechts",
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
                "default": "Neem de veerpont",
                "name": "Neem de veerpont {way_name}",
                "destination": "Neem de veerpont richting {destination}"
            }
        },
        "phrase": {
            "two linked by distance": "{instruction_one}, dan na {distance}, {instruction_two}",
            "two linked": "{instruction_one}, daarna {instruction_two}",
            "one in distance": "Over {distance}, {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "afslag {exit}"
        },
        "arrive": {
            "default": {
                "default": "Je bent gearriveerd op de {nth} bestemming.",
                "upcoming": "U arriveert op de {nth} bestemming",
                "short": "U bent gearriveerd",
                "short-upcoming": "U zult aankomen",
                "named": "U bent gearriveerd bij {waypoint_name}"
            },
            "left": {
                "default": "Je bent gearriveerd. De {nth} bestemming bevindt zich links.",
                "upcoming": "Uw {nth} bestemming bevindt zich aan de linkerkant",
                "short": "U bent gearriveerd",
                "short-upcoming": "U zult aankomen",
                "named": "U bent gearriveerd bij {waypoint_name}, de bestemming is aan de linkerkant"
            },
            "right": {
                "default": "Je bent gearriveerd. De {nth} bestemming bevindt zich rechts.",
                "upcoming": "Uw {nth} bestemming bevindt zich aan de rechterkant",
                "short": "U bent gearriveerd",
                "short-upcoming": "U zult aankomen",
                "named": "U bent gearriveerd bij {waypoint_name}, de bestemming is aan de  rechterkant"
            },
            "sharp left": {
                "default": "Je bent gearriveerd. De {nth} bestemming bevindt zich links.",
                "upcoming": "Uw {nth} bestemming bevindt zich aan de linkerkant",
                "short": "U bent gearriveerd",
                "short-upcoming": "U zult aankomen",
                "named": "U bent gearriveerd bij {waypoint_name}, de bestemming is aan de linkerkant"
            },
            "sharp right": {
                "default": "Je bent gearriveerd. De {nth} bestemming bevindt zich rechts.",
                "upcoming": "Uw {nth} bestemming bevindt zich aan de rechterkant",
                "short": "U bent gearriveerd",
                "short-upcoming": "U zult aankomen",
                "named": "U bent gearriveerd bij {waypoint_name},  de bestemming is aan de rechterkant"
            },
            "slight right": {
                "default": "Je bent gearriveerd. De {nth} bestemming bevindt zich rechts.",
                "upcoming": "Uw {nth} bestemming bevindt zich aan de rechterkant",
                "short": "U bent gearriveerd",
                "short-upcoming": "U zult aankomen",
                "named": "U bent gearriveerd bij {waypoint_name},  de bestemming is aan de rechterkant"
            },
            "slight left": {
                "default": "Je bent gearriveerd. De {nth} bestemming bevindt zich links.",
                "upcoming": "Uw {nth} bestemming bevindt zich aan de linkerkant",
                "short": "U bent gearriveerd",
                "short-upcoming": "U zult aankomen",
                "named": "U bent gearriveerd bij {waypoint_name},  de bestemming is aan de linkerkant"
            },
            "straight": {
                "default": "Je bent gearriveerd. De {nth} bestemming bevindt zich voor je.",
                "upcoming": "Uw {nth} bestemming is recht voor u",
                "short": "U bent gearriveerd",
                "short-upcoming": "U zult aankomen",
                "named": "U bent gearriveerd bij {waypoint_name}, de bestemming is recht voor u"
            }
        },
        "continue": {
            "default": {
                "default": "Ga {modifier}",
                "name": "Sla {modifier} om op {way_name} te blijven",
                "destination": "Ga {modifier} richting {destination}",
                "exit": "Ga {modifier} naar {way_name}"
            },
            "straight": {
                "default": "Ga rechtdoor",
                "name": "Blijf rechtdoor gaan op {way_name}",
                "destination": "Ga rechtdoor richting {destination}",
                "distance": "Ga rechtdoor voor {distance}",
                "namedistance": "Ga verder op {way_name} voor {distance}"
            },
            "sharp left": {
                "default": "Linksaf",
                "name": "Sla scherp links af om op {way_name} te blijven",
                "destination": "Linksaf richting {destination}"
            },
            "sharp right": {
                "default": "Rechtsaf",
                "name": "Sla scherp rechts af om op {way_name} te blijven",
                "destination": "Rechtsaf richting {destination}"
            },
            "slight left": {
                "default": "Ga links",
                "name": "Links afbuigen om op {way_name} te blijven",
                "destination": "Rechts afbuigen om op {destination} te blijven"
            },
            "slight right": {
                "default": "Rechts afbuigen",
                "name": "Rechts afbuigen om op {way_name} te blijven",
                "destination": "Rechts afbuigen richting {destination}"
            },
            "uturn": {
                "default": "Keer om",
                "name": "Draai om en ga verder op {way_name}",
                "destination": "Keer om richting {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Vertrek in {direction}elijke richting",
                "name": "Neem {way_name} in {direction}elijke richting",
                "namedistance": "Ga richting {direction} op {way_name} voor {distance}"
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
                "name": "Houd {modifier} aan, tot {way_name}",
                "destination": "Houd {modifier}, in de richting van {destination}"
            },
            "slight left": {
                "default": "Links aanhouden op de splitsing",
                "name": "Houd links aan, tot {way_name}",
                "destination": "Houd links aan, richting {destination}"
            },
            "slight right": {
                "default": "Rechts aanhouden op de splitsing",
                "name": "Houd rechts aan, tot {way_name}",
                "destination": "Houd rechts aan, richting {destination}"
            },
            "sharp left": {
                "default": "Neem bij de splitsing, een scherpe bocht, naar links ",
                "name": "Neem een scherpe bocht naar links, tot aan {way_name}",
                "destination": "Neem een scherpe bocht naar links, richting {destination}"
            },
            "sharp right": {
                "default": "Neem  op de splitsing, een scherpe bocht, naar rechts",
                "name": "Neem een scherpe bocht naar rechts, tot aan {way_name}",
                "destination": "Neem een scherpe bocht naar rechts, richting {destination}"
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
            "straight": {
                "default": "Samenvoegen",
                "name": "Ga verder op {way_name}",
                "destination": "Ga verder richting {destination}"
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
            "straight": {
                "default": "Ga in de aangegeven richting",
                "name": "Ga rechtdoor naar {way_name}",
                "destination": "Ga rechtdoor richting {destination}"
            },
            "sharp left": {
                "default": "Neem een scherpe bocht, naar links",
                "name": "Linksaf naar {way_name}",
                "destination": "Linksaf richting {destination}"
            },
            "sharp right": {
                "default": "Neem een scherpe bocht, naar rechts",
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
                "destination": "Neem de afrit richting {destination}",
                "exit": "Neem afslag {exit}",
                "exit_destination": "Neem afslag {exit} richting {destination}"
            },
            "left": {
                "default": "Neem de afrit links",
                "name": "Neem de afrit links naar {way_name}",
                "destination": "Neem de afrit links richting {destination}",
                "exit": "Neem afslag {exit} aan de linkerkant",
                "exit_destination": "Neem afslag {exit} aan de linkerkant richting {destination}"
            },
            "right": {
                "default": "Neem de afrit rechts",
                "name": "Neem de afrit rechts naar {way_name}",
                "destination": "Neem de afrit rechts richting {destination}",
                "exit": "Neem afslag {exit} aan de rechterkant",
                "exit_destination": "Neem afslag {exit} aan de rechterkant richting {destination}"
            },
            "sharp left": {
                "default": "Neem de afrit links",
                "name": "Neem de afrit links naar {way_name}",
                "destination": "Neem de afrit links richting {destination}",
                "exit": "Neem afslag {exit} aan de linkerkant",
                "exit_destination": "Neem afslag {exit} aan de linkerkant richting {destination}"
            },
            "sharp right": {
                "default": "Neem de afrit rechts",
                "name": "Neem de afrit rechts naar {way_name}",
                "destination": "Neem de afrit rechts richting {destination}",
                "exit": "Neem afslag {exit} aan de rechterkant",
                "exit_destination": "Neem afslag {exit} aan de rechterkant richting {destination}"
            },
            "slight left": {
                "default": "Neem de afrit links",
                "name": "Neem de afrit links naar {way_name}",
                "destination": "Neem de afrit links richting {destination}",
                "exit": "Neem afslag {exit} aan de linkerkant",
                "exit_destination": "Neem afslag {exit} aan de linkerkant richting {destination}"
            },
            "slight right": {
                "default": "Neem de afrit rechts",
                "name": "Neem de afrit rechts naar {way_name}",
                "destination": "Neem de afrit rechts richting {destination}",
                "exit": "Neem afslag {exit} aan de rechterkant",
                "exit_destination": "Neem afslag {exit} aan de rechterkant richting {destination}"
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
                    "default": "Betreedt de rotonde",
                    "name": "Betreedt rotonde en sla af op {way_name}",
                    "destination": "Betreedt rotonde en sla af richting {destination}"
                },
                "name": {
                    "default": "Ga het knooppunt {rotary_name} op",
                    "name": "Verlaat het knooppunt {rotary_name} naar {way_name}",
                    "destination": "Verlaat het knooppunt {rotary_name} richting {destination}"
                },
                "exit": {
                    "default": "Betreedt rotonde en neem afslag {exit_number}",
                    "name": "Betreedt rotonde en neem afslag {exit_number} naar {way_name}",
                    "destination": "Betreedt rotonde en neem afslag {exit_number} richting {destination}"
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
                    "default": "Betreedt rotonde en neem afslag {exit_number}",
                    "name": "Betreedt rotonde en neem afslag {exit_number} naar {way_name}",
                    "destination": "Betreedt rotonde en neem afslag {exit_number} richting {destination}"
                },
                "default": {
                    "default": "Betreedt de rotonde",
                    "name": "Betreedt rotonde en sla af op {way_name}",
                    "destination": "Betreedt rotonde en sla af richting {destination}"
                }
            }
        },
        "roundabout turn": {
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
                "default": "Ga in de aangegeven richting",
                "name": "Ga naar {way_name}",
                "destination": "Ga richting {destination}"
            }
        },
        "exit roundabout": {
            "default": {
                "default": "Verlaat de rotonde",
                "name": "Verlaat de rotonde en ga verder op {way_name}",
                "destination": "Verlaat de rotonde richting {destination}"
            }
        },
        "exit rotary": {
            "default": {
                "default": "Verlaat de rotonde",
                "name": "Verlaat de rotonde en ga verder op {way_name}",
                "destination": "Verlaat de rotonde richting {destination}"
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

},{}],35:[function(require,module,exports){
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
                "north": "nord",
                "northeast": "nordøst",
                "east": "øst",
                "southeast": "sørøst",
                "south": "sør",
                "southwest": "sørvest",
                "west": "vest",
                "northwest": "nordvest"
            },
            "modifier": {
                "left": "venstre",
                "right": "høyre",
                "sharp left": "skarp venstre",
                "sharp right": "skarp høyre",
                "slight left": "litt til venstre",
                "slight right": "litt til høyre",
                "straight": "rett frem",
                "uturn": "U-sving"
            },
            "lanes": {
                "xo": "Hold til høyre",
                "ox": "Hold til venstre",
                "xox": "Hold deg i midten",
                "oxo": "Hold til venstre eller høyre"
            }
        },
        "modes": {
            "ferry": {
                "default": "Ta ferja",
                "name": "Ta ferja {way_name}",
                "destination": "Ta ferja til {destination}"
            }
        },
        "phrase": {
            "two linked by distance": "{instruction_one}, deretter {instruction_two} om {distance}",
            "two linked": "{instruction_one}, deretter {instruction_two}",
            "one in distance": "Om {distance}, {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "avkjørsel {exit}"
        },
        "arrive": {
            "default": {
                "default": "Du har ankommet din {nth} destinasjon",
                "upcoming": "Du vil ankomme din {nth} destinasjon",
                "short": "Du har ankommet",
                "short-upcoming": "Du vil ankomme",
                "named": "Du har ankommet {waypoint_name}"
            },
            "left": {
                "default": "Du har ankommet din {nth} destinasjon, på din venstre side",
                "upcoming": "Du vil ankomme din {nth} destinasjon, på din venstre side",
                "short": "Du har ankommet",
                "short-upcoming": "Du vil ankomme",
                "named": "Du har ankommet {waypoint_name}, på din venstre side"
            },
            "right": {
                "default": "Du har ankommet din {nth} destinasjon, på din høyre side",
                "upcoming": "Du vil ankomme din {nth} destinasjon, på din høyre side",
                "short": "Du har ankommet",
                "short-upcoming": "Du vil ankomme",
                "named": "Du har ankommet {waypoint_name}, på din høyre side"
            },
            "sharp left": {
                "default": "Du har ankommet din {nth} destinasjon, på din venstre side",
                "upcoming": "Du vil ankomme din {nth} destinasjon, på din venstre side",
                "short": "Du har ankommet",
                "short-upcoming": "Du vil ankomme",
                "named": "Du har ankommet {waypoint_name}, på din venstre side"
            },
            "sharp right": {
                "default": "Du har ankommet din {nth} destinasjon, på din høyre side",
                "upcoming": "Du vil ankomme din {nth} destinasjon, på din høyre side",
                "short": "Du har ankommet",
                "short-upcoming": "Du vil ankomme",
                "named": "Du har ankommet {waypoint_name}, på din høyre side"
            },
            "slight right": {
                "default": "Du har ankommet din {nth} destinasjon, på din høyre side",
                "upcoming": "Du vil ankomme din {nth} destinasjon, på din høyre side",
                "short": "Du har ankommet",
                "short-upcoming": "Du vil ankomme",
                "named": "Du har ankommet {waypoint_name}, på din høyre side"
            },
            "slight left": {
                "default": "Du har ankommet din {nth} destinasjon, på din venstre side",
                "upcoming": "Du vil ankomme din {nth} destinasjon, på din venstre side",
                "short": "Du har ankommet",
                "short-upcoming": "Du vil ankomme",
                "named": "Du har ankommet {waypoint_name}, på din venstre side"
            },
            "straight": {
                "default": "Du har ankommet din {nth} destinasjon, rett forut",
                "upcoming": "Du vil ankomme din {nth} destinasjon, rett forut",
                "short": "Du har ankommet",
                "short-upcoming": "Du vil ankomme",
                "named": "Du har ankommet {waypoint_name}, rett forut"
            }
        },
        "continue": {
            "default": {
                "default": "Ta til {modifier}",
                "name": "Ta til {modifier} for å bli værende på {way_name}",
                "destination": "Ta til {modifier} mot {destination}",
                "exit": "Ta til {modifier} inn på {way_name}"
            },
            "straight": {
                "default": "Fortsett rett frem",
                "name": "Fortsett rett frem for å bli værende på {way_name}",
                "destination": "Fortsett mot {destination}",
                "distance": "Fortsett rett frem, {distance} ",
                "namedistance": "Fortsett på {way_name}, {distance}"
            },
            "sharp left": {
                "default": "Sving skarpt til venstre",
                "name": "Sving skarpt til venstre for å bli værende på {way_name}",
                "destination": "Sving skarpt til venstre mot {destination}"
            },
            "sharp right": {
                "default": "Sving skarpt til høyre",
                "name": "Sving skarpt til høyre for å bli værende på {way_name}",
                "destination": "Sving skarpt mot {destination}"
            },
            "slight left": {
                "default": "Sving svakt til venstre",
                "name": "Sving svakt til venstre for å bli værende på {way_name}",
                "destination": "Sving svakt til venstre mot {destination}"
            },
            "slight right": {
                "default": "Sving svakt til høyre",
                "name": "Sving svakt til høyre for å bli værende på {way_name}",
                "destination": "Sving svakt til høyre mot {destination}"
            },
            "uturn": {
                "default": "Ta en U-sving",
                "name": "Ta en U-sving og fortsett på {way_name}",
                "destination": "Ta en U-sving mot {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Kjør i retning {direction}",
                "name": "Kjør i retning {direction} på {way_name}",
                "namedistance": "Kjør i retning {direction} på {way_name}, {distance}"
            }
        },
        "end of road": {
            "default": {
                "default": "Sving {modifier}",
                "name": "Ta til {modifier} inn på {way_name}",
                "destination": "Sving {modifier} mot {destination}"
            },
            "straight": {
                "default": "Fortsett rett frem",
                "name": "Fortsett rett frem til  {way_name}",
                "destination": "Fortsett rett frem mot {destination}"
            },
            "uturn": {
                "default": "Ta en U-sving i enden av veien",
                "name": "Ta en U-sving til {way_name} i enden av veien",
                "destination": "Ta en U-sving mot {destination} i enden av veien"
            }
        },
        "fork": {
            "default": {
                "default": "Hold til {modifier} i veikrysset",
                "name": "Hold til {modifier} inn på {way_name}",
                "destination": "Hold til {modifier} mot {destination}"
            },
            "slight left": {
                "default": "Hold til venstre i veikrysset",
                "name": "Hold til venstre inn på {way_name}",
                "destination": "Hold til venstre mot {destination}"
            },
            "slight right": {
                "default": "Hold til høyre i veikrysset",
                "name": "Hold til høyre inn på {way_name}",
                "destination": "Hold til høyre mot {destination}"
            },
            "sharp left": {
                "default": "Sving skarpt til venstre i veikrysset",
                "name": "Sving skarpt til venstre inn på {way_name}",
                "destination": "Sving skarpt til venstre mot {destination}"
            },
            "sharp right": {
                "default": "Sving skarpt til høyre i veikrysset",
                "name": "Sving skarpt til høyre inn på {way_name}",
                "destination": "Svings skarpt til høyre mot {destination}"
            },
            "uturn": {
                "default": "Ta en U-sving",
                "name": "Ta en U-sving til {way_name}",
                "destination": "Ta en U-sving mot {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Hold {modifier} kjørefelt",
                "name": "Hold {modifier} kjørefelt inn på {way_name}",
                "destination": "Hold {modifier} kjørefelt mot {destination}"
            },
            "straight": {
                "default": "Hold kjørefelt",
                "name": "Hold kjørefelt inn på {way_name}",
                "destination": "Hold kjørefelt mot {destination}"
            },
            "slight left": {
                "default": "Hold venstre kjørefelt",
                "name": "Hold venstre kjørefelt inn på {way_name}",
                "destination": "Hold venstre kjørefelt mot {destination}"
            },
            "slight right": {
                "default": "Hold høyre kjørefelt",
                "name": "Hold høyre kjørefelt inn på {way_name}",
                "destination": "Hold høyre kjørefelt mot {destination}"
            },
            "sharp left": {
                "default": "Hold venstre kjørefelt",
                "name": "Hold venstre kjørefelt inn på {way_name}",
                "destination": "Hold venstre kjørefelt mot {destination}"
            },
            "sharp right": {
                "default": "Hold høyre kjørefelt",
                "name": "Hold høyre kjørefelt inn på {way_name}",
                "destination": "Hold høyre kjørefelt mot {destination}"
            },
            "uturn": {
                "default": "Ta en U-sving",
                "name": "Ta en U-sving til {way_name}",
                "destination": "Ta en U-sving mot {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Fortsett {modifier}",
                "name": "Fortsett {modifier} til {way_name}",
                "destination": "Fortsett {modifier} mot  {destination}"
            },
            "straight": {
                "default": "Fortsett rett frem",
                "name": "Fortsett inn på {way_name}",
                "destination": "Fortsett mot {destination}"
            },
            "sharp left": {
                "default": "Sving skarpt til venstre",
                "name": "Sving skarpt til venstre inn på {way_name}",
                "destination": "Sving skarpt til venstre mot {destination}"
            },
            "sharp right": {
                "default": "Sving skarpt til høyre",
                "name": "Sving skarpt til høyre inn på {way_name}",
                "destination": "Svings skarpt til høyre mot {destination}"
            },
            "slight left": {
                "default": "Fortsett litt mot venstre",
                "name": "Fortsett litt mot venstre til {way_name}",
                "destination": "Fortsett litt mot venstre mot {destination}"
            },
            "slight right": {
                "default": "Fortsett litt mot høyre",
                "name": "Fortsett litt mot høyre til {way_name}",
                "destination": "Fortsett litt mot høyre mot {destination}"
            },
            "uturn": {
                "default": "Ta en U-sving",
                "name": "Ta en U-sving til {way_name}",
                "destination": "Ta en U-sving mot {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Fortsett {modifier}",
                "name": "Fortsett {modifier} til {way_name}",
                "destination": "Fortsett {modifier} mot  {destination}"
            },
            "uturn": {
                "default": "Ta en U-sving",
                "name": "Ta en U-sving til {way_name}",
                "destination": "Ta en U-sving mot {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Ta avkjørselen",
                "name": "Ta avkjørselen inn på {way_name}",
                "destination": "Ta avkjørselen mot {destination}",
                "exit": "Ta avkjørsel {exit}",
                "exit_destination": "Ta avkjørsel {exit} mot {destination}"
            },
            "left": {
                "default": "Ta avkjørselen på venstre side",
                "name": "Ta avkjørselen på venstre side inn på {way_name}",
                "destination": "Ta avkjørselen på venstre side mot {destination}",
                "exit": "Ta avkjørsel {exit} på venstre side",
                "exit_destination": "Ta avkjørsel {exit} på venstre side mot {destination}"
            },
            "right": {
                "default": "Ta avkjørselen på høyre side",
                "name": "Ta avkjørselen på høyre side inn på {way_name}",
                "destination": "Ta avkjørselen på høyre side mot {destination}",
                "exit": "Ta avkjørsel {exit} på høyre side",
                "exit_destination": "Ta avkjørsel {exit} på høyre side mot {destination}"
            },
            "sharp left": {
                "default": "Ta avkjørselen på venstre side",
                "name": "Ta avkjørselen på venstre side inn på {way_name}",
                "destination": "Ta avkjørselen på venstre side mot {destination}",
                "exit": "Ta avkjørsel {exit} på venstre side",
                "exit_destination": "Ta avkjørsel {exit} på venstre side mot {destination}"
            },
            "sharp right": {
                "default": "Ta avkjørselen på høyre side",
                "name": "Ta avkjørselen på høyre side inn på {way_name}",
                "destination": "Ta avkjørselen på høyre side mot {destination}",
                "exit": "Ta avkjørsel {exit} på høyre side",
                "exit_destination": "Ta avkjørsel {exit} på høyre side mot {destination}"
            },
            "slight left": {
                "default": "Ta avkjørselen på venstre side",
                "name": "Ta avkjørselen på venstre side inn på {way_name}",
                "destination": "Ta avkjørselen på venstre side mot {destination}",
                "exit": "Ta avkjørsel {exit} på venstre side",
                "exit_destination": "Ta avkjørsel {exit} på venstre side mot {destination}"
            },
            "slight right": {
                "default": "Ta avkjørselen på høyre side",
                "name": "Ta avkjørselen på høyre side inn på {way_name}",
                "destination": "Ta avkjørselen på høyre side mot {destination}",
                "exit": "Ta avkjørsel {exit} på høyre side",
                "exit_destination": "Ta avkjørsel {exit} på høyre side mot {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Ta avkjørselen",
                "name": "Ta avkjørselen inn på {way_name}",
                "destination": "Ta avkjørselen mot {destination}"
            },
            "left": {
                "default": "Ta avkjørselen på venstre side",
                "name": "Ta avkjørselen på venstre side inn på {way_name}",
                "destination": "Ta avkjørselen på venstre side mot {destination}"
            },
            "right": {
                "default": "Ta avkjørselen på høyre side",
                "name": "Ta avkjørselen på høyre side inn på {way_name}",
                "destination": "Ta avkjørselen på høyre side mot {destination}"
            },
            "sharp left": {
                "default": "Ta avkjørselen på venstre side",
                "name": "Ta avkjørselen på venstre side inn på {way_name}",
                "destination": "Ta avkjørselen på venstre side mot {destination}"
            },
            "sharp right": {
                "default": "Ta avkjørselen på høyre side",
                "name": "Ta avkjørselen på høyre side inn på {way_name}",
                "destination": "Ta avkjørselen på høyre side mot {destination}"
            },
            "slight left": {
                "default": "Ta avkjørselen på venstre side",
                "name": "Ta avkjørselen på venstre side inn på {way_name}",
                "destination": "Ta avkjørselen på venstre side mot {destination}"
            },
            "slight right": {
                "default": "Ta avkjørselen på høyre side",
                "name": "Ta avkjørselen på høyre side inn på {way_name}",
                "destination": "Ta avkjørselen på høyre side mot {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Kjør inn i rundkjøringen",
                    "name": "Kjør inn i rundkjøringen og deretter ut på {way_name}",
                    "destination": "Kjør inn i rundkjøringen og deretter ut mot {destination}"
                },
                "name": {
                    "default": "Kjør inn i {rotary_name}",
                    "name": "Kjør inn i {rotary_name} og deretter ut på {way_name}",
                    "destination": "Kjør inn i {rotary_name} og deretter ut mot {destination}"
                },
                "exit": {
                    "default": "Kjør inn i rundkjøringen og ta {exit_number} avkjørsel",
                    "name": "Kjør inn i rundkjøringen og ta {exit_number} avkjørsel ut på {way_name}",
                    "destination": "Kjør inn i rundkjøringen og ta {exit_number} avkjørsel ut mot {destination} "
                },
                "name_exit": {
                    "default": "Kjør inn i {rotary_name} og ta {exit_number} avkjørsel",
                    "name": "Kjør inn i {rotary_name} og ta {exit_number} avkjørsel inn på {way_name}",
                    "destination": "Kjør inn i {rotary_name} og ta {exit_number} avkjørsel mot {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "Kjør inn i rundkjøringen og ta {exit_number} avkjørsel",
                    "name": "Kjør inn i rundkjøringen og ta {exit_number} avkjørsel inn på {way_name}",
                    "destination": "Kjør inn i rundkjøringen og ta {exit_number} avkjørsel ut mot {destination} "
                },
                "default": {
                    "default": "Kjør inn i rundkjøringen",
                    "name": "Kjør inn i rundkjøringen og deretter ut på {way_name}",
                    "destination": "Kjør inn i rundkjøringen og deretter ut mot {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "Ta en {modifier}",
                "name": "Ta en {modifier} inn på {way_name}",
                "destination": "Ta en {modifier} mot {destination}"
            },
            "left": {
                "default": "Sving til venstre",
                "name": "Sving til venstre inn på {way_name}",
                "destination": "Sving til venstre mot {destination}"
            },
            "right": {
                "default": "Sving til høyre",
                "name": "Sving til høyre inn på {way_name}",
                "destination": "Sving til høyre mot {destination}"
            },
            "straight": {
                "default": "Fortsett rett frem",
                "name": "Fortsett rett frem til  {way_name}",
                "destination": "Fortsett rett frem mot {destination}"
            }
        },
        "exit roundabout": {
            "default": {
                "default": "Kjør ut av rundkjøringen",
                "name": "Kjør ut av rundkjøringen og inn på {way_name}",
                "destination": "Kjør ut av rundkjøringen mot {destination}"
            }
        },
        "exit rotary": {
            "default": {
                "default": "Kjør ut av rundkjøringen",
                "name": "Kjør ut av rundkjøringen og inn på {way_name}",
                "destination": "Kjør ut av rundkjøringen mot {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Ta en {modifier}",
                "name": "Ta en {modifier} inn på {way_name}",
                "destination": "Ta en {modifier} mot {destination}"
            },
            "left": {
                "default": "Sving til venstre",
                "name": "Sving til venstre inn på {way_name}",
                "destination": "Sving til venstre mot {destination}"
            },
            "right": {
                "default": "Sving til høyre",
                "name": "Sving til høyre inn på {way_name}",
                "destination": "Sving til høyre mot {destination}"
            },
            "straight": {
                "default": "Kjør rett frem",
                "name": "Kjør rett frem og inn på {way_name}",
                "destination": "Kjør rett frem mot {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Fortsett rett frem"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}

},{}],36:[function(require,module,exports){
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
        "phrase": {
            "two linked by distance": "{instruction_one}, następnie za {distance} {instruction_two}",
            "two linked": "{instruction_one}, następnie {instruction_two}",
            "one in distance": "Za {distance}, {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "exit {exit}"
        },
        "arrive": {
            "default": {
                "default": "Dojechano do miejsca docelowego {nth}",
                "upcoming": "Dojechano do miejsca docelowego {nth}",
                "short": "Dojechano do miejsca docelowego {nth}",
                "short-upcoming": "Dojechano do miejsca docelowego {nth}",
                "named": "Dojechano do {waypoint_name}"
            },
            "left": {
                "default": "Dojechano do miejsca docelowego {nth}, po lewej stronie",
                "upcoming": "Dojechano do miejsca docelowego {nth}, po lewej stronie",
                "short": "Dojechano do miejsca docelowego {nth}",
                "short-upcoming": "Dojechano do miejsca docelowego {nth}",
                "named": "Dojechano do {waypoint_name}, po lewej stronie"
            },
            "right": {
                "default": "Dojechano do miejsca docelowego {nth}, po prawej stronie",
                "upcoming": "Dojechano do miejsca docelowego {nth}, po prawej stronie",
                "short": "Dojechano do miejsca docelowego {nth}",
                "short-upcoming": "Dojechano do miejsca docelowego {nth}",
                "named": "Dojechano do {waypoint_name}, po prawej stronie"
            },
            "sharp left": {
                "default": "Dojechano do miejsca docelowego {nth}, po lewej stronie",
                "upcoming": "Dojechano do miejsca docelowego {nth}, po lewej stronie",
                "short": "Dojechano do miejsca docelowego {nth}",
                "short-upcoming": "Dojechano do miejsca docelowego {nth}",
                "named": "Dojechano do {waypoint_name}, po lewej stronie"
            },
            "sharp right": {
                "default": "Dojechano do miejsca docelowego {nth}, po prawej stronie",
                "upcoming": "Dojechano do miejsca docelowego {nth}, po prawej stronie",
                "short": "Dojechano do miejsca docelowego {nth}",
                "short-upcoming": "Dojechano do miejsca docelowego {nth}",
                "named": "Dojechano do {waypoint_name}, po prawej stronie"
            },
            "slight right": {
                "default": "Dojechano do miejsca docelowego {nth}, po prawej stronie",
                "upcoming": "Dojechano do miejsca docelowego {nth}, po prawej stronie",
                "short": "Dojechano do miejsca docelowego {nth}",
                "short-upcoming": "Dojechano do miejsca docelowego {nth}",
                "named": "Dojechano do {waypoint_name}, po prawej stronie"
            },
            "slight left": {
                "default": "Dojechano do miejsca docelowego {nth}, po lewej stronie",
                "upcoming": "Dojechano do miejsca docelowego {nth}, po lewej stronie",
                "short": "Dojechano do miejsca docelowego {nth}",
                "short-upcoming": "Dojechano do miejsca docelowego {nth}",
                "named": "Dojechano do {waypoint_name}, po lewej stronie"
            },
            "straight": {
                "default": "Dojechano do miejsca docelowego {nth} , prosto",
                "upcoming": "Dojechano do miejsca docelowego {nth} , prosto",
                "short": "Dojechano do miejsca docelowego {nth}",
                "short-upcoming": "Dojechano do miejsca docelowego {nth}",
                "named": "Dojechano do {waypoint_name}, prosto"
            }
        },
        "continue": {
            "default": {
                "default": "Skręć {modifier}",
                "name": "Skręć w {modifier}, aby pozostać na {way_name}",
                "destination": "Skręć {modifier} w kierunku {destination}",
                "exit": "Skręć {modifier} na {way_name}"
            },
            "straight": {
                "default": "Kontynuuj prosto",
                "name": "Jedź dalej prosto, aby pozostać na {way_name}",
                "destination": "Kontynuuj w kierunku {destination}",
                "distance": "Jedź dalej prosto przez {distance}",
                "namedistance": "Jedź dalej {way_name} przez {distance}"
            },
            "sharp left": {
                "default": "Skręć ostro w lewo",
                "name": "Skręć w lewo w ostry zakręt, aby pozostać na {way_name}",
                "destination": "Skręć ostro w lewo w kierunku {destination}"
            },
            "sharp right": {
                "default": "Skręć ostro w prawo",
                "name": "Skręć w prawo w ostry zakręt, aby pozostać na {way_name}",
                "destination": "Skręć ostro w prawo w kierunku {destination}"
            },
            "slight left": {
                "default": "Skręć w lewo w łagodny zakręt",
                "name": "Skręć w lewo w łagodny zakręt, aby pozostać na {way_name}",
                "destination": "Skręć w lewo w łagodny zakręt na {destination}"
            },
            "slight right": {
                "default": "Skręć w prawo w łagodny zakręt",
                "name": "Skręć w prawo w łagodny zakręt, aby pozostać na {way_name}",
                "destination": "Skręć w prawo w łagodny zakręt na {destination}"
            },
            "uturn": {
                "default": "Zawróć",
                "name": "Zawróć i jedź dalej {way_name}",
                "destination": "Zawróć w kierunku {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Kieruj się {direction}",
                "name": "Kieruj się {direction} na {way_name}",
                "namedistance": "Head {direction} on {way_name} for {distance}"
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
                "name": "Skręć ostro w lewo w {way_name}",
                "destination": "Skręć ostro w lewo w kierunku {destination}"
            },
            "sharp right": {
                "default": "Na rozwidleniu skręć ostro w prawo",
                "name": "Skręć ostro w prawo na {way_name}",
                "destination": "Skręć ostro w prawo w kierunku {destination}"
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
            "straight": {
                "default": "Włącz się prosto",
                "name": "Włącz się prosto na {way_name}",
                "destination": "Włącz się prosto w kierunku {destination}"
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
            "straight": {
                "default": "Kontynuuj prosto",
                "name": "Kontynuuj na {way_name}",
                "destination": "Kontynuuj w kierunku {destination}"
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
                "exit": "Zjedź zjazdem {exit}",
                "exit_destination": "Zjedź zjazdem {exit} na {destination}"
            },
            "left": {
                "default": "Weź zjazd po lewej",
                "name": "Weź zjazd po lewej na {way_name}",
                "destination": "Weź zjazd po lewej w kierunku {destination}",
                "exit": "Zjedź zjazdem {exit} po lewej stronie",
                "exit_destination": "Zjedź zjazdem {exit} po lewej stronie na {destination}"
            },
            "right": {
                "default": "Weź zjazd po prawej",
                "name": "Weź zjazd po prawej na {way_name}",
                "destination": "Weź zjazd po prawej w kierunku {destination}",
                "exit": "Zjedź zjazdem {exit} po prawej stronie",
                "exit_destination": "Zjedź zjazdem {exit} po prawej stronie na {destination}"
            },
            "sharp left": {
                "default": "Weź zjazd po lewej",
                "name": "Weź zjazd po lewej na {way_name}",
                "destination": "Weź zjazd po lewej w kierunku {destination}",
                "exit": "Zjedź zjazdem {exit} po lewej stronie",
                "exit_destination": "Zjedź zjazdem {exit} po lewej stronie na {destination}"
            },
            "sharp right": {
                "default": "Weź zjazd po prawej",
                "name": "Weź zjazd po prawej na {way_name}",
                "destination": "Weź zjazd po prawej w kierunku {destination}",
                "exit": "Zjedź zjazdem {exit} po prawej stronie",
                "exit_destination": "Zjedź zjazdem {exit} po prawej stronie na {destination}"
            },
            "slight left": {
                "default": "Weź zjazd po lewej",
                "name": "Weź zjazd po lewej na {way_name}",
                "destination": "Weź zjazd po lewej w kierunku {destination}",
                "exit": "Zjedź zjazdem {exit} po lewej stronie",
                "exit_destination": "Zjedź zjazdem {exit} po lewej stronie na {destination}"
            },
            "slight right": {
                "default": "Weź zjazd po prawej",
                "name": "Weź zjazd po prawej na {way_name}",
                "destination": "Weź zjazd po prawej w kierunku {destination}",
                "exit": "Zjedź zjazdem {exit} po prawej stronie",
                "exit_destination": "Zjedź zjazdem {exit} po prawej stronie na {destination}"
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
                "default": "Kontynuuj prosto",
                "name": "Kontynuuj prosto na {way_name}",
                "destination": "Kontynuuj prosto w kierunku {destination}"
            }
        },
        "exit roundabout": {
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
                "default": "Kontynuuj prosto",
                "name": "Kontynuuj prosto na {way_name}",
                "destination": "Kontynuuj prosto w kierunku {destination}"
            }
        },
        "exit rotary": {
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

},{}],37:[function(require,module,exports){
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
                "sharp left": "fechada à esquerda",
                "sharp right": "fechada à direita",
                "slight left": "suave à esquerda",
                "slight right": "suave à direita",
                "straight": "em frente",
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
        "phrase": {
            "two linked by distance": "{instruction_one}, então, em {distance}, {instruction_two}",
            "two linked": "{instruction_one}, então {instruction_two}",
            "one in distance": "Em {distance}, {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "saída {exit}"
        },
        "arrive": {
            "default": {
                "default": "Você chegou ao seu {nth} destino",
                "upcoming": "Você chegará ao seu {nth} destino",
                "short": "Você chegou",
                "short-upcoming": "Você vai chegar",
                "named": "Você chegou a {waypoint_name}"
            },
            "left": {
                "default": "Você chegou ao seu {nth} destino, à esquerda",
                "upcoming": "Você chegará ao seu {nth} destino, à esquerda",
                "short": "Você chegou",
                "short-upcoming": "Você vai chegar",
                "named": "Você chegou {waypoint_name}, à esquerda"
            },
            "right": {
                "default": "Você chegou ao seu {nth} destino, à direita",
                "upcoming": "Você chegará ao seu {nth} destino, à direita",
                "short": "Você chegou",
                "short-upcoming": "Você vai chegar",
                "named": "Você chegou {waypoint_name}, à direita"
            },
            "sharp left": {
                "default": "Você chegou ao seu {nth} destino, à esquerda",
                "upcoming": "Você chegará ao seu {nth} destino, à esquerda",
                "short": "Você chegou",
                "short-upcoming": "Você vai chegar",
                "named": "Você chegou {waypoint_name}, à esquerda"
            },
            "sharp right": {
                "default": "Você chegou ao seu {nth} destino, à direita",
                "upcoming": "Você chegará ao seu {nth} destino, à direita",
                "short": "Você chegou",
                "short-upcoming": "Você vai chegar",
                "named": "Você chegou {waypoint_name}, à direita"
            },
            "slight right": {
                "default": "Você chegou ao seu {nth} destino, à direita",
                "upcoming": "Você chegará ao seu {nth} destino, à direita",
                "short": "Você chegou",
                "short-upcoming": "Você vai chegar",
                "named": "Você chegou {waypoint_name}, à direita"
            },
            "slight left": {
                "default": "Você chegou ao seu {nth} destino, à esquerda",
                "upcoming": "Você chegará ao seu {nth} destino, à esquerda",
                "short": "Você chegou",
                "short-upcoming": "Você vai chegar",
                "named": "Você chegou {waypoint_name}, à esquerda"
            },
            "straight": {
                "default": "Você chegou ao seu {nth} destino, em frente",
                "upcoming": "Você vai chegar ao seu {nth} destino, em frente",
                "short": "Você chegou",
                "short-upcoming": "Você vai chegar",
                "named": "You have arrived at {waypoint_name}, straight ahead"
            }
        },
        "continue": {
            "default": {
                "default": "Vire {modifier}",
                "name": "Vire {modifier} para manter-se na {way_name}",
                "destination": "Vire {modifier} sentido {destination}",
                "exit": "Vire {modifier} em {way_name}"
            },
            "straight": {
                "default": "Continue em frente",
                "name": "Continue em frente para manter-se na {way_name}",
                "destination": "Continue em direção à {destination}",
                "distance": "Continue em frente por {distance}",
                "namedistance": "Continue na {way_name} por {distance}"
            },
            "sharp left": {
                "default": "Faça uma curva fechada a esquerda",
                "name": "Faça uma curva fechada a esquerda para manter-se na {way_name}",
                "destination": "Faça uma curva fechada a esquerda sentido {destination}"
            },
            "sharp right": {
                "default": "Faça uma curva fechada a direita",
                "name": "Faça uma curva fechada a direita para manter-se na {way_name}",
                "destination": "Faça uma curva fechada a direita sentido {destination}"
            },
            "slight left": {
                "default": "Faça uma curva suave a esquerda",
                "name": "Faça uma curva suave a esquerda para manter-se na {way_name}",
                "destination": "Faça uma curva suave a esquerda em direção a {destination}"
            },
            "slight right": {
                "default": "Faça uma curva suave a direita",
                "name": "Faça uma curva suave a direita para manter-se na {way_name}",
                "destination": "Faça uma curva suave a direita em direção a {destination}"
            },
            "uturn": {
                "default": "Faça o retorno",
                "name": "Faça o retorno e continue em {way_name}",
                "destination": "Faça o retorno sentido {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Siga {direction}",
                "name": "Siga {direction} em {way_name}",
                "namedistance": "Siga {direction} na {way_name} por {distance}"
            }
        },
        "end of road": {
            "default": {
                "default": "Vire {modifier}",
                "name": "Vire {modifier} em {way_name}",
                "destination": "Vire {modifier} sentido {destination}"
            },
            "straight": {
                "default": "Continue em frente",
                "name": "Continue em frente em {way_name}",
                "destination": "Continue em frente sentido {destination}"
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
                "default": "Faça uma curva fechada à esquerda na bifurcação",
                "name": "Faça uma curva fechada à esquerda em {way_name}",
                "destination": "Faça uma curva fechada à esquerda sentido {destination}"
            },
            "sharp right": {
                "default": "Faça uma curva fechada à direita na bifurcação",
                "name": "Faça uma curva fechada à direita em {way_name}",
                "destination": "Faça uma curva fechada à direita sentido {destination}"
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
            "straight": {
                "default": "Mesclar",
                "name": "Entre reto na {way_name}",
                "destination": "Entre reto em direção à {destination}"
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
                "default": "Faça uma curva fechada à esquerda",
                "name": "Faça uma curva fechada à esquerda em {way_name}",
                "destination": "Faça uma curva fechada à esquerda sentido {destination}"
            },
            "sharp right": {
                "default": "Faça uma curva fechada à direita",
                "name": "Faça uma curva fechada à direita em {way_name}",
                "destination": "Faça uma curva fechada à direita sentido {destination}"
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
                    "name": "Entre na rotatória e saia na {way_name}",
                    "destination": "Entre na rotatória e saia sentido {destination}"
                },
                "name": {
                    "default": "Entre em {rotary_name}",
                    "name": "Entre em {rotary_name} e saia em {way_name}",
                    "destination": "Entre em {rotary_name} e saia sentido {destination}"
                },
                "exit": {
                    "default": "Entre na rotatória e pegue a {exit_number} saída",
                    "name": "Entre na rotatória e pegue a {exit_number} saída na {way_name}",
                    "destination": "Entre na rotatória e pegue a {exit_number} saída sentido {destination}"
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
                    "default": "Entre na rotatória e pegue a {exit_number} saída",
                    "name": "Entre na rotatória e pegue a {exit_number} saída na {way_name}",
                    "destination": "Entre na rotatória e pegue a {exit_number} saída sentido {destination}"
                },
                "default": {
                    "default": "Entre na rotatória",
                    "name": "Entre na rotatória e saia na {way_name}",
                    "destination": "Entre na rotatória e saia sentido {destination}"
                }
            }
        },
        "roundabout turn": {
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
                "default": "Continue em frente",
                "name": "Continue em frente em {way_name}",
                "destination": "Continue em frente sentido {destination}"
            }
        },
        "exit roundabout": {
            "default": {
                "default": "Saia da rotatória",
                "name": "Exit the traffic circle onto {way_name}",
                "destination": "Exit the traffic circle towards {destination}"
            }
        },
        "exit rotary": {
            "default": {
                "default": "Saia da rotatória",
                "name": "Exit the traffic circle onto {way_name}",
                "destination": "Exit the traffic circle towards {destination}"
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
                "default": "Siga em frente",
                "name": "Siga em frente em {way_name}",
                "destination": "Siga em frente sentido {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Continue em frente"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}

},{}],38:[function(require,module,exports){
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
                "east": "este",
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
                "straight": "em frente",
                "uturn": "inversão de marcha"
            },
            "lanes": {
                "xo": "Mantenha-se à direita",
                "ox": "Mantenha-se à esquerda",
                "xox": "Mantenha-se ao meio",
                "oxo": "Mantenha-se à esquerda ou à direita"
            }
        },
        "modes": {
            "ferry": {
                "default": "Apanhe o ferry",
                "name": "Apanhe o ferry {way_name}",
                "destination": "Apanhe o ferry para {destination}"
            }
        },
        "phrase": {
            "two linked by distance": "{instruction_one}, depois, a {distance}, {instruction_two}",
            "two linked": "{instruction_one}, depois {instruction_two}",
            "one in distance": "A {distance}, {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "saída {exit}"
        },
        "arrive": {
            "default": {
                "default": "Chegou ao seu {nth} destino",
                "upcoming": "Está a chegar ao seu {nth} destino",
                "short": "Chegou",
                "short-upcoming": "Está a chegar",
                "named": "Chegou a {waypoint_name}"
            },
            "left": {
                "default": "Chegou ao seu {nth} destino, à esquerda",
                "upcoming": "Está a chegar ao seu {nth} destino, à esquerda",
                "short": "Chegou",
                "short-upcoming": "Está a chegar",
                "named": "Chegou a {waypoint_name}, à esquerda"
            },
            "right": {
                "default": "Chegou ao seu {nth} destino, à direita",
                "upcoming": "Está a chegar ao seu {nth} destino, à direita",
                "short": "Chegou",
                "short-upcoming": "Está a chegar",
                "named": "Chegou a {waypoint_name}, à direita"
            },
            "sharp left": {
                "default": "Chegou ao seu {nth} destino, à esquerda",
                "upcoming": "Está a chegar ao seu {nth} destino, à esquerda",
                "short": "Chegou",
                "short-upcoming": "Está a chegar",
                "named": "Chegou a {waypoint_name}, à esquerda"
            },
            "sharp right": {
                "default": "Chegou ao seu {nth} destino, à direita",
                "upcoming": "Está a chegar ao seu {nth} destino, à direita",
                "short": "Chegou",
                "short-upcoming": "Está a chegar",
                "named": "Chegou a {waypoint_name}, à direita"
            },
            "slight right": {
                "default": "Chegou ao seu {nth} destino, à direita",
                "upcoming": "Está a chegar ao seu {nth} destino, à direita",
                "short": "Chegou",
                "short-upcoming": "Está a chegar",
                "named": "Chegou a {waypoint_name}, à direita"
            },
            "slight left": {
                "default": "Chegou ao seu {nth} destino, à esquerda",
                "upcoming": "Está a chegar ao seu {nth} destino, à esquerda",
                "short": "Chegou",
                "short-upcoming": "Está a chegar",
                "named": "Chegou a {waypoint_name}, à esquerda"
            },
            "straight": {
                "default": "Chegou ao seu {nth} destino, em frente",
                "upcoming": "Está a chegar ao seu {nth} destino, em frente",
                "short": "Chegou",
                "short-upcoming": "Está a chegar",
                "named": "Chegou a {waypoint_name}, em frente"
            }
        },
        "continue": {
            "default": {
                "default": "Vire {modifier}",
                "name": "Vire {modifier} para se manter em {way_name}",
                "destination": "Vire {modifier} em direção a {destination}",
                "exit": "Vire {modifier} para {way_name}"
            },
            "straight": {
                "default": "Continue em frente",
                "name": "Continue em frente para se manter em {way_name}",
                "destination": "Continue em direção a {destination}",
                "distance": "Continue em frente por {distance}",
                "namedistance": "Continue em {way_name} por {distance}"
            },
            "sharp left": {
                "default": "Vire acentuadamente à esquerda",
                "name": "Vire acentuadamente à esquerda para se manter em {way_name}",
                "destination": "Vire acentuadamente à esquerda em direção a {destination}"
            },
            "sharp right": {
                "default": "Vire acentuadamente à direita",
                "name": "Vire acentuadamente à direita para se manter em {way_name}",
                "destination": "Vire acentuadamente à direita em direção a {destination}"
            },
            "slight left": {
                "default": "Vire ligeiramente à esquerda",
                "name": "Vire ligeiramente à esquerda para se manter em {way_name}",
                "destination": "Vire ligeiramente à esquerda em direção a {destination}"
            },
            "slight right": {
                "default": "Vire ligeiramente à direita",
                "name": "Vire ligeiramente à direita para se manter em {way_name}",
                "destination": "Vire ligeiramente à direita em direção a {destination}"
            },
            "uturn": {
                "default": "Faça inversão de marcha",
                "name": "Faça inversão de marcha e continue em {way_name}",
                "destination": "Faça inversão de marcha em direção a {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Dirija-se para {direction}",
                "name": "Dirija-se para {direction} em {way_name}",
                "namedistance": "Dirija-se para {direction} em {way_name} por {distance}"
            }
        },
        "end of road": {
            "default": {
                "default": "Vire {modifier}",
                "name": "Vire {modifier} para {way_name}",
                "destination": "Vire {modifier} em direção a {destination}"
            },
            "straight": {
                "default": "Continue em frente",
                "name": "Continue em frente para {way_name}",
                "destination": "Continue em frente em direção a {destination}"
            },
            "uturn": {
                "default": "No final da estrada faça uma inversão de marcha",
                "name": "No final da estrada faça uma inversão de marcha para {way_name} ",
                "destination": "No final da estrada faça uma inversão de marcha em direção a {destination}"
            }
        },
        "fork": {
            "default": {
                "default": "Na bifurcação mantenha-se {modifier}",
                "name": "Mantenha-se {modifier} para {way_name}",
                "destination": "Mantenha-se {modifier} em direção a {destination}"
            },
            "slight left": {
                "default": "Na bifurcação mantenha-se à esquerda",
                "name": "Mantenha-se à esquerda para {way_name}",
                "destination": "Mantenha-se à esquerda em direção a {destination}"
            },
            "slight right": {
                "default": "Na bifurcação mantenha-se à direita",
                "name": "Mantenha-se à direita para {way_name}",
                "destination": "Mantenha-se à direita em direção a {destination}"
            },
            "sharp left": {
                "default": "Na bifurcação vire acentuadamente à esquerda",
                "name": "Vire acentuadamente à esquerda para {way_name}",
                "destination": "Vire acentuadamente à esquerda em direção a {destination}"
            },
            "sharp right": {
                "default": "Na bifurcação vire acentuadamente à direita",
                "name": "Vire acentuadamente à direita para {way_name}",
                "destination": "Vire acentuadamente à direita em direção a {destination}"
            },
            "uturn": {
                "default": "Faça inversão de marcha",
                "name": "Faça inversão de marcha para {way_name}",
                "destination": "Faça inversão de marcha em direção a {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Una-se ao tráfego {modifier}",
                "name": "Una-se ao tráfego {modifier} para {way_name}",
                "destination": "Una-se ao tráfego {modifier} em direção a {destination}"
            },
            "straight": {
                "default": "Una-se ao tráfego",
                "name": " Una-se ao tráfego para {way_name}",
                "destination": "Una-se ao tráfego em direção a {destination}"
            },
            "slight left": {
                "default": "Una-se ao tráfego à esquerda",
                "name": "Una-se ao tráfego à esquerda para {way_name}",
                "destination": "Una-se ao tráfego à esquerda em direção a {destination}"
            },
            "slight right": {
                "default": "Una-se ao tráfego à direita",
                "name": "Una-se ao tráfego à direita para {way_name}",
                "destination": "Una-se ao tráfego à direita em direção a {destination}"
            },
            "sharp left": {
                "default": "Una-se ao tráfego à esquerda",
                "name": "Una-se ao tráfego à esquerda para {way_name}",
                "destination": "Una-se ao tráfego à esquerda em direção a {destination}"
            },
            "sharp right": {
                "default": "Una-se ao tráfego à direita",
                "name": "Una-se ao tráfego à direita para {way_name}",
                "destination": "Una-se ao tráfego à direita em direção a {destination}"
            },
            "uturn": {
                "default": "Faça inversão de marcha",
                "name": "Faça inversão de marcha para {way_name}",
                "destination": "Faça inversão de marcha em direção a {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Continue {modifier}",
                "name": "Continue {modifier} para {way_name}",
                "destination": "Continue {modifier} em direção a {destination}"
            },
            "straight": {
                "default": "Continue em frente",
                "name": "Continue para {way_name}",
                "destination": "Continue em direção a {destination}"
            },
            "sharp left": {
                "default": "Vire acentuadamente à esquerda",
                "name": "Vire acentuadamente à esquerda para {way_name}",
                "destination": "Vire acentuadamente à esquerda em direção a{destination}"
            },
            "sharp right": {
                "default": "Vire acentuadamente à direita",
                "name": "Vire acentuadamente à direita para {way_name}",
                "destination": "Vire acentuadamente à direita em direção a {destination}"
            },
            "slight left": {
                "default": "Continue ligeiramente à esquerda",
                "name": "Continue ligeiramente à esquerda para {way_name}",
                "destination": "Continue ligeiramente à esquerda em direção a {destination}"
            },
            "slight right": {
                "default": "Continue ligeiramente à direita",
                "name": "Continue ligeiramente à direita para {way_name}",
                "destination": "Continue ligeiramente à direita em direção a {destination}"
            },
            "uturn": {
                "default": "Faça inversão de marcha",
                "name": "Faça inversão de marcha para {way_name}",
                "destination": "Faça inversão de marcha em direção a {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Continue {modifier}",
                "name": "Continue {modifier} para {way_name}",
                "destination": "Continue {modifier} em direção a {destination}"
            },
            "uturn": {
                "default": "Faça inversão de marcha",
                "name": "Faça inversão de marcha para {way_name}",
                "destination": "Faça inversão de marcha em direção a {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Saia na saída",
                "name": "Saia na saída para {way_name}",
                "destination": "Saia na saída em direção a {destination}",
                "exit": "Saia na saída {exit}",
                "exit_destination": "Saia na saída {exit} em direção a {destination}"
            },
            "left": {
                "default": "Saia na saída à esquerda",
                "name": "Saia na saída à esquerda para {way_name}",
                "destination": "Saia na saída à esquerda em direção a {destination}",
                "exit": "Saia na saída {exit} à esquerda",
                "exit_destination": "Saia na saída {exit} à esquerda em direção a {destination}"
            },
            "right": {
                "default": "Saia na saída à direita",
                "name": "Saia na saída à direita para {way_name}",
                "destination": "Saia na saída à direita em direção a {destination}",
                "exit": "Saia na saída {exit} à direita",
                "exit_destination": "Saia na saída {exit} à direita em direção a {destination}"
            },
            "sharp left": {
                "default": "Saia na saída à esquerda",
                "name": "Saia na saída à esquerda para {way_name}",
                "destination": "Saia na saída à esquerda em direção a {destination}",
                "exit": "Saia na saída {exit} à esquerda",
                "exit_destination": "Saia na saída {exit} à esquerda em direção a {destination}"
            },
            "sharp right": {
                "default": "Saia na saída à direita",
                "name": "Saia na saída à direita para {way_name}",
                "destination": "Saia na saída à direita em direção a {destination}",
                "exit": "Saia na saída {exit} à direita",
                "exit_destination": "Saia na saída {exit} à direita em direção a {destination}"
            },
            "slight left": {
                "default": "Saia na saída à esquerda",
                "name": "Saia na saída à esquerda para {way_name}",
                "destination": "Saia na saída à esquerda em direção a {destination}",
                "exit": "Saia na saída {exit} à esquerda",
                "exit_destination": "Saia na saída {exit} à esquerda em direção a {destination}"
            },
            "slight right": {
                "default": "Saia na saída à direita",
                "name": "Saia na saída à direita para {way_name}",
                "destination": "Saia na saída à direita em direção a {destination}",
                "exit": "Saia na saída {exit} à direita",
                "exit_destination": "Saia na saída {exit} à direita em direção a {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Saia na saída",
                "name": "Saia na saída para {way_name}",
                "destination": "Saia na saída em direção a {destination}"
            },
            "left": {
                "default": "Saia na saída à esquerda",
                "name": "Saia na saída à esquerda para {way_name}",
                "destination": "Saia na saída à esquerda em direção a {destination}"
            },
            "right": {
                "default": "Saia na saída à direita",
                "name": "Saia na saída à direita para {way_name}",
                "destination": "Saia na saída à direita em direção a {destination}"
            },
            "sharp left": {
                "default": "Saia na saída à esquerda",
                "name": "Saia na saída à esquerda para {way_name}",
                "destination": "Saia na saída à esquerda em direção a {destination}"
            },
            "sharp right": {
                "default": "Saia na saída à direita",
                "name": "Saia na saída à direita para {way_name}",
                "destination": "Saia na saída à direita em direção a {destination}"
            },
            "slight left": {
                "default": "Saia na saída à esquerda",
                "name": "Saia na saída à esquerda para {way_name}",
                "destination": "Saia na saída à esquerda em direção a {destination}"
            },
            "slight right": {
                "default": "Saia na saída à direita",
                "name": "Saia na saída à direita para {way_name}",
                "destination": "Saia na saída à direita em direção a {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Entre na rotunda",
                    "name": "Entre na rotunda e saia para {way_name}",
                    "destination": "Entre na rotunda e saia em direção a {destination}"
                },
                "name": {
                    "default": "Entre em {rotary_name}",
                    "name": "Entre em {rotary_name} e saia para {way_name}",
                    "destination": "Entre em {rotary_name} e saia em direção a {destination}"
                },
                "exit": {
                    "default": "Entre na rotunda e saia na saída {exit_number}",
                    "name": "Entre na rotunda e saia na saída {exit_number} para {way_name}",
                    "destination": "Entre na rotunda e saia na saída {exit_number} em direção a {destination}"
                },
                "name_exit": {
                    "default": "Entre em {rotary_name} e saia na saída {exit_number}",
                    "name": "Entre em {rotary_name} e saia na saída {exit_number} para {way_name}",
                    "destination": "Entre em{rotary_name} e saia na saída {exit_number} em direção a {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "Entre na rotunda e saia na saída {exit_number}",
                    "name": "Entre na rotunda e saia na saída {exit_number} para {way_name}",
                    "destination": "Entre na rotunda e saia na saída {exit_number} em direção a {destination}"
                },
                "default": {
                    "default": "Entre na rotunda",
                    "name": "Entre na rotunda e saia para {way_name}",
                    "destination": "Entre na rotunda e saia em direção a {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "Siga {modifier}",
                "name": "Siga {modifier} para {way_name}",
                "destination": "Siga {modifier} em direção a {destination}"
            },
            "left": {
                "default": "Vire à esquerda",
                "name": "Vire à esquerda para {way_name}",
                "destination": "Vire à esquerda em direção a {destination}"
            },
            "right": {
                "default": "Vire à direita",
                "name": "Vire à direita para {way_name}",
                "destination": "Vire à direita em direção a {destination}"
            },
            "straight": {
                "default": "Continue em frente",
                "name": "Continue em frente para {way_name}",
                "destination": "Continue em frente em direção a {destination}"
            }
        },
        "exit roundabout": {
            "default": {
                "default": "Saia da rotunda",
                "name": "Saia da rotunda para {way_name}",
                "destination": "Saia da rotunda em direção a {destination}"
            }
        },
        "exit rotary": {
            "default": {
                "default": "Saia da rotunda",
                "name": "Saia da rotunda para {way_name}",
                "destination": "Saia da rotunda em direção a {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Siga {modifier}",
                "name": "Siga {modifier} para{way_name}",
                "destination": "Siga {modifier} em direção a {destination}"
            },
            "left": {
                "default": "Vire à esquerda",
                "name": "Vire à esquerda para {way_name}",
                "destination": "Vire à esquerda em direção a {destination}"
            },
            "right": {
                "default": "Vire à direita",
                "name": "Vire à direita para {way_name}",
                "destination": "Vire à direita em direção a {destination}"
            },
            "straight": {
                "default": "Vá em frente",
                "name": "Vá em frente para {way_name}",
                "destination": "Vá em frente em direção a {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Continue em frente"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}

},{}],39:[function(require,module,exports){
module.exports={
    "meta": {
        "capitalizeFirstLetter": true
    },
    "v5": {
        "constants": {
            "ordinalize": {
                "1": "prima",
                "2": "a doua",
                "3": "a treia",
                "4": "a patra",
                "5": "a cincea",
                "6": "a șasea",
                "7": "a șaptea",
                "8": "a opta",
                "9": "a noua",
                "10": "a zecea"
            },
            "direction": {
                "north": "nord",
                "northeast": "nord-est",
                "east": "est",
                "southeast": "sud-est",
                "south": "sud",
                "southwest": "sud-vest",
                "west": "vest",
                "northwest": "nord-vest"
            },
            "modifier": {
                "left": "stânga",
                "right": "dreapta",
                "sharp left": "puternic stânga",
                "sharp right": "puternic dreapta",
                "slight left": "ușor stânga",
                "slight right": "ușor dreapta",
                "straight": "înainte",
                "uturn": "întoarcere"
            },
            "lanes": {
                "xo": "Țineți stânga",
                "ox": "Țineți dreapta",
                "xox": "Țineți pe mijloc",
                "oxo": "Țineți pe laterale"
            }
        },
        "modes": {
            "ferry": {
                "default": "Luați feribotul",
                "name": "Luați feribotul {way_name}",
                "destination": "Luați feribotul spre {destination}"
            }
        },
        "phrase": {
            "two linked by distance": "{instruction_one}, apoi în {distance}, {instruction_two}",
            "two linked": "{instruction_one} apoi {instruction_two}",
            "one in distance": "În {distance}, {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "ieșirea {exit}"
        },
        "arrive": {
            "default": {
                "default": "Ați ajuns la {nth} destinație",
                "upcoming": "Ați ajuns la {nth} destinație",
                "short": "Ați ajuns",
                "short-upcoming": "Veți ajunge",
                "named": "Ați ajuns {waypoint_name}"
            },
            "left": {
                "default": "Ați ajuns la {nth} destinație, pe stânga",
                "upcoming": "Ați ajuns la {nth} destinație, pe stânga",
                "short": "Ați ajuns",
                "short-upcoming": "Veți ajunge",
                "named": "Ați ajuns {waypoint_name}, pe stânga"
            },
            "right": {
                "default": "Ați ajuns la {nth} destinație, pe dreapta",
                "upcoming": "Ați ajuns la {nth} destinație, pe dreapta",
                "short": "Ați ajuns",
                "short-upcoming": "Veți ajunge",
                "named": "Ați ajuns {waypoint_name}, pe dreapta"
            },
            "sharp left": {
                "default": "Ați ajuns la {nth} destinație, pe stânga",
                "upcoming": "Ați ajuns la {nth} destinație, pe stânga",
                "short": "Ați ajuns",
                "short-upcoming": "Veți ajunge",
                "named": "Ați ajuns {waypoint_name}, pe stânga"
            },
            "sharp right": {
                "default": "Ați ajuns la {nth} destinație, pe dreapta",
                "upcoming": "Ați ajuns la {nth} destinație, pe dreapta",
                "short": "Ați ajuns",
                "short-upcoming": "Veți ajunge",
                "named": "Ați ajuns {waypoint_name}, pe dreapta"
            },
            "slight right": {
                "default": "Ați ajuns la {nth} destinație, pe dreapta",
                "upcoming": "Ați ajuns la {nth} destinație, pe dreapta",
                "short": "Ați ajuns",
                "short-upcoming": "Veți ajunge",
                "named": "Ați ajuns {waypoint_name}, pe dreapta"
            },
            "slight left": {
                "default": "Ați ajuns la {nth} destinație, pe stânga",
                "upcoming": "Ați ajuns la {nth} destinație, pe stânga",
                "short": "Ați ajuns",
                "short-upcoming": "Veți ajunge",
                "named": "Ați ajuns {waypoint_name}, pe stânga"
            },
            "straight": {
                "default": "Ați ajuns la {nth} destinație, în față",
                "upcoming": "Ați ajuns la {nth} destinație, în față",
                "short": "Ați ajuns",
                "short-upcoming": "Veți ajunge",
                "named": "Ați ajuns {waypoint_name}, în față"
            }
        },
        "continue": {
            "default": {
                "default": "Virați {modifier}",
                "name": "Virați {modifier} pe {way_name}",
                "destination": "Virați {modifier} spre {destination}",
                "exit": "Virați {modifier} pe {way_name}"
            },
            "straight": {
                "default": "Mergeți înainte",
                "name": "Mergeți înainte pe {way_name}",
                "destination": "Continuați spre {destination}",
                "distance": "Mergeți înainte pentru {distance}",
                "namedistance": "Continuați pe {way_name} pentru {distance}"
            },
            "sharp left": {
                "default": "Virați puternic la stânga",
                "name": "Virați puternic la stânga pe {way_name}",
                "destination": "Virați puternic la stânga spre {destination}"
            },
            "sharp right": {
                "default": "Virați puternic la dreapta",
                "name": "Virați puternic la dreapta pe {way_name}",
                "destination": "Virați puternic la dreapta spre {destination}"
            },
            "slight left": {
                "default": "Virați ușor la stânga",
                "name": "Virați ușor la stânga pe {way_name}",
                "destination": "Virați ușor la stânga spre {destination}"
            },
            "slight right": {
                "default": "Virați ușor la dreapta",
                "name": "Virați ușor la dreapta pe {way_name}",
                "destination": "Virați ușor la dreapta spre {destination}"
            },
            "uturn": {
                "default": "Întoarceți-vă",
                "name": "Întoarceți-vă și continuați pe {way_name}",
                "destination": "Întoarceți-vă spre {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Mergeți spre {direction}",
                "name": "Mergeți spre {direction} pe {way_name}",
                "namedistance": "Mergeți spre {direction} pe {way_name} pentru {distance}"
            }
        },
        "end of road": {
            "default": {
                "default": "Virați {modifier}",
                "name": "Virați {modifier} pe {way_name}",
                "destination": "Virați {modifier} spre {destination}"
            },
            "straight": {
                "default": "Continuați înainte",
                "name": "Continuați înainte pe {way_name}",
                "destination": "Continuați înainte spre {destination}"
            },
            "uturn": {
                "default": "Întoarceți-vă la sfârșitul drumului",
                "name": "Întoarceți-vă pe {way_name} la sfârșitul drumului",
                "destination": "Întoarceți-vă spre {destination} la sfârșitul drumului"
            }
        },
        "fork": {
            "default": {
                "default": "Țineți {modifier} la bifurcație",
                "name": "Țineți {modifier} la bifurcație pe {way_name}",
                "destination": "Țineți {modifier} la bifurcație spre {destination}"
            },
            "slight left": {
                "default": "Țineți pe stânga la bifurcație",
                "name": "Țineți pe stânga la bifurcație pe {way_name}",
                "destination": "Țineți pe stânga la bifurcație spre {destination}"
            },
            "slight right": {
                "default": "Țineți pe dreapta la bifurcație",
                "name": "Țineți pe dreapta la bifurcație pe {way_name}",
                "destination": "Țineți pe dreapta la bifurcație spre {destination}"
            },
            "sharp left": {
                "default": "Virați puternic stânga la bifurcație",
                "name": "Virați puternic stânga la bifurcație pe {way_name}",
                "destination": "Virați puternic stânga la bifurcație spre {destination}"
            },
            "sharp right": {
                "default": "Virați puternic dreapta la bifurcație",
                "name": "Virați puternic dreapta la bifurcație pe {way_name}",
                "destination": "Virați puternic dreapta la bifurcație spre {destination}"
            },
            "uturn": {
                "default": "Întoarceți-vă",
                "name": "Întoarceți-vă pe {way_name}",
                "destination": "Întoarceți-vă spre {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Intrați în {modifier}",
                "name": "Intrați în {modifier} pe {way_name}",
                "destination": "Intrați în {modifier} spre {destination}"
            },
            "straight": {
                "default": "Intrați",
                "name": "Intrați pe {way_name}",
                "destination": "Intrați spre {destination}"
            },
            "slight left": {
                "default": "Intrați în stânga",
                "name": "Intrați în stânga pe {way_name}",
                "destination": "Intrați în stânga spre {destination}"
            },
            "slight right": {
                "default": "Intrați în dreapta",
                "name": "Intrați în dreapta pe {way_name}",
                "destination": "Intrați în dreapta spre {destination}"
            },
            "sharp left": {
                "default": "Intrați în stânga",
                "name": "Intrați în stânga pe {way_name}",
                "destination": "Intrați în stânga spre {destination}"
            },
            "sharp right": {
                "default": "Intrați în dreapta",
                "name": "Intrați în dreapta pe {way_name}",
                "destination": "Intrați în dreapta spre {destination}"
            },
            "uturn": {
                "default": "Întoarceți-vă",
                "name": "Întoarceți-vă pe {way_name}",
                "destination": "Întoarceți-vă spre {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Continuați {modifier}",
                "name": "Continuați {modifier} pe {way_name}",
                "destination": "Continuați {modifier} spre {destination}"
            },
            "straight": {
                "default": "Continuați înainte",
                "name": "Continuați pe {way_name}",
                "destination": "Continuați spre {destination}"
            },
            "sharp left": {
                "default": "Virați puternic la stânga",
                "name": "Virați puternic la stânga pe {way_name}",
                "destination": "Virați puternic la stânga spre {destination}"
            },
            "sharp right": {
                "default": "Virați puternic la dreapta",
                "name": "Virați puternic la dreapta pe {way_name}",
                "destination": "Virați puternic la dreapta spre {destination}"
            },
            "slight left": {
                "default": "Continuați ușor la stânga",
                "name": "Continuați ușor la stânga pe {way_name}",
                "destination": "Continuați ușor la stânga spre {destination}"
            },
            "slight right": {
                "default": "Continuați ușor la dreapta",
                "name": "Continuați ușor la dreapta pe {way_name}",
                "destination": "Continuați ușor la dreapta spre {destination}"
            },
            "uturn": {
                "default": "Întoarceți-vă",
                "name": "Întoarceți-vă pe {way_name}",
                "destination": "Întoarceți-vă spre {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Continuați {modifier}",
                "name": "Continuați {modifier} pe {way_name}",
                "destination": "Continuați {modifier} spre {destination}"
            },
            "uturn": {
                "default": "Întoarceți-vă",
                "name": "Întoarceți-vă pe {way_name}",
                "destination": "Întoarceți-vă spre {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Urmați breteaua",
                "name": "Urmați breteaua pe {way_name}",
                "destination": "Urmați breteaua spre {destination}",
                "exit": "Urmați ieșirea {exit}",
                "exit_destination": "Urmați ieșirea {exit} spre {destination}"
            },
            "left": {
                "default": "Urmați breteaua din stânga",
                "name": "Urmați breteaua din stânga pe {way_name}",
                "destination": "Urmați breteaua din stânga spre {destination}",
                "exit": "Urmați ieșirea {exit} pe stânga",
                "exit_destination": "Urmați ieșirea {exit} pe stânga spre {destination}"
            },
            "right": {
                "default": "Urmați breteaua din dreapta",
                "name": "Urmați breteaua din dreapta pe {way_name}",
                "destination": "Urmați breteaua din dreapta spre {destination}",
                "exit": "Urmați ieșirea {exit} pe dreapta",
                "exit_destination": "Urmați ieșirea {exit} pe dreapta spre {destination}"
            },
            "sharp left": {
                "default": "Urmați breteaua din stânga",
                "name": "Urmați breteaua din stânga pe {way_name}",
                "destination": "Urmați breteaua din stânga spre {destination}",
                "exit": "Urmați ieșirea {exit} pe stânga",
                "exit_destination": "Urmați ieșirea {exit} pe stânga spre {destination}"
            },
            "sharp right": {
                "default": "Urmați breteaua din dreapta",
                "name": "Urmați breteaua din dreapta pe {way_name}",
                "destination": "Urmați breteaua din dreapta spre {destination}",
                "exit": "Urmați ieșirea {exit} pe dreapta",
                "exit_destination": "Urmați ieșirea {exit} pe dreapta spre {destination}"
            },
            "slight left": {
                "default": "Urmați breteaua din stânga",
                "name": "Urmați breteaua din stânga pe {way_name}",
                "destination": "Urmați breteaua din stânga spre {destination}",
                "exit": "Urmați ieșirea {exit} pe stânga",
                "exit_destination": "Urmați ieșirea {exit} pe stânga spre {destination}"
            },
            "slight right": {
                "default": "Urmați breteaua din dreapta",
                "name": "Urmați breteaua din dreapta pe {way_name}",
                "destination": "Urmați breteaua din dreapta spre {destination}",
                "exit": "Urmați ieșirea {exit} pe dreapta",
                "exit_destination": "Urmați ieșirea {exit} pe dreapta spre {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Urmați breteaua de intrare",
                "name": "Urmați breteaua pe {way_name}",
                "destination": "Urmați breteaua spre {destination}"
            },
            "left": {
                "default": "Urmați breteaua din stânga",
                "name": "Urmați breteaua din stânga pe {way_name}",
                "destination": "Urmați breteaua din stânga spre {destination}"
            },
            "right": {
                "default": "Urmați breteaua din dreapta",
                "name": "Urmați breteaua din dreapta pe {way_name}",
                "destination": "Urmați breteaua din dreapta spre {destination}"
            },
            "sharp left": {
                "default": "Urmați breteaua din stânga",
                "name": "Urmați breteaua din stânga pe {way_name}",
                "destination": "Urmați breteaua din stânga spre {destination}"
            },
            "sharp right": {
                "default": "Urmați breteaua din dreapta",
                "name": "Urmați breteaua din dreapta pe {way_name}",
                "destination": "Urmați breteaua din dreapta spre {destination}"
            },
            "slight left": {
                "default": "Urmați breteaua din stânga",
                "name": "Urmați breteaua din stânga pe {way_name}",
                "destination": "Urmați breteaua din stânga spre {destination}"
            },
            "slight right": {
                "default": "Urmați breteaua din dreapta",
                "name": "Urmați breteaua din dreapta pe {way_name}",
                "destination": "Urmați breteaua din dreapta spre {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Intrați în sensul giratoriu",
                    "name": "Intrați în sensul giratoriu și ieșiți pe {way_name}",
                    "destination": "Intrați în sensul giratoriu și ieșiți spre {destination}"
                },
                "name": {
                    "default": "Intrați în {rotary_name}",
                    "name": "Intrați în {rotary_name} și ieșiți pe {way_name}",
                    "destination": "Intrați în {rotary_name} și ieșiți spre {destination}"
                },
                "exit": {
                    "default": "Intrați în sensul giratoriu și urmați {exit_number} ieșire",
                    "name": "Intrați în sensul giratoriu și urmați {exit_number} ieșire pe {way_name}",
                    "destination": "Intrați în sensul giratoriu și urmați {exit_number} ieșire spre {destination}"
                },
                "name_exit": {
                    "default": "Intrați în {rotary_name} și urmați {exit_number} ieșire",
                    "name": "Intrați în {rotary_name} și urmați {exit_number} ieșire pe {way_name}",
                    "destination": "Intrați în  {rotary_name} și urmați {exit_number} ieșire spre {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "Intrați în sensul giratoriu și urmați {exit_number} ieșire",
                    "name": "Intrați în sensul giratoriu și urmați {exit_number} ieșire pe {way_name}",
                    "destination": "Intrați în sensul giratoriu și urmați {exit_number} ieșire spre {destination}"
                },
                "default": {
                    "default": "Intrați în sensul giratoriu",
                    "name": "Intrați în sensul giratoriu și ieșiți pe {way_name}",
                    "destination": "Intrați în sensul giratoriu și ieșiți spre {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "La sensul giratoriu virați {modifier}",
                "name": "La sensul giratoriu virați {modifier} pe {way_name}",
                "destination": "La sensul giratoriu virați {modifier} spre {destination}"
            },
            "left": {
                "default": "La sensul giratoriu virați la stânga",
                "name": "La sensul giratoriu virați la stânga pe {way_name}",
                "destination": "La sensul giratoriu virați la stânga spre {destination}"
            },
            "right": {
                "default": "La sensul giratoriu virați la dreapta",
                "name": "La sensul giratoriu virați la dreapta pe {way_name}",
                "destination": "La sensul giratoriu virați la dreapta spre {destination}"
            },
            "straight": {
                "default": "La sensul giratoriu continuați înainte",
                "name": "La sensul giratoriu continuați înainte pe {way_name}",
                "destination": "La sensul giratoriu continuați înainte spre {destination}"
            }
        },
        "exit roundabout": {
            "default": {
                "default": "Ieșiți din sensul giratoriu",
                "name": "Ieșiți din sensul giratoriu pe {way_name}",
                "destination": "Ieșiți din sensul giratoriu spre {destination}"
            }
        },
        "exit rotary": {
            "default": {
                "default": "Ieșiți din sensul giratoriu",
                "name": "Ieșiți din sensul giratoriu pe {way_name}",
                "destination": "Ieșiți din sensul giratoriu spre {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Virați {modifier}",
                "name": "Virați {modifier} pe {way_name}",
                "destination": "Virați {modifier} spre {destination}"
            },
            "left": {
                "default": "Virați la stânga",
                "name": "Virați la stânga pe {way_name}",
                "destination": "Virați la stânga spre {destination}"
            },
            "right": {
                "default": "Virați la dreapta",
                "name": "Virați la dreapta pe {way_name}",
                "destination": "Virați la dreapta spre {destination}"
            },
            "straight": {
                "default": "Mergeți înainte",
                "name": "Mergeți înainte pe {way_name}",
                "destination": "Mergeți înainte spre {destination}"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Mergeți înainte"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}

},{}],40:[function(require,module,exports){
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
        "phrase": {
            "two linked by distance": "{instruction_one}, затем через {distance} {instruction_two}",
            "two linked": "{instruction_one}, затем {instruction_two}",
            "one in distance": "Через {distance} {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "съезд {exit}"
        },
        "arrive": {
            "default": {
                "default": "Вы прибыли в {nth} пункт назначения",
                "upcoming": "Вы прибудете в {nth} пункт назначения",
                "short": "Вы прибыли",
                "short-upcoming": "Вы скоро прибудете",
                "named": "Вы прибыли в пункт назначения, {waypoint_name}"
            },
            "left": {
                "default": "Вы прибыли в {nth} пункт назначения, он находится слева",
                "upcoming": "Вы прибудете в {nth} пункт назначения, он будет слева",
                "short": "Вы прибыли",
                "short-upcoming": "Вы скоро прибудете",
                "named": "Вы прибыли в пункт назначения, {waypoint_name}, он находится слева"
            },
            "right": {
                "default": "Вы прибыли в {nth} пункт назначения, он находится справа",
                "upcoming": "Вы прибудете в {nth} пункт назначения, он будет справа",
                "short": "Вы прибыли",
                "short-upcoming": "Вы скоро прибудете",
                "named": "Вы прибыли в пункт назначения, {waypoint_name}, он находится справа"
            },
            "sharp left": {
                "default": "Вы прибыли в {nth} пункт назначения, он находится слева сзади",
                "upcoming": "Вы прибудете в {nth} пункт назначения, он будет слева сзади",
                "short": "Вы прибыли",
                "short-upcoming": "Вы скоро прибудете",
                "named": "Вы прибыли в пункт назначения, {waypoint_name}, он находится слева сзади"
            },
            "sharp right": {
                "default": "Вы прибыли в {nth} пункт назначения, он находится справа сзади",
                "upcoming": "Вы прибудете в {nth} пункт назначения, он будет справа сзади",
                "short": "Вы прибыли",
                "short-upcoming": "Вы скоро прибудете",
                "named": "Вы прибыли в пункт назначения, {waypoint_name}, он находится справа сзади"
            },
            "slight right": {
                "default": "Вы прибыли в {nth} пункт назначения, он находится справа впереди",
                "upcoming": "Вы прибудете в {nth} пункт назначения, он будет справа впереди",
                "short": "Вы прибыли",
                "short-upcoming": "Вы скоро прибудете",
                "named": "Вы прибыли в пункт назначения, {waypoint_name}, он находится справа впереди"
            },
            "slight left": {
                "default": "Вы прибыли в {nth} пункт назначения, он находится слева впереди",
                "upcoming": "Вы прибудете в {nth} пункт назначения, он будет слева впереди",
                "short": "Вы прибыли",
                "short-upcoming": "Вы скоро прибудете",
                "named": "Вы прибыли в пункт назначения, {waypoint_name}, он находится слева впереди"
            },
            "straight": {
                "default": "Вы прибыли в {nth} пункт назначения, он находится перед Вами",
                "upcoming": "Вы прибудете в {nth} пункт назначения, он будет перед Вами",
                "short": "Вы прибыли",
                "short-upcoming": "Вы скоро прибудете",
                "named": "Вы прибыли в пункт назначения, {waypoint_name}, он находится перед Вами"
            }
        },
        "continue": {
            "default": {
                "default": "Двигайтесь {modifier}",
                "name": "Двигайтесь {modifier} по {way_name:dative}",
                "destination": "Двигайтесь {modifier} в направлении {destination}",
                "exit": "Двигайтесь {modifier} на {way_name:accusative}"
            },
            "straight": {
                "default": "Двигайтесь прямо",
                "name": "Продолжите движение по {way_name:dative}",
                "destination": "Продолжите движение в направлении {destination}",
                "distance": "Двигайтесь прямо {distance}",
                "namedistance": "Двигайтесь прямо {distance} по {way_name:dative}"
            },
            "sharp left": {
                "default": "Резко поверните налево",
                "name": "Резко поверните налево на {way_name:accusative}",
                "destination": "Резко поверните налево в направлении {destination}"
            },
            "sharp right": {
                "default": "Резко поверните направо",
                "name": "Резко поверните направо на {way_name:accusative}",
                "destination": "Резко поверните направо в направлении {destination}"
            },
            "slight left": {
                "default": "Плавно поверните налево",
                "name": "Плавно поверните налево на {way_name:accusative}",
                "destination": "Плавно поверните налево в направлении {destination}"
            },
            "slight right": {
                "default": "Плавно поверните направо",
                "name": "Плавно поверните направо на {way_name:accusative}",
                "destination": "Плавно поверните направо в направлении {destination}"
            },
            "uturn": {
                "default": "Развернитесь",
                "name": "Развернитесь и продолжите движение по {way_name:dative}",
                "destination": "Развернитесь в направлении {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Двигайтесь в {direction} направлении",
                "name": "Двигайтесь в {direction} направлении по {way_name:dative}",
                "namedistance": "Двигайтесь {distance} в {direction} направлении по {way_name:dative}"
            }
        },
        "end of road": {
            "default": {
                "default": "Поверните {modifier}",
                "name": "Поверните {modifier} на {way_name:accusative}",
                "destination": "Поверните {modifier} в направлении {destination}"
            },
            "straight": {
                "default": "Двигайтесь прямо",
                "name": "Двигайтесь прямо по {way_name:dative}",
                "destination": "Двигайтесь прямо в направлении {destination}"
            },
            "uturn": {
                "default": "В конце дороги развернитесь",
                "name": "Развернитесь в конце {way_name:genitive}",
                "destination": "В конце дороги развернитесь в направлении {destination}"
            }
        },
        "fork": {
            "default": {
                "default": "На развилке двигайтесь {modifier}",
                "name": "На развилке двигайтесь {modifier} на {way_name:accusative}",
                "destination": "На развилке двигайтесь {modifier} в направлении {destination}"
            },
            "slight left": {
                "default": "На развилке держитесь левее",
                "name": "На развилке держитесь левее на {way_name:accusative}",
                "destination": "На развилке держитесь левее и продолжите движение в направлении {destination}"
            },
            "slight right": {
                "default": "На развилке держитесь правее",
                "name": "На развилке держитесь правее на {way_name:accusative}",
                "destination": "На развилке держитесь правее и продолжите движение в направлении {destination}"
            },
            "sharp left": {
                "default": "На развилке резко поверните налево",
                "name": "Резко поверните налево на {way_name:accusative}",
                "destination": "Резко поверните налево и продолжите движение в направлении {destination}"
            },
            "sharp right": {
                "default": "На развилке резко поверните направо",
                "name": "Резко поверните направо на {way_name:accusative}",
                "destination": "Резко поверните направо и продолжите движение в направлении {destination}"
            },
            "uturn": {
                "default": "На развилке развернитесь",
                "name": "На развилке развернитесь на {way_name:prepositional}",
                "destination": "На развилке развернитесь и продолжите движение в направлении {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Перестройтесь {modifier}",
                "name": "Перестройтесь {modifier} на {way_name:accusative}",
                "destination": "Перестройтесь {modifier} в направлении {destination}"
            },
            "straight": {
                "default": "Двигайтесь прямо",
                "name": "Продолжите движение по {way_name:dative}",
                "destination": "Продолжите движение в направлении {destination}"
            },
            "slight left": {
                "default": "Перестройтесь левее",
                "name": "Перестройтесь левее на {way_name:accusative}",
                "destination": "Перестройтесь левее в направлении {destination}"
            },
            "slight right": {
                "default": "Перестройтесь правее",
                "name": "Перестройтесь правее на {way_name:accusative}",
                "destination": "Перестройтесь правее в направлении {destination}"
            },
            "sharp left": {
                "default": "Перестраивайтесь левее",
                "name": "Перестраивайтесь левее на {way_name:accusative}",
                "destination": "Перестраивайтесь левее в направлении {destination}"
            },
            "sharp right": {
                "default": "Перестраивайтесь правее",
                "name": "Перестраивайтесь правее на {way_name:accusative}",
                "destination": "Перестраивайтесь правее в направлении {destination}"
            },
            "uturn": {
                "default": "Развернитесь",
                "name": "Развернитесь на {way_name:prepositional}",
                "destination": "Развернитесь в направлении {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Двигайтесь {modifier}",
                "name": "Двигайтесь {modifier} на {way_name:accusative}",
                "destination": "Двигайтесь {modifier} в направлении {destination}"
            },
            "straight": {
                "default": "Двигайтесь прямо",
                "name": "Продолжите движение по {way_name:dative}",
                "destination": "Продолжите движение в направлении {destination}"
            },
            "sharp left": {
                "default": "Резко поверните налево",
                "name": "Резко поверните налево на {way_name:accusative}",
                "destination": "Резко поверните налево и продолжите движение в направлении {destination}"
            },
            "sharp right": {
                "default": "Резко поверните направо",
                "name": "Резко поверните направо на {way_name:accusative}",
                "destination": "Резко поверните направо и продолжите движение в направлении {destination}"
            },
            "slight left": {
                "default": "Плавно поверните налево",
                "name": "Плавно поверните налево на {way_name:accusative}",
                "destination": "Плавно поверните налево в направлении {destination}"
            },
            "slight right": {
                "default": "Плавно поверните направо",
                "name": "Плавно поверните направо на {way_name:accusative}",
                "destination": "Плавно поверните направо в направлении {destination}"
            },
            "uturn": {
                "default": "Развернитесь",
                "name": "Развернитесь на {way_name:prepositional}",
                "destination": "Развернитесь и продолжите движение в направлении {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Двигайтесь {modifier}",
                "name": "Двигайтесь {modifier} по {way_name:dative}",
                "destination": "Двигайтесь {modifier} в направлении {destination}"
            },
            "uturn": {
                "default": "Развернитесь",
                "name": "Развернитесь на {way_name:prepositional}",
                "destination": "Развернитесь и продолжите движение в направлении {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Сверните на съезд",
                "name": "Сверните на съезд на {way_name:accusative}",
                "destination": "Сверните на съезд в направлении {destination}",
                "exit": "Сверните на съезд {exit}",
                "exit_destination": "Сверните на съезд {exit} в направлении {destination}"
            },
            "left": {
                "default": "Сверните на левый съезд",
                "name": "Сверните на левый съезд на {way_name:accusative}",
                "destination": "Сверните на левый съезд в направлении {destination}",
                "exit": "Сверните на съезд {exit} слева",
                "exit_destination": "Сверните на съезд {exit} слева в направлении {destination}"
            },
            "right": {
                "default": "Сверните на правый съезд",
                "name": "Сверните на правый съезд на {way_name:accusative}",
                "destination": "Сверните на правый съезд в направлении {destination}",
                "exit": "Сверните на съезд {exit} справа",
                "exit_destination": "Сверните на съезд {exit} справа в направлении {destination}"
            },
            "sharp left": {
                "default": "Поверните налево на съезд",
                "name": "Поверните налево на съезд на {way_name:accusative}",
                "destination": "Поверните налево на съезд в направлении {destination}",
                "exit": "Поверните налево на съезд {exit}",
                "exit_destination": "Поверните налево на съезд {exit} в направлении {destination}"
            },
            "sharp right": {
                "default": "Поверните направо на съезд",
                "name": "Поверните направо на съезд на {way_name:accusative}",
                "destination": "Поверните направо на съезд в направлении {destination}",
                "exit": "Поверните направо на съезд {exit}",
                "exit_destination": "Поверните направо на съезд {exit} в направлении {destination}"
            },
            "slight left": {
                "default": "Перестройтесь левее на съезд",
                "name": "Перестройтесь левее на съезд на {way_name:accusative}",
                "destination": "Перестройтесь левее на съезд в направлении {destination}",
                "exit": "Перестройтесь левее на {exit}",
                "exit_destination": "Перестройтесь левее на съезд {exit} в направлении {destination}"
            },
            "slight right": {
                "default": "Перестройтесь правее на съезд",
                "name": "Перестройтесь правее на съезд на {way_name:accusative}",
                "destination": "Перестройтесь правее на съезд в направлении {destination}",
                "exit": "Перестройтесь правее на съезд {exit}",
                "exit_destination": "Перестройтесь правее на съезд {exit} в направлении {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Сверните на автомагистраль",
                "name": "Сверните на въезд на {way_name:accusative}",
                "destination": "Сверните на въезд на автомагистраль в направлении {destination}"
            },
            "left": {
                "default": "Сверните на левый въезд на автомагистраль",
                "name": "Сверните на левый въезд на {way_name:accusative}",
                "destination": "Сверните на левый въезд на автомагистраль в направлении {destination}"
            },
            "right": {
                "default": "Сверните на правый въезд на автомагистраль",
                "name": "Сверните на правый въезд на {way_name:accusative}",
                "destination": "Сверните на правый въезд на автомагистраль в направлении {destination}"
            },
            "sharp left": {
                "default": "Поверните на левый въезд на автомагистраль",
                "name": "Поверните на левый въезд на {way_name:accusative}",
                "destination": "Поверните на левый въезд на автомагистраль в направлении {destination}"
            },
            "sharp right": {
                "default": "Поверните на правый въезд на автомагистраль",
                "name": "Поверните на правый въезд на {way_name:accusative}",
                "destination": "Поверните на правый въезд на автомагистраль в направлении {destination}"
            },
            "slight left": {
                "default": "Перестройтесь левее на въезд на автомагистраль",
                "name": "Перестройтесь левее на {way_name:accusative}",
                "destination": "Перестройтесь левее на автомагистраль в направлении {destination}"
            },
            "slight right": {
                "default": "Перестройтесь правее на въезд на автомагистраль",
                "name": "Перестройтесь правее на {way_name:accusative}",
                "destination": "Перестройтесь правее на автомагистраль в направлении {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Продолжите движение по круговой развязке",
                    "name": "На круговой развязке сверните на {way_name:accusative}",
                    "destination": "На круговой развязке сверните в направлении {destination}"
                },
                "name": {
                    "default": "Продолжите движение по {rotary_name:dative}",
                    "name": "На {rotary_name:prepositional} сверните на {way_name:accusative}",
                    "destination": "На {rotary_name:prepositional} сверните в направлении {destination}"
                },
                "exit": {
                    "default": "На круговой развязке сверните на {exit_number} съезд",
                    "name": "На круговой развязке сверните на {exit_number} съезд на {way_name:accusative}",
                    "destination": "На круговой развязке сверните на {exit_number} съезд в направлении {destination}"
                },
                "name_exit": {
                    "default": "На {rotary_name:prepositional} сверните на {exit_number} съезд",
                    "name": "На {rotary_name:prepositional} сверните на {exit_number} съезд на {way_name:accusative}",
                    "destination": "На {rotary_name:prepositional} сверните на {exit_number} съезд в направлении {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "На круговой развязке сверните на {exit_number} съезд",
                    "name": "На круговой развязке сверните на {exit_number} съезд на {way_name:accusative}",
                    "destination": "На круговой развязке сверните на {exit_number} съезд в направлении {destination}"
                },
                "default": {
                    "default": "Продолжите движение по круговой развязке",
                    "name": "На круговой развязке сверните на {way_name:accusative}",
                    "destination": "На круговой развязке сверните в направлении {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "Двигайтесь {modifier}",
                "name": "Двигайтесь {modifier} на {way_name:accusative}",
                "destination": "Двигайтесь {modifier} в направлении {destination}"
            },
            "left": {
                "default": "Сверните налево",
                "name": "Сверните налево на {way_name:accusative}",
                "destination": "Сверните налево в направлении {destination}"
            },
            "right": {
                "default": "Сверните направо",
                "name": "Сверните направо на {way_name:accusative}",
                "destination": "Сверните направо в направлении {destination}"
            },
            "straight": {
                "default": "Двигайтесь прямо",
                "name": "Двигайтесь прямо по {way_name:dative}",
                "destination": "Двигайтесь прямо в направлении {destination}"
            }
        },
        "exit roundabout": {
            "default": {
                "default": "Сверните с круговой развязки",
                "name": "Сверните с круговой развязки на {way_name:accusative}",
                "destination": "Сверните с круговой развязки в направлении {destination}"
            }
        },
        "exit rotary": {
            "default": {
                "default": "Сверните с круговой развязки",
                "name": "Сверните с круговой развязки на {way_name:accusative}",
                "destination": "Сверните с круговой развязки в направлении {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Двигайтесь {modifier}",
                "name": "Двигайтесь {modifier} на {way_name:accusative}",
                "destination": "Двигайтесь {modifier}  в направлении {destination}"
            },
            "left": {
                "default": "Поверните налево",
                "name": "Поверните налево на {way_name:accusative}",
                "destination": "Поверните налево в направлении {destination}"
            },
            "right": {
                "default": "Поверните направо",
                "name": "Поверните направо на {way_name:accusative}",
                "destination": "Поверните направо  в направлении {destination}"
            },
            "straight": {
                "default": "Двигайтесь прямо",
                "name": "Двигайтесь по {way_name:dative}",
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

},{}],41:[function(require,module,exports){
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
        "phrase": {
            "two linked by distance": "{instruction_one}, sedan efter {distance}, {instruction_two}",
            "two linked": "{instruction_one}, sedan {instruction_two}",
            "one in distance": "Om {distance}, {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "exit {exit}"
        },
        "arrive": {
            "default": {
                "default": "Du är framme vid din {nth} destination",
                "upcoming": "Du är snart framme vid din {nth} destination",
                "short": "Du är framme",
                "short-upcoming": "Du är snart framme",
                "named": "Du är framme vid {waypoint_name}"
            },
            "left": {
                "default": "Du är framme vid din {nth} destination, till vänster",
                "upcoming": "Du är snart framme vid din {nth} destination, till vänster",
                "short": "Du är framme",
                "short-upcoming": "Du är snart framme",
                "named": "Du är framme vid {waypoint_name}, till vänster"
            },
            "right": {
                "default": "Du är framme vid din {nth} destination, till höger",
                "upcoming": "Du är snart framme vid din {nth} destination, till höger",
                "short": "Du är framme",
                "short-upcoming": "Du är snart framme",
                "named": "Du är framme vid {waypoint_name}, till höger"
            },
            "sharp left": {
                "default": "Du är framme vid din {nth} destination, till vänster",
                "upcoming": "Du är snart framme vid din {nth} destination, till vänster",
                "short": "Du är framme",
                "short-upcoming": "Du är snart framme",
                "named": "Du är framme vid {waypoint_name}, till vänster"
            },
            "sharp right": {
                "default": "Du är framme vid din {nth} destination, till höger",
                "upcoming": "Du är snart framme vid din {nth} destination, till höger",
                "short": "Du är framme",
                "short-upcoming": "Du är snart framme",
                "named": "Du är framme vid {waypoint_name}, till höger"
            },
            "slight right": {
                "default": "Du är framme vid din {nth} destination, till höger",
                "upcoming": "Du är snart framme vid din {nth} destination, till höger",
                "short": "Du är framme",
                "short-upcoming": "Du är snart framme",
                "named": "Du är framme vid {waypoint_name}, till höger"
            },
            "slight left": {
                "default": "Du är framme vid din {nth} destination, till vänster",
                "upcoming": "Du är snart framme vid din {nth} destination, till vänster",
                "short": "Du är framme",
                "short-upcoming": "Du är snart framme",
                "named": "Du är framme vid {waypoint_name}, till vänster"
            },
            "straight": {
                "default": "Du är framme vid din {nth} destination, rakt fram",
                "upcoming": "Du är snart framme vid din {nth} destination, rakt fram",
                "short": "Du är framme",
                "short-upcoming": "Du är snart framme",
                "named": "Du är framme vid {waypoint_name}, rakt fram"
            }
        },
        "continue": {
            "default": {
                "default": "Sväng {modifier}",
                "name": "Sväng {modifier} och fortsätt på {way_name}",
                "destination": "Sväng {modifier} mot {destination}",
                "exit": "Sväng {modifier} in på {way_name}"
            },
            "straight": {
                "default": "Fortsätt rakt fram",
                "name": "Kör rakt fram och fortsätt på {way_name}",
                "destination": "Fortsätt mot {destination}",
                "distance": "Fortsätt rakt fram i {distance}",
                "namedistance": "Fortsätt på {way_name} i {distance}"
            },
            "sharp left": {
                "default": "Sväng vänster",
                "name": "Sväng vänster och fortsätt på {way_name}",
                "destination": "Sväng vänster mot {destination}"
            },
            "sharp right": {
                "default": "Sväng höger",
                "name": "Sväng höger och fortsätt på {way_name}",
                "destination": "Sväng höger mot {destination}"
            },
            "slight left": {
                "default": "Sväng vänster",
                "name": "Sväng vänster och fortsätt på {way_name}",
                "destination": "Sväng vänster mot {destination}"
            },
            "slight right": {
                "default": "Sväng höger",
                "name": "Sväng höger och fortsätt på {way_name}",
                "destination": "Sväng höger mot {destination}"
            },
            "uturn": {
                "default": "Gör en U-sväng",
                "name": "Gör en U-sväng och fortsätt på {way_name}",
                "destination": "Gör en U-sväng mot {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Kör åt {direction}",
                "name": "Kör åt {direction} på {way_name}",
                "namedistance": "Kör {distance} åt {direction} på {way_name}"
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
                "name": "Byt till {modifier} körfält, in på {way_name}",
                "destination": "Byt till {modifier} körfält, mot {destination}"
            },
            "straight": {
                "default": "Fortsätt",
                "name": "Kör in på {way_name}",
                "destination": "Kör mot {destination}"
            },
            "slight left": {
                "default": "Byt till vänstra körfältet",
                "name": "Byt till vänstra körfältet, in på {way_name}",
                "destination": "Byt till vänstra körfältet, mot {destination}"
            },
            "slight right": {
                "default": "Byt till högra körfältet",
                "name": "Byt till högra körfältet, in på {way_name}",
                "destination": "Byt till högra körfältet, mot {destination}"
            },
            "sharp left": {
                "default": "Byt till vänstra körfältet",
                "name": "Byt till vänstra körfältet, in på {way_name}",
                "destination": "Byt till vänstra körfältet, mot {destination}"
            },
            "sharp right": {
                "default": "Byt till högra körfältet",
                "name": "Byt till högra körfältet, in på {way_name}",
                "destination": "Byt till högra körfältet, mot {destination}"
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
                    "name": "I rondellen, ta avfarten in på {way_name}",
                    "destination": "I rondellen, ta av mot {destination}"
                },
                "name": {
                    "default": "Kör in i {rotary_name}",
                    "name": "I {rotary_name}, ta av in på {way_name}",
                    "destination": "I {rotary_name}, ta av mot {destination}"
                },
                "exit": {
                    "default": "I rondellen, ta {exit_number} avfarten",
                    "name": "I rondellen, ta {exit_number} avfarten in på {way_name}",
                    "destination": "I rondellen, ta {exit_number} avfarten mot {destination}"
                },
                "name_exit": {
                    "default": "I {rotary_name}, ta {exit_number} avfarten",
                    "name": "I {rotary_name}, ta {exit_number}  avfarten in på {way_name}",
                    "destination": "I {rotary_name}, ta {exit_number} avfarten mot {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "I rondellen, ta {exit_number} avfarten",
                    "name": "I rondellen, ta {exit_number} avfarten in på {way_name}",
                    "destination": "I rondellen, ta {exit_number} avfarten mot {destination}"
                },
                "default": {
                    "default": "Kör in i rondellen",
                    "name": "I rondellen, ta avfarten in på {way_name}",
                    "destination": "I rondellen, ta av mot {destination}"
                }
            }
        },
        "roundabout turn": {
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
                "default": "Fortsätt rakt fram",
                "name": "Fortsätt rakt fram in på {way_name}",
                "destination": "Fortsätt rakt fram mot {destination}"
            }
        },
        "exit roundabout": {
            "default": {
                "default": "Kör ut ur rondellen",
                "name": "Kör ut ur rondellen in på {way_name}",
                "destination": "Kör ut ur rondellen mot {destination}"
            }
        },
        "exit rotary": {
            "default": {
                "default": "Kör ut ur rondellen",
                "name": "Kör ut ur rondellen in på {way_name}",
                "destination": "Kör ut ur rondellen mot {destination}"
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

},{}],42:[function(require,module,exports){
module.exports={
    "meta": {
        "capitalizeFirstLetter": true
    },
    "v5": {
        "constants": {
            "ordinalize": {
                "1": "birinci",
                "2": "ikinci",
                "3": "üçüncü",
                "4": "dördüncü",
                "5": "beşinci",
                "6": "altıncı",
                "7": "yedinci",
                "8": "sekizinci",
                "9": "dokuzuncu",
                "10": "onuncu"
            },
            "direction": {
                "north": "kuzey",
                "northeast": "kuzeydoğu",
                "east": "doğu",
                "southeast": "güneydoğu",
                "south": "güney",
                "southwest": "güneybatı",
                "west": "batı",
                "northwest": "kuzeybatı"
            },
            "modifier": {
                "left": "sol",
                "right": "sağ",
                "sharp left": "keskin sol",
                "sharp right": "keskin sağ",
                "slight left": "hafif sol",
                "slight right": "hafif sağ",
                "straight": "düz",
                "uturn": "U dönüşü"
            },
            "lanes": {
                "xo": "Sağda kalın",
                "ox": "Solda kalın",
                "xox": "Ortada kalın",
                "oxo": "Solda veya sağda kalın"
            }
        },
        "modes": {
            "ferry": {
                "default": "Vapur kullan",
                "name": "{way_name} vapurunu kullan",
                "destination": "{destination} istikametine giden vapuru kullan"
            }
        },
        "phrase": {
            "two linked by distance": "{instruction_one} ve {distance} sonra {instruction_two}",
            "two linked": "{instruction_one} ve sonra {instruction_two}",
            "one in distance": "{distance} sonra, {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "exit {exit}"
        },
        "arrive": {
            "default": {
                "default": "{nth} hedefinize ulaştınız",
                "upcoming": "{nth} hedefinize ulaştınız",
                "short": "{nth} hedefinize ulaştınız",
                "short-upcoming": "{nth} hedefinize ulaştınız",
                "named": "{waypoint_name} ulaştınız"
            },
            "left": {
                "default": "{nth} hedefinize ulaştınız, hedefiniz solunuzdadır",
                "upcoming": "{nth} hedefinize ulaştınız, hedefiniz solunuzdadır",
                "short": "{nth} hedefinize ulaştınız",
                "short-upcoming": "{nth} hedefinize ulaştınız",
                "named": "{waypoint_name} ulaştınız, hedefiniz solunuzdadır"
            },
            "right": {
                "default": "{nth} hedefinize ulaştınız, hedefiniz sağınızdadır",
                "upcoming": "{nth} hedefinize ulaştınız, hedefiniz sağınızdadır",
                "short": "{nth} hedefinize ulaştınız",
                "short-upcoming": "{nth} hedefinize ulaştınız",
                "named": "{waypoint_name} ulaştınız, hedefiniz sağınızdadır"
            },
            "sharp left": {
                "default": "{nth} hedefinize ulaştınız, hedefiniz solunuzdadır",
                "upcoming": "{nth} hedefinize ulaştınız, hedefiniz solunuzdadır",
                "short": "{nth} hedefinize ulaştınız",
                "short-upcoming": "{nth} hedefinize ulaştınız",
                "named": "{waypoint_name} ulaştınız, hedefiniz solunuzdadır"
            },
            "sharp right": {
                "default": "{nth} hedefinize ulaştınız, hedefiniz sağınızdadır",
                "upcoming": "{nth} hedefinize ulaştınız, hedefiniz sağınızdadır",
                "short": "{nth} hedefinize ulaştınız",
                "short-upcoming": "{nth} hedefinize ulaştınız",
                "named": "{waypoint_name} ulaştınız, hedefiniz sağınızdadır"
            },
            "slight right": {
                "default": "{nth} hedefinize ulaştınız, hedefiniz sağınızdadır",
                "upcoming": "{nth} hedefinize ulaştınız, hedefiniz sağınızdadır",
                "short": "{nth} hedefinize ulaştınız",
                "short-upcoming": "{nth} hedefinize ulaştınız",
                "named": "{waypoint_name} ulaştınız, hedefiniz sağınızdadır"
            },
            "slight left": {
                "default": "{nth} hedefinize ulaştınız, hedefiniz solunuzdadır",
                "upcoming": "{nth} hedefinize ulaştınız, hedefiniz solunuzdadır",
                "short": "{nth} hedefinize ulaştınız",
                "short-upcoming": "{nth} hedefinize ulaştınız",
                "named": "{waypoint_name} ulaştınız, hedefiniz solunuzdadır"
            },
            "straight": {
                "default": "{nth} hedefinize ulaştınız, hedefiniz karşınızdadır",
                "upcoming": "{nth} hedefinize ulaştınız, hedefiniz karşınızdadır",
                "short": "{nth} hedefinize ulaştınız",
                "short-upcoming": "{nth} hedefinize ulaştınız",
                "named": "{waypoint_name} ulaştınız, hedefiniz karşınızdadır"
            }
        },
        "continue": {
            "default": {
                "default": "{modifier} yöne dön",
                "name": "{way_name} üzerinde kalmak için {modifier} yöne dön",
                "destination": "{destination} istikametinde {modifier} yöne dön",
                "exit": "{way_name} üzerinde {modifier} yöne dön"
            },
            "straight": {
                "default": "Düz devam edin",
                "name": "{way_name} üzerinde kalmak için düz devam et",
                "destination": "{destination} istikametinde devam et",
                "distance": "{distance} boyunca düz devam et",
                "namedistance": "{distance} boyunca {way_name} üzerinde devam et"
            },
            "sharp left": {
                "default": "Sola keskin dönüş yap",
                "name": "{way_name} üzerinde kalmak için sola keskin dönüş yap",
                "destination": "{destination} istikametinde sola keskin dönüş yap"
            },
            "sharp right": {
                "default": "Sağa keskin dönüş yap",
                "name": "{way_name} üzerinde kalmak için sağa keskin dönüş yap",
                "destination": "{destination} istikametinde sağa keskin dönüş yap"
            },
            "slight left": {
                "default": "Sola hafif dönüş yap",
                "name": "{way_name} üzerinde kalmak için sola hafif dönüş yap",
                "destination": "{destination} istikametinde sola hafif dönüş yap"
            },
            "slight right": {
                "default": "Sağa hafif dönüş yap",
                "name": "{way_name} üzerinde kalmak için sağa hafif dönüş yap",
                "destination": "{destination} istikametinde sağa hafif dönüş yap"
            },
            "uturn": {
                "default": "U dönüşü yapın",
                "name": "Bir U-dönüşü yap ve {way_name} devam et",
                "destination": "{destination} istikametinde bir U-dönüşü yap"
            }
        },
        "depart": {
            "default": {
                "default": "{direction} tarafına yönelin",
                "name": "{way_name} üzerinde {direction} yöne git",
                "namedistance": "Head {direction} on {way_name} for {distance}"
            }
        },
        "end of road": {
            "default": {
                "default": "{modifier} tarafa dönün",
                "name": "{way_name} üzerinde {modifier} yöne dön",
                "destination": "{destination} istikametinde {modifier} yöne dön"
            },
            "straight": {
                "default": "Düz devam edin",
                "name": "{way_name} üzerinde düz devam et",
                "destination": "{destination} istikametinde düz devam et"
            },
            "uturn": {
                "default": "Yolun sonunda U dönüşü yapın",
                "name": "Yolun sonunda {way_name} üzerinde bir U-dönüşü yap",
                "destination": "Yolun sonunda {destination} istikametinde bir U-dönüşü yap"
            }
        },
        "fork": {
            "default": {
                "default": "Yol ayrımında {modifier} yönde kal",
                "name": "{way_name} üzerindeki yol ayrımında {modifier} yönde kal",
                "destination": "{destination} istikametindeki yol ayrımında {modifier} yönde kal"
            },
            "slight left": {
                "default": "Çatalın solundan devam edin",
                "name": "Çatalın solundan {way_name} yoluna doğru ",
                "destination": "{destination} istikametindeki yol ayrımında solda kal"
            },
            "slight right": {
                "default": "Çatalın sağından devam edin",
                "name": "{way_name} üzerindeki yol ayrımında sağda kal",
                "destination": "{destination} istikametindeki yol ayrımında sağda kal"
            },
            "sharp left": {
                "default": "Çatalda keskin sola dönün",
                "name": "{way_name} yoluna doğru sola keskin dönüş yapın",
                "destination": "{destination} istikametinde sola keskin dönüş yap"
            },
            "sharp right": {
                "default": "Çatalda keskin sağa dönün",
                "name": "{way_name} yoluna doğru sağa keskin dönüş yapın",
                "destination": "{destination} istikametinde sağa keskin dönüş yap"
            },
            "uturn": {
                "default": "U dönüşü yapın",
                "name": "{way_name} yoluna U dönüşü yapın",
                "destination": "{destination} istikametinde bir U-dönüşü yap"
            }
        },
        "merge": {
            "default": {
                "default": "{modifier} yöne gir",
                "name": "{way_name} üzerinde {modifier} yöne gir",
                "destination": "{destination} istikametinde {modifier} yöne gir"
            },
            "straight": {
                "default": "düz yöne gir",
                "name": "{way_name} üzerinde düz yöne gir",
                "destination": "{destination} istikametinde düz yöne gir"
            },
            "slight left": {
                "default": "Sola gir",
                "name": "{way_name} üzerinde sola gir",
                "destination": "{destination} istikametinde sola gir"
            },
            "slight right": {
                "default": "Sağa gir",
                "name": "{way_name} üzerinde sağa gir",
                "destination": "{destination} istikametinde sağa gir"
            },
            "sharp left": {
                "default": "Sola gir",
                "name": "{way_name} üzerinde sola gir",
                "destination": "{destination} istikametinde sola gir"
            },
            "sharp right": {
                "default": "Sağa gir",
                "name": "{way_name} üzerinde sağa gir",
                "destination": "{destination} istikametinde sağa gir"
            },
            "uturn": {
                "default": "U dönüşü yapın",
                "name": "{way_name} yoluna U dönüşü yapın",
                "destination": "{destination} istikametinde bir U-dönüşü yap"
            }
        },
        "new name": {
            "default": {
                "default": "{modifier} yönde devam et",
                "name": "{way_name} üzerinde {modifier} yönde devam et",
                "destination": "{destination} istikametinde {modifier} yönde devam et"
            },
            "straight": {
                "default": "Düz devam et",
                "name": "{way_name} üzerinde devam et",
                "destination": "{destination} istikametinde devam et"
            },
            "sharp left": {
                "default": "Sola keskin dönüş yapın",
                "name": "{way_name} yoluna doğru sola keskin dönüş yapın",
                "destination": "{destination} istikametinde sola keskin dönüş yap"
            },
            "sharp right": {
                "default": "Sağa keskin dönüş yapın",
                "name": "{way_name} yoluna doğru sağa keskin dönüş yapın",
                "destination": "{destination} istikametinde sağa keskin dönüş yap"
            },
            "slight left": {
                "default": "Hafif soldan devam edin",
                "name": "{way_name} üzerinde hafif solda devam et",
                "destination": "{destination} istikametinde hafif solda devam et"
            },
            "slight right": {
                "default": "Hafif sağdan devam edin",
                "name": "{way_name} üzerinde hafif sağda devam et",
                "destination": "{destination} istikametinde hafif sağda devam et"
            },
            "uturn": {
                "default": "U dönüşü yapın",
                "name": "{way_name} yoluna U dönüşü yapın",
                "destination": "{destination} istikametinde bir U-dönüşü yap"
            }
        },
        "notification": {
            "default": {
                "default": "{modifier} yönde devam et",
                "name": "{way_name} üzerinde {modifier} yönde devam et",
                "destination": "{destination} istikametinde {modifier} yönde devam et"
            },
            "uturn": {
                "default": "U dönüşü yapın",
                "name": "{way_name} yoluna U dönüşü yapın",
                "destination": "{destination} istikametinde bir U-dönüşü yap"
            }
        },
        "off ramp": {
            "default": {
                "default": "Bağlantı yoluna geç",
                "name": "{way_name} üzerindeki bağlantı yoluna geç",
                "destination": "{destination} istikametine giden bağlantı yoluna geç",
                "exit": "{exit} çıkış yoluna geç",
                "exit_destination": "{destination} istikametindeki {exit} çıkış yoluna geç"
            },
            "left": {
                "default": "Soldaki bağlantı yoluna geç",
                "name": "{way_name} üzerindeki sol bağlantı yoluna geç",
                "destination": "{destination} istikametine giden sol bağlantı yoluna geç",
                "exit": "Soldaki {exit} çıkış yoluna geç",
                "exit_destination": "{destination} istikametindeki {exit} sol çıkış yoluna geç"
            },
            "right": {
                "default": "Sağdaki bağlantı yoluna geç",
                "name": "{way_name} üzerindeki sağ bağlantı yoluna geç",
                "destination": "{destination} istikametine giden sağ bağlantı yoluna geç",
                "exit": "Sağdaki {exit} çıkış yoluna geç",
                "exit_destination": "{destination} istikametindeki {exit} sağ çıkış yoluna geç"
            },
            "sharp left": {
                "default": "Soldaki bağlantı yoluna geç",
                "name": "{way_name} üzerindeki sol bağlantı yoluna geç",
                "destination": "{destination} istikametine giden sol bağlantı yoluna geç",
                "exit": "Soldaki {exit} çıkış yoluna geç",
                "exit_destination": "{destination} istikametindeki {exit} sol çıkış yoluna geç"
            },
            "sharp right": {
                "default": "Sağdaki bağlantı yoluna geç",
                "name": "{way_name} üzerindeki sağ bağlantı yoluna geç",
                "destination": "{destination} istikametine giden sağ bağlantı yoluna geç",
                "exit": "Sağdaki {exit} çıkış yoluna geç",
                "exit_destination": "{destination} istikametindeki {exit} sağ çıkış yoluna geç"
            },
            "slight left": {
                "default": "Soldaki bağlantı yoluna geç",
                "name": "{way_name} üzerindeki sol bağlantı yoluna geç",
                "destination": "{destination} istikametine giden sol bağlantı yoluna geç",
                "exit": "Soldaki {exit} çıkış yoluna geç",
                "exit_destination": "{destination} istikametindeki {exit} sol çıkış yoluna geç"
            },
            "slight right": {
                "default": "Sağdaki bağlantı yoluna geç",
                "name": "{way_name} üzerindeki sağ bağlantı yoluna geç",
                "destination": "{destination} istikametine giden sağ bağlantı yoluna geç",
                "exit": "Sağdaki {exit} çıkış yoluna geç",
                "exit_destination": "{destination} istikametindeki {exit} sağ çıkış yoluna geç"
            }
        },
        "on ramp": {
            "default": {
                "default": "Bağlantı yoluna geç",
                "name": "{way_name} üzerindeki bağlantı yoluna geç",
                "destination": "{destination} istikametine giden bağlantı yoluna geç"
            },
            "left": {
                "default": "Soldaki bağlantı yoluna geç",
                "name": "{way_name} üzerindeki sol bağlantı yoluna geç",
                "destination": "{destination} istikametine giden sol bağlantı yoluna geç"
            },
            "right": {
                "default": "Sağdaki bağlantı yoluna geç",
                "name": "{way_name} üzerindeki sağ bağlantı yoluna geç",
                "destination": "{destination} istikametine giden sağ bağlantı yoluna geç"
            },
            "sharp left": {
                "default": "Soldaki bağlantı yoluna geç",
                "name": "{way_name} üzerindeki sol bağlantı yoluna geç",
                "destination": "{destination} istikametine giden sol bağlantı yoluna geç"
            },
            "sharp right": {
                "default": "Sağdaki bağlantı yoluna geç",
                "name": "{way_name} üzerindeki sağ bağlantı yoluna geç",
                "destination": "{destination} istikametine giden sağ bağlantı yoluna geç"
            },
            "slight left": {
                "default": "Soldaki bağlantı yoluna geç",
                "name": "{way_name} üzerindeki sol bağlantı yoluna geç",
                "destination": "{destination} istikametine giden sol bağlantı yoluna geç"
            },
            "slight right": {
                "default": "Sağdaki bağlantı yoluna geç",
                "name": "{way_name} üzerindeki sağ bağlantı yoluna geç",
                "destination": "{destination} istikametine giden sağ bağlantı yoluna geç"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Dönel kavşağa gir",
                    "name": "Dönel kavşağa gir ve {way_name} üzerinde çık",
                    "destination": "Dönel kavşağa gir ve {destination} istikametinde çık"
                },
                "name": {
                    "default": "{rotary_name} dönel kavşağa gir",
                    "name": "{rotary_name} dönel kavşağa gir ve {way_name} üzerinde çık",
                    "destination": "{rotary_name} dönel kavşağa gir ve {destination} istikametinde çık"
                },
                "exit": {
                    "default": "Dönel kavşağa gir ve {exit_number} numaralı çıkışa gir",
                    "name": "Dönel kavşağa gir ve {way_name} üzerindeki {exit_number} numaralı çıkışa gir",
                    "destination": "Dönel kavşağa gir ve {destination} istikametindeki {exit_number} numaralı çıkışa gir"
                },
                "name_exit": {
                    "default": "{rotary_name} dönel kavşağa gir ve {exit_number} numaralı çıkışa gir",
                    "name": "{rotary_name} dönel kavşağa gir ve {way_name} üzerindeki {exit_number} numaralı çıkışa gir",
                    "destination": "{rotary_name} dönel kavşağa gir ve {destination} istikametindeki {exit_number} numaralı çıkışa gir"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "Göbekli kavşağa gir ve {exit_number} numaralı çıkışa gir",
                    "name": "Göbekli kavşağa gir ve {way_name} üzerindeki {exit_number} numaralı çıkışa gir",
                    "destination": "Göbekli kavşağa gir ve {destination} istikametindeki {exit_number} numaralı çıkışa gir"
                },
                "default": {
                    "default": "Göbekli kavşağa gir",
                    "name": "Göbekli kavşağa gir ve {way_name} üzerinde çık",
                    "destination": "Göbekli kavşağa gir ve {destination} istikametinde çık"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "{modifier} yöne dön",
                "name": "{way_name} üzerinde {modifier} yöne dön",
                "destination": "{destination} istikametinde {modifier} yöne dön"
            },
            "left": {
                "default": "Sola dön",
                "name": "{way_name} üzerinde sola dön",
                "destination": "{destination} istikametinde sola dön"
            },
            "right": {
                "default": "Sağa dön",
                "name": "{way_name} üzerinde sağa dön",
                "destination": "{destination} istikametinde sağa dön"
            },
            "straight": {
                "default": "Düz devam et",
                "name": "{way_name} üzerinde düz devam et",
                "destination": "{destination} istikametinde düz devam et"
            }
        },
        "exit roundabout": {
            "default": {
                "default": "{modifier} yöne dön",
                "name": "{way_name} üzerinde {modifier} yöne dön",
                "destination": "{destination} istikametinde {modifier} yöne dön"
            },
            "left": {
                "default": "Sola dön",
                "name": "{way_name} üzerinde sola dön",
                "destination": "{destination} istikametinde sola dön"
            },
            "right": {
                "default": "Sağa dön",
                "name": "{way_name} üzerinde sağa dön",
                "destination": "{destination} istikametinde sağa dön"
            },
            "straight": {
                "default": "Düz devam et",
                "name": "{way_name} üzerinde düz devam et",
                "destination": "{destination} istikametinde düz devam et"
            }
        },
        "exit rotary": {
            "default": {
                "default": "{modifier} yöne dön",
                "name": "{way_name} üzerinde {modifier} yöne dön",
                "destination": "{destination} istikametinde {modifier} yöne dön"
            },
            "left": {
                "default": "Sola dön",
                "name": "{way_name} üzerinde sola dön",
                "destination": "{destination} istikametinde sola dön"
            },
            "right": {
                "default": "Sağa dön",
                "name": "{way_name} üzerinde sağa dön",
                "destination": "{destination} istikametinde sağa dön"
            },
            "straight": {
                "default": "Düz devam et",
                "name": "{way_name} üzerinde düz devam et",
                "destination": "{destination} istikametinde düz devam et"
            }
        },
        "turn": {
            "default": {
                "default": "{modifier} yöne dön",
                "name": "{way_name} üzerinde {modifier} yöne dön",
                "destination": "{destination} istikametinde {modifier} yöne dön"
            },
            "left": {
                "default": "Sola dönün",
                "name": "{way_name} üzerinde sola dön",
                "destination": "{destination} istikametinde sola dön"
            },
            "right": {
                "default": "Sağa dönün",
                "name": "{way_name} üzerinde sağa dön",
                "destination": "{destination} istikametinde sağa dön"
            },
            "straight": {
                "default": "Düz git",
                "name": "{way_name} üzerinde düz git",
                "destination": "{destination} istikametinde düz git"
            }
        },
        "use lane": {
            "no_lanes": {
                "default": "Düz devam edin"
            },
            "default": {
                "default": "{lane_instruction}"
            }
        }
    }
}

},{}],43:[function(require,module,exports){
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
        "phrase": {
            "two linked by distance": "{instruction_one}, потім, через {distance}, {instruction_two}",
            "two linked": "{instruction_one}, потім {instruction_two}",
            "one in distance": "Через {distance}, {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "з'їзд {exit}"
        },
        "arrive": {
            "default": {
                "default": "Ви прибули у ваш {nth} пункт призначення",
                "upcoming": "Ви наближаєтесь до вашого {nth} місця призначення",
                "short": "Ви прибули",
                "short-upcoming": "Ви прибудете",
                "named": "Ви прибули у {waypoint_name}"
            },
            "left": {
                "default": "Ви прибули у ваш {nth} пункт призначення, він – ліворуч",
                "upcoming": "Ви наближаєтесь до вашого {nth} місця призначення, ліворуч",
                "short": "Ви прибули",
                "short-upcoming": "Ви прибудете",
                "named": "Ви прибули у {waypoint_name} ліворуч"
            },
            "right": {
                "default": "Ви прибули у ваш {nth} пункт призначення, він – праворуч",
                "upcoming": "Ви наближаєтесь до вашого {nth} місця призначення, праворуч",
                "short": "Ви прибули",
                "short-upcoming": "Ви прибудете",
                "named": "Ви прибули у {waypoint_name} праворуч"
            },
            "sharp left": {
                "default": "Ви прибули у ваш {nth} пункт призначення, він – ліворуч",
                "upcoming": "Ви наближаєтесь до вашого {nth} місця призначення, ліворуч",
                "short": "Ви прибули",
                "short-upcoming": "Ви прибудете",
                "named": "Ви прибули у {waypoint_name} ліворуч"
            },
            "sharp right": {
                "default": "Ви прибули у ваш {nth} пункт призначення, він – праворуч",
                "upcoming": "Ви наближаєтесь до вашого {nth} місця призначення, праворуч",
                "short": "Ви прибули",
                "short-upcoming": "Ви прибудете",
                "named": "Ви прибули у {waypoint_name} праворуч"
            },
            "slight right": {
                "default": "Ви прибули у ваш {nth} пункт призначення, він – праворуч",
                "upcoming": "Ви наближаєтесь до вашого {nth} місця призначення, праворуч",
                "short": "Ви прибули",
                "short-upcoming": "Ви прибудете",
                "named": "Ви прибули у {waypoint_name} праворуч"
            },
            "slight left": {
                "default": "Ви прибули у ваш {nth} пункт призначення, він – ліворуч",
                "upcoming": "Ви наближаєтесь до вашого {nth} місця призначення, ліворуч",
                "short": "Ви прибули",
                "short-upcoming": "Ви прибудете",
                "named": "Ви прибули у {waypoint_name} ліворуч"
            },
            "straight": {
                "default": "Ви прибули у ваш {nth} пункт призначення, він – прямо перед вами",
                "upcoming": "Ви наближаєтесь до вашого {nth} місця призначення, прямо перед вами",
                "short": "Ви прибули",
                "short-upcoming": "Ви прибудете",
                "named": "Ви прибули у {waypoint_name} прямо перед вами"
            }
        },
        "continue": {
            "default": {
                "default": "Поверніть {modifier}",
                "name": "Поверніть{modifier} залишаючись на {way_name}",
                "destination": "Поверніть {modifier} у напрямку {destination}",
                "exit": "Поверніть {modifier} на {way_name}"
            },
            "straight": {
                "default": "Продовжуйте рух прямо",
                "name": "Продовжуйте рух прямо залишаючись на {way_name}",
                "destination": "Рухайтесь у напрямку {destination}",
                "distance": "Продовжуйте рух прямо {distance}",
                "namedistance": "Продовжуйте рух по {way_name} {distance}"
            },
            "sharp left": {
                "default": "Поверніть різко ліворуч",
                "name": "Поверніть різко ліворуч щоб залишитись на {way_name}",
                "destination": "Поверніть різко ліворуч у напрямку {destination}"
            },
            "sharp right": {
                "default": "Поверніть різко праворуч",
                "name": "Поверніть різко праворуч щоб залишитись на {way_name}",
                "destination": "Поверніть різко праворуч у напрямку {destination}"
            },
            "slight left": {
                "default": "Поверніть різко ліворуч",
                "name": "Поверніть плавно ліворуч щоб залишитись на {way_name}",
                "destination": "Поверніть плавно ліворуч у напрямку {destination}"
            },
            "slight right": {
                "default": "Поверніть плавно праворуч",
                "name": "Поверніть плавно праворуч щоб залишитись на {way_name}",
                "destination": "Поверніть плавно праворуч у напрямку {destination}"
            },
            "uturn": {
                "default": "Здійсніть розворот",
                "name": "Здійсніть розворот та рухайтесь по {way_name}",
                "destination": "Здійсніть розворот у напрямку {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Прямуйте на {direction}",
                "name": "Прямуйте на {direction} по {way_name}",
                "namedistance": "Прямуйте на {direction} по {way_name} {distance}"
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
                "name": "Продовжуйте рух прямо до {way_name}",
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
                "name": "Тримайтеся {modifier} і рухайтесь на {way_name}",
                "destination": "Тримайтеся {modifier} в напрямку {destination}"
            },
            "slight left": {
                "default": "На роздоріжжі тримайтеся ліворуч",
                "name": "Тримайтеся ліворуч і рухайтесь на {way_name}",
                "destination": "Тримайтеся ліворуч в напрямку {destination}"
            },
            "slight right": {
                "default": "На роздоріжжі тримайтеся праворуч",
                "name": "Тримайтеся праворуч і рухайтесь на {way_name}",
                "destination": "Тримайтеся праворуч в напрямку {destination}"
            },
            "sharp left": {
                "default": "На роздоріжжі різко поверніть ліворуч",
                "name": "Прийміть різко ліворуч на {way_name}",
                "destination": "Прийміть різко ліворуч у напрямку {destination}"
            },
            "sharp right": {
                "default": "На роздоріжжі різко поверніть праворуч",
                "name": "Прийміть різко праворуч на {way_name}",
                "destination": "Прийміть різко праворуч у напрямку {destination}"
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
            "straight": {
                "default": "Приєднайтеся до потоку",
                "name": "Приєднайтеся до потоку на {way_name}",
                "destination": "Приєднайтеся до потоку у напрямку {destination}"
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
                "default": "Рухайтесь прямо",
                "name": "Рухайтесь по {way_name}",
                "destination": "Рухайтесь у напрямку {destination}"
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
                "default": "Рухайтесь плавно ліворуч",
                "name": "Рухайтесь плавно ліворуч на {way_name}",
                "destination": "Рухайтесь плавно ліворуч у напрямку {destination}"
            },
            "slight right": {
                "default": "Рухайтесь плавно праворуч",
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
                    "default": "Рухайтесь по колу та повереніть у {exit_number} з'їзд",
                    "name": "Рухайтесь по колу та поверніть у {exit_number} з'їзд на {way_name}",
                    "destination": "Рухайтесь по колу та поверніть у {exit_number} з'їзд у напрямку {destination}"
                },
                "default": {
                    "default": "Рухайтесь по колу",
                    "name": "Рухайтесь по колу до {way_name}",
                    "destination": "Рухайтесь по колу в напрямку {destination}"
                }
            }
        },
        "roundabout turn": {
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
                "name": "Продовжуйте рух прямо до {way_name}",
                "destination": "Продовжуйте рух прямо у напрямку {destination}"
            }
        },
        "exit roundabout": {
            "default": {
                "default": "Залишить коло",
                "name": "Залишить коло на {way_name} зʼїзді",
                "destination": "Залишить коло в напрямку {destination}"
            }
        },
        "exit rotary": {
            "default": {
                "default": "Залишить коло",
                "name": "Залишить коло на {way_name} зʼїзді",
                "destination": "Залишить коло в напрямку {destination}"
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

},{}],44:[function(require,module,exports){
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
        "phrase": {
            "two linked by distance": "{instruction_one}, rồi {distance} nữa thì {instruction_two}",
            "two linked": "{instruction_one}, rồi {instruction_two}",
            "one in distance": "{distance} nữa thì {instruction_one}",
            "name and ref": "{name} ({ref})",
            "exit with number": "lối ra {exit}"
        },
        "arrive": {
            "default": {
                "default": "Đến nơi {nth}",
                "upcoming": "Đến nơi {nth}",
                "short": "Đến nơi",
                "short-upcoming": "Đến nơi",
                "named": "Đến {waypoint_name}"
            },
            "left": {
                "default": "Đến nơi {nth} ở bên trái",
                "upcoming": "Đến nơi {nth} ở bên trái",
                "short": "Đến nơi",
                "short-upcoming": "Đến nơi",
                "named": "Đến {waypoint_name} ở bên trái"
            },
            "right": {
                "default": "Đến nơi {nth} ở bên phải",
                "upcoming": "Đến nơi {nth} ở bên phải",
                "short": "Đến nơi",
                "short-upcoming": "Đến nơi",
                "named": "Đến {waypoint_name} ở bên phải"
            },
            "sharp left": {
                "default": "Đến nơi {nth} ở bên trái",
                "upcoming": "Đến nơi {nth} ở bên trái",
                "short": "Đến nơi",
                "short-upcoming": "Đến nơi",
                "named": "Đến {waypoint_name} ở bên trái"
            },
            "sharp right": {
                "default": "Đến nơi {nth} ở bên phải",
                "upcoming": "Đến nơi {nth} ở bên phải",
                "short": "Đến nơi",
                "short-upcoming": "Đến nơi",
                "named": "Đến {waypoint_name} ở bên phải"
            },
            "slight right": {
                "default": "Đến nơi {nth} ở bên phải",
                "upcoming": "Đến nơi {nth} ở bên phải",
                "short": "Đến nơi",
                "short-upcoming": "Đến nơi",
                "named": "Đến {waypoint_name} ở bên phải"
            },
            "slight left": {
                "default": "Đến nơi {nth} ở bên trái",
                "upcoming": "Đến nơi {nth} ở bên trái",
                "short": "Đến nơi",
                "short-upcoming": "Đến nơi",
                "named": "Đến {waypoint_name} ở bên trái"
            },
            "straight": {
                "default": "Đến nơi {nth} ở trước mặt",
                "upcoming": "Đến nơi {nth} ở trước mặt",
                "short": "Đến nơi",
                "short-upcoming": "Đến nơi",
                "named": "Đến {waypoint_name} ở trước mặt"
            }
        },
        "continue": {
            "default": {
                "default": "Quẹo {modifier}",
                "name": "Quẹo {modifier} để chạy tiếp trên {way_name}",
                "destination": "Quẹo {modifier} về {destination}",
                "exit": "Quẹo {modifier} vào {way_name}"
            },
            "straight": {
                "default": "Chạy thẳng",
                "name": "Chạy tiếp trên {way_name}",
                "destination": "Chạy tiếp về {destination}",
                "distance": "Chạy thẳng cho {distance}",
                "namedistance": "Chạy tiếp trên {way_name} cho {distance}"
            },
            "sharp left": {
                "default": "Quẹo gắt bên trái",
                "name": "Quẹo gắt bên trái để chạy tiếp trên {way_name}",
                "destination": "Quẹo gắt bên trái về {destination}"
            },
            "sharp right": {
                "default": "Quẹo gắt bên phải",
                "name": "Quẹo gắt bên phải để chạy tiếp trên {way_name}",
                "destination": "Quẹo gắt bên phải về {destination}"
            },
            "slight left": {
                "default": "Nghiêng về bên trái",
                "name": "Nghiêng về bên trái để chạy tiếp trên {way_name}",
                "destination": "Nghiêng về bên trái về {destination}"
            },
            "slight right": {
                "default": "Nghiêng về bên phải",
                "name": "Nghiêng về bên phải để chạy tiếp trên {way_name}",
                "destination": "Nghiêng về bên phải về {destination}"
            },
            "uturn": {
                "default": "Quẹo ngược lại",
                "name": "Quẹo ngược lại trên {way_name}",
                "destination": "Quẹo ngược về {destination}"
            }
        },
        "depart": {
            "default": {
                "default": "Đi về hướng {direction}",
                "name": "Đi về hướng {direction} trên {way_name}",
                "namedistance": "Đi về hướng {direction} trên {way_name} cho {distance}"
            }
        },
        "end of road": {
            "default": {
                "default": "Quẹo {modifier}",
                "name": "Quẹo {modifier} vào {way_name}",
                "destination": "Quẹo {modifier} về {destination}"
            },
            "straight": {
                "default": "Chạy thẳng",
                "name": "Chạy tiếp trên {way_name}",
                "destination": "Chạy tiếp về {destination}"
            },
            "uturn": {
                "default": "Quẹo ngược lại tại cuối đường",
                "name": "Quẹo ngược vào {way_name} tại cuối đường",
                "destination": "Quẹo ngược về {destination} tại cuối đường"
            }
        },
        "fork": {
            "default": {
                "default": "Đi bên {modifier} ở ngã ba",
                "name": "Giữ bên {modifier} vào {way_name}",
                "destination": "Giữ bên {modifier} về {destination}"
            },
            "slight left": {
                "default": "Nghiêng về bên trái ở ngã ba",
                "name": "Giữ bên trái vào {way_name}",
                "destination": "Giữ bên trái về {destination}"
            },
            "slight right": {
                "default": "Nghiêng về bên phải ở ngã ba",
                "name": "Giữ bên phải vào {way_name}",
                "destination": "Giữ bên phải về {destination}"
            },
            "sharp left": {
                "default": "Quẹo gắt bên trái ở ngã ba",
                "name": "Quẹo gắt bên trái vào {way_name}",
                "destination": "Quẹo gắt bên trái về {destination}"
            },
            "sharp right": {
                "default": "Quẹo gắt bên phải ở ngã ba",
                "name": "Quẹo gắt bên phải vào {way_name}",
                "destination": "Quẹo gắt bên phải về {destination}"
            },
            "uturn": {
                "default": "Quẹo ngược lại",
                "name": "Quẹo ngược lại {way_name}",
                "destination": "Quẹo ngược lại về {destination}"
            }
        },
        "merge": {
            "default": {
                "default": "Nhập sang {modifier}",
                "name": "Nhập sang {modifier} vào {way_name}",
                "destination": "Nhập sang {modifier} về {destination}"
            },
            "straight": {
                "default": "Nhập đường",
                "name": "Nhập vào {way_name}",
                "destination": "Nhập đường về {destination}"
            },
            "slight left": {
                "default": "Nhập sang trái",
                "name": "Nhập sang trái vào {way_name}",
                "destination": "Nhập sang trái về {destination}"
            },
            "slight right": {
                "default": "Nhập sang phải",
                "name": "Nhập sang phải vào {way_name}",
                "destination": "Nhập sang phải về {destination}"
            },
            "sharp left": {
                "default": "Nhập sang trái",
                "name": "Nhập sang trái vào {way_name}",
                "destination": "Nhập sang trái về {destination}"
            },
            "sharp right": {
                "default": "Nhập sang phải",
                "name": "Nhập sang phải vào {way_name}",
                "destination": "Nhập sang phải về {destination}"
            },
            "uturn": {
                "default": "Quẹo ngược lại",
                "name": "Quẹo ngược lại {way_name}",
                "destination": "Quẹo ngược lại về {destination}"
            }
        },
        "new name": {
            "default": {
                "default": "Chạy tiếp bên {modifier}",
                "name": "Chạy tiếp bên {modifier} trên {way_name}",
                "destination": "Chạy tiếp bên {modifier} về {destination}"
            },
            "straight": {
                "default": "Chạy thẳng",
                "name": "Chạy tiếp trên {way_name}",
                "destination": "Chạy tiếp về {destination}"
            },
            "sharp left": {
                "default": "Quẹo gắt bên trái",
                "name": "Quẹo gắt bên trái vào {way_name}",
                "destination": "Quẹo gắt bên trái về {destination}"
            },
            "sharp right": {
                "default": "Quẹo gắt bên phải",
                "name": "Quẹo gắt bên phải vào {way_name}",
                "destination": "Quẹo gắt bên phải về {destination}"
            },
            "slight left": {
                "default": "Nghiêng về bên trái",
                "name": "Nghiêng về bên trái vào {way_name}",
                "destination": "Nghiêng về bên trái về {destination}"
            },
            "slight right": {
                "default": "Nghiêng về bên phải",
                "name": "Nghiêng về bên phải vào {way_name}",
                "destination": "Nghiêng về bên phải về {destination}"
            },
            "uturn": {
                "default": "Quẹo ngược lại",
                "name": "Quẹo ngược lại {way_name}",
                "destination": "Quẹo ngược lại về {destination}"
            }
        },
        "notification": {
            "default": {
                "default": "Chạy tiếp bên {modifier}",
                "name": "Chạy tiếp bên {modifier} trên {way_name}",
                "destination": "Chạy tiếp bên {modifier} về {destination}"
            },
            "uturn": {
                "default": "Quẹo ngược lại",
                "name": "Quẹo ngược lại {way_name}",
                "destination": "Quẹo ngược lại về {destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "Đi đường nhánh",
                "name": "Đi đường nhánh {way_name}",
                "destination": "Đi đường nhánh về {destination}",
                "exit": "Đi theo lối ra {exit}",
                "exit_destination": "Đi theo lối ra {exit} về {destination}"
            },
            "left": {
                "default": "Đi đường nhánh bên trái",
                "name": "Đi đường nhánh {way_name} bên trái",
                "destination": "Đi đường nhánh bên trái về {destination}",
                "exit": "Đi theo lối ra {exit} bên trái",
                "exit_destination": "Đi theo lối ra {exit} bên trái về {destination}"
            },
            "right": {
                "default": "Đi đường nhánh bên phải",
                "name": "Đi đường nhánh {way_name} bên phải",
                "destination": "Đi đường nhánh bên phải về {destination}",
                "exit": "Đi theo lối ra {exit} bên phải",
                "exit_destination": "Đi theo lối ra {exit} bên phải về {destination}"
            },
            "sharp left": {
                "default": "Đi đường nhánh bên trái",
                "name": "Đi đường nhánh {way_name} bên trái",
                "destination": "Đi đường nhánh bên trái về {destination}",
                "exit": "Đi theo lối ra {exit} bên trái",
                "exit_destination": "Đi theo lối ra {exit} bên trái về {destination}"
            },
            "sharp right": {
                "default": "Đi đường nhánh bên phải",
                "name": "Đi đường nhánh {way_name} bên phải",
                "destination": "Đi đường nhánh bên phải về {destination}",
                "exit": "Đi theo lối ra {exit} bên phải",
                "exit_destination": "Đi theo lối ra {exit} bên phải về {destination}"
            },
            "slight left": {
                "default": "Đi đường nhánh bên trái",
                "name": "Đi đường nhánh {way_name} bên trái",
                "destination": "Đi đường nhánh bên trái về {destination}",
                "exit": "Đi theo lối ra {exit} bên trái",
                "exit_destination": "Đi theo lối ra {exit} bên trái về {destination}"
            },
            "slight right": {
                "default": "Đi đường nhánh bên phải",
                "name": "Đi đường nhánh {way_name} bên phải",
                "destination": "Đi đường nhánh bên phải về {destination}",
                "exit": "Đi theo lối ra {exit} bên phải",
                "exit_destination": "Đi theo lối ra {exit} bên phải về {destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "Đi đường nhánh",
                "name": "Đi đường nhánh {way_name}",
                "destination": "Đi đường nhánh về {destination}"
            },
            "left": {
                "default": "Đi đường nhánh bên trái",
                "name": "Đi đường nhánh {way_name} bên trái",
                "destination": "Đi đường nhánh bên trái về {destination}"
            },
            "right": {
                "default": "Đi đường nhánh bên phải",
                "name": "Đi đường nhánh {way_name} bên phải",
                "destination": "Đi đường nhánh bên phải về {destination}"
            },
            "sharp left": {
                "default": "Đi đường nhánh bên trái",
                "name": "Đi đường nhánh {way_name} bên trái",
                "destination": "Đi đường nhánh bên trái về {destination}"
            },
            "sharp right": {
                "default": "Đi đường nhánh bên phải",
                "name": "Đi đường nhánh {way_name} bên phải",
                "destination": "Đi đường nhánh bên phải về {destination}"
            },
            "slight left": {
                "default": "Đi đường nhánh bên trái",
                "name": "Đi đường nhánh {way_name} bên trái",
                "destination": "Đi đường nhánh bên trái về {destination}"
            },
            "slight right": {
                "default": "Đi đường nhánh bên phải",
                "name": "Đi đường nhánh {way_name} bên phải",
                "destination": "Đi đường nhánh bên phải về {destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "Đi vào bùng binh",
                    "name": "Đi vào bùng binh và ra tại {way_name}",
                    "destination": "Đi vào bùng binh và ra về {destination}"
                },
                "name": {
                    "default": "Đi vào {rotary_name}",
                    "name": "Đi vào {rotary_name} và ra tại {way_name}",
                    "destination": "Đi và {rotary_name} và ra về {destination}"
                },
                "exit": {
                    "default": "Đi vào bùng binh và ra tại đường {exit_number}",
                    "name": "Đi vào bùng binh và ra tại đường {exit_number} tức {way_name}",
                    "destination": "Đi vào bùng binh và ra tại đường {exit_number} về {destination}"
                },
                "name_exit": {
                    "default": "Đi vào {rotary_name} và ra tại đường {exit_number}",
                    "name": "Đi vào {rotary_name} và ra tại đường {exit_number} tức {way_name}",
                    "destination": "Đi vào {rotary_name} và ra tại đường {exit_number} về {destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "Đi vào bùng binh và ra tại đường {exit_number}",
                    "name": "Đi vào bùng binh và ra tại đường {exit_number} tức {way_name}",
                    "destination": "Đi vào bùng binh và ra tại đường {exit_number} về {destination}"
                },
                "default": {
                    "default": "Đi vào bùng binh",
                    "name": "Đi vào bùng binh và ra tại {way_name}",
                    "destination": "Đi vào bùng binh và ra về {destination}"
                }
            }
        },
        "roundabout turn": {
            "default": {
                "default": "Quẹo {modifier}",
                "name": "Quẹo {modifier} vào {way_name}",
                "destination": "Quẹo {modifier} về {destination}"
            },
            "left": {
                "default": "Quẹo trái",
                "name": "Quẹo trái vào {way_name}",
                "destination": "Quẹo trái về {destination}"
            },
            "right": {
                "default": "Quẹo phải",
                "name": "Quẹo phải vào {way_name}",
                "destination": "Quẹo phải về {destination}"
            },
            "straight": {
                "default": "Chạy thẳng",
                "name": "Chạy tiếp trên {way_name}",
                "destination": "Chạy tiếp về {destination}"
            }
        },
        "exit roundabout": {
            "default": {
                "default": "Ra bùng binh",
                "name": "Ra bùng binh vào {way_name}",
                "destination": "Ra bùng binh về {destination}"
            }
        },
        "exit rotary": {
            "default": {
                "default": "Ra bùng binh",
                "name": "Ra bùng binh vào {way_name}",
                "destination": "Ra bùng binh về {destination}"
            }
        },
        "turn": {
            "default": {
                "default": "Quẹo {modifier}",
                "name": "Quẹo {modifier} vào {way_name}",
                "destination": "Quẹo {modifier} về {destination}"
            },
            "left": {
                "default": "Quẹo trái",
                "name": "Quẹo trái vào {way_name}",
                "destination": "Quẹo trái về {destination}"
            },
            "right": {
                "default": "Quẹo phải",
                "name": "Quẹo phải vào {way_name}",
                "destination": "Quẹo phải về {destination}"
            },
            "straight": {
                "default": "Chạy thẳng",
                "name": "Chạy thẳng vào {way_name}",
                "destination": "Chạy thẳng về {destination}"
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

},{}],45:[function(require,module,exports){
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
                "sharp left": "急向左",
                "sharp right": "急向右",
                "slight left": "稍向左",
                "slight right": "稍向右",
                "straight": "直行",
                "uturn": "调头"
            },
            "lanes": {
                "xo": "靠右行驶",
                "ox": "靠左行驶",
                "xox": "保持在道路中间行驶",
                "oxo": "保持在道路左侧或右侧行驶"
            }
        },
        "modes": {
            "ferry": {
                "default": "乘坐轮渡",
                "name": "乘坐{way_name}轮渡",
                "destination": "乘坐开往{destination}的轮渡"
            }
        },
        "phrase": {
            "two linked by distance": "{instruction_one}，{distance}后{instruction_two}",
            "two linked": "{instruction_one}，随后{instruction_two}",
            "one in distance": "{distance}后{instruction_one}",
            "name and ref": "{name}（{ref}）",
            "exit with number": "出口{exit}"
        },
        "arrive": {
            "default": {
                "default": "您已经到达您的{nth}个目的地",
                "upcoming": "您即将到达您的{nth}个目的地",
                "short": "已到达目的地",
                "short-upcoming": "即将到达目的地",
                "named": "您已到达{waypoint_name}"
            },
            "left": {
                "default": "您已经到达您的{nth}个目的地，目的地在道路左侧",
                "upcoming": "您即将到达您的{nth}个目的地，目的地在道路左侧",
                "short": "已到达目的地",
                "short-upcoming": "即将到达目的地",
                "named": "您已到达{waypoint_name}，目的地在您左边。"
            },
            "right": {
                "default": "您已经到达您的{nth}个目的地，目的地在道路右侧",
                "upcoming": "您即将到达您的{nth}个目的地，目的地在道路右侧",
                "short": "已到达目的地",
                "short-upcoming": "即将到达目的地",
                "named": "您已到达{waypoint_name}，目的地在您右边。"
            },
            "sharp left": {
                "default": "您已经到达您的{nth}个目的地，目的地在道路左侧",
                "upcoming": "您即将到达您的{nth}个目的地，目的地在道路左侧",
                "short": "已到达目的地",
                "short-upcoming": "即将到达目的地",
                "named": "您已到达{waypoint_name}，目的地在您左边。"
            },
            "sharp right": {
                "default": "您已经到达您的{nth}个目的地，目的地在道路右侧",
                "upcoming": "您即将到达您的{nth}个目的地，目的地在道路右侧",
                "short": "已到达目的地",
                "short-upcoming": "即将到达目的地",
                "named": "您已到达{waypoint_name}，目的地在您右边。"
            },
            "slight right": {
                "default": "您已经到达您的{nth}个目的地，目的地在道路左侧",
                "upcoming": "您即将到达您的{nth}个目的地，目的地在道路左侧",
                "short": "已到达目的地",
                "short-upcoming": "即将到达目的地",
                "named": "您已到达{waypoint_name}，目的地在您右边。"
            },
            "slight left": {
                "default": "您已经到达您的{nth}个目的地，目的地在道路右侧",
                "upcoming": "您即将到达您的{nth}个目的地，目的地在道路右侧",
                "short": "已到达目的地",
                "short-upcoming": "即将到达目的地",
                "named": "您已到达{waypoint_name}，目的地在您左边。"
            },
            "straight": {
                "default": "您已经到达您的{nth}个目的地，目的地在您正前方",
                "upcoming": "您即将到达您的{nth}个目的地，目的地在您正前方",
                "short": "已到达目的地",
                "short-upcoming": "即将到达目的地",
                "named": "您已到达{waypoint_name}，目的地在您前方。"
            }
        },
        "continue": {
            "default": {
                "default": "{modifier}行驶",
                "name": "在{way_name}上继续{modifier}行驶",
                "destination": "{modifier}行驶，{destination}方向",
                "exit": "{modifier}行驶，驶入{way_name}"
            },
            "straight": {
                "default": "继续直行",
                "name": "在{way_name}上继续直行",
                "destination": "继续直行，前往{destination}",
                "distance": "继续直行{distance}",
                "namedistance": "继续在{way_name}上直行{distance}"
            },
            "sharp left": {
                "default": "前方左急转弯",
                "name": "前方左急转弯，继续在{way_name}上行驶",
                "destination": "左急转弯，前往{destination}"
            },
            "sharp right": {
                "default": "前方右急转弯",
                "name": "前方右急转弯，继续在{way_name}上行驶",
                "destination": "右急转弯，前往{destination}"
            },
            "slight left": {
                "default": "前方稍向左转",
                "name": "前方稍向左转，继续在{way_name}上行驶",
                "destination": "稍向左转，前往{destination}"
            },
            "slight right": {
                "default": "前方稍向右转",
                "name": "前方稍向右转，继续在{way_name}上行驶",
                "destination": "前方稍向右转，前往{destination}"
            },
            "uturn": {
                "default": "前方调头",
                "name": "前方调头，继续在{way_name}上行驶",
                "destination": "前方调头，前往{destination}"
            }
        },
        "depart": {
            "default": {
                "default": "出发向{direction}",
                "name": "出发向{direction}，驶入{way_name}",
                "namedistance": "出发向{direction}，在{way_name}上继续行驶{distance}"
            }
        },
        "end of road": {
            "default": {
                "default": "{modifier}行驶",
                "name": "{modifier}行驶，驶入{way_name}",
                "destination": "{modifier}行驶，前往{destination}"
            },
            "straight": {
                "default": "继续直行",
                "name": "继续直行，驶入{way_name}",
                "destination": "继续直行，前往{destination}"
            },
            "uturn": {
                "default": "在道路尽头调头",
                "name": "在道路尽头调头驶入{way_name}",
                "destination": "在道路尽头调头，前往{destination}"
            }
        },
        "fork": {
            "default": {
                "default": "在岔道保持{modifier}",
                "name": "在岔道口保持{modifier}，驶入{way_name}",
                "destination": "在岔道口保持{modifier}，前往{destination}"
            },
            "slight left": {
                "default": "在岔道口保持左侧行驶",
                "name": "在岔道口保持左侧行驶，驶入{way_name}",
                "destination": "在岔道口保持左侧行驶，前往{destination}"
            },
            "slight right": {
                "default": "在岔道口保持右侧行驶",
                "name": "在岔道口保持右侧行驶，驶入{way_name}",
                "destination": "在岔道口保持右侧行驶，前往{destination}"
            },
            "sharp left": {
                "default": "在岔道口左急转弯",
                "name": "在岔道口左急转弯，驶入{way_name}",
                "destination": "在岔道口左急转弯，前往{destination}"
            },
            "sharp right": {
                "default": "在岔道口右急转弯",
                "name": "在岔道口右急转弯，驶入{way_name}",
                "destination": "在岔道口右急转弯，前往{destination}"
            },
            "uturn": {
                "default": "前方调头",
                "name": "前方调头，驶入{way_name}",
                "destination": "前方调头，前往{destination}"
            }
        },
        "merge": {
            "default": {
                "default": "{modifier}并道",
                "name": "{modifier}并道，驶入{way_name}",
                "destination": "{modifier}并道，前往{destination}"
            },
            "straight": {
                "default": "直行并道",
                "name": "直行并道，驶入{way_name}",
                "destination": "直行并道，前往{destination}"
            },
            "slight left": {
                "default": "稍向左并道",
                "name": "稍向左并道，驶入{way_name}",
                "destination": "稍向左并道，前往{destination}"
            },
            "slight right": {
                "default": "稍向右并道",
                "name": "稍向右并道，驶入{way_name}",
                "destination": "稍向右并道，前往{destination}"
            },
            "sharp left": {
                "default": "急向左并道",
                "name": "急向左并道，驶入{way_name}",
                "destination": "急向左并道，前往{destination}"
            },
            "sharp right": {
                "default": "急向右并道",
                "name": "急向右并道，驶入{way_name}",
                "destination": "急向右并道，前往{destination}"
            },
            "uturn": {
                "default": "前方调头",
                "name": "前方调头，驶入{way_name}",
                "destination": "前方调头，前往{destination}"
            }
        },
        "new name": {
            "default": {
                "default": "继续{modifier}",
                "name": "继续{modifier}，驶入{way_name}",
                "destination": "继续{modifier}，前往{destination}"
            },
            "straight": {
                "default": "继续直行",
                "name": "继续在{way_name}上直行",
                "destination": "继续直行，前往{destination}"
            },
            "sharp left": {
                "default": "前方左急转弯",
                "name": "前方左急转弯，驶入{way_name}",
                "destination": "左急转弯，前往{destination}"
            },
            "sharp right": {
                "default": "前方右急转弯",
                "name": "前方右急转弯，驶入{way_name}",
                "destination": "右急转弯，前往{destination}"
            },
            "slight left": {
                "default": "继续稍向左",
                "name": "继续稍向左，驶入{way_name}",
                "destination": "继续稍向左，前往{destination}"
            },
            "slight right": {
                "default": "继续稍向右",
                "name": "继续稍向右，驶入{way_name}",
                "destination": "继续稍向右，前往{destination}"
            },
            "uturn": {
                "default": "前方调头",
                "name": "前方调头，上{way_name}",
                "destination": "前方调头，前往{destination}"
            }
        },
        "notification": {
            "default": {
                "default": "继续{modifier}",
                "name": "继续{modifier}，驶入{way_name}",
                "destination": "继续{modifier}，前往{destination}"
            },
            "uturn": {
                "default": "前方调头",
                "name": "前方调头，驶入{way_name}",
                "destination": "前方调头，前往{destination}"
            }
        },
        "off ramp": {
            "default": {
                "default": "下匝道",
                "name": "下匝道，驶入{way_name}",
                "destination": "下匝道，前往{destination}",
                "exit": "从{exit}出口驶出",
                "exit_destination": "从{exit}出口驶出，前往{destination}"
            },
            "left": {
                "default": "下左侧匝道",
                "name": "下左侧匝道，上{way_name}",
                "destination": "下左侧匝道，前往{destination}",
                "exit": "从左侧{exit}出口驶出",
                "exit_destination": "从左侧{exit}出口驶出，前往{destination}"
            },
            "right": {
                "default": "下右侧匝道",
                "name": "下右侧匝道，驶入{way_name}",
                "destination": "下右侧匝道，前往{destination}",
                "exit": "从右侧{exit}出口驶出",
                "exit_destination": "从右侧{exit}出口驶出，前往{destination}"
            },
            "sharp left": {
                "default": "急向左下匝道",
                "name": "急向左下匝道，驶入{way_name}",
                "destination": "急向左下匝道，前往{destination}",
                "exit": "从左侧{exit}出口驶出",
                "exit_destination": "从左侧{exit}出口驶出，前往{destination}"
            },
            "sharp right": {
                "default": "急向右下匝道",
                "name": "急向右下匝道，驶入{way_name}",
                "destination": "急向右下匝道，前往{destination}",
                "exit": "从右侧{exit}出口驶出",
                "exit_destination": "从右侧{exit}出口驶出，前往{destination}"
            },
            "slight left": {
                "default": "稍向左下匝道",
                "name": "稍向左下匝道，驶入{way_name}",
                "destination": "稍向左下匝道，前往{destination}",
                "exit": "从左侧{exit}出口驶出",
                "exit_destination": "从左侧{exit}出口驶出，前往{destination}"
            },
            "slight right": {
                "default": "稍向右下匝道",
                "name": "稍向右下匝道，驶入{way_name}",
                "destination": "稍向右下匝道，前往{destination}",
                "exit": "从右侧{exit}出口驶出",
                "exit_destination": "从右侧{exit}出口驶出，前往{destination}"
            }
        },
        "on ramp": {
            "default": {
                "default": "上匝道",
                "name": "上匝道，驶入{way_name}",
                "destination": "上匝道，前往{destination}"
            },
            "left": {
                "default": "上左侧匝道",
                "name": "上左侧匝道，驶入{way_name}",
                "destination": "上左侧匝道，前往{destination}"
            },
            "right": {
                "default": "上右侧匝道",
                "name": "上右侧匝道，驶入{way_name}",
                "destination": "上右侧匝道，前往{destination}"
            },
            "sharp left": {
                "default": "急向左上匝道",
                "name": "急向左上匝道，驶入{way_name}",
                "destination": "急向左上匝道，前往{destination}"
            },
            "sharp right": {
                "default": "急向右上匝道",
                "name": "急向右上匝道，驶入{way_name}",
                "destination": "急向右上匝道，前往{destination}"
            },
            "slight left": {
                "default": "稍向左上匝道",
                "name": "稍向左上匝道，驶入{way_name}",
                "destination": "稍向左上匝道，前往{destination}"
            },
            "slight right": {
                "default": "稍向右上匝道",
                "name": "稍向右上匝道，驶入{way_name}",
                "destination": "稍向右上匝道，前往{destination}"
            }
        },
        "rotary": {
            "default": {
                "default": {
                    "default": "进入环岛",
                    "name": "通过环岛后驶入{way_name}",
                    "destination": "通过环岛后前往{destination}"
                },
                "name": {
                    "default": "进入{rotary_name}环岛",
                    "name": "通过{rotary_name}环岛后驶入{way_name}",
                    "destination": "通过{rotary_name}环岛后前往{destination}"
                },
                "exit": {
                    "default": "进入环岛后从{exit_number}出口驶出",
                    "name": "进入环岛后从{exit_number}出口驶出，上{way_name}",
                    "destination": "进入环岛后从{exit_number}出口驶出，前往{destination}"
                },
                "name_exit": {
                    "default": "进入{rotary_name}环岛后从{exit_number}出口驶出",
                    "name": "进入{rotary_name}环岛后从{exit_number}出口驶出，上{way_name}",
                    "destination": "进入{rotary_name}环岛后从{exit_number}出口驶出，前往{destination}"
                }
            }
        },
        "roundabout": {
            "default": {
                "exit": {
                    "default": "进入环岛后从{exit_number}出口驶出",
                    "name": "进入环岛后从{exit_number}出口驶出，上{way_name}",
                    "destination": "进入环岛后从{exit_number}出口驶出，前往{destination}"
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
                "default": "{modifier}转弯",
                "name": "{modifier}转弯，驶入{way_name}",
                "destination": "{modifier}转弯，前往{destination}"
            },
            "left": {
                "default": "左转",
                "name": "左转，驶入{way_name}",
                "destination": "左转，前往{destination}"
            },
            "right": {
                "default": "右转",
                "name": "右转，驶入{way_name}",
                "destination": "右转，前往{destination}"
            },
            "straight": {
                "default": "继续直行",
                "name": "继续直行，驶入{way_name}",
                "destination": "继续直行，前往{destination}"
            }
        },
        "exit roundabout": {
            "default": {
                "default": "驶离环岛",
                "name": "驶离环岛，驶入{way_name}",
                "destination": "驶离环岛，前往{destination}"
            }
        },
        "exit rotary": {
            "default": {
                "default": "驶离环岛",
                "name": "驶离环岛，驶入{way_name}",
                "destination": "驶离环岛，前往{destination}"
            }
        },
        "turn": {
            "default": {
                "default": "{modifier}转弯",
                "name": "{modifier}转弯，驶入{way_name}",
                "destination": "{modifier}转弯，前往{destination}"
            },
            "left": {
                "default": "左转",
                "name": "左转，驶入{way_name}",
                "destination": "左转，前往{destination}"
            },
            "right": {
                "default": "右转",
                "name": "右转，驶入{way_name}",
                "destination": "右转，前往{destination}"
            },
            "straight": {
                "default": "直行",
                "name": "直行，驶入{way_name}",
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

},{}],46:[function(require,module,exports){
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

},{}],47:[function(require,module,exports){
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

	var getOSRMRouteProvider = function ( ) {
	
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
		
		var _ParseResponse = function ( requestResponse, route, userLanguage ) {
			
			var response = null;
			try {
				response = JSON.parse( requestResponse );
			}
			catch ( e ) {
				return false;
			}

			if ( "Ok" !== response.code )
			{
				return false;
			}
			
			if ( 0 === response.routes.length )
			{
				return false;
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

			response.routes [ 0 ].legs.forEach ( 
				function ( leg ) {
					var lastPointWithDistance = 0;
					leg.steps.forEach ( 
						function ( step ) {
							step.geometry = require ( 'polyline' ).decode ( step.geometry, 6 );

							var maneuver = L.travelNotes.interface ( ).maneuver;
							maneuver.iconName = _IconList [ step.maneuver.type ] ? _IconList [  step.maneuver.type ] [  step.maneuver.modifier ] || _IconList [  step.maneuver.type ] [ "default" ] : _IconList [ "default" ] [ "default" ];
							maneuver.instruction = osrmTextInstructions.compile ( userLanguage, step );
							maneuver.duration = step.duration;
							var distance = 0;
							for ( var geometryCounter = 0; ( 1 === step.geometry.length ) ? ( geometryCounter < 1 ) : ( geometryCounter < step.geometry.length )  ; geometryCounter ++ ) {
								var itineraryPoint = L.travelNotes.interface ( ).itineraryPoint;
								itineraryPoint.latLng = [ step.geometry [ geometryCounter ] [ 0 ], step.geometry [ geometryCounter ] [ 1 ] ];
								itineraryPoint.distance = leg.annotation.distance [ lastPointWithDistance ] ? leg.annotation.distance [ lastPointWithDistance ] : 0;
								route.itinerary.itineraryPoints.add ( itineraryPoint );
								if (geometryCounter !== step.geometry.length - 1 ) {
									distance += itineraryPoint.distance;
									lastPointWithDistance++;
								}
								if ( 0 === geometryCounter ) {
									maneuver.itineraryPointObjId = itineraryPoint.objId;
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

			return true;
		};
		
		var _GetUrl = function ( wayPoints, transitMode, providerKey, userLanguage, options ) {
			
			var wayPointsToString = function ( wayPoint, result )  {
				if ( null === result ) {
					result = '';
				}
				result += wayPoint.lng.toFixed ( 6 ) + ',' + wayPoint.lat.toFixed ( 6 ) + ';' ;
				return result;
			};
			var wayPointsString = wayPoints.forEach ( wayPointsToString );

			return 'https://router.project-osrm.org/route/v1/driving/' +
				 wayPointsString.substr ( 0, wayPointsString.length - 1 ) +
				'?geometries=polyline6&overview=full&steps=true&annotations=distance';
		};
		
		return {
			get icon ( ) {
				return 'iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH4QkaDwEMOImNWgAABTZJREFUSMftl21sFEUYx3+zu3ft9a7Q0tIXoKUCIkIVeYsECmgbBKIIEVC0QEs0UIEghA+CEkkIaCyJBhFBBC00qHxoQClvhgLyEonyckhbFKS90iK0FAqFHr273R0/XNlCymEREr44X3by7DPzm5n9z8x/hZRS8giKwiMqjwys3U/y/pIqdh0tp8RTS229F0yIaxtBz+R2jOjfhSFPJbW6L9Gab/zFdjfv5x/k2g0f4TYVISUCEJKmp8QfMGjjsLNoShozxvR7MHD1VS+D53+Pp/oqmqJYoEBAxzQlQoKmCMJUJTgAwDQkye0j2f1JJvHRzvsH/3m+jqfn5IOUICWGYZIY5WTScz1J751EYjsXArh45QZ73BV8W1RC7VUvNkVBEBzUoZXZPJEc03rwhboGkqettWYopeSb2SPIHPbkPZfvu6JSZizfidIExpQU5+eQ0M7VOnDS9LVcvNKAkBDtDOf35ZOIj3K2SjSXrnoZNDOPuvqbCCA+yklxfs6/g3O3HOXd/ANoikCakvPrphEfFWG9P1R6ni+3n6Ck4hJI6JUcS/YLqaQ/09nKuVx/kx6TVoGUmIZkYVYac18beG+wfeLnGIaBqZtseGckk59rXt7xH/5IwaHTRNjVO1Tt8wcY1b8rWxaPs3J/OHiarKVbsKkqqoCLW+eFPkB2uD0EfAEAOsa67oC+tHgzW387iyNMQ0qJ1xfA6wsgpSTcprHX7eHFBZus/DFp3XksMRoAX0Bn169nQ4N3HT+H0FQApqb3suLbj5Sx7UgZihA0Bgxmje5HeV4Ong05zB7bn8aAjhCCfSfOUfjLGatd5vBUkGDXVPYeKQ8NdldcCu7FgMHIPilWfMU2N2E2FVNK3pvwLLlvDqNzXBuS2rdh6dShfJCZhikldpvKmkK31e75vin4AjoAxWU1ocHV17zBimnS4bYtcKysGgC/T2feK/1bKHTu+AF4G4OfyH2m2oonxrgwTGmpPSRYms11VRFWPaA3vZCSMFvL4z3MpnFLorrZ3IkixG19y9DgmMjwWy34+0qDFe/RqR0AtjAbeUXFLcAbfjpJRHhwQI835QJU1zVYE4hqEx4anJocAwKEprK3uNKKZ6X3wjAlqiKYvXoP63c3wzfuKWHGil2oioJhSt7IaBbl/hPnsNuCYu2ZEhd6Hxcc/ovxuYUoqqB7QhSnVmRZid1z1lFZcx0BGLqB36+DBIddw6YKhITEaCen8qZbbQbmfE1ZVR2GYbBuwcuMHdrj7jMeN7CbVf+j8jI7jnmaBfbpZDrEuDClRFMVnA47LocdTVUwTUlctJPDK7Ot/KKj5ZSW1yIBw5R3QO/qQOaN7QcSNJvKq8sKaWhSq8th5+xXb7F40mA6xUbScNPPDa+fjjGRLMwczOm86bR1hgFw06eT/dFWwuzBZZ45bkDrLglX5kp8fh0hITk2kpOfTcFhb51ZafTrDJqZx7mL1xAED4+qzXMQrfFcB5ZMQPcbAFTWXichazU/3ya2UOVQcRXdMldRUX0teFT6DQo/ntgCek8jsPO4h1GLCrDbNZASv1+nX9d4sjJSyeidREJ00AhcqGtgn7uCjUUlHDt9AYdNQyDx+XQKlkxgxIAu9299jpbVMGT+JgzDsG4j2TQIacqgFhRBuKagCmHlaIpgZ+7r9O2e8N/NXsAwmbVmD2u2ubFpKpoiWpo9JNIIGr63R/dhWU4Gmqo8uMsE8OsG64tK2X3cQ7Gnhsv1jShS0L5tOL2SY8jok8Lk4anYm263h2Jv//+FeRjlHxKxS4in4X1YAAAAAElFTkSuQmCC';
			},
			getUrl : function ( wayPoints, transitMode, providerKey, userLanguage, options ) {
				return _GetUrl ( wayPoints, transitMode, providerKey, userLanguage, options );
			},
			parseResponse : function ( requestResponse, route, userLanguage ) {
				return _ParseResponse ( requestResponse, route, userLanguage );
			},
			get name ( ) { return 'OSRM';},
			get transitModes ( ) { return { car : true, bike : false, pedestrian : false}; },
			get providerKeyNeeded ( ) { return false; }
		};
	};
	
	L.travelNotes.interface ( ).addProvider ( getOSRMRouteProvider ( ) );

}());

},{"osrm-text-instructions":1,"polyline":46}]},{},[47]);
