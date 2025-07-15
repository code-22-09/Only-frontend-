const supabase = supabase.createClient('https://knmpxdnjaypqgzvjtdpt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubXB4ZG5qYXlwcWd6dmp0ZHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MzY1ODAsImV4cCI6MjA2ODExMjU4MH0.nBOyp6hiRg2-3eLvucUKjXelVMtdhhhJEZKsxrA7gGs');

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
    const showRegisterBtn = document.getElementById('show-register');

    const uploadForm = document.getElementById('upload-form');
    const uploadStatus = document.getElementById('upload-status');
    const filesContainer = document.getElementById('files-container');

    const saveNoteBtn = document.getElementById('save-note-btn');
    const noteEditorTextarea = document.getElementById('note-editor-textarea');
    const notesContainer = document.getElementById('saved-notes-list');

    let currentUser = null;

    function showPage(pageToShow) {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));
        pageToShow.classList.add('active');

        document.querySelectorAll('#main-nav button').forEach(btn => btn.classList.remove('active'));
        if (pageToShow === dashboardSection) navDashboardBtn.classList.add('active');
        else if (pageToShow === uploadSection) navUploadBtn.classList.add('active');
        else if (pageToShow === notesSection) navNotesBtn.classList.add('active');
    }

    function setLoggedOutState() {
        currentUser = null;
        document.body.classList.add('logged-out');
        showPage(loginSection);
        usernameInput.value = '';
        passwordInput.value = '';
    }

    function setLoggedInState() {
        document.body.classList.remove('logged-out');
        showPage(dashboardSection);
        loadFiles();
        loadNotes();
    }

    navDashboardBtn.addEventListener('click', () => {
        if (currentUser) showPage(dashboardSection);
        else alert('Please login first.');
    });
    navUploadBtn.addEventListener('click', () => {
        if (currentUser) showPage(uploadSection);
        else alert('Please login first.');
    });
    navNotesBtn.addEventListener('click', () => {
        if (currentUser) showPage(notesSection);
        else alert('Please login first.');
    });
    navLogoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        alert('Logged out successfully.');
        setLoggedOutState();
    });

    authForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = usernameInput.value;
        const password = passwordInput.value;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            alert('Invalid email or password.');
        } else {
            currentUser = data.user;
            alert('Login successful!');
            setLoggedInState();
        }
    });

    showRegisterBtn.addEventListener('click', async () => {
        const email = usernameInput.value;
        const password = passwordInput.value;

        const { error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            alert('Registration failed: ' + error.message);
        } else {
            alert('Registration successful! Check your email to confirm.');
        }
    });

    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const files = document.getElementById('file-input').files;
        if (files.length > 0) {
            for (const file of files) {
                const { error } = await supabase.storage.from('user-files').upload(`${currentUser.id}/${file.name}`, file);
                if (error) {
                    alert('Error uploading: ' + file.name);
                }
            }
            uploadStatus.textContent = `${files.length} file(s) uploaded successfully.`;
            uploadStatus.style.display = 'block';
            loadFiles();
        } else {
            alert('Please select files to upload.');
            uploadStatus.style.display = 'none';
        }
    });

    async function loadFiles() {
        if (!currentUser) return;
        const { data } = await supabase.storage.from('user-files').list(`${currentUser.id}/`);
        filesContainer.innerHTML = '';
        data?.forEach(file => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${supabase.storage.from('user-files').getPublicUrl(`${currentUser.id}/${file.name}`).data.publicUrl}" target="_blank">${file.name}</a>`;
            filesContainer.appendChild(li);
        });
    }

    saveNoteBtn.addEventListener('click', async () => {
        const noteContent = noteEditorTextarea.value.trim();
        if (!noteContent) {
            alert('Note content cannot be empty.');
            return;
        }
        await supabase.from('notes').insert({
            user_id: currentUser.id,
            title: 'Untitled',
            content: noteContent
        });
        alert('Note saved.');
        noteEditorTextarea.value = '';
        loadNotes();
    });

    async function loadNotes() {
        if (!currentUser) return;
        const { data } = await supabase.from('notes').select().eq('user_id', currentUser.id);
        notesContainer.innerHTML = '';
        data?.forEach(note => {
            const li = document.createElement('li');
            li.innerHTML = `<h4>${note.title}</h4><p>${note.content}</p>`;
            notesContainer.appendChild(li);
        });
    }

    (async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
            currentUser = data.session.user;
            setLoggedInState();
        } else {
            setLoggedOutState();
        }
    })();
});
