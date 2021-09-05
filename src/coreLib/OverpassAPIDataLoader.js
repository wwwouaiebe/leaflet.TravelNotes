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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file OverpassAPIDataLoader.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module coreLib
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import theConfig from '../data/Config.js';
import theSphericalTrigonometry from '../coreLib/SphericalTrigonometry.js';

import { ZERO, TWO, LAT_LNG, DISTANCE, HTTP_STATUS_OK, OSM_COUNTRY_ADMIN_LEVEL } from '../main/Constants.js';

/**
@--------------------------------------------------------------------------------------------------------------------------

@class OverpassAPIDataLoader
@classdesc This class is used to search osm data with the OverpassAPI
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class OverpassAPIDataLoader {

	/**
	*/

	#options = {
		searchPlaces : true,
		searchWays : true,
		searchRelations : true,
		setGeometry : true
	}

	#nodes = new Map ( );
	#ways = new Map ( );
	#relations = new Map ( );

	#adminNames = null;
	#osmCityAdminLevel = null;
	#place = null;
	#places = null;
	#latLngDistance = Object.seal (
		{
			latLng : [ LAT_LNG.defaultValue, LAT_LNG.defaultValue ],
			distance : DISTANCE.defaultValue
		}
	);

	#city = null;
	#statusOk = true;

	/**
	This method add the geometry to the osm elements
	@private
	*/

	#setGeometry ( ) {
		this.#ways.forEach (
			way => {
				way.geometry = [ [ ] ];
				way.lat = LAT_LNG.defaultValue;
				way.lon = LAT_LNG.defaultValue;
				let nodesCounter = ZERO;
				way.nodes.forEach (
					nodeId => {
						let node = this.#nodes.get ( nodeId );
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
		this.#relations.forEach (
			relation => {
				relation.geometry = [ [ ] ];
				relation.lat = LAT_LNG.defaultValue;
				relation.lon = LAT_LNG.defaultValue;
				let membersCounter = ZERO;
				relation.members.forEach (
					member => {
						if ( 'way' === member.type ) {
							let way = this.#ways.get ( member.ref );
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
	this method parse the osm elements received from the OverpassAPI
	@private
	*/

	#parseData ( osmElements ) {
		osmElements.forEach (
			osmElement => {
				switch ( osmElement.type ) {
				case 'node' :
					this.#nodes.set ( osmElement.id, osmElement );
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
						this.#ways.set ( osmElement.id, osmElement );
					}
					break;
				case 'relation' :
					if ( this.#options.searchRelations ) {
						this.#relations.set ( osmElement.id, osmElement );
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

		if ( this.#options.setGeometry ) {
			this.#setGeometry ( );
		}

		if ( this.#options.searchPlaces ) {
			this.#setPlaceAndCity ( );
		}

	}

	/**
	this method search the city and place name from the osm elements
	@private
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
	This method parse the responses from the OverpassAPI
	@private
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
				console.error ( 'An error occurs when calling theOverpassAPI: ' );
				console.error ( results[ counter ] );
			}
		}
	}

	/*
	constructor
	*/

	constructor ( options ) {
		if ( options ) {
			for ( const [ key, value ] of Object.entries ( options ) ) {
				this.#options [ key ] = value;
			}
		}
		Object.freeze ( this );
	}

	/**
	This method launch the queries in the OverpassAPI and parse the received data
	@param {Array.<string>} queries An array of queries to be executed in the OverpassAPI
	@param {Array.<number>} latLng The latitude and longitude used in the queries
	*/

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

		this.#nodes.clear ( );
		this.#ways.clear ( );
		this.#relations.clear ( );

		let promises = [];
		queries.forEach ( query => {
			promises.push (
				fetch ( theConfig.overpassApi.url +
						'?data=[out:json][timeout:' + theConfig.overpassApi.timeOut + '];' +
						query )
			);
		}
		);

		await Promise.allSettled ( promises ).then ( results => this.#parseSearchResults ( results ) );
	}

	/**
	A map with the osm nodes
	@type {Map}
	@readonly
	*/

	get nodes ( ) { return this.#nodes; }

	/**
	A map with the osm ways
	@type {Map}
	@readonly
	*/

	get ways ( ) { return this.#ways; }

	/**
	A map with the osm relations
	@type {Map}
	@readonly
	*/

	get relations ( ) { return this.#relations; }

	/**
	The osm place ( hamlet or village )
	@type {String}
	@readonly
	*/

	get place ( ) { return this.#place; }

	/**
	The osm city
	@type {String}
	@readonly
	*/

	get city ( ) { return this.#city; }

	/**
	The osm country
	@type {String}
	@readonly
	*/

	get country ( ) { return this.#adminNames [ OSM_COUNTRY_ADMIN_LEVEL ]; }

	/**
	The final status
	@type {boolean}
	@readonly
	*/

	get statusOk ( ) { return this.#statusOk; }
}

export default OverpassAPIDataLoader;

/*
--- End of OverpassAPIDataLoader.js file --------------------------------------------------------------------------------------
*/