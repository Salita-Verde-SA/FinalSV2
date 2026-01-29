import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { Activity, Pause, Play, Trash2, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

const LatencyChart = ({ latencyData, currentHealth, isMonitoring, error, onToggleMonitoring, onClear }) => {
  const isOffline = currentHealth?.status === 'offline';
  const lastLatency = latencyData.length > 0 ? latencyData[latencyData.length - 1]?.dbLatency : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-text-primary text-white p-6 border-l-4 border-primary shadow-lg relative overflow-hidden">
       {/* Grid overlay decorativo */}
       <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 pointer-events-none"></div>

       <div className="flex justify-between items-center mb-6 relative z-10">
         <div className="flex items-center gap-3">
            <div className={`p-2 ${isOffline ? 'bg-red-500' : 'bg-primary'} text-white skew-x-12`}>
               <Activity size={20} className="-skew-x-12"/>
            </div>
            <div>
               <h3 className="font-black italic uppercase tracking-wider text-lg">Server Telemetry</h3>
               <p className="text-[10px] text-gray-400 font-mono uppercase">Live Database Latency Monitoring</p>
            </div>
         </div>
         <div className="flex gap-2">
            <button onClick={onToggleMonitoring} className="p-2 border border-gray-600 hover:border-primary text-primary hover:bg-white/5 transition-colors">{isMonitoring ? <Pause size={16}/> : <Play size={16}/>}</button>
            <button onClick={onClear} className="p-2 border border-gray-600 hover:border-red-500 text-red-500 hover:bg-white/5 transition-colors"><Trash2 size={16}/></button>
         </div>
       </div>

       <div className="grid grid-cols-4 gap-4 mb-6 relative z-10">
          <div className="bg-black/30 p-3 border-t-2 border-primary">
             <p className="text-[10px] text-gray-400 uppercase">Current</p>
             <p className="text-2xl font-black italic text-white">{isOffline ? '--' : lastLatency?.toFixed(1)} <span className="text-xs not-italic font-normal text-gray-500">ms</span></p>
          </div>
          {/* Stats simplificados para mantener estética limpia */}
          <div className="bg-black/30 p-3 border-t-2 border-gray-700 col-span-3 flex items-center justify-between px-6">
             <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                <span className="text-xs font-bold uppercase tracking-widest">{isOffline ? 'CONNECTION LOST' : 'SYSTEM ONLINE'}</span>
             </div>
             <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase">Status</p>
                <p className={`text-sm font-bold uppercase ${isOffline ? 'text-red-500' : 'text-green-500'}`}>{currentHealth?.status || 'UNKNOWN'}</p>
             </div>
          </div>
       </div>

       <div className="h-48 w-full bg-black/20 border border-white/5 relative z-10">
         <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={latencyData}>
               <defs>
                  <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
               <XAxis dataKey="time" hide />
               <YAxis hide domain={[0, 'auto']} />
               <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#F97316', color: '#fff' }} 
                  itemStyle={{ color: '#F97316' }}
                  labelStyle={{ display: 'none' }}
                  formatter={(value) => [`${value.toFixed(2)} ms`, 'Latencia']}
               />
               <Area type="monotone" dataKey="dbLatency" stroke="none" fill="url(#latencyGradient)" />
               <Line type="monotone" dataKey="dbLatency" stroke="#F97316" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#fff' }} />
            </ComposedChart>
         </ResponsiveContainer>
       </div>
    </motion.div>
  );
};

export default LatencyChart;