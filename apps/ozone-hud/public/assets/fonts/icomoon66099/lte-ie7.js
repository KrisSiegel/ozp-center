/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-layout' : '&#xe000;',
			'icon-bag' : '&#xe001;',
			'icon-comments' : '&#xe002;',
			'icon-warning' : '&#xe003;',
			'icon-exclamation' : '&#xe004;',
			'icon-chat-3' : '&#xe006;',
			'icon-logout' : '&#xe007;',
			'icon-cog' : '&#xe008;',
			'icon-info' : '&#xe009;',
			'icon-owf-logo' : '&#xe00a;',
			'icon-arrow-down' : '&#xe00b;',
			'icon-arrow-up' : '&#xe00c;',
			'icon-arrow-down-2' : '&#xe00d;',
			'icon-arrow-up-2' : '&#xe00e;',
			'icon-arrow-down-3' : '&#xe00f;',
			'icon-arrow-up-3' : '&#xe010;',
			'icon-close' : '&#xe011;',
			'icon-cross' : '&#xe012;',
			'icon-cross-2' : '&#xe013;',
			'icon-cross-3' : '&#xe014;',
			'icon-close-2' : '&#xe015;',
			'icon-cancel' : '&#xe016;',
			'icon-close-3' : '&#xe017;',
			'icon-bookmark' : '&#xe018;',
			'icon-export' : '&#xe019;',
			'icon-flag' : '&#xe01a;',
			'icon-star' : '&#xe01b;',
			'icon-arrow-left' : '&#xe01c;',
			'icon-arrow-right' : '&#xe01d;',
			'icon-arrow-left-2' : '&#xe01e;',
			'icon-arrow-down-4' : '&#xe01f;',
			'icon-arrow-up-4' : '&#xe020;',
			'icon-arrow-right-2' : '&#xe021;',
			'icon-edit' : '&#xe022;',
			'icon-trash' : '&#xe023;',
			'icon-pin' : '&#xe024;',
			'icon-chat' : '&#xe005;',
			'icon-close-4' : '&#xe025;',
			'icon-minus' : '&#xe026;',
			'icon-plus' : '&#xe027;',
			'icon-cancel-2' : '&#xe028;',
			'icon-browser' : '&#xe029;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};