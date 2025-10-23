// components/admin/MultiUploader.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { supabase } from '@/lib/supabase';

function MultiUploader({
  division = 'site',
  purpose = 'general',
  fileType = 'image',
  metadata = {},
  onUploaded,
}) {
  const [busy, setBusy] = useState(false);
  const [dndOver, setDndOver] = useState(false);
  const [localPurpose, setLocalPurpose] = useState(purpose);
  const [localDivision, setLocalDivision] = useState(division);
  const [localType, setLocalType] = useState(fileType);

  const uploadFiles = async (files) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      for (const file of files) {
        const base64 = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result).split(',')[1] || '');
          r.onerror = reject;
          r.readAsDataURL(file);
        });

        await axios.post(
          '/api/admin/upload-asset',
          {
            file: { data: base64, name: file.name },
            file_type: localType,
            division: localDivision,
            purpose: localPurpose,
            metadata,
          },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
      }

      onUploaded?.();
      alert('Upload complete.');
    } catch (e) {
      alert(`Upload failed: ${e.message}`);
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
          {['site', 'publishing', 'designs', 'capital', 'tech', 'media', 'realty'].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
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
        </select>
        <select
          value={localType}
          onChange={(e) => setLocalType(e.target.value)}
          className="dark:bg-gray-900"
        >
          <option value="image">image</option>
          <option value="video">video</option>
          <option value="pdf">pdf</option>
        </select>
        <label className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 cursor-pointer">
          <input
            type="file"
            multiple
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