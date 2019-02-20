Package.describe({
	name: 'rocketchat:ui-account',
	version: '0.1.0',
	// Brief, one-line summary of the package.
	summary: '',
	// URL to the Git repository containing the source code for this package.
	git: '',
	// By default, Meteor will default to using README.md for documentation.
	// To avoid submitting documentation, set this field to null.
	documentation: 'README.md',
});

Package.onUse(function(api) {
	api.use([
		'ecmascript',
		'templating',
		'rocketchat:lib',
		'sha',
		'rocketchat:utils',
		'rocketchat:custom-sounds',
		'rocketchat:authorization',
		'rocketchat:settings',
		'rocketchat:notifications',
		'rocketchat:callbacks',
		'rocketchat:ui-utils',
		'rocketchat:lazy-load',
		'rocketchat:file-upload',
	]);
	api.mainModule('client/index.js', 'client');
});
