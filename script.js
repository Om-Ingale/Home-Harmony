const slides = document.querySelector('.slides');
const dots = document.querySelectorAll('.dot');
let currentIndex = 0;
const totalSlides = dots.length;
let autoSlide = setInterval(nextSlide, 3000); 

function showSlide(index) {
    if (index >= totalSlides) currentIndex = 0;
    else if (index < 0) currentIndex = totalSlides - 1;
    else currentIndex = index;

    slides.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentIndex].classList.add('active');
}

// Next & Prev
function nextSlide() { showSlide(currentIndex + 1); }
function prevSlide() { showSlide(currentIndex - 1); }

document.querySelector('.next').addEventListener('click', () => {
    nextSlide();
    resetAutoSlide();
});

document.querySelector('.prev').addEventListener('click', () => {
    prevSlide();
    resetAutoSlide();
});

// Dots click
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        showSlide(index);
        resetAutoSlide();
    });
});

// Reset auto-slide on manual interaction
function resetAutoSlide() {
    clearInterval(autoSlide);
    autoSlide = setInterval(nextSlide, 3000);
}
