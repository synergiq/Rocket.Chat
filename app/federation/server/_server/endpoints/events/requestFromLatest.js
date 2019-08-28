import { EJSON } from 'meteor/ejson';

import { API } from '../../../../../api/server';
import { Federation } from '../../../federation';
import { logger } from '../../../logger';
import { FederationRoomEvents } from '../../../../../models/server';

API.v1.addRoute('federation.events.requestFromLatest', { authRequired: false }, {
	async post() {
		if (!Federation.enabled) {
			return API.v1.failure('Not found');
		}

		//
		// Decrypt the payload if needed
		const payload = Federation.crypt.decryptIfNeeded(this.request, this.bodyParams);

		const { fromDomain, contextType, contextQuery, latestEventIds } = EJSON.fromJSONValue(payload);

		logger.server.debug(`federation.events.requestFromLatest => contextType=${ contextType } contextQuery=${ JSON.stringify(contextQuery, null, 2) } latestEventIds=${ latestEventIds.join(', ') }`);

		let EventsModel;

		// Define the model for the context
		switch (contextType) {
			case 'room':
				EventsModel = FederationRoomEvents;
				break;
		}

		let missingEvents = [];

		if (latestEventIds.length) {
			// Get the oldest event from the latestEventIds
			const oldestEvent = EventsModel.findOne({ _id: { $in: latestEventIds } }, { $sort: { timestamp: 1 } });

			if (!oldestEvent) {
				return;
			}

			// Get all the missing events on this context, after the oldest one
			missingEvents = EventsModel.find({ _id: { $nin: latestEventIds }, context: contextQuery, timestamp: { $gte: oldestEvent.timestamp } }, { sort: { timestamp: 1 } }).fetch();
		} else {
			// If there are no latest events, send all of them
			missingEvents = EventsModel.find({ context: contextQuery }, { sort: { timestamp: 1 } }).fetch();
		}

		// Dispatch all the events, on the same request
		Federation.client.dispatchEvents([fromDomain], missingEvents);
	},
});
