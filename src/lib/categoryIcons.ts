export const CATEGORY_ICONS = [
    {
        icon: '/icons/categories/finance_icon.svg',
        keywords: ['Trading', 'Stock', 'Crypto', 'Finance', 'Payment', 'Bank', 'Accounting', 'Invoice', 'Tax', 'VAT', 'Billing', 'Ledger', 'Payroll', 'Expense', 'Revenue', 'Capital', 'Market', 'Exchange', 'Broker', 'Alpaca', 'Polygon', 'FMP', 'Quandl', 'Interactive Brokers', 'EOD', 'Financial', 'Alpha Vantage']
    },
    {
        icon: '/icons/categories/translation_icon.svg',
        keywords: ['Translation', 'Language', 'Localization', 'i18n', 'TMS', 'Phrase', 'Smartling', 'Localize']
    },
    {
        icon: '/icons/categories/maps_icon.svg',
        keywords: ['Map', 'Location', 'Geocoding', 'Routing', 'Place', 'GIS', 'Address', 'Navigation']
    },
    {
        icon: '/icons/categories/email_icon.svg',
        keywords: ['Email', 'Mail', 'Messaging', 'SMS', 'Chat', 'Communication', 'Notification', 'Push', 'Klaviyo', 'Intercom', 'Customer', 'Support', 'Bot', 'Sendbird', 'PubNub', 'Stream', 'Tawk', 'Vonage']
    },
    {
        icon: '/icons/categories/ai_icon.svg',
        keywords: ['AI', 'Machine Learning', 'ML', 'NLP', 'LLM', 'Generative', 'Vision', 'Speech', 'Translation', 'Chatbot', 'OpenAI', 'Anthropic', 'Cohere', 'Hugging Face', 'DeepL', 'Vertex', 'Gemini', 'GPT', 'Claude', 'Llama', 'Mistral', 'Stability', 'Midjourney', 'DALL-E', 'Whisper', 'Text-to-Speech', 'Speech-to-Text', 'Recognition', 'Detection', 'Classification', 'Segmentation', 'OCR', 'Face', 'Image', 'Video', 'Audio', 'Voice', 'Bot', 'Assistant', 'Copilot', 'Agent', 'RAG', 'Vector', 'Embedding', 'Search', 'Recommend', 'Discovery', 'Insight', 'Personalize', 'Predict', 'Forecast', 'Analyze', 'Optimize', 'Automate', 'Intelligence', 'Cognitive', 'Neural', 'Deep', 'Brain', 'Mind', 'Robot', 'Autonomous', 'Smart', 'Intelligent']
    },
    {
        icon: '/icons/categories/monitoring_icon.svg',
        keywords: ['Monitoring', 'Observability', 'Log', 'Error', 'Trace', 'APM', 'Metrics', 'Datadog', 'New Relic', 'Sentry', 'Rollbar', 'Dynatrace', 'Fullstory', 'LogRocket']
    },
    {
        icon: '/icons/categories/crm_icon.svg',
        keywords: ['CRM', 'ERP', 'Customer', 'Sales', 'Marketing', 'Support', 'Ticket', 'Contact', 'HubSpot', 'Salesforce', 'Zendesk', 'Freshdesk', 'Calendar', 'Schedule', 'Booking', 'Appointment', 'Calendly', 'Cronofy', 'Cal.com', 'Timekit', 'SimplyBook']
    },
    {
        icon: '/icons/categories/shipping_icon.svg',
        keywords: ['Shipping', 'Tracking', 'Carrier', 'Logistics', 'Delivery', 'Freight', 'ShipStation', 'ShipBob', 'Flexport', 'AfterShip']
    }
];

