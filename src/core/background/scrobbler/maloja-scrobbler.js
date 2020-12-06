'use strict';

/**
 * Module for communication with Maloja
 */
define((require) => {
	const Util = require('util/util');
	const BaseScrobbler = require('scrobbler/base-scrobbler');
	const ServiceCallResult = require('object/service-call-result');

	class Maloja extends BaseScrobbler {

		/** @override */
		getStorageName() {
			return 'Maloja';
		}

		/** @override */
		getId() {
			return 'maloja';
		}

		/** @override */
		getLabel() {
			return 'Maloja';
		}

		/** @override */
		getStatusUrl() {
			return null;
		}

		/** @override */
		getUsedDefinedProperties() {
			return ['userApiUrl', 'userToken'];
		}

		/** @override */
		getProfileUrl() {
			return null;
		}

		/** @override */
		async getAuthUrl() {
			return null;
		}

		/** @override */
		async getSession() {
			if (!this.userToken)
				throw ServiceCallResult.ERROR_AUTH;
			return { sessionID: this.userToken };
		}

		/** @override */
		async isReadyForGrantAccess() {
			return false;
		}

		/** @override */
		async sendNowPlaying(song) {
			const { sessionID } = await this.getSession();
			const songData = this.makeTrackMetadata(song);
			return this.sendRequest(songData, sessionID);
		}

		/** @override */
		async scrobble(song) {
			const { sessionID } = await this.getSession();

			const songData = this.makeTrackMetadata(song);
			songData.time = song.metadata.startTimestamp;

			return this.sendRequest(songData, sessionID);
		}

		/**
		 * Private methods
		 * @param params
		 * @param sessionID
		 */
		async sendRequest(params, sessionID) {

			params.key = sessionID;

			const requestInfo = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(params),
			};

			const promise = fetch(this.userApiUrl, requestInfo);
			const timeout = BaseScrobbler.REQUEST_TIMEOUT;

			let response = null;
			try {
				response = await Util.timeoutPromise(timeout, promise);
				await response.json();
			} catch (e) {
				this.debugLog('Error while sending request', 'error');
				return ServiceCallResult.ERROR_OTHER;
			}

			return ServiceCallResult.RESULT_OK;
		}

		makeTrackMetadata(song) {
			const trackMeta = {
				artist: song.getArtist(),
				title: song.getTrack(),
			};

			return trackMeta;
		}
	}

	return Maloja;
});
