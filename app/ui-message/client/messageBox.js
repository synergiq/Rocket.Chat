import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { EmojiPicker } from '../../emoji';
import { ChatSubscription } from '../../models';
import { settings } from '../../settings';
import {
	chatMessages,
	fileUpload,
	KonchatNotification,
} from '../../ui';
import { Layout, messageBox, popover, call } from '../../ui-utils';
import { t, roomTypes, getUserPreference } from '../../utils';
import moment from 'moment';
import {
	formattingButtons,
	applyFormatting,
} from './messageBoxFormatting';
import './messageBoxReplyPreview';
import './messageBoxTyping';
import './messageBoxAudioMessage';
import './messageBoxNotSubscribed';
import './messageBox.html';


Template.messageBox.onCreated(function() {
	EmojiPicker.init();
	this.popupConfig = new ReactiveVar(null);
	this.replyMessageData = new ReactiveVar();
	this.isMessageFieldEmpty = new ReactiveVar(true);
	this.isMicrophoneDenied = new ReactiveVar(true);
	this.sendIconDisabled = new ReactiveVar(false);
});

Template.messageBox.onRendered(function() {
	const { rid, onResize } = this.data;

	this.autorun(() => {
		Tracker.afterFlush(() => {
			const input = this.find('.js-input-message');
			const $input = $(input);

			this.input = input;

			chatMessages[rid].input = input;
			chatMessages[rid].$input = $input;

			if (!input) {
				this.popupConfig.set(null);
				return;
			}

			this.popupConfig.set({
				getInput: () => input,
			});

			$input.on('dataChange', () => {
				const messages = $input.data('reply') || [];
				this.replyMessageData.set(messages);
			});

			$input
				.autogrow({
					animate: true,
					onInitialize: true,
				})
				.on('autogrow', () => {
					onResize && onResize();
				});
		});
	});
});

Template.messageBox.helpers({
	isEmbedded() {
		return Layout.isEmbedded();
	},
	subscribed() {
		return roomTypes.verifyCanSendMessage(this.rid);
	},
	canSend() {
		if (roomTypes.readOnly(this.rid, Meteor.user())) {
			return false;
		}
		if (roomTypes.archived(this.rid)) {
			return false;
		}
		const roomData = Session.get(`roomData${ this.rid }`);
		if (roomData && roomData.t === 'd') {
			const subscription = ChatSubscription.findOne({
				rid: this.rid,
			}, {
				fields: {
					archived: 1,
					blocked: 1,
					blocker: 1,
				},
			});
			if (subscription && (subscription.archived || subscription.blocked || subscription.blocker)) {
				return false;
			}
		}
		return true;
	},
	popupConfig() {
		return Template.instance().popupConfig.get();
	},
	input() {
		return Template.instance().input;
	},
	replyMessageData() {
		return Template.instance().replyMessageData.get();
	},
	isEmojiEnabled() {
		return getUserPreference(Meteor.userId(), 'useEmojis');
	},
	maxMessageLength() {
		return settings.get('Message_AllowConvertLongMessagesToAttachment') ? null : settings.get('Message_MaxAllowedSize');
	},
	isSendIconDisabled() {
		return !Template.instance().sendIconDisabled.get();
	},
	actions() {
		const actionGroups = messageBox.actions.get();
		return Object.values(actionGroups)
			.reduce((actions, actionGroup) => [...actions, ...actionGroup], []);
	},
	formattingButtons() {
		return formattingButtons.filter(({ condition }) => !condition || condition());
	},
	isBlockedOrBlocker() {
		const roomData = Session.get(`roomData${ this.rid }`);
		if (roomData && roomData.t === 'd') {
			const subscription = ChatSubscription.findOne({
				rid: this.rid,
			}, {
				fields: {
					blocked: 1,
					blocker: 1,
				},
			});
			if (subscription && (subscription.blocked || subscription.blocker)) {
				return true;
			}
		}
	},
});

