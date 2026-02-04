import React, { useMemo } from 'react';
import { Activity, Pause, Play, Trash2, Wifi, WifiOff } from 'lucide-react';

const LatencyChart = ({ latencyData = [], currentHealth, isMonitoring, onToggleMonitoring, onClear }) => {
  
  // 1. Procesamiento de Datos (Todo ocurre aquí dentro)
  const { pathData, lastLatency } = useMemo(() => {
    // A. MANEJO DE ESTADO VACÍO (CLAVE PARA EL 0ms)
    // Si no hay datos (limpiaste), creamos dos puntos falsos en 0 para dibujar la línea plana.
    let dataToProcess = latencyData;
    if (!Array.isArray(latencyData) || latencyData.length === 0) {
      dataToProcess = [{ latency: 0 }, { latency: 0 }];
    }

    // B. SANITIZAR (Asegurar números)
    const safeData = dataToProcess.map(d => ({
      val: typeof d.latency === 'number' && isFinite(d.latency) ? d.latency : 0
    }));

    // C. ÚLTIMO VALOR (Para el texto grande)
    // Si la data original estaba vacía, mostramos 0. Si tiene datos, mostramos el último.
    const lastVal = latencyData.length > 0 ? safeData[safeData.length - 1].val : 0;

    // D. ESCALA Y DINÁMICA
    // El techo del gráfico es el valor máximo o 100ms (lo que sea mayor).
    const maxVal = Math.max(...safeData.map(d => d.val), 100);

    // E. GENERAR COORDENADAS SVG
    const points = safeData.map((d, i) => {
      // Eje X: 0 a 100%
      const x = (i / (safeData.length - 1 || 1)) * 100;
      
      // Eje Y: Invertido (0 es arriba, 100 es abajo).
      // Mapeamos el valor: 0 -> 90% (abajo), Max -> 10% (arriba).
      const y = 90 - ((d.val / maxVal) * 80); 
      
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    // F. CREAR COMANDO SVG "PATH"
    const dCommand = `M ${points[0]} ` + points.slice(1).map(p => `L ${p}`).join(' ');

    return { pathData: dCommand, lastLatency: lastVal };
  }, [latencyData]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* HEADER DEL WIDGET */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-white font-black italic uppercase tracking-tighter text-xl">
            Server <span className="text-brand-accent">Telemetry</span>
          </h4>
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">
            Live Database Monitoring
          </p>
        </div>
        
        {/* BOTONES DE CONTROL */}
        <div className="flex gap-2 z-20">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleMonitoring) onToggleMonitoring();
            }}
            className={`p-2 border transition-all active:scale-95 ${
              isMonitoring 
                ? 'border-brand-accent text-brand-accent bg-brand-accent/10 hover:bg-brand-accent hover:text-black' 
                : 'border-green-500 text-green-500 hover:bg-green-500 hover:text-black'
            }`}
            title={isMonitoring ? "Pausar" : "Reanudar"}
          >
            {isMonitoring ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </button>
          
          {onClear && (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="p-2 border border-gray-700 text-gray-500 hover:border-red-500 hover:text-red-500 transition-all active:scale-95"
              title="Limpiar Datos"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* PANELES DE MÉTRICAS */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Tarjeta Ping */}
        <div className="bg-[#0a0a0b] p-4 border-l-4 border-brand-accent relative overflow-hidden group shadow-lg">
          <span className="text-[10px] font-black text-gray-500 uppercase block mb-1 tracking-widest">Current Ping</span>
          <div className="flex items-baseline gap-1 relative z-10">
            <span className="text-4xl font-black text-white italic tracking-tighter shadow-black drop-shadow-md">
              {lastLatency}
            </span>
            <span className="text-xs font-bold text-gray-500">ms</span>
          </div>
          <Activity className="absolute bottom-2 right-2 text-white/5 group-hover:text-brand-accent/20 transition-colors" size={40} />
        </div>

        {/* Tarjeta Status */}
        <div className={`bg-[#0a0a0b] p-4 border-l-4 relative overflow-hidden shadow-lg ${
          currentHealth?.status === 'healthy' ? 'border-green-500' : 'border-red-500'
        }`}>
          <span className="text-[10px] font-black text-gray-500 uppercase block mb-1 tracking-widest">System Status</span>
          <div className="flex items-center gap-3 mt-2 relative z-10">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              currentHealth?.status === 'healthy' ? 'bg-green-500 shadow-[0_0_10px_lime]' : 'bg-red-500 shadow-[0_0_10px_red]'
            }`}></div>
            <span className={`text-sm font-black uppercase italic tracking-wider ${
              currentHealth?.status === 'healthy' ? 'text-white' : 'text-red-500'
            }`}>
              {currentHealth?.status === 'healthy' ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          {currentHealth?.status === 'healthy' ? 
            <Wifi className="absolute bottom-2 right-2 text-green-500/10" size={40} /> : 
            <WifiOff className="absolute bottom-2 right-2 text-red-500/10" size={40} />
          }
        </div>
      </div>

      {/* ÁREA DEL GRÁFICO (MONITOR) */}
      <div className="relative w-full h-40 bg-[#0a0a0b] border border-white/10 mt-auto overflow-hidden rounded-sm shadow-inner">
        
        {/* Grid de fondo */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="border-[0.5px] border-white/5"></div>
          ))}
        </div>

        {/* SVG Principal */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF4D00" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#FF4D00" stopOpacity="0"/>
            </linearGradient>
          </defs>

          {/* Sombra (Glow) */}
          <path 
            d={pathData} 
            fill="none" 
            stroke="#FF4D00" 
            strokeWidth="4" 
            strokeOpacity="0.3" 
            className="blur-[4px]"
          />

          {/* Línea Sólida */}
          <path
            d={pathData}
            fill="none"
            stroke="#FF4D00" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Relleno bajo la curva */}
          <path
            d={`${pathData} V 100 H 0 Z`}
            fill="url(#areaGradient)"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        
        {/* Efecto Scanline */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-accent/5 to-transparent h-[20%] w-full animate-[scan_3s_linear_infinite] pointer-events-none"></div>
      </div>
    </div>
  );
};

export default LatencyChart;