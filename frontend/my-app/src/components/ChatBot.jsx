import { useState } from "react";
import { Download, RefreshCw, Copy, Check } from "lucide-react";

export default function MessageResponse() {
  // Parsing the raw AI response text to cleanly separate normal text from the code block
  const rawText = `Here is a simple, standard Java program. It’s a classic **"Hello, World!"** example that also demonstrates variables, methods, and basic object-oriented programming.`;
  
  const rawCode = `// Define a public class named "HelloWorld" (must match the file name: HelloWorld.java)
public class HelloWorld {
    // The main method is the entry point of any Java application
    public static void main(String[] args) {
        // Print a message to the console
        System.out.println("Hello, World!");

        // Variables and basic math
        int num1 = 10;
        int num2 = 20;
        int sum = addNumbers(num1, num2);

        // Print the result using string concatenation
        System.out.println("The sum of " + num1 + " and " + num2 + " is: " + sum);
    }

    // A helper method that adds two integers and returns the result
    public static int addNumbers(int a, int b) {
        return a + b;
    }
}`;

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([rawCode], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "HelloWorld.java";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleFreshCode = () => {
    alert("Triggering fresh code generation...");
  };

  return (
    <div className="flex flex-col gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-2xl font-sans">
      {/* Clean Text Section */}
      <p className="text-slate-700 text-sm leading-relaxed font-medium">
        {rawText}
      </p>

      {/* Code Container with Download & Copy Options */}
      <div className="relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-lg">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/50 text-xs text-slate-400">
          <span className="font-mono font-semibold text-slate-300">HelloWorld.java</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition-all cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-all shadow-sm cursor-pointer"
            >
              <Download size={14} />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Code Display Area */}
        <pre className="p-4 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
          <code>{rawCode}</code>
        </pre>
      </div>

      {/* Fresh Code & Actions Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Clean Output Component</span>
        <button
          onClick={handleFreshCode}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
        >
          <RefreshCw size={14} />
          <span>Fresh Code</span>
        </button>
      </div>
    </div>
  );
}