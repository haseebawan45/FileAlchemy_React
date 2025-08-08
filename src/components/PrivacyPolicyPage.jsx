import React from 'react';
import Card from './ui/Card';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: February 8, 2025
          </p>
        </div>

        <Card className="p-8 prose prose-gray dark:prose-invert max-w-none">
          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Introduction
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                At FileAlchemy, we take your privacy seriously. This Privacy Policy explains how we collect, 
                use, and protect your information when you use our file conversion service. The most important 
                thing to know is that <strong>all file processing happens locally in your browser</strong> - 
                your files never leave your device.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Information We Collect
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                Files You Process
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                <strong>We do not collect, store, or have access to any files you convert.</strong> All file 
                processing happens entirely within your web browser using client-side JavaScript. Your files 
                remain on your device at all times.
              </p>

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                Usage Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                We may collect anonymous usage statistics to help improve our service, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                <li>Types of conversions performed (e.g., "JPEG to PNG")</li>
                <li>General usage patterns and popular features</li>
                <li>Error rates and performance metrics</li>
                <li>Browser type and version for compatibility</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                This data is aggregated and anonymous - we cannot identify individual users or their specific files.
              </p>

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                Local Storage
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We use your browser's local storage to save your preferences (like theme settings) and 
                conversion history. This information stays on your device and is not transmitted to our servers.
              </p>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                How We Use Information
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                The limited information we collect is used solely to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>Improve the performance and reliability of our service</li>
                <li>Understand which features are most valuable to users</li>
                <li>Identify and fix bugs or compatibility issues</li>
                <li>Make informed decisions about new features and improvements</li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Data Security
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Since your files never leave your device, they are as secure as your own computer. We implement 
                several security measures:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>All processing happens client-side in your browser</li>
                <li>No file data is transmitted over the internet</li>
                <li>Our website uses HTTPS encryption for all communications</li>
                <li>We regularly update our security practices and dependencies</li>
              </ul>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Third-Party Services
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                We may use third-party services for analytics and performance monitoring:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li><strong>Analytics:</strong> Anonymous usage statistics to improve our service</li>
                <li><strong>CDN:</strong> Content delivery networks to serve our application faster</li>
                <li><strong>Error Monitoring:</strong> To identify and fix technical issues</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
                These services only receive anonymous, aggregated data and never have access to your files.
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Cookies and Local Storage
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                We use minimal cookies and local storage for:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>Remembering your theme preference (dark/light mode)</li>
                <li>Storing your conversion history locally</li>
                <li>Maintaining your settings and preferences</li>
                <li>Essential functionality of the web application</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
                You can clear this data at any time through your browser settings or our app's settings page.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Your Rights and Choices
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                You have complete control over your data:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li><strong>File Privacy:</strong> Your files never leave your device</li>
                <li><strong>Local Data:</strong> Clear your conversion history and settings anytime</li>
                <li><strong>Analytics:</strong> Use browser settings to disable analytics if desired</li>
                <li><strong>Cookies:</strong> Disable cookies through your browser (may affect functionality)</li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Children's Privacy
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                FileAlchemy is safe for users of all ages since no personal information is collected. 
                However, we do not knowingly collect any information from children under 13. If you are 
                a parent and believe your child has used our service, please contact us.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Changes to This Policy
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify users of any material 
                changes by posting the new Privacy Policy on this page and updating the "Last updated" date. 
                We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Email:</strong> privacy@filealchemy.com<br />
                  <strong>Subject:</strong> Privacy Policy Inquiry
                </p>
              </div>
            </section>

            {/* Summary */}
            <section className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                🔒 Privacy Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">✅ What we do:</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Process files locally in your browser</li>
                    <li>• Collect anonymous usage statistics</li>
                    <li>• Store preferences locally on your device</li>
                    <li>• Use HTTPS encryption</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">❌ What we don't do:</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Upload or store your files</li>
                    <li>• Collect personal information</li>
                    <li>• Share data with third parties</li>
                    <li>• Track individual users</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;