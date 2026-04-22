import { Link } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-brand-600" />
        </div>
        <h1 className="text-6xl font-bold text-slate-900 font-display mb-4">404</h1>
        <p className="text-xl font-semibold text-slate-700 mb-2">Página não encontrada</p>
        <p className="text-slate-500 mb-8">A página que você está procurando não existe ou foi movida.</p>
        <Link to="/" className="btn-primary justify-center inline-flex">
          <ArrowLeft size={18} />
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
