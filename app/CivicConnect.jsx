'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

// ─── Supabase Client ───────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
)

// ─── Global Styles ─────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #0f2044;
    --navy-deep: #081428;
    --navy-mid: #162d5c;
    --navy-light: #1e3a6e;
    --blue: #1d6fde;
    --blue-light: #3b8eff;
    --blue-pale: #dbeafe;
    --white: #ffffff;
    --grey-50: #f8fafc;
    --grey-100: #f1f5f9;
    --grey-200: #e2e8f0;
    --grey-300: #cbd5e1;
    --grey-400: #94a3b8;
    --grey-500: #64748b;
    --grey-600: #475569;
    --grey-700: #334155;
    --grey-800: #1e293b;
    --green: #059669;
    --green-light: #d1fae5;
    --yellow: #d97706;
    --yellow-light: #fef3c7;
    --red: #dc2626;
    --red-light: #fee2e2;
    --orange: #ea580c;
    --orange-light: #ffedd5;
    --purple: #7c3aed;
    --purple-light: #ede9fe;
    --sidebar-width: 260px;
    --topbar-height: 64px;
    --transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  html, body { height: 100%; font-family: 'DM Sans', sans-serif; background: var(--grey-50); color: var(--grey-800); }

  h1, h2, h3, h4, h5 { font-family: 'Playfair Display', serif; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--grey-300); border-radius: 3px; }

  /* ── Layout ── */
  .app-shell { display: flex; height: 100vh; overflow: hidden; }

  .sidebar {
    position: fixed; top: 0; left: 0; bottom: 0;
    width: var(--sidebar-width);
    background: linear-gradient(180deg, var(--navy-deep) 0%, var(--navy) 50%, var(--navy-mid) 100%);
    display: flex; flex-direction: column;
    z-index: 100;
    transform: translateX(0);
    transition: transform var(--transition);
    box-shadow: 4px 0 24px rgba(0,0,0,0.15);
    overflow: hidden;
  }
  /* Desktop: hidden = slide out left */
  .sidebar.hidden { transform: translateX(calc(-1 * var(--sidebar-width))); }

  .sidebar-logo {
    padding: 24px 20px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .sidebar-logo-mark {
    display: flex; align-items: center; gap: 10px;
  }
  .sidebar-logo-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, var(--blue), var(--blue-light));
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(29,111,222,0.4);
  }
  .sidebar-logo-text { font-family: 'Playfair Display', serif; color: white; font-size: 17px; font-weight: 700; line-height: 1.2; }
  .sidebar-logo-sub { color: rgba(255,255,255,0.45); font-size: 10px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 2px; }

  .sidebar-nav { flex: 1; overflow-y: auto; padding: 12px 0; }
  .nav-section-label {
    padding: 12px 20px 6px;
    font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: rgba(255,255,255,0.35);
  }
  .nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 20px;
    color: rgba(255,255,255,0.65);
    cursor: pointer;
    transition: all var(--transition);
    font-size: 14px; font-weight: 500;
    position: relative;
    border-left: 3px solid transparent;
    margin: 1px 0;
  }
  .nav-item:hover { color: white; background: rgba(255,255,255,0.06); }
  .nav-item.active {
    color: white;
    background: rgba(29,111,222,0.2);
    border-left-color: var(--blue-light);
  }
  .nav-item.active .nav-icon { color: var(--blue-light); }
  .nav-icon { font-size: 18px; width: 20px; text-align: center; flex-shrink: 0; }

  .sidebar-footer {
    padding: 16px 20px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .sidebar-user {
    display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
  }
  .user-avatar {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, var(--blue), var(--blue-light));
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700; color: white;
    flex-shrink: 0;
    overflow: hidden;
  }
  .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .user-info-name { color: white; font-size: 13px; font-weight: 600; }
  .user-info-role { color: rgba(255,255,255,0.45); font-size: 11px; text-transform: capitalize; }
  .logout-btn {
    width: 100%; padding: 9px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: rgba(255,255,255,0.7);
    font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all var(--transition);
    display: flex; align-items: center; gap: 8px; justify-content: center;
  }
  .logout-btn:hover { background: rgba(220,38,38,0.15); border-color: rgba(220,38,38,0.3); color: #fca5a5; }

  /* ── Topbar ── */
  .topbar {
    position: fixed; top: 0; right: 0;
    left: var(--sidebar-width);
    height: var(--topbar-height);
    background: white;
    border-bottom: 1px solid var(--grey-200);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px;
    z-index: 50;
    transition: left var(--transition);
    box-shadow: 0 1px 8px rgba(0,0,0,0.04);
  }
  /* When sidebar is hidden, topbar takes full width */
  .topbar.sidebar-hidden { left: 0; }
  .topbar-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--navy); }
  .topbar-right { display: flex; align-items: center; gap: 12px; }
  .topbar-avatar { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--blue), var(--blue-light)); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: white; cursor: pointer; overflow: hidden; }
  .topbar-avatar img { width: 100%; height: 100%; object-fit: cover; }

  .hamburger-btn {
    width: 36px; height: 36px;
    border: 1px solid var(--grey-200);
    border-radius: 8px;
    background: white;
    cursor: pointer;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
    transition: all var(--transition);
  }
  .hamburger-btn:hover { background: var(--grey-50); border-color: var(--grey-300); }
  .hamburger-line { width: 16px; height: 1.5px; background: var(--grey-600); border-radius: 2px; transition: all var(--transition); }

  .role-badge {
    padding: 4px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
    text-transform: capitalize;
  }
  .role-badge.citizen { background: var(--blue-pale); color: var(--blue); }
  .role-badge.volunteer { background: var(--green-light); color: var(--green); }
  .role-badge.institution { background: var(--purple-light); color: var(--purple); }
  .role-badge.government { background: var(--yellow-light); color: var(--yellow); }

  /* ── Main Content ── */
  .main-content {
    margin-left: var(--sidebar-width);
    margin-top: var(--topbar-height);
    flex: 1; overflow-y: auto;
    padding: 28px 28px;
    transition: margin-left var(--transition);
    min-height: calc(100vh - var(--topbar-height));
  }
  .main-content.sidebar-hidden { margin-left: 0; }

  /* ── Cards ── */
  .card {
    background: white; border-radius: 14px;
    border: 1px solid var(--grey-200);
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    overflow: hidden;
  }
  .card-header { padding: 18px 20px 14px; border-bottom: 1px solid var(--grey-100); }
  .card-body { padding: 20px; }

  /* ── Buttons ── */
  .btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 18px; border-radius: 9px;
    font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all var(--transition);
    border: none; outline: none; text-decoration: none;
  }
  .btn-primary { background: var(--blue); color: white; box-shadow: 0 2px 8px rgba(29,111,222,0.3); }
  .btn-primary:hover { background: var(--blue-light); box-shadow: 0 4px 14px rgba(29,111,222,0.4); transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .btn-secondary { background: var(--grey-100); color: var(--grey-700); border: 1px solid var(--grey-200); }
  .btn-secondary:hover { background: var(--grey-200); }
  .btn-outline { background: transparent; color: var(--blue); border: 1.5px solid var(--blue); }
  .btn-outline:hover { background: var(--blue-pale); }
  .btn-danger { background: var(--red); color: white; }
  .btn-danger:hover { background: #b91c1c; }
  .btn-sm { padding: 7px 13px; font-size: 13px; border-radius: 7px; }
  .btn-xs { padding: 5px 10px; font-size: 12px; border-radius: 6px; }
  .btn-icon { padding: 8px; border-radius: 8px; }
  .btn-ghost { background: transparent; color: var(--grey-600); border: 1px solid transparent; }
  .btn-ghost:hover { background: var(--grey-100); color: var(--grey-800); }

  /* ── Forms ── */
  .form-group { margin-bottom: 18px; }
  .form-label { display: block; font-size: 13px; font-weight: 600; color: var(--grey-700); margin-bottom: 6px; }
  .form-input {
    width: 100%; padding: 11px 14px;
    border: 1.5px solid var(--grey-200); border-radius: 9px;
    font-size: 14px; font-family: 'DM Sans', sans-serif; color: var(--grey-800);
    background: white; outline: none;
    transition: border-color var(--transition), box-shadow var(--transition);
  }
  .form-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(29,111,222,0.1); }
  .form-input::placeholder { color: var(--grey-400); }
  .form-textarea { resize: vertical; min-height: 100px; }
  .form-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; cursor: pointer; }
  .form-hint { font-size: 12px; color: var(--grey-500); margin-top: 5px; }
  .form-error { font-size: 12px; color: var(--red); margin-top: 5px; }

  /* ── Status Badges ── */
  .status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .status-Reported { background: var(--grey-100); color: var(--grey-600); }
  .status-Under-Review { background: var(--yellow-light); color: var(--yellow); }
  .status-Verified { background: var(--blue-pale); color: var(--blue); }
  .status-In-Progress { background: var(--orange-light); color: var(--orange); }
  .status-Resolved { background: var(--green-light); color: var(--green); }

  /* ── Alert / Notice ── */
  .alert { padding: 12px 16px; border-radius: 9px; font-size: 13px; display: flex; align-items: flex-start; gap: 10px; }
  .alert-error { background: var(--red-light); color: var(--red); border: 1px solid rgba(220,38,38,0.2); }
  .alert-warning { background: var(--yellow-light); color: var(--yellow); border: 1px solid rgba(217,119,6,0.2); }
  .alert-success { background: var(--green-light); color: var(--green); border: 1px solid rgba(5,150,105,0.2); }
  .alert-info { background: var(--blue-pale); color: var(--blue); border: 1px solid rgba(29,111,222,0.2); }

  /* ── Grid ── */
  .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .grid-issues { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px; }

  /* ── Landing Page ── */
  .landing { min-height: 100vh; background: var(--navy-deep); overflow-x: hidden; }
  .landing-hero {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--navy-deep) 0%, var(--navy) 40%, var(--navy-mid) 100%);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 40px 20px;
    position: relative; overflow: hidden;
  }
  .landing-hero::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at 30% 50%, rgba(29,111,222,0.15) 0%, transparent 60%),
                radial-gradient(ellipse at 70% 30%, rgba(29,111,222,0.08) 0%, transparent 50%);
  }
  .landing-hero::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 120px;
    background: linear-gradient(to bottom, transparent, rgba(8,20,40,0.5));
  }
  .landing-content { position: relative; z-index: 1; max-width: 720px; }
  .landing-logo { display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 48px; }
  .landing-logo-icon { width: 56px; height: 56px; background: linear-gradient(135deg, var(--blue), var(--blue-light)); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; box-shadow: 0 8px 24px rgba(29,111,222,0.4); }
  .landing-logo-text { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 800; color: white; }
  .landing-tagline { font-family: 'Playfair Display', serif; font-size: clamp(36px, 6vw, 60px); font-weight: 800; color: white; line-height: 1.15; margin-bottom: 20px; }
  .landing-tagline span { color: var(--blue-light); }
  .landing-sub { font-size: 18px; color: rgba(255,255,255,0.65); line-height: 1.6; max-width: 520px; margin: 0 auto 40px; }
  .landing-cta { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .landing-btn-primary { padding: 14px 32px; background: var(--blue); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all var(--transition); box-shadow: 0 4px 16px rgba(29,111,222,0.4); }
  .landing-btn-primary:hover { background: var(--blue-light); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(29,111,222,0.5); }
  .landing-btn-outline { padding: 14px 32px; background: transparent; color: white; border: 1.5px solid rgba(255,255,255,0.3); border-radius: 12px; font-size: 16px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all var(--transition); }
  .landing-btn-outline:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.5); }

  .landing-stats { 
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
    background: rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden;
    max-width: 800px; margin: 60px auto 0;
  }
  .landing-stat { background: rgba(255,255,255,0.04); padding: 28px 20px; text-align: center; }
  .landing-stat-num { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 800; color: white; line-height: 1; }
  .landing-stat-label { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 6px; letter-spacing: 0.05em; text-transform: uppercase; }

  /* ── Auth Pages ── */
  .auth-page {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--navy-deep) 0%, var(--navy) 100%);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    position: relative;
  }
  .auth-page::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at 40% 50%, rgba(29,111,222,0.12) 0%, transparent 60%);
  }
  .auth-card {
    background: white; border-radius: 20px;
    width: 100%; max-width: 460px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.3);
    overflow: hidden; position: relative; z-index: 1;
  }
  .auth-card-wide { max-width: 540px; }
  .auth-header {
    padding: 32px 32px 24px;
    background: linear-gradient(135deg, var(--navy), var(--navy-mid));
    text-align: center;
  }
  .auth-logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 12px; }
  .auth-logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, var(--blue), var(--blue-light)); border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 12px rgba(29,111,222,0.4); }
  .auth-logo-text { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 800; color: white; }
  .auth-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: white; margin-bottom: 4px; }
  .auth-subtitle { font-size: 13px; color: rgba(255,255,255,0.55); }
  .auth-body { padding: 28px 32px 32px; }

  .role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 4px; }
  .role-card {
    padding: 14px 12px; border-radius: 11px;
    border: 2px solid var(--grey-200);
    cursor: pointer; transition: all var(--transition);
    text-align: center; position: relative;
    background: white;
  }
  .role-card:hover { border-color: var(--blue); background: var(--blue-pale); }
  .role-card.selected { border-color: var(--blue); background: var(--blue-pale); }
  .role-card-icon { font-size: 24px; margin-bottom: 6px; }
  .role-card-name { font-size: 13px; font-weight: 700; color: var(--grey-800); }
  .role-card-sub { font-size: 11px; color: var(--grey-500); margin-top: 2px; }
  .restricted-badge { position: absolute; top: 6px; right: 6px; background: var(--yellow-light); color: var(--yellow); font-size: 9px; font-weight: 700; padding: 2px 5px; border-radius: 4px; letter-spacing: 0.03em; }

  .step-indicator { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
  .step-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; transition: all var(--transition); }
  .step-dot.done { background: var(--green); color: white; }
  .step-dot.active { background: var(--blue); color: white; box-shadow: 0 0 0 3px var(--blue-pale); }
  .step-dot.pending { background: var(--grey-200); color: var(--grey-500); }
  .step-line { flex: 1; height: 2px; background: var(--grey-200); border-radius: 1px; }
  .step-line.done { background: var(--blue); }

  .auth-footer { text-align: center; margin-top: 20px; font-size: 13px; color: var(--grey-500); }
  .auth-link { color: var(--blue); font-weight: 600; cursor: pointer; text-decoration: none; }
  .auth-link:hover { text-decoration: underline; }

  /* ── Pending Page ── */
  .pending-page {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--navy-deep) 0%, var(--navy) 100%);
    display: flex; align-items: center; justify-content: center; padding: 20px;
  }
  .pending-card {
    background: white; border-radius: 20px; max-width: 560px; width: 100%;
    padding: 48px 40px; text-align: center;
    box-shadow: 0 24px 80px rgba(0,0,0,0.3);
  }
  .pending-icon { font-size: 64px; margin-bottom: 20px; }
  .pending-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: var(--navy); margin-bottom: 12px; }
  .pending-desc { color: var(--grey-600); line-height: 1.7; margin-bottom: 28px; font-size: 15px; }
  .pending-steps { text-align: left; background: var(--grey-50); border-radius: 12px; padding: 20px 24px; margin-bottom: 28px; }
  .pending-step { display: flex; align-items: flex-start; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--grey-200); font-size: 14px; color: var(--grey-700); }
  .pending-step:last-child { border-bottom: none; }
  .pending-step-num { width: 24px; height: 24px; background: var(--blue); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }

  /* ── Feed ── */
  .filter-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
  .chip { padding: 7px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all var(--transition); border: 1.5px solid var(--grey-200); background: white; color: var(--grey-600); }
  .chip:hover { border-color: var(--blue); color: var(--blue); background: var(--blue-pale); }
  .chip.active { background: var(--blue); color: white; border-color: var(--blue); font-weight: 600; }

  .issue-card { background: white; border-radius: 14px; border: 1px solid var(--grey-200); overflow: hidden; transition: all var(--transition); box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
  .issue-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-color: var(--grey-300); }
  .issue-card-image { height: 180px; background: var(--grey-100); display: flex; align-items: center; justify-content: center; font-size: 56px; position: relative; overflow: hidden; }
  .issue-card-image img { width: 100%; height: 100%; object-fit: cover; }
  .issue-card-verified { position: absolute; top: 10px; left: 10px; background: rgba(5,150,105,0.9); color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 4px; backdrop-filter: blur(4px); }
  .issue-card-status { position: absolute; top: 10px; right: 10px; }
  .issue-card-body { padding: 16px; }
  .issue-card-category { font-size: 11px; font-weight: 600; color: var(--grey-400); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 6px; }
  .issue-card-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--grey-900); margin-bottom: 6px; line-height: 1.35; }
  .issue-card-desc { font-size: 13px; color: var(--grey-500); line-height: 1.5; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; margin-bottom: 12px; }
  .issue-card-meta { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: var(--grey-400); border-top: 1px solid var(--grey-100); padding-top: 10px; }
  .issue-card-loc { display: flex; align-items: center; gap: 4px; }
  .issue-card-actions { display: flex; gap: 8px; }
  .issue-action-btn { display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; background: var(--grey-100); border: none; font-size: 12px; color: var(--grey-600); cursor: pointer; transition: all var(--transition); font-family: 'DM Sans', sans-serif; }
  .issue-action-btn:hover { background: var(--blue-pale); color: var(--blue); }

  /* ── Report Issue ── */
  .upload-area {
    border: 2px dashed var(--grey-300); border-radius: 12px;
    padding: 36px 20px; text-align: center; cursor: pointer;
    transition: all var(--transition); background: var(--grey-50);
  }
  .upload-area:hover, .upload-area.drag-over { border-color: var(--blue); background: var(--blue-pale); }
  .upload-area-icon { font-size: 36px; margin-bottom: 10px; }
  .upload-area-text { font-size: 14px; color: var(--grey-600); font-weight: 500; }
  .upload-area-hint { font-size: 12px; color: var(--grey-400); margin-top: 4px; }
  .upload-preview { position: relative; border-radius: 12px; overflow: hidden; }
  .upload-preview img { width: 100%; max-height: 220px; object-fit: cover; border-radius: 12px; }
  .upload-remove { position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 6px; padding: 5px 8px; cursor: pointer; font-size: 12px; font-family: 'DM Sans', sans-serif; transition: all var(--transition); }
  .upload-remove:hover { background: var(--red); }

  .success-screen { text-align: center; padding: 48px 24px; }
  .success-icon { font-size: 64px; margin-bottom: 20px; }
  .success-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: var(--navy); margin-bottom: 10px; }
  .success-id { background: var(--grey-100); border-radius: 8px; padding: 10px 16px; font-size: 13px; color: var(--grey-600); display: inline-block; margin-bottom: 24px; font-family: monospace; }

  /* ── Activities ── */
  .activity-card { background: white; border-radius: 14px; border: 1px solid var(--grey-200); padding: 20px; transition: all var(--transition); box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
  .activity-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.07); border-color: var(--grey-300); }
  .activity-title { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 700; color: var(--navy); margin-bottom: 6px; }
  .activity-meta { font-size: 12px; color: var(--grey-500); margin-bottom: 10px; display: flex; flex-wrap: wrap; gap: 12px; }
  .activity-meta-item { display: flex; align-items: center; gap: 4px; }
  .progress-bar { height: 6px; background: var(--grey-100); border-radius: 3px; overflow: hidden; margin: 10px 0; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, var(--blue), var(--blue-light)); border-radius: 3px; transition: width 0.5s ease; }

  /* ── Ideas ── */
  .idea-card { background: white; border-radius: 14px; border: 1px solid var(--grey-200); padding: 20px; transition: all var(--transition); box-shadow: 0 1px 4px rgba(0,0,0,0.04); position: relative; }
  .idea-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.07); }
  .idea-top-badge { position: absolute; top: 14px; right: 14px; background: linear-gradient(135deg, var(--yellow), #f59e0b); color: white; padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 700; }
  .idea-title { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 700; color: var(--navy); margin-bottom: 8px; padding-right: 80px; }
  .idea-desc { font-size: 13px; color: var(--grey-600); line-height: 1.55; margin-bottom: 14px; }
  .idea-footer { display: flex; align-items: center; justify-content: space-between; }
  .support-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; border: 1.5px solid var(--blue); background: white; color: var(--blue); font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all var(--transition); }
  .support-btn:hover { background: var(--blue); color: white; }
  .support-btn.supported { background: var(--blue); color: white; }

  /* ── Profile ── */
  .profile-cover { height: 160px; background: linear-gradient(135deg, var(--navy), var(--navy-mid)); border-radius: 14px 14px 0 0; position: relative; }
  .profile-avatar-wrap { position: absolute; bottom: -44px; left: 24px; }
  .profile-avatar-large {
    width: 88px; height: 88px; border-radius: 50%;
    border: 4px solid white; background: linear-gradient(135deg, var(--blue), var(--blue-light));
    display: flex; align-items: center; justify-content: center;
    font-size: 32px; font-weight: 800; color: white;
    overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }
  .profile-avatar-large img { width: 100%; height: 100%; object-fit: cover; }
  .profile-body { padding: 56px 24px 24px; }
  .profile-name { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: var(--navy); }
  .profile-meta { display: flex; align-items: center; gap: 10px; margin: 8px 0 16px; flex-wrap: wrap; }
  .profile-stat-card { background: var(--grey-50); border: 1px solid var(--grey-200); border-radius: 12px; padding: 16px; text-align: center; }
  .profile-stat-num { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 800; color: var(--navy); }
  .profile-stat-label { font-size: 12px; color: var(--grey-500); margin-top: 4px; }

  /* ── Government Dashboard ── */
  .stat-card { background: white; border-radius: 14px; border: 1px solid var(--grey-200); padding: 20px; display: flex; align-items: flex-start; justify-content: space-between; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
  .stat-card-num { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 800; color: var(--navy); line-height: 1; }
  .stat-card-label { font-size: 13px; color: var(--grey-500); margin-top: 4px; }
  .stat-card-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
  .stat-card-icon.blue { background: var(--blue-pale); }
  .stat-card-icon.green { background: var(--green-light); }
  .stat-card-icon.yellow { background: var(--yellow-light); }
  .stat-card-icon.purple { background: var(--purple-light); }

  .tabs { display: flex; gap: 2px; border-bottom: 2px solid var(--grey-200); margin-bottom: 24px; }
  .tab-btn { padding: 10px 20px; font-size: 14px; font-weight: 600; color: var(--grey-500); background: none; border: none; border-bottom: 2px solid transparent; margin-bottom: -2px; cursor: pointer; transition: all var(--transition); font-family: 'DM Sans', sans-serif; }
  .tab-btn:hover { color: var(--blue); }
  .tab-btn.active { color: var(--blue); border-bottom-color: var(--blue); }

  .table { width: 100%; border-collapse: collapse; font-size: 14px; }
  .table th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: var(--grey-500); letter-spacing: 0.06em; text-transform: uppercase; background: var(--grey-50); border-bottom: 1px solid var(--grey-200); }
  .table td { padding: 12px 14px; border-bottom: 1px solid var(--grey-100); color: var(--grey-700); vertical-align: middle; }
  .table tr:hover td { background: var(--grey-50); }
  .table tr:last-child td { border-bottom: none; }

  /* ── Modal ── */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); animation: fadeIn 0.15s ease; }
  .modal { background: white; border-radius: 18px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 80px rgba(0,0,0,0.25); animation: slideUp 0.2s ease; }
  .modal-header { padding: 20px 24px 16px; border-bottom: 1px solid var(--grey-100); display: flex; align-items: center; justify-content: space-between; }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--navy); }
  .modal-close { width: 30px; height: 30px; border: none; background: var(--grey-100); border-radius: 7px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all var(--transition); }
  .modal-close:hover { background: var(--grey-200); }
  .modal-body { padding: 20px 24px 24px; }

  /* ── Divider ── */
  .divider { height: 1px; background: var(--grey-100); margin: 20px 0; }

  /* ── Loading ── */
  .spinner { width: 40px; height: 40px; border: 3px solid var(--grey-200); border-top-color: var(--blue); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto; }
  .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 16px; background: var(--navy-deep); }
  .loading-screen .spinner { border-color: rgba(255,255,255,0.15); border-top-color: var(--blue-light); width: 48px; height: 48px; }
  .loading-text { color: rgba(255,255,255,0.6); font-size: 14px; }

  /* ── Empty State ── */
  .empty-state { text-align: center; padding: 60px 20px; }
  .empty-state-icon { font-size: 56px; margin-bottom: 16px; }
  .empty-state-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--grey-700); margin-bottom: 8px; }
  .empty-state-desc { font-size: 14px; color: var(--grey-400); max-width: 320px; margin: 0 auto 20px; }

  /* ── Page header ── */
  .page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
  .page-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 800; color: var(--navy); }
  .page-subtitle { font-size: 14px; color: var(--grey-500); margin-top: 4px; }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 768px) {
    /* On mobile sidebar always overlays — starts hidden */
    .sidebar { transform: translateX(calc(-1 * var(--sidebar-width))); }
    .sidebar:not(.hidden) { transform: translateX(0); }

    /* Topbar and main always full width on mobile regardless of sidebar */
    .topbar { left: 0 !important; }
    .main-content { margin-left: 0 !important; padding: 16px; }

    .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
    .landing-stats { grid-template-columns: repeat(2, 1fr); }
    .auth-body { padding: 24px 20px 28px; }
    .auth-header { padding: 24px 20px 20px; }
    .pending-card { padding: 32px 24px; }
    .grid-issues { grid-template-columns: 1fr; }
  }
