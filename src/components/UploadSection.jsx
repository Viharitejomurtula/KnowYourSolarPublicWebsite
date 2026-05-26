import { useReducer, useRef, useCallback } from 'react'
import { useReveal } from '../hooks/useReveal.js'
import { validatePdf, fmtSize } from '../utils/fileValidation.js'

const UPLOAD_URL = 'https://knowyoursolarapp.onrender.com/api/upload'

const initial = {
  files: [],
  uploading: false,
  progress: 0,
  error: null,
  success: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return { ...state, files: action.files, error: null }
    case 'REMOVE':
      return { ...state, files: state.files.filter((_, i) => i !== action.index) }
    case 'ERROR':
      return { ...state, error: action.error, uploading: false, progress: 0 }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'UPLOADING':
      return { ...state, uploading: true, error: null, progress: 10 }
    case 'PROGRESS':
      return { ...state, progress: action.progress }
    case 'SUCCESS':
      return { ...state, uploading: false, success: true }
    case 'RESET':
      return initial
    default:
      return state
  }
}

export default function UploadSection({ auth }) {
  const { user, signInWithGoogle, getToken } = auth
  const [state, dispatch] = useReducer(reducer, initial)
  const dropzoneRef = useRef(null)
  const fileInputRef = useRef(null)
  const headerRef = useReveal()
  const widgetRef = useReveal()

  const handleFiles = useCallback(async (rawFiles) => {
    const incoming = Array.from(rawFiles).filter(
      (f) => !state.files.some((x) => x.name === f.name),
    )
    if (!incoming.length) return

    const valid = []
    const errors = []
    for (const f of incoming) {
      const result = await validatePdf(f)
      if (result.ok) valid.push(f)
      else errors.push(result.error)
    }

    if (valid.length) {
      dispatch({ type: 'ADD', files: [...state.files, ...valid] })
    }
    if (errors.length) {
      dispatch({ type: 'ERROR', error: errors.join(' ') })
    }
  }, [state.files])

  function onDragOver(e) {
    e.preventDefault()
    dropzoneRef.current?.classList.add('drag-over')
  }
  function onDragLeave() {
    dropzoneRef.current?.classList.remove('drag-over')
  }
  function onDrop(e) {
    e.preventDefault()
    dropzoneRef.current?.classList.remove('drag-over')
    handleFiles(e.dataTransfer.files)
  }

  async function handleUpload() {
    if (!state.files.length || !user) return

    const token = await getToken()
    if (!token) {
      dispatch({ type: 'ERROR', error: 'Your session has expired. Please sign in again.' })
      return
    }

    dispatch({ type: 'UPLOADING' })

    const formData = new FormData()
    state.files.forEach((f) => formData.append('files', f))

    try {
      dispatch({ type: 'PROGRESS', progress: 55 })
      const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      dispatch({ type: 'PROGRESS', progress: 100 })

      if (res.ok) {
        setTimeout(() => dispatch({ type: 'SUCCESS' }), 400)
      } else {
        dispatch({
          type: 'ERROR',
          error: `Submission failed (${res.status}). Please email documents directly to vihari5tejo@gmail.com`,
        })
      }
    } catch {
      dispatch({
        type: 'ERROR',
        error: 'Network error. Please email documents directly to vihari5tejo@gmail.com',
      })
    }
  }

  return (
    <section className="upload-section" id="upload">
      <div ref={headerRef} className="upload-header reveal">
        <div className="section-tag">Begin</div>
        <h2 className="section-title">
          Upload your <em>utility bills</em>
        </h2>
        <p className="section-body">
          12 months of utility bills is ideal. Even 3 months gives us enough to
          build a solid baseline. Your report arrives within 24 hours.
        </p>
      </div>

      <div ref={widgetRef} className="upload-widget reveal">
        <h3>Submit Your Documents</h3>
        <p className="hint">PDF only — up to 10 MB per file. Handled with strict confidentiality.</p>

        {!user ? (
          <LockedState onSignIn={signInWithGoogle} />
        ) : state.success ? (
          <SuccessState onReset={() => dispatch({ type: 'RESET' })} />
        ) : (
          <UploadForm
            state={state}
            dropzoneRef={dropzoneRef}
            fileInputRef={fileInputRef}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onFiles={handleFiles}
            onRemove={(i) => dispatch({ type: 'REMOVE', index: i })}
            onUpload={handleUpload}
          />
        )}
      </div>
    </section>
  )
}

function LockedState({ onSignIn }) {
  return (
    <div className="upload-locked">
      <div className="lock-icon">
        <svg viewBox="0 0 24 24" strokeWidth="1.5">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      </div>
      <p>Sign in to upload your documents and receive your feasibility report.</p>
      <button className="google-btn" onClick={onSignIn}>
        <GoogleIcon />
        Continue with Google
      </button>
    </div>
  )
}

function SuccessState({ onReset }) {
  return (
    <div className="upload-success visible">
      <div className="success-check">
        <svg viewBox="0 0 24 24">
          <polyline points="5,12 10,17 19,8" />
        </svg>
      </div>
      <h4>Upload Successful</h4>
      <p>
        Your documents have been received. Your feasibility report will be
        delivered to your email within 24 hours.
      </p>
      <button className="success-again" onClick={onReset}>
        Upload More Documents
      </button>
    </div>
  )
}

function UploadForm({ state, dropzoneRef, fileInputRef, onDragOver, onDragLeave, onDrop, onFiles, onRemove, onUpload }) {
  const { files, uploading, progress, error } = state

  return (
    <div>
      <div
        ref={dropzoneRef}
        className="dropzone"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,application/pdf"
          style={{ display: 'none' }}
          onChange={(e) => onFiles(e.target.files)}
        />
        <div className="dropzone-icon">
          <svg viewBox="0 0 24 24" strokeWidth="1.5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>
        <p className="dz-main">Drag PDF documents here or click to browse</p>
        <p className="dz-sub">PDF only</p>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          {files.map((f, i) => (
            <div key={f.name} className="file-row">
              <span className="file-ext">PDF</span>
              <span className="file-name">{f.name}</span>
              <span className="file-size">{fmtSize(f.size)}</span>
              <button
                className="file-remove"
                onClick={() => onRemove(i)}
                aria-label={`Remove ${f.name}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="progress-wrap" style={{ display: 'block' }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      <button
        className="upload-btn"
        onClick={onUpload}
        disabled={files.length === 0 || uploading}
      >
        {uploading ? 'Submitting…' : 'Submit Documents'}
      </button>

      {error && (
        <div className="status-msg error">{error}</div>
      )}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}
