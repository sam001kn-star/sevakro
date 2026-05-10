import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileCode, FileJson, FileCog, File, Copy, Check, Code2, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const FRONTEND = {
  "App.jsx": "Main router and auth logic",
  "main.jsx": "App entry point",
  "index.css": "Global styles and design tokens",
  "api": {
    "base44Client.js": "Pre-initialized Base44 SDK client"
  },
  "utils": {
    "index.ts": "Utility helpers"
  },
  "lib": {
    "CustomAuthContext.jsx": "Custom auth context/provider",
    "AuthContext.jsx": "Auth context",
    "authService.js": "Login, register, session logic",
    "customAuth.js": "Password hashing, localStorage session",
    "otpService.js": "OTP generation, email dispatch, verification",
    "pushService.js": "Push notification subscription logic",
    "reminderEngine.js": "Appointment reminder scheduling logic",
    "app-params.js": "App-wide parameters/config",
    "query-client.js": "React Query client instance",
    "utils.js": "Tailwind class merge utility",
    "PageNotFound.jsx": "404 page component"
  },
  "hooks": {
    "useRoleManifest.js": "Sets PWA manifest based on user role",
    "useReminderScheduler.js": "Schedules reminder checks for admin",
    "usePushSubscription.js": "Manages push subscription state",
    "usePushNotifications.js": "Browser notification permission hook",
    "usePWA.js": "PWA install prompt hook",
    "useGPS.js": "GPS/geolocation hook",
    "use-mobile.jsx": "Mobile breakpoint detection hook"
  },
  "pages": {
    "Home.jsx": "Patient home / service discovery",
    "Bookings.jsx": "User bookings list",
    "WalletPage.jsx": "Wallet & transactions",
    "Profile.jsx": "User profile & settings",
    "LocationSearch.jsx": "Address/location search",
    "Doctors.jsx": "Doctor listing",
    "BookService.jsx": "Service booking flow",
    "FamilyMembers.jsx": "Manage family members",
    "SavedAddresses.jsx": "Saved address management",
    "NotificationsPage.jsx": "Push notifications page",
    "PrivacyPage.jsx": "Privacy policy page",
    "HelpPage.jsx": "Help & support page",
    "VerifyEmail.jsx": "Email verification page",
    "staff": {
      "StaffPortal.jsx": "Staff dashboard portal"
    },
    "doctor": {
      "DoctorPortal.jsx": "Doctor dashboard portal"
    },
    "admin": {
      "AdminDashboard.jsx": "Main admin hub with tabs",
      "StaffVerification.jsx": "Verify/approve staff accounts",
      "StaffTracking.jsx": "Live staff location tracking",
      "ServiceManagement.jsx": "CRUD for services",
      "PromoManager.jsx": "Promo codes management",
      "AppointmentReminders.jsx": "Manual/auto reminder triggers",
      "ContentManager.jsx": "Privacy & Help page content editor",
      "ThemeManager.jsx": "App theme color editor",
      "PushNotificationManager.jsx": "Send push notifications to users",
      "GitHubPushManager.jsx": "Bulk push files to GitHub",
      "FileStructureViewer.jsx": "This file structure viewer"
    }
  },
  "components": {
    "auth": {
      "AuthScreen.jsx": "Role picker + patient login/register",
      "StaffAuthScreen.jsx": "Staff login/register",
      "DoctorAuthScreen.jsx": "Doctor login/register",
      "OtpVerifyScreen.jsx": "OTP 6-digit verification UI"
    },
    "layout": {
      "UserLayout.jsx": "Wrapper layout with bottom nav",
      "BottomNav.jsx": "Mobile bottom navigation bar",
      "TopBar.jsx": "Top navigation bar"
    },
    "services": {
      "HeroSection.jsx": "Home page hero banner",
      "ServiceGrid.jsx": "Grid of service cards",
      "ServiceCard.jsx": "Individual service card"
    },
    "booking": {
      "BookingCard.jsx": "Individual booking card"
    },
    "doctors": {
      "DoctorCard.jsx": "Individual doctor card"
    },
    "notifications": {
      "PushOptInBanner.jsx": "Push notification opt-in banner"
    },
    "pwa": {
      "InstallAppSheet.jsx": "PWA install bottom sheet",
      "InstallButton.jsx": "User app install button",
      "StaffInstallButton.jsx": "Staff app install button",
      "DoctorInstallButton.jsx": "Doctor app install button",
      "GPSPrompt.jsx": "GPS permission prompt"
    },
    "ui": {
      "button.jsx": "Button component",
      "input.jsx": "Input component",
      "card.jsx": "Card component",
      "tabs.jsx": "Tabs component",
      "dialog.jsx": "Dialog component",
      "badge.jsx": "Badge component",
      "select.jsx": "Select component",
      "textarea.jsx": "Textarea component",
      "label.jsx": "Label component",
      "switch.jsx": "Switch component",
      "calendar.jsx": "Calendar component",
      "popover.jsx": "Popover component",
      "skeleton.jsx": "Skeleton loader",
      "separator.jsx": "Separator component",
      "toast.jsx": "Toast component",
      "toaster.jsx": "Toaster provider",
      "sonner.jsx": "Sonner toast",
      "scroll-area.jsx": "Scroll area",
      "sheet.jsx": "Bottom sheet",
      "avatar.jsx": "Avatar component",
      "progress.jsx": "Progress bar",
      "accordion.jsx": "Accordion component",
      "alert.jsx": "Alert component",
      "alert-dialog.jsx": "Alert dialog"
    }
  },
  "public": {
    "manifest.json": "PWA manifest (user app)",
    "manifest-staff.json": "PWA manifest (staff)",
    "manifest-doctor.json": "PWA manifest (doctor)",
    "sw.js": "Service worker (caching + push)"
  }
};

