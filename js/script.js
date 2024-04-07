document.querySelector('.nav-burger').addEventListener('click', transformBurger);
document.addEventListener("DOMContentLoaded", startGame);

function transformBurger() {
    this.classList.toggle('active')
}

function startGame() {
    const form = document.querySelector('form');

    form.addEventListener('submit', function (event) {
        const value = document.getElementById('sex').value;

        if (value.trim() && value === 'Game Start') {
            localStorage.setItem('allow', '1');
            window.location.href = "extra/index.html";
            event.preventDefault();
        }
    });
}