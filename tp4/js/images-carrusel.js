const cards = document.querySelectorAll(".card");
const leftArrow = document.querySelector(".nav-arrow.left");
const rightArrow = document.querySelector(".nav-arrow.right");
let currentIndex = 0;
let isAnimating = false;

function updateCarousel(newIndex) {
	if (isAnimating) return;
	isAnimating = true;

	currentIndex = (newIndex + cards.length) % cards.length;

	cards.forEach((card, i) => {
		const offset = (i - currentIndex + cards.length) % cards.length;

		card.classList.remove(
			"center",
			"left-1",
			"left-2",
			"right-1",
			"right-2",
			"hidden"
		);

		if (offset === 0) {
			card.classList.add("center");
		} else if (offset === 1) {
			card.classList.add("right-1");
		} else if (offset === 2) {
			card.classList.add("right-2");
		} else if (offset === cards.length - 1) {
			card.classList.add("left-1");
		} else if (offset === cards.length - 2) {
			card.classList.add("left-2");
		} else {
			card.classList.add("hidden");
		}
	});
	setTimeout(() => {
		isAnimating = false;
	}, 800);
}

leftArrow.addEventListener("click", () => {
	updateCarousel(currentIndex - 1);
});

rightArrow.addEventListener("click", () => {
	updateCarousel(currentIndex + 1);
});

cards.forEach((card, i) => {
	card.addEventListener("click", () => {
		updateCarousel(i);
	});
});

updateCarousel(0);

document.querySelector('.btn-heart').addEventListener('click', function() {
	this.classList.toggle('active');
});

document.addEventListener('DOMContentLoaded', function() {
    const btnShare = document.querySelector('.btn-share');
    const shareInfo = document.querySelector('.share-info');

    btnShare.addEventListener('click', function(e) {
        e.stopPropagation(); // Evita que el click se propague
        shareInfo.classList.toggle('active');
    });

    // Opcional: Oculta share-info si haces click fuera
    document.addEventListener('click', function(e) {
        if (!shareInfo.contains(e.target) && !btnShare.contains(e.target)) {
            shareInfo.classList.remove('active');
        }
    });
});