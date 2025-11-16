// components/TechQuoteForm.js
import { useState } from 'react';

export default function TechQuoteForm({ className = '' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [projectType, setProjectType] = useState('Web / Landing Page');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const subject = `Tech Project Request from ${name || 'New Lead'}`;
    const bodyLines = [
      `Name: ${name}`,
      `Email: ${email}`,
      company && `Company / Brand: ${company}`,
      `Project Type: ${projectType}`,
      budget && `Rough Budget: ${budget}`,
      timeline && `Timeline: ${timeline}`,
      '',
      'Project Details:',
      details || '(no details provided yet)',
    ]
      .filter(Boolean)
      .join('\n');

    const mailto = `mailto:tech@manyagi.net?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyLines)}`;

    window.location.href = mailto;
  };

  return (
    <div
      className={`rounded-3xl bg-white/95 dark:bg-gray-950/95 border border-gray-200/70 dark:border-gray-800 shadow-sm p-6 md:p-8 ${className}`}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Name</label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">
            Company / Brand (optional)
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Manyagi Capital, Daito, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">
              Project Type
            </label>
            <select
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
            >
              <option>Web / Landing Page</option>
              <option>Full Web App</option>
              <option>iOS / Android App</option>
              <option>Community / Marketplace Platform</option>
              <option>Automation / Internal Tool</option>
              <option>Other (explain below)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Rough Budget
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="$2k–$5k, $10k+, not sure, etc."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Ideal Timeline
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              placeholder="4 weeks, this quarter, ASAP, etc."
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">
            Project Details
          </label>
          <textarea
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm h-32"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Tell us what you want to build, who it’s for, and any links or inspiration."
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Generate Email Brief
          </button>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Submitting opens your email app with everything prefilled so you can
            review and send.
          </p>
        </div>
      </form>
    </div>
  );
}
