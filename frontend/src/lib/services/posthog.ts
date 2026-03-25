import posthog from 'posthog-js';
import { browser } from '$app/environment';

let initialized = false;

export function initPostHog() {
	if (!browser || initialized) return;

	const apiKey = import.meta.env.VITE_POSTHOG_KEY;
	if (!apiKey) return;

	posthog.init(apiKey, {
		api_host: 'https://us.i.posthog.com',
		person_profiles: 'always',
		capture_pageview: false,
		capture_pageleave: true
	});

	initialized = true;
}

export function capturePageview(url: string) {
	if (!browser || !initialized) return;
	posthog.capture('$pageview', { $current_url: url });
}
