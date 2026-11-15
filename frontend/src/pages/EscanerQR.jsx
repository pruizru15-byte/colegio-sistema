// Copyright (c) 2026 MyCompany LLC
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { 
  ScanLine, Camera, ArrowRight, AlertCircle, QrCode, 
  Printer, Download, Upload, Search, CheckCircle2, 
  Sparkles, RefreshCw, Smartphone, Eye, ExternalLink,
  Laptop, MapPin, Building2, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:8000/api';

export const EscanerQR = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token } = useAuth();

  // Pestaña activa: 'escaner', 'catalogo' o 'simulador'
  const [tabActiva, setTabActiva] = useState(() => searchParams.get('tab') || 'escaner');

  // Sincronizar si cambia el parámetro en URL
  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && t !== tabActiva) {
      setTabActiva(t);
    }
  }, [searchParams]);

  // Estados del Escáner
  const [codigoManual, setCodigoManual] = useState('');
  const html5QrCodeRef = useRef(null);
  const [camaraIniciada, setCamaraIniciada] = useState(false);
  const [camaraCargando, setCamaraCargando] = useState(false);
  const [errorCamara, setErrorCamara] = useState('');
  const [camaras, setCamaras] = useState([]);
  const [camaraSeleccionada, setCamaraSeleccionada] = useState('');
  const [historialEscaneos, setHistorialEscaneos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('historial_qr_escaneos') || '[]');
    } catch {
      return [];
    }
  });

  // Estados del Catálogo y Etiquetas
  const [catalogoQR, setCatalogoQR] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [filtroUbicacion, setFiltroUbicacion] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busquedaEtiquetas, setBusquedaEtiquetas] = useState('');

  // Equipo seleccionado para el simulador móvil
  const [simuladorEquipo, setSimuladorEquipo] = useState(null);

  // Subida de imagen QR
  const [errorSubida, setErrorSubida] = useState('');
  const fileInputRef = useRef(null);

  // Cargar estadísticas y catálogo
  const cargarDatosQR = async () => {
    try {
      setLoadingCatalogo(true);
      const [resStats, resCat] = await Promise.all([
        fetch(`${API_BASE}/qr/stats`),
        fetch(`${API_BASE}/qr/catalogo`)
      ]);

      if (resStats.ok) {
        const dataStats = await resStats.json();
        setStats(dataStats);
      }
      if (resCat.ok) {
        const dataCat = await resCat.json();
        setCatalogoQR(dataCat);
        if (dataCat.length > 0 && !simuladorEquipo) {
          setSimuladorEquipo(dataCat[0]);
        }
      }
    } catch (e) {
      console.error('Error al sincronizar módulo QR:', e);
    } finally {
      setLoadingCatalogo(false);
    }
  };

  useEffect(() => {
    cargarDatosQR();
  }, []);

  // Iniciar la cámara de forma directa y nativa
  const activarCamara = async (dispositivoId = null) => {
    try {
      setCamaraCargando(true);
      setErrorCamara('');

      // Detener y limpiar instancia previa si existe
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
          }
          await html5QrCodeRef.current.clear();
        } catch (e) {
          console.warn('Deteniendo instancia previa:', e);
        }
      }

      // Asegurar que el estado indique cámara activa para que el contenedor esté en el DOM con tamaño real
      setCamaraIniciada(true);

      // Pequeña pausa asíncrona para que React pinte el contenedor #qr-reader con dimensiones completas
      await new Promise(resolve => setTimeout(resolve, 80));

      // Listar cámaras físicas disponibles
      let devices = [];
      try {
        devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCamaras(devices);
        }
      } catch (devErr) {
        console.warn('Búsqueda inicial de dispositivos:', devErr);
      }

      // Determinar la cámara idónea
      let targetCamera = dispositivoId;
      if (!targetCamera && devices && devices.length > 0) {
        // En móviles o tablets, preferir cámara trasera
        const backCam = devices.find(d => d.label && /back|rear|trasera|ambiente/i.test(d.label));
        // En PC/laptop, evitar cámaras virtuales inactivas (OBS, DroidCam) si existe cámara física integrada
        const realCam = devices.find(d => d.label && !/virtual|obs/i.test(d.label));
        targetCamera = backCam?.id || realCam?.id || devices[0].id;
      }

      // Si aún no hay cámara específica, solicitar por facingMode
      if (!targetCamera) {
        targetCamera = { facingMode: 'environment' };
      }

      // Inicializar Html5Qrcode en el contenedor #qr-reader
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      const qrConfig = {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const edge = Math.floor(minEdge * 0.72);
          return { width: Math.max(edge, 200), height: Math.max(edge, 200) };
        },
      };

      const onScanSuccess = (decodedText) => {
        let hash = decodedText;
        if (decodedText.includes('/ficha/')) {
          hash = decodedText.split('/ficha/')[1];
        }
        hash = hash.split('?')[0].replace(/\/+$/, '').trim();
        registrarEscaneo(hash);
        if (html5QrCodeRef.current) {
          html5QrCodeRef.current.stop().then(() => {
            navigate(`/ficha/${hash}`);
          }).catch(() => {
            navigate(`/ficha/${hash}`);
          });
        } else {
          navigate(`/ficha/${hash}`);
        }
      };

      // Intentar iniciar con la cámara seleccionada
      try {
        await html5QrCode.start(targetCamera, qrConfig, onScanSuccess, () => {});
      } catch (errFirst) {
        console.warn('Primer intento de inicio de cámara falló, intentando con facingMode "user":', errFirst);
        // Fallback a cámara frontal / genérica de laptop
        await html5QrCode.start({ facingMode: 'user' }, qrConfig, onScanSuccess, () => {});
      }

      // Con el permiso ya concedido, consultar lista actualizada de cámaras
      try {
        const availableDevices = await Html5Qrcode.getCameras();
        if (availableDevices && availableDevices.length > 0) {
          setCamaras(availableDevices);
          if (typeof targetCamera === 'string') {
            setCamaraSeleccionada(targetCamera);
          } else {
            setCamaraSeleccionada(availableDevices[0].id);
          }
        }
      } catch (listErr) {
        console.warn('Error al actualizar lista de cámaras:', listErr);
      }

      setCamaraIniciada(true);
    } catch (err) {
      console.error('Error al iniciar cámara:', err);
      setErrorCamara(
        err?.message?.includes('Permission') || err?.name === 'NotAllowedError'
          ? 'Permiso de cámara bloqueado en el navegador. Haz clic en el ícono de permisos de la barra de direcciones y selecciona "Permitir" para activar el escáner.'
          : 'No se pudo iniciar el sensor de la cámara web. Asegúrate de tener una cámara conectada y otorgar permiso en el navegador.'
      );
      setCamaraIniciada(false);
    } finally {
      setCamaraCargando(false);
    }
  };

  const apagarCamara = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Error al detener cámara:', e);
      }
    }
    setCamaraIniciada(false);
  };

  // Activar la cámara automáticamente al ingresar a la pestaña Escáner
  useEffect(() => {
    if (tabActiva === 'escaner') {
      activarCamara();
    }
    return () => {
      apagarCamara();
    };
  }, [tabActiva]);

  // Guardar en historial de escaneos
  const registrarEscaneo = (hash) => {
    const nuevoHistorial = [
      { hash, fecha: new Date().toLocaleTimeString(), timestamp: Date.now() },
      ...historialEscaneos.filter(h => h.hash !== hash)
    ].slice(0, 6);

    setHistorialEscaneos(nuevoHistorial);
    localStorage.setItem('historial_qr_escaneos', JSON.stringify(nuevoHistorial));
  };

  // Procesar imagen subida
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorSubida('');
    try {
      const html5QrCode = new Html5Qrcode("qr-file-reader-hidden");
      const decodedText = await html5QrCode.scanFile(file, true);
      let hash = decodedText;
      if (decodedText.includes('/ficha/')) {
        hash = decodedText.split('/ficha/')[1];
      }
      registrarEscaneo(hash);
      navigate(`/ficha/${hash}`);
    } catch (err) {
      setErrorSubida('No se detectó un código QR válido en la imagen seleccionada.');
    }
  };

  // Envío manual de código
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!codigoManual.trim()) return;
    let hash = codigoManual.trim();
    if (hash.includes('/ficha/')) {
      hash = hash.split('/ficha/')[1];
    }
    registrarEscaneo(hash);
    navigate(`/ficha/${hash}`);
  };

  // Filtrado de etiquetas del catálogo
  const etiquetasFiltradas = catalogoQR.filter(item => {
    if (filtroTipo !== 'todos' && item.tipo !== filtroTipo) return false;
    if (filtroUbicacion && !item.ubicacion.toLowerCase().includes(filtroUbicacion.toLowerCase())) return false;
    if (busquedaEtiquetas) {
      const term = busquedaEtiquetas.toLowerCase();
      const matchCod = item.codigo_patrimonial?.toLowerCase().includes(term);
      const matchNom = item.nombre?.toLowerCase().includes(term);
      const matchHash = item.codigo_hash?.toLowerCase().includes(term);
      if (!matchCod && !matchNom && !matchHash) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Estilos específicos para html5-qrcode para asegurar video responsivo y visualización fluida */}
      <style>{`
        #qr-reader {
          width: 100% !important;
          max-width: 600px !important;
          margin: 0 auto !important;
          border: none !important;
          background: #020617 !important;
          border-radius: 1rem !important;
          overflow: hidden !important;
          position: relative !important;
        }
        #qr-reader video {
          width: 100% !important;
          height: auto !important;
          min-height: 280px !important;
          max-height: 460px !important;
          object-fit: cover !important;
          border-radius: 1rem !important;
          display: block !important;
          margin: 0 auto !important;
        }
        #qr-reader__scan_region {
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          background: transparent !important;
        }
        #qr-reader__scan_region img,
        #qr-reader__dashboard,
        #qr-reader__dashboard_section,
        #qr-reader__header_message,
        #qr-shaded-region {
          display: none !important;
        }
      `}</style>
      
      {/* 1. Tarjetas Superiores de Métricas del Módulo QR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
        
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cobertura QR</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats?.total_qr || catalogoQR.length} <span className="text-xs text-emerald-600 font-bold">({stats?.cobertura_porcentaje || 100}%)</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Bienes con rótulo oficial</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cámara Óptica</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${camaraIniciada ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {camaraIniciada ? 'En Vivo' : 'Inactiva'}
          </div>
          <div className={`text-[11px] font-semibold mt-0.5 ${camaraIniciada ? 'text-emerald-600' : 'text-slate-400'}`}>
            {camaraIniciada ? 'Detección a 15 FPS' : 'Haz clic en habilitar'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Consultas Rápidas</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 tracking-tight">
            Instantánea
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-0.5">Sin login para alumnos</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Impresión de Rótulos</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 tracking-tight">
            Stickers
          </div>
          <div className="text-[11px] text-indigo-700 font-semibold mt-0.5">Pliegos listos para pegar</div>
        </div>
      </div>

      {/* 2. Barra de Control: Pestañas de Funcionalidad */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto">
          <button
            onClick={() => setTabActiva('escaner')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              tabActiva === 'escaner'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ScanLine className="w-3.5 h-3.5" />
            Escáner y Lector
          </button>

          <button
            onClick={() => setTabActiva('catalogo')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              tabActiva === 'catalogo'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            Rotulación e Impresión ({catalogoQR.length})
          </button>

          <button
            onClick={() => setTabActiva('simulador')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              tabActiva === 'simulador'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Simulador de Ficha Móvil
          </button>
        </div>

        <div className="flex items-center gap-2">
          {tabActiva === 'catalogo' && (
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              Imprimir Pliego de Stickers
            </button>
          )}

          <button
            onClick={cargarDatosQR}
            title="Recargar datos"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. PESTAÑA: ESCÁNER EN VIVO Y LECTOR DIGITAL */}
      {tabActiva === 'escaner' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna Izquierda: Visor de Cámara y Métodos de Captura (2 Cols) */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* Visor de Cámara */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${camaraIniciada ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>Cámara en Tiempo Real</span>
                      {camaraIniciada && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          En Vivo
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-400">Apunta el lente directamente al código QR del equipo</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {camaras.length > 1 && camaraIniciada && (
                    <select
                      value={camaraSeleccionada}
                      onChange={(e) => activarCamara(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                    >
                      {camaras.map(c => (
                        <option key={c.id} value={c.id}>{c.label || 'Cámara ' + c.id.slice(0, 4)}</option>
                      ))}
                    </select>
                  )}

                  {camaraIniciada ? (
                    <button
                      onClick={apagarCamara}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 transition flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Apagar Cámara
                    </button>
                  ) : (
                    <button
                      onClick={() => activarCamara()}
                      disabled={camaraCargando}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition flex items-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" />
                      {camaraCargando ? 'Iniciando...' : 'Habilitar Cámara'}
                    </button>
                  )}
                </div>
              </div>

              {/* Mensaje de aviso/instrucciones si la cámara requiere permiso */}
              {errorCamara && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-2xl mb-4 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Permiso de acceso a la cámara requerido</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-700">
                    {errorCamara}
                  </p>
                  <button
                    onClick={() => activarCamara()}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                  >
                    Reintentar Conexión
                  </button>
                </div>
              )}

              {/* Contenedor del Lector QR */}
              <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 min-h-[340px] flex items-center justify-center shadow-inner">
                
                {/* Elemento donde html5-qrcode inyecta el stream de video - SIEMPRE VISIBLE */}
                <div 
                  id="qr-reader" 
                  className="w-full flex items-center justify-center"
                ></div>

                {/* Si la cámara está activa, superponer línea láser guía */}
                {camaraIniciada && !camaraCargando && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                    <div className="w-64 h-64 border-2 border-dashed border-sky-400/80 rounded-3xl relative overflow-hidden shadow-[0_0_25px_rgba(56,189,248,0.25)]">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-pulse"></div>
                      <div className="absolute bottom-3 inset-x-0 text-center text-[10px] text-white/90 font-bold uppercase tracking-wider bg-black/50 py-1 backdrop-blur-xs">
                        Alinear QR en el marco
                      </div>
                    </div>
                  </div>
                )}

                {/* Indicador mientras la cámara se inicializa */}
                {camaraCargando && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-30 text-white">
                    <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
                    <span className="text-xs font-semibold text-sky-200">Iniciando sensor de cámara...</span>
                  </div>
                )}

                {/* Si la cámara no está activa, mostrar pantalla de bienvenida con botón explícito */}
                {!camaraIniciada && !camaraCargando && (
                  <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-white space-y-4 z-20">
                    <div className="w-16 h-16 rounded-3xl bg-white/10 text-sky-400 flex items-center justify-center mx-auto backdrop-blur-md border border-white/10 shadow-inner">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Lector de Cámara Web / Móvil</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                        Para escanear códigos impresos en computadoras, laptops o proyectores, habilita la cámara de tu equipo.
                      </p>
                    </div>
                    <button
                      onClick={() => activarCamara()}
                      disabled={camaraCargando}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 inline-flex items-center gap-2 transition transform hover:scale-105 cursor-pointer disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4" />
                      Habilitar Cámara Ahora
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* Alternativa: Subir Foto o Captura de Pantalla de QR */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-slate-800 text-xs">Escanear desde Archivo o Imagen</h4>
                </div>
                <span className="text-[10px] text-slate-400">JPG, PNG, WebP</span>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-4 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl bg-slate-50/70 hover:bg-blue-50/40 text-center cursor-pointer transition"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <div id="qr-file-reader-hidden" className="hidden"></div>
                <p className="text-xs font-semibold text-slate-700">Haz clic aquí para seleccionar o arrastrar una foto con código QR</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Decodifica automáticamente sin necesidad de cámara web</p>
              </div>

              {errorSubida && (
                <div className="mt-2 text-rose-600 text-xs font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errorSubida}
                </div>
              )}
            </div>

            {/* Ingreso Manual de Respaldo */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
              <h4 className="font-bold text-slate-800 text-xs mb-1">Ingreso Manual por Hash o Código Patrimonial</h4>
              <p className="text-[11px] text-slate-500 mb-3">Digita el código impreso al pie de la etiqueta del equipo:</p>

              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: QR-COL-LAP-002 o hash UUID"
                  value={codigoManual}
                  onChange={(e) => setCodigoManual(e.target.value)}
                  className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition"
                >
                  Consultar <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>

          {/* Columna Derecha: Accesos Directos de Prueba y Escaneos Recientes */}
          <div className="space-y-5">
            
            {/* Códigos de Prueba Instantáneos del Colegio */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-slate-800 text-xs">Acceso Rápido a Equipos</h4>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">Haz clic en cualquier dispositivo para consultar su ficha técnica inmediatamente:</p>

              <div className="space-y-2">
                {catalogoQR.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/ficha/${item.codigo_hash}`)}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 bg-slate-50/70 hover:bg-blue-50/50 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-slate-800 text-xs group-hover:text-blue-600 transition">
                        {item.nombre}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.codigo_patrimonial} • {item.ubicacion}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition" />
                  </div>
                ))}
              </div>
            </div>

            {/* Historial de Escaneos Recientes */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs">Escaneos Recientes</h4>
                {historialEscaneos.length > 0 && (
                  <button
                    onClick={() => {
                      setHistorialEscaneos([]);
                      localStorage.removeItem('historial_qr_escaneos');
                    }}
                    className="text-[10px] text-slate-400 hover:text-rose-600 font-medium"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {historialEscaneos.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Aún no has escaneado ningún código en esta sesión.
                </div>
              ) : (
                <div className="space-y-2">
                  {historialEscaneos.map((h, idx) => (
                    <div 
                      key={idx}
                      onClick={() => navigate(`/ficha/${h.hash}`)}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between cursor-pointer text-xs"
                    >
                      <div className="font-mono font-bold text-blue-600 text-[11px] truncate max-w-[150px]">
                        {h.hash}
                      </div>
                      <span className="text-[10px] text-slate-400">{h.fecha}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 4. PESTAÑA: CATÁLOGO DE ETIQUETAS Y ROTULACIÓN MASIVA */}
      {tabActiva === 'catalogo' && (
        <div className="space-y-4">
          
          {/* Filtros de Catálogo */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between print:hidden">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por código, equipo o serie..."
                value={busquedaEtiquetas}
                onChange={(e) => setBusquedaEtiquetas(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/30 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
              >
                <option value="todos">Todos los tipos</option>
                <option value="computadora">Computadora</option>
                <option value="laptop">Laptop</option>
                <option value="proyector">Proyector</option>
                <option value="tablet">Tablet</option>
                <option value="impresora">Impresora</option>
              </select>

              <input
                type="text"
                placeholder="Filtrar por sede..."
                value={filtroUbicacion}
                onChange={(e) => setFiltroUbicacion(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 w-36"
              />
            </div>
          </div>

          {/* Pliego Imprimible de Rótulos / Stickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-2 print:gap-4">
            {etiquetasFiltradas.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between print:border-slate-800 print:shadow-none"
              >
                <div>
                  {/* Encabezado del Rótulo Institucional */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                    <div>
                      <div className="text-[10px] font-black tracking-wider text-blue-700 uppercase">
                        Colegio UCV • Patrimonio
                      </div>
                      <div className="text-[9px] text-slate-500 font-medium">Control de Activo Escolar</div>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded uppercase">
                      {item.tipo}
                    </span>
                  </div>

                  {/* Cuerpo del Sticker: QR + Datos */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-24 h-24 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs flex-shrink-0 flex items-center justify-center">
                      <img 
                        src={item.qr_imagen_base64} 
                        alt={`QR ${item.codigo_patrimonial}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cód. Patrimonial</div>
                      <div className="font-mono font-black text-sm text-slate-900 tracking-tight mb-1 truncate">
                        {item.codigo_patrimonial}
                      </div>
                      <div className="font-bold text-xs text-slate-800 leading-tight mb-1 truncate" title={item.nombre}>
                        {item.nombre}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {item.marca} • {item.modelo}
                      </div>
                      <div className="text-[10px] font-semibold text-blue-600 mt-1 truncate">
                        📍 {item.ubicacion}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones de la etiqueta (Ocultas en impresión) */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 print:hidden text-xs">
                  <a
                    href={item.qr_imagen_base64}
                    download={`QR_${item.codigo_patrimonial}.png`}
                    className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar PNG
                  </a>

                  <Link
                    to={`/ficha/${item.codigo_hash}`}
                    className="text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver Ficha
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* 5. PESTAÑA: SIMULADOR DE FICHA TÉCNICA MÓVIL */}
      {tabActiva === 'simulador' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Columna Izquierda: Selector de Equipo para el Simulador */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Simulador de Experiencia del Alumno / Docente</h3>
                  <p className="text-[11px] text-slate-500">Comprueba cómo se visualiza la ficha técnica al escanear desde un celular</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Selecciona un dispositivo para proyectar su Ficha Móvil:
                </label>
                <select
                  value={simuladorEquipo?.equipo_id || ''}
                  onChange={(e) => {
                    const eq = catalogoQR.find(c => String(c.equipo_id) === String(e.target.value));
                    if (eq) setSimuladorEquipo(eq);
                  }}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium bg-white"
                >
                  {catalogoQR.map((item) => (
                    <option key={item.id} value={item.equipo_id}>
                      {item.nombre} ({item.codigo_patrimonial}) - {item.ubicacion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-blue-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Acceso Público Escolar sin Credenciales
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Cualquier miembro de la institución puede escanear el rótulo físico para verificar si el equipo está autorizado, a qué laboratorio pertenece y su estado de mantenimiento.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to={`/ficha/${simuladorEquipo?.codigo_hash || ''}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir Ficha en Pantalla Completa
                </Link>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Mockup de Smartphone con la Ficha Digital */}
          <div className="flex justify-center">
            <div className="w-[300px] h-[580px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col">
              
              {/* Altavoz / Notch superior del móvil */}
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
              </div>

              {/* Pantalla del Teléfono */}
              <div className="flex-1 bg-slate-50 rounded-[32px] overflow-y-auto overflow-x-hidden p-4 text-slate-800 text-xs space-y-3.5 select-none">
                
                {/* Cabecera Móvil */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-2xl shadow-sm text-center">
                  <div className="text-[9px] uppercase font-bold tracking-wider text-blue-200">Institución Educativa UCV</div>
                  <div className="font-black text-sm mt-0.5">{simuladorEquipo?.nombre || 'Dispositivo'}</div>
                  <div className="text-[10px] font-mono text-white/80">{simuladorEquipo?.codigo_patrimonial}</div>
                </div>

                {/* Código QR Miniatura */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center shadow-2xs">
                  <img 
                    src={simuladorEquipo?.qr_imagen_base64} 
                    alt="QR" 
                    className="w-24 h-24 mx-auto object-contain"
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-500 mt-1 block">
                    Hash: {simuladorEquipo?.codigo_hash}
                  </span>
                </div>

                {/* Especificaciones Rápidas */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2 text-[11px] shadow-2xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estado</span>
                    <span className="font-bold text-emerald-600 capitalize">{simuladorEquipo?.estado || 'Operativo'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tipo</span>
                    <span className="font-semibold text-slate-700 capitalize">{simuladorEquipo?.tipo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Marca/Modelo</span>
                    <span className="font-semibold text-slate-700">{simuladorEquipo?.marca} {simuladorEquipo?.modelo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sede</span>
                    <span className="font-semibold text-blue-600">📍 {simuladorEquipo?.ubicacion}</span>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <span className="text-[10px] text-slate-400">Sistema Escolar QR • Verificado</span>
                </div>

              </div>

              {/* Botón inferior home bar */}
              <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mt-2"></div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
