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

  // how many files we send per request to avoid 413s
  const BATCH_SIZE = 2;

  async function fileToPayload(file) {
    const base64Full = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });

    // "data:image/jpeg;base64,AAAA..."
    const base64Only = base64Full.includes('base64,')
      ? base64Full.split('base64,').pop()
      : base64Full;

    return {
      name: file.name,
      data: base64Only,
    };
  }

  async function uploadBatch({ token, filesChunk }) {
    // turn raw File objects -> {name,data} base64 payloads
    const encodedFiles = [];
    for (const f of filesChunk) {
      const payloadPiece = await fileToPayload(f);
      encodedFiles.push(payloadPiece);
    }

    console.log(
      '[MultiUploader] prepared chunk of',
      encodedFiles.length,
      'file(s)'
    );

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
      // 1. get supabase token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || null;
      console.log('[MultiUploader] session token?', token ? 'yes' : 'no');

      // 2. break files into batches
      const allFiles = [...files]; // FileList -> Array<File>
      const batches = [];
      for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
        batches.push(allFiles.slice(i, i + BATCH_SIZE));
      }

      console.log(
        '[MultiUploader] total files:',
        allFiles.length,
        ' ->',
        batches.length,
        'batch(es)'
      );

      // 3. upload each batch sequentially
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

          console.log(
            '[MultiUploader] batch result:',
            items.length,
            'items,',
            errors.length,
            'errors, ok=',
            ok
          );
        } catch (batchErr) {
          // if the entire batch call itself exploded (network / 413 / etc)
          console.error('[MultiUploader] batch upload failed:', batchErr);
          const serverMsg =
            batchErr?.response?.data?.error || batchErr.message;
          // mark every file in this chunk as failed
          for (const f of chunk) {
            allErrors.push({
              name: f?.name || '(unknown)',
              reason: serverMsg || 'batch failed',
            });
          }
        }
      }

      // 4. show a summary alert
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
          `Uploaded ${successCount} file(s), ${errorCount} failed:\n${errLines}${
            allErrors.length > 8 ? '\n…' : ''
          }`
        );
      }

      // 5. let parent know
      onUploaded?.({ ok: errorCount === 0, items: allItems, errors: allErrors });
    } catch (e) {
      const serverMsg = e?.response?.data?.error || e.message;
      console.error('[MultiUploader] upload failed:', e);
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
        {/* Division dropdown */}
        <select
          value={localDivision}
          onChange={(e) => setLocalDivision(e.target.value)}
          className="dark:bg-gray-900"
        >
          {[
            'site',
            'publishing',
            'designs',
            'capital',
            'tech',
            'media',
            'realty',
          ].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Purpose dropdown */}
        <select
          value={localPurpose}
          onChange={(e) => setLocalPurpose(e.target.value)}
          className="dark:bg-gray-900"
        >
          <option value="general">general</option>
          <option value="hero">hero</option>
          <option value="carousel">carousel</option>
          <option value="gallery">gallery</option>
        </select>

        {/* File type dropdown (cosmetic / planning) */}
        <select
          value={localType}
          onChange={(e) => setLocalType(e.target.value)}
          className="dark:bg-gray-900"
        >
          <option value="image">image</option>
          <option value="video">video</option>
          <option value="pdf">pdf</option>
        </select>

        {/* File chooser */}
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
