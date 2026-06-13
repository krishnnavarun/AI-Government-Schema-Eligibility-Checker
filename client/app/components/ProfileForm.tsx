"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ProfileForm() {
  const { user, updateProfile, error } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState(user?.age?.toString() || "");
  const [gender, setGender] = useState(user?.gender || "All");
  const [state, setState] = useState(user?.state || "");
  const [district, setDistrict] = useState(user?.district || "");
  const [occupation, setOccupation] = useState(user?.occupation || "");
  const [income, setIncome] = useState(user?.income?.toString() || "");
  const [education, setEducation] = useState(user?.education || "");
  const [casteCategory, setCasteCategory] = useState(user?.casteCategory || "General");
  const [isFarmer, setIsFarmer] = useState(user?.isFarmer || false);
  const [isStudent, setIsStudent] = useState(user?.isStudent || false);
  const [isDisability, setIsDisability] = useState(user?.isDisability || false);
  const [employmentStatus, setEmploymentStatus] = useState(user?.employmentStatus || "Unemployed");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setSuccess(false);

    const updated = await updateProfile({
      name,
      age: age ? parseInt(age) : undefined,
      gender,
      state,
      district,
      occupation,
      income: income ? parseFloat(income) : undefined,
      education,
      casteCategory,
      isFarmer,
      isStudent,
      isDisability,
      employmentStatus,
    });

    setLoading(false);
    if (updated) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    }
  };

  const statesList = [
    "All",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal"
  ];

  return (
    <div className="bg-white border border-zinc-200 rounded-md p-6 shadow-sm">
      <h3 className="text-base font-bold text-zinc-900 mb-1">Citizen Demographics Profile</h3>
      <p className="text-xs text-zinc-500 mb-6">
        Complete your details below to activate scheme rules eligibility matching.
      </p>

      {success && (
        <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-md">
          ✓ Profile settings saved successfully. Match profiles updated.
        </div>
      )}

      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Age (Years)
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
              disabled={loading}
              placeholder="e.g. 21"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
              disabled={loading}
            >
              <option value="All">All/Other</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              State of Residence
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
              disabled={loading}
            >
              <option value="">Select State</option>
              {statesList.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              District
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
              disabled={loading}
              placeholder="e.g. Madurai"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Occupation
            </label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
              disabled={loading}
              placeholder="e.g. Farmer, Student, Teacher"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Annual Income (INR)
            </label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
              disabled={loading}
              placeholder="e.g. 180000"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Education Level
            </label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
              disabled={loading}
              placeholder="e.g. Secondary School, Undergrad"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Caste Category
            </label>
            <select
              value={casteCategory}
              onChange={(e) => setCasteCategory(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
              disabled={loading}
            >
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Employment Status
            </label>
            <select
              value={employmentStatus}
              onChange={(e) => setEmploymentStatus(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
              disabled={loading}
            >
              <option value="Unemployed">Unemployed</option>
              <option value="Employed">Employed</option>
              <option value="Self-Employed">Self-Employed</option>
            </select>
          </div>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-md grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center space-x-3 text-xs cursor-pointer select-none text-zinc-800">
            <input
              type="checkbox"
              checked={isFarmer}
              onChange={(e) => setIsFarmer(e.target.checked)}
              className="w-4 h-4 bg-white border-zinc-300 rounded text-black focus:ring-0 focus:outline-none cursor-pointer"
              disabled={loading}
            />
            <span>Registered Farmer</span>
          </label>

          <label className="flex items-center space-x-3 text-xs cursor-pointer select-none text-zinc-800">
            <input
              type="checkbox"
              checked={isStudent}
              onChange={(e) => setIsStudent(e.target.checked)}
              className="w-4 h-4 bg-white border-zinc-300 rounded text-black focus:ring-0 focus:outline-none cursor-pointer"
              disabled={loading}
            />
            <span>Active Student</span>
          </label>

          <label className="flex items-center space-x-3 text-xs cursor-pointer select-none text-zinc-800">
            <input
              type="checkbox"
              checked={isDisability}
              onChange={(e) => setIsDisability(e.target.checked)}
              className="w-4 h-4 bg-white border-zinc-300 rounded text-black focus:ring-0 focus:outline-none cursor-pointer"
              disabled={loading}
            />
            <span>Person with Disability</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-black hover:bg-zinc-850 text-white font-semibold text-xs px-6 py-2.5 rounded transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
