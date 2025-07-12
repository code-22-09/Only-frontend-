document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const uploadSection = document.getElementById('upload-section');
    const notesSection = document.getElementById('notes-section');

    const navDashboardBtn = document.getElementById('nav-dashboard');
    const navUploadBtn = document.getElementById('nav-upload');
    const navNotesBtn = document.getElementById('nav-notes');
    const navLogoutBtn = document.getElementById('nav-logout');

    const authForm = document.getElementById('auth-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const registrationMessage = document.getElementById('registration-message');
    const showRegisterBtn = document.getElementById('show-register'); // Added this button

    const uploadForm = document.getElementById('upload-form');
    const uploadStatus = document.getElementById('upload-status');

    const saveNoteBtn = document.getElementById('save-note-btn');
    const noteEditorTextarea = document.getElementById('note-editor-textarea');

    let isLoggedIn = false; // Simulate login state

    // Function to show a specific page and hide others
    function showPage(pageToShow) {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));
        pageToShow.classList.add('active');

        // Update active navigation button
        document.querySelectorAll('#main-nav button').forEach(btn => btn.classList.remove('active'));
        if (pageToShow === dashboardSection) navDashboardBtn.classList.add('active');
        else if (pageToShow === uploadSection) navUploadBtn.classList.add('active');
        else if (pageToShow === notesSection) navNotesBtn.classList.add('active');
    }

    // Handle initial state (logged out)
    function setLoggedOutState() {
        isLoggedIn = false;
        document.body.classList.add('logged-out'); // Hides nav and main content
        showPage(loginSection); // Only show login
        // Clear inputs
        usernameInput.value = '';
        passwordInput.value = '';
    }

    function setLoggedInState() {
        isLoggedIn = true;
        document.body.classList.remove('logged-out'); // Shows nav and main content
        showPage(dashboardSection); // Go to dashboard after login
    }

    // Event Listeners for Navigation
    navDashboardBtn.addEventListener('click', () => {
        if (isLoggedIn) showPage(dashboardSection);
        else alert('Please login first.');
    });
    navUploadBtn.addEventListener('click', () => {
        if (isLoggedIn) showPage(uploadSection);
        else alert('Please login first.');
    });
    navNotesBtn.addEventListener('click', () => {
        if (isLoggedIn) showPage(notesSection);
        else alert('Please login first.');
    });
    navLogoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to log out?')) {
            setLoggedOutState();
            alert('Logged out successfully.');
        }
    });

    // Handle Login/Register Form Submission
    authForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission

        const username = usernameInput.value;
        const password = passwordInput.value;

        // --- STATIC LOGIN SIMULATION ---
        if (username === 'user' && password === 'password') { // <-- THIS IS THE CHECK
            alert('Login successful!');
            setLoggedInState();
        } else {
            alert('Invalid username or password. Please try "user" and "password".'); // <-- THIS IS THE MESSAGE
        }
        // In the backend phase, this is where you'd send credentials to your server
    });

    showRegisterBtn.addEventListener('click', () => {
        registrationMessage.style.display = 'block';
        alert('Registration functionality will be implemented in the backend phase.');
    });

    // Handle File Upload Form Submission (static)
    uploadForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const files = document.getElementById('file-input').files;
        if (files.length > 0) {
            uploadStatus.textContent = `Simulating upload of ${files.length} file(s)...`;
            uploadStatus.style.display = 'block';
            alert(`Simulated upload for: ${Array.from(files).map(f => f.name).join(', ')}. Functionality for real upload will come with backend.`);
            // In the backend phase, files would be sent via FormData to your server
        } else {
            alert('Please select files to upload.');
            uploadStatus.style.display = 'none';
        }
    });

    // Handle Save Note Button (static)
    saveNoteBtn.addEventListener('click', () => {
        const noteContent = noteEditorTextarea.value.trim();
        if (noteContent) {
            alert('Note saved (simulated): ' + noteContent.substring(0, 50) + '... Full save functionality will come with backend.');
            noteEditorTextarea.value = ''; // Clear after "saving"
            // In the backend phase, this note would be sent to your server
        } else {
            alert('Note content cannot be empty.');
        }
    });

    // Initialize state
    setLoggedOutState();
});
