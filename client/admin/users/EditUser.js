import React, { useMemo, useState, useCallback } from 'react';
import { Box, Field, Margins, Button } from '@rocket.chat/fuselage';

import { useTranslation } from '../../contexts/TranslationContext';
import { useEndpointDataExperimental, ENDPOINT_STATES } from '../../hooks/useEndpointDataExperimental';
import { useEndpointAction } from '../../hooks/useEndpointAction';
import { useRoute } from '../../contexts/RouterContext';
import UserAvatarEditor from '../../components/basic/avatar/UserAvatarEditor';
import { useForm } from '../../hooks/useForm';
import UserForm from './UserForm';
import { useUpdateAvatar } from '../../hooks/useUpdateAvatar';
import { FormSkeleton } from './Skeleton';

export function EditUserWithData({ uid, ...props }) {
	const t = useTranslation();
	const { data: roleData, state: roleState, error: roleError } = useEndpointDataExperimental('roles.list', '') || {};
	const { data, state, error } = useEndpointDataExperimental('users.info', useMemo(() => ({ userId: uid }), [uid]));

	if ([state, roleState].includes(ENDPOINT_STATES.LOADING)) {
		return <FormSkeleton/>;
	}

	if (error || roleError) {
		return <Box mbs='x16' {...props}>{t('User_not_found')}</Box>;
	}

	return <EditUser data={data.user} roles={roleData.roles} {...props}/>;
}

const getInitialValue = (data) => ({
	roles: data.roles,
	name: data.name ?? '',
	password: '',
	username: data.username,
	status: data.status,
	bio: data.bio ?? '',
	email: (data.emails && data.emails[0].address) || '',
	verified: (data.emails && data.emails[0].verified) || false,
	setRandomPassword: false,
	requirePasswordChange: data.setRandomPassword || false,
	customFields: data.customFields ?? {},
	statusText: data.statusText ?? '',
});

export function EditUser({ data, roles, ...props }) {
	const t = useTranslation();

	const [avatarObj, setAvatarObj] = useState();

	const { values, handlers, reset, hasUnsavedChanges } = useForm(getInitialValue(data));

	const router = useRoute('admin-users');

	const updateAvatar = useUpdateAvatar(avatarObj, data._id);

	const goToUser = useCallback((id) => router.push({
		context: 'info',
		id,
	}), [router]);

	const saveQuery = useMemo(() => ({
		userId: data._id,
		data: values,
		// TODO: remove JSON.stringify. Is used to keep useEndpointAction from rerendering the page indefinitely.
	}), [data._id, JSON.stringify(values)]);

	const saveAction = useEndpointAction('POST', 'users.update', saveQuery, t('User_updated_successfully'));

	const handleSave = useCallback(async () => {
		const result = await saveAction();
		if (result.success) {
			if (avatarObj) {
				await updateAvatar();
			}
			goToUser(data._id);
		}
	}, [avatarObj, data._id, goToUser, saveAction, updateAvatar]);

	const availableRoles = roles.map(({ _id, description }) => [_id, description || _id]);

	const canSaveOrReset = hasUnsavedChanges || avatarObj;

	const prepend = useMemo(() => <UserAvatarEditor userId={data._id} username={data.username} onChangeAvatarObj={setAvatarObj}/>, [data._id, data.username]);

	const append = useMemo(() => <Field>
		<Field.Row>
			<Box display='flex' flexDirection='row' justifyContent='space-between' w='full'>
				<Margins inlineEnd='x4'>
					<Button flexGrow={1} type='reset' disabled={!canSaveOrReset} onClick={reset}>{t('Reset')}</Button>
					<Button mie='none' flexGrow={1} disabled={!canSaveOrReset} onClick={handleSave}>{t('Save')}</Button>
				</Margins>
			</Box>
		</Field.Row>
	</Field>, [handleSave, canSaveOrReset, reset, t]);

	return <UserForm formValues={values} formHandlers={handlers} availableRoles={availableRoles} prepend={prepend} append={append} {...props}/>;
}
