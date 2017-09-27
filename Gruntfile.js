module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),


		jshint: {
			files: ['Gruntfile.js', 'src/**/*.js', 'tests/*.js'],
		},
		browserify: {
			control: {
				src: ['src/L.TravelNotes.Interface.js'],
				dest: 'dist/TravelNotes.js'
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> - version <%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %> - Copyright 2015 2017 Christian Guyette - Contact: http//www.ouaie.be/ - This  program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or any later version.*/\n\n'
			},
			build: {
				src: 'dist/TravelNotes.js',
				dest: 'dist/TravelNotes.min.js'
			}
		},
		cssmin: {
			options: {
				mergeIntoShorthands: false,
				roundingPrecision: -1
			},
			target: {
				files: {
					'dist/TravelNotes.min.css': ['src/css/ContextMenu.css', 'src/css/SortableList.css', 'src/css/BaseDialog.css', 'src/css/ColorDialog.css', 'src/css/RoutePropertiesDialog.css', 'src/css/NoteDialog.css', 'src/css/AboutDialog.css', 'src/css/Control.css', 'src/css/Popup.css', 'src/css/Notes.css', 'src/css/NotesIcons.css', 'src/css/WayPoints.css']
				}
			}
		}		
	});
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');	
	grunt.registerTask('default', ['jshint', 'browserify', 'uglify','cssmin']);
};