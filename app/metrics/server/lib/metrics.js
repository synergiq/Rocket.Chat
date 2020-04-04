import http from 'http';

import client from 'prom-client';
import connect from 'connect';
import _ from 'underscore';
import gcStats from 'prometheus-gc-stats';
import { Meteor } from 'meteor/meteor';

import { Info, getOplogInfo } from '../../../utils/server';
import { Migrations } from '../../../migrations';
import { settings } from '../../../settings';
import { Statistics } from '../../../models';
import { oplogEvents } from '../../../models/server/oplogEvents';

export const metrics = {};

metrics.meteorMethods = new client.Summary({
	name: 'rocketchat_meteor_methods',
	help: 'summary of meteor methods count and time',
	labelNames: ['method', 'has_connection', 'has_user'],
});

metrics.rocketchatCallbacks = new client.Summary({
	name: 'rocketchat_callbacks',
	help: 'summary of rocketchat callbacks count and time',
	labelNames: ['hook', 'callback'],
});

metrics.rocketchatHooks = new client.Summary({
	name: 'rocketchat_hooks',
	help: 'summary of rocketchat hooks count and time',
	labelNames: ['hook', 'callbacks_length'],
});

metrics.rocketchatRestApi = new client.Summary({
	name: 'rocketchat_rest_api',
	help: 'summary of rocketchat rest api count and time',
	labelNames: ['method', 'entrypoint', 'user_agent', 'status', 'version'],
});

metrics.meteorSubscriptions = new client.Summary({
	name: 'rocketchat_meteor_subscriptions',
	help: 'summary of meteor subscriptions count and time',
	labelNames: ['subscription'],
});

metrics.messagesSent = new client.Counter({ name: 'rocketchat_message_sent', help: 'cumulated number of messages sent' });
metrics.notificationsSent = new client.Counter({ name: 'rocketchat_notification_sent', labelNames: ['notification_type'], help: 'cumulated number of notifications sent' });

metrics.ddpSessions = new client.Gauge({ name: 'rocketchat_ddp_sessions_count', help: 'number of open ddp sessions' });
metrics.ddpAthenticatedSessions = new client.Gauge({ name: 'rocketchat_ddp_sessions_auth', help: 'number of authenticated open ddp sessions' });
metrics.ddpConnectedUsers = new client.Gauge({ name: 'rocketchat_ddp_connected_users', help: 'number of unique connected users' });
metrics.ddpRateLimitExceeded = new client.Counter({ name: 'rocketchat_ddp_rate_limit_exceeded', labelNames: ['limit_name', 'user_id', 'client_address', 'type', 'name', 'connection_id'], help: 'number of times a ddp rate limiter was exceeded' });

metrics.version = new client.Gauge({ name: 'rocketchat_version', labelNames: ['version'], help: 'Rocket.Chat version' });
metrics.migration = new client.Gauge({ name: 'rocketchat_migration', help: 'migration versoin' });
metrics.instanceCount = new client.Gauge({ name: 'rocketchat_instance_count', help: 'instances running' });
metrics.oplogEnabled = new client.Gauge({ name: 'rocketchat_oplog_enabled', labelNames: ['enabled'], help: 'oplog enabled' });
metrics.oplogQueue = new client.Gauge({ name: 'rocketchat_oplog_queue', labelNames: ['queue'], help: 'oplog queue' });
metrics.oplog = new client.Counter({
	name: 'rocketchat_oplog',
	help: 'summary of oplog operations',
	labelNames: ['collection', 'op'],
});

// User statistics
metrics.totalUsers = new client.Gauge({ name: 'rocketchat_users_total', help: 'total of users' });
metrics.activeUsers = new client.Gauge({ name: 'rocketchat_users_active', help: 'total of active users' });
metrics.nonActiveUsers = new client.Gauge({ name: 'rocketchat_users_non_active', help: 'total of non active users' });
metrics.onlineUsers = new client.Gauge({ name: 'rocketchat_users_online', help: 'total of users online' });
metrics.awayUsers = new client.Gauge({ name: 'rocketchat_users_away', help: 'total of users away' });
metrics.offlineUsers = new client.Gauge({ name: 'rocketchat_users_offline', help: 'total of users offline' });

// Room statistics
metrics.totalRooms = new client.Gauge({ name: 'rocketchat_rooms_total', help: 'total of rooms' });
metrics.totalChannels = new client.Gauge({ name: 'rocketchat_channels_total', help: 'total of public rooms/channels' });
metrics.totalPrivateGroups = new client.Gauge({ name: 'rocketchat_private_groups_total', help: 'total of private rooms' });
metrics.totalDirect = new client.Gauge({ name: 'rocketchat_direct_total', help: 'total of direct rooms' });
metrics.totalLivechat = new client.Gauge({ name: 'rocketchat_livechat_total', help: 'total of livechat rooms' });

