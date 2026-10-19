"use client";
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Play,
  ArrowLeft,
  Zap,
  CheckCircle2,
  Clock,
  Share2,
  Bookmark,
  ExternalLink
} from 'lucide-react';

// List of demo videos
// NOTE: iframes only work with YouTube *embed* links (youtube.com/embed/VIDEO_ID),
// not with youtu.be / watch links.
const PLAYLIST = [
  {
    id: "demo-1",
    title: "Building Autonomous AI Agent Clusters with n8n & React Flow",
    description: "Learn how to architect a master-worker neural network using n8n webhooks, custom React Flow interfaces, and real-time LLM routing.",
    duration: "12:45",
    embedUrl: "https://www.youtube.com/embed/0rMMWOWVBo0",
    views: "14.2k",
    tag: "Neural Core"
  },
  {
    id: "demo-2",
    title: "Advanced Webhook Automation & Secure Credential Vaults",
    description: "Step-by-step walkthrough of setting up secure API keys, handling token authentications, and syncing production workflows.",
    duration: "08:20",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    views: "8.9k",
    tag: "Security"
  },
  {
    id: "demo-3",
    title: "Real-Time Execution Logs & Latency Optimization",
    description: "Discover how to track execution streams, debug node errors instantly, and scale your node memory cluster.",
    duration: "15:10",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    views: "11.5k",
    tag: "Performance"
  },
  {
    id: "demo-4",
    title: "Connecting External APIs: GitHub, Slack & Custom OCR",
    description: "Integrate third-party tools into your n8n pipelines with automated event listeners and custom parsers.",
    duration: "19:05",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    views: "22.1k",
    tag: "Integration"
  }
];

export default function N8nDemoPage() {
  const [selectedVideo, setSelectedVideo] = useState(PLAYLIST[0]);
  const playerRef = useRef(null);

  const handleSelect = (video) => {
    setSelectedVideo(video);
    // On phones the playlist sits below the player, so bring the player back into view
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Page link copied to clipboard!");
    } catch (e) {
      alert("Could not copy the link. Please copy it from the address bar.");
    }
  };

  return (
    // min-h-dvh = real visible height on mobile browsers
    <div className="min-h-dvh bg-slate-50 font-sans text-slate-800 flex flex-col overflow-x-hidden">

      {/* Top Header */}
      <header className="flex items-center justify-between gap-3 px-4 sm:px-8 py-3 sm:py-4 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/workflows" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors shrink-0 p-1 -ml-1">
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
          <div className="hidden sm:block h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Zap size={14} className="text-white fill-white" />
            </div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-tight text-slate-900 truncate">FlowAI Video Demos</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 sm:px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="sm:hidden">Live</span>
            <span className="hidden sm:inline">Live Tutorials</span>
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* Left Column: Video Player & Details */}
        <div ref={playerRef} className="lg:col-span-2 flex flex-col gap-4 sm:gap-5 min-w-0 scroll-mt-20">

          {/* Video Player Container */}
          <div className="relative w-full aspect-video bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl border border-slate-800">
            <iframe
              key={selectedVideo.id}
              src={selectedVideo.embedUrl}
              title={selectedVideo.title}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          {/* Video Meta Info */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-black uppercase tracking-wider">
                {selectedVideo.tag}
              </span>
              <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold text-slate-400">
                <span>{selectedVideo.views} Views</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {selectedVideo.duration}</span>
              </div>
            </div>

            <h1 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {selectedVideo.title}
            </h1>

            <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
              {selectedVideo.description}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Includes Source Code & Workflow Templates</span>
              </div>
              <div className="grid grid-cols-2 sm:flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => alert("Added to your saved tutorials!")}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <Bookmark size={14} />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Playlist & Demo Selection */}
        <div className="flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Project Walkthroughs</h3>
            <span className="text-xs font-bold text-slate-400">{PLAYLIST.length} Videos</span>
          </div>

          <div className="flex flex-col gap-3">
            {PLAYLIST.map((video) => {
              const isSelected = selectedVideo.id === video.id;
              return (
                <button
                  type="button"
                  key={video.id}
                  onClick={() => handleSelect(video)}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex gap-3 sm:gap-3.5 items-start ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-md shadow-blue-500/10'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Play size={18} className="fill-current" />
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">{video.tag}</span>
                    <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${isSelected ? 'text-blue-900 font-black' : 'text-slate-800'}`}>
                      {video.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-semibold text-slate-400">
                      <span>{video.duration}</span>
                      <span>•</span>
                      <span>{video.views} views</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Support Card */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white shadow-lg mt-2">
            <h4 className="text-xs font-black uppercase tracking-wider mb-1">Need Custom n8n Setup?</h4>
            <p className="text-[11px] text-slate-300 font-medium mb-3">Explore full source code repositories and connect automated webhooks instantly.</p>
            <Link
              href="/workflows"
              className="flex sm:inline-flex w-full sm:w-auto justify-center items-center gap-1.5 px-4 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <span>Open Workflow Builder</span>
              <ExternalLink size={13} />
            </Link>
          </div>

        </div>

      </main>
    </div>
  );
}