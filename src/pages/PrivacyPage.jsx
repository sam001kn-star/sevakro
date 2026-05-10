import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

export default function PrivacyPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.AppContent.filter({ page: 'privacy' }).then(rows => {
      setContent(rows?.[0]?.content || defaultPrivacy);
      setLoading(false);
    }).catch(() => { setContent(defaultPrivacy); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      <div className="flex items-center gap-3 px-4 py-4 bg-card border-b border-border">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <Shield className="w-5 h-5 text-emerald-600" />
        <h1 className="font-semibold">Privacy & Security</h1>
      </div>

      <div className="px-4 py-5">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="prose prose-sm max-w-none text-foreground">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

const defaultPrivacy = `## Privacy & Security Policy

**Last updated:** April 2026

### 1. Information We Collect
We collect information you provide when registering, booking services, or contacting us — including your name, email, phone number, and address.

### 2. How We Use Your Information
- To process and manage your healthcare bookings
- To assign qualified staff and doctors to your appointments
- To send you reminders and status updates
- To improve our services and user experience

### 3. Data Security
Your data is protected using industry-standard encryption. We do not sell or share your personal information with third parties without your consent.

### 4. Location Data
Location access is used only to assign nearby staff and for GPS tracking during active appointments. It is never stored permanently.

### 5. Your Rights
You may request deletion of your account and associated data at any time by contacting our support team.

### 6. Contact
For privacy-related concerns, email us at **privacy@pulsecare.in**
`;