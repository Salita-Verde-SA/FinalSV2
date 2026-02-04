import { useState, useEffect, useRef, useCallback } from 'react';

export const useLatencyMonitor = (intervalMs = 1000, maxPoints = 20) => {
  const [latencyData, setLatencyData] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [currentHealth, setCurrentHealth] = useState({ status: 'healthy' });
  const intervalRef = useRef(null);

  // Generador de latencia simulada (Ping realista)
  const generatePing = () => {
    // Base de 20ms + aleatorio entre 0 y 100ms
    const base = 20;
    const noise = Math.floor(Math.random() * 80);
    // Simular picos ocasionales (lag spikes)
    const spike = Math.random() > 0.9 ? 200 : 0; 
    return base + noise + spike;
  };

  const addDataPoint = useCallback(() => {
    setLatencyData(prevData => {
      const newPoint = { 
        timestamp: Date.now(), 
        latency: generatePing() 
      };
      // Mantener solo los últimos 'maxPoints' para que el gráfico se mueva
      const newData = [...prevData, newPoint];
      return newData.slice(-maxPoints); 
    });

    // Simular estado de salud basado en la latencia
    // Si es muy alta (>200), el sistema está "degraded"
    setLatencyData(prev => {
        const last = prev[prev.length - 1];
        if (last && last.latency > 200) setCurrentHealth({ status: 'degraded' });
        else setCurrentHealth({ status: 'healthy' });
        return prev;
    });
  }, [maxPoints]);

  const startMonitoring = useCallback(() => {
    if (!intervalRef.current) {
      setIsMonitoring(true);
      intervalRef.current = setInterval(addDataPoint, intervalMs);
    }
  }, [addDataPoint, intervalMs]);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsMonitoring(false);
  }, []);

  const clearData = useCallback(() => {
    setLatencyData([]); // Resetear a 0 visualmente
  }, []);

  // Iniciar al montar
  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    latencyData,
    currentHealth,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearData
  };
};