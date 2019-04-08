import { Meteor } from 'meteor/meteor';
import { RoomTypeConfig, roomTypes, getUserPreference } from '../../utils';

export class DiscussionRoomType extends RoomTypeConfig {
	constructor() {
		super({
			identifier: 'd',
			order: 25,
			label: 'Discussion',
		});

		// we need a custom template in order to have a custom query showing the subscriptions to discussions
		this.customTemplate = 'DiscussionList';
	}

	condition() {
		return getUserPreference(Meteor.userId(), 'sidebarShowDiscussion');
	}
}

roomTypes.add(new DiscussionRoomType());
