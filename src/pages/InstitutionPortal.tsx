import { Helmet } from 'react-helmet-async';
import { Building2, Users, Shield, Globe, Award, ChevronRight } from 'lucide-react';
import { SAMPLE_ORGANIZATION } from '../lib/institution/institutionApi';

export default function InstitutionPortal() {
  return (
    <div className="min-h-screen bg-[#062B3D] text-white py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Study Hub for Institutions | College & Institute Operating System</title>
        <meta
          name="description"
          content="Enterprise adaptive learning operating system for colleges, universities, and coaching institutes."
        />
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-cyan-500/20 text-[#5CE1E6] border border-cyan-500/30">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Multi-Tenant Tenant</span>
              <h1 className="text-3xl font-black text-white">{SAMPLE_ORGANIZATION.name}</h1>
              <p className="text-slate-400 text-xs mt-0.5">Custom Tenant Slug: {SAMPLE_ORGANIZATION.slug}.studyhub.edu</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              {SAMPLE_ORGANIZATION.plan}
            </span>
          </div>
        </div>

        {/* Institution Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Enrolled Students</span>
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-white">1,284</div>
            <p className="text-[11px] text-slate-500">Across 6 Academic Batches</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Active Teachers / Mentors</span>
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-indigo-300">24</div>
            <p className="text-[11px] text-slate-500">Faculty Administrators</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Custom Domain</span>
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-emerald-400 truncate">abc.studyhub.edu</div>
            <p className="text-[11px] text-slate-500">SSO & White-Label Active</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Institution Pass Rate</span>
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">89.2%</div>
            <p className="text-[11px] text-slate-500">Target Exam Qualifications</p>
          </div>
        </div>

        {/* Tenant Configuration & Member Governance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Tenant Member Governance</span>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </h3>
            <p className="text-xs text-slate-400">
              Role-Based Access Control (RBAC) ensures strict data isolation between departments and academic branches.
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 flex justify-between">
                <span>Institution Admins</span>
                <span className="font-bold text-cyan-300">3 Members</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 flex justify-between">
                <span>Department Mentors</span>
                <span className="font-bold text-indigo-300">21 Members</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 flex justify-between">
                <span>Student Roster</span>
                <span className="font-bold text-emerald-300">1,284 Active</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Institution Settings & Customization</span>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </h3>
            <p className="text-xs text-slate-400">
              Configure domain routing, default syllabus roadmaps, and custom institute mock tests.
            </p>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Allow Direct Student Signup:</span>
                <span className="font-bold text-emerald-400">ENABLED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Multi-Tenant Data Isolation:</span>
                <span className="font-bold text-cyan-400">STRICT RLS ENFORCED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
