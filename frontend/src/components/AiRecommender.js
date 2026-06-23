/**
 * AiRecommender Component
 * -----------------------
 * Lets the user type a free-text request (e.g. "cheap fade in Tel Aviv") and
 * get an AI-powered barbershop recommendation. The frontend calls the backend
 * endpoint POST /api/ai/recommend — it never talks to the AI provider directly,
 * so the API key stays hidden on the server.
 *
 * Empty/invalid input handling (assignment requirement):
 *   - If the box is empty (or only spaces), we show a clear inline message
 *     instead of silently doing nothing, so the behaviour is demonstrable.
 *   - The backend ALSO validates and returns 400 for empty input, so the
 *     protection exists on both ends.
 */

import { useState } from 'react';
import apiClient from '../services/apiClient';

export default function AiRecommender() {
  const [request, setRequest] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    const trimmed = request.trim();

    // Empty / whitespace-only input: show a visible message (do NOT silently return).
    if (!trimmed) {
      setRecommendation('');
      setError('Please type what you are looking for first (e.g. "cheap fade in Tel Aviv").');
      return;
    }

    // Too short to be a meaningful request (e.g. "." or "ab").
    if (trimmed.length < 3) {
      setRecommendation('');
      setError('Please enter at least 3 characters describing what you want.');
      return;
    }

    setLoading(true);
    setError('');
    setRecommendation('');

    try {
      const res = await apiClient.post('/ai/recommend', { request: trimmed });
      setRecommendation(res.data.recommendation);
    } catch (err) {
      setError(err.message || 'Could not get a recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">AI Barbershop Finder</h2>
      <p className="text-sm text-gray-500 mb-3">
        Describe what you want and our AI will recommend the best shop for you.
      </p>

      {/* Input + button */}
      <div className="flex gap-2">
        <input
          type="text"
          value={request}
          onChange={(e) => {
            setRequest(e.target.value);
            if (error) setError(''); // clear the empty-input message once they type
          }}
          onKeyDown={handleKeyDown}
          placeholder='e.g. "cheap fade in Tel Aviv with great reviews"'
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? 'Thinking…' : 'Recommend'}
        </button>
      </div>

      {/* Error / empty-input message */}
      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* Recommendation result */}
      {recommendation && (
        <div className="mt-3 bg-gray-50 border border-gray-200 rounded p-3 text-sm text-gray-700">
          <span className="font-semibold text-gray-800">Recommendation: </span>
          {recommendation}
        </div>
      )}
    </div>
  );
}