const BACKEND = {
  "entities": {
    "UserAuth.json": "Custom auth users — email, password_hash, role, OTP, referral fields",
    "Appointment.json": "Appointments — type, status, scheduling, payment, staff/doctor assignment",
    "Service.json": "Service catalog — title, price, category, rating, service_type",
    "Staff.json": "Staff profiles — specialization, verification_status, GPS location, rating",
    "Doctor.json": "Doctor profiles — specialization, qualification, available_slots, fee",
    "FamilyMember.json": "Family members — relation, age, gender, medical_notes",
    "Address.json": "Saved addresses — label, full_address, lat/lng, is_default",
    "WalletTransaction.json": "Wallet transactions — type (credit/debit), amount, source",
    "PromoCode.json": "Promo codes — discount_type, value, validity, usage limits",
    "PushSubscription.json": "Push subscriptions — endpoint, p256dh, auth key per user",
    "AppContent.json": "CMS content — privacy & help page markdown",
    "ReminderLog.json": "Reminder logs — tracks sent appointment reminders"
  },
  "integrations": {
    "Core.InvokeLLM": "AI text/JSON generation via LLM",
    "Core.SendEmail": "Transactional email delivery",
    "Core.UploadFile": "File upload to storage (returns URL)",
    "Core.GenerateImage": "AI image generation",
    "Core.ExtractDataFromUploadedFile": "Extract structured data from CSV/PDF/image",
    "EmailJS": "OTP email delivery via @emailjs/browser"
  },
  "auth": {
    "CustomAuthContext.jsx": "Session management — localStorage-based user state",
    "authService.js": "loginUser(), registerUser() — role-aware authentication",
    "customAuth.js": "hashPassword(), saveSession(), getSession()",
    "otpService.js": "generateAndSendOtp(), verifyOtp(), verifyLoginOtp()"
  },
  "scheduled_logic": {
    "useReminderScheduler.js": "Polls every 5 min (admin only) to send appointment reminders",
    "reminderEngine.js": "Checks appointments 1hr & 24hr before — sends emails to patient+staff+doctor"
  },
  "push_notifications": {
    "pushService.js": "subscribeToPush() — registers browser push subscription",
    "usePushSubscription.js": "Hook to manage subscription state per user",
    "PushNotificationManager.jsx": "Admin UI to broadcast push to all/role-filtered users",
    "sw.js": "Service worker — handles push events and shows notifications"
  },
  "rls_rules": {
    "Service": "Read: active only (or admin). Write/Delete: admin only",
    "PromoCode": "Read: active only (or admin). Write/Delete: admin only",
    "AppContent": "Read: public. Write/Delete: admin only",
    "Staff": "Delete: admin only. Read/Write: open",
    "Doctor": "Delete: admin only. Read/Write: open",
    "UserAuth": "Delete: admin only. Read/Write: open",
    "WalletTransaction": "Delete: admin only. Read/Write: open",
    "Appointment": "Create: open. Read/Update/Delete: no RLS"
  }
};

