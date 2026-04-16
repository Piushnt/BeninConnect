import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Trash2, CheckCircle2, X } from 'lucide-react';
import { motion } from 'motion/react';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  onCancel: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onCancel }) => {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clear = () => {
    sigCanvas.current?.clear();
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) {
      alert('Veuillez apposer votre signature.');
      return;
    }
    const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
    if (dataUrl) onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5"
      >
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Signature Numérique</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Apposez votre griffe officielle</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-8 bg-gray-50/50 dark:bg-black/20">
          <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-gray-800 overflow-hidden h-64 relative">
            <SignatureCanvas 
              ref={sigCanvas}
              penColor="currentColor"
              canvasProps={{
                className: "sigCanvas w-full h-full text-slate-900 dark:text-white",
              }}
            />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none">
              Zone de signature
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-white/5 flex gap-4">
          <button 
            onClick={clear}
            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Effacer
          </button>
          <button 
            onClick={save}
            className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Confirmer
          </button>
        </div>
      </motion.div>
    </div>
  );
};
