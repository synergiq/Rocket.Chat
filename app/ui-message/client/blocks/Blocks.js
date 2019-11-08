import { Template } from 'meteor/templating';

import './Blocks.html';
import * as ActionManager from '../ActionManager';

Template.Blocks.events({
	async 'click button'(e) {
		e.preventDefault();
		e.stopPropagation();
		const { actionId, appID, value, mid } = this;
		ActionManager.triggerAction({ actionId, appID, value, mid });
	},
});

Template.Blocks.helpers({
	template() {
		const { type } = this;

		switch (type) {
			case 'section':
				return 'SectionBlock';
			case 'divider':
				return 'DividerBlock';
			case 'image':
				return 'ImageBlock';
			case 'actions':
				return 'ActionsBlock';
			case 'context':
				// TODO
				break;
			case 'input':
				// TODO
				break;
		}
	},
	data() {
		const { type, ...data } = this;
		return data;
	},
});
