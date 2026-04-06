'use client';

import { useState, FormEvent, useRef } from 'react';
import { attachmentsService, CreateAttachmentPayload } from '@/services/attachments';

interface AttachmentUploadPanelProps {
  transactionId: string;
  institutionId: string;
  currentAssignmentId?: string | null;
  currentUnitId?: string | null;
  onSuccess: () => void;
}

export function AttachmentUploadPanel({
  transactionId,
  institutionId,
  currentAssignmentId,
  currentUnitId,
  onSuccess,
}: AttachmentUploadPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentCategory, setAttachmentCategory] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedAssignment, setUploadedAssignment] = useState(currentAssignmentId || '');
  const [uploadedUnit, setUploadedUnit] = useState(currentUnitId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setSuccess(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const payload: CreateAttachmentPayload = {
        institution: institutionId,
        transaction: transactionId,
        file: selectedFile,
        attachment_category: attachmentCategory || undefined,
        description: description || undefined,
        uploaded_assignment: uploadedAssignment || undefined,
        uploaded_unit: uploadedUnit || undefined,
      };

      await attachmentsService.createAttachment(payload);
      setSuccess(true);
      setSelectedFile(null);
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onSuccess();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const apiError = err as { status?: number };
      if (apiError.status === 403) {
        setError('You do not have permission to upload attachments.');
      } else if (apiError.status === 413) {
        setError('File is too large.');
      } else {
        setError('Failed to upload attachment. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-4 text-sm font-medium text-slate-900">Upload Attachment</h3>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
          Attachment uploaded successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">File</label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
            required
          />
          {selectedFile && (
            <p className="mt-1 text-xs text-slate-500">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Attachment Category ID (Optional)</label>
          <input
            type="text"
            value={attachmentCategory}
            onChange={(e) => setAttachmentCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Category ID..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Uploaded Assignment (Optional)</label>
            <input
              type="text"
              value={uploadedAssignment}
              onChange={(e) => setUploadedAssignment(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Assignment ID..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Uploaded Unit (Optional)</label>
            <input
              type="text"
              value={uploadedUnit}
              onChange={(e) => setUploadedUnit(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Unit ID..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Describe the attachment..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !selectedFile}
          className="w-full rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Uploading...' : 'Upload Attachment'}
        </button>
      </form>
    </div>
  );
}
