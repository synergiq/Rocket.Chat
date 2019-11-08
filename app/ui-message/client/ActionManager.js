import { Random } from 'meteor/random';

import { APIClient } from '../../utils';
import { modal } from '../../ui-utils/client/lib/modal';

const TRIGGER_TIMEOUT = 5000;
const MODAL_ACTIONS = ['modal', 'modal.open'];

const triggersId = new Set();

const invalidateTriggerId = (id) => triggersId.delete(id);

const generateTriggerId = () => {
	const triggerId = Random.id();
	triggersId.add(triggerId);
	return triggerId;
};

const handlePayloadUserInteraction = (type, data) => {
	if (!triggersId.has(data.triggerId)) {
		return;
	}

	invalidateTriggerId(data.triggerId);

	if (MODAL_ACTIONS.includes(type)) {
		modal.push({
			template: 'ModalBlock',
			data,
		});
	}
};

export const triggerAction = async (payload) => {
	const triggerId = generateTriggerId();

	setTimeout(invalidateTriggerId, TRIGGER_TIMEOUT, triggerId);

	const { type, ...data } = await APIClient.post('apps/blockit/meu_app/outra_action', { ...payload, triggerId });
	return handlePayloadUserInteraction(type, data);
};
