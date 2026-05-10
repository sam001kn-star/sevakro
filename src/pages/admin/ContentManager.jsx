import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

const PAGES = ['privacy', 'help'];

export default function ContentManager() {
  const [records, setRecords] = useState({});
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  useEffect(() => {
    Promise.all(PAGES.map(p => base44.entities.AppContent.filter({ page: p }))).then(results => {
      const rec = {};
      const draft = {};
      results.forEach((rows, i) => {
        rec[PAGES[i]] = rows?.[0] || null;
        draft[PAGES[i]] = rows?.[0]?.content || '';
      });
      setRecords(rec);
      setDrafts(draft);
      setLoading(false);
    });
  }, []);

  const save = async (page) => {
    setSaving(s => ({ ...s, [page]: true }));
    try {
      if (records[page]) {
        await base44.entities.AppContent.update(records[page].id, { content: drafts[page] });
      } else {
        const created = await base44.entities.AppContent.create({ page, content: drafts[page] });
        setRecords(r => ({ ...r, [page]: created }));
      }
      toast.success(`${page.charAt(0).toUpperCase() + page.slice(1)} content saved!`);
    } catch {
      toast.error('Failed to save.');
    }
    setSaving(s => ({ ...s, [page]: false }));
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Edit the content shown on the Privacy & Security and Help & Support pages. Supports Markdown.</p>
      <Tabs defaultValue="privacy">
        <TabsList className="w-full mb-3">
          <TabsTrigger value="privacy" className="flex-1 text-xs">Privacy & Security</TabsTrigger>
          <TabsTrigger value="help" className="flex-1 text-xs">Help & Support</TabsTrigger>
        </TabsList>
        {PAGES.map(page => (
          <TabsContent key={page} value={page} className="space-y-2">
            <textarea
              className="w-full h-80 border border-input rounded-lg px-3 py-2 text-sm font-mono resize-y bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              value={drafts[page]}
              onChange={e => setDrafts(d => ({ ...d, [page]: e.target.value }))}
              placeholder={`Enter ${page} page content in Markdown...`}
            />
            <Button size="sm" className="gap-2" onClick={() => save(page)} disabled={saving[page]}>
              {saving[page] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Save
            </Button>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}