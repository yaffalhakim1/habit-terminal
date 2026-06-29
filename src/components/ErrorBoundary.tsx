import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="app" style={{ padding: "2rem", textAlign: "center" }}>
          <div style={{ fontSize: "var(--fs-lg)", color: "var(--red)", marginBottom: "1rem" }}>
            [CRITICAL] app crashed
          </div>
          <pre style={{ fontSize: "var(--fs-2xs)", color: "var(--fg2)", marginBottom: "1rem", whiteSpace: "pre-wrap" }}>
            {this.state.error.message}
          </pre>
          <button
            className="addform-btn"
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
          >
            [enter] reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
