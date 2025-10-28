import { Icon } from "@iconify/react";

export default function AgencyDisabled() {
  return (
    <div className="fixed overflow-auto inset-0 bg-gradient-to-br from-blue-50 via-white to-sky-50 dark:from-gray-900 dark:via-slate-800 dark:to-blue-900 flex items-center justify-center p-4 md:p-6 z-50">
      {/* Decorative floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-200/30 dark:bg-blue-400/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-40 -right-40 w-80 h-80 bg-sky-200/30 dark:bg-sky-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-indigo-100/30 dark:bg-indigo-400/15 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-20 w-60 h-60 bg-cyan-100/20 dark:bg-cyan-400/15 rounded-full blur-2xl animate-blob animation-delay-6000"></div>
      </div>

      {/* ➡️ WRAPPER: Responsive padding, no scroll */}
      <div className="w-full max-w-3xl px-4 md:px-8 overflow-auto">
        {/* ➡️ CARD: No scroll, responsive padding, elegant spacing */}
        <div className="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-blue-500/10 dark:shadow-blue-400/20 p-6  w-full text-center border border-blue-100/50 dark:border-slate-600/50 ring-1 ring-blue-200/20 dark:ring-slate-500/20">

          {/* Status Badge */}
          {/* STATUS BADGE */}
          <div className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-blue-100 to-sky-100 dark:from-blue-800/50 dark:to-sky-800/50 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold mb-4 border border-blue-200/50 dark:border-blue-600/50 shadow-sm">
            <Icon icon="material-symbols:brightness-alert-outline" className="w-5 h-5 mr-2 animate-pulse" />
            Domain Disabled
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 dark:from-blue-400 dark:via-sky-400 dark:to-indigo-400 bg-clip-text text-transparent  leading-tight">
            Access Temporarily Restricted
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300  max-w-2xl mx-auto leading-relaxed mb-4 px-2">
            Your domain is currently inactive. Contact our support team — we'll help you get back online quickly.
          </p>

          {/* Support Options — Adjusted for medium/large screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 px-2">
            <a
              href="mailto:support@yourcompany.com"
              className="group bg-gradient-to-br from-blue-50 to-sky-50 dark:from-slate-700/50 dark:to-blue-800/30 hover:from-blue-100 hover:to-sky-100 dark:hover:from-slate-600/60 dark:hover:to-blue-700/40 p-5 md:p-6 rounded-2xl border border-blue-200/50 dark:border-slate-600/50 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/20 hover:-translate-y-1"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-700/50 dark:to-blue-600/50 text-blue-600 dark:text-blue-300 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:from-blue-200 group-hover:to-blue-300 dark:group-hover:from-blue-600/60 dark:group-hover:to-blue-500/60 transition-all duration-300 shadow-md">
                <Icon icon="material-symbols:mail-outline" className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1 text-base md:text-lg">Email Support</h3>
           <div className="w-full flex items-center justify-center px-2">
  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium text-center break-words max-w-full">
    {`support@iata.com`}
  </p>
</div>
            </a>
            <a
              href="tel:+1-800-123-4567"
              className="group bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-slate-700/50 dark:to-sky-800/30 hover:from-sky-100 hover:to-cyan-100 dark:hover:from-slate-600/60 dark:hover:to-sky-700/40 p-5 md:p-6 rounded-2xl border border-sky-200/50 dark:border-slate-600/50 hover:border-sky-300 dark:hover:border-sky-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/10 dark:hover:shadow-sky-400/20 hover:-translate-y-1"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-700/50 dark:to-sky-600/50 text-sky-600 dark:text-sky-300 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:from-sky-200 group-hover:to-sky-300 dark:group-hover:from-sky-600/60 dark:group-hover:to-sky-500/60 transition-all duration-300 shadow-md">
                <Icon icon="material-symbols:call" className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1 text-base md:text-lg">Call Support</h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">+1 (800) 123-4567</p>
            </a>

            <a
              href="#chat"
              className="group bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-700/50 dark:to-indigo-800/30 hover:from-indigo-100 hover:to-blue-100 dark:hover:from-slate-600/60 dark:hover:to-indigo-700/40 p-5 md:p-6 rounded-2xl border border-indigo-200/50 dark:border-slate-600/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-400/20 hover:-translate-y-1"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-700/50 dark:to-indigo-600/50 text-indigo-600 dark:text-indigo-300 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:from-indigo-200 group-hover:to-indigo-300 dark:group-hover:from-indigo-600/60 dark:group-hover:to-indigo-500/60 transition-all duration-300 shadow-md">
                <Icon icon="material-symbols:chat-outline-rounded" className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1 text-base md:text-lg">Live Chat</h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">Chat with us now</p>
            </a>
          </div>

          {/* Info Footer */}
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-slate-700/50 dark:to-blue-800/30 rounded-xl p-4 md:p-5 border border-blue-200/50 dark:border-slate-600/50 shadow-inner mx-auto max-w-lg">
            <p className="text-gray-700 dark:text-gray-300 text-xs md:text-sm mb-2 font-medium">
              <strong className="text-blue-700 dark:text-blue-300">Support Hours:</strong> Mon–Fri, 12 pm – 9 PM EST
            </p>
            <div className="flex items-center justify-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400">
              <div className="w-2 h-2 bg-emerald-400 dark:bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
              <span className="font-medium">Support team is online and ready to help</span>
            </div>
          </div>

          {/* Floating dots */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-3xl">
            <div className="absolute top-6 left-6 w-1.5 h-1.5 bg-blue-300 dark:bg-blue-400 rounded-full animate-bounce delay-300"></div>
            <div className="absolute top-16 right-6 w-1 h-1 bg-sky-300 dark:bg-sky-400 rounded-full animate-bounce delay-700"></div>
            <div className="absolute bottom-12 left-12 w-2 h-2 bg-indigo-200 dark:bg-indigo-400 rounded-full animate-bounce delay-1000"></div>
          </div>

          {/* Subtle inner glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/5 via-transparent to-sky-400/5 dark:from-blue-400/10 dark:via-transparent dark:to-sky-400/10 pointer-events-none"></div>
        </div>
      </div>

      {/* Branding */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <p className="text-gray-400 dark:text-gray-500 text-xs font-medium">
          Powered by <span className="text-blue-500 dark:text-blue-400 font-bold bg-gradient-to-r from-blue-500 to-sky-500 dark:from-blue-400 dark:to-sky-400 bg-clip-text text-transparent">IATA.com</span>
        </p>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          25% { transform: translate(20px, -20px) scale(1.1) rotate(90deg); }
          50% { transform: translate(0, 20px) scale(0.9) rotate(180deg); }
          75% { transform: translate(-20px, 0) scale(1.05) rotate(270deg); }
        }
        .animate-blob {
          animation: blob 8s infinite ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
    </div>
  );
}