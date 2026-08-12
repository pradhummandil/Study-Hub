import React, { useState, useEffect } from 'react';
import { X, Move } from 'lucide-react';

interface ScientificCalculatorProps {
  onClose: () => void;
}

export const ScientificCalculator: React.FC<ScientificCalculatorProps> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number>(0);
  const [isRad, setIsRad] = useState<boolean>(true); // Radians vs Degrees
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(10, Math.min(window.innerWidth - 340, e.clientX - dragStart.x)),
          y: Math.max(10, Math.min(window.innerHeight - 480, e.clientY - dragStart.y)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent capturing key events when focused on input/textarea
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        appendValue(e.key);
      } else if (['+', '-', '*', '/', '.', '(', ')'].includes(e.key)) {
        appendValue(e.key);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        calculateResult();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display]);

  const appendValue = (val: string) => {
    setDisplay((prev) => {
      if (prev === '0' || prev === 'Error') return val;
      return prev + val;
    });
  };

  const clearAll = () => {
    setDisplay('0');
  };

  const handleBackspace = () => {
    setDisplay((prev) => {
      if (prev.length <= 1 || prev === 'Error') return '0';
      return prev.slice(0, -1);
    });
  };

  const calculateResult = () => {
    try {
      // Replace safe math operators
      let expr = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      // Replace functions
      expr = expr.replace(/sin\(([^)]+)\)/g, (_, arg) => {
        const val = Number(arg);
        return isRad ? String(Math.sin(val)) : String(Math.sin((val * Math.PI) / 180));
      });
      expr = expr.replace(/cos\(([^)]+)\)/g, (_, arg) => {
        const val = Number(arg);
        return isRad ? String(Math.cos(val)) : String(Math.cos((val * Math.PI) / 180));
      });
      expr = expr.replace(/tan\(([^)]+)\)/g, (_, arg) => {
        const val = Number(arg);
        return isRad ? String(Math.tan(val)) : String(Math.tan((val * Math.PI) / 180));
      });
      expr = expr.replace(/sqrt\(([^)]+)\)/g, (_, arg) => String(Math.sqrt(Number(arg))));
      expr = expr.replace(/log\(([^)]+)\)/g, (_, arg) => String(Math.log10(Number(arg))));
      expr = expr.replace(/ln\(([^)]+)\)/g, (_, arg) => String(Math.log(Number(arg))));

      // Sanitize string to allow only numbers and basic operators
      const sanitized = expr.replace(/[^0-9+\-*/.()MathPIE]/g, '');
      // Evaluate result safely
      const fn = Function(`"use strict"; return (${sanitized})`);
      const res = fn();

      if (typeof res === 'number' && !isNaN(res)) {
        // Round to 8 decimal places for clean float display
        const rounded = Math.round(res * 1e8) / 1e8;
        setDisplay(String(rounded));
      } else {
        setDisplay('Error');
      }
    } catch {
      setDisplay('Error');
    }
  };

  const applyFunction = (func: string) => {
    try {
      const num = parseFloat(display);
      if (isNaN(num)) return;

      let res = 0;
      switch (func) {
        case 'sq':
          res = num * num;
          break;
        case 'sqrt':
          res = Math.sqrt(num);
          break;
        case 'reciprocal':
          res = 1 / num;
          break;
        case 'sin':
          res = isRad ? Math.sin(num) : Math.sin((num * Math.PI) / 180);
          break;
        case 'cos':
          res = isRad ? Math.cos(num) : Math.cos((num * Math.PI) / 180);
          break;
        case 'tan':
          res = isRad ? Math.tan(num) : Math.tan((num * Math.PI) / 180);
          break;
        case 'log':
          res = Math.log10(num);
          break;
        case 'ln':
          res = Math.log(num);
          break;
        case 'exp':
          res = Math.exp(num);
          break;
        default:
          return;
      }
      setDisplay(String(Math.round(res * 1e8) / 1e8));
    } catch {
      setDisplay('Error');
    }
  };

  // Memory functions
  const handleMemory = (action: 'MC' | 'MR' | 'MS' | 'M+') => {
    const num = parseFloat(display) || 0;
    switch (action) {
      case 'MC':
        setMemory(0);
        break;
      case 'MR':
        setDisplay(String(memory));
        break;
      case 'MS':
        setMemory(num);
        break;
      case 'M+':
        setMemory((prev) => prev + num);
        break;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className="z-50 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-cyan-500/40 p-4 shadow-2xl space-y-3 font-mono text-white select-none animate-in fade-in"
    >
      {/* Header & Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between cursor-move pb-2 border-b border-slate-800 text-xs font-bold text-slate-300"
      >
        <span className="flex items-center gap-1.5 text-cyan-400">
          <Move className="w-3.5 h-3.5" /> GATE Official Scientific Calculator
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRad(!isRad)}
            className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-300 border border-cyan-500/30 hover:bg-slate-700"
          >
            {isRad ? 'RAD' : 'DEG'}
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Screen Display */}
      <div className="p-3 bg-slate-950 rounded-xl text-right font-mono text-xl sm:text-2xl text-[#5CE1E6] truncate tracking-wider border border-slate-800 shadow-inner">
        {display}
      </div>

      {/* Memory & Function Row */}
      <div className="grid grid-cols-4 gap-1.5 text-[11px] font-bold">
        {['MC', 'MR', 'MS', 'M+'].map((m) => (
          <button
            key={m}
            onClick={() => handleMemory(m as any)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-amber-500/20"
          >
            {m}
          </button>
        ))}
      </div>

      {/* Scientific Functions */}
      <div className="grid grid-cols-5 gap-1.5 text-[11px] font-bold">
        <button onClick={() => applyFunction('sin')} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300">sin</button>
        <button onClick={() => applyFunction('cos')} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300">cos</button>
        <button onClick={() => applyFunction('tan')} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300">tan</button>
        <button onClick={() => applyFunction('log')} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300">log</button>
        <button onClick={() => applyFunction('ln')} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300">ln</button>

        <button onClick={() => applyFunction('sq')} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300">x²</button>
        <button onClick={() => applyFunction('sqrt')} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300">√x</button>
        <button onClick={() => applyFunction('reciprocal')} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300">1/x</button>
        <button onClick={() => appendValue('π')} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300">π</button>
        <button onClick={() => appendValue('e')} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300">e</button>
      </div>

      {/* Standard Numpad & Operators */}
      <div className="grid grid-cols-4 gap-1.5 text-xs sm:text-sm font-bold">
        <button onClick={clearAll} className="p-2.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30">C</button>
        <button onClick={() => appendValue('(')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">(</button>
        <button onClick={() => appendValue(')')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">)</button>
        <button onClick={handleBackspace} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 flex items-center justify-center">⌫</button>

        <button onClick={() => appendValue('7')} className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white">7</button>
        <button onClick={() => appendValue('8')} className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white">8</button>
        <button onClick={() => appendValue('9')} className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white">9</button>
        <button onClick={() => appendValue('/')} className="p-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30">÷</button>

        <button onClick={() => appendValue('4')} className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white">4</button>
        <button onClick={() => appendValue('5')} className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white">5</button>
        <button onClick={() => appendValue('6')} className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white">6</button>
        <button onClick={() => appendValue('*')} className="p-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30">×</button>

        <button onClick={() => appendValue('1')} className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white">1</button>
        <button onClick={() => appendValue('2')} className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white">2</button>
        <button onClick={() => appendValue('3')} className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white">3</button>
        <button onClick={() => appendValue('-')} className="p-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30">-</button>

        <button onClick={() => appendValue('0')} className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white">0</button>
        <button onClick={() => appendValue('.')} className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white">.</button>
        <button onClick={calculateResult} className="col-span-2 p-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base">=</button>
      </div>
    </div>
  );
};
