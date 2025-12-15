/** @jsx createElement */
import { createElement, renderToDOM, VNode } from "./jsx-runtime";

// ============================================
// Performance Benchmarking Suite
// ============================================

export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  opsPerSecond: number;
}

export class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];

  // Benchmark createElement performance
  benchmarkCreateElement(iterations: number = 10000): BenchmarkResult {
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      createElement(
        "div",
        { className: "test", id: `item-${i}` },
        createElement("span", null, "Child 1"),
        createElement("span", null, "Child 2")
      );
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    const opsPerSecond = 1000 / averageTime;

    const result: BenchmarkResult = {
      name: "createElement",
      iterations,
      totalTime,
      averageTime,
      opsPerSecond,
    };

    this.results.push(result);
    return result;
  }

  // Benchmark renderToDOM performance
  benchmarkRenderToDOM(iterations: number = 1000): BenchmarkResult {
    const vnodes: VNode[] = [];

    // Pre-create vnodes
    for (let i = 0; i < iterations; i++) {
      vnodes.push(
        createElement(
          "div",
          { className: "test" },
          createElement("span", null, `Item ${i}`)
        )
      );
    }

    const startTime = performance.now();

    for (const vnode of vnodes) {
      renderToDOM(vnode);
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    const opsPerSecond = 1000 / averageTime;

    const result: BenchmarkResult = {
      name: "renderToDOM",
      iterations,
      totalTime,
      averageTime,
      opsPerSecond,
    };

    this.results.push(result);
    return result;
  }

  // Benchmark large tree creation
  benchmarkLargeTree(depth: number = 5, breadth: number = 5): BenchmarkResult {
    const createTree = (currentDepth: number): VNode => {
      if (currentDepth === 0) {
        return createElement("span", null, "Leaf");
      }

      const children: VNode[] = [];
      for (let i = 0; i < breadth; i++) {
        children.push(createTree(currentDepth - 1));
      }

      return createElement("div", { className: `level-${currentDepth}` }, ...children);
    };

    const iterations = 100;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      createTree(depth);
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    const opsPerSecond = 1000 / averageTime;

    const result: BenchmarkResult = {
      name: `largeTree(depth=${depth},breadth=${breadth})`,
      iterations,
      totalTime,
      averageTime,
      opsPerSecond,
    };

    this.results.push(result);
    return result;
  }

  // Benchmark DOM manipulation
  benchmarkDOMManipulation(iterations: number = 1000): BenchmarkResult {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      const vnode = createElement(
        "div",
        { className: "item" },
        createElement("span", null, `Item ${i}`)
      );
      const node = renderToDOM(vnode);
      container.appendChild(node);
    }

    const endTime = performance.now();

    // Cleanup
    document.body.removeChild(container);

    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    const opsPerSecond = 1000 / averageTime;

    const result: BenchmarkResult = {
      name: "DOMManipulation",
      iterations,
      totalTime,
      averageTime,
      opsPerSecond,
    };

    this.results.push(result);
    return result;
  }

  // Benchmark style processing
  benchmarkStyleProcessing(iterations: number = 10000): BenchmarkResult {
    const styles = {
      backgroundColor: "red",
      fontSize: "16px",
      marginTop: "10px",
      paddingLeft: "20px",
      borderRadius: "5px",
    };

    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      createElement("div", { style: styles }, "Styled element");
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    const opsPerSecond = 1000 / averageTime;

    const result: BenchmarkResult = {
      name: "styleProcessing",
      iterations,
      totalTime,
      averageTime,
      opsPerSecond,
    };

    this.results.push(result);
    return result;
  }

  // Memory usage test
  benchmarkMemoryUsage(): { before: number; after: number; delta: number } {
    const before = (performance as any).memory?.usedJSHeapSize || 0;

    // Create many elements
    const elements: VNode[] = [];
    for (let i = 0; i < 10000; i++) {
      elements.push(
        createElement(
          "div",
          { className: "test", id: `item-${i}` },
          createElement("span", null, `Content ${i}`)
        )
      );
    }

    const after = (performance as any).memory?.usedJSHeapSize || 0;
    const delta = after - before;

    return { before, after, delta };
  }

  // Run all benchmarks
  runAll(): BenchmarkResult[] {
    console.log("🚀 Starting Performance Benchmarks...\n");

    console.log("1. createElement Performance");
    const createElementResult = this.benchmarkCreateElement(10000);
    this.logResult(createElementResult);

    console.log("\n2. renderToDOM Performance");
    const renderResult = this.benchmarkRenderToDOM(1000);
    this.logResult(renderResult);

    console.log("\n3. Large Tree Creation");
    const treeResult = this.benchmarkLargeTree(5, 5);
    this.logResult(treeResult);

    console.log("\n4. DOM Manipulation");
    const domResult = this.benchmarkDOMManipulation(1000);
    this.logResult(domResult);

    console.log("\n5. Style Processing");
    const styleResult = this.benchmarkStyleProcessing(10000);
    this.logResult(styleResult);

    console.log("\n6. Memory Usage");
    const memoryResult = this.benchmarkMemoryUsage();
    console.log(`   Before: ${this.formatBytes(memoryResult.before)}`);
    console.log(`   After:  ${this.formatBytes(memoryResult.after)}`);
    console.log(`   Delta:  ${this.formatBytes(memoryResult.delta)}`);

    console.log("\n✅ All benchmarks completed!");
    return this.results;
  }

  // Get all results
  getResults(): BenchmarkResult[] {
    return this.results;
  }

  // Clear results
  clearResults(): void {
    this.results = [];
  }

  // Helper: Log result
  private logResult(result: BenchmarkResult): void {
    console.log(`   Name: ${result.name}`);
    console.log(`   Iterations: ${result.iterations.toLocaleString()}`);
    console.log(`   Total Time: ${result.totalTime.toFixed(2)}ms`);
    console.log(`   Average Time: ${result.averageTime.toFixed(4)}ms`);
    console.log(`   Ops/Second: ${result.opsPerSecond.toFixed(0)}`);
  }

  // Helper: Format bytes
  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  // Generate HTML report
  generateHTMLReport(): string {
    let html = `
      <div style="font-family: monospace; padding: 20px;">
        <h2>📊 Performance Benchmark Report</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Test</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Iterations</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total (ms)</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Average (ms)</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Ops/Sec</th>
            </tr>
          </thead>
          <tbody>
    `;

    for (const result of this.results) {
      html += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${result.name}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${result.iterations.toLocaleString()}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${result.totalTime.toFixed(2)}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${result.averageTime.toFixed(4)}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${result.opsPerSecond.toFixed(0)}</td>
        </tr>
      `;
    }

    html += `
          </tbody>
        </table>
      </div>
    `;

    return html;
  }
}

// Export singleton instance
export const benchmark = new PerformanceBenchmark();

// Make it globally accessible for console testing
if (typeof window !== "undefined") {
  (window as any).benchmark = benchmark;
}
