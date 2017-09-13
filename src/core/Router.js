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

	var _RouteProvider = global.providers.get ( 'mapzen' );
	var _RequestStarted = false;
	var _DataManager = require ( '../Data/DataManager' ) ( );
	
	var getRouter = function ( ) {

		var _HaveValidWayPoints = function ( ) {
			return _DataManager.editedRoute.wayPoints.forEach ( 
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
			_RouteProvider.parseResponse ( requestResponse, _DataManager.editedRoute );
			_RequestStarted = false;			
			require ( './RouteEditor' ) ( ).endRouting ( );
		};
		
		var _ParseError = function ( status, statusText ) {
			_RequestStarted = false;
			console.log ( "Response status: %d (%s)", status, statusText);
		};
		
		var _StartRequest = function ( ) {

			_RequestStarted = true;
/*		
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
				_RouteProvider.getUrl ( _DataManager.editedRoute.wayPoints, providerKey ),
				true
			);
			xmlHttpRequest.send ( null );
*/
			// Mapbox
			//_ParseResponse ('{"waypoints":[{"name":"Rue dèl Creû","location":[5.491895,50.508507]},{"name":"Basse Voie","location":[5.493796,50.508389]}],"routes":[{"legs":[{"steps":[{"intersections":[{"out":0,"entry":[true],"location":[5.491895,50.508507],"bearings":[57]}],"geometry":"ulxi_BmjenImRum@{CkQ","duration":24.8,"distance":85.7,"name":"Rue dèl Creû","weight":50.7,"mode":"driving","maneuver":{"bearing_after":57,"bearing_before":0,"type":"depart","location":[5.491895,50.508507],"instruction":"Head northeast on Rue dèl Creû"}},{"intersections":[{"out":0,"in":1,"entry":[true,false,true],"location":[5.492936,50.508896],"bearings":[135,225,315]},{"out":1,"in":2,"entry":[true,true,false],"location":[5.493132,50.508798],"bearings":[45,135,315]}],"geometry":"_eyi_BokgnIbEgKdFgMjQgZ","duration":18.1,"distance":83.2,"name":"Basse Voie","weight":33.5,"mode":"driving","maneuver":{"bearing_after":127,"location":[5.492936,50.508896],"type":"turn","bearing_before":49,"modifier":"right","instruction":"Turn right onto Basse Voie"}},{"intersections":[{"in":0,"entry":[true],"location":[5.493796,50.508389],"bearings":[317]}],"geometry":"iexi_BgainI","duration":0,"distance":0,"name":"Basse Voie","weight":0,"mode":"driving","maneuver":{"bearing_after":0,"location":[5.493796,50.508389],"type":"arrive","bearing_before":137,"modifier":"right","instruction":"You have arrived at your destination, on the right"}}],"weight":84.2,"distance":168.9,"annotation":{"distance":[63.15520198369543,22.533279297721318,17.6359876189832,20.584291773535234,44.94976490861426]},"summary":"Rue dèl Creû, Basse Voie","duration":42.9}],"weight_name":"routability","geometry":"ulxi_BmjenImRum@{CkQbEgKdFgMjQgZ","weight":84.2,"distance":168.9,"duration":42.9}],"code":"Ok","uuid":"cj79efog600szv1nnqg7kb0ki"}');
			// Mapzen	
			_ParseResponse ('{"trip":{"language":"fr","summary":{"max_lon":5.494842,"max_lat":50.509418,"time":61,"length":0.542,"min_lat":50.506657,"min_lon":5.491873},"locations":[{"lon":5.494623,"lat":50.509399,"type":"break"},{"lon":5.491877,"lat":50.506638,"type":"break"}],"units":"kilometers","legs":[{"shape":"sezi_BswjnIbLhe@lExTfIjU`HjLbFgMlU_`@vHqNlEyOzAmOnCyIt@rA~ClI|^xfAfd@hxAvClJ","summary":{"max_lon":5.494842,"max_lat":50.509418,"time":61,"length":0.542,"min_lat":50.506657,"min_lon":5.491873},"maneuvers":[{"travel_type":"car","street_names":["Chemin du Sârtê"],"verbal_pre_transition_instruction":"Conduisez vers le sud-est sur Chemin du Sârtê pendant 100 mètres. Ensuite, Tournez à gauche dans Basse Voie.","instruction":"Conduisez vers le sud-est sur Chemin du Sârtê.","end_shape_index":4,"type":1,"time":9,"verbal_multi_cue":true,"length":0.130,"begin_shape_index":0,"travel_mode":"drive"},{"travel_type":"car","travel_mode":"drive","verbal_pre_transition_instruction":"Tournez à gauche dans Basse Voie.","verbal_transition_alert_instruction":"Tournez à gauche dans Basse Voie.","length":0.156,"instruction":"Tournez à gauche dans Basse Voie.","end_shape_index":10,"type":15,"time":29,"verbal_post_transition_instruction":"Continuez pendant 200 mètres.","street_names":["Basse Voie"],"begin_shape_index":4},{"travel_type":"car","travel_mode":"drive","verbal_pre_transition_instruction":"Tournez à droite dans Chemin des Patars.","verbal_transition_alert_instruction":"Tournez à droite dans Chemin des Patars.","length":0.256,"instruction":"Tournez à droite dans Chemin des Patars.","end_shape_index":15,"type":10,"time":23,"verbal_post_transition_instruction":"Continuez pendant 300 mètres.","street_names":["Chemin des Patars"],"begin_shape_index":10},{"travel_type":"car","travel_mode":"drive","begin_shape_index":15,"time":0,"type":4,"end_shape_index":15,"instruction":"Vous êtes arrivé à votre destination.","length":0.000,"verbal_transition_alert_instruction":"Vous arriverez à votre destination.","verbal_pre_transition_instruction":"Vous êtes arrivé à votre destination."}]}],"status_message":"Found route between points","status":0}}' );
			// GraphHopper:
			//_ParseResponse ('{"hints":{"visited_nodes.average":"16.0","visited_nodes.sum":"16"},"paths":[{"instructions":[{"distance":125.967,"sign":0,"interval":[0,3],"text":"Continuez sur Chemin du Sârtê","time":17441,"street_name":"Chemin du Sârtê"},{"distance":156.064,"sign":-2,"interval":[3,8],"text":"Tournez à gauche sur Basse Voie","time":31212,"street_name":"Basse Voie"},{"distance":255.674,"sign":2,"interval":[8,10],"text":"Tournez à droite sur Chemin des Patars","time":32394,"street_name":"Chemin des Patars"},{"distance":0.0,"sign":4,"interval":[10,10],"text":"Arrivée","time":0,"street_name":""}],"descend":7.1020050048828125,"ascend":2.402008056640625,"distance":537.705,"bbox":[5.491862,50.506651,5.494842,50.509404],"weight":81.048982,"points_encoded":true,"points":"wbhsHidp`@z@tD^fA\\h@Tm@fByCRu@Hu@La@zBnGdCbI","transfers":0,"legs":[],"details":{},"time":81047,"snapped_waypoints":"wbhsHidp`@dPdP"}],"info":{"took":2,"copyrights":["GraphHopper","OpenStreetMap contributors"]}}' );
			
		};
		
		var _StartRouting = function ( ) {
			if ( _RequestStarted ) {
				return false;
			}
			if ( ! _HaveValidWayPoints ( ) ) {
				return false;
			}
			_StartRequest ( );
			
			return true;
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
