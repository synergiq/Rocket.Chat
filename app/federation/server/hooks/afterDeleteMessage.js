import { FederationRoomEvents, Rooms } from '../../../models/server';
import { logger } from '../lib/logger';
import { isFederated } from '../functions/helpers';
import { getFederationDomain } from '../lib/getFederationDomain';
import { dispatchEvent } from '../handler';

async function afterDeleteMessage(message) {
	const room = Rooms.findOneById(message.rid);

	// If there are not federated users on this room, ignore it
	if (!isFederated(room)) { return; }

	logger.client.debug(() => `afterDeleteMessage => message=${ JSON.stringify(message, null, 2) } room=${ JSON.stringify(room, null, 2) }`);

	// Create the delete message event
	const event = await FederationRoomEvents.createDeleteMessageEvent(getFederationDomain(), room._id, message._id);

	// Dispatch event (async)
	dispatchEvent(room.federation.domains, event);

	return message;
}

export const definition = {
	hook: 'afterDeleteMessage',
	callback: (message) => Promise.await(afterDeleteMessage(message)),
	id: 'federation-after-delete-message',
};
