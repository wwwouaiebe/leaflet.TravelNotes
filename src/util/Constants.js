/* eslint no-magic-numbers: "off" */

const OUR_CONST = {
	angle : {
		degree0 : 0,
		degree90 : 90,
		degree180 : 180,
		degree270 : 270,
		degree360 : 360
	},
	distance : {
		mInKm : 1000,
		round : 10,
		fixed : 2,
		invalid : -1
	},
	geoLocation : {
		status : {
			refusedByUser : -1,
			disabled : 0,
			inactive : 1,
			active : 2
		}
	},
	hexadecimal : 16,
	invalidObjId : -1,
	latLng : {
		fixed : 6,
		maxLat : 90,
		minLat : -90,
		maxLng : 180,
		minLng : -180

	},
	mouse : {
		wheelFactor : 10
	},
	notFound : -1,
	numberMinus1 : -1,
	number1 : 1,
	number2 : 2,
	number3 : 3,
	number4 : 4,
	number5 : 5,
	number16 : 16,
	number65536 : 65536,
	polylinePrecision : 6,
	route : {
		notEdited : 0,
		editedNoChange : 1,
		editedChanged : 2
	},
	svgIcon : {
		positionOnRoute : {
			atStart : -1,
			onRoute : 0,
			atEnd : 1
		}
	},
	time : {
		secondInDay : 86400,
		secondInHour : 3600,
		secondInMinut : 60
	},
	xmlHttpRequest : {
		status : {
			ok : 200
		},
		readyState : {
			done : 4
		},
		timeout : 20000
	},
	zero : 0
};

export  { OUR_CONST };