/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Download,
  X,
  FileArchive,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  ExternalLink,
  Loader2,
  FolderArchive,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface DownloadProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadProjectModal: React.FC<DownloadProjectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { showSuccess, showError } = useToast();
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [isDownloadingTar, setIsDownloadingTar] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : '';
  const directZipUrl = `${currentHost}/aurelian-heights-academy.zip`;

  const handleBlobDownload = async (type: 'zip' | 'tar') => {
    const filename = type === 'zip' ? 'aurelian-heights-academy.zip' : 'aurelian-heights-academy.tar.gz';
    const url = type === 'zip' ? '/api/download-zip' : '/aurelian-heights-academy.tar.gz';
    const setter = type === 'zip' ? setIsDownloadingZip : setIsDownloadingTar;

    try {
      setter(true);
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const blob = await res.blob();
      if (blob.size < 1000) {
        throw new Error('Downloaded file appears incomplete.');
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(link);

      showSuccess(
        'Archive Downloaded',
        `Saved ${filename} (${(blob.size / 1024).toFixed(1)} KB)`
      );
    } catch (err: any) {
      showError('Download Notice', 'Browser blocked inline iframe download. Use the direct link below.');
    } finally {
      setter(false);
    }
  };

  const handleCopyDirectLink = async () => {
    try {
      await navigator.clipboard.writeText(directZipUrl);
      setCopiedLink(true);
      showSuccess('Link Copied', 'Direct download URL copied.');
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (e) {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-900 dark:text-neutral-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-[#242E56] flex items-center justify-between bg-neutral-50 dark:bg-[#0E152B]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base font-['Sora'] text-neutral-900 dark:text-white">
                Download Deployment Package
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Aurelian Heights Academy Complete Source Code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1A2347] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Windows extraction note */}
          <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-teal-500" />
            <div>
              <p className="font-semibold">Windows Extraction Notice Fixed</p>
              <p className="text-[11px] text-teal-800 dark:text-teal-200/80 mt-0.5 leading-relaxed">
                The archive includes standard Windows Explorer directory records, DOS attributes, and a top-level folder (<code className="bg-teal-500/20 px-1 rounded font-mono">aurelian-heights-academy/</code>) to extract properly in Windows 10/11 without wizard errors.
              </p>
            </div>
          </div>

          {/* Download Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Option 1: ZIP Archive */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020] space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <FileArchive className="w-4 h-4 text-indigo-500" />
                    <span>ZIP Package</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold">
                    ~264 KB
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  Best for Windows 10/11, Mac Finder, and WinRAR/7-Zip.
                </p>
              </div>

              <button
                onClick={() => handleBlobDownload('zip')}
                disabled={isDownloadingZip}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 disabled:opacity-50"
              >
                {isDownloadingZip ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Preparing Download...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .ZIP</span>
                  </>
                )}
              </button>
            </div>

            {/* Option 2: TAR.GZ Archive */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020] space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <FileArchive className="w-4 h-4 text-teal-500" />
                    <span>TAR.GZ Package</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 font-semibold">
                    ~214 KB
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  Best for Linux servers, Docker, and Cloud VPS deployments.
                </p>
              </div>

              <button
                onClick={() => handleBlobDownload('tar')}
                disabled={isDownloadingTar}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 disabled:opacity-50"
              >
                {isDownloadingTar ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Preparing Download...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .TAR.GZ</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Direct Browser Link */}
          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-100 dark:bg-[#1A2347]/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                <span>Direct Browser Download Link</span>
              </span>
              <button
                onClick={handleCopyDirectLink}
                className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Copied!' : 'Copy URL'}</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              If your browser blocks the embedded preview download, paste this URL in a new browser tab:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={directZipUrl}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-[#242E56] bg-white dark:bg-[#0B1020] text-neutral-800 dark:text-neutral-200 font-mono text-[11px] select-all"
              />
              <a
                href={directZipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-[#242E56] hover:bg-neutral-300 dark:hover:bg-[#313E72] text-xs font-semibold shrink-0 flex items-center gap-1"
              >
                <span>Open</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Terminal Guide */}
          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-900 text-neutral-200 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-neutral-400 font-semibold text-[11px]">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Extraction & Deployment Commands</span>
            </div>
            <pre className="font-mono text-[11px] text-neutral-300 overflow-x-auto p-2 rounded bg-black/40 space-y-1">
              <div><span className="text-neutral-500"># Windows PowerShell:</span></div>
              <div><span className="text-indigo-400">Expand-Archive</span> aurelian-heights-academy.zip .</div>
              <div><span className="text-neutral-500"># Or Linux/macOS/Git Bash:</span></div>
              <div><span className="text-teal-400">tar</span> -xzf aurelian-heights-academy.tar.gz</div>
              <div className="pt-1"><span className="text-neutral-500"># Start Application:</span></div>
              <div><span className="text-amber-400">cd</span> aurelian-heights-academy</div>
              <div><span className="text-teal-400">npm</span> install</div>
              <div><span className="text-teal-400">npm</span> run build</div>
              <div><span className="text-teal-400">npm</span> start</div>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0E152B] flex items-center justify-between">
          <div className="text-[11px] text-neutral-500">
            Admin: <span className="font-mono text-teal-500">saqibsb13b@gmail.com</span> | Pass: <span className="font-mono text-amber-500">@Saqibsb13b</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-neutral-200 dark:bg-[#1A2347] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-[#242E56] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
