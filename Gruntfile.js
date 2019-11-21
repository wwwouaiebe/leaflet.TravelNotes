module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		eslint: {
			target: ['src/**/*.js']
		},	
		rollup : {
			Default : {
				files: {
				  'tmp/TravelNotes.tmp.js': ['src/TravelNotes.js'],  
				  'tmp/TravelNotesRoadbook.min.js': ['src/roadbook/roadbook.js']				  
				}
			}
		},
		includes: {
			
			TravelNotes: {
				files: {
					'tmp/TravelNotes.min.js' : ['src/TravelNotes.template']
				}
			},
			Polyline: {
				files: {
					'src/polyline/Polyline.js' : ['src/polyline/Polyline.template']
				}
			},
			Roadbook: {
				files: {
					'tmp/TravelNotesRoadbook.html' : ['src/html/TravelNotesRoadbook.html']
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
		uglify: {
			TravelNotes: {
				options: {
					banner: '/*! <%= pkg.name %> - version <%= pkg.version %> - build <%= pkg.build %> - ' +
					'<%= grunt.template.today("isoDateTime") %> - Copyright 2017 <%= grunt.template.today("yyyy") %> wwwouaiebe - Contact: http//www.ouaie.be/ - This  program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or any later version.*/\n\n',
					mangle: true,
					beautify: false
				},
				files: {
					'tmp/TravelNotes.min.js': ['tmp/TravelNotes.min.js']
				}
			},
			Roadbook: {
				options: {
					banner: '/*! <%= pkg.name %> - version <%= pkg.version %> - build <%= pkg.build %> - ' +
					'<%= grunt.template.today("isoDateTime") %> - Copyright 2017 <%= grunt.template.today("yyyy") %> wwwouaiebe - Contact: http//www.ouaie.be/ - This  program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or any later version.*/\n\n',
					mangle: true,
					beautify: false
				},
				files: {
					'tmp/TravelNotesRoadbook.min.js': ['tmp/TravelNotesRoadbook.min.js']
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
	grunt.config.data.pkg.build = ("00000" + ( Number.parseInt ( grunt.config.data.pkg.build ) + 1 )).substr ( -5, 5 ) ;
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-rollup');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-includes');
	grunt.loadNpmTasks('grunt-contrib-uglify-es');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.registerTask('default', [ 'includes:Polyline', 'eslint', 'rollup', 'includes:TravelNotes', 'cssmin', 'includes:Roadbook', 'copy:ghpage'/*, 'clean'*/ ]);
	grunt.registerTask('release', [ 'includes:Polyline', 'eslint', 'rollup', 'includes:TravelNotes', 'uglify', 'cssmin', 'includes:Roadbook', 'copy', 'clean' ]);
	grunt.file.write ( 'package.json', JSON.stringify ( grunt.config.data.pkg, null, 2 ) );
	console.log ( '---------------------------------------------------------------------------------------------------------------------------------------------');
	console.log ( '\n                                     ' + grunt.config.data.pkg.name + ' - ' + grunt.config.data.pkg.version +' - build: '+ grunt.config.data.pkg.build + ' - ' + grunt.template.today("isoDateTime") +'\n' );
	console.log ( '---------------------------------------------------------------------------------------------------------------------------------------------');
};