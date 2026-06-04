export default function TestPage() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-950">
      <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900 border border-slate-800 z-10 relative">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Test Page
        </h1>
        <p className="text-sm text-slate-400">
          If you can see this, styling works!
        </p>
        <button className="mt-4 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all">
          Click Me
        </button>
      </div>
    </div>
  )
}
