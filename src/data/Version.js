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
	- v3.0.0:
		- Issue ♯175 : Private and static fields and methods are coming
Doc reviewed 20210901
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

@module data
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/*

Warning!!! Warning!!! Warning!!! Warning!!! Warning!!! Warning!!! Warning!!!

								--
							   //\\
							  //  \\
							 //    \\
							//   |  \\
						   //    |   \\
						  //     |    \\
						 //      o     \\
						 \==============/

Since v3.0.0 theDataVersion and theAppVersion are two different values.

theDataVersion is only modified when changes in the Itinerary, ItineraryPoint,
Maneuver, Note, Route, Travel or WayPoint classes interfaces.

You have also to adapt the theDataVersion in the #upgradeObject ( ) method of
Itinerary, ItineraryPoint,Maneuver, Note, Route, Travel and WayPoint.

The theAppVersion changes at each release.
You have also to change the theAppVersion in the package.json file
and run npm audit fix before a release.

*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@desc The current version of TravelNotes
@type {string}
@constant
@global

@------------------------------------------------------------------------------------------------------------------------------
*/

const theDataVersion = '2.3.0';
const theAppVersion = 'v3.0.0';

export { theDataVersion, theAppVersion };

/*
--- End of Version.js file ----------------------------------------------------------------------------------------------------
*/