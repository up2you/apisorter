import { useState } from 'react';
import Head from 'next/head';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Mail, Send, Users, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export default function AdminCommunicationsPage() {
    const [formData, setFormData] = useState({
        targetGroup: 'TEST',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm(`Are you sure you want to send this to group: ${formData.targetGroup}?`)) return;

        setStatus('SENDING');
        setResult(null);
        setErrorMsg('');

        try {
            const res = await fetch('/api/admin/communications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('SUCCESS');
                setResult(data.stats);
                setFormData({ ...formData, subject: '', message: '' }); // Reset text but keep group
            } else {
                setStatus('ERROR');
                setErrorMsg(data.message || 'Failed to send broadcast');
            }
        } catch (error) {
            setStatus('ERROR');
            setErrorMsg('Network error occurred');
        }
    };

    return (
        <AdminLayout>
            <Head>
                <title>Broadcast Communications - Admin</title>
            </Head>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Mail className="text-primary" size={28} />
                    Broadcast Communications
                </h1>
                <p className="text-gray-400 mt-2">Send mass email notifications to your users or subscribers.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Compose Form */}
                <div className="lg:col-span-2">
                    <div className="bg-surface border border-white/10 rounded-xl p-6 shadow-xl">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Target Group */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Target Audience</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { id: 'TEST', label: 'Test (Send to Me)', icon: CheckCircle, desc: 'Safety check before real send' },
                                        { id: 'ALL_USERS', label: 'All Registered Users', icon: Users, desc: 'Verified accounts only' },
                                        { id: 'SUBSCRIBERS', label: 'Newsletter Subscribers', icon: Mail, desc: 'Email-only subscribers' },
                                        { id: 'ADMINS', label: 'Admins Only', icon: AlertTriangle, desc: 'Internal announcements' },
                                    ].map((option) => (
                                        <div
                                            key={option.id}
                                            onClick={() => setFormData({ ...formData, targetGroup: option.id })}
                                            className={`cursor-pointer p-4 rounded-lg border flex items-start gap-3 transition-colors ${formData.targetGroup === option.id
                                                ? 'bg-primary/10 border-primary text-white'
                                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className={`mt-0.5 ${formData.targetGroup === option.id ? 'text-primary' : 'text-gray-500'}`}>
                                                <option.icon size={18} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">{option.label}</div>
                                                <div className="text-xs opacity-70 mt-1">{option.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Subject Line</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Important update regarding your account"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none"
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Message Body</label>
                                <div className="text-xs text-gray-500 mb-2">Supports basic text. Use line breaks for new paragraphs.</div>
                                <textarea
                                    required
                                    rows={8}
                                    placeholder="Write your message here..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none font-sans"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            {/* Submit */}
                            <div className="pt-4 border-t border-white/10 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={status === 'SENDING' || !formData.subject || !formData.message}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all ${status === 'SENDING'
                                        ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-primary hover:from-blue-500 hover:to-primary-light shadow-lg hover:shadow-primary/25'
                                        }`}
                                >
                                    {status === 'SENDING' ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                    {status === 'SENDING' ? 'Sending Broadcast...' : 'Send Broadcast'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Status Sidebar */}
                <div className="space-y-6">
                    {/* Status Card */}
                    {status !== 'IDLE' && (
                        <div className={`p-6 rounded-xl border ${status === 'SUCCESS' ? 'bg-green-500/10 border-green-500/20' :
                            status === 'ERROR' ? 'bg-red-500/10 border-red-500/20' :
                                'bg-blue-500/10 border-blue-500/20'
                            }`}>
                            <h3 className={`font-bold text-lg mb-2 flex items-center gap-2 ${status === 'SUCCESS' ? 'text-green-400' :
                                status === 'ERROR' ? 'text-red-400' :
                                    'text-blue-400'
                                }`}>
                                {status === 'SUCCESS' && <CheckCircle size={20} />}
                                {status === 'ERROR' && <AlertTriangle size={20} />}
                                {status === 'SENDING' && <Loader2 className="animate-spin" size={20} />}
                                {status === 'SUCCESS' && 'Broadcast Complete'}
                                {status === 'ERROR' && 'Broadcast Failed'}
                                {status === 'SENDING' && 'Processing...'}
                            </h3>

                            {status === 'SUCCESS' && result && (
                                <div className="space-y-2 mt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Total Recipients:</span>
                                        <span className="text-white font-mono">{result.total}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Successfully Sent:</span>
                                        <span className="text-green-400 font-mono">{result.sent}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Failed:</span>
                                        <span className="text-red-400 font-mono">{result.failed}</span>
                                    </div>
                                    <div className="bg-black/20 p-3 rounded mt-4 text-xs text-gray-400">
                                        Emails have been handed off to the Resend API queue. Use "Test" mode first to verify formatting.
                                    </div>
                                </div>
                            )}

                            {status === 'ERROR' && (
                                <p className="text-red-300 text-sm mt-2">{errorMsg}</p>
                            )}
                        </div>
                    )}

                    {/* Tips Card */}
                    <div className="bg-surface border border-white/10 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            Tips & Best Practices
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-400 list-disc list-inside">
                            <li>Always send a <strong>Test Broadcast</strong> to yourself first.</li>
                            <li>Keep subject lines clear and concise.</li>
                            <li>Avoid using too many exclamation marks!!! to prevent spam filtering.</li>
                            <li>Recipients will see the sender as <code>API Sorter &lt;updates@apisorter.com&gt;</code>.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