`

// ─── Helpers ───────────────────────────────────────────────────────────────────
const ROLES = [
  { id: 'citizen',     icon: '👤', name: 'Citizen',     sub: 'Community member',     restricted: false },
  { id: 'volunteer',   icon: '🙋', name: 'Volunteer',   sub: 'Active contributor',   restricted: false },
  { id: 'institution', icon: '🏛️', name: 'Institution', sub: 'Requires approval',    restricted: true  },
  { id: 'government',  icon: '🏛️', name: 'Government',  sub: 'Requires approval',    restricted: true  },
]

const CATEGORIES = ['Garbage', 'Road Damage', 'Streetlight', 'Water Leakage', 'Sanitation', 'Others']
const CATEGORY_EMOJI = { Garbage: '🗑️', 'Road Damage': '🚧', Streetlight: '💡', 'Water Leakage': '💧', Sanitation: '🚿', Others: '📌' }
const STATUS_LIST = ['Reported', 'Under Review', 'Verified', 'In Progress', 'Resolved']

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={wide ? { maxWidth: 640 } : {}}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

// ─── Landing Page ──────────────────────────────────────────────────────────────
function LandingPage({ onNavigate }) {
  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="landing-content">
          <div className="landing-logo">
            <div className="landing-logo-icon">🏛️</div>
            <div className="landing-logo-text">CivicConnect</div>
          </div>
          <h1 className="landing-tagline">
            Connect. Report. <span>Resolve.</span>
          </h1>
          <p className="landing-sub">
            A unified platform where citizens, volunteers, institutions, and government authorities collaborate to build stronger communities.
          </p>
          <div className="landing-cta">
            <button className="landing-btn-primary" onClick={() => onNavigate('signup')}>
              Join Your Community
            </button>
            <button className="landing-btn-outline" onClick={() => onNavigate('login')}>
              Sign In
            </button>
          </div>
          <div className="landing-stats">
            {[
              { num: '12,480', label: 'Issues Reported' },
              { num: '8,340',  label: 'Issues Resolved' },
              { num: '3,200',  label: 'Active Volunteers' },
              { num: '420',    label: 'Institutions' },
            ].map(s => (
              <div className="landing-stat" key={s.label}>
                <div className="landing-stat-num">{s.num}</div>
                <div className="landing-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Login Page ────────────────────────────────────────────────────────────────
function LoginPage({ onNavigate, onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setError(''); setLoading(true)
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password })
      if (authErr) { setError(authErr.message); setLoading(false); return }

      const session = data.session

      // Always fetch profile from DB — role and approval must never come from UI
      let profile = null
      try {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        profile = p
      } catch (_) {}

      // Role: DB profile → auth metadata → default citizen. Never from UI.
      const userRole = profile?.role || session.user.user_metadata?.role || 'citizen'
      const isRestricted = ['government', 'institution'].includes(userRole)

      // Approval: DB is source of truth. If DB fetch failed, block restricted roles to be safe.
      const approved = profile ? profile.approved : !isRestricted

      if (isRestricted && !approved) {
        setError('Your account is pending admin approval. Please wait for an administrator to approve your account.')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      onLogin({
        id: session.user.id,
        email: session.user.email,
        name: profile?.name || session.user.user_metadata?.name || session.user.email.split('@')[0],
        role: userRole,
        location: profile?.location || '',
        avatar_url: profile?.avatar_url || null,
        approved,
      })
    } catch (e) {
      setError('An unexpected error occurred. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">🏛️</div>
            <div className="auth-logo-text">CivicConnect</div>
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue to your dashboard</p>
        </div>
        <div className="auth-body">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            <div className="form-hint" style={{ textAlign: 'right', marginTop: 4 }}>
              <span className="auth-link" onClick={() => onNavigate('forgot-password')}>Forgot password?</span>
            </div>
          </div>

          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            <span>ℹ️</span> Government &amp; Institution accounts require admin approval before first login.
          </div>

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogin} disabled={loading}>
            {loading ? '⏳ Signing in…' : '→ Sign In'}
          </button>

          <div className="auth-footer">
            Don't have an account?{' '}
            <span className="auth-link" onClick={() => onNavigate('signup')}>Create account</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Signup Page ───────────────────────────────────────────────────────────────
function SignupPage({ onNavigate, onSignupSuccess }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'citizen', location: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const nextStep = () => {
    if (step === 1) {
      if (!form.name || !form.email || !form.password) { setError('Please fill all fields.'); return }
      if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    }
    if (step === 2 && !form.role) { setError('Please select a role.'); return }
    setError(''); setStep(s => s + 1)
  }

  const handleSignup = async () => {
    if (!form.location) { setError('Please enter your location.'); return }
    setError(''); setLoading(true)
    try {
      const { data, error: authErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { name: form.name, role: form.role } }
      })
      if (authErr) { setError(authErr.message); setLoading(false); return }

      // Upsert profile
      const userId = data.user?.id
      if (userId) {
        await supabase.from('profiles').upsert({
          id: userId,
          email: form.email,
          name: form.name,
          role: form.role,
          location: form.location,
          approved: !['government', 'institution'].includes(form.role),
        }, { onConflict: 'id' })
      }

      if (['government', 'institution'].includes(form.role)) {
        onNavigate('pending')
      } else {
        onSignupSuccess({
          id: userId,
          email: form.email,
          name: form.name,
          role: form.role,
          location: form.location,
          avatar_url: null,
          approved: true,
        })
      }
    } catch (e) {
      setError('Signup failed. Please try again.')
    }
    setLoading(false)
  }

  const stepDot = (n) => {
    if (n < step) return 'done'
    if (n === step) return 'active'
    return 'pending'
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">🏛️</div>
            <div className="auth-logo-text">CivicConnect</div>
          </div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join your community in {step === 1 ? 'three simple' : step === 2 ? 'a couple more' : 'one final'} step{step < 3 ? 's' : ''}</p>
        </div>
        <div className="auth-body">
          {/* Step indicator */}
          <div className="step-indicator">
            {[1,2,3].map((n, i) => (
              <React.Fragment key={n}>
                <div className={`step-dot ${stepDot(n)}`}>{stepDot(n) === 'done' ? '✓' : n}</div>
                {i < 2 && <div className={`step-line ${n < step ? 'done' : ''}`} />}
              </React.Fragment>
            ))}
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}><span>⚠️</span> {error}</div>}

          {step === 1 && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Jane Doe" value={form.name} onChange={e => update('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => update('password', e.target.value)} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={nextStep}>Continue →</button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-group">
                <label className="form-label">Select Your Role</label>
                <div className="role-grid">
                  {ROLES.map(r => (
                    <div key={r.id} className={`role-card ${form.role === r.id ? 'selected' : ''}`} onClick={() => update('role', r.id)}>
                      {r.restricted && <span className="restricted-badge">🔒 Restricted</span>}
                      <div className="role-card-icon">{r.icon}</div>
                      <div className="role-card-name">{r.name}</div>
                      <div className="role-card-sub">{r.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
              {ROLES.find(r => r.id === form.role)?.restricted && (
                <div className="alert alert-warning" style={{ marginBottom: 16 }}>
                  <span>⚠️</span> {form.role === 'government' ? 'Government' : 'Institution'} accounts require manual admin approval before you can log in.
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={nextStep}>Continue →</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="form-group">
                <label className="form-label">Your Location</label>
                <input className="form-input" placeholder="e.g. Bhubaneswar, Odisha" value={form.location} onChange={e => update('location', e.target.value)} />
                <p className="form-hint">This helps match you with local community issues.</p>
              </div>
              {ROLES.find(r => r.id === form.role)?.restricted && (
                <div className="alert alert-info" style={{ marginBottom: 16 }}>
                  <span>📋</span> After signup, your account will be reviewed. You'll receive an email once approved.
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSignup} disabled={loading}>
                  {loading ? '⏳ Creating…' : '✓ Create Account'}
                </button>
              </div>
            </>
          )}

          <div className="auth-footer">
            Already have an account?{' '}
            <span className="auth-link" onClick={() => onNavigate('login')}>Sign in</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Forgot Password Page ──────────────────────────────────────────────────────
function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async () => {
    if (!email) { setError('Please enter your email.'); return }
    setError(''); setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (err) setError(err.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">🏛️</div>
            <div className="auth-logo-text">CivicConnect</div>
          </div>
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">We'll send you a reset link</p>
        </div>
        <div className="auth-body">
          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20, color: 'var(--navy)', marginBottom: 8 }}>Check Your Email</h3>
              <p style={{ color: 'var(--grey-500)', marginBottom: 20, fontSize: 14, lineHeight: 1.6 }}>
                A password reset link has been sent to <strong>{email}</strong>
              </p>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onNavigate('login')}>
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}><span>⚠️</span> {error}</div>}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReset()} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleReset} disabled={loading}>
                {loading ? '⏳ Sending…' : '📧 Send Reset Link'}
              </button>
              <div className="auth-footer">
                <span className="auth-link" onClick={() => onNavigate('login')}>← Back to Sign In</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Pending Approval Page ─────────────────────────────────────────────────────
function PendingPage({ onNavigate }) {
  return (
    <div className="pending-page">
      <div className="pending-card">
        <div className="pending-icon">⏳</div>
        <h2 className="pending-title">Account Pending Approval</h2>
        <p className="pending-desc">
          Your Government / Institution account has been created and is pending admin review. You'll be able to log in once an administrator approves your account.
        </p>
        <div className="pending-steps">
          <div style={{ fontFamily: 'Playfair Display', fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>
            How approval works:
          </div>
          {[
            'Sign up is complete — your account exists in the system.',
            'An admin opens the Supabase dashboard → Table Editor → profiles.',
            'They find your record and set approved = true.',
            'You can then log in normally with your email and password.',
          ].map((s, i) => (
            <div className="pending-step" key={i}>
              <div className="pending-step-num">{i + 1}</div>
              <div>{s}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onNavigate('login')}>
          Return to Sign In
        </button>
      </div>
    </div>
  )
}

// ─── Community Feed ────────────────────────────────────────────────────────────
function FeedPage({ user }) {
  const [issues, setIssues] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  const fetchIssues = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('issues').select('*, profiles(name, avatar_url)').order('created_at', { ascending: false })
    if (filter !== 'All') query = query.eq('status', filter)
    const { data } = await query
    setIssues(data || [])
    setLoading(false)
  }, [filter])

  useEffect(() => { fetchIssues() }, [fetchIssues])

  const FILTERS = ['All', ...STATUS_LIST]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Community Feed</h1>
          <p className="page-subtitle">Track and follow community issues in real time</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchIssues}>🔄 Refresh</button>
      </div>

      <div className="filter-chips">
        {FILTERS.map(f => (
          <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : issues.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏙️</div>
          <h3 className="empty-state-title">No issues found</h3>
          <p className="empty-state-desc">No issues match the current filter. Try selecting a different status.</p>
        </div>
      ) : (
        <div className="grid-issues">
          {issues.map(issue => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  )
}

function IssueCard({ issue }) {
  return (
    <div className="issue-card">
      <div className="issue-card-image">
        {issue.image_url
          ? <img src={issue.image_url} alt={issue.title} />
          : <span>{CATEGORY_EMOJI[issue.category] || '📌'}</span>
        }
        {issue.verified && (
          <div className="issue-card-verified">✔ Verified by Authority</div>
        )}
        <div className="issue-card-status">
          <span className={`status-badge status-${issue.status?.replace(' ', '-')}`}>
            {issue.status}
          </span>
        </div>
      </div>
      <div className="issue-card-body">
        <div className="issue-card-category">{issue.category}</div>
        <div className="issue-card-title">{issue.title}</div>
        <div className="issue-card-desc">{issue.description}</div>
        <div className="issue-card-meta">
          <div className="issue-card-loc">📍 {issue.location || 'Unknown'}</div>
          <div style={{ fontSize: 11, color: 'var(--grey-400)' }}>{timeAgo(issue.created_at)}</div>
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, color: 'var(--grey-500)' }}>
            by {issue.profiles?.name || 'Anonymous'}
          </div>
          <div className="issue-card-actions">
            <button className="issue-action-btn">👍 <span>0</span></button>
            <button className="issue-action-btn">💬 <span>0</span></button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Report Issue ──────────────────────────────────────────────────────────────
function ReportIssuePage({ user }) {
  const [form, setForm] = useState({ title: '', category: '', location: '', description: '' })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successId, setSuccessId] = useState(null)
  const fileInputRef = useRef(null)

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleFile = (file) => {
    if (!file) return
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) { setError('Only JPG, PNG, and WEBP images are allowed.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10MB.'); return }
    setError('')
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = async () => {
    if (!form.title || !form.category || !form.location || !form.description) {
      setError('Please fill all required fields.'); return
    }
    setError(''); setLoading(true)
    try {
      let image_url = null
      if (image) {
        const ext = image.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('issue-images').upload(path, image)
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('issue-images').getPublicUrl(path)
          image_url = urlData.publicUrl
        }
      }
      const { data, error: dbErr } = await supabase.from('issues').insert({
        ...form, image_url, created_by: user.id, status: 'Reported', verified: false
      }).select().single()
      if (dbErr) { setError(dbErr.message); setLoading(false); return }
      setSuccessId(data.id)
    } catch (e) {
      setError('Submission failed. Please try again.')
    }
    setLoading(false)
  }

  if (successId) {
    return (
      <div className="card">
        <div className="success-screen">
          <div className="success-icon">✅</div>
          <h2 className="success-title">Issue Reported!</h2>
          <p style={{ color: 'var(--grey-500)', marginBottom: 16 }}>Your issue has been submitted and is now visible in the community feed.</p>
          <div className="success-id">Issue ID: {successId.slice(0, 8)}…</div>
          <button className="btn btn-primary" onClick={() => { setSuccessId(null); setForm({ title: '', category: '', location: '', description: '' }); setImage(null); setImagePreview(null); }}>
            Report Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Report an Issue</h1>
          <p className="page-subtitle">Help your community by reporting problems in your area</p>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 680 }}>
        <div className="card-body">
          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}><span>⚠️</span> {error}</div>}

          <div className="form-group">
            <label className="form-label">Issue Title <span style={{color:'var(--red)'}}>*</span></label>
            <input className="form-input" placeholder="Brief title for the issue" value={form.title} onChange={e => update('title', e.target.value)} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category <span style={{color:'var(--red)'}}>*</span></label>
              <select className="form-input form-select" value={form.category} onChange={e => update('category', e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location <span style={{color:'var(--red)'}}>*</span></label>
              <input className="form-input" placeholder="Street, area or landmark" value={form.location} onChange={e => update('location', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description <span style={{color:'var(--red)'}}>*</span></label>
            <textarea className="form-input form-textarea" placeholder="Describe the issue in detail…" value={form.description} onChange={e => update('description', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Photo (optional)</label>
            {imagePreview ? (
              <div className="upload-preview">
                <img src={imagePreview} alt="Preview" />
                <button className="upload-remove" onClick={() => { setImage(null); setImagePreview(null) }}>✕ Remove</button>
              </div>
            ) : (
              <div
                className={`upload-area ${dragOver ? 'drag-over' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <div className="upload-area-icon">📷</div>
                <div className="upload-area-text">Click or drag & drop a photo</div>
                <div className="upload-area-hint">JPG, PNG, WEBP · Max 10MB</div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSubmit} disabled={loading}>
            {loading ? '⏳ Submitting…' : '📢 Submit Report'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Activities Page ───────────────────────────────────────────────────────────
function ActivitiesPage({ user }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', location: '', date: '', required_volunteers: 10 })
  const [submitting, setSubmitting] = useState(false)
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('activities').select('*, profiles(name)').order('created_at', { ascending: false })
    setActivities(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchActivities() }, [fetchActivities])

  const handleJoin = async (id, current, required) => {
    if (current >= required) return
    await supabase.from('activities').update({ current_volunteers: current + 1 }).eq('id', id)
    fetchActivities()
  }

  const handleCreate = async () => {
    if (!form.title || !form.description || !form.location || !form.date) return
    setSubmitting(true)
    await supabase.from('activities').insert({ ...form, organizer: user.id, current_volunteers: 0 })
    setSubmitting(false)
    setShowModal(false)
    setForm({ title: '', description: '', location: '', date: '', required_volunteers: 10 })
    fetchActivities()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Community Activities</h1>
          <p className="page-subtitle">Join or organize events that make a difference</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Organize Activity</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : activities.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎪</div>
          <h3 className="empty-state-title">No activities yet</h3>
          <p className="empty-state-desc">Be the first to organize a community activity!</p>
        </div>
      ) : (
        <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {activities.map(act => {
            const pct = Math.min(100, Math.round((act.current_volunteers / (act.required_volunteers || 1)) * 100))
            return (
              <div className="activity-card" key={act.id}>
                <div className="activity-title">{act.title}</div>
                <div className="activity-meta">
                  <span className="activity-meta-item">👤 {act.profiles?.name || 'Organizer'}</span>
                  <span className="activity-meta-item">📍 {act.location}</span>
                  {act.date && <span className="activity-meta-item">📅 {new Date(act.date).toLocaleDateString()}</span>}
                </div>
                <p style={{ fontSize: 13, color: 'var(--grey-600)', lineHeight: 1.55, marginBottom: 12 }}>{act.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--grey-500)', fontWeight: 600 }}>Volunteers</span>
                  <span style={{ fontSize: 12, color: 'var(--grey-700)', fontWeight: 700 }}>{act.current_volunteers}/{act.required_volunteers}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleJoin(act.id, act.current_volunteers, act.required_volunteers)} disabled={pct >= 100}>
                    {pct >= 100 ? '✓ Full' : '+ Join'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <Modal title="Organize an Activity" onClose={() => setShowModal(false)}>
          {['title', 'description', 'location'].map(field => (
            <div className="form-group" key={field}>
              <label className="form-label" style={{ textTransform: 'capitalize' }}>{field}</label>
              {field === 'description'
                ? <textarea className="form-input form-textarea" value={form[field]} onChange={e => update(field, e.target.value)} style={{ minHeight: 80 }} />
                : <input className="form-input" value={form[field]} onChange={e => update(field, e.target.value)} />
              }
            </div>
          ))}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Date & Time</label>
              <input className="form-input" type="datetime-local" value={form.date} onChange={e => update('date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Volunteers Needed</label>
              <input className="form-input" type="number" min="1" value={form.required_volunteers} onChange={e => update('required_volunteers', Number(e.target.value))} />
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCreate} disabled={submitting}>
            {submitting ? '⏳ Creating…' : '🎪 Create Activity'}
          </button>
        </Modal>
      )}
    </div>
  )
}

// ─── Ideas Page ────────────────────────────────────────────────────────────────
function IdeasPage({ user }) {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [supported, setSupported] = useState(new Set())

  const fetchIdeas = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('ideas').select('*, profiles(name)').order('support_count', { ascending: false })
    setIdeas(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchIdeas() }, [fetchIdeas])

  const handleSupport = async (idea) => {
    if (supported.has(idea.id)) return
    setSupported(s => new Set([...s, idea.id]))
    await supabase.from('ideas').update({ support_count: idea.support_count + 1 }).eq('id', idea.id)
    fetchIdeas()
  }

  const handlePropose = async () => {
    if (!form.title || !form.description) return
    setSubmitting(true)
    await supabase.from('ideas').insert({ ...form, support_count: 0, created_by: user.id })
    setSubmitting(false)
    setShowModal(false)
    setForm({ title: '', description: '' })
    fetchIdeas()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Community Ideas</h1>
          <p className="page-subtitle">Propose and support ideas for a better community</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>💡 Propose Idea</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : ideas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💡</div>
          <h3 className="empty-state-title">No ideas yet</h3>
          <p className="empty-state-desc">Share your ideas to improve the community!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ideas.map((idea, idx) => (
            <div className="idea-card" key={idea.id}>
              {idx === 0 && <div className="idea-top-badge">🏆 Top Idea</div>}
              <div className="idea-title">{idea.title}</div>
              <div className="idea-desc">{idea.description}</div>
              <div className="idea-footer">
                <span style={{ fontSize: 12, color: 'var(--grey-400)' }}>by {idea.profiles?.name || 'Anonymous'} · {timeAgo(idea.created_at)}</span>
                <button
                  className={`support-btn ${supported.has(idea.id) ? 'supported' : ''}`}
                  onClick={() => handleSupport(idea)}
                  disabled={supported.has(idea.id)}
                >
                  👍 <span>{idea.support_count}</span> Support
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Propose an Idea" onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label className="form-label">Idea Title</label>
            <input className="form-input" placeholder="A concise, clear title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input form-textarea" placeholder="Describe your idea and how it helps the community…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handlePropose} disabled={submitting}>
            {submitting ? '⏳ Submitting…' : '💡 Submit Idea'}
          </button>
        </Modal>
      )}
    </div>
  )
}

// ─── Profile Page ──────────────────────────────────────────────────────────────
function ProfilePage({ user, onUserUpdate }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user.name, location: user.location || '' })
  const [saving, setSaving] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [newRole, setNewRole] = useState(user.role)
  const [stats, setStats] = useState({ issues: 0, activities: 0, ideas: 0 })

  useEffect(() => {
    const loadStats = async () => {
      const [{ count: issues }, { count: ideas }] = await Promise.all([
        supabase.from('issues').select('*', { count: 'exact', head: true }).eq('created_by', user.id),
        supabase.from('ideas').select('*', { count: 'exact', head: true }).eq('created_by', user.id),
      ])
      setStats({ issues: issues || 0, activities: 0, ideas: ideas || 0 })
    }
    loadStats()
  }, [user.id])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('profiles').update({ name: form.name, location: form.location }).eq('id', user.id)
    onUserUpdate({ ...user, name: form.name, location: form.location })
    setSaving(false)
    setEditing(false)
  }

  const handleRoleSwitch = async () => {
    const approved = !['government', 'institution'].includes(newRole)
    await supabase.from('profiles').update({ role: newRole, approved }).eq('id', user.id)
    onUserUpdate({ ...user, role: newRole, approved })
    setShowRoleModal(false)
    if (!approved) { /* Could navigate to pending */ }
  }

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 20 }}>My Profile</h1>
      <div className="card" style={{ maxWidth: 720 }}>
        <div className="profile-cover" />
        <div style={{ position: 'relative' }}>
          <div className="profile-avatar-wrap">
            <div className="profile-avatar-large">
              {user.avatar_url ? <img src={user.avatar_url} alt={user.name} /> : getInitials(user.name)}
            </div>
          </div>
        </div>
        <div className="profile-body">
          {editing ? (
            <div style={{ maxWidth: 400 }}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '⏳' : '✓ Save'}</button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="profile-name">{user.name}</h2>
              <div className="profile-meta">
                <span className={`role-badge ${user.role}`}>{user.role}</span>
                {user.location && <span style={{ fontSize: 13, color: 'var(--grey-500)' }}>📍 {user.location}</span>}
                <span style={{ fontSize: 13, color: 'var(--grey-400)' }}>✉️ {user.email}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowRoleModal(true)}>🔄 Switch Role</button>
              </div>
            </>
          )}

          <div className="divider" />
          <div className="grid-4" style={{ marginTop: 16 }}>
            {[
              { num: stats.issues, label: 'Issues Reported' },
              { num: stats.activities, label: 'Activities Joined' },
              { num: stats.ideas, label: 'Ideas Proposed' },
              { num: 0, label: 'Certificates' },
            ].map(s => (
              <div className="profile-stat-card" key={s.label}>
                <div className="profile-stat-num">{s.num}</div>
                <div className="profile-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="divider" />
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>Certificates</h3>
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏅</div>
            <p style={{ fontSize: 13, color: 'var(--grey-400)' }}>No certificates yet. Participate in activities to earn them.</p>
          </div>
        </div>
      </div>

      {showRoleModal && (
        <Modal title="Switch Role" onClose={() => setShowRoleModal(false)}>
          <p style={{ fontSize: 13, color: 'var(--grey-500)', marginBottom: 16 }}>Choose a new role. Government and Institution roles require admin approval.</p>
          <div className="role-grid" style={{ marginBottom: 16 }}>
            {ROLES.map(r => (
              <div key={r.id} className={`role-card ${newRole === r.id ? 'selected' : ''}`} onClick={() => setNewRole(r.id)}>
                {r.id === user.role && <span className="restricted-badge" style={{ background: 'var(--blue-pale)', color: 'var(--blue)' }}>Current</span>}
                {r.restricted && r.id !== user.role && <span className="restricted-badge">🔒</span>}
                <div className="role-card-icon">{r.icon}</div>
                <div className="role-card-name">{r.name}</div>
                <div className="role-card-sub">{r.sub}</div>
              </div>
            ))}
          </div>
          {ROLES.find(r => r.id === newRole)?.restricted && (
            <div className="alert alert-warning" style={{ marginBottom: 16 }}><span>⚠️</span> Switching to this role will require re-approval.</div>
          )}
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleRoleSwitch} disabled={newRole === user.role}>
            Confirm Role Switch
          </button>
        </Modal>
      )}
    </div>
  )
}

