/* eslint no-magic-numbers: "off" */

export const THE_CONST = {
	distance : {
		fixed : 2,
		invalid : -1,
		defaultValue : 0
	},
	elev : {
		fixed : 2,
		defaultValue : 0
	},
	geoLocation : {
		status : {
			refusedByUser : -1,
			disabled : 0,
			inactive : 1,
			active : 2
		}
	},
	latLng : {
		defaultValue : 0,
		fixed : 6,
		maxLat : 90,
		minLat : -90,
		maxLng : 180,
		minLng : -180

	},
	mouse : {
		wheelCorrectionFactors : [ 0.3, 10, 1 ]
	},
	route : {
		edited : {
			notEdited : 0,
			editedNoChange : 1,
			editedChanged : 2
		}
	},
	svgProfile : {
		margin : 100,
		height : 500,
		width : 1000,
		yDeltaText : 30,
		xDeltaText : 10,
		vScales : [ 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000 ],
		hScales : [ 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000 ]
	}
};

export const ZERO = 0;

// to correct
/*
	invalidObjId : -1,
	notFound : -1,
	numberMinus1 : -1,
	number1 : 1,
	number2 : 2,
	number3 : 3,
	number4 : 4,
	number5 : 5,
	number10 : 10,
	number16 : 16,
	number100 : 100,
	polylinePrecision : 6,
	zero : 0
};

export { THE_CONST };
*/