Template.messageBox.events({
	'click .js-join'(event) {
		event.stopPropagation();
		event.preventDefault();

		const joinCodeInput = Template.instance().find('[name=joinCode]');
		const joinCode = joinCodeInput && joinCodeInput.value;

		call('joinRoom', this.rid, joinCode);
	},
	'click .js-emoji-picker'(event) {
		event.stopPropagation();
		event.preventDefault();

		if (!getUserPreference(Meteor.userId(), 'useEmojis')) {
			return;
		}

		if (EmojiPicker.isOpened()) {
			EmojiPicker.close();
			return;
		}

		EmojiPicker.open(event.currentTarget, (emoji) => {
			const emojiValue = `:${ emoji }: `;

			const { input } = this;

			const caretPos = input.selectionStart;
			const textAreaTxt = input.value;

			input.focus();
			if (!document.execCommand || !document.execCommand('insertText', false, emojiValue)) {
				input.value = textAreaTxt.substring(0, caretPos) + emojiValue + textAreaTxt.substring(caretPos);
				input.focus();
			}

			input.selectionStart = caretPos + emojiValue.length;
			input.selectionEnd = caretPos + emojiValue.length;
		});
	},
	'focus .js-input-message'() {
		KonchatNotification.removeRoomNotification(this.rid);
	},
	'keydown .js-input-message'(event, instance) {
		const isMacOS = navigator.platform.indexOf('Mac') !== -1;
		const isCmdOrCtrlPressed = (isMacOS && event.metaKey) || (!isMacOS && event.ctrlKey);
		const key = event.key.toLowerCase();

		if (isCmdOrCtrlPressed) {
			const { pattern } = formattingButtons
				.filter(({ condition }) => !condition || condition())
				.find(({ command }) => command === key) || {};

			if (!pattern) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			const input = instance.find('.js-input-message');
			applyFormatting(pattern, input);
			return;
		}

		const { rid, onKeyDown } = this;
		onKeyDown && onKeyDown(rid, event, instance);
	},
	'keyup .js-input-message'(event, instance) {
		const { rid, onKeyUp } = this;
		onKeyUp && onKeyUp(rid, event, instance);
		instance.isMessageFieldEmpty.set(chatMessages[rid].isEmpty());
	},
	'paste .js-input-message'(event, instance) {
		const { input } = instance;
		setTimeout(() => {
			typeof input.updateAutogrow === 'function' && input.updateAutogrow();
		}, 50);

		if (!event.originalEvent.clipboardData) {
			return;
		}

		const files = [...event.originalEvent.clipboardData.items]
			.filter((item) => (item.kind === 'file' && item.type.indexOf('image/') !== -1))
			.map((item) => ({
				file: item.getAsFile(),
				name: `Clipboard - ${ moment().format(settings.get('Message_TimeAndDateFormat')) }`,
			}))
			.filter(({ file }) => file !== null);

		if (files.length) {
			event.preventDefault();
			fileUpload(files, input);
			return;
		}

		instance.isMessageFieldEmpty.set(false);
	},
	'input .js-input-message'(event, instance) {
		instance.sendIconDisabled.set(event.target.value !== '');

		const { rid, onValueChanged } = this;
		onValueChanged && onValueChanged(rid, event, instance);
	},
	'propertychange .js-input-message'(event, instance) {
		if (event.originalEvent.propertyName !== 'value') {
			return;
		}

		const { rid, onValueChanged } = this;
		onValueChanged && onValueChanged(rid, event, instance);
	},
	async 'click .js-send'(event, instance) {
		const { input } = chatMessages[this.rid];
		chatMessages[this.rid].send(this.rid, input, () => {
			input.updateAutogrow();
			instance.isMessageFieldEmpty.set(chatMessages[this.rid].isEmpty());
			input.focus();
		});
	},
	'click .js-action-menu'(event, instance) {
		const groups = messageBox.actions.get();
		const config = {
			popoverClass: 'message-box',
			columns: [
				{
					groups: Object.keys(groups).map((group) => {
						const items = [];
						groups[group].forEach((item) => {
							items.push({
								icon: item.icon,
								name: t(item.label),
								type: 'messagebox-action',
								id: item.id,
							});
						});
						return {
							title: t(group),
							items,
						};
					}),
				},
			],
			offsetVertical: 10,
			direction: 'top-inverted',
			currentTarget: event.currentTarget.firstElementChild.firstElementChild,
			data: {
				rid: this.rid,
				messageBox: instance.firstNode,
			},
			activeElement: event.currentTarget,
		};

		popover.open(config);
	},
	'click .js-message-actions .js-message-action'(event, instance) {
		const { id } = event.currentTarget.dataset;
		const actions = messageBox.actions.getById(id);
		actions
			.filter(({ action }) => !!action)
			.forEach(({ action }) => {
				action.call(null, {
					rid: this.rid,
					messageBox: instance.firstNode,
					event,
				});
			});
	},
	'click .js-format'(event, instance) {
		event.preventDefault();
		event.stopPropagation();

		const { id } = event.currentTarget.dataset;
		const { pattern } = formattingButtons
			.filter(({ condition }) => !condition || condition())
			.find(({ label }) => label === id) || {};

		if (!pattern) {
			return;
		}

		const input = instance.find('.js-input-message');
		applyFormatting(pattern, input);
	},
});
