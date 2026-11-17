
import React, { useState } from "react";
import { DB } from './components/Header'
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ImagePlus,
  X,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

import Header from "./components/Header";

function Notification() {
  const navigate = useNavigate();

  const [notification, setNotification] = useState({
    subject: "",
    description: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [addedSubject, setAddedSubject] = useState("");

  // Handle input changes
  function handleChange(e) {
    const { name, value } = e.target;

    setNotification((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Handle image selection
  function handleImageChange(e) {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      e.target.value = "";
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setError("");
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  // Remove image
  function removeImage() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImageFile(null);
    setPreview("");
  }

  // Reset form
  function resetForm() {
    setNotification({
      subject: "",
      description: "",
    });

    removeImage();
    setError("");
  }

  // Submit notification
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (
      !notification.subject.trim() ||
      !notification.description.trim() ||
      !imageFile
    ) {
      setError("Please fill all fields and select an image");
      return;
    }

    try {
      setLoading(true);

      // STEP 1: Upload image
      const formData = new FormData();
      formData.append("image", imageFile);

      const uploadResponse = await fetch(
        "http://localhost:3001/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Image upload failed");
      }

      const uploadData = await uploadResponse.json();

      if (!uploadData.image) {
        throw new Error("Image path not received from server");
      }

      // STEP 2: Save notification to JSON Server
      const response = await fetch(
        `${DB}/notifications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: notification.subject.trim(),
            description: notification.description.trim(),
            image: uploadData.image,
            status: 1,
            createdAt: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to add notification");
      }

      const savedNotification = await response.json();

      // STEP 3: Success popup
      setAddedSubject(savedNotification.subject);
      setShowPopup(true);

      // STEP 4: Reset form
      setNotification({
        subject: "",
        description: "",
      });

      removeImage();

    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />

      <div className="ml-64 min-h-screen bg-gray-50 p-6 md:p-10">

        {/* PAGE HEADING */}
        <div className="flex justify-between items-center mb-8">

          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <Bell size={25} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-neutral-900">
                  Add Notification
                </h1>

                <p className="text-gray-500 mt-1">
                  Create and publish a new notification for your customers.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/admin/notifications")}
            className="flex items-center gap-2 px-5 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
          >
            <ArrowLeft size={18} />
            Back to Notifications
          </button>

        </div>

        {/* FORM CONTAINER */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10">

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

              {/* LEFT SIDE */}
              <div className="space-y-6">

                <h2 className="text-lg font-bold text-neutral-900 border-b pb-4">
                  Notification Information
                </h2>

                {/* SUBJECT */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Notification Subject *
                  </label>

                  <input
                    type="text"
                    name="subject"
                    value={notification.subject}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="Enter notification subject"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />

                  <p className="text-xs text-gray-400 mt-2 text-right">
                    {notification.subject.length}/100
                  </p>
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Notification Description *
                  </label>

                  <textarea
                    name="description"
                    value={notification.description}
                    onChange={handleChange}
                    rows="9"
                    maxLength={1000}
                    placeholder="Write your notification description here..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
                  />

                  <p className="text-xs text-gray-400 mt-2 text-right">
                    {notification.description.length}/1000
                  </p>
                </div>

                {/* INFO */}
                

              </div>

              {/* RIGHT SIDE */}
              <div className="space-y-6">

                <h2 className="text-lg font-bold text-neutral-900 border-b pb-4">
                  Notification Image
                </h2>

                <label className="block text-sm font-semibold text-gray-700">
                  Upload Notification Image *
                </label>

                {/* IMAGE UPLOAD */}
                <label className="cursor-pointer block">

                  <div className="border-2 border-dashed border-gray-300 rounded-2xl min-h-80 flex flex-col items-center justify-center p-6 hover:border-blue-500 hover:bg-blue-50/30 transition">

                    {preview ? (
                      <img
                        src={preview}
                        alt="Notification Preview"
                        className="max-h-72 w-full object-contain rounded-xl"
                      />
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                          <ImagePlus size={32} />
                        </div>

                        <p className="font-semibold text-gray-700">
                          Click to upload image
                        </p>

                        <p className="text-sm text-gray-400 mt-2">
                          PNG, JPG, WEBP (Max 5MB)
                        </p>
                      </>
                    )}

                  </div>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                </label>

                {/* IMAGE DETAILS */}
                {imageFile && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3">

                    <div className="overflow-hidden">
                      <p className="font-medium text-sm text-gray-800 truncate">
                        {imageFile.name}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {(imageFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={removeImage}
                      className="flex items-center gap-1 text-red-500 text-sm font-semibold hover:text-red-700"
                    >
                      <X size={16} />
                      Remove
                    </button>

                  </div>
                )}

              </div>

            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <p className="mt-6 bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 text-sm">
                {error}
              </p>
            )}

            {/* FORM BUTTONS */}
            <div className="flex justify-end gap-4 border-t mt-10 pt-8">

              <button
                type="button"
                onClick={() => navigate("/admin/notifications")}
                className="px-7 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                <Bell size={18} />
                {loading ? "Uploading..." : "Add Notification"}
              </button>

            </div>

          </form>

        </div>

      </div>

      {/* SUCCESS POPUP */}
      {showPopup && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-md rounded-2xl p-8 text-center shadow-2xl">

            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={42} />
            </div>

            <h2 className="text-2xl font-bold text-neutral-900">
              Notification Added!
            </h2>

            <p className="text-gray-500 mt-3">
              <span className="font-semibold text-neutral-800">
                {addedSubject}
              </span>{" "}
              has been successfully added to your notifications.
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-5">
              <p className="text-xs text-blue-700 font-semibold">
                NOTIFICATION STATUS
              </p>

              <p className="text-lg font-bold text-blue-800 mt-1">
                Active
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-7">

              <button
                onClick={() => {
                  setShowPopup(false);
                  navigate("/admin/notifications");
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                View Notifications
              </button>

              <button
                onClick={() => {
                  setShowPopup(false);
                  resetForm();
                }}
                className="w-full border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
              >
                Add Another Notification
              </button>

            </div>

          </div>

        </div>
      )}

    </>
  );
}

export default Notification;
