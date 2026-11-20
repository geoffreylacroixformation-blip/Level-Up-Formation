// Supabase credentials - injected at build time
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const configWarning = document.getElementById('configWarning');
const submitBtn = document.getElementById('submitBtn');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  configWarning.style.display = 'block';
  loginForm.style.display = 'none';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Configuration manquante';
}

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Connexion...';

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      errorMsg.textContent = error.message;
      errorMsg.style.display = 'block';
      return;
    }

    if (data?.session?.access_token) {
      document.cookie = `sb-auth-token=${data.session.access_token}; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem('sb-auth-token', data.session.access_token);
      localStorage.setItem('sb-auth-user', JSON.stringify(data.session.user));

      // Vérifier le rôle admin pour CET utilisateur
      const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${data.session.user.id}&select=role`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${data.session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const profileData = await profileRes.json();

      if (profileData.length === 0 || profileData[0].role !== 'admin') {
        errorMsg.textContent = 'Accès réservé aux administrateurs uniquement.';
        errorMsg.style.display = 'block';
        await supabase.auth.signOut();
        return;
      }

      successMsg.textContent = 'Connexion réussie ! Redirection...';
      successMsg.style.display = 'block';
      setTimeout(() => {
        window.location.href = '/admin/';
      }, 500);
    }
  } catch (err) {
    errorMsg.textContent = 'Erreur de connexion. Vérifiez vos identifiants.';
    errorMsg.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Se connecter';
  }
});

// ============================================
// FORGOT PASSWORD (RESET)
// ============================================
const forgotPasswordLink = document.getElementById('forgot-password-link');
forgotPasswordLink?.addEventListener('click', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  if (!email) {
    errorMsg.textContent = 'Veuillez entrer votre email d\'abord, puis cliquez sur "Mot de passe oublié".';
    errorMsg.style.display = 'block';
    return;
  }
  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    if (error) {
      errorMsg.textContent = error.message;
      errorMsg.style.display = 'block';
      successMsg.style.display = 'none';
    } else {
      errorMsg.style.display = 'none';
      successMsg.textContent = 'Lien de réinitialisation envoyé ! Vérifiez votre boîte mail.';
      successMsg.style.display = 'block';
    }
  } catch (err) {
    errorMsg.textContent = 'Erreur lors de l\'envoi du lien de réinitialisation.';
    errorMsg.style.display = 'block';
  }
});
