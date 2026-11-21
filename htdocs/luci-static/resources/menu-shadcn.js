'use strict';
'require baseclass';
'require ui';

/*
 * luci-theme-shadcn — sidebar menu renderer
 *
 * Renders the LuCI menu tree into the theme's sidebar and keeps the small
 * bits of theme chrome (mobile drawer, dark mode switch) wired up.
 */

const ICONS = {
	status:
		'<circle cx="12" cy="12" r="9"/><path d="M12 12l4.5-4.5"/><path d="M12 7v1.5"/>',
	system:
		'<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/>' +
		'<circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',
	network:
		'<rect x="9" y="3" width="6" height="5" rx="1.5"/>' +
		'<rect x="3" y="16" width="6" height="5" rx="1.5"/>' +
		'<rect x="15" y="16" width="6" height="5" rx="1.5"/>' +
		'<path d="M12 8v4M6 16v-2h12v2"/>',
	services:
		'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
	vpn:
		'<path d="M12 3l7 3v6c0 4.5-3 7.4-7 9-4-1.6-7-4.5-7-9V6z"/>',
	nas:
		'<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/>' +
		'<path d="M7 7.5h.01M7 16.5h.01"/>',
	docker:
		'<rect x="3" y="10" width="4" height="4"/><rect x="8" y="10" width="4" height="4"/>' +
		'<rect x="13" y="10" width="4" height="4"/><rect x="8" y="5" width="4" height="4"/>' +
		'<path d="M3 15h14a4 4 0 0 0 4-4"/>',
	statistics:
		'<path d="M4 20V11M10 20V5M16 20v-6M22 20H2"/>',
	firewall:
		'<path d="M12 3l7 3v6c0 4.5-3 7.4-7 9-4-1.6-7-4.5-7-9V6z"/><path d="M9 12h6"/>',
	modem:
		'<rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 17h.01M11 17h.01"/>' +
		'<path d="M12 10V4M9 7l3-3 3 3"/>',
	logout:
		'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>' +
		'<path d="M16 17l5-5-5-5M21 12H9"/>',
	default:
		'<circle cx="12" cy="12" r="3.5"/>'
};

