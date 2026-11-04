// Home page behaviour. Everything here is an enhancement: with no script the
// frames open their full-size images and the form still opens an email.
document.documentElement.classList.add("js");

// Time-aware greeting, by the visitor's own clock
function setGreeting() {
	const greeting = document.getElementById("greeting");
	if (!greeting) return;
	const hour = new Date().getHours();
	let text = "Good evening";
	if (hour >= 5 && hour < 12) text = "Good morning";
	else if (hour >= 12 && hour < 17) text = "Good afternoon";
	greeting.textContent = text + ". ";
}

// Current time in India, for the footer
function setIndiaTime() {
	const el = document.getElementById("india-time");
	if (!el) return;
	const format = new Intl.DateTimeFormat("en-IN", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
		timeZone: "Asia/Kolkata",
	});
	const tick = () => {
		el.textContent = format.format(new Date());
	};
	tick();
	setInterval(tick, 30000);
}

// The loupe: one frame of the contact sheet, seen large
function initLoupe() {
	const list = document.getElementById("frames");
	const link = document.getElementById("loupe-link");
	const front = document.getElementById("loupe-a");
	const back = document.getElementById("loupe-b");
	const run = document.getElementById("loupe-run");
	const kind = document.getElementById("loupe-kind");
	const text = document.getElementById("loupe-text");
	if (!list || !link || !front || !back) return;

	let shown = front;
	let hidden = back;
	let request = 0;
	const frames = [...list.querySelectorAll(".frame")];
	const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

	function show(frame) {
		if (frame.getAttribute("aria-current") === "true") return;
		frames.forEach((item) => item.removeAttribute("aria-current"));
		frame.setAttribute("aria-current", "true");

		run.textContent = frame.dataset.run;
		kind.textContent = frame.dataset.kind;
		text.textContent = frame.dataset.caption;
		link.href = frame.getAttribute("href");

		const ticket = ++request;
		const next = hidden;
		next.src = frame.getAttribute("href");
		next.alt = frame.querySelector("img").alt;
		const swap = () => {
			if (ticket !== request) return;
			next.hidden = false;
			next.style.opacity = "0";
			next.style.zIndex = "2";
			shown.style.zIndex = "1";
			requestAnimationFrame(() => {
				next.style.opacity = "1";
			});
			const old = shown;
			shown = next;
			hidden = old;
		};
		(next.decode ? next.decode() : Promise.resolve()).then(swap, swap);
	}

	function point(frame) {
		const name = frame.dataset.run;
		list.classList.add("is-pointing");
		frames.forEach((item) => {
			item.closest("li").classList.toggle("in-run", item.dataset.run === name);
		});
	}

	list.addEventListener("click", (event) => {
		const frame = event.target.closest(".frame");
		if (!frame || event.metaKey || event.ctrlKey || event.shiftKey) return;
		event.preventDefault();
		show(frame);
	});

	list.addEventListener("focusin", (event) => {
		const frame = event.target.closest(".frame");
		if (frame && frame.matches(":focus-visible")) show(frame);
	});

	if (canHover) {
		list.addEventListener("mouseover", (event) => {
			const frame = event.target.closest(".frame");
			if (!frame) return;
			show(frame);
			point(frame);
		});
		list.addEventListener("mouseleave", () => {
			list.classList.remove("is-pointing");
		});
	}
}

// Entrances for each section as it arrives
function initReveals() {
	const items = document.querySelectorAll(".rise");
	if (!("IntersectionObserver" in window)) {
		items.forEach((item) => item.classList.add("in"));
		return;
	}
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				entry.target.classList.add("in");
				observer.unobserve(entry.target);
			});
		},
		{ rootMargin: "0px 0px -8% 0px" },
	);
	items.forEach((item) => observer.observe(item));
}

// Build the email by hand so spaces survive every mail app
function initContactForm() {
	const form = document.getElementById("contact-form");
	if (!form) return;
	form.addEventListener("submit", (event) => {
		event.preventDefault();
		const data = new FormData(form);
		const subject = data.get("subject").trim() || "A new project";
		const body = data.get("body").trim();
		const query = "subject=" + encodeURIComponent(subject) + (body ? "&body=" + encodeURIComponent(body) : "");
		window.location.href = form.getAttribute("action") + "?" + query;
	});
}

setGreeting();
setIndiaTime();
initLoupe();
initReveals();
initContactForm();

const currentYear = document.getElementById("current-year");
if (currentYear) currentYear.textContent = new Date().getFullYear();
