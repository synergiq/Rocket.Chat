import { Migrations } from 'meteor/rocketchat:migrations';
import { Settings } from 'meteor/rocketchat:models';

Migrations.add({
	version: 126,
	up() {
		if (!Settings) {
			return;
		}

		const query = {
			_id: 'Accounts_Default_User_Preferences_idleTimeoutLimit',
		};
		const setting = Settings.findOne(query);

		if (setting) {
			delete setting._id;
			Settings.upsert({ _id: 'Accounts_Default_User_Preferences_idleTimeLimit' }, setting);
			Settings.remove(query);
		}
	},
});
