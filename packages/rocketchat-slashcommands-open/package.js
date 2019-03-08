Package.describe({
	name: 'rocketchat:slashcommands-open',
	version: '0.0.1',
	summary: 'Command handler for the /open command',
	git: '',
});

Package.onUse(function(api) {
	api.use([
		'ecmascript',
		'check',
		'rocketchat:utils',
		'rocketchat:models',
		'kadira:flow-router',
		'templating',
	]);
	api.mainModule('client/index.js', 'client');
});
