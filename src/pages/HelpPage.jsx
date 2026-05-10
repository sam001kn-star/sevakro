import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';

export default function HelpPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    base44.entities.AppContent.filter({ page: 'help' }).then(rows => {
      setContent(rows?.[0]?.content || '');
      setLoading(false);
    }).catch(() => { setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      <div className="flex items-center gap-3 px-4 py-4 bg-card border-b border-border">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <HelpCircle className="w-5 h-5 text-muted-foreground" />
        <h1 className="font-semibold">Help & Support</h1>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Contact Info */}
        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold">Contact Support</p>
          <p className="text-xs text-muted-foreground">📧 support@pulsecare.in</p>
          <p className="text-xs text-muted-foreground">📞 +91 98765 43210</p>
          <p className="text-xs text-muted-foreground">🕐 Available 8 AM – 8 PM, Mon–Sat</p>
        </Card>

        {/* FAQs */}
        <div>
          <p className="text-sm font-semibold mb-2">Frequently Asked Questions</p>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <Card key={i} className="overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-medium">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-3 text-xs text-muted-foreground">{faq.a}</div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Custom content from admin */}
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : content ? (
          <div className="prose prose-sm max-w-none text-foreground">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const faqs = [
  { q: 'How do I book a service?', a: 'Go to Home, browse services, tap on a service and fill in the booking details.' },
  { q: 'Can I cancel my appointment?', a: 'Yes, you can cancel from your Bookings page before the staff is assigned.' },
  { q: 'How does the referral program work?', a: 'Share your referral code with friends. When they register using your code, both of you get ₹100 wallet credit.' },
  { q: 'What payment methods are accepted?', a: 'We accept Cash on Delivery (COD) and UPI payments.' },
  { q: 'How do I track my staff?', a: 'Once a staff is assigned and marks themselves online, you can see their live location in your booking details.' },
];