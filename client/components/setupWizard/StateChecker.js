import { FlowRouter } from 'meteor/kadira:flow-router';
import React, { useEffect, useState } from 'react';

import { hasRole } from '../../../app/authorization';
import { Users } from '../../../app/models';
import { useSetting } from '../../hooks/useSetting';
import { useUserId } from '../../hooks/useUserId';
import { useReactiveValue } from '../../hooks/useReactiveValue';

export function StateChecker({ children }) {
	const setupWizardState = useSetting('Show_Setup_Wizard');
	const userId = useUserId();
	const user = useReactiveValue(() => Users.findOne(userId, { fields: { status: true } }), [userId]);

	const [renderAllowed, allowRender] = useState(false);

	useEffect(() => {
		if (!setupWizardState) {
			return;
		}

		if (userId && (!user || !user.status)) {
			return;
		}

		const isComplete = setupWizardState === 'completed';
		const noUserLoggedInAndIsNotPending = !renderAllowed && !user && setupWizardState !== 'pending';
		const userIsLoggedInButIsNotAdmin = !!user && !hasRole(user._id, 'admin');

		const mustRedirect = isComplete || noUserLoggedInAndIsNotPending || userIsLoggedInButIsNotAdmin;

		if (mustRedirect) {
			FlowRouter.withReplaceState(() => {
				FlowRouter.go('home');
			});
			return;
		}

		allowRender(true);
	}, [setupWizardState, userId, user]);

	if (!renderAllowed) {
		return null;
	}

	return <>{children}</>;
}