const PROVIDER_LOGOS: Record<string, string> = {
    'OpenAI': 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
    'Anthropic': 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
    'Google': 'https://www.google.com/s2/favicons?domain=google.com&sz=128',
    'Google Cloud': 'https://www.google.com/s2/favicons?domain=cloud.google.com&sz=128',
    'Microsoft': 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=128',
    'Microsoft Azure': 'https://www.google.com/s2/favicons?domain=azure.microsoft.com&sz=128',
    'Cohere': 'https://www.google.com/s2/favicons?domain=cohere.com&sz=128',
    'Stability AI': 'https://www.google.com/s2/favicons?domain=stability.ai&sz=128',
    'Hugging Face': 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
    'AssemblyAI': 'https://www.google.com/s2/favicons?domain=assemblyai.com&sz=128',
    'ElevenLabs': 'https://www.google.com/s2/favicons?domain=elevenlabs.io&sz=128',
    'AWS': 'https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=128',
    'Amazon Web Services': 'https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=128',
    'IBM': 'https://www.google.com/s2/favicons?domain=ibm.com&sz=128',
    'IBM Watson': 'https://www.google.com/s2/favicons?domain=ibm.com&sz=128',
    'Databricks': 'https://www.google.com/s2/favicons?domain=databricks.com&sz=128',
    'Snowflake': 'https://www.google.com/s2/favicons?domain=snowflake.com&sz=128',
    'FactSet': 'https://www.google.com/s2/favicons?domain=factset.com&sz=128',
    'Kaggle': 'https://www.google.com/s2/favicons?domain=kaggle.com&sz=128',
    'Midjourney': 'https://www.google.com/s2/favicons?domain=midjourney.com&sz=128',
    'Jasper': 'https://www.google.com/s2/favicons?domain=jasper.ai&sz=128',
    'Copy.ai': 'https://www.google.com/s2/favicons?domain=copy.ai&sz=128',
    'Runway': 'https://www.google.com/s2/favicons?domain=runwayml.com&sz=128',
    'Synthesia': 'https://www.google.com/s2/favicons?domain=synthesia.io&sz=128',
    'Algolia': 'https://www.google.com/s2/favicons?domain=algolia.com&sz=128',
    'Datadog': 'https://www.google.com/s2/favicons?domain=datadoghq.com&sz=128',
    'New Relic': 'https://www.google.com/s2/favicons?domain=newrelic.com&sz=128',
    'Sentry': 'https://www.google.com/s2/favicons?domain=sentry.io&sz=128',
    'Stripe': 'https://www.google.com/s2/favicons?domain=stripe.com&sz=128',
    'Twilio': 'https://www.google.com/s2/favicons?domain=twilio.com&sz=128',
    'Sendbird': 'https://www.google.com/s2/favicons?domain=sendbird.com&sz=128',
    'FedEx': 'https://www.google.com/s2/favicons?domain=fedex.com&sz=128',
    'DHL': 'https://www.google.com/s2/favicons?domain=dhl.com&sz=128',
    'Elasticsearch': 'https://www.google.com/s2/favicons?domain=elastic.co&sz=128',
    'Radar': 'https://www.google.com/s2/favicons?domain=radar.com&sz=128',
    'Foursquare': 'https://www.google.com/s2/favicons?domain=foursquare.com&sz=128',
    'OpenStreetMap': 'https://www.google.com/s2/favicons?domain=openstreetmap.org&sz=128',
    'Geoapify': 'https://www.google.com/s2/favicons?domain=geoapify.com&sz=128',
    'GraphHopper': 'https://www.google.com/s2/favicons?domain=graphhopper.com&sz=128',
    'ArcGIS': 'https://www.google.com/s2/favicons?domain=esri.com&sz=128',
    'Mailgun': 'https://www.google.com/s2/favicons?domain=mailgun.com&sz=128',
    'Postmark': 'https://www.google.com/s2/favicons?domain=postmarkapp.com&sz=128',
    'Amazon SES': 'https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=128',
    'OneSignal': 'https://www.google.com/s2/favicons?domain=onesignal.com&sz=128',
    'LogRocket': 'https://www.google.com/s2/favicons?domain=logrocket.com&sz=128',
    'USPS': 'https://www.google.com/s2/favicons?domain=usps.com&sz=128',
    'EasyPost': 'https://www.google.com/s2/favicons?domain=easypost.com&sz=128',
    'Vonage': 'https://www.google.com/s2/favicons?domain=vonage.com&sz=128',
    'Fullstory': 'https://www.google.com/s2/favicons?domain=fullstory.com&sz=128',
    'Smartling': 'https://www.google.com/s2/favicons?domain=smartling.com&sz=128',
    'Phrase': 'https://www.google.com/s2/favicons?domain=phrase.com&sz=128',
    'NASDAQ': 'https://www.google.com/s2/favicons?domain=nasdaq.com&sz=128',
    'Financial Modeling Prep': 'https://www.google.com/s2/favicons?domain=financialmodelingprep.com&sz=128',
    'EOD Historical Data': 'https://www.google.com/s2/favicons?domain=eodhd.com&sz=128',
    'Polygon.io': 'https://www.google.com/s2/favicons?domain=polygon.io&sz=128',
    'Alpaca': 'https://www.google.com/s2/favicons?domain=alpaca.markets&sz=128',
    'Apple MapKit': 'https://www.google.com/s2/favicons?domain=developer.apple.com&sz=128',
    'Bing Maps': 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=128',
    'TomTom': 'https://www.google.com/s2/favicons?domain=tomtom.com&sz=128',
    'Stream': 'https://www.google.com/s2/favicons?domain=getstream.io&sz=128',
    'Tawk.to': 'https://www.google.com/s2/favicons?domain=tawk.to&sz=128'
};

export function getCategoryIcon(categoryName: string): string {
    const name = categoryName.toLowerCase();

    for (const mapping of CATEGORY_ICONS) {
        if (mapping.keywords.some(k => name.includes(k.toLowerCase()))) {
            return mapping.icon;
        }
    }

    return '/icons/categories/default_icon.svg';
}

export function getGenericLogo(name: string, category: string) {
    // Check for specific provider overrides first
    for (const [provider, logo] of Object.entries(PROVIDER_LOGOS)) {
        if (name.toLowerCase().includes(provider.toLowerCase())) {
            return logo;
        }
    }

    const textToSearch = (name + ' ' + category).toLowerCase();

    for (const mapping of CATEGORY_ICONS) {
        if (mapping.keywords.some(k => textToSearch.includes(k.toLowerCase()))) {
            return mapping.icon;
        }
    }

    return '/icons/categories/default_icon.svg';
}
