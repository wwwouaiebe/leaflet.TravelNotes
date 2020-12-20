/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
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

You have also to adapt the version in the ourValidate ( ) method of
Itinerary, ItineraryPoint,Maneuver, Note, Route, Travel and WayPoint
*/

const ourCurrentVersion = '1.14.0';

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The version number
	@type {string}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourCurrentVersion as theCurrentVersion
};

/*
--- End of Version.js file ----------------------------------------------------------------------------------------------------
*/