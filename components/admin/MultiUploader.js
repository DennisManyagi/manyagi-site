// components/admin/MultiUploader.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { supabase } from '@/lib/supabase';

function extFromName(name = '') {
  const m = String(name).split('.').pop();
  return (m || '').toLowerCase();
}

function logicalTypeFromExt(ext) {
  if (['jpg','jpeg','png','webp','gif','svg','heic','heif'].includes(ext)) return 'image';
  if (['mp4','mov','m4v','webm'].includes(ext)) return 'video';
  if (['mp3','wav'].includes(ext)) return 'audio';
  if (ext === 'pdf') return 'pdf';
  return 'file';
}

function acceptFor(localType) {
  switch (localType) {
    case 'image': return 'image/*';
    case 'video': return 'video/*';
    case 'audio': return 'audio/*';
    case 'pdf':   return 'application/pdf';
    default:      return '*/*';
  }
}

function MultiUploader({
  division = 'site',
  purpose = 'general',
  fileType = 'image',     // default UI selection
  metadata = {},
  onUploaded,
}) {
  const [busy, setBusy] = useState(false);
  const [dndOver, setDndOver] = useState(false);
  const [localPurpose, setLocalPurpose] = useState(purpose);
  const [localDivision, setLocalDivision] = useState(division);
  const [localType, setLocalType] = useState(fileType);

  // how many files per request to avoid 413s
  const BATCH_SIZE = 2;

  async function fileToPayload(file) {
    const base64Full = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });

    const base64Only = base64Full.includes('base64,')
      ? base64Full.split('base64,').pop()
      : base64Full;

    const ext = extFromName(file?.name || '');
    // Prefer the explicit dropdown selection, otherwise infer from extension
    const inferredType = logicalTypeFromExt(ext);
    const fileTypeToSend = localType || inferredType || 'file';
    const contentTypeToSend = file?.type || (
      ext === 'pdf' ? 'application/pdf' :
      inferredType === 'image' ? 'image/*' :
      inferredType === 'video' ? 'video/*' :
      inferredType === 'audio' ? 'audio/*' : 'application/octet-stream'
    );

    return {
      name: file.name,
      data: base64Only,
      // Hints for the API (it will still sanitize/validate):
      fileType: fileTypeToSend,       // 'image' | 'video' | 'audio' | 'pdf' | 'file'
      contentType: contentTypeToSend, // e.g. 'image/jpeg', 'application/pdf'
    };
  }

  async function uploadBatch({ token, filesChunk }) {
    const encodedFiles = [];
    for (const f of filesChunk) {
      const payloadPiece = await fileToPayload(f);
      encodedFiles.push(payloadPiece);
    }

    const resp = await axios.post(
      '/api/admin/upload-asset-multi',
      {
        files: encodedFiles,
        division: localDivision,
        purpose: localPurpose,
        metadata,
      },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    return resp.data || { ok: false, items: [], errors: [] };
  }

  const uploadFiles = async (files) => {
    if (!files?.length) return;
    setBusy(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || null;

      const allFiles = [...files];
      const batches = [];
      for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
        batches.push(allFiles.slice(i, i + BATCH_SIZE));
      }

      const allItems = [];
      const allErrors = [];

      for (const chunk of batches) {
        try {
          const { ok, items = [], errors = [] } = await uploadBatch({
            token,
            filesChunk: chunk,
          });
          allItems.push(...items);
          allErrors.push(...errors);
        } catch (batchErr) {
          const serverMsg = batchErr?.response?.data?.error || batchErr.message;
          for (const f of chunk) {
            allErrors.push({
              name: f?.name || '(unknown)',
              reason: serverMsg || 'batch failed',
            });
          }
        }
      }

      const successCount = allItems.length;
      const errorCount = allErrors.length;

      if (errorCount === 0) {
        alert(`Upload complete. ${successCount} file(s) uploaded.`);
      } else {
        const errLines = allErrors
          .slice(0, 8)
          .map((e) => `• ${e.name}: ${e.reason}`)
          .join('\n');
        alert(
          `Uploaded ${successCount} file(s), ${errorCount} failed:\n${errLines}${allErrors.length > 8 ? '\n…' : ''}`
        );
      }

      onUploaded?.({ ok: errorCount === 0, items: allItems, errors: allErrors });
    } catch (e) {
      const serverMsg = e?.response?.data?.error || e.message;
      alert(`Upload failed: ${serverMsg}`);
    } finally {
      setBusy(false);
      setDndOver(false);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDndOver(false);
    const files = [...(e.dataTransfer?.files || [])];
    uploadFiles(files);
  }, []);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDndOver(true);
      }}
      onDragLeave={() => setDndOver(false)}
      onDrop={onDrop}
      className={`rounded border-2 border-dashed p-4 ${
        dndOver
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-700'
      }`}
    >
      <div className="flex flex-wrap gap-3 mb-3">
        <select
          value={localDivision}
          onChange={(e) => setLocalDivision(e.target.value)}
          className="dark:bg-gray-900"
        >
          {['site','publishing','designs','capital','tech','media','realty'].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={localPurpose}
          onChange={(e) => setLocalPurpose(e.target.value)}
          className="dark:bg-gray-900"
        >
          <option value="general">general</option>
          <option value="hero">hero</option>
          <option value="carousel">carousel</option>
          <option value="gallery">gallery</option>
          <option value="pdf">pdf</option>
        </select>

        <select
          value={localType}
          onChange={(e) => setLocalType(e.target.value)}
          className="dark:bg-gray-900"
        >
          <option value="image">image</option>
          <option value="video">video</option>
          <option value="audio">audio</option>
          <option value="pdf">pdf</option>
          <option value="file">file</option>
        </select>

        <label className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 cursor-pointer">
          <input
            type="file"
            multiple
            accept={acceptFor(localType)}
            className="hidden"
            onChange={(e) => uploadFiles([...e.target.files])}
          />
          Choose files…
        </label>
      </div>

      <p className="text-sm opacity-80">
        Drag & drop files here (multi-upload supported). They’ll go to{' '}
        <b>{localDivision}</b> / <b>{localPurpose}</b>.
      </p>

      {busy && <p className="mt-2 text-sm">Uploading…</p>}
    </div>
  );
}

export default MultiUploader;
