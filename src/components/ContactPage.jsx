import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsSubmitting(false);
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="text-6xl mb-6">✅</div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Message Sent Successfully!
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                            Thank you for contacting us. We'll get back to you within 24 hours.
                        </p>
                        <Button onClick={() => setSubmitted(false)}>
                            Send Another Message
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Contact Us
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Have a question, suggestion, or need help? We'd love to hear from you.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <Card className="p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                            Send us a message
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Your full name"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Subject *
                                </label>
                                <select
                                    id="subject"
                                    name="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Select a subject</option>
                                    <option value="general">General Inquiry</option>
                                    <option value="support">Technical Support</option>
                                    <option value="feature">Feature Request</option>
                                    <option value="bug">Bug Report</option>
                                    <option value="business">Business Inquiry</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={6}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                                    placeholder="Tell us how we can help you..."
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </Button>
                        </form>
                    </Card>

                    {/* Contact Information */}
                    <div className="space-y-8">
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                📧 Email Support
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                                For general inquiries and support
                            </p>
                            <a href="mailto:support@filealchemy.com" className="text-primary-500 hover:text-primary-600">
                                support@filealchemy.com
                            </a>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                🐛 Bug Reports
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                                Found a bug? Help us improve FileAlchemy
                            </p>
                            <a href="mailto:bugs@filealchemy.com" className="text-primary-500 hover:text-primary-600">
                                bugs@filealchemy.com
                            </a>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                💡 Feature Requests
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                                Have an idea for a new feature?
                            </p>
                            <a href="mailto:features@filealchemy.com" className="text-primary-500 hover:text-primary-600">
                                features@filealchemy.com
                            </a>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                ⏱️ Response Time
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                We typically respond within 24 hours during business days.
                                For urgent issues, please mark your subject as "URGENT".
                            </p>
                        </Card>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
                        Frequently Asked Questions
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                Is FileAlchemy free to use?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Yes! FileAlchemy is completely free to use. All conversions happen in your browser,
                                so there are no server costs or limitations.
                            </p>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                Are my files secure?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Absolutely. All file processing happens locally in your browser.
                                Your files never leave your device or get uploaded to any server.
                            </p>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                What file size limits are there?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                File size limits depend on your device's memory. Most modern devices
                                can handle files up to several hundred MB without issues.
                            </p>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                Can I use FileAlchemy offline?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Yes! FileAlchemy works as a Progressive Web App (PWA) and can be
                                installed on your device for offline use.
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;