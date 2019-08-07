import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';

import './tooltip.html';
import './tooltip.css';

export const tooltip = {
	source: null,
	initiated: false,
	opened: false,

	init() {
		if (this.initiated) {
			return;
		}
		this.initiated = true;

		Blaze.render(Template.tooltip, document.body);
	},

	showElement(element, source) {
		if (this.opened) {
			return;
		}

		if (this.timeout) {
			clearTimeout(this.timeout);
		}

		this.timeout = setTimeout(() => {
			this.timeout = null;
			this.source = source;

			$('.tooltip .content').empty().append($(element).clone().show());

			this.setPosition().addClass('show');

			this.opened = true;
		}, 300);
	},

	hide() {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}

		if (this.opened) {
			$('.tooltip').removeClass('show');
			$('.tooltip .content').empty();
			this.opened = false;
		}
	},

	setPosition() {
		const sourcePos = $(this.source).offset();

		const sourceWidth = $(this.source).outerWidth();

		const tip = $('.tooltip');

		let top = sourcePos.top - tip.outerHeight() - 5;
		let { left } = sourcePos;

		left = left + (sourceWidth / 2) - (tip.outerWidth() / 2);

		if (left < 0) {
			$('.tooltip .tooltip-arrow').css({
				'margin-left': `${ left - 5 }px`,
			});
			left = 0;
		} else {
			$('.tooltip .tooltip-arrow').css({
				'margin-left': '',
			});
		}

		if (top < 0) {
			top = sourcePos.top + $(this.source).outerHeight() + 5;
			tip.addClass('below');
		} else {
			tip.removeClass('below');
		}

		return tip
			.css({
				top: `${ top }px`,
				left: `${ left }px`,
			});
	},
};
