Package.describe({
	name: 'rocketchat:ui-utils',
	version: '0.0.1',
	summary: 'Rocketchat Ui Utils',
	git: '',
	documentation: 'README.md',
});

Package.onUse(function(api) {
	api.use([
		'ecmascript',
		'http',
		'tap:i18n',
		'templating',
		'kadira:flow-router',
		'kadira:blaze-layout',
		'rocketchat:utils',
		'rocketchat:settings',
		'rocketchat:promises',
		'rocketchat:callbacks',
		'rocketchat:notifications',
		'rocketchat:authorization',
		'rocketchat:streamer',
		'rocketchat:models',
		'rocketchat:lazy-load',
		'rocketchat:emoji',
	]);
	api.mainModule('client/index.js', 'client');
	api.mainModule('server/index.js', 'server');
});
