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

@file IconList.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module routeProviders
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**

@------------------------------------------------------------------------------------------------------------------------------

@readonly
@enum {Object}
@desc Enum for icons used by Mapbox and OSRM
@public

@------------------------------------------------------------------------------------------------------------------------------
 */

export const ICON_LIST = Object.freeze (
	{
		turn : Object.freeze (
			{
				default : 'kUndefined',
				'sharp left' : 'kTurnSharpLeft',
				left : 'kTurnLeft',
				'slight left' : 'kTurnSlightLeft',
				straight : 'kTurnStraight',
				'slight right' : 'kTurnSlightRight',
				right : 'kTurnRight',
				'sharp right' : 'kTurnSharpRight',
				uturn : 'kTurnUturn'
			}
		),
		'new name' : Object.freeze (
			{
				default : 'kUndefined',
				'sharp left' : 'kNewNameSharpLeft',
				left : 'kNewNameLeft',
				'slight left' : 'kNewNameSlightLeft',
				straight : 'kNewNameStraight',
				'slight right' : 'kNewNameSlightRight',
				right : 'kNewNameRight',
				'sharp right' : 'kNewNameSharpRight'
			}
		),
		depart : Object.freeze (
			{
				default : 'kDepartDefault',
				'sharp left' : 'kDepartLeft',
				left : 'kDepartLeft',
				'slight left' : 'kDepartLeft',
				straight : 'kDepartDefault',
				'slight right' : 'kDepartRight',
				right : 'kDepartRight',
				'sharp right' : 'kDepartRight'
			}
		),
		arrive : Object.freeze (
			{
				default : 'kArriveDefault',
				'sharp left' : 'kArriveLeft',
				left : 'kArriveLeft',
				'slight left' : 'kArriveLeft',
				straight : 'kArriveDefault',
				'slight right' : 'kArriveRight',
				right : 'kArriveRight',
				'sharp right' : 'kArriveRight'
			}
		),
		merge : Object.freeze (
			{
				default : 'kMergeDefault',
				'sharp left' : 'kMergeLeft',
				left : 'kMergeLeft',
				'slight left' : 'kMergeLeft',
				straight : 'kMergeDefault',
				'slight right' : 'kMergeRight',
				right : 'kMergeRight',
				'sharp right' : 'kMergeRight'
			}
		),
		'on ramp' : Object.freeze (
			{
				default : 'kUndefined',
				'sharp left' : 'kOnRampLeft',
				left : 'kOnRampLeft',
				'slight left' : 'kOnRampLeft',
				'slight right' : 'kOnRampRight',
				right : 'kOnRampRight',
				'sharp right' : 'kOnRampRight'
			}
		),
		'off ramp' : Object.freeze (
			{
				default : 'kUndefined',
				'sharp left' : 'kOffRampLeft',
				left : 'kOffRampLeft',
				'slight left' : 'kOffRampLeft',
				'slight right' : 'kOffRampRight',
				right : 'kOffRampRight',
				'sharp right' : 'kOffRampRight'
			}
		),
		fork : Object.freeze (
			{
				default : 'kUndefined',
				'sharp left' : 'kForkLeft',
				left : 'kForkLeft',
				'slight left' : 'kForkLeft',
				'slight right' : 'kForkRight',
				right : 'kForkRight',
				'sharp right' : 'kForkRight'
			}
		),
		'end of road' : Object.freeze (
			{
				default : 'kUndefined',
				'sharp left' : 'kEndOfRoadLeft',
				left : 'kEndOfRoadLeft',
				'slight left' : 'kEndOfRoadLeft',
				'slight right' : 'kEndOfRoadRight',
				right : 'kEndOfRoadRight',
				'sharp right' : 'kEndOfRoadRight'
			}
		),
		continue : Object.freeze (
			{
				default : 'kUndefined',
				'sharp left' : 'kContinueSharpLeft',
				left : 'kContinueLeft',
				'slight left' : 'kContinueSlightLeft',
				straight : 'kContinueStraight',
				'slight right' : 'kContinueSlightRight',
				right : 'kContinueRight',
				'sharp right' : 'kContinueSharpRight'
			}
		),
		roundabout : Object.freeze (
			{
				default : 'kUndefined',
				'sharp left' : 'kRoundaboutLeft',
				left : 'kRoundaboutLeft',
				'slight left' : 'kRoundaboutLeft',
				'slight right' : 'kRoundaboutRight',
				right : 'kRoundaboutRight',
				'sharp right' : 'kRoundaboutRight'
			}
		),
		rotary : Object.freeze (
			{
				default : 'kUndefined',
				'sharp left' : 'kRotaryLeft',
				left : 'kRotaryLeft',
				'slight left' : 'kRotaryLeft',
				'slight right' : 'kRotaryRight',
				right : 'kRotaryRight',
				'sharp right' : 'kRotaryRight'
			}
		),
		'roundabout turn' : Object.freeze (
			{
				default : 'kUndefined',
				'sharp left' : 'kRoundaboutTurnSharpLeft',
				left : 'kRoundaboutTurnLeft',
				'slight left' : 'kRoundaboutTurnSlightLeft',
				straight : 'kRoundaboutTurnStraight',
				'slight right' : 'kRoundaboutTurnSlightRight',
				right : 'kRoundaboutTurnRight',
				'sharp right' : 'kRoundaboutTurnSharpRight'
			}
		),
		notification : Object.freeze (
			{
				default : 'kUndefined'
			}
		),
		default : Object.freeze (
			{
				default : 'kUndefined'
			}
		)
	}
);

/*
--- End of IconList.js file ---------------------------------------------------------------------------------------------------
*/