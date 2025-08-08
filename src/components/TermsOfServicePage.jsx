import React from 'react';
import Card from './ui/Card';

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
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
                Agreement to Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                By accessing and using FileAlchemy ("the Service"), you accept and agree to be bound by the 
                terms and provision of this agreement. If you do not agree to abide by the above, please do 
                not use this service.
              </p>
            </section>

            {/* Service Description */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Service Description
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                FileAlchemy is a free, client-side file conversion service that allows users to convert 
                between various file formats. Key features include:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>Client-side file processing (files never leave your device)</li>
                <li>Support for multiple file formats including images, documents, audio, video, and archives</li>
                <li>No registration required</li>
                <li>Free to use with no limitations</li>
                <li>Progressive Web App (PWA) functionality</li>
              </ul>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Acceptable Use Policy
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                You agree to use FileAlchemy only for lawful purposes. You are prohibited from:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>Using the service for any illegal or unauthorized purpose</li>
                <li>Attempting to reverse engineer, decompile, or hack the service</li>
                <li>Using automated tools to access the service in a way that could damage or overload our systems</li>
                <li>Attempting to gain unauthorized access to any part of the service</li>
                <li>Using the service to process copyrighted material without proper authorization</li>
                <li>Distributing malware or other harmful code through the service</li>
              </ul>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                User Responsibilities
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                As a user of FileAlchemy, you are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>Ensuring you have the right to process and convert any files you use with our service</li>
                <li>Maintaining the security of your device and browser</li>
                <li>Using the service in accordance with these terms</li>
                <li>Respecting intellectual property rights of file content</li>
                <li>Not attempting to circumvent any security measures</li>
              </ul>
            </section>

            {/* Privacy and Data */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Privacy and Data Handling
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                <strong>Your files are processed entirely on your device.</strong> We want to be crystal clear about this:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>Files you convert never leave your browser or device</li>
                <li>We do not store, access, or have any ability to see your files</li>
                <li>All processing happens using client-side JavaScript</li>
                <li>Your conversion history is stored locally on your device only</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
                For more details about data handling, please review our Privacy Policy.
              </p>
            </section>

            {/* Service Availability */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Service Availability
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We strive to maintain high availability of FileAlchemy, but we cannot guarantee uninterrupted 
                service. The service may be temporarily unavailable due to maintenance, updates, or technical 
                issues. We reserve the right to modify, suspend, or discontinue the service at any time without notice.
              </p>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Disclaimers and Limitations
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                Service "As Is"
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                FileAlchemy is provided "as is" without any warranties, express or implied. We do not warrant 
                that the service will be error-free, secure, or available at all times.
              </p>

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                File Quality and Accuracy
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                While we strive to provide high-quality conversions, we cannot guarantee the accuracy, 
                completeness, or quality of converted files. Users should verify converted files meet 
                their requirements before using them for important purposes.
              </p>

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                Browser Compatibility
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                FileAlchemy relies on modern browser features. We support recent versions of major browsers 
                but cannot guarantee compatibility with all browsers or devices.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Limitation of Liability
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                To the maximum extent permitted by law, FileAlchemy and its operators shall not be liable 
                for any indirect, incidental, special, consequential, or punitive damages, including but not 
                limited to loss of profits, data, or other intangible losses, resulting from your use of the service.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Intellectual Property
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                The FileAlchemy service, including its design, code, and documentation, is protected by 
                intellectual property laws. You may not:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>Copy, modify, or distribute our code without permission</li>
                <li>Use our trademarks or branding without authorization</li>
                <li>Create derivative works based on our service</li>
                <li>Remove or alter any copyright notices</li>
              </ul>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Termination
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We reserve the right to terminate or suspend access to our service immediately, without 
                prior notice, for any reason, including breach of these Terms of Service. Upon termination, 
                your right to use the service will cease immediately.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Governing Law
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of 
                the jurisdiction in which FileAlchemy operates, without regard to conflict of law principles.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Changes to Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any material 
                changes by posting the new Terms of Service on this page and updating the "Last updated" date. 
                Your continued use of the service after any changes constitutes acceptance of the new terms.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Contact Information
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Email:</strong> legal@filealchemy.com<br />
                  <strong>Subject:</strong> Terms of Service Inquiry
                </p>
              </div>
            </section>

            {/* Summary Box */}
            <section className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                📋 Terms Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">✅ You can:</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Use FileAlchemy for free</li>
                    <li>• Convert your own files</li>
                    <li>• Use it for personal or commercial purposes</li>
                    <li>• Install it as a PWA</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">❌ You cannot:</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Use it for illegal purposes</li>
                    <li>• Reverse engineer the code</li>
                    <li>• Process copyrighted material without rights</li>
                    <li>• Attempt to hack or damage the service</li>
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

export default TermsOfServicePage;