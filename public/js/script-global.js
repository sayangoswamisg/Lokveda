/* js/script-global.js [SCRIPT GLOBAL MODULE]: Sets global cross UI-UX like dark-mode button & parallax background effects */

const body = document.body;

// Append global dark mode btn to nav bar
{
    // Select btn
    const btn = document.getElementById('dark-mode');

    // Default mode selection (Dark/Light)
    {
        // Init: mode, msg
        const mode = localStorage.getItem('mode');
        let msg = 'Toggle Dark Mode?';

        // Mode selection
        if (mode === 'dark')
            body.classList.add('dark-mode');
        else if (mode === 'light') {
            body.classList.remove('dark-mode');
            msg = 'Toggle Light Mode?'
        }
        else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            localStorage.setItem('mode', 'dark');
            body.classList.add('dark-mode');
        }

        // Btn: title, alt, ariaLabel
        btn.title = msg; btn.alt = msg;
        btn.ariaLabel = msg;
    }

    // Dark mode toggle
    document.getElementById('dark-mode').addEventListener("click", () => {
        // TOGGLE:
        body.classList.toggle('dark-mode'); // Class

        // Message
        const msg = (() => {
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('mode', 'dark');
                return 'Toggle Dark Mode?';
            } else {
                localStorage.setItem('mode', 'light');
                return 'Toggle Light Mode?';
            }
        })();

        // Btn: title, alt, ariaLabel
        btn.title = msg; btn.alt = msg;
        btn.ariaLabel = msg;

        // TRANSITION
        body.style.transition = 'background-color 0.3s, color 0.3s';
        setTimeout(() => body.style.transition = 'none', 300);
    });
}

// Parallax effect on body background
document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100,
        y = (e.clientY / window.innerHeight) * 100;
    body.style.backgroundPosition = `${x}% ${y}%`;
});