import { useEffect, useState } from "react";
import Button from "../components/common/Button";
import FormField from "../components/common/FormField";
import { useAuth } from "../context/AuthContext";
import { getCurrentUser, updateProfile } from "../services/authService";

const defaultProfile = {
  name: "",
  phone: "",
  location: "",
  preferredLanguage: "English",
  landSize: "",
  soilType: "",
  waterAvailability: "",
  currentCrop: ""
};

function ProfilePage() {
  const { user } = useAuth();
  const token = localStorage.getItem("farmtech-token");
  const [profile, setProfile] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser(token);
        const currentUser = response.user || {};
        setProfile({
          name: currentUser.name || "",
          phone: currentUser.phone || "",
          location: currentUser.location || "",
          preferredLanguage: currentUser.preferredLanguage || "English",
          landSize: currentUser.landSize || "",
          soilType: currentUser.soilType || "",
          waterAvailability: currentUser.waterAvailability || "",
          currentCrop: currentUser.currentCrop || ""
        });
      } catch (loadError) {
        setError(loadError.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!profile.name || profile.name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    setSaving(true);

    try {
      const response = await updateProfile(token, profile);
      setSuccess(response.message || "Profile updated successfully.");
    } catch (submitError) {
      setError(submitError.message || "Profile update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-box">Loading your profile...</div>;
  }

  return (
    <div className="page-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Profile</p>
          <h2>Farmer details</h2>
        </div>
      </div>

      <form className="form-panel" onSubmit={handleSubmit} noValidate>
        <div className="auth-grid">
          <FormField id="profile-name" label="Name" name="name" value={profile.name} onChange={handleChange} />
          <FormField id="profile-phone" label="Phone" type="tel" name="phone" value={profile.phone} onChange={handleChange} />
        </div>

        <div className="auth-grid">
          <FormField id="profile-location" label="Your Location" name="location" value={profile.location} onChange={handleChange} />
          <FormField
            id="profile-language"
            label="Preferred language"
            name="preferredLanguage"
            value={profile.preferredLanguage}
            onChange={handleChange}
            options={[
              { value: "English", label: "English" },
              { value: "Hindi", label: "Hindi" },
              { value: "Marathi", label: "Marathi" }
            ]}
          />
        </div>

        <div className="auth-grid">
          <FormField id="profile-land-size" label="Land size" name="landSize" value={profile.landSize} onChange={handleChange} />
          <FormField id="profile-soil-type" label="Soil type" name="soilType" value={profile.soilType} onChange={handleChange} />
        </div>

        <div className="auth-grid">
          <FormField id="profile-water" label="Water availability" name="waterAvailability" value={profile.waterAvailability} onChange={handleChange} />
          <FormField id="profile-crop" label="Current crop" name="currentCrop" value={profile.currentCrop} onChange={handleChange} />
        </div>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="status-box"><span className="status-dot" aria-hidden="true" /> <span>{success}</span></div>}

        <Button type="submit" disabled={saving}>
          {saving ? "Saving profile..." : "Save profile"}
        </Button>
      </form>
    </div>
  );
}

export default ProfilePage;
