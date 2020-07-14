import React, { useState, useCallback } from 'react';
import { Box, Button, Icon, TextInput, Margins, Avatar } from '@rocket.chat/fuselage';

import { useTranslation } from '../../../contexts/TranslationContext';
import { useFileInput } from '../../../hooks/useFileInput';
import { useAvatarUrlFromUserId } from '../../../hooks/useAvatarUrlFromUserId';

function UserAvatarSuggestions({ suggestions, onChangeAvatarObj, setNewAvatarSource, disabled, ...props }) {
	const handleClick = useCallback((suggestion) => () => {
		onChangeAvatarObj(suggestion);
		setNewAvatarSource(suggestion.blob);
	}, [onChangeAvatarObj, setNewAvatarSource]);

	return <Margins inline='x4' {...props}>
		{Object.values(suggestions).map((suggestion) => <Button key={suggestion.service} disabled={disabled} square onClick={handleClick(suggestion)}>
			<Avatar title={suggestion.service} size='x36' url={suggestion.blob} mie='x4'/>
		</Button>)}
	</Margins>;
}

export function UserAvatarEditor({ username, onChangeAvatarObj, suggestions, disabled, userId }) {
	const t = useTranslation();
	const [avatarFromUrl, setAvatarFromUrl] = useState('');
	const [newAvatarSource, setNewAvatarSource] = useState();

	const setUploadedPreview = useCallback(async (file, avatarObj) => {
		onChangeAvatarObj(avatarObj);
		setNewAvatarSource(URL.createObjectURL(file));
	}, [onChangeAvatarObj]);

	const clickUpload = useFileInput(setUploadedPreview);

	const clickUrl = () => {
		setNewAvatarSource(avatarFromUrl);
		onChangeAvatarObj({ avatarUrl: avatarFromUrl });
	};
	const clickReset = () => {
		setNewAvatarSource(`/avatar/%40${ username }`);
		onChangeAvatarObj('reset');
	};

	const [, originalAvatarUrl] = useAvatarUrlFromUserId(userId);
	const url = newAvatarSource || originalAvatarUrl;

	const handleAvatarFromUrlChange = (event) => {
		setAvatarFromUrl(event.currentTarget.value);
	};

	return <Box display='flex' flexDirection='column' fontScale='p2'>
		{t('Profile_picture')}
		<Box display='flex' flexDirection='row' mbs='x4'>
			<Avatar size='x120' url={url} style={{ objectFit: 'contain' }} mie='x4'/>
			<Box display='flex' flexDirection='column' flexGrow='1' justifyContent='space-between' mis='x4'>
				<Box display='flex' flexDirection='row' mbs='none'>
					<Margins inline='x4'>
						<Button square mis='none' onClick={clickReset} disabled={disabled}><Avatar size='x36' url={`/avatar/%40${ username }`} mie='x4'/></Button>
						<Button square onClick={clickUpload} disabled={disabled}><Icon name='upload' size='x20'/></Button>
						<Button square mie='none' onClick={clickUrl} disabled={disabled}><Icon name='permalink' size='x20'/></Button>
						{suggestions && <UserAvatarSuggestions suggestions={suggestions} onChangeAvatarObj={onChangeAvatarObj} setNewAvatarSource={setNewAvatarSource} disabled={disabled}/>}
					</Margins>
				</Box>
				<Box>{t('Use_url_for_avatar')}</Box>
				<TextInput flexGrow={0} placeholder={t('Use_url_for_avatar')} value={avatarFromUrl} onChange={handleAvatarFromUrlChange}/>
			</Box>
		</Box>
	</Box>;
}

export default UserAvatarEditor;
