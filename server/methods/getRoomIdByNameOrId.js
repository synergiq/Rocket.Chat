// DEPRECATE
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Rooms } from 'meteor/rocketchat:models';
import { canAccessRoom } from 'meteor/rocketchat:authorization';

Meteor.methods({
	getRoomIdByNameOrId(rid) {
		check(rid, String);

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'getRoomIdByNameOrId',
			});
		}

		const room = Rooms.findOneById(rid) || Rooms.findOneByName(rid);

		if (room == null) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'getRoomIdByNameOrId',
			});
		}

		if (!canAccessRoom(room, Meteor.user())) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'getRoomIdByNameOrId',
			});
		}

		return room._id;
	},
});
