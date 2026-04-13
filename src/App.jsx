import { memo, useCallback, useEffect, useMemo, useState } from 'react';

const hookRows = [
  {
    hook: 'useEffect',
    purpose: 'Side Effects: Syncing with external systems',
    returns: 'Nothing (void)',
    runs: 'After render',
  },
  {
    hook: 'useMemo',
    purpose: 'Memoized Value: Avoiding expensive re-calculations',
    returns: 'The result of the function',
    runs: 'During render',
  },
  {
    hook: 'useCallback',
    purpose: 'Memoized Function: Maintaining referential equality',
    returns: 'The function itself',
    runs: 'During render',
  },
];

function App() {
  const [query, setQuery] = useState('');
  const [threshold, setThreshold] = useState(50);
  const [logs, setLogs] = useState([]);

  /**
   * useMemo => "value cache"
   * We intentionally simulate expensive work (sorting + multiple transforms)
   * to demonstrate why memoization can protect render performance.
   */
  const filteredResults = useMemo(() => {
    const source = Array.from({ length: 500 }, (_, index) => ({
      id: index,
      title: `Hook pattern ${index + 1}`,
      score: (index * 17) % 100,
    }));

    return source
      .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
      .filter((item) => item.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }, [query, threshold]);

  /**
   * useCallback => "function cache"
   * This keeps the function reference stable so memoized children
   * (React.memo) won't re-render unless dependencies truly changed.
   */
  const handleLog = useCallback(
    (entry) => {
      setLogs((prev) => [
        `${new Date().toLocaleTimeString()} - ${entry}`,
        ...prev,
      ].slice(0, 10));
    },
    []
  );

  /**
   * useEffect => "synchronizer"
   * Side effect runs after paint to mirror component state into
   * external systems (document title is outside React's virtual DOM).
   */
  useEffect(() => {
    document.title = `Results: ${filteredResults.length}`;

    // Cleanup runs before next effect cycle or on unmount.
    return () => {
      document.title = 'Advanced React Hooks Demo';
    };
  }, [filteredResults.length]);

  return (
    <main className="container">
      <h1>Advanced Hooks: useEffect vs useMemo vs useCallback</h1>
      <p>
        The difference is what they store and when they run: useEffect syncs with
        external systems after render, useMemo caches computed values during render,
        and useCallback caches function identity during render.
      </p>

      <section className="card">
        <h2>Quick Comparison</h2>
        <table>
          <thead>
            <tr>
              <th>Hook</th>
              <th>Purpose</th>
              <th>Returns</th>
              <th>When it Runs</th>
            </tr>
          </thead>
          <tbody>
            {hookRows.map((row) => (
              <tr key={row.hook}>
                <td>{row.hook}</td>
                <td>{row.purpose}</td>
                <td>{row.returns}</td>
                <td>{row.runs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card grid">
        <div>
          <h2>Live useMemo Example (Value Cache)</h2>
          <label>
            Search title
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try: pattern 1"
            />
          </label>

          <label>
            Minimum score: {threshold}
            <input
              type="range"
              min="0"
              max="99"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            />
          </label>

          <p>
            Results recalculated only when <code>query</code> or <code>threshold</code> change.
          </p>
          <ResultList items={filteredResults} onInspect={handleLog} />
        </div>

        <div>
          <h2>Live useEffect + useCallback Notes</h2>
          <ul>
            <li>
              <strong>useEffect:</strong> updates <code>document.title</code> after render and cleans up on rerun/unmount.
            </li>
            <li>
              <strong>useCallback:</strong> keeps <code>handleLog</code> stable so child component memoization remains effective.
            </li>
            <li>
              <strong>Pro Tip:</strong> do not overuse useMemo/useCallback for trivial logic; profile first.
            </li>
          </ul>
          <h3>Recent callback logs</h3>
          <ol>
            {logs.map((log) => (
              <li key={log}>{log}</li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}

const ResultList = memo(function ResultList({ items, onInspect }) {
  return (
    <div className="results">
      {items.map((item) => (
        <button key={item.id} onClick={() => onInspect(`Inspected ${item.title}`)}>
          {item.title} — score {item.score}
        </button>
      ))}
    </div>
  );
});

export default App;
