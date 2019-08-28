import { logger } from '../../logger';
import { FederationRoomEvents, Subscriptions, Users } from '../../../../models/server';
import { Federation } from '../../federation';
import { normalizers } from '../../normalizers';
import { deleteRoom } from '../../../../lib/server/functions';

export async function doAfterCreateRoom(room, users, subscriptions) {
	//
	// Genesis
	//

	// Normalize room
	const normalizedRoom = normalizers.normalizeRoom(room, users);

	// Ensure a genesis event for this room
	const genesisEvent = await FederationRoomEvents.createGenesisEvent(Federation.domain, normalizedRoom);

	//
	// Add user events
	//
	const addUserEvents = [];

	for (const user of users) {
		/* eslint-disable no-await-in-loop */

		const subscription = subscriptions[user._id];

		const normalizedSourceUser = normalizers.normalizeUser(user);
		const normalizedSourceSubscription = normalizers.normalizeSubscription(subscription);

		const addUserEvent = await FederationRoomEvents.createAddUserEvent(Federation.domain, normalizedRoom._id, normalizedSourceUser, normalizedSourceSubscription);

		addUserEvents.push(addUserEvent);

		/* eslint-enable no-await-in-loop */
	}

	// Dispatch the events
	Federation.client.dispatchEvents(normalizedRoom.federation.domains, [genesisEvent, ...addUserEvents]);
}

async function afterCreateRoom(roomOwner, room) {
	// If the room is federated, ignore
	if (room.federation) { return; }

	// Find all subscriptions of this room
	let subscriptions = Subscriptions.findByRoomIdWhenUsernameExists(room._id).fetch();
	subscriptions = subscriptions.reduce((acc, s) => {
		acc[s.u._id] = s;

		return acc;
	}, {});

	// Get all user ids
	const userIds = Object.keys(subscriptions);

	// Load all the users
	const users = Users.findUsersWithUsernameByIds(userIds).fetch();

	// Check if there is a federated user on this room
	const hasFederatedUser = users.find((u) => u.username.indexOf('@') !== -1);

	// If there are not federated users on this room, ignore it
	if (!hasFederatedUser) { return; }

	logger.client.debug(() => `afterCreateRoom => roomOwner=${ JSON.stringify(roomOwner, null, 2) } room=${ JSON.stringify(room, null, 2) }`);

	try {
		await doAfterCreateRoom(room, users, subscriptions);
	} catch (err) {
		deleteRoom(room._id);

		logger.client.error(() => `afterCreateRoom => room=${ JSON.stringify(room, null, 2) } => Could not create federated room: ${ err }`);
	}

	return room;
}

export const definition = {
	hook: 'afterCreateRoom',
	callback: (roomOwner, room) => Promise.await(afterCreateRoom(roomOwner, room)),
	id: 'federation-after-create-room',
};
