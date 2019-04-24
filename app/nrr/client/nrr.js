/* eslint new-cap:0 */

import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { HTML } from 'meteor/htmljs';
import { Spacebars } from 'meteor/spacebars';


Blaze.toHTMLWithDataNonReactive = function(content, data) {

	// makeCursorReactive(data);

	if (data instanceof Spacebars.kw && Object.keys(data.hash).length > 0) {
		// Object.entries(data.hash).forEach(([, value]) => makeCursorReactive(value));
		return Blaze.toHTMLWithData(content, data.hash);
	}
	return Blaze.toHTMLWithData(content, data);
};

Blaze.registerHelper('nrrargs', function(...args) {
	return {
		_arguments: args,
	};
});

Blaze.renderNonReactive = function(templateName, data) {
	const { _arguments } = this.parentView.dataVar.get();

	[templateName, data] = _arguments;

	const view = new Blaze.View('nrr', () => HTML.Raw(Blaze.toHTMLWithDataNonReactive(Template[templateName], data)));

	view.onViewReady(() => {
		const { onViewReady } = Template[templateName];
		return onViewReady && onViewReady.call(view, data);
	});

	view._onViewRendered(() => {
		const { onViewRendered } = Template[templateName];
		return onViewRendered && onViewRendered.call(view, data);
	});

	return view;
};

Blaze.registerHelper('nrr', Blaze.Template('nrr', Blaze.renderNonReactive));
