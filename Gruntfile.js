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
			TravelNotes: {
				files: {
					'tmp/TravelNotes.js': ['src/L.TravelNotes.js']
				}
			},
			Roadbook: {
				files: {
					'tmp/TravelNotesRoadbook.js': ['src/roadbook/roadbook.js']
				}
			}
		},
		uglify: {
			TravelNotesDefault: {
				options: {
					mangle: false,
					beautify: true
				},
				files: {
					'tmp/TravelNotes.min.js': ['tmp/TravelNotes.js']
				}
			},
			TravelNotesRelease: {
				options: {
					banner: '/*! <%= pkg.name %> - version <%= pkg.version %> - build <%= pkg.build %> - ' +
					'<%= grunt.template.today("isoDateTime") %> - Copyright 2017 <%= grunt.template.today("yyyy") %> wwwouaiebe - Contact: http//www.ouaie.be/ - This  program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or any later version.*/\n\n'
				},
				files: {
					'tmp/TravelNotes.min.js': ['tmp/TravelNotes.js']
				}
			},
			RoadbookRelease: {
				files: {
					'tmp/TravelNotesRoadbook.min.js': ['tmp/TravelNotesRoadbook.js']
				}
			},
			RoadbookDefault: {
				options: {
					mangle: false,
					beautify: true
				},
				files: {
					'tmp/TravelNotesRoadbook.min.js': ['tmp/TravelNotesRoadbook.js']
				}
			}
		},
		cssmin: {
			options: {
				mergeIntoShorthands: false,
				roundingPrecision: -1
			},
			TravelNotes: {
				files: {
					'tmp/TravelNotes.min.css': ['src/css/ContextMenu.css', 'src/css/SortableList.css', 'src/css/BaseDialog.css', 'src/css/ColorDialog.css', 'src/css/RoutePropertiesDialog.css', 'src/css/NoteDialog.css', 'src/css/AboutDialog.css', 'src/css/Control.css', 'src/css/Popup.css', 'src/css/Notes.css', 'src/css/NotesIcons.css', 'src/css/WayPoints.css']
				}
			},
			Roadbook: {
				files: {
					'tmp/TravelNotesRoadbook.min.css': ['src/css/NotesIcons.css', 'src/css/Roadbook.css']
				}
			}
		},
		includes: {
			Roadbook: {
				files: {
					'tmp/TravelNotesRoadbook.html' : ['src/html/TravelNotesRoadbook.html']
				}
			}
		},
		copy: {
			dist: {
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
						src: ['index.html'],
						dest: 'dist/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotes.min.css'],
						dest: 'dist/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotes.min.js'],
						dest: 'dist/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotesRoadbook.html'],
						dest: 'dist/'
					}					
				]
			},
			ghpage: {
				files: [
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
						src: ['index.html'],
						dest: 'gh-page/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotes.min.css'],
						dest: 'gh-page/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotes.min.js'],
						dest: 'gh-page/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotesRoadbook.html'],
						dest: 'gh-page/'
					}					
				]
			},
			TravelNotesGuides: {
				files: [
					{
						expand: true,
						cwd: 'TravelNotesGuides/',
						src: ['*.md'],
						dest: 'gh-page/TravelNotesGuides/'
					},
					{
						expand: true,
						cwd: 'TravelNotesGuides/en/',
						src: ['*.md', '*.png'],
						dest: 'gh-page/TravelNotesGuides/en/'
					},
					{
						expand: true,
						cwd: 'TravelNotesGuides/fr/',
						src: ['*.md', '*.png'],
						dest: 'gh-page/TravelNotesGuides/fr/'
					}
				]
			}
		},
		clean : ['tmp']
	});
	grunt.config.data.pkg.build = ("0000" + grunt.config.data.pkg.nextBuild).substr(-4,4) ;
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');	
	grunt.loadNpmTasks('grunt-includes');	
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-build-number');
	grunt.registerTask('default', ['jshint', 'buildnumber', 'browserify', 'uglify:TravelNotesDefault', 'uglify:RoadbookDefault', 'cssmin', 'includes', 'copy:ghpage', 'clean']);
	grunt.registerTask('release', ['jshint', 'buildnumber', 'browserify', 'uglify:TravelNotesRelease', 'uglify:RoadbookRelease', 'cssmin', 'includes', 'copy', 'clean']);
	console.log ( '---------------------------------------------------------------------------------------------------------------------------------------------');
	console.log ( '\n                                     ' + grunt.config.data.pkg.name + ' - ' + grunt.config.data.pkg.version +' - build: '+ grunt.config.data.pkg.build + ' - ' + grunt.template.today("isoDateTime") +'\n' );
	console.log ( '---------------------------------------------------------------------------------------------------------------------------------------------');
};