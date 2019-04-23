import { Mongo, MongoInternals } from 'meteor/mongo';

const mongoOptionStr = process.env.MONGO_OPTIONS;
if (typeof mongoOptionStr !== 'undefined') {
	const mongoOptions = JSON.parse(mongoOptionStr);

	Mongo.setConnectionOptions(mongoOptions);
}

const isOplogEnabled = MongoInternals.defaultRemoteCollectionDriver().mongo._oplogHandle && !!MongoInternals.defaultRemoteCollectionDriver().mongo._oplogHandle.onOplogEntry;

if (!isOplogEnabled) {
	console.error(`
	OPLOG / REPLICASET is required to run Rocket.Chat.
	More information at https://rocket.chat/docs/installation/docker-containers/high-availability-install/#install-mongodb-replicaset
	`);

	process.exit(1);
}