// Message statistics
metrics.totalMessages = new client.Gauge({ name: 'rocketchat_messages_total', help: 'total of messages' });
metrics.totalChannelMessages = new client.Gauge({ name: 'rocketchat_channel_messages_total', help: 'total of messages in public rooms' });
metrics.totalPrivateGroupMessages = new client.Gauge({ name: 'rocketchat_private_group_messages_total', help: 'total of messages in private rooms' });
metrics.totalDirectMessages = new client.Gauge({ name: 'rocketchat_direct_messages_total', help: 'total of messages in direct rooms' });
metrics.totalLivechatMessages = new client.Gauge({ name: 'rocketchat_livechat_messages_total', help: 'total of messages in livechat rooms' });

const setPrometheusData = async () => {
	client.register.setDefaultLabels({
		uniqueId: settings.get('uniqueID'),
		siteUrl: settings.get('Site_Url'),
	});
	const date = new Date();
	client.register.setDefaultLabels({
		unique_id: settings.get('uniqueID'),
		site_url: settings.get('Site_Url'),
		version: Info.version,
	});

	const sessions = Array.from(Meteor.server.sessions.values());
	const authenticatedSessions = sessions.filter((s) => s.userId);
	metrics.ddpSessions.set(Meteor.server.sessions.size, date);
	metrics.ddpAthenticatedSessions.set(authenticatedSessions.length, date);
	metrics.ddpConnectedUsers.set(_.unique(authenticatedSessions.map((s) => s.userId)).length, date);

	const statistics = Statistics.findLast();
	if (!statistics) {
		return;
	}

	metrics.version.set({ version: statistics.version }, 1, date);
	metrics.migration.set(Migrations._getControl().version, date);
	metrics.instanceCount.set(statistics.instanceCount, date);
	metrics.oplogEnabled.set({ enabled: statistics.oplogEnabled }, 1, date);

	// User statistics
	metrics.totalUsers.set(statistics.totalUsers, date);
	metrics.activeUsers.set(statistics.activeUsers, date);
	metrics.nonActiveUsers.set(statistics.nonActiveUsers, date);
	metrics.onlineUsers.set(statistics.onlineUsers, date);
	metrics.awayUsers.set(statistics.awayUsers, date);
	metrics.offlineUsers.set(statistics.offlineUsers, date);

	// Room statistics
	metrics.totalRooms.set(statistics.totalRooms, date);
	metrics.totalChannels.set(statistics.totalChannels, date);
	metrics.totalPrivateGroups.set(statistics.totalPrivateGroups, date);
	metrics.totalDirect.set(statistics.totalDirect, date);
	metrics.totalLivechat.set(statistics.totalLivechat, date);

	// Message statistics
	metrics.totalMessages.set(statistics.totalMessages, date);
	metrics.totalChannelMessages.set(statistics.totalChannelMessages, date);
	metrics.totalPrivateGroupMessages.set(statistics.totalPrivateGroupMessages, date);
	metrics.totalDirectMessages.set(statistics.totalDirectMessages, date);
	metrics.totalLivechatMessages.set(statistics.totalLivechatMessages, date);

	const oplogQueue = getOplogInfo().mongo._oplogHandle?._entryQueue?.length || 0;
	metrics.oplogQueue.set(oplogQueue, date);
};

const app = connect();

// const compression = require('compression');
// app.use(compression());

app.use('/metrics', (req, res) => {
	res.setHeader('Content-Type', 'text/plain');
	res.end(client.register.metrics());
});

app.use('/', (req, res) => {
	const html = `<html>
		<head>
			<title>Rocket.Chat Prometheus Exporter</title>
		</head>
		<body>
			<h1>Rocket.Chat Prometheus Exporter</h1>
			<p><a href="/metrics">Metrics</a></p>
		</body>
	</html>`;

	res.write(html);
	res.end();
});

const server = http.createServer(app);

const oplogMetric = ({ collection, op }) => {
	metrics.oplog.inc({
		collection,
		op,
	});
};

let timer;
let wasEnabled = false;
let resetTimer;
const updatePrometheusConfig = async () => {
	const port = process.env.PROMETHEUS_PORT || settings.get('Prometheus_Port');
	const enabled = Boolean(port && settings.get('Prometheus_Enabled'));

	if (wasEnabled === enabled) {
		return;
	}

	wasEnabled = enabled;

	if (!enabled) {
		server.close();
		Meteor.clearInterval(timer);
		Meteor.clearInterval(resetTimer);
		oplogEvents.removeListener('record', oplogMetric);
		return;
	}

	try {
		client.collectDefaultMetrics();
		gcStats()();
	} catch (error) {
		console.error(error);
	}

	server.listen({
		port,
		host: process.env.BIND_IP || '0.0.0.0',
	});

	timer = Meteor.setInterval(setPrometheusData, 5000);

	const resetInterval = settings.get('Prometheus_Reset_Interval');
	if (resetInterval) {
		resetTimer = Meteor.setInterval(() => {
			client.register.getMetricsAsArray().forEach((metric) => { metric.hashMap = {}; });
		}, resetInterval);
	}

	oplogEvents.on('record', oplogMetric);
};

Meteor.startup(async () => {
	settings.get('Prometheus_Enabled', updatePrometheusConfig);
	settings.get('Prometheus_Port', updatePrometheusConfig);
});
