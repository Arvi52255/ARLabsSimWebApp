import Editor from "./canvas/Editor";

function App() {
  const testBackend = async () => {
    try {
      const response = await fetch("http://localhost:5000/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: "Hello from frontend",
          component: "resistor"
        })
      });

      const data = await response.json();
      console.log("Backend response:", data);
      alert(data.message);
    } catch (error) {
      console.error("Error connecting to backend:", error);
      alert("Failed to connect to backend");
    }
  };

  return (
    <div>
      <button onClick={testBackend}>Test Backend</button>
      <Editor />
    </div>
  );
}

export default App;