function iconSvg(name) {
	return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] ?? ICONS.default}</svg>`;
}

function makeIcon(name) {
	const span = E('span', { 'class': 'shadcn-ico' });
	span.innerHTML = iconSvg(name);
	return span;
}

function makeCaret() {
	const span = E('span', { 'class': 'shadcn-nav-caret' });
	span.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
	return span;
}

return baseclass.extend({
	__init__() {
		this.initChrome();

		ui.menu.load()
			.then((tree) => this.render(tree))
			.catch(() => {});
	},

	initChrome() {
		const toggle = document.querySelector('#shadcn-nav-toggle');
		const scrim = document.querySelector('#shadcn-scrim');

		const setOpen = (open) => {
			document.body.classList.toggle('shadcn-nav-open', open);

			if (toggle)
				toggle.setAttribute('aria-expanded', String(open));

			if (scrim)
				scrim.hidden = !open;
		};

		if (toggle)
			toggle.addEventListener('click', () => setOpen(!document.body.classList.contains('shadcn-nav-open')));

		if (scrim)
			scrim.addEventListener('click', () => setOpen(false));

		document.querySelector('#topmenu')?.addEventListener('click', (ev) => {
			if (ev.target.closest('a'))
				setOpen(false);
		});

		const themeToggle = document.querySelector('#shadcn-theme-toggle');

		if (themeToggle) {
			const isDark = () => document.documentElement.getAttribute('data-darkmode') === 'true';

			themeToggle.setAttribute('aria-pressed', String(isDark()));

			themeToggle.addEventListener('click', () => {
				const dark = !isDark();

				document.documentElement.setAttribute('data-darkmode', String(dark));
				themeToggle.setAttribute('aria-pressed', String(dark));

				try {
					window.localStorage.setItem('shadcn-theme', dark ? 'dark' : 'light');
				}
				catch (e) {}
			});
		}
	},

	render(tree) {
		const modes = ui.menu.getChildren(tree);
		const path = L.env.dispatchpath ?? [];
		const mode = modes.filter((m) => m.name === path[0])[0] ?? modes[0];

		if (!mode)
			return;

		this.renderModes(modes, mode);
		this.renderGroups(mode, path);
		this.renderTabMenu(tree);

		const title = document.querySelector('#shadcn-page-title');

		if (title && !title.textContent && L.env.nodespec?.title)
			title.textContent = _(L.env.nodespec.title);
	},

	renderModes(modes, mode) {
		const ul = document.querySelector('#modemenu');

		if (!ul || modes.length <= 1)
			return;

		modes.forEach((m) => {
			ul.appendChild(E('li', { 'class': (m === mode) ? 'active' : null }, [
				E('a', { 'href': L.url(m.name) }, [ _(m.title) ])
			]));
		});

		ul.style.display = '';
	},

	renderGroups(mode, path) {
		const nav = document.querySelector('#topmenu');

		if (!nav)
			return;

		const groups = ui.menu.getChildren(mode);
		const activeGroup = groups.filter((g) => g.name === path[1] && g.name !== 'logout')[0];
		const logout = groups.filter((g) => g.name === 'logout')[0];

		groups.forEach((group) => {
			if (group === logout)
				return;

			const children = ui.menu.getChildren(group);
			const isActive = (group === activeGroup);

			if (children.length === 0) {
				nav.appendChild(E('a', {
					'class': `shadcn-nav-link${isActive ? ' is-active' : ''}`,
					'href': L.url(mode.name, group.name),
					'aria-current': isActive ? 'page' : null
				}, [ makeIcon(group.name), E('span', { 'class': 'shadcn-nav-label' }, [ _(group.title) ]) ]));

				if (isActive)
					this.updateTitle(group, path, []);

				return;
			}

			const open = isActive;
			const items = E('ul', { 'class': 'shadcn-nav-items' });

			children.forEach((child) => {
				const itemActive = isActive && path[2] === child.name;

				items.appendChild(E('li', { 'class': itemActive ? 'shadcn-active' : null }, [
					E('a', {
						'href': L.url(mode.name, group.name, child.name),
						'aria-current': itemActive ? 'page' : null
					}, [ _(child.title) ])
				]));
			});

			const head = E('button', {
				'type': 'button',
				'class': 'shadcn-nav-group-head',
				'aria-expanded': open ? 'true' : 'false',
				'click': (ev) => {
					const node = ev.currentTarget.parentNode;
					const nowOpen = !node.hasAttribute('data-open');

					if (nowOpen)
						node.setAttribute('data-open', '');
					else
						node.removeAttribute('data-open');

					ev.currentTarget.setAttribute('aria-expanded', String(nowOpen));
				}
			}, [
				makeIcon(group.name),
				E('span', { 'class': 'shadcn-nav-label' }, [ _(group.title) ]),
				makeCaret()
			]);

			nav.appendChild(E('div', {
				'class': `shadcn-nav-group${isActive ? ' is-active' : ''}`,
				'data-open': open ? '' : null
			}, [ head, items ]));

			if (isActive)
				this.updateTitle(group, path, children);
		});

		if (!activeGroup) {
			const first = groups.filter((g) => g.name !== 'logout')[0];

			if (first && !path[2])
				this.updateTitle(first, path, []);
		}

		if (logout) {
			const wrap = E('div', { 'class': 'shadcn-nav-logout' });

			wrap.appendChild(E('a', {
				'class': 'shadcn-nav-link',
				'href': L.url(mode.name, logout.name)
			}, [ makeIcon('logout'), E('span', { 'class': 'shadcn-nav-label' }, [ _(logout.title) ]) ]));

			nav.appendChild(wrap);
		}
	},

	updateTitle(group, path, children) {
		const box = document.querySelector('#shadcn-page-title');

		if (!box)
			return;

		const active = children.filter((c) => c.name === path[2])[0];

		box.textContent = '';

		if (active) {
			box.appendChild(E('span', { 'class': 'shadcn-crumb' }, [ _(group.title) ]));
			box.appendChild(E('span', { 'class': 'shadcn-sep' }, [ '/' ]));
			box.appendChild(E('span', {}, [ _(active.title) ]));
		}
		else {
			box.appendChild(E('span', {}, [ _(group.title) ]));
		}
	},

	renderTabMenu(tree) {
		const container = document.querySelector('#tabmenu');

		if (!container || (L.env.dispatchpath ?? []).length < 3)
			return;

		let node = tree;
		let url = '';

		for (let i = 0; i < 3 && node; i++) {
			node = node.children[L.env.dispatchpath[i]];
			url = `${url}${url ? '/' : ''}${L.env.dispatchpath[i]}`;
		}

		if (!node)
			return;

		this.renderTabs(node, url, 0);
	},

	renderTabs(tree, url, level) {
		const container = document.querySelector('#tabmenu');
		const ul = E('ul', { 'class': 'tabs' });
		const children = ui.menu.getChildren(tree);
		let activeNode = null;

		children.forEach((child) => {
			const isActive = (L.env.dispatchpath[3 + (level || 0)] === child.name);

			ul.appendChild(E('li', { 'class': isActive ? 'active' : null }, [
				E('a', {
					'href': L.url(url, child.name),
					'aria-current': isActive ? 'page' : null
				}, [ _(child.title) ])
			]));

			if (isActive)
				activeNode = child;
		});

		if (ul.children.length === 0)
			return;

		container.appendChild(ul);
		container.style.display = '';

		if (activeNode)
			this.renderTabs(activeNode, `${url}/${activeNode.name}`, (level || 0) + 1);
	}
});
