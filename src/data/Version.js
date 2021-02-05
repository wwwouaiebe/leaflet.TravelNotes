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
	- v1.4.0:
		- created from DataManager
Doc reviewed 20200728
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Version.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module Version
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/*

Warning!!! Warning!!! Warning!!! Warning!!! Warning!!! Warning!!! Warning!!! Warning!!! Warning!!!

								--
							   //\\
							  //  \\
							 //    \\
							//   |  \\
						   //    |   \\
						  //     |    \\
						 //      o     \\
						 \==============/

You have also to adapt the version in the ourUpgrade ( ) method of
Itinerary, ItineraryPoint,Maneuver, Note, Route, Travel and WayPoint

and change the version in the package.json file and run npm audit fix.

*/

const OUR_CURRENT_VERSION = '2.2.0';

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The version number
	@type {string}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	OUR_CURRENT_VERSION as theCurrentVersion
};

/*
--- End of Version.js file ----------------------------------------------------------------------------------------------------
*/