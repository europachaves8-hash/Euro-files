// ==========================================
// Auth-aware navbar + Contact form integration
// Requires: supabase-config.js loaded first
// ==========================================

(async function () {
  if (typeof supabaseClient === "undefined") return;

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const role = user.app_metadata?.userrole;
    const dashboardUrl = role === "ADMIN" ? "/admin/dashboard" : "/client/dashboard";
    const displayName = user.user_metadata?.first_name || user.email?.split("@")[0] || "Account";

    // Try to get avatar
    const { data: avatarData } = supabaseClient.storage
      .from("avatars")
      .getPublicUrl(user.id + "/avatar");
    let avatarUrl = null;
    if (avatarData?.publicUrl) {
      try {
        const res = await fetch(avatarData.publicUrl, { method: "HEAD" });
        if (res.ok) avatarUrl = avatarData.publicUrl + "?t=" + Date.now();
      } catch {}
    }

    // Replace desktop nav-actions
    const navActions = document.querySelector(".nav-actions");
    if (navActions) {
      navActions.innerHTML = `
        <a href="${dashboardUrl}" class="btn btn-sm btn-primary" style="display:flex;align-items:center;gap:8px;">
          ${avatarUrl
            ? '<img src="' + avatarUrl + '" style="width:24px;height:24px;border-radius:50%;object-fit:cover;" alt="">'
            : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
          }
          My Dashboard
        </a>
      `;
    }

    // Replace mobile nav login/register links
    const mobileNav = document.querySelector(".mobile-nav");
    if (mobileNav) {
      const loginLink = mobileNav.querySelector('a[href="/auth/login"]');
      const regLink = mobileNav.querySelector('a[href="/auth/register"]');
      if (loginLink) loginLink.remove();
      if (regLink) regLink.remove();

      const dashLink = document.createElement("a");
      dashLink.href = dashboardUrl;
      dashLink.textContent = "My Dashboard";
      dashLink.style.color = "var(--primary)";
      dashLink.style.fontWeight = "700";
      mobileNav.appendChild(dashLink);
    }

    // Auto-fill contact form if on contact page
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    if (nameInput && !nameInput.value) {
      const fullName = [user.user_metadata?.first_name, user.user_metadata?.last_name]
        .filter(Boolean)
        .join(" ");
      if (fullName) nameInput.value = fullName;
    }
    if (emailInput && !emailInput.value && user.email) {
      emailInput.value = user.email;
    }
  } catch (err) {
    // Not logged in or error — keep default Login/Register buttons
  }
})();
