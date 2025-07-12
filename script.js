// === Supabase Setup ===
const supabaseUrl = 'https://comrdzyxfqhfwyzcfcsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvbXJkenl4ZnFoZnd5emNmY3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjg4NDAsImV4cCI6MjA2NzkwNDg0MH0.iLt5gBwr5P6xRbJFtC5GpgXrWJv-_DO6ECFb-muMT8g';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

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

    const saveNoteBtn = document.getElementById('save-note-btn');
    const noteEditorTextarea = document.getElementById('note-editor-textarea');
    const savedNotesList = document.getElementById('saved-notes-list');

    // ========== State Management ==========
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
        document.body.classList.add('logged-out');
        showPage(loginSection);
        usernameInput.value = '';
        passwordInput.value = '';
    }

    async function setLoggedInState() {
        document.body.classList.remove('logged-out');
        showPage(dashboardSection);
        await loadNotes();
    }

    // ========== Authentication ==========
    authForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = usernameInput.value;
        const password = passwordInput.value;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            alert('Login failed: ' + error.message);
        } else {
            alert('Login successful!');
            setLoggedInState();
        }
    });

    showRegisterBtn.addEventListener('click', async () => {
        const email = usernameInput.value;
        const password = passwordInput.value;

        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            alert('Registration failed: ' + error.message);
        } else {
            alert('Registration successful! You can now log in.');
        }
    });

    navLogoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        alert('Logged out successfully.');
        setLoggedOutState();
    });

    // ========== Upload Files ==========
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const files = document.getElementById('file-input').files;
        if (files.length === 0) {
            alert('Please select files to upload.');
            return;
        }

        for (const file of files) {
            const { data, error } = await supabase.storage.from('vault-files').upload(`public/${file.name}`, file, {
                upsert: true
            });

            if (error) {
                alert(`Failed to upload ${file.name}: ${error.message}`);
            } else {
                alert(`${file.name} uploaded successfully.`);
            }
        }
    });

    // ========== Notes ==========
    saveNoteBtn.addEventListener('click', async () => {
        const content = noteEditorTextarea.value.trim();
        if (!content) {
            alert('Note content cannot be empty.');
            return;
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
            alert('User not authenticated.');
            return;
        }

        const userId = sessionData.session.user.id;

        const { error } = await supabase.from('notes').insert([
            {
                user_id: userId,
                content: content,
            },
        ]);

        if (error) {
            alert('Failed to save note: ' + error.message);
        } else {
            alert('Note saved.');
            noteEditorTextarea.value = '';
            await loadNotes();
        }
    });

    async function loadNotes() {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
            alert('User not authenticated.');
            return;
        }

        const userId = sessionData.session.user.id;

        const { data: notes, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        savedNotesList.innerHTML = '';

        if (notes && notes.length > 0) {
            notes.forEach(note => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <h4>Note</h4>
                    <p>${note.content}</p>
                    <button class="delete-note-btn" data-id="${note.id}">Delete</button>
                `;
                savedNotesList.appendChild(li);
            });
        } else {
            savedNotesList.innerHTML = '<li>No notes yet.</li>';
        }

        document.querySelectorAll('.delete-note-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const id = button.getAttribute('data-id');
                await supabase.from('notes').delete().eq('id', id);
                await loadNotes();
            });
        });
    }

    // ========== Navigation ==========
    navDashboardBtn.addEventListener('click', () => showPage(dashboardSection));
    navUploadBtn.addEventListener('click', () => showPage(uploadSection));
    navNotesBtn.addEventListener('click', () => showPage(notesSection));

    // ========== Start ==========
    supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
            setLoggedInState();
        } else {
            setLoggedOutState();
        }
    });
});