const FULL_JSON = { frontend: FRONTEND, backend: BACKEND };

function getFileIcon(name) {
  if (name.endsWith('.json')) return <FileJson className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
  if (name.endsWith('.jsx') || name.endsWith('.tsx')) return <FileCode className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
  if (name.endsWith('.js') || name.endsWith('.ts')) return <FileCog className="w-3.5 h-3.5 text-yellow-500 shrink-0" />;
  if (name.endsWith('.css')) return <File className="w-3.5 h-3.5 text-pink-500 shrink-0" />;
  return <File className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
}

function TreeNode({ name, value, depth = 0 }) {
  const isFolder = typeof value === 'object';
  const [open, setOpen] = useState(depth < 1);

  if (!isFolder) {
    return (
      <div className="flex items-center gap-2 py-0.5 px-2 rounded hover:bg-muted/60 group" style={{ paddingLeft: `${depth * 14 + 8}px` }}>
        {getFileIcon(name)}
        <span className="text-xs font-mono text-foreground">{name}</span>
        <span className="text-xs text-muted-foreground hidden group-hover:block truncate">— {value}</span>
      </div>
    );
  }

  const childCount = Object.keys(value).length;

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 py-0.5 px-2 rounded hover:bg-muted/60 w-full text-left"
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        {open ? <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />}
        {open ? <FolderOpen className="w-3.5 h-3.5 text-primary shrink-0" /> : <Folder className="w-3.5 h-3.5 text-primary shrink-0" />}
        <span className="text-xs font-mono font-semibold text-foreground">{name}/</span>
        <span className="text-xs text-muted-foreground ml-1">{childCount} items</span>
      </button>
      {open && (
        <div>
          {Object.entries(value).map(([k, v]) => (
            <TreeNode key={k} name={k} value={v} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function countAll(obj) {
  let count = 0;
  for (const v of Object.values(obj)) {
    if (typeof v === 'object') count += countAll(v);
    else count++;
  }
  return count;
}

function CopyButton({ data, label }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    toast.success(`${label} JSON copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 text-xs h-7">
      {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : `Copy ${label} JSON`}
    </Button>
  );
}

function StructurePanel({ title, icon, data, label, accentColor }) {
  const count = countAll(data);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/50 px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2 font-mono">
            {icon} pulsecare / {title.toLowerCase()}
          </span>
          <span className="text-xs text-muted-foreground">• {count} items</span>
        </div>
        <CopyButton data={data} label={label} />
      </div>
      <div className="p-2 max-h-72 overflow-y-auto">
        {Object.entries(data).map(([k, v]) => (
          <TreeNode key={k} name={k} value={v} depth={0} />
        ))}
      </div>
    </div>
  );
}

export default function FileStructureViewer() {
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(FULL_JSON, null, 2));
    setCopied(true);
    toast.success('Full project JSON copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-base">Project Structure</h2>
          <p className="text-xs text-muted-foreground">Frontend + Backend • Hover files for descriptions</p>
        </div>
        <Button size="sm" onClick={copyAll} className="gap-1.5 text-xs h-8">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy Full JSON'}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Code2 className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-semibold">Frontend</span>
      </div>
      <StructurePanel title="Frontend" icon={<Code2 className="w-3 h-3 text-blue-500" />} data={FRONTEND} label="Frontend" />

      <div className="flex items-center gap-2 mt-2">
        <Server className="w-4 h-4 text-green-600" />
        <span className="text-sm font-semibold">Backend</span>
      </div>
      <StructurePanel title="Backend" icon={<Server className="w-3 h-3 text-green-600" />} data={BACKEND} label="Backend" />
    </div>
  );
}