import { Component } from 'react';

/**
 * Last-resort guard: a render error in one panel should not leave the user
 * staring at a blank page with no way back.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="app-fallback" role="alert">
          <h1>Something went wrong</h1>
          <p>The converter hit an unexpected error. Reloading usually fixes it.</p>
          <button className="swap-btn" onClick={() => window.location.reload()}>
            Reload the page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
