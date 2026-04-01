// ==========================================
// EUROFILES - Authentication Logic
// ==========================================

// ---------- Register ----------
async function handleRegister(e) {
  e.preventDefault();

  const errorDiv = document.getElementById('register-error');
  const btn = document.getElementById('register-btn');
  errorDiv.classList.add('form-error-hidden');

  // Gather fields
  const firstName = document.getElementById('first_name').value.trim();
  const lastName = document.getElementById('last_name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('password_confirm').value;
  const isPrivate = document.getElementById('is_private').checked;
  const company = document.getElementById('company').value.trim();
  const companyReg = document.getElementById('company_reg').value.trim();
  const vatNumber = document.getElementById('vat_number').value.trim();
  const country = document.getElementById('country').value;
  const city = document.getElementById('city').value.trim();
  const address = document.getElementById('address').value.trim();
  const zip = document.getElementById('zip').value.trim();
  const agreePrivacy = document.getElementById('agree_privacy').checked;

  // Validations
  if (!firstName || !lastName) {
    showError(errorDiv, 'Name and Surname are required.');
    return false;
  }

  if (!email) {
    showError(errorDiv, 'Email is required.');
    return false;
  }

  if (password.length < 6) {
    showError(errorDiv, 'Password must be at least 6 characters long.');
    return false;
  }

  if (password !== passwordConfirm) {
    showError(errorDiv, 'Passwords do not match.');
    return false;
  }

  if (!isPrivate && !company) {
    showError(errorDiv, 'Company name is required unless you are a private person.');
    return false;
  }

  if (!country || !city || !address || !zip) {
    showError(errorDiv, 'Country, City, Address and Zip are required.');
    return false;
  }

  if (!agreePrivacy) {
    showError(errorDiv, 'You must agree to the Privacy Policy.');
    return false;
  }

  // Disable button
  btn.disabled = true;
  btn.textContent = 'REGISTERING...';

  try {
    // Sign up with Supabase Auth
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          is_private: isPrivate,
          company: isPrivate ? null : company,
          company_reg: isPrivate ? null : companyReg,
          vat_number: isPrivate ? null : vatNumber,
          country: country,
          city: city,
          address: address,
          zip: zip
        }
      }
    });

    if (error) {
      showError(errorDiv, error.message);
      btn.disabled = false;
      btn.textContent = 'REGISTER';
      return false;
    }

    // Success - redirect to login or dashboard
    if (data.user && data.session) {
      window.location.href = 'dashboard.html';
    } else {
      // Email confirmation required
      alert('Registration successful! Please check your email to confirm your account.');
      window.location.href = 'login.html';
    }

  } catch (err) {
    showError(errorDiv, 'An unexpected error occurred. Please try again.');
    btn.disabled = false;
    btn.textContent = 'REGISTER';
  }

  return false;
}

// ---------- Login ----------
async function handleLogin(e) {
  e.preventDefault();

  const errorDiv = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');
  errorDiv.classList.add('form-error-hidden');

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showError(errorDiv, 'Email and password are required.');
    return false;
  }

  btn.disabled = true;
  btn.textContent = 'SIGNING IN...';

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      showError(errorDiv, error.message);
      btn.disabled = false;
      btn.textContent = 'SIGN IN';
      return false;
    }

    window.location.href = 'dashboard.html';

  } catch (err) {
    showError(errorDiv, 'An unexpected error occurred. Please try again.');
    btn.disabled = false;
    btn.textContent = 'SIGN IN';
  }

  return false;
}

// ---------- Helpers ----------
function showError(div, message) {
  div.textContent = message;
  div.classList.remove('form-error-hidden');
}
