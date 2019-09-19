module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: ['Gruntfile.js', 'src/**/*.js'],
		},
		buildnumber: {
			options: {
				field: 'nextBuild',
			},
			files: ['package.json']
		},
		browserify: {
			control: {
				src: ['src/L.TravelNotes.js'],
				dest: 'dist/TravelNotes.js'
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> - version <%= pkg.version %> - build <%= pkg.build %> - ' +
				'<%= grunt.template.today("isoDateTime") %> - Copyright 2017 <%= grunt.template.today("yyyy") %> wwwouaiebe - Contact: http//www.ouaie.be/ - This  program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or any later version.*/\n\n'
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
					'dist/TravelNotes.min.css': ['src/css/ContextMenu.css', 'src/css/SortableList.css', 'src/css/BaseDialog.css', 'src/css/ColorDialog.css', 'src/css/RoutePropertiesDialog.css', 'src/css/NoteDialog.css', 'src/css/AboutDialog.css', 'src/css/Control.css', 'src/css/Popup.css', 'src/css/Notes.css', 'src/css/NotesIcons.css', 'src/css/WayPoints.css'],
					'dist/TravelNotesRoadbook.min.css': ['src/css/NotesIcons.css', 'src/css/Roadbook.css']
				}
			}
		},
		copy: {
			main: {
				files: [
					{
						expand: true,
						cwd: 'src/cfg/',
						src: ['*.json'],
						dest: 'dist/'
					},
					{
						expand: true,
						cwd: 'src/translations/',
						src: ['*.json'],
						dest: 'dist/'
					},
					{
						expand: true,
						cwd: 'src/html/',
						src: ['*.html'],
						dest: 'dist/'
					},
					{
						expand: true,
						cwd: 'src/cfg/',
						src: ['*.json'],
						dest: 'gh-page/'
					},
					{
						expand: true,
						cwd: 'src/translations/',
						src: ['*.json'],
						dest: 'gh-page/'
					},
					{
						expand: true,
						cwd: 'src/html/',
						src: ['*.html'],
						dest: 'gh-page/'
					},
					{
						expand: true,
						cwd: 'dist/',
						src: ['*.css', '*.js'],
						dest: 'gh-page/'
					}
				]
			}
		},
	});
	grunt.config.data.pkg.build = ("0000" + grunt.config.data.pkg.nextBuild).substr(-4,4) ;
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');	
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-build-number');
	grunt.registerTask('default', ['jshint', 'buildnumber', 'browserify', 'uglify', 'cssmin', 'copy']);
	console.log ( '---------------------------------------------------------------------------------------------------------------------------------------------');
	console.log ( '\n                                     ' + grunt.config.data.pkg.name + ' - ' + grunt.config.data.pkg.version +' - build: '+ grunt.config.data.pkg.build + ' - ' + grunt.template.today("isoDateTime") +'\n' );
	console.log ( '---------------------------------------------------------------------------------------------------------------------------------------------');
};