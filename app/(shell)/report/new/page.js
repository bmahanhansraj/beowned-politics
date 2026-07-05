"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ANON_CATEGORIES = ["Corruption", "Crime Tip"];
const CATEGORY_ICON = {
  Infrastructure: "🕳️",
  Environment: "🌫️",
  Traffic: "🚦",
  Health: "🧪",
  Corruption: "✊",
  "Crime Tip": "🛡️",
};

function ReportForm() {
  const router = useRouter();
  const params = useSearchParams();
  const category = params.get("category") || "Infrastructure";
  const forcedAnon = ANON_CATEGORIES.includes(category);

  const fileInputRef = useRef(null);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [description, setDescription] = useState("");
  const [anonymous, setAnonymous] = useState(forcedAnon);
  const [coords, setCoords] = useState(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function handleCaptureClick() {
    fileInputRef.current?.click();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => setCoords(null),
        { timeout: 5000 }
      );
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (forcedAnon && !consentChecked) {
      setError("Please confirm you understand how this report will be handled.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description,
          photoDataUrl,
          lat: coords?.lat,
          lng: coords?.lng,
          anonymous,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit report.");
      router.push(`/report/confirm?id=${data.report.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen">
      <div className="back-row">
        <button className="back-btn" onClick={() => router.push("/report")} aria-label="Back to categories">
          ‹
        </button>
        <h1 className="screen-title" style={{ fontSize: 17 }}>
          {CATEGORY_ICON[category] || "📍"} {category}
        </h1>
      </div>

      <div
        className={"capture-shot" + (photoDataUrl ? " captured" : "")}
        onClick={handleCaptureClick}
        role="button"
        tabIndex={0}
        aria-label={photoDataUrl ? "Photo captured, tap to retake" : "Tap to capture a photo"}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCaptureClick()}
      >
        {photoDataUrl && <img src={photoDataUrl} alt="" className="preview" />}
        <span className="cam-label">
          {photoDataUrl ? "✓ Photo captured — tap to retake" : "Tap to capture photo"}
        </span>
        <div className="gps">
          📍{" "}
          {coords
            ? `${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}° · Auto-tagged`
            : "Location will be tagged on capture"}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          aria-hidden="true"
          tabIndex={-1}
          style={{ display: "none" }}
        />
      </div>

      <label className="field-label" htmlFor="report-description">
        Description (optional)
      </label>
      <textarea
        id="report-description"
        className="field-input"
        rows={3}
        placeholder="Add any detail that helps the department act faster..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="toggle-row">
        <div>
          <div className="t" id="anon-toggle-label">Report anonymously</div>
          <div className="d">
            {forcedAnon
              ? "Anonymity is enforced for this category"
              : "Your identity is hidden from the department"}
          </div>
        </div>
        <button
          type="button"
          className={"switch" + (anonymous ? " on" : "")}
          role="switch"
          aria-checked={anonymous}
          aria-labelledby="anon-toggle-label"
          aria-disabled={forcedAnon}
          onClick={() => !forcedAnon && setAnonymous((v) => !v)}
        >
          <div className="knob" />
        </button>
      </div>

      {forcedAnon && (
        <label
          className="toggle-row"
          style={{ alignItems: "flex-start", gap: 10, cursor: "pointer" }}
          htmlFor="consent-checkbox"
        >
          <input
            id="consent-checkbox"
            type="checkbox"
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
            style={{ marginTop: 3, flexShrink: 0 }}
          />
          <div>
            <div className="t" style={{ textTransform: "none", fontSize: 12 }}>
              I understand this report is forwarded to the relevant authority
              and is not a substitute for contacting emergency services.
            </div>
          </div>
        </label>
      )}

      {error && (
        <div className="form-error" style={{ margin: "12px 18px 0" }}>
          {error}
        </div>
      )}

      <button className="submit-btn" onClick={handleSubmit} disabled={busy}>
        {busy ? "Submitting…" : "Submit Report"}
      </button>
    </div>
  );
}

export default function NewReportPage() {
  return (
    <Suspense fallback={<div className="screen" />}>
      <ReportForm />
    </Suspense>
  );
}
