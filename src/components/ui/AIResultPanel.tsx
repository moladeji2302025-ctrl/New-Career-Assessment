import ReactMarkdown from 'react-markdown';
import type { SubmissionResult } from '../../types/assessment';

interface AIResultPanelProps {
  result: SubmissionResult;
  onReset: () => void;
}

export default function AIResultPanel({ result, onReset }: AIResultPanelProps) {
  return (
    <div className="ai-result">
      <div className="ai-result__header">
        <div className="ai-result__check" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="ai-result__title">Your Career Report is Ready</h2>
        <p className="ai-result__subtitle">Here's what we found — tailored just for you.</p>
      </div>

      <div className="ai-result__report">
        <ReactMarkdown
          components={{
            h2: ({ children }) => <h2>{children}</h2>,
            h3: ({ children }) => <h3>{children}</h3>,
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
            ),
          }}
        >
          {result.aiReport}
        </ReactMarkdown>
      </div>

      <div className="ai-result__actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => window.print()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Save as PDF
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={onReset}
        >
          Start a new assessment
        </button>
      </div>
    </div>
  );
}
