
import React, { useEffect, useState } from "react";
import { DB } from './components/Header'
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Save,
  Pencil,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  KeyRound,
  X,
} from "lucide-react";

import Header from "./components/Header";

function AdminProfile() {
  const API = `${DB}`;
  const ADMIN_ID = "5";

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [editMode, setEditMode] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [profileMessage, setProfileMessage] = useState({
    type: "",
    text: "",
  });

  const [passwordMessage, setPasswordMessage] = useState({
    type: "",
    text: "",
  });

  // Fetch admin details
  const fetchAdmin = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API}/users/${ADMIN_ID}`);

      if (!response.ok) {
        throw new Error("Unable to fetch admin profile.");
      }

      const data = await response.json();

      if (data.role !== "admin") {
        throw new Error("This account is not an admin account.");
      }

      setAdmin(data);

      setProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
      });
    } catch (error) {
      setProfileMessage({
        type: "error",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  // Profile input handler
  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // Password input handler
  const handlePasswordChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  // Update profile
  const updateProfile = async (e) => {
    e.preventDefault();

    setProfileMessage({ type: "", text: "" });

    if (
      !profile.name.trim() ||
      !profile.email.trim() ||
      !profile.phone.trim()
    ) {
      setProfileMessage({
        type: "error",
        text: "Please fill in all profile details.",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      setProfileMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    if (!/^[0-9]{10}$/.test(profile.phone.trim())) {
      setProfileMessage({
        type: "error",
        text: "Please enter a valid 10-digit phone number.",
      });
      return;
    }

    try {
      setSaving(true);

      // Check duplicate email
      const usersResponse = await fetch(`${API}/users`);

      if (!usersResponse.ok) {
        throw new Error("Unable to verify email address.");
      }

      const users = await usersResponse.json();

      const duplicateEmail = users.find(
        (user) =>
          String(user.id) !== ADMIN_ID &&
          user.email?.toLowerCase() === profile.email.trim().toLowerCase()
      );

      if (duplicateEmail) {
        throw new Error("This email address is already registered.");
      }

      const response = await fetch(`${API}/users/${ADMIN_ID}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name.trim(),
          email: profile.email.trim(),
          phone: profile.phone.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile.");
      }

      const updatedAdmin = await response.json();

      setAdmin((previous) => ({
        ...previous,
        ...updatedAdmin,
      }));

      setEditMode(false);

      setProfileMessage({
        type: "success",
        text: "Profile updated successfully.",
      });
    } catch (error) {
      setProfileMessage({
        type: "error",
        text: error.message || "Something went wrong.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const changePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage({ type: "", text: "" });

    if (
      !passwords.currentPassword ||
      !passwords.newPassword ||
      !passwords.confirmPassword
    ) {
      setPasswordMessage({
        type: "error",
        text: "Please fill in all password fields.",
      });
      return;
    }

    if (passwords.currentPassword !== admin.password) {
      setPasswordMessage({
        type: "error",
        text: "Current password is incorrect.",
      });
      return;
    }

    if (passwords.newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "New password must contain at least 8 characters.",
      });
      return;
    }

    if (passwords.newPassword === passwords.currentPassword) {
      setPasswordMessage({
        type: "error",
        text: "New password must be different from the current password.",
      });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "New password and confirm password do not match.",
      });
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await fetch(`${API}/users/${ADMIN_ID}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: passwords.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to update password.");
      }

      const updatedAdmin = await response.json();

      setAdmin((previous) => ({
        ...previous,
        ...updatedAdmin,
      }));

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPassword({
        current: false,
        new: false,
        confirm: false,
      });

      setPasswordMessage({
        type: "success",
        text: "Password changed successfully.",
      });
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text: error.message || "Something went wrong.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setProfile({
      name: admin.name || "",
      email: admin.email || "",
      phone: admin.phone || "",
    });

    setEditMode(false);
    setProfileMessage({ type: "", text: "" });
  };

  // Toggle password visibility
  const togglePassword = (field) => {
    setShowPassword((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  // Message component
  const Message = ({ message, onClose }) => {
    if (!message.text) return null;

    return (
      <div
        className={`mb-5 flex items-center justify-between gap-3 rounded-xl border p-4 text-sm ${
          message.type === "success"
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-red-200 bg-red-50 text-red-600"
        }`}
      >
        <div className="flex items-center gap-2">
          {message.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}

          {message.text}
        </div>

        <button type="button" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
    );
  };

  // Password input component
  const PasswordInput = ({
    label,
    name,
    value,
    field,
    placeholder,
  }) => (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <div className="relative">
        <input
          type={showPassword[field] ? "text" : "password"}
          name={name}
          value={value}
          onChange={handlePasswordChange}
          placeholder={placeholder}
          autoComplete="new-password"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-amber-500 focus:bg-white"
        />

        <button
          type="button"
          onClick={() => togglePassword(field)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
        >
          {showPassword[field] ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="ml-64 flex min-h-screen w-[calc(100%-16rem)] items-center justify-center">
          <div className="text-center">
            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-amber-500"
            />

            <p className="mt-3 text-sm text-gray-500">
              Loading admin profile...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Admin not found
  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="ml-64 w-[calc(100%-16rem)] px-6 pt-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
            {profileMessage.text || "Admin profile not found."}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="ml-64 min-h-screen w-[calc(100%-16rem)] px-6 pb-8 pt-8">

        {/* Page Heading */}
        <div className="mb-6">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-600">
            <ShieldCheck size={17} />
            ACCOUNT SETTINGS
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Admin Profile
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your personal information and account security.
          </p>
        </div>

        {/* Profile Banner */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* Gradient */}
          <div className="h-28 bg-gradient-to-r from-gray-950 via-gray-800 to-amber-600" />

          {/* Admin Information */}
          <div className="px-7 pb-6">
            <div className="-mt-12 flex flex-wrap items-end justify-between gap-5">

              <div className="flex flex-wrap items-end gap-5">

                {/* Avatar */}
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-amber-500 text-4xl font-bold text-white shadow-lg">
                  {admin.name?.charAt(0).toUpperCase() || "A"}
                </div>

                {/* Name and Email */}
                <div className="pb-2 pt-14">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {admin.name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {admin.email}
                  </p>

                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    <ShieldCheck size={14} />
                    Administrator
                  </span>
                </div>
              </div>

              {/* Admin ID */}
              <div className="pb-2 text-sm font-medium text-gray-400">
                Admin ID: #{admin.id}
              </div>

            </div>
          </div>
        </section>

        {/* Personal Information */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-6 py-4">

            <div>
              <h2 className="flex items-center gap-2 font-bold text-gray-900">
                <User size={19} className="text-amber-600" />
                Personal Information
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Update your admin account details.
              </p>
            </div>

            {!editMode && (
              <button
                onClick={() => {
                  setEditMode(true);
                  setProfileMessage({ type: "", text: "" });
                }}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
              >
                <Pencil size={15} />
                Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={updateProfile} className="p-6">

            <Message
              message={profileMessage}
              onClose={() => setProfileMessage({ type: "", text: "" })}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* Full Name */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User size={15} className="text-gray-400" />
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  disabled={!editMode}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-amber-500 disabled:cursor-not-allowed disabled:opacity-80"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Mail size={15} className="text-gray-400" />
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  disabled={!editMode}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-amber-500 disabled:cursor-not-allowed disabled:opacity-80"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Phone size={15} className="text-gray-400" />
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  disabled={!editMode}
                  maxLength={10}
                  placeholder="Enter your phone number"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-amber-500 disabled:cursor-not-allowed disabled:opacity-80"
                />
              </div>

              {/* Role */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <ShieldCheck size={15} className="text-gray-400" />
                  Account Role
                </label>

                <input
                  type="text"
                  value="Administrator"
                  disabled
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500"
                />
              </div>

            </div>

            {editMode && (
              <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}

                  {saving ? "Saving..." : "Save Changes"}
                </button>

              </div>
            )}
          </form>
        </section>

        {/* Change Password */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="flex items-center gap-2 font-bold text-gray-900">
              <Lock size={19} className="text-amber-600" />
              Change Password
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Update your password to keep your admin account secure.
            </p>
          </div>

          <form onSubmit={changePassword} className="max-w-3xl p-6">

            <Message
              message={passwordMessage}
              onClose={() => setPasswordMessage({ type: "", text: "" })}
            />

            <div className="space-y-5">

              <PasswordInput
                label="Current Password"
                name="currentPassword"
                value={passwords.currentPassword}
                field="current"
                placeholder="Enter current password"
              />

              <PasswordInput
                label="New Password"
                name="newPassword"
                value={passwords.newPassword}
                field="new"
                placeholder="Enter new password"
              />

              <PasswordInput
                label="Confirm New Password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                field="confirm"
                placeholder="Confirm new password"
              />

            </div>

            {/* Password Requirements */}
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex gap-3">
                <KeyRound size={19} className="mt-0.5 shrink-0 text-blue-600" />

                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Password Requirements
                  </p>

                  <ul className="mt-2 space-y-1 text-xs text-blue-700">
                    <li>• Minimum 8 characters</li>
                    <li>• New password must differ from the current password</li>
                    <li>• Both new password fields must match</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Update Button */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <button
                type="submit"
                disabled={passwordLoading}
                className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                {passwordLoading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Lock size={16} />
                )}

                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </div>

          </form>
        </section>

        {/* Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-5 text-xs text-gray-400">
          <p>ShoeCraft Admin Account Settings</p>
          <p>Administrator ID: #{admin.id}</p>
        </div>

      </main>
    </div>
  );
}

export default AdminProfile;
