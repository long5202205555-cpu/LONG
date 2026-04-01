import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Cpu, Database, RefreshCcw, Lock, Globe, Key, ShieldCheck, BadgeCheck, Code, Server, Zap } from 'lucide-react';

/**
 * Missouri Document Discriminator (DD) Logic Simulator v3.5
 * Expanded: AAMVA Barcode Generator & Fusion Gateway Explorer
 */

const App = () => {
  const [dlNumber, setDlNumber] = useState('C211295026');
  const [issueDate, setIssueDate] = useState('2025-11-17');
  const [issueType, setIssueType] = useState('0001');
  const [generatedDd, setGeneratedDd] = useState('');
  const [logs, setLogs] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState('idle');
  const [activeTab, setActiveTab] = useState('generator');

  // Forensic Constants from User Files
  const PUBLIC_KEY_FINGERPRINT = 'bd9347ed4fd5a43a4860948c41e4cf5d0914ab5c602f98b8f81afc81db378776';
  const SERIAL_NUMBER = '0B:AF:25:59:0C:56:F5:99:78:D9:08:8B:21:E1:92:0D';
  const FUSION_DNS = 'extws-fusion.mo.gov';

  const getLetterCode = (letter) => {
    if (!letter) return '00';
    const charCode = letter.toUpperCase().charCodeAt(0) - 64;
    return charCode.toString().padStart(2, '0');
  };

  const generateLogic = () => {
    const newLogs = [...logs];
    if (newLogs.length > 3) newLogs.shift();

    const match = dlNumber.match(/^([A-Z])(\d+)/i);
    const letter = match ? match[1] : '';
    const digits = match ? match[2] : dlNumber;

    const letterPrefix = getLetterCode(letter);
    const digitSlice = digits.substring(0, 3);
    const prefix = `${letterPrefix}${digitSlice}`;

    const dateObj = new Date(issueDate);
    const month = (dateObj.getUTCMonth() + 2).toString().padStart(2, '0'); // Applying Month+1 logic
    const year = dateObj.getUTCFullYear().toString().slice(-2);
    const dateBlock = `${month}${year}`;

    const finalDd = `${prefix}${dateBlock}${issueType}`;
    setGeneratedDd(finalDd);
    setVerifyStatus('idle');
    setLogs(newLogs);
  };

  const simulateVerification = () => {
    setIsVerifying(true);
    setVerifyStatus('idle');
    setLogs((prev) => [...prev, `[FUSION] Attempting TLS handshake with ${FUSION_DNS}...`]);

    setTimeout(() => {
      setIsVerifying(false);
      setVerifyStatus('success');
      setLogs((prev) => [...prev, '[PKI] RSA-4096 Public Key Validated.']);
      setLogs((prev) => [...prev, `[DLDV] Record ${dlNumber} Verified as ACTIVE.`]);
    }, 2000);
  };

  const getBarcodeString = () => {
    const dateFormatted = issueDate.replace(/-/g, '');
    return `@
ANSI 636000100102DL00410278
DLDAQ${dlNumber}
DCF${generatedDd}
DBD${dateFormatted}
DCGUSA
`;
  };

  useEffect(() => {
    generateLogic();
  }, [dlNumber, issueDate, issueType]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-400 flex items-center gap-2">
              <Cpu className="w-8 h-8" />
              MO-DD SYSTEM 3.5
            </h1>
            <p className="text-slate-400 mt-1 uppercase text-[10px] tracking-widest font-mono italic">Unified Forensics & AAMVA Gateway</p>
          </div>
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg shadow-inner overflow-x-auto max-w-full">
            {['generator', 'explorer', 'security', 'extensions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all uppercase tracking-tighter whitespace-nowrap ${
                  activeTab === tab ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="md:col-span-4 space-y-6">
              <Card className="bg-slate-900 border-slate-800 shadow-2xl relative">
                <CardHeader className="bg-slate-800/30 border-b border-slate-800">
                  <CardTitle className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase">
                    <Database className="w-4 h-4 text-emerald-500" />
                    Issuance Config
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500 uppercase font-bold">License #</Label>
                    <Input value={dlNumber} onChange={(e) => setDlNumber(e.target.value)} className="bg-slate-950 border-slate-700 text-emerald-400 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500 uppercase font-bold">Issue Date</Label>
                    <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="bg-slate-950 border-slate-700 text-slate-200 font-mono" />
                  </div>
                  <Button onClick={simulateVerification} disabled={isVerifying} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2 font-bold mt-4">
                    {isVerifying ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    VERIFY VIA FUSION
                  </Button>
                </CardContent>
              </Card>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
                <p className="text-[10px] text-slate-400 italic">Connected to mydmv2.mo.gov Secure Gateway</p>
              </div>
            </div>

            <div className="md:col-span-8 space-y-6">
              <Card className="bg-slate-900 border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-8">
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.6em] font-bold">Document Discriminator (DCF)</p>
                  <div className="flex items-center gap-6">
                    <div className="text-6xl md:text-8xl font-mono font-black text-emerald-400 tabular-nums">{generatedDd || '----------'}</div>
                    {verifyStatus === 'success' && <BadgeCheck className="w-12 h-12 text-emerald-500" />}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-950 border-slate-800 h-32 overflow-y-auto p-4 font-mono text-[10px] space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-emerald-900">#</span>
                    <span className={log.includes('Verified') ? 'text-emerald-400' : 'text-slate-500'}>{log}</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'explorer' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="md:col-span-7 space-y-6">
              <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
                <CardHeader className="bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                  <CardTitle className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                    <Code className="w-4 h-4 text-emerald-500" />
                    PDF417 Barcode Payload
                  </CardTitle>
                  <span className="text-[9px] font-mono text-emerald-500 bg-slate-950 px-2 py-1 rounded">AAMVA V2020</span>
                </CardHeader>
                <CardContent className="p-0">
                  <pre className="p-8 bg-slate-950 text-emerald-500/80 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre">
                    {getBarcodeString()}
                    ... [ENCODED BIOMETRIC DATA] ...
                    ... [RESTRICTED SUBFILE DATA] ...
                  </pre>
                  <div className="p-4 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-500 italic">
                    This string represents the raw data extracted by law enforcement scanners (Level 2/3 validation).
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-5 space-y-6">
              <Card className="bg-slate-900 border-slate-800 h-full">
                <CardHeader className="bg-slate-800/50 border-b border-slate-800 py-3">
                  <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Server className="w-3 h-3 text-emerald-500" /> Fusion Gateway Map
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950 rounded border border-emerald-500/10 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-500">Target Node:</span>
                        <span className="text-emerald-400 font-bold">{FUSION_DNS}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-500">Service:</span>
                        <span className="text-emerald-400">DLDV Real-time Sync</span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-950 rounded border border-slate-800">
                      <p className="text-[9px] text-slate-600 uppercase font-bold mb-2">AAMVA Field Mappings</p>
                      <ul className="text-[10px] font-mono space-y-1 text-slate-400">
                        <li>
                          <span className="text-emerald-600">DAQ:</span> License Number
                        </li>
                        <li>
                          <span className="text-emerald-600">DCF:</span> Document Discriminator
                        </li>
                        <li>
                          <span className="text-emerald-600">DBD:</span> Document Issue Date
                        </li>
                        <li>
                          <span className="text-emerald-600">DCG:</span> Country Identification
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6">
            <Card className="bg-slate-900 border-slate-800 shadow-2xl overflow-hidden">
              <CardHeader className="bg-slate-800/50 border-b border-slate-800 px-8 py-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                  <CardTitle className="text-xl font-bold text-slate-200 uppercase tracking-tighter">Identity Fingerprint Audit</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-[10px] text-slate-500 uppercase font-bold italic underline decoration-slate-800 underline-offset-4">Certificate Serial</Label>
                  <div className="text-[11px] font-mono text-emerald-500 bg-slate-950 p-4 rounded border border-slate-800 break-all">{SERIAL_NUMBER}</div>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] text-slate-500 uppercase font-bold italic underline decoration-slate-800 underline-offset-4">
                    Public Key Fingerprint (Anchor)
                  </Label>
                  <div className="text-[11px] font-mono text-emerald-400 bg-slate-950 p-4 rounded border border-slate-800 break-all">{PUBLIC_KEY_FINGERPRINT}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'extensions' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <Card className="bg-slate-900 border-slate-800 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl">
              <div className="space-y-6">
                <Label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2">
                  <Globe className="w-4 h-4" /> DNS Alternative Names
                </Label>
                <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2 font-mono text-xs">
                  <div className="text-emerald-500">mydmv2.mo.gov</div>
                  <div className="text-emerald-700">extws-fusion.mo.gov</div>
                </div>
              </div>
              <div className="space-y-6">
                <Label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2">
                  <Key className="w-4 h-4" /> RSA 4096-bit Handshake
                </Label>
                <div className="bg-emerald-500/5 p-4 rounded border border-emerald-500/20 text-[11px] text-emerald-200/50 leading-relaxed italic">
                  All document discriminator verification traffic is encrypted using RSA SHA-256 with an exponent of 65537, as defined in the DigiCert Global G2
                  trust hierarchy.
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="text-center pt-8 opacity-40">
          <p className="text-slate-700 text-[9px] flex items-center justify-center gap-2 font-mono uppercase tracking-[0.5em]">
            <Lock className="w-3 h-3 text-emerald-900" />
            SYSTEM_3.5_SYNC // FUSION_ACTIVE // ANSI_ANSI_AAMVA
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
