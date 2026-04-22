import { Link } from "react-router-dom";
import { Shield, Wrench, Zap, CheckCircle, Phone, Star, ArrowRight, Home, Lock, Droplets, Building2 } from "lucide-react";
import { PLANS, WHATSAPP_URL } from "@/constants";
import { formatCurrency } from "@/lib/utils";
import heroBg from "@/assets/hero-bg.jpg";

const services = [
  { icon: Wrench, label: "Encanamento", desc: "Consertos e instalações hidráulicas" },
  { icon: Zap, label: "Elétrica", desc: "Instalações e reparos elétricos" },
  { icon: Building2, label: "Alvenaria", desc: "Reparos estruturais e reformas" },
  { icon: Lock, label: "Chaveiro", desc: "Abertura e troca de fechaduras" },
  { icon: Home, label: "Pintura", desc: "Pintura interna e externa" },
  { icon: Droplets, label: "Cobertura", desc: "Proteção contra enchentes e roubo" },
];

const testimonials = [
  { name: "Maria Aparecida", city: "São Paulo, SP", plan: "Plano Intermediário", text: "Quando minha cozinha alagou, o atendimento foi rápido e profissional. Em menos de 24h um encanador estava na minha casa.", rating: 5 },
  { name: "João Carlos", city: "Campinas, SP", plan: "Plano Premium", text: "A cobertura por roubo me salvou. Perdi meu notebook e recebi o ressarcimento em poucos dias. Vale muito a pena!", rating: 5 },
  { name: "Ana Paula", city: "Santos, SP", plan: "Plano Básico", text: "Serviço elétrico feito com qualidade. O eletricista foi super competente e rápido.", rating: 5 },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-sm">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 font-display leading-tight">Sua Proteção</p>
                <p className="text-xs text-slate-500">Reparo Certo</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#servicos" className="nav-link">Serviços</a>
              <a href="#planos" className="nav-link">Planos</a>
              <a href="#depoimentos" className="nav-link">Depoimentos</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors px-4 py-2 rounded-xl hover:bg-slate-50">
                Entrar
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-sm py-2 px-4"
              >
                Contratar
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0">
          <img src={heroBg} alt="Proteção Residencial" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm font-medium mb-8">
              <Shield className="w-4 h-4 text-brand-400" />
              Proteção residencial completa
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-display leading-tight mb-6">
              Seu lar sempre
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-300">
                protegido e em ordem
              </span>
            </h1>
            <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-xl">
              Assinatura mensal que dá acesso a serviços residenciais especializados e cobertura financeira para imprevistos. Encanamento, elétrica, roubo, enchente e muito mais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-base py-3.5 px-8 justify-center"
              >
                Contratar agora
                <ArrowRight className="w-5 h-5" />
              </a>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-base font-semibold text-white border-2 border-white/30 hover:bg-white/10 px-8 py-3.5 rounded-xl transition-all duration-200"
              >
                Já sou cliente
              </Link>
            </div>
            <div className="flex items-center gap-8 mt-12">
              {[["500+", "Clientes"], ["98%", "Satisfação"], ["24h", "Atendimento"]].map(([val, label]) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-white font-display">{val}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servicos" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 font-display mb-4">
              Tudo que seu lar precisa
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Profissionais qualificados para cada tipo de serviço, com atendimento ágil e garantido.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map((service) => (
              <div key={service.label} className="bg-white rounded-2xl p-6 text-center hover:shadow-md transition-all duration-200 border border-slate-100 hover:-translate-y-0.5 group">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-100 transition-colors">
                  <service.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{service.label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="planos" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 font-display mb-4">
              Escolha seu plano
            </h2>
            <p className="text-lg text-slate-500">
              Proteção completa para o seu perfil e orçamento.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 border-2 transition-all duration-200 hover:shadow-xl ${
                  plan.popular
                    ? "border-brand-500 bg-gradient-to-b from-brand-600 to-brand-800 text-white shadow-lg shadow-brand-500/20 scale-105"
                    : "border-slate-100 bg-white hover:border-slate-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                      ⭐ Mais Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-xl font-bold font-display mb-2 ${plan.popular ? "text-white" : "text-slate-900"}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-end gap-1 mb-1">
                    <span className={`text-4xl font-bold font-display ${plan.popular ? "text-white" : "text-brand-600"}`}>
                      {formatCurrency(plan.price)}
                    </span>
                    <span className={`text-sm mb-1 ${plan.popular ? "text-white/70" : "text-slate-500"}`}>/mês</span>
                  </div>
                  <p className={`text-sm ${plan.popular ? "text-white/80" : "text-slate-500"}`}>
                    Cobertura até {formatCurrency(plan.coverageLimit)}
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.popular ? "text-cyan-300" : "text-brand-500"}`} />
                      <span className={`text-sm ${plan.popular ? "text-white/90" : "text-slate-600"}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    plan.popular
                      ? "bg-white text-brand-700 hover:bg-brand-50"
                      : "bg-brand-600 hover:bg-brand-700 text-white"
                  }`}
                >
                  Contratar {plan.name}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 font-display mb-4">
              O que nossos clientes dizem
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {Array(t.rating).fill(null).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.city} · {t.plan}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-brand-700 to-brand-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white font-display mb-6">
            Pronto para proteger seu lar?
          </h2>
          <p className="text-xl text-brand-200 mb-10">
            Comece com o plano que melhor se adapta às suas necessidades.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-bold px-8 py-4 rounded-xl hover:bg-brand-50 transition-colors text-base shadow-lg"
            >
              <Phone className="w-5 h-5" />
              Falar com consultor
            </a>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors text-base"
            >
              Acessar minha conta
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white font-display">Sua Proteção | Reparo Certo</p>
                <p className="text-xs">Proteção residencial com assinatura</p>
              </div>
            </div>
            <p className="text-sm text-center">
              © {new Date().getFullYear()} Sua Proteção | Reparo Certo. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
