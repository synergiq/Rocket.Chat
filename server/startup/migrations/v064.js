import { Migrations } from 'meteor/rocketchat:migrations';
import { Messages } from 'meteor/rocketchat:models';
import s from 'underscore.string';

Migrations.add({
	version: 64,
	up() {
		Messages.find({ t: 'room_changed_topic', msg: /</ }, { msg: 1 }).forEach(function(message) {
			const msg = s.escapeHTML(message.msg);
			Messages.update({ _id: message._id }, { $set: { msg } });
		});
	},
});
