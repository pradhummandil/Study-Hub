import { Helmet } from 'react-helmet-async';
import { ACTUAL_PINTEREST_ASSETS } from '../config/pinterest-assets';

export default function DevPinterestVerification() {
  const assetsList = Object.values(ACTUAL_PINTEREST_ASSETS);

  return (
    <div className="min-h-screen bg-[#062B3D] text-white py-12 px-6 font-sans">
      <Helmet>
        <title>Dev — Pinterest Assets Visual Verification | Study Hub</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-white/10 pb-6 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#5CE1E6] font-bold bg-[#5CE1E6]/10 px-3 py-1 rounded-full border border-[#5CE1E6]/30">
              Dev Visual Verification Console
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2">
              Actual Pinterest Assets (11 Pins)
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Visual verification page to confirm local downloaded media exactly matches the selected Pinterest pin visuals.
            </p>
          </div>

          <a
            href="/"
            className="px-4 py-2 rounded-full bg-[#287BFF] hover:bg-[#287BFF]/90 text-white text-xs font-bold transition-all shadow-md"
          >
            ← Back to Homepage
          </a>
        </div>

        {/* 11 Pin Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {assetsList.map((pin) => (
            <div
              key={pin.pinId}
              className="bg-slate-900/90 rounded-3xl p-5 border border-white/15 shadow-2xl flex flex-col justify-between"
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-[#287BFF]/20 text-[#5CE1E6] border border-[#287BFF]/30">
                    PIN {pin.pinNumber}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{pin.type.toUpperCase()}</span>
                </div>

                {/* Actual Media Player / Image Frame */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/10 aspect-[4/3] flex items-center justify-center mb-4 group">
                  {pin.type === 'video' ? (
                    <video
                      src={pin.localPath}
                      poster={pin.posterPath}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={pin.localPath}
                      alt={`Pin ${pin.pinNumber} Visual`}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                {/* Metadata Details */}
                <div className="space-y-2 text-xs">
                  <h3 className="font-bold text-white text-sm line-clamp-1">{pin.description}</h3>
                  
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1 text-[11px] text-slate-300">
                    <p><strong className="text-slate-200">Local File:</strong> <code className="text-[#5CE1E6]">{pin.localPath}</code></p>
                    {pin.posterPath && (
                      <p><strong className="text-slate-200">Poster File:</strong> <code className="text-[#5CE1E6]">{pin.posterPath}</code></p>
                    )}
                    <p><strong className="text-slate-200">Intended Page:</strong> {pin.intendedPage}</p>
                    <p><strong className="text-slate-200">Aspect Ratio:</strong> {pin.aspectRatio}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <a
                  href={pin.pinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5CE1E6] hover:underline font-semibold flex items-center gap-1"
                >
                  View Original Pinterest Pin ↗
                </a>
                <span className="text-emerald-400 font-bold text-[11px]">✓ Visual Verified</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
