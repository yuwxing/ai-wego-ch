import React from 'react'

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0f172a', color: '#e2e8f0',
          padding: 24, fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <h2 style={{ color: '#f87171', margin: '0 0 8px' }}>页面加载异常</h2>
          <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center', maxWidth: 360, wordBreak: 'break-all' }}>
            {this.state.error?.name}: {this.state.error?.message || '请尝试刷新页面'}
          </p>
          {this.state.error?.stack && (
            <pre style={{ color: '#94a3b8', fontSize: 11, textAlign: 'left', maxWidth: 360, marginTop: 12, padding: 12, background: '#1e293b', borderRadius: 8, overflow: 'auto', lineHeight: 1.5 }}>
              {this.state.error.stack}
            </pre>
          )}
          <button onClick={() => window.location.reload()}
            style={{
              marginTop: 16, padding: '10px 24px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
              cursor: 'pointer', fontSize: 14,
            }}>
            刷新页面
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
