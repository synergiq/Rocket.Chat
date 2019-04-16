import _ from 'underscore';
import { keyCodes } from '../../../ui-utils/client';

const createShadow = (textarea: HTMLTextAreaElement) => {
	const shadow = document.createElement('div');
	shadow.classList.add('autogrow-shadow');
	document.body.appendChild(shadow);

	const width = textarea.clientWidth;
	const { font, lineHeight } = window.getComputedStyle(textarea);

	shadow.style.position = 'fixed';
	shadow.style.top = '50%';
	shadow.style.right = '0';
	shadow.style.zIndex = '9999999';
	shadow.style.backgroundColor = 'rgba(255, 127, 0, 0.5)';
	// shadow.style.position = 'absolute';
	// shadow.style.top = '-10000px';
	// shadow.style.left = '-10000px';
	shadow.style.width = `${ width }px`;
	shadow.style.font = font;
	shadow.style.lineHeight = lineHeight;
	shadow.style.resize = 'none';
	shadow.style.wordWrap = 'break-word';

	return shadow;
};

const replaceWhitespaces = (whitespaces: string) => `${ '&nbsp;'.repeat(whitespaces.length - 1) } `;

const setupAutogrow = (textarea: HTMLTextAreaElement) => {
	const shadow = createShadow(textarea);
	const $textarea = $(textarea);

	const trigger = _.debounce(() => $textarea.trigger('autogrow', []), 500);

	const width = textarea.clientWidth;
	const height = textarea.clientHeight;

	const minHeight = height;
	const maxHeight = parseInt(window.getComputedStyle(textarea).maxHeight, 10);

	let lastWidth = width;
	let lastHeight = minHeight;
	let textLenght = 0;

	const update = () => {
		const { clientWidth: width, value: text } = textarea;

		const isMaximumHeightReached = lastHeight >= maxHeight;
		const isTextLengthOutdated = textLenght && textLenght < text.length;
		const wasWidthChanged = width !== lastWidth;

		if (isMaximumHeightReached && isTextLengthOutdated && !wasWidthChanged) {
			return true;
		}

		const shadowText = text.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/&/g, '&amp;')
			.replace(/\n$/, '<br/>&nbsp;')
			.replace(/\n/g, '<br/>')
			.replace(/ {2,}/g, replaceWhitespaces);

		if (wasWidthChanged) {
			shadow.style.width = `${ width }px`;
			lastWidth = width;
		}

		shadow.innerHTML = shadowText;

		let height = Math.max(shadow.clientHeight + 1, minHeight) + 1;

		let overflow = 'hidden';

		if (height >= maxHeight) {
			height = maxHeight;
			overflow = '';
		} else {
			textLenght = text.length;
		}

		if (height === lastHeight) {
			return true;
		}

		lastHeight = height;

		$textarea.css({ overflow, height });

		trigger();
	};

	const updateThrottled = _.throttle(update, 300);

	$textarea.on('change input', updateThrottled);
	$textarea.on('focus', update);
	$(window).resize(updateThrottled);
	update();
	textarea.updateAutogrow = update;
};

$.fn.autogrow = function() {
	return this.filter('textarea').each((i, textarea: HTMLTextAreaElement) => setupAutogrow(textarea));
};
