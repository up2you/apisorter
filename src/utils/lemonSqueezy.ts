import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

export const lemonSqueezyApiInstance = (apiKey: string) => {
    lemonSqueezySetup({ apiKey, onError: (error) => console.error("Lemon Squeezy Error:", error) });
};
