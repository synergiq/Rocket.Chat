import { useState, useEffect, useMemo, useCallback } from 'react';
import moment from 'moment';
import s from 'underscore.string';

import { useUserPreference } from '../../../../../../client/contexts/UserContext';
import { useSetting } from '../../../../../../client/contexts/SettingsContext';

export function useMediaQuery(query) {
	const [matches, setQuery] = useState(window.matchMedia(query).matches);

	useEffect(() => {
		const resizeObserver = new ResizeObserver(() => {
			setQuery(window.matchMedia(query).matches);
		});
		resizeObserver.observe(document.body);

		return () => {
			resizeObserver.unobserve(document.body);
		};
	}, [query]);

	return matches;
}

export function useQuery(params, sort, type, workspace = 'local') {
	return useMemo(() => ({
		query: JSON.stringify({
			type,
			text: params.term,
			workspace,
		}),
		sort: JSON.stringify({ [sort[0]]: sort[1] === 'asc' ? 1 : 0 }),
		...params.itemsPerPage && { count: params.itemsPerPage },
		...params.current && { offset: params.current },
	}), [params, sort, type, workspace]);
}

const dayFormat = ['h:mm A', 'H:mm'];
export function useFormatTime() {
	const clockMode = useUserPreference('clockMode', false);
	const format = useSetting('Message_TimeFormat');
	const sameDay = dayFormat[clockMode - 1] || format;
	return useCallback((time) => {
		switch (clockMode) {
			case 1:
			case 2:
				return moment(time).format(sameDay);
			default:
				return moment(time).format(format);
		}
	}, [clockMode, format]);
}

export function useFormatDateAndTime() {
	const clockMode = useUserPreference('clockMode', false);
	const format = useSetting('Message_TimeAndDateFormat');
	return useCallback((time) => {
		switch (clockMode) {
			case 1:
				return moment(time).format('MMMM D, Y h:mm A');
			case 2:
				return moment(time).format('MMMM D, Y H:mm');
			default:
				return moment(time).format(format);
		}
	}, [clockMode, format]);
}

export function useFormatDate() {
	const format = useSetting('Message_DateFormat');
	return useCallback((time) => moment(time).format(format), [format]);
}

export const useFormatMemorySize = () => useCallback((memorySize) => {
	if (typeof memorySize !== 'number') {
		return null;
	}

	const units = ['bytes', 'kB', 'MB', 'GB'];

	let order;
	for (order = 0; order < units.length - 1; ++order) {
		const upperLimit = Math.pow(1024, order + 1);

		if (memorySize < upperLimit) {
			break;
		}
	}

	const divider = Math.pow(1024, order);
	const decimalDigits = order === 0 ? 0 : 2;
	return `${ s.numberFormat(memorySize / divider, decimalDigits) } ${ units[order] }`;
}, []);
