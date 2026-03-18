'use client'

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    }
  }
);

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const COLORS = {
  navy: "#0f2044",
  navyMid: "#1a3a6b",
  navyLight: "#234e8c",
  accent: "#1d6fde",
  accentLight: "#3b87f5",
  teal: "#0d9488",
  gold: "#b45309",
  white: "#ffffff",
  offWhite: "#f8fafc",
  gray50: "#f1f5f9",
  gray100: "#e2e8f0",
  gray200: "#cbd5e1",
  gray400: "#94a3b8",
  gray600: "#475569",
  gray700: "#334155",
  gray900: "#0f172a",
  success: "#059669",
  warning: "#d97706",
  danger: "#dc2626",
};

const STATUS_META = {
  Reported:     { color: "#6366f1", bg: "#eef2ff", icon: "📋" },
  "Under Review":{ color: "#d97706", bg: "#fffbeb", icon: "🔍" },
  Verified:     { color: "#0891b2", bg: "#ecfeff", icon: "✅" },
  "In Progress":{ color: "#7c3aed", bg: "#f5f3ff", icon: "⚙️" },
  Resolved:     { color: "#059669", bg: "#ecfdf5", icon: "✔️" },
};

const ROLES = {
  citizen:    { label: "Citizen",    icon: "👤", color: "#1d6fde" },
  volunteer:  { label: "Volunteer",  icon: "🙋", color: "#0d9488" },
  institution:{ label: "Institution",icon: "🏛️", color: "#7c3aed" },
  government: { label: "Government", icon: "⭐", color: "#b45309" },
};

const CATEGORIES = ["Garbage","Road Damage","Streetlight","Water Leakage","Sanitation","Others"];

// ─── SAMPLE DATA ────────────────────────────────────────────────────────────
const SAMPLE_ISSUES = [
  { id:"i1", title:"Overflowing garbage bins near Central Park", description:"The garbage bins at Central Park entrance have been overflowing for 3 days. Waste is spilling onto the walkway creating health hazards for park visitors.", category:"Garbage", location:"Central Park, Sector 12", status:"In Progress", verified:true, image:"🗑️", author:"Rajesh Kumar", role:"citizen", timestamp:"2h ago", likes:24, comments:8 },
  { id:"i2", title:"Large pothole on MG Road causing accidents", description:"A 2-foot wide pothole has developed near the MG Road junction. Two bikes have already had accidents. Urgent repair needed.", category:"Road Damage", location:"MG Road, Junction 4", status:"Verified", verified:true, image:"🛣️", author:"City Traffic Dept.", role:"government", timestamp:"5h ago", likes:67, comments:22 },
  { id:"i3", title:"Street lights not working for 2 weeks", description:"Three consecutive street lights on Gandhi Street have been non-functional for over two weeks. The area becomes very dark at night, raising safety concerns.", category:"Streetlight", location:"Gandhi Street, Block B", status:"Under Review", verified:false, image:"💡", author:"Priya Sharma", role:"citizen", timestamp:"1d ago", likes:15, comments:4 },
  { id:"i4", title:"Water pipe burst at residential colony", description:"A water pipe has burst at Greenview Colony causing water logging and road damage. Immediate attention required to prevent further damage.", category:"Water Leakage", location:"Greenview Colony, Phase 2", status:"Reported", verified:false, image:"💧", author:"Sunita Devi", role:"citizen", timestamp:"3h ago", likes:31, comments:11 },
  { id:"i5", title:"Drainage blockage causing flooding", description:"The main drainage channel near the market is completely blocked. During rains, the market area floods and shopkeepers face major losses.", category:"Sanitation", location:"Main Market, Ward 7", status:"Resolved", verified:true, image:"🌊", author:"Municipal Corp.", role:"government", timestamp:"3d ago", likes:89, comments:34 },
];

const SAMPLE_ACTIVITIES = [
  { id:"a1", title:"Community Park Cleanup Drive", description:"Join us to restore the beauty of Nehru Park. Bring gloves — we'll provide bags and tools.", location:"Nehru Park, Sector 9", date:"Dec 20, 2025", organizer:"GreenCity Volunteers", volunteers:18, required:30, joined:false, donations:["Gloves","Garbage Bags"] },
  { id:"a2", title:"Tree Plantation Campaign", description:"Plant 500 saplings along the bypass road. Help us green our city and combat pollution.", location:"Bypass Road, West End", date:"Dec 22, 2025", organizer:"EcoAction Group", volunteers:42, required:50, joined:false, donations:["Saplings","Spades"] },
  { id:"a3", title:"Road Safety Awareness Program", description:"Interactive session with school students about road safety, traffic rules, and pedestrian safety.", location:"City School Auditorium", date:"Dec 25, 2025", organizer:"Traffic Police", volunteers:8, required:15, joined:false, donations:[] },
];

const SAMPLE_IDEAS = [
  { id:"d1", title:"Install solar-powered street lights", description:"Replace old street lights with solar-powered LED lights to save energy and ensure 24/7 lighting.", supports:234, supported:false, comments:18, author:"Amit Verma", timestamp:"2d ago" },
  { id:"d2", title:"Create community vegetable garden in empty plots", description:"Convert unused municipal plots into community vegetable gardens managed by local residents.", supports:189, supported:false, comments:12, author:"Lakshmi Nair", timestamp:"4d ago" },
  { id:"d3", title:"Install CCTV cameras at accident-prone junctions", description:"5 junctions in our ward have had frequent accidents. CCTV cameras will improve monitoring.", supports:156, supported:false, comments:9, author:"Rajesh Kumar", timestamp:"1w ago" },
];

// ─── ICONS ──────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const icons = {
    home: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
    alert: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    activity: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>,
    bulb: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14"/></svg>,
    user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>,
    heart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    comment: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    map: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    menu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    upload: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="16,16 12,12 8,16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
    award: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
    shield: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    chevronRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="9,18 15,12 9,6"/></svg>,
    thumbsUp: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>,
    calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  };
  return icons[name] || null;
};

