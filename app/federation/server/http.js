import { HTTP as MeteorHTTP } from 'meteor/http';
import { EJSON } from 'meteor/ejson';

import { logger } from './logger';

import { Federation } from '.';

class HTTP {
	requestToPeer(method, peerDomain, uri, body, options = {}) {
		const ignoreErrors = peerDomain === Federation.domain ? false : options.ignoreErrors;

		const { url: baseUrl, publicKey } = Federation.dns.search(peerDomain);

		let peerKey = null;

		// Only encrypt if it is not local
		if (peerDomain !== Federation.domain) {
			peerKey = publicKey;
		}

		let result;

		try {
			result = this.request(method, `${ baseUrl }${ uri }`, body, options.headers || {}, peerKey);
		} catch (err) {
			logger.http.error(`${ ignoreErrors ? '[IGNORED] ' : '' }Error ${ err }`);

			if (!ignoreErrors) {
				throw err;
			} else {
				return { success: false };
			}
		}

		return { success: true, data: result.data };
	}

	request(method, url, body, headers, peerKey = null) {
		let data = null;

		if ((method === 'POST' || method === 'PUT') && body) {
			data = EJSON.toJSONValue(body);

			if (peerKey) {
				data = Federation.crypt.encrypt(data, peerKey);
			}
		}

		logger.http.debug(`[${ method }] ${ url }`);

		return MeteorHTTP.call(method, url, { data, timeout: 2000, headers: { ...headers, 'x-federation-domain': Federation.domain } });
	}
}

export const http = new HTTP();
