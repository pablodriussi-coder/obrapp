
import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { ConstructionState } from '../types';
import { Download, Upload, Database, FileSpreadsheet, RefreshCw, AlertTriangle } from 'lucide-react';

interface BackupSettingsProps {
  state: ConstructionState;
  setState: React.Dispatch<React.SetStateAction<ConstructionState>>;
}

const BackupSettings: React.FC<BackupSettingsProps> = ({ state, setState }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Contratistas
    const contractorsWS = XLSX.utils.json_to_sheet(state.contractors);
    XLSX.utils.book_append_sheet(wb, contractorsWS, "Contratistas");

    // Obras
    const projectsWS = XLSX.utils.json_to_sheet(state.projects);
    XLSX.utils.book_append_sheet(wb, projectsWS, "Obras");

    // Certificados
    const certificatesWS = XLSX.utils.json_to_sheet(state.certificates);
    XLSX.utils.book_append_sheet(wb, certificatesWS, "Certificados");

    // Pagos
    const paymentsWS = XLSX.utils.json_to_sheet(state.payments);
    XLSX.utils.book_append_sheet(wb, paymentsWS, "Pagos");

    XLSX.writeFile(wb, `ObraApp_Backup_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const importFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const bstr = e.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      
      const newState: ConstructionState = {
        contractors: [],
        projects: [],
        certificates: [],
        payments: []
      };

      try {
        if (wb.SheetNames.includes("Contratistas")) {
          newState.contractors = XLSX.utils.sheet_to_json(wb.Sheets["Contratistas"]);
        }
        if (wb.SheetNames.includes("Obras")) {
          newState.projects = XLSX.utils.sheet_to_json(wb.Sheets["Obras"]);
        }
        if (wb.SheetNames.includes("Certificados")) {
          newState.certificates = XLSX.utils.sheet_to_json(wb.Sheets["Certificados"]);
        }
        if (wb.SheetNames.includes("Pagos")) {
          newState.payments = XLSX.utils.sheet_to_json(wb.Sheets["Pagos"]);
        }

        if (confirm("¿Estás seguro de restaurar este backup? Se sobrescribirán los datos actuales.")) {
          setState(newState);
          alert("Backup restaurado con éxito.");
        }
      } catch (error) {
        alert("Error al procesar el archivo Excel. Verifica el formato.");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Configuración y Backup</h2>
        <p className="text-slate-500">Gestiona la integridad y respaldo de tus datos de obra.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Export Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <Download size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Exportar Backup Excel</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Descarga un archivo .xlsx completo con todas las tablas del sistema. Ideal para auditorías externas o copias de seguridad manuales.
          </p>
          <button 
            onClick={exportToExcel}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
          >
            <FileSpreadsheet size={20} />
            Descargar Backup
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
            <Upload size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Importar Backup Excel</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Restaura datos desde un archivo Excel previamente exportado. Esto reemplazará la base de datos local actual.
          </p>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={importFromExcel} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
          >
            <RefreshCw size={20} />
            Cargar Archivo
          </button>
        </div>
      </div>

      {/* Database Status Card */}
      <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-lg">
            <div className="flex items-center gap-3 mb-4">
              <Database className="text-blue-400" />
              <span className="text-xs font-black uppercase tracking-widest text-blue-400">Database Status</span>
            </div>
            <h3 className="text-3xl font-black mb-4 leading-tight">Supabase Ready</h3>
            <p className="text-slate-400 leading-relaxed mb-6">
              Esta aplicación está diseñada para ser conectada directamente a Supabase. Ya cuentas con los esquemas SQL necesarios para la migración a la nube.
            </p>
            <div className="flex flex-wrap gap-4">
               <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/5 text-xs font-bold">
                 SQLite / LocalStorage: Activo
               </div>
               <div className="px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-xs font-bold text-emerald-400 flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                 Sincronización Disponible
               </div>
            </div>
          </div>
          <div className="hidden lg:block opacity-10 scale-150 rotate-12">
            <Database size={240} />
          </div>
        </div>
        
        {/* Warning Section */}
        <div className="mt-10 pt-10 border-t border-white/5 flex items-start gap-4">
          <AlertTriangle className="text-amber-500 shrink-0" size={24} />
          <p className="text-sm text-slate-500 italic">
            Atención: Al cargar un archivo Excel, el sistema intentará mapear las columnas por nombre. Asegúrate de no modificar los encabezados del archivo exportado para garantizar la compatibilidad.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackupSettings;
