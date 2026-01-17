import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";
import {
  Bell,
  Shield,
  Palette,
  Users,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

type SettingsSection =
  | "account"
  | "notifications"
  | "privacy"
  | "appearance"
  | "billing";

export const Route = createFileRoute("/settings/")({
  component: SettingsPage,
});

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("account");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
  });
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    allowMessages: true,
    showOnlineStatus: true,
  });
  const [appearance, setAppearance] = useState({
    darkMode: false,
    compactView: false,
  });

  const menuItems = [
    { id: "account", label: "Account", icon: Users },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "billing", label: "Billing", icon: Users },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account preferences
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <nav className="space-y-1 rounded-lg border border-border bg-card p-2">
              {menuItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id as SettingsSection)}
                  className={`w-full flex items-center justify-between rounded-md px-4 py-3 text-left text-sm font-medium transition-colors ${
                    activeSection === id
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                  {activeSection === id && <ChevronRight className="h-4 w-4" />}
                </button>
              ))}
            </nav>
          </aside>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {/* Account Settings */}
            {activeSection === "account" && (
              <Card className="bg-card p-6">
                <h2 className="mb-6 text-2xl font-bold text-foreground">
                  Account Settings
                </h2>
                <div className="space-y-6">
                  <SettingField label="Email" value="john@example.com" />
                  <SettingField label="Username" value="johndoe" />
                  <SettingField label="Phone" value="+1 (555) 123-4567" />
                  <hr className="border-border" />
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </Card>
            )}

            {/* Notifications Settings */}
            {activeSection === "notifications" && (
              <Card className="bg-card p-6">
                <h2 className="mb-6 text-2xl font-bold text-foreground">
                  Notification Preferences
                </h2>
                <div className="space-y-6">
                  <ToggleField
                    label="Email Notifications"
                    description="Receive notifications via email"
                    checked={notifications.email}
                    onChange={(checked) =>
                      setNotifications({ ...notifications, email: checked })
                    }
                  />
                  <ToggleField
                    label="Push Notifications"
                    description="Receive push notifications on your device"
                    checked={notifications.push}
                    onChange={(checked) =>
                      setNotifications({ ...notifications, push: checked })
                    }
                  />
                  <ToggleField
                    label="Marketing Emails"
                    description="Receive updates about new features and promotions"
                    checked={notifications.marketing}
                    onChange={(checked) =>
                      setNotifications({ ...notifications, marketing: checked })
                    }
                  />
                </div>
              </Card>
            )}

            {/* Privacy Settings */}
            {activeSection === "privacy" && (
              <Card className="bg-card p-6">
                <h2 className="mb-6 text-2xl font-bold text-foreground">
                  Privacy Settings
                </h2>
                <div className="space-y-6">
                  <ToggleField
                    label="Public Profile"
                    description="Allow others to view your profile"
                    checked={privacy.profilePublic}
                    onChange={(checked) =>
                      setPrivacy({ ...privacy, profilePublic: checked })
                    }
                  />
                  <ToggleField
                    label="Allow Messages"
                    description="Let other users send you messages"
                    checked={privacy.allowMessages}
                    onChange={(checked) =>
                      setPrivacy({ ...privacy, allowMessages: checked })
                    }
                  />
                  <ToggleField
                    label="Show Online Status"
                    description="Let others see when you're online"
                    checked={privacy.showOnlineStatus}
                    onChange={(checked) =>
                      setPrivacy({ ...privacy, showOnlineStatus: checked })
                    }
                  />
                </div>
              </Card>
            )}

            {/* Appearance Settings */}
            {activeSection === "appearance" && (
              <Card className="bg-card p-6">
                <h2 className="mb-6 text-2xl font-bold text-foreground">
                  Appearance
                </h2>
                <div className="space-y-6">
                  <ToggleField
                    label="Dark Mode"
                    description="Use dark theme for the interface"
                    checked={appearance.darkMode}
                    onChange={(checked) =>
                      setAppearance({ ...appearance, darkMode: checked })
                    }
                  />
                  <ToggleField
                    label="Compact View"
                    description="Use a more compact layout"
                    checked={appearance.compactView}
                    onChange={(checked) =>
                      setAppearance({ ...appearance, compactView: checked })
                    }
                  />
                </div>
              </Card>
            )}

            {/* Billing Settings */}
            {activeSection === "billing" && (
              <Card className="bg-card p-6">
                <h2 className="mb-6 text-2xl font-bold text-foreground">
                  Billing & Subscription
                </h2>
                <div className="space-y-6">
                  <BillingCard
                    plan="Pro"
                    price="$9.99"
                    frequency="/month"
                    description="Access to all features"
                  />
                  <Button className="w-full sm:w-auto">
                    Manage Subscription
                  </Button>
                  <SettingField
                    label="Billing Email"
                    value="billing@example.com"
                  />
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

interface SettingFieldProps {
  label: string;
  value: string;
}

function SettingField({ label, value }: SettingFieldProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  );
}

interface ToggleFieldProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

interface BillingCardProps {
  plan: string;
  price: string;
  frequency: string;
  description: string;
}

function BillingCard({
  plan,
  price,
  frequency,
  description,
}: BillingCardProps) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{plan}</h3>
        <span className="text-lg font-bold text-primary">
          {price}
          <span className="text-sm text-muted-foreground">{frequency}</span>
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
