import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowDownToLine, ArrowUpRight, BookOpen, Check, CheckCheck, ChevronLeft, ChevronRight, CircleHelp, Flag, LayoutList, MessageSquare, Search, ShieldCheck, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import './styles.css';

const labels = ['acceptable', 'toxic', 'spam'];
const names = { all: 'All comments', acceptable: 'Acceptable', toxic: 'Toxic', spam: 'Spam', pending: 'Pending' };
const threshold = 0.6;
const payload = JSON.parse(document.getElementById('report-data').textContent);
const rows = payload.comments.map(row => ({ ...row, result: payload.results[String(row.id)] }));
const initialCounts = Object.fromEntries(labels.map(label => [label, rows.filter(row => row.result?.choice === label).length]));
const processed = rows.filter(row => row.result).length;
const lowCount = rows.filter(row => row.result && row.result.confidence < threshold).length;
const pending = rows.length - processed;

function Label({ label }) {
  return <Badge variant="outline" className={`status-badge label-${label}`}><span className="size-1.5 rounded-full bg-current" />{names[label]}</Badge>;
}

function App() {
  useEffect(() => { document.getElementById('report-fallback').hidden = true; }, []);
  const [label, setLabel] = useState('all');
  const [query, setQuery] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  const [sort, setSort] = useState('original');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState('10');
  const [guide, setGuide] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const found = rows.filter(row => (label === 'all' || (row.result?.choice ?? 'pending') === label)
      && (!lowOnly || (row.result && row.result.confidence < threshold))
      && `${row.id} ${row.author} ${row.thread} ${row.comment}`.toLowerCase().includes(term));
    if (sort === 'confidence') found.sort((a, b) => (a.result?.confidence ?? 2) - (b.result?.confidence ?? 2) || a.id - b.id);
    if (sort === 'newest') found.sort((a, b) => b.posted_at.localeCompare(a.posted_at) || b.id - a.id);
    return found;
  }, [label, query, lowOnly, sort]);
  const size = pageSize === 'all' ? Math.max(rows.length, 1) : Number(pageSize);
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * size;
  const visible = filtered.slice(start, start + size);
  function changeLabel(value) { setLabel(value); setPage(1); }
  function reset() { setLabel('all'); setQuery(''); setLowOnly(false); setSort('original'); setPage(1); }
  function exportResults() {
    try {
      const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'clef-review-results.json';
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportMessage('Results download started.');
    } catch { setExportMessage('Download unavailable. The original results.json is available in your project folder.'); }
  }
  return <div className="report-layout">
    <aside className="sidebar" aria-label="Workspace navigation">
      <div className="flex items-center gap-2.5 px-2"><div className="flex size-9 items-center justify-center rounded-xl bg-primary text-white"><ShieldCheck size={21} strokeWidth={1.7} /></div><div><div className="text-lg font-semibold tracking-tight">clef<span className="text-primary">.</span></div><div className="text-[10px] font-medium tracking-[.09em] text-muted-foreground uppercase">Review workspace</div></div></div>
      <div className="desktop-nav mt-11"><p className="px-3 text-[10px] font-semibold tracking-[.13em] text-muted-foreground uppercase">Workspace</p>
        <nav className="mt-3 space-y-1">
          <button onClick={reset} aria-current={!lowOnly ? 'page' : undefined} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium ${!lowOnly ? 'bg-[#f0edfc] text-primary' : 'text-muted-foreground hover:bg-muted'}`}><LayoutList size={17} />All comments<span className="ml-auto text-[11px]">{rows.length}</span></button>
          <button onClick={() => { reset(); setLowOnly(true); }} aria-current={lowOnly ? 'page' : undefined} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium ${lowOnly ? 'bg-[#f0edfc] text-primary' : 'text-muted-foreground hover:bg-muted'}`}><Flag size={17} />Low confidence<span className="ml-auto text-[11px]">{lowCount}</span></button>
          <button onClick={() => setGuide(!guide)} aria-expanded={guide} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-muted-foreground hover:bg-muted"><BookOpen size={17} />Review guide<ArrowUpRight size={13} className="ml-auto" /></button>
        </nav>
        <div className="mt-9 border-t pt-6 px-3"><p className="text-[10px] font-semibold tracking-[.13em] text-muted-foreground uppercase">Current dataset</p><p className="mt-3 text-xs font-medium leading-5">{payload.course || 'Forum comments'}</p><p className="mt-2 text-[11px] leading-5 text-muted-foreground">{payload.forum}</p></div>
      </div>
      <div className="desktop-nav mt-auto pt-12"><div className="rounded-xl border bg-[#fafafe] p-4"><div className="flex items-center gap-2 text-xs font-medium"><span className="size-1.5 rounded-full bg-emerald-500" />{processed === rows.length ? 'Classification complete' : 'Classification in progress'}</div><div className="mt-3 h-1 overflow-hidden rounded bg-secondary"><div className="h-full rounded bg-primary" style={{width: `${processed / rows.length * 100}%`}} /></div><p className="mt-2 text-[11px] text-muted-foreground">{processed} of {rows.length} comments processed</p></div><p className="mt-5 px-2 text-[10px] text-muted-foreground">Powered by Cloudflare Workers AI</p></div>
    </aside>
    <main className="workspace">
      <div className="mb-8 flex items-center justify-between text-xs text-muted-foreground"><div className="flex items-center gap-2"><span>Workspace</span><ChevronRight size={12} /><span className="text-foreground">Comment review</span></div><Badge variant="outline" className="gap-1.5 bg-white px-2.5 py-1 font-normal"><Sparkles size={12} className="text-primary" />{payload.model}</Badge></div>
      <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-[28px] font-semibold tracking-[-.035em] sm:text-[32px]">Comment review</h1><p className="mt-1.5 text-sm text-muted-foreground">A little clarity for every conversation. Review your forum’s AI classifications.</p></div><div className="page-actions flex items-center gap-2 pt-1"><Button variant="outline" size="sm" onClick={() => setGuide(!guide)} aria-expanded={guide} className="bg-white"><CircleHelp size={15} />Guide</Button><Button size="sm" onClick={exportResults}><ArrowDownToLine size={15} />Export results</Button></div></div>
      <p className="sr-only" aria-live="polite">{exportMessage}</p>
      <div className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[{key:'all', title:'Total comments', count:rows.length, sub:`${processed} classified`, icon:MessageSquare, color:'text-primary', bg:'bg-[#f1edfd]'},
          {key:'acceptable',title:'Acceptable',count:initialCounts.acceptable,sub:'Constructive conversation',icon:CheckCheck,color:'text-emerald-600',bg:'bg-emerald-50'},
          {key:'toxic',title:'Toxic',count:initialCounts.toxic,sub:'Potentially harmful content',icon:ShieldCheck,color:'text-rose-500',bg:'bg-rose-50'},
          {key:'spam',title:'Spam',count:initialCounts.spam,sub:'Promotional or unsolicited',icon:Flag,color:'text-amber-600',bg:'bg-amber-50'}].map(stat => <Card key={stat.key} className={`gap-0 py-0 shadow-none transition-colors ${label === stat.key && !lowOnly ? 'border-[#bfb7e8]' : ''}`}><CardContent className="p-0"><button onClick={() => { changeLabel(stat.key); setLowOnly(false); }} className="w-full rounded-xl p-4 text-left sm:p-5" aria-label={`Show ${stat.title.toLowerCase()}`}><div className="flex items-center justify-between gap-2"><span className="text-xs font-medium text-muted-foreground">{stat.title}</span><span className={`flex size-8 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}><stat.icon size={16} /></span></div><div className="mt-3 flex items-baseline gap-2"><span className="text-[29px] leading-none font-semibold tracking-tight">{stat.count}</span>{stat.key !== 'all' && <span className="text-[11px] text-muted-foreground">{Math.round(stat.count / rows.length * 100)}%</span>}</div><p className="mt-2.5 text-[11px] text-muted-foreground">{stat.sub}</p></button></CardContent></Card>)}
      </div>
      <div className="mt-5 flex items-start gap-3 rounded-lg border border-[#e7e3f6] bg-[#f3f1fb] px-4 py-3 text-xs leading-5 text-[#686080]"><Sparkles size={15} className="mt-0.5 shrink-0 text-primary" /><p><span className="font-semibold text-[#4e456e]">AI predicts. You decide.</span> Review every comment, including confident predictions. Record your own corrections in <span className="font-medium">MISTAKES.md</span>.</p></div>
      {guide && <section aria-label="Review guide" className="mt-4 rounded-xl border bg-white p-5 text-sm leading-6"><div className="flex items-center justify-between"><h2 className="font-semibold">A quick guide to reviewing</h2><Button variant="ghost" size="icon" aria-label="Close review guide" onClick={() => setGuide(false)}><X size={16} /></Button></div><ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground"><li>Read the full comment and its thread context. Criticism is not automatically abuse.</li><li>Check the predicted label. Expand “Model details” to see all probabilities.</li><li>Record the ID, Clef’s label, your label, and your reasoning in MISTAKES.md.</li></ol><p className="mt-3 text-xs text-muted-foreground">“Low confidence” means a Clef confidence score below 0.60. Confidence is not a guarantee of correctness, and this view does not track your human review progress.</p></section>}
      <section className="mt-7 overflow-hidden rounded-xl border bg-white" aria-label="Forum comments">
        <div className="filters border-b px-4 pt-4 sm:px-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="relative min-w-0 flex-1 sm:max-w-[330px]"><Search className="absolute top-2.5 left-3 text-muted-foreground" size={15} /><Input aria-label="Search comments" placeholder="Search comments, authors, or IDs…" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} className="h-9 bg-[#fafbfc] pr-9 pl-9 text-xs shadow-none" />{query && <button className="absolute top-2.5 right-3 text-muted-foreground" aria-label="Clear search" onClick={() => {setQuery(''); setPage(1);}}><X size={14} /></button>}</div><div className="flex flex-wrap gap-2"><Button variant={lowOnly ? 'secondary' : 'outline'} size="sm" aria-pressed={lowOnly} onClick={() => { setLowOnly(!lowOnly); setPage(1); }} className="h-9 text-xs shadow-none"><SlidersHorizontal size={14} />Low confidence{lowOnly && <Check size={13} />}</Button><Select value={sort} onValueChange={value => {setSort(value); setPage(1);}}><SelectTrigger aria-label="Sort comments" className="h-9 w-[157px] text-xs shadow-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="original">Original order</SelectItem><SelectItem value="confidence">Lowest confidence</SelectItem><SelectItem value="newest">Newest first</SelectItem></SelectContent></Select></div></div>
        <Tabs value={label} onValueChange={changeLabel}><TabsList className="h-auto max-w-full justify-start gap-1 overflow-x-auto rounded-none bg-transparent p-0">{['all',...labels,...(pending ? ['pending'] : [])].map(key => <TabsTrigger key={key} value={key} className="relative h-10 shrink-0 rounded-none border-0 border-b-2 border-transparent px-3 text-xs text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">{names[key]}<span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px]">{key === 'all' ? rows.length : key === 'pending' ? pending : initialCounts[key]}</span></TabsTrigger>)}</TabsList></Tabs>
        </div>
        <div className="table-heading comment-row border-t-0 bg-[#fcfcfd] py-3 text-[10px] font-medium tracking-[.07em] text-muted-foreground uppercase"><div>Comment</div><div>Classification</div><div>Confidence</div></div>
        <div aria-live="polite" aria-atomic="false">
        {visible.map(row => <article key={row.id} id={`comment-${row.id}`} data-label={row.result?.choice ?? 'pending'} className="comment-row">
          <div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f0eef8] text-[9px] font-semibold text-[#85769f]" aria-hidden="true">{row.author.split(/\s+/).slice(0,2).map(word=>word[0]).join('')}</span><span className="text-xs font-semibold">{row.author}</span><span className="text-[10px] text-muted-foreground">#{row.id}</span><span className="text-[10px] text-muted-foreground">·</span><time className="text-[10px] text-muted-foreground">{row.posted_at}</time></div><p className="comment-copy">{row.comment}</p><div className="mt-3 flex flex-wrap items-start gap-x-4 gap-y-2"><span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground"><MessageSquare size={11} />{row.thread}</span>{row.result && <details className="text-[10px] text-muted-foreground"><summary className="cursor-pointer select-none hover:text-primary">Model details</summary><div className="mt-2 flex flex-wrap gap-3 rounded-lg bg-muted p-2.5">{labels.map(key => <span key={key}>{names[key]} <strong className="font-medium text-foreground">{(row.result.probabilities[key]*100).toFixed(1)}%</strong></span>)}</div></details>}</div></div>
          <div className="pt-0.5"><Label label={row.result?.choice ?? 'pending'} /></div>
          <div className="confidence-cell pt-1">{row.result ? <><div className="flex items-center gap-1.5 text-xs font-medium tabular-nums">{row.result.confidence.toFixed(3)}{row.result.confidence < threshold && <span title="Low confidence" aria-label="Low confidence"><Flag size={11} className="text-amber-600" /></span>}</div><div aria-hidden="true" className="mt-2 h-1 w-16 rounded-full bg-[#ecebf2]"><div className={`h-1 rounded-full ${row.result.confidence < threshold ? 'bg-amber-400' : 'bg-[#a29bc7]'}`} style={{width:`${row.result.confidence*100}%`}} /></div></> : <span className="text-xs text-muted-foreground">Awaiting result</span>}</div>
        </article>)}
        </div>
        {!visible.length && <div className="py-16 text-center"><Search size={26} className="mx-auto text-muted-foreground" /><h3 className="mt-4 text-sm font-semibold">No comments match your filters</h3><p className="mt-1 text-xs text-muted-foreground">Try a different search or reset the filters to start again.</p><Button variant="outline" size="sm" className="mt-4" onClick={reset}>Reset filters</Button></div>}
        <div className="pagination flex flex-wrap items-center justify-between gap-4 border-t px-5 py-4"><p className="text-[11px] text-muted-foreground" role="status">Showing <span className="font-medium text-foreground">{filtered.length ? start + 1 : 0}–{Math.min(start+size,filtered.length)}</span> of <span className="font-medium text-foreground">{filtered.length}</span> comments</p><div className="flex items-center gap-3"><Select value={pageSize} onValueChange={value => {setPageSize(value); setPage(1);}}><SelectTrigger aria-label="Comments per page" className="h-8 w-[105px] text-[11px] shadow-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="10">10 per page</SelectItem><SelectItem value="25">25 per page</SelectItem><SelectItem value="all">Show all</SelectItem></SelectContent></Select><span className="text-[11px] text-muted-foreground">{currentPage} / {pages}</span><div className="flex gap-1"><Button variant="outline" size="icon" className="size-8 shadow-none" aria-label="Previous page" disabled={currentPage===1} onClick={()=>setPage(currentPage-1)}><ChevronLeft size={14} /></Button><Button variant="outline" size="icon" className="size-8 shadow-none" aria-label="Next page" disabled={currentPage===pages} onClick={()=>setPage(currentPage+1)}><ChevronRight size={14} /></Button></div></div></div>
      </section>
      <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground"><span className="flex items-center gap-1.5"><Activity size={11} />Model predictions · Human review required</span><span>{payload.updated_at ? `Run completed ${new Date(payload.updated_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'})}` : 'Awaiting classification'}</span></footer>
    </main>
  </div>;
}

createRoot(document.getElementById('report-app')).render(<App />);
