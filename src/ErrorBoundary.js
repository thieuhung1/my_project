import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React App Error:', error);
    console.error('Stack trace:', errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px 20px', 
          textAlign: 'center', 
          maxWidth: '600px', 
          margin: '0 auto',
          fontFamily: 'system-ui'
        }}>
          <h1 style={{ color: '#FF6B35' }}>😵 Ứng dụng gặp lỗi</h1>
          <p>Có lỗi xảy ra khi load app. Thử reload hoặc kiểm tra Console (F12).</p>
          <details style={{ textAlign: 'left', marginTop: '20px' }}>
            <summary>Xem chi tiết lỗi (click mở)</summary>
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
              {this.state.error && this.state.error.toString()}
            </pre>
          </details>
          <button 
            onClick={this.handleReload}
            style={{
              background: '#FF6B35',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            🔄 Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

