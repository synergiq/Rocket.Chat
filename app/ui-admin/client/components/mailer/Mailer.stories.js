import React from 'react';

import { Mailer } from './Mailer';

export default {
	title: 'admin/pages/mailer',
	component: Mailer,
	// decorators: [
	// 	(storyFn) => <SettingsState>
	// 		{storyFn()}
	// 	</SettingsState>,
	// ],
};

export const _default = () =>
	<Mailer />;
