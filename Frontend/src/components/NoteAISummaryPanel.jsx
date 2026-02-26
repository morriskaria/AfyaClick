/**
 * NoteAISummaryPanel.jsx - AI Note Interpretation UI Component
 *
 * Allows clinicians to:
 * 1. Submit raw notes for AI interpretation
 * 2. View formatted output in 3 versions (structured, clinical, patient-friendly)
 * 3. Edit AI output before approval
 * 4. Approve and save interpretations
 *
 * Features:
 * - Loading states with spinner
 * - Error handling and retry
 * - Multi-version simultaneous editing
 * - Disclaimer prominently displayed
 * - Accessibility labels
 * - Responsive design (Tailwind)
 */

import React, { useState, useCallback } from 'react';
import { AlertCircle, Loader, CheckCircle, Copy, Edit2, Save, X } from 'lucide-react';

const NoteAISummaryPanel = ({ 
  rawNote, 
  noteId, 
  patientId, 
  doctorId,
  onApproved = null,
  disabled = false 
}) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [approved, setApproved] = useState(false);
  
  // Edited summaries (track changes)
  const [editedSummaries, setEditedSummaries] = useState({
    formatted: null,
    clinical: null,
    patient_friendly: null
  });
  
  // Get auth token (assumes stored in localStorage or context)
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token') || '';
  }, []);
  
  /**
   * Main action: Submit note for AI interpretation
   */
  const handleSummarize = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
          'X-User-ID': doctorId,
          'X-User-Role': 'clinician'
        },
        body: JSON.stringify({
          note_id: noteId,
          raw_note_text: rawNote,
          patient_id: patientId,
          doctor_id: doctorId
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || 
          `API error: ${response.status} ${response.statusText}`
        );
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate summary');
      }
      
      setSummary(data.note_interpretation);
      setEditedSummaries({
        formatted: null,
        clinical: null,
        patient_friendly: null
      });
    } catch (err) {
      setError(err.message);
      console.error('AI note summarization error:', err);
    } finally {
      setLoading(false);
    }
  }, [noteId, rawNote, patientId, doctorId, getAuthToken]);
  
  /**
   * Approve and save the interpretation
   */
  const handleApprove = useCallback(async () => {
    if (!summary) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/ai/notes/${summary.id}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`,
            'X-User-ID': doctorId,
            'X-User-Role': 'clinician'
          },
          body: JSON.stringify({
            approved: true,
            edits: editedSummaries.formatted || editedSummaries.clinical || editedSummaries.patient_friendly 
              ? editedSummaries 
              : {}
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to approve: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setApproved(true);
      setEditMode(false);
      
      if (onApproved) {
        onApproved(data.note_interpretation);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [summary, editedSummaries, doctorId, getAuthToken, onApproved]);
  
  /**
   * Copy text to clipboard
   */
  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text);
  }, []);
  
  /**
   * Update edited summary
   */
  const handleEditChange = useCallback((field, newValue) => {
    setEditedSummaries(prev => ({
      ...prev,
      [field]: newValue
    }));
  }, []);
  
  /**
   * Get display value (edited or original)
   */
  const getDisplayValue = useCallback((field) => {
    if (editedSummaries[field] !== null) {
      return editedSummaries[field];
    }
    return summary?.[field] || '';
  }, [summary, editedSummaries]);
  
  // ===== RENDER =====
  
  return (
    <div className="note-ai-panel border-2 border-blue-200 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">✨</span>
          AI Note Summary Tool
        </h3>
        <span className="text-sm text-gray-500">
          {approved ? '✓ Approved' : summary ? 'Ready for review' : 'Pending'}
        </span>
      </div>
      
      {/* Initial State: Show Generate Button */}
      {!summary && !error && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Click below to analyze this note with AI. Generates 3 versions to choose from.
          </p>
          <button
            onClick={handleSummarize}
            disabled={loading || disabled}
            aria-label="Generate AI summary"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="inline animate-spin" size={20} />
                Processing note...
              </span>
            ) : (
              '🚀 Generate AI Summary'
            )}
          </button>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-4">
          <div className="flex gap-3 items-start">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900">Error generating summary</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={handleSummarize}
                className="text-sm font-semibold text-red-600 hover:text-red-700 mt-2 underline"
              >
                Try again
              </button>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
              aria-label="Dismiss error"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
      
      {/* Summary Results */}
      {summary && !approved && (
        <div className="space-y-5">
          {/* Disclaimer Banner */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex gap-3 items-start">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-yellow-900 text-sm">
                  ⚠ AI-Generated Content
                </p>
                <p className="text-sm text-yellow-800 mt-1">
                  This content was generated by AI and must be reviewed and verified by you 
                  before use. You may edit any section before approving.
                </p>
              </div>
            </div>
          </div>
          
          {/* Summary Sections */}
          <div className="grid grid-cols-1 gap-5">
            {/* Formatted Note */}
            <SummarySection
              title="Structured Note"
              description="Clean, well-formatted version"
              icon="📋"
              fieldKey="formatted_note"
              value={getDisplayValue('formatted_note')}
              isEditing={editMode}
              onEdit={(value) => handleEditChange('formatted_note', value)}
              onCopy={() => handleCopy(getDisplayValue('formatted_note'))}
            />
            
            {/* Clinical Summary */}
            <SummarySection
              title="Clinical Summary"
              description="Concise summary for handoff and audit"
              icon="⚕️"
              fieldKey="clinical_summary"
              value={getDisplayValue('clinical_summary')}
              isEditing={editMode}
              onEdit={(value) => handleEditChange('clinical_summary', value)}
              onCopy={() => handleCopy(getDisplayValue('clinical_summary'))}
            />
            
            {/* Patient-Friendly Summary */}
            <SummarySection
              title="Patient-Friendly Summary"
              description="Simplified explanation for patient understanding"
              icon="👤"
              fieldKey="patient_friendly_summary"
              value={getDisplayValue('patient_friendly_summary')}
              isEditing={editMode}
              onEdit={(value) => handleEditChange('patient_friendly_summary', value)}
              onCopy={() => handleCopy(getDisplayValue('patient_friendly_summary'))}
            />
            
            {/* Extracted Entities */}
            {summary.extracted_entities && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3 text-sm">📊 Extracted Information</h4>
                <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-48 border border-gray-200">
                  {JSON.stringify(summary.extracted_entities, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          {/* Edit & Approve Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setEditMode(!editMode)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
            >
              {editMode ? (
                <>
                  <X size={18} /> Cancel Edits
                </>
              ) : (
                <>
                  <Edit2 size={18} /> Edit Summaries
                </>
              )}
            </button>
            
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={18} /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle size={18} /> Approve & Save
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Approved State */}
      {approved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex gap-3 items-start">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={24} />
            <div>
              <h4 className="font-semibold text-green-900">Approved & Saved</h4>
              <p className="text-sm text-green-700 mt-1">
                This note interpretation has been saved to the patient's record.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Helper Component: Summary Section with Edit & Copy
 */
const SummarySection = ({
  title,
  description,
  icon,
  fieldKey,
  value,
  isEditing,
  onEdit,
  onCopy
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          {title}
        </h4>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </div>
      
      {/* Content */}
      <div className="p-4 bg-white">
        {!isEditing ? (
          <>
            <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap text-gray-700 border border-gray-200 mb-3">
              {value}
            </div>
            <button
              onClick={onCopy}
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold flex gap-1 items-center"
            >
              <Copy size={16} /> Copy
            </button>
          </>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onEdit(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
            rows="6"
            placeholder="Edit summary..."
            aria-label={`Edit ${title}`}
          />
        )}
      </div>
    </div>
  );
};

export default NoteAISummaryPanel;
