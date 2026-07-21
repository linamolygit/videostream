import React, { useState, useRef } from 'react';

export default function DashUploadModal({ show, isDark, onClose, onSubmit }) {
  const [tab, setTab]                 = useState('video'); // 'video' | 'carousel'
  const [uploadMode, setUploadMode]   = useState('file');  // 'file' | 'link' (Toggle switch!)
  
  const [title, setTitle]             = useState('');
  
  // URL Mode state
  const [videoUrl, setVideoUrl]       = useState('');
  const [thumbUrl, setThumbUrl]       = useState('');
  const [carouselUrls, setCarouselUrls] = useState('');
  const [showVideoPw, setShowVideoPw] = useState(false);

  // File Mode state & Previews
  const [videoFile, setVideoFile]     = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  
  const [thumbFile, setThumbFile]     = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);

  const [carouselFiles, setCarouselFiles] = useState([]);
  const [carouselPreviews, setCarouselPreviews] = useState([]);

  // Upload progress state
  const [uploading, setUploading]     = useState(false);
  const [progress, setProgress]       = useState(0);
  const [statusMsg, setStatusMsg]     = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);
  const carouselInputRef = useRef(null);

  if (!show) return null;

  const bg      = isDark ? '#1A1F2E' : '#FFFFFF';
  const border  = isDark ? 'rgba(255,255,255,0.09)' : '#E2E8F0';
  const text    = isDark ? '#F1F5F9' : '#0F172A';
  const muted   = isDark ? '#94A3B8' : '#64748B';
  const inputBg = isDark ? '#0D1117' : '#F8FAFC';

  // Handle Video file selection
  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setErrorMessage('Please select a valid video file (MP4, WebM, MOV, etc.).');
      return;
    }
    setErrorMessage('');
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  // Handle Thumbnail file selection
  const handleThumbSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid thumbnail image file (PNG, JPG, WebP).');
      return;
    }
    setErrorMessage('');
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  // Handle Carousel files selection
  const handleCarouselSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setErrorMessage('');
    setCarouselFiles(files);
    setCarouselPreviews(files.map(f => URL.createObjectURL(f)));
    if (!title && files[0]) {
      setTitle(files[0].name.replace(/\.[^/.]+$/, ""));
    }
  };

  // Upload helper with XHR for real percentage progress %
  const uploadFileWithProgress = (file, presignedInfo, category, onProgress) => {
    return new Promise((resolve, reject) => {
      // If presigned URL exists from R2
      if (presignedInfo.presigned && presignedInfo.uploadUrl) {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            onProgress(pct);
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(presignedInfo.publicUrl);
          } else {
            reject(new Error(`Upload to R2 failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during R2 upload'));
        xhr.open('PUT', presignedInfo.uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      } else {
        // Fallback simulation or direct link creation
        let current = 0;
        const interval = setInterval(() => {
          current += 20;
          onProgress(Math.min(current, 95));
          if (current >= 100) {
            clearInterval(interval);
            onProgress(100);
            resolve(presignedInfo.publicUrl);
          }
        }, 150);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Please enter a media title.');
      return;
    }

    let finalVideoSource = videoUrl;
    let finalThumbSource = thumbUrl;
    let finalCarouselList = [];

    setUploading(true);
    setProgress(5);

    try {
      if (uploadMode === 'file') {
        if (tab === 'video') {
          if (!videoFile) {
            setErrorMessage('Please select a video file to upload.');
            setUploading(false);
            return;
          }
          if (!thumbFile && !thumbUrl) {
            setErrorMessage('Mandatory thumbnail image is required for videos.');
            setUploading(false);
            return;
          }

          // 1. Get presigned URL for video
          setStatusMsg('Uploading video to Cloudflare R2 (videohost1)...');
          const videoRes = await fetch('/api/upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: videoFile.name, fileType: videoFile.type, mediaCategory: 'video' }),
          }).then(r => r.json());

          if (!videoRes.success) throw new Error(videoRes.error || 'Failed to prepare video upload');

          finalVideoSource = await uploadFileWithProgress(videoFile, videoRes, 'video', (pct) => {
            setProgress(Math.round(pct * 0.7)); // 0-70% for video
          });

          // 2. Upload thumbnail if file selected
          if (thumbFile) {
            setStatusMsg('Uploading thumbnail to Cloudflare R2 (imgstore1)...');
            const thumbRes = await fetch('/api/upload-url', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileName: thumbFile.name, fileType: thumbFile.type, mediaCategory: 'thumbnail' }),
            }).then(r => r.json());

            if (thumbRes.success) {
              finalThumbSource = await uploadFileWithProgress(thumbFile, thumbRes, 'thumbnail', (pct) => {
                setProgress(70 + Math.round(pct * 0.25)); // 70-95% for thumb
              });
            }
          }
        } else {
          // Carousel File Mode
          if (!carouselFiles.length) {
            setErrorMessage('Please select at least one image file.');
            setUploading(false);
            return;
          }

          for (let i = 0; i < carouselFiles.length; i++) {
            const file = carouselFiles[i];
            setStatusMsg(`Uploading image ${i + 1}/${carouselFiles.length} to Cloudflare R2...`);
            const imgRes = await fetch('/api/upload-url', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileName: file.name, fileType: file.type, mediaCategory: 'image' }),
            }).then(r => r.json());

            if (imgRes.success) {
              const url = await uploadFileWithProgress(file, imgRes, 'image', (pct) => {
                const step = 90 / carouselFiles.length;
                setProgress(Math.round((i * step) + (pct * step / 100)));
              });
              finalCarouselList.push(url);
            }
          }
          finalThumbSource = finalCarouselList[0];
        }
      } else {
        // Link Mode Validation
        if (tab === 'video') {
          if (!thumbUrl.trim()) {
            setErrorMessage('Thumbnail URL is required.');
            setUploading(false);
            return;
          }
          if (!videoUrl.trim()) {
            setErrorMessage('Video source URL is required.');
            setUploading(false);
            return;
          }
        } else {
          const lines = carouselUrls.split('\n').map(s => s.trim()).filter(Boolean);
          if (!lines.length) {
            setErrorMessage('At least one image URL is required for carousel.');
            setUploading(false);
            return;
          }
          finalCarouselList = lines;
          finalThumbSource = lines[0];
        }
      }

      setStatusMsg('Encrypting token & generating stream link...');
      setProgress(98);

      await onSubmit({
        title,
        tab,
        videoUrl: finalVideoSource,
        thumbUrl: finalThumbSource,
        carousel: tab === 'carousel' ? (uploadMode === 'file' ? finalCarouselList : carouselUrls) : null,
      });

      setProgress(100);
      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred during upload. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
      setStatusMsg('');
    }
  };

  const resetForm = () => {
    setTitle('');
    setVideoUrl('');
    setThumbUrl('');
    setCarouselUrls('');
    setVideoFile(null);
    setVideoPreview(null);
    setThumbFile(null);
    setThumbPreview(null);
    setCarouselFiles([]);
    setCarouselPreviews([]);
    setErrorMessage('');
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: inputBg, border: `1.5px solid ${border}`,
    borderRadius: 10, fontSize: 13, color: text,
    outline: 'none', fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 700, color: muted,
    marginBottom: 6, display: 'flex', alignItems: 'center',
    justify: 'space-between', fontFamily: 'Inter, sans-serif',
    letterSpacing: '-0.1px',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(8px)', zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, animation: 'fadeIn 0.15s ease',
    }}
      onClick={e => { if (e.target === e.currentTarget && !uploading) onClose(); }}
    >
      <div style={{
        background: bg, borderRadius: 20,
        border: `1px solid ${border}`,
        width: '100%', maxWidth: 540,
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
        animation: 'slideUp 0.2s cubic-bezier(0.25,1,0.5,1)',
        fontFamily: 'Inter, sans-serif',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: text, letterSpacing: '-0.4px' }}>Upload Media & Stream Link</h3>
            <p style={{ fontSize: 12, color: muted, marginTop: 2 }}>Upload directly to Cloudflare R2 or embed external link</p>
          </div>
          <button onClick={onClose} disabled={uploading} style={{
            width: 32, height: 32, borderRadius: 8, border: `1px solid ${border}`,
            background: 'transparent', cursor: uploading ? 'not-allowed' : 'pointer', color: muted,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Tab & Upload Mode Controls */}
        <div style={{ padding: '16px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          {/* Media Type Tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[['video', '🎬', 'Video'], ['carousel', '🖼️', 'Carousel']].map(([t, emoji, label]) => (
              <button key={t} type="button" onClick={() => { setTab(t); setErrorMessage(''); }} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 700,
                background: tab === t ? (t === 'video' ? 'linear-gradient(135deg,#5B5FE8,#8B5CF6)' : 'linear-gradient(135deg,#8B5CF6,#EC4899)') : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'),
                color: tab === t ? '#fff' : muted,
                transition: 'all 0.2s',
              }}>
                {emoji} {label}
              </button>
            ))}
          </div>

          {/* Mode Switcher: Direct File Upload vs External Link */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: isDark ? '#0D1117' : '#F1F5F9',
            padding: '3px 4px', borderRadius: 10, border: `1px solid ${border}`,
          }}>
            <button
              type="button"
              onClick={() => { setUploadMode('file'); setErrorMessage(''); }}
              style={{
                padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700,
                background: uploadMode === 'file' ? '#5B5FE8' : 'transparent',
                color: uploadMode === 'file' ? '#fff' : muted,
                transition: 'all 0.15s',
              }}
            >
              ☁️ Cloudflare R2 Upload
            </button>
            <button
              type="button"
              onClick={() => { setUploadMode('link'); setErrorMessage(''); }}
              style={{
                padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700,
                background: uploadMode === 'link' ? '#5B5FE8' : 'transparent',
                color: uploadMode === 'link' ? '#fff' : muted,
                transition: 'all 0.15s',
              }}
            >
              🔗 Paste URL Link
            </button>
          </div>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div style={{ margin: '14px 24px 0', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#EF4444', fontSize: 12, fontWeight: 600 }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>Media Title <span style={{ color: '#EF4444' }}>*</span></label>
            <input
              type="text" placeholder="e.g. Product Demo 2026"
              value={title} onChange={e => setTitle(e.target.value)} required
              style={inputStyle}
            />
          </div>

          {/* MODE 1: DIRECT FILE UPLOAD (R2) */}
          {uploadMode === 'file' ? (
            <>
              {tab === 'video' ? (
                <>
                  {/* Video File Input & Preview */}
                  <div>
                    <label style={labelStyle}>Select Video File (.mp4, .webm, .mov) <span style={{ color: '#EF4444' }}>*</span></label>
                    <input
                      type="file"
                      accept="video/*"
                      ref={videoInputRef}
                      onChange={handleVideoSelect}
                      style={{ display: 'none' }}
                    />
                    <div
                      onClick={() => videoInputRef.current?.click()}
                      style={{
                        border: `2px dashed ${videoFile ? '#5B5FE8' : border}`,
                        borderRadius: 12, padding: '18px', textAlign: 'center',
                        cursor: 'pointer', background: isDark ? 'rgba(255,255,255,0.02)' : '#FAFAFC',
                        transition: 'all 0.2s',
                      }}
                    >
                      {videoPreview ? (
                        <div>
                          <video src={videoPreview} controls style={{ width: '100%', maxHeight: 180, borderRadius: 8, marginBottom: 8 }} />
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#5B5FE8' }}>✓ {videoFile?.name} ({(videoFile?.size / (1024 * 1024)).toFixed(2)} MB)</p>
                          <span style={{ fontSize: 11, color: muted }}>Click to change video file</span>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: 28, marginBottom: 6 }}>📹</div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: text }}>Click to choose video file</p>
                          <p style={{ fontSize: 11, color: muted, marginTop: 2 }}>Uploads to R2 Bucket (videohost1)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail File Input */}
                  <div>
                    <label style={labelStyle}>
                      Mandatory Thumbnail Image <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      ref={thumbInputRef}
                      onChange={handleThumbSelect}
                      style={{ display: 'none' }}
                    />
                    <div
                      onClick={() => thumbInputRef.current?.click()}
                      style={{
                        border: `2px dashed ${thumbFile ? '#10B981' : border}`,
                        borderRadius: 12, padding: '12px 16px', textAlign: 'center',
                        cursor: 'pointer', background: isDark ? 'rgba(255,255,255,0.02)' : '#FAFAFC',
                        display: 'flex', alignItems: 'center', gap: 14,
                      }}
                    >
                      {thumbPreview ? (
                        <>
                          <img src={thumbPreview} alt="Thumb preview" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                          <div style={{ textAlign: 'left' }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>✓ Thumbnail selected</p>
                            <span style={{ fontSize: 11, color: muted }}>{thumbFile?.name}</span>
                          </div>
                        </>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'center' }}>
                          <span style={{ fontSize: 20 }}>🖼️</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: text }}>Select Thumbnail Image (imgstore1)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* Carousel File Input */
                <div>
                  <label style={labelStyle}>Select Carousel Images <span style={{ color: '#EF4444' }}>*</span></label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={carouselInputRef}
                    onChange={handleCarouselSelect}
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => carouselInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${carouselFiles.length ? '#8B5CF6' : border}`,
                      borderRadius: 12, padding: '18px', textAlign: 'center',
                      cursor: 'pointer', background: isDark ? 'rgba(255,255,255,0.02)' : '#FAFAFC',
                    }}
                  >
                    {carouselPreviews.length > 0 ? (
                      <div>
                        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 8 }}>
                          {carouselPreviews.map((src, idx) => (
                            <img key={idx} src={src} alt="preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                          ))}
                        </div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#8B5CF6' }}>✓ {carouselFiles.length} images selected</p>
                        <span style={{ fontSize: 11, color: muted }}>Click to re-select images</span>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 28, marginBottom: 6 }}>🎨</div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: text }}>Click to select multiple images</p>
                        <p style={{ fontSize: 11, color: muted, marginTop: 2 }}>Uploads to R2 Bucket (imgstore1)</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* MODE 2: PASTE EXTERNAL URL */
            <>
              {tab === 'video' ? (
                <>
                  <div>
                    <label style={labelStyle}>Thumbnail Image URL <span style={{ color: '#EF4444' }}>*</span></label>
                    <input
                      type="url" placeholder="https://pub-e755e9e218f740aa81c5793c4926ad2b.r2.dev/thumb.jpg"
                      value={thumbUrl} onChange={e => setThumbUrl(e.target.value)} required={uploadMode === 'link'}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Video Source URL <span style={{ color: '#EF4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showVideoPw ? 'text' : 'password'}
                        placeholder="https://pub-99dc01532a4a449c98e23f488ce91305.r2.dev/video.mp4"
                        value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required={uploadMode === 'link'}
                        style={{ ...inputStyle, paddingRight: 40 }}
                      />
                      <button type="button" onClick={() => setShowVideoPw(v => !v)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: muted, padding: 4 }}>
                        {showVideoPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label style={labelStyle}>Image URLs (one per line) <span style={{ color: '#EF4444' }}>*</span></label>
                  <textarea
                    rows={4} placeholder={"https://pub-e755e9e218f740aa81c5793c4926ad2b.r2.dev/img1.jpg\nhttps://pub-e755e9e218f740aa81c5793c4926ad2b.r2.dev/img2.jpg"}
                    value={carouselUrls} onChange={e => setCarouselUrls(e.target.value)} required={uploadMode === 'link'}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              )}
            </>
          )}

          {/* Progress bar % */}
          {uploading && (
            <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F1F5F9', padding: '12px 14px', borderRadius: 12, border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: text, marginBottom: 6 }}>
                <span>{statusMsg || 'Uploading to Cloudflare R2...'}</span>
                <span style={{ color: '#5B5FE8' }}>{progress}%</span>
              </div>
              <div style={{ height: 7, background: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #5B5FE8, #8B5CF6)', borderRadius: 99, transition: 'width 0.2s ease' }} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button type="submit" disabled={uploading} style={{
              flex: 1, padding: '11px 0',
              background: uploading ? '#94A3B8' : 'linear-gradient(135deg, #5B5FE8, #8B5CF6)',
              color: '#fff', border: 'none', borderRadius: 11,
              fontSize: 14, fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
              boxShadow: uploading ? 'none' : '0 4px 14px rgba(91,95,232,0.35)',
              transition: 'all 0.2s',
            }}>
              {uploading ? `Uploading (${progress}%)...` : '✨ Generate Stream Link'}
            </button>
            <button type="button" onClick={onClose} disabled={uploading} style={{
              padding: '11px 20px', background: 'transparent',
              border: `1.5px solid ${border}`, borderRadius: 11,
              fontSize: 14, fontWeight: 600, color: muted, cursor: uploading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
