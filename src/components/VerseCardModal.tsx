import { useState } from 'react';
import { X, Copy, Share2, Check, Download, Sparkles } from 'lucide-react';
import { VERSE_CARDS_DESIGNS } from '../data/dailyContent';

interface VerseCardModalProps {
  verse: {
    text: string;
    book: string;
    chapter: number;
    verseNum: number;
    translation: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VerseCardModal({ verse, isOpen, onClose }: VerseCardModalProps) {
  const [selectedDesign, setSelectedDesign] = useState(VERSE_CARDS_DESIGNS[0]);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [textAlignment, setTextAlignment] = useState<'text-center' | 'text-left' | 'text-right'>('text-center');

  if (!isOpen || !verse) return null;

  const fullReference = `${verse.book} ${verse.chapter}:${verse.verseNum} (${verse.translation})`;
  const shareText = `"${verse.text}"\n\n— ${fullReference}\nShared via IGWT Bible (by Ayokunle)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'IGWT Bible Verse',
          text: shareText,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadMock = () => {
    // Generate a simple simulated download file containing the verse design
    const element = document.createElement("a");
    const file = new Blob([shareText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `igwt_bible_verse_${verse.book}_${verse.chapter}_${verse.verseNum}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" id="verse-card-modal">
      <div className="relative w-full max-w-md overflow-hidden bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-400" />
            <h3 className="font-sans font-semibold text-lg text-zinc-100">Design Verse Card</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Card Preview */}
          <div 
            id="share-card-canvas"
            className={`relative p-8 rounded-2xl ${selectedDesign.bgClass} flex flex-col justify-between min-h-[260px] shadow-lg transition-all duration-300`}
          >
            {/* Minimal top logo branding */}
            <div className="flex justify-between items-center opacity-40 text-[10px] uppercase tracking-widest text-zinc-400 font-mono">
              <span>IGWT BIBLE</span>
              <span>IN GOD WE TRUST</span>
            </div>

            {/* Verse text */}
            <div className={`my-6 text-zinc-100 ${textAlignment} ${selectedDesign.textClass} text-xl md:text-2xl leading-relaxed font-serif`}>
              “{verse.text}”
            </div>

            {/* Reference and footer credit */}
            <div className="mt-4 flex flex-col items-center">
              <p className="font-sans font-medium text-sm text-gold-400 tracking-wide">{fullReference}</p>
              <span className="mt-1 font-mono text-[9px] text-zinc-500 tracking-wider">ayox.my.id • Ayokunle</span>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="space-y-2">
            <label className="font-sans font-medium text-xs text-zinc-400 uppercase tracking-widest">Select Card Style</label>
            <div className="grid grid-cols-2 gap-2">
              {VERSE_CARDS_DESIGNS.map((design) => (
                <button
                  key={design.id}
                  onClick={() => setSelectedDesign(design)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm text-left transition-all ${
                    selectedDesign.id === design.id
                      ? 'border-gold-500 bg-gold-500/5 text-gold-400'
                      : 'border-zinc-900 bg-zinc-900/30 text-zinc-400 hover:bg-zinc-900/60'
                  }`}
                >
                  <span className="truncate">{design.title}</span>
                  {selectedDesign.id === design.id && <Check className="w-4 h-4 text-gold-400 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Text Alignment Selector */}
          <div className="space-y-2">
            <label className="font-sans font-medium text-xs text-zinc-400 uppercase tracking-widest">Text Alignment</label>
            <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-900">
              <button
                onClick={() => setTextAlignment('text-left')}
                className={`flex-1 py-1.5 text-xs rounded-lg transition-colors ${textAlignment === 'text-left' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Left
              </button>
              <button
                onClick={() => setTextAlignment('text-center')}
                className={`flex-1 py-1.5 text-xs rounded-lg transition-colors ${textAlignment === 'text-center' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Center
              </button>
              <button
                onClick={() => setTextAlignment('text-right')}
                className={`flex-1 py-1.5 text-xs rounded-lg transition-colors ${textAlignment === 'text-right' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Right
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              onClick={handleCopy}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 transition-all gap-1.5"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400 animate-bounce" /> : <Copy className="w-5 h-5" />}
              <span className="text-xs font-sans">{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/20 text-gold-400 hover:text-gold-300 transition-all gap-1.5"
            >
              {shared ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
              <span className="text-xs font-sans">{shared ? 'Shared' : 'Share'}</span>
            </button>

            <button
              onClick={handleDownloadMock}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 transition-all gap-1.5"
            >
              <Download className="w-5 h-5" />
              <span className="text-xs font-sans">Save Text</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