// ─── Government Dashboard ──────────────────────────────────────────────────────
function GovDashboardPage({ user }) {
  const [tab, setTab] = useState('issues')
  const [issues, setIssues] = useState([])
  const [activities, setActivities] = useState([])
  const [announcement, setAnnouncement] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, resolved: 0, volunteers: 0, institutions: 0 })

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [{ data: issData }, { data: actData }, { count: total }, { count: resolved }, { count: vols }, { count: insts }] = await Promise.all([
      supabase.from('issues').select('*').order('created_at', { ascending: false }),
      supabase.from('activities').select('*, profiles(name)').order('created_at', { ascending: false }),
      supabase.from('issues').select('*', { count: 'exact', head: true }),
      supabase.from('issues').select('*', { count: 'exact', head: true }).eq('status', 'Resolved'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'volunteer'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'institution'),
    ])
    setIssues(issData || [])
    setActivities(actData || [])
    setStats({ total: total || 0, resolved: resolved || 0, volunteers: vols || 0, institutions: insts || 0 })
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleVerify = async (id, verified) => {
    await supabase.from('issues').update({ verified: !verified }).eq('id', id)
    fetchData()
  }

  const handleStatus = async (id, status) => {
    await supabase.from('issues').update({ status }).eq('id', id)
    fetchData()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Government Dashboard</h1>
          <p className="page-subtitle">Manage and resolve community issues across your jurisdiction</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchData}>🔄 Refresh</button>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { num: stats.total, label: 'Total Issues', icon: '📋', cls: 'blue' },
          { num: stats.resolved, label: 'Resolved', icon: '✅', cls: 'green' },
          { num: stats.volunteers, label: 'Active Volunteers', icon: '🙋', cls: 'yellow' },
          { num: stats.institutions, label: 'Institutions', icon: '🏛️', cls: 'purple' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div>
              <div className="stat-card-num">{s.num}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
            <div className={`stat-card-icon ${s.cls}`}>{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-body">
          <div className="tabs">
            {['issues', 'activities', 'announcements'].map(t => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>
                {t === 'issues' ? '📋 Issues' : t === 'activities' ? '🎪 Activities' : '📢 Announcements'}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></div>
          ) : tab === 'issues' ? (
            issues.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">📋</div><h3 className="empty-state-title">No issues reported yet</h3></div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Verified</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map(issue => (
                      <tr key={issue.id}>
                        <td style={{ fontWeight: 600, maxWidth: 200 }}>{issue.title}</td>
                        <td><span style={{ fontSize: 12 }}>{CATEGORY_EMOJI[issue.category]} {issue.category}</span></td>
                        <td style={{ fontSize: 13, color: 'var(--grey-500)' }}>📍 {issue.location}</td>
                        <td>
                          <select
                            className="form-input form-select"
                            value={issue.status}
                            onChange={e => handleStatus(issue.id, e.target.value)}
                            style={{ padding: '5px 28px 5px 8px', fontSize: 12, minWidth: 130 }}
                          >
                            {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td>
                          <button
                            className={`btn btn-xs ${issue.verified ? 'btn-secondary' : 'btn-outline'}`}
                            onClick={() => handleVerify(issue.id, issue.verified)}
                          >
                            {issue.verified ? '✓ Verified' : 'Verify'}
                          </button>
                        </td>
                        <td>
                          <span style={{ fontSize: 11, color: 'var(--grey-400)' }}>{timeAgo(issue.created_at)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : tab === 'activities' ? (
            activities.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">🎪</div><h3 className="empty-state-title">No activities yet</h3></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activities.map(act => (
                  <div key={act.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--grey-50)', borderRadius: 10, border: '1px solid var(--grey-200)' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>{act.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--grey-500)' }}>📍 {act.location} · 👤 {act.profiles?.name || 'Organizer'}</div>
                    </div>
                    <button className="btn btn-outline btn-sm">🏅 Publish Appreciation</button>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div>
              <div className="form-group">
                <label className="form-label">Official Announcement</label>
                <textarea className="form-input form-textarea" placeholder="Write an official message to the community…" value={announcement} onChange={e => setAnnouncement(e.target.value)} style={{ minHeight: 120 }} />
              </div>
              <button className="btn btn-primary" onClick={() => { alert('Announcement published! (Connect to your announcements table to persist.)'); setAnnouncement('') }}>
                📢 Publish Announcement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── App Shell (Sidebar + Topbar) ─────────────────────────────────────────────
const PAGE_LABELS = {
  feed: 'Community Feed',
  'report-issue': 'Report an Issue',
  activities: 'Community Activities',
  ideas: 'Community Ideas',
  profile: 'My Profile',
  'gov-dashboard': 'Government Dashboard',
}

function AppShell({ user, onLogout, onUserUpdate }) {
  const [page, setPage] = useState('feed')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 768) {
        setMobile(true)
        setSidebarOpen(false)
      } else {
        setMobile(false)
        setSidebarOpen(true)
      }
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const navigate = (p) => {
    setPage(p)
    // Never close sidebar on page change — only hamburger toggles it
  }

  const handleLogout = async () => {
    localStorage.clear()
    await supabase.auth.signOut().catch(() => {})
    onLogout()
  }

  const navItems = [
    { id: 'feed', icon: '🏘️', label: 'Community Feed' },
    { id: 'report-issue', icon: '📢', label: 'Report Issue' },
    { id: 'activities', icon: '🎪', label: 'Activities' },
    { id: 'ideas', icon: '💡', label: 'Ideas' },
    ...(user.role === 'government' ? [{ id: 'gov-dashboard', icon: '🏛️', label: 'Gov Dashboard' }] : []),
    { id: 'profile', icon: '👤', label: 'My Profile' },
  ]

  const sidebarHidden = !sidebarOpen

  return (
    <div className="app-shell">
      {/* Overlay for mobile */}
      {mobile && sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, backdropFilter: 'blur(2px)' }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      {/* Sidebar */}
      <aside className={`sidebar ${!sidebarOpen ? 'hidden' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <div className="sidebar-logo-icon">🏛️</div>
            <div>
              <div className="sidebar-logo-text">CivicConnect</div>
              <div className="sidebar-logo-sub">Civic Platform</div>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map(item => (
            <div key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              {user.avatar_url ? <img src={user.avatar_url} alt={user.name} /> : getInitials(user.name)}
            </div>
            <div>
              <div className="user-info-name">{user.name}</div>
              <div className="user-info-role">{user.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>⎋</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Topbar */}
      <header className={`topbar ${!mobile && sidebarHidden ? 'sidebar-hidden' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="hamburger-btn" onClick={() => setSidebarOpen(o => !o)}>
            <div className="hamburger-line" />
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </button>
          <span className="topbar-title">{PAGE_LABELS[page] || ''}</span>
        </div>
        <div className="topbar-right">
          <span className={`role-badge ${user.role}`}>{user.role}</span>
          <div className="topbar-avatar" onClick={() => navigate('profile')}>
            {user.avatar_url ? <img src={user.avatar_url} alt={user.name} /> : getInitials(user.name)}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className={`main-content ${!mobile && sidebarHidden ? 'sidebar-hidden' : ''}`}>
        {page === 'feed'          && <FeedPage user={user} />}
        {page === 'report-issue'  && <ReportIssuePage user={user} />}
        {page === 'activities'    && <ActivitiesPage user={user} />}
        {page === 'ideas'         && <IdeasPage user={user} />}
        {page === 'profile'       && <ProfilePage user={user} onUserUpdate={onUserUpdate} />}
        {page === 'gov-dashboard' && user.role === 'government' && <GovDashboardPage user={user} />}
      </main>
    </div>
  )
}

// ─── Root Component ────────────────────────────────────────────────────────────
export default function CivicConnect() {
  const [screen, setScreen] = useState('loading')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { setScreen('landing'); return }

        let profile = null
        try {
          const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
          profile = p
        } catch (_) {}

        const userRole = profile?.role || session.user.user_metadata?.role || 'citizen'
        const isRestricted = ['government', 'institution'].includes(userRole)
        // If profile fetch failed for a restricted role, block them — can't confirm approval
        const approved = profile ? profile.approved : !isRestricted

        if (isRestricted && !approved) {
          // Cached session exists but account not yet approved — sign them out silently
          await supabase.auth.signOut().catch(() => {})
          localStorage.clear()
          setScreen('login')
          return
        }

        setUser({
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || session.user.user_metadata?.name || session.user.email.split('@')[0],
          role: userRole,
          location: profile?.location || '',
          avatar_url: profile?.avatar_url || null,
          approved,
        })
        setScreen('app')
      } catch (_) {
        setScreen('landing')
      }
    }
    restoreSession()
  }, [])

  const handleLogin = (userData) => { setUser(userData); setScreen('app') }
  const handleLogout = () => { setUser(null); setScreen('landing') }
  const handleSignupSuccess = (userData) => { setUser(userData); setScreen('app') }
  const handleUserUpdate = (updated) => setUser(updated)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      {screen === 'loading' && (
        <div className="loading-screen">
          <div className="spinner" />
          <div className="loading-text">Loading CivicConnect…</div>
        </div>
      )}
      {screen === 'landing' && <LandingPage onNavigate={setScreen} />}
      {screen === 'login' && <LoginPage onNavigate={setScreen} onLogin={handleLogin} />}
      {screen === 'signup' && <SignupPage onNavigate={setScreen} onSignupSuccess={handleSignupSuccess} />}
      {screen === 'forgot-password' && <ForgotPasswordPage onNavigate={setScreen} />}
      {screen === 'pending' && <PendingPage onNavigate={setScreen} />}
      {screen === 'app' && user && (
        <AppShell user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
      )}
    </>
  )
}