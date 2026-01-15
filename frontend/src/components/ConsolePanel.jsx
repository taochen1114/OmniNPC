import { useEffect, useState } from 'react';

export const ConsolePanel = () => {
  const [logs, setLogs] = useState([]);

  // 輔助函數：格式化參數，處理物件
  const formatArgs = (args) => {
    return args
      .map((arg) => {
        // 處理 undefined
        if (arg === undefined) return 'undefined';
        // 處理 File
        if (arg instanceof File) {
          return JSON.stringify(
            {
              type: 'File',
              name: arg.name,
              size: arg.size,
              lastModified: arg.lastModified
                ? new Date(arg.lastModified).toISOString()
                : null,
            },
            null,
            2
          );
        }
        // 處理 Symbol
        if (typeof arg === 'symbol') return arg.toString();
        // 處理函數
        if (typeof arg === 'function') return arg.toString();
        // 處理 BigInt
        if (typeof arg === 'bigint') return arg.toString();
        // 處理物件（包括 Error、陣列和 Date）
        if (typeof arg === 'object' && arg !== null) {
          // 處理 Error 物件（包括子類如 NotSupportedError）
          if (arg instanceof Error) {
            return `${arg.name}: ${arg.message}${arg.stack ? '\n' + arg.stack : ''}`;
          }
          // 處理 Date
          if (arg instanceof Date) return arg.toISOString();
          // 處理 RegExp
          if (arg instanceof RegExp) return arg.toString();
          // 處理其他物件
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return '[Circular or Unserializable Object]';
          }
        }
        // 其他類型直接回傳
        return arg;
      })
      .join(' ');
  };

  const getLogStyle = (type) => {
    switch (type) {
      case 'log': {
        return {
          color: 'white',
        };
      }
      case 'warn': {
        return {
          color: 'yellow',
        };
      }
      case 'error': {
        return {
          color: 'red',
        };
      }
      default: {
        return {
          color: 'white',
        };
      }
    }
  };

  const commonStyle = () => {
    return {
      backgroundColor: 'black',
      margin: '20px 0',
    };
  };

  useEffect(() => {
    // 儲存原始 console 方法
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    // 攔截 console.log
    console.log = (...args) => {
      setLogs((prev) => [{ message: formatArgs(args), type: 'log' }, ...prev]);
      originalConsoleLog(...args);
    };

    // 攔截 console.warn
    console.warn = (...args) => {
      setLogs((prev) => [{ message: formatArgs(args), type: 'warn' }, ...prev]);
      originalConsoleWarn(...args);
    };

    // 攔截 console.error
    console.error = (...args) => {
      setLogs((prev) => [
        { message: formatArgs(args), type: 'error' },
        ...prev,
      ]);
      originalConsoleError(...args);
    };

    return () => {
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    };
  }, []);

  return (
    <div style={{ fontSize: '20px', letterSpacing: '0.5px' }}>
      <strong>🚨 All Consoles (由新至舊):</strong>
      <button
        type="button"
        onClick={() => setLogs([])}
        style={{
          display: 'block',
          border: '5px solid black',
          padding: '20px',
          margin: '20px',
        }}
      >
        清空現有 Console
      </button>
      <ul
        style={{
          backgroundColor: 'black',
          padding: '20px',
        }}
      >
        {logs.map((log, i) => (
          <li key={i} style={{ ...getLogStyle(log.type), ...commonStyle() }}>
            {log.message}
          </li>
        ))}
      </ul>
    </div>
  );
};
