"use client";

import React, { useState, useRef } from "react";
import {
  User as UserIcon,
  Camera,
  Upload,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Save,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import { User } from "@/lib/types";
import { updateUserProfile, updateUserPassword } from "@/lib/store";
import { useLanguage } from "@/context/LanguageContext";
import { useNotifications } from "@/context/NotificationContext";

interface UserSettingsTabProps {
  currentUser: User | null;
  onUserUpdate?: (updatedUser: User) => void;
}

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zack&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/bottts/svg?seed=SchoolAdmin&backgroundColor=b6e3f4",
];

export default function UserSettingsTab({ currentUser, onUserUpdate }: UserSettingsTabProps) {
  const { t } = useLanguage();
  const { notify } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string>(
    currentUser?.avatar_url || ""
  );

  React.useEffect(() => {
    if (currentUser?.avatar_url) {
      setAvatarPreview(currentUser.avatar_url);
    }
  }, [currentUser?.avatar_url]);
  const [avatarNotice, setAvatarNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Handle local image file upload & resize via HTML5 Canvas
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarNotice({ type: "error", text: "Please select an image file (PNG, JPG, or WebP)." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to a maximum of 256x256 for lightweight storage
        const canvas = document.createElement("canvas");
        const maxSize = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setAvatarPreview(dataUrl);
          saveAvatar(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    setAvatarPreview(url);
    saveAvatar(url);
  };

  const saveAvatar = async (avatarUrl: string) => {
    if (!currentUser) return;
    setIsSavingAvatar(true);
    setAvatarNotice(null);

    try {
      const result = await updateUserProfile(currentUser.id, { avatar_url: avatarUrl });
      if (result.success && result.user) {
        if (onUserUpdate) onUserUpdate(result.user);
        notify({
          title: "Profile Photo Updated",
          title_ur: "پروفائل تصویر اپ ڈیٹ ہو گئی",
          message: "Your profile picture has been updated and synchronized.",
          message_ur: "آپ کی پروفائل تصویر کامیابی سے اپ ڈیٹ ہو چکی ہے۔",
          type: "SUCCESS",
          category: "ACCOUNT",
          target_role: currentUser.role,
          target_user_id: currentUser.id,
        });
        setAvatarNotice({
          type: "success",
          text: t.profilePhotoUpdated || "Profile photo updated successfully!",
        });
        setTimeout(() => setAvatarNotice(null), 4000);
      } else {
        setAvatarNotice({ type: "error", text: result.error || "Failed to update profile image." });
      }
    } catch (err: any) {
      setAvatarNotice({ type: "error", text: err?.message || "An unexpected error occurred." });
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordNotice(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordNotice({
        type: "error",
        text: t.passwordTooShort || "Password must be at least 6 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordNotice({
        type: "error",
        text: t.passwordsDoNotMatch || "Passwords do not match.",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await updateUserPassword(newPassword);
      if (res.success) {
        if (currentUser) {
          notify({
            title: "Password Updated",
            title_ur: "پاس ورڈ تبدیل ہو گیا",
            message: "Account authentication credentials updated successfully.",
            message_ur: "اکاؤنٹ کا نیا پاس ورڈ محفوظ ہو گیا ہے۔",
            type: "SUCCESS",
            category: "ACCOUNT",
            target_role: currentUser.role,
            target_user_id: currentUser.id,
          });
        }
        setPasswordNotice({
          type: "success",
          text: t.passwordUpdatedSuccess || "Password updated successfully!",
        });
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordNotice(null), 5000);
      } else {
        setPasswordNotice({
          type: "error",
          text: res.error || "Could not update password. Please try again.",
        });
      }
    } catch (err: any) {
      setPasswordNotice({
        type: "error",
        text: err?.message || "An unexpected error occurred updating password.",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Tab Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <span>{t.tabSettings || "Account & Security Settings"}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your personal profile photo and update your authentication password.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ========================================================================= */}
        {/* CARD 1: PROFILE IMAGE CHANGE */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {t.profilePhoto || "Profile Photo"}
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                Avatar
              </span>
            </div>

            {avatarNotice && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  avatarNotice.type === "success"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-rose-50 border-rose-300 text-rose-800"
                }`}
              >
                {avatarNotice.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span>{avatarNotice.text}</span>
              </div>
            )}

            {/* Avatar Preview & Upload Area */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="relative group flex-shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={currentUser?.name || "User Avatar"}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-emerald-500 shadow-md bg-white"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center font-extrabold text-2xl shadow-md border-2 border-slate-700">
                    {(currentUser?.name || "U").substring(0, 2).toUpperCase()}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition-transform active:scale-95 border-2 border-white"
                  title="Upload New Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
                <div className="font-bold text-slate-800 text-sm truncate">{currentUser?.name}</div>
                <div className="text-[11px] text-slate-500 leading-tight">
                  Upload a photo from your computer or phone (JPG, PNG, WebP). It automatically updates in your sidebar
                  and header.
                </div>

                <div className="pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isSavingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 text-xs font-semibold shadow-2xs flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto min-h-[36px]"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.uploadNewPhoto || "Upload New Photo"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Preset Avatars Selection */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-600 block">
                {t.pickPresetAvatar || "Or Pick an Illustrated Avatar:"}
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectPreset(url)}
                    className={`w-11 h-11 rounded-full p-0.5 border-2 transition-all hover:scale-105 ${
                      avatarPreview === url
                        ? "border-emerald-600 shadow-md ring-2 ring-emerald-200"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <img src={url} alt={`Preset ${i + 1}`} className="w-full h-full rounded-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>Profile photos are safely synchronized across your school workspace.</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 2: CHANGE PASSWORD */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5 flex flex-col justify-between">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {t.changePassword || "Change Password"}
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                Security
              </span>
            </div>

            {passwordNotice && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  passwordNotice.type === "success"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-rose-50 border-rose-300 text-rose-800"
                }`}
              >
                {passwordNotice.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span>{passwordNotice.text}</span>
              </div>
            )}

            {/* User Identifier Context */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-slate-400">Account Identifier</span>
              <div className="font-mono font-bold text-xs text-slate-800">
                {currentUser?.identifier || currentUser?.email || "User"}
              </div>
            </div>

            {/* New Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.newPassword || "New Password"} *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter at least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.confirmPassword || "Confirm Password"} *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 pr-10 font-mono ${
                    confirmPassword && confirmPassword !== newPassword
                      ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                      : "border-slate-300 focus:ring-emerald-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <span className="text-[11px] text-rose-600 mt-1 block font-medium">
                  Passwords do not match
                </span>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 min-h-[42px] disabled:opacity-50"
              >
                {isUpdatingPassword ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.updatePassword || "Update Password"}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>Updated password is encrypted and valid across all portal sessions.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