// ─── STYLES ─────────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    font-family: 'DM Sans', sans-serif;
    background: #f1f5f9;
    color: #0f172a;
    line-height: 1.6;
  }
  
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #f1f5f9; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

  .civic-app {
    display: flex;
    min-height: 100vh;
  }
  
  /* Sidebar */
  .sidebar {
    width: 260px;
    background: linear-gradient(180deg, #0f2044 0%, #1a3a6b 100%);
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease;
    overflow-y: auto;
  }
  .sidebar-hidden {
    transform: translateX(-260px);
  }
  .sidebar-logo {
    padding: 28px 24px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .logo-mark {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .logo-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #1d6fde, #3b87f5);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .logo-text {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    color: white;
    font-weight: 700;
    letter-spacing: -0.3px;
  }
  .logo-sub {
    font-size: 10px;
    color: rgba(255,255,255,0.45);
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .nav-section {
    padding: 16px 12px;
    flex: 1;
  }
  .nav-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    padding: 8px 12px 6px;
  }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    color: rgba(255,255,255,0.6);
    font-size: 14px;
    font-weight: 400;
    transition: all 0.15s ease;
    border: 1px solid transparent;
    text-decoration: none;
    margin-bottom: 2px;
    background: none;
    width: 100%;
    text-align: left;
  }
  .nav-item:hover {
    background: rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.9);
  }
  .nav-item.active {
    background: rgba(29,111,222,0.25);
    border-color: rgba(29,111,222,0.4);
    color: white;
  }
  .nav-item .nav-icon {
    opacity: 0.7;
    flex-shrink: 0;
  }
  .nav-item.active .nav-icon { opacity: 1; }

  .sidebar-user {
    padding: 16px;
    border-top: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .user-avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .user-info { flex: 1; min-width: 0; }
  .user-name {
    font-size: 13px;
    font-weight: 500;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .user-role {
    font-size: 11px;
    color: rgba(255,255,255,0.4);
  }

  /* Main content */
  .main-content {
    margin-left: 260px;
    flex: 1;
    min-height: 100vh;
  }

  /* Top bar */
  .topbar {
    background: white;
    border-bottom: 1px solid #e2e8f0;
    padding: 0 32px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 50;
  }
  .topbar-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    color: #0f2044;
  }
  .topbar-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* Page content */
  .page-content {
    padding: 32px;
    max-width: 1200px;
  }

  /* Cards */
  .card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
  }

  /* Issue card */
  .issue-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    transition: box-shadow 0.2s, transform 0.2s;
    cursor: pointer;
  }
  .issue-card:hover {
    box-shadow: 0 8px 24px rgba(15,32,68,0.1);
    transform: translateY(-2px);
  }
  .issue-card-image {
    background: linear-gradient(135deg, #0f2044 0%, #1a3a6b 100%);
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    position: relative;
  }
  .issue-card-body { padding: 16px; }
  .issue-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .issue-category {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: #1d6fde;
    background: #eff6ff;
    padding: 2px 8px;
    border-radius: 4px;
  }
  .issue-title {
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 6px;
    line-height: 1.4;
  }
  .issue-desc {
    font-size: 13px;
    color: #64748b;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 12px;
  }
  .issue-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
  }
  .issue-author {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #64748b;
  }
  .issue-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #94a3b8;
    cursor: pointer;
    background: none;
    border: none;
    padding: 4px 6px;
    border-radius: 6px;
    transition: all 0.15s;
  }
  .action-btn:hover { background: #f8fafc; color: #475569; }

  /* Status badge */
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
  }
  .verified-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #ecfdf5;
    color: #059669;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
  }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.15s;
    font-family: inherit;
    text-decoration: none;
  }
  .btn-primary {
    background: linear-gradient(135deg, #0f2044, #1a3a6b);
    color: white;
  }
  .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn-accent {
    background: linear-gradient(135deg, #1d6fde, #3b87f5);
    color: white;
    box-shadow: 0 2px 8px rgba(29,111,222,0.3);
  }
  .btn-accent:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn-outline {
    background: white;
    color: #334155;
    border: 1.5px solid #e2e8f0;
  }
  .btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; }
  .btn-sm { padding: 6px 14px; font-size: 13px; }
  .btn-danger { background: #dc2626; color: white; }
  .btn-success { background: #059669; color: white; }

  /* Form elements */
  .form-group { margin-bottom: 20px; }
  .form-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 6px;
    letter-spacing: 0.2px;
  }
  .form-control {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    color: #0f172a;
    background: white;
    transition: border-color 0.15s;
    outline: none;
  }
  .form-control:focus { border-color: #1d6fde; box-shadow: 0 0 0 3px rgba(29,111,222,0.1); }
  textarea.form-control { resize: vertical; min-height: 100px; }
  select.form-control { cursor: pointer; }

  /* Auth pages */
  .auth-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f2044 0%, #1a3a6b 60%, #234e8c 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .auth-card {
    background: white;
    border-radius: 16px;
    padding: 48px;
    width: 100%;
    max-width: 440px;
    box-shadow: 0 32px 64px rgba(0,0,0,0.25);
  }
  .auth-logo {
    text-align: center;
    margin-bottom: 32px;
  }
  .auth-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 700;
    color: #0f2044;
    text-align: center;
    margin-bottom: 8px;
  }
  .auth-subtitle {
    font-size: 14px;
    color: #64748b;
    text-align: center;
    margin-bottom: 32px;
  }
  .auth-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0;
    color: #94a3b8;
    font-size: 13px;
  }
  .auth-divider::before, .auth-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e2e8f0;
  }
  .google-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 11px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    font-size: 14px;
    font-weight: 500;
    color: #334155;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
  }
  .google-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
  .auth-link {
    color: #1d6fde;
    cursor: pointer;
    font-size: 14px;
    background: none;
    border: none;
    font-family: inherit;
    text-decoration: underline;
  }
  .auth-link:hover { color: #1558b0; }

  /* Stats */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }
  .stat-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    position: relative;
    overflow: hidden;
  }
  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
  }
  .stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }
  .stat-label { font-size: 13px; color: #64748b; }
  .stat-icon {
    position: absolute;
    right: 16px;
    top: 16px;
    font-size: 24px;
    opacity: 0.15;
  }

  /* Feed filters */
  .filter-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }
  .filter-chip {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: 1.5px solid #e2e8f0;
    background: white;
    color: #475569;
    transition: all 0.15s;
    font-family: inherit;
  }
  .filter-chip:hover { border-color: #1d6fde; color: #1d6fde; }
  .filter-chip.active {
    background: #0f2044;
    border-color: #0f2044;
    color: white;
  }

  /* Issue grid */
  .issue-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 20px;
  }

  /* Activity card */
  .activity-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .activity-card:hover {
    box-shadow: 0 4px 16px rgba(15,32,68,0.08);
    transform: translateY(-1px);
  }
  .activity-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .activity-title { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
  .activity-org { font-size: 12px; color: #1d6fde; font-weight: 500; }
  .activity-desc { font-size: 13px; color: #64748b; margin-bottom: 14px; line-height: 1.5; }
  .activity-info { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
  .activity-info-row { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #475569; }
  .volunteer-bar { height: 4px; background: #e2e8f0; border-radius: 2px; margin-bottom: 4px; }
  .volunteer-fill { height: 100%; background: linear-gradient(90deg, #1d6fde, #3b87f5); border-radius: 2px; transition: width 0.5s; }
  .volunteer-label { font-size: 11px; color: #64748b; }

  /* Idea card */
  .idea-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    gap: 16px;
    transition: box-shadow 0.2s;
  }
  .idea-card:hover { box-shadow: 0 4px 16px rgba(15,32,68,0.08); }
  .idea-support {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 52px;
  }
  .support-count {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1;
  }
  .support-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
  .support-btn {
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border: 1.5px solid #e2e8f0;
    background: white;
    color: #475569;
    transition: all 0.15s;
    font-family: inherit;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    white-space: nowrap;
  }
  .support-btn.supported {
    background: #ecfdf5;
    border-color: #059669;
    color: #059669;
  }
  .idea-content { flex: 1; min-width: 0; }
  .idea-title { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 6px; }
  .idea-desc { font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 10px; }
  .idea-meta { font-size: 12px; color: #94a3b8; display: flex; gap: 12px; }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15,32,68,0.6);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    backdrop-filter: blur(4px);
  }
  .modal {
    background: white;
    border-radius: 16px;
    width: 100%;
    max-width: 560px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 32px 64px rgba(0,0,0,0.2);
  }
  .modal-header {
    padding: 24px 28px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  .modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    color: #0f2044;
  }
  .modal-body { padding: 0 28px 28px; }

  /* Government dashboard */
  .gov-table { width: 100%; border-collapse: collapse; }
  .gov-table th {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #94a3b8;
    text-align: left;
    padding: 12px 16px;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
  }
  .gov-table td {
    padding: 14px 16px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 13px;
    color: #334155;
    vertical-align: middle;
  }
  .gov-table tr:hover td { background: #f8fafc; }

  /* Profile page */
  .profile-cover {
    height: 160px;
    background: linear-gradient(135deg, #0f2044 0%, #1a3a6b 60%, #234e8c 100%);
    border-radius: 12px 12px 0 0;
    position: relative;
  }
  .profile-avatar-wrap {
    position: absolute;
    bottom: -40px;
    left: 28px;
  }
  .profile-avatar {
    width: 80px; height: 80px;
    border-radius: 50%;
    border: 4px solid white;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  /* Landing */
  .landing {
    min-height: 100vh;
    background: linear-gradient(160deg, #0f2044 0%, #1a3a6b 50%, #0d1f3e 100%);
    display: flex;
    flex-direction: column;
  }
  .landing-nav {
    padding: 20px 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .landing-hero {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 48px 24px;
  }
  .hero-content { max-width: 680px; }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(29,111,222,0.2);
    border: 1px solid rgba(29,111,222,0.4);
    color: #93c5fd;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 20px;
    margin-bottom: 24px;
  }
  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: 54px;
    font-weight: 700;
    color: white;
    line-height: 1.15;
    margin-bottom: 20px;
    letter-spacing: -1px;
  }
  .hero-title span { color: #3b87f5; }
  .hero-desc {
    font-size: 17px;
    color: rgba(255,255,255,0.65);
    line-height: 1.7;
    margin-bottom: 40px;
    max-width: 520px;
    margin-left: auto;
    margin-right: auto;
  }
  .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .hero-stats {
    display: flex;
    justify-content: center;
    gap: 48px;
    margin-top: 64px;
    padding-top: 48px;
    border-top: 1px solid rgba(255,255,255,0.1);
  }
  .hero-stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 700;
    color: white;
  }
  .hero-stat-label { font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 4px; }

  /* Announcement banner */
  .announcement {
    background: linear-gradient(90deg, #1d6fde, #3b87f5);
    color: white;
    padding: 10px 24px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    font-weight: 500;
  }
  
  /* Toast */
  .toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #0f2044;
    color: white;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 14px;
    z-index: 999;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 8px;
    animation: slideIn 0.3s ease;
  }
  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  /* Role selector */
  .role-card {
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.15s;
    text-align: center;
  }
  .role-card:hover { border-color: #1d6fde; background: #f0f7ff; }
  .role-card.selected { border-color: #0f2044; background: #eff6ff; }
  .role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

  /* Mobile sidebar overlay */
  .sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 99;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .sidebar { transform: translateX(-260px); }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay.open { display: block; }
    .main-content { margin-left: 0; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .issue-grid { grid-template-columns: 1fr; }
    .topbar { padding: 0 16px; }
    .page-content { padding: 16px; }
    .hero-title { font-size: 36px; }
    .hero-stats { gap: 24px; }
    .auth-card { padding: 32px 24px; }
  }
  @media (max-width: 600px) {
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .hero-title { font-size: 28px; }
    .hero-stats { flex-wrap: wrap; gap: 16px; }
  }

  /* Tabs */
  .tabs { display: flex; gap: 4px; border-bottom: 2px solid #e2e8f0; margin-bottom: 24px; }
  .tab {
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    transition: all 0.15s;
    background: none;
    border-top: none;
    border-left: none;
    border-right: none;
    font-family: inherit;
  }
  .tab:hover { color: #0f2044; }
  .tab.active { color: #0f2044; border-bottom-color: #0f2044; font-weight: 600; }

  /* Notice */
  .notice {
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }
  .notice-info { background: #eff6ff; color: #1d6fde; border: 1px solid #bfdbfe; }
  .notice-success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
  .notice-warning { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }

  /* Section header */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    color: #0f2044;
  }
  .section-sub {
    font-size: 13px;
    color: #64748b;
    margin-top: 2px;
  }
`;

// ─── TOAST ───────────────────────────────────────────────────────────────────
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="toast">
      <span style={{color:"#4ade80"}}>✓</span>
      {message}
    </div>
  );
};

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META["Reported"];
  return (
    <span className="status-badge" style={{ color: meta.color, background: meta.bg }}>
      {meta.icon} {status}
    </span>
  );
};

// ─── ROLE BADGE ──────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const meta = ROLES[role] || ROLES.citizen;
  return (
    <span style={{ fontSize:11, fontWeight:600, color: meta.color, background: meta.color + "18", padding:"2px 7px", borderRadius:4 }}>
      {meta.icon} {meta.label}
    </span>
  );
};

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
const LandingPage = ({ onNavigate }) => (
  <div className="landing">
    <nav className="landing-nav">
      <div className="logo-mark">
        <div className="logo-icon">🏙️</div>
        <div>
          <div className="logo-text" style={{color:"white"}}>CivicConnect</div>
          <div className="logo-sub">Community Platform</div>
        </div>
      </div>
      <div style={{display:"flex", gap:12}}>
        <button className="btn btn-outline" style={{background:"transparent", color:"white", borderColor:"rgba(255,255,255,0.3)"}} onClick={() => onNavigate("login")}>Sign In</button>
        <button className="btn btn-accent" onClick={() => onNavigate("signup")}>Get Started</button>
      </div>
    </nav>
    <div className="landing-hero">
      <div className="hero-content">
        <div className="hero-tag">🏛️ Civic Engagement Platform</div>
        <h1 className="hero-title">Connect. Report.<br/><span>Resolve Together.</span></h1>
        <p className="hero-desc">CivicConnect bridges the gap between citizens, volunteers, institutions, and government authorities to collaboratively build better communities.</p>
        <div className="hero-actions">
          <button className="btn btn-accent" style={{padding:"14px 32px", fontSize:15}} onClick={() => onNavigate("signup")}>
            Join Your Community
          </button>
          <button className="btn btn-outline" style={{background:"rgba(255,255,255,0.1)", borderColor:"rgba(255,255,255,0.3)", color:"white", padding:"14px 32px", fontSize:15}} onClick={() => onNavigate("feed")}>
            View Issues
          </button>
        </div>
        <div className="hero-stats">
          {[["2,847","Issues Reported"],["1,203","Resolved"],["456","Volunteers"],["89","Institutions"]].map(([v,l]) => (
            <div key={l} style={{textAlign:"center"}}>
              <div className="hero-stat-value">{v}</div>
              <div className="hero-stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── AUTH PAGES ───────────────────────────────────────────────────────────────
const LoginPage = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [role, setRole] = useState("citizen");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !pass) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError("");
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    // onAuthStateChange in App will handle navigation
    // Just check approval here
    try {
      const { data: profile } = await supabase.from("profiles").select("role,approved,name").eq("id", data.user.id).single();
      if (profile && (profile.role === "government" || profile.role === "institution") && !profile.approved) {
        setError("Your account is pending admin approval. Contact the admin to get approved.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
    } catch(e) { /* ignore profile fetch errors, let session handle it */ }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{display:"flex", justifyContent:"center", marginBottom:12}}>
            <div className="logo-icon" style={{width:48, height:48, fontSize:22}}>🏙️</div>
          </div>
          <div className="auth-title">Welcome Back</div>
          <div className="auth-subtitle">Sign in to your CivicConnect account</div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-control" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-control" type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Sign in as</label>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
            {Object.entries(ROLES).map(([k, v]) => (
              <div key={k}
                onClick={() => setRole(k)}
                style={{
                  border: `2px solid ${role===k ? v.color : "#e2e8f0"}`,
                  background: role===k ? v.color+"12" : "white",
                  borderRadius:8, padding:"10px 12px", cursor:"pointer",
                  display:"flex", alignItems:"center", gap:8,
                  transition:"all 0.15s", position:"relative"
                }}
              >
                <span style={{fontSize:18}}>{v.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13, fontWeight: role===k ? 600 : 400, color: role===k ? v.color : "#334155"}}>{v.label}</div>
                  {k==="government" && (
                    <div style={{fontSize:10, color:"#94a3b8"}}>Requires approval</div>
                  )}
                </div>
                {role===k && <span style={{color:v.color, fontSize:14}}>✓</span>}
              </div>
            ))}
          </div>
          {role === "government" && (
            <div style={{marginTop:10, padding:"10px 12px", background:"#fffbeb", border:"1px solid #fde68a", borderRadius:8, fontSize:12, color:"#92400e", display:"flex", gap:8, alignItems:"flex-start"}}>
              ⚠️ Government accounts require admin verification. You can sign in but access to the dashboard will be pending approval.
            </div>
          )}
        </div>
        <div style={{textAlign:"right", marginBottom:20}}>
          <button className="auth-link" onClick={() => onNavigate("forgot")}>Forgot password?</button>
        </div>
        {error && (
          <div style={{background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#dc2626", marginBottom:16}}>
            ⚠️ {error}
          </div>
        )}
        <button className="btn btn-primary" style={{width:"100%", justifyContent:"center", padding:12}} onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in..." : `Sign In as ${ROLES[role].label}`}
        </button>
        <div style={{textAlign:"center", marginTop:20, fontSize:14, color:"#64748b"}}>
          Don't have an account?{" "}
          <button className="auth-link" onClick={() => onNavigate("signup")}>Create account</button>
        </div>
        <div style={{textAlign:"center", marginTop:16}}>
          <button className="auth-link" onClick={() => onNavigate("landing")} style={{color:"#94a3b8", textDecoration:"none", fontSize:13}}>← Back to home</button>
        </div>
      </div>
    </div>
  );
};

const SignupPage = ({ onNavigate, onLogin }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [role, setRole] = useState("citizen");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSignup = async () => {
    if (!name || !email || !pass) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError("");
    try {
      const needsApproval = role === "government" || role === "institution";
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { name, role, location } }
      });
      if (authError) { setError(authError.message); setLoading(false); return; }

      // Create profile
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        name,
        role,
        location,
        approved: !needsApproval,
      });

      if (needsApproval) {
        onNavigate("govPending");
      } else {
        onLogin({ id: data.user.id, name, email, role });
      }
    } catch (e) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{display:"flex", justifyContent:"center", marginBottom:12}}>
            <div className="logo-icon" style={{width:48, height:48, fontSize:22}}>🏙️</div>
          </div>
          <div className="auth-title">{step === 1 ? "Create Account" : step === 2 ? "Choose Your Role" : "Complete Profile"}</div>
          <div className="auth-subtitle">
            {step === 1 ? "Join the civic movement" : step === 2 ? "How will you participate?" : "Almost done!"}
          </div>
        </div>

        {/* Step indicator */}
        <div style={{display:"flex", gap:6, justifyContent:"center", marginBottom:28}}>
          {[1,2,3].map(s => (
            <div key={s} style={{width: s===step ? 24 : 8, height:8, borderRadius:4, background: s<=step ? "#1d6fde" : "#e2e8f0", transition:"all 0.3s"}} />
          ))}
        </div>

        {step === 1 && <>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-control" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" placeholder="Minimum 8 characters" value={pass} onChange={e => setPass(e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{width:"100%", justifyContent:"center", padding:12}} onClick={() => setStep(2)}>Continue</button>
          <div style={{textAlign:"center", marginTop:20, fontSize:14, color:"#64748b"}}>
            Have an account? <button className="auth-link" onClick={() => onNavigate("login")}>Sign in</button>
          </div>
        </>}

        {step === 2 && <>
          <div className="role-grid">
            {Object.entries(ROLES).map(([k, v]) => (
              <div key={k} className={`role-card ${role === k ? "selected" : ""}`} onClick={() => setRole(k)}>
                <div style={{fontSize:28, marginBottom:8}}>{v.icon}</div>
                <div style={{fontSize:14, fontWeight:600, color:"#0f172a"}}>{v.label}</div>
                <div style={{fontSize:11, color:"#64748b", marginTop:4}}>
                  {k==="citizen" ? "Report & track issues" : k==="volunteer" ? "Join activities" : k==="institution" ? "Organize programs" : "Requires admin approval"}
                </div>
                {k==="government" && (
                  <div style={{fontSize:10, background:"#fef3c7", color:"#92400e", padding:"2px 6px", borderRadius:4, marginTop:6, fontWeight:600}}>🔒 Restricted</div>
                )}
              </div>
            ))}
          </div>
          {role === "government" && (
            <div style={{marginTop:12, padding:"10px 12px", background:"#fffbeb", border:"1px solid #fde68a", borderRadius:8, fontSize:12, color:"#92400e"}}>
              ⚠️ Government accounts are manually reviewed by admin before access is granted to the dashboard.
            </div>
          )}
          <div style={{display:"flex", gap:10, marginTop:16}}>
            <button className="btn btn-outline" style={{flex:1, justifyContent:"center"}} onClick={() => setStep(1)}>Back</button>
            <button className="btn btn-primary" style={{flex:2, justifyContent:"center"}} onClick={() => setStep(3)}>Continue</button>
          </div>
        </>}

        {step === 3 && <>
          <div className="form-group">
            <label className="form-label">Location / Ward</label>
            <input className="form-control" placeholder="e.g. Sector 12, Ward 7" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <div className="notice notice-info">
            🔒 Government accounts require admin approval. You will receive an email once approved.
          </div>
          {error && (
            <div style={{background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#dc2626", marginBottom:16}}>
              ⚠️ {error}
            </div>
          )}
          <div style={{display:"flex", gap:10}}>
            <button className="btn btn-outline" style={{flex:1, justifyContent:"center"}} onClick={() => setStep(2)}>Back</button>
            <button className="btn btn-accent" style={{flex:2, justifyContent:"center"}} onClick={handleSignup} disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>
          </div>
        </>}
      </div>
    </div>
  );
};

const ForgotPage = ({ onNavigate }) => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async () => {
    if (!email) return;
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    setLoading(false);
    if (resetError) { setError(resetError.message); return; }
    setSent(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-title">Reset Password</div>
        <div className="auth-subtitle" style={{marginBottom:32}}>
          {sent ? "Check your email for reset instructions." : "Enter your email to receive a reset link."}
        </div>
        {!sent ? <>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          {error && (
            <div style={{background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#dc2626", marginBottom:16}}>
              ⚠️ {error}
            </div>
          )}
          <button className="btn btn-primary" style={{width:"100%", justifyContent:"center", padding:12}} onClick={handleReset} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </> : (
          <div className="notice notice-success" style={{justifyContent:"center"}}>✅ Reset link sent to {email}</div>
        )}
        <div style={{textAlign:"center", marginTop:20}}>
          <button className="auth-link" onClick={() => onNavigate("login")}>← Back to sign in</button>
        </div>
      </div>
    </div>
  );
};

// ─── GOVERNMENT PENDING PAGE ──────────────────────────────────────────────────
const GovPendingPage = ({ onNavigate }) => (
  <div className="auth-page">
    <div className="auth-card" style={{textAlign:"center"}}>
      <div style={{fontSize:56, marginBottom:16}}>📬</div>
      <div className="auth-title">Registration Submitted</div>
      <div className="auth-subtitle" style={{marginBottom:24}}>
        Your government account registration has been received.
      </div>
      <div className="notice notice-warning" style={{textAlign:"left", marginBottom:24}}>
        ⭐ <strong>Admin Review Required</strong><br/>
        Government and Institution accounts are manually reviewed. The admin will approve your account by updating the database. Once approved you can log in normally with your email and password.
      </div>
      <div style={{background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, padding:16, marginBottom:24, textAlign:"left"}}>
        <div style={{fontSize:13, fontWeight:600, color:"#0f2044", marginBottom:8}}>What happens next?</div>
        <div style={{fontSize:13, color:"#64748b", display:"flex", flexDirection:"column", gap:6}}>
          <div>1️⃣ Admin reviews your registration details</div>
          <div>2️⃣ Admin approves your account in Supabase</div>
          <div>3️⃣ You receive an approval email</div>
          <div>4️⃣ Sign in with your credentials to access the Government Dashboard</div>
        </div>
      </div>
      <button className="btn btn-primary" style={{width:"100%", justifyContent:"center", padding:12}} onClick={() => onNavigate("login")}>
        Back to Sign In
      </button>
    </div>
  </div>
);

// ─── MAIN APP LAYOUT ──────────────────────────────────────────────────────────
const AppLayout = ({ user, page, onNavigate, onLogout, children, toast, setToast }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id:"feed", label:"Community Feed", icon:"home" },
    { id:"report", label:"Report Issue", icon:"alert" },
    { id:"activities", label:"Activities", icon:"activity" },
    { id:"ideas", label:"Ideas", icon:"bulb" },
    { id:"profile", label:"My Profile", icon:"user" },
    ...(user.role === "government" ? [{ id:"dashboard", label:"Gov. Dashboard", icon:"dashboard" }] : []),
  ];

  const pageTitles = {
    feed:"Community Feed", report:"Report an Issue", activities:"Volunteer Activities",
    ideas:"Community Ideas", profile:"My Profile", dashboard:"Government Dashboard"
  };

  const initials = (user.name || "U").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
  const roleColor = ROLES[user.role]?.color || "#1d6fde";

  return (
    <div className="civic-app">
      <style>{globalStyles}</style>

      {/* Sidebar overlay for mobile */}
      <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? "" : "sidebar-hidden"}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-icon">🏙️</div>
            <div>
              <div className="logo-text">CivicConnect</div>
              <div className="logo-sub">Citizen Platform</div>
            </div>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-label">Navigation</div>
          {navItems.map(item => (
            <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}>
              <span className="nav-icon"><Icon name={item.icon} size={16} color="currentColor" /></span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="sidebar-user">
          <div className="user-avatar" style={{background: roleColor + "22", color: roleColor}}>
            {initials}
          </div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{ROLES[user.role]?.label || "Citizen"}</div>
          </div>
          <button onClick={onLogout} style={{background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)", padding:4}} title="Logout">
            <Icon name="logout" size={16} color="currentColor" />
          </button>
        </div>
      </aside>

      <main className="main-content" style={{marginLeft: sidebarOpen ? "260px" : "0", transition:"margin-left 0.3s ease"}}>
        <header className="topbar">
          <div style={{display:"flex", alignItems:"center", gap:12}}>
            <div className="topbar-title">{pageTitles[page] || "CivicConnect"}</div>
          </div>
          <div className="topbar-actions">
            <RoleBadge role={user.role} />
            <div style={{width:36, height:36, borderRadius:"50%", background: roleColor + "22", color: roleColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:600}}>
              {initials}
            </div>
            <button
              onClick={() => setSidebarOpen(o => !o)}
              title={sidebarOpen ? "Close menu" : "Open menu"}
              style={{
                background: sidebarOpen ? "#f1f5f9" : "white",
                border:"1.5px solid #e2e8f0", borderRadius:8,
                padding:"7px 9px", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all 0.15s"
              }}
            >
              <Icon name="menu" size={20} color="#334155" />
            </button>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

// ─── FEED PAGE ────────────────────────────────────────────────────────────────
const FeedPage = ({ user, showToast }) => {
  const [filter, setFilter] = useState("All");
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const filters = ["All", "Reported", "Under Review", "Verified", "In Progress", "Resolved"];

  const fetchIssues = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("issues")
      .select("*, profiles(name, role)")
      .order("created_at", { ascending: false });
    if (!error && data) setIssues(data);
    setLoading(false);
  };

  useEffect(() => { fetchIssues(); }, []);

  const filtered = filter === "All" ? issues : issues.filter(i => i.status === filter);

  const CATEGORY_ICONS = { Garbage:"🗑️", "Road Damage":"🛣️", Streetlight:"💡", "Water Leakage":"💧", Sanitation:"🌊", Others:"📌" };

  return (
    <div>
      <div style={{marginTop:4}}>
        <div className="section-header">
          <div>
            <div className="section-title">Community Issues</div>
            <div className="section-sub">{filtered.length} issues in your area</div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={fetchIssues}>↻ Refresh</button>
        </div>

        <div className="filter-bar">
          {filters.map(f => (
            <button key={f} className={`filter-chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f !== "All" && STATUS_META[f]?.icon + " "}{f}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{textAlign:"center", padding:48, color:"#94a3b8", fontSize:14}}>Loading issues...</div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:"center", padding:48, color:"#94a3b8", fontSize:14}}>
            <div style={{fontSize:40, marginBottom:12}}>📭</div>
            No issues found. Be the first to report one!
          </div>
        ) : (
          <div className="issue-grid">
            {filtered.map(issue => {
              const authorName = issue.profiles?.name || "Unknown";
              const authorRole = issue.profiles?.role || "citizen";
              const timeAgo = new Date(issue.created_at).toLocaleDateString();
              return (
                <div key={issue.id} className="issue-card">
                  <div className="issue-card-image" style={{padding:0, position:"relative"}}>
                    {issue.image_url ? (
                      <img src={issue.image_url} alt={issue.title} style={{width:"100%", height:"100%", objectFit:"cover", display:"block"}} />
                    ) : (
                      <span style={{fontSize:48}}>{CATEGORY_ICONS[issue.category] || "📌"}</span>
                    )}
                    {issue.verified && (
                      <div style={{position:"absolute", top:10, right:10}}>
                        <span className="verified-badge">✔ Verified by Authority</span>
                      </div>
                    )}
                  </div>
                  <div className="issue-card-body">
                    <div className="issue-meta">
                      <span className="issue-category">{issue.category}</span>
                      <StatusBadge status={issue.status} />
                    </div>
                    <div className="issue-title">{issue.title}</div>
                    <div className="issue-desc">{issue.description}</div>
                    <div style={{display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#64748b", marginBottom:12}}>
                      <Icon name="map" size={12} color="#94a3b8" /> {issue.location}
                    </div>
                    <div className="issue-footer">
                      <div className="issue-author">
                        <div style={{width:22, height:22, borderRadius:"50%", background: ROLES[authorRole]?.color + "22", color: ROLES[authorRole]?.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700}}>
                          {authorName[0]}
                        </div>
                        {authorName} · {timeAgo}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── REPORT PAGE ──────────────────────────────────────────────────────────────
const ReportPage = ({ user, showToast }) => {
  const [form, setForm] = useState({ title:"", description:"", category:"Garbage", location:"" });
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [issueId, setIssueId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showToast("Image must be under 10MB"); return; }
    if (!["image/jpeg","image/png","image/webp"].includes(file.type)) { showToast("Only JPG, PNG or WEBP allowed"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImage = async (file) => {
    const ext = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from("issue-images")
      .upload(fileName, file, { cacheControl:"3600", upsert:false });
    if (error) throw new Error("Image upload failed: " + error.message);
    const { data: { publicUrl } } = supabase.storage
      .from("issue-images")
      .getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.location) {
      showToast("Please fill all required fields.");
      return;
    }
    setUploading(true);

    try {
      // Upload image if selected
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { data, error } = await supabase.from("issues").insert({
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
        status: "Reported",
        verified: false,
        image_url: imageUrl,
        created_by: user.id,
      }).select().single();

      if (error) {
        console.error("Issue insert error:", error);
        showToast("Error: " + error.message);
        return;
      }

      setSubmitted(true);
      setIssueId(data.id.slice(0,8).toUpperCase());
      showToast("Issue reported successfully!");
    } catch(e) {
      showToast(e.message);
    } finally {
      setUploading(false);
    }
  };

  if (submitted) return (
    <div style={{maxWidth:560, margin:"40px auto", textAlign:"center"}}>
      <div style={{fontSize:64, marginBottom:16}}>✅</div>
      <div style={{fontFamily:"'Playfair Display', serif", fontSize:24, fontWeight:700, color:"#0f2044", marginBottom:8}}>Issue Reported!</div>
      <p style={{color:"#64748b", marginBottom:24, lineHeight:1.6}}>Your issue has been submitted and is now <strong>Under Review</strong> by local authorities.</p>
      <div className="notice notice-info" style={{textAlign:"left", marginBottom:24}}>
        📋 Issue ID: <strong>#INN-{issueId}</strong> — Save this for tracking
      </div>
      <div style={{display:"flex", gap:10, justifyContent:"center"}}>
        <button className="btn btn-outline" onClick={() => { setSubmitted(false); setImageFile(null); setImagePreview(null); setForm({ title:"", description:"", category:"Garbage", location:"" }); }}>Report Another</button>
        <button className="btn btn-primary" onClick={() => window.location.href="/"}>View Feed</button>
      </div>
    </div>
  );

  return (
    <div style={{maxWidth:680}}>
      <div className="notice notice-info" style={{marginBottom:24}}>
        ℹ️ All reports are reviewed by local authorities. Please provide accurate information to help resolve issues faster.
      </div>

      <div className="card" style={{padding:28}}>
        <div className="form-group">
          <label className="form-label">Issue Title *</label>
          <input className="form-control" placeholder="Briefly describe the issue (e.g. Overflowing garbage bin near park)" value={form.title} onChange={e => setForm({...form, title:e.target.value})} />
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className="form-control" value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Location *</label>
            <input className="form-control" placeholder="Street, area, landmark" value={form.location} onChange={e => setForm({...form, location:e.target.value})} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea className="form-control" placeholder="Describe the issue in detail — when did it start, what's the impact, how urgent is it?" value={form.description} onChange={e => setForm({...form, description:e.target.value})} style={{minHeight:120}} />
        </div>

        <div className="form-group">
          <label className="form-label">Photo Evidence</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{display:"none"}}
            onChange={handleImageSelect}
          />
          {!imagePreview ? (
            <div
              style={{border:"2px dashed #e2e8f0", borderRadius:10, padding:32, textAlign:"center", background:"#f8fafc", cursor:"pointer", transition:"all 0.15s"}}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor="#1d6fde"; }}
              onDragLeave={e => { e.currentTarget.style.borderColor="#e2e8f0"; }}
              onDrop={e => {
                e.preventDefault();
                e.currentTarget.style.borderColor="#e2e8f0";
                const file = e.dataTransfer.files[0];
                if (file) handleImageSelect({ target: { files: [file] } });
              }}
            >
              <Icon name="upload" size={28} color="#94a3b8" />
              <div style={{fontSize:14, color:"#64748b", marginTop:10}}>Click or drag & drop to upload photo</div>
              <div style={{fontSize:12, color:"#94a3b8", marginTop:4}}>JPG, PNG, WEBP up to 10MB</div>
            </div>
          ) : (
            <div style={{position:"relative", borderRadius:10, overflow:"hidden", border:"1px solid #e2e8f0"}}>
              <img src={imagePreview} alt="Preview" style={{width:"100%", maxHeight:240, objectFit:"cover", display:"block"}} />
              <div style={{position:"absolute", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.3)", display:"flex", alignItems:"center", justifyContent:"center", opacity:0, transition:"opacity 0.2s"}}
                onMouseEnter={e => e.currentTarget.style.opacity=1}
                onMouseLeave={e => e.currentTarget.style.opacity=0}
              >
                <button className="btn btn-sm" style={{background:"white", color:"#dc2626"}} onClick={handleRemoveImage}>
                  <Icon name="x" size={13} color="#dc2626"/> Remove
                </button>
              </div>
              <div style={{padding:"8px 12px", background:"#f8fafc", fontSize:12, color:"#64748b", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <span>📎 {imageFile?.name}</span>
                <button style={{background:"none", border:"none", color:"#dc2626", cursor:"pointer", fontSize:12}} onClick={handleRemoveImage}>Remove</button>
              </div>
            </div>
          )}
        </div>

        <div style={{display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8}}>
          <button className="btn btn-outline" onClick={() => { setForm({ title:"", description:"", category:"Garbage", location:"" }); setImageFile(null); setImagePreview(null); }}>Clear</button>
          <button className="btn btn-accent" onClick={handleSubmit} disabled={uploading}>
            {uploading ? (imageFile ? "Uploading image..." : "Submitting...") : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ACTIVITIES PAGE ──────────────────────────────────────────────────────────
const ActivitiesPage = ({ user, showToast }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [form, setForm] = useState({ title:"", description:"", location:"", date:"", required:10 });

  const fetchActivities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("activities")
      .select("*, profiles(name, role)")
      .order("created_at", { ascending: false });
    if (!error && data) setActivities(data);
    setLoading(false);
  };

  useEffect(() => { fetchActivities(); }, []);

  const handleJoin = async (act) => {
    const newCount = (act.current_volunteers || 0) + 1;
    await supabase.from("activities").update({ current_volunteers: newCount }).eq("id", act.id);
    fetchActivities();
    showToast("You've joined this activity!");
  };

  const handleCreate = async () => {
    if (!form.title || !form.location || !form.date) { showToast("Please fill all required fields."); return; }
    const { error } = await supabase.from("activities").insert({
      title: form.title,
      description: form.description,
      location: form.location,
      date: form.date,
      required_volunteers: Number(form.required),
      current_volunteers: 0,
      organizer: user.id,
    });
    if (error) { showToast("Error: " + error.message); return; }
    setShowForm(false);
    setForm({ title:"", description:"", location:"", date:"", required:10 });
    fetchActivities();
    showToast("Activity published!");
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Volunteer Activities</div>
          <div className="section-sub">Join community drives and make a difference</div>
        </div>
        <button className="btn btn-accent btn-sm" onClick={() => setShowForm(true)}>
          <Icon name="plus" size={14} color="white" /> Organize Activity
        </button>
      </div>

      <div className="tabs">
        {["upcoming","past"].map(t => (
          <button key={t} className={`tab ${activeTab===t?"active":""}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign:"center", padding:48, color:"#94a3b8", fontSize:14}}>Loading activities...</div>
      ) : activities.length === 0 ? (
        <div style={{textAlign:"center", padding:48, color:"#94a3b8", fontSize:14}}>
          <div style={{fontSize:40, marginBottom:12}}>🙋</div>
          No activities yet. Be the first to organize one!
        </div>
      ) : (
        <div style={{display:"flex", flexDirection:"column", gap:16}}>
          {activities.map(act => {
            const current = act.current_volunteers || 0;
            const required = act.required_volunteers || 10;
            const pct = Math.min(Math.round((current / required) * 100), 100);
            const organizer = act.profiles?.name || "Unknown";
            return (
              <div key={act.id} className="activity-card">
                <div className="activity-header">
                  <div>
                    <div className="activity-title">{act.title}</div>
                    <div className="activity-org">🏛️ {organizer}</div>
                  </div>
                  <button className="btn btn-sm btn-accent" onClick={() => handleJoin(act)}>
                    Join Activity
                  </button>
                </div>
                <div className="activity-desc">{act.description}</div>
                <div className="activity-info">
                  <div className="activity-info-row"><Icon name="map" size={13} color="#94a3b8"/>{act.location}</div>
                  <div className="activity-info-row"><Icon name="calendar" size={13} color="#94a3b8"/>{act.date ? new Date(act.date).toLocaleDateString() : "TBD"}</div>
                  <div className="activity-info-row"><Icon name="users" size={13} color="#94a3b8"/>{current} / {required} volunteers</div>
                </div>
                <div className="volunteer-bar">
                  <div className="volunteer-fill" style={{width:`${pct}%`}} />
                </div>
                <div className="volunteer-label">{pct}% filled — {required - current} spots remaining</div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Organize Activity</div>
              <button style={{background:"none", border:"none", cursor:"pointer"}} onClick={() => setShowForm(false)}>
                <Icon name="x" size={20} color="#64748b"/>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Activity Title *</label><input className="form-control" placeholder="e.g. Park Cleanup Drive" value={form.title} onChange={e => setForm({...form, title:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" placeholder="What's the goal? What will volunteers do?" value={form.description} onChange={e => setForm({...form, description:e.target.value})} /></div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
                <div className="form-group"><label className="form-label">Location *</label><input className="form-control" placeholder="Park/area name" value={form.location} onChange={e => setForm({...form, location:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Date *</label><input className="form-control" type="date" value={form.date} onChange={e => setForm({...form, date:e.target.value})} /></div>
              </div>
              <div className="form-group"><label className="form-label">Volunteers Required</label><input className="form-control" type="number" placeholder="e.g. 25" value={form.required} onChange={e => setForm({...form, required:e.target.value})} /></div>
              <div style={{display:"flex", justifyContent:"flex-end", gap:10}}>
                <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-accent" onClick={handleCreate}>Publish Activity</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── IDEAS PAGE ───────────────────────────────────────────────────────────────
const IdeasPage = ({ user, showToast }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const fetchIdeas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ideas")
      .select("*, profiles(name)")
      .order("support_count", { ascending: false });
    if (!error && data) setIdeas(data);
    setLoading(false);
  };

  useEffect(() => { fetchIdeas(); }, []);

  const handleSupport = async (idea) => {
    const newCount = (idea.support_count || 0) + 1;
    await supabase.from("ideas").update({ support_count: newCount }).eq("id", idea.id);
    fetchIdeas();
    showToast("Your support has been recorded!");
  };

  const handleSubmit = async () => {
    if (!title || !desc) return;
    const { error } = await supabase.from("ideas").insert({
      title,
      description: desc,
      support_count: 0,
      created_by: user.id,
    });
    if (error) { showToast("Error: " + error.message); return; }
    setShowForm(false);
    setTitle(""); setDesc("");
    fetchIdeas();
    showToast("Idea submitted!");
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Community Ideas</div>
          <div className="section-sub">Propose improvements for your community</div>
        </div>
        <button className="btn btn-accent btn-sm" onClick={() => setShowForm(true)}>
          <Icon name="plus" size={14} color="white" /> Propose Idea
        </button>
      </div>

      <div className="notice notice-info" style={{marginBottom:20}}>
        💡 Ideas with the most support get reviewed by local government authorities for implementation.
      </div>

      {loading ? (
        <div style={{textAlign:"center", padding:48, color:"#94a3b8", fontSize:14}}>Loading ideas...</div>
      ) : ideas.length === 0 ? (
        <div style={{textAlign:"center", padding:48, color:"#94a3b8", fontSize:14}}>
          <div style={{fontSize:40, marginBottom:12}}>💡</div>
          No ideas yet. Propose the first one!
        </div>
      ) : (
        <div style={{display:"flex", flexDirection:"column", gap:14}}>
          {ideas.map((idea, idx) => (
            <div key={idea.id} className="idea-card">
              <div className="idea-support">
                <div className="support-count">{idea.support_count || 0}</div>
                <div className="support-label">supports</div>
                <button className="support-btn" onClick={() => handleSupport(idea)}>
                  <Icon name="thumbsUp" size={12} color="currentColor" />
                  Support
                </button>
              </div>
              <div className="idea-content">
                {idx === 0 && <span style={{fontSize:10, background:"#fef3c7", color:"#d97706", padding:"1px 7px", borderRadius:3, fontWeight:700, letterSpacing:0.5, textTransform:"uppercase", marginBottom:6, display:"inline-block"}}>🔥 Top Idea</span>}
                <div className="idea-title">{idea.title}</div>
                <div className="idea-desc">{idea.description}</div>
                <div className="idea-meta">
                  <span>👤 {idea.profiles?.name || "Unknown"}</span>
                  <span>🕐 {new Date(idea.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Propose an Idea</div>
              <button style={{background:"none", border:"none", cursor:"pointer"}} onClick={() => setShowForm(false)}>
                <Icon name="x" size={20} color="#64748b"/>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Idea Title</label><input className="form-control" placeholder="e.g. Install solar street lights" value={title} onChange={e => setTitle(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" placeholder="Explain your idea, how it helps the community, estimated impact..." value={desc} onChange={e => setDesc(e.target.value)} /></div>
              <div style={{display:"flex", justifyContent:"flex-end", gap:10}}>
                <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-accent" onClick={handleSubmit}>Submit Idea</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
const ProfilePage = ({ user, showToast, onRoleChange }) => {
  const initials = (user.name||"U").split(" ").map(w=>w[0]).join("").toUpperCase();
  const roleColor = ROLES[user.role]?.color || "#1d6fde";
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);

  const handleRoleSave = () => {
    onRoleChange(selectedRole);
    setShowRoleModal(false);
    showToast(`Role switched to ${ROLES[selectedRole].label}!`);
  };

  return (
    <div style={{maxWidth:720}}>
      <div className="card" style={{marginBottom:24}}>
        <div className="profile-cover" />
        <div style={{paddingBottom:24, position:"relative"}}>
          <div className="profile-avatar-wrap">
            <div className="profile-avatar" style={{background: roleColor + "22", color: roleColor}}>
              {initials}
            </div>
          </div>
          <div style={{paddingTop:56, paddingLeft:28, paddingRight:28}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
              <div>
                {editing
                  ? <input className="form-control" value={name} onChange={e=>setName(e.target.value)} style={{fontSize:22, fontWeight:700, marginBottom:6}} />
                  : <div style={{fontFamily:"'Playfair Display', serif", fontSize:22, fontWeight:700, color:"#0f2044", marginBottom:4}}>{user.name}</div>
                }
                <div style={{display:"flex", gap:8, flexWrap:"wrap", alignItems:"center"}}>
                  <RoleBadge role={user.role} />
                  <span style={{fontSize:13, color:"#64748b"}}>📍 Sector 12, Ward 7</span>
                  <span style={{fontSize:13, color:"#64748b"}}>📅 Joined Dec 2025</span>
                </div>
              </div>
              <div style={{display:"flex", gap:8}}>
                <button className="btn btn-outline btn-sm" onClick={() => setShowRoleModal(true)}>
                  🔄 Switch Role
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => { setEditing(!editing); if(editing) showToast("Profile updated!"); }}>
                  {editing ? <><Icon name="check" size={13} color="currentColor"/>Save</> : "Edit Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24}}>
        {[["5","Issues Reported","📋"],["3","Activities Joined","🙋"],["12","Ideas Supported","💡"],["2","Certificates","🏆"]].map(([v,l,e]) => (
          <div key={l} className="card" style={{padding:16, textAlign:"center"}}>
            <div style={{fontSize:24, marginBottom:6}}>{e}</div>
            <div style={{fontFamily:"'Playfair Display', serif", fontSize:20, fontWeight:700, color:"#0f2044"}}>{v}</div>
            <div style={{fontSize:11, color:"#64748b"}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Certificates */}
      <div className="card" style={{padding:24}}>
        <div style={{fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:700, color:"#0f2044", marginBottom:16}}>
          🏅 Volunteer Certificates
        </div>
        <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
          {[{name:"Park Cleanup Champion", date:"Nov 2025", org:"GreenCity"}, {name:"Tree Plantation Drive", date:"Oct 2025", org:"EcoAction"}].map(cert => (
            <div key={cert.name} style={{border:"1.5px solid #e2e8f0", borderRadius:10, padding:16, minWidth:200, background:"linear-gradient(135deg, #fefce8, #fef9c3)"}}>
              <div style={{fontSize:22, marginBottom:8}}>🏆</div>
              <div style={{fontSize:13, fontWeight:700, color:"#0f2044", marginBottom:4}}>{cert.name}</div>
              <div style={{fontSize:12, color:"#64748b"}}>{cert.org} · {cert.date}</div>
              <button className="btn btn-outline btn-sm" style={{marginTop:10}} onClick={() => showToast("Certificate downloaded!")}>Download</button>
            </div>
          ))}
        </div>
      </div>

      {/* Role Switch Modal */}
      {showRoleModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowRoleModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Switch Role</div>
              <button style={{background:"none", border:"none", cursor:"pointer"}} onClick={() => setShowRoleModal(false)}>
                <Icon name="x" size={20} color="#64748b"/>
              </button>
            </div>
            <div className="modal-body">
              <p style={{fontSize:13, color:"#64748b", marginBottom:20}}>
                Switching your role changes what you can do on the platform. Your reports and activity history are preserved.
              </p>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24}}>
                {Object.entries(ROLES).map(([k, v]) => (
                  <div key={k}
                    onClick={() => setSelectedRole(k)}
                    style={{
                      border: `2px solid ${selectedRole===k ? v.color : "#e2e8f0"}`,
                      background: selectedRole===k ? v.color+"12" : "white",
                      borderRadius:10, padding:16, cursor:"pointer",
                      textAlign:"center", transition:"all 0.15s",
                      position:"relative"
                    }}
                  >
                    {user.role===k && (
                      <span style={{position:"absolute", top:8, right:8, fontSize:10, background:"#e2e8f0", color:"#64748b", padding:"1px 6px", borderRadius:4, fontWeight:600}}>CURRENT</span>
                    )}
                    <div style={{fontSize:28, marginBottom:6}}>{v.icon}</div>
                    <div style={{fontSize:14, fontWeight:600, color: selectedRole===k ? v.color : "#0f172a"}}>{v.label}</div>
                    <div style={{fontSize:11, color:"#94a3b8", marginTop:4}}>
                      {k==="citizen" ? "Report & track issues" : k==="volunteer" ? "Join activities" : k==="institution" ? "Organize programs" : "Requires approval"}
                    </div>
                  </div>
                ))}
              </div>
              {selectedRole === "government" && (
                <div className="notice notice-warning" style={{marginBottom:16}}>
                  ⚠️ Government role requires admin approval. Your request will be reviewed within 24 hours.
                </div>
              )}
              <div style={{display:"flex", justifyContent:"flex-end", gap:10}}>
                <button className="btn btn-outline" onClick={() => setShowRoleModal(false)}>Cancel</button>
                <button className="btn btn-accent" onClick={handleRoleSave} disabled={selectedRole===user.role}>
                  {selectedRole===user.role ? "Already this role" : `Switch to ${ROLES[selectedRole].label}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── GOV DASHBOARD ────────────────────────────────────────────────────────────
const DashboardPage = ({ user, showToast }) => {
  const [issues, setIssues] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ total:0, resolved:0, volunteers:0, institutions:0 });
  const [activeTab, setActiveTab] = useState("issues");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: issuesData }, { data: activitiesData }, { data: profiles }] = await Promise.all([
      supabase.from("issues").select("*, profiles(name, role)").order("created_at", { ascending: false }),
      supabase.from("activities").select("*, profiles(name)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("role"),
    ]);
    if (issuesData) {
      setIssues(issuesData);
      setStats({
        total: issuesData.length,
        resolved: issuesData.filter(i => i.status === "Resolved").length,
        volunteers: profiles?.filter(p => p.role === "volunteer").length || 0,
        institutions: profiles?.filter(p => p.role === "institution").length || 0,
      });
    }
    if (activitiesData) setActivities(activitiesData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleVerify = async (id) => {
    await supabase.from("issues").update({ verified: true, status: "Verified" }).eq("id", id);
    fetchData();
    showToast("Issue verified!");
  };

  const handleStatus = async (id, status) => {
    await supabase.from("issues").update({ status }).eq("id", id);
    fetchData();
    showToast(`Status updated to "${status}"`);
  };

  const statCards = [
    { label:"Total Issues", value: stats.total, icon:"📋", color:"#1d6fde" },
    { label:"Resolved", value: stats.resolved, icon:"✅", color:"#059669" },
    { label:"Volunteers", value: stats.volunteers, icon:"🙋", color:"#7c3aed" },
    { label:"Institutions", value: stats.institutions, icon:"🏛️", color:"#d97706" },
  ];

  return (
    <div>
      <div className="notice notice-warning" style={{marginBottom:24}}>
        ⭐ <strong>Government Dashboard</strong> — Restricted access. All actions are logged and audited.
      </div>

      <div className="stats-grid">
        {statCards.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{position:"absolute", top:0, left:0, right:0, height:3, background:s.color, borderRadius:"12px 12px 0 0"}} />
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="tabs">
        {["issues","activities","announcements"].map(t => (
          <button key={t} className={`tab ${activeTab===t?"active":""}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "issues" && (
        loading ? <div style={{textAlign:"center", padding:32, color:"#94a3b8"}}>Loading...</div> :
        issues.length === 0 ? <div style={{textAlign:"center", padding:32, color:"#94a3b8"}}>No issues reported yet.</div> :
        <div className="card">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Issue</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {issues.map(issue => (
                <tr key={issue.id}>
                  <td>
                    <div style={{fontWeight:500, color:"#0f172a", marginBottom:2}}>{issue.title}</div>
                    <div style={{fontSize:12, color:"#94a3b8"}}>by {issue.profiles?.name || "Unknown"} · {new Date(issue.created_at).toLocaleDateString()}</div>
                  </td>
                  <td><span className="issue-category">{issue.category}</span></td>
                  <td style={{fontSize:12}}>{issue.location}</td>
                  <td><StatusBadge status={issue.status} /></td>
                  <td>
                    {issue.verified
                      ? <span className="verified-badge">✔ Verified</span>
                      : <button className="btn btn-sm" style={{background:"#ecfdf5", color:"#059669", border:"1px solid #a7f3d0"}} onClick={() => handleVerify(issue.id)}>Verify</button>
                    }
                  </td>
                  <td>
                    <select
                      style={{fontSize:12, padding:"4px 8px", border:"1px solid #e2e8f0", borderRadius:6, background:"white", cursor:"pointer", fontFamily:"inherit"}}
                      value={issue.status}
                      onChange={e => handleStatus(issue.id, e.target.value)}
                    >
                      {Object.keys(STATUS_META).map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "activities" && (
        loading ? <div style={{textAlign:"center", padding:32, color:"#94a3b8"}}>Loading...</div> :
        activities.length === 0 ? <div style={{textAlign:"center", padding:32, color:"#94a3b8"}}>No activities yet.</div> :
        <div style={{display:"flex", flexDirection:"column", gap:12}}>
          {activities.map(act => (
            <div key={act.id} className="card" style={{padding:16, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div>
                <div style={{fontWeight:600, color:"#0f172a", marginBottom:4}}>{act.title}</div>
                <div style={{fontSize:13, color:"#64748b"}}>{act.profiles?.name || "Unknown"} · {act.date ? new Date(act.date).toLocaleDateString() : "TBD"} · {act.location}</div>
              </div>
              <div style={{display:"flex", gap:8, alignItems:"center"}}>
                <span style={{fontSize:13, color:"#64748b"}}>{act.current_volunteers}/{act.required_volunteers} volunteers</span>
                <button className="btn btn-sm btn-outline" onClick={() => showToast("Appreciation published!")}>
                  <Icon name="award" size={13} color="currentColor"/> Publish Appreciation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "announcements" && (
        <div style={{maxWidth:560}}>
          <div className="form-group"><label className="form-label">Announcement Title</label><input className="form-control" placeholder="Official announcement heading" /></div>
          <div className="form-group"><label className="form-label">Message</label><textarea className="form-control" placeholder="Official message to the community..." /></div>
          <button className="btn btn-primary" onClick={() => showToast("Announcement published!")}>
            <Icon name="shield" size={15} color="white"/> Publish Official Announcement
          </button>
        </div>
      )}
    </div>
  );
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
  }, []);

  // Restore session on mount
  useEffect(() => {
    const loadUser = async (session) => {
      if (!session) return;
      const u = session.user;
      // Always build a fallback from session metadata
      const fallback = {
        id: u.id,
        email: u.email,
        name: u.user_metadata?.name || u.email.split("@")[0],
        role: u.user_metadata?.role || "citizen",
      };
      try {
        const { data: profile } = await supabase
          .from("profiles").select("*").eq("id", u.id).single();
        if (profile) {
          // Block unapproved govt/institution
          if ((profile.role === "government" || profile.role === "institution") && !profile.approved) {
            await supabase.auth.signOut();
            return;
          }
          setUser({ id: profile.id, name: profile.name || fallback.name, email: profile.email, role: profile.role });
        } else {
          setUser(fallback);
        }
      } catch(e) {
        // Profile fetch failed — use fallback so user is never stuck
        setUser(fallback);
      }
      setPage("feed");
    };

    supabase.auth.getSession().then(({ data: { session } }) => { loadUser(session); });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await loadUser(session);
      }
      if (event === "SIGNED_OUT") {
        setUser(null);
        setPage("landing");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setPage("feed");
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.log("Sign out error:", e);
    } finally {
      // Always clear local state and storage regardless
      localStorage.clear();
      setUser(null);
      setPage("landing");
      showToast("Signed out successfully.");
    }
  };

  const handleRoleChange = async (newRole) => {
    // Update in Supabase
    await supabase.from("profiles").update({ role: newRole, approved: newRole === "government" ? false : true }).eq("id", user.id);
    setUser(prev => ({ ...prev, role: newRole }));
    if (page === "dashboard" && newRole !== "government") setPage("feed");
    if (newRole === "government") showToast("Government role request sent. Pending admin approval.");
  };

  const navigate = (p) => {
    if (["feed","report","activities","ideas","profile","dashboard"].includes(p) && !user) {
      setPage("login");
      return;
    }
    setPage(p);
  };

  const pageMap = {
    landing: <LandingPage onNavigate={navigate} />,
    login: <LoginPage onNavigate={navigate} onLogin={handleLogin} />,
    signup: <SignupPage onNavigate={navigate} onLogin={handleLogin} />,
    forgot: <ForgotPage onNavigate={navigate} />,
    govPending: <GovPendingPage onNavigate={navigate} />,
  };

  if (!user && pageMap[page]) {
    return (
      <>
        <style>{globalStyles}</style>
        {pageMap[page]}
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </>
    );
  }

  const pageContent = {
    feed: <FeedPage user={user} showToast={showToast} />,
    report: <ReportPage user={user} showToast={showToast} />,
    activities: <ActivitiesPage user={user} showToast={showToast} />,
    ideas: <IdeasPage user={user} showToast={showToast} />,
    profile: <ProfilePage user={user} showToast={showToast} onRoleChange={handleRoleChange} />,
    dashboard: user?.role === "government" ? <DashboardPage user={user} showToast={showToast} /> : <FeedPage user={user} showToast={showToast} />,
  };

  return (
    <AppLayout user={user} page={page} onNavigate={navigate} onLogout={handleLogout} toast={toast} setToast={setToast}>
      {pageContent[page] || <FeedPage user={user} showToast={showToast} />}
    </AppLayout>
  );
}