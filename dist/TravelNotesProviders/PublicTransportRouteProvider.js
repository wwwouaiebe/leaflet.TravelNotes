(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

	var getPublicTransportRouteProvider = function ( ) {

		var _ProviderKey = '';
		var _UserLanguage = 'fr';
		var _Options;
		var _Route;
		var _Response = '';
		
		var _NextPromise = 0;
		var _Promises = [];
		var _XMLHttpRequestUrl = '';

		var _SelectedRelationId = -1;
		var _WaysMap = new Map ( );
		var _NodesMap = new Map ( );
		var _StopsMap = new Map ( );
		var _NewId = -1;
		var _Nodes3WaysCounter = 0;
		var	_Nodes3Ways = [];
		
		/*
		--- _FirstOf function -----------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/
		var _FirstOf = function ( array ) {
			return array [ 0 ];
		};
		
		/*
		--- End of _FirstOf function ---
		*/

		/*
		--- _LastOf function ------------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/
		var _LastOf = function ( array ) {
			return array [ array.length - 1 ];
		};
		
		/*
		--- End of _LastOf function ---
		*/

		/*
		--- _RemoveFrom function --------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/
		var _RemoveFrom = function ( array, value ) {
			array.splice ( array.indexOf ( value ), 1 );
		};
		
		/*
		--- End of _RemoveFrom function ---
		*/

		/*
		--- _ReverseWay function --------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _ReverseWay = function ( way ) {
			
			var oldStartNode = _NodesMap.get ( _FirstOf ( way.nodesIds ) );
			var oldEndNode = _NodesMap.get ( _LastOf ( way.nodesIds ) );
			
			_RemoveFrom ( oldStartNode.startingWaysIds, way.id );
			oldStartNode.endingWaysIds.push (way.id );
			
			_RemoveFrom ( oldEndNode.endingWaysIds, way.id );
			oldEndNode.startingWaysIds.push (way.id );
			
			way.nodesIds.reverse ( );
			
		};
		
		/*
		--- End of _ReverseWay function ---
		*/

		/*
		--- _DeleteWay function ---------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _DeleteWay = function ( way ) {
			
			_RemoveFrom ( _NodesMap.get ( _FirstOf ( way.nodesIds ) ).startingWaysIds, way.id );
			_RemoveFrom ( _NodesMap.get ( _LastOf ( way.nodesIds ) ).endingWaysIds, way.id );
			
			_WaysMap.delete ( way.id );
		};

		/*
		--- End of _DeleteWay function ---
		*/

		/*
		--- _MergeWays function ---------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _MergeWays = function ( waysId1, waysId2 ) {

		var way1 = _WaysMap.get ( waysId1 );
			var way2 = _WaysMap.get ( waysId2 );

			// reversing some ways, so :
			// - the 2 ways have the same direction 
			// - the starting node of the merged way is the starting node of way1
			// - the ending node of the merged way is the ending node of way2
			// - the removed node is the ending node of way1
			
			if ( _LastOf ( way1.nodesIds ) === _LastOf ( way2.nodesIds ) ) {
				_ReverseWay ( way2 );
			}
			else if ( _FirstOf ( way1.nodesIds ) === _FirstOf ( way2.nodesIds ) ) {
				_ReverseWay ( way1 );
			}
			else if ( _FirstOf ( way1.nodesIds ) === _LastOf ( way2.nodesIds ) ) {
				_ReverseWay ( way1 );
				_ReverseWay ( way2 );

			}
			
			// removing the node at the merging node and all the starting or ending ways of the node
			var mergedNode = _NodesMap.get ( way1.nodesIds.pop ( ) );
			mergedNode.startingWaysIds = [];
			mergedNode.endingWaysIds = [];
			
			// and then merging the 2 ways
			way1.nodesIds = way1.nodesIds.concat ( way2.nodesIds );
			way1.distance += way2.distance;

			// and changing the ending ways in the last node
			var endNode = _NodesMap.get ( _LastOf ( way1.nodesIds ) );
			_RemoveFrom ( endNode.endingWaysIds, way2.id );
			endNode.endingWaysIds.push ( way1.id );
			
			// finally we remove the second way from the ways map
			_WaysMap.delete ( way2.id );

			return way1.id;
		};

		/*
		--- End of _MergeWays function ---
		*/
 
		/*
		--- _CloneNode function --------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _CloneNode = function ( nodeId ) {
			
			var node = _NodesMap.get ( nodeId );
			
			var clonedNode = {
				id : _NewId --,
				lat : node.lat,
				lon : node.lon,
				type : 'node',
				startingWaysIds : [],
				endingWaysIds : [],
				isNode3Ways : node.isNode3Ways
			};
			
			_NodesMap.set ( clonedNode.id, clonedNode );
			
			return clonedNode.id;
		};
		
		/*
		--- End of _CloneNode function ---
		*/
 
		/*
		--- _CloneWay function --------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var _CloneWay = function ( wayId ) {
			
			var way = _WaysMap.get ( wayId );
			
			var clonedWay = {
				id : _NewId --,
				type : 'way',
				nodesIds : [],
				distance : way.distance
			};

			way.nodesIds.forEach ( 
				function ( nodeId ) {
					clonedWay.nodesIds.push ( _CloneNode ( nodeId ) );
				}
			);
			
			_NodesMap.get ( _FirstOf ( clonedWay.nodesIds ) ).startingWaysIds.push ( clonedWay.id );
			_NodesMap.get ( _LastOf ( clonedWay.nodesIds ) ).endingWaysIds.push ( clonedWay.id );

			_WaysMap.set ( clonedWay.id, clonedWay );
			
			return clonedWay.id;
		};

		/*
		--- End of _CloneWay function ---
		*/

		/*
		--- _CreateMaps function --------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _CreateMaps = function ( elements ) {
			
			_WaysMap.clear ( );
			_NodesMap.clear ( );
			_StopsMap.clear ( );

			// Elements are pushed in 2 maps: 1 for nodes and 1 for ways
			elements.forEach (
				function ( element ) {
					switch ( element.type ) {
						case 'way' :
							// replacing the nodes property with the nodesId property to 
							// avoid confusion between nodes and nodesId. the element.nodes contains nodesIds!!
							element.nodesIds = element.nodes;
							delete element.nodes;
							if ( 2 <= element.nodesIds.length ) {
								element.distance = 0;
								_WaysMap.set ( element.id, element );
							}
							break;
						case 'node' :
							element.startingWaysIds = [];
							element.endingWaysIds = [];
							element.isNode3Ways = false;
							_NodesMap.set ( element.id, element );
							break;
						case 'relation' :
							element.members.forEach (
								function ( member ) {
									// extracting all nodes with role 'stop'
									if ( 'node' === member.type && member.role && 'stop' === member.role ) {
										_StopsMap.set ( member.ref, member.ref );
									}
								}
							);
							break;
						default:
							break;
					}
				}
			);
			
			// The stop map contain only the nodeId
			// we replace the nodeId with the node when possible
			_StopsMap.forEach (
				function ( nodeId ) {
					var node = _NodesMap.get ( nodeId );
					if ( node ) {
						_StopsMap.set ( nodeId, node );
					}
					else {
						console.log ( 'the relation ' + _SelectedRelationId +  ' have nodes not positionned on the railway ( node ' + nodeId + ').' );
						_StopsMap.delete ( nodeId );
					}
				}
			);
			
			// Starting and ending ways are added to each node and length computed
			_WaysMap.forEach (
				function ( way ) {
					_NodesMap.get ( _FirstOf ( way.nodesIds ) ).startingWaysIds.push ( way.id );
					_NodesMap.get ( _LastOf ( way.nodesIds ) ).endingWaysIds.push ( way.id );
					var previousNode = null;
					way.nodesIds.forEach (
						function ( nodeId ) {
							var node = _NodesMap.get ( nodeId );
							if  ( previousNode ) {
								way.distance += L.latLng ( node.lat, node.lon ).distanceTo ( L.latLng ( previousNode.lat, previousNode.lon ));
							}
							previousNode = node;
						}
					);
				}
			);
		};

		/*
		--- End of _CreateMaps function ---
		*/

		/*
		--- _RemoveHoles function --------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _RemoveHoles = function ( ) {
	
			// for every start node or end node of each way we compute the distance  
			// to the start node and end node of all others ways
			
			var distancesBetweenWays = [];
			
			var computeDistances = function ( node1 , node2 ) {
				if ( node1.isNode3Ways || node2.isNode3Ways ) {
					return;
				}
				distancesBetweenWays.push (
					{
						distance : L.latLng ( node1.lat, node1.lon ).distanceTo ( L.latLng ( node2.lat, node2.lon )),
						nodesId : [ node1.id, node2.id ]
					} 
				) ;
			};
							
			var waysArray = Array.from( _WaysMap.values ( ) );
			var loopCounter = 1;
			waysArray.forEach (
				function ( way ) {
					for ( var wayCounter = loopCounter; wayCounter < waysArray.length; wayCounter ++ ) {
						var nodesIds = [];
						nodesIds.push ( _NodesMap.get ( _FirstOf ( way.nodesIds ) ) );
						nodesIds.push ( _NodesMap.get ( _LastOf ( way.nodesIds ) ) );
						nodesIds.push ( _NodesMap.get ( _FirstOf ( waysArray [ wayCounter ].nodesIds ) ) );
						nodesIds.push ( _NodesMap.get ( _LastOf ( waysArray [ wayCounter ].nodesIds ) ) );
						
						computeDistances ( nodesIds [ 0 ], nodesIds [ 2 ] ); 
						computeDistances ( nodesIds [ 0 ], nodesIds [ 3 ] ); 
						computeDistances ( nodesIds [ 1 ], nodesIds [ 2 ] ); 
						computeDistances ( nodesIds [ 1 ], nodesIds [ 3 ] ); 
					}
					loopCounter ++;
				}
			);
			
			// the shortest distance is searched
			var minDistance = distancesBetweenWays [ 0 ];
			distancesBetweenWays.forEach (
				function ( distanceBetwwenWays ) {
					if ( distanceBetwwenWays.distance < minDistance.distance ) { 
						minDistance = distanceBetwwenWays;
					}
				}
			);

			// a new way is created and added to the way map, using the shortest distance
			var newWay = { id: _NewId --, type : 'way', nodesIds : minDistance.nodesId, distance : minDistance.distance };
			_WaysMap.set ( newWay.id, newWay );


			// start and end node are is adapted
			var startNode = _NodesMap.get ( minDistance.nodesId [ 0 ] );
			var wayIdAtStart = startNode.startingWaysIds.concat ( startNode.endingWaysIds ) [ 0 ];
			startNode.startingWaysIds.push ( newWay.id );
			var endNode = _NodesMap.get ( minDistance.nodesId [ 1 ] );
			var wayIdAtEnd = endNode.startingWaysIds.concat ( endNode.endingWaysIds ) [ 0 ];
			endNode.endingWaysIds.push ( newWay.id );

			// and the two ways merged with the new one
			_MergeWays (  _MergeWays ( newWay.id,  wayIdAtStart ), wayIdAtEnd );

			// and we restart recursively till all the possible ways are joined 
			if ( _WaysMap.size > ( _Nodes3WaysCounter * 2 + 1 ) ) {
				_RemoveHoles ( );
			}
			
			return;
		};
		
		/*
		--- End of _RemoveHoles function ---
		*/
		
		/*
		--- _Merge3WaysNodes function -----------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _Merge3WaysNodes = function ( ) {
			
			_Nodes3Ways.forEach ( 
				function ( node ) {
					// searching the shortest way starting or ending in the node
					var shortestWaydistance = 999999999;
					var shortestWay = null;
					var linkedWaysId = node.startingWaysIds.concat ( node.endingWaysIds );
					linkedWaysId.forEach (
						function ( wayId ) {
							var way = _WaysMap.get ( wayId );
							if ( way.distance < shortestWaydistance ) {
								shortestWaydistance = way.distance;
								shortestWay = way;
							}
						}
					);
					// the shortest way is removed of the list of linked ways
					_RemoveFrom ( linkedWaysId, shortestWay.id );
					
					// cloning the shortest way
					var clonedWay = _WaysMap.get ( _CloneWay ( shortestWay.id ) );
					
					// and adapting the nodes in the cloned way...
					var tmpNodeId = null;
					if ( _FirstOf ( shortestWay.nodesIds ) === node.id  ) {
						clonedWay.nodesIds.pop ( );
						clonedWay.nodesIds.push ( _LastOf ( shortestWay.nodesIds ) );
						tmpNodeId = _FirstOf ( clonedWay.nodesIds );
					}
					else {
						clonedWay.nodesIds.shift ( );
						clonedWay.nodesIds.unshift ( _FirstOf ( shortestWay.nodesIds ) );
						tmpNodeId = _LastOf ( clonedWay.nodesIds );
					}
					// and in the last linked way
					var lastWay = _WaysMap.get ( linkedWaysId [ 1 ] );
					lastWay.nodesIds [ lastWay.nodesIds.indexOf ( node.id ) ] = tmpNodeId  ;
					
					// merging the 4 ways
					_MergeWays ( 
						_MergeWays ( 
							_MergeWays ( 
								shortestWay.id, 
								clonedWay.id 
							),
							linkedWaysId [ 0 ]
						), 
					lastWay.id );
				}
			);
			
			return;
		};
		
		/*
		--- End of _Merge3WaysNodes function ---
		*/

		/*
		--- _ParseResponse function -----------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/
		
		var _CreateRoute = function ( route ) {
			
			// Searching the nearest stops from the start and end WayPoints given by user.
			var startStop = null;
			var endStop = null;
			var startStopDistance = 999999999;
			var endStopDistance = 999999999;
			
			_StopsMap.forEach (
				function ( stop ) {
					var distance = L.latLng ( [ stop.lat, stop.lon ] ).distanceTo ( _Route.wayPoints.first.latLng );
					if ( distance < startStopDistance ) {
						startStopDistance = distance;
						startStop = stop;
					}
					distance = L.latLng ( [ stop.lat, stop.lon ] ).distanceTo ( _Route.wayPoints.last.latLng );
					if ( distance < endStopDistance ) {
						endStopDistance = distance;
						endStop = stop;
					}
				}
			);
			
			// the route is created. All existing itineraryPoints and maneuvers are removed
			route.itinerary.itineraryPoints.removeAll ( );
			route.itinerary.maneuvers.removeAll ( );
			
			// adding the new itinerary points. We use the nodes linked to the first way ( and normally it's the only way !)
			// only nodes from the start stop to the end stop are added
			var addPoint = 0; // values : 0 the point must not be added 1 : first point 2 others point 3 last point 4 all points are added
			var reversePoints = false; // the relation is not ordered, so it's possible we have to reverse
			Array.from( _WaysMap.values ( ) )[0].nodesIds.forEach ( 
				function ( nodeId ) {
					if ( 0 === addPoint && ( nodeId === startStop.id || nodeId === endStop.id ) ) {
						// start stop or end stop is reached
						addPoint = 1;
						reversePoints = ( nodeId === endStop.id );
					}
					else if ( 2 === addPoint && ( nodeId === startStop.id || nodeId === endStop.id ) ) {
						// the second stop is reached
						addPoint = 3;
					}
					if ( 0 < addPoint && 4 > addPoint ) {
						// an itinerary point is created from the node and is added to the itinerary
						var itineraryPoint = L.travelNotes.interface ( ).itineraryPoint;
						var node = _NodesMap.get ( nodeId );
						itineraryPoint.latLng = [ node.lat , node.lon ];
						route.itinerary.itineraryPoints.add ( itineraryPoint );
						
						// we verify that the node is not a stop, otherwise we add a maneuver.
						var stopNode = _StopsMap.get ( nodeId );
						if ( stopNode ) {
							
							var maneuver = L.travelNotes.interface ( ).maneuver;
							if ( stopNode.tags && stopNode.tags.name ) {
								maneuver.instruction = stopNode.tags.name + '&nbsp;:&nbsp;';
							}
							if ( stopNode.id === startStop.id ) {
								maneuver.iconName = 'kTrainStart';
								maneuver.instruction += 'Monter dans le train';
							}
							else if ( stopNode.id === endStop.id ) {
								maneuver.iconName = 'kTrainEnd';
								maneuver.instruction += 'Descendre du train';
							}
							else {
								maneuver.iconName = 'kTrainContinue';
								maneuver.instruction += 'Rester dans le train';
							}
							maneuver.distance = 0;
							maneuver.duration = 0;
							maneuver.itineraryPointObjId = itineraryPoint.objId;
							
							route.itinerary.maneuvers.add ( maneuver );
						}
					}
					if ( 1 === addPoint ) {
						// start stop or end stop was reached at the beginning of the loop
						addPoint = 2;
					}
					if ( 3 === addPoint ) {
						// the second stop was reached at the beginning of the loop
						addPoint = 4;
					}
				}
			);
			
			// reversing points if needed
			if ( reversePoints ) {
				route.itinerary.itineraryPoints.reverse ( );
				route.itinerary.maneuvers.reverse ( );
			}
			
			// computing distances
			route.distance = 0;

			var maneuversIterator = route.itinerary.maneuvers.iterator;
			var dummy = maneuversIterator.done;
			var previousManeuver = maneuversIterator.value;
			dummy = maneuversIterator.done;
			
			var itineraryPointsIterator = route.itinerary.itineraryPoints.iterator;
			dummy = itineraryPointsIterator.done;
			var previousPoint = itineraryPointsIterator.value;

			while ( ! itineraryPointsIterator.done ) {
				itineraryPointsIterator.value.distance = 0;
				previousPoint.distance = L.latLng ( previousPoint.latLng ).distanceTo ( L.latLng ( itineraryPointsIterator.value.latLng ));
				route.distance += previousPoint.distance;
				previousManeuver.distance += previousPoint.distance;
				if ( maneuversIterator.value.itineraryPointObjId === itineraryPointsIterator.value.objId ) {

					previousManeuver = maneuversIterator.value;
					previousManeuver.distance = 0;

					dummy = maneuversIterator.done;
					
				}
				previousPoint = itineraryPointsIterator.value;
			}
			
		};

		/*
		--- End of _Merge3WaysNodes function ---
		*/

		/*
		--- _ParseResponse function -----------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _ParseResponse = function ( returnOnOk, returnOnError ) {

			// resetting variables
			_NewId = -1;
			_Nodes3Ways = [];
			_Nodes3WaysCounter = 0;

			// maps creation
			_CreateMaps ( _Response.elements );
			
			// Searching all nodes where a way can start or end

			// analysing the ways at each node
			var nodeWithMoreThan3WaysFound = false;
			_NodesMap.forEach ( 
				function ( node ) {
					var waysIds = node.startingWaysIds.concat ( node.endingWaysIds );
					switch ( waysIds.length ) {
					case 0 :
						// it's a 'transit node'
						break;
					case 1 :
						// it's a start or end node
						break;
					case 2 :
						// ways are merged
						_MergeWays ( waysIds [ 0 ], waysIds [ 1 ] );
						break;
					case 3 :
						node.isNode3Ways = true;
						_Nodes3Ways.push ( node );
						_Nodes3WaysCounter ++;
						break;
					default:
						nodeWithMoreThan3WaysFound = true;
						console.log ( 'A node with more than 3 ways is found : ' + node.id + ' - the relation ' + _SelectedRelationId + ' - ways ' + node.startingWaysIds.concat ( node.endingWaysIds ) );
						break;
					} 
				}
			);
			
			if ( nodeWithMoreThan3WaysFound ) {
				// exit we cannot treat loops currently...
				return false;
			}

			// removing holes
			if ( _WaysMap.size > ( _Nodes3WaysCounter * 2 + 1 ) ) {
				_RemoveHoles ( );
				console.log ( 'Holes found in the OSM relation number ' + _SelectedRelationId + '. Try to correct OSM data.' );
			}

			// merging paths at nodes with 3 ways
			if ( 0 < _Nodes3WaysCounter ) {
				_Merge3WaysNodes ( );
			}

			// route creation
			_CreateRoute ( _Route );
				
			returnOnOk ( '' );
		};
		
		/*
		--- End of _ParseResponse function ---
		*/
							
		/*
		--- _GetRelationsUrl function ---------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetRelationsUrl = function ( ) {
			return 'https://lz4.overpass-api.de/api/interpreter?data=[out:json];node["public_transport"="stop_position"]["train"="yes"](around:400.0,' +
				_Route.wayPoints.first.lat.toFixed ( 6 ) +
				',' +
				_Route.wayPoints.first.lng.toFixed ( 6 ) +
				')->.s;rel(bn.s)->.s;node["public_transport"="stop_position"]["train"="yes"](around:400.0,' +
				_Route.wayPoints.last.lat.toFixed ( 6 ) +
				',' +
				_Route.wayPoints.last.lng.toFixed ( 6 ) +
				')->.e;rel(bn.e)->.e;rel.e.s;out tags;';	
		};

		/*
		--- End of _GetRelationsUrl function ---
		*/
							
		/*
		--- _GetRouteList function ------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetRouteList = function ( result ) {
			var routeList = [];
			result [ 0 ].elements.forEach (
				function ( element ) {
					if ( element.tags.name ) {
						routeList.push ( element.tags.name );
					}
					else {
						routeList.push ( 'Unnamed route' );
						console.log ( 'the relation ' + element.id + 'don\'t have a name tag.' );
					}
				}
			);
			return routeList;
		};		
		
		/*
		--- End of _GetRouteList function ---
		*/
							
		/*
		--- _SetSelectedRelationId function ---------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _SetSelectedRelationId = function ( responses ) {
			_SelectedRelationId = responses [ 0 ].elements [ responses [ 1 ].index ].id;
		};
		
		/*
		--- End of _SetSelectedRelationId function ---
		*/
							
		/*
		--- _GetWayNodesUrl function ----------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetWayNodesUrl = function ( ) {
			return 'https://lz4.overpass-api.de/api/interpreter?data=[out:json];rel(' +
				_SelectedRelationId.toFixed ( 0 ) + 
				');way(r)->.e;way.e["railway"="rail"];(._;>;rel(' +
				_SelectedRelationId.toFixed ( 0 ) +
				'););out;';
		};
		
		/*
		--- End of _GetWayNodesUrl function ---
		*/
		
		/*
		--- _ShowDialog function ----------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _ShowDialog = function ( returnOnOk, returnOnError  ) {

			var onCancelButtonClick = function ( ) {

				returnOnError ( 'Cancelled by user' );
				
				return true;
			};
			
			var onOkButtonClick = function ( ) {
				_SelectedRelationId = _Response.elements [ selectElement.selectedIndex ].id;
				_XMLHttpRequestUrl = _GetWayNodesUrl ( );
				returnOnOk ( new Promise ( _Promises [ _NextPromise ++ ] ) );
				
				return true;
			};

			if ( 0 === _Response.elements.length ) {
				
				returnOnError ( 'No relation found' );
				return;
			}
			
			var baseDialog = L.travelNotes.interface ( ).baseDialog ;
			
			baseDialog.addClickOkButtonEventListener ( onOkButtonClick );
			baseDialog.addClickCancelButtonEventListener (onCancelButtonClick );
			baseDialog.addEscapeKeyEventListener (onCancelButtonClick );
			
			var selectDiv = document.createElement ( 'div' );
			selectDiv.id = 'TravelNotes-SelectDialog-SelectDiv';
			baseDialog.content.appendChild ( selectDiv );
			
			var selectElement =	document.createElement ( 'select' );
			selectElement.id = 'TravelNotes-SelectDialog-SelectElement';
			selectDiv.appendChild ( selectElement );
			
			_Response.elements.forEach ( 
				function ( dataElement ) {
					var optionElement = document.createElement ( 'option' );
					optionElement.text = dataElement.tags.name;
					selectElement.appendChild ( optionElement );
				}
			);
			selectElement.selectedIndex = 0;

			baseDialog.center ( );

		};
		
		/*
		--- End of _ShowDialog function ---
		*/

		/*
		--- _StartXMLHttpRequest function -----------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _StartXMLHttpRequest = function ( returnOnOk, returnOnError ) {
			
			var xmlHttpRequest = new XMLHttpRequest ( );
			xmlHttpRequest.timeout = 5000;
			
			xmlHttpRequest.ontimeout = function ( event ) {
				returnOnError ( 'TimeOut error' );
			};
			
			xmlHttpRequest.onreadystatechange = function ( ) {
				if ( xmlHttpRequest.readyState === 4 ) {
					if ( xmlHttpRequest.status === 200 ) {
						try {
							_Response = JSON.parse ( xmlHttpRequest.responseText );
						}
						catch ( e ) {
							returnOnError ( 'JSON parsing error' );
						}
						returnOnOk ( new Promise ( _Promises [ _NextPromise ++ ] ) );
					}
					else {
						returnOnError ( 'Status : ' + this.status + ' statusText : ' + this.statusText );
					}
				}
			};
			
			xmlHttpRequest.open ( "GET", _XMLHttpRequestUrl, true );
			xmlHttpRequest.overrideMimeType ( 'application/json' );
			xmlHttpRequest.send ( null );
			
		};
		
		/*
		--- End of _StartXMLHttpRequest function ---
		*/

		/*
		--- _GetPromiseRoute function ---------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetPromiseRoute = function ( route, options ) {

			_Route = route;
			_Options = options;
			_Response = '';
			
			_XMLHttpRequestUrl = _GetRelationsUrl ( );

			_NextPromise = 0;
			_Promises = [];
			
			_Promises.push ( _StartXMLHttpRequest );
			_Promises.push ( _ShowDialog );
			_Promises.push ( _StartXMLHttpRequest );
			_Promises.push ( _ParseResponse );
			
			return new Promise ( _Promises [ _NextPromise ++ ] );
		};
		
		/*
		--- End of _GetPromiseRoute function ---
		*/
		
		/*
		--- _GetTasks function ----------------------------------------------------------------------------------------

		This function ...

		---------------------------------------------------------------------------------------------------------------
		*/

		var _GetTasks = function ( wayPoints, transitMode, providerKey, userLanguage, options ) {
			
			return [
				{
					task: 'loadJsonFile',
					context : null,
					func : _GetRelationsUrl
				},
				{	
					task: 'wait'
				},
				{	
					task: 'run',
					context : null,
					func : _GetRouteList,
					useResponses : [ 0 ]
				},
				{	
					task: 'showDialog',
					func : L.travelNotes.interface ( ).selectDialog,
					context : null,
					useResponses : [ 2 ]
				},
				{	
					task: 'wait'
				},
				{	
					task: 'run',
					context : null,
					func : _SetSelectedRelationId,
					useResponses : [ 0, 3 ]
				},
				{
					task: 'loadJsonFile',
					context : null,
					func : _GetWayNodesUrl
				},
				{	
					task: 'wait'
				},
			];
		};
		
		/*
		--- End of _GetTasks function ---
		*/
							
		/*
		--- PublicTransportRouteProvider object -----------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return {
			
			getPromiseRoute : function ( route, options ) {
				return _GetPromiseRoute ( route, options );
			},
			get icon ( ) {
				return 'iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH4goTCi4V9AmY6AAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAEc0lEQVRIx8VXTUhbWxD+zr0ag77Gqo1/RazRYjcBaxAVoxXFhQtRXLgt2iJUaAl9FBFcPBdtceeuBXGr4uaCq67rz0IaaUtFBcXAq1WjVkhiTm6u3u8tXs1TG6NVyxuYzZy5fHNm5s58R5Ak/gdJOs+htbUVNpsNLpcLZWVlcDqdyMrKujoyE8j4+DhVVaXH42FdXR2tVisBxNTlcnF2dpaXEfyKcyAQIAD29vZydHSUdrudT58+/b3AUkru7OywoaGBdrudpmnyKiLOa67d3V3U19fjy5cvJ+ylpaVwOp3IyMhAWloa7HY7Kioq4HK5kJmZebUaR6NRKooSq6mqqlRVlUKIE7U+ra9fv75aqvPy8giARUVF9Pv91HWduq5TSkmv18v+/n5WVVXFBX/48OHlgFtaWgiA6enpF6pZNBplMBjk3t4e9/b2uL+/T5/P92vA79+/j0Xu9Xov3UBSSn79+jXu2U8DxOfzoa6uDgDw9u1blJeXAwAGBgYwMzODcDgMALBarbh58yZyc3NRXFyMe/fuIT8/H6qqIhKJ4ODgALdu3UJycvL5zfXp06fYTYeGhmL2tra2hM10nj569OjsVGuaRgAUQnBycpIkubi4yOzs7CuBHunu7u7PwD09PQTA27dvMxQKUUrJZ8+eXQvgkTocjpPAhYWFBMCBgQGS5PLy8rUCHtdAIBADVhwOB46GV3V1NQKBwG9bhY2Njf+txa6uLrS3t0PTNFRWVib8sLS0FG63G2VlZSguLsaNGzcQiUTw/ft3bGxs4Nu3b/D7/QgGgwiHw5BSQkoJXdcRjUYRDAah6zpSUlKQpGkapZQCAEKhEFRVxf3791FbW8uGhgbcuXMH+fn5sNvtiWISp3+WODb8SDcsFgvE58+fabPZoKoqsrOzYbFYfivz2NraQk5ODpKcTmfc6C5KiYQQP92YJMWPg9P2w8NDmKYJVdO0v3w+Hw4ODqDrOhRFQWpqKsQFxePxiOnpaUxNTUFRFBQWFuI06NbWFtbX17G9vS0cDoeQUgokJSXFbf2Ojg6+e/eOm5ubjEajZ87j42szIyMjrs/Q0NCJ2W8YBkHSnJubY0lJiXkqCPO4ulwuU9M0U0ppGoZhHsns7KwJgCkpKSwoKCBJmqfoid/vZ15eHm02m7mysmJGIhHzxKw2DIMLCwt0u91nDgFFUWixWHj37l0ODg5yfn6eh4eHCXma1+vl2NgYnzx5QgAMhULx1+LIyAhfvnzJpaUl1tTUXOv06uzsTEwE5ubmaLVa2dTUxImJCb558+ZagI+yk5D66LrO5uZmAmB5eTmXl5c5Pj7OBw8e/DJgZmYm19bWLs4yAWB4eBjd3d0AgL6+Prx69QoAMD8/j48fP2J1dRXb29sIh8MwDANCCITDYZimiZycHHR2dsLtdl+cZR6XnZ0dOhyOWIN9+PDhTN/p6Wl6PB62trYSAGtrazk1NUXDMC73kiDJx4+7KMS/6Xv+3EPD0M/07evrpc32x4mUv3jxJ9fX/+Y/YWHR4vXjhpgAAAAASUVORK5CYII=';
			},
			get name ( ) { return 'leaflet.TravelNotesPublicTransport & 0penStreetMap';},
			get transitModes ( ) { return { car : false, bike : false, pedestrian : false, train : true}; },
			get providerKeyNeeded ( ) { return false; },
			
			get providerKey ( ) { return _ProviderKey.length; },
			set providerKey ( ProviderKey ) { if ( '' === _ProviderKey ) { _ProviderKey = ProviderKey;}},
			
			get userLanguage ( ) { return _UserLanguage; },
			set userLanguage ( UserLanguage ) { _UserLanguage = UserLanguage; }
		};
	};
	
	L.travelNotes.interface ( ).addProvider ( getPublicTransportRouteProvider ( ) );

}());

},{}]},{},[1]);
