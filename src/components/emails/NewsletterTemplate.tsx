import * as React from 'react';

interface NewsletterTemplateProps {
    content: string;
    unsubscribeUrl?: string;
}

export const NewsletterTemplate: React.FC<NewsletterTemplateProps> = ({
    content,
    unsubscribeUrl = '#',
}) => (
    <div style={{ fontFamily: 'sans-serif', color: '#333', lineHeight: '1.6' }}>
        {/* Header */}
        <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
            <h1 style={{ margin: 0, color: '#111' }}>API Sorter</h1>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>

        {/* Footer with Donation Message */}
        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f0f4f8', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '20px' }}>
                "Thank you for trusting API Sorter. Whether it's $1 or $100, every contribution helps us provide better services."
            </p>

            <a
                href="https://www.apisorter.com/donate"
                style={{
                    display: 'inline-block',
                    backgroundColor: '#e11d48',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '9999px',
                    textDecoration: 'none',
                    fontWeight: 'bold'
                }}
            >
                ❤️ Sponsor Us
            </a>
        </div>

        {/* Unsubscribe */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#888' }}>
            <p>
                You received this email because you subscribed to API Sorter updates.<br />
                <a href={unsubscribeUrl} style={{ color: '#888' }}>Unsubscribe</a>
            </p>
        </div>
    </div>
);

export default NewsletterTemplate;
