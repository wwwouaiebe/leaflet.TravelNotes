module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		eslint: {
			target: ['src/**/*.js']
		},	
		rollup : {
			Default : {
				options : {
					format : 'iife'
				},
				files: {
				  'tmp/TravelNotes.min.js': ['src/TravelNotes.js'],  
				  'tmp/TravelNotesRoadbook.min.js': ['src/roadbook/roadbook.js']				  
				}
			}
		},
		includes: {
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
					banner: '\n/*!\n<%= pkg.name %> - version <%= pkg.version %> ' + 
						'\nbuild <%= pkg.buildNumber %> - ' + 
						'<%= grunt.template.today("isoDateTime") %> ' + 
						'\nCopyright 2017 <%= grunt.template.today("yyyy") %> wwwouaiebe ' + 
						'\nContact: http//www.ouaie.be/' + 
						'\nSources: <%= pkg.sources %> ' + 
						'\nLicense: <%= pkg.license %>\n*/\n\n',
					mangle: true,
					beautify: false
				},
				files: {
					'tmp/TravelNotes.min.js': ['tmp/TravelNotes.min.js']
				}
			},
			Roadbook: {
				options: {
					banner: '\n/*!\n<%= pkg.name %> - version <%= pkg.version %> ' + 
						'\nbuild <%= pkg.buildNumber %> - ' + 
						'<%= grunt.template.today("isoDateTime") %> ' + 
						'\nCopyright 2017 <%= grunt.template.today("yyyy") %> wwwouaiebe ' + 
						'\nContact: http//www.ouaie.be/' + 
						'\nSources: <%= pkg.sources %> ' + 
						'\nLicense: <%= pkg.license %>\n*/\n\n',
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
			debug: {
				files: [
					{
						expand: true,
						cwd: 'src/cfg/',
						src: ['*.json'],
						dest: 'debug/'
					},
					{
						expand: true,
						cwd: 'src/translations/',
						src: ['*.json'],
						dest: 'debug/'
					},
					{
						expand: true,
						cwd: 'src/html/',
						src: 'indexDebug.html',
						rename: function ( ){return 'debug/index.html';}
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotes.min.css'],
						dest: 'debug/'
					},
					{
						expand: true,
						cwd: 'src/',
						src: ['**/*.js'],
						dest: 'debug/src/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotesRoadbook.html'],
						dest: 'debug/'
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
	grunt.config.data.pkg.buildNumber = grunt.file.readJSON('buildNumber.json').buildNumber;
	grunt.config.data.pkg.buildNumber = ("00000" + ( Number.parseInt ( grunt.config.data.pkg.buildNumber ) + 1 )).substr ( -5, 5 ) ;
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-rollup');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-includes');
	grunt.loadNpmTasks('grunt-contrib-uglify-es');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.registerTask('default', [ 'includes:Polyline', 'eslint', 'rollup', 'cssmin', 'includes:Roadbook', 'copy:debug', 'clean' ]);
	grunt.registerTask('release', [ 'includes:Polyline', 'eslint', 'rollup', 'uglify', 'cssmin', 'includes:Roadbook', 'copy:dist', 'copy:ghpage', 'copy:TravelNotesGuides', 'clean' ]);
	console.log ( '---------------------------------------------------------------------------------------------------------------------------------------------');
	console.log ( '\n                                     ' + grunt.config.data.pkg.name + ' - ' + grunt.config.data.pkg.version +' - build: '+ grunt.config.data.pkg.buildNumber + ' - ' + grunt.template.today("isoDateTime") +'\n' );
	console.log ( '---------------------------------------------------------------------------------------------------------------------------------------------');
	grunt.file.write ( 'buildNumber.json', '{ "buildNumber" : "' + grunt.config.data.pkg.buildNumber + '"}'  );
};