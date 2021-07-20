import theConfig from '../data/Config.js';
import { theSphericalTrigonometry } from '../util/SphericalTrigonometry.js';

import { ZERO, TWO, LAT_LNG, DISTANCE, HTTP_STATUS_OK, OSM_COUNTRY_ADMIN_LEVEL } from '../util/Constants.js';

class OverpassAPIDataLoader {

	/**
	*/

	#options = {
		searchPlaces : true,
		searchWays : true,
		searchRelations : true
	}
	#adminNames = null; // myAdminNames
	#osmCityAdminLevel = null;// myOsmCityAdminLevel
	#place = null; // myPlace
	#places = null; // myPlaces
	#latLngDistance = Object.seal ( // mySvgLatLngDistance
		{
			latLng : [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ],
			distance : DISTANCE.defaultValue
		}
	);
	#city = null;
	#statusOk = true;

	/**
	*/

	#setGeometry ( ) {
		this.ways.forEach (
			way => {
				way.geometry = [ [ ] ];
				way.lat = LAT_LNG.defaultValue;
				way.lon = LAT_LNG.defaultValue;
				let nodesCounter = ZERO;
				way.nodes.forEach (
					nodeId => {
						let node = this.nodes.get ( nodeId );
						way.geometry [ ZERO ].push ( [ node.lat, node.lon ] );
						way.lat += node.lat;
						way.lon += node.lon;
						nodesCounter ++;
					}
				);
				if ( ZERO !== nodesCounter ) {
					way.lat /= nodesCounter;
					way.lon /= nodesCounter;
				}
			}
		);
		this.relations.forEach (
			relation => {
				relation.geometry = [ [ ] ];
				relation.lat = LAT_LNG.defaultValue;
				relation.lon = LAT_LNG.defaultValue;
				let membersCounter = ZERO;
				relation.members.forEach (
					member => {
						if ( 'way' === member.type ) {
							let way = this.ways.get ( member.ref );
							relation.geometry.push ( way.geometry [ ZERO ] );
							relation.lat += way.lat;
							relation.lon += way.lon;
							membersCounter ++;
						}
					}
				);
				if ( ZERO !== membersCounter ) {
					relation.lat /= membersCounter;
					relation.lon /= membersCounter;
				}
			}
		);
	}

	/**
	*/

	#parseData ( osmElements ) {
		osmElements.forEach (
			osmElement => {
				switch ( osmElement.type ) {
				case 'node' :
					this.nodes.set ( osmElement.id, osmElement );
					if (
						osmElement.tags &&
						this.#options.searchPlaces &&
						osmElement.tags.place &&
						this.#places [ osmElement.tags.place ] &&
						osmElement.tags.name
					) {
						let nodeDistance = theSphericalTrigonometry.pointsDistance (
							this.#latLngDistance.latLng,
							[ osmElement.lat, osmElement.lon ]
						);
						let place = this.#places [ osmElement.tags.place ];
						if ( place.maxDistance > nodeDistance && place.distance > nodeDistance ) {
							place.distance = nodeDistance;
							place.name = osmElement.tags.name;
						}
					}
					break;
				case 'way' :
					if ( this.#options.searchWays ) {
						this.ways.set ( osmElement.id, osmElement );
					}
					break;
				case 'relation' :
					if ( this.#options.searchRelations ) {
						this.relations.set ( osmElement.id, osmElement );
					}
					break;
				case 'area' :
					if ( this.#options.searchPlaces ) {
						let elementName = osmElement.tags.name;
						if (
							theConfig.nominatim.language &&
							'*' !== theConfig.nominatim.language &&
							osmElement.tags [ 'name:' + theConfig.nominatim.language ]
						) {
							elementName = osmElement.tags [ 'name:' + theConfig.nominatim.language ];
						}
						this.#adminNames [ Number.parseInt ( osmElement.tags.admin_level ) ] = elementName;
						if ( OSM_COUNTRY_ADMIN_LEVEL === osmElement.tags.admin_level ) {
							this.#osmCityAdminLevel =
								theConfig.geoCoder.osmCityAdminLevel [ osmElement.tags [ 'ISO3166-1' ] ]
								||
								this.#osmCityAdminLevel;
						}
					}
					break;
				default :
					break;
				}
			}
		);

	}

	/**
	*/

	#setPlaceAndCity ( ) {
		let adminHamlet = null;

		for ( let namesCounter = TWO; namesCounter < this.#adminNames.length; namesCounter ++ ) {
			if ( 'undefined' !== typeof ( this.#adminNames [ namesCounter ] ) ) {
				if ( this.#osmCityAdminLevel >= namesCounter ) {
					this.#city = this.#adminNames [ namesCounter ];
				}
				else {
					adminHamlet = this.#adminNames [ namesCounter ];
				}
			}
		}
		let placeDistance = Number.MAX_VALUE;

		Object.values ( this.#places ).forEach (
			place => {
				if ( place.distance < placeDistance ) {
					placeDistance = place.distance;
					this.#place = place.name;
				}
			}
		);

		this.#place = adminHamlet || this.#place;
		if ( this.#place === this.#city ) {
			this.#place = null;
		}
	}

	/**
	*/

	async #parseSearchResults ( results ) {
		for ( let counter = ZERO; counter < results.length; counter ++ ) {
			if (
				'fulfilled' === results[ counter ].status
				&&
				HTTP_STATUS_OK === results[ counter ].value.status
				&&
				results[ counter ].value.ok
			) {
				let response = await results[ counter ].value.json ( );
				this.#parseData ( response.elements );
				this.#statusOk = this.#statusOk && true;
			}
			else {
				this.#statusOk = false;
			}
		}
	}

	/**
	*/

	async #overpassAPICall ( queries ) {
		let promises = [];
		queries.forEach ( query => {
			promises.push (
				fetch ( theConfig.overpassApi.url +
						'?data=[out:json][timeout:' + theConfig.overpassApi.timeOut + '];' +
						query )
			);
		}
		);
		await this.#parseSearchResults ( await Promise.allSettled ( promises ) );
	}

	/**
	*/

	constructor ( options ) {
		if ( options ) {
			for ( const [ key, value ] of Object.entries ( options ) ) {
				this.#options [ key ] = value;
			}
		}
		this.nodes = new Map ( );
		this.ways = new Map ( );
		this.relations = new Map ( );
	}

	async loadData ( queries, latLng ) {
		this.#statusOk = true;
		this.#adminNames = [];
		this.#osmCityAdminLevel = theConfig.geoCoder.osmCityAdminLevel.DEFAULT;// myOsmCityAdminLevel
		this.#place = null;
		this.#places = {
			hamlet : {
				name : null,
				distance : Number.MAX_VALUE,
				maxDistance : theConfig.geoCoder.distances.hamlet
			},
			village : {
				name : null,
				distance : Number.MAX_VALUE,
				maxDistance : theConfig.geoCoder.distances.village
			},
			city : {
				name : null,
				distance : Number.MAX_VALUE,
				maxDistance : theConfig.geoCoder.distances.city
			},
			town : {
				name : null,
				distance : Number.MAX_VALUE,
				maxDistance : theConfig.geoCoder.distances.town
			}
		};

		this.#latLngDistance.latLng = latLng;
		this.#latLngDistance.distance = DISTANCE.defaultValue;
		this.#city = null;

		this.nodes.clear ( );
		this.ways.clear ( );
		this.relations.clear ( );

		await this.#overpassAPICall ( queries );
		this.#setGeometry ( );
		if ( this.#options.searchPlaces ) {
			this.#setPlaceAndCity ( );
		}
	}

	get place ( ) { return this.#place; }

	get city ( ) { return this.#city; }

	get country ( ) { return this.#adminNames [ OSM_COUNTRY_ADMIN_LEVEL ]; }

	get statusOk ( ) { return this.#statusOk; }
}

export default OverpassAPIDataLoader;