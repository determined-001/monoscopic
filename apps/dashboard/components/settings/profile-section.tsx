"use client";

import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

const INPUT =
  "w-full h-9 rounded-lg px-3 text-[13px] bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-active)] transition-colors duration-150";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-[var(--text-secondary)]">
        {label}
      </label>
      {children}
    </div>
  );
}

export function ProfileSection() {
  const [name, setName] = useState(() =>
    typeof window !== "undefined"
      ? (localStorage.getItem("profile_name") ?? "Anonymous Trader")
      : "Anonymous Trader",
  );
  const [email, setEmail] = useState(() =>
    typeof window !== "undefined"
      ? (localStorage.getItem("profile_email") ?? "")
      : "",
  );
  const [avatar, setAvatar] = useState<string | null>(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("profile_avatar")
      : null,
  );
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    localStorage.setItem("profile_name", name);
    localStorage.setItem("profile_email", email);
    if (avatar) localStorage.setItem("profile_avatar", avatar);
    else localStorage.removeItem("profile_avatar");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => fileRef.current?.click()}
          className="relative h-20 w-20 rounded-full overflow-hidden shrink-0 border-2 border-[var(--border-default)] hover:border-[var(--border-active)] transition-colors duration-150 group"
          aria-label="Upload avatar"
        >
          {avatar ? (
            <img
              src={avatar}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-purple-500/20 flex items-center justify-center text-[22px] font-bold text-purple-400">
              {name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <Camera size={18} className="text-white" />
          </div>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFile}
        />
        <div>
          <p className="text-[13px] font-medium text-[var(--text-primary)]">
            Profile picture
          </p>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
            Click to upload · JPG, PNG, GIF up to 2MB
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Field label="Display name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT}
          />
        </Field>
        <Field label="Email address">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={INPUT}
          />
          <p className="text-[11px] text-[var(--text-muted)]">
            Used for alert notifications only.
          </p>
        </Field>
      </div>

      <div>
        <button
          onClick={handleSave}
          className={cn(
            "h-9 px-5 rounded-lg text-[13px] font-semibold transition-colors duration-150",
            saved
              ? "bg-chart-positive text-white"
              : "bg-purple-500 hover:bg-purple-600 text-white",
          )}
        >
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
