import React, { useMemo } from 'react';
import { Field, TextInput, Box, ToggleSwitch, Icon, TextAreaInput, FieldGroup, Margins } from '@rocket.chat/fuselage';

import { useTranslation } from '../../contexts/TranslationContext';
import { useAbsoluteUrl } from '../../contexts/ServerContext';
import { useHilightCode } from '../../hooks/useHilightCode';
import { useExampleData } from './exampleIncomingData';
import Page from '../../components/basic/Page';

export default function IncomingWebhookForm({ formValues, formHandlers, extraData = {}, append, ...props }) {
	const t = useTranslation();

	const hilightCode = useHilightCode();

	const absoluteUrl = useAbsoluteUrl();

	const {
		enabled,
		channel,
		username,
		name,
		alias,
		avatarUrl,
		emoji,
		scriptEnabled,
		script,
	} = formValues;

	const {
		handleEnabled,
		handleChannel,
		handleUsername,
		handleName,
		handleAlias,
		handleAvatarUrl,
		handleEmoji,
		handleScriptEnabled,
		handleScript,
	} = formHandlers;

	const url = absoluteUrl(`hooks/${ extraData._id }/${ extraData.token }`);

	const [exampleData, curlData] = useExampleData({
		aditionalFields: {
			...alias && { alias },
			...emoji && { emoji },
			...avatarUrl && { avatar: avatarUrl },
		},
		url,
	}, [alias, emoji, avatarUrl]);

	const hilightedExampleJson = hilightCode('json', JSON.stringify(exampleData, null, 2));

	return <Page.ScrollableContent pb='x24' mi='neg-x24' is='form' qa-admin-user-edit='form' { ...props }>
		<Margins block='x16'>
			<FieldGroup width='x600' alignSelf='center'>
				{useMemo(() => <Field>
					<Field.Label display='flex' justifyContent='space-between' w='full'>
						{t('Enabled')}
						<ToggleSwitch checked={enabled} onChange={handleEnabled} />
					</Field.Label>
				</Field>, [enabled, handleEnabled])}
				{useMemo(() => <Field>
					<Field.Label>{t('Name_optional')}</Field.Label>
					<Field.Row>
						<TextInput flexGrow={1} value={name} onChange={handleName}/>
					</Field.Row>
					<Field.Hint>{t('You_should_name_it_to_easily_manage_your_integrations')}</Field.Hint>
				</Field>, [name, handleName])}
				{useMemo(() => <Field>
					<Field.Label>{t('Post_to_Channel')}</Field.Label>
					<Field.Row>
						<TextInput flexGrow={1} value={channel} onChange={handleChannel} addon={<Icon name='at' size='x20'/>}/>
					</Field.Row>
					<Field.Hint>{t('Messages_that_are_sent_to_the_Incoming_WebHook_will_be_posted_here')}</Field.Hint>
					<Field.Hint dangerouslySetInnerHTML={{ __html: t('Start_with_s_for_user_or_s_for_channel_Eg_s_or_s', '@', '#', '@john', '#general') }} />
				</Field>, [channel, handleChannel])}
				{useMemo(() => <Field>
					<Field.Label>{t('Post_as')}</Field.Label>
					<Field.Row>
						<TextInput flexGrow={1} value={username} onChange={handleUsername} addon={<Icon name='user' size='x20'/>}/>
					</Field.Row>
					<Field.Hint>{t('Choose_the_username_that_this_integration_will_post_as')}</Field.Hint>
					<Field.Hint>{t('Should_exists_a_user_with_this_username')}</Field.Hint>
				</Field>, [username, handleUsername])}
				{useMemo(() => <Field>
					<Field.Label>{`${ t('Alias') } (${ t('optional') })`}</Field.Label>
					<Field.Row>
						<TextInput flexGrow={1} value={alias} onChange={handleAlias} addon={<Icon name='edit' size='x20'/>}/>
					</Field.Row>
					<Field.Hint>{t('Choose_the_alias_that_will_appear_before_the_username_in_messages')}</Field.Hint>
				</Field>, [alias, handleAlias])}
				{useMemo(() => <Field>
					<Field.Label>{`${ t('Avatar_URL') } (${ t('optional') })`}</Field.Label>
					<Field.Row>
						<TextInput flexGrow={1} value={avatarUrl} onChange={handleAvatarUrl} addon={<Icon name='user-rounded' size='x20' alignSelf='center'/>}/>
					</Field.Row>
					<Field.Hint>{t('You_can_change_a_different_avatar_too')}</Field.Hint>
					<Field.Hint>{t('Should_be_a_URL_of_an_image')}</Field.Hint>
				</Field>, [avatarUrl, handleAvatarUrl])}
				{useMemo(() => <Field>
					<Field.Label>{`${ t('Emoji') } (${ t('optional') })`}</Field.Label>
					<Field.Row>
						<TextInput flexGrow={1} value={emoji} onChange={handleEmoji} addon={<Icon name='emoji' size='x20' alignSelf='center'/>}/>
					</Field.Row>
					<Field.Hint>{t('You_can_use_an_emoji_as_avatar')}</Field.Hint>
					<Field.Hint dangerouslySetInnerHTML={{ __html: t('Example_s', ':ghost:') }} />
				</Field>, [emoji, handleEmoji])}
				{useMemo(() => <Field>
					<Field.Label display='flex' justifyContent='space-between' w='full'>
						{t('Script_Enabled')}
						<ToggleSwitch checked={scriptEnabled} onChange={handleScriptEnabled} />
					</Field.Label>
				</Field>, [scriptEnabled, handleScriptEnabled])}
				{useMemo(() => <Field>
					<Field.Label>{t('Script')}</Field.Label>
					<Field.Row>
						<TextAreaInput rows={10} flexGrow={1} value={script} onChange={handleScript} addon={<Icon name='code' size='x20' alignSelf='center'/>}/>
					</Field.Row>
				</Field>, [script, handleScript])}
				{useMemo(() => !extraData._id && <><Field>
					<Field.Label>{t('Webhook_URL')}</Field.Label>
					<Field.Row>
						<TextInput flexGrow={1} value={t('Will_be_available_here_after_saving')} addon={<Icon name='permalink' size='x20'/>} disabled/>
					</Field.Row>
					<Field.Hint>{t('Send_your_JSON_payloads_to_this_URL')}</Field.Hint>
				</Field>
				<Field>
					<Field.Label>{t('Token')}</Field.Label>
					<Field.Row>
						<TextInput flexGrow={1} value={t('Will_be_available_here_after_saving')} addon={<Icon name='key' size='x20'/>} disabled/>
					</Field.Row>
				</Field></>, [extraData._id])}
				{useMemo(() => extraData._id && <><Field>
					<Field.Label>{t('Webhook_URL')}</Field.Label>
					<Field.Row>
						<TextInput flexGrow={1} value={url} addon={<Icon name='permalink' size='x20'/>}/>
					</Field.Row>
					<Field.Hint>{t('Send_your_JSON_payloads_to_this_URL')}</Field.Hint>
				</Field>
				<Field>
					<Field.Label>{t('Token')}</Field.Label>
					<Field.Row>
						<TextInput flexGrow={1} value={`${ extraData._id }/${ extraData.token }`} addon={<Icon name='key' size='x20'/>}/>
					</Field.Row>
				</Field></>, [url, extraData._id, extraData.token])}
				{useMemo(() => <Field>
					<Field.Label>{t('Example_payload')}</Field.Label>
					<Field.Row>
						<Box fontScale='p1' withRichContent flexGrow={1}>
							<pre><code dangerouslySetInnerHTML={{ __html: hilightedExampleJson }}></code></pre>
						</Box>
					</Field.Row>
				</Field>, [hilightedExampleJson])}
				{useMemo(() => extraData._id && <Field>
					<Field.Label>{t('Curl')}</Field.Label>
					<Field.Row>
						<TextInput flexGrow={1} value={curlData} addon={<Icon name='code' size='x20'/>}/>
					</Field.Row>
				</Field>, [curlData])}
				{ append }
			</FieldGroup>
		</Margins>
	</Page.ScrollableContent>;
}
