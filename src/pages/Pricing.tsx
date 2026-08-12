import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Check, Zap, ShieldCheck, Sparkles, CreditCard, ArrowRight, HelpCircle } from 'lucide-react';
import { PUBLIC_PLANS, getUserSubscription, simulateServerVerifiedCheckout } from '../lib/billing/billingApi';
import { useAuth } from '../context/AuthContext';
import type { UserSubscription, SubscriptionPlanId } from '../types/phase5';

export default function Pricing() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user?.id) {
      getUserSubscription(user.id).then(setSubscription);
    }
  }, [user]);

  const handleUpgrade = async (planId: SubscriptionPlanId) => {
    if (planId === 'free') return;
    setLoading(true);
    setMsg(null);

    const userId = user?.id || 'demo_user_123';
    const res = await simulateServerVerifiedCheckout(userId, planId);

    setLoading(false);
    if (res.success) {
      setMsg({ type: 'success', text: res.message });
      setSubscription({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        cancel_at_period_end: false,
      });
    } else {
      setMsg({ type: 'error', text: res.message });
    }
  };

  const currentPlanId = subscription?.plan_id || 'free';

  return (
    <div className="min-h-screen bg-[#062B3D] text-white py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Study Hub Pricing & Plans | Intelligent Learning Platform</title>
        <meta
          name="description"
          content="Transparent subscription plans for Study Hub. Choose Free, Plus, or Pro for advanced AI tutoring, adaptive exam simulation, and deep analytics."
        />
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#5CE1E6]" /> Fair & Transparent Pricing
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Invest in Your Academic Excellence
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Our free tier will <strong className="text-white">always</strong> provide meaningful education with official PYQ banks and roadmap resources. Upgrade for unlimited AI coaching, grounded RAG tutoring, and realistic exam simulation.
          </p>

          {/* Current plan banner & AI Usage Meter */}
          {user && (
            <div className="mt-6 p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-[#5CE1E6]">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-slate-400">Current Plan:</span>{' '}
                  <strong className="text-white uppercase font-bold">{currentPlanId}</strong>
                </div>
              </div>
              <div className="w-full md:w-auto flex items-center gap-4">
                <div className="text-left">
                  <div className="flex items-center justify-between gap-6 text-[11px] text-slate-300">
                    <span>StudyMate Daily Usage</span>
                    <span className="font-bold text-[#5CE1E6]">
                      14 / {currentPlanId === 'pro' ? 500 : currentPlanId === 'plus' ? 100 : 30} Requests
                    </span>
                  </div>
                  <div className="w-48 h-2 rounded-full bg-slate-800 overflow-hidden mt-1">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full w-[46%]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {msg && (
            <div
              className={`p-4 rounded-2xl text-xs font-medium border ${
                msg.type === 'success'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              }`}
            >
              {msg.text}
            </div>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PUBLIC_PLANS.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            const isPopular = plan.badge === 'Popular';

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 transition-all flex flex-col justify-between ${
                  isPopular
                    ? 'bg-gradient-to-b from-[#093D56] to-[#062B3D] border-2 border-[#5CE1E6] shadow-2xl shadow-cyan-500/10 scale-105'
                    : 'bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#5CE1E6] text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-md">
                    {plan.badge}
                  </span>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">
                        {plan.priceMonthly === 0 ? 'Free' : `₹${plan.priceMonthly}`}
                      </span>
                      {plan.priceMonthly > 0 && <span className="text-xs text-slate-400">/ month</span>}
                    </div>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#5CE1E6] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs cursor-default"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={loading}
                      className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        isPopular
                          ? 'bg-[#5CE1E6] text-slate-950 hover:bg-cyan-300 shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      {plan.id === 'free' ? 'Current Free Tier' : `Upgrade to ${plan.name}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Product Guarantee */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Academic Trust Guarantee</h4>
              <p>No dark patterns. Cancel anytime with one click in settings. Official learning materials remain accessible.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold cursor-pointer hover:underline">
            <HelpCircle className="w-4 h-4" /> Read Billing FAQ <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
