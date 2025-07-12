// ✅ Supabase connection
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://ndzrnskgaoltomqttdpz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kenJuc2tnYW9sdG9tcXR0ZHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjU0MDksImV4cCI6MjA2NzkwMTQwOX0.Xx1AsQXSfi1nW0gfrehufvrFN7KwveI1bJ2y84p_LQM'
const supabase = createClient(supabaseUrl, supabaseKey)

// ✅ Sections
const loginSection = document.getElementById('login-section')
const dashboardSection = document.getElementById('dashboard-section')
const uploadSection = document.getElementById('upload-section')
const notesSection = document.getElementById('notes-section')

// ✅ Navigation
const navButtons = document.querySelectorAll('#main-nav button')
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        showSection(button.id.replace('nav-', '') + '-section')
        setActiveButton(button)
    })
})

function showSection(id) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active')
    })
    document.getElementById(id).classList.add('active')
}

function setActiveButton(activeBtn) {
    navButtons.forEach(btn => btn.classList.remove('active'))
    activeBtn.classList.add('active')
}

// ✅ Login/Register
const authForm = document.getElementById('auth-form')
const registerBtn = document.getElementById('show-register')

authForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('username').value
    const password = document.getElementById('password').value

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        alert('Login failed: ' + error.message)
    } else {
        alert('Login successful!')
        loginSection.classList.remove('active')
        dashboardSection.classList.add('active')
    }
})

registerBtn.addEventListener('click', async () => {
    const email = document.getElementById('username').value
    const password = document.getElementById('password').value

    const { error } = await supabase.auth.signUp({
        email,
        password
    })

    if (error) {
        alert('Registration failed: ' + error.message)
    } else {
        alert('Registration successful! Check your email to confirm.')
    }
})

// ✅ Logout
const logoutBtn = document.getElementById('nav-logout')
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut()
    showSection('login-section')
    setActiveButton(document.getElementById('nav-dashboard'))
    alert('Logged out')
})
