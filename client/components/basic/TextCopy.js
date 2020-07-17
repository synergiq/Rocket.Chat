import { Box, Icon, Button, Scrollable } from '@rocket.chat/fuselage';
import React, { useCallback, useMemo } from 'react';

import { useTranslation } from '../../contexts/TranslationContext';
import { useToastMessageDispatch } from '../../contexts/ToastMessagesContext';

const TextCopy = ({ text, wordBreak = 'break-all', ...props }) => {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();

	const style = useMemo(() => ({ wordBreak }), [wordBreak]);

	const onClick = useCallback(() => {
		try {
			navigator.clipboard.writeText(text);
			dispatchToastMessage({ type: 'success', message: t('Copied') });
		} catch (e) {
			dispatchToastMessage({ type: 'error', message: e });
		}
	}, [dispatchToastMessage, t, text]);

	return <Box
		display='flex'
		flexDirection='row'
		justifyContent='stretch'
		alignItems='flex-start'
		flexGrow={1}
		padding='x16'
		backgroundColor='neutral-100'
		width='full'
		{...props}
	>
		<Scrollable vertical>
			<Box
				fontFamily='mono'
				alignSelf='center'
				fontScale='p1'
				style={style}
				mie='x4'
				flexGrow={1}
				maxHeight='x108'
			>
				{text}
			</Box>
		</Scrollable>
		<Button ghost square small flexShrink={0} onClick={onClick} title={t('Copy')}>
			<Icon name='copy' size='x20' />
		</Button>
	</Box>;
};

export default TextCopy;
