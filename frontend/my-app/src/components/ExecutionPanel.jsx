export default function ExecutionPanel({ execution }) {
  if (!execution) return <div style={{ width: 300 }}>No execution</div>;

  // Safe output extraction
  const outputData = execution.output;
  const renderedOutput = 
    typeof outputData === "object" && outputData !== null
      ? outputData.text || JSON.stringify(outputData, null, 2)
      : String(outputData || "");

  return (
    <div style={{ width: 300, borderLeft: "1px solid #ccc", padding: 10 }}>
      <h3>Status: {execution.status}</h3>

      <pre>{renderedOutput}</pre>

      <h4>Logs</h4>
      {execution.logs?.map((l, i) => (
        <div key={i}>
          [{l.nodeId}] {l.message}
        </div>
      ))}
    </div>
  